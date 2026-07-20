import { ArrowLeft, Check, Copy, Moon, Sun } from 'lucide-react';
import { useState, type HTMLAttributes } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CUSTOM_THEME_COLOR_SLOTS,
  DEFAULT_CUSTOM_THEME_COLORS,
  applyCustomThemeColors,
  normalizeCustomThemeHexColor,
  readCustomThemeColors,
  readCustomThemeRecentColors,
  rememberCustomThemeColor,
  writeCustomThemeColors,
  type CustomThemeColorMap,
  type CustomThemeColorSlot,
  type CustomThemeColorSlotKey,
} from '@/features/theme/model/customThemeColors';
import { renderDarkThemeColorPageView } from './DarkThemeColorPageView';
export type ThemeMode = 'light' | 'dark';
export type ThemeColorTab = 'palette' | 'custom' | 'detailOutline';
export type ColorItem = {
  id: number;
  name: string;
  value: string;
  usage: string;
};
export type ColorGroup = {
  title: string;
  desc: string;
  colors: ColorItem[];
};
export type ThemeSlot = {
  key: string;
  title: string;
  desc: string;
};
export type DarkThemeColorPageProps = {
  variant?: 'page' | 'modal' | 'embedded';
  onClose?: () => void;
  dragHandleProps?: HTMLAttributes<HTMLElement>;
};
export const THEME_PALETTE_TARGET_COLOR_COUNT = 86;
export const colorGroups: ColorGroup[] = [
  {
    title: '基础底色',
    desc: '页面背景、侧栏、卡片、弹窗、输入框都可以从这里取色。',
    colors: [
      { id: 1, name: '纯白', value: '#ffffff', usage: '白色主题背景' },
      { id: 2, name: '浅灰', value: '#f5f5f5', usage: '白色主题页面底' },
      { id: 3, name: '雾灰', value: '#e5e7eb', usage: '浅色分割' },
      { id: 4, name: '中灰', value: '#9ca3af', usage: '辅助信息' },
      { id: 5, name: '暗灰', value: '#4b5563', usage: '弱选中' },
      { id: 6, name: '墨灰', value: '#303030', usage: '深色面板' },
      { id: 7, name: '深黑', value: '#242424', usage: '深色主背景' },
      { id: 8, name: '标题黑', value: '#111827', usage: '浅色标题' },
    ],
  },
  {
    title: '主操作色',
    desc: '用于开始、保存、导出、选中状态等高频按钮。',
    colors: [
      { id: 9, name: '清亮蓝', value: '#3b82f6', usage: '主按钮' },
      { id: 10, name: '冰蓝', value: '#38bdf8', usage: '信息按钮' },
      { id: 11, name: '薄荷绿', value: '#34d399', usage: '成功状态' },
      { id: 12, name: '湖青', value: '#2dd4bf', usage: '确认和同步' },
      { id: 13, name: '暖琥珀', value: '#f59e0b', usage: '提示和待处理' },
      { id: 14, name: '柔红', value: '#f87171', usage: '删除和中止' },
    ],
  },
  {
    title: '黑色主题灰阶',
    desc: '参考写作软件的黑灰白层次，适合黑色主题。',
    colors: [
      { id: 15, name: '标题栏黑', value: '#1b1b1b', usage: '顶栏' },
      { id: 16, name: '页面黑', value: '#1e1e1e', usage: '全局背景' },
      { id: 17, name: '编辑区灰', value: '#242424', usage: '正文区域' },
      { id: 18, name: '面板灰', value: '#2d2d2d', usage: '侧栏和卡片' },
      { id: 19, name: '选中灰', value: '#3a3a3a', usage: '选中状态' },
      { id: 20, name: '高亮灰', value: '#4a4a4a', usage: '按钮和强调' },
      { id: 21, name: '边框灰', value: '#565656', usage: '深色边框' },
      { id: 22, name: '正文白', value: '#eeeeee', usage: '深色正文' },
    ],
  },
  {
    title: '标签与提示',
    desc: '标签、胶囊、状态提示、弱提醒可以使用这些颜色。',
    colors: [
      { id: 23, name: '蓝灰底', value: '#334155', usage: '深色标签底' },
      { id: 24, name: '灰蓝字', value: '#cbd5e1', usage: '深色标签字' },
      { id: 25, name: '白灰字', value: '#d4d4d4', usage: '正文层级' },
      { id: 26, name: '弱灰字', value: '#8f8f8f', usage: '说明文字' },
      { id: 27, name: '浅金', value: '#fde68a', usage: '轻提示' },
      { id: 28, name: '浅红', value: '#fecaca', usage: '警示文字' },
    ],
  },
];
export const extraColors: ColorItem[] = [
  { id: 29, name: '月蓝', value: '#08B3D9', usage: '软件品牌色' },
  { id: 30, name: '湖蓝', value: '#0ea5e9', usage: '清爽主色' },
  { id: 31, name: '靛蓝', value: '#6366f1', usage: '强调与选中' },
  { id: 32, name: '紫罗兰', value: '#8b5cf6', usage: '创意提示' },
  { id: 33, name: '玫红', value: '#ec4899', usage: '高亮标签' },
  { id: 34, name: '樱桃红', value: '#e11d48', usage: '强提醒' },
  { id: 35, name: '朱红', value: '#ef4444', usage: '危险操作' },
  { id: 36, name: '橙色', value: '#f97316', usage: '当前选择框' },
  { id: 37, name: '琥珀', value: '#f59e0b', usage: '提示状态' },
  { id: 38, name: '金黄', value: '#eab308', usage: '轻提示' },
  { id: 39, name: '柠檬', value: '#84cc16', usage: '活跃状态' },
  { id: 40, name: '嫩绿', value: '#22c55e', usage: '成功状态' },
  { id: 41, name: '翡翠', value: '#10b981', usage: '确认操作' },
  { id: 42, name: '青绿', value: '#14b8a6', usage: '资料与同步' },
  { id: 43, name: '孔雀青', value: '#06b6d4', usage: '信息按钮' },
  { id: 44, name: '浅蓝', value: '#bae6fd', usage: '浅色背景' },
  { id: 45, name: '浅青', value: '#ccfbf1', usage: '柔和底色' },
  { id: 46, name: '浅绿', value: '#dcfce7', usage: '成功底色' },
  { id: 47, name: '浅黄', value: '#fef3c7', usage: '提示底色' },
  { id: 48, name: '浅橙', value: '#fed7aa', usage: '警示底色' },
  { id: 49, name: '浅粉', value: '#fce7f3', usage: '柔和标签' },
  { id: 50, name: '浅紫', value: '#ede9fe', usage: '创意底色' },
  { id: 51, name: 'Slate 50', value: '#f8fafc', usage: 'soft surface' },
  { id: 52, name: 'Slate 100', value: '#f1f5f9', usage: 'panel surface' },
  { id: 53, name: 'Slate 200', value: '#e2e8f0', usage: 'soft border' },
  { id: 54, name: 'Slate 300', value: '#cbd5e1', usage: 'muted border' },
  { id: 55, name: 'Slate 500', value: '#64748b', usage: 'secondary text' },
  { id: 56, name: 'Slate 700', value: '#334155', usage: 'strong text' },
  { id: 57, name: 'Slate 800', value: '#1e293b', usage: 'deep text' },
  { id: 58, name: 'Slate 950', value: '#020617', usage: 'near black' },
  { id: 59, name: 'Red 50', value: '#fef2f2', usage: 'danger surface' },
  { id: 60, name: 'Red 200', value: '#fecaca', usage: 'danger border' },
  { id: 61, name: 'Red 500', value: '#ef4444', usage: 'danger action' },
  { id: 62, name: 'Red 700', value: '#b91c1c', usage: 'danger text' },
  { id: 63, name: 'Orange 50', value: '#fff7ed', usage: 'warm selected' },
  { id: 64, name: 'Orange 200', value: '#fed7aa', usage: 'warm border' },
  { id: 65, name: 'Orange 500', value: '#f97316', usage: 'warm action' },
  { id: 66, name: 'Orange 700', value: '#c2410c', usage: 'warm text' },
  { id: 67, name: 'Amber 50', value: '#fffbeb', usage: 'notice surface' },
  { id: 68, name: 'Amber 200', value: '#fde68a', usage: 'notice border' },
  { id: 69, name: 'Amber 500', value: '#f59e0b', usage: 'notice action' },
  { id: 70, name: 'Amber 700', value: '#b45309', usage: 'notice text' },
  { id: 71, name: 'Yellow 50', value: '#fefce8', usage: 'light note' },
  { id: 72, name: 'Yellow 300', value: '#fde047', usage: 'highlight' },
  { id: 73, name: 'Lime 50', value: '#f7fee7', usage: 'fresh surface' },
  { id: 74, name: 'Lime 300', value: '#bef264', usage: 'fresh accent' },
  { id: 75, name: 'Lime 600', value: '#65a30d', usage: 'fresh text' },
  { id: 76, name: 'Green 50', value: '#f0fdf4', usage: 'success surface' },
  { id: 77, name: 'Green 200', value: '#bbf7d0', usage: 'success border' },
  { id: 78, name: 'Green 600', value: '#16a34a', usage: 'success action' },
  { id: 79, name: 'Emerald 50', value: '#ecfdf5', usage: 'mint surface' },
  { id: 80, name: 'Emerald 200', value: '#a7f3d0', usage: 'mint border' },
  { id: 81, name: 'Emerald 500', value: '#10b981', usage: 'mint action' },
  { id: 82, name: 'Teal 50', value: '#f0fdfa', usage: 'teal surface' },
  { id: 83, name: 'Teal 200', value: '#99f6e4', usage: 'teal border' },
  { id: 84, name: 'Teal 600', value: '#0d9488', usage: 'teal text' },
  { id: 85, name: 'Cyan 50', value: '#ecfeff', usage: 'cyan surface' },
  { id: 86, name: 'Cyan 200', value: '#a5f3fc', usage: 'cyan border' },
  { id: 87, name: 'Cyan 500', value: '#06b6d4', usage: 'cyan action' },
  { id: 88, name: 'Sky 50', value: '#f0f9ff', usage: 'sky surface' },
  { id: 89, name: 'Sky 200', value: '#bae6fd', usage: 'sky border' },
  { id: 90, name: 'Sky 500', value: '#0ea5e9', usage: 'sky action' },
  { id: 91, name: 'Blue 50', value: '#eff6ff', usage: 'blue surface' },
  { id: 92, name: 'Blue 200', value: '#bfdbfe', usage: 'blue border' },
  { id: 93, name: 'Blue 600', value: '#2563eb', usage: 'blue action' },
  { id: 94, name: 'Indigo 50', value: '#eef2ff', usage: 'indigo surface' },
  { id: 95, name: 'Indigo 300', value: '#a5b4fc', usage: 'indigo border' },
  { id: 96, name: 'Indigo 600', value: '#4f46e5', usage: 'indigo action' },
  { id: 97, name: 'Violet 50', value: '#f5f3ff', usage: 'violet surface' },
  { id: 98, name: 'Violet 300', value: '#c4b5fd', usage: 'violet border' },
  { id: 99, name: 'Pink 50', value: '#fdf2f8', usage: 'pink surface' },
  { id: 100, name: 'Rose 400', value: '#fb7185', usage: 'rose accent' },
];
export const CUSTOM_COLOR_START_ID = 1000;
export const GLOBAL_CUSTOM_THEME_SLOT_KEYS: CustomThemeColorSlotKey[] = [
  'sidebarBackground',
  'sidebarActive',
  'contentSelected',
  'flowGroup',
  'editorBackground',
  'titlebar',
];
export const DETAIL_OUTLINE_NUMBER_SLOT_KEYS: CustomThemeColorSlotKey[] = [
  'detailOutlineSelected',
  'detailOutlineUsed',
  'detailOutlineHasOutline',
  'detailOutlineNoOutline',
];
export const SETTINGS_SOLID_BUTTON_CLASS =
  'flex h-8 min-w-[88px] items-center justify-center whitespace-nowrap rounded-md bg-[#08AACE] px-4 text-sm leading-none text-white transition-colors hover:bg-[#0798b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE4F2] disabled:cursor-not-allowed disabled:bg-slate-300';
export const globalCustomThemeSlots = CUSTOM_THEME_COLOR_SLOTS.filter((slot) =>
  GLOBAL_CUSTOM_THEME_SLOT_KEYS.includes(slot.key),
);
export const detailOutlineNumberSlots = CUSTOM_THEME_COLOR_SLOTS.filter((slot) =>
  DETAIL_OUTLINE_NUMBER_SLOT_KEYS.includes(slot.key),
);
export const slots: ThemeSlot[] = [
  { key: 'page', title: '页面背景', desc: '应用最底层的大面积背景。' },
  { key: 'panel', title: '侧栏/面板', desc: '左侧导航、工具栏、资料面板。' },
  { key: 'card', title: '卡片背景', desc: '模型卡片、剧情卡片、资料卡片。' },
  { key: 'border', title: '边框线', desc: '分割线、输入框边框、卡片边框。' },
  { key: 'primary', title: '主操作色', desc: '开始、保存、导出、选中状态。' },
  { key: 'secondary', title: '次操作色', desc: '取消、普通工具按钮、弱按钮。' },
  { key: 'title', title: '标题文字', desc: '页面标题、卡片标题。' },
  { key: 'body', title: '正文文字', desc: '正文、说明、长文本内容。' },
  { key: 'muted', title: '辅助文字', desc: '时间、字数、说明、占位信息。' },
  { key: 'tagBg', title: '标签背景', desc: '剧情标签、分类胶囊的底色。' },
  { key: 'tagText', title: '标签文字', desc: '剧情标签、分类胶囊的文字。' },
  { key: 'danger', title: '危险操作', desc: '删除、中止、失败提示。' },
];
export const defaultAssignments: Record<ThemeMode, Record<string, string>> = {
  light: {
    page: '#f5f5f5',
    panel: '#ffffff',
    card: '#ffffff',
    border: '#e5e7eb',
    primary: '#3b82f6',
    secondary: '#f5f5f5',
    title: '#111827',
    body: '#4b5563',
    muted: '#9ca3af',
    tagBg: '#e5e7eb',
    tagText: '#4b5563',
    danger: '#f87171',
  },
  dark: {
    page: '#1e1e1e',
    panel: '#2d2d2d',
    card: '#303030',
    border: '#565656',
    primary: '#4a4a4a',
    secondary: '#3a3a3a',
    title: '#eeeeee',
    body: '#d4d4d4',
    muted: '#8f8f8f',
    tagBg: '#3a3a3a',
    tagText: '#eeeeee',
    danger: '#f87171',
  },
};
export function uniqueThemePaletteColors(colors: ColorItem[]) {
  const seen = new Set<string>();
  return colors.filter((color) => {
    const normalized = color.value.toLowerCase();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}
export const themePaletteColors = uniqueThemePaletteColors([
  ...colorGroups.flatMap((group) => group.colors),
  ...extraColors,
]);
if (themePaletteColors.length !== THEME_PALETTE_TARGET_COLOR_COUNT) {
  throw new Error(
    `Theme palette should contain ${THEME_PALETTE_TARGET_COLOR_COUNT} colors, got ${themePaletteColors.length}.`,
  );
}
export function hexToRgb(hex: string) {
  const value = hex.replace('#', '');
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}
export function getThemePaletteSortKey(color: ColorItem) {
  const { r, g, b } = hexToRgb(color.value);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2 / 255;
  const saturation = delta === 0 ? 0 : delta / (255 - Math.abs(max + min - 255));

  if (saturation < 0.12 || delta < 20) {
    return [0, lightness, color.id];
  }

  let hue = 0;
  if (max === r) hue = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
  else if (max === g) hue = ((b - r) / delta + 2) * 60;
  else hue = ((r - g) / delta + 4) * 60;

  const colorBand =
    hue >= 345 || hue < 15
      ? 1
      : hue < 45
        ? 2
        : hue < 75
          ? 3
          : hue < 165
            ? 4
            : hue < 205
              ? 5
              : hue < 255
                ? 6
                : hue < 315
                  ? 7
                  : 8;

  return [colorBand, hue, lightness, color.id];
}
export const sortedThemePaletteColors = [...themePaletteColors].sort((first, second) => {
  const firstKey = getThemePaletteSortKey(first);
  const secondKey = getThemePaletteSortKey(second);
  const maxLength = Math.max(firstKey.length, secondKey.length);
  for (let index = 0; index < maxLength; index += 1) {
    const diff = (firstKey[index] ?? 0) - (secondKey[index] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
});
export function getContrastText(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58 ? '#111827' : '#f8fafc';
}
export function getSlotStyle(assignments: Record<string, string>) {
  return {
    page: assignments.page,
    panel: assignments.panel,
    card: assignments.card,
    border: assignments.border,
    primary: assignments.primary,
    secondary: assignments.secondary,
    title: assignments.title,
    body: assignments.body,
    muted: assignments.muted,
    tagBg: assignments.tagBg,
    tagText: assignments.tagText,
    danger: assignments.danger,
  };
}
export function loadThemeMode(): ThemeMode {
  try {
    return localStorage.getItem('xinyuexia_dark_theme') === '1' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}
export function getPagePalette(mode: ThemeMode) {
  if (mode === 'dark') {
    return {
      page: '#171717',
      panel: '#202020',
      header: '#242424',
      card: '#262626',
      border: '#3d3d3d',
      strongBorder: '#d8d8d8',
      title: '#f8fafc',
      body: '#cbd5e1',
      muted: '#94a3b8',
      button: '#303030',
    };
  }
  return {
    page: '#f5f7fb',
    panel: '#ffffff',
    header: '#ffffff',
    card: '#ffffff',
    border: '#e2e8f0',
    strongBorder: '#22c7e5',
    title: '#0f172a',
    body: '#475569',
    muted: '#94a3b8',
    button: '#f8fafc',
  };
}
export function normalizePaletteHexColor(input: string) {
  return normalizeCustomThemeHexColor(input) ?? '';
}
export function isCustomThemeChanged(colors: CustomThemeColorMap) {
  return CUSTOM_THEME_COLOR_SLOTS.some((slot) => colors[slot.key] !== readCustomThemeColors()[slot.key]);
}
export function readInitialCustomColors() {
  return readCustomThemeColors();
}
