import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-brainstorm-categories-font');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-brainstorm-categories-'));
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '4177';
await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '标准模式书籍 -> 脑洞库 -> 新增脑洞分类 -> 移动脑洞 -> 调整字号 -> 刷新 -> 生成脑洞',
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

async function openBrainstormLibrary() {
  const workbench = page.locator('[data-standard-mode-workbench="true"]');
  await workbench.waitFor({ timeout: 2_000 }).catch(() => undefined);
  if (await workbench.count() === 0) {
    await page.goto(`http://127.0.0.1:${port}/#/novels`);
    await page.getByTestId('standard-mode-novel-card').waitFor();
    await page.getByRole('button', { name: '进入工作台' }).click();
    await workbench.waitFor();
  }
  await page.getByRole('button', { name: '脑洞库', exact: true }).click();
  await page.locator('[data-standard-mode-brainstorm-page="true"]').waitFor();
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
      visible: target.isVisible(),
      focused: target.isFocused(),
      bounds: target.getBounds(),
    };
  });
  assert.equal(result.window.secondaryAvailable, true);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  await page.evaluate(() => {
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([{
      id: 992,
      title: '脑洞分类验收书籍',
      type: 'novel',
      category: '玄幻',
      channel: 'male',
      synopsis: '',
      wordCount: 0,
      createdAt: '2026/7/27',
      lastModifiedAt: '2026/7/27',
    }]));
    localStorage.setItem('xinyuexia_current_novel_id', '992');
    localStorage.setItem('xinyuexia_global_brainstorm_library_v1', JSON.stringify([
      {
        id: 'brainstorm-category-acceptance-1',
        tab: '脑洞',
        title: '万界吞噬',
        content: JSON.stringify({ type: '脑洞库', body: '主角觉醒吞噬能力，从边陲宗门一路成长。' }),
        updatedAt: '2026/7/27',
        brainstormSerialNumber: 1,
      },
      {
        id: 'brainstorm-category-acceptance-2',
        tab: '脑洞',
        title: '剑开天门',
        content: JSON.stringify({ type: '脑洞库', body: '少年以残剑重开仙路，寻找失踪的师父。' }),
        updatedAt: '2026/7/27',
        brainstormSerialNumber: 2,
      },
    ]));
  });
  await page.reload();
  await openBrainstormLibrary();

  stage = 'uncategorized tree and delete placement';
  const uncategorized = page.locator('[data-brainstorm-category-id="brainstorm-category-uncategorized"]');
  await uncategorized.getByRole('button', { name: /未分类/ }).waitFor();
  assert.equal(await uncategorized.locator('[data-brainstorm-entry-id]').count(), 2);
  const deletePlacement = await page.locator('[data-standard-brainstorm-sidebar="true"]').evaluate((sidebar) => {
    const deleteButton = [...sidebar.querySelectorAll('button')]
      .find((button) => button.textContent?.trim() === '删除当前脑洞');
    const search = sidebar.querySelector('input[placeholder="搜索脑洞"]');
    const rect = (element) => element.getBoundingClientRect().toJSON();
    return { deleteButton: rect(deleteButton), search: rect(search), deleteBeforeSearch: deleteButton.compareDocumentPosition(search) === 4 };
  });
  assert.equal(deletePlacement.deleteBeforeSearch, true);
  assert.ok(deletePlacement.deleteButton.bottom < deletePlacement.search.top);
  assert.equal(await page.getByRole('button', { name: '删除当前脑洞' }).count(), 1);
  result.assertions.legacyBrainstormsAppearInUncategorized = true;
  result.assertions.deleteButtonIsAboveSearch = deletePlacement;

  stage = 'font size persistence';
  const fontSizeInput = page.getByRole('textbox', { name: '脑洞预览字号' });
  assert.equal(await fontSizeInput.inputValue(), '15');
  await page.getByTitle('放大字号').click();
  assert.equal(await fontSizeInput.inputValue(), '16');
  const previewFontSize = await page.getByLabel('脑洞预览内容').evaluate((element) => getComputedStyle(element).fontSize);
  assert.equal(previewFontSize, '16px');
  result.assertions.previewFontSizeUsesSharedTool = true;

  stage = 'create and move category';
  await page.getByRole('button', { name: '新增脑洞分类' }).click();
  await page.getByLabel('分类名称').fill('玄幻脑洞');
  await page.getByRole('button', { name: '新建分类' }).click();
  const fantasyCategory = page.locator('[data-brainstorm-category-id]').filter({ hasText: '玄幻脑洞' });
  await fantasyCategory.waitFor();
  await page.getByRole('button', { name: /剑开天门/ }).click({ button: 'right' });
  await page.getByRole('button', { name: '移动到玄幻脑洞' }).click();
  assert.equal(await fantasyCategory.locator('[data-brainstorm-entry-id="brainstorm-category-acceptance-2"]').count(), 1);
  result.assertions.categoryCreatedAndEntryMoved = true;
  await capture('01-category-tree-and-font-tool');

  stage = 'collapse and reload persistence';
  await fantasyCategory.getByRole('button', { name: /玄幻脑洞/ }).click();
  assert.equal(await fantasyCategory.getByRole('button', { name: /玄幻脑洞/ }).getAttribute('aria-expanded'), 'false');
  await page.reload();
  await openBrainstormLibrary();
  const restoredCategory = page.locator('[data-brainstorm-category-id]').filter({ hasText: '玄幻脑洞' });
  assert.equal(await restoredCategory.getByRole('button', { name: /玄幻脑洞/ }).getAttribute('aria-expanded'), 'false');
  assert.equal(await page.getByRole('textbox', { name: '脑洞预览字号' }).inputValue(), '16');
  result.assertions.categoryCollapseAndFontSizeSurviveReload = true;
  await capture('02-reloaded-category-state');

  stage = 'generated default name';
  await page.getByRole('button', { name: '生成脑洞', exact: true }).click();
  assert.equal(await page.getByLabel('脑洞名').inputValue(), '未命名');
  result.assertions.generatedDraftUsesUnnamedTitle = true;
  await capture('03-generated-draft-unnamed');

  stage = 'delete category fallback';
  await page.getByRole('button', { name: '脑洞库', exact: true }).click();
  const categoryToDelete = page.locator('[data-brainstorm-category-id]').filter({ hasText: '玄幻脑洞' });
  await categoryToDelete.getByRole('button', { name: /玄幻脑洞/ }).click({ button: 'right' });
  await page.getByRole('button', { name: '删除分类' }).click();
  await page.getByRole('button', { name: '删除分类' }).click();
  assert.equal(await page.locator('[data-brainstorm-category-id]').filter({ hasText: '玄幻脑洞' }).count(), 0);
  const storedEntryCategory = await page.evaluate(() => {
    const entries = JSON.parse(localStorage.getItem('xinyuexia_global_brainstorm_library_v1') ?? '[]');
    return entries.find((entry) => entry.id === 'brainstorm-category-acceptance-2')?.brainstormCategoryId;
  });
  assert.equal(storedEntryCategory, 'brainstorm-category-uncategorized');
  result.assertions.deletedCategoryReturnsEntriesToUncategorized = true;
  await capture('04-category-deleted-with-content-kept');

  assert.deepEqual(result.runtimeErrors, []);
  result.assertions.noRuntimeErrors = true;
  result.status = 'PASS';
} catch (error) {
  result.error = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack ?? ''}` : String(error);
} finally {
  if (app) await app.close().catch(() => undefined);
  await rm(userDataDir, { recursive: true, force: true }).catch(() => undefined);
  await writeFile(resultPath, JSON.stringify(result, null, 2), 'utf8');
}

console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exitCode = 1;
