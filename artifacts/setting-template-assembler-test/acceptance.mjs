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
const userDataDir = await mkdtemp(path.join(tmpdir(), 'yuexia-template-assembler-'));
const targetDisplayX = Number(process.env.YUEXIA_ACCEPTANCE_DISPLAY_X);
const runtimeErrors = [];
let electronApp;

try {
  assert.ok(Number.isFinite(targetDisplayX), 'target display x must be provided after read-only monitor detection');
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
  assert.ok(windowGeometry?.visible, 'Electron window should be visible for desktop acceptance');
  assert.ok(windowGeometry.bounds.x >= windowGeometry.workArea.x, 'window should stay on the Codex display');
  assert.ok(
    windowGeometry.bounds.x + windowGeometry.bounds.width <= windowGeometry.workArea.x + windowGeometry.workArea.width,
    'window should not cross into another display',
  );

  await page.evaluate(() => {
    localStorage.setItem('xinyuexia_show_internal_routes', '1');
    location.hash = '#/test-collection';
    location.reload();
  });
  await page.getByText('快速设定模板装配器方案', { exact: true }).waitFor({ timeout: 30_000 });
  await page.getByText('快速设定模板装配器方案', { exact: true }).click();

  const prototype = page.getByTestId('setting-template-assembler-test');
  await prototype.waitFor({ timeout: 30_000 });
  await page.screenshot({ path: path.join(currentDir, '01-standard-template.png') });

  const initialLayout = await prototype.evaluate((root) => {
    const viewportWidth = document.documentElement.clientWidth;
    const rootRect = root.getBoundingClientRect();
    const panels = [...root.querySelectorAll('aside, section')].map((element) => element.getBoundingClientRect());
    return {
      viewportWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      rootRect: { left: rootRect.left, right: rootRect.right, top: rootRect.top, bottom: rootRect.bottom },
      panelsInside: panels.every((rect) => rect.left >= rootRect.left - 1 && rect.right <= rootRect.right + 1),
    };
  });
  assert.ok(initialLayout.documentScrollWidth <= initialLayout.viewportWidth, 'page should have no horizontal overflow');
  assert.ok(initialLayout.panelsInside, 'all three columns should stay inside the prototype region');

  const standardCount = Number(await prototype.getAttribute('data-selected-total'));
  assert.ok(standardCount > 0, 'standard template should select recommended fields');
  await page.getByRole('button', { name: /精简模板/ }).click();
  const compactCount = Number(await prototype.getAttribute('data-selected-total'));
  assert.ok(compactCount < standardCount, 'compact preset should contain fewer fields');
  await page.getByRole('button', { name: /完整模板/ }).click();
  const completeCount = Number(await prototype.getAttribute('data-selected-total'));
  assert.ok(completeCount > standardCount, 'complete preset should contain more fields');

  await page.getByRole('checkbox', { name: '小说类型' }).click();
  for (const name of [/精简模板/, /标准模板/, /完整模板/]) {
    assert.equal(await page.getByRole('button', { name }).getAttribute('aria-pressed'), 'false');
  }

  const firstEntryCard = prototype.locator('article').first();
  await firstEntryCard.getByRole('button', { name: '选择全部' }).click();
  await firstEntryCard.getByRole('button', { name: '清空本组' }).click();
  assert.equal(await page.getByRole('checkbox', { name: '小说类型' }).isChecked(), false);

  const search = page.getByRole('textbox', { name: '搜索全部设定' });
  await search.fill('金手指限制');
  await page.getByText(/人物设定.*主角.*男主角.*金手指限制与代价/).waitFor();
  await page.screenshot({ path: path.join(currentDir, '02-search-result.png') });
  await search.fill('');

  const summary = page.getByRole('complementary', { name: '我的模板汇总' });
  await summary.getByRole('button', { name: /^人物设定/ }).click();
  assert.equal(await page.getByRole('button', { name: '主角', exact: true }).getAttribute('aria-pressed'), 'true');

  await page.getByRole('button', { name: '清空全部' }).click();
  assert.equal(await prototype.getAttribute('data-selected-total'), '0');
  assert.equal(await page.getByRole('button', { name: '使用当前模板' }).isDisabled(), true);
  await page.getByRole('button', { name: '恢复推荐' }).click();
  assert.equal(Number(await prototype.getAttribute('data-selected-total')), standardCount);
  await page.getByRole('button', { name: '保存为我的模板' }).click();
  await page.getByText(/已把当前.*保存为/).waitFor();
  await page.getByRole('button', { name: '使用当前模板' }).click();
  await page.getByText(/已使用当前模板/).waitFor();
  await page.screenshot({ path: path.join(currentDir, '03-restored-and-used.png') });

  assert.deepEqual(runtimeErrors, [], `renderer runtime errors:\n${runtimeErrors.join('\n')}`);
  process.stdout.write(`Desktop acceptance passed on display x=${targetDisplayX}: ${JSON.stringify(windowGeometry)}\n`);
} finally {
  if (electronApp) await electronApp.close();
  await rm(userDataDir, { recursive: true, force: true });
}
