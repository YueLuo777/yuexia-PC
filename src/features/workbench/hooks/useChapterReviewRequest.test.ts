import { describe, expect, it } from 'vitest';

import { buildNumberedTextAuditBody, buildTextAuditStagePrompt } from '../model/chapterAuditWorkflow';
import { buildStructureAuditPrompt } from './useChapterReviewRequest';

describe('two-stage chapter audit prompts', () => {
  it('keeps the first request limited to plot auditing', () => {
    const result = buildStructureAuditPrompt('自定义剧情审核规则');

    expect(result).toContain('自定义剧情审核规则');
    expect(result).toContain('本次请求只执行剧情审核');
    expect(result).toContain('【剧情审核结论】');
    expect(result).not.toContain('文本审核提示词');
    expect(result).not.toContain('【修改后全文】');
  });

  it('overrides full-text output rules with changed-paragraph-only output', () => {
    const result = buildTextAuditStagePrompt('原提示词要求输出【修改后全文】');

    expect(result).toContain('以下协议优先于前述提示词');
    expect(result).toContain('【修改段落】');
    expect(result).toContain('【段落序号】第N段');
    expect(result).toContain('不要输出修改后全文');
  });

  it('numbers every original paragraph and preserves blank paragraph positions', () => {
    expect(buildNumberedTextAuditBody('第一段\n\n第三段')).toBe(
      '【第1段】\n第一段\n\n【第2段】\n（空段，不要修改）\n\n【第3段】\n第三段',
    );
  });
});
