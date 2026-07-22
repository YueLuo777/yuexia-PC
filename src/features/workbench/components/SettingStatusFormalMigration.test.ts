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

    expect(roleEditor).toContain('当前设定完整显示');
    expect(roleEditor).not.toContain('roleSettingTabs');
    expect(roleEditor).not.toContain("['基础设定', '状态设定', '未确认']");
    expect(settingEditor).toContain('groups.map((group)');
    expect(settingEditor).not.toContain('SettingSegmentedTabs');
    expect(settingEditor).not.toContain('STRUCTURED_SETTING_TABS');
  });

  it('mounts the setting/status switch in the formal right AI panel', () => {
    const view = read('src/features/workbench/components/workbenchSettingLibraryView.tsx');
    expect(view).toContain('WorkbenchSettingPanelTabs');
    expect(view).toContain('WorkbenchSettingStatusPanel');
    expect(view).toContain("updateActiveTabConfig({ settingPanelMode: mode })");
    expect(read('src/features/workbench/pages/WorkbenchPage.tsx')).toContain('useWorkbenchStatusFlowNavigation');
  });

  it('removes the temporary fusion test after formal migration', () => {
    const collection = read('src/features/tests/pages/TestCollectionPage.tsx');
    expect(collection).not.toContain('SettingStatusFusionTestPage');
    expect(collection).not.toContain('/setting-status-fusion-test');
  });
});
