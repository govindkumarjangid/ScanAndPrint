import { kioskService } from '../services/kiosk.service.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'

export const getPublicShopInfo = async (req, res, next) => {
  try {
    const { shopCode } = req.params
    if (!shopCode) {
      return sendError(res, 400, 'Shop Code is required')
    }

    const shop = await kioskService.getShopInfo(shopCode)
    return sendSuccess(res, 200, 'Shop details loaded successfully', { shop })
  } catch (error) {
    if (error.message === 'Shop not found') {
      return sendError(res, 404, 'Shop not found. Please verify the QR Code.')
    }
    next(error)
  }
}

export const createPrintJob = async (req, res, next) => {
  try {
    const result = await kioskService.createJob(req.body)
    return sendSuccess(res, 201, 'Print job created successfully', result)
  } catch (error) {
    if (error.message === 'Invalid Shop Code') {
      return sendError(res, 404, error.message)
    }
    next(error)
  }
}

export const verifyPayment = async (req, res, next) => {
  try {
    const { jobId, paymentTxnId } = req.body
    const io = req.app.get('io')

    const job = await kioskService.verifyPayment(jobId, paymentTxnId, io)
    
    return sendSuccess(res, 200, 'Payment verified & print job dispatched!', { job })
  } catch (error) {
    if (error.message === 'Print job not found') {
      return sendError(res, 404, error.message)
    }
    next(error)
  }
}
