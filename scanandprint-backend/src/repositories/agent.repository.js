import { PrintAgent } from '../models/PrintAgent.model.js'

export const agentRepository = {
  
  async createSession(sessionData) {
    return await PrintAgent.create(sessionData)
  },

  async findBySocketId(socketId, options = {}) {
    let query = PrintAgent.findOne({ socketId })
    if (options.lean) query = query.lean()
    return await query
  },

  async countActiveByShopId(shopId) {
    return await PrintAgent.countDocuments({
      shopId,
      isConnected: true,
    })
  },

  async disconnectSession(socketId) {
    return await PrintAgent.findOneAndUpdate(
      { socketId },
      { isConnected: false, disconnectedAt: new Date() },
      { returnDocument: 'after' }
    )
  }
}
