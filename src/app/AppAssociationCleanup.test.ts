import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('App association cleanup lifecycle', () => {
  it('resets stale associations on startup and binds close cleanup', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/app/App.tsx'), 'utf8');

    expect(source).toContainSource('resetWorkbenchAssociationsForNewAppSession');
    expect(source).toContainSource('bindWorkbenchAssociationCloseCleanup');
  });
});
