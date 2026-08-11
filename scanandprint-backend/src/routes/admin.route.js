import express from 'express'
import {
  login,
  getDashboardStats,
  getShops,
  getAgents,
  getTransactions,
  getSettings,
  updateSettings
} from '../controllers/admin.controller.js'
import { authenticateAdmin } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Public
router.post('/login', login)

// Protected (Admin only)
router.use(authenticateAdmin)

router.get('/stats', getDashboardStats)
router.get('/shops', getShops)
router.get('/agents', getAgents)
router.get('/transactions', getTransactions)

router.get('/settings', getSettings)
router.put('/settings', updateSettings)

export default router
