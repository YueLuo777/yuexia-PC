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

  it('uses fixed-width cascade navigation for the first three levels and adaptive fourth-level cards', () => {
    render(<TemplateManagePage />);

    const editor = screen.getByRole('region', { name: '逐级DIY模板编辑器' });
    expect(editor.querySelector('[data-template-cascade-scroll="true"]')).toHaveClass('bg-white');
    const navigations = [
      within(editor).getByRole('navigation', { name: '模板一级设定' }),
      within(editor).getByRole('navigation', { name: '模板二级设定' }),
      within(editor).getByRole('navigation', { name: '模板三级设定' }),
    ];

    navigations.forEach((navigation) => expect(navigation).toHaveClass('flex', 'flex-wrap'));
    const fixedCards = editor.querySelectorAll('[data-template-cascade-level-button="true"]');
    expect(fixedCards.length).toBeGreaterThan(0);
    fixedCards.forEach((card) => expect(card).toHaveClass('w-[220px]', 'shrink-0'));
    const fourthLevel = within(editor).getByRole('region', { name: 'DIY四级设定' });
    expect(fourthLevel).toHaveAttribute('data-template-fourth-level', 'true');
    expect(fourthLevel).toHaveClass('bg-white');
    expect(fourthLevel).not.toHaveClass('bg-[#F5F8FA]');
    expect(fourthLevel.querySelector('.grid'))
      .toHaveClass('grid-cols-[repeat(auto-fit,minmax(220px,1fr))]');
    const selectionSurfaces = editor.querySelectorAll('[data-template-cascade-card-select="true"]');
    expect(selectionSurfaces.length).toBeGreaterThan(0);
    selectionSurfaces.forEach((surface) => expect(surface).toHaveClass('absolute', 'inset-0'));
    const nameInputs = [
      '输入一级分类名称',
      '输入二级分组名称',
      '输入三级设定名称',
      '输入四级设定名称',
    ].map((name) => within(editor).getByRole('textbox', { name }));
    nameInputs.forEach((input) => expect(input).toHaveAttribute('maxLength', '15'));
    editor.querySelectorAll('[data-template-name-input-wrap="true"]')
      .forEach((wrap) => expect(wrap).toHaveClass('w-[260px]'));
    expect(within(fourthLevel).queryByText(/^0\d$/)).not.toBeInTheDocument();
  });

  it('shows gold, purple, blue, and green level colors in structure and generation settings', () => {
    render(<TemplateManagePage />);

    const editor = document.querySelector('[data-template-diy-cascade-editor="true"]') as HTMLElement;
    const domainCard = editor.querySelector('[data-template-cascade-level-button="true"][data-template-diy-level="domain"]');
    const groupCard = editor.querySelector('[data-template-cascade-level-button="true"][data-template-diy-level="group"]');
    const entryCard = editor.querySelector('[data-template-cascade-level-button="true"][data-template-diy-level="entry"]');
    const fieldCard = editor.querySelector('[data-template-cascade-field-card="true"][data-template-diy-level="field"]');

    expect(domainCard).toHaveClass('bg-[#FFF7DA]', 'text-[#7A5410]');
    expect(groupCard).toHaveClass('bg-[#F5EDFF]', 'text-[#6338A6]');
    expect(entryCard).toHaveClass('bg-[#EAF5FF]', 'text-[#235C9A]');
    expect(fieldCard).toHaveClass('bg-[#ECFAF1]', 'text-[#247446]');

    const editorTabs = editor.querySelectorAll('[role="tab"]');
    fireEvent.click(editorTabs[1] as HTMLElement);
    const generationPanel = document.querySelector('[data-template-generation-settings="true"]') as HTMLElement;
    const stageCards = generationPanel.querySelectorAll('[data-template-generation-stage-level]');
    expect(stageCards[0]).toHaveAttribute('data-template-generation-stage-level', 'domain');
    expect(stageCards[0]).toHaveClass('bg-[#FFF7DA]', 'text-[#7A5410]');
    expect(stageCards[1]).toHaveAttribute('data-template-generation-stage-level', 'group');
    expect(stageCards[1]).toHaveClass('bg-[#F5EDFF]', 'text-[#6338A6]');
    expect(stageCards[2]).toHaveAttribute('data-template-generation-stage-level', 'entry');
    expect(stageCards[2]).toHaveClass('bg-[#EAF5FF]', 'text-[#235C9A]');
    expect(stageCards[3]).toHaveAttribute('data-template-generation-stage-level', 'field');
    expect(stageCards[3]).toHaveClass('bg-[#ECFAF1]', 'text-[#247446]');

    const selectedPathNames = generationPanel.querySelectorAll('[data-template-generation-selected-path="true"] [data-template-generation-level-name]');
    expect(selectedPathNames[0]).toHaveAttribute('data-template-generation-level-name', 'domain');
    expect(selectedPathNames[0]).toHaveClass('bg-[#F8D36A]', 'text-[#5F3E00]');
    expect(selectedPathNames[1]).toHaveAttribute('data-template-generation-level-name', 'group');
    expect(selectedPathNames[1]).toHaveClass('bg-[#D7B8FF]', 'text-[#4C238A]');
    expect(selectedPathNames[2]).toHaveAttribute('data-template-generation-level-name', 'entry');
    expect(selectedPathNames[2]).toHaveClass('bg-[#B9DBFF]', 'text-[#174C86]');
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
    expect(saved[0]).toMatchObject({ formatVersion: 3, source: 'custom' });
    expect(saved[0].generationBlueprint.stages.length).toBeGreaterThan(0);
    expect(saved[0].promptProfile.contractVersion).toBe('setting-generation-v2');
    expect(screen.getByRole('tab', { name: '我的模板' })).toHaveAttribute('aria-selected', 'true');
  });

  it('edits generation order, collection counts, dependencies, and prompt guidance with the template', () => {
    render(<TemplateManagePage />);

    fireEvent.click(screen.getByRole('tab', { name: '生成设置' }));
    expect(screen.getByRole('region', { name: '模板生成步骤' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '三级设定生成规则' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '模板总提示词' })).toBeInTheDocument();
    const stagePrompt = screen.getByRole('textbox', { name: '世界规则与力量步骤专属提示词' });
    fireEvent.change(stagePrompt, { target: { value: '先锁定世界规则，再生成后续人物和剧情。' } });
    expect(stagePrompt).toHaveValue('先锁定世界规则，再生成后续人物和剧情。');
    fireEvent.change(screen.getByRole('combobox', { name: '生成方式' }), { target: { value: 'collection' } });
    expect(screen.getByText('推荐数量')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: '生成目标' }), { target: { value: '只生成可直接写作的具体设定' } });
    expect(screen.getByDisplayValue('只生成可直接写作的具体设定')).toBeInTheDocument();
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
    const editor = screen.getByRole('region', { name: '逐级DIY模板编辑器' });
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
    const restoredEditor = screen.getByRole('region', { name: '逐级DIY模板编辑器' });
    expect(within(restoredEditor).getByRole('button', { name: 'A' })).toBeInTheDocument();
    expect(within(restoredEditor).queryByRole('button', { name: '怪物图鉴' })).not.toBeInTheDocument();
  });
});
