import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');

describe('shared UI reuse conventions', () => {
  it('provides reusable entrypoints for action buttons, settings surfaces, and UI preferences', () => {
    const actionButtonSource = readSource('ActionButton.tsx');
    const iconButtonSource = readSource('IconButton.tsx');
    const capsuleActionGroupSource = readSource('CapsuleActionGroup.tsx');
    const capsuleSelectSource = readSource('CapsuleSelect.tsx');
    const combinedAiConfigSelectSource = readSource('CombinedAiConfigSelect.tsx');
    const buttonClassesSource = readSource('actionButtonClasses.ts');
    const settingsSurfaceSource = readSource('SettingsSurface.tsx');
    const preferenceSource = readSource('../hooks/useUiPreference.ts');
    const settingsPageSource = readSource('../settings/SettingsPage.tsx');

    expect(actionButtonSource).toContainSource(
      "export type ActionButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';",
    );
    expect(actionButtonSource).toContainSource("export type ActionButtonSize = 'sm' | 'md';");
    expect(buttonClassesSource).toContainSource('DANGER_TEXT_BUTTON_CLASS');
    expect(buttonClassesSource).toContainSource('GHOST_TEXT_BUTTON_CLASS');
    expect(buttonClassesSource).toContainSource('ICON_BUTTON_CLASS');
    expect(iconButtonSource).toContainSource('export function IconButton');
    expect(capsuleActionGroupSource).toContainSource('export function CapsuleActionGroup');
    expect(capsuleActionGroupSource).toContainSource('rounded-lg border border-slate-200 bg-white');
    expect(capsuleActionGroupSource).toContainSource('hover:bg-[#EAF9FD]');
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
    expect(settingsSurfaceSource).toContainSource("export type SettingsSurfaceMode = 'page' | 'modal' | 'embedded';");
    expect(preferenceSource).toContainSource('export function useUiPreference<T>');
    expect(settingsPageSource).toContainSource("import { SettingsSurface } from '@/shared/ui/SettingsSurface';");
    expect(settingsPageSource).toContainSource('<SettingsSurface mode="embedded" className="flex bg-white">');
  });
});
