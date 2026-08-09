import { jobRepository } from '../repositories/job.repository.js'

export const jobService = {
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

  async getAnalytics(shopId) {
    return await jobRepository.getAnalyticsByShop(shopId)
  },
  
  async getQueuedJobs(shopCode) {
    return await jobRepository.getQueuedJobsByShopCode(shopCode)
  }
}
