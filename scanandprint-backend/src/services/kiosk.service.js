import { shopRepository } from '../repositories/shop.repository.js'
import { jobRepository } from '../repositories/job.repository.js'
import { memoryCache } from '../utils/cache.util.js'

export const kioskService = {

  // Get shop information by its code
  async getShopInfo(shopCode) {
    const shop = await shopRepository.findByCode(shopCode, {
      select: 'shopCode shopName ownerName phone address cityState pincode bwRate colorRate printerBrand isOnline isSubscriptionActive isDemoAccount demoExpiresAt subscriptionExpiresAt subscriptionStatus paymentSettings isSuspended',
      lean: true,
    })
    if (shop && shop.paymentSettings) {
      delete shop.paymentSettings.razorpayKeySecret
      shop.upiId = shop.paymentSettings.upiId || ''
    }
    return shop || null
  },

  // Create a new print job for a specific shop
  async createJob(jobData) {
    const { shopCode, copies, totalPages, colorType } = jobData

    const shop = await shopRepository.findByCode(shopCode, { lean: true })
    if (!shop) throw new Error('Invalid Shop Code')
    if (shop.isSuspended) throw new Error('This print shop is currently suspended and cannot accept print jobs.')
    if (shop.isDemoAccount) {
      const isDemoExpired = shop.demoExpiresAt ? new Date(shop.demoExpiresAt).getTime() <= Date.now() : true
      if (isDemoExpired) throw new Error('This demo print shop trial has expired and is not accepting orders.')
    }

    const numCopies = Math.max(1, Number(copies) || 1)
    const numPages = Math.max(1, Number(totalPages) || 1)
    const isColor = colorType === 'COLOR'
    const ratePerPage = isColor ? shop.colorRate : shop.bwRate
    const totalAmount = numPages * numCopies * ratePerPage

    const jobId = `JOB_${shop.shopCode}_${Date.now().toString().slice(-6)}`
    const cleanFileName = jobData.originalFileName
      ? `${jobData.originalFileName.replace(/(\.(png|jpg|jpeg|webp|docx|doc|pdf))+$/gi, '') || 'document'}.pdf`
      : 'document.pdf'

    const printJob = await jobRepository.create({
      ...jobData,
      jobId,
      originalFileName: cleanFileName,
      shopId: shop._id,
      totalPages: numPages,
      copies: numCopies,
      bwPages: isColor ? 0 : numPages,
      colorPages: isColor ? numPages : 0,
      bwRateApplied: shop.bwRate,
      colorRateApplied: shop.colorRate,
      totalAmount,
      status: 'PENDING_PAYMENT',
      fileUrl: (jobData.fileUrl && jobData.fileUrl.startsWith('data:')) ? jobData.fileUrl : `/api/kiosk/download/${jobId}`,
    })

    memoryCache.invalidateShop(shop._id)

    const upiIntentUrl = `upi://pay?pa=scanandprint@ybl&pn=${encodeURIComponent(
      shop.shopName
    )}&am=${totalAmount.toFixed(2)}&tr=${jobId}&tn=Print_Job_${jobId}&cu=INR`

    return { job: printJob, upiIntentUrl }
  },

  // Single-Flight Atomic Quick-Dispatch (Instant print for Counter & Demo Orders in < 80ms)
  async quickDispatchJob(jobData, io) {
    const { shopCode, copies, totalPages, colorType, paymentMethod = 'CASH_COUNTER' } = jobData

    const shop = await shopRepository.findByCode(shopCode, { lean: true })
    if (!shop) throw new Error('Invalid Shop Code')
    if (shop.isSuspended) throw new Error('This print shop is currently suspended and cannot accept print jobs.')
    if (shop.isDemoAccount) {
      const isDemoExpired = shop.demoExpiresAt ? new Date(shop.demoExpiresAt).getTime() <= Date.now() : true
      if (isDemoExpired) throw new Error('This demo print shop trial has expired and is not accepting orders.')
    }

    const numCopies = Math.max(1, Number(copies) || 1)
    const numPages = Math.max(1, Number(totalPages) || 1)
    const isColor = colorType === 'COLOR'
    const ratePerPage = isColor ? shop.colorRate : shop.bwRate
    const totalAmount = numPages * numCopies * ratePerPage

    const jobId = `JOB_${shop.shopCode}_${Date.now().toString().slice(-6)}`
    const cleanFileName = jobData.originalFileName
      ? `${jobData.originalFileName.replace(/(\.(png|jpg|jpeg|webp|docx|doc|pdf))+$/gi, '') || 'document'}.pdf`
      : 'document.pdf'

    const printJob = await jobRepository.create({
      ...jobData,
      jobId,
      originalFileName: cleanFileName,
      shopId: shop._id,
      totalPages: numPages,
      copies: numCopies,
      bwPages: isColor ? 0 : numPages,
      colorPages: isColor ? numPages : 0,
      bwRateApplied: shop.bwRate,
      colorRateApplied: shop.colorRate,
      totalAmount,
      status: 'DISPATCHED_TO_AGENT',
      paymentMethod,
      paymentTxnId: `${paymentMethod}_${Date.now()}`,
      fileUrl: (jobData.fileUrl && jobData.fileUrl.startsWith('data:')) ? jobData.fileUrl : `/api/kiosk/download/${jobId}`,
    })

    if (shop._id) {
      memoryCache.invalidateShop(shop._id)
    }

    if (io) {
      const targetRoom = `shop:${shop.shopCode}`
      console.log(`⚡ [High-Speed Quick-Dispatch]: Instant Spool for Job ${jobId} -> room ${targetRoom}`)

      io.to(targetRoom).emit('PRINT_JOB_DISPATCH', {
        jobId: printJob.jobId,
        shopCode: printJob.shopCode,
        fileUrl: printJob.fileUrl,
        downloadUrl: `/api/kiosk/download/${printJob.jobId}`,
        originalFileName: printJob.originalFileName,
        totalPages: printJob.totalPages,
        colorType: printJob.colorType,
        copies: printJob.copies,
        isDuplex: printJob.isDuplex,
        totalAmount: printJob.totalAmount,
        paymentMethod: printJob.paymentMethod,
      })
    }

    return printJob
  },

  // Verify payment for a specific job and dispatch it to the agent if successful
  async verifyPayment(jobId, paymentTxnId, io) {
    const job = await jobRepository.findByJobId(jobId)
    if (!job) throw new Error('Print job not found')

    job.status = 'PAYMENT_VERIFIED'
    job.paymentTxnId = paymentTxnId || `TXN_${Date.now()}`
    await job.save()

    if (job.shopId) {
      memoryCache.invalidateShop(job.shopId)
    }

    if (io) {
      const targetRoom = `shop:${job.shopCode}`
      console.log(`Emitting PRINT_JOB_DISPATCH to room ${targetRoom} for Job ${job.jobId}`)

      io.to(targetRoom).emit('PRINT_JOB_DISPATCH', {
        jobId: job.jobId,
        shopCode: job.shopCode,
        fileUrl: job.fileUrl,
        downloadUrl: `/api/kiosk/download/${job.jobId}`,
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
