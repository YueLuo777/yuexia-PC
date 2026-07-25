import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('ChapterWritingSurface title actions', () => {
  it('keeps copy and optimize visually continuous without a middle divider', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/features/workbench/components/ChapterWritingSurface.tsx'),
      'utf8',
    );

    expect(source).toContainSource(
      'inline-flex flex-1 items-center justify-center whitespace-nowrap bg-brand px-1.5 text-sm font-medium text-white',
    );
    expect(source).not.toContainSource('whitespace-nowrap border-l border-brand bg-brand');
  });
});
