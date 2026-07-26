import { describe, expect, it } from 'vitest';

import { parseSettingContent } from '@/features/workbench/components/workbenchStructuredSettings';
import {
  buildStandardBrainstormGenerationRequest,
  buildStandardBrainstormRevisionRequest,
  createSavedBrainstormEntry,
  createEmptyGeneratedVersion,
  getBrainstormTitleFieldCharacterWidth,
} from '@/features/workbench/model/standardModeBrainstormModel';

describe('standardModeBrainstormModel', () => {
  it('builds one compact generation request with all brainstorm questions', () => {
    const request = buildStandardBrainstormGenerationRequest({
      workType: '玄幻',
      genre: '凡人流',
      expectedLength: '200万',
      protagonistCheat: '吞噬系统',
      otherRequirements: '开局冲突要明确，避免无意义的谜语设定。',
    });

    expect(request).toContain('作品类型：玄幻');
    expect(request).toContain('作品流派：凡人流');
    expect(request).toContain('预计篇幅：200万');
    expect(request).toContain('主角金手指：吞噬系统');
    expect(request).toContain('其他要求：开局冲突要明确，避免无意义的谜语设定。');
    expect(request).not.toContain('版本');
    expect(createEmptyGeneratedVersion().title).toBe('未命名脑洞');
    expect(getBrainstormTitleFieldCharacterWidth('短名')).toBe(6);
    expect(getBrainstormTitleFieldCharacterWidth('一二三四五六七八九')).toBe(9);
    expect(getBrainstormTitleFieldCharacterWidth('一二三四五六七八九十一二三四五六七八')).toBe(15);
  });

  it('uses the requested save name or the unnamed fallback and keeps structured content', () => {
    const named = createSavedBrainstormEntry([], '新脑洞', '完整脑洞内容');
    const unnamed = createSavedBrainstormEntry([named], '  ', '另一版内容');

    expect(named.title).toBe('新脑洞');
    expect(unnamed.title).toBe('未命名脑洞');
    expect(parseSettingContent(named.content).body).toBe('完整脑洞内容');
    expect(unnamed.brainstormSerialNumber).toBe(2);
    expect(buildStandardBrainstormRevisionRequest('旧内容', '强化冲突')).toContain('强化冲突');
  });
});
