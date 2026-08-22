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
          connectedPrinters: sessionData.connectedPrinters || [],
          deviceFingerprint: sessionData.deviceFingerprint || '',
          meta: sessionData.meta || {},
          isConnected: true,
          connectedAt: new Date(),
          disconnectedAt: null,
        },
      },
      { upsert: true, returnDocument: 'after' }
    )
  },

  async updatePrinters(shopId, printers) {
    return await PrintAgent.findOneAndUpdate(
      { shopId },
      {
        $set: {
          connectedPrinters: printers || [],
          isConnected: true,
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
      { $set: { isConnected: false, disconnectedAt: new Date() } },
      { returnDocument: 'after' }
    )
  }
}
