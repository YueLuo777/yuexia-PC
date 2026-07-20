import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..');
const { getStartupWindowBounds } = require('./startupExperience.cjs');

function readWorkspaceFile(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Electron startup experience', () => {
  it('centers the startup window on the display containing the saved app window', () => {
    const matchingDisplay = { workArea: { x: 1920, y: 0, width: 1920, height: 1080 } };
    const screen = {
      getDisplayMatching: (bounds) => {
        expect(bounds).toEqual({ x: 2100, y: 90, width: 1366, height: 768 });
        return matchingDisplay;
      },
      getPrimaryDisplay: () => {
        throw new Error('saved bounds should select their matching display');
      },
    };

    expect(getStartupWindowBounds(screen, { x: 2100, y: 90, width: 1366, height: 768 })).toEqual({
      width: 440,
      height: 272,
      x: 2660,
      y: 404,
    });
  });

  it('keeps the main window hidden until the first route signals renderer readiness', () => {
    const mainSource = readWorkspaceFile('electron/main.cjs');
    const preloadSource = readWorkspaceFile('electron/preload.cjs');
    const appSource = readWorkspaceFile('src/app/App.tsx');
    const signalSource = readWorkspaceFile('src/app/RendererReadySignal.tsx');

    expect(mainSource).toContainSource("registerTrustedIpcHandler('app:renderer-ready'");
    expect(mainSource).toContainSource("startupExperience.reveal('renderer-ready')");
    expect(mainSource).not.toContainSource("revealCreatedWindow('ready-to-show')");
    expect(preloadSource).toContainSource("ipcRenderer.invoke('app:renderer-ready')");
    expect(appSource).toContainSource('<RendererReadySignal />');
    expect(signalSource).toContainSource('window.xinyuexiaWindow?.signalRendererReady?.()');
  });

  it('uses a branded local startup surface and a hidden VBS launch path', () => {
    const startupSource = readWorkspaceFile('electron/startupExperience.cjs');
    const startupHtml = readWorkspaceFile('electron/startup.html');
    const launcherSource = readWorkspaceFile('月下PC版.vbs');

    expect(startupSource).toContainSource("sandbox: true");
    expect(startupSource).toContainSource("setWindowOpenHandler(() => ({ action: 'deny' }))");
    expect(startupHtml).toContain('正在整理你的创作空间');
    expect(startupHtml).toContain('prefers-reduced-motion');
    expect(launcherSource).toContainSource('shell.Run command, 0, False');
    expect(launcherSource).not.toContain('Win32_ProcessStartup');
  });
});
