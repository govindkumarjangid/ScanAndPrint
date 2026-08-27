import { access, unlink } from 'node:fs/promises'
import path from 'node:path'

import { agentRepository } from '../repositories/agent.repository.js'
import { shopRepository } from '../repositories/shop.repository.js'
import { jobRepository } from '../repositories/job.repository.js'


const isVirtualOrLocalIp = ip => {
  if (!ip) return true
  const value = String(ip).replace(/^::ffff:/, '').trim()
  return (
    value === '127.0.0.1' ||
    value === '::1' ||
    value.startsWith('127.') ||
    value.startsWith('169.254.') ||
    value.startsWith('192.168.23.') ||
    value.startsWith('192.168.248.') ||
    value.startsWith('192.168.56.')
  )
}

const resolveEffectiveIp = (remoteIp, data = {}) => {
  const agentIp = data.localIp || data.ipAddress || data.deviceMeta?.ipAddress || data.meta?.ipAddress

  if (agentIp && !isVirtualOrLocalIp(agentIp))
    return String(agentIp).trim()

  const cleanRemoteIp = String(remoteIp || '').replace(/^::ffff:/, '').trim()

  if (cleanRemoteIp && !isVirtualOrLocalIp(cleanRemoteIp))
    return cleanRemoteIp

  if (data.publicIp && !isVirtualOrLocalIp(data.publicIp))
    return String(data.publicIp).trim()

  return agentIp || cleanRemoteIp || '127.0.0.1'
}


const isShopAccessExpired = shop => {
  const now = Date.now()
  if (shop.isDemoAccount)
    return !shop.demoExpiresAt || new Date(shop.demoExpiresAt).getTime() <= now

  return Boolean(
    shop.subscriptionExpiresAt &&
    new Date(shop.subscriptionExpiresAt).getTime() <= now
  )
}


const resolveShop = async shopIdOrCode => {
  if (!shopIdOrCode) return null

  const value = String(shopIdOrCode).trim().toUpperCase()

  const isShopCode = value.includes('_') || value.startsWith('SHOP')

  let shop = isShopCode ? await shopRepository.findByCode(value) : await shopRepository.findById(shopIdOrCode)

  if (!shop) shop = await shopRepository.findByCode(value)

  return shop
}


const getDetectedPrinters = (data, shop) => {
  if (Array.isArray(data?.printers))
    return data.printers

  return Array.isArray(shop.connectedPrinters)
    ? shop.connectedPrinters
    : []
}


const getDefaultPrinter = printers =>
  printers.find(printer => printer?.isDefault) ||
  printers[0]


export const agentService = {

  async registerAgent(data, socketId, remoteIp) {
    const {
      shopId,
      secretApiKey,
      agentVersion,
      osPlatform,
      osArch,
      platform,
      deviceFingerprint
    } = data ?? {}

    const shopCode = String(shopId ?? '').trim().toUpperCase()
    const secretKey = String(secretApiKey ?? '').trim()

    if (!shopCode || !secretKey)
      throw new Error('Shop ID and Secret Key are required')

    const shop = await shopRepository.findByCodeAndSecret(shopCode, secretKey)

    if (!shop)
      throw new Error(`Invalid Shop Code (${shopCode}) or Secret Key`)

    if (shop.isSuspended)
      throw new Error(`Shop account (${shopCode}) is suspended by Administrator. Print Agent connection refused.`)

    if (isShopAccessExpired(shop))
      throw new Error(
        shop.isDemoAccount
          ? `Demo trial for Shop (${shopCode}) has expired. Please upgrade to a paid plan.`
          : `Subscription for Shop (${shopCode}) has expired. Please renew your subscription to connect the Print Agent.`
      )

    const detectedIp = resolveEffectiveIp(remoteIp, data)

    const detectedPlatform = osPlatform || osArch || (platform === 'win32' ? 'Windows x64'
      : platform) || 'Windows'

    const connectedPrinters = getDetectedPrinters(data, shop)

    await agentRepository.createSession({
      shopId: shop._id,
      socketId,
      agentVersion: agentVersion || '1.0.3',
      ipAddress: detectedIp,
      osPlatform: detectedPlatform,
      connectedPrinters,
      deviceFingerprint: deviceFingerprint || '',

      meta: {
        ...(data.deviceMeta || data.meta || {}),
        ipAddress: detectedIp,
        localIp: detectedIp
      },

      isConnected: true
    })

    const updateFields = {
      isOnline: true,
      lastHeartbeatAt: new Date()
    }

    if (connectedPrinters.length > 0) {
      updateFields.connectedPrinters = connectedPrinters

      const defaultPrinter = getDefaultPrinter(connectedPrinters)

      if (defaultPrinter?.name && !shop.defaultBwPrinter)
        updateFields.defaultBwPrinter = defaultPrinter.name

      if (defaultPrinter?.name && !shop.defaultColorPrinter)
        updateFields.defaultColorPrinter = defaultPrinter.name
    }

    const updatedShop = await shopRepository.updateById(shop._id, updateFields)

    return updatedShop || shop
  },


  async updateConnectedPrinters(shopIdOrCode, printers) {
    if (!shopIdOrCode || !Array.isArray(printers))
      return null

    const shop = await resolveShop(shopIdOrCode)

    if (!shop) return null

    await Promise.all([shopRepository.updateById(
      shop._id,
      {
        connectedPrinters: printers,
        lastHeartbeatAt: new Date(),
        isOnline: true
      }
    ),

    agentRepository.updatePrinters(shop._id, printers)
    ])

    return shop
  },


  async handleJobSuccess(jobId, printerName) {
    if (!jobId)
      throw new Error('Job ID missing')

    await jobRepository.updateJobStatus(
      jobId,
      'PRINTED_SUCCESSFULLY',
      {
        printedPrinterName: printerName || ''
      }
    )

    const filePath = path.join(process.cwd(), 'uploads', 'jobs', `${jobId}.pdf`)

    try {
      await access(filePath)
      await unlink(filePath)

      console.log(`[Storage Cleanup] Deleted PDF for job #${jobId}`)
    } catch (error) {
      if (error.code !== 'ENOENT')
        console.warn(`[Storage Cleanup] Failed for job #${jobId}:`, error.message)
    }
  },


  async handleJobFailed(jobId, error) {
    if (!jobId)
      throw new Error('Job ID missing')

    await jobRepository.updateJobStatus(
      jobId,
      'PRINT_FAILED',
      {
        errorMessage:
          error || 'Hardware Print Error'
      }
    )
  },


  async handleDisconnect(socketId) {
    if (!socketId) return

    const agent = await agentRepository.disconnectSession(socketId)

    if (!agent) return

    const activeCount = await agentRepository.countActiveByShopId(agent.shopId)

    if (activeCount === 0)
      await shopRepository.setOnlineStatus(agent.shopId, false)
  }
}