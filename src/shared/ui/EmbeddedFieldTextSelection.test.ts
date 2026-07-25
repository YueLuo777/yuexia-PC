import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('embedded field text selection', () => {
  it('keeps border labels out of selection while preserving editable text selection', () => {
    const styles = readFileSync(resolve(process.cwd(), 'src/shared/styles/parts/part-09.css'), 'utf8');
    const backplateStart = styles.indexOf('.xy-border-embedded-transparent-backplate {');
    const backplateEnd = styles.indexOf('.xy-border-embedded-transparent-backplate *', backplateStart);
    const backplateSource = styles.slice(backplateStart, backplateEnd);
    const editableStart = styles.indexOf('.xy-border-embedded-transparent-backplate input,');
    const editableEnd = styles.indexOf('.xy-border-embedded-transparent-backplate *', editableStart);
    const editableSource = styles.slice(editableStart, editableEnd);

    expect(backplateSource).toContain('user-select: none;');
    expect(backplateSource).toContain('-webkit-user-select: none;');
    expect(editableSource).toContain('user-select: text;');
    expect(editableSource).toContain('-webkit-user-select: text;');
  });
});
