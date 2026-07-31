import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-template-single-task-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'template-node-single-task-formal');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '5197';

await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '作品概览 -> 新建小说 -> 进入工作台 -> 开始设定 -> 模板画布',
  window: null,
  assertions: {},
  screenshots: {},
  runtimeErrors: [],
  status: 'FAIL',
};

let app;
let page;
let stage = 'startup';

async function capture(name, locator = page) {
  const target = path.join(evidenceDir, `${name}.png`);
  await locator.screenshot({ path: target });
  result.screenshots[name] = target;
}

try {
  app = await electron.launch({
    executablePath: electronExecutable,
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

  result.window = await app.evaluate(({ BrowserWindow, screen }) => {
    const target = BrowserWindow.getAllWindows()[0];
    const primary = screen.getPrimaryDisplay();
    const secondary = screen.getAllDisplays().find((display) => display.id !== primary.id);
    if (!secondary) return { secondaryAvailable: false };
    const width = Math.min(1900, secondary.workArea.width - 32);
    const height = Math.min(1080, secondary.workArea.height - 32);
    target.setBounds({
      x: secondary.workArea.x + Math.floor((secondary.workArea.width - width) / 2),
      y: secondary.workArea.y + Math.floor((secondary.workArea.height - height) / 2),
      width,
      height,
    });
    target.webContents.setZoomFactor(1.1);
    target.showInactive();
    return {
      secondaryAvailable: true,
      bounds: target.getBounds(),
      display: secondary.bounds,
      visible: target.isVisible(),
      focused: target.isFocused(),
      zoomFactor: target.webContents.getZoomFactor(),
    };
  });
  assert.equal(result.window.secondaryAvailable, true);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  await page.evaluate(() => {
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([]));
    localStorage.setItem('xinyuexia_volumes_v1', JSON.stringify({}));
    localStorage.removeItem('xinyuexia_current_novel_id');
  });
  await page.reload();
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });

  stage = 'create novel and open setting template';
  await page.getByRole('button', { name: '新建小说' }).first().click();
  const newNovelDialog = page.getByRole('dialog', { name: '新建小说' });
  await newNovelDialog.getByRole('textbox').first().fill('节点操作台验收作品');
  await newNovelDialog.getByRole('button', { name: '确认' }).click();
  await page.getByTestId('standard-mode-novel-card').getByRole('button', { name: '进入工作台' }).click();
  await page.locator('[data-standard-work-details-page="true"]').waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '开始设定' }).last().click();
  const initializer = page.locator('[data-standard-setting-initializer="true"]');
  await initializer.waitFor({ timeout: 30_000 });

  const workbench = page.getByTestId('template-node-workbench');
  const operations = workbench.getByRole('region', { name: '设定操作' });
  const savePanel = workbench.getByRole('region', { name: '保存模板' });
  await operations.getByText('当前选中：作品设定').waitFor();
  assert.equal(await operations.getByRole('button', { name: '改名', exact: true }).getAttribute('aria-pressed'), 'true');
  assert.equal(await operations.getByRole('button', { name: '新增下级' }).count(), 1);
  assert.equal(await operations.getByRole('textbox', { name: '新节点名称' }).count(), 0);
  result.assertions.singleTaskDefaultIsRename = true;
  result.assertions.onlyCurrentTaskFormIsVisible = true;
  await capture('01-single-task-default');
  await capture('01a-single-task-workbench', workbench);

  stage = 'explicit rename confirmation';
  const positioningNode = page.getByTitle('作品定位');
  await positioningNode.getByRole('button', { name: '模板节点：基础设定' }).click();
  const renameInput = operations.getByRole('textbox', { name: '当前节点名称' });
  await renameInput.fill('验收基础设定');
  assert.equal(await page.getByRole('button', { name: '模板节点：验收基础设定' }).count(), 0);
  await operations.getByRole('button', { name: '确认改名' }).click();
  await page.getByRole('button', { name: '模板节点：验收基础设定' }).waitFor();
  result.assertions.renameRequiresExplicitConfirmation = true;

  stage = 'add sibling and reset task';
  await operations.getByRole('button', { name: '新增同级', exact: true }).click();
  assert.equal(await operations.getByRole('button', { name: '新增同级', exact: true }).getAttribute('aria-pressed'), 'true');
  await operations.getByRole('textbox', { name: '新节点名称' }).fill('验收补充分类');
  await operations.getByRole('button', { name: '确认新增同级' }).click();
  await page.getByRole('button', { name: '模板节点：验收补充分类' }).waitFor();
  assert.equal(await operations.getByRole('button', { name: '改名', exact: true }).getAttribute('aria-pressed'), 'true');
  result.assertions.addSiblingUsesSelectedTask = true;
  result.assertions.newSelectionResetsToRename = true;

  stage = 'final field and delete confirmation';
  await positioningNode.getByRole('button', { name: '模板节点：小说类型' }).click();
  await operations.getByText('当前选中：小说类型').waitFor();
  assert.equal(await operations.getByRole('button', { name: '新增下级' }).count(), 0);
  await operations.getByRole('button', { name: '删除', exact: true }).click();
  await operations.getByText('删除“小说类型”？').waitFor();
  await operations.getByRole('button', { name: '继续删除' }).click();
  const confirmDialog = page.getByRole('dialog', { name: '删除设定节点？' });
  await confirmDialog.waitFor();
  assert.equal(await confirmDialog.getByRole('button', { name: '确认删除' }).count(), 1);
  result.assertions.finalFieldHidesAddChild = true;
  result.assertions.deleteKeepsSecondConfirmation = true;
  await capture('02-final-field-delete-confirmation');
  await confirmDialog.getByRole('button', { name: '取消' }).click();

  stage = 'layout and save region audit';
  const geometry = await page.evaluate(() => {
    const workbenchElement = document.querySelector('[data-testid="template-node-workbench"]');
    const operationsElement = workbenchElement?.querySelector('[aria-label="设定操作"]');
    const saveElement = workbenchElement?.querySelector('[aria-label="保存模板"]');
    const toRect = (element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
    };
    return {
      workbench: toRect(workbenchElement),
      operations: toRect(operationsElement),
      save: toRect(saveElement),
      taskButtons: Array.from(operationsElement.querySelectorAll('button[aria-pressed]')).map((button) => ({
        text: button.textContent?.trim(),
        ...toRect(button),
      })),
      operationScroll: {
        clientWidth: operationsElement.clientWidth,
        scrollWidth: operationsElement.scrollWidth,
      },
      page: {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        clientHeight: document.documentElement.clientHeight,
        scrollHeight: document.documentElement.scrollHeight,
      },
    };
  });
  assert.ok(geometry.operations.bottom <= geometry.save.top + 1);
  assert.ok(Math.abs(geometry.operations.left - geometry.save.left) <= 1);
  assert.ok(Math.abs(geometry.operations.right - geometry.save.right) <= 1);
  assert.ok(geometry.save.bottom <= geometry.workbench.bottom + 1);
  assert.ok(geometry.taskButtons.every((button) => button.left >= geometry.operations.left && button.right <= geometry.operations.right + 1));
  assert.ok(geometry.operationScroll.scrollWidth <= geometry.operationScroll.clientWidth);
  assert.ok(geometry.page.scrollWidth <= geometry.page.clientWidth);
  assert.ok(geometry.page.scrollHeight <= geometry.page.clientHeight);
  assert.equal(await savePanel.getByRole('textbox', { name: '保存模板名称' }).count(), 1);
  assert.equal(await savePanel.getByRole('button', { name: '保存到我的模板' }).count(), 1);
  result.geometry = geometry;
  result.assertions.saveTemplateRegionUnchanged = true;
  result.assertions.noOverlapOrPageOverflow = true;

  assert.deepEqual(result.runtimeErrors, []);
  result.status = 'PASS';
} catch (error) {
  result.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  result.stage = stage;
  if (page) await capture('failure').catch(() => undefined);
  throw error;
} finally {
  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  if (app) await app.close().catch(() => undefined);
  await rm(userDataDir, { recursive: true, force: true });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
