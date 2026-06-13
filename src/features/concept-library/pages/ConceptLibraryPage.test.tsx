import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = () =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'ConceptLibraryPage.tsx'), 'utf8');

describe('ConceptLibraryPage embedded toolbar', () => {
  it('keeps portal toolbar content memoized so the embedded library does not loop while mounted', () => {
    const source = readSource();

    expect(source).toContain('const embeddedToolbar = useMemo(() => (');
    expect(source).toContain('), [navigate]);');
    expect(source).toContain('{embeddedToolbarTarget && createPortal(embeddedToolbar, embeddedToolbarTarget)}');
  });
});
