import { describe, expect, it } from 'vitest';

import type { Volume } from './workbenchTypes';
import { countWords, ensureOneSelected, getSelectedChapter } from './workbenchRules';

describe('workbenchRules', () => {
  it('counts Chinese characters, English words, and numbers', () => {
    expect(countWords('月下 writes 12 chapters')).toBe(5);
  });

  it('finds the selected chapter with its volume context', () => {
    const volumes: Volume[] = [
      {
        id: 1,
        name: 'A',
        isExpanded: true,
        chapters: [{ id: 10, title: '', serialNumber: 1, wordCount: 0, isSelected: false }],
      },
      {
        id: 2,
        name: 'B',
        isExpanded: true,
        chapters: [{ id: 20, title: '', serialNumber: 2, wordCount: 0, isSelected: true }],
      },
    ];

    expect(getSelectedChapter(volumes)).toEqual({
      volumeId: 2,
      volumeName: 'B',
      chapter: volumes[1].chapters[0],
    });
  });

  it('selects the first available chapter when none are selected', () => {
    const volumes: Volume[] = [
      { id: 1, name: 'A', isExpanded: true, chapters: [] },
      {
        id: 2,
        name: 'B',
        isExpanded: true,
        chapters: [{ id: 20, title: '', serialNumber: 1, wordCount: 0, isSelected: false }],
      },
    ];

    expect(ensureOneSelected(volumes)[1].chapters[0].isSelected).toBe(true);
  });

  it('keeps an existing selected chapter unchanged', () => {
    const volumes: Volume[] = [
      {
        id: 1,
        name: 'A',
        isExpanded: true,
        chapters: [{ id: 10, title: '', serialNumber: 1, wordCount: 0, isSelected: true }],
      },
      {
        id: 2,
        name: 'B',
        isExpanded: true,
        chapters: [{ id: 20, title: '', serialNumber: 2, wordCount: 0, isSelected: false }],
      },
    ];

    expect(ensureOneSelected(volumes)).toEqual(volumes);
  });
});
