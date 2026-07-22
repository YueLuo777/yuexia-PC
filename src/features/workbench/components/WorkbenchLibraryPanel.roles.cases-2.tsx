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
    expect(stylesSource).toContainSource('padding-top: 12px !important;');
    expect(stylesSource).toContainSource('.xy-workbench-name-field-caption {');
    expect(stylesSource).toContainSource('left: 24px;');
    expect(stylesSource).toContainSource('width: max-content;');
    expect(stylesSource).toContainSource('max-width: calc(100% - 48px);');
    expect(stylesSource).toContainSource('padding: 0 4px;');
    expect(stylesSource).toContainSource('font-weight: 900;');
    expect(stylesSource).toContainSource('.xy-workbench-name-field-input {');
    expect(stylesSource).toContainSource('padding: 0 1rem 0 1.5rem;');
    expect(stylesSource).toContainSource('font-size: 1rem;');
    expect(stylesSource).toContainSource('transition: none;');
    expect(roleSettingFieldsSource).toContainSource("title: '外貌'");
    expect(roleSettingFieldsSource).toContainSource("title: '称号/外号/别称'");
    expect(roleSettingFieldsSource).not.toContainSource("title: '角色定位'");
    expect(roleSettingFieldsSource).toContainSource("title: '核心性格'");
    expect(roleSettingFieldsSource).toContainSource("title: '人物背景'");
    expect(roleSettingFieldsSource).toContainSource("title: '金手指/能力'");
    expect(roleSettingFieldsSource).toContainSource("key: 'appearance'");
    expect(roleSettingFieldsSource).toContainSource("key: 'aliasName'");
    expect(roleSettingFieldsSource).not.toContainSource("key: 'rolePosition'");
    expect(roleSettingFieldsSource).toContainSource("key: 'corePersonality'");
    expect(roleSettingFieldsSource).toContainSource("key: 'background'");
    expect(roleSettingFieldsSource).toContainSource("key: 'abilityRules'");
    expect(roleEditorSource).toContainSource('当前设定完整显示');
    expect(roleEditorSource).toContainSource('BASE_FIELD_GROUPS.map((group)');
    expect(roleEditorSource).toContainSource('getSettingFieldPolicy');
    expect(roleEditorSource).toContainSource('查看轨迹 →');
    expect(roleEditorSource).not.toContainSource('roleSettingTabs');
    expect(roleEditorSource).toContainSource('min-h-[150px]');
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
  it('stretches character setting cards to the available editor height like structured setting pages', async () => {
    const roleEditorSource = await readWorkbenchRoleEditorSource();

    expect(roleEditorSource).toContainSource('className="space-y-6"');
    expect(roleEditorSource).toContainSource('className="grid grid-cols-2 gap-3"');
    expect(roleEditorSource).toContainSource('min-h-[150px]');
    expect(roleEditorSource).toContainSource('min-h-[76px] flex-1 resize-none');
    expect(roleEditorSource).not.toContainSource('className="editor-scrollbar h-[116px] w-full resize-none');
  });
});
