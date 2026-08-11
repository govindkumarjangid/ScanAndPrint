import { jobService } from '../services/job.service.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// get paginated jobs for a shop
export const getShopJobs = asyncHandler(async (req, res, next) => {
  const shopId = req.shop._id
  const result = await jobService.getPaginatedJobs(shopId, req.query)
  return sendSuccess(res, 200, 'Jobs retrieved successfully', result)
})

// get analytics for a shop
export const getShopAnalytics = asyncHandler(async (req, res, next) => {
  const shopId = req.shop._id
  const analytics = await jobService.getAnalytics(shopId)
  return sendSuccess(res, 200, 'Analytics retrieved successfully', { analytics })
})

// get queued jobs for a shop
export const getQueuedJobs = asyncHandler(async (req, res, next) => {
  const shopCode = req.shop.shopCode
  const queuedJobs = await jobService.getQueuedJobs(shopCode)
  return sendSuccess(res, 200, 'Queued jobs retrieved', { jobs: queuedJobs })
})
