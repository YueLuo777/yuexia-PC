const { app, BrowserWindow, dialog, ipcMain, nativeImage, shell, screen } = require('electron');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { normalizeModelRequestInput } = require('./ipcValidation.cjs');

const DEV_URL = process.env.XINYUEXIA_URL || 'http://127.0.0.1:18328/#/novels';
const DIST_ENTRY = path.join(__dirname, '..', 'dist', 'index.html');
const PRELOAD_ENTRY = path.join(__dirname, 'preload.cjs');
const APP_ICON = path.join(__dirname, '..', 'build', 'app-icon.ico');
const APP_ID = 'com.yuexia.writer.desktop';
const APP_NAME = '月下写作';
const SHARED_STATE_DIR_NAME = 'xinyuexia-desktop';
const DEFAULT_WINDOW_BOUNDS = {
  width: 1366,
  height: 768,
};
const MIN_WINDOW_WIDTH = 1100;
const MIN_WINDOW_HEIGHT = 680;
const CUSTOM_APP_ICON_FILE_NAME = 'custom-app-icon.png';
const CUSTOM_APP_ICON_SOURCE_FILE_NAME = 'custom-app-icon-source.json';
const DEFAULT_APP_ICON_FILE_NAME = 'default-app-icon.png';
const PROJECT_APP_ICON_DIR = path.join(path.resolve(__dirname, '..'), 'ruanjianfengmian');
const PROJECT_APP_ICON_FILE_NAMES = ['fengmian.png', 'fengmian.jpg', 'fengmian.jpeg', 'fengmian.webp', 'fengmian.ico'];
const PROJECT_APP_ICON_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.ico']);
const SHARED_WINDOW_STATE_FILE = path.join(
  app.getPath('appData'),
  SHARED_STATE_DIR_NAME,
  'window-state.json',
);
const LEGACY_WINDOW_STATE_FILES = [
  path.join(app.getPath('userData'), 'window-state.json'),
  path.join(app.getPath('appData'), 'xinyuexia-desktop-dev', 'window-state.json'),
];

let mainWindow = null;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();
if (process.platform === 'win32') app.setAppUserModelId(APP_ID);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveStartUrl() {
  if (process.env.XINYUEXIA_URL) {
    return process.env.XINYUEXIA_URL;
  }
  const startHash = process.env.XINYUEXIA_START_HASH || '#/novels';
  if (process.env.XINYUEXIA_LOAD_DIST === '1' || app.isPackaged) {
    return new URL(startHash, pathToFileURL(DIST_ENTRY).href).href;
  }
  return new URL(startHash, DEV_URL).href;
}

function parseWindowState(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const width = Number(parsed.width);
    const height = Number(parsed.height);
    const x = Number(parsed.x);
    const y = Number(parsed.y);

    if (!Number.isFinite(width) || !Number.isFinite(height)) return null;

    return {
      width: Math.max(MIN_WINDOW_WIDTH, Math.round(width)),
      height: Math.max(MIN_WINDOW_HEIGHT, Math.round(height)),
      x: Number.isFinite(x) ? Math.round(x) : undefined,
      y: Number.isFinite(y) ? Math.round(y) : undefined,
      isMaximized: parsed.isMaximized === true,
    };
  } catch {
    return null;
  }
}

function persistWindowState(state) {
  try {
    fs.mkdirSync(path.dirname(SHARED_WINDOW_STATE_FILE), { recursive: true });
    fs.writeFileSync(SHARED_WINDOW_STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (error) {
    console.warn('Failed to persist window state:', error);
  }
}

function readWindowState() {
  const candidates = [SHARED_WINDOW_STATE_FILE, ...LEGACY_WINDOW_STATE_FILES];
  for (const filePath of candidates) {
    const state = parseWindowState(filePath);
    if (!state) continue;
    if (filePath !== SHARED_WINDOW_STATE_FILE) {
      persistWindowState(state);
    }
    return state;
  }
  return null;
}

function isVisibleOnSomeDisplay(bounds) {
  if (typeof bounds?.x !== 'number' || typeof bounds?.y !== 'number') return true;

  return screen.getAllDisplays().some(({ workArea }) => {
    const horizontalOverlap =
      bounds.x < workArea.x + workArea.width && bounds.x + bounds.width > workArea.x;
    const verticalOverlap =
      bounds.y < workArea.y + workArea.height && bounds.y + bounds.height > workArea.y;
    return horizontalOverlap && verticalOverlap;
  });
}

function getCustomAppIconPath() {
  return path.join(app.getPath('userData'), CUSTOM_APP_ICON_FILE_NAME);
}

function getDefaultAppIconPath() {
  return path.join(app.getPath('userData'), DEFAULT_APP_ICON_FILE_NAME);
}

function getCustomAppIconSourcePath() {
  return path.join(app.getPath('userData'), CUSTOM_APP_ICON_SOURCE_FILE_NAME);
}

function readSelectedProjectIconFileName() {
  try {
    const sourcePath = getCustomAppIconSourcePath();
    if (!fs.existsSync(sourcePath)) return '';
    const parsed = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    return typeof parsed?.fileName === 'string' ? parsed.fileName : '';
  } catch {
    return '';
  }
}

function saveSelectedProjectIconFileName(fileName) {
  fs.mkdirSync(path.dirname(getCustomAppIconSourcePath()), { recursive: true });
  fs.writeFileSync(getCustomAppIconSourcePath(), JSON.stringify({ fileName }, null, 2), 'utf8');
}

function clearSelectedProjectIconFileName() {
  const sourcePath = getCustomAppIconSourcePath();
  if (fs.existsSync(sourcePath)) fs.unlinkSync(sourcePath);
}

function getProjectAppIconPath() {
  return PROJECT_APP_ICON_FILE_NAMES
    .map((fileName) => path.join(PROJECT_APP_ICON_DIR, fileName))
    .find((filePath) => fs.existsSync(filePath)) ?? null;
}

function readProjectAppIcons() {
  if (!fs.existsSync(PROJECT_APP_ICON_DIR)) return [];
  const selectedFileName = readSelectedProjectIconFileName();
  return fs.readdirSync(PROJECT_APP_ICON_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && PROJECT_APP_ICON_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => {
      const filePath = path.join(PROJECT_APP_ICON_DIR, entry.name);
      const image = nativeImage.createFromPath(filePath);
      if (image.isEmpty()) return null;
      const previewImage = image.resize({ width: 128, height: 128, quality: 'best' });
      return {
        fileName: entry.name,
        filePath,
        dataUrl: previewImage.toDataURL(),
        isSelected: entry.name === selectedFileName,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.fileName.localeCompare(b.fileName, 'zh-CN'));
}

function getRoundedRectCoverage(x, y, width, height, radius) {
  const samples = 3;
  let covered = 0;
  for (let sy = 0; sy < samples; sy += 1) {
    for (let sx = 0; sx < samples; sx += 1) {
      const cx = x + (sx + 0.5) / samples;
      const cy = y + (sy + 0.5) / samples;
      const innerX = Math.max(radius, Math.min(cx, width - radius));
      const innerY = Math.max(radius, Math.min(cy, height - radius));
      const dx = cx - innerX;
      const dy = cy - innerY;
      if (dx * dx + dy * dy <= radius * radius) covered += 1;
    }
  }
  return covered / (samples * samples);
}

function roundAppIconImage(sourceImage) {
  if (!sourceImage || sourceImage.isEmpty()) return sourceImage;
  const image = sourceImage.resize({ width: 256, height: 256, quality: 'best' });
  const size = image.getSize();
  if (!size.width || !size.height) return image;
  const bitmap = image.toBitmap();
  const radius = Math.round(Math.min(size.width, size.height) * 0.22);

  for (let y = 0; y < size.height; y += 1) {
    for (let x = 0; x < size.width; x += 1) {
      const offset = (y * size.width + x) * 4;
      bitmap[offset + 3] = Math.round(bitmap[offset + 3] * getRoundedRectCoverage(x, y, size.width, size.height, radius));
    }
  }

  return nativeImage.createFromBitmap(bitmap, size);
}

function saveIconImage(targetPath, sourceImage) {
  if (!sourceImage || sourceImage.isEmpty()) {
    return { ok: false, message: '无法读取这个图片，请换一张 PNG、JPG、WEBP 或 ICO。' };
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const roundedIcon = roundAppIconImage(sourceImage);
  fs.writeFileSync(targetPath, roundedIcon.toPNG());
  return { ok: true };
}

function saveCustomAppIconFromPath(sourcePath, sourceFileName = '') {
  const sourceImage = nativeImage.createFromPath(sourcePath);
  const saved = saveIconImage(getCustomAppIconPath(), sourceImage);
  if (!saved.ok) return saved;
  if (sourceFileName) saveSelectedProjectIconFileName(sourceFileName);
  else clearSelectedProjectIconFileName();
  return { ok: true };
}

function saveCustomAppIconFromDataUrl(dataUrl, sourceFileName = '') {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return { ok: false, message: '没有读取到可用的首页图标。' };
  }
  const sourceImage = nativeImage.createFromDataURL(dataUrl);
  const saved = saveIconImage(getCustomAppIconPath(), sourceImage);
  if (!saved.ok) return saved;
  if (sourceFileName) saveSelectedProjectIconFileName(sourceFileName);
  else clearSelectedProjectIconFileName();
  return { ok: true };
}

function saveCurrentIconAsDefault() {
  const sourceImage = nativeImage.createFromPath(getCurrentAppIconPath());
  return saveIconImage(getDefaultAppIconPath(), sourceImage);
}

function getCurrentAppIconPath() {
  const customIcon = getCustomAppIconPath();
  const defaultIcon = getDefaultAppIconPath();
  const projectIcon = getProjectAppIconPath();
  if (fs.existsSync(customIcon)) return customIcon;
  if (fs.existsSync(defaultIcon)) return defaultIcon;
  if (projectIcon) return projectIcon;
  return APP_ICON;
}

function readCurrentAppIcon() {
  const iconPath = getCurrentAppIconPath();
  const image = nativeImage.createFromPath(iconPath);
  const selectedProjectIconFileName = readSelectedProjectIconFileName();
  const defaultIconPath = getDefaultAppIconPath();
  return {
    ok: !image.isEmpty(),
    isCustom: iconPath !== APP_ICON && iconPath !== defaultIconPath,
    isDefaultOverride: iconPath === defaultIconPath,
    projectIconDir: PROJECT_APP_ICON_DIR,
    acceptedFileNames: PROJECT_APP_ICON_FILE_NAMES,
    selectedProjectIconFileName,
    projectIcons: readProjectAppIcons(),
    defaultIconPath,
    iconPath,
    dataUrl: image.isEmpty() ? '' : image.toDataURL(),
  };
}

function applyWindowIcon(targetWindow = mainWindow) {
  if (!targetWindow || targetWindow.isDestroyed()) return readCurrentAppIcon();
  const icon = nativeImage.createFromPath(getCurrentAppIconPath());
  if (!icon.isEmpty()) targetWindow.setIcon(icon);
  return readCurrentAppIcon();
}

function getWindowOptions(savedState) {
  const bounds = {
    ...DEFAULT_WINDOW_BOUNDS,
    ...(savedState ?? {}),
  };

  if (!isVisibleOnSomeDisplay(bounds)) {
    delete bounds.x;
    delete bounds.y;
  }

  return {
    ...bounds,
    minWidth: MIN_WINDOW_WIDTH,
    minHeight: MIN_WINDOW_HEIGHT,
    title: APP_NAME,
    icon: getCurrentAppIconPath(),
    backgroundColor: '#f9fafb',
    autoHideMenuBar: true,
    frame: false,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: PRELOAD_ENTRY,
      webviewTag: true,
    },
  };
}

function saveWindowState(targetWindow) {
  if (!targetWindow || targetWindow.isDestroyed()) return;

  const bounds = targetWindow.isMaximized()
    ? targetWindow.getNormalBounds()
    : targetWindow.getBounds();

  persistWindowState({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    isMaximized: targetWindow.isMaximized(),
  });
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
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.setAlwaysOnTop(true);
  mainWindow.show();
  mainWindow.focus();
  mainWindow.moveTop();
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
    targetWindow.show();
    targetWindow.focus();
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
  targetWindow.maximize();
}

function attachRendererDiagnostics(targetWindow) {
  if (!targetWindow || targetWindow.isDestroyed()) return;
  targetWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.warn('Renderer did-fail-load:', errorCode, errorDescription, validatedURL);
  });
  targetWindow.webContents.on('render-process-gone', (_event, details) => {
    console.warn('Renderer process gone:', details);
  });
  targetWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    if (level < 2) return;
    console.warn(`Renderer console level=${level} ${sourceId}:${line} ${message}`);
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
    focusMainWindow();
    return mainWindow;
  }

  const savedState = readWindowState();
  mainWindow = new BrowserWindow(getWindowOptions(savedState));

  attachWindowStateTracking(mainWindow);
  attachRendererDiagnostics(mainWindow);
  applySavedWindowState(mainWindow, savedState);

  mainWindow.once('ready-to-show', () => {
    applySavedWindowState(mainWindow, savedState);
    focusMainWindow();
  });

  mainWindow.on('closed', () => {
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

ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window:maximize-toggle', () => {
  if (!mainWindow) return false;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
  return mainWindow.isMaximized();
});

ipcMain.handle('window:close', () => {
  mainWindow?.close();
});

ipcMain.handle('window:is-maximized', () => mainWindow?.isMaximized() ?? false);
ipcMain.handle('window:reload', () => {
  mainWindow?.webContents.reloadIgnoringCache();
});

ipcMain.handle('app-icon:read', async () => readCurrentAppIcon());

ipcMain.handle('app-icon:select', async () => {
  if (!mainWindow || mainWindow.isDestroyed()) return { ok: false, message: '窗口未就绪。' };
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择软件图标图片',
    properties: ['openFile'],
    filters: [
      { name: '图片文件', extensions: ['png', 'jpg', 'jpeg', 'webp', 'ico'] },
      { name: '所有文件', extensions: ['*'] },
    ],
  });
  if (result.canceled || result.filePaths.length === 0) return { ok: false, canceled: true };

  try {
    const saved = saveCustomAppIconFromPath(result.filePaths[0]);
    if (!saved.ok) return saved;
    return { ...applyWindowIcon(mainWindow), ok: true, message: '图标已更新。' };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : '保存图标失败。',
    };
  }
});

ipcMain.handle('app-icon:use-project-icon', async (_event, fileName) => {
  if (typeof fileName !== 'string' || path.basename(fileName) !== fileName) {
    return { ...readCurrentAppIcon(), ok: false, message: '图标文件名无效。' };
  }
  if (!PROJECT_APP_ICON_EXTENSIONS.has(path.extname(fileName).toLowerCase())) {
    return { ...readCurrentAppIcon(), ok: false, message: '只能选择 PNG、JPG、WEBP 或 ICO 图片。' };
  }

  const sourcePath = path.join(PROJECT_APP_ICON_DIR, fileName);
  if (!fs.existsSync(sourcePath)) {
    return { ...readCurrentAppIcon(), ok: false, message: '没有找到这张图标图片。' };
  }

  try {
    const saved = saveCustomAppIconFromPath(sourcePath, fileName);
    if (!saved.ok) return { ...readCurrentAppIcon(), ...saved };
    return { ...applyWindowIcon(mainWindow), ok: true, message: '软件图标已切换。' };
  } catch (error) {
    return {
      ...readCurrentAppIcon(),
      ok: false,
      message: error instanceof Error ? error.message : '切换图标失败。',
    };
  }
});

ipcMain.handle('app-icon:use-data-url', async (_event, dataUrl, sourceFileName = 'home-icon.png') => {
  try {
    const saved = saveCustomAppIconFromDataUrl(dataUrl, sourceFileName);
    if (!saved.ok) return { ...readCurrentAppIcon(), ...saved };
    return { ...applyWindowIcon(mainWindow), ok: true, message: '软件图标已切换为首页图标。' };
  } catch (error) {
    return {
      ...readCurrentAppIcon(),
      ok: false,
      message: error instanceof Error ? error.message : '切换首页图标失败。',
    };
  }
});

ipcMain.handle('app-icon:make-default', async () => {
  try {
    const saved = saveCurrentIconAsDefault();
    if (!saved.ok) return { ...readCurrentAppIcon(), ...saved };
    return { ...applyWindowIcon(mainWindow), ok: true, message: '已将当前图标设为默认图标。' };
  } catch (error) {
    return {
      ...readCurrentAppIcon(),
      ok: false,
      message: error instanceof Error ? error.message : '设置默认图标失败。',
    };
  }
});

ipcMain.handle('app-icon:reset', async () => {
  try {
    const customIcon = getCustomAppIconPath();
    if (fs.existsSync(customIcon)) fs.unlinkSync(customIcon);
    clearSelectedProjectIconFileName();
    return { ...applyWindowIcon(mainWindow), ok: true, message: '已恢复默认图标。' };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : '恢复默认图标失败。',
    };
  }
});

function normalizeCosConfig(input) {
  const config = input && typeof input === 'object' ? input : {};
  const bucket = typeof config.bucket === 'string' ? config.bucket.trim() : '';
  const region = typeof config.region === 'string' ? config.region.trim() : '';
  const secretId = typeof config.secretId === 'string' ? config.secretId.trim() : '';
  const secretKey = typeof config.secretKey === 'string' ? config.secretKey.trim() : '';
  if (!/^[a-z0-9][a-z0-9-]{2,62}-\d{5,}$/.test(bucket)) {
    return { ok: false, message: 'COS Bucket 格式不正确，应类似 writer-1250000000。' };
  }
  if (!/^[a-z0-9-]{3,40}$/.test(region)) {
    return { ok: false, message: 'COS Region 格式不正确，应类似 ap-guangzhou。' };
  }
  if (!secretId || !secretKey) {
    return { ok: false, message: 'COS SecretId / SecretKey 不能为空。' };
  }
  return { ok: true, config: { bucket, region, secretId, secretKey } };
}

function normalizeCosObjectKey(value) {
  const key = typeof value === 'string' ? value.trim().replace(/^\/+/, '') : '';
  if (!key || key.includes('\\') || key.includes('\0') || key.split('/').some((part) => part === '..')) {
    return { ok: false, message: 'COS 云端文件路径无效。' };
  }
  return { ok: true, key };
}

function encodeCosObjectPath(key) {
  return `/${key.split('/').filter(Boolean).map((part) => encodeURIComponent(part)).join('/')}`;
}

function sha1Hex(value) {
  return crypto.createHash('sha1').update(value).digest('hex');
}

function hmacSha1Hex(key, value) {
  return crypto.createHmac('sha1', key).update(value).digest('hex');
}

function createCosAuthorization({ method, pathname, host, secretId, secretKey }) {
  const now = Math.floor(Date.now() / 1000);
  const keyTime = `${now};${now + 600}`;
  const headerList = 'host';
  const urlParamList = '';
  const headerString = `host=${encodeURIComponent(host).toLowerCase()}`;
  const httpString = [
    method.toLowerCase(),
    pathname,
    '',
    headerString,
    '',
  ].join('\n');
  const signKey = hmacSha1Hex(secretKey, keyTime);
  const stringToSign = ['sha1', keyTime, sha1Hex(httpString), ''].join('\n');
  const signature = hmacSha1Hex(signKey, stringToSign);
  return [
    'q-sign-algorithm=sha1',
    `q-ak=${secretId}`,
    `q-sign-time=${keyTime}`,
    `q-key-time=${keyTime}`,
    `q-header-list=${headerList}`,
    `q-url-param-list=${urlParamList}`,
    `q-signature=${signature}`,
  ].join('&');
}

async function requestCosObject({ method, config, key, body, contentType }) {
  const normalizedConfig = normalizeCosConfig(config);
  if (!normalizedConfig.ok) return { ok: false, status: 400, message: normalizedConfig.message };
  const normalizedKey = normalizeCosObjectKey(key);
  if (!normalizedKey.ok) return { ok: false, status: 400, message: normalizedKey.message };

  const { bucket, region, secretId, secretKey } = normalizedConfig.config;
  const host = `${bucket}.cos.${region}.myqcloud.com`;
  const pathname = encodeCosObjectPath(normalizedKey.key);
  const authorization = createCosAuthorization({ method, pathname, host, secretId, secretKey });
  const headers = {
    Authorization: authorization,
  };
  if (method === 'PUT') {
    headers['Content-Type'] = contentType || 'application/json; charset=utf-8';
  }

  try {
    const response = await fetch(`https://${host}${pathname}`, {
      method,
      headers,
      body: method === 'PUT' ? String(body ?? '') : undefined,
    });
    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      text,
      key: normalizedKey.key,
      message: response.ok ? undefined : text.slice(0, 500) || `COS request failed (${response.status}).`,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message: error instanceof Error ? error.message : 'COS request failed.',
    };
  }
}

ipcMain.handle('cos:put-object', async (_event, input) => requestCosObject({
  method: 'PUT',
  config: input?.config,
  key: input?.key,
  body: input?.body,
  contentType: input?.contentType,
}));

ipcMain.handle('cos:get-object', async (_event, input) => requestCosObject({
  method: 'GET',
  config: input?.config,
  key: input?.key,
}));

ipcMain.handle('model:request', async (_event, input) => {
  const request = normalizeModelRequestInput(input);
  if (!request.ok) {
    return { ok: false, status: 400, text: request.message };
  }

  const timeoutMs = Number.isFinite(Number(input?.timeoutMs)) ? Math.max(1000, Number(input.timeoutMs)) : 60000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(request.endpoint, {
      method: 'POST',
      headers: request.headers,
      body: request.body,
      signal: controller.signal,
    });
    return {
      ok: response.ok,
      status: response.status,
      text: await response.text(),
    };
  } catch (error) {
    return {
      ok: false,
      status: error instanceof Error && error.name === 'AbortError' ? 408 : 0,
      text: error instanceof Error && error.name === 'AbortError'
        ? `Model request timed out after ${timeoutMs}ms.`
        : error instanceof Error ? error.message : 'Model request failed.',
    };
  } finally {
    clearTimeout(timeout);
  }
});

const modelStreamControllers = new Map();

function extractModelStreamParts(payload) {
  const choices = Array.isArray(payload?.choices) ? payload.choices : [];
  const openAiText = choices
    .map((choice) => choice?.delta?.content ?? choice?.message?.content ?? choice?.text ?? '')
    .join('');
  const openAiReasoning = choices
    .map((choice) => (
      choice?.delta?.reasoning_content
      ?? choice?.delta?.reasoning
      ?? choice?.delta?.reasoning_text
      ?? choice?.delta?.thinking
      ?? ''
    ))
    .join('');
  if (openAiText || openAiReasoning) {
    return { content: openAiText, reasoning: openAiReasoning };
  }

  if (payload?.type === 'content_block_delta' && typeof payload?.delta?.text === 'string') {
    return { content: payload.delta.text, reasoning: '' };
  }
  if (
    payload?.type === 'content_block_delta'
    && (payload?.delta?.type === 'thinking_delta' || typeof payload?.delta?.thinking === 'string')
  ) {
    return { content: '', reasoning: payload.delta.thinking ?? '' };
  }
  if (payload?.type === 'message_delta' && typeof payload?.delta?.text === 'string') {
    return { content: payload.delta.text, reasoning: '' };
  }
  if (typeof payload?.reasoning_content === 'string') return { content: '', reasoning: payload.reasoning_content };
  if (typeof payload?.reasoning === 'string') return { content: '', reasoning: payload.reasoning };
  if (typeof payload?.completion === 'string') return { content: payload.completion, reasoning: '' };
  if (typeof payload?.content === 'string') return { content: payload.content, reasoning: '' };
  return { content: '', reasoning: '' };
}

function consumeModelStreamBuffer(buffer, sendChunk) {
  const lines = buffer.split(/\r?\n/);
  const rest = lines.pop() ?? '';
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line.startsWith('data:')) continue;
    const dataLine = line.slice(5).trim();
    if (!dataLine || dataLine === '[DONE]') continue;
    try {
      const parts = extractModelStreamParts(JSON.parse(dataLine));
      if (parts.reasoning) sendChunk(parts.reasoning, 'reasoning');
      if (parts.content) sendChunk(parts.content, 'content');
    } catch {
      // Ignore malformed event fragments and keep reading the stream.
    }
  }
  return rest;
}

ipcMain.handle('model:stream', async (event, input) => {
  const request = normalizeModelRequestInput(input);
  if (!request.ok) {
    return { ok: false, status: 400, text: request.message };
  }

  const requestId = typeof input?.requestId === 'string' && input.requestId ? input.requestId : `model-stream-${Date.now()}`;
  const channel = `model:stream:${requestId}`;
  const timeoutMs = Number.isFinite(Number(input?.timeoutMs)) ? Math.max(1000, Number(input.timeoutMs)) : 180000;
  const controller = new AbortController();
  modelStreamControllers.set(requestId, controller);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let fullText = '';

  const sendChunk = (text, chunkType = 'content') => {
    if (chunkType === 'content') fullText += text;
    event.sender.send(channel, { type: 'chunk', chunkType, text });
  };

  try {
    const response = await fetch(request.endpoint, {
      method: 'POST',
      headers: request.headers,
      body: request.body,
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      return {
        ok: response.ok,
        status: response.status,
        text: await response.text(),
      };
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      buffer = consumeModelStreamBuffer(buffer, sendChunk);
    }
    buffer += decoder.decode();
    consumeModelStreamBuffer(`${buffer}\n`, sendChunk);

    return {
      ok: true,
      status: response.status,
      text: fullText,
    };
  } catch (error) {
    return {
      ok: false,
      status: error instanceof Error && error.name === 'AbortError' ? 408 : 0,
      text: error instanceof Error && error.name === 'AbortError'
        ? `Model request timed out after ${timeoutMs}ms.`
        : error instanceof Error ? error.message : 'Model stream request failed.',
    };
  } finally {
    clearTimeout(timeout);
    modelStreamControllers.delete(requestId);
  }
});

ipcMain.handle('model:cancel-stream', async (_event, requestId) => {
  const controller = modelStreamControllers.get(requestId);
  if (!controller) return false;
  controller.abort();
  modelStreamControllers.delete(requestId);
  return true;
});

app.on('before-quit', () => {
  saveWindowState(mainWindow);
});

app.on('second-instance', () => {
  focusMainWindow();
});

attachWebviewSecurityGuards();

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else focusMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
