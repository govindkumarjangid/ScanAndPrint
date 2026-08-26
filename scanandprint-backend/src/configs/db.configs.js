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

    let conn;
    try {
      conn = await mongoose.connect(envConfig.mongoUri, options);
    } catch (srvErr) {
      if (envConfig.mongoUri.startsWith('mongodb+srv://')) {
        console.warn('⚠️  SRV DNS lookup failed. Connecting via direct replica set hosts...');
        const fallbackUri = envConfig.mongoUri
          .replace('mongodb+srv://', 'mongodb://')
          .replace('scanandprintcluster.44thqhk.mongodb.net', 'ac-7q7a7h9-shard-00-00.44thqhk.mongodb.net:27017,ac-7q7a7h9-shard-00-01.44thqhk.mongodb.net:27017,ac-7q7a7h9-shard-00-02.44thqhk.mongodb.net:27017')
          + (envConfig.mongoUri.includes('?') ? '&' : '?') + 'ssl=true&authSource=admin';
        conn = await mongoose.connect(fallbackUri, options);
      } else {
        throw srvErr;
      }
    }

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