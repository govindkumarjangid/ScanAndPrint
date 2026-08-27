import { shopRepository } from '../repositories/shop.repository.js';
import { deviceRepository } from '../repositories/device.repository.js';

/**
 * @param {import('socket.io').Server} io
 */
export const createSocketDeviceBindingMiddleware = (io) => {
  return async (socket, next) => {
    try {
      const auth = socket.handshake?.auth ?? {};
      if (auth.agentType !== 'DESKTOP_WIN_AGENT') return next();

      const shopCode = String(auth.shopId ?? '').trim().toUpperCase();
      const secretKey = String(auth.secretKey ?? auth.secretApiKey ?? '').trim();
      const fingerprint = String(auth.deviceFingerprint ?? '').trim();
      const meta = auth.deviceMeta ?? {};

      // Validate credentials
      if (!shopCode || !secretKey) {
        console.warn(`[DeviceBinding] Missing credentials (Shop: ${shopCode || 'None'})`);
        return next(new Error('AUTH_CREDENTIALS_REQUIRED'));
      }

      // Verify shop credentials
      const shop = await shopRepository.findByCodeAndSecret(shopCode, secretKey);
      if (!shop) {
        console.warn(`[DeviceBinding] Invalid credentials (Shop: ${shopCode})`);
        return next(new Error('INVALID_SHOP_CREDENTIALS'));
      }

      // Check account status
      if (shop.isSuspended) {
        console.warn(`[DeviceBinding] Shop suspended (Shop: ${shopCode})`);
        return next(new Error('SHOP_ACCOUNT_SUSPENDED'));
      }

      // Check subscription / demo expiry
      const now = Date.now();

      if (shop.isDemoAccount) {
        const demoExpired = !shop.demoExpiresAt || new Date(shop.demoExpiresAt).getTime() <= now;
        if (demoExpired) return next(new Error('DEMO_EXPIRED'));
      } else if (shop.subscriptionExpiresAt && new Date(shop.subscriptionExpiresAt).getTime() <= now) {
        return next(new Error('SUBSCRIPTION_EXPIRED'));
      }

      // Validate device fingerprint
      if (fingerprint.length < 16) {
        console.warn(`[DeviceBinding] Invalid device fingerprint (Shop: ${shopCode})`);
        return next(new Error('DEVICE_FINGERPRINT_MISSING'));
      }

      // Find registered device
      let device = await deviceRepository.findByShopAndFingerprint(shop._id, fingerprint);

      if (!device) {
        const physicalIp = meta.ipAddress || meta.localIp || socket.handshake?.address || socket.conn?.remoteAddress || '';
        device = await deviceRepository.upsertDevice({
          shopId: shop._id,
          fingerprint,
          meta: {
            ...meta,
            ipAddress: physicalIp,
            localIp: physicalIp,
            defaultGateway:
              meta.defaultGateway || '',
          },
          status: 'PENDING_APPROVAL',
        });

        console.log(
          `[DeviceBinding] New device registered: ` +
          `${shopCode} -> PENDING_APPROVAL ` +
          `[${fingerprint.slice(0, 12)}...]`
        );

        // Notify shop dashboard
        io.to(`shop:${shopCode}`).emit('NEW_DEVICE_PENDING_APPROVAL', {
          deviceId: device._id,
          shopCode,
          hostname: meta.hostname || 'Unknown PC',
          platform: meta.platform || 'Windows',
          cpuModel: meta.cpuModel || 'Unknown CPU',
          firstSeenAt: device.firstSeenAt,
          fingerprintPreview:
            `${fingerprint.slice(0, 8)}...` +
            `${fingerprint.slice(-8)}`,
        });

        // Notify admin dashboard
        io.to('admin:room').emit('ADMIN_NEW_DEVICE_PENDING', {
          deviceId: device._id,
          shopCode,
          shopName: shop.shopName,
          hostname: meta.hostname || 'Unknown PC',
        });

        return next(new Error('DEVICE_NOT_APPROVED'));
      }

      await deviceRepository.syncDeviceMeta(device._id, meta);

      const rejectedStatuses = {
        PENDING_APPROVAL: 'DEVICE_NOT_APPROVED',
        REJECTED: 'DEVICE_MISMATCH',
        REVOKED: 'DEVICE_REVOKED',
      };

      const rejectionError = rejectedStatuses[device.status];

      if (rejectionError) {
        console.warn(`[DeviceBinding] Device rejected: ` + `${device.status} (Shop: ${shopCode})`);
        return next(new Error(rejectionError));
      }

      if (device.status === 'APPROVED') {
        const detectedIp = meta.ipAddress || meta.localIp || socket.handshake?.headers?.[
          'x-forwarded-for']?.split(',')[0]?.trim() || socket.handshake?.address || '';

        await deviceRepository.updateLastConnected(device._id, detectedIp);

        // Attach verified data to socket
        Object.assign(socket, {
          shop,
          shopCode,
          deviceId: String(device._id),
          deviceFingerprint: fingerprint,
          isApprovedAgent: true,
        });

        console.log(
          `[DeviceBinding] Device authorized: ` +
          `${shopCode} / ${meta.hostname || 'PC'} ` +
          `(${fingerprint.slice(0, 12)}...)`
        );

        return next();
      }

      // Unknown device status
      console.warn(`[DeviceBinding] Unknown device status: ` + `${device.status} (Shop: ${shopCode})`);
      return next(new Error('DEVICE_MISMATCH'));
    } catch (error) {
      console.error('[DeviceBinding] Middleware error:', error);
      return next(new Error('DEVICE_BINDING_SERVER_ERROR'));
    }
  };
};