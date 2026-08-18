import dns from 'node:dns'
import express from 'express'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import { envConfig } from './configs/env.config.js'
import { connectDB } from './configs/db.configs.js'

import authRoutes from './routes/auth.routes.js'
import kioskRoutes from './routes/kiosk.routes.js'
import jobRoutes from './routes/job.routes.js'
import agentRoutes from './routes/agent.routes.js'
import adminRoutes from './routes/admin.route.js'

import { notFoundHandler, globalErrorHandler } from './middlewares/error.middleware.js'
import { setupSocket } from './socket.js'

dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
})

app.set('io', io)

const allowedOrigins = [
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://scan-and-print.vercel.app',
  'https://www.scanandprint.in/',
  ...(envConfig.clientUrl
    ? envConfig.clientUrl.split(',').map((u) => u.trim().replace(/\/+$/, ''))
    : []),
].filter(Boolean)

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    const cleanOrigin = origin.trim().replace(/\/+$/, '')
    const isExplicitlyAllowed = allowedOrigins.some(
      (allowed) => cleanOrigin.toLowerCase() === allowed.toLowerCase()
    )
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(cleanOrigin)
    const isVercelDomain = /^https:\/\/[a-zA-Z0-9_.-]+\.vercel\.app$/i.test(cleanOrigin)
    const isRenderDomain = /^https:\/\/[a-zA-Z0-9_.-]+\.onrender\.com$/i.test(cleanOrigin)
    if (isExplicitlyAllowed || isLocalhost || isVercelDomain || isRenderDomain)
      return callback(null, true)
    console.warn(`[CORS Blocked]: Origin "${origin}" is not allowed`)
    return callback(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-shop-code',
    'x-secret-api-key',
    'X-Requested-With',
    'Accept',
  ],
}

app.set('trust proxy', 1)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
if (envConfig.nodeEnv === 'development')
  app.use(morgan('dev'))



import fs from 'fs'

app.use(
  '/agent-ui',
  express.static(path.resolve(__dirname, '../../scanandprint-agent/src/ui'), {
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    },
  })
)
app.get('/agent', (req, res) => res.redirect('/agent-ui'))

// Direct Desktop Agent .exe installer download endpoint
app.get(['/download/agent', '/api/print-agent/download', '/downloads/Scan&Print_Agent_Setup_1.0.0.exe', '/downloads/QR_Se_Print_Agent_Setup_1.0.0.exe'], (req, res) => {
  const possiblePaths = [
    path.resolve(__dirname, '../../scanandprint-agent/dist/Scan&Print Agent Setup 1.0.0.exe'),
    path.resolve(__dirname, '../../scanandprint-frontend/public/downloads/Scan&Print_Agent_Setup_1.0.0.exe'),
  ]

  for (const exePath of possiblePaths) {
    if (fs.existsSync(exePath)) {
      return res.download(exePath, 'Scan&Print_Agent_Setup_1.0.0.exe')
    }
  }

  return res.status(404).json({ success: false, message: 'Desktop Agent installer executable not found.' })
})

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ScanAndPrint Backend Engine Server is Healthy & Operational',
    timestamp: new Date().toISOString(),
    env: envConfig.nodeEnv,
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/kiosk', kioskRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/print-agent', agentRoutes)
app.use('/api/admin', adminRoutes)

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
