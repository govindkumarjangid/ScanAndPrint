import express from 'express'
import {
  getPublicShopInfo,
  createPrintJob,
  verifyPayment,
} from '../controllers/kiosk.controller.js'

const router = express.Router()

router.get('/:shopCode', getPublicShopInfo)
router.post('/create-job', createPrintJob)
router.post('/payment/verify', verifyPayment)

export default router
