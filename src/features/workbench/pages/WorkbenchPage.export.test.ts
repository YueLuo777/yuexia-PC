import { describe, expect, it } from 'vitest';

import { buildChapterExportText } from './WorkbenchPage';

const readWorkbenchPageSource = async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  return fs.readFile(path.resolve(__dirname, 'WorkbenchPage.tsx'), 'utf8');
};

describe('buildChapterExportText', () => {
  it('exports plain text headings without markdown hash prefixes', () => {
    const text = buildChapterExportText('测试作品', 'novel', [
      {
        volumeId: 1,
        volumeName: '第一卷',
        chapterId: 101,
        serialNumber: 1,
        title: '开端',
        content: '正文内容',
      },
    ]);

    expect(text).toContain('第一卷\n\n第1章 开端');
    expect(text).not.toContain('# 第一卷');
    expect(text).not.toContain('## 第1章 开端');
  });

  it('limits the unpublished chapter sidebar width to one fifth of the viewport', async () => {
    const source = await readWorkbenchPageSource();

    expect(source).toContain('function getChapterSidebarMaxWidth()');
    expect(source).toContain('Math.floor(window.innerWidth / (5 * getEffectiveAppScale()))');
    expect(source).toContain('const maxWidth = Math.min(CHAPTER_SIDEBAR_MAX_WIDTH, getChapterSidebarMaxWidth());');
    expect(source).toContain('setChapterSidebarWidth((prev) => normalizeChapterSidebarWidth(prev));');
    expect(source).toContain('onMouseDown={handleChapterSidebarDragStart}');
    expect(source).toContain('title="拖拽调整未发布栏宽度"');
  });

  it('opens the workbench on the writing page instead of restoring the previous creation flow', async () => {
    const source = await readWorkbenchPageSource();

    expect(source).toContain("const [activeCreationFlow, setActiveCreationFlow] = useState<WorkbenchCreationFlowPageKey>('writing');");
    expect(source).toContain("setActiveCreationFlow('writing');");
    expect(source).not.toContain('getStoredCreationFlowPage');
    expect(source).not.toContain('xinyuexia_workbench_active_flow_page_');
  });
});
