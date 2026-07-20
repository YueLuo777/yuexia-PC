import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-route-smoke-'));
const routeRegistry = JSON.parse(await readFile(path.join(repoRoot, 'config', 'app-routes.json'), 'utf8'));
const routes = routeRegistry.formal.filter((route) => route.smoke).map((route) => route.path);
assert.ok(routes.length > 0, 'route registry should define formal smoke routes');
let electronApp;
let page;
const runtimeErrors = [];

try {
  electronApp = await electron.launch({
    executablePath: require('electron'),
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
  page = await electronApp.firstWindow({ timeout: 30_000 });
  const smokeWindowIsVisible = await electronApp.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0]?.isVisible(),
  );
  assert.equal(smokeWindowIsVisible, false, 'automated route smoke window should remain hidden');
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
  });
  await page.waitForLoadState('domcontentloaded');
  for (const route of routes) {
    const errorStart = runtimeErrors.length;
    await page.evaluate((nextRoute) => {
      globalThis.location.hash = `#${nextRoute}`;
    }, route);
    await page.waitForFunction((nextRoute) => globalThis.location.hash.startsWith(`#${nextRoute}`), route);
    await page.locator(`[data-route-ready="${route}"]`).waitFor({ timeout: 15_000 });
    const bodyText = await page.locator('body').innerText();
    assert.ok(bodyText.trim(), `${route} should render content`);
    assert.ok(!bodyText.includes('页面加载失败'), `${route} should not hit the error boundary`);
    assert.equal(
      runtimeErrors.length,
      errorStart,
      `${route} emitted runtime errors:\n${runtimeErrors.slice(errorStart).join('\n')}`,
    );
  }
  process.stdout.write(`Electron route smoke passed: ${routes.length} formal routes.\n`);
} finally {
  if (electronApp) await electronApp.close();
  await rm(userDataDir, { recursive: true, force: true });
}
