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
const userDataDir = await mkdtemp(path.join(tmpdir(), 'yuexia-professional-hierarchy-'));
const targetDisplayX = Number(process.env.YUEXIA_ACCEPTANCE_DISPLAY_X);
const runtimeErrors = [];
let electronApp;

async function assertLayout(page, prototype, variantId) {
  const geometry = await prototype.evaluate((root) => ({
    viewportWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    rootWidth: root.getBoundingClientRect().width,
    rootScrollWidth: root.scrollWidth,
  }));
  assert.ok(geometry.scrollWidth <= geometry.viewportWidth, `${variantId} should not overflow the window`);
  assert.ok(geometry.rootScrollWidth <= geometry.rootWidth + 1, `${variantId} should stay inside its prototype region`);
  await page.screenshot({ path: path.join(currentDir, `${variantId}.png`) });
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
  await page.getByText('专业模板四级层级多方案', { exact: true }).waitFor({ timeout: 30_000 });
  await page.getByText('专业模板四级层级多方案', { exact: true }).click();

  const prototype = page.getByTestId('professional-template-hierarchy-variants-test');
  await prototype.waitFor({ timeout: 30_000 });
  assert.equal(await prototype.getAttribute('data-active-variant'), 'diy');
  const diy = page.getByTestId('professional-hierarchy-diy-columns');
  assert.equal(await diy.getAttribute('data-domain-count'), '7');
  const initialGroupCount = Number(await diy.getAttribute('data-group-count'));
  const initialEntryCount = Number(await diy.getAttribute('data-entry-count'));
  const initialFieldCount = Number(await diy.getAttribute('data-field-count'));
  await assertLayout(page, prototype, '05-diy-initial');

  await page.getByRole('button', { name: '删除一级分类：怪物图鉴' }).click();
  assert.equal(await diy.getAttribute('data-domain-count'), '6');

  const domainColumn = page.getByRole('region', { name: 'DIY一级分类' });
  await domainColumn.getByRole('textbox', { name: '输入一级分类名称' }).fill('A');
  await domainColumn.getByRole('button', { name: '新增' }).click();
  assert.equal(await diy.getAttribute('data-domain-count'), '7');

  const groupColumn = page.getByRole('region', { name: 'DIY二级分组' });
  await groupColumn.getByRole('textbox', { name: '输入二级分组名称' }).fill('A分组');
  await groupColumn.getByRole('button', { name: '新增' }).click();
  assert.equal(Number(await diy.getAttribute('data-group-count')), initialGroupCount);

  const entryColumn = page.getByRole('region', { name: 'DIY三级设定' });
  await entryColumn.getByRole('textbox', { name: '输入三级设定名称' }).fill('A设定');
  await entryColumn.getByRole('button', { name: '新增' }).click();
  assert.equal(Number(await diy.getAttribute('data-entry-count')), initialEntryCount);

  const fieldColumn = page.getByRole('region', { name: 'DIY四级设定' });
  await fieldColumn.getByRole('textbox', { name: '输入四级设定名称' }).fill('A字段');
  await fieldColumn.getByRole('button', { name: '新增' }).click();
  assert.equal(Number(await diy.getAttribute('data-field-count')), initialFieldCount - 7);
  await assertLayout(page, prototype, '06-diy-added-a');

  await page.getByRole('button', { name: '删除四级设定：A字段' }).click();
  await page.getByRole('button', { name: '删除三级设定：A设定' }).click();
  await page.getByRole('button', { name: '删除二级分组：A分组' }).click();
  await page.getByRole('button', { name: '删除一级分类：A' }).click();
  assert.equal(await diy.getAttribute('data-domain-count'), '6');

  await page.getByRole('button', { name: '重置默认结构' }).click();
  assert.equal(await diy.getAttribute('data-domain-count'), '7');
  await page.getByRole('button', { name: '确认DIY结构' }).click();
  await page.getByText('当前 DIY 模板结构已确认。', { exact: true }).waitFor();

  assert.deepEqual(runtimeErrors, [], `renderer runtime errors:\n${runtimeErrors.join('\n')}`);
  process.stdout.write(`Professional hierarchy DIY desktop acceptance passed: ${JSON.stringify(windowGeometry)}\n`);
} finally {
  if (electronApp) await electronApp.close();
  await rm(userDataDir, { recursive: true, force: true });
}
