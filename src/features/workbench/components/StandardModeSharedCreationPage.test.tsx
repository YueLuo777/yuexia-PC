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
    const outlineView = readFileSync(join(directory, 'OutlineWorkspaceView.tsx'), 'utf8');
    const writingSurface = readFileSync(join(directory, 'ChapterWritingSurface.tsx'), 'utf8');

    expect(adapter).toContain("import('@/features/workbench/pages/WorkbenchPage')");
    expect(adapter).toContain('<SharedWorkbenchPage experience="standard" fixedFlow={FLOW_BY_ACTION[action]} />');
    expect(adapter).toContain("storyAudit: 'audit'");
    expect(adapter).toContain("statusUpdate: 'status'");
    expect(standardPage).toContain("activeAction === 'chapterOutline'");
    expect(standardPage).toContain('<StandardModeSharedCreationPage action={activeAction} />');
    expect(workbenchPage).toContain("experience?: 'professional' | 'standard'");
    expect(workbenchPage).toContain("'chapterOutline' | 'writing' | 'audit' | 'status' | 'summary'");
    expect(workbenchPage).toContain("experience === 'professional' ? (");
    expect(workbenchPage).toContain('<WorkbenchHeader');
    expect(workbenchPage).toContain("experience === 'standard' ? 280 : chapterSidebarWidth");
    expect(workbenchPage).toContain("experience === 'standard' ? 390 : aiPanelWidth");
    expect(outlineView).toContain("open={standardMode ? undefined : true}");
    expect(outlineView).toContain('状态变化 {countTextWords(detailOutlineParts.stateExpectation)}字');
    expect(writingSurface).toContain('standardMode ? (');
    expect(writingSurface).toContain('更多');
  });
});
