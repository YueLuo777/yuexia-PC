import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-template-change-confirm-flow');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-template-change-confirm-'));
const targetDisplayX = Number(process.env.YUEXIA_ACCEPTANCE_DISPLAY_X);
await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '标准模式书籍 -> 工作台 -> 作品设定 -> 更换模板 -> 玄幻仙侠三版本与其他题材分隔 -> 四栏DIY模板编辑器',
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
  assert.ok(Number.isFinite(targetDisplayX), 'verified Codex display x is required');
  app = await electron.launch({
    executablePath: require('electron'),
    cwd: repoRoot,
    args: [path.join(repoRoot, 'electron', 'main.cjs'), `--user-data-dir=${userDataDir}`],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
      NODE_ENV: 'test',
      XINYUEXIA_SMOKE_HEADLESS: '1',
      XINYUEXIA_LOAD_DIST: '1',
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

  result.window = await app.evaluate(({ BrowserWindow, screen }, requestedX) => {
    const target = BrowserWindow.getAllWindows()[0];
    const primary = screen.getPrimaryDisplay();
    const codexDisplay = screen.getAllDisplays().find((display) => display.workArea.x === requestedX);
    if (!target || !codexDisplay) return null;
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
  }, targetDisplayX);
  assert.ok(result.window);
  assert.notEqual(result.window.codexDisplayId, result.window.primaryDisplayId);
  assert.equal(result.window.visible, true);
  assert.equal(result.window.focused, false);

  await page.evaluate(() => {
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([{
      id: 995,
      title: '模板更换验收书籍',
      type: 'novel',
      category: '玄幻',
      channel: 'male',
      synopsis: '',
      wordCount: 0,
      createdAt: '2026/7/27',
      lastModifiedAt: '2026/7/27',
    }]));
    localStorage.setItem('xinyuexia_current_novel_id', '995');
    localStorage.setItem('xinyuexia_volumes_v1', JSON.stringify({ 995: [] }));
    localStorage.setItem('xinyuexia_workbench_settings_995', JSON.stringify([{
      id: 'setting-template-change-acceptance',
      tab: '大纲',
      title: '作品定位',
      content: JSON.stringify({ type: '核心设定', body: '【小说类型】：\n东方玄幻' }),
      updatedAt: '2026/7/27',
    }]));
    localStorage.setItem(
      'xinyuexia_standard_setting_generation_v1:xinyuexia_workbench_settings_995',
      JSON.stringify({ currentStepIndex: 1, completedStepIds: ['world-foundation'] }),
    );
    localStorage.setItem(
      'xinyuexia_standard_brainstorm_link_995',
      JSON.stringify({ id: 'brainstorm-995', title: '验收脑洞', content: '验收关联内容' }),
    );
  });
  await page.evaluate(() => {
    window.location.hash = '/workbench';
    window.location.reload();
  });
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '作品设定', exact: true }).click();
  const settingWorkspace = page.locator('[data-workbench-experience="standard"][data-workbench-flow="outline"]');
  await settingWorkspace.waitFor();
  await page.getByLabel('设定名').waitFor();
  const originalSettingName = await page.getByLabel('设定名').inputValue();
  const storedBeforeOpeningWarning = await page.evaluate(() =>
    localStorage.getItem('xinyuexia_workbench_settings_995'),
  );
  assert.ok(storedBeforeOpeningWarning);
  assert.equal(originalSettingName, '世界背景');

  stage = 'warning stays over current setting page';
  await page.getByRole('button', { name: '更换模板', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '更换设定模板？' });
  await dialog.waitFor();
  assert.equal(await settingWorkspace.count(), 1);
  assert.equal(await page.getByRole('region', { name: '四栏DIY模板编辑器' }).count(), 0);
  assert.equal(
    await page.locator('button[aria-current="page"]').filter({ hasText: /^作品设定$/ }).getAttribute('aria-current'),
    'page',
  );
  const continueButton = dialog.getByRole('button', { name: '继续更换模板' });
  const cancelButton = dialog.getByRole('button', { name: '取消' });
  const actionLayout = await dialog.evaluate((element) => {
    const footer = element.querySelector('footer');
    const buttons = [...(footer?.querySelectorAll('button') ?? [])];
    return buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      const style = getComputedStyle(button);
      return {
        text: button.textContent?.trim(),
        left: rect.left,
        right: rect.right,
        background: style.backgroundColor,
        color: style.color,
        border: style.borderColor,
      };
    });
  });
  assert.deepEqual(actionLayout.map((item) => item.text), ['继续更换模板', '取消']);
  assert.ok(actionLayout[0].right < actionLayout[1].left);
  assert.equal(actionLayout[1].background, 'rgb(8, 170, 206)');
  assert.equal(await cancelButton.evaluate((element) => document.activeElement === element), true);
  result.assertions.warningDoesNotNavigateAndUsesRequestedButtonOrder = actionLayout;
  await capture('01-warning-over-current-setting-page');

  stage = 'cancel stays on current setting page';
  await cancelButton.click();
  await dialog.waitFor({ state: 'detached' });
  assert.equal(await settingWorkspace.count(), 1);
  assert.equal(await page.getByLabel('设定名').inputValue(), originalSettingName);
  assert.equal(await page.getByRole('region', { name: '四栏DIY模板编辑器' }).count(), 0);
  result.assertions.cancelKeepsCurrentSettingPageAndData = true;

  stage = 'continue opens shared template-management editor once';
  await page.getByRole('button', { name: '更换模板', exact: true }).click();
  await dialog.waitFor();
  await dialog.getByRole('button', { name: '继续更换模板' }).click();
  const initializer = page.locator('[data-standard-setting-initializer="true"]');
  await initializer.waitFor();
  const diyEditor = page.getByRole('region', { name: '四栏DIY模板编辑器' });
  await diyEditor.waitFor();
  assert.equal(await page.getByRole('dialog', { name: '更换设定模板？' }).count(), 0);
  assert.equal(
    await page.locator('button[aria-current="page"]').filter({ hasText: /^作品设定$/ }).getAttribute('aria-current'),
    'page',
  );
  const standardTemplate = page.getByRole('button', { name: '选择内置模板：玄幻仙侠（标准版）' });
  const fullTemplate = page.getByRole('button', { name: '选择内置模板：玄幻仙侠（完整版）' });
  const lightTemplate = page.getByRole('button', { name: '选择内置模板：玄幻仙侠（轻量版）' });
  const otherMaleTemplates = page.getByRole('separator', { name: '其他男频题材模板' });
  assert.equal(await standardTemplate.getAttribute('aria-pressed'), 'true');
  assert.equal(await fullTemplate.count(), 1);
  assert.equal(await lightTemplate.count(), 1);
  assert.equal(await otherMaleTemplates.count(), 1);
  const categoryOrder = await page.evaluate(() => {
    const labels = [
      '选择内置模板：玄幻仙侠（标准版）',
      '选择内置模板：玄幻仙侠（完整版）',
      '选择内置模板：玄幻仙侠（轻量版）',
      '其他男频题材模板',
      '选择内置模板：都市（无修炼）',
    ];
    return labels.map((label) => {
      const element = document.querySelector(`[aria-label="${label}"]`);
      if (!element) throw new Error(`未找到模板分组元素：${label}`);
      return { label, top: element.getBoundingClientRect().top };
    });
  });
  assert.deepEqual(categoryOrder.map((item) => item.label), [
    '选择内置模板：玄幻仙侠（标准版）',
    '选择内置模板：玄幻仙侠（完整版）',
    '选择内置模板：玄幻仙侠（轻量版）',
    '其他男频题材模板',
    '选择内置模板：都市（无修炼）',
  ]);
  assert.ok(categoryOrder.every((item, index) => index === 0 || item.top > categoryOrder[index - 1].top));
  assert.equal(await page.getByRole('tab', { name: '男频' }).getAttribute('aria-selected'), 'true');
  assert.equal(await page.getByRole('tab', { name: '女频' }).getAttribute('aria-selected'), 'false');
  assert.equal(await page.getByRole('tab', { name: '我的模板' }).getAttribute('aria-selected'), 'false');
  for (const label of ['DIY一级分类', 'DIY二级分组', 'DIY三级设定', 'DIY四级设定']) {
    assert.equal(await diyEditor.getByRole('region', { name: label }).count(), 1);
  }
  assert.equal(await page.getByTestId('mind-map-canvas').count(), 0);
  assert.equal(await diyEditor.getByRole('button', { name: '一级删除已锁定，点击解锁' }).textContent(), '解锁');
  const standardStats = await diyEditor.getByText(/当前结构：/).textContent();
  await fullTemplate.click();
  assert.equal(await fullTemplate.getAttribute('aria-pressed'), 'true');
  const entryColumn = diyEditor.getByRole('region', { name: 'DIY三级设定' });
  assert.ok(await entryColumn.getByRole('button', { name: '世界层级与连接' }).count() >= 1);
  const fullStats = await diyEditor.getByText(/当前结构：/).textContent();
  await lightTemplate.click();
  assert.equal(await lightTemplate.getAttribute('aria-pressed'), 'true');
  assert.equal(await entryColumn.getByRole('button', { name: '世界层级与连接' }).count(), 0);
  const lightStats = await diyEditor.getByText(/当前结构：/).textContent();
  assert.match(lightStats ?? '', /100\s*个四级/);
  const fieldCount = (value) => Number(value?.match(/(\d+)\s*个四级/)?.[1] ?? 0);
  assert.ok(fieldCount(lightStats) < fieldCount(standardStats));
  assert.ok(fieldCount(standardStats) < fieldCount(fullStats));
  result.assertions.progressiveTemplateFieldCounts = {
    lightweight: fieldCount(lightStats),
    standard: fieldCount(standardStats),
    complete: fieldCount(fullStats),
  };
  await capture('02-lightweight-template-100-fields');
  await fullTemplate.click();
  const editorLayout = await initializer.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  assert.ok(editorLayout.scrollWidth <= editorLayout.clientWidth);
  assert.ok(editorLayout.scrollHeight <= editorLayout.clientHeight);
  const storedBeforeTemplateConfirmation = await page.evaluate(() =>
    localStorage.getItem('xinyuexia_workbench_settings_995'),
  );
  assert.equal(storedBeforeTemplateConfirmation, storedBeforeOpeningWarning);
  result.assertions.continueOpensTemplateManagementEditorWithoutSecondWarningOrEarlyDeletion = editorLayout;
  result.assertions.xianxiaVariantsAndOtherGenreDivider = categoryOrder;
  await capture('02-template-management-editor-after-confirmation');

  await page.getByRole('button', { name: '返回设定列表' }).click();
  await settingWorkspace.waitFor();
  assert.equal(await page.getByLabel('设定名').inputValue(), originalSettingName);
  result.assertions.returnFromEditorKeepsExistingSettings = true;
  await capture('03-returned-setting-page');

  stage = 'confirm replacement creates template settings and clears dependent state';
  await page.getByRole('button', { name: '更换模板', exact: true }).click();
  await dialog.waitFor();
  await dialog.getByRole('button', { name: '继续更换模板' }).click();
  await page.getByRole('region', { name: '四栏DIY模板编辑器' }).waitFor();
  await page.getByRole('button', { name: '选择内置模板：玄幻仙侠（完整版）' }).click();
  await page.getByRole('button', { name: '确认模板并创建设定' }).click();
  await settingWorkspace.waitFor();
  const replacementState = await page.evaluate(() => ({
    settings: localStorage.getItem('xinyuexia_workbench_settings_995'),
    generation: localStorage.getItem(
      'xinyuexia_standard_setting_generation_v1:xinyuexia_workbench_settings_995',
    ),
    brainstorm: localStorage.getItem('xinyuexia_standard_brainstorm_link_995'),
  }));
  assert.ok(replacementState.settings);
  assert.notEqual(replacementState.settings, storedBeforeOpeningWarning);
  assert.equal(replacementState.settings.includes('setting-template-change-acceptance'), false);
  assert.deepEqual(JSON.parse(replacementState.generation ?? 'null'), {
    version: 1,
    currentStepIndex: 0,
    completedStepIds: [],
    status: 'idle',
    autoContinue: false,
    requirement: '',
    error: '',
  });
  assert.equal(replacementState.brainstorm, null);
  result.assertions.confirmReplacementCreatesTemplateSettingsAndClearsDependentState = true;
  await capture('04-confirmed-template-replacement');

  stage = 'homepage template management exposes the same three variants';
  await page.evaluate(() => {
    window.location.hash = '/template-manage';
    window.location.reload();
  });
  const templateManagePage = page.locator('[data-template-manage-page="true"]');
  await templateManagePage.waitFor({ timeout: 30_000 });
  for (const title of ['玄幻仙侠（标准版）', '玄幻仙侠（完整版）', '玄幻仙侠（轻量版）']) {
    assert.equal(await templateManagePage.getByText(title, { exact: true }).count(), 1);
  }
  await templateManagePage.getByRole('button', { name: /玄幻仙侠（完整版）/ }).click();
  assert.ok(
    await templateManagePage
      .getByRole('region', { name: 'DIY三级设定' })
      .getByRole('button', { name: '世界层级与连接' })
      .count() >= 1,
  );
  result.assertions.homeTemplateManagementExposesSameThreeVariants = true;
  await capture('05-home-template-management-full-variant');

  assert.deepEqual(result.runtimeErrors, []);
  result.assertions.noRuntimeErrors = true;
  result.finalWindow = await app.evaluate(({ BrowserWindow }) => {
    const target = BrowserWindow.getAllWindows()[0];
    return { visible: target.isVisible(), focused: target.isFocused(), bounds: target.getBounds() };
  });
  assert.equal(result.finalWindow.visible, true);
  assert.equal(result.finalWindow.focused, false);
  result.status = 'PASS';
} catch (error) {
  result.error = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack ?? ''}` : String(error);
  if (page) await capture('failure').catch(() => undefined);
} finally {
  if (app) await app.close().catch(() => undefined);
  await rm(userDataDir, { recursive: true, force: true }).catch(() => undefined);
  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
}

console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exitCode = 1;
