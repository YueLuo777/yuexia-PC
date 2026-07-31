import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-role-survival-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'role-survival-field-formal');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '5197';
await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '标准模式书籍 -> 进入工作台 -> 作品设定 -> 人物设定 -> 男主角/普通人物',
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
      XINYUEXIA_URL: `http://127.0.0.1:${port}/#/workbench`,
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
    target.showInactive();
    return {
      secondaryAvailable: true,
      bounds: target.getBounds(),
      display: secondary.bounds,
      visible: target.isVisible(),
      focused: target.isFocused(),
    };
  });
  assert.equal(result.window.secondaryAvailable, true);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  const roleContent = (type, lifeStatus) => JSON.stringify({
    type,
    lifeStatus,
    baseSetting: '',
    relationship: '',
    stateSettings: {
      currentSituation: '',
      currentGoal: '',
      abilityState: '',
      resourceState: '',
      otherState: '',
    },
    stateUpdateChapters: {},
    personality: '',
    background: '',
    status: '',
    history: [],
  });

  await page.evaluate(({ maleContent, femaleContent }) => {
    const novel = {
      id: 997,
      title: '人物状态验收作品',
      type: 'novel',
      category: '玄幻',
      channel: 'male',
      wordCount: 0,
      createdAt: '2026/7/28',
      lastModifiedAt: '2026/7/28',
    };
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([novel]));
    localStorage.setItem('xinyuexia_current_novel_id', '997');
    localStorage.setItem('xinyuexia_volumes_v1', JSON.stringify({ 997: [] }));
    localStorage.setItem('xinyuexia_workbench_settings_997', JSON.stringify([
      { id: 'role-male', tab: '角色', title: '林刻', content: maleContent, updatedAt: '2026/7/28' },
      { id: 'role-female', tab: '角色', title: '苏婉', content: femaleContent, updatedAt: '2026/7/28' },
    ]));
  }, {
    maleContent: roleContent('男主角', '死亡'),
    femaleContent: roleContent('女主角', '存活'),
  });
  await page.reload();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });

  stage = 'open formal role editor';
  await page.getByRole('button', { name: '作品设定', exact: true }).click();
  await page.locator('[data-workbench-flow="outline"]').waitFor({ timeout: 30_000 });
  const roleDomain = page.getByRole('button', { name: /^人物设定\d+$/ }).first();
  await roleDomain.waitFor();
  if ((await roleDomain.getAttribute('aria-expanded')) === 'false') await roleDomain.click();
  const protagonistGroup = page.getByRole('button', { name: /^男女主\d+$/ }).first();
  await protagonistGroup.waitFor();
  if ((await protagonistGroup.getAttribute('aria-expanded')) === 'false') await protagonistGroup.click();

  stage = 'verify male protagonist lock';
  await page.getByRole('textbox', { name: '人物姓名' }).waitFor();
  assert.equal(await page.getByRole('textbox', { name: '人物姓名' }).inputValue(), '林刻');
  const identity = page.getByRole('combobox', { name: '身份定位' });
  const survival = page.getByRole('combobox', { name: '生存状态' });
  assert.equal(await identity.inputValue(), '男主角');
  assert.equal(await identity.isDisabled(), true);
  assert.equal(await survival.inputValue(), '存活');
  assert.equal(await survival.isDisabled(), true);
  assert.equal(await survival.getByRole('option', { name: '死亡' }).count(), 0);
  const fieldMetrics = await page.evaluate(() => {
    const identity = document.querySelector('select[aria-label="身份定位"]')?.parentElement;
    const survival = document.querySelector('select[aria-label="生存状态"]')?.parentElement;
    const rect = (element) => {
      const box = element.getBoundingClientRect();
      return {
        top: box.top,
        bottom: box.bottom,
        width: box.width,
        cssWidth: Number.parseFloat(getComputedStyle(element).width),
        height: box.height,
        borderWidth: getComputedStyle(element).borderTopWidth,
      };
    };
    return { identity: rect(identity), survival: rect(survival) };
  });
  assert.ok(Math.abs(fieldMetrics.identity.top - fieldMetrics.survival.top) <= 1);
  assert.ok(Math.abs(fieldMetrics.identity.width - fieldMetrics.survival.width) <= 1);
  assert.ok(Math.abs(fieldMetrics.identity.cssWidth - 140) <= 1);
  assert.ok(Math.abs(fieldMetrics.survival.cssWidth - 140) <= 1);
  assert.ok(Math.abs(fieldMetrics.identity.height - fieldMetrics.survival.height) <= 1);
  assert.equal(fieldMetrics.identity.borderWidth, fieldMetrics.survival.borderWidth);
  result.metrics = fieldMetrics;
  result.assertions.survivalMatchesIdentityFieldFrame = true;
  result.assertions.maleProtagonistForcedAliveAndDisabled = true;
  await capture('01-male-protagonist-survival-locked');

  stage = 'verify ordinary role can change';
  await page.getByRole('button', { name: '苏婉', exact: true }).click();
  await page.getByRole('textbox', { name: '人物姓名' }).waitFor();
  const ordinarySurvival = page.getByRole('combobox', { name: '生存状态' });
  assert.equal(await ordinarySurvival.isDisabled(), false);
  await ordinarySurvival.selectOption('死亡');
  assert.equal(await ordinarySurvival.inputValue(), '死亡');
  await page.waitForFunction(() => {
    const entries = JSON.parse(localStorage.getItem('xinyuexia_workbench_settings_997') ?? '[]');
    const role = entries.find((entry) => entry.id === 'role-female');
    return role && JSON.parse(role.content).lifeStatus === '死亡';
  });
  result.assertions.ordinaryRoleCanSwitchAndPersistDeath = true;
  await capture('02-ordinary-role-survival-changed');

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
