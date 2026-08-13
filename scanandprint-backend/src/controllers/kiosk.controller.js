import fs from 'fs'
import path from 'path'
import { PrintJob } from '../models/PrintJob.model.js'
import { kioskService } from '../services/kiosk.service.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadToCloudinary } from '../utils/cloudinary.util.js'

import { ensurePdfBuffer } from '../utils/pdfConverter.util.js'

const uploadsJobsDir = path.join(process.cwd(), 'uploads', 'jobs')
if (!fs.existsSync(uploadsJobsDir)) {
  fs.mkdirSync(uploadsJobsDir, { recursive: true })
}

// get public shop info for kiosk
export const getPublicShopInfo = asyncHandler(async (req, res, next) => {
  const { shopCode } = req.params
  if (!shopCode)
    return sendError(res, 400, 'Shop Code is required')

  const shop = await kioskService.getShopInfo(shopCode)
  if (!shop) {
    return sendError(res, 404, 'Shop not found')
  }
  
  return sendSuccess(res, 200, 'Shop details loaded successfully', { shop })
})

// create a print job from kiosk (handles file upload to Cloudinary and local backup cache)
export const createPrintJob = asyncHandler(async (req, res, next) => {
  let uploadedCloudinaryUrl = null
  let fileBuffer = null
  let originalName =
    req.file?.originalname ||
    req.body.originalFileName ||
    'document.pdf'

  // 1. If file uploaded via Multer (multipart/form-data)
  if (req.file && req.file.buffer) {
    fileBuffer = req.file.buffer
    req.body.fileSizeBytes = req.file.size
  }
  // 2. If file passed as Base64 Data URL in body
  else if (req.body.fileUrl && req.body.fileUrl.startsWith('data:')) {
    const base64Data = req.body.fileUrl.replace(/^data:[^;]+;base64,/, '')
    fileBuffer = Buffer.from(base64Data, 'base64')
    req.body.fileSizeBytes = fileBuffer.length
  } else if (req.body.file && typeof req.body.file === 'string' && req.body.file.startsWith('data:')) {
    const base64Data = req.body.file.replace(/^data:[^;]+;base64,/, '')
    fileBuffer = Buffer.from(base64Data, 'base64')
    req.body.fileSizeBytes = fileBuffer.length
  } else if (req.body.fileDataUrl && req.body.fileDataUrl.startsWith('data:')) {
    const base64Data = req.body.fileDataUrl.replace(/^data:[^;]+;base64,/, '')
    fileBuffer = Buffer.from(base64Data, 'base64')
    req.body.fileSizeBytes = fileBuffer.length
  } else if (req.body.fileUrl && (req.body.fileUrl.startsWith('http://') || req.body.fileUrl.startsWith('https://'))) {
    uploadedCloudinaryUrl = req.body.fileUrl
  }

  // Convert ANY image format (PNG, JPG, WEBP) to standard A4 printable PDF
  if (fileBuffer) {
    fileBuffer = await ensurePdfBuffer(fileBuffer, originalName)
    req.body.fileSizeBytes = fileBuffer.length
    if (!originalName.toLowerCase().endsWith('.pdf')) {
      originalName = `${originalName}.pdf`
    }
  }

  // Upload to Cloudinary if we have a buffer
  if (fileBuffer) {
    try {
      const cloudinaryRes = await uploadToCloudinary(fileBuffer, originalName)
      if (cloudinaryRes?.secure_url) {
        uploadedCloudinaryUrl = cloudinaryRes.secure_url
      }
    } catch (cErr) {
      console.warn('[Cloudinary Notice]: Using local secure stream fallback:', cErr.message)
    }
  }

  // Create Job in Database
  req.body.fileUrl = uploadedCloudinaryUrl || (fileBuffer ? `data:application/pdf;base64,${fileBuffer.toString('base64')}` : '')
  req.body.originalFileName = originalName

  if (!req.body.fileUrl) {
    return sendError(res, 400, 'A valid document file is required.')
  }

  const result = await kioskService.createJob(req.body)
  const savedJob = result.job

  // Cache binary file locally on server for fast, guaranteed agent download
  if (fileBuffer && savedJob?.jobId) {
    const localJobFilePath = path.join(uploadsJobsDir, `${savedJob.jobId}.pdf`)
    fs.writeFileSync(localJobFilePath, fileBuffer)
  }

  return sendSuccess(res, 201, 'Print job created successfully', result)
})

// direct download / stream endpoint for print agents
export const downloadJobFile = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params
  const job = await PrintJob.findOne({ jobId })
  if (!job) {
    return sendError(res, 404, 'Print job not found')
  }

  // 1. Check local uploads cache
  const localJobFilePath = path.join(uploadsJobsDir, `${job.jobId}.pdf`)
  if (fs.existsSync(localJobFilePath)) {
    const stat = fs.statSync(localJobFilePath)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Length', stat.size)
    res.setHeader('Content-Disposition', `inline; filename="${job.originalFileName || 'document.pdf'}"`)
    return fs.createReadStream(localJobFilePath).pipe(res)
  }

  // 2. Check Base64 in fileUrl
  if (job.fileUrl && job.fileUrl.startsWith('data:')) {
    const base64Data = job.fileUrl.replace(/^data:[^;]+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Length', buffer.length)
    res.setHeader('Content-Disposition', `inline; filename="${job.originalFileName || 'document.pdf'}"`)
    return res.end(buffer)
  }

  // 3. Proxy fetch from Cloudinary / Remote URL
  if (job.fileUrl && (job.fileUrl.startsWith('http://') || job.fileUrl.startsWith('https://'))) {
    try {
      const response = await fetch(job.fileUrl)
      if (response.ok) {
        const arrayBuf = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuf)
        if (buffer.length > 0) {
          res.setHeader('Content-Type', response.headers.get('content-type') || 'application/pdf')
          res.setHeader('Content-Length', buffer.length)
          return res.end(buffer)
        }
      }
    } catch (e) {
      console.warn(`Proxy fetch failed for ${job.fileUrl}:`, e.message)
    }
  }

  return sendError(res, 404, 'Document file unavailable')
})

// verify payment for a print job from kiosk
export const verifyPayment = asyncHandler(async (req, res, next) => {
  const { jobId, paymentTxnId } = req.body
  const io = req.app.get('io')
  const job = await kioskService.verifyPayment(jobId, paymentTxnId, io)
  return sendSuccess(res, 200, 'Payment verified & print job dispatched!', { job })
})

