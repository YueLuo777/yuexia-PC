import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

const removedMarkedTests = [
  ['/border-backplate-application-test', 'BorderBackplateApplicationTestPage'],
  ['/workbench-soft-cyan-button-style-test', 'WorkbenchSoftCyanButtonStyleTestPage'],
  ['/workbench-surface-color-style-test', 'WorkbenchSurfaceColorStyleTestPage'],
  ['/setting-workspace-multi-layout-test', 'SettingWorkspaceMultiLayoutTestPage'],
  ['/workbench-right-panel-unified-test', 'WorkbenchRightPanelUnifiedTestPage'],
  ['/workbench-ai-request-tag-policy-test', 'WorkbenchAiRequestTagPolicyTestPage'],
  ['/workbench-flow-button-stats-test', 'WorkbenchFlowButtonStatsTestPage'],
  ['/workbench-sidebar-bold-navigation-test', 'WorkbenchSidebarBoldNavigationTestPage'],
  ['/workbench-flow-gray-selected-state-test', 'WorkbenchFlowGraySelectedStateTestPage'],
  ['/character-setting-layout-plan-test', 'CharacterSettingLayoutPlanTestPage'],
  ['/post-writing-workflow-plan-test', 'PostWritingWorkflowPlanTestPage'],
  ['/setting-workflow-optimization-test', 'SettingWorkflowOptimizationTestPage'],
  ['/setting-import-hierarchy-test', 'SettingImportHierarchyTestPage'],
  ['/setting-map-danger-layout-test', 'SettingMapDangerLayoutTestPage'],
  ['/setting-item-resource-status-layout-test', 'SettingItemResourceStatusLayoutTestPage'],
  ['/setting-other-link-picker-test', 'SettingOtherLinkPickerTestPage'],
  ['/setting-clear-context-menu-test', 'SettingClearContextMenuTestPage'],
  ['/prompt-dropdown-connected-style-test', 'PromptDropdownConnectedStyleTestPage'],
] as const;

describe('TestCollectionPage delete marked cleanup', () => {
  it('removes the currently delete-marked test entries and render branches', async () => {
    const source = await readFile(collectionPagePath, 'utf8');

    removedMarkedTests.forEach(([path, componentName]) => {
      expect(source).not.toContain(path);
      expect(source).not.toContain(componentName);
    });
  });

  it('keeps the completed-test bucket for checked test entries', async () => {
    const source = await readFile(collectionPagePath, 'utf8');

    [
      ['ReviewPreviewAnnotationSync', 'TestPage'].join(''),
      ['/review-preview-annotation-sync', '-test'].join(''),
    ].forEach((removedText) => {
      expect(source).not.toContain(removedText);
    });

    [
      ['TEST_COLLECTION_TESTED', '_PATHS_KEY'].join(''),
      ['readTested', 'TestPaths'].join(''),
      ['toggleTested', 'Test'].join(''),
      ['collection', 'Tab'].join(''),
      ['tested', 'TestPaths'].join(''),
      '\u5df2\u6d4b\u8bd5',
      '\u5f85\u6d4b\u8bd5',
      '\u6807\u8bb0\u5df2\u6d4b\u8bd5',
    ].forEach((requiredText) => {
      expect(source).toContain(requiredText);
    });
  });

  it('keeps the current test page and collection tab when marking a test as completed', async () => {
    const source = await readFile(collectionPagePath, 'utf8');
    const toggleBody = source.match(/const toggleTestedTest = \(path: string\) => \{([\s\S]*?)\n {2}\};/)?.[1] ?? '';

    expect(toggleBody).toContain('setTestedTestPaths');
    expect(toggleBody).not.toContain('setActivePath(null)');
    expect(toggleBody).not.toContain('setCollectionTab(');
  });

  it('prunes deleted test paths from the completed-test bucket', async () => {
    const source = await readFile(collectionPagePath, 'utf8');

    expect(source).toContain('const validTestPaths = new Set(testNumberByPath.keys());');
    expect(source).toContain("validTestPaths.has(item)");
    expect(source).toContain('localStorage.setItem(TEST_COLLECTION_TESTED_PATHS_KEY, JSON.stringify(validPaths));');
    expect(source).toContain('Array.from(current).filter((path) => validTestPaths.has(path))');
    expect(source).toContain('localStorage.setItem(TEST_COLLECTION_TESTED_PATHS_KEY, JSON.stringify(Array.from(next)));');
  });
});
