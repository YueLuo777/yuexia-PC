import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ModelItem } from '@/features/models/model/modelTypes';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import type { Chapter } from '@/features/workbench/model/workbenchTypes';
import { getBackgroundAiTasksSnapshot, resetBackgroundAiTasksForTests } from '@/shared/ai/backgroundAiTasks';
import { writeTextAuditCountdownSeconds } from '@/features/workbench/model/chapterAuditWorkflow';

import { useChapterReviewRequest } from './useChapterReviewRequest';

const callModelStreamMock = vi.hoisted(() => vi.fn());
vi.mock('@/features/models/services/callModel', () => ({ callModelStream: callModelStreamMock }));

const model = { id: 'model-1', name: '测试模型' } as unknown as ModelItem;
const prompt = {
  id: 'prompt-1',
  name: '审核',
  category: '审核',
  content: '剧情审核规则',
  textAuditContent: '文本审核规则',
  textAuditEnabled: true,
} as unknown as PromptItem;
const chapter = { id: 1, serialNumber: 1, title: '测试章节' } as unknown as Chapter;

function renderRequest() {
  return renderHook(() =>
    useChapterReviewRequest({
      reviewMode: 'audit',
      activeReviewState: { input: '', output: '', revisedDraft: '', requestLog: '' },
      updateReviewModeState: vi.fn(),
      isReviewAiLoading: false,
      setIsReviewAiLoading: vi.fn(),
      activeReviewChapter: chapter,
      activeReviewModel: model,
      activeReviewPrompt: prompt,
      activeReviewDetailOutline: { title: '第1章章纲', content: '章纲内容' } as never,
      activeReviewContent: '　　第一段。\n第二段。',
      activeReviewWordCount: 10,
      reviewAiInput: '',
      settingsStorageKey: 'audit-flow-test',
    }),
  );
}

describe('useChapterReviewRequest two-stage flow', () => {
  beforeEach(() => {
    localStorage.clear();
    resetBackgroundAiTasksForTests();
    callModelStreamMock.mockReset();
    writeTextAuditCountdownSeconds(0);
  });

  it('calls the model twice after plot approval and sends only numbered body context in stage two', async () => {
    callModelStreamMock
      .mockResolvedValueOnce('【剧情审核结论】通过\n【结果】通过')
      .mockResolvedValueOnce(
        '【文本审核结果】\n【结果】不通过\n【修改段落】\n【段落序号】第2段\n【修改后段落】第二段已修正。\n【修改原因】修正病句。',
      );
    const { result } = renderRequest();
    await act(async () => result.current.sendReviewAiMessage());

    await waitFor(() => expect(getBackgroundAiTasksSnapshot()[0]?.status).toBe('success'));
    expect(callModelStreamMock).toHaveBeenCalledTimes(2);
    expect(callModelStreamMock.mock.calls[0][0].prompt).toContain('本次请求只执行剧情审核');
    expect(callModelStreamMock.mock.calls[0][0].prompt).not.toContain('文本审核规则');
    expect(callModelStreamMock.mock.calls[1][0].prompt).toContain('文本审核规则');
    expect(callModelStreamMock.mock.calls[1][0].chapterContext).toContain('【第1段】');
    expect(callModelStreamMock.mock.calls[1][0].chapterContext).not.toContain('章纲内容');
    expect(getBackgroundAiTasksSnapshot()[0]?.output).toContain('status=complete');
  });

  it('stops after plot rejection and exposes the blocked stage', async () => {
    callModelStreamMock.mockResolvedValueOnce('【剧情审核结论】不通过\n【结果】不通过');
    const { result } = renderRequest();
    await act(async () => result.current.sendReviewAiMessage());

    await waitFor(() => expect(getBackgroundAiTasksSnapshot()[0]?.status).toBe('success'));
    expect(callModelStreamMock).toHaveBeenCalledTimes(1);
    expect(getBackgroundAiTasksSnapshot()[0]?.output).toContain('status=blocked');
  });
});
