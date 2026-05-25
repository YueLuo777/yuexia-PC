import type { MoonfallState } from '@/features/moonfall-settings/model/moonfallSettingTypes';
import {
  MOONFALL_STATE_KEY,
  normalizeMoonfallState,
  readMoonfallState,
} from '@/features/moonfall-settings/model/moonfallSettingStore';

const BACKUP_INDEX_KEY = 'xinyuexia_moonfall_setting_library_backup_index_v1';
const BACKUP_PREFIX = 'xinyuexia_moonfall_setting_library_backup_v1_';
const MAX_BACKUPS = 12;

export interface MoonfallBackupRecord {
  id: string;
  reason: string;
  createdAt: string;
  state: MoonfallState;
}

export interface MoonfallHydrationResult {
  state: MoonfallState;
  source: 'local' | 'database' | 'merged' | 'default';
  backedUp: boolean;
  databaseAvailable: boolean;
  message: string;
}

function nowIso() {
  return new Date().toISOString();
}

function countStatePayload(state: MoonfallState) {
  return (
    state.settings.length
    + state.sources.length
    + state.sourceChunks.length
    + state.relations.length
    + state.retrievalLogs.length
    + state.importTasks.length
  );
}

function isStateEmpty(state: MoonfallState) {
  return countStatePayload(state) === 0;
}

function stateSignature(state: MoonfallState) {
  return JSON.stringify(normalizeMoonfallState(state));
}

function isSameState(left: MoonfallState, right: MoonfallState) {
  return stateSignature(left) === stateSignature(right);
}

function timeValue(value?: string) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function itemTime(item: { createdAt?: string; updatedAt?: string }) {
  return Math.max(timeValue(item.updatedAt), timeValue(item.createdAt));
}

function mergeById<T extends { id: string; createdAt?: string; updatedAt?: string }>(localItems: T[], databaseItems: T[]) {
  const map = new Map<string, T>();
  databaseItems.forEach((item) => map.set(item.id, item));
  localItems.forEach((localItem) => {
    const databaseItem = map.get(localItem.id);
    if (!databaseItem || itemTime(localItem) >= itemTime(databaseItem)) {
      map.set(localItem.id, localItem);
    }
  });
  return Array.from(map.values());
}

export function mergeMoonfallStates(localState: MoonfallState, databaseState: MoonfallState) {
  const local = normalizeMoonfallState(localState);
  const database = normalizeMoonfallState(databaseState);
  const projects = mergeById(local.projects, database.projects);
  const activeProjectId = projects.some((project) => project.id === local.activeProjectId)
    ? local.activeProjectId
    : database.activeProjectId;

  return normalizeMoonfallState({
    projects,
    activeProjectId,
    sources: mergeById(local.sources, database.sources),
    sourceChunks: mergeById(local.sourceChunks, database.sourceChunks),
    settings: mergeById(local.settings, database.settings),
    relations: mergeById(local.relations, database.relations),
    retrievalLogs: mergeById(local.retrievalLogs, database.retrievalLogs).slice(0, 300),
    importTasks: mergeById(local.importTasks, database.importTasks).slice(0, 100),
    config: { ...database.config, ...local.config },
  });
}

function readBackupIndex() {
  try {
    const raw = localStorage.getItem(BACKUP_INDEX_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function writeBackupIndex(keys: string[]) {
  localStorage.setItem(BACKUP_INDEX_KEY, JSON.stringify(keys.slice(0, MAX_BACKUPS)));
}

export function createMoonfallBackup(state: MoonfallState, reason: string) {
  if (isStateEmpty(state)) return null;
  const record: MoonfallBackupRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    reason,
    createdAt: nowIso(),
    state: normalizeMoonfallState(state),
  };
  const key = `${BACKUP_PREFIX}${record.id}`;
  const nextIndex = [key, ...readBackupIndex()];
  localStorage.setItem(key, JSON.stringify(record));
  nextIndex.slice(MAX_BACKUPS).forEach((oldKey) => localStorage.removeItem(oldKey));
  writeBackupIndex(nextIndex);
  return record;
}

export function readMoonfallBackups() {
  return readBackupIndex().map((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as MoonfallBackupRecord;
      return {
        ...parsed,
        state: normalizeMoonfallState(parsed.state),
      };
    } catch {
      return null;
    }
  }).filter((item): item is MoonfallBackupRecord => Boolean(item));
}

function writeLocalMoonfallState(state: MoonfallState) {
  localStorage.setItem(MOONFALL_STATE_KEY, JSON.stringify(normalizeMoonfallState(state)));
}

async function writeDatabaseMoonfallState(state: MoonfallState) {
  if (!window.xinyuexiaDatabase?.writeMoonfallPostgres) {
    if (!window.xinyuexiaDatabase?.writeCollection) return false;
    const fallback = await window.xinyuexiaDatabase.writeCollection('moonfallSettings', [normalizeMoonfallState(state)]);
    return fallback.ok;
  }
  const result = await window.xinyuexiaDatabase.writeMoonfallPostgres(normalizeMoonfallState(state));
  return result.ok;
}

async function readDatabaseMoonfallState() {
  if (!window.xinyuexiaDatabase?.readMoonfallPostgres) {
    if (!window.xinyuexiaDatabase?.readCollection) return null;
    const fallback = await window.xinyuexiaDatabase.readCollection<unknown>('moonfallSettings');
    if (!fallback.ok || !fallback.exists || fallback.data.length === 0) return null;
    return normalizeMoonfallState(fallback.data[0]);
  }
  const result = await window.xinyuexiaDatabase.readMoonfallPostgres<unknown>();
  if (!result.ok || !result.exists || result.data.length === 0) return null;
  const first = result.data[0];
  if (first && typeof first === 'object' && 'state' in first) {
    return normalizeMoonfallState((first as { state?: unknown }).state);
  }
  return normalizeMoonfallState(first);
}

export async function persistMoonfallState(state: MoonfallState) {
  const next = normalizeMoonfallState(state);
  writeLocalMoonfallState(next);
  await writeDatabaseMoonfallState(next);
  return next;
}

export async function hydrateMoonfallStateFromDatabase(): Promise<MoonfallHydrationResult> {
  const localState = readMoonfallState();
  const databaseState = await readDatabaseMoonfallState();
  const databaseAvailable = Boolean(
    (window.xinyuexiaDatabase?.readMoonfallPostgres && window.xinyuexiaDatabase?.writeMoonfallPostgres)
    || (window.xinyuexiaDatabase?.readCollection && window.xinyuexiaDatabase?.writeCollection),
  );

  if (!databaseAvailable) {
    return {
      state: localState,
      source: isStateEmpty(localState) ? 'default' : 'local',
      backedUp: false,
      databaseAvailable,
      message: '当前运行环境没有数据库集合接口，继续使用本地缓存。',
    };
  }

  if (!databaseState) {
    await writeDatabaseMoonfallState(localState);
    return {
      state: localState,
      source: isStateEmpty(localState) ? 'default' : 'local',
      backedUp: false,
      databaseAvailable,
      message: '数据库暂无月落设定库数据，已把本地缓存同步过去。',
    };
  }

  if (isSameState(localState, databaseState)) {
    return {
      state: localState,
      source: isStateEmpty(localState) ? 'default' : 'local',
      backedUp: false,
      databaseAvailable,
      message: '月落设定库数据已同步。',
    };
  }

  if (isStateEmpty(localState) && !isStateEmpty(databaseState)) {
    writeLocalMoonfallState(databaseState);
    return {
      state: databaseState,
      source: 'database',
      backedUp: false,
      databaseAvailable,
      message: '已从数据库恢复月落设定库数据。',
    };
  }

  if (!isStateEmpty(localState) && isStateEmpty(databaseState)) {
    await writeDatabaseMoonfallState(localState);
    return {
      state: localState,
      source: 'local',
      backedUp: false,
      databaseAvailable,
      message: '数据库数据为空，已保留并同步本地月落设定库。',
    };
  }

  const merged = mergeMoonfallStates(localState, databaseState);
  const backedUp = !isSameState(localState, merged) && Boolean(createMoonfallBackup(localState, '合并数据库集合前自动备份本地月落设定库'));
  writeLocalMoonfallState(merged);
  await writeDatabaseMoonfallState(merged);
  return {
    state: merged,
    source: 'merged',
    backedUp,
    databaseAvailable,
    message: backedUp ? '已合并本地和数据库数据，并自动备份合并前的本地数据。' : '已合并本地和数据库数据。',
  };
}
