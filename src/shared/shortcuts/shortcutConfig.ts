import { APP_EVENTS } from '@/shared/events/appEvents';

export type ShortcutActionId =
  | 'close_floating'
  | 'go_home'
  | 'close_work_tab'
  | 'delete_chapter'
  | 'smart_format'
  | 'save_chapter'
  | 'undo_edit';

export interface ShortcutBinding {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export interface ShortcutAction {
  id: ShortcutActionId;
  group: string;
  title: string;
  desc: string;
  defaultBinding: ShortcutBinding;
}

export const SHORTCUT_STORAGE_KEY = 'xinyuexia_shortcut_bindings_v1';
export const MOUSE_GESTURE_SETTINGS_KEY = 'xinyuexia_mouse_gesture_settings_v1';
export const SHORTCUT_UPDATED_EVENT = APP_EVENTS.shortcutsUpdated;
export const SHORTCUT_ACTION_EVENT = APP_EVENTS.shortcutAction;
const LEGACY_SMART_FORMAT_BINDING: ShortcutBinding = { key: 'r', ctrl: true, shift: true };

export interface MouseGestureSettings {
  goHomeLeftSwipe: boolean;
  forwardRightSwipe: boolean;
}

export const defaultMouseGestureSettings: MouseGestureSettings = {
  goHomeLeftSwipe: true,
  forwardRightSwipe: true,
};

export const shortcutActions: ShortcutAction[] = [
  {
    id: 'close_floating',
    group: '界面与导航',
    title: '关闭浮层',
    desc: '关闭当前弹层或右侧栏',
    defaultBinding: { key: 'Escape' },
  },
  {
    id: 'go_home',
    group: '界面与导航',
    title: '回到我的小说',
    desc: '快速返回我的小说页面',
    defaultBinding: { key: 'F1' },
  },
  {
    id: 'close_work_tab',
    group: '界面与导航',
    title: '关闭作品标签页',
    desc: '关闭当前打开的作品标签页',
    defaultBinding: { key: 'w', ctrl: true },
  },
  {
    id: 'delete_chapter',
    group: '章节编辑',
    title: '删除章节',
    desc: '删除当前选中的章节',
    defaultBinding: { key: 'Delete' },
  },
  {
    id: 'smart_format',
    group: '章节编辑',
    title: '自动排版',
    desc: '整理空行与首尾空白',
    defaultBinding: { key: 'r', ctrl: true },
  },
  {
    id: 'save_chapter',
    group: '章节编辑',
    title: '保存',
    desc: '保存当前章节内容',
    defaultBinding: { key: 's', ctrl: true },
  },
  {
    id: 'undo_edit',
    group: '章节编辑',
    title: '撤销',
    desc: '撤销上一步编辑',
    defaultBinding: { key: 'z', ctrl: true },
  },
];

export function formatShortcut(binding: ShortcutBinding) {
  const parts = [];
  if (binding.ctrl) parts.push('Ctrl');
  if (binding.shift) parts.push('Shift');
  if (binding.alt) parts.push('Alt');
  if (binding.meta) parts.push('Meta');
  parts.push(normalizeDisplayKey(binding.key));
  return parts.join('+');
}

function normalizeDisplayKey(key: string) {
  if (key.length === 1) return key.toUpperCase();
  if (key === ' ') return 'Space';
  return key;
}

function normalizeKey(key: string) {
  if (key === ' ') return 'Space';
  return key.length === 1 ? key.toLowerCase() : key;
}

export function bindingFromKeyboardEvent(event: KeyboardEvent): ShortcutBinding | null {
  if (event.key === 'Control' || event.key === 'Shift' || event.key === 'Alt' || event.key === 'Meta') return null;
  return {
    key: normalizeKey(event.key),
    ctrl: event.ctrlKey || undefined,
    shift: event.shiftKey || undefined,
    alt: event.altKey || undefined,
    meta: event.metaKey || undefined,
  };
}

export function matchesShortcut(event: KeyboardEvent, binding: ShortcutBinding) {
  return (
    normalizeKey(event.key) === normalizeKey(binding.key) &&
    !!event.ctrlKey === !!binding.ctrl &&
    !!event.shiftKey === !!binding.shift &&
    !!event.altKey === !!binding.alt &&
    !!event.metaKey === !!binding.meta
  );
}

function isSameShortcutBinding(left: ShortcutBinding, right: ShortcutBinding) {
  return (
    normalizeKey(left.key) === normalizeKey(right.key) &&
    !!left.ctrl === !!right.ctrl &&
    !!left.shift === !!right.shift &&
    !!left.alt === !!right.alt &&
    !!left.meta === !!right.meta
  );
}

export function getDefaultShortcutBindings() {
  return Object.fromEntries(shortcutActions.map((action) => [action.id, action.defaultBinding])) as Record<
    ShortcutActionId,
    ShortcutBinding
  >;
}

function isShortcutActionId(value: string): value is ShortcutActionId {
  return shortcutActions.some((action) => action.id === value);
}

export function normalizeShortcutBindings(value: unknown) {
  const defaults = getDefaultShortcutBindings();
  if (!value || typeof value !== 'object') return defaults;
  const raw = value as Record<string, Partial<ShortcutBinding>>;
  const next = { ...defaults };
  for (const [id, binding] of Object.entries(raw)) {
    if (!isShortcutActionId(id) || !binding || typeof binding.key !== 'string') continue;
    next[id] = {
      key: normalizeKey(binding.key),
      ctrl: !!binding.ctrl || undefined,
      shift: !!binding.shift || undefined,
      alt: !!binding.alt || undefined,
      meta: !!binding.meta || undefined,
    };
    if (id === 'smart_format' && isSameShortcutBinding(next[id], LEGACY_SMART_FORMAT_BINDING)) {
      next[id] = defaults.smart_format;
    }
  }
  return next;
}

export function loadShortcutBindings() {
  try {
    return normalizeShortcutBindings(JSON.parse(localStorage.getItem(SHORTCUT_STORAGE_KEY) ?? 'null'));
  } catch {
    return getDefaultShortcutBindings();
  }
}

export function saveShortcutBindings(bindings: Record<ShortcutActionId, ShortcutBinding>) {
  localStorage.setItem(SHORTCUT_STORAGE_KEY, JSON.stringify(bindings));
  window.dispatchEvent(new CustomEvent(SHORTCUT_UPDATED_EVENT));
}

export function normalizeMouseGestureSettings(value: unknown): MouseGestureSettings {
  if (!value || typeof value !== 'object') return defaultMouseGestureSettings;
  const raw = value as Partial<MouseGestureSettings>;
  return {
    goHomeLeftSwipe:
      typeof raw.goHomeLeftSwipe === 'boolean' ? raw.goHomeLeftSwipe : defaultMouseGestureSettings.goHomeLeftSwipe,
    forwardRightSwipe:
      typeof raw.forwardRightSwipe === 'boolean'
        ? raw.forwardRightSwipe
        : defaultMouseGestureSettings.forwardRightSwipe,
  };
}

export function loadMouseGestureSettings() {
  try {
    return normalizeMouseGestureSettings(JSON.parse(localStorage.getItem(MOUSE_GESTURE_SETTINGS_KEY) ?? 'null'));
  } catch {
    return defaultMouseGestureSettings;
  }
}

export function saveMouseGestureSettings(settings: MouseGestureSettings) {
  localStorage.setItem(MOUSE_GESTURE_SETTINGS_KEY, JSON.stringify(normalizeMouseGestureSettings(settings)));
  window.dispatchEvent(new CustomEvent(SHORTCUT_UPDATED_EVENT));
}
