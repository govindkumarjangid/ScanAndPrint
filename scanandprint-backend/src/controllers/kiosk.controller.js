import fs from 'fs'
import path from 'path'
import { PrintJob } from '../models/PrintJob.model.js'
import { kioskService } from '../services/kiosk.service.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadToCloudinary } from '../utils/cloudinary.util.js'

import { ensurePdfBuffer } from '../utils/pdfConverter.util.js'

const uploadsJobsDir = path.join(process.cwd(), 'uploads', 'jobs')
if (!fs.existsSync(uploadsJobsDir))
  fs.mkdirSync(uploadsJobsDir, { recursive: true })

// convert to pdf
export function cleanToPdfFilename(filename) {
  if (!filename) return 'document.pdf'
  const nameWithoutExt = filename.replace(/(\.(png|jpg|jpeg|webp|docx|doc|pdf))+$/gi, '')
  return `${nameWithoutExt || 'document'}.pdf`
}

// get public shop info for kiosk
export const getPublicShopInfo = asyncHandler(async (req, res, next) => {
  const { shopCode } = req.params
  if (!shopCode)
    return sendError(res, 400, 'Shop Code is required')

  const shop = await kioskService.getShopInfo(shopCode)
  if (!shop)
    return sendError(res, 404, 'Shop not found')

  return sendSuccess(res, 200, 'Shop details loaded successfully', { shop })
})

// optimistic background pre-upload endpoint
export const preUploadFile = asyncHandler(async (req, res, next) => {
  let fileBuffer = null
  let originalName = req.file?.originalname || req.body.originalFileName || 'document.pdf'

  if (req.file && req.file.buffer) {
    fileBuffer = req.file.buffer
  } else if (req.body.fileUrl && req.body.fileUrl.startsWith('data:')) {
    const base64Data = req.body.fileUrl.replace(/^data:[^;]+;base64,/, '')
    fileBuffer = Buffer.from(base64Data, 'base64')
  } else if (req.body.fileDataUrl && req.body.fileDataUrl.startsWith('data:')) {
    const base64Data = req.body.fileDataUrl.replace(/^data:[^;]+;base64,/, '')
    fileBuffer = Buffer.from(base64Data, 'base64')
  }

  if (!fileBuffer || fileBuffer.length === 0) {
    return sendError(res, 400, 'No file content provided for pre-upload')
  }

  // Ensure PDF format and clean .pdf filename
  fileBuffer = await ensurePdfBuffer(fileBuffer, originalName)
  originalName = cleanToPdfFilename(originalName)

  const tempId = `TMP_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  const tempPath = path.join(uploadsJobsDir, `${tempId}.pdf`)
  fs.writeFileSync(tempPath, fileBuffer)

  // Start background Cloudinary upload optimistically
  uploadToCloudinary(fileBuffer, originalName).catch((cErr) => {
    console.warn('[Pre-upload Cloudinary Notice]:', cErr.message)
  })

  return sendSuccess(res, 200, 'File pre-uploaded successfully', {
    tempId,
    originalFileName: originalName,
    fileSizeBytes: fileBuffer.length,
  })
})

// single-flight atomic quick dispatch for Counter and Demo orders
export const quickDispatchPrintJob = asyncHandler(async (req, res, next) => {
  let fileBuffer = null
  let originalName = req.file?.originalname || req.body.originalFileName || 'document.pdf'
  const tempId = req.body.tempId

  // Check if file was pre-uploaded in Step 1
  if (tempId) {
    const tempPath = path.join(uploadsJobsDir, `${tempId}.pdf`)
    if (fs.existsSync(tempPath)) fileBuffer = fs.readFileSync(tempPath)

  }

  // 2. Fallback to direct Multer / Base64 upload
  if (!fileBuffer) {
    if (req.file && req.file.buffer) {
      fileBuffer = req.file.buffer
      req.body.fileSizeBytes = req.file.size
    } else if (req.body.fileUrl && req.body.fileUrl.startsWith('data:')) {
      const base64Data = req.body.fileUrl.replace(/^data:[^;]+;base64,/, '')
      fileBuffer = Buffer.from(base64Data, 'base64')
      req.body.fileSizeBytes = fileBuffer.length
    } else if (req.body.fileDataUrl && req.body.fileDataUrl.startsWith('data:')) {
      const base64Data = req.body.fileDataUrl.replace(/^data:[^;]+;base64,/, '')
      fileBuffer = Buffer.from(base64Data, 'base64')
      req.body.fileSizeBytes = fileBuffer.length
    }

    if (fileBuffer) {
      fileBuffer = await ensurePdfBuffer(fileBuffer, originalName)
      req.body.fileSizeBytes = fileBuffer.length
    }
  }

  originalName = cleanToPdfFilename(originalName)

  if (!fileBuffer && !req.body.fileUrl) {
    return sendError(res, 400, 'A valid document file is required for print dispatch.')
  }

  // Safe file payload handling: Never inject huge >1.5MB base64 into MongoDB documents
  req.body.originalFileName = originalName
  if (fileBuffer && fileBuffer.length <= 1.5 * 1024 * 1024) {
    req.body.fileUrl = `data:application/pdf;base64,${fileBuffer.toString('base64')}`
  } else if (!req.body.fileUrl || req.body.fileUrl.startsWith('data:')) {
    req.body.fileUrl = ''
  }

  const io = req.app.get('io')
  const savedJob = await kioskService.quickDispatchJob(req.body, io)

  if (io && savedJob) {
    const shopRoom = `shop:${savedJob.shopCode}`
    io.to(shopRoom).emit('NEW_PRINT_JOB', { job: savedJob })
    io.to(shopRoom).emit('JOB_STATUS_UPDATED', { jobId: savedJob.jobId, status: savedJob.status, job: savedJob })
    io.to('admin:room').emit('ADMIN_JOB_CREATED', { job: savedJob })
  }

  // Save guaranteed local fast download file for agent stream (<150ms download)
  if (fileBuffer && savedJob?.jobId) {
    const localJobFilePath = path.join(uploadsJobsDir, `${savedJob.jobId}.pdf`)
    fs.writeFileSync(localJobFilePath, fileBuffer)

    // Non-blocking asynchronous Cloudinary backup in background
    setImmediate(() => {
      uploadToCloudinary(fileBuffer, originalName)
        .then(async (cRes) => {
          if (cRes?.secure_url) {
            await PrintJob.updateOne({ jobId: savedJob.jobId }, { fileUrl: cRes.secure_url })
          }
        })
        .catch((cErr) => console.warn('[Async Cloudinary Backup Notice]:', cErr.message))
    })
  }

  return sendSuccess(res, 201, 'Print job dispatched instantly to printer!', { job: savedJob })
})

// create a print job from kiosk (handles file upload to Cloudinary and local backup cache)
export const createPrintJob = asyncHandler(async (req, res, next) => {
  let fileBuffer = null
  let originalName = req.file?.originalname || req.body.originalFileName || 'document.pdf'
  const tempId = req.body.tempId

  // Check pre-upload cache first
  if (tempId) {
    const tempPath = path.join(uploadsJobsDir, `${tempId}.pdf`)
    if (fs.existsSync(tempPath)) {
      fileBuffer = fs.readFileSync(tempPath)
    }
  }

  if (!fileBuffer) {
    if (req.file && req.file.buffer) {
      fileBuffer = req.file.buffer
      req.body.fileSizeBytes = req.file.size
    } else if (req.body.fileUrl && req.body.fileUrl.startsWith('data:')) {
      const base64Data = req.body.fileUrl.replace(/^data:[^;]+;base64,/, '')
      fileBuffer = Buffer.from(base64Data, 'base64')
      req.body.fileSizeBytes = fileBuffer.length
    } else if (req.body.fileDataUrl && req.body.fileDataUrl.startsWith('data:')) {
      const base64Data = req.body.fileDataUrl.replace(/^data:[^;]+;base64,/, '')
      fileBuffer = Buffer.from(base64Data, 'base64')
      req.body.fileSizeBytes = fileBuffer.length
    }

    if (fileBuffer) {
      fileBuffer = await ensurePdfBuffer(fileBuffer, originalName)
      req.body.fileSizeBytes = fileBuffer.length
    }
  }

  originalName = cleanToPdfFilename(originalName)
  req.body.originalFileName = originalName
  if (fileBuffer && fileBuffer.length <= 1.5 * 1024 * 1024) {
    req.body.fileUrl = `data:application/pdf;base64,${fileBuffer.toString('base64')}`
  } else if (!req.body.fileUrl || req.body.fileUrl.startsWith('data:')) {
    req.body.fileUrl = ''
  }

  if (!fileBuffer && !req.body.fileUrl) {
    return sendError(res, 400, 'A valid document file is required.')
  }

  const result = await kioskService.createJob(req.body)
  const savedJob = result.job

  const io = req.app.get('io')
  if (io && savedJob) {
    const shopRoom = `shop:${savedJob.shopCode}`
    io.to(shopRoom).emit('NEW_PRINT_JOB', { job: savedJob })
    io.to(shopRoom).emit('JOB_STATUS_UPDATED', { jobId: savedJob.jobId, status: savedJob.status, job: savedJob })
    io.to('admin:room').emit('ADMIN_JOB_CREATED', { job: savedJob })
  }

  // Cache binary file locally on server for fast, guaranteed agent download
  if (fileBuffer && savedJob?.jobId) {
    const localJobFilePath = path.join(uploadsJobsDir, `${savedJob.jobId}.pdf`)
    fs.writeFileSync(localJobFilePath, fileBuffer)

    // Non-blocking asynchronous Cloudinary backup in background
    setImmediate(() => {
      uploadToCloudinary(fileBuffer, originalName)
        .then(async (cRes) => {
          if (cRes?.secure_url) {
            await PrintJob.updateOne({ jobId: savedJob.jobId }, { fileUrl: cRes.secure_url })
          }
        })
        .catch((cErr) => console.warn('[Async Cloudinary Backup Notice]:', cErr.message))
    })
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

  // 1. Check local uploads cache (Fastest Path <100ms)
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
