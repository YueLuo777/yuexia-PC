import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-setting-progress-check');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-setting-progress-'));
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '4181';
await mkdir(evidenceDir, { recursive: true });

const result = {
  route: 'standard workbench -> work settings -> generation and check panel',
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

  await page.evaluate(() => {
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([{
      id: 998,
      title: '\u8bbe\u5b9a\u8fdb\u5ea6\u9a8c\u6536\u4e66\u7c4d',
      type: 'novel',
      category: '\u7384\u5e7b',
      channel: 'male',
      synopsis: '',
      wordCount: 0,
      createdAt: '2026/7/27',
      lastModifiedAt: '2026/7/27',
    }]));
    localStorage.setItem('xinyuexia_current_novel_id', '998');
    localStorage.setItem('xinyuexia_volumes_v1', JSON.stringify({ 998: [] }));
    localStorage.setItem('xinyuexia_global_brainstorm_library_v1', JSON.stringify([{
      id: 'brainstorm-link-1',
      tab: '\u8111\u6d1e',
      title: '\u4e07\u754c\u541e\u566c',
      content: '\u4e3b\u89d2\u89c9\u9192\u541e\u566c\u7cfb\u7edf',
      updatedAt: '2026/7/27',
      brainstormSerialNumber: 1,
    }]));
  });
  await page.goto(`http://127.0.0.1:${port}/#/novels`);
  await page.getByRole('heading', { name: '\u8bbe\u5b9a\u8fdb\u5ea6\u9a8c\u6536\u4e66\u7c4d', exact: true }).waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '\u8fdb\u5165\u5de5\u4f5c\u53f0', exact: true }).click();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });

  stage = 'route brainstorm to template selection without settings';
  await page.getByRole('button', { name: '\u8111\u6d1e\u5e93', exact: true }).click();
  await page.locator('[data-standard-mode-brainstorm-page="true"]').waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '\u6839\u636e\u6b64\u8111\u6d1e\u751f\u6210\u8bbe\u5b9a', exact: true }).click();
  await page.getByRole('button', { name: '\u786e\u8ba4\u6a21\u677f\u5e76\u521b\u5efa\u8bbe\u5b9a' }).waitFor();
  assert.equal(await page.locator('[data-standard-setting-generation-panel="true"]').count(), 0);
  result.assertions.missingTemplateRoutesToTemplateSelection = true;
  await capture('00a-missing-template-routed-to-template-selection');
  await page.getByRole('button', { name: '\u786e\u8ba4\u6a21\u677f\u5e76\u521b\u5efa\u8bbe\u5b9a' }).click();

  stage = 'link brainstorm and route to existing settings';
  await page.getByRole('button', { name: '\u8111\u6d1e\u5e93', exact: true }).click();
  await page.locator('[data-standard-mode-brainstorm-page="true"]').waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '\u6839\u636e\u6b64\u8111\u6d1e\u751f\u6210\u8bbe\u5b9a', exact: true }).click();
  const linkedPanel = page.locator('[data-standard-setting-generation-panel="true"]');
  await linkedPanel.waitFor({ timeout: 30_000 });
  assert.equal(await page.getByRole('button', { name: '\u786e\u8ba4\u6a21\u677f\u5e76\u521b\u5efa\u8bbe\u5b9a' }).count(), 0);
  await linkedPanel.getByText('\u5df2\u5173\u8054', { exact: true }).waitFor();
  await linkedPanel.getByRole('button', { name: '\u4e07\u754c\u541e\u566c', exact: true }).waitFor();
  await linkedPanel.getByText('\u5171 8 \u5b57', { exact: true }).waitFor();
  await linkedPanel.getByRole('button', { name: '\u68c0\u67e5\u8bbe\u5b9a', exact: true }).waitFor();
  result.assertions.existingTemplateRoutesDirectlyToSettings = true;
  result.assertions.linkedBrainstormNameAndWordCountAreVisible = true;
  result.assertions.checkTabUsesSettingLabel = true;
  await capture('00b-linked-brainstorm-routed-to-existing-settings');

  stage = 'generation progress and adaptive requirement';
  const panel = page.locator('[data-standard-setting-generation-panel="true"]');
  await panel.waitFor({ timeout: 30_000 });
  assert.equal(await panel.getByText('\u751f\u6210\u4f5c\u54c1\u8bbe\u5b9a', { exact: true }).count(), 0);
  assert.equal(await panel.getByText('\u540e\u53f0\u6309\u4e94\u6b65\u751f\u6210\u5e76\u5199\u5165\u5de6\u4fa7\u8bbe\u5b9a', { exact: true }).count(), 0);
  assert.equal(await panel.getByText('0/5', { exact: true }).count(), 0);
  const panelBox = await panel.boundingBox();
  const modeSwitchBox = await panel.getByRole('button', { name: '\u751f\u6210\u8bbe\u5b9a', exact: true }).boundingBox();
  assert.ok(panelBox && modeSwitchBox);
  assert.ok(Math.abs(modeSwitchBox.y - panelBox.y - 2) <= 2, 'mode switch did not move to the panel top');
  assert.equal(await panel.getByText('\u672a\u751f\u6210', { exact: true }).count(), 5);
  const requirement = panel.getByLabel('\u4f5c\u54c1\u8bbe\u5b9a\u8865\u5145\u8981\u6c42');
  const generateButton = panel.getByRole('button', { name: '\u4e00\u952e\u751f\u6210\u5168\u90e8' });
  const requirementBox = await requirement.boundingBox();
  const generateBox = await generateButton.boundingBox();
  assert.ok(requirementBox && generateBox);
  result.measurements = {
    modeSwitchTopGap: modeSwitchBox.y - panelBox.y,
    requirementHeight: requirementBox.height,
    requirementToGenerateGap: generateBox.y - (requirementBox.y + requirementBox.height),
  };
  assert.ok(requirementBox.height >= 120, `requirement area too short: ${requirementBox.height}`);
  assert.ok(result.measurements.requirementToGenerateGap <= 32, `unexpected bottom gap: ${result.measurements.requirementToGenerateGap}`);
  result.assertions.fiveStepsHaveVisibleStatuses = true;
  result.assertions.redundantGenerationHeaderRemoved = true;
  result.assertions.modeSwitchStartsAtPanelTop = true;
  result.assertions.requirementFillsRemainingSpace = true;
  await capture('01-generation-status-and-adaptive-requirement');

  stage = 'interrupted generation recovery';
  await page.evaluate(() => {
    const key = Object.keys(localStorage).find((item) => item.startsWith('xinyuexia_standard_setting_generation_v1:'));
    if (!key) throw new Error('generation state storage key missing');
    const current = JSON.parse(localStorage.getItem(key));
    localStorage.setItem(key, JSON.stringify({
      ...current,
      currentStepIndex: 2,
      completedStepIds: ['world-foundation', 'plot-planning'],
      status: 'running',
    }));
  });
  await app.close();
  app = await electron.launch({
    executablePath: require('electron'),
    cwd: repoRoot,
    args: [path.join(repoRoot, 'electron', 'main.cjs'), `--user-data-dir=${userDataDir}`],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
      NODE_ENV: 'test',
      XINYUEXIA_SMOKE_HEADLESS: '1',
      XINYUEXIA_URL: `http://127.0.0.1:${port}/#/workbench`,
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
  await app.evaluate(({ BrowserWindow, screen }) => {
    const target = BrowserWindow.getAllWindows()[0];
    const display = screen.getDisplayNearestPoint({ x: 2050, y: 100 });
    const width = Math.min(1900, display.workArea.width - 32);
    const height = Math.min(1080, display.workArea.height - 32);
    target.setBounds({
      x: display.workArea.x + Math.floor((display.workArea.width - width) / 2),
      y: display.workArea.y + Math.floor((display.workArea.height - height) / 2),
      width,
      height,
    });
    target.showInactive();
  });
  await page.goto(`http://127.0.0.1:${port}/#/novels`);
  await page.getByRole('heading', { name: '\u8bbe\u5b9a\u8fdb\u5ea6\u9a8c\u6536\u4e66\u7c4d', exact: true }).waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '\u8fdb\u5165\u5de5\u4f5c\u53f0', exact: true }).click();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '\u4f5c\u54c1\u8bbe\u5b9a', exact: true }).click();
  await page.locator('[data-standard-setting-generation-panel="true"]').waitFor({ timeout: 30_000 });
  assert.equal(await page.getByText('\u5df2\u751f\u6210', { exact: true }).count(), 2);
  await page.getByText('\u5df2\u6682\u505c', { exact: true }).waitFor();
  await page.getByRole('button', { name: '\u7ee7\u7eed\u5f53\u524d\u6b65\u9aa4' }).waitFor();
  result.assertions.interruptedRunRestoresAsPaused = true;
  await capture('02-interrupted-run-paused');

  stage = 'detailed check and jump';
  await page.getByRole('button', { name: '\u4e00\u952e\u68c0\u67e5' }).click();
  await page.getByText(/\u53d1\u73b0 \d+ \u5904\u672a\u586b\u5199/).waitFor();
  assert.equal(await page.getByRole('button', { name: '\u7ee7\u7eed\u5f53\u524d\u6b65\u9aa4' }).count(), 0);
  await page.getByRole('button', { name: '\u91cd\u65b0\u68c0\u67e5' }).waitFor();
  const targetRow = page.locator('[data-setting-check-result="true"]')
    .filter({ hasText: '\u4e16\u754c\u80cc\u666f' })
    .first();
  await targetRow.waitFor();
  const expectedFieldKey = await targetRow.getAttribute('data-check-field-key');
  assert.ok(expectedFieldKey);
  await targetRow.getByRole('button', { name: '\u8df3\u8f6c' }).click();
  await page.waitForTimeout(300);
  assert.equal(await page.getByTestId('structured-title-field').locator('input').inputValue(), '\u4e16\u754c\u80cc\u666f');
  const focusedFieldKey = await page.evaluate(() =>
    document.activeElement?.closest('[data-setting-field-key]')?.getAttribute('data-setting-field-key') ?? null,
  );
  assert.equal(focusedFieldKey, expectedFieldKey);
  result.assertions.checkShowsDetailedEmptyFields = true;
  result.assertions.jumpSelectsEntryAndFocusesField = true;
  await capture('03-check-result-jumped-to-field');

  const roleRow = page.locator('[data-setting-check-result="true"]')
    .filter({ hasText: '\u4eba\u7269\u8bbe\u5b9a' })
    .first();
  await roleRow.waitFor();
  const expectedRoleFieldKey = await roleRow.getAttribute('data-check-field-key');
  assert.ok(expectedRoleFieldKey);
  await roleRow.getByRole('button', { name: '\u8df3\u8f6c' }).click();
  await page.waitForTimeout(300);
  const focusedRoleFieldKey = await page.evaluate(() =>
    document.activeElement?.closest('[data-role-field-key]')?.getAttribute('data-role-field-key') ?? null,
  );
  assert.equal(focusedRoleFieldKey, expectedRoleFieldKey);
  result.assertions.jumpAlsoSupportsCharacterSettings = true;
  await capture('04-check-result-jumped-to-character-field');

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
  await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
}

if (result.status !== 'PASS') process.exitCode = 1;
