import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-thinking-d-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'ai-thinking-variant-d');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const acceptancePort = process.env.XINYUEXIA_ACCEPTANCE_PORT;
const displayPoint = {
  x: Number(process.env.XINYUEXIA_ACCEPTANCE_DISPLAY_X),
  y: Number(process.env.XINYUEXIA_ACCEPTANCE_DISPLAY_Y),
};

assert.ok(acceptancePort, 'The isolated acceptance port is required.');
assert.ok(Number.isFinite(displayPoint.x) && Number.isFinite(displayPoint.y), 'A verified display point is required.');
await mkdir(evidenceDir, { recursive: true });

const novelId = 92701;
const chapterId = 92702;
const thinkingContent = [
  '[[THINKING seconds=12 status=done]]',
  '正在核对人物动机、章节冲突和后续节奏。',
  '[[/THINKING]]',
  '',
  '正文修改建议已经整理完成。',
].join('\n');

const result = {
  route: '首页 -> 验收小说 -> 正文 -> AI输出思考记录',
  window: null,
  collapsed: null,
  expanded: null,
  runtimeErrors: [],
  screenshots: {},
  status: 'FAIL',
};

let electronApp;
try {
  electronApp = await electron.launch({
    executablePath: electronExecutable,
    cwd: repoRoot,
    args: [path.join(repoRoot, 'electron', 'main.cjs'), `--user-data-dir=${userDataDir}`],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
      NODE_ENV: 'test',
      XINYUEXIA_SMOKE_HEADLESS: '1',
      XINYUEXIA_URL: `http://127.0.0.1:${acceptancePort}/#/workbench`,
    },
    timeout: 30_000,
  });

  const page = await electronApp.firstWindow({ timeout: 30_000 });
  page.on('pageerror', (error) => result.runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
      result.runtimeErrors.push(`console: ${message.text()}`);
    }
  });

  result.window = await electronApp.evaluate(({ BrowserWindow, screen }, point) => {
    const appWindow = BrowserWindow.getAllWindows()[0];
    const display = screen.getDisplayNearestPoint(point);
    const width = Math.min(1600, display.workArea.width - 80);
    const height = Math.min(900, display.workArea.height - 80);
    appWindow.setBounds({
      x: display.workArea.x + Math.round((display.workArea.width - width) / 2),
      y: display.workArea.y + Math.round((display.workArea.height - height) / 2),
      width,
      height,
    });
    appWindow.setFocusable(false);
    appWindow.showInactive();
    return {
      display: display.workArea,
      bounds: appWindow.getBounds(),
      visible: appWindow.isVisible(),
      focused: appWindow.isFocused(),
    };
  }, displayPoint);

  await page.goto(`http://127.0.0.1:${acceptancePort}/#/novels`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ novelId: seededNovelId, chapterId: seededChapterId, content }) => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('xinyuexia_current_novel_reset_this_session_v1', '1');
    localStorage.setItem('xinyuexia_current_novel_id', String(seededNovelId));
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([{
      id: seededNovelId,
      title: 'D方案思考样式验收',
      type: 'novel',
      category: '玄幻',
      wordCount: 8,
      createdAt: '2026/7/27',
      lastModifiedAt: '2026/7/27',
    }]));
    localStorage.setItem('xinyuexia_volumes_v1', JSON.stringify({
      [seededNovelId]: [{
        id: 92703,
        name: '第一卷',
        isExpanded: true,
        chapters: [{
          id: seededChapterId,
          title: '验收章节',
          serialNumber: 1,
          wordCount: 8,
          isSelected: true,
          isPublished: false,
        }],
      }],
    }));
    localStorage.setItem(`xinyuexia_novel_${seededNovelId}_chapter_${seededChapterId}`, '这是一段验收正文内容。');
    localStorage.setItem(`xinyuexia_workbench_ai_sessions_${seededNovelId}`, JSON.stringify({
      sessions: [{
        id: 1,
        input: '',
        output: content,
        messages: [{ id: 1, role: 'assistant', content }],
        linkChapter: false,
        hasSentChapterContext: false,
      }],
      activeSessionId: 1,
      nextSessionId: 2,
      nextMessageId: 2,
    }));
  }, { novelId, chapterId, content: thinkingContent });
  result.runtimeErrors.length = 0;
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  result.homeText = (await page.locator('body').innerText()).slice(0, 4000);
  const homeScreenshot = path.join(evidenceDir, 'thinking-d-home.png');
  await page.screenshot({ path: homeScreenshot });
  result.screenshots.home = homeScreenshot;
  const novelCard = page.locator('article').filter({ hasText: 'D方案思考样式验收' }).first();
  await novelCard.waitFor({ timeout: 20_000 });
  await page.evaluate(({ seededNovelId, content }) => {
    localStorage.setItem(`xinyuexia_workbench_ai_sessions_${seededNovelId}`, JSON.stringify({
      sessions: [{
        id: 1,
        input: '',
        output: content,
        messages: [{ id: 1, role: 'assistant', content }],
        linkChapter: false,
        hasSentChapterContext: false,
      }],
      activeSessionId: 1,
      nextSessionId: 2,
      nextMessageId: 2,
    }));
  }, { seededNovelId: novelId, content: thinkingContent });
  result.runtimeErrors.length = 0;
  await novelCard.click();
  result.pageText = (await page.locator('body').innerText()).slice(0, 4000);

  const toggle = page.getByRole('button', { name: '已思考（用时 12 秒）' });
  await toggle.waitFor({ timeout: 20_000 });
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(await page.getByText('正在核对人物动机、章节冲突和后续节奏。').count(), 0);

  result.collapsed = await toggle.evaluate((button) => {
    const shell = button.parentElement;
    const messageFrame = shell?.parentElement;
    const buttonStyle = getComputedStyle(button);
    const shellStyle = shell ? getComputedStyle(shell) : null;
    return {
      headerBackground: buttonStyle.backgroundColor,
      shellBackground: shellStyle?.backgroundColor,
      shellBorderColor: shellStyle?.borderColor,
      messageFrameClass: messageFrame?.className ?? '',
    };
  });
  assert.equal(result.collapsed.headerBackground, 'rgb(231, 248, 253)');
  assert.equal(result.collapsed.shellBackground, 'rgb(255, 255, 255)');
  assert.ok(!result.collapsed.messageFrameClass.includes('border-gray-200'));
  const collapsedScreenshot = path.join(evidenceDir, 'thinking-d-collapsed.png');
  await page.screenshot({ path: collapsedScreenshot });
  result.screenshots.collapsed = collapsedScreenshot;

  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
  const reasoning = page.getByText('正在核对人物动机、章节冲突和后续节奏。');
  await reasoning.waitFor();
  result.expanded = await reasoning.evaluate((element) => ({
    background: getComputedStyle(element.parentElement).backgroundColor,
    text: element.textContent,
  }));
  assert.equal(result.expanded.background, 'rgb(255, 255, 255)');
  const expandedScreenshot = path.join(evidenceDir, 'thinking-d-expanded.png');
  await page.screenshot({ path: expandedScreenshot });
  result.screenshots.expanded = expandedScreenshot;

  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(await page.getByText('正在核对人物动机、章节冲突和后续节奏。').count(), 0);
  assert.deepEqual(result.runtimeErrors, []);
  result.status = 'PASS';
} finally {
  if (electronApp) await electronApp.close();
  await rm(userDataDir, { recursive: true, force: true });
  await writeFile(resultPath, JSON.stringify(result, null, 2), 'utf8');
}

console.log(JSON.stringify(result, null, 2));
