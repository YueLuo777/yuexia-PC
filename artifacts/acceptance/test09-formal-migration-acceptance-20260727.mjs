import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-test09-acceptance-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-shared-pages-and-test09-20260727');
const resultPath = path.join(evidenceDir, 'desktop-acceptance.json');
const baseUrl = 'http://127.0.0.1:18328';

await mkdir(evidenceDir, { recursive: true });

const result = {
  userDataDir,
  window: null,
  screenshots: {},
  assertions: {},
  runtimeErrors: [],
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
      XINYUEXIA_URL: `${baseUrl}/#/novels`,
    },
    timeout: 30_000,
  });

  page = await app.firstWindow({ timeout: 30_000 });
  page.on('pageerror', (error) => result.runtimeErrors.push(`[${stage}] pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') result.runtimeErrors.push(`[${stage}] console: ${message.text()}`);
  });
  await page.waitForLoadState('domcontentloaded');

  result.window = await app.evaluate(({ BrowserWindow, screen }) => {
    const targetWindow = BrowserWindow.getAllWindows()[0];
    const displays = screen.getAllDisplays();
    const primary = screen.getPrimaryDisplay();
    const targetDisplay = displays.find((display) => display.id !== primary.id) ?? primary;
    const { workArea } = targetDisplay;
    const width = Math.min(1540, workArea.width - 32);
    const height = Math.min(940, workArea.height - 32);
    targetWindow.setBounds({
      x: workArea.x + Math.floor((workArea.width - width) / 2),
      y: workArea.y + Math.floor((workArea.height - height) / 2),
      width,
      height,
    });
    targetWindow.showInactive();
    return {
      displayCount: displays.length,
      usedSecondaryDisplay: targetDisplay.id !== primary.id,
      bounds: targetWindow.getBounds(),
      visible: targetWindow.isVisible(),
      focused: targetWindow.isFocused(),
    };
  });
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  stage = 'formal empty novel library';
  await page.evaluate(() => {
    localStorage.setItem('xinyuexia_novels_v1', '[]');
    localStorage.setItem('xinyuexia_recycled_novels_v1', '[]');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByText('暂无小说', { exact: true }).waitFor({ timeout: 30_000 });
  await page.getByText('创建第一本小说后，将在这里显示。', { exact: true }).waitFor();
  await page.getByRole('button', { name: '新建小说', exact: true }).last().waitFor();
  result.assertions.formalNovelLibraryUsesRecommendedEmptyState = true;
  await capture('05-formal-empty-state');

  stage = 'test 9 saved selections';
  await page.goto(`${baseUrl}/#/test-collection`, { waitUntil: 'domcontentloaded' });
  await page.getByText('全项目同功能样式对比', { exact: true }).waitFor({ timeout: 30_000 });
  await page.getByText('全项目同功能样式对比', { exact: true }).click();
  const summary = page.getByTestId('comparison-selection-summary');
  await summary.getByText('已选择 3/5', { exact: true }).waitFor({ timeout: 30_000 });
  await summary.getByText('推荐统一版', { exact: true }).waitFor();
  await summary.getByText('统一弹窗', { exact: true }).waitFor();
  await summary.getByText('#08AACE', { exact: true }).waitFor();
  assert.equal(await summary.getByText('未选择', { exact: true }).count(), 2);
  result.assertions.test09KeepsOnlyChoicesOneTwoAndFour = true;
  await capture('06-test-09-final-selections');

  stage = 'standard shared outline';
  await page.evaluate(() => {
    const novel = {
      id: 1,
      title: '验收小说',
      type: 'novel',
      category: '玄幻',
      wordCount: 10,
      createdAt: '2026/7/27',
      lastModifiedAt: '2026/7/27',
    };
    const volumes = {
      1: [
        {
          id: 1,
          name: '第一卷',
          isExpanded: true,
          chapters: [
            {
              id: 1,
              title: '验收章节',
              serialNumber: 1,
              wordCount: 10,
              isSelected: true,
              isPublished: false,
            },
          ],
        },
      ],
    };
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([novel]));
    localStorage.setItem('xinyuexia_volumes_v1', JSON.stringify(volumes));
    localStorage.setItem('xinyuexia_current_novel_id', '1');
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novel_1_chapter_1', '标准模式正文验收内容。');
    localStorage.setItem(
      'xinyuexia_workspace_tabs_v1',
      JSON.stringify([
        { id: 'home', title: '首页', path: '/novels', fixed: true },
        { id: 'novel-1', title: '验收小说', path: '/workbench', workId: 1, workType: 'novel' },
      ]),
    );
    localStorage.setItem('xinyuexia_workspace_active_tab_v1', 'novel-1');
    sessionStorage.setItem('xinyuexia_current_novel_reset_this_session_v1', '1');
    sessionStorage.setItem('xinyuexia_workspace_tabs_reset_this_session_v1', '1');
  });
  await page.goto(`${baseUrl}/#/workbench`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '章纲', exact: true }).click();
  await page.getByText(/^第1章 章纲/).waitFor({ timeout: 30_000 });
  assert.equal(await page.getByText('专业模式', { exact: true }).count(), 0);
  result.assertions.standardOutlineUsesSharedCoreWithoutProfessionalHeader = true;
  await capture('07-standard-outline-no-runtime-warning');

  stage = 'standard shared writing persistence';
  await page.getByRole('button', { name: '正文', exact: true }).click();
  const editor = page.locator('textarea.xy-wa-editor-text-layer:visible');
  await editor.waitFor({ timeout: 30_000 });
  assert.equal(await editor.inputValue(), '标准模式正文验收内容。');
  await editor.fill('标准模式修改后的正文。');
  await page.waitForTimeout(800);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '正文', exact: true }).click();
  const reloadedEditor = page.locator('textarea.xy-wa-editor-text-layer:visible');
  await reloadedEditor.waitFor({ timeout: 30_000 });
  assert.equal(await reloadedEditor.inputValue(), '标准模式修改后的正文。');
  result.assertions.standardWritingPersistsAfterReload = true;
  await capture('08-standard-writing-persisted');

  await page.waitForTimeout(500);
  assert.deepEqual(result.runtimeErrors, []);
  result.assertions.noRendererErrors = true;
} catch (error) {
  if (page) await capture('09-failure-state').catch(() => undefined);
  result.failure = { stage, message: error instanceof Error ? error.stack ?? error.message : String(error) };
  throw error;
} finally {
  if (app) await app.close().catch(() => undefined);
  await writeFile(resultPath, JSON.stringify(result, null, 2), 'utf8');
  await rm(userDataDir, { recursive: true, force: true });
}
