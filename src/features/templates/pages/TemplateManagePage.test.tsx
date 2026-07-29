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

  it('shows the formal seven-type template editor and built-in template library', () => {
    render(<TemplateManagePage />);

    expect(screen.getByRole('heading', { name: '模板管理' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '内置模板' })).toHaveAttribute('aria-selected', 'true');
    for (const type of ['作品设定', '人物设定', '地点地图', '势力设定', '道具资源', '伏笔线索', '怪物图鉴']) {
      expect(screen.getByRole('button', { name: type })).toBeInTheDocument();
    }
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
    expect(screen.getByRole('tab', { name: '我的模板 (1)' })).toHaveAttribute('aria-selected', 'true');
  });

  it('requires confirmation before deleting only the selected user template', () => {
    saveSettingTemplateById(null, '人物模板', buildDefaultTemplateStructure());
    render(<TemplateManagePage />);

    fireEvent.click(screen.getByRole('tab', { name: '我的模板 (1)' }));
    fireEvent.click(screen.getByRole('button', { name: '删除模板' }));
    const dialog = screen.getByRole('dialog', { name: '删除模板？' });
    expect(dialog).toHaveTextContent('内置模板不会受到影响');
    fireEvent.click(within(dialog).getByRole('button', { name: '删除模板' }));

    expect(JSON.parse(localStorage.getItem(SAVED_SETTING_TEMPLATES_STORAGE_KEY) ?? '[]')).toEqual([]);
  });
});
