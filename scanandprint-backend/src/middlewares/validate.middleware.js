import { sendError } from '../utils/apiResponse.js'

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body)
      req.body = parsed
      next()
    } catch (error) {
      if (error.errors) {
        const message = error.errors.map((e) => e.message).join(', ')
        return sendError(res, 400, message)
      }
      return sendError(res, 400, 'Invalid request data')
    }
  }
}
