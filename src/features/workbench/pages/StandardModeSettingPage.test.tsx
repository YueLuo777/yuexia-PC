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
import { countTemplateFields } from '@/features/workbench/model/standardModeTemplateUpgrade';

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
    expect(screen.getByRole('button', { name: '升级模板' })).toBeInTheDocument();
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
    expect(readStandardSettingTemplateState('novel-a')?.templateName).toBe('玄幻仙侠（标准版）');
  });

  it('upgrades lightweight directly to full without clearing content or generation context', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: '选择内置模板：玄幻仙侠（轻量版）' }));
    fireEvent.click(screen.getByRole('button', { name: '确认模板并创建设定' }));
    await waitFor(() => expect(screen.getByLabelText('小说类型')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('小说类型'), { target: { value: '保留的东方玄幻' } });
    writeStandardSettingGenerationState('xinyuexia_workbench_settings_novel-a', {
      ...createStandardSettingGenerationState(),
      currentStepIndex: 1,
      completedStepIds: ['world-foundation'],
    });
    localStorage.setItem('xinyuexia_standard_brainstorm_link_novel-a', JSON.stringify({
      id: 'brainstorm-upgrade',
      title: '升级前脑洞',
      content: '保留关联内容',
    }));

    fireEvent.click(screen.getByRole('button', { name: '升级模板' }));
    expect(screen.getByRole('dialog', { name: '升级设定模板' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '升级到玄幻仙侠（标准版）' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: '升级到玄幻仙侠（完整版）' })).toBeInTheDocument();
    expect(screen.getByText('新增 198 个字段')).toBeInTheDocument();
    expect(screen.getByText('新增 548 个字段')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: '升级到玄幻仙侠（完整版）' }));
    fireEvent.click(screen.getByRole('button', { name: '确认升级' }));

    await waitFor(() => expect(readStandardSettingTemplateState('novel-a')?.templateId)
      .toBe('male-fantasy-xianxia-full'));
    const upgraded = readStandardSettingTemplateState('novel-a');
    expect(countTemplateFields(upgraded?.structure ?? [])).toBe(648);
    expect(upgraded?.structure.flatMap((domain) => domain.groups)
      .flatMap((group) => group.entries)
      .flatMap((entry) => entry.sections)
      .flatMap((section) => section.fields)
      .find((field) => field.title === '小说类型')?.value).toBe('保留的东方玄幻');
    expect(screen.getByLabelText('小说类型')).toHaveValue('保留的东方玄幻');
    expect(screen.getByRole('button', { name: '升级模板' })).toBeDisabled();
    expect(localStorage.getItem(getStandardSettingGenerationStorageKey('xinyuexia_workbench_settings_novel-a')))
      .not.toBeNull();
    expect(localStorage.getItem('xinyuexia_standard_brainstorm_link_novel-a')).toContain('brainstorm-upgrade');
  });

  it('opens the xianxia catalog without reserving a recommendation-basis block', () => {
    renderPage();
    expect(screen.queryByRole('region', { name: '模板推荐依据' })).not.toBeInTheDocument();
    expect(screen.queryByText(/已根据“玄幻”推荐/)).not.toBeInTheDocument();
    const lightTemplate = screen.getByRole('button', { name: '选择内置模板：玄幻仙侠（轻量版）' });
    const standardTemplate = screen.getByRole('button', { name: '选择内置模板：玄幻仙侠（标准版）' });
    const fullTemplate = screen.getByRole('button', { name: '选择内置模板：玄幻仙侠（完整版）' });
    expect(standardTemplate).toHaveAttribute('aria-pressed', 'true');
    expect(lightTemplate.compareDocumentPosition(standardTemplate) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(standardTemplate.compareDocumentPosition(fullTemplate) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(lightTemplate).getByText('男频 · 玄幻仙侠')).toBeInTheDocument();
    expect(screen.getByRole('separator', { name: '其他男频题材模板' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '男频' })).toHaveAttribute('aria-selected', 'true');
    const editor = screen.getByRole('region', { name: '逐级DIY模板编辑器' });
    expect(within(editor).getByRole('region', { name: 'DIY一级分类' })).toBeInTheDocument();
    expect(within(editor).getByRole('region', { name: 'DIY二级分组' })).toBeInTheDocument();
    expect(within(editor).getByRole('region', { name: 'DIY三级设定' })).toBeInTheDocument();
    expect(within(editor).getByRole('region', { name: 'DIY四级设定' })).toBeInTheDocument();
    expect(within(editor).getByRole('button', { name: '作品设定' })).toBeInTheDocument();
    expect(within(editor).getByRole('button', { name: '核心设定' })).toBeInTheDocument();
    expect(within(editor).getByRole('button', { name: '作品定位' })).toBeInTheDocument();
    expect(within(editor).getByRole('button', { name: '小说类型' })).toBeInTheDocument();
    expect(screen.queryByTestId('mind-map-canvas')).not.toBeInTheDocument();
  });

  it('reuses the template-management editor and keeps template confirmation separate', () => {
    renderPage();

    const editor = screen.getByRole('region', { name: '逐级DIY模板编辑器' });
    const saveTemplate = within(editor).getByRole('region', { name: '保存模板' });
    expect(editor).toHaveAttribute('data-template-diy-cascade-editor', 'true');
    expect(within(editor).getByText(/当前路径：/)).toHaveTextContent('作品设定 ＞ 核心设定 ＞ 作品定位');
    expect(within(editor).getByRole('button', { name: '一级删除已锁定，点击解锁' })).toHaveTextContent('解锁');
    expect(within(saveTemplate).getByRole('textbox', { name: '保存模板名称' })).toHaveValue('测试小说模板');
    expect(within(saveTemplate).getByRole('button', { name: '保存到我的模板' })).toBeInTheDocument();

    const footer = document.querySelector('[data-standard-setting-initializer="true"] > footer') as HTMLElement;
    expect(within(footer).queryByRole('textbox', { name: '保存模板名称' })).not.toBeInTheDocument();
    expect(within(footer).queryByRole('button', { name: '保存到我的模板' })).not.toBeInTheDocument();
  });

  it('saves the edited structure from the right-side template panel', () => {
    renderPage();
    const savePanel = within(screen.getByRole('region', { name: '逐级DIY模板编辑器' }))
      .getByRole('region', { name: '保存模板' });

    fireEvent.change(within(savePanel).getByRole('textbox', { name: '保存模板名称' }), {
      target: { value: '我的玄幻模板' },
    });
    fireEvent.click(within(savePanel).getByRole('button', { name: '保存到我的模板' }));

    expect(screen.getByRole('button', { name: '选择我的模板：我的玄幻模板' })).toBeInTheDocument();
  });

  it('does not restore recommendation metadata when the expected length is empty', () => {
    renderPage({ novelTargetWordCount: undefined });

    expect(screen.queryByRole('region', { name: '模板推荐依据' })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '男频' })).toBeInTheDocument();
  });

  it('filters built-in templates through male, female, and saved tabs', () => {
    renderPage();
    const initializer = document.querySelector('[data-standard-setting-initializer="true"]');
    expect(initializer).toHaveClass('h-full', 'grid-rows-[minmax(0,1fr)_auto]', 'overflow-hidden');
    expect(initializer?.firstElementChild).toHaveClass('relative', 'z-0', 'overflow-hidden');
    expect(document.querySelector('[data-standard-setting-initializer="true"] > footer')).toHaveClass('relative', 'z-20');
    expect(screen.getByRole('tab', { name: '男频' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: '女频' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: '我的模板' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.queryByRole('button', { name: '选择内置模板：现代总裁' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '女频' }));

    expect(screen.getByRole('tab', { name: '女频' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: '选择内置模板：现代总裁' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '选择内置模板：玄幻仙侠（标准版）' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '男频' }));
    expect(screen.getByRole('button', { name: '选择内置模板：玄幻仙侠（标准版）' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '确认模板并创建设定' })).toBeInTheDocument();
  });

  it('selects the recommended urban template while showing the full male catalog', () => {
    renderPage({ novelCategory: '都市' });

    expect(screen.getByRole('button', { name: '选择内置模板：都市（无修炼）' }))
      .toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '选择内置模板：都市（有修炼）' })).toBeInTheDocument();
    const urbanTemplate = screen.getByRole('button', { name: '选择内置模板：都市（无修炼）' });
    const otherTemplates = screen.getByRole('separator', { name: '其他男频题材模板' });
    const xianxiaTemplate = screen.getByRole('button', { name: '选择内置模板：玄幻仙侠（标准版）' });
    expect(urbanTemplate.compareDocumentPosition(otherTemplates) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(otherTemplates.compareDocumentPosition(xianxiaTemplate) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('confirms and persists a channel change before selecting a female template', () => {
    const onNovelChannelChange = vi.fn();
    renderPage({ onNovelChannelChange });
    fireEvent.click(screen.getByRole('tab', { name: '女频' }));
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

  it('edits the four-level structure before creating the per-book setting list', async () => {
    renderPage();
    const editor = screen.getByRole('region', { name: '逐级DIY模板编辑器' });
    const fieldColumn = within(editor).getByRole('region', { name: 'DIY四级设定' });
    fireEvent.change(within(fieldColumn).getByRole('textbox', { name: '输入四级设定名称' }), {
      target: { value: '补充要求' },
    });
    fireEvent.click(within(fieldColumn).getByRole('button', { name: '新增' }));
    expect(within(editor).getByRole('button', { name: '补充要求' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '确认模板并创建设定' }));
    await waitFor(() => expect(screen.getByLabelText('设定名')).toHaveValue('作品定位'));
    expect(screen.getByLabelText('补充要求')).toBeInTheDocument();
    const directory = screen.getByRole('navigation', { name: '设定目录' });
    expect(within(directory).getByText('作品定位')).toBeInTheDocument();
  });

  it('keeps every template level protected until its delete lock is explicitly released', () => {
    renderPage();
    const editor = screen.getByRole('region', { name: '逐级DIY模板编辑器' });
    const fieldDelete = within(editor).getByRole('button', { name: '删除四级设定：小说类型' });
    expect(fieldDelete).toBeDisabled();
    fireEvent.click(within(editor).getByRole('button', { name: '四级删除已锁定，点击解锁' }));
    expect(within(editor).getByRole('button', { name: '四级删除未锁定，点击锁定' })).toHaveTextContent('锁定');
    expect(fieldDelete).toBeEnabled();
    fireEvent.click(fieldDelete);
    expect(within(editor).queryByRole('button', { name: '小说类型' })).not.toBeInTheDocument();
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
    expect(readStandardSettingTemplateState('novel-a')?.templateName).toBe('玄幻仙侠（标准版）');
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
    expect(readStandardSettingTemplateState('novel-a')?.templateName).toBe('玄幻仙侠（标准版）');
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
    expect(readStandardSettingTemplateState('novel-a')?.templateName).toBe('玄幻仙侠（标准版）');
  });

  it('opens the template-management editor directly after replacement was already confirmed outside the page', () => {
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
    expect(screen.getByRole('region', { name: '逐级DIY模板编辑器' })).toBeInTheDocument();
    expect(screen.queryByTestId('mind-map-canvas')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '选择内置模板：玄幻仙侠（标准版）' })).toBeInTheDocument();
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
    await waitFor(() => expect(readStandardSettingTemplateState('novel-a')?.templateName).toBe('玄幻仙侠（标准版）'));

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
