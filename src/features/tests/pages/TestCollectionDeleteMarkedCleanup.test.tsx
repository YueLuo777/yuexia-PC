import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');
const testedStateHookPath = resolve(
  process.cwd(),
  'src/features/tests/hooks/useTestCollectionTestedState.ts',
);
const testedStatePath = resolve(process.cwd(), 'src/features/tests/model/testCollectionTestedState.ts');

const removedMarkedTests = [
  ['/standard-mode-workbench-test', 'StandardModeWorkbenchTestPage'],
  ['/mode-switch-novel-library-test', 'ModeSwitchNovelLibraryTestPage'],
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
  ['/chapter-sidebar-compact-title-test', 'ChapterSidebarCompactTitleTestPage'],
  ['/setting-tab-placement-options-test', 'SettingTabPlacementOptionsTestPage'],
  ['/workbench-header-fixed-flow-position-test', 'WorkbenchHeaderFixedFlowPositionTestPage'],
  ['/send-icon-stroke-color-test', 'SendIconStrokeColorTestPage'],
  ['/structure-audit-result-preview-test', 'StructureAuditResultPreviewTestPage'],
  ['/review-preview-width-mode-test', 'ReviewPreviewWidthModeTestPage'],
  ['/workbench-ai-width-unified-preview-test', 'WorkbenchAiWidthUnifiedPreviewTestPage'],
  ['/setting-entry-merge-plan-test', 'SettingEntryMergePlanTestPage'],
  ['/workbench-creation-chain-test', 'WorkbenchCreationChainTestPage'],
  ['/dark-console-style-preview-test', 'DarkConsoleStylePreviewTestPage'],
  ['/paper-workbench-style-preview-test', 'PaperWorkbenchStylePreviewTestPage'],
  ['/editor-paper-baseline-grid-test', 'EditorPaperBaselineGridTestPage'],
  ['/setting-state-structure-plan-test', 'SettingStateStructurePlanTestPage'],
  ['/review-comparison-centering-test', 'ReviewComparisonCenteringTestPage'],
  ['/hotspot-layout-preview-test', 'HotspotLayoutPreviewTestPage'],
  ['/prompt-audit-badge-layout-test', 'PromptAuditBadgeLayoutTestPage'],
  ['/clean-writer-style-preview-test', 'CleanWriterStylePreviewTestPage'],
  ['/workbench-ai-right-width-preview-test', 'WorkbenchAiRightWidthPreviewTestPage'],
  ['/shuimo-selection-state-preview-test', 'ShuimoSelectionStatePreviewTestPage'],
  ['/shuimo-sidebar-scheme-preview-test', 'ShuimoSidebarSchemePreviewTestPage'],
  ['/shuimo-semantic-palette-preview-test', 'ShuimoSemanticPalettePreviewTestPage'],
  ['/genre-iteration-moonfall-style-test', 'GenreIterationMoonfallStyleTestPage'],
  ['/audit-prompt-select-grouping-test', 'AuditPromptSelectGroupingTestPage'],
  ['/novel-library-toolbar-layout-test', 'NovelLibraryToolbarLayoutTestPage'],
  ['/text-audit-continuous-context-test', 'TextAuditContinuousContextTestPage'],
  ['/novel-card-menu-design-test', 'NovelCardMenuDesignTestPage'],
  ['/audit-prompt-compact-editor-test', 'AuditPromptCompactEditorTestPage'],
  ['/identity-position-variants-test', 'IdentityPositionVariantsTestPage'],
  ['/setting-tree-navigation-test', 'SettingTreeNavigationTestPage'],
  ['/ui-consistency-audit-test', 'UiConsistencyAuditTestPage'],
  ['/setting-embedded-text-sync-candidates-test', 'SettingEmbeddedTextSyncCandidatesTestPage'],
  ['/brainstorm-typography-consistency-test', 'BrainstormTypographyConsistencyTestPage'],
  ['/setting-editor-top-spacing-test', 'SettingEditorTopSpacingTestPage'],
  ['/role-tree-outline-selection-test', 'RoleTreeOutlineSelectionTestPage'],
  ['/text-audit-paragraph-selection-test', 'TextAuditParagraphSelectionTestPage'],
  ['/setting-editor-five-pixel-lift-test', 'SettingEditorFivePixelLiftTestPage'],
  ['/chapter-navigation-hierarchy-test', 'ChapterNavigationHierarchyTestPage'],
  ['/review-paragraph-spacing-test', 'ReviewParagraphSpacingTestPage'],
  ['/setting-navigation-sticky-hierarchy-test', 'SettingNavigationStickyHierarchyTestPage'],
  ['/prompt-based-setting-taxonomy-test', 'PromptBasedSettingTaxonomyTestPage'],
  ['/audit-prompt-select-soft-grouping-test', 'AuditPromptSelectSoftGroupingTestPage'],
  ['/workbench-flow-tabs-spacing-test', 'WorkbenchFlowTabsSpacingTestPage'],
  ['/settings-hierarchy-design-test', 'SettingsHierarchyDesignTestPage'],
  ['/genre-iteration-test', 'GenreIterationPage'],
  ['/ai-panel-visual-consistency-test', 'AiPanelVisualConsistencyTestPage'],
  ['/compact-library-form-test', 'CompactLibraryFormTestPage'],
  ['/setting-name-width-design-test', 'SettingNameWidthDesignTestPage'],
  ['/role-field-sizing-layout-test', 'RoleFieldSizingLayoutTestPage'],
  ['/setting-embedded-border-original-compare-test', 'SettingEmbeddedBorderOriginalCompareTestPage'],
  ['/role-survival-status-design-test', 'RoleSurvivalStatusDesignTestPage'],
  ['/setting-field-history-actions-layout-test', 'SettingFieldHistoryActionsLayoutTestPage'],
  ['/navigation-context-menu-prototype-test', 'NavigationContextMenuPrototypeTestPage'],
  ['/post-audit-status-update-test', 'PostAuditStatusUpdateTestPage'],
  ['/text-audit-review-workbench-test', 'TextAuditReviewWorkbenchTestPage'],
  ['/text-audit-diff-display-test', 'TextAuditDiffDisplayTestPage'],
  ['/standard-mode-smart-setting-flow-test', 'StandardModeSmartSettingFlowTestPage'],
] as const;

describe('TestCollectionPage delete marked cleanup', () => {
  it('removes the currently delete-marked test entries and render branches', async () => {
    const source = await readFile(collectionPagePath, 'utf8');

    removedMarkedTests.forEach(([path, componentName]) => {
      expect(source).not.toContainSource(path);
      expect(source).not.toContainSource(componentName);
    });
  });

  it('keeps the completed-test bucket for checked test entries', async () => {
    const source = await readFile(collectionPagePath, 'utf8');
    const testedStateHookSource = await readFile(testedStateHookPath, 'utf8');
    const testedStateSource = await readFile(testedStatePath, 'utf8');
    const combinedSource = `${source}\n${testedStateHookSource}\n${testedStateSource}`;

    [
      ['ReviewPreviewAnnotationSync', 'TestPage'].join(''),
      ['/review-preview-annotation-sync', '-test'].join(''),
    ].forEach((removedText) => {
      expect(source).not.toContainSource(removedText);
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
      expect(combinedSource).toContainSource(requiredText);
    });
  });

  it('keeps the current test page and collection tab when marking a test as completed', async () => {
    const testedStateHookSource = await readFile(testedStateHookPath, 'utf8');
    const toggleBody =
      testedStateHookSource.match(/const toggleTestedTest = \(path: string\) => \{([\s\S]*?)\n {2}\};/)?.[1] ?? '';

    expect(toggleBody).toContainSource('setTestedTestPaths');
    expect(toggleBody).not.toContainSource('setActivePath(null)');
    expect(toggleBody).not.toContainSource('setCollectionTab(');
  });

  it('does not show check icons for untested items through theme text color overrides', async () => {
    const source = await readFile(collectionPagePath, 'utf8');

    expect(source).not.toContainSource('text-transparent');
    expect(source).toContainSource('testedTestPaths.has(activePath) ? <Check className="h-3 w-3" /> : null');
    expect(source).toContainSource('isTested ? <Check className="h-4 w-4" /> : null');
  });

  it('prunes deleted test paths from the completed-test bucket', async () => {
    const source = await readFile(collectionPagePath, 'utf8');
    const testedStateHookSource = await readFile(testedStateHookPath, 'utf8');
    const testedStateSource = await readFile(testedStatePath, 'utf8');

    expect(source).toContainSource('const validTestPaths = new Set(testNumberByPath.keys());');
    expect(testedStateSource).toContainSource('validPaths.has(item)');
    expect(testedStateSource).toContainSource('writeTestedTestPaths(paths)');
    expect(testedStateHookSource).toContainSource(
      'Array.from(current).filter((path) => validTestPaths.has(path))',
    );
    expect(testedStateHookSource).toContainSource('writeTestedTestPaths(next)');
  });
});
