import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const baseDir = dirname(fileURLToPath(import.meta.url));

describe('formal structured-setting frame consistency', () => {
  it('keeps compact gray forms out of the formal editor and uses embedded black frames for every domain', () => {
    const editorSource = readFileSync(join(baseDir, 'workbenchSettingEditor.tsx'), 'utf8');
    const definitionSource = readFileSync(join(baseDir, 'workbenchStructuredSettingDefinitions.ts'), 'utf8');

    expect(editorSource).not.toContain("from './StructuredSettingCompactFields'");
    expect(editorSource).toContain('<WorkbenchNameField');
    expect(editorSource).toContain('xy-floating-outline-fixed');
    expect(editorSource).toContain('xy-structured-setting-field');
    expect(editorSource).not.toContain('rounded-xl border border-slate-100 bg-slate-50/70 p-4');

    expect(definitionSource).toContain("id: 'work-core-basic'");
    expect(definitionSource).toContain("id: 'item-ability'");
    expect(definitionSource).toContain("id: 'foreshadow-main'");
    expect(definitionSource).toContain('fieldClassName?: string;');
  });
});
