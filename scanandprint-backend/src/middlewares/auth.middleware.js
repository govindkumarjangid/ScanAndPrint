import { verifyToken } from '../utils/jwt.util.js'
import { sendError } from '../utils/apiResponse.js'
import { Shop } from '../models/Shop.model.js'

/**
 * JWT Authentication Middleware for Shop Owners / Dashboard Routes
 */
export const authenticateShop = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Unauthorized: Access token is missing or invalid')
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    if (!decoded || !decoded.shopId) {
      return sendError(res, 401, 'Unauthorized: Invalid token payload')
    }

    // Fast indexed query using Mongoose lean()
    const shop = await Shop.findById(decoded.shopId).lean()

    if (!shop) {
      return sendError(res, 401, 'Unauthorized: Shop account not found')
    }

    req.shop = shop
    next()
  } catch (error) {
    return sendError(res, 401, 'Unauthorized: Token expired or invalid', error.message)
  }
}

/**
 * API Key Authentication Middleware for Desktop Print Agent Requests
 */
export const authenticateAgent = async (req, res, next) => {
  try {
    const secretApiKey = req.headers['x-secret-api-key'] || req.query.secretApiKey
    const shopCode = req.headers['x-shop-code'] || req.query.shopCode

    if (!secretApiKey || !shopCode) {
      return sendError(res, 401, 'Unauthorized: Agent API Key and Shop Code required')
    }

    // Fast compound index query
    const shop = await Shop.findOne({
      shopCode: shopCode.toUpperCase(),
      secretApiKey,
    }).lean()

    if (!shop) {
      return sendError(res, 401, 'Unauthorized: Invalid Agent API Key or Shop Code')
    }

    req.shop = shop
    next()
  } catch (error) {
    return sendError(res, 500, 'Agent Authentication Error', error.message)
  }
}
