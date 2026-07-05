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

  it('uses the shared modal shell and AI request log layout for concept library overlays', () => {
    const source = readSource();

    expect(source).toContain("import { AppModalShell } from '@/shared/ui/AppModalShell';");
    expect(source).toContain("import { AiRequestLogModalLayout } from '@/shared/ui/AiRequestLogModalLayout';");
    expect(source).toContain("import { ActionButton } from '@/shared/ui/ActionButton';");
    expect(source).toContain('<AppModalShell');
    expect(source).toContain('<AiRequestLogModalLayout');
    expect(source).toContain('storageKey="concept_library_ai_request_log_groups"');
    expect(source).not.toContain("import { AiRequestLogGroups");
    expect(source).not.toContain('fixed inset-0 z-[360]');
    expect(source).not.toContain('fixed inset-0 z-[365]');
    expect(source).not.toContain('fixed inset-0 z-[370]');
  });
});
