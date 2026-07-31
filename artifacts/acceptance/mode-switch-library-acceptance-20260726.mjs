import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-mode-switch-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'acceptance');
const resultPath = path.join(evidenceDir, 'mode-switch-library-acceptance-20260726.json');
const acceptancePort = process.env.XINYUEXIA_ACCEPTANCE_PORT;
const displayPoint = {
  x: Number(process.env.XINYUEXIA_ACCEPTANCE_DISPLAY_X),
  y: Number(process.env.XINYUEXIA_ACCEPTANCE_DISPLAY_Y),
};

assert.ok(acceptancePort, 'The existing acceptance port is required.');
assert.ok(Number.isFinite(displayPoint.x) && Number.isFinite(displayPoint.y), 'A verified Codex display point is required.');

const result = {
  route: '我的小说 -> 测试板块 -> 专业与标准模式首页切换',
  assertions: {},
  screenshots: {},
  runtimeErrors: [],
  window: null,
  status: 'FAIL',
};

let electronApp;
let page;
let stage = 'startup';

async function capture(name) {
  const filePath = path.join(evidenceDir, `mode-switch-library-${name}-20260726.png`);
  await page.screenshot({ path: filePath });
  result.screenshots[name] = filePath;
}

try {
  electronApp = await electron.launch({
    executablePath: electronExecutable,
    cwd: repoRoot,
    args: [path.join(repoRoot, 'electron', 'main.cjs'), `--user-data-dir=${userDataDir}`],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
      NODE_ENV: 'test',
      XINYUEXIA_SMOKE_HEADLESS: '1',
      XINYUEXIA_URL: `http://127.0.0.1:${acceptancePort}/#/novels`,
    },
    timeout: 30_000,
  });

  page = await electronApp.firstWindow({ timeout: 30_000 });
  page.on('pageerror', (error) => result.runtimeErrors.push(`[${stage}] pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') result.runtimeErrors.push(`[${stage}] console: ${message.text()}`);
  });
  await page.waitForLoadState('domcontentloaded');

  result.window = await electronApp.evaluate(({ BrowserWindow, screen }, point) => {
    const appWindow = BrowserWindow.getAllWindows()[0];
    const display = screen.getDisplayNearestPoint(point);
    const { workArea } = display;
    const width = Math.min(1600, workArea.width - 32);
    const height = Math.min(960, workArea.height - 32);
    appWindow.setBounds({
      x: workArea.x + Math.floor((workArea.width - width) / 2),
      y: workArea.y + Math.floor((workArea.height - height) / 2),
      width,
      height,
    });
    appWindow.showInactive();
    return {
      display: display.bounds,
      bounds: appWindow.getBounds(),
      visible: appWindow.isVisible(),
      focused: appWindow.isFocused(),
    };
  }, displayPoint);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  stage = 'open mode switch test';
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });
  await page.getByTitle('测试板块').click();
  const testCard = page.locator('button').filter({ hasText: '专业与标准模式首页切换' }).first();
  await testCard.scrollIntoViewIfNeeded();
  await testCard.click();
  const navigation = page.locator('aside').first();
  await navigation.waitFor();
  const navigationHandle = await navigation.elementHandle();
  const navigationText = await navigation.innerText();
  await page.getByRole('button', { name: /当前专业模式/ }).waitFor();
  assert.equal(await page.getByRole('button', { name: '进入创作工作台' }).count(), 0);
  await capture('professional');
  result.assertions.professionalModeUsesCurrentCards = true;

  stage = 'toggle standard mode';
  await page.getByRole('button', { name: /当前专业模式/ }).click();
  await page.getByRole('button', { name: /当前标准模式/ }).waitFor();
  assert.equal(await page.getByRole('button', { name: '进入创作工作台' }).count(), 2);
  assert.equal(await navigation.innerText(), navigationText);
  assert.equal(await navigationHandle.evaluate((element) => element.isConnected), true);
  const overflow = await page.getByTestId('novel-library-standard').evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  assert.ok(overflow.scrollWidth <= overflow.clientWidth);
  await capture('standard');
  result.assertions.navigationRemainsUnchanged = true;
  result.assertions.onlyStandardCardsExposeWorkbench = true;
  result.assertions.noHorizontalOverflow = true;

  stage = 'open guided workbench';
  await page.getByRole('button', { name: '进入创作工作台' }).first().click();
  await page.getByTestId('standard-mode-workbench').waitFor();
  await page.getByText('AI配置与操作', { exact: true }).waitFor();
  await capture('workbench');
  result.assertions.standardCardOpensGuidedWorkbench = true;

  stage = 'open shared editor';
  await page.getByRole('button', { name: '返回书籍' }).click();
  await page.getByTestId('novel-library-standard').waitFor();
  await page.getByRole('img', { name: '封面' }).first().click();
  await page.getByText('第18章 天门试炼', { exact: true }).waitFor();
  await capture('shared-editor');
  result.assertions.bookClickOpensSharedBodyEditor = true;

  await page.waitForTimeout(250);
  assert.deepEqual(result.runtimeErrors, []);
  result.status = 'PASS';
} catch (error) {
  result.error = error instanceof Error ? error.stack : String(error);
  throw error;
} finally {
  if (electronApp) await electronApp.close().catch(() => undefined);
  await rm(userDataDir, { recursive: true, force: true });
  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
}

console.log(JSON.stringify(result, null, 2));
