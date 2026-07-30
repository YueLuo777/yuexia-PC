import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFile(resolve(process.cwd(), path), 'utf8');

describe('formal setting tree migration', () => {
  it('uses the dedicated formal tree and places setting status tabs in the middle workspace', async () => {
    const workspace = await readSource('src/features/workbench/components/workbenchSettingLibraryWorkspaceView.tsx');
    const rightPanel = await readSource('src/features/workbench/components/workbenchSettingLibraryView.tsx');

    expect(workspace).toContainSource('<WorkbenchSettingTreeSidebar');
    expect(workspace).toContainSource('onSelectDomain={selectSettingWorkspaceDomain}');
    expect(workspace).toContainSource('<WorkbenchSettingPanelTabs');
    expect(workspace).toContainSource('justify-end border-b border-slate-100');
    expect(rightPanel).not.toContainSource('<WorkbenchSettingPanelTabs');
  });

  it('removes word counts from the formal setting editor and formal tree', async () => {
    const editor = await readSource('src/features/workbench/components/workbenchSettingEditor.tsx');
    const tree = await readSource('src/features/workbench/components/WorkbenchSettingTreeSidebar.tsx');

    expect(editor).not.toContainSource('WordCountText');
    expect(editor).not.toContainSource('countTextWords');
    expect(editor).not.toContainSource('当前设定完整显示');
    expect(editor).not.toContainSource('所有字段均可独立设置更新规则并保留历史');
    expect(editor).not.toContainSource('getSettingFieldPolicy');
    expect(editor).not.toContainSource('xy-structured-setting-field');
    expect(editor).toContainSource('resize-none border-0 bg-transparent');
    expect(editor).toContainSource("import { History } from 'lucide-react';");
    expect(editor).toContainSource('title="字段记录"');
    expect(editor).toContainSource('xy-field-record-icon-button');
    expect(editor).toContainSource('right-6 top-0 z-10 grid h-6 w-6 -translate-y-1/2');
    expect(editor).toContainSource('text-[#08AACE]');
    expect(editor).toContainSource('<History className="h-4 w-4" />');
    expect(editor).toContainSource('<WorkbenchFieldRecordModal');
    expect(editor).not.toContainSource('>保留历史</span>');
    expect(editor).not.toContainSource('查看轨迹 →');
    expect(editor).not.toContainSource('字段记录 →');
    expect(tree).not.toContainSource('WordCountText');
    expect(tree).not.toContainSource('字</');
  });
  it('keeps the formal tree in hidden domain order and removes the selected-entry leading cyan bar', async () => {
    const tree = await readSource('src/features/workbench/components/WorkbenchSettingTreeSidebar.tsx');

    expect(tree).toContainSource('const DOMAIN_ORDER: Record<string, number> = {');
    expect(tree).toContainSource('work: 1,');
    expect(tree).toContainSource("'setting:plot': 2,");
    expect(tree).toContainSource('character: 3,');
    expect(tree).toContainSource("'setting:location': 4,");
    expect(tree).toContainSource("'setting:faction': 5,");
    expect(tree).toContainSource("'setting:item': 6,");
    expect(tree).toContainSource("'setting:foreshadow': 7,");
    expect(tree).toContainSource("'setting:monster': 8,");
    expect(tree).toContainSource('const [expandedDomainIds, setExpandedDomainIds] = useState(() => new Set([activeDomainId]));');
    expect(tree).toContainSource('return (DOMAIN_ORDER[left.id] ?? 99) - (DOMAIN_ORDER[right.id] ?? 99);');
    expect(tree).toContainSource('const domainOpen = Boolean(normalizedQuery) || expandedDomainIds.has(domain.id);');
    expect(tree).toContainSource('{domainOpen ? groups : null}');
    expect(tree).not.toContainSource('if (left.id === expandedDomainId) return 1;');
    expect(tree).not.toContainSource('expandedDomainId === domain.id');
    expect(tree).not.toContainSource("shadow-[inset_3px_0_0_#08AACE]");
    expect(tree).not.toContainSource('border-l-2 border-[#BCECF5]');
    expect(tree).not.toContainSource('before:-left');
  });

  it('keeps the setting name input text vertically centered in the formal header', async () => {
    const styles = await readSource('src/shared/styles/parts/part-09.css');

    expect(styles).toContainSource('.xy-workbench-name-field-input');
    expect(styles).toContainSource('appearance: none;');
    expect(styles).toContainSource('top: 0;');
    expect(styles).toContainSource('font-size: 1rem;');
    expect(styles).toContainSource('font-weight: 900;');
    expect(styles).toContainSource('line-height: 24px;');
    expect(styles).toContainSource('transform: translateY(-50%);');
    expect(styles).toContainSource('height: 36px;');
    expect(styles).toContainSource('line-height: 34px;');
    expect(styles).toContainSource('left: 24px;');
    expect(styles).toContainSource('max-width: calc(100% - 48px);');
    expect(styles).toContainSource('padding: 0 1.5rem 2px;');
    expect(styles).toContainSource('.xy-workbench-name-field-input:disabled {');
    expect(styles).toContainSource('color: #020617;');
    expect(styles).toContainSource('opacity: 1;');
    expect(styles).toContainSource('transform: none;');
    expect(styles).not.toContainSource('transform: translateY(-2px);');
  });

  it('keeps formal setting page embedded border labels on one typography baseline', async () => {
    const styles = await readSource('src/shared/styles/parts/part-09.css');
    const roleEditor = await readSource('src/features/workbench/components/workbenchRoleEditor.tsx');
    const settingEditor = await readSource('src/features/workbench/components/workbenchSettingEditor.tsx');
    const headerSelect = await readSource('src/features/workbench/components/WorkbenchHeaderSelect.tsx');

    expect(styles).toContainSource('.xy-workbench-name-field-caption {');
    expect(styles).toContainSource('font-family: inherit;');
    expect(styles).toContainSource('font-size: 1rem;');
    expect(styles).toContainSource('font-weight: 900;');
    expect(styles).toContainSource('line-height: 24px;');
    expect(roleEditor).toContainSource('text-base font-black leading-6 text-slate-950');
    expect(settingEditor).toContainSource('text-base font-black leading-6 text-slate-950');
    expect(headerSelect).toContainSource('text-base font-black leading-6 text-slate-950');
    expect(headerSelect).toContainSource('absolute inset-x-0 bottom-0 h-9');
    expect(headerSelect).toContainSource('leading-[34px] text-slate-950');
    expect(headerSelect).toContainSource('disabled:text-slate-950 disabled:opacity-100');
    expect(headerSelect).toContainSource('title?: string;');
    expect(headerSelect).toContainSource('title={title}');
    expect(settingEditor).toContainSource("const LOCKED_DEFAULT_SETTING_TOOLTIP = '内置设定，无法删除';");
    expect(settingEditor).toContainSource("title={currentSelectedSettingIsLockedDefault ? LOCKED_DEFAULT_SETTING_TOOLTIP : undefined}");
    expect(headerSelect).not.toContainSource('text-sm font-medium leading-5 text-slate-950');
  });

  it('keeps field record icons transparent without text backplate artifacts', async () => {
    const styles = await readSource('src/shared/styles/parts/part-12.css');
    const roleEditor = await readSource('src/features/workbench/components/workbenchRoleEditor.tsx');
    const settingEditor = await readSource('src/features/workbench/components/workbenchSettingEditor.tsx');

    expect(roleEditor).toContainSource('xy-border-embedded-transparent-backplate xy-field-record-icon-button');
    expect(settingEditor).toContainSource('xy-border-embedded-transparent-backplate xy-field-record-icon-button');
    expect(styles).toContainSource('.xy-field-record-icon-button.xy-border-embedded-transparent-backplate {');
    expect(styles).toContainSource('background-image: none !important;');
    expect(styles).toContainSource('border-radius: 999px;');
    expect(styles).toContainSource('isolation: isolate;');
    expect(styles).toContainSource('.xy-field-record-icon-button.xy-border-embedded-transparent-backplate svg');
    expect(styles).toContainSource('position: relative;');
    expect(styles).toContainSource('z-index: 1;');
    expect(styles).toContainSource('-webkit-text-stroke: 0 transparent;');
    expect(styles).toContainSource('.xy-field-record-icon-button.xy-border-embedded-transparent-backplate::before');
    expect(styles).toContainSource('content: none;');
    expect(styles).toContainSource('.xy-field-record-icon-button.xy-border-embedded-transparent-backplate::after');
    expect(styles).toContainSource('inset: 3px;');
    expect(styles).toContainSource('background: #ffffff;');
  });

  it('keeps structured field cards compact below their embedded border labels', async () => {
    const settingEditor = await readSource('src/features/workbench/components/workbenchSettingEditor.tsx');
    const roleEditor = await readSource('src/features/workbench/components/workbenchRoleEditor.tsx');
    const editorLayout = await readSource('src/features/workbench/components/workbenchSettingEditorLayout.ts');

    expect(settingEditor).toContainSource("const SETTING_FIELD_CARD_CLASS = 'relative flex flex-col rounded-[20px] border-2 border-slate-950 bg-white px-6 pb-2 pt-4';");
    expect(settingEditor).toContainSource("compact: 'min-h-[96px]'");
    expect(settingEditor).toContainSource("standard: 'min-h-[132px]'");
    expect(settingEditor).toContainSource("expanded: 'min-h-[158px]'");
    expect(settingEditor).toContainSource('data-setting-field-group={group.title}');
    expect(settingEditor).toContainSource('{group.title}</h3>');
    expect(settingEditor).toContainSource("const SETTING_FIELD_LABEL_CLASS = 'xy-border-embedded-transparent-backplate absolute left-6 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950';");
    expect(settingEditor).toContainSource("const SETTING_FIELD_RECORD_BUTTON_CLASS = 'xy-border-embedded-transparent-backplate xy-field-record-icon-button absolute right-6 top-0 z-10 grid h-6 w-6 -translate-y-1/2 place-items-center text-[#08AACE] hover:text-[#078fb0]';");
    expect(settingEditor).toContainSource('className={WORKBENCH_SETTING_EDITOR_SHELL_CLASS}');
    expect(settingEditor).toContainSource('className={`${WORKBENCH_SETTING_EDITOR_TWO_COLUMN_GRID_CLASS} ${currentStructuredSettingFieldSet.gridContentClassName ??');
    expect(settingEditor).toContainSource('<header className={WORKBENCH_SETTING_EDITOR_HEADER_CLASS}>');
    expect(settingEditor).toContainSource('<div className={WORKBENCH_SETTING_EDITOR_SCROLL_CLASS}>');
    expect(editorLayout).toContainSource('xy-setting-name-editor xy-setting-editor-content-offset flex min-h-0 flex-1 flex-col px-5 pb-3');
    expect(editorLayout).toContainSource('grid grid-cols-2 items-stretch gap-3');
    expect(settingEditor).toContainSource('className={`editor-scrollbar [scrollbar-gutter:stable] ${SETTING_FIELD_CONTENT_CLASS}`}');
    expect(settingEditor).toContainSource('pb-1 [scrollbar-gutter:stable] ${SETTING_FIELD_CONTENT_CLASS}');
    expect(settingEditor).toContainSource('className={`min-h-10 w-full border-0 bg-transparent ${SETTING_FIELD_CONTENT_CLASS}`}');
    expect(settingEditor).toContainSource('scrollbar-scroll-only scrollbar-half-width min-h-[72px]');
    expect(settingEditor).toContainSource('className={`editor-scrollbar min-h-0 w-full flex-1 resize-none border-0 bg-transparent pb-1 [scrollbar-gutter:stable] ${SETTING_FIELD_CONTENT_CLASS}`}');
    expect(settingEditor).not.toContainSource('text-sm leading-7 text-gray-700');
    expect(settingEditor).not.toContainSource('bg-white px-5 pb-6 pt-5');
    expect(settingEditor).not.toContainSource('rounded-[22px] border-2 border-slate-950 bg-white px-5');
    expect(settingEditor).not.toContainSource('grid grid-cols-2 gap-4');
    expect(settingEditor).not.toContainSource('absolute left-5 top-0 z-10');
    expect(settingEditor).not.toContainSource('absolute right-5 top-0 z-10 grid h-6 w-6');
    expect(settingEditor).not.toContainSource('className="mt-2 min-h-10');
    expect(settingEditor).not.toContainSource('scrollbar-half-width mt-2 min-h-[72px]');
    expect(settingEditor).not.toContainSource('className="editor-scrollbar mt-2 min-h-0');

    expect(roleEditor).toContainSource('bg-white px-5 pb-4 pt-2');
    expect(roleEditor).toContainSource('className={WORKBENCH_SETTING_EDITOR_SHELL_CLASS}');
    expect(roleEditor).toContainSource('<section className={WORKBENCH_SETTING_EDITOR_SCROLL_CLASS}>');
    expect(roleEditor).toContainSource('pb-2 [scrollbar-gutter:stable] ${ROLE_FIELD_CONTENT_CLASS}');
    expect(roleEditor).toContainSource('className={`editor-scrollbar w-full resize-none border-0 bg-transparent pb-2');
    expect(roleEditor).toContainSource('ROLE_FIELD_STANDARD_MIN_ROWS = 3');
    expect(roleEditor).toContainSource('ROLE_FIELD_COMPACT_MIN_ROWS = 2');
    expect(roleEditor).toContainSource('ROLE_FIELD_MAX_ROWS = 10');
    expect(roleEditor).not.toContainSource('text-sm leading-7 text-slate-700');
    expect(roleEditor).not.toContainSource('bg-white px-5 pb-6 pt-5');
    expect(roleEditor).not.toContainSource('className="editor-scrollbar mt-2 min-h-[76px]');
  });

  it('aligns every formal setting editor below a search-row-height gutter', async () => {
    const styles = await readSource('src/shared/styles/parts/part-09.css');
    const settingEditor = await readSource('src/features/workbench/components/workbenchSettingEditor.tsx');
    const roleEditor = await readSource('src/features/workbench/components/workbenchRoleEditor.tsx');
    const editorLayout = await readSource('src/features/workbench/components/workbenchSettingEditorLayout.ts');
    const tree = await readSource('src/features/workbench/components/WorkbenchSettingTreeSidebar.tsx');

    expect(styles).toContainSource('.xy-setting-name-editor.xy-setting-editor-content-offset {');
    expect(styles).toContainSource('padding-top: calc(23px + 2.25rem);');
    expect(styles).not.toContainSource('padding-top: 23px;');
    expect(styles).not.toContainSource('padding-top: 12px !important;');
    expect(tree).toContainSource('flex h-9 shrink-0 items-center');
    expect(editorLayout.match(/xy-setting-editor-content-offset/g)).toHaveLength(1);
    expect(settingEditor).toContainSource('WORKBENCH_SETTING_EDITOR_SHELL_CLASS');
    expect(roleEditor).toContainSource('WORKBENCH_SETTING_EDITOR_SHELL_CLASS');
    expect(settingEditor).not.toContainSource('pt-16');
    expect(roleEditor).not.toContainSource('pt-16');
  });

  it('keeps the formal setting tree left resize handle on the visible grid row', async () => {
    const resizeHandles = await readSource('src/features/workbench/components/workbenchLibraryResizeHandles.tsx');

    expect(resizeHandles).toContainSource('style={activeTab === SETTING_TAB ? { gridColumn: 2, gridRow: 1 } : undefined}');
    expect(resizeHandles).not.toContainSource('style={activeTab === SETTING_TAB ? { gridColumn: 2, gridRow: 2 } : undefined}');
  });

  it('keeps second and third level setting tree rows on equal indentation steps', async () => {
    const tree = await readSource('src/features/workbench/components/WorkbenchSettingTreeSidebar.tsx');

    expect(tree).toContainSource('<div className="relative space-y-1 pl-3');
    expect(tree).toContainSource('className="relative space-y-px pl-3');
    expect(tree).not.toContainSource('<div className="space-y-1 pl-7">');
    expect(tree).not.toContainSource('<div className="space-y-px pl-4">');
    expect(tree).not.toContainSource('<div className="relative space-y-px pl-2');
  });

  it('uses visual weight instead of deep indentation for the three setting tree levels', async () => {
    const tree = await readSource('src/features/workbench/components/WorkbenchSettingTreeSidebar.tsx');

    expect(tree).toContainSource('rounded-xl border border-[#AEE7F1] bg-[#CDEFF6]');
    expect(tree).toContainSource('rounded-lg border border-[#B7EAF3] bg-[#DDF5FA]');
    expect(tree).toContainSource('hover:bg-[#D2F0F7]');
    expect(tree).toContainSource("before:bg-[#7DCDDC] before:content-['']");
    expect(tree).toContainSource('data-setting-tree-item-list="true"');
    expect(tree).toContainSource('before:bottom-[18px] before:left-0 before:top-[-4px]');
    expect(tree).toContainSource('data-setting-tree-group-connector="true"');
    expect(tree).toContainSource("groupSelected ? CHAPTER_NAV_SELECTED_LINE_CLASS : 'bg-[#7DCDDC]'");
    expect(tree).toContainSource('data-setting-tree-selected-path="true"');
    expect(tree).toContainSource('getWorkbenchSettingTreeSelectedPathHeight(selectedItemIndex)');
    expect(tree).toContainSource('data-setting-tree-item-connector="true"');
    expect(tree).toContainSource("selected ? CHAPTER_NAV_SELECTED_LINE_CLASS : 'bg-[#9ADFEA]'");
    expect(tree).toContainSource("import { isLockedDefaultSettingEntry } from './workbenchLibraryDataState';");
    expect(tree).toContainSource("const LOCKED_DEFAULT_SETTING_TOOLTIP = '内置设定，无法删除';");
    expect(tree).toContainSource('const lockedDefaultSetting = !domain.roleDomain && isLockedDefaultSettingEntry(entry);');
    expect(tree).toContainSource('title={lockedDefaultSetting ? LOCKED_DEFAULT_SETTING_TOOLTIP : undefined}');
    expect(tree).not.toContainSource("before:bottom-1 before:left-0 before:top-1 before:w-px before:bg-[#9ADFEA]");
    expect(tree).not.toContainSource('before:left-[-8px]');
    expect(tree).not.toContainSource('before:h-px before:w-2');
    expect(tree).toContainSource("border-transparent bg-white/70 text-slate-600 hover:border-[#D9F3F8] hover:bg-white");
    expect(tree).toContainSource('border-2 ${CHAPTER_NAV_SELECTED_BORDER_CLASS} bg-white text-slate-600');
  });

  it('keeps the migrated double-sticky navigation and dynamic final-row reserve in the formal sidebar', async () => {
    const tree = await readSource('src/features/workbench/components/WorkbenchSettingTreeSidebar.tsx');
    const stickyHook = await readSource('src/features/workbench/hooks/useWorkbenchSettingTreeStickyNavigation.ts');

    expect(tree).toContainSource('data-sticky-level="1"');
    expect(tree).toContainSource('sticky top-0 z-30');
    expect(tree).toContainSource('data-sticky-level="2"');
    expect(tree).toContainSource('sticky top-10 z-20');
    expect(tree).toContainSource('data-setting-tree-end-spacer="true"');
    expect(tree).toContainSource('h-[var(--workbench-setting-tree-end-spacer-height)]');
    expect(stickyHook).toContainSource('navigationHeight - domainHeaderHeight - groupHeaderHeight - settingRowHeight');
    expect(stickyHook).toContainSource('navigationRef.current.scrollTop = 0');
  });
});
