import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { beforeEach, describe, expect, it } from 'vitest';

import { readChapterEditorSource } from '../components/chapterEditorSource.testUtils';

import {
  WORKBENCH_SHARED_LEFT_NAV_WIDTH_ENABLED_KEY,
  WORKBENCH_SHARED_LEFT_NAV_WIDTH_STORAGE_KEY,
  WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT,
  readSharedWorkbenchLeftNavWidth,
  writeSharedWorkbenchLeftNavWidthEnabled,
} from './workbenchSharedLeftNavWidth';
import {
  getSettingLibraryWidthStorageKey,
  persistSettingLibraryWidth,
  readSettingLibraryLeftWidth,
  resolveBrainstormLibraryLeftWidth,
} from '../components/workbenchLibraryStorageState';
import {
  readWorkbenchChapterSidebarWidth,
  readWorkbenchPublishedSidebarWidth,
} from '../components/workbenchPageSupport';
import { readWorkbenchLeftPanelWidth, REVIEW_PAGE_LEFT_WIDTH_LIMIT, STATUS_PAGE_LEFT_WIDTH_LIMIT } from '../components/chapterEditorLayout';
import {
  BRAINSTORM_TAB,
  DETAIL_OUTLINE_TAB,
  OUTLINE_LIBRARY_TAB,
  ROLE_TAB,
  SETTING_TAB,
} from '../components/workbenchLibraryTabs';

const sharedLeftWidthPath = resolve(process.cwd(), 'src/features/workbench/model/workbenchSharedLeftNavWidth.ts');
const workbenchPagePath = resolve(process.cwd(), 'src/features/workbench/pages/WorkbenchPage.tsx');
const workbenchLayoutWidthsPath = resolve(process.cwd(), 'src/features/workbench/hooks/useWorkbenchLayoutWidths.ts');
const workbenchModalHostPath = resolve(process.cwd(), 'src/features/workbench/components/WorkbenchPageModalHost.tsx');
const libraryStoragePath = resolve(process.cwd(), 'src/features/workbench/components/workbenchLibraryStorageState.ts');
const libraryPanelPath = resolve(process.cwd(), 'src/features/workbench/components/WorkbenchLibraryPanel.tsx');
const libraryControllerPath = resolve(
  process.cwd(),
  'src/features/workbench/hooks/useWorkbenchLibraryControllerPhase2.tsx',
);
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
      workbenchLayoutWidthsSource,
      libraryStorageSource,
      libraryPanelSource,
      chapterEditorSource,
      fieldSizeSettingsModalSource,
      navigationToggleSource,
      editorSettingsModalSource,
    ] = await Promise.all([
      readFile(sharedLeftWidthPath, 'utf8'),
      Promise.all([
        readFile(workbenchPagePath, 'utf8'),
        readFile(workbenchLayoutWidthsPath, 'utf8'),
        readFile(workbenchModalHostPath, 'utf8'),
      ]).then((parts) => parts.join('\n')),
      readFile(workbenchLayoutWidthsPath, 'utf8'),
      readFile(libraryStoragePath, 'utf8'),
      Promise.all([readFile(libraryPanelPath, 'utf8'), readFile(libraryControllerPath, 'utf8')]).then((parts) =>
        parts.join('\n'),
      ),
      Promise.resolve(readChapterEditorSource()),
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
    expect(sharedWidthSource).toContainSource('WORKBENCH_SHARED_LEFT_NAV_WIDTH_MIN = 200');
    expect(sharedWidthSource).toContainSource('WORKBENCH_SHARED_LEFT_NAV_WIDTH_MAX = 360');
    expect(sharedWidthSource).toContainSource('readSharedWorkbenchLeftNavWidthEnabled');
    expect(sharedWidthSource).toContainSource('writeSharedWorkbenchLeftNavWidthEnabled');
    expect(sharedWidthSource).toContainSource('options?: { width?: number; maxWidth?: number; minWidth?: number }');
    expect(sharedWidthSource).toContainSource('detail: typeof nextWidth ===');
    expect(sharedWidthSource).toContainSource('writeSharedWorkbenchLeftNavWidth');
    expect(sharedWidthSource).toContainSource(
      'window.dispatchEvent(new CustomEvent(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT',
    );
    expect(navigationToggleSource).toContainSource('readSharedWorkbenchLeftNavWidthEnabled');
    expect(navigationToggleSource).toContainSource('writeSharedWorkbenchLeftNavWidthEnabled(');
    expect(navigationToggleSource).toContainSource('width: readStoredChapterSidebarWidth()');
    expect(navigationToggleSource).toContainSource('readStoredChapterSidebarWidth()');
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
    expect(libraryStorageSource).toContainSource(
      'if (readSharedWorkbenchLeftNavWidthEnabled()) return readSharedWorkbenchLeftNavWidth();',
    );
    expect(libraryStorageSource).toContainSource('resolveBrainstormLibraryLeftWidth');
    expect(libraryPanelSource).toContainSource('WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT');
    expect(libraryPanelSource).toContainSource('readSharedWorkbenchLeftNavWidthEnabled()');
    expect(fieldSizeSettingsModalSource).toContainSource('WorkbenchNavigationWidthToggle');
    expect(fieldSizeSettingsModalSource).toContainSource('workbench_field_size_settings_compact_v2');
    expect(fieldSizeSettingsModalSource).toContainSource('defaultGeometry={{ x: 0, y: 0, width: 980, height: 560 }}');
    expect(fieldSizeSettingsModalSource).not.toContainSource('storageId="workbench_field_size_settings"');

    expect(chapterEditorSource).toContainSource('readSharedWorkbenchLeftNavWidth');
    expect(chapterEditorSource).toContainSource('writeSharedWorkbenchLeftNavWidth(value');
    expect(chapterEditorSource).toContainSource('WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT');
    expect(chapterEditorSource).toContainSource('readSharedWorkbenchLeftNavWidthEnabled()');
    expect(chapterEditorSource).toContainSource('WorkbenchNavigationWidthToggle');
    expect(workbenchLayoutWidthsSource).toContainSource('normalizeSharedWorkbenchLeftNavWidth');
    expect(workbenchLayoutWidthsSource).not.toContainSource('writeSharedWorkbenchLeftNavWidth(publishedSidebarWidth');
  });

  it('lets the setting library follow a narrower writing sidebar when shared navigation width is enabled', () => {
    localStorage.setItem(WORKBENCH_SHARED_LEFT_NAV_WIDTH_ENABLED_KEY, 'true');
    localStorage.setItem(WORKBENCH_SHARED_LEFT_NAV_WIDTH_STORAGE_KEY, '200');

    expect(readSettingLibraryLeftWidth('test-workbench', SETTING_TAB, 1)).toBe(200);
  });

  it('writes the current writing sidebar width atomically when enabling shared navigation width', async () => {
    const navigationToggleSource = await readFile(navigationTogglePath, 'utf8');

    expect(navigationToggleSource).not.toContainSource('writeSharedWorkbenchLeftNavWidth(');
    expect(navigationToggleSource).toContainSource('writeSharedWorkbenchLeftNavWidthEnabled(');
    expect(navigationToggleSource).toContainSource('width: readStoredChapterSidebarWidth()');
    expect(navigationToggleSource).toContainSource("localStorage.getItem(CHAPTER_SIDEBAR_WIDTH_STORAGE_KEY)");
  });

  it('lets setting navigation listeners read the writing sidebar width on the enable event', () => {
    localStorage.setItem('xinyuexia_chapter_sidebar_width', '200');
    localStorage.setItem(getSettingLibraryWidthStorageKey('test-workbench', SETTING_TAB, 'left'), '360');
    const observedWidths: number[] = [];
    const listener = () => {
      if (!localStorage.getItem(WORKBENCH_SHARED_LEFT_NAV_WIDTH_ENABLED_KEY)) return;
      observedWidths.push(readSettingLibraryLeftWidth('test-workbench', SETTING_TAB, 1));
    };
    window.addEventListener(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT, listener);

    writeSharedWorkbenchLeftNavWidthEnabled(true, { width: 200, maxWidth: 420, minWidth: 200 });

    window.removeEventListener(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT, listener);
    expect(localStorage.getItem(WORKBENCH_SHARED_LEFT_NAV_WIDTH_STORAGE_KEY)).toBe('200');
    expect(observedWidths).toEqual([200]);
  });

  it('lets the published sidebar follow the shared navigation width when unified is enabled', () => {
    localStorage.setItem(WORKBENCH_SHARED_LEFT_NAV_WIDTH_ENABLED_KEY, 'true');
    localStorage.setItem(WORKBENCH_SHARED_LEFT_NAV_WIDTH_STORAGE_KEY, '260');
    localStorage.setItem('xinyuexia_published_sidebar_width', '310');

    expect(readWorkbenchPublishedSidebarWidth()).toBe(260);
  });

  it('returns the same shared width for the main workbench navigation surfaces', () => {
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { value: 2000, configurable: true });
    localStorage.setItem(WORKBENCH_SHARED_LEFT_NAV_WIDTH_ENABLED_KEY, 'true');
    localStorage.setItem(WORKBENCH_SHARED_LEFT_NAV_WIDTH_STORAGE_KEY, '200');
    localStorage.setItem('xinyuexia_chapter_sidebar_width', '200');
    localStorage.setItem('xinyuexia_published_sidebar_width', '360');
    localStorage.setItem(getSettingLibraryWidthStorageKey('test-workbench', SETTING_TAB, 'left'), '180');
    localStorage.setItem('xinyuexia_chapter_editor_review_left_width', '180');
    localStorage.setItem('xinyuexia_chapter_editor_status_left_width', '190');

    try {
      expect(readSharedWorkbenchLeftNavWidth()).toBe(200);
      expect(readWorkbenchChapterSidebarWidth()).toBe(200);
      expect(readWorkbenchPublishedSidebarWidth()).toBe(200);
      for (const tab of [BRAINSTORM_TAB, SETTING_TAB, ROLE_TAB, DETAIL_OUTLINE_TAB, OUTLINE_LIBRARY_TAB]) {
        expect(readSettingLibraryLeftWidth('test-workbench', tab, 1)).toBe(200);
      }
      expect(readWorkbenchLeftPanelWidth('xinyuexia_chapter_editor_review_left_width', 180, REVIEW_PAGE_LEFT_WIDTH_LIMIT)).toBe(200);
      expect(readWorkbenchLeftPanelWidth('xinyuexia_chapter_editor_status_left_width', 190, STATUS_PAGE_LEFT_WIDTH_LIMIT)).toBe(200);
    } finally {
      Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true });
    }
  });

  it('keeps a drag from any library page inside the shared range without page-specific caps', () => {
    localStorage.setItem(WORKBENCH_SHARED_LEFT_NAV_WIDTH_ENABLED_KEY, 'true');
    persistSettingLibraryWidth('test-workbench', BRAINSTORM_TAB, 'left', 340);

    expect(readSharedWorkbenchLeftNavWidth()).toBe(340);
    expect(resolveBrainstormLibraryLeftWidth(340)).toBe(340);
    for (const tab of [BRAINSTORM_TAB, SETTING_TAB, ROLE_TAB, DETAIL_OUTLINE_TAB, OUTLINE_LIBRARY_TAB]) {
      expect(readSettingLibraryLeftWidth('test-workbench', tab, 1)).toBe(340);
    }
  });
});
