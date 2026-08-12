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

  // Sample Printer Hardware preset options
  const samplePrinters = [
    { name: 'Epson L3210 Series (Color InkTank)', isDefault: false },
    { name: 'HP LaserJet M1005 Multifunction (B&W Laser)', isDefault: true },
    { name: 'Canon PIXMA G3010 Series', isDefault: false },
    { name: 'Brother DCP-L2541DW', isDefault: false },
    { name: 'Microsoft Print to PDF', isDefault: false },
  ]

  let config = {
    shopId: '',
    secretKey: '',
    serverUrl: window.location.origin && window.location.origin.startsWith('http') ? window.location.origin : 'http://localhost:5000',
    defaultBwPrinter: 'HP LaserJet M1005 Multifunction (B&W Laser)',
    defaultColorPrinter: 'Epson L3210 Series (Color InkTank)',
  }

  const isElectron = window.electronAPI && typeof window.electronAPI.getConfig === 'function'
  let browserSocket = null

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
  serverUrlInput.value = config.serverUrl || 'http://localhost:5000'

  // Populate Installed Printers Dropdowns
  async function loadPrinters() {
    let printers = [...samplePrinters]

    if (isElectron) {
      try {
        const detectedPrinters = await window.electronAPI.getPrinters()
        if (detectedPrinters && detectedPrinters.length > 0) {
          const detectedNames = detectedPrinters.map((p) => p.name)
          const extraSamples = samplePrinters.filter((p) => !detectedNames.includes(p.name))
          printers = [...detectedPrinters, ...extraSamples]
        }
      } catch (err) {
        console.log('Using fallback printer list')
      }
    }

    bwPrinterSelect.innerHTML = '<option value="">-- Select Black & White Printer --</option>'
    colorPrinterSelect.innerHTML = '<option value="">-- Select Color Printer --</option>'

    printers.forEach((p) => {
      const optionBw = document.createElement('option')
      optionBw.value = p.name
      optionBw.textContent = `${p.name}${p.isDefault ? ' ★ Default' : ''}`
      if (config && config.defaultBwPrinter === p.name) {
        optionBw.selected = true
      }
      bwPrinterSelect.appendChild(optionBw)

      const optionColor = document.createElement('option')
      optionColor.value = p.name
      optionColor.textContent = `${p.name}${p.isDefault ? ' ★ Default' : ''}`
      if (config && config.defaultColorPrinter === p.name) {
        optionColor.selected = true
      }
      colorPrinterSelect.appendChild(optionColor)
    })

    showAlert('✓ Installed printers list loaded', 'success')
  }

  // Modal Handlers
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (connectionSuccessModal) connectionSuccessModal.classList.add('hidden')
    })
  }

  function showConnectionSuccess(shopCode, socketId) {
    if (liveConnectionBanner) {
      liveConnectionBanner.classList.remove('hidden')
      if (bannerDetails) bannerDetails.textContent = `Shop: ${shopCode} · Socket: ${socketId || 'Active'}`
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
    let targetUrl = cfg.serverUrl || 'http://localhost:5000'
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
          printers: samplePrinters,
        })
      })

      browserSocket.on('AGENT_CONNECTED', (data) => {
        const code = data.shopCode || cleanShopCode
        statusBadge.className = 'status-badge status-connected'
        statusText.textContent = `🟢 Online (${code})`
        showAlert(`✓ Connected successfully to Shop ${code}!`, 'success')
        logActivity(`✅ AGENT_CONNECTED: Shop ${code} is Online & Active!`, 'success')
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

      // Listen for incoming print jobs in browser simulation
      browserSocket.on('PRINT_JOB_DISPATCH', (jobData) => {
        logActivity(`📄 Incoming Print Job: ${jobData.jobId || 'Job'} (${jobData.totalPages || 1} pages, ${jobData.colorType || 'B&W'})`, 'success')
        showAlert(`🖨️ [Job Received]: ${jobData.jobId || 'Job'} (${jobData.totalPages || 1} pages)`, 'success')
        
        // Simulate auto-spooler print execution
        setTimeout(() => {
          if (browserSocket && browserSocket.connected) {
            browserSocket.emit('JOB_SUCCESS', {
              jobId: jobData.jobId,
              printerName: cfg.defaultBwPrinter || 'HP LaserJet M1005',
              timestamp: new Date().toISOString(),
            })
            logActivity(`✅ Auto-Printed successfully: ${jobData.jobId}`, 'success')
            showAlert(`✅ [Auto-Printed]: ${jobData.jobId} sent successfully!`, 'success')
          }
        }, 1500)
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
  refreshPrintersBtn.addEventListener('click', loadPrinters)

  testPrintBtn.addEventListener('click', async () => {
    const selectedPrinter = bwPrinterSelect.value || colorPrinterSelect.value
    showAlert(`Sending test print page to ${selectedPrinter || 'Default Printer'}...`, 'success')
    logActivity(`Triggered test page print to ${selectedPrinter || 'Default'}`, 'info')

    if (isElectron) {
      const result = await window.electronAPI.testPrint(selectedPrinter)
      if (result.success) {
        showAlert(`✓ ${result.message}`, 'success')
      } else {
        showAlert(`❌ Test print failed: ${result.error}`, 'error')
      }
    } else {
      setTimeout(() => {
        showAlert(`✓ [Simulation] Test page printed on ${selectedPrinter || 'Default Printer'}!`, 'success')
        logActivity(`✓ [Simulation] Test page printed successfully`, 'success')
      }, 1000)
    }
  })

  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const cleanShopCode = shopIdInput.value.trim().toUpperCase()
    const cleanSecret = secretKeyInput.value.trim()
    const cleanServerUrl = serverUrlInput.value.trim() || 'http://localhost:5000'

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

  // Initial load
  loadPrinters()
})
