import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const evidenceDir = path.join(repoRoot, 'artifacts', 'v6-brainstorm-library');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-v6-brainstorm-library-'));
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '4175';
await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '标准模式书籍 -> 进入工作台 -> 准备阶段 -> 脑洞库',
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
      id: 981,
      title: '脑洞库页面验收书籍',
      type: 'novel',
      category: '玄幻',
      channel: 'male',
      synopsis: '',
      wordCount: 0,
      createdAt: '2026/7/27',
      lastModifiedAt: '2026/7/27',
    }]));
    localStorage.setItem('xinyuexia_current_novel_id', '981');
    localStorage.setItem('xinyuexia_global_brainstorm_library_v1', JSON.stringify([{
      id: 'brainstorm-acceptance-1',
      tab: '脑洞',
      title: '万界吞噬',
      content: JSON.stringify({
        type: '脑洞库',
        body: '书名：《万界吞噬》\n卖点：吞噬诸天万界，掠夺血脉功法\n主角：林刻\n金手指：吞噬系统，吞敌即得对方力量',
      }),
      createdAt: '2026/7/27 10:00:00',
      updatedAt: '2026/7/27 10:30:00',
      brainstormSerialNumber: 1,
    }]));
  });
  await page.reload();
  await page.getByTestId('standard-mode-novel-card').waitFor();
  await page.getByRole('button', { name: '进入工作台' }).click();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor();
  await page.getByRole('button', { name: '脑洞库', exact: true }).click();
  await page.getByRole('heading', { name: '脑洞操作' }).waitFor();

  stage = 'brainstorm library action layout';
  assert.equal(await page.getByRole('button', { name: '关联到当前作品', exact: true }).count(), 0);
  const createButton = page.getByRole('button', { name: '根据此脑洞生成设定', exact: true });
  const duplicateButton = page.getByRole('button', { name: '复制为新脑洞', exact: true });
  await createButton.waitFor();
  await duplicateButton.waitFor();
  const widths = await Promise.all([
    createButton.evaluate((button) => button.getBoundingClientRect().width),
    duplicateButton.evaluate((button) => button.getBoundingClientRect().width),
  ]);
  assert.ok(Math.abs(widths[0] - widths[1]) <= 0.5);
  result.assertions.associateActionIsRemoved = true;
  result.assertions.remainingActionsUseFullWidthRows = true;
  await capture('01-brainstorm-library-actions');

  stage = 'duplicate brainstorm';
  await duplicateButton.click();
  await page.getByRole('status').filter({ hasText: '已复制为新的脑洞' }).waitFor();
  const storedCount = await page.evaluate(() => {
    const raw = localStorage.getItem('xinyuexia_global_brainstorm_library_v1');
    return raw ? JSON.parse(raw).length : 0;
  });
  assert.equal(storedCount, 2);
  result.assertions.duplicateActionStillWorks = true;
  await capture('02-brainstorm-library-duplicated');

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
