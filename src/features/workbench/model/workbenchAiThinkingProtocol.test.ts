import { describe, expect, it } from 'vitest';

import {
  createAiThinkingPlaceholder,
  formatAiThinkingResponse,
  isAiThinkingContent,
} from './workbenchAiThinkingProtocol';

describe('workbench AI thinking protocol', () => {
  it('uses the thinking-card protocol before reasoning or answer text arrives', () => {
    expect(createAiThinkingPlaceholder(0)).toBe('[[THINKING seconds=0 status=thinking]]\n\n[[/THINKING]]');
    expect(formatAiThinkingResponse('', '', 2, false)).toBe(
      '[[THINKING seconds=2 status=thinking]]\n\n[[/THINKING]]',
    );
    expect(isAiThinkingContent(createAiThinkingPlaceholder(0))).toBe(true);
    expect(isAiThinkingContent('普通AI答案')).toBe(false);
  });

  it('keeps completed empty output empty and preserves streamed reasoning and answers', () => {
    expect(formatAiThinkingResponse('', '', 2, true)).toBe('');
    expect(formatAiThinkingResponse('答案', '推理', 4, false)).toBe(
      '[[THINKING seconds=4 status=thinking]]\n推理\n[[/THINKING]]\n答案',
    );
  });
});
