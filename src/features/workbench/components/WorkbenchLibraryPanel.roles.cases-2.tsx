import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { WorkbenchLibraryPanel } from './WorkbenchLibraryPanel';
import {
  TEST_WORK_SETTING_STARTER_VERSION,
  unlockSmartImportSettings,
  ensureLibraryGroupExpanded,
  readWorkbenchLibraryPanelSource,
  readWorkbenchStructuredSettingsSource,
  readWorkbenchRoleSettingFieldsSource,
  readWorkbenchRoleEditorSource,
  readWorkbenchRoleSidebarSource,
  readWorkbenchSettingTreeSidebarSource,
  readWorkbenchFieldSizeSettingsSource,
  readWorkbenchSettingSegmentedTabsSource,
  readSharedSegmentedTabsSource,
  readSharedStylesSource,
  readTestCollectionSource,
} from './WorkbenchLibraryPanel.testUtils';
describe('WorkbenchLibraryPanel role library flows', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('moves character editor scheme seven into production and retires the layout test page', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const roleSettingFieldsSource = await readWorkbenchRoleSettingFieldsSource();
    const fieldSizeSource = await readWorkbenchFieldSizeSettingsSource();
    const testCollectionSource = await readTestCollectionSource();
    const roleEditorSource = await readWorkbenchRoleEditorSource();
    const stylesSource = await readSharedStylesSource();

    expect(roleSettingFieldsSource).toContainSource('const ROLE_BASE_SETTING_FIELD_DEFINITIONS');
    expect(roleEditorSource).toContainSource('人物姓名');
    expect(fieldSizeSource).toContainSource('settingName: { width: 232, height: 56, fontSize: 18 }');
    expect(roleEditorSource).toContainSource('<WorkbenchNameField');
    expect(roleEditorSource).toContainSource('label="人物姓名"');
    expect(roleEditorSource).toContainSource('<WorkbenchHeaderSelect');
    expect(roleEditorSource).toContainSource('<WorkbenchSurvivalStatusToggle');
    expect(panelSource).toContainSource('aria-label={`${parseRoleContent(entry.content).lifeStatus}状态`}');
    expect(stylesSource).toContainSource('.xy-workbench-name-field {');
    expect(stylesSource).toContainSource('flex: 0 0 232px;');
    expect(stylesSource).toContainSource('width: 232px;');
    expect(stylesSource).toContainSource('min-width: 232px;');
    expect(stylesSource).toContainSource('height: 48px;');
    expect(stylesSource).toContainSource('.xy-setting-name-editor.xy-setting-editor-content-offset {');
    expect(stylesSource).toContainSource('padding-top: calc(23px + 2.25rem);');
    expect(stylesSource).toContainSource('.xy-workbench-name-field-caption {');
    expect(stylesSource).toContainSource('border-radius: 0.75rem;');
    expect(stylesSource).toContainSource('left: 24px;');
    expect(stylesSource).toContainSource('width: max-content;');
    expect(stylesSource).toContainSource('max-width: calc(100% - 48px);');
    expect(stylesSource).toContainSource('padding: 0 4px;');
    expect(stylesSource).toContainSource('font-size: 1rem;');
    expect(stylesSource).toContainSource('font-weight: 900;');
    expect(stylesSource).toContainSource('line-height: 24px;');
    expect(stylesSource).toContainSource('transform: translateY(-50%);');
    expect(roleEditorSource).toContainSource('text-base font-black leading-6 text-slate-950');
    expect(stylesSource).toContainSource('.xy-workbench-name-field-input {');
    expect(stylesSource).toContainSource('padding: 0 1.5rem 2px;');
    expect(stylesSource).toContainSource('font-size: 1rem;');
    expect(stylesSource).toContainSource('transition: none;');
    expect(roleSettingFieldsSource).toContainSource("title: '外貌'");
    expect(roleSettingFieldsSource).toContainSource("title: '称号/外号/别称'");
    expect(roleSettingFieldsSource).not.toContainSource("title: '角色定位'");
    expect(roleSettingFieldsSource).toContainSource("title: '性格'");
    expect(roleEditorSource).toContainSource('getPromptRoleFieldSections(role.type)');
    expect(roleSettingFieldsSource).toContainSource("title: '人物背景'");
    expect(roleSettingFieldsSource).toContainSource("title: '金手指/能力'");
    expect(roleSettingFieldsSource).toContainSource("key: 'appearance'");
    expect(roleSettingFieldsSource).toContainSource("key: 'aliasName'");
    expect(roleSettingFieldsSource).not.toContainSource("key: 'rolePosition'");
    expect(roleSettingFieldsSource).toContainSource("key: 'corePersonality'");
    expect(roleSettingFieldsSource).toContainSource("key: 'background'");
    expect(roleSettingFieldsSource).toContainSource("key: 'abilityRules'");
    expect(roleEditorSource).not.toContainSource('当前设定完整显示');
    expect(roleEditorSource).not.toContainSource('BASE_FIELD_GROUPS');
    expect(roleEditorSource).not.toContainSource('getSettingFieldPolicy');
    expect(roleEditorSource).toContainSource('getPromptRoleFieldSections(role.type)');
    expect(roleEditorSource).toContainSource('data-role-layout-section={section.title}');
    expect(roleEditorSource).toContainSource('resize-none border-0 bg-transparent');
    expect(roleEditorSource).toContainSource('pb-2 [scrollbar-gutter:stable] ${ROLE_FIELD_CONTENT_CLASS}');
    expect(roleEditorSource).toContainSource('<section className={WORKBENCH_SETTING_EDITOR_SCROLL_CLASS}>');
    expect(roleEditorSource).toContainSource("import { History } from 'lucide-react';");
    expect(roleEditorSource).toContainSource('title="字段记录"');
    expect(roleEditorSource).toContainSource('right-5 top-0 z-10 grid h-6 w-6 -translate-y-1/2');
    expect(roleEditorSource).toContainSource('text-[#08AACE]');
    expect(roleEditorSource).toContainSource('<History className="h-4 w-4" />');
    expect(roleEditorSource).not.toContainSource('字段记录 →');
    expect(roleEditorSource).toContainSource('<WorkbenchFieldRecordModal');
    expect(roleEditorSource).not.toContainSource('roleSettingTabs');
    expect(roleEditorSource).toContainSource('ROLE_FIELD_MAX_ROWS = 10');
    expect(roleEditorSource).toContainSource('const ROLE_FIELD_STANDARD_MIN_ROWS = 3');
    expect(testCollectionSource).not.toContainSource('CharacterSettingLayoutPlanTestPage');
    expect(testCollectionSource).not.toContainSource('/character-setting-layout-plan-test');
    expect(testCollectionSource).not.toContainSource('人物设定布局方案测试');
  });
  it('moves role-create dialog design C into production and retires test 08', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const testCollectionSource = await readTestCollectionSource();

    expect(panelSource).toContainSource("if (mode === 'setting' && itemLabel === '角色')");
    expect(panelSource).toContainSource('<RoleCreateDialog');
    expect(panelSource).toContainSource('<WorkbenchModal');
    expect(panelSource).toContainSource('widthClass="w-[420px]"');
    expect(panelSource).toContainSource('contentClassName="p-5"');
    expect(panelSource).toContainSource('新建角色');
    expect(panelSource).toContainSource('角色名字');
    expect(panelSource).toContainSource('placeholder="例如：萧炎"');
    expect(panelSource).toContainSource('确认创建');
    expect(panelSource).not.toContainSource('CHARACTER');
    expect(testCollectionSource).not.toContainSource('RoleCreateDialogDesignTestPage');
    expect(testCollectionSource).not.toContainSource('/role-create-dialog-design-test');
    expect(testCollectionSource).not.toContainSource('新建角色弹窗方案');
  });
  it('orders character setting cards in requested rows and auto-sizes textareas up to ten rows', async () => {
    const roleEditorSource = await readWorkbenchRoleEditorSource();

    expect(roleEditorSource).toContainSource('promptRoleSections.map((section)');
    expect(roleEditorSource).toContainSource('WORKBENCH_SETTING_EDITOR_TWO_COLUMN_GRID_CLASS');
    expect(roleEditorSource).toContainSource('section.fields.map(renderPromptField)');
    expect(roleEditorSource).toContainSource('ROLE_FIELD_MAX_ROWS = 10');
    expect(roleEditorSource).toContainSource('textarea.style.overflowY = textarea.scrollHeight > maxHeight ?');
    expect(roleEditorSource).toContainSource('w-full resize-none border-0 bg-transparent');
    expect(roleEditorSource).not.toContainSource('className="editor-scrollbar h-[116px] w-full resize-none');
  });
  it('uses only a blue outline for the selected role and retires test 16', async () => {
    const roleSidebarSource = await readWorkbenchRoleSidebarSource();
    const settingTreeSidebarSource = await readWorkbenchSettingTreeSidebarSource();
    const testCollectionSource = await readTestCollectionSource();

    expect(roleSidebarSource).toContainSource("? 'border-2 border-[#078FAE] bg-white text-gray-600'");
    expect(roleSidebarSource).not.toContainSource("? 'border-transparent xy-selected-mint-bg text-gray-900'");
    expect(settingTreeSidebarSource).toContainSource(
      '? `border-2 ${CHAPTER_NAV_SELECTED_BORDER_CLASS} bg-white text-slate-600`',
    );
    expect(settingTreeSidebarSource).toContainSource('const entrySelectionClass = selected');
    expect(settingTreeSidebarSource).not.toContainSource(
      "selected ? 'border-[#BDECF4] bg-[#EAF9FD] text-[#067F9A] ring-1 ring-inset ring-[#BDECF4]'",
    );
    expect(testCollectionSource).not.toContainSource('RoleTreeOutlineSelectionTestPage');
    expect(testCollectionSource).not.toContainSource('/role-tree-outline-selection-test');
    expect(testCollectionSource).not.toContainSource('人物导航仅蓝框选中态');
  });
});
