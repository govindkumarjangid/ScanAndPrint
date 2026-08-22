import { shopRepository } from '../repositories/shop.repository.js'
import { deviceRepository } from '../repositories/device.repository.js'

/**
 * Socket.IO Handshake Middleware for Hardware Device-Binding
 * Verifies that the connecting Electron desktop agent has a valid, APPROVED hardware fingerprint.
 * Rejects unauthorized or pending devices before any socket events or print jobs can be processed.
 * 
 * @param {import('socket.io').Server} io
 */
export const createSocketDeviceBindingMiddleware = (io) => {
  return async (socket, next) => {
    try {
      const auth = socket.handshake?.auth || {}
      const agentType = auth.agentType

      // Non-agent clients (Owner dashboard, Admin dashboard, Customer Kiosk) pass through
      if (agentType !== 'DESKTOP_WIN_AGENT') {
        return next()
      }

      const shopCode = String(auth.shopId || '').trim().toUpperCase()
      const secretKey = String(auth.secretKey || auth.secretApiKey || '').trim()
      const fingerprint = String(auth.deviceFingerprint || '').trim()
      const meta = auth.deviceMeta || {}

      if (!shopCode || !secretKey) {
        console.warn(`🔒 [DeviceBinding] Rejected agent connection: Missing credentials (Shop: ${shopCode || 'None'})`)
        return next(new Error('AUTH_CREDENTIALS_REQUIRED'))
      }

      // 1. Verify Shop Existence and Credentials
      const shop = await shopRepository.findByCodeAndSecret(shopCode, secretKey)
      if (!shop) {
        console.warn(`🔒 [DeviceBinding] Rejected agent connection: Invalid credentials for Shop (${shopCode})`)
        return next(new Error('INVALID_SHOP_CREDENTIALS'))
      }

      if (shop.isSuspended) {
        console.warn(`🔒 [DeviceBinding] Rejected agent connection: Shop (${shopCode}) is suspended`)
        return next(new Error('SHOP_ACCOUNT_SUSPENDED'))
      }

      // Check Demo / Subscription Expiry
      const now = Date.now()
      if (shop.isDemoAccount) {
        const isDemoExpired = shop.demoExpiresAt ? new Date(shop.demoExpiresAt).getTime() <= now : true
        if (isDemoExpired) {
          return next(new Error('DEMO_EXPIRED'))
        }
      } else if (shop.subscriptionExpiresAt && new Date(shop.subscriptionExpiresAt).getTime() <= now) {
        return next(new Error('SUBSCRIPTION_EXPIRED'))
      }

      // 2. Verify Hardware Device Fingerprint
      if (!fingerprint || fingerprint.length < 16) {
        console.warn(`🔒 [DeviceBinding] Rejected agent connection: Invalid or missing hardware fingerprint (Shop: ${shopCode})`)
        return next(new Error('DEVICE_FINGERPRINT_MISSING'))
      }

      // Check if this physical device is already registered for this shop
      let device = await deviceRepository.findByShopAndFingerprint(shop._id, fingerprint)

      // Case A: First time this hardware fingerprint connects for this shop
      if (!device) {
        const physicalIp = meta.ipAddress || meta.localIp || socket.handshake?.address || socket.conn?.remoteAddress || ''
        device = await deviceRepository.upsertDevice({
          shopId: shop._id,
          fingerprint,
          meta: {
            ...meta,
            ipAddress: physicalIp,
            localIp: physicalIp,
            defaultGateway: meta.defaultGateway || '',
          },
          status: 'PENDING_APPROVAL',
        })

        console.log(`🔒 [DeviceBinding] New hardware device registered for Shop (${shopCode}) -> PENDING_APPROVAL [${fingerprint.slice(0, 12)}...]`)

        // Notify logged-in Shop Owner in real time on their Dashboard
        const shopRoom = `shop:${shopCode}`
        io.to(shopRoom).emit('NEW_DEVICE_PENDING_APPROVAL', {
          deviceId: device._id,
          shopCode,
          hostname: meta.hostname || 'Unknown PC',
          platform: meta.platform || 'Windows',
          cpuModel: meta.cpuModel || 'Unknown CPU',
          firstSeenAt: device.firstSeenAt,
          fingerprintPreview: `${fingerprint.slice(0, 8)}...${fingerprint.slice(-8)}`,
        })

        // Also notify Super Admin Room
        io.to('admin:room').emit('ADMIN_NEW_DEVICE_PENDING', {
          deviceId: device._id,
          shopCode,
          shopName: shop.shopName,
          hostname: meta.hostname,
        })

        return next(new Error('DEVICE_NOT_APPROVED'))
      }

      // Always sync live telemetry updates (IP, Gateway, CPU, etc.)
      if (device && meta) {
        await deviceRepository.syncDeviceMeta(device._id, meta)
      }

      // Case B: Device found but is still pending approval by Super Admin
      if (device.status === 'PENDING_APPROVAL') {
        console.warn(`🔒 [DeviceBinding] Connection rejected: Device pending Super Admin approval (Shop: ${shopCode}, Host: ${meta.hostname || 'PC'})`)
        return next(new Error('DEVICE_NOT_APPROVED'))
      }

      // Case C: Device has been explicitly rejected
      if (device.status === 'REJECTED') {
        console.warn(`🔒 [DeviceBinding] Connection rejected: Device has been rejected (Shop: ${shopCode})`)
        return next(new Error('DEVICE_MISMATCH'))
      }

      // Case D: Device has been revoked (e.g. replaced by another PC)
      if (device.status === 'REVOKED') {
        console.warn(`🔒 [DeviceBinding] Connection rejected: Device binding has been revoked (Shop: ${shopCode})`)
        return next(new Error('DEVICE_REVOKED'))
      }

      // Case E: Device is APPROVED
      if (device.status === 'APPROVED') {
        const detectedIp = meta.ipAddress || meta.localIp || socket.handshake?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || socket.handshake?.address || ''
        await deviceRepository.updateLastConnected(device._id, detectedIp)

        // Attach verified metadata to socket instance
        socket.shop = shop
        socket.shopCode = shopCode
        socket.deviceId = String(device._id)
        socket.deviceFingerprint = fingerprint
        socket.isApprovedAgent = true

        console.log(`🔓 [DeviceBinding] Device APPROVED and Authorized: Shop ${shopCode} on ${meta.hostname || 'PC'} (${fingerprint.slice(0, 12)}...)`)
        return next()
      }

      // Fallback
      return next(new Error('DEVICE_MISMATCH'))
    } catch (err) {
      console.error('❌ [DeviceBinding Middleware Error]:', err)
      return next(new Error('DEVICE_BINDING_SERVER_ERROR'))
    }
  }
}
