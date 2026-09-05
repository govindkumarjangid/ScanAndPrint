import dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ScanAndPrintDB').trim().replace(/['"]/g, ''),
  jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'scan_and_print_super_secret_jwt_key_2026'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminEmail: (process.env.ADMIN_EMAIL || 'scanqrandprint@gmail.com').trim().toLowerCase(),
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').trim().replace(/\/+$/, ''),
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
}

if (envConfig.nodeEnv === 'production' && !envConfig.jwtSecret) {
  console.error('FATAL: JWT_SECRET environment variable must be set in production mode!')
}