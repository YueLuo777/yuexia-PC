import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import windowStateStoreModule from './windowStateStore.cjs';

const { createWindowStateStore } = windowStateStoreModule;
const tempDirs = [];

function makeTempDir(name) {
  const directory = mkdtempSync(path.join(tmpdir(), name));
  tempDirs.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of tempDirs.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('window state storage isolation', () => {
  it('routes headless smoke state into Electron temporary user data', () => {
    const mainSource = readFileSync(path.join(process.cwd(), 'electron', 'main.cjs'), 'utf8');

    expect(mainSource).toContain("const IS_HEADLESS_SMOKE = process.env.XINYUEXIA_SMOKE_HEADLESS === '1'");
    expect(mainSource).toContain("stateDir: IS_HEADLESS_SMOKE ? app.getPath('userData') : undefined");
    expect(mainSource).toContain('if (!targetWindow.isMaximized()) targetWindow.maximize()');
    expect(mainSource).toContain('if (IS_HEADLESS_SMOKE) targetWindow.hide()');
    expect(mainSource).not.toContain('saved maximized state ignored');
    expect(mainSource.match(/applySavedWindowState\(/g)).toHaveLength(2);
  });

  it('reads and writes only the explicit state directory used by smoke tests', () => {
    const appDataDir = makeTempDir('xinyuexia-app-data-');
    const userDataDir = makeTempDir('xinyuexia-user-data-');
    const isolatedStateDir = makeTempDir('xinyuexia-smoke-state-');
    const sharedStateDir = path.join(appDataDir, 'xinyuexia-desktop');
    const sharedStateFile = path.join(sharedStateDir, 'window-state.json');
    const isolatedStateFile = path.join(isolatedStateDir, 'window-state.json');

    const app = {
      getPath(name) {
        return name === 'appData' ? appDataDir : userDataDir;
      },
    };
    const store = createWindowStateStore({
      app,
      sharedStateDirName: 'xinyuexia-desktop',
      minWidth: 1100,
      minHeight: 680,
      defaultBounds: { width: 1600, height: 900 },
      stateDir: isolatedStateDir,
    });

    expect(store.readSettings()).toEqual({ rememberSize: false, startupBounds: { width: 1600, height: 900 } });
    mkdirSync(sharedStateDir, { recursive: true });
    writeFileSync(sharedStateFile, '{"width":2064,"height":1120}', { encoding: 'utf8', flag: 'wx' });
    expect(store.readState()).toEqual({ width: 1600, height: 900, isMaximized: false });
    store.persistSettings({ rememberSize: true, startupBounds: { width: 1600, height: 900 } });
    expect(store.readState()).toBeNull();

    store.persistState({ width: 1374, height: 777, isMaximized: false });

    expect(JSON.parse(readFileSync(isolatedStateFile, 'utf8'))).toMatchObject({ width: 1374, height: 777 });
    expect(JSON.parse(readFileSync(sharedStateFile, 'utf8'))).toEqual({ width: 2064, height: 1120 });
    expect(existsSync(path.join(userDataDir, 'window-state.json'))).toBe(false);
  });
});
