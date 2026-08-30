// Client-side UI Controller for Scan&Print Desktop Agent Dashboard
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
  const saveAssignmentBtn = document.getElementById('saveAssignmentBtn')
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

  const sidebarStatusDot = document.getElementById('sidebarStatusDot')
  const sidebarStatusLabel = document.getElementById('sidebarStatusLabel')

  const printersCountVal = document.getElementById('printersCountVal')
  const jobsCountVal = document.getElementById('jobsCountVal')
  const appVersionSpan = document.getElementById('appVersion')
  const navPrintersBadge = document.getElementById('navPrintersBadge')

  const printerCardsGrid = document.getElementById('printerCardsGrid')
  const dashboardPrinterSummary = document.getElementById('dashboardPrinterSummary')

  const activityLog = document.getElementById('activityLog')
  const dashboardMiniLog = document.getElementById('dashboardMiniLog')
  const clearLogBtn = document.getElementById('clearLogBtn')
  const openLogFileBtn = document.getElementById('openLogFileBtn')

  const reconnectBtn = document.getElementById('reconnectBtn')
  const openLogsBtn = document.getElementById('openLogsBtn')
  const minimizeBtn = document.getElementById('minimizeBtn')
  const exitBtn = document.getElementById('exitBtn')

  const jobBanner = document.getElementById('jobBanner')
  const bannerJobTitle = document.getElementById('bannerJobTitle')
  const bannerJobSubtitle = document.getElementById('bannerJobSubtitle')

  const sidebar = document.getElementById('sidebar')
  const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn')
  const navItems = document.querySelectorAll('.nav-item')
  const panels = document.querySelectorAll('.panel')

  let detectedPrinters = []
  let detailedPrinters = []
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

  // ===========================================================================
  // Sidebar navigation (panel switching + collapse)
  // ===========================================================================
  function switchPanel(panelName) {
    panels.forEach((p) => p.classList.toggle('active', p.id === `panel-${panelName}`))
    navItems.forEach((n) => n.classList.toggle('active', n.dataset.panel === panelName))
  }

  navItems.forEach((item) => {
    item.addEventListener('click', () => switchPanel(item.dataset.panel))
  })

  document.querySelectorAll('[data-goto-panel]').forEach((btn) => {
    btn.addEventListener('click', () => switchPanel(btn.dataset.gotoPanel))
  })

  if (sidebarCollapseBtn) {
    // Restore persisted collapse preference (UI-only, not shop data)
    try {
      if (localStorage.getItem('sp_sidebar_collapsed') === '1') {
        sidebar.classList.add('collapsed')
      }
    } catch (e) {}

    sidebarCollapseBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed')
      try {
        localStorage.setItem('sp_sidebar_collapsed', sidebar.classList.contains('collapsed') ? '1' : '0')
      } catch (e) {}
    })
  }

  // Toast / Alert Notification Helper
  function showToast(msg, type = 'success') {
    if (!toastMessage) return
    toastMessage.textContent = msg
    toastMessage.className = `toast-msg toast-${type}`
    setTimeout(() => {
      if (toastMessage.textContent === msg) toastMessage.textContent = ''
    }, 4000)
  }

  // Activity Logger Helper (writes to both the full log tab and the dashboard mini-feed)
  function logActivity(tag, text, type = 'info') {
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false })
    const html = `<span class="log-time">[${time}]</span><span class="log-tag-${type}">[${tag}]</span> <span style="color: var(--text-primary);">${text}</span>`

    if (activityLog) {
      const entry = document.createElement('div')
      entry.className = 'log-entry'
      entry.innerHTML = html
      activityLog.appendChild(entry)
      activityLog.scrollTop = activityLog.scrollHeight
    }

    if (dashboardMiniLog) {
      const miniEntry = document.createElement('div')
      miniEntry.className = 'log-entry'
      miniEntry.innerHTML = html
      dashboardMiniLog.appendChild(miniEntry)
      dashboardMiniLog.scrollTop = dashboardMiniLog.scrollHeight
      // Keep the mini feed short
      while (dashboardMiniLog.children.length > 25) {
        dashboardMiniLog.removeChild(dashboardMiniLog.firstChild)
      }
    }
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
    bannerJobTitle.textContent = `Order #${job.jobId || 'NEW'} (${job.colorType === 'COLOR' ? 'Color' : 'B&W'})`
    bannerJobSubtitle.textContent = `${job.originalFileName || 'document.pdf'} · ${job.totalPages || 1} page(s) → Spooling`
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

  // Create Desktop Shortcut Action
  if (createShortcutBtn) {
    createShortcutBtn.addEventListener('click', async () => {
      if (isElectron && typeof window.electronAPI.createDesktopShortcut === 'function') {
        try {
          createShortcutBtn.disabled = true
          createShortcutBtn.innerHTML = '<span>Creating Shortcut...</span> <i class="bx bx-loader-alt bx-spin"></i>'
          const result = await window.electronAPI.createDesktopShortcut()
          if (result && result.success) {
            showToast('Shortcut created on your Windows Desktop!', 'success')
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

  // ===========================================================================
  // Printer capability badges / icons — real, driver-reported data ONLY.
  // Nothing here is hardcoded by printer name/brand; every flag comes from
  // printerManager.getPrintersWithCapabilities() (Windows WMI + PrintConfiguration).
  // ===========================================================================
  function statusToClass(statusText) {
    return String(statusText || 'unknown').toLowerCase().replace(/\s+/g, '-')
  }

  function buildCapBadge(isYes, iconYes, iconNo, labelYes, labelNo, capClass) {
    const known = isYes !== null && isYes !== undefined
    const cls = `cap-badge ${known ? (isYes ? `cap-yes ${capClass}` : 'cap-no') : 'cap-no'}`
    const icon = known ? (isYes ? iconYes : iconNo) : 'bx-question-mark'
    const label = known ? (isYes ? labelYes : labelNo) : 'Unknown'
    return `<span class="${cls}"><i class='bx ${icon}'></i>${label}</span>`
  }

  function renderPrinterCard(p) {
    const statusCls = statusToClass(p.statusText)
    const colorBadge = buildCapBadge(p.supportsColor, 'bx-palette', 'bx-brightness', 'Color', 'B&W only', 'cap-color')
    const duplexBadge = buildCapBadge(p.supportsDuplex, 'bx-duplicate', 'bx-file-blank', 'Double-sided', 'Single-sided only', 'cap-duplex')

    return `
      <div class="printer-card ${p.isOnline ? 'is-online' : ''}">
        <div class="printer-card-top">
          <div class="printer-card-icon"><i class='bx bx-printer'></i></div>
          <div class="printer-card-name-wrap">
            <div class="printer-card-name" title="${p.name}">${p.name}</div>
            <div class="printer-card-port">${p.portName || p.driverName || 'Local Spooler'}</div>
            ${p.isDefault ? '<div class="printer-card-default-tag">Windows Default</div>' : ''}
          </div>
          <span class="printer-status-badge status-${statusCls}">
            <span class="status-dot"></span>${p.statusText || 'Unknown'}
          </span>
        </div>
        <div class="printer-cap-row">
          ${colorBadge}
          ${duplexBadge}
        </div>
      </div>
    `
  }

  async function loadDetailedPrinterStatus() {
    if (!printerCardsGrid) return
    if (!isElectron || typeof window.electronAPI.getPrintersStatus !== 'function') {
      printerCardsGrid.innerHTML = '<div class="empty-state-mini">Live printer status is only available in the desktop app.</div>'
      return
    }

    try {
      const list = await window.electronAPI.getPrintersStatus()
      detailedPrinters = Array.isArray(list) ? list : []

      if (detailedPrinters.length === 0) {
        printerCardsGrid.innerHTML = '<div class="empty-state-mini">No printers detected on this PC. Connect a printer and hit Refresh.</div>'
        if (dashboardPrinterSummary) dashboardPrinterSummary.innerHTML = '<div class="empty-state-mini">No printers detected.</div>'
        return
      }

      printerCardsGrid.innerHTML = detailedPrinters.map(renderPrinterCard).join('')

      // Dashboard quick-glance summary chips
      if (dashboardPrinterSummary) {
        const onlineCount = detailedPrinters.filter((p) => p.isOnline).length
        const colorCount = detailedPrinters.filter((p) => p.supportsColor).length
        const duplexCount = detailedPrinters.filter((p) => p.supportsDuplex).length
        dashboardPrinterSummary.innerHTML = `
          <span class="printer-summary-chip"><i class='bx bx-printer'></i> ${detailedPrinters.length} Printer(s)</span>
          <span class="printer-summary-chip" style="color: var(--emerald);"><i class='bx bxs-circle' style="font-size:8px;"></i> ${onlineCount} Online</span>
          <span class="printer-summary-chip" style="color: #38bdf8;"><i class='bx bx-palette'></i> ${colorCount} Color-capable</span>
          <span class="printer-summary-chip" style="color: var(--emerald);"><i class='bx bx-duplicate'></i> ${duplexCount} Duplex-capable</span>
        `
      }

      if (navPrintersBadge) navPrintersBadge.textContent = String(detailedPrinters.length)
    } catch (err) {
      printerCardsGrid.innerHTML = `<div class="empty-state-mini">Could not read printer status: ${err.message}</div>`
    }
  }

  // Query and Populate REAL Installed Windows OS Spooler Printers (for the
  // B&W / Color assignment dropdowns)
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

  async function refreshAllPrinterData() {
    await Promise.all([loadPrinters(), loadDetailedPrinterStatus()])
  }

  if (refreshPrintersBtn) {
    refreshPrintersBtn.addEventListener('click', async () => {
      refreshPrintersBtn.disabled = true
      refreshPrintersBtn.innerHTML = '<span>Refreshing...</span> <i class="bx bx-loader-alt bx-spin"></i>'
      await refreshAllPrinterData()
      refreshPrintersBtn.disabled = false
      refreshPrintersBtn.innerHTML = '<span>Refresh</span> <i class="bx bx-refresh"></i>'
      showToast('Printer status updated', 'success')
    })
  }

  // Save just the B&W / Color printer assignment (without touching credentials)
  if (saveAssignmentBtn) {
    saveAssignmentBtn.addEventListener('click', async () => {
      const newAssignment = {
        defaultBwPrinter: bwPrinterSelect.value,
        defaultColorPrinter: colorPrinterSelect.value,
      }
      config = { ...config, ...newAssignment }
      if (isElectron) {
        const saved = await window.electronAPI.saveConfig(newAssignment)
        if (saved) {
          showToast('Printer assignment saved!', 'success')
          logActivity('CONFIG', `B&W → ${newAssignment.defaultBwPrinter || 'none'} | Color → ${newAssignment.defaultColorPrinter || 'none'}`, 'ready')
        } else {
          showToast('Failed to save printer assignment', 'error')
        }
      }
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
          showToast(`Test print sent successfully to ${printerName}!`, 'success')
          logActivity('PRINT', `Test page spool completed on ${printerName}`, 'online')
        } else {
          showToast(`Test print failed: ${result?.error || 'Unknown error'}`, 'error')
          logActivity('ERROR', `Test print failed: ${result?.error || 'Unknown error'}`, 'error')
        }
      } catch (err) {
        showToast(`Spooler error: ${err.message}`, 'error')
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
        showToast('Credentials saved! Connecting to cloud...', 'success')
        logActivity('CONFIG', `Credentials saved for ${cleanShopCode}. Reconnecting...`, 'ready')
      } else {
        showToast('Failed to save configuration', 'error')
      }
    } else {
      localStorage.setItem('scanandprint_agent_config', JSON.stringify(newConfig))
      showToast('Saved locally', 'success')
    }

    saveBtn.disabled = false
    saveBtn.innerHTML = '<span>Save Credentials & Connect <i class="bx bx-rocket"></i></span>'
  })

  // Status Change Listener from Electron Main Process
  function updateUIStatus(status, details = {}) {
    statusCard.className = 'status-card ' + status.toLowerCase()
    statusPill.className = 'status-pill ' + status.toLowerCase()

    function setSidebarStatus(label, colorVar) {
      if (sidebarStatusLabel) sidebarStatusLabel.textContent = label
      if (sidebarStatusDot) sidebarStatusDot.style.color = colorVar
    }

    if (status === 'CONNECTED') {
      statusText.innerHTML = 'Connected & Authorized <i class="bx bxs-zap"></i>'
      statusDot.className = 'status-dot pulse-animation'
      setSidebarStatus('Connected', 'var(--emerald)')
      if (displayShopCode && details.shopId) displayShopCode.textContent = details.shopId
      logActivity('ONLINE', `Connected & Bound to PC (${details.hostname || 'This PC'})`, 'online')
    } else if (status === 'DEVICE_NOT_APPROVED') {
      statusText.innerHTML = 'Pending Approval <i class="bx bx-time-five"></i>'
      statusDot.className = 'status-dot'
      setSidebarStatus('Pending Approval', 'var(--amber)')
      logActivity('DEVICE', 'Device Pending: Open your Shop Dashboard > Devices to approve this PC.', 'job')
      showToast('Device Approval Required! Approve this PC from your Shop Dashboard.', 'error')
    } else if (status === 'DEVICE_REVOKED') {
      statusText.innerHTML = 'Device Unlinked <i class="bx bx-shield-x"></i>'
      statusDot.className = 'status-dot'
      setSidebarStatus('Unlinked', 'var(--rose)')
      logActivity('DEVICE', `${details.message || 'Device authorization was revoked.'}`, 'error')
      showToast(details.message || 'Device unlinked from shop.', 'error')
    } else if (status === 'DISCONNECTED') {
      statusText.textContent = 'Disconnected (Retrying...)'
      statusDot.className = 'status-dot'
      setSidebarStatus('Disconnected', 'var(--rose)')
      logActivity('OFFLINE', 'Connection to Cloud Server lost. Retrying...', 'error')
    } else if (status === 'UNCONFIGURED') {
      statusText.textContent = 'Awaiting Shop Setup'
      statusDot.className = 'status-dot'
      setSidebarStatus('Setup Needed', 'var(--amber)')
      logActivity('SETUP', 'Shop ID or Secret Key missing. Please pair your shop.', 'job')
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
  // NOTE: jobData uses the same field names as the rest of the app's job
  // payloads (colorType, originalFileName, totalPages) - NOT colorMode/
  // fileName/pages, which never matched any real payload sent by the backend.
  if (isElectron && typeof window.electronAPI.onIncomingJob === 'function') {
    window.electronAPI.onIncomingJob((job) => {
      const eventType = job?.eventType || 'DISPATCHED'

      if (eventType === 'DISPATCHED') {
        totalJobsProcessed++
        if (jobsCountVal) jobsCountVal.textContent = totalJobsProcessed.toString()
        flashIncomingJobBanner(job)
        logActivity(
          'JOB',
          `<i class='bx bxs-zap'></i> Received Job #${job.jobId || 'NEW'} (${job.totalPages || 1}p, ${job.colorType === 'COLOR' ? 'Color' : 'B&W'}) → Spooling to printer`,
          'job'
        )
        // A job just ran - refresh live printer status shortly after so the
        // dashboard reflects the printer's real post-job state.
        setTimeout(loadDetailedPrinterStatus, 3000)
      } else if (eventType === 'SUCCESS') {
        logActivity('PRINT', `Job #${job.jobId || 'NEW'} printed successfully on ${job.printedOn || 'printer'}`, 'online')
      } else if (eventType === 'FAILED') {
        logActivity('ERROR', `Job #${job.jobId || 'NEW'} failed to print: ${job.error || 'Unknown error'}`, 'error')
        showToast(`Print failed for Job #${job.jobId || ''}: ${job.error || 'Unknown error'}`, 'error')
      }
    })
  }

  // Initial load
  await refreshAllPrinterData()
  logActivity('READY', 'Scan&Print Agent UI Ready. Background services online.', 'ready')

  // Keep the live Printers panel fresh in the background (every 20s) without
  // the user needing to click Refresh manually.
  setInterval(loadDetailedPrinterStatus, 20000)
})
