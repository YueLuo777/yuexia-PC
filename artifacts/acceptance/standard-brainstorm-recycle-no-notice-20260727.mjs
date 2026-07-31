import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-brainstorm-recycle-no-notice');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-brainstorm-recycle-'));
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '4178';
await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '标准模式书籍 -> 工作台 -> 脑洞库 -> 删除脑洞 -> 脑洞回收站 -> 恢复脑洞',
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
  await page.goto(`http://127.0.0.1:${port}/#/novels`);
  await page.getByTestId('standard-mode-novel-card').waitFor();
  await page.getByRole('button', { name: '进入工作台' }).click();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor();
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
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([{
      id: 998,
      title: '脑洞回收站验收书籍',
      type: 'novel',
      category: '玄幻',
      channel: 'male',
      synopsis: '',
      wordCount: 0,
      createdAt: '2026/7/27',
      lastModifiedAt: '2026/7/27',
    }]));
    localStorage.setItem('xinyuexia_current_novel_id', '998');
    localStorage.setItem('xinyuexia_global_brainstorm_library_v1', JSON.stringify([
      {
        id: 'brainstorm-recycle-1', tab: '脑洞', title: '万界吞噬',
        content: JSON.stringify({ type: '脑洞库', body: '主角获得吞噬能力，从边陲宗门起步。' }),
        updatedAt: '2026/7/27', brainstormSerialNumber: 1,
      },
      {
        id: 'brainstorm-recycle-2', tab: '脑洞', title: '剑开天门',
        content: JSON.stringify({ type: '脑洞库', body: '少年以残剑重开仙路。' }),
        updatedAt: '2026/7/27', brainstormSerialNumber: 2,
      },
    ]));
  });
  await page.reload();
  await openBrainstormLibrary();

  stage = 'shared recycle button replaces search';
  assert.equal(await page.getByPlaceholder('搜索脑洞').count(), 0);
  const recycleButton = page
    .locator('[data-standard-brainstorm-sidebar="true"]')
    .getByRole('button', { name: /脑洞回收站/ });
  const recycleStyle = await recycleButton.evaluate((button) => {
    const style = getComputedStyle(button);
    const rect = button.getBoundingClientRect();
    return {
      text: button.textContent?.replace(/\s+/g, ''),
      height: rect.height,
      cssHeight: style.height,
      borderRadius: style.borderRadius,
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
    };
  });
  assert.match(recycleStyle.text ?? '', /脑洞回收站0/);
  assert.equal(recycleStyle.cssHeight, '44px');
  result.assertions.searchReplacedByProfessionalRecycleButton = recycleStyle;
  await capture('01-recycle-button-before-delete');

  stage = 'delete without layout notice';
  const revisionField = page.locator('[data-brainstorm-revision-field="professional-inline-input"]');
  const beforeDeleteRect = await revisionField.evaluate((element) => element.getBoundingClientRect().toJSON());
  await page.getByRole('button', { name: '删除当前脑洞' }).click();
  await page.getByRole('button', { name: '确认删除' }).click();
  assert.equal(await page.getByLabel('脑洞预览内容').inputValue(), '少年以残剑重开仙路。');
  assert.equal(await page.getByText('已删除，当前显示《剑开天门》。').count(), 0);
  assert.equal(await page.getByText('脑洞已删除，脑洞库现在为空。').count(), 0);
  assert.equal(await revisionField.locator('[role="status"]').count(), 0);
  const afterDeleteRect = await revisionField.evaluate((element) => element.getBoundingClientRect().toJSON());
  assert.ok(Math.abs(beforeDeleteRect.height - afterDeleteRect.height) < 1);
  assert.ok(Math.abs(beforeDeleteRect.bottom - afterDeleteRect.bottom) < 1);
  assert.match((await recycleButton.textContent())?.replace(/\s+/g, '') ?? '', /脑洞回收站1/);
  result.assertions.deleteHasNoNoticeAndKeepsInputGeometry = { beforeDeleteRect, afterDeleteRect };
  await capture('02-after-delete-without-notice');

  stage = 'recycle modal restore';
  await recycleButton.click();
  const recycleDialog = page.getByRole('dialog', { name: '脑洞回收站' });
  await recycleDialog.waitFor();
  assert.equal(await recycleDialog.getByText('万界吞噬', { exact: true }).count(), 1);
  assert.equal(await recycleDialog.getByRole('button', { name: '恢复' }).count(), 1);
  assert.equal(await recycleDialog.getByRole('button', { name: '永久删除' }).count(), 1);
  assert.equal(await recycleDialog.getByRole('button', { name: '清空回收站' }).count(), 1);
  result.assertions.professionalRecycleModalReused = true;
  await capture('03-professional-recycle-modal');

  await recycleDialog.getByRole('button', { name: '恢复' }).click();
  assert.equal(await page.getByLabel('脑洞预览内容').inputValue(), '主角获得吞噬能力，从边陲宗门起步。');
  assert.equal(await page.getByText('已删除，当前显示《剑开天门》。').count(), 0);
  assert.match((await recycleButton.textContent())?.replace(/\s+/g, '') ?? '', /脑洞回收站0/);
  const stored = await page.evaluate(() => ({
    active: JSON.parse(localStorage.getItem('xinyuexia_global_brainstorm_library_v1') ?? '[]'),
    recycle: JSON.parse(localStorage.getItem('xinyuexia_global_brainstorm_library_v1_brainstorm_recycle_v1') ?? '[]'),
  }));
  assert.equal(stored.active.length, 2);
  assert.equal(stored.recycle.length, 0);
  result.assertions.restoreReturnsBrainstormAndClearsRecycle = true;
  await capture('04-restored-without-notice');

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
