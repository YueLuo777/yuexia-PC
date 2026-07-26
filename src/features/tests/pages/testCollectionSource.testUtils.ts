import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function readTestCollectionSource() {
  return ['TestCollectionPage.tsx', 'testCollectionGroups.ts']
    .map((fileName) => readFileSync(resolve(process.cwd(), 'src/features/tests/pages', fileName), 'utf8'))
    .join('\n');
}
