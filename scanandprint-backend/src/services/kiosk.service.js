import { shopRepository } from '../repositories/shop.repository.js'
import { jobRepository } from '../repositories/job.repository.js'

export const kioskService = {
  async getShopInfo(shopCode) {
    const shop = await shopRepository.findByCode(shopCode, {
      select: 'shopCode shopName ownerName address bwRate colorRate printerBrand isOnline',
      lean: true,
    })
    if (!shop) throw new Error('Shop not found')
    return shop
  },

  async createJob(jobData) {
    const { shopCode, copies, totalPages, colorType } = jobData

    const shop = await shopRepository.findByCode(shopCode, { lean: true })
    if (!shop) throw new Error('Invalid Shop Code')

    const numCopies = Math.max(1, Number(copies) || 1)
    const numPages = Math.max(1, Number(totalPages) || 1)
    const isColor = colorType === 'COLOR'
    const ratePerPage = isColor ? shop.colorRate : shop.bwRate
    const totalAmount = numPages * numCopies * ratePerPage

    const jobId = `JOB_${shop.shopCode}_${Date.now().toString().slice(-6)}`

    const printJob = await jobRepository.create({
      ...jobData,
      jobId,
      shopId: shop._id,
      totalPages: numPages,
      copies: numCopies,
      bwPages: isColor ? 0 : numPages,
      colorPages: isColor ? numPages : 0,
      bwRateApplied: shop.bwRate,
      colorRateApplied: shop.colorRate,
      totalAmount,
      status: 'PENDING_PAYMENT',
    })

    const upiIntentUrl = `upi://pay?pa=qrseprint@ybl&pn=${encodeURIComponent(
      shop.shopName
    )}&am=${totalAmount.toFixed(2)}&tr=${jobId}&tn=Print_Job_${jobId}&cu=INR`

    return { job: printJob, upiIntentUrl }
  },

  async verifyPayment(jobId, paymentTxnId, io) {
    const job = await jobRepository.findByJobId(jobId)
    if (!job) throw new Error('Print job not found')

    job.status = 'PAYMENT_VERIFIED'
    job.paymentTxnId = paymentTxnId || `TXN_${Date.now()}`
    await job.save()

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

      job.status = 'DISPATCHED_TO_AGENT'
      await job.save()
    }

    return job
  }
}
