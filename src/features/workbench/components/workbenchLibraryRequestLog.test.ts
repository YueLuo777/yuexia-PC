import { describe, expect, it } from 'vitest';

import { buildCurrentSettingLinkSnapshot, formatCurrentSettingLinkedText } from './workbenchLibraryRequestLog';

describe('formatCurrentSettingLinkedText', () => {
  it('puts the visible setting name before the linked setting body', () => {
    expect(formatCurrentSettingLinkedText('主角金手指/优势', '能力来源：万界吞噬系统。')).toBe(
      '设定名：主角金手指/优势\n能力来源：万界吞噬系统。',
    );
  });

  it('still links a setting name when the body is empty', () => {
    expect(formatCurrentSettingLinkedText('世界观', '')).toBe('设定名：世界观');
  });

  it('returns both the visible title and explicit linked text', () => {
    expect(buildCurrentSettingLinkSnapshot({ title: '世界观' }, '灵气复苏')).toEqual({
      title: '世界观',
      text: '设定名：世界观\n灵气复苏',
    });
  });
});
