import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/WorkbenchAiRightWidthPreviewTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

describe('WorkbenchAiRightWidthPreviewTestPage', () => {
  it('previews 420px and 460px right AI regions inside every workbench flow page shell', async () => {
    const source = await readFile(testPagePath, 'utf8');

    expect(source).toContain('WorkbenchAiRightWidthPreviewTestPage');
    expect(source).toContain('RIGHT_PANEL_WIDTHS = [420, 460]');
    expect(source).toContain('WORKBENCH_FLOW_TABS');
    expect(source).toContain('WorkbenchFlowShell');
    expect(source).toContain('style={{ width: rightWidth }}');
    [
      "id: 'brainstorm'",
      "id: 'setting'",
      "id: 'detailOutline'",
      "id: 'chapterText'",
      "id: 'reviewAudit'",
      "id: 'reviewPolish'",
      "id: 'reviewComment'",
      "id: 'statusUpdate'",
      "id: 'summary'",
    ].forEach((id) => expect(source).toContain(id));
    [
      '脑洞',
      '设定',
      '章纲',
      '正文',
      '剧情审核',
      '文笔润色',
      '综合点评',
      '更新状态',
      '生成梗概',
      '当前设定',
      '其他设定',
      '已关联脑洞',
      '智能导入设定',
      '复制正文',
      '结构审核',
      '保存梗概',
      '替换章纲',
    ].forEach((label) => expect(source).toContain(label));
    expect(source).toContain('CombinedAiConfigSelect');
    expect(source).toContain('AiInlineInput');
  });

  it('adds the width preview to the UI test collection after shuimo2 palette previews', async () => {
    const source = await readFile(collectionPagePath, 'utf8');

    expect(source).toContain('WorkbenchAiRightWidthPreviewTestPage');
    expect(source).toContain('/workbench-ai-right-width-preview-test');
    expect(source).toContain('右侧 AI 区宽度预览');
    expect(source.indexOf('/shuimo2-deep-palette-preview-test')).toBeLessThan(
      source.indexOf('/workbench-ai-right-width-preview-test'),
    );
  });
});
