import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('formal workbench library version-two consistency', () => {
  it('shares search, folder, entry and create-area geometry across all libraries', () => {
    const role = readSource('src/features/workbench/components/workbenchRoleSidebar.tsx');
    const setting = readSource('src/features/workbench/components/workbenchLibrarySidebar.tsx');
    const simple = readSource('src/features/workbench/components/workbenchSimpleLibraryView.tsx');
    const constants = readSource('src/features/workbench/components/workbenchLibraryPanelConstants.ts');

    expect(role).toContainSource('aria-label="搜索人物"');
    expect(setting).toContainSource('aria-label="搜索资料"');
    expect(simple).toContainSource('aria-label={`搜索${activeTab}`}');
    for (const source of [role, setting, simple]) {
      expect(source).toContainSource('WORKBENCH_FOLDER_GROUP_BUTTON_CLASS');
      expect(source).toContainSource('WORKBENCH_LIBRARY_ENTRY_BUTTON_CLASS');
      expect(source).toContainSource('rounded-[22px] border border-slate-200 bg-white');
    }
    expect(constants).toContainSource('export const SETTING_LIBRARY_LEFT_MIN_WIDTH = 180;');
    expect(constants).toContainSource('export const SETTING_LIBRARY_LEFT_WIDTH = 280;');
    expect(constants).toContainSource('export const SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH = 280;');
  });

  it('moves the approved test into production and retires the temporary test entry', () => {
    const collection = readSource('src/features/tests/pages/TestCollectionPage.tsx');
    expect(collection).not.toContainSource('UnifiedWorkbenchLibraryV2TestPage');
    expect(collection).not.toContainSource('/unified-workbench-library-v2-test');
  });
});
