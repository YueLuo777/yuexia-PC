import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-standard-flow-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'acceptance');
const resultPath = path.join(evidenceDir, 'standard-mode-flow-acceptance-20260725.json');
const acceptancePort = process.env.XINYUEXIA_ACCEPTANCE_PORT;
const displayPoint = {
  x: Number(process.env.XINYUEXIA_ACCEPTANCE_DISPLAY_X),
  y: Number(process.env.XINYUEXIA_ACCEPTANCE_DISPLAY_Y),
};

assert.ok(acceptancePort, 'An isolated acceptance port is required.');
assert.ok(Number.isFinite(displayPoint.x) && Number.isFinite(displayPoint.y), 'The verified Codex display point is required.');

const result = {
  route: 'homepage -> test collection -> standard mode flow prototype',
  userDataDir,
  screenshots: {},
  assertions: {},
  runtimeErrors: [],
  window: null,
};

let electronApp;
let page;
let stage = 'startup';

async function capture(name) {
  const filePath = path.join(evidenceDir, `standard-mode-flow-${name}-20260725.png`);
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

  stage = 'open prototype';
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });
  await page.getByTitle('测试板块').click();
  const testCard = page.locator('button').filter({ hasText: '标准模式创作工作台模拟' }).first();
  await testCard.scrollIntoViewIfNeeded();
  await testCard.click();
  await page.getByTestId('standard-mode-library').waitFor();
  await capture('library');
  result.assertions.formalTestEntryOpensPrototype = true;

  stage = 'blank creation';
  await page.getByRole('button', { name: '新建小说' }).click();
  const creationDialog = page.getByRole('dialog', { name: '新建小说' });
  await creationDialog.waitFor();
  await capture('creation-methods');
  await page.getByRole('button', { name: /新建空白小说/ }).click();
  await page.getByTestId('standard-mode-workbench').waitFor();
  await page.getByText('生成脑洞', { exact: true }).first().waitFor();

  const metrics = await page.evaluate(() => {
    const left = document.querySelector('[aria-label="创作功能区"]')?.getBoundingClientRect();
    const center = document.querySelector('[data-testid="standard-mode-center-content"]')?.getBoundingClientRect();
    const right = document.querySelector('[aria-label="当前功能操作台"]')?.getBoundingClientRect();
    const removedWorkflow = document.querySelector('[aria-label="标准模式流程图"]');
    const brainstormButtons = [...document.querySelectorAll('[data-testid="brainstorm-shortcuts"] button')].map(
      (button) => {
        const rect = button.getBoundingClientRect();
        return { text: button.textContent?.trim(), left: rect.left, top: rect.top, width: rect.width };
      },
    );
    const workflowShortcutCount = document.querySelectorAll('[data-testid="workflow-shortcuts"] button').length;
    const visibleText = document.body.innerText;
    return {
      removedWorkflowExists: Boolean(removedWorkflow),
      brainstormButtons,
      workflowShortcutCount,
      left: left ? { left: left.left, right: left.right, width: left.width } : null,
      center: center ? { left: center.left, right: center.right, width: center.width } : null,
      right: right ? { left: right.left, right: right.right, width: right.width } : null,
      bodyWidth: document.body.scrollWidth,
      viewportWidth: innerWidth,
      hasAllBrainstormChildren: ['生成脑洞', '进入脑洞库', '关联脑洞'].every((text) => visibleText.includes(text)),
    };
  });
  assert.equal(metrics.removedWorkflowExists, false);
  assert.equal(metrics.brainstormButtons.length, 3);
  assert.equal(metrics.brainstormButtons[0].top, metrics.brainstormButtons[1].top);
  assert.ok(metrics.brainstormButtons[2].top > metrics.brainstormButtons[0].top);
  assert.ok(metrics.brainstormButtons[2].width > metrics.brainstormButtons[0].width * 1.9);
  assert.equal(metrics.workflowShortcutCount, 8);
  assert.ok(metrics.left && metrics.center && metrics.right);
  assert.ok(metrics.left.right <= metrics.center.left + 1);
  assert.ok(metrics.center.right <= metrics.right.right + 1);
  assert.ok(metrics.bodyWidth <= metrics.viewportWidth);
  assert.equal(metrics.hasAllBrainstormChildren, true);
  result.assertions.blankBookStartsAtBrainstorm = true;
  result.assertions.redundantTopWorkflowIsRemovedAndThreeColumnsAreVisible = true;
  result.assertions.leftShortcutsUseTwoRowBrainstormAndCompactWorkflowGrid = true;
  await capture('blank-workbench');

  stage = 'workflow interactions';
  const leftPanel = page.getByRole('complementary', { name: '创作功能区' });
  await leftPanel.getByRole('button', { name: '进入脑洞库' }).click();
  await page.getByTestId('brainstorm-stage-preview').getByText('脑洞目录', { exact: true }).waitFor();
  await leftPanel.getByRole('button', { name: '关联脑洞' }).click();
  await page.getByTestId('brainstorm-stage-preview').getByText('关联脑洞', { exact: true }).waitFor();
  await leftPanel.getByRole('button', { name: '导入已有小说' }).click();
  await page.getByRole('status').filter({ hasText: '已打开：智能导入已有小说' }).waitFor();
  await leftPanel.getByRole('button', { name: '大纲设定' }).click();
  const settingWorkspace = page.getByTestId('setting-workspace-preview');
  await settingWorkspace.waitFor();
  const settingOverflow = await settingWorkspace.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  assert.ok(settingOverflow.scrollWidth <= settingOverflow.clientWidth);
  result.assertions.settingWorkspaceHasNoHorizontalOverflow = true;
  await capture('setting-workspace');
  await leftPanel.getByRole('button', { name: '正文' }).click();
  await page.getByTestId('writing-workspace-preview').waitFor();
  await capture('writing-workspace');
  for (const [label, testId] of [
    ['审核', 'audit-workspace-preview'],
    ['状态更新', 'status-workspace-preview'],
    ['章节梗概', 'summary-workspace-preview'],
    ['风格润色', 'polish-workspace-preview'],
    ['综合点评', 'review-workspace-preview'],
  ]) {
    await leftPanel.getByRole('button', { name: label, exact: true }).click();
    await page.getByTestId(testId).waitFor();
  }
  result.assertions.leftShortcutsOpenDistinctBusinessWorkspaces = true;
  await capture('workflow-interactions');

  stage = 'brainstorm creation';
  await page.getByRole('button', { name: '返回书籍' }).click();
  await page.getByRole('button', { name: '新建小说' }).click();
  await page.getByRole('button', { name: /根据脑洞扩展/ }).click();
  const brainstormDirectory = page.getByRole('complementary', { name: '脑洞目录' });
  await brainstormDirectory.getByRole('button', { name: /我在万界开仙坊/ }).click();
  await page.getByTestId('brainstorm-selection-preview').getByText('仙坊每天随机连接一个修真世界').waitFor();
  assert.equal(await brainstormDirectory.locator('button[aria-current="page"]').count(), 1);
  const pickerMetrics = await page.evaluate(() => {
    const directory = document.querySelector('[aria-label="脑洞目录"]')?.getBoundingClientRect();
    const preview = document.querySelector('[data-testid="brainstorm-selection-preview"]')?.getBoundingClientRect();
    return {
      directory: directory ? { left: directory.left, right: directory.right, top: directory.top } : null,
      preview: preview ? { left: preview.left, right: preview.right, top: preview.top } : null,
    };
  });
  assert.ok(pickerMetrics.directory && pickerMetrics.preview);
  assert.ok(pickerMetrics.directory.right <= pickerMetrics.preview.left + 1);
  assert.equal(pickerMetrics.directory.top, pickerMetrics.preview.top);
  await page.getByRole('button', { name: '选择这个脑洞' }).click();
  await capture('brainstorm-picker');
  await page.getByRole('button', { name: '关联并进入工作台' }).click();
  await page.getByText('当前已关联：我在万界开仙坊').waitFor();
  const consolePanel = page.getByRole('complementary', { name: '当前功能操作台' });
  await consolePanel.getByRole('button', { name: '选择设定模板' }).click();
  await page.getByRole('dialog', { name: '选择设定模板' }).waitFor();
  await page.getByRole('radio', { name: /精简开书模板/ }).click();
  await page.getByRole('button', { name: '使用这个模板' }).click();
  await page.getByText('当前模板：精简开书模板').waitFor();
  await page.getByText('大纲设定', { exact: true }).first().waitFor();
  result.assertions.brainstormLinkAndTemplateSelectionContinueInSameWorkbench = true;
  result.assertions.brainstormPickerUsesDirectoryPreviewAndExplicitSelection = true;
  await capture('linked-template-workbench');

  const finalState = await electronApp.evaluate(({ BrowserWindow }) => {
    const appWindow = BrowserWindow.getAllWindows()[0];
    return { focused: appWindow.isFocused(), visible: appWindow.isVisible(), bounds: appWindow.getBounds() };
  });
  result.finalWindow = finalState;
  assert.equal(finalState.focused, false);
  assert.deepEqual(result.runtimeErrors, []);
  result.status = 'PASS';
} catch (error) {
  result.status = 'FAIL';
  result.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  if (page) {
    result.failureUrl = page.url();
    result.failureBody = await page.locator('body').innerText().catch(() => '');
    await capture('failure').catch(() => {});
  }
  throw error;
} finally {
  await writeFile(resultPath, JSON.stringify(result, null, 2), 'utf8');
  if (electronApp) await electronApp.close().catch(() => {});
  await rm(userDataDir, { recursive: true, force: true });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
