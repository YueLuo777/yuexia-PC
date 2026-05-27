export const ADJUSTMENT_MODE_ENABLED_KEY = 'xinyuexia_adjustment_mode_enabled_v1';
export const ADJUSTMENT_MODE_RULES_KEY = 'xinyuexia_adjustment_mode_rules_v1';
export const ADJUSTMENT_MODE_HISTORY_KEY = 'xinyuexia_adjustment_mode_history_v1';
export const ADJUSTMENT_MODE_CUSTOM_BUTTONS_KEY = 'xinyuexia_adjustment_mode_custom_buttons_v1';
export const ADJUSTMENT_MODE_SHORTCUTS_KEY = 'xinyuexia_adjustment_mode_shortcuts_v1';
export const ADJUSTMENT_MODE_UPDATED_EVENT = 'xinyuexia_adjustment_mode_updated';

export type AdjustmentStylePatch = {
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  paddingX?: number;
  paddingY?: number;
  offsetX?: number;
  offsetY?: number;
  opacity?: number;
  hidden?: boolean;
  presetId?: string;
};

export type AdjustmentApplyScope =
  | 'single'
  | 'sameTextPage'
  | 'sameTextGlobal'
  | 'sameKindPage'
  | 'sameKindGlobal'
  | 'sameTagPage'
  | 'sameTagGlobal';

export type AdjustmentRule = {
  id: string;
  targetKey: string;
  label: string;
  route: string;
  selector: string;
  tagName: string;
  originalText: string;
  classSignature: string;
  scope: AdjustmentApplyScope;
  styles: AdjustmentStylePatch;
  createdAt: string;
  updatedAt: string;
};

export type AdjustmentHistoryEntry = {
  id: string;
  action: string;
  label: string;
  route: string;
  targetKey: string;
  beforeRule: AdjustmentRule | null;
  afterRule: AdjustmentRule | null;
  createdAt: string;
};

export type AdjustmentCustomButton = {
  id: string;
  route: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  styles: AdjustmentStylePatch;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type AdjustmentExportPackage = {
  version: 1;
  exportedAt: string;
  app: 'xinyuexia';
  note: string;
  rules: AdjustmentRule[];
  history?: AdjustmentHistoryEntry[];
  customButtons?: AdjustmentCustomButton[];
};

export type AdjustmentPreset = {
  id: string;
  name: string;
  group: string;
  styles: AdjustmentStylePatch;
};

export type AdjustmentShortcutBinding = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
};

export type AdjustmentShortcutId =
  | 'selectElement'
  | 'addButton'
  | 'toggleGrid'
  | 'togglePanel'
  | 'copyExport'
  | 'downloadExport'
  | 'clearAll'
  | 'restoreCurrent'
  | 'fontUp'
  | 'fontDown'
  | 'radiusDown'
  | 'radiusUp'
  | 'toggleHidden'
  | 'moveLeft'
  | 'moveRight'
  | 'moveUp'
  | 'moveDown'
  | 'resizeWidthDown'
  | 'resizeWidthUp'
  | 'resizeHeightDown'
  | 'resizeHeightUp';

export type AdjustmentShortcutConfig = {
  id: AdjustmentShortcutId;
  group: string;
  title: string;
  desc: string;
  defaultBinding: AdjustmentShortcutBinding;
};

export const ADJUSTMENT_SHORTCUT_ACTIONS: AdjustmentShortcutConfig[] = [
  { id: 'selectElement', group: '常用', title: '选择元素', desc: '进入或退出选择元素模式', defaultBinding: { key: 't' } },
  { id: 'addButton', group: '常用', title: '添加按钮', desc: '进入或退出添加按钮模式', defaultBinding: { key: 'a' } },
  { id: 'toggleGrid', group: '常用', title: '网格开关', desc: '显示或隐藏网格辅助线', defaultBinding: { key: 'g' } },
  { id: 'togglePanel', group: '常用', title: '收起/展开面板', desc: '隐藏或显示调整面板', defaultBinding: { key: 'h' } },
  { id: 'copyExport', group: '导出', title: '复制调整包', desc: '复制调整包给 Codex', defaultBinding: { key: 's', ctrl: true } },
  { id: 'downloadExport', group: '导出', title: '下载调整包', desc: '下载调整包 JSON 文件', defaultBinding: { key: 's', ctrl: true, shift: true } },
  { id: 'clearAll', group: '导出', title: '清空全部', desc: '清空所有调整记录和新增按钮', defaultBinding: { key: 'Backspace', ctrl: true } },
  { id: 'restoreCurrent', group: '选中元素', title: '恢复当前元素', desc: '删除当前元素的调整记录', defaultBinding: { key: 'Delete' } },
  { id: 'fontUp', group: '选中元素', title: '字号增大', desc: '当前元素字号加 1', defaultBinding: { key: '=' } },
  { id: 'fontDown', group: '选中元素', title: '字号减小', desc: '当前元素字号减 1', defaultBinding: { key: '-' } },
  { id: 'radiusDown', group: '选中元素', title: '圆角减小', desc: '当前元素圆角减 1', defaultBinding: { key: '[' } },
  { id: 'radiusUp', group: '选中元素', title: '圆角增大', desc: '当前元素圆角加 1', defaultBinding: { key: ']' } },
  { id: 'toggleHidden', group: '选中元素', title: '隐藏开关', desc: '隐藏或显示当前元素', defaultBinding: { key: 'b' } },
  { id: 'moveLeft', group: '移动', title: '左移', desc: '当前元素向左移动，按住 Shift 加速', defaultBinding: { key: 'ArrowLeft' } },
  { id: 'moveRight', group: '移动', title: '右移', desc: '当前元素向右移动，按住 Shift 加速', defaultBinding: { key: 'ArrowRight' } },
  { id: 'moveUp', group: '移动', title: '上移', desc: '当前元素向上移动，按住 Shift 加速', defaultBinding: { key: 'ArrowUp' } },
  { id: 'moveDown', group: '移动', title: '下移', desc: '当前元素向下移动，按住 Shift 加速', defaultBinding: { key: 'ArrowDown' } },
  { id: 'resizeWidthDown', group: '缩放', title: '宽度减小', desc: '当前元素宽度减小，按住 Shift 加速', defaultBinding: { key: 'ArrowLeft', alt: true } },
  { id: 'resizeWidthUp', group: '缩放', title: '宽度增大', desc: '当前元素宽度增大，按住 Shift 加速', defaultBinding: { key: 'ArrowRight', alt: true } },
  { id: 'resizeHeightDown', group: '缩放', title: '高度减小', desc: '当前元素高度减小，按住 Shift 加速', defaultBinding: { key: 'ArrowUp', alt: true } },
  { id: 'resizeHeightUp', group: '缩放', title: '高度增大', desc: '当前元素高度增大，按住 Shift 加速', defaultBinding: { key: 'ArrowDown', alt: true } },
];

export const ADJUSTMENT_PRESETS: AdjustmentPreset[] = [
  {
    id: 'UI-01',
    name: '标准蓝色主按钮',
    group: '按钮',
    styles: { backgroundColor: '#08AACE', color: '#FFFFFF', borderRadius: 12, paddingX: 18, paddingY: 10, fontSize: 14 },
  },
  {
    id: 'UI-02',
    name: '白底普通按钮',
    group: '按钮',
    styles: { backgroundColor: '#FFFFFF', color: '#475569', borderRadius: 12, paddingX: 18, paddingY: 10, fontSize: 14 },
  },
  {
    id: 'UI-03',
    name: '红色危险按钮',
    group: '按钮',
    styles: { backgroundColor: '#EF4444', color: '#FFFFFF', borderRadius: 12, paddingX: 18, paddingY: 10, fontSize: 14 },
  },
  {
    id: 'UI-05',
    name: '导航设置同款按钮',
    group: '按钮',
    styles: { backgroundColor: '#08AACE', color: '#FFFFFF', width: 148, height: 44, borderRadius: 8, fontSize: 13 },
  },
  {
    id: 'UI-14',
    name: '单行输入框',
    group: '输入',
    styles: { backgroundColor: '#FFFFFF', color: '#334155', height: 44, borderRadius: 12, paddingX: 14, fontSize: 14 },
  },
  {
    id: 'UI-16',
    name: '正文输入框',
    group: '输入',
    styles: { backgroundColor: '#FFFFFF', color: '#334155', borderRadius: 12, paddingX: 12, paddingY: 12, fontSize: 14 },
  },
  {
    id: 'UI-37',
    name: '紧凑字号步进器',
    group: '字号',
    styles: { backgroundColor: '#FFFFFF', color: '#08AACE', height: 36, borderRadius: 12, fontSize: 13 },
  },
  {
    id: 'UI-49',
    name: '蓝色描边按钮',
    group: '按钮',
    styles: { backgroundColor: '#FFFFFF', color: '#08AACE', height: 40, borderRadius: 12, paddingX: 18, fontSize: 14 },
  },
  {
    id: 'UI-54',
    name: '紧凑设定卡片',
    group: '卡片',
    styles: { backgroundColor: '#FFFFFF', color: '#0F172A', borderRadius: 12, paddingX: 12, paddingY: 8, fontSize: 14 },
  },
  {
    id: 'UI-58',
    name: '元素选中框风格',
    group: '调整模式',
    styles: { backgroundColor: '#E6F7FB', color: '#08AACE', borderRadius: 12, fontSize: 14 },
  },
];

function emitAdjustmentUpdated() {
  window.dispatchEvent(new CustomEvent(ADJUSTMENT_MODE_UPDATED_EVENT));
}

export function isAdjustmentModeEnabled() {
  try {
    return localStorage.getItem(ADJUSTMENT_MODE_ENABLED_KEY) === '1';
  } catch {
    return false;
  }
}

export function setAdjustmentModeEnabled(enabled: boolean) {
  localStorage.setItem(ADJUSTMENT_MODE_ENABLED_KEY, enabled ? '1' : '0');
  emitAdjustmentUpdated();
}

function normalizeRule(input: unknown): AdjustmentRule | null {
  if (!input || typeof input !== 'object') return null;
  const value = input as Partial<AdjustmentRule>;
  if (typeof value.targetKey !== 'string' || typeof value.selector !== 'string') return null;
  const now = new Date().toISOString();
  return {
    id: typeof value.id === 'string' ? value.id : `adjust-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    targetKey: value.targetKey,
    label: typeof value.label === 'string' ? value.label : '未命名元素',
    route: typeof value.route === 'string' ? value.route : '',
    selector: value.selector,
    tagName: typeof value.tagName === 'string' ? value.tagName : 'div',
    originalText: typeof value.originalText === 'string' ? value.originalText : '',
    classSignature: typeof value.classSignature === 'string' ? value.classSignature : '',
    scope: isAdjustmentApplyScope(value.scope) ? value.scope : 'single',
    styles: value.styles && typeof value.styles === 'object' ? value.styles : {},
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : now,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : now,
  };
}

function cloneRule(rule: AdjustmentRule | null | undefined): AdjustmentRule | null {
  return rule ? JSON.parse(JSON.stringify(rule)) as AdjustmentRule : null;
}

function normalizeCustomButton(input: unknown): AdjustmentCustomButton | null {
  if (!input || typeof input !== 'object') return null;
  const value = input as Partial<AdjustmentCustomButton>;
  if (typeof value.route !== 'string') return null;
  const now = new Date().toISOString();
  const id = typeof value.id === 'string' ? value.id : `adjust-button-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {
    id,
    route: value.route,
    label: typeof value.label === 'string' && value.label.trim() ? value.label : '新按钮',
    x: Number.isFinite(value.x) ? Number(value.x) : 120,
    y: Number.isFinite(value.y) ? Number(value.y) : 120,
    width: Number.isFinite(value.width) ? Math.max(40, Number(value.width)) : 96,
    height: Number.isFinite(value.height) ? Math.max(24, Number(value.height)) : 36,
    styles: value.styles && typeof value.styles === 'object'
      ? value.styles
      : { backgroundColor: '#08AACE', color: '#FFFFFF', borderRadius: 10, fontSize: 13 },
    note: typeof value.note === 'string' ? value.note : '待设置功能',
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : now,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : now,
  };
}

function normalizeHistoryEntry(input: unknown): AdjustmentHistoryEntry | null {
  if (!input || typeof input !== 'object') return null;
  const value = input as Partial<AdjustmentHistoryEntry>;
  if (typeof value.targetKey !== 'string') return null;
  const beforeRule = normalizeRule(value.beforeRule);
  const afterRule = normalizeRule(value.afterRule);
  if (!beforeRule && !afterRule) return null;
  const now = new Date().toISOString();
  return {
    id: typeof value.id === 'string' ? value.id : `adjust-history-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    action: typeof value.action === 'string' ? value.action : '调整样式',
    label: typeof value.label === 'string' ? value.label : beforeRule?.label ?? afterRule?.label ?? '未命名元素',
    route: typeof value.route === 'string' ? value.route : beforeRule?.route ?? afterRule?.route ?? '',
    targetKey: value.targetKey,
    beforeRule,
    afterRule,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : now,
  };
}

function isAdjustmentApplyScope(value: unknown): value is AdjustmentApplyScope {
  return value === 'single'
    || value === 'sameTextPage'
    || value === 'sameTextGlobal'
    || value === 'sameKindPage'
    || value === 'sameKindGlobal'
    || value === 'sameTagPage'
    || value === 'sameTagGlobal';
}

function normalizeShortcutKey(key: string) {
  if (key === ' ') return 'Space';
  return key.length === 1 ? key.toLowerCase() : key;
}

function normalizeDisplayShortcutKey(key: string) {
  if (key === ' ') return 'Space';
  if (key.length === 1) return key.toUpperCase();
  return key;
}

function isAdjustmentShortcutId(value: string): value is AdjustmentShortcutId {
  return ADJUSTMENT_SHORTCUT_ACTIONS.some((action) => action.id === value);
}

export function formatAdjustmentShortcut(binding: AdjustmentShortcutBinding) {
  const parts: string[] = [];
  if (binding.ctrl) parts.push('Ctrl');
  if (binding.shift) parts.push('Shift');
  if (binding.alt) parts.push('Alt');
  if (binding.meta) parts.push('Meta');
  parts.push(normalizeDisplayShortcutKey(binding.key));
  return parts.join('+');
}

export function adjustmentShortcutFromKeyboardEvent(event: KeyboardEvent): AdjustmentShortcutBinding | null {
  if (event.key === 'Control' || event.key === 'Shift' || event.key === 'Alt' || event.key === 'Meta') return null;
  return {
    key: normalizeShortcutKey(event.key),
    ctrl: event.ctrlKey || undefined,
    shift: event.shiftKey || undefined,
    alt: event.altKey || undefined,
    meta: event.metaKey || undefined,
  };
}

export function matchesAdjustmentShortcut(event: KeyboardEvent, binding: AdjustmentShortcutBinding, options?: { allowShiftAcceleration?: boolean }) {
  const shiftMatches = options?.allowShiftAcceleration && !binding.shift ? true : !!event.shiftKey === !!binding.shift;
  return (
    normalizeShortcutKey(event.key) === normalizeShortcutKey(binding.key) &&
    !!event.ctrlKey === !!binding.ctrl &&
    shiftMatches &&
    !!event.altKey === !!binding.alt &&
    !!event.metaKey === !!binding.meta
  );
}

export function getDefaultAdjustmentShortcuts() {
  return Object.fromEntries(ADJUSTMENT_SHORTCUT_ACTIONS.map((action) => [action.id, action.defaultBinding])) as Record<AdjustmentShortcutId, AdjustmentShortcutBinding>;
}

export function normalizeAdjustmentShortcuts(value: unknown) {
  const defaults = getDefaultAdjustmentShortcuts();
  if (!value || typeof value !== 'object') return defaults;
  const raw = value as Record<string, Partial<AdjustmentShortcutBinding>>;
  const next = { ...defaults };
  for (const [id, binding] of Object.entries(raw)) {
    if (!isAdjustmentShortcutId(id) || !binding || typeof binding.key !== 'string') continue;
    next[id] = {
      key: normalizeShortcutKey(binding.key),
      ctrl: !!binding.ctrl || undefined,
      shift: !!binding.shift || undefined,
      alt: !!binding.alt || undefined,
      meta: !!binding.meta || undefined,
    };
  }
  return next;
}

export function readAdjustmentShortcuts() {
  try {
    return normalizeAdjustmentShortcuts(JSON.parse(localStorage.getItem(ADJUSTMENT_MODE_SHORTCUTS_KEY) ?? 'null'));
  } catch {
    return getDefaultAdjustmentShortcuts();
  }
}

export function saveAdjustmentShortcuts(bindings: Record<AdjustmentShortcutId, AdjustmentShortcutBinding>) {
  localStorage.setItem(ADJUSTMENT_MODE_SHORTCUTS_KEY, JSON.stringify(bindings));
  emitAdjustmentUpdated();
}

export function resetAdjustmentShortcuts() {
  const defaults = getDefaultAdjustmentShortcuts();
  saveAdjustmentShortcuts(defaults);
  return defaults;
}

export function readAdjustmentRules(): AdjustmentRule[] {
  try {
    const raw = localStorage.getItem(ADJUSTMENT_MODE_RULES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeRule).filter((item): item is AdjustmentRule => Boolean(item));
  } catch {
    return [];
  }
}

export function saveAdjustmentRules(rules: AdjustmentRule[]) {
  localStorage.setItem(ADJUSTMENT_MODE_RULES_KEY, JSON.stringify(rules));
  emitAdjustmentUpdated();
}

export function readAdjustmentHistoryEntries(): AdjustmentHistoryEntry[] {
  try {
    const raw = localStorage.getItem(ADJUSTMENT_MODE_HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeHistoryEntry).filter((item): item is AdjustmentHistoryEntry => Boolean(item));
  } catch {
    return [];
  }
}

export function saveAdjustmentHistoryEntries(entries: AdjustmentHistoryEntry[]) {
  localStorage.setItem(ADJUSTMENT_MODE_HISTORY_KEY, JSON.stringify(entries));
  emitAdjustmentUpdated();
}

export function readAdjustmentCustomButtons(): AdjustmentCustomButton[] {
  try {
    const raw = localStorage.getItem(ADJUSTMENT_MODE_CUSTOM_BUTTONS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeCustomButton).filter((item): item is AdjustmentCustomButton => Boolean(item));
  } catch {
    return [];
  }
}

export function saveAdjustmentCustomButtons(buttons: AdjustmentCustomButton[]) {
  localStorage.setItem(ADJUSTMENT_MODE_CUSTOM_BUTTONS_KEY, JSON.stringify(buttons));
  emitAdjustmentUpdated();
}

export function addAdjustmentCustomButton(button: Omit<AdjustmentCustomButton, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  const nextButton: AdjustmentCustomButton = {
    ...button,
    id: `adjust-button-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: now,
    updatedAt: now,
  };
  saveAdjustmentCustomButtons([...readAdjustmentCustomButtons(), nextButton]);
  return nextButton;
}

export function updateAdjustmentCustomButton(id: string, patch: Partial<Omit<AdjustmentCustomButton, 'id' | 'createdAt'>>) {
  const now = new Date().toISOString();
  const next = readAdjustmentCustomButtons().map((item) => (
    item.id === id ? { ...item, ...patch, updatedAt: now } : item
  ));
  saveAdjustmentCustomButtons(next);
  return next.find((item) => item.id === id) ?? null;
}

export function removeAdjustmentCustomButton(id: string) {
  saveAdjustmentCustomButtons(readAdjustmentCustomButtons().filter((item) => item.id !== id));
}

export function addAdjustmentHistoryEntry(entry: Omit<AdjustmentHistoryEntry, 'id' | 'createdAt'>) {
  const nextEntry: AdjustmentHistoryEntry = {
    ...entry,
    beforeRule: cloneRule(entry.beforeRule),
    afterRule: cloneRule(entry.afterRule),
    id: `adjust-history-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
  };
  const next = [nextEntry, ...readAdjustmentHistoryEntries()].slice(0, 120);
  saveAdjustmentHistoryEntries(next);
  return nextEntry;
}

export function clearAdjustmentHistoryEntries() {
  saveAdjustmentHistoryEntries([]);
}

export function restoreAdjustmentHistoryEntry(id: string) {
  const entry = readAdjustmentHistoryEntries().find((item) => item.id === id);
  if (!entry) return readAdjustmentRules();

  const rules = readAdjustmentRules();
  let next: AdjustmentRule[];
  if (entry.beforeRule) {
    const restored = {
      ...cloneRule(entry.beforeRule),
      updatedAt: new Date().toISOString(),
    } as AdjustmentRule;
    const exists = rules.some((item) => item.id === restored.id || item.targetKey === restored.targetKey);
    next = exists
      ? rules.map((item) => (item.id === restored.id || item.targetKey === restored.targetKey
        ? { ...restored, id: item.id, createdAt: item.createdAt }
        : item))
      : [...rules, restored];
  } else {
    next = rules.filter((item) => item.targetKey !== entry.targetKey && item.id !== entry.afterRule?.id);
  }
  saveAdjustmentRules(next);
  return next;
}

export function upsertAdjustmentRule(rule: AdjustmentRule) {
  const rules = readAdjustmentRules();
  const now = new Date().toISOString();
  const nextRule = { ...rule, updatedAt: now };
  const exists = rules.some((item) => item.id === rule.id || item.targetKey === rule.targetKey);
  let savedRule = nextRule;
  const next = exists
    ? rules.map((item) => {
      if (item.id !== rule.id && item.targetKey !== rule.targetKey) return item;
      savedRule = { ...nextRule, id: item.id, createdAt: item.createdAt };
      return savedRule;
    })
    : [...rules, nextRule];
  saveAdjustmentRules(next);
  return savedRule;
}

export function removeAdjustmentRule(id: string) {
  saveAdjustmentRules(readAdjustmentRules().filter((item) => item.id !== id));
}

export function makeAdjustmentExportPackage(rules = readAdjustmentRules()): AdjustmentExportPackage {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: 'xinyuexia',
    note: '这是调整模式导出的 UI 改动包。把这个文件发给 Codex 后，可以按这里的目标元素和样式同步到代码。',
    rules,
    history: readAdjustmentHistoryEntries(),
    customButtons: readAdjustmentCustomButtons(),
  };
}

export function parseAdjustmentImportPackage(input: unknown): AdjustmentRule[] {
  const payload = input as Partial<AdjustmentExportPackage> | AdjustmentRule[] | null;
  const source = Array.isArray(payload) ? payload : Array.isArray(payload?.rules) ? payload.rules : [];
  return source.map(normalizeRule).filter((item): item is AdjustmentRule => Boolean(item));
}

export function parseAdjustmentCustomButtonsImportPackage(input: unknown): AdjustmentCustomButton[] {
  const payload = input as Partial<AdjustmentExportPackage> | null;
  const source = Array.isArray(payload?.customButtons) ? payload.customButtons : [];
  return source.map(normalizeCustomButton).filter((item): item is AdjustmentCustomButton => Boolean(item));
}
