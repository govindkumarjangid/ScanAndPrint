import express from 'express'
import { getShopJobs, getShopAnalytics } from '../controllers/job.controller.js'
import { authenticateShop } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/', authenticateShop, getShopJobs)
router.get('/analytics', authenticateShop, getShopAnalytics)

export default router
