const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('xinyuexiaWindow', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximizeToggle: () => ipcRenderer.invoke('window:maximize-toggle'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  reload: () => ipcRenderer.invoke('window:reload'),
  onMaximizedChange: (callback) => {
    const listener = (_event, value) => callback(Boolean(value));
    ipcRenderer.on('window:maximized-change', listener);
    return () => ipcRenderer.removeListener('window:maximized-change', listener);
  },
});

contextBridge.exposeInMainWorld('xinyuexiaLaunch', {
  disableAdjustmentMode: process.env.XINYUEXIA_DISABLE_ADJUSTMENT_MODE === '1',
});

contextBridge.exposeInMainWorld('xinyuexiaModel', {
  request: (input) => ipcRenderer.invoke('model:request', input),
  stream: (input, onChunk) => {
    const requestId = input?.requestId || `model-stream-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = `model:stream:${requestId}`;
    const listener = (_event, payload) => {
      if (payload?.type === 'chunk') {
        onChunk({
          type: payload.chunkType === 'reasoning' ? 'reasoning' : 'content',
          text: String(payload.text ?? ''),
        });
      }
    };
    ipcRenderer.on(channel, listener);
    return ipcRenderer
      .invoke('model:stream', { ...input, requestId })
      .finally(() => ipcRenderer.removeListener(channel, listener));
  },
  cancelStream: (requestId) => ipcRenderer.invoke('model:cancel-stream', requestId),
});

contextBridge.exposeInMainWorld('xinyuexiaAppIcon', {
  read: () => ipcRenderer.invoke('app-icon:read'),
  select: () => ipcRenderer.invoke('app-icon:select'),
  useProjectIcon: (fileName) => ipcRenderer.invoke('app-icon:use-project-icon', fileName),
  useDataUrl: (dataUrl, sourceFileName) => ipcRenderer.invoke('app-icon:use-data-url', dataUrl, sourceFileName),
  makeDefault: () => ipcRenderer.invoke('app-icon:make-default'),
  reset: () => ipcRenderer.invoke('app-icon:reset'),
});

contextBridge.exposeInMainWorld('xinyuexiaDatabase', {
  ensureDefaultDir: () => ipcRenderer.invoke('database:ensure-default-dir'),
  selectDirectory: () => ipcRenderer.invoke('database:select-directory'),
  readSettings: () => ipcRenderer.invoke('database:read-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('database:save-settings', settings),
  getStatus: (dataDir) => ipcRenderer.invoke('database:get-status', dataDir),
  getEmbeddedPostgresStatus: (dataDir) => ipcRenderer.invoke('database:get-embedded-postgres-status', dataDir),
  initializeEmbeddedPostgres: (dataDir) => ipcRenderer.invoke('database:initialize-embedded-postgres', dataDir),
  startEmbeddedPostgres: (dataDir) => ipcRenderer.invoke('database:start-embedded-postgres', dataDir),
  stopEmbeddedPostgres: (dataDir) => ipcRenderer.invoke('database:stop-embedded-postgres', dataDir),
  readCollection: (collection, dataDir) => ipcRenderer.invoke('database:read-collection', collection, dataDir),
  writeCollection: (collection, items, dataDir) => ipcRenderer.invoke('database:write-collection', collection, items, dataDir),
  readMoonfallPostgres: (dataDir) => ipcRenderer.invoke('database:read-moonfall-postgres', dataDir),
  writeMoonfallPostgres: (state, dataDir) => ipcRenderer.invoke('database:write-moonfall-postgres', state, dataDir),
  retrieveMoonfallRag: (input, dataDir) => ipcRenderer.invoke('database:retrieve-moonfall-rag', input, dataDir),
});
