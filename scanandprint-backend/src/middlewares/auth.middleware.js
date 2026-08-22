import { verifyToken } from '../utils/jwt.util.js'
import { sendError } from '../utils/apiResponse.js'
import { shopRepository } from '../repositories/shop.repository.js'

// authenticate shop middleware
export const authenticateShop = async (req, res, next) => {
  try {
    let token = null
    if (req.cookies && req.cookies.accessToken) token = req.cookies.accessToken

    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer '))
      token = req.headers.authorization.split(' ')[1]

    if (!token)
      return sendError(res, 401, 'Unauthorized: Access token is missing or invalid')

    const decoded = verifyToken(token)

    if (!decoded || !decoded.shopId)
      return sendError(res, 401, 'Unauthorized: Invalid token payload')

    const shop = await shopRepository.findById(decoded.shopId)

    if (!shop)
      return sendError(res, 401, 'Unauthorized: Shop account not found')

    if (shop.isSuspended) {
      return sendError(res, 403, 'Account Suspended: Your shop has been suspended by Administrator. Please contact support.')
    }

    // Check if subscription or demo period has expired
    const now = new Date()
    let isExpired = false

    if (shop.isDemoAccount) {
      if (!shop.demoExpiresAt || now > new Date(shop.demoExpiresAt)) {
        isExpired = true
      }
    } else if (shop.subscriptionExpiresAt) {
      if (now > new Date(shop.subscriptionExpiresAt)) {
        isExpired = true
      }
    } else if (shop.subscriptionStatus === 'PENDING_PAYMENT' || !shop.isSubscriptionActive) {
      isExpired = true
    }

    if (isExpired && shop.subscriptionStatus !== 'EXPIRED') {
      shop.subscriptionStatus = 'EXPIRED'
      shop.isSubscriptionActive = false
      await shop.save()
    }

    req.shop = shop.toObject ? shop.toObject() : shop
    req.isSubscriptionActive = !isExpired

    // Allowed endpoints even when expired (for renewing and viewing status)
    const openExpiredPaths = [
      '/me',
      '/profile',
      '/logout',
      '/create-subscription-order',
      '/verify-subscription-payment',
      '/settings',
      '/refresh-token'
    ]

    const isPathAllowed = openExpiredPaths.some(p => req.path.endsWith(p) || req.originalUrl.includes(p))

    if (isExpired && !isPathAllowed) {
      return res.status(403).json({
        success: false,
        isSubscriptionExpired: true,
        isSubscriptionActive: false,
        message: 'Your subscription plan has expired. Please renew your subscription to continue using Scan&Print.',
      })
    }

    next()
  } catch (error) {
    return sendError(res, 401, 'Unauthorized: Token expired or invalid', error.message)
  }
}

// authenticate agent middleware
export const authenticateAgent = async (req, res, next) => {
  try {
    const secretApiKey = req.headers['x-secret-api-key'] || req.query.secretApiKey
    const shopCode = req.headers['x-shop-code'] || req.query.shopCode

    if (!secretApiKey || !shopCode)
      return sendError(res, 401, 'Unauthorized: Agent API Key and Shop Code required')

    const shop = await shopRepository.findByCodeAndSecret(shopCode, secretApiKey, { lean: true })

    if (!shop)
      return sendError(res, 401, 'Unauthorized: Invalid Agent API Key or Shop Code')

    if (shop.isSuspended) {
      return sendError(res, 403, 'Account Suspended: This shop has been suspended by Administrator.')
    }

    const now = Date.now()
    if (shop.isDemoAccount) {
      const isDemoExpired = shop.demoExpiresAt ? new Date(shop.demoExpiresAt).getTime() <= now : true
      if (isDemoExpired) {
        return sendError(res, 403, 'Demo Expired: Demo trial access has expired. Please upgrade to a paid plan.')
      }
    } else if (shop.subscriptionExpiresAt && new Date(shop.subscriptionExpiresAt).getTime() <= now) {
      return sendError(res, 403, 'Subscription Expired: Subscription access has expired. Please renew.')
    }

    req.shop = shop
    next()
  } catch (error) {
    return sendError(res, 500, 'Agent Authentication Error', error.message)
  }
}

// authenticate admin middleware
export const authenticateAdmin = async (req, res, next) => {
  try {
    let token = null

    if (req.cookies && req.cookies.adminAccessToken)
      token = req.cookies.adminAccessToken
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer '))
      token = req.headers.authorization.split(' ')[1]

    if (!token)
      return sendError(res, 401, 'Unauthorized: Admin access token is missing or invalid')

    const decoded = verifyToken(token)

    if (!decoded || !decoded.adminId)
      return sendError(res, 401, 'Unauthorized: Invalid admin token payload')

    req.adminId = decoded.adminId
    next()
  } catch (error) {
    return sendError(res, 401, 'Unauthorized: Admin token expired or invalid', error.message)
  }
}