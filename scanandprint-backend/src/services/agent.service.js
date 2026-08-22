import { agentRepository } from '../repositories/agent.repository.js'
import { shopRepository } from '../repositories/shop.repository.js'
import { jobRepository } from '../repositories/job.repository.js'

import path from 'path'
import fs from 'fs'

function isVirtualOrLocal(ip) {
  if (!ip) return true
  const s = String(ip).replace(/^::ffff:/, '').trim()
  if (s === '127.0.0.1' || s === '::1' || s.startsWith('127.')) return true
  if (s.startsWith('169.254.')) return true
  // VMware & VirtualBox host-only subnets
  if (s.startsWith('192.168.23.') || s.startsWith('192.168.248.') || s.startsWith('192.168.56.')) return true
  return false
}

function resolveEffectiveIp(remoteIp, data) {
  // 1. Physical IP detected on the counter machine by Desktop Agent
  const agentIp = data?.localIp || data?.ipAddress || data?.deviceMeta?.ipAddress || data?.meta?.ipAddress
  if (agentIp && !isVirtualOrLocal(agentIp)) {
    return String(agentIp).trim()
  }

  // 2. Remote TCP client connection IP
  const cleanRemote = String(remoteIp || '').replace(/^::ffff:/, '').trim()
  if (cleanRemote && !isVirtualOrLocal(cleanRemote)) {
    return cleanRemote
  }

  // 3. Public WAN IP
  if (data?.publicIp && !isVirtualOrLocal(data.publicIp)) {
    return String(data.publicIp).trim()
  }

  return agentIp || cleanRemote || '127.0.0.1'
}

export const agentService = {

  // Register an agent session when it connects
  async registerAgent(data, socketId, remoteIp) {
    const { shopId, secretApiKey, agentVersion, ipAddress, osPlatform, osArch, platform } = data || {}

    const cleanShopCode = String(shopId || '').trim().toUpperCase()
    const cleanSecret = String(secretApiKey || '').trim()

    if (!cleanShopCode || !cleanSecret)
      throw new Error('Shop ID and Secret Key are required')

    const shop = await shopRepository.findByCodeAndSecret(cleanShopCode, cleanSecret)
    if (!shop)
      throw new Error(`Invalid Shop Code (${cleanShopCode}) or Secret Key`)

    if (shop.isSuspended) {
      throw new Error(`Shop account (${cleanShopCode}) is suspended by Administrator. Print Agent connection refused.`)
    }

    const now = Date.now()
    if (shop.isDemoAccount) {
      const isDemoExpired = shop.demoExpiresAt ? new Date(shop.demoExpiresAt).getTime() <= now : true
      if (isDemoExpired) {
        throw new Error(`Demo trial for Shop (${cleanShopCode}) has expired. Secret Key & Shop ID are deactivated. Please upgrade to a paid plan.`)
      }
    } else if (shop.subscriptionExpiresAt && new Date(shop.subscriptionExpiresAt).getTime() <= now) {
      throw new Error(`Subscription for Shop (${cleanShopCode}) has expired. Please renew your subscription to connect the Print Agent.`)
    }

    const detectedIp = resolveEffectiveIp(remoteIp, data)
    const detectedPlatform = osPlatform || osArch || (platform === 'win32' ? 'Windows x64' : platform) || 'Windows'
    const detectedPrinters = Array.isArray(data?.printers) ? data.printers : (Array.isArray(shop.connectedPrinters) ? shop.connectedPrinters : [])

    // 1. Update/Upsert the single unique PrintAgent document for this shop (1 Shop = 1 Agent record)
    await agentRepository.createSession({
      shopId: shop._id,
      socketId,
      agentVersion: agentVersion || '1.0.3',
      ipAddress: detectedIp,
      osPlatform: detectedPlatform,
      connectedPrinters: detectedPrinters,
      deviceFingerprint: data?.deviceFingerprint || '',
      meta: {
        ...(data?.deviceMeta || data?.meta || {}),
        ipAddress: detectedIp,
        localIp: detectedIp,
      },
      isConnected: true,
    })

    // 2. Update Shop model with live online status and hardware printers
    const updateFields = { isOnline: true, lastHeartbeatAt: new Date() }
    if (detectedPrinters.length > 0) {
      updateFields.connectedPrinters = detectedPrinters
      if (!shop.defaultBwPrinter) {
        const defaultP = detectedPrinters.find((p) => p.isDefault) || detectedPrinters[0]
        updateFields.defaultBwPrinter = defaultP.name
      }
      if (!shop.defaultColorPrinter) {
        const defaultP = detectedPrinters.find((p) => p.isDefault) || detectedPrinters[0]
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
    if (str.includes('_') || str.startsWith('SHOP')) {
      shop = await shopRepository.findByCode(str)
    } else {
      shop = await shopRepository.findById(shopIdOrCode)
    }
    if (!shop) {
      shop = await shopRepository.findByCode(str)
    }
    if (!shop) return null

    // Update both Shop and PrintAgent in database
    await Promise.all([
      shopRepository.updateById(shop._id, {
        connectedPrinters: printers,
        lastHeartbeatAt: new Date(),
        isOnline: true,
      }),
      agentRepository.updatePrinters(shop._id, printers),
    ])

    return shop
  },

  // handle job success and update the job status
  async handleJobSuccess(jobId, printerName) {
    if (!jobId) throw new Error('Job ID missing')
    await jobRepository.updateJobStatus(jobId, 'PRINTED_SUCCESSFULLY', { printedPrinterName: printerName || '' })

    // Auto-delete local upload file for 100% privacy and disk cleanup
    try {
      const filePath = path.join(process.cwd(), 'uploads', 'jobs', `${jobId}.pdf`)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log(`[Storage Cleanup] 🗑️ Auto-deleted uploads file for printed job #${jobId}`)
      }
    } catch (e) {
      console.warn(`[Storage Cleanup Warning] Failed to delete file for #${jobId}:`, e.message)
    }
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
