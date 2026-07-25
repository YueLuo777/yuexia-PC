import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const srcRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

function collectProductionTsxFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) {
      if (name === 'tests') return [];
      return collectProductionTsxFiles(path);
    }
    return name.endsWith('.tsx') && !name.includes('.test.') && !name.includes('.spec.') ? [path] : [];
  });
}

describe('formal modal shell consistency', () => {
  it('does not allow new hand-written feature backdrops outside the two embedded workflow panels', () => {
    const allowedEmbeddedWorkflowPanels = new Set([
      'features/workbench/components/ChapterReviewPanel.tsx',
      'features/workbench/components/ChapterStatusPanel.tsx',
    ]);
    const offenders = collectProductionTsxFiles(join(srcRoot, 'features'))
      .filter((path) => /fixed inset-0[^\n]*(?:bg-black|bg-slate-950)/.test(readFileSync(path, 'utf8')))
      .map((path) => relative(srcRoot, path).replaceAll('\\', '/'))
      .filter((path) => !allowedEmbeddedWorkflowPanels.has(path));

    expect(offenders).toEqual([]);
  });

  it('keeps representative normal, workbench and dangerous dialogs on their approved shells', () => {
    const read = (path: string) => readFileSync(join(srcRoot, path), 'utf8');

    expect(read('features/novels/components/NovelCoverModal.tsx')).toContain('<AppModalShell');
    expect(read('features/prompts/components/AuditPromptEditorModal.tsx')).toContain('<AppModalShell');
    expect(read('features/workbench/components/BrainstormReaderModal.tsx')).toContain('<WorkbenchModal');
    expect(read('features/workbench/components/workbenchRoleHistoryModal.tsx')).toContain('<WorkbenchModal');
    expect(read('features/novels/components/NovelDeleteConfirmModal.tsx')).toContain('<ConfirmDialog');
  });

  it('shows the drag cursor across the full shared modal title bar', () => {
    const source = readFileSync(join(srcRoot, 'shared/ui/AppModalShell.tsx'), 'utf8');

    expect(source).toContain('min-h-14 shrink-0 cursor-move');
    expect(source).toContain('active:cursor-grabbing');
  });
});
