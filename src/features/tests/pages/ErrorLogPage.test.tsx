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
    const generatedEntriesSource = readSource('../model/errorLogDefaultEntries.generated.ts');

    expect(pageSource).toContainSource(
      "import { loadDefaultErrorLogEntries, type ErrorLogEntry } from '@/features/tests/model/errorLogEntries'",
    );
    expect(pageSource).not.toContainSource('import { defaultEntries');
    expect(pageSource).not.toContainSource('const defaultEntries: ErrorLogEntry[] = [');
    expect(entriesSource).toContainSource("export type { ErrorLogEntry } from './errorLogEntryTypes';");
    expect(entriesSource).toContainSource('export async function loadDefaultErrorLogEntries()');
    expect(entriesSource).not.toContainSource('export const defaultEntries: ErrorLogEntry[] = [');
    expect(generatedEntriesSource).toContainSource('export const defaultEntries: ErrorLogEntry[] = [');
  });
});
