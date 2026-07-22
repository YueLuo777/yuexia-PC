import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.AUDIT_PROMPT_CAPTURE_URL ?? 'http://127.0.0.1:4177';
const artifactsDir = path.resolve('artifacts');
const fullPath = path.join(artifactsDir, 'audit-prompt-disable-embedded.png');
const closeupPath = path.join(artifactsDir, 'audit-prompt-disable-embedded-closeup.png');
const enabledPath = path.join(artifactsDir, 'audit-prompt-enabled-footer.png');

await mkdir(artifactsDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const page = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 1,
});

await page.addInitScript(() => {
  const auditPrompt = {
    id: 'audit-border-proof',
    name: '章节审核',
    description: '',
    content: '请检查章节剧情是否连贯，人物动机是否合理。',
    textAuditContent: '请检查错别字、病句与重复表达，并给出修改建议。',
    textAuditEnabled: true,
    category: '审核',
    promptType: 'novel',
    usageCount: 0,
    isFavorite: false,
    isLocked: false,
    createdAt: '2026-07-22T00:00:00.000Z',
    updatedAt: '2026-07-22T00:00:00.000Z',
  };
  const overflowPrompts = Array.from({ length: 20 }, (_, index) => ({
    ...auditPrompt,
    id: `overflow-prompt-${index}`,
    name: `脑洞提示词${index + 1}`,
    category: '脑洞',
    textAuditContent: undefined,
    textAuditEnabled: undefined,
  }));
  localStorage.setItem(
    'xinyuexia_prompts_v1',
    JSON.stringify([auditPrompt, ...overflowPrompts]),
  );
  localStorage.setItem(
    'xinyuexia_prompt_categories_v1',
    JSON.stringify([
      '脑洞',
      '设定',
      '章纲',
      '正文',
      '审核',
      '综合点评',
      '润色',
      '更新状态',
      '生成梗概',
      '题材迭代',
      '未分类',
    ]),
  );
  localStorage.setItem('xinyuexia_app_scale', '1');
});

await page.goto(`${baseUrl}/#/prompts?category=${encodeURIComponent('审核')}`, {
  waitUntil: 'networkidle',
});

const importButton = page.getByRole('button', { name: '导入提示词', exact: true });
const promptCardScrollRegion = page.getByTestId('prompt-card-scroll-region');
const auditImportBox = await importButton.boundingBox();
if (!auditImportBox) throw new Error('Unable to measure the prompt import button.');
await page.getByRole('button', { name: '全部', exact: true }).click();
const allImportBox = await importButton.boundingBox();
if (!allImportBox) throw new Error('Unable to measure the prompt import button in All.');
const allScrollMetrics = await promptCardScrollRegion.evaluate((element) => ({
  clientHeight: element.clientHeight,
  scrollHeight: element.scrollHeight,
}));
if (allScrollMetrics.scrollHeight <= allScrollMetrics.clientHeight) {
  throw new Error(`All prompts did not overflow the card-only scroll region: ${JSON.stringify(allScrollMetrics)}`);
}
const categorySwitchOffset = allImportBox.x - auditImportBox.x;
if (Math.abs(categorySwitchOffset) > 0.1) {
  throw new Error(`Prompt toolbar shifted when the scrollbar appeared: ${categorySwitchOffset}`);
}
await page.getByRole('button', { name: '审核', exact: true }).click();
const auditScrollMetrics = await promptCardScrollRegion.evaluate((element) => ({
  clientHeight: element.clientHeight,
  scrollHeight: element.scrollHeight,
}));
if (auditScrollMetrics.scrollHeight > auditScrollMetrics.clientHeight) {
  throw new Error(`Audit prompts unexpectedly overflowed the card-only scroll region: ${JSON.stringify(auditScrollMetrics)}`);
}
const promptCardScrollHandle = await promptCardScrollRegion.elementHandle();
const toolbarInsideCardScroll = await importButton.evaluate(
  (button, scrollRegion) =>
    scrollRegion && typeof scrollRegion.contains === 'function' ? scrollRegion.contains(button) : true,
  promptCardScrollHandle,
);
if (toolbarInsideCardScroll) throw new Error('Prompt toolbar is still inside the card scroll region.');

const promptCard = page.locator('article').filter({ hasText: '章节审核' });
await promptCard.waitFor({ state: 'visible' });
await promptCard.getByRole('button', { name: '编辑' }).click();

const modal = page.locator('.xy-audit-prompt-editor-modal');
await modal.waitFor({ state: 'visible' });
const descriptionPlaceholder = await modal.getByLabel('提示词说明').getAttribute('placeholder');
if (descriptionPlaceholder !== '') {
  throw new Error(`Prompt description placeholder was not removed: ${descriptionPlaceholder}`);
}
const modalBox = await modal.boundingBox();
if (!modalBox) throw new Error('Unable to measure the audit prompt modal.');
const expectedModalHeight = 1000 * 0.9 - 43;
if (Math.abs(modalBox.height - expectedModalHeight) > 1) {
  throw new Error(`Audit prompt modal height was not reduced by 10%: ${modalBox.height}`);
}
const categoryRows = await modal.locator('section').nth(1).locator(':scope > div > div').evaluateAll((rows) =>
  rows.map((row) => Array.from(row.querySelectorAll('button'), (button) => button.textContent?.trim() ?? '')),
);
const expectedCategoryRows = [
  ['脑洞', '设定', '章纲', '正文'],
  ['审核', '点评', '润色', '状态', '梗概'],
  ['未分类'],
];
if (JSON.stringify(categoryRows) !== JSON.stringify(expectedCategoryRows)) {
  throw new Error(`Unexpected audit category rows: ${JSON.stringify(categoryRows)}`);
}
if ((await page.getByRole('button', { name: '题材迭代', exact: true }).count()) !== 0) {
  throw new Error('The retired genre-iteration prompt category is still visible.');
}
const enabledNotice = modal.getByText('文本审核已启用：剧情审核全部通过后发送给AI。');
const enabledNoticeFontSize = await enabledNotice.evaluate((element) =>
  element.ownerDocument.defaultView?.getComputedStyle(element).fontSize,
);
if (enabledNoticeFontSize !== '16px') {
  throw new Error(`Enabled text-audit notice font size is not 16px: ${enabledNoticeFontSize}`);
}
await modal.screenshot({ path: enabledPath });
await modal.getByLabel('文本审核提示词').click();
await modal.getByRole('button', { name: '禁用' }).click();
await modal.getByText('文本审核已禁用：此提示词不会发送给AI。').waitFor({ state: 'visible' });
await modal.screenshot({ path: fullPath });

const enableButton = modal.getByRole('button', { name: '启用' });
const textAuditField = enableButton.locator('..');
const fieldBox = await textAuditField.boundingBox();
if (!fieldBox) throw new Error('Unable to locate the text-audit field.');

await textAuditField.screenshot({ path: closeupPath });

const noticeBox = await modal.getByText('文本审核已禁用：此提示词不会发送给AI。').boundingBox();
if (!noticeBox) throw new Error('Unable to locate the disabled text-audit notice.');
const noticeCenterOffset = {
  x: noticeBox.x + noticeBox.width / 2 - (fieldBox.x + fieldBox.width / 2),
  y: noticeBox.y + noticeBox.height / 2 - (fieldBox.y + fieldBox.height / 2),
};
if (Math.abs(noticeCenterOffset.x) > 1 || Math.abs(noticeCenterOffset.y) > 1) {
  throw new Error(`Disabled notice is not centered in the text-audit field: ${JSON.stringify(noticeCenterOffset)}`);
}

const geometry = await textAuditField.evaluate((field) => {
  const button = field.querySelector('button');
  const view = field.ownerDocument.defaultView;
  if (!view || !(button instanceof view.HTMLElement)) throw new Error('Disable button is missing.');
  const fieldRect = field.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();
  const borderTopWidth = Number.parseFloat(view.getComputedStyle(field).borderTopWidth);
  return {
    fieldTop: fieldRect.top,
    borderCenter: fieldRect.top + borderTopWidth / 2,
    buttonTop: buttonRect.top,
    buttonBottom: buttonRect.bottom,
    buttonCenter: buttonRect.top + buttonRect.height / 2,
    centerOffsetFromBorder: buttonRect.top + buttonRect.height / 2 - (fieldRect.top + borderTopWidth / 2),
  };
});

if (Math.abs(geometry.centerOffsetFromBorder) > 0.6) {
  throw new Error(`Disable button is not centered on the border: ${JSON.stringify(geometry)}`);
}

process.stdout.write(
  `${JSON.stringify({ fullPath, closeupPath, enabledPath, modalHeight: modalBox.height, categorySwitchOffset, allScrollMetrics, auditScrollMetrics, categoryRows, geometry, noticeCenterOffset }, null, 2)}\n`,
);
await browser.close();
