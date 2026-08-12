import { kioskService } from '../services/kiosk.service.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadToCloudinary } from '../utils/cloudinary.util.js'

// get public shop info for kiosk
export const getPublicShopInfo = asyncHandler(async (req, res, next) => {
  const { shopCode } = req.params
  if (!shopCode)
    return sendError(res, 400, 'Shop Code is required')

  const shop = await kioskService.getShopInfo(shopCode)
  return sendSuccess(res, 200, 'Shop details loaded successfully', { shop })
})

// create a print job from kiosk (handles file upload to Cloudinary)
export const createPrintJob = asyncHandler(async (req, res, next) => {
  let uploadedCloudinaryUrl = null
  const originalName =
    req.file?.originalname ||
    req.body.originalFileName ||
    'document.pdf'

  // 1. If file uploaded via Multer (multipart/form-data)
  if (req.file && req.file.buffer) {
    const cloudinaryRes = await uploadToCloudinary(req.file.buffer, originalName)
    uploadedCloudinaryUrl = cloudinaryRes.secure_url
    req.body.fileSizeBytes = req.file.size
  }
  // 2. If file passed as Base64 Data URL in body
  else if (req.body.fileUrl && req.body.fileUrl.startsWith('data:')) {
    const cloudinaryRes = await uploadToCloudinary(req.body.fileUrl, originalName)
    uploadedCloudinaryUrl = cloudinaryRes.secure_url
  } else if (req.body.file && typeof req.body.file === 'string' && req.body.file.startsWith('data:')) {
    const cloudinaryRes = await uploadToCloudinary(req.body.file, originalName)
    uploadedCloudinaryUrl = cloudinaryRes.secure_url
  } else if (req.body.fileDataUrl && req.body.fileDataUrl.startsWith('data:')) {
    const cloudinaryRes = await uploadToCloudinary(req.body.fileDataUrl, originalName)
    uploadedCloudinaryUrl = cloudinaryRes.secure_url
  } else if (req.body.fileUrl && (req.body.fileUrl.startsWith('http://') || req.body.fileUrl.startsWith('https://'))) {
    uploadedCloudinaryUrl = req.body.fileUrl
  }

  if (uploadedCloudinaryUrl) {
    req.body.fileUrl = uploadedCloudinaryUrl
    req.body.originalFileName = originalName
  }

  if (!req.body.fileUrl || req.body.fileUrl.startsWith('data:')) {
    return sendError(res, 400, 'A valid document file is required. Could not upload to Cloudinary.')
  }

  const result = await kioskService.createJob(req.body)
  return sendSuccess(res, 201, 'Print job created successfully', result)
})


// verify payment for a print job from kiosk
export const verifyPayment = asyncHandler(async (req, res, next) => {
  const { jobId, paymentTxnId } = req.body
  const io = req.app.get('io')
  const job = await kioskService.verifyPayment(jobId, paymentTxnId, io)
  return sendSuccess(res, 200, 'Payment verified & print job dispatched!', { job })
})

