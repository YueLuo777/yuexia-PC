import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const pagePath = resolve(process.cwd(), 'src/features/tests/pages/WorkbenchAiWidthUnifiedPreviewTestPage.tsx');
const collectionPath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

describe('WorkbenchAiWidthUnifiedPreviewTestPage', () => {
  it('previews all creation flow pages with a fixed 420px AI panel', () => {
    const pageSource = readFileSync(pagePath, 'utf8');
    const collectionSource = readFileSync(collectionPath, 'utf8');

    ['brainstorm', 'setting', 'chapterOutline', 'writing', 'audit', 'polish', 'comment', 'status', 'summary'].forEach((flowKey) => {
      expect(pageSource).toContain(`key: '${flowKey}'`);
    });
    expect(pageSource).toContain('w-[420px] min-w-[420px] max-w-[420px]');
    expect(pageSource).toContain('whitespace-nowrap');
    expect(pageSource).toContain('基准宽度 420px');
    expect(collectionSource).toContain('WorkbenchAiWidthUnifiedPreviewTestPage');
    expect(collectionSource).toContain('/workbench-ai-width-unified-preview-test');
    expect(collectionSource).toContain('return <WorkbenchAiWidthUnifiedPreviewTestPage />;');
  });
});
