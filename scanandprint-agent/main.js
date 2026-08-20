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

function createDesktopShortcut() {
  if (process.platform !== 'win32') {
    return { success: false, message: 'Only Windows is supported for desktop shortcuts.' }
  }

  try {
    const desktopPath = app.getPath('desktop')
    const targetExe = process.execPath
    const icoPath = path.join(__dirname, 'assets/icon.ico')
    const iconLocation = fs.existsSync(icoPath) ? icoPath : targetExe
    const shortcutPath = path.join(desktopPath, 'Scan&Print Agent.lnk')

    const operation = fs.existsSync(shortcutPath) ? 'replace' : 'create'
    const success = shell.writeShortcutLink(shortcutPath, operation, {
      target: targetExe,
      cwd: path.dirname(targetExe),
      description: 'Scan&Print Automated Desktop Print Agent',
      icon: iconLocation,
      iconIndex: 0,
      appUserModelId: 'com.scanandprint.agent',
    })

    // Also ensure Start Menu Programs shortcut
    try {
      const startMenuPath = path.join(app.getPath('appData'), 'Microsoft', 'Windows', 'Start Menu', 'Programs')
      if (fs.existsSync(startMenuPath)) {
        const startMenuShortcut = path.join(startMenuPath, 'Scan&Print Agent.lnk')
        const smOp = fs.existsSync(startMenuShortcut) ? 'replace' : 'create'
        shell.writeShortcutLink(startMenuShortcut, smOp, {
          target: targetExe,
          cwd: path.dirname(targetExe),
          description: 'Scan&Print Automated Desktop Print Agent',
          icon: iconLocation,
          iconIndex: 0,
          appUserModelId: 'com.scanandprint.agent',
        })
      }
    } catch (smErr) {
      console.warn('Start menu shortcut note:', smErr.message)
    }

    console.log('✅ Desktop shortcut ensured with icon at:', shortcutPath)
    return { success, path: shortcutPath }
  } catch (err) {
    console.error('Desktop shortcut creation error:', err)
    return { success: false, message: err.message }
  }
}

function createMainWindow() {
  const icoPath = path.join(__dirname, 'assets/icon.ico')
  const pngPath = path.join(__dirname, 'assets/icon.png')
  const iconPath = fs.existsSync(icoPath) ? icoPath : pngPath

  mainWindow = new BrowserWindow({
    width: 620,
    height: 780,
    minWidth: 560,
    minHeight: 640,
    resizable: true,
    autoHideMenuBar: true,
    show: false,
    title: 'Scan&Print — Desktop Print Agent',
    icon: iconPath,
    backgroundColor: '#0c0a09',
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
    { label: `🖨️ Scan&Print Agent v1.0.3`, enabled: false },
    { label: `Status: ${statusText}`, enabled: false },
    { type: 'separator' },
    {
      label: '⚙️ Open Settings & Dashboard',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      },
    },
    {
      label: '📌 Create Desktop Shortcut',
      click: () => {
        createDesktopShortcut()
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
        const logsDir = path.join(app.getPath('userData'), 'logs')
        if (!fs.existsSync(logsDir)) {
          fs.mkdirSync(logsDir, { recursive: true })
        }
        shell.openPath(logsDir)
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
          path: process.execPath,
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

  ipcMain.handle('create-desktop-shortcut', () => {
    return createDesktopShortcut()
  })

  ipcMain.handle('open-logs-folder', () => {
    const logsDir = path.join(app.getPath('userData'), 'logs')
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }
    shell.openPath(logsDir)
    return true
  })

  ipcMain.handle('reconnect-socket', () => {
    socketService.reconnect()
    return true
  })

  ipcMain.handle('minimize-window', () => {
    if (mainWindow) mainWindow.hide()
    return true
  })

  ipcMain.handle('exit-app', () => {
    app.isQuitting = true
    socketService.disconnect()
    app.quit()
  })

  ipcMain.handle('get-app-version', () => {
    return app.getVersion() || '1.0.3'
  })
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.scanandprint.agent')
    // Automatically create / guarantee Windows desktop icon on every startup
    createDesktopShortcut()
  }

  setupIpcHandlers()
  createMainWindow()
  setupTray()

  // Apply auto-start-on-boot setting (Windows/macOS)
  const { autoStartOnBoot } = configStore.getAll()
  app.setLoginItemSettings({
    openAtLogin: autoStartOnBoot !== false,
    openAsHidden: true,
    path: process.execPath,
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
