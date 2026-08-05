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

  // Load Initial Config
  const config = await window.electronAPI.getConfig()
  if (config) {
    shopIdInput.value = config.shopId || ''
    secretKeyInput.value = config.secretKey || ''
    serverUrlInput.value = config.serverUrl || 'http://localhost:5000'
  }

  // Populate Installed Printers Dropdowns
  async function loadPrinters() {
    try {
      const printers = await window.electronAPI.getPrinters()
      bwPrinterSelect.innerHTML = '<option value="">-- System Default Printer --</option>'
      colorPrinterSelect.innerHTML = '<option value="">-- System Default Printer --</option>'

      printers.forEach((p) => {
        const optionBw = document.createElement('option')
        optionBw.value = p.name
        optionBw.textContent = `${p.name}${p.isDefault ? ' (Default)' : ''}`
        if (config && config.defaultBwPrinter === p.name) optionBw.selected = true
        bwPrinterSelect.appendChild(optionBw)

        const optionColor = document.createElement('option')
        optionColor.value = p.name
        optionColor.textContent = `${p.name}${p.isDefault ? ' (Default)' : ''}`
        if (config && config.defaultColorPrinter === p.name) optionColor.selected = true
        colorPrinterSelect.appendChild(optionColor)
      })

      showAlert('Printers list refreshed', 'success')
    } catch (err) {
      console.error('Failed to load printers:', err)
      showAlert('Failed to list system printers', 'error')
    }
  }

  // Listen for Agent Status Updates from Main Process
  window.electronAPI.onStatusUpdate((event, { status, details }) => {
    statusBadge.className = 'status-badge'
    if (status === 'CONNECTED') {
      statusBadge.classList.add('status-connected')
      statusText.textContent = `Connected (${details.shopId || 'Online'})`
    } else if (status === 'UNCONFIGURED') {
      statusBadge.classList.add('status-unconfigured')
      statusText.textContent = 'Unconfigured'
    } else {
      statusBadge.classList.add('status-disconnected')
      statusText.textContent = details.reason ? `Disconnected (${details.reason})` : 'Disconnected'
    }
  })

  // Event Handlers
  refreshPrintersBtn.addEventListener('click', loadPrinters)

  testPrintBtn.addEventListener('click', async () => {
    const selectedPrinter = bwPrinterSelect.value || colorPrinterSelect.value
    showAlert(`Sending test print page to ${selectedPrinter || 'Default Printer'}...`, 'success')
    const result = await window.electronAPI.testPrint(selectedPrinter)
    if (result.success) {
      showAlert(`✓ ${result.message}`, 'success')
    } else {
      showAlert(`❌ Test print failed: ${result.error}`, 'error')
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

    const saved = await window.electronAPI.saveConfig(newConfig)
    if (saved) {
      showAlert('✓ Configuration saved & Agent reconnecting...', 'success')
    } else {
      showAlert('❌ Failed to save configuration', 'error')
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
