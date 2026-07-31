import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-template-lossless-upgrade');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-template-upgrade-'));
const targetDisplayX = Number(process.env.YUEXIA_ACCEPTANCE_DISPLAY_X);
await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '标准模式书籍 -> 作品设定 -> 创建轻量版 -> 正式设定列表 -> 升级模板 -> 直接升级完整版',
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

function countFields(structure) {
  return structure.reduce((domainTotal, domain) => domainTotal + domain.groups.reduce(
    (groupTotal, group) => groupTotal + group.entries.reduce(
      (entryTotal, entry) => entryTotal + entry.sections.reduce(
        (sectionTotal, section) => sectionTotal + section.fields.length,
        0,
      ),
      0,
    ),
    0,
  ), 0);
}

try {
  assert.ok(Number.isFinite(targetDisplayX), 'verified Codex display x is required');
  app = await electron.launch({
    executablePath: require('electron'),
    cwd: repoRoot,
    args: [path.join(repoRoot, 'electron', 'main.cjs'), `--user-data-dir=${userDataDir}`],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
      NODE_ENV: 'test',
      XINYUEXIA_SMOKE_HEADLESS: '1',
      XINYUEXIA_LOAD_DIST: '1',
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

  result.window = await app.evaluate(({ BrowserWindow, screen }, requestedX) => {
    const target = BrowserWindow.getAllWindows()[0];
    const primary = screen.getPrimaryDisplay();
    const codexDisplay = screen.getAllDisplays().find((display) => display.workArea.x === requestedX);
    if (!target || !codexDisplay) return null;
    const width = Math.min(1900, codexDisplay.workArea.width - 32);
    const height = Math.min(1080, codexDisplay.workArea.height - 32);
    target.setBounds({
      x: codexDisplay.workArea.x + Math.floor((codexDisplay.workArea.width - width) / 2),
      y: codexDisplay.workArea.y + Math.floor((codexDisplay.workArea.height - height) / 2),
      width,
      height,
    });
    target.showInactive();
    return {
      displayCount: screen.getAllDisplays().length,
      codexDisplayId: codexDisplay.id,
      primaryDisplayId: primary.id,
      visible: target.isVisible(),
      focused: target.isFocused(),
      bounds: target.getBounds(),
      display: codexDisplay.bounds,
    };
  }, targetDisplayX);
  assert.ok(result.window);
  assert.notEqual(result.window.codexDisplayId, result.window.primaryDisplayId);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  await page.evaluate(() => {
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([{
      id: 996,
      title: '模板升级验收书籍',
      type: 'novel',
      category: '玄幻',
      channel: 'male',
      synopsis: '',
      wordCount: 0,
      createdAt: '2026/7/30',
      lastModifiedAt: '2026/7/30',
    }]));
    localStorage.setItem('xinyuexia_current_novel_id', '996');
    localStorage.setItem('xinyuexia_volumes_v1', JSON.stringify({ 996: [] }));
  });
  await page.evaluate(() => {
    window.location.hash = '/workbench';
    window.location.reload();
  });
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '作品设定', exact: true }).click();
  const initializer = page.locator('[data-standard-setting-initializer="true"]');
  await initializer.waitFor();
  await page.getByRole('button', { name: '选择内置模板：玄幻仙侠（轻量版）' }).click();
  await page.getByRole('button', { name: '确认模板并创建设定' }).click();
  const settingWorkspace = page.locator('[data-workbench-experience="standard"][data-workbench-flow="outline"]');
  await settingWorkspace.waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '升级模板', exact: true }).waitFor();

  stage = 'seed existing manual, AI, and dynamic role content';
  const seeded = await page.evaluate(() => {
    const templateKey = 'xinyuexia_standard_setting_template_996';
    const settingsKey = 'xinyuexia_workbench_settings_996';
    const template = JSON.parse(localStorage.getItem(templateKey) ?? 'null');
    const field = template.structure
      .flatMap((domain) => domain.groups)
      .flatMap((group) => group.entries)
      .flatMap((entry) => entry.sections)
      .flatMap((section) => section.fields)
      .find((item) => item.title === '小说类型');
    field.value = '保留的东方玄幻';
    localStorage.setItem(templateKey, JSON.stringify(template));
    const entries = JSON.parse(localStorage.getItem(settingsKey) ?? '[]');
    const positioning = entries.find((entry) => entry.title === '作品定位');
    const content = JSON.parse(positioning.content);
    content.body = content.body.replace('【小说类型】：\n', '【小说类型】：\nAI同步的东方玄幻');
    positioning.content = JSON.stringify(content);
    entries.push({
      id: 'acceptance-dynamic-role',
      tab: '角色',
      title: '林青竹',
      content: JSON.stringify({
        type: '重要配角',
        lifeStatus: '存活',
        baseSetting: '【人物姓名】：\n林青竹',
        relationship: '主角盟友',
        stateSettings: {
          currentSituation: '', currentGoal: '', abilityState: '', resourceState: '', otherState: '',
        },
        stateUpdateChapters: {}, personality: '', background: '', status: '', history: [],
      }),
      updatedAt: '2026/7/30',
    });
    localStorage.setItem(settingsKey, JSON.stringify(entries));
    localStorage.setItem(
      'xinyuexia_standard_setting_generation_v1:xinyuexia_workbench_settings_996',
      JSON.stringify({ version: 1, currentStepIndex: 1, completedStepIds: ['world-foundation'], status: 'idle' }),
    );
    localStorage.setItem(
      'xinyuexia_standard_brainstorm_link_996',
      JSON.stringify({ id: 'brainstorm-upgrade-996', title: '升级验收脑洞', content: '保留关联内容' }),
    );
    return { templateId: template.templateId, fieldCount: countFields(template.structure) };
  });
  assert.deepEqual(seeded, { templateId: 'male-fantasy-xianxia-light', fieldCount: 100 });

  stage = 'open upgrade dialog from formal shared setting workspace';
  await page.getByRole('button', { name: '升级模板', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '升级设定模板' });
  await dialog.waitFor();
  assert.equal(await dialog.getByRole('radio', { name: '升级到玄幻仙侠（标准版）' }).getAttribute('aria-checked'), 'true');
  assert.equal(await dialog.getByRole('radio', { name: '升级到玄幻仙侠（完整版）' }).count(), 1);
  assert.equal(await dialog.getByText('新增 198 个字段').count(), 1);
  assert.equal(await dialog.getByText('新增 548 个字段').count(), 1);
  const dialogLayout = await dialog.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  assert.ok(dialogLayout.scrollWidth <= dialogLayout.clientWidth);
  assert.ok(dialogLayout.scrollHeight <= dialogLayout.clientHeight);
  result.assertions.lightweightOffersStandardAndFull = true;
  result.assertions.upgradeDialogHasNoOverflow = dialogLayout;
  await capture('01-lightweight-upgrade-dialog');

  stage = 'direct upgrade to full preserves all scoped data';
  await dialog.getByRole('radio', { name: '升级到玄幻仙侠（完整版）' }).click();
  await dialog.getByRole('button', { name: '确认升级' }).click();
  await dialog.waitFor({ state: 'detached' });
  const upgraded = await page.evaluate(() => {
    const template = JSON.parse(localStorage.getItem('xinyuexia_standard_setting_template_996') ?? 'null');
    const entries = JSON.parse(localStorage.getItem('xinyuexia_workbench_settings_996') ?? '[]');
    const novelType = template.structure
      .flatMap((domain) => domain.groups)
      .flatMap((group) => group.entries)
      .flatMap((entry) => entry.sections)
      .flatMap((section) => section.fields)
      .find((field) => field.title === '小说类型')?.value;
    const positioning = entries.find((entry) => entry.title === '作品定位');
    return {
      templateId: template.templateId,
      templateName: template.templateName,
      fieldCount: countFields(template.structure),
      novelType,
      positioningBody: JSON.parse(positioning.content).body,
      dynamicRole: entries.find((entry) => entry.id === 'acceptance-dynamic-role')?.title,
      generation: localStorage.getItem(
        'xinyuexia_standard_setting_generation_v1:xinyuexia_workbench_settings_996',
      ),
      brainstorm: localStorage.getItem('xinyuexia_standard_brainstorm_link_996'),
    };
  });
  assert.equal(upgraded.templateId, 'male-fantasy-xianxia-full');
  assert.equal(upgraded.templateName, '玄幻仙侠（完整版）');
  assert.equal(upgraded.fieldCount, 648);
  assert.equal(upgraded.novelType, 'AI同步的东方玄幻');
  assert.match(upgraded.positioningBody, /【小说类型】：\nAI同步的东方玄幻/);
  assert.match(upgraded.positioningBody, /【题材方向】：/);
  assert.equal(upgraded.dynamicRole, '林青竹');
  assert.match(upgraded.generation ?? '', /world-foundation/);
  assert.match(upgraded.brainstorm ?? '', /brainstorm-upgrade-996/);
  const upgradeButton = page.getByRole('button', { name: '升级模板', exact: true });
  assert.equal(await upgradeButton.isDisabled(), true);
  result.assertions.directUpgradeToFull = upgraded;
  result.assertions.fullVersionDisablesFurtherUpgrade = true;
  await capture('02-full-upgrade-complete');

  stage = 'reload persists upgraded state';
  await page.reload();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '作品设定', exact: true }).click();
  await settingWorkspace.waitFor({ timeout: 30_000 });
  assert.equal(await page.getByRole('button', { name: '升级模板', exact: true }).isDisabled(), true);
  const persisted = await page.evaluate(() => {
    const template = JSON.parse(localStorage.getItem('xinyuexia_standard_setting_template_996') ?? 'null');
    return { templateId: template.templateId, fieldCount: countFields(template.structure) };
  });
  assert.deepEqual(persisted, { templateId: 'male-fantasy-xianxia-full', fieldCount: 648 });
  result.assertions.reloadPersistsUpgrade = true;

  assert.deepEqual(result.runtimeErrors, []);
  result.assertions.noRuntimeErrors = true;
  result.finalWindow = await app.evaluate(({ BrowserWindow }) => {
    const target = BrowserWindow.getAllWindows()[0];
    return { visible: target.isVisible(), focused: target.isFocused(), bounds: target.getBounds() };
  });
  assert.equal(result.finalWindow.visible, true);
  assert.equal(result.finalWindow.focused, false);
  result.status = 'PASS';
} catch (error) {
  result.error = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack ?? ''}` : String(error);
  if (page) await capture('failure').catch(() => undefined);
} finally {
  if (app) await app.close().catch(() => undefined);
  await rm(userDataDir, { recursive: true, force: true }).catch(() => undefined);
  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
}

console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exitCode = 1;
