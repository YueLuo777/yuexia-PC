import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('App association cleanup lifecycle', () => {
  it('resets stale associations on startup and binds close cleanup', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/app/App.tsx'), 'utf8');
    const mainSource = readFileSync(resolve(process.cwd(), 'src/main.tsx'), 'utf8');

    expect(mainSource).toContainSource('resetWorkbenchAssociationsForNewAppSession();');
    expect(mainSource).toContainSource('resetWorkbenchTransientAiDraftsForNewAppSession();');
    expect(mainSource.indexOf('resetWorkbenchAssociationsForNewAppSession();')).toBeLessThan(
      mainSource.indexOf('ReactDOM.createRoot'),
    );
    expect(source).toContainSource('bindWorkbenchAssociationCloseCleanup');
    expect(source).toContainSource('bindWorkbenchTransientAiCleanup');
    expect(source).toContainSource('disposeTransientAiCleanup');
    expect(source).toContainSource('onPrepareClose');
    expect(source).toContainSource('prepareWorkbenchForAppClose();');
    expect(source).toContainSource('confirmCloseCleanup');
  });

  it('makes Electron wait for renderer cleanup before closing', () => {
    const mainSource = readFileSync(resolve(process.cwd(), 'electron/main.cjs'), 'utf8');
    const preloadSource = readFileSync(resolve(process.cwd(), 'electron/preload.cjs'), 'utf8');
    expect(mainSource).toContainSource("mainWindow.webContents.send('app:prepare-close');");
    expect(mainSource).toContainSource("registerTrustedIpcHandler('app:close-ready'");
    expect(preloadSource).toContainSource("ipcRenderer.on('app:prepare-close', listener);");
    expect(preloadSource).toContainSource("ipcRenderer.invoke('app:close-ready')");
  });

  it('runs both cleanup policies before the custom desktop close command', () => {
    const frameSource = readFileSync(resolve(process.cwd(), 'src/shared/layout/AppFrameView.tsx'), 'utf8');
    const closeCleanupSource = readFileSync(
      resolve(process.cwd(), 'src/features/workbench/model/workbenchAppCloseCleanup.ts'),
      'utf8',
    );

    expect(frameSource).toContainSource('prepareWorkbenchForAppClose();');
    expect(frameSource).toContainSource('void window.xinyuexiaWindow?.close();');
    expect(closeCleanupSource).toContainSource('cleanupWorkbenchAssociationsOnClose();');
    expect(closeCleanupSource).toContainSource('cleanupWorkbenchTransientAiDraftsOnClose();');
  });
});
