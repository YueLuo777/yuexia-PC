import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});
const page = await browser.newPage({ viewport: { width: 2048, height: 1152 }, deviceScaleFactor: 1 });
const errors = [];
const evidenceDir = path.resolve('artifacts', 'owner-test-mode-acceptance');
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
  localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
  localStorage.setItem('xinyuexia_owner_test_mode_v1', '1');
  localStorage.setItem(
    'xinyuexia_novels_v1',
    JSON.stringify([
      {
        id: 1,
        title: '测试模式验收小说',
        type: 'novel',
        category: '玄幻',
        wordCount: 0,
        createdAt: '2026/7/26',
        lastModifiedAt: '2026/7/26',
      },
    ]),
  );
  localStorage.setItem('xinyuexia_volumes_v1', JSON.stringify({ 1: [] }));
  localStorage.setItem(
    'xinyuexia_standard_setting_template_1',
    JSON.stringify({ version: 1, mode: 'default', customGroups: [] }),
  );
});

try {
  await page.goto('http://127.0.0.1:18328/#/novels', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '进入工作台' }).click();
  await page.getByRole('button', { name: '设定列表' }).click();
  await page.getByRole('button', { name: '一键检查' }).click();
  await page.getByText(/发现 \d+ 处未填写/).waitFor();
  await page.screenshot({ path: path.join(evidenceDir, '01-setting-layout.png') });

  const ownerButton = page.getByRole('button', { name: '退出测试模式' });
  const professionalButton = page.getByRole('button', { name: '进入专业模式' });
  const flowButton = page.getByRole('button', { name: '设定生成流程' });
  const search = page.getByRole('textbox', { name: '搜索设定' });
  const tree = page.getByRole('navigation', { name: '设定目录' });
  const scrollRegion = page.locator('[data-setting-check-scroll-region="true"]');
  const [ownerBox, professionalBox, searchBox, treeBox, scrollMetrics] = await Promise.all([
    ownerButton.boundingBox(),
    professionalButton.boundingBox(),
    search.boundingBox(),
    tree.boundingBox(),
    scrollRegion.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      overflowY: getComputedStyle(element).overflowY,
      rect: element.getBoundingClientRect().toJSON(),
    })),
  ]);

  assert.ok(ownerBox && professionalBox && ownerBox.x < professionalBox.x);
  assert.ok(searchBox && treeBox && searchBox.y > treeBox.y);
  assert.equal(scrollMetrics.overflowY, 'auto');
  assert.ok(scrollMetrics.scrollHeight > scrollMetrics.clientHeight);
  assert.ok(await flowButton.isVisible());

  await flowButton.click();
  const dialog = page.getByRole('dialog', { name: '设定生成流程' });
  await dialog.waitFor();
  await page.screenshot({ path: path.join(evidenceDir, '02-generation-flow-dialog.png') });
  for (const label of ['世界基础', '剧情规划', '主要人物', '地点与势力', '创作补充']) {
    assert.ok(await dialog.getByRole('button', { name: new RegExp(label) }).isVisible());
  }
  assert.ok(await page.getByLabel('步骤名称').isVisible());
  assert.ok(await page.getByLabel('本步骤生成范围').isVisible());
  assert.deepEqual(errors, []);

  console.log(
    JSON.stringify(
      {
        status: 'PASS',
        ownerBox,
        professionalBox,
        searchBox,
        treeBox,
        scrollMetrics,
        screenshots: [
          path.join(evidenceDir, '01-setting-layout.png'),
          path.join(evidenceDir, '02-generation-flow-dialog.png'),
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
