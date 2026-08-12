import { cloudinary } from '../configs/cloudinary.config.js'

/**
 * Uploads a Buffer directly to Cloudinary using upload_stream.
 * @param {Buffer} fileBuffer
 * @param {string} originalFileName
 * @returns {Promise<import('cloudinary').UploadApiResponse>}
 */

export const uploadBufferToCloudinary = (fileBuffer, originalFileName = 'document.pdf') => {
  return new Promise((resolve, reject) => {
    const cleanFileName = originalFileName.replace(/[^a-zA-Z0-9_.-]/g, '_')
    const fileNameWithoutExt = cleanFileName.replace(/\.[^/.]+$/, '')

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'scanandprint_jobs',
        resource_type: 'auto',
        public_id: `${Date.now()}_${fileNameWithoutExt}`,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Buffer Upload Error]:', error)
          return reject(new Error(error.message || 'Cloudinary buffer upload failed'))
        }
        console.log('[Cloudinary Buffer Upload Success]:', result.secure_url)
        resolve(result)
      }
    )

    uploadStream.end(fileBuffer)
  })
}

/**
 * Uploads a Base64 data string
 * @param {string} base64String
 * @param {string} originalFileName
 * @returns {Promise<import('cloudinary').UploadApiResponse>}
 */
export const uploadBase64ToCloudinary = async (base64String, originalFileName = 'document.png') => {
  try {
    const cleanFileName = originalFileName.replace(/[^a-zA-Z0-9_.-]/g, '_')
    const fileNameWithoutExt = cleanFileName.replace(/\.[^/.]+$/, '')

    const result = await cloudinary.uploader.upload(base64String, {
      folder: 'scanandprint_jobs',
      resource_type: 'auto',
      public_id: `${Date.now()}_${fileNameWithoutExt}`,
      use_filename: true,
      unique_filename: true,
    })
    console.log('✅ [Cloudinary Base64 Upload Success]:', result.secure_url)
    return result
  } catch (error) {
    console.error('❌ [Cloudinary Base64 Upload Error]:', error)
    throw new Error(error.message || 'Cloudinary base64 upload failed')
  }
}

/**
 * Unified Cloudinary upload helper: accepts Buffer, Base64 String, or URL.
 * @param {Buffer|string} fileInput
 * @param {string} originalFileName
 * @returns {Promise<import('cloudinary').UploadApiResponse>}
 */

export const uploadToCloudinary = async (fileInput, originalFileName = 'document.pdf') => {
  if (!fileInput)
    throw new Error('No file provided for upload')

  if (Buffer.isBuffer(fileInput))
    return await uploadBufferToCloudinary(fileInput, originalFileName)

  if (typeof fileInput === 'string' && fileInput.startsWith('data:'))
    return await uploadBase64ToCloudinary(fileInput, originalFileName)

  if (typeof fileInput === 'string' && (fileInput.startsWith('http://') || fileInput.startsWith('https://')))
    return { secure_url: fileInput }


  throw new Error('Unsupported file format for Cloudinary upload')
}
