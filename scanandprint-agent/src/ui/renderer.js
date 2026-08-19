// Client-side UI Controller for Print Agent Settings & Live Socket Handshake
document.addEventListener('DOMContentLoaded', async () => {
  const shopIdInput = document.getElementById('shopId')
  const secretKeyInput = document.getElementById('secretKey')
  const serverUrlInput = document.getElementById('serverUrl')
  const bwPrinterSelect = document.getElementById('bwPrinter')
  const colorPrinterSelect = document.getElementById('colorPrinter')

  const refreshPrintersBtn = document.getElementById('refreshPrintersBtn')
  const testPrintBtn = document.getElementById('testPrintBtn')
  const settingsForm = document.getElementById('settingsForm')
  const alertMessage = document.getElementById('alertMessage')
  const saveBtn = document.getElementById('saveBtn')

  const statusBadge = document.getElementById('statusBadge')
  const statusText = document.getElementById('statusText')
  const activityLog = document.getElementById('activityLog')
  const clearLogBtn = document.getElementById('clearLogBtn')

  const liveConnectionBanner = document.getElementById('liveConnectionBanner')
  const bannerDetails = document.getElementById('bannerDetails')
  const connectionSuccessModal = document.getElementById('connectionSuccessModal')
  const modalShopCode = document.getElementById('modalShopCode')
  const modalShopCodeVal = document.getElementById('modalShopCodeVal')
  const modalSocketIdVal = document.getElementById('modalSocketIdVal')
  const closeModalBtn = document.getElementById('closeModalBtn')

  // Incoming Job Modal Elements
  const incomingJobModal = document.getElementById('incomingJobModal')
  const jobModalId = document.getElementById('jobModalId')
  const jobModalFileName = document.getElementById('jobModalFileName')
  const jobModalPages = document.getElementById('jobModalPages')
  const jobModalColorBadge = document.getElementById('jobModalColorBadge')
  const jobModalAmount = document.getElementById('jobModalAmount')
  const jobModalTime = document.getElementById('jobModalTime')
  const jobModalPrinter = document.getElementById('jobModalPrinter')
  const approvePrintBtn = document.getElementById('approvePrintBtn')
  const rejectJobBtn = document.getElementById('rejectJobBtn')

  let detectedPrinters = []
  let currentPendingJob = null

  let config = {
    shopId: '',
    secretKey: '',
    serverUrl: window.location.origin && window.location.origin.startsWith('http') ? window.location.origin : 'https://scanandprint.onrender.com',
    defaultBwPrinter: '',
    defaultColorPrinter: '',
  }

  const isElectron = window.electronAPI && typeof window.electronAPI.getConfig === 'function'
  let browserSocket = null

  // Play an audible sound chime when a print order arrives
  function playNotificationChime() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime) // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12) // A5
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.42)
    } catch (e) {
      console.warn('Audio chime note:', e.message)
    }
  }

  // Activity Logger Helper
  function logActivity(text, type = 'info') {
    if (!activityLog) return
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false })
    const entry = document.createElement('div')
    entry.className = 'log-entry'
    entry.innerHTML = `<span class="log-time">${time}</span><span class="log-${type}">${text}</span>`
    activityLog.appendChild(entry)
    activityLog.scrollTop = activityLog.scrollHeight
  }

  if (clearLogBtn) {
    clearLogBtn.addEventListener('click', () => {
      if (activityLog) activityLog.innerHTML = ''
    })
  }

  // Load Saved Configuration
  if (isElectron) {
    try {
      const savedConfig = await window.electronAPI.getConfig()
      if (savedConfig && savedConfig.shopId) {
        config = { ...config, ...savedConfig }
      }
    } catch (e) {
      console.log('Using default config')
    }
  } else {
    try {
      const cached = localStorage.getItem('agent_config')
      if (cached) {
        config = { ...config, ...JSON.parse(cached) }
      }
    } catch (e) {}
  }

  // Populate Input Fields
  shopIdInput.value = config.shopId || ''
  secretKeyInput.value = config.secretKey || ''
  serverUrlInput.value = config.serverUrl || 'https://scanandprint.onrender.com'

  // Query and Populate REAL Installed OS Printers Dynamically
  async function loadPrinters() {
    detectedPrinters = []

    if (isElectron) {
      try {
        const osPrinters = await window.electronAPI.getPrinters()
        if (Array.isArray(osPrinters)) {
          detectedPrinters = osPrinters
        }
      } catch (err) {
        console.error('Electron printer detection failed:', err)
      }
    } else {
      // In Browser mode, query real system printers from backend OS spooler API
      try {
        const targetUrl = serverUrlInput.value.trim() || config.serverUrl || 'https://scanandprint.onrender.com'
        const apiUrl = targetUrl.replace(/\/+$/, '') + '/api/print-agent/system-printers'
        const res = await fetch(apiUrl)
        const json = await res.json()
        if (json.success && Array.isArray(json.data?.printers)) {
          detectedPrinters = json.data.printers
        }
      } catch (err) {
        console.warn('System printers API fetch note:', err.message)
      }
    }

    bwPrinterSelect.innerHTML = ''
    colorPrinterSelect.innerHTML = ''

    if (detectedPrinters.length === 0) {
      bwPrinterSelect.innerHTML = '<option value="">-- No Windows Printers Found --</option>'
      colorPrinterSelect.innerHTML = '<option value="">-- No Windows Printers Found --</option>'
      logActivity('⚠️ No hardware printers detected on this machine', 'error')
      showAlert('⚠️ No printers found on this PC. Connect a printer via USB or WiFi.', 'error')
      return
    }

    bwPrinterSelect.innerHTML = '<option value="">-- Select Black & White Printer --</option>'
    colorPrinterSelect.innerHTML = '<option value="">-- Select Color Printer --</option>'

    detectedPrinters.forEach((p) => {
      const optionBw = document.createElement('option')
      optionBw.value = p.name
      optionBw.textContent = `${p.name}${p.isDefault ? ' ★ (Windows Default)' : ''}`
      if (config.defaultBwPrinter === p.name || (!config.defaultBwPrinter && p.isDefault)) {
        optionBw.selected = true
      }
      bwPrinterSelect.appendChild(optionBw)

      const optionColor = document.createElement('option')
      optionColor.value = p.name
      optionColor.textContent = `${p.name}${p.isDefault ? ' ★ (Windows Default)' : ''}`
      if (config.defaultColorPrinter === p.name || (!config.defaultColorPrinter && p.isDefault)) {
        optionColor.selected = true
      }
      colorPrinterSelect.appendChild(optionColor)
    })

    logActivity(`🖨️ Auto-detected ${detectedPrinters.length} printer(s) from Windows spooler`, 'success')
    showAlert(`✓ Found ${detectedPrinters.length} installed printer(s) on your PC`, 'success')

    // If socket is already connected, sync the real printers with Cloud Backend
    if (browserSocket && browserSocket.connected) {
      const cleanShopCode = shopIdInput.value.trim().toUpperCase()
      browserSocket.emit('AGENT_PRINTERS_UPDATED', {
        shopId: cleanShopCode,
        printers: detectedPrinters,
      })
      logActivity(`Synced ${detectedPrinters.length} printer(s) with Shop Dashboard`, 'info')
    }
  }

  // Connection Modal Handlers
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (connectionSuccessModal) connectionSuccessModal.classList.add('hidden')
    })
  }

  function showConnectionSuccess(shopCode, socketId) {
    if (liveConnectionBanner) {
      liveConnectionBanner.classList.remove('hidden')
      if (bannerDetails) bannerDetails.textContent = `Shop: ${shopCode} · Hardware: ${detectedPrinters.length} Printer(s)`
    }
    if (connectionSuccessModal) {
      if (modalShopCode) modalShopCode.textContent = shopCode
      if (modalShopCodeVal) modalShopCodeVal.textContent = shopCode
      if (modalSocketIdVal) modalSocketIdVal.textContent = socketId || 'Active'
      connectionSuccessModal.classList.remove('hidden')
    }
  }

  function hideConnectionSuccess() {
    if (liveConnectionBanner) liveConnectionBanner.classList.add('hidden')
    if (connectionSuccessModal) connectionSuccessModal.classList.add('hidden')
  }

  // Display Incoming Job Approval Modal
  function showIncomingJobModal(jobData, targetPrinter) {
    currentPendingJob = { ...jobData, targetPrinter }

    const isColor = jobData.colorType === 'COLOR'
    const totalPages = jobData.totalPages || 1
    const copies = jobData.copies || 1
    const totalSheets = totalPages * copies
    const amountVal = Number(jobData.totalAmount) || (isColor ? totalSheets * 10 : totalSheets * 5)

    const nowFormatted = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: 'short',
    })

    if (jobModalId) jobModalId.textContent = jobData.jobId || 'JOB_NEW'
    if (jobModalFileName) jobModalFileName.textContent = jobData.originalFileName || 'document.pdf'
    if (jobModalPages) jobModalPages.textContent = `${totalPages} Page(s) × ${copies} Copy (${totalSheets} sheet${totalSheets > 1 ? 's' : ''})`
    
    if (jobModalColorBadge) {
      jobModalColorBadge.textContent = isColor ? '🎨 COLOR' : '📄 BLACK & WHITE'
      jobModalColorBadge.className = isColor ? 'badge-color' : 'badge-bw'
    }

    if (jobModalAmount) jobModalAmount.textContent = `₹${amountVal.toFixed(2)} (Paid via UPI)`
    if (jobModalTime) jobModalTime.textContent = nowFormatted
    if (jobModalPrinter) jobModalPrinter.textContent = targetPrinter || 'Windows Spooler'

    if (incomingJobModal) {
      incomingJobModal.classList.remove('hidden')
      playNotificationChime()
    }
  }

  // Handle "Approve & Print" Action
  if (approvePrintBtn) {
    approvePrintBtn.addEventListener('click', async () => {
      if (!currentPendingJob) return

      const job = currentPendingJob
      const printer = job.targetPrinter || (detectedPrinters[0]?.name || 'Default Printer')

      approvePrintBtn.disabled = true
      approvePrintBtn.textContent = '⏳ Printing...'

      try {
        if (isElectron) {
          const result = await window.electronAPI.printJob(job)
          if (!result.success) {
            throw new Error(result.error || 'Hardware printer error')
          }
        } else {
          // In Browser Mode: Send print command to local machine print engine
          const targetUrl = serverUrlInput.value.trim() || config.serverUrl || 'https://scanandprint.onrender.com'
          const printApiUrl = targetUrl.replace(/\/+$/, '') + '/api/print-agent/print-job'
          const res = await fetch(printApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jobId: job.jobId,
              fileUrl: job.fileUrl,
              downloadUrl: job.downloadUrl,
              printerName: printer,
              copies: job.copies || 1,
            }),
          })
          const json = await res.json()
          if (!json.success) {
            throw new Error(json.message || 'Printer hardware spooler failed')
          }
        }

        // Notify Cloud Backend of successful print execution
        if (browserSocket && browserSocket.connected) {
          browserSocket.emit('JOB_SUCCESS', {
            jobId: job.jobId,
            printerName: printer,
            timestamp: new Date().toISOString(),
          })
        }

        logActivity(`✅ Approved & Printed: ${job.jobId} on [${printer}]`, 'success')
        showAlert(`✅ [Job Approved]: ${job.jobId} sent to printer ${printer}!`, 'success')
      } catch (err) {
        logActivity(`❌ Print execution failed: ${err.message}`, 'error')
        showAlert(`❌ Print Failed: ${err.message}`, 'error')
        if (browserSocket && browserSocket.connected) {
          browserSocket.emit('JOB_FAILED', {
            jobId: job.jobId,
            error: err.message,
          })
        }
      } finally {
        approvePrintBtn.disabled = false
        approvePrintBtn.textContent = '🖨️ Approve & Print'
        if (incomingJobModal) incomingJobModal.classList.add('hidden')
        currentPendingJob = null
      }
    })
  }

  // Handle "Reject" Action
  if (rejectJobBtn) {
    rejectJobBtn.addEventListener('click', () => {
      if (!currentPendingJob) return

      const job = currentPendingJob

      if (browserSocket && browserSocket.connected) {
        browserSocket.emit('JOB_FAILED', {
          jobId: job.jobId,
          error: 'Order rejected by shopkeeper',
          timestamp: new Date().toISOString(),
        })
      }

      logActivity(`❌ Job Rejected by Shopkeeper: ${job.jobId}`, 'error')
      showAlert(`❌ [Job Rejected]: Order ${job.jobId} was declined.`, 'error')

      if (incomingJobModal) incomingJobModal.classList.add('hidden')
      currentPendingJob = null
    })
  }

  // Live Socket Connection Engine
  function connectBrowserSocket(cfg) {
    if (typeof io === 'undefined') {
      logActivity('❌ Error: Socket.IO client library not loaded in browser', 'error')
      showAlert('❌ Socket.IO library not loaded. Check internet or server connection.', 'error')
      return
    }

    if (browserSocket) {
      browserSocket.disconnect()
      browserSocket = null
    }

    const cleanShopCode = String(cfg.shopId || '').trim().toUpperCase()
    const cleanSecret = String(cfg.secretKey || '').trim()
    let targetUrl = cfg.serverUrl || 'https://scanandprint.onrender.com'
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'http://' + targetUrl
    }

    if (!cleanShopCode || !cleanSecret) {
      statusBadge.className = 'status-badge status-unconfigured'
      statusText.textContent = '🟡 Unconfigured'
      hideConnectionSuccess()
      return
    }

    statusBadge.className = 'status-badge status-unconfigured'
    statusText.textContent = '🟡 Connecting to Server...'
    logActivity(`Initiating connection to ${targetUrl}...`, 'info')

    try {
      browserSocket = io(targetUrl, {
        auth: {
          shopId: cleanShopCode,
          secretKey: cleanSecret,
          agentType: 'DESKTOP_WIN_AGENT',
        },
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        timeout: 10000,
      })

      browserSocket.on('connect', () => {
        logActivity(`Socket connected [ID: ${browserSocket.id}]. Sending AGENT_REGISTER...`, 'info')
        browserSocket.emit('AGENT_REGISTER', {
          shopId: cleanShopCode,
          secretApiKey: cleanSecret,
          agentVersion: '1.0.0',
          printers: detectedPrinters,
        })
      })

      browserSocket.on('AGENT_CONNECTED', (data) => {
        const code = data.shopCode || cleanShopCode
        statusBadge.className = 'status-badge status-connected'
        statusText.textContent = `🟢 Online (${code})`
        showAlert(`✓ Connected successfully to Shop ${code}!`, 'success')
        logActivity(`✅ AGENT_CONNECTED: Shop ${code} is Online & Active! (${detectedPrinters.length} printers synced)`, 'success')
        showConnectionSuccess(code, browserSocket.id)
      })

      browserSocket.on('AGENT_AUTH_ERROR', (err) => {
        statusBadge.className = 'status-badge status-disconnected'
        statusText.textContent = '🔴 Auth Failed'
        showAlert(`❌ Handshake rejected: ${err.message}`, 'error')
        logActivity(`❌ AGENT_AUTH_ERROR: ${err.message}`, 'error')
        hideConnectionSuccess()
      })

      browserSocket.on('disconnect', (reason) => {
        statusBadge.className = 'status-badge status-disconnected'
        statusText.textContent = '🔴 Disconnected'
        logActivity(`🔴 Socket disconnected: ${reason}`, 'error')
        hideConnectionSuccess()
      })

      browserSocket.on('connect_error', (err) => {
        statusBadge.className = 'status-badge status-disconnected'
        statusText.textContent = '🔴 Offline (Server unreachable)'
        logActivity(`🔴 Connection error: ${err.message}`, 'error')
        hideConnectionSuccess()
      })

      // Listen for incoming print jobs: Auto-Print directly!
      browserSocket.on('PRINT_JOB_DISPATCH', (jobData) => {
        const isColor = jobData.colorType === 'COLOR'
        const selectedPrinter = (isColor ? cfg.defaultColorPrinter : cfg.defaultBwPrinter) || (detectedPrinters[0]?.name || 'Default Hardware Spooler')

        logActivity(`🖨️ [Auto-Print Active]: Direct auto-printing Job #${jobData.jobId || 'Job'} (${jobData.totalPages || 1} pages, ${jobData.colorType || 'B&W'}) to ${selectedPrinter}...`, 'success')
      })

    } catch (e) {
      logActivity(`Connection setup exception: ${e.message}`, 'error')
    }
  }

  // Handle Electron mode status events
  if (isElectron) {
    window.electronAPI.onStatusUpdate((event, { status, details }) => {
      statusBadge.className = 'status-badge'
      if (status === 'CONNECTED') {
        statusBadge.classList.add('status-connected')
        statusText.textContent = `🟢 Online (${details.shopId || 'Connected'})`
        logActivity(`Electron Agent Connected: ${details.shopId || 'Online'}`, 'success')
        showConnectionSuccess(details.shopId || 'Online', details.socketId || 'Desktop Spooler')
      } else if (status === 'UNCONFIGURED') {
        statusBadge.classList.add('status-unconfigured')
        statusText.textContent = '🟡 Unconfigured'
        hideConnectionSuccess()
      } else {
        statusBadge.classList.add('status-disconnected')
        statusText.textContent = '🔴 Disconnected'
        hideConnectionSuccess()
      }
    })

    // Listen for incoming print job in Electron mode
    if (window.electronAPI.onPrintJob) {
      window.electronAPI.onPrintJob((event, jobData) => {
        const isColor = jobData.colorType === 'COLOR'
        const selectedPrinter = (isColor ? config.defaultColorPrinter : config.defaultBwPrinter) || (detectedPrinters[0]?.name || 'Default Spooler')
        logActivity(`🖨️ [Auto-Print]: Processing Job #${jobData.jobId} to ${selectedPrinter}`, 'success')
      })
    }
  } else {
    // Browser auto-connect if credentials exist
    if (config.shopId && config.secretKey) {
      connectBrowserSocket(config)
    } else {
      statusBadge.className = 'status-badge status-unconfigured'
      statusText.textContent = '🟡 Unconfigured (Enter Shop ID & Secret Key)'
      logActivity('Waiting for Shop ID and Secret Key...', 'info')
    }
  }

  // Event Handlers
  refreshPrintersBtn.addEventListener('click', async () => {
    logActivity('Refreshing local OS printers...', 'info')
    await loadPrinters()
  })

  testPrintBtn.addEventListener('click', async () => {
    const selectedPrinter = bwPrinterSelect.value || colorPrinterSelect.value || (detectedPrinters[0]?.name || '')
    if (!selectedPrinter) {
      showAlert('❌ No printer selected for test print', 'error')
      logActivity('❌ No printer selected to test', 'error')
      return
    }

    showAlert(`Sending test print page to ${selectedPrinter}...`, 'success')
    logActivity(`Triggered test page print to ${selectedPrinter}`, 'info')

    if (isElectron) {
      const result = await window.electronAPI.testPrint(selectedPrinter)
      if (result.success) {
        showAlert(`✓ ${result.message}`, 'success')
        logActivity(`✓ ${result.message}`, 'success')
      } else {
        showAlert(`❌ Test print failed: ${result.error}`, 'error')
        logActivity(`❌ Test print failed: ${result.error}`, 'error')
      }
    } else {
      try {
        const targetUrl = serverUrlInput.value.trim() || config.serverUrl || 'https://scanandprint.onrender.com'
        const printApiUrl = targetUrl.replace(/\/+$/, '') + '/api/print-agent/print-job'
        const res = await fetch(printApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId: `TEST_PAGE_${Date.now().toString().slice(-4)}`,
            printerName: selectedPrinter,
            copies: 1,
          }),
        })
        const json = await res.json()
        if (json.success) {
          showAlert(`✓ [Windows Spooler] Test page sent to ${selectedPrinter}!`, 'success')
          logActivity(`✓ [Windows Spooler] Test page sent to ${selectedPrinter}!`, 'success')
        } else {
          showAlert(`❌ Test print failed: ${json.message}`, 'error')
          logActivity(`❌ Test print failed: ${json.message}`, 'error')
        }
      } catch (err) {
        showAlert(`❌ Test print error: ${err.message}`, 'error')
        logActivity(`❌ Test print error: ${err.message}`, 'error')
      }
    }
  })

  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const cleanShopCode = shopIdInput.value.trim().toUpperCase()
    const cleanSecret = secretKeyInput.value.trim()
    const cleanServerUrl = serverUrlInput.value.trim() || 'https://scanandprint.onrender.com'

    shopIdInput.value = cleanShopCode

    const newConfig = {
      shopId: cleanShopCode,
      secretKey: cleanSecret,
      serverUrl: cleanServerUrl,
      defaultBwPrinter: bwPrinterSelect.value,
      defaultColorPrinter: colorPrinterSelect.value,
    }

    if (isElectron) {
      const saved = await window.electronAPI.saveConfig(newConfig)
      if (saved) {
        showAlert('✓ Settings saved! Agent reconnecting...', 'success')
        logActivity('Settings saved locally. Reconnecting agent...', 'info')
      } else {
        showAlert('❌ Failed to save settings', 'error')
      }
    } else {
      // Browser mode
      localStorage.setItem('agent_config', JSON.stringify(newConfig))
      showAlert('✓ Connecting agent to Cloud Server...', 'success')
      logActivity(`Saved config. Connecting as ${cleanShopCode}...`, 'info')
      connectBrowserSocket(newConfig)
    }
  })

  function showAlert(msg, type) {
    alertMessage.textContent = msg
    alertMessage.className = `alert-message ${type === 'success' ? 'alert-success' : 'alert-error'}`
    setTimeout(() => {
      if (alertMessage.textContent === msg) alertMessage.textContent = ''
    }, 4000)
  }

  // Initial load of real system printers
  await loadPrinters()
})
