import { Device } from '../models/Device.model.js'

export const deviceRepository = {

  // Find a specific device by shop and hardware fingerprint
  async findByShopAndFingerprint(shopId, fingerprint) {
    if (!shopId || !fingerprint) return null
    return await Device.findOne({ shopId, fingerprint })
  },

  // Find currently approved device for a shop
  async findApprovedByShopId(shopId) {
    if (!shopId) return null
    return await Device.findOne({ shopId, status: 'APPROVED' })
  },

  // Find all devices for a given shop
  async findByShopId(shopId) {
    if (!shopId) return []
    return await Device.find({ shopId }).sort({ createdAt: -1 }).lean()
  },

  // Find device by ID
  async findById(deviceId) {
    return await Device.findById(deviceId)
  },

  // Create or upsert a new device registration request
  async upsertDevice({ shopId, fingerprint, meta, status = 'PENDING_APPROVAL' }) {
    return await Device.findOneAndUpdate(
      { shopId, fingerprint },
      {
        $setOnInsert: {
          shopId,
          fingerprint,
          firstSeenAt: new Date(),
          status,
        },
        $set: {
          meta: meta || {},
          updatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    )
  },

  // Approve a target device and automatically revoke any previously approved devices for this shop
  async approveDevice(deviceId, approvedBy = 'OWNER') {
    const target = await Device.findById(deviceId)
    if (!target) return null

    // Single Active Approved Device Policy: Revoke all other approved devices for this shop
    await Device.updateMany(
      { shopId: target.shopId, _id: { $ne: target._id }, status: 'APPROVED' },
      {
        $set: {
          status: 'REVOKED',
          revokedAt: new Date(),
          revokedBy: approvedBy,
        },
      }
    )

    // Set target device as APPROVED
    target.status = 'APPROVED'
    target.approvedAt = new Date()
    target.approvedBy = approvedBy
    target.rejectedAt = null
    target.revokedAt = null
    return await target.save()
  },

  // Reject a device
  async rejectDevice(deviceId, rejectedBy = 'OWNER', reason = '') {
    return await Device.findByIdAndUpdate(
      deviceId,
      {
        $set: {
          status: 'REJECTED',
          rejectedAt: new Date(),
          rejectedBy,
          rejectionReason: reason,
        },
      },
      { returnDocument: 'after' }
    )
  },

  // Revoke a previously approved device
  async revokeDevice(deviceId, revokedBy = 'OWNER') {
    return await Device.findByIdAndUpdate(
      deviceId,
      {
        $set: {
          status: 'REVOKED',
          revokedAt: new Date(),
          revokedBy,
        },
      },
      { returnDocument: 'after' }
    )
  },

  // Update last connected timestamp & sync live hardware/network telemetry
  async updateLastConnected(deviceId, ipAddress) {
    const update = { lastConnectedAt: new Date() }
    if (ipAddress && ipAddress !== '::1' && ipAddress !== '127.0.0.1') {
      update['meta.ipAddress'] = ipAddress
      update['meta.localIp'] = ipAddress
    }
    return await Device.findByIdAndUpdate(deviceId, { $set: update }, { returnDocument: 'after' })
  },

  // Sync complete live hardware and network telemetry whenever agent connects
  async syncDeviceMeta(deviceId, meta = {}) {
    if (!deviceId) return null
    const updateObj = { lastConnectedAt: new Date() }
    
    if (meta.hostname) updateObj['meta.hostname'] = meta.hostname
    if (meta.platform) updateObj['meta.platform'] = meta.platform
    if (meta.arch) updateObj['meta.arch'] = meta.arch
    if (meta.cpuModel) updateObj['meta.cpuModel'] = meta.cpuModel
    if (meta.motherboardSerial) updateObj['meta.motherboardSerial'] = meta.motherboardSerial
    if (meta.systemUuid) updateObj['meta.systemUuid'] = meta.systemUuid
    if (meta.totalMemoryGb) updateObj['meta.totalMemoryGb'] = meta.totalMemoryGb
    if (meta.ipAddress && meta.ipAddress !== '::1' && meta.ipAddress !== '127.0.0.1') {
      updateObj['meta.ipAddress'] = meta.ipAddress
    }
    if (meta.localIp && meta.localIp !== '::1' && meta.localIp !== '127.0.0.1') {
      updateObj['meta.localIp'] = meta.localIp
    }
    if (meta.defaultGateway) updateObj['meta.defaultGateway'] = meta.defaultGateway

    return await Device.findByIdAndUpdate(
      deviceId,
      { $set: updateObj },
      { returnDocument: 'after' }
    )
  },

  // Count total registered devices for a shop
  async countByShopId(shopId) {
    return await Device.countDocuments({ shopId })
  },

  // Admin query: list all devices across all shops with pagination
  async findAllPaginated({ query = {}, page = 1, limit = 10 }) {
    const skip = (Number(page) - 1) * Number(limit)
    const [devices, totalCount] = await Promise.all([
      Device.find(query)
        .populate('shopId', 'shopName shopCode email phone ownerName isOnline')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Device.countDocuments(query),
    ])
    return { devices, totalCount }
  },

  // Admin query: detect suspicious shops with excessive (>= threshold) device registrations
  async findSuspiciousShops(threshold = 4) {
    return await Device.aggregate([
      {
        $group: {
          _id: '$shopId',
          totalDevices: { $sum: 1 },
          devices: {
            $push: {
              fingerprint: '$fingerprint',
              hostname: '$meta.hostname',
              status: '$status',
              firstSeenAt: '$firstSeenAt',
            },
          },
        },
      },
      { $match: { totalDevices: { $gte: Number(threshold) } } },
      {
        $lookup: {
          from: 'shops',
          localField: '_id',
          foreignField: '_id',
          as: 'shop',
        },
      },
      { $unwind: '$shop' },
      {
        $project: {
          _id: 1,
          totalDevices: 1,
          devices: 1,
          shopName: '$shop.shopName',
          shopCode: '$shop.shopCode',
          ownerName: '$shop.ownerName',
          email: '$shop.email',
          phone: '$shop.phone',
        },
      },
      { $sort: { totalDevices: -1 } },
    ])
  },
}
