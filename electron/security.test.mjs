import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '..');

function readWorkspaceFile(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Electron security source guards', () => {
  it('keeps the main window isolated and denies renderer-created windows', () => {
    const mainSource = readWorkspaceFile('electron/main.cjs');

    expect(mainSource).toContainSource('contextIsolation: true');
    expect(mainSource).toContainSource('nodeIntegration: false');
    expect(mainSource).toContainSource('sandbox: true');
    expect(mainSource).toContainSource('mainWindow.webContents.setWindowOpenHandler');
    expect(mainSource).toContainSource("['http:', 'https:', 'mailto:'].includes(parsed.protocol)");
    expect(mainSource).toContainSource("return { action: 'deny' };");
    expect(mainSource).toContainSource('function normalizeDevServerUrl(input)');
    expect(mainSource).toContainSource('if (!isLoopbackHostname(parsed.hostname)) return null;');
    expect(mainSource).toContainSource("mainWindow.webContents.on('will-navigate'");
    expect(mainSource).toContainSource('if (isTrustedRendererUrl(url)) return;');
    expect(mainSource).toContainSource("targetWindow.webContents.on('console-message', (details) =>");
    expect(mainSource).toContainSource('details.lineNumber');
  });

  it('does not allow webview popups from embedded browser surfaces', () => {
    const testBrowserSource = readWorkspaceFile('src/features/browser/pages/TestBrowserPage.tsx');
    const scriptBrowserSource = readWorkspaceFile('src/features/script-editor/components/BrowserWorkspace.tsx');

    expect(testBrowserSource).toContainSource("React.createElement('webview'");
    expect(scriptBrowserSource).toContainSource("React.createElement('webview'");
    expect(testBrowserSource).toContainSource('isEmbeddedBrowserEnabled()');
    expect(scriptBrowserSource).toContainSource('isEmbeddedBrowserEnabled()');
    expect(testBrowserSource).not.toContainSource('allowpopups');
    expect(scriptBrowserSource).not.toContainSource('allowpopups');
  });

  it('hardens attached webviews in the main process', () => {
    const mainSource = readWorkspaceFile('electron/main.cjs');

    expect(mainSource).toContainSource("app.on('web-contents-created'");
    expect(mainSource).toContainSource("contents.on('will-attach-webview'");
    expect(mainSource).toContainSource('function isWebviewTagEnabled()');
    expect(mainSource).toContainSource("process.env.XINYUEXIA_ENABLE_WEBVIEW === '1'");
    expect(mainSource).toContainSource('webviewTag: isWebviewTagEnabled()');
    expect(mainSource).toContainSource('delete webPreferences.preload');
    expect(mainSource).toContainSource('webPreferences.nodeIntegration = false');
    expect(mainSource).toContainSource('webPreferences.contextIsolation = true');
    expect(mainSource).toContainSource('webPreferences.sandbox = true');
    expect(mainSource).toContainSource("['http:', 'https:'].includes(parsed.protocol)");
    expect(mainSource).toContainSource('event.preventDefault();');
    expect(mainSource).toContainSource('contents.session.setPermissionCheckHandler(() => false);');
    expect(mainSource).toContainSource('callback(false)');
  });

  it('accepts privileged IPC only from the trusted main renderer', () => {
    const mainSource = readWorkspaceFile('electron/main.cjs');

    expect(mainSource).toContainSource('function isTrustedIpcSender(event)');
    expect(mainSource).toContainSource('if (event.sender !== mainWindow.webContents) return false;');
    expect(mainSource).toContainSource('function registerTrustedIpcHandler(channel, listener)');
    expect(mainSource).toContainSource('Blocked untrusted IPC sender');
    expect(mainSource).not.toMatch(/^ipcMain\.handle\('/m);
  });

  it('keeps model API keys in Electron safeStorage instead of renderer request headers', () => {
    const mainSource = readWorkspaceFile('electron/main.cjs');
    const preloadSource = readWorkspaceFile('electron/preload.cjs');
    const modelSource = readWorkspaceFile('src/features/models/services/callModel.ts');

    expect(mainSource).toContainSource('safeStorage');
    expect(mainSource).toContainSource("registerTrustedIpcHandler('model-secrets:set'");
    expect(mainSource).toContainSource('applyStoredModelSecret');
    expect(preloadSource).toContainSource("contextBridge.exposeInMainWorld('xinyuexiaModelSecrets'");
    expect(modelSource).toContainSource('modelSecretId');
    expect(modelSource).toContainSource('...(modelSecretId ? {} : { Authorization: `Bearer ${model.apiKey}` })');
  });
});
