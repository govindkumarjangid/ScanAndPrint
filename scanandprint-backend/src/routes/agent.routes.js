import express from 'express'
import {
  handleAgentAuth,
  getSystemPrinters,
  executeLocalPrint,
  getLiveAgentStatus,
  downloadAgentInstaller,
} from '../controllers/agent.controller.js'
import { authenticateAgent } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.route('/auth').post(authenticateAgent, handleAgentAuth)
router.route('/download').get(downloadAgentInstaller)
router.route('/status').get(getLiveAgentStatus)
router.route('/status/:shopCode').get(getLiveAgentStatus)
router.route('/system-printers').get(getSystemPrinters)
router.route('/print-job').post(executeLocalPrint)

export default router
