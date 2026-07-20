import { describe, expect, it } from 'vitest';

import {
  ensureBrainstormSerialNumbers,
  resequenceBrainstormEntries,
  type WorkbenchLibraryEntry,
} from './workbenchLibraryStorage';

function entry(id: string, tab: string, brainstormSerialNumber?: number): WorkbenchLibraryEntry {
  return {
    id,
    tab,
    title: id,
    content: '',
    updatedAt: '',
    ...(brainstormSerialNumber ? { brainstormSerialNumber } : {}),
  };
}

describe('brainstorm serial numbers', () => {
  it('migrates legacy brainstorms once and keeps existing gaps', () => {
    const normalized = ensureBrainstormSerialNumbers([
      entry('existing-1', '脑洞', 1),
      entry('existing-3', '脑洞', 3),
      entry('new-entry', '脑洞'),
      entry('setting', '设定'),
    ]);

    expect(normalized.map((item) => item.brainstormSerialNumber)).toEqual([1, 3, 4, undefined]);
  });

  it('reassigns only existing brainstorms by current list order', () => {
    const reordered = resequenceBrainstormEntries([
      entry('brainstorm-1', '脑洞', 1),
      entry('setting', '设定'),
      entry('brainstorm-3', '脑洞', 3),
    ]);

    expect(reordered.map((item) => item.brainstormSerialNumber)).toEqual([1, undefined, 2]);
  });
});
