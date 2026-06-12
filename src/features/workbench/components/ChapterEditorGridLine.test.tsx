import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8')
);

describe('ChapterEditor grid line font setting', () => {
  it('keeps the editor paper line mode in the real chapter editor font settings', () => {
    const chapterEditorSource = readSource('ChapterEditor.tsx');
    const modalSource = readSource('EditorToolModals.tsx');

    expect(modalSource).toContain("export type EditorGridLineMode = 'none' | 'solid' | 'dashed';");
    expect(modalSource).toContain("gridLineMode: 'dashed'");
    expect(modalSource).toContain("gridLineEnabled: gridLineMode !== 'none'");
    expect(modalSource).toContain('const EDITOR_GRID_LINE_LEFT_OFFSET_PX = 64;');
    expect(modalSource).toContain("const dash = mode === 'dashed' ? \" stroke-dasharray='7 7'\" : '';");
    expect(modalSource).toContain("x1='${EDITOR_GRID_LINE_LEFT_OFFSET_PX}'");
    expect(modalSource).toContain('export function getEditorGridLineStyle(fontSettings: FontSettings, scrollTop = 0): CSSProperties');
    expect(modalSource).toContain('const underlineGapPx = Math.max(8, Math.round(fontSettings.fontSize * 0.22));');
    expect(modalSource).toContain('backgroundPosition: `0 ${EDITOR_GRID_LINE_TOP_OFFSET_PX - scrollTop}px`');
    expect(modalSource).toContain('backgroundSize: `${EDITOR_GRID_LINE_CANVAS_WIDTH_PX}px ${lineHeightPx}px`');
    expect(modalSource).toContain("onClick={() => update({ gridLineMode: option.value })}");
    expect(modalSource).toContain('local.gridLineMode === option.value');
    expect(modalSource).not.toContain('checked={local.gridLineEnabled}');
    expect(modalSource).toContain('...getEditorGridLineStyle(local)');
    expect(modalSource).toContain('const editorGridLineStyle = getEditorGridLineStyle(fontSettings);');

    expect(chapterEditorSource).toContain('getEditorGridLineStyle,');
    expect(chapterEditorSource).toContain('const editorGridLineStyle = useMemo(() => getEditorGridLineStyle(fontSettings, editorScrollTop), [editorScrollTop, fontSettings]);');
    expect(chapterEditorSource).toContain('...editorGridLineStyle');
    expect(chapterEditorSource).toContain('onScroll={(event) => setEditorScrollTop(event.currentTarget.scrollTop)}');
    expect(chapterEditorSource).toContain('placeholder=""');
    expect(chapterEditorSource).not.toContain('placeholder="从这里开始写..."');
    expect(chapterEditorSource).toContain('<div className="flex items-center gap-2 border-b border-[#e6e8ec] bg-white px-4 py-2">\n        <div className="flex items-center rounded-md border border-[#dce1e8]');
    expect(chapterEditorSource).toContain('<div className="flex items-center gap-2 bg-white px-4 py-2">\n        <button onClick={() => setIsFontSettingsOpen(true)}');
  });
});
