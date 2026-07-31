import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = 'E:/0yuexia/0,月下PC';
const evidenceDir = path.join(repoRoot, 'artifacts', 'v7-setting-acceptance');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-v7-real-generation-'));
const sourceProfile = path.join(process.env.APPDATA ?? '', 'Electron');
const require = createRequire(import.meta.url);
const title = `V7真实生成验收-${Date.now()}`;
let electronApp;
let page;

await mkdir(evidenceDir, { recursive: true });
await cp(path.join(sourceProfile, 'Local Storage'), path.join(userDataDir, 'Local Storage'), { recursive: true });
await rm(path.join(userDataDir, 'Local Storage', 'leveldb', 'LOCK'), { force: true });

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
    const display = screen.getAllDisplays().find((item) => item.bounds.x === 2048);
    if (!display) return null;
    appWindow.setBounds({
      x: display.workArea.x + 24,
      y: display.workArea.y + 20,
      width: display.workArea.width - 48,
      height: display.workArea.height - 40,
    });
    appWindow.show();
    return { bounds: appWindow.getBounds(), display: display.bounds, visible: appWindow.isVisible() };
  });
  assert(geometry?.visible && geometry.bounds.x >= 2048, 'real generation window must stay on the Codex display');

  const modelReadiness = await page.evaluate(async () => {
    const parsed = JSON.parse(localStorage.getItem('xinyuexia_api_settings_v1') ?? '{"models":[]}');
    const models = Array.isArray(parsed.models) ? parsed.models.filter((model) => model?.enabled !== false) : [];
    const status = await window.xinyuexiaModelSecrets?.status();
    return {
      enabledModelCount: models.length,
      configuredSecretCount: status?.ok ? Object.values(status.secrets).filter(Boolean).length : 0,
      hasUsableModel: models.some((model) => Boolean(model.apiKey || status?.secrets?.[model.instanceId ?? model.id])),
    };
  });
  if (!modelReadiness.hasUsableModel) {
    process.stdout.write(`${JSON.stringify({ blocked: 'NO_USABLE_MODEL', modelReadiness, geometry }, null, 2)}\n`);
    throw new Error('NO_USABLE_MODEL');
  }

  await page.evaluate(() => localStorage.setItem('xinyuexia_application_mode_v1', 'standard'));
  await page.reload();
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '新建小说' }).click();
  await page.locator('input:visible').last().fill(title);
  await page.getByRole('button', { name: /^确[定认]$/ }).last().click();
  const card = page.getByText(title, { exact: true }).last().locator('xpath=ancestor::article');
  await card.waitFor({ timeout: 15_000 });
  await card.getByRole('button', { name: '进入标准工作台' }).click();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });

  const navigation = page.getByRole('navigation', { name: '标准模式创作导航' });
  await navigation.getByRole('button', { name: '作品设定', exact: true }).click();
  const actions = page.getByRole('group', { name: '作品设定操作' });
  await actions.waitFor({ timeout: 30_000 });
  await actions.getByRole('button', { name: '更换模板' }).click();
  const replacement = page.getByRole('dialog', { name: '更换设定模板？' });
  await replacement.waitFor();
  await replacement.getByRole('button', { name: '继续更换模板' }).click();
  await page.locator('[data-standard-setting-initializer="true"]').waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '选择内置模板：玄幻仙侠（轻量版）' }).click();
  await page.getByRole('button', { name: '确认模板并创建设定' }).click();
  await page.getByRole('button', { name: '一键生成全部' }).waitFor({ timeout: 30_000 });
  await page.getByLabel('作品设定用户要求').fill('生成一部东方玄幻升级流设定，主角果断，世界规则前后一致。');
  await page.screenshot({ path: path.join(evidenceDir, '05-real-generation-before-click.png') });
  await page.getByRole('button', { name: '一键生成全部' }).click();

  const startedAt = Date.now();
  let lastProgress = -1;
  while (Date.now() - startedAt < 15 * 60_000) {
    const progress = Number(await page.getByRole('progressbar', { name: '作品设定生成进度' }).getAttribute('aria-valuenow'));
    if (progress !== lastProgress) {
      process.stdout.write(`progress=${progress}% elapsed=${Math.round((Date.now() - startedAt) / 1000)}s\n`);
      lastProgress = progress;
    }
    if (progress === 100) break;
    const failure = page.getByText('生成失败', { exact: true });
    if (await failure.isVisible().catch(() => false)) {
      throw new Error(`real generation failed at ${progress}%`);
    }
    await page.waitForTimeout(2_000);
  }

  const progress = Number(await page.getByRole('progressbar', { name: '作品设定生成进度' }).getAttribute('aria-valuenow'));
  assert.equal(progress, 100, 'one-click generation should complete all setting steps');
  const generatedState = await page.evaluate(() => {
    const templateKey = Object.keys(localStorage).find((key) => key.startsWith('xinyuexia_standard_setting_template_'));
    const novelId = templateKey?.slice('xinyuexia_standard_setting_template_'.length) ?? '';
    const library = JSON.parse(localStorage.getItem(`xinyuexia_workbench_settings_${novelId}`) ?? '[]');
    const populatedCount = library.filter((entry) => typeof entry.content === 'string' && entry.content.length > 120).length;
    return { novelId, entryCount: library.length, populatedCount };
  });
  assert(generatedState.populatedCount > 5, 'real model output should populate multiple setting entries');
  await page.screenshot({ path: path.join(evidenceDir, '06-real-generation-completed.png') });

  await page.reload();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });
  await navigation.getByRole('button', { name: '作品设定', exact: true }).click();
  await page.getByRole('progressbar', { name: '作品设定生成进度' }).waitFor({ timeout: 30_000 });
  assert.equal(
    Number(await page.getByRole('progressbar', { name: '作品设定生成进度' }).getAttribute('aria-valuenow')),
    100,
  );
  process.stdout.write(`${JSON.stringify({ pass: true, modelReadiness, geometry, generatedState, elapsedSeconds: Math.round((Date.now() - startedAt) / 1000) }, null, 2)}\n`);
} catch (error) {
  if (page) {
    await page.screenshot({ path: path.join(evidenceDir, 'real-generation-failure.png') }).catch(() => {});
    process.stderr.write(`${(await page.locator('body').innerText().catch(() => '')).slice(0, 5000)}\n`);
  }
  throw error;
} finally {
  if (electronApp) await electronApp.close();
  await rm(userDataDir, { recursive: true, force: true });
}
