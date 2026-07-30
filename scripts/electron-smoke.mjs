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
const smokeNovelTitle = 'E2E Novel';
const renamedSmokeNovelTitle = 'E2E Novel Renamed';
const smokeChapterTitle = 'E2E Chapter';
const smokeChapterContent = 'Automated body content.\nSecond paragraph verifies persistence.';

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

  await page.getByRole('button', { name: '新建小说' }).click();
  await page.locator('input:visible').last().fill(smokeNovelTitle);
  await page.getByRole('button', { name: /^确[定认]$/ }).last().click();

  const smokeNovelCard = page.getByText(smokeNovelTitle, { exact: true }).last().locator('xpath=ancestor::article');
  await smokeNovelCard.waitFor({ timeout: 15_000 });
  await smokeNovelCard.click();

  await page.locator('[data-route-ready="/workbench"]').waitFor({ timeout: 30_000 });
  const chapterTitleInput = page.locator('input[placeholder="请输入章节标题"]:visible');
  const chapterEditor = page.locator('textarea.xy-wa-editor-text-layer:visible');
  await chapterTitleInput.waitFor({ timeout: 30_000 });
  await chapterTitleInput.fill(smokeChapterTitle);
  await chapterEditor.fill(smokeChapterContent);
  await page.waitForTimeout(800);

  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await page.locator('[data-route-ready="/workbench"]').waitFor({ timeout: 30_000 });
  await chapterEditor.waitFor({ timeout: 30_000 });
  assert.equal(await chapterTitleInput.inputValue(), smokeChapterTitle, 'chapter title should survive reload');
  assert.equal(await chapterEditor.inputValue(), smokeChapterContent, 'chapter content should survive reload');

  const auditButton = page.getByRole('button', { name: /审核检查|剧情审核/ });
  await auditButton.waitFor({ timeout: 30_000 });
  await auditButton.click();
  await page.getByText('第1章 剧情审核', { exact: true }).waitFor({ timeout: 30_000 });

  await page.evaluate(() => {
    globalThis.location.hash = '#/novels';
  });
  await page.locator('[data-route-ready="/novels"]').waitFor({ timeout: 30_000 });

  const searchInput = page.locator('input[placeholder="搜索小说"]:visible');
  await searchInput.fill('E2E Novel');
  await page.getByText(smokeNovelTitle, { exact: true }).last().waitFor();
  await searchInput.fill('NOT-FOUND-E2E');
  await page.getByText('暂无小说', { exact: true }).waitFor();
  await searchInput.fill('');

  const returnedSmokeCard = page.getByText(smokeNovelTitle, { exact: true }).last().locator('xpath=ancestor::article');
  await returnedSmokeCard.locator('button[title="更多"]').click();
  await page.getByRole('menuitem', { name: '重命名', exact: true }).click();
  await page.locator('input:visible').last().fill(renamedSmokeNovelTitle);
  await page.getByRole('button', { name: /^确[定认]$/ }).last().click();
  await page.getByText(renamedSmokeNovelTitle, { exact: true }).last().waitFor();

  const renamedSmokeCard = page
    .getByText(renamedSmokeNovelTitle, { exact: true })
    .last()
    .locator('xpath=ancestor::article');
  await renamedSmokeCard.locator('button[title="更多"]').click();
  await page.getByRole('menuitem', { name: '移入回收站', exact: true }).click();
  await page.getByRole('button', { name: '移入回收站', exact: true }).click();
  await page.getByRole('button', { name: '回收站（1）', exact: true }).click();
  await page.getByText(renamedSmokeNovelTitle, { exact: true }).waitFor();
  await page.getByRole('button', { name: '恢复', exact: true }).click();
  await page.getByText(renamedSmokeNovelTitle, { exact: true }).last().waitFor();

  await page.waitForTimeout(500);
  assert.deepEqual(runtimeErrors, [], `renderer runtime errors:\n${runtimeErrors.join('\n')}`);
  process.stdout.write(
    'Electron smoke passed: create -> edit -> reload -> audit -> search -> rename -> recycle -> restore.\n',
  );
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
