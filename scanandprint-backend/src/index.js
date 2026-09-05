import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';

import { envConfig } from './configs/env.config.js';
import { connectDB, disconnectDB } from './configs/db.configs.js';

import authRoutes from './routes/auth.routes.js';
import kioskRoutes from './routes/kiosk.routes.js';
import jobRoutes from './routes/job.routes.js';
import agentRoutes from './routes/agent.routes.js';
import adminRoutes from './routes/admin.route.js';
import deviceRoutes from './routes/device.routes.js';

import {
  notFoundHandler,
  globalErrorHandler,
} from './middlewares/error.middleware.js';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware.js';

import { setupSocket } from './socket.js';



//* App & HTTP Server
const app = express();
const server = http.createServer(app);

//* Allowed Origins
const normalizeOrigin = (origin) =>
  origin?.trim().replace(/\/+$/, '').toLowerCase();
const allowedOrigins = new Set(
  [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'https://www.scanandprint.in',

    ...(envConfig.clientUrl ? envConfig.clientUrl
      .split(',')
      .map(normalizeOrigin)
      .filter(Boolean)
      : []),
  ]
    .map(normalizeOrigin)
    .filter(Boolean)
);



//* CORS
const isOriginAllowed = (origin) => {
  if (!origin) return true;
  const normalizedOrigin = normalizeOrigin(origin);
  return allowedOrigins.has(normalizedOrigin);
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) return callback(null, true);
    console.warn(`[CORS Blocked] Origin: ${origin || 'unknown'}`);
    return callback(
      new Error('Origin is not allowed by CORS.')
    );
  },
  credentials: true,
  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'X-Requested-With',
    'x-shop-code',
    'x-secret-api-key',
  ],
  optionsSuccessStatus: 204,
};

//* Socket.IO
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  allowEIO3: false,
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.set('io', io);
setupSocket(io);


//* Express Configuration
app.set('trust proxy', 1);



//* Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(globalRateLimiter);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (envConfig.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

//* Health Check
app.get('/api/health', (req, res) => {
  const dbState = req.app.locals.dbState;
  const isDatabaseHealthy = dbState === 1;
  return res.status(
    isDatabaseHealthy ? 200 : 503
  ).json({
    success: isDatabaseHealthy,
    message: isDatabaseHealthy
      ? 'ScanAndPrint Backend is healthy.'
      : 'ScanAndPrint Backend is running but database is unavailable.',
    database: isDatabaseHealthy
      ? 'connected'
      : 'disconnected',
    environment: envConfig.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});


//* API Routes
app.use('/api/auth', authRoutes);
app.use('/api/kiosk', kioskRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/print-agent', agentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/devices', deviceRoutes);


//* Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);


//* Database Connection
const initializeDatabase = async () => {
  await connectDB();
  app.locals.dbState = 1;
  console.log('🟢 Database initialization completed.');
};


//* Start Server
const startServer = async () => {
  try {
    console.log('🚀 Starting ScanAndPrint backend...');
    await initializeDatabase();
    server.listen(envConfig.port, () => {
      console.log(`🚀 ScanAndPrint API running on port ${envConfig.port}`);
      console.log(`🌍 Environment: ${envConfig.nodeEnv}`);
      console.log(`❤️  Health: /api/health`);
    }
    );
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};


//* Graceful Shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
  try {
    server.close(async () => {
      console.log('✅ HTTP server closed.');
      try {
        await disconnectDB();
        console.log('✅ MongoDB connection closed.');
        console.log('👋 Server shutdown completed.');
        process.exit(0);
      } catch (error) {
        console.error('❌ MongoDB shutdown error:', error.message);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Graceful shutdown failed:', error.message);
    process.exit(1);
  }
};

process.once('SIGINT', () => gracefulShutdown('SIGINT'));
process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));


//* Unhandled Errors
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

startServer();