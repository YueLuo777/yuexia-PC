import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-standard-mode-acceptance-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'acceptance');
const resultPath = path.join(evidenceDir, 'standard-mode-workbench-acceptance-20260725.json');
const acceptancePort = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '18328';

const result = {
  route: 'novel library -> titlebar test collection -> standard mode workbench test',
  userDataDir,
  screenshots: {},
  assertions: {},
  runtimeErrors: [],
  window: null,
};

let electronApp;
let page;
let stage = 'startup';

async function capture(name) {
  const filePath = path.join(evidenceDir, `standard-mode-${name}-20260725.png`);
  await page.screenshot({ path: filePath });
  result.screenshots[name] = filePath;
}

async function assertVisible(text, key) {
  await page.getByText(text, { exact: true }).first().waitFor({ timeout: 20_000 });
  result.assertions[key] = true;
}

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
      XINYUEXIA_URL: `http://127.0.0.1:${acceptancePort}/#/novels`,
    },
    timeout: 30_000,
  });

  page = await electronApp.firstWindow({ timeout: 30_000 });
  page.on('pageerror', (error) => result.runtimeErrors.push(`[${stage}] pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') result.runtimeErrors.push(`[${stage}] console: ${message.text()}`);
  });

  await page.waitForLoadState('domcontentloaded');
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });
  await page.getByTitle('测试板块').click();
  await assertVisible('标准模式创作工作台模拟', 'testEntryVisible');
  result.assertions.titlebarTestButtonOpensCollection = true;

  result.window = await electronApp.evaluate(({ BrowserWindow, screen }) => {
    const appWindow = BrowserWindow.getAllWindows()[0];
    const codexDisplay = screen.getDisplayNearestPoint({ x: 2050, y: 100 });
    const { workArea } = codexDisplay;
    const width = Math.min(1540, workArea.width - 32);
    const height = Math.min(940, workArea.height - 32);
    appWindow.setBounds({
      x: workArea.x + Math.floor((workArea.width - width) / 2),
      y: workArea.y + Math.floor((workArea.height - height) / 2),
      width,
      height,
    });
    appWindow.showInactive();
    return {
      display: codexDisplay.bounds,
      workArea,
      bounds: appWindow.getBounds(),
      visible: appWindow.isVisible(),
      focused: appWindow.isFocused(),
    };
  });

  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);
  await capture('test-collection');

  const testCard = page.locator('button').filter({ hasText: '标准模式创作工作台模拟' }).first();
  await testCard.scrollIntoViewIfNeeded();
  await testCard.click({ timeout: 10_000 });
  await page.getByTestId('standard-mode-library').waitFor({ timeout: 20_000 });
  result.assertions.testEntryOpensPrototype = true;
  await capture('library');

  const visualMetrics = await page.evaluate(() => ({
    viewport: { width: innerWidth, height: innerHeight },
    body: { width: document.body.scrollWidth, height: document.body.scrollHeight },
    cards: [...document.querySelectorAll('article')].map((node) => {
      const rect = node.getBoundingClientRect();
      return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
    }),
  }));
  assert.ok(visualMetrics.cards.length === 2);
  assert.ok(visualMetrics.cards.every((card) => card.left >= 0 && card.right <= visualMetrics.viewport.width));
  assert.ok(visualMetrics.body.width <= visualMetrics.viewport.width);
  result.assertions.libraryHasTwoCardsWithoutHorizontalOverflow = true;

  stage = 'open ongoing professional editor';
  await page.getByRole('button', { name: '打开《九重天劫》正文' }).click();
  await page.getByTestId('professional-mode-editor-preview').waitFor({ timeout: 20_000 });
  await assertVisible('未发布', 'ongoingBookUsesProfessionalChapterSidebar');
  const professionalBody = page.locator('textarea.xy-wa-editor-text-layer:visible');
  await professionalBody.waitFor();
  assert.match(await professionalBody.inputValue(), /天门在云海深处/);
  await page.getByText('请输入要求', { exact: true }).waitFor();
  result.assertions.ongoingBookUsesProfessionalEditorAndAiPanel = true;
  result.replaceControlMetrics = await page.getByRole('button', { name: '词语替换设置' }).evaluate((button) => {
    const icon = button.querySelector('svg');
    const parent = button.parentElement;
    const rect = button.getBoundingClientRect();
    const iconRect = icon?.getBoundingClientRect();
    const parentRect = parent?.getBoundingClientRect();
    const style = getComputedStyle(button);
    return {
      rect: { left: rect.left, right: rect.right, width: rect.width, height: rect.height },
      iconRect: iconRect ? { left: iconRect.left, right: iconRect.right, width: iconRect.width, height: iconRect.height } : null,
      parentRect: parentRect ? { left: parentRect.left, right: parentRect.right, width: parentRect.width } : null,
      color: style.color,
      backgroundColor: style.backgroundColor,
      overflow: style.overflow,
    };
  });
  await capture('professional-editor');

  stage = 'open ongoing unified workbench';
  await page.getByRole('button', { name: '返回书籍' }).click();
  await page.getByTestId('standard-mode-library').waitFor();
  await page.getByRole('button', { name: '进入《九重天劫》创作工作台' }).click();
  await page.getByTestId('standard-mode-workbench').waitFor();
  await assertVisible('第19章 破损的天门碑', 'ongoingWorkbenchShowsNextOutline');
  await assertVisible('生成本章章纲', 'ongoingWorkbenchShowsContextAction');
  const workbenchMetrics = await page.evaluate(() => {
    const left = document.querySelector('[aria-label="创作功能区"]')?.getBoundingClientRect();
    const center = document.querySelector('[data-testid="standard-mode-center-content"]')?.getBoundingClientRect();
    const right = document.querySelector('[aria-label="当前功能操作台"]')?.getBoundingClientRect();
    return {
      left: left ? { left: left.left, right: left.right, width: left.width } : null,
      center: center ? { left: center.left, right: center.right, width: center.width } : null,
      right: right ? { left: right.left, right: right.right, width: right.width } : null,
      viewportWidth: innerWidth,
      bodyWidth: document.body.scrollWidth,
    };
  });
  assert.ok(workbenchMetrics.left && workbenchMetrics.center && workbenchMetrics.right);
  assert.ok(workbenchMetrics.left.right <= workbenchMetrics.center.left + 1);
  assert.ok(workbenchMetrics.center.right <= workbenchMetrics.right.right + 1);
  assert.ok(workbenchMetrics.bodyWidth <= workbenchMetrics.viewportWidth);
  result.assertions.workbenchUsesThreeStableColumns = true;
  await capture('three-column-workbench');

  stage = 'switch ongoing unified tools';
  await page.getByRole('button', { name: '大纲设定' }).click();
  await assertVisible('小说资料', 'outlineFunctionChangesCenterContent');
  await page.getByRole('button', { name: '开始生成设定' }).click();
  await assertVisible('已执行：开始生成设定', 'outlineActionRunsInRightConsole');
  await capture('outline-console');

  stage = 'reopen ongoing professional editor';
  await page.getByRole('button', { name: '正文' }).click();
  await page.getByRole('button', { name: '打开正文页面' }).click();
  await page.getByTestId('professional-mode-editor-preview').waitFor();
  assert.match(await page.locator('textarea.xy-wa-editor-text-layer:visible').inputValue(), /天门在云海深处/);
  result.assertions.workbenchWritingFunctionUsesSameProfessionalEditor = true;

  stage = 'open new book unified workbench';
  await page.getByRole('button', { name: '返回书籍' }).click();
  await page.getByRole('button', { name: '进入《万界商途》创作工作台' }).click();
  await page.getByTestId('standard-mode-workbench').waitFor();
  await assertVisible('小说方向', 'newBookStartsAtBrainstormFunction');
  await page.getByRole('button', { name: '生成脑洞' }).click();
  await assertVisible('已执行：生成脑洞', 'newBookBrainstormActionRuns');
  await page.getByRole('button', { name: '章纲' }).click();
  await assertVisible('第19章 破损的天门碑', 'newBookCanJumpDirectlyToChapterOutline');
  const readToolStyle = (locator) =>
    locator.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        className: element.className,
        ariaCurrent: element.getAttribute('aria-current'),
        focused: document.activeElement === element,
        borderColor: style.borderColor,
        outline: style.outline,
        boxShadow: style.boxShadow,
        backgroundColor: style.backgroundColor,
      };
    });
  result.leftToolStyles = {
    brainstorm: await readToolStyle(page.getByRole('button', { name: '脑洞生成', exact: true })),
    chapterOutline: await readToolStyle(page.getByRole('button', { name: '章纲', exact: true })),
  };
  await capture('new-book-workbench');

  stage = 'open new book professional editor';
  await page.getByRole('button', { name: '正文' }).click();
  await page.getByRole('button', { name: '打开正文页面' }).click();
  await page.getByTestId('professional-mode-editor-preview').waitFor();
  assert.match(await page.locator('textarea.xy-wa-editor-text-layer:visible').inputValue(), /晨雾尚未散尽/);
  result.assertions.newBookUsesSameProfessionalEditor = true;
  await capture('new-book-professional-editor');

  const finalWindowState = await electronApp.evaluate(({ BrowserWindow }) => {
    const appWindow = BrowserWindow.getAllWindows()[0];
    return { bounds: appWindow.getBounds(), focused: appWindow.isFocused(), visible: appWindow.isVisible() };
  });
  result.finalWindow = finalWindowState;
  assert.equal(finalWindowState.focused, false);
  assert.deepEqual(result.runtimeErrors, []);
  result.status = 'PASS';
} catch (error) {
  result.status = 'FAIL';
  result.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  if (page) {
    result.failureUrl = page.url();
    result.failureBody = await page.locator('body').innerText().catch(() => '');
    await capture('failure').catch(() => {});
  }
  throw error;
} finally {
  await writeFile(resultPath, JSON.stringify(result, null, 2), 'utf8');
  if (electronApp) await electronApp.close().catch(() => {});
  await rm(userDataDir, { recursive: true, force: true });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
