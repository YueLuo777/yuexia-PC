import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/TextAuditDiffDisplayTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');
const chapterEditorPath = resolve(process.cwd(), 'src/features/workbench/components/ChapterEditor.tsx');

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
    expect(source).toContainSource('原文 / 审核后左右对照方案');
    expect(source).toContainSource('红字为 AI 修改');
    expect(source).toContainSource('recommended: true');
    expect(source).toContainSource("token.changed ? 'font-black text-red-500'");
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
    const source = await readSource(chapterEditorPath);

    expect(source).toContainSource("? '文本审核'");
    expect(source).toContainSource(": '剧情审核'");
    expect(source).toContainSource('`第${activeReviewChapter.serialNumber}章 ${reviewPreviewAnnotationLabel}`');
    expect(source).toContainSource(
      "() => (isAuditTextReview ? reviewRevisedDraft.trim() || extractReviewRevisedText(reviewAiOutput) : '')",
    );
    expect(source).not.toContainSource("(isAuditTextReview ? auditVisibleOutput : '')");
  });
});
