import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

import {
  getWorkbenchPlotPointDisplayText,
  getWorkbenchPlotPointReview,
} from '@/features/workbench/model/workbenchPlotChain';

import { WorkbenchLibraryPanel, parseGeneratedPlotPointCandidates } from './WorkbenchLibraryPanel';

const TEST_WORK_SETTING_STARTER_VERSION = '2026-06-25-foreshadow-fields-v1';

const unlockSmartImportSettings = () => {
  fireEvent.click(screen.getByTitle('解锁智能导入设定'));
};

const ensureLibraryGroupExpanded = (name: string | RegExp) => {
  const button = screen.getByRole('button', { name });
  if (button.getAttribute('aria-expanded') === 'false') fireEvent.click(button);
  return button;
};

const readWorkbenchLibraryPanelSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const baseDir = dirname(fileURLToPath(import.meta.url));
  const files = [
    'WorkbenchLibraryPanel.tsx',
    'workbenchBrainstormModals.tsx',
    'workbenchBrainstormState.ts',
    'workbenchDetailOutlineReaderModal.tsx',
    'workbenchDetailOutlineState.ts',
    'workbenchLibraryAiText.ts',
    'workbenchLibraryAiLogModal.tsx',
    'workbenchLibraryContextMenus.tsx',
    'workbenchLibraryDataState.ts',
    'workbenchLibraryDialogs.tsx',
    'workbenchLibraryDrag.ts',
    'workbenchLibraryHeaderTools.tsx',
    'workbenchLibrarySidebar.tsx',
    'workbenchOutlineAiLogModal.tsx',
    'workbenchFieldSizeSettingsModal.tsx',
    'workbenchLibraryMenuPosition.ts',
    'workbenchLibraryRequestLog.tsx',
    'workbenchLibraryResizeHandles.tsx',
    'workbenchLibraryStorageState.ts',
    'workbenchLibraryTabs.ts',
    'workbenchOtherSettingReaderModal.tsx',
    'workbenchPlotPointCandidates.ts',
    'workbenchPlotPointGenerationModal.tsx',
    'workbenchRoleContent.ts',
    'workbenchRoleEditor.tsx',
    'workbenchRoleHistoryModal.tsx',
    'workbenchRoleSidebar.tsx',
    'workbenchSmartImport.ts',
  ];

  return files.map((file) => readFileSync(join(baseDir, file), 'utf8')).join('\n\n');
};

const readWorkbenchSettingTaxonomySource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../model/workbenchSettingTaxonomy.ts'), 'utf8');
};

const readWorkbenchSettingImportFormatPreviewSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchSettingImportFormatPreview.tsx'), 'utf8');
};

const readWorkbenchStructuredSettingsSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchStructuredSettings.ts'), 'utf8');
};

const readWorkbenchRoleSettingFieldsSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchRoleSettingFields.ts'), 'utf8');
};

const readWorkbenchRoleEditorSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchRoleEditor.tsx'), 'utf8');
};

const readWorkbenchLibraryPanelConstantsSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchLibraryPanelConstants.ts'), 'utf8');
};

const readWorkbenchLibrarySidebarSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchLibrarySidebar.tsx'), 'utf8');
};

const readWorkbenchDetailOutlineReaderModalSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchDetailOutlineReaderModal.tsx'), 'utf8');
};

const readWorkbenchOtherSettingReaderModalSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchOtherSettingReaderModal.tsx'), 'utf8');
};

const readWorkbenchFieldSizeSettingsSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchFieldSizeSettings.tsx'), 'utf8');
};

const readWorkbenchSettingSegmentedTabsSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchSettingSegmentedTabs.tsx'), 'utf8');
};

const readSharedSegmentedTabsSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/SegmentedTabs.tsx'), 'utf8');
};

const readWorkbenchLibraryAiLogShellSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchLibraryAiLogShell.tsx'), 'utf8');
};

const readSharedAppModalShellSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/AppModalShell.tsx'), 'utf8');
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

  return readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/CombinedAiConfigSelect.tsx'),
    'utf8',
  );
};

const readAiRequestLogGroupsSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/AiRequestLogGroups.tsx'),
    'utf8',
  );
};

const readAiRequestLogModalLayoutSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/AiRequestLogModalLayout.tsx'),
    'utf8',
  );
};

const readChapterNumberButtonSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/ChapterNumberButton.tsx'),
    'utf8',
  );
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

  return readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../../tests/pages/TestCollectionPage.tsx'),
    'utf8',
  );
};

describe('WorkbenchLibraryPanel embedded flow navigation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps workbench library panel split into focused helper modules', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource("import { LibraryAiLogShell } from './workbenchLibraryAiLogShell';");
    expect(panelSource).toContainSource(
      "import { SettingImportFormatPreviewText } from './workbenchSettingImportFormatPreview';",
    );
    expect(panelSource).toContainSource("import { resizeFloatingAiTextarea } from './workbenchFloatingAiTextarea';");
    expect(panelSource).toContainSource(
      "import { LibraryManagementModal, type LibraryManagementModalState } from './workbenchLibraryManagementModal';",
    );
    expect(panelSource).toContainSource("from './workbenchLibraryPanelConstants';");
    expect(panelSource).toContainSource("import { SettingSegmentedTabs } from './workbenchSettingSegmentedTabs';");
    expect(panelSource).toContainSource("from './workbenchFieldSizeSettings';");
    expect(panelSource).not.toContainSource('function LibraryAiLogShell({');
    expect(panelSource).not.toContainSource('function LibraryManagementModal({');
    expect(panelSource).not.toContainSource('function SettingSegmentedTabs<T extends string>');
    expect(panelSource).not.toContainSource('function SettingImportFormatPreviewText({ content }');
    expect(panelSource).not.toContainSource('function resizeFloatingAiTextarea(textarea: HTMLTextAreaElement | null)');
    expect(panelSource).not.toContainSource('function FieldSizeNumberInput({');
  });

  it('keeps the empty setting row the same height as a normal setting item', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();

    expect(constantsSource).toContainSource(
      "export const WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS = 'min-h-[38px] w-full rounded-xl border border-transparent bg-white px-4 py-2 text-left text-sm font-black leading-5 shadow-sm';",
    );
    expect(constantsSource).toContainSource(
      'export const WORKBENCH_LIBRARY_ENTRY_BUTTON_CLASS = `group cursor-default select-none ${WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS}',
    );
    expect(constantsSource).toContainSource(
      'export const WORKBENCH_LIBRARY_ENTRY_EMPTY_CLASS = `flex items-center ${WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS} text-gray-400`;',
    );
    expect(panelSource).toContainSource('className={WORKBENCH_LIBRARY_ENTRY_EMPTY_CLASS}');
    expect(panelSource).toContainSource('className={`${WORKBENCH_LIBRARY_ENTRY_BUTTON_CLASS} ${');
    expect(panelSource).not.toContainSource('text-xs font-bold leading-5 text-gray-400');
    expect(panelSource).not.toContainSource(
      '<p className="px-3 py-4 text-xs text-gray-400">{isOutlineCharacterScope ?',
    );
    expect(constantsSource).not.toContainSource(
      "const WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS = 'min-h-[34px] w-full rounded-lg border border-transparent bg-white px-1 py-1.5",
    );
  });

  it('restores only setting and brainstorm sidebar rows to the original white card style', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const sidebarSource = await readWorkbenchLibrarySidebarSource();
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const { dirname, join } = await import('node:path');
    const chapterSidebarSource = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), 'ChapterSidebar.tsx'),
      'utf8',
    );
    const settingSidebarStart = sidebarSource.indexOf(
      'className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 px-1 py-2"',
    );
    const settingSidebarSource = sidebarSource.slice(settingSidebarStart);

    expect(settingSidebarStart).toBeGreaterThan(-1);
    expect(settingSidebarSource).toContainSource(
      'className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 px-1 py-2"',
    );
    expect(settingSidebarSource).toContainSource(
      'xy-setting-sidebar-scrollbar min-h-0 flex-1 overflow-y-auto space-y-1',
    );
    expect(settingSidebarSource).toContainSource('className="mt-0.5 space-y-0.5"');
    expect(chapterSidebarSource).toContainSource('className="editor-scrollbar flex-1 overflow-y-auto px-1 py-2"');
    expect(chapterSidebarSource).toContainSource(
      'className={`xy-chapter-sidebar-row group relative flex w-full cursor-pointer items-center gap-2 rounded-[8px] border px-1 py-1 text-left transition-colors',
    );
    expect(constantsSource).toContainSource(
      "export const WORKBENCH_FOLDER_GROUP_BUTTON_CLASS = 'group flex h-9 w-full",
    );
    expect(constantsSource).toContainSource(
      "export const WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS = 'min-h-[38px] w-full rounded-xl",
    );
    expect(panelSource).toContainSource('className="flex w-full items-center gap-2"');
    expect(panelSource).toContainSource('className="min-w-0 truncate pl-3 text-sm font-black text-gray-700"');
    expect(panelSource).toContainSource(
      'className="ml-auto shrink-0 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-black text-[#08AACE]"',
    );
    expect(settingSidebarSource).not.toContainSource('bg-gray-50 px-3 py-3');
    expect(settingSidebarSource).not.toContainSource('xy-setting-sidebar-scrollbar scrollbar-scroll-only');
    expect(settingSidebarSource).not.toContainSource('scrollbar-half-width min-h-0 flex-1 overflow-y-auto space-y-1');
    expect(settingSidebarSource).not.toContainSource('space-y-0.5 overflow-y-auto pr-1');
    expect(settingSidebarSource).not.toContainSource('max-h-[760px] space-y-0.5 overflow-y-auto');
    expect(settingSidebarSource).not.toContainSource('setting-group:${effectiveLibraryTab}:${group.type}');
  });

  it('uses minimum left navigation widths as setting library defaults for new works', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();

    expect(constantsSource).toContainSource('export const SETTING_LIBRARY_LEFT_MIN_WIDTH = 180;');
    expect(constantsSource).toContainSource(
      'export const SETTING_LIBRARY_LEFT_WIDTH = SETTING_LIBRARY_LEFT_MIN_WIDTH;',
    );
    expect(constantsSource).toContainSource('export const SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH = 260;');
    expect(constantsSource).toContainSource('export const PLOT_POINT_LAYOUT_TREE_MIN_WIDTH = 132;');
    expect(constantsSource).toContainSource(
      'export const PLOT_POINT_LAYOUT_TREE_WIDTH = PLOT_POINT_LAYOUT_TREE_MIN_WIDTH;',
    );
    expect(constantsSource).not.toContainSource('const SETTING_LIBRARY_LEFT_WIDTH = 430;');
    expect(constantsSource).not.toContainSource('const PLOT_POINT_LAYOUT_TREE_WIDTH = 168;');
    expect(panelSource).toContainSource('readSettingLibraryLeftWidth(storageKey, activeTab, scale)');
  });

  it('auto-creates an editable outline setting when typing into the empty setting name field', async () => {
    localStorage.setItem(
      'workbench-outline-empty-name-edit-test_work_setting_starter_version',
      TEST_WORK_SETTING_STARTER_VERSION,
    );

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
    localStorage.setItem(
      'workbench-outline-empty-preview-edit-test_work_setting_starter_version',
      TEST_WORK_SETTING_STARTER_VERSION,
    );

    render(
      <WorkbenchLibraryPanel
        storageKey="workbench-outline-empty-preview-edit-test"
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无内容"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('这里可以直接输入设定内容，会自动新建设定。'), {
      target: { value: '测试设定正文' },
    });

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
    localStorage.setItem(
      `${storageKey}_tab_configs_v1`,
      JSON.stringify({
        大纲: {
          aiOutput:
            '<人物设定>\n*人物设定*：\n\n【主角人设】：\n林刻冷酷果决。\n\n【重要配角】：\n吞吞是系统助手。\n\n【核心反派】：\n永恒神庭追杀吞噬修士。\n</人物设定>',
        },
      }),
    );

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
    expect(importedRole.baseSetting).toContainSource('【主角人设】：\n林刻冷酷果决。');
    expect(importedRole.baseSetting).toContainSource('【重要配角】：\n吞吞是系统助手。');
    expect(importedRole.baseSetting).toContainSource('【核心反派】：\n永恒神庭追杀吞噬修士。');
  });

  it('smart-imports each tagged group as one setting when brackets are subsections', async () => {
    const storageKey = 'workbench-smart-import-direct-subsections-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      `${storageKey}_tab_configs_v1`,
      JSON.stringify({
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
      }),
    );

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
    expect(storedSettingEntries.map((entry: { title: string }) => entry.title)).toEqual(['核心设定', '剧情规划']);
    expect(storedSettingEntries.map((entry: { content: string }) => JSON.parse(entry.content).type)).toEqual([
      '核心设定',
      '剧情规划',
    ]);
    expect(JSON.parse(storedSettingEntries[0].content).body).toContainSource('【故事起点】：\n林刻开局被退婚。');
    expect(JSON.parse(storedSettingEntries[0].content).body).toContainSource('【核心矛盾】：\n永恒神庭追杀吞噬修士。');
    expect(JSON.parse(storedSettingEntries[1].content).body).toContainSource('【黄金三章钩子】：\n退婚、反杀、逃亡。');
  });

  it('smart-imports top page tags into settings and role libraries', async () => {
    const storageKey = 'workbench-smart-import-top-page-tags-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      `${storageKey}_tab_configs_v1`,
      JSON.stringify({
        大纲: {
          aiOutput: [
            '<作品设定>',
            '<核心设定>',
            '*基础设定*：',
            '',
            '【故事类型】：',
            '东方玄幻升级流。',
            '</核心设定>',
            '<世界地图>',
            '*世界架构*：',
            '',
            '【世界架构】：',
            '凡界、灵界、九重天依次递进。',
            '</世界地图>',
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
            '<势力设定>',
            '<正派势力>',
            '*青云宗*：',
            '',
            '【基本信息】：',
            '东域正道宗门。',
            '</正派势力>',
            '</势力设定>',
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
      }),
    );

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
    expect(importedRole.baseSetting).toContainSource('【外貌】：\n黑衣少年，目光冷静。');
    expect(importedRole.baseSetting).toContainSource('【核心性格】：\n果断但不滥杀。');
  });

  it('splits smart-imported structured fields even when bracket headings are not separated by blank lines', async () => {
    const storageKey = 'workbench-smart-import-compact-structured-fields-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      `${storageKey}_tab_configs_v1`,
      JSON.stringify({
        大纲: {
          aiOutput: [
            '<作品设定>',
            '<核心设定>',
            '*世界观*：',
            '【时代背景】：',
            '宇宙纪元末期，混沌之力侵蚀诸天万界。',
            '旧日神魔陨落，新生文明在废墟上挣扎求存。',
            '【世界格局】：',
            '宇宙分为三层：底层物质位面，中层位面节点，顶层混沌虚空。',
            '各大宗门围绕位面节点争夺通道权。',
            '【社会秩序】：',
            '宗门掌控资源，边城依靠贸易和庇护维持秩序。',
            '</核心设定>',
            '</作品设定>',
          ].join('\n'),
        },
      }),
    );

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
    fireEvent.click(screen.getByText('世界观').closest('button') as HTMLElement);

    expect(screen.getByLabelText('时代背景')).toHaveValue(
      ['宇宙纪元末期，混沌之力侵蚀诸天万界。', '旧日神魔陨落，新生文明在废墟上挣扎求存。'].join('\n'),
    );
    expect(screen.getByLabelText('世界格局')).toHaveValue(
      ['宇宙分为三层：底层物质位面，中层位面节点，顶层混沌虚空。', '各大宗门围绕位面节点争夺通道权。'].join('\n'),
    );
    expect(screen.getByLabelText('社会秩序')).toHaveValue('宗门掌控资源，边城依靠贸易和庇护维持秩序。');
  });

  it('reveals hidden setting groups when smart import fills them', async () => {
    const storageKey = 'workbench-smart-import-reveals-hidden-groups-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(`${storageKey}_hidden_setting_types`, JSON.stringify(['核心设定', '剧情规划']));
    localStorage.setItem(
      `${storageKey}_tab_configs_v1`,
      JSON.stringify({
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
      }),
    );

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

    expect(panelSource).toContainSource('这里显示选中的脑洞内容，也可以直接编辑。');
    expect(panelSource).toContainSource('defaultActiveTab');
    expect(panelSource).not.toContainSource("tabs={['设定', '角色', '脑洞']}");
  });

  it('renders outline linked context as current, other-setting, or brainstorm segmented control', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const linkControlStart = panelSource.indexOf(
      "title={isOutlineCharacterScope ? '关联当前人物设定' : '关联当前选中的设定预览'}",
    );
    const linkControlSource = panelSource.slice(
      panelSource.lastIndexOf('<div className="mt-3 flex min-w-0 items-center gap-1.5">', linkControlStart),
      panelSource.indexOf('<div className="mt-3 flex items-center gap-2">', linkControlStart),
    );

    expect(linkControlStart).toBeGreaterThan(-1);
    expect(panelSource).toContainSource("settingLinkSource?: 'current' | 'other' | 'brainstorm' | null;");
    expect(panelSource).toContainSource('associationSessionId?: string | null;');
    expect(panelSource).toContainSource('linkedOtherSettingIds?: string[];');
    expect(panelSource).toContainSource('getWorkbenchAssociationRuntimeId');
    expect(panelSource).toContainSource('isWorkbenchAssociationRuntimeCurrent(activeTabConfig.associationSessionId)');
    expect(panelSource).toContainSource("settingLinkSource: 'brainstorm'");
    expect(panelSource).toContainSource('promptDisabled: false');
    expect(panelSource).toContainSource("settingLinkSource: 'current'");
    expect(panelSource).toContainSource("settingLinkSource: selectedIds.length > 0 ? 'other' : null");
    expect(panelSource).toContainSource(
      'const getActiveLinkedSettingSnapshot = (): { source: SettingLinkSource; title: string; text: string } => {',
    );
    expect(panelSource).toContainSource("source === 'current'");
    expect(panelSource).toContainSource("source === 'other'");
    expect(panelSource).toContainSource('text: getSettingEntryBody(currentEntry)');
    expect(panelSource).toContainSource(
      'text: currentRoleEntry && currentRole ? buildRoleReaderContent(currentRoleEntry, currentRole) :',
    );
    expect(linkControlSource).toContainSource('关联');
    expect(linkControlSource).toContainSource('当前设定');
    expect(linkControlSource).toContainSource('其他设定');
    expect(linkControlSource).toContainSource('脑洞');
    expect(linkControlSource).not.toContainSource('if (isOutlineCharacterScope) return;');
    expect(linkControlSource).not.toContainSource('disabled={isOutlineCharacterScope}');
    expect(linkControlSource).toContainSource('关联脑洞库内容到人物设定');
    expect(linkControlSource).toContainSource('openOtherSettingReader');
    expect(linkControlSource).toContainSource("activeSettingLinkSource === 'current'");
    expect(linkControlSource).toContainSource("activeSettingLinkSource === 'other'");
    expect(linkControlSource).toContainSource("activeSettingLinkSource === 'brainstorm'");
    expect(linkControlSource).toContainSource(
      'updateActiveTabConfig({ associationSessionId: null, settingLinkSource: null, promptDisabled: false })',
    );
    expect(linkControlSource).toContainSource('loadedBrainstormId: null');
    expect(linkControlSource).toContainSource('linkedOtherSettingIds: []');
    expect(linkControlSource).toContainSource('promptDisabled: true');
    expect(linkControlSource).toContainSource('关联 <WordCountText value={linkedSettingWordCount} compact />');
    expect(linkControlSource).not.toContainSource('label="关联脑洞"');
    expect(linkControlSource).not.toContainSource('linkedLabel="已关联脑洞"');
    expect(panelSource).toContainSource('const OTHER_SETTING_LINK_TABS');
    expect(panelSource).toContainSource('关联其他设定');
    const otherSettingModalStart = panelSource.indexOf('const otherSettingReaderModal = (');
    const otherSettingModalSource = panelSource.slice(
      otherSettingModalStart,
      panelSource.indexOf('const brainstormEntries = entries.filter', otherSettingModalStart),
    );
    expect(otherSettingModalStart).toBeGreaterThan(-1);
    expect(otherSettingModalSource).toContainSource('<OtherSettingReaderModal');
    expect(otherSettingModalSource).toContainSource('selectAllCurrentOtherSettingLinkTab');
    expect(otherSettingModalSource).toContainSource('toggleVisibleOtherSettingLinkGroupSelection');
    expect(panelSource).toContainSource('关联所有');
    expect(panelSource).toContainSource('全选');
    expect(panelSource).toContainSource("aria-label={`${draftIds.has(entry.id) ? '取消选择' : '选择'}${entry.title}`}");
    expect(panelSource).toContainSource('onToggleEntry(entry.id)');
    expect(panelSource).toContainSource("draftIds.has(selectedEntry.id) ? '已勾选' : '未勾选'");
    expect(otherSettingModalSource).not.toContainSource('关联此项');
    expect(otherSettingModalSource).not.toContainSource('selectedOtherSettingLinkEntry.tabTitle');
    expect(otherSettingModalSource).not.toContainSource('selectedOtherSettingLinkEntry.type} ·');
    expect(panelSource).toContainSource("rawContent.startsWith('{') ? '' : entry.content");
    expect(panelSource).toContainSource('作品设定');
    expect(panelSource).toContainSource('人物设定');
    expect(panelSource).toContainSource('势力设定');
    expect(panelSource).toContainSource('道具资源');
    expect(panelSource).toContainSource('怪物图鉴');
    expect(panelSource).toContainSource('伏笔线索');
    expect(panelSource).toContainSource("wrapAiRequestTag('关联其他设定'");
    expect(panelSource).toContainSource('const isPromptDisabledForRequest = activeTab === SETTING_TAB');
    expect(panelSource).toContainSource(
      "outlineSettingScope !== 'character' && getActiveSettingLinkSource() === 'current'",
    );
    expect(panelSource).toContainSource('const effectivePromptDisabled = activeTab === SETTING_TAB');
    expect(panelSource).toContainSource("!isOutlineCharacterScope && activeSettingLinkSource === 'current'");
    expect(panelSource).toContainSource('promptDisabled={effectivePromptDisabled}');
    expect(panelSource).not.toContainSource('autoDisablePromptOnCurrentLink');
    expect(panelSource).not.toContainSource('关联当前时自动禁用提示词');
  });

  it('removes the old right-click unlock flow from clear settings', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).not.toContainSource('clearSettingsUnlockContextMenu');
    expect(panelSource).not.toContainSource('clearSettingsTooltipLayer');
    expect(panelSource).not.toContainSource('clearSettingsUnlockedTarget');
    expect(panelSource).not.toContainSource('已锁定，右键可以解锁');
    expect(panelSource).toContainSource('aria-disabled="true"');
  });

  it('supports clearing character settings from the setting page without clearing work settings', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource(
      "type ClearSettingsTarget = 'settingCategories' | 'settingEntries' | 'roleCategories' | 'roleEntries';",
    );
    expect(panelSource).toContainSource(
      "const categoryMenuClearCategoryTarget: ClearSettingsTarget = categoryMenu?.kind === 'role' ? 'roleCategories' : 'settingCategories';",
    );
    expect(panelSource).toContainSource(
      "const categoryMenuClearEntryTarget: ClearSettingsTarget = categoryMenu?.kind === 'role' ? 'roleEntries' : 'settingEntries';",
    );
    expect(panelSource).toContainSource('const clearRoleEntries = () => {');
    expect(panelSource).toContainSource(
      'persist(entries.filter((entry) => entry.tab !== ROLE_TAB || isMaleProtagonistRoleType(parseRoleContent(entry.content).type)));',
    );
    expect(panelSource).toContainSource('const deletableRoleEntries = useMemo(');
    expect(panelSource).toContainSource(
      'roleEntries.filter((entry) => !isMaleProtagonistRoleType(parseRoleContent(entry.content).type))',
    );
    expect(panelSource).toContainSource('openClearSettingsConfirmFromMenu(categoryMenuClearEntryTarget)');
    expect(panelSource).toContainSource("if (clearSettingsConfirmTarget === 'roleEntries') clearRoleEntries();");
    expect(panelSource).toContainSource("roleEntries: {\n      label: '角色'");
    expect(panelSource).not.toContainSource('activeTab === SETTING_TAB && !isOutlineCharacterScope && (');
  });

  it('does not overwrite saved setting splitter width while syncing visible width', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const syncStart = panelSource.indexOf('const syncVisibleLeftWidth = () => {');
    const syncEffectSource = panelSource.slice(
      syncStart,
      panelSource.indexOf('}, [activeTab, scale, storageKey]);', syncStart),
    );

    expect(syncStart).toBeGreaterThan(-1);
    expect(syncEffectSource).toContainSource(
      'setSettingLibraryLeftWidth(readSettingLibraryLeftWidth(storageKey, activeTab, scale));',
    );
    expect(syncEffectSource).toContainSource("window.addEventListener('resize', syncVisibleLeftWidth);");
    expect(syncEffectSource).not.toContainSource('persistSettingLibraryWidth');
    expect(syncEffectSource).not.toContainSource('clampSettingLibraryLeftWidth(currentWidth');
  });

  it('places brainstorm output clear action in the save action group and font tools in the header slot', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const brainstormPreviewStart = panelSource.indexOf('placeholder="这里显示选中的脑洞内容，也可以直接编辑。"');
    const brainstormPreviewEnd = panelSource.indexOf('</main>', brainstormPreviewStart);
    const brainstormPreviewSource = panelSource.slice(brainstormPreviewStart, brainstormPreviewEnd);
    const brainstormOutputStart = panelSource.indexOf('xy-brainstorm-output-preview-list');
    const brainstormOutputEnd = panelSource.indexOf(
      'className="shrink-0 border-t border-gray-100 bg-white px-4 py-3"',
      brainstormOutputStart,
    );
    const brainstormOutputSource = panelSource.slice(brainstormOutputStart, brainstormOutputEnd);
    const actionGroupStart = panelSource.indexOf(
      '<div className="flex min-w-0 flex-wrap items-center gap-2">',
      brainstormOutputEnd,
    );
    const actionGroupSource = panelSource.slice(
      actionGroupStart,
      panelSource.indexOf('{settingLibraryMode ===', actionGroupStart),
    );

    expect(panelSource).not.toContainSource('xy-floating-brainstorm-output-action-tool');
    expect(actionGroupStart).toBeGreaterThan(-1);
    expect(actionGroupSource).toContainSource('替换当前脑洞');
    expect(actionGroupSource).not.toContainSource('替换脑洞');
    expect(actionGroupSource).toContainSource('保存为新脑洞');
    expect(actionGroupSource).toContainSource('复制脑洞');
    expect(actionGroupSource).toContainSource('清空脑洞');
    expect(actionGroupSource).toContainSource('onClick={copyBrainstormOutputArea}');
    expect(actionGroupSource).toContainSource('disabled={!brainstormOutputValue.trim()}');
    expect(actionGroupSource).toContainSource('onClick={clearBrainstormOutputArea}');
    expect(actionGroupSource).toContainSource('disabled={!brainstormOutputValue.trim() && !isLibraryAiLoading}');
    expect(actionGroupSource).not.toContainSource('onClick={clearLibraryAiDialog}');
    expect(panelSource).toContainSource('const clearBrainstormOutputArea = () => {');
    expect(panelSource).toContainSource('const copyBrainstormOutputArea = () => {');
    expect(panelSource).toContainSource('void navigator.clipboard.writeText(outputText);');
    expect(panelSource).toContainSource('if (activeTab !== BRAINSTORM_TAB) return;');
    expect(panelSource).toContainSource("output: '',");
    expect(panelSource).toContainSource("result: '',");
    expect(actionGroupSource).not.toContainSource('confirmDeleteEntry(currentSelectedEntry);');
    expect(panelSource).toContainSource(
      "const [activeLibraryFontTarget, setActiveLibraryFontTarget] = useState<LibraryFontTarget>('brainstormOutput');",
    );
    expect(panelSource).toContainSource('const renderActiveLibraryFontSizeTool = () => {');
    expect(panelSource).toContainSource("if (activeLibraryFontTarget === 'brainstormPreview')");
    expect(panelSource).toContainSource('className="xy-header-stream-tool"');
    expect(panelSource).toContainSource("ariaLabel: '脑洞输出字号'");
    expect(panelSource).toContainSource("ariaLabel: '脑洞预览字号'");
    expect(panelSource).toContainSource("onFocus={() => setActiveLibraryFontTarget('brainstormPreview')}");
    expect(panelSource).toContainSource("onFocus={() => setActiveLibraryFontTarget('brainstormOutput')}");
    expect(panelSource).toContainSource('createPortal(renderLibraryHeaderFontSizeTool(), headerToolPortalTarget)');
    expect(brainstormPreviewSource).not.toContainSource('xy-floating-border-font-tool');
    expect(brainstormOutputSource).not.toContainSource('xy-floating-border-font-tool');
    expect(brainstormOutputSource).not.toContainSource('xy-floating-border-stream-tool');
    expect(panelSource).toContainSource('className="xy-stream-toggle-text">流式输出</span>');
    expect(panelSource).toContainSource('className="xy-stream-toggle-track"');
    expect(panelSource).toContainSource('className="xy-stream-toggle-thumb"');
    expect(panelSource).toContainSource('onBrainstormStreamEnabledChange(event.target.checked)');
    expect(panelSource).toContainSource('updateActiveTabConfig({ brainstormStreamEnabled: enabled })');
    expect(panelSource).not.toContainSource('xy-floating-brainstorm-output-font-tool');
    expect(panelSource).not.toContainSource('<span>流式输出</span>');
    expect(styleSource).toContainSource('.xy-floating-border-stream-tool {');
    expect(styleSource).toContainSource('.xy-header-stream-tool {');
    expect(styleSource).toContainSource('.xy-stream-toggle-text {');
    expect(styleSource).toContainSource('height: 1.76rem;');
    expect(styleSource).toContainSource('height: 2.25rem;');
    expect(styleSource).toContainSource('background: #ffffff;');
    expect(styleSource).toContainSource('width: 2.02rem;');
    expect(styleSource).toContainSource('.xy-stream-toggle-track {');
    expect(styleSource).toContainSource('background: #08AACE;');
  });
  it('uses transparent border backplates for combined model and prompt selector labels', async () => {
    const source = await readCombinedAiConfigSelectSource();
    const styleSource = await readSharedStylesSource();

    expect(source).toContainSource('xy-combined-ai-config-label xy-border-embedded-transparent-backplate');
    expect(source).toContainSource('xy-combined-ai-config-manage xy-border-embedded-transparent-backplate');
    expect(source).not.toContainSource('-translate-y-1/2 bg-white px-1.5 text-[11px]');
    expect(source).not.toContainSource('text-[11px] font-black leading-none text-[#08AACE]');
    expect(source).not.toContainSource('rounded-full bg-white text-[#08AACE]');
    expect(styleSource).toContainSource('.xy-combined-ai-config-label,');
    expect(styleSource).toContainSource('font-size: 13px;');
    expect(styleSource).toContainSource('min-width: 2.65rem;');
    expect(styleSource).toContainSource('background-image: none !important;');
    expect(styleSource).toContainSource('.xy-combined-ai-config-label::before,');
    expect(styleSource).toContainSource('display: none !important;');
    expect(styleSource).toContainSource('.xy-combined-ai-config-manage svg');
    expect(styleSource).toContainSource('drop-shadow(0 0 1px var(--xy-floating-backplate-bg, #ffffff))');
  });
  it('keeps model and prompt dropdowns flush with their selectors', async () => {
    const capsuleSource = await readCapsuleSelectSource();
    const combinedSource = await readCombinedAiConfigSelectSource();

    expect(capsuleSource).toContainSource('top: rect.bottom,');
    expect(capsuleSource).toContainSource('top-[calc(100%-2px)]');
    expect(capsuleSource).toContainSource('border-2 border-t-0 border-[#08AACE]');
    expect(capsuleSource).toContainSource('connectedDropdownOpen');
    expect(capsuleSource).toContainSource('border-b-transparent');
    expect(capsuleSource).toContainSource('shadow-[0_18px_34px_rgba(8,170,206,0.14)]');
    expect(capsuleSource).not.toContainSource('rect.bottom + 6');
    expect(capsuleSource).not.toContainSource('top-[calc(100%+6px)]');
    expect(combinedSource).toContainSource('absolute top-[calc(100%-2px)] z-[10050]');
    expect(combinedSource).toContainSource('border-2 border-t-0 border-[#08AACE]');
    expect(combinedSource).toContainSource('shadow-[0_18px_34px_rgba(8,170,206,0.14)]');
    expect(combinedSource).toContainSource(
      "openSegment === 'model' ? 'left-0 w-1/2 rounded-bl-xl rounded-br-none' : 'right-0 w-1/2 rounded-bl-none rounded-br-xl'",
    );
    expect(combinedSource).not.toContainSource('top-[calc(100%+6px)]');
    expect(combinedSource).not.toContainSource('rounded-xl border border-slate-200 bg-white py-1 shadow-2xl');
  });
  it('keeps disabled floating capsule selects outlined instead of filled', async () => {
    const capsuleSource = await readCapsuleSelectSource();

    expect(capsuleSource).toContainSource("controlHeight: 'h-[42px]'");
    expect(capsuleSource).toContainSource("disabled ? 'border-slate-200 bg-white text-slate-400' : 'border-[#08AACE]'");
    expect(capsuleSource).toContainSource("${disabled ? 'bg-white' : 'bg-white'}");
    expect(capsuleSource).not.toContainSource(
      "disabled ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-[#08AACE]'",
    );
  });
  it('routes prompt management categories to setting and chapter-outline names', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource("const PROMPT_SETTING_CATEGORY = '设定';");
    expect(panelSource).toContainSource("const DETAIL_OUTLINE_PROMPT_CATEGORY = '章纲';");
    expect(panelSource).toContainSource('const PLOT_CHAIN_PROMPT_CATEGORY = DETAIL_OUTLINE_PROMPT_CATEGORY;');
    expect(panelSource).toContainSource('activeTab === DETAIL_OUTLINE_TAB');
    expect(panelSource).toContainSource('? DETAIL_OUTLINE_PROMPT_CATEGORY');
    expect(panelSource).toContainSource(
      'const outlinePromptCategory = plotPointStandalone ? PLOT_CHAIN_PROMPT_CATEGORY : isDetailOutlineTab ? DETAIL_OUTLINE_PROMPT_CATEGORY : SUMMARY_PROMPT_CATEGORY;',
    );
    expect(panelSource).not.toContainSource("const PROMPT_SETTING_CATEGORY = '大纲';");
    expect(panelSource).not.toContainSource("const PLOT_CHAIN_PROMPT_CATEGORY = '剧情链';");
    expect(panelSource).toContainSource("'暂无设定提示词'");
    expect(panelSource).toContainSource('normalizePromptCategoryName(prompt.category) === PROMPT_SETTING_CATEGORY');
  });
  it('renames the chapter word replacement entry away from high-frequency wording', async () => {
    const chapterEditorSource = await readChapterEditorSource();
    const toolModalSource = await readEditorToolModalsSource();

    expect(chapterEditorSource).toContainSource('自动替换');
    expect(chapterEditorSource).not.toContainSource('>高频词<');
    expect(toolModalSource).toContainSource('词语替换设置');
    expect(toolModalSource).toContainSource('添加需要替换的词语');
    expect(toolModalSource).toContainSource('暂无替换词，请在下方添加');
    expect(toolModalSource).toContainSource('请输入需要替换的词语');
    expect(toolModalSource).not.toContainSource('高频词设置');
    expect(toolModalSource).not.toContainSource('添加需要高亮的高频词');
  });
  it('keeps production AI output boxes running through background tasks', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const aiPanelSource = await readWorkbenchAiPanelSource();
    const chapterEditorSource = await readChapterEditorSource();

    expect(panelSource).toContainSource("target: 'workbenchLibraryAi'");
    expect(panelSource).toContainSource("target: 'workbenchOutlineAi'");
    expect(panelSource).toContainSource("target: 'workbenchPlotPointAi'");
    expect(panelSource).toContainSource('subscribeBackgroundAiTasks(syncBackgroundTasks)');
    expect(panelSource).toContainSource('stopBackgroundAiTask');
    expect(panelSource).not.toContainSource('libraryAiAbortRef');

    expect(aiPanelSource).toContainSource("target: 'workbenchAiPanel'");
    expect(aiPanelSource).toContainSource('backgroundTaskId?: string');
    expect(aiPanelSource).toContainSource('subscribeBackgroundAiTasks(syncBackgroundTasks)');
    expect(aiPanelSource).not.toContainSource('abortControllerRef.current?.abort()');

    expect(chapterEditorSource).toContainSource("target: 'chapterReview'");
    expect(chapterEditorSource).toContainSource('writeReviewBackgroundTaskId');
    expect(chapterEditorSource).toContainSource('subscribeBackgroundAiTasks(syncBackgroundTasks)');
    expect(chapterEditorSource).not.toContainSource('reviewAiAbortRef');
  });
  it('keeps full plot point text when generated content contains a narrative colon', () => {
    const candidates = parseGeneratedPlotPointCandidates(
      [
        '1. 林刻猛地从课桌上惊醒，发现自己竟然回到了高考考场上，但周围一切又不太对劲——这不是三年前的高考，而是三年后他死去的那一刻！脑海深处突然响起机械声：“学霸修仙系统绑定成功，倒计时72小时，请宿主做好准备，三日后地球将迎来第一波灵气潮汐。”',
        'AI评价：这个开头直接建立主角处境和重生带来的震撼，同时立刻引入系统金手指和倒计时压力，制造紧迫感和悬念。',
      ].join('\n'),
    );

    expect(candidates).toHaveLength(1);
    expect(candidates[0].adapted).toContainSource('林刻猛地从课桌上惊醒');
    expect(candidates[0].adapted).toContainSource('脑海深处突然响起机械声');
    expect(candidates[0].adapted).toContainSource('学霸修仙系统绑定成功');
    expect(candidates[0].review).toContainSource('这个开头直接建立主角处境');
  });

  it('moves inline plot point AI review text out of the timeline preview body', () => {
    const item = {
      id: 'ai:inline-review',
      title: '缴费窗口冲突',
      source: 'AI生成',
      originalGenre: 'AI生成',
      original: '',
      adapted:
        '林刻盯着那份合同沉默几秒，最终还是咬破指尖按了下去。\\nAI评价：医院到武馆的切入把妹妹这条软肋立得很稳，压力直接。',
      variable: '',
      score: '82',
    } as const;

    const displayText = getWorkbenchPlotPointDisplayText(item, item.adapted);
    const reviewText = getWorkbenchPlotPointReview(item, true);

    expect(displayText).toContainSource('林刻盯着那份合同沉默几秒');
    expect(displayText).not.toContainSource('AI评价');
    expect(displayText).not.toContainSource('医院到武馆');
    expect(reviewText).toContainSource('AI评价：医院到武馆的切入');
  });
  it('places preview word counts on the top-left border beside frame titles', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(styleSource).toContainSource('.xy-floating-field .xy-floating-count.xy-floating-count-top-left');
    expect(styleSource).toContainSource(
      '.xy-floating-field.xy-floating-outline-preview .xy-floating-count.xy-floating-count-top-left',
    );
    expect(styleSource).toContainSource('left: var(--xy-floating-count-left, 6.2rem);');
    expect(styleSource).toContainSource('.xy-floating-field .xy-floating-count.xy-floating-count-top-left::before');
    expect(styleSource).toContainSource('left: -1.2rem;');
    expect(styleSource).toContainSource('top: 0;');
    expect(panelSource).toContainSource('xy-floating-count xy-floating-count-top-left');
    expect(panelSource).toContainSource(
      "<label className={isDetailOutlineTab ? 'xy-floating-title-count xy-detail-outline-title-count' : undefined}>",
    );
    expect(panelSource).toContainSource('<label aria-hidden="true" className="opacity-0">脑洞预览</label>');
    expect(panelSource).toContainSource('aria-label="脑洞名称"');
    expect(panelSource).toContainSource(
      'onChange={(event) => updateEntry(currentSelectedEntry.id, { title: event.target.value })}',
    );
    expect(panelSource).toContainSource(
      'xy-floating-title-input max-w-[120px] min-w-[58px] text-sm font-black leading-none text-slate-950 outline-none',
    );
    expect(panelSource).toContainSource('style={getFloatingTitleInputStyle(currentSelectedEntry.title, 3, 9)}');
    expect(panelSource).toContainSource('style={getFloatingTitleInputStyle(titleValue, 4, 12)}');
    expect(panelSource).toContainSource('<label className="xy-floating-title-count">');
    expect(panelSource).toContainSource(
      '<WordCountText value={countTextWords(currentSelectedSetting ? currentSelectedSetting.body : currentSelectedEntry.content)} />',
    );
    expect(panelSource).toContainSource(
      'xy-floating-inline-title-tool xy-brainstorm-floating-title-tool xy-floating-title-count xy-border-embedded-transparent-backplate',
    );
    expect(styleSource).toContainSource('.xy-floating-field.xy-floating-outline-preview label.xy-floating-title-count');
    expect(styleSource).toContainSource('gap: 0.32rem;');
    expect(styleSource).toContainSource('.xy-floating-title-count > span');
    expect(styleSource).toContainSource('width: var(--xy-floating-title-input-width, auto) !important;');
    expect(styleSource).toContainSource('border: 0 !important;');
    expect(styleSource).toContainSource('border-radius: 0 !important;');
    expect(styleSource).toContainSource('background: transparent !important;');
    expect(styleSource).toContainSource('padding: 0 !important;');
    expect(panelSource).toContainSource("'--xy-floating-title-input-width': `${normalizedLength.toFixed(2)}em`");
    expect(styleSource).toContainSource('height: 20px;');
    expect(styleSource).toContainSource('align-items: baseline;');
    expect(styleSource).toContainSource('font-size: 1rem;');
    expect(styleSource).toContainSource('font-weight: 500;');
    expect(styleSource).toContainSource('line-height: 20px;');
    expect(styleSource).toContainSource('display: block !important;');
    expect(styleSource).toContainSource('min-width: var(--xy-floating-title-input-width, auto) !important;');
    expect(styleSource).toContainSource('max-width: var(--xy-floating-title-input-width, auto) !important;');
    expect(styleSource).toContainSource('height: 20px !important;');
    expect(styleSource).toContainSource('min-height: 0 !important;');
    expect(styleSource).toContainSource('line-height: 20px !important;');
    expect(styleSource).toContainSource('top: 0 !important;');
    expect(styleSource).toContainSource('transform: translateY(-50%) !important;');
    const brainstormPreviewFieldRuleStart = styleSource.indexOf(
      '.xy-floating-field.xy-brainstorm-preview-field textarea {',
    );
    const brainstormPreviewFieldRule = styleSource.slice(
      brainstormPreviewFieldRuleStart,
      styleSource.indexOf(
        '.xy-floating-field.xy-floating-outline-preview .xy-floating-rich-preview',
        brainstormPreviewFieldRuleStart,
      ),
    );
    expect(brainstormPreviewFieldRule).toContainSource('border-color: #111827;');
    expect(styleSource).toContainSource('margin-top: -0.375rem;');
    expect(styleSource).toContainSource('padding-top: 0.625rem;');
    const brainstormOutputTitleToolRuleStart = styleSource.indexOf('.xy-brainstorm-output-title-tool {');
    const brainstormOutputTitleToolRule = styleSource.slice(
      brainstormOutputTitleToolRuleStart,
      styleSource.indexOf(
        '.xy-brainstorm-floating-title-tool .xy-floating-title-input',
        brainstormOutputTitleToolRuleStart,
      ),
    );
    expect(brainstormOutputTitleToolRule).not.toContainSource('translateY(calc(-50% - 1px))');
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
    expect(brainstormTitleToolRule).toContainSource('background-image: linear-gradient(');
    expect(inlineTitleToolRule).toContainSource('background-color: transparent !important;');
    expect(inlineTitleToolRule).not.toContainSource('background: transparent !important;');
    expect(panelSource).toContainSource('const outlineDraftCountLeft = plotPointStandalone');
    expect(panelSource).not.toContainSource(
      '章纲：<WordCountText value={countTextWords(outlineCardContent)} compact />',
    );
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

    expect(panelSource).not.toContainSource('const renderBrainstormAiSessionControls');
    expect(panelSource).not.toContainSource('renderBrainstormAiSessionControls()');
    expect(panelSource).not.toContainSource('addBrainstormAiSession');
    expect(panelSource).not.toContainSource('selectBrainstormAiSession');
  });

  it('uses a single clear button for brainstorm output actions', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(styleSource).not.toContainSource('.xy-floating-brainstorm-output-action-tool {');
    expect(styleSource).not.toContainSource('.xy-floating-edge-tool.xy-floating-brainstorm-session-tool');
    const outputListStart = panelSource.indexOf('xy-brainstorm-output-preview-list');
    const outputListEnd = panelSource.indexOf('className="min-h-0 space-y-3"', outputListStart);
    const outputListSource = panelSource.slice(outputListStart, outputListEnd);
    const actionGroupStart = panelSource.indexOf(
      '<div className="flex min-w-0 flex-wrap items-center gap-2">',
      outputListEnd,
    );
    const actionGroupSource = panelSource.slice(
      actionGroupStart,
      panelSource.indexOf('{settingLibraryMode ===', actionGroupStart),
    );

    expect(outputListSource).not.toContainSource('清空脑洞');
    expect(actionGroupStart).toBeGreaterThan(-1);
    expect(actionGroupSource).toContainSource('替换当前脑洞');
    expect(actionGroupSource).toContainSource('保存为新脑洞');
    expect(actionGroupSource).toContainSource('复制脑洞');
    expect(actionGroupSource).toContainSource('清空脑洞');
    expect(actionGroupSource).toContainSource('onClick={copyBrainstormOutputArea}');
    expect(actionGroupSource).toContainSource('onClick={clearBrainstormOutputArea}');
    expect(actionGroupSource).not.toContainSource('onClick={clearLibraryAiDialog}');
    expect(actionGroupSource).not.toContainSource('删除');
    expect(actionGroupSource).not.toContainSource('confirmDeleteEntry(currentSelectedEntry);');
    expect(panelSource).not.toContainSource(
      'px-2 text-[11px] font-bold text-gray-600 hover:bg-slate-50 hover:text-slate-900',
    );
  });
  it('removes white backplates from outline preview labels and edge text tools', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(styleSource).toContainSource('.xy-floating-field.xy-floating-outline-preview label');
    expect(styleSource).toContainSource('background-color: transparent;');
    expect(styleSource).toContainSource('.xy-floating-field.xy-floating-outline-preview .xy-floating-count');
    expect(styleSource).toContainSource('.xy-floating-outline-clear-button,');
    expect(styleSource).toContainSource('.xy-floating-inline-title-tool');
    expect(styleSource).toContainSource('text-shadow: none;');
    expect(styleSource).toContainSource('--xy-floating-backplate-bg: #F8FAFC;');
    expect(styleSource).toContainSource('-webkit-text-stroke: 3px var(--xy-floating-backplate-bg, #ffffff);');
    expect(styleSource).toContainSource('paint-order: stroke fill;');
    expect(styleSource).toContainSource('.xy-border-embedded-transparent-backplate::before,');
    expect(styleSource).toContainSource('.xy-floating-field.xy-floating-outline-preview label::before,');
    expect(styleSource).toContainSource('.xy-floating-field .xy-floating-count::before');
    expect(styleSource).toContainSource('height: 0.42em;');
    expect(styleSource).toContainSource('.xy-border-embedded-transparent-backplate:not(.absolute)');
    expect(styleSource).toContainSource('background-image: linear-gradient(');
    expect(styleSource).toContainSource('transparent calc(50% - 0.24em)');
    expect(styleSource).toContainSource('var(--xy-floating-backplate-bg, #ffffff) calc(50% + 0.24em)');
    expect(styleSource).toContainSource('background-size: 100% 100%');
    expect(panelSource).toContainSource(
      'xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-inner-clear-tool absolute z-40 px-1',
    );
    expect(styleSource).toContainSource('.xy-floating-outline-inner-clear-tool {');
    expect(styleSource).toContainSource('top: auto;');
    expect(styleSource).toContainSource('right: 1.55rem;');
    expect(styleSource).toContainSource('bottom: 0.75rem;');
    expect(styleSource).toContainSource('transform: none;');
    expect(panelSource).toContainSource(
      'xy-floating-inline-title-tool xy-brainstorm-output-title-tool xy-floating-title-count xy-border-embedded-transparent-backplate absolute top-0',
    );
    expect(panelSource).not.toContainSource('absolute -top-2 right-4 bg-white px-1');
    expect(panelSource).not.toContainSource(
      'absolute left-[104px] top-0 z-20 max-w-[calc(100%-232px)] -translate-y-1/2 bg-white px-1',
    );
    expect(panelSource).not.toContainSource('block max-w-[220px] truncate bg-white px-1');
  });

  it('uses the tested white empty state for chapter outline directories and removes the temporary test page route', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterEditorSource = await readChapterEditorSource();
    const chapterNumberButtonSource = await readChapterNumberButtonSource();
    const testCollectionSource = await readTestCollectionSource();

    expect(panelSource).toContainSource(
      'border-slate-200 bg-white text-slate-500 hover:border-[#08B3D9] hover:bg-[#EAF9FD] hover:text-[#078fb0]',
    );
    expect(chapterEditorSource).toContainSource("} from '@/shared/ui/ChapterNumberButton';");
    expect(chapterNumberButtonSource).toContainSource(
      "return 'xy-detail-outline-number-no-outline hover:border-[#08B3D9] hover:bg-[#EAF9FD] hover:text-[#078fb0]';",
    );
    expect(panelSource).not.toContainSource('repeating-linear-gradient(135deg, #f8fafc 0');
    expect(chapterEditorSource).not.toContainSource('repeating-linear-gradient(135deg, #f8fafc 0');
    expect(testCollectionSource).not.toContainSource('OutlineDirectoryStateTestPage');
    expect(testCollectionSource).not.toContainSource('/outline-directory-state-test');
  });

  it('keeps the main chapter writing surface on the white paper background', async () => {
    const styleSource = await readSharedStylesSource();
    const chapterEditorSource = await readChapterEditorSource();

    expect(styleSource).toContainSource('--xy-wa-editor-bg: #FFFFFF;');
    expect(styleSource).toContainSource('.xy-wa-editor-root {\n  background: var(--xy-wa-editor-bg);\n}');
    expect(styleSource).toContainSource('.xy-wa-editor-surface {\n  background: var(--xy-wa-editor-bg);\n}');
    expect(styleSource).toContainSource(
      '.xy-wa-editor-surface .xy-wa-editor-text-layer {\n  background: var(--xy-wa-editor-bg);\n}',
    );
    expect(styleSource).not.toContainSource('.xy-wa-editor-paragraph-overlay > span {');
    expect(styleSource).not.toContainSource('text-indent: 2em;');
    expect(chapterEditorSource).toContainSource(
      'className="xy-wa-editor-root flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden"',
    );
    expect(chapterEditorSource).toContainSource(
      'className="xy-wa-editor-surface relative min-h-0 flex-1 overflow-hidden"',
    );
    expect(chapterEditorSource).toContainSource(
      'className="xy-wa-editor-text-layer editor-scrollbar relative z-10 h-full min-h-0 w-full resize-none border-0 bg-transparent pb-6 pt-3 outline-none"',
    );
    expect(chapterEditorSource).toContainSource('paddingLeft: editorTextPaddingLeft');
    expect(chapterEditorSource).toContainSource('paddingRight: editorTextPaddingRight');
    expect(chapterEditorSource).toContainSource('color: fontSettings.fontColor');
    expect(chapterEditorSource).not.toContainSource(
      "color: formatSettings.paragraphIndent ? 'transparent' : fontSettings.fontColor",
    );
    expect(chapterEditorSource).not.toContainSource('textIndent: editorTextIndent');
    expect(chapterEditorSource).not.toContainSource('overflow-hidden bg-[#f5f5f7]');
    expect(chapterEditorSource).not.toContainSource('px-6 pb-6 pt-10 outline-none');
  });

  it('keeps paragraph indentation as real textarea text instead of overlay text', async () => {
    const chapterEditorSource = await readChapterEditorSource();
    const modalSource = await readEditorToolModalsSource();

    expect(chapterEditorSource).toContainSource(
      'const normalizeEditorText = (value: string) => applyParagraphIndentToText(value, formatSettings.paragraphIndent);',
    );
    expect(chapterEditorSource).toContainSource(
      'const editorTextPaddingLeft = `${EDITOR_GRID_LINE_LEFT_OFFSET_PX}px`;',
    );
    expect(chapterEditorSource).toContainSource(
      'const editorTextPaddingRight = `${EDITOR_GRID_LINE_RIGHT_OFFSET_PX}px`;',
    );
    expect(chapterEditorSource).not.toContainSource(
      "const editorTextIndent = formatSettings.paragraphIndent ? '2em' : undefined;",
    );
    expect(chapterEditorSource).toContainSource('const cleanedPaste = stripLineIndents(pasted);');
    expect(chapterEditorSource).toContainSource(
      "const insertText = formatSettings.paragraphIndent ? '\\n\\u3000\\u3000' : '\\n';",
    );
    expect(chapterEditorSource).not.toContainSource('paragraphIndent={formatSettings.paragraphIndent}');
    expect(chapterEditorSource).not.toContainSource('keepSelectionOutOfParagraphIndent');
    expect(chapterEditorSource).not.toContainSource('normalizeParagraphIndents');
    expect(modalSource).toContainSource('const editorTextPaddingLeft = `${EDITOR_GRID_LINE_LEFT_OFFSET_PX}px`;');
    expect(modalSource).toContainSource('const editorTextPaddingRight = `${EDITOR_GRID_LINE_RIGHT_OFFSET_PX}px`;');
    expect(modalSource).not.toContainSource("const editorTextIndent = paragraphIndent ? '2em' : undefined;");
    expect(modalSource).toContainSource('export function applyParagraphIndentToText(text: string, enabled: boolean)');
    expect(modalSource).not.toContainSource('xy-wa-editor-paragraph-overlay');
    expect(modalSource).not.toContainSource("color: paragraphIndent ? fontSettings.fontColor : 'transparent'");
    expect(modalSource).not.toContainSource('normalizeParagraphIndents');
  });

  it('matches audit comment and status chapter directories to the detail outline volume style without losing summary actions', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterEditorSource = await readChapterEditorSource();
    const chapterNumberButtonSource = await readChapterNumberButtonSource();

    expect(chapterEditorSource).toContainSource('volumes?: Volume[]');
    expect(chapterEditorSource).toContainSource('const chapterDirectoryGroups = useMemo(() => {');
    expect(chapterEditorSource).toContainSource(
      'chapters: [...volume.chapters].sort((a, b) => a.serialNumber - b.serialNumber)',
    );
    expect(chapterEditorSource).toContainSource(
      "return [{ id: 0, name: '章节目录', chapters: sortedReviewChapters }];",
    );
    expect(chapterEditorSource).toContainSource(
      'const [expandedReviewVolumeIds, setExpandedReviewVolumeIds] = useState<Set<number>>(() => new Set());',
    );
    expect(chapterEditorSource).toContainSource(
      'const [expandedStatusVolumeIds, setExpandedStatusVolumeIds] = useState<Set<number>>(() => new Set());',
    );
    expect(chapterEditorSource).toContainSource('const toggleReviewDirectoryVolume = (volumeId: number) => {');
    expect(chapterEditorSource).toContainSource('const toggleStatusDirectoryVolume = (volumeId: number) => {');
    expect(chapterEditorSource).toContainSource('chapterDirectoryGroups.forEach((group) => next.add(group.id));');
    expect(chapterEditorSource).toContainSource('onClick={() => toggleReviewDirectoryVolume(group.id)}');
    expect(chapterEditorSource).toContainSource('onClick={() => toggleStatusDirectoryVolume(group.id)}');
    expect(chapterEditorSource).toContainSource(
      '<aside className="flex min-h-0 flex-col border-r border-slate-100 bg-gray-50 px-1 py-2">',
    );
    expect(chapterEditorSource).toContainSource(
      '<div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto">',
    );
    expect(chapterEditorSource).not.toContainSource(
      '<aside className="flex min-h-0 flex-col border-r border-slate-100 bg-white px-3 py-3">',
    );
    expect(chapterEditorSource).not.toContainSource(
      '<div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">',
    );
    expect(chapterEditorSource).not.toContainSource("{reviewMode === 'audit' ? '审核目录' : '点评目录'}");
    expect(chapterEditorSource).not.toContainSource('审核目录');
    expect(chapterEditorSource).not.toContainSource('点评目录');
    expect(chapterEditorSource).not.toContainSource(
      '<div className="mb-3 text-sm font-black text-slate-900">章节目录</div>',
    );
    expect(chapterEditorSource).toContainSource('className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}');
    expect(chapterEditorSource).toContainSource('const GroupFolderIcon = expanded ? FolderOpen : Folder;');
    expect(chapterEditorSource).toContainSource('<GroupFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />');
    expect(chapterEditorSource).not.toContainSource(
      'className="group flex h-[36px] w-full cursor-pointer items-center gap-1 rounded-md bg-brand-light px-2 py-1.5 text-left transition-colors hover:bg-brand/10"',
    );
    expect(chapterEditorSource).not.toContainSource(
      '<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-brand-dark">',
    );
    expect(chapterEditorSource).toContainSource(
      '<span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{group.chapters.length}章</span>',
    );
    expect(chapterEditorSource).toContainSource('CHAPTER_NUMBER_GRID_STYLE as WORKBENCH_CHAPTER_NUMBER_GRID_STYLE');
    expect(chapterEditorSource).toContainSource('style={WORKBENCH_CHAPTER_NUMBER_GRID_STYLE}');
    expect(chapterEditorSource).toContainSource('<ChapterNumberButton');
    expect(chapterNumberButtonSource).toContainSource(
      'relative grid h-8 w-8 place-items-center rounded-lg border text-center text-sm font-black leading-none transition-colors xy-detail-outline-number-block',
    );
    expect(chapterNumberButtonSource).toContainSource("selected ? 'xy-detail-outline-number-selected' : ''");
    expect(chapterNumberButtonSource).toContainSource(
      "'xy-detail-outline-number-no-outline hover:border-[#08B3D9] hover:bg-[#EAF9FD] hover:text-[#078fb0]'",
    );
    expect(chapterEditorSource).not.toContainSource(
      "'border-transparent xy-detail-outline-number-selected xy-selected-orange-bg text-slate-900'",
    );
    expect(chapterEditorSource).not.toContainSource("groupHasSelectedChapter ? 'xy-selected-orange-bg' : ''");
    expect(chapterEditorSource).toContainSource('statusUpdatedChapterIds.has(item.id)');
    expect(chapterNumberButtonSource).toContainSource(
      "'xy-detail-outline-number-used hover:border-[#067B96] hover:bg-[#D3EEF5]'",
    );
    expect(chapterEditorSource).not.toContainSource(
      '<span className="text-sm font-black text-slate-900">章节位置</span>',
    );
    expect(chapterEditorSource).not.toContainSource(
      '<span className="inline-flex items-center gap-1"><i className="h-3 w-3 rounded bg-[#08B3D9]" />已更新</span>',
    );
    expect(chapterEditorSource).not.toContainSource(
      '<span className="inline-flex items-center gap-1"><i className="h-3 w-3 rounded border border-slate-200 bg-slate-50" />未更新</span>',
    );
    expect(panelSource).toContainSource('卷梗概');
    expect(panelSource).toContainSource('const enableVolumeSummary = !isDetailOutlineTab;');
    expect(panelSource).toContainSource(
      "const volumeIsSelected = safeOutlineSelectionType === 'volume' && selectedOutlineVolume?.id === volume.id;",
    );
    expect(panelSource).toContainSource('selectOutlineVolume(volume);');
    const summaryChapterButtonSources = Array.from(
      panelSource.matchAll(/const outlineButtonClass = `relative h-9 min-w-9[\s\S]*?\}\`;/g),
      (match) => match[0],
    );
    expect(summaryChapterButtonSources.length).toBeGreaterThanOrEqual(2);
    summaryChapterButtonSources.forEach((buttonSource) => {
      expect(buttonSource).toContainSource("? 'border-[#08B3D9] bg-[#EAF9FD] text-[#078fb0]'");
      expect(buttonSource).not.toContainSource("? 'border-transparent xy-selected-orange-bg text-slate-900'");
    });
    expect(panelSource).toContainSource('if (isDetailOutlineTab) {');
    expect(panelSource).toContainSource('<ChapterNumberButton');
    expect(panelSource).toContainSource(
      '<nav className="editor-scrollbar min-h-0 flex-1 overflow-y-auto" aria-label="剧情链目录树">',
    );
    expect(panelSource).toContainSource("isDetailOutlineTab ? 'bg-gray-50' : 'bg-gray-50 px-1 py-2'");
    expect(panelSource).not.toContainSource(
      '<nav className="editor-scrollbar min-h-0 flex-1 overflow-y-auto pr-1" aria-label="剧情链目录树">',
    );
    expect(panelSource).not.toContainSource("isDetailOutlineTab ? 'bg-[#F8FAFC]' : 'bg-gray-50 px-3 py-3'");
    expect(panelSource).toContainSource('<div className="grid grid-cols-1 gap-3">');
    expect(panelSource).not.toContainSource("isDetailOutlineTab ? 'grid-cols-1' : 'grid-cols-2'");
  });

  it('splits the review preview area into outline, original text, and AI annotation panes', async () => {
    const chapterEditorSource = await readChapterEditorSource();

    expect(chapterEditorSource).toContainSource('type ReviewAnnotation = {');
    expect(chapterEditorSource).toContainSource('function extractReviewAnnotations(output: string)');
    expect(chapterEditorSource).toContainSource('const reviewAnnotationsByParagraph = useMemo(() => {');
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_PREVIEW_OUTLINE_VISIBLE_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_outline_visible';",
    );
    expect(chapterEditorSource).toContainSource('function readReviewPreviewOutlineVisible() {');
    expect(chapterEditorSource).toContainSource(
      "return localStorage.getItem(REVIEW_PREVIEW_OUTLINE_VISIBLE_STORAGE_KEY) !== 'false';",
    );
    expect(chapterEditorSource).toContainSource(
      'const [showReviewOutline, setShowReviewOutline] = useState(() => readReviewPreviewOutlineVisible());',
    );
    expect(chapterEditorSource).toContainSource(
      'localStorage.setItem(REVIEW_PREVIEW_OUTLINE_VISIBLE_STORAGE_KEY, String(nextShowReviewOutline));',
    );
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_font_size';",
    );
    expect(chapterEditorSource).toContainSource('function readReviewPreviewFontSize() {');
    expect(chapterEditorSource).toContainSource(
      'const [reviewPreviewFontSize, setReviewPreviewFontSize] = useState(() => readReviewPreviewFontSize());',
    );
    expect(chapterEditorSource).toContainSource(
      'const setReviewPreviewFontSizeWithStorage = (nextFontSize: number) => {',
    );
    expect(chapterEditorSource).toContainSource(
      'localStorage.setItem(REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY, String(fontSize));',
    );
    expect(chapterEditorSource).toContainSource('onChange={setReviewPreviewFontSizeWithStorage}');
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_MODEL_ID_STORAGE_KEY = 'xinyuexia_chapter_editor_review_model_id';",
    );
    expect(chapterEditorSource).toContainSource('function readReviewModelId() {');
    expect(chapterEditorSource).toContainSource("return localStorage.getItem(REVIEW_MODEL_ID_STORAGE_KEY) ?? '';");
    expect(chapterEditorSource).toContainSource(
      'const [reviewModelId, setReviewModelId] = useState(() => readReviewModelId());',
    );
    expect(chapterEditorSource).toContainSource('const setReviewModelIdWithStorage = (nextModelId: string) => {');
    expect(chapterEditorSource).toContainSource('localStorage.setItem(REVIEW_MODEL_ID_STORAGE_KEY, nextModelId);');
    expect(chapterEditorSource).toContainSource('onModelChange={setReviewModelIdWithStorage}');
    expect(chapterEditorSource).not.toContainSource('onModelChange={setReviewModelId}');
    expect(chapterEditorSource).toContainSource("type ReviewPreviewWidthMode = 'locked' | 'free';");
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_PREVIEW_WIDTH_MODE_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_width_mode';",
    );
    expect(chapterEditorSource).toContainSource(
      "const REVIEW_PREVIEW_TEXT_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_editor_review_preview_text_width';",
    );
    expect(chapterEditorSource).toContainSource('const REVIEW_PREVIEW_TEXT_WIDTH = 420;');
    expect(chapterEditorSource).toContainSource('const REVIEW_PREVIEW_TEXT_WIDTH_LIMIT = { min: 240, max: 760 };');
    expect(chapterEditorSource).toContainSource('const REVIEW_PREVIEW_SEPARATOR_WIDTH = 7;');
    expect(chapterEditorSource).toContainSource('function readReviewPreviewWidthMode(): ReviewPreviewWidthMode {');
    expect(chapterEditorSource).toContainSource(
      'const [reviewPreviewTextWidth, setReviewPreviewTextWidth] = useState(() => readStoredPanelWidth(REVIEW_PREVIEW_TEXT_WIDTH_STORAGE_KEY, REVIEW_PREVIEW_TEXT_WIDTH, REVIEW_PREVIEW_TEXT_WIDTH_LIMIT));',
    );
    expect(chapterEditorSource).toContainSource(
      'const [reviewPreviewWidthMode, setReviewPreviewWidthMode] = useState<ReviewPreviewWidthMode>(() => readReviewPreviewWidthMode());',
    );
    expect(chapterEditorSource).toContainSource(
      'const [reviewPreviewUsesCustomTextWidth, setReviewPreviewUsesCustomTextWidth] = useState(false);',
    );
    expect(chapterEditorSource).toContainSource(
      'const getBalancedReviewPreviewTextWidth = (nextOutlineWidth = reviewPreviewOutlineWidth, nextShowOutline = effectiveShowReviewOutline) => {',
    );
    expect(chapterEditorSource).toContainSource(
      'const syncReviewPreviewTextColumnsWidth = (nextOutlineWidth = reviewPreviewOutlineWidth, nextShowOutline = effectiveShowReviewOutline) => {',
    );
    expect(chapterEditorSource).toContainSource(
      'const setReviewPreviewWidthModeWithStorage = (nextMode: ReviewPreviewWidthMode) => {',
    );
    expect(chapterEditorSource).toContainSource("if (nextMode === 'free') {");
    expect(chapterEditorSource).toContainSource('setReviewPreviewUsesCustomTextWidth(false);');
    expect(chapterEditorSource).not.toContainSource(
      'const REVIEW_PREVIEW_ANNOTATION_WIDTH_LIMIT = { min: 300, max: 640 };',
    );
    expect(chapterEditorSource).not.toContainSource(
      'const REVIEW_PREVIEW_ANNOTATION_WIDTH_LIMIT = { min: 360, max: 640 };',
    );
    expect(chapterEditorSource).not.toContainSource(
      'const reviewPreviewGridTemplateColumns = effectiveShowReviewOutline',
    );
    expect(chapterEditorSource).toContainSource(
      'const reviewPreviewHiddenTextColumnMinWidth = `calc((100% - ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px) / 3)`;',
    );
    expect(chapterEditorSource).toContainSource(
      'const reviewPreviewFreeTextColumnMinWidth = effectiveShowReviewOutline',
    );
    expect(chapterEditorSource).toContainSource(
      "const reviewPreviewUseFreeCustomWidth = reviewPreviewWidthMode === 'free' && reviewPreviewUsesCustomTextWidth;",
    );
    expect(chapterEditorSource).toContainSource(
      'const reviewPreviewGridTemplateColumns = !reviewPreviewUseFreeCustomWidth',
    );
    expect(chapterEditorSource).toContainSource(
      '`${reviewPreviewOutlineWidth}px ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(0, 1fr) ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(0, 1fr)`',
    );
    expect(chapterEditorSource).toContainSource(
      '`minmax(${reviewPreviewHiddenTextColumnMinWidth}, 1fr) ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(${reviewPreviewHiddenTextColumnMinWidth}, 1fr)`',
    );
    expect(chapterEditorSource).toContainSource(
      '`${reviewPreviewOutlineWidth}px ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(${reviewPreviewFreeTextColumnMinWidth}, ${reviewPreviewTextWidth}px) ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(${reviewPreviewFreeTextColumnMinWidth}, 1fr)`',
    );
    expect(chapterEditorSource).toContainSource(
      '`minmax(${reviewPreviewHiddenTextColumnMinWidth}, ${reviewPreviewTextWidth}px) ${REVIEW_PREVIEW_SEPARATOR_WIDTH}px minmax(${reviewPreviewHiddenTextColumnMinWidth}, 1fr)`',
    );
    expect(chapterEditorSource).not.toContainSource(
      '`${reviewPreviewOutlineWidth}px 7px ${reviewPreviewAnnotationWidth}px 7px ${reviewPreviewAnnotationWidth}px`',
    );
    expect(chapterEditorSource).not.toContainSource(
      '`minmax(${reviewPreviewHiddenTextColumnMinWidth}, 1fr) 7px minmax(${reviewPreviewHiddenTextColumnMinWidth}, ${reviewPreviewAnnotationWidth}px)`',
    );
    expect(chapterEditorSource).not.toContainSource(
      '`${reviewPreviewOutlineWidth}px 7px minmax(0,1fr) 7px ${reviewPreviewAnnotationWidth}px`',
    );
    expect(chapterEditorSource).not.toContainSource('`minmax(0,1fr) 7px ${reviewPreviewAnnotationWidth}px`');
    expect(chapterEditorSource).toContainSource('reviewPreviewOutlineResizeHandle');
    expect(chapterEditorSource).toContainSource('reviewPreviewTextResizeHandle');
    expect(chapterEditorSource).toContainSource('renderReviewPreviewColumnSeparator()');
    expect(chapterEditorSource).toContainSource('reviewPreviewTextColumnSeparator');
    expect(chapterEditorSource).not.toContainSource('reviewPreviewAnnotationResizeHandle');
    expect(chapterEditorSource).toContainSource('第${activeReviewChapter.serialNumber}章 章纲');
    expect(chapterEditorSource).toContainSource("['locked', '等宽锁定'] as const");
    expect(chapterEditorSource).toContainSource("['free', '自由调节'] as const");
    expect(chapterEditorSource).toContainSource('onClick={() => setReviewPreviewWidthModeWithStorage(mode)}');
    expect(chapterEditorSource).not.toContainSource('const reviewPreviewTextColumnsWidthLabel');
    expect(chapterEditorSource).not.toContainSource('原文/审核同宽');
    expect(chapterEditorSource).not.toContainSource('原文/润色后同宽');
    expect(chapterEditorSource).toContainSource(
      "const reviewPreviewOriginalTitle = activeReviewChapter ? `第${activeReviewChapter.serialNumber}章 原文` : '原文';",
    );
    expect(chapterEditorSource).toContainSource('const reviewPreviewAnnotationTitle = activeReviewChapter');
    expect(chapterEditorSource).not.toContainSource('润色前');
    expect(chapterEditorSource).toContainSource('AI标注');
    expect(chapterEditorSource).not.toContainSource('AI 返回“原文标注”JSON 后，这里会高亮问题片段并显示审核说明。');
    expect(chapterEditorSource).toContainSource('renderAnnotatedReviewParagraph(paragraph, paragraphAnnotations)');
  });

  it('syncs published and library group rows to the body folder navigation style', async () => {
    const chapterSidebarSource = await readChapterSidebarSource();
    const publishedSidebarSource = await readPublishedSidebarSource();
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterEditorSource = await readChapterEditorSource();
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();
    const testCollectionSource = await readTestCollectionSource();

    for (const source of [chapterSidebarSource, publishedSidebarSource, panelSource, chapterEditorSource]) {
      expect(source).toContainSource('WORKBENCH_FOLDER_GROUP');
      expect(source).toContainSource('WORKBENCH_FOLDER_GROUP_ICON_CLASS');
      expect(source).toContainSource('WORKBENCH_FOLDER_GROUP_COUNT_CLASS');
      expect(source).toContainSource('FolderOpen');
      expect(source).toContainSource('Folder');
    }
    expect(constantsSource).toContainSource('border-[#BDEEF7] xy-flow-group-bg');
    expect(constantsSource).toContainSource(
      "export const WORKBENCH_FOLDER_GROUP_ICON_CLASS = 'h-[17px] w-[17px] shrink-0 text-[#08AACE]';",
    );
    expect(constantsSource).toContainSource('font-black text-[#1f2933]');
    expect(constantsSource).toContainSource(
      "export const WORKBENCH_FOLDER_GROUP_COUNT_CLASS = 'rounded-full bg-white/70 px-2 py-0.5 text-xs font-black text-[#6f7e90]';",
    );

    expect(chapterSidebarSource).toContainSource('const VolumeFolderIcon = volume.isExpanded ? FolderOpen : Folder;');
    expect(chapterSidebarSource).toContainSource('<VolumeFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />');
    expect(publishedSidebarSource).toContainSource('const VolumeFolderIcon = expanded ? FolderOpen : Folder;');
    expect(publishedSidebarSource).toContainSource('aria-expanded={expanded}');
    expect(publishedSidebarSource).toContainSource("chapter.isSelected ? 'border-transparent xy-selected-mint-bg'");
    expect(publishedSidebarSource).not.toContainSource('volumeHasSelectedChapter');
    expect(publishedSidebarSource).not.toContainSource('border-orange-400 bg-orange-50');
    expect(publishedSidebarSource).not.toContainSource('text-orange-600');

    expect(panelSource).toContainSource('const GroupFolderIcon = expanded ? FolderOpen : Folder;');
    expect(panelSource).toContainSource('const GroupFolderIcon = collapsed ? Folder : FolderOpen;');
    expect(panelSource).toContainSource('const VolumeFolderIcon = expanded ? FolderOpen : Folder;');
    expect(panelSource).toContainSource('<GroupFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />');
    expect(panelSource).toContainSource('<VolumeFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />');
    expect(panelSource).not.toContainSource("groupHasSelectedEntry ? 'xy-selected-orange-bg' : ''");
    expect(panelSource).not.toContainSource("groupHasCheckedItem ? 'xy-selected-orange-bg' : ''");
    expect(panelSource).not.toContainSource('volumeHasSelectedOutlineChapter');
    expect(panelSource).toContainSource(
      "volumeIsSelected\n                                ? 'border-brand bg-brand text-white'",
    );
    expect(panelSource).toContainSource('xy-selected-mint-bg text-gray-900');
    expect(panelSource).toContainSource('xy-selected-content-bg text-slate-900');
    expect(panelSource).not.toContainSource(
      'className="group flex h-[36px] items-center gap-1 rounded-md bg-brand-light px-2 py-1.5 transition-colors hover:bg-brand/10"',
    );
    expect(panelSource).not.toContainSource(
      'className="group flex h-[36px] cursor-pointer items-center gap-1 rounded-md bg-brand-light px-2 py-1.5 transition-colors hover:bg-brand/10"',
    );
    expect(testCollectionSource).not.toContainSource('ChapterGroupColorOptionsTestPage');
    expect(testCollectionSource).not.toContainSource('/chapter-group-color-options-test');
  });

  it('opens setting and role groups by default when the settings page starts', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).not.toContainSource(
      "if (hasStoredExpandedStringSet(storageKey, ROLE_TAB, 'role_types')) return;",
    );
    expect(panelSource).toContainSource('roleTypeOptions.forEach((type) => next.add(type));');
    expect(panelSource).toContainSource('roleExpandedReloadRef.current = true;');
    expect(panelSource).not.toContainSource(
      "if (hasStoredExpandedStringSet(storageKey, activeTab, 'setting_types')) return;",
    );
    expect(panelSource).toContainSource('settingTypeOptions.forEach((type) => next.add(type));');
    expect(panelSource).toContainSource('settingExpandedReloadRef.current = true;');
  });

  it('keeps workbench model selects synchronized after model management changes', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterEditorSource = await readChapterEditorSource();
    const modelHookSource = await readModelHookSource();

    expect(panelSource).toContainSource("import { useModels } from '@/features/models/hooks/useModels';");
    expect(panelSource).toContainSource('const { models: modelSnapshot } = useModels();');
    expect(panelSource).toContainSource(
      'const models = useMemo(() => modelSnapshot.filter((model) => model.enabled), [modelSnapshot]);',
    );
    expect(panelSource).not.toContainSource("import { readModelSnapshot } from '@/features/models/hooks/useModels';");
    expect(panelSource).not.toContainSource(
      'const models = useMemo(() => readModelSnapshot().filter((model) => model.enabled), []);',
    );
    expect(chapterEditorSource).toContainSource("import { useModels } from '@/features/models/hooks/useModels';");
    expect(chapterEditorSource).toContainSource('const { models: modelSnapshot } = useModels();');
    expect(chapterEditorSource).toContainSource(
      'const reviewModels = useMemo(() => modelSnapshot.filter((model) => model.enabled), [modelSnapshot]);',
    );
    expect(chapterEditorSource).not.toContainSource(
      "import { readModelSnapshot } from '@/features/models/hooks/useModels';",
    );
    expect(chapterEditorSource).not.toContainSource(
      'const reviewModels = useMemo(() => readModelSnapshot().filter((model) => model.enabled), []);',
    );
    expect(modelHookSource).not.toContainSource('function syncEnvModel');
    expect(modelHookSource).not.toContainSource('import.meta.env.VITE_PINAI_API_KEY');
    expect(modelHookSource).toContainSource(
      'function writeModels(models: ModelItem[], options: { notify?: boolean } = {})',
    );
    expect(modelHookSource).toContainSource(
      'if (options.notify !== false) window.dispatchEvent(new CustomEvent(APP_EVENTS.modelsUpdated));',
    );
    expect(modelHookSource).toContainSource('if (!raw) return [];');
    expect(modelHookSource).toContainSource('writeModels(models, { notify: false });');
  });

  it('keeps the brainstorm question panel fixed without scrollbar layout classes', async () => {
    const source = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(source).toContainSource('xy-brainstorm-question-panel');
    expect(source).toContainSource(
      'xy-brainstorm-question-panel xy-shellless-panel editor-scrollbar min-h-0 flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-0 py-2',
    );
    expect(source).toContainSource('flex min-h-full flex-col gap-4 pt-2');
    expect(source).toContainSource('grid shrink-0 grid-cols-2 gap-4 text-sm font-bold text-gray-700');
    expect(source).not.toContainSource(
      'xy-brainstorm-question-panel editor-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-xl border border-gray-200 bg-white p-3',
    );
    expect(source).not.toContainSource('xy-brainstorm-count-options');
    expect(source).not.toContainSource(
      'editor-scrollbar min-h-0 flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3',
    );
    expect(source).not.toContainSource('flex h-[60px] items-center gap-2 px-4 pt-3');
    expect(styleSource).toContainSource(
      '.xy-brainstorm-question-panel .xy-floating-field.xy-floating-outline-fixed label::before',
    );
    expect(styleSource).toContainSource(
      '.xy-brainstorm-question-panel .xy-floating-field.xy-floating-outline-fixed label,',
    );
    expect(styleSource).toContainSource('font-size: 1rem;');
    expect(styleSource).toContainSource('font-weight: 500;');
    expect(styleSource).toContainSource('line-height: 20px;');
  });

  it('records the reusable shellless panel technique for brainstorm fields', async () => {
    const styleSource = await readSharedStylesSource();

    expect(styleSource).toContainSource('.xy-shellless-panel {');
    expect(styleSource).toContainSource('border: 0;');
    expect(styleSource).toContainSource('border-radius: 0;');
    expect(styleSource).toContainSource('background: transparent;');
    expect(styleSource).toContainSource('box-shadow: none;');
  });

  it('records shellless techniques while official right panels avoid soft card wrappers', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterSource = await readChapterEditorSource();
    const styleSource = await readSharedStylesSource();

    expect(styleSource).toContainSource('.xy-shellless-panel {');
    expect(styleSource).toContainSource('.xy-soft-shell-panel {');
    expect(panelSource).not.toContainSource(
      '<div className="mt-3 shrink-0 text-sm font-bold leading-6 text-gray-600">',
    );
    expect(chapterSource).toContainSource('mt-3 text-xs font-bold leading-5 text-slate-500');
    expect(panelSource).not.toContainSource('xy-soft-shell-panel mt-3 p-3');
    expect(chapterSource).not.toContainSource('xy-soft-shell-panel p-3 text-xs leading-5 text-slate-500');
  });

  it('removes AI dialogue labels from library generator output cards', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).not.toContainSource('AI对话框');
  });

  it('renders brainstorm count as a sequential-only segmented button group aligned to the input left edge', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const countButtonStart = panelSource.indexOf("{['3', '5', '10'].map((value) => {");
    const generateButtonStart = panelSource.indexOf('onClick={openBrainstormGenerateConfirm}', countButtonStart);
    const countButtonSource = panelSource.slice(countButtonStart, generateButtonStart);

    expect(countButtonStart).toBeGreaterThan(-1);
    expect(generateButtonStart).toBeGreaterThan(countButtonStart);
    expect(panelSource).not.toContainSource('xy-brainstorm-count-field');
    expect(panelSource).not.toContainSource('xy-brainstorm-count-options');
    expect(panelSource).toContainSource('逐个生成几个脑洞');
    expect(panelSource).not.toContainSource('一次生成几个脑洞');
    expect(panelSource).not.toContainSource("['sequential', '逐个']");
    expect(panelSource).not.toContainSource("['batch', '一次']");
    expect(panelSource).not.toContainSource('brainstormGenerateMode');
    expect(panelSource).toContainSource('<span className="shrink-0 text-sm font-black text-slate-950">逐个生成</span>');
    expect(panelSource).toContainSource("{isLibraryAiLoading ? '生成中...' : '逐个生成'}");
    expect(panelSource).not.toContainSource(
      '<span className="shrink-0 text-sm font-black text-slate-950">生成个数：</span>',
    );
    expect(panelSource).toContainSource('<div className="mt-2 flex items-center gap-3">');
    expect(panelSource).toContainSource('<div className="flex min-w-0 flex-1 items-center gap-2">');
    expect(panelSource).toContainSource(
      'flex h-8 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white',
    );
    expect(countButtonSource).toContainSource("setBrainstormQuestionField('brainstormCount', active ? '' : value)");
    expect(countButtonSource).toContainSource('last:border-r-0');
    expect(countButtonSource).not.toContainSource("'1'");
    expect(countButtonSource).not.toContainSource("'2'");
    expect(countButtonSource).not.toContainSource('3个');
  });

  it('keeps brainstorm request headers out of visible generated output', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const buildStart = panelSource.indexOf(
      'const buildBrainstormPromptFromQuestions = (draft: BrainstormQuestionDraft) => {',
    );
    const buildEnd = panelSource.indexOf('const openBrainstormGenerateConfirm = () => {', buildStart);
    const buildSource = panelSource.slice(buildStart, buildEnd);
    const latestUsefulStart = panelSource.indexOf('function getLatestUsefulAiText(content: string)');
    const latestUsefulEnd = panelSource.indexOf('function getBrainstormEntryBody', latestUsefulStart);
    const latestUsefulSource = panelSource.slice(latestUsefulStart, latestUsefulEnd);

    expect(panelSource).toContainSource(
      "const BRAINSTORM_OUTPUT_ONLY_INSTRUCTION = '请直接输出实际脑洞内容，不要复述提示词、其他要求、题材、故事主题等标签。';",
    );
    expect(panelSource).toContainSource("const BRAINSTORM_REQUEST_HEADER = '【以下是用户输出的内容】';");
    expect(panelSource).toContainSource("const BRAINSTORM_OTHER_REQUIREMENTS_HEADER = '【其他要求】';");
    expect(panelSource).toContainSource(
      "const BRAINSTORM_GENERATE_TASK_TEXT = '请根据以下信息，生成一个可以保存进脑洞库的小说脑洞设定。';",
    );
    expect(panelSource).toContainSource(
      "const BRAINSTORM_GENERATE_RULE_TEXT = '要求：内容要具体、可继续扩展，避免只复述问题；如果信息不足，请合理补全但不要偏离用户要求。';",
    );
    expect(panelSource).toContainSource('function stripBrainstormRequestHeader(content: string)');
    expect(panelSource).toContainSource('function isBrainstormEchoedRequest(content: string, requestText: string)');
    expect(panelSource).toContainSource('function getBrainstormOtherRequirementsBlock(requestText: string)');
    expect(panelSource).toContainSource('function getBrainstormDisplayContent(content: string, requestText: string)');
    expect(panelSource).toContainSource(
      'const clean = stripBrainstormRequestHeader(stripAiThinkingBlock(text)).trim();',
    );
    expect(panelSource).toContainSource(
      "? [baseModelPrompt, BRAINSTORM_OUTPUT_ONLY_INSTRUCTION].filter(Boolean).join('\\n\\n')",
    );
    expect(panelSource).toContainSource('options: { visibleText?: string; previewCount?: number } = {},');
    expect(panelSource).toContainSource('const visibleUserText = (options.visibleText ?? text).trim();');
    expect(panelSource).toContainSource('const visibleText = stripBrainstormRequestHeader(promptText);');
    expect(panelSource).toContainSource('void sendLibraryAiMessage(promptText, { visibleText, previewCount });');
    expect(panelSource).toContainSource(
      'const brainstormStreamDisplay = stripBrainstormRequestHeader(streamedContent.trimStart());',
    );
    expect(panelSource).toContainSource("target: 'workbenchLibraryAi'");
    expect(panelSource).toContainSource('function getBrainstormBackgroundTaskResult(task: BackgroundAiTask)');
    expect(panelSource).toContainSource(
      'const otherRequirements = normalizeBrainstormEchoText(getBrainstormOtherRequirementsBlock(requestText));',
    );
    expect(panelSource).toContainSource('output === request || output === otherRequirements');
    expect(panelSource).toContainSource('? getBrainstormDisplayContent(content, requestText)');
    expect(panelSource).toContainSource('【错误】模型只复述了输入内容，没有生成脑洞。请重试，或换一个提示词/模型。');
    expect(panelSource).toContainSource('【错误】模型没有返回内容。请重试，或检查模型、提示词和网络。');
    expect(panelSource).toContainSource(
      "emit(replacePendingOutput(`【错误】${message}`), { replace: true, progressLabel: '失败' });",
    );
    expect(latestUsefulSource).toContainSource("if (turns.length > 0) return '';");
    expect(buildSource).toContainSource('BRAINSTORM_GENERATE_TASK_TEXT');
    expect(buildSource).toContainSource('BRAINSTORM_GENERATE_RULE_TEXT');
    expect(buildSource).toContainSource('BRAINSTORM_OTHER_REQUIREMENTS_HEADER');
    expect(buildSource).not.toContainSource('BRAINSTORM_REQUEST_HEADER');
    expect(buildSource).not.toContainSource('【用户要求】');
    expect(panelSource).not.toContainSource('void sendLibraryAiMessage(promptText);');
  });

  it('locks brainstorm output box count to the requested generation count', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const confirmStart = panelSource.indexOf('const confirmBrainstormGenerate = () => {');
    const confirmEnd = panelSource.indexOf('const addRoleTypeByName', confirmStart);
    const confirmSource = panelSource.slice(confirmStart, confirmEnd);
    const previewStart = panelSource.indexOf('const brainstormOutputPreviewCount = activeIsBrainstorm');
    const previewEnd = panelSource.indexOf('const brainstormOutputSplitParts', previewStart);
    const previewSource = panelSource.slice(previewStart, previewEnd);

    expect(panelSource).toContainSource('previewCount?: number;');
    expect(confirmSource).toContainSource(
      'const previewCount = getBrainstormOutputCount(brainstormGenerateDraft.brainstormCount);',
    );
    expect(confirmSource).not.toContainSource('generationMode');
    expect(confirmSource).toContainSource('void sendLibraryAiMessage(promptText, { visibleText, previewCount });');
    expect(confirmSource).not.toContainSource('setBrainstormQuestionDraft(EMPTY_BRAINSTORM_QUESTION_DRAFT)');
    expect(previewSource).toContainSource(
      'activeBrainstormAiSession?.previewCount ?? getBrainstormOutputCount(brainstormQuestionDraft.brainstormCount)',
    );
    expect(panelSource).toContainSource('previewCount: targetBrainstormPreviewCount');
  });

  it('generates multiple brainstorm outputs sequentially without a batch mode', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const sendStart = panelSource.indexOf('const sendLibraryAiMessage = async (');
    const sendEnd = panelSource.indexOf('const stopLibraryAiMessage = () => {', sendStart);
    const sendSource = panelSource.slice(sendStart, sendEnd);

    expect(panelSource).not.toContainSource('BrainstormGenerateMode');
    expect(panelSource).not.toContainSource('brainstormGenerateMode');
    expect(panelSource).not.toContainSource("targetBrainstormGenerateMode === 'batch'");
    expect(panelSource).toContainSource(
      'function buildSequentialBrainstormRequestText(baseRequestText: string, index: number, total: number, completedItems: string[])',
    );
    expect(panelSource).toContainSource(
      "function formatSequentialBrainstormOutput(completedItems: string[], activeIndex?: number, activeContent = '')",
    );
    expect(sendSource).toContainSource('const shouldGenerateBrainstormSequentially = targetTab === BRAINSTORM_TAB');
    expect(sendSource).not.toContainSource('targetBrainstormGenerateMode');
    expect(sendSource).not.toContainSource('generationMode');
    expect(sendSource).toContainSource('for (let index = 1; index <= targetBrainstormPreviewCount; index += 1)');
    expect(sendSource).toContainSource(
      'const itemRequestText = buildSequentialBrainstormRequestText(requestText, index, targetBrainstormPreviewCount, completedItems);',
    );
    expect(sendSource).toContainSource('userContent: itemRequestText');
    expect(sendSource).toContainSource('completedItems.push(stripAiThinkingBlock(itemDisplayContent));');
    expect(sendSource).toContainSource(
      'return replacePendingOutput(formatSequentialBrainstormOutput(completedItems));',
    );
  });

  it('can switch the library AI request log between titled sections and plain concatenated content', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const logGroupsSource = await readAiRequestLogGroupsSource();
    const logLayoutSource = await readAiRequestLogModalLayoutSource();
    const settingRequestStart = panelSource.indexOf(
      'const buildSettingLibraryRequestText = (promptText: string, userText: string) => {',
    );
    const settingRequestEnd = panelSource.indexOf(
      'const buildLibraryAiRequestPayload = (text: string, overrideText?: string) => {',
      settingRequestStart,
    );
    const settingRequestSource = panelSource.slice(settingRequestStart, settingRequestEnd);

    expect(panelSource).toContainSource("import type { AiRequestLogGroup } from '@/shared/ui/AiRequestLogGroups';");
    expect(panelSource).toContainSource(
      "import { AiRequestLogModalLayout } from '@/shared/ui/AiRequestLogModalLayout';",
    );
    expect(panelSource).toContainSource('export function buildRequestLogPlainPreview(groups: AiRequestLogGroup[])');
    expect(panelSource).toContainSource(".join('\\n\\n');");
    expect(panelSource).toContainSource('const [showLibraryAiLogTitles, setShowLibraryAiLogTitles] = useState(true);');
    expect(panelSource).toContainSource('const visibleAiRequestLogGroups = visibleAiRequestLog');
    expect(panelSource).toContainSource('function formatBrainstormReferenceForAi(title: string, text: string)');
    expect(panelSource).toContainSource('【参考资料开始：用户关联脑洞】');
    expect(panelSource).toContainSource(
      '注意：以下内容只是参考资料，不是输出格式，不要照抄标签，不要为它单独生成设定，不要输出本段任何标签。',
    );
    expect(panelSource).toContainSource('资料类型：脑洞');
    expect(panelSource).toContainSource('`资料标题：${safeTitle}`');
    expect(panelSource).toContainSource('【参考资料结束：用户关联脑洞】');
    expect(panelSource).toContainSource('function formatSettingLinkedContextForAi');
    expect(panelSource).toContainSource(
      "if (context.source === 'brainstorm') return formatBrainstormReferenceForAi(context.title, text);",
    );
    expect(panelSource).not.toContainSource(
      "const tagName = context.source === 'brainstorm' ? '关联脑洞' : '待处理设定';",
    );
    expect(panelSource).not.toContainSource("wrapAiRequestTag('关联脑洞'");
    expect(panelSource).toContainSource('return wrapAiRequestTag(tagName, text, { 标题: title });');
    expect(panelSource).toContainSource('function formatSettingUserRequirementForAi');
    expect(panelSource).toContainSource("return wrapAiRequestTag('修改要求', text);");
    expect(settingRequestSource).toContainSource(
      'const linkedSettingContext = formatSettingLinkedContextForAi(getActiveLinkedSettingSnapshot());',
    );
    expect(settingRequestSource).toContainSource(
      'const userRequirement = formatSettingUserRequirementForAi(userText);',
    );
    expect(settingRequestSource).not.toContainSource("'【其他要求】'");
    expect(settingRequestSource).not.toContainSource("'【用户要求】'");
    expect(panelSource).toContainSource(
      'userContent: activeTab === SETTING_TAB ? settingUserRequirementForAi : requestText',
    );
    expect(panelSource).toContainSource(
      "userTitle: activeTab === SETTING_TAB ? '修改要求' : activeIsBrainstorm ? '其他要求' : undefined",
    );
    expect(panelSource).toContainSource("userTextTitle={activeTab === SETTING_TAB ? '修改要求' : '其他要求'}");
    expect(panelSource).toContainSource(
      'const visibleAiRequestLogPlainPreview = buildRequestLogPlainPreview(visibleAiRequestLogGroups);',
    );
    expect(panelSource).toContainSource('checked={showLibraryAiLogTitles}');
    expect(panelSource).toContainSource('onShowLibraryAiLogTitlesChange={setShowLibraryAiLogTitles}');
    expect(panelSource).toContainSource('onChange={(event) => onShowLibraryAiLogTitlesChange(event.target.checked)}');
    expect(panelSource).toContainSource('<span>显示标题内容</span>');
    expect(panelSource).toContainSource('<AiRequestLogModalLayout');
    expect(panelSource).toContainSource('showGroupedContent={showLibraryAiLogTitles}');
    expect(panelSource).toContainSource('plainPreview={visibleAiRequestLogPlainPreview}');
    expect(logLayoutSource).toContainSource('<AiRequestLogGroups');
    expect(logLayoutSource).toContainSource(
      'plainPreview.trim() ? <AiRequestLogContent content={plainPreview} /> : emptyText',
    );
    expect(logGroupsSource).toContainSource('function isSoftwareLogMarkerLine(line: string)');
    expect(logGroupsSource).toContainSource('export function AiRequestLogContent');
    expect(logGroupsSource).toContainSource('font-black text-red-500');
    expect(logGroupsSource).toContainSource('<AiRequestLogContent content={content} />');
    expect(logGroupsSource).toContainSource('fillSingleGroup = false');
    expect(logGroupsSource).toContainSource('fillGroupId,');
    expect(logGroupsSource).toContainSource('fillLastGroup = false');
    expect(logGroupsSource).toContainSource('fillGroupWeights,');
    expect(logGroupsSource).toContainSource('fillGroupWeights?: Record<string, number>;');
    expect(logGroupsSource).toContainSource(
      'const shouldFillSingleGroup = fillSingleGroup && visibleGroups.length === 1;',
    );
    expect(logGroupsSource).toContainSource(
      'const fillLastGroupIndex = fillLastGroup ? visibleGroups.length - 1 : -1;',
    );
    expect(logGroupsSource).toContainSource(
      'const hasFillGroupWeights = Boolean(fillGroupWeights && Object.keys(fillGroupWeights).length > 0);',
    );
    expect(logGroupsSource).toContainSource(
      'const shouldUseFillLayout = shouldFillSingleGroup || Boolean(fillGroupId) || fillLastGroup || hasFillGroupWeights;',
    );
    expect(logGroupsSource).toContainSource(
      "className={shouldUseFillLayout ? 'flex h-full min-h-0 flex-col gap-3' : 'space-y-3'}",
    );
    expect(logGroupsSource).toContainSource('const fillGroupWeight = fillGroupWeights?.[group.id];');
    expect(logGroupsSource).toContainSource(
      "const shouldFillWeightedGroup = typeof fillGroupWeight === 'number' && fillGroupWeight > 0 && !collapsed;",
    );
    expect(logGroupsSource).toContainSource(
      'const shouldFillGroup = shouldFillSingleGroup || (fillGroupId === group.id && !collapsed) || (fillLastGroupIndex === groupIndex && !collapsed) || shouldFillWeightedGroup;',
    );
    expect(logGroupsSource).toContainSource('style={fillGroupStyle}');
    expect(logGroupsSource).toContainSource(
      'ai-request-log-text whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4',
    );
    expect(logGroupsSource).not.toContainSource(
      'ai-request-log-text whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4 text-xs leading-5',
    );
  });

  it('keeps linked brainstorm preview focused on the item content without redundant metadata cards', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).not.toContainSource('项目类型');
    expect(panelSource).not.toContainSource('关联方式');
    expect(panelSource).not.toContainSource('关联后会作为完整脑洞项目随本次请求发送给 AI。');
  });

  it('lets the chapter editor output log fill the last expanded log group to the bottom', async () => {
    const chapterEditorSource = await readChapterEditorSource();
    const logLayoutSource = await readAiRequestLogModalLayoutSource();

    expect(chapterEditorSource).toContainSource(
      "import { AiRequestLogModalLayout } from '@/shared/ui/AiRequestLogModalLayout';",
    );
    expect(chapterEditorSource).toContainSource('<AiRequestLogModalLayout');
    expect(logLayoutSource).toContainSource(
      'className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)] overflow-hidden"',
    );
    expect(logLayoutSource).toContainSource('className="border-r border-slate-100 bg-slate-50 p-4 text-sm"');
    expect(chapterEditorSource).toContainSource('value: `作品编辑器 ${activeReviewModeTitle}`');
    expect(chapterEditorSource).toContainSource("value: activeReviewModel?.name ?? '未选择模型'");
    expect(chapterEditorSource).toContainSource("value: activeReviewPrompt?.name ?? '默认提示词'");
    expect(logLayoutSource).toContainSource(
      'className="editor-scrollbar flex min-h-0 flex-1 flex-col overflow-hidden p-5"',
    );
    expect(chapterEditorSource).toContainSource(
      'if (openLogSignal <= 0 || openLogSignal === lastOpenLogSignalRef.current) return;',
    );
    expect(chapterEditorSource).toContainSource(
      "if (embeddedMode !== 'audit' && embeddedMode !== 'comment' && embeddedMode !== 'polish') return;",
    );
    expect(chapterEditorSource).toContainSource('setIsReviewLogOpen(true);');
    expect(chapterEditorSource).toContainSource('onRegisterHeaderLog?: (handler: (() => void) | null) => void;');
    expect(chapterEditorSource).toContainSource('onRegisterHeaderLog(() => setIsReviewLogOpen(true));');
    expect(chapterEditorSource).toContainSource("import { WorkbenchModal } from './WorkbenchModal';");
    expect(chapterEditorSource).toContainSource('const reviewLogModal = isReviewLogOpen ? (');
    expect(chapterEditorSource).toContainSource('storageId="chapter_editor_review_request_log"');
    expect(chapterEditorSource).toContainSource('closeOnBackdrop={false}');
    expect(chapterEditorSource).toContainSource(
      'const basePromptText = activeReviewPrompt?.content?.trim() || modeInstruction;',
    );
    expect(chapterEditorSource).toContainSource(
      "const promptText = [basePromptText, compareInstruction].filter(Boolean).join('\\n\\n');",
    );
    expect(chapterEditorSource).toContainSource('const userRequirementText = reviewAiInput.trim();');
    expect(chapterEditorSource).toContainSource(
      "const userText = userRequirementText ? wrapAiRequestTag(requirementTag, userRequirementText) : '';",
    );
    expect(chapterEditorSource).not.toContainSource('reviewAiInput.trim() || modeInstruction');
    expect(chapterEditorSource).toContainSource("const REVIEW_LOG_SECTION_PREFIX = '[[YUEXIA_REVIEW_LOG_SECTION:';");
    expect(chapterEditorSource).toContainSource("createReviewLogSection('系统提示词', promptText)");
    expect(chapterEditorSource).toContainSource("...(userText ? [createReviewLogSection('其他要求', userText)] : [])");
    expect(chapterEditorSource).toContainSource("log.lastIndexOf('\\n【关联章纲】', originalStart)");
    expect(chapterEditorSource).not.toContainSource("['其他要求', '用户要求']");
    expect(chapterEditorSource).toContainSource("getReviewLogSection(reviewRequestLog, '其他要求').trim()");
    expect(chapterEditorSource).toContainSource("title: '其他要求'");
    expect(chapterEditorSource).toContainSource("title: '关联章纲'");
    expect(chapterEditorSource).toContainSource("content: getReviewLogSection(reviewRequestLog, '关联章纲')");
    expect(chapterEditorSource).toContainSource("title: '原文'");
    expect(chapterEditorSource).toContainSource("content: getReviewLogSection(reviewRequestLog, '原文')");
    expect(chapterEditorSource).toContainSource(
      'function getReviewLogFillGroupWeights(options: { hasOutline: boolean; hasUser: boolean })',
    );
    expect(chapterEditorSource).toContainSource('original: 2,');
    expect(chapterEditorSource).toContainSource('fillSingleGroup');
    expect(chapterEditorSource).toContainSource('fillGroupWeights={reviewLogFillGroupWeights}');
    expect(chapterEditorSource).not.toContainSource(
      'absolute inset-4 z-10 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl',
    );
    expect(chapterEditorSource).not.toContainSource('fillGroupId="context"');
    expect(chapterEditorSource).not.toContainSource('fillGroupId="original"');
    expect(chapterEditorSource).not.toContainSource("title: '用户要求'");
  });

  it('adds a format tab to the library AI log using the current setting import structure', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const libraryAiLogShellSource = await readWorkbenchLibraryAiLogShellSource();
    const appModalShellSource = await readSharedAppModalShellSource();
    const structuredSettingsSource = await readWorkbenchStructuredSettingsSource();
    const taxonomySource = await readWorkbenchSettingTaxonomySource();
    const roleSettingFieldsSource = await readWorkbenchRoleSettingFieldsSource();
    const formatPreviewSource = await readWorkbenchSettingImportFormatPreviewSource();
    const buildFormatTabsStart = structuredSettingsSource.indexOf('function buildSettingImportFormatTabs(');
    const buildFormatTabsEnd = structuredSettingsSource.indexOf(
      'export const DEFAULT_SETTING_IMPORT_FORMAT_TAB_ID',
      buildFormatTabsStart,
    );
    const buildFormatTabsSource = structuredSettingsSource.slice(buildFormatTabsStart, buildFormatTabsEnd);

    expect(panelSource).toContainSource("const LIBRARY_AI_LOG_VIEW_TABS = ['输出日志', '格式'] as const;");
    expect(structuredSettingsSource).toContainSource('type SettingImportFormatEntry');
    expect(structuredSettingsSource).toContainSource(
      'function buildSettingImportFormatTabs(options: BuildSettingImportFormatTabsOptions)',
    );
    expect(structuredSettingsSource).toContainSource('type BuildSettingImportFormatTabsOptions = {');
    expect(structuredSettingsSource).toContainSource('visibleSettingTypes: string[];');
    expect(structuredSettingsSource).toContainSource('settingEntries: WorkbenchLibraryEntry[];');
    expect(structuredSettingsSource).toContainSource('getSettingTypeWorkspaceDomain: (type: string) => string | null;');
    expect(structuredSettingsSource).toContainSource(
      'function buildSettingImportFormatPreview(entry: SettingImportFormatEntry)',
    );
    expect(structuredSettingsSource).toContainSource(
      "const SETTING_IMPORT_FORMAT_PREVIEW_SCOPES = ['设定条目', '分组', '标签'] as const;",
    );
    expect(structuredSettingsSource).toContainSource(
      'function buildSettingImportFormatGroupPreview(tab: SettingImportFormatTab, group: SettingImportFormatGroup)',
    );
    expect(structuredSettingsSource).toContainSource(
      'function buildSettingImportFormatTabPreview(tab: SettingImportFormatTab)',
    );
    expect(structuredSettingsSource).toContainSource('function buildSettingImportFormatScopedPreview');
    expect(panelSource).toContainSource(
      "import { SettingImportFormatPreviewText } from './workbenchSettingImportFormatPreview';",
    );
    expect(formatPreviewSource).toContainSource(
      'function getSettingImportFormatLineClassName(line: string, lineIndex: number)',
    );
    expect(formatPreviewSource).toContainSource("return lineIndex === 0 ? 'text-amber-600' : 'text-purple-700';");
    expect(formatPreviewSource).toContainSource("if (/^\\*[^*]+\\*[:：]$/.test(trimmed)) return 'text-sky-700';");
    expect(formatPreviewSource).toContainSource(
      'function SettingImportFormatPreviewText({ content }: { content: string })',
    );
    expect(panelSource).toContainSource(
      "const [libraryAiLogViewTab, setLibraryAiLogViewTab] = useState<LibraryAiLogViewTab>('输出日志');",
    );
    expect(panelSource).toContainSource(
      'const [settingImportFormatTabId, setSettingImportFormatTabId] = useState(DEFAULT_SETTING_IMPORT_FORMAT_TAB_ID);',
    );
    expect(panelSource).toContainSource(
      'const [settingImportFormatEntryId, setSettingImportFormatEntryId] = useState(DEFAULT_SETTING_IMPORT_FORMAT_ENTRY_ID);',
    );
    expect(panelSource).toContainSource(
      "const [settingImportFormatPreviewScope, setSettingImportFormatPreviewScope] = useState<SettingImportFormatPreviewScope>('设定条目');",
    );
    expect(panelSource).not.toContainSource('智能导入会写入到');
    expect(panelSource).not.toContainSource('条目下的子设定');
    expect(panelSource).not.toContainSource('selectedSettingImportFormatEntry.fields.map((field)');
    expect(libraryAiLogShellSource).toContainSource('headerTools?: ReactNode;');
    expect(libraryAiLogShellSource).toContainSource('<AppModalShell');
    expect(libraryAiLogShellSource).toContainSource(
      'headerExtra={headerTools ? <div className="flex min-w-0 items-center gap-2">{headerTools}</div> : null}',
    );
    expect(appModalShellSource).toContainSource('data-no-modal-drag="true"');
    expect(appModalShellSource).toContainSource('<ModalResizeHandles draggable={draggable} />');
    expect(panelSource).toContainSource('headerTools={');
    expect(panelSource).toContainSource('tabs={LIBRARY_AI_LOG_VIEW_TABS}');
    expect(panelSource).toContainSource('activeTab={activeViewTab}');
    expect(panelSource).toContainSource('onChange={onViewTabChange}');
    expect(panelSource).toContainSource(
      'className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-slate-100 bg-white px-5 py-3"',
    );
    expect(panelSource).toContainSource("activeViewTab === '格式' ? (");
    expect(panelSource).not.toContainSource(
      'className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-3"',
    );
    expect(panelSource).not.toContainSource('className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pr-4"');
    expect(panelSource).toContainSource('className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white p-5"');
    expect(panelSource).toContainSource(
      'className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-900 bg-white p-4"',
    );
    expect(panelSource).toContainSource(
      'className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-[#FBFCFE] p-4 text-sm font-semibold leading-7 text-slate-800"',
    );
    expect(panelSource).toContainSource('<SettingImportFormatPreviewText content={settingImportFormatPreview} />');
    expect(structuredSettingsSource).toContainSource('entry.fields.flatMap((field) => [');
    expect(panelSource).not.toContainSource("field.title === '身份定位' ? '男主角' : '内容',\\n    '',");
    expect(panelSource).not.toContainSource('className="shrink-0 border-b border-slate-100 bg-white p-3"');
    expect(panelSource).not.toContainSource('className="grid grid-cols-2 gap-1"');
    expect(panelSource).toContainSource('可复制格式');
    expect(panelSource).toContainSource('SETTING_IMPORT_FORMAT_PREVIEW_SCOPES.map((scope, index)');
    expect(panelSource).toContainSource('onFormatPreviewScopeChange={setSettingImportFormatPreviewScope}');
    expect(panelSource).toContainSource('onClick={() => onFormatPreviewScopeChange(scope)}');
    expect(panelSource).toContainSource('设定条目');
    expect(panelSource).toContainSource('分组');
    expect(panelSource).toContainSource('标签');
    expect(panelSource).toContainSource(
      'rounded-xl border border-slate-200 bg-[#FBFCFE] p-4 text-sm font-semibold leading-7 text-slate-800',
    );
    expect(panelSource).not.toContainSource('rounded-xl bg-slate-950 p-4 text-sm font-bold leading-7 text-slate-100');
    expect(panelSource).toContainSource(
      'const settingImportFormatGuideTabs = useMemo(() => buildSettingImportFormatTabs({',
    );
    expect(panelSource).toContainSource('visibleSettingTypes: settingTypeOptions,');
    expect(panelSource).toContainSource('settingEntries,');
    expect(panelSource).toContainSource('getSettingTypeWorkspaceDomain,');
    expect(panelSource).toContainSource('}), [getSettingTypeWorkspaceDomain, settingEntries, settingTypeOptions]);');
    expect(panelSource).toContainSource(
      'const activeSettingImportFormatTab = settingImportFormatGuideTabs.find((tab) => tab.id === settingImportFormatTabId) ?? settingImportFormatGuideTabs[0];',
    );
    expect(buildFormatTabsSource).toContainSource(
      'visibleSettingTypes.filter((type) => !getSettingTypeWorkspaceDomain(type))',
    );
    expect(buildFormatTabsSource).toContainSource(
      'visibleSettingTypes.filter((type) => getSettingTypeWorkspaceDomain(type) === domain)',
    );
    expect(buildFormatTabsSource).not.toContainSource('DEFAULT_WORK_SETTING_TYPES.map((groupName) => ({');
    expect(buildFormatTabsSource).not.toContainSource(
      "['factions', '势力设定', SETTING_WORKSPACE_DOMAIN_GROUPS['setting:faction']]",
    );
    expect(taxonomySource).toContainSource('DEFAULT_WORK_SETTING_STARTER_ENTRIES');
    expect(taxonomySource).toContainSource('SETTING_WORKSPACE_DOMAIN_GROUPS');
    expect(panelSource).toContainSource("from '@/features/workbench/model/workbenchSettingTaxonomy'");
    expect(panelSource).not.toContainSource('LEGACY_COMPACT_WORK_SETTING_STARTER_ENTRIES');
    expect(panelSource).not.toContainSource('LEGACY_DETAILED_DEFAULT_SETTING_STARTER_ENTRIES');
    expect(panelSource).not.toContainSource('LEGACY_AUTO_DOMAIN_SETTING_STARTER_ENTRIES');
    expect(panelSource).not.toContainSource('LEGACY_DEFAULT_WORK_SETTING_INSTRUCTIONS');
    expect(panelSource).not.toContainSource('clearLegacyDefaultWorkSettingInstructions');
    expect(panelSource).not.toContainSource('removeLegacyAutoDomainSettingStarterEntries');
    expect(roleSettingFieldsSource).toContainSource('ROLE_BASE_SETTING_FIELD_DEFINITIONS');
    expect(roleSettingFieldsSource).toContainSource('ROLE_STATE_FIELD_DEFINITIONS');
    expect(structuredSettingsSource).toContainSource('世界架构');
    expect(structuredSettingsSource).toContainSource('危险区域');
    expect(structuredSettingsSource).toContainSource('特殊资源');
  });

  it('does not add a group-name fallback entry when the format group already has concrete entries', async () => {
    const structuredSettingsSource = await readWorkbenchStructuredSettingsSource();
    const entryTitlesStart = structuredSettingsSource.indexOf('function getSettingImportFormatEntryTitles(');
    const entryTitlesEnd = structuredSettingsSource.indexOf(
      'function createSettingImportFormatEntry(',
      entryTitlesStart,
    );
    const entryTitlesSource = structuredSettingsSource.slice(entryTitlesStart, entryTitlesEnd);

    expect(entryTitlesSource).not.toContainSource('...structuredTitles, normalizedType');
    expect(entryTitlesSource).toContainSource(
      'const knownTitles = Array.from(new Set([...currentTitles, ...starterTitles, ...structuredTitles]))',
    );
    expect(entryTitlesSource).toContainSource(
      'const visibleTitles = knownTitles.filter((title) => normalizeSettingType(title) !== normalizedType);',
    );
    expect(entryTitlesSource).toContainSource('return visibleTitles.length > 0 ? visibleTitles : [normalizedType];');
  });

  it('keeps brainstorm count buttons compact while the generate button stays on the right', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(panelSource).toContainSource('<div className="mt-2 flex items-center gap-3">');
    expect(panelSource).toContainSource('min-w-0 flex-1 border-r border-slate-200 px-2 text-sm font-black');
    expect(panelSource).toContainSource(
      'h-10 w-20 shrink-0 whitespace-nowrap rounded-xl bg-brand px-0 text-sm font-bold leading-none text-white',
    );
    expect(styleSource).not.toContainSource('.xy-brainstorm-count-field');
    expect(styleSource).not.toContainSource('.xy-brainstorm-count-options');
  });

  it('uses editable temporary brainstorm output previews driven by generation count', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const entryClickStart = panelSource.indexOf('onClick={() => {');
    const entryClickEnd = panelSource.indexOf('onDoubleClick={() =>', entryClickStart);
    const entryClickSource = panelSource.slice(entryClickStart, entryClickEnd);

    expect(panelSource).toContainSource('previewTitles?: string[];');
    expect(panelSource).toContainSource('previewDrafts?: string[];');
    expect(panelSource).toContainSource('previewSelectedIndexes?: number[];');
    expect(panelSource).toContainSource('previewCount?: number;');
    expect(panelSource).toContainSource(
      'function getSelectedBrainstormPreviewIndexes(previews: string[], selectedIndexes?: number[])',
    );
    expect(panelSource).toContainSource('function getBrainstormOutputCount(value: string)');
    expect(panelSource).toContainSource("return '脑洞输出';");
    expect(panelSource).not.toContainSource('return `${index + 1}号脑洞`;');
    expect(panelSource).not.toContainSource('return `脑洞输出框${index + 1}`;');
    expect(panelSource).not.toContainSource('return `新脑洞${index + 1}`;');
    expect(panelSource).toContainSource('const getNextBrainstormTitles = (count: number) => {');
    expect(panelSource).toContainSource(
      'return Array.from({ length: count }, (_, index) => `脑洞${maxNumber + index + 1}`);',
    );
    expect(panelSource).toContainSource('const nextTitles = getNextBrainstormTitles(previews.length);');
    expect(panelSource).toContainSource('const previews = getCurrentBrainstormOutputPreviews(true);');
    expect(panelSource).toContainSource(
      'createWorkbenchLibraryEntry(BRAINSTORM_TAB, nextTitles[index] ?? getNextBrainstormTitle())',
    );
    expect(panelSource).not.toContainSource(
      'createWorkbenchLibraryEntry(BRAINSTORM_TAB, preview.title || getNextBrainstormTitle())',
    );
    expect(panelSource).toContainSource('function splitBrainstormGeneratedText(text: string, count: number)');
    expect(panelSource).toContainSource(
      'activeBrainstormAiSession?.previewCount ?? getBrainstormOutputCount(brainstormQuestionDraft.brainstormCount)',
    );
    expect(panelSource).toContainSource('const brainstormOutputPreviews = Array.from(');
    expect(panelSource).toContainSource('{ length: brainstormOutputPreviewCount }');
    expect(panelSource).toContainSource(
      "(_, index) => activeBrainstormAiSession?.previewDrafts?.[index] ?? brainstormOutputSplitParts[index] ?? ''",
    );
    expect(panelSource).toContainSource('const selectedBrainstormOutputIndexes = getSelectedBrainstormPreviewIndexes(');
    expect(panelSource).toContainSource(
      'const selectedBrainstormOutputIndexSet = new Set(selectedBrainstormOutputIndexes);',
    );
    expect(panelSource).toContainSource('const selectedBrainstormOutputCount = selectedBrainstormOutputIndexes');
    expect(panelSource).toContainSource(
      'const showBrainstormOutputSelection = activeIsBrainstorm && brainstormOutputPreviewCount > 1;',
    );
    expect(panelSource).toContainSource('{brainstormOutputPreviews.map((previewValue, index) => {');
    expect(panelSource).toContainSource('role="checkbox"');
    expect(panelSource).toContainSource('aria-checked={outputChecked}');
    expect(panelSource).toContainSource('onClick={() => toggleBrainstormOutputPreviewSelected(index)}');
    expect(panelSource).toContainSource('aria-label={`脑洞输出名称 ${index + 1}`}');
    expect(panelSource).toContainSource(
      'onChange={(event) => setBrainstormOutputPreviewTitle(index, event.target.value)}',
    );
    expect(panelSource).toContainSource('previewCount: targetBrainstormPreviewCount');
    expect(panelSource).toContainSource('disabled={!currentSelectedEntry || selectedBrainstormOutputCount !== 1}');
    expect(panelSource).toContainSource('disabled={selectedBrainstormOutputCount === 0}');
    expect(panelSource).toContainSource('clearStoredBrainstormAiSessionPreviews(storageKey);');
    expect(panelSource).not.toContainSource("currentSelectedEntry.title || '未命名脑洞'");
    expect(entryClickSource).not.toContainSource('setAiResult(getBrainstormEntryBody(entry));');
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
    expect(panelSource).toContainSource('grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-2 p-4');
    expect(panelSource).toContainSource('<div className="min-h-0 space-y-3">');
    expect(panelSource).not.toContainSource('flex min-h-0 flex-1 flex-col gap-5 p-4');
    expect(actionAreaSource).not.toContainSource('shrink-0 rounded-xl border border-gray-200 bg-white p-3');
    expect(actionAreaSource).not.toContainSource('mt-3 flex items-center justify-between gap-2');
    expect(actionAreaSource).not.toContainSource('xy-animated-checkbox');
  });

  it('uses short brainstorm genre and theme placeholders', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource("placeholder: '如都市、玄幻'");
    expect(panelSource).toContainSource("placeholder: '如系统流'");
    expect(panelSource).not.toContainSource('如都市高武、玄幻、仙侠、科幻');
    expect(panelSource).not.toContainSource('如系统流、凡人流');
  });
  it('keeps brainstorm short-field labels in the border-floating style with enough top space', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();

    expect(panelSource).not.toContainSource('xy-brainstorm-short-field');
    expect(styleSource).not.toContainSource('.xy-floating-field.xy-brainstorm-short-field label');
    expect(panelSource).toContainSource(
      'xy-brainstorm-question-panel xy-shellless-panel editor-scrollbar min-h-0 flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-0 py-2',
    );
    expect(panelSource).toContainSource('flex min-h-full flex-col gap-4 pt-2');
    expect(panelSource).toContainSource('height: `${Math.max(52, pairedRows * 20 + 32)}px`');
    expect(panelSource).toContainSource('minHeight: `${Math.max(180, questionRows * 20 + 52)}px`');
    expect(panelSource).toContainSource("height: '100%'");
    expect(styleSource).toContainSource('.xy-brainstorm-question-panel > div > div:last-child');
    expect(styleSource).toContainSource('flex: 1 1 180px;');
    expect(panelSource).not.toContainSource('Math.min(4, Math.max(1, rows))');
    expect(panelSource).not.toContainSource("overflowY: isLastField || questionRows >= 4 ? 'auto' : 'hidden'");
    expect(panelSource).not.toContainSource('flex min-h-[132px] flex-1 flex-col');
  });

  it('aligns brainstorm generator fields with the model prompt selector', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const brainstormPanelStart = panelSource.indexOf('<div className="flex max-w-full items-start gap-2">');
    const brainstormPanelEnd = panelSource.indexOf(
      ') : (',
      panelSource.indexOf('xy-brainstorm-question-panel', brainstormPanelStart),
    );
    const brainstormPanelSource = panelSource.slice(brainstormPanelStart, brainstormPanelEnd);

    expect(brainstormPanelStart).toBeGreaterThan(-1);
    expect(brainstormPanelEnd).toBeGreaterThan(brainstormPanelStart);
    expect(brainstormPanelSource).toContainSource("className={activeIsBrainstorm ? 'w-full' : undefined}");
    expect(brainstormPanelSource).toContainSource("width: '100%'");
    expect(brainstormPanelSource).toContainSource('<div className="flex max-w-full items-start gap-2">');
    expect(brainstormPanelSource).not.toContainSource('items-start justify-end gap-2');
    expect(brainstormPanelSource).toContainSource(
      '<div key="brainstorm-genre-background-row" className="grid shrink-0 grid-cols-2 gap-4',
    );
    expect(panelSource).toContainSource('<div className="mt-2 flex items-center gap-3">');
    expect(panelSource).toContainSource('<span className="shrink-0 text-sm font-black text-slate-950">逐个生成</span>');
    expect(panelSource).not.toContainSource(
      '<span className="shrink-0 text-sm font-black text-slate-950">生成个数：</span>',
    );
  });

  it('allows the brainstorm preview and output splitter to drag in both directions', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();

    expect(constantsSource).toContainSource('export const BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH = 480;');
    expect(panelSource).toContainSource('const deltaX = (moveEvent.clientX - startX) / eventScale;');
    expect(panelSource).toContainSource('Math.max(BRAINSTORM_PREVIEW_MIN_WIDTH, startWidth + deltaX)');
    expect(panelSource).toContainSource(
      'const brainstormLayoutPreviewWidth = Math.min(brainstormPreviewWidth, BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH);',
    );
    expect(constantsSource).not.toContainSource('const BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH = 420;');
  });

  it('uses the writing page cursor for official horizontal resize splitters', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const testCollectionSource = await readTestCollectionSource();

    expect(panelSource).toContainSource("document.body.style.cursor = 'ew-resize';");
    expect(panelSource).toContainSource('cursor-ew-resize touch-none items-stretch');
    expect(styleSource).not.toContainSource('cursor-col-resize');
    expect(panelSource).not.toContainSource("document.body.style.cursor = 'col-resize';");
    expect(panelSource).not.toContainSource('cursor-col-resize');
    expect(testCollectionSource).not.toContainSource('DragSplitterIconTestPage');
    expect(testCollectionSource).not.toContainSource('/drag-splitter-icon-test');
  });

  it('keeps setting and outline action sidebars wide enough to drag', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();

    expect(constantsSource).toContainSource('export const SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH = 260;');
    expect(constantsSource).toContainSource('export const OUTLINE_LEFT_MAX_DISPLAY_WIDTH = 560;');
    expect(panelSource).toContainSource('function getSettingLibraryLeftMaxWidth(tab: string, scaleValue = 1)');
    expect(panelSource).toContainSource('const isSettingTab = tab === SETTING_TAB;');
    expect(panelSource).toContainSource(
      'const minWidth = isSettingTab ? SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH : SETTING_LIBRARY_LEFT_MIN_WIDTH;',
    );
    expect(panelSource).toContainSource('function getDetailOutlineLeftMinWidth(scaleValue = 1)');
    expect(panelSource).toContainSource(
      'const viewportEighthWidth = Math.floor(window.innerWidth / normalizedScale / 8);',
    );
    expect(panelSource).toContainSource('return Math.max(SETTING_LIBRARY_LEFT_MIN_WIDTH, viewportEighthWidth);');
    expect(panelSource).toContainSource(
      'if (tab === SETTING_TAB) return sharedNavigationWidth ? SETTING_LIBRARY_LEFT_MIN_WIDTH : SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH;',
    );
    expect(panelSource).toContainSource('return tab === DETAIL_OUTLINE_TAB || tab === OUTLINE_LIBRARY_TAB');
    expect(panelSource).toContainSource(
      'const isOutlineActionTab = tab === DETAIL_OUTLINE_TAB || tab === OUTLINE_LIBRARY_TAB;',
    );
    expect(panelSource).toContainSource('const viewportDivider = isSettingTab ? 2 : isOutlineActionTab ? 2.5 : 5;');
    expect(panelSource).toContainSource(
      'const viewportLimitWidth = Math.floor(window.innerWidth / normalizedScale / viewportDivider);',
    );
    expect(panelSource).toContainSource('return Math.max(');
    expect(panelSource).toContainSource('const fixedMaxWidth = isSettingTab');
    expect(panelSource).toContainSource('isOutlineActionTab');
    expect(panelSource).toContainSource('Math.min(fixedMaxWidth, viewportLimitWidth)');
    expect(panelSource).toContainSource(
      'const minWidth = getSettingLibraryLeftMinWidth(activeTab, eventScale, readSharedWorkbenchLeftNavWidthEnabled());',
    );
    expect(panelSource).toContainSource(
      'const maxWidth = Math.max(minWidth, getSettingLibraryLeftMaxWidth(tab, scaleValue));',
    );
    expect(panelSource).toContainSource('readSettingLibraryLeftWidth(storageKey, activeTab, scale)');
    expect(panelSource).toContainSource(
      'isBrainstormTab ? BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH : getSettingLibraryLeftMaxWidth(activeTab, eventScale),',
    );
    expect(panelSource).toContainSource('const outlineSidebarWidth = settingLibraryLeftWidth;');
    expect(panelSource).toContainSource('gridTemplateColumns: isDetailOutlineTab && showDetailOutlinePublished');
    expect(panelSource).toContainSource(
      '`${outlineSidebarWidth}px 0px 190px minmax(0,1fr) 0px ${settingLibraryRightWidth}px`',
    );
    expect(panelSource).toContainSource(
      '`${outlineSidebarWidth}px 0px minmax(0,1fr) 0px ${settingLibraryRightWidth}px`',
    );
    expect(panelSource).toContainSource(
      "style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(32px, max-content))' }}",
    );
    expect(panelSource).toContainSource('relative h-9 min-w-9 rounded-lg border px-2 text-sm font-black');
    expect(panelSource).toContainSource("window.addEventListener('resize', syncVisibleLeftWidth);");
    expect(panelSource).not.toContainSource("window.addEventListener('resize', clampVisibleLeftWidth);");
    expect(panelSource).not.toContainSource(
      'const maxWidth = isBrainstormTab ? BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH : SETTING_LIBRARY_LEFT_MAX_WIDTH;',
    );
    expect(panelSource).not.toContainSource(
      'const outlineSidebarWidth = Math.max(settingLibraryLeftWidth, outlineColumns * 40 + 30);',
    );
    expect(panelSource).not.toContainSource('const outlineSidebarWidth = Math.min(');
    expect(panelSource).not.toContainSource('OUTLINE_COLUMN_OPTIONS');
    expect(panelSource).not.toContainSource('loadOutlineColumns');
    expect(panelSource).not.toContainSource('每行显示');
    expect(panelSource).not.toContainSource('const OUTLINE_LEFT_TOOLBAR_SAFE_MIN_WIDTH = 400;');
    expect(panelSource).not.toContainSource('function isOutlineLeftToolbarSafeTab(tab: string)');
    expect(panelSource).not.toContainSource('function getOutlineLeftMaxDisplayWidth(scaleValue = 1)');
    expect(panelSource).not.toContainSource('window.devicePixelRatio');
  });

  it('migrates the number 13 detail outline sidebar replica into production and retires the test route', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();
    const testCollectionSource = await readTestCollectionSource();
    const outlineGridCondition = panelSource.indexOf('isDetailOutlineTab && showDetailOutlinePublished');
    const outlineDirectoryStart = panelSource.lastIndexOf('gridTemplateColumns:', outlineGridCondition);
    const outlineDirectoryEnd = panelSource.indexOf('{leftResizeHandle}', outlineDirectoryStart);
    const outlineDirectorySource = panelSource.slice(outlineDirectoryStart, outlineDirectoryEnd);

    expect(outlineDirectoryStart).toBeGreaterThan(-1);
    expect(outlineDirectoryEnd).toBeGreaterThan(outlineDirectoryStart);
    expect(constantsSource).toContainSource(
      "export const DETAIL_OUTLINE_SIDEBAR_HEADER_CLASS = 'flex h-[42px] shrink-0 items-center justify-between border-b border-[#e6e8ec] bg-[#fbfbfc] px-3 py-2.5';",
    );
    expect(constantsSource).toContainSource(
      "export const DETAIL_OUTLINE_SIDEBAR_TITLE_CLASS = 'whitespace-nowrap text-sm font-bold text-gray-900';",
    );
    expect(constantsSource).toContainSource(
      "export const DETAIL_OUTLINE_SIDEBAR_COUNT_CLASS = 'flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F8FD] text-xs font-medium text-[#08AACE]';",
    );
    expect(constantsSource).toContainSource(
      "export const DETAIL_OUTLINE_SIDEBAR_TOGGLE_CLASS = 'flex items-center justify-center whitespace-nowrap rounded-md bg-[#08AACE] px-2 py-1 text-sm text-white transition-colors hover:bg-[#0798b8]';",
    );
    expect(constantsSource).toContainSource(
      'export const DETAIL_OUTLINE_VOLUME_ROW_CLASS = WORKBENCH_FOLDER_GROUP_BUTTON_CLASS;',
    );
    expect(constantsSource).not.toContainSource("const DETAIL_OUTLINE_VOLUME_ROW_CLASS = 'flex h-[54px]");
    expect(constantsSource).not.toContainSource("const DETAIL_OUTLINE_VOLUME_ROW_CLASS = 'grid h-[54px]");
    expect(constantsSource).toContainSource(
      'export const DETAIL_OUTLINE_VOLUME_ICON_CLASS = WORKBENCH_FOLDER_GROUP_ICON_CLASS;',
    );
    expect(constantsSource).toContainSource(
      "export const DETAIL_OUTLINE_VOLUME_TITLE_CLASS = 'min-w-0 flex-1 truncate leading-none';",
    );
    expect(constantsSource).toContainSource(
      'export const DETAIL_OUTLINE_VOLUME_COUNT_CLASS = WORKBENCH_FOLDER_GROUP_COUNT_CLASS;',
    );
    expect(outlineDirectorySource).toContainSource(
      'className={isDetailOutlineTab ? DETAIL_OUTLINE_SIDEBAR_HEADER_CLASS :',
    );
    expect(outlineDirectorySource).toContainSource(
      'className={isDetailOutlineTab ? DETAIL_OUTLINE_SIDEBAR_TOGGLE_CLASS :',
    );
    expect(outlineDirectorySource).toContainSource(
      'className={isDetailOutlineTab ? DETAIL_OUTLINE_VOLUME_ROW_CLASS : WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}',
    );
    expect(outlineDirectorySource).toContainSource('<div key={volume.id} className="mb-1">');
    expect(outlineDirectorySource).not.toContainSource('strokeWidth={isDetailOutlineTab ? 2.4 : undefined}');
    expect(outlineDirectorySource).toContainSource(
      'className={isDetailOutlineTab ? DETAIL_OUTLINE_VOLUME_ICON_CLASS : WORKBENCH_FOLDER_GROUP_ICON_CLASS}',
    );
    expect(outlineDirectorySource).toContainSource(
      'className={isDetailOutlineTab ? DETAIL_OUTLINE_VOLUME_TITLE_CLASS :',
    );
    expect(outlineDirectorySource).toContainSource(
      'className={isDetailOutlineTab ? DETAIL_OUTLINE_VOLUME_COUNT_CLASS : WORKBENCH_FOLDER_GROUP_COUNT_CLASS}',
    );
    expect(testCollectionSource).not.toContainSource('WorkbenchDetailOutlineSidebarReplicaTestPage');
    expect(testCollectionSource).not.toContainSource('/workbench-detail-outline-sidebar-replica-test');
    expect(testCollectionSource).not.toContainSource('13号测试');
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
        gridTemplateColumns: `${savedWidth}px 0px minmax(0,1fr) 0px 430px`,
      });
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth });
    }
  });

  it('keeps setting map text fields hidden until scrolling with half-width scrollbars', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const settingSidebarStart = panelSource.indexOf(
      'gridTemplateRows: activeTab === SETTING_TAB && !activeIsBrainstorm',
    );
    const settingSidebarSource = panelSource.slice(settingSidebarStart, settingSidebarStart + 12000);

    expect(panelSource).toContainSource(
      'const [activeSettingSidebarScrollKey, setActiveSettingSidebarScrollKey] = useState<string | null>(null);',
    );
    expect(panelSource).toContainSource('onScroll={() => handleSettingSidebarScroll');
    expect(settingSidebarSource).not.toContainSource(
      'scrollbar-scroll-only scrollbar-half-width min-h-0 flex-1 overflow-y-auto',
    );
    expect(panelSource).toContainSource('className="mt-0.5 space-y-0.5"');
    expect(panelSource).not.toContainSource(
      'scrollbar-scroll-only scrollbar-half-width mt-0.5 max-h-[760px] space-y-0.5 overflow-y-auto',
    );
    expect(panelSource).toContainSource('scrollbar-scroll-only scrollbar-half-width text-sm leading-7 text-gray-700');
    expect(panelSource).toContainSource('onScroll={() => handleSettingSidebarScroll(`setting-textarea:');
    expect(styleSource).toContainSource('.xy-setting-sidebar-scrollbar::-webkit-scrollbar');
    expect(styleSource).toContainSource('.scrollbar-scroll-only.scrollbar-half-width::-webkit-scrollbar');
    expect(styleSource).toContainSource('.editor-scrollbar::-webkit-scrollbar-button');
    expect(styleSource).toContainSource('.editor-scrollbar::-webkit-scrollbar-button:vertical:start:decrement');
    expect(styleSource).toContainSource('.editor-scrollbar::-webkit-scrollbar-button:vertical:end:increment');
    expect(styleSource).toContainSource('.editor-scrollbar::-webkit-scrollbar-button:single-button:vertical:decrement');
    expect(styleSource).toContainSource('.editor-scrollbar::-webkit-scrollbar-button:single-button:vertical:increment');
    expect(styleSource).toContainSource(
      '.scrollbar-scroll-only::-webkit-scrollbar-button:single-button:vertical:decrement',
    );
    expect(styleSource).toContainSource(
      '.scrollbar-scroll-only::-webkit-scrollbar-button:single-button:vertical:increment',
    );
    expect(styleSource).toContainSource('.editor-scrollbar::-webkit-scrollbar-corner');
    expect(styleSource).toContainSource('.scrollbar-scroll-only::-webkit-scrollbar-corner');
    expect(styleSource).toContainSource('.editor-scrollbar::-webkit-resizer');
    expect(styleSource).toContainSource('.scrollbar-scroll-only::-webkit-resizer');
    expect(styleSource).toContainSource('background-image: none !important;');
    expect(styleSource).toContainSource('-webkit-appearance: none !important;');
    expect(styleSource).toContainSource('display: none !important;');
    expect(styleSource).toContainSource('width: 4px;');
    expect(styleSource).toContainSource('height: 4px;');
  });

  it('uses the body page format for the outline right-side output card', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const logLayoutSource = await readAiRequestLogModalLayoutSource();
    const outlineRightPanelAnchor = panelSource.lastIndexOf('promptValue={activeOutlinePromptId');
    const outlineRightPanelStart = panelSource.lastIndexOf(
      '<aside className="min-w-0 flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">',
      outlineRightPanelAnchor,
    );
    const outlineRightPanelEnd = panelSource.indexOf('</aside>', outlineRightPanelStart);
    const outlineRightPanelSource = panelSource.slice(outlineRightPanelStart, outlineRightPanelEnd);

    expect(outlineRightPanelAnchor).toBeGreaterThan(-1);
    expect(outlineRightPanelStart).toBeGreaterThan(-1);
    expect(outlineRightPanelEnd).toBeGreaterThan(outlineRightPanelStart);
    expect(outlineRightPanelSource).toContainSource('<div className="relative mt-5 min-h-[170px] flex-1">');
    expect(outlineRightPanelSource).toContainSource(
      'xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-fill xy-floating-with-bottom-count h-full',
    );
    expect(outlineRightPanelSource).not.toContainSource('AI对话框');
    expect(outlineRightPanelSource).not.toContainSource('xy-soft-shell-panel');
    expect(outlineRightPanelSource).not.toContainSource(
      'relative mt-6 flex min-h-[310px] flex-1 flex-col rounded-xl border border-slate-200 bg-white px-3 pb-3 pt-5',
    );
    expect(outlineRightPanelSource).not.toContainSource(
      'xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-inner-clear-tool absolute z-40 px-1',
    );
    expect(styleSource).toContainSource('.xy-floating-field.xy-outline-ai-output-frame {');
    expect(styleSource).toContainSource('border: 2px solid #111827;');
    expect(styleSource).toContainSource('.xy-floating-field.xy-outline-ai-output-frame label.xy-floating-title-count,');
    expect(styleSource).toContainSource('transform: translateY(-50%) scale(1);');
    expect(panelSource).toContainSource('const shouldShowOutlineDraftWordCount = plotPointStandalone;');
    expect(panelSource).not.toContainSource(
      'const shouldShowOutlineDraftWordCount = plotPointStandalone || isDetailOutlineTab;',
    );
    expect(panelSource).toContainSource('if (isDetailOutlineLikeTab(activeTab)) return;');
    expect(panelSource).toContainSource(
      "if (!isDetailOutlineTab && !isDetailOutlineLikeTab(activeTab)) setOutlinePreviewDraft(entry?.content ?? '');",
    );
    expect(panelSource).not.toContainSource('const outlineDraftChapterMeta');
    expect(outlineRightPanelSource).not.toContainSource('outlineDraftChapterMeta');
    expect(outlineRightPanelSource).not.toContainSource('selectedOutlineChapter?.chapter.wordCount');
    expect(outlineRightPanelSource).not.toContainSource('selectedOutlineChapter.chapter.wordCount');
    expect(outlineRightPanelSource).not.toContainSource('selectedVolumeWordCount');
    expect(outlineRightPanelSource).not.toContainSource('章节字数：');
    expect(outlineRightPanelSource).not.toContainSource(
      '正文：<WordCountText value={selectedOutlineChapter.chapter.wordCount} compact />',
    );
    expect(outlineRightPanelSource).not.toContainSource(
      '第{selectedOutlineChapter.chapter.serialNumber}章 {selectedChapterTitle}',
    );
    expect(outlineRightPanelSource).toContainSource('{shouldShowOutlineDraftWordCount && (');
    expect(panelSource).toContainSource(': `第${selectedOutlineChapter.chapter.serialNumber}章梗概`');
    expect(outlineRightPanelSource).toContainSource('{isDetailOutlineTab && (');
    expect(outlineRightPanelSource).toContainSource('label="关联大纲"');
    expect(outlineRightPanelSource).toContainSource('linkedLabel="已关联大纲"');
    expect(outlineRightPanelSource).toContainSource('clearOnLinkedClick');
    expect(outlineRightPanelSource).toContainSource('onClear={clearDetailOutlineReaderSelection}');
    expect(outlineRightPanelSource).toContainSource(
      'linkedButtonClassName="min-w-0 flex-1 whitespace-nowrap px-3 text-sm font-black text-white bg-red-500 hover:bg-red-600"',
    );
    expect(outlineRightPanelSource).not.toContainSource(
      'clearButtonClassName="flex h-full w-9 shrink-0 items-center justify-center border-l border-red-300 bg-red-500 text-white transition-colors hover:bg-red-600"',
    );
    expect(outlineRightPanelSource).toContainSource(
      'meta={<>关联 <WordCountText value={detailOutlineReaderWordCount} compact /></>}',
    );
    expect(outlineRightPanelSource).toContainSource('className="mt-3 flex items-center gap-2"');
    expect(outlineRightPanelSource).toContainSource(
      'groupClassName="flex h-10 w-[132px] shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white"',
    );
    expect(outlineRightPanelSource).toContainSource(
      'buttonClassName="h-10 w-[132px] whitespace-nowrap rounded-xl border border-[#08AACE] bg-white px-3 text-sm font-black text-[#08AACE] hover:bg-[#EAF9FD]"',
    );
    expect(panelSource).toContainSource("readerTitle: '关联资料'");
    expect(panelSource).toContainSource("readerEmptyText: '未关联章纲、设定或角色'");
    expect(panelSource).toContainSource("if (isDetailOutlineTab) return wrapAiRequestTag('本章要求', userText);");
    expect(panelSource).toContainSource("return wrapAiRequestTag('梗概要求', userText);");
    expect(panelSource).toContainSource(
      "const outlineUserLogTitle = isDetailOutlineTab && !plotPointStandalone ? '其他要求' : '输入内容';",
    );
    expect(panelSource).toContainSource('userTitle: outlineUserLogTitle');
    expect(panelSource).toContainSource(
      'function getOutlineAiLogFillGroupWeights(options: { hasReaderContext: boolean; hasContext: boolean; hasUser: boolean; })',
    );
    expect(panelSource).toContainSource('if (hasReference) {');
    expect(panelSource).toContainSource("...(options.hasReaderContext ? { 'reader-context': 1 } : {})");
    expect(panelSource).toContainSource('if (options.hasUser) return { prompt: 2, user: 1 };');
    expect(panelSource).toContainSource('fillGroupWeights={fillGroupWeights}');
    expect(panelSource).toContainSource('label: outlineUserLogTitle');
    expect(logLayoutSource).toContainSource('<div className="text-xs text-slate-400">{item.label}</div>');
    expect(panelSource).not.toContainSource("userTitle: '输入内容'");
    expect(outlineRightPanelSource).not.toContainSource('label="关联设定"');
    expect(outlineRightPanelSource).not.toContainSource(
      'linkedButtonClassName="h-9 shrink-0 rounded-xl bg-[#08AACE] px-3 text-sm font-black text-white transition-colors hover:bg-[#0798b8]"',
    );
    expect(outlineRightPanelSource).not.toContainSource('metaClassName="shrink-0 text-xs font-bold text-slate-400"');
    expect(outlineRightPanelSource).not.toContainSource('已关联 {selectedDetailOutlineReaderItems.length} 项');
    expect(outlineRightPanelSource).not.toContainSource('className="mt-3 flex items-center justify-between gap-3"');
    expect(outlineRightPanelSource).not.toContainSource(
      'metaClassName="min-w-0 truncate text-right text-xs font-bold text-slate-400"',
    );
    expect(panelSource).toContainSource("isDetailOutlineTab ? 'AI输出章纲'");
    expect(panelSource).toContainSource("? 'AI输出框'");
    expect(panelSource).not.toContainSource(
      '? getOutlineChapterFrameTitle(selectedOutlineChapter.volume, selectedOutlineChapter.chapter)',
    );
    expect(outlineRightPanelSource).toContainSource('生成后的章纲会显示在这里，也可以手动编辑后替换所选章纲。');
    expect(panelSource).toContainSource('const [lastDetailOutlineReplacement, setLastDetailOutlineReplacement]');
    expect(panelSource).toContainSource('setLastDetailOutlineReplacement({');
    expect(panelSource).toContainSource('content: selectedOutlineEntry?.content ??');
    expect(panelSource).toContainSource('updateActiveTabConfig({ outlineAiTaskId: undefined });');
    expect(panelSource).toContainSource("setOutlinePreviewDraft('');");
    expect(panelSource).toContainSource(
      'updateChapterSummary(lastDetailOutlineReplacement.chapterSerialNumber, lastDetailOutlineReplacement.content);',
    );
    expect(panelSource).toContainSource('const undoDetailOutlineReplacement = () => {');
    expect(outlineRightPanelSource).toContainSource("isDetailOutlineTab ? '替换章纲' : '保存梗概'");
    expect(outlineRightPanelSource).toContainSource('onClick={undoDetailOutlineReplacement}');
    expect(outlineRightPanelSource).toContainSource('disabled={!lastDetailOutlineReplacement}');
    expect(outlineRightPanelSource).toContainSource('撤销替换');
    expect(outlineRightPanelSource).toContainSource("isDetailOutlineTab ? '复制章纲' : '复制梗概'");
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();
    expect(constantsSource).toContainSource(
      'export const OUTLINE_ACTION_RIGHT_MIN_WIDTH = WORKBENCH_SHARED_AI_RIGHT_WIDTH_MIN;',
    );
    expect(panelSource).toContainSource('? OUTLINE_ACTION_RIGHT_MIN_WIDTH');
    expect(outlineRightPanelSource).toContainSource('min-w-[92px] flex-1 whitespace-nowrap bg-brand');
    expect(outlineRightPanelSource).toContainSource('min-w-[92px] flex-1 whitespace-nowrap border-l border-blue-200');
    expect(outlineRightPanelSource).toContainSource('min-w-[92px] flex-1 whitespace-nowrap border-l border-gray-200');
    expect(outlineRightPanelSource).not.toContainSource(
      'min-w-[92px] flex-1 whitespace-nowrap border-l border-red-200',
    );
    expect(outlineRightPanelSource).not.toContainSource("isDetailOutlineTab ? '清空章纲' : '清空梗概'");
    expect(outlineRightPanelSource).not.toContainSource('保存章纲');
    expect(outlineRightPanelSource).not.toContainSource('xy-floating-outline-output-clear-tool');
    expect(outlineRightPanelSource).not.toContainSource(
      'xy-floating-outline-clear-button xy-border-embedded-transparent-backplate absolute -top-2 right-4 px-1',
    );
    expect(outlineRightPanelSource).not.toContainSource(
      'xy-floating-outline-clear-button xy-border-embedded-transparent-backplate absolute -top-2 right-10 z-30 px-1',
    );
  });

  it('keeps detail outline card top labels from competing with body word counts', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const cardMetaAnchor = panelSource.indexOf('xy-floating-outline-chapter-meta');
    const cardMetaStart = panelSource.lastIndexOf(
      'const outlineCardTitle = getOutlineChapterFrameTitle(volume, chapter);',
      cardMetaAnchor,
    );
    const cardMetaEnd = panelSource.indexOf('</section>', cardMetaStart);
    const cardMetaSource = panelSource.slice(cardMetaStart, cardMetaEnd);

    expect(cardMetaAnchor).toBeGreaterThan(-1);
    expect(cardMetaStart).toBeGreaterThan(-1);
    expect(cardMetaEnd).toBeGreaterThan(cardMetaStart);
    expect(cardMetaSource).toContainSource('chapter.serialNumber');
    expect(cardMetaSource).toContainSource('chapter.title.trim() ||');
    expect(cardMetaSource).toContainSource('detailOutlineParts.outline');
    expect(cardMetaSource).toContainSource('WordCountText value={countTextWords(detailOutlineParts.outline)}');
    expect(cardMetaSource).toContainSource(
      "`第${getVolumeDisplayIndex(volume.id)}卷 · ${chapter.title.trim() || '未命名章节'}`",
    );
    expect(cardMetaSource).toContainSource('max-w-[44%]');
    expect(cardMetaSource).not.toContainSource('max-w-[58%]');
    expect(cardMetaSource).not.toContainSource('正文：');
    expect(cardMetaSource).toContainSource('xy-floating-outline-chapter-meta xy-border-embedded-transparent-backplate');
    expect(styleSource).toContainSource(
      '.xy-floating-field.xy-floating-outline-preview .xy-floating-outline-chapter-meta',
    );
    expect(styleSource).toContainSource('background: transparent;');
    expect(styleSource).toContainSource(
      '.xy-floating-field.xy-floating-outline-preview .xy-floating-outline-chapter-meta *',
    );
  });

  it('keeps detail outline card titles free of body word counts', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const cardSourceStart = panelSource.indexOf(
      'const outlineCardTitle = getOutlineChapterFrameTitle(volume, chapter);',
    );
    const cardSourceEnd = panelSource.indexOf('})()', cardSourceStart);
    const cardSource = panelSource.slice(cardSourceStart, cardSourceEnd);
    const labelStart = cardSource.indexOf('<label className="xy-floating-title-count xy-detail-outline-title-count">');
    const labelEnd = cardSource.indexOf('</label>', labelStart);
    const labelSource = cardSource.slice(labelStart, labelEnd);

    expect(cardSourceStart).toBeGreaterThan(-1);
    expect(cardSourceEnd).toBeGreaterThan(cardSourceStart);
    expect(labelStart).toBeGreaterThan(-1);
    expect(labelEnd).toBeGreaterThan(labelStart);
    expect(cardSource).toContainSource('splitDetailOutlineStateExpectation(outlineCardContent)');
    expect(cardSource).toContainSource('value={detailOutlineParts.outline}');
    expect(cardSource).toContainSource('value={detailOutlineParts.stateExpectation}');
    expect(panelSource).toContainSource(
      '<span className="xy-floating-title-text xy-detail-outline-heading-title">状态变化</span>',
    );
    expect(labelSource).toContainSource('xy-detail-outline-title-count');
    expect(labelSource).toContainSource('xy-floating-title-text xy-detail-outline-heading-title');
    expect(labelSource).toContainSource('{outlineCardTitle}');
    expect(panelSource).toContainSource('? `第${chapter.serialNumber}章章纲`');
    expect(panelSource).not.toContainSource(
      '? `第${chapter.serialNumber}章章纲（第${getVolumeDisplayIndex(volume.id)}卷）`',
    );
    expect(labelSource).not.toContainSource('countTextWords(outlineCardContent)');
    expect(labelSource).not.toContainSource('WordCountText');
    expect(labelSource).not.toContainSource('章纲：');
    expect(cardSource).toContainSource('<WordCountText value={countTextWords(detailOutlineParts.outline)} />');
    expect(panelSource).toContainSource(
      '<WordCountText value={countTextWords(detailOutlineParts.stateExpectation)} />',
    );
    const rightPreviewStart = panelSource.indexOf('<div className="relative mt-5 min-h-[170px] flex-1">');
    const rightPreviewEnd = panelSource.indexOf('{isDetailOutlineTab && (', rightPreviewStart);
    const rightPreviewSource = panelSource.slice(rightPreviewStart, rightPreviewEnd);

    expect(panelSource).toContainSource('const clearOutlineAiOutputDraft = () => {');
    expect(panelSource).toContainSource('onClick={clearOutlineAiOutputDraft}');
    expect(panelSource).toContainSource('const renderDetailOutlineDraftClearButton = () => {');
    expect(panelSource).toContainSource(
      'xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-draft-clear-tool absolute z-40 px-1',
    );
    expect(cardSource).not.toContainSource("onClick={() => updateChapterSummary(chapter.serialNumber, '')}");
    expect(cardSource).not.toContainSource(
      'xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-card-clear-tool absolute z-30 px-1',
    );
    expect(rightPreviewSource).toContainSource('{renderDetailOutlineDraftClearButton()}');
    const clearOutputStart = panelSource.indexOf('const clearOutlineAiOutputDraft = () => {');
    const clearOutputEnd = panelSource.indexOf('const renderDetailOutlineDraftClearButton = () => {', clearOutputStart);
    const clearOutputSource = panelSource.slice(clearOutputStart, clearOutputEnd);
    const clearPreviewStart = panelSource.indexOf('const clearOutlinePreviewDraft = () => {');
    const clearPreviewEnd = panelSource.indexOf('const plotPointLinkedSettingSummary =', clearPreviewStart);
    const clearPreviewSource = panelSource.slice(clearPreviewStart, clearPreviewEnd);

    expect(clearOutputSource).toContainSource("setOutlinePreviewDraft('');");
    expect(clearOutputSource).not.toContainSource('updateChapterSummary');
    expect(clearOutputSource).not.toContainSource('updateVolumeSummary');
    expect(clearPreviewSource).toContainSource("setOutlinePreviewDraft('');");
    expect(clearPreviewSource).not.toContainSource('updateChapterSummary');
    expect(clearPreviewSource).not.toContainSource('updateVolumeSummary');
    expect(cardSource).not.toContainSource("'--xy-floating-count-left': '12.8rem'");
    expect(cardSource).not.toContainSource("'--xy-floating-count-left': isDetailOutlineTab ? '12.8rem' : '11.4rem'");
    expect(cardSource).not.toContainSource('{!isDetailOutlineTab && (');
    expect(styleSource).toContainSource('gap: 0.32rem;');
    expect(styleSource).toContainSource('max-width: min(13rem, calc(42% - 1.5rem));');
    expect(styleSource).toContainSource('.xy-detail-outline-title-count .xy-floating-title-text');
    expect(styleSource).toContainSource(
      '.xy-detail-outline-title-count .xy-floating-title-text.xy-detail-outline-heading-title',
    );
    expect(styleSource).toContainSource('color: #020617;');
    expect(styleSource).toContainSource('font-size: 0.875rem;');
    expect(styleSource).toContainSource('font-weight: 900;');
    expect(styleSource).toContainSource('-webkit-text-stroke: 0;');
    expect(styleSource).toContainSource('text-overflow: ellipsis;');
    expect(styleSource).toContainSource('.xy-floating-outline-draft-clear-tool {');
    expect(styleSource).toContainSource('top: 0;');
    expect(styleSource).toContainSource('right: 1.65rem;');
    expect(styleSource).toContainSource('bottom: auto;');
    expect(styleSource).toContainSource('transform: translateY(-50%);');
  });

  it('places library preview font size controls in the header tool slot and applies detail outline size to every chapter outline card', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const cardSourceStart = panelSource.indexOf(
      'const outlineCardTitle = getOutlineChapterFrameTitle(volume, chapter);',
    );
    const cardSourceEnd = panelSource.indexOf('</section>', cardSourceStart);
    const cardSource = panelSource.slice(cardSourceStart, cardSourceEnd);
    const settingPreviewStart = panelSource.indexOf('placeholder="这里显示选中的设定内容，也可以直接编辑。"');
    const settingPreviewEnd = panelSource.indexOf(
      '<div className="mt-6 flex shrink-0 justify-end">',
      settingPreviewStart,
    );
    const settingPreviewSource = panelSource.slice(settingPreviewStart, settingPreviewEnd);
    const emptySettingPreviewStart = panelSource.indexOf('placeholder="这里可以直接输入设定内容，会自动新建设定。"');
    const emptySettingPreviewEnd = panelSource.indexOf('</div>', emptySettingPreviewStart);
    const emptySettingPreviewSource = panelSource.slice(emptySettingPreviewStart, emptySettingPreviewEnd);
    const outlineGridCondition = panelSource.indexOf('isDetailOutlineTab && showDetailOutlinePublished');
    const outlineDirectoryStart = panelSource.lastIndexOf('gridTemplateColumns:', outlineGridCondition);
    const outlineDirectoryEnd = panelSource.indexOf('{leftResizeHandle}', outlineDirectoryStart);
    const outlineDirectorySource = panelSource.slice(outlineDirectoryStart, outlineDirectoryEnd);

    expect(panelSource).toContainSource('detailOutlineFontSize?: number');
    expect(panelSource).toContainSource('const detailOutlineFontSize = Math.min(');
    expect(panelSource).toContainSource('const setDetailOutlineFontSize = (value: number) =>');
    expect(panelSource).toContainSource('fontSize: detailOutlineFontSize');
    expect(panelSource).toContainSource('const renderDetailOutlineFontSizeTool = () => {');
    expect(panelSource).toContainSource('if (activeTab !== DETAIL_OUTLINE_TAB || plotPointStandalone) return null;');
    expect(panelSource).toContainSource(
      'const getActiveLibraryFontConfig = () => getWorkbenchLibraryActiveFontConfig({',
    );
    expect(panelSource).toContainSource('function getWorkbenchLibraryActiveFontConfig');
    expect(panelSource).toContainSource('const renderActiveLibraryFontSizeTool = () => {');
    expect(panelSource).toContainSource('const renderLibraryHeaderFontSizeTool = () => {');
    expect(panelSource).toContainSource('const [headerToolPortalTarget, setHeaderToolPortalTarget]');
    expect(panelSource).toContainSource(
      "setHeaderToolPortalTarget(document.getElementById('workbench-header-extra-tools'))",
    );
    expect(panelSource).toContainSource(
      'const libraryHeaderFontSizePortal = headerToolPortalTarget && !showInlineFieldSizeButton',
    );
    expect(panelSource).toContainSource('createPortal(renderLibraryHeaderFontSizeTool(), headerToolPortalTarget)');
    expect(panelSource).toContainSource('{libraryHeaderFontSizePortal}');
    expect(panelSource).toContainSource("ariaLabel: '章纲字号'");
    expect(panelSource).toContainSource("ariaLabel: '脑洞预览字号'");
    expect(panelSource).toContainSource("ariaLabel: '脑洞输出字号'");
    expect(panelSource).toContainSource("ariaLabel: '设定预览字号'");
    expect(panelSource).not.toContainSource('章纲目录');
    expect(panelSource).not.toContainSource('<h3 className="text-base font-bold text-gray-900">{isDetailOutlineTab ?');
    expect(panelSource).not.toContainSource('>章节梗概</h3>');
    expect(panelSource).toContainSource("onFocus={() => setActiveLibraryFontTarget('settingPreview')}");
    expect(panelSource).toContainSource("if (isDetailOutlineTab) setActiveLibraryFontTarget('detailOutline');");
    expect(panelSource).toContainSource('style={isDetailOutlineTab ? { fontSize: detailOutlineFontSize } : undefined}');
    expect(panelSource).toContainSource('onMouseDown={() => {');
    expect(panelSource).toContainSource('className="shrink-0"');
    expect(cardSourceStart).toBeGreaterThan(-1);
    expect(cardSourceEnd).toBeGreaterThan(cardSourceStart);
    expect(cardSource).not.toContainSource('ariaLabel="章纲字号"');
    expect(cardSource).not.toContainSource('<div className="xy-floating-border-font-tool">');
    expect(settingPreviewSource).not.toContainSource('<div className="xy-floating-border-font-tool">');
    expect(emptySettingPreviewSource).not.toContainSource('<div className="xy-floating-border-font-tool">');
    expect(outlineDirectoryStart).toBeGreaterThan(-1);
    expect(outlineDirectoryEnd).toBeGreaterThan(outlineDirectoryStart);
    expect(outlineDirectorySource).not.toContainSource('mb-3 flex min-h-9 items-center justify-end gap-2');
    expect(outlineDirectorySource).not.toContainSource("renderLibraryAiLogButton('outline')");
    expect(outlineDirectorySource).not.toContainSource('renderDetailOutlineFontSizeTool()');
    expect(outlineDirectorySource).not.toContainSource('renderFieldSizeButton()');
    expect(outlineDirectorySource).toContainSource('<div className="min-h-0 flex-1 overflow-y-auto">');
  });

  it('uses border-embedded transparent backplates without rectangular white shadows', async () => {
    const styleSource = await readSharedStylesSource();
    const transparentBackplateStart = styleSource.indexOf('.xy-floating-field.xy-floating-outline-preview label');
    const transparentBackplateEnd = styleSource.indexOf(
      '.xy-floating-field.xy-floating-chat-shell',
      transparentBackplateStart,
    );
    const transparentBackplateSource = styleSource.slice(transparentBackplateStart, transparentBackplateEnd);
    const countRuleStart = styleSource.indexOf('.xy-floating-field.xy-floating-outline-preview .xy-floating-count');
    const countRuleEnd = styleSource.indexOf('.xy-floating-field.xy-floating-with-bottom-count', countRuleStart);
    const countRuleSource = styleSource.slice(countRuleStart, countRuleEnd);
    const clearRuleStart = styleSource.indexOf('.xy-floating-outline-clear-button,');
    const clearRuleEnd = styleSource.indexOf(
      '.xy-floating-field.xy-floating-with-bottom-count textarea',
      clearRuleStart,
    );
    const clearRuleSource = styleSource.slice(clearRuleStart, clearRuleEnd);

    expect(styleSource).toContainSource('.xy-border-embedded-transparent-backplate {');
    expect(styleSource).toContainSource('.xy-border-embedded-transparent-backplate *');
    expect(styleSource).toContainSource('.xy-floating-field .xy-floating-count *');
    expect(styleSource).toContainSource('.xy-floating-field .xy-floating-count {');
    expect(styleSource).toContainSource('.xy-brainstorm-floating-title-tool::before,');
    expect(styleSource).toContainSource('.xy-brainstorm-output-title-tool::before');
    expect(styleSource).toContainSource('display: block !important;');
    expect(styleSource).toContainSource('.xy-brainstorm-output-preview-list {');
    expect(styleSource).toContainSource('background: transparent;');
    expect(styleSource).toContainSource('padding: 0;');
    expect(transparentBackplateSource).toContainSource('background-color: transparent;');
    expect(transparentBackplateSource).toContainSource('text-shadow: none;');
    expect(transparentBackplateSource).toContainSource(
      '-webkit-text-stroke: 3px var(--xy-floating-backplate-bg, #ffffff);',
    );
    expect(transparentBackplateSource).toContainSource('paint-order: stroke fill;');
    expect(transparentBackplateSource).toContainSource('isolation: isolate;');
    expect(transparentBackplateSource).toContainSource('background-image: linear-gradient(');
    expect(countRuleSource).toContainSource('.xy-floating-field.xy-floating-outline-preview .xy-floating-count *');
    expect(countRuleSource).toContainSource(
      '.xy-floating-field.xy-floating-outline-preview .xy-floating-outline-chapter-meta *',
    );
    expect(countRuleSource).toContainSource('-webkit-text-stroke: 3px var(--xy-floating-backplate-bg, #ffffff);');
    expect(clearRuleSource).toContainSource('.xy-floating-outline-clear-button *');
    expect(clearRuleSource).toContainSource('background-color: transparent !important;');
    expect(clearRuleSource).toContainSource('-webkit-text-stroke: 3px var(--xy-floating-backplate-bg, #ffffff);');
    expect(clearRuleSource).not.toContainSource('background: transparent !important;');
    expect(clearRuleSource).not.toContainSource('1px 0 0 #ffffff');
    expect(clearRuleSource).not.toContainSource('-1px 0 0 #ffffff');
  });

  it('explicitly marks border-embedded content with the transparent backplate class', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterSource = await readChapterEditorSource();

    expect(panelSource).toContainSource('xy-floating-outline-chapter-meta xy-border-embedded-transparent-backplate');
    expect(panelSource).toContainSource('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate');
    expect(panelSource).toContainSource(
      'xy-floating-inline-title-tool xy-brainstorm-floating-title-tool xy-floating-title-count xy-border-embedded-transparent-backplate',
    );
    expect(chapterSource).toContainSource('xy-floating-outline-clear-button xy-border-embedded-transparent-backplate');
  });

  it('does not show an AI dialogue label in the setting outline generator output area', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const outputFrameAnchor = panelSource.indexOf('xy-outline-ai-output-frame xy-floating-fill h-full');
    const outputAreaAnchor = panelSource.indexOf('生成设定', outputFrameAnchor);
    const outputAreaStart = panelSource.lastIndexOf('<div className="relative mt-5 min-h-0 flex-1">', outputAreaAnchor);
    const outputAreaEnd = panelSource.indexOf('{activeTab === SETTING_TAB && (', outputAreaAnchor);
    const outputAreaSource = panelSource.slice(outputAreaStart, outputAreaEnd);

    expect(outputAreaAnchor).toBeGreaterThan(-1);
    expect(outputAreaStart).toBeGreaterThan(-1);
    expect(outputAreaEnd).toBeGreaterThan(outputAreaStart);
    expect(outputAreaSource).toContainSource(
      'xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-fill h-full',
    );
    expect(outputAreaSource).toContainSource(
      '<label className="xy-floating-title-count xy-border-embedded-transparent-backplate">生成设定</label>',
    );
    expect(outputAreaSource).toContainSource('onClick={clearLibraryAiDialog}');
    expect(outputAreaSource).toContainSource(
      'xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-top-clear-tool absolute z-40 px-1',
    );
    expect(outputAreaSource).not.toContainSource('可以在这里生成');
    expect(outputAreaSource).not.toContainSource('text-gray-400');
    expect(outputAreaSource).not.toContainSource('AI对话框');
    expect(outputAreaSource).not.toContainSource('rounded-xl border border-gray-200 bg-white px-3 pb-3 pt-5');
    expect(outputAreaSource).not.toContainSource(
      'absolute -top-2 left-4 bg-white px-1 text-sm font-black text-gray-900',
    );
    expect(styleSource).toContainSource('.xy-floating-outline-top-clear-tool {');
    expect(styleSource).toContainSource('transform: translateY(-50%);');
  });

  it('does not show an AI dialogue label in the plot point generator output area', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const plotPointAreaEnd = panelSource.indexOf('title={plotPointLinkedSettingSummary}');
    const plotPointAreaStart = panelSource.lastIndexOf(
      '<div className="relative flex min-h-0 flex-1 flex-col">',
      plotPointAreaEnd,
    );
    const plotPointAreaSource = panelSource.slice(plotPointAreaStart, plotPointAreaEnd);

    expect(plotPointAreaEnd).toBeGreaterThan(-1);
    expect(plotPointAreaStart).toBeGreaterThan(-1);
    expect(plotPointAreaEnd).toBeGreaterThan(plotPointAreaStart);
    expect(plotPointAreaSource).toContainSource(
      'xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 xy-has-value',
    );
    expect(plotPointAreaSource).not.toContainSource('AI对话框');
    expect(plotPointAreaSource).not.toContainSource('rounded-xl border border-slate-200 bg-white px-3 pb-3 pt-5');
    expect(plotPointAreaSource).not.toContainSource(
      'absolute -top-2 left-4 bg-white px-1 text-sm font-black text-slate-950',
    );
  });

  it('uses the 07 no-card right-side shell across official editor right panels', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterSource = await readChapterEditorSource();

    expect(panelSource).toContainSource(
      '<aside className="flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">',
    );
    expect(panelSource).toContainSource(
      '<aside className="min-w-0 flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">',
    );
    expect(panelSource).toContainSource(
      'xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-fill xy-floating-with-bottom-count h-full',
    );
    expect(chapterSource).toContainSource(
      'xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count mt-4 min-h-0 flex-1',
    );
    expect(chapterSource).toContainSource(
      'xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill h-full xy-has-value',
    );
    expect(chapterSource).toContainSource(
      "const CHAPTER_EDITOR_RESIZE_HANDLE_CLASS = 'group relative z-10 flex h-full w-3 -translate-x-1/2 cursor-ew-resize items-stretch justify-center bg-transparent';",
    );
    expect(chapterSource).toContainSource(
      'style={{ gridTemplateColumns: `${statusPageLeftWidth}px 0px minmax(0,1fr) 0px ${statusPageRightWidth}px` }}',
    );
    expect(chapterSource).toContainSource(
      'style={{ gridTemplateColumns: `${reviewPageLeftWidth}px 0px minmax(0,1fr) 0px ${reviewPageRightWidth}px` }}',
    );
    expect(panelSource).not.toContainSource(
      'relative mt-5 flex min-h-0 flex-1 flex-col rounded-xl border border-gray-200 bg-white px-3 pb-3 pt-5',
    );
    expect(panelSource).not.toContainSource(
      'relative flex h-full min-h-0 flex-col rounded-xl border border-gray-200 bg-white px-3 pb-3 pt-5',
    );
    expect(panelSource).not.toContainSource(
      'relative flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white px-3 pb-3 pt-5',
    );
    expect(chapterSource).not.toContainSource('AI 閰嶇疆');
    expect(chapterSource).not.toContainSource('AI 输出框');
    expect(chapterSource).not.toContainSource(
      'flex min-h-[240px] flex-col rounded-2xl border border-[#08AACE] bg-white',
    );
  });

  it('uses the brainstorm library gray background for chapter directory sidebars', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterSource = await readChapterEditorSource();

    expect(panelSource).toContainSource("isDetailOutlineTab ? 'bg-gray-50' : 'bg-gray-50 px-1 py-2'");
    expect(panelSource).toContainSource(
      '<aside className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50">',
    );
    expect(panelSource).toContainSource(
      '<aside className="min-w-0 flex min-h-0 flex-col border-r border-slate-100 bg-gray-50 px-1 py-2">',
    );
    expect(chapterSource).toContainSource(
      '<aside className="flex min-h-0 flex-col border-r border-slate-100 bg-gray-50 px-1 py-2">',
    );
    expect(chapterSource).not.toContainSource(
      '<aside className="flex min-h-0 flex-col border-r border-slate-100 bg-white px-1 py-2">',
    );
  });

  it('does not show the plot chain generation rules heading in the right panel', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const plotPointControlsStart = panelSource.indexOf(
      '<span className="w-[96px] shrink-0 text-sm font-black text-slate-950">长度：</span>',
    );
    const plotPointControlsEnd = panelSource.indexOf(
      '<div className="relative flex min-h-0 flex-1 flex-col">',
      plotPointControlsStart,
    );
    const plotPointControlsSource = panelSource.slice(plotPointControlsStart, plotPointControlsEnd);

    expect(plotPointControlsStart).toBeGreaterThan(-1);
    expect(plotPointControlsEnd).toBeGreaterThan(plotPointControlsStart);
    expect(plotPointControlsSource).toContainSource('剧情点类型：');
    expect(plotPointControlsSource).toContainSource('剧情点数量：');
    expect(plotPointControlsSource).not.toContainSource('生成规则</div>');
  });

  it('keeps detail outline reader aligned with the setting link picker layout', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const modalHeaderSource = await readWorkbenchDetailOutlineReaderModalSource();
    const readerAsideStart = modalHeaderSource.indexOf(
      '<aside className="editor-scrollbar min-h-0 overflow-y-auto border-r border-gray-100 bg-slate-50 px-1 py-2">',
    );
    const readerAsideEnd = modalHeaderSource.indexOf(
      '<main className="editor-scrollbar min-h-0 overflow-y-auto p-6">',
      readerAsideStart,
    );
    const readerAsideHeaderSource = modalHeaderSource.slice(readerAsideStart, readerAsideEnd);

    expect(readerAsideStart).toBeGreaterThan(-1);
    expect(readerAsideEnd).toBeGreaterThan(readerAsideStart);
    expect(modalHeaderSource).toContainSource('<h3 className="text-xl font-bold text-gray-900">关联资料</h3>');
    expect(modalHeaderSource).toContainSource('grid-cols-[300px_minmax(0,1fr)_280px]');
    expect(modalHeaderSource).toContainSource('本次将读取');
    expect(modalHeaderSource).toContainSource('draftDetailOutlineReaderItems.map((entry) => (');
    expect(modalHeaderSource).toContainSource('setDetailOutlineReaderPreviewId(entry.id);');
    expect(modalHeaderSource).toContainSource("['outlines', '章纲']");
    expect(modalHeaderSource).toContainSource("['settings', '设定']");
    expect(modalHeaderSource).toContainSource("['roles', '角色']");
    expect(modalHeaderSource).not.toContainSource("['plotChain', '剧情链']");
    expect(modalHeaderSource).not.toContainSource('选择会随本次请求一起发给 AI；剧情大纲也可按需要勾选或取消。');
    expect(panelSource).not.toContainSource('选择会随本次请求一起发给 AI；剧情大纲也可按需要勾选或取消。');
    expect(panelSource).toContainSource("setDetailOutlineReaderTab('outlines');");
    expect(panelSource).not.toContainSource("setDetailOutlineReaderTab('settings');");
    expect(readerAsideHeaderSource).toContainSource('WORKBENCH_FOLDER_GROUP_BUTTON_CLASS');
    expect(modalHeaderSource).toContainSource('onClick={selectAllActiveDetailOutlineReaderItems}');
    expect(modalHeaderSource).toContainSource('关联所有');
  });

  it('keeps the other-setting link picker focused on the list and preview only', async () => {
    const modalSource = await readWorkbenchOtherSettingReaderModalSource();

    expect(modalSource).toContainSource('grid-cols-[300px_minmax(0,1fr)]');
    expect(modalSource).toContainSource('已选 {draftEntries.length} 项');
    expect(modalSource).not.toContainSource('grid-cols-[300px_minmax(0,1fr)_280px]');
    expect(modalSource).not.toContainSource('本次将关联');
    expect(modalSource).not.toContainSource('还没有选择其他设定');
    expect(modalSource).not.toContainSource('确认后，这些条目会合并成“关联其他设定”上下文');
  });

  it('keeps outline page text inputs protected from draggable overlays and decorative hit targets', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const aiInlineInputSource = await readAiInlineInputSource();
    const selectedSettingStart = panelSource.indexOf('placeholder="这里显示选中的设定内容，也可以直接编辑。"');
    const selectedSettingSource = panelSource.slice(
      panelSource.lastIndexOf('<textarea', selectedSettingStart),
      selectedSettingStart,
    );
    const volumeStart = panelSource.indexOf('placeholder="这一卷的梗概会显示在这里，内容是该卷下所有章节内容的总结。"');
    const volumeSource = panelSource.slice(panelSource.lastIndexOf('<textarea', volumeStart), volumeStart);
    const chapterStart = panelSource.indexOf('该章章纲会显示在这里，可由 AI 根据章节内容生成。');
    const chapterSource = panelSource.slice(panelSource.lastIndexOf('<textarea', chapterStart), chapterStart);
    const draftStart = panelSource.indexOf('生成后的剧情点会显示在这里，也可以手动编辑后复制。');
    const draftSource = panelSource.slice(panelSource.lastIndexOf('<textarea', draftStart), draftStart);

    expect(selectedSettingStart).toBeGreaterThan(-1);
    expect(volumeStart).toBeGreaterThan(-1);
    expect(chapterStart).toBeGreaterThan(-1);
    expect(draftStart).toBeGreaterThan(-1);
    expect(selectedSettingSource).toContainSource('data-no-modal-drag="true"');
    expect(volumeSource).toContainSource('data-no-modal-drag="true"');
    expect(chapterSource).toContainSource('data-no-modal-drag="true"');
    expect(draftSource).toContainSource('data-no-modal-drag="true"');
    expect(aiInlineInputSource).toContainSource('<div data-no-modal-drag="true"');
    expect(aiInlineInputSource).toContainSource("variant?: 'default' | 'neutral'");
    expect(aiInlineInputSource).toContainSource("variant = 'neutral'");
    expect(aiInlineInputSource).toContainSource("variant === 'neutral' ? 'xy-ai-inline-neutral' : ''");
    expect(aiInlineInputSource).toContainSource('<textarea\n        data-no-modal-drag="true"');
    expect(styleSource).toContainSource(
      '.writer-assistant-theme .xy-floating-field.xy-ai-inline-neutral.xy-floating-with-inline-actions textarea',
    );
    expect(styleSource).toContainSource('border-color: #d7dee8;');
    expect(styleSource).toContainSource(
      '.writer-assistant-theme .xy-floating-field.xy-ai-inline-neutral .xy-ai-inline-send',
    );
    expect(styleSource).toContainSource('color: #21B8DA;');
    expect(styleSource).toContainSource(
      '.xy-ai-inline-send {\n  flex: 1.12 1 0;\n  background: #ffffff;\n  color: #21B8DA;',
    );
    expect(styleSource).toContainSource('.writer-assistant-theme .xy-ai-inline-send {\n  color: #21B8DA;');
    expect(styleSource).toContainSource(
      '.writer-assistant-theme .xy-floating-field.xy-ai-inline-neutral .xy-ai-inline-stop {\n  border-left-color: #d7dee8;',
    );
    expect(styleSource).not.toContainSource(
      '.writer-assistant-theme .xy-ai-inline-stop {\n  border-left-color: var(--xy-wa-blue);',
    );
    expect(styleSource).not.toContainSource(
      '.xy-floating-field input,\n.xy-floating-field textarea {\n  position: relative;\n  z-index: 1;',
    );
    expect(styleSource).toContainSource('.xy-floating-field label.xy-border-embedded-transparent-backplate,');
    expect(styleSource).toContainSource(
      '.xy-floating-field label.xy-border-embedded-transparent-backplate {\n  position: absolute;',
    );
    expect(styleSource).toContainSource(
      '.xy-floating-field .xy-floating-outline-chapter-meta {\n  pointer-events: none;',
    );
  });

  it('keeps plot point preview actions at the bottom without the preview title or status copy', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const plotPointStandaloneStart = panelSource.indexOf('if (plotPointStandalone) {');
    const centerPanelStart = panelSource.indexOf(
      '<section className="min-w-0 flex min-h-0 flex-col bg-white">',
      plotPointStandaloneStart,
    );
    const centerPanelEnd = panelSource.indexOf('{plotPointRightResizeHandle}', centerPanelStart);
    const centerPanelSource = panelSource.slice(centerPanelStart, centerPanelEnd);
    const candidateListIndex = centerPanelSource.indexOf('plotPointVisibleCandidates.length === 0');
    const actionRowIndex = centerPanelSource.indexOf(
      '<div className="flex h-14 shrink-0 items-center justify-end gap-2 border-t border-slate-100 px-4">',
    );

    expect(plotPointStandaloneStart).toBeGreaterThan(-1);
    expect(centerPanelStart).toBeGreaterThan(-1);
    expect(centerPanelEnd).toBeGreaterThan(centerPanelStart);
    expect(candidateListIndex).toBeGreaterThan(-1);
    expect(actionRowIndex).toBeGreaterThan(candidateListIndex);
    expect(centerPanelSource).not.toContainSource('<h2 className="text-sm font-black text-slate-950">剧情点预览</h2>');
    expect(centerPanelSource).not.toContainSource('等待手动刷新衔接剧情');
    expect(centerPanelSource).toContainSource('清空');
    expect(centerPanelSource).toContainSource('重新生成');
    expect(centerPanelSource).toContainSource('继续生成');
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
    expect(removeButtonSource).toContainSource('border border-red-200');
    expect(removeButtonSource).toContainSource('bg-red-50');
    expect(removeButtonSource).toContainSource('shadow-sm');
    expect(removeButtonSource).not.toContainSource('className="shrink-0 text-xs font-black text-red-500"');
    expect(removeButtonSource).toContainSource('togglePlotPointCandidate(item.id)');
    expect(removeButtonSource).not.toContainSource('openDetailOutlineFromPlotPoint');
  });

  it('renders plot chain slots with the same collapsible tree structure as the chapter sidebar', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const plotPointStandaloneStart = panelSource.indexOf('if (plotPointStandalone) {');
    const gridTemplateStart = panelSource.indexOf(
      'gridTemplateColumns: `${plotPointLayoutTreeWidth}',
      plotPointStandaloneStart,
    );
    const navStart = panelSource.indexOf(
      '<nav className="editor-scrollbar min-h-0 flex-1 overflow-y-auto" aria-label="剧情链目录树">',
    );
    const navEnd = panelSource.indexOf('</nav>', navStart);
    const navSource = panelSource.slice(navStart, navEnd);

    expect(gridTemplateStart).toBeGreaterThan(-1);
    expect(panelSource.slice(gridTemplateStart, gridTemplateStart + 240)).toContainSource(
      '${plotPointLayoutTreeWidth}px 0px ${plotPointLayoutLeftWidth}px 0px',
    );
    expect(navStart).toBeGreaterThan(-1);
    expect(navEnd).toBeGreaterThan(navStart);
    expect(panelSource).toContainSource(
      'const [plotPointLayoutTreeWidth, setPlotPointLayoutTreeWidth] = useState(() => readPlotPointLayoutTreeWidth(storageKey));',
    );
    expect(panelSource).toContainSource('plotPointTreeResizeHandle,');
    expect(panelSource).toContainSource('plotPointTreeResizeHandle: (');
    expect(panelSource).toContainSource('onPointerDown={startPlotPointTreeWidthResize}');
    expect(panelSource).toContainSource('title="拖拽调整剧情链目录宽度"');
    expect(panelSource).toContainSource('{plotPointTreeResizeHandle}');
    expect(panelSource).toContainSource(
      'const [plotPointChainNames, setPlotPointChainNames] = useState<Record<PlotPointChainSlot, string>>(() =>',
    );
    expect(panelSource).toContainSource('normalizePlotPointChainNames(activeTabConfig.plotPointChainNames)');
    expect(panelSource).not.toContainSource('aria-label="剧情链名称"');
    expect(panelSource).not.toContainSource('value={currentPlotPointChainName}');
    expect(panelSource).not.toContainSource('onChange={(event) => renamePlotPointChain(event.target.value)}');
    expect(panelSource).toContainSource(
      'const [expandedPlotPointChainTreeSlots, setExpandedPlotPointChainTreeSlots] = useState<Record<PlotPointChainSlot, boolean>>({',
    );
    expect(panelSource).not.toContainSource(
      '<h2 className="whitespace-nowrap text-sm font-bold text-gray-900">剧情链</h2>',
    );
    expect(panelSource).toContainSource(
      '<aside className="min-w-0 flex min-h-0 flex-col border-r border-slate-100 bg-gray-50 px-1 py-2">',
    );
    expect(navSource).toContainSource('aria-label="当前主链未写序号导航"');
    expect(navSource).toContainSource('onContextMenu={(event) => {');
    expect(navSource).toContainSource('setPlotPointChainMenuSlot(plotPointActiveChainSlot)');
    expect(navSource).toContainSource(
      'setPlotPointChainRenameDraft(plotPointChainNames[plotPointActiveChainSlot] ?? `剧情链${plotPointActiveChainSlot}`)',
    );
    expect(navSource).toContainSource('aria-label="当前主链菜单"');
    expect(navSource).toContainSource('renamePlotPointChain(plotPointActiveChainSlot, plotPointChainRenameDraft)');
    expect(navSource).toContainSource(
      'const originalIndex = plotPointSelectedItems.findIndex((selectedItem) => selectedItem.id === item.id);',
    );
    expect(navSource).toContainSource('plotPointUnwrittenItems.map((item) => {');
    expect(navSource).toContainSource('aria-label={`跳转未写剧情点${originalIndex + 1} ${item.title}`}');
    expect(navSource).toContainSource("setPlotPointChainFilterMode('all')");
    expect(navSource).toContainSource('setActivePlotPointChainItemId(item.id)');
    expect(navSource).toContainSource('暂无未写剧情点');
    expect(navSource).toContainSource("style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(36px, max-content))' }}");
    expect(navSource).toContainSource(
      '<span className="min-w-0 flex-1 truncate text-sm font-bold text-white">备选链</span>',
    );
    expect(navSource).toContainSource('{PLOT_POINT_CHAIN_SLOTS.length - 1}条');
    expect(navSource).toContainSource(
      'PLOT_POINT_CHAIN_SLOTS.filter((slot) => slot !== plotPointActiveChainSlot).map((slot) => (',
    );
    expect(navSource).toContainSource('onClick={() => setActivePlotPointChainSlot(slot)}');
    expect(navSource).toContainSource(
      'aria-expanded={expandedPlotPointChainTreeSlots[plotPointActiveChainSlot] ?? true}',
    );
    expect(navSource).toContainSource('expandedPlotPointChainTreeSlots[plotPointActiveChainSlot] ?? true');
    expect(navSource).not.toContainSource('{PLOT_POINT_CHAIN_SLOTS.length}条');
    expect(navSource).toContainSource('主链');
    expect(navSource).not.toContainSource(
      '{plotPointChainNames[plotPointActiveChainSlot] ?? `剧情链${plotPointActiveChainSlot}`}',
    );
    expect(navSource).toContainSource('{plotPointUnwrittenItems.length}未写');
    expect(navSource).toContainSource(
      'className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-[#08AACE] bg-[#08AACE] px-3 py-1.5 text-left text-sm font-bold leading-5 text-white transition-colors hover:brightness-95"',
    );
    expect(navSource).toContainSource(
      '<summary className="xy-plot-chain-summary flex cursor-pointer items-center gap-2 rounded-lg border border-[#08AACE] bg-[#08AACE] px-3 py-1.5 text-sm font-bold leading-5 text-white transition-colors hover:brightness-95">',
    );
    expect(navSource).toContainSource(
      '<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/15 text-white">',
    );
    expect(navSource).toContainSource(
      '<span className="min-w-0 flex-1 truncate text-sm font-bold text-white">{plotPointChainNames[slot] ?? `剧情链${slot}`}</span>',
    );
    expect(navSource).toContainSource(
      '<span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">{(plotPointChainSelections[slot] ?? []).length}点</span>',
    );
    expect(navSource).toContainSource('xy-plot-chain-summary');
    expect(navSource).toContainSource('className="mt-1 grid justify-start gap-2 px-1.5 py-1.5"');
    expect(navSource).toContainSource('className="mt-1 grid gap-2 px-1.5 py-1.5"');
    expect(navSource).toContainSource(
      'relative h-9 min-w-9 rounded-lg border px-2 text-sm font-black transition-colors',
    );
    expect(navSource).toContainSource('activePoint');
    expect(navSource).toContainSource("'border-[#08B3D9] bg-[#EAF9FD] text-[#078fb0]'");
    expect(navSource).toContainSource('title={`未写剧情点${originalIndex + 1} ${item.title}`}');
    expect(navSource).toContainSource('{originalIndex + 1}');
    expect(navSource).not.toContainSource('className="ml-1 mt-0.5 space-y-0.5"');
    expect(navSource).not.toContainSource("activePoint ? 'text-orange-600' : 'text-gray-700'");
    expect(navSource).not.toContainSource('剧情点{originalIndex + 1}');
    expect(navSource).not.toContainSource('border-transparent hover:bg-gray-50');
    expect(navSource).not.toContainSource('ring-2 ring-[#bdeef7]');
    expect(navSource).not.toContainSource('border-orange-400 bg-orange-50 text-orange-600 ring-2 ring-orange-100');
    expect(navSource).not.toContainSource('border-[#08AACE] bg-[#08AACE] text-white');
    expect(navSource).not.toContainSource(
      'border-[#bdeef7] bg-white text-[#078fb0] hover:border-[#08AACE] hover:bg-[#F7FCFE]',
    );
    expect(navSource).not.toContainSource('text-orange-500');
    expect(navSource).not.toContainSource('剧情点{index + 1}');
    expect(navSource).not.toContainSource('PLOT_POINT_CHAIN_SLOTS.map((slot) => {');
    expect(panelSource).not.toContainSource('aria-label="剧情链导航"');
    expect(panelSource).not.toContainSource('mb-3 flex min-w-0 gap-2 overflow-x-auto');
    expect(panelSource).not.toContainSource(
      '<h2 className="text-sm font-black text-slate-950">剧情链{plotPointActiveChainSlot}</h2>',
    );
    expect(panelSource).toContainSource('选中的剧情点会加入当前剧情链。');
    expect(panelSource).not.toContainSource('选中的剧情点会加入当前数字剧情链。');
  });

  it('renders selected plot point cards as a full-content timeline preview area', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const plotChainSource = await readWorkbenchPlotChainSource();
    const selectedListStart = panelSource.indexOf('relative space-y-4 pl-6 before:absolute');
    const selectedListEnd = panelSource.indexOf('{plotPointLeftResizeHandle}', selectedListStart);
    const selectedListSource = panelSource.slice(selectedListStart, selectedListEnd);

    expect(selectedListStart).toBeGreaterThan(-1);
    expect(selectedListEnd).toBeGreaterThan(selectedListStart);
    expect(panelSource).toContainSource(
      "const [plotPointChainFilterMode, setPlotPointChainFilterMode] = useState<'all' | 'unwritten' | 'written'>('all');",
    );
    expect(panelSource).toContainSource(
      'const plotPointWrittenIds = plotPointChainWrittenSelections[plotPointActiveChainSlot] ?? [];',
    );
    expect(panelSource).toContainSource(
      'const plotPointUnwrittenItems = plotPointSelectedItems.filter((item) => !plotPointWrittenIdSet.has(item.id));',
    );
    expect(panelSource).toContainSource("if (plotPointChainFilterMode === 'written') return written;");
    expect(panelSource).toContainSource("if (plotPointChainFilterMode === 'unwritten') return !written;");
    expect(panelSource).toContainSource('markPlotPointChainItemWritten(item.id)');
    expect(panelSource).toContainSource('movePlotPointChainItemToUnwritten(item.id)');
    expect(panelSource).toContainSource("['all', '全部']");
    expect(panelSource).toContainSource("['unwritten', '只看未写']");
    expect(panelSource).toContainSource("['written', '只看已写']");
    expect(panelSource).toContainSource('className="flex flex-wrap items-center gap-2"');
    expect(panelSource).toContainSource('h-10 w-20 whitespace-nowrap rounded-2xl border px-2');
    expect(panelSource).toContainSource('h-10 w-20 whitespace-nowrap rounded-2xl bg-[#08AACE]');
    expect(panelSource).not.toContainSource('grid-cols-[repeat(auto-fit,minmax(128px,1fr))]');
    expect(panelSource).toContainSource('onClick={openDetailOutlineFromPlotPoint}');
    expect(panelSource).not.toContainSource("['hideWritten', '已写隐藏']");
    expect(selectedListSource).toContainSource('visiblePlotPointSelectedItems.map((item) => {');
    expect(selectedListSource).toContainSource('const written = plotPointWrittenIdSet.has(item.id);');
    expect(selectedListSource).toContainSource("written ? '移回未写' : '标为已写'");
    expect(selectedListSource).toContainSource('删除');
    expect(selectedListSource).not.toContainSource('生成章纲');
    expect(panelSource).toContainSource('当前过滤条件下没有剧情点');
    expect(selectedListSource).toContainSource("['内容', metrics.clarity]");
    expect(selectedListSource).toContainSource("['潜力', metrics.potential]");
    expect(selectedListSource).toContainSource("['衔接', metrics.fit]");
    expect(selectedListSource).toContainSource(
      'const reviewExpanded = expandedPlotPointPreviewIds.includes(`chain-review:${item.id}`);',
    );
    expect(selectedListSource).not.toContainSource('时间线预览 · 剧情点');
    expect(selectedListSource).not.toContainSource('item.title || `剧情点 ${index + 1}`');
    expect(selectedListSource).not.toContainSource('className="flex items-start justify-end gap-3"');
    expect(selectedListSource).toContainSource('className="mt-3 flex items-center justify-between gap-3"');
    expect(selectedListSource).toContainSource('className="flex shrink-0 flex-wrap items-center justify-end gap-2"');
    expect(selectedListSource).toContainSource('relative space-y-4 pl-6 before:absolute');
    expect(selectedListSource).toContainSource(
      'editor-scrollbar mt-1 max-h-64 overflow-y-auto rounded-2xl border border-[#BDEEF7] bg-[#F1FBFE]',
    );
    expect(selectedListSource).not.toContainSource(
      'editor-scrollbar mt-3 max-h-64 overflow-y-auto rounded-2xl border border-[#BDEEF7] bg-[#F1FBFE]',
    );
    expect(selectedListSource).toContainSource('{displayText}');
    expect(selectedListSource).not.toContainSource('aria-hidden="true"');
    expect(selectedListSource).not.toContainSource('>剧情点 {index + 1}</span>');
    expect(selectedListSource).not.toContainSource('line-clamp-6 text-sm font-bold leading-6 text-slate-700');
    expect(selectedListSource).toContainSource('mt-3 grid grid-cols-3 gap-2');
    expect(panelSource).toContainSource("from '@/features/workbench/model/workbenchPlotChain'");
    expect(plotChainSource).toContainSource('function getWorkbenchPlotPointMetricClass(score: number)');
    expect(plotChainSource).toContainSource("if (score >= 90) return 'border-amber-200 bg-amber-50 text-amber-700';");
    expect(plotChainSource).toContainSource(
      "if (score >= 80) return 'border-purple-200 bg-purple-50 text-purple-700';",
    );
    expect(plotChainSource).toContainSource("if (score >= 70) return 'border-sky-200 bg-sky-50 text-sky-700';");
    expect(plotChainSource).toContainSource("return 'border-emerald-200 bg-emerald-50 text-emerald-700';");
    expect(selectedListSource).toContainSource('${getWorkbenchPlotPointMetricClass(value)}');
    expect(selectedListSource).toContainSource(
      'onClick={() => togglePlotPointPreviewExpanded(`chain-review:${item.id}`)}',
    );
    const writtenActionIndex = selectedListSource.indexOf(': markPlotPointChainItemWritten(item.id)');
    expect(selectedListSource.indexOf('mt-3 grid grid-cols-3 gap-2')).toBeLessThan(
      selectedListSource.indexOf('onClick={() => togglePlotPointPreviewExpanded(`chain-review:${item.id}`)}'),
    );
    expect(
      selectedListSource.indexOf('onClick={() => togglePlotPointPreviewExpanded(`chain-review:${item.id}`)}'),
    ).toBeLessThan(writtenActionIndex);
    expect(selectedListSource).toContainSource("{reviewExpanded ? '收起AI评价' : 'AI评价'}");
    expect(selectedListSource).toContainSource('{reviewExpanded && (');
    expect(selectedListSource).toContainSource('getWorkbenchPlotPointReview(item, isPlotPointFollowupStage)');
    expect(selectedListSource).not.toContainSource('w-[104px] shrink-0 space-y-1.5');
    expect(selectedListSource).not.toContainSource(
      'flex h-8 items-center justify-between rounded-xl bg-white px-3 shadow-sm',
    );
    expect(selectedListSource).toContainSource(
      'flex h-8 items-center justify-between rounded-xl border px-3 shadow-sm',
    );
    expect(selectedListSource).toContainSource('text-xs font-black opacity-80');
    expect(selectedListSource).toContainSource('text-sm font-black');
    expect(selectedListSource).not.toContainSource('text-center shadow-sm');
    expect(selectedListSource).not.toContainSource('潜力 {metrics.potential}');
    expect(panelSource).toContainSource('title="拖拽调整剧情链左侧宽度"');
    expect(panelSource).toContainSource('widthClass="w-3"');
    expect(panelSource).toContainSource('h-full ${widthClass} -translate-x-1/2 shrink-0 cursor-ew-resize');
    expect(panelSource).toContainSource(
      'h-full w-px bg-[#08AACE] opacity-0 transition-opacity group-hover:opacity-100',
    );
    expect(selectedListSource).not.toContainSource('transition-colors hover:bg-[#EAF9FD]');
  });

  it('keeps plot chain action buttons white instead of emerald tinted on the detail outline page', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const writtenButtonAnchor = panelSource.indexOf(': markPlotPointChainItemWritten(item.id)');
    const writtenButtonStart = panelSource.lastIndexOf('<button', writtenButtonAnchor);
    const writtenButtonEnd = panelSource.indexOf('</button>', writtenButtonAnchor);
    const writtenButtonSource = panelSource.slice(writtenButtonStart, writtenButtonEnd);

    expect(writtenButtonAnchor).toBeGreaterThan(-1);
    expect(writtenButtonSource).toContainSource(
      "'border-emerald-200 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-white hover:text-emerald-800'",
    );
    expect(writtenButtonSource).not.toContainSource('bg-emerald-50');
    expect(writtenButtonSource).not.toContainSource('hover:bg-emerald-100');
  });

  it('hides raw reasoning text in the plot chain right output so it matches final candidates', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const renderFunctionStart = panelSource.indexOf(
      'function renderAiChatContent(content: string, options: { hideReasoningBody?: boolean } = {})',
    );
    const renderFunctionEnd = panelSource.indexOf('\n\nimport ', renderFunctionStart);
    const renderFunctionSource = panelSource.slice(renderFunctionStart, renderFunctionEnd);

    expect(renderFunctionStart).toBeGreaterThan(-1);
    expect(renderFunctionEnd).toBeGreaterThan(renderFunctionStart);
    expect(renderFunctionSource).toContainSource('options.hideReasoningBody ?');
    expect(renderFunctionSource).toContainSource('<span>{thinkingLabel}</span>');
    expect(renderFunctionSource).toContainSource('{reasoning && (');
    expect(panelSource).toContainSource(
      'renderAiChatContent(outlinePreviewDraft, { hideReasoningBody: plotPointStandalone })',
    );
  });

  it('uses the requested default tab even when the shared storage remembered another setting tab', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource('defaultActiveTab');
    expect(panelSource).toContainSource("const tabsSignature = tabs.map(normalizeTabName).join('\\u001f');");
    expect(panelSource).toContainSource(
      "const normalizedTabs = useMemo(() => (tabsSignature ? tabsSignature.split('\\u001f') : []), [tabsSignature]);",
    );
    expect(panelSource).not.toContainSource(
      'const normalizedTabs = useMemo(() => tabs.map(normalizeTabName), [tabs]);',
    );
    expect(panelSource).toContainSource('readActiveTab(storageKey, normalizedTabs, defaultActiveTab)');
    expect(panelSource).toContainSource('这里显示选中的脑洞内容，也可以直接编辑。');
  });

  it('uses the selected danger recycle button style for the brainstorm recycle entry', async () => {
    const sidebarSource = await readWorkbenchLibrarySidebarSource();
    const recycleButtonAnchor = sidebarSource.indexOf('setIsBrainstormRecycleOpen(true)');
    const recycleButtonStart = sidebarSource.lastIndexOf('<button', recycleButtonAnchor);
    const recycleButtonEnd = sidebarSource.indexOf('</button>', recycleButtonAnchor);
    const recycleButtonSource = sidebarSource.slice(recycleButtonStart, recycleButtonEnd);

    expect(recycleButtonAnchor).toBeGreaterThan(-1);
    expect(recycleButtonStart).toBeGreaterThan(-1);
    expect(recycleButtonEnd).toBeGreaterThan(recycleButtonStart);
    expect(recycleButtonSource).toContainSource('border border-red-100 bg-red-50');
    expect(recycleButtonSource).toContainSource('hover:border-red-200 hover:bg-red-100');
    expect(recycleButtonSource).toContainSource('<Trash2 className="h-4 w-4" />');
    expect(recycleButtonSource).toContainSource('bg-white text-red-500');
    expect(recycleButtonSource).toContainSource('{brainstormRecycleCount}');
    expect(recycleButtonSource).not.toContainSource('打开');
    expect(recycleButtonSource).not.toContainSource('个已删除脑洞');
  });

  it('uses the chapter-style black text selected state for brainstorm entries', async () => {
    const sidebarSource = await readWorkbenchLibrarySidebarSource();
    const entryListStart = sidebarSource.indexOf('previewEntries.map((entry, previewIndex) => {');
    const entryListEnd = sidebarSource.indexOf('</button>', entryListStart);
    const entryListSource = sidebarSource.slice(entryListStart, entryListEnd);

    expect(entryListStart).toBeGreaterThan(-1);
    expect(entryListEnd).toBeGreaterThan(entryListStart);
    expect(entryListSource).toContainSource('currentSelectedEntryId === entry.id');
    expect(entryListSource).toContainSource("'border-transparent xy-selected-mint-bg text-gray-900'");
    expect(entryListSource).toContainSource(
      "activeIsBrainstorm\n                              ? 'border-transparent bg-white text-gray-700 hover:border-gray-200 hover:bg-gray-50'",
    );
    expect(entryListSource).toContainSource('className="min-w-0 truncate pl-3 text-sm font-black text-gray-700"');
    expect(entryListSource).toContainSource(
      'className="ml-auto shrink-0 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-black text-[#08AACE]"',
    );
    expect(entryListSource).not.toContainSource("activeIsBrainstorm ? 'text-xs font-black text-gray-400'");
    expect(entryListSource).not.toContainSource('text-orange-500');
  });

  it('removes the brainstorm recycle button scheme test page from the test collection', async () => {
    const testCollectionSource = await readTestCollectionSource();

    expect(testCollectionSource).not.toContainSource('BrainstormRecycleButtonTestPage');
    expect(testCollectionSource).not.toContainSource('/brainstorm-recycle-button-test');
    expect(testCollectionSource).not.toContainSource('脑洞回收站按钮方案');
  });

  it('removes the plot chain tree design scheme test page after applying scheme A', async () => {
    const testCollectionSource = await readTestCollectionSource();

    expect(testCollectionSource).not.toContainSource('剧情链目录分组方案');
    expect(testCollectionSource).not.toContainSource('/plot-chain-tree-design-test');
    expect(testCollectionSource).not.toContainSource('PlotChainTreeDesignTestPage');
    expect(testCollectionSource).not.toContainSource('PlotChainTreeDesignA');
    expect(testCollectionSource).not.toContainSource('方案 A：目录树层级');
    expect(testCollectionSource).not.toContainSource('方案 D：紧凑深浅对比');
  });

  it('removes the plot chain left detail scheme test page after applying scheme E to the workbench', async () => {
    const testCollectionSource = await readTestCollectionSource();
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(testCollectionSource).not.toContainSource('PlotChainLeftDetailTestPage');
    expect(testCollectionSource).not.toContainSource('/plot-chain-left-detail-test');
    expect(testCollectionSource).not.toContainSource('剧情链左二调试方案');
    expect(panelSource).toContainSource('aria-label="当前主链未写序号导航"');
    expect(panelSource).toContainSource('aria-label="当前主链菜单"');
    expect(panelSource).toContainSource(
      '<span className="min-w-0 flex-1 truncate text-sm font-bold text-white">备选链</span>',
    );
    expect(panelSource).toContainSource('{PLOT_POINT_CHAIN_SLOTS.length - 1}条');
    expect(panelSource).toContainSource('plotPointChainWrittenSelections');
    expect(panelSource).toContainSource('markPlotPointChainItemWritten(item.id)');
    expect(panelSource).toContainSource("['written', '只看已写']");
  });

  it('keeps detail outline reader plot chain plumbing out of the visible tabs', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource(
      "type DetailOutlineReaderTab = 'settings' | 'roles' | 'outlines' | 'plotChain';",
    );
    expect(panelSource).toContainSource('detailOutlineReaderPlotChainIds?: string[];');
    expect(panelSource).toContainSource(
      'const [draftDetailOutlineReaderPlotChainIds, setDraftDetailOutlineReaderPlotChainIds]',
    );
    expect(panelSource).toContainSource(
      'const detailOutlineReaderPlotChainItems = (plotPointChainSelections[plotPointActiveChainSlot] ?? [])',
    );
    expect(panelSource).not.toContainSource("['plotChain', '剧情链']");
    expect(panelSource).toContainSource("detailOutlineReaderTab === 'plotChain'");
    expect(panelSource).toContainSource('toggleDraftDetailOutlineReaderPlotChain(item.id)');
    expect(panelSource).toContainSource('detailOutlineReaderPlotChainIds: nextPlotChainIds');
    expect(panelSource).toContainSource("wrapAiRequestTag('关联资料', innerContext)");
    expect(panelSource).toContainSource("wrapAiRequestTag('设定资料', settingText)");
    expect(panelSource).toContainSource("wrapAiRequestTag('角色资料', roleText)");
    expect(panelSource).toContainSource("wrapAiRequestTag('剧情链', plotChainText)");
    expect(panelSource).toContainSource("const DETAIL_OUTLINE_STATE_MARKER = '【本章状态变化预期】';");
    expect(panelSource).toContainSource('splitDetailOutlineStateExpectation(outlineCardContent)');
    expect(panelSource).toContainSource('mergeDetailOutlineStateExpectation(');
    expect(panelSource).toContainSource(
      '请根据关联的设定、前文章纲和剧情链生成章纲。请在章纲末尾输出${DETAIL_OUTLINE_STATE_MARKER}',
    );
    expect(panelSource).toContainSource(
      '<span className="xy-floating-title-text xy-detail-outline-heading-title">状态变化</span>',
    );
  });

  it('uses compact detail outline chapter number blocks without word count badges', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const chapterNumberButtonSource = await readChapterNumberButtonSource();

    expect(panelSource).toContainSource("import { ChapterNumberButton } from '@/shared/ui/ChapterNumberButton';");
    expect(panelSource).toContainSource("const outlineWordCount = countTextWords(entry?.content ?? '');");
    expect(panelSource).toContainSource(
      "const chapterContentWordCount = countTextWords(getChapterContent?.(chapter.id) ?? '');",
    );
    expect(panelSource).toContainSource(
      "const outlineButtonState = chapterContentWordCount > 0 ? 'used' : hasSummary ? 'hasOutline' : 'empty';",
    );
    expect(panelSource).toContainSource('<ChapterNumberButton');
    expect(panelSource).toContainSource('state={outlineButtonState}');
    expect(chapterNumberButtonSource).toContainSource("if (state === 'used') return 'xy-detail-outline-number-used");
    expect(chapterNumberButtonSource).toContainSource(
      "if (state === 'hasOutline') return 'xy-detail-outline-number-has-outline",
    );
    expect(chapterNumberButtonSource).toContainSource("return 'xy-detail-outline-number-no-outline");
    expect(chapterNumberButtonSource).toContainSource("selected ? 'xy-detail-outline-number-selected' : ''");
    expect(chapterNumberButtonSource).toContainSource('xy-detail-outline-number-block');
    expect(chapterNumberButtonSource).toContainSource('xy-detail-outline-number-white-bg');
    expect(panelSource).not.toContainSource('const outlineButtonStateClass = selected');
    expect(panelSource).not.toContainSource(
      "const outlineWordLabel = outlineWordCount > 0 ? `${outlineWordCount}字` : '无章纲';",
    );
    expect(panelSource).toContainSource("gridTemplateColumns: 'repeat(auto-fit, minmax(32px, max-content))'");
    expect(chapterNumberButtonSource).toContainSource(
      'relative grid h-8 w-8 place-items-center rounded-lg border text-center text-sm font-black leading-none transition-colors xy-detail-outline-number-block',
    );
    expect(panelSource).not.toContainSource(
      'relative grid h-[50px] w-[50px] place-items-center rounded-[13px] border text-center text-2xl font-black leading-none transition-colors',
    );
    expect(panelSource).not.toContainSource(
      "'border-[#8CEBC0] bg-[#EAFBF3] text-slate-950 shadow-[0_0_0_1px_rgba(16,185,129,0.16)]'",
    );
    expect(panelSource).not.toContainSource(
      ": 'border-[#FED7AA] bg-[#FFF7ED] text-slate-950 shadow-[0_0_0_1px_rgba(249,115,22,0.12)]'",
    );
    expect(panelSource).not.toContainSource(
      "'border-slate-200 bg-white text-slate-900 hover:border-[#BBF7D0] hover:bg-[#F2FCF7]'",
    );
    expect(panelSource).not.toContainSource(
      ": 'border-slate-200 bg-white text-slate-400 hover:border-orange-200 hover:bg-orange-50/50'",
    );
    expect(panelSource).not.toContainSource('outlineBadgeClass');
    expect(panelSource).not.toContainSource("label: '有章纲'");
    const selectedStyle = styleSource.match(/\.xy-detail-outline-number-selected \{[\s\S]*?\n\}/)?.[0] ?? '';
    expect(selectedStyle).toContainSource('border-color: var(--xy-detail-outline-number-selected);');
    expect(selectedStyle).toContainSource('box-shadow:');
    expect(selectedStyle).not.toContainSource('background:');
    const whiteBgStyle = styleSource.match(/\.xy-detail-outline-number-white-bg \{[\s\S]*?\n\}/)?.[0] ?? '';
    expect(whiteBgStyle).toContainSource('background: #ffffff;');
    expect(styleSource.indexOf('.xy-detail-outline-number-white-bg')).toBeGreaterThan(
      styleSource.indexOf('.xy-detail-outline-number-used'),
    );
    expect(styleSource.indexOf('.xy-detail-outline-number-white-bg')).toBeGreaterThan(
      styleSource.indexOf('.xy-detail-outline-number-has-outline'),
    );
    expect(styleSource.indexOf('.xy-detail-outline-number-white-bg')).toBeGreaterThan(
      styleSource.indexOf('.xy-detail-outline-number-no-outline'),
    );
    expect(styleSource.indexOf('.xy-detail-outline-number-selected')).toBeGreaterThan(
      styleSource.indexOf('.xy-detail-outline-number-no-outline'),
    );
  });

  it('adds a detail outline published lane that follows published chapters and manual moves', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource(
      "const DETAIL_OUTLINE_PUBLISHED_GROUP_NAME = 'detail_outline_published_chapters';",
    );
    expect(panelSource).toContainSource(
      'const [showDetailOutlinePublished, setShowDetailOutlinePublished] = useState(false);',
    );
    expect(panelSource).toContainSource(
      'const [manualDetailOutlinePublishedChapterIds, setManualDetailOutlinePublishedChapterIds]',
    );
    expect(panelSource).toContainSource(
      'const isDetailOutlineChapterPublished = (chapter: Chapter) => Boolean(chapter.isPublished) || manualDetailOutlinePublishedChapterIds.has(chapter.id);',
    );
    expect(panelSource).toContainSource(
      'const detailOutlineUnpublishedVolumes = filterDetailOutlineVolumesByPublishState(false);',
    );
    expect(panelSource).toContainSource(
      'const detailOutlinePublishedVolumes = filterDetailOutlineVolumesByPublishState(true);',
    );
    expect(panelSource).toContainSource('const moveDetailOutlineChapterToPublished = (chapterId: number) => {');
    expect(panelSource).toContainSource('const moveDetailOutlineChapterToUnpublished = (chapter: Chapter) => {');
    expect(panelSource).toContainSource('if (chapter.isPublished) return;');
    expect(panelSource).toContainSource("showDetailOutlinePublished ? '收回已发布' : '展开已发布'");
    expect(panelSource).toContainSource('>已发布</span>');
    expect(panelSource).not.toContainSource('章纲已发布');
    expect(panelSource).toContainSource('暂无已发布章纲');
    expect(panelSource).toContainSource('移动到已发布');
    expect(panelSource).toContainSource('移回未发布');
  });

  it('keeps published detail outline volume groups synced even when no outline chapters are published', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource('renderDetailOutlineVolumeTree(detailOutlinePublishedVolumes, true)');
    expect(panelSource).toContainSource(
      'detailOutlinePublishedVolumes = filterDetailOutlineVolumesByPublishState(true);',
    );
    expect(panelSource).not.toContainSource('detailOutlinePublishedCount === 0 ? (');
    expect(panelSource).toContainSource('volumes.length === 0 ? (');
  });

  it('removes the detail outline selection scheme test page after applying it to the workbench', async () => {
    const testCollectionSource = await readTestCollectionSource();

    expect(testCollectionSource).not.toContainSource('WorkbenchDetailOutlineSelectionStyleTestPage');
    expect(testCollectionSource).not.toContainSource('/workbench-detail-outline-selection-style-test');
    expect(testCollectionSource).not.toContainSource('Outline State');
    expect(testCollectionSource).not.toContainSource('章纲选中态方案测试');
  });

  it('removes the completed border transparent backplate placement test page', async () => {
    const testCollectionSource = await readTestCollectionSource();

    expect(testCollectionSource).not.toContainSource('BorderBackplateApplicationTestPage');
    expect(testCollectionSource).not.toContainSource('/border-backplate-application-test');
    expect(testCollectionSource).not.toContainSource('边框透明背板应用预览');
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

    expect(panelSource).toContainSource(
      "type ClearSettingsTarget = 'settingCategories' | 'settingEntries' | 'roleCategories' | 'roleEntries';",
    );
    expect(panelSource).toContainSource(
      'const [clearSettingsConfirmStep, setClearSettingsConfirmStep] = useState<1 | 2>(1);',
    );
    expect(panelSource).toContainSource('const openClearSettingsConfirm = (target: ClearSettingsTarget) => {');
    expect(panelSource).toContainSource('const openClearSettingsConfirmFromMenu = (target: ClearSettingsTarget) => {');
    expect(panelSource).toContainSource('const createEntryFromCategoryMenu = () => {');
    expect(panelSource).toContainSource('const createEntryFromEntryMenu = () => {');
    expect(panelSource).toContainSource('const openSiblingCategoryCreateFromMenu = () => {');
    expect(panelSource).toContainSource('const openCategoryRenameFromMenu = () => {');
    expect(panelSource).toContainSource('const confirmCategoryRename = () => {');
    expect(panelSource).toContainSource('const copyEntryFromMenu = () => {');
    expect(panelSource).toContainSource('const moveEntryFromMenuToType = (targetType: string) => {');
    expect(panelSource).toContainSource('if (clearSettingsConfirmStep === 1) {');
    expect(panelSource).toContainSource('setClearSettingsConfirmStep(2);');
    expect(panelSource).toContainSource('clearSettingsTargetMeta[clearSettingsConfirmTarget]');
    expect(panelSource).toContainSource('clearSettingCategories();');
    expect(panelSource).toContainSource('clearSettingEntries();');
    expect(panelSource).toContainSource('aria-disabled="true"');
    expect(panelSource).toContainSource("mode === 'category' ? '新建分组'");
    expect(panelSource).toContainSource("mode === 'category' ? '输入分组名字'");
    expect(panelSource).toContainSource(
      'clearEntryLabel={clearSettingsTargetMeta[categoryMenuClearEntryTarget].label}',
    );
    expect(panelSource).toContainSource(
      'clearCategoryLabel={clearSettingsTargetMeta[categoryMenuClearCategoryTarget].label}',
    );
    expect(panelSource).toContainSource('清空{clearEntryLabel}');
    expect(panelSource).toContainSource('清空{clearCategoryLabel}');
    expect(panelSource).toContainSource("新建{menu.kind === 'role' ? '角色' : '设定'}");
    expect(panelSource).toContainSource("entryKindLabel={entryMenu?.tab === ROLE_TAB ? '角色' : '设定'}");
    expect(panelSource).toContainSource('新建{entryKindLabel}');
    expect(panelSource).toContainSource('新建分组');
    expect(panelSource).not.toContainSource('新建同级分组');
    expect(panelSource).toContainSource('重命名分组');
    expect(panelSource).toContainSource('复制');
    expect(panelSource).toContainSource('移动到分组');
    expect(panelSource).toContainSource('moveOptions={entryMenuMoveOptions}');
    expect(panelSource).toContainSource('{moveOptions.map((type) => (');
    expect(panelSource).toContainSource('setSettingCreateContextKind(categoryMenu.kind);');
    expect(panelSource).toContainSource("label: '设定分组'");
    expect(panelSource).toContainSource("settingEntries: {\n      label: '设定'");
    expect(panelSource).toContainSource("roleEntries: {\n      label: '角色'");
    expect(panelSource).toContainSource("roleCategories: {\n      label: '角色分组'");
    expect(panelSource).toContainSource('确定要清空全部自建人物分组吗？');
    expect(panelSource).toContainSource(
      '女主角、重要正派角色、正派配角、重要反派角色、反派配角、龙套角色等默认分组会保留。',
    );
    expect(panelSource).not.toContainSource('SETTING_CLEAR_DOMAIN_LABELS');
    expect(panelSource).not.toContainSource("'setting:faction': '势力'");
    expect(panelSource).not.toContainSource("'setting:item': '道具资源'");
    expect(panelSource).toContainSource('确定要清空全部自建设定分组吗？默认分组和默认设定条目会保留。');
    expect(panelSource).toContainSource(
      '确定要清空全部自建设定吗？当前共有 ${deletableSettingEntriesForClear.length} 条可删除设定会被删除，默认设定条目会保留。',
    );
    expect(panelSource).toContainSource('确定要清空全部角色吗？');
    expect(panelSource).toContainSource('确认清空${currentClearSettingsMeta.label}');
    expect(panelSource).toContainSource(
      'onClearEntries={() => openClearSettingsConfirmFromMenu(categoryMenuClearEntryTarget)}',
    );
    expect(panelSource).toContainSource(
      'onClearCategories={() => openClearSettingsConfirmFromMenu(categoryMenuClearCategoryTarget)}',
    );
    expect(panelSource).toContainSource('onClick={onClearEntries}');
    expect(panelSource).toContainSource('onClick={onClearCategories}');
    expect(panelSource).toContainSource('w-max min-w-[136px] max-w-[220px]');
    expect(panelSource).toContainSource(
      'w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-red-500',
    );
    expect(panelSource).not.toContainSource(
      'className="fixed z-[10000] min-w-[168px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"',
    );
    expect(panelSource).toContainSource('mt-3 shrink-0 space-y-2');
    expect(panelSource).toContainSource(
      'grid h-11 grid-cols-3 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)]',
    );
    expect(panelSource).not.toContainSource('aria-label="清空分组"');
    expect(panelSource).not.toContainSource('border-r border-red-100 bg-red-50 px-2 text-sm font-black text-red-500');
    expect(panelSource).not.toContainSource('isActiveClearSettingsUnlocked');
    expect(panelSource).not.toContainSource('setClearSettingsUnlockMenu({');
    expect(panelSource).not.toContainSource('clearSettingsUnlockContextMenu');
    expect(panelSource).not.toContainSource('h-9 w-full rounded-xl border border-red-200');
  });

  it('keeps fixed right-click menus inside the viewport before opening', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const openCategoryMenuSource = panelSource.slice(
      panelSource.indexOf('const openCategoryMenu = (event: MouseEvent<HTMLButtonElement>'),
      panelSource.indexOf(
        'const openEntryMenu = (event: MouseEvent<HTMLElement>',
        panelSource.indexOf('const openCategoryMenu = (event: MouseEvent<HTMLButtonElement>'),
      ),
    );
    const openEntryMenuSource = panelSource.slice(
      panelSource.indexOf('const openEntryMenu = (event: MouseEvent<HTMLElement>'),
      panelSource.indexOf(
        'const deleteRoleType = (type: string) => {',
        panelSource.indexOf('const openEntryMenu = (event: MouseEvent<HTMLElement>'),
      ),
    );

    expect(panelSource).toContainSource('const CONTEXT_MENU_VIEWPORT_PADDING = 8;');
    expect(panelSource).toContainSource('const SETTING_CATEGORY_CONTEXT_MENU_SIZE = { width: 220, height: 300 };');
    expect(panelSource).toContainSource('const SETTING_ENTRY_CONTEXT_MENU_SIZE = { width: 180, height: 280 };');
    expect(panelSource).toContainSource('const PROMPT_DISABLE_CONTEXT_MENU_SIZE = { width: 140, height: 72 };');
    expect(openCategoryMenuSource).toContainSource(
      'const { left, top } = clampFixedMenuPosition(event.clientX, event.clientY, SETTING_CATEGORY_CONTEXT_MENU_SIZE);',
    );
    expect(openCategoryMenuSource).toContainSource('setCategoryMenu({ kind, type, x: left, y: top });');
    expect(openEntryMenuSource).toContainSource(
      'const { left, top } = clampFixedMenuPosition(event.clientX, event.clientY, SETTING_ENTRY_CONTEXT_MENU_SIZE);',
    );
    expect(openEntryMenuSource).toContainSource('x: left,');
    expect(openEntryMenuSource).toContainSource('y: top,');
    expect(openCategoryMenuSource).not.toContainSource('x: event.clientX');
    expect(openEntryMenuSource).not.toContainSource('x: event.clientX');
    expect(panelSource).toContainSource(
      'clampFixedMenuPosition(event.clientX, event.clientY, PROMPT_DISABLE_CONTEXT_MENU_SIZE)',
    );
  });

  it('removes entries when their setting or character group is removed', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const clearSettingCategoriesStart = panelSource.indexOf('const clearSettingCategories = () => {');
    const clearSettingCategoriesEnd = panelSource.indexOf(
      'const clearSettingEntries = () => {',
      clearSettingCategoriesStart,
    );
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

    expect(clearSettingCategoriesSource).toContainSource('const domain = getSelectedSettingWorkspaceDomain();');
    expect(clearSettingCategoriesSource).toContainSource('if (entry.tab !== SETTING_TAB) return true;');
    expect(clearSettingCategoriesSource).toContainSource('if (isLockedDefaultSettingEntry(entry)) return true;');
    expect(clearSettingCategoriesSource).toContainSource(
      'return !isSettingTypeInActiveClearDomain(parseSettingContent(entry.content).type);',
    );
    expect(clearSettingCategoriesSource).toContainSource(
      'const nextCustomTypes = customSettingTypes.filter((type) => !shouldClearType(type));',
    );
    expect(clearSettingEntriesSource).toContainSource(
      'return !isSettingTypeInActiveClearDomain(parseSettingContent(entry.content).type);',
    );
    expect(clearSettingCategoriesSource).not.toContainSource(
      'content: stringifySettingContent({ ...setting, type: UNCATEGORIZED_TYPE })',
    );
    expect(clearRoleCategoriesSource).toContainSource('setHiddenRoleTypes([]);');
    expect(clearRoleCategoriesSource).toContainSource(
      'return isDefaultWorkbenchRoleType(parseRoleContent(entry.content).type);',
    );
    expect(clearRoleCategoriesSource).toContainSource(
      'setExpandedRoleTypes(new Set(DEFAULT_ROLE_TYPES.filter((type) => type !== UNCATEGORIZED_TYPE)));',
    );
    expect(clearRoleCategoriesSource).not.toContainSource(
      'content: stringifyRoleContent({ ...role, type: UNCATEGORIZED_TYPE })',
    );
    expect(deleteSettingTypeSource).toContainSource('persist(entries.filter((entry) => {');
    expect(deleteSettingTypeSource).toContainSource('return setting.type !== type;');
    expect(deleteSettingTypeSource).toContainSource('if (DEFAULT_SETTING_TYPES.includes(type)) return;');
    expect(deleteSettingTypeSource).not.toContainSource(
      'content: stringifySettingContent({ ...setting, type: UNCATEGORIZED_TYPE })',
    );
    expect(deleteRoleTypeSource).toContainSource('persist(entries.filter((entry) => {');
    expect(deleteRoleTypeSource).toContainSource('return role.type !== type;');
    expect(deleteRoleTypeSource).toContainSource(
      'if (type === UNCATEGORIZED_TYPE || isDefaultWorkbenchRoleType(type)) return;',
    );
    expect(deleteRoleTypeSource).not.toContainSource('isMaleProtagonistRoleType(type)) return;');
    expect(deleteRoleTypeSource).not.toContainSource(
      'content: stringifyRoleContent({ ...role, type: DEFAULT_ROLE_TYPES[0] ?? UNCATEGORIZED_TYPE })',
    );
  });

  it('does not confirm the setting create dialog while Chinese IME composition is active', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const modalStart = panelSource.indexOf('export function SettingCreateDialog(');
    const modalEnd = panelSource.indexOf('type CategoryRenameDialogProps', modalStart);
    const modalSource = panelSource.slice(modalStart, modalEnd);
    const confirmStart = panelSource.indexOf('const confirmSettingCreate = () => {');
    const confirmEnd = panelSource.indexOf('const openSettingCreateDialog', confirmStart);
    const confirmSource = panelSource.slice(confirmStart, confirmEnd);

    expect(modalStart).toBeGreaterThan(-1);
    expect(panelSource).toContainSource("const [settingCreateDraft, setSettingCreateDraft] = useState('');");
    expect(panelSource).toContainSource("const [settingCreateTypeDraft, setSettingCreateTypeDraft] = useState('');");
    expect(confirmSource).toContainSource('const createTitle = settingCreateDraft.trim();');
    expect(confirmSource).toContainSource('const selectedCreateType = getValidSettingCreateType();');
    expect(confirmSource).not.toContainSource('addSettingTypeByName(settingTitleDraft);');
    expect(confirmSource).not.toContainSource('addRoleTypeByName(settingTitleDraft);');
    expect(modalSource).toContainSource("event.key === 'Enter'");
    expect(modalSource).toContainSource('event.nativeEvent.isComposing');
    expect(modalSource).toContainSource('event.keyCode === 229');
    expect(modalSource).toContainSource('!isImeComposing');
    expect(modalSource).toContainSource('value={draft}');
    expect(modalSource).toContainSource('onChange={(event) => onDraftChange(event.target.value)}');
    expect(modalSource).toContainSource('所属分组');
    expect(modalSource).toContainSource('value={typeValue}');
    expect(modalSource).toContainSource('onChange={(event) => onTypeChange(event.target.value)}');
    expect(modalSource).toContainSource('onConfirm();');
    expect(panelSource).toContainSource('onConfirm={confirmSettingCreate}');
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

    fireEvent.click(screen.getByRole('button', { name: '势力设定0' }));
    fireEvent.click(screen.getByRole('button', { name: '分组' }));
    fireEvent.change(screen.getByPlaceholderText('输入分组名字'), { target: { value: '宗门势力' } });
    fireEvent.click(screen.getByRole('button', { name: '确认' }));

    expect(screen.getByRole('button', { name: /宗门势力/ })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(`${storageKey}_setting_types`) ?? '[]')).toContainSource('宗门势力');
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
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定2');
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
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定4');
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
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定3');
    const getVisibleCoreTitles = () =>
      screen
        .getAllByRole('button')
        .map((button) =>
          ['自定义核心一', '自定义核心二', '自定义核心三'].find((title) => button.textContent?.includes(title)),
        )
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
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定3');
    const getVisibleCoreTitles = () =>
      screen
        .getAllByRole('button')
        .map((button) =>
          ['自定义核心一', '自定义核心二', '自定义核心三'].find((title) => button.textContent?.includes(title)),
        )
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
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定3');
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

    expect(source).toContainSource('const libraryEntryDropPreviewRef = useRef<LibraryEntryDropPreviewState>(null);');
    expect(source).toContainSource('const setLibraryEntryDropPreviewState = (next: LibraryEntryDropPreviewState)');
    expect(source).toContainSource('libraryEntryDropPreviewRef.current = next;');
    expect(source).toContainSource('commitLibraryEntryDropPreview(libraryEntryDropPreviewRef.current);');
    expect(source).toContainSource('type LibraryEntryPointerDragState');
    expect(source).toContainSource('beginLibraryEntryPointerDrag');
    expect(source).toContainSource('updateLibraryEntryPointerPreview');
    expect(source).toContainSource('finishLibraryEntryPointerDrag');
    expect(source).toContainSource('data-library-entry-id={entry.id}');
  });

  it('uses pointer sorting instead of native draggable attributes on setting entries', () => {
    const storageKey = 'workbench-setting-entry-pointer-sort-only-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定2');

    expect(screen.getByText('自定义核心一').closest('button')).not.toHaveAttribute('draggable');
    expect(screen.getByText('自定义核心二').closest('button')).not.toHaveAttribute('draggable');
  });

  it('persists setting order after a real pointer move and pointer up', () => {
    vi.useFakeTimers();
    const storageKey = 'workbench-setting-entry-pointer-sort-commit-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定3');
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
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定2');
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
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定2');
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
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定3');
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
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定3');
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
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定3');
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
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定3');
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
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定3');
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
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    const groupButton = ensureLibraryGroupExpanded('核心设定3');
    const groupRoot = groupButton.closest('[data-library-group-type]');
    const source = screen.getByText('自定义核心一').closest('button');
    const secondRow = screen.getByText('自定义核心二').closest('button');
    const thirdRow = screen.getByText('自定义核心三').closest('button');
    expect(groupRoot).toBeTruthy();
    expect(source).toBeTruthy();
    expect(secondRow).toBeTruthy();
    expect(thirdRow).toBeTruthy();

    const makeRect = (top: number, bottom: number) =>
      ({
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
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    const groupHeader = ensureLibraryGroupExpanded('核心设定3');
    const getVisibleCoreTitles = () =>
      screen
        .getAllByRole('button')
        .map((button) =>
          ['自定义核心一', '自定义核心二', '自定义核心三'].find((title) => button.textContent?.includes(title)),
        )
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
    const sidebarSource = await readWorkbenchLibrarySidebarSource();
    const entryListStart = sidebarSource.indexOf('previewEntries.map((entry, previewIndex) => {');
    const entryListEnd = sidebarSource.indexOf('</button>', entryListStart);
    const entryListSource = sidebarSource.slice(entryListStart, entryListEnd);

    expect(entryListStart).toBeGreaterThan(-1);
    expect(entryListEnd).toBeGreaterThan(entryListStart);
    expect(entryListSource).not.toContainSource('GripVertical');
  });

  it('keeps the normal arrow cursor on setting entry rows', async () => {
    const sidebarSource = await readWorkbenchLibrarySidebarSource();
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();
    const entryListStart = sidebarSource.indexOf('previewEntries.map((entry, previewIndex) => {');
    const entryListEnd = sidebarSource.indexOf('</button>', entryListStart);
    const entryListSource = sidebarSource.slice(entryListStart, entryListEnd);

    expect(entryListStart).toBeGreaterThan(-1);
    expect(entryListEnd).toBeGreaterThan(entryListStart);
    expect(constantsSource).toContainSource('cursor-default select-none');
    expect(entryListSource).not.toContainSource('cursor-grab select-none');
    expect(entryListSource).not.toContainSource('active:cursor-grabbing');
  });

  it('shows the grabbing cursor only after a setting entry enters drag mode', async () => {
    const sidebarSource = await readWorkbenchLibrarySidebarSource();
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();
    const entryListStart = sidebarSource.indexOf('previewEntries.map((entry, previewIndex) => {');
    const entryListEnd = sidebarSource.indexOf('</button>', entryListStart);
    const entryListSource = sidebarSource.slice(entryListStart, entryListEnd);

    expect(entryListStart).toBeGreaterThan(-1);
    expect(entryListEnd).toBeGreaterThan(entryListStart);
    expect(constantsSource).toContainSource('cursor-default select-none');
    expect(entryListSource).toContainSource("draggingLibraryEntry?.entryId === entry.id ? 'cursor-grabbing");
    expect(entryListSource).not.toContainSource('cursor-grab select-none');
    expect(entryListSource).not.toContainSource('active:cursor-grabbing');
  });

  it('moves a setting entry to the end of its group when dropping on the group area', async () => {
    const storageKey = 'workbench-drag-setting-entry-to-group-end-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定3');
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
    localStorage.setItem(
      `${storageKey}_hidden_role_types`,
      JSON.stringify(['男主角', '女主角', '重要正派角色', '正派配角', '重要反派角色', '反派配角', '龙套角色']),
    );
    localStorage.setItem(`${storageKey}_hidden_setting_types`, JSON.stringify(['核心设定', '剧情规划', '世界地图']));

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
    expect(screen.getByRole('button', { name: '世界地图2' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '资源体系1' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '书写规则2' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '人物设定1' }));
    expect(screen.getByRole('button', { name: '男主角1' })).toBeInTheDocument();
    ['女主角', '重要正派角色', '正派配角', '重要反派角色', '反派配角', '龙套角色'].forEach((group) => {
      expect(screen.getByRole('button', { name: `${group}0` })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: '未分类0' })).not.toBeInTheDocument();

    const groupsByTab = [
      { tab: '势力设定0', groups: ['正派势力', '反派势力', '中立势力', '其他势力'], count: 0 },
      { tab: '道具资源0', groups: ['功法能力', '物品装备', '特殊资源'], count: 0 },
      { tab: '怪物图鉴0', groups: ['怪物列表'], count: 0 },
      { tab: '伏笔线索2', groups: ['主线伏笔', '人物伏笔'], count: 1 },
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
    expect(panelSource).toContainSource(
      'function isMaleProtagonistRoleTypeChangeLocked(currentType: string, nextType: string) {',
    );
    expect(panelSource).toContainSource(
      'return isMaleProtagonistRoleType(currentType) && !isMaleProtagonistRoleType(nextType);',
    );
    expect(panelSource).toContainSource(
      'if (normalizedUpdates.type && isMaleProtagonistRoleTypeChangeLocked(selectedRole.type, normalizedUpdates.type)) return;',
    );
    expect(panelSource).toContainSource(
      'if (normalizedUpdates.type && isMaleProtagonistRoleTypeChangeLocked(currentSelectedRole.type, normalizedUpdates.type)) return;',
    );
    expect(panelSource).toContainSource('if (isMaleProtagonistRoleTypeChangeLocked(role.type, targetType)) return;');
    expect(panelSource).toContainSource(
      "if (entryMenu.tab === ROLE_TAB && isMaleProtagonistRoleType(entryMenu.roleType ?? '')) return;",
    );
    expect(panelSource).toContainSource(
      "const entryMenuIsMaleProtagonist = Boolean(entryMenu?.tab === ROLE_TAB && isMaleProtagonistRoleType(entryMenu.roleType ?? ''));",
    );
    expect(panelSource).toContainSource('deleteDisabled={entryMenuDeleteDisabled}');
    expect(panelSource).toContainSource('disabled={deleteDisabled}');
    expect(panelSource).toContainSource(
      'disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent',
    );
    expect(panelSource).toContainSource('const showRoleIdentityControls = !roleIsMaleProtagonist;');
    expect(panelSource).toContainSource('{showRoleIdentityControls ? (');
    expect(panelSource).toContainSource('<div aria-hidden="true" className="h-[42px] min-w-[168px] shrink-0" />');
    expect(panelSource).toContainSource('<div aria-hidden="true" className="h-9 w-[112px] shrink-0" />');
    expect(panelSource).toContainSource('buttonClassName="h-[42px] px-3 text-sm"');
    expect(panelSource).not.toContainSource('buttonClassName="h-10 rounded-xl border-2 border-cyan-200 px-3 text-sm"');
  });

  it('seeds the approved default setting entries with empty bodies by the current setting workspace groups', async () => {
    const storageKey = 'workbench-default-core-setting-starter-test';
    const expectedEntriesByType = new Map([
      ['核心设定', ['基础设定', '世界观', '主角金手指/优势']],
      ['剧情规划', ['剧情蓝图', '爽点设计', '分卷剧情']],
      ['资源货币', ['资源货币']],
      ['世界地图', ['世界架构', '危险区域']],
      ['正派势力', []],
      ['反派势力', []],
      ['中立势力', []],
      ['其他势力', []],
      ['功法能力', []],
      ['物品装备', []],
      ['特殊资源', []],
      ['怪物列表', []],
      ['主线伏笔', ['1号主线伏笔']],
      ['人物伏笔', ['1号人物伏笔']],
    ]);
    const expectedEntryCount = Array.from(expectedEntriesByType.values()).reduce(
      (total, titles) => total + titles.length,
      0,
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    expect(screen.getByRole('button', { name: '作品设定9' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '势力设定0' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '核心设定3' })).toBeInTheDocument();
    ensureLibraryGroupExpanded('核心设定3');
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
    const resourceCurrencyEntry = storedSettingEntries.find((entry: { title: string }) => entry.title === '资源货币');
    expect(resourceCurrencyEntry).toBeTruthy();
    expect(JSON.parse(resourceCurrencyEntry.content)).toMatchObject({
      type: '资源货币',
      lockedDefaultEntryId: '资源货币::资源货币',
    });
    expect(storedSettingEntries.some((entry: { title: string }) => entry.title === '写作规范')).toBe(false);
    expect(storedSettingEntries.some((entry: { title: string }) => entry.title === '写作禁忌')).toBe(false);
    storedSettingEntries.forEach((entry: { title: string; content: string }) => {
      expect(entry.title).not.toContainSource('：');
      expect(JSON.parse(entry.content).body).not.toContainSource('填写说明');
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

    ensureLibraryGroupExpanded('剧情规划3');
    fireEvent.click(screen.getByText('剧情蓝图').closest('button') as HTMLElement);

    const defaultTitleInput = screen.getByDisplayValue('剧情蓝图');
    expect(defaultTitleInput).toBeDisabled();
    expect(screen.queryByRole('button', { name: '删除' })).not.toBeInTheDocument();

    fireEvent.contextMenu(screen.getByText('剧情蓝图').closest('button') as HTMLElement);
    expect(screen.getByRole('button', { name: '重命名' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '删除' })).toBeDisabled();

    fireEvent.contextMenu(screen.getByRole('button', { name: '剧情规划3' }));
    expect(screen.queryByText('删除分类')).not.toBeInTheDocument();
  });

  it('keeps custom setting entries editable and deletable from the context menu without a footer delete button', async () => {
    const storageKey = 'workbench-custom-setting-entry-stays-editable-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'custom-setting',
          tab: '大纲',
          title: '自定义剧情设定',
          content: JSON.stringify({ type: '剧情规划', body: '' }),
          updatedAt: '2026/6/19 01:00:00',
        },
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('剧情规划1');
    fireEvent.click(screen.getByText('自定义剧情设定').closest('button') as HTMLElement);

    expect(screen.getByDisplayValue('自定义剧情设定')).not.toBeDisabled();
    expect(screen.queryByRole('button', { name: '删除' })).not.toBeInTheDocument();

    fireEvent.contextMenu(screen.getByText('自定义剧情设定').closest('button') as HTMLElement);
    expect(screen.getByRole('button', { name: '重命名' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: '删除' })).not.toBeDisabled();
  });

  it('freezes the current setting workspace catalog as the new-novel default', async () => {
    const storageKey = 'workbench-current-setting-default-catalog-test';
    const expectedCatalog = {
      作品设定: {
        核心设定: ['基础设定', '世界观', '主角金手指/优势'],
        剧情规划: ['剧情蓝图', '爽点设计', '分卷剧情'],
        世界地图: ['世界架构', '危险区域'],
        资源货币: ['资源货币'],
      },
      势力设定: {
        正派势力: [],
        反派势力: [],
        中立势力: [],
        其他势力: [],
      },
      道具资源: {
        功法能力: [],
        物品装备: [],
        特殊资源: [],
      },
      怪物图鉴: {
        怪物列表: [],
      },
      伏笔线索: {
        主线伏笔: ['1号主线伏笔'],
        人物伏笔: ['1号人物伏笔'],
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

    expect(screen.getByRole('button', { name: '作品设定9' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '人物设定1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '势力设定0' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '道具资源0' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '怪物图鉴0' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '伏笔线索2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '资源货币1' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '资源体系1' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '书写规则2' })).not.toBeInTheDocument();

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

  it('uses two chapter fields in production foreshadow settings instead of a status toggle', async () => {
    const storageKey = 'workbench-production-foreshadow-fields-test';
    const panelSource = await readWorkbenchLibraryPanelSource();

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '伏笔线索2' }));
    expect(screen.getByRole('button', { name: '主线伏笔1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '人物伏笔1' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '已回收伏笔1' })).not.toBeInTheDocument();

    ensureLibraryGroupExpanded('主线伏笔1');
    fireEvent.click(screen.getByText('1号主线伏笔').closest('button') as HTMLElement);

    expect(screen.getByDisplayValue('1号主线伏笔')).toBeInTheDocument();
    expect(screen.getByLabelText('首次出现章节')).toBeInTheDocument();
    expect(screen.getByLabelText('回收章节')).toBeInTheDocument();
    expect(screen.getByLabelText('关联对象')).toBeInTheDocument();
    expect(screen.getByLabelText('铺垫方式')).toBeInTheDocument();
    expect(screen.getByLabelText('伏笔内容')).toBeInTheDocument();
    expect(screen.queryByText('伏笔状态')).not.toBeInTheDocument();

    const foreshadowCodeInput = screen.getByLabelText('伏笔编号');
    const firstSeenChapterInput = screen.getByLabelText('首次出现章节');
    const recoveredChapterInput = screen.getByLabelText('回收章节');
    expect(foreshadowCodeInput.tagName).toBe('INPUT');
    expect(firstSeenChapterInput.tagName).toBe('INPUT');
    expect(recoveredChapterInput.tagName).toBe('INPUT');
    expect(foreshadowCodeInput).toHaveAttribute('maxlength', '10');
    expect(firstSeenChapterInput).toHaveAttribute('maxlength', '7');
    expect(recoveredChapterInput).toHaveAttribute('maxlength', '7');

    const titleRow = screen.getByTestId('structured-title-row');
    expect(within(titleRow).getByLabelText('伏笔名称')).toBeInTheDocument();
    expect(within(titleRow).getByLabelText('伏笔编号')).toBeInTheDocument();
    expect(within(titleRow).getByLabelText('首次出现章节')).toBeInTheDocument();
    expect(within(titleRow).getByLabelText('回收章节')).toBeInTheDocument();
    const structuredFields = screen.getByTestId('structured-setting-fields');
    expect(within(structuredFields).queryByLabelText('伏笔编号')).not.toBeInTheDocument();
    expect(within(structuredFields).queryByLabelText('首次出现章节')).not.toBeInTheDocument();
    expect(within(structuredFields).queryByLabelText('回收章节')).not.toBeInTheDocument();

    const structuredSettingsSource = await readWorkbenchStructuredSettingsSource();

    expect(structuredSettingsSource).toContainSource("id: 'foreshadow-main'");
    expect(structuredSettingsSource).toContainSource("id: 'foreshadow-character'");
    expect(panelSource).toContainSource('<header className="shrink-0 pb-3">');
    expect(panelSource).toContainSource('grid grid-cols-[4fr_2fr_2fr_2fr] gap-4 overflow-visible pb-1 pt-3');
    expect(panelSource).toContainSource('usesForeshadowHeaderLayout');
    expect(panelSource).toContainSource(
      'left-5 top-0 z-10 -translate-y-1/2 text-base font-medium leading-5 text-slate-950',
    );
    expect(structuredSettingsSource).toContainSource("fieldClassName: 'xy-structured-header-field h-[48px] min-w-0'");
    expect(panelSource).not.toContainSource('headerWidth');
    const styleSource = await readSharedStylesSource();
    expect(styleSource).toContainSource(
      '.xy-floating-field.xy-structured-header-field.xy-floating-outline-fixed input',
    );
    expect(styleSource).toContainSource('height: 48px;');
    expect(styleSource).toContainSource('.xy-floating-field.xy-structured-header-field input::placeholder');
    expect(styleSource).toContainSource('font-size: 0.8125rem;');
    expect(structuredSettingsSource).toContainSource("gridContentClassName: 'grid-rows-[150px_minmax(0,1fr)]'");
    expect(structuredSettingsSource).toContainSource("fieldClassName: 'col-span-2 min-h-0'");
    expect(structuredSettingsSource).toContainSource("title: '首次出现章节'");
    expect(structuredSettingsSource).toContainSource("title: '回收章节'");
    expect(panelSource).not.toContainSource("'setting:foreshadow': ['主线伏笔', '人物伏笔', '已回收伏笔']");
  });

  it('retires the foreshadow status test pages from the test collection after moving the layout into production', async () => {
    const testCollectionSource = await readTestCollectionSource();

    expect(testCollectionSource).not.toContainSource('ForeshadowStatusToggleLayoutTestPage');
    expect(testCollectionSource).not.toContainSource('ForeshadowStatusFrameOptionsTestPage');
    expect(testCollectionSource).not.toContainSource('/foreshadow-status-toggle-layout-test');
    expect(testCollectionSource).not.toContainSource('/foreshadow-status-frame-options-test');
  });

  it('splits basic setting preview into story type, core concept, and one sentence summary fields', async () => {
    const storageKey = 'workbench-basic-setting-structured-preview-test';
    const structuredSettingsSource = await readWorkbenchStructuredSettingsSource();
    const basicSetStart = structuredSettingsSource.indexOf("id: 'work-core-basic'");
    const basicSetEnd = structuredSettingsSource.indexOf("id: 'work-core-world-view'", basicSetStart);
    const basicSetSource = structuredSettingsSource.slice(basicSetStart, basicSetEnd);

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定3');

    expect(screen.getByDisplayValue('基础设定')).toBeInTheDocument();
    expect(basicSetSource).toContainSource("gridColumnsClassName: 'grid-cols-2'");
    expect(basicSetSource).not.toContainSource("gridColumnsClassName: 'grid-cols-3'");
    expect(screen.getByLabelText('故事类型')).toBeInTheDocument();
    expect(screen.getByLabelText('核心创意')).toBeInTheDocument();
    expect(screen.getByLabelText('一句话概括')).toBeInTheDocument();
    expect(screen.queryByText('设定预览')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('故事类型'), { target: { value: '玄幻升级流' } });
    fireEvent.change(screen.getByLabelText('核心创意'), { target: { value: '主角靠吞噬旧神残骸修炼。' } });
    fireEvent.change(screen.getByLabelText('一句话概括'), {
      target: { value: '被逐出宗门的少年一路吞噬神明遗骨，推翻天道秩序。' },
    });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const basicSettingEntry = storedEntries.find((entry: { title: string }) => entry.title === '基础设定');
    const body = JSON.parse(basicSettingEntry.content).body;
    expect(body).toContainSource('【故事类型】：\n玄幻升级流');
    expect(body).toContainSource('【核心创意】：\n主角靠吞噬旧神残骸修炼。');
    expect(body).toContainSource('【一句话概括】：\n被逐出宗门的少年一路吞噬神明遗骨，推翻天道秩序。');
  });

  it('splits world view preview into era background, world pattern, and social order fields', async () => {
    const storageKey = 'workbench-world-view-structured-preview-test';
    const structuredSettingsSource = await readWorkbenchStructuredSettingsSource();
    const worldViewSetStart = structuredSettingsSource.indexOf("id: 'work-core-world-view'");
    const worldViewSetEnd = structuredSettingsSource.indexOf("id: 'work-core-cheat-advantage'", worldViewSetStart);
    const worldViewSetSource = structuredSettingsSource.slice(worldViewSetStart, worldViewSetEnd);
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'world-view',
          tab: '大纲',
          title: '世界观',
          content: JSON.stringify({ type: '核心设定', body: '' }),
          updatedAt: '2026/6/18 12:00:00',
        },
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定1');

    expect(screen.getByDisplayValue('世界观')).toBeInTheDocument();
    expect(worldViewSetSource).toContainSource("gridColumnsClassName: 'grid-cols-2'");
    expect(worldViewSetSource).not.toContainSource("gridColumnsClassName: 'grid-cols-3'");
    expect(screen.getByLabelText('时代背景')).toBeInTheDocument();
    expect(screen.getByLabelText('世界格局')).toBeInTheDocument();
    expect(screen.getByLabelText('社会秩序')).toBeInTheDocument();
    expect(screen.queryByText('设定预览')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('时代背景'), { target: { value: '诸国割据后的灵气复苏时代。' } });
    fireEvent.change(screen.getByLabelText('世界格局'), { target: { value: '宗门、王朝与商会三方争夺新矿脉。' } });
    fireEvent.change(screen.getByLabelText('社会秩序'), {
      target: { value: '凡人依附城邦，修士受宗门律令和资源契约约束。' },
    });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const worldViewEntry = storedEntries.find((entry: { title: string }) => entry.title === '世界观');
    const body = JSON.parse(worldViewEntry.content).body;
    expect(body).toContainSource('【时代背景】：\n诸国割据后的灵气复苏时代。');
    expect(body).toContainSource('【世界格局】：\n宗门、王朝与商会三方争夺新矿脉。');
    expect(body).toContainSource('【社会秩序】：\n凡人依附城邦，修士受宗门律令和资源契约约束。');
  });

  it('splits protagonist cheat advantage preview into the approved five fields', async () => {
    const storageKey = 'workbench-cheat-advantage-structured-preview-test';
    const structuredSettingsSource = await readWorkbenchStructuredSettingsSource();
    const cheatSetStart = structuredSettingsSource.indexOf("id: 'work-core-cheat-advantage'");
    const cheatSetEnd = structuredSettingsSource.indexOf("id: 'faction-righteous-no-1'", cheatSetStart);
    const cheatSetSource = structuredSettingsSource.slice(cheatSetStart, cheatSetEnd);

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定3');
    fireEvent.click(screen.getByText('主角金手指/优势').closest('button') as HTMLElement);

    expect(screen.getByDisplayValue('主角金手指/优势')).toBeInTheDocument();
    expect(cheatSetSource).toContainSource("gridColumnsClassName: 'grid-cols-2'");
    expect(cheatSetSource).not.toContainSource("gridColumnsClassName: 'grid-cols-5'");
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
    expect(body).toContainSource('【能力来源】：\n主角误入旧神遗迹后绑定残缺系统。');
    expect(body).toContainSource('【核心功能】：\n吞噬遗物并提取其中的能力碎片。');
    expect(body).toContainSource('【升级方式】：\n通过完成遗迹任务解锁新模块。');
    expect(body).toContainSource('【使用限制】：\n短时间内吞噬过量会污染神魂。');
    expect(body).toContainSource('【隐藏真相】：\n系统其实是旧神复苏前留下的筛选器。');
  });

  it('uses role-style tabs for righteous faction fixed, status, and confirmation settings', async () => {
    const storageKey = 'workbench-righteous-faction-structured-preview-test';
    const panelSource = await readWorkbenchLibraryPanelSource();
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'righteous-faction-1',
          tab: '大纲',
          title: '1号势力',
          content: JSON.stringify({ type: '正派势力', body: '' }),
          updatedAt: '2026/6/19 01:00:00',
        },
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '势力设定1' }));
    ensureLibraryGroupExpanded('正派势力1');
    fireEvent.click(screen.getByText('1号势力').closest('button') as HTMLElement);

    expect(screen.getByRole('button', { name: '固定设定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '状态设定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确认' })).toBeInTheDocument();
    expect(screen.queryByText(/长期档案，智能导入时优先补全/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('势力名')).toHaveValue('1号势力');
    expect(screen.getByTestId('structured-title-field')).toContainElement(screen.getByLabelText('势力名'));
    expect(screen.getByTestId('structured-setting-fields')).not.toContainElement(screen.getByLabelText('势力名'));
    expect(screen.queryByText('设定名')).not.toBeInTheDocument();
    expect(panelSource).toContainSource("currentStructuredTitleFieldLabel ? 'px-5 py-3' : 'p-5'");
    expect(panelSource).toContainSource(
      "'relative flex h-[48px] w-[168px] shrink-0 items-center rounded-[20px] border-2 border-slate-950 bg-white px-4 py-0'",
    );
    expect(panelSource).toContainSource(
      'className={`h-7 w-full bg-transparent text-lg font-medium leading-7 text-slate-950 outline-none placeholder:text-slate-400',
    );
    expect(panelSource).toContainSource('<div aria-hidden="true" className="h-9 w-[112px] shrink-0" />');
    expect(panelSource).toContainSource(
      '{currentStructuredActiveGroup.title}共 {currentStructuredActiveGroupWordCount} 字',
    );
    expect(panelSource).not.toContainSource(
      'className={`h-full w-full bg-transparent text-xl font-black leading-7 text-slate-950 outline-none placeholder:text-slate-400',
    );
    expect(panelSource).not.toContainSource(
      'className="relative h-[54px] w-[168px] shrink-0 rounded-[22px] border-2 border-slate-950 bg-white px-4 pb-2 pt-4"',
    );
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
    expect(body).toContainSource('【基本信息】：\n青云宗，东洲正道宗门。');
    expect(body).toContainSource('【势力关系】：\n暂时与主角合作，暗中防备魔道。');
    expect(body).toContainSource('【对主角策略】：\n先保护主角，再观察其金手指来源。');
    expect(body).toContainSource('【核心问题/矛盾】：\n内部长老对是否支持主角存在分歧。');
  });

  it('uses dedicated structured templates for world maps and danger zones', async () => {
    const storageKey = 'workbench-world-map-danger-zone-structured-template-test';
    const panelSource = await readWorkbenchLibraryPanelSource();
    const structuredSettingsSource = await readWorkbenchStructuredSettingsSource();
    const taxonomySource = await readWorkbenchSettingTaxonomySource();
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    expect(structuredSettingsSource).toContainSource("id: 'faction-world-map'");
    expect(taxonomySource).toContainSource(
      "const DEFAULT_WORK_SETTING_STARTER_VERSION = '2026-06-25-foreshadow-fields-v1';",
    );
    expect(taxonomySource).toContainSource("{ type: '世界地图', title: '世界架构' }");
    expect(taxonomySource).toContainSource("{ type: '世界地图', title: '危险区域' }");
    expect(panelSource).toContainSource('lockedDefaultEntryId: getDefaultWorkSettingEntryId(item.type, item.title)');
    expect(structuredSettingsSource).toContainSource("entryType: '世界地图'");
    expect(structuredSettingsSource).toContainSource("titleFieldLabel: '地图名'");
    expect(structuredSettingsSource).toContainSource("title: '世界架构'");
    expect(structuredSettingsSource).toContainSource("title: '区域划分'");
    expect(structuredSettingsSource).toContainSource("title: '势力分布'");
    expect(structuredSettingsSource).toContainSource("title: '资源分布'");
    expect(structuredSettingsSource).toContainSource("title: '世界规则'");
    expect(structuredSettingsSource).not.toContainSource("key: 'trafficRoutes'");
    expect(panelSource).not.toContainSource("title: '交通路线'");
    expect(panelSource).not.toContainSource("title: '主角已知范围'");
    expect(structuredSettingsSource).toContainSource("id: 'faction-danger-zone'");
    expect(structuredSettingsSource).toContainSource("entryType: '世界地图'");
    expect(structuredSettingsSource).toContainSource("titleFieldLabel: '区域名'");
    expect(structuredSettingsSource).toContainSource("title: '区域概况'");
    expect(structuredSettingsSource).toContainSource("title: '危险来源'");
    expect(structuredSettingsSource).toContainSource("title: '进入条件'");
    expect(structuredSettingsSource).toContainSource("title: '资源收益'");
    expect(structuredSettingsSource).toContainSource("title: '核心规则'");
    expect(panelSource).not.toContainSource("title: '探索进度'");
    expect(panelSource).not.toContainSource("title: '外部势力介入'");

    fireEvent.click(screen.getByRole('button', { name: /^作品设定/ }));
    ensureLibraryGroupExpanded('世界地图2');
    fireEvent.click(screen.getByText('东洲全图').closest('button') as HTMLElement);

    expect(screen.getByTestId('structured-title-field')).toContainElement(screen.getByLabelText('地图名'));
    expect(screen.getByLabelText('地图名')).toHaveValue('东洲全图');
    expect(screen.queryByRole('button', { name: '固定设定' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '状态设定' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '确认' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('世界架构')).toBeInTheDocument();
    expect(screen.getByLabelText('区域划分')).toBeInTheDocument();
    expect(screen.getByLabelText('势力分布')).toBeInTheDocument();
    expect(screen.getByLabelText('资源分布')).toBeInTheDocument();
    expect(screen.getByLabelText('世界规则')).toBeInTheDocument();
    expect(screen.queryByLabelText('交通路线')).not.toBeInTheDocument();

    expect(screen.queryByLabelText('当前局势')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('封锁/开放')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('主角已知范围')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('近期变化')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('危险区域').closest('button') as HTMLElement);

    expect(screen.getByTestId('structured-title-field')).toContainElement(screen.getByLabelText('区域名'));
    expect(screen.getByLabelText('区域名')).toHaveValue('危险区域');
    expect(screen.getByLabelText('区域名')).toBeDisabled();
    fireEvent.contextMenu(screen.getByText('危险区域').closest('button') as HTMLElement);
    expect(screen.getByRole('button', { name: '重命名' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '删除' })).toBeDisabled();
    expect(screen.getByLabelText('区域概况')).toBeInTheDocument();
    expect(screen.getByLabelText('危险来源')).toBeInTheDocument();
    expect(screen.getByLabelText('进入条件')).toBeInTheDocument();
    expect(screen.getByLabelText('资源收益')).toBeInTheDocument();
    expect(screen.getByLabelText('历史背景')).toBeInTheDocument();
    expect(screen.getByLabelText('核心规则')).toBeInTheDocument();

    expect(screen.queryByLabelText('当前状态')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('探索进度')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('风险变化')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('资源剩余')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('已触发事件')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('外部势力介入')).not.toBeInTheDocument();
  });

  it('restores world map default entries for older projects', () => {
    const storageKey = 'workbench-world-map-locked-default-restored-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, '2026-06-22-danger-zone-under-world-map-v1');
    localStorage.setItem(storageKey, JSON.stringify([]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as Array<{
      title: string;
      content: string;
    }>;
    const worldMapDefaults = storedEntries
      .filter((entry) => JSON.parse(entry.content).type === '世界地图')
      .map((entry) => ({
        title: entry.title,
        lockedDefaultEntryId: JSON.parse(entry.content).lockedDefaultEntryId,
      }));

    expect(worldMapDefaults).toEqual(
      expect.arrayContaining([
        { title: '世界架构', lockedDefaultEntryId: '世界地图::世界架构' },
        { title: '危险区域', lockedDefaultEntryId: '世界地图::危险区域' },
      ]),
    );
  });

  it('adds monster bestiary as a structured setting workspace', async () => {
    const storageKey = 'workbench-monster-bestiary-structured-preview-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'monster-bestiary-1',
          tab: '大纲',
          title: '黑鳞妖狼',
          content: JSON.stringify({ type: '怪物列表', body: '' }),
          updatedAt: '2026/6/22 01:00:00',
        },
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '怪物图鉴1' }));
    ensureLibraryGroupExpanded('怪物列表1');
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
    expect(body).toContainSource('【怪物形象】：\n黑鳞覆背，额头有银色竖纹。');
    expect(body).toContainSource('【怪物能力】：\n夜间群猎，速度极快，擅长围杀。');
    expect(body).toContainSource('【怪物背景】：\n三阶妖狼，首次出现在黑松岭。');
    expect(body).toContainSource('【怪物弱点】：\n惧火，腹部鳞片较薄。');
    expect(body).toContainSource('【出没位置】：\n第十二章追踪主角至山谷。');
    expect(body).toContainSource('【掉落/资源】：\n妖丹、黑鳞、狼牙。');
  });

  it('splits item equipment preview into the approved resource fields', async () => {
    const storageKey = 'workbench-item-equipment-structured-preview-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'item-equipment',
          tab: '大纲',
          title: '玄青药鼎',
          content: JSON.stringify({ type: '物品装备', body: '' }),
          updatedAt: '2026/6/19 01:00:00',
        },
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '道具资源1' }));
    ensureLibraryGroupExpanded('物品装备1');
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
    expect(body).toContainSource('【基本信息】：\n法宝，玄阶上品，第三章初次登场。');
    expect(body).toContainSource('【物品描述】：\n青铜小鼎，鼎身有裂纹和云纹。');
    expect(body).toContainSource('【效果/功能】：\n可炼化灵草并短暂压制魔气。');
    expect(body).toContainSource('【来历】：\n来自上古药宗遗址，是宗门叛徒偷出的残器。');
    expect(body).toContainSource('【归属变化】：\n先由反派持有，后被主角夺回。');
    expect(body).toContainSource('【当前状态】：\n主角持有，器灵沉睡，裂纹未修复。');
    expect(body).toContainSource('【相关伏笔】：\n鼎底残符指向药宗真正传承地。');
  });

  it('splits ability settings into fixed settings, status settings, and confirmation tabs', async () => {
    const storageKey = 'workbench-item-ability-structured-preview-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'item-ability',
          tab: '大纲',
          title: '玄雷步',
          content: JSON.stringify({ type: '功法能力', body: '' }),
          updatedAt: '2026/6/22 23:10:00',
        },
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '道具资源1' }));
    ensureLibraryGroupExpanded('功法能力1');
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
    expect(
      screen.queryByText('功法能力的长期规则，记录来源、核心效果、成长方式、限制和伏笔。'),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '状态设定' }));
    expect(screen.getByLabelText('当前熟练度')).toBeInTheDocument();
    expect(screen.getByLabelText('当前突破')).toBeInTheDocument();
    expect(screen.getByLabelText('受损/封印')).toBeInTheDocument();
    expect(screen.getByLabelText('暴露程度')).toBeInTheDocument();
    expect(screen.getByLabelText('冷却/代价')).toBeInTheDocument();
    expect(screen.getByLabelText('最近使用')).toBeInTheDocument();
    expect(
      screen.queryByText('章节推进后会变化，AI 更新时只刷新熟练度、突破、受损封印、暴露程度、代价和最近使用。'),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '确认' }));
    expect(screen.getByText('确认更新')).toBeInTheDocument();
    expect(screen.getByText(/确认后才写入状态设定/)).toBeInTheDocument();
  });

  it('keeps resource currency as fixed structured settings without status or confirm tabs', async () => {
    const storageKey = 'workbench-resource-currency-structured-preview-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'resource-currency',
          tab: '大纲',
          title: '灵石体系',
          content: JSON.stringify({ type: '资源货币', body: '' }),
          updatedAt: '2026/6/22 22:30:00',
        },
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /^作品设定/ }));
    expect(screen.queryByRole('button', { name: '资源体系1' })).not.toBeInTheDocument();
    ensureLibraryGroupExpanded('资源货币1');
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
    expect(body).toContainSource('【基本信息】：\n灵石是修行界通用资源。');
    expect(body).toContainSource('【价值等级】：\n一枚中品灵石可换一百枚下品灵石。');
    expect(body).toContainSource('【获取渠道】：\n矿脉、任务、宗门俸禄和黑市交易。');
    expect(body).toContainSource('【消耗用途】：\n修炼、炼器、阵法、传送和购买情报。');
    expect(body).toContainSource('【流通限制】：\n边境城只认下品灵石，黑市交易抽成。');
    expect(body).toContainSource('【关联规则】：\n矿脉枯竭会推高边境灵石价格。');
    expect(body).not.toContainSource('【当前库存】');
    expect(body).not.toContainSource('【债务关系】');
  });

  it('splits special resources into fixed settings, status settings, and confirmation tabs', async () => {
    const storageKey = 'workbench-special-resource-structured-preview-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'special-resource',
          tab: '大纲',
          title: '龙脉权限',
          content: JSON.stringify({ type: '特殊资源', body: '' }),
          updatedAt: '2026/6/22 22:31:00',
        },
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '道具资源1' }));
    ensureLibraryGroupExpanded('特殊资源1');
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
    const structuredSettingsSource = await readWorkbenchStructuredSettingsSource();
    const segmentedTabsSource = await readWorkbenchSettingSegmentedTabsSource();
    const sharedSegmentedTabsSource = await readSharedSegmentedTabsSource();
    const styleSource = await readSharedStylesSource();

    expect(structuredSettingsSource).toContainSource(
      "const STRUCTURED_SETTING_TABS = ['固定设定', '状态设定', '确认'] as const;",
    );
    expect(panelSource).toContainSource('activeStructuredSettingTab');
    expect(panelSource).toContainSource("import { SettingSegmentedTabs } from './workbenchSettingSegmentedTabs';");
    expect(segmentedTabsSource).toContainSource('function SettingSegmentedTabs<T extends string>');
    expect(segmentedTabsSource).toContainSource("import { SegmentedTabs } from '@/shared/ui/SegmentedTabs';");
    expect(segmentedTabsSource).toContainSource('return <SegmentedTabs {...props} />;');
    expect(sharedSegmentedTabsSource).toContainSource(
      "className = 'flex h-10 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white'",
    );
    expect(sharedSegmentedTabsSource).toContainSource('active');
    expect(sharedSegmentedTabsSource).toContainSource("'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE]'");
    expect(sharedSegmentedTabsSource).toContainSource(
      "'bg-white text-slate-600 hover:bg-[#EAF9FD] hover:text-[#078FAE]'",
    );
    expect(panelSource).toContainSource('onChange={setActiveStructuredSettingTab}');
    expect(panelSource).toContainSource("activeStructuredSettingTab === '确认'");
    expect(panelSource).not.toContainSource('{activeGroup.description}');
    expect(structuredSettingsSource).not.toContainSource('currentStructuredSettingFieldSet.groups.map((group)');
    expect(panelSource).not.toContainSource("'border-slate-950 bg-slate-950 text-white'");
    expect(panelSource).not.toContainSource(
      "'border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:text-cyan-700'",
    );
    expect(panelSource).toContainSource('xy-structured-setting-field');
    expect(styleSource).toContainSource('.xy-floating-field.xy-structured-setting-field textarea::placeholder');
    expect(styleSource).toContainSource('font-size: 0.8125rem;');
  });

  it('splits plot planning previews into blueprint, volume, and payoff fields', async () => {
    const storageKey = 'workbench-plot-planning-structured-preview-test';
    const structuredSettingsSource = await readWorkbenchStructuredSettingsSource();
    const blueprintSetStart = structuredSettingsSource.indexOf("id: 'work-plot-blueprint'");
    const blueprintSetEnd = structuredSettingsSource.indexOf("id: 'work-plot-volume'", blueprintSetStart);
    const blueprintSetSource = structuredSettingsSource.slice(blueprintSetStart, blueprintSetEnd);

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('剧情规划3');

    fireEvent.click(screen.getByText('剧情蓝图').closest('button') as HTMLElement);
    expect(screen.getByLabelText('整体规划')).toBeInTheDocument();
    expect(screen.getByLabelText('主线目标')).toBeInTheDocument();
    expect(screen.getByLabelText('阶段节奏')).toBeInTheDocument();
    expect(blueprintSetSource).toContainSource("gridColumnsClassName: 'grid-cols-2'");
    expect(blueprintSetSource).not.toContainSource("gridColumnsClassName: 'grid-cols-3'");
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
    const blueprintBody = JSON.parse(
      storedEntries.find((entry: { title: string }) => entry.title === '剧情蓝图').content,
    ).body;
    const volumeBody = JSON.parse(
      storedEntries.find((entry: { title: string }) => entry.title === '分卷剧情').content,
    ).body;
    const payoffBody = JSON.parse(
      storedEntries.find((entry: { title: string }) => entry.title === '爽点设计').content,
    ).body;
    expect(blueprintBody).toContainSource('【整体规划】：\n全书三卷，一百万字。');
    expect(blueprintBody).toContainSource('【主线目标】：\n主角推翻旧天庭。');
    expect(blueprintBody).toContainSource('【阶段节奏】：\n前期求生，中期扩张，后期决战。');
    expect(volumeBody).toContainSource('【分卷总览】：\n第一卷凡界崛起。');
    expect(volumeBody).toContainSource('【卷核心事件】：\n主角夺回祖地。');
    expect(volumeBody).toContainSource('【卷末高潮】：\n宗门大比反杀。');
    expect(volumeBody).toContainSource('【下一卷钩子】：\n通往上界的钥匙出现。');
    expect(payoffBody).toContainSource('【核心爽点类型】：\n升级、反杀、打脸。');
    expect(payoffBody).toContainSource('【打脸对象设计】：\n看不起主角的宗门长老。');
    expect(payoffBody).toContainSource('【爽点公式】：\n误判主角实力，公开挑衅，被当场反杀。');
    expect(payoffBody).toContainSource('【爽点节奏】：\n每三章一个小回报，每卷一个大爆点。');
  });

  it('keeps structured plot planning fields after renaming a custom structured setting entry', async () => {
    const storageKey = 'workbench-structured-setting-fields-survive-rename-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('剧情规划1');
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
    expect(renamedSetting.body).toContainSource('【整体规划】：\n全书三卷，一百万字。');
  });

  it('recovers structured fields for custom entries when their body already has matching section titles', async () => {
    const storageKey = 'workbench-structured-setting-fields-recover-custom-entry-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('剧情规划1');
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

    ensureLibraryGroupExpanded('剧情规划3');

    fireEvent.click(screen.getByText('剧情蓝图').closest('button') as HTMLElement);
    expect(screen.getByLabelText('整体规划')).toHaveAttribute(
      'placeholder',
      '预计总字数、共几卷、故事从哪里开始到哪里结束。',
    );
    expect(screen.getByLabelText('整体规划').closest('.xy-floating-field')).toHaveClass(
      'xy-floating-visible-placeholder',
    );
    expect(screen.getByLabelText('主线目标')).toHaveAttribute('placeholder', '主角长期要完成的大目标。');
    expect(screen.getByLabelText('阶段节奏')).toHaveAttribute('placeholder', '前期、中期、后期分别推进什么内容。');

    fireEvent.click(screen.getByText('分卷剧情').closest('button') as HTMLElement);
    expect(screen.getByLabelText('分卷总览')).toHaveAttribute(
      'placeholder',
      '每一卷的卷名、字数、核心阶段和主要任务。',
    );
    expect(screen.getByLabelText('卷核心事件')).toHaveAttribute('placeholder', '这一卷最重要的剧情事件和冲突推进。');

    fireEvent.click(screen.getByText('爽点设计').closest('button') as HTMLElement);
    expect(screen.getByLabelText('爽点公式')).toHaveAttribute(
      'placeholder',
      '主角想法、实际行动、结果、配角反应、主角内心反应。',
    );

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const blueprintBody = JSON.parse(
      storedEntries.find((entry: { title: string }) => entry.title === '剧情蓝图').content,
    ).body;
    expect(blueprintBody).not.toContainSource('预计总字数');
  });

  it('removes old empty auto-created faction item and location entries without removing user content', async () => {
    const storageKey = 'workbench-clear-old-auto-domain-setting-items-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, '2026-06-17-setting-starter-empty-body-v3');
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

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
    localStorage.setItem(
      storageKey,
      JSON.stringify([
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
      ]),
    );

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

    expect(propsSource).not.toContainSource('deleteUnlocked');
    expect(propsSource).not.toContainSource('onDelete');
    expect(propsSource).not.toContainSource('onToggleDeleteUnlocked');
    expect(editorHeaderSource).not.toContainSource('删除');
    expect(editorHeaderSource).not.toContainSource('onDelete();');
    expect(editorHeaderSource).not.toContainSource('onToggleDeleteUnlocked();');
  });

  it('keeps outline work settings and character settings as a left sidebar scope switch', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource(
      "const [outlineSettingScope, setOutlineSettingScope] = useState<'work' | 'character'>('work')",
    );
    expect(panelSource).not.toContainSource('{false && activeTab === SETTING_TAB');
    expect(panelSource).toContainSource('const visibleWorkSettingCount = settingEntries.filter');
    expect(panelSource).toContainSource('const visibleRoleCount = roleEntries.filter');
    expect(panelSource).toContainSource(
      "{ id: 'work', label: '作品设定', count: visibleWorkSettingCount, type: null }",
    );
    expect(panelSource).toContainSource("{ id: 'character', label: '人物设定', count: visibleRoleCount, type: null }");
    expect(panelSource).toContainSource('settingWorkspaceTopTabs');
    expect(panelSource).toContainSource('const effectiveLibraryTab = isOutlineCharacterScope ? ROLE_TAB : activeTab');
    expect(panelSource).toContainSource(
      'const activeSettingTypeOptions = activeIsBrainstorm ? [BRAINSTORM_TYPE] : isOutlineCharacterScope ? roleTypeOptions : settingTypeOptions',
    );
    expect(panelSource).toContainSource('openSettingCreateDialog');
    expect(panelSource).toContainSource('addRole(selectedCreateType, { switchToRoleTab: false, title: createTitle })');
    expect(panelSource).toContainSource('<RoleBaseStateEditor');
    expect(panelSource).toContainSource('baseSetting: string;');
    expect(panelSource).toContainSource('stateSettings: RoleStateSettings;');
    expect(panelSource).toContainSource('>基础设定<');
    expect(panelSource).toContainSource('>状态设定<');
    expect(panelSource).toContainSource('style={{ fontSize: roleTextFontSize }}');
  });

  it('moves setting page scheme A into the production red-frame area without replacing the right AI panel', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource("const [outlineSettingDomain, setOutlineSettingDomain] = useState('work')");
    expect(panelSource).toContainSource('const settingWorkspaceDomainTabs = [');
    expect(panelSource).toContainSource(
      "{ id: 'work', label: '作品设定', count: visibleWorkSettingCount, type: null }",
    );
    expect(panelSource).toContainSource("{ id: 'character', label: '人物设定', count: visibleRoleCount, type: null }");
    expect(panelSource).toContainSource("{ id: 'setting:faction', label: '势力设定', type: 'setting:faction' }");
    expect(panelSource).toContainSource("{ id: 'setting:item', label: '道具资源', type: 'setting:item' }");
    expect(panelSource).toContainSource("{ id: 'setting:monster', label: '怪物图鉴', type: 'setting:monster' }");
    expect(panelSource).not.toContainSource("label: '地点场景'");
    expect(panelSource).toContainSource("{ id: 'setting:foreshadow', label: '伏笔线索', type: 'setting:foreshadow' }");
    expect(panelSource).not.toContainSource("{ id: 'setting:rule', label: '书写规则', type: 'setting:rule' }");
    expect(panelSource).toContainSource(
      "gridTemplateRows: activeTab === SETTING_TAB && !activeIsBrainstorm ? 'auto minmax(0,1fr)' : undefined",
    );
    expect(panelSource).toContainSource("gridColumn: '1 / 4'");
    expect(panelSource).toContainSource('settingWorkspaceTopTabs');
    expect(panelSource).toContainSource('getSettingTypeWorkspaceDomain(type) === activeSettingWorkspaceDomain');
    expect(panelSource).toContainSource('const selectedSettingWorkspaceType = getSelectedSettingWorkspaceType();');
    expect(panelSource).toContainSource('rightResizeHandle');
    expect(panelSource).toContainSource('CombinedAiConfigSelect');
  });

  it('migrates the approved setting taxonomy into the production setting library', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const structuredSettingsSource = await readWorkbenchStructuredSettingsSource();
    const taxonomySource = await readWorkbenchSettingTaxonomySource();
    const settingTypeOptionsStart = panelSource.indexOf('const settingTypeOptions = useMemo(() => {');
    const settingTypeOptionsEnd = panelSource.indexOf('const clearSettingsTargetMeta', settingTypeOptionsStart);
    const settingTypeOptionsSource = panelSource.slice(settingTypeOptionsStart, settingTypeOptionsEnd);

    expect(taxonomySource).toContainSource(
      "const DEFAULT_WORK_SETTING_TYPES = ['核心设定', '剧情规划', '资源货币', '世界地图'];",
    );
    expect(taxonomySource).not.toContainSource("{ type: '资源体系', title: '资源货币' }");
    expect(taxonomySource).toContainSource("{ type: '资源货币', title: '资源货币' }");
    expect(taxonomySource).not.toContainSource("{ type: '书写规则', title: '写作规范' }");
    expect(taxonomySource).not.toContainSource("{ type: '书写规则', title: '写作禁忌' }");
    expect(taxonomySource).toContainSource("'setting:faction': ['正派势力', '反派势力', '中立势力', '其他势力']");
    expect(taxonomySource).toContainSource("'setting:item': ['功法能力', '物品装备', '特殊资源']");
    expect(taxonomySource).toContainSource("'setting:monster': ['怪物列表']");
    expect(taxonomySource).not.toContainSource("'setting:location': ['世界地图', '危险区域']");
    expect(taxonomySource).toContainSource("'setting:foreshadow': ['主线伏笔', '人物伏笔']");
    expect(taxonomySource).not.toContainSource("'setting:rule': ['硬规则', '禁写规则']");
    expect(panelSource).toContainSource(
      'const DEFAULT_SETTING_ENTRY_TYPE = DEFAULT_SETTING_TYPES[0] ?? UNCATEGORIZED_TYPE;',
    );
    expect(settingTypeOptionsSource).toContainSource('return merged;');
    expect(settingTypeOptionsSource).not.toContainSource('return [...merged, UNCATEGORIZED_TYPE];');
    expect(panelSource).not.toContainSource("if (type === '主线剧情') return '剧情规划';");
    expect(panelSource).not.toContainSource("if (type === '道具资源') return '物品装备';");
    expect(panelSource).not.toContainSource("if (type === '妖兽图鉴' || type === '异兽图鉴'");
    expect(panelSource).not.toContainSource("if (type === '危险区域') return '世界地图';");
    expect(panelSource).toContainSource(
      "if (/(世界|规则|背景|科技|修炼|社会秩序|限制条件|天道|能量)/.test(source)) return '核心设定';",
    );
    expect(panelSource).toContainSource(
      "if (/(主线|剧情|任务|目标|冲突|开局|转折|高潮|结局|章节|卷|事件)/.test(source)) return '剧情规划';",
    );
    expect(panelSource).toContainSource("if (/(功法|能力|技能|神通|法术|异能|招式)/.test(source)) return '功法能力';");
    expect(panelSource).toContainSource("if (/(道具|装备|物品|法宝|武器|载具|机甲)/.test(source)) return '物品装备';");
    expect(panelSource).toContainSource(
      "if (/(妖兽|怪兽|怪物|魔兽|异兽|凶兽|灵兽|灵宠|邪祟|兽潮|妖丹|兽骨|鳞甲|毒囊)/.test(source)) return '怪物列表';",
    );
    expect(panelSource).toContainSource(
      "if (/(禁区|危险|秘境|遗迹|灾区|战场|污染区)/.test(source)) return '世界地图';",
    );
    expect(panelSource).toContainSource(
      "if (/(地点|地图|交通|地域|地理|重要地点|世界地图)/.test(source)) return '世界地图';",
    );
    expect(panelSource).not.toContainSource(
      "if (/(禁写|不能写错|不能越界|硬约束|前后矛盾|规则红线)/.test(source)) return '书写规则';",
    );
  });

  it('adds character relationship as a first-class role field before status settings', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const roleSettingFieldsSource = await readWorkbenchRoleSettingFieldsSource();
    const roleEditorSource = await readWorkbenchRoleEditorSource();

    expect(panelSource).toContainSource('relationship: string;');
    expect(panelSource).toContainSource("relationship: parsed.relationship || '',");
    expect(panelSource).toContainSource("relationship: value.relationship || '',");
    expect(panelSource).toContainSource('const relationshipWords = countTextWords(role.relationship);');
    expect(roleSettingFieldsSource).toContainSource(
      "type RoleStateUpdateChapterKey = RoleStateFieldKey | 'relationshipState';",
    );
    expect(panelSource).toContainSource(
      'const relationshipUpdateLabel = getRoleStateUpdateLabel(stateUpdateChapters.relationshipState);',
    );
    expect(panelSource).toContainSource('relationshipState: currentChapterNumber,');
    expect(panelSource).toContainSource('const updateRelationshipState = (value: string) => {');
    expect(panelSource).toContainSource('人物关系');
    expect(panelSource).not.toContainSource(
      'AI 默认只读取，不直接覆盖。发现缺失时进入“基础设定补充建议”，由用户确认后写入。',
    );
    expect(panelSource).not.toContainSource('只写这个人物自己的关系；全局关系网仍放到作品设定的“人物关系”分类。');
    expect(panelSource).not.toContainSource(
      'placeholder="记录姓名、身份、外貌、角色定位、核心性格、人物背景、能力规则等低频变化内容。"',
    );
    expect(roleSettingFieldsSource).toContainSource("placeholder: '身形、容貌、衣着、气质、标志性细节。'");
    expect(panelSource).toContainSource(
      'placeholder="记录与主角、阵营、亲友、敌人、师徒、利益对象的关系。关系绑定人物，不绑定世界。"',
    );
    expect(panelSource).toContainSource("wrapAiRequestTag('人物关系', truncateTextForAi(role.relationship, 700))");
    expect(roleEditorSource).toContainSource("const roleSettingTabs = ['基础设定', '状态设定', '未确认'] as const;");
    expect(roleEditorSource).toContainSource(
      "const [activeRoleSettingTab, setActiveRoleSettingTab] = useState<(typeof roleSettingTabs)[number]>('基础设定');",
    );
    expect(roleEditorSource).toContainSource('<SettingSegmentedTabs');
    expect(roleEditorSource).toContainSource('tabs={roleSettingTabs}');
    expect(roleEditorSource).toContainSource('onChange={setActiveRoleSettingTab}');
    const segmentedTabsSource = await readWorkbenchSettingSegmentedTabsSource();
    const sharedSegmentedTabsSource = await readSharedSegmentedTabsSource();
    expect(segmentedTabsSource).toContainSource("import { SegmentedTabs } from '@/shared/ui/SegmentedTabs';");
    expect(sharedSegmentedTabsSource).toContainSource(
      "className = 'flex h-10 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white'",
    );
    expect(sharedSegmentedTabsSource).toContainSource("'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE]'");
    expect(sharedSegmentedTabsSource).toContainSource(
      "'bg-white text-slate-600 hover:bg-[#EAF9FD] hover:text-[#078FAE]'",
    );
    expect(roleEditorSource).toContainSource("activeRoleSettingTab === '状态设定'");
    expect(roleEditorSource).toContainSource('updateRelationshipState(event.target.value)');
    expect(roleEditorSource).toContainSource('{relationshipUpdateLabel}');
    expect(roleEditorSource).toContainSource(
      "stateUpdateChapters.relationshipState ? 'text-[#08AACE]' : 'text-red-500'",
    );
    expect(roleEditorSource).toContainSource('未确认更新');
    expect(roleEditorSource).toContainSource('自动确认');
    expect(roleEditorSource).toContainSource('一键确认');
    expect(roleEditorSource).toContainSource("activeRoleSettingTab === '未确认' ? (");
    expect(roleEditorSource).toContainSource(
      'className="flex shrink-0 items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-1.5"',
    );
    expect(roleEditorSource).not.toContainSource(
      'className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5"',
    );
    expect(roleEditorSource).not.toContainSource('AI 只更新状态设定，AI反馈先进入未确认区，确认后才写入状态设定。');
    expect(roleEditorSource).not.toContainSource("自动确认 {autoConfirmRoleState ? '开启后自动写入状态设定' : '关闭'}");
    expect(roleEditorSource).toContainSource('手动确认');
    expect(roleEditorSource).toContainSource("beforeTitle: '人物关系未更新前'");
    expect(roleEditorSource).toContainSource("afterTitle: '人物关系更新后'");
    expect(roleEditorSource).toContainSource('item.beforeTitle');
    expect(roleEditorSource).toContainSource('item.afterTitle');
    expect(roleEditorSource).toContainSource('item.beforeValue');
    expect(roleEditorSource).toContainSource('item.afterValue');
    expect(roleEditorSource).toContainSource('className="grid gap-3 md:grid-cols-2"');
    expect(roleEditorSource).not.toContainSource('正文中出现新的关系变化，建议确认后写入人物关系。');
    expect(panelSource).toContainSource('grid-cols-1');
    expect(panelSource).not.toContainSource('grid-cols-[minmax(280px,0.85fr)_minmax(260px,0.7fr)_minmax(380px,1.1fr)]');
    expect(roleEditorSource).not.toContainSource('<aside');

    const relationshipIndex = roleEditorSource.indexOf('人物关系');
    const statusIndex = roleEditorSource.indexOf('状态设定');
    expect(relationshipIndex).toBeGreaterThan(-1);
    expect(relationshipIndex).toBeGreaterThan(statusIndex);
  });

  it('moves character editor scheme seven into production and retires the layout test page', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const roleSettingFieldsSource = await readWorkbenchRoleSettingFieldsSource();
    const fieldSizeSource = await readWorkbenchFieldSizeSettingsSource();
    const testCollectionSource = await readTestCollectionSource();
    const roleEditorSource = await readWorkbenchRoleEditorSource();

    expect(roleSettingFieldsSource).toContainSource('const ROLE_BASE_SETTING_FIELD_DEFINITIONS');
    expect(roleEditorSource).toContainSource('人物姓名');
    expect(fieldSizeSource).toContainSource('settingName: { width: 220, height: 56, fontSize: 18 }');
    expect(roleEditorSource).toContainSource(
      'className="relative flex h-[48px] w-[148px] shrink-0 items-center rounded-[20px] border-2 border-slate-950 bg-white px-4 py-0"',
    );
    expect(roleEditorSource).not.toContainSource(
      'className="relative h-[54px] w-[148px] shrink-0 rounded-[22px] border-2 border-slate-950 bg-white px-4 pb-2 pt-4"',
    );
    expect(roleEditorSource).not.toContainSource('className="relative h-[58px] w-[148px]');
    expect(roleEditorSource).toContainSource(
      'className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-sm font-medium leading-5 text-slate-500"',
    );
    expect(roleEditorSource).toContainSource(
      'className="h-6 w-full bg-transparent text-[17px] font-medium leading-6 text-slate-950 outline-none placeholder:text-slate-400"',
    );
    expect(roleEditorSource).not.toContainSource(
      'className="h-7 w-full bg-transparent text-lg font-medium leading-7 text-slate-950 outline-none placeholder:text-slate-400"',
    );
    expect(roleEditorSource).not.toContainSource('className="flex min-w-[160px] items-center gap-2"');
    expect(roleEditorSource).not.toContainSource(
      'className="min-w-0 bg-transparent text-2xl font-black leading-8 text-slate-950 outline-none placeholder:text-slate-400"',
    );
    expect(roleEditorSource).not.toContainSource(
      'className="h-full w-full bg-transparent text-xl font-black leading-7 text-slate-950 outline-none placeholder:text-slate-400"',
    );
    expect(roleEditorSource).toContainSource('floatingLabel="身份定位"');
    expect(roleSettingFieldsSource).toContainSource("title: '外貌'");
    expect(roleSettingFieldsSource).toContainSource("title: '称号/外号/别称'");
    expect(roleSettingFieldsSource).not.toContainSource("title: '角色定位'");
    expect(roleSettingFieldsSource).toContainSource("title: '核心性格'");
    expect(roleSettingFieldsSource).toContainSource("title: '人物背景'");
    expect(roleSettingFieldsSource).toContainSource("title: '金手指/能力'");
    expect(roleEditorSource).toContainSource('{field.title}');
    expect(roleSettingFieldsSource).toContainSource("key: 'appearance'");
    expect(roleSettingFieldsSource).toContainSource("key: 'aliasName'");
    expect(roleSettingFieldsSource).not.toContainSource("key: 'rolePosition'");
    expect(roleSettingFieldsSource).toContainSource("key: 'corePersonality'");
    expect(roleSettingFieldsSource).toContainSource("key: 'background'");
    expect(roleSettingFieldsSource).toContainSource("key: 'abilityRules'");
    expect(roleEditorSource).toContainSource('updateRoleBaseSettingField(field.key, event.target.value)');
    expect(roleEditorSource).toContainSource('onTitleChange(event.target.value)');
    expect(roleEditorSource).not.toContainSource('floatingLabel="分类"');
    expect(roleEditorSource).not.toContainSource('flex h-[86px] shrink-0');
    expect(roleEditorSource).toContainSource('className="flex min-h-0 flex-1 flex-col gap-3 px-5 py-3"');
    expect(roleEditorSource).not.toContainSource('className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-5"');
    expect(roleEditorSource).toContainSource('className="shrink-0 border-b border-slate-200 pb-3"');
    expect(roleEditorSource).toContainSource(
      'className="mt-3 flex items-center justify-between gap-4 overflow-x-auto pb-1"',
    );
    expect(roleEditorSource).not.toContainSource('className="flex shrink-0 gap-2"');
    expect(roleEditorSource).not.toContainSource('rounded-full border px-4 py-2 text-sm font-black');
    expect(roleEditorSource).toContainSource('className="shrink-0 text-xs font-black text-slate-400"');
    expect(roleEditorSource).not.toContainSource('className="mt-2 text-xs font-black text-slate-400"');
    expect(roleEditorSource).toContainSource(
      'className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-1 pb-1 pr-2 pt-3"',
    );
    expect(roleEditorSource).toContainSource("const roleSettingTabs = ['基础设定', '状态设定', '未确认'] as const;");
    expect(roleEditorSource).toContainSource(
      'className="relative flex min-h-[150px] flex-col rounded-[22px] border-2 border-slate-950 bg-white p-4 pt-5"',
    );
    expect(roleEditorSource).toContainSource(
      "const contentGridClassName = 'grid min-h-full grid-cols-2 auto-rows-fr gap-3';",
    );
    expect(roleEditorSource).not.toContainSource('grid grid-cols-3');
    expect(roleEditorSource).not.toContainSource('col-span-2');
    expect(roleEditorSource).not.toContainSource('h-[116px]');
    expect(roleEditorSource).not.toContainSource('h-24');
    expect(roleEditorSource).toContainSource('min-h-[150px]');
    expect(roleEditorSource).not.toContainSource(
      'placeholder="记录身份、外貌、角色定位、核心性格、人物背景、能力规则等低频变化内容。"',
    );
    expect(testCollectionSource).not.toContainSource('CharacterSettingLayoutPlanTestPage');
    expect(testCollectionSource).not.toContainSource('/character-setting-layout-plan-test');
    expect(testCollectionSource).not.toContainSource('人物设定布局方案测试');
  });

  it('stretches character setting cards to the available editor height like structured setting pages', async () => {
    const roleEditorSource = await readWorkbenchRoleEditorSource();

    expect(roleEditorSource).toContainSource(
      "const contentGridClassName = 'grid min-h-full grid-cols-2 auto-rows-fr gap-3';",
    );
    expect(roleEditorSource).toContainSource(
      'className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-1 pb-1 pr-2 pt-3"',
    );
    expect(roleEditorSource).toContainSource(
      'className="relative flex min-h-[150px] flex-col rounded-[22px] border-2 border-slate-950 bg-white p-4 pt-5"',
    );
    expect(roleEditorSource).toContainSource(
      'className="editor-scrollbar min-h-0 flex-1 resize-none bg-transparent text-sm leading-7 text-slate-700 outline-none placeholder:text-slate-400"',
    );
    expect(roleEditorSource).not.toContainSource('className="editor-scrollbar h-[116px] w-full resize-none');
  });
});
