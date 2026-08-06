import mongoose from 'mongoose'
import { envConfig } from './env.config.js'

/**
 * High-performance, scalable MongoDB connection manager using Mongoose.
 * Implements connection pooling (maxPoolSize: 50), automatic index building,
 * and robust reconnect/error handling.
 */
export const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 50, // Maintain up to 50 socket connections for high throughput
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      autoIndex: true, // Auto-build indexes in dev/production
    }

    const conn = await mongoose.connect(envConfig.mongoUri, options)
    console.log(`✅ [MongoDB] Connected successfully to host: ${conn.connection.host} (DB: ${conn.connection.name})`)

    // Connection events listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ [MongoDB Connection Error]:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ [MongoDB Disconnected]: Reconnecting...')
    })

    return conn
  } catch (error) {
    console.error('❌ [MongoDB Initial Connection Failed]:', error.message)
    process.exit(1)
  }
}
