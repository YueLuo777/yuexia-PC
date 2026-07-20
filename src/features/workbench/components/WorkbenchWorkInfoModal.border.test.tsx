import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = () =>
  readFileSync(join(process.cwd(), 'src/features/workbench/components/WorkbenchWorkInfoModal.tsx'), 'utf8');

describe('WorkbenchWorkInfoModal section borders', () => {
  it('uses a darker border for only the overview and synopsis outer sections', () => {
    const source = readSource();

    expect(source.match(/rounded-xl border border-slate-300 p-5/g)).toHaveLength(2);
    expect(source).not.toContainSource('rounded-xl border border-gray-200 p-5');
    expect(source).toContainSource('className="rounded-lg bg-gray-50 p-4"');
    expect(source).toContainSource('className="min-h-[180px] whitespace-pre-wrap rounded-lg bg-gray-50');
  });
});
