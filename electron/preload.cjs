const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('xinyuexiaWindow', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximizeToggle: () => ipcRenderer.invoke('window:maximize-toggle'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  reload: () => ipcRenderer.invoke('window:reload'),
  beginTitlebarDrag: (input) => ipcRenderer.invoke('window:begin-titlebar-drag', input),
  moveTitlebarDrag: (input) => ipcRenderer.invoke('window:move-titlebar-drag', input),
  onMaximizedChange: (callback) => {
    const listener = (_event, value) => callback(Boolean(value));
    ipcRenderer.on('window:maximized-change', listener);
    return () => ipcRenderer.removeListener('window:maximized-change', listener);
  },
});

contextBridge.exposeInMainWorld('xinyuexiaModel', {
  request: (input) => ipcRenderer.invoke('model:request', input),
});

contextBridge.exposeInMainWorld('xinyuexiaAppIcon', {
  read: () => ipcRenderer.invoke('app-icon:read'),
  select: () => ipcRenderer.invoke('app-icon:select'),
  useProjectIcon: (fileName) => ipcRenderer.invoke('app-icon:use-project-icon', fileName),
  reset: () => ipcRenderer.invoke('app-icon:reset'),
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
