// Client-side UI Controller for Print Agent Settings
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

  const statusBadge = document.getElementById('statusBadge')
  const statusText = document.getElementById('statusText')

  // Sample Printer Hardware preset options for UI demonstration
  const samplePrinters = [
    { name: 'Epson L3210 Series (Color InkTank)', isDefault: false },
    { name: 'HP LaserJet M1005 Multifunction (B&W Laser)', isDefault: false },
    { name: 'Canon PIXMA G3010 Series', isDefault: false },
    { name: 'Brother DCP-L2541DW', isDefault: false },
    { name: 'Microsoft Print to PDF', isDefault: true },
  ]

  let config = {
    shopId: 'SHOP_TEST_999',
    secretKey: 'sec_test_secret_123456',
    serverUrl: 'http://localhost:5000',
    defaultBwPrinter: 'HP LaserJet M1005 Multifunction (B&W Laser)',
    defaultColorPrinter: 'Epson L3210 Series (Color InkTank)',
  }

  // Check if running inside Electron IPC Bridge
  const isElectron = window.electronAPI && typeof window.electronAPI.getConfig === 'function'

  if (isElectron) {
    try {
      const savedConfig = await window.electronAPI.getConfig()
      if (savedConfig && savedConfig.shopId) {
        config = savedConfig
      }
    } catch (e) {
      console.log('Using default test config')
    }
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
          // Merge detected printers with sample printers
          const detectedNames = detectedPrinters.map((p) => p.name)
          const extraSamples = samplePrinters.filter((p) => !detectedNames.includes(p.name))
          printers = [...detectedPrinters, ...extraSamples]
        }
      } catch (err) {
        console.log('Using fallback printer list for preview mode')
      }
    }

    bwPrinterSelect.innerHTML = '<option value="">-- Select Black & White Printer --</option>'
    colorPrinterSelect.innerHTML = '<option value="">-- Select Color Printer --</option>'

    printers.forEach((p) => {
      const optionBw = document.createElement('option')
      optionBw.value = p.name
      optionBw.textContent = `${p.name}${p.isDefault ? ' ★ System Default' : ''}`
      if (config && (config.defaultBwPrinter === p.name || (!config.defaultBwPrinter && p.name.includes('HP')))) {
        optionBw.selected = true
      }
      bwPrinterSelect.appendChild(optionBw)

      const optionColor = document.createElement('option')
      optionColor.value = p.name
      optionColor.textContent = `${p.name}${p.isDefault ? ' ★ System Default' : ''}`
      if (config && (config.defaultColorPrinter === p.name || (!config.defaultColorPrinter && p.name.includes('Epson')))) {
        optionColor.selected = true
      }
      colorPrinterSelect.appendChild(optionColor)
    })

    showAlert('✓ Installed printers list loaded', 'success')
  }

  // Set default preview status badge
  statusBadge.className = 'status-badge status-unconfigured'
  statusText.textContent = '🟡 UI Preview Mode (Ready for Backend)'

  // Listen for Agent Status Updates from Main Process (if running in Electron)
  if (isElectron) {
    window.electronAPI.onStatusUpdate((event, { status, details }) => {
      statusBadge.className = 'status-badge'
      if (status === 'CONNECTED') {
        statusBadge.classList.add('status-connected')
        statusText.textContent = `🟢 Connected (${details.shopId || 'Online'})`
      } else if (status === 'UNCONFIGURED') {
        statusBadge.classList.add('status-unconfigured')
        statusText.textContent = '🟡 Unconfigured'
      } else {
        statusBadge.classList.add('status-unconfigured')
        statusText.textContent = '🟡 Ready (Waiting for Backend Server)'
      }
    })
  }

  // Event Handlers
  refreshPrintersBtn.addEventListener('click', loadPrinters)

  testPrintBtn.addEventListener('click', async () => {
    const selectedPrinter = bwPrinterSelect.value || colorPrinterSelect.value
    showAlert(`Sending test print page to ${selectedPrinter || 'Default Printer'}...`, 'success')

    if (isElectron) {
      const result = await window.electronAPI.testPrint(selectedPrinter)
      if (result.success) {
        showAlert(`✓ ${result.message}`, 'success')
      } else {
        showAlert(`❌ Test print failed: ${result.error}`, 'error')
      }
    } else {
      setTimeout(() => {
        showAlert(`✓ [Preview Mode] Test page sent to ${selectedPrinter || 'Default Printer'}!`, 'success')
      }, 1000)
    }
  })

  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const newConfig = {
      shopId: shopIdInput.value.trim(),
      secretKey: secretKeyInput.value.trim(),
      serverUrl: serverUrlInput.value.trim() || 'http://localhost:5000',
      defaultBwPrinter: bwPrinterSelect.value,
      defaultColorPrinter: colorPrinterSelect.value,
    }

    if (isElectron) {
      const saved = await window.electronAPI.saveConfig(newConfig)
      if (saved) {
        showAlert('✓ Settings saved locally! Agent ready for backend.', 'success')
      } else {
        showAlert('❌ Failed to save settings', 'error')
      }
    } else {
      showAlert('✓ Settings saved in preview mode!', 'success')
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
