const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('xinyuexiaWindow', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximizeToggle: () => ipcRenderer.invoke('window:maximize-toggle'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  reload: () => ipcRenderer.invoke('window:reload'),
  readSettings: () => ipcRenderer.invoke('window-settings:read'),
  updateSettings: (settings) => ipcRenderer.invoke('window-settings:update', settings),
  resetBounds: () => ipcRenderer.invoke('window-settings:reset-bounds'),
  onMaximizedChange: (callback) => {
    const listener = (_event, value) => callback(Boolean(value));
    ipcRenderer.on('window:maximized-change', listener);
    return () => ipcRenderer.removeListener('window:maximized-change', listener);
  },
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

contextBridge.exposeInMainWorld('xinyuexiaCos', {
  putObject: (input) => ipcRenderer.invoke('cos:put-object', input),
  getObject: (input) => ipcRenderer.invoke('cos:get-object', input),
});

contextBridge.exposeInMainWorld('xinyuexiaHotspots', {
  fetchAll: (input) => ipcRenderer.invoke('hotspots:fetch-all', input),
  fetchDetail: (input) => ipcRenderer.invoke('hotspots:fetch-detail', input),
});
