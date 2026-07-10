import { beforeEach, describe, expect, it } from 'vitest';

import {
  getScriptLinkedNovelStorageKey,
  readScriptLinkedNovelId,
  writeScriptLinkedNovelId,
} from './scriptLinkedNovelStorage';

describe('scriptLinkedNovelStorage', () => {
  beforeEach(() => localStorage.clear());

  it('keeps linked novels isolated per script', () => {
    writeScriptLinkedNovelId(1, 101);
    writeScriptLinkedNovelId(2, 202);

    expect(readScriptLinkedNovelId(1)).toBe(101);
    expect(readScriptLinkedNovelId(2)).toBe(202);
  });

  it('migrates the legacy global value only to the first active script', () => {
    localStorage.setItem('xinyuexia_script_editor_linked_novel', '88');

    expect(readScriptLinkedNovelId(7)).toBe(88);
    expect(localStorage.getItem(getScriptLinkedNovelStorageKey(7))).toBe('88');
    expect(readScriptLinkedNovelId(8)).toBeNull();
  });
});
