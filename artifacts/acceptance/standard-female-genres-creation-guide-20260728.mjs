import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-female-guide-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-female-genres-creation-guide');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '5186';

await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '作品概览 -> 新建小说 -> 女频题材 -> 创建书籍 -> 进入工作台 -> 作品详情 -> 创作向导',
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
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([]));
    localStorage.setItem('xinyuexia_volumes_v1', JSON.stringify({}));
    localStorage.removeItem('xinyuexia_current_novel_id');
  });
  await page.reload();
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });

  stage = 'create female novel';
  await page.getByRole('button', { name: '新建小说' }).first().click();
  const dialog = page.getByRole('dialog', { name: '新建小说' });
  await dialog.waitFor();
  await dialog.getByRole('button', { name: '女频' }).click();
  const genreSelect = dialog.getByLabel('作品题材');
  const femaleOptions = await genreSelect.locator('option').allTextContents();
  for (const expected of ['总裁', '甜宠', '现代言情', '古代言情', '宫斗宅斗']) {
    assert.ok(femaleOptions.includes(expected));
  }
  for (const maleOnly of ['玄幻', '仙侠', '武侠']) {
    assert.equal(femaleOptions.includes(maleOnly), false);
  }
  await genreSelect.selectOption({ label: '古代言情' });
  await dialog.getByRole('textbox').first().fill('女频流程验收作品');
  result.assertions.femaleChannelUsesFemaleGenresOnly = true;
  await capture('01-female-genres');
  await dialog.getByRole('button', { name: '确认' }).click();

  const card = page.getByTestId('standard-mode-novel-card');
  await card.waitFor();
  const storedNovel = await page.evaluate(() => {
    const novels = JSON.parse(localStorage.getItem('xinyuexia_novels_v1') ?? '[]');
    return novels.find((item) => item.title === '女频流程验收作品');
  });
  assert.equal(storedNovel.channel, 'female');
  assert.equal(storedNovel.category, '古代言情');
  result.assertions.createdFemaleNovelPersistsChannelAndGenre = true;

  await card.getByRole('button', { name: '进入工作台' }).click();
  const details = page.locator('[data-standard-work-details-page="true"]');
  await details.waitFor({ timeout: 30_000 });

  stage = 'inspect work details and guide';
  assert.equal(await details.getAttribute('data-standard-work-details-layout'), 'three-column-guide');
  assert.equal(await page.getByText('作品检测', { exact: true }).count(), 0);
  assert.equal(await page.getByRole('button', { name: '一键检测' }).count(), 0);
  const guide = page.locator('[data-standard-creation-guide="true"]');
  await guide.waitFor();
  for (const label of ['准备脑洞', '建立设定', '生成章纲', '生成正文', '完成检查']) {
    await guide.getByText(label, { exact: true }).first().waitFor();
  }
  await guide.getByText('审核剧情、更新状态并生成梗概', { exact: true }).waitFor();

  const geometry = await details.evaluate((element) => {
    const [, center, guidePanel] = Array.from(element.children);
    const grid = element.querySelector('[data-work-details-aligned-grid="true"]');
    const synopsis = element.querySelector('[aria-label="作品简介"]');
    const saveButton = Array.from(element.querySelectorAll('button')).find((button) => button.textContent?.trim() === '保存修改');
    const centerRect = center.getBoundingClientRect();
    const guideRect = guidePanel.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    const synopsisRect = synopsis.getBoundingClientRect();
    const saveRect = saveButton.getBoundingClientRect();
    const centerStyle = getComputedStyle(center);
    const guideOverflowingElements = Array.from(guidePanel.querySelectorAll('*'))
      .filter((child) => child.scrollWidth > child.clientWidth + 1)
      .map((child) => ({ text: child.textContent?.trim(), clientWidth: child.clientWidth, scrollWidth: child.scrollWidth }));
    return {
      centerRect: { left: centerRect.left, right: centerRect.right, top: centerRect.top, bottom: centerRect.bottom, width: centerRect.width },
      guideRect: { left: guideRect.left, right: guideRect.right, width: guideRect.width },
      gridRect: { left: gridRect.left, right: gridRect.right, width: gridRect.width },
      synopsisRect: { left: synopsisRect.left, right: synopsisRect.right, height: synopsisRect.height },
      saveRect: { right: saveRect.right, bottom: saveRect.bottom },
      centerPaddingLeft: Number.parseFloat(centerStyle.paddingLeft),
      centerPaddingRight: Number.parseFloat(centerStyle.paddingRight),
      guideOverflowingElements,
      layout: { clientWidth: element.clientWidth, scrollWidth: element.scrollWidth, clientHeight: element.clientHeight, scrollHeight: element.scrollHeight },
    };
  });
  result.geometry = geometry;
  const usableCenterWidth = geometry.centerRect.width - geometry.centerPaddingLeft - geometry.centerPaddingRight;
  assert.ok(geometry.gridRect.width >= usableCenterWidth - 24);
  assert.ok(Math.abs(geometry.gridRect.left - geometry.synopsisRect.left) <= 1);
  assert.ok(Math.abs(geometry.gridRect.right - geometry.synopsisRect.right) <= 1);
  assert.ok(geometry.synopsisRect.height >= 300);
  assert.ok(geometry.centerRect.bottom - geometry.saveRect.bottom <= 30);
  assert.ok(geometry.layout.scrollWidth <= geometry.layout.clientWidth);
  assert.ok(geometry.layout.scrollHeight <= geometry.layout.clientHeight);
  assert.deepEqual(geometry.guideOverflowingElements, []);
  result.assertions.creationGuideReplacesInspection = true;
  result.assertions.workDetailsFillAvailableMiddleArea = true;
  result.assertions.noUnexpectedPageOverflow = true;
  await capture('02-work-details-creation-guide');

  stage = 'save and reload details';
  await page.getByLabel('作品简介').fill('女主在古代家族困局中寻找真相并掌握自己的命运。');
  await page.getByRole('button', { name: '保存修改' }).click();
  await page.reload();
  await details.waitFor({ timeout: 30_000 });
  assert.equal(await page.getByLabel('作品简介').inputValue(), '女主在古代家族困局中寻找真相并掌握自己的命运。');
  result.assertions.workDetailsPersistAfterReload = true;

  stage = 'guide direct navigation';
  const reloadedGuide = page.locator('[data-standard-creation-guide="true"]');
  await reloadedGuide.getByRole('button', { name: '生成章纲' }).click();
  await page.locator('[data-workbench-flow="chapterOutline"]').waitFor();
  result.assertions.guideOpensFormalOutlineInOneClick = true;
  await capture('03-guide-opens-outline');

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
