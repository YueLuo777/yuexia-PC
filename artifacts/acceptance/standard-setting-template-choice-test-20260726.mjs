import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});
const page = await browser.newPage({ viewport: { width: 2048, height: 1152 }, deviceScaleFactor: 1 });
const evidenceDir = path.resolve('artifacts', 'standard-setting-template-choice-test');
const errors = [];
await mkdir(evidenceDir, { recursive: true });

page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
  if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
    errors.push(`console: ${message.text()}`);
  }
});
await page.addInitScript(() => {
  localStorage.clear();
  sessionStorage.clear();
});

try {
  await page.goto('http://127.0.0.1:18328/#/test-collection', { waitUntil: 'domcontentloaded' });
  const card = page.locator('button').filter({ hasText: '标准模式设定模板选择方案' }).first();
  await card.scrollIntoViewIfNeeded();
  await card.click();
  await page.getByTestId('setting-template-choice-test').waitFor();
  await page.screenshot({ path: path.join(evidenceDir, '01-default-template.png') });

  await page.getByRole('button', { name: '修改默认模板' }).click();
  await page.getByLabel('设定分类名称').first().fill('作品资料');
  await page.getByLabel('设定分组名称').first().fill('作品基础');
  await page.getByLabel('设定名称').first().fill('作品方向');
  await page.getByLabel('子设定名称').first().fill('小说类别');

  await page.getByRole('button', { name: '新增分类' }).click();
  await page.getByLabel('设定分类名称').last().fill('宗门设定');
  await page.getByRole('button', { name: '新增分组' }).click();
  await page.getByLabel('设定分组名称').fill('宗门资料');
  await page.getByRole('button', { name: '新增设定' }).click();
  await page.getByLabel('设定名称').fill('青云宗');
  await page.getByRole('button', { name: '新增子设定' }).click();
  await page.getByLabel('子设定名称').fill('宗门位置');
  await page.getByRole('button', { name: '新增子设定' }).click();
  await page.getByRole('button', { name: '删除子设定：新子设定' }).click();
  await page.getByRole('textbox', { name: '模板名称' }).fill('玄幻自定义模板');
  await page.screenshot({ path: path.join(evidenceDir, '02-modify-default.png') });
  await page.getByRole('button', { name: '保存到我的模板' }).click();

  await page.getByRole('button', { name: '我的模板', exact: true }).click();
  await page.getByRole('button', { name: '选择模板：玄幻自定义模板' }).waitFor();
  await page.getByText('宗门设定').waitFor();
  await page.getByText('青云宗').waitFor();
  await page.screenshot({ path: path.join(evidenceDir, '03-my-templates.png') });
  await page.getByRole('button', { name: '使用此模板' }).click();
  await page.getByText('已选择“玄幻自定义模板”。').waitFor();

  const shell = page.getByTestId('setting-template-choice-test');
  const templateCards = await page
    .locator('button[aria-label="默认设定模板"], button[aria-label="修改默认模板"], button[aria-label="我的模板"]')
    .evaluateAll((buttons) =>
      buttons.map((button) => ({
        label: button.getAttribute('aria-label'),
        current: button.getAttribute('aria-current'),
        backgroundColor: getComputedStyle(button).backgroundColor,
        borderColor: getComputedStyle(button).borderColor,
      })),
    );
  const layout = await shell.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  assert.ok(layout.scrollWidth <= layout.clientWidth);
  assert.ok(layout.scrollHeight <= layout.clientHeight);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        status: 'PASS',
        layout,
        templateCards,
        screenshots: [
          path.join(evidenceDir, '01-default-template.png'),
          path.join(evidenceDir, '02-modify-default.png'),
          path.join(evidenceDir, '03-my-templates.png'),
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
