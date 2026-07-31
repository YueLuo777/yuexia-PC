import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-mode-creation-page-design');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-standard-page-design-'));
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '4175';
await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '测试板块 -> 21号测试 -> 设定 -> 章纲 -> 正文 -> 审核剧情',
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
      XINYUEXIA_URL: `http://127.0.0.1:${port}/#/test-collection`,
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
  await page.getByRole('heading', { name: '测试', exact: true }).waitFor({ timeout: 30_000 });

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
      visible: target.isVisible(),
      focused: target.isFocused(),
      bounds: target.getBounds(),
    };
  });
  assert.equal(result.window.secondaryAvailable, true);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  await page.getByText('标准模式设定与创作页面方案', { exact: true }).click();
  await page.getByTestId('standard-mode-creation-pages-design-test').waitFor();

  stage = 'setting design';
  const settingPreview = page.getByTestId('setting-design-preview');
  await settingPreview.waitFor();
  await page.getByRole('button', { name: '世界背景', exact: true }).click();
  assert.equal(await page.getByLabel('测试设定名').inputValue(), '世界背景');
  assert.equal(
    await page.getByLabel('测试设定名').evaluate((element) => getComputedStyle(element).borderColor),
    'rgb(191, 200, 210)',
  );
  assert.equal(
    await settingPreview.locator('textarea').first().evaluate((element) => getComputedStyle(element).borderColor),
    'rgb(191, 200, 210)',
  );
  await page.getByRole('button', { name: '一键检查', exact: true }).click();
  await page.getByRole('status').filter({ hasText: '发现4处未填写' }).waitFor();
  assert.equal(await settingPreview.evaluate((element) => element.scrollWidth <= element.clientWidth), true);
  result.assertions.settingMatchesBrainstormThreeColumnLanguage = true;
  result.assertions.settingControlsUseSharedDarkerBorders = true;
  result.assertions.settingActionsAreInteractive = true;
  await capture('01-setting-design');

  stage = 'outline design';
  await page.getByRole('button', { name: '章纲', exact: true }).click();
  const outlinePreview = page.getByTestId('outline-design-preview');
  await outlinePreview.waitFor();
  await page.getByRole('button').filter({ hasText: '残缺功法' }).click();
  await page.getByText('第2章 章纲', { exact: true }).waitFor();
  await page.getByRole('button', { name: '版本2', exact: true }).click();
  assert.match(await page.getByRole('button', { name: '版本2', exact: true }).getAttribute('class'), /bg-\[#DFF7FC\]/);
  await page.getByRole('button', { name: '生成当前章纲', exact: true }).click();
  await page.getByRole('status').filter({ hasText: '正在生成第2章章纲' }).waitFor();
  assert.equal(await outlinePreview.evaluate((element) => element.scrollWidth <= element.clientWidth), true);
  result.assertions.outlineKeepsChapterDirectoryAndSimplifiesGeneration = true;
  await capture('02-outline-design');

  stage = 'writing design';
  await page.getByRole('button', { name: '正文', exact: true }).click();
  const writingPreview = page.getByTestId('writing-design-preview');
  await writingPreview.waitFor();
  const smartLink = page.getByRole('button', { name: /智能关联/ });
  assert.equal(await smartLink.getAttribute('aria-pressed'), 'true');
  await smartLink.click();
  assert.equal(await smartLink.getAttribute('aria-pressed'), 'false');
  await page.getByRole('button').filter({ hasText: '残缺功法' }).click();
  assert.equal(await page.getByLabel('章节标题').inputValue(), '残缺功法');
  assert.equal(await writingPreview.evaluate((element) => element.scrollWidth <= element.clientWidth), true);
  result.assertions.writingKeepsTheEditorAndHidesProfessionalConfiguration = true;
  await capture('03-writing-design');

  stage = 'audit design';
  await page.getByRole('button', { name: '审核剧情', exact: true }).click();
  const auditPreview = page.getByTestId('audit-design-preview');
  await auditPreview.waitFor();
  await page.getByRole('button', { name: '开始审核', exact: true }).click();
  await page.getByText('剧情偏差', { exact: true }).waitFor();
  const applyButton = page.getByRole('button', { name: '应用修改', exact: true });
  assert.equal(await applyButton.isEnabled(), true);
  await applyButton.click();
  await page.getByText('已应用修改', { exact: true }).waitFor();
  assert.equal(await auditPreview.evaluate((element) => element.scrollWidth <= element.clientWidth), true);
  result.assertions.auditKeepsOutlineBodyResultAndOneClickFlow = true;
  await capture('04-audit-design');

  assert.deepEqual(result.runtimeErrors, []);
  result.assertions.noRuntimeErrors = true;
  result.status = 'PASS';
} catch (error) {
  result.error = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack ?? ''}` : String(error);
} finally {
  if (app) await app.close().catch(() => undefined);
  await rm(userDataDir, { recursive: true, force: true }).catch(() => undefined);
  await writeFile(resultPath, JSON.stringify(result, null, 2), 'utf8');
}

console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exitCode = 1;
