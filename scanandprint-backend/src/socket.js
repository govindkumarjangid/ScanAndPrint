import { agentService } from './services/agent.service.js'

/**
 @param {import('socket.io').Server} io
 */

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 [Socket Connected]: ${socket.id}`)

    // Agent Register / Handshake Event
    socket.on('AGENT_REGISTER', async (data) => {
      try {
        const shop = await agentService.registerAgent(data, socket.id)

        const shopRoom = `shop:${shop.shopCode}`
        socket.join(shopRoom)

        console.log(`🟢 [Print Agent Online]: Shop ${shop.shopCode} joined room ${shopRoom}`)
        socket.emit('AGENT_CONNECTED', {
          success: true,
          shopCode: shop.shopCode,
          shopName: shop.shopName,
        })
      } catch (err) {
        console.warn(`⚠️ [Agent Handshake Refused]: ${err.message}`)
        socket.emit('AGENT_AUTH_ERROR', { message: err.message })
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
      } catch (err) {
        console.error('❌ [JOB_SUCCESS Error]:', err.message)
      }
    })

    // Print Job Failure Notification from Desktop Agent
    socket.on('JOB_FAILED', async (data) => {
      try {
        await agentService.handleJobFailed(data?.jobId, data?.error)
        console.error(`❌ [Job Print Failed]: ${data?.jobId} - ${data?.error}`)
      } catch (err) {
        console.error('❌ [JOB_FAILED Error]:', err.message)
      }
    })

    // Disconnect Handler
    socket.on('disconnect', async () => {
      console.log(`🔌 [Socket Disconnected]: ${socket.id}`)
      try {
        await agentService.handleDisconnect(socket.id)
      } catch (err) {
        console.error('❌ [Disconnect Handler Error]:', err.message)
      }
    })
  })
}
