import { authService } from '../services/auth.service.js'
import { agentService } from '../services/agent.service.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'

export const handleAgentAuth = async (req, res, next) => {
  try {
    // Already authenticated by authenticateAgent middleware
    return sendSuccess(res, 200, 'Agent Authenticated', {
      shop: req.shop
    })
  } catch (error) {
    next(error)
  }
}
