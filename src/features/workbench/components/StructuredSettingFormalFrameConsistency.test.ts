import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const baseDir = dirname(fileURLToPath(import.meta.url));

describe('formal structured-setting frame consistency', () => {
  it('keeps professional editors on embedded black frames and standard mode on its normal form', () => {
    const editorSource = readFileSync(join(baseDir, 'workbenchSettingEditor.tsx'), 'utf8');
    const roleEditorSource = readFileSync(join(baseDir, 'workbenchRoleEditor.tsx'), 'utf8');
    const standardEditorSource = readFileSync(join(baseDir, 'StandardModeSettingEditor.tsx'), 'utf8');
    const editorLayoutSource = readFileSync(join(baseDir, 'workbenchSettingEditorLayout.ts'), 'utf8');
    const definitionSource = readFileSync(join(baseDir, 'workbenchStructuredSettingDefinitions.ts'), 'utf8');

    expect(editorSource).not.toContain("from './StructuredSettingCompactFields'");
    expect(editorSource).toContain('<WorkbenchNameField');
    expect(editorSource).toContain('rounded-[20px] border-2 border-slate-950');
    expect(editorSource).toContain('px-6 pb-2 pt-4');
    expect(editorSource).toContain('WORKBENCH_SETTING_EDITOR_TWO_COLUMN_GRID_CLASS');
    expect(editorLayoutSource).toContain('grid grid-cols-2 items-stretch gap-3');
    expect(editorSource).toContain(
      "const SETTING_FIELD_CONTENT_CLASS = 'text-base font-medium leading-7 text-slate-950 outline-none placeholder:font-black placeholder:leading-6 placeholder:text-slate-400';",
    );
    expect(editorSource).toContain('className={`editor-scrollbar [scrollbar-gutter:stable] ${SETTING_FIELD_CONTENT_CLASS}`}');
    expect(editorSource).toContain('className={`min-h-10 w-full border-0 bg-transparent ${SETTING_FIELD_CONTENT_CLASS}`}');
    expect(editorSource).toContain('pb-1 [scrollbar-gutter:stable] ${SETTING_FIELD_CONTENT_CLASS}');
    expect(editorSource).not.toContain('text-sm leading-7 text-gray-700 outline-none placeholder:font-semibold placeholder:text-slate-400');
    expect(editorSource).not.toContain("const SETTING_FIELD_CONTENT_CLASS = 'text-base font-medium leading-8");
    expect(editorSource).not.toContain('xy-structured-setting-field');
    expect(editorSource).not.toContain('getSettingFieldPolicy');
    expect(editorSource).toContain('resize-none border-0 bg-transparent');
    expect(editorSource).not.toContain('rounded-xl border border-slate-100 bg-slate-50/70 p-4');

    expect(roleEditorSource).toContain('rounded-[22px] border-2 border-slate-950');
    expect(roleEditorSource).toContain(
      "const ROLE_FIELD_CONTENT_CLASS = 'text-base font-medium leading-8 text-slate-950 outline-none placeholder:font-semibold placeholder:text-slate-400';",
    );
    expect(roleEditorSource).toContain('pb-2 [scrollbar-gutter:stable] ${ROLE_FIELD_CONTENT_CLASS}');
    expect(roleEditorSource).toContain('ROLE_FIELD_STANDARD_MIN_ROWS = 3');
    expect(roleEditorSource).toContain('ROLE_FIELD_COMPACT_MIN_ROWS = 2');
    expect(roleEditorSource).toContain('ROLE_FIELD_MAX_ROWS = 10');
    expect(roleEditorSource).not.toContain('text-sm leading-7 text-slate-700 outline-none placeholder:font-semibold placeholder:text-slate-400');
    expect(roleEditorSource).toContain('resize-none border-0 bg-transparent');
    expect(roleEditorSource).not.toContain('flex-1 resize-none border-0 bg-transparent');
    expect(roleEditorSource).not.toContain('getSettingFieldPolicy');
    expect(roleEditorSource).not.toContain('BASE_FIELD_GROUPS');
    expect(roleEditorSource).not.toContain('个字段');
    expect(roleEditorSource).not.toContain('当前设定完整显示');

    expect(definitionSource).toContain("id: 'work-core-basic'");
    expect(definitionSource).toContain("id: 'item-ability'");
    expect(definitionSource).toContain("id: 'foreshadow-main'");
    expect(definitionSource).toContain('fieldClassName?: string;');

    expect(standardEditorSource).toContain('data-standard-setting-editor-style="normal-form"');
    expect(standardEditorSource).toContain("const CONTROL_BORDER = '#BFC8D2'");
    expect(standardEditorSource).toContain('grid grid-cols-2 items-start gap-x-4 gap-y-4');
    expect(standardEditorSource).toContain("'editor-scrollbar h-[132px] w-full resize-none rounded-md border bg-white");
    expect(standardEditorSource).not.toContain('border-2 border-slate-950');
    expect(standardEditorSource).not.toContain('<RoleAutoSizeTextarea');
  });
});
