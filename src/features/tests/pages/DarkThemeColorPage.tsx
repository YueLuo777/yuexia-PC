import { ArrowLeft, Check, Copy, Moon, RotateCcw, Sun } from 'lucide-react';
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

type ThemeMode = 'light' | 'dark';
type ThemeColorTab = 'palette' | 'custom' | 'detailOutline';

type ColorItem = {
  id: number;
  name: string;
  value: string;
  usage: string;
};

type ColorGroup = {
  title: string;
  desc: string;
  colors: ColorItem[];
};

type ThemeSlot = {
  key: string;
  title: string;
  desc: string;
};

type DarkThemeColorPageProps = {
  variant?: 'page' | 'modal';
  onClose?: () => void;
  dragHandleProps?: HTMLAttributes<HTMLElement>;
};

const THEME_PALETTE_TARGET_COLOR_COUNT = 100;

const colorGroups: ColorGroup[] = [
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

const extraColors: ColorItem[] = [
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

const CUSTOM_COLOR_START_ID = 1000;

const GLOBAL_CUSTOM_THEME_SLOT_KEYS: CustomThemeColorSlotKey[] = [
  'sidebarBackground',
  'sidebarActive',
  'contentSelected',
  'flowGroup',
  'editorBackground',
  'titlebar',
];

const DETAIL_OUTLINE_NUMBER_SLOT_KEYS: CustomThemeColorSlotKey[] = [
  'detailOutlineSelected',
  'detailOutlineUsed',
  'detailOutlineHasOutline',
  'detailOutlineNoOutline',
];

const globalCustomThemeSlots = CUSTOM_THEME_COLOR_SLOTS.filter((slot) => GLOBAL_CUSTOM_THEME_SLOT_KEYS.includes(slot.key));
const detailOutlineNumberSlots = CUSTOM_THEME_COLOR_SLOTS.filter((slot) => DETAIL_OUTLINE_NUMBER_SLOT_KEYS.includes(slot.key));

const slots: ThemeSlot[] = [
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

const defaultAssignments: Record<ThemeMode, Record<string, string>> = {
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

const themePaletteColors = [...colorGroups.flatMap((group) => group.colors), ...extraColors];
if (themePaletteColors.length !== THEME_PALETTE_TARGET_COLOR_COUNT) {
  throw new Error(`Theme palette should contain ${THEME_PALETTE_TARGET_COLOR_COUNT} colors, got ${themePaletteColors.length}.`);
}

function hexToRgb(hex: string) {
  const value = hex.replace('#', '');
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function getThemePaletteSortKey(color: ColorItem) {
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

  const colorBand = hue >= 345 || hue < 15
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

const sortedThemePaletteColors = [...themePaletteColors].sort((first, second) => {
  const firstKey = getThemePaletteSortKey(first);
  const secondKey = getThemePaletteSortKey(second);
  const maxLength = Math.max(firstKey.length, secondKey.length);
  for (let index = 0; index < maxLength; index += 1) {
    const diff = (firstKey[index] ?? 0) - (secondKey[index] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
});

function getContrastText(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58 ? '#111827' : '#f8fafc';
}

function getSlotStyle(assignments: Record<string, string>) {
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

function loadThemeMode(): ThemeMode {
  try {
    return localStorage.getItem('xinyuexia_dark_theme') === '1' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function getPagePalette(mode: ThemeMode) {
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

function normalizePaletteHexColor(input: string) {
  return normalizeCustomThemeHexColor(input) ?? '';
}

function isCustomThemeChanged(colors: CustomThemeColorMap) {
  return CUSTOM_THEME_COLOR_SLOTS.some((slot) => colors[slot.key] !== readCustomThemeColors()[slot.key]);
}

function readInitialCustomColors() {
  return readCustomThemeColors();
}

export function DarkThemeColorPage({ variant = 'page', onClose, dragHandleProps }: DarkThemeColorPageProps = {}) {
  const navigate = useNavigate();
  const [activeThemeTab, setActiveThemeTab] = useState<ThemeColorTab>('custom');
  const [mode, setMode] = useState<ThemeMode>(loadThemeMode);
  const [pendingSlotKey, setPendingSlotKey] = useState<string | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [assignments, setAssignments] = useState(defaultAssignments);
  const [customColorValue, setCustomColorValue] = useState('');
  const [customColors, setCustomColors] = useState<ColorItem[]>([]);
  const [copied, setCopied] = useState('');
  const [savedColors, setSavedColors] = useState(readInitialCustomColors);
  const [draftColors, setDraftColors] = useState(readInitialCustomColors);
  const [selectedTargetKey, setSelectedTargetKey] = useState<CustomThemeColorSlotKey>('sidebarBackground');
  const [manualColorValue, setManualColorValue] = useState(draftColors.sidebarBackground);
  const [recentColors, setRecentColors] = useState(readCustomThemeRecentColors);
  const [saveStatus, setSaveStatus] = useState('');

  const paletteColorOptions = [...sortedThemePaletteColors, ...customColors];
  const flatColors = paletteColorOptions;
  const current = assignments[mode];
  const preview = getSlotStyle(current);
  const page = getPagePalette(mode);
  const previewColors: CustomThemeColorMap = draftColors;
  const activeCustomThemeSlots = activeThemeTab === 'detailOutline' ? detailOutlineNumberSlots : globalCustomThemeSlots;
  const selectedTarget = activeCustomThemeSlots.find((slot) => slot.key === selectedTargetKey) ?? activeCustomThemeSlots[0];
  const hasCustomThemeChanges = isCustomThemeChanged(draftColors);
  const customWorkflowGridClass = variant === 'modal'
    ? 'flex min-h-0 flex-col gap-5'
    : 'flex flex-col gap-5';
  const customStickyOverviewClass = variant === 'modal'
    ? 'grid min-h-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(260px,390px)_minmax(360px,1fr)]'
    : 'grid grid-cols-1 gap-5 xl:grid-cols-[390px_minmax(360px,1fr)]';
  const customTargetPanelClass = variant === 'modal'
    ? 'rounded-xl border bg-white p-3 xl:p-4'
    : 'rounded-xl border bg-white p-4';
  const customTargetListClass = variant === 'modal'
    ? 'editor-scrollbar max-h-[210px] space-y-2 overflow-y-auto pr-1 xl:max-h-[260px]'
    : 'editor-scrollbar max-h-[220px] space-y-2 overflow-y-auto pr-1';
  const customColorPickerPanelClass = variant === 'modal'
    ? 'flex min-h-[260px] flex-1 flex-col rounded-xl border bg-white p-4'
    : 'flex min-h-[320px] flex-col rounded-xl border bg-white p-4';
  const customPickerBodyClass = variant === 'modal'
    ? 'grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_150px_164px]'
    : 'grid min-h-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_160px_180px]';
  const customScrollablePaletteClass = variant === 'modal'
    ? 'editor-scrollbar grid max-h-[360px] min-h-[220px] grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-9'
    : 'editor-scrollbar grid max-h-[460px] min-h-[240px] grid-cols-5 gap-2 overflow-y-auto pr-1 md:grid-cols-7 xl:grid-cols-9 2xl:grid-cols-11';
  const customRecentColumnClass = 'min-h-0 rounded-lg border border-slate-100 bg-slate-50/60 p-3';
  const customActionColumnClass = 'min-h-0 rounded-lg border border-slate-100 bg-slate-50/60 p-3';
  const customPreviewPanelClass = variant === 'modal'
    ? 'rounded-xl border bg-white p-3 xl:p-4'
    : 'rounded-xl border bg-white p-4';
  const customPreviewEditorClass = variant === 'modal' ? 'rounded-lg p-3' : 'rounded-lg p-4';
  const customPreviewLineStackClass = variant === 'modal' ? 'space-y-2' : 'space-y-3';
  const customPreviewLineCount = variant === 'modal' ? 2 : 2;

  const handleBack = () => {
    if (variant === 'modal') {
      onClose?.();
      return;
    }
    navigate('/test-collection');
  };

  const selectThemeTab = (tab: ThemeColorTab) => {
    setActiveThemeTab(tab);
    if (tab === 'palette') return;
    const nextSlots = tab === 'detailOutline' ? detailOutlineNumberSlots : globalCustomThemeSlots;
    const nextTarget = nextSlots.find((slot) => slot.key === selectedTargetKey) ?? nextSlots[0];
    setSelectedTargetKey(nextTarget.key);
    setManualColorValue(draftColors[nextTarget.key]);
    setSaveStatus('');
  };

  const handlePaletteColorClick = (color: ColorItem) => {
    if (!pendingSlotKey) {
      setSelectedColorId(color.id);
      return;
    }
    setAssignments((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [pendingSlotKey]: color.value,
      },
    }));
    setPendingSlotKey(null);
    setSelectedColorId(null);
  };

  const addCustomColor = () => {
    const normalized = normalizePaletteHexColor(customColorValue);
    if (!normalized) return;
    setCustomColors((prev) => {
      if (flatColors.some((color) => color.value.toLowerCase() === normalized.toLowerCase())) return prev;
      return [
        ...prev,
        {
          id: CUSTOM_COLOR_START_ID + prev.length,
          name: '自定义',
          value: normalized,
          usage: '用户添加',
        },
      ];
    });
    setCustomColorValue('');
  };

  const copyColor = async (value: string) => {
    await navigator.clipboard?.writeText(value);
    setCopied(value);
    window.setTimeout(() => setCopied(''), 1200);
  };

  const selectCustomTarget = (key: CustomThemeColorSlotKey) => {
    setSelectedTargetKey(key);
    setManualColorValue(draftColors[key]);
    setSaveStatus('');
  };

  const applyDraftColor = (color: string) => {
    const normalized = normalizeCustomThemeHexColor(color);
    if (!normalized) return;
    setDraftColors((prev) => ({ ...prev, [selectedTargetKey]: normalized }));
    setManualColorValue(normalized);
    setSaveStatus('');
  };

  const resetSelectedTarget = () => {
    applyDraftColor(selectedTarget.defaultColor);
  };

  const resetAllTargets = () => {
    setDraftColors({ ...DEFAULT_CUSTOM_THEME_COLORS });
    setManualColorValue(DEFAULT_CUSTOM_THEME_COLORS[selectedTargetKey]);
    setSaveStatus('');
  };

  const confirmCustomColors = () => {
    const previous = savedColors;
    const next = writeCustomThemeColors(draftColors);
    applyCustomThemeColors(next);
    CUSTOM_THEME_COLOR_SLOTS.forEach((slot) => {
      if (previous[slot.key] !== next[slot.key]) rememberCustomThemeColor(next[slot.key]);
    });
    setSavedColors(next);
    setDraftColors(next);
    setRecentColors(readCustomThemeRecentColors());
    setSaveStatus('已保存并应用到全局界面');
  };

  const renderPaletteTab = () => (
    <section className="space-y-5">
      <section className="rounded-xl border p-5" style={{ backgroundColor: page.panel, borderColor: page.border }}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold" style={{ color: page.title }}>填色位置</h2>
            <p className="mt-1 text-sm" style={{ color: page.muted }}>
              {pendingSlotKey ? '已选择位置，请点击下方颜色完成填色。' : '先选择一个位置，位置会出现橙色边框。'}
            </p>
          </div>
          <button
            onClick={() => setAssignments((prev) => ({ ...prev, [mode]: defaultAssignments[mode] }))}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs"
            style={{ borderColor: page.border, color: page.body }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            恢复当前主题
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
          {slots.map((slot) => {
            const color = current[slot.key];
            const active = pendingSlotKey === slot.key;
            return (
              <button
                key={slot.key}
                onClick={() => {
                  setPendingSlotKey(slot.key);
                  setSelectedColorId(null);
                }}
                className="min-h-[86px] rounded-xl border p-3 text-left transition-colors"
                style={{
                  backgroundColor: page.card,
                  borderColor: active ? '#f97316' : page.border,
                  boxShadow: active ? '0 0 0 2px rgba(249, 115, 22, 0.22)' : 'none',
                }}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-bold" style={{ color: page.title }}>{slot.title}</span>
                  <span className="h-5 w-5 shrink-0 rounded border border-white/10" style={{ backgroundColor: color }} />
                </div>
                <div className="font-mono text-xs" style={{ color: page.body }}>{color}</div>
                <div className="mt-1 line-clamp-2 text-[11px]" style={{ color: page.muted }}>{slot.desc}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border p-5" style={{ backgroundColor: page.panel, borderColor: page.border }}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold" style={{ color: page.title }}>颜色</h2>
            <p className="mt-1 text-sm" style={{ color: page.muted }}>共 {flatColors.length} 种颜色，点击颜色后会填入当前橙框位置。</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={customColorValue}
              onChange={(event) => setCustomColorValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addCustomColor();
              }}
              placeholder="#08B3D9"
              className="h-9 w-28 rounded-lg border px-3 font-mono text-sm outline-none"
              style={{ backgroundColor: page.card, borderColor: page.border, color: page.title }}
            />
            <button
              onClick={addCustomColor}
              className="h-9 rounded-lg px-3 text-sm font-bold text-white"
              style={{ backgroundColor: preview.primary }}
            >
              添加颜色
            </button>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2 md:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12">
          {flatColors.map((color) => {
            const active = selectedColorId === color.id;
            return (
              <button
                key={color.id}
                onClick={() => handlePaletteColorClick(color)}
                className="min-h-[92px] rounded-xl border p-2 text-left transition-all"
                style={{
                  backgroundColor: page.card,
                  borderColor: active ? page.strongBorder : page.border,
                  boxShadow: active ? '0 0 0 1px rgba(34,199,229,0.3)' : 'none',
                }}
                title={`${color.name} ${color.value}`}
              >
                <div
                  className="mb-2 flex h-10 items-center justify-between rounded-lg px-2 text-xs font-bold"
                  style={{ backgroundColor: color.value, color: getContrastText(color.value) }}
                >
                  <span>{color.id}</span>
                  {active && <Check className="h-3.5 w-3.5" />}
                </div>
                <div className="truncate text-xs font-bold" style={{ color: page.title }}>{color.name}</div>
                <div className="mt-1 truncate font-mono text-[11px]" style={{ color: page.body }}>{color.value}</div>
              </button>
            );
          })}
        </div>
      </section>
    </section>
  );

  const renderCustomThemeEditor = (slotsToRender: CustomThemeColorSlot[]) => (
    <section className={customWorkflowGridClass}>
      <section className={customStickyOverviewClass}>
        <section className={customTargetPanelClass} style={{ borderColor: page.border }}>
          <div className="mb-3">
            <h2 className="text-base font-black text-slate-950">选择位置</h2>
          </div>
          <div className={customTargetListClass}>
            {slotsToRender.map((slot) => {
              const active = selectedTargetKey === slot.key;
              const changed = draftColors[slot.key] !== savedColors[slot.key];
              return (
                <button
                  key={slot.key}
                  onClick={() => selectCustomTarget(slot.key)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition-colors"
                  style={{
                    borderColor: active ? '#08AACE' : '#dbe4ef',
                    backgroundColor: active ? '#f0fbff' : '#ffffff',
                    boxShadow: active ? '0 0 0 1px rgba(8,170,206,0.18)' : 'none',
                  }}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-slate-950">{slot.label}</span>
                    <span className="mt-0.5 line-clamp-2 block text-xs font-medium text-slate-500">{slot.description}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="h-6 w-6 rounded-md border border-slate-200" style={{ backgroundColor: draftColors[slot.key] }} />
                    <span className="font-mono text-[11px] font-black text-slate-500">{draftColors[slot.key]}</span>
                    {changed ? <span className="rounded-full bg-[#E7F8FD] px-2 py-0.5 text-[11px] font-black text-[#08AACE]">预览中</span> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className={customPreviewPanelClass} style={{ borderColor: page.border }}>
        <div className="mb-3 flex items-center justify-between">
           <div>
             <h2 className="text-base font-black text-slate-950">预览</h2>
           </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-black text-slate-500">{selectedTarget.cssVar}</span>
        </div>

        {activeThemeTab === 'detailOutline' ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 rounded-lg border border-[#BDEEF7] bg-[#E7F8FD] px-3 py-2 text-sm font-black text-slate-950">第一卷</div>
            <div className="flex flex-wrap gap-2">
              {([
                ['选中', 'detailOutlineSelected'],
                ['已用', 'detailOutlineUsed'],
                ['有章纲', 'detailOutlineHasOutline'],
                ['无章纲', 'detailOutlineNoOutline'],
              ] as const).map(([label, key], index) => (
                <div key={key} className="space-y-1">
                  <div
                    className="grid h-9 w-9 place-items-center rounded-lg border text-sm font-black text-slate-950"
                    style={{
                      backgroundColor: previewColors[key],
                      borderColor: key === 'detailOutlineNoOutline' ? '#e2e8f0' : '#08AACE',
                      boxShadow: key === 'detailOutlineSelected' ? '0 0 0 2px #ffffff, 0 0 0 4px rgba(8,170,206,0.72)' : '0 1px 4px rgba(15,23,42,0.10)',
                    }}
                  >
                    {index + 1}
                  </div>
                  <div className="text-center text-[11px] font-black text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="h-8 border-b border-slate-200 px-3 py-1.5 text-xs font-black text-slate-600" style={{ backgroundColor: previewColors.titlebar }}>
              软件标题栏颜色
            </div>
            <div className="grid grid-cols-[140px_1fr]">
              <div className="space-y-2 border-r border-slate-200 p-3" style={{ backgroundColor: previewColors.sidebarBackground }}>
                <div className="text-sm font-black text-slate-950">我的小说</div>
                <div className="rounded-md px-3 py-2 text-sm font-black text-slate-950" style={{ backgroundColor: previewColors.sidebarActive }}>作品信息</div>
                <div className="rounded-md px-3 py-2 text-sm font-bold text-slate-500">测试集合</div>
              </div>
              <div className="space-y-3 p-3">
                <div className="grid grid-cols-3 gap-2">
                  {['脑洞', '设定', '正文'].map((label, index) => (
                    <div
                      key={label}
                      className="rounded-md border px-3 py-2 text-center text-sm font-black"
                      style={{ backgroundColor: index === 2 ? previewColors.contentSelected : '#ffffff', borderColor: '#dbe4ef' }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  {['脑洞', '设定', '章纲', '正文'].map((label) => (
                    <div
                      key={label}
                      className="min-w-[68px] rounded-md border px-2 py-1.5 text-center text-sm font-black text-slate-950"
                      style={{ backgroundColor: label === '正文' ? previewColors.flowGroup : '#ffffff', borderColor: label === '正文' ? '#8FE4F2' : '#dbe4ef' }}
                    >
                      <div>{label}</div>
                      <div className="text-xs text-[#08AACE]">2章</div>
                    </div>
                  ))}
                </div>
                <div className={customPreviewEditorClass} style={{ backgroundColor: previewColors.editorBackground }}>
                  <div className={customPreviewLineStackClass}>
                    {Array.from({ length: customPreviewLineCount }, (_, index) => (
                      <div key={index} className="border-b border-dashed border-slate-300" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </section>
      </section>

      <section className={customColorPickerPanelClass} style={{ borderColor: page.border }}>
        <div className={customPickerBodyClass}>
          <div className={customScrollablePaletteClass}>
            {paletteColorOptions.map((color) => (
              <button
                key={`${color.id}-${color.value}`}
                onClick={() => applyDraftColor(color.value)}
                className="rounded-lg border border-slate-200 bg-white p-2 text-left transition-colors hover:border-[#08AACE]"
                title={`${color.name} ${color.value}`}
              >
                <span
                  className="block h-10 rounded-md border border-white/70"
                  style={{ backgroundColor: color.value }}
                />
                <span className="mt-1 block truncate text-[11px] font-black text-slate-700">{color.name}</span>
                <span className="block truncate font-mono text-[10px] font-bold text-slate-400">{color.value.toUpperCase()}</span>
              </button>
            ))}
          </div>

          <aside className={customRecentColumnClass}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-black text-slate-800">常用颜色</h3>
              <span className="text-xs font-black text-slate-400">{recentColors.length}/20</span>
            </div>
            {recentColors.length ? (
              <div className="editor-scrollbar grid max-h-[320px] grid-cols-4 gap-2 overflow-y-auto pr-1 xl:grid-cols-3">
                {recentColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => applyDraftColor(color)}
                    className="h-8 rounded-md border border-slate-200"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-sm font-bold leading-5 text-slate-400">暂无常用色</div>
            )}
          </aside>

          <aside className={customActionColumnClass}>
            <div className="space-y-2">
              <input
                type="color"
                value={manualColorValue}
                onChange={(event) => {
                  setManualColorValue(event.target.value.toUpperCase());
                  applyDraftColor(event.target.value);
                }}
                className="h-9 w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
              />
              <input
                value={manualColorValue}
                onChange={(event) => setManualColorValue(event.target.value.toUpperCase())}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') applyDraftColor(manualColorValue);
                }}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 font-mono text-sm font-bold text-slate-700"
              />
              <button
                onClick={() => applyDraftColor(manualColorValue)}
                className="h-9 w-full rounded-lg bg-[#08AACE] px-3 text-sm font-black text-white"
              >
                使用此颜色
              </button>
              <button
                onClick={resetSelectedTarget}
                className="min-h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black leading-5 text-slate-600"
              >
                恢复当前项默认
              </button>
              <button
                onClick={resetAllTargets}
                className="min-h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black leading-5 text-slate-600"
              >
                全部恢复默认
              </button>
              <button
                onClick={confirmCustomColors}
                disabled={!hasCustomThemeChanges}
                className="h-9 w-full rounded-lg bg-[#08AACE] px-3 text-sm font-black text-white disabled:bg-slate-300"
              >
                确认替换
              </button>
            </div>
            {saveStatus ? <div className="mt-2 text-sm font-black leading-5 text-[#08AACE]">{saveStatus}</div> : null}
          </aside>
        </div>
      </section>
    </section>
  );

  return (
    <div className="h-full min-h-0 overflow-y-auto" style={{ backgroundColor: page.page, color: page.title }}>
      <div className={variant === 'modal' ? 'min-h-0 space-y-3 px-4 py-4' : 'space-y-4 px-5 py-4'}>
        <header
          {...dragHandleProps}
          className="grid min-h-[52px] grid-cols-[minmax(160px,1fr)_auto_minmax(160px,1fr)] items-center gap-3 rounded-xl border px-4 py-2.5"
          style={{ ...dragHandleProps?.style, backgroundColor: page.header, borderColor: page.border }}
        >
          <div className="flex items-center gap-3 justify-self-start">
            <button
              onClick={handleBack}
              className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
              style={{ backgroundColor: page.button, borderColor: page.border, color: page.body }}
              title="返回测试"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-black" style={{ color: page.title }}>主题颜色</h1>
            </div>
          </div>

          <div className="inline-flex rounded-lg border bg-white p-0.5" style={{ borderColor: page.border }}>
            {([
              { key: 'custom' as const, label: '自定义颜色' },
              { key: 'detailOutline' as const, label: '章纲数字块' },
              { key: 'palette' as const, label: '主题色板' },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => selectThemeTab(tab.key)}
                className="h-8 rounded-md px-4 text-sm font-black transition-colors"
                style={{
                  backgroundColor: activeThemeTab === tab.key ? '#E7F8FD' : 'transparent',
                  color: activeThemeTab === tab.key ? '#08AACE' : '#64748b',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex justify-self-end rounded-lg border p-0.5" style={{ backgroundColor: page.button, borderColor: page.border }}>
            {([
              { key: 'light' as const, label: '白色', icon: Sun },
              { key: 'dark' as const, label: '黑色', icon: Moon },
            ]).map((item) => {
              const Icon = item.icon;
              const active = mode === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setMode(item.key)}
                  className="flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-black transition-colors"
                  style={{
                    backgroundColor: active ? (mode === 'dark' ? '#e8e8e8' : '#0f172a') : 'transparent',
                    color: active ? (mode === 'dark' ? '#171717' : '#ffffff') : page.body,
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>

        {activeThemeTab === 'palette'
          ? renderPaletteTab()
          : activeThemeTab === 'detailOutline' ? renderCustomThemeEditor(detailOutlineNumberSlots) : renderCustomThemeEditor(globalCustomThemeSlots)}
      </div>
    </div>
  );
}
