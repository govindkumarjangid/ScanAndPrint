import dns from 'node:dns'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

import { envConfig } from './configs/env.config.js'
import { connectDB } from './configs/db.configs.js'

import authRoutes from './routes/auth.routes.js'
import kioskRoutes from './routes/kiosk.routes.js'
import jobRoutes from './routes/job.routes.js'
import agentRoutes from './routes/agent.routes.js'

import { notFoundHandler, globalErrorHandler } from './middlewares/error.middleware.js'
import { setupSocket } from './socket.js'

dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

app.set('io', io)

app.use(helmet())
app.use(cors({ origin: envConfig.clientUrl, credentials: true }))
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
if (envConfig.nodeEnv === 'development') {
  app.use(morgan('dev'))
}

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 QR PrintPe Backend Engine Server is Healthy & Operational',
    timestamp: new Date().toISOString(),
    env: envConfig.nodeEnv,
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/kiosk', kioskRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/print-agent', agentRoutes)

app.use(notFoundHandler)
app.use(globalErrorHandler)

setupSocket(io)

const startServer = async () => {
  await connectDB()
  server.listen(envConfig.port, () => {
    console.log(`🚀 [ScanAndPrint Server Running]: http://localhost:${envConfig.port} (Env: ${envConfig.nodeEnv})`)
  })
}

startServer()
