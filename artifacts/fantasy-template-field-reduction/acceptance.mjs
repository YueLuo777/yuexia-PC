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
const userDataDir = await mkdtemp(path.join(tmpdir(), 'yuexia-fantasy-reduction-'));
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
    localStorage.setItem('xinyuexia_show_internal_routes', '1');
    window.location.reload();
  });
  await page.getByTitle('测试板块').click();
  await page.getByRole('heading', { name: 'UI 与主题' }).waitFor({ timeout: 30_000 });
  await page.getByText('玄幻仙侠字段精简方案', { exact: true }).click();

  await page.getByRole('heading', { name: '玄幻仙侠设定字段精简方案' }).waitFor();
  await page.getByText('7类 · 19设定 · 155字段', { exact: true }).waitFor();
  const serialPlan = page.getByRole('button', { name: /B · 连载实用/ });
  assert.equal(await serialPlan.getAttribute('aria-pressed'), 'true');
  await page.getByText(/保留影响连续剧情/).waitFor();

  const storageBefore = await page.evaluate(() => JSON.stringify(localStorage));
  await page.screenshot({ path: path.join(currentDir, '01-recommended-serial-plan.png') });
  await page.getByRole('heading', { name: '具体保留字段' }).evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await page.getByText('主角·金手指规则', { exact: true }).waitFor();
  await page.getByText('势力·内部问题与当前状态', { exact: true }).waitFor({ state: 'detached' });
  await page.screenshot({ path: path.join(currentDir, '02-serial-specific-fields.png') });

  const stagedPlan = page.getByRole('button', { name: /E · 分阶段解锁/ });
  await stagedPlan.click();
  assert.equal(await stagedPlan.getAttribute('aria-pressed'), 'true');
  await page.getByText(/明确列出建书时的38项/).waitFor();
  await page.getByText('势力·内部问题与当前状态', { exact: true }).waitFor();
  await page.getByText(/不会修改玄幻仙侠模板/).waitFor();
  const storageAfter = await page.evaluate(() => JSON.stringify(localStorage));
  assert.equal(storageAfter, storageBefore, 'read-only comparison must not write local storage');

  const layout = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  assert.ok(layout.documentWidth <= layout.viewportWidth);
  await page.getByRole('heading', { name: '具体保留字段' }).evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: path.join(currentDir, '03-staged-specific-fields.png') });

  assert.deepEqual(runtimeErrors, [], `renderer runtime errors:\n${runtimeErrors.join('\n')}`);
  process.stdout.write(`Fantasy template field reduction acceptance passed: ${JSON.stringify(geometry)}\n`);
} finally {
  await app.close().catch(() => {});
  await rm(userDataDir, { recursive: true, force: true });
}
