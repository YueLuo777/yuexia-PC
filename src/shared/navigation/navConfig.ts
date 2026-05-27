import {
  Activity,
  BarChart3,
  BookOpen,
  Cloud,
  Database,
  Film,
  FlaskConical,
  Globe,
  Image,
  LayoutGrid,
  Library,
  Lightbulb,
  ListTree,
  MessageSquare,
  Moon,
  Palette,
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
  items: NavItemConfig[];
}

const iconMap: Record<string, LucideIcon> = {
  Activity,
  BarChart3,
  BookOpen,
  Cloud,
  Database,
  Film,
  FlaskConical,
  Globe,
  Image,
  LayoutGrid,
  Library,
  Lightbulb,
  ListTree,
  MessageSquare,
  Moon,
  Palette,
  Settings,
  Sparkles,
  Star,
  Tag,
  Type,
};

export function getIconByName(name: string): LucideIcon {
  return iconMap[name] ?? LayoutGrid;
}

export const DEFAULT_NAV_CONFIG: NavGroupConfig[] = [
  {
    title: '创作专区',
    iconName: 'BookOpen',
    items: [
      { iconName: 'BookOpen', label: '我的小说', to: '/novels' },
      { iconName: 'Film', label: '我的剧本', to: '/scripts' },
      { iconName: 'Sparkles', label: '提炼剧情', to: '/extract' },
      { iconName: 'Database', label: '提取设定', to: '/moonfall-settings' },
      { iconName: 'Library', label: '库', to: '/library' },
    ],
  },
  {
    title: '数据专区',
    iconName: 'Database',
    items: [
      { iconName: 'Tag', label: '提示词管理', to: '/prompts' },
      { iconName: 'Settings', label: '模型管理', to: '/model-manage' },
      { iconName: 'Cloud', label: '数据库设置', to: '/db-settings' },
      { iconName: 'Palette', label: '调整模式', to: '/adjustment-mode' },
    ],
  },
  {
    title: '功能专区',
    iconName: 'Lightbulb',
    items: [
      { iconName: 'Lightbulb', label: '脑洞生成器', to: '/idea-generator' },
      { iconName: 'ListTree', label: '大纲生成器', to: '/outline-generator' },
      { iconName: 'BarChart3', label: 'Token用量', to: '/token-usage' },
    ],
  },
  {
    title: '测试专区',
    iconName: 'FlaskConical',
    items: [
      { iconName: 'FlaskConical', label: '测试', to: '/test-collection' },
    ],
  },
];

const NAV_CONFIG_KEY = 'xinyuexia_nav_config_v1';
const COLLAPSED_KEY = 'xinyuexia_sidebar_collapsed_v1';
const REMOVED_ROUTES = new Set([
  '/dashboard',
  '/ai-chat',
  '/call-data',
  '/button-test',
  '/brainstorm-library',
  '/extract-test',
  '/extract-1',
  '/cover-library',
  '/materials',
  '/materials/settings',
  '/plot-library',
  '/idea-library',
  '/software-ui-catalog',
  '/theme-colors',
  '/text-overrides',
]);
const REMOVED_GROUP_TITLES = new Set(['首页专区']);
const NORMALIZED_ROUTE_LABELS: Record<string, string> = {
  '/db-settings': '数据库设置',
  '/library': '库',
  '/text-overrides': '文案修改',
  '/adjustment-mode': '调整模式',
  '/software-ui-catalog': 'UI库',
  '/theme-colors': '主题颜色',
  '/test-collection': '测试',
};

function cloneDefaultConfig() {
  return JSON.parse(JSON.stringify(DEFAULT_NAV_CONFIG)) as NavGroupConfig[];
}

function dedupeNavItems(config: NavGroupConfig[]) {
  const seenRoutes = new Set<string>();
  return config
    .filter((group) => !REMOVED_GROUP_TITLES.has(group.title))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (REMOVED_ROUTES.has(item.to)) return false;
        if (seenRoutes.has(item.to)) return false;
        seenRoutes.add(item.to);
        if (NORMALIZED_ROUTE_LABELS[item.to]) {
          item.label = NORMALIZED_ROUTE_LABELS[item.to];
        }
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);
}

function findMatchingGroup(config: NavGroupConfig[], defaultGroup: NavGroupConfig) {
  return config.find((item) => item.title === defaultGroup.title || item.iconName === defaultGroup.iconName);
}

function mergeWithDefaultConfig(config: NavGroupConfig[]) {
  const next = dedupeNavItems(JSON.parse(JSON.stringify(config)) as NavGroupConfig[]);
  for (const defaultGroup of DEFAULT_NAV_CONFIG) {
    const group = findMatchingGroup(next, defaultGroup);
    if (!group) {
      next.push(JSON.parse(JSON.stringify(defaultGroup)) as NavGroupConfig);
      continue;
    }
    group.title = defaultGroup.title;
    group.iconName = defaultGroup.iconName;
    if (defaultGroup.title === '测试专区') {
      group.hidden = false;
    }
    for (const defaultItem of defaultGroup.items) {
      const existsAnywhere = next.some((candidateGroup) => (
        candidateGroup.items.some((item) => item.to === defaultItem.to)
      ));
      if (!existsAnywhere) {
        group.items.push({ ...defaultItem });
      }
    }
  }
  return dedupeNavItems(next);
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
