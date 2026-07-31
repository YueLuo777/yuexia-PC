import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-template-sidebar-save-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-template-right-sidebar-save');
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

async function capture(name) {
  const target = path.join(evidenceDir, `${name}.png`);
  await page.screenshot({ path: target });
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

  stage = 'create novel';
  await page.getByRole('button', { name: '新建小说' }).first().click();
  const dialog = page.getByRole('dialog', { name: '新建小说' });
  await dialog.getByRole('textbox').first().fill('右侧保存模板验收作品');
  await dialog.getByRole('button', { name: '确认' }).click();
  await page.getByTestId('standard-mode-novel-card').getByRole('button', { name: '进入工作台' }).click();

  stage = 'open setting template';
  await page.locator('[data-standard-work-details-page="true"]').waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '开始设定' }).last().click();
  const initializer = page.locator('[data-standard-setting-initializer="true"]');
  await initializer.waitFor({ timeout: 30_000 });

  const workbench = page.getByTestId('template-node-workbench');
  const operations = workbench.getByRole('region', { name: '设定操作' });
  const savePanel = workbench.getByRole('region', { name: '保存模板' });
  const footer = initializer.locator(':scope > footer');
  await operations.getByText('当前选中：作品设定').waitFor();
  await savePanel.getByRole('textbox', { name: '保存模板名称' }).waitFor();

  const geometry = await page.evaluate(() => {
    const workbenchElement = document.querySelector('[data-testid="template-node-workbench"]');
    const operationsElement = workbenchElement?.querySelector('[aria-label="设定操作"]');
    const saveElement = workbenchElement?.querySelector('[aria-label="保存模板"]');
    const initializerElement = document.querySelector('[data-standard-setting-initializer="true"]');
    const footerElement = initializerElement && Array.from(initializerElement.children)
      .find((child) => child.tagName === 'FOOTER');
    const saveButtonElement = saveElement?.querySelector('button');
    const toRect = (element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
    };
    return {
      workbench: toRect(workbenchElement),
      operations: toRect(operationsElement),
      save: toRect(saveElement),
      saveButton: toRect(saveButtonElement),
      footer: toRect(footerElement),
      layout: {
        clientWidth: initializerElement.clientWidth,
        scrollWidth: initializerElement.scrollWidth,
        clientHeight: initializerElement.clientHeight,
        scrollHeight: initializerElement.scrollHeight,
      },
    };
  });
  assert.ok(geometry.operations.bottom <= geometry.save.top + 1, '上下区域不应重叠');
  assert.ok(Math.abs(geometry.operations.left - geometry.save.left) <= 1, '上下区域左边界应对齐');
  assert.ok(Math.abs(geometry.operations.right - geometry.save.right) <= 1, '上下区域右边界应对齐');
  assert.ok(geometry.save.bottom <= geometry.workbench.bottom + 1, '保存区不应溢出右侧栏');
  assert.ok(geometry.saveButton.bottom <= geometry.save.bottom + 1, '保存按钮不应溢出保存区');
  assert.ok(geometry.saveButton.bottom <= geometry.footer.top + 1, '保存按钮不应遮挡底栏');
  assert.ok(geometry.layout.scrollWidth <= geometry.layout.clientWidth, '页面不应水平溢出');
  assert.ok(geometry.layout.scrollHeight <= geometry.layout.clientHeight, '页面不应垂直溢出');
  assert.equal(await footer.getByRole('textbox', { name: '保存模板名称' }).count(), 0);
  assert.equal(await footer.getByRole('button', { name: '保存到我的模板' }).count(), 0);
  result.geometry = geometry;
  result.assertions.rightSidebarSplitIntoOperationAndSaveRegions = true;
  result.assertions.regionsAlignedWithoutOverlap = true;
  result.assertions.footerHasNoDuplicateSaveControls = true;
  result.assertions.noUnexpectedPageOverflow = true;
  await capture('01-right-sidebar-split');
  const workbenchScreenshot = path.join(evidenceDir, '01a-right-sidebar-region.png');
  await workbench.screenshot({ path: workbenchScreenshot });
  result.screenshots['01a-right-sidebar-region'] = workbenchScreenshot;
  const footerScreenshot = path.join(evidenceDir, '01b-page-footer.png');
  await footer.screenshot({ path: footerScreenshot });
  result.screenshots['01b-page-footer'] = footerScreenshot;

  stage = 'save template';
  const saveNameInput = savePanel.getByRole('textbox', { name: '保存模板名称' });
  await saveNameInput.fill('我的右侧栏模板');
  await savePanel.getByRole('button', { name: '保存到我的模板' }).click();
  await page.getByRole('button', { name: '选择我的模板：我的右侧栏模板' }).waitFor();
  assert.equal(await saveNameInput.inputValue(), '我的右侧栏模板');
  result.assertions.savedTemplateAppearsImmediately = true;
  await capture('02-template-saved');

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
