import { PrintJob } from '../models/PrintJob.model.js'
import mongoose from 'mongoose';

export const jobRepository = {

  async create(jobData) {
    return await PrintJob.create(jobData)
  },

  async findByJobId(jobId, options = {}) {
    let query = PrintJob.findOne({ jobId })
    if (options.lean) query = query.lean()
    return await query
  },

  async findPaginatedByShop(shopId, { status, skip = 0, limit = 10 }) {
    const objectId = mongoose.Types.ObjectId.isValid(shopId)
      ? new mongoose.Types.ObjectId(shopId)
      : shopId

    const filter = {
      $or: [{ shopId: objectId }, { shopId: String(shopId) }]
    }

    if (status && status !== 'ALL') {
      const s = String(status).toUpperCase()
      if (s.includes('PRINTED')) {
        filter.status = { $in: ['PRINTED_SUCCESSFULLY', 'COMPLETED', 'Printed', 'PRINTED'] }
      } else if (s.includes('DISPATCH')) {
        filter.status = { $in: ['DISPATCHED_TO_AGENT', 'DISPATCHED', 'Dispatch', 'Dispatched', 'PRINTING', 'IN_QUEUE'] }
      } else if (s.includes('FAIL') || s.includes('CANCEL')) {
        filter.status = { $in: ['PRINT_FAILED', 'FAILED', 'CANCELLED', 'REJECTED', 'Failed'] }
      } else if (s.includes('PENDING')) {
        filter.status = { $in: ['PENDING_PAYMENT', 'PAYMENT_VERIFIED', 'Pending', 'PENDING'] }
      } else {
        filter.status = status
      }
    }

    const [jobs, totalCount] = await Promise.all([
      PrintJob.find(filter)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean(),
      PrintJob.countDocuments(filter)
    ])

    return { jobs, totalCount }
  },

  async getAnalyticsByShop(shopId) {
    const objectId = mongoose.Types.ObjectId.isValid(shopId)
      ? new mongoose.Types.ObjectId(shopId)
      : shopId

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const stats = await PrintJob.aggregate([
      {
        $match: {
          $or: [{ shopId: objectId }, { shopId: String(shopId) }],
          status: { $in: ['PRINTED_SUCCESSFULLY', 'COMPLETED', 'completed', 'PAID', 'PRINTING'] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          todayRevenue: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', todayStart] }, '$totalAmount', 0],
            },
          },
          totalJobsCompleted: { $sum: 1 },
          totalPagesPrinted: {
            $sum: {
              $multiply: [
                { $ifNull: ['$totalPages', 1] },
                { $ifNull: ['$copies', 1] },
              ],
            },
          },
          bwJobsCount: {
            $sum: { $cond: [{ $eq: ['$colorType', 'BLACK_AND_WHITE'] }, 1, 0] },
          },
          colorJobsCount: {
            $sum: { $cond: [{ $eq: ['$colorType', 'COLOR'] }, 1, 0] },
          },
        },
      },
    ])

    return (
      stats[0] || {
        totalRevenue: 0,
        todayRevenue: 0,
        totalJobsCompleted: 0,
        totalPagesPrinted: 0,
        bwJobsCount: 0,
        colorJobsCount: 0,
      }
    )
  },

  async updateJobStatus(jobId, status, extraData = {}) {
    return await PrintJob.findOneAndUpdate(
      { jobId },
      { status, ...extraData },
      { returnDocument: 'after' }
    )
  },

  async getQueuedJobsByShopCode(shopCode) {
    return await PrintJob.find({
      shopCode,
      status: 'PAYMENT_VERIFIED',
    }).lean()
  }
}
