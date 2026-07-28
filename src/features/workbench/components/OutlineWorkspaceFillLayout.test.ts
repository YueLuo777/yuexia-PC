import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const directory = dirname(fileURLToPath(import.meta.url));

describe('detail outline fill layout', () => {
  it('allocates the full professional content height between outline and state changes', () => {
    const source = readFileSync(join(directory, 'OutlineWorkspaceView.tsx'), 'utf8');

    expect(source).toContain("data-detail-outline-layout={standardMode ? 'collapsible' : 'fill-to-bottom'}");
    expect(source).toContain(
      "'grid min-h-0 flex-1 grid-rows-[minmax(0,62fr)_minmax(0,38fr)] gap-6'",
    );
    expect(source).toContain("isDetailOutlineTab ? '-mr-4 flex flex-col pr-4 pt-2.5'");
    expect(source).toContain("standardMode ? 'flex-[0_0_62%]' : 'h-full'");
    expect(source).toContain('data-detail-outline-state-frame="true"');
    expect(source).toContain('<details className="group shrink-0">');
    expect(source).toContain('<div className="mt-2 h-[190px]">{stateExpectationFrame}</div>');
    expect(source).toContain(') : (\n                      stateExpectationFrame\n                    )}');
  });
});
