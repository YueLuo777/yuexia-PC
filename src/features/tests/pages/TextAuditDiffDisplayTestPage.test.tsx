import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { readChapterEditorSource } from '@/features/workbench/components/chapterEditorSource.testUtils';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/TextAuditDiffDisplayTestPage.tsx');
const interactivePrototypePath = resolve(
  process.cwd(),
  'src/features/tests/pages/TextAuditInteractiveReviewPrototype.tsx',
);
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

async function readSource(path: string) {
  return readFile(path, 'utf8');
}

describe('TextAuditDiffDisplayTestPage', () => {
  it('provides text audit diff display alternatives with side-by-side marked as recommended', async () => {
    const source = await readSource(testPagePath);

    expect(source).toContainSource('方案 A：审核后正文红字标改动');
    expect(source).toContainSource('方案 B：原文 / 审核后左右对照');
    expect(source).toContainSource('方案 C：按段落卡片展示');
    expect(source).toContainSource('方案 D：只列改动清单');
    expect(source).toContainSource('文本审核逐段确认方案');
    expect(source).toContainSource('红字为 AI 修改');
    expect(source).toContainSource('recommended: true');
    expect(source).toContainSource("token.changed ? 'font-black text-red-500'");
  });

  it('provides an interactive paragraph review flow before applying accepted changes', async () => {
    const source = await readSource(interactivePrototypePath);

    expect(source).toContainSource('逐段审阅原型');
    expect(source).toContainSource('1 剧情审核 · 已通过');
    expect(source).toContainSource('2 文本审核 · 审阅中');
    expect(source).toContainSource('上一处');
    expect(source).toContainSource('下一处');
    expect(source).toContainSource("showChangesOnly ? '显示全部段落' : '只看改动'");
    expect(source).toContainSource('保留原文');
    expect(source).toContainSource('编辑后采用');
    expect(source).toContainSource('接受本段');
    expect(source).toContainSource('应用已接受修改（{acceptedCount}）');
    expect(source).toContainSource('最终正文预览');
    expect(source).toContainSource('本测试页只演示审阅交互，不会改动真实章节正文');
  });

  it('is available from the software test collection', async () => {
    const source = await readSource(collectionPagePath);

    expect(source).toContainSource('TextAuditDiffDisplayTestPage');
    expect(source).toContainSource('/text-audit-diff-display-test');
    expect(source).toContainSource('文本审核差异显示方案');
    expect(source).toContainSource('对比审核后正文红字、左右对照、段落卡片和改动清单几种文本审核结果显示方式。');
    expect(source).toContainSource('className="min-h-0 flex-1 overflow-y-auto"');
  });

  it('names audit previews by chapter and audit type while keeping status output out of revised text fallback', async () => {
    const source = readChapterEditorSource();

    expect(source).toContainSource("? '文本审核'");
    expect(source).toContainSource(": '剧情审核'");
    expect(source).toContainSource('`第${activeReviewChapter.serialNumber}章 ${reviewPreviewAnnotationLabel}`');
    expect(source).toContainSource('buildTextAuditRevisedText(reviewAiOutput, activeReviewContent)');
    expect(source).not.toContainSource("(isAuditTextReview ? auditVisibleOutput : '')");
  });
});
