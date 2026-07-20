import { fireEvent, screen } from '@testing-library/react';

import { readChapterEditorSource as readChapterEditorSourceFiles } from './chapterEditorSource.testUtils';

export const TEST_WORK_SETTING_STARTER_VERSION = '2026-06-25-foreshadow-fields-v1';

export const unlockSmartImportSettings = () => {
  fireEvent.click(screen.getByTitle('解锁智能导入设定'));
};

export const ensureLibraryGroupExpanded = (name: string | RegExp) => {
  const button = screen.getByRole('button', { name });
  if (button.getAttribute('aria-expanded') === 'false') fireEvent.click(button);
  return button;
};

export const readWorkbenchLibraryPanelSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const baseDir = dirname(fileURLToPath(import.meta.url));
  const files = [
    'WorkbenchLibraryPanel.tsx',
    'workbenchSettingLibraryBranch.tsx',
    'workbenchSettingLibraryView.tsx',
    'workbenchSettingLibraryWorkspaceView.tsx',
    'workbenchOutlineLibraryBranch.tsx',
    'OutlineWorkspaceView.tsx',
    'createOutlineControllerPhase1.tsx',
    'createOutlineControllerPhase2.tsx',
    'createOutlineControllerPhase3.tsx',
    '../hooks/useWorkbenchLibraryControllerPhase1.tsx',
    '../hooks/useWorkbenchLibraryControllerPhase2.tsx',
    '../hooks/useWorkbenchLibraryControllerPhase3.tsx',
    '../hooks/useWorkbenchLibraryControllerPhase4.tsx',
    '../hooks/useWorkbenchLibraryControllerPhase5.tsx',
    '../hooks/useWorkbenchLibraryControllerPhase6.tsx',
    '../hooks/useWorkbenchLibraryControllerPhase7.tsx',
    'workbenchBrainstormModals.tsx',
    'workbenchBrainstormState.ts',
    'workbenchBrainstormWorkspace.tsx',
    'workbenchDetailOutlineReaderModal.tsx',
    'workbenchDetailOutlineState.ts',
    'workbenchLibraryAiText.ts',
    'workbenchLibraryAiLogModal.tsx',
    'workbenchLibraryContextMenus.tsx',
    'workbenchLibraryConfirmDialogs.tsx',
    'workbenchLibraryDataState.ts',
    'workbenchLibraryDialogs.tsx',
    'workbenchLibraryDrag.ts',
    'workbenchLibraryHeaderTools.tsx',
    'workbenchLibrarySidebar.tsx',
    'workbenchOutlineAiLogModal.tsx',
    'workbenchFieldSizeSettingsModal.tsx',
    'workbenchLibraryMenuPosition.ts',
    '../model/workbenchLibraryPanelModel.ts',
    'workbenchLibraryRequestLog.tsx',
    'workbenchLibraryResizeHandles.tsx',
    'workbenchLibraryStorageState.ts',
    'workbenchLibraryTabs.ts',
    'workbenchOtherSettingReaderModal.tsx',
    'workbenchRoleContent.ts',
    'workbenchRoleEditor.tsx',
    'workbenchRoleHistoryModal.tsx',
    'workbenchRoleLibraryView.tsx',
    'workbenchRoleSidebar.tsx',
    'workbenchSettingEditor.tsx',
    'workbenchSimpleLibraryView.tsx',
    '../hooks/useWorkbenchLibraryFieldSizes.ts',
    '../hooks/useWorkbenchLibraryFontSizes.ts',
    '../hooks/useWorkbenchLibraryBackgroundTasks.ts',
    '../hooks/useWorkbenchLibraryDrag.ts',
    'workbenchLibraryOrdering.ts',
    'workbenchOutlinePreviewPane.tsx',
    'workbenchOutlineAiPanel.tsx',
    'workbenchSmartImport.ts',
    'workbenchStructuredSettings.ts',
    'workbenchStructuredSettingDefinitions.ts',
  ];

  return files.map((file) => readFileSync(join(baseDir, file), 'utf8')).join('\n\n');
};

export const readWorkbenchLibraryPanelEntrySource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'WorkbenchLibraryPanel.tsx'), 'utf8');
};

export const readWorkbenchSettingTaxonomySource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../model/workbenchSettingTaxonomy.ts'), 'utf8');
};

export const readWorkbenchSettingImportFormatPreviewSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchSettingImportFormatPreview.tsx'), 'utf8');
};

export const readWorkbenchStructuredSettingsSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  const baseDir = dirname(fileURLToPath(import.meta.url));
  return [
    readFileSync(join(baseDir, 'workbenchStructuredSettings.ts'), 'utf8'),
    readFileSync(join(baseDir, 'workbenchStructuredSettingDefinitions.ts'), 'utf8'),
  ].join('\n\n');
};

export const readWorkbenchRoleSettingFieldsSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchRoleSettingFields.ts'), 'utf8');
};

export const readWorkbenchRoleEditorSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchRoleEditor.tsx'), 'utf8');
};

export const readWorkbenchLibraryPanelConstantsSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchLibraryPanelConstants.ts'), 'utf8');
};

export const readWorkbenchLibrarySidebarSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchLibrarySidebar.tsx'), 'utf8');
};

export const readWorkbenchDetailOutlineReaderModalSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchDetailOutlineReaderModal.tsx'), 'utf8');
};

export const readWorkbenchOtherSettingReaderModalSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchOtherSettingReaderModal.tsx'), 'utf8');
};

export const readWorkbenchFieldSizeSettingsSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchFieldSizeSettings.tsx'), 'utf8');
};

export const readWorkbenchSettingSegmentedTabsSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchSettingSegmentedTabs.tsx'), 'utf8');
};

export const readSharedSegmentedTabsSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/SegmentedTabs.tsx'), 'utf8');
};

export const readWorkbenchLibraryAiLogShellSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchLibraryAiLogShell.tsx'), 'utf8');
};

export const readSharedAppModalShellSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/AppModalShell.tsx'), 'utf8');
};

export const readSharedStylesSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  const stylesDir = join(dirname(fileURLToPath(import.meta.url)), '../../../shared/styles/parts');
  return Array.from({ length: 12 }, (_, index) =>
    readFileSync(join(stylesDir, `part-${String(index + 1).padStart(2, '0')}.css`), 'utf8'),
  ).join('\n');
};

export const readCombinedAiConfigSelectSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/CombinedAiConfigSelect.tsx'),
    'utf8',
  );
};

export const readAiRequestLogGroupsSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/AiRequestLogGroups.tsx'),
    'utf8',
  );
};

export const readAiRequestLogModalLayoutSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/AiRequestLogModalLayout.tsx'),
    'utf8',
  );
};

export const readChapterNumberButtonSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/ChapterNumberButton.tsx'),
    'utf8',
  );
};

export const readCapsuleSelectSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/CapsuleSelect.tsx'), 'utf8');
};

export const readModelHookSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../models/hooks/useModels.ts'), 'utf8');
};

export const readChapterEditorSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  const baseDir = dirname(fileURLToPath(import.meta.url));
  return [
    readChapterEditorSourceFiles(),
    readFileSync(join(baseDir, '../model/chapterReviewLog.ts'), 'utf8'),
    readFileSync(join(baseDir, '../model/chapterReviewText.ts'), 'utf8'),
  ].join('\n\n');
};

export const readEditorToolModalsSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  const baseDir = dirname(fileURLToPath(import.meta.url));
  return [
    'EditorToolModals.tsx',
    'editorToolState.ts',
    'EditorToolModalShell.tsx',
    'EditorGenerateModals.tsx',
    'EditorAiGenerateModal.tsx',
    'EditorFontSettingsModal.tsx',
    'EditorSmartFormatModal.tsx',
    'EditorReplaceTools.tsx',
    'EditorHistoryModals.tsx',
  ]
    .map((file) => readFileSync(join(baseDir, file), 'utf8'))
    .join('\n\n');
};

export const readChapterSidebarSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'ChapterSidebar.tsx'), 'utf8');
};

export const readPublishedSidebarSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'PublishedSidebar.tsx'), 'utf8');
};

export const readWorkbenchAiPanelSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  const baseDir = dirname(fileURLToPath(import.meta.url));
  return [
    readFileSync(join(baseDir, 'WorkbenchAIPanel.tsx'), 'utf8'),
    readFileSync(join(baseDir, 'workbenchAiPanelSupport.tsx'), 'utf8'),
    readFileSync(join(baseDir, 'WorkbenchAiRequestLogModal.tsx'), 'utf8'),
    readFileSync(join(baseDir, 'WorkbenchAiConversationView.tsx'), 'utf8'),
    readFileSync(join(baseDir, 'WorkbenchAiConfigPanel.tsx'), 'utf8'),
  ].join('\n\n');
};

export const readAiInlineInputSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/AiInlineInput.tsx'), 'utf8');
};

export const readTestCollectionSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../../tests/pages/TestCollectionPage.tsx'),
    'utf8',
  );
};
