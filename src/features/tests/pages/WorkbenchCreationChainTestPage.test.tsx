import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/WorkbenchCreationChainTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

async function readTestPageSource() {
  return readFile(testPagePath, 'utf8');
}

async function readCollectionPageSource() {
  return readFile(collectionPagePath, 'utf8');
}

describe('WorkbenchCreationChainTestPage', () => {
  it('checks the real brainstorm, setting, outline, body, and linked-context storage chain', async () => {
    const source = await readTestPageSource();

    expect(source).toContain('WorkbenchCreationChainTestPage');
    expect(source).toContain('xinyuexia_novels_v1');
    expect(source).toContain('xinyuexia_volumes_v1');
    expect(source).toContain('GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY');
    expect(source).toContain('xinyuexia_workbench_settings_${TEST_WORK_ID}');
    expect(source).toContain('xinyuexia_workbench_outline_${TEST_WORK_ID}');
    expect(source).toContain('getChapterContentKey(TEST_WORK_ID, TEST_CHAPTER_ID)');
    expect(source).toContain('readWorkbenchLibraryEntriesWithGlobalBrainstorm(TEST_SETTINGS_KEY)');
    expect(source).toContain('readWorkbenchLinkedContextItems(TEST_WORK_ID)');
    expect(source).toContain('writeWorkbenchLinkedContextItems(TEST_WORK_ID, testLinkedContextItems)');
    expect(source).toContain('生成测试作品并检查链路');
    expect(source).toContain('AI 关联资料能同时带上章纲、设定和正文。');
  });

  it('adds the chain self-check page to the AI link test collection group', async () => {
    const source = await readCollectionPageSource();

    expect(source).toContain('WorkbenchCreationChainTestPage');
    expect(source).toContain('/workbench-creation-chain-test');
    expect(source).toContain('脑洞设定章纲正文链路自检');
    expect(source).toContain('生成临时作品并检查全局脑洞、作品设定、章纲、梗概、正文和 AI 关联资料是否能按真实存储链路读通。');
  });
});
