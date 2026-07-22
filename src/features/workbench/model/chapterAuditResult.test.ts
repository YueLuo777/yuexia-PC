import { describe, expect, it } from 'vitest';

import {
  AUDIT_OUTLINE_FIT_ITEM,
  getAuditOutlineFitPercent,
  getAuditStructureItemDetail,
  getAuditStructureItemStatus,
  isAuditOutputPassed,
} from './chapterAuditResult';

const auditOutput = `【剧情审核结果】

【审核项】章纲贴合度
【贴合度】88%
【结果】通过
【说明】关键事件与章纲一致。
【建议】结尾可以更明确。

【审核项】人物行为是否合理
【结果】不通过
【说明】人物突然改变目标。
【建议】补充动机铺垫。

【总体判断】需要调整人物动机。
【剧情审核结论】不通过`;

describe('chapterAuditResult', () => {
  it('extracts and clamps outline fit percentages', () => {
    expect(getAuditOutlineFitPercent(auditOutput)).toBe(88);
    expect(getAuditOutlineFitPercent('章纲贴合度：120%')).toBe(100);
    expect(getAuditOutlineFitPercent('没有贴合度')).toBeNull();
  });

  it('reads per-item status before the overall conclusion', () => {
    expect(getAuditStructureItemStatus(auditOutput, AUDIT_OUTLINE_FIT_ITEM)).toBe('passed');
    expect(getAuditStructureItemStatus(auditOutput, '人物行为是否合理')).toBe('failed');
    expect(getAuditStructureItemStatus('', '人物行为是否合理')).toBe('pending');
  });

  it('uses the outline threshold when an explicit result is absent', () => {
    expect(getAuditStructureItemStatus('章纲贴合度：85%', AUDIT_OUTLINE_FIT_ITEM)).toBe('passed');
    expect(getAuditStructureItemStatus('章纲贴合度：84%', AUDIT_OUTLINE_FIT_ITEM)).toBe('failed');
  });

  it('extracts description and suggestion only from the requested item', () => {
    expect(getAuditStructureItemDetail(auditOutput, '人物行为是否合理')).toEqual({
      description: '人物突然改变目标。',
      suggestion: '补充动机铺垫。',
    });
  });

  it('requires a clean pass and rejects ambiguous pass wording', () => {
    expect(isAuditOutputPassed('【剧情审核结论】通过\n【结果】通过')).toBe(true);
    expect(isAuditOutputPassed(auditOutput)).toBe(false);
    expect(isAuditOutputPassed('整体部分通过')).toBe(false);
    expect(
      isAuditOutputPassed('【剧情审核结论】通过\n【结果】通过\n【文本审核结果】\n【结果】不通过'),
    ).toBe(true);
  });
});
