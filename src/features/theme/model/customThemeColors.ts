export type CustomThemeColorSlotKey =
  | 'sidebarBackground'
  | 'sidebarActive'
  | 'contentSelected'
  | 'flowGroup'
  | 'editorBackground'
  | 'titlebar'
  | 'detailOutlineSelected'
  | 'detailOutlineUsed'
  | 'detailOutlineHasOutline'
  | 'detailOutlineNoOutline';

export type CustomThemeColorSlot = {
  key: CustomThemeColorSlotKey;
  label: string;
  description: string;
  defaultColor: string;
  cssVar: string;
};

export type CustomThemeColorMap = Record<CustomThemeColorSlotKey, string>;

export const CUSTOM_THEME_COLORS_STORAGE_KEY = 'xinyuexia_custom_theme_colors_v1';
export const CUSTOM_THEME_RECENT_COLORS_STORAGE_KEY = 'xinyuexia_custom_theme_recent_colors_v1';
const LEGACY_DETAIL_OUTLINE_SELECTED_FILL_COLOR = '#E7F8FD';
const LEGACY_DETAIL_OUTLINE_USED_FILL_COLOR = '#FFF7ED';
const LEGACY_EDITOR_BACKGROUND_COLORS = new Set(['#F5F5F7', '#F8FAFC']);

export const CUSTOM_THEME_COLOR_SLOTS: CustomThemeColorSlot[] = [
  {
    key: 'sidebarBackground',
    label: '主页左侧导航栏背景色',
    description: '主页左侧个人信息、导航列表和底部按钮区域的底色。',
    defaultColor: '#F5F5F7',
    cssVar: '--xy-custom-sidebar-bg',
  },
  {
    key: 'sidebarActive',
    label: '主页左侧导航栏选中颜色',
    description: '主页左侧导航当前页面的选中底色。',
    defaultColor: '#DBE7FB',
    cssVar: '--xy-custom-sidebar-active-bg',
  },
  {
    key: 'contentSelected',
    label: '脑洞/设定/正文选中颜色',
    description: '脑洞、设定、正文列表里当前条目的选中底色。',
    defaultColor: '#EAFBF3',
    cssVar: '--xy-custom-content-selected-bg',
  },
  {
    key: 'flowGroup',
    label: '工作流分组颜色',
    description: '脑洞、设定、章纲、正文、审核、点评、润色、状态、梗概等流程按钮的分组底色。',
    defaultColor: '#E7F8FD',
    cssVar: '--xy-custom-flow-group-bg',
  },
  {
    key: 'editorBackground',
    label: '正文内容输入区域背景',
    description: '正文编辑器中间输入区域的纸面底色。',
    defaultColor: '#FFFFFF',
    cssVar: '--xy-wa-editor-bg',
  },
  {
    key: 'titlebar',
    label: '软件顶部标题栏颜色',
    description: '软件最上面的标题栏和标签栏底色。',
    defaultColor: '#E4E9EF',
    cssVar: '--xy-wa-titlebar',
  },
  {
    key: 'detailOutlineSelected',
    label: '章纲数字块：选中',
    description: '当前正在查看或编辑的章纲章节数字块外圈高亮颜色。',
    defaultColor: '#08AACE',
    cssVar: '--xy-detail-outline-number-selected',
  },
  {
    key: 'detailOutlineUsed',
    label: '章纲数字块：已用',
    description: '正文已经写过内容的章节数字块。',
    defaultColor: '#EAF9FD',
    cssVar: '--xy-detail-outline-number-used',
  },
  {
    key: 'detailOutlineHasOutline',
    label: '章纲数字块：有章纲',
    description: '已经填写章纲但正文未写的章节数字块。',
    defaultColor: '#E7F8FD',
    cssVar: '--xy-detail-outline-number-has-outline',
  },
  {
    key: 'detailOutlineNoOutline',
    label: '章纲数字块：无章纲',
    description: '还没有填写章纲的章节数字块。',
    defaultColor: '#FFFFFF',
    cssVar: '--xy-detail-outline-number-no-outline',
  },
];

export const DEFAULT_CUSTOM_THEME_COLORS = CUSTOM_THEME_COLOR_SLOTS.reduce((result, slot) => {
  result[slot.key] = slot.defaultColor;
  return result;
}, {} as CustomThemeColorMap);

export function normalizeCustomThemeHexColor(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const value = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value.toUpperCase() : null;
}

function canUseLocalStorage() {
  return typeof localStorage !== 'undefined';
}

export function readCustomThemeColors(): CustomThemeColorMap {
  if (!canUseLocalStorage()) return { ...DEFAULT_CUSTOM_THEME_COLORS };

  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOM_THEME_COLORS_STORAGE_KEY) ?? '{}') as Partial<
      Record<CustomThemeColorSlotKey, string>
    >;
    return CUSTOM_THEME_COLOR_SLOTS.reduce((result, slot) => {
      const normalized = normalizeCustomThemeHexColor(parsed[slot.key] ?? '');
      if (slot.key === 'detailOutlineSelected' && normalized === LEGACY_DETAIL_OUTLINE_SELECTED_FILL_COLOR) {
        result[slot.key] = slot.defaultColor;
        return result;
      }
      if (slot.key === 'detailOutlineUsed' && normalized === LEGACY_DETAIL_OUTLINE_USED_FILL_COLOR) {
        result[slot.key] = slot.defaultColor;
        return result;
      }
      if (slot.key === 'editorBackground' && normalized && LEGACY_EDITOR_BACKGROUND_COLORS.has(normalized)) {
        result[slot.key] = slot.defaultColor;
        return result;
      }
      result[slot.key] = normalized ?? slot.defaultColor;
      return result;
    }, {} as CustomThemeColorMap);
  } catch {
    return { ...DEFAULT_CUSTOM_THEME_COLORS };
  }
}

export function writeCustomThemeColors(colors: Partial<CustomThemeColorMap>) {
  if (!canUseLocalStorage()) return readCustomThemeColors();

  const next = {
    ...readCustomThemeColors(),
    ...Object.fromEntries(
      Object.entries(colors)
        .map(([key, value]) => [key, normalizeCustomThemeHexColor(value ?? '')])
        .filter((entry): entry is [CustomThemeColorSlotKey, string] => Boolean(entry[1])),
    ),
  } as CustomThemeColorMap;
  localStorage.setItem(CUSTOM_THEME_COLORS_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function readCustomThemeRecentColors() {
  if (!canUseLocalStorage()) return [];

  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOM_THEME_RECENT_COLORS_STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((value) => normalizeCustomThemeHexColor(String(value)))
      .filter((value): value is string => Boolean(value))
      .filter((value, index, list) => list.indexOf(value) === index)
      .slice(0, 20);
  } catch {
    return [];
  }
}

export function rememberCustomThemeColor(color: string) {
  if (!canUseLocalStorage()) return [];

  const normalized = normalizeCustomThemeHexColor(color);
  if (!normalized) return readCustomThemeRecentColors();

  const next = [normalized, ...readCustomThemeRecentColors().filter((item) => item !== normalized)].slice(0, 20);
  localStorage.setItem(CUSTOM_THEME_RECENT_COLORS_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function applyCustomThemeColors(colors: CustomThemeColorMap = readCustomThemeColors()) {
  if (typeof document === 'undefined') return;

  CUSTOM_THEME_COLOR_SLOTS.forEach((slot) => {
    document.documentElement.style.setProperty(slot.cssVar, colors[slot.key]);
  });
}
