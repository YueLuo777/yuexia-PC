import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const evidenceDir = path.join(repoRoot, 'artifacts', 'v6-brainstorm-border-restoration');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-v6-brainstorm-workspace-'));
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '4175';
await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '标准模式书籍 -> 脑洞库 -> 生成脑洞 -> 较小窗口',
  assertions: {},
  screenshots: {},
  runtimeErrors: [],
  status: 'FAIL',
};
let app;
let page;
let stage = 'startup';

async function capture(name) {
  const target = path.join(evidenceDir, `${name}.png`);
  await page.screenshot({ path: target });
  result.screenshots[name] = target;
}

async function readWorkspaceLayout() {
  return page.locator('[data-standard-brainstorm-preview="true"]').evaluate((workspace) => {
    const titleField = workspace.querySelector('[data-brainstorm-title-field="true"]');
    const previewField = workspace.querySelector('[data-brainstorm-preview-field="true"]');
    const previewTextarea = workspace.querySelector('textarea[aria-label="脑洞预览内容"]');
    const revisionField = workspace.querySelector('[data-brainstorm-revision-field="true"]');
    const revisionTextarea = workspace.querySelector('textarea[aria-label="脑洞修改要求"]');
    const revisionActions = workspace.querySelector('[data-brainstorm-revision-actions="true"]');
    const sendButton = workspace.querySelector('button[aria-label="发送修改要求"]');
    const stopButton = workspace.querySelector('button[aria-label="停止修改"]');
    const rect = (target) => {
      const bounds = target.getBoundingClientRect();
      return {
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        bottom: bounds.bottom,
        width: bounds.width,
        height: bounds.height,
      };
    };
    return {
      workspace: rect(workspace),
      titleField: rect(titleField),
      previewField: rect(previewField),
      previewTextarea: rect(previewTextarea),
      revisionField: rect(revisionField),
      revisionTextarea: rect(revisionTextarea),
      revisionActions: rect(revisionActions),
      sendButton: rect(sendButton),
      stopButton: rect(stopButton),
      previewBorder: getComputedStyle(previewTextarea).borderColor,
      revisionBorder: getComputedStyle(revisionTextarea).borderColor,
      previewResize: getComputedStyle(previewTextarea).resize,
      revisionResize: getComputedStyle(revisionTextarea).resize,
      scrollWidth: workspace.scrollWidth,
      clientWidth: workspace.clientWidth,
    };
  });
}

function assertSharedWorkspace(layout) {
  assert.ok(Math.abs(layout.previewTextarea.left - layout.revisionTextarea.left) <= 0.5);
  assert.ok(Math.abs(layout.previewTextarea.right - layout.revisionTextarea.right) <= 0.5);
  assert.equal(layout.previewBorder, 'rgb(191, 200, 210)');
  assert.equal(layout.revisionBorder, 'rgb(191, 200, 210)');
  assert.equal(layout.previewResize, 'none');
  assert.equal(layout.revisionResize, 'none');
  assert.ok(layout.revisionActions.left >= layout.revisionTextarea.left);
  assert.ok(layout.revisionActions.right <= layout.revisionTextarea.right);
  assert.ok(layout.revisionActions.top >= layout.revisionTextarea.top);
  assert.ok(layout.revisionActions.bottom <= layout.revisionTextarea.bottom);
  assert.ok(layout.sendButton.width <= 36 && layout.stopButton.width <= 36);
  assert.ok(layout.previewField.height / layout.revisionField.height >= 1.45);
  assert.ok(layout.previewField.height / layout.revisionField.height <= 2.5);
  assert.ok(layout.scrollWidth <= layout.clientWidth);
}

try {
  app = await electron.launch({
    executablePath: require('electron'),
    cwd: repoRoot,
    args: [path.join(repoRoot, 'electron', 'main.cjs'), `--user-data-dir=${userDataDir}`],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
      NODE_ENV: 'test',
      XINYUEXIA_SMOKE_HEADLESS: '1',
      XINYUEXIA_URL: `http://127.0.0.1:${port}/#/novels`,
    },
    timeout: 30_000,
  });
  page = await app.firstWindow({ timeout: 30_000 });
  page.on('pageerror', (error) => result.runtimeErrors.push(`[${stage}] pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
      result.runtimeErrors.push(`[${stage}] console: ${message.text()}`);
    }
  });
  await page.waitForLoadState('domcontentloaded');
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });

  result.window = await app.evaluate(({ BrowserWindow, screen }) => {
    const target = BrowserWindow.getAllWindows()[0];
    const primary = screen.getPrimaryDisplay();
    const secondary = screen.getAllDisplays().find((display) => display.id !== primary.id);
    if (!secondary) return { secondaryAvailable: false };
    const width = Math.min(1800, secondary.workArea.width - 32);
    const height = Math.min(1040, secondary.workArea.height - 32);
    target.setBounds({
      x: secondary.workArea.x + Math.floor((secondary.workArea.width - width) / 2),
      y: secondary.workArea.y + Math.floor((secondary.workArea.height - height) / 2),
      width,
      height,
    });
    target.showInactive();
    return {
      secondaryAvailable: true,
      visible: target.isVisible(),
      focused: target.isFocused(),
      bounds: target.getBounds(),
    };
  });
  assert.equal(result.window.secondaryAvailable, true);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  await page.evaluate(() => {
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([{
      id: 991,
      title: '脑洞工作区统一验收书籍',
      type: 'novel',
      category: '玄幻',
      channel: 'male',
      synopsis: '',
      wordCount: 0,
      createdAt: '2026/7/27',
      lastModifiedAt: '2026/7/27',
    }]));
    localStorage.setItem('xinyuexia_current_novel_id', '991');
    localStorage.setItem('xinyuexia_global_brainstorm_library_v1', JSON.stringify([{
      id: 'brainstorm-unified-1',
      tab: '脑洞',
      title: '万界吞噬',
      content: JSON.stringify({
        type: '脑洞库',
        body: '书名：《万界吞噬》\n卖点：吞噬诸天万界，掠夺血脉功法\n主角：林刻\n金手指：吞噬系统，吞敌即得对方力量\n世界观：九重天界，神魔争霸',
      }),
      updatedAt: '2026/7/27 10:30:00',
      brainstormSerialNumber: 1,
    }, {
      id: 'brainstorm-unified-2',
      tab: '脑洞',
      title: '星海拾荒者',
      content: JSON.stringify({
        type: '脑洞库',
        body: '主角驾驶废旧飞船，在星海遗迹中寻找失落科技。',
      }),
      updatedAt: '2026/7/27 11:00:00',
      brainstormSerialNumber: 2,
    }]));
  });
  await page.reload();
  await page.getByTestId('standard-mode-novel-card').waitFor();
  await page.getByRole('button', { name: '进入工作台' }).click();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor();

  stage = 'brainstorm library workspace';
  await page.getByRole('button', { name: '脑洞库', exact: true }).click();
  await page.getByRole('heading', { name: '脑洞操作' }).waitFor();
  const libraryLayout = await readWorkspaceLayout();
  assertSharedWorkspace(libraryLayout);
  assert.equal(await page.getByRole('button', { name: '复制脑洞', exact: true }).count(), 1);
  assert.equal(await page.getByRole('button', { name: '复制为新脑洞', exact: true }).count(), 1);
  assert.equal(await page.getByText('创建时间', { exact: true }).count(), 1);
  assert.equal(await page.getByRole('button', { name: '关联到当前作品', exact: true }).count(), 0);
  const metadata = page.getByText('最近修改', { exact: true }).locator('..');
  const createSettings = page.getByRole('button', { name: '根据此脑洞生成设定', exact: true });
  const duplicateBrainstorm = page.getByRole('button', { name: '复制为新脑洞', exact: true });
  const rightPanel = page.locator('aside').filter({ has: page.getByRole('heading', { name: '脑洞操作' }) });
  const metadataRect = await metadata.evaluate((element) => element.getBoundingClientRect().toJSON());
  const createRect = await createSettings.evaluate((element) => element.getBoundingClientRect().toJSON());
  const duplicateRect = await duplicateBrainstorm.evaluate((element) => element.getBoundingClientRect().toJSON());
  const rightPanelRect = await rightPanel.evaluate((element) => element.getBoundingClientRect().toJSON());
  assert.ok(createRect.top - metadataRect.bottom >= 180);
  assert.ok(rightPanelRect.bottom - duplicateRect.bottom <= 20);
  const selectedEntry = page.getByRole('button', { name: /万界吞噬/ });
  const unselectedEntry = page.getByRole('button', { name: /星海拾荒者/ });
  assert.equal(await selectedEntry.evaluate((element) => getComputedStyle(element).borderColor), 'rgb(8, 170, 206)');
  assert.equal(await unselectedEntry.evaluate((element) => getComputedStyle(element).borderColor), 'rgb(210, 216, 224)');
  await page.getByRole('heading', { name: '脑洞操作' }).click();
  assert.equal(await selectedEntry.evaluate((element) => getComputedStyle(element).borderColor), 'rgb(8, 170, 206)');
  result.measurements = { library: libraryLayout };
  result.assertions.libraryUsesUnifiedDarkerFields = true;
  result.assertions.revisionActionsStayInsideTextarea = true;
  result.assertions.libraryActionsAreRestoredToBottom = true;
  result.assertions.originalCopyLabelsAreRestored = true;
  result.assertions.librarySelectionRemainsVisibleAfterBlur = true;
  await capture('01-brainstorm-library-restored');

  stage = 'brainstorm generator workspace';
  await page.getByRole('button', { name: '生成脑洞', exact: true }).click();
  await page.getByRole('heading', { name: '生成条件' }).waitFor();
  const generatorLayout = await readWorkspaceLayout();
  assertSharedWorkspace(generatorLayout);
  assert.ok(Math.abs(generatorLayout.workspace.left - libraryLayout.workspace.left) <= 0.5);
  assert.ok(Math.abs(generatorLayout.workspace.right - libraryLayout.workspace.right) <= 0.5);
  assert.ok(Math.abs(generatorLayout.titleField.left - libraryLayout.titleField.left) <= 0.5);
  assert.ok(Math.abs(generatorLayout.previewTextarea.left - libraryLayout.previewTextarea.left) <= 0.5);
  assert.ok(Math.abs(generatorLayout.revisionTextarea.left - libraryLayout.revisionTextarea.left) <= 0.5);
  result.measurements.generator = generatorLayout;
  result.assertions.generatorUsesTheSameWorkspacePositions = true;
  const workTypeInput = page.getByLabel('作品类型自定义输入');
  assert.equal(await workTypeInput.evaluate((element) => getComputedStyle(element).borderColor), 'rgb(7, 153, 184)');
  await page.getByRole('heading', { name: '生成条件' }).click();
  assert.equal(await workTypeInput.evaluate((element) => getComputedStyle(element).borderColor), 'rgb(191, 200, 210)');
  assert.equal(await page.getByRole('button', { name: '玄幻', exact: true }).evaluate((element) => getComputedStyle(element).borderColor), 'rgb(191, 200, 210)');
  result.assertions.generatorInputsAndButtonsUseDarkerBorders = true;
  await capture('02-brainstorm-generator-darker-borders');

  stage = 'compact window';
  await app.evaluate(({ BrowserWindow, screen }) => {
    const target = BrowserWindow.getAllWindows()[0];
    const primary = screen.getPrimaryDisplay();
    const secondary = screen.getAllDisplays().find((display) => display.id !== primary.id);
    if (!secondary) return;
    const width = Math.min(1400, secondary.workArea.width - 32);
    const height = Math.min(900, secondary.workArea.height - 32);
    target.setBounds({
      x: secondary.workArea.x + Math.floor((secondary.workArea.width - width) / 2),
      y: secondary.workArea.y + Math.floor((secondary.workArea.height - height) / 2),
      width,
      height,
    });
    target.showInactive();
  });
  await page.waitForTimeout(300);
  const compactLayout = await readWorkspaceLayout();
  assertSharedWorkspace(compactLayout);
  result.measurements.compact = compactLayout;
  result.assertions.compactWindowHasNoBrokenLinesOrOverflow = true;
  await capture('03-brainstorm-generator-compact');

  assert.deepEqual(result.runtimeErrors, []);
  result.assertions.noRuntimeErrors = true;
  result.status = 'PASS';
} catch (error) {
  result.error = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack ?? ''}` : String(error);
} finally {
  if (app) await app.close().catch(() => undefined);
  await rm(userDataDir, { recursive: true, force: true }).catch(() => undefined);
  await writeFile(resultPath, JSON.stringify(result, null, 2), 'utf8');
}

console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exitCode = 1;
