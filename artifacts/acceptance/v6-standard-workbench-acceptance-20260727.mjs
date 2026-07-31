import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const evidenceDir = path.join(repoRoot, 'artifacts', 'v6-standard-workbench');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-v6-standard-'));
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '4175';
await mkdir(evidenceDir, { recursive: true });

const result = { route: '标准模式书籍 -> 工作台首页 -> 脑洞 -> 设定 -> 章纲 -> 正文 -> 检查', assertions: {}, screenshots: {}, runtimeErrors: [], status: 'FAIL' };
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
    env: { ...process.env, ELECTRON_DISABLE_SECURITY_WARNINGS: 'true', NODE_ENV: 'test', XINYUEXIA_SMOKE_HEADLESS: '1', XINYUEXIA_URL: `http://127.0.0.1:${port}/#/novels` },
    timeout: 30_000,
  });
  page = await app.firstWindow({ timeout: 30_000 });
  page.on('pageerror', (error) => result.runtimeErrors.push(`[${stage}] pageerror: ${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error' && !message.text().includes('Failed to load resource')) result.runtimeErrors.push(`[${stage}] console: ${message.text()}`); });
  await page.waitForLoadState('domcontentloaded');
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });

  result.window = await app.evaluate(({ BrowserWindow, screen }) => {
    const target = BrowserWindow.getAllWindows()[0];
    const primary = screen.getPrimaryDisplay();
    const secondary = screen.getAllDisplays().find((display) => display.id !== primary.id);
    if (!secondary) return { secondaryAvailable: false };
    const width = Math.min(1800, secondary.workArea.width - 32);
    const height = Math.min(1040, secondary.workArea.height - 32);
    target.setBounds({ x: secondary.workArea.x + Math.floor((secondary.workArea.width - width) / 2), y: secondary.workArea.y + Math.floor((secondary.workArea.height - height) / 2), width, height });
    target.showInactive();
    return { secondaryAvailable: true, primary: primary.bounds, display: secondary.bounds, bounds: target.getBounds(), visible: target.isVisible(), focused: target.isFocused() };
  });
  assert.equal(result.window.secondaryAvailable, true);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  await page.evaluate(() => {
    const novel = { id: 901, title: '星海问道', type: 'novel', category: '玄幻', channel: 'male', wordCount: 1280, createdAt: '2026/7/27', lastModifiedAt: '2026/7/27' };
    const brainstorm = { id: 'brainstorm-v6', tab: '脑洞', title: '星海问道脑洞', type: '脑洞库', content: '【类型】：脑洞库\n\n少年在灵气复苏后的星海时代获得古老传承，以凡人之身追查文明断层。', createdAt: '2026/7/27', updatedAt: '2026/7/27', brainstormSerialNumber: 1 };
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([novel]));
    localStorage.setItem('xinyuexia_current_novel_id', '901');
    localStorage.setItem('xinyuexia_volumes_v1', JSON.stringify({ 901: [{ id: 910, name: '第一卷', isExpanded: true, chapters: [{ id: 911, title: '星门初启', serialNumber: 1, wordCount: 1280, isSelected: true, isPublished: false }] }] }));
    localStorage.setItem('xinyuexia_novel_901_chapter_911', '夜色中的星门第一次亮起。');
    localStorage.setItem('xinyuexia_global_brainstorm_library_v1', JSON.stringify([brainstorm]));
  });
  await page.reload();
  await page.getByTestId('standard-mode-novel-card').waitFor();
  await page.getByRole('button', { name: '进入工作台' }).click();
  const workbench = page.locator('[data-standard-mode-workbench="true"]');
  await workbench.waitFor();

  stage = 'compact navigation';
  const header = workbench.locator('header').first();
  const headerBox = await header.boundingBox();
  assert.ok(headerBox && headerBox.height <= 86);
  for (const label of ['准备阶段', '设定阶段', '创作阶段', '检查阶段']) await page.getByRole('button', { name: new RegExp(label) }).waitFor();
  await header.getByText('星海问道', { exact: true }).waitFor();
  await header.getByText('男频', { exact: true }).waitFor();
  await header.getByText('玄幻', { exact: true }).waitFor();
  result.assertions.compactFourStageNavigationAndBookMetadata = true;
  await capture('01-home-compact-navigation');

  stage = 'brainstorm library';
  await page.getByRole('button', { name: '脑洞库' }).click();
  await page.getByText('脑洞操作', { exact: true }).waitFor();
  assert.equal(await page.getByText('生成条件', { exact: true }).count(), 0);
  const searchBox = await page.getByPlaceholder('搜索脑洞').boundingBox();
  const sidebarBox = await page.locator('aside').first().boundingBox();
  assert.ok(searchBox && sidebarBox && searchBox.y > sidebarBox.y + sidebarBox.height * 0.75);
  const titleBox = await page.getByLabel('脑洞名').locator('..').boundingBox();
  const copyBox = await page.getByRole('button', { name: '复制脑洞' }).boundingBox();
  const deleteBox = await page.getByRole('button', { name: '删除该脑洞' }).boundingBox();
  result.brainstormTopRowBoxes = { titleBox, copyBox, deleteBox };
  assert.ok(titleBox && copyBox && deleteBox && Math.abs(titleBox.y - copyBox.y) < 8 && Math.abs(copyBox.y - deleteBox.y) < 4);
  result.assertions.brainstormLibraryUsesPreviewAndActionPanel = true;
  await capture('02-brainstorm-library');

  stage = 'brainstorm generation';
  await page.getByRole('button', { name: '生成脑洞' }).click();
  await page.getByText('生成条件', { exact: true }).waitFor();
  assert.equal(await page.getByLabel('脑洞预览内容').inputValue(), '');
  assert.equal(await page.getByRole('button', { name: '删除该脑洞' }).count(), 0);
  await page.getByRole('button', { name: '玄幻', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: '玄幻', exact: true }).getAttribute('aria-pressed'), 'true');
  result.assertions.brainstormGenerationStartsBlankAndUsesSelectableConditions = true;
  await capture('03-brainstorm-generation');

  stage = 'setting check and template fit';
  await page.getByRole('button', { name: '新建设定' }).click();
  await page.locator('[data-standard-setting-initializer="true"]').waitFor();
  await page.getByRole('button', { name: '适应画布' }).waitFor();
  const zoomText = await page.getByTitle('恢复100%大小').textContent();
  assert.ok(Number.parseInt(zoomText, 10) >= 45 && Number.parseInt(zoomText, 10) <= 100);
  await page.getByRole('button', { name: '确认模板并创建设定' }).click();
  await page.getByText('设定检查', { exact: true }).waitFor();
  const settingSidebarWidth = await page.locator('[data-standard-mode-setting-page="true"] > aside').first().evaluate((element) => element.getBoundingClientRect().width);
  assert.ok(settingSidebarWidth >= 300 && settingSidebarWidth <= 315);
  result.assertions.templateFitsAndSettingCheckStartsCompact = true;
  await capture('04-setting-check');

  stage = 'outline compact status';
  await page.getByRole('button', { name: '章纲' }).click();
  await page.locator('[data-workbench-flow="chapterOutline"]').waitFor();
  const statusSummary = page.getByText(/状态变化 0字/).first();
  await statusSummary.waitFor();
  const details = statusSummary.locator('xpath=ancestor::details[1]');
  assert.equal(await details.getAttribute('open'), null);
  await statusSummary.click();
  assert.notEqual(await details.getAttribute('open'), null);
  result.assertions.outlineStatusStartsCollapsedAndCanExpand = true;
  await capture('05-outline-status-expanded');

  stage = 'writing compact tools';
  await page.getByRole('button', { name: '正文' }).click();
  await page.locator('[data-workbench-flow="writing"]').waitFor();
  await page.getByRole('button', { name: '更多' }).click();
  for (const label of ['字体设置', '智能排版', '词语高亮', '文字替换']) await page.getByRole('button', { name: label, exact: true }).waitFor();
  result.assertions.writingKeepsEssentialToolsAndMovesAdvancedToolsToMore = true;
  await capture('06-writing-more');

  stage = 'check stage routes';
  for (const [label, flow] of [['审核剧情', 'audit'], ['更新状态', 'status'], ['生成梗概', 'summary']]) {
    await page.getByRole('button', { name: label }).click();
    await page.locator(`[data-workbench-flow="${flow}"]`).waitFor();
  }
  result.assertions.allCheckStageActionsOpenSharedProfessionalCore = true;

  const layout = await workbench.evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth, clientHeight: element.clientHeight, scrollHeight: element.scrollHeight }));
  assert.ok(layout.scrollWidth <= layout.clientWidth);
  assert.ok(layout.scrollHeight <= layout.clientHeight);
  result.assertions.noUnexpectedWorkbenchOverflow = true;
  assert.deepEqual(result.runtimeErrors, []);
  result.finalWindow = await app.evaluate(({ BrowserWindow }) => { const target = BrowserWindow.getAllWindows()[0]; return { visible: target.isVisible(), focused: target.isFocused(), bounds: target.getBounds() }; });
  assert.equal(result.finalWindow.focused, false);
  result.status = 'PASS';
} catch (error) {
  result.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  if (page) await capture('failure').catch(() => undefined);
  throw error;
} finally {
  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  if (app) await app.close().catch(() => undefined);
  await rm(userDataDir, { recursive: true, force: true });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
