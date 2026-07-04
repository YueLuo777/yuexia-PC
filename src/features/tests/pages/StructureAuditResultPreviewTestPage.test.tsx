import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const pagePath = resolve(process.cwd(), 'src/features/tests/pages/StructureAuditResultPreviewTestPage.tsx');
const collectionPath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

describe('StructureAuditResultPreviewTestPage', () => {
  it('shows structure audit verdicts and annotation output in the test collection', () => {
    const pageSource = readFileSync(pagePath, 'utf8');
    const collectionSource = readFileSync(collectionPath, 'utf8');

    expect(pageSource).toContain('结构审核结果展示测试');
    expect(pageSource).toContain('是否符合章纲');
    expect(pageSource).toContain('是否完成本章目标');
    expect(pageSource).toContain('人物行为是否合理');
    expect(pageSource).toContain('是否建议进入文本审核');
    expect(pageSource).toContain('text-emerald-600');
    expect(pageSource).toContain('text-red-600');
    expect(pageSource).toContain('# 原文标注');
    expect(pageSource).toContain('AI 完整输出');
    expect(pageSource).toContain('第1章 AI标注');
    expect(collectionSource).toContain('StructureAuditResultPreviewTestPage');
    expect(collectionSource).toContain('/structure-audit-result-preview-test');
  });
});
