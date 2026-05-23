const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('xinyuexiaWindow', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximizeToggle: () => ipcRenderer.invoke('window:maximize-toggle'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  reload: () => ipcRenderer.invoke('window:reload'),
});

contextBridge.exposeInMainWorld('xinyuexiaModel', {
  request: (input) => ipcRenderer.invoke('model:request', input),
});

contextBridge.exposeInMainWorld('xinyuexiaDatabase', {
  ensureDefaultDir: () => ipcRenderer.invoke('database:ensure-default-dir'),
  selectDirectory: () => ipcRenderer.invoke('database:select-directory'),
  readSettings: () => ipcRenderer.invoke('database:read-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('database:save-settings', settings),
  getStatus: (dataDir) => ipcRenderer.invoke('database:get-status', dataDir),
  readCollection: (collection, dataDir) => ipcRenderer.invoke('database:read-collection', collection, dataDir),
  writeCollection: (collection, items, dataDir) => ipcRenderer.invoke('database:write-collection', collection, items, dataDir),
});
