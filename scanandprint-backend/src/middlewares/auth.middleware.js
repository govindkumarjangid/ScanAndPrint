import { verifyToken } from '../utils/jwt.util.js'
import { sendError } from '../utils/apiResponse.js'
import { shopRepository } from '../repositories/shop.repository.js'

export const authenticateShop = async (req, res, next) => {
  try {
    let token = null
    
    // Check cookies first
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken
    } 
    // Fallback to Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return sendError(res, 401, 'Unauthorized: Access token is missing or invalid')
    }

    const decoded = verifyToken(token)

    if (!decoded || !decoded.shopId) {
      return sendError(res, 401, 'Unauthorized: Invalid token payload')
    }

    const shop = await shopRepository.findById(decoded.shopId, { lean: true })

    if (!shop) {
      return sendError(res, 401, 'Unauthorized: Shop account not found')
    }

    req.shop = shop
    next()
  } catch (error) {
    return sendError(res, 401, 'Unauthorized: Token expired or invalid', error.message)
  }
}

export const authenticateAgent = async (req, res, next) => {
  try {
    const secretApiKey = req.headers['x-secret-api-key'] || req.query.secretApiKey
    const shopCode = req.headers['x-shop-code'] || req.query.shopCode

    if (!secretApiKey || !shopCode) {
      return sendError(res, 401, 'Unauthorized: Agent API Key and Shop Code required')
    }

    const shop = await shopRepository.findByCodeAndSecret(shopCode, secretApiKey, { lean: true })

    if (!shop) {
      return sendError(res, 401, 'Unauthorized: Invalid Agent API Key or Shop Code')
    }

    req.shop = shop
    next()
  } catch (error) {
    return sendError(res, 500, 'Agent Authentication Error', error.message)
  }
}
