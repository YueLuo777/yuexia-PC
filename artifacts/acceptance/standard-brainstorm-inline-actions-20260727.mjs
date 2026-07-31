import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:https';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-brainstorm-inline-actions');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-brainstorm-inline-actions-'));
const appPort = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '4177';
await mkdir(evidenceDir, { recursive: true });

const certificatePath = path.join(userDataDir, 'acceptance-model.pfx');
const certificatePassword = 'xinyuexia-acceptance';
const escapedCertificatePath = certificatePath.replaceAll("'", "''");
execFileSync('powershell.exe', [
  '-NoProfile',
  '-NonInteractive',
  '-Command',
  `$cert = New-SelfSignedCertificate -DnsName 'localhost' -CertStoreLocation 'Cert:\\CurrentUser\\My'; `
    + `$password = ConvertTo-SecureString '${certificatePassword}' -AsPlainText -Force; `
    + `Export-PfxCertificate -Cert $cert -FilePath '${escapedCertificatePath}' -Password $password | Out-Null; `
    + `Remove-Item -LiteralPath ("Cert:\\CurrentUser\\My\\" + $cert.Thumbprint) -Force`,
]);
const certificate = await readFile(certificatePath);
const generatedContent = '书名：九霄吞噬\n卖点：主角觉醒吞噬天赋，通过战斗不断成长。';
const mockServer = createServer({ pfx: certificate, passphrase: certificatePassword }, (_request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });
  response.end(`data: ${JSON.stringify({ choices: [{ delta: { content: generatedContent } }] })}\n\ndata: [DONE]\n\n`);
});
await new Promise((resolve) => mockServer.listen(0, '127.0.0.1', resolve));
const mockAddress = mockServer.address();
assert.ok(mockAddress && typeof mockAddress === 'object');
const modelBaseUrl = `https://localhost:${mockAddress.port}/v1`;

const result = {
  route: '标准模式书籍 -> 进入工作台 -> 生成脑洞 -> 生成完成 -> 复制内容/保存脑洞',
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
      XINYUEXIA_URL: `http://127.0.0.1:${appPort}/#/novels`,
      NODE_TLS_REJECT_UNAUTHORIZED: '0',
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
    const width = Math.min(1900, secondary.workArea.width - 32);
    const height = Math.min(1080, secondary.workArea.height - 32);
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

  const secretResult = await page.evaluate(async ({ modelBaseUrl: baseUrl }) => {
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([{
      id: 991,
      title: '脑洞按钮位置验收书籍',
      type: 'novel',
      category: '玄幻',
      channel: 'male',
      synopsis: '',
      wordCount: 0,
      createdAt: '2026/7/27',
      lastModifiedAt: '2026/7/27',
    }]));
    localStorage.setItem('xinyuexia_current_novel_id', '991');
    localStorage.setItem('xinyuexia_global_brainstorm_library_v1', '[]');
    localStorage.setItem('xinyuexia_api_settings_v1', JSON.stringify({
      models: [{
        id: 'acceptance-model',
        instanceId: 'acceptance-model-instance',
        name: '本地验收模型',
        enabled: true,
        baseUrl,
        apiKey: '',
        hasApiKey: true,
        model: 'acceptance-model',
        provider: 'openai-compatible',
        temperature: 0.7,
      }],
    }));
    localStorage.setItem('xinyuexia_active_model_id', 'acceptance-model');
    return window.xinyuexiaModelSecrets?.set('acceptance-model-instance', 'acceptance-key');
  }, { modelBaseUrl });
  assert.equal(secretResult?.ok, true);

  await page.reload();
  await page.getByTestId('standard-mode-novel-card').waitFor();
  await page.getByRole('button', { name: '进入工作台' }).click();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor();
  await page.getByRole('button', { name: '生成脑洞', exact: true }).click();
  await page.getByRole('heading', { name: '生成条件' }).waitFor();

  stage = 'generate brainstorm';
  await page.getByLabel('其他要求').fill('开局冲突明确，主角主动行动。');
  await page.getByRole('button', { name: '开始生成脑洞' }).click();
  await page.getByLabel('脑洞预览内容').waitFor();
  await assert.doesNotReject(() => page.getByLabel('脑洞预览内容').waitFor({ state: 'visible' }));
  await page.getByLabel('脑洞预览内容').evaluate((element, expected) => {
    if (element.value !== expected) throw new Error(`Unexpected generated content: ${element.value}`);
  }, generatedContent);

  stage = 'inline actions';
  assert.equal(await page.getByText('脑洞已生成，确认内容后点击保存脑洞。', { exact: true }).count(), 0);
  const geometry = await page.locator('[data-brainstorm-revision-field="professional-inline-input"]').evaluate((field) => {
    const inputField = field.querySelector('.xy-floating-field');
    const actions = field.querySelector('[data-brainstorm-generation-actions="inline-under-revision-input"]');
    const copyButton = [...actions.querySelectorAll('button')].find((button) => button.textContent?.trim() === '复制内容');
    const saveButton = [...actions.querySelectorAll('button')].find((button) => button.textContent?.trim() === '保存脑洞');
    const rect = (element) => element.getBoundingClientRect().toJSON();
    return {
      inputField: rect(inputField),
      actions: rect(actions),
      copyButton: rect(copyButton),
      saveButton: rect(saveButton),
      actionsParentIsField: actions.parentElement === field,
    };
  });
  result.measurements = geometry;
  assert.equal(geometry.actionsParentIsField, true);
  assert.ok(geometry.actions.top - geometry.inputField.bottom >= 7);
  assert.ok(geometry.actions.top - geometry.inputField.bottom <= 10);
  assert.ok(geometry.copyButton.right < geometry.saveButton.left);
  result.assertions.generatedInstructionRemoved = true;
  result.assertions.actionsAreAttachedToInput = true;
  result.assertions.copyAndSaveOrderIsCorrect = true;
  await capture('01-generated-actions-attached');

  stage = 'save brainstorm';
  await page.getByRole('button', { name: '保存脑洞' }).click();
  await page.getByRole('status').filter({ hasText: '保存到脑洞库' }).waitFor();
  const savedCount = await page.evaluate(() => JSON.parse(
    localStorage.getItem('xinyuexia_global_brainstorm_library_v1') ?? '[]',
  ).length);
  assert.equal(savedCount, 1);
  result.assertions.saveStillWorks = true;
  await capture('02-saved-result');

  assert.deepEqual(result.runtimeErrors, []);
  result.assertions.noRuntimeErrors = true;
  result.status = 'PASS';
} catch (error) {
  result.error = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack ?? ''}` : String(error);
} finally {
  if (app) await app.close().catch(() => undefined);
  await new Promise((resolve) => mockServer.close(resolve));
  await rm(userDataDir, { recursive: true, force: true }).catch(() => undefined);
  await writeFile(resultPath, JSON.stringify(result, null, 2), 'utf8');
}

console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exitCode = 1;
