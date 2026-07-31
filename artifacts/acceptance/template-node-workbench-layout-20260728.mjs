import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-node-layout-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'template-node-workbench-layout');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '5197';
await mkdir(evidenceDir, { recursive: true });

const result = { route: '测试板块 -> 26号测试', window: null, assertions: {}, screenshots: {}, runtimeErrors: [], status: 'FAIL' };
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
    env: { ...process.env, ELECTRON_DISABLE_SECURITY_WARNINGS: 'true', NODE_ENV: 'test', XINYUEXIA_SMOKE_HEADLESS: '1', XINYUEXIA_URL: `http://127.0.0.1:${port}/#/test-collection` },
    timeout: 30_000,
  });
  page = await app.firstWindow({ timeout: 30_000 });
  page.on('pageerror', (error) => result.runtimeErrors.push(`[${stage}] pageerror: ${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error' && !message.text().includes('Failed to load resource')) result.runtimeErrors.push(`[${stage}] console: ${message.text()}`); });
  await page.waitForLoadState('domcontentloaded');
  result.window = await app.evaluate(({ BrowserWindow, screen }) => {
    const target = BrowserWindow.getAllWindows()[0];
    const primary = screen.getPrimaryDisplay();
    const secondary = screen.getAllDisplays().find((display) => display.id !== primary.id);
    if (!secondary) return { secondaryAvailable: false };
    const width = Math.min(1900, secondary.workArea.width - 32);
    const height = Math.min(1080, secondary.workArea.height - 32);
    target.setBounds({ x: secondary.workArea.x + Math.floor((secondary.workArea.width - width) / 2), y: secondary.workArea.y + Math.floor((secondary.workArea.height - height) / 2), width, height });
    target.webContents.setZoomFactor(1);
    target.showInactive();
    return { secondaryAvailable: true, bounds: target.getBounds(), display: secondary.bounds, visible: target.isVisible(), focused: target.isFocused() };
  });
  assert.equal(result.window.secondaryAvailable, true);
  assert.equal(result.window.visible, true);
  await page.getByText('设定节点操作区布局方案', { exact: true }).click();
  await page.locator('[data-template-node-workbench-layout-test="true"]').waitFor({ timeout: 30_000 });
  const proposals = page.getByRole('region', { name: '操作区方案' });
  assert.equal(await proposals.getByText('聚合表单').count(), 1);
  assert.equal(await proposals.getByText('单任务操作台').count(), 1);
  assert.equal(await proposals.getByText('快捷命令栏').count(), 1);
  result.assertions.threeProposalsVisible = true;
  const panels = proposals.locator('article');
  const panelGeometry = await panels.evaluateAll((items) => items.map((item) => { const rect = item.getBoundingClientRect(); return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height }; }));
  assert.equal(panelGeometry.length, 3);
  assert.ok(panelGeometry.every((rect) => rect.width > 300 && rect.height > 600));
  result.geometry = panelGeometry;
  result.assertions.threePanelsHaveStableDimensions = true;
  await capture('01-three-layout-proposals');

  stage = 'interactions';
  await page.getByRole('button', { name: '中间级设定' }).click();
  const aInput = page.getByRole('textbox', { name: 'A方案新设定名称' });
  await page.getByRole('button', { name: '新增下级内部分类' }).first().click();
  assert.equal(await aInput.getAttribute('placeholder'), '输入下级内部分类名称');
  await aInput.fill('规则约束');
  await page.getByRole('button', { name: '新增下级内部分类' }).last().click();
  await page.getByText('新增下级内部分类“规则约束”。').waitFor();
  await page.getByRole('button', { name: '最后级子设定' }).click();
  assert.equal(await proposals.getByRole('button', { name: '新增下级' }).count(), 0);
  result.assertions.levelSwitchProtectsInvalidChildAction = true;
  await capture('02-level-switch-and-interaction');
  assert.deepEqual(result.runtimeErrors, []);
  result.status = 'PASS';
} catch (error) {
  result.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  result.stage = stage;
  if (page) await capture('failure').catch(() => undefined);
  throw error;
} finally {
  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  if (app) await app.close().catch(() => undefined);
  await rm(userDataDir, { recursive: true, force: true });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
