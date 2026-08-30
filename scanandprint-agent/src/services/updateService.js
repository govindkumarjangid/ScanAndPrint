import { app } from 'electron'
import electronUpdater from 'electron-updater'

let autoUpdater = null
let isUpdateReady = false
const updateListeners = []

// GUARD: skip all auto-update logic entirely if app is not packaged (dev mode)
if (app && app.isPackaged) {
  autoUpdater = electronUpdater.autoUpdater || electronUpdater

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    console.log('[UpdateService] Checking for updates...')
  })

  autoUpdater.on('update-available', (info) => {
    console.log(`[UpdateService] Update available: v${info?.version || 'unknown'}`)
  })

  autoUpdater.on('update-not-available', (info) => {
    console.log(`[UpdateService] Update not available. Current version is up to date (v${info?.version || app.getVersion()}).`)
  })

  autoUpdater.on('error', (err) => {
    console.error('[UpdateService] Auto-update error:', err?.message || err)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.round(progressObj?.percent || 0)
    console.log(`[UpdateService] Download progress: ${percent}%`)
  })

  autoUpdater.on('update-downloaded', (info) => {
    isUpdateReady = true
    console.log(`[UpdateService] Update downloaded and ready to install: v${info?.version || 'unknown'}`)
    updateListeners.forEach((cb) => {
      try {
        cb(info)
      } catch (err) {
        console.error('[UpdateService] Error in update listener callback:', err)
      }
    })
  })
}

export function checkForUpdates() {
  if (!app || !app.isPackaged) {
    return
  }

  if (!autoUpdater) {
    return
  }

  try {
    autoUpdater.checkForUpdates().catch((err) => {
      console.error('[UpdateService] Failed to check for updates:', err?.message || err)
    })
  } catch (err) {
    console.error('[UpdateService] Exception while checking for updates:', err?.message || err)
  }
}

export function isUpdateDownloaded() {
  return isUpdateReady
}

export function onUpdateDownloaded(callback) {
  if (typeof callback === 'function') {
    updateListeners.push(callback)
    if (isUpdateReady) {
      callback()
    }
  }
}

export function quitAndInstall() {
  if (autoUpdater && isUpdateReady) {
    autoUpdater.quitAndInstall()
  }
}

export default {
  checkForUpdates,
  isUpdateDownloaded,
  onUpdateDownloaded,
  quitAndInstall,
}
