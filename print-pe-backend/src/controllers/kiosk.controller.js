import { Shop } from '../models/Shop.model.js'
import { PrintJob } from '../models/PrintJob.model.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'

/**
 * Get Public Shop Info for Customer Kiosk Landing Page
 * GET /api/kiosk/:shopCode
 */
export const getPublicShopInfo = async (req, res, next) => {
  try {
    const { shopCode } = req.params

    if (!shopCode) {
      return sendError(res, 400, 'Shop Code is required')
    }

    // Fast indexed query returning lean public shop data
    const shop = await Shop.findOne({ shopCode: shopCode.toUpperCase() })
      .select('shopCode shopName ownerName address bwRate colorRate printerBrand isOnline')
      .lean()

    if (!shop) {
      return sendError(res, 404, 'Shop not found. Please verify the QR Code.')
    }

    return sendSuccess(res, 200, 'Shop details loaded successfully', { shop })
  } catch (error) {
    next(error)
  }
}

/**
 * Create a New Customer Print Job
 * POST /api/kiosk/create-job
 */
export const createPrintJob = async (req, res, next) => {
  try {
    const {
      shopCode,
      customerPhone,
      originalFileName,
      fileUrl,
      fileSizeBytes,
      totalPages,
      colorType,
      copies,
      isDuplex,
    } = req.body

    if (!shopCode || !originalFileName || !fileUrl || !totalPages) {
      return sendError(res, 400, 'Missing required job parameters (shopCode, originalFileName, fileUrl, totalPages)')
    }

    // Verify Shop exists
    const shop = await Shop.findOne({ shopCode: shopCode.toUpperCase() }).lean()
    if (!shop) {
      return sendError(res, 404, 'Invalid Shop Code')
    }

    // Calculate Exact Cost
    const numCopies = Math.max(1, Number(copies) || 1)
    const numPages = Math.max(1, Number(totalPages) || 1)
    const isColor = colorType === 'COLOR'
    const ratePerPage = isColor ? shop.colorRate : shop.bwRate
    const totalAmount = numPages * numCopies * ratePerPage

    // Auto-generate Unique Job ID (e.g. JOB_98234_17382910)
    const jobId = `JOB_${shop.shopCode}_${Date.now().toString().slice(-6)}`

    // Create PrintJob Document
    const printJob = await PrintJob.create({
      jobId,
      shopId: shop._id,
      shopCode: shop.shopCode,
      customerPhone: customerPhone || '',
      originalFileName,
      fileUrl,
      fileSizeBytes: fileSizeBytes || 0,
      totalPages: numPages,
      colorType: isColor ? 'COLOR' : 'BLACK_AND_WHITE',
      copies: numCopies,
      isDuplex: !!isDuplex,
      bwPages: isColor ? 0 : numPages,
      colorPages: isColor ? numPages : 0,
      bwRateApplied: shop.bwRate,
      colorRateApplied: shop.colorRate,
      totalAmount,
      status: 'PENDING_PAYMENT',
    })

    // Generate Dynamic UPI Intent String for Instant Payment
    const upiIntentUrl = `upi://pay?pa=qrseprint@ybl&pn=${encodeURIComponent(
      shop.shopName
    )}&am=${totalAmount.toFixed(2)}&tr=${jobId}&tn=Print_Job_${jobId}&cu=INR`

    return sendSuccess(res, 201, 'Print job created successfully', {
      job: printJob,
      upiIntentUrl,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Verify Payment & Trigger Real-Time Socket Dispatch
 * POST /api/kiosk/payment/verify
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { jobId, paymentTxnId } = req.body

    if (!jobId) {
      return sendError(res, 400, 'Job ID is required')
    }

    // Find PrintJob
    const job = await PrintJob.findOne({ jobId })
    if (!job) {
      return sendError(res, 404, 'Print job not found')
    }

    // Update status to PAYMENT_VERIFIED
    job.status = 'PAYMENT_VERIFIED'
    job.paymentTxnId = paymentTxnId || `TXN_${Date.now()}`
    await job.save()

    // Real-Time Socket Dispatch via io instance attached to app
    const io = req.app.get('io')
    if (io) {
      const targetRoom = `shop:${job.shopCode}`
      console.log(`⚡ [Socket Dispatch] Emitting PRINT_JOB_DISPATCH to room ${targetRoom} for Job ${job.jobId}`)

      io.to(targetRoom).emit('PRINT_JOB_DISPATCH', {
        jobId: job.jobId,
        shopCode: job.shopCode,
        fileUrl: job.fileUrl,
        originalFileName: job.originalFileName,
        totalPages: job.totalPages,
        colorType: job.colorType,
        copies: job.copies,
        isDuplex: job.isDuplex,
        totalAmount: job.totalAmount,
      })

      // Update status to DISPATCHED_TO_AGENT
      job.status = 'DISPATCHED_TO_AGENT'
      await job.save()
    }

    return sendSuccess(res, 200, 'Payment verified & print job dispatched!', { job })
  } catch (error) {
    next(error)
  }
}
