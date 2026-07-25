import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

function read(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

describe('formal setting and status workspace migration', () => {
  it('keeps all person and structured setting fields visible without base/status page tabs', () => {
    const roleEditor = read('src/features/workbench/components/workbenchRoleEditor.tsx');
    const settingEditor = read('src/features/workbench/components/workbenchSettingEditor.tsx');

    expect(roleEditor).not.toContain('当前设定完整显示');
    expect(roleEditor).not.toContain('getSettingFieldPolicy');
    expect(roleEditor).not.toContain('BASE_FIELD_GROUPS');
    expect(roleEditor).not.toContain('roleSettingTabs');
    expect(roleEditor).not.toContain("['基础设定', '状态设定', '未确认']");
    expect(settingEditor).toContain('groups.map((group)');
    expect(settingEditor).not.toContain('SettingSegmentedTabs');
    expect(settingEditor).not.toContain('STRUCTURED_SETTING_TABS');
  });

  it('mounts the setting/status switch above the middle editor and keeps status content in the right panel', () => {
    const view = read('src/features/workbench/components/workbenchSettingLibraryView.tsx');
    const workspace = read('src/features/workbench/components/workbenchSettingLibraryWorkspaceView.tsx');
    const statusPanel = read('src/features/workbench/components/WorkbenchSettingStatusPanel.tsx');
    expect(workspace).toContain('WorkbenchSettingPanelTabs');
    expect(workspace).toContain('justify-end border-b border-slate-100');
    expect(view).not.toContain('<WorkbenchSettingPanelTabs');
    expect(view).toContain('WorkbenchSettingStatusPanel');
    expect(workspace).toContain("updateActiveTabConfig({ settingPanelMode: mode })");
    expect(read('src/features/workbench/pages/WorkbenchPage.tsx')).toContain('useWorkbenchStatusFlowNavigation');
    expect(statusPanel).not.toContain('已自动匹配');
    expect(statusPanel).not.toContain('状态分析不要求预先手动关联');
    expect(statusPanel).toContain('flex h-full min-h-0 flex-1 flex-col');
    expect(statusPanel).toContain('editor-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto pr-1 [scrollbar-gutter:stable]');
    expect(statusPanel).toContain('shrink-0 border-t border-slate-200 bg-gray-50 pb-1 pt-4');
    expect(statusPanel).toContain('h-14 w-full rounded-2xl bg-[#08AACE] text-base font-black');
    expect(statusPanel).toContain('grid grid-cols-1 gap-3 text-center text-sm font-black');
    expect(statusPanel).not.toContain('历史状态');
    expect(statusPanel).not.toContain('历史变化');
    expect(statusPanel).not.toContain('当前字段暂无历史变化');
  });

  it('removes the temporary fusion test after formal migration', () => {
    const collection = read('src/features/tests/pages/TestCollectionPage.tsx');
    expect(collection).not.toContain('SettingStatusFusionTestPage');
    expect(collection).not.toContain('/setting-status-fusion-test');
  });
});
