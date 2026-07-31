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
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-setting-step-stream-lock');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-setting-step-stream-'));
const appPort = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '4183';
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

const firstChunk = [
  '【作品定位】',
  JSON.stringify({
    type: '核心设定',
    body: '【小说类型】：\n玄幻\n\n【作品卖点】：\n吞噬万物持续进化',
    structuredFieldSetId: 'prompt-work-positioning',
    lockedDefaultEntryId: '核心设定::作品定位',
  }),
].join('\n');
const secondChunk = [
  '',
  '【世界背景】',
  JSON.stringify({
    type: '核心设定',
    body: '【世界排列与连接】：\n九重天界依次连接',
    structuredFieldSetId: 'prompt-world-background',
    lockedDefaultEntryId: '核心设定::世界背景',
  }),
].join('\n');

const modelRequestBodies = [];
const mockServer = createServer({ pfx: certificate, passphrase: certificatePassword }, (request, response) => {
  let requestBody = '';
  request.on('data', (chunk) => { requestBody += chunk.toString('utf8'); });
  request.on('end', () => modelRequestBodies.push(requestBody));
  response.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });
  response.write(`data: ${JSON.stringify({ choices: [{ delta: { content: firstChunk } }] })}\n\n`);
  setTimeout(() => {
    response.write(`data: ${JSON.stringify({ choices: [{ delta: { content: secondChunk } }] })}\n\n`);
    response.end('data: [DONE]\n\n');
  }, 1800);
});
await new Promise((resolve) => mockServer.listen(0, '127.0.0.1', resolve));
const mockAddress = mockServer.address();
assert.ok(mockAddress && typeof mockAddress === 'object');
const modelBaseUrl = `https://localhost:${mockAddress.port}/v1`;

const result = {
  route: 'standard workbench -> create settings -> generate first step -> stream import -> unlock second step -> restart',
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

async function launchApp(route = 'novels') {
  app = await electron.launch({
    executablePath: require('electron'),
    cwd: repoRoot,
    args: [path.join(repoRoot, 'electron', 'main.cjs'), `--user-data-dir=${userDataDir}`],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
      NODE_ENV: 'test',
      XINYUEXIA_SMOKE_HEADLESS: '1',
      XINYUEXIA_URL: `http://127.0.0.1:${appPort}/#/${route}`,
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
}

try {
  await launchApp();
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

  const secretResult = await page.evaluate(async ({ baseUrl }) => {
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([{
      id: 996,
      title: '分步流式验收书籍',
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
      id: 'linked-brainstorm-996',
      tab: '脑洞',
      title: '万界吞噬成长录',
      content: '主角觉醒吞噬能力，从凡界一路成长。',
      updatedAt: '2026/7/27',
      brainstormSerialNumber: 1,
    }]));
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
  }, { baseUrl: modelBaseUrl });
  assert.equal(secretResult?.ok, true);

  await page.reload();
  await page.getByTestId('standard-mode-novel-card').waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '进入工作台', exact: true }).click();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '开始设定', exact: true }).click();
  await page.getByRole('button', { name: '确认模板并创建设定' }).click();

  stage = 'compact association and sequential controls';
  const panel = page.locator('[data-standard-setting-generation-panel="true"]');
  await panel.waitFor({ timeout: 30_000 });
  const requirement = panel.getByLabel('作品设定用户要求');
  const manualBrainstormButton = panel.getByRole('button', { name: '脑洞', exact: true });
  await capture('00-unlinked-brainstorm-control');
  await manualBrainstormButton.click();
  const brainstormReader = page.getByRole('dialog');
  await brainstormReader.waitFor();
  await capture('00b-manual-brainstorm-reader');
  await brainstormReader.getByRole('button', { name: '选择万界吞噬成长录', exact: true }).click();
  await brainstormReader.getByRole('button', { name: '确认关联', exact: true }).click();
  const associationButton = panel.getByRole('button', { name: '万界吞噬成长录', exact: true });
  const oneClickButton = panel.getByRole('button', { name: '一键生成全部', exact: true });
  const associationGroup = associationButton.locator('..');
  const [requirementBox, associationBox, oneClickBox] = await Promise.all([
    requirement.boundingBox(),
    associationGroup.boundingBox(),
    oneClickButton.boundingBox(),
  ]);
  assert.ok(requirementBox && associationBox && oneClickBox);
  assert.ok(requirementBox.y < associationBox.y && associationBox.y < oneClickBox.y);
  assert.ok(associationBox.height <= 36, `association height was ${associationBox.height}`);
  assert.ok(associationBox.width < 253, `association width was ${associationBox.width}`);
  const stepRows = panel.locator('[data-standard-setting-step]');
  assert.equal(await stepRows.count(), 5);
  assert.equal(await stepRows.nth(0).getByText('1. 基础设定', { exact: true }).count(), 1);
  const stepButtons = panel.getByRole('button', { name: '生成', exact: true });
  assert.equal(await stepButtons.count(), 5);
  assert.equal(await stepButtons.nth(0).isEnabled(), true);
  for (let index = 1; index < 5; index += 1) assert.equal(await stepButtons.nth(index).isDisabled(), true);
  result.assertions.associationIsCompactAndBetweenRequirementAndOneClick = true;
  result.assertions.unlinkedStateCanManuallySelectBrainstorm = true;
  result.assertions.onlyFirstStepStartsUnlocked = true;
  await capture('01-compact-association-and-sequential-steps');

  stage = 'stream first step with workspace lock';
  await stepButtons.nth(0).click();
  await page.locator('[data-setting-generation-lock-indicator="true"]').waitFor({ timeout: 30_000 });
  const lockedRegions = page.locator('[data-setting-generation-locked="true"]');
  assert.equal(await lockedRegions.count(), 2);
  for (let index = 0; index < 2; index += 1) {
    assert.equal(await lockedRegions.nth(index).getAttribute('inert'), '');
  }
  assert.equal(await panel.getByRole('button', { name: '暂停生成', exact: true }).isEnabled(), true);
  assert.equal(await panel.getByRole('button', { name: '检查设定', exact: true }).isDisabled(), true);
  const lockedNavigation = page.locator('[data-standard-navigation-locked="true"]');
  await lockedNavigation.waitFor();
  assert.equal(await lockedNavigation.getAttribute('inert'), '');
  const lockedTabs = page.locator('[data-app-tabs-locked="true"]');
  const lockedAppTools = page.locator('[data-app-tools-locked="true"]');
  await lockedTabs.waitFor();
  await lockedAppTools.waitFor();
  assert.equal(await lockedTabs.getAttribute('inert'), '');
  assert.equal(await lockedAppTools.getAttribute('inert'), '');
  const closeWindowButton = page.locator('[data-window-control="close"]');
  await closeWindowButton.waitFor();
  assert.equal(await closeWindowButton.isEnabled(), true);
  const closeWindowBounds = await closeWindowButton.boundingBox();
  assert.ok(closeWindowBounds);
  assert.ok(closeWindowBounds.x >= 0 && closeWindowBounds.x + closeWindowBounds.width <= (await page.evaluate(() => innerWidth)));
  await page.getByRole('textbox', { name: '小说类型', exact: true }).waitFor({ timeout: 1500 });
  await page.waitForFunction(() => {
    const field = document.querySelector('[aria-label="小说类型"]');
    return field instanceof HTMLTextAreaElement && field.value === '玄幻';
  }, null, { timeout: 1500 });
  result.assertions.leftAndMiddleAreLockedDuringGeneration = true;
  result.assertions.workbenchNavigationIsLockedDuringGeneration = true;
  result.assertions.appTabsAndToolsAreLockedDuringGeneration = true;
  result.assertions.windowControlsRemainAvailableDuringGeneration = true;
  result.assertions.partialOutputStreamsIntoSettingField = true;
  result.assertions.pauseRemainsAvailable = true;
  await capture('02-streaming-middle-and-locked-workspace');

  stage = 'unlock next step after completion';
  await page.locator('[data-setting-generation-lock-indicator="true"]').waitFor({ state: 'detached', timeout: 30_000 });
  await stepRows.nth(0).getByText('已生成', { exact: true }).waitFor();
  assert.equal(await stepRows.nth(1).getByRole('button', { name: '生成', exact: true }).isEnabled(), true);
  assert.equal(await stepRows.nth(2).getByRole('button', { name: '生成', exact: true }).isDisabled(), true);
  assert.equal(await page.getByRole('textbox', { name: '小说类型', exact: true }).inputValue(), '玄幻');
  const storedAfterImport = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('xinyuexia_workbench_settings_996') ?? '[]'),
  );
  const positioningEntries = storedAfterImport.filter((entry) => entry.title.replace(/[【】]/g, '') === '作品定位');
  assert.equal(positioningEntries.length, 1);
  assert.equal(positioningEntries[0].title, '作品定位');
  const positioningContent = JSON.parse(positioningEntries[0].content);
  assert.equal(positioningContent.body.includes('"type"'), false);
  assert.equal(positioningContent.body.includes('structuredFieldSetId'), false);
  assert.equal(positioningContent.structuredFieldSetId, 'prompt-work-positioning');
  const sentModelText = modelRequestBodies
    .map((body) => {
      try {
        const parsed = JSON.parse(body);
        return (parsed.messages ?? []).map((message) => message.content ?? '').join('\n');
      } catch {
        return body;
      }
    })
    .join('\n');
  assert.equal(/"structuredFieldSetId"\s*:/.test(sentModelText), false);
  assert.equal(/"lockedDefaultEntryId"\s*:/.test(sentModelText), false);
  result.assertions.internalJsonIsNotSentAndLeakedJsonOutputIsCleaned = true;
  result.assertions.decorativeTitlesUpdateCanonicalEntriesWithoutDuplicates = true;
  result.assertions.secondStepUnlocksOnlyAfterFirstCompletes = true;
  await capture('03-first-complete-and-second-unlocked');

  stage = 'check results clear after restart';
  await panel.getByRole('button', { name: '一键检查', exact: true }).click();
  await panel.getByRole('button', { name: /检查设定 \d+/ }).waitFor();
  await page.evaluate(() => {
    const key = 'xinyuexia_workbench_settings_996';
    const entries = JSON.parse(localStorage.getItem(key) ?? '[]');
    entries.unshift({
      id: 'legacy-bracket-duplicate',
      tab: '大纲',
      title: '【作品定位】',
      content: JSON.stringify({
        type: '核心设定',
        body: '【作品定位】\n{"type":"核心设定","body":"历史错误内容","structuredFieldSetId":"internal"}',
      }),
      updatedAt: '2026/7/27',
    });
    localStorage.setItem(key, JSON.stringify(entries));
  });
  await app.close();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await launchApp('novels');
  await page.goto(`http://127.0.0.1:${appPort}/#/novels`);
  await page.getByRole('heading', { name: '分步流式验收书籍', exact: true }).waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '进入工作台', exact: true }).click();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '作品设定', exact: true }).click();
  const reopenedPanel = page.locator('[data-standard-setting-generation-panel="true"]');
  await reopenedPanel.waitFor({ timeout: 30_000 });
  await reopenedPanel.getByRole('button', { name: '检查设定', exact: true }).waitFor();
  await reopenedPanel.getByText('已生成', { exact: true }).waitFor();
  await page.waitForFunction(() => {
    const entries = JSON.parse(localStorage.getItem('xinyuexia_workbench_settings_996') ?? '[]');
    return entries.filter((entry) => entry.title.replace(/[【】]/g, '') === '作品定位').length === 1;
  });
  result.assertions.checkResultsClearAfterRestart = true;
  result.assertions.generationProgressPersistsAfterRestart = true;
  result.assertions.legacyDuplicateEntriesAreRepairedOnRestart = true;
  await capture('04-restarted-with-cleared-check-results');

  stage = 'auto link from brainstorm page';
  await reopenedPanel.getByRole('button', { name: '取消关联', exact: true }).click();
  await reopenedPanel.getByRole('button', { name: '脑洞', exact: true }).waitFor();
  await page.getByRole('button', { name: '脑洞库', exact: true }).click();
  await page.locator('[data-standard-mode-brainstorm-page="true"]').waitFor();
  await page.getByRole('button', { name: '根据此脑洞生成设定', exact: true }).click();
  const autoLinkedPanel = page.locator('[data-standard-setting-generation-panel="true"]');
  await autoLinkedPanel.waitFor();
  await autoLinkedPanel.getByRole('button', { name: '万界吞噬成长录', exact: true }).waitFor();
  result.assertions.brainstormPageJumpAutomaticallyLinksSelectedBrainstorm = true;
  await capture('05-auto-linked-from-brainstorm-page');

  assert.deepEqual(result.runtimeErrors, []);
  result.assertions.noRuntimeErrors = true;
  result.status = 'PASS';
} catch (error) {
  result.failureStage = stage;
  result.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  if (page) await capture('failure').catch(() => {});
} finally {
  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  if (app) await app.close().catch(() => {});
  await new Promise((resolve) => mockServer.close(resolve));
  await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
}

if (result.status !== 'PASS') process.exitCode = 1;
