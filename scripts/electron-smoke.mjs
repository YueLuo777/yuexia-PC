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
    },
    timeout: 30_000,
  });

  page = await electronApp.firstWindow({ timeout: 30_000 });

  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
  });

  await page.waitForLoadState('domcontentloaded');
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });
  assert.match(page.url(), /#\/novels(?:$|[/?])/, 'desktop app should open the novel library');

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
