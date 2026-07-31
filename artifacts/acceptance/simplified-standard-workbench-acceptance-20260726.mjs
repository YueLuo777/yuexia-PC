import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-simple-workbench-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'acceptance');
const resultPath = path.join(evidenceDir, 'simplified-standard-workbench-acceptance-20260726.json');
const acceptancePort = process.env.XINYUEXIA_ACCEPTANCE_PORT;
const displayPoint = {
  x: Number(process.env.XINYUEXIA_ACCEPTANCE_DISPLAY_X),
  y: Number(process.env.XINYUEXIA_ACCEPTANCE_DISPLAY_Y),
};

assert.ok(acceptancePort, 'The existing acceptance port is required.');
assert.ok(Number.isFinite(displayPoint.x) && Number.isFinite(displayPoint.y), 'A verified Codex display point is required.');

const result = {
  route: '我的小说 -> 测试板块 -> 标准模式精简创作工作台',
  assertions: {},
  screenshots: {},
  runtimeErrors: [],
  window: null,
  status: 'FAIL',
};

const stages = [
  ['脑洞', 'brainstorm-stage-preview', 'brainstorm'],
  ['大纲设定', 'setting-workspace-preview', 'settings'],
  ['章纲', 'chapter-outline-preview', 'chapter-outline'],
  ['正文', 'writing-workspace-preview', 'writing'],
  ['审核', 'audit-workspace-preview', 'audit'],
  ['状态更新', 'status-workspace-preview', 'status'],
  ['章节梗概', 'summary-workspace-preview', 'summary'],
  ['风格润色', 'polish-workspace-preview', 'polish'],
  ['综合点评', 'review-workspace-preview', 'review'],
];

let electronApp;
let page;
let stage = 'startup';

async function capture(name) {
  const filePath = path.join(evidenceDir, `simplified-standard-workbench-${name}-20260726.png`);
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

  stage = 'open simplified standard workbench test';
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });
  await page.getByTitle('测试板块').click();
  const testCard = page.locator('button').filter({ hasText: '标准模式精简创作工作台' }).first();
  await testCard.scrollIntoViewIfNeeded();
  await testCard.click();
  await page.getByTestId('simplified-standard-workbench').waitFor();

  const navigation = page.getByRole('complementary', { name: '标准模式创作步骤' });
  const stageArea = page.getByTestId('simplified-stage-area');
  assert.equal(await page.getByRole('complementary', { name: '当前功能操作台' }).count(), 0);
  assert.equal(await page.getByText('AI配置与操作', { exact: true }).count(), 0);
  assert.equal(await navigation.getByRole('button').count(), 9);

  const layout = await page.getByTestId('simplified-standard-workbench').evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  assert.ok(layout.scrollWidth <= layout.clientWidth);
  assert.ok(layout.scrollHeight <= layout.clientHeight);
  result.assertions.twoColumnLayoutWithoutAiPanel = true;
  result.assertions.noPageOverflow = true;

  for (const [label, testId, screenshotName] of stages) {
    stage = `open ${label}`;
    const button = navigation.getByRole('button', { name: new RegExp(label) });
    await button.click();
    await page.getByTestId(testId).waitFor();
    assert.equal(await button.getAttribute('aria-current'), 'step');
    await page.waitForTimeout(200);
    await capture(screenshotName);
  }
  result.assertions.allNineProfessionalWorkspacesReachable = true;

  stage = 'run review action';
  const actionBar = stageArea.locator('footer');
  await actionBar.getByRole('button', { name: '开始综合点评' }).click();
  await actionBar.getByRole('status').getByText('开始综合点评已完成，结果已填入当前页面').waitFor();
  assert.equal(await actionBar.getByRole('button', { name: '重新开始综合点评' }).count(), 1);
  result.assertions.singlePageActionReportsResult = true;

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
