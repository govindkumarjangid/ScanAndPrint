import express from 'express';
import {
  registerShop,
  registerInit,
  verifySubscriptionPayment,
  createSubscriptionOrder,
  demoRegisterShop,
  loginShop,
  getShopProfile,
  updateShopRates,
  updateShopPrinters,
  updateShopProfile,
  changeShopPassword,
  updateShopPaymentSettings,
  submitShopReview,
  getPublicReviews,
  getPublicSettings,
  logoutShop,
  loginAdmin,
} from '../controllers/auth.controller.js'
import { authenticateShop } from '../middlewares/auth.middleware.js'
import { validateRequest } from '../middlewares/validate.middleware.js'
import {
  registerSchema,
  loginSchema,
  updateRatesSchema,
  updatePrintersSchema,
} from '../validators/auth.validator.js'

const router = express.Router()

router.route('/register').post(validateRequest(registerSchema), registerShop)
router.route('/register-init').post(validateRequest(registerSchema), registerInit)
router.route('/verify-subscription-payment').post(verifySubscriptionPayment)
router.route('/create-subscription-order').post(authenticateShop, createSubscriptionOrder)
router.route('/demo-register').post(demoRegisterShop)
router.route('/login').post(validateRequest(loginSchema), loginShop)
router.route('/logout').post(authenticateShop, logoutShop)

// Admin Route
router.route('/admin/login').post(loginAdmin)

// Public Route
router.route('/reviews').get(getPublicReviews)
router.route('/settings').get(getPublicSettings)

// Protected Routes
router.use(authenticateShop)

router.route('/me').get(getShopProfile)
router.route('/profile').put(updateShopProfile)
router.route('/rates').put(validateRequest(updateRatesSchema), updateShopRates)
router.route('/printers').put(validateRequest(updatePrintersSchema), updateShopPrinters)
router.route('/change-password').put(changeShopPassword)
router.route('/payment-settings').put(updateShopPaymentSettings)
router.route('/review').post(submitShopReview)

// Auto-refresh token endpoint
router.route('/refresh-token').post((req, res) => {
  res.status(200).json({ success: true, message: 'Token valid' })
})

export default router