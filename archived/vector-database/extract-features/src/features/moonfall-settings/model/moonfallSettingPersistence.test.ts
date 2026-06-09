import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MoonfallReviewItem, MoonfallState } from './moonfallSettingTypes';
import {
  createSettingFromReview,
  MOONFALL_STATE_KEY,
  normalizeMoonfallState,
} from './moonfallSettingStore';
import {
  createMoonfallBackup,
  hydrateMoonfallStateFromDatabase,
  mergeMoonfallStates,
  persistMoonfallState,
  readMoonfallBackups,
} from './moonfallSettingPersistence';

function reviewDraft(title: string): MoonfallReviewItem {
  return {
    id: `review-${title}`,
    selected: true,
    title,
    category: '世界观',
    subcategory: '',
    tags: [],
    keywords: [],
    summary: title,
    originalText: title,
    organizedText: title,
    relatedItems: [],
    status: '已整理',
    confidence: 0.9,
  };
}

function makeState(id: string, title: string, updatedAt: string): MoonfallState {
  const state = normalizeMoonfallState({});
  const setting = {
    ...createSettingFromReview('project-a', reviewDraft(title)),
    id,
    updatedAt,
  };
  return {
    ...state,
    projects: [{
      id: 'project-a',
      userId: 'local-user',
      name: '测试项目',
      description: '',
      createdAt: updatedAt,
      updatedAt,
    }],
    activeProjectId: 'project-a',
    settings: [setting],
  };
}

describe('moonfallSettingPersistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('merges local and database states without dropping either side', () => {
    const local = makeState('local-setting', '本地设定', '2026-05-25T01:00:00.000Z');
    const database = makeState('database-setting', '数据库设定', '2026-05-25T02:00:00.000Z');

    const merged = mergeMoonfallStates(local, database);

    expect(merged.settings.map((item) => item.id).sort()).toEqual(['database-setting', 'local-setting']);
  });

  it('keeps the newer version when the same setting exists on both sides', () => {
    const local = makeState('same-setting', '本地新版', '2026-05-25T03:00:00.000Z');
    const database = makeState('same-setting', '数据库旧版', '2026-05-25T02:00:00.000Z');

    const merged = mergeMoonfallStates(local, database);

    expect(merged.settings).toHaveLength(1);
    expect(merged.settings[0].title).toBe('本地新版');
  });

  it('creates and reads local backups', () => {
    const state = makeState('backup-setting', '备份设定', '2026-05-25T01:00:00.000Z');

    const backup = createMoonfallBackup(state, '测试备份');
    const backups = readMoonfallBackups();

    expect(backup?.reason).toBe('测试备份');
    expect(backups).toHaveLength(1);
    expect(backups[0].state.settings[0].id).toBe('backup-setting');
  });

  it('falls back to local state when database APIs are unavailable', async () => {
    const local = makeState('local-only', '本地设定', '2026-05-25T01:00:00.000Z');
    localStorage.setItem(MOONFALL_STATE_KEY, JSON.stringify(local));

    const result = await hydrateMoonfallStateFromDatabase();

    expect(result.databaseAvailable).toBe(false);
    expect(result.source).toBe('local');
    expect(result.state.settings[0].id).toBe('local-only');
  });

  it('keeps default state when local state is empty', async () => {
    const result = await hydrateMoonfallStateFromDatabase();

    expect(result.databaseAvailable).toBe(false);
    expect(result.source).toBe('default');
    expect(result.state.settings).toEqual([]);
  });

  it('persists to local cache only', async () => {
    const state = makeState('persisted', '持久化设定', '2026-05-25T01:00:00.000Z');

    await persistMoonfallState(state);

    expect(JSON.parse(localStorage.getItem(MOONFALL_STATE_KEY) ?? '{}').settings[0].id).toBe('persisted');
  });
});
