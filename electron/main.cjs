const { app, BrowserWindow, dialog, ipcMain, nativeImage, safeStorage, shell, screen } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createAppIconService } = require('./appIconService.cjs');
const { registerCosIpcHandlers } = require('./cosService.cjs');
const { createModelSecretStore } = require('./modelSecretStore.cjs');
const { registerModelRequestIpcHandlers } = require('./modelRequestService.cjs');
const { createStartupExperience } = require('./startupExperience.cjs');
const { fitCenteredWindowSizeToWorkArea, fitWindowBoundsToWorkArea } = require('./windowBounds.cjs');
const { createWindowStateStore } = require('./windowStateStore.cjs');

const DEV_URL = 'http://127.0.0.1:18328/#/novels';
const DIST_ENTRY = path.join(__dirname, '..', 'dist', 'index.html');
const PRELOAD_ENTRY = path.join(__dirname, 'preload.cjs');
const APP_ICON = path.join(__dirname, '..', 'build', 'app-icon.ico');
const APP_ID = 'com.yuexia.writer.desktop';
const APP_NAME = '月下写作';
const SHARED_STATE_DIR_NAME = 'xinyuexia-desktop';
const DEFAULT_WINDOW_BOUNDS = {
  width: 1600,
  height: 900,
};
const MIN_WINDOW_WIDTH = 1100;
const MIN_WINDOW_HEIGHT = 680;
const IS_HEADLESS_SMOKE = process.env.XINYUEXIA_SMOKE_HEADLESS === '1';
const MAIN_LOG_FILE = path.join(app.getPath('appData'), SHARED_STATE_DIR_NAME, 'electron-main.log');
const MODEL_SECRETS_FILE = path.join(app.getPath('appData'), SHARED_STATE_DIR_NAME, 'model-secrets.json');

let mainWindow = null;
const modelSecretStore = createModelSecretStore({ safeStorage, filePath: MODEL_SECRETS_FILE });
const appIconService = createAppIconService({
  app,
  dialog,
  nativeImage,
  appIcon: APP_ICON,
  projectRoot: path.resolve(__dirname, '..'),
  getMainWindow: () => mainWindow,
});
const windowStateStore = createWindowStateStore({
  app,
  sharedStateDirName: SHARED_STATE_DIR_NAME,
  minWidth: MIN_WINDOW_WIDTH,
  minHeight: MIN_WINDOW_HEIGHT,
  defaultBounds: DEFAULT_WINDOW_BOUNDS,
  stateDir: IS_HEADLESS_SMOKE ? app.getPath('userData') : undefined,
});
const startupExperience = createStartupExperience({
  BrowserWindow,
  screen,
  icon: APP_ICON,
  isHeadless: IS_HEADLESS_SMOKE,
  log: writeMainLog,
  revealMainWindow: () => focusMainWindow(),
});

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();
if (process.platform === 'win32') app.setAppUserModelId(APP_ID);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function writeMainLog(message) {
  try {
    fs.mkdirSync(path.dirname(MAIN_LOG_FILE), { recursive: true });
    fs.appendFileSync(MAIN_LOG_FILE, `[${new Date().toISOString()}] ${message}\n`, 'utf8');
  } catch {
    // Logging must not block app startup.
  }
}

process.on('uncaughtException', (error) => {
  writeMainLog(`uncaughtException: ${error?.stack || error}`);
});

process.on('unhandledRejection', (reason) => {
  writeMainLog(`unhandledRejection: ${reason?.stack || reason}`);
});

function isLoopbackHostname(hostname) {
  const normalized = String(hostname ?? '')
    .toLowerCase()
    .replace(/^\[|\]$/g, '');
  return normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '::1';
}

function normalizeDevServerUrl(input) {
  try {
    const parsed = new URL(String(input ?? ''));
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    if (!isLoopbackHostname(parsed.hostname)) return null;
    if (parsed.username || parsed.password) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function resolveStartUrl() {
  if (process.env.XINYUEXIA_URL) {
    const safeDevUrl = normalizeDevServerUrl(process.env.XINYUEXIA_URL);
    if (safeDevUrl) return safeDevUrl;
    writeMainLog(`ignored unsafe XINYUEXIA_URL=${process.env.XINYUEXIA_URL}`);
  }
  const requestedHash = process.env.XINYUEXIA_START_HASH;
  const startHash = typeof requestedHash === 'string' && requestedHash.startsWith('#') ? requestedHash : '#/novels';
  if (process.env.XINYUEXIA_LOAD_DIST === '1' || app.isPackaged) {
    return new URL(startHash, pathToFileURL(DIST_ENTRY).href).href;
  }
  return new URL(startHash, DEV_URL).href;
}

function isTrustedRendererUrl(url) {
  try {
    const candidate = new URL(String(url ?? ''));
    const trusted = new URL(resolveStartUrl());
    if (trusted.protocol === 'file:') {
      return candidate.protocol === 'file:' && candidate.pathname === trusted.pathname;
    }
    return candidate.origin === trusted.origin;
  } catch {
    return false;
  }
}

function fitStartupBoundsToWorkArea(inputBounds) {
  const requestedBounds = { ...inputBounds };
  const hasSavedPosition = Number.isFinite(requestedBounds.x) && Number.isFinite(requestedBounds.y);
  const display = hasSavedPosition
    ? screen.getDisplayMatching({
        x: Math.round(requestedBounds.x),
        y: Math.round(requestedBounds.y),
        width: Math.max(1, Math.round(requestedBounds.width)),
        height: Math.max(1, Math.round(requestedBounds.height)),
      })
    : screen.getPrimaryDisplay();
  return fitWindowBoundsToWorkArea(requestedBounds, display.workArea);
}

function getWindowOptions(savedState) {
  const bounds = fitStartupBoundsToWorkArea({ ...DEFAULT_WINDOW_BOUNDS, ...(savedState ?? {}) });

  return {
    ...bounds,
    minWidth: Math.min(MIN_WINDOW_WIDTH, bounds.width),
    minHeight: Math.min(MIN_WINDOW_HEIGHT, bounds.height),
    title: APP_NAME,
    icon: appIconService.getCurrentAppIconPath(),
    backgroundColor: '#f9fafb',
    autoHideMenuBar: true,
    frame: false,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: PRELOAD_ENTRY,
      webviewTag: isWebviewTagEnabled(),
    },
  };
}

function isWebviewTagEnabled() {
  return !app.isPackaged || process.env.XINYUEXIA_ENABLE_WEBVIEW === '1';
}

function saveWindowState(targetWindow) {
  if (!targetWindow || targetWindow.isDestroyed()) return;
  if (!windowStateStore.readSettings().rememberSize) return;

  const bounds = targetWindow.isMaximized() ? targetWindow.getNormalBounds() : targetWindow.getBounds();

  windowStateStore.persistState({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    isMaximized: targetWindow.isMaximized(),
  });
}

function readWindowSettingsResult() {
  return {
    ...windowStateStore.readSettings(),
    defaultBounds: { ...DEFAULT_WINDOW_BOUNDS },
    currentBounds: mainWindow && !mainWindow.isDestroyed() ? mainWindow.getBounds() : null,
  };
}

function updateWindowSettings(nextSettings) {
  const previous = windowStateStore.readSettings();
  const next = windowStateStore.persistSettings({
    ...previous,
    ...(nextSettings && typeof nextSettings === 'object' ? nextSettings : {}),
  });
  if (next.rememberSize) saveWindowState(mainWindow);
  return readWindowSettingsResult();
}

function resetWindowBoundsToDefault() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.unmaximize();
    mainWindow.setBounds(fitStartupBoundsToWorkArea(DEFAULT_WINDOW_BOUNDS));
    mainWindow.center();
  }

  windowStateStore.clearState();
  windowStateStore.persistSettings({ rememberSize: false, startupBounds: DEFAULT_WINDOW_BOUNDS });

  return readWindowSettingsResult();
}

async function applyWindowBoundsPreset(inputBounds) {
  if (!mainWindow || mainWindow.isDestroyed()) return readWindowSettingsResult();
  const width = Number(inputBounds?.width);
  const height = Number(inputBounds?.height);
  if (!Number.isFinite(width) || !Number.isFinite(height)) return readWindowSettingsResult();
  const display = screen.getDisplayMatching(mainWindow.getBounds());
  if (mainWindow.isMaximized()) {
    const unmaximizeCompleted = new Promise((resolve) => mainWindow.once('unmaximize', resolve));
    mainWindow.unmaximize();
    await unmaximizeCompleted;
  }
  mainWindow.setBounds(fitCenteredWindowSizeToWorkArea({ width, height }, display.workArea));
  if (IS_HEADLESS_SMOKE) mainWindow.hide();
  saveWindowState(mainWindow);
  return readWindowSettingsResult();
}

function notifyWindowMaximizedState(targetWindow) {
  if (!targetWindow || targetWindow.isDestroyed()) return;
  if (targetWindow.webContents.isDestroyed()) return;
  try {
    targetWindow.webContents.send('window:maximized-change', targetWindow.isMaximized());
  } catch (error) {
    console.warn('Failed to notify maximized state:', error);
  }
}

function focusMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (IS_HEADLESS_SMOKE) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.setAlwaysOnTop(true);
  mainWindow.show();
  mainWindow.focus();
  mainWindow.moveTop();
  writeMainLog('main window show/focus requested');
  setTimeout(() => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.setAlwaysOnTop(false);
  }, 800);
}

async function loadStartUrl(targetWindow, retries = 10) {
  if (!targetWindow || targetWindow.isDestroyed()) return;

  const startUrl = resolveStartUrl();
  for (let attempt = 0; attempt < retries; attempt += 1) {
    if (!targetWindow || targetWindow.isDestroyed()) return;
    try {
      await targetWindow.loadURL(startUrl);
      return;
    } catch {
      if (!targetWindow || targetWindow.isDestroyed()) return;
      await wait(350);
    }
  }

  if (!targetWindow || targetWindow.isDestroyed()) return;
  await targetWindow
    .loadURL(
      'data:text/html;charset=utf-8,<html><body style="font-family:Segoe UI;padding:24px;"><h2>启动失败</h2><p>请确认开发服务器或 dist 文件已准备好。</p></body></html>',
    )
    .catch(() => {});
  if (!targetWindow.isDestroyed()) {
    startupExperience.reveal('load-failed');
  }
}

function attachWindowStateTracking(targetWindow) {
  const persist = () => saveWindowState(targetWindow);
  targetWindow.on('resize', persist);
  targetWindow.on('move', persist);
  targetWindow.on('maximize', () => {
    persist();
    notifyWindowMaximizedState(targetWindow);
  });
  targetWindow.on('unmaximize', () => {
    persist();
    notifyWindowMaximizedState(targetWindow);
  });
  targetWindow.on('close', persist);
}

function applySavedWindowState(targetWindow, savedState) {
  if (!savedState || !savedState.isMaximized) return;
  if (!targetWindow || targetWindow.isDestroyed()) return;
  if (!targetWindow.isMaximized()) targetWindow.maximize();
  if (IS_HEADLESS_SMOKE) targetWindow.hide();
  writeMainLog('saved maximized state restored');
}

function attachRendererDiagnostics(targetWindow) {
  if (!targetWindow || targetWindow.isDestroyed()) return;
  targetWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.warn('Renderer did-fail-load:', errorCode, errorDescription, validatedURL);
  });
  targetWindow.webContents.on('render-process-gone', (_event, details) => {
    console.warn('Renderer process gone:', details);
  });
  targetWindow.webContents.on('console-message', (details) => {
    if (!['warning', 'error'].includes(details.level)) return;
    console.warn(
      `Renderer console level=${details.level} ${details.sourceId}:${details.lineNumber} ${details.message}`,
    );
  });
}

function isSafeWebviewUrl(url) {
  try {
    const parsed = new URL(String(url ?? ''));
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function attachWebviewSecurityGuards() {
  app.on('web-contents-created', (_event, contents) => {
    contents.session.setPermissionCheckHandler(() => false);
    contents.session.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
    contents.setWindowOpenHandler(() => ({ action: 'deny' }));
    contents.on('will-navigate', (event, url) => {
      if (contents.getType() !== 'webview' || isSafeWebviewUrl(url)) return;
      event.preventDefault();
    });
    contents.on('will-attach-webview', (event, webPreferences, params) => {
      delete webPreferences.preload;
      webPreferences.nodeIntegration = false;
      webPreferences.contextIsolation = true;
      webPreferences.sandbox = true;
      webPreferences.allowRunningInsecureContent = false;
      webPreferences.experimentalFeatures = false;

      if (!isSafeWebviewUrl(params?.src)) {
        event.preventDefault();
      }
    });
  });
}

function createWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    writeMainLog('createWindow reused existing main window');
    focusMainWindow();
    return mainWindow;
  }

  const savedState = windowStateStore.readState();
  mainWindow = new BrowserWindow(getWindowOptions(savedState));
  writeMainLog(`main window created startUrl=${resolveStartUrl()}`);

  attachWindowStateTracking(mainWindow);
  attachRendererDiagnostics(mainWindow);
  applySavedWindowState(mainWindow, savedState);
  startupExperience.begin(mainWindow, savedState);

  mainWindow.on('closed', () => {
    writeMainLog('main window closed');
    startupExperience.close();
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url);
      if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
        void shell.openExternal(parsed.toString());
      }
    } catch {
      // Deny malformed external URLs.
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (isTrustedRendererUrl(url)) return;
    event.preventDefault();
    try {
      const parsed = new URL(url);
      if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
        void shell.openExternal(parsed.toString());
      }
    } catch {
      // Deny malformed navigation URLs.
    }
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F5' && input.type === 'keyDown') {
      event.preventDefault();
      mainWindow?.webContents.reloadIgnoringCache();
    }
  });

  mainWindow.webContents.on('page-title-updated', (event) => {
    event.preventDefault();
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.setTitle(APP_NAME);
  });

  void loadStartUrl(mainWindow);
  return mainWindow;
}

function isTrustedIpcSender(event) {
  if (!mainWindow || mainWindow.isDestroyed()) return false;
  if (event.sender !== mainWindow.webContents) return false;
  const senderUrl = event.senderFrame?.url || event.sender.getURL();
  return isTrustedRendererUrl(senderUrl);
}

function registerTrustedIpcHandler(channel, listener) {
  ipcMain.handle(channel, (event, ...args) => {
    if (!isTrustedIpcSender(event)) throw new Error(`Blocked untrusted IPC sender for ${channel}.`);
    return listener(event, ...args);
  });
}

registerTrustedIpcHandler('window:minimize', () => {
  mainWindow?.minimize();
});

registerTrustedIpcHandler('window:maximize-toggle', () => {
  if (!mainWindow) return false;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
  return mainWindow.isMaximized();
});

registerTrustedIpcHandler('window:close', () => {
  mainWindow?.close();
});

registerTrustedIpcHandler('window:is-maximized', () => mainWindow?.isMaximized() ?? false);
registerTrustedIpcHandler('window:reload', () => {
  mainWindow?.webContents.reloadIgnoringCache();
});
registerTrustedIpcHandler('app:renderer-ready', () => {
  startupExperience.reveal('renderer-ready');
  return true;
});
registerTrustedIpcHandler('window-settings:read', () => readWindowSettingsResult());
registerTrustedIpcHandler('window-settings:update', (_event, nextSettings) => updateWindowSettings(nextSettings));
registerTrustedIpcHandler('window-settings:reset-bounds', () => resetWindowBoundsToDefault());
registerTrustedIpcHandler('window-settings:apply-bounds-preset', (_event, bounds) => applyWindowBoundsPreset(bounds));
registerTrustedIpcHandler('model-secrets:status', () => modelSecretStore.status());
registerTrustedIpcHandler('model-secrets:get', (_event, secretId) => modelSecretStore.get(secretId));
registerTrustedIpcHandler('model-secrets:set', (_event, secretId, apiKey) => modelSecretStore.set(secretId, apiKey));
registerTrustedIpcHandler('model-secrets:remove', (_event, secretId) => modelSecretStore.remove(secretId));

appIconService.registerIpcHandlers(registerTrustedIpcHandler);

/* Network IPC implementations live in focused services; keep registration beside the trusted sender guard. */
registerCosIpcHandlers(registerTrustedIpcHandler);
registerModelRequestIpcHandlers(registerTrustedIpcHandler, { modelSecretStore });

app.on('before-quit', () => {
  startupExperience.close();
  saveWindowState(mainWindow);
});

app.on('second-instance', () => {
  writeMainLog('second-instance received');
  if (startupExperience.focusSplash()) return;
  focusMainWindow();
});

attachWebviewSecurityGuards();

app.whenReady().then(() => {
  writeMainLog(`app ready packaged=${app.isPackaged ? '1' : '0'} argv=${process.argv.join(' ')}`);
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else focusMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
