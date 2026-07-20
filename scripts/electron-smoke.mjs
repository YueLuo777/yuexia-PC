import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { _electron as electron } from 'playwright';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-electron-smoke-'));

let electronApp;
let page;
const runtimeErrors = [];

try {
  electronApp = await electron.launch({
    executablePath: electronExecutable,
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

  await electronApp.evaluate(async ({ BrowserWindow, screen }) => {
    let appWindow = BrowserWindow.getAllWindows()[0];
    for (let attempt = 0; !appWindow && attempt < 40; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 25));
      appWindow = BrowserWindow.getAllWindows()[0];
    }
    if (!appWindow) return;
    const primaryDisplay = screen.getPrimaryDisplay();
    const secondaryDisplay = screen.getAllDisplays().find((display) => display.id !== primaryDisplay.id);
    if (!secondaryDisplay) return;
    const bounds = appWindow.getBounds();
    const { workArea } = secondaryDisplay;
    const width = Math.min(bounds.width, workArea.width);
    const height = Math.min(bounds.height, Math.max(1, Math.floor(workArea.height * 0.75) - 8));
    appWindow.setBounds({
      x: workArea.x + Math.floor((workArea.width - width) / 2),
      y: workArea.y + Math.floor((workArea.height - height) / 2),
      width,
      height,
    });
  });

  page = await electronApp.firstWindow({ timeout: 30_000 });

  const smokeWindowIsVisible = await electronApp.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0]?.isVisible(),
  );
  assert.equal(smokeWindowIsVisible, false, 'automated smoke window should remain hidden');

  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
  });

  await page.waitForLoadState('domcontentloaded');
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });
  assert.match(page.url(), /#\/novels(?:$|[/?])/, 'desktop app should open the novel library');

  const startupWindowGeometry = await electronApp.evaluate(({ BrowserWindow, screen }) => {
    const appWindow = BrowserWindow.getAllWindows()[0];
    const bounds = appWindow.getBounds();
    const workArea = screen.getDisplayMatching(bounds).workArea;
    return { bounds, workArea };
  });
  assert.ok(
    startupWindowGeometry.bounds.height <= Math.floor(startupWindowGeometry.workArea.height * 0.75),
    `startup window height ${startupWindowGeometry.bounds.height} should stay within 75% of work area height ${startupWindowGeometry.workArea.height}`,
  );

  const overviewValuesStayInsideCards = await page.locator('[data-overview-stat]').evaluateAll(
    (cards) =>
      cards.length === 4 &&
      cards.every((card) => {
        const value = card.querySelector('[data-auto-fit-text] > span');
        if (!value) return false;
        const cardRect = card.getBoundingClientRect();
        const valueRect = value.getBoundingClientRect();
        return valueRect.left >= cardRect.left - 0.5 && valueRect.right <= cardRect.right + 0.5;
      }),
  );
  assert.equal(overviewValuesStayInsideCards, true, 'overview values should stay inside their card borders');

  const defaultNovel = page.getByRole('button', { name: /默认小说1/ });
  await defaultNovel.waitFor({ timeout: 15_000 });
  await defaultNovel.click();

  const auditButton = page.getByRole('button', { name: /剧情审核/ });
  await auditButton.waitFor({ timeout: 30_000 });
  await auditButton.click();
  await page.getByText('第1章 剧情审核', { exact: true }).waitFor({ timeout: 30_000 });

  await page.waitForTimeout(500);
  assert.deepEqual(runtimeErrors, [], `renderer runtime errors:\n${runtimeErrors.join('\n')}`);
  process.stdout.write('Electron smoke passed: novel library -> workbench -> 第1章 剧情审核。\n');
} catch (error) {
  if (page) {
    const bodyText = await page
      .locator('body')
      .innerText()
      .catch(() => '');
    process.stderr.write(`Electron smoke page URL: ${page.url()}\n`);
    process.stderr.write(`Electron smoke body: ${bodyText.slice(0, 2_000)}\n`);
  }
  if (runtimeErrors.length > 0) {
    process.stderr.write(`Electron smoke runtime errors:\n${runtimeErrors.join('\n')}\n`);
  }
  throw error;
} finally {
  if (electronApp) await electronApp.close();
  await rm(userDataDir, { recursive: true, force: true });
}
