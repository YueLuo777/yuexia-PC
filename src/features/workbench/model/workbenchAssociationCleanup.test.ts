import { beforeEach, describe, expect, it } from 'vitest';

import {
  ASSOCIATED_CHAPTERS_KEY,
  KEEP_WORKBENCH_ASSOCIATIONS_KEY,
  WORKBENCH_ASSOCIATION_SESSION_RESET_KEY,
  bindWorkbenchAssociationCloseCleanup,
  cleanupWorkbenchAssociationsOnClose,
  getWorkbenchAssociationRuntimeId,
  readWorkbenchLinkedContextItems,
  resetWorkbenchAssociationsForNewAppSession,
  writeKeepWorkbenchAssociations,
  writeWorkbenchLinkedContextItems,
} from './workbenchAssociationCleanup';

describe('workbench association session cleanup', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
  });

  it('clears persisted association state at the start of a new app session', () => {
    localStorage.setItem(ASSOCIATED_CHAPTERS_KEY, JSON.stringify([1, 2]));
    localStorage.setItem('xinyuexia_workbench_linked_context_1', JSON.stringify([{ id: 'ctx-1' }]));
    localStorage.setItem('xinyuexia_script_editor_linked_novel', '12');
    localStorage.setItem('sev2_linked_novel', '12');
    localStorage.setItem('script_editor_linked_novel', '12');
    localStorage.setItem('xinyuexia_script_editor_linked_novel_v2_3', '12');
    localStorage.setItem(
      'xinyuexia_workbench_ai_sessions_1',
      JSON.stringify({
        activeSessionId: 1,
        nextSessionId: 2,
        nextMessageId: 3,
        sessions: [
          {
            id: 1,
            input: '保留输入',
            contextTitle: '关联资料',
            contextText: '关联资料内容',
            linkedItems: [{ id: 'ctx-1', source: 'setting', group: '作品设定', title: '基础设定', content: '资料' }],
            linkChapter: true,
            hasSentChapterContext: true,
          },
        ],
      }),
    );
    localStorage.setItem(
      'xinyuexia_workbench_settings_1_tab_configs_v1',
      JSON.stringify({
        setting: {
          loadedBrainstormId: 'brainstorm-1',
          loadedBrainstormTitle: '脑洞',
          loadedBrainstormText: '脑洞内容',
          linkedOtherSettingIds: ['setting-1'],
          settingLinkSource: 'other',
          detailOutlineReaderTouched: true,
          detailOutlineReaderSettingIds: ['setting-1'],
          detailOutlineReaderRoleIds: ['role-1'],
          detailOutlineReaderOutlineIds: ['outline-1'],
          unrelated: 'keep',
        },
      }),
    );
    localStorage.setItem('xinyuexia_unrelated_key', 'keep');

    resetWorkbenchAssociationsForNewAppSession();

    expect(localStorage.getItem(ASSOCIATED_CHAPTERS_KEY)).toBeNull();
    expect(localStorage.getItem('xinyuexia_workbench_linked_context_1')).toBeNull();
    expect(localStorage.getItem('xinyuexia_script_editor_linked_novel')).toBeNull();
    expect(localStorage.getItem('sev2_linked_novel')).toBeNull();
    expect(localStorage.getItem('script_editor_linked_novel')).toBeNull();
    expect(localStorage.getItem('xinyuexia_script_editor_linked_novel_v2_3')).toBeNull();
    expect(localStorage.getItem('xinyuexia_unrelated_key')).toBe('keep');

    const aiSessions = JSON.parse(localStorage.getItem('xinyuexia_workbench_ai_sessions_1') ?? '{}');
    expect(aiSessions.sessions[0]).toMatchObject({
      input: '保留输入',
      contextTitle: '',
      contextText: '',
      linkedItems: [],
      linkChapter: false,
      hasSentChapterContext: false,
    });

    const configs = JSON.parse(localStorage.getItem('xinyuexia_workbench_settings_1_tab_configs_v1') ?? '{}');
    expect(configs.setting).toMatchObject({
      associationSessionId: null,
      loadedBrainstormId: null,
      loadedBrainstormTitle: '',
      loadedBrainstormText: '',
      linkedOtherSettingIds: [],
      settingLinkSource: null,
      detailOutlineReaderSessionId: null,
      detailOutlineReaderTouched: false,
      detailOutlineReaderSettingIds: [],
      detailOutlineReaderRoleIds: [],
      detailOutlineReaderOutlineIds: [],
      unrelated: 'keep',
    });
    expect(sessionStorage.getItem(WORKBENCH_ASSOCIATION_SESSION_RESET_KEY)).toBe('1');
  });

  it('still clears associations when a stale startup marker survived', () => {
    sessionStorage.setItem(WORKBENCH_ASSOCIATION_SESSION_RESET_KEY, '1');
    localStorage.setItem(ASSOCIATED_CHAPTERS_KEY, JSON.stringify([1]));
    localStorage.setItem('xinyuexia_workbench_linked_context_1', JSON.stringify([{ id: 'ctx-1' }]));

    resetWorkbenchAssociationsForNewAppSession();

    expect(localStorage.getItem(ASSOCIATED_CHAPTERS_KEY)).toBeNull();
    expect(localStorage.getItem('xinyuexia_workbench_linked_context_1')).toBeNull();
  });

  it('keeps every association and carries runtime-scoped links into a new session when enabled', () => {
    writeKeepWorkbenchAssociations(true);
    localStorage.setItem(ASSOCIATED_CHAPTERS_KEY, JSON.stringify([1, 2]));
    localStorage.setItem(
      'xinyuexia_workbench_linked_context_1',
      JSON.stringify({
        associationSessionId: 'older-runtime',
        items: [
          {
            id: 'ctx-1',
            source: 'setting',
            group: '作品设定',
            title: '核心设定',
            content: '保留内容',
          },
        ],
      }),
    );
    localStorage.setItem(
      'xinyuexia_workbench_settings_1_tab_configs_v1',
      JSON.stringify({
        setting: {
          associationSessionId: 'older-runtime',
          loadedBrainstormId: 'brainstorm-1',
          linkedOtherSettingIds: ['setting-1'],
          detailOutlineReaderSessionId: 'older-runtime',
          detailOutlineReaderTouched: true,
          detailOutlineReaderSettingIds: [],
          detailOutlineReaderRoleIds: [],
          detailOutlineReaderOutlineIds: ['outline-1'],
        },
      }),
    );
    localStorage.setItem(
      'xinyuexia_workbench_ai_sessions_1',
      JSON.stringify({ sessions: [{ id: 1, linkedItems: [{ id: 'ctx-1' }], linkChapter: true }] }),
    );
    localStorage.setItem('xinyuexia_script_editor_linked_novel_v2_3', '12');

    resetWorkbenchAssociationsForNewAppSession();

    expect(localStorage.getItem(KEEP_WORKBENCH_ASSOCIATIONS_KEY)).toBe('1');
    expect(JSON.parse(localStorage.getItem(ASSOCIATED_CHAPTERS_KEY) ?? '[]')).toEqual([1, 2]);
    expect(readWorkbenchLinkedContextItems(1)).toEqual([
      {
        id: 'ctx-1',
        source: 'setting',
        group: '作品设定',
        title: '核心设定',
        content: '保留内容',
      },
    ]);
    const envelope = JSON.parse(localStorage.getItem('xinyuexia_workbench_linked_context_1') ?? '{}');
    const configs = JSON.parse(localStorage.getItem('xinyuexia_workbench_settings_1_tab_configs_v1') ?? '{}');
    expect(envelope.associationSessionId).toBe(getWorkbenchAssociationRuntimeId());
    expect(configs.setting.associationSessionId).toBe(getWorkbenchAssociationRuntimeId());
    expect(configs.setting.detailOutlineReaderSessionId).toBe(getWorkbenchAssociationRuntimeId());
    expect(configs.setting.detailOutlineReaderOutlineIds).toEqual(['outline-1']);
    expect(JSON.parse(localStorage.getItem('xinyuexia_workbench_ai_sessions_1') ?? '{}').sessions[0]).toMatchObject({
      linkedItems: [{ id: 'ctx-1' }],
      linkChapter: true,
    });
    expect(localStorage.getItem('xinyuexia_script_editor_linked_novel_v2_3')).toBe('12');
  });

  it('ignores linked context saved by an older app runtime', () => {
    localStorage.setItem(
      'xinyuexia_workbench_linked_context_1',
      JSON.stringify([
        {
          id: 'ctx-1',
          source: 'setting',
          group: '作品设定',
          title: '核心设定',
          content: '旧关联',
        },
      ]),
    );

    expect(readWorkbenchLinkedContextItems(1)).toEqual([]);
  });

  it('reads linked context written during the current runtime', () => {
    writeWorkbenchLinkedContextItems(1, [
      {
        id: 'ctx-1',
        source: 'setting',
        group: '作品设定',
        title: '核心设定',
        content: '当前关联',
      },
    ]);

    const stored = JSON.parse(localStorage.getItem('xinyuexia_workbench_linked_context_1') ?? '{}');
    expect(stored.associationSessionId).toBe(getWorkbenchAssociationRuntimeId());
    expect(readWorkbenchLinkedContextItems(1)).toEqual([
      {
        id: 'ctx-1',
        source: 'setting',
        group: '作品设定',
        title: '核心设定',
        content: '当前关联',
      },
    ]);
  });

  it('clears associations when the page is closed', () => {
    const dispose = bindWorkbenchAssociationCloseCleanup();
    localStorage.setItem(ASSOCIATED_CHAPTERS_KEY, JSON.stringify([1]));

    window.dispatchEvent(new Event('pagehide'));

    expect(localStorage.getItem(ASSOCIATED_CHAPTERS_KEY)).toBeNull();
    dispose();
  });

  it('keeps associations when the page closes and keep association is enabled', () => {
    writeKeepWorkbenchAssociations(true);
    const dispose = bindWorkbenchAssociationCloseCleanup();
    localStorage.setItem(ASSOCIATED_CHAPTERS_KEY, JSON.stringify([1]));

    window.dispatchEvent(new Event('pagehide'));

    expect(JSON.parse(localStorage.getItem(ASSOCIATED_CHAPTERS_KEY) ?? '[]')).toEqual([1]);
    dispose();
  });

  it('clears associations synchronously before the desktop close command', () => {
    localStorage.setItem(ASSOCIATED_CHAPTERS_KEY, JSON.stringify([1]));
    cleanupWorkbenchAssociationsOnClose();
    expect(localStorage.getItem(ASSOCIATED_CHAPTERS_KEY)).toBeNull();

    writeKeepWorkbenchAssociations(true);
    localStorage.setItem(ASSOCIATED_CHAPTERS_KEY, JSON.stringify([2]));
    cleanupWorkbenchAssociationsOnClose();
    expect(JSON.parse(localStorage.getItem(ASSOCIATED_CHAPTERS_KEY) ?? '[]')).toEqual([2]);
  });

  it('does not treat a temporarily hidden desktop window as closing the software', () => {
    const dispose = bindWorkbenchAssociationCloseCleanup();
    localStorage.setItem(ASSOCIATED_CHAPTERS_KEY, JSON.stringify([1]));
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });

    document.dispatchEvent(new Event('visibilitychange'));

    expect(JSON.parse(localStorage.getItem(ASSOCIATED_CHAPTERS_KEY) ?? '[]')).toEqual([1]);
    dispose();
  });
});
