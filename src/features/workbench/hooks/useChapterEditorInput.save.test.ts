import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SHORTCUT_ACTION_EVENT } from '@/shared/shortcuts/shortcutConfig';

import { useChapterEditorInput } from './useChapterEditorInput';

function setup(onFlushSave: () => boolean) {
  const onToast = vi.fn();
  renderHook(() =>
    useChapterEditorInput({
      chapter: { id: 101, title: 'Chapter', serialNumber: 1, wordCount: 4, isSelected: true },
      content: 'text',
      formatSettings: { paragraphIndent: false, mergeParagraphs: false },
      findText: '',
      replaceText: '',
      onChangeContent: vi.fn(),
      onFlushSave,
      onOpenFind: vi.fn(),
      onToast,
      setIsSymbolReplaceOpen: vi.fn(),
      setShowDeleteConfirm: vi.fn(),
    }),
  );
  return onToast;
}

describe('useChapterEditorInput explicit save shortcut', () => {
  it.each([
    [true, '已保存'],
    [false, '保存失败，请重试'],
  ])('reports the actual flush result', (succeeded, message) => {
    const onFlushSave = vi.fn(() => succeeded);
    const onToast = setup(onFlushSave);

    act(() => {
      window.dispatchEvent(new CustomEvent(SHORTCUT_ACTION_EVENT, { detail: { id: 'save_chapter' } }));
    });

    expect(onFlushSave).toHaveBeenCalledOnce();
    expect(onToast).toHaveBeenCalledWith(message);
  });
});
