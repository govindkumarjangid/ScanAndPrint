import { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, shell } from 'electron'
import path from 'path'
import fs from 'fs'
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
  console.log('Another instance of Scan&Print Agent is already running. Focusing existing instance...')
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
  }
})

function createMainWindow() {
  const iconPath = path.join(__dirname, 'assets/icon.png')

  mainWindow = new BrowserWindow({
    width: 580,
    height: 680,
    resizable: false,
    autoHideMenuBar: true,
    show: true,
    title: 'Scan&Print Agent Settings',
    icon: iconPath,
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
  let iconFileName = 'tray-disconnected.png'
  if (status === 'CONNECTED') {
    iconFileName = 'tray-connected.png'
  } else if (status === 'UNCONFIGURED') {
    iconFileName = 'tray-unconfigured.png'
  }

  const iconPath = path.join(__dirname, 'assets', iconFileName)
  if (fs.existsSync(iconPath)) {
    const image = nativeImage.createFromPath(iconPath)
    return image.resize({ width: 24, height: 24 })
  }
  return nativeImage.createFromPath(path.join(__dirname, 'assets/icon.png')).resize({ width: 24, height: 24 })
}

function updateTrayMenu() {
  if (!tray) return

  const { status, details } = agentStatus
  let statusText = 'Disconnected (Server Offline)'
  if (status === 'CONNECTED') statusText = `Connected (${details.shopId || 'Online'})`
  else if (status === 'UNCONFIGURED') statusText = 'Unconfigured'

  const contextMenu = Menu.buildFromTemplate([
    { label: `🖨️ Scan&Print Agent`, enabled: false },
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
  tray.setToolTip(`Scan&Print Agent — ${statusText}`)
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
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.scanandprint.agent')
  }
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
