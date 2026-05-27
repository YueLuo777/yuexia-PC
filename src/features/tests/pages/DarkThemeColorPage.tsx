import { ArrowLeft, Check, Copy, Moon, Palette, RotateCcw, Sun } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type ThemeMode = 'light' | 'dark';

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
];

const CUSTOM_COLOR_START_ID = 1000;

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

function getContrastText(hex: string) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
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
      buttonHover: '#3a3a3a',
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
    buttonHover: '#eef6ff',
  };
}

function normalizeHexColor(input: string) {
  const trimmed = input.trim();
  const value = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value.toUpperCase() : '';
}

type DarkThemeColorPageProps = {
  variant?: 'page' | 'modal';
  onClose?: () => void;
};

export function DarkThemeColorPage({ variant = 'page', onClose }: DarkThemeColorPageProps = {}) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ThemeMode>(loadThemeMode);
  const [pendingSlotKey, setPendingSlotKey] = useState<string | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [assignments, setAssignments] = useState(defaultAssignments);
  const [customColorValue, setCustomColorValue] = useState('');
  const [customColors, setCustomColors] = useState<ColorItem[]>([]);
  const [copied, setCopied] = useState('');

  const flatColors = useMemo(() => [...colorGroups.flatMap((group) => group.colors), ...extraColors, ...customColors], [customColors]);
  const current = assignments[mode];
  const preview = getSlotStyle(current);
  const page = getPagePalette(mode);

  const handleColorClick = (color: ColorItem) => {
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
    const normalized = normalizeHexColor(customColorValue);
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

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: page.page, color: page.title }}>
      <div className={variant === 'modal' ? 'space-y-5 px-5 py-5' : 'space-y-6 px-7 py-6'}>
        <header
          className="flex min-h-[76px] flex-wrap items-center justify-between gap-4 rounded-xl border px-5 py-4"
          style={{ backgroundColor: page.header, borderColor: page.border }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (variant === 'modal') {
                  onClose?.();
                  return;
                }
                navigate('/test-collection');
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
              style={{ backgroundColor: page.button, borderColor: page.border, color: page.body }}
              title="返回测试"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold" style={{ color: page.title }}>主题颜色</h1>
              <p className="mt-1 text-sm" style={{ color: page.muted }}>先选择颜色，再点击右侧位置进行填色。每个位置都可以使用任意颜色。</p>
            </div>
          </div>
          <div className="flex rounded-xl border p-1" style={{ backgroundColor: page.button, borderColor: page.border }}>
            {([
              { key: 'light' as const, label: '白色主题（默认主题）', icon: Sun },
              { key: 'dark' as const, label: '黑色主题', icon: Moon },
            ]).map((item) => {
              const Icon = item.icon;
              const active = mode === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setMode(item.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                    active ? '' : ''
                  }`}
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
                    onClick={() => handleColorClick(color)}
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

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(520px,1fr)_430px]">
            <section className="rounded-xl border border-[#3d3d3d] p-5" style={{ backgroundColor: preview.page }}>
              <div className="rounded-xl border p-4" style={{ backgroundColor: preview.panel, borderColor: preview.border }}>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold" style={{ color: preview.title }}>界面预览</div>
                    <div className="mt-1 text-xs" style={{ color: preview.muted }}>{mode === 'light' ? '白色主题' : '黑色主题'}填色效果</div>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-bold"
                    style={{ backgroundColor: preview.tagBg, color: preview.tagText, border: `1px solid ${preview.border}` }}
                  >
                    标签
                  </span>
                </div>
                <div className="rounded-xl border p-4" style={{ backgroundColor: preview.card, borderColor: preview.border }}>
                  <div className="text-sm font-bold" style={{ color: preview.title }}>剧情点卡片</div>
                  <p className="mt-2 text-sm leading-6" style={{ color: preview.body }}>
                    主角在危机中反向布局，用看似退让的选择换取关键筹码，最终完成绝境转机。
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="rounded-lg px-3 py-2 text-sm font-bold" style={{ backgroundColor: preview.primary, color: getContrastText(preview.primary) }}>主按钮</button>
                    <button className="rounded-lg border px-3 py-2 text-sm font-bold" style={{ backgroundColor: preview.secondary, borderColor: preview.border, color: preview.body }}>次按钮</button>
                    <button className="rounded-lg px-3 py-2 text-sm font-bold" style={{ backgroundColor: preview.danger, color: getContrastText(preview.danger) }}>删除</button>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border p-5" style={{ backgroundColor: page.panel, borderColor: page.border }}>
              <h2 className="text-base font-bold" style={{ color: page.title }}>当前主题色值</h2>
              <div className="mt-4 space-y-2">
                {slots.map((slot) => {
                  const value = current[slot.key];
                  return (
                    <button
                      key={slot.key}
                      onClick={() => void copyColor(value)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors"
                      style={{ backgroundColor: page.card, borderColor: page.border }}
                      title="复制色值"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="h-5 w-5 rounded border border-white/10" style={{ backgroundColor: value }} />
                        <span className="truncate text-sm" style={{ color: page.body }}>{slot.title}</span>
                      </span>
                      <span className="flex items-center gap-2 font-mono text-xs" style={{ color: page.body }}>
                        {value}
                        {copied === value ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
