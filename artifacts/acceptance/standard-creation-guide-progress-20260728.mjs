import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-guide-progress-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-creation-guide-overview');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '5197';
await mkdir(evidenceDir, { recursive: true });

const result = { route: '作品概览 -> 新建小说 -> 工作台作品详情 -> 创作向导', window: null, assertions: {}, screenshots: {}, runtimeErrors: [], status: 'FAIL' };
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
    env: { ...process.env, ELECTRON_DISABLE_SECURITY_WARNINGS: 'true', NODE_ENV: 'test', XINYUEXIA_SMOKE_HEADLESS: '1', XINYUEXIA_URL: `http://127.0.0.1:${port}/#/novels` },
    timeout: 30_000,
  });
  page = await app.firstWindow({ timeout: 30_000 });
  page.on('pageerror', (error) => result.runtimeErrors.push(`[${stage}] pageerror: ${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error' && !message.text().includes('Failed to load resource')) result.runtimeErrors.push(`[${stage}] console: ${message.text()}`); });
  await page.waitForLoadState('domcontentloaded');
  result.window = await app.evaluate(({ BrowserWindow, screen }) => {
    const target = BrowserWindow.getAllWindows()[0];
    const primary = screen.getPrimaryDisplay();
    const secondary = screen.getAllDisplays().find((display) => display.id !== primary.id);
    if (!secondary) return { secondaryAvailable: false };
    const width = Math.min(1900, secondary.workArea.width - 32);
    const height = Math.min(1080, secondary.workArea.height - 32);
    target.setBounds({ x: secondary.workArea.x + Math.floor((secondary.workArea.width - width) / 2), y: secondary.workArea.y + Math.floor((secondary.workArea.height - height) / 2), width, height });
    target.webContents.setZoomFactor(1.1);
    target.showInactive();
    return { secondaryAvailable: true, bounds: target.getBounds(), display: secondary.bounds, visible: target.isVisible(), focused: target.isFocused() };
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
  await page.getByText('作品概览', { exact: true }).waitFor();
  await page.getByRole('button', { name: '新建小说' }).first().click();
  const dialog = page.getByRole('dialog', { name: '新建小说' });
  await dialog.getByRole('textbox').first().fill('创作向导统计验收');
  await dialog.getByRole('button', { name: '确认' }).click();
  await page.getByTestId('standard-mode-novel-card').getByRole('button', { name: '进入工作台' }).click();
  await page.locator('[data-standard-work-details-page="true"]').waitFor();

  const data = await page.evaluate(() => {
    const novelId = localStorage.getItem('xinyuexia_current_novel_id');
    if (!novelId) throw new Error('没有找到当前作品 ID');
    const fields = Array.from({ length: 105 }, (_, index) => ({ id: `field-${index}`, title: `设定子项${index + 1}`, enabled: true, value: index < 99 ? '已填写内容' : '' }));
    const state = { version: 2, mode: 'template', templateId: 'acceptance-template', templateName: '验收模板', structure: [{ id: 'domain-1', title: '作品设定', enabled: true, groups: [{ id: 'group-1', title: '核心设定', enabled: true, entries: [{ id: 'entry-1', title: '作品定位', enabled: true, sections: [{ id: 'section-1', title: '基础设定', enabled: true, fields }] }] }] }] };
    localStorage.setItem(`xinyuexia_standard_setting_template_${novelId}`, JSON.stringify(state));
    localStorage.setItem('xinyuexia_global_brainstorm_library_v1', JSON.stringify([
      { id: 'brain-1', tab: '脑洞', title: '脑洞一', content: '内容一', updatedAt: '' },
      { id: 'brain-2', tab: '脑洞', title: '脑洞二', content: '内容二', updatedAt: '' },
    ]));
    return { novelId };
  });
  result.assertions.fixturePrepared = Boolean(data.novelId);
  await page.reload();
  await page.locator('[data-standard-work-details-page="true"]').waitFor();
  await page.getByText('创作向导', { exact: true }).waitFor();
  const guide = page.locator('[data-standard-creation-guide="true"]');
  assert.equal(await guide.getAttribute('data-creation-guide-layout'), 'overview');
  assert.equal(await guide.getByText('下一步', { exact: true }).count(), 0);
  result.assertions.fakeNextStepButtonRemoved = true;
  const overview = guide.getByRole('navigation', { name: '创作步骤总览' });
  await overview.waitFor();
  assert.equal(await overview.locator('[data-guide-step-tab]').count(), 5);
  await page.getByText('脑洞库：2 个', { exact: true }).waitFor();
  await guide.getByRole('button', { name: '查看建立设定' }).click();
  await page.getByText(/设定完善度：99 \/ 105/).waitFor();
  await page.getByText(/还有 6 个未完善/).waitFor();
  await guide.getByRole('button', { name: '查看生成章纲' }).click();
  await page.getByText('已有 0 个章纲', { exact: true }).waitFor();
  await guide.getByRole('button', { name: '查看生成正文' }).click();
  await page.getByText('已完成 0 章正文', { exact: true }).waitFor();
  await guide.getByRole('button', { name: '查看完成检查' }).click();
  await page.getByText('已审核 0 / 0 章', { exact: true }).waitFor();
  const geometry = await page.evaluate(() => {
    const guideElement = document.querySelector('[data-standard-creation-guide="true"]');
    const overviewElement = guideElement.querySelector('[aria-label="创作步骤总览"]');
    const tabs = Array.from(guideElement.querySelectorAll('[data-guide-step-tab]'));
    const task = guideElement.querySelector('[data-guide-current-task]');
    const toRect = (element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
    };
    return {
      guide: toRect(guideElement),
      overview: toRect(overviewElement),
      tabs: tabs.map(toRect),
      task: toRect(task),
      clientWidth: guideElement.clientWidth,
      scrollWidth: guideElement.scrollWidth,
      clientHeight: guideElement.clientHeight,
      scrollHeight: guideElement.scrollHeight,
    };
  });
  assert.equal(geometry.tabs.length, 5);
  assert.ok(geometry.tabs.every((tab) => Math.abs(tab.width - geometry.tabs[0].width) <= 1));
  assert.ok(geometry.tabs.every((tab) => tab.left >= geometry.guide.left && tab.right <= geometry.guide.right));
  assert.ok(geometry.task.top > geometry.overview.bottom);
  assert.ok(geometry.scrollWidth <= geometry.clientWidth);
  assert.ok(geometry.scrollHeight <= geometry.clientHeight);
  result.geometry = geometry;
  result.assertions.guideShowsBrainstormAndSettingCompletion = true;
  result.assertions.guideShowsEmptyCreationAndReviewCounts = true;
  result.assertions.fiveStepOverviewUsesEqualTabs = true;
  result.assertions.currentTaskSwitchesWithoutOverflow = true;
  await capture('01-guide-overview');
  const guideScreenshot = path.join(evidenceDir, '02-guide-panel.png');
  await guide.screenshot({ path: guideScreenshot });
  result.screenshots.guidePanel = guideScreenshot;
  await guide.getByRole('button', { name: '查看生成章纲' }).click();
  await guide.getByRole('button', { name: '生成章纲', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: '生成章纲', exact: true }).getAttribute('aria-current'), 'page');
  result.assertions.formalOutlineActionOpens = true;
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
