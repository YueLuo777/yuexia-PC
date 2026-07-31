import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = 'E:/0yuexia/0,月下PC';
const evidenceDir = path.join(repoRoot, 'artifacts', 'v7-setting-acceptance');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-v7-setting-acceptance-'));
const require = createRequire(import.meta.url);
const runtimeErrors = [];
let electronApp;
let page;

await mkdir(evidenceDir, { recursive: true });

function getTemplateAndLibraryState() {
  const templateKey = Object.keys(localStorage).find((key) => key.startsWith('xinyuexia_standard_setting_template_'));
  if (!templateKey) return null;
  const novelId = templateKey.slice('xinyuexia_standard_setting_template_'.length);
  const settingsKey = `xinyuexia_workbench_settings_${novelId}`;
  return {
    novelId,
    settingsKey,
    template: JSON.parse(localStorage.getItem(templateKey) ?? 'null'),
    library: JSON.parse(localStorage.getItem(settingsKey) ?? '[]'),
  };
}

try {
  electronApp = await electron.launch({
    executablePath: require('electron'),
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

  page = await electronApp.firstWindow({ timeout: 30_000 });
  await page.waitForLoadState('domcontentloaded');
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });

  const geometry = await electronApp.evaluate(({ BrowserWindow, screen }) => {
    const appWindow = BrowserWindow.getAllWindows()[0];
    const targetDisplay = screen.getAllDisplays().find((display) => display.bounds.x === 2048);
    if (!targetDisplay) return null;
    const { workArea } = targetDisplay;
    appWindow.setBounds({
      x: workArea.x + 24,
      y: workArea.y + 20,
      width: workArea.width - 48,
      height: workArea.height - 40,
    });
    appWindow.show();
    return {
      bounds: appWindow.getBounds(),
      visible: appWindow.isVisible(),
      targetDisplay: targetDisplay.bounds,
      primaryDisplay: screen.getPrimaryDisplay().bounds,
    };
  });
  assert(geometry?.visible, 'Electron target window should be visible');
  assert.equal(geometry.bounds.x >= 2048, true, 'Electron target window should stay on the Codex display');

  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
  });

  await page.evaluate(() => localStorage.setItem('xinyuexia_application_mode_v1', 'standard'));
  await page.reload();
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });

  await page.getByRole('button', { name: '新建小说' }).click();
  await page.locator('input:visible').last().fill('V7设定验收作品');
  await page.getByRole('button', { name: '确认', exact: true }).last().click();
  const novelCard = page.getByText('V7设定验收作品', { exact: true }).last().locator('xpath=ancestor::article');
  await novelCard.waitFor({ timeout: 15_000 });
  await novelCard.click();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });

  const navigation = page.getByRole('navigation', { name: '标准模式创作导航' });
  await navigation.getByRole('button', { name: '作品设定', exact: true }).click();
  const initializer = page.locator('[data-standard-setting-initializer="true"]');
  if (!(await initializer.isVisible().catch(() => false))) {
    const existingActions = page.getByRole('group', { name: '作品设定操作' });
    await existingActions.waitFor({ timeout: 30_000 });
    await existingActions.getByRole('button', { name: '更换模板' }).click();
    const replacementDialog = page.getByRole('dialog', { name: '更换设定模板？' });
    await replacementDialog.waitFor();
    await replacementDialog.getByRole('button', { name: '继续更换模板' }).click();
  }
  await initializer.waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '选择内置模板：玄幻仙侠（轻量版）' }).click();
  await page.screenshot({ path: path.join(evidenceDir, '01-light-template-before-create.png') });

  await page.getByRole('button', { name: '确认模板并创建设定' }).click();
  const actions = page.getByRole('group', { name: '作品设定操作' });
  await actions.waitFor({ timeout: 30_000 });
  const initialState = await page.evaluate(getTemplateAndLibraryState);
  assert(initialState, 'standard setting template storage should exist after one-click creation');
  assert.equal(initialState.template.templateId, 'male-fantasy-xianxia-light');
  assert(initialState.library.length > 10, 'one-click template creation should materialize setting library entries');

  const positioning = page.getByText('作品定位', { exact: true }).first();
  await positioning.click();
  const novelTypeInput = page.getByLabel('小说类型').first();
  await novelTypeInput.waitFor({ timeout: 15_000 });
  await novelTypeInput.fill('验收保留的东方玄幻');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(evidenceDir, '02-one-click-created-settings.png') });

  const actionButtonsFit = await actions.locator('button').evaluateAll((buttons) => {
    const rects = buttons.map((button) => button.getBoundingClientRect());
    return rects.length === 3 && rects.every((rect) => rect.width > 0 && rect.height > 0) &&
      rects.every((rect, index) => index === 0 || rect.left >= rects[index - 1].right - 0.5);
  });
  assert(actionButtonsFit, 'setting action buttons should not overlap');

  await actions.getByRole('button', { name: '升级模板' }).click();
  const dialog = page.getByRole('dialog', { name: '升级设定模板' });
  await dialog.waitFor();
  await page.screenshot({ path: path.join(evidenceDir, '03-lossless-upgrade-dialog.png') });
  await dialog.getByRole('radio', { name: '升级到玄幻仙侠（完整版）' }).click();
  await dialog.getByRole('button', { name: '确认升级' }).click();
  await page.waitForFunction(() => {
    const key = Object.keys(localStorage).find((item) => item.startsWith('xinyuexia_standard_setting_template_'));
    return key && JSON.parse(localStorage.getItem(key) ?? 'null')?.templateId === 'male-fantasy-xianxia-full';
  });

  const upgradedState = await page.evaluate(getTemplateAndLibraryState);
  assert(upgradedState, 'upgraded template storage should exist');
  const serializedLibrary = JSON.stringify(upgradedState.library);
  assert(serializedLibrary.includes('验收保留的东方玄幻'), 'upgrade should preserve visibly entered setting content');
  assert(upgradedState.library.length >= initialState.library.length, 'upgrade should add entries without deleting existing library data');
  await page.getByRole('button', { name: '升级模板' }).waitFor({ state: 'visible' });
  assert.equal(await page.getByRole('button', { name: '升级模板' }).isDisabled(), true);
  await page.screenshot({ path: path.join(evidenceDir, '04-full-template-after-upgrade.png') });

  await page.reload();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });
  const persistedState = await page.evaluate(getTemplateAndLibraryState);
  assert(persistedState, 'template storage should survive reload');
  assert.equal(persistedState.template.templateId, 'male-fantasy-xianxia-full');
  assert(JSON.stringify(persistedState.library).includes('验收保留的东方玄幻'));
  assert.deepEqual(runtimeErrors, [], `renderer runtime errors:\n${runtimeErrors.join('\n')}`);

  process.stdout.write(`${JSON.stringify({ geometry, initialEntryCount: initialState.library.length, upgradedEntryCount: upgradedState.library.length, evidenceDir }, null, 2)}\n`);
} catch (error) {
  if (page) {
    await page.screenshot({ path: path.join(evidenceDir, 'failure.png') }).catch(() => {});
    process.stderr.write(`URL: ${page.url()}\n`);
    process.stderr.write(`${(await page.locator('body').innerText().catch(() => '')).slice(0, 4000)}\n`);
  }
  throw error;
} finally {
  if (electronApp) await electronApp.close();
  await rm(userDataDir, { recursive: true, force: true });
}
