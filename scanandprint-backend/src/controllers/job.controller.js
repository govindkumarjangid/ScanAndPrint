import { jobService } from '../services/job.service.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { memoryCache } from '../utils/cache.util.js'
import { activeAgentsMap } from '../socket.js'

// get paginated jobs for a shop (with 5-second micro-cache to eliminate refresh spam)
export const getShopJobs = asyncHandler(async (req, res, next) => {
  const shopId = req.shop._id
  const { page = 1, limit = 10, status = '' } = req.query
  const cacheKey = `shop:${String(shopId)}:jobs:p${page}:l${limit}:s${status}`

  const cached = memoryCache.get(cacheKey)
  if (cached) {
    return sendSuccess(res, 200, 'Jobs retrieved (cached)', cached)
  }

  const result = await jobService.getPaginatedJobs(shopId, req.query)
  memoryCache.set(cacheKey, result, 5000) // 5s TTL

  return sendSuccess(res, 200, 'Jobs retrieved successfully', result)
})

// get analytics for a shop (with 5-second micro-cache)
export const getShopAnalytics = asyncHandler(async (req, res, next) => {
  const shopId = req.shop._id
  const cacheKey = `shop:${String(shopId)}:analytics`

  const cached = memoryCache.get(cacheKey)
  if (cached) {
    return sendSuccess(res, 200, 'Analytics retrieved (cached)', { analytics: cached })
  }

  const analytics = await jobService.getAnalytics(shopId)
  memoryCache.set(cacheKey, analytics, 5000) // 5s TTL

  return sendSuccess(res, 200, 'Analytics retrieved successfully', { analytics })
})

// trigger immediate hardware printing for a held/pending job
export const triggerPrintNow = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params
  const shopId = req.shop._id
  const io = req.app.get('io')

  const job = await jobService.getJobByJobId(jobId)
  if (!job) return res.status(404).json({ success: false, message: 'Print job not found' })

  if (String(job.shopId) !== String(shopId)) {
    return res.status(403).json({ success: false, message: 'Unauthorized access to this print job' })
  }

  const cleanShopCode = String(req.shop.shopCode || job.shopCode || '').trim().toUpperCase()
  const isAgentConnected = activeAgentsMap.has(cleanShopCode) || activeAgentsMap.has(String(shopId))

  // Update status to DISPATCHED_TO_AGENT / PRINTING
  const updatedJob = await jobService.updateStatus(jobId, 'DISPATCHED_TO_AGENT')
  memoryCache.invalidateShop(shopId)

  // Emit command to Desktop Agent socket room & direct socket
  if (io) {
    const shopRoom = `shop:${cleanShopCode}`

    const printPayload = {
      jobId: job.jobId,
      shopCode: cleanShopCode,
      fileUrl: job.fileUrl,
      downloadUrl: `/api/kiosk/download/${job.jobId}`,
      originalFileName: job.originalFileName,
      totalPages: job.totalPages,
      colorType: job.colorType,
      copies: job.copies,
      isDuplex: job.isDuplex,
      totalAmount: job.totalAmount,
    }

    io.to(shopRoom).emit('EXECUTE_PRINT_NOW', printPayload)

    // Also target direct socket ID if registered in activeAgentsMap
    const agentData = activeAgentsMap.get(cleanShopCode) || activeAgentsMap.get(String(shopId))
    if (agentData?.socketId) {
      io.to(agentData.socketId).emit('EXECUTE_PRINT_NOW', printPayload)
    }

    io.to(shopRoom).emit('JOB_STATUS_UPDATED', {
      jobId: job.jobId,
      status: 'DISPATCHED_TO_AGENT',
    })
  }

  return sendSuccess(res, 200, 'Print command dispatched to hardware printer', { job: updatedJob })
})

// cancel a print job and discard from hardware spooler/queue
export const cancelPrintJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params
  const shopId = req.shop._id
  const io = req.app.get('io')

  const job = await jobService.getJobByJobId(jobId)
  if (!job) return res.status(404).json({ success: false, message: 'Print job not found' })

  if (String(job.shopId) !== String(shopId)) {
    return res.status(403).json({ success: false, message: 'Unauthorized access to this print job' })
  }

  // Update status to PRINT_FAILED with cancellation reason
  const updatedJob = await jobService.updateStatus(jobId, 'PRINT_FAILED', {
    errorMessage: 'Cancelled by Shop Owner',
  })
  memoryCache.invalidateShop(shopId)

  // Emit cancel command to Desktop Agent to delete file from disk/queue
  if (io) {
    const cleanShopCode = String(req.shop.shopCode || job.shopCode || '').trim().toUpperCase()
    const shopRoom = `shop:${cleanShopCode}`

    io.to(shopRoom).emit('PRINT_JOB_CANCEL', { jobId: job.jobId })

    const agentData = activeAgentsMap.get(cleanShopCode) || activeAgentsMap.get(String(shopId))
    if (agentData?.socketId) {
      io.to(agentData.socketId).emit('PRINT_JOB_CANCEL', { jobId: job.jobId })
    }

    io.to(shopRoom).emit('JOB_STATUS_UPDATED', {
      jobId: job.jobId,
      status: 'PRINT_FAILED',
      errorMessage: 'Cancelled by Shop Owner',
    })
  }

  return sendSuccess(res, 200, 'Print job cancelled successfully', { job: updatedJob })
})

// delete a completed/failed print job from database and disk cache
export const deletePrintJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params
  const shopId = req.shop._id

  const job = await jobService.getJobByJobId(jobId)
  if (!job) return res.status(404).json({ success: false, message: 'Print job not found' })

  if (String(job.shopId) !== String(shopId)) {
    return res.status(403).json({ success: false, message: 'Unauthorized access to this print job' })
  }

  await jobService.deleteJob(jobId, shopId)
  memoryCache.invalidateShop(shopId)

  // Clean up any remaining cached upload file
  try {
    const fs = await import('fs')
    const path = await import('path')
    const filePath = path.join(process.cwd(), 'uploads', 'jobs', `${jobId}.pdf`)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (e) {}

  return sendSuccess(res, 200, 'Print job deleted successfully from database', { jobId })
})

// get queued jobs for a shop
export const getQueuedJobs = asyncHandler(async (req, res, next) => {
  const shopCode = req.shop.shopCode
  const queuedJobs = await jobService.getQueuedJobs(shopCode)
  return sendSuccess(res, 200, 'Queued jobs retrieved', { jobs: queuedJobs })
})
