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
