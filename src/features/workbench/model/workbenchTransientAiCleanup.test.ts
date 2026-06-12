import { beforeEach, describe, expect, it } from 'vitest';

import { clearWorkbenchTransientAiDrafts } from './workbenchTransientAiCleanup';

describe('clearWorkbenchTransientAiDrafts', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('clears temporary library AI input and output without deleting saved entries', () => {
    localStorage.setItem('xinyuexia_workbench_settings_1_tab_configs_v1', JSON.stringify({
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
    }));
    localStorage.setItem('xinyuexia_workbench_settings_1', JSON.stringify([
      { id: 'role-1', tab: '角色', title: '男主角', content: '正式人物设定' },
    ]));

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
    localStorage.setItem('xinyuexia_workbench_ai_sessions_1', JSON.stringify({
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
    }));

    clearWorkbenchTransientAiDrafts();

    const stored = JSON.parse(localStorage.getItem('xinyuexia_workbench_ai_sessions_1') ?? '{}');
    expect(stored.activeSessionId).toBe(2);
    expect(stored.sessions[0].input).toBe('');
    expect(stored.sessions[0].output).toBe('');
    expect(stored.sessions[0].messages).toEqual([]);
    expect(stored.sessions[0].linkChapter).toBe(true);
    expect(stored.sessions[0].backgroundTaskId).toBeUndefined();
  });
});
