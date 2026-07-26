import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const srcRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

function collectProductionFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) {
      if (name === 'tests') return [];
      return collectProductionFiles(path);
    }
    if (!/\.(?:ts|tsx|css)$/.test(name) || name.includes('.test.') || name.includes('.spec.')) return [];
    return [path];
  });
}

describe('formal UI choices from comparison test 9', () => {
  it('uses the shared empty state in the representative formal locations', () => {
    [
      'features/novels/pages/NovelLibraryPage.tsx',
      'features/novels/components/RecycleBinModal.tsx',
      'features/workbench/components/EditorHistoryModals.tsx',
      'features/workbench/components/OutlineWorkspaceView.tsx',
    ].forEach((path) => {
      expect(readFileSync(join(srcRoot, path), 'utf8')).toContain(
        "import { EmptyState } from '@/shared/ui/EmptyState';",
      );
    });
  });

  it('does not keep the retired #08B3D9 value in production UI source', () => {
    const offenders = collectProductionFiles(srcRoot)
      .filter((path) => readFileSync(path, 'utf8').toUpperCase().includes('#08B3D9'))
      .map((path) => relative(srcRoot, path).replaceAll('\\', '/'));

    expect(offenders).toEqual([]);
  });
});
