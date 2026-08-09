import express from 'express'
import { handleAgentAuth } from '../controllers/agent.controller.js'
import { authenticateAgent } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/auth', authenticateAgent, handleAgentAuth)

export default router
