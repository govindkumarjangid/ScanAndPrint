import { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, shell, screen } from 'electron'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import configStore from './src/store/configStore.js'
import printerManager from './src/services/printerManager.js'
import printService from './src/services/printService.js'
import socketService from './src/services/socketService.js'
import { checkForUpdates, isUpdateDownloaded, onUpdateDownloaded, quitAndInstall } from './src/services/updateService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow = null
let tray = null
let agentStatus = { status: 'DISCONNECTED', details: {} }
const counterPopupWindows = new Map()

// Prevent multiple instances of the Print Agent from running simultaneously (Fix duplicate windows)
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  console.log('Another instance of Scan&Print Agent is already running. Quitting duplicate instance...')
  app.quit()
  process.exit(0)
} else {
  app.on('second-instance', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

function createDesktopShortcut() {
  if (process.platform !== 'win32') {
    return { success: false, message: 'Only Windows is supported for desktop shortcuts.' }
  }

  try {
    const desktopPath = app.getPath('desktop')
    const targetExe = process.execPath

    // Extract icon.ico to userData so Windows Explorer always has a guaranteed physical file outside asar
    let iconLocation = targetExe
    try {
      const safeIcoPath = path.join(app.getPath('userData'), 'icon.ico')
      const bundledIco = path.join(__dirname, 'assets/icon.ico')
      if (fs.existsSync(bundledIco)) {
        fs.writeFileSync(safeIcoPath, fs.readFileSync(bundledIco))
        iconLocation = safeIcoPath
      }
    } catch (e) { }

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
    width: 1040,
    height: 720,
    minWidth: 900,
    minHeight: 600,
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

  mainWindow.setMenu(null)
  mainWindow.setMenuBarVisibility(false)

  mainWindow.loadFile(path.join(__dirname, 'src/ui/index.html'))

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.setZoomFactor(1)
    mainWindow.webContents.setVisualZoomLevelLimits(1, 1)
  })

  // Prevent zoom shortcuts (Ctrl + +, Ctrl + -, Ctrl + 0, Ctrl + Wheel)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && ['+', '-', '=', '_', '0', 'NumpadAdd', 'NumpadSubtract'].includes(input.key)) {
      event.preventDefault()
    }
  })

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
    { label: `🖨️ Scan&Print Agent v${app.getVersion() || '2.0.0'}`, enabled: false },
    { label: `Status: ${statusText}`, enabled: false },
    {
      label: 'Restart & Install Update',
      enabled: isUpdateDownloaded(),
      click: () => {
        quitAndInstall()
      },
    },
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
    // Capture the connection-relevant fields BEFORE saving, so we can tell
    // whether this save actually needs a socket reconnect. Forcing a full
    // reconnect on every save (e.g. just flipping the "Auto-start" checkbox)
    // unnecessarily drops the live connection and can interrupt an in-flight
    // print job or a counter-order approval that's currently pending.
    const previousConfig = configStore.getAll()
    const success = configStore.saveConfig(newConfig)

    if (success) {
      const connectionFieldsChanged =
        ('shopId' in newConfig && newConfig.shopId !== previousConfig.shopId) ||
        ('secretKey' in newConfig && newConfig.secretKey !== previousConfig.secretKey) ||
        ('serverUrl' in newConfig && newConfig.serverUrl !== previousConfig.serverUrl)

      if (connectionFieldsChanged) {
        socketService.reconnect()
      }

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

  // Live, driver-reported printer status + real capabilities (color/duplex)
  // for the dashboard's Printers panel. Never hardcoded - see printerManager.js.
  ipcMain.handle('get-printers-status', async () => {
    return await printerManager.getPrintersWithCapabilities()
  })

  ipcMain.handle('test-print', async (event, printerName, mode = 'Black & White') => {
    return await printerManager.testPrint(printerName, mode)
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
    return app.getVersion() || '2.0.0'
  })

  // Counter Payment Approval & Denial IPC Handlers
  ipcMain.handle('approve-counter-order', async (event, jobId) => {
    console.log(`[Main] ✅ Shopkeeper Approved Counter Order #${jobId}`)
    const entry = counterPopupWindows.get(jobId)
    const jobData = entry?.jobData || socketService.heldJobs?.get(jobId)

    if (entry?.win && !entry.win.isDestroyed()) {
      entry.win.close()
    }
    counterPopupWindows.delete(jobId)

    if (jobData) {
      try {
        const result = await printService.executePrintJob(jobData)
        socketService.notifyJobEvent('SUCCESS', { ...jobData, printedOn: result?.printedOn })
        if (socketService.socket && socketService.socket.connected) {
          socketService.socket.emit('JOB_SUCCESS', {
            jobId: jobId,
            printedOn: result?.printedOn,
            timestamp: result?.timestamp || new Date().toISOString(),
          })
        }
        return { success: true }
      } catch (err) {
        console.error(`[Main] ❌ Failed to print counter job #${jobId}:`, err.message)
        socketService.notifyJobEvent('FAILED', { ...jobData, error: err.message })
        if (socketService.socket && socketService.socket.connected) {
          socketService.socket.emit('JOB_FAILED', {
            jobId: jobId,
            error: err.message,
          })
        }
        return { success: false, error: err.message }
      }
    }
    return { success: false, error: 'Job data not found' }
  })

  ipcMain.handle('deny-counter-order', async (event, jobId) => {
    console.log(`[Main] ❌ Shopkeeper Denied/Rejected Counter Order #${jobId}`)
    const entry = counterPopupWindows.get(jobId)

    if (entry?.win && !entry.win.isDestroyed()) {
      entry.win.close()
    }
    counterPopupWindows.delete(jobId)

    if (socketService.heldJobs) {
      socketService.heldJobs.delete(jobId)
    }

    if (socketService.socket && socketService.socket.connected) {
      socketService.socket.emit('JOB_FAILED', {
        jobId: jobId,
        error: 'Cancelled by Shopkeeper at Counter',
      })
    }
    return { success: true }
  })

  ipcMain.handle('get-counter-order', (event) => {
    for (const [jobId, entry] of counterPopupWindows.entries()) {
      if (entry.win?.webContents?.id === event.sender.id) {
        return entry.jobData
      }
    }
    const entries = Array.from(counterPopupWindows.values())
    return entries[entries.length - 1]?.jobData || null
  })
}

// Show native bottom-right counter order popup window
function showCounterOrderPopup(jobData) {
  if (!jobData?.jobId) return

  console.log(`[Main] 🪟 Triggering Counter Order Approval Popup for Job #${jobData.jobId}`)

  // If a popup for this job is already open, focus it
  const existing = counterPopupWindows.get(jobData.jobId)
  if (existing?.win && !existing.win.isDestroyed()) {
    existing.win.show()
    existing.win.focus()
    return
  }

  let popupWidth = 400
  let popupHeight = 350
  let x = 100
  let y = 100

  try {
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize
    x = Math.max(10, width - popupWidth - 25)
    y = Math.max(10, height - popupHeight - 25)
  } catch (sErr) {
    console.warn('[Main] Screen geometry note:', sErr.message)
  }

  const icoPath = path.join(__dirname, 'assets/icon.ico')
  const pngPath = path.join(__dirname, 'assets/icon.png')
  const iconPath = fs.existsSync(icoPath) ? icoPath : pngPath

  const popupWin = new BrowserWindow({
    width: popupWidth,
    height: popupHeight,
    x,
    y,
    show: true,
    alwaysOnTop: true,
    resizable: false,
    maximizable: false,
    minimizable: true,
    autoHideMenuBar: true,
    skipTaskbar: false,
    title: 'Scan&Print — Counter Order',
    icon: iconPath,
    backgroundColor: '#09090b',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Completely remove top menu bar (File, Edit, View, Window)
  popupWin.setMenu(null)
  popupWin.setMenuBarVisibility(false)
  if (typeof popupWin.removeMenu === 'function') {
    popupWin.removeMenu()
  }

  popupWin.loadFile(path.join(__dirname, 'src/ui/counter-popup.html'))

  popupWin.webContents.on('did-finish-load', () => {
    popupWin.show()
    popupWin.focus()
    popupWin.setAlwaysOnTop(true)
    if (typeof popupWin.moveTop === 'function') popupWin.moveTop()
    popupWin.flashFrame(true)
    popupWin.webContents.send('counter-order-data', jobData)
  })

  popupWin.webContents.on('did-fail-load', (e, errorCode, errorDescription) => {
    console.error(`[Main] ❌ Failed to load counter-popup.html: ${errorCode} - ${errorDescription}`)
  })

  popupWin.on('closed', () => {
    counterPopupWindows.delete(jobData.jobId)
  })

  counterPopupWindows.set(jobData.jobId, { win: popupWin, jobData })
}



app.whenReady().then(() => {
  // Disable default Electron menu bar across the entire application
  Menu.setApplicationMenu(null)

  if (process.platform === 'win32') {
    app.setAppUserModelId('com.scanandprint.agent')
    // Automatically create / guarantee Windows desktop icon on every startup
    createDesktopShortcut()
  }

  setupIpcHandlers()
  createMainWindow()
  setupTray()

  // Register counter popup handler with socket service
  socketService.setCounterPopupHandler((jobData) => {
    showCounterOrderPopup(jobData)
  })

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

  // Forward job lifecycle events (arrived / printed / failed) to the Settings
  // window so the owner sees live activity there too, not just in the
  // separate counter-order popup.
  socketService.onJobEvent((eventType, jobData) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('incoming-job', { ...jobData, eventType })
    }
  })

  socketService.connect()

  // Listen for downloaded updates to dynamically enable the tray menu item
  onUpdateDownloaded(() => {
    updateTrayMenu()
  })

  // Schedule auto-update checks: once ~30s after startup, then every 6 hours
  setTimeout(() => {
    checkForUpdates()
  }, 30000)

  setInterval(() => {
    checkForUpdates()
  }, 6 * 60 * 60 * 1000)

  // React to remote config updates immediately in memory
  socketService.onConfigUpdate((validUpdates) => {
    if (typeof validUpdates.autoStartOnBoot === 'boolean') {
      app.setLoginItemSettings({
        openAtLogin: validUpdates.autoStartOnBoot,
        openAsHidden: true,
        path: process.execPath,
      })
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Keep running in tray on Windows/Linux
  }
})
