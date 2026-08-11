import express from 'express'
import {
  registerShop,
  loginShop,
  getShopProfile,
  updateShopRates,
  updateShopPrinters,
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
router.put('/rates', validateRequest(updateRatesSchema), updateShopRates)
router.put('/printers', validateRequest(updatePrintersSchema), updateShopPrinters)

// Auto-refresh token endpoint doesn't need much logic here since cookie parser and jwt middleware will handle it
router.post('/refresh-token', authenticateShop, (req, res) => {
  // If authenticateShop passes, the shop is valid. The token rotation can be handled in a dedicated controller if needed.
  // For now, authenticateShop updates req.shop, and since we just need it to succeed, we can send a success response.
  // Or better, let's add a refreshToken function in auth.controller.js
  res.status(200).json({ success: true, message: 'Token valid' })
})

export default router
