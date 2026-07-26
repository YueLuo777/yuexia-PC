import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const directory = dirname(fileURLToPath(import.meta.url));

describe('standard mode shared chapter creation pages', () => {
  it('reuses the professional workbench instead of copying outline and writing implementations', () => {
    const adapter = readFileSync(join(directory, 'StandardModeSharedCreationPage.tsx'), 'utf8');
    const standardPage = readFileSync(join(directory, '../pages/StandardModeWorkbenchPage.tsx'), 'utf8');
    const workbenchPage = readFileSync(join(directory, '../pages/WorkbenchPage.tsx'), 'utf8');

    expect(adapter).toContain("import('@/features/workbench/pages/WorkbenchPage')");
    expect(adapter).toContain('<SharedWorkbenchPage experience="standard" fixedFlow={action} />');
    expect(standardPage).toContain("activeAction === 'chapterOutline' || activeAction === 'writing'");
    expect(standardPage).toContain('<StandardModeSharedCreationPage action={activeAction} />');
    expect(workbenchPage).toContain("experience?: 'professional' | 'standard'");
    expect(workbenchPage).toContain("fixedFlow?: Extract<WorkbenchCreationFlowPageKey, 'chapterOutline' | 'writing'>");
    expect(workbenchPage).toContain("experience === 'professional' ? (");
    expect(workbenchPage).toContain('<WorkbenchHeader');
  });
});
