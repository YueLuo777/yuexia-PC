import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  readStandardSettingTemplateState,
  writeStandardSettingTemplateState,
} from '@/features/workbench/model/standardModeSettingModel';
import { buildDefaultTemplateStructure } from '@/features/workbench/model/standardModeTemplateModel';
import {
  createStandardSettingGenerationState,
  getStandardSettingGenerationStorageKey,
  writeStandardSettingGenerationState,
} from '@/features/workbench/model/standardModeSettingGenerationFlow';

import { StandardModeSettingPage } from './StandardModeSettingPage';

function renderPage(overrides: Partial<React.ComponentProps<typeof StandardModeSettingPage>> = {}) {
  return render(
    <StandardModeSettingPage
      novelId="novel-a"
      novelTitle="测试小说"
      novelCategory="玄幻"
      novelChannel="male"
      novelTargetWordCount={1_000_000}
      settingsStorageKey="xinyuexia_workbench_settings_novel-a"
      {...overrides}
    />,
  );
}

describe('StandardModeSettingPage', () => {
  beforeEach(() => localStorage.clear());

  it('shows a compact setting-check explanation before the first check', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: '确认模板并创建设定' }));
    await waitFor(() => expect(screen.getByText('设定检查')).toBeInTheDocument());
    expect(screen.getByText('点击下方按钮，检查所有设定中还没有填写的内容。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '一键检查' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '更换模板' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '清空设定' })).toBeInTheDocument();
  });

  it('keeps template replacement inside the setting list and allows returning without changes', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: '确认模板并创建设定' }));
    await waitFor(() => expect(screen.getByRole('button', { name: '更换模板' })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: '更换模板' }));
    expect(screen.getByText(/继续更换模板会清空全部作品设定/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '取消' }));

    expect(screen.getByRole('button', { name: '一键检查' })).toBeInTheDocument();
    expect(readStandardSettingTemplateState('novel-a')?.templateName).toBe('玄幻仙侠');
  });

  it('recommends xianxia and opens the first domain automatically', () => {
    renderPage();
    const recommendationBasis = screen.getByRole('region', { name: '模板推荐依据' });
    expect(within(recommendationBasis).getByText('男频')).toBeInTheDocument();
    expect(within(recommendationBasis).getByText('玄幻')).toBeInTheDocument();
    expect(within(recommendationBasis).getByText('100万字')).toBeInTheDocument();
    expect(screen.queryByText(/已根据“玄幻”推荐/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '选择内置模板：玄幻仙侠' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '作品设定' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('当前选中：作品设定')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '模板节点：核心设定' })).toBeInTheDocument();
    const positioning = screen.getByRole('button', { name: '模板节点：作品定位' }).closest('[data-template-node-id]');
    expect(positioning).not.toBeNull();
    expect(within(positioning as HTMLElement).getByRole('button', { name: '模板节点：基础设定' })).toBeInTheDocument();
  });

  it('separates node operations and template saving in the right workbench', () => {
    renderPage();

    const workbench = screen.getByTestId('template-node-workbench');
    expect(workbench).toHaveClass('grid', 'grid-rows-[minmax(0,1fr)_auto]');
    const nodeOperations = within(workbench).getByRole('region', { name: '设定操作' });
    const saveTemplate = within(workbench).getByRole('region', { name: '保存模板' });
    expect(within(nodeOperations).getByText('当前选中：作品设定')).toBeInTheDocument();
    expect(within(nodeOperations).getByRole('button', { name: '改名' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(nodeOperations).getByRole('textbox', { name: '当前节点名称' })).toHaveValue('作品设定');
    expect(within(nodeOperations).getByRole('button', { name: '新增下级' })).toBeInTheDocument();
    expect(within(saveTemplate).getByRole('textbox', { name: '保存模板名称' })).toHaveValue('测试小说模板');
    expect(within(saveTemplate).getByRole('button', { name: '保存到我的模板' })).toBeInTheDocument();

    const footer = document.querySelector('[data-standard-setting-initializer="true"] > footer') as HTMLElement;
    expect(within(footer).queryByRole('textbox', { name: '保存模板名称' })).not.toBeInTheDocument();
    expect(within(footer).queryByRole('button', { name: '保存到我的模板' })).not.toBeInTheDocument();
  });

  it('saves the edited structure from the right-side template panel', () => {
    renderPage();
    const savePanel = within(screen.getByTestId('template-node-workbench'))
      .getByRole('region', { name: '保存模板' });

    fireEvent.change(within(savePanel).getByRole('textbox', { name: '保存模板名称' }), {
      target: { value: '我的玄幻模板' },
    });
    fireEvent.click(within(savePanel).getByRole('button', { name: '保存到我的模板' }));

    expect(screen.getByRole('button', { name: '选择我的模板：我的玄幻模板' })).toBeInTheDocument();
  });

  it('shows an explicit empty state when the expected length is not filled in', () => {
    renderPage({ novelTargetWordCount: undefined });

    const recommendationBasis = screen.getByRole('region', { name: '模板推荐依据' });
    expect(within(recommendationBasis).getByText('未填写')).toBeInTheDocument();
  });

  it('switches from recommended templates to all category templates without changing the current selection', () => {
    renderPage();
    const initializer = document.querySelector('[data-standard-setting-initializer="true"]');
    expect(initializer).toHaveClass('h-full', 'grid-rows-[minmax(0,1fr)_auto]', 'overflow-hidden');
    expect(initializer?.firstElementChild).toHaveClass('relative', 'z-0', 'overflow-hidden');
    expect(initializer?.querySelector('footer')).toHaveClass('relative', 'z-20');
    expect(screen.queryByRole('button', { name: '选择内置模板：现代总裁' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '其他分类模板' }));

    expect(screen.getByRole('region', { name: '男频模板' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '女频模板' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '通用模板' })).toBeInTheDocument();
    expect(document.querySelector('[data-template-genre-category="都市"]')).toBeInTheDocument();
    expect(document.querySelector('[data-template-genre-category="现代言情"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '选择内置模板：现代总裁' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '选择内置模板：玄幻仙侠' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '确认模板并创建设定' })).toBeInTheDocument();
  });

  it('recommends both urban templates for an urban work', () => {
    renderPage({ novelCategory: '都市' });

    expect(screen.getByRole('button', { name: '选择内置模板：都市（无修炼）' }))
      .toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '选择内置模板：都市（有修炼）' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '选择内置模板：玄幻仙侠' })).not.toBeInTheDocument();
  });

  it('confirms and persists a channel change before selecting a female template', () => {
    const onNovelChannelChange = vi.fn();
    renderPage({ onNovelChannelChange });
    fireEvent.click(screen.getByRole('tab', { name: '其他分类模板' }));
    fireEvent.click(screen.getByRole('button', { name: '选择内置模板：现代总裁' }));

    expect(screen.getByText('切换作品频道？')).toBeInTheDocument();
    expect(screen.getByText(/作品详情里的作品频道也会同步切换/)).toBeInTheDocument();
    const confirmChannelChange = screen.getByRole('button', { name: '切换频道并选择模板' });
    expect(confirmChannelChange).toHaveClass('bg-[#08AACE]', 'text-white');
    expect(confirmChannelChange).not.toHaveClass('bg-red-600');
    fireEvent.click(confirmChannelChange);

    expect(onNovelChannelChange).toHaveBeenCalledWith('female');
    expect(screen.getByRole('button', { name: '选择内置模板：现代总裁' }))
      .toHaveAttribute('aria-pressed', 'true');
  });

  it('edits internal categories before creating the per-book setting list', async () => {
    renderPage();
    const positioning = screen.getByRole('button', { name: '模板节点：作品定位' }).closest('[data-template-node-id]');
    expect(positioning).not.toBeNull();
    fireEvent.click(within(positioning as HTMLElement).getByRole('button', { name: '模板节点：基础设定' }));
    fireEvent.change(screen.getByRole('textbox', { name: '当前节点名称' }), {
      target: { value: '作品基础信息' },
    });
    expect(screen.queryByRole('button', { name: '模板节点：作品基础信息' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '确认改名' }));
    expect(screen.getByRole('button', { name: '模板节点：作品基础信息' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '新增同级' }));
    fireEvent.change(screen.getByRole('textbox', { name: '新节点名称' }), {
      target: { value: '补充要求' },
    });
    fireEvent.click(screen.getByRole('button', { name: '确认新增同级' }));
    expect(screen.getByRole('button', { name: '模板节点：补充要求' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '确认模板并创建设定' }));
    await waitFor(() => expect(screen.getByLabelText('设定名')).toHaveValue('作品定位'));
    expect(screen.getByText('作品基础信息')).toBeInTheDocument();
    const directory = screen.getByRole('navigation', { name: '设定目录' });
    expect(within(directory).getByText('作品定位')).toBeInTheDocument();
  });

  it('resets the single-task panel, hides invalid child creation, and keeps delete confirmation', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: '新增同级' }));
    expect(screen.getByRole('button', { name: '新增同级' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: '模板节点：小说类型' }));
    expect(screen.getByText('当前选中：小说类型')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '改名' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: '新增下级' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '删除' }));
    expect(screen.getByText('删除“小说类型”？')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '继续删除' }));
    expect(screen.getByText('删除设定节点？')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确认删除' })).toBeInTheDocument();
  });

  it('creates the setting list from the selected template and preserves internal categories', async () => {
    const view = renderPage();
    fireEvent.click(screen.getByRole('button', { name: '确认模板并创建设定' }));
    await waitFor(() => expect(screen.getByLabelText('设定名')).toHaveValue('作品定位'));
    expect(screen.getByRole('navigation', { name: '设定目录' })).toBeInTheDocument();
    expect(document.querySelector('[data-setting-field-group]')).toBeInTheDocument();
    expect(document.querySelector('[data-standard-setting-editor-style="normal-form"]')).toBeInTheDocument();
    expect(screen.getByText('基础设定')).toBeInTheDocument();
    expect(screen.getByLabelText('小说类型')).toBeInTheDocument();
    expect(screen.queryByLabelText('人物姓名')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('小说类型'), { target: { value: '东方玄幻' } });
    expect(readStandardSettingTemplateState('novel-a')?.structure
      .flatMap((domain) => domain.groups)
      .flatMap((group) => group.entries)
      .flatMap((entry) => entry.sections)
      .flatMap((section) => section.fields)
      .find((field) => field.title === '小说类型')?.value).toBe('东方玄幻');
    view.unmount();
    renderPage();
    expect(screen.getByLabelText('小说类型')).toHaveValue('东方玄幻');
    expect(readStandardSettingTemplateState('novel-a')?.templateName).toBe('玄幻仙侠');
  });

  it('clears filled values without leaving the current template or removing its setting structure', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: '确认模板并创建设定' }));
    await waitFor(() => expect(screen.getByLabelText('小说类型')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('小说类型'), { target: { value: '东方玄幻' } });

    fireEvent.click(screen.getByRole('button', { name: '清空设定' }));
    fireEvent.click(screen.getByRole('button', { name: '确认清空' }));

    await waitFor(() => expect(screen.getByLabelText('小说类型')).toHaveValue(''));
    expect(screen.getByRole('navigation', { name: '设定目录' })).toBeInTheDocument();
    expect(screen.getByLabelText('设定名')).toHaveValue('作品定位');
    expect(screen.queryByRole('button', { name: '确认模板并创建设定' })).not.toBeInTheDocument();
    expect(readStandardSettingTemplateState('novel-a')?.templateName).toBe('玄幻仙侠');
  });

  it('requires confirmation before rebuilding an existing book template', async () => {
    writeStandardSettingTemplateState('novel-a', {
      version: 2,
      mode: 'template',
      templateId: 'existing',
      templateName: '旧模板',
      structure: buildDefaultTemplateStructure(),
    });
    const onInitialized = vi.fn();
    const onTemplateChangeCancelled = vi.fn();
    const firstView = renderPage({ forceTemplateSelection: true, onInitialized, onTemplateChangeCancelled });
    expect(screen.getByText('更换设定模板？')).toBeInTheDocument();
    const retainButton = screen.getByRole('button', { name: '取消' });
    const continueButton = screen.getByRole('button', { name: '继续更换模板' });
    expect(retainButton).toHaveClass('bg-[#08AACE]', 'text-white');
    expect(retainButton).toHaveFocus();
    expect(continueButton).toHaveClass('border-red-300', 'bg-white', 'text-red-600');
    expect(within(retainButton.closest('footer') as HTMLElement).getAllByRole('button'))
      .toEqual([continueButton, retainButton]);
    fireEvent.click(retainButton);
    expect(readStandardSettingTemplateState('novel-a')?.templateName).toBe('旧模板');
    expect(onTemplateChangeCancelled).toHaveBeenCalledTimes(1);

    firstView.unmount();
    renderPage({ forceTemplateSelection: true, onInitialized });
    fireEvent.click(screen.getByRole('button', { name: '继续更换模板' }));
    expect(readStandardSettingTemplateState('novel-a')?.templateName).toBe('旧模板');
    fireEvent.click(screen.getByRole('button', { name: '确认模板并创建设定' }));
    await waitFor(() => expect(onInitialized).toHaveBeenCalledTimes(1));
    expect(readStandardSettingTemplateState('novel-a')?.templateName).toBe('玄幻仙侠');
  });

  it('opens the template canvas directly after replacement was already confirmed outside the page', () => {
    writeStandardSettingTemplateState('novel-a', {
      version: 2,
      mode: 'template',
      templateId: 'existing',
      templateName: '旧模板',
      structure: buildDefaultTemplateStructure(),
    });
    const onTemplateChangeCancelled = vi.fn();
    renderPage({ startInTemplateSelector: true, onTemplateChangeCancelled });

    expect(screen.queryByText('更换设定模板？')).not.toBeInTheDocument();
    expect(screen.getByTestId('mind-map-canvas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '选择内置模板：玄幻仙侠' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '返回设定列表' }));
    expect(onTemplateChangeCancelled).toHaveBeenCalledTimes(1);
  });

  it('clears generation progress and brainstorm association after confirming a replacement template', async () => {
    writeStandardSettingTemplateState('novel-a', {
      version: 2,
      mode: 'template',
      templateId: 'existing',
      templateName: '旧模板',
      structure: buildDefaultTemplateStructure(),
    });
    writeStandardSettingGenerationState('xinyuexia_workbench_settings_novel-a', {
      ...createStandardSettingGenerationState(),
      currentStepIndex: 1,
      completedStepIds: ['world-foundation'],
    });
    localStorage.setItem('xinyuexia_standard_brainstorm_link_novel-a', JSON.stringify({
      id: 'brainstorm-a',
      title: '旧脑洞',
      content: '旧关联内容',
    }));

    renderPage({ startInTemplateSelector: true });
    fireEvent.click(screen.getByRole('button', { name: '确认模板并创建设定' }));
    await waitFor(() => expect(readStandardSettingTemplateState('novel-a')?.templateName).toBe('玄幻仙侠'));

    expect(localStorage.getItem(getStandardSettingGenerationStorageKey('xinyuexia_workbench_settings_novel-a')))
      .toBeNull();
    expect(localStorage.getItem('xinyuexia_standard_brainstorm_link_novel-a')).toBeNull();
  });

  it('treats the standard close control as retaining the existing settings', () => {
    writeStandardSettingTemplateState('novel-a', {
      version: 2,
      mode: 'template',
      templateId: 'existing',
      templateName: '旧模板',
      structure: buildDefaultTemplateStructure(),
    });
    const onTemplateChangeCancelled = vi.fn();
    renderPage({ forceTemplateSelection: true, onTemplateChangeCancelled });

    const closeButton = screen.getByRole('button', { name: '关闭' });
    expect(closeButton).toHaveAttribute('title', '关闭');
    fireEvent.click(closeButton);

    expect(readStandardSettingTemplateState('novel-a')?.templateName).toBe('旧模板');
    expect(onTemplateChangeCancelled).toHaveBeenCalledTimes(1);
  });
});
