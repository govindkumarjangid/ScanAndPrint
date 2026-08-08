import express from 'express'
import {
  registerShop,
  loginShop,
  getShopProfile,
  updateShopRates,
  updateShopPrinters,
} from '../controllers/auth.controller.js'
import { authenticateShop } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Public Auth Endpoints
router.post('/register', registerShop)
router.post('/login', loginShop)

// Protected Shop Owner Dashboard Endpoints
router.get('/me', authenticateShop, getShopProfile)
router.put('/rates', authenticateShop, updateShopRates)
router.put('/printers', authenticateShop, updateShopPrinters)

export default router
