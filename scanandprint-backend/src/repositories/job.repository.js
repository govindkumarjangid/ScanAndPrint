import { PrintJob } from '../models/PrintJob.model.js'

export const jobRepository = {
  async create(jobData) {
    return await PrintJob.create(jobData)
  },

  async findByJobId(jobId, options = {}) {
    let query = PrintJob.findOne({ jobId })
    if (options.lean) query = query.lean()
    return await query
  },

  async findPaginatedByShop(shopId, { status, skip, limit }) {
    const filter = { shopId }
    if (status) filter.status = status

    const [jobs, totalCount] = await Promise.all([
      PrintJob.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PrintJob.countDocuments(filter)
    ])

    return { jobs, totalCount }
  },

  async getAnalyticsByShop(shopId) {
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

    return stats[0] || {
      totalRevenue: 0,
      totalJobsCompleted: 0,
      totalPagesPrinted: 0,
      bwJobsCount: 0,
      colorJobsCount: 0,
    }
  },

  async updateJobStatus(jobId, status, extraData = {}) {
    return await PrintJob.findOneAndUpdate(
      { jobId },
      { status, ...extraData },
      { new: true }
    )
  },
  
  async getQueuedJobsByShopCode(shopCode) {
    return await PrintJob.find({
      shopCode,
      status: 'PAYMENT_VERIFIED', // or QUEUED if we rename it, using PAYMENT_VERIFIED per model
    }).lean()
  }
}
