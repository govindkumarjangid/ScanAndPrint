import { io } from 'socket.io-client'
import os from 'os'
import https from 'https'
import configStore from '../store/configStore.js'
import printService from './printService.js'
import printerManager from './printerManager.js'
import { getDeviceFingerprint, getAccuratePhysicalIp } from './deviceFingerprint.js'

// Extract active local physical network IPv4 address (filters out virtual VMware, VirtualBox, WSL, Hyper-V adapters)
function getRealLocalIp() {
  try {
    const interfaces = os.networkInterfaces()
    const virtualKeywords = [
      'vmware', 'virtualbox', 'vbox', 'vethernet', 'wsl', 'hyper-v',
      'loopback', 'pseudo', 'teredo', 'isatap', 'tunnel', 'tap', 'tun',
      'npcap', 'pcap', 'bluetooth', 'tailscale', 'zerotier', 'wireguard',
      'vmnet'
    ]

    const candidates = []

    for (const name of Object.keys(interfaces)) {
      const lowerName = name.toLowerCase()
      const isVirtual = virtualKeywords.some((kw) => lowerName.includes(kw))

      for (const net of interfaces[name]) {
        if (net.family === 'IPv4' && !net.internal && net.address && net.address !== '127.0.0.1') {
          // Avoid APIPA autoconfiguration subnet (169.254.x.x) and common host-only subnet ranges
          if (!net.address.startsWith('169.254.')) {
            const isPhysical = lowerName.includes('wi-fi') || lowerName.includes('wifi') || lowerName.includes('ethernet') || lowerName.includes('wlan') || lowerName.includes('eth') || lowerName.includes('en') || lowerName.includes('local area connection')
            candidates.push({
              name,
              address: net.address,
              isVirtual,
              isPhysical,
            })
          }
        }
      }
    }

    // 1. Primary Priority: Active Physical Adapter (Wi-Fi / Ethernet)
    const physical = candidates.find((c) => !c.isVirtual && c.isPhysical)
    if (physical) return physical.address

    // 2. Secondary Priority: Any non-virtual adapter
    const nonVirtual = candidates.find((c) => !c.isVirtual)
    if (nonVirtual) return nonVirtual.address

    // 3. Fallback
    if (candidates.length > 0) return candidates[0].address
  } catch (e) {}
  return '127.0.0.1'
}

// Quick async fetch for public IP with 1.5s timeout
async function fetchPublicIp() {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 1500)
    try {
      https.get('https://api.ipify.org?format=json', { timeout: 1500 }, (res) => {
        let raw = ''
        res.on('data', (chunk) => { raw += chunk })
        res.on('end', () => {
          clearTimeout(timer)
          try {
            const json = JSON.parse(raw)
            if (json?.ip) resolve(json.ip)
            else resolve(null)
          } catch {
            resolve(null)
          }
        })
      }).on('error', () => {
        clearTimeout(timer)
        resolve(null)
      })
    } catch {
      clearTimeout(timer)
      resolve(null)
    }
  })
}

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.statusListeners = []
    this.hasLoggedOffline = false
    this.counterPopupHandler = null
    this.heldJobs = new Map()
    this.deviceInfo = null
    this.approvalPollTimer = null
  }

  setCounterPopupHandler(handler) {
    this.counterPopupHandler = handler
  }

  onStatusChange(callback) {
    this.statusListeners.push(callback)
  }

  notifyStatusChange(status, details = {}) {
    this.statusListeners.forEach((cb) => cb(status, details))
  }

  stopApprovalPolling() {
    if (this.approvalPollTimer) {
      clearInterval(this.approvalPollTimer)
      this.approvalPollTimer = null
    }
  }

  startApprovalPolling(targetServerUrl, shopId, fingerprint) {
    if (this.approvalPollTimer || !fingerprint) return

    console.log(`[SocketService] ⏳ Starting auto-approval polling for PC fingerprint (${fingerprint.slice(0, 12)}...)...`)
    this.approvalPollTimer = setInterval(async () => {
      try {
        const cleanServer = targetServerUrl.replace(/\/+$/, '')
        const checkUrl = `${cleanServer}/api/devices/check-status?shopCode=${encodeURIComponent(shopId)}&fingerprint=${encodeURIComponent(fingerprint)}`
        
        const res = await fetch(checkUrl)
        const json = await res.json()
        
        if (json?.success && json?.data?.isApproved) {
          console.log(`[SocketService] 🎉 PC Device APPROVED by Shop Owner! Establishing live connection...`)
          this.stopApprovalPolling()
          this.connect()
        } else if (json?.data?.status === 'REJECTED' || json?.data?.status === 'REVOKED') {
          console.warn(`[SocketService] ❌ PC Device request was ${json.data.status}`)
          this.stopApprovalPolling()
          this.notifyStatusChange('DEVICE_REVOKED', {
            message: `This PC was ${json.data.status.toLowerCase()} by the Shop Owner.`,
            shopId,
          })
        }
      } catch (err) {
        // Silent network retry
      }
    }, 4000)
  }

  async connect() {
    const config = configStore.getAll()
    const { shopId, secretKey, serverUrl } = config

    if (!shopId || !secretKey) {
      console.log('[SocketService] Shop ID or Secret Key missing. Waiting for configuration...')
      this.isConnected = false
      this.notifyStatusChange('UNCONFIGURED', { message: 'Shop ID or Secret Key not set' })
      return
    }

    let targetServerUrl = serverUrl || 'https://scanandprint.onrender.com'
    if (!targetServerUrl || targetServerUrl.includes('localhost:5000') || targetServerUrl.includes('127.0.0.1:5000')) {
      targetServerUrl = 'https://scanandprint.onrender.com'
    }
    console.log(`[SocketService] Target Server: ${targetServerUrl} (Shop: ${shopId})`)

    if (this.socket) {
      this.socket.disconnect()
    }

    this.hasLoggedOffline = false

    // 1. Generate multi-signal SHA-256 hardware device fingerprint
    try {
      this.deviceInfo = await getDeviceFingerprint()
    } catch (err) {
      console.error('[SocketService] Hardware fingerprint error:', err)
      this.deviceInfo = { fingerprint: 'FALLBACK_FINGERPRINT_' + shopId, meta: {} }
    }

    this.socket = io(targetServerUrl, {
      auth: {
        shopId: shopId.trim(),
        secretKey: secretKey.trim(),
        agentType: 'DESKTOP_WIN_AGENT',
        deviceFingerprint: this.deviceInfo.fingerprint,
        deviceMeta: this.deviceInfo.meta,
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 5000,
      reconnectionDelayMax: 15000,
      timeout: 10000,
    })

    this.socket.on('connect', async () => {
      console.log(`[SocketService] 🟢 Connected & Authorized! Socket ID: ${this.socket.id}`)
      this.stopApprovalPolling()
      
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
      const realLocalIp = await getAccuratePhysicalIp()
      let publicWanIp = null
      try {
        publicWanIp = await fetchPublicIp()
      } catch (e) {}

      const effectiveIp = realLocalIp || publicWanIp || '127.0.0.1'
      
      // Emit handshake with detected printers and real live system info
      this.socket.emit('AGENT_REGISTER', { 
        shopId: shopId.trim(), 
        secretApiKey: secretKey.trim(),
        agentVersion: '1.0.3',
        osArch: `${process.platform} (${process.arch})`,
        platform: process.platform,
        osPlatform,
        ipAddress: effectiveIp,
        localIp: realLocalIp,
        publicIp: publicWanIp,
        hostname: os.hostname(),
        printers: availablePrinters,
        deviceFingerprint: this.deviceInfo.fingerprint,
        deviceMeta: {
          ...this.deviceInfo.meta,
          ipAddress: effectiveIp,
          localIp: realLocalIp,
        },
      })
      
      this.isConnected = true
      this.hasLoggedOffline = false
      this.notifyStatusChange('CONNECTED', { 
        socketId: this.socket.id, 
        shopId,
        deviceFingerprint: this.deviceInfo.fingerprint,
        hostname: os.hostname(),
      })

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
        console.error('[SocketService] Failed to rescan printers on remote request:', err.message)
      }
    })

    // Remote Print Cancel Event
    this.socket.on('CANCEL_HELD_JOB', (data) => {
      const jobId = data?.jobId
      if (jobId && this.heldJobs.has(jobId)) {
        this.heldJobs.delete(jobId)
        console.log(`[SocketService] 🗑️ Held Job #${jobId} cancelled remotely by owner.`)
      }
    })

    this.socket.on('AGENT_AUTH_ERROR', (data) => {
      console.error(`[SocketService] ⛔ Authentication Refused: ${data?.message}`)
      this.isConnected = false
      this.notifyStatusChange('DISCONNECTED', { error: data?.message || 'Authentication error' })
    })

    this.socket.on('FORCE_SHOP_LOGOUT', (data) => {
      console.warn(`[SocketService] 🚨 Force Logout Signal: ${data?.reason}`)
      this.isConnected = false
      this.notifyStatusChange('DISCONNECTED', { error: data?.reason || 'Account suspended' })
      this.disconnect()
    })

    this.socket.on('AGENT_KICKED', (data) => {
      console.warn(`[SocketService] 🚨 Agent Kicked by Server:`, data?.reason)
      this.isConnected = false
      this.stopApprovalPolling()
      this.notifyStatusChange('DEVICE_REVOKED', {
        message: data?.reason || 'Another PC was approved for this shop. This device has been unlinked.',
        kicked: true,
      })
      this.disconnect()
    })

    this.socket.on('SHOP_STATUS_UPDATED', (data) => {
      if (data?.isSuspended) {
        console.warn(`[SocketService] 🚨 Shop Suspended via live update:`, data)
        this.isConnected = false
        this.notifyStatusChange('DISCONNECTED', { error: 'Shop account suspended' })
        this.disconnect()
      }
    })

    this.socket.on('disconnect', (reason) => {
      console.log(`[SocketService] 🔴 Disconnected: ${reason}`)
      this.isConnected = false
      this.notifyStatusChange('DISCONNECTED', { reason })
    })

    this.socket.on('connect_error', (err) => {
      this.isConnected = false
      const errorMsg = String(err?.message || '')

      if (errorMsg === 'DEVICE_NOT_APPROVED') {
        console.warn(`[SocketService] 🔒 Device is PENDING_APPROVAL. Waiting for Shop Owner approval from Dashboard...`)
        this.notifyStatusChange('DEVICE_NOT_APPROVED', {
          message: 'Device Approval Required: Please approve this PC from your Shop Owner Dashboard (Devices section).',
          shopId,
          fingerprint: this.deviceInfo?.fingerprint,
          hostname: this.deviceInfo?.meta?.hostname || os.hostname(),
        })
        this.startApprovalPolling(targetServerUrl, shopId.trim(), this.deviceInfo?.fingerprint)
        return
      }

      if (errorMsg === 'DEVICE_MISMATCH' || errorMsg === 'DEVICE_REVOKED') {
        console.warn(`[SocketService] 🔒 Device binding error: ${errorMsg}`)
        this.stopApprovalPolling()
        this.notifyStatusChange('DEVICE_REVOKED', {
          message: 'This PC is not authorized or was revoked by the Shop Owner.',
          shopId,
          fingerprint: this.deviceInfo?.fingerprint,
        })
        return
      }

      if (errorMsg === 'INVALID_SHOP_CREDENTIALS') {
        this.stopApprovalPolling()
        this.notifyStatusChange('AUTH_ERROR', {
          message: 'Invalid Shop ID or Secret Key. Please reconfigure.',
          shopId,
        })
        return
      }

      if (!this.hasLoggedOffline) {
        console.log(`[SocketService] 🟡 Server connection issue (${errorMsg || 'Server offline'}). Retrying...`)
        this.hasLoggedOffline = true
      }
      this.notifyStatusChange('DISCONNECTED', { error: errorMsg || 'Server offline' })
    })

    // Real-time Print Job Dispatch Event
    this.socket.on('PRINT_JOB_DISPATCH', async (jobData) => {
      const jobId = jobData?.jobId
      if (jobId) {
        this.heldJobs.set(jobId, jobData)
      }

      console.log(`[SocketService] 📩 Received PRINT_JOB_DISPATCH for Job #${jobId}:`, {
        paymentMethod: jobData?.paymentMethod,
        totalAmount: jobData?.totalAmount,
        originalFileName: jobData?.originalFileName,
      })

      const paymentMethod = String(jobData?.paymentMethod || '').toUpperCase().trim()
      const isAutoOnlineGateway =
        jobData?.isAutoPrint === true ||
        paymentMethod === 'RAZORPAY' ||
        paymentMethod === 'ONLINE_GATEWAY' ||
        paymentMethod === 'ONLINE' ||
        paymentMethod === 'UPI_ONLINE' ||
        paymentMethod === 'DEMO_BYPASS' ||
        jobData?.status === 'PAYMENT_VERIFIED'

      const isCounterOrder = !isAutoOnlineGateway && (
        paymentMethod === 'CASH_COUNTER' ||
        paymentMethod === 'COUNTER' ||
        paymentMethod === 'CASH' ||
        paymentMethod === 'UPI_QR' ||
        paymentMethod === 'PENDING_CASH' ||
        jobData?.isCounterOrder === true
      )

      // If Counter / Cash / UPI QR: Show bottom-right native confirmation popup and wait for shopkeeper approval
      if (isCounterOrder) {
        console.log(`[SocketService] 💵 Counter/Cash Order #${jobId} (Method: ${paymentMethod || 'COUNTER'}) -> Opening approval popup window...`)
        if (typeof this.counterPopupHandler === 'function') {
          this.counterPopupHandler(jobData)
        }
        return
      }

      // If Online Gateway: Zero-Click Automatic Hardware Print
      console.log(`[SocketService] 🖨️ Zero-Click Auto-Printing Verified Gateway Job #${jobId} directly...`)

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
          console.log(`[SocketService] Synced ${queuedJobs.length} queued job(s) from server`)
          for (const job of queuedJobs) {
            this.heldJobs.set(job.jobId, job)
          }
        }
      }
    } catch (err) {
      console.warn('[SocketService] Queued jobs sync note:', err.message)
    }
  }
}

const socketService = new SocketService()
export default socketService
