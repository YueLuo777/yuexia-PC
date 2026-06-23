import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

import { getWorkbenchPlotPointDisplayText, getWorkbenchPlotPointReview } from '@/features/workbench/model/workbenchPlotChain';

import { WorkbenchLibraryPanel, parseGeneratedPlotPointCandidates } from './WorkbenchLibraryPanel';

const TEST_WORK_SETTING_STARTER_VERSION = '2026-06-22-danger-zone-under-world-map-v1';

const unlockSmartImportSettings = () => {
  fireEvent.click(screen.getByTitle('解锁智能导入设定'));
};

const readWorkbenchLibraryPanelSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'WorkbenchLibraryPanel.tsx'), 'utf8');
};

const readSharedStylesSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../../shared/styles/index.css'), 'utf8');
};

const readCombinedAiConfigSelectSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/CombinedAiConfigSelect.tsx'), 'utf8');
};

const readAiRequestLogGroupsSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/AiRequestLogGroups.tsx'), 'utf8');
};

const readCapsuleSelectSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/CapsuleSelect.tsx'), 'utf8');
};

const readModelHookSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../models/hooks/useModels.ts'), 'utf8');
};

const readChapterEditorSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'ChapterEditor.tsx'), 'utf8');
};

const readEditorToolModalsSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'EditorToolModals.tsx'), 'utf8');
};

const readChapterSidebarSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'ChapterSidebar.tsx'), 'utf8');
};

const readPublishedSidebarSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'PublishedSidebar.tsx'), 'utf8');
};

const readWorkbenchAiPanelSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'WorkbenchAIPanel.tsx'), 'utf8');
};

const readAiInlineInputSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/AiInlineInput.tsx'), 'utf8');
};

const readWorkbenchPlotChainSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../model/workbenchPlotChain.ts'), 'utf8');
};

const readTestCollectionSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../tests/pages/TestCollectionPage.tsx'), 'utf8');
};

const readSettingImportHierarchyTestSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../tests/pages/SettingImportHierarchyTestPage.tsx'), 'utf8');
};

describe('WorkbenchLibraryPanel embedded flow navigation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps the empty setting row the same height as a normal setting item', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain("const WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS = 'min-h-[34px] w-full rounded-lg border border-transparent bg-white px-3 py-1.5 text-left text-sm font-black leading-5';");
    expect(panelSource).toContain('const WORKBENCH_LIBRARY_ENTRY_BUTTON_CLASS = `group cursor-default select-none ${WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS}');
    expect(panelSource).toContain('const WORKBENCH_LIBRARY_ENTRY_EMPTY_CLASS = `flex items-center ${WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS} text-gray-400`;');
    expect(panelSource).toContain('className={WORKBENCH_LIBRARY_ENTRY_EMPTY_CLASS}');
    expect(panelSource).toContain('className={`${WORKBENCH_LIBRARY_ENTRY_BUTTON_CLASS} ${');
    expect(panelSource).not.toContain('text-xs font-bold leading-5 text-gray-400');
    expect(panelSource).not.toContain('<p className="px-3 py-4 text-xs text-gray-400">{isOutlineCharacterScope ?');
  });

  it('keeps setting and brainstorm sidebar rows flush with the sidebar divider', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const { dirname, join } = await import('node:path');
    const chapterSidebarSource = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'ChapterSidebar.tsx'), 'utf8');
    const settingSidebarStart = panelSource.indexOf('gridTemplateRows: activeTab === SETTING_TAB && !activeIsBrainstorm');
    const settingSidebarSource = panelSource.slice(settingSidebarStart, settingSidebarStart + 12000);

    expect(settingSidebarStart).toBeGreaterThan(-1);
    expect(settingSidebarSource).toContain('className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 px-1 py-2"');
    expect(settingSidebarSource).toContain("xy-setting-sidebar-scrollbar min-h-0 flex-1 overflow-y-auto space-y-1");
    expect(settingSidebarSource).toContain('className="mt-0.5 space-y-0.5"');
    expect(chapterSidebarSource).toContain('className="editor-scrollbar flex-1 overflow-y-auto px-1 py-2"');
    expect(panelSource).toContain("const WORKBENCH_FOLDER_GROUP_BUTTON_CLASS = 'group flex h-9 w-full");
    expect(panelSource).toContain("const WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS = 'min-h-[34px] w-full");
    expect(settingSidebarSource).not.toContain('bg-gray-50 px-3 py-3');
    expect(settingSidebarSource).not.toContain('xy-setting-sidebar-scrollbar scrollbar-scroll-only');
    expect(settingSidebarSource).not.toContain('scrollbar-half-width min-h-0 flex-1 overflow-y-auto space-y-1');
    expect(settingSidebarSource).not.toContain('space-y-0.5 overflow-y-auto pr-1');
    expect(settingSidebarSource).not.toContain('max-h-[760px] space-y-0.5 overflow-y-auto');
    expect(settingSidebarSource).not.toContain('setting-group:${effectiveLibraryTab}:${group.type}');
  });

  it('uses minimum left navigation widths as setting library defaults for new works', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain('const SETTING_LIBRARY_LEFT_MIN_WIDTH = 180;');
    expect(panelSource).toContain('const SETTING_LIBRARY_LEFT_WIDTH = SETTING_LIBRARY_LEFT_MIN_WIDTH;');
    expect(panelSource).toContain('const SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH = 260;');
    expect(panelSource).toContain('const PLOT_POINT_LAYOUT_TREE_MIN_WIDTH = 132;');
    expect(panelSource).toContain('const PLOT_POINT_LAYOUT_TREE_WIDTH = PLOT_POINT_LAYOUT_TREE_MIN_WIDTH;');
    expect(panelSource).not.toContain('const SETTING_LIBRARY_LEFT_WIDTH = 430;');
    expect(panelSource).not.toContain('const PLOT_POINT_LAYOUT_TREE_WIDTH = 168;');
  });

  it('auto-creates an editable outline setting when typing into the empty setting name field', async () => {
    localStorage.setItem('workbench-outline-empty-name-edit-test_work_setting_starter_version', TEST_WORK_SETTING_STARTER_VERSION);

    render(
      <WorkbenchLibraryPanel
        storageKey="workbench-outline-empty-name-edit-test"
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无内容"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('输入设定名'), { target: { value: '测试设定名' } });

    expect(await screen.findByDisplayValue('测试设定名')).toBeInTheDocument();
    const storedEntries = JSON.parse(localStorage.getItem('workbench-outline-empty-name-edit-test') ?? '[]');
    const storedSettingEntries = storedEntries.filter((entry: { tab: string }) => entry.tab === '大纲');
    expect(storedSettingEntries).toHaveLength(1);
    expect(storedSettingEntries[0]).toMatchObject({ tab: '大纲', title: '测试设定名' });
  });

  it('auto-creates an editable outline setting when typing into the empty setting preview field', async () => {
    localStorage.setItem('workbench-outline-empty-preview-edit-test_work_setting_starter_version', TEST_WORK_SETTING_STARTER_VERSION);

    render(
      <WorkbenchLibraryPanel
        storageKey="workbench-outline-empty-preview-edit-test"
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无内容"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('这里可以直接输入设定内容，会自动新建设定。'), { target: { value: '测试设定正文' } });

    expect(await screen.findByDisplayValue('测试设定正文')).toBeInTheDocument();
    const storedEntries = JSON.parse(localStorage.getItem('workbench-outline-empty-preview-edit-test') ?? '[]');
    const storedSettingEntries = storedEntries.filter((entry: { tab: string }) => entry.tab === '大纲');
    expect(storedSettingEntries).toHaveLength(1);
    expect(storedSettingEntries[0]).toMatchObject({ tab: '大纲', title: '新建大纲' });
    expect(JSON.parse(storedSettingEntries[0].content)).toMatchObject({ type: '核心设定', body: '测试设定正文' });
  });

  it('smart-imports bracket subsections inside one tagged setting', async () => {
    const storageKey = 'workbench-smart-import-new-group-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(`${storageKey}_tab_configs_v1`, JSON.stringify({
      大纲: {
        aiOutput: '<人物设定>\n*人物设定*：\n\n【主角人设】：\n林刻冷酷果决。\n\n【重要配角】：\n吞吞是系统助手。\n\n【核心反派】：\n永恒神庭追杀吞噬修士。\n</人物设定>',
      },
    }));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    const smartImportButton = screen.getByRole('button', { name: '智能导入设定' });
    const entriesBeforeLockedClick = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    expect(smartImportButton).toBeDisabled();
    expect(smartImportButton).toHaveClass('bg-gray-50', 'text-gray-300');
    const lockedSmartImportToggle = screen.getByTitle('解锁智能导入设定');
    expect(lockedSmartImportToggle).not.toBeDisabled();
    expect(lockedSmartImportToggle).toHaveClass('bg-amber-50', 'text-amber-500');
    expect(lockedSmartImportToggle).not.toHaveClass('text-gray-400');
    fireEvent.click(smartImportButton);
    expect(JSON.parse(localStorage.getItem(storageKey) ?? '[]')).toHaveLength(entriesBeforeLockedClick.length);

    unlockSmartImportSettings();
    expect(smartImportButton).not.toBeDisabled();
    expect(smartImportButton).toHaveClass('bg-[#08AACE]', 'text-white');
    expect(screen.getByTitle('锁定智能导入设定')).toHaveClass('bg-[#EAF9FD]', 'text-[#08AACE]');
    fireEvent.click(smartImportButton);
    await waitFor(() => {
      const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
      expect(storedEntries.some((entry: { tab: string }) => entry.tab === '角色')).toBe(true);
    });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const storedSettingEntries = storedEntries.filter((entry: { tab: string }) => entry.tab === '大纲');
    const storedRoleEntries = storedEntries.filter((entry: { tab: string }) => entry.tab === '角色');
    expect(storedSettingEntries).toHaveLength(0);
    const importedRoleEntry = storedRoleEntries.find((entry: { title: string }) => entry.title === '人物');
    expect(importedRoleEntry).toBeTruthy();
    const importedRole = JSON.parse(importedRoleEntry.content);
    expect(importedRole.baseSetting).toContain('【主角人设】：\n林刻冷酷果决。');
    expect(importedRole.baseSetting).toContain('【重要配角】：\n吞吞是系统助手。');
    expect(importedRole.baseSetting).toContain('【核心反派】：\n永恒神庭追杀吞噬修士。');
  });

  it('smart-imports each tagged group as one setting when brackets are subsections', async () => {
    const storageKey = 'workbench-smart-import-direct-subsections-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(`${storageKey}_tab_configs_v1`, JSON.stringify({
      大纲: {
        aiOutput: [
          '<核心设定>',
          '【故事起点】：',
          '林刻开局被退婚。',
          '',
          '【核心矛盾】：',
          '永恒神庭追杀吞噬修士。',
          '</核心设定>',
          '',
          '<剧情规划>',
          '【剧情大纲】：',
          '主角从凡界一路杀上永恒天。',
          '',
          '【黄金三章钩子】：',
          '退婚、反杀、逃亡。',
          '</剧情规划>',
        ].join('\n'),
      },
    }));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    unlockSmartImportSettings();
    fireEvent.click(screen.getByRole('button', { name: '智能导入设定' }));

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const storedSettingEntries = storedEntries.filter((entry: { tab: string }) => entry.tab === '大纲');
    expect(storedSettingEntries).toHaveLength(2);
    expect(storedSettingEntries.map((entry: { title: string }) => entry.title)).toEqual([
      '核心设定',
      '剧情规划',
    ]);
    expect(storedSettingEntries.map((entry: { content: string }) => JSON.parse(entry.content).type)).toEqual([
      '核心设定',
      '剧情规划',
    ]);
    expect(JSON.parse(storedSettingEntries[0].content).body).toContain('【故事起点】：\n林刻开局被退婚。');
    expect(JSON.parse(storedSettingEntries[0].content).body).toContain('【核心矛盾】：\n永恒神庭追杀吞噬修士。');
    expect(JSON.parse(storedSettingEntries[1].content).body).toContain('【黄金三章钩子】：\n退婚、反杀、逃亡。');
  });

  it('smart-imports top page tags into settings and role libraries', async () => {
    const storageKey = 'workbench-smart-import-top-page-tags-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(`${storageKey}_tab_configs_v1`, JSON.stringify({
      大纲: {
        aiOutput: [
          '<作品设定>',
          '<核心设定>',
          '*基础设定*：',
          '',
          '【故事类型】：',
          '东方玄幻升级流。',
          '</核心设定>',
          '</作品设定>',
          '',
          '<人物设定>',
          '*男主角设定*：',
          '',
          '【人物姓名】：',
          '林刻',
          '',
          '【身份定位】：',
          '男主角',
          '',
          '【外貌】：',
          '黑衣少年，目光冷静。',
          '',
          '【核心性格】：',
          '果断但不滥杀。',
          '</人物设定>',
          '',
          '<势力地图>',
          '<世界地图>',
          '*世界架构*：',
          '',
          '【世界架构】：',
          '凡界、灵界、九重天依次递进。',
          '</世界地图>',
          '<正派势力>',
          '*青云宗*：',
          '',
          '【基本信息】：',
          '东域正道宗门。',
          '</正派势力>',
          '</势力地图>',
          '',
          '<道具资源>',
          '<物品装备>',
          '*黑玉令*：',
          '',
          '【基本信息】：',
          '旧界门钥匙。',
          '</物品装备>',
          '</道具资源>',
          '',
          '<怪物图鉴>',
          '<怪物列表>',
          '*黑鳞妖狼*：',
          '',
          '【怪物形象】：',
          '黑鳞覆身，眼泛青光。',
          '</怪物列表>',
          '</怪物图鉴>',
          '',
          '<伏笔线索>',
          '<主线伏笔>',
          '*黑玉令真相*：',
          '',
          '【埋设内容】：',
          '黑玉令来自旧界。',
          '</主线伏笔>',
          '</伏笔线索>',
        ].join('\n'),
      },
    }));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    unlockSmartImportSettings();
    fireEvent.click(screen.getByRole('button', { name: '智能导入设定' }));

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const storedSettings = storedEntries.filter((entry: { tab: string }) => entry.tab === '大纲');
    const storedRoles = storedEntries.filter((entry: { tab: string }) => entry.tab === '角色');
    expect(storedSettings.map((entry: { title: string }) => entry.title)).toEqual([
      '基础设定',
      '世界架构',
      '青云宗',
      '黑玉令',
      '黑鳞妖狼',
      '黑玉令真相',
    ]);
    expect(storedSettings.map((entry: { content: string }) => JSON.parse(entry.content).type)).toEqual([
      '核心设定',
      '世界地图',
      '正派势力',
      '物品装备',
      '怪物列表',
      '主线伏笔',
    ]);
    expect(storedRoles).toHaveLength(1);
    expect(storedRoles[0].title).toBe('林刻');
    const importedRole = JSON.parse(storedRoles[0].content);
    expect(importedRole.type).toBe('男主角');
    expect(importedRole.baseSetting).toContain('【外貌】：\n黑衣少年，目光冷静。');
    expect(importedRole.baseSetting).toContain('【核心性格】：\n果断但不滥杀。');
  });

  it('reveals hidden setting groups when smart import fills them', async () => {
    const storageKey = 'workbench-smart-import-reveals-hidden-groups-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(`${storageKey}_hidden_setting_types`, JSON.stringify(['核心设定', '剧情规划']));
    localStorage.setItem(`${storageKey}_tab_configs_v1`, JSON.stringify({
      大纲: {
        aiOutput: [
          '<核心设定>',
          '【故事起点】：',
          '林刻开局被退婚。',
          '',
          '【核心矛盾】：',
          '永恒神庭追杀吞噬修士。',
          '</核心设定>',
          '<剧情规划>',
          '【剧情大纲】：',
          '主角从凡界一路杀上永恒天。',
          '',
          '【黄金三章钩子】：',
          '退婚、反杀、逃亡。',
          '</剧情规划>',
        ].join('\n'),
      },
    }));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    unlockSmartImportSettings();
    fireEvent.click(screen.getByRole('button', { name: '智能导入设定' }));

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const storedSettingEntries = storedEntries.filter((entry: { tab: string }) => entry.tab === '大纲');
    const hiddenTypes = JSON.parse(localStorage.getItem(`${storageKey}_hidden_setting_types`) ?? '[]');
    expect(storedSettingEntries).toHaveLength(2);
    expect(hiddenTypes).toEqual([]);
    expect(screen.getByRole('button', { name: '作品设定2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '核心设定1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '剧情规划1' })).toBeInTheDocument();
  });

  it('counts only visible work settings in the work setting scope badge', async () => {
    const storageKey = 'workbench-visible-setting-count-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    const visibleEntries = Array.from({ length: 5 }, (_, index) => ({
      id: `visible-${index}`,
      tab: '大纲',
      title: `人物设定${index + 1}`,
      content: JSON.stringify({ type: '人物设定', body: `人物设定内容${index + 1}` }),
      updatedAt: '2026/6/15 19:00:00',
    }));
    const hiddenEntries = Array.from({ length: 43 }, (_, index) => ({
      id: `hidden-${index}`,
      tab: '大纲',
      title: `隐藏设定${index + 1}`,
      content: JSON.stringify({ type: '测试隐藏组', body: `隐藏内容${index + 1}` }),
      updatedAt: '2026/6/15 19:00:00',
    }));
    localStorage.setItem(storageKey, JSON.stringify([...visibleEntries, ...hiddenEntries]));
    localStorage.setItem(`${storageKey}_hidden_setting_types`, JSON.stringify(['测试隐藏组']));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    expect(screen.getByRole('button', { name: '作品设定5' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '作品设定48' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '人物设定5' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '测试隐藏组' })).not.toBeInTheDocument();
  });

  it('does not render the internal setting role brainstorm tabs and shows the requested brainstorm page', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain('这里显示选中的脑洞内容，也可以直接编辑。');
    expect(panelSource).toContain('defaultActiveTab');
    expect(panelSource).not.toContain("tabs={['设定', '角色', '脑洞']}");
  });

  it('renders outline linked context as current, other-setting, or brainstorm segmented control', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const linkControlStart = panelSource.indexOf("title={isOutlineCharacterScope ? '关联当前人物设定' : '关联当前选中的设定预览'}");
    const linkControlSource = panelSource.slice(panelSource.lastIndexOf('<div className="mt-3 flex min-w-0 items-center gap-1.5">', linkControlStart), panelSource.indexOf('<div className="mt-3 flex items-center gap-2">', linkControlStart));

    expect(linkControlStart).toBeGreaterThan(-1);
    expect(panelSource).toContain("settingLinkSource?: 'current' | 'other' | 'brainstorm' | null;");
    expect(panelSource).toContain('associationSessionId?: string | null;');
    expect(panelSource).toContain('linkedOtherSettingIds?: string[];');
    expect(panelSource).toContain('getWorkbenchAssociationRuntimeId');
    expect(panelSource).toContain('isWorkbenchAssociationRuntimeCurrent(activeTabConfig.associationSessionId)');
    expect(panelSource).toContain("settingLinkSource: 'brainstorm'");
    expect(panelSource).toContain('promptDisabled: false');
    expect(panelSource).toContain("settingLinkSource: 'current'");
    expect(panelSource).toContain("settingLinkSource: selectedIds.length > 0 ? 'other' : null");
    expect(panelSource).toContain('const getActiveLinkedSettingSnapshot = (): { source: SettingLinkSource; title: string; text: string } => {');
    expect(panelSource).toContain("source === 'current'");
    expect(panelSource).toContain("source === 'other'");
    expect(panelSource).toContain('text: getSettingEntryBody(currentEntry)');
    expect(panelSource).toContain('text: currentRoleEntry && currentRole ? buildRoleReaderContent(currentRoleEntry, currentRole) :');
    expect(linkControlSource).toContain('关联');
    expect(linkControlSource).toContain('当前设定');
    expect(linkControlSource).toContain('其他设定');
    expect(linkControlSource).toContain('脑洞');
    expect(linkControlSource).not.toContain('if (isOutlineCharacterScope) return;');
    expect(linkControlSource).not.toContain('disabled={isOutlineCharacterScope}');
    expect(linkControlSource).toContain('关联脑洞库内容到人物设定');
    expect(linkControlSource).toContain('openOtherSettingReader');
    expect(linkControlSource).toContain('activeSettingLinkSource === \'current\'');
    expect(linkControlSource).toContain('activeSettingLinkSource === \'other\'');
    expect(linkControlSource).toContain('activeSettingLinkSource === \'brainstorm\'');
    expect(linkControlSource).toContain('updateActiveTabConfig({ associationSessionId: null, settingLinkSource: null, promptDisabled: false })');
    expect(linkControlSource).toContain('loadedBrainstormId: null');
    expect(linkControlSource).toContain('linkedOtherSettingIds: []');
    expect(linkControlSource).toContain('promptDisabled: true');
    expect(linkControlSource).toContain('关联 <WordCountText value={linkedSettingWordCount} compact />');
    expect(linkControlSource).not.toContain('label="关联脑洞"');
    expect(linkControlSource).not.toContain('linkedLabel="已关联脑洞"');
    expect(panelSource).toContain('const OTHER_SETTING_LINK_TABS');
    expect(panelSource).toContain('关联其他设定');
    const otherSettingModalStart = panelSource.indexOf('const otherSettingReaderModal = isOtherSettingReaderOpen ? createPortal(');
    const otherSettingModalSource = panelSource.slice(otherSettingModalStart, panelSource.indexOf('const brainstormEntries = entries.filter', otherSettingModalStart));
    expect(otherSettingModalStart).toBeGreaterThan(-1);
    expect(otherSettingModalSource).toContain('selectAllCurrentOtherSettingLinkTab');
    expect(otherSettingModalSource).toContain('toggleVisibleOtherSettingLinkGroupSelection(group.entries)');
    expect(otherSettingModalSource).toContain('关联所有');
    expect(otherSettingModalSource).toContain('全选');
    expect(otherSettingModalSource).toContain('aria-label={`${draftOtherSettingReaderIds.has(entry.id) ? \'取消选择\' : \'选择\'}${entry.title}`}');
    expect(otherSettingModalSource).toContain('toggleDraftOtherSettingReaderId(entry.id)');
    expect(otherSettingModalSource).toContain("draftOtherSettingReaderIds.has(selectedOtherSettingLinkEntry.id) ? '已勾选' : '未勾选'");
    expect(otherSettingModalSource).not.toContain('关联此项');
    expect(otherSettingModalSource).not.toContain('selectedOtherSettingLinkEntry.tabTitle');
    expect(otherSettingModalSource).not.toContain('selectedOtherSettingLinkEntry.type} ·');
    expect(panelSource).toContain("rawContent.startsWith('{') ? '' : entry.content");
    expect(panelSource).toContain('作品设定');
    expect(panelSource).toContain('人物设定');
    expect(panelSource).toContain('势力地图');
    expect(panelSource).toContain('道具资源');
    expect(panelSource).toContain('怪物图鉴');
    expect(panelSource).toContain('伏笔线索');
    expect(panelSource).toContain("wrapAiRequestTag('关联其他设定'");
    expect(panelSource).toContain('const isPromptDisabledForRequest = activeTab === SETTING_TAB');
    expect(panelSource).toContain("outlineSettingScope !== 'character' && getActiveSettingLinkSource() === 'current'");
    expect(panelSource).toContain('const effectivePromptDisabled = activeTab === SETTING_TAB');
    expect(panelSource).toContain("!isOutlineCharacterScope && activeSettingLinkSource === 'current'");
    expect(panelSource).toContain('promptDisabled={effectivePromptDisabled}');
    expect(panelSource).not.toContain('autoDisablePromptOnCurrentLink');
    expect(panelSource).not.toContain('关联当前时自动禁用提示词');
  });

  it('removes the old right-click unlock flow from clear settings', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).not.toContain('clearSettingsUnlockContextMenu');
    expect(panelSource).not.toContain('clearSettingsTooltipLayer');
    expect(panelSource).not.toContain('clearSettingsUnlockedTarget');
    expect(panelSource).not.toContain('已锁定，右键可以解锁');
    expect(panelSource).toContain('aria-disabled="true"');
  });

  it('supports clearing character settings from the setting page without clearing work settings', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain("type ClearSettingsTarget = 'settingCategories' | 'settingEntries' | 'roleCategories' | 'roleEntries';");
    expect(panelSource).toContain("const categoryMenuClearCategoryTarget: ClearSettingsTarget = categoryMenu?.kind === 'role' ? 'roleCategories' : 'settingCategories';");
    expect(panelSource).toContain("const categoryMenuClearEntryTarget: ClearSettingsTarget = categoryMenu?.kind === 'role' ? 'roleEntries' : 'settingEntries';");
    expect(panelSource).toContain('const clearRoleEntries = () => {');
    expect(panelSource).toContain('persist(entries.filter((entry) => entry.tab !== ROLE_TAB || isMaleProtagonistRoleType(parseRoleContent(entry.content).type)));');
    expect(panelSource).toContain('const deletableRoleEntries = useMemo(() => (');
    expect(panelSource).toContain('openClearSettingsConfirmFromMenu(categoryMenuClearEntryTarget)');
    expect(panelSource).toContain("if (clearSettingsConfirmTarget === 'roleEntries') clearRoleEntries();");
    expect(panelSource).toContain("roleEntries: {\n      label: '角色'");
    expect(panelSource).not.toContain('activeTab === SETTING_TAB && !isOutlineCharacterScope && (');
  });

  it('does not overwrite saved setting splitter width while syncing visible width', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const syncStart = panelSource.indexOf('const syncVisibleLeftWidth = () => {');
    const syncEffectSource = panelSource.slice(syncStart, panelSource.indexOf('}, [activeTab, scale, storageKey]);', syncStart));

    expect(syncStart).toBeGreaterThan(-1);
    expect(syncEffectSource).toContain('setSettingLibraryLeftWidth(readSettingLibraryLeftWidth(storageKey, activeTab, scale));');
    expect(syncEffectSource).toContain("window.addEventListener('resize', syncVisibleLeftWidth);");
    expect(syncEffectSource).not.toContain('persistSettingLibraryWidth');
    expect(syncEffectSource).not.toContain('clampSettingLibraryLeftWidth(currentWidth');
  });

  it('places brainstorm output clear action in the save action group and font tools in the header slot', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const brainstormPreviewStart = panelSource.indexOf('placeholder="这里显示选中的脑洞内容，也可以直接编辑。"');
    const brainstormPreviewEnd = panelSource.indexOf('</main>', brainstormPreviewStart);
    const brainstormPreviewSource = panelSource.slice(brainstormPreviewStart, brainstormPreviewEnd);
    const brainstormOutputStart = panelSource.indexOf('xy-brainstorm-output-preview-list');
    const brainstormOutputEnd = panelSource.indexOf('className="shrink-0 border-t border-gray-100 bg-white px-4 py-3"', brainstormOutputStart);
    const brainstormOutputSource = panelSource.slice(brainstormOutputStart, brainstormOutputEnd);
    const actionGroupStart = panelSource.indexOf('<div className="flex min-w-0 flex-wrap items-center gap-2">', brainstormOutputEnd);
    const actionGroupSource = panelSource.slice(actionGroupStart, panelSource.indexOf('{settingLibraryMode ===', actionGroupStart));

    expect(panelSource).not.toContain('xy-floating-brainstorm-output-action-tool');
    expect(actionGroupStart).toBeGreaterThan(-1);
    expect(actionGroupSource).toContain('替换当前脑洞');
    expect(actionGroupSource).not.toContain('替换脑洞');
    expect(actionGroupSource).toContain('保存为新脑洞');
    expect(actionGroupSource).toContain('复制脑洞');
    expect(actionGroupSource).toContain('清空脑洞');
    expect(actionGroupSource).toContain('onClick={copyBrainstormOutputArea}');
    expect(actionGroupSource).toContain('disabled={!brainstormOutputValue.trim()}');
    expect(actionGroupSource).toContain('onClick={clearBrainstormOutputArea}');
    expect(actionGroupSource).toContain('disabled={!brainstormOutputValue.trim() && !isLibraryAiLoading}');
    expect(actionGroupSource).not.toContain('onClick={clearLibraryAiDialog}');
    expect(panelSource).toContain('const clearBrainstormOutputArea = () => {');
    expect(panelSource).toContain('const copyBrainstormOutputArea = () => {');
    expect(panelSource).toContain('void navigator.clipboard.writeText(outputText);');
    expect(panelSource).toContain("if (activeTab !== BRAINSTORM_TAB) return;");
    expect(panelSource).toContain("output: '',");
    expect(panelSource).toContain("result: '',");
    expect(actionGroupSource).not.toContain('confirmDeleteEntry(currentSelectedEntry);');
    expect(panelSource).toContain("const [activeLibraryFontTarget, setActiveLibraryFontTarget] = useState<LibraryFontTarget>('brainstormOutput');");
    expect(panelSource).toContain('const renderActiveLibraryFontSizeTool = () => {');
    expect(panelSource).toContain("if (activeLibraryFontTarget === 'brainstormPreview')");
    expect(panelSource).toContain('className="xy-header-stream-tool"');
    expect(panelSource).toContain("ariaLabel: '脑洞输出字号'");
    expect(panelSource).toContain("ariaLabel: '脑洞预览字号'");
    expect(panelSource).toContain("onFocus={() => setActiveLibraryFontTarget('brainstormPreview')}");
    expect(panelSource).toContain("onFocus={() => setActiveLibraryFontTarget('brainstormOutput')}");
    expect(panelSource).toContain('createPortal(renderLibraryHeaderFontSizeTool(), headerToolPortalTarget)');
    expect(brainstormPreviewSource).not.toContain('xy-floating-border-font-tool');
    expect(brainstormOutputSource).not.toContain('xy-floating-border-font-tool');
    expect(brainstormOutputSource).not.toContain('xy-floating-border-stream-tool');
    expect(panelSource).toContain('className="xy-stream-toggle-text">流式输出</span>');
    expect(panelSource).toContain('className="xy-stream-toggle-track"');
    expect(panelSource).toContain('className="xy-stream-toggle-thumb"');
    expect(panelSource).toContain('updateActiveTabConfig({ brainstormStreamEnabled: event.target.checked })');
    expect(panelSource).not.toContain('xy-floating-brainstorm-output-font-tool');
    expect(panelSource).not.toContain('<span>流式输出</span>');
    expect(styleSource).toContain('.xy-floating-border-stream-tool {');
    expect(styleSource).toContain('.xy-header-stream-tool {');
    expect(styleSource).toContain('.xy-stream-toggle-text {');
    expect(styleSource).toContain('height: 1.76rem;');
    expect(styleSource).toContain('height: 2.25rem;');
    expect(styleSource).toContain('background: #ffffff;');
    expect(styleSource).toContain('width: 2.02rem;');
    expect(styleSource).toContain('.xy-stream-toggle-track {');
    expect(styleSource).toContain('background: #08AACE;');
  });
  it('uses transparent border backplates for combined model and prompt selector labels', async () => {
    const source = await readCombinedAiConfigSelectSource();
    const styleSource = await readSharedStylesSource();

    expect(source).toContain('xy-combined-ai-config-label xy-border-embedded-transparent-backplate');
    expect(source).toContain('xy-combined-ai-config-manage xy-border-embedded-transparent-backplate');
    expect(source).not.toContain('-translate-y-1/2 bg-white px-1.5 text-[11px]');
    expect(source).not.toContain('text-[11px] font-black leading-none text-[#08AACE]');
    expect(source).not.toContain('rounded-full bg-white text-[#08AACE]');
    expect(styleSource).toContain('.xy-combined-ai-config-label,');
    expect(styleSource).toContain('font-size: 13px;');
    expect(styleSource).toContain('min-width: 2.65rem;');
    expect(styleSource).toContain('background-image: none !important;');
    expect(styleSource).toContain('.xy-combined-ai-config-label::before,');
    expect(styleSource).toContain('display: none !important;');
    expect(styleSource).toContain('.xy-combined-ai-config-manage svg');
    expect(styleSource).toContain('drop-shadow(0 0 1px #ffffff)');
  });
  it('keeps model and prompt dropdowns flush with their selectors', async () => {
    const capsuleSource = await readCapsuleSelectSource();
    const combinedSource = await readCombinedAiConfigSelectSource();

    expect(capsuleSource).toContain('top: rect.bottom,');
    expect(capsuleSource).toContain("'absolute left-0 right-0 top-full'");
    expect(capsuleSource).not.toContain('rect.bottom + 6');
    expect(capsuleSource).not.toContain('top-[calc(100%+6px)]');
    expect(combinedSource).toContain('absolute top-full z-[10050]');
    expect(combinedSource).not.toContain('top-[calc(100%+6px)]');
  });
  it('keeps disabled floating capsule selects outlined instead of filled', async () => {
    const capsuleSource = await readCapsuleSelectSource();

    expect(capsuleSource).toContain("controlHeight: 'h-[42px]'");
    expect(capsuleSource).toContain("disabled ? 'border-slate-200 bg-white text-slate-400' : 'border-[#08AACE]'");
    expect(capsuleSource).toContain("${disabled ? 'bg-white' : 'bg-white'}");
    expect(capsuleSource).not.toContain("disabled ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-[#08AACE]'");
  });
  it('routes prompt management categories to setting and chapter-outline names', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const aiPanelSource = await readWorkbenchAiPanelSource();

    expect(panelSource).toContain("const PROMPT_SETTING_CATEGORY = '设定';");
    expect(panelSource).toContain("const DETAIL_OUTLINE_PROMPT_CATEGORY = '章纲';");
    expect(panelSource).toContain('const PLOT_CHAIN_PROMPT_CATEGORY = DETAIL_OUTLINE_PROMPT_CATEGORY;');
    expect(panelSource).toContain('activeTab === DETAIL_OUTLINE_TAB');
    expect(panelSource).toContain('? DETAIL_OUTLINE_PROMPT_CATEGORY');
    expect(panelSource).toContain("const outlinePromptCategory = plotPointStandalone ? PLOT_CHAIN_PROMPT_CATEGORY : isDetailOutlineTab ? DETAIL_OUTLINE_PROMPT_CATEGORY : '梗概';");
    expect(panelSource).not.toContain("const PROMPT_SETTING_CATEGORY = '大纲';");
    expect(panelSource).not.toContain("const PLOT_CHAIN_PROMPT_CATEGORY = '剧情链';");
    expect(panelSource).toContain("'暂无设定提示词'");
    expect(aiPanelSource).toContain("new Set(['脑洞', '设定', '章纲', '审核', '点评', '润色', '状态', '梗概'])");
  });
  it('keeps production AI output boxes running through background tasks', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const aiPanelSource = await readWorkbenchAiPanelSource();
    const chapterEditorSource = await readChapterEditorSource();

    expect(panelSource).toContain("target: 'workbenchLibraryAi'");
    expect(panelSource).toContain("target: 'workbenchOutlineAi'");
    expect(panelSource).toContain("target: 'workbenchPlotPointAi'");
    expect(panelSource).toContain('subscribeBackgroundAiTasks(syncBackgroundTasks)');
    expect(panelSource).toContain('stopBackgroundAiTask');
    expect(panelSource).not.toContain('libraryAiAbortRef');

    expect(aiPanelSource).toContain("target: 'workbenchAiPanel'");
    expect(aiPanelSource).toContain('backgroundTaskId?: string');
    expect(aiPanelSource).toContain('subscribeBackgroundAiTasks(syncBackgroundTasks)');
    expect(aiPanelSource).not.toContain('abortControllerRef.current?.abort()');

    expect(chapterEditorSource).toContain("target: 'chapterReview'");
    expect(chapterEditorSource).toContain('writeReviewBackgroundTaskId');
    expect(chapterEditorSource).toContain('subscribeBackgroundAiTasks(syncBackgroundTasks)');
    expect(chapterEditorSource).not.toContain('reviewAiAbortRef');
  });
  it('keeps full plot point text when generated content contains a narrative colon', () => {
    const candidates = parseGeneratedPlotPointCandidates([
      '1. 林刻猛地从课桌上惊醒，发现自己竟然回到了高考考场上，但周围一切又不太对劲——这不是三年前的高考，而是三年后他死去的那一刻！脑海深处突然响起机械声：“学霸修仙系统绑定成功，倒计时72小时，请宿主做好准备，三日后地球将迎来第一波灵气潮汐。”',
      'AI评价：这个开头直接建立主角处境和重生带来的震撼，同时立刻引入系统金手指和倒计时压力，制造紧迫感和悬念。',
    ].join('\n'));

    expect(candidates).toHaveLength(1);
    expect(candidates[0].adapted).toContain('林刻猛地从课桌上惊醒');
    expect(candidates[0].adapted).toContain('脑海深处突然响起机械声');
    expect(candidates[0].adapted).toContain('学霸修仙系统绑定成功');
    expect(candidates[0].review).toContain('这个开头直接建立主角处境');
  });

  it('moves inline plot point AI review text out of the timeline preview body', () => {
    const item = {
      id: 'ai:inline-review',
      title: '缴费窗口冲突',
      source: 'AI生成',
      originalGenre: 'AI生成',
      original: '',
      adapted: '林刻盯着那份合同沉默几秒，最终还是咬破指尖按了下去。\\nAI评价：医院到武馆的切入把妹妹这条软肋立得很稳，压力直接。',
      variable: '',
      score: '82',
    } as const;

    const displayText = getWorkbenchPlotPointDisplayText(item, item.adapted);
    const reviewText = getWorkbenchPlotPointReview(item, true);

    expect(displayText).toContain('林刻盯着那份合同沉默几秒');
    expect(displayText).not.toContain('AI评价');
    expect(displayText).not.toContain('医院到武馆');
    expect(reviewText).toContain('AI评价：医院到武馆的切入');
  });
  it('places preview word counts on the top-left border beside frame titles', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(styleSource).toContain('.xy-floating-field .xy-floating-count.xy-floating-count-top-left');
    expect(styleSource).toContain('.xy-floating-field.xy-floating-outline-preview .xy-floating-count.xy-floating-count-top-left');
    expect(styleSource).toContain('left: var(--xy-floating-count-left, 6.2rem);');
    expect(styleSource).toContain('.xy-floating-field .xy-floating-count.xy-floating-count-top-left::before');
    expect(styleSource).toContain('left: -1.2rem;');
    expect(styleSource).toContain('top: 0;');
    expect(panelSource).toContain('xy-floating-count xy-floating-count-top-left');
    expect(panelSource).toContain('<label className={isDetailOutlineTab ? \'xy-floating-title-count xy-detail-outline-title-count\' : undefined}>');
    expect(panelSource).toContain('<label aria-hidden="true" className="opacity-0">脑洞预览</label>');
    expect(panelSource).toContain('aria-label="脑洞名称"');
    expect(panelSource).toContain('onChange={(event) => updateEntry(currentSelectedEntry.id, { title: event.target.value })}');
    expect(panelSource).toContain('xy-floating-title-input max-w-[120px] min-w-[58px] text-sm font-black leading-none text-slate-950 outline-none');
    expect(panelSource).toContain('style={getFloatingTitleInputStyle(currentSelectedEntry.title, 3, 9)}');
    expect(panelSource).toContain('style={getFloatingTitleInputStyle(titleValue, 4, 12)}');
    expect(panelSource).toContain('<label className="xy-floating-title-count">设定预览 <span><WordCountText value={countTextWords(currentSelectedSetting ? currentSelectedSetting.body : currentSelectedEntry.content)} /></span></label>');
    expect(panelSource).toContain('xy-floating-inline-title-tool xy-brainstorm-floating-title-tool xy-floating-title-count xy-border-embedded-transparent-backplate');
    expect(styleSource).toContain('.xy-floating-field.xy-floating-outline-preview label.xy-floating-title-count');
    expect(styleSource).toContain('gap: 0.32rem;');
    expect(styleSource).toContain('.xy-floating-title-count > span');
    expect(styleSource).toContain('width: var(--xy-floating-title-input-width, auto) !important;');
    expect(styleSource).toContain('border: 0 !important;');
    expect(styleSource).toContain('border-radius: 0 !important;');
    expect(styleSource).toContain('background: transparent !important;');
    expect(styleSource).toContain('padding: 0 !important;');
    expect(panelSource).toContain("'--xy-floating-title-input-width': `${normalizedLength.toFixed(2)}em`");
    expect(styleSource).toContain('height: 20px;');
    expect(styleSource).toContain('align-items: baseline;');
    expect(styleSource).toContain('font-size: 1rem;');
    expect(styleSource).toContain('font-weight: 500;');
    expect(styleSource).toContain('line-height: 20px;');
    expect(styleSource).toContain('display: block !important;');
    expect(styleSource).toContain('min-width: var(--xy-floating-title-input-width, auto) !important;');
    expect(styleSource).toContain('max-width: var(--xy-floating-title-input-width, auto) !important;');
    expect(styleSource).toContain('height: 20px !important;');
    expect(styleSource).toContain('min-height: 0 !important;');
    expect(styleSource).toContain('line-height: 20px !important;');
    expect(styleSource).toContain('top: 0 !important;');
    expect(styleSource).toContain('transform: translateY(-50%) !important;');
    const brainstormPreviewFieldRuleStart = styleSource.indexOf('.xy-floating-field.xy-brainstorm-preview-field textarea {');
    const brainstormPreviewFieldRule = styleSource.slice(
      brainstormPreviewFieldRuleStart,
      styleSource.indexOf('.xy-floating-field.xy-floating-outline-preview .xy-floating-rich-preview', brainstormPreviewFieldRuleStart),
    );
    expect(brainstormPreviewFieldRule).toContain('border-color: #111827;');
    expect(styleSource).toContain('margin-top: -0.375rem;');
    expect(styleSource).toContain('padding-top: 0.625rem;');
    const brainstormOutputTitleToolRuleStart = styleSource.indexOf('.xy-brainstorm-output-title-tool {');
    const brainstormOutputTitleToolRule = styleSource.slice(
      brainstormOutputTitleToolRuleStart,
      styleSource.indexOf('.xy-brainstorm-floating-title-tool .xy-floating-title-input', brainstormOutputTitleToolRuleStart),
    );
    expect(brainstormOutputTitleToolRule).not.toContain('translateY(calc(-50% - 1px))');
    const brainstormTitleToolRuleStart = styleSource.indexOf('.xy-brainstorm-floating-title-tool,');
    const brainstormTitleToolRule = styleSource.slice(
      brainstormTitleToolRuleStart,
      styleSource.indexOf('.xy-brainstorm-floating-title-tool::before', brainstormTitleToolRuleStart),
    );
    const inlineTitleToolRuleStart = styleSource.indexOf('.xy-floating-outline-clear-button,');
    const inlineTitleToolRule = styleSource.slice(
      inlineTitleToolRuleStart,
      styleSource.indexOf('.xy-floating-outline-clear-button *', inlineTitleToolRuleStart),
    );
    expect(brainstormTitleToolRule).toContain('background-image: linear-gradient(');
    expect(inlineTitleToolRule).toContain('background-color: transparent !important;');
    expect(inlineTitleToolRule).not.toContain('background: transparent !important;');
    expect(panelSource).toContain('const outlineDraftCountLeft = plotPointStandalone');
    expect(panelSource).not.toContain('章纲：<WordCountText value={countTextWords(outlineCardContent)} compact />');
  });
  it('does not render brainstorm session controls on the output frame', () => {
    const { container } = render(
      <WorkbenchLibraryPanel
        storageKey="workbench-library-panel-test"
        outlineStorageKey="workbench-library-panel-outline-test"
        tabs={['澶х翰', '瑙掕壊', '鑴戞礊']}
        emptyText="鏆傛棤鍐呭"
        defaultActiveTab="鑴戞礊"
      />,
    );

    const sessionTool = container.querySelector('.xy-floating-brainstorm-session-tool');

    expect(sessionTool).toBeFalsy();
    expect(screen.queryByTitle('鏂板缓鑴戞礊浼氳瘽')).not.toBeInTheDocument();
    expect(screen.queryByTitle('鑴戞礊浼氳瘽 1')).not.toBeInTheDocument();
  });

  it('does not keep brainstorm session rendering code in the output panel', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).not.toContain('const renderBrainstormAiSessionControls');
    expect(panelSource).not.toContain('renderBrainstormAiSessionControls()');
    expect(panelSource).not.toContain('addBrainstormAiSession');
    expect(panelSource).not.toContain('selectBrainstormAiSession');
  });

  it('uses a single clear button for brainstorm output actions', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(styleSource).not.toContain('.xy-floating-brainstorm-output-action-tool {');
    expect(styleSource).not.toContain('.xy-floating-edge-tool.xy-floating-brainstorm-session-tool');
    const outputListStart = panelSource.indexOf('xy-brainstorm-output-preview-list');
    const outputListEnd = panelSource.indexOf('className="shrink-0 space-y-3"', outputListStart);
    const outputListSource = panelSource.slice(outputListStart, outputListEnd);
    const actionGroupStart = panelSource.indexOf('<div className="flex min-w-0 flex-wrap items-center gap-2">', outputListEnd);
    const actionGroupSource = panelSource.slice(actionGroupStart, panelSource.indexOf('{settingLibraryMode ===', actionGroupStart));

    expect(outputListSource).not.toContain('清空脑洞');
    expect(actionGroupStart).toBeGreaterThan(-1);
    expect(actionGroupSource).toContain('替换当前脑洞');
    expect(actionGroupSource).toContain('保存为新脑洞');
    expect(actionGroupSource).toContain('复制脑洞');
    expect(actionGroupSource).toContain('清空脑洞');
    expect(actionGroupSource).toContain('onClick={copyBrainstormOutputArea}');
    expect(actionGroupSource).toContain('onClick={clearBrainstormOutputArea}');
    expect(actionGroupSource).not.toContain('onClick={clearLibraryAiDialog}');
    expect(actionGroupSource).not.toContain('删除');
    expect(actionGroupSource).not.toContain('confirmDeleteEntry(currentSelectedEntry);');
    expect(panelSource).not.toContain('px-2 text-[11px] font-bold text-gray-600 hover:bg-slate-50 hover:text-slate-900');
  });
  it('removes white backplates from outline preview labels and edge text tools', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(styleSource).toContain('.xy-floating-field.xy-floating-outline-preview label');
    expect(styleSource).toContain('background-color: transparent;');
    expect(styleSource).toContain('.xy-floating-field.xy-floating-outline-preview .xy-floating-count');
    expect(styleSource).toContain('.xy-floating-outline-clear-button,');
    expect(styleSource).toContain('.xy-floating-inline-title-tool');
    expect(styleSource).toContain('text-shadow: none;');
    expect(styleSource).toContain('-webkit-text-stroke: 3px #ffffff;');
    expect(styleSource).toContain('paint-order: stroke fill;');
    expect(styleSource).toContain('.xy-border-embedded-transparent-backplate::before,');
    expect(styleSource).toContain('.xy-floating-field.xy-floating-outline-preview label::before,');
    expect(styleSource).toContain('.xy-floating-field .xy-floating-count::before');
    expect(styleSource).toContain('height: 0.42em;');
    expect(styleSource).toContain('.xy-border-embedded-transparent-backplate:not(.absolute)');
    expect(styleSource).toContain('background-image: linear-gradient(');
    expect(styleSource).toContain('transparent calc(50% - 0.24em)');
    expect(styleSource).toContain('#ffffff calc(50% + 0.24em)');
    expect(styleSource).toContain('background-size: 100% 100%');
    expect(panelSource).toContain('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-inner-clear-tool absolute z-40 px-1');
    expect(styleSource).toContain('.xy-floating-outline-inner-clear-tool {');
    expect(styleSource).toContain('top: auto;');
    expect(styleSource).toContain('right: 1.55rem;');
    expect(styleSource).toContain('bottom: 0.75rem;');
    expect(styleSource).toContain('transform: none;');
    expect(panelSource).toContain('xy-floating-inline-title-tool xy-brainstorm-output-title-tool xy-floating-title-count xy-border-embedded-transparent-backplate absolute top-0');
    expect(panelSource).not.toContain('absolute -top-2 right-4 bg-white px-1');
    expect(panelSource).not.toContain('absolute left-[104px] top-0 z-20 max-w-[calc(100%-232px)] -translate-y-1/2 bg-white px-1');
    expect(panelSource).not.toContain('block max-w-[220px] truncate bg-white px-1');
  });

  it('uses the tested white empty state for chapter outline directories and removes the temporary test page route', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterEditorSource = await readChapterEditorSource();
    const testCollectionSource = await readTestCollectionSource();

    expect(panelSource).toContain("border-slate-200 bg-white text-slate-500 hover:border-[#08B3D9] hover:bg-[#EAF9FD] hover:text-[#078fb0]");
    expect(chapterEditorSource).toContain("border-slate-200 bg-white text-slate-500 hover:border-[#08B3D9] hover:bg-[#EAF9FD] hover:text-[#078fb0]");
    expect(panelSource).not.toContain('repeating-linear-gradient(135deg, #f8fafc 0');
    expect(chapterEditorSource).not.toContain('repeating-linear-gradient(135deg, #f8fafc 0');
    expect(testCollectionSource).not.toContain('OutlineDirectoryStateTestPage');
    expect(testCollectionSource).not.toContain('/outline-directory-state-test');
  });

  it('keeps the main chapter writing surface on the white paper background', async () => {
    const styleSource = await readSharedStylesSource();
    const chapterEditorSource = await readChapterEditorSource();

    expect(styleSource).toContain('--xy-wa-editor-bg: #FFFFFF;');
    expect(styleSource).toContain('.xy-wa-editor-root {\n  background: var(--xy-wa-editor-bg);\n}');
    expect(styleSource).toContain('.xy-wa-editor-surface {\n  background: var(--xy-wa-editor-bg);\n}');
    expect(styleSource).toContain('.xy-wa-editor-surface .xy-wa-editor-text-layer {\n  background: var(--xy-wa-editor-bg);\n}');
    expect(chapterEditorSource).toContain('className="xy-wa-editor-root flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden"');
    expect(chapterEditorSource).toContain('className="xy-wa-editor-surface relative min-h-0 flex-1 overflow-hidden"');
    expect(chapterEditorSource).toContain('className="xy-wa-editor-text-layer editor-scrollbar relative z-10 h-full min-h-0 w-full resize-none border-0 bg-transparent pb-6 pt-3 outline-none"');
    expect(chapterEditorSource).toContain('paddingLeft: editorTextPaddingLeft');
    expect(chapterEditorSource).toContain('paddingRight: editorTextPaddingRight');
    expect(chapterEditorSource).toContain('textIndent: editorTextIndent');
    expect(chapterEditorSource).not.toContain('overflow-hidden bg-[#f5f5f7]');
    expect(chapterEditorSource).not.toContain('px-6 pb-6 pt-10 outline-none');
  });

  it('keeps paragraph indentation visual instead of selectable editor blanks', async () => {
    const chapterEditorSource = await readChapterEditorSource();
    const modalSource = await readEditorToolModalsSource();

    expect(chapterEditorSource).toContain('const normalizeEditorText = (value: string) => stripLineIndents(value);');
    expect(chapterEditorSource).toContain('const editorTextPaddingLeft = `${EDITOR_GRID_LINE_LEFT_OFFSET_PX}px`;');
    expect(chapterEditorSource).toContain('const editorTextPaddingRight = `${EDITOR_GRID_LINE_RIGHT_OFFSET_PX}px`;');
    expect(chapterEditorSource).toContain("const editorTextIndent = formatSettings.paragraphIndent ? '2em' : undefined;");
    expect(chapterEditorSource).toContain("const cleanedPaste = stripLineIndents(pasted);");
    expect(chapterEditorSource).toContain("const next = content.slice(0, start) + '\\n' + content.slice(end);");
    expect(chapterEditorSource).toContain('paragraphIndent={formatSettings.paragraphIndent}');
    expect(chapterEditorSource).not.toContain('keepSelectionOutOfParagraphIndent');
    expect(chapterEditorSource).not.toContain('normalizeParagraphIndents');
    expect(modalSource).toContain('const editorTextPaddingLeft = `${EDITOR_GRID_LINE_LEFT_OFFSET_PX}px`;');
    expect(modalSource).toContain('const editorTextPaddingRight = `${EDITOR_GRID_LINE_RIGHT_OFFSET_PX}px`;');
    expect(modalSource).toContain("const editorTextIndent = paragraphIndent ? '2em' : undefined;");
    expect(modalSource).toContain('whitespace-pre-wrap break-words pb-6 pt-3 text-transparent');
    expect(modalSource).not.toContain('normalizeParagraphIndents');
  });

  it('matches audit comment and status chapter directories to the detail outline volume style without losing summary actions', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterEditorSource = await readChapterEditorSource();

    expect(chapterEditorSource).toContain('volumes?: Volume[]');
    expect(chapterEditorSource).toContain('const chapterDirectoryGroups = useMemo(() => {');
    expect(chapterEditorSource).toContain('chapters: [...volume.chapters].sort((a, b) => a.serialNumber - b.serialNumber)');
    expect(chapterEditorSource).toContain("return [{ id: 0, name: '章节目录', chapters: sortedReviewChapters }];");
    expect(chapterEditorSource).toContain('const [expandedReviewVolumeIds, setExpandedReviewVolumeIds] = useState<Set<number>>(() => new Set());');
    expect(chapterEditorSource).toContain('const [expandedStatusVolumeIds, setExpandedStatusVolumeIds] = useState<Set<number>>(() => new Set());');
    expect(chapterEditorSource).toContain('const toggleReviewDirectoryVolume = (volumeId: number) => {');
    expect(chapterEditorSource).toContain('const toggleStatusDirectoryVolume = (volumeId: number) => {');
    expect(chapterEditorSource).toContain('chapterDirectoryGroups.forEach((group) => next.add(group.id));');
    expect(chapterEditorSource).toContain('onClick={() => toggleReviewDirectoryVolume(group.id)}');
    expect(chapterEditorSource).toContain('onClick={() => toggleStatusDirectoryVolume(group.id)}');
    expect(chapterEditorSource).toContain('<aside className="flex min-h-0 flex-col border-r border-slate-100 bg-white px-1 py-2">');
    expect(chapterEditorSource).toContain('<div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto">');
    expect(chapterEditorSource).not.toContain('<aside className="flex min-h-0 flex-col border-r border-slate-100 bg-white px-3 py-3">');
    expect(chapterEditorSource).not.toContain('<div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">');
    expect(chapterEditorSource).not.toContain("{reviewMode === 'audit' ? '审核目录' : '点评目录'}");
    expect(chapterEditorSource).not.toContain('审核目录');
    expect(chapterEditorSource).not.toContain('点评目录');
    expect(chapterEditorSource).not.toContain('<div className="mb-3 text-sm font-black text-slate-900">章节目录</div>');
    expect(chapterEditorSource).toContain('className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}');
    expect(chapterEditorSource).toContain('const GroupFolderIcon = expanded ? FolderOpen : Folder;');
    expect(chapterEditorSource).toContain('<GroupFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />');
    expect(chapterEditorSource).not.toContain('className="group flex h-[36px] w-full cursor-pointer items-center gap-1 rounded-md bg-brand-light px-2 py-1.5 text-left transition-colors hover:bg-brand/10"');
    expect(chapterEditorSource).not.toContain('<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-brand-dark">');
    expect(chapterEditorSource).toContain('<span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{group.chapters.length}章</span>');
    expect(chapterEditorSource).toContain("style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(36px, max-content))' }}");
    expect(chapterEditorSource).toContain('relative h-9 min-w-9 rounded-lg border px-2 text-sm font-black transition-colors');
    expect(chapterEditorSource).toContain("'border-[#08B3D9] bg-[#EAF9FD] text-[#078fb0]'");
    expect(chapterEditorSource).not.toContain("'border-transparent xy-detail-outline-number-selected xy-selected-orange-bg text-slate-900'");
    expect(chapterEditorSource).not.toContain("groupHasSelectedChapter ? 'xy-selected-orange-bg' : ''");
    expect(chapterEditorSource).toContain('statusUpdatedChapterIds.has(item.id)');
    expect(chapterEditorSource).toContain("'border-[#08B3D9] bg-[#08B3D9] text-white hover:border-[#067B96] hover:bg-[#067B96]'");
    expect(chapterEditorSource).not.toContain('<span className="text-sm font-black text-slate-900">章节位置</span>');
    expect(chapterEditorSource).not.toContain('<span className="inline-flex items-center gap-1"><i className="h-3 w-3 rounded bg-[#08B3D9]" />已更新</span>');
    expect(chapterEditorSource).not.toContain('<span className="inline-flex items-center gap-1"><i className="h-3 w-3 rounded border border-slate-200 bg-slate-50" />未更新</span>');
    expect(panelSource).toContain('卷梗概');
    expect(panelSource).toContain('const enableVolumeSummary = !isDetailOutlineTab;');
    expect(panelSource).toContain("const volumeIsSelected = safeOutlineSelectionType === 'volume' && selectedOutlineVolume?.id === volume.id;");
    expect(panelSource).toContain('selectOutlineVolume(volume);');
    const summaryChapterButtonSources = Array.from(
      panelSource.matchAll(/const outlineButtonClass = isDetailOutlineTab[\s\S]*?\}\`;/g),
      (match) => match[0],
    );
    expect(summaryChapterButtonSources.length).toBeGreaterThanOrEqual(2);
    summaryChapterButtonSources.forEach((buttonSource) => {
      expect(buttonSource).toContain("? 'border-[#08B3D9] bg-[#EAF9FD] text-[#078fb0]'");
      expect(buttonSource).not.toContain("? 'border-transparent xy-selected-orange-bg text-slate-900'");
    });
    expect(panelSource).toContain('<nav className="editor-scrollbar min-h-0 flex-1 overflow-y-auto" aria-label="剧情链目录树">');
    expect(panelSource).toContain("isDetailOutlineTab ? 'bg-[#F8FAFC]' : 'bg-gray-50 px-1 py-2'");
    expect(panelSource).not.toContain('<nav className="editor-scrollbar min-h-0 flex-1 overflow-y-auto pr-1" aria-label="剧情链目录树">');
    expect(panelSource).not.toContain("isDetailOutlineTab ? 'bg-[#F8FAFC]' : 'bg-gray-50 px-3 py-3'");
    expect(panelSource).toContain('<div className="grid grid-cols-1 gap-3">');
    expect(panelSource).not.toContain("isDetailOutlineTab ? 'grid-cols-1' : 'grid-cols-2'");
  });

  it('splits the review preview area into original text and AI annotation panes', async () => {
    const chapterEditorSource = await readChapterEditorSource();

    expect(chapterEditorSource).toContain('type ReviewAnnotation = {');
    expect(chapterEditorSource).toContain('function extractReviewAnnotations(output: string)');
    expect(chapterEditorSource).toContain('const reviewAnnotationsByParagraph = useMemo(() => {');
    expect(chapterEditorSource).toContain('AI标注');
    expect(chapterEditorSource).toContain('AI 返回“原文标注”JSON 后，这里会高亮问题片段并显示审核说明。');
    expect(chapterEditorSource).toContain('renderAnnotatedReviewParagraph(paragraph, paragraphAnnotations)');
  });

  it('syncs published and library group rows to the body folder navigation style', async () => {
    const chapterSidebarSource = await readChapterSidebarSource();
    const publishedSidebarSource = await readPublishedSidebarSource();
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterEditorSource = await readChapterEditorSource();
    const testCollectionSource = await readTestCollectionSource();

    for (const source of [chapterSidebarSource, publishedSidebarSource, panelSource, chapterEditorSource]) {
      expect(source).toContain('WORKBENCH_FOLDER_GROUP');
      expect(source).toContain('WORKBENCH_FOLDER_GROUP_ICON_CLASS');
      expect(source).toContain('WORKBENCH_FOLDER_GROUP_COUNT_CLASS');
      expect(source).toContain('border-[#BDEEF7] xy-flow-group-bg');
      expect(source).toContain("const WORKBENCH_FOLDER_GROUP_ICON_CLASS = 'h-[17px] w-[17px] shrink-0 text-[#08AACE]';");
      expect(source).toContain('font-black text-[#1f2933]');
      expect(source).toContain("const WORKBENCH_FOLDER_GROUP_COUNT_CLASS = 'rounded-full bg-white/70 px-2 py-0.5 text-xs font-black text-[#6f7e90]';");
      expect(source).toContain('FolderOpen');
      expect(source).toContain('Folder');
    }

    expect(chapterSidebarSource).toContain('const VolumeFolderIcon = volume.isExpanded ? FolderOpen : Folder;');
    expect(chapterSidebarSource).toContain('<VolumeFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />');
    expect(publishedSidebarSource).toContain('const VolumeFolderIcon = expanded ? FolderOpen : Folder;');
    expect(publishedSidebarSource).toContain('aria-expanded={expanded}');
    expect(publishedSidebarSource).toContain("chapter.isSelected ? 'border-transparent xy-selected-mint-bg'");
    expect(publishedSidebarSource).not.toContain('volumeHasSelectedChapter');
    expect(publishedSidebarSource).not.toContain('border-orange-400 bg-orange-50');
    expect(publishedSidebarSource).not.toContain('text-orange-600');

    expect(panelSource).toContain('const GroupFolderIcon = expanded ? FolderOpen : Folder;');
    expect(panelSource).toContain('const GroupFolderIcon = collapsed ? Folder : FolderOpen;');
    expect(panelSource).toContain('const VolumeFolderIcon = expanded ? FolderOpen : Folder;');
    expect(panelSource).toContain('<GroupFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />');
    expect(panelSource).toContain('<VolumeFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />');
    expect(panelSource).not.toContain("groupHasSelectedEntry ? 'xy-selected-orange-bg' : ''");
    expect(panelSource).not.toContain("groupHasCheckedItem ? 'xy-selected-orange-bg' : ''");
    expect(panelSource).not.toContain('volumeHasSelectedOutlineChapter');
    expect(panelSource).toContain("volumeIsSelected\n                                ? 'border-brand bg-brand text-white'");
    expect(panelSource).toContain('xy-selected-mint-bg text-gray-900');
    expect(panelSource).toContain('xy-selected-content-bg text-slate-900');
    expect(panelSource).not.toContain('className="group flex h-[36px] items-center gap-1 rounded-md bg-brand-light px-2 py-1.5 transition-colors hover:bg-brand/10"');
    expect(panelSource).not.toContain('className="group flex h-[36px] cursor-pointer items-center gap-1 rounded-md bg-brand-light px-2 py-1.5 transition-colors hover:bg-brand/10"');
    expect(testCollectionSource).not.toContain('ChapterGroupColorOptionsTestPage');
    expect(testCollectionSource).not.toContain('/chapter-group-color-options-test');
  });

  it('keeps workbench model selects synchronized after model management changes', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterEditorSource = await readChapterEditorSource();
    const modelHookSource = await readModelHookSource();

    expect(panelSource).toContain("import { useModels } from '@/features/models/hooks/useModels';");
    expect(panelSource).toContain('const { models: modelSnapshot } = useModels();');
    expect(panelSource).toContain('const models = useMemo(() => modelSnapshot.filter((model) => model.enabled), [modelSnapshot]);');
    expect(panelSource).not.toContain("import { readModelSnapshot } from '@/features/models/hooks/useModels';");
    expect(panelSource).not.toContain('const models = useMemo(() => readModelSnapshot().filter((model) => model.enabled), []);');
    expect(chapterEditorSource).toContain("import { useModels } from '@/features/models/hooks/useModels';");
    expect(chapterEditorSource).toContain('const { models: modelSnapshot } = useModels();');
    expect(chapterEditorSource).toContain('const reviewModels = useMemo(() => modelSnapshot.filter((model) => model.enabled), [modelSnapshot]);');
    expect(chapterEditorSource).not.toContain("import { readModelSnapshot } from '@/features/models/hooks/useModels';");
    expect(chapterEditorSource).not.toContain('const reviewModels = useMemo(() => readModelSnapshot().filter((model) => model.enabled), []);');
    expect(modelHookSource).not.toContain('function syncEnvModel');
    expect(modelHookSource).not.toContain('import.meta.env.VITE_PINAI_API_KEY');
    expect(modelHookSource).toContain('function writeModels(models: ModelItem[], options: { notify?: boolean } = {})');
    expect(modelHookSource).toContain('if (options.notify !== false) window.dispatchEvent(new CustomEvent(APP_EVENTS.modelsUpdated));');
    expect(modelHookSource).toContain('if (!raw) return [];');
    expect(modelHookSource).toContain('writeModels(models, { notify: false });');
  });

  it('keeps the brainstorm question panel fixed without scrollbar layout classes', async () => {
    const source = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(source).toContain('xy-brainstorm-question-panel');
    expect(source).toContain('xy-brainstorm-question-panel xy-shellless-panel editor-scrollbar min-h-0 flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-0 py-2');
    expect(source).toContain('flex min-h-full flex-col gap-4 pt-2');
    expect(source).toContain('grid shrink-0 grid-cols-2 gap-4 text-sm font-bold text-gray-700');
    expect(source).not.toContain('xy-brainstorm-question-panel editor-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-xl border border-gray-200 bg-white p-3');
    expect(source).not.toContain('xy-brainstorm-count-options');
    expect(source).not.toContain('editor-scrollbar min-h-0 flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3');
    expect(source).not.toContain('flex h-[60px] items-center gap-2 px-4 pt-3');
    expect(styleSource).toContain('.xy-brainstorm-question-panel .xy-floating-field.xy-floating-outline-fixed label::before');
    expect(styleSource).toContain('.xy-brainstorm-question-panel .xy-floating-field.xy-floating-outline-fixed label,');
    expect(styleSource).toContain('font-size: 1rem;');
    expect(styleSource).toContain('font-weight: 500;');
    expect(styleSource).toContain('line-height: 20px;');
  });

  it('records the reusable shellless panel technique for brainstorm fields', async () => {
    const styleSource = await readSharedStylesSource();

    expect(styleSource).toContain('.xy-shellless-panel {');
    expect(styleSource).toContain('border: 0;');
    expect(styleSource).toContain('border-radius: 0;');
    expect(styleSource).toContain('background: transparent;');
    expect(styleSource).toContain('box-shadow: none;');
  });

  it('records shellless techniques while official right panels avoid soft card wrappers', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterSource = await readChapterEditorSource();
    const styleSource = await readSharedStylesSource();

    expect(styleSource).toContain('.xy-shellless-panel {');
    expect(styleSource).toContain('.xy-soft-shell-panel {');
    expect(panelSource).not.toContain('<div className="mt-3 shrink-0 text-sm font-bold leading-6 text-gray-600">');
    expect(chapterSource).toContain('mt-3 text-xs font-bold leading-5 text-slate-500');
    expect(panelSource).not.toContain('xy-soft-shell-panel mt-3 p-3');
    expect(chapterSource).not.toContain('xy-soft-shell-panel p-3 text-xs leading-5 text-slate-500');
  });

  it('removes AI dialogue labels from library generator output cards', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).not.toContain('AI对话框');
  });

  it('renders brainstorm count as a sequential-only segmented button group aligned to the input left edge', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const countButtonStart = panelSource.indexOf("{['3', '5', '10'].map((value) => {");
    const generateButtonStart = panelSource.indexOf('onClick={openBrainstormGenerateConfirm}', countButtonStart);
    const countButtonSource = panelSource.slice(countButtonStart, generateButtonStart);

    expect(countButtonStart).toBeGreaterThan(-1);
    expect(generateButtonStart).toBeGreaterThan(countButtonStart);
    expect(panelSource).not.toContain('xy-brainstorm-count-field');
    expect(panelSource).not.toContain('xy-brainstorm-count-options');
    expect(panelSource).toContain('逐个生成几个脑洞');
    expect(panelSource).not.toContain('一次生成几个脑洞');
    expect(panelSource).not.toContain("['sequential', '逐个']");
    expect(panelSource).not.toContain("['batch', '一次']");
    expect(panelSource).not.toContain('brainstormGenerateMode');
    expect(panelSource).toContain('<span className="shrink-0 text-sm font-black text-slate-950">逐个生成</span>');
    expect(panelSource).toContain("{isLibraryAiLoading ? '生成中...' : '逐个生成'}");
    expect(panelSource).not.toContain('<span className="shrink-0 text-sm font-black text-slate-950">生成个数：</span>');
    expect(panelSource).toContain('<div className="mt-2 flex items-center gap-3">');
    expect(panelSource).toContain('<div className="flex min-w-0 flex-1 items-center gap-2">');
    expect(panelSource).toContain('flex h-8 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white');
    expect(countButtonSource).toContain('setBrainstormQuestionField(\'brainstormCount\', active ? \'\' : value)');
    expect(countButtonSource).toContain('last:border-r-0');
    expect(countButtonSource).not.toContain("'1'");
    expect(countButtonSource).not.toContain("'2'");
    expect(countButtonSource).not.toContain('3个');
  });

  it('keeps brainstorm request headers out of visible generated output', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const buildStart = panelSource.indexOf('const buildBrainstormPromptFromQuestions = (draft: BrainstormQuestionDraft) => {');
    const buildEnd = panelSource.indexOf('const openBrainstormGenerateConfirm = () => {', buildStart);
    const buildSource = panelSource.slice(buildStart, buildEnd);
    const latestUsefulStart = panelSource.indexOf('function getLatestUsefulAiText(content: string)');
    const latestUsefulEnd = panelSource.indexOf('function getBrainstormEntryBody', latestUsefulStart);
    const latestUsefulSource = panelSource.slice(latestUsefulStart, latestUsefulEnd);

    expect(panelSource).toContain("const BRAINSTORM_OUTPUT_ONLY_INSTRUCTION = '请直接输出实际脑洞内容，不要复述提示词、其他要求、题材、故事主题等标签。';");
    expect(panelSource).toContain("const BRAINSTORM_REQUEST_HEADER = '【以下是用户输出的内容】';");
    expect(panelSource).toContain("const BRAINSTORM_OTHER_REQUIREMENTS_HEADER = '【其他要求】';");
    expect(panelSource).toContain("const BRAINSTORM_GENERATE_TASK_TEXT = '请根据以下信息，生成一个可以保存进脑洞库的小说脑洞设定。';");
    expect(panelSource).toContain("const BRAINSTORM_GENERATE_RULE_TEXT = '要求：内容要具体、可继续扩展，避免只复述问题；如果信息不足，请合理补全但不要偏离用户要求。';");
    expect(panelSource).toContain('function stripBrainstormRequestHeader(content: string)');
    expect(panelSource).toContain('function isBrainstormEchoedRequest(content: string, requestText: string)');
    expect(panelSource).toContain('function getBrainstormOtherRequirementsBlock(requestText: string)');
    expect(panelSource).toContain('function getBrainstormDisplayContent(content: string, requestText: string)');
    expect(panelSource).toContain('const clean = stripBrainstormRequestHeader(stripAiThinkingBlock(text)).trim();');
    expect(panelSource).toContain("? [baseModelPrompt, BRAINSTORM_OUTPUT_ONLY_INSTRUCTION].filter(Boolean).join('\\n\\n')");
    expect(panelSource).toContain('options: { visibleText?: string; previewCount?: number } = {},');
    expect(panelSource).toContain('const visibleUserText = (options.visibleText ?? text).trim();');
    expect(panelSource).toContain('const visibleText = stripBrainstormRequestHeader(promptText);');
    expect(panelSource).toContain('void sendLibraryAiMessage(promptText, { visibleText, previewCount });');
    expect(panelSource).toContain('const brainstormStreamDisplay = stripBrainstormRequestHeader(streamedContent.trimStart());');
    expect(panelSource).toContain("target: 'workbenchLibraryAi'");
    expect(panelSource).toContain('function getBrainstormBackgroundTaskResult(task: BackgroundAiTask)');
    expect(panelSource).toContain('const otherRequirements = normalizeBrainstormEchoText(getBrainstormOtherRequirementsBlock(requestText));');
    expect(panelSource).toContain('output === request || output === otherRequirements');
    expect(panelSource).toContain('? getBrainstormDisplayContent(content, requestText)');
    expect(panelSource).toContain('【错误】模型只复述了输入内容，没有生成脑洞。请重试，或换一个提示词/模型。');
    expect(panelSource).toContain('【错误】模型没有返回内容。请重试，或检查模型、提示词和网络。');
    expect(panelSource).toContain('emit(replacePendingOutput(`【错误】${message}`), { replace: true, progressLabel: \'失败\' });');
    expect(latestUsefulSource).toContain("if (turns.length > 0) return '';");
    expect(buildSource).toContain('BRAINSTORM_GENERATE_TASK_TEXT');
    expect(buildSource).toContain('BRAINSTORM_GENERATE_RULE_TEXT');
    expect(buildSource).toContain('BRAINSTORM_OTHER_REQUIREMENTS_HEADER');
    expect(buildSource).not.toContain('BRAINSTORM_REQUEST_HEADER');
    expect(buildSource).not.toContain('【用户要求】');
    expect(panelSource).not.toContain("void sendLibraryAiMessage(promptText);");
  });

  it('locks brainstorm output box count to the requested generation count', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const confirmStart = panelSource.indexOf('const confirmBrainstormGenerate = () => {');
    const confirmEnd = panelSource.indexOf('const addRoleTypeByName', confirmStart);
    const confirmSource = panelSource.slice(confirmStart, confirmEnd);
    const previewStart = panelSource.indexOf('const brainstormOutputPreviewCount = activeIsBrainstorm');
    const previewEnd = panelSource.indexOf('const brainstormOutputSplitParts', previewStart);
    const previewSource = panelSource.slice(previewStart, previewEnd);

    expect(panelSource).toContain('previewCount?: number;');
    expect(confirmSource).toContain('const previewCount = getBrainstormOutputCount(brainstormGenerateDraft.brainstormCount);');
    expect(confirmSource).not.toContain('generationMode');
    expect(confirmSource).toContain('void sendLibraryAiMessage(promptText, { visibleText, previewCount });');
    expect(confirmSource).not.toContain('setBrainstormQuestionDraft(EMPTY_BRAINSTORM_QUESTION_DRAFT)');
    expect(previewSource).toContain('activeBrainstormAiSession?.previewCount ?? getBrainstormOutputCount(brainstormQuestionDraft.brainstormCount)');
    expect(panelSource).toContain('previewCount: targetBrainstormPreviewCount');
  });

  it('generates multiple brainstorm outputs sequentially without a batch mode', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const sendStart = panelSource.indexOf('const sendLibraryAiMessage = async (');
    const sendEnd = panelSource.indexOf('const stopLibraryAiMessage = () => {', sendStart);
    const sendSource = panelSource.slice(sendStart, sendEnd);

    expect(panelSource).not.toContain('BrainstormGenerateMode');
    expect(panelSource).not.toContain('brainstormGenerateMode');
    expect(panelSource).not.toContain("targetBrainstormGenerateMode === 'batch'");
    expect(panelSource).toContain('function buildSequentialBrainstormRequestText(baseRequestText: string, index: number, total: number, completedItems: string[])');
    expect(panelSource).toContain('function formatSequentialBrainstormOutput(completedItems: string[], activeIndex?: number, activeContent = \'\')');
    expect(sendSource).toContain('const shouldGenerateBrainstormSequentially = targetTab === BRAINSTORM_TAB');
    expect(sendSource).not.toContain('targetBrainstormGenerateMode');
    expect(sendSource).not.toContain('generationMode');
    expect(sendSource).toContain('for (let index = 1; index <= targetBrainstormPreviewCount; index += 1)');
    expect(sendSource).toContain('const itemRequestText = buildSequentialBrainstormRequestText(requestText, index, targetBrainstormPreviewCount, completedItems);');
    expect(sendSource).toContain('userContent: itemRequestText');
    expect(sendSource).toContain('completedItems.push(stripAiThinkingBlock(itemDisplayContent));');
    expect(sendSource).toContain('return replacePendingOutput(formatSequentialBrainstormOutput(completedItems));');
  });

  it('can switch the library AI request log between titled sections and plain concatenated content', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const logGroupsSource = await readAiRequestLogGroupsSource();
    const settingRequestStart = panelSource.indexOf('const buildSettingLibraryRequestText = (promptText: string, userText: string) => {');
    const settingRequestEnd = panelSource.indexOf('const buildLibraryAiRequestPayload = (text: string, overrideText?: string) => {', settingRequestStart);
    const settingRequestSource = panelSource.slice(settingRequestStart, settingRequestEnd);

    expect(panelSource).toContain('import { AiRequestLogContent, AiRequestLogGroups, type AiRequestLogGroup }');
    expect(panelSource).toContain('function buildRequestLogPlainPreview(groups: AiRequestLogGroup[])');
    expect(panelSource).toContain(".join('\\n\\n');");
    expect(panelSource).toContain('const [showLibraryAiLogTitles, setShowLibraryAiLogTitles] = useState(true);');
    expect(panelSource).toContain('const visibleAiRequestLogGroups = visibleAiRequestLog');
    expect(panelSource).toContain('function formatBrainstormReferenceForAi(title: string, text: string)');
    expect(panelSource).toContain('【参考资料开始：用户关联脑洞】');
    expect(panelSource).toContain('注意：以下内容只是参考资料，不是输出格式，不要照抄标签，不要为它单独生成设定，不要输出本段任何标签。');
    expect(panelSource).toContain('资料类型：脑洞');
    expect(panelSource).toContain('`资料标题：${safeTitle}`');
    expect(panelSource).toContain('【参考资料结束：用户关联脑洞】');
    expect(panelSource).toContain('function formatSettingLinkedContextForAi');
    expect(panelSource).toContain("if (context.source === 'brainstorm') return formatBrainstormReferenceForAi(context.title, text);");
    expect(panelSource).not.toContain("const tagName = context.source === 'brainstorm' ? '关联脑洞' : '待处理设定';");
    expect(panelSource).not.toContain("wrapAiRequestTag('关联脑洞'");
    expect(panelSource).toContain('return wrapAiRequestTag(tagName, text, { 标题: title });');
    expect(panelSource).toContain('function formatSettingUserRequirementForAi');
    expect(panelSource).toContain("return wrapAiRequestTag('修改要求', text);");
    expect(settingRequestSource).toContain('const linkedSettingContext = formatSettingLinkedContextForAi(getActiveLinkedSettingSnapshot());');
    expect(settingRequestSource).toContain('const userRequirement = formatSettingUserRequirementForAi(userText);');
    expect(settingRequestSource).not.toContain("'【其他要求】'");
    expect(settingRequestSource).not.toContain("'【用户要求】'");
    expect(panelSource).toContain('userContent: activeTab === SETTING_TAB ? settingUserRequirementForAi : requestText');
    expect(panelSource).toContain("userTitle: activeTab === SETTING_TAB ? '修改要求' : activeIsBrainstorm ? '其他要求' : undefined");
    expect(panelSource).toContain("{activeTab === SETTING_TAB ? '修改要求' : '其他要求'}");
    expect(panelSource).toContain('const visibleAiRequestLogPlainPreview = buildRequestLogPlainPreview(visibleAiRequestLogGroups);');
    expect(panelSource).toContain('checked={showLibraryAiLogTitles}');
    expect(panelSource).toContain('onChange={(event) => setShowLibraryAiLogTitles(event.target.checked)}');
    expect(panelSource).toContain('<span>显示标题内容</span>');
    expect(panelSource).toContain('{showLibraryAiLogTitles ? (');
    expect(panelSource).toContain('<AiRequestLogGroups groups={visibleAiRequestLogGroups} />');
    expect(panelSource).toContain("visibleAiRequestLogPlainPreview ? <AiRequestLogContent content={visibleAiRequestLogPlainPreview} /> : '暂无可预览内容'");
    expect(logGroupsSource).toContain('function isSoftwareLogMarkerLine(line: string)');
    expect(logGroupsSource).toContain('export function AiRequestLogContent');
    expect(logGroupsSource).toContain('font-black text-red-500');
    expect(logGroupsSource).toContain('<AiRequestLogContent content={content} />');
    expect(logGroupsSource).toContain('ai-request-log-text whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4');
    expect(logGroupsSource).not.toContain('ai-request-log-text whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4 text-xs leading-5');
  });

  it('keeps brainstorm count buttons compact while the generate button stays on the right', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(panelSource).toContain('<div className="mt-2 flex items-center gap-3">');
    expect(panelSource).toContain('min-w-0 flex-1 border-r border-slate-200 px-2 text-sm font-black');
    expect(panelSource).toContain('h-10 w-20 shrink-0 whitespace-nowrap rounded-xl bg-brand px-0 text-sm font-bold leading-none text-white');
    expect(styleSource).not.toContain('.xy-brainstorm-count-field');
    expect(styleSource).not.toContain('.xy-brainstorm-count-options');
  });

  it('uses editable temporary brainstorm output previews driven by generation count', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const entryClickStart = panelSource.indexOf('onClick={() => {');
    const entryClickEnd = panelSource.indexOf('onDoubleClick={() =>', entryClickStart);
    const entryClickSource = panelSource.slice(entryClickStart, entryClickEnd);

    expect(panelSource).toContain('previewTitles?: string[];');
    expect(panelSource).toContain('previewDrafts?: string[];');
    expect(panelSource).toContain('previewSelectedIndexes?: number[];');
    expect(panelSource).toContain('previewCount?: number;');
    expect(panelSource).toContain('function getSelectedBrainstormPreviewIndexes(previews: string[], selectedIndexes?: number[])');
    expect(panelSource).toContain('function getBrainstormOutputCount(value: string)');
    expect(panelSource).toContain("return '脑洞输出';");
    expect(panelSource).not.toContain('return `${index + 1}号脑洞`;');
    expect(panelSource).not.toContain('return `脑洞输出框${index + 1}`;');
    expect(panelSource).not.toContain('return `新脑洞${index + 1}`;');
    expect(panelSource).toContain('const getNextBrainstormTitles = (count: number) => {');
    expect(panelSource).toContain('return Array.from({ length: count }, (_, index) => `脑洞${maxNumber + index + 1}`);');
    expect(panelSource).toContain('const nextTitles = getNextBrainstormTitles(previews.length);');
    expect(panelSource).toContain('const previews = getCurrentBrainstormOutputPreviews(true);');
    expect(panelSource).toContain('createWorkbenchLibraryEntry(BRAINSTORM_TAB, nextTitles[index] ?? getNextBrainstormTitle())');
    expect(panelSource).not.toContain('createWorkbenchLibraryEntry(BRAINSTORM_TAB, preview.title || getNextBrainstormTitle())');
    expect(panelSource).toContain('function splitBrainstormGeneratedText(text: string, count: number)');
    expect(panelSource).toContain('activeBrainstormAiSession?.previewCount ?? getBrainstormOutputCount(brainstormQuestionDraft.brainstormCount)');
    expect(panelSource).toContain('const brainstormOutputPreviews = Array.from({ length: brainstormOutputPreviewCount }, (_, index) => (');
    expect(panelSource).toContain('const selectedBrainstormOutputIndexes = getSelectedBrainstormPreviewIndexes(');
    expect(panelSource).toContain('const selectedBrainstormOutputIndexSet = new Set(selectedBrainstormOutputIndexes);');
    expect(panelSource).toContain('const selectedBrainstormOutputCount = selectedBrainstormOutputIndexes');
    expect(panelSource).toContain('const showBrainstormOutputSelection = activeIsBrainstorm && brainstormOutputPreviewCount > 1;');
    expect(panelSource).toContain('{brainstormOutputPreviews.map((previewValue, index) => {');
    expect(panelSource).toContain('role="checkbox"');
    expect(panelSource).toContain('aria-checked={outputChecked}');
    expect(panelSource).toContain('onClick={() => toggleBrainstormOutputPreviewSelected(index)}');
    expect(panelSource).toContain('aria-label={`脑洞输出名称 ${index + 1}`}');
    expect(panelSource).toContain('onChange={(event) => setBrainstormOutputPreviewTitle(index, event.target.value)}');
    expect(panelSource).toContain('previewCount: targetBrainstormPreviewCount');
    expect(panelSource).toContain('disabled={!currentSelectedEntry || selectedBrainstormOutputCount !== 1}');
    expect(panelSource).toContain('disabled={selectedBrainstormOutputCount === 0}');
    expect(panelSource).toContain('clearStoredBrainstormAiSessionPreviews(storageKey);');
    expect(panelSource).not.toContain('currentSelectedEntry.title || \'未命名脑洞\'');
    expect(entryClickSource).not.toContain('setAiResult(getBrainstormEntryBody(entry));');
  });

  it('keeps the brainstorm output action area shellless under the bordered frame', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const outputAreaStart = panelSource.indexOf('xy-brainstorm-output-preview-list');
    const actionAreaStart = panelSource.indexOf('<AiInlineInput', outputAreaStart);
    const actionAreaEnd = panelSource.indexOf('{settingLibraryMode ===', actionAreaStart);
    const actionAreaSource = panelSource.slice(actionAreaStart, actionAreaEnd);

    expect(outputAreaStart).toBeGreaterThan(-1);
    expect(actionAreaStart).toBeGreaterThan(outputAreaStart);
    expect(actionAreaEnd).toBeGreaterThan(actionAreaStart);
    expect(panelSource).toContain('<div className="shrink-0 space-y-3">');
    expect(actionAreaSource).not.toContain('shrink-0 rounded-xl border border-gray-200 bg-white p-3');
    expect(actionAreaSource).not.toContain('mt-3 flex items-center justify-between gap-2');
    expect(actionAreaSource).not.toContain('xy-animated-checkbox');
  });

  it('uses short brainstorm genre and theme placeholders', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain("placeholder: '如都市、玄幻'");
    expect(panelSource).toContain("placeholder: '如系统流'");
    expect(panelSource).not.toContain('如都市高武、玄幻、仙侠、科幻');
    expect(panelSource).not.toContain('如系统流、凡人流');
  });
  it('keeps brainstorm short-field labels in the border-floating style with enough top space', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(panelSource).not.toContain('xy-brainstorm-short-field');
    expect(styleSource).not.toContain('.xy-floating-field.xy-brainstorm-short-field label');
    expect(panelSource).toContain('xy-brainstorm-question-panel xy-shellless-panel editor-scrollbar min-h-0 flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-0 py-2');
    expect(panelSource).toContain('flex min-h-full flex-col gap-4 pt-2');
    expect(panelSource).toContain('height: `${Math.max(52, pairedRows * 20 + 32)}px`');
    expect(panelSource).toContain('minHeight: `${Math.max(180, questionRows * 20 + 52)}px`');
    expect(panelSource).toContain("height: '100%'");
    expect(styleSource).toContain('.xy-brainstorm-question-panel > div > div:last-child');
    expect(styleSource).toContain('flex: 1 1 180px;');
    expect(panelSource).not.toContain("Math.min(4, Math.max(1, rows))");
    expect(panelSource).not.toContain("overflowY: isLastField || questionRows >= 4 ? 'auto' : 'hidden'");
    expect(panelSource).not.toContain("flex min-h-[132px] flex-1 flex-col");
  });

  it('aligns brainstorm generator fields with the model prompt selector', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const brainstormPanelStart = panelSource.indexOf('<div className="flex max-w-full items-start gap-2">');
    const brainstormPanelEnd = panelSource.indexOf(') : (', panelSource.indexOf('xy-brainstorm-question-panel', brainstormPanelStart));
    const brainstormPanelSource = panelSource.slice(brainstormPanelStart, brainstormPanelEnd);

    expect(brainstormPanelStart).toBeGreaterThan(-1);
    expect(brainstormPanelEnd).toBeGreaterThan(brainstormPanelStart);
    expect(brainstormPanelSource).toContain("className={activeIsBrainstorm ? 'w-full' : undefined}");
    expect(brainstormPanelSource).toContain("width: '100%'");
    expect(brainstormPanelSource).toContain('<div className="flex max-w-full items-start gap-2">');
    expect(brainstormPanelSource).not.toContain('items-start justify-end gap-2');
    expect(brainstormPanelSource).toContain('<div key="brainstorm-genre-background-row" className="grid shrink-0 grid-cols-2 gap-4');
    expect(panelSource).toContain('<div className="mt-2 flex items-center gap-3">');
    expect(panelSource).toContain('<span className="shrink-0 text-sm font-black text-slate-950">逐个生成</span>');
    expect(panelSource).not.toContain('<span className="shrink-0 text-sm font-black text-slate-950">生成个数：</span>');
  });

  it('allows the brainstorm preview and output splitter to drag in both directions', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain('const BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH = 480;');
    expect(panelSource).toContain('const deltaX = (moveEvent.clientX - startX) / eventScale;');
    expect(panelSource).toContain('Math.max(BRAINSTORM_PREVIEW_MIN_WIDTH, startWidth + deltaX)');
    expect(panelSource).toContain('const brainstormLayoutPreviewWidth = Math.min(brainstormPreviewWidth, BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH);');
    expect(panelSource).not.toContain('const BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH = 420;');
  });

  it('uses the writing page cursor for official horizontal resize splitters', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const testCollectionSource = await readTestCollectionSource();

    expect(panelSource).toContain("document.body.style.cursor = 'ew-resize';");
    expect(panelSource).toContain('cursor-ew-resize touch-none items-stretch');
    expect(styleSource).not.toContain('cursor-col-resize');
    expect(panelSource).not.toContain("document.body.style.cursor = 'col-resize';");
    expect(panelSource).not.toContain('cursor-col-resize');
    expect(testCollectionSource).not.toContain('DragSplitterIconTestPage');
    expect(testCollectionSource).not.toContain('/drag-splitter-icon-test');
  });

  it('keeps setting and outline action sidebars wide enough to drag', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain('const SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH = 260;');
    expect(panelSource).toContain('const OUTLINE_LEFT_MAX_DISPLAY_WIDTH = 560;');
    expect(panelSource).toContain('function getSettingLibraryLeftMaxWidth(tab: string, scaleValue = 1)');
    expect(panelSource).toContain('const isSettingTab = tab === SETTING_TAB;');
    expect(panelSource).toContain('const minWidth = isSettingTab ? SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH : SETTING_LIBRARY_LEFT_MIN_WIDTH;');
    expect(panelSource).toContain('function getDetailOutlineLeftMinWidth(scaleValue = 1)');
    expect(panelSource).toContain('const viewportEighthWidth = Math.floor(window.innerWidth / normalizedScale / 8);');
    expect(panelSource).toContain('return Math.max(SETTING_LIBRARY_LEFT_MIN_WIDTH, viewportEighthWidth);');
    expect(panelSource).toContain('if (tab === SETTING_TAB) return SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH;');
    expect(panelSource).toContain('return tab === DETAIL_OUTLINE_TAB || tab === OUTLINE_LIBRARY_TAB');
    expect(panelSource).toContain('const isOutlineActionTab = tab === DETAIL_OUTLINE_TAB || tab === OUTLINE_LIBRARY_TAB;');
    expect(panelSource).toContain('const viewportDivider = isSettingTab ? 2 : isOutlineActionTab ? 2.5 : 5;');
    expect(panelSource).toContain('const viewportLimitWidth = Math.floor(window.innerWidth / normalizedScale / viewportDivider);');
    expect(panelSource).toContain('return Math.max(');
    expect(panelSource).toContain('const fixedMaxWidth = isSettingTab');
    expect(panelSource).toContain('isOutlineActionTab');
    expect(panelSource).toContain('Math.min(fixedMaxWidth, viewportLimitWidth)');
    expect(panelSource).toContain('const minWidth = getSettingLibraryLeftMinWidth(activeTab, eventScale);');
    expect(panelSource).toContain('const maxWidth = Math.max(minWidth, getSettingLibraryLeftMaxWidth(tab, scaleValue));');
    expect(panelSource).toContain('readSettingLibraryLeftWidth(storageKey, activeTab, scale)');
    expect(panelSource).toContain('isBrainstormTab ? BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH : getSettingLibraryLeftMaxWidth(activeTab, eventScale),');
    expect(panelSource).toContain('const outlineSidebarWidth = settingLibraryLeftWidth;');
    expect(panelSource).toContain('gridTemplateColumns: isDetailOutlineTab && showDetailOutlinePublished');
    expect(panelSource).toContain('`${outlineSidebarWidth}px 0px 190px minmax(0,1fr) 0px ${settingLibraryRightWidth}px`');
    expect(panelSource).toContain('`${outlineSidebarWidth}px 0px minmax(0,1fr) 0px ${settingLibraryRightWidth}px`');
    expect(panelSource).toContain("style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(32px, max-content))' }}");
    expect(panelSource).toContain('relative h-9 min-w-9 rounded-lg border px-2 text-sm font-black');
    expect(panelSource).toContain('window.addEventListener(\'resize\', syncVisibleLeftWidth);');
    expect(panelSource).not.toContain('window.addEventListener(\'resize\', clampVisibleLeftWidth);');
    expect(panelSource).not.toContain('const maxWidth = isBrainstormTab ? BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH : SETTING_LIBRARY_LEFT_MAX_WIDTH;');
    expect(panelSource).not.toContain('const outlineSidebarWidth = Math.max(settingLibraryLeftWidth, outlineColumns * 40 + 30);');
    expect(panelSource).not.toContain('const outlineSidebarWidth = Math.min(');
    expect(panelSource).not.toContain('OUTLINE_COLUMN_OPTIONS');
    expect(panelSource).not.toContain('loadOutlineColumns');
    expect(panelSource).not.toContain('每行显示');
    expect(panelSource).not.toContain('const OUTLINE_LEFT_TOOLBAR_SAFE_MIN_WIDTH = 400;');
    expect(panelSource).not.toContain('function isOutlineLeftToolbarSafeTab(tab: string)');
    expect(panelSource).not.toContain('function getOutlineLeftMaxDisplayWidth(scaleValue = 1)');
    expect(panelSource).not.toContain('window.devicePixelRatio');
  });

  it('migrates the number 13 detail outline sidebar replica into production and retires the test route', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const testCollectionSource = await readTestCollectionSource();
    const outlineDirectoryStart = panelSource.indexOf('gridTemplateColumns: isDetailOutlineTab && showDetailOutlinePublished');
    const outlineDirectoryEnd = panelSource.indexOf('{leftResizeHandle}', outlineDirectoryStart);
    const outlineDirectorySource = panelSource.slice(outlineDirectoryStart, outlineDirectoryEnd);

    expect(outlineDirectoryStart).toBeGreaterThan(-1);
    expect(outlineDirectoryEnd).toBeGreaterThan(outlineDirectoryStart);
    expect(panelSource).toContain("const DETAIL_OUTLINE_SIDEBAR_HEADER_CLASS = 'flex h-[42px] shrink-0 items-center justify-between border-b border-[#e6e8ec] bg-[#fbfbfc] px-3 py-2.5';");
    expect(panelSource).toContain("const DETAIL_OUTLINE_SIDEBAR_TITLE_CLASS = 'whitespace-nowrap text-sm font-bold text-gray-900';");
    expect(panelSource).toContain("const DETAIL_OUTLINE_SIDEBAR_COUNT_CLASS = 'flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F8FD] text-xs font-medium text-[#08AACE]';");
    expect(panelSource).toContain("const DETAIL_OUTLINE_SIDEBAR_TOGGLE_CLASS = 'flex items-center justify-center whitespace-nowrap rounded-md bg-[#08AACE] px-2 py-1 text-sm text-white transition-colors hover:bg-[#0798b8]';");
    expect(panelSource).toContain("const DETAIL_OUTLINE_VOLUME_ROW_CLASS = WORKBENCH_FOLDER_GROUP_BUTTON_CLASS;");
    expect(panelSource).not.toContain("const DETAIL_OUTLINE_VOLUME_ROW_CLASS = 'flex h-[54px]");
    expect(panelSource).not.toContain("const DETAIL_OUTLINE_VOLUME_ROW_CLASS = 'grid h-[54px]");
    expect(panelSource).toContain("const DETAIL_OUTLINE_VOLUME_ICON_CLASS = WORKBENCH_FOLDER_GROUP_ICON_CLASS;");
    expect(panelSource).toContain("const DETAIL_OUTLINE_VOLUME_TITLE_CLASS = 'min-w-0 flex-1 truncate leading-none';");
    expect(panelSource).toContain("const DETAIL_OUTLINE_VOLUME_COUNT_CLASS = WORKBENCH_FOLDER_GROUP_COUNT_CLASS;");
    expect(outlineDirectorySource).toContain('className={isDetailOutlineTab ? DETAIL_OUTLINE_SIDEBAR_HEADER_CLASS :');
    expect(outlineDirectorySource).toContain('className={isDetailOutlineTab ? DETAIL_OUTLINE_SIDEBAR_TOGGLE_CLASS :');
    expect(outlineDirectorySource).toContain('className={isDetailOutlineTab ? DETAIL_OUTLINE_VOLUME_ROW_CLASS : WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}');
    expect(outlineDirectorySource).toContain('<div key={volume.id} className="mb-1">');
    expect(outlineDirectorySource).not.toContain('strokeWidth={isDetailOutlineTab ? 2.4 : undefined}');
    expect(outlineDirectorySource).toContain('className={isDetailOutlineTab ? DETAIL_OUTLINE_VOLUME_ICON_CLASS : WORKBENCH_FOLDER_GROUP_ICON_CLASS}');
    expect(outlineDirectorySource).toContain('className={isDetailOutlineTab ? DETAIL_OUTLINE_VOLUME_TITLE_CLASS :');
    expect(outlineDirectorySource).toContain('className={isDetailOutlineTab ? DETAIL_OUTLINE_VOLUME_COUNT_CLASS : WORKBENCH_FOLDER_GROUP_COUNT_CLASS}');
    expect(testCollectionSource).not.toContain('WorkbenchDetailOutlineSidebarReplicaTestPage');
    expect(testCollectionSource).not.toContain('/workbench-detail-outline-sidebar-replica-test');
    expect(testCollectionSource).not.toContain('13号测试');
  });

  it('drags and restores the setting page left splitter width', () => {
    const storageKey = 'workbench-setting-left-resize-interaction-test';
    const widthStorageKey = `${storageKey}_大纲_left_width`;
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });

    try {
      const { unmount } = render(
        <WorkbenchLibraryPanel
          storageKey={storageKey}
          tabs={['大纲', '角色', '脑洞']}
          emptyText="暂无内容"
          defaultActiveTab="大纲"
        />,
      );

      const leftSplitter = screen.getByTitle('拖拽调整左侧宽度');
      fireEvent.pointerDown(leftSplitter, { clientX: 100, pointerId: 1 });
      fireEvent.pointerMove(window, { clientX: 190 });
      fireEvent.pointerUp(window);

      const savedWidth = Number(localStorage.getItem(widthStorageKey));
      expect(savedWidth).toBeGreaterThan(180);
      expect(savedWidth).toBeLessThanOrEqual(640);

      unmount();
      render(
        <WorkbenchLibraryPanel
          storageKey={storageKey}
          tabs={['大纲', '角色', '脑洞']}
          emptyText="暂无内容"
          defaultActiveTab="大纲"
        />,
      );

      const restoredSplitter = screen.getByTitle('拖拽调整左侧宽度');
      expect(restoredSplitter.parentElement).toHaveStyle({
        gridTemplateColumns: `${savedWidth}px 0px minmax(0,1fr) 0px 350px`,
      });
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth });
    }
  });

  it('keeps setting map text fields hidden until scrolling with half-width scrollbars', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const settingSidebarStart = panelSource.indexOf('gridTemplateRows: activeTab === SETTING_TAB && !activeIsBrainstorm');
    const settingSidebarSource = panelSource.slice(settingSidebarStart, settingSidebarStart + 12000);

    expect(panelSource).toContain("const [activeSettingSidebarScrollKey, setActiveSettingSidebarScrollKey] = useState<string | null>(null);");
    expect(panelSource).toContain('onScroll={() => handleSettingSidebarScroll');
    expect(settingSidebarSource).not.toContain('scrollbar-scroll-only scrollbar-half-width min-h-0 flex-1 overflow-y-auto');
    expect(panelSource).toContain('className="mt-0.5 space-y-0.5"');
    expect(panelSource).not.toContain('scrollbar-scroll-only scrollbar-half-width mt-0.5 max-h-[760px] space-y-0.5 overflow-y-auto');
    expect(panelSource).toContain('scrollbar-scroll-only scrollbar-half-width text-sm leading-7 text-gray-700');
    expect(panelSource).toContain('onScroll={() => handleSettingSidebarScroll(`setting-textarea:');
    expect(styleSource).toContain('.xy-setting-sidebar-scrollbar::-webkit-scrollbar');
    expect(styleSource).toContain('.scrollbar-scroll-only.scrollbar-half-width::-webkit-scrollbar');
    expect(styleSource).toContain('width: 4px;');
    expect(styleSource).toContain('height: 4px;');
  });

  it('uses the body page format for the outline right-side output card', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const outlineRightPanelAnchor = panelSource.lastIndexOf('promptValue={activeOutlinePromptId');
    const outlineRightPanelStart = panelSource.lastIndexOf('<aside className="min-w-0 flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">', outlineRightPanelAnchor);
    const outlineRightPanelEnd = panelSource.indexOf('</aside>', outlineRightPanelStart);
    const outlineRightPanelSource = panelSource.slice(outlineRightPanelStart, outlineRightPanelEnd);

    expect(outlineRightPanelAnchor).toBeGreaterThan(-1);
    expect(outlineRightPanelStart).toBeGreaterThan(-1);
    expect(outlineRightPanelEnd).toBeGreaterThan(outlineRightPanelStart);
    expect(outlineRightPanelSource).toContain('<div className="relative mt-5 min-h-[170px] flex-1">');
    expect(outlineRightPanelSource).toContain('xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-fill xy-floating-with-bottom-count h-full');
    expect(outlineRightPanelSource).not.toContain('AI对话框');
    expect(outlineRightPanelSource).not.toContain('xy-soft-shell-panel');
    expect(outlineRightPanelSource).not.toContain('relative mt-6 flex min-h-[310px] flex-1 flex-col rounded-xl border border-slate-200 bg-white px-3 pb-3 pt-5');
    expect(outlineRightPanelSource).not.toContain('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-inner-clear-tool absolute z-40 px-1');
    expect(styleSource).toContain('.xy-floating-field.xy-outline-ai-output-frame {');
    expect(styleSource).toContain('border: 2px solid #111827;');
    expect(styleSource).toContain('.xy-floating-field.xy-outline-ai-output-frame label.xy-floating-title-count,');
    expect(styleSource).toContain('transform: translateY(-50%) scale(1);');
    expect(panelSource).toContain('const shouldShowOutlineDraftWordCount = plotPointStandalone;');
    expect(panelSource).not.toContain('const shouldShowOutlineDraftWordCount = plotPointStandalone || isDetailOutlineTab;');
    expect(panelSource).toContain('if (isDetailOutlineLikeTab(activeTab)) return;');
    expect(panelSource).toContain("if (!isDetailOutlineTab && !isDetailOutlineLikeTab(activeTab)) setOutlinePreviewDraft(entry?.content ?? '');");
    expect(panelSource).not.toContain('const outlineDraftChapterMeta');
    expect(outlineRightPanelSource).not.toContain('outlineDraftChapterMeta');
    expect(outlineRightPanelSource).not.toContain('selectedOutlineChapter?.chapter.wordCount');
    expect(outlineRightPanelSource).not.toContain('selectedOutlineChapter.chapter.wordCount');
    expect(outlineRightPanelSource).not.toContain('selectedVolumeWordCount');
    expect(outlineRightPanelSource).not.toContain('章节字数：');
    expect(outlineRightPanelSource).not.toContain('正文：<WordCountText value={selectedOutlineChapter.chapter.wordCount} compact />');
    expect(outlineRightPanelSource).not.toContain('第{selectedOutlineChapter.chapter.serialNumber}章 {selectedChapterTitle}');
    expect(outlineRightPanelSource).toContain('{shouldShowOutlineDraftWordCount && (');
    expect(panelSource).toContain(': `第${selectedOutlineChapter.chapter.serialNumber}章梗概`');
    expect(outlineRightPanelSource).toContain('{isDetailOutlineTab && (');
    expect(outlineRightPanelSource).toContain('label="关联大纲"');
    expect(outlineRightPanelSource).toContain('linkedLabel="已关联大纲"');
    expect(outlineRightPanelSource).toContain('clearOnLinkedClick');
    expect(outlineRightPanelSource).toContain('onClear={clearDetailOutlineReaderSelection}');
    expect(outlineRightPanelSource).toContain('linkedButtonClassName="min-w-0 flex-1 whitespace-nowrap px-3 text-sm font-black text-white bg-red-500 hover:bg-red-600"');
    expect(outlineRightPanelSource).not.toContain('clearButtonClassName="flex h-full w-9 shrink-0 items-center justify-center border-l border-red-300 bg-red-500 text-white transition-colors hover:bg-red-600"');
    expect(outlineRightPanelSource).toContain('meta={<>关联 <WordCountText value={detailOutlineReaderWordCount} compact /></>}');
    expect(outlineRightPanelSource).toContain('className="mt-3 flex items-center gap-2"');
    expect(outlineRightPanelSource).toContain('groupClassName="flex h-10 w-[132px] shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white"');
    expect(outlineRightPanelSource).toContain('buttonClassName="h-10 w-[132px] whitespace-nowrap rounded-xl border border-[#08AACE] bg-white px-3 text-sm font-black text-[#08AACE] hover:bg-[#EAF9FD]"');
    expect(panelSource).toContain("readerTitle: '关联资料'");
    expect(panelSource).toContain("readerEmptyText: '未关联章纲、设定或角色'");
    expect(panelSource).toContain("if (isDetailOutlineTab) return wrapAiRequestTag('本章要求', userText);");
    expect(panelSource).toContain("return wrapAiRequestTag('梗概要求', userText);");
    expect(panelSource).toContain("const outlineUserLogTitle = isDetailOutlineTab && !plotPointStandalone ? '其他要求' : '输入内容';");
    expect(panelSource).toContain('userTitle: outlineUserLogTitle');
    expect(panelSource).toContain('<div className="text-xs text-slate-400">{outlineUserLogTitle}</div>');
    expect(panelSource).not.toContain("userTitle: '输入内容'");
    expect(outlineRightPanelSource).not.toContain('label="关联设定"');
    expect(outlineRightPanelSource).not.toContain('linkedButtonClassName="h-9 shrink-0 rounded-xl bg-[#08AACE] px-3 text-sm font-black text-white transition-colors hover:bg-[#0798b8]"');
    expect(outlineRightPanelSource).not.toContain('metaClassName="shrink-0 text-xs font-bold text-slate-400"');
    expect(outlineRightPanelSource).not.toContain('已关联 {selectedDetailOutlineReaderItems.length} 项');
    expect(outlineRightPanelSource).not.toContain('className="mt-3 flex items-center justify-between gap-3"');
    expect(outlineRightPanelSource).not.toContain('metaClassName="min-w-0 truncate text-right text-xs font-bold text-slate-400"');
    expect(panelSource).toContain("isDetailOutlineTab ? 'AI输出章纲'");
    expect(panelSource).toContain("? 'AI输出框'");
    expect(panelSource).not.toContain('? getOutlineChapterFrameTitle(selectedOutlineChapter.volume, selectedOutlineChapter.chapter)');
    expect(outlineRightPanelSource).toContain('生成后的章纲会显示在这里，也可以手动编辑后替换所选章纲。');
    expect(panelSource).toContain("const [lastDetailOutlineReplacement, setLastDetailOutlineReplacement]");
    expect(panelSource).toContain('setLastDetailOutlineReplacement({');
    expect(panelSource).toContain('content: selectedOutlineEntry?.content ??');
    expect(panelSource).toContain('updateActiveTabConfig({ outlineAiTaskId: undefined });');
    expect(panelSource).toContain("setOutlinePreviewDraft('');");
    expect(panelSource).toContain('updateChapterSummary(lastDetailOutlineReplacement.chapterSerialNumber, lastDetailOutlineReplacement.content);');
    expect(panelSource).toContain('const undoDetailOutlineReplacement = () => {');
    expect(outlineRightPanelSource).toContain("isDetailOutlineTab ? '替换章纲' : '保存梗概'");
    expect(outlineRightPanelSource).toContain('onClick={undoDetailOutlineReplacement}');
    expect(outlineRightPanelSource).toContain('disabled={!lastDetailOutlineReplacement}');
    expect(outlineRightPanelSource).toContain('撤销替换');
    expect(outlineRightPanelSource).toContain("isDetailOutlineTab ? '复制章纲' : '复制梗概'");
    expect(panelSource).toContain('const OUTLINE_ACTION_RIGHT_MIN_WIDTH = 420;');
    expect(panelSource).toContain('? OUTLINE_ACTION_RIGHT_MIN_WIDTH');
    expect(outlineRightPanelSource).toContain('min-w-[92px] flex-1 whitespace-nowrap bg-brand');
    expect(outlineRightPanelSource).toContain('min-w-[92px] flex-1 whitespace-nowrap border-l border-blue-200');
    expect(outlineRightPanelSource).toContain('min-w-[92px] flex-1 whitespace-nowrap border-l border-gray-200');
    expect(outlineRightPanelSource).not.toContain('min-w-[92px] flex-1 whitespace-nowrap border-l border-red-200');
    expect(outlineRightPanelSource).not.toContain("isDetailOutlineTab ? '清空章纲' : '清空梗概'");
    expect(outlineRightPanelSource).not.toContain('保存章纲');
    expect(outlineRightPanelSource).not.toContain('xy-floating-outline-output-clear-tool');
    expect(outlineRightPanelSource).not.toContain('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate absolute -top-2 right-4 px-1');
    expect(outlineRightPanelSource).not.toContain('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate absolute -top-2 right-10 z-30 px-1');
  });

  it('keeps detail outline card top labels from competing with body word counts', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const cardMetaAnchor = panelSource.indexOf('xy-floating-outline-chapter-meta');
    const cardMetaStart = panelSource.lastIndexOf('const outlineCardTitle = getOutlineChapterFrameTitle(volume, chapter);', cardMetaAnchor);
    const cardMetaEnd = panelSource.indexOf('</section>', cardMetaStart);
    const cardMetaSource = panelSource.slice(cardMetaStart, cardMetaEnd);

    expect(cardMetaAnchor).toBeGreaterThan(-1);
    expect(cardMetaStart).toBeGreaterThan(-1);
    expect(cardMetaEnd).toBeGreaterThan(cardMetaStart);
    expect(cardMetaSource).toContain('chapter.serialNumber');
    expect(cardMetaSource).toContain('chapter.title.trim() ||');
    expect(cardMetaSource).toContain('detailOutlineParts.outline');
    expect(cardMetaSource).toContain('WordCountText value={countTextWords(detailOutlineParts.outline)}');
    expect(cardMetaSource).toContain("`第${getVolumeDisplayIndex(volume.id)}卷 · ${chapter.title.trim() || '未命名章节'}`");
    expect(cardMetaSource).toContain('max-w-[44%]');
    expect(cardMetaSource).not.toContain('max-w-[58%]');
    expect(cardMetaSource).not.toContain('正文：');
    expect(cardMetaSource).toContain('xy-floating-outline-chapter-meta xy-border-embedded-transparent-backplate');
    expect(styleSource).toContain('.xy-floating-field.xy-floating-outline-preview .xy-floating-outline-chapter-meta');
    expect(styleSource).toContain('background: transparent;');
    expect(styleSource).toContain('.xy-floating-field.xy-floating-outline-preview .xy-floating-outline-chapter-meta *');
  });

  it('keeps detail outline card titles free of body word counts', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const cardSourceStart = panelSource.indexOf('const outlineCardTitle = getOutlineChapterFrameTitle(volume, chapter);');
    const cardSourceEnd = panelSource.indexOf('})()', cardSourceStart);
    const cardSource = panelSource.slice(cardSourceStart, cardSourceEnd);
    const labelStart = cardSource.indexOf('<label className="xy-floating-title-count xy-detail-outline-title-count">');
    const labelEnd = cardSource.indexOf('</label>', labelStart);
    const labelSource = cardSource.slice(labelStart, labelEnd);

    expect(cardSourceStart).toBeGreaterThan(-1);
    expect(cardSourceEnd).toBeGreaterThan(cardSourceStart);
    expect(labelStart).toBeGreaterThan(-1);
    expect(labelEnd).toBeGreaterThan(labelStart);
    expect(cardSource).toContain('splitDetailOutlineStateExpectation(outlineCardContent)');
    expect(cardSource).toContain('value={detailOutlineParts.outline}');
    expect(cardSource).toContain('value={detailOutlineParts.stateExpectation}');
    expect(panelSource).toContain('<span className="xy-floating-title-text xy-detail-outline-heading-title">状态变化</span>');
    expect(labelSource).toContain('xy-detail-outline-title-count');
    expect(labelSource).toContain('xy-floating-title-text xy-detail-outline-heading-title');
    expect(labelSource).toContain('{outlineCardTitle}');
    expect(panelSource).toContain("? `第${chapter.serialNumber}章章纲`");
    expect(panelSource).not.toContain("? `第${chapter.serialNumber}章章纲（第${getVolumeDisplayIndex(volume.id)}卷）`");
    expect(labelSource).not.toContain('countTextWords(outlineCardContent)');
    expect(labelSource).not.toContain('WordCountText');
    expect(labelSource).not.toContain('章纲：');
    expect(cardSource).toContain('<WordCountText value={countTextWords(detailOutlineParts.outline)} />');
    expect(panelSource).toContain('<WordCountText value={countTextWords(detailOutlineParts.stateExpectation)} />');
    const rightPreviewStart = panelSource.indexOf('<div className="relative mt-5 min-h-[170px] flex-1">');
    const rightPreviewEnd = panelSource.indexOf('{isDetailOutlineTab && (', rightPreviewStart);
    const rightPreviewSource = panelSource.slice(rightPreviewStart, rightPreviewEnd);

    expect(panelSource).toContain('const clearOutlineAiOutputDraft = () => {');
    expect(panelSource).toContain('onClick={clearOutlineAiOutputDraft}');
    expect(panelSource).toContain('const renderDetailOutlineDraftClearButton = () => {');
    expect(panelSource).toContain('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-draft-clear-tool absolute z-40 px-1');
    expect(cardSource).not.toContain('onClick={() => updateChapterSummary(chapter.serialNumber, \'\')}');
    expect(cardSource).not.toContain('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-card-clear-tool absolute z-30 px-1');
    expect(rightPreviewSource).toContain('{renderDetailOutlineDraftClearButton()}');
    const clearOutputStart = panelSource.indexOf('const clearOutlineAiOutputDraft = () => {');
    const clearOutputEnd = panelSource.indexOf('const renderDetailOutlineDraftClearButton = () => {', clearOutputStart);
    const clearOutputSource = panelSource.slice(clearOutputStart, clearOutputEnd);
    const clearPreviewStart = panelSource.indexOf('const clearOutlinePreviewDraft = () => {');
    const clearPreviewEnd = panelSource.indexOf('const plotPointLinkedSettingSummary =', clearPreviewStart);
    const clearPreviewSource = panelSource.slice(clearPreviewStart, clearPreviewEnd);

    expect(clearOutputSource).toContain("setOutlinePreviewDraft('');");
    expect(clearOutputSource).not.toContain('updateChapterSummary');
    expect(clearOutputSource).not.toContain('updateVolumeSummary');
    expect(clearPreviewSource).toContain("setOutlinePreviewDraft('');");
    expect(clearPreviewSource).not.toContain('updateChapterSummary');
    expect(clearPreviewSource).not.toContain('updateVolumeSummary');
    expect(cardSource).not.toContain("'--xy-floating-count-left': '12.8rem'");
    expect(cardSource).not.toContain("'--xy-floating-count-left': isDetailOutlineTab ? '12.8rem' : '11.4rem'");
    expect(cardSource).not.toContain('{!isDetailOutlineTab && (');
    expect(styleSource).toContain('gap: 0.32rem;');
    expect(styleSource).toContain('max-width: min(13rem, calc(42% - 1.5rem));');
    expect(styleSource).toContain('.xy-detail-outline-title-count .xy-floating-title-text');
    expect(styleSource).toContain('.xy-detail-outline-title-count .xy-floating-title-text.xy-detail-outline-heading-title');
    expect(styleSource).toContain('color: #020617;');
    expect(styleSource).toContain('font-size: 0.875rem;');
    expect(styleSource).toContain('font-weight: 900;');
    expect(styleSource).toContain('-webkit-text-stroke: 0;');
    expect(styleSource).toContain('text-overflow: ellipsis;');
    expect(styleSource).toContain('.xy-floating-outline-draft-clear-tool {');
    expect(styleSource).toContain('top: 0;');
    expect(styleSource).toContain('right: 1.65rem;');
    expect(styleSource).toContain('bottom: auto;');
    expect(styleSource).toContain('transform: translateY(-50%);');
  });

  it('places library preview font size controls in the header tool slot and applies detail outline size to every chapter outline card', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const cardSourceStart = panelSource.indexOf('const outlineCardTitle = getOutlineChapterFrameTitle(volume, chapter);');
    const cardSourceEnd = panelSource.indexOf('</section>', cardSourceStart);
    const cardSource = panelSource.slice(cardSourceStart, cardSourceEnd);
    const settingPreviewStart = panelSource.indexOf('placeholder="这里显示选中的设定内容，也可以直接编辑。"');
    const settingPreviewEnd = panelSource.indexOf('<div className="mt-6 flex shrink-0 justify-end">', settingPreviewStart);
    const settingPreviewSource = panelSource.slice(settingPreviewStart, settingPreviewEnd);
    const emptySettingPreviewStart = panelSource.indexOf('placeholder="这里可以直接输入设定内容，会自动新建设定。"');
    const emptySettingPreviewEnd = panelSource.indexOf('</div>', emptySettingPreviewStart);
    const emptySettingPreviewSource = panelSource.slice(emptySettingPreviewStart, emptySettingPreviewEnd);
    const outlineDirectoryStart = panelSource.indexOf('gridTemplateColumns: isDetailOutlineTab && showDetailOutlinePublished');
    const outlineDirectoryEnd = panelSource.indexOf('{leftResizeHandle}', outlineDirectoryStart);
    const outlineDirectorySource = panelSource.slice(outlineDirectoryStart, outlineDirectoryEnd);

    expect(panelSource).toContain('detailOutlineFontSize?: number');
    expect(panelSource).toContain('const detailOutlineFontSize = Math.min(');
    expect(panelSource).toContain('const setDetailOutlineFontSize = (value: number) =>');
    expect(panelSource).toContain('fontSize: detailOutlineFontSize');
    expect(panelSource).toContain('const renderDetailOutlineFontSizeTool = () => {');
    expect(panelSource).toContain('if (activeTab !== DETAIL_OUTLINE_TAB || plotPointStandalone) return null;');
    expect(panelSource).toContain('const getActiveLibraryFontConfig = () => {');
    expect(panelSource).toContain('const renderActiveLibraryFontSizeTool = () => {');
    expect(panelSource).toContain('const renderLibraryHeaderFontSizeTool = () => {');
    expect(panelSource).toContain('const [headerToolPortalTarget, setHeaderToolPortalTarget]');
    expect(panelSource).toContain("setHeaderToolPortalTarget(document.getElementById('workbench-header-extra-tools'))");
    expect(panelSource).toContain('const libraryHeaderFontSizePortal = headerToolPortalTarget && !showInlineFieldSizeButton');
    expect(panelSource).toContain('createPortal(renderLibraryHeaderFontSizeTool(), headerToolPortalTarget)');
    expect(panelSource).toContain('{libraryHeaderFontSizePortal}');
    expect(panelSource).toContain("ariaLabel: '章纲字号'");
    expect(panelSource).toContain("ariaLabel: '脑洞预览字号'");
    expect(panelSource).toContain("ariaLabel: '脑洞输出字号'");
    expect(panelSource).toContain("ariaLabel: '设定预览字号'");
    expect(panelSource).not.toContain('章纲目录');
    expect(panelSource).not.toContain('<h3 className="text-base font-bold text-gray-900">{isDetailOutlineTab ?');
    expect(panelSource).not.toContain('>章节梗概</h3>');
    expect(panelSource).toContain("onFocus={() => setActiveLibraryFontTarget('settingPreview')}");
    expect(panelSource).toContain("if (isDetailOutlineTab) setActiveLibraryFontTarget('detailOutline');");
    expect(panelSource).toContain('style={isDetailOutlineTab ? { fontSize: detailOutlineFontSize } : undefined}');
    expect(panelSource).toContain("onMouseDown={() => {");
    expect(panelSource).toContain('className="shrink-0"');
    expect(cardSourceStart).toBeGreaterThan(-1);
    expect(cardSourceEnd).toBeGreaterThan(cardSourceStart);
    expect(cardSource).not.toContain('ariaLabel="章纲字号"');
    expect(cardSource).not.toContain('<div className="xy-floating-border-font-tool">');
    expect(settingPreviewSource).not.toContain('<div className="xy-floating-border-font-tool">');
    expect(emptySettingPreviewSource).not.toContain('<div className="xy-floating-border-font-tool">');
    expect(outlineDirectoryStart).toBeGreaterThan(-1);
    expect(outlineDirectoryEnd).toBeGreaterThan(outlineDirectoryStart);
    expect(outlineDirectorySource).not.toContain('mb-3 flex min-h-9 items-center justify-end gap-2');
    expect(outlineDirectorySource).not.toContain("renderLibraryAiLogButton('outline')");
    expect(outlineDirectorySource).not.toContain('renderDetailOutlineFontSizeTool()');
    expect(outlineDirectorySource).not.toContain('renderFieldSizeButton()');
    expect(outlineDirectorySource).toContain('<div className="min-h-0 flex-1 overflow-y-auto">');
  });

  it('uses border-embedded transparent backplates without rectangular white shadows', async () => {
    const styleSource = await readSharedStylesSource();
    const transparentBackplateStart = styleSource.indexOf('.xy-floating-field.xy-floating-outline-preview label');
    const transparentBackplateEnd = styleSource.indexOf('.xy-floating-field.xy-floating-chat-shell', transparentBackplateStart);
    const transparentBackplateSource = styleSource.slice(transparentBackplateStart, transparentBackplateEnd);
    const countRuleStart = styleSource.indexOf('.xy-floating-field.xy-floating-outline-preview .xy-floating-count');
    const countRuleEnd = styleSource.indexOf('.xy-floating-field.xy-floating-with-bottom-count', countRuleStart);
    const countRuleSource = styleSource.slice(countRuleStart, countRuleEnd);
    const clearRuleStart = styleSource.indexOf('.xy-floating-outline-clear-button,');
    const clearRuleEnd = styleSource.indexOf('.xy-floating-field.xy-floating-with-bottom-count textarea', clearRuleStart);
    const clearRuleSource = styleSource.slice(clearRuleStart, clearRuleEnd);

    expect(styleSource).toContain('.xy-border-embedded-transparent-backplate {');
    expect(styleSource).toContain('.xy-border-embedded-transparent-backplate *');
    expect(styleSource).toContain('.xy-floating-field .xy-floating-count *');
    expect(styleSource).toContain('.xy-floating-field .xy-floating-count {');
    expect(styleSource).toContain('.xy-brainstorm-floating-title-tool::before,');
    expect(styleSource).toContain('.xy-brainstorm-output-title-tool::before');
    expect(styleSource).toContain('display: block !important;');
    expect(styleSource).toContain('.xy-brainstorm-output-preview-list {');
    expect(styleSource).toContain('background: transparent;');
    expect(styleSource).toContain('padding: 0;');
    expect(transparentBackplateSource).toContain('background-color: transparent;');
    expect(transparentBackplateSource).toContain('text-shadow: none;');
    expect(transparentBackplateSource).toContain('-webkit-text-stroke: 3px #ffffff;');
    expect(transparentBackplateSource).toContain('paint-order: stroke fill;');
    expect(transparentBackplateSource).toContain('isolation: isolate;');
    expect(transparentBackplateSource).toContain('background-image: linear-gradient(');
    expect(countRuleSource).toContain('.xy-floating-field.xy-floating-outline-preview .xy-floating-count *');
    expect(countRuleSource).toContain('.xy-floating-field.xy-floating-outline-preview .xy-floating-outline-chapter-meta *');
    expect(clearRuleSource).toContain('.xy-floating-outline-clear-button *');
    expect(clearRuleSource).toContain('background-color: transparent !important;');
    expect(clearRuleSource).not.toContain('background: transparent !important;');
    expect(clearRuleSource).not.toContain('1px 0 0 #ffffff');
    expect(clearRuleSource).not.toContain('-1px 0 0 #ffffff');
  });

  it('explicitly marks border-embedded content with the transparent backplate class', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterSource = await readChapterEditorSource();

    expect(panelSource).toContain('xy-floating-outline-chapter-meta xy-border-embedded-transparent-backplate');
    expect(panelSource).toContain('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate');
    expect(panelSource).toContain('xy-floating-inline-title-tool xy-brainstorm-floating-title-tool xy-floating-title-count xy-border-embedded-transparent-backplate');
    expect(chapterSource).toContain('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate');
  });

  it('does not show an AI dialogue label in the setting outline generator output area', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const outputAreaAnchor = panelSource.indexOf('<label className="xy-floating-title-count xy-border-embedded-transparent-backplate">生成设定</label>');
    const outputAreaStart = panelSource.lastIndexOf('<div className="relative mt-5 min-h-0 flex-1">', outputAreaAnchor);
    const outputAreaEnd = panelSource.indexOf('{activeTab === SETTING_TAB && (', outputAreaAnchor);
    const outputAreaSource = panelSource.slice(outputAreaStart, outputAreaEnd);

    expect(outputAreaAnchor).toBeGreaterThan(-1);
    expect(outputAreaStart).toBeGreaterThan(-1);
    expect(outputAreaEnd).toBeGreaterThan(outputAreaStart);
    expect(outputAreaSource).toContain('xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-fill h-full');
    expect(outputAreaSource).toContain('<label className="xy-floating-title-count xy-border-embedded-transparent-backplate">生成设定</label>');
    expect(outputAreaSource).toContain('onClick={clearLibraryAiDialog}');
    expect(outputAreaSource).toContain('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-top-clear-tool absolute z-40 px-1');
    expect(outputAreaSource).not.toContain('可以在这里生成');
    expect(outputAreaSource).not.toContain('text-gray-400');
    expect(outputAreaSource).not.toContain('AI对话框');
    expect(outputAreaSource).not.toContain('rounded-xl border border-gray-200 bg-white px-3 pb-3 pt-5');
    expect(outputAreaSource).not.toContain('absolute -top-2 left-4 bg-white px-1 text-sm font-black text-gray-900');
    expect(styleSource).toContain('.xy-floating-outline-top-clear-tool {');
    expect(styleSource).toContain('transform: translateY(-50%);');
  });

  it('does not show an AI dialogue label in the plot point generator output area', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const plotPointAreaEnd = panelSource.indexOf('title={plotPointLinkedSettingSummary}');
    const plotPointAreaStart = panelSource.lastIndexOf('<div className="relative flex min-h-0 flex-1 flex-col">', plotPointAreaEnd);
    const plotPointAreaSource = panelSource.slice(plotPointAreaStart, plotPointAreaEnd);

    expect(plotPointAreaEnd).toBeGreaterThan(-1);
    expect(plotPointAreaStart).toBeGreaterThan(-1);
    expect(plotPointAreaEnd).toBeGreaterThan(plotPointAreaStart);
    expect(plotPointAreaSource).toContain('xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 xy-has-value');
    expect(plotPointAreaSource).not.toContain('AI对话框');
    expect(plotPointAreaSource).not.toContain('rounded-xl border border-slate-200 bg-white px-3 pb-3 pt-5');
    expect(plotPointAreaSource).not.toContain('absolute -top-2 left-4 bg-white px-1 text-sm font-black text-slate-950');
  });

  it('uses the 07 no-card right-side shell across official editor right panels', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterSource = await readChapterEditorSource();

    expect(panelSource).toContain('<aside className="flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">');
    expect(panelSource).toContain('<aside className="min-w-0 flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">');
    expect(panelSource).toContain('xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-fill xy-floating-with-bottom-count h-full');
    expect(chapterSource).toContain('xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count mt-4 min-h-0 flex-1');
    expect(chapterSource).toContain('xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill h-full xy-has-value');
    expect(chapterSource).toContain("const CHAPTER_EDITOR_RESIZE_HANDLE_CLASS = 'group relative z-10 flex h-full w-3 -translate-x-1/2 cursor-ew-resize items-stretch justify-center bg-transparent';");
    expect(chapterSource).toContain('style={{ gridTemplateColumns: `${statusPageLeftWidth}px 0px minmax(0,1fr) 0px ${statusPageRightWidth}px` }}');
    expect(chapterSource).toContain('style={{ gridTemplateColumns: `${reviewPageLeftWidth}px 0px minmax(0,1fr) 0px ${reviewPageRightWidth}px` }}');
    expect(panelSource).not.toContain('relative mt-5 flex min-h-0 flex-1 flex-col rounded-xl border border-gray-200 bg-white px-3 pb-3 pt-5');
    expect(panelSource).not.toContain('relative flex h-full min-h-0 flex-col rounded-xl border border-gray-200 bg-white px-3 pb-3 pt-5');
    expect(panelSource).not.toContain('relative flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white px-3 pb-3 pt-5');
    expect(chapterSource).not.toContain('AI 閰嶇疆');
    expect(chapterSource).not.toContain('AI 输出框');
    expect(chapterSource).not.toContain('flex min-h-[240px] flex-col rounded-2xl border border-[#08AACE] bg-white');
  });

  it('does not show the plot chain generation rules heading in the right panel', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const plotPointControlsStart = panelSource.indexOf('<span className="w-[96px] shrink-0 text-sm font-black text-slate-950">长度：</span>');
    const plotPointControlsEnd = panelSource.indexOf('<div className="relative flex min-h-0 flex-1 flex-col">', plotPointControlsStart);
    const plotPointControlsSource = panelSource.slice(plotPointControlsStart, plotPointControlsEnd);

    expect(plotPointControlsStart).toBeGreaterThan(-1);
    expect(plotPointControlsEnd).toBeGreaterThan(plotPointControlsStart);
    expect(plotPointControlsSource).toContain('剧情点类型：');
    expect(plotPointControlsSource).toContain('剧情点数量：');
    expect(plotPointControlsSource).not.toContain('生成规则</div>');
  });

  it('keeps detail outline reader aligned with the setting link picker layout', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const modalHeaderStart = panelSource.indexOf('const detailOutlineReaderModal = isDetailOutlineReaderOpen && isDetailOutlineTab ? createPortal(');
    const modalHeaderEnd = panelSource.indexOf('const sendPlotPointAiMessage = async () => {', modalHeaderStart);
    const modalHeaderSource = panelSource.slice(modalHeaderStart, modalHeaderEnd);
    const readerAsideStart = modalHeaderSource.indexOf('<aside className="editor-scrollbar min-h-0 overflow-y-auto border-r border-gray-100 bg-slate-50 px-1 py-2">');
    const readerAsideEnd = modalHeaderSource.indexOf('<main className="editor-scrollbar min-h-0 overflow-y-auto p-6">', readerAsideStart);
    const readerAsideHeaderSource = modalHeaderSource.slice(readerAsideStart, readerAsideEnd);

    expect(modalHeaderStart).toBeGreaterThan(-1);
    expect(modalHeaderEnd).toBeGreaterThan(modalHeaderStart);
    expect(readerAsideStart).toBeGreaterThan(-1);
    expect(readerAsideEnd).toBeGreaterThan(readerAsideStart);
    expect(modalHeaderSource).toContain('<h3 className="text-xl font-bold text-gray-900">关联资料</h3>');
    expect(modalHeaderSource).toContain('grid-cols-[300px_minmax(0,1fr)_280px]');
    expect(modalHeaderSource).toContain('本次将读取');
    expect(modalHeaderSource).toContain('draftDetailOutlineReaderItems.map((entry) => (');
    expect(modalHeaderSource).toContain('setDetailOutlineReaderPreviewId(entry.id);');
    expect(modalHeaderSource).toContain("['outlines', '章纲']");
    expect(modalHeaderSource).toContain("['settings', '设定']");
    expect(modalHeaderSource).toContain("['roles', '角色']");
    expect(modalHeaderSource).not.toContain("['plotChain', '剧情链']");
    expect(modalHeaderSource).not.toContain('选择会随本次请求一起发给 AI；剧情大纲也可按需要勾选或取消。');
    expect(panelSource).not.toContain('选择会随本次请求一起发给 AI；剧情大纲也可按需要勾选或取消。');
    expect(panelSource).toContain("setDetailOutlineReaderTab('outlines');");
    expect(panelSource).not.toContain("setDetailOutlineReaderTab('settings');");
    expect(readerAsideHeaderSource).toContain('WORKBENCH_FOLDER_GROUP_BUTTON_CLASS');
    expect(modalHeaderSource).toContain('onClick={selectAllActiveDetailOutlineReaderItems}');
    expect(modalHeaderSource).toContain('关联所有');
  });

  it('keeps outline page text inputs protected from draggable overlays and decorative hit targets', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const aiInlineInputSource = await readAiInlineInputSource();
    const selectedSettingStart = panelSource.indexOf('placeholder="这里显示选中的设定内容，也可以直接编辑。"');
    const selectedSettingSource = panelSource.slice(panelSource.lastIndexOf('<textarea', selectedSettingStart), selectedSettingStart);
    const volumeStart = panelSource.indexOf('placeholder="这一卷的梗概会显示在这里，内容是该卷下所有章节内容的总结。"');
    const volumeSource = panelSource.slice(panelSource.lastIndexOf('<textarea', volumeStart), volumeStart);
    const chapterStart = panelSource.indexOf('placeholder={isDetailOutlineTab ? \'该章章纲会显示在这里，可由 AI 根据章节内容生成。\'');
    const chapterSource = panelSource.slice(panelSource.lastIndexOf('<textarea', chapterStart), chapterStart);
    const draftStart = panelSource.indexOf('placeholder={plotPointStandalone ? \'生成后的剧情点会显示在这里，也可以手动编辑后复制。\'');
    const draftSource = panelSource.slice(panelSource.lastIndexOf('<textarea', draftStart), draftStart);

    expect(selectedSettingStart).toBeGreaterThan(-1);
    expect(volumeStart).toBeGreaterThan(-1);
    expect(chapterStart).toBeGreaterThan(-1);
    expect(draftStart).toBeGreaterThan(-1);
    expect(selectedSettingSource).toContain('data-no-modal-drag="true"');
    expect(volumeSource).toContain('data-no-modal-drag="true"');
    expect(chapterSource).toContain('data-no-modal-drag="true"');
    expect(draftSource).toContain('data-no-modal-drag="true"');
    expect(aiInlineInputSource).toContain('<div data-no-modal-drag="true"');
    expect(aiInlineInputSource).toContain("variant?: 'default' | 'neutral'");
    expect(aiInlineInputSource).toContain("variant = 'neutral'");
    expect(aiInlineInputSource).toContain("variant === 'neutral' ? 'xy-ai-inline-neutral' : ''");
    expect(aiInlineInputSource).toContain('<textarea\n        data-no-modal-drag="true"');
    expect(styleSource).toContain('.writer-assistant-theme .xy-floating-field.xy-ai-inline-neutral.xy-floating-with-inline-actions textarea');
    expect(styleSource).toContain('border-color: #d7dee8;');
    expect(styleSource).toContain('.writer-assistant-theme .xy-floating-field.xy-ai-inline-neutral .xy-ai-inline-send');
    expect(styleSource).toContain('color: #334155;');
    expect(styleSource).not.toContain('.xy-floating-field input,\n.xy-floating-field textarea {\n  position: relative;\n  z-index: 1;');
    expect(styleSource).toContain('.xy-floating-field label.xy-border-embedded-transparent-backplate,');
    expect(styleSource).toContain('.xy-floating-field label.xy-border-embedded-transparent-backplate {\n  position: absolute;');
    expect(styleSource).toContain('.xy-floating-field .xy-floating-outline-chapter-meta {\n  pointer-events: none;');
  });

  it('keeps plot point preview actions at the bottom without the preview title or status copy', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const plotPointStandaloneStart = panelSource.indexOf('if (plotPointStandalone) {');
    const centerPanelStart = panelSource.indexOf('<section className="min-w-0 flex min-h-0 flex-col bg-white">', plotPointStandaloneStart);
    const centerPanelEnd = panelSource.indexOf('{plotPointRightResizeHandle}', centerPanelStart);
    const centerPanelSource = panelSource.slice(centerPanelStart, centerPanelEnd);
    const candidateListIndex = centerPanelSource.indexOf('plotPointVisibleCandidates.length === 0');
    const actionRowIndex = centerPanelSource.indexOf('<div className="flex h-14 shrink-0 items-center justify-end gap-2 border-t border-slate-100 px-4">');

    expect(plotPointStandaloneStart).toBeGreaterThan(-1);
    expect(centerPanelStart).toBeGreaterThan(-1);
    expect(centerPanelEnd).toBeGreaterThan(centerPanelStart);
    expect(candidateListIndex).toBeGreaterThan(-1);
    expect(actionRowIndex).toBeGreaterThan(candidateListIndex);
    expect(centerPanelSource).not.toContain('<h2 className="text-sm font-black text-slate-950">剧情点预览</h2>');
    expect(centerPanelSource).not.toContain('等待手动刷新衔接剧情');
    expect(centerPanelSource).toContain('清空');
    expect(centerPanelSource).toContain('重新生成');
    expect(centerPanelSource).toContain('继续生成');
  });

  it('renders the selected plot point delete action as a bordered warning button', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const selectedListStart = panelSource.indexOf('visiblePlotPointSelectedItems.map((item) => {');
    const deleteButtonAnchor = panelSource.indexOf('删除', selectedListStart);
    const removeButtonStart = panelSource.lastIndexOf('<button', deleteButtonAnchor);
    const removeButtonEnd = panelSource.indexOf('</button>', deleteButtonAnchor);
    const removeButtonSource = panelSource.slice(removeButtonStart, removeButtonEnd);

    expect(selectedListStart).toBeGreaterThan(-1);
    expect(deleteButtonAnchor).toBeGreaterThan(selectedListStart);
    expect(removeButtonStart).toBeGreaterThan(selectedListStart);
    expect(removeButtonEnd).toBeGreaterThan(removeButtonStart);
    expect(removeButtonSource).toContain('border border-red-200');
    expect(removeButtonSource).toContain('bg-red-50');
    expect(removeButtonSource).toContain('shadow-sm');
    expect(removeButtonSource).not.toContain('className="shrink-0 text-xs font-black text-red-500"');
    expect(removeButtonSource).toContain('togglePlotPointCandidate(item.id)');
    expect(removeButtonSource).not.toContain('openDetailOutlineFromPlotPoint');
  });

  it('renders plot chain slots with the same collapsible tree structure as the chapter sidebar', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const plotPointStandaloneStart = panelSource.indexOf('if (plotPointStandalone) {');
    const gridTemplateStart = panelSource.indexOf('gridTemplateColumns: `${plotPointLayoutTreeWidth}', plotPointStandaloneStart);
    const navStart = panelSource.indexOf('<nav className="editor-scrollbar min-h-0 flex-1 overflow-y-auto" aria-label="剧情链目录树">');
    const navEnd = panelSource.indexOf('</nav>', navStart);
    const navSource = panelSource.slice(navStart, navEnd);

    expect(gridTemplateStart).toBeGreaterThan(-1);
    expect(panelSource.slice(gridTemplateStart, gridTemplateStart + 240)).toContain('${plotPointLayoutTreeWidth}px 0px ${plotPointLayoutLeftWidth}px 0px');
    expect(navStart).toBeGreaterThan(-1);
    expect(navEnd).toBeGreaterThan(navStart);
    expect(panelSource).toContain('const [plotPointLayoutTreeWidth, setPlotPointLayoutTreeWidth] = useState(() => readPlotPointLayoutTreeWidth(storageKey));');
    expect(panelSource).toContain('const plotPointTreeResizeHandle = (');
    expect(panelSource).toContain('onPointerDown={startPlotPointTreeWidthResize}');
    expect(panelSource).toContain('title="拖拽调整剧情链目录宽度"');
    expect(panelSource).toContain('{plotPointTreeResizeHandle}');
    expect(panelSource).toContain('const [plotPointChainNames, setPlotPointChainNames] = useState<Record<PlotPointChainSlot, string>>(() => (');
    expect(panelSource).toContain('normalizePlotPointChainNames(activeTabConfig.plotPointChainNames)');
    expect(panelSource).not.toContain('aria-label="剧情链名称"');
    expect(panelSource).not.toContain('value={currentPlotPointChainName}');
    expect(panelSource).not.toContain('onChange={(event) => renamePlotPointChain(event.target.value)}');
    expect(panelSource).toContain('const [expandedPlotPointChainTreeSlots, setExpandedPlotPointChainTreeSlots] = useState<Record<PlotPointChainSlot, boolean>>({');
    expect(panelSource).not.toContain('<h2 className="whitespace-nowrap text-sm font-bold text-gray-900">剧情链</h2>');
    expect(panelSource).toContain('<aside className="min-w-0 flex min-h-0 flex-col border-r border-slate-100 bg-white px-1 py-2">');
    expect(navSource).toContain('aria-label="当前主链未写序号导航"');
    expect(navSource).toContain('onContextMenu={(event) => {');
    expect(navSource).toContain('setPlotPointChainMenuSlot(plotPointActiveChainSlot)');
    expect(navSource).toContain('setPlotPointChainRenameDraft(plotPointChainNames[plotPointActiveChainSlot] ?? `剧情链${plotPointActiveChainSlot}`)');
    expect(navSource).toContain('aria-label="当前主链菜单"');
    expect(navSource).toContain('renamePlotPointChain(plotPointActiveChainSlot, plotPointChainRenameDraft)');
    expect(navSource).toContain('const originalIndex = plotPointSelectedItems.findIndex((selectedItem) => selectedItem.id === item.id);');
    expect(navSource).toContain('plotPointUnwrittenItems.map((item) => {');
    expect(navSource).toContain('aria-label={`跳转未写剧情点${originalIndex + 1} ${item.title}`}');
    expect(navSource).toContain("setPlotPointChainFilterMode('all')");
    expect(navSource).toContain('setActivePlotPointChainItemId(item.id)');
    expect(navSource).toContain('暂无未写剧情点');
    expect(navSource).toContain('style={{ gridTemplateColumns: \'repeat(auto-fit, minmax(36px, max-content))\' }}');
    expect(navSource).toContain('<span className="min-w-0 flex-1 truncate text-sm font-bold text-white">备选链</span>');
    expect(navSource).toContain('{PLOT_POINT_CHAIN_SLOTS.length - 1}条');
    expect(navSource).toContain('PLOT_POINT_CHAIN_SLOTS.filter((slot) => slot !== plotPointActiveChainSlot).map((slot) => (');
    expect(navSource).toContain('onClick={() => setActivePlotPointChainSlot(slot)}');
    expect(navSource).toContain('aria-expanded={expandedPlotPointChainTreeSlots[plotPointActiveChainSlot] ?? true}');
    expect(navSource).toContain('expandedPlotPointChainTreeSlots[plotPointActiveChainSlot] ?? true');
    expect(navSource).not.toContain('{PLOT_POINT_CHAIN_SLOTS.length}条');
    expect(navSource).toContain('主链');
    expect(navSource).not.toContain('{plotPointChainNames[plotPointActiveChainSlot] ?? `剧情链${plotPointActiveChainSlot}`}');
    expect(navSource).toContain('{plotPointUnwrittenItems.length}未写');
    expect(navSource).toContain('className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-[#08AACE] bg-[#08AACE] px-3 py-1.5 text-left text-sm font-bold leading-5 text-white transition-colors hover:brightness-95"');
    expect(navSource).toContain('<summary className="xy-plot-chain-summary flex cursor-pointer items-center gap-2 rounded-lg border border-[#08AACE] bg-[#08AACE] px-3 py-1.5 text-sm font-bold leading-5 text-white transition-colors hover:brightness-95">');
    expect(navSource).toContain('<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/15 text-white">');
    expect(navSource).toContain('<span className="min-w-0 flex-1 truncate text-sm font-bold text-white">{plotPointChainNames[slot] ?? `剧情链${slot}`}</span>');
    expect(navSource).toContain('<span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">{(plotPointChainSelections[slot] ?? []).length}点</span>');
    expect(navSource).toContain('xy-plot-chain-summary');
    expect(navSource).toContain('className="mt-1 grid justify-start gap-2 px-1.5 py-1.5"');
    expect(navSource).toContain('className="mt-1 grid gap-2 px-1.5 py-1.5"');
    expect(navSource).toContain('relative h-9 min-w-9 rounded-lg border px-2 text-sm font-black transition-colors');
    expect(navSource).toContain('activePoint');
    expect(navSource).toContain("'border-[#08B3D9] bg-[#EAF9FD] text-[#078fb0]'");
    expect(navSource).toContain('title={`未写剧情点${originalIndex + 1} ${item.title}`}');
    expect(navSource).toContain('{originalIndex + 1}');
    expect(navSource).not.toContain('className="ml-1 mt-0.5 space-y-0.5"');
    expect(navSource).not.toContain("activePoint ? 'text-orange-600' : 'text-gray-700'");
    expect(navSource).not.toContain('剧情点{originalIndex + 1}');
    expect(navSource).not.toContain('border-transparent hover:bg-gray-50');
    expect(navSource).not.toContain("ring-2 ring-[#bdeef7]");
    expect(navSource).not.toContain('border-orange-400 bg-orange-50 text-orange-600 ring-2 ring-orange-100');
    expect(navSource).not.toContain("border-[#08AACE] bg-[#08AACE] text-white");
    expect(navSource).not.toContain("border-[#bdeef7] bg-white text-[#078fb0] hover:border-[#08AACE] hover:bg-[#F7FCFE]");
    expect(navSource).not.toContain('text-orange-500');
    expect(navSource).not.toContain('剧情点{index + 1}');
    expect(navSource).not.toContain('PLOT_POINT_CHAIN_SLOTS.map((slot) => {');
    expect(panelSource).not.toContain('aria-label="剧情链导航"');
    expect(panelSource).not.toContain('mb-3 flex min-w-0 gap-2 overflow-x-auto');
    expect(panelSource).not.toContain('<h2 className="text-sm font-black text-slate-950">剧情链{plotPointActiveChainSlot}</h2>');
    expect(panelSource).toContain('选中的剧情点会加入当前剧情链。');
    expect(panelSource).not.toContain('选中的剧情点会加入当前数字剧情链。');
  });

  it('renders selected plot point cards as a full-content timeline preview area', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const plotChainSource = await readWorkbenchPlotChainSource();
    const selectedListStart = panelSource.indexOf('relative space-y-4 pl-6 before:absolute');
    const selectedListEnd = panelSource.indexOf('{plotPointLeftResizeHandle}', selectedListStart);
    const selectedListSource = panelSource.slice(selectedListStart, selectedListEnd);

    expect(selectedListStart).toBeGreaterThan(-1);
    expect(selectedListEnd).toBeGreaterThan(selectedListStart);
    expect(panelSource).toContain("const [plotPointChainFilterMode, setPlotPointChainFilterMode] = useState<'all' | 'unwritten' | 'written'>('all');");
    expect(panelSource).toContain('const plotPointWrittenIds = plotPointChainWrittenSelections[plotPointActiveChainSlot] ?? [];');
    expect(panelSource).toContain('const plotPointUnwrittenItems = plotPointSelectedItems.filter((item) => !plotPointWrittenIdSet.has(item.id));');
    expect(panelSource).toContain("if (plotPointChainFilterMode === 'written') return written;");
    expect(panelSource).toContain("if (plotPointChainFilterMode === 'unwritten') return !written;");
    expect(panelSource).toContain('markPlotPointChainItemWritten(item.id)');
    expect(panelSource).toContain('movePlotPointChainItemToUnwritten(item.id)');
    expect(panelSource).toContain("['all', '全部']");
    expect(panelSource).toContain("['unwritten', '只看未写']");
    expect(panelSource).toContain("['written', '只看已写']");
    expect(panelSource).toContain('className="flex flex-wrap items-center gap-2"');
    expect(panelSource).toContain('h-10 w-20 whitespace-nowrap rounded-2xl border px-2');
    expect(panelSource).toContain('h-10 w-20 whitespace-nowrap rounded-2xl bg-[#08AACE]');
    expect(panelSource).not.toContain('grid-cols-[repeat(auto-fit,minmax(128px,1fr))]');
    expect(panelSource).toContain('onClick={openDetailOutlineFromPlotPoint}');
    expect(panelSource).not.toContain("['hideWritten', '已写隐藏']");
    expect(selectedListSource).toContain('visiblePlotPointSelectedItems.map((item) => {');
    expect(selectedListSource).toContain('const written = plotPointWrittenIdSet.has(item.id);');
    expect(selectedListSource).toContain("written ? '移回未写' : '标为已写'");
    expect(selectedListSource).toContain('删除');
    expect(selectedListSource).not.toContain('生成章纲');
    expect(panelSource).toContain('当前过滤条件下没有剧情点');
    expect(selectedListSource).toContain("['内容', metrics.clarity]");
    expect(selectedListSource).toContain("['潜力', metrics.potential]");
    expect(selectedListSource).toContain("['衔接', metrics.fit]");
    expect(selectedListSource).toContain('const reviewExpanded = expandedPlotPointPreviewIds.includes(`chain-review:${item.id}`);');
    expect(selectedListSource).not.toContain('时间线预览 · 剧情点');
    expect(selectedListSource).not.toContain('item.title || `剧情点 ${index + 1}`');
    expect(selectedListSource).not.toContain('className="flex items-start justify-end gap-3"');
    expect(selectedListSource).toContain('className="mt-3 flex items-center justify-between gap-3"');
    expect(selectedListSource).toContain('className="flex shrink-0 flex-wrap items-center justify-end gap-2"');
    expect(selectedListSource).toContain('relative space-y-4 pl-6 before:absolute');
    expect(selectedListSource).toContain('editor-scrollbar mt-1 max-h-64 overflow-y-auto rounded-2xl border border-[#BDEEF7] bg-[#F1FBFE]');
    expect(selectedListSource).not.toContain('editor-scrollbar mt-3 max-h-64 overflow-y-auto rounded-2xl border border-[#BDEEF7] bg-[#F1FBFE]');
    expect(selectedListSource).toContain('{displayText}');
    expect(selectedListSource).not.toContain('aria-hidden="true"');
    expect(selectedListSource).not.toContain('>剧情点 {index + 1}</span>');
    expect(selectedListSource).not.toContain('line-clamp-6 text-sm font-bold leading-6 text-slate-700');
    expect(selectedListSource).toContain('mt-3 grid grid-cols-3 gap-2');
    expect(panelSource).toContain("from '@/features/workbench/model/workbenchPlotChain'");
    expect(plotChainSource).toContain('function getWorkbenchPlotPointMetricClass(score: number)');
    expect(plotChainSource).toContain("if (score >= 90) return 'border-amber-200 bg-amber-50 text-amber-700';");
    expect(plotChainSource).toContain("if (score >= 80) return 'border-purple-200 bg-purple-50 text-purple-700';");
    expect(plotChainSource).toContain("if (score >= 70) return 'border-sky-200 bg-sky-50 text-sky-700';");
    expect(plotChainSource).toContain("return 'border-emerald-200 bg-emerald-50 text-emerald-700';");
    expect(selectedListSource).toContain('${getWorkbenchPlotPointMetricClass(value)}');
    expect(selectedListSource).toContain('onClick={() => togglePlotPointPreviewExpanded(`chain-review:${item.id}`)}');
    expect(selectedListSource.indexOf('mt-3 grid grid-cols-3 gap-2')).toBeLessThan(
      selectedListSource.indexOf('onClick={() => togglePlotPointPreviewExpanded(`chain-review:${item.id}`)}'),
    );
    expect(selectedListSource.indexOf('onClick={() => togglePlotPointPreviewExpanded(`chain-review:${item.id}`)}')).toBeLessThan(
      selectedListSource.indexOf('onClick={() => (written ? movePlotPointChainItemToUnwritten(item.id) : markPlotPointChainItemWritten(item.id))}'),
    );
    expect(selectedListSource).toContain("{reviewExpanded ? '收起AI评价' : 'AI评价'}");
    expect(selectedListSource).toContain('{reviewExpanded && (');
    expect(selectedListSource).toContain('getWorkbenchPlotPointReview(item, isPlotPointFollowupStage)');
    expect(selectedListSource).not.toContain('w-[104px] shrink-0 space-y-1.5');
    expect(selectedListSource).not.toContain('flex h-8 items-center justify-between rounded-xl bg-white px-3 shadow-sm');
    expect(selectedListSource).toContain('flex h-8 items-center justify-between rounded-xl border px-3 shadow-sm');
    expect(selectedListSource).toContain('text-xs font-black opacity-80');
    expect(selectedListSource).toContain('text-sm font-black');
    expect(selectedListSource).not.toContain('text-center shadow-sm');
    expect(selectedListSource).not.toContain('潜力 {metrics.potential}');
    expect(panelSource).toContain('title="拖拽调整剧情链左侧宽度"');
    expect(panelSource).toContain('w-3 -translate-x-1/2 shrink-0 cursor-ew-resize');
    expect(panelSource).toContain('h-full w-px bg-[#08AACE] opacity-0 transition-opacity group-hover:opacity-100');
    expect(selectedListSource).not.toContain('transition-colors hover:bg-[#EAF9FD]');
  });

  it('hides raw reasoning text in the plot chain right output so it matches final candidates', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const renderFunctionStart = panelSource.indexOf('function renderAiChatContent(content: string, options: { hideReasoningBody?: boolean } = {})');
    const renderFunctionEnd = panelSource.indexOf('function getLatestUsefulAiText', renderFunctionStart);
    const renderFunctionSource = panelSource.slice(renderFunctionStart, renderFunctionEnd);

    expect(renderFunctionStart).toBeGreaterThan(-1);
    expect(renderFunctionEnd).toBeGreaterThan(renderFunctionStart);
    expect(renderFunctionSource).toContain('options.hideReasoningBody ?');
    expect(renderFunctionSource).toContain('<span>{thinkingLabel}</span>');
    expect(renderFunctionSource).toContain('{reasoning && (');
    expect(panelSource).toContain('renderAiChatContent(outlinePreviewDraft, { hideReasoningBody: plotPointStandalone })');
  });

  it('uses the requested default tab even when the shared storage remembered another setting tab', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain('defaultActiveTab');
    expect(panelSource).toContain("const tabsSignature = tabs.map(normalizeTabName).join('\\u001f');");
    expect(panelSource).toContain("const normalizedTabs = useMemo(() => (tabsSignature ? tabsSignature.split('\\u001f') : []), [tabsSignature]);");
    expect(panelSource).not.toContain('const normalizedTabs = useMemo(() => tabs.map(normalizeTabName), [tabs]);');
    expect(panelSource).toContain('readActiveTab(storageKey, normalizedTabs, defaultActiveTab)');
    expect(panelSource).toContain('这里显示选中的脑洞内容，也可以直接编辑。');
  });

  it('uses the selected danger recycle button style for the brainstorm recycle entry', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const recycleButtonAnchor = panelSource.indexOf('setIsBrainstormRecycleOpen(true)');
    const recycleButtonStart = panelSource.lastIndexOf('<button', recycleButtonAnchor);
    const recycleButtonEnd = panelSource.indexOf('</button>', recycleButtonAnchor);
    const recycleButtonSource = panelSource.slice(recycleButtonStart, recycleButtonEnd);

    expect(recycleButtonAnchor).toBeGreaterThan(-1);
    expect(recycleButtonStart).toBeGreaterThan(-1);
    expect(recycleButtonEnd).toBeGreaterThan(recycleButtonStart);
    expect(recycleButtonSource).toContain('border border-red-100 bg-red-50');
    expect(recycleButtonSource).toContain('hover:border-red-200 hover:bg-red-100');
    expect(recycleButtonSource).toContain('<Trash2 className="h-4 w-4" />');
    expect(recycleButtonSource).toContain('bg-white text-red-500');
    expect(recycleButtonSource).toContain('{brainstormRecycleEntries.length}');
    expect(recycleButtonSource).not.toContain('打开');
    expect(recycleButtonSource).not.toContain('个已删除脑洞');
  });

  it('uses the chapter-style black text selected state for brainstorm entries', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const entryListStart = panelSource.indexOf('previewEntries.map((entry, previewIndex) => {');
    const entryListEnd = panelSource.indexOf('{!activeIsBrainstorm && (', entryListStart);
    const entryListSource = panelSource.slice(entryListStart, entryListEnd);

    expect(entryListStart).toBeGreaterThan(-1);
    expect(entryListEnd).toBeGreaterThan(entryListStart);
    expect(entryListSource).toContain("activeIsBrainstorm\n                                  ? 'border-transparent xy-selected-mint-bg text-gray-900'");
    expect(entryListSource).toContain("activeIsBrainstorm\n                                  ? 'border-transparent bg-white text-gray-700 hover:border-gray-200 hover:bg-gray-50'");
    expect(entryListSource).toContain('className="min-w-0 truncate text-sm font-black text-gray-700"');
    expect(entryListSource).toContain("activeIsBrainstorm ? 'text-xs font-black text-gray-400'");
    expect(entryListSource).not.toContain('text-orange-500');
  });

  it('removes the brainstorm recycle button scheme test page from the test collection', async () => {
    const testCollectionSource = await readTestCollectionSource();

    expect(testCollectionSource).not.toContain('BrainstormRecycleButtonTestPage');
    expect(testCollectionSource).not.toContain('/brainstorm-recycle-button-test');
    expect(testCollectionSource).not.toContain('脑洞回收站按钮方案');
  });

  it('removes the plot chain tree design scheme test page after applying scheme A', async () => {
    const testCollectionSource = await readTestCollectionSource();

    expect(testCollectionSource).not.toContain('剧情链目录分组方案');
    expect(testCollectionSource).not.toContain('/plot-chain-tree-design-test');
    expect(testCollectionSource).not.toContain('PlotChainTreeDesignTestPage');
    expect(testCollectionSource).not.toContain('PlotChainTreeDesignA');
    expect(testCollectionSource).not.toContain('方案 A：目录树层级');
    expect(testCollectionSource).not.toContain('方案 D：紧凑深浅对比');
  });

  it('removes the plot chain left detail scheme test page after applying scheme E to the workbench', async () => {
    const testCollectionSource = await readTestCollectionSource();
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(testCollectionSource).not.toContain('PlotChainLeftDetailTestPage');
    expect(testCollectionSource).not.toContain('/plot-chain-left-detail-test');
    expect(testCollectionSource).not.toContain('剧情链左二调试方案');
    expect(panelSource).toContain('aria-label="当前主链未写序号导航"');
    expect(panelSource).toContain('aria-label="当前主链菜单"');
    expect(panelSource).toContain('<span className="min-w-0 flex-1 truncate text-sm font-bold text-white">备选链</span>');
    expect(panelSource).toContain('{PLOT_POINT_CHAIN_SLOTS.length - 1}条');
    expect(panelSource).toContain('plotPointChainWrittenSelections');
    expect(panelSource).toContain('markPlotPointChainItemWritten(item.id)');
    expect(panelSource).toContain("['written', '只看已写']");
  });

  it('keeps detail outline reader plot chain plumbing out of the visible tabs', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain("type DetailOutlineReaderTab = 'settings' | 'roles' | 'outlines' | 'plotChain';");
    expect(panelSource).toContain('detailOutlineReaderPlotChainIds?: string[];');
    expect(panelSource).toContain('const [draftDetailOutlineReaderPlotChainIds, setDraftDetailOutlineReaderPlotChainIds]');
    expect(panelSource).toContain('const detailOutlineReaderPlotChainItems = (plotPointChainSelections[plotPointActiveChainSlot] ?? [])');
    expect(panelSource).not.toContain("['plotChain', '剧情链']");
    expect(panelSource).toContain("detailOutlineReaderTab === 'plotChain'");
    expect(panelSource).toContain('toggleDraftDetailOutlineReaderPlotChain(item.id)');
    expect(panelSource).toContain('detailOutlineReaderPlotChainIds: nextPlotChainIds');
    expect(panelSource).toContain("wrapAiRequestTag('关联资料', innerContext)");
    expect(panelSource).toContain("wrapAiRequestTag('设定资料', settingText)");
    expect(panelSource).toContain("wrapAiRequestTag('角色资料', roleText)");
    expect(panelSource).toContain("wrapAiRequestTag('剧情链', plotChainText)");
    expect(panelSource).toContain("const DETAIL_OUTLINE_STATE_MARKER = '【本章状态变化预期】';");
    expect(panelSource).toContain('splitDetailOutlineStateExpectation(outlineCardContent)');
    expect(panelSource).toContain('mergeDetailOutlineStateExpectation(');
    expect(panelSource).toContain('请根据关联的设定、前文章纲和剧情链生成章纲。请在章纲末尾输出${DETAIL_OUTLINE_STATE_MARKER}');
    expect(panelSource).toContain('<span className="xy-floating-title-text xy-detail-outline-heading-title">状态变化</span>');
  });

  it('uses compact detail outline chapter number blocks without word count badges', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(panelSource).toContain("const outlineWordCount = countTextWords(entry?.content ?? '');");
    expect(panelSource).toContain("const chapterContentWordCount = countTextWords(getChapterContent?.(chapter.id) ?? '');");
    expect(panelSource).toContain("const outlineButtonContentStateClass = chapterContentWordCount > 0");
    expect(panelSource).toContain("? 'xy-detail-outline-number-used'");
    expect(panelSource).toContain("? 'xy-detail-outline-number-has-outline'");
    expect(panelSource).toContain(": 'xy-detail-outline-number-no-outline';");
    expect(panelSource).toContain("const outlineButtonSelectedClass = selected ? 'xy-detail-outline-number-selected' : '';");
    expect(panelSource).toContain('${outlineButtonContentStateClass} ${outlineButtonSelectedClass}');
    expect(panelSource).not.toContain("const outlineButtonStateClass = selected");
    expect(panelSource).not.toContain("const outlineWordLabel = outlineWordCount > 0 ? `${outlineWordCount}字` : '无章纲';");
    expect(panelSource).toContain("gridTemplateColumns: 'repeat(auto-fit, minmax(32px, max-content))'");
    expect(panelSource).toContain("relative grid h-8 w-8 place-items-center rounded-lg border text-center text-sm font-black leading-none transition-colors xy-detail-outline-number-block");
    expect(panelSource).not.toContain("relative grid h-[50px] w-[50px] place-items-center rounded-[13px] border text-center text-2xl font-black leading-none transition-colors");
    expect(panelSource).not.toContain("'border-[#8CEBC0] bg-[#EAFBF3] text-slate-950 shadow-[0_0_0_1px_rgba(16,185,129,0.16)]'");
    expect(panelSource).not.toContain(": 'border-[#FED7AA] bg-[#FFF7ED] text-slate-950 shadow-[0_0_0_1px_rgba(249,115,22,0.12)]'");
    expect(panelSource).not.toContain("'border-slate-200 bg-white text-slate-900 hover:border-[#BBF7D0] hover:bg-[#F2FCF7]'");
    expect(panelSource).not.toContain(": 'border-slate-200 bg-white text-slate-400 hover:border-orange-200 hover:bg-orange-50/50'");
    expect(panelSource).not.toContain('outlineBadgeClass');
    expect(panelSource).not.toContain("label: '有章纲'");
    const selectedStyle = styleSource.match(/\.xy-detail-outline-number-selected \{[\s\S]*?\n\}/)?.[0] ?? '';
    expect(selectedStyle).toContain('border-color: var(--xy-detail-outline-number-selected);');
    expect(selectedStyle).toContain('box-shadow:');
    expect(selectedStyle).not.toContain('background:');
    expect(styleSource.indexOf('.xy-detail-outline-number-selected')).toBeGreaterThan(styleSource.indexOf('.xy-detail-outline-number-no-outline'));
  });

  it('adds a detail outline published lane that follows published chapters and manual moves', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain("const DETAIL_OUTLINE_PUBLISHED_GROUP_NAME = 'detail_outline_published_chapters';");
    expect(panelSource).toContain("const [showDetailOutlinePublished, setShowDetailOutlinePublished] = useState(false);");
    expect(panelSource).toContain("const [manualDetailOutlinePublishedChapterIds, setManualDetailOutlinePublishedChapterIds]");
    expect(panelSource).toContain("const isDetailOutlineChapterPublished = (chapter: Chapter) => Boolean(chapter.isPublished) || manualDetailOutlinePublishedChapterIds.has(chapter.id);");
    expect(panelSource).toContain("const detailOutlineUnpublishedVolumes = filterDetailOutlineVolumesByPublishState(false);");
    expect(panelSource).toContain("const detailOutlinePublishedVolumes = filterDetailOutlineVolumesByPublishState(true);");
    expect(panelSource).toContain("const moveDetailOutlineChapterToPublished = (chapterId: number) => {");
    expect(panelSource).toContain("const moveDetailOutlineChapterToUnpublished = (chapter: Chapter) => {");
    expect(panelSource).toContain("if (chapter.isPublished) return;");
    expect(panelSource).toContain("showDetailOutlinePublished ? '收回已发布' : '展开已发布'");
    expect(panelSource).toContain('>已发布</span>');
    expect(panelSource).not.toContain('章纲已发布');
    expect(panelSource).toContain('暂无已发布章纲');
    expect(panelSource).toContain('移动到已发布');
    expect(panelSource).toContain('移回未发布');
  });

  it('keeps published detail outline volume groups synced even when no outline chapters are published', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain('renderDetailOutlineVolumeTree(detailOutlinePublishedVolumes, true)');
    expect(panelSource).toContain('detailOutlinePublishedVolumes = filterDetailOutlineVolumesByPublishState(true);');
    expect(panelSource).not.toContain('detailOutlinePublishedCount === 0 ? (');
    expect(panelSource).toContain('volumes.length === 0 ? (');
  });

  it('removes the detail outline selection scheme test page after applying it to the workbench', async () => {
    const testCollectionSource = await readTestCollectionSource();

    expect(testCollectionSource).not.toContain('WorkbenchDetailOutlineSelectionStyleTestPage');
    expect(testCollectionSource).not.toContain('/workbench-detail-outline-selection-style-test');
    expect(testCollectionSource).not.toContain('Outline State');
    expect(testCollectionSource).not.toContain('章纲选中态方案测试');
  });

  it('removes the completed border transparent backplate placement test page', async () => {
    const testCollectionSource = await readTestCollectionSource();

    expect(testCollectionSource).not.toContain('BorderBackplateApplicationTestPage');
    expect(testCollectionSource).not.toContain('/border-backplate-application-test');
    expect(testCollectionSource).not.toContain('边框透明背板应用预览');
  });

  it('adds a test preview for three-level setting smart import and group rename behavior', async () => {
    const testCollectionSource = await readTestCollectionSource();
    const hierarchyTestSource = await readSettingImportHierarchyTestSource();

    expect(testCollectionSource).toContain('SettingImportHierarchyTestPage');
    expect(testCollectionSource).toContain('/setting-import-hierarchy-test');
    expect(testCollectionSource).toContain('设定三层智能导入测试');
    expect(testCollectionSource).toContain('AI 链路测试');
    expect(hierarchyTestSource).toContain('智能导入三层结构测试');
    expect(hierarchyTestSource).toContain('上一级标签');
    expect(hierarchyTestSource).toContain('设定条目');
    expect(hierarchyTestSource).toContain('子设定');
    expect(hierarchyTestSource).toContain('已有则填入，没有则创建');
    expect(hierarchyTestSource).toContain('右键分组菜单');
    expect(hierarchyTestSource).toContain('重命名');
  });

  it('hides inline field size control when the workbench header owns the entry and opens from external signal', () => {
    const { rerender } = render(
      <WorkbenchLibraryPanel
        storageKey="workbench-library-panel-test"
        outlineStorageKey="workbench-library-panel-outline-test"
        tabs={['澶х翰', '瑙掕壊', '鑴戞礊']}
        emptyText="鏆傛棤鍐呭"
        defaultActiveTab="鑴戞礊"
        showInlineFieldSizeButton={false}
        fieldSizeOpenSignal={0}
      />,
    );

    expect(screen.queryByRole('button', { name: /设置/ })).not.toBeInTheDocument();

    rerender(
      <WorkbenchLibraryPanel
        storageKey="workbench-library-panel-test"
        outlineStorageKey="workbench-library-panel-outline-test"
        tabs={['澶х翰', '瑙掕壊', '鑴戞礊']}
        emptyText="鏆傛棤鍐呭"
        defaultActiveTab="鑴戞礊"
        showInlineFieldSizeButton={false}
        fieldSizeOpenSignal={1}
      />,
    );

    expect(screen.getByRole('heading', { name: /设置/ })).toBeInTheDocument();
  });
  it('renders clear settings in the category context menu with double confirmation', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain("type ClearSettingsTarget = 'settingCategories' | 'settingEntries' | 'roleCategories' | 'roleEntries';");
    expect(panelSource).toContain("const [clearSettingsConfirmStep, setClearSettingsConfirmStep] = useState<1 | 2>(1);");
    expect(panelSource).toContain("const openClearSettingsConfirm = (target: ClearSettingsTarget) => {");
    expect(panelSource).toContain('const openClearSettingsConfirmFromMenu = (target: ClearSettingsTarget) => {');
    expect(panelSource).toContain("if (clearSettingsConfirmStep === 1) {");
    expect(panelSource).toContain('setClearSettingsConfirmStep(2);');
    expect(panelSource).toContain('clearSettingsTargetMeta[clearSettingsConfirmTarget]');
    expect(panelSource).toContain('clearSettingCategories();');
    expect(panelSource).toContain('clearSettingEntries();');
    expect(panelSource).toContain('aria-disabled="true"');
    expect(panelSource).toContain("settingCreateDialog === 'category' ? '新建分组'");
    expect(panelSource).toContain("settingCreateDialog === 'category' ? '输入分组名字'");
    expect(panelSource).toContain('清空{clearSettingsTargetMeta[categoryMenuClearEntryTarget].label}');
    expect(panelSource).toContain('清空{clearSettingsTargetMeta[categoryMenuClearCategoryTarget].label}');
    expect(panelSource).toContain("label: `${settingClearItemLabel}分组`");
    expect(panelSource).toContain("roleEntries: {\n      label: '角色'");
    expect(panelSource).toContain("roleCategories: {\n      label: '角色分组'");
    expect(panelSource).toContain("const SETTING_CLEAR_DOMAIN_LABELS: Record<string, string> = {");
    expect(panelSource).toContain("'setting:faction': '势力'");
    expect(panelSource).toContain("'setting:item': '道具资源'");
    expect(panelSource).toContain('确定要清空全部角色吗？');
    expect(panelSource).toContain('确认清空${currentClearSettingsMeta.label}');
    expect(panelSource).toContain('onClick={() => openClearSettingsConfirmFromMenu(categoryMenuClearCategoryTarget)}');
    expect(panelSource).toContain('onClick={() => openClearSettingsConfirmFromMenu(categoryMenuClearEntryTarget)}');
    expect(panelSource).toContain('mt-3 shrink-0 space-y-2');
    expect(panelSource).toContain('grid h-11 grid-cols-3 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)]');
    expect(panelSource).not.toContain('aria-label="清空分组"');
    expect(panelSource).not.toContain('border-r border-red-100 bg-red-50 px-2 text-sm font-black text-red-500');
    expect(panelSource).not.toContain('isActiveClearSettingsUnlocked');
    expect(panelSource).not.toContain('setClearSettingsUnlockMenu({');
    expect(panelSource).not.toContain('clearSettingsUnlockContextMenu');
    expect(panelSource).not.toContain('h-9 w-full rounded-xl border border-red-200');
  });

  it('removes entries when their setting or character group is removed', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const clearSettingCategoriesStart = panelSource.indexOf('const clearSettingCategories = () => {');
    const clearSettingCategoriesEnd = panelSource.indexOf('const clearSettingEntries = () => {', clearSettingCategoriesStart);
    const clearSettingEntriesStart = panelSource.indexOf('const clearSettingEntries = () => {');
    const clearSettingEntriesEnd = panelSource.indexOf('const clearRoleCategories = () => {', clearSettingEntriesStart);
    const clearRoleCategoriesStart = panelSource.indexOf('const clearRoleCategories = () => {');
    const clearRoleCategoriesEnd = panelSource.indexOf('const clearRoleEntries = () => {', clearRoleCategoriesStart);
    const deleteRoleTypeStart = panelSource.indexOf('const deleteRoleType = (type: string) => {');
    const deleteRoleTypeEnd = panelSource.indexOf('const deleteSettingType = (type: string) => {', deleteRoleTypeStart);
    const deleteSettingTypeStart = panelSource.indexOf('const deleteSettingType = (type: string) => {');
    const deleteSettingTypeEnd = panelSource.indexOf('const deleteCategoryFromMenu = () => {', deleteSettingTypeStart);
    const clearSettingCategoriesSource = panelSource.slice(clearSettingCategoriesStart, clearSettingCategoriesEnd);
    const clearSettingEntriesSource = panelSource.slice(clearSettingEntriesStart, clearSettingEntriesEnd);
    const clearRoleCategoriesSource = panelSource.slice(clearRoleCategoriesStart, clearRoleCategoriesEnd);
    const deleteRoleTypeSource = panelSource.slice(deleteRoleTypeStart, deleteRoleTypeEnd);
    const deleteSettingTypeSource = panelSource.slice(deleteSettingTypeStart, deleteSettingTypeEnd);

    expect(clearSettingCategoriesSource).toContain('const domain = getSelectedSettingWorkspaceDomain();');
    expect(clearSettingCategoriesSource).toContain('if (entry.tab !== SETTING_TAB) return true;');
    expect(clearSettingCategoriesSource).toContain('if (isLockedDefaultSettingEntry(entry)) return true;');
    expect(clearSettingCategoriesSource).toContain('return !isSettingTypeInActiveClearDomain(parseSettingContent(entry.content).type);');
    expect(clearSettingCategoriesSource).toContain('const nextCustomTypes = customSettingTypes.filter((type) => !shouldClearType(type));');
    expect(clearSettingEntriesSource).toContain('return !isSettingTypeInActiveClearDomain(parseSettingContent(entry.content).type);');
    expect(clearSettingCategoriesSource).not.toContain('content: stringifySettingContent({ ...setting, type: UNCATEGORIZED_TYPE })');
    expect(clearRoleCategoriesSource).toContain('persist(entries.filter((entry) => entry.tab !== ROLE_TAB || isMaleProtagonistRoleType(parseRoleContent(entry.content).type)));');
    expect(clearRoleCategoriesSource).toContain("setExpandedRoleTypes(new Set([DEFAULT_MALE_PROTAGONIST_ROLE_TYPE]));");
    expect(clearRoleCategoriesSource).not.toContain('content: stringifyRoleContent({ ...role, type: UNCATEGORIZED_TYPE })');
    expect(deleteSettingTypeSource).toContain('persist(entries.filter((entry) => {');
    expect(deleteSettingTypeSource).toContain('return setting.type !== type;');
    expect(deleteSettingTypeSource).toContain('if (DEFAULT_SETTING_TYPES.includes(type)) return;');
    expect(deleteSettingTypeSource).not.toContain('content: stringifySettingContent({ ...setting, type: UNCATEGORIZED_TYPE })');
    expect(deleteRoleTypeSource).toContain('persist(entries.filter((entry) => {');
    expect(deleteRoleTypeSource).toContain('return role.type !== type;');
    expect(deleteRoleTypeSource).not.toContain('content: stringifyRoleContent({ ...role, type: DEFAULT_ROLE_TYPES[0] ?? UNCATEGORIZED_TYPE })');
  });

  it('does not confirm the setting create dialog while Chinese IME composition is active', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const modalStart = panelSource.indexOf('const settingCreateModal = settingCreateDialog ? createPortal(');
    const modalEnd = panelSource.indexOf(') : null;', modalStart);
    const modalSource = panelSource.slice(modalStart, modalEnd);
    const confirmStart = panelSource.indexOf('const confirmSettingCreate = () => {');
    const confirmEnd = panelSource.indexOf('const openSettingCreateDialog', confirmStart);
    const confirmSource = panelSource.slice(confirmStart, confirmEnd);

    expect(modalStart).toBeGreaterThan(-1);
    expect(panelSource).toContain("const [settingCreateDraft, setSettingCreateDraft] = useState('');");
    expect(panelSource).toContain("const [settingCreateTypeDraft, setSettingCreateTypeDraft] = useState('');");
    expect(confirmSource).toContain('const createTitle = settingCreateDraft.trim();');
    expect(confirmSource).toContain('const selectedCreateType = getValidSettingCreateType();');
    expect(confirmSource).not.toContain('addSettingTypeByName(settingTitleDraft);');
    expect(confirmSource).not.toContain('addRoleTypeByName(settingTitleDraft);');
    expect(modalSource).toContain("event.key === 'Enter'");
    expect(modalSource).toContain('event.nativeEvent.isComposing');
    expect(modalSource).toContain('event.keyCode === 229');
    expect(modalSource).toContain('!isImeComposing');
    expect(modalSource).toContain('value={settingCreateDraft}');
    expect(modalSource).toContain('onChange={(event) => setSettingCreateDraft(event.target.value)}');
    expect(modalSource).toContain('所属分组');
    expect(modalSource).toContain('value={settingCreateTypeValue}');
    expect(modalSource).toContain('onChange={(event) => setSettingCreateTypeDraft(event.target.value)}');
    expect(modalSource).toContain('confirmSettingCreate();');
  });

  it('shows a newly created setting group in the current setting workspace tab', async () => {
    const storageKey = 'workbench-create-setting-group-in-domain-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '势力地图0' }));
    fireEvent.click(screen.getByRole('button', { name: '分组' }));
    fireEvent.change(screen.getByPlaceholderText('输入分组名字'), { target: { value: '宗门势力' } });
    fireEvent.click(screen.getByRole('button', { name: '确认' }));

    expect(screen.getByRole('button', { name: /宗门势力/ })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(`${storageKey}_setting_types`) ?? '[]')).toContain('宗门势力');
    expect(JSON.parse(localStorage.getItem(`${storageKey}_setting_type_domains`) ?? '{}')).toMatchObject({
      宗门势力: 'setting:faction',
    });
  });

  it('creates a new setting in the selected group instead of the first group', async () => {
    const storageKey = 'workbench-create-setting-in-selected-group-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '道具资源0' }));
    fireEvent.click(screen.getByRole('button', { name: '设定' }));
    fireEvent.change(screen.getByPlaceholderText('输入设定名字'), { target: { value: '测试装备设定' } });
    fireEvent.change(screen.getByLabelText('所属分组'), { target: { value: '物品装备' } });
    fireEvent.click(screen.getByRole('button', { name: '确认' }));

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const createdEntry = storedEntries.find((entry: { title: string }) => entry.title === '测试装备设定');
    expect(createdEntry).toBeTruthy();
    expect(JSON.parse(createdEntry.content).type).toBe('物品装备');
    expect(JSON.parse(createdEntry.content).type).not.toBe('功法能力');
  });

  it('defaults new setting creation to the selected setting entry group', async () => {
    const storageKey = 'workbench-create-setting-defaults-to-selected-entry-group-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'basic-setting',
        tab: '大纲',
        title: '基础设定',
        content: JSON.stringify({ type: '核心设定', body: '' }),
        updatedAt: '2026/6/18 12:00:00',
      },
      {
        id: 'world-view',
        tab: '大纲',
        title: '世界观',
        content: JSON.stringify({ type: '核心设定', body: '' }),
        updatedAt: '2026/6/18 12:01:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '核心设定2' }));
    fireEvent.click(screen.getByText('世界观').closest('button') as HTMLElement);
    fireEvent.click(screen.getByRole('button', { name: '设定' }));

    expect(screen.getByLabelText('所属分组')).toHaveValue('核心设定');

    fireEvent.change(screen.getByPlaceholderText('输入设定名字'), { target: { value: '新核心设定条目' } });
    fireEvent.click(screen.getByRole('button', { name: '确认' }));

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const createdEntry = storedEntries.find((entry: { title: string }) => entry.title === '新核心设定条目');
    expect(createdEntry).toBeTruthy();
    expect(JSON.parse(createdEntry.content).type).toBe('核心设定');
  });

  it('persists manual setting order when dragging one setting entry before another', async () => {
    const storageKey = 'workbench-drag-sort-setting-entry-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'core-positioning',
        tab: '大纲',
        title: '自定义核心一',
        content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
        updatedAt: '2026/6/18 01:00:00',
      },
      {
        id: 'core-start',
        tab: '大纲',
        title: '自定义核心二',
        content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
        updatedAt: '2026/6/18 01:01:00',
      },
      {
        id: 'core-refreshing',
        tab: '大纲',
        title: '自定义核心三',
        content: JSON.stringify({ type: '核心设定', body: '用户已有核心爽点。' }),
        updatedAt: '2026/6/18 01:02:00',
      },
      {
        id: 'core-conflict',
        tab: '大纲',
        title: '自定义核心四',
        content: JSON.stringify({ type: '核心设定', body: '用户已有核心矛盾。' }),
        updatedAt: '2026/6/18 01:03:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '核心设定4' }));
    const source = screen.getByText('自定义核心四').closest('button');
    const target = screen.getByText('自定义核心一').closest('button');
    expect(source).toBeTruthy();
    expect(target).toBeTruthy();
    const dataTransfer = {
      data: {} as Record<string, string>,
      effectAllowed: '',
      dropEffect: '',
      setData(type: string, value: string) {
        this.data[type] = value;
      },
      getData(type: string) {
        return this.data[type] ?? '';
      },
    };

    fireEvent.dragStart(source as HTMLElement, { dataTransfer });
    fireEvent.dragOver(target as HTMLElement, { dataTransfer });
    fireEvent.drop(target as HTMLElement, { dataTransfer });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles.slice(0, 4)).toEqual(['自定义核心四', '自定义核心一', '自定义核心二', '自定义核心三']);
  });

  it('previews setting entry order while dragging over another entry', async () => {
    const storageKey = 'workbench-drag-preview-setting-entry-order-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'core-one',
        tab: '大纲',
        title: '自定义核心一',
        content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
        updatedAt: '2026/6/18 01:00:00',
      },
      {
        id: 'core-two',
        tab: '大纲',
        title: '自定义核心二',
        content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
        updatedAt: '2026/6/18 01:01:00',
      },
      {
        id: 'core-three',
        tab: '大纲',
        title: '自定义核心三',
        content: JSON.stringify({ type: '核心设定', body: '用户已有核心爽点。' }),
        updatedAt: '2026/6/18 01:02:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '核心设定3' }));
    const getVisibleCoreTitles = () => screen.getAllByRole('button')
      .map((button) => ['自定义核心一', '自定义核心二', '自定义核心三'].find((title) => button.textContent?.includes(title)))
      .filter((title): title is string => Boolean(title));

    expect(getVisibleCoreTitles()).toEqual(['自定义核心一', '自定义核心二', '自定义核心三']);

    const source = screen.getByText('自定义核心二').closest('button');
    const target = screen.getByText('自定义核心一').closest('button');
    expect(source).toBeTruthy();
    expect(target).toBeTruthy();
    const dataTransfer = {
      data: {} as Record<string, string>,
      effectAllowed: '',
      dropEffect: '',
      setData(type: string, value: string) {
        this.data[type] = value;
      },
      getData(type: string) {
        return this.data[type] ?? '';
      },
    };

    fireEvent.dragStart(source as HTMLElement, { dataTransfer });
    fireEvent.dragOver(target as HTMLElement, { dataTransfer });

    expect(getVisibleCoreTitles()).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);

    fireEvent.drop(target as HTMLElement, { dataTransfer });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);
  });

  it('uses swap-style preview when dragging a setting entry onto the next row', async () => {
    const storageKey = 'workbench-drag-swap-preview-setting-entry-order-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'core-one',
        tab: '大纲',
        title: '自定义核心一',
        content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
        updatedAt: '2026/6/18 01:00:00',
      },
      {
        id: 'core-two',
        tab: '大纲',
        title: '自定义核心二',
        content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
        updatedAt: '2026/6/18 01:01:00',
      },
      {
        id: 'core-three',
        tab: '大纲',
        title: '自定义核心三',
        content: JSON.stringify({ type: '核心设定', body: '用户已有核心爽点。' }),
        updatedAt: '2026/6/18 01:02:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '核心设定3' }));
    const getVisibleCoreTitles = () => screen.getAllByRole('button')
      .map((button) => ['自定义核心一', '自定义核心二', '自定义核心三'].find((title) => button.textContent?.includes(title)))
      .filter((title): title is string => Boolean(title));

    expect(getVisibleCoreTitles()).toEqual(['自定义核心一', '自定义核心二', '自定义核心三']);

    const source = screen.getByText('自定义核心一').closest('button');
    const target = screen.getByText('自定义核心二').closest('button');
    expect(source).toBeTruthy();
    expect(target).toBeTruthy();
    const dataTransfer = {
      data: {} as Record<string, string>,
      effectAllowed: '',
      dropEffect: '',
      setData(type: string, value: string) {
        this.data[type] = value;
      },
      getData(type: string) {
        return this.data[type] ?? '';
      },
    };

    fireEvent.dragStart(source as HTMLElement, { dataTransfer });
    fireEvent.dragOver(target as HTMLElement, { dataTransfer });

    expect(getVisibleCoreTitles()).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);

    fireEvent.drop(target as HTMLElement, { dataTransfer });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);
  });

  it('commits the last previewed setting order when drag end fires without a drop event', async () => {
    const storageKey = 'workbench-drag-end-commits-preview-setting-entry-order-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'core-one',
        tab: '大纲',
        title: '自定义核心一',
        content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
        updatedAt: '2026/6/18 01:00:00',
      },
      {
        id: 'core-two',
        tab: '大纲',
        title: '自定义核心二',
        content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
        updatedAt: '2026/6/18 01:01:00',
      },
      {
        id: 'core-three',
        tab: '大纲',
        title: '自定义核心三',
        content: JSON.stringify({ type: '核心设定', body: '用户已有核心爽点。' }),
        updatedAt: '2026/6/18 01:02:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '核心设定3' }));
    const source = screen.getByText('自定义核心一').closest('button');
    const target = screen.getByText('自定义核心二').closest('button');
    expect(source).toBeTruthy();
    expect(target).toBeTruthy();
    const dataTransfer = {
      data: {} as Record<string, string>,
      effectAllowed: '',
      dropEffect: '',
      setData(type: string, value: string) {
        this.data[type] = value;
      },
      getData(type: string) {
        return this.data[type] ?? '';
      },
    };

    fireEvent.dragStart(source as HTMLElement, { dataTransfer });
    fireEvent.dragOver(target as HTMLElement, { dataTransfer });
    fireEvent.dragEnd(source as HTMLElement, { dataTransfer });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);
  });

  it('keeps the latest drag preview in a synchronous ref for real browser drag end timing', async () => {
    const source = await readWorkbenchLibraryPanelSource();

    expect(source).toContain('const libraryEntryDropPreviewRef = useRef<LibraryEntryDropPreviewState>(null);');
    expect(source).toContain('const setLibraryEntryDropPreviewState = (next: LibraryEntryDropPreviewState)');
    expect(source).toContain('libraryEntryDropPreviewRef.current = next;');
    expect(source).toContain('commitLibraryEntryDropPreview(libraryEntryDropPreviewRef.current);');
    expect(source).toContain('type LibraryEntryPointerDragState');
    expect(source).toContain('beginLibraryEntryPointerDrag');
    expect(source).toContain('updateLibraryEntryPointerPreview');
    expect(source).toContain('finishLibraryEntryPointerDrag');
    expect(source).toContain('data-library-entry-id={entry.id}');
  });

  it('uses pointer sorting instead of native draggable attributes on setting entries', () => {
    const storageKey = 'workbench-setting-entry-pointer-sort-only-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'core-one',
        tab: '大纲',
        title: '自定义核心一',
        content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
        updatedAt: '2026/6/18 01:00:00',
      },
      {
        id: 'core-two',
        tab: '大纲',
        title: '自定义核心二',
        content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
        updatedAt: '2026/6/18 01:01:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '核心设定2' }));

    expect(screen.getByText('自定义核心一').closest('button')).not.toHaveAttribute('draggable');
    expect(screen.getByText('自定义核心二').closest('button')).not.toHaveAttribute('draggable');
  });

  it('persists setting order after a real pointer move and pointer up', () => {
    vi.useFakeTimers();
    const storageKey = 'workbench-setting-entry-pointer-sort-commit-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'core-one',
        tab: '大纲',
        title: '自定义核心一',
        content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
        updatedAt: '2026/6/18 01:00:00',
      },
      {
        id: 'core-two',
        tab: '大纲',
        title: '自定义核心二',
        content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
        updatedAt: '2026/6/18 01:01:00',
      },
      {
        id: 'core-three',
        tab: '大纲',
        title: '自定义核心三',
        content: JSON.stringify({ type: '核心设定', body: '用户已有核心爽点。' }),
        updatedAt: '2026/6/18 01:02:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '核心设定3' }));
    const source = screen.getByText('自定义核心一').closest('button');
    const target = screen.getByText('自定义核心二').closest('button');
    expect(source).toBeTruthy();
    expect(target).toBeTruthy();

    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => target,
    });

    try {
      fireEvent.pointerDown(source as HTMLElement, { button: 0, pointerId: 11, clientX: 10, clientY: 10 });
      vi.advanceTimersByTime(180);
      fireEvent.pointerMove(window, { pointerId: 11, clientX: 10, clientY: 42 });
      fireEvent.pointerUp(window, { pointerId: 11, clientX: 10, clientY: 42 });
    } finally {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: originalElementFromPoint,
      });
      vi.useRealTimers();
    }

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);
  });

  it('does not start setting pointer sorting from a small accidental movement', () => {
    const storageKey = 'workbench-setting-entry-pointer-sort-threshold-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'core-one',
        tab: '大纲',
        title: '自定义核心一',
        content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
        updatedAt: '2026/6/18 01:00:00',
      },
      {
        id: 'core-two',
        tab: '大纲',
        title: '自定义核心二',
        content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
        updatedAt: '2026/6/18 01:01:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '核心设定2' }));
    const source = screen.getByText('自定义核心一').closest('button');
    const target = screen.getByText('自定义核心二').closest('button');
    expect(source).toBeTruthy();
    expect(target).toBeTruthy();

    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => target,
    });

    try {
      fireEvent.pointerDown(source as HTMLElement, { button: 0, pointerId: 12, clientX: 10, clientY: 10 });
      fireEvent.pointerMove(window, { pointerId: 12, clientX: 10, clientY: 22 });
      fireEvent.pointerUp(window, { pointerId: 12, clientX: 10, clientY: 22 });
    } finally {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: originalElementFromPoint,
      });
    }

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心一', '自定义核心二']);
  });

  it('does not start setting pointer sorting before the intentional hold delay', () => {
    vi.useFakeTimers();
    const storageKey = 'workbench-setting-entry-pointer-sort-hold-delay-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'core-one',
        tab: '大纲',
        title: '自定义核心一',
        content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
        updatedAt: '2026/6/18 01:00:00',
      },
      {
        id: 'core-two',
        tab: '大纲',
        title: '自定义核心二',
        content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
        updatedAt: '2026/6/18 01:01:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '核心设定2' }));
    const source = screen.getByText('自定义核心一').closest('button');
    const target = screen.getByText('自定义核心二').closest('button');
    expect(source).toBeTruthy();
    expect(target).toBeTruthy();

    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => target,
    });

    try {
      fireEvent.pointerDown(source as HTMLElement, { button: 0, pointerId: 13, clientX: 10, clientY: 10 });
      fireEvent.pointerMove(window, { pointerId: 13, clientX: 10, clientY: 48 });
      fireEvent.pointerUp(window, { pointerId: 13, clientX: 10, clientY: 48 });
    } finally {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: originalElementFromPoint,
      });
      vi.useRealTimers();
    }

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心一', '自定义核心二']);
  });

  it('keeps the first setting entry from chaining into the third row on the same pointer position', () => {
    vi.useFakeTimers();
    const storageKey = 'workbench-setting-entry-pointer-sort-retarget-guard-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'core-one',
        tab: '大纲',
        title: '自定义核心一',
        content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
        updatedAt: '2026/6/18 01:00:00',
      },
      {
        id: 'core-two',
        tab: '大纲',
        title: '自定义核心二',
        content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
        updatedAt: '2026/6/18 01:01:00',
      },
      {
        id: 'core-three',
        tab: '大纲',
        title: '自定义核心三',
        content: JSON.stringify({ type: '核心设定', body: '用户已有核心爽点。' }),
        updatedAt: '2026/6/18 01:02:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '核心设定3' }));
    const source = screen.getByText('自定义核心一').closest('button');
    const secondRow = screen.getByText('自定义核心二').closest('button');
    const thirdRow = screen.getByText('自定义核心三').closest('button');
    expect(source).toBeTruthy();
    expect(secondRow).toBeTruthy();
    expect(thirdRow).toBeTruthy();

    let hoverTarget: Element | null = secondRow;
    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => hoverTarget,
    });

    try {
      fireEvent.pointerDown(source as HTMLElement, { button: 0, pointerId: 14, clientX: 10, clientY: 10 });
      vi.advanceTimersByTime(180);
      fireEvent.pointerMove(window, { pointerId: 14, clientX: 10, clientY: 42 });
      hoverTarget = thirdRow;
      fireEvent.pointerMove(window, { pointerId: 14, clientX: 10, clientY: 42 });
      fireEvent.pointerUp(window, { pointerId: 14, clientX: 10, clientY: 42 });
    } finally {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: originalElementFromPoint,
      });
      vi.useRealTimers();
    }

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);
  });

  it('does not retarget a dragged setting entry from the second row to the third row on a modest movement', () => {
    vi.useFakeTimers();
    const storageKey = 'workbench-setting-entry-pointer-sort-modest-retarget-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'core-one',
        tab: '大纲',
        title: '自定义核心一',
        content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
        updatedAt: '2026/6/18 01:00:00',
      },
      {
        id: 'core-two',
        tab: '大纲',
        title: '自定义核心二',
        content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
        updatedAt: '2026/6/18 01:01:00',
      },
      {
        id: 'core-three',
        tab: '大纲',
        title: '自定义核心三',
        content: JSON.stringify({ type: '核心设定', body: '用户已有核心爽点。' }),
        updatedAt: '2026/6/18 01:02:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '核心设定3' }));
    const source = screen.getByText('自定义核心一').closest('button');
    const secondRow = screen.getByText('自定义核心二').closest('button');
    const thirdRow = screen.getByText('自定义核心三').closest('button');
    expect(source).toBeTruthy();
    expect(secondRow).toBeTruthy();
    expect(thirdRow).toBeTruthy();

    let hoverTarget: Element | null = secondRow;
    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => hoverTarget,
    });

    try {
      fireEvent.pointerDown(source as HTMLElement, { button: 0, pointerId: 18, clientX: 10, clientY: 10 });
      vi.advanceTimersByTime(180);
      fireEvent.pointerMove(window, { pointerId: 18, clientX: 10, clientY: 42 });
      hoverTarget = thirdRow;
      fireEvent.pointerMove(window, { pointerId: 18, clientX: 10, clientY: 64 });
      fireEvent.pointerUp(window, { pointerId: 18, clientX: 10, clientY: 64 });
    } finally {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: originalElementFromPoint,
      });
      vi.useRealTimers();
    }

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);
  });

  it('keeps a dragged setting entry on its preview row when the pointer is over its own ghost', () => {
    vi.useFakeTimers();
    const storageKey = 'workbench-setting-entry-pointer-sort-ghost-row-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'core-one',
        tab: '大纲',
        title: '自定义核心一',
        content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
        updatedAt: '2026/6/18 01:00:00',
      },
      {
        id: 'core-two',
        tab: '大纲',
        title: '自定义核心二',
        content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
        updatedAt: '2026/6/18 01:01:00',
      },
      {
        id: 'core-three',
        tab: '大纲',
        title: '自定义核心三',
        content: JSON.stringify({ type: '核心设定', body: '用户已有核心爽点。' }),
        updatedAt: '2026/6/18 01:02:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '核心设定3' }));
    const source = screen.getByText('自定义核心一').closest('button');
    const secondRow = screen.getByText('自定义核心二').closest('button');
    expect(source).toBeTruthy();
    expect(secondRow).toBeTruthy();

    let hoverTarget: Element | null = secondRow;
    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => hoverTarget,
    });

    try {
      fireEvent.pointerDown(source as HTMLElement, { button: 0, pointerId: 19, clientX: 10, clientY: 10 });
      vi.advanceTimersByTime(180);
      fireEvent.pointerMove(window, { pointerId: 19, clientX: 10, clientY: 42 });
      hoverTarget = source;
      fireEvent.pointerMove(window, { pointerId: 19, clientX: 10, clientY: 74 });
      fireEvent.pointerUp(window, { pointerId: 19, clientX: 10, clientY: 74 });
    } finally {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: originalElementFromPoint,
      });
      vi.useRealTimers();
    }

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);
  });

  it('does not return a dragged setting entry to its original row from a tiny reverse movement', () => {
    vi.useFakeTimers();
    const storageKey = 'workbench-setting-entry-pointer-sort-return-to-origin-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'core-one',
        tab: '大纲',
        title: '自定义核心一',
        content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
        updatedAt: '2026/6/18 01:00:00',
      },
      {
        id: 'core-two',
        tab: '大纲',
        title: '自定义核心二',
        content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
        updatedAt: '2026/6/18 01:01:00',
      },
      {
        id: 'core-three',
        tab: '大纲',
        title: '自定义核心三',
        content: JSON.stringify({ type: '核心设定', body: '用户已有核心爽点。' }),
        updatedAt: '2026/6/18 01:02:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '核心设定3' }));
    const source = screen.getByText('自定义核心一').closest('button');
    const secondRow = screen.getByText('自定义核心二').closest('button');
    expect(source).toBeTruthy();
    expect(secondRow).toBeTruthy();

    let hoverTarget: Element | null = secondRow;
    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => hoverTarget,
    });

    try {
      fireEvent.pointerDown(source as HTMLElement, { button: 0, pointerId: 16, clientX: 10, clientY: 10 });
      vi.advanceTimersByTime(180);
      fireEvent.pointerMove(window, { pointerId: 16, clientX: 10, clientY: 42 });
      hoverTarget = source;
      fireEvent.pointerMove(window, { pointerId: 16, clientX: 10, clientY: 30 });
      fireEvent.pointerUp(window, { pointerId: 16, clientX: 10, clientY: 30 });
    } finally {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: originalElementFromPoint,
      });
      vi.useRealTimers();
    }

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);
  });

  it('lets a dragged setting entry return to its original row after a deliberate reverse movement', () => {
    vi.useFakeTimers();
    const storageKey = 'workbench-setting-entry-pointer-sort-deliberate-return-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'core-one',
        tab: '大纲',
        title: '自定义核心一',
        content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
        updatedAt: '2026/6/18 01:00:00',
      },
      {
        id: 'core-two',
        tab: '大纲',
        title: '自定义核心二',
        content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
        updatedAt: '2026/6/18 01:01:00',
      },
      {
        id: 'core-three',
        tab: '大纲',
        title: '自定义核心三',
        content: JSON.stringify({ type: '核心设定', body: '用户已有核心爽点。' }),
        updatedAt: '2026/6/18 01:02:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '核心设定3' }));
    const source = screen.getByText('自定义核心一').closest('button');
    const secondRow = screen.getByText('自定义核心二').closest('button');
    expect(source).toBeTruthy();
    expect(secondRow).toBeTruthy();

    let hoverTarget: Element | null = secondRow;
    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => hoverTarget,
    });

    try {
      fireEvent.pointerDown(source as HTMLElement, { button: 0, pointerId: 17, clientX: 10, clientY: 10 });
      vi.advanceTimersByTime(180);
      fireEvent.pointerMove(window, { pointerId: 17, clientX: 10, clientY: 42 });
      hoverTarget = secondRow;
      fireEvent.pointerMove(window, { pointerId: 17, clientX: 10, clientY: 12 });
      fireEvent.pointerUp(window, { pointerId: 17, clientX: 10, clientY: 12 });
    } finally {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: originalElementFromPoint,
      });
      vi.useRealTimers();
    }

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心一', '自定义核心二', '自定义核心三']);
  });

  it('does not send the first setting entry to the group end before the pointer reaches another row', () => {
    vi.useFakeTimers();
    const storageKey = 'workbench-setting-entry-pointer-sort-group-end-guard-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'core-one',
        tab: '大纲',
        title: '自定义核心一',
        content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
        updatedAt: '2026/6/18 01:00:00',
      },
      {
        id: 'core-two',
        tab: '大纲',
        title: '自定义核心二',
        content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
        updatedAt: '2026/6/18 01:01:00',
      },
      {
        id: 'core-three',
        tab: '大纲',
        title: '自定义核心三',
        content: JSON.stringify({ type: '核心设定', body: '用户已有核心爽点。' }),
        updatedAt: '2026/6/18 01:02:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    const groupButton = screen.getByRole('button', { name: '核心设定3' });
    fireEvent.click(groupButton);
    const groupRoot = groupButton.closest('[data-library-group-type]');
    const source = screen.getByText('自定义核心一').closest('button');
    const secondRow = screen.getByText('自定义核心二').closest('button');
    const thirdRow = screen.getByText('自定义核心三').closest('button');
    expect(groupRoot).toBeTruthy();
    expect(source).toBeTruthy();
    expect(secondRow).toBeTruthy();
    expect(thirdRow).toBeTruthy();

    const makeRect = (top: number, bottom: number) => ({
      x: 0,
      y: top,
      top,
      bottom,
      left: 0,
      right: 260,
      width: 260,
      height: bottom - top,
      toJSON: () => ({}),
    }) as DOMRect;
    const sourceRect = vi.spyOn(source as HTMLElement, 'getBoundingClientRect').mockReturnValue(makeRect(10, 34));
    const secondRect = vi.spyOn(secondRow as HTMLElement, 'getBoundingClientRect').mockReturnValue(makeRect(38, 62));
    const thirdRect = vi.spyOn(thirdRow as HTMLElement, 'getBoundingClientRect').mockReturnValue(makeRect(66, 90));
    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => groupRoot,
    });

    try {
      fireEvent.pointerDown(source as HTMLElement, { button: 0, pointerId: 15, clientX: 10, clientY: 10 });
      vi.advanceTimersByTime(180);
      fireEvent.pointerMove(window, { pointerId: 15, clientX: 10, clientY: 35 });
      fireEvent.pointerUp(window, { pointerId: 15, clientX: 10, clientY: 35 });
    } finally {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: originalElementFromPoint,
      });
      sourceRect.mockRestore();
      secondRect.mockRestore();
      thirdRect.mockRestore();
      vi.useRealTimers();
    }

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心一', '自定义核心二', '自定义核心三']);
  });

  it('keeps setting entry order stable when dragging across a non-empty group header', async () => {
    const storageKey = 'workbench-drag-stable-over-non-empty-group-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'core-one',
        tab: '大纲',
        title: '自定义核心一',
        content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
        updatedAt: '2026/6/18 01:00:00',
      },
      {
        id: 'core-two',
        tab: '大纲',
        title: '自定义核心二',
        content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
        updatedAt: '2026/6/18 01:01:00',
      },
      {
        id: 'core-three',
        tab: '大纲',
        title: '自定义核心三',
        content: JSON.stringify({ type: '核心设定', body: '用户已有核心爽点。' }),
        updatedAt: '2026/6/18 01:02:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    const groupHeader = screen.getByRole('button', { name: '核心设定3' });
    fireEvent.click(groupHeader);
    const getVisibleCoreTitles = () => screen.getAllByRole('button')
      .map((button) => ['自定义核心一', '自定义核心二', '自定义核心三'].find((title) => button.textContent?.includes(title)))
      .filter((title): title is string => Boolean(title));
    const source = screen.getByText('自定义核心二').closest('button');
    expect(source).toBeTruthy();
    const dataTransfer = {
      data: {} as Record<string, string>,
      effectAllowed: '',
      dropEffect: '',
      setData(type: string, value: string) {
        this.data[type] = value;
      },
      getData(type: string) {
        return this.data[type] ?? '';
      },
    };

    fireEvent.dragStart(source as HTMLElement, { dataTransfer });
    fireEvent.dragOver(groupHeader, { dataTransfer });

    expect(getVisibleCoreTitles()).toEqual(['自定义核心一', '自定义核心二', '自定义核心三']);
  });

  it('does not render the setting entry grip dot icon', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const entryListStart = panelSource.indexOf('previewEntries.map((entry, previewIndex) => {');
    const entryListEnd = panelSource.indexOf('{!activeIsBrainstorm && (', entryListStart);
    const entryListSource = panelSource.slice(entryListStart, entryListEnd);

    expect(entryListStart).toBeGreaterThan(-1);
    expect(entryListEnd).toBeGreaterThan(entryListStart);
    expect(entryListSource).not.toContain('GripVertical');
  });

  it('keeps the normal arrow cursor on setting entry rows', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const entryListStart = panelSource.indexOf('previewEntries.map((entry, previewIndex) => {');
    const entryListEnd = panelSource.indexOf('{!activeIsBrainstorm && (', entryListStart);
    const entryListSource = panelSource.slice(entryListStart, entryListEnd);

    expect(entryListStart).toBeGreaterThan(-1);
    expect(entryListEnd).toBeGreaterThan(entryListStart);
    expect(entryListSource).toContain('cursor-default select-none');
    expect(entryListSource).not.toContain('cursor-grab select-none');
    expect(entryListSource).not.toContain('active:cursor-grabbing');
  });

  it('shows the grabbing cursor only after a setting entry enters drag mode', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const entryListStart = panelSource.indexOf('previewEntries.map((entry, previewIndex) => {');
    const entryListEnd = panelSource.indexOf('{!activeIsBrainstorm && (', entryListStart);
    const entryListSource = panelSource.slice(entryListStart, entryListEnd);

    expect(entryListStart).toBeGreaterThan(-1);
    expect(entryListEnd).toBeGreaterThan(entryListStart);
    expect(entryListSource).toContain('cursor-default select-none');
    expect(entryListSource).toContain("draggingLibraryEntry?.entryId === entry.id ? 'cursor-grabbing");
    expect(entryListSource).not.toContain('cursor-grab select-none');
    expect(entryListSource).not.toContain('active:cursor-grabbing');
  });

  it('moves a setting entry to the end of its group when dropping on the group area', async () => {
    const storageKey = 'workbench-drag-setting-entry-to-group-end-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'core-one',
        tab: '大纲',
        title: '自定义核心一',
        content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
        updatedAt: '2026/6/18 01:00:00',
      },
      {
        id: 'core-two',
        tab: '大纲',
        title: '自定义核心二',
        content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
        updatedAt: '2026/6/18 01:01:00',
      },
      {
        id: 'core-three',
        tab: '大纲',
        title: '自定义核心三',
        content: JSON.stringify({ type: '核心设定', body: '用户已有核心爽点。' }),
        updatedAt: '2026/6/18 01:02:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '核心设定3' }));
    const source = screen.getByText('自定义核心一').closest('button');
    const targetGroup = screen.getByRole('button', { name: '核心设定3' });
    expect(source).toBeTruthy();
    const dataTransfer = {
      data: {} as Record<string, string>,
      effectAllowed: '',
      dropEffect: '',
      setData(type: string, value: string) {
        this.data[type] = value;
      },
      getData(type: string) {
        return this.data[type] ?? '';
      },
    };

    fireEvent.dragStart(source as HTMLElement, { dataTransfer });
    fireEvent.dragOver(targetGroup, { dataTransfer });
    fireEvent.drop(targetGroup, { dataTransfer });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心二', '自定义核心三', '自定义核心一']);
  });

  it('shows the approved default groups for character and setting workspace tabs', async () => {
    const storageKey = 'workbench-approved-setting-default-groups-test';
    localStorage.setItem(`${storageKey}_hidden_role_types`, JSON.stringify(['男主角', '女主角', '重要正派角色', '正派配角', '重要反派角色', '反派配角', '龙套角色']));
    localStorage.setItem(`${storageKey}_hidden_setting_types`, JSON.stringify(['核心设定', '剧情规划', '书写规则']));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    expect(screen.getByRole('button', { name: '核心设定3' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '世界规则1' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '剧情规划3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '书写规则2' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '人物设定1' }));
    expect(screen.getByRole('button', { name: '男主角1' })).toBeInTheDocument();
    ['女主角', '重要正派角色', '正派配角', '重要反派角色', '反派配角', '龙套角色'].forEach((group) => {
      expect(screen.getByRole('button', { name: `${group}0` })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: '未分类0' })).not.toBeInTheDocument();

    const groupsByTab = [
      { tab: '势力地图2', groups: ['正派势力', '反派势力', '中立势力', '其他势力'], count: 0 },
      { tab: '势力地图2', groups: ['世界地图'], count: 2 },
      { tab: '道具资源0', groups: ['功法能力', '物品装备', '资源货币', '特殊资源'], count: 0 },
      { tab: '怪物图鉴0', groups: ['怪物列表'], count: 0 },
      { tab: '伏笔线索3', groups: ['主线伏笔', '人物伏笔', '已回收伏笔'], count: 1 },
    ];

    groupsByTab.forEach(({ tab, groups, count }) => {
      fireEvent.click(screen.getByRole('button', { name: tab }));
      groups.forEach((group) => {
        expect(screen.getByRole('button', { name: `${group}${count}` })).toBeInTheDocument();
      });
    });
    expect(JSON.parse(localStorage.getItem(`${storageKey}_hidden_role_types`) ?? '[]')).toEqual([]);
    expect(JSON.parse(localStorage.getItem(`${storageKey}_hidden_setting_types`) ?? '[]')).toEqual([]);
  });

  it('seeds a locked male protagonist role for a new novel and opens it from character settings', async () => {
    const storageKey = 'workbench-default-male-protagonist-role-test';
    const panelSource = await readWorkbenchLibraryPanelSource();

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    expect(screen.getByRole('button', { name: '人物设定1' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '人物设定1' }));
    expect(screen.getByRole('button', { name: '男主角1' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('男主角')).toBeInTheDocument();
    expect(screen.queryByText('身份定位')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '存活' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '死亡' })).not.toBeInTheDocument();

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const roleEntries = storedEntries.filter((entry: { tab: string }) => entry.tab === '角色');
    expect(roleEntries).toHaveLength(1);
    expect(roleEntries[0].title).toBe('男主角');
    expect(JSON.parse(roleEntries[0].content)).toMatchObject({
      type: '男主角',
      lifeStatus: '存活',
    });
    expect(panelSource).toContain('function isMaleProtagonistRoleTypeChangeLocked(currentType: string, nextType: string) {');
    expect(panelSource).toContain('return isMaleProtagonistRoleType(currentType) && !isMaleProtagonistRoleType(nextType);');
    expect(panelSource).toContain('if (normalizedUpdates.type && isMaleProtagonistRoleTypeChangeLocked(selectedRole.type, normalizedUpdates.type)) return;');
    expect(panelSource).toContain('if (normalizedUpdates.type && isMaleProtagonistRoleTypeChangeLocked(currentSelectedRole.type, normalizedUpdates.type)) return;');
    expect(panelSource).toContain('if (isMaleProtagonistRoleTypeChangeLocked(role.type, targetType)) return;');
    expect(panelSource).toContain('const showRoleIdentityControls = !roleIsMaleProtagonist;');
    expect(panelSource).toContain('{showRoleIdentityControls ? (');
    expect(panelSource).toContain('<div aria-hidden="true" className="h-[42px] min-w-[168px] shrink-0" />');
    expect(panelSource).toContain('<div aria-hidden="true" className="h-9 w-[112px] shrink-0" />');
    expect(panelSource).toContain('buttonClassName="h-[42px] px-3 text-sm"');
    expect(panelSource).not.toContain('buttonClassName="h-10 rounded-xl border-2 border-cyan-200 px-3 text-sm"');
  });

  it('seeds the approved default setting entries with empty bodies by the current setting workspace groups', async () => {
    const storageKey = 'workbench-default-core-setting-starter-test';
    const expectedEntriesByType = new Map([
      ['核心设定', ['基础设定', '世界观', '主角金手指/优势']],
      ['剧情规划', ['剧情蓝图', '爽点设计', '分卷剧情']],
      ['正派势力', []],
      ['反派势力', []],
      ['中立势力', []],
      ['其他势力', []],
      ['功法能力', []],
      ['物品装备', []],
      ['资源货币', []],
      ['特殊资源', []],
      ['怪物列表', []],
      ['世界地图', ['世界架构', '危险区域']],
      ['主线伏笔', ['主线伏笔']],
      ['人物伏笔', ['人物伏笔']],
      ['已回收伏笔', ['已回收伏笔']],
      ['书写规则', ['写作规范', '写作禁忌']],
    ]);
    const expectedEntryCount = Array.from(expectedEntriesByType.values()).reduce((total, titles) => total + titles.length, 0);

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    expect(screen.getByRole('button', { name: '作品设定8' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '势力地图2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '核心设定3' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '核心设定3' }));
    expect(screen.getAllByText('核心设定').length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue('基础设定')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('世界规则')).not.toBeInTheDocument();

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const storedSettingEntries = storedEntries.filter((entry: { tab: string }) => entry.tab === '大纲');
    expect(storedSettingEntries).toHaveLength(expectedEntryCount);
    expectedEntriesByType.forEach((expectedTitles, type) => {
      const titles = storedSettingEntries
        .filter((entry: { content: string }) => JSON.parse(entry.content).type === type)
        .map((entry: { title: string }) => entry.title);
      expect(titles).toEqual(expectedTitles);
    });
    const worldViewEntry = storedSettingEntries.find((entry: { title: string }) => entry.title === '世界观');
    expect(worldViewEntry).toBeTruthy();
    expect(JSON.parse(worldViewEntry.content).type).toBe('核心设定');
    expect(JSON.parse(worldViewEntry.content).body).toBe('');
    const positioningEntry = storedSettingEntries.find((entry: { title: string }) => entry.title === '基础设定');
    expect(JSON.parse(positioningEntry.content).body).toBe('');
    expect(storedSettingEntries.some((entry: { title: string }) => entry.title === '正派势力')).toBe(false);
    expect(storedSettingEntries.some((entry: { title: string }) => entry.title === '反派势力')).toBe(false);
    expect(storedSettingEntries.some((entry: { title: string }) => entry.title === '中立势力')).toBe(false);
    expect(storedSettingEntries.some((entry: { title: string }) => entry.title === '其他势力')).toBe(false);
    storedSettingEntries.forEach((entry: { title: string; content: string }) => {
      expect(entry.title).not.toContain('：');
      expect(JSON.parse(entry.content).body).not.toContain('填写说明');
      expect(JSON.parse(entry.content).body).toBe('');
    });
  });

  it('locks default setting groups and default setting entries from rename and delete actions', async () => {
    const storageKey = 'workbench-default-setting-entry-lock-test';

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '剧情规划3' }));
    fireEvent.click(screen.getByText('剧情蓝图').closest('button') as HTMLElement);

    const defaultTitleInput = screen.getByDisplayValue('剧情蓝图');
    expect(defaultTitleInput).toBeDisabled();
    expect(screen.queryByRole('button', { name: '删除' })).not.toBeInTheDocument();

    fireEvent.contextMenu(screen.getByText('剧情蓝图').closest('button') as HTMLElement);
    expect(screen.queryByText('重命名')).not.toBeInTheDocument();
    expect(screen.queryByText('删除')).not.toBeInTheDocument();

    fireEvent.contextMenu(screen.getByRole('button', { name: '剧情规划3' }));
    expect(screen.queryByText('删除分类')).not.toBeInTheDocument();
  });

  it('keeps custom setting entries editable and deletable from the context menu without a footer delete button', async () => {
    const storageKey = 'workbench-custom-setting-entry-stays-editable-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'custom-setting',
        tab: '大纲',
        title: '自定义剧情设定',
        content: JSON.stringify({ type: '剧情规划', body: '' }),
        updatedAt: '2026/6/19 01:00:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '剧情规划1' }));
    fireEvent.click(screen.getByText('自定义剧情设定').closest('button') as HTMLElement);

    expect(screen.getByDisplayValue('自定义剧情设定')).not.toBeDisabled();
    expect(screen.queryByRole('button', { name: '删除' })).not.toBeInTheDocument();

    fireEvent.contextMenu(screen.getByText('自定义剧情设定').closest('button') as HTMLElement);
    expect(screen.getByText('重命名')).toBeInTheDocument();
    expect(screen.getAllByText('删除').length).toBeGreaterThan(0);
  });

  it('freezes the current setting workspace catalog as the new-novel default', async () => {
    const storageKey = 'workbench-current-setting-default-catalog-test';
    const expectedCatalog = {
      作品设定: {
        核心设定: ['基础设定', '世界观', '主角金手指/优势'],
        剧情规划: ['剧情蓝图', '爽点设计', '分卷剧情'],
        书写规则: ['写作规范', '写作禁忌'],
      },
      势力地图: {
        正派势力: [],
        反派势力: [],
        中立势力: [],
        其他势力: [],
        世界地图: ['世界架构', '危险区域'],
      },
      道具资源: {
        功法能力: [],
        物品装备: [],
        资源货币: [],
        特殊资源: [],
      },
      怪物图鉴: {
        怪物列表: [],
      },
      伏笔线索: {
        主线伏笔: ['主线伏笔'],
        人物伏笔: ['人物伏笔'],
        已回收伏笔: ['已回收伏笔'],
      },
    };

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    expect(screen.getByRole('button', { name: '作品设定8' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '人物设定1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '势力地图2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '道具资源0' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '怪物图鉴0' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '伏笔线索3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '书写规则2' })).toBeInTheDocument();

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const settingEntries = storedEntries.filter((entry: { tab: string }) => entry.tab === '大纲');
    const entriesByType = new Map<string, string[]>();
    settingEntries.forEach((entry: { title: string; content: string }) => {
      const type = JSON.parse(entry.content).type;
      entriesByType.set(type, [...(entriesByType.get(type) ?? []), entry.title]);
      expect(JSON.parse(entry.content).body).toBe('');
    });

    Object.values(expectedCatalog).forEach((groups) => {
      Object.entries(groups).forEach(([group, titles]) => {
        expect(entriesByType.get(group) ?? []).toEqual(titles);
      });
    });
  });

  it('splits basic setting preview into story type, core concept, and one sentence summary fields', async () => {
    const storageKey = 'workbench-basic-setting-structured-preview-test';
    const panelSource = await readWorkbenchLibraryPanelSource();
    const basicSetStart = panelSource.indexOf("id: 'work-core-basic'");
    const basicSetEnd = panelSource.indexOf("id: 'work-core-world-view'", basicSetStart);
    const basicSetSource = panelSource.slice(basicSetStart, basicSetEnd);

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '核心设定3' }));

    expect(screen.getByDisplayValue('基础设定')).toBeInTheDocument();
    expect(basicSetSource).toContain("gridColumnsClassName: 'grid-cols-2'");
    expect(basicSetSource).not.toContain("gridColumnsClassName: 'grid-cols-3'");
    expect(screen.getByLabelText('故事类型')).toBeInTheDocument();
    expect(screen.getByLabelText('核心创意')).toBeInTheDocument();
    expect(screen.getByLabelText('一句话概括')).toBeInTheDocument();
    expect(screen.queryByText('设定预览')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('故事类型'), { target: { value: '玄幻升级流' } });
    fireEvent.change(screen.getByLabelText('核心创意'), { target: { value: '主角靠吞噬旧神残骸修炼。' } });
    fireEvent.change(screen.getByLabelText('一句话概括'), { target: { value: '被逐出宗门的少年一路吞噬神明遗骨，推翻天道秩序。' } });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const basicSettingEntry = storedEntries.find((entry: { title: string }) => entry.title === '基础设定');
    const body = JSON.parse(basicSettingEntry.content).body;
    expect(body).toContain('【故事类型】：\n玄幻升级流');
    expect(body).toContain('【核心创意】：\n主角靠吞噬旧神残骸修炼。');
    expect(body).toContain('【一句话概括】：\n被逐出宗门的少年一路吞噬神明遗骨，推翻天道秩序。');
  });

  it('splits world view preview into era background, world pattern, and social order fields', async () => {
    const storageKey = 'workbench-world-view-structured-preview-test';
    const panelSource = await readWorkbenchLibraryPanelSource();
    const worldViewSetStart = panelSource.indexOf("id: 'work-core-world-view'");
    const worldViewSetEnd = panelSource.indexOf("id: 'work-core-cheat-advantage'", worldViewSetStart);
    const worldViewSetSource = panelSource.slice(worldViewSetStart, worldViewSetEnd);
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'world-view',
        tab: '大纲',
        title: '世界观',
        content: JSON.stringify({ type: '核心设定', body: '' }),
        updatedAt: '2026/6/18 12:00:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '核心设定1' }));

    expect(screen.getByDisplayValue('世界观')).toBeInTheDocument();
    expect(worldViewSetSource).toContain("gridColumnsClassName: 'grid-cols-2'");
    expect(worldViewSetSource).not.toContain("gridColumnsClassName: 'grid-cols-3'");
    expect(screen.getByLabelText('时代背景')).toBeInTheDocument();
    expect(screen.getByLabelText('世界格局')).toBeInTheDocument();
    expect(screen.getByLabelText('社会秩序')).toBeInTheDocument();
    expect(screen.queryByText('设定预览')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('时代背景'), { target: { value: '诸国割据后的灵气复苏时代。' } });
    fireEvent.change(screen.getByLabelText('世界格局'), { target: { value: '宗门、王朝与商会三方争夺新矿脉。' } });
    fireEvent.change(screen.getByLabelText('社会秩序'), { target: { value: '凡人依附城邦，修士受宗门律令和资源契约约束。' } });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const worldViewEntry = storedEntries.find((entry: { title: string }) => entry.title === '世界观');
    const body = JSON.parse(worldViewEntry.content).body;
    expect(body).toContain('【时代背景】：\n诸国割据后的灵气复苏时代。');
    expect(body).toContain('【世界格局】：\n宗门、王朝与商会三方争夺新矿脉。');
    expect(body).toContain('【社会秩序】：\n凡人依附城邦，修士受宗门律令和资源契约约束。');
  });

  it('splits protagonist cheat advantage preview into the approved five fields', async () => {
    const storageKey = 'workbench-cheat-advantage-structured-preview-test';
    const panelSource = await readWorkbenchLibraryPanelSource();
    const cheatSetStart = panelSource.indexOf("id: 'work-core-cheat-advantage'");
    const cheatSetEnd = panelSource.indexOf("id: 'faction-righteous-no-1'", cheatSetStart);
    const cheatSetSource = panelSource.slice(cheatSetStart, cheatSetEnd);

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '核心设定3' }));
    fireEvent.click(screen.getByText('主角金手指/优势').closest('button') as HTMLElement);

    expect(screen.getByDisplayValue('主角金手指/优势')).toBeInTheDocument();
    expect(cheatSetSource).toContain("gridColumnsClassName: 'grid-cols-2'");
    expect(cheatSetSource).not.toContain("gridColumnsClassName: 'grid-cols-5'");
    expect(screen.getByLabelText('能力来源')).toBeInTheDocument();
    expect(screen.getByLabelText('核心功能')).toBeInTheDocument();
    expect(screen.getByLabelText('升级方式')).toBeInTheDocument();
    expect(screen.getByLabelText('使用限制')).toBeInTheDocument();
    expect(screen.getByLabelText('隐藏真相')).toBeInTheDocument();
    expect(screen.queryByText('设定预览')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('能力来源'), { target: { value: '主角误入旧神遗迹后绑定残缺系统。' } });
    fireEvent.change(screen.getByLabelText('核心功能'), { target: { value: '吞噬遗物并提取其中的能力碎片。' } });
    fireEvent.change(screen.getByLabelText('升级方式'), { target: { value: '通过完成遗迹任务解锁新模块。' } });
    fireEvent.change(screen.getByLabelText('使用限制'), { target: { value: '短时间内吞噬过量会污染神魂。' } });
    fireEvent.change(screen.getByLabelText('隐藏真相'), { target: { value: '系统其实是旧神复苏前留下的筛选器。' } });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const cheatEntry = storedEntries.find((entry: { title: string }) => entry.title === '主角金手指/优势');
    const body = JSON.parse(cheatEntry.content).body;
    expect(body).toContain('【能力来源】：\n主角误入旧神遗迹后绑定残缺系统。');
    expect(body).toContain('【核心功能】：\n吞噬遗物并提取其中的能力碎片。');
    expect(body).toContain('【升级方式】：\n通过完成遗迹任务解锁新模块。');
    expect(body).toContain('【使用限制】：\n短时间内吞噬过量会污染神魂。');
    expect(body).toContain('【隐藏真相】：\n系统其实是旧神复苏前留下的筛选器。');
  });

  it('uses role-style tabs for righteous faction fixed, status, and confirmation settings', async () => {
    const storageKey = 'workbench-righteous-faction-structured-preview-test';
    const panelSource = await readWorkbenchLibraryPanelSource();
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'righteous-faction-1',
        tab: '大纲',
        title: '1号势力',
        content: JSON.stringify({ type: '正派势力', body: '' }),
        updatedAt: '2026/6/19 01:00:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '势力地图1' }));
    fireEvent.click(screen.getByRole('button', { name: '正派势力1' }));
    fireEvent.click(screen.getByText('1号势力').closest('button') as HTMLElement);

    expect(screen.getByRole('button', { name: '固定设定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '状态设定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确认' })).toBeInTheDocument();
    expect(screen.queryByText(/长期档案，智能导入时优先补全/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('势力名')).toHaveValue('1号势力');
    expect(screen.getByTestId('structured-title-field')).toContainElement(screen.getByLabelText('势力名'));
    expect(screen.getByTestId('structured-setting-fields')).not.toContainElement(screen.getByLabelText('势力名'));
    expect(screen.queryByText('设定名')).not.toBeInTheDocument();
    expect(panelSource).toContain("currentStructuredTitleFieldLabel ? 'px-5 py-3' : 'p-5'");
    expect(panelSource).toContain('className="relative flex h-[48px] w-[168px] shrink-0 items-center rounded-[20px] border-2 border-slate-950 bg-white px-4 py-0"');
    expect(panelSource).toContain('className={`h-7 w-full bg-transparent text-lg font-medium leading-7 text-slate-950 outline-none placeholder:text-slate-400');
    expect(panelSource).toContain('<div aria-hidden="true" className="h-9 w-[112px] shrink-0" />');
    expect(panelSource).toContain('{currentStructuredActiveGroup.title}共 {currentStructuredActiveGroupWordCount} 字');
    expect(panelSource).not.toContain('className={`h-full w-full bg-transparent text-xl font-black leading-7 text-slate-950 outline-none placeholder:text-slate-400');
    expect(panelSource).not.toContain('className="relative h-[54px] w-[168px] shrink-0 rounded-[22px] border-2 border-slate-950 bg-white px-4 pb-2 pt-4"');
    expect(screen.getByLabelText('基本信息')).toBeInTheDocument();
    expect(screen.getByLabelText('势力特点')).toBeInTheDocument();
    expect(screen.getByLabelText('组织架构')).toBeInTheDocument();
    expect(screen.getByLabelText('主要人物')).toBeInTheDocument();
    expect(screen.queryByLabelText('势力关系')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('势力名'), { target: { value: '青云宗' } });
    fireEvent.change(screen.getByLabelText('基本信息'), { target: { value: '青云宗，东洲正道宗门。' } });

    fireEvent.click(screen.getByRole('button', { name: '状态设定' }));
    expect(screen.queryByText(/智能更新时优先刷新这一侧/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('势力关系')).toBeInTheDocument();
    expect(screen.getByLabelText('对主角策略')).toBeInTheDocument();
    expect(screen.getByLabelText('核心问题/矛盾')).toBeInTheDocument();
    expect(screen.queryByLabelText('基本信息')).not.toBeInTheDocument();
    expect(screen.queryByText('设定预览')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('势力关系'), { target: { value: '暂时与主角合作，暗中防备魔道。' } });
    fireEvent.change(screen.getByLabelText('对主角策略'), { target: { value: '先保护主角，再观察其金手指来源。' } });
    fireEvent.change(screen.getByLabelText('核心问题/矛盾'), { target: { value: '内部长老对是否支持主角存在分歧。' } });

    fireEvent.click(screen.getByRole('button', { name: '确认' }));
    expect(screen.getByText('确认更新')).toBeInTheDocument();
    expect(screen.getByText(/AI 反馈进入确认区后/)).toBeInTheDocument();

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const factionEntry = storedEntries.find((entry: { title: string }) => entry.title === '青云宗');
    const body = JSON.parse(factionEntry.content).body;
    expect(body).toContain('【基本信息】：\n青云宗，东洲正道宗门。');
    expect(body).toContain('【势力关系】：\n暂时与主角合作，暗中防备魔道。');
    expect(body).toContain('【对主角策略】：\n先保护主角，再观察其金手指来源。');
    expect(body).toContain('【核心问题/矛盾】：\n内部长老对是否支持主角存在分歧。');
  });

  it('uses dedicated structured templates for world maps and danger zones', async () => {
    const storageKey = 'workbench-world-map-danger-zone-structured-template-test';
    const panelSource = await readWorkbenchLibraryPanelSource();
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'world-map-1',
        tab: '大纲',
        title: '东洲全图',
        content: JSON.stringify({ type: '世界地图', body: '' }),
        updatedAt: '2026/6/22 02:00:00',
      },
      {
        id: 'danger-zone-1',
        tab: '大纲',
        title: '危险区域',
        content: JSON.stringify({ type: '世界地图', body: '' }),
        updatedAt: '2026/6/22 02:10:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    expect(panelSource).toContain("id: 'faction-world-map'");
    expect(panelSource).toContain("entryType: '世界地图'");
    expect(panelSource).toContain("titleFieldLabel: '地图名'");
    expect(panelSource).toContain("fieldKeys: ['mapOverview', 'regionDivision', 'factionDistribution', 'resourceDistribution', 'geographyRules']");
    expect(panelSource).toContain("title: '世界架构'");
    expect(panelSource).toContain("title: '区域划分'");
    expect(panelSource).toContain("title: '势力分布'");
    expect(panelSource).toContain("title: '资源分布'");
    expect(panelSource).toContain("title: '世界规则'");
    expect(panelSource).not.toContain("key: 'trafficRoutes'");
    expect(panelSource).not.toContain("title: '交通路线'");
    expect(panelSource).toContain("title: '主角已知范围'");
    expect(panelSource).toContain("id: 'faction-danger-zone'");
    expect(panelSource).toContain("entryType: '世界地图'");
    expect(panelSource).toContain("titleFieldLabel: '区域名'");
    expect(panelSource).toContain("title: '区域概况'");
    expect(panelSource).toContain("title: '危险来源'");
    expect(panelSource).toContain("title: '进入条件'");
    expect(panelSource).toContain("title: '资源收益'");
    expect(panelSource).toContain("title: '核心规则'");
    expect(panelSource).toContain("title: '探索进度'");
    expect(panelSource).toContain("title: '外部势力介入'");

    fireEvent.click(screen.getByRole('button', { name: '势力地图2' }));
    fireEvent.click(screen.getByRole('button', { name: '世界地图2' }));
    fireEvent.click(screen.getByText('东洲全图').closest('button') as HTMLElement);

    expect(screen.getByTestId('structured-title-field')).toContainElement(screen.getByLabelText('地图名'));
    expect(screen.getByLabelText('地图名')).toHaveValue('东洲全图');
    expect(screen.getByRole('button', { name: '固定设定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '状态设定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确认' })).toBeInTheDocument();
    expect(screen.getByLabelText('世界架构')).toBeInTheDocument();
    expect(screen.getByLabelText('区域划分')).toBeInTheDocument();
    expect(screen.getByLabelText('势力分布')).toBeInTheDocument();
    expect(screen.getByLabelText('资源分布')).toBeInTheDocument();
    expect(screen.getByLabelText('世界规则')).toBeInTheDocument();
    expect(screen.queryByLabelText('交通路线')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '状态设定' }));
    expect(screen.getByLabelText('当前局势')).toBeInTheDocument();
    expect(screen.getByLabelText('封锁/开放')).toBeInTheDocument();
    expect(screen.getByLabelText('主角已知范围')).toBeInTheDocument();
    expect(screen.getByLabelText('近期变化')).toBeInTheDocument();

    fireEvent.click(screen.getByText('危险区域').closest('button') as HTMLElement);

    expect(screen.getByTestId('structured-title-field')).toContainElement(screen.getByLabelText('区域名'));
    expect(screen.getByLabelText('区域名')).toHaveValue('危险区域');
    fireEvent.click(screen.getByRole('button', { name: '固定设定' }));
    expect(screen.getByLabelText('区域概况')).toBeInTheDocument();
    expect(screen.getByLabelText('危险来源')).toBeInTheDocument();
    expect(screen.getByLabelText('进入条件')).toBeInTheDocument();
    expect(screen.getByLabelText('资源收益')).toBeInTheDocument();
    expect(screen.getByLabelText('历史背景')).toBeInTheDocument();
    expect(screen.getByLabelText('核心规则')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '状态设定' }));
    expect(screen.getByLabelText('当前状态')).toBeInTheDocument();
    expect(screen.getByLabelText('探索进度')).toBeInTheDocument();
    expect(screen.getByLabelText('风险变化')).toBeInTheDocument();
    expect(screen.getByLabelText('资源剩余')).toBeInTheDocument();
    expect(screen.getByLabelText('已触发事件')).toBeInTheDocument();
    expect(screen.getByLabelText('外部势力介入')).toBeInTheDocument();
  });

  it('adds monster bestiary as a structured setting workspace', async () => {
    const storageKey = 'workbench-monster-bestiary-structured-preview-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'monster-bestiary-1',
        tab: '大纲',
        title: '黑鳞妖狼',
        content: JSON.stringify({ type: '怪物列表', body: '' }),
        updatedAt: '2026/6/22 01:00:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '怪物图鉴1' }));
    fireEvent.click(screen.getByRole('button', { name: '怪物列表1' }));
    fireEvent.click(screen.getByText('黑鳞妖狼').closest('button') as HTMLElement);

    expect(screen.getByTestId('structured-title-field')).toContainElement(screen.getByLabelText('怪物名'));
    expect(screen.getByLabelText('怪物名')).toHaveValue('黑鳞妖狼');
    expect(screen.queryByRole('button', { name: '固定设定' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '状态设定' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '确认' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('怪物形象')).toBeInTheDocument();
    expect(screen.getByLabelText('怪物能力')).toBeInTheDocument();
    expect(screen.getByLabelText('怪物背景')).toBeInTheDocument();
    expect(screen.getByLabelText('怪物弱点')).toBeInTheDocument();
    expect(screen.getByLabelText('出没位置')).toBeInTheDocument();
    expect(screen.getByLabelText('掉落/资源')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('怪物形象'), { target: { value: '黑鳞覆背，额头有银色竖纹。' } });
    fireEvent.change(screen.getByLabelText('怪物能力'), { target: { value: '夜间群猎，速度极快，擅长围杀。' } });
    fireEvent.change(screen.getByLabelText('怪物背景'), { target: { value: '三阶妖狼，首次出现在黑松岭。' } });
    fireEvent.change(screen.getByLabelText('怪物弱点'), { target: { value: '惧火，腹部鳞片较薄。' } });
    fireEvent.change(screen.getByLabelText('出没位置'), { target: { value: '第十二章追踪主角至山谷。' } });
    fireEvent.change(screen.getByLabelText('掉落/资源'), { target: { value: '妖丹、黑鳞、狼牙。' } });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const monsterEntry = storedEntries.find((entry: { title: string }) => entry.title === '黑鳞妖狼');
    const body = JSON.parse(monsterEntry.content).body;
    expect(body).toContain('【怪物形象】：\n黑鳞覆背，额头有银色竖纹。');
    expect(body).toContain('【怪物能力】：\n夜间群猎，速度极快，擅长围杀。');
    expect(body).toContain('【怪物背景】：\n三阶妖狼，首次出现在黑松岭。');
    expect(body).toContain('【怪物弱点】：\n惧火，腹部鳞片较薄。');
    expect(body).toContain('【出没位置】：\n第十二章追踪主角至山谷。');
    expect(body).toContain('【掉落/资源】：\n妖丹、黑鳞、狼牙。');
  });

  it('splits item equipment preview into the approved resource fields', async () => {
    const storageKey = 'workbench-item-equipment-structured-preview-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'item-equipment',
        tab: '大纲',
        title: '玄青药鼎',
        content: JSON.stringify({ type: '物品装备', body: '' }),
        updatedAt: '2026/6/19 01:00:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '道具资源1' }));
    fireEvent.click(screen.getByRole('button', { name: '物品装备1' }));
    fireEvent.click(screen.getByText('玄青药鼎').closest('button') as HTMLElement);

    expect(screen.getByDisplayValue('玄青药鼎')).toBeInTheDocument();
    expect(screen.getByLabelText('基本信息')).toBeInTheDocument();
    expect(screen.getByLabelText('物品描述')).toBeInTheDocument();
    expect(screen.getByLabelText('效果/功能')).toBeInTheDocument();
    expect(screen.getByLabelText('来历')).toBeInTheDocument();
    expect(screen.getByLabelText('归属变化')).toBeInTheDocument();
    expect(screen.getByLabelText('当前状态')).toBeInTheDocument();
    expect(screen.getByLabelText('相关伏笔')).toBeInTheDocument();
    expect(screen.queryByText('设定预览')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('基本信息'), { target: { value: '法宝，玄阶上品，第三章初次登场。' } });
    fireEvent.change(screen.getByLabelText('物品描述'), { target: { value: '青铜小鼎，鼎身有裂纹和云纹。' } });
    fireEvent.change(screen.getByLabelText('效果/功能'), { target: { value: '可炼化灵草并短暂压制魔气。' } });
    fireEvent.change(screen.getByLabelText('来历'), { target: { value: '来自上古药宗遗址，是宗门叛徒偷出的残器。' } });
    fireEvent.change(screen.getByLabelText('归属变化'), { target: { value: '先由反派持有，后被主角夺回。' } });
    fireEvent.change(screen.getByLabelText('当前状态'), { target: { value: '主角持有，器灵沉睡，裂纹未修复。' } });
    fireEvent.change(screen.getByLabelText('相关伏笔'), { target: { value: '鼎底残符指向药宗真正传承地。' } });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const itemEntry = storedEntries.find((entry: { title: string }) => entry.title === '玄青药鼎');
    const body = JSON.parse(itemEntry.content).body;
    expect(body).toContain('【基本信息】：\n法宝，玄阶上品，第三章初次登场。');
    expect(body).toContain('【物品描述】：\n青铜小鼎，鼎身有裂纹和云纹。');
    expect(body).toContain('【效果/功能】：\n可炼化灵草并短暂压制魔气。');
    expect(body).toContain('【来历】：\n来自上古药宗遗址，是宗门叛徒偷出的残器。');
    expect(body).toContain('【归属变化】：\n先由反派持有，后被主角夺回。');
    expect(body).toContain('【当前状态】：\n主角持有，器灵沉睡，裂纹未修复。');
    expect(body).toContain('【相关伏笔】：\n鼎底残符指向药宗真正传承地。');
  });

  it('splits ability settings into fixed settings, status settings, and confirmation tabs', async () => {
    const storageKey = 'workbench-item-ability-structured-preview-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'item-ability',
        tab: '大纲',
        title: '玄雷步',
        content: JSON.stringify({ type: '功法能力', body: '' }),
        updatedAt: '2026/6/22 23:10:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '道具资源1' }));
    fireEvent.click(screen.getByRole('button', { name: '功法能力1' }));
    fireEvent.click(screen.getByText('玄雷步').closest('button') as HTMLElement);

    expect(screen.getByRole('button', { name: '固定设定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '状态设定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确认' })).toBeInTheDocument();
    expect(screen.getByLabelText('基本信息')).toBeInTheDocument();
    expect(screen.getByLabelText('能力来源')).toBeInTheDocument();
    expect(screen.getByLabelText('核心效果')).toBeInTheDocument();
    expect(screen.getByLabelText('修炼/升级')).toBeInTheDocument();
    expect(screen.getByLabelText('使用限制')).toBeInTheDocument();
    expect(screen.getByLabelText('相关伏笔')).toBeInTheDocument();
    expect(screen.queryByText('功法能力的长期规则，记录来源、核心效果、成长方式、限制和伏笔。')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '状态设定' }));
    expect(screen.getByLabelText('当前熟练度')).toBeInTheDocument();
    expect(screen.getByLabelText('当前突破')).toBeInTheDocument();
    expect(screen.getByLabelText('受损/封印')).toBeInTheDocument();
    expect(screen.getByLabelText('暴露程度')).toBeInTheDocument();
    expect(screen.getByLabelText('冷却/代价')).toBeInTheDocument();
    expect(screen.getByLabelText('最近使用')).toBeInTheDocument();
    expect(screen.queryByText('章节推进后会变化，AI 更新时只刷新熟练度、突破、受损封印、暴露程度、代价和最近使用。')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '确认' }));
    expect(screen.getByText('确认更新')).toBeInTheDocument();
    expect(screen.getByText(/确认后才写入状态设定/)).toBeInTheDocument();
  });

  it('keeps resource currency as fixed structured settings without status or confirm tabs', async () => {
    const storageKey = 'workbench-resource-currency-structured-preview-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'resource-currency',
        tab: '大纲',
        title: '灵石体系',
        content: JSON.stringify({ type: '资源货币', body: '' }),
        updatedAt: '2026/6/22 22:30:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '道具资源1' }));
    fireEvent.click(screen.getByRole('button', { name: '资源货币1' }));
    fireEvent.click(screen.getByText('灵石体系').closest('button') as HTMLElement);

    expect(screen.getByDisplayValue('灵石体系')).toBeInTheDocument();
    expect(screen.getByLabelText('基本信息')).toBeInTheDocument();
    expect(screen.getByLabelText('价值等级')).toBeInTheDocument();
    expect(screen.getByLabelText('获取渠道')).toBeInTheDocument();
    expect(screen.getByLabelText('消耗用途')).toBeInTheDocument();
    expect(screen.getByLabelText('流通限制')).toBeInTheDocument();
    expect(screen.getByLabelText('关联规则')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '固定设定' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '状态设定' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '确认' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('当前库存')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('债务关系')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('基本信息'), { target: { value: '灵石是修行界通用资源。' } });
    fireEvent.change(screen.getByLabelText('价值等级'), { target: { value: '一枚中品灵石可换一百枚下品灵石。' } });
    fireEvent.change(screen.getByLabelText('获取渠道'), { target: { value: '矿脉、任务、宗门俸禄和黑市交易。' } });
    fireEvent.change(screen.getByLabelText('消耗用途'), { target: { value: '修炼、炼器、阵法、传送和购买情报。' } });
    fireEvent.change(screen.getByLabelText('流通限制'), { target: { value: '边境城只认下品灵石，黑市交易抽成。' } });
    fireEvent.change(screen.getByLabelText('关联规则'), { target: { value: '矿脉枯竭会推高边境灵石价格。' } });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const resourceEntry = storedEntries.find((entry: { title: string }) => entry.title === '灵石体系');
    const body = JSON.parse(resourceEntry.content).body;
    expect(body).toContain('【基本信息】：\n灵石是修行界通用资源。');
    expect(body).toContain('【价值等级】：\n一枚中品灵石可换一百枚下品灵石。');
    expect(body).toContain('【获取渠道】：\n矿脉、任务、宗门俸禄和黑市交易。');
    expect(body).toContain('【消耗用途】：\n修炼、炼器、阵法、传送和购买情报。');
    expect(body).toContain('【流通限制】：\n边境城只认下品灵石，黑市交易抽成。');
    expect(body).toContain('【关联规则】：\n矿脉枯竭会推高边境灵石价格。');
    expect(body).not.toContain('【当前库存】');
    expect(body).not.toContain('【债务关系】');
  });

  it('splits special resources into fixed settings, status settings, and confirmation tabs', async () => {
    const storageKey = 'workbench-special-resource-structured-preview-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'special-resource',
        tab: '大纲',
        title: '龙脉权限',
        content: JSON.stringify({ type: '特殊资源', body: '' }),
        updatedAt: '2026/6/22 22:31:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '道具资源1' }));
    fireEvent.click(screen.getByRole('button', { name: '特殊资源1' }));
    fireEvent.click(screen.getByText('龙脉权限').closest('button') as HTMLElement);

    expect(screen.getByRole('button', { name: '固定设定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '状态设定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确认' })).toBeInTheDocument();
    expect(screen.getByLabelText('基本信息')).toBeInTheDocument();
    expect(screen.getByLabelText('获取条件')).toBeInTheDocument();
    expect(screen.getByLabelText('使用规则')).toBeInTheDocument();
    expect(screen.getByLabelText('权限边界')).toBeInTheDocument();
    expect(screen.getByLabelText('失效条件')).toBeInTheDocument();
    expect(screen.getByLabelText('主线关联')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '状态设定' }));
    expect(screen.getByLabelText('当前归属')).toBeInTheDocument();
    expect(screen.getByLabelText('可用状态')).toBeInTheDocument();
    expect(screen.getByLabelText('剩余次数')).toBeInTheDocument();
    expect(screen.getByLabelText('竞争风险')).toBeInTheDocument();
    expect(screen.getByLabelText('激活进度')).toBeInTheDocument();
    expect(screen.getByLabelText('最近触发')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '确认' }));
    expect(screen.getByText('确认更新')).toBeInTheDocument();
    expect(screen.getByText(/确认后才写入状态设定/)).toBeInTheDocument();
  });

  it('keeps structured setting group tabs aligned with role editor styling and smaller placeholders', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(panelSource).toContain("const STRUCTURED_SETTING_TABS = ['固定设定', '状态设定', '确认'] as const;");
    expect(panelSource).toContain('activeStructuredSettingTab');
    expect(panelSource).toContain('function SettingSegmentedTabs<T extends string>');
    expect(panelSource).toContain("const SETTING_SEGMENTED_TAB_GROUP_CLASS = 'flex h-10 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white';");
    expect(panelSource).toContain("const SETTING_SEGMENTED_TAB_ACTIVE_CLASS = 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE]';");
    expect(panelSource).toContain("const SETTING_SEGMENTED_TAB_IDLE_CLASS = 'bg-white text-slate-600 hover:bg-[#EAF9FD] hover:text-[#078FAE]';");
    expect(panelSource).toContain('onChange={setActiveStructuredSettingTab}');
    expect(panelSource).toContain("activeStructuredSettingTab === '确认'");
    expect(panelSource).not.toContain('{activeGroup.description}');
    expect(panelSource).not.toContain('currentStructuredSettingFieldSet.groups.map((group)');
    expect(panelSource).not.toContain("'border-slate-950 bg-slate-950 text-white'");
    expect(panelSource).not.toContain("'border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:text-cyan-700'");
    expect(panelSource).toContain('xy-structured-setting-field');
    expect(styleSource).toContain('.xy-floating-field.xy-structured-setting-field textarea::placeholder');
    expect(styleSource).toContain('font-size: 0.8125rem;');
  });

  it('splits plot planning previews into blueprint, volume, and payoff fields', async () => {
    const storageKey = 'workbench-plot-planning-structured-preview-test';
    const panelSource = await readWorkbenchLibraryPanelSource();
    const blueprintSetStart = panelSource.indexOf("id: 'work-plot-blueprint'");
    const blueprintSetEnd = panelSource.indexOf("id: 'work-plot-volume'", blueprintSetStart);
    const blueprintSetSource = panelSource.slice(blueprintSetStart, blueprintSetEnd);

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '剧情规划3' }));

    fireEvent.click(screen.getByText('剧情蓝图').closest('button') as HTMLElement);
    expect(screen.getByLabelText('整体规划')).toBeInTheDocument();
    expect(screen.getByLabelText('主线目标')).toBeInTheDocument();
    expect(screen.getByLabelText('阶段节奏')).toBeInTheDocument();
    expect(blueprintSetSource).toContain("gridColumnsClassName: 'grid-cols-2'");
    expect(blueprintSetSource).not.toContain("gridColumnsClassName: 'grid-cols-3'");
    fireEvent.change(screen.getByLabelText('整体规划'), { target: { value: '全书三卷，一百万字。' } });
    fireEvent.change(screen.getByLabelText('主线目标'), { target: { value: '主角推翻旧天庭。' } });
    fireEvent.change(screen.getByLabelText('阶段节奏'), { target: { value: '前期求生，中期扩张，后期决战。' } });

    fireEvent.click(screen.getByText('分卷剧情').closest('button') as HTMLElement);
    expect(screen.getByLabelText('分卷总览')).toBeInTheDocument();
    expect(screen.getByLabelText('卷核心事件')).toBeInTheDocument();
    expect(screen.getByLabelText('卷末高潮')).toBeInTheDocument();
    expect(screen.getByLabelText('下一卷钩子')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('分卷总览'), { target: { value: '第一卷凡界崛起。' } });
    fireEvent.change(screen.getByLabelText('卷核心事件'), { target: { value: '主角夺回祖地。' } });
    fireEvent.change(screen.getByLabelText('卷末高潮'), { target: { value: '宗门大比反杀。' } });
    fireEvent.change(screen.getByLabelText('下一卷钩子'), { target: { value: '通往上界的钥匙出现。' } });

    fireEvent.click(screen.getByText('爽点设计').closest('button') as HTMLElement);
    expect(screen.getByLabelText('核心爽点类型')).toBeInTheDocument();
    expect(screen.getByLabelText('打脸对象设计')).toBeInTheDocument();
    expect(screen.getByLabelText('爽点公式')).toBeInTheDocument();
    expect(screen.getByLabelText('爽点节奏')).toBeInTheDocument();
    expect(screen.queryByText('设定预览')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('核心爽点类型'), { target: { value: '升级、反杀、打脸。' } });
    fireEvent.change(screen.getByLabelText('打脸对象设计'), { target: { value: '看不起主角的宗门长老。' } });
    fireEvent.change(screen.getByLabelText('爽点公式'), { target: { value: '误判主角实力，公开挑衅，被当场反杀。' } });
    fireEvent.change(screen.getByLabelText('爽点节奏'), { target: { value: '每三章一个小回报，每卷一个大爆点。' } });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const blueprintBody = JSON.parse(storedEntries.find((entry: { title: string }) => entry.title === '剧情蓝图').content).body;
    const volumeBody = JSON.parse(storedEntries.find((entry: { title: string }) => entry.title === '分卷剧情').content).body;
    const payoffBody = JSON.parse(storedEntries.find((entry: { title: string }) => entry.title === '爽点设计').content).body;
    expect(blueprintBody).toContain('【整体规划】：\n全书三卷，一百万字。');
    expect(blueprintBody).toContain('【主线目标】：\n主角推翻旧天庭。');
    expect(blueprintBody).toContain('【阶段节奏】：\n前期求生，中期扩张，后期决战。');
    expect(volumeBody).toContain('【分卷总览】：\n第一卷凡界崛起。');
    expect(volumeBody).toContain('【卷核心事件】：\n主角夺回祖地。');
    expect(volumeBody).toContain('【卷末高潮】：\n宗门大比反杀。');
    expect(volumeBody).toContain('【下一卷钩子】：\n通往上界的钥匙出现。');
    expect(payoffBody).toContain('【核心爽点类型】：\n升级、反杀、打脸。');
    expect(payoffBody).toContain('【打脸对象设计】：\n看不起主角的宗门长老。');
    expect(payoffBody).toContain('【爽点公式】：\n误判主角实力，公开挑衅，被当场反杀。');
    expect(payoffBody).toContain('【爽点节奏】：\n每三章一个小回报，每卷一个大爆点。');
  });

  it('keeps structured plot planning fields after renaming a custom structured setting entry', async () => {
    const storageKey = 'workbench-structured-setting-fields-survive-rename-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'custom-structured-blueprint',
        tab: '大纲',
        title: '剧情蓝图总表',
        content: JSON.stringify({
          type: '剧情规划',
          body: '',
          structuredFieldSetId: 'work-plot-blueprint',
        }),
        updatedAt: '2026/6/19 00:10:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '剧情规划1' }));
    fireEvent.click(screen.getByText('剧情蓝图总表').closest('button') as HTMLElement);
    fireEvent.change(screen.getByLabelText('整体规划'), { target: { value: '全书三卷，一百万字。' } });

    fireEvent.change(screen.getByDisplayValue('剧情蓝图总表'), { target: { value: '完整剧情蓝图' } });

    expect(screen.getByLabelText('整体规划')).toBeInTheDocument();
    expect(screen.getByLabelText('整体规划')).toHaveValue('全书三卷，一百万字。');
    expect(screen.getByLabelText('主线目标')).toBeInTheDocument();
    expect(screen.getByLabelText('阶段节奏')).toBeInTheDocument();
    expect(screen.queryByText('设定预览')).not.toBeInTheDocument();

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const renamedEntry = storedEntries.find((entry: { title: string }) => entry.title === '完整剧情蓝图');
    expect(renamedEntry).toBeTruthy();
    const renamedSetting = JSON.parse(renamedEntry.content);
    expect(renamedSetting.structuredFieldSetId).toBe('work-plot-blueprint');
    expect(renamedSetting.body).toContain('【整体规划】：\n全书三卷，一百万字。');
  });

  it('recovers structured fields for custom entries when their body already has matching section titles', async () => {
    const storageKey = 'workbench-structured-setting-fields-recover-custom-entry-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'custom-body-blueprint',
        tab: '大纲',
        title: '剧情蓝图总表',
        content: JSON.stringify({
          type: '剧情规划',
          body: '【整体规划】：\n全书三卷，一百万字。\n\n【主线目标】：\n主角推翻旧天庭。\n\n【阶段节奏】：\n前期求生，中期扩张，后期决战。',
        }),
        updatedAt: '2026/6/19 00:10:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '剧情规划1' }));
    fireEvent.click(screen.getByText('剧情蓝图总表').closest('button') as HTMLElement);

    expect(screen.getByLabelText('整体规划')).toHaveValue('全书三卷，一百万字。');
    expect(screen.getByLabelText('主线目标')).toHaveValue('主角推翻旧天庭。');
    expect(screen.getByLabelText('阶段节奏')).toHaveValue('前期求生，中期扩张，后期决战。');
    expect(screen.queryByText('设定预览')).not.toBeInTheDocument();
  });

  it('uses gray placeholder prompts for structured setting fields without saving them as content', async () => {
    const storageKey = 'workbench-structured-setting-field-placeholder-test';

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '剧情规划3' }));

    fireEvent.click(screen.getByText('剧情蓝图').closest('button') as HTMLElement);
    expect(screen.getByLabelText('整体规划')).toHaveAttribute('placeholder', '预计总字数、共几卷、故事从哪里开始到哪里结束。');
    expect(screen.getByLabelText('整体规划').closest('.xy-floating-field')).toHaveClass('xy-floating-visible-placeholder');
    expect(screen.getByLabelText('主线目标')).toHaveAttribute('placeholder', '主角长期要完成的大目标。');
    expect(screen.getByLabelText('阶段节奏')).toHaveAttribute('placeholder', '前期、中期、后期分别推进什么内容。');

    fireEvent.click(screen.getByText('分卷剧情').closest('button') as HTMLElement);
    expect(screen.getByLabelText('分卷总览')).toHaveAttribute('placeholder', '每一卷的卷名、字数、核心阶段和主要任务。');
    expect(screen.getByLabelText('卷核心事件')).toHaveAttribute('placeholder', '这一卷最重要的剧情事件和冲突推进。');

    fireEvent.click(screen.getByText('爽点设计').closest('button') as HTMLElement);
    expect(screen.getByLabelText('爽点公式')).toHaveAttribute('placeholder', '主角想法、实际行动、结果、配角反应、主角内心反应。');

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const blueprintBody = JSON.parse(storedEntries.find((entry: { title: string }) => entry.title === '剧情蓝图').content).body;
    expect(blueprintBody).not.toContain('预计总字数');
  });

  it('removes old empty auto-created faction item and location entries without removing user content', async () => {
    const storageKey = 'workbench-clear-old-auto-domain-setting-items-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, '2026-06-17-setting-starter-empty-body-v3');
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'old-auto-faction',
        tab: '大纲',
        title: '正派势力',
        content: JSON.stringify({ type: '正派势力', body: '' }),
        updatedAt: '2026/6/17 10:00:00',
      },
      {
        id: 'old-auto-item',
        tab: '大纲',
        title: '功法能力',
        content: JSON.stringify({ type: '功法能力', body: '' }),
        updatedAt: '2026/6/17 10:01:00',
      },
      {
        id: 'old-auto-location',
        tab: '大纲',
        title: '世界地图',
        content: JSON.stringify({ type: '世界地图', body: '' }),
        updatedAt: '2026/6/17 10:02:00',
      },
      {
        id: 'user-faction',
        tab: '大纲',
        title: '正派势力',
        content: JSON.stringify({ type: '正派势力', body: '这是我自己写的正派势力。' }),
        updatedAt: '2026/6/17 10:03:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    expect(storedEntries.some((entry: { id: string }) => entry.id === 'old-auto-faction')).toBe(false);
    expect(storedEntries.some((entry: { id: string }) => entry.id === 'old-auto-item')).toBe(false);
    expect(storedEntries.some((entry: { id: string }) => entry.id === 'old-auto-location')).toBe(false);
    const userFactionEntry = storedEntries.find((entry: { id: string }) => entry.id === 'user-faction');
    expect(JSON.parse(userFactionEntry.content).body).toBe('这是我自己写的正派势力。');
  });

  it('clears old default filling instructions without touching user setting content', async () => {
    const storageKey = 'workbench-clear-old-default-setting-instructions-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, '2026-06-16-setting-starter-v2');
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'old-default-positioning',
        tab: '大纲',
        title: '作品定位',
        content: JSON.stringify({
          type: '核心设定',
          body: '填写说明：记录题材、风格、目标读者、主打体验和整体卖点，让 AI 明白这本书要给读者什么感觉。',
        }),
        updatedAt: '2026/6/16 20:00:00',
      },
      {
        id: 'user-positioning',
        tab: '大纲',
        title: '作品定位',
        content: JSON.stringify({
          type: '核心设定',
          body: '这是我自己写的作品定位。',
        }),
        updatedAt: '2026/6/16 20:01:00',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const oldDefaultEntry = storedEntries.find((entry: { id: string }) => entry.id === 'old-default-positioning');
    const userEntry = storedEntries.find((entry: { id: string }) => entry.id === 'user-positioning');
    expect(oldDefaultEntry).toBeUndefined();
    expect(JSON.parse(userEntry.content).body).toBe('这是我自己写的作品定位。');
  });

  it('removes the role editor delete button because protagonist settings are renamed instead of deleted', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const propsStart = panelSource.indexOf('type RoleBaseStateEditorProps = {');
    const propsEnd = panelSource.indexOf('function RoleBaseStateEditor', propsStart);
    const editorStart = propsEnd;
    const editorEnd = panelSource.indexOf('<section className=', editorStart);
    const propsSource = panelSource.slice(propsStart, propsEnd);
    const editorHeaderSource = panelSource.slice(editorStart, editorEnd);

    expect(propsSource).not.toContain('deleteUnlocked');
    expect(propsSource).not.toContain('onDelete');
    expect(propsSource).not.toContain('onToggleDeleteUnlocked');
    expect(editorHeaderSource).not.toContain('删除');
    expect(editorHeaderSource).not.toContain('onDelete();');
    expect(editorHeaderSource).not.toContain('onToggleDeleteUnlocked();');
  });

  it('keeps outline work settings and character settings as a left sidebar scope switch', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain("const [outlineSettingScope, setOutlineSettingScope] = useState<'work' | 'character'>('work')");
    expect(panelSource).not.toContain('{false && activeTab === SETTING_TAB');
    expect(panelSource).toContain('const visibleWorkSettingCount = settingEntries.filter');
    expect(panelSource).toContain('const visibleRoleCount = roleEntries.filter');
    expect(panelSource).toContain("{ id: 'work', label: '作品设定', count: visibleWorkSettingCount, type: null }");
    expect(panelSource).toContain("{ id: 'character', label: '人物设定', count: visibleRoleCount, type: null }");
    expect(panelSource).toContain('settingWorkspaceTopTabs');
    expect(panelSource).toContain("const effectiveLibraryTab = isOutlineCharacterScope ? ROLE_TAB : activeTab");
    expect(panelSource).toContain("const activeSettingTypeOptions = activeIsBrainstorm ? [BRAINSTORM_TYPE] : isOutlineCharacterScope ? roleTypeOptions : settingTypeOptions");
    expect(panelSource).toContain("{isOutlineCharacterScope ? '角色' : '设定'}");
    expect(panelSource).toContain("addRole(selectedCreateType, { switchToRoleTab: false, title: createTitle })");
    expect(panelSource).toContain('<RoleBaseStateEditor');
    expect(panelSource).toContain('baseSetting: string;');
    expect(panelSource).toContain('stateSettings: RoleStateSettings;');
    expect(panelSource).toContain('>基础设定<');
    expect(panelSource).toContain('>状态设定<');
    expect(panelSource).toContain("style={{ fontSize: roleTextFontSize }}");
  });

  it('moves setting page scheme A into the production red-frame area without replacing the right AI panel', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContain("const [outlineSettingDomain, setOutlineSettingDomain] = useState('work')");
    expect(panelSource).toContain('const settingWorkspaceDomainTabs = [');
    expect(panelSource).toContain("{ id: 'work', label: '作品设定', count: visibleWorkSettingCount, type: null }");
    expect(panelSource).toContain("{ id: 'character', label: '人物设定', count: visibleRoleCount, type: null }");
    expect(panelSource).toContain("{ id: 'setting:faction', label: '势力地图', type: 'setting:faction' }");
    expect(panelSource).toContain("{ id: 'setting:item', label: '道具资源', type: 'setting:item' }");
    expect(panelSource).toContain("{ id: 'setting:monster', label: '怪物图鉴', type: 'setting:monster' }");
    expect(panelSource).not.toContain("label: '地点场景'");
    expect(panelSource).toContain("{ id: 'setting:foreshadow', label: '伏笔线索', type: 'setting:foreshadow' }");
    expect(panelSource).not.toContain("{ id: 'setting:rule', label: '书写规则', type: 'setting:rule' }");
    expect(panelSource).toContain("gridTemplateRows: activeTab === SETTING_TAB && !activeIsBrainstorm ? 'auto minmax(0,1fr)' : undefined");
    expect(panelSource).toContain("gridColumn: '1 / 4'");
    expect(panelSource).toContain('settingWorkspaceTopTabs');
    expect(panelSource).toContain('getSettingTypeWorkspaceDomain(type) === activeSettingWorkspaceDomain');
    expect(panelSource).toContain("const selectedSettingWorkspaceType = getSelectedSettingWorkspaceType();");
    expect(panelSource).toContain("rightResizeHandle");
    expect(panelSource).toContain("CombinedAiConfigSelect");
  });

  it('migrates the approved setting taxonomy into the production setting library', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const settingTypeOptionsStart = panelSource.indexOf('const settingTypeOptions = useMemo(() => {');
    const settingTypeOptionsEnd = panelSource.indexOf('const clearSettingsTargetMeta', settingTypeOptionsStart);
    const settingTypeOptionsSource = panelSource.slice(settingTypeOptionsStart, settingTypeOptionsEnd);

    expect(panelSource).toContain("const DEFAULT_WORK_SETTING_TYPES = ['核心设定', '剧情规划', '书写规则'];");
    expect(panelSource).toContain("'setting:faction': ['正派势力', '反派势力', '中立势力', '其他势力', '世界地图']");
    expect(panelSource).toContain("'setting:item': ['功法能力', '物品装备', '资源货币', '特殊资源']");
    expect(panelSource).toContain("'setting:monster': ['怪物列表']");
    expect(panelSource).not.toContain("'setting:location': ['世界地图', '危险区域']");
    expect(panelSource).toContain("'setting:foreshadow': ['主线伏笔', '人物伏笔', '已回收伏笔']");
    expect(panelSource).not.toContain("'setting:rule': ['硬规则', '禁写规则']");
    expect(panelSource).toContain('const DEFAULT_SETTING_ENTRY_TYPE = DEFAULT_SETTING_TYPES[0] ?? UNCATEGORIZED_TYPE;');
    expect(settingTypeOptionsSource).toContain('return merged;');
    expect(settingTypeOptionsSource).not.toContain('return [...merged, UNCATEGORIZED_TYPE];');
    expect(panelSource).not.toContain("if (type === '主线剧情') return '剧情规划';");
    expect(panelSource).not.toContain("if (type === '道具资源') return '物品装备';");
    expect(panelSource).not.toContain("if (type === '妖兽图鉴' || type === '异兽图鉴'");
    expect(panelSource).not.toContain("if (type === '危险区域') return '世界地图';");
    expect(panelSource).toContain("if (/(世界|规则|背景|科技|修炼|社会秩序|限制条件|天道|能量)/.test(source)) return '核心设定';");
    expect(panelSource).toContain("if (/(主线|剧情|任务|目标|冲突|开局|转折|高潮|结局|章节|卷|事件)/.test(source)) return '剧情规划';");
    expect(panelSource).toContain("if (/(功法|能力|技能|神通|法术|异能|招式)/.test(source)) return '功法能力';");
    expect(panelSource).toContain("if (/(道具|装备|物品|法宝|武器|载具|机甲)/.test(source)) return '物品装备';");
    expect(panelSource).toContain("if (/(妖兽|怪兽|怪物|魔兽|异兽|凶兽|灵兽|灵宠|邪祟|兽潮|妖丹|兽骨|鳞甲|毒囊)/.test(source)) return '怪物列表';");
    expect(panelSource).toContain("if (/(禁区|危险|秘境|遗迹|灾区|战场|污染区)/.test(source)) return '世界地图';");
    expect(panelSource).toContain("if (/(地点|地图|交通|地域|地理|重要地点|世界地图)/.test(source)) return '世界地图';");
    expect(panelSource).toContain("if (/(禁写|不能写错|不能越界|硬约束|前后矛盾|规则红线)/.test(source)) return '书写规则';");
  });

  it('adds character relationship as a first-class role field before status settings', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const roleEditorStart = panelSource.indexOf('function RoleBaseStateEditor');
    const roleEditorEnd = panelSource.indexOf('function WorkbenchLibraryPanel', roleEditorStart);
    const roleEditorSource = panelSource.slice(roleEditorStart, roleEditorEnd);

    expect(panelSource).toContain('relationship: string;');
    expect(panelSource).toContain("relationship: parsed.relationship || '',");
    expect(panelSource).toContain("relationship: value.relationship || '',");
    expect(panelSource).toContain('const relationshipWords = countTextWords(role.relationship);');
    expect(panelSource).toContain("type RoleStateUpdateChapterKey = RoleStateFieldKey | 'relationshipState';");
    expect(panelSource).toContain("const relationshipUpdateLabel = getRoleStateUpdateLabel(stateUpdateChapters.relationshipState);");
    expect(panelSource).toContain("relationshipState: currentChapterNumber,");
    expect(panelSource).toContain('const updateRelationshipState = (value: string) => {');
    expect(panelSource).toContain('人物关系');
    expect(panelSource).not.toContain('AI 默认只读取，不直接覆盖。发现缺失时进入“基础设定补充建议”，由用户确认后写入。');
    expect(panelSource).not.toContain('只写这个人物自己的关系；全局关系网仍放到作品设定的“人物关系”分类。');
    expect(panelSource).not.toContain('placeholder="记录姓名、身份、外貌、角色定位、核心性格、人物背景、能力规则等低频变化内容。"');
    expect(panelSource).toContain("placeholder: '身形、容貌、衣着、气质、标志性细节。'");
    expect(panelSource).toContain('placeholder="记录与主角、阵营、亲友、敌人、师徒、利益对象的关系。关系绑定人物，不绑定世界。"');
    expect(panelSource).toContain("wrapAiRequestTag('人物关系', truncateTextForAi(role.relationship, 700))");
    expect(roleEditorSource).toContain("const roleSettingTabs = ['基础设定', '状态设定', '未确认'] as const;");
    expect(roleEditorSource).toContain("const [activeRoleSettingTab, setActiveRoleSettingTab] = useState<(typeof roleSettingTabs)[number]>('基础设定');");
    expect(roleEditorSource).toContain('<SettingSegmentedTabs');
    expect(roleEditorSource).toContain('tabs={roleSettingTabs}');
    expect(roleEditorSource).toContain('onChange={setActiveRoleSettingTab}');
    expect(panelSource).toContain("const SETTING_SEGMENTED_TAB_GROUP_CLASS = 'flex h-10 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white';");
    expect(panelSource).toContain("const SETTING_SEGMENTED_TAB_ACTIVE_CLASS = 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE]';");
    expect(panelSource).toContain("const SETTING_SEGMENTED_TAB_IDLE_CLASS = 'bg-white text-slate-600 hover:bg-[#EAF9FD] hover:text-[#078FAE]';");
    expect(roleEditorSource).toContain("activeRoleSettingTab === '状态设定'");
    expect(roleEditorSource).toContain('updateRelationshipState(event.target.value)');
    expect(roleEditorSource).toContain('{relationshipUpdateLabel}');
    expect(roleEditorSource).toContain("stateUpdateChapters.relationshipState ? 'text-[#08AACE]' : 'text-red-500'");
    expect(roleEditorSource).toContain('未确认更新');
    expect(roleEditorSource).toContain('自动确认');
    expect(roleEditorSource).toContain('一键确认');
    expect(roleEditorSource).toContain("activeRoleSettingTab === '未确认' ? (");
    expect(roleEditorSource).toContain('className="flex shrink-0 items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-1.5"');
    expect(roleEditorSource).not.toContain('className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5"');
    expect(roleEditorSource).not.toContain('AI 只更新状态设定，AI反馈先进入未确认区，确认后才写入状态设定。');
    expect(roleEditorSource).not.toContain("自动确认 {autoConfirmRoleState ? '开启后自动写入状态设定' : '关闭'}");
    expect(roleEditorSource).toContain('手动确认');
    expect(roleEditorSource).toContain("beforeTitle: '人物关系未更新前'");
    expect(roleEditorSource).toContain("afterTitle: '人物关系更新后'");
    expect(roleEditorSource).toContain('item.beforeTitle');
    expect(roleEditorSource).toContain('item.afterTitle');
    expect(roleEditorSource).toContain('item.beforeValue');
    expect(roleEditorSource).toContain('item.afterValue');
    expect(roleEditorSource).toContain('className="grid gap-3 md:grid-cols-2"');
    expect(roleEditorSource).not.toContain('正文中出现新的关系变化，建议确认后写入人物关系。');
    expect(panelSource).toContain('grid-cols-1');
    expect(panelSource).not.toContain('grid-cols-[minmax(280px,0.85fr)_minmax(260px,0.7fr)_minmax(380px,1.1fr)]');
    expect(roleEditorSource).not.toContain('<aside');

    const relationshipIndex = roleEditorSource.indexOf('人物关系');
    const statusIndex = roleEditorSource.indexOf('状态设定');
    expect(relationshipIndex).toBeGreaterThan(-1);
    expect(relationshipIndex).toBeGreaterThan(statusIndex);
  });

  it('moves character editor scheme seven into production and retires the layout test page', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const testCollectionSource = await readTestCollectionSource();
    const roleEditorStart = panelSource.indexOf('function RoleBaseStateEditor');
    const roleEditorEnd = panelSource.indexOf('function WorkbenchLibraryPanel', roleEditorStart);
    const roleEditorSource = panelSource.slice(roleEditorStart, roleEditorEnd);

    expect(panelSource).toContain('const ROLE_BASE_SETTING_FIELD_DEFINITIONS');
    expect(roleEditorSource).toContain('人物姓名');
    expect(panelSource).toContain('settingName: { width: 220, height: 56, fontSize: 18 }');
    expect(roleEditorSource).toContain('className="relative flex h-[48px] w-[148px] shrink-0 items-center rounded-[20px] border-2 border-slate-950 bg-white px-4 py-0"');
    expect(roleEditorSource).not.toContain('className="relative h-[54px] w-[148px] shrink-0 rounded-[22px] border-2 border-slate-950 bg-white px-4 pb-2 pt-4"');
    expect(roleEditorSource).not.toContain('className="relative h-[58px] w-[148px]');
    expect(roleEditorSource).toContain('className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-sm font-medium leading-5 text-slate-500"');
    expect(roleEditorSource).toContain('className="h-6 w-full bg-transparent text-[17px] font-medium leading-6 text-slate-950 outline-none placeholder:text-slate-400"');
    expect(roleEditorSource).not.toContain('className="h-7 w-full bg-transparent text-lg font-medium leading-7 text-slate-950 outline-none placeholder:text-slate-400"');
    expect(roleEditorSource).not.toContain('className="flex min-w-[160px] items-center gap-2"');
    expect(roleEditorSource).not.toContain('className="min-w-0 bg-transparent text-2xl font-black leading-8 text-slate-950 outline-none placeholder:text-slate-400"');
    expect(roleEditorSource).not.toContain('className="h-full w-full bg-transparent text-xl font-black leading-7 text-slate-950 outline-none placeholder:text-slate-400"');
    expect(roleEditorSource).toContain('floatingLabel="身份定位"');
    expect(panelSource).toContain("title: '外貌'");
    expect(panelSource).toContain("title: '称号/外号/别称'");
    expect(panelSource).not.toContain("title: '角色定位'");
    expect(panelSource).toContain("title: '核心性格'");
    expect(panelSource).toContain("title: '人物背景'");
    expect(panelSource).toContain("title: '金手指/能力'");
    expect(roleEditorSource).toContain('{field.title}');
    expect(panelSource).toContain("key: 'appearance'");
    expect(panelSource).toContain("key: 'aliasName'");
    expect(panelSource).not.toContain("key: 'rolePosition'");
    expect(panelSource).toContain("key: 'corePersonality'");
    expect(panelSource).toContain("key: 'background'");
    expect(panelSource).toContain("key: 'abilityRules'");
    expect(roleEditorSource).toContain('updateRoleBaseSettingField(field.key, event.target.value)');
    expect(roleEditorSource).toContain('onTitleChange(event.target.value)');
    expect(roleEditorSource).not.toContain('floatingLabel="分类"');
    expect(roleEditorSource).not.toContain('flex h-[86px] shrink-0');
    expect(roleEditorSource).toContain('className="flex min-h-0 flex-1 flex-col gap-3 px-5 py-3"');
    expect(roleEditorSource).not.toContain('className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-5"');
    expect(roleEditorSource).toContain('className="shrink-0 border-b border-slate-200 pb-3"');
    expect(roleEditorSource).toContain('className="mt-3 flex items-center justify-between gap-4 overflow-x-auto pb-1"');
    expect(roleEditorSource).not.toContain('className="flex shrink-0 gap-2"');
    expect(roleEditorSource).not.toContain('rounded-full border px-4 py-2 text-sm font-black');
    expect(roleEditorSource).toContain('className="shrink-0 text-xs font-black text-slate-400"');
    expect(roleEditorSource).not.toContain('className="mt-2 text-xs font-black text-slate-400"');
    expect(roleEditorSource).toContain('className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-1 pb-1 pr-2 pt-3"');
    expect(roleEditorSource).toContain("const roleSettingTabs = ['基础设定', '状态设定', '未确认'] as const;");
    expect(roleEditorSource).toContain('className="relative flex min-h-[150px] flex-col rounded-[22px] border-2 border-slate-950 bg-white p-4 pt-5"');
    expect(roleEditorSource).toContain("const contentGridClassName = 'grid min-h-full grid-cols-2 auto-rows-fr gap-3';");
    expect(roleEditorSource).not.toContain('grid grid-cols-3');
    expect(roleEditorSource).not.toContain('col-span-2');
    expect(roleEditorSource).not.toContain('h-[116px]');
    expect(roleEditorSource).not.toContain('h-24');
    expect(roleEditorSource).toContain('min-h-[150px]');
    expect(roleEditorSource).not.toContain('placeholder="记录身份、外貌、角色定位、核心性格、人物背景、能力规则等低频变化内容。"');
    expect(testCollectionSource).not.toContain('CharacterSettingLayoutPlanTestPage');
    expect(testCollectionSource).not.toContain('/character-setting-layout-plan-test');
    expect(testCollectionSource).not.toContain('人物设定布局方案测试');
  });

  it('stretches character setting cards to the available editor height like structured setting pages', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const roleEditorStart = panelSource.indexOf('function RoleBaseStateEditor');
    const roleEditorEnd = panelSource.indexOf('function getWorkbenchLibraryEntryUpdatedAt', roleEditorStart);
    const roleEditorSource = panelSource.slice(roleEditorStart, roleEditorEnd);

    expect(roleEditorSource).toContain("const contentGridClassName = 'grid min-h-full grid-cols-2 auto-rows-fr gap-3';");
    expect(roleEditorSource).toContain('className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-1 pb-1 pr-2 pt-3"');
    expect(roleEditorSource).toContain('className="relative flex min-h-[150px] flex-col rounded-[22px] border-2 border-slate-950 bg-white p-4 pt-5"');
    expect(roleEditorSource).toContain('className="editor-scrollbar min-h-0 flex-1 resize-none bg-transparent text-sm leading-7 text-slate-700 outline-none placeholder:text-slate-400"');
    expect(roleEditorSource).not.toContain('className="editor-scrollbar h-[116px] w-full resize-none');
  });
});
