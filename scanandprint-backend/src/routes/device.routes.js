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
router.route('/check-status').get(checkAgentDeviceStatus)

// Shop Owner Device Management Routes
router.route('/my-devices').get(authenticateShop, getMyDevices)
router.route('/:deviceId/approve').post(authenticateShop, approveDevice)
router.route('/:deviceId/reject').post(authenticateShop, rejectDevice)
router.route('/:deviceId/revoke').post(authenticateShop, revokeDevice)

// Super Admin Device Management Routes
router.route('/admin/all').get(authenticateAdmin, getAdminDevices)
router.route('/admin/suspicious').get(authenticateAdmin, getSuspiciousShops)
router.route('/admin/:deviceId/approve').post(authenticateAdmin, adminApproveDevice)
router.route('/admin/:deviceId/revoke').post(authenticateAdmin, adminRevokeDevice)

export default router