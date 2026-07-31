import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-project-progress-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-mode-project-progress-test');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '5186';

await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '测试板块 -> 25号测试 -> 标准模式项目进度与功能取舍',
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
      XINYUEXIA_URL: `http://127.0.0.1:${port}/#/test-collection`,
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
    target.webContents.setZoomFactor(1.1);
    target.showInactive();
    return {
      secondaryAvailable: true,
      bounds: target.getBounds(),
      display: secondary.bounds,
      visible: target.isVisible(),
      focused: target.isFocused(),
      zoomFactor: target.webContents.getZoomFactor(),
    };
  });
  assert.equal(result.window.secondaryAvailable, true);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);
  assert.ok(Math.abs(result.window.zoomFactor - 1.1) < 0.01);

  await page.evaluate(() => {
    localStorage.setItem('xinyuexia_test_collection_tested_paths_v1', JSON.stringify([]));
    localStorage.removeItem('xinyuexia_standard_mode_project_progress_decisions_v1');
    localStorage.removeItem('xinyuexia_standard_mode_project_progress_selected_v1');
  });
  await page.reload();

  stage = 'open test 25';
  const search = page.getByPlaceholder('搜索测试内容');
  await search.waitFor({ timeout: 30_000 });
  await search.fill('项目进度与功能取舍');
  const testCard = page.getByRole('button', { name: /标准模式项目进度与功能取舍/ });
  await testCard.waitFor();
  assert.match(await testCard.innerText(), /25/);
  result.assertions.testSerialIsMonotonic25 = true;
  await capture('01-test-25-entry');
  await testCard.click();

  stage = 'inspect functional groups';
  const board = page.locator('[data-standard-project-progress-test="true"]');
  await board.waitFor({ timeout: 30_000 });
  const expectedGroups = ['作品与工作台', '准备阶段', '设定阶段', '章纲流程', '正文流程', '检查阶段', '稳定性与增强功能'];
  const groupTitles = await board.locator('section > header h2').allTextContents();
  assert.deepEqual(groupTitles, expectedGroups);
  await page.getByLabel(/推荐程度：5星，强烈推荐/).first().waitFor();
  await page.getByText(/已完成 \d+/).first().waitFor();
  await page.getByText(/部分完成 \d+/).first().waitFor();
  await page.getByText(/未完成 \d+/).first().waitFor();
  result.assertions.itemsAreOrderedByFunctionalGroup = true;
  result.assertions.statusAndRecommendationAreVisible = true;
  await capture('02-functional-progress-board');

  stage = 'filter and decide';
  await page.getByRole('button', { name: /^未完成 \d+$/ }).click();
  await page.getByRole('heading', { name: '生成章纲前智能关联' }).waitFor();
  assert.equal(await page.getByRole('heading', { name: '生成脑洞' }).count(), 0);
  await page.getByRole('button', { name: /^全部 \d+$/ }).click();
  const smartAssociationRow = page.getByRole('heading', { name: '生成章纲前智能关联' }).locator('..').locator('..');
  await smartAssociationRow.getByRole('button', { name: '勾选功能：生成章纲前智能关联' }).click();
  await smartAssociationRow.getByRole('button', { name: '要做' }).click();
  await page.getByRole('button', { name: '复制已勾选（1）' }).waitFor();
  const persisted = await page.evaluate(() => ({
    decisions: localStorage.getItem('xinyuexia_standard_mode_project_progress_decisions_v1'),
    selected: localStorage.getItem('xinyuexia_standard_mode_project_progress_selected_v1'),
  }));
  assert.match(persisted.decisions ?? '', /outline-smart-association/);
  assert.match(persisted.decisions ?? '', /"do"/);
  assert.match(persisted.selected ?? '', /outline-smart-association/);
  await page.getByRole('button', { name: '复制已勾选（1）' }).click();
  await page.getByRole('status').getByText('已复制', { exact: true }).waitFor();
  result.assertions.statusFilterWorksWithoutReorderingGroups = true;
  result.assertions.selectionAndDecisionPersist = true;
  result.assertions.selectedListCanBeCopied = true;

  const geometry = await board.evaluate((element) => {
    const scroller = element.querySelector('.overflow-auto');
    const selectedRow = Array.from(element.querySelectorAll('article')).find((row) =>
      row.querySelector('h3')?.textContent === '生成章纲前智能关联',
    );
    const decisionButtons = selectedRow?.querySelectorAll('button');
    const lastDecisionButton = decisionButtons?.[decisionButtons.length - 1];
    const scrollerRect = scroller.getBoundingClientRect();
    const rowRect = selectedRow.getBoundingClientRect();
    const decisionRect = lastDecisionButton.getBoundingClientRect();
    return {
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      scroller: { clientWidth: scroller.clientWidth, scrollWidth: scroller.scrollWidth, left: scrollerRect.left, right: scrollerRect.right },
      selectedRow: { left: rowRect.left, right: rowRect.right, width: rowRect.width },
      lastDecisionButton: { left: decisionRect.left, right: decisionRect.right, width: decisionRect.width },
      viewportWidth: window.innerWidth,
      overflowingRows: Array.from(element.querySelectorAll('article'))
        .filter((row) => row.scrollWidth > row.clientWidth + 1)
        .map((row) => row.querySelector('h3')?.textContent),
    };
  });
  assert.ok(geometry.scrollWidth <= geometry.clientWidth);
  assert.ok(geometry.scroller.scrollWidth <= geometry.scroller.clientWidth);
  assert.ok(geometry.lastDecisionButton.right <= geometry.scroller.right + 1);
  assert.deepEqual(geometry.overflowingRows, []);
  result.geometry = geometry;
  result.assertions.noUnexpectedHorizontalOverflow = true;
  await smartAssociationRow.scrollIntoViewIfNeeded();
  await capture('03-selected-smart-association');

  stage = 'reload persisted decision';
  await page.reload();
  const reloadedSearch = page.getByPlaceholder('搜索测试内容');
  await reloadedSearch.waitFor({ timeout: 30_000 });
  await reloadedSearch.fill('项目进度与功能取舍');
  await page.getByRole('button', { name: /标准模式项目进度与功能取舍/ }).click();
  const reloadedRow = page.getByRole('heading', { name: '生成章纲前智能关联' }).locator('..').locator('..');
  assert.equal(await reloadedRow.getByRole('button', { name: '勾选功能：生成章纲前智能关联' }).getAttribute('aria-pressed'), 'true');
  assert.equal(await reloadedRow.getByRole('button', { name: '要做' }).getAttribute('aria-pressed'), 'true');
  result.assertions.selectionAndDecisionSurviveReload = true;

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
