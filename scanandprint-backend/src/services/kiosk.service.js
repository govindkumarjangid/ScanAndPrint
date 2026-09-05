import { shopRepository } from '../repositories/shop.repository.js'
import { jobRepository } from '../repositories/job.repository.js'
import { PrintJob } from '../models/PrintJob.model.js'
import { memoryCache } from '../utils/cache.util.js'
import { calculatePrice } from '../utils/pricing.util.js'
import { envConfig } from '../configs/env.config.js'

export const kioskService = {

  // Get shop information by its code
  async getShopInfo(shopCode) {
    const shop = await shopRepository.findByCode(shopCode, {
       select: 'shopCode shopName ownerName phone address cityState pincode bwRate colorRate pricingSettings printerBrand isOnline isSubscriptionActive isDemoAccount demoExpiresAt subscriptionExpiresAt subscriptionStatus paymentSettings isSuspended',
      lean: true,
    })
    if (shop && shop.paymentSettings) {
      delete shop.paymentSettings.razorpayKeySecret
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
    const isDuplex = Boolean(jobData.isDuplex)
    const paperSize = jobData.paperSize || 'A4'
    const photoCount = jobData.photoCount || 0
    const jobType = jobData.jobType || 'DOCUMENT'

    const priceResult = calculatePrice({
      shop,
      totalPages: numPages,
      copies: numCopies,
      colorType,
      isDuplex,
      paperSize,
      photoCount,
      jobType,
    })
    const totalAmount = priceResult.totalAmount

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
      isDuplex,
      paperSize,
      jobType,
      photoCount,
      pricingType: priceResult.pricingType,
      pricingBreakdown: priceResult.breakdownText,
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
    const isDuplex = Boolean(jobData.isDuplex)
    const paperSize = jobData.paperSize || 'A4'
    const photoCount = jobData.photoCount || 0
    const jobType = jobData.jobType || 'DOCUMENT'

    const priceResult = calculatePrice({
      shop,
      totalPages: numPages,
      copies: numCopies,
      colorType,
      isDuplex,
      paperSize,
      photoCount,
      jobType,
    })
    const totalAmount = priceResult.totalAmount

    const jobId = `JOB_${shop.shopCode}_${Date.now().toString().slice(-6)}`
    const cleanFileName = jobData.originalFileName
      ? `${jobData.originalFileName.replace(/(\.(png|jpg|jpeg|webp|docx|doc|pdf))+$/gi, '') || 'document'}.pdf`
      : 'document.pdf'

    const isCounter =
      paymentMethod === 'CASH_COUNTER' ||
      paymentMethod === 'COUNTER' ||
      paymentMethod === 'CASH' ||
      paymentMethod === 'UPI_QR'

    const printJob = await jobRepository.create({
      ...jobData,
      jobId,
      originalFileName: cleanFileName,
      shopId: shop._id,
      totalPages: numPages,
      copies: numCopies,
      isDuplex,
      paperSize,
      jobType,
      photoCount,
      pricingType: priceResult.pricingType,
      pricingBreakdown: priceResult.breakdownText,
      bwPages: isColor ? 0 : numPages,
      colorPages: isColor ? numPages : 0,
      bwRateApplied: shop.bwRate,
      colorRateApplied: shop.colorRate,
      totalAmount,
      status: isCounter ? 'WAITING_COUNTER_APPROVAL' : 'DISPATCHED_TO_AGENT',
      paymentMethod,
      paymentTxnId: isCounter ? `COUNTER_${Date.now()}` : `${paymentMethod}_${Date.now()}`,
      fileUrl: (jobData.fileUrl && jobData.fileUrl.startsWith('data:')) ? jobData.fileUrl : `/api/kiosk/download/${jobId}`,
    })

    if (shop._id) {
      memoryCache.invalidateShop(shop._id)
    }

    if (io) {
      const targetRoom = `shop:${shop.shopCode}`
      console.log(`⚡ [High-Speed Quick-Dispatch]: Instant Dispatch for Job ${jobId} (isCounter: ${isCounter}) -> room ${targetRoom}`)

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
        isCounterOrder: isCounter,
        isAutoPrint: !isCounter,
        status: printJob.status,
      })
    }

    return printJob
  },

  // Verify payment for a specific job and dispatch it to the agent if successful
  async verifyPayment(jobId, paymentTxnId, io) {
    if (!jobId || !paymentTxnId || typeof paymentTxnId !== 'string') {
      throw new Error('Valid Job ID and Payment Transaction ID are required')
    }

    const cleanTxnId = paymentTxnId.trim()
    if (cleanTxnId.length < 3) {
      throw new Error('Invalid Payment Transaction ID format')
    }

    const job = await jobRepository.findByJobId(jobId)
    if (!job) throw new Error('Print job not found')

    if (job.status === 'PAYMENT_VERIFIED' || job.status === 'DISPATCHED_TO_AGENT' || job.status === 'PRINTED_SUCCESSFULLY') {
      return job
    }

    // Replay attack prevention: Ensure this transaction ID has not been used for any other print job
    const existingJobWithTxn = await PrintJob.findOne({
      paymentTxnId: cleanTxnId,
      jobId: { $ne: jobId },
    }).lean()

    if (existingJobWithTxn) {
      throw new Error('This payment transaction has already been applied to another print job.')
    }

    // Real-time Razorpay gateway verification when secret keys are configured
    if (cleanTxnId.startsWith('pay_') && envConfig.razorpayKeyId && envConfig.razorpayKeySecret) {
      try {
        const RazorpayModule = await import('razorpay')
        const Razorpay = RazorpayModule.default || RazorpayModule
        const rzp = new Razorpay({
          key_id: envConfig.razorpayKeyId,
          key_secret: envConfig.razorpayKeySecret,
        })
        const payment = await rzp.payments.fetch(cleanTxnId)
        if (payment && !['captured', 'authorized'].includes(payment.status)) {
          throw new Error(`Payment verification failed: Gateway returned status ${payment.status}`)
        }
      } catch (rzpErr) {
        console.error('[Razorpay Verify Error]:', rzpErr.message)
        throw new Error(`Razorpay payment validation failed: ${rzpErr.message}`)
      }
    }

    job.status = 'PAYMENT_VERIFIED'
    job.paymentTxnId = cleanTxnId
    job.paymentMethod = 'RAZORPAY'
    await job.save()

    if (job.shopId) {
      memoryCache.invalidateShop(job.shopId)
    }

    if (io) {
      const targetRoom = `shop:${job.shopCode}`
      console.log(`⚡ [Auto-Print Online Order]: Emitting PRINT_JOB_DISPATCH to room ${targetRoom} for Job #${job.jobId}`)

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
        paymentMethod: 'RAZORPAY',
        isAutoPrint: true,
      })

      job.status = 'DISPATCHED_TO_AGENT'
      await job.save()

      io.to(targetRoom).emit('JOB_STATUS_UPDATED', {
        jobId: job.jobId,
        status: 'DISPATCHED_TO_AGENT',
        job: job.toObject ? job.toObject() : job,
      })
    }

    return job
  }

}
