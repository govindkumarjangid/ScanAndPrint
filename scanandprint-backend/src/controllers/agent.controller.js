import { authService } from '../services/auth.service.js'
import { agentService } from '../services/agent.service.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const handleAgentAuth = asyncHandler(async (req, res, next) => {
  return sendSuccess(res, 200, 'Agent Authenticated', {
    shop: req.shop
  })
})
