import { kioskService } from '../services/kiosk.service.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// get public shop info for kiosk
export const getPublicShopInfo = asyncHandler(async (req, res, next) => {
  const { shopCode } = req.params
  if (!shopCode)
    return sendError(res, 400, 'Shop Code is required')

  const shop = await kioskService.getShopInfo(shopCode)
  return sendSuccess(res, 200, 'Shop details loaded successfully', { shop })
})

// create a print job from kiosk
export const createPrintJob = asyncHandler(async (req, res, next) => {
  const result = await kioskService.createJob(req.body)
  return sendSuccess(res, 201, 'Print job created successfully', result)
})

// verify payment for a print job from kiosk
export const verifyPayment = asyncHandler(async (req, res, next) => {
  const { jobId, paymentTxnId } = req.body
  const io = req.app.get('io')
  const job = await kioskService.verifyPayment(jobId, paymentTxnId, io)
  return sendSuccess(res, 200, 'Payment verified & print job dispatched!', { job })
})
