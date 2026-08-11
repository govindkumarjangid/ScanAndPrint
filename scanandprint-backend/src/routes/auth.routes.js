import express from 'express'
import {
  registerShop,
  loginShop,
  getShopProfile,
  updateShopRates,
  updateShopPrinters,
  updateShopProfile,
  changeShopPassword,
  updateShopPaymentSettings,
  submitShopReview,
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

router.post('/register', validateRequest(registerSchema), registerShop)
router.post('/login', validateRequest(loginSchema), loginShop)
router.post('/logout', authenticateShop, logoutShop)

// Admin Route
router.post('/admin/login', loginAdmin)

// Protected Routes
router.use(authenticateShop)

router.get('/me', getShopProfile)
router.put('/profile', updateShopProfile)
router.put('/rates', validateRequest(updateRatesSchema), updateShopRates)
router.put('/printers', validateRequest(updatePrintersSchema), updateShopPrinters)
router.put('/change-password', changeShopPassword)
router.put('/payment-settings', updateShopPaymentSettings)
router.post('/review', submitShopReview)

// Auto-refresh token endpoint
router.post('/refresh-token', (req, res) => {
  res.status(200).json({ success: true, message: 'Token valid' })
})

export default router

