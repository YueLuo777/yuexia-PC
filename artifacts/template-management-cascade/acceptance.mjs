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
const userDataDir = await mkdtemp(path.join(tmpdir(), 'yuexia-template-cascade-'));
const targetDisplayX = Number(process.env.YUEXIA_ACCEPTANCE_DISPLAY_X);
const runtimeErrors = [];
let app;

await mkdir(currentDir, { recursive: true });

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
    localStorage.setItem('xinyuexia_show_internal_routes', '1');
    location.reload();
  });
  await page.getByTitle('测试板块').waitFor({ timeout: 30_000 });
  await page.getByTitle('测试板块').click();
  await page.getByRole('heading', { name: 'UI 与主题' }).waitFor({ timeout: 30_000 });
  await page.getByText('模板管理逐级选择方案', { exact: true }).click();
  const prototype = page.locator('[data-template-management-cascade-test="true"]');
  await prototype.waitFor({ timeout: 30_000 });

  const inspectCategoryLayout = async () => page.evaluate(() => {
    const navigations = [...document.querySelectorAll('nav')]
      .filter((navigation) => navigation.querySelector('[data-cascade-level-button="true"]'));
    return navigations.map((navigation) => {
      const navRect = navigation.getBoundingClientRect();
      const buttons = [...navigation.querySelectorAll('[data-cascade-level-button="true"]')];
      const rects = buttons.map((button) => {
        const rect = button.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width };
      });
      const overlaps = rects.some((rect, index) => rects.slice(index + 1).some((other) => (
        rect.left < other.right && rect.right > other.left && rect.top < other.bottom && rect.bottom > other.top
      )));
      return {
        navLeft: navRect.left,
        navRight: navRect.right,
        widths: rects.map((rect) => rect.width),
        firstLeft: rects[0]?.left ?? null,
        maxRight: Math.max(...rects.map((rect) => rect.right)),
        overlaps,
      };
    });
  });
  const assertFixedCategoryLayout = (layouts) => {
    process.stdout.write(`category layout: ${JSON.stringify(layouts)}\n`);
    assert.equal(layouts.length, 3);
    const expectedRenderedWidth = layouts[0]?.widths[0];
    assert.ok(expectedRenderedWidth >= 200 && expectedRenderedWidth <= 300);
    for (const layout of layouts) {
      assert.ok(layout.widths.length > 0);
      assert.ok(layout.widths.every((width) => Math.abs(width - expectedRenderedWidth) <= 0.5));
      assert.ok(Math.abs(layout.firstLeft - layout.navLeft) <= 0.5);
      assert.ok(layout.maxRight <= layout.navRight + 0.5);
      assert.equal(layout.overlaps, false);
    }
  };

  const lightCard = page.getByRole('button', { name: '测试选择模板：玄幻仙侠（轻量版）' });
  const standardCard = page.getByRole('button', { name: '测试选择模板：玄幻仙侠（标准版）' });
  const fullCard = page.getByRole('button', { name: '测试选择模板：玄幻仙侠（完整版）' });
  assert.equal(await lightCard.getAttribute('aria-pressed'), 'true');
  const cardOrder = await page.evaluate(() => {
    const light = document.querySelector('[aria-label="测试选择模板：玄幻仙侠（轻量版）"]');
    const standard = document.querySelector('[aria-label="测试选择模板：玄幻仙侠（标准版）"]');
    const full = document.querySelector('[aria-label="测试选择模板：玄幻仙侠（完整版）"]');
    return Boolean(light && standard && full
      && (light.compareDocumentPosition(standard) & Node.DOCUMENT_POSITION_FOLLOWING)
      && (standard.compareDocumentPosition(full) & Node.DOCUMENT_POSITION_FOLLOWING));
  });
  assert.equal(cardOrder, true);
  const cardLayout = await lightCard.evaluate((card) => {
    const description = [...card.querySelectorAll('span')].find((node) => node.textContent?.includes('只保留开书'));
    const badge = [...card.querySelectorAll('span')]
      .filter((node) => node.textContent?.trim() === '男频 · 玄幻仙侠')
      .at(-1);
    return description && badge
      ? { descriptionBottom: description.getBoundingClientRect().bottom, badgeTop: badge.getBoundingClientRect().top }
      : null;
  });
  assert.ok(cardLayout && cardLayout.badgeTop > cardLayout.descriptionBottom);
  assert.equal(await page.getByRole('region', { name: '模板推荐依据' }).count(), 0);
  const lightCategoryLayout = await inspectCategoryLayout();
  assertFixedCategoryLayout(lightCategoryLayout);
  await page.screenshot({ path: path.join(currentDir, '01-light-template-cascade.png') });

  const firstLevel = page.getByRole('navigation', { name: '测试一级设定' });
  await firstLevel.getByRole('button', { name: /人物设定/ }).click();
  const secondLevel = page.getByRole('navigation', { name: '测试二级设定' });
  const thirdLevel = page.getByRole('navigation', { name: '测试三级设定' });
  assert.equal(await secondLevel.getByRole('button').first().getAttribute('aria-pressed'), 'true');
  assert.equal(await thirdLevel.getByRole('button').first().getAttribute('aria-pressed'), 'true');
  await page.getByText(/第四级设定 · 共/).waitFor();
  const characterCategoryLayout = await inspectCategoryLayout();
  assertFixedCategoryLayout(characterCategoryLayout);
  await page.screenshot({ path: path.join(currentDir, '02-character-fourth-level.png') });

  await standardCard.click();
  assert.equal(await standardCard.getAttribute('aria-pressed'), 'true');
  await page.getByRole('button', { name: /作品设定/ }).first().click();
  await page.getByRole('button', { name: /核心设定/ }).first().click();
  await page.getByRole('button', { name: /核心脑洞/ }).first().click();
  await page.getByRole('heading', { name: '核心脑洞' }).waitFor();
  const standardCategoryLayout = await inspectCategoryLayout();
  assertFixedCategoryLayout(standardCategoryLayout);
  await page.screenshot({ path: path.join(currentDir, '03-standard-core-idea.png') });

  await page.evaluate(() => {
    location.hash = '#/template-manage';
    location.reload();
  });
  await page.locator('[data-template-manage-page="true"]').waitFor({ timeout: 30_000 });
  const formalLight = page.getByText('玄幻仙侠（轻量版）', { exact: true });
  const formalStandard = page.getByText('玄幻仙侠（标准版）', { exact: true });
  const formalFull = page.getByText('玄幻仙侠（完整版）', { exact: true });
  const formalOrder = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const find = (text) => buttons.find((button) => button.textContent?.includes(text));
    const light = find('玄幻仙侠（轻量版）');
    const standard = find('玄幻仙侠（标准版）');
    const full = find('玄幻仙侠（完整版）');
    return Boolean(light && standard && full
      && (light.compareDocumentPosition(standard) & Node.DOCUMENT_POSITION_FOLLOWING)
      && (standard.compareDocumentPosition(full) & Node.DOCUMENT_POSITION_FOLLOWING));
  });
  assert.equal(formalOrder, true);
  await formalLight.waitFor();
  await formalStandard.waitFor();
  await formalFull.waitFor();
  await page.screenshot({ path: path.join(currentDir, '04-formal-template-cards.png') });

  await page.evaluate(() => {
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    location.hash = '#/novels';
    location.reload();
  });
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '新建小说' }).click();
  await page.locator('input:visible').last().fill('模板卡片正式入口验收');
  await page.getByRole('button', { name: /^确[定认]$/ }).last().click();
  const novelCard = page.getByText('模板卡片正式入口验收', { exact: true }).last().locator('xpath=ancestor::article');
  await novelCard.getByRole('button', { name: '进入标准工作台' }).click();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });
  const navigation = page.getByRole('navigation', { name: '标准模式创作导航' });
  await navigation.getByRole('button', { name: '作品设定', exact: true }).click();
  const settingActions = page.getByRole('group', { name: '作品设定操作' });
  await settingActions.getByRole('button', { name: '更换模板' }).click();
  const replaceDialog = page.getByRole('dialog', { name: '更换设定模板？' });
  await replaceDialog.getByRole('button', { name: '继续更换模板' }).click();
  await page.locator('[data-standard-setting-initializer="true"]').waitFor({ timeout: 30_000 });
  assert.equal(await page.getByRole('region', { name: '模板推荐依据' }).count(), 0);
  const initializerLight = page.getByRole('button', { name: '选择内置模板：玄幻仙侠（轻量版）' });
  const initializerLayout = await initializerLight.evaluate((card) => {
    const description = [...card.querySelectorAll('span')].find((node) => node.textContent?.includes('只保留开书'));
    const badge = [...card.querySelectorAll('span')]
      .filter((node) => node.textContent?.trim() === '男频 · 玄幻仙侠')
      .at(-1);
    return description && badge
      ? { descriptionBottom: description.getBoundingClientRect().bottom, badgeTop: badge.getBoundingClientRect().top }
      : null;
  });
  assert.ok(initializerLayout && initializerLayout.badgeTop > initializerLayout.descriptionBottom);
  const initializerOrder = await page.evaluate(() => {
    const light = document.querySelector('[aria-label="选择内置模板：玄幻仙侠（轻量版）"]');
    const standard = document.querySelector('[aria-label="选择内置模板：玄幻仙侠（标准版）"]');
    const full = document.querySelector('[aria-label="选择内置模板：玄幻仙侠（完整版）"]');
    return Boolean(light && standard && full
      && (light.compareDocumentPosition(standard) & Node.DOCUMENT_POSITION_FOLLOWING)
      && (standard.compareDocumentPosition(full) & Node.DOCUMENT_POSITION_FOLLOWING));
  });
  assert.equal(initializerOrder, true);
  await page.screenshot({ path: path.join(currentDir, '05-formal-setting-template-selector.png') });

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
    cardLayout,
    lightCategoryLayout,
    characterCategoryLayout,
    standardCategoryLayout,
    initializerLayout,
    layout,
  }, null, 2)}\n`);
} catch (error) {
  const page = app ? await app.firstWindow().catch(() => null) : null;
  if (page) {
    await page.screenshot({ path: path.join(currentDir, 'failure.png') }).catch(() => {});
    process.stderr.write(`${(await page.locator('body').innerText().catch(() => '')).slice(0, 5000)}\n`);
  }
  throw error;
} finally {
  if (app) await app.close().catch(() => {});
  await rm(userDataDir, { recursive: true, force: true });
}
