import { agentService } from './services/agent.service.js'
import { shopRepository } from './repositories/shop.repository.js'

// In-Memory Live Active Agents for real-time online/offline status
export const activeAgentsMap = new Map()

/**
 * @param {import('socket.io').Server} io
 */
export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 [Socket Connected]: ${socket.id}`)

    // Dashboard Client Joins Shop Room to receive live status & live print jobs
    socket.on('JOIN_SHOP_DASHBOARD', async (data) => {
      const shopCode = String(data?.shopCode || '').trim().toUpperCase()
      if (shopCode) {
        const shopRoom = `shop:${shopCode}`
        socket.join(shopRoom)
        console.log(`👤 [Dashboard Connected]: Joined room ${shopRoom}`)

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

    // Agent periodic heartbeat event
    socket.on('AGENT_HEARTBEAT', async (data) => {
      const cleanShopCode = String(data?.shopId || socket.shopCode || '').trim().toUpperCase()
      if (cleanShopCode) {
        try {
          const shop = await shopRepository.findByCode(cleanShopCode)
          if (shop) {
            await shopRepository.updateById(shop._id, { isOnline: true, lastHeartbeatAt: new Date() })
          }
        } catch (e) {}
      }
    })

    // Agent Register / Handshake Event (Desktop Agent Connects)
    socket.on('AGENT_REGISTER', async (data) => {
      try {
        const shop = await agentService.registerAgent(data, socket.id)
        const cleanShopCode = String(shop.shopCode).trim().toUpperCase()

        socket.shopCode = cleanShopCode
        socket.isAgent = true

        const shopRoom = `shop:${cleanShopCode}`
        socket.join(shopRoom)

        // Register in In-Memory Map (both shopCode and shopId for instant lookup)
        const agentRecord = {
          socketId: socket.id,
          shopCode: cleanShopCode,
          shopId: shop._id,
          printers: shop.connectedPrinters || [],
          connectedAt: Date.now(),
        }
        activeAgentsMap.set(cleanShopCode, agentRecord)
        if (shop._id) {
          activeAgentsMap.set(String(shop._id), agentRecord)
        }

        console.log(`🟢 [Print Agent Online]: Shop ${cleanShopCode} is LIVE in room ${shopRoom}`)

        // Broadcast to Dashboard that Agent is LIVE
        io.to(shopRoom).emit('AGENT_STATUS_CHANGE', {
          isOnline: true,
          shopCode: cleanShopCode,
          printers: shop.connectedPrinters || [],
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
