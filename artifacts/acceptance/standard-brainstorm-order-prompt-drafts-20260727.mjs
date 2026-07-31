import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-brainstorm-order-prompt-drafts');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-brainstorm-order-'));
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '4178';
await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '标准模式书籍 -> 脑洞库 -> 创建脑洞副本 -> 生成脑洞 -> 测试模式内置提示词草稿',
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

async function waitForFile(filePath) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      return await readFile(filePath, 'utf8');
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  throw new Error(`Exported file was not written: ${filePath}`);
}

async function openBrainstormLibrary() {
  const workbench = page.locator('[data-standard-mode-workbench="true"]');
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
    const codexDisplay = screen.getDisplayNearestPoint({ x: 2050, y: 100 });
    const width = Math.min(1900, codexDisplay.workArea.width - 32);
    const height = Math.min(1080, codexDisplay.workArea.height - 32);
    target.setBounds({
      x: codexDisplay.workArea.x + Math.floor((codexDisplay.workArea.width - width) / 2),
      y: codexDisplay.workArea.y + Math.floor((codexDisplay.workArea.height - height) / 2),
      width,
      height,
    });
    target.showInactive();
    return {
      displayCount: screen.getAllDisplays().length,
      codexDisplayId: codexDisplay.id,
      primaryDisplayId: primary.id,
      visible: target.isVisible(),
      focused: target.isFocused(),
      bounds: target.getBounds(),
      display: codexDisplay.bounds,
    };
  });
  assert.notEqual(result.window.codexDisplayId, result.window.primaryDisplayId);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  await page.evaluate(() => {
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_owner_test_mode_v1', '1');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([{
      id: 997,
      title: '脑洞顺序验收书籍',
      type: 'novel',
      category: '玄幻',
      channel: 'male',
      synopsis: '',
      wordCount: 0,
      createdAt: '2026/7/27',
      lastModifiedAt: '2026/7/27',
    }]));
    localStorage.setItem('xinyuexia_current_novel_id', '997');
    localStorage.setItem('xinyuexia_global_brainstorm_library_v1', JSON.stringify([
      {
        id: 'brainstorm-order-3', tab: '脑洞', title: '三号脑洞',
        content: JSON.stringify({ type: '脑洞库', body: '三号脑洞内容。' }),
        updatedAt: '2026/7/27', brainstormSerialNumber: 3,
      },
      {
        id: 'brainstorm-order-1', tab: '脑洞', title: '一号脑洞',
        content: JSON.stringify({ type: '脑洞库', body: '一号脑洞内容。' }),
        updatedAt: '2026/7/27', brainstormSerialNumber: 1,
      },
      {
        id: 'brainstorm-order-2', tab: '脑洞', title: '二号脑洞',
        content: JSON.stringify({ type: '脑洞库', body: '二号脑洞内容。' }),
        updatedAt: '2026/7/27', brainstormSerialNumber: 2,
      },
    ]));
  });
  await page.reload();
  await openBrainstormLibrary();

  stage = 'ordered library and aligned actions';
  const sidebar = page.locator('[data-standard-brainstorm-sidebar="true"]');
  const serials = await sidebar.locator('[data-brainstorm-entry-id] > span:nth-child(2)').allTextContents();
  assert.deepEqual(serials, ['1', '2', '3']);
  const sidebarActionGeometry = await sidebar.locator('[data-brainstorm-sidebar-actions="true"]').evaluate((container) => {
    const [add, remove] = [...container.querySelectorAll('button')].map((button) => button.getBoundingClientRect());
    return {
      add: { x: add.x, y: add.y, width: add.width, height: add.height },
      remove: { x: remove.x, y: remove.y, width: remove.width, height: remove.height },
    };
  });
  assert.ok(Math.abs(sidebarActionGeometry.add.y - sidebarActionGeometry.remove.y) < 1);
  assert.ok(Math.abs(sidebarActionGeometry.add.width - sidebarActionGeometry.remove.width) < 1);

  const libraryActions = page.locator('[data-brainstorm-library-copy-actions="true"]');
  const libraryActionGeometry = await libraryActions.evaluate((container) => {
    const [copy, duplicate] = [...container.querySelectorAll('button')].map((button) => button.getBoundingClientRect());
    return {
      copy: { x: copy.x, y: copy.y, width: copy.width, height: copy.height },
      duplicate: { x: duplicate.x, y: duplicate.y, width: duplicate.width, height: duplicate.height },
    };
  });
  assert.ok(Math.abs(libraryActionGeometry.copy.y - libraryActionGeometry.duplicate.y) < 1);
  assert.ok(Math.abs(libraryActionGeometry.copy.width - libraryActionGeometry.duplicate.width) < 1);
  assert.equal(await page.locator('[data-standard-brainstorm-preview="true"]').getByRole('button', { name: '复制脑洞' }).count(), 0);
  const titleFonts = await page.evaluate(() => {
    const labels = [...document.querySelectorAll('[data-standard-brainstorm-preview="true"] span')]
      .filter((node) => ['脑洞名', '脑洞预览'].includes(node.textContent?.trim() ?? ''));
    return labels.map((node) => ({ text: node.textContent?.trim(), size: getComputedStyle(node).fontSize }));
  });
  assert.deepEqual(titleFonts, [
    { text: '脑洞名', size: '14px' },
    { text: '脑洞预览', size: '14px' },
  ]);
  result.assertions.initialSerialOrder = serials;
  result.assertions.sidebarActionsShareEqualRow = sidebarActionGeometry;
  result.assertions.copyAndDuplicateShareEqualRow = libraryActionGeometry;
  result.assertions.previewHeaderHasNoDuplicateCopy = true;
  result.assertions.largerPreviewLabels = titleFonts;
  await capture('01-ordered-library-aligned-actions');

  stage = 'new brainstorm appended by serial';
  await page.getByRole('button', { name: '创建脑洞副本' }).click();
  const serialsAfterDuplicate = await sidebar.locator('[data-brainstorm-entry-id] > span:nth-child(2)').allTextContents();
  assert.deepEqual(serialsAfterDuplicate, ['1', '2', '3', '4']);
  const lastTitle = await sidebar.locator('[data-brainstorm-entry-id]').last().textContent();
  assert.match(lastTitle, /三号脑洞 副本/);
  result.assertions.newBrainstormAppearsLast = { serials: serialsAfterDuplicate, lastTitle };
  await capture('02-new-brainstorm-at-bottom');

  stage = 'brainstorm generator wording';
  await page.getByRole('button', { name: '生成脑洞', exact: true }).click();
  await page.getByRole('heading', { name: '脑洞生成条件' }).waitFor();
  assert.equal(await page.getByText('先选常用方向，需要时再补充自己的要求。').count(), 0);
  assert.equal(await page.getByRole('button', { name: '复制脑洞' }).count(), 1);
  result.assertions.generatorTitleAndCopyWording = true;
  await capture('03-generator-wording');

  stage = 'owner prompt draft save export and reload';
  await page.getByRole('button', { name: '内置提示词草稿' }).click();
  await page.getByRole('dialog', { name: '内置提示词草稿库' }).waitFor();
  await page.getByLabel('内置提示词内容').fill('这是重新编写的脑洞生成内置提示词。');
  await page.getByRole('button', { name: '保存草稿' }).click();
  const storageState = await page.evaluate(() => ({
    ownerDrafts: localStorage.getItem('xinyuexia_owner_builtin_prompt_drafts_v1'),
    ordinaryPrompts: localStorage.getItem('xinyuexia_prompts_v1'),
  }));
  assert.match(storageState.ownerDrafts ?? '', /重新编写的脑洞生成内置提示词/);
  assert.equal(storageState.ordinaryPrompts, null);
  const exportPath = path.join(evidenceDir, '内置提示词草稿导出.json');
  await rm(exportPath, { force: true });
  await app.evaluate(({ session }, savePath) => {
    session.defaultSession.once('will-download', (_event, item) => item.setSavePath(savePath));
  }, exportPath);
  await page.getByRole('button', { name: '导出全部草稿' }).click();
  const exported = JSON.parse(await waitForFile(exportPath));
  assert.equal(exported.schemaVersion, 1);
  assert.match(exported.prompts[0].content, /重新编写的脑洞生成内置提示词/);
  result.assertions.ownerDraftSeparatedSavedAndExported = true;
  result.export = exportPath;
  await capture('04-owner-prompt-draft-library');
  await page.getByRole('dialog', { name: '内置提示词草稿库' }).getByLabel('关闭', { exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: '内置提示词草稿' }).click();
  assert.equal(await page.getByLabel('内置提示词内容').inputValue(), '这是重新编写的脑洞生成内置提示词。');
  result.assertions.ownerDraftSurvivesReload = true;

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
