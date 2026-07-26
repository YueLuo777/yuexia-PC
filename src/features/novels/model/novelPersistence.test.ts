import { beforeEach, describe, expect, it } from 'vitest';

import { NEXT_NOVEL_ID_KEY, removeNovelScopedStorage, reserveNextNovelId } from './novelPersistence';

describe('novel persistence safety', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps allocating monotonic ids after the highest numbered novel was deleted', () => {
    expect(reserveNextNovelId([{ id: 1 }, { id: 8 }])).toBe(9);
    expect(localStorage.getItem(NEXT_NOVEL_ID_KEY)).toBe('10');

    expect(reserveNextNovelId([{ id: 1 }])).toBe(10);
    expect(localStorage.getItem(NEXT_NOVEL_ID_KEY)).toBe('11');
  });

  it('clears only the permanently deleted novel data and inbound script links', () => {
    localStorage.setItem('xinyuexia_workbench_settings_7', 'settings');
    localStorage.setItem('xinyuexia_workbench_settings_7_review_background_tasks_v2', 'tasks');
    localStorage.setItem('xinyuexia_workbench_outline_7', 'outline');
    localStorage.setItem('xinyuexia_workbench_ai_sessions_7', 'sessions');
    localStorage.setItem('xinyuexia_workbench_notes_list_v1_7', 'notes');
    localStorage.setItem('xinyuexia_standard_setting_template_7', 'template');
    localStorage.setItem('xinyuexia_standard_setting_template_8', 'keep-template');
    localStorage.setItem('xinyuexia_chapter_polish_status_v1:xinyuexia_workbench_settings_7', 'polish');
    localStorage.setItem('xinyuexia_novel_7_chapter_70', 'content');
    localStorage.setItem('xinyuexia_script_editor_linked_novel_v2_3', '7');
    localStorage.setItem('xinyuexia_script_editor_linked_novel_v2_4', '8');
    localStorage.setItem('xinyuexia_workbench_settings_70', 'keep-neighbor');
    localStorage.setItem('xinyuexia_unrelated_key', 'keep');

    removeNovelScopedStorage(7, [
      {
        id: 1,
        name: '第一卷',
        isExpanded: true,
        chapters: [
          {
            id: 70,
            title: '第一章',
            serialNumber: 1,
            wordCount: 2,
            isSelected: true,
            isPublished: false,
          },
        ],
      },
    ]);

    expect(localStorage.getItem('xinyuexia_workbench_settings_7')).toBeNull();
    expect(localStorage.getItem('xinyuexia_workbench_settings_7_review_background_tasks_v2')).toBeNull();
    expect(localStorage.getItem('xinyuexia_workbench_outline_7')).toBeNull();
    expect(localStorage.getItem('xinyuexia_workbench_ai_sessions_7')).toBeNull();
    expect(localStorage.getItem('xinyuexia_workbench_notes_list_v1_7')).toBeNull();
    expect(localStorage.getItem('xinyuexia_standard_setting_template_7')).toBeNull();
    expect(localStorage.getItem('xinyuexia_standard_setting_template_8')).toBe('keep-template');
    expect(localStorage.getItem('xinyuexia_novel_7_chapter_70')).toBeNull();
    expect(localStorage.getItem('xinyuexia_script_editor_linked_novel_v2_3')).toBeNull();
    expect(localStorage.getItem('xinyuexia_script_editor_linked_novel_v2_4')).toBe('8');
    expect(localStorage.getItem('xinyuexia_workbench_settings_70')).toBe('keep-neighbor');
    expect(localStorage.getItem('xinyuexia_unrelated_key')).toBe('keep');
  });
});
