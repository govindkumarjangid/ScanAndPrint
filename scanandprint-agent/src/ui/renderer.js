// Client-side UI Controller for Scan&Print Desktop Agent
document.addEventListener('DOMContentLoaded', async () => {
  const shopIdInput = document.getElementById('shopId')
  const secretKeyInput = document.getElementById('secretKey')
  const serverUrlInput = document.getElementById('serverUrl')
  const toggleSecretBtn = document.getElementById('toggleSecretBtn')
  const bwPrinterSelect = document.getElementById('bwPrinter')
  const colorPrinterSelect = document.getElementById('colorPrinter')

  const refreshPrintersBtn = document.getElementById('refreshPrintersBtn')
  const testBwPrintBtn = document.getElementById('testBwPrintBtn')
  const testColorPrintBtn = document.getElementById('testColorPrintBtn')
  const createShortcutBtn = document.getElementById('createShortcutBtn')
  const autoStartToggle = document.getElementById('autoStartToggle')

  const settingsForm = document.getElementById('settingsForm')
  const saveBtn = document.getElementById('saveBtn')
  const toastMessage = document.getElementById('toastMessage')

  const statusCard = document.getElementById('statusCard')
  const statusPill = document.getElementById('statusPill')
  const statusDot = document.getElementById('statusDot')
  const statusText = document.getElementById('statusText')
  const displayShopCode = document.getElementById('displayShopCode')
  const copyShopCodeBtn = document.getElementById('copyShopCodeBtn')

  const printersCountVal = document.getElementById('printersCountVal')
  const jobsCountVal = document.getElementById('jobsCountVal')
  const appVersionSpan = document.getElementById('appVersion')

  const activityLog = document.getElementById('activityLog')
  const clearLogBtn = document.getElementById('clearLogBtn')
  const openLogFileBtn = document.getElementById('openLogFileBtn')

  const reconnectBtn = document.getElementById('reconnectBtn')
  const openLogsBtn = document.getElementById('openLogsBtn')
  const minimizeBtn = document.getElementById('minimizeBtn')
  const exitBtn = document.getElementById('exitBtn')

  const jobBanner = document.getElementById('jobBanner')
  const bannerJobTitle = document.getElementById('bannerJobTitle')
  const bannerJobSubtitle = document.getElementById('bannerJobSubtitle')

  let detectedPrinters = []
  let totalJobsProcessed = 0
  let isPasswordVisible = false

  let config = {
    shopId: '',
    secretKey: '',
    serverUrl: 'https://scanandprint.onrender.com',
    defaultBwPrinter: '',
    defaultColorPrinter: '',
    autoStartOnBoot: true,
  }

  const isElectron = window.electronAPI && typeof window.electronAPI.getConfig === 'function'

  // Disable Ctrl + Wheel Zoom & Ctrl + +/-/0 Zoom Shortcuts so scrolling works naturally
  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault()
    }
  }, { passive: false })

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && ['+', '-', '=', '_', '0', 'NumpadAdd', 'NumpadSubtract'].includes(e.key)) {
      e.preventDefault()
    }
  })

  // Toast / Alert Notification Helper
  function showToast(msg, type = 'success') {
    if (!toastMessage) return
    toastMessage.textContent = msg
    toastMessage.className = `toast-msg toast-${type}`
    setTimeout(() => {
      if (toastMessage.textContent === msg) toastMessage.textContent = ''
    }, 4000)
  }

  // Activity Logger Helper
  function logActivity(tag, text, type = 'info') {
    if (!activityLog) return
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false })
    const entry = document.createElement('div')
    entry.className = 'log-entry'
    entry.innerHTML = `<span class="log-time">[${time}]</span><span class="log-tag-${type}">[${tag}]</span> <span style="color: var(--text-primary);">${text}</span>`
    activityLog.appendChild(entry)
    activityLog.scrollTop = activityLog.scrollHeight
  }

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
    } catch (e) {}
  }

  // Show incoming print job banner briefly
  function flashIncomingJobBanner(job) {
    if (!jobBanner) return
    playNotificationChime()
    bannerJobTitle.textContent = `Order #${job.jobId || 'NEW'} (${job.colorMode === 'COLOR' ? 'Color' : 'B&W'})`
    bannerJobSubtitle.textContent = `${job.fileName || 'document.pdf'} · ${job.pages || 1} page(s) → Spooling`
    jobBanner.style.display = 'flex'
    setTimeout(() => {
      jobBanner.style.display = 'none'
    }, 4500)
  }

  // Load App Version
  if (isElectron && typeof window.electronAPI.getAppVersion === 'function') {
    try {
      const ver = await window.electronAPI.getAppVersion()
      if (ver && appVersionSpan) appVersionSpan.textContent = `v${ver}`
    } catch (e) {}
  }

  // Load Saved Configuration
  if (isElectron) {
    try {
      const saved = await window.electronAPI.getConfig()
      if (saved) {
        config = { ...config, ...saved }
      }
    } catch (e) {
      console.warn('Error loading config:', e)
    }
  } else {
    try {
      const cached = localStorage.getItem('scanandprint_agent_config')
      if (cached) config = { ...config, ...JSON.parse(cached) }
    } catch (e) {}
  }

  // Populate Input Fields
  shopIdInput.value = config.shopId || ''
  secretKeyInput.value = config.secretKey || ''
  const currentUrl = (config.serverUrl && config.serverUrl !== 'http://localhost:5000' && config.serverUrl !== 'http://127.0.0.1:5000') ? config.serverUrl : 'https://scanandprint.onrender.com'
  serverUrlInput.value = currentUrl
  if (autoStartToggle) autoStartToggle.checked = config.autoStartOnBoot !== false
  if (displayShopCode) displayShopCode.textContent = config.shopId || 'UNSET'

  // Toggle Password Mask
  if (toggleSecretBtn) {
    toggleSecretBtn.addEventListener('click', () => {
      isPasswordVisible = !isPasswordVisible
      secretKeyInput.type = isPasswordVisible ? 'text' : 'password'
      toggleSecretBtn.innerHTML = isPasswordVisible ? '<i class="bx bx-hide"></i>' : '<i class="bx bx-show"></i>'
    })
  }

  // Copy Shop ID Code
  if (copyShopCodeBtn) {
    copyShopCodeBtn.addEventListener('click', () => {
      if (!config.shopId) {
        showToast('Please set your Shop ID Code first', 'error')
        return
      }
      navigator.clipboard.writeText(config.shopId)
      showToast('Shop ID copied to clipboard!', 'success')
      logActivity('CLIPBOARD', `Copied Shop ID: ${config.shopId}`, 'info')
    })
  }

  // Header Actions
  if (reconnectBtn) {
    reconnectBtn.addEventListener('click', async () => {
      logActivity('SOCKET', 'Reconnecting to Cloud Server...', 'info')
      showToast('Reconnecting to server...', 'success')
      if (isElectron && typeof window.electronAPI.reconnectSocket === 'function') {
        await window.electronAPI.reconnectSocket()
      }
    })
  }

  if (openLogsBtn) {
    openLogsBtn.addEventListener('click', async () => {
      if (isElectron && typeof window.electronAPI.openLogsFolder === 'function') {
        await window.electronAPI.openLogsFolder()
      }
    })
  }

  if (openLogFileBtn) {
    openLogFileBtn.addEventListener('click', async () => {
      if (isElectron && typeof window.electronAPI.openLogsFolder === 'function') {
        await window.electronAPI.openLogsFolder()
      }
    })
  }

  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', async () => {
      if (isElectron && typeof window.electronAPI.minimizeWindow === 'function') {
        await window.electronAPI.minimizeWindow()
      }
    })
  }

  if (exitBtn) {
    exitBtn.addEventListener('click', async () => {
      if (isElectron && typeof window.electronAPI.exitApp === 'function') {
        await window.electronAPI.exitApp()
      }
    })
  }

  if (clearLogBtn) {
    clearLogBtn.addEventListener('click', () => {
      if (activityLog) {
        activityLog.innerHTML = `<div class="log-entry"><span class="log-time">[LOG]</span><span class="log-tag-info">Console cleared.</span></div>`
      }
    })
  }

  // Create Desktop Shortcut Action (Solves user's issue!)
  if (createShortcutBtn) {
    createShortcutBtn.addEventListener('click', async () => {
      if (isElectron && typeof window.electronAPI.createDesktopShortcut === 'function') {
        try {
          createShortcutBtn.disabled = true
          createShortcutBtn.innerHTML = '<span>Creating Shortcut...</span> <i class="bx bx-loader-alt bx-spin"></i>'
          const result = await window.electronAPI.createDesktopShortcut()
          if (result && result.success) {
            showToast(' Shortcut created on your Windows Desktop!', 'success')
            logActivity('SYSTEM', 'Desktop icon created at: ' + (result.path || 'Desktop'), 'ready')
          } else {
            showToast(result?.message || 'Could not create shortcut', 'error')
            logActivity('ERROR', 'Desktop shortcut error: ' + (result?.message || 'Unknown'), 'error')
          }
        } catch (err) {
          showToast('Error creating desktop shortcut', 'error')
        } finally {
          createShortcutBtn.disabled = false
          createShortcutBtn.innerHTML = '<span>Create Desktop Shortcut Icon <i class="bx bxs-pin"></i></span>'
        }
      } else {
        showToast('Desktop shortcuts are supported in the Windows app', 'info')
      }
    })
  }

  // Auto Start On Windows Boot Toggle
  if (autoStartToggle) {
    autoStartToggle.addEventListener('change', async () => {
      const enabled = autoStartToggle.checked
      config.autoStartOnBoot = enabled
      if (isElectron) {
        await window.electronAPI.saveConfig({ autoStartOnBoot: enabled })
        logActivity('SYSTEM', `Auto-start on Windows boot set to: ${enabled ? 'ENABLED' : 'DISABLED'}`, 'info')
        showToast(`Auto-start ${enabled ? 'enabled' : 'disabled'}!`, 'success')
      }
    })
  }

  // Query and Populate REAL Installed Windows OS Spooler Printers
  async function loadPrinters() {
    detectedPrinters = []
    if (printersCountVal) printersCountVal.textContent = 'Scanning...'

    if (isElectron) {
      try {
        const osPrinters = await window.electronAPI.getPrinters()
        if (Array.isArray(osPrinters)) detectedPrinters = osPrinters
      } catch (err) {
        console.error('Printer detection failed:', err)
      }
    }

    bwPrinterSelect.innerHTML = ''
    colorPrinterSelect.innerHTML = ''

    if (detectedPrinters.length === 0) {
      bwPrinterSelect.innerHTML = '<option value="">-- No Windows Printers Found --</option>'
      colorPrinterSelect.innerHTML = '<option value="">-- No Windows Printers Found --</option>'
      if (printersCountVal) printersCountVal.textContent = '0 Detected'
      logActivity('PRINTERS', 'No hardware printers detected on Windows spooler', 'error')
      return
    }

    if (printersCountVal) printersCountVal.textContent = `${detectedPrinters.length} Active`
    logActivity('PRINTERS', `Detected ${detectedPrinters.length} Windows Spooler printer(s)`, 'ready')

    let hasMatchedBw = false
    let hasMatchedColor = false

    detectedPrinters.forEach((printer) => {
      const pName = typeof printer === 'string' ? printer : printer.name
      const pLabel = typeof printer === 'string' ? printer : `${printer.name} ${printer.isDefault ? '(Default)' : ''}`

      const optBw = document.createElement('option')
      optBw.value = pName
      optBw.textContent = pLabel
      if (config.defaultBwPrinter && config.defaultBwPrinter === pName) {
        optBw.selected = true
        hasMatchedBw = true
      }
      bwPrinterSelect.appendChild(optBw)

      const optColor = document.createElement('option')
      optColor.value = pName
      optColor.textContent = pLabel
      if (config.defaultColorPrinter && config.defaultColorPrinter === pName) {
        optColor.selected = true
        hasMatchedColor = true
      }
      colorPrinterSelect.appendChild(optColor)
    })

    // Auto select first/default printer if not configured
    if (!hasMatchedBw && detectedPrinters.length > 0) {
      const first = typeof detectedPrinters[0] === 'string' ? detectedPrinters[0] : detectedPrinters[0].name
      bwPrinterSelect.value = first
      config.defaultBwPrinter = first
    }
    if (!hasMatchedColor && detectedPrinters.length > 0) {
      const first = typeof detectedPrinters[0] === 'string' ? detectedPrinters[0] : detectedPrinters[0].name
      colorPrinterSelect.value = first
      config.defaultColorPrinter = first
    }
  }

  if (refreshPrintersBtn) {
    refreshPrintersBtn.addEventListener('click', async () => {
      refreshPrintersBtn.disabled = true
      refreshPrintersBtn.innerHTML = '<span>Refreshing...</span> <i class="bx bx-loader-alt bx-spin"></i>'
      await loadPrinters()
      refreshPrintersBtn.disabled = false
      refreshPrintersBtn.innerHTML = '<span>Refresh</span> <i class="bx bx-refresh"></i>'
      showToast('Printers list updated', 'success')
    })
  }

  // Test Print Handlers
  async function handleTestPrint(printerName, modeLabel) {
    if (!printerName) {
      showToast('Please select a target printer first', 'error')
      return
    }

    logActivity('PRINT', `Sending ${modeLabel} test print page to: ${printerName}...`, 'print')
    showToast(`Sending test page to ${printerName}...`, 'success')

    if (isElectron) {
      try {
        const result = await window.electronAPI.testPrint(printerName, modeLabel)
        if (result && result.success) {
          showToast(`✓ Test print sent successfully to ${printerName}!`, 'success')
          logActivity('PRINT', `✓ Test page spool completed on ${printerName}`, 'online')
        } else {
          showToast(` Test print failed: ${result?.error || 'Unknown error'}`, 'error')
          logActivity('ERROR', `Test print failed: ${result?.error || 'Unknown error'}`, 'error')
        }
      } catch (err) {
        showToast(` Spooler error: ${err.message}`, 'error')
        logActivity('ERROR', `Spooler error: ${err.message}`, 'error')
      }
    }
  }

  if (testBwPrintBtn) {
    testBwPrintBtn.addEventListener('click', () => {
      handleTestPrint(bwPrinterSelect.value, 'Black & White')
    })
  }

  if (testColorPrintBtn) {
    testColorPrintBtn.addEventListener('click', () => {
      handleTestPrint(colorPrinterSelect.value, 'Color')
    })
  }

  // Save Settings & Connect
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const cleanShopCode = shopIdInput.value.trim().toUpperCase()
    const cleanSecret = secretKeyInput.value.trim()
    const cleanServerUrl = serverUrlInput.value.trim() || 'https://scanandprint.onrender.com'

    if (!cleanShopCode || !cleanSecret) {
      showToast('Please enter both Shop ID and Secret API Key', 'error')
      return
    }

    shopIdInput.value = cleanShopCode
    if (displayShopCode) displayShopCode.textContent = cleanShopCode

    const newConfig = {
      shopId: cleanShopCode,
      secretKey: cleanSecret,
      serverUrl: cleanServerUrl,
      defaultBwPrinter: bwPrinterSelect.value,
      defaultColorPrinter: colorPrinterSelect.value,
      autoStartOnBoot: autoStartToggle ? autoStartToggle.checked : true,
    }

    saveBtn.disabled = true
    saveBtn.innerHTML = '<span>Saving & Connecting...</span> <i class="bx bx-loader-alt bx-spin"></i>'

    if (isElectron) {
      const saved = await window.electronAPI.saveConfig(newConfig)
      if (saved) {
        config = { ...config, ...newConfig }
        showToast('✓ Credentials saved! Connecting to cloud...', 'success')
        logActivity('CONFIG', `Credentials saved for ${cleanShopCode}. Reconnecting...`, 'ready')
      } else {
        showToast(' Failed to save configuration', 'error')
      }
    } else {
      localStorage.setItem('scanandprint_agent_config', JSON.stringify(newConfig))
      showToast('✓ Saved locally', 'success')
    }

    saveBtn.disabled = false
    saveBtn.innerHTML = '<span>Save Credentials & Connect <i class="bx bx-rocket"></i></span>'
  })

  // Status Change Listener from Electron Main Process
  function updateUIStatus(status, details = {}) {
    statusCard.className = 'status-card ' + status.toLowerCase()
    statusPill.className = 'status-pill ' + status.toLowerCase()

    if (status === 'CONNECTED') {
      statusText.innerHTML = 'Connected & Authorized <i class="bx bxs-zap"></i>'
      statusDot.className = 'status-dot pulse-animation'
      if (displayShopCode && details.shopId) displayShopCode.textContent = details.shopId
      logActivity('ONLINE', ` Connected & Bound to PC (${details.hostname || 'This PC'})`, 'online')
    } else if (status === 'DEVICE_NOT_APPROVED') {
      statusText.innerHTML = 'Pending Approval <i class="bx bx-time-five"></i>'
      statusDot.className = 'status-dot'
      logActivity('DEVICE', '🔒 Device Pending: Open your Shop Dashboard > Devices to approve this PC.', 'job')
      showToast('⚠️ Device Approval Required! Approve this PC from your Shop Dashboard.', 'error')
    } else if (status === 'DEVICE_REVOKED') {
      statusText.innerHTML = 'Device Unlinked <i class="bx bx-shield-x"></i>'
      statusDot.className = 'status-dot'
      logActivity('DEVICE', `❌ ${details.message || 'Device authorization was revoked.'}`, 'error')
      showToast(details.message || 'Device unlinked from shop.', 'error')
    } else if (status === 'DISCONNECTED') {
      statusText.textContent = 'Disconnected (Retrying...)'
      statusDot.className = 'status-dot'
      logActivity('OFFLINE', ' Connection to Cloud Server lost. Retrying...', 'error')
    } else if (status === 'UNCONFIGURED') {
      statusText.textContent = 'Awaiting Shop Setup'
      statusDot.className = 'status-dot'
      logActivity('SETUP', ' Shop ID or Secret Key missing. Please pair your shop.', 'job')
    }
  }

  if (isElectron && typeof window.electronAPI.onStatusUpdate === 'function') {
    window.electronAPI.onStatusUpdate((payload) => {
      const status = payload?.status || payload
      const details = payload?.details || {}
      updateUIStatus(status, details)
    })
  }

  // Incoming Job Notification
  if (isElectron && typeof window.electronAPI.onIncomingJob === 'function') {
    window.electronAPI.onIncomingJob((job) => {
      totalJobsProcessed++
      if (jobsCountVal) jobsCountVal.textContent = totalJobsProcessed.toString()
      flashIncomingJobBanner(job)
      logActivity('JOB', `<i class='bx bxs-zap'></i> Received Job #${job.jobId || 'NEW'} (${job.pages || 1}p, ${job.colorMode || 'B&W'}) → Spooling to printer`, 'job')
    })
  }

  // Initial load
  await loadPrinters()
  logActivity('READY', 'Scan&Print Agent UI Ready. Background services online.', 'ready')
})
