import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-smart-setting-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-mode-smart-setting-flow-test');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const acceptancePort = process.env.XINYUEXIA_ACCEPTANCE_PORT;
const displayPoint = {
  x: Number(process.env.XINYUEXIA_ACCEPTANCE_DISPLAY_X),
  y: Number(process.env.XINYUEXIA_ACCEPTANCE_DISPLAY_Y),
};

assert.ok(acceptancePort, 'The isolated acceptance port is required.');
assert.ok(Number.isFinite(displayPoint.x) && Number.isFinite(displayPoint.y), 'A verified Codex display point is required.');
await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '测试板块 -> 16号测试：新建书籍与智能设定模板流程',
  window: null,
  assertions: {},
  screenshots: {},
  runtimeErrors: [],
  status: 'FAIL',
};

let electronApp;
let page;

async function capture(name) {
  const filePath = path.join(evidenceDir, `electron-${name}.png`);
  await page.screenshot({ path: filePath });
  result.screenshots[name] = filePath;
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
      XINYUEXIA_URL: `http://127.0.0.1:${acceptancePort}/#/test-collection`,
    },
    timeout: 30_000,
  });

  page = await electronApp.firstWindow({ timeout: 30_000 });
  page.on('pageerror', (error) => result.runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
      result.runtimeErrors.push(`console: ${message.text()}`);
    }
  });
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(() => {
    localStorage.setItem('xinyuexia_global_brainstorm_library_v1', JSON.stringify([
      {
        id: 'acceptance-brainstorm-xianxia',
        tab: '脑洞',
        title: '凡人杂役靠残卷问道长生',
        content: '山村少年进入宗门成为杂役，依靠古卷稳步修仙。',
        updatedAt: '2026-07-26',
      },
    ]));
  });

  result.window = await electronApp.evaluate(({ BrowserWindow, screen }, point) => {
    const appWindow = BrowserWindow.getAllWindows()[0];
    const display = screen.getDisplayNearestPoint(point);
    const { workArea } = display;
    const width = Math.min(1800, workArea.width - 32);
    const height = Math.min(1040, workArea.height - 32);
    appWindow.setBounds({
      x: workArea.x + Math.floor((workArea.width - width) / 2),
      y: workArea.y + Math.floor((workArea.height - height) / 2),
      width,
      height,
    });
    appWindow.showInactive();
    return {
      display: display.bounds,
      bounds: appWindow.getBounds(),
      visible: appWindow.isVisible(),
      focused: appWindow.isFocused(),
    };
  }, displayPoint);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  const card = page.locator('button').filter({ hasText: '新建书籍与智能设定模板流程' }).first();
  await card.scrollIntoViewIfNeeded();
  await card.click();
  await page.getByTestId('smart-setting-flow-test').waitFor();
  assert.equal(
    await page.getByRole('button', { name: '男频' }).getAttribute('aria-pressed'),
    'true',
  );
  await page.getByText('热门题材').waitFor();
  await page.getByText('小众题材').waitFor();
  await page.getByRole('button', { name: '科幻' }).waitFor();
  await page.getByRole('button', { name: '悬疑推理' }).waitFor();
  await page.getByRole('button', { name: '科幻' }).click();
  assert.equal(await page.getByRole('button', { name: '科幻' }).getAttribute('aria-pressed'), 'true');
  assert.equal(await page.getByRole('button', { name: '玄幻' }).getAttribute('aria-pressed'), 'false');
  await page.getByRole('button', { name: '女频' }).click();
  await page.getByRole('button', { name: '现代言情' }).waitFor();
  await page.getByRole('button', { name: '科幻末世' }).waitFor();
  await page.getByRole('button', { name: '宫斗宅斗' }).waitFor();
  await page.getByRole('button', { name: /从脑洞扩展/ }).click();
  await page.getByText('设定模板：').waitFor();
  await page.getByRole('button', { name: '从脑洞库选择' }).click();
  await page.getByRole('button', { name: '选择凡人杂役靠残卷问道长生' }).click();
  await capture('brainstorm-picker');
  await page.getByRole('button', { name: '确认选择' }).click();
  await page.getByText('山村少年进入宗门成为杂役，依靠古卷稳步修仙。').waitFor();
  await capture('brainstorm-selected');
  await page.getByRole('button', { name: /空白新建/ }).click();
  await page.getByRole('button', { name: '男频' }).click();
  await page.getByRole('textbox', { name: '小说名字' }).fill('万界武神');
  await page.getByRole('button', { name: '玄幻' }).click();
  await capture('book-genres');
  await page.getByRole('button', { name: '创建并继续设置' }).click();
  await page.getByText('已根据“男频＋玄幻”选择“玄幻仙侠”').waitFor();
  await page.waitForTimeout(250);

  assert.equal(await page.getByTestId('template-node-workbench').isVisible(), true);
  assert.equal(await page.getByLabel('未选择设定').isVisible(), true);
  assert.equal(await page.getByText(/当前选中：/).count(), 0);
  assert.equal(await page.getByRole('button', { name: /删除节点：/ }).count(), 0);
  assert.equal(await page.getByRole('button', { name: /新增同级/ }).count(), 0);
  await page.getByText('7 个分类').waitFor();
  await page.getByText('14 个分组').waitFor();
  await page.getByText('19 个设定').waitFor();
  await page.getByText('155 个子设定').waitFor();
  assert.equal(await page.getByRole('button', { name: '模板节点：核心设定' }).count(), 0);
  assert.equal(await page.getByRole('button', { name: '模板节点：作品定位' }).count(), 0);
  assert.equal(await page.getByRole('button', { name: '模板节点：小说类型' }).count(), 0);
  const domainNavigation = page.getByRole('navigation', { name: '设定一级分类' });
  assert.equal(await domainNavigation.getByRole('button').count(), 7);
  assert.equal(await domainNavigation.getByRole('button', { name: '作品设定' }).getAttribute('aria-pressed'), 'false');
  await capture('xuanxia-root');
  result.assertions.xuanxiaUsesProfessionalStructure = true;
  result.assertions.blankCreationDefaultsToMale = true;
  result.assertions.maleAndFemaleGenresAreAvailable = true;
  result.assertions.genresAreGroupedAndSingleSelect = true;
  result.assertions.brainstormPickerReadsLibraryAndWritesBack = true;
  result.assertions.canvasHasNoInlineDeleteOrAddControls = true;
  result.assertions.domainNavigationLimitsCanvas = true;
  result.assertions.unselectedWorkbenchStaysBlank = true;
  result.layoutMetrics = await page.evaluate(() => {
    const canvas = document.querySelector('[data-testid="mind-map-canvas"]');
    const content = canvas?.firstElementChild;
    const navigation = document.querySelector('[aria-label="设定一级分类"]');
    const work = Array.from(navigation?.querySelectorAll('button') ?? [])
      .find((button) => button.textContent?.trim() === '作品设定');
    const rect = (element) => element ? {
      x: element.getBoundingClientRect().x,
      width: element.getBoundingClientRect().width,
    } : null;
    return {
      canvas: rect(canvas),
      content: rect(content),
      navigation: rect(navigation),
      work: rect(work),
      canvasClientWidth: canvas?.clientWidth,
      contentScrollWidth: content?.scrollWidth,
      contentStyle: content?.getAttribute('style'),
      contentTransform: content ? getComputedStyle(content).transform : null,
    };
  });
  assert.ok(result.layoutMetrics.work.x >= result.layoutMetrics.navigation.x, '作品设定 should remain inside navigation');

  await domainNavigation.getByRole('button', { name: '作品设定' }).click();
  assert.equal(await domainNavigation.getByRole('button', { name: '作品设定' }).getAttribute('aria-pressed'), 'true');
  await page.getByText('当前选中：作品设定').waitFor();
  assert.equal(await page.getByRole('button', { name: '新建同级设定' }).count(), 1);
  assert.equal(await page.getByRole('button', { name: '新建下级设定' }).count(), 1);
  assert.equal(await page.getByRole('button', { name: '删除设定' }).count(), 1);
  await page.getByRole('button', { name: '模板节点：核心设定' }).waitFor();
  await page.getByRole('button', { name: '模板节点：作品定位' }).waitFor();
  const canvasBox = await page.getByTestId('mind-map-canvas').boundingBox();
  const navigationBox = await domainNavigation.boundingBox();
  const currentBox = await page.getByRole('button', { name: '模板节点：作品定位' }).boundingBox();
  assert.ok(canvasBox && navigationBox && currentBox);
  result.expandedDomainMetrics = await page.evaluate(() => {
    const canvas = document.querySelector('[data-testid="mind-map-canvas"]');
    const content = canvas?.firstElementChild;
    return {
      canvasClientWidth: canvas?.clientWidth,
      canvasClientHeight: canvas?.clientHeight,
      contentScrollWidth: content?.scrollWidth,
      contentScrollHeight: content?.scrollHeight,
      contentStyle: content?.getAttribute('style'),
    };
  });
  await capture('xuanxia-expanded-domain');
  assert.ok(currentBox.x >= canvasBox.x && currentBox.x + currentBox.width <= canvasBox.x + canvasBox.width);
  assert.equal(await page.getByRole('button', { name: '模板节点：作品定位' }).count(), 1);
  result.hierarchyLayout = await page.evaluate(() => {
    const box = (name) => {
      const node = Array.from(document.querySelectorAll('button'))
        .find((button) => button.getAttribute('aria-label') === `模板节点：${name}`);
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    };
    return {
      core: box('核心设定'),
      plot: box('剧情规划'),
      positioning: box('作品定位'),
      world: box('世界背景'),
      cultivation: box('修炼体系'),
      type: box('小说类型'),
      era: box('故事发生时代'),
      sellingPoint: box('作品卖点'),
    };
  });
  assert.ok(result.hierarchyLayout.core && result.hierarchyLayout.plot);
  assert.ok(Math.abs(result.hierarchyLayout.core.y - result.hierarchyLayout.plot.y) <= 2);
  assert.ok(result.hierarchyLayout.positioning && result.hierarchyLayout.world && result.hierarchyLayout.cultivation);
  assert.ok(Math.abs(result.hierarchyLayout.positioning.y - result.hierarchyLayout.world.y) <= 2);
  assert.ok(Math.abs(result.hierarchyLayout.world.y - result.hierarchyLayout.cultivation.y) <= 2);
  assert.ok(result.hierarchyLayout.type && result.hierarchyLayout.era && result.hierarchyLayout.sellingPoint);
  assert.ok(Math.abs(result.hierarchyLayout.type.x - result.hierarchyLayout.era.x) <= 2);
  assert.ok(result.hierarchyLayout.type.y < result.hierarchyLayout.era.y);
  assert.ok(result.hierarchyLayout.era.y < result.hierarchyLayout.sellingPoint.y);
  result.assertions.groupsAndEntriesAreHorizontalWhileFieldsStayVertical = true;

  const dragTarget = await page.getByTestId('mind-map-canvas').evaluate((canvas) => {
    const rect = canvas.getBoundingClientRect();
    const candidates = [
      { x: rect.left + 24, y: rect.bottom - 36 },
      { x: rect.right - 100, y: rect.bottom - 80 },
      { x: rect.left + 40, y: rect.top + rect.height / 2 },
    ];
    return candidates.find(({ x, y }) => {
      const target = document.elementFromPoint(x, y);
      return target && canvas.contains(target) && !target.closest('[data-canvas-control="true"]');
    });
  });
  assert.ok(dragTarget);
  const transformBeforeDrag = await page.getByTestId('mind-map-canvas').locator(':scope > div').getAttribute('style');
  await page.mouse.move(dragTarget.x, dragTarget.y);
  await page.mouse.down();
  await page.mouse.move(dragTarget.x + 70, dragTarget.y + 45, { steps: 5 });
  await page.mouse.up();
  const transformAfterDrag = await page.getByTestId('mind-map-canvas').locator(':scope > div').getAttribute('style');
  assert.notEqual(transformAfterDrag, transformBeforeDrag);
  assert.equal(await page.evaluate(() => window.getSelection()?.toString() ?? ''), '');
  result.assertions.canvasDragDoesNotSelectText = true;
  await capture('xuanxia-branch');
  result.assertions.domainSelectionShowsAllSettingEntries = true;
  result.assertions.selectedPathStaysInsideCanvas = true;

  await page.getByRole('button', { name: '模板节点：作品定位' }).click();
  await page.getByRole('button', { name: '模板节点：小说类型' }).waitFor();
  assert.equal(await page.getByRole('button', { name: '模板节点：剧情规划' }).count(), 1);
  assert.equal(await page.getByRole('button', { name: '模板节点：整体剧情' }).count(), 1);
  await page.getByRole('button', { name: '模板节点：小说类型' }).click();
  await page.getByText('设定 > 作品设定 > 核心设定 > 作品定位 > 小说类型').waitFor();
  assert.equal(await page.getByRole('button', { name: '模板节点：整体剧情' }).count(), 1);
  await capture('xuanxia-entry-fields');
  result.assertions.entryFieldsUseCompactList = true;
  result.assertions.nodeSelectionKeepsSiblingSettingsVisible = true;
  await page.getByRole('button', { name: '选择内置模板：都市（无修炼）' }).click();
  assert.equal(await page.getByRole('navigation', { name: '设定一级分类' }).getByRole('button', { name: '怪物图鉴' }).count(), 0);
  await page.getByRole('navigation', { name: '设定一级分类' }).getByRole('button', { name: '作品设定' }).click();
  assert.equal(await page.getByRole('button', { name: '模板节点：修炼体系' }).count(), 0);
  await capture('urban-no-cultivation');
  result.assertions.noCultivationTemplateHasNoCultivationTree = true;

  await page.getByRole('button', { name: '选择内置模板：都市（有修炼）' }).click();
  assert.ok(await page.getByRole('navigation', { name: '设定一级分类' }).getByRole('button', { name: '怪物图鉴' }).count() > 0);
  await page.getByRole('navigation', { name: '设定一级分类' }).getByRole('button', { name: '作品设定' }).click();
  await page.getByRole('button', { name: '模板节点：修炼体系' }).waitFor();
  await capture('urban-cultivation');
  result.assertions.cultivationTemplateAddsCultivationTree = true;

  const shellLayout = await page.getByTestId('smart-setting-flow-test').evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  assert.ok(shellLayout.scrollWidth <= shellLayout.clientWidth);
  assert.ok(shellLayout.scrollHeight <= shellLayout.clientHeight);
  assert.deepEqual(result.runtimeErrors, []);
  result.assertions.noPageOverflow = true;
  result.status = 'PASS';
} catch (error) {
  result.error = error instanceof Error ? error.stack : String(error);
  if (page) {
    result.failureUrl = page.url();
    await capture('failure').catch(() => undefined);
  }
  throw error;
} finally {
  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  await electronApp?.close().catch(() => undefined);
  await rm(userDataDir, { recursive: true, force: true });
}

console.log(JSON.stringify(result, null, 2));
