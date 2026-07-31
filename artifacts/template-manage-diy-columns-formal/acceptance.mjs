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
const userDataDir = await mkdtemp(path.join(tmpdir(), 'yuexia-template-diy-formal-'));
const targetDisplayX = Number(process.env.YUEXIA_ACCEPTANCE_DISPLAY_X);
const runtimeErrors = [];

async function launchOnCodexDisplay() {
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
  assert.ok(geometry.bounds.x >= geometry.workArea.x, 'window should stay on the Codex display');
  assert.ok(
    geometry.bounds.x + geometry.bounds.width <= geometry.workArea.x + geometry.workArea.width,
    'window should not cross into the primary display',
  );
  return { app, page, geometry };
}

async function assertLayout(page, editor, screenshotName) {
  const geometry = await editor.evaluate((root) => ({
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
  assert.ok(geometry.rootScrollWidth <= geometry.rootWidth + 1, `${screenshotName} should stay inside editor width`);
  assert.ok(geometry.rootScrollHeight <= geometry.rootHeight + 1, `${screenshotName} should stay inside editor height`);
  await page.screenshot({ path: path.join(currentDir, `${screenshotName}.png`) });
}

let first;
let second;
try {
  assert.ok(Number.isFinite(targetDisplayX), 'verified Codex display x is required');
  first = await launchOnCodexDisplay();
  await first.page.getByText('模板管理', { exact: true }).click();
  const editor = first.page.getByRole('region', { name: '四栏DIY模板编辑器' });
  await editor.waitFor({ timeout: 30_000 });
  assert.equal(await editor.getAttribute('data-domain-count'), '7');
  const monsterDelete = editor.getByRole('button', { name: '删除一级分类：怪物图鉴' });
  const domainLock = editor.getByRole('button', { name: '一级删除已锁定，点击解锁' });
  assert.equal(await monsterDelete.isDisabled(), true);
  assert.equal((await domainLock.textContent())?.trim(), '解锁');
  await assertLayout(first.page, editor, '01-formal-default-locked');

  await domainLock.click();
  assert.equal(await monsterDelete.isDisabled(), false);
  const unlockedDomainLock = editor.getByRole('button', { name: '一级删除未锁定，点击锁定' });
  assert.equal((await unlockedDomainLock.textContent())?.trim(), '锁定');
  const deleteColor = await monsterDelete.evaluate((element) => getComputedStyle(element).color);
  assert.equal(deleteColor, 'rgb(239, 68, 68)');
  await assertLayout(first.page, editor, '01b-formal-unlocked-red-delete');
  await monsterDelete.click();
  assert.equal(await editor.getAttribute('data-domain-count'), '6');

  const domainColumn = editor.getByRole('region', { name: 'DIY一级分类' });
  await domainColumn.getByRole('textbox', { name: '输入一级分类名称' }).fill('A');
  await domainColumn.getByRole('button', { name: '新增' }).click();
  const groupColumn = editor.getByRole('region', { name: 'DIY二级分组' });
  await groupColumn.getByRole('textbox', { name: '输入二级分组名称' }).fill('A分组');
  await groupColumn.getByRole('button', { name: '新增' }).click();
  const entryColumn = editor.getByRole('region', { name: 'DIY三级设定' });
  await entryColumn.getByRole('textbox', { name: '输入三级设定名称' }).fill('A设定');
  await entryColumn.getByRole('button', { name: '新增' }).click();
  const fieldColumn = editor.getByRole('region', { name: 'DIY四级设定' });
  await fieldColumn.getByRole('textbox', { name: '输入四级设定名称' }).fill('A字段');
  await fieldColumn.getByRole('button', { name: '新增' }).click();

  await editor.getByRole('textbox', { name: '保存模板名称' }).fill('验收DIY模板');
  await editor.getByRole('button', { name: '保存到我的模板' }).click();
  await first.page.getByText('已保存“验收DIY模板”', { exact: true }).waitFor();
  const savedEditor = first.page.getByRole('region', { name: '四栏DIY模板编辑器' });
  assert.equal(await savedEditor.getAttribute('data-domain-count'), '7');
  await assertLayout(first.page, savedEditor, '02-formal-added-and-saved');

  await first.app.close();
  first = null;

  second = await launchOnCodexDisplay();
  await second.page.getByText('模板管理', { exact: true }).click();
  await second.page.getByRole('tab', { name: '我的模板' }).click();
  await second.page.getByRole('button', { name: /验收DIY模板/ }).click();
  const restoredEditor = second.page.getByRole('region', { name: '四栏DIY模板编辑器' });
  await restoredEditor.getByRole('button', { name: 'A', exact: true }).waitFor();
  assert.equal(await restoredEditor.getAttribute('data-domain-count'), '7');
  assert.equal(await restoredEditor.getByRole('button', { name: 'A', exact: true }).isVisible(), true);
  await restoredEditor.getByRole('button', { name: 'A', exact: true }).click();
  await restoredEditor.getByRole('button', { name: 'A分组', exact: true }).click();
  await restoredEditor.getByRole('button', { name: 'A设定', exact: true }).click();
  assert.equal(await restoredEditor.getByRole('button', { name: 'A字段', exact: true }).isVisible(), true);
  assert.equal(await restoredEditor.getByRole('button', { name: '怪物图鉴' }).count(), 0);
  await assertLayout(second.page, restoredEditor, '03-formal-restart-restored');

  assert.deepEqual(runtimeErrors, [], `renderer runtime errors:\n${runtimeErrors.join('\n')}`);
  process.stdout.write(`Formal template DIY columns desktop acceptance passed: ${JSON.stringify(second.geometry)}\n`);
} finally {
  if (first?.app) await first.app.close();
  if (second?.app) await second.app.close();
  await rm(userDataDir, { recursive: true, force: true });
}
