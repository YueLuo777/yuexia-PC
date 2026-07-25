import { describe, expect, it } from 'vitest';

import {
  buildCurrentSettingLinkSnapshot,
  countSettingLinkedContextWords,
  formatSettingLinkedContextForAi,
  formatSettingLinkedContextForDisplay,
  hasSettingLinkedContext,
} from './workbenchLibraryRequestLog';

describe('setting linked context formatting', () => {
  it('keeps an empty current setting linked as the update target with its full path', () => {
    const snapshot = {
      source: 'current' as const,
      ...buildCurrentSettingLinkSnapshot({ title: '力量体系' }, '', '作品设定/核心设定/力量体系'),
    };
    expect(hasSettingLinkedContext(snapshot)).toBe(true);
    expect(formatSettingLinkedContextForAi(snapshot)).toBe(
      '<关联设定>\n' +
        '处理规则：仅修改用途为“本次处理对象”的设定；用途为“参考资料”的设定只用于保持一致，不得改写。\n' +
        '<设定 用途="本次处理对象" 路径="作品设定/核心设定/力量体系">\n' +
        '<当前内容>\n当前内容为空\n</当前内容>\n</设定>\n</关联设定>',
    );
    expect(countSettingLinkedContextWords(snapshot)).toBe(0);
  });

  it('marks other settings as references and escapes their path attributes', () => {
    const context = {
      source: 'other' as const,
      title: '其他设定 1 项',
      text: '灵气复苏',
      items: [
        {
          usage: '参考资料' as const,
          path: '作品设定/核心设定/灵气 & 旧城 "A"',
          text: '灵气复苏',
        },
      ],
    };
    expect(formatSettingLinkedContextForAi(context)).toContain(
      '<设定 用途="参考资料" 路径="作品设定/核心设定/灵气 &amp; 旧城 &quot;A&quot;">',
    );
    expect(countSettingLinkedContextWords(context)).toBe(4);
  });

  it('uses plain language in the user-facing log instead of raw tags', () => {
    const context = {
      source: 'current' as const,
      ...buildCurrentSettingLinkSnapshot(
        { title: '力量体系' },
        '九境修炼',
        '作品设定/核心设定/力量体系',
      ),
    };
    const display = formatSettingLinkedContextForDisplay(context);
    expect(display).toContain('分类路径：作品设定 ＞ 核心设定 ＞ 力量体系');
    expect(display).toContain('用途：本次处理对象');
    expect(display).toContain('当前内容：\n九境修炼');
    expect(display).not.toContain('<关联设定>');
  });

  it('returns the raw content without repeating the setting name', () => {
    expect(buildCurrentSettingLinkSnapshot({ title: '世界观' }, '灵气复苏', '作品设定/核心设定/世界观')).toEqual({
      title: '世界观',
      text: '灵气复苏',
      items: [
        {
          usage: '本次处理对象',
          path: '作品设定/核心设定/世界观',
          text: '灵气复苏',
        },
      ],
    });
  });
});
