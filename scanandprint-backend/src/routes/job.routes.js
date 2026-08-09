import express from 'express'
import {
  getShopJobs,
  getShopAnalytics,
  getQueuedJobs,
} from '../controllers/job.controller.js'
import { authenticateShop, authenticateAgent } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Agent Routes (Protected by API Key & Shop Code)
router.get('/queued', authenticateAgent, getQueuedJobs)

// Owner Dashboard Routes (Protected by JWT Cookie)
router.use(authenticateShop)
router.get('/', getShopJobs)
router.get('/analytics', getShopAnalytics)

export default router
