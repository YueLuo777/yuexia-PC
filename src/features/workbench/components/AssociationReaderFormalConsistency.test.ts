import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const directory = dirname(fileURLToPath(import.meta.url));
const read = (file: string) => readFileSync(join(directory, file), 'utf8');

describe('formal association reader consistency', () => {
  it('shares one size and one right-side square selection control across all three readers', () => {
    const shared = read('AssociationReaderItemRow.tsx');
    const brainstorm = read('BrainstormReaderModal.tsx');
    const otherSetting = read('workbenchOtherSettingReaderModal.tsx');
    const detailOutline = read('workbenchDetailOutlineReaderModal.tsx');

    expect(shared).toContain('rounded-[3px]');
    expect(shared).not.toContain('rounded-full');
    expect(shared.indexOf('<AssociationSelectionBox')).toBeGreaterThan(shared.indexOf('<button type="button" onClick={onPreview}'));
    for (const source of [brainstorm, otherSetting, detailOutline]) {
      expect(source).toContain('ASSOCIATION_READER_MODAL_WIDTH_CLASS');
      expect(source).toContain('ASSOCIATION_READER_MODAL_HEIGHT_CLASS');
      expect(source).toContain('<AssociationReaderItemRow');
    }
    expect(detailOutline).not.toContain('role="checkbox"');
    expect(detailOutline).not.toContain('setDetailOutlineReaderPreviewId(item.id);\n                                    if');
  });
});
