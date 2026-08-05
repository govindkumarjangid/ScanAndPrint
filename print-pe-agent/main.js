import { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import configStore from './src/store/configStore.js'
import printerManager from './src/services/printerManager.js'
import socketService from './src/services/socketService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow = null
let tray = null
let agentStatus = { status: 'DISCONNECTED', details: {} }

// Prevent multiple instances of the Print Agent from running simultaneously
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  console.log('Another instance of QR Se Print Agent is already running. Focusing existing instance...')
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
  }
})

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 580,
    height: 680,
    resizable: false,
    autoHideMenuBar: true,
    show: true,
    title: 'QR Se Print Agent Settings',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  mainWindow.loadFile(path.join(__dirname, 'src/ui/index.html'))

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
    return false
  })
}

function createTrayIcon(status) {
  const color = status === 'CONNECTED' ? '#10b981' : status === 'UNCONFIGURED' ? '#f59e0b' : '#ef4444'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>`
  return nativeImage.createFromBuffer(Buffer.from(svg))
}

function updateTrayMenu() {
  if (!tray) return

  const { status, details } = agentStatus
  let statusText = 'Disconnected (Server Offline)'
  if (status === 'CONNECTED') statusText = `Connected (${details.shopId || 'Online'})`
  else if (status === 'UNCONFIGURED') statusText = 'Unconfigured'

  const contextMenu = Menu.buildFromTemplate([
    { label: `🖨️ QR Se Print Agent`, enabled: false },
    { label: `Status: ${statusText}`, enabled: false },
    { type: 'separator' },
    {
      label: '⚙️ Settings & Configuration',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      },
    },
    {
      label: '📄 Run Test Print Page',
      click: async () => {
        const config = configStore.getAll()
        await printerManager.testPrint(config.defaultBwPrinter || config.defaultColorPrinter)
      },
    },
    {
      label: '🔄 Reconnect to Server',
      click: () => {
        socketService.reconnect()
      },
    },
    { type: 'separator' },
    {
      label: '❌ Exit Agent',
      click: () => {
        app.isQuitting = true
        socketService.disconnect()
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)
  tray.setToolTip(`QR Se Print Agent — ${statusText}`)
  tray.setImage(createTrayIcon(status))
}

function setupTray() {
  tray = new Tray(createTrayIcon('DISCONNECTED'))
  updateTrayMenu()

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

function setupIpcHandlers() {
  ipcMain.handle('get-config', () => {
    return configStore.getAll()
  })

  ipcMain.handle('save-config', (event, newConfig) => {
    const success = configStore.saveConfig(newConfig)
    if (success) {
      socketService.reconnect()
    }
    return success
  })

  ipcMain.handle('get-printers', async () => {
    return await printerManager.getAvailablePrinters()
  })

  ipcMain.handle('test-print', async (event, printerName) => {
    return await printerManager.testPrint(printerName)
  })
}

app.whenReady().then(() => {
  setupIpcHandlers()
  createMainWindow()
  setupTray()

  socketService.onStatusChange((status, details) => {
    agentStatus = { status, details }
    updateTrayMenu()

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('agent-status-update', { status, details })
    }
  })

  socketService.connect()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Keep running in tray on Windows/Linux
  }
})
