import { agentRepository } from '../repositories/agent.repository.js'
import { shopRepository } from '../repositories/shop.repository.js'
import { jobRepository } from '../repositories/job.repository.js'

export const agentService = {

  // Register an agent session when it connects
  async registerAgent(data, socketId) {
    const { shopId, secretApiKey, agentVersion, ipAddress } = data || {}

    if (!shopId || !secretApiKey)
      throw new Error('Invalid credentials')

    const shop = await shopRepository.findByCodeAndSecret(shopId, secretApiKey)
    if (!shop)
      throw new Error('Invalid Shop Code or Secret Key')

    await agentRepository.createSession({
      shopId: shop._id,
      socketId,
      agentVersion: agentVersion || '1.0.0',
      ipAddress,
      isConnected: true,
    })

    await shopRepository.setOnlineStatus(shop._id, true)

    return shop
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
