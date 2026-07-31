import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { _electron as electron } from 'playwright';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require(path.join(repoRoot, 'node_modules', 'electron'));
const userDataDir = await mkdtemp(path.join(tmpdir(), 'yuexia-test10-dual-entry-'));
const targetDisplayX = Number(process.env.YUEXIA_ACCEPTANCE_DISPLAY_X);
const runtimeErrors = [];

await mkdir(currentDir, { recursive: true });

const app = await electron.launch({
  executablePath: electronExecutable,
  cwd: repoRoot,
  args: [path.join(repoRoot, 'electron', 'main.cjs'), `--user-data-dir=${userDataDir}`],
  env: {
    ...process.env,
    ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
    NODE_ENV: 'test',
    XINYUEXIA_LOAD_DIST: '1',
    XINYUEXIA_SMOKE_HEADLESS: '1',
  },
  timeout: 30_000,
});

try {
  assert.ok(Number.isFinite(targetDisplayX), 'verified Codex display x is required');
  const page = await app.firstWindow({ timeout: 30_000 });
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
  });
  await page.waitForLoadState('domcontentloaded');

  const geometry = await app.evaluate(({ BrowserWindow, screen }, requestedX) => {
    const appWindow = BrowserWindow.getAllWindows()[0];
    const display = screen.getAllDisplays().find((candidate) => candidate.workArea.x === requestedX);
    if (!appWindow || !display) return null;
    const width = Math.min(1860, display.workArea.width - 64);
    const height = Math.min(1040, display.workArea.height - 40);
    appWindow.setBounds({
      x: display.workArea.x + Math.floor((display.workArea.width - width) / 2),
      y: display.workArea.y + Math.floor((display.workArea.height - height) / 2),
      width,
      height,
    });
    appWindow.showInactive();
    return { bounds: appWindow.getBounds(), workArea: display.workArea, visible: appWindow.isVisible() };
  }, targetDisplayX);
  assert.ok(geometry?.visible, 'desktop window should be visible');
  assert.ok(geometry.bounds.x >= geometry.workArea.x, 'window should remain on the Codex display');
  assert.ok(
    geometry.bounds.x + geometry.bounds.width <= geometry.workArea.x + geometry.workArea.width,
    'window should not cross into the primary display',
  );

  await page.evaluate(() => {
    window.localStorage.setItem('xinyuexia_show_internal_routes', '1');
    window.location.hash = '#/test-collection';
  });
  await page.reload();
  await page.getByText('标准模式创作工作台模拟', { exact: true }).click();
  await page.getByTestId('standard-mode-library').waitFor({ timeout: 30_000 });

  assert.equal(await page.getByText(/下一步/).count(), 0);
  assert.equal(await page.getByText('玄幻升级', { exact: true }).count(), 0);
  await page.getByRole('button', { name: '进入《九重天劫》标准工作台' }).waitFor();
  await page.getByRole('button', { name: '进入《九重天劫》专业工作台' }).waitFor();
  const layout = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
    cards: [...document.querySelectorAll('article')].map((card) => {
      const rect = card.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
    }),
  }));
  assert.equal(layout.cards.length, 2);
  assert.ok(layout.cards.every((card) => card.left >= 0 && card.right <= layout.viewportWidth));
  assert.ok(layout.documentWidth <= layout.viewportWidth);
  await page.screenshot({ path: path.join(currentDir, '01-test10-dual-entry-default.png') });

  await page.getByRole('button', { name: '《九重天劫》更多操作' }).click();
  const menu = page.getByRole('menu', { name: '《九重天劫》作品操作菜单' });
  await menu.waitFor();
  for (const label of ['重命名', '书封管理', '导出', '移入分类', '移入回收站']) {
    await menu.getByRole('menuitem', { name: label }).waitFor();
  }
  await page.screenshot({ path: path.join(currentDir, '02-test10-novel-menu.png') });
  await menu.getByRole('menuitem', { name: '移入分类' }).click();
  await page.getByRole('menu', { name: '可移动分类' }).waitFor();
  await page.screenshot({ path: path.join(currentDir, '03-test10-move-category.png') });
  await page.getByRole('menuitem', { name: '玄幻', exact: true }).click();
  await page.getByText('已将《九重天劫》移入玄幻', { exact: true }).waitFor();

  await page.getByRole('button', { name: '进入《九重天劫》标准工作台' }).click();
  await page.getByTestId('standard-mode-workbench').waitFor();
  await page.screenshot({ path: path.join(currentDir, '04-test10-standard-workbench.png') });
  await page.getByRole('button', { name: '返回书籍' }).click();
  await page.getByTestId('standard-mode-library').waitFor();

  await page.getByRole('button', { name: '进入《九重天劫》专业工作台' }).click();
  await page.getByTestId('professional-mode-editor-preview').waitFor();
  await page.screenshot({ path: path.join(currentDir, '05-test10-professional-workbench.png') });

  assert.deepEqual(runtimeErrors, [], `renderer runtime errors:\n${runtimeErrors.join('\n')}`);
  process.stdout.write(`Test 10 dual workbench desktop acceptance passed: ${JSON.stringify(geometry)}\n`);
} finally {
  await app.close().catch(() => {});
  await rm(userDataDir, { recursive: true, force: true });
}
