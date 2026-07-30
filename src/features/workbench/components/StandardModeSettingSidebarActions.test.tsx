import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  readStandardSettingTemplateState,
  writeStandardSettingTemplateState,
} from '@/features/workbench/model/standardModeSettingModel';
import { subscribeStandardModeSettingNavigationAction } from '@/features/workbench/model/standardModeSettingNavigationEvents';
import { MALE_FANTASY_XIANXIA_LIGHT_STRUCTURE } from '@/features/workbench/model/standardModeXianxiaSettingTemplates';

import { StandardModeSettingSidebarActions } from './StandardModeSettingSidebarActions';

const storageKey = 'xinyuexia_workbench_settings_novel-a';

describe('StandardModeSettingSidebarActions', () => {
  beforeEach(() => localStorage.clear());

  it('keeps upgrade, replacement, and clear settings together in the lower-left action row', () => {
    const onUpgradeTemplate = vi.fn();
    const onChangeTemplate = vi.fn();
    render(
      <StandardModeSettingSidebarActions
        storageKey={storageKey}
        canUpgradeTemplate
        onUpgradeTemplate={onUpgradeTemplate}
        onChangeTemplate={onChangeTemplate}
      />,
    );

    const actions = screen.getByRole('group', { name: '作品设定操作' });
    expect(actions).toHaveAttribute('data-standard-setting-sidebar-actions', 'true');
    expect(within(actions).getAllByRole('button').map((button) => button.textContent)).toEqual([
      '升级模板',
      '更换模板',
      '清空设定',
    ]);
    fireEvent.click(within(actions).getByRole('button', { name: '升级模板' }));
    expect(onUpgradeTemplate).toHaveBeenCalledTimes(1);
    fireEvent.click(within(actions).getByRole('button', { name: '更换模板' }));
    expect(onChangeTemplate).toHaveBeenCalledTimes(1);
  });

  it('requires confirmation and clears only after the destructive action is confirmed', () => {
    writeStandardSettingTemplateState('novel-a', {
      version: 2,
      mode: 'template',
      templateId: 'existing',
      templateName: '旧模板',
      structure: [{
        id: 'work',
        title: '作品设定',
        enabled: true,
        groups: [{
          id: 'world',
          title: '世界观',
          enabled: true,
          entries: [{
            id: 'background',
            title: '世界背景',
            enabled: true,
            sections: [{
              id: 'base',
              title: '基础',
              enabled: true,
              fields: [{ id: 'era', title: '时代背景', enabled: true, value: '旧内容' }],
            }],
          }],
        }],
      }],
    });
    render(<StandardModeSettingSidebarActions storageKey={storageKey} />);

    fireEvent.click(screen.getByRole('button', { name: '清空设定' }));
    expect(screen.getByRole('dialog', { name: '清空所有设定内容？' })).toBeInTheDocument();
    expect(screen.getByText(/保留当前模板、设定分组、设定名和字段结构/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '取消' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(localStorage.getItem('xinyuexia_standard_setting_template_novel-a')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '清空设定' }));
    fireEvent.click(screen.getByRole('button', { name: '确认清空' }));
    const savedTemplate = readStandardSettingTemplateState('novel-a');
    expect(savedTemplate?.templateId).toBe('existing');
    expect(savedTemplate?.structure[0].groups[0].entries[0].title).toBe('世界背景');
    expect(savedTemplate?.structure[0].groups[0].entries[0].sections[0].fields[0].value).toBe('');
    expect(screen.queryByRole('dialog', { name: '清空所有设定内容？' })).not.toBeInTheDocument();
  });

  it('publishes the upgrade action from the formal shared setting workspace', () => {
    writeStandardSettingTemplateState('novel-a', {
      version: 2,
      mode: 'template',
      templateId: 'male-fantasy-xianxia-light',
      templateName: '玄幻仙侠（轻量版）',
      structure: MALE_FANTASY_XIANXIA_LIGHT_STRUCTURE,
    });
    const listener = vi.fn();
    const unsubscribe = subscribeStandardModeSettingNavigationAction(listener);
    render(<StandardModeSettingSidebarActions storageKey={storageKey} />);

    const upgradeButton = screen.getByRole('button', { name: '升级模板' });
    expect(upgradeButton).toBeEnabled();
    fireEvent.click(upgradeButton);
    expect(listener).toHaveBeenCalledWith({ action: 'upgrade-template', storageKey });
    unsubscribe();
  });
});
