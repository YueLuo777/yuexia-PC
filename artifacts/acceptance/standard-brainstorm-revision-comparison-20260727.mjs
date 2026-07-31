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
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-brainstorm-revision-comparison');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-brainstorm-revision-'));
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

const revisedContent = 'AI修改后的脑洞：主角在宗门大比前暴露吞噬能力，引来长老追杀，并被迫提前进入禁地。';
const mockServer = createServer({ pfx: certificate, passphrase: certificatePassword }, (_request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });
  const midpoint = Math.floor(revisedContent.length / 2);
  const chunks = [revisedContent.slice(0, midpoint), revisedContent.slice(midpoint)];
  chunks.forEach((content, index) => {
    response.write(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`);
    if (index === chunks.length - 1) response.end('data: [DONE]\n\n');
  });
});
await new Promise((resolve) => mockServer.listen(0, '127.0.0.1', resolve));
const mockAddress = mockServer.address();
assert.ok(mockAddress && typeof mockAddress === 'object');
const modelBaseUrl = `https://localhost:${mockAddress.port}/v1`;

const result = {
  route: '标准模式书籍 -> 脑洞库 -> 输入修改要求 -> AI前后对比 -> 保留原脑洞 -> 应用修改 -> 刷新',
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

async function readSavedBody() {
  return page.evaluate(() => {
    const entries = JSON.parse(localStorage.getItem('xinyuexia_global_brainstorm_library_v1') ?? '[]');
    const content = JSON.parse(entries[0]?.content ?? '{}');
    return content.body ?? '';
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
      primary: primary.bounds,
      display: secondary.bounds,
    };
  });
  assert.equal(result.window.secondaryAvailable, true);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  const secretResult = await page.evaluate(async ({ modelBaseUrl: baseUrl }) => {
    const novel = {
      id: 981,
      title: '脑洞修改验收书籍',
      type: 'novel',
      category: '玄幻',
      channel: 'male',
      synopsis: '',
      wordCount: 0,
      createdAt: '2026/7/27',
      lastModifiedAt: '2026/7/27',
    };
    const entry = {
      id: 'brainstorm-revision-1',
      tab: '脑洞',
      title: '万界吞噬',
      content: JSON.stringify({
        type: '脑洞库',
        body: '原脑洞：主角觉醒吞噬系统，在宗门大比中击败强敌，逐步揭开九重天界的秘密。',
      }),
      updatedAt: '2026/7/27 10:30:00',
      brainstormSerialNumber: 1,
    };
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([novel]));
    localStorage.setItem('xinyuexia_current_novel_id', '981');
    localStorage.setItem('xinyuexia_global_brainstorm_library_v1', JSON.stringify([entry]));
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
  await page.getByRole('button', { name: '脑洞库', exact: true }).click();
  await page.getByRole('heading', { name: '脑洞操作' }).waitFor();

  stage = 'professional inline revision input';
  const revisionInput = page.getByLabel('脑洞修改要求');
  const inputGeometry = await revisionInput.evaluate((input) => {
    const field = input.closest('.xy-floating-field');
    const send = field.querySelector('[aria-label="发送修改要求"]');
    const stop = field.querySelector('[aria-label="停止修改"]');
    const rect = (element) => element.getBoundingClientRect().toJSON();
    return {
      field: rect(field),
      input: rect(input),
      send: rect(send),
      stop: rect(stop),
      borderColor: getComputedStyle(input).borderColor,
      borderWidth: getComputedStyle(input).borderWidth,
      borderRadius: getComputedStyle(input).borderRadius,
    };
  });
  assert.equal(inputGeometry.borderColor, 'rgb(17, 24, 39)');
  assert.ok(Number.parseFloat(inputGeometry.borderWidth) >= 1.5);
  assert.ok(inputGeometry.input.height >= 45 && inputGeometry.input.height <= 55);
  assert.ok(inputGeometry.send.left >= inputGeometry.input.left);
  assert.ok(inputGeometry.stop.right <= inputGeometry.input.right + 1);
  result.assertions.revisionInputReusesProfessionalInlineControl = inputGeometry;
  await capture('01-professional-inline-revision-input');

  stage = 'revision comparison without persistence';
  const originalBody = await readSavedBody();
  await revisionInput.fill('强化开局冲突，让主角更早遭遇追杀');
  await page.getByRole('button', { name: '发送修改要求' }).click();
  await page.getByLabel('AI修改后脑洞').waitFor();
  await page.getByLabel('AI修改后脑洞').waitFor({ state: 'visible' });
  await page.getByText('修改完成，请对比后决定是否应用。', { exact: true }).waitFor();
  assert.equal(await page.getByLabel('修改前脑洞').inputValue(), originalBody);
  assert.equal(await page.getByLabel('AI修改后脑洞').inputValue(), revisedContent);
  assert.equal(await readSavedBody(), originalBody);
  const comparisonGeometry = await page.locator('[data-brainstorm-revision-comparison="true"]').evaluate((comparison) => {
    const original = comparison.querySelector('[aria-label="修改前脑洞"]');
    const revised = comparison.querySelector('[aria-label="AI修改后脑洞"]');
    const originalRect = original.getBoundingClientRect();
    const revisedRect = revised.getBoundingClientRect();
    return {
      original: originalRect.toJSON(),
      revised: revisedRect.toJSON(),
      noOverlap: originalRect.right < revisedRect.left,
      equalHeight: Math.abs(originalRect.height - revisedRect.height) <= 1,
      equalWidth: Math.abs(originalRect.width - revisedRect.width) <= 1,
    };
  });
  assert.equal(comparisonGeometry.noOverlap, true);
  assert.equal(comparisonGeometry.equalHeight, true);
  assert.equal(comparisonGeometry.equalWidth, true);
  result.assertions.aiRevisionAppearsBesideOriginalWithoutSaving = comparisonGeometry;
  await capture('02-original-and-ai-revision-comparison');

  stage = 'retain original';
  await page.getByRole('button', { name: '保留原脑洞' }).click();
  assert.equal(await page.locator('[data-brainstorm-revision-comparison="true"]').count(), 0);
  assert.equal(await page.getByLabel('脑洞预览内容').inputValue(), originalBody);
  assert.equal(await readSavedBody(), originalBody);
  result.assertions.retainOriginalDiscardsCandidate = true;

  stage = 'apply and persist revision';
  await revisionInput.fill('强化开局冲突，让主角更早遭遇追杀');
  await page.getByRole('button', { name: '发送修改要求' }).click();
  await page.getByText('修改完成，请对比后决定是否应用。', { exact: true }).waitFor();
  await page.getByRole('button', { name: '应用修改' }).click();
  assert.equal(await page.getByLabel('脑洞预览内容').inputValue(), revisedContent);
  assert.equal(await readSavedBody(), revisedContent);
  await page.reload();
  await page.getByRole('button', { name: '脑洞库', exact: true }).click();
  await page.getByLabel('脑洞预览内容').waitFor();
  assert.equal(await page.getByLabel('脑洞预览内容').inputValue(), revisedContent);
  result.assertions.applyRevisionPersistsAfterReload = true;
  await capture('03-applied-revision-after-reload');

  assert.deepEqual(result.runtimeErrors, []);
  result.assertions.noRuntimeErrors = true;
  result.finalWindow = await app.evaluate(({ BrowserWindow }) => {
    const target = BrowserWindow.getAllWindows()[0];
    return { visible: target.isVisible(), focused: target.isFocused(), bounds: target.getBounds() };
  });
  assert.equal(result.finalWindow.focused, false);
  result.status = 'PASS';
} catch (error) {
  result.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  if (page) await capture('failure').catch(() => undefined);
  throw error;
} finally {
  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  if (app) await app.close().catch(() => undefined);
  await new Promise((resolve) => mockServer.close(resolve));
  await rm(userDataDir, { recursive: true, force: true });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
