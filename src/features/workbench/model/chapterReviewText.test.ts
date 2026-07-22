import { describe, expect, it } from 'vitest';

import {
  buildReviewTextDiff,
  buildTextAuditRevisedText,
  extractReviewAnnotations,
  extractReviewModificationNotes,
  extractReviewRevisedText,
  extractTextAuditParagraphChanges,
  getReviewAnnotationParagraphIndex,
  getTextAuditResultSummary,
  preserveReviewParagraphIndentation,
  splitReviewParagraphs,
  stripReviewThinkingBlock,
  type ReviewAnnotation,
} from './chapterReviewText';

const annotation = (paragraphIndex: number): ReviewAnnotation => ({
  id: 'A001',
  severity: '提醒',
  type: '问题标注',
  paragraphIndex,
  originalText: '原句',
  problem: '',
  suggestion: '',
  action: '建议处理',
});

describe('chapterReviewText', () => {
  it('removes streamed thinking blocks before reading the visible response', () => {
    expect(
      stripReviewThinkingBlock('[[THINKING seconds=3 status=done]]\n内部推理\n[[/THINKING]]\n【修改后全文】正文'),
    ).toBe('【修改后全文】正文');
  });

  it('extracts revised text from a marked section or a fenced fallback', () => {
    expect(extractReviewRevisedText('【修改后全文】\n第一段\n第二段\n【修改说明】精简')).toBe('第一段\n第二段');
    expect(extractReviewRevisedText('```markdown\n备用正文\n```')).toBe('备用正文');
    expect(extractReviewRevisedText('只有审核说明')).toBe('');
    expect(extractReviewRevisedText('【修改后全文】\n　　保留缩进\n【修改说明】无')).toBe('　　保留缩进');
  });

  it('normalizes line endings without removing empty review paragraphs', () => {
    expect(splitReviewParagraphs('第一段\r\n\r\n第三段')).toEqual(['第一段', '', '第三段']);
  });

  it('rebuilds a full comparison draft from changed text-audit paragraphs only', () => {
    const output = `【文本审核结果】
【结果】不通过
【说明】发现两处问题。

【修改段落】
【段落序号】第1段
【修改后段落】第一段已修正。
【修改原因】修正病句。

【修改段落】
【段落序号】第3段
【修改后段落】第三段已修正。
【修改原因】修正错字。`;

    expect(extractTextAuditParagraphChanges(output)).toEqual([
      { paragraphIndex: 0, revisedText: '第一段已修正。', reason: '修正病句。' },
      { paragraphIndex: 2, revisedText: '第三段已修正。', reason: '修正错字。' },
    ]);
    expect(buildTextAuditRevisedText(output, '　　第一段。\n第二段。\n　　第三段。')).toBe(
      '　　第一段已修正。\n第二段。\n　　第三段已修正。',
    );
  });

  it('extracts the text-audit result for the blue summary card', () => {
    expect(
      getTextAuditResultSummary(
        '【剧情审核结论】通过\n【文本审核结果】\n【结果】通过\n【说明】未发现明确文本问题。',
      ),
    ).toEqual({ status: 'passed', label: '通过', description: '未发现明确文本问题。' });
  });

  it('restores original paragraph indentation without turning deleted paragraphs into spaces', () => {
    expect(
      preserveReviewParagraphIndentation(
        ['　　第一段', '  第二段', '\t第三段'],
        ['第一段修改', '　第二段修改', ''],
      ),
    ).toEqual(['　　第一段修改', '  第二段修改', '']);
  });

  it('extracts paragraph modification reasons and infers compact categories', () => {
    expect(
      extractReviewModificationNotes(
        `【修改后全文】\n正文\n【修改说明】\n第2段：删除重复表达。\n第5段｜情绪描写：改为动作表达。\n第8段：压缩冗长句式。`,
      ),
    ).toEqual([
      { paragraphIndex: 1, category: '重复表达', note: '删除重复表达。' },
      { paragraphIndex: 4, category: '情绪描写', note: '改为动作表达。' },
      { paragraphIndex: 7, category: '句式精简', note: '压缩冗长句式。' },
    ]);
  });

  it('parses valid annotation entries and supplies safe defaults', () => {
    const output = `# 原文标注
\`\`\`json
[
  {"paragraphIndex": 2, "originalText": " 原句 ", "problem": " 重复 "},
  {"paragraphIndex": "3", "originalText": "另一句", "id": "custom", "severity": "严重"},
  {"paragraphIndex": 4, "originalText": ""}
]
\`\`\``;

    expect(extractReviewAnnotations(output)).toEqual([
      {
        id: 'A001',
        severity: '提醒',
        type: '问题标注',
        paragraphIndex: 2,
        originalText: '原句',
        problem: '重复',
        suggestion: '',
        action: '建议处理',
      },
      {
        id: 'custom',
        severity: '严重',
        type: '问题标注',
        paragraphIndex: 3,
        originalText: '另一句',
        problem: '',
        suggestion: '',
        action: '建议处理',
      },
    ]);
  });

  it('ignores malformed annotation JSON and supports one-based and zero-based indexes', () => {
    expect(extractReviewAnnotations('原文标注\n```json\n[broken]\n```')).toEqual([]);
    expect(getReviewAnnotationParagraphIndex(annotation(2), 3)).toBe(1);
    expect(getReviewAnnotationParagraphIndex(annotation(0), 3)).toBe(0);
    expect(getReviewAnnotationParagraphIndex(annotation(4), 3)).toBe(-1);
  });

  it('keeps unchanged text compact and marks only replacement characters', () => {
    expect(buildReviewTextDiff('甲乙丙', '甲丁丙')).toEqual({
      original: [{ text: '甲' }, { text: '乙', changed: true }, { text: '丙' }],
      revised: [{ text: '甲' }, { text: '丁', changed: true }, { text: '丙' }],
      hasChanges: true,
    });
    expect(buildReviewTextDiff('相同', '相同')).toEqual({
      original: [{ text: '相同' }],
      revised: [{ text: '相同' }],
      hasChanges: false,
    });
  });

  it('uses the bounded fallback for long texts while preserving common edges', () => {
    const prefix = '甲'.repeat(600);
    const suffix = '乙'.repeat(600);
    const result = buildReviewTextDiff(`${prefix}旧${suffix}`, `${prefix}新${suffix}`);

    expect(result.original).toEqual([{ text: prefix }, { text: '旧', changed: true }, { text: suffix }]);
    expect(result.revised).toEqual([{ text: prefix }, { text: '新', changed: true }, { text: suffix }]);
  });
});
