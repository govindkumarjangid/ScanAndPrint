import express from 'express'
import {
  getShopJobs,
  getShopAnalytics,
  getQueuedJobs,
} from '../controllers/job.controller.js'
import { authenticateShop, authenticateAgent } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Agent Routes
router.route('/queued').get(authenticateAgent, getQueuedJobs)

// Owner Dashboard Routes
router.use(authenticateShop)
router.route('/').get(getShopJobs)
router.route('/analytics').get(getShopAnalytics)

export default router