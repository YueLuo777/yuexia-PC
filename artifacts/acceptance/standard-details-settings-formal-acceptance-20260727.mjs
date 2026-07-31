import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-details-settings-formal');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-standard-details-settings-'));
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '4177';
await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '标准模式书籍 -> 进入工作台 -> 作品详情 -> 一键检测 -> 作品设定 -> 更换设定模板 -> 审核剧情',
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
    target.showInactive();
    return {
      secondaryAvailable: true,
      primary: primary.bounds,
      display: secondary.bounds,
      bounds: target.getBounds(),
      visible: target.isVisible(),
      focused: target.isFocused(),
    };
  });
  assert.equal(result.window.secondaryAvailable, true);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  await page.evaluate(() => {
    const novel = {
      id: 971,
      title: '星海问道',
      type: 'novel',
      category: '玄幻',
      channel: 'male',
      synopsis: '',
      creationStatus: 'serializing',
      targetWordCount: 1_000_000,
      wordCount: 2680,
      cover: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22800%22%3E%3Crect width=%22600%22 height=%22800%22 fill=%22%230b2447%22/%3E%3C/svg%3E',
      createdAt: '2026/7/27',
      lastModifiedAt: '2026/7/27',
    };
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([novel]));
    localStorage.setItem('xinyuexia_current_novel_id', '971');
    localStorage.setItem('xinyuexia_volumes_v1', JSON.stringify({
      971: [{
        id: 972,
        name: '第一卷',
        isExpanded: true,
        chapters: [
          { id: 973, title: '星门初启', serialNumber: 1, wordCount: 1280, isSelected: true, isPublished: false },
          { id: 974, title: '夜探禁地', serialNumber: 2, wordCount: 1400, isSelected: false, isPublished: false },
        ],
      }],
    }));
    localStorage.setItem('xinyuexia_novel_971_chapter_973', '夜色中的星门第一次亮起。');
    localStorage.setItem('xinyuexia_novel_971_chapter_974', '少年踏入禁地，听见远古剑鸣。');
  });
  await page.reload();
  await page.getByTestId('standard-mode-novel-card').waitFor();
  await page.getByRole('button', { name: '进入工作台' }).click();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor();

  stage = 'formal work details';
  const details = page.locator('[data-standard-work-details-page="true"]');
  await details.waitFor();
  assert.equal(await details.getAttribute('data-standard-work-details-layout'), 'three-column-inspection');
  assert.equal(await page.getByText('正文章节', { exact: true }).count(), 0);
  assert.equal(await page.getByText('历史封面', { exact: true }).count(), 1);
  assert.equal(await page.locator('[data-work-cover-history="true"]').count(), 0);
  assert.equal(await page.getByText('软件默认封面', { exact: true }).count(), 1);
  assert.equal(await page.locator('[data-software-default-covers="true"] button').count(), 7);
  assert.equal(await page.getByText('作品检测', { exact: true }).count(), 1);
  assert.equal(await page.getByRole('button', { name: '星海问道', exact: true }).getAttribute('data-title-width-characters'), '4');
  const detailsGeometry = await details.evaluate((element) => {
    const children = [...element.children];
    const rects = children.map((child) => {
      const rect = child.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
    });
    return {
      childCount: children.length,
      rects,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
    };
  });
  assert.equal(detailsGeometry.childCount, 3);
  assert.ok(detailsGeometry.rects[0].right <= detailsGeometry.rects[1].left + 1);
  assert.ok(detailsGeometry.rects[1].right <= detailsGeometry.rects[2].left + 1);
  assert.ok(detailsGeometry.scrollWidth <= detailsGeometry.clientWidth);
  assert.ok(detailsGeometry.scrollHeight <= detailsGeometry.clientHeight);
  const formGeometry = await page.locator('[data-work-details-aligned-grid="true"]').evaluate((grid) => {
    const fields = [...grid.children].map((field) => {
      const rect = field.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
    });
    return { fields };
  });
  assert.equal(formGeometry.fields.length, 6);
  const [title, genre, channel, length, status, time] = formGeometry.fields;
  assert.ok(Math.abs(title.width - genre.width) <= 1);
  assert.ok(formGeometry.fields.every((field) => Math.abs(field.width - title.width) <= 1));
  assert.ok(Math.abs(title.top - genre.top) <= 1);
  assert.ok(Math.abs(channel.top - length.top) <= 1);
  assert.ok(Math.abs(status.top - time.top) <= 1);
  assert.ok(Math.abs(title.left - channel.left) <= 1 && Math.abs(channel.left - status.left) <= 1);
  assert.ok(Math.abs(genre.right - length.right) <= 1 && Math.abs(length.right - time.right) <= 1);
  const synopsisGeometry = await page.getByLabel('作品简介').evaluate((element) => ({
    rectHeight: element.getBoundingClientRect().height,
    computedHeight: getComputedStyle(element).height,
    className: element.className,
  }));
  assert.match(synopsisGeometry.className, /h-\[240px\]/);
  assert.ok(synopsisGeometry.rectHeight >= 235 && synopsisGeometry.rectHeight <= 270);
  result.assertions.workDetailsUsesThreeColumnsWithoutOldChapterBlock = true;
  result.assertions.coverHistoryStartsEmptyAndSoftwareDefaultsAreSeparate = true;
  result.assertions.workDetailsUsesThreeAlignedEqualWidthRows = true;
  result.assertions.synopsisIsLimitedTo240CssPixels = synopsisGeometry;
  result.assertions.shortTitleUsesAdaptiveCapsule = true;
  await capture('01-work-details-three-columns');

  await page.getByRole('button', { name: '使用软件默认封面：普通1号封面' }).click();
  await page.getByRole('button', { name: '保存修改' }).click();
  await page.getByRole('status').filter({ hasText: '作品资料已保存' }).waitFor();
  assert.equal(await page.locator('[data-work-cover-history="true"] button').count(), 1);
  assert.equal(await page.getByRole('button', { name: '使用历史封面1' }).count(), 1);
  assert.equal(await page.locator('[data-software-default-covers="true"] button').count(), 7);
  result.assertions.replacedSavedCoverMovesIntoHistoryWithoutMixingDefaults = true;
  await capture('01b-cover-history-and-software-defaults');

  await page.getByRole('button', { name: '一键检测' }).click();
  assert.equal(await page.getByText('尚未填写作品简介', { exact: true }).count(), 1);
  assert.equal(await page.getByText('尚未创建作品设定', { exact: true }).count(), 1);
  assert.equal(await page.getByText('当前有 2 章正文尚未审核', { exact: true }).count(), 1);
  await page.getByRole('button', { name: '去填写' }).click();
  assert.equal(await page.getByLabel('作品简介').evaluate((element) => document.activeElement === element), true);
  result.assertions.inspectionUsesRealSynopsisSettingsAndAuditCounts = true;
  await capture('02-work-detection');

  await page.getByLabel('作品名称').fill('星海问道之万界归航篇');
  await page.getByLabel('作品简介').fill('少年沿星门追查文明断层，并阻止万界归航。');
  await page.getByRole('button', { name: '保存修改' }).click();
  await page.getByRole('status').filter({ hasText: '作品资料已保存' }).waitFor();
  assert.equal(await page.getByRole('button', { name: '星海问道之万界归航篇', exact: true }).getAttribute('data-title-width-characters'), '10');
  await page.reload();
  await details.waitFor();
  assert.equal(await page.getByLabel('作品简介').inputValue(), '少年沿星门追查文明断层，并阻止万界归航。');
  result.assertions.workDetailsPersistAfterReload = true;
  result.assertions.longTitleExpandsTheCapsule = true;

  stage = 'create and edit formal settings';
  await page.getByRole('button', { name: '开始设定' }).click();
  await page.getByRole('button', { name: '确认模板并创建设定' }).click();
  await page.locator('[data-standard-mode-setting-page="true"]').waitFor();
  assert.equal(await page.getByRole('button', { name: '作品设定', exact: true }).count(), 1);
  assert.equal(await page.getByRole('button', { name: '更换设定模板', exact: true }).count(), 2);
  assert.equal(await page.locator('[data-standard-setting-editor-style="normal-form"]').count(), 1);
  assert.equal(await page.getByRole('navigation', { name: '设定目录' }).count(), 1);
  await page.getByLabel('小说类型').fill('东方玄幻');
  const fieldGeometry = await page.locator('[data-standard-setting-editor-style="normal-form"]').evaluate((editor) => {
    const fields = [...editor.querySelectorAll('textarea')].slice(0, 4).map((field) => {
      const rect = field.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, height: rect.height };
    });
    return { fields };
  });
  assert.ok(fieldGeometry.fields.length >= 2);
  const firstFieldHeight = fieldGeometry.fields[0].height;
  assert.ok(firstFieldHeight >= 100 && firstFieldHeight <= 180);
  assert.ok(fieldGeometry.fields.every((field) => Math.abs(field.height - firstFieldHeight) <= 1));
  assert.ok(fieldGeometry.fields[0].right <= fieldGeometry.fields[1].left + 1 || fieldGeometry.fields[0].bottom <= fieldGeometry.fields[1].top + 1);
  result.assertions.settingSidebarIsPreservedAndMiddleUsesNormalTwoColumnFields = true;
  await capture('03-formal-settings-normal-fields');

  stage = 'safe template replacement dialog';
  await page.getByRole('button', { name: '更换设定模板', exact: true }).first().click();
  const dialog = page.getByRole('dialog', { name: '更换设定模板？' });
  await dialog.waitFor();
  const retain = page.getByRole('button', { name: '保留现有设定' });
  const proceed = page.getByRole('button', { name: '继续选择模板' });
  const close = dialog.getByLabel('关闭', { exact: true });
  const dialogStyles = {
    retain: await retain.evaluate((element) => ({ background: getComputedStyle(element).backgroundColor, color: getComputedStyle(element).color })),
    proceed: await proceed.evaluate((element) => ({ background: getComputedStyle(element).backgroundColor, color: getComputedStyle(element).color, border: getComputedStyle(element).borderColor })),
    close: await close.evaluate((element) => ({ width: getComputedStyle(element).width, height: getComputedStyle(element).height, title: element.getAttribute('title') })),
    focusedText: await page.evaluate(() => document.activeElement?.textContent?.trim() ?? ''),
  };
  assert.deepEqual(dialogStyles.retain, { background: 'rgb(8, 170, 206)', color: 'rgb(255, 255, 255)' });
  assert.deepEqual(dialogStyles.proceed, { background: 'rgb(255, 255, 255)', color: 'rgb(220, 38, 38)', border: 'rgb(252, 165, 165)' });
  assert.deepEqual(dialogStyles.close, { width: '32px', height: '32px', title: '关闭' });
  assert.equal(dialogStyles.focusedText, '保留现有设定');
  await capture('04-safe-template-dialog');
  await close.click();
  await dialog.waitFor({ state: 'detached' });
  assert.equal(await page.getByLabel('小说类型').inputValue(), '东方玄幻');

  await page.getByRole('button', { name: '更换设定模板', exact: true }).first().click();
  await retain.click();
  assert.equal(await page.getByLabel('小说类型').inputValue(), '东方玄幻');

  await page.getByRole('button', { name: '更换设定模板', exact: true }).first().click();
  await proceed.click();
  await page.getByRole('button', { name: '返回设定列表' }).waitFor();
  assert.equal(await page.getByText(/现有设定内容会重新创建/).count(), 1);
  await page.getByRole('button', { name: '返回设定列表' }).click();
  assert.equal(await page.getByLabel('小说类型').inputValue(), '东方玄幻');
  result.assertions.safeActionIsPrimaryFocusedAndAllCancelPathsRetainSettings = true;
  result.assertions.closeButtonUsesTheSharedModalHeader = true;

  stage = 'inspection quick jump to audit';
  await page.getByRole('button', { name: '作品详情', exact: true }).click();
  await page.getByRole('button', { name: '一键检测' }).click();
  await page.getByRole('button', { name: '去审核' }).click();
  await page.getByText('第1章 章纲', { exact: true }).waitFor();
  await page.getByText('第1章 原文', { exact: true }).waitFor();
  await page.getByText('第1章 剧情审核', { exact: true }).waitFor();
  result.assertions.auditQuickActionUsesTheSharedFormalAuditPage = true;
  await capture('05-shared-audit-page');

  assert.deepEqual(result.runtimeErrors, []);
  result.finalWindow = await app.evaluate(({ BrowserWindow }) => {
    const target = BrowserWindow.getAllWindows()[0];
    return { visible: target.isVisible(), focused: target.isFocused(), bounds: target.getBounds() };
  });
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
