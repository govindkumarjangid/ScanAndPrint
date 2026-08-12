import express from 'express'
import {
  getPublicShopInfo,
  createPrintJob,
  verifyPayment,
} from '../controllers/kiosk.controller.js'
import { validateRequest } from '../middlewares/validate.middleware.js'
import { createJobSchema, verifyPaymentSchema } from '../validators/kiosk.validator.js'

import { upload } from '../middlewares/upload.middleware.js'

const router = express.Router()

router.route('/:shopCode').get(getPublicShopInfo)
router.route('/create-job').post(upload.single("file"), validateRequest(createJobSchema), createPrintJob)
router.route('/payment/verify').post(validateRequest(verifyPaymentSchema), verifyPayment)

export default router
