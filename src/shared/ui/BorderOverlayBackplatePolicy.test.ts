import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const SRC_ROOT = resolve(process.cwd(), 'src');
const CLASS_NAME_PATTERN = /className\s*=\s*(?:"[^"]*"|\{`[\s\S]*?`\})/g;

function listTsxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listTsxFiles(path);
    return entry.isFile() && entry.name.endsWith('.tsx') ? [path] : [];
  });
}

function isTopBorderOverlay(className: string) {
  return (
    className.includes('absolute') &&
    className.includes('-translate-y-1/2') &&
    (className.includes(' top-0') || className.includes(' -top-'))
  );
}

describe('border overlay backplate policy', () => {
  it('requires transparent backplates for every element centered on a top border', () => {
    const violations: string[] = [];

    listTsxFiles(SRC_ROOT).forEach((file) => {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(CLASS_NAME_PATTERN)) {
        const className = match[0].replace(/\s+/g, ' ');
        if (!isTopBorderOverlay(className)) continue;

        const hasTransparentBackplate = className.includes('xy-border-embedded-transparent-backplate');
        const hasSolidMask = /\bbg-(?:white|slate-\d+|gray-\d+)\b/.test(className);
        if (!hasTransparentBackplate || hasSolidMask) {
          const line = source.slice(0, match.index).split('\n').length;
          violations.push(`${relative(process.cwd(), file)}:${line} ${className}`);
        }
      }
    });

    expect(violations).toEqual([]);
  });
});
