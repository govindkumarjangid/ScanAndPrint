import { v2 as cloudinary } from 'cloudinary';
import { envConfig } from './env.config.js';

cloudinary.config({
  cloud_name: envConfig.cloudinaryCloudName,
  api_key: envConfig.cloudinaryApiKey,
  api_secret: envConfig.cloudinaryApiSecret,
})

export { cloudinary };
export default cloudinary;