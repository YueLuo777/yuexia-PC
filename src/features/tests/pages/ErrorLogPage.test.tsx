import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');

describe('ErrorLogPage source organization', () => {
  it('keeps the large default error log data outside the page component', () => {
    const pageSource = readSource('ErrorLogPage.tsx');
    const entriesSource = readSource('../model/errorLogEntries.ts');

    expect(pageSource).toContain("import { defaultEntries, type ErrorLogEntry } from '@/features/tests/model/errorLogEntries'");
    expect(pageSource).not.toContain('const defaultEntries: ErrorLogEntry[] = [');
    expect(entriesSource).toContain('export type ErrorLogEntry =');
    expect(entriesSource).toContain('export const defaultEntries: ErrorLogEntry[] = [');
  });
});
