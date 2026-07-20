import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = () =>
  ['ConceptLibraryPage.tsx', '../components/ConceptLibraryModals.tsx', '../components/ConceptInspirationForm.tsx']
    .map((file) => readFileSync(join(dirname(fileURLToPath(import.meta.url)), file), 'utf8'))
    .join('\n');

describe('ConceptLibraryPage embedded toolbar', () => {
  it('keeps portal toolbar content memoized so the embedded library does not loop while mounted', () => {
    const source = readSource();

    expect(source).toContainSource('const embeddedToolbar = useMemo(() => (');
    expect(source).toContainSource('), [navigate]);');
    expect(source).toContainSource('{embeddedToolbarTarget && createPortal(embeddedToolbar, embeddedToolbarTarget)}');
  });

  it('uses the shared modal shell and AI request log layout for concept library overlays', () => {
    const source = readSource();

    expect(source).toContainSource("import { AppModalShell } from '@/shared/ui/AppModalShell';");
    expect(source).toContainSource("import { AiRequestLogModalLayout } from '@/shared/ui/AiRequestLogModalLayout';");
    expect(source).toContainSource("import { ActionButton } from '@/shared/ui/ActionButton';");
    expect(source).toContainSource('<AppModalShell');
    expect(source).toContainSource('<AiRequestLogModalLayout');
    expect(source).toContainSource('storageKey="concept_library_ai_request_log_groups"');
    expect(source).not.toContainSource('import { AiRequestLogGroups');
    expect(source).not.toContainSource('fixed inset-0 z-[360]');
    expect(source).not.toContainSource('fixed inset-0 z-[365]');
    expect(source).not.toContainSource('fixed inset-0 z-[370]');
  });

  it('uses the compact row form from the focused test in the formal inspiration panel', () => {
    const source = readSource();

    expect(source).toContainSource("field.key === 'genre' ? 'w-[118px]' : 'w-[105px]'");
    expect(source).toContainSource("CONCEPT_INSPIRATION_FIELDS.filter((field) => field.key === 'cheat')");
    expect(source).toContainSource("field.key === 'idea' || field.key === 'requirement'");
    expect(source).toContainSource("field.key === 'requirement' ? 'h-20' : 'h-16'");
    expect(source).toContainSource('focus:border-[#08AACE] focus:ring-4 focus:ring-[#08AACE]/10');
    expect(source).not.toContainSource('xy-floating-outline-compact-textarea');
    expect(source).not.toContainSource('getInspirationFieldRows');
  });

  it('keeps all inspiration save modes reachable and applies the selected generation count', () => {
    const source = readSource();

    expect(source).toContainSource("['normal', '整理保存']");
    expect(source).toContainSource("['association', '联想保存']");
    expect(source).toContainSource("['both', '同时保存']");
    expect(source).toContainSource('normalizeInspirationGenerateCount(inspirationGenerateCount)');
    expect(source).toContainSource('for (let index = 0; index < generationCount; index += 1)');
    expect(source).toContainSource('setPendingAssociationItems(generatedItems)');
  });
});
