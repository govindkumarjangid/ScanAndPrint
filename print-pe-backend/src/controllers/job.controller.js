import { PrintJob } from '../models/PrintJob.model.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'

/**
 * Get All Print Jobs for Authenticated Shop Dashboard
 * GET /api/jobs
 */
export const getShopJobs = async (req, res, next) => {
  try {
    const shopId = req.shop._id
    const { status, limit = 20, page = 1 } = req.query

    const filter = { shopId }
    if (status) {
      filter.status = status
    }

    const skip = (Number(page) - 1) * Number(limit)

    // Ultra-fast indexed query with total count
    const [jobs, totalCount] = await Promise.all([
      PrintJob.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      PrintJob.countDocuments(filter),
    ])

    return sendSuccess(res, 200, 'Jobs retrieved successfully', {
      jobs,
      pagination: {
        totalCount,
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get Shop Revenue & Order Analytics Snapshot
 * GET /api/jobs/analytics
 */
export const getShopAnalytics = async (req, res, next) => {
  try {
    const shopId = req.shop._id

    // Aggregation pipeline for total revenue and job metrics
    const stats = await PrintJob.aggregate([
      { $match: { shopId, status: { $ne: 'PENDING_PAYMENT' } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalJobsCompleted: { $sum: 1 },
          totalPagesPrinted: { $sum: '$totalPages' },
          bwJobsCount: {
            $sum: { $cond: [{ $eq: ['$colorType', 'BLACK_AND_WHITE'] }, 1, 0] },
          },
          colorJobsCount: {
            $sum: { $cond: [{ $eq: ['$colorType', 'COLOR'] }, 1, 0] },
          },
        },
      },
    ])

    const analytics = stats[0] || {
      totalRevenue: 0,
      totalJobsCompleted: 0,
      totalPagesPrinted: 0,
      bwJobsCount: 0,
      colorJobsCount: 0,
    }

    return sendSuccess(res, 200, 'Analytics retrieved successfully', { analytics })
  } catch (error) {
    next(error)
  }
}
