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
const userDataDir = await mkdtemp(path.join(tmpdir(), 'yuexia-dual-workbench-formal-'));
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
  assert.ok(geometry?.visible);
  assert.ok(geometry.bounds.x >= geometry.workArea.x);
  assert.ok(geometry.bounds.x + geometry.bounds.width <= geometry.workArea.x + geometry.workArea.width);

  await page.evaluate(() => {
    localStorage.setItem('novel_card_settings', JSON.stringify({ cardWidth: 'large', coverHeight: 'large' }));
    window.location.reload();
  });

  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });
  const standardButton = page.getByRole('button', { name: '进入《默认小说1》标准工作台' });
  const professionalButton = page.getByRole('button', { name: '进入《默认小说1》专业工作台' });
  await standardButton.waitFor();
  await professionalButton.waitFor();
  const card = standardButton.locator('xpath=ancestor::article');
  assert.equal(await card.getByText(/下一步/).count(), 0);
  assert.equal(await card.getByRole('progressbar').count(), 0);
  const buttonGeometry = await Promise.all([
    standardButton.boundingBox(),
    professionalButton.boundingBox(),
  ]);
  assert.ok(buttonGeometry.every(Boolean));
  assert.ok(Math.abs(buttonGeometry[0].y - buttonGeometry[1].y) <= 1);
  assert.ok(Math.abs(buttonGeometry[0].height - buttonGeometry[1].height) <= 1);
  assert.ok(buttonGeometry.every((box) => box.width >= 112));
  const buttonOverflow = await Promise.all([
    standardButton.evaluate((element) => element.scrollWidth > element.clientWidth),
    professionalButton.evaluate((element) => element.scrollWidth > element.clientWidth),
  ]);
  assert.deepEqual(buttonOverflow, [false, false]);
  const layout = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  assert.ok(layout.documentWidth <= layout.viewportWidth);
  await page.screenshot({ path: path.join(currentDir, '01-formal-dual-entry-card.png') });

  await card.getByTitle('更多').click();
  const menu = card.getByRole('menu', { name: '作品操作菜单' });
  await menu.waitFor();
  const [cardBox, menuBox] = await Promise.all([card.boundingBox(), menu.boundingBox()]);
  assert.ok(cardBox && menuBox);
  assert.ok(menuBox.x >= cardBox.x - 1);
  for (const label of ['重命名', '书封管理', '导出', '移入分类', '移入回收站']) {
    await menu.getByRole('menuitem', { name: label }).waitFor();
  }
  await page.screenshot({ path: path.join(currentDir, '02-formal-management-menu.png') });
  await menu.getByRole('menuitem', { name: '移入分类' }).hover();
  await card.getByRole('menu', { name: '分类选择' }).waitFor();
  await page.screenshot({ path: path.join(currentDir, '03-formal-category-submenu.png') });
  await page.getByText('作品概览', { exact: true }).click();
  assert.equal(await menu.count(), 0);

  await standardButton.click();
  await page.waitForURL(/#\/workbench\?experience=standard/);
  const standardNavigation = page.getByRole('navigation', { name: '标准模式创作导航' });
  await standardNavigation.waitFor({ timeout: 30_000 });
  assert.equal(await standardNavigation.getByRole('button', { name: '生成正文' }).getAttribute('aria-current'), 'page');
  await page.screenshot({ path: path.join(currentDir, '04-formal-standard-workbench.png') });
  await page.evaluate(() => {
    window.location.hash = '#/novels';
  });
  await page.getByText('作品概览', { exact: true }).waitFor();

  await page.getByRole('button', { name: '进入《默认小说1》专业工作台' }).click();
  await page.waitForURL(/#\/workbench$/);
  await page.getByText('作品信息', { exact: true }).waitFor({ timeout: 30_000 });
  await page.screenshot({ path: path.join(currentDir, '05-formal-professional-workbench.png') });

  assert.deepEqual(runtimeErrors, [], `renderer runtime errors:\n${runtimeErrors.join('\n')}`);
  process.stdout.write(`Formal dual-workbench card acceptance passed: ${JSON.stringify(geometry)}\n`);
} finally {
  await app.close().catch(() => {});
  await rm(userDataDir, { recursive: true, force: true });
}
