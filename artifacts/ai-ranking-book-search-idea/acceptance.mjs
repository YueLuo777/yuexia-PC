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
const userDataDir = await mkdtemp(path.join(tmpdir(), 'yuexia-book-search-idea-'));
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
  const unfinishedHeading = page.getByRole('heading', { name: '未做' });
  await unfinishedHeading.waitFor({ timeout: 30_000 });
  const ideaEntry = page.getByText('AI 排行榜找书', { exact: true });
  await ideaEntry.waitFor();
  await ideaEntry.click();

  await page.getByRole('heading', { name: 'AI 排行榜找书' }).waitFor();
  await page.getByText('仅记录，尚未实现', { exact: true }).waitFor();
  await page.getByText('用户可以提出的找书要求', { exact: true }).waitFor();
  await page.getByText('计划中的找书流程', { exact: true }).waitFor();
  await page.getByText('以后实现时必须保留的核对规则', { exact: true }).waitFor();
  assert.equal(await page.getByText(/不得编造书名、排名或来源/).count(), 1);

  const layout = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  assert.ok(layout.documentWidth <= layout.viewportWidth);
  await page.screenshot({ path: path.join(currentDir, '01-unfinished-book-search-idea.png') });

  assert.deepEqual(runtimeErrors, [], `renderer runtime errors:\n${runtimeErrors.join('\n')}`);
  process.stdout.write(`AI ranking book search idea acceptance passed: ${JSON.stringify(geometry)}\n`);
} finally {
  await app.close().catch(() => {});
  await rm(userDataDir, { recursive: true, force: true });
}
