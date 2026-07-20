import { describe, expect, it } from 'vitest';

import {
  createAiThinkingPlaceholder,
  createReviewLogSection,
  formatAiThinkingResponse,
  getReviewLogFillGroupWeights,
  getReviewLogSection,
} from './chapterReviewLog';

describe('chapterReviewLog', () => {
  it('round-trips the current section marker format', () => {
    const log = [
      createReviewLogSection('系统提示词', '审核提示'),
      createReviewLogSection('关联章纲', '章纲内容'),
      createReviewLogSection('原文', '正文内容'),
      createReviewLogSection('其他要求', '更严格'),
      createReviewLogSection('发送上下文', '完整上下文'),
    ].join('\n\n');

    expect(getReviewLogSection(log, '系统提示词')).toBe('审核提示');
    expect(getReviewLogSection(log, '关联章纲')).toBe('章纲内容');
    expect(getReviewLogSection(log, '原文')).toBe('正文内容');
    expect(getReviewLogSection(log, '其他要求')).toBe('更严格');
    expect(getReviewLogSection(log, '发送上下文')).toBe('完整上下文');
  });

  it('continues reading legacy bracketed logs', () => {
    const legacy = `请求日志
【系统提示词】
审核提示
【关联章纲】
章纲内容
【原文】
正文内容
【其他要求】
更严格
【发送上下文】
完整上下文`;

    expect(getReviewLogSection(legacy, '原文')).toBe('正文内容');
    expect(getReviewLogSection(legacy, '其他要求')).toBe('更严格');
  });

  it('adjusts fill weights only for optional populated groups', () => {
    expect(getReviewLogFillGroupWeights({ hasOutline: false, hasUser: false })).toEqual({ prompt: 1, original: 2 });
    expect(getReviewLogFillGroupWeights({ hasOutline: true, hasUser: true })).toEqual({
      prompt: 1,
      outline: 1,
      original: 2,
      user: 1,
    });
  });

  it('formats streamed reasoning with stable markers and safe elapsed time', () => {
    expect(formatAiThinkingResponse('答案', '推理', -2, false)).toBe(
      '[[THINKING seconds=0 status=thinking]]\n推理\n[[/THINKING]]\n答案',
    );
    expect(formatAiThinkingResponse('', '', 3, false)).toBe('正在思考...');
    expect(formatAiThinkingResponse('', '', 3, true)).toBe('');
  });

  it('creates a marker-backed empty thinking card before reasoning arrives', () => {
    expect(createAiThinkingPlaceholder(0)).toBe('[[THINKING seconds=0 status=thinking]]\n\n[[/THINKING]]');
    expect(createAiThinkingPlaceholder(-3)).toBe('[[THINKING seconds=0 status=thinking]]\n\n[[/THINKING]]');
  });
});
