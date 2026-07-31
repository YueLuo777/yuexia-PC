import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-mode-prompt-and-setting-flow');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-standard-setting-flow-'));
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '4179';
await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '标准模式作品 -> 生成脑洞 -> 脑洞库 -> 作品设定 -> 内置提示词',
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
    executablePath: require('electron'),
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
    const codexDisplay = screen.getDisplayNearestPoint({ x: 2050, y: 100 });
    const width = Math.min(1900, codexDisplay.workArea.width - 32);
    const height = Math.min(1080, codexDisplay.workArea.height - 32);
    target.setBounds({
      x: codexDisplay.workArea.x + Math.floor((codexDisplay.workArea.width - width) / 2),
      y: codexDisplay.workArea.y + Math.floor((codexDisplay.workArea.height - height) / 2),
      width,
      height,
    });
    target.showInactive();
    return {
      displayCount: screen.getAllDisplays().length,
      codexDisplayId: codexDisplay.id,
      primaryDisplayId: primary.id,
      visible: target.isVisible(),
      focused: target.isFocused(),
      bounds: target.getBounds(),
      display: codexDisplay.bounds,
    };
  });
  assert.notEqual(result.window.codexDisplayId, result.window.primaryDisplayId);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  await page.evaluate(() => {
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([{
      id: 996,
      title: '标准流程验收书籍',
      type: 'novel',
      category: '玄幻',
      channel: 'male',
      synopsis: '',
      wordCount: 0,
      createdAt: '2026/7/27',
      lastModifiedAt: '2026/7/27',
    }]));
    localStorage.setItem('xinyuexia_current_novel_id', '996');
    localStorage.setItem('xinyuexia_volumes_v1', JSON.stringify({ 996: [] }));
    localStorage.setItem('xinyuexia_global_brainstorm_library_v1', JSON.stringify([{
      id: 'acceptance-brainstorm-1',
      tab: '脑洞',
      title: '古镜吞天',
      content: JSON.stringify({ type: '脑洞库', body: '少年得到古镜，可以吞噬敌人的功法。' }),
      updatedAt: '2026/7/27',
      brainstormSerialNumber: 1,
    }]));
  });
  await page.goto(`http://127.0.0.1:${port}/#/workbench`);
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });

  stage = 'generation brainstorm selection opens library';
  await page.getByRole('button', { name: '生成脑洞', exact: true }).click();
  await page.getByRole('heading', { name: '脑洞生成条件' }).waitFor();
  await page.getByRole('button', { name: /古镜吞天/ }).click();
  await page.getByRole('button', { name: '脑洞库', exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: '脑洞库', exact: true }).getAttribute('aria-current'), 'page');
  assert.equal(await page.getByRole('heading', { name: '脑洞生成条件' }).count(), 0);
  assert.equal(await page.getByLabel('脑洞预览内容').inputValue(), '少年得到古镜，可以吞噬敌人的功法。');
  result.assertions.generationSelectionOpensLibrary = true;
  await capture('01-brainstorm-library-after-selection');

  stage = 'standard setting operation panel';
  await page.getByRole('button', { name: '开始设定', exact: true }).click();
  await page.getByRole('button', { name: '确认模板并创建设定' }).click();
  const settingGenerationPanel = page.locator('[data-standard-setting-generation-panel="true"]');
  await settingGenerationPanel.waitFor({ timeout: 30_000 });
  for (const name of ['世界基础', '剧情规划', '主要人物', '地点与势力', '创作补充']) {
    await page.getByText(new RegExp(name)).first().waitFor();
  }
  assert.equal(await settingGenerationPanel.getByText('模型', { exact: true }).count(), 0);
  assert.equal(await settingGenerationPanel.getByText('提示词', { exact: true }).count(), 0);
  result.assertions.standardSettingUsesFiveStepPanelWithoutSelectors = true;
  await capture('02-standard-setting-five-step-panel');

  stage = 'missing model failure path';
  await page.getByRole('button', { name: '一键生成全部' }).click();
  await page.getByRole('button', { name: '重试当前步骤' }).waitFor({ timeout: 10_000 });
  await page.getByRole('alert').waitFor();
  assert.match(await page.getByRole('alert').innerText(), /生成失败|无法识别/);
  result.assertions.missingModelStopsOnCurrentStep = true;

  stage = 'built-in prompt manager';
  const promptButton = page.getByRole('button', { name: '提示词', exact: true });
  const modeButton = page.getByRole('button', { name: '进入专业模式', exact: true });
  const positions = await Promise.all([promptButton, modeButton].map(async (locator) => locator.boundingBox()));
  assert.ok(positions[0] && positions[1] && positions[0].x < positions[1].x);
  assert.equal(await page.getByRole('button', { name: /测试模式/ }).count(), 0);
  await promptButton.click();
  await page.getByRole('dialog', { name: '内置提示词管理' }).waitFor();
  await page.getByText('内置', { exact: true }).first().waitFor();
  result.assertions.promptManagerIsLeftOfModeAndOpensBuiltInCategory = true;
  await capture('03-built-in-prompt-manager');

  assert.deepEqual(result.runtimeErrors, []);
  result.assertions.noRuntimeErrors = true;
  result.status = 'PASS';
} catch (error) {
  result.error = `${error?.stack ?? error}`;
  if (page) {
    try {
      await capture('failure');
    } catch {
      // Keep the original acceptance failure.
    }
  }
} finally {
  if (app) await app.close();
  await rm(userDataDir, { recursive: true, force: true });
  await writeFile(resultPath, JSON.stringify(result, null, 2), 'utf8');
}

console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exitCode = 1;
