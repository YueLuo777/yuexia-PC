import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { _electron as electron } from 'playwright';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require(path.join(repoRoot, 'node_modules', 'electron'));
const userDataDir = await mkdtemp(path.join(tmpdir(), 'yuexia-standard-rule-fields-'));
const requestedDisplayX = Number(process.env.YUEXIA_ACCEPTANCE_DISPLAY_X);
const runtimeErrors = [];
let app;
let page;

await mkdir(currentDir, { recursive: true });

async function openWorldRules() {
  const worldRuleButtons = page.getByRole('button', { name: '世界规则', exact: true });
  await worldRuleButtons.first().waitFor({ timeout: 30_000 });
  await worldRuleButtons.first().click();
  await page.getByRole('textbox', { name: '生死规则', exact: true }).waitFor({ timeout: 30_000 });
}

try {
  assert.ok(Number.isFinite(requestedDisplayX), 'Codex display x is required');
  app = await electron.launch({
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

  page = await app.firstWindow({ timeout: 30_000 });
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
  });
  await page.waitForLoadState('domcontentloaded');

  const geometry = await app.evaluate(({ BrowserWindow, screen }, displayX) => {
    const appWindow = BrowserWindow.getAllWindows()[0];
    const display = screen.getAllDisplays().find((candidate) => candidate.workArea.x === displayX);
    if (!appWindow || !display) return null;
    const width = Math.min(1980, display.workArea.width - 48);
    const height = Math.min(1080, display.workArea.height - 40);
    appWindow.setBounds({
      x: display.workArea.x + Math.floor((display.workArea.width - width) / 2),
      y: display.workArea.y + Math.floor((display.workArea.height - height) / 2),
      width,
      height,
    });
    appWindow.showInactive();
    return {
      bounds: appWindow.getBounds(),
      workArea: display.workArea,
      primary: screen.getPrimaryDisplay().bounds,
      displays: screen.getAllDisplays().map((item) => item.bounds),
      visible: appWindow.isVisible(),
    };
  }, requestedDisplayX);
  assert.ok(geometry?.visible, 'Electron window should be visible');
  assert.ok(geometry.bounds.x >= geometry.workArea.x, 'window should stay on Codex display');
  assert.ok(geometry.bounds.x + geometry.bounds.width <= geometry.workArea.x + geometry.workArea.width);

  await page.evaluate(() => {
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    location.hash = '#/novels';
    location.reload();
  });
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '新建小说' }).click();
  await page.locator('input:visible').last().fill('标准版规则独立框验收');
  await page.getByRole('button', { name: /^确[定认]$/ }).last().click();
  const novelCard = page.getByText('标准版规则独立框验收', { exact: true }).last().locator('xpath=ancestor::article');
  await novelCard.getByRole('button', { name: '进入标准工作台' }).click();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });

  const navigation = page.getByRole('navigation', { name: '标准模式创作导航' });
  await navigation.getByRole('button', { name: '作品设定', exact: true }).click();
  const initializer = page.locator('[data-standard-setting-initializer="true"]');
  if (!(await initializer.isVisible().catch(() => false))) {
    const settingActions = page.getByRole('group', { name: '作品设定操作' });
    await settingActions.waitFor({ timeout: 30_000 });
    await settingActions.getByRole('button', { name: '更换模板' }).click();
  }
  await initializer.waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '选择内置模板：玄幻仙侠（标准版）' }).click();
  await page.getByRole('button', { name: '确认模板并创建设定' }).click();
  await page.getByRole('group', { name: '作品设定操作' }).waitFor({ timeout: 30_000 });

  await openWorldRules();
  const ruleLabels = ['生死规则', '寿命规则', '灵魂规则', '天劫规则', '气运规则'];
  for (const label of ruleLabels) {
    assert.equal(await page.getByRole('textbox', { name: label, exact: true }).count(), 1, `${label} should have one field`);
  }
  const fieldGeometry = await page.evaluate((labels) => {
    const rects = labels.map((label) => {
      const element = document.querySelector(`[aria-label="${label}"]`);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { label, left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    });
    return {
      rects,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      overflowY: document.documentElement.scrollHeight > document.documentElement.clientHeight,
    };
  }, ruleLabels);
  assert.ok(fieldGeometry.rects.every(Boolean), 'all five rule fields should be visible in the document');
  assert.equal(fieldGeometry.overflowX, false, 'page should not overflow horizontally');
  assert.equal(fieldGeometry.overflowY, false, 'page should not overflow vertically');
  await page.getByRole('textbox', { name: '生死规则', exact: true }).fill('死亡后不可复生，夺舍必须付出神魂代价。');
  await page.screenshot({ path: path.join(currentDir, '01-standard-world-rules-five-fields.png') });

  const migration = await page.evaluate(() => {
    const templateKey = Object.keys(localStorage).find((key) => key.startsWith('xinyuexia_standard_setting_template_'));
    if (!templateKey) throw new Error('standard template storage is missing');
    const novelId = templateKey.slice('xinyuexia_standard_setting_template_'.length);
    const settingsKey = `xinyuexia_workbench_settings_${novelId}`;
    const entries = JSON.parse(localStorage.getItem(settingsKey) ?? '[]');
    const worldRules = entries.find((entry) => entry.title === '世界规则');
    if (!worldRules) throw new Error('world rules entry is missing');
    const content = JSON.parse(worldRules.content);
    delete content.templateFieldLayout;
    worldRules.content = JSON.stringify(content);
    localStorage.setItem(settingsKey, JSON.stringify(entries));
    return { settingsKey, worldRuleId: worldRules.id };
  });
  assert.ok(migration.worldRuleId);
  await page.reload();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });
  await navigation.getByRole('button', { name: '作品设定', exact: true }).click();
  await openWorldRules();
  assert.equal(
    await page.getByRole('textbox', { name: '生死规则', exact: true }).inputValue(),
    '死亡后不可复生，夺舍必须付出神魂代价。',
  );
  const migratedLayout = await page.evaluate(({ settingsKey, worldRuleId }) => {
    const entries = JSON.parse(localStorage.getItem(settingsKey) ?? '[]');
    const worldRules = entries.find((entry) => entry.id === worldRuleId);
    return JSON.parse(worldRules.content).templateFieldLayout;
  }, migration);
  assert.equal(migratedLayout.sections.flatMap((section) => section.fields).length, 5);
  await page.screenshot({ path: path.join(currentDir, '02-existing-standard-auto-migrated.png') });

  assert.deepEqual(runtimeErrors, [], `renderer runtime errors:\n${runtimeErrors.join('\n')}`);
  process.stdout.write(`${JSON.stringify({ geometry, fieldGeometry, migration, evidenceDir: currentDir }, null, 2)}\n`);
} catch (error) {
  if (page) await page.screenshot({ path: path.join(currentDir, 'failure.png') }).catch(() => {});
  throw error;
} finally {
  if (app) await app.close();
  await rm(userDataDir, { recursive: true, force: true });
}
