import mongoose from 'mongoose';
import { envConfig } from './env.config.js';

export const connectDB = async () => {
  try {
    if (!envConfig.mongoUri)
      throw new Error("MONGO_URI is not defined in the environment variables.");

    console.log('⏳ Attempting to connect to MongoDB...');

    if (mongoose.connection.readyState !== 0)
      await mongoose.disconnect();

    const options = { serverSelectionTimeoutMS: 5000, dbName: 'ScanAndPrintDB' };

    const conn = await mongoose.connect(envConfig.mongoUri, options);

    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('🔴 MongoDB disconnected! Trying to reconnect...');
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;