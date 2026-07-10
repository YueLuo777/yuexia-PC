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
    state.settings.length +
    state.sources.length +
    state.sourceChunks.length +
    state.relations.length +
    state.retrievalLogs.length +
    state.importTasks.length
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

function mergeById<T extends { id: string; createdAt?: string; updatedAt?: string }>(
  localItems: T[],
  databaseItems: T[],
) {
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
  return readBackupIndex()
    .map((key) => {
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
    })
    .filter((item): item is MoonfallBackupRecord => Boolean(item));
}

function writeLocalMoonfallState(state: MoonfallState) {
  localStorage.setItem(MOONFALL_STATE_KEY, JSON.stringify(normalizeMoonfallState(state)));
}

export async function persistMoonfallState(state: MoonfallState) {
  const next = normalizeMoonfallState(state);
  writeLocalMoonfallState(next);
  return next;
}

export async function hydrateMoonfallStateFromDatabase(): Promise<MoonfallHydrationResult> {
  const localState = readMoonfallState();
  return {
    state: localState,
    source: isStateEmpty(localState) ? 'default' : 'local',
    backedUp: false,
    databaseAvailable: false,
    message: '向量数据库已停用，继续使用本地缓存。',
  };
}
