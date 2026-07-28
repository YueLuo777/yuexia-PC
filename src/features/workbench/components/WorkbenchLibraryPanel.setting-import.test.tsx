import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { WorkbenchLibraryPanel } from './WorkbenchLibraryPanel';
import {
  TEST_WORK_SETTING_STARTER_VERSION,
  unlockSmartImportSettings,
  readWorkbenchLibraryPanelSource,
  readWorkbenchSettingTaxonomySource,
  readWorkbenchSettingImportFormatPreviewSource,
  readWorkbenchStructuredSettingsSource,
  readWorkbenchRoleSettingFieldsSource,
  readWorkbenchLibraryAiLogShellSource,
  readSharedAppModalShellSource,
} from './WorkbenchLibraryPanel.testUtils';

describe('WorkbenchLibraryPanel setting import flows', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('updates the canonical template entry without duplicating bracket titles or displaying internal JSON', () => {
    const storageKey = 'workbench-smart-import-canonical-template-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'canonical-positioning',
          tab: '大纲',
          title: '作品定位',
          content: JSON.stringify({
            type: '核心设定',
            body: '',
            structuredFieldSetId: 'prompt-work-positioning',
            lockedDefaultEntryId: '核心设定::作品定位',
          }),
          updatedAt: '2026/7/27',
        },
        {
          id: 'accidental-duplicate',
          tab: '大纲',
          title: '【作品定位】',
          content: JSON.stringify({ type: '核心设定', body: '错误重复内容' }),
          updatedAt: '2026/7/27',
        },
      ]),
    );
    localStorage.setItem(
      `${storageKey}_tab_configs_v1`,
      JSON.stringify({
        大纲: {
          aiOutput:
            '【作品定位】\n{"type":"核心设定","body":"《万界吞噬》主打吞噬升级。","structuredFieldSetId":"prompt-work-positioning","lockedDefaultEntryId":"核心设定::作品定位"}',
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

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as Array<{
      id: string;
      title: string;
      content: string;
    }>;
    const positioningEntries = storedEntries.filter((entry) => entry.title.replace(/[【】]/g, '') === '作品定位');
    expect(positioningEntries).toHaveLength(1);
    expect(positioningEntries[0].id).toBe('canonical-positioning');
    expect(JSON.parse(positioningEntries[0].content)).toMatchObject({
      body: '《万界吞噬》主打吞噬升级。',
      structuredFieldSetId: 'prompt-work-positioning',
      lockedDefaultEntryId: '核心设定::作品定位',
    });
    expect(positioningEntries[0].content).not.toContain('"body":"{');
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
    expect(panelSource).toContainSource(
      '), [buildSettingImportFormatTabs, getSettingTypeWorkspaceDomain, settingEntries, settingTypeOptions],',
    );
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
});
