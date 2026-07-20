import { describe, expect, it } from 'vitest';

import { getStructuredSettingWordCountSource } from './workbenchStructuredSettings';

describe('structured setting word-count source', () => {
  it('excludes serialized field titles and separators from an empty foreshadow entry', () => {
    const entry = {
      id: 'empty-foreshadow',
      title: '1号主线伏笔',
      content: '',
      tab: '设定',
      updatedAt: '',
    };
    const setting = {
      type: '主线伏笔',
      body: '【伏笔名称】：\n\n【伏笔编号】：\n\n【首次出现章节】：\n\n【回收章节】：\n',
      structuredFieldSetId: 'foreshadow-main',
    };

    expect(getStructuredSettingWordCountSource(entry, setting)).toBe('');
  });

  it('keeps actual structured field values in the count source', () => {
    const entry = { id: 'filled-foreshadow', title: '1号主线伏笔', content: '', tab: '设定', updatedAt: '' };
    const setting = {
      type: '主线伏笔',
      body: '【伏笔名称】：魂殿\n\n【伏笔内容】：后期回收',
      structuredFieldSetId: 'foreshadow-main',
    };

    expect(getStructuredSettingWordCountSource(entry, setting)).toBe('后期回收');
  });
});
