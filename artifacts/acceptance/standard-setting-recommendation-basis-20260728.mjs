import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const electronExecutable = require('electron');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-setting-basis-'));
const evidenceDir = path.join(repoRoot, 'artifacts', 'standard-setting-recommendation-basis');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '5186';

await mkdir(evidenceDir, { recursive: true });

const result = {
  route: '作品概览 -> 新建小说 -> 作品详情填写预计篇幅 -> 开始设定 -> 模板推荐依据',
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
  assert.ok(Math.abs(result.window.zoomFactor - 1.1) < 0.01);

  await page.evaluate(() => {
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_novels_v1', JSON.stringify([]));
    localStorage.setItem('xinyuexia_volumes_v1', JSON.stringify({}));
    localStorage.removeItem('xinyuexia_current_novel_id');
  });
  await page.reload();
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });

  stage = 'create novel';
  await page.getByRole('button', { name: '新建小说' }).first().click();
  const dialog = page.getByRole('dialog', { name: '新建小说' });
  await dialog.getByRole('textbox').first().fill('模板推荐依据验收作品');
  await dialog.getByRole('button', { name: '确认' }).click();
  const card = page.getByTestId('standard-mode-novel-card');
  await card.getByRole('button', { name: '进入工作台' }).click();

  stage = 'fill work details';
  const details = page.locator('[data-standard-work-details-page="true"]');
  await details.waitFor({ timeout: 30_000 });
  await page.getByLabel('预计篇幅').fill('100');
  await page.getByRole('button', { name: '保存修改' }).click();
  await page.reload();
  await details.waitFor({ timeout: 30_000 });
  assert.equal(await page.getByLabel('预计篇幅').inputValue(), '100');
  result.assertions.expectedLengthPersistsBeforeSettingSetup = true;

  stage = 'open setting template';
  await page.getByRole('button', { name: '开始设定' }).last().click();
  const initializer = page.locator('[data-standard-setting-initializer="true"]');
  await initializer.waitFor({ timeout: 30_000 });
  const basis = page.getByRole('region', { name: '模板推荐依据' });
  await basis.getByText('男频', { exact: true }).waitFor();
  await basis.getByText('玄幻', { exact: true }).waitFor();
  await basis.getByText('100万字', { exact: true }).waitFor();
  await page.getByRole('tab', { name: '推荐模板' }).waitFor();
  await page.getByRole('button', { name: '选择内置模板：玄幻仙侠' }).waitFor();
  await page.getByRole('button', { name: '确认模板并创建设定' }).waitFor();

  const geometry = await initializer.evaluate((element) => {
    const aside = element.querySelector('aside');
    const basisElement = element.querySelector('[aria-label="模板推荐依据"]');
    const tablist = element.querySelector('[role="tablist"]');
    const footer = Array.from(element.children).find((child) => child.tagName === 'FOOTER');
    const initializerRect = element.getBoundingClientRect();
    const asideRect = aside.getBoundingClientRect();
    const basisRect = basisElement.getBoundingClientRect();
    const tablistRect = tablist.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    const footerStyle = getComputedStyle(footer);
    const confirmButton = Array.from(footer.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('确认模板并创建设定'),
    );
    const confirmRect = confirmButton.getBoundingClientRect();
    const confirmCenter = document.elementFromPoint(
      confirmRect.left + confirmRect.width / 2,
      confirmRect.top + confirmRect.height / 2,
    );
    const footerCenter = document.elementFromPoint(
      footerRect.left + footerRect.width / 2,
      footerRect.top + footerRect.height / 2,
    );
    return {
      initializer: { top: initializerRect.top, bottom: initializerRect.bottom, height: initializerRect.height },
      aside: { top: asideRect.top, bottom: asideRect.bottom, width: asideRect.width },
      basis: { top: basisRect.top, bottom: basisRect.bottom, width: basisRect.width },
      tablist: { top: tablistRect.top, bottom: tablistRect.bottom, width: tablistRect.width },
      footer: {
        top: footerRect.top,
        bottom: footerRect.bottom,
        text: footer.textContent?.trim(),
        display: footerStyle.display,
        visibility: footerStyle.visibility,
        zIndex: footerStyle.zIndex,
        elementAtCenter: footerCenter?.textContent?.trim(),
        confirmButton: {
          left: confirmRect.left,
          right: confirmRect.right,
          top: confirmRect.top,
          bottom: confirmRect.bottom,
          elementAtCenter: confirmCenter?.textContent?.trim(),
        },
      },
      layout: {
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
      },
    };
  });
  assert.ok(geometry.basis.bottom < geometry.tablist.top);
  assert.ok(geometry.basis.width <= geometry.aside.width);
  assert.ok(geometry.footer.bottom <= geometry.initializer.bottom + 1);
  assert.equal(geometry.footer.confirmButton.elementAtCenter, '确认模板并创建设定');
  assert.ok(geometry.layout.scrollWidth <= geometry.layout.clientWidth);
  assert.ok(geometry.layout.scrollHeight <= geometry.layout.clientHeight);
  result.geometry = geometry;
  result.assertions.recommendationBasisShowsCurrentWorkDetails = true;
  result.assertions.recommendationBasisDoesNotDisplaceTemplateActions = true;
  result.assertions.noUnexpectedPageOverflow = true;
  await capture('01-setting-template-recommendation-basis');
  const initializerScreenshot = path.join(evidenceDir, '02-setting-initializer-region.png');
  await initializer.screenshot({ path: initializerScreenshot });
  result.screenshots['02-setting-initializer-region'] = initializerScreenshot;

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
  await rm(userDataDir, { recursive: true, force: true });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
