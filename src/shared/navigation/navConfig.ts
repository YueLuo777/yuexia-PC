import {
  BarChart3,
  BookOpen,
  Cloud,
  Database,
  EyeOff,
  Film,
  FlaskConical,
  Globe,
  Image,
  LayoutGrid,
  Library,
  MessageSquare,
  Moon,
  Settings,
  Sparkles,
  Star,
  Tag,
  Type,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItemConfig {
  iconName: string;
  label: string;
  to: string;
  hidden?: boolean;
}

export interface NavGroupConfig {
  title: string;
  iconName: string;
  hidden?: boolean;
  dividerAfterItemTo?: string | null;
  dividerAfterItemTos?: string[];
  items: NavItemConfig[];
}

const iconMap: Record<string, LucideIcon> = {
  BarChart3,
  BookOpen,
  Cloud,
  Database,
  EyeOff,
  Film,
  FlaskConical,
  Globe,
  Image,
  LayoutGrid,
  Library,
  MessageSquare,
  Moon,
  Settings,
  Sparkles,
  Star,
  Tag,
  Type,
};

export function getIconByName(name: string): LucideIcon {
  return iconMap[name] ?? LayoutGrid;
}

const NAV_ROOT_GROUP_TITLE = '导航';

export const DEFAULT_NAV_CONFIG: NavGroupConfig[] = [
  {
    title: NAV_ROOT_GROUP_TITLE,
    iconName: 'LayoutGrid',
    dividerAfterItemTo: '/novels',
    dividerAfterItemTos: ['/novels'],
    items: [
      { iconName: 'BookOpen', label: '我的小说', to: '/novels' },
      { iconName: 'Film', label: '我的剧本', to: '/scripts' },
      { iconName: 'Sparkles', label: '题材迭代', to: '/genre-iteration' },
      { iconName: 'Library', label: '资料库', to: '/library' },
      { iconName: 'Tag', label: '提示词管理', to: '/prompts' },
      { iconName: 'Settings', label: '模型管理', to: '/model-manage' },
      { iconName: 'BarChart3', label: 'Token用量', to: '/token-usage' },
      { iconName: 'FlaskConical', label: '测试板块', to: '/test-collection' },
    ],
  },
];

const NAV_CONFIG_KEY = 'xinyuexia_nav_config_v1';
const COLLAPSED_KEY = 'xinyuexia_sidebar_collapsed_v1';
export const NAV_CONFIG_UPDATED_EVENT = 'xinyuexia_nav_config_updated';
const REMOVED_ROUTES = new Set([
  '/dashboard',
  '/ai-chat',
  '/call-data',
  '/button-test',
  '/brainstorm-library',
  '/db-settings',
  '/extract-test',
  '/extract-1',
  '/extract',
  '/moonfall-settings',
  '/hotspots',
  '/adjustment-mode',
  '/idea-generator',
  '/outline-generator',
  '/cover-library',
  '/materials',
  '/materials/settings',
  '/plot-library',
  '/idea-library',
  '/software-ui-catalog',
  '/theme-colors',
  '/text-overrides',
  '/hidden-content',
  '/concept-library',
]);
const REMOVED_GROUP_TITLES = new Set(['首页专区', '隐藏专区', '功能专区']);
const NORMALIZED_ROUTE_LABELS: Record<string, string> = {
  '/library': '资料库',
  '/text-overrides': '文案修改',
  '/software-ui-catalog': 'UI库',
  '/theme-colors': '主题颜色',
  '/test-collection': '测试板块',
  '/genre-iteration': '题材迭代',
};

function cloneDefaultConfig() {
  return JSON.parse(JSON.stringify(DEFAULT_NAV_CONFIG)) as NavGroupConfig[];
}

function moveRouteAfter(items: NavItemConfig[], route: string, afterRoute: string) {
  const itemIndex = items.findIndex((item) => item.to === route);
  const afterIndex = items.findIndex((item) => item.to === afterRoute);
  if (itemIndex === -1 || afterIndex === -1 || itemIndex === afterIndex + 1) return;

  const [item] = items.splice(itemIndex, 1);
  const nextAfterIndex = items.findIndex((candidate) => candidate.to === afterRoute);
  items.splice(nextAfterIndex + 1, 0, item);
}

function flattenNavConfig(config: NavGroupConfig[]) {
  const seenRoutes = new Set<string>();
  const items: NavItemConfig[] = [];
  let dividerAfterItemTos: string[] | null | undefined;

  for (const group of config) {
    if (REMOVED_GROUP_TITLES.has(group.title)) continue;
    if (Array.isArray(group.dividerAfterItemTos)) dividerAfterItemTos = group.dividerAfterItemTos;
    else if (group.dividerAfterItemTo !== undefined) dividerAfterItemTos = group.dividerAfterItemTo === null ? [] : [group.dividerAfterItemTo];
    for (const item of group.items) {
      if (REMOVED_ROUTES.has(item.to)) continue;
      if (seenRoutes.has(item.to)) continue;
      seenRoutes.add(item.to);
      items.push({
        ...item,
        label: NORMALIZED_ROUTE_LABELS[item.to] ?? item.label,
        hidden: item.hidden || group.hidden || undefined,
      });
    }
  }
  moveRouteAfter(items, '/genre-iteration', '/scripts');

  const visibleItemRoutes = new Set(items.filter((item) => !item.hidden).map((item) => item.to));
  const fallbackDividerAfterItemTos = DEFAULT_NAV_CONFIG[0].dividerAfterItemTos ?? (
    DEFAULT_NAV_CONFIG[0].dividerAfterItemTo ? [DEFAULT_NAV_CONFIG[0].dividerAfterItemTo] : []
  );
  const rawDividerAfterItemTos = dividerAfterItemTos === undefined ? fallbackDividerAfterItemTos : dividerAfterItemTos;
  const normalizedDividerAfterItemTos = Array.from(new Set(rawDividerAfterItemTos ?? []))
    .filter((itemTo) => visibleItemRoutes.has(itemTo));

  return [{
    title: NAV_ROOT_GROUP_TITLE,
    iconName: 'LayoutGrid',
    dividerAfterItemTo: normalizedDividerAfterItemTos[0] ?? null,
    dividerAfterItemTos: normalizedDividerAfterItemTos,
    items,
  }];
}

function mergeWithDefaultConfig(config: NavGroupConfig[]) {
  const next = flattenNavConfig(JSON.parse(JSON.stringify(config)) as NavGroupConfig[]);
  const root = next[0];
  for (const defaultItem of DEFAULT_NAV_CONFIG[0].items) {
    const exists = root.items.some((item) => item.to === defaultItem.to);
    if (!exists) {
      root.items.push({ ...defaultItem });
    }
  }
  return flattenNavConfig(next);
}

export function normalizeNavConfig(config: NavGroupConfig[]) {
  return mergeWithDefaultConfig(config);
}

function isValidConfig(config: unknown): config is NavGroupConfig[] {
  return Array.isArray(config) && config.every((group) => (
    group &&
    typeof group === 'object' &&
    typeof group.title === 'string' &&
    typeof group.iconName === 'string' &&
    (group.dividerAfterItemTo === undefined || typeof group.dividerAfterItemTo === 'string' || group.dividerAfterItemTo === null) &&
    (group.dividerAfterItemTos === undefined || (Array.isArray(group.dividerAfterItemTos) && group.dividerAfterItemTos.every((item: unknown) => typeof item === 'string'))) &&
    Array.isArray(group.items)
  ));
}

export function loadNavConfig(): NavGroupConfig[] {
  try {
    const raw = localStorage.getItem(NAV_CONFIG_KEY);
    if (!raw) return cloneDefaultConfig();
    const parsed: unknown = JSON.parse(raw);
    return isValidConfig(parsed) ? mergeWithDefaultConfig(parsed) : cloneDefaultConfig();
  } catch {
    return cloneDefaultConfig();
  }
}

export function saveNavConfig(config: NavGroupConfig[]) {
  const next = normalizeNavConfig(config);
  localStorage.setItem(NAV_CONFIG_KEY, JSON.stringify(next));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NAV_CONFIG_UPDATED_EVENT, { detail: { config: next } }));
  }
  return next;
}

export function resetNavConfig() {
  const fresh = cloneDefaultConfig();
  saveNavConfig(fresh);
  return fresh;
}

export function loadCollapsedSections(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(COLLAPSED_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function saveCollapsedSections(value: Record<string, boolean>) {
  localStorage.setItem(COLLAPSED_KEY, JSON.stringify(value));
}
