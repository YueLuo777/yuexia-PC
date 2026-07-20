import { beforeEach, describe, expect, it } from 'vitest';

import { readChapterEditorSource } from './chapterEditorSource.testUtils';
import { removeObsoleteChapterEditorSizeSpecs } from '../hooks/useChapterEditorSettingsModal';

describe('ChapterEditor settings cleanup', () => {
  beforeEach(() => localStorage.clear());

  it('keeps navigation width settings and removes obsolete review field-size controls', () => {
    const source = readChapterEditorSource();

    expect(source).toContainSource('WorkbenchNavigationWidthToggle');
    expect(source).toContainSource('调整作品编辑器导航宽度。');
    expect(source).not.toContainSource('剧情审核综合点评文笔润色更新状态按钮');
    expect(source).not.toContainSource('剧情审核综合点评文笔润色模型框');
    expect(source).not.toContainSource('审核提示词框');
    expect(source).not.toContainSource('综合点评提示词框');
    expect(source).not.toContainSource('configSelectStyle');
  });

  it('removes only obsolete review sizes from the shared persisted settings', () => {
    localStorage.setItem(
      'xinyuexia_workbench_field_size_specs_v1',
      JSON.stringify({
        reviewActionGroup: { width: 168 },
        reviewModelSelect: { width: 250 },
        reviewAuditPromptSelect: { width: 250 },
        reviewCommentPromptSelect: { width: 250 },
        settingName: { width: 220 },
      }),
    );

    removeObsoleteChapterEditorSizeSpecs();

    expect(JSON.parse(localStorage.getItem('xinyuexia_workbench_field_size_specs_v1') ?? '{}')).toEqual({
      settingName: { width: 220 },
    });
  });
});
