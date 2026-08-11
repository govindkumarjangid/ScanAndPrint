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

// public routes
router.route('/login').post(login)

// protected routes
router.use(authenticateAdmin)


router.route('/stats').get(getDashboardStats)
router.route('/shops').get(getShops)
router.route('/agents').get(getAgents)
router.route('/transactions').get(getTransactions)

router.route('/settings').get(getSettings)
router.route('/settings').put(updateSettings)

export default router;
