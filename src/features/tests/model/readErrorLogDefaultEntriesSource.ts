import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
export function readErrorLogDefaultEntriesSource() {
  return Array.from({ length: 39 }, (_, index) =>
    readFileSync(
      resolve(
        process.cwd(),
        'src/features/tests/model',
        `errorLogDefaultEntries.part-${String(index + 1).padStart(2, '0')}.ts`,
      ),
      'utf8',
    ),
  ).join('\n');
}
