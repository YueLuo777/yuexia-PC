import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  readStandardSettingTemplateState,
  writeStandardSettingTemplateState,
} from '@/features/workbench/model/standardModeSettingModel';
import { buildDefaultTemplateStructure } from '@/features/workbench/model/standardModeTemplateModel';

import { StandardModeSettingPage } from './StandardModeSettingPage';

function renderPage(overrides: Partial<React.ComponentProps<typeof StandardModeSettingPage>> = {}) {
  return render(
    <StandardModeSettingPage
      novelId="novel-a"
      novelTitle="测试小说"
      novelCategory="玄幻"
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
  });

  it('recommends xianxia and opens the first domain automatically', () => {
    renderPage();
    expect(screen.getByRole('button', { name: '选择内置模板：玄幻仙侠' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '作品设定' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('当前选中：作品设定')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '模板节点：核心设定' })).toBeInTheDocument();
    const positioning = screen.getByRole('button', { name: '模板节点：作品定位' }).closest('[data-template-node-id]');
    expect(positioning).not.toBeNull();
    expect(within(positioning as HTMLElement).getByRole('button', { name: '模板节点：基础设定' })).toBeInTheDocument();
  });

  it('edits internal categories before creating the per-book setting list', async () => {
    renderPage();
    const positioning = screen.getByRole('button', { name: '模板节点：作品定位' }).closest('[data-template-node-id]');
    expect(positioning).not.toBeNull();
    fireEvent.click(within(positioning as HTMLElement).getByRole('button', { name: '模板节点：基础设定' }));
    fireEvent.change(screen.getByRole('textbox', { name: '当前节点名称' }), {
      target: { value: '作品基础信息' },
    });
    expect(screen.getByRole('button', { name: '模板节点：作品基础信息' })).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: '新节点名称' }), {
      target: { value: '补充要求' },
    });
    fireEvent.click(screen.getByRole('button', { name: '新增同级分类' }));
    expect(screen.getByRole('button', { name: '模板节点：补充要求' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '确认模板并创建设定' }));
    await waitFor(() => expect(screen.getByLabelText('设定名')).toHaveValue('作品定位'));
    expect(screen.getByText('作品基础信息')).toBeInTheDocument();
    const directory = screen.getByRole('navigation', { name: '设定目录' });
    expect(within(directory).getByText('作品定位')).toBeInTheDocument();
  });

  it('creates the setting list from the selected template and preserves internal categories', async () => {
    const view = renderPage();
    fireEvent.click(screen.getByRole('button', { name: '确认模板并创建设定' }));
    await waitFor(() => expect(screen.getByLabelText('设定名')).toHaveValue('作品定位'));
    expect(screen.getByRole('navigation', { name: '设定目录' })).toBeInTheDocument();
    expect(document.querySelector('[data-setting-field-group]')).toBeInTheDocument();
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

  it('requires confirmation before rebuilding an existing book template', async () => {
    writeStandardSettingTemplateState('novel-a', {
      version: 2,
      mode: 'template',
      templateId: 'existing',
      templateName: '旧模板',
      structure: buildDefaultTemplateStructure(),
    });
    const onInitialized = vi.fn();
    renderPage({ forceTemplateSelection: true, onInitialized });
    fireEvent.click(screen.getByRole('button', { name: '确认模板并创建设定' }));
    expect(screen.getByText('重新创建设定？')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '保留现有设定' }));
    expect(readStandardSettingTemplateState('novel-a')?.templateName).toBe('旧模板');
    fireEvent.click(screen.getByRole('button', { name: '确认模板并创建设定' }));
    fireEvent.click(screen.getByRole('button', { name: '删除并重新创建' }));
    await waitFor(() => expect(onInitialized).toHaveBeenCalledTimes(1));
    expect(readStandardSettingTemplateState('novel-a')?.templateName).toBe('玄幻仙侠');
  });
});
