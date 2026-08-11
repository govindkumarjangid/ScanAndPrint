import { authService } from '../services/auth.service.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
}

export const registerShop = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, shop } = await authService.register(req.body)

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }) // 15 mins
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }) // 7 days

    return sendSuccess(res, 201, 'Shop registered successfully! Welcome to QR PrintPe.', {
      token: accessToken,
      shop,
    })
  } catch (error) {
    if (error.message.includes('already exists')) {
      return sendError(res, 409, error.message)
    }
    next(error)
  }
}

export const loginShop = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const { accessToken, refreshToken, shop } = await authService.login({ email, password })

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })

    return sendSuccess(res, 200, 'Login successful!', {
      token: accessToken,
      shop,
    })
  } catch (error) {
    if (error.message.includes('Invalid email or password')) {
      return sendError(res, 401, error.message)
    }
    next(error)
  }
}

export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { accessToken, admin } = await authService.adminLogin({ email, password });

    res.cookie('adminToken', accessToken, { ...cookieOptions, maxAge: 2 * 60 * 60 * 1000 }); // 2 hours

    return sendSuccess(res, 200, 'Admin login successful!', {
      token: accessToken,
      admin,
    });
  } catch (error) {
    if (error.message.includes('Invalid admin')) {
      return sendError(res, 401, error.message);
    }
    next(error);
  }
}

export const getShopProfile = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'Shop profile fetched successfully', { shop: req.shop })
  } catch (error) {
    next(error)
  }
}

export const updateShopRates = async (req, res, next) => {
  try {
    const updatedShop = await authService.updateRates(req.shop._id, req.body)
    return sendSuccess(res, 200, 'Print rates updated successfully', { shop: updatedShop })
  } catch (error) {
    next(error)
  }
}

export const updateShopPrinters = async (req, res, next) => {
  try {
    const updatedShop = await authService.updatePrinters(req.shop._id, req.body)
    return sendSuccess(res, 200, 'Printers mapped successfully', { shop: updatedShop })
  } catch (error) {
    next(error)
  }
}

export const logoutShop = async (req, res, next) => {
  try {
    res.clearCookie('accessToken', cookieOptions)
    res.clearCookie('refreshToken', cookieOptions)
    return sendSuccess(res, 200, 'Logged out successfully')
  } catch (error) {
    next(error)
  }
}
