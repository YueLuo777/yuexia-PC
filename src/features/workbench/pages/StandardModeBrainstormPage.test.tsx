import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const callModelStreamMock = vi.hoisted(() => vi.fn());

vi.mock('@/features/models/hooks/useModels', () => ({
  useModels: () => ({
    models: [],
    activeModel: {
      id: 'test-model',
      name: '测试模型',
      enabled: true,
      baseUrl: 'https://example.test',
      apiKey: 'test-key',
      model: 'test-model',
    },
  }),
}));

vi.mock('@/features/prompts/hooks/usePrompts', () => ({
  normalizePromptCategoryName: (value: string) => value,
  usePrompts: () => ({ prompts: [] }),
}));

vi.mock('@/features/models/services/callModel', () => ({
  callModelStream: callModelStreamMock,
}));

import { readBrainstormRecycleEntries } from '@/features/workbench/components/workbenchLibraryDataState';
import { getBrainstormEntryBody } from '@/features/workbench/components/workbenchLibraryAiText';
import { stringifySettingContent } from '@/features/workbench/components/workbenchStructuredSettings';
import {
  GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
  readWorkbenchLibraryEntries,
  type WorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';
import { StandardModeBrainstormPage } from '@/features/workbench/pages/StandardModeBrainstormPage';

function createEntry(id: string, title: string, body: string, serial: number): WorkbenchLibraryEntry {
  return {
    id,
    tab: '脑洞',
    title,
    content: stringifySettingContent({ type: '脑洞库', body }),
    updatedAt: '2026/7/26',
    brainstormSerialNumber: serial,
  };
}

const FIRST_ENTRY = createEntry('brainstorm-1', '第一个脑洞', '第一个脑洞的正文', 1);
const SECOND_ENTRY = createEntry('brainstorm-2', '第二个脑洞', '第二个脑洞的正文', 2);

describe('StandardModeBrainstormPage', () => {
  beforeEach(() => {
    callModelStreamMock.mockReset();
    callModelStreamMock.mockImplementation(async ({ onChunk, userContent }: { onChunk: (value: string) => void; userContent: string }) => {
      const content = userContent.includes('【修改要求】') ? '按要求修改后的脑洞' : 'AI生成的完整脑洞';
      onChunk(content);
      return content;
    });
    localStorage.clear();
    localStorage.setItem(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY, JSON.stringify([FIRST_ENTRY, SECOND_ENTRY]));
  });

  it('renames the selected brainstorm directly in the library', () => {
    render(<StandardModeBrainstormPage />);

    expect(screen.getByLabelText('脑洞名').closest('.xy-workbench-name-field')).toHaveStyle({ width: '148px' });
    fireEvent.click(screen.getByRole('button', { name: /第二个脑洞/ }));
    expect(screen.getByLabelText('脑洞预览内容')).toHaveValue('第二个脑洞的正文');
    fireEvent.change(screen.getByLabelText('脑洞名'), { target: { value: '重新设计的脑洞' } });

    expect(readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY).find((entry) => entry.id === SECOND_ENTRY.id)?.title).toBe(
      '重新设计的脑洞',
    );
    expect(screen.getByRole('button', { name: /重新设计的脑洞/ })).toBeInTheDocument();
    expect(screen.getByLabelText('脑洞名').closest('.xy-workbench-name-field')).toHaveStyle({ width: '164px' });
  });

  it('deletes a saved brainstorm into recycle data and selects the next entry', () => {
    render(<StandardModeBrainstormPage />);

    expect(screen.getByLabelText('脑洞预览内容')).toHaveValue('第一个脑洞的正文');
    fireEvent.click(screen.getByRole('button', { name: '删除该脑洞' }));

    expect(readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY)).toHaveLength(1);
    expect(readBrainstormRecycleEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY)[0]?.id).toBe(FIRST_ENTRY.id);
    expect(screen.getByLabelText('脑洞预览内容')).toHaveValue('第二个脑洞的正文');
  });

  it('uses compact grouped questions and one large other-requirements field', () => {
    render(<StandardModeBrainstormPage />);

    expect(screen.getByPlaceholderText('如都市、玄幻')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('如系统流、凡人流、天才流')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('如100万、200万')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('如吞噬系统、神豪系统')).toBeInTheDocument();
    expect(screen.getByLabelText('其他要求')).toBeInTheDocument();
    expect(screen.queryByLabelText('一次生成版本数')).not.toBeInTheDocument();
    expect(screen.queryByText('一次性生成X版脑洞')).not.toBeInTheDocument();
    expect(screen.queryByText('可输入1到10，生成后在中间区域切换各个版本。')).not.toBeInTheDocument();
    expect(screen.queryByText('保存为新脑洞')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('新脑洞名称')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '版本1' })).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('如都市、玄幻').closest('[class*="grid-cols-2"]')).toBeTruthy();
    expect(screen.getByPlaceholderText('如都市、玄幻')).toHaveClass('placeholder:text-[13px]');
    expect(screen.getByLabelText('其他要求')).toHaveClass('placeholder:text-[13px]');
  });

  it('generates one brainstorm, includes other requirements, and saves it automatically', async () => {
    render(<StandardModeBrainstormPage />);

    fireEvent.change(screen.getByLabelText('其他要求'), { target: { value: '开局冲突要明确' } });
    fireEvent.click(screen.getByRole('button', { name: '开始生成脑洞' }));

    await waitFor(() => expect(callModelStreamMock).toHaveBeenCalledTimes(1));
    expect(callModelStreamMock.mock.calls[0][0].userContent).toContain('其他要求：开局冲突要明确');
    expect(screen.getByLabelText('脑洞预览内容')).toHaveValue('AI生成的完整脑洞');
    const generatedEntry = readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY)[0];
    expect(generatedEntry?.title).toBe('未命名脑洞');
    expect(generatedEntry && getBrainstormEntryBody(generatedEntry)).toBe('AI生成的完整脑洞');
    expect(screen.getByRole('status')).toHaveTextContent('自动保存');
  });

  it('revises the selected brainstorm and keeps only the new content', async () => {
    render(<StandardModeBrainstormPage />);

    fireEvent.change(screen.getByLabelText('脑洞修改要求'), { target: { value: '强化冲突' } });
    fireEvent.keyDown(screen.getByLabelText('脑洞修改要求'), { key: 'Enter', ctrlKey: true });

    await waitFor(() => expect(callModelStreamMock).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText('脑洞预览内容')).toHaveValue('按要求修改后的脑洞');
    const revisedEntry = readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY).find(
      (entry) => entry.id === FIRST_ENTRY.id,
    );
    expect(revisedEntry && getBrainstormEntryBody(revisedEntry)).toBe('按要求修改后的脑洞');
    expect(screen.getByRole('status')).toHaveTextContent('自动保存');
  });
});
