import { beforeEach, describe, expect, it } from 'vitest';

import {
  cleanupWorkbenchTransientAiDraftsOnClose,
  clearWorkbenchTransientAiDrafts,
  resetWorkbenchTransientAiDraftsForNewAppSession,
  writeKeepWorkbenchAiOutputs,
} from './workbenchTransientAiCleanup';

describe('clearWorkbenchTransientAiDrafts', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('clears temporary library AI input and output without deleting saved entries', () => {
    localStorage.setItem(
      'xinyuexia_workbench_settings_1_tab_configs_v1',
      JSON.stringify({
        角色: {
          selectedId: 'role-1',
          aiInput: '请优化一下',
          aiOutput: 'AI输出内容',
          aiResult: 'AI结果',
          aiSessions: [
            {
              id: '1',
              input: '脑洞要求',
              output: '脑洞输出',
              result: '脑洞结果',
              previewTitles: ['标题'],
              previewDrafts: ['草稿'],
              backgroundAiTaskId: 'task-1',
            },
          ],
        },
      }),
    );
    localStorage.setItem(
      'xinyuexia_workbench_settings_1',
      JSON.stringify([{ id: 'role-1', tab: '角色', title: '男主角', content: '正式人物设定' }]),
    );

    clearWorkbenchTransientAiDrafts();

    const configs = JSON.parse(localStorage.getItem('xinyuexia_workbench_settings_1_tab_configs_v1') ?? '{}');
    expect(configs.角色.selectedId).toBe('role-1');
    expect(configs.角色.aiInput).toBe('');
    expect(configs.角色.aiOutput).toBe('');
    expect(configs.角色.aiResult).toBe('');
    expect(configs.角色.aiSessions[0].input).toBe('');
    expect(configs.角色.aiSessions[0].output).toBe('');
    expect(configs.角色.aiSessions[0].result).toBe('');
    expect(configs.角色.aiSessions[0].previewTitles).toEqual([]);
    expect(JSON.parse(localStorage.getItem('xinyuexia_workbench_settings_1') ?? '[]')).toEqual([
      { id: 'role-1', tab: '角色', title: '男主角', content: '正式人物设定' },
    ]);
  });

  it('clears right AI panel sessions but keeps session metadata', () => {
    localStorage.setItem(
      'xinyuexia_workbench_ai_sessions_1',
      JSON.stringify({
        activeSessionId: 2,
        nextSessionId: 3,
        nextMessageId: 9,
        sessions: [
          {
            id: 2,
            input: '用户输入',
            output: 'AI输出',
            messages: [{ id: 8, role: 'user', content: '用户输入' }],
            linkChapter: true,
            hasSentChapterContext: true,
            backgroundTaskId: 'task-2',
            backgroundAssistantMessageId: 8,
          },
        ],
      }),
    );

    clearWorkbenchTransientAiDrafts();

    const stored = JSON.parse(localStorage.getItem('xinyuexia_workbench_ai_sessions_1') ?? '{}');
    expect(stored.activeSessionId).toBe(2);
    expect(stored.sessions[0].input).toBe('');
    expect(stored.sessions[0].output).toBe('');
    expect(stored.sessions[0].messages).toEqual([]);
    expect(stored.sessions[0].linkChapter).toBe(true);
    expect(stored.sessions[0].backgroundTaskId).toBeUndefined();
  });

  it('keeps AI output on close only when the user enables it', () => {
    const storageKey = 'xinyuexia_workbench_settings_1_tab_configs_v1';
    const seed = () =>
      localStorage.setItem(storageKey, JSON.stringify({ setting: { aiOutput: 'AI output', aiResult: 'result' } }));

    seed();
    cleanupWorkbenchTransientAiDraftsOnClose();
    expect(JSON.parse(localStorage.getItem(storageKey) ?? '{}').setting.aiOutput).toBe('');

    seed();
    writeKeepWorkbenchAiOutputs(true);
    cleanupWorkbenchTransientAiDraftsOnClose();
    expect(JSON.parse(localStorage.getItem(storageKey) ?? '{}').setting.aiOutput).toBe('AI output');
  });

  it('clears stale AI output before the React tree reads persisted state', () => {
    const storageKey = 'xinyuexia_workbench_ai_sessions_1';
    localStorage.setItem(storageKey, JSON.stringify({ sessions: [{ id: 1, output: 'stale output' }] }));
    localStorage.setItem('xinyuexia_background_ai_tasks_v1', JSON.stringify([{ id: 'task-1', output: 'stale' }]));
    localStorage.setItem('xinyuexia_workbench_settings_1_review_background_tasks_v2', JSON.stringify({ 1: { audit: 'task-1' } }));
    resetWorkbenchTransientAiDraftsForNewAppSession();
    expect(JSON.parse(localStorage.getItem(storageKey) ?? '{}').sessions[0].output).toBe('');
    expect(JSON.parse(localStorage.getItem('xinyuexia_background_ai_tasks_v1') ?? '[]')).toEqual([]);
    expect(localStorage.getItem('xinyuexia_workbench_settings_1_review_background_tasks_v2')).toBeNull();
  });
});
