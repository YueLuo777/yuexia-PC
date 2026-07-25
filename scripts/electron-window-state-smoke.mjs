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
      XINYUEXIA_SMOKE_CLOSE_HANDSHAKE: '1',
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

  await page.evaluate(() => globalThis.xinyuexiaWindow.applyBoundsPreset({ width: 1600, height: 900 }));
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
    globalThis.xinyuexiaWindow.updateSettings({
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
  const fixedStartupPage = await electronApp.firstWindow({ timeout: 30_000 });
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

  await fixedStartupPage.evaluate(() => globalThis.xinyuexiaWindow.updateSettings({ startMaximized: true }));
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
      XINYUEXIA_SMOKE_CLOSE_HANDSHAKE: '1',
    },
    timeout: 30_000,
  });
  const maximizedStartupPage = await electronApp.firstWindow({ timeout: 30_000 });
  const maximizedStartupState = await electronApp.evaluate(({ BrowserWindow }) => {
    const targetWindow = BrowserWindow.getAllWindows()[0];
    return { isMaximized: targetWindow?.isMaximized() ?? false, isVisible: targetWindow?.isVisible() ?? false };
  });
  assert.equal(maximizedStartupState.isMaximized, true, 'start-maximized setting should win on the next launch');
  assert.equal(maximizedStartupState.isVisible, false, 'maximized startup smoke should remain hidden');

  await maximizedStartupPage.evaluate(() => {
    localStorage.setItem('xinyuexia_keep_workbench_associations_v1', '0');
    localStorage.setItem('xinyuexia_keep_workbench_ai_outputs_v1', '0');
    localStorage.setItem(
      'xinyuexia_workbench_linked_context_1',
      JSON.stringify({ associationSessionId: 'old', items: [{ id: 'linked', source: 'setting' }] }),
    );
    localStorage.setItem(
      'xinyuexia_workbench_ai_sessions_1',
      JSON.stringify({ sessions: [{ id: 1, output: 'old output', messages: [{ content: 'old output' }] }] }),
    );
  });
  const closed = electronApp.waitForEvent('close');
  await maximizedStartupPage.evaluate(() => globalThis.xinyuexiaWindow.close());
  await closed;
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
      XINYUEXIA_SMOKE_CLOSE_HANDSHAKE: '1',
    },
    timeout: 30_000,
  });
  const cleanupPage = await electronApp.firstWindow({ timeout: 30_000 });
  const cleanupState = await cleanupPage.evaluate(() => ({
    linkedContext: localStorage.getItem('xinyuexia_workbench_linked_context_1'),
    aiSession: JSON.parse(localStorage.getItem('xinyuexia_workbench_ai_sessions_1') ?? '{}').sessions?.[0],
  }));
  assert.equal(cleanupState.linkedContext, null, 'desktop close handshake should clear linked context');
  assert.equal(cleanupState.aiSession?.output ?? '', '', 'desktop close handshake should clear AI output');
  console.log('Electron smoke passed: window modes and renderer-confirmed close cleanup.');
} finally {
  await electronApp?.close().catch(() => {});
  await rm(userDataDir, { recursive: true, force: true });
}
