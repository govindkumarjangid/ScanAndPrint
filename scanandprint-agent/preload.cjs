const { contextBridge, ipcRenderer } = require('electron')

// Expose secure API to Renderer Process
contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  testPrint: (printerName) => ipcRenderer.invoke('test-print', printerName),
  onStatusUpdate: (callback) => ipcRenderer.on('agent-status-update', callback),
})
