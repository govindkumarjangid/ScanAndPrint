import express from 'express'
import rateLimit from 'express-rate-limit'
import {
  getShopJobs,
  getShopAnalytics,
  getQueuedJobs,
  triggerPrintNow,
  cancelPrintJob,
  deletePrintJob,
} from '../controllers/job.controller.js'
import { authenticateShop, authenticateAgent } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Rate limiter for owner dashboard queries (max 40 requests per minute)
const jobsRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many refresh requests. Please wait a few seconds before refreshing.',
  },
})

// Agent Routes
router.route('/queued').get(authenticateAgent, getQueuedJobs)

// Owner Dashboard Routes
router.use(authenticateShop)
router.use(jobsRateLimiter)
router.route('/').get(getShopJobs)
router.route('/analytics').get(getShopAnalytics)
router.route('/:jobId/print-now').post(triggerPrintNow)
router.route('/:jobId/cancel').post(cancelPrintJob)
router.route('/:jobId').delete(deletePrintJob)

export default router