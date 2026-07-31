import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const evidenceDir = path.join(repoRoot, 'artifacts', 'v6-brainstorm-generator');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-v6-brainstorm-generator-'));
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '4175';
await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '标准模式书籍 -> 进入工作台 -> 准备阶段 -> 生成脑洞',
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

async function readLayout() {
  return page.getByLabel('其他要求').evaluate((textarea) => {
    const field = textarea.closest('[data-brainstorm-other-requirements="true"]');
    const generator = textarea.closest('aside');
    const body = generator?.querySelector('[data-brainstorm-generation-fields="true"]');
    const heading = field?.firstElementChild;
    const generateButton = [...(generator?.querySelectorAll('button') ?? [])]
      .find((button) => button.textContent?.trim() === '开始生成脑洞');
    const rect = (target) => {
      const bounds = target.getBoundingClientRect();
      return {
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        bottom: bounds.bottom,
        width: bounds.width,
        height: bounds.height,
      };
    };
    return {
      textarea: rect(textarea),
      field: rect(field),
      generator: rect(generator),
      body: rect(body),
      heading: rect(heading),
      generateButton: rect(generateButton),
      headingText: heading?.textContent?.trim(),
      headingTag: heading?.tagName,
      textareaBorderColor: getComputedStyle(textarea).borderColor,
      textareaResize: getComputedStyle(textarea).resize,
      generatorScrollWidth: generator.scrollWidth,
      generatorClientWidth: generator.clientWidth,
    };
  });
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

  await page.evaluate(() => {
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([{
      id: 971,
      title: '脑洞页面验收书籍',
      type: 'novel',
      category: '玄幻',
      channel: 'male',
      synopsis: '',
      wordCount: 0,
      createdAt: '2026/7/27',
      lastModifiedAt: '2026/7/27',
    }]));
    localStorage.setItem('xinyuexia_current_novel_id', '971');
  });
  await page.reload();
  await page.getByTestId('standard-mode-novel-card').waitFor();
  await page.getByRole('button', { name: '进入工作台' }).click();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor();
  await page.getByRole('button', { name: '生成脑洞', exact: true }).click();
  await page.getByRole('heading', { name: '生成条件' }).waitFor();

  stage = 'normal window layout';
  await page.getByLabel('其他要求').fill('主角行动要主动，开局冲突要明确。');
  const normal = await readLayout();
  result.measurements = { normal };
  assert.equal(normal.headingText, '其他要求');
  assert.equal(normal.headingTag, 'SPAN');
  assert.ok(normal.heading.bottom < normal.textarea.top);
  assert.ok(normal.textarea.height >= 130);
  assert.ok(normal.generateButton.top - normal.textarea.bottom >= 12);
  assert.ok(normal.generateButton.top - normal.textarea.bottom <= 40);
  assert.equal(normal.textareaResize, 'none');
  assert.ok(normal.generatorScrollWidth <= normal.generatorClientWidth);
  result.assertions.titleIsAboveTheTextarea = true;
  result.assertions.textareaFillsRemainingGeneratorHeight = true;
  result.assertions.generateButtonRemainsVisible = true;
  result.assertions.noHorizontalOverflow = true;
  await capture('01-generator-normal-window');

  stage = 'compact window layout';
  await app.evaluate(({ BrowserWindow, screen }) => {
    const target = BrowserWindow.getAllWindows()[0];
    const primary = screen.getPrimaryDisplay();
    const secondary = screen.getAllDisplays().find((display) => display.id !== primary.id);
    if (!secondary) return;
    const width = Math.min(1400, secondary.workArea.width - 32);
    const height = Math.min(900, secondary.workArea.height - 32);
    target.setBounds({
      x: secondary.workArea.x + Math.floor((secondary.workArea.width - width) / 2),
      y: secondary.workArea.y + Math.floor((secondary.workArea.height - height) / 2),
      width,
      height,
    });
    target.showInactive();
  });
  await page.waitForTimeout(300);
  const compact = await readLayout();
  result.measurements.compact = compact;
  assert.ok(compact.textarea.height >= 130);
  assert.ok(compact.generateButton.top - compact.textarea.bottom >= 12);
  assert.ok(compact.generateButton.top - compact.textarea.bottom <= 40);
  assert.ok(compact.generatorScrollWidth <= compact.generatorClientWidth);
  result.assertions.compactWindowKeepsTheExpandableTextarea = true;
  result.assertions.compactWindowKeepsTheGenerateButtonVisible = true;
  await capture('02-generator-compact-window');

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
