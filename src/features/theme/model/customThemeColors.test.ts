import { beforeEach, describe, expect, it } from 'vitest';

import {
  CUSTOM_THEME_COLOR_SLOTS,
  CUSTOM_THEME_COLORS_STORAGE_KEY,
  CUSTOM_THEME_RECENT_COLORS_STORAGE_KEY,
  applyCustomThemeColors,
  normalizeCustomThemeHexColor,
  readCustomThemeColors,
  readCustomThemeRecentColors,
  rememberCustomThemeColor,
  writeCustomThemeColors,
} from './customThemeColors';

describe('custom theme colors', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('style');
  });

  it('defines the requested global color targets with defaults and css variables', () => {
    expect(CUSTOM_THEME_COLOR_SLOTS.map((slot) => slot.key)).toEqual([
      'sidebarBackground',
      'sidebarActive',
      'contentSelected',
      'flowGroup',
      'editorBackground',
      'titlebar',
      'detailOutlineSelected',
      'detailOutlineUsed',
      'detailOutlineHasOutline',
      'detailOutlineNoOutline',
    ]);
    expect(CUSTOM_THEME_COLOR_SLOTS.map((slot) => slot.defaultColor)).toEqual([
      '#F5F5F7',
      '#DBE7FB',
      '#EAFBF3',
      '#E7F8FD',
      '#F5F5F7',
      '#E4E9EF',
      '#08AACE',
      '#FFF7ED',
      '#E7F8FD',
      '#FFFFFF',
    ]);
    expect(CUSTOM_THEME_COLOR_SLOTS.map((slot) => slot.cssVar)).toEqual([
      '--xy-custom-sidebar-bg',
      '--xy-custom-sidebar-active-bg',
      '--xy-custom-content-selected-bg',
      '--xy-custom-flow-group-bg',
      '--xy-wa-editor-bg',
      '--xy-wa-titlebar',
      '--xy-detail-outline-number-selected',
      '--xy-detail-outline-number-used',
      '--xy-detail-outline-number-has-outline',
      '--xy-detail-outline-number-no-outline',
    ]);
  });

  it('normalizes valid hex values and ignores invalid saved values', () => {
    expect(normalizeCustomThemeHexColor('eafbf3')).toBe('#EAFBF3');
    expect(normalizeCustomThemeHexColor('#08aace')).toBe('#08AACE');
    expect(normalizeCustomThemeHexColor('bad')).toBeNull();

    localStorage.setItem(
      CUSTOM_THEME_COLORS_STORAGE_KEY,
      JSON.stringify({
        sidebarBackground: '#111827',
        sidebarActive: 'not-a-color',
      }),
    );

    expect(readCustomThemeColors().sidebarBackground).toBe('#111827');
    expect(readCustomThemeColors().sidebarActive).toBe('#DBE7FB');
  });

  it('migrates the legacy selected number block fill color to the selected outline color', () => {
    localStorage.setItem(
      CUSTOM_THEME_COLORS_STORAGE_KEY,
      JSON.stringify({
        detailOutlineSelected: '#E7F8FD',
      }),
    );

    expect(readCustomThemeColors().detailOutlineSelected).toBe('#08AACE');
  });

  it('writes colors, applies them to css variables, and keeps only 20 recent colors', () => {
    writeCustomThemeColors({
      sidebarBackground: '#111827',
      sidebarActive: '#FED7AA',
      contentSelected: '#CCFBF1',
    });

    const saved = JSON.parse(localStorage.getItem(CUSTOM_THEME_COLORS_STORAGE_KEY) ?? '{}');
    expect(saved.sidebarBackground).toBe('#111827');
    expect(saved.sidebarActive).toBe('#FED7AA');
    expect(saved.contentSelected).toBe('#CCFBF1');

    applyCustomThemeColors(readCustomThemeColors());
    expect(document.documentElement.style.getPropertyValue('--xy-custom-sidebar-bg')).toBe('#111827');
    expect(document.documentElement.style.getPropertyValue('--xy-custom-sidebar-active-bg')).toBe('#FED7AA');
    expect(document.documentElement.style.getPropertyValue('--xy-custom-content-selected-bg')).toBe('#CCFBF1');
    expect(document.documentElement.style.getPropertyValue('--xy-wa-titlebar')).toBe('#E4E9EF');

    Array.from({ length: 22 }, (_, index) => `#0000${index.toString(16).padStart(2, '0')}`).forEach((color) => {
      rememberCustomThemeColor(color);
    });
    rememberCustomThemeColor('#000015');

    const recent = readCustomThemeRecentColors();
    expect(recent).toHaveLength(20);
    expect(recent[0]).toBe('#000015');
    expect(recent).not.toContain('#000000');
    expect(localStorage.getItem(CUSTOM_THEME_RECENT_COLORS_STORAGE_KEY)).toContain('#000015');
  });
});
