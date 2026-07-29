import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  buildDefaultTemplateStructure,
  saveSettingTemplateById,
  SAVED_SETTING_TEMPLATES_STORAGE_KEY,
} from '@/features/workbench/model/standardModeTemplateModel';
import { TemplateManagePage } from './TemplateManagePage';

describe('TemplateManagePage', () => {
  beforeEach(() => localStorage.clear());

  it('shows male, female, and saved template tabs with male selected by default', () => {
    render(<TemplateManagePage />);

    expect(screen.getByRole('heading', { name: '模板管理' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: '内置模板' })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '男频' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: '女频' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: '我的模板' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('玄幻仙侠')).toBeInTheDocument();
    expect(screen.getByText('通用小说基础')).toBeInTheDocument();
    expect(screen.queryByText('现代总裁')).not.toBeInTheDocument();
    for (const type of ['作品设定', '人物设定', '地点地图', '势力设定', '道具资源', '伏笔线索', '怪物图鉴']) {
      expect(screen.getByRole('button', { name: type })).toBeInTheDocument();
    }
  });

  it('filters built-in templates by channel while keeping general templates available', () => {
    render(<TemplateManagePage />);

    fireEvent.click(screen.getByRole('tab', { name: '女频' }));

    expect(screen.getByRole('tab', { name: '女频' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('现代总裁')).toBeInTheDocument();
    expect(screen.getByText('甜宠')).toBeInTheDocument();
    expect(screen.getByText('通用小说基础')).toBeInTheDocument();
    expect(screen.queryByText('玄幻仙侠')).not.toBeInTheDocument();
  });

  it('creates and saves a user template from the management page', () => {
    render(<TemplateManagePage />);

    fireEvent.click(screen.getByRole('button', { name: '新建模板' }));
    const nameInput = screen.getByRole('textbox', { name: '保存模板名称' });
    fireEvent.change(nameInput, { target: { value: '我的人物模板' } });
    fireEvent.click(screen.getByRole('button', { name: '保存到我的模板' }));

    const saved = JSON.parse(localStorage.getItem(SAVED_SETTING_TEMPLATES_STORAGE_KEY) ?? '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe('我的人物模板');
    expect(screen.getByRole('tab', { name: '我的模板' })).toHaveAttribute('aria-selected', 'true');
  });

  it('requires confirmation before deleting only the selected user template', () => {
    saveSettingTemplateById(null, '人物模板', buildDefaultTemplateStructure());
    render(<TemplateManagePage />);

    fireEvent.click(screen.getByRole('tab', { name: '我的模板' }));
    fireEvent.click(screen.getByRole('button', { name: '删除模板' }));
    const dialog = screen.getByRole('dialog', { name: '删除模板？' });
    expect(dialog).toHaveTextContent('内置模板不会受到影响');
    fireEvent.click(within(dialog).getByRole('button', { name: '删除模板' }));

    expect(JSON.parse(localStorage.getItem(SAVED_SETTING_TEMPLATES_STORAGE_KEY) ?? '[]')).toEqual([]);
  });
});
