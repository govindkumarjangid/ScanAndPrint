import { jobService } from '../services/job.service.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'

export const getShopJobs = async (req, res, next) => {
  try {
    const shopId = req.shop._id
    const result = await jobService.getPaginatedJobs(shopId, req.query)

    return sendSuccess(res, 200, 'Jobs retrieved successfully', result)
  } catch (error) {
    next(error)
  }
}

export const getShopAnalytics = async (req, res, next) => {
  try {
    const shopId = req.shop._id
    const analytics = await jobService.getAnalytics(shopId)

    return sendSuccess(res, 200, 'Analytics retrieved successfully', { analytics })
  } catch (error) {
    next(error)
  }
}

export const getQueuedJobs = async (req, res, next) => {
  try {
    // Authenticated by authenticateAgent, so we have req.shop
    const shopCode = req.shop.shopCode
    const queuedJobs = await jobService.getQueuedJobs(shopCode)

    return sendSuccess(res, 200, 'Queued jobs retrieved', { jobs: queuedJobs })
  } catch (error) {
    next(error)
  }
}
