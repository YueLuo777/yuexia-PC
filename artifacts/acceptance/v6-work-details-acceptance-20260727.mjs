import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const evidenceDir = path.join(repoRoot, 'artifacts', 'v6-work-details');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-v6-work-details-'));
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '4175';
await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '标准模式书籍 -> 进入工作台 -> 专业模式同款作品详情入口 -> 内容定宽表单 -> 指定章节正文 -> 保存并刷新 -> 较小窗口检查',
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
      id: 951,
      title: '星海问道',
      type: 'novel',
      category: '玄幻',
      channel: 'male',
      synopsis: '少年追查星海文明断层。',
      wordCount: 1280,
      createdAt: '2026/7/27',
      lastModifiedAt: '2026/7/27',
    };
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([novel]));
    localStorage.setItem('xinyuexia_current_novel_id', '951');
    localStorage.setItem('xinyuexia_volumes_v1', JSON.stringify({
      951: [{
        id: 952,
        name: '第一卷',
        isExpanded: true,
        chapters: [
          { id: 953, title: '星门初启', serialNumber: 1, wordCount: 1280, isSelected: true, isPublished: false },
          { id: 954, title: '夜探禁地', serialNumber: 2, wordCount: 0, isSelected: false, isPublished: false },
          { id: 955, title: '剑鸣九霄', serialNumber: 3, wordCount: 0, isSelected: false, isPublished: false },
        ],
      }],
    }));
    localStorage.setItem('xinyuexia_novel_951_chapter_953', '夜色中的星门第一次亮起。');
    localStorage.setItem('xinyuexia_novel_951_chapter_954', '少年踏入禁地，听见远古剑鸣。');
    localStorage.setItem('xinyuexia_novel_951_chapter_955', '剑光冲霄，山门上下尽皆震动。');
  });
  await page.reload();
  await page.getByTestId('standard-mode-novel-card').waitFor();
  await page.getByRole('button', { name: '进入工作台' }).click();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor();

  stage = 'work details initial state';
  await page.locator('[data-standard-work-details-page="true"]').waitFor();
  assert.equal(await page.getByRole('button', { name: '作品详情' }).getAttribute('aria-current'), 'page');
  assert.equal(await page.getByRole('button', { name: '星海问道', exact: true }).count(), 1);
  assert.equal(await page.getByLabel('作品名称').inputValue(), '星海问道');
  assert.equal((await page.getByLabel('题材类型').textContent())?.trim(), '玄幻');
  assert.equal(await page.getByRole('button', { name: '男频', exact: true }).getAttribute('aria-pressed'), 'true');
  assert.equal(await page.getByRole('button', { name: '连载中', exact: true }).getAttribute('aria-pressed'), 'true');
  assert.equal(await page.getByRole('button', { name: '筹备中', exact: true }).count(), 0);
  assert.equal(await page.getByRole('button', { name: '开始设定' }).count(), 1);
  assert.equal(await page.getByRole('button', { name: '设定列表' }).count(), 0);
  assert.equal(await page.getByText('共 3 章', { exact: true }).count(), 1);
  result.assertions.workDetailsIsTheSelectedFirstStage = true;
  result.assertions.uninitializedBookShowsOnlyStartSetting = true;

  const initialLayout = await page.locator('[data-standard-work-details-page="true"]').evaluate((element) => {
    const pageRect = element.getBoundingClientRect();
    const content = element.firstElementChild;
    const body = content?.querySelector('[data-work-details-body-layout="cover-and-form"]');
    const formGrid = content?.querySelector('[data-work-details-form-grid="true"]');
    const progress = content?.querySelector('[data-progress-placement="details-heading"]');
    const titleInput = element.querySelector('[data-visible-character-width="20"]');
    const genreButton = element.querySelector('button[aria-label="题材类型"]');
    const statusGroup = element.querySelector('[data-work-details-aligned-right-control="status"]');
    const workTime = element.querySelector('[aria-label="作品时间"]');
    const expectedLengthInput = element.querySelector('input[aria-label="预计篇幅"]');
    const synopsis = element.querySelector('textarea[aria-label="作品简介"]');
    const chapterAccess = element.querySelector('section[aria-label="正文章节快捷入口"]');
    const firstChapterButton = [...(chapterAccess?.querySelectorAll('button') ?? [])]
      .find((button) => button.textContent?.trim().startsWith('第1章'));
    const saveButton = [...element.querySelectorAll('button')].find((button) => button.textContent?.trim() === '保存修改');
    const selectedChannel = element.querySelector('button[aria-pressed="true"]');
    const rect = (target) => {
      if (!target) return null;
      const bounds = target.getBoundingClientRect();
      return {
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        bottom: bounds.bottom,
        width: bounds.width,
        height: bounds.height,
      };
    };
    return {
      page: rect(element),
      content: rect(content),
      body: rect(body),
      formGrid: rect(formGrid),
      progress: rect(progress),
      titleInput: rect(titleInput),
      genreButton: rect(genreButton),
      statusGroup: rect(statusGroup),
      workTime: rect(workTime),
      expectedLengthControl: rect(expectedLengthInput?.parentElement),
      synopsis: rect(synopsis),
      chapterAccess: rect(chapterAccess),
      firstChapterButton: rect(firstChapterButton),
      saveButton: rect(saveButton),
      selectedStyle: selectedChannel
        ? {
            color: getComputedStyle(selectedChannel).color,
            backgroundColor: getComputedStyle(selectedChannel).backgroundColor,
            borderColor: getComputedStyle(selectedChannel).borderColor,
            boxShadow: getComputedStyle(selectedChannel).boxShadow,
          }
        : null,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      leftGap: rect(content).left - pageRect.left,
      rightGap: pageRect.right - rect(content).right,
      devicePixelRatio: window.devicePixelRatio,
      zoomRatio: window.outerWidth > 0 ? window.innerWidth / window.outerWidth : 1,
      appZoom: Number.parseFloat(getComputedStyle(document.body).zoom) || 1,
      pagePaddingLeft: Number.parseFloat(getComputedStyle(element).paddingLeft),
      pagePaddingRight: Number.parseFloat(getComputedStyle(element).paddingRight),
      titleInputCssHeight: Number.parseFloat(getComputedStyle(titleInput).height),
      titleInputCssWidth: Number.parseFloat(getComputedStyle(titleInput).width),
      genreButtonCssHeight: Number.parseFloat(getComputedStyle(genreButton).height),
      genreButtonCssWidth: Number.parseFloat(getComputedStyle(genreButton).width),
      statusGroupCssWidth: Number.parseFloat(getComputedStyle(statusGroup).width),
      workTimeCssWidth: Number.parseFloat(getComputedStyle(workTime).width),
      expectedLengthCssWidth: Number.parseFloat(getComputedStyle(expectedLengthInput.parentElement).width),
      synopsisCssHeight: Number.parseFloat(getComputedStyle(synopsis).height),
      synopsisCssWidth: Number.parseFloat(getComputedStyle(synopsis).width),
      firstChapterButtonCssWidth: Number.parseFloat(getComputedStyle(firstChapterButton).width),
      nativeGenreSelectCount: element.querySelectorAll('select[aria-label="题材类型"]').length,
    };
  });
  result.measurements = initialLayout;
  assert.equal(initialLayout.pagePaddingLeft, 24);
  assert.equal(initialLayout.pagePaddingRight, 24);
  assert.ok(initialLayout.leftGap >= 20 && initialLayout.leftGap <= 28);
  assert.ok(initialLayout.rightGap >= 20 && initialLayout.rightGap <= 28);
  assert.equal(initialLayout.titleInputCssWidth, 340);
  assert.equal(initialLayout.titleInputCssHeight, 36);
  assert.equal(initialLayout.genreButtonCssHeight, 36);
  assert.equal(initialLayout.genreButtonCssWidth, 252);
  assert.equal(initialLayout.statusGroupCssWidth, 252);
  assert.equal(initialLayout.workTimeCssWidth, 252);
  assert.equal(initialLayout.expectedLengthCssWidth, 160);
  assert.equal(initialLayout.synopsisCssHeight, 180);
  assert.equal(initialLayout.synopsisCssWidth, 616);
  assert.ok(Math.abs(initialLayout.genreButton.right - initialLayout.statusGroup.right) <= 0.5);
  assert.ok(Math.abs(initialLayout.genreButton.right - initialLayout.workTime.right) <= 0.5);
  assert.ok(Math.abs(initialLayout.genreButton.right - initialLayout.synopsis.right) <= 0.5);
  assert.equal(initialLayout.firstChapterButtonCssWidth, 320);
  assert.equal(initialLayout.nativeGenreSelectCount, 0);
  assert.ok(initialLayout.chapterAccess.top > initialLayout.synopsis.bottom);
  assert.ok(initialLayout.saveButton.top - initialLayout.chapterAccess.bottom <= 15);
  assert.ok(initialLayout.progress.top < initialLayout.body.top);
  assert.ok(initialLayout.scrollWidth <= initialLayout.clientWidth);
  result.assertions.compactTwoColumnLayoutUsesTwentyFourPixelSidePadding = true;
  result.assertions.progressIsInDetailsHeading = true;
  result.assertions.compactControlsTitleWidthAndSynopsisHeight = true;
  const workInfoButton = page.getByRole('button', { name: '作品详情', exact: true });
  assert.equal(await workInfoButton.evaluate((button) => button.classList.contains('xy-work-info-primary')), true);
  assert.equal(await workInfoButton.locator('..').evaluate((group) => Number.parseFloat(getComputedStyle(group).height)), 32);
  result.assertions.workDetailsEntryMatchesProfessionalWorkInfoCapsule = true;
  result.assertions.contentControlsUseRequestedStableWidths = true;

  await page.getByLabel('题材类型').click();
  await page.getByText('热门题材', { exact: true }).waitFor();
  await page.getByText('其他题材', { exact: true }).waitFor();
  const genreDropdown = page.getByRole('button', { name: '仙侠', exact: true }).locator('..');
  const dropdownMetrics = await genreDropdown.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    maxHeight: Number.parseFloat(getComputedStyle(element).maxHeight),
  }));
  assert.ok(dropdownMetrics.maxHeight >= 359 && dropdownMetrics.maxHeight <= 361);
  assert.ok(dropdownMetrics.scrollHeight > dropdownMetrics.clientHeight);
  result.assertions.groupedGenreDropdownIsHeightLimitedAndScrollable = true;
  await page.waitForTimeout(200);
  await capture('01-work-details-genre-dropdown');
  await page.getByRole('button', { name: '仙侠', exact: true }).click();
  assert.equal((await page.getByLabel('题材类型').textContent())?.trim(), '仙侠');

  await page.getByLabel('作品名称').click();
  const selectedStyleAfterBlur = await page.getByRole('button', { name: '男频', exact: true }).evaluate((element) => ({
    color: getComputedStyle(element).color,
    backgroundColor: getComputedStyle(element).backgroundColor,
    borderColor: getComputedStyle(element).borderColor,
    boxShadow: getComputedStyle(element).boxShadow,
  }));
  assert.deepEqual(selectedStyleAfterBlur, initialLayout.selectedStyle);
  result.assertions.selectedStyleDoesNotChangeAfterFocusMoves = true;
  await page.waitForTimeout(200);
  await capture('01-work-details-initial');

  stage = 'chapter shortcut opens shared writing page';
  await page.getByRole('button', { name: '第2章 夜探禁地', exact: true }).click();
  const writingAction = page.getByRole('button', { name: '正文', exact: true });
  await writingAction.waitFor();
  assert.equal(await writingAction.getAttribute('aria-current'), 'page');
  await page.locator('[aria-current="page"]').filter({ hasText: '第2章 夜探禁地' }).waitFor();
  const writingActionStyle = await writingAction.evaluate((element) => ({
    color: getComputedStyle(element).color,
    backgroundColor: getComputedStyle(element).backgroundColor,
    borderColor: getComputedStyle(element).borderColor,
  }));
  assert.deepEqual(writingActionStyle, {
    color: initialLayout.selectedStyle.color,
    backgroundColor: initialLayout.selectedStyle.backgroundColor,
    borderColor: initialLayout.selectedStyle.borderColor,
  });
  result.assertions.channelStatusAndTopActionUseTheSameSelectedAppearance = true;
  result.assertions.chapterTwoShortcutOpensChapterTwoWritingPage = true;
  await capture('02-chapter-two-writing-page');
  await page.getByRole('button', { name: '作品详情', exact: true }).click();
  await page.locator('[data-standard-work-details-page="true"]').waitFor();

  stage = 'edit and persist work details';
  await page.getByLabel('作品名称').fill('星海问道新篇');
  await page.getByRole('button', { name: '女频', exact: true }).click();
  assert.equal((await page.getByLabel('题材类型').textContent())?.trim(), '总裁');
  await page.getByLabel('题材类型').click();
  await page.getByRole('button', { name: '甜宠', exact: true }).click();
  await page.getByRole('button', { name: '连载中' }).click();
  await page.getByLabel('预计篇幅').fill('120');
  await page.getByLabel('作品简介').fill('少女踏入星海仙途，追查文明断层。');
  await page.getByLabel('上传作品封面').setInputFiles({
    name: 'cover.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z6h8AAAAASUVORK5CYII=', 'base64'),
  });
  await page.getByRole('button', { name: '更换封面' }).waitFor();
  await page.getByRole('button', { name: '保存修改' }).click();
  await page.getByRole('status').filter({ hasText: '作品资料已保存' }).waitFor();
  await page.getByRole('button', { name: '星海问道新篇', exact: true }).waitFor();
  await capture('02-work-details-saved');

  await page.reload();
  await page.locator('[data-standard-work-details-page="true"]').waitFor();
  assert.equal(await page.getByLabel('作品名称').inputValue(), '星海问道新篇');
  assert.equal((await page.getByLabel('题材类型').textContent())?.trim(), '甜宠');
  assert.equal(await page.getByRole('button', { name: '女频', exact: true }).getAttribute('aria-pressed'), 'true');
  assert.equal(await page.getByRole('button', { name: '连载中' }).getAttribute('aria-pressed'), 'true');
  assert.equal(await page.getByLabel('预计篇幅').inputValue(), '120');
  assert.equal(await page.getByLabel('作品简介').inputValue(), '少女踏入星海仙途，追查文明断层。');
  result.assertions.workDetailsPersistAfterReload = true;

  stage = 'compact window layout';
  await app.evaluate(({ BrowserWindow, screen }) => {
    const target = BrowserWindow.getAllWindows()[0];
    const primary = screen.getPrimaryDisplay();
    const secondary = screen.getAllDisplays().find((display) => display.id !== primary.id);
    if (!secondary) return;
    const width = Math.min(1400, secondary.workArea.width - 32);
    const height = Math.min(900, secondary.workArea.height - 32);
    target.setBounds({
      x: secondary.workArea.x + Math.floor((secondary.workArea.width - width) / 2),
      y: secondary.workArea.y + Math.floor((secondary.workArea.height - height) / 2),
      width,
      height,
    });
    target.showInactive();
  });
  await page.waitForTimeout(250);
  const compactLayout = await page.locator('[data-standard-mode-workbench="true"]').evaluate((workbench) => {
    const details = workbench.querySelector('[data-standard-work-details-page="true"]');
    const navigation = workbench.querySelector('header');
    return {
      clientWidth: details.clientWidth,
      scrollWidth: details.scrollWidth,
      navigationClientWidth: navigation.clientWidth,
      navigationScrollWidth: navigation.scrollWidth,
      synopsisHeight: Number.parseFloat(getComputedStyle(details.querySelector('textarea[aria-label="作品简介"]')).height),
    };
  });
  assert.ok(compactLayout.scrollWidth <= compactLayout.clientWidth);
  assert.ok(compactLayout.navigationScrollWidth <= compactLayout.navigationClientWidth);
  assert.equal(compactLayout.synopsisHeight, 180);
  result.assertions.compactWindowHasNoHorizontalOverflow = true;
  await capture('03-work-details-compact-window');

  const layout = await page.locator('[data-standard-mode-workbench="true"]').evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  assert.ok(layout.scrollWidth <= layout.clientWidth);
  assert.ok(layout.scrollHeight <= layout.clientHeight);
  result.assertions.noUnexpectedWorkbenchOverflow = true;
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
