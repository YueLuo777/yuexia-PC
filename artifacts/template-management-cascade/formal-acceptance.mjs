import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { _electron as electron } from 'playwright';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require(path.join(repoRoot, 'node_modules', 'electron'));
const userDataDir = await mkdtemp(path.join(tmpdir(), 'yuexia-formal-template-cascade-'));
const targetDisplayX = Number(process.env.YUEXIA_ACCEPTANCE_DISPLAY_X);
const runtimeErrors = [];
let app;

await mkdir(currentDir, { recursive: true });

const inspectCascadeLayout = async (page) => page.evaluate(() => {
  const navigations = [...document.querySelectorAll('nav')]
    .filter((navigation) => navigation.querySelector('[data-template-cascade-level-button="true"]'));
  return navigations.map((navigation) => {
    const navRect = navigation.getBoundingClientRect();
    const cards = [...navigation.querySelectorAll('[data-template-cascade-level-button="true"]')];
    const rects = cards.map((card) => {
      const rect = card.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width };
    });
    const overlaps = rects.some((rect, index) => rects.slice(index + 1).some((other) => (
      rect.left < other.right && rect.right > other.left && rect.top < other.bottom && rect.bottom > other.top
    )));
    return {
      navLeft: navRect.left,
      navRight: navRect.right,
      firstLeft: rects[0]?.left ?? null,
      maxRight: Math.max(...rects.map((rect) => rect.right)),
      widths: rects.map((rect) => rect.width),
      overlaps,
    };
  });
});

const assertCascadeLayout = (layouts) => {
  assert.equal(layouts.length, 3);
  const width = layouts[0]?.widths[0];
  assert.ok(width >= 200 && width <= 300);
  for (const layout of layouts) {
    assert.ok(layout.widths.length > 0);
    assert.ok(layout.widths.every((itemWidth) => Math.abs(itemWidth - width) <= 0.5));
    assert.ok(Math.abs(layout.firstLeft - layout.navLeft) <= 0.5);
    assert.ok(layout.maxRight <= layout.navRight + 0.5);
    assert.equal(layout.overlaps, false);
  }
};

try {
  assert.ok(Number.isFinite(targetDisplayX), 'verified Codex display x is required');
  app = await electron.launch({
    executablePath: electronExecutable,
    cwd: repoRoot,
    args: [path.join(repoRoot, 'electron', 'main.cjs'), `--user-data-dir=${userDataDir}`],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
      NODE_ENV: 'test',
      XINYUEXIA_LOAD_DIST: '1',
      XINYUEXIA_SMOKE_HEADLESS: '1',
    },
    timeout: 30_000,
  });

  const page = await app.firstWindow({ timeout: 30_000 });
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
  });
  await page.waitForLoadState('domcontentloaded');

  const geometry = await app.evaluate(({ BrowserWindow, screen }, requestedX) => {
    const appWindow = BrowserWindow.getAllWindows()[0];
    const display = screen.getAllDisplays().find((candidate) => candidate.workArea.x === requestedX);
    if (!appWindow || !display) return null;
    const width = Math.min(1980, display.workArea.width - 48);
    const height = Math.min(1080, display.workArea.height - 40);
    appWindow.setBounds({
      x: display.workArea.x + Math.floor((display.workArea.width - width) / 2),
      y: display.workArea.y + Math.floor((display.workArea.height - height) / 2),
      width,
      height,
    });
    appWindow.showInactive();
    return { bounds: appWindow.getBounds(), workArea: display.workArea, visible: appWindow.isVisible() };
  }, targetDisplayX);
  assert.ok(geometry?.visible);
  assert.ok(geometry.bounds.x >= geometry.workArea.x);
  assert.ok(geometry.bounds.x + geometry.bounds.width <= geometry.workArea.x + geometry.workArea.width);

  await page.evaluate(() => {
    location.hash = '#/template-manage';
    location.reload();
  });
  const managePage = page.locator('[data-template-manage-page="true"]');
  await managePage.waitFor({ timeout: 30_000 });
  const editor = page.locator('[data-template-diy-cascade-editor="true"]');
  await editor.waitFor({ timeout: 30_000 });

  const whiteCascade = await page.evaluate(() => {
    const scroll = document.querySelector('[data-template-cascade-scroll="true"]');
    const fourth = document.querySelector('[data-template-fourth-level="true"]');
    return {
      scroll: scroll ? getComputedStyle(scroll).backgroundColor : null,
      fourth: fourth ? getComputedStyle(fourth).backgroundColor : null,
    };
  });
  assert.equal(whiteCascade.scroll, 'rgb(255, 255, 255)');
  assert.equal(whiteCascade.fourth, 'rgb(255, 255, 255)');
  await page.screenshot({ path: path.join(currentDir, '13-standard-white-fourth-level.png') });

  const initialLayout = await inspectCascadeLayout(page);
  assertCascadeLayout(initialLayout);
  assert.equal(await page.getByRole('button', { name: '删除四级设定：小说类型' }).isDisabled(), true);
  assert.equal(await page.getByRole('region', { name: 'DIY四级设定' }).getByText(/^0\d$/).count(), 0);
  const secondLevel = page.getByRole('navigation', { name: '模板二级设定' });
  assert.equal(await secondLevel.getByRole('button').filter({ hasNotText: '删除' }).count() >= 2, true);
  const secondFieldCard = page.locator('[data-template-cascade-field-card="true"]').nth(1);
  const secondFieldBounds = await secondFieldCard.boundingBox();
  assert.ok(secondFieldBounds);
  await secondFieldCard.click({ position: { x: secondFieldBounds.width / 2, y: secondFieldBounds.height - 5 } });
  assert.equal(await page.getByRole('button', { name: '题材方向', exact: true }).getAttribute('aria-pressed'), 'true');
  await page.screenshot({ path: path.join(currentDir, '10-formal-full-card-click.png') });

  const characterCard = page.locator('[data-template-cascade-level-button="true"]')
    .filter({ has: page.getByRole('button', { name: '人物设定', exact: true }) });
  const characterBounds = await characterCard.boundingBox();
  assert.ok(characterBounds);
  await characterCard.click({ position: { x: 8, y: characterBounds.height - 4 } });
  assert.equal(await page.getByRole('button', { name: '人物设定', exact: true }).getAttribute('aria-pressed'), 'true');
  const characterLayout = await inspectCascadeLayout(page);
  assertCascadeLayout(characterLayout);
  await page.screenshot({ path: path.join(currentDir, '11-formal-level-card-edge-click.png') });

  const fieldRegion = page.getByRole('region', { name: 'DIY四级设定' });
  await fieldRegion.getByRole('textbox', { name: '输入四级设定名称' }).fill('正式验收字段');
  await fieldRegion.getByRole('button', { name: '新增' }).click();
  await fieldRegion.getByRole('button', { name: '正式验收字段', exact: true }).waitFor();
  await page.getByRole('textbox', { name: '保存模板名称' }).fill('正式逐级验收模板');
  await page.getByRole('button', { name: '保存到我的模板' }).click();
  await page.getByRole('tab', { name: '我的模板' }).waitFor();

  await page.reload();
  await managePage.waitFor({ timeout: 30_000 });
  await page.getByRole('tab', { name: '我的模板' }).click();
  await page.getByText('正式逐级验收模板', { exact: true }).click();
  await page.getByRole('navigation', { name: '模板一级设定' })
    .getByRole('button', { name: '人物设定', exact: true }).click();
  await page.getByRole('button', { name: '正式验收字段', exact: true }).waitFor();
  await page.screenshot({ path: path.join(currentDir, '08-formal-saved-template-restored.png') });

  await page.evaluate(() => {
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    location.hash = '#/novels';
    location.reload();
  });
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '新建小说' }).click();
  await page.locator('input:visible').last().fill('逐级模板共享入口验收');
  await page.getByRole('button', { name: /^确[定认]$/ }).last().click();
  const novelCard = page.getByText('逐级模板共享入口验收', { exact: true }).last().locator('xpath=ancestor::article');
  await novelCard.getByRole('button', { name: '进入标准工作台' }).click();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });
  const navigation = page.getByRole('navigation', { name: '标准模式创作导航' });
  await navigation.getByRole('button', { name: '作品设定', exact: true }).click();
  const settingActions = page.getByRole('group', { name: '作品设定操作' });
  await settingActions.getByRole('button', { name: '更换模板' }).click();
  await page.locator('[data-standard-setting-initializer="true"] [data-template-diy-cascade-editor="true"]')
    .waitFor({ timeout: 30_000 });
  assert.equal(await page.getByRole('dialog', { name: '更换设定模板？' }).count(), 0);
  const initializerLayout = await inspectCascadeLayout(page);
  assertCascadeLayout(initializerLayout);
  const initializerGeometry = await page.evaluate(() => {
    const initializer = document.querySelector('[data-standard-setting-initializer="true"]');
    const list = document.querySelector('[data-template-list-panel="true"]');
    const footer = document.querySelector('[data-template-editor-footer="true"]');
    const save = footer?.querySelector('[aria-label="保存模板"]');
    const confirm = footer?.querySelector('[data-template-confirm-actions="true"]');
    const summaryRow = footer?.querySelector('[data-template-summary-row="true"]');
    const saveRow = footer?.querySelector('[data-template-save-row="true"]');
    const cascadeScroll = initializer.querySelector('[data-template-cascade-scroll="true"]');
    const fourthLevel = initializer.querySelector('[data-template-fourth-level="true"]');
    if (!initializer || !list || !footer || !save || !confirm || !summaryRow || !saveRow || !cascadeScroll || !fourthLevel) return null;
    const toRect = (element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
    };
    return {
      initializer: toRect(initializer),
      list: toRect(list),
      footer: toRect(footer),
      save: toRect(save),
      confirm: toRect(confirm),
      summaryRow: toRect(summaryRow),
      saveRow: toRect(saveRow),
      cascadeScrollColor: getComputedStyle(cascadeScroll).backgroundColor,
      fourthLevelColor: getComputedStyle(fourthLevel).backgroundColor,
      directFooterCount: initializer.querySelectorAll(':scope > footer').length,
    };
  });
  assert.ok(initializerGeometry);
  assert.ok(Math.abs(initializerGeometry.list.bottom - initializerGeometry.initializer.bottom) <= 1);
  assert.ok(Math.abs(initializerGeometry.footer.bottom - initializerGeometry.initializer.bottom) <= 1);
  assert.ok(initializerGeometry.footer.left >= initializerGeometry.list.right - 1);
  assert.equal(initializerGeometry.directFooterCount, 0);
  assert.ok(initializerGeometry.save.left < initializerGeometry.confirm.left);
  assert.ok(initializerGeometry.summaryRow.bottom <= initializerGeometry.saveRow.top + 1);
  assert.ok(initializerGeometry.save.right <= initializerGeometry.confirm.left - 16);
  assert.ok(Math.abs(initializerGeometry.save.bottom - initializerGeometry.saveRow.bottom) <= 1);
  assert.equal(initializerGeometry.cascadeScrollColor, 'rgb(255, 255, 255)');
  assert.equal(initializerGeometry.fourthLevelColor, 'rgb(255, 255, 255)');
  const firstLevelNameInput = page.getByRole('textbox', { name: '输入一级分类名称' });
  assert.equal(await firstLevelNameInput.getAttribute('maxlength'), '15');
  const nameInputWrapWidth = await firstLevelNameInput.evaluate((input) => input.closest('[data-template-name-input-wrap="true"]')?.getBoundingClientRect().width);
  assert.ok(nameInputWrapWidth >= 240 && nameInputWrapWidth <= 320);
  await firstLevelNameInput.pressSequentially('一二三四五六七八九十甲乙丙丁戊己');
  assert.equal((await firstLevelNameInput.inputValue()).length, 15);
  await page.screenshot({ path: path.join(currentDir, '12-standard-template-combined-footer.png') });
  await page.screenshot({ path: path.join(currentDir, '14-standard-two-row-save-footer.png') });

  await page.getByRole('button', { name: '选择内置模板：玄幻仙侠（轻量版）' }).click();
  assert.equal(
    await page.getByRole('button', { name: '选择内置模板：玄幻仙侠（轻量版）' }).getAttribute('aria-pressed'),
    'true',
  );
  await page.getByRole('button', { name: '确认模板并创建设定' }).click();
  await page.waitForFunction(() => Object.keys(localStorage)
    .filter((key) => key.startsWith('xinyuexia_standard_setting_template_'))
    .some((key) => {
      try { return JSON.parse(localStorage.getItem(key))?.templateId === 'male-fantasy-xianxia-light'; } catch { return false; }
    }));
  const lightState = await page.evaluate(() => {
    const states = Object.keys(localStorage)
      .filter((key) => key.startsWith('xinyuexia_standard_setting_template_'))
      .flatMap((key) => {
        try { return [JSON.parse(localStorage.getItem(key))]; } catch { return []; }
      });
    const state = states.find((item) => item.templateId === 'male-fantasy-xianxia-light');
    const fieldCount = state?.structure.flatMap((domain) => domain.groups)
      .flatMap((group) => group.entries)
      .flatMap((entry) => entry.sections)
      .flatMap((section) => section.fields).length;
    return state ? { templateId: state.templateId, templateName: state.templateName, fieldCount } : null;
  });
  assert.deepEqual(lightState, {
    templateId: 'male-fantasy-xianxia-light',
    templateName: '玄幻仙侠（轻量版）',
    fieldCount: 100,
  });
  await page.getByRole('button', { name: '更换模板' }).click();
  await page.locator('[data-standard-setting-initializer="true"]').waitFor({ timeout: 30_000 });
  assert.equal(await page.getByRole('dialog', { name: '更换设定模板？' }).count(), 0);
  await page.screenshot({ path: path.join(currentDir, '17-empty-settings-direct-template-selection.png') });
  await page.getByRole('button', { name: '返回设定列表' }).click();
  await page.getByRole('textbox', { name: '小说类型', exact: true }).fill('Electron已填写设定');
  await page.getByRole('button', { name: '更换模板' }).click();
  const lightWarning = page.getByRole('dialog', { name: '更换设定模板？' });
  await lightWarning.waitFor();
  assert.match(await lightWarning.innerText(), /当前使用模板：玄幻仙侠（轻量版）/);
  assert.match(await lightWarning.innerText(), /更换模板会清空全部设定，脑洞、章纲和正文则不会受到影响，是否继续？/);
  await page.screenshot({ path: path.join(currentDir, '18-filled-settings-replacement-warning.png') });

  await lightWarning.getByRole('button', { name: '继续更换模板' }).click();
  await page.locator('[data-standard-setting-initializer="true"]').waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '选择内置模板：玄幻仙侠（轻量版）' }).click();
  const customFourthLevel = page.getByRole('region', { name: 'DIY四级设定' });
  await customFourthLevel.getByRole('textbox', { name: '输入四级设定名称' }).fill('自定义验收字段');
  await customFourthLevel.getByRole('button', { name: '新增' }).click();
  await page.getByRole('button', { name: '确认模板并创建设定' }).click();
  await page.waitForFunction(() => Object.keys(localStorage)
    .filter((key) => key.startsWith('xinyuexia_standard_setting_template_'))
    .some((key) => {
      try { return JSON.parse(localStorage.getItem(key))?.templateId === 'custom-template'; } catch { return false; }
    }));
  const customState = await page.evaluate(() => {
    const states = Object.keys(localStorage)
      .filter((key) => key.startsWith('xinyuexia_standard_setting_template_'))
      .flatMap((key) => {
        try { return [JSON.parse(localStorage.getItem(key))]; } catch { return []; }
      });
    const state = states.find((item) => item.templateId === 'custom-template');
    return state ? { templateId: state.templateId, templateName: state.templateName } : null;
  });
  assert.deepEqual(customState, { templateId: 'custom-template', templateName: '自定义' });
  await page.getByRole('textbox', { name: '小说类型', exact: true }).fill('Electron自定义设定');
  await page.getByRole('button', { name: '更换模板' }).click();
  const customWarning = page.getByRole('dialog', { name: '更换设定模板？' });
  await customWarning.waitFor();
  assert.match(await customWarning.innerText(), /当前使用模板：自定义/);
  assert.match(await customWarning.innerText(), /更换模板会清空全部设定，脑洞、章纲和正文则不会受到影响，是否继续？/);
  await page.screenshot({ path: path.join(currentDir, '16-custom-template-replacement-warning.png') });
  await customWarning.getByRole('button', { name: '取消' }).click();

  const layout = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    viewportHeight: document.documentElement.clientHeight,
    documentWidth: document.documentElement.scrollWidth,
    documentHeight: document.documentElement.scrollHeight,
  }));
  assert.ok(layout.documentWidth <= layout.viewportWidth);
  assert.ok(layout.documentHeight <= layout.viewportHeight);
  assert.deepEqual(runtimeErrors, [], `renderer runtime errors:\n${runtimeErrors.join('\n')}`);
  process.stdout.write(`${JSON.stringify({
    pass: true,
    geometry,
    initialLayout,
    whiteCascade,
    characterLayout,
    initializerLayout,
    initializerGeometry,
    nameInputWrapWidth,
    lightState,
    customState,
    layout,
  }, null, 2)}\n`);
} catch (error) {
  const page = app ? await app.firstWindow().catch(() => null) : null;
  if (page) {
    await page.screenshot({ path: path.join(currentDir, 'formal-failure.png') }).catch(() => {});
    process.stderr.write(`${(await page.locator('body').innerText().catch(() => '')).slice(0, 5000)}\n`);
  }
  throw error;
} finally {
  if (app) await app.close().catch(() => {});
  await rm(userDataDir, { recursive: true, force: true });
}
