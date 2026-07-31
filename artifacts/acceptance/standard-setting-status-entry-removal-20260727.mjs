import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-setting-status-entry-removal');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-setting-status-entry-'));
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '4178';
await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '标准模式书籍 -> 工作台 -> 作品设定 -> 第四阶段更新状态 -> 专业模式设定',
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
    const codexDisplay = screen.getDisplayNearestPoint({ x: 2050, y: 100 });
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
  });
  assert.notEqual(result.window.codexDisplayId, result.window.primaryDisplayId);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  await page.evaluate(() => {
    const novel = {
      id: 996,
      title: '状态入口验收书籍',
      type: 'novel',
      category: '玄幻',
      channel: 'male',
      synopsis: '用于隔离验收标准模式状态入口。',
      wordCount: 18,
      createdAt: '2026/7/27',
      lastModifiedAt: '2026/7/27',
    };
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([novel]));
    localStorage.setItem('xinyuexia_current_novel_id', '996');
    localStorage.setItem('xinyuexia_volumes_v1', JSON.stringify({
      996: [{
        id: 9961,
        name: '第一卷',
        isExpanded: true,
        chapters: [{ id: 9962, title: '山门初见', serialNumber: 1, wordCount: 18, isSelected: true, isPublished: false }],
      }],
    }));
    localStorage.setItem('xinyuexia_novel_996_chapter_9962', '林川走入山门，发现守山人已经负伤。');
    localStorage.setItem('xinyuexia_workbench_settings_996', JSON.stringify([{
      id: 'setting-status-acceptance',
      tab: '大纲',
      title: '作品定位',
      content: JSON.stringify({ type: '核心设定', body: '【小说类型】：\n东方玄幻' }),
      updatedAt: '2026/7/27',
    }]));
  });
  await page.goto(`http://127.0.0.1:${port}/#/workbench`);
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });

  stage = 'standard setting page';
  await page.getByRole('button', { name: '作品设定', exact: true }).click();
  const standardSetting = page.locator('[data-workbench-experience="standard"][data-workbench-flow="outline"]');
  await standardSetting.waitFor();
  await page.getByLabel('设定名').waitFor();
  assert.equal(await page.getByRole('button', { name: '切换设定', exact: true }).count(), 0);
  assert.equal(await page.getByRole('button', { name: /^更新状态 · / }).count(), 0);
  assert.equal(await page.getByRole('button', { name: '更新状态', exact: true }).count(), 1);
  const settingGeometry = await standardSetting.evaluate((element) => ({
    width: element.getBoundingClientRect().width,
    height: element.getBoundingClientRect().height,
    scrollWidth: element.scrollWidth,
    scrollHeight: element.scrollHeight,
    redundantTabRows: element.querySelectorAll('main > div.h-12').length,
  }));
  assert.equal(settingGeometry.redundantTabRows, 0);
  assert.ok(settingGeometry.scrollWidth <= settingGeometry.width + 1);
  assert.ok(settingGeometry.scrollHeight <= settingGeometry.height + 1);
  result.assertions.standardSettingDirectlyShowsEditorWithoutStatusSwitch = settingGeometry;
  await capture('01-standard-setting-without-status-switch');

  stage = 'fourth-stage status page';
  await page.getByRole('button', { name: '更新状态', exact: true }).click();
  const standardStatus = page.locator('[data-workbench-experience="standard"][data-workbench-flow="status"]');
  await standardStatus.waitFor();
  await page.getByText('状态目标', { exact: true }).waitFor();
  await page.getByText('新的状态', { exact: true }).waitFor();
  assert.equal(await page.getByText('截至第1章：山门初见', { exact: true }).count(), 1);
  assert.equal(await page.getByRole('button', { name: '保存状态到第1章', exact: true }).count(), 1);
  result.assertions.fourthStageRemainsTheSingleStandardStatusEntry = true;
  await capture('02-fourth-stage-status-page');

  stage = 'professional setting page';
  await page.evaluate(() => localStorage.setItem('xinyuexia_application_mode_v1', 'professional'));
  await page.goto(`http://127.0.0.1:${port}/#/workbench`);
  await page.reload();
  const professional = page.locator('[data-workbench-experience="professional"]');
  await professional.waitFor();
  await page.getByRole('button', { name: /^设定/ }).click();
  await page.locator('[data-workbench-flow="outline"]').waitFor();
  await page.getByRole('button', { name: '切换设定', exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: /^更新状态 · / }).count(), 1);
  result.assertions.professionalSettingStatusSwitchIsPreserved = true;
  await capture('03-professional-setting-switch-preserved');

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
