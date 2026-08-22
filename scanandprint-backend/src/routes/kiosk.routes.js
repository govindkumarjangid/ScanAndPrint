import express from 'express'
import {
  getPublicShopInfo,
  createPrintJob,
  quickDispatchPrintJob,
  preUploadFile,
  verifyPayment,
  downloadJobFile,
} from '../controllers/kiosk.controller.js'
import { validateRequest } from '../middlewares/validate.middleware.js'
import { createJobSchema, quickDispatchSchema, verifyPaymentSchema } from '../validators/kiosk.validator.js'

import { upload } from '../middlewares/upload.middleware.js'

const router = express.Router()

router.route('/download/:jobId').get(downloadJobFile)
router.route('/pre-upload').post(upload.single("file"), preUploadFile)
router.route('/quick-dispatch').post(upload.single("file"), validateRequest(quickDispatchSchema), quickDispatchPrintJob)
router.route('/:shopCode').get(getPublicShopInfo)
router.route('/create-job').post(upload.single("file"), validateRequest(createJobSchema), createPrintJob)
router.route('/payment/verify').post(validateRequest(verifyPaymentSchema), verifyPayment)

export default router
