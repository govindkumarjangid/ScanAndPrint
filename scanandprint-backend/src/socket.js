import { agentService } from './services/agent.service.js'
import { shopRepository } from './repositories/shop.repository.js'
import { createSocketDeviceBindingMiddleware } from './middlewares/socketDeviceBinding.middleware.js'

// In-Memory Live Active Agents for real-time online/offline status
export const activeAgentsMap = new Map()

let ioInstance = null

export const getIo = () => ioInstance

/**
 * Disconnects and kicks a revoked/replaced device socket server-side
 */
export const kickRevokedDeviceSocket = (shopCode, targetDeviceId, reason = 'Another PC has been approved for this shop.') => {
  if (!ioInstance) return
  const cleanCode = String(shopCode || '').trim().toUpperCase()

  ioInstance.sockets.sockets.forEach((socket) => {
    if (socket.isAgent && socket.shopCode === cleanCode) {
      if (!targetDeviceId || socket.deviceId === String(targetDeviceId)) {
        console.log(`👢 [DeviceBinding] Kicking revoked agent socket ${socket.id} (Shop: ${cleanCode})`)
        socket.emit('AGENT_KICKED', {
          reason,
          code: 'DEVICE_REVOKED',
          timestamp: new Date().toISOString(),
        })
        socket.disconnect(true)
      }
    }
  })
}

/**
 * @param {import('socket.io').Server} io
 */
export const setupSocket = (io) => {
  ioInstance = io

  // Register Device-Binding Guard Middleware
  io.use(createSocketDeviceBindingMiddleware(io))

  io.on('connection', (socket) => {
    console.log(`🔌 [Socket Connected]: ${socket.id}`)

    // Dashboard Client Joins Shop Room to receive live status & live print jobs
    socket.on('JOIN_SHOP_DASHBOARD', async (data) => {
      const shopCode = String(data?.shopCode || '').trim().toUpperCase()
      const shopId = String(data?.shopId || '').trim()
      if (shopCode) {
        const shopRoom = `shop:${shopCode}`
        socket.join(shopRoom)
        console.log(`👤 [Dashboard Connected]: Joined room ${shopRoom}`)
      }
      if (shopId) {
        socket.join(`shop:${shopId}`)
      }

        let isOnline = activeAgentsMap.has(shopCode)
        const agentData = activeAgentsMap.get(shopCode)
        let printers = agentData?.printers || []

        if (!isOnline) {
          try {
            const shop = await shopRepository.findByCode(shopCode)
            if (shop && shop.isOnline && shop.lastHeartbeatAt) {
              const diffMs = Date.now() - new Date(shop.lastHeartbeatAt).getTime()
              if (diffMs < 90000) {
                isOnline = true
                printers = shop.connectedPrinters || []
              }
            }
          } catch (e) {}
        }

        socket.emit('AGENT_STATUS_CHANGE', {
          isOnline,
          shopCode,
          printers,
        })
      }
    })

    // Kiosk Client Joins Shop Room to receive live status & live print job updates
    socket.on('JOIN_KIOSK', async (data) => {
      const shopCode = String(data?.shopCode || '').trim().toUpperCase()
      if (shopCode) {
        const shopRoom = `shop:${shopCode}`
        socket.join(shopRoom)
        console.log(`📱 [Kiosk Connected]: Socket ${socket.id} joined room ${shopRoom}`)

        let isOnline = activeAgentsMap.has(shopCode)
        const agentData = activeAgentsMap.get(shopCode)
        let printers = agentData?.printers || []

        socket.emit('AGENT_STATUS_CHANGE', {
          isOnline,
          shopCode,
          printers,
        })
      }
    })

    // Admin Dashboard Client Joins Admin Room for live real-time telemetry
    socket.on('JOIN_ADMIN_ROOM', () => {
      socket.join('admin:room')
      console.log(`🛡️ [Admin Connected]: Socket ${socket.id} joined admin:room`)

      // Emit live real-time agents map to Admin immediately
      const liveList = []
      const seenShops = new Set()
      for (const [code, ag] of activeAgentsMap.entries()) {
        if (!seenShops.has(ag.shopCode)) {
          seenShops.add(ag.shopCode)
          liveList.push({
            shopCode: ag.shopCode,
            shopId: ag.shopId,
            socketId: ag.socketId,
            ipAddress: ag.ipAddress,
            localIp: ag.localIp,
            defaultGateway: ag.defaultGateway,
            agentVersion: ag.agentVersion,
            osPlatform: ag.osPlatform,
            printers: ag.printers,
            deviceFingerprint: ag.deviceFingerprint,
            meta: ag.meta,
            isOnline: true,
          })
        }
      }
      socket.emit('ADMIN_LIVE_AGENTS_SYNC', liveList)
    })

    // Manual Agent Status Ping from Dashboard
    socket.on('CHECK_AGENT_STATUS', async (data) => {
      const shopCode = String(data?.shopCode || '').trim().toUpperCase()
      let isOnline = activeAgentsMap.has(shopCode)
      const agentData = activeAgentsMap.get(shopCode)
      let printers = agentData?.printers || []

      if (!isOnline && shopCode) {
        try {
          const shop = await shopRepository.findByCode(shopCode)
          if (shop && shop.isOnline && shop.lastHeartbeatAt) {
            const diffMs = Date.now() - new Date(shop.lastHeartbeatAt).getTime()
            if (diffMs < 90000) {
              isOnline = true
              printers = shop.connectedPrinters || []
            }
          }
        } catch (e) {}
      }

      socket.emit('AGENT_STATUS_CHANGE', {
        isOnline,
        shopCode,
        printers,
      })
    })

    // Agent periodic heartbeat event (Purely In-Memory - 0 DB write spam)
    socket.on('AGENT_HEARTBEAT', (data) => {
      const cleanShopCode = String(data?.shopId || socket.shopCode || '').trim().toUpperCase()
      if (cleanShopCode && activeAgentsMap.has(cleanShopCode)) {
        const record = activeAgentsMap.get(cleanShopCode)
        record.lastHeartbeat = Date.now()
        activeAgentsMap.set(cleanShopCode, record)
      }
    })

function isVirtualOrLocal(ip) {
  if (!ip) return true
  const s = String(ip).replace(/^::ffff:/, '').trim()
  if (s === '127.0.0.1' || s === '::1' || s.startsWith('127.')) return true
  if (s.startsWith('169.254.')) return true
  if (s.startsWith('192.168.23.') || s.startsWith('192.168.248.') || s.startsWith('192.168.56.')) return true
  return false
}

function resolveClientIp(socket, data) {
  // 1. Exact physical adapter IP detected on counter machine
  const agentIp = data?.localIp || data?.ipAddress || data?.deviceMeta?.ipAddress || data?.meta?.ipAddress
  if (agentIp && !isVirtualOrLocal(agentIp)) {
    return String(agentIp).trim()
  }

  // 2. Proxied WAN IP
  const forwarded = socket.handshake?.headers?.['x-forwarded-for'] || socket.handshake?.headers?.['x-real-ip'] || socket.handshake?.headers?.['cf-connecting-ip']
  if (forwarded) {
    const rawIp = String(forwarded).split(',')[0].trim().replace(/^::ffff:/, '')
    if (rawIp && !isVirtualOrLocal(rawIp)) {
      return rawIp
    }
  }

  // 3. Socket TCP remote IP
  const socketAddress = socket.handshake?.address || socket.conn?.remoteAddress || ''
  const cleanSocketAddress = String(socketAddress).replace(/^::ffff:/, '').trim()
  if (cleanSocketAddress && !isVirtualOrLocal(cleanSocketAddress)) {
    return cleanSocketAddress
  }

  // 4. Public WAN IP
  if (data?.publicIp && !isVirtualOrLocal(data.publicIp)) {
    return String(data.publicIp).trim()
  }

  return agentIp || cleanSocketAddress || '127.0.0.1'
}

    // Agent Register / Handshake Event (Desktop Agent Connects)
    socket.on('AGENT_REGISTER', async (data) => {
      try {
        const detectedIp = resolveClientIp(socket, data)
        const shop = await agentService.registerAgent({ ...data, ipAddress: detectedIp }, socket.id, detectedIp)
        const cleanShopCode = String(shop.shopCode).trim().toUpperCase()

        socket.shopCode = cleanShopCode
        socket.isAgent = true

        const shopRoom = `shop:${cleanShopCode}`
        socket.join(shopRoom)

        const detectedPlatform = data?.osPlatform || data?.osArch || (data?.platform === 'win32' ? 'Windows x64' : data?.platform) || 'Windows'
        const detectedVersion = data?.agentVersion || '1.0.3'

        const liveMeta = {
          hostname: data?.hostname || data?.deviceMeta?.hostname || '',
          platform: data?.platform || data?.deviceMeta?.platform || 'Windows',
          arch: data?.deviceMeta?.arch || 'x64',
          cpuModel: data?.deviceMeta?.cpuModel || '',
          motherboardSerial: data?.deviceMeta?.motherboardSerial || '',
          systemUuid: data?.deviceMeta?.systemUuid || '',
          totalMemoryGb: data?.deviceMeta?.totalMemoryGb || 0,
          ipAddress: detectedIp,
          localIp: data?.localIp || detectedIp,
          defaultGateway: data?.deviceMeta?.defaultGateway || data?.defaultGateway || '',
        }

        // Register in In-Memory Map (both shopCode and shopId for instant lookup)
        const agentRecord = {
          socketId: socket.id,
          shopCode: cleanShopCode,
          shopId: shop._id,
          ipAddress: detectedIp,
          localIp: data?.localIp || detectedIp,
          defaultGateway: liveMeta.defaultGateway,
          agentVersion: detectedVersion,
          osPlatform: detectedPlatform,
          printers: shop.connectedPrinters || [],
          deviceFingerprint: data?.deviceFingerprint || '',
          meta: liveMeta,
          connectedAt: Date.now(),
        }
        activeAgentsMap.set(cleanShopCode, agentRecord)
        if (shop._id) {
          activeAgentsMap.set(String(shop._id), agentRecord)
        }

        console.log(`🟢 [Print Agent Online]: Shop ${cleanShopCode} is LIVE with IP ${detectedIp} (Gateway: ${liveMeta.defaultGateway || 'N/A'})`)

        // Broadcast to Dashboard that Agent is LIVE
        const statusPayload = {
          isOnline: true,
          shopCode: cleanShopCode,
          shopId: shop._id,
          printers: shop.connectedPrinters || [],
          socketId: socket.id,
          ipAddress: detectedIp,
          localIp: data?.localIp || detectedIp,
          defaultGateway: liveMeta.defaultGateway,
          agentVersion: detectedVersion,
          osPlatform: detectedPlatform,
          deviceFingerprint: data?.deviceFingerprint || '',
          meta: liveMeta,
        }

        io.to(shopRoom).emit('AGENT_STATUS_CHANGE', statusPayload)
        io.to('admin:room').emit('AGENT_STATUS_CHANGE', statusPayload)
        io.to('admin:room').emit('ADMIN_LIVE_AGENT_UPDATE', statusPayload)
        io.to('admin:room').emit('ADMIN_DEVICE_UPDATED', {
          shopCode: cleanShopCode,
          shopId: shop._id,
          deviceFingerprint: data?.deviceFingerprint || '',
          meta: liveMeta,
          status: 'APPROVED',
        })
        io.to('admin:room').emit('ADMIN_SHOP_UPDATED', {
          shopCode: cleanShopCode,
          isOnline: true,
          connectedPrinters: shop.connectedPrinters || [],
        })

        socket.emit('AGENT_CONNECTED', {
          success: true,
          shopCode: cleanShopCode,
          shopName: shop.shopName,
          connectedPrinters: shop.connectedPrinters || [],
        })
      } catch (err) {
        console.warn(`⚠️ [Agent Handshake Refused]: ${err.message}`)
        socket.emit('AGENT_AUTH_ERROR', { message: err.message })
      }
    })

    // Agent reports updated printers
    socket.on('AGENT_PRINTERS_UPDATED', async (data) => {
      try {
        const cleanShopCode = String(data?.shopId || socket.shopCode || '').trim().toUpperCase()
        if (cleanShopCode && Array.isArray(data?.printers)) {
          await agentService.updateConnectedPrinters(cleanShopCode, data.printers)

          if (activeAgentsMap.has(cleanShopCode)) {
            const current = activeAgentsMap.get(cleanShopCode)
            current.printers = data.printers
            activeAgentsMap.set(cleanShopCode, current)
          }

          io.to(`shop:${cleanShopCode}`).emit('AGENT_STATUS_CHANGE', {
            isOnline: true,
            shopCode: cleanShopCode,
            printers: data.printers,
          })
          io.to('admin:room').emit('AGENT_STATUS_CHANGE', {
            isOnline: true,
            shopCode: cleanShopCode,
            printers: data.printers,
          })

          console.log(`🖨️ [Printers Synced]: Shop ${cleanShopCode} has ${data.printers.length} connected printers`)
        }
      } catch (err) {
        console.error('❌ [AGENT_PRINTERS_UPDATED Error]:', err.message)
      }
    })

    // Print Job Acceptance Acknowledgment from Desktop Agent
    socket.on('job:accepted', (data) => {
      console.log(`⏳ [Job Accepted by Agent]: ${data?.jobId}`)
    })

    // Print Job Completion Acknowledgment from Desktop Agent
    socket.on('JOB_SUCCESS', async (data) => {
      try {
        await agentService.handleJobSuccess(data?.jobId, data?.printerName)
        console.log(`✅ [Job Printed Successfully]: ${data?.jobId} via printer ${data?.printerName}`)

        if (socket.shopCode) {
          io.to(`shop:${socket.shopCode}`).emit('JOB_STATUS_UPDATED', {
            jobId: data?.jobId,
            status: 'PRINTED_SUCCESSFULLY',
          })
        }
      } catch (err) {
        console.error('❌ [JOB_SUCCESS Error]:', err.message)
      }
    })

    // Print Job Failure Notification from Desktop Agent
    socket.on('JOB_FAILED', async (data) => {
      try {
        await agentService.handleJobFailed(data?.jobId, data?.error)
        console.error(`❌ [Job Print Failed]: ${data?.jobId} - ${data?.error}`)

        if (socket.shopCode) {
          io.to(`shop:${socket.shopCode}`).emit('JOB_STATUS_UPDATED', {
            jobId: data?.jobId,
            status: 'PRINT_FAILED',
            error: data?.error,
          })
        }
      } catch (err) {
        console.error('❌ [JOB_FAILED Error]:', err.message)
      }
    })

    // Disconnect Handler
    socket.on('disconnect', async () => {
      console.log(`🔌 [Socket Disconnected]: ${socket.id}`)

      if (socket.shopCode && socket.isAgent) {
        const current = activeAgentsMap.get(socket.shopCode)
        if (current && current.socketId === socket.id) {
          activeAgentsMap.delete(socket.shopCode)
          if (current.shopId) {
            activeAgentsMap.delete(String(current.shopId))
          }
          const shopRoom = `shop:${socket.shopCode}`

          console.log(`🔴 [Print Agent Offline]: Shop ${socket.shopCode} disconnected`)
          io.to(shopRoom).emit('AGENT_STATUS_CHANGE', {
            isOnline: false,
            shopCode: socket.shopCode,
            printers: [],
          })
          io.to('admin:room').emit('AGENT_STATUS_CHANGE', {
            isOnline: false,
            shopCode: socket.shopCode,
            printers: [],
          })
        }
      }

      try {
        await agentService.handleDisconnect(socket.id)
      } catch (err) {
        console.error('❌ [Disconnect Handler Error]:', err.message)
      }
    })
  })
}
