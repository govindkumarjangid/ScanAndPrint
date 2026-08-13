import { agentRepository } from '../repositories/agent.repository.js'
import { shopRepository } from '../repositories/shop.repository.js'
import { jobRepository } from '../repositories/job.repository.js'

export const agentService = {

  // Register an agent session when it connects
  async registerAgent(data, socketId) {
    const { shopId, secretApiKey, agentVersion, ipAddress } = data || {}

    const cleanShopCode = String(shopId || '').trim().toUpperCase()
    const cleanSecret = String(secretApiKey || '').trim()

    if (!cleanShopCode || !cleanSecret)
      throw new Error('Shop ID and Secret Key are required')

    const shop = await shopRepository.findByCodeAndSecret(cleanShopCode, cleanSecret)
    if (!shop)
      throw new Error(`Invalid Shop Code (${cleanShopCode}) or Secret Key`)

    await agentRepository.createSession({
      shopId: shop._id,
      socketId,
      agentVersion: agentVersion || '1.0.0',
      ipAddress,
      isConnected: true,
    })

    const updateFields = { isOnline: true, lastHeartbeatAt: new Date() }
    if (Array.isArray(data?.printers) && data.printers.length > 0) {
      updateFields.connectedPrinters = data.printers
      if (!shop.defaultBwPrinter) {
        const defaultP = data.printers.find((p) => p.isDefault) || data.printers[0]
        updateFields.defaultBwPrinter = defaultP.name
      }
      if (!shop.defaultColorPrinter) {
        const defaultP = data.printers.find((p) => p.isDefault) || data.printers[0]
        updateFields.defaultColorPrinter = defaultP.name
      }
    }

    const updatedShop = await shopRepository.updateById(shop._id, updateFields)
    return updatedShop || shop
  },

  // update connected printers from agent event
  async updateConnectedPrinters(shopIdOrCode, printers) {
    if (!shopIdOrCode || !Array.isArray(printers)) return null
    let shop = null
    const str = String(shopIdOrCode).trim().toUpperCase()
    if (str.includes('_')) {
      shop = await shopRepository.findByCode(str)
    } else {
      shop = await shopRepository.findById(shopIdOrCode)
    }
    if (!shop) return null
    return await shopRepository.updateById(shop._id, {
      connectedPrinters: printers,
      lastHeartbeatAt: new Date(),
    })
  },

  // handle job success and update the job status
  async handleJobSuccess(jobId, printerName) {
    if (!jobId) throw new Error('Job ID missing')
    await jobRepository.updateJobStatus(jobId, 'PRINTED_SUCCESSFULLY', { printedPrinterName: printerName || '' })
  },

  // handle job failure and update the job status
  async handleJobFailed(jobId, error) {
    if (!jobId) throw new Error('Job ID missing')
    await jobRepository.updateJobStatus(jobId, 'PRINT_FAILED', { errorMessage: error || 'Hardware Print Error' })
  },

  // handle agent disconnect and update the shop online status if no active agents
  async handleDisconnect(socketId) {
    const agent = await agentRepository.disconnectSession(socketId)
    if (agent) {
      const activeCount = await agentRepository.countActiveByShopId(agent.shopId)
      if (activeCount === 0) {
        await shopRepository.setOnlineStatus(agent.shopId, false)
      }
    }
  }

}
