import { deviceRepository } from '../repositories/device.repository.js'
import { shopRepository } from '../repositories/shop.repository.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { getIo, kickRevokedDeviceSocket, activeAgentsMap } from '../socket.js'

// ==================== SHOP OWNER CONTROLLERS ====================

/**
 * Get all registered devices for the authenticated shop owner
 */
export const getMyDevices = asyncHandler(async (req, res) => {
  const shopId = req.shop._id
  const shopCode = String(req.shop.shopCode || '').trim().toUpperCase()
  const devices = await deviceRepository.findByShopId(shopId)
  const liveAgent = activeAgentsMap.get(shopCode) || activeAgentsMap.get(String(shopId))

  const enrichedDevices = devices.map((d) => {
    const rawDev = typeof d.toObject === 'function' ? d.toObject() : { ...d }
    if (liveAgent) {
      const liveMeta = liveAgent.meta || {}
      return {
        ...rawDev,
        meta: {
          ...rawDev.meta,
          ...liveMeta,
          ipAddress: liveAgent.ipAddress || liveMeta.ipAddress || rawDev.meta?.ipAddress,
          localIp: liveAgent.localIp || liveMeta.localIp || rawDev.meta?.localIp,
          defaultGateway: liveAgent.defaultGateway || liveMeta.defaultGateway || rawDev.meta?.defaultGateway,
        },
      }
    }
    return rawDev
  })

  const approvedDevice = enrichedDevices.find((d) => d.status === 'APPROVED') || null
  const pendingDevices = enrichedDevices.filter((d) => d.status === 'PENDING_APPROVAL')
  const historyDevices = enrichedDevices.filter((d) => d.status === 'REJECTED' || d.status === 'REVOKED')

  return sendSuccess(res, 200, 'Devices fetched successfully', {
    devices: enrichedDevices,
    approvedDevice,
    pendingDevices,
    historyDevices,
    totalDevices: enrichedDevices.length,
    hasPending: pendingDevices.length > 0,
  })
})

/**
 * Block self-approval by Shop Owner: Device approval requires Super Admin authorization
 */
export const approveDevice = asyncHandler(async (req, res) => {
  return sendError(res, 403, 'Unauthorized: Device binding requires Super Admin approval. Please wait for Admin verification or contact support.')
})

/**
 * Reject a pending device request
 */
export const rejectDevice = asyncHandler(async (req, res) => {
  const shopId = req.shop._id
  const shopCode = req.shop.shopCode
  const { deviceId } = req.params
  const { reason = 'Rejected by Shop Owner' } = req.body || {}

  const targetDevice = await deviceRepository.findById(deviceId)
  if (!targetDevice) {
    return sendError(res, 404, 'Device record not found')
  }

  if (String(targetDevice.shopId) !== String(shopId)) {
    return sendError(res, 403, 'Unauthorized: Device does not belong to your shop')
  }

  const updatedDevice = await deviceRepository.rejectDevice(deviceId, 'OWNER', reason)

  const io = getIo()
  if (io) {
    io.to(`shop:${shopCode}`).emit('DEVICE_STATUS_CHANGED', {
      deviceId,
      shopCode,
      status: 'REJECTED',
    })
  }

  return sendSuccess(res, 200, 'Device request rejected', {
    device: updatedDevice,
  })
})

/**
 * Revoke an existing approved device
 */
export const revokeDevice = asyncHandler(async (req, res) => {
  const shopId = req.shop._id
  const shopCode = req.shop.shopCode
  const { deviceId } = req.params

  const targetDevice = await deviceRepository.findById(deviceId)
  if (!targetDevice) {
    return sendError(res, 404, 'Device record not found')
  }

  if (String(targetDevice.shopId) !== String(shopId)) {
    return sendError(res, 403, 'Unauthorized: Device does not belong to your shop')
  }

  const updatedDevice = await deviceRepository.revokeDevice(deviceId, 'OWNER')

  // Disconnect active socket
  kickRevokedDeviceSocket(shopCode, deviceId, 'Device authorization was revoked by Shop Owner.')

  const io = getIo()
  if (io) {
    io.to(`shop:${shopCode}`).emit('DEVICE_STATUS_CHANGED', {
      deviceId,
      shopCode,
      status: 'REVOKED',
    })
  }

  return sendSuccess(res, 200, 'Device access revoked successfully', {
    device: updatedDevice,
  })
})

// ==================== AGENT PUBLIC POLLING ====================

/**
 * Lightweight endpoint for Electron Agent to poll approval status while waiting
 */
export const checkAgentDeviceStatus = asyncHandler(async (req, res) => {
  const { shopCode, fingerprint } = req.query
  if (!shopCode || !fingerprint) {
    return sendError(res, 400, 'Shop Code and Fingerprint are required')
  }

  const cleanCode = String(shopCode).trim().toUpperCase()
  const shop = await shopRepository.findByCode(cleanCode)
  if (!shop) {
    return sendError(res, 404, 'Shop not found')
  }

  const device = await deviceRepository.findByShopAndFingerprint(shop._id, String(fingerprint).trim())
  if (!device) {
    return sendSuccess(res, 200, 'Device not registered yet', {
      status: 'NOT_FOUND',
      isApproved: false,
    })
  }

  return sendSuccess(res, 200, 'Device status retrieved', {
    status: device.status,
    isApproved: device.status === 'APPROVED',
    firstSeenAt: device.firstSeenAt,
    approvedAt: device.approvedAt,
    rejectionReason: device.rejectionReason,
  })
})

// ==================== SUPER ADMIN CONTROLLERS ====================

/**
 * Super Admin: Get all devices across all shops with filters & pagination
 */
export const getAdminDevices = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status = '', search = '' } = req.query
  const query = {}

  if (status && status.trim()) {
    query.status = status.trim().toUpperCase()
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i')
    query.$or = [
      { 'meta.hostname': regex },
      { 'meta.cpuModel': regex },
      { fingerprint: regex },
    ]
  }

  const { devices, totalCount } = await deviceRepository.findAllPaginated({
    query,
    page: Number(page),
    limit: Number(limit),
  })

  // Merge live real-time socket telemetry if agent is actively connected
  const liveEnrichedDevices = devices.map((d) => {
    const rawDev = typeof d.toObject === 'function' ? d.toObject() : { ...d }
    const shopCode = String(rawDev.shopId?.shopCode || '').trim().toUpperCase()
    const liveAgent = activeAgentsMap.get(shopCode) || activeAgentsMap.get(String(rawDev.shopId?._id))

    if (liveAgent) {
      const liveMeta = liveAgent.meta || {}
      return {
        ...rawDev,
        meta: {
          ...rawDev.meta,
          ...liveMeta,
          ipAddress: liveAgent.ipAddress || liveMeta.ipAddress || rawDev.meta?.ipAddress,
          localIp: liveAgent.localIp || liveMeta.localIp || rawDev.meta?.localIp,
          defaultGateway: liveAgent.defaultGateway || liveMeta.defaultGateway || rawDev.meta?.defaultGateway,
        },
      }
    }
    return rawDev
  })

  return sendSuccess(res, 200, 'Admin devices fetched successfully', {
    devices: liveEnrichedDevices,
    pagination: {
      totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)) || 1,
      limit: Number(limit),
    },
  })
})

/**
 * Super Admin: Override Approve a device
 */
export const adminApproveDevice = asyncHandler(async (req, res) => {
  const { deviceId } = req.params
  const targetDevice = await deviceRepository.findById(deviceId)
  if (!targetDevice) {
    return sendError(res, 404, 'Device record not found')
  }

  const shop = await shopRepository.findById(targetDevice.shopId)
  const previousApproved = await deviceRepository.findApprovedByShopId(targetDevice.shopId)

  const updatedDevice = await deviceRepository.approveDevice(deviceId, 'ADMIN')

  if (shop && previousApproved && String(previousApproved._id) !== String(deviceId)) {
    kickRevokedDeviceSocket(shop.shopCode, previousApproved._id, 'Admin updated approved device.')
  }

  const io = getIo()
  if (io && shop) {
    io.to(`shop:${shop.shopCode}`).emit('DEVICE_STATUS_CHANGED', {
      deviceId,
      shopCode: shop.shopCode,
      status: 'APPROVED',
      approvedDevice: updatedDevice,
    })
    io.to('admin:room').emit('ADMIN_DEVICE_UPDATED', {
      deviceId,
      shopCode: shop.shopCode,
      status: 'APPROVED',
    })
  }

  return sendSuccess(res, 200, 'Device approved by Admin', { device: updatedDevice })
})

/**
 * Super Admin: Reject a pending device request
 */
export const adminRejectDevice = asyncHandler(async (req, res) => {
  const { deviceId } = req.params
  const { reason = 'Rejected by Super Admin' } = req.body || {}

  const targetDevice = await deviceRepository.findById(deviceId)
  if (!targetDevice) {
    return sendError(res, 404, 'Device record not found')
  }

  const shop = await shopRepository.findById(targetDevice.shopId)
  const updatedDevice = await deviceRepository.rejectDevice(deviceId, 'ADMIN', reason)

  const io = getIo()
  if (io && shop) {
    io.to(`shop:${shop.shopCode}`).emit('DEVICE_STATUS_CHANGED', {
      deviceId,
      shopCode: shop.shopCode,
      status: 'REJECTED',
      reason,
    })
    io.to('admin:room').emit('ADMIN_DEVICE_UPDATED', {
      deviceId,
      shopCode: shop.shopCode,
      status: 'REJECTED',
    })
  }

  return sendSuccess(res, 200, 'Device request rejected by Admin', { device: updatedDevice })
})

/**
 * Super Admin: Override Revoke a device
 */
export const adminRevokeDevice = asyncHandler(async (req, res) => {
  const { deviceId } = req.params
  const targetDevice = await deviceRepository.findById(deviceId)
  if (!targetDevice) {
    return sendError(res, 404, 'Device record not found')
  }

  const shop = await shopRepository.findById(targetDevice.shopId)
  const updatedDevice = await deviceRepository.revokeDevice(deviceId, 'ADMIN')

  if (shop) {
    kickRevokedDeviceSocket(shop.shopCode, deviceId, 'Admin revoked device authorization.')
  }

  return sendSuccess(res, 200, 'Device revoked by Admin', { device: updatedDevice })
})

/**
 * Super Admin: Query suspicious shops with >= 4 device registration attempts
 */
export const getSuspiciousShops = asyncHandler(async (req, res) => {
  const threshold = Number(req.query.threshold) || 4
  const suspicious = await deviceRepository.findSuspiciousShops(threshold)

  return sendSuccess(res, 200, 'Suspicious multi-device shops query successful', {
    suspicious,
    threshold,
    count: suspicious.length,
  })
})
