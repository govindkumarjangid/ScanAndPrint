import { Shop } from '../models/Shop.model.js'

export const shopRepository = {
  
  async create(shopData) {
    return await Shop.create(shopData)
  },

  async findById(shopId, options = {}) {
    let query = Shop.findById(shopId)
    if (options.lean) query = query.lean()
    return await query
  },

  async findByEmail(email, options = {}) {
    let query = Shop.findOne({ email: email.toLowerCase() })
    if (options.includePassword) {
      query = query.select('+passwordHash')
    }
    if (options.lean) query = query.lean()
    return await query
  },

  async findByPhoneOrEmail(email, phone, options = {}) {
    let query = Shop.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    })
    if (options.lean) query = query.lean()
    return await query
  },

  async findByCode(shopCode, options = {}) {
    let query = Shop.findOne({ shopCode: shopCode.toUpperCase() })
    if (options.select) query = query.select(options.select)
    if (options.lean) query = query.lean()
    return await query
  },

  async findByCodeAndSecret(shopCode, secretApiKey, options = {}) {
    let query = Shop.findOne({
      shopCode: shopCode.toUpperCase(),
      secretApiKey,
    })
    if (options.lean) query = query.lean()
    return await query
  },

  async updateById(shopId, updateData, options = { new: true }) {
    return await Shop.findByIdAndUpdate(shopId, updateData, options).lean()
  },

  async setOnlineStatus(shopId, isOnline) {
    return await Shop.findByIdAndUpdate(
      shopId,
      { isOnline, lastHeartbeatAt: isOnline ? new Date() : undefined },
      { new: true }
    )
  },

  async findAll(filter = {}, projection = {}) {
    return await Shop.find(filter, projection).lean()
  },
}
