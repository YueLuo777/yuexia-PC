import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const pagePath = resolve(process.cwd(), 'src/features/tests/pages/WorkbenchFlowTabsSpacingTestPage.tsx');
const collectionPath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

describe('WorkbenchFlowTabsSpacingTestPage', () => {
  it('keeps three flow-tab spacing prototypes in the test collection', () => {
    const page = readFileSync(pagePath, 'utf8');
    const collection = readFileSync(collectionPath, 'utf8');
    expect(page).toContain("key: 'current'");
    expect(page).toContain("key: 'relaxed'");
    expect(page).toContain("key: 'grouped'");
    expect(page).toContain('确认后再迁移到正式工作台');
    expect(collection).toContain("path: '/workbench-flow-tabs-spacing-test'");
  });
});
