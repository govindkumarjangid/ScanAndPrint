const { contextBridge, ipcRenderer } = require('electron')

// Expose secure API to Renderer Process
contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  testPrint: (printerName) => ipcRenderer.invoke('test-print', printerName),
  createDesktopShortcut: () => ipcRenderer.invoke('create-desktop-shortcut'),
  openLogsFolder: () => ipcRenderer.invoke('open-logs-folder'),
  reconnectSocket: () => ipcRenderer.invoke('reconnect-socket'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  exitApp: () => ipcRenderer.invoke('exit-app'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  onStatusUpdate: (callback) => ipcRenderer.on('agent-status-update', (event, data) => callback(data)),
  onIncomingJob: (callback) => ipcRenderer.on('incoming-job', (event, data) => callback(data)),
})
