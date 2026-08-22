import express from 'express'
import {
  getMyDevices,
  approveDevice,
  rejectDevice,
  revokeDevice,
  checkAgentDeviceStatus,
  getAdminDevices,
  adminApproveDevice,
  adminRevokeDevice,
  getSuspiciousShops,
} from '../controllers/device.controller.js'
import { authenticateShop, authenticateAdmin } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Public / Agent Polling Route
router.get('/check-status', checkAgentDeviceStatus)

// Shop Owner Device Management Routes
router.get('/my-devices', authenticateShop, getMyDevices)
router.post('/:deviceId/approve', authenticateShop, approveDevice)
router.post('/:deviceId/reject', authenticateShop, rejectDevice)
router.post('/:deviceId/revoke', authenticateShop, revokeDevice)

// Super Admin Device Management Routes
router.get('/admin/all', authenticateAdmin, getAdminDevices)
router.get('/admin/suspicious', authenticateAdmin, getSuspiciousShops)
router.post('/admin/:deviceId/approve', authenticateAdmin, adminApproveDevice)
router.post('/admin/:deviceId/revoke', authenticateAdmin, adminRevokeDevice)

export default router
