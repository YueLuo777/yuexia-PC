import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-professional-baseline-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'acceptance');
const resultPath = path.join(evidenceDir, 'professional-workbench-baseline-acceptance-20260726.json');
const acceptancePort = process.env.XINYUEXIA_ACCEPTANCE_PORT;
const displayPoint = {
  x: Number(process.env.XINYUEXIA_ACCEPTANCE_DISPLAY_X),
  y: Number(process.env.XINYUEXIA_ACCEPTANCE_DISPLAY_Y),
};

assert.ok(acceptancePort, 'The existing acceptance port is required.');
assert.ok(Number.isFinite(displayPoint.x) && Number.isFinite(displayPoint.y), 'A verified Codex display point is required.');

const flows = [
  ['脑洞', 'brainstorm'],
  ['设定', 'outline'],
  ['章纲', 'chapter-outline'],
  ['正文', 'writing'],
  ['剧情审核', 'audit'],
  ['更新状态', 'status'],
  ['生成梗概', 'summary'],
  ['文笔润色', 'polish'],
  ['综合点评', 'comment'],
];

const result = {
  route: '我的小说 -> 测试板块 -> 专业模式九页原样基线',
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
  const filePath = path.join(evidenceDir, `professional-workbench-baseline-${name}-20260726.png`);
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

  stage = 'open professional baseline test';
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });
  await page.getByTitle('测试板块').click();
  const testCard = page.locator('button').filter({ hasText: '专业模式九页原样基线' }).first();
  await testCard.scrollIntoViewIfNeeded();
  await testCard.click();
  const baseline = page.getByTestId('professional-workbench-baseline');
  await baseline.waitFor();

  const header = baseline.locator('header.xy-wa-toolbar');
  assert.equal(await page.getByRole('complementary', { name: '标准模式创作步骤' }).count(), 0);
  assert.equal(await page.getByText('默认模型、提示词和关联资料已自动准备', { exact: true }).count(), 0);

  for (const [label, screenshotName] of flows) {
    stage = `open ${label}`;
    const button = header.getByRole('button', { name: new RegExp(`^${label}`) });
    await button.click();
    await page.waitForTimeout(label === '脑洞' || label === '设定' || label === '章纲' ? 900 : 350);
    assert.ok((await button.getAttribute('class'))?.includes('xy-active'));
    await capture(screenshotName);
  }

  const layout = await baseline.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  assert.ok(layout.scrollWidth <= layout.clientWidth);
  assert.ok(layout.scrollHeight <= layout.clientHeight);
  result.assertions.allNineFormalFlowsReachable = true;
  result.assertions.formalHeaderAndActiveStatesPreserved = true;
  result.assertions.simplifiedControlsRemoved = true;
  result.assertions.noPageOverflow = true;

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
