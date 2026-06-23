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
] as const;

describe('TestCollectionPage delete marked cleanup', () => {
  it('removes the currently delete-marked test entries and render branches', async () => {
    const source = await readFile(collectionPagePath, 'utf8');

    removedMarkedTests.forEach(([path, componentName]) => {
      expect(source).not.toContain(path);
      expect(source).not.toContain(componentName);
    });
  });

  it('removes the completed-test bucket and the migrated 15th review sync test', async () => {
    const source = await readFile(collectionPagePath, 'utf8');

    [
      ['ReviewPreviewAnnotationSync', 'TestPage'].join(''),
      ['/review-preview-annotation-sync', '-test'].join(''),
      ['TEST_COLLECTION_TESTED', '_PATHS_KEY'].join(''),
      ['readTested', 'TestPaths'].join(''),
      ['toggleTested', 'Test'].join(''),
      ['collection', 'Tab'].join(''),
      ['tested', 'TestPaths'].join(''),
      '\u5df2\u6d4b\u8bd5',
      '\u5f85\u6d4b\u8bd5',
      '\u6807\u8bb0\u5df2\u6d4b\u8bd5',
    ].forEach((removedText) => {
      expect(source).not.toContain(removedText);
    });
  });
});
