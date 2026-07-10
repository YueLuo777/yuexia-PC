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
const fieldSizeSettingsModalPath = resolve(
  process.cwd(),
  'src/features/workbench/components/workbenchFieldSizeSettingsModal.tsx',
);
const navigationTogglePath = resolve(
  process.cwd(),
  'src/features/workbench/components/WorkbenchNavigationWidthToggle.tsx',
);
const editorSettingsModalPath = resolve(
  process.cwd(),
  'src/features/workbench/components/WorkbenchEditorSettingsModal.tsx',
);

describe('shared workbench left navigation width', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('uses one optional shared width across writing, library, review and status pages', async () => {
    const [
      sharedWidthSource,
      workbenchPageSource,
      libraryStorageSource,
      libraryPanelSource,
      chapterEditorSource,
      fieldSizeSettingsModalSource,
      navigationToggleSource,
      editorSettingsModalSource,
    ] = await Promise.all([
      readFile(sharedLeftWidthPath, 'utf8'),
      readFile(workbenchPagePath, 'utf8'),
      readFile(libraryStoragePath, 'utf8'),
      readFile(libraryPanelPath, 'utf8'),
      readFile(chapterEditorPath, 'utf8'),
      readFile(fieldSizeSettingsModalPath, 'utf8'),
      readFile(navigationTogglePath, 'utf8'),
      readFile(editorSettingsModalPath, 'utf8'),
    ]);

    expect(sharedWidthSource).toContainSource(
      "WORKBENCH_SHARED_LEFT_NAV_WIDTH_STORAGE_KEY = 'xinyuexia_workbench_left_nav_width'",
    );
    expect(sharedWidthSource).toContainSource(
      "WORKBENCH_SHARED_LEFT_NAV_WIDTH_ENABLED_KEY = 'xinyuexia_workbench_left_nav_width_unified'",
    );
    expect(sharedWidthSource).toContainSource(
      "WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT = 'xinyuexia:workbench-shared-left-nav-width'",
    );
    expect(sharedWidthSource).toContainSource('WORKBENCH_SHARED_LEFT_NAV_WIDTH_MIN = 180');
    expect(sharedWidthSource).toContainSource('readSharedWorkbenchLeftNavWidthEnabled');
    expect(sharedWidthSource).toContainSource('writeSharedWorkbenchLeftNavWidthEnabled');
    expect(sharedWidthSource).toContainSource('writeSharedWorkbenchLeftNavWidth');
    expect(sharedWidthSource).toContainSource(
      'window.dispatchEvent(new CustomEvent(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT',
    );
    expect(navigationToggleSource).toContainSource('readSharedWorkbenchLeftNavWidthEnabled');
    expect(navigationToggleSource).toContainSource('writeSharedWorkbenchLeftNavWidthEnabled');
    expect(navigationToggleSource).toContainSource('导航宽度统一');
    expect(navigationToggleSource).toContainSource('window.addEventListener(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT');

    expect(workbenchPageSource).toContainSource('readSharedWorkbenchLeftNavWidthEnabled');
    expect(workbenchPageSource).toContainSource('writeSharedWorkbenchLeftNavWidth(chapterSidebarWidth');
    expect(workbenchPageSource).toContainSource('WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT');
    expect(workbenchPageSource).toContainSource('WorkbenchEditorSettingsModal');
    expect(editorSettingsModalSource).toContainSource('WorkbenchNavigationWidthToggle');
    expect(workbenchPageSource).toContainSource(
      "activeCreationFlow === 'writing' || FIELD_SIZE_FLOW_IDS.has(activeCreationFlow)",
    );

    expect(libraryStorageSource).toContainSource('readSharedWorkbenchLeftNavWidth');
    expect(libraryStorageSource).toContainSource('writeSharedWorkbenchLeftNavWidth(');
    expect(libraryStorageSource).toContainSource('readSharedWorkbenchLeftNavWidthEnabled');
    expect(libraryPanelSource).toContainSource('WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT');
    expect(libraryPanelSource).toContainSource('readSharedWorkbenchLeftNavWidthEnabled()');
    expect(fieldSizeSettingsModalSource).toContainSource('WorkbenchNavigationWidthToggle');

    expect(chapterEditorSource).toContainSource('readSharedWorkbenchLeftNavWidth');
    expect(chapterEditorSource).toContainSource('writeSharedWorkbenchLeftNavWidth(value');
    expect(chapterEditorSource).toContainSource('WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT');
    expect(chapterEditorSource).toContainSource('readSharedWorkbenchLeftNavWidthEnabled()');
    expect(chapterEditorSource).toContainSource('WorkbenchNavigationWidthToggle');
  });

  it('lets the setting library follow a narrower writing sidebar when shared navigation width is enabled', () => {
    localStorage.setItem(WORKBENCH_SHARED_LEFT_NAV_WIDTH_ENABLED_KEY, 'true');
    localStorage.setItem(WORKBENCH_SHARED_LEFT_NAV_WIDTH_STORAGE_KEY, '200');

    expect(readSettingLibraryLeftWidth('test-workbench', SETTING_TAB, 1)).toBe(200);
  });
});
