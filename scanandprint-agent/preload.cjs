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
  onStatusUpdate: (callback) => ipcRenderer.on('agent-status-update', (event, data) => callback(data)),
  onIncomingJob: (callback) => ipcRenderer.on('incoming-job', (event, data) => callback(data)),
  onCounterOrder: (callback) => ipcRenderer.on('counter-order-data', (event, data) => callback(data)),
  getCounterOrder: () => ipcRenderer.invoke('get-counter-order'),
  approveCounterOrder: (jobId) => ipcRenderer.invoke('approve-counter-order', jobId),
  denyCounterOrder: (jobId) => ipcRenderer.invoke('deny-counter-order', jobId),
})
