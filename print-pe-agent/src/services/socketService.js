import { io } from 'socket.io-client'
import configStore from '../store/configStore.js'
import printService from './printService.js'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.statusListeners = []
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

    const targetServerUrl = serverUrl || 'http://localhost:5000'
    console.log(`[SocketService] Connecting to Cloud Server: ${targetServerUrl} (Shop: ${shopId})`)

    if (this.socket) {
      this.socket.disconnect()
    }

    this.socket = io(targetServerUrl, {
      auth: {
        shopId: shopId.trim(),
        secretKey: secretKey.trim(),
        agentType: 'DESKTOP_WIN_AGENT',
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    })

    // Socket Event Handlers
    this.socket.on('connect', () => {
      console.log(`[SocketService] Connected! Socket ID: ${this.socket.id}`)
      this.isConnected = true
      this.notifyStatusChange('CONNECTED', { socketId: this.socket.id, shopId })
    })

    this.socket.on('disconnect', (reason) => {
      console.log(`[SocketService] Disconnected: ${reason}`)
      this.isConnected = false
      this.notifyStatusChange('DISCONNECTED', { reason })
    })

    this.socket.on('connect_error', (err) => {
      console.error('[SocketService] Connection Error:', err.message)
      this.isConnected = false
      this.notifyStatusChange('ERROR', { error: err.message })
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
}

const socketService = new SocketService()
export default socketService
