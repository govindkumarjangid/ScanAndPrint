import { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, shell } from 'electron'
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
      preload: path.join(__dirname, 'preload.cjs'),
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
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-25 -25 530 550" width="530" height="550">
  <rect x="0" y="0" width="480" height="270" rx="32" fill="#F0245C"/>
  <path d="
    M 100 40
    Q 70 40 70 70
    L 70 205
    Q 70 235 100 235
    L 350 235
    Q 380 235 380 205
    L 380 140
    L 285 40
    Z"
    fill="#fbfbfb"/>
  <path d="M 285 40 L 285 118 Q 285 140 307 140 L 380 140 Z" fill="#F0245C"/>
  <circle cx="428" cy="42" r="14" fill="#F0245C"/>
  <rect x="118" y="118" width="150" height="20" rx="10" fill="#F0245C"/>
  <rect x="118" y="158" width="150" height="20" rx="10" fill="#F0245C"/>
  <rect x="20" y="288" width="440" height="22" rx="11" fill="#F0245C"/>
  <rect x="28" y="322" width="424" height="108" rx="28" fill="#F0245C"/>
  <path d="
    M 168 366
    L 312 366
    L 372 470
    Q 380 500 350 500
    L 130 500
    Q 100 500 108 470
    Z"
    fill="#fbfbfb" stroke="#F0245C" stroke-width="10" stroke-linejoin="round"/>

  <rect x="158" y="398" width="164" height="16" rx="8" fill="#F0245C"/>
  <rect x="158" y="432" width="164" height="16" rx="8" fill="#F0245C"/>
</svg>`
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
    {
      label: '📁 Open Logs Folder',
      click: () => {
        shell.openPath(path.join(app.getPath('userData'), 'logs'))
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
      if (typeof newConfig.autoStartOnBoot === 'boolean') {
        app.setLoginItemSettings({
          openAtLogin: newConfig.autoStartOnBoot,
          openAsHidden: true,
        })
      }
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

  // Apply auto-start-on-boot setting (Windows/macOS)
  const { autoStartOnBoot } = configStore.getAll()
  app.setLoginItemSettings({
    openAtLogin: autoStartOnBoot !== false,
    openAsHidden: true, // start minimized to tray, don't pop up the settings window
  })

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
