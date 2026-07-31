import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-compact-navigation-formal-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-opening-stage-navigation');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '5197';

await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '作品概览 -> 标准模式书籍 -> 进入工作台',
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
      bounds: target.getBounds(),
      display: secondary.bounds,
      visible: target.isVisible(),
      focused: target.isFocused(),
    };
  });
  assert.equal(result.window.secondaryAvailable, true);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  await page.evaluate(() => {
    const novel = {
      id: 998,
      title: '导航验收作品',
      type: 'novel',
      category: '玄幻',
      channel: 'male',
      wordCount: 1200,
      createdAt: '2026/7/28',
      lastModifiedAt: '2026/7/28',
    };
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([novel]));
    localStorage.setItem('xinyuexia_current_novel_id', '998');
    localStorage.setItem('xinyuexia_volumes_v1', JSON.stringify({ 998: [] }));
    localStorage.setItem('xinyuexia_workbench_settings_998', JSON.stringify([{
      id: 'navigation-setting',
      tab: '大纲',
      title: '作品定位',
      content: JSON.stringify({ type: '核心设定', body: '【小说类型】：\n东方玄幻' }),
      updatedAt: '2026/7/28',
    }]));
  });
  await page.goto(`http://127.0.0.1:${port}/#/workbench`);
  const workbench = page.locator('[data-standard-mode-workbench="true"]');
  await workbench.waitFor({ timeout: 30_000 });

  stage = 'inspect opening stage navigation';
  const header = workbench.getByRole('banner');
  const navigation = header.getByRole('navigation', { name: '标准模式创作导航' });
  const labels = ['作品详情', '脑洞库', '生成脑洞', '作品设定', '更换设定模板', '生成章纲', '生成正文', '审核剧情', '更新状态', '生成梗概'];
  for (const label of labels) await navigation.getByRole('button', { name: label, exact: true }).waitFor();
  await navigation.getByRole('button', { name: /开书阶段.*导航验收作品/ }).waitFor();

  const metrics = await navigation.evaluate((element) => {
    const leftStages = element.querySelector('[data-stage-flow-half="before-center"]');
    const rightStages = element.querySelector('[data-stage-flow-half="after-center"]');
    const centerArrow = element.querySelector(':scope > [data-stage-flow-arrow="true"]');
    const stageCards = Array.from(element.querySelectorAll(':scope > div > section'));
    const navigationRect = element.getBoundingClientRect();
    const leftRect = leftStages.getBoundingClientRect();
    const rightRect = rightStages.getBoundingClientRect();
    const centerArrowRect = centerArrow.getBoundingClientRect();
    return {
      navigationCenter: navigationRect.left + navigationRect.width / 2,
      headerHeight: element.closest('header').clientHeight,
      stageGapCenter: (leftRect.right + rightRect.left) / 2,
      stageGap: rightRect.left - leftRect.right,
      centerArrowCenter: centerArrowRect.left + centerArrowRect.width / 2,
      flowArrowCount: element.querySelectorAll('[data-stage-flow-arrow="true"]').length,
      stageCardBorders: stageCards.map((card) => ({
        bottom: card.getBoundingClientRect().bottom,
        navigationBottom: navigationRect.bottom,
        borderBottomWidth: getComputedStyle(card).borderBottomWidth,
      })),
      buttonWidths: Array.from(element.querySelectorAll('button')).map((button) => ({
        text: button.textContent?.trim(),
        width: button.getBoundingClientRect().width,
      })),
      openingStageActionCount: stageCards[0].querySelectorAll(':scope > div > button').length,
      openingStageActions: Array.from(stageCards[0].querySelectorAll(':scope > div > button')).map((button) => button.textContent?.trim()),
      openingTitle: stageCards[0].querySelector('[data-opening-stage-title="true"]')?.textContent?.trim(),
      legacyTitleCapsuleCount: element.closest('header').querySelectorAll('.xy-capsule-group').length,
    };
  });
  result.metrics = metrics;
  assert.ok(Math.abs(metrics.navigationCenter - metrics.stageGapCenter) <= 1);
  assert.ok(Math.abs(metrics.navigationCenter - metrics.centerArrowCenter) <= 1);
  assert.ok(metrics.stageGap >= 24);
  assert.equal(metrics.flowArrowCount, 3);
  assert.ok(metrics.stageCardBorders.every((card) => Number.parseFloat(card.borderBottomWidth) >= 0.5 && card.bottom <= card.navigationBottom - 0.5));
  assert.ok(metrics.buttonWidths.filter((item) => labels.includes(item.text)).every((item) => item.width < 140));
  assert.ok(metrics.headerHeight >= 75 && metrics.headerHeight <= 76);
  assert.equal(metrics.openingStageActionCount, 3);
  assert.deepEqual(metrics.openingStageActions, ['作品详情', '生成脑洞', '脑洞库']);
  assert.equal(metrics.openingTitle, '导航验收作品');
  assert.equal(metrics.legacyTitleCapsuleCount, 0);
  result.assertions.allTenActionsVisible = true;
  result.assertions.contentWidthActions = true;
  result.assertions.settingsCreationGapCentered = true;
  result.assertions.allStageBottomBordersVisible = true;
  result.assertions.stageFlowArrowsVisible = true;
  result.assertions.openingStageContainsTitleDetailsAndBrainstormActions = true;
  result.assertions.navigationHeightRemains76 = true;
  await capture('01-opening-stage-navigation');

  stage = 'exercise renamed creation actions';
  const outlineButton = navigation.getByRole('button', { name: '生成章纲', exact: true });
  await outlineButton.click();
  await page.locator('[data-workbench-flow="chapterOutline"]').waitFor();
  assert.equal(await outlineButton.getAttribute('aria-current'), 'page');

  const writingButton = navigation.getByRole('button', { name: '生成正文', exact: true });
  await writingButton.click();
  await page.locator('[data-workbench-flow="writing"]').waitFor();
  assert.equal(await writingButton.getAttribute('aria-current'), 'page');

  const brainstormButton = navigation.getByRole('button', { name: '脑洞库', exact: true });
  await brainstormButton.click();
  await page.locator('[data-standard-mode-brainstorm-page="true"]').waitFor();
  assert.equal(await brainstormButton.getAttribute('aria-current'), 'page');
  const detailsButton = navigation.getByRole('button', { name: '作品详情', exact: true });
  await detailsButton.click();
  await page.locator('[data-standard-work-details-page="true"]').waitFor();
  assert.equal(await detailsButton.getAttribute('aria-current'), 'page');
  result.assertions.renamedCreationActionsRouteCorrectly = true;
  result.assertions.crossStageActionIsOneClick = true;
  result.assertions.openingStageDetailsRouteCorrectly = true;
  await capture('02-opening-stage-details-selected');

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
