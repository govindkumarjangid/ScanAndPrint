import { verifyToken } from '../utils/jwt.util.js'
import { sendError } from '../utils/apiResponse.js'
import { shopRepository } from '../repositories/shop.repository.js'
import { getShopSession } from '../configs/redis.config.js'

// Authenticate shop middleware
export const authenticateShop = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.cookies?.shopToken || req.cookies?.shopAccessToken || req.headers.authorization?.split(' ')[1];

    if (!token)
      return sendError(res, 401, 'Unauthorized: Access token is missing or invalid');

    const decoded = verifyToken(token);

    if (!decoded?.shopId)
      return sendError(res, 401, 'Unauthorized: Invalid token payload');

    const activeSessionId = await getShopSession(decoded.shopId);

    if (!decoded.sessionId || decoded.sessionId !== activeSessionId)
      return res.status(401).json({
        success: false,
        code: 'SESSION_INVALIDATED',
        message:
          'Your session has expired or you have logged in from another device.',
      });

    const shop = await shopRepository.findById(
      decoded.shopId,
      {
        select: '-passwordHash -__v',
        lean: true,
      }
    );

    if (!shop)
      return sendError(res, 401, 'Unauthorized: Shop account not found');

    if (shop.isSuspended)
      return sendError(res, 403, 'Account Suspended: Your shop has been suspended by Administrator. Please contact support.');

    const now = Date.now();

    const isDemoExpired = shop.isDemoAccount && (!shop.demoExpiresAt || new Date(shop.demoExpiresAt).getTime() <= now);

    const isSubscriptionExpired = !shop.isDemoAccount && shop.subscriptionExpiresAt && new Date(shop.subscriptionExpiresAt).getTime() <= now;

    const isSubscriptionInactive = !shop.isDemoAccount && (shop.subscriptionStatus === 'PENDING_PAYMENT' || !shop.isSubscriptionActive);

    const isExpired = isDemoExpired || isSubscriptionExpired || isSubscriptionInactive;

    if (isExpired && shop.subscriptionStatus !== 'EXPIRED') {
      await shopRepository.updateById(
        shop._id,
        {
          subscriptionStatus: 'EXPIRED',
          isSubscriptionActive: false,
        }
      );
      shop.subscriptionStatus = 'EXPIRED';
      shop.isSubscriptionActive = false;
    }

    req.shop = shop;
    req.isSubscriptionActive = !isExpired;

    const openExpiredPaths = [
      '/me',
      '/profile',
      '/logout',
      '/create-subscription-order',
      '/verify-subscription-payment',
      '/settings',
      '/refresh-token',
    ];

    const cleanPath = (req.path || '').replace(/\/+$/, '')
    const isPathAllowed = openExpiredPaths.some((p) => cleanPath === p || cleanPath.endsWith(p));

    if (isExpired && !isPathAllowed)
      return res.status(403).json({
        success: false,
        isSubscriptionExpired: true,
        isSubscriptionActive: false,
        message:
          'Your subscription plan has expired. Please renew your subscription to continue using Scan&Print.',
      });

    next();
  } catch (error) {
    console.error('Shop authentication error:', error.message);
    return sendError(res, 401, 'Unauthorized: Token expired or invalid');
  }
};
// Authenticate agent middleware
export const authenticateAgent = async (req, res, next) => {
  try {
    const secretApiKey = req.headers['x-secret-api-key'] || req.query.secretApiKey;
    const shopCode = req.headers['x-shop-code'] || req.query.shopCode;

    if (!secretApiKey || !shopCode)
      return sendError(res, 401, 'Unauthorized: Agent API Key and Shop Code required');

    const shop = await shopRepository.findByCodeAndSecret(
      shopCode,
      secretApiKey,
      { lean: true }
    );

    if (!shop)
      return sendError(res, 401, 'Unauthorized: Invalid Agent API Key or Shop Code');

    if (shop.isSuspended)
      return sendError(res, 403, 'Account Suspended: This shop has been suspended by Administrator.');

    const now = Date.now();

    if (shop.isDemoAccount) {
      const demoExpired = !shop.demoExpiresAt || new Date(shop.demoExpiresAt).getTime() <= now;
      if (demoExpired)
        return sendError(res, 403, 'Demo Expired: Demo trial access has expired. Please upgrade to a paid plan.');
    } else if (shop.subscriptionExpiresAt && new Date(shop.subscriptionExpiresAt).getTime() <= now) {
      return sendError(res, 403, 'Subscription Expired: Subscription access has expired. Please renew.');
    }

    req.shop = shop;

    next();
  } catch (error) {
    console.error('Agent authentication error:', error.message);
    return sendError(res, 500, 'Agent Authentication Error');
  }
};

// Authenticate admin middleware
export const authenticateAdmin = (req, res, next) => {
  try {
    const token = req.cookies?.adminAccessToken || req.cookies?.adminToken || req.headers.authorization?.split(' ')[1];

    if (!token)
      return sendError(res, 401, 'Unauthorized: Admin access token is missing or invalid');

    const decoded = verifyToken(token);

    if (!decoded?.adminId)
      return sendError(res, 401, 'Unauthorized: Invalid admin token payload');

    req.adminId = decoded.adminId;

    next();
  } catch (error) {
    console.error('Admin authentication error:', error.message);
    return sendError(res, 401, 'Unauthorized: Admin token expired or invalid');
  }
};