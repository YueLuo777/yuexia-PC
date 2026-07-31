import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-compact-navigation-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-compact-navigation-test');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '5186';

await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '作品概览 -> 测试板块 -> 24号测试：标准模式顶部导航紧凑方案',
  window: null,
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
    executablePath: electronExecutable,
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
      bounds: target.getBounds(),
      display: secondary.bounds,
      visible: target.isVisible(),
      focused: target.isFocused(),
    };
  });
  assert.equal(result.window.secondaryAvailable, true);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  stage = 'open test 24';
  await page.getByTitle('测试板块').click();
  const testCard = page.locator('button').filter({ hasText: '标准模式顶部导航紧凑方案' }).first();
  await testCard.scrollIntoViewIfNeeded();
  await testCard.click();
  const testPage = page.locator('[data-standard-compact-navigation-test="true"]');
  await testPage.waitFor();
  await page.getByText('24号测试：标准模式顶部导航紧凑方案', { exact: true }).waitFor();

  stage = 'inspect candidates';
  const navigationLabels = [
    '方案A紧凑分组导航',
    '方案B对齐流程轨导航',
    '方案C单行分区导航',
    '方案D共用外框导航',
    '方案E极简下划线导航',
  ];
  const metrics = {};
  for (const label of navigationLabels) {
    const navigation = page.getByRole('navigation', { name: label });
    await navigation.waitFor();
    metrics[label] = await navigation.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      buttonWidths: Array.from(element.querySelectorAll('button')).map((button) => button.getBoundingClientRect().width),
    }));
    assert.ok(metrics[label].buttonWidths.every((width) => width < 150));
  }
  result.metrics = metrics;
  result.assertions.fiveAllVisibleCandidatesVisible = true;
  result.assertions.allButtonsStayBelowOneHundredFiftyPixels = true;
  await capture('01-four-candidates');

  stage = 'exercise one-click cross-stage actions';
  for (const label of navigationLabels) {
    const navigation = page.getByRole('navigation', { name: label });
    assert.equal(await navigation.getByRole('button').count(), 9);
    const summary = navigation.getByRole('button', { name: '生成梗概' });
    await summary.click();
    assert.equal(await summary.getAttribute('aria-pressed'), 'true');
    const brainstorm = navigation.getByRole('button', { name: '脑洞库' });
    await brainstorm.click();
    assert.equal(await brainstorm.getAttribute('aria-pressed'), 'true');
  }
  result.assertions.allActionsRemainOneClickReachable = true;
  await capture('02-cross-stage-actions');

  assert.deepEqual(result.runtimeErrors, []);
  result.status = 'PASS';
} catch (error) {
  result.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  result.stage = stage;
  if (page) await capture('failure').catch(() => undefined);
  throw error;
} finally {
  await writeFile(resultPath, JSON.stringify(result, null, 2), 'utf8');
  if (app) await app.close().catch(() => undefined);
  await rm(userDataDir, { recursive: true, force: true });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
