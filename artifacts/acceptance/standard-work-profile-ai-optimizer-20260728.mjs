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
const electronExecutable = require('electron');
const tempRoot = await mkdtemp(path.join(tmpdir(), 'xinyuexia-work-profile-ai-'));
const userDataDir = path.join(tempRoot, 'profile');
const pfxPath = path.join(tempRoot, 'localhost.pfx');
const pfxPassword = 'xinyuexia-acceptance';
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-work-profile-ai-optimizer');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '5186';

await mkdir(evidenceDir, { recursive: true });
await mkdir(userDataDir, { recursive: true });

const escapedPfxPath = pfxPath.replaceAll("'", "''");
execFileSync('powershell.exe', [
  '-NoProfile',
  '-Command',
  `$password = ConvertTo-SecureString '${pfxPassword}' -AsPlainText -Force; `
    + `$cert = New-SelfSignedCertificate -DnsName 'localhost' -CertStoreLocation 'Cert:\\CurrentUser\\My' `
    + `-NotAfter (Get-Date).AddDays(1); `
    + `Export-PfxCertificate -Cert $cert -FilePath '${escapedPfxPath}' -Password $password | Out-Null; `
    + `Remove-Item -LiteralPath ('Cert:\\CurrentUser\\My\\' + $cert.Thumbprint) -Force;`,
]);

const responseCandidates = {
  candidates: [
    { title: '系统让我反着修仙', synopsis: '林川得到反向修炼系统，每次失败都会变强，他必须在宗门追杀中找出系统真正的主人。' },
    { title: '我靠失败横推万界', synopsis: '别人苦修求胜，林川却靠失败积攒力量。当诸天强者围堵而来，他决定用最荒唐的方式赢到最后。' },
  ],
};

const modelServer = createServer(
  { pfx: await readFile(pfxPath), passphrase: pfxPassword },
  (request, response) => {
    let body = '';
    request.on('data', (chunk) => { body += chunk; });
    request.on('end', () => {
      const payload = JSON.parse(body || '{}');
      const candidateCount = Number(String(payload.messages?.at(-1)?.content ?? '').match(/候选数量：(\d+)个/)?.[1] ?? 2);
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({ candidates: responseCandidates.candidates.slice(0, candidateCount) }) } }],
        usage: { prompt_tokens: 20, completion_tokens: 40, total_tokens: 60 },
      }));
    });
  },
);
await new Promise((resolve) => modelServer.listen(0, '127.0.0.1', resolve));
const modelPort = modelServer.address().port;

const result = {
  route: '标准模式 -> 书籍 -> 进入工作台 -> 作品详情 -> AI优化作品资料',
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
    args: [path.join(repoRoot, 'electron', 'main.cjs'), `--user-data-dir=${userDataDir}`, '--ignore-certificate-errors'],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
      NODE_ENV: 'test',
      NODE_TLS_REJECT_UNAUTHORIZED: '0',
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
    target.webContents.setZoomFactor(1.1);
    target.showInactive();
    return {
      secondaryAvailable: true,
      bounds: target.getBounds(),
      display: secondary.bounds,
      visible: target.isVisible(),
      focused: target.isFocused(),
      zoomFactor: target.webContents.getZoomFactor(),
    };
  });
  assert.equal(result.window.secondaryAvailable, true);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  await page.evaluate(({ baseUrl }) => {
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([{
      id: 701,
      title: '旧书名',
      type: 'novel',
      category: '玄幻',
      channel: 'male',
      synopsis: '旧简介',
      creationStatus: 'serializing',
      targetWordCount: 1_000_000,
      createdAt: '2026/7/28',
      lastModifiedAt: '2026/7/28',
    }]));
    localStorage.setItem('xinyuexia_current_novel_id', '701');
    localStorage.setItem('xinyuexia_api_settings_v1', JSON.stringify({ models: [{
      id: 'acceptance-model',
      instanceId: 'acceptance-model-instance',
      name: '本地验收模型',
      enabled: true,
      baseUrl,
      apiKey: '',
      hasApiKey: true,
      model: 'acceptance-model',
      provider: 'openai-compatible',
      connectionStatus: 'connected',
      temperature: 0.7,
    }] }));
    localStorage.setItem('xinyuexia_active_model_id', 'acceptance-model');
  }, { baseUrl: `https://localhost:${modelPort}/v1` });
  await page.evaluate(async () => {
    await window.xinyuexiaModelSecrets.set('acceptance-model-instance', 'acceptance-key');
  });
  await page.reload();

  stage = 'enter work details';
  const card = page.getByTestId('standard-mode-novel-card');
  await card.waitFor({ timeout: 30_000 });
  await card.getByRole('button', { name: '进入工作台' }).click();
  const details = page.locator('[data-standard-work-details-page="true"]');
  await details.waitFor({ timeout: 30_000 });
  const titleOptimizer = page.getByRole('button', { name: 'AI取名' });
  const synopsisOptimizer = page.getByRole('button', { name: 'AI优化作品简介' });
  await titleOptimizer.waitFor();
  await synopsisOptimizer.waitFor();
  result.assertions.twoFormalEntrypointsVisible = true;
  await capture('01-work-details-ai-entry');

  stage = 'configure optimizer';
  await titleOptimizer.click();
  const dialog = page.getByRole('dialog', { name: 'AI优化作品资料' });
  await dialog.waitFor();
  assert.equal(await dialog.getByRole('button', { name: '书名和简介' }).getAttribute('aria-pressed'), 'true');
  await dialog.getByLabel('候选数量').click();
  await page.getByRole('button', { name: '2个' }).click();
  await dialog.getByLabel('书名风格').click();
  await page.getByRole('button', { name: '悬念钩子' }).click();
  await dialog.getByPlaceholder('输入你喜欢的作品书名，可用换行或顿号分隔').fill('参考作品甲\n参考作品乙');
  await dialog.getByPlaceholder(/书名突出系统/).fill('突出系统反差，简介强调追杀危机');
  result.assertions.requirementsCountStyleAndReferencesAreConfigurable = true;
  await capture('02-optimizer-configuration');

  stage = 'generate and apply';
  await dialog.getByRole('button', { name: '开始生成' }).click();
  await dialog.getByText('系统让我反着修仙', { exact: true }).waitFor({ timeout: 30_000 });
  await dialog.getByText('我靠失败横推万界', { exact: true }).waitFor();
  assert.equal(await dialog.getByText('2个方案', { exact: true }).count(), 1);
  result.assertions.realModelRequestReturnsParsedCandidates = true;
  await capture('03-generated-candidates');
  await dialog.getByRole('button', { name: '使用此方案' }).nth(1).click();
  await dialog.getByRole('button', { name: '关闭' }).click();
  assert.equal(await page.getByRole('textbox', { name: '作品名称', exact: true }).inputValue(), '我靠失败横推万界');
  assert.equal(
    await page.getByRole('textbox', { name: '作品简介', exact: true }).inputValue(),
    '别人苦修求胜，林川却靠失败积攒力量。当诸天强者围堵而来，他决定用最荒唐的方式赢到最后。',
  );
  result.assertions.candidateOnlyAppliesAfterExplicitConfirmation = true;

  stage = 'save reload and synopsis entry';
  await page.getByRole('button', { name: '保存修改' }).click();
  await page.reload();
  await details.waitFor({ timeout: 30_000 });
  assert.equal(await page.getByRole('textbox', { name: '作品名称', exact: true }).inputValue(), '我靠失败横推万界');
  assert.ok((await page.getByRole('textbox', { name: '作品简介', exact: true }).inputValue()).startsWith('别人苦修求胜'));
  await page.getByRole('button', { name: 'AI优化作品简介' }).click();
  const synopsisDialog = page.getByRole('dialog', { name: 'AI优化作品资料' });
  assert.equal(await synopsisDialog.getByRole('button', { name: '只生成简介' }).getAttribute('aria-pressed'), 'true');
  result.assertions.savePersistsAndSynopsisEntryUsesSynopsisTarget = true;

  const geometry = await synopsisDialog.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const overflowing = Array.from(element.querySelectorAll('*'))
      .filter((child) => child.scrollWidth > child.clientWidth + 1 && getComputedStyle(child).overflowX === 'visible')
      .map((child) => ({ text: child.textContent?.trim().slice(0, 40), clientWidth: child.clientWidth, scrollWidth: child.scrollWidth }));
    return {
      rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
      viewport: { width: innerWidth, height: innerHeight },
      overflowing,
    };
  });
  result.geometry = geometry;
  assert.ok(geometry.rect.left >= 0 && geometry.rect.top >= 0);
  assert.ok(geometry.rect.right <= geometry.viewport.width && geometry.rect.bottom <= geometry.viewport.height);
  assert.deepEqual(geometry.overflowing, []);
  result.assertions.modalFitsViewportWithoutUnexpectedOverflow = true;
  await capture('04-synopsis-entry-and-persisted-details');

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
  await new Promise((resolve) => modelServer.close(resolve));
  await rm(tempRoot, { recursive: true, force: true });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
