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

  const openCreateDialog = () => {
    fireEvent.click(screen.getByRole('tab', { name: '我的模板' }));
    fireEvent.click(screen.getByRole('button', { name: '新建模板' }));
    return screen.getByRole('dialog', { name: '新建我的模板' });
  };

  const createFromDefaultPreset = () => {
    const dialog = openCreateDialog();
    fireEvent.click(within(dialog).getByRole('button', { name: '创建模板' }));
  };

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
    expect(light).toHaveAttribute('aria-pressed', 'true');
    expect(standard).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('textbox', { name: '保存模板名称' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '保存到我的模板' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /删除一级分类/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /一级删除/ })).not.toBeInTheDocument();
    expect(screen.getByText('内置模板固定，只能查看结构')).toBeInTheDocument();
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
    const firstFemaleTemplate = screen.getByText('现代总裁').closest('button') as HTMLButtonElement;
    expect(firstFemaleTemplate).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('textbox', { name: '保存模板名称' })).not.toBeInTheDocument();
    expect(screen.getByText('甜宠')).toBeInTheDocument();
    expect(screen.getByText('通用小说基础')).toBeInTheDocument();
    expect(screen.queryByText('玄幻仙侠（标准版）')).not.toBeInTheDocument();
    expect(screen.queryByText('玄幻仙侠（完整版）')).not.toBeInTheDocument();
    expect(screen.queryByText('玄幻仙侠（轻量版）')).not.toBeInTheDocument();
  });

  it('shows concise level names, fits eight first-level cards per row, and keeps adaptive fourth-level cards', () => {
    render(<TemplateManagePage />);

    const editor = screen.getByRole('region', { name: '逐级DIY模板编辑器' });
    expect(editor.querySelector('[data-template-cascade-scroll="true"]')).toHaveClass('bg-white');
    const navigations = [
      within(editor).getByRole('navigation', { name: '模板一级设定' }),
      within(editor).getByRole('navigation', { name: '模板二级设定' }),
      within(editor).getByRole('navigation', { name: '模板三级设定' }),
    ];

    navigations.forEach((navigation) => expect(navigation).toHaveClass('flex', 'flex-wrap'));
    expect(within(editor).getByRole('heading', { name: /^一级设定$/ })).toBeInTheDocument();
    expect(within(editor).getByRole('heading', { name: /^二级设定$/ })).toBeInTheDocument();
    expect(within(editor).getByRole('heading', { name: /^三级设定$/ })).toBeInTheDocument();
    expect(within(editor).getByRole('heading', { name: /^四级设定$/ })).toBeInTheDocument();
    expect(within(editor).queryByText(/第一行|第二行|第三行|共 \d+ 项/)).not.toBeInTheDocument();
    const domainCards = editor.querySelectorAll('[data-template-cascade-level-button="true"][data-template-diy-level="domain"]');
    const deeperCards = editor.querySelectorAll('[data-template-cascade-level-button="true"]:not([data-template-diy-level="domain"])');
    expect(domainCards.length).toBe(8);
    domainCards.forEach((card) => expect(card).toHaveClass('w-[145px]', 'shrink-0'));
    deeperCards.forEach((card) => expect(card).toHaveClass('w-[220px]', 'shrink-0'));
    const fourthLevel = within(editor).getByRole('region', { name: 'DIY四级设定' });
    expect(fourthLevel).toHaveAttribute('data-template-fourth-level', 'true');
    expect(fourthLevel).toHaveClass('bg-white');
    expect(fourthLevel).not.toHaveClass('bg-[#F5F8FA]');
    expect(fourthLevel.querySelector('.grid'))
      .toHaveClass('grid-cols-[repeat(auto-fit,minmax(220px,1fr))]');
    const selectionSurfaces = editor.querySelectorAll('[data-template-cascade-card-select="true"]');
    expect(selectionSurfaces.length).toBeGreaterThan(0);
    selectionSurfaces.forEach((surface) => expect(surface).toHaveClass('absolute', 'inset-0'));
    expect(editor.querySelectorAll('[data-template-name-input-wrap="true"]')).toHaveLength(0);
    expect(within(fourthLevel).queryByText(/^0\d$/)).not.toBeInTheDocument();
  });

  it('dims unselected first-to-third-level cards while leaving fourth-level colors unaffected', () => {
    render(<TemplateManagePage />);

    const editor = document.querySelector('[data-template-diy-cascade-editor="true"]') as HTMLElement;
    const domainCards = editor.querySelectorAll('[data-template-cascade-level-button="true"][data-template-diy-level="domain"]');
    const groupCards = editor.querySelectorAll('[data-template-cascade-level-button="true"][data-template-diy-level="group"]');
    const entryCards = editor.querySelectorAll('[data-template-cascade-level-button="true"][data-template-diy-level="entry"]');
    const fieldCards = editor.querySelectorAll('[data-template-cascade-field-card="true"][data-template-diy-level="field"]');

    expect(domainCards[0]).toHaveClass('bg-[#FFF7DA]', 'text-[#7A5410]');
    expect(groupCards[0]).toHaveClass('bg-[#F5EDFF]', 'text-[#6338A6]');
    expect(entryCards[0]).toHaveClass('bg-[#EAF5FF]', 'text-[#235C9A]');
    expect(domainCards[1]).toHaveAttribute('data-template-selection-state', 'dimmed');
    expect(domainCards[1]).toHaveClass('bg-slate-100', 'text-slate-400', 'grayscale');
    expect(groupCards[1]).toHaveAttribute('data-template-selection-state', 'dimmed');
    expect(groupCards[1]).toHaveClass('bg-slate-100', 'text-slate-400', 'grayscale');
    expect(entryCards[1]).toHaveAttribute('data-template-selection-state', 'dimmed');
    expect(entryCards[1]).toHaveClass('bg-slate-100', 'text-slate-400', 'grayscale');
    expect(fieldCards[0]).toHaveClass('bg-[#ECFAF1]', 'text-[#247446]');
    expect(fieldCards[1]).toHaveClass('bg-[#ECFAF1]', 'text-[#247446]');
    expect(fieldCards[1]).not.toHaveClass('bg-slate-100', 'grayscale');

    fireEvent.click(within(editor).getByRole('button', { name: '剧情规划' }));
    const workSettingCard = within(editor)
      .getByRole('button', { name: '作品设定' })
      .closest('[data-template-cascade-level-button="true"]');
    const plotPlanningCard = within(editor)
      .getByRole('button', { name: '剧情规划' })
      .closest('[data-template-cascade-level-button="true"]');
    expect(workSettingCard).toHaveAttribute('data-template-selection-state', 'dimmed');
    expect(plotPlanningCard).toHaveAttribute('data-template-selection-state', 'selected');
    expect(plotPlanningCard).toHaveClass('bg-[#FFF7DA]', 'text-[#7A5410]');
  });

  it('creates and saves a user template from the management page', () => {
    render(<TemplateManagePage />);

    createFromDefaultPreset();
    const nameInput = screen.getByRole('textbox', { name: '保存模板名称' });
    expect(nameInput).toHaveValue('玄幻仙侠（轻量版）扩展');
    expect(screen.getByRole('button', { name: '一级删除未锁定，点击锁定' })).toHaveTextContent('锁定');
    fireEvent.change(nameInput, { target: { value: '我的人物模板' } });
    fireEvent.click(screen.getByRole('button', { name: '保存到我的模板' }));

    const saved = JSON.parse(localStorage.getItem(SAVED_SETTING_TEMPLATES_STORAGE_KEY) ?? '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe('我的人物模板');
    expect(saved[0]).toMatchObject({
      formatVersion: 3,
      source: 'custom',
      channel: 'male',
      applicability: 'genre',
      genreCategory: '玄幻仙侠',
      basePresetId: 'male-fantasy-xianxia-light',
    });
    expect(saved[0].generationBlueprint.stages.length).toBeGreaterThan(0);
    expect(saved[0].promptProfile.contractVersion).toBe('setting-generation-v2');
    expect(screen.getByRole('tab', { name: '我的模板' })).toHaveAttribute('aria-selected', 'true');
  });

  it('creates a female general empty template with channel-specific classification', () => {
    render(<TemplateManagePage />);
    const dialog = openCreateDialog();

    fireEvent.click(within(dialog).getByRole('button', { name: /^女频/ }));
    fireEvent.click(within(dialog).getByRole('button', { name: /^女频通用/ }));
    fireEvent.click(within(dialog).getByRole('button', { name: /^新建空模板/ }));
    fireEvent.click(within(dialog).getByRole('button', { name: '创建模板' }));

    expect(screen.getByRole('textbox', { name: '保存模板名称' })).toHaveValue('女频通用空模板');
    expect(screen.getByText('暂无一级分类，请在上方新增。')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '保存到我的模板' }));

    const saved = JSON.parse(localStorage.getItem(SAVED_SETTING_TEMPLATES_STORAGE_KEY) ?? '[]');
    expect(saved[0]).toMatchObject({
      channel: 'female',
      applicability: 'general',
      genreCategory: '通用',
    });
    expect(saved[0].basePresetId).toBeUndefined();
  });

  it('removes manual generation settings while keeping system-generated steps in saved packages', () => {
    render(<TemplateManagePage />);

    expect(screen.queryByRole('tab', { name: '生成设置' })).not.toBeInTheDocument();
    expect(document.querySelector('[data-template-generation-settings="true"]')).not.toBeInTheDocument();
    createFromDefaultPreset();
    expect(screen.getByText(/生成步骤由系统按当前结构自动安排/)).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: '保存模板名称' }), {
      target: { value: '系统步骤模板' },
    });
    fireEvent.click(screen.getByRole('button', { name: '保存到我的模板' }));
    const saved = JSON.parse(localStorage.getItem(SAVED_SETTING_TEMPLATES_STORAGE_KEY) ?? '[]');
    expect(saved[0].generationBlueprint.stages.length).toBeGreaterThan(0);
    expect(saved[0].promptProfile.contractVersion).toBe('setting-generation-v2');
  });

  it('requires confirmation before deleting only the selected user template', () => {
    saveSettingTemplateById(null, '人物模板', buildDefaultTemplateStructure());
    render(<TemplateManagePage />);

    fireEvent.click(screen.getByRole('tab', { name: '我的模板' }));
    expect(screen.getByRole('tab', { name: '我的模板' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('人物模板').closest('button')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: '删除模板' }));
    const dialog = screen.getByRole('dialog', { name: '删除模板？' });
    expect(dialog).toHaveTextContent('内置模板不会受到影响');
    fireEvent.click(within(dialog).getByRole('button', { name: '删除模板' }));

    expect(JSON.parse(localStorage.getItem(SAVED_SETTING_TEMPLATES_STORAGE_KEY) ?? '[]')).toEqual([]);
  });

  it('edits all four levels with deletion locks and persists the exact DIY structure', () => {
    const { unmount } = render(<TemplateManagePage />);
    createFromDefaultPreset();
    const editor = screen.getByRole('region', { name: '逐级DIY模板编辑器' });
    const monsterDelete = within(editor).getByRole('button', { name: '删除一级分类：怪物图鉴' });
    expect(monsterDelete).toBeEnabled();
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
    const restoredEditor = screen.getByRole('region', { name: '逐级DIY模板编辑器' });
    expect(within(restoredEditor).getByRole('button', { name: 'A' })).toBeInTheDocument();
    expect(within(restoredEditor).queryByRole('button', { name: '怪物图鉴' })).not.toBeInTheDocument();
  });
});
