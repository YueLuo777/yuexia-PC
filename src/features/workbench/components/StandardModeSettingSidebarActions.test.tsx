import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { writeStandardSettingTemplateState } from '@/features/workbench/model/standardModeSettingModel';
import { buildDefaultTemplateStructure } from '@/features/workbench/model/standardModeTemplateModel';

import { StandardModeSettingSidebarActions } from './StandardModeSettingSidebarActions';

const storageKey = 'xinyuexia_workbench_settings_novel-a';

describe('StandardModeSettingSidebarActions', () => {
  beforeEach(() => localStorage.clear());

  it('keeps template replacement and clear settings together in the lower-left action row', () => {
    const onChangeTemplate = vi.fn();
    render(<StandardModeSettingSidebarActions storageKey={storageKey} onChangeTemplate={onChangeTemplate} />);

    const actions = screen.getByRole('group', { name: '作品设定操作' });
    expect(actions).toHaveAttribute('data-standard-setting-sidebar-actions', 'true');
    expect(within(actions).getAllByRole('button').map((button) => button.textContent)).toEqual([
      '更换模板',
      '清空设定',
    ]);
    fireEvent.click(within(actions).getByRole('button', { name: '更换模板' }));
    expect(onChangeTemplate).toHaveBeenCalledTimes(1);
  });

  it('requires confirmation and clears only after the destructive action is confirmed', () => {
    writeStandardSettingTemplateState('novel-a', {
      version: 2,
      mode: 'template',
      templateId: 'existing',
      templateName: '旧模板',
      structure: buildDefaultTemplateStructure(),
    });
    render(<StandardModeSettingSidebarActions storageKey={storageKey} />);

    fireEvent.click(screen.getByRole('button', { name: '清空设定' }));
    expect(screen.getByRole('dialog', { name: '清空全部设定？' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '取消' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(localStorage.getItem('xinyuexia_standard_setting_template_novel-a')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '清空设定' }));
    fireEvent.click(screen.getByRole('button', { name: '确认清空' }));
    expect(localStorage.getItem('xinyuexia_standard_setting_template_novel-a')).toBeNull();
    expect(screen.queryByRole('dialog', { name: '清空全部设定？' })).not.toBeInTheDocument();
  });
});
