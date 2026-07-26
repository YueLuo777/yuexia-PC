import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const readSource = (relativePath: string) => readFileSync(join(currentDirectory, relativePath), 'utf8');

describe('ChapterWritingSurface outlined controls', () => {
  it('uses the model and prompt frame cyan only on the requested editor controls', () => {
    const surface = readSource('ChapterWritingSurface.tsx');
    const layout = readSource('chapterEditorLayout.tsx');
    const styles = readSource('../../../shared/styles/parts/part-12.css');

    expect(surface.match(/xy-chapter-editor-deep-outline/g)).toHaveLength(5);
    expect(surface.match(/xy-chapter-editor-deep-divider/g)).toHaveLength(6);
    expect(surface.match(/xy-chapter-editor-deep-divider-line/g)).toHaveLength(2);
    expect(layout).toContainSource(
      "'xy-chapter-editor-deep-outline flex h-8 items-stretch overflow-hidden rounded-md border border-brand",
    );
    expect(styles).toContainSource(
      '.xy-chapter-editor-deep-outline.xy-chapter-editor-deep-outline {\n  border-color: #08aace !important;\n}',
    );
    expect(styles).toContainSource(
      '.xy-chapter-editor-deep-divider.xy-chapter-editor-deep-divider {\n  border-color: #08aace !important;\n}',
    );
    expect(styles).toContainSource(
      '.xy-chapter-editor-deep-divider-line.xy-chapter-editor-deep-divider-line {\n  background-color: #08aace !important;\n}',
    );
  });

  it('does not add the deep outline marker to solid or destructive actions', () => {
    const surface = readSource('ChapterWritingSurface.tsx');
    const optimizeBlock = surface.slice(surface.indexOf('onClick={openTitleOptimize}'), surface.indexOf('</button>', surface.indexOf('onClick={openTitleOptimize}')));
    const findBlock = surface.slice(surface.indexOf('onClick={onOpenFind}'), surface.indexOf('</button>', surface.indexOf('onClick={onOpenFind}')));
    const deleteBlock = surface.slice(surface.indexOf('onClick={openDeleteConfirm}'), surface.indexOf('</button>', surface.indexOf('onClick={openDeleteConfirm}')));

    for (const block of [optimizeBlock, findBlock, deleteBlock]) {
      expect(block).not.toContain('xy-chapter-editor-deep-outline');
      expect(block).not.toContain('xy-chapter-editor-deep-divider');
    }
  });
});
