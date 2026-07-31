import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-setting-template-formal-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-setting-template-formal');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '5173';

await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '首页 -> 进入标准模式 -> 新建玄幻小说 -> 进入工作台 -> 新建设定 -> 设定列表',
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
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });

  result.window = await app.evaluate(({ BrowserWindow, screen }) => {
    const targetWindow = BrowserWindow.getAllWindows()[0];
    const primary = screen.getPrimaryDisplay();
    const secondary = screen.getAllDisplays().find((display) => display.id !== primary.id);
    if (!secondary) return { secondaryAvailable: false };
    const { workArea } = secondary;
    const width = Math.min(1800, workArea.width - 32);
    const height = Math.min(1040, workArea.height - 32);
    targetWindow.setBounds({
      x: workArea.x + Math.floor((workArea.width - width) / 2),
      y: workArea.y + Math.floor((workArea.height - height) / 2),
      width,
      height,
    });
    targetWindow.showInactive();
    return {
      secondaryAvailable: true,
      primary: primary.bounds,
      display: secondary.bounds,
      bounds: targetWindow.getBounds(),
      visible: targetWindow.isVisible(),
      focused: targetWindow.isFocused(),
    };
  });
  assert.equal(result.window.secondaryAvailable, true);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  stage = 'create standard-mode novel';
  await page.getByRole('button', { name: '进入标准模式' }).click();
  await page.getByRole('button', { name: '进入专业模式' }).waitFor();
  await page.locator('button').filter({ hasText: '新建小说' }).first().click();
  const dialog = page.getByRole('dialog', { name: '新建小说' });
  await dialog.waitFor();
  await dialog.locator('input').first().fill('验收玄幻小说');
  await dialog.locator('select').selectOption({ label: '玄幻' });
  await dialog.getByRole('button', { name: '确认' }).click();
  const novelCard = page.getByTestId('standard-mode-novel-card').filter({ hasText: '验收玄幻小说' });
  await novelCard.getByRole('heading', { name: '验收玄幻小说' }).waitFor();
  await novelCard.getByRole('button', { name: '进入工作台' }).click();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor();
  result.assertions.bookOpensIndependentStandardWorkbench = true;

  stage = 'initialize template';
  await page.getByRole('button', { name: '新建设定' }).click();
  await page.locator('[data-standard-setting-initializer="true"]').waitFor();
  assert.equal(await page.getByRole('button', { name: '选择内置模板：玄幻仙侠' }).getAttribute('aria-pressed'), 'true');
  const domainNavigation = page.getByRole('navigation', { name: '设定一级分类' });
  assert.equal(await domainNavigation.getByRole('button', { name: '作品设定' }).getAttribute('aria-pressed'), 'true');
  await page.getByText('当前选中：作品设定').waitFor();
  await page.getByRole('button', { name: '模板节点：作品定位' }).waitFor();
  await page.getByText('19 个设定').waitFor();
  await page.getByText('55 个内部分类').waitFor();
  result.assertions.xianxiaOpensWorkSettingsAutomatically = true;
  result.assertions.xianxiaUsesReducedNineteenEntryTemplate = true;
  await capture('01-template-default-work-settings');

  stage = 'edit internal category';
  const positioningCard = page.getByRole('button', { name: '模板节点：作品定位' }).locator('..');
  await positioningCard.getByRole('button', { name: '模板节点：基础设定' }).click();
  await page.getByRole('textbox', { name: '当前节点名称' }).fill('作品基础信息');
  await page.getByRole('textbox', { name: '新节点名称' }).fill('补充要求');
  await page.getByRole('button', { name: '新建同级分类' }).click();
  await positioningCard.getByRole('button', { name: '模板节点：作品基础信息' }).waitFor();
  await positioningCard.getByRole('button', { name: '模板节点：补充要求' }).waitFor();
  await page.getByRole('textbox', { name: '新节点名称' }).fill('待删除分类');
  await page.getByRole('button', { name: '新建同级分类' }).click();
  await positioningCard.getByRole('button', { name: '模板节点：待删除分类' }).click();
  await page.getByRole('button', { name: '删除设定' }).click();
  await page.getByRole('button', { name: '确认删除' }).click();
  assert.equal(await positioningCard.getByRole('button', { name: '模板节点：待删除分类' }).count(), 0);
  result.assertions.internalCategoryCanBeRenamedAddedAndDeleted = true;
  await capture('02-template-internal-category-edited');

  stage = 'inspect protagonist categories';
  await domainNavigation.getByRole('button', { name: '人物设定' }).click();
  const heroCard = page.getByRole('button', { name: '模板节点：男主角' }).locator('..');
  for (const title of ['基础档案', '动机与行为规则', '金手指', '实力与手段', '当前状态', '关系']) {
    await heroCard.getByRole('button', { name: `模板节点：${title}`, exact: true }).waitFor();
  }
  const goldFingerSection = heroCard.getByRole('button', { name: '模板节点：金手指', exact: true }).locator('..');
  await goldFingerSection.getByRole('button', { name: '模板节点：金手指限制与代价', exact: true }).waitFor();
  result.assertions.protagonistShowsSixProfessionalStyleCategories = true;
  await capture('03-template-protagonist-categories');
  const canvas = page.getByTestId('mind-map-canvas');
  const canvasBox = await canvas.boundingBox();
  assert.ok(canvasBox);
  for (let index = 0; index < 4; index += 1) {
    await canvas.dispatchEvent('wheel', {
      clientX: canvasBox.x,
      clientY: canvasBox.y,
      deltaY: 120,
    });
  }
  await capture('03b-template-protagonist-all-categories');

  stage = 'confirm and edit formal setting list';
  await page.getByRole('button', { name: '确认模板并创建设定' }).click();
  await page.locator('[data-standard-mode-setting-page="true"]').waitFor();
  await page.getByLabel('设定名').waitFor();
  assert.equal(await page.getByLabel('设定名').inputValue(), '作品定位');
  await page.getByText('作品基础信息', { exact: true }).waitFor();
  await page.getByText('补充要求', { exact: true }).waitFor();
  assert.equal(await page.getByLabel('小说类型').inputValue(), '');
  await page.getByLabel('小说类型').fill('东方玄幻');
  result.assertions.formalListUsesEditedPerBookTemplate = true;
  await capture('04-formal-setting-list');

  stage = 'reload and verify persistence';
  await page.reload();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '设定列表' }).click();
  await page.getByLabel('小说类型').waitFor();
  assert.equal(await page.getByLabel('小说类型').inputValue(), '东方玄幻');
  await page.getByText('作品基础信息', { exact: true }).waitFor();
  result.assertions.fieldAndInternalCategoryPersistAfterReload = true;
  await capture('05-formal-setting-list-after-reload');

  stage = 'verify destructive reset guard';
  await page.getByRole('button', { name: '新建设定' }).click();
  await page.getByRole('button', { name: '确认模板并创建设定' }).click();
  await page.getByText('重新创建设定？', { exact: true }).waitFor();
  await page.getByRole('button', { name: '保留现有设定' }).click();
  await page.getByRole('button', { name: '设定列表' }).click();
  await page.getByLabel('小说类型').waitFor();
  assert.equal(await page.getByLabel('小说类型').inputValue(), '东方玄幻');
  result.assertions.cancelResetKeepsExistingSettingContent = true;

  const visual = await page.evaluate(() => ({
    viewportWidth: innerWidth,
    bodyWidth: document.body.scrollWidth,
    duplicateVisibleLabels: [...document.querySelectorAll('[data-setting-field-group]')]
      .map((node) => node.getAttribute('data-setting-field-group')),
    settingDomains: document.querySelectorAll('[data-standard-setting-domain]').length,
  }));
  assert.ok(visual.bodyWidth <= visual.viewportWidth);
  assert.ok(visual.settingDomains === 7);
  result.assertions.noUnexpectedPageOverflow = true;
  result.visual = visual;

  const finalWindow = await app.evaluate(({ BrowserWindow }) => {
    const targetWindow = BrowserWindow.getAllWindows()[0];
    return { visible: targetWindow.isVisible(), focused: targetWindow.isFocused(), bounds: targetWindow.getBounds() };
  });
  assert.equal(finalWindow.visible, true);
  assert.equal(finalWindow.focused, false);
  result.finalWindow = finalWindow;
  assert.deepEqual(result.runtimeErrors, []);
  result.status = 'PASS';
} catch (error) {
  result.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  if (page) {
    result.failureUrl = page.url();
    result.failureBody = await page.locator('body').innerText().catch(() => '');
    await capture('failure').catch(() => {});
  }
  throw error;
} finally {
  await writeFile(resultPath, JSON.stringify(result, null, 2), 'utf8');
  if (app) await app.close().catch(() => {});
  await rm(userDataDir, { recursive: true, force: true });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
