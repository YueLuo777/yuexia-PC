import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const evidenceDir = path.join(repoRoot, 'artifacts', 'compact-confirm-dialog-drag');
const resultPath = path.join(evidenceDir, 'electron-acceptance.json');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-compact-dialog-'));
const port = process.env.XINYUEXIA_ACCEPTANCE_PORT ?? '4180';
await mkdir(evidenceDir, { recursive: true });

const result = {
  route: 'standard workbench -> work settings -> change setting template',
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
      id: 997,
      title: '\u5f39\u7a97\u62d6\u52a8\u9a8c\u6536\u4e66\u7c4d',
      type: 'novel',
      category: '\u7384\u5e7b',
      channel: 'male',
      synopsis: '',
      wordCount: 0,
      createdAt: '2026/7/27',
      lastModifiedAt: '2026/7/27',
    }]));
    localStorage.setItem('xinyuexia_current_novel_id', '997');
    localStorage.setItem('xinyuexia_volumes_v1', JSON.stringify({ 997: [] }));
  });
  await page.goto(`http://127.0.0.1:${port}/#/workbench`);
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });

  stage = 'create settings';
  await page.getByRole('button', { name: '\u5f00\u59cb\u8bbe\u5b9a', exact: true }).click();
  await page.getByRole('button', { name: '\u786e\u8ba4\u6a21\u677f\u5e76\u521b\u5efa\u8bbe\u5b9a' }).click();
  await page.locator('[data-standard-setting-generation-panel="true"]').waitFor({ timeout: 30_000 });

  stage = 'open and drag confirmation';
  await page.getByRole('button', { name: '\u66f4\u6362\u8bbe\u5b9a\u6a21\u677f', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '\u66f4\u6362\u8bbe\u5b9a\u6a21\u677f\uff1f' });
  await dialog.waitFor();
  const before = await dialog.boundingBox();
  assert.ok(before);
  await capture('01-before-drag');

  const header = dialog.locator('header');
  const headerBox = await header.boundingBox();
  assert.ok(headerBox);
  await page.mouse.move(headerBox.x + 120, headerBox.y + headerBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(headerBox.x + 240, headerBox.y + headerBox.height / 2 + 90, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(200);

  const after = await dialog.boundingBox();
  assert.ok(after);
  result.measurements = { before, after };
  assert.ok(Math.abs(after.width - before.width) <= 1, `width changed: ${before.width} -> ${after.width}`);
  assert.ok(Math.abs(after.height - before.height) <= 1, `height changed: ${before.height} -> ${after.height}`);
  assert.ok(Math.abs(after.x - before.x) >= 80, 'dialog did not move horizontally');
  assert.ok(Math.abs(after.y - before.y) >= 60, 'dialog did not move vertically');
  result.assertions.dragPreservesExactDialogSize = true;
  result.assertions.dialogMovedOnBothAxes = true;
  await capture('02-after-drag');

  stage = 'close and reopen confirmation';
  await dialog.getByRole('button', { name: '\u53d6\u6d88', exact: true }).click();
  await dialog.waitFor({ state: 'detached' });

  const reopenSamples = await page.evaluate(async () => {
    const trigger = Array.from(document.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === '\u66f4\u6362\u8bbe\u5b9a\u6a21\u677f');
    if (!(trigger instanceof HTMLButtonElement)) throw new Error('change-template trigger missing');

    const readPosition = () => {
      const reopenedDialog = document.querySelector(
        '[role="dialog"][aria-label="\u66f4\u6362\u8bbe\u5b9a\u6a21\u677f\uff1f"]',
      );
      if (!(reopenedDialog instanceof HTMLElement)) throw new Error('reopened dialog missing');
      const rect = reopenedDialog.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        expectedX: (window.innerWidth - rect.width) / 2,
        expectedY: (window.innerHeight - rect.height) / 2,
      };
    };

    const immediatePosition = new Promise((resolve, reject) => {
      const observer = new MutationObserver(() => {
        const reopenedDialog = document.querySelector(
          '[role="dialog"][aria-label="\u66f4\u6362\u8bbe\u5b9a\u6a21\u677f\uff1f"]',
        );
        if (!reopenedDialog) return;
        observer.disconnect();
        try {
          resolve(readPosition());
        } catch (error) {
          reject(error);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
    trigger.click();
    const immediate = await immediatePosition;
    const frames = [];
    await new Promise((resolve) => requestAnimationFrame(() => {
      frames.push(readPosition());
      requestAnimationFrame(() => {
        frames.push(readPosition());
        resolve();
      });
    }));
    return { immediate, frames };
  });

  const allReopenSamples = [reopenSamples.immediate, ...reopenSamples.frames];
  for (const sample of allReopenSamples) {
    assert.ok(Math.abs(sample.x - sample.expectedX) <= 1, `reopen x was not centered: ${sample.x}`);
    assert.ok(Math.abs(sample.y - sample.expectedY) <= 1, `reopen y was not centered: ${sample.y}`);
    assert.ok(Math.abs(sample.x - reopenSamples.immediate.x) <= 1, 'reopen x changed after first paint');
    assert.ok(Math.abs(sample.y - reopenSamples.immediate.y) <= 1, 'reopen y changed after first paint');
  }
  result.measurements.reopenSamples = reopenSamples;
  result.assertions.reopenIsCenteredFromImmediateRender = true;
  result.assertions.reopenPositionRemainsStableAcrossFrames = true;
  await capture('03-reopened-centered-without-flash');

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
