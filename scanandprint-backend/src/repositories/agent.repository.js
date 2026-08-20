import { PrintAgent } from '../models/PrintAgent.model.js'

export const agentRepository = {
  
  async createSession(sessionData) {
    return await PrintAgent.findOneAndUpdate(
      { shopId: sessionData.shopId },
      {
        $set: {
          socketId: sessionData.socketId,
          agentVersion: sessionData.agentVersion || '1.0.3',
          ipAddress: sessionData.ipAddress || '',
          osPlatform: sessionData.osPlatform || 'Windows',
          isConnected: true,
          connectedAt: new Date(),
          disconnectedAt: null,
        },
      },
      { upsert: true, returnDocument: 'after' }
    )
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
