import { describe, expect, it } from 'vitest';

const readSource = async (relativePath: string) => {
  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');
};

describe('Workbench find replace modal placement', () => {
  it('opens from a body portal with centered default geometry', async () => {
    const source = await readSource('WorkbenchPage.tsx');
    const defaultGeometry = source.slice(
      source.indexOf('const FIND_REPLACE_DEFAULT_GEOMETRY'),
      source.indexOf('const FIND_REPLACE_MODAL_STORAGE_ID'),
    );
    const modalSource = source.slice(
      source.indexOf('function WorkbenchFindReplaceModal'),
      source.indexOf('function ManagementModal'),
    );

    expect(defaultGeometry).toContain('x: 0');
    expect(defaultGeometry).toContain('y: 0');
    expect(defaultGeometry).toContain('width: 592');
    expect(defaultGeometry).not.toContain('left:');
    expect(defaultGeometry).not.toContain('top:');
    expect(source).toContain("const FIND_REPLACE_MODAL_STORAGE_ID = 'workbench_find_replace_centered_v2';");
    expect(modalSource).toContain('return createPortal(');
    expect(modalSource).toContain('document.body');
    expect(modalSource).toContain('WebkitAppRegion');
  });

  it('keeps centered draggable geometry inside the viewport before saving', async () => {
    const source = await readSource('../../../shared/hooks/useDraggableModal.ts');

    expect(source).toContain('const centeredWidth = Number.isFinite(next.width) ? Number(next.width) : 0;');
    expect(source).toContain('(window.innerWidth - centeredWidth) / 2 - VIEWPORT_PADDING / 2');
    expect(source).toContain('const next = normalizeGeometryToViewport(rawNext);');
    expect(source).toContain('saveGeometry(storageKey, next);');
  });
});
