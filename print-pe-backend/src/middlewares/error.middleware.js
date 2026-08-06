import { sendError } from '../utils/apiResponse.js'

export const notFoundHandler = (req, res, next) => {
  return sendError(res, 404, `Route not found - ${req.originalUrl}`)
}

export const globalErrorHandler = (err, req, res, next) => {
  console.error('❌ [Global Error Handler]:', err)

  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  return sendError(res, statusCode, message, process.env.NODE_ENV === 'development' ? err.stack : null)
}
