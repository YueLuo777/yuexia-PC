import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8')
);

describe('ChapterEditor grid line font setting', () => {
  it('moves the tested dashed editor grid into the real chapter editor font settings', () => {
    const chapterEditorSource = readSource('ChapterEditor.tsx');
    const modalSource = readSource('EditorToolModals.tsx');

    expect(modalSource).toContain('gridLineEnabled: true');
    expect(modalSource).toContain('function buildEditorGridLineBackground(lineHeightPx: number, lineOffsetPx: number)');
    expect(modalSource).toContain('export function getEditorGridLineStyle(fontSettings: FontSettings, scrollTop = 0): CSSProperties');
    expect(modalSource).toContain('const underlineGapPx = Math.max(8, Math.round(fontSettings.fontSize * 0.22));');
    expect(modalSource).toContain('backgroundPosition: `0 ${EDITOR_GRID_LINE_TOP_OFFSET_PX - scrollTop}px`');
    expect(modalSource).toContain('label="稿纸虚线"');
    expect(modalSource).toContain('checked={local.gridLineEnabled}');
    expect(modalSource).toContain('...getEditorGridLineStyle(local)');
    expect(modalSource).toContain('const editorGridLineStyle = getEditorGridLineStyle(fontSettings);');

    expect(chapterEditorSource).toContain('getEditorGridLineStyle,');
    expect(chapterEditorSource).toContain('const editorGridLineStyle = useMemo(() => getEditorGridLineStyle(fontSettings, editorScrollTop), [editorScrollTop, fontSettings]);');
    expect(chapterEditorSource).toContain('...editorGridLineStyle');
    expect(chapterEditorSource).toContain('onScroll={(event) => setEditorScrollTop(event.currentTarget.scrollTop)}');
  });
});
