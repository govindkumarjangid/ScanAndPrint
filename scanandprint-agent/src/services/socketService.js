import { io } from 'socket.io-client'
import os from 'os'
import configStore from '../store/configStore.js'
import printService from './printService.js'
import printerManager from './printerManager.js'

// Extract active local network IPv4 address
function getRealLocalIp() {
  try {
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name]) {
        if (net.family === 'IPv4' && !net.internal && net.address !== '127.0.0.1') {
          return net.address
        }
      }
    }
  } catch (e) {}
  return '127.0.0.1'
}

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

      // Detect Real OS Info & Live System Telemetry
      const platformName = process.platform === 'win32' ? 'Windows' : process.platform === 'darwin' ? 'macOS' : 'Linux'
      const osPlatform = `${platformName} ${os.release()} (${process.arch}) - ${os.hostname()}`
      const realLocalIp = getRealLocalIp()
      
      // Emit handshake with detected printers and real live system info
      this.socket.emit('AGENT_REGISTER', { 
        shopId: shopId.trim(), 
        secretApiKey: secretKey.trim(),
        agentVersion: '1.0.3',
        osArch: `${process.platform} (${process.arch})`,
        platform: process.platform,
        osPlatform,
        ipAddress: realLocalIp,
        hostname: os.hostname(),
        printers: availablePrinters,
      })
      
      this.isConnected = true
      this.hasLoggedOffline = false
      this.notifyStatusChange('CONNECTED', { socketId: this.socket.id, shopId })

      // Fetch queued jobs for offline sync recovery
      this.fetchQueuedJobs(targetServerUrl, shopId.trim(), secretKey.trim())

      // Extra safety net: if printers were still empty after the retries inside
      // getAvailablePrinters (e.g. very slow machine at boot), do one more
      // delayed rescan and push an update to the server - no restart needed.
      if (availablePrinters.length === 0) {
        setTimeout(async () => {
          try {
            const rescanned = await printerManager.getAvailablePrinters()
            if (rescanned.length > 0 && this.socket && this.socket.connected) {
              console.log(`[SocketService] 🖨️ Delayed rescan found ${rescanned.length} printer(s), updating server...`)
              this.socket.emit('AGENT_PRINTERS_UPDATED', {
                shopId: shopId.trim(),
                printers: rescanned,
              })
            }
          } catch (err) {
            console.error('[SocketService] Delayed printer rescan failed:', err.message)
          }
        }, 15000)
      }
    })

    // Map to hold pending print jobs in queue before owner approval
    this.heldJobs = new Map()

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

    // Real-time Print Job Dispatch Event: Auto-Print Immediately to Hardware Spooler!
    this.socket.on('PRINT_JOB_DISPATCH', async (jobData) => {
      const jobId = jobData?.jobId
      console.log(`[SocketService] 🖨️ Auto-Printing Job #${jobId} directly (Zero-Click Auto Print)...`)

      if (jobId) {
        this.heldJobs.set(jobId, jobData)
      }

      try {
        const result = await printService.executePrintJob(jobData)
        if (this.socket && this.socket.connected) {
          this.socket.emit('JOB_SUCCESS', {
            jobId: jobId,
            printedOn: result?.printedOn,
            timestamp: result?.timestamp || new Date().toISOString(),
          })
        }
      } catch (err) {
        console.error(`[SocketService] ❌ Failed to auto-print job #${jobId}:`, err.message)
        if (this.socket && this.socket.connected) {
          this.socket.emit('JOB_FAILED', {
            jobId: jobId,
            error: err.message,
          })
        }
      }
    })

    // Trigger Physical Printing on Owner Action (Manual Reprint / Retry)
    this.socket.on('EXECUTE_PRINT_NOW', async (data) => {
      const jobId = data?.jobId
      const jobData = this.heldJobs.get(jobId) || data
      console.log(`[SocketService] 🖨️ Re-executing Print Job #${jobId} to hardware spooler...`)

      try {
        const result = await printService.executePrintJob(jobData)
        if (this.socket && this.socket.connected) {
          this.socket.emit('JOB_SUCCESS', {
            jobId: jobId,
            printedOn: result?.printedOn || data?.printerName,
            timestamp: result?.timestamp || new Date().toISOString(),
          })
        }
      } catch (err) {
        console.error(`[SocketService] ❌ Failed to re-print job #${jobId}:`, err.message)
        if (this.socket && this.socket.connected) {
          this.socket.emit('JOB_FAILED', {
            jobId: jobId,
            error: err.message,
          })
        }
      }
    })

    // Cancel Job and Delete from Hardware Spooler / Queue
    this.socket.on('PRINT_JOB_CANCEL', (data) => {
      const jobId = data?.jobId
      console.log(`[SocketService] 🗑️ Cancelling and discarding Job #${jobId} from queue`)
      this.heldJobs.delete(jobId)
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
