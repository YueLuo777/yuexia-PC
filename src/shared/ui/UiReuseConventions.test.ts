import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');

describe('shared UI reuse conventions', () => {
  it('provides reusable entrypoints for action buttons, settings surfaces, and UI preferences', () => {
    const actionButtonSource = readSource('ActionButton.tsx');
    const capsuleSelectSource = readSource('CapsuleSelect.tsx');
    const combinedAiConfigSelectSource = readSource('CombinedAiConfigSelect.tsx');
    const buttonClassesSource = readSource('actionButtonClasses.ts');
    const formDialogSource = readSource('FormDialog.tsx');
    const emptyStateSource = readSource('EmptyState.tsx');
    const settingsSurfaceSource = readSource('SettingsSurface.tsx');
    const settingsPageSource = readSource('../settings/SettingsPage.tsx');
    const testCollectionSource = readSource('../../features/tests/pages/TestCollectionPage.tsx');
    const aiConfigConsumers = [
      '../../features/genre-iteration/components/GenreIterationWorkbench.tsx',
      '../../features/workbench/components/ChapterReviewAiPanel.tsx',
      '../../features/workbench/components/ChapterStatusPanel.tsx',
      '../../features/workbench/components/OutlineWorkspaceView.tsx',
      '../../features/workbench/components/WorkbenchAiConfigPanel.tsx',
      '../../features/tests/pages/TomatoGenreIterationTestPageView.tsx',
      '../../features/workbench/components/workbenchOutlineAiPanel.tsx',
      '../../features/workbench/components/workbenchRoleLibraryView.tsx',
      '../../features/workbench/components/workbenchSettingLibraryWorkspaceView.tsx',
    ];

    expect(actionButtonSource).toContainSource(
      "export type ActionButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';",
    );
    expect(actionButtonSource).toContainSource("export type ActionButtonSize = 'sm' | 'md';");
    expect(buttonClassesSource).toContainSource('DANGER_TEXT_BUTTON_CLASS');
    expect(buttonClassesSource).toContainSource('GHOST_TEXT_BUTTON_CLASS');
    expect(buttonClassesSource).toContainSource('ICON_BUTTON_CLASS');
    expect(formDialogSource).toContainSource("import { AppModalShell } from '@/shared/ui/AppModalShell';");
    expect(formDialogSource).toContainSource("import { ActionButton } from '@/shared/ui/ActionButton';");
    expect(formDialogSource).toContainSource('const isImeComposing = event.nativeEvent.isComposing || event.keyCode === 229;');
    expect(emptyStateSource).toContainSource('export function EmptyState');
    [
      '../../features/prompts/components/PromptCategoryCreateModal.tsx',
      '../../features/workbench/components/RoleCreateDialog.tsx',
      '../../features/novels/pages/NovelLibraryPage.tsx',
    ].forEach((path) => expect(readSource(path)).toContainSource("import { FormDialog } from '@/shared/ui/FormDialog';"));
    [
      '../../features/workbench/components/workbenchRoleLibraryView.tsx',
      '../../features/workbench/components/workbenchSettingLibraryWorkspaceView.tsx',
    ].forEach((path) => expect(readSource(path)).toContainSource("import { EmptyState } from '@/shared/ui/EmptyState';"));
    expect(capsuleSelectSource).toContainSource('const displayedOption = current ?? options[0] ?? null;');
    expect(capsuleSelectSource).toContainSource(
      'const selected = !option.disabled && displayedValue === option.value;',
    );
    expect(capsuleSelectSource).toContainSource("variant?: 'group' | 'groupedOption';");
    expect(capsuleSelectSource).toContainSource('metaLabel?: string;');
    expect(capsuleSelectSource).toContainSource("const isGroup = option.variant === 'group';");
    expect(capsuleSelectSource).toContainSource("const isGroupedOption = option.variant === 'groupedOption';");
    expect(capsuleSelectSource).toContainSource('const hasMetaLabel = !isGroup && Boolean(option.metaLabel);');
    expect(combinedAiConfigSelectSource).toContainSource('function getDisplayOption');
    expect(combinedAiConfigSelectSource).toContainSource(
      'const selected = !option.disabled && option.value === activeDisplayValue;',
    );
    expect(combinedAiConfigSelectSource).toContainSource("const isGroup = option.variant === 'group';");
    expect(combinedAiConfigSelectSource).toContainSource("const isGroupedOption = option.variant === 'groupedOption';");
    expect(combinedAiConfigSelectSource).toContainSource('const hasMetaLabel = !isGroup && Boolean(option.metaLabel);');
    expect(combinedAiConfigSelectSource).toContainSource('option.count');
    expect(combinedAiConfigSelectSource).toContainSource('xy-combined-ai-config-frame');
    expect(combinedAiConfigSelectSource).toContainSource('xy-combined-ai-config-label');
    expect(combinedAiConfigSelectSource).toContainSource('<Settings className="h-3.5 w-3.5" />');
    expect(combinedAiConfigSelectSource).toContainSource('rounded-2xl border border-white bg-white p-1.5');
    expect(combinedAiConfigSelectSource).toContainSource('aria-label="已选择"');
    expect(combinedAiConfigSelectSource).toContainSource('text-emerald-500');
    expect(combinedAiConfigSelectSource).not.toContainSource('bg-[#F4F8FA] p-2');
    aiConfigConsumers.forEach((path) => expect(readSource(path)).toContainSource('<CombinedAiConfigSelect'));
    expect(testCollectionSource).not.toContainSource('AiConfigSelectDesignTestPage');
    expect(testCollectionSource).not.toContainSource('/ai-config-select-design-test');
    expect(settingsSurfaceSource).toContainSource("export type SettingsSurfaceMode = 'page' | 'modal' | 'embedded';");
    expect(settingsPageSource).toContainSource("import { SettingsSurface } from '@/shared/ui/SettingsSurface';");
    expect(settingsPageSource).toContainSource('<SettingsSurface mode="embedded" className="bg-white">');
  });
});
