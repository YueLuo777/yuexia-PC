import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { beforeEach, describe, expect, it } from 'vitest';

import {
  WORKBENCH_SHARED_LEFT_NAV_WIDTH_ENABLED_KEY,
  WORKBENCH_SHARED_LEFT_NAV_WIDTH_STORAGE_KEY,
} from './workbenchSharedLeftNavWidth';
import { readSettingLibraryLeftWidth } from '../components/workbenchLibraryStorageState';
import { SETTING_TAB } from '../components/workbenchLibraryTabs';

const sharedLeftWidthPath = resolve(process.cwd(), 'src/features/workbench/model/workbenchSharedLeftNavWidth.ts');
const workbenchPagePath = resolve(process.cwd(), 'src/features/workbench/pages/WorkbenchPage.tsx');
const libraryStoragePath = resolve(process.cwd(), 'src/features/workbench/components/workbenchLibraryStorageState.ts');
const libraryPanelPath = resolve(process.cwd(), 'src/features/workbench/components/WorkbenchLibraryPanel.tsx');
const chapterEditorPath = resolve(process.cwd(), 'src/features/workbench/components/ChapterEditor.tsx');
const fieldSizeSettingsModalPath = resolve(process.cwd(), 'src/features/workbench/components/workbenchFieldSizeSettingsModal.tsx');
const navigationTogglePath = resolve(process.cwd(), 'src/features/workbench/components/WorkbenchNavigationWidthToggle.tsx');

describe('shared workbench left navigation width', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('uses one optional shared width across writing, library, review and status pages', async () => {
    const [sharedWidthSource, workbenchPageSource, libraryStorageSource, libraryPanelSource, chapterEditorSource, fieldSizeSettingsModalSource, navigationToggleSource] = await Promise.all([
      readFile(sharedLeftWidthPath, 'utf8'),
      readFile(workbenchPagePath, 'utf8'),
      readFile(libraryStoragePath, 'utf8'),
      readFile(libraryPanelPath, 'utf8'),
      readFile(chapterEditorPath, 'utf8'),
      readFile(fieldSizeSettingsModalPath, 'utf8'),
      readFile(navigationTogglePath, 'utf8'),
    ]);

    expect(sharedWidthSource).toContain("WORKBENCH_SHARED_LEFT_NAV_WIDTH_STORAGE_KEY = 'xinyuexia_workbench_left_nav_width'");
    expect(sharedWidthSource).toContain("WORKBENCH_SHARED_LEFT_NAV_WIDTH_ENABLED_KEY = 'xinyuexia_workbench_left_nav_width_unified'");
    expect(sharedWidthSource).toContain("WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT = 'xinyuexia:workbench-shared-left-nav-width'");
    expect(sharedWidthSource).toContain('WORKBENCH_SHARED_LEFT_NAV_WIDTH_MIN = 180');
    expect(sharedWidthSource).toContain('readSharedWorkbenchLeftNavWidthEnabled');
    expect(sharedWidthSource).toContain('writeSharedWorkbenchLeftNavWidthEnabled');
    expect(sharedWidthSource).toContain('writeSharedWorkbenchLeftNavWidth');
    expect(sharedWidthSource).toContain('window.dispatchEvent(new CustomEvent(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT');
    expect(navigationToggleSource).toContain('readSharedWorkbenchLeftNavWidthEnabled');
    expect(navigationToggleSource).toContain('writeSharedWorkbenchLeftNavWidthEnabled');
    expect(navigationToggleSource).toContain('导航宽度统一');
    expect(navigationToggleSource).toContain('window.addEventListener(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT');

    expect(workbenchPageSource).toContain('readSharedWorkbenchLeftNavWidthEnabled');
    expect(workbenchPageSource).toContain('writeSharedWorkbenchLeftNavWidth(chapterSidebarWidth');
    expect(workbenchPageSource).toContain('WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT');
    expect(workbenchPageSource).toContain('WorkbenchNavigationWidthToggle');
    expect(workbenchPageSource).toContain("activeCreationFlow === 'writing' || FIELD_SIZE_FLOW_IDS.has(activeCreationFlow)");

    expect(libraryStorageSource).toContain('readSharedWorkbenchLeftNavWidth');
    expect(libraryStorageSource).toContain('writeSharedWorkbenchLeftNavWidth(');
    expect(libraryStorageSource).toContain('readSharedWorkbenchLeftNavWidthEnabled');
    expect(libraryPanelSource).toContain('WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT');
    expect(libraryPanelSource).toContain('readSharedWorkbenchLeftNavWidthEnabled()');
    expect(fieldSizeSettingsModalSource).toContain('WorkbenchNavigationWidthToggle');

    expect(chapterEditorSource).toContain('readSharedWorkbenchLeftNavWidth');
    expect(chapterEditorSource).toContain('writeSharedWorkbenchLeftNavWidth(value');
    expect(chapterEditorSource).toContain('WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT');
    expect(chapterEditorSource).toContain('readSharedWorkbenchLeftNavWidthEnabled()');
    expect(chapterEditorSource).toContain('WorkbenchNavigationWidthToggle');
  });

  it('lets the setting library follow a narrower writing sidebar when shared navigation width is enabled', () => {
    localStorage.setItem(WORKBENCH_SHARED_LEFT_NAV_WIDTH_ENABLED_KEY, 'true');
    localStorage.setItem(WORKBENCH_SHARED_LEFT_NAV_WIDTH_STORAGE_KEY, '200');

    expect(readSettingLibraryLeftWidth('test-workbench', SETTING_TAB, 1)).toBe(200);
  });
});
