import { authService } from '../services/auth.service.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import AdminSettings from '../models/AdminSettings.model.js'

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
}

// register a new shop
export const registerShop = asyncHandler(async (req, res, next) => {
  const { accessToken, refreshToken, shop } = await authService.register(req.body)

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }) // 15 mins

  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }) // 7 days

  return sendSuccess(res, 201, 'Shop registered successfully! Welcome to QR PrintPe.', {
    token: accessToken,
    shop,
  })
})

// 2-Hour free trial demo registration
export const demoRegisterShop = asyncHandler(async (req, res, next) => {
  const { accessToken, refreshToken, shop } = await authService.demoRegister(req.body)

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 2 * 60 * 60 * 1000 }) // 2 hours
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 2 * 60 * 60 * 1000 })

  return sendSuccess(res, 201, '2-Hour Free Demo access activated successfully!', {
    token: accessToken,
    shop,
  })
})


// login a shop
export const loginShop = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body

  const { accessToken, refreshToken, shop } = await authService.login({ email, password })

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })

  return sendSuccess(res, 200, 'Login successful!', {
    token: accessToken,
    shop,
  })
})

// admin login
export const loginAdmin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const { accessToken, admin } = await authService.adminLogin({ email, password });

  res.cookie('adminToken', accessToken, { ...cookieOptions, maxAge: 2 * 60 * 60 * 1000 }); // 2 hours

  return sendSuccess(res, 200, 'Admin login successful!', {
    token: accessToken,
    admin,
  });
})

// get shop details
export const getShopProfile = asyncHandler(async (req, res, next) => {
  return sendSuccess(res, 200, 'Shop profile fetched successfully', { shop: req.shop })
})

// update shop rates
export const updateShopRates = asyncHandler(async (req, res, next) => {
  const updatedShop = await authService.updateRates(req.shop._id, req.body)
  return sendSuccess(res, 200, 'Print rates updated successfully', { shop: updatedShop })
})

// update shop printers
export const updateShopPrinters = asyncHandler(async (req, res, next) => {
  const updatedShop = await authService.updatePrinters(req.shop._id, req.body)
  return sendSuccess(res, 200, 'Printers mapped successfully', { shop: updatedShop })
})

// update shop profile
export const updateShopProfile = asyncHandler(async (req, res, next) => {
  const updatedShop = await authService.updateProfile(req.shop._id, req.body)
  return sendSuccess(res, 200, 'Profile updated successfully', { shop: updatedShop })
})

// change shop password
export const changeShopPassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return sendError(res, 400, 'Current and new password are required')
  }
  await authService.changePassword(req.shop._id, { currentPassword, newPassword })
  return sendSuccess(res, 200, 'Password updated successfully')
})

// update shop payment settings
export const updateShopPaymentSettings = asyncHandler(async (req, res, next) => {
  const updatedShop = await authService.updatePaymentSettings(req.shop._id, req.body)
  return sendSuccess(res, 200, 'Payment settings saved successfully', { shop: updatedShop })
})

// submit shop review
export const submitShopReview = asyncHandler(async (req, res, next) => {
  const updatedShop = await authService.submitReview(req.shop._id, req.body)
  return sendSuccess(res, 200, 'Review submitted successfully', { shop: updatedShop })
})

// public: get all reviews from all shops (no auth required)
export const getPublicReviews = asyncHandler(async (req, res, next) => {
  const reviews = await authService.getAllPublicReviews()
  return sendSuccess(res, 200, 'Reviews fetched successfully', { reviews })
})

// public: get system settings (pricing, demo mode)
export const getPublicSettings = asyncHandler(async (req, res, next) => {
  let settings = await AdminSettings.findOne()
  if (!settings) {
    settings = await AdminSettings.create({})
  }
  return sendSuccess(res, 200, 'Settings fetched successfully', settings)
})

// logout shop
export const logoutShop = asyncHandler(async (req, res, next) => {
  res.clearCookie('accessToken', cookieOptions)
  res.clearCookie('refreshToken', cookieOptions)
  return sendSuccess(res, 200, 'Logged out successfully')
})