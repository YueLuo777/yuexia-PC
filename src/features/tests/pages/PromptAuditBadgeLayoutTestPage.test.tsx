import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/PromptAuditBadgeLayoutTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');
const internalRoutesPath = resolve(process.cwd(), 'src/app/InternalRoutesPage.tsx');

describe('PromptAuditBadgeLayoutTestPage', () => {
  it('previews audit prompt cards with category badges moved below the title', async () => {
    const source = await readFile(testPagePath, 'utf8');

    expect(source).toContain('PromptAuditBadgeLayoutTestPage');
    expect(source).toContain('当前横排标签');
    expect(source).toContain('两行标签候选');
    expect(source).toContain('flex flex-col items-start gap-1');
    expect(source).toContain('结构审核-长篇节奏与毒点检测提示词');
  });

  it('registers the audit badge preview in the AI test collection group', async () => {
    const collectionSource = await readFile(collectionPagePath, 'utf8');
    const routeSource = await readFile(internalRoutesPath, 'utf8');

    expect(collectionSource).toContain('PromptAuditBadgeLayoutTestPage');
    expect(collectionSource).toContain('/prompt-audit-badge-layout-test');
    expect(collectionSource.indexOf('/prompt-workflow-preview-test')).toBeLessThan(
      collectionSource.indexOf('/prompt-audit-badge-layout-test'),
    );
    expect(collectionSource.indexOf('/prompt-audit-badge-layout-test')).toBeLessThan(
      collectionSource.indexOf("title: '工具测试'"),
    );
    expect(routeSource).toContain('/prompt-audit-badge-layout-test');
  });
});
