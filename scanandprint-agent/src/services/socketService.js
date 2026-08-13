import { io } from 'socket.io-client'
import configStore from '../store/configStore.js'
import printService from './printService.js'
import printerManager from './printerManager.js'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.statusListeners = []
    this.hasLoggedOffline = false
  }

  onStatusChange(callback) {
    this.statusListeners.push(callback)
  }

  notifyStatusChange(status, details = {}) {
    this.statusListeners.forEach((cb) => cb(status, details))
  }

  connect() {
    const config = configStore.getAll()
    const { shopId, secretKey, serverUrl } = config

    if (!shopId || !secretKey) {
      console.log('[SocketService] Shop ID or Secret Key missing. Waiting for configuration...')
      this.isConnected = false
      this.notifyStatusChange('UNCONFIGURED', { message: 'Shop ID or Secret Key not set' })
      return
    }

    const targetServerUrl = serverUrl || 'https://scanandprint.onrender.com'
    console.log(`[SocketService] Target Cloud Server: ${targetServerUrl} (Shop: ${shopId})`)

    if (this.socket) {
      this.socket.disconnect()
    }

    this.hasLoggedOffline = false

    this.socket = io(targetServerUrl, {
      auth: {
        shopId: shopId.trim(),
        secretKey: secretKey.trim(),
        agentType: 'DESKTOP_WIN_AGENT',
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 5000,
      reconnectionDelayMax: 15000,
      timeout: 10000,
    })

    this.socket.on('connect', async () => {
      console.log(`[SocketService] 🟢 Connected! Socket ID: ${this.socket.id}`)
      
      // Auto detect installed printers on this PC and register with Cloud Server
      let availablePrinters = []
      try {
        availablePrinters = await printerManager.getAvailablePrinters()
        console.log(`[SocketService] 🖨️ Detected ${availablePrinters.length} local Windows printer(s)`)
      } catch (err) {
        console.error('[SocketService] Failed to detect local printers:', err.message)
      }

      // Emit handshake with detected printers
      this.socket.emit('AGENT_REGISTER', { 
        shopId: shopId.trim(), 
        secretApiKey: secretKey.trim(),
        agentVersion: '1.0.0',
        printers: availablePrinters,
      })
      
      this.isConnected = true
      this.hasLoggedOffline = false
      this.notifyStatusChange('CONNECTED', { socketId: this.socket.id, shopId })

      // Fetch queued jobs for offline sync recovery
      this.fetchQueuedJobs(targetServerUrl, shopId.trim(), secretKey.trim())
    })

    // Listen for manual remote rescan request from Web Dashboard
    this.socket.on('REQUEST_PRINTER_SCAN', async () => {
      try {
        console.log('[SocketService] Received remote printer rescan request...')
        const printers = await printerManager.getAvailablePrinters()
        this.socket.emit('AGENT_PRINTERS_UPDATED', {
          shopId: shopId.trim(),
          printers,
        })
      } catch (err) {
        console.error('[SocketService] Failed to rescan printers:', err.message)
      }
    })

    this.socket.on('disconnect', (reason) => {
      console.log(`[SocketService] 🔴 Disconnected: ${reason}`)
      this.isConnected = false
      this.notifyStatusChange('DISCONNECTED', { reason })
    })

    this.socket.on('connect_error', (err) => {
      this.isConnected = false
      if (!this.hasLoggedOffline) {
        console.log(`[SocketService] 🟡 Server offline (${targetServerUrl}). Waiting for server...`)
        this.hasLoggedOffline = true
      }
      this.notifyStatusChange('DISCONNECTED', { error: 'Server offline' })
    })

    // Real-time Print Job Event Handler
    this.socket.on('PRINT_JOB_DISPATCH', async (jobData) => {
      console.log('[SocketService] Received PRINT_JOB_DISPATCH event:', jobData)
      try {
        const result = await printService.executePrintJob(jobData)

        // Emit success back to Cloud Server
        if (this.socket && this.socket.connected) {
          this.socket.emit('JOB_SUCCESS', {
            jobId: jobData.jobId,
            printedOn: result.printedOn,
            timestamp: result.timestamp,
          })
        }
      } catch (err) {
        console.error('[SocketService] Failed job processing:', err.message)
        if (this.socket && this.socket.connected) {
          this.socket.emit('JOB_FAILED', {
            jobId: jobData.jobId,
            error: err.message,
          })
        }
      }
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.notifyStatusChange('DISCONNECTED', { reason: 'Manual disconnect' })
    }
  }

  reconnect() {
    this.disconnect()
    this.connect()
  }

  async fetchQueuedJobs(serverUrl, shopCode, secretApiKey) {
    try {
      console.log(`[SocketService] Fetching queued jobs for recovery...`)
      const axios = (await import('axios')).default
      const response = await axios.get(`${serverUrl}/api/jobs/queued`, {
        headers: {
          'x-shop-code': shopCode,
          'x-secret-api-key': secretApiKey
        }
      })
      
      if (response.data && response.data.data && response.data.data.jobs) {
        const queuedJobs = response.data.data.jobs
        if (queuedJobs.length > 0) {
          console.log(`[SocketService] Recovered ${queuedJobs.length} queued jobs`)
          for (const job of queuedJobs) {
            // Re-emit internally
            this.socket.emit('PRINT_JOB_DISPATCH', {
              jobId: job.jobId,
              shopCode: job.shopCode,
              fileUrl: job.fileUrl,
              originalFileName: job.originalFileName,
              totalPages: job.totalPages,
              colorType: job.colorType,
              copies: job.copies,
              isDuplex: job.isDuplex,
              totalAmount: job.totalAmount,
            })
          }
        }
      }
    } catch (err) {
      console.error('[SocketService] Failed to fetch queued jobs:', err.message)
    }
  }
}

const socketService = new SocketService()
export default socketService
