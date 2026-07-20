import moonlitCover01 from '@/assets/default-novel-covers/moonlit-01-deep-blue.png';
import moonlitCover02 from '@/assets/default-novel-covers/moonlit-02-minimal-orbit.png';
import moonlitCover03 from '@/assets/default-novel-covers/moonlit-03-purple-dream.png';
import moonlitCover04 from '@/assets/default-novel-covers/moonlit-04-ink-moon.png';
import blueMinimalCover01 from '@/assets/default-novel-covers/blue-minimal-01-crescent.png';
import blueMinimalCover03 from '@/assets/default-novel-covers/blue-minimal-03-moon-orbit.png';
import blueMinimalCover06 from '@/assets/default-novel-covers/blue-minimal-06-moon-book.png';

export const DEFAULT_NOVEL_COVER_STORAGE_KEY = 'xinyuexia_default_novel_cover_v1';
export const CUSTOM_DEFAULT_NOVEL_COVER_STORAGE_KEY = 'xinyuexia_custom_default_novel_cover_v1';
export const CUSTOM_DEFAULT_NOVEL_COVER_HISTORY_STORAGE_KEY = 'xinyuexia_custom_default_novel_cover_history_v2';
export const DEFAULT_NOVEL_COVER_UPDATED_EVENT = 'xinyuexia_default_novel_cover_updated';
export const CUSTOM_DEFAULT_NOVEL_COVER_ID = 'custom-default-cover' as const;
export const CUSTOM_DEFAULT_NOVEL_COVER_LIMIT = 20;
const CUSTOM_DEFAULT_NOVEL_COVER_ID_PREFIX = `${CUSTOM_DEFAULT_NOVEL_COVER_ID}-` as const;

export const DEFAULT_NOVEL_COVER_GROUPS = [
  { id: 'minimal', label: '简约封面' },
  { id: 'normal', label: '普通封面' },
] as const;

export const DEFAULT_NOVEL_COVERS = [
  {
    id: 'moonlit-01',
    group: 'normal',
    label: '普通1号封面',
    name: '深蓝月夜',
    description: '深蓝满月、远山与月光河流',
    src: moonlitCover01,
  },
  {
    id: 'moonlit-02',
    group: 'normal',
    label: '普通2号封面',
    name: '极简月轨',
    description: '暖白纸张、靛蓝弯月与金色月轨',
    src: moonlitCover02,
  },
  {
    id: 'moonlit-03',
    group: 'normal',
    label: '普通3号封面',
    name: '紫色梦境',
    description: '紫蓝夜空、发光弯月与层叠山影',
    src: moonlitCover03,
  },
  {
    id: 'moonlit-04',
    group: 'normal',
    label: '普通4号封面',
    name: '水墨朱月',
    description: '宣纸、朱砂月与水墨远山',
    src: moonlitCover04,
  },
  {
    id: 'blue-minimal-01',
    group: 'minimal',
    label: '简约1号封面',
    name: '弯月',
    description: '浅蓝书封与简洁弯月压印',
    src: blueMinimalCover01,
  },
  {
    id: 'blue-minimal-03',
    group: 'minimal',
    label: '简约2号封面',
    name: '月轨',
    description: '浅蓝书封、弯月与两道细月轨',
    src: blueMinimalCover03,
  },
  {
    id: 'blue-minimal-06',
    group: 'minimal',
    label: '简约3号封面',
    name: '月亮与书',
    description: '浅蓝书封、小弯月与打开的书',
    src: blueMinimalCover06,
  },
] as const;

export interface CustomDefaultNovelCover {
  id: `${typeof CUSTOM_DEFAULT_NOVEL_COVER_ID_PREFIX}${string}`;
  group: 'custom';
  label: string;
  name: '用户上传';
  description: '用户上传的小说默认封面';
  src: string;
  createdAt: number;
}

export type DefaultNovelCoverId =
  | (typeof DEFAULT_NOVEL_COVERS)[number]['id']
  | CustomDefaultNovelCover['id'];

export const INITIAL_DEFAULT_NOVEL_COVER_ID: DefaultNovelCoverId = 'blue-minimal-03';

export function isDefaultNovelCoverId(value: unknown): value is DefaultNovelCoverId {
  return (
    (typeof value === 'string' && value.startsWith(CUSTOM_DEFAULT_NOVEL_COVER_ID_PREFIX)) ||
    DEFAULT_NOVEL_COVERS.some((cover) => cover.id === value)
  );
}

export function readCustomDefaultNovelCover() {
  try {
    const stored = localStorage.getItem(CUSTOM_DEFAULT_NOVEL_COVER_STORAGE_KEY);
    return stored?.startsWith('data:image/') ? stored : '';
  } catch {
    return '';
  }
}

function isCustomCover(value: unknown): value is CustomDefaultNovelCover {
  if (!value || typeof value !== 'object') return false;
  const cover = value as Partial<CustomDefaultNovelCover>;
  return (
    typeof cover.id === 'string' &&
    cover.id.startsWith(CUSTOM_DEFAULT_NOVEL_COVER_ID_PREFIX) &&
    typeof cover.src === 'string' &&
    cover.src.startsWith('data:image/') &&
    typeof cover.createdAt === 'number'
  );
}

function writeCustomCoverHistory(covers: CustomDefaultNovelCover[]) {
  try {
    localStorage.setItem(CUSTOM_DEFAULT_NOVEL_COVER_HISTORY_STORAGE_KEY, JSON.stringify(covers));
  } catch {
    throw new Error('自定义封面存储空间不足，请删除部分历史封面后重试');
  }
}

export function readCustomDefaultNovelCovers(): CustomDefaultNovelCover[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOM_DEFAULT_NOVEL_COVER_HISTORY_STORAGE_KEY) ?? '[]');
    const covers = Array.isArray(parsed) ? parsed.filter(isCustomCover).slice(0, CUSTOM_DEFAULT_NOVEL_COVER_LIMIT) : [];
    if (covers.length > 0) return covers;

    const legacySrc = readCustomDefaultNovelCover();
    if (!legacySrc) return [];
    const migrated: CustomDefaultNovelCover = {
      id: `${CUSTOM_DEFAULT_NOVEL_COVER_ID_PREFIX}legacy`,
      group: 'custom',
      label: '自定义封面 1',
      name: '用户上传',
      description: '用户上传的小说默认封面',
      src: legacySrc,
      createdAt: 0,
    };
    writeCustomCoverHistory([migrated]);
    if (localStorage.getItem(DEFAULT_NOVEL_COVER_STORAGE_KEY) === CUSTOM_DEFAULT_NOVEL_COVER_ID) {
      localStorage.setItem(DEFAULT_NOVEL_COVER_STORAGE_KEY, migrated.id);
    }
    return [migrated];
  } catch {
    return [];
  }
}

export function readDefaultNovelCoverId(): DefaultNovelCoverId {
  try {
    const stored = localStorage.getItem(DEFAULT_NOVEL_COVER_STORAGE_KEY);
    const customCovers = readCustomDefaultNovelCovers();
    if (stored === CUSTOM_DEFAULT_NOVEL_COVER_ID) {
      return customCovers[0]?.id ?? INITIAL_DEFAULT_NOVEL_COVER_ID;
    }
    if (typeof stored === 'string' && stored.startsWith(CUSTOM_DEFAULT_NOVEL_COVER_ID_PREFIX)) {
      return customCovers.some((cover) => cover.id === stored)
        ? (stored as CustomDefaultNovelCover['id'])
        : INITIAL_DEFAULT_NOVEL_COVER_ID;
    }
    return isDefaultNovelCoverId(stored) ? stored : INITIAL_DEFAULT_NOVEL_COVER_ID;
  } catch {
    return INITIAL_DEFAULT_NOVEL_COVER_ID;
  }
}

export function saveDefaultNovelCoverId(id: DefaultNovelCoverId) {
  if (id.startsWith(CUSTOM_DEFAULT_NOVEL_COVER_ID_PREFIX)) {
    const selected = readCustomDefaultNovelCovers().find((cover) => cover.id === id);
    if (!selected) throw new Error('自定义封面不存在');
    localStorage.setItem(CUSTOM_DEFAULT_NOVEL_COVER_STORAGE_KEY, selected.src);
  }
  localStorage.setItem(DEFAULT_NOVEL_COVER_STORAGE_KEY, id);
  window.dispatchEvent(new CustomEvent(DEFAULT_NOVEL_COVER_UPDATED_EVENT, { detail: id }));
  return id;
}

export function saveCustomDefaultNovelCover(src: string) {
  if (!src.startsWith('data:image/')) throw new Error('自定义封面数据无效');
  const cover: CustomDefaultNovelCover = {
    id: `${CUSTOM_DEFAULT_NOVEL_COVER_ID_PREFIX}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    group: 'custom',
    label: '自定义封面',
    name: '用户上传',
    description: '用户上传的小说默认封面',
    src,
    createdAt: Date.now(),
  };
  const next = [cover, ...readCustomDefaultNovelCovers()].slice(0, CUSTOM_DEFAULT_NOVEL_COVER_LIMIT);
  writeCustomCoverHistory(next);
  localStorage.setItem(CUSTOM_DEFAULT_NOVEL_COVER_STORAGE_KEY, src);
  localStorage.setItem(DEFAULT_NOVEL_COVER_STORAGE_KEY, cover.id);
  window.dispatchEvent(new CustomEvent(DEFAULT_NOVEL_COVER_UPDATED_EVENT, { detail: cover.id }));
  return cover;
}

export function removeCustomDefaultNovelCover(id?: CustomDefaultNovelCover['id']) {
  const selectedId = readDefaultNovelCoverId();
  const targetId = id ?? (selectedId.startsWith(CUSTOM_DEFAULT_NOVEL_COVER_ID_PREFIX) ? selectedId : undefined);
  if (!targetId) return;
  const next = readCustomDefaultNovelCovers().filter((cover) => cover.id !== targetId);
  writeCustomCoverHistory(next);
  if (selectedId === targetId) {
    localStorage.setItem(DEFAULT_NOVEL_COVER_STORAGE_KEY, INITIAL_DEFAULT_NOVEL_COVER_ID);
  }
  if (next.length > 0) localStorage.setItem(CUSTOM_DEFAULT_NOVEL_COVER_STORAGE_KEY, next[0].src);
  else localStorage.removeItem(CUSTOM_DEFAULT_NOVEL_COVER_STORAGE_KEY);
  window.dispatchEvent(new Event(DEFAULT_NOVEL_COVER_UPDATED_EVENT));
}

export function getCustomDefaultNovelCover(id?: DefaultNovelCoverId) {
  const covers = readCustomDefaultNovelCovers();
  return covers.find((cover) => cover.id === id) ?? covers[0] ?? null;
}

export function getDefaultNovelCover(id: DefaultNovelCoverId = readDefaultNovelCoverId()) {
  if (id.startsWith(CUSTOM_DEFAULT_NOVEL_COVER_ID_PREFIX)) {
    const customCover = getCustomDefaultNovelCover(id);
    if (customCover) return customCover;
  }
  return (
    DEFAULT_NOVEL_COVERS.find((cover) => cover.id === id) ??
    DEFAULT_NOVEL_COVERS.find((cover) => cover.id === INITIAL_DEFAULT_NOVEL_COVER_ID)!
  );
}
