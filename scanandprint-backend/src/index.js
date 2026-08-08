import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import { envConfig } from './configs/env.config.js'
import { connectDB } from './configs/db.configs.js'

import authRoutes from './routes/auth.routes.js'
import kioskRoutes from './routes/kiosk.routes.js'
import jobRoutes from './routes/job.routes.js'

import { notFoundHandler, globalErrorHandler } from './middlewares/error.middleware.js'
import { Shop } from './models/Shop.model.js'
import { PrintAgent } from './models/PrintAgent.model.js'
import { PrintJob } from './models/PrintJob.model.js'

// Initialize Express App & HTTP Server
const app = express()
const server = http.createServer(app)

// Initialize Socket.io Real-Time Engine
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

// Attach io instance to Express app for controllers to access
app.set('io', io)

// Global Middlewares
app.use(helmet())
app.use(cors({ origin: '*', credentials: true }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
if (envConfig.nodeEnv === 'development') {
  app.use(morgan('dev'))
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 QR PrintPe Backend Engine Server is Healthy & Operational',
    timestamp: new Date().toISOString(),
    env: envConfig.nodeEnv,
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/kiosk', kioskRoutes)
app.use('/api/jobs', jobRoutes)

// 404 & Global Error Handling Middlewares
app.use(notFoundHandler)
app.use(globalErrorHandler)

// Real-Time Socket.io Handshake & Event Listeners (Print Agent & Shop Rooms)
io.on('connection', (socket) => {
  console.log(`🔌 [Socket Connected]: ${socket.id}`)

  // Agent Register / Handshake Event
  socket.on('AGENT_REGISTER', async (data) => {
    try {
      const { shopId, secretApiKey, agentVersion, ipAddress } = data || {}

      let shop = null
      if (shopId && secretApiKey) {
        shop = await Shop.findOne({
          $or: [{ _id: shopId }, { shopCode: String(shopId).toUpperCase() }],
          secretApiKey,
        })
      }

      if (!shop) {
        console.warn(`⚠️ [Agent Handshake Refused]: Invalid credentials for socket ${socket.id}`)
        socket.emit('AGENT_AUTH_ERROR', { message: 'Invalid Shop Code or Secret Key' })
        return
      }

      // Join Socket to Shop Room
      const shopRoom = `shop:${shop.shopCode}`
      socket.join(shopRoom)

      // Record PrintAgent Session
      await PrintAgent.create({
        shopId: shop._id,
        socketId: socket.id,
        agentVersion: agentVersion || '1.0.0',
        ipAddress: ipAddress || socket.handshake.address,
        isConnected: true,
      })

      // Set Shop Online Status
      shop.isOnline = true
      shop.lastHeartbeatAt = new Date()
      await shop.save()

      console.log(`🟢 [Print Agent Online]: Shop ${shop.shopCode} joined room ${shopRoom}`)
      socket.emit('AGENT_CONNECTED', {
        success: true,
        shopCode: shop.shopCode,
        shopName: shop.shopName,
      })
    } catch (err) {
      console.error('❌ [Socket Handshake Error]:', err.message)
    }
  })

  // Print Job Completion Acknowledgment from Desktop Agent
  socket.on('JOB_SUCCESS', async (data) => {
    try {
      const { jobId, printerName } = data || {}
      if (jobId) {
        await PrintJob.findOneAndUpdate(
          { jobId },
          { status: 'PRINTED_SUCCESSFULLY', printedPrinterName: printerName || '' }
        )
        console.log(`✅ [Job Printed Successfully]: ${jobId} via printer ${printerName}`)
      }
    } catch (err) {
      console.error('❌ [JOB_SUCCESS Error]:', err.message)
    }
  })

  // Print Job Failure Notification from Desktop Agent
  socket.on('JOB_FAILED', async (data) => {
    try {
      const { jobId, error } = data || {}
      if (jobId) {
        await PrintJob.findOneAndUpdate(
          { jobId },
          { status: 'PRINT_FAILED', errorMessage: error || 'Hardware Print Error' }
        )
        console.error(`❌ [Job Print Failed]: ${jobId} - ${error}`)
      }
    } catch (err) {
      console.error('❌ [JOB_FAILED Error]:', err.message)
    }
  })

  // Disconnect Handler
  socket.on('disconnect', async () => {
    console.log(`🔌 [Socket Disconnected]: ${socket.id}`)
    try {
      const agent = await PrintAgent.findOne({ socketId: socket.id })
      if (agent) {
        agent.isConnected = false
        agent.disconnectedAt = new Date()
        await agent.save()

        // Check if shop has any other active connections
        const activeCount = await PrintAgent.countDocuments({
          shopId: agent.shopId,
          isConnected: true,
        })

        if (activeCount === 0) {
          await Shop.findByIdAndUpdate(agent.shopId, { isOnline: false })
          console.log(`🔴 [Shop Offline]: All agents disconnected for shop ID ${agent.shopId}`)
        }
      }
    } catch (err) {
      console.error('❌ [Disconnect Handler Error]:', err.message)
    }
  })
})

// Start Database & Express Web Server
const startServer = async () => {
  await connectDB()
  server.listen(envConfig.port, () => {
    console.log(`🚀 [QR PrintPe Server Running]: http://localhost:${envConfig.port} (Env: ${envConfig.nodeEnv})`)
  })
}

startServer()
