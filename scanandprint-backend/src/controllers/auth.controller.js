import { authService } from '../services/auth.service.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import AdminSettings from '../models/AdminSettings.model.js'
import { sendContactEmail } from '../services/email.service.js'

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
}

// 1. Initialize Shop Registration (Creates Razorpay Order or Free Trial)
export const registerInit = asyncHandler(async (req, res, next) => {
  const result = await authService.registerInit(req.body)

  if (result.isFreeTrial && result.tokens) {
    const { accessToken, refreshToken, shop } = result.tokens
    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 2 * 60 * 60 * 1000 })
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 2 * 60 * 60 * 1000 })
    return sendSuccess(res, 201, '2-Hour Free Demo access activated successfully!', {
      isFreeTrial: true,
      token: accessToken,
      shop,
    })
  }

  return sendSuccess(res, 201, 'Subscription Order created. Please complete payment to activate shop.', {
    isFreeTrial: false,
    ...result,
  })
})

// 2. Cryptographically Verify Razorpay Subscription Payment & Activate Dashboard
export const verifySubscriptionPayment = asyncHandler(async (req, res, next) => {
  const { accessToken, refreshToken, shop } = await authService.verifySubscriptionPayment(req.body)

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })

  const io = req.app.get('io')
  if (io && shop) {
    io.to(`shop:${shop.shopCode}`).emit('SUBSCRIPTION_ACTIVATED', { shop })
    io.to(`shop:${shop.shopCode}`).emit('SHOP_STATUS_UPDATED', {
      shopId: shop._id,
      shopCode: shop.shopCode,
      planType: shop.planType,
      status: 'Active',
      isSubscriptionActive: true,
      subscriptionExpiresAt: shop.subscriptionExpiresAt,
      isDemoAccount: false,
    })
    io.to('admin:room').emit('ADMIN_SHOP_UPDATED', { shopId: shop._id, shopCode: shop.shopCode })
  }

  return sendSuccess(res, 200, '🎉 Payment Verified Successfully! Your shop subscription is active.', {
    token: accessToken,
    shop,
  })
})

// 3. Create Subscription / Renewal Order for Existing / Expired Shop
export const createSubscriptionOrder = asyncHandler(async (req, res, next) => {
  const shopId = req.shop?._id || req.body?.shopId
  const { planType } = req.body

  if (!shopId) {
    return res.status(400).json({ success: false, message: 'Shop ID is required' })
  }

  const result = await authService.createRenewalOrder(shopId, planType)
  return sendSuccess(res, 200, 'Subscription Order generated successfully', result)
})

// register a new shop (Direct fallback)
export const registerShop = asyncHandler(async (req, res, next) => {
  const result = await authService.registerInit(req.body)

  if (result.isFreeTrial && result.tokens) {
    const { accessToken, refreshToken, shop } = result.tokens
    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 2 * 60 * 60 * 1000 })
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 2 * 60 * 60 * 1000 })
    return sendSuccess(res, 201, 'Shop registered successfully! Welcome to Scan&Print.', {
      token: accessToken,
      shop,
    })
  }

  return sendSuccess(res, 201, 'Subscription Order created. Please complete payment to activate.', result)
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
  const io = req.app.get('io')
  if (io && updatedShop) {
    io.to(`shop:${updatedShop.shopCode}`).emit('SHOP_RATES_UPDATED', {
      shopCode: updatedShop.shopCode,
      bwRate: updatedShop.bwRate,
      colorRate: updatedShop.colorRate,
    })
  }
  return sendSuccess(res, 200, 'Print rates updated successfully', { shop: updatedShop })
})

// update shop printers
export const updateShopPrinters = asyncHandler(async (req, res, next) => {
  const updatedShop = await authService.updatePrinters(req.shop._id, req.body)
  const io = req.app.get('io')
  if (io && updatedShop) {
    io.to(`shop:${updatedShop.shopCode}`).emit('PRINTER_SETTINGS_UPDATED', {
      shopCode: updatedShop.shopCode,
      defaultBwPrinter: updatedShop.defaultBwPrinter,
      defaultColorPrinter: updatedShop.defaultColorPrinter,
      connectedPrinters: updatedShop.connectedPrinters,
    })
  }
  return sendSuccess(res, 200, 'Printers mapped successfully', { shop: updatedShop })
})

// update shop profile
export const updateShopProfile = asyncHandler(async (req, res, next) => {
  const updatedShop = await authService.updateProfile(req.shop._id, req.body)
  const io = req.app.get('io')
  if (io && updatedShop) {
    io.to(`shop:${updatedShop.shopCode}`).emit('SHOP_PROFILE_UPDATED', { shop: updatedShop })
    io.to('admin:room').emit('ADMIN_SHOP_UPDATED', { shopId: updatedShop._id, shopCode: updatedShop.shopCode })
  }
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
  const io = req.app.get('io')
  if (io && updatedShop) {
    io.to(`shop:${updatedShop.shopCode}`).emit('PAYMENT_SETTINGS_UPDATED', {
      shopCode: updatedShop.shopCode,
      paymentSettings: updatedShop.paymentSettings,
      upiId: updatedShop.paymentSettings?.upiId || '',
    })
  }
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

let cachedPublicSettings = null
let cachedPublicSettingsExpiry = 0

// public: get system settings (pricing, demo mode with 60s memory cache)
export const getPublicSettings = asyncHandler(async (req, res, next) => {
  const now = Date.now()
  if (cachedPublicSettings && now < cachedPublicSettingsExpiry) {
    return sendSuccess(res, 200, 'Settings fetched successfully', cachedPublicSettings)
  }

  let settings = await AdminSettings.findOne().lean()
  if (!settings) {
    settings = await AdminSettings.create({})
    settings = settings.toObject ? settings.toObject() : settings
  }

  cachedPublicSettings = settings
  cachedPublicSettingsExpiry = now + 60 * 1000 // 60s TTL
  return sendSuccess(res, 200, 'Settings fetched successfully', settings)
})

// public: handle contact form submission and send email to admin via Resend
export const submitContactForm = asyncHandler(async (req, res, next) => {
  const { name, email, phone, subject, message } = req.body
  if (!name || !email || !message) {
    return sendError(res, 400, 'Name, email and message are required')
  }

  const result = await sendContactEmail({ name, email, phone, subject, message })
  return sendSuccess(res, 200, 'Your message has been sent successfully to our support team!', result)
})

// refresh shop access token with session validation
export const refreshToken = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.refreshToken ||
    req.body?.refreshToken ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null)

  if (!token) {
    return sendError(res, 401, 'Refresh token is required')
  }

  try {
    const result = await authService.refreshToken(token)
    res.cookie('accessToken', result.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
    return sendSuccess(res, 200, 'Token refreshed successfully', result)
  } catch (err) {
    if (err.code === 'SESSION_INVALIDATED') {
      res.clearCookie('accessToken', cookieOptions)
      res.clearCookie('refreshToken', cookieOptions)
      return res.status(401).json({
        success: false,
        code: 'SESSION_INVALIDATED',
        message: err.message || 'Your session has expired or you have logged in from another device.',
      })
    }
    return sendError(res, 401, err.message || 'Invalid refresh token')
  }
})

// logout shop
export const logoutShop = asyncHandler(async (req, res, next) => {
  if (req.shop?._id) {
    await authService.logout(req.shop._id)
  }
  res.clearCookie('accessToken', cookieOptions)
  res.clearCookie('refreshToken', cookieOptions)
  return sendSuccess(res, 200, 'Logged out successfully')
})