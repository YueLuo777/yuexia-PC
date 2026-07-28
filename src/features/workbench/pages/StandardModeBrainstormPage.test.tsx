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
  BRAINSTORM_CATEGORY_STORAGE_KEY,
  BRAINSTORM_UNCATEGORIZED_ID,
} from '@/features/workbench/model/standardModeBrainstormCategories';
import { STANDARD_BRAINSTORM_PREVIEW_FONT_SIZE_STORAGE_KEY } from '@/features/workbench/model/standardModeBrainstormPreferences';
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

    expect(screen.queryByRole('button', { name: '关联到当前作品' })).not.toBeInTheDocument();
    const copyButton = screen.getByRole('button', { name: '复制脑洞' });
    const duplicateButton = screen.getByRole('button', { name: '创建脑洞副本' });
    expect(copyButton).toHaveClass('border-[#BFC8D2]');
    expect(copyButton.parentElement).toBe(duplicateButton.parentElement);
    expect(copyButton.parentElement).toHaveAttribute('data-brainstorm-library-copy-actions', 'true');
    const deleteButton = screen.getByRole('button', { name: '删除当前脑洞' });
    const addCategoryButton = screen.getByRole('button', { name: '新增脑洞分类' });
    expect(deleteButton).toHaveClass('border-red-300');
    expect(deleteButton.parentElement).toBe(addCategoryButton.parentElement);
    expect(deleteButton.parentElement).toHaveAttribute('data-brainstorm-sidebar-actions', 'true');
    expect(deleteButton.closest('[data-standard-brainstorm-sidebar="true"]')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('搜索脑洞')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /脑洞回收站/ })).toHaveClass(
      'h-11',
      'rounded-xl',
      'border-red-100',
      'bg-red-50',
    );
    expect(screen.getByRole('button', { name: /脑洞回收站/ })).toHaveTextContent('0');
    expect(screen.getByRole('button', { name: /未分类/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText('脑洞名').closest('[data-brainstorm-title-field="true"]')).toHaveStyle({ width: '148px' });
    expect(screen.getByLabelText('脑洞名')).toHaveClass('border-[#BFC8D2]');
    expect(screen.getByLabelText('脑洞预览内容')).toHaveClass('border-[#BFC8D2]', 'rounded-md');
    expect(screen.getByText('脑洞名')).toHaveClass('text-sm');
    expect(screen.getByText('脑洞预览')).toHaveClass('text-sm');
    expect(screen.getByLabelText('脑洞修改要求').closest('.xy-floating-field')).toHaveClass(
      'xy-floating-ai',
      'xy-floating-with-inline-actions',
      'xy-brainstorm-ai-input',
    );
    expect(document.querySelector('[data-brainstorm-preview-field="true"]')).toHaveClass('flex-1');
    expect(document.querySelector('[data-brainstorm-revision-field="professional-inline-input"]')).toContainElement(
      screen.getByRole('button', { name: '发送修改要求' }),
    );
    expect(screen.getByText('创建时间')).toBeInTheDocument();
    expect(screen.getByText('暂无记录')).toBeInTheDocument();
    expect(screen.getByText('最近修改')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /第一个脑洞/ })).toHaveClass('border-[#078FAE]');
    expect(screen.getByRole('button', { name: /第二个脑洞/ })).toHaveClass('bg-white/70');
    expect(screen.getByRole('button', { name: /第二个脑洞/ })).toHaveClass('border-transparent');
    fireEvent.click(screen.getByRole('button', { name: /第二个脑洞/ }));
    expect(screen.getByLabelText('脑洞预览内容')).toHaveValue('第二个脑洞的正文');
    fireEvent.change(screen.getByLabelText('脑洞名'), { target: { value: '重新设计的脑洞' } });

    expect(readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY).find((entry) => entry.id === SECOND_ENTRY.id)?.title).toBe(
      '重新设计的脑洞',
    );
    expect(screen.getByRole('button', { name: /重新设计的脑洞/ })).toBeInTheDocument();
    expect(screen.getByLabelText('脑洞名').closest('[data-brainstorm-title-field="true"]')).toHaveStyle({ width: '164px' });
  });

  it('orders brainstorms by ascending serial number regardless of storage order', () => {
    localStorage.setItem(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY, JSON.stringify([SECOND_ENTRY, FIRST_ENTRY]));
    render(<StandardModeBrainstormPage />);

    const firstButton = screen.getByRole('button', { name: /第一个脑洞/ });
    const secondButton = screen.getByRole('button', { name: /第二个脑洞/ });
    expect(firstButton.compareDocumentPosition(secondButton)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(firstButton).toHaveTextContent('1');
    expect(secondButton).toHaveTextContent('2');
  });

  it('stores the selected brainstorm before continuing to the setting flow', () => {
    const onCreateSettings = vi.fn();
    render(<StandardModeBrainstormPage novelId="42" onCreateSettings={onCreateSettings} />);

    fireEvent.click(screen.getByRole('button', { name: '根据此脑洞生成设定' }));

    expect(JSON.parse(localStorage.getItem('xinyuexia_standard_brainstorm_link_42') ?? 'null')).toMatchObject({
      title: '第一个脑洞',
      content: '第一个脑洞的正文',
    });
    expect(onCreateSettings).toHaveBeenCalledTimes(1);
  });

  it('creates brainstorm categories and moves entries from uncategorized', () => {
    render(<StandardModeBrainstormPage />);

    expect(document.querySelector(`[data-brainstorm-category-id="${BRAINSTORM_UNCATEGORIZED_ID}"]`)).toHaveTextContent(
      '未分类',
    );
    fireEvent.click(screen.getByRole('button', { name: '新增脑洞分类' }));
    fireEvent.change(screen.getByLabelText('分类名称'), { target: { value: '玄幻脑洞' } });
    fireEvent.click(screen.getByRole('button', { name: '新建分类' }));

    const storedCategories = JSON.parse(localStorage.getItem(BRAINSTORM_CATEGORY_STORAGE_KEY) ?? '[]') as Array<{
      id: string;
      name: string;
    }>;
    const fantasyCategory = storedCategories.find((category) => category.name === '玄幻脑洞');
    expect(fantasyCategory).toBeDefined();
    expect(screen.getByRole('button', { name: /玄幻脑洞/ })).toBeInTheDocument();

    fireEvent.contextMenu(screen.getByRole('button', { name: /第二个脑洞/ }), { clientX: 80, clientY: 160 });
    fireEvent.click(screen.getByRole('button', { name: '移动到玄幻脑洞' }));

    const movedEntry = readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY).find(
      (entry) => entry.id === SECOND_ENTRY.id,
    );
    expect(movedEntry?.brainstormCategoryId).toBe(fantasyCategory?.id);
    expect(document.querySelector(`[data-brainstorm-category-id="${fantasyCategory?.id}"]`)).toContainElement(
      document.querySelector(`[data-brainstorm-entry-id="${SECOND_ENTRY.id}"]`),
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /玄幻脑洞/ }), { clientX: 80, clientY: 120 });
    fireEvent.click(screen.getByRole('button', { name: '删除分类' }));
    fireEvent.click(screen.getByRole('button', { name: '删除分类' }));
    expect(readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY).find(
      (entry) => entry.id === SECOND_ENTRY.id,
    )?.brainstormCategoryId).toBe(BRAINSTORM_UNCATEGORIZED_ID);
    expect(screen.queryByRole('button', { name: /玄幻脑洞/ })).not.toBeInTheDocument();
    expect(document.querySelector(`[data-brainstorm-category-id="${BRAINSTORM_UNCATEGORIZED_ID}"]`)).toContainElement(
      document.querySelector(`[data-brainstorm-entry-id="${SECOND_ENTRY.id}"]`),
    );
  });

  it('uses the shared preview font tool and restores its saved size', () => {
    const firstRender = render(<StandardModeBrainstormPage />);
    const fontSizeInput = screen.getByRole('textbox', { name: '脑洞预览字号' });

    expect(fontSizeInput).toHaveValue('15');
    expect(screen.getByLabelText('脑洞预览内容')).toHaveStyle({ fontSize: '15px' });
    expect(document.querySelector('[data-brainstorm-preview-toolbar="true"]')).toContainElement(
      fontSizeInput.closest('.xy-font-size-stepper'),
    );
    fireEvent.click(screen.getByTitle('放大字号'));
    expect(fontSizeInput).toHaveValue('16');
    expect(screen.getByLabelText('脑洞预览内容')).toHaveStyle({ fontSize: '16px' });
    expect(localStorage.getItem(STANDARD_BRAINSTORM_PREVIEW_FONT_SIZE_STORAGE_KEY)).toBe('16');

    firstRender.unmount();
    render(<StandardModeBrainstormPage />);
    expect(screen.getByRole('textbox', { name: '脑洞预览字号' })).toHaveValue('16');
  });

  it('deletes a saved brainstorm into recycle data and selects the next entry', () => {
    render(<StandardModeBrainstormPage />);

    expect(screen.getByLabelText('脑洞预览内容')).toHaveValue('第一个脑洞的正文');
    fireEvent.click(screen.getByRole('button', { name: '删除当前脑洞' }));
    fireEvent.click(screen.getByRole('button', { name: '确认删除' }));

    expect(readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY)).toHaveLength(1);
    expect(readBrainstormRecycleEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY)[0]?.id).toBe(FIRST_ENTRY.id);
    expect(screen.getByLabelText('脑洞预览内容')).toHaveValue('第二个脑洞的正文');
    expect(screen.queryByText('已删除，当前显示《第二个脑洞》。')).not.toBeInTheDocument();
    expect(screen.queryByText('脑洞已删除，脑洞库现在为空。')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /脑洞回收站/ }));
    const recycleDialog = screen.getByRole('dialog', { name: '脑洞回收站' });
    expect(recycleDialog).toHaveTextContent('第一个脑洞');
    fireEvent.click(screen.getByRole('button', { name: '恢复' }));

    expect(readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY)).toHaveLength(2);
    expect(readBrainstormRecycleEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY)).toHaveLength(0);
    expect(screen.getByLabelText('脑洞预览内容')).toHaveValue('第一个脑洞的正文');
    expect(screen.getByRole('button', { name: /脑洞回收站/ })).toHaveTextContent('0');
  });

  it('uses compact grouped questions and one large other-requirements field', () => {
    render(<StandardModeBrainstormPage focusGeneration />);

    expect(screen.getByRole('heading', { name: '脑洞生成条件' })).toBeInTheDocument();
    expect(screen.queryByText('先选常用方向，需要时再补充自己的要求。')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '玄幻' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '系统流' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '100万字' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '无金手指' })).toBeInTheDocument();
    expect(screen.getByLabelText('作品类型自定义输入')).toBeInTheDocument();
    expect(screen.getByLabelText('其他要求')).toBeInTheDocument();
    expect(screen.queryByLabelText('一次生成版本数')).not.toBeInTheDocument();
    expect(screen.queryByText('一次性生成X版脑洞')).not.toBeInTheDocument();
    expect(screen.queryByText('可输入1到10，生成后在中间区域切换各个版本。')).not.toBeInTheDocument();
    expect(screen.queryByText('保存为新脑洞')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('新脑洞名称')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '版本1' })).not.toBeInTheDocument();
    expect(screen.queryByText('脑洞已生成，确认内容后点击保存脑洞。')).not.toBeInTheDocument();
    const revisionField = document.querySelector('[data-brainstorm-revision-field="professional-inline-input"]');
    const generationActions = document.querySelector(
      '[data-brainstorm-generation-actions="inline-under-revision-input"]',
    );
    expect(revisionField).toContainElement(generationActions as HTMLElement);
    expect(generationActions).toContainElement(screen.getByRole('button', { name: '复制脑洞' }));
    expect(generationActions).toContainElement(screen.getByRole('button', { name: '保存脑洞' }));
    expect(screen.getByLabelText('作品类型自定义输入')).toHaveClass('placeholder:text-xs');
    const otherRequirements = screen.getByLabelText('其他要求');
    const otherRequirementsField = otherRequirements.closest('[data-brainstorm-other-requirements="true"]');
    expect(otherRequirements).toHaveClass('min-h-[130px]', 'flex-1', 'rounded-md', 'border-[#BFC8D2]', 'placeholder:text-xs');
    expect(otherRequirementsField).toHaveClass('flex', 'min-h-[156px]', 'flex-1', 'flex-col');
    expect(otherRequirementsField?.firstElementChild).toHaveTextContent('其他要求');
    expect(otherRequirementsField?.firstElementChild?.tagName).toBe('SPAN');
    expect(document.querySelector('[data-brainstorm-generation-fields="true"]')).toHaveClass('flex-1', 'flex-col');
  });

  it('opens the brainstorm library when an existing brainstorm is selected from generation mode', () => {
    const onOpenLibrary = vi.fn();
    render(<StandardModeBrainstormPage focusGeneration onOpenLibrary={onOpenLibrary} />);

    fireEvent.click(screen.getByRole('button', { name: /第二个脑洞/ }));

    expect(onOpenLibrary).toHaveBeenCalledTimes(1);
  });

  it('generates one brainstorm, keeps it as a preview, and saves after confirmation', async () => {
    render(<StandardModeBrainstormPage focusGeneration />);

    fireEvent.change(screen.getByLabelText('其他要求'), { target: { value: '开局冲突要明确' } });
    fireEvent.click(screen.getByRole('button', { name: '开始生成脑洞' }));

    await waitFor(() => expect(callModelStreamMock).toHaveBeenCalledTimes(1));
    expect(callModelStreamMock.mock.calls[0][0].userContent).toContain('其他要求：开局冲突要明确');
    expect(screen.getByLabelText('脑洞预览内容')).toHaveValue('AI生成的完整脑洞');
    expect(screen.queryByText('脑洞已生成，确认内容后点击保存脑洞。')).not.toBeInTheDocument();
    expect(readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY)).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: '保存脑洞' }));
    const generatedEntry = readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY)[0];
    expect(generatedEntry?.title).toBe('未命名');
    expect(generatedEntry?.brainstormCategoryId).toBe(BRAINSTORM_UNCATEGORIZED_ID);
    expect(generatedEntry && getBrainstormEntryBody(generatedEntry)).toBe('AI生成的完整脑洞');
    expect(screen.getByRole('status')).toHaveTextContent('保存到脑洞库');
    const secondButton = screen.getByRole('button', { name: /第二个脑洞/ });
    const generatedButton = screen.getByRole('button', { name: /未命名/ });
    expect(secondButton.compareDocumentPosition(generatedButton)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(generatedButton).toHaveTextContent('3');
  });

  it('streams a revision beside the original and saves only after explicit application', async () => {
    render(<StandardModeBrainstormPage />);

    fireEvent.change(screen.getByLabelText('脑洞修改要求'), { target: { value: '强化冲突' } });
    fireEvent.keyDown(screen.getByLabelText('脑洞修改要求'), { key: 'Enter', ctrlKey: true });

    await waitFor(() => expect(callModelStreamMock).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText('修改前脑洞')).toHaveValue('第一个脑洞的正文');
    expect(screen.getByLabelText('AI修改后脑洞')).toHaveValue('按要求修改后的脑洞');
    expect(document.querySelector('[data-brainstorm-revision-comparison="true"]')).toBeInTheDocument();
    let revisedEntry = readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY).find(
      (entry) => entry.id === FIRST_ENTRY.id,
    );
    expect(revisedEntry && getBrainstormEntryBody(revisedEntry)).toBe('第一个脑洞的正文');
    expect(screen.getByRole('status')).toHaveTextContent('对比后决定是否应用');

    fireEvent.click(screen.getByRole('button', { name: '应用修改' }));

    expect(screen.getByLabelText('脑洞预览内容')).toHaveValue('按要求修改后的脑洞');
    revisedEntry = readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY).find(
      (entry) => entry.id === FIRST_ENTRY.id,
    );
    expect(revisedEntry && getBrainstormEntryBody(revisedEntry)).toBe('按要求修改后的脑洞');
    expect(screen.getByRole('status')).toHaveTextContent('修改已应用并保存');
  });

  it('discards an AI revision without changing the saved brainstorm', async () => {
    render(<StandardModeBrainstormPage />);

    fireEvent.change(screen.getByLabelText('脑洞修改要求'), { target: { value: '强化冲突' } });
    fireEvent.click(screen.getByRole('button', { name: '发送修改要求' }));
    await waitFor(() => expect(screen.getByLabelText('AI修改后脑洞')).toHaveValue('按要求修改后的脑洞'));
    fireEvent.click(screen.getByRole('button', { name: '保留原脑洞' }));

    expect(screen.getByLabelText('脑洞预览内容')).toHaveValue('第一个脑洞的正文');
    const entry = readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY).find(
      (item) => item.id === FIRST_ENTRY.id,
    );
    expect(entry && getBrainstormEntryBody(entry)).toBe('第一个脑洞的正文');
    expect(screen.getByRole('status')).toHaveTextContent('已保留原脑洞');
  });
});
