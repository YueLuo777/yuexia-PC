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

    expect(actionButtonSource).toContain(
      "export type ActionButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';",
    );
    expect(actionButtonSource).toContain("export type ActionButtonSize = 'sm' | 'md';");
    expect(buttonClassesSource).toContain('DANGER_TEXT_BUTTON_CLASS');
    expect(buttonClassesSource).toContain('GHOST_TEXT_BUTTON_CLASS');
    expect(buttonClassesSource).toContain('ICON_BUTTON_CLASS');
    expect(iconButtonSource).toContain('export function IconButton');
    expect(capsuleActionGroupSource).toContain('export function CapsuleActionGroup');
    expect(capsuleActionGroupSource).toContain('rounded-lg border border-slate-200 bg-white');
    expect(capsuleActionGroupSource).toContain('hover:bg-[#EAF9FD]');
    expect(capsuleSelectSource).toContain('const displayedOption = current ?? options[0] ?? null;');
    expect(capsuleSelectSource).toContain('const selected = !option.disabled && displayedValue === option.value;');
    expect(capsuleSelectSource).toContain("variant?: 'group' | 'groupedOption';");
    expect(capsuleSelectSource).toContain('metaLabel?: string;');
    expect(capsuleSelectSource).toContain("const isGroup = option.variant === 'group';");
    expect(capsuleSelectSource).toContain("const isGroupedOption = option.variant === 'groupedOption';");
    expect(capsuleSelectSource).toContain('const hasMetaLabel = !isGroup && Boolean(option.metaLabel);');
    expect(combinedAiConfigSelectSource).toContain('function getDisplayOption');
    expect(combinedAiConfigSelectSource).toContain(
      'const selected = !option.disabled && option.value === activeDisplayValue;',
    );
    expect(combinedAiConfigSelectSource).toContain("const isGroup = option.variant === 'group';");
    expect(combinedAiConfigSelectSource).toContain("const isGroupedOption = option.variant === 'groupedOption';");
    expect(combinedAiConfigSelectSource).toContain('const hasMetaLabel = !isGroup && Boolean(option.metaLabel);');
    expect(combinedAiConfigSelectSource).toContain('option.count');
    expect(settingsSurfaceSource).toContain("export type SettingsSurfaceMode = 'page' | 'modal' | 'embedded';");
    expect(preferenceSource).toContain('export function useUiPreference<T>');
    expect(settingsPageSource).toContain("import { SettingsSurface } from '@/shared/ui/SettingsSurface';");
    expect(settingsPageSource).toContain('<SettingsSurface mode="embedded" className="flex bg-white">');
  });
});
