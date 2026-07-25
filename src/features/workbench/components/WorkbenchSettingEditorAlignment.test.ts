import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const baseDir = dirname(fileURLToPath(import.meta.url));
const readSource = (fileName: string) => readFileSync(join(baseDir, fileName), 'utf8');

describe('workbench setting editor alignment', () => {
  it('shares the male-protagonist editor coordinates with every work-setting state', () => {
    const layoutSource = readSource('workbenchSettingEditorLayout.ts');
    const settingSource = readSource('workbenchSettingEditor.tsx');
    const roleSource = readSource('workbenchRoleEditor.tsx');

    expect(layoutSource).toContainSource("'shrink-0 px-1 pr-2'");
    expect(layoutSource).toContainSource("'flex min-h-[48px] flex-wrap items-start gap-3'");
    expect(layoutSource).toContainSource(
      "'editor-scrollbar min-h-0 flex-1 overflow-y-auto px-1 pb-1 pr-2 pt-4 [scrollbar-gutter:stable]'",
    );
    expect(layoutSource).toContainSource("'grid grid-cols-2 items-stretch gap-3'");

    for (const source of [settingSource, roleSource]) {
      expect(source).toContainSource('WORKBENCH_SETTING_EDITOR_SHELL_CLASS');
      expect(source).toContainSource('WORKBENCH_SETTING_EDITOR_HEADER_CLASS');
      expect(source).toContainSource('WORKBENCH_SETTING_EDITOR_HEADER_ROW_CLASS');
      expect(source).toContainSource('WORKBENCH_SETTING_EDITOR_SCROLL_CLASS');
      expect(source).toContainSource('WORKBENCH_SETTING_EDITOR_STACK_CLASS');
      expect(source).toContainSource('WORKBENCH_SETTING_EDITOR_TWO_COLUMN_GRID_CLASS');
    }

    expect(settingSource).not.toContainSource('shrink-0 px-2 pb-1 pr-2');
    expect(settingSource).not.toContainSource('gap-4 overflow-visible pb-1');
    expect(settingSource).not.toContainSource('overflow-y-auto px-2 pb-1 pr-2 pt-2');
    expect(settingSource).not.toContainSource('grid grid-cols-2 gap-4');
  });
});
