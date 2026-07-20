import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-window-state-smoke-'));
let electronApp;

try {
  await writeFile(path.join(userDataDir, 'window-settings.json'), JSON.stringify({ rememberSize: true }), 'utf8');
  await writeFile(
    path.join(userDataDir, 'window-state.json'),
    JSON.stringify({ x: 340, y: 167, width: 1386, height: 786, isMaximized: true }),
    'utf8',
  );

  electronApp = await electron.launch({
    executablePath: require('electron'),
    cwd: repoRoot,
    args: [path.join(repoRoot, 'electron', 'main.cjs'), `--user-data-dir=${userDataDir}`],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
      NODE_ENV: 'test',
      XINYUEXIA_LOAD_DIST: '1',
      XINYUEXIA_SMOKE_HEADLESS: '1',
    },
    timeout: 30_000,
  });

  const page = await electronApp.firstWindow({ timeout: 30_000 });
  const state = await electronApp.evaluate(({ BrowserWindow }) => {
    const targetWindow = BrowserWindow.getAllWindows()[0];
    return {
      exists: Boolean(targetWindow),
      isMaximized: targetWindow?.isMaximized() ?? false,
      isVisible: targetWindow?.isVisible() ?? false,
    };
  });

  assert.equal(state.exists, true, 'main window should be created');
  assert.equal(state.isMaximized, true, 'saved maximized state should be restored');
  assert.equal(state.isVisible, false, 'window state smoke should remain hidden');

  await page.evaluate(() => window.xinyuexiaWindow.applyBoundsPreset({ width: 1600, height: 900 }));
  const presetState = await electronApp.evaluate(({ BrowserWindow, screen }) => {
    const targetWindow = BrowserWindow.getAllWindows()[0];
    const bounds = targetWindow.getBounds();
    const workArea = screen.getDisplayMatching(bounds).workArea;
    return { bounds, isMaximized: targetWindow.isMaximized(), isVisible: targetWindow.isVisible(), workArea };
  });
  const expectedWidth = Math.min(1600, presetState.workArea.width);
  const expectedHeight = Math.min(900, presetState.workArea.height);
  assert.equal(presetState.isMaximized, false, 'applying a preset should leave maximized mode');
  assert.ok(Math.abs(presetState.bounds.width - expectedWidth) <= 4, 'preset width should fit the active display');
  assert.ok(Math.abs(presetState.bounds.height - expectedHeight) <= 4, 'preset height should fit the active display');
  assert.equal(presetState.isVisible, false, 'window state smoke should remain hidden after applying a preset');

  await page.evaluate(() =>
    window.xinyuexiaWindow.updateSettings({
      rememberSize: false,
      startupBounds: { width: 1600, height: 900 },
    }),
  );
  await electronApp.close();
  electronApp = await electron.launch({
    executablePath: require('electron'),
    cwd: repoRoot,
    args: [path.join(repoRoot, 'electron', 'main.cjs'), `--user-data-dir=${userDataDir}`],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
      NODE_ENV: 'test',
      XINYUEXIA_LOAD_DIST: '1',
      XINYUEXIA_SMOKE_HEADLESS: '1',
    },
    timeout: 30_000,
  });
  await electronApp.firstWindow({ timeout: 30_000 });
  const fixedStartupState = await electronApp.evaluate(({ BrowserWindow, screen }) => {
    const targetWindow = BrowserWindow.getAllWindows()[0];
    const bounds = targetWindow.getBounds();
    const workArea = screen.getDisplayMatching(bounds).workArea;
    return { bounds, isMaximized: targetWindow.isMaximized(), isVisible: targetWindow.isVisible(), workArea };
  });
  assert.equal(fixedStartupState.isMaximized, false, 'fixed startup mode should ignore an old maximized state');
  assert.ok(
    Math.abs(fixedStartupState.bounds.width - Math.min(1600, fixedStartupState.workArea.width)) <= 4,
    'fixed startup width should be restored',
  );
  assert.ok(
    Math.abs(fixedStartupState.bounds.height - Math.min(900, fixedStartupState.workArea.height)) <= 4,
    'fixed startup height should be restored',
  );
  assert.equal(fixedStartupState.isVisible, false, 'fixed startup smoke should remain hidden');
  console.log('Electron window state smoke passed: memory mode and fixed startup mode are mutually exclusive.');
} finally {
  await electronApp?.close().catch(() => {});
  await rm(userDataDir, { recursive: true, force: true });
}
