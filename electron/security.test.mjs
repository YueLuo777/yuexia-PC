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

    expect(mainSource).toContain('contextIsolation: true');
    expect(mainSource).toContain('nodeIntegration: false');
    expect(mainSource).toContain('sandbox: true');
    expect(mainSource).toContain('mainWindow.webContents.setWindowOpenHandler');
    expect(mainSource).toContain("['http:', 'https:', 'mailto:'].includes(parsed.protocol)");
    expect(mainSource).toContain("return { action: 'deny' };");
  });

  it('does not allow webview popups from embedded browser surfaces', () => {
    const testBrowserSource = readWorkspaceFile('src/features/browser/pages/TestBrowserPage.tsx');
    const scriptBrowserSource = readWorkspaceFile('src/features/script-editor/components/BrowserWorkspace.tsx');

    expect(testBrowserSource).toContain("React.createElement('webview'");
    expect(scriptBrowserSource).toContain("React.createElement('webview'");
    expect(testBrowserSource).not.toContain('allowpopups');
    expect(scriptBrowserSource).not.toContain('allowpopups');
  });
});
