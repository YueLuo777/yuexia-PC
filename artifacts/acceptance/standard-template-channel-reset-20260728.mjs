import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-template-channel-reset-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-template-channel-reset');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '5173';

await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '作品概览 -> 标准模式 -> 新建玄幻作品 -> 开始设定 -> 其他分类模板 -> 女频模板 -> 更换模板',
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
      primary: primary.bounds,
      display: secondary.bounds,
      bounds: target.getBounds(),
      visible: target.isVisible(),
      focused: target.isFocused(),
    };
  });
  assert.equal(result.window.secondaryAvailable, true);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  stage = 'create novel';
  await page.getByRole('button', { name: '进入标准模式' }).click();
  await page.getByRole('button', { name: '进入专业模式' }).waitFor();
  await page.locator('button').filter({ hasText: '新建小说' }).first().click();
  const newNovelDialog = page.getByRole('dialog', { name: '新建小说' });
  await newNovelDialog.locator('input').first().fill('模板频道重置验收');
  await newNovelDialog.locator('select').selectOption({ label: '玄幻' });
  assert.equal(await newNovelDialog.getByRole('button', { name: '男频' }).getAttribute('aria-pressed'), 'true');
  assert.equal(await newNovelDialog.locator('label', { hasText: '作品名称' }).locator('span.text-red-500').count(), 1);
  assert.equal(await newNovelDialog.locator('label', { hasText: '作品频道' }).locator('span.text-red-500').count(), 1);
  assert.equal(await newNovelDialog.locator('label', { hasText: '作品题材' }).locator('span.text-red-500').count(), 1);
  result.assertions.requiredMarksVisible = true;
  await newNovelDialog.getByRole('button', { name: '确认' }).click();

  const novelCard = page.getByTestId('standard-mode-novel-card').filter({ hasText: '模板频道重置验收' });
  await novelCard.getByRole('button', { name: '进入工作台' }).click();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor();
  await page.getByRole('button', { name: '开始设定' }).click();
  await page.locator('[data-standard-setting-initializer="true"]').waitFor();

  stage = 'recommended templates';
  const xianxia = page.getByRole('button', { name: '选择内置模板：玄幻仙侠' });
  assert.equal(await xianxia.getAttribute('aria-pressed'), 'true');
  assert.equal(await page.getByRole('button', { name: '选择内置模板：都市（无修炼）' }).count(), 0);
  result.assertions.xianxiaOnlyRecommendedByCategory = true;
  await capture('01-xuanhuan-recommended');

  stage = 'other template categories';
  await page.getByRole('tab', { name: '其他分类模板' }).click();
  await page.getByRole('region', { name: '男频模板' }).waitFor();
  await page.getByRole('region', { name: '女频模板' }).waitFor();
  await page.locator('[data-template-genre-category="都市"]').waitFor();
  await page.locator('[data-template-genre-category="现代言情"]').waitFor();
  result.assertions.otherTemplatesGroupedByChannelAndGenre = true;
  await capture('02-other-template-categories');

  stage = 'cross-channel confirmation';
  await page.getByRole('button', { name: '选择内置模板：现代总裁' }).click();
  const channelDialog = page.getByRole('dialog', { name: '切换作品频道？' });
  await channelDialog.waitFor();
  const channelConfirm = channelDialog.getByRole('button', { name: '切换频道并选择模板' });
  assert.ok((await channelConfirm.getAttribute('class')).includes('bg-[#08AACE]'));
  assert.ok(!(await channelConfirm.getAttribute('class')).includes('bg-red-600'));
  result.assertions.channelSwitchUsesPrimaryActionStyle = true;
  await capture('03-channel-switch-confirm');
  await channelConfirm.click();
  assert.equal(await page.getByRole('button', { name: '选择内置模板：现代总裁' }).getAttribute('aria-pressed'), 'true');
  await page.getByRole('button', { name: '确认模板并创建设定' }).click();
  await page.getByText('生成设定', { exact: true }).waitFor();

  stage = 'seed generated state and replace template';
  const seeded = await page.evaluate(() => {
    const settingsKey = Object.keys(localStorage).find((key) => {
      if (!key.startsWith('xinyuexia_workbench_settings_')) return false;
      const value = localStorage.getItem(key) ?? '';
      return value.includes('female-ceo') || value.includes('现代总裁');
    });
    if (!settingsKey) return null;
    const novelId = settingsKey.slice('xinyuexia_workbench_settings_'.length);
    const generationKey = `xinyuexia_standard_setting_generation_v1:${settingsKey}`;
    const linkKey = `xinyuexia_standard_brainstorm_link_${novelId}`;
    localStorage.setItem(generationKey, JSON.stringify({
      version: 1,
      currentStepIndex: 1,
      completedStepIds: ['world-foundation'],
      status: 'paused',
      autoContinue: false,
      requirement: '旧用户要求',
      error: '',
    }));
    localStorage.setItem(linkKey, JSON.stringify({ id: 'brainstorm-a', title: '旧脑洞', content: '旧脑洞内容' }));
    return { settingsKey, generationKey, linkKey };
  });
  assert.ok(seeded);
  await page.getByRole('button', { name: '更换设定模板' }).first().click();
  const replaceDialog = page.getByRole('dialog', { name: '更换设定模板？' });
  await replaceDialog.getByRole('button', { name: '继续更换模板' }).click();
  await page.locator('[data-standard-setting-initializer="true"]').waitFor();
  await page.getByRole('button', { name: '确认模板并创建设定' }).click();
  await page.getByText('生成设定', { exact: true }).waitFor();
  const reset = await page.evaluate(({ generationKey, linkKey }) => ({
    generation: localStorage.getItem(generationKey),
    link: localStorage.getItem(linkKey),
  }), seeded);
  const resetGeneration = reset.generation ? JSON.parse(reset.generation) : null;
  assert.ok(resetGeneration === null || (
    resetGeneration.currentStepIndex === 0
    && resetGeneration.completedStepIds.length === 0
    && resetGeneration.status === 'idle'
    && resetGeneration.requirement === ''
    && resetGeneration.error === ''
  ));
  assert.equal(reset.link, null);
  result.assertions.generationHistoryResetAfterTemplateReplacement = true;
  result.assertions.brainstormAssociationResetAfterTemplateReplacement = true;

  stage = 'verify persisted channel';
  await page.getByRole('button', { name: '作品详情' }).first().click();
  const femaleChannel = page.getByRole('button', { name: '女频' });
  await femaleChannel.waitFor();
  assert.equal(await femaleChannel.getAttribute('aria-pressed'), 'true');
  result.assertions.channelPersistedAsFemale = true;

  stage = 'reload persistence';
  await page.reload();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '作品详情' }).first().click();
  assert.equal(await page.getByRole('button', { name: '女频' }).getAttribute('aria-pressed'), 'true');
  const workDetailOrder = await page.locator('[data-work-details-aligned-grid="true"]').evaluate((grid) =>
    Array.from(grid.children).map((child) => child.textContent?.trim() ?? ''),
  );
  assert.ok(workDetailOrder[0].startsWith('作品名称*'));
  assert.ok(workDetailOrder[1].startsWith('预计篇幅'));
  assert.ok(workDetailOrder[2].startsWith('作品频道*'));
  assert.ok(workDetailOrder[3].startsWith('作品题材*'));
  result.assertions.workDetailsRequiredTitleAndFieldOrder = true;
  const resetAfterReload = await page.evaluate(({ generationKey, linkKey }) => ({
    generation: localStorage.getItem(generationKey),
    link: localStorage.getItem(linkKey),
  }), seeded);
  const generationAfterReload = resetAfterReload.generation ? JSON.parse(resetAfterReload.generation) : null;
  assert.ok(generationAfterReload === null || (
    generationAfterReload.currentStepIndex === 0
    && generationAfterReload.completedStepIds.length === 0
    && generationAfterReload.requirement === ''
  ));
  assert.equal(resetAfterReload.link, null);
  result.assertions.channelAndResetPersistAfterReload = true;
  await capture('04-reset-complete-work-details');

  assert.deepEqual(result.runtimeErrors, []);
  result.status = 'PASS';
} catch (error) {
  result.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  result.stage = stage;
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
