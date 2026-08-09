import express from 'express'
import {
  getPublicShopInfo,
  createPrintJob,
  verifyPayment,
} from '../controllers/kiosk.controller.js'
import { validateRequest } from '../middlewares/validate.middleware.js'
import { createJobSchema, verifyPaymentSchema } from '../validators/kiosk.validator.js'

const router = express.Router()

router.get('/:shopCode', getPublicShopInfo)
router.post('/create-job', validateRequest(createJobSchema), createPrintJob)
router.post('/payment/verify', validateRequest(verifyPaymentSchema), verifyPayment)

export default router
