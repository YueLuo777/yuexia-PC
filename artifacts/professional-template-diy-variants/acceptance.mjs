import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { _electron as electron } from 'playwright';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require(path.join(repoRoot, 'node_modules', 'electron'));
const userDataDir = await mkdtemp(path.join(tmpdir(), 'yuexia-professional-diy-'));
const targetDisplayX = Number(process.env.YUEXIA_ACCEPTANCE_DISPLAY_X);
const runtimeErrors = [];
let electronApp;

async function assertLayout(page, prototype, screenshotName) {
  const geometry = await prototype.evaluate((root) => ({
    viewportWidth: document.documentElement.clientWidth,
    viewportHeight: document.documentElement.clientHeight,
    documentScrollWidth: document.documentElement.scrollWidth,
    documentScrollHeight: document.documentElement.scrollHeight,
    rootWidth: root.getBoundingClientRect().width,
    rootHeight: root.getBoundingClientRect().height,
    rootScrollWidth: root.scrollWidth,
    rootScrollHeight: root.scrollHeight,
  }));
  assert.ok(geometry.documentScrollWidth <= geometry.viewportWidth, `${screenshotName} should not overflow window width`);
  assert.ok(geometry.documentScrollHeight <= geometry.viewportHeight, `${screenshotName} should not overflow window height`);
  assert.ok(geometry.rootScrollWidth <= geometry.rootWidth + 1, `${screenshotName} should stay inside prototype width`);
  assert.ok(geometry.rootScrollHeight <= geometry.rootHeight + 1, `${screenshotName} should stay inside prototype height`);
  await page.screenshot({ path: path.join(currentDir, `${screenshotName}.png`) });
}

try {
  assert.ok(Number.isFinite(targetDisplayX), 'target display x must come from read-only Codex monitor detection');
  electronApp = await electron.launch({
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

  const page = await electronApp.firstWindow({ timeout: 30_000 });
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
  });
  await page.waitForLoadState('domcontentloaded');

  const windowGeometry = await electronApp.evaluate(({ BrowserWindow, screen }, requestedX) => {
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
  assert.ok(windowGeometry?.visible, 'desktop acceptance window should be visible');
  assert.ok(windowGeometry.bounds.x >= windowGeometry.workArea.x, 'window should remain on the Codex display');
  assert.ok(
    windowGeometry.bounds.x + windowGeometry.bounds.width <= windowGeometry.workArea.x + windowGeometry.workArea.width,
    'window should not cross into the primary display',
  );

  await page.evaluate(() => {
    localStorage.setItem('xinyuexia_show_internal_routes', '1');
    location.hash = '#/test-collection';
    location.reload();
  });
  await page.getByText('专业模板DIY编辑多方案', { exact: true }).waitFor({ timeout: 30_000 });
  await page.getByText('专业模板DIY编辑多方案', { exact: true }).click();

  const prototype = page.getByTestId('professional-template-diy-variants-test');
  await prototype.waitFor({ timeout: 30_000 });
  assert.equal(await prototype.getAttribute('data-active-variant'), 'columns');
  assert.equal(await prototype.getAttribute('data-domain-count'), '7');
  assert.equal(await page.getByRole('button', { name: '删除一级分类：怪物图鉴' }).isDisabled(), true);
  await assertLayout(page, prototype, '01-e-columns-locked');

  const domainColumn = page.getByRole('region', { name: 'DIY一级分类' });
  await domainColumn.getByRole('textbox', { name: '输入一级分类名称' }).fill('A');
  await domainColumn.getByRole('button', { name: '新增' }).click();
  const groupColumn = page.getByRole('region', { name: 'DIY二级分组' });
  await groupColumn.getByRole('textbox', { name: '输入二级分组名称' }).fill('A分组');
  await groupColumn.getByRole('button', { name: '新增' }).click();
  const entryColumn = page.getByRole('region', { name: 'DIY三级设定' });
  await entryColumn.getByRole('textbox', { name: '输入三级设定名称' }).fill('A设定');
  await entryColumn.getByRole('button', { name: '新增' }).click();
  const fieldColumn = page.getByRole('region', { name: 'DIY四级设定' });
  await fieldColumn.getByRole('textbox', { name: '输入四级设定名称' }).fill('A字段');
  await fieldColumn.getByRole('button', { name: '新增' }).click();
  assert.equal(await prototype.getAttribute('data-domain-count'), '8');
  await assertLayout(page, prototype, '02-e-columns-added-a');

  await page.getByRole('button', { name: /F · 层级树/ }).click();
  assert.equal(await prototype.getAttribute('data-active-variant'), 'tree');
  await page.getByRole('region', { name: '可折叠结构树' }).getByText('A字段', { exact: true }).waitFor();
  await assertLayout(page, prototype, '03-f-tree');

  await page.getByRole('button', { name: /G · 分层卡片/ }).click();
  assert.equal(await prototype.getAttribute('data-active-variant'), 'cards');
  await page.getByRole('region', { name: 'DIY分层卡片' }).getByText('A字段', { exact: true }).waitFor();
  await assertLayout(page, prototype, '04-g-cards');

  await page.getByRole('button', { name: /H · 路径工作台/ }).click();
  assert.equal(await prototype.getAttribute('data-active-variant'), 'path');
  await page.getByRole('region', { name: 'DIY完整路径清单' }).getByText('A字段', { exact: true }).waitFor();
  await assertLayout(page, prototype, '05-h-path-workbench');

  await page.getByRole('button', { name: '四级删除已锁定，点击解锁' }).click();
  const fieldDelete = page.getByRole('button', { name: '路径工作台删除设定字段：A字段' });
  assert.equal(await fieldDelete.isDisabled(), false);
  await fieldDelete.click();
  await page.getByText('已删除四级设定“A字段”。', { exact: true }).waitFor();

  assert.deepEqual(runtimeErrors, [], `renderer runtime errors:\n${runtimeErrors.join('\n')}`);
  process.stdout.write(`Professional template DIY variants desktop acceptance passed: ${JSON.stringify(windowGeometry)}\n`);
} finally {
  if (electronApp) await electronApp.close();
  await rm(userDataDir, { recursive: true, force: true });
}
