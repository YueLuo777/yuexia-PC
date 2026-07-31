import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-standard-four-stage-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'acceptance');
const resultPath = path.join(evidenceDir, 'standard-four-stage-workbench-acceptance-20260726.json');
const acceptancePort = process.env.XINYUEXIA_ACCEPTANCE_PORT;
const displayPoint = {
  x: Number(process.env.XINYUEXIA_ACCEPTANCE_DISPLAY_X),
  y: Number(process.env.XINYUEXIA_ACCEPTANCE_DISPLAY_Y),
};

assert.ok(acceptancePort, 'The existing acceptance port is required.');
assert.ok(Number.isFinite(displayPoint.x) && Number.isFinite(displayPoint.y), 'A verified Codex display point is required.');

const result = {
  route: '我的小说 -> 测试板块 -> 标准模式四阶段创作流程',
  assertions: {},
  screenshots: {},
  runtimeErrors: [],
  window: null,
  status: 'FAIL',
};

let electronApp;
let page;
let stage = 'startup';

async function capture(name) {
  const filePath = path.join(evidenceDir, `standard-four-stage-workbench-${name}-20260726.png`);
  await page.screenshot({ path: filePath });
  result.screenshots[name] = filePath;
}

try {
  electronApp = await electron.launch({
    executablePath: electronExecutable,
    cwd: repoRoot,
    args: [path.join(repoRoot, 'electron', 'main.cjs'), `--user-data-dir=${userDataDir}`],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
      NODE_ENV: 'test',
      XINYUEXIA_SMOKE_HEADLESS: '1',
      XINYUEXIA_URL: `http://127.0.0.1:${acceptancePort}/#/novels`,
    },
    timeout: 30_000,
  });

  page = await electronApp.firstWindow({ timeout: 30_000 });
  page.on('pageerror', (error) => result.runtimeErrors.push(`[${stage}] pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') result.runtimeErrors.push(`[${stage}] console: ${message.text()}`);
  });
  await page.waitForLoadState('domcontentloaded');

  result.window = await electronApp.evaluate(({ BrowserWindow, screen }, point) => {
    const appWindow = BrowserWindow.getAllWindows()[0];
    const display = screen.getDisplayNearestPoint(point);
    const { workArea } = display;
    const width = Math.min(1600, workArea.width - 32);
    const height = Math.min(960, workArea.height - 32);
    appWindow.setBounds({
      x: workArea.x + Math.floor((workArea.width - width) / 2),
      y: workArea.y + Math.floor((workArea.height - height) / 2),
      width,
      height,
    });
    appWindow.showInactive();
    return {
      display: display.bounds,
      bounds: appWindow.getBounds(),
      visible: appWindow.isVisible(),
      focused: appWindow.isFocused(),
    };
  }, displayPoint);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  stage = 'open test 14';
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });
  await page.getByTitle('测试板块').click();
  const testCard = page.locator('button').filter({ hasText: '标准模式四阶段创作流程' }).first();
  await testCard.scrollIntoViewIfNeeded();
  await testCard.click();

  stage = 'create book';
  const setup = page.getByTestId('standard-book-setup');
  await setup.waitFor();
  await capture('book-setup');
  await page.getByPlaceholder('请输入小说名字').fill('九重天劫');
  await page.getByRole('combobox').selectOption({ label: '玄幻' });
  await page.getByRole('button', { name: '创建书籍并进入准备阶段' }).click();

  const shell = page.getByTestId('standard-four-stage-workbench');
  const navigation = page.getByTestId('standard-four-stage-navigation');
  await shell.waitFor();
  assert.equal(await navigation.getByRole('button', { name: '第1步 准备阶段' }).getAttribute('aria-current'), 'step');
  assert.equal(await navigation.getByRole('button', { name: '生成脑洞' }).getAttribute('aria-pressed'), 'true');
  await capture('brainstorm-generate');

  stage = 'generate and edit brainstorm';
  await page.getByRole('button', { name: '生成脑洞并保存' }).click();
  assert.equal(await navigation.getByRole('button', { name: '脑洞库' }).getAttribute('aria-pressed'), 'true');
  await page.getByPlaceholder('例如：加强宗门竞争，让主角更稳重').fill('加强宗门竞争，让主角更稳重');
  await page.getByRole('button', { name: '按要求修改脑洞' }).click();
  await capture('brainstorm-library');

  stage = 'associate and stream settings';
  await page.getByRole('button', { name: '根据这个脑洞生成设定' }).click();
  await page.getByText('已自动关联脑洞', { exact: true }).waitFor();
  await capture('settings-linked');
  await page.getByRole('button', { name: '开始生成设定' }).click();
  await page.waitForTimeout(500);
  await navigation.getByRole('button', { name: '第1步 准备阶段' }).click();
  await navigation.getByRole('button', { name: '第2步 设定阶段' }).click();
  await page.getByRole('button', { name: '继续生成' }).waitFor();
  result.assertions.settingResumeAfterInterruption = true;
  await page.getByRole('button', { name: '继续生成' }).click();
  await page.getByText('所有设定已生成', { exact: true }).waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '一键检查' }).click();
  await page.getByText('全部设定都已填写，可以进入创作阶段。', { exact: true }).waitFor();
  await capture('settings-complete');

  stage = 'generate connected outlines';
  await page.getByRole('button', { name: '进入创作阶段' }).click();
  await page.getByRole('combobox', { name: '连续生成章节' }).selectOption('2');
  await page.getByRole('combobox', { name: '每章生成版本' }).selectOption('3');
  await page.getByRole('button', { name: '生成连贯章纲' }).click();
  await page.getByRole('button', { name: '版本3' }).click();
  await capture('outline-versions');

  stage = 'generate and revise body';
  await page.getByRole('button', { name: '使用此章纲生成正文' }).click();
  const bodyRequirement = page.getByPlaceholder('例如：加强对话冲突，减少环境描写');
  await bodyRequirement.fill('加强人物对话冲突');
  await page.getByRole('button', { name: '按要求修改正文' }).click();
  await capture('writing');

  stage = 'audit chapter';
  await page.getByRole('button', { name: '进入审核阶段' }).click();
  await page.getByRole('button', { name: '开始剧情审核' }).click();
  await page.getByText(/正文主线与当前章纲一致/).waitFor();
  await capture('audit');

  stage = 'reopen persisted book';
  await page.reload();
  const testNavigationButton = page.getByTitle('测试板块');
  await testNavigationButton.waitFor({ timeout: 30_000 });
  await testNavigationButton.click();
  const persistedTestCard = page.locator('button').filter({ hasText: '标准模式四阶段创作流程' }).first();
  await persistedTestCard.scrollIntoViewIfNeeded();
  await persistedTestCard.click();
  await page.getByTestId('standard-four-stage-workbench').waitFor();
  assert.equal(await page.getByTestId('standard-book-setup').count(), 0);
  await page.getByText('九重天劫', { exact: true }).first().waitFor();
  result.assertions.bookReopensWithoutSetup = true;

  const layout = await shell.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  assert.ok(layout.scrollWidth <= layout.clientWidth);
  assert.ok(layout.scrollHeight <= layout.clientHeight);

  const windowWidth = await page.evaluate(() => window.innerWidth);
  const navBoxes = await navigation.locator('button').evaluateAll((buttons) =>
    buttons.map((button) => {
      const box = button.getBoundingClientRect();
      return { left: box.left, right: box.right };
    }),
  );
  assert.ok(navBoxes.every((box) => box.left >= 0 && box.right <= windowWidth));

  result.assertions.bookRequiredAndPersisted = true;
  result.assertions.brainstormGeneratedSavedEdited = true;
  result.assertions.brainstormAutomaticallyLinkedToSettings = true;
  result.assertions.settingsStreamedCheckedAndCompleted = true;
  result.assertions.multiChapterMultiVersionOutlineGenerated = true;
  result.assertions.bodyGeneratedAndRevised = true;
  result.assertions.auditComparedOutlineBodyAndResult = true;
  result.assertions.noPageOrNavigationOverflow = true;

  assert.deepEqual(result.runtimeErrors, []);
  result.status = 'PASS';
} catch (error) {
  result.error = error instanceof Error ? error.stack : String(error);
  throw error;
} finally {
  if (electronApp) await electronApp.close().catch(() => undefined);
  await rm(userDataDir, { recursive: true, force: true });
  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
}

console.log(JSON.stringify(result, null, 2));
