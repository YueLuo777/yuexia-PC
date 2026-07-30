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
    expect(screen.getByText('玄幻仙侠（标准版）')).toBeInTheDocument();
    expect(screen.getByText('玄幻仙侠（完整版）')).toBeInTheDocument();
    expect(screen.getByText('玄幻仙侠（轻量版）')).toBeInTheDocument();
    const light = screen.getByText('玄幻仙侠（轻量版）').closest('button') as HTMLButtonElement;
    const standard = screen.getByText('玄幻仙侠（标准版）').closest('button') as HTMLButtonElement;
    const full = screen.getByText('玄幻仙侠（完整版）').closest('button') as HTMLButtonElement;
    expect(light.compareDocumentPosition(standard) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(standard.compareDocumentPosition(full) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(light).getByText('男频 · 玄幻仙侠')).toBeInTheDocument();
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
    expect(screen.queryByText('玄幻仙侠（标准版）')).not.toBeInTheDocument();
    expect(screen.queryByText('玄幻仙侠（完整版）')).not.toBeInTheDocument();
    expect(screen.queryByText('玄幻仙侠（轻量版）')).not.toBeInTheDocument();
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

  it('edits all four levels with deletion locks and persists the exact DIY structure', () => {
    const { unmount } = render(<TemplateManagePage />);
    const editor = screen.getByRole('region', { name: '四栏DIY模板编辑器' });
    const monsterDelete = within(editor).getByRole('button', { name: '删除一级分类：怪物图鉴' });
    const domainLock = within(editor).getByRole('button', { name: '一级删除已锁定，点击解锁' });
    expect(monsterDelete).toBeDisabled();
    expect(domainLock).toHaveTextContent('解锁');
    expect(monsterDelete).toHaveClass('disabled:text-slate-300');

    fireEvent.click(domainLock);
    expect(within(editor).getByRole('button', { name: '一级删除未锁定，点击锁定' })).toHaveTextContent('锁定');
    expect(monsterDelete).toHaveClass('text-red-500');
    fireEvent.click(monsterDelete);
    expect(editor).toHaveAttribute('data-domain-count', '7');

    const domainColumn = within(editor).getByRole('region', { name: 'DIY一级分类' });
    fireEvent.change(within(domainColumn).getByRole('textbox', { name: '输入一级分类名称' }), {
      target: { value: 'A' },
    });
    fireEvent.click(within(domainColumn).getByRole('button', { name: '新增' }));

    const groupColumn = within(editor).getByRole('region', { name: 'DIY二级分组' });
    fireEvent.change(within(groupColumn).getByRole('textbox', { name: '输入二级分组名称' }), {
      target: { value: 'A分组' },
    });
    fireEvent.click(within(groupColumn).getByRole('button', { name: '新增' }));

    const entryColumn = within(editor).getByRole('region', { name: 'DIY三级设定' });
    fireEvent.change(within(entryColumn).getByRole('textbox', { name: '输入三级设定名称' }), {
      target: { value: 'A设定' },
    });
    fireEvent.click(within(entryColumn).getByRole('button', { name: '新增' }));

    const fieldColumn = within(editor).getByRole('region', { name: 'DIY四级设定' });
    fireEvent.change(within(fieldColumn).getByRole('textbox', { name: '输入四级设定名称' }), {
      target: { value: 'A字段' },
    });
    fireEvent.click(within(fieldColumn).getByRole('button', { name: '新增' }));

    fireEvent.change(within(editor).getByRole('textbox', { name: '保存模板名称' }), {
      target: { value: '正式DIY模板' },
    });
    fireEvent.click(within(editor).getByRole('button', { name: '保存到我的模板' }));

    const saved = JSON.parse(localStorage.getItem(SAVED_SETTING_TEMPLATES_STORAGE_KEY) ?? '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].structure.some((domain: { title: string }) => domain.title === '怪物图鉴')).toBe(false);
    expect(saved[0].structure.find((domain: { title: string }) => domain.title === 'A')
      .groups[0].entries[0].sections[0].fields[0].title).toBe('A字段');

    unmount();
    render(<TemplateManagePage />);
    fireEvent.click(screen.getByRole('tab', { name: '我的模板' }));
    fireEvent.click(screen.getByRole('button', { name: /正式DIY模板/ }));
    const restoredEditor = screen.getByRole('region', { name: '四栏DIY模板编辑器' });
    expect(within(restoredEditor).getByRole('button', { name: 'A' })).toBeInTheDocument();
    expect(within(restoredEditor).queryByRole('button', { name: '怪物图鉴' })).not.toBeInTheDocument();
  });
});
