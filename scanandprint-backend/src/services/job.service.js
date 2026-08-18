import { jobRepository } from '../repositories/job.repository.js'

export const jobService = {

  // Get paginated jobs for a specific shop with optional status filter
  async getPaginatedJobs(shopId, queryParams) {
    const { status, limit = 20, page = 1 } = queryParams
    const skip = (Number(page) - 1) * Number(limit)

    const { jobs, totalCount } = await jobRepository.findPaginatedByShop(shopId, {
      status,
      skip,
      limit: Number(limit)
    })

    return {
      jobs,
      pagination: {
        totalCount,
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    }
  },

  // Get analytics data for a specific shop
  async getAnalytics(shopId) {
    return await jobRepository.getAnalyticsByShop(shopId)
  },

  // Get queued jobs for a specific shop by its code
  async getQueuedJobs(shopCode) {
    return await jobRepository.getQueuedJobsByShopCode(shopCode)
  },

  // Get job by jobId
  async getJobByJobId(jobId) {
    return await jobRepository.findByJobId(jobId)
  },

  // Update status of a job
  async updateStatus(jobId, status, extraData = {}) {
    return await jobRepository.updateJobStatus(jobId, status, extraData)
  },

  // Delete job by jobId and shopId
  async deleteJob(jobId, shopId) {
    return await jobRepository.deleteByJobId(jobId, shopId)
  },

}
