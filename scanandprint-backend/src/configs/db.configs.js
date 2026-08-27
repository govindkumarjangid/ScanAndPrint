import mongoose from 'mongoose';
import { envConfig } from './env.config.js';
import dns from 'node:dns';

if (envConfig.nodeEnv === 'development')
  dns.setServers(['1.1.1.1', '8.8.8.8']);

let isConnected = false;

const connectDB = async () => {

  if (!envConfig.mongoUri)
    throw new Error("MONGO_URI is not defined.");

  if (mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB already connected.');
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    console.log('⏳ MongoDB connection is already in progress...');
    return mongoose.connection;
  }

  const options = {
    dbName: 'ScanAndPrintDB',
    serverSelectionTimeoutMS: 10_000,   // Connection timeout
    connectTimeoutMS: 10_000,    // TCP connection timeout
    socketTimeoutMS: 45_000,     // Socket timeout
    maxPoolSize: 10,     // Connection pool
    minPoolSize: 2,
    heartbeatFrequencyMS: 10_000,  // Faster detection of broken connections
    retryWrites: true,   // Retry writes when supported
    bufferCommands: false, // Keep application from buffering queries forever
  };

  try {
    console.log('⏳ Connecting to MongoDB...');

    await mongoose.connect(envConfig.mongoUri, options);

    isConnected = true;

    console.log(`✅ MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

    return mongoose.connection;
  } catch (error) {
    isConnected = false;

    console.error('❌ MongoDB connection failed:', error.message);

    throw error;
  }

};

mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('🟢 MongoDB connected');
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('🟡 MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('🟢 MongoDB reconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('🔴 MongoDB error:', error.message);
});


const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('🛑 MongoDB connection closed.');
    }
  } catch (error) {
    console.error(
      '❌ Error while closing MongoDB:',
      error.message
    );
  }
};

process.once('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.once('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

export {
  connectDB,
  disconnectDB,
  isConnected,
};
