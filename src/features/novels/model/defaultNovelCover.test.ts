import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CUSTOM_DEFAULT_NOVEL_COVER_ID,
  CUSTOM_DEFAULT_NOVEL_COVER_LIMIT,
  CUSTOM_DEFAULT_NOVEL_COVER_STORAGE_KEY,
  DEFAULT_NOVEL_COVERS,
  DEFAULT_NOVEL_COVER_STORAGE_KEY,
  DEFAULT_NOVEL_COVER_UPDATED_EVENT,
  getDefaultNovelCover,
  removeCustomDefaultNovelCover,
  INITIAL_DEFAULT_NOVEL_COVER_ID,
  readCustomDefaultNovelCovers,
  readDefaultNovelCoverId,
  saveCustomDefaultNovelCover,
  saveDefaultNovelCoverId,
} from '@/features/novels/model/defaultNovelCover';

describe('default novel cover preference', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with the minimal moon-orbit cover and exposes all seven options', () => {
    expect(readDefaultNovelCoverId()).toBe('blue-minimal-03');
    expect(INITIAL_DEFAULT_NOVEL_COVER_ID).toBe('blue-minimal-03');
    expect(DEFAULT_NOVEL_COVERS).toHaveLength(7);
    expect(getDefaultNovelCover().label).toBe('简约2号封面');
    expect(getDefaultNovelCover().name).toBe('月轨');
    expect(DEFAULT_NOVEL_COVERS.filter((cover) => cover.group === 'normal').map((cover) => cover.label)).toEqual([
      '普通1号封面',
      '普通2号封面',
      '普通3号封面',
      '普通4号封面',
    ]);
    expect(DEFAULT_NOVEL_COVERS.filter((cover) => cover.group === 'minimal').map((cover) => cover.label)).toEqual([
      '简约1号封面',
      '简约2号封面',
      '简约3号封面',
    ]);
  });

  it('persists a valid selection and notifies the current window', () => {
    const listener = vi.fn();
    window.addEventListener(DEFAULT_NOVEL_COVER_UPDATED_EVENT, listener);

    saveDefaultNovelCoverId('moonlit-04');

    expect(localStorage.getItem(DEFAULT_NOVEL_COVER_STORAGE_KEY)).toBe('moonlit-04');
    expect(readDefaultNovelCoverId()).toBe('moonlit-04');
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(DEFAULT_NOVEL_COVER_UPDATED_EVENT, listener);
  });

  it('falls back to the minimal moon-orbit cover when stored data is invalid', () => {
    localStorage.setItem(DEFAULT_NOVEL_COVER_STORAGE_KEY, 'unknown-cover');
    expect(readDefaultNovelCoverId()).toBe('blue-minimal-03');
  });

  it('stores multiple custom covers, selects an older cover, and removes only the target', () => {
    const firstImage = 'data:image/webp;base64,custom-cover-1';
    const secondImage = 'data:image/webp;base64,custom-cover-2';

    const first = saveCustomDefaultNovelCover(firstImage);
    const second = saveCustomDefaultNovelCover(secondImage);

    expect(readCustomDefaultNovelCovers().map((cover) => cover.src)).toEqual([secondImage, firstImage]);
    expect(localStorage.getItem(CUSTOM_DEFAULT_NOVEL_COVER_STORAGE_KEY)).toBe(secondImage);
    expect(readDefaultNovelCoverId()).toBe(second.id);
    expect(getDefaultNovelCover().src).toBe(secondImage);

    saveDefaultNovelCoverId(first.id);
    expect(readDefaultNovelCoverId()).toBe(first.id);
    expect(localStorage.getItem(CUSTOM_DEFAULT_NOVEL_COVER_STORAGE_KEY)).toBe(firstImage);

    removeCustomDefaultNovelCover(first.id);

    expect(readCustomDefaultNovelCovers().map((cover) => cover.id)).toEqual([second.id]);
    expect(readDefaultNovelCoverId()).toBe(INITIAL_DEFAULT_NOVEL_COVER_ID);
  });

  it('keeps the latest twenty custom cover records', () => {
    for (let index = 1; index <= 22; index += 1) {
      saveCustomDefaultNovelCover(`data:image/webp;base64,custom-cover-${index}`);
    }

    const covers = readCustomDefaultNovelCovers();
    expect(covers).toHaveLength(CUSTOM_DEFAULT_NOVEL_COVER_LIMIT);
    expect(covers[0]?.src).toBe('data:image/webp;base64,custom-cover-22');
    expect(covers.at(-1)?.src).toBe('data:image/webp;base64,custom-cover-3');
  });

  it('migrates the previous single custom cover without losing the active selection', () => {
    const legacyImage = 'data:image/webp;base64,legacy-custom-cover';
    localStorage.setItem(CUSTOM_DEFAULT_NOVEL_COVER_STORAGE_KEY, legacyImage);
    localStorage.setItem(DEFAULT_NOVEL_COVER_STORAGE_KEY, CUSTOM_DEFAULT_NOVEL_COVER_ID);

    const selectedId = readDefaultNovelCoverId();

    expect(selectedId).toMatch(/^custom-default-cover-/);
    expect(readCustomDefaultNovelCovers()).toHaveLength(1);
    expect(getDefaultNovelCover(selectedId).src).toBe(legacyImage);
  });
});
