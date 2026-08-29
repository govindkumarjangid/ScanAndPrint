import express from 'express'
import {
  login,
  getDashboardStats,
  getShops,
  getAgents,
  getTransactions,
  getSettings,
  updateSettings,
  getAnalytics,
  extendDemoTrial,
  updateShopPlan,
  toggleShopStatus,
  getShopPrintJobs,
  exportAllShops,
  exportAllTransactions,
  deleteShop,
  deleteTransaction,
} from '../controllers/admin.controller.js'
import {
  getAdminDevices,
  adminApproveDevice,
  adminRejectDevice,
  adminRevokeDevice,
  getSuspiciousShops,
} from '../controllers/device.controller.js'
import { authenticateAdmin } from '../middlewares/auth.middleware.js'

const router = express.Router()

// public routes
router.route('/login').post(login)

// protected routes
router.use(authenticateAdmin)

router.route('/stats').get(getDashboardStats)
router.route('/analytics').get(getAnalytics)
router.route('/shops').get(getShops)
router.route('/shops/:id').delete(deleteShop)
router.route('/shops/:id/extend-demo').post(extendDemoTrial)
router.route('/shops/:id/plan').put(updateShopPlan)
router.route('/shops/:id/status').put(toggleShopStatus)
router.route('/shops/:id/jobs').get(getShopPrintJobs)

router.route('/agents').get(getAgents)
router.route('/devices').get(getAdminDevices)
router.route('/devices/suspicious').get(getSuspiciousShops)
router.route('/devices/:deviceId/approve').post(adminApproveDevice)
router.route('/devices/:deviceId/reject').post(adminRejectDevice)
router.route('/devices/:deviceId/revoke').post(adminRevokeDevice)
router.route('/transactions').get(getTransactions)
router.route('/transactions/:id').delete(deleteTransaction)

router.route('/settings').get(getSettings)
router.route('/settings').put(updateSettings)

router.route('/export/shops').get(exportAllShops)
router.route('/export/transactions').get(exportAllTransactions)

export default router;
