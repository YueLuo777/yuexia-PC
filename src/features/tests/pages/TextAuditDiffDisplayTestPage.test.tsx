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

    expect(source).toContain('方案 A：审核后正文红字标改动');
    expect(source).toContain('方案 B：原文 / 审核后左右对照');
    expect(source).toContain('方案 C：按段落卡片展示');
    expect(source).toContain('方案 D：只列改动清单');
    expect(source).toContain('原文 / 审核后左右对照方案');
    expect(source).toContain('红字为 AI 修改');
    expect(source).toContain('recommended: true');
    expect(source).toContain("token.changed ? 'font-black text-red-500'");
  });

  it('is available from the software test collection', async () => {
    const source = await readSource(collectionPagePath);

    expect(source).toContain('TextAuditDiffDisplayTestPage');
    expect(source).toContain('/text-audit-diff-display-test');
    expect(source).toContain('文本审核差异显示方案');
    expect(source).toContain('对比审核后正文红字、左右对照、段落卡片和改动清单几种文本审核结果显示方式。');
    expect(source).toContain('className="min-h-0 flex-1 overflow-y-auto"');
  });

  it('renames audit preview title to audit-after and keeps status output out of revised text fallback', async () => {
    const source = await readSource(chapterEditorPath);

    expect(source).toContain("reviewMode === 'audit' ? '审核后' : 'AI标注'");
    expect(source).toContain("? '审核后'");
    expect(source).toContain(
      "() => (isAuditTextReview ? reviewRevisedDraft.trim() || extractReviewRevisedText(reviewAiOutput) : '')",
    );
    expect(source).not.toContain("(isAuditTextReview ? auditVisibleOutput : '')");
  });
});
