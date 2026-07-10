import type {
  WorkbenchLinkedContextItem,
  WorkbenchLinkedContextSource,
} from '@/features/workbench/components/WorkbenchAIPanel';
import type { WorkbenchContextChapterPair } from '@/features/workbench/components/WorkbenchContextChapterSummaryList';
import type { WorkbenchLibraryEntry } from './workbenchLibraryStorage';

export function normalizeContextSource(tab: string): WorkbenchLinkedContextSource | null {
  const value = tab.trim();
  if (!value) return null;
  if (/角色|角色库|瑙掕壊/.test(value)) return 'role';
  if (/章纲|细纲|章节细纲|章节章纲|绔犵翰|缁嗙翰/.test(value)) return 'outline';
  if (/梗概|摘要|概要|章节梗概|章节摘要|章节概要|卷梗概|卷摘要|卷概要|姒傝|鍗锋/.test(value)) return 'summary';
  if (/设定|设定库|大纲|澶х翰|璁惧畾/.test(value)) return 'setting';
  return null;
}

export function isContextOutlineEntry(entry: WorkbenchLibraryEntry) {
  return normalizeContextSource(`${entry.tab} ${entry.title} ${entry.type ?? ''}`) === 'outline';
}

export function isContextSummaryEntry(entry: WorkbenchLibraryEntry) {
  return normalizeContextSource(`${entry.tab} ${entry.title} ${entry.type ?? ''}`) === 'summary';
}

export function getContextWordCount(text: string) {
  return text.replace(/\s/g, '').length;
}

export function hasContextContent(item: WorkbenchLinkedContextItem | null | undefined) {
  return Boolean(item && getContextWordCount(item.content) > 0);
}

export function getContextItemsWordCount(items: WorkbenchLinkedContextItem[], source?: WorkbenchLinkedContextSource) {
  return items
    .filter((item) => !source || item.source === source)
    .reduce((sum, item) => sum + getContextWordCount(item.content), 0);
}

export function getPreferredChapterNarrativeItem(row: WorkbenchContextChapterPair) {
  if (hasContextContent(row.chapterItem)) return row.chapterItem;
  if (hasContextContent(row.summaryItem)) return row.summaryItem;
  return null;
}

export function keepExclusiveChapterNarrativeItems(
  rows: WorkbenchContextChapterPair[],
  items: WorkbenchLinkedContextItem[],
) {
  const ids = new Set(items.map((item) => item.id));
  rows.forEach((row) => {
    if (!row.summaryItem || !ids.has(row.chapterItem.id) || !ids.has(row.summaryItem.id)) return;
    const preferred = getPreferredChapterNarrativeItem(row);
    if (preferred?.id === row.summaryItem.id) ids.delete(row.chapterItem.id);
    else ids.delete(row.summaryItem.id);
  });
  return items.filter((item) => ids.has(item.id));
}

export function mergeContextItems(items: WorkbenchLinkedContextItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function getContextEntryGroup(tab: string, type?: string) {
  return type?.trim() || tab.trim() || '未分类';
}

export function parseContextSettingContent(content: string) {
  try {
    const parsed = JSON.parse(content) as Partial<{ type: string; body: string }>;
    const parsedType =
      parsed.type === '境界体系' || parsed.type === '等级体系'
        ? '成长体系'
        : parsed.type === '主线剧情'
          ? '剧情规划'
          : parsed.type;
    return { type: parsedType || '未分类', body: parsed.body || '' };
  } catch {
    return { type: '未分类', body: content || '' };
  }
}

const CONTEXT_ROLE_STATE_FIELDS = [
  ['currentSituation', '当前处境'],
  ['currentGoal', '当前目标'],
  ['identityState', '身份状态'],
  ['abilityState', '能力状态'],
  ['resourceState', '资源状态'],
  ['relationshipState', '关系状态'],
  ['informationState', '信息状态'],
  ['plotMarkers', '剧情标记'],
  ['hardConstraints', '硬性约束'],
] as const;

function formatContextRoleStateSettings(value: unknown, legacyStatus = '') {
  if (!value || typeof value !== 'object') return legacyStatus.trim();
  const record = value as Partial<Record<(typeof CONTEXT_ROLE_STATE_FIELDS)[number][0], unknown>>;
  const text = CONTEXT_ROLE_STATE_FIELDS.map(([key, label]) => {
    const fieldValue = record[key];
    return typeof fieldValue === 'string' && fieldValue.trim() ? `${label}：${fieldValue.trim()}` : '';
  })
    .filter(Boolean)
    .join('\n\n');
  return text || legacyStatus.trim();
}

export function parseContextRoleStatusContent(content: string) {
  try {
    const parsed = JSON.parse(content) as Partial<{
      type: string;
      lifeStatus: string;
      status: string;
      stateSettings: unknown;
    }>;
    const stateText = formatContextRoleStateSettings(parsed.stateSettings, parsed.status);
    const body = [parsed.lifeStatus ? `生存状态：${parsed.lifeStatus}` : '', stateText ? `状态设定：${stateText}` : '']
      .filter(Boolean)
      .join('\n');
    return { type: parsed.type || '角色状态', body };
  } catch {
    return { type: '角色状态', body: extractContextStatusRecord(content) };
  }
}

export function parseContextRoleContent(content: string) {
  try {
    const parsed = JSON.parse(content) as Partial<{
      type: string;
      lifeStatus: string;
      baseSetting: string;
      stateSettings: unknown;
      personality: string;
      background: string;
      status: string;
    }>;
    const legacyBaseSetting = [
      parsed.personality?.trim() ? `人物设定：${parsed.personality.trim()}` : '',
      parsed.background?.trim() ? parsed.background.trim() : '',
    ]
      .filter(Boolean)
      .join('\n\n');
    const baseSetting = parsed.baseSetting?.trim() || legacyBaseSetting;
    const stateText = formatContextRoleStateSettings(parsed.stateSettings, parsed.status);
    const body = [
      parsed.lifeStatus ? `生存状态：${parsed.lifeStatus}` : '',
      baseSetting ? `基础设定：${baseSetting}` : '',
      stateText ? `状态设定：${stateText}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
    return { type: parsed.type || '人物设定', body: body || content };
  } catch {
    return { type: '人物设定', body: content || '' };
  }
}

export function orderContextEntriesByType(
  entries: WorkbenchLibraryEntry[],
  typeOrder: string[],
  getType: (entry: WorkbenchLibraryEntry) => string,
  options?: { pinnedFirst?: boolean },
) {
  const normalizedOrder = [...typeOrder, ...entries.map(getType)]
    .map((type) => type.trim() || '未分类')
    .filter((type, index, source) => source.indexOf(type) === index);
  return normalizedOrder.flatMap((type) =>
    entries
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => (getType(entry).trim() || '未分类') === type)
      .sort((left, right) => {
        if (options?.pinnedFirst) {
          const leftPinned = typeof left.entry.pinnedAt === 'number';
          const rightPinned = typeof right.entry.pinnedAt === 'number';
          if (leftPinned && rightPinned) return (left.entry.pinnedAt ?? 0) - (right.entry.pinnedAt ?? 0);
          if (leftPinned) return -1;
          if (rightPinned) return 1;
        }
        return left.index - right.index;
      })
      .map(({ entry }) => entry),
  );
}

export function extractContextStatusRecord(content: string) {
  const marker = '【状态记录】';
  const markerIndex = content.indexOf(marker);
  if (markerIndex >= 0) return content.slice(markerIndex).trim();
  return (
    content
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean)
      .filter((block) => /状态|变化|当前|进度|持有|关系|立场/.test(block))
      .join('\n\n')
      .trim() || content
  );
}

export function isContextStatusCandidate(tab: string, type?: string, title?: string, content?: string) {
  return /状态|状态记录|人物状态|角色状态|道具状态|势力状态|关系变化|进度/.test(
    `${tab} ${type ?? ''} ${title ?? ''} ${content ?? ''}`,
  );
}

export function getContextEntrySerial(title: string) {
  const chapterMatch = title.match(/第\s*(\d+)\s*章/);
  if (chapterMatch?.[1]) return Number.parseInt(chapterMatch[1], 10);
  const numberMatch = title.match(/\d+/);
  return numberMatch?.[0] ? Number.parseInt(numberMatch[0], 10) : null;
}
