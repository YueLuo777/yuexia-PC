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
    expect(modalSource).toContain('export const EDITOR_GRID_LINE_LEFT_OFFSET_PX = 64;');
    expect(modalSource).toContain('export const EDITOR_GRID_LINE_RIGHT_OFFSET_PX = 64;');
    expect(modalSource).toContain("const EDITOR_GRID_LINE_MASK_COLOR = '#F5F5F7';");
    expect(modalSource).toContain("const dash = mode === 'dashed' ? \" stroke-dasharray='7 7'\" : '';");
    expect(modalSource).toContain("x1='${EDITOR_GRID_LINE_LEFT_OFFSET_PX}'");
    expect(modalSource).toContain('export function getEditorGridLineStyle(fontSettings: FontSettings, scrollTop = 0): CSSProperties');
    expect(modalSource).toContain('const underlineGapPx = Math.max(8, Math.round(fontSettings.fontSize * 0.22));');
    expect(modalSource).not.toContain('firstLineCoverHeightPx');
    expect(modalSource).not.toContain('EDITOR_GRID_LINE_TOP_MASK_EXTRA_PX');
    expect(modalSource).toContain('const repeatedTopLineMaskHeightPx = Math.max(0, EDITOR_GRID_LINE_TOP_OFFSET_PX + lineOffsetPx - lineHeightPx + 4);');
    expect(modalSource).toContain('backgroundPosition: `left 0, right 0, 0 ${EDITOR_GRID_LINE_TOP_OFFSET_PX - scrollTop}px`');
    expect(modalSource).toContain("backgroundRepeat: 'no-repeat, no-repeat, repeat-y'");
    expect(modalSource).toContain('backgroundSize: `100% ${repeatedTopLineMaskHeightPx}px, ${EDITOR_GRID_LINE_RIGHT_OFFSET_PX}px 100%, ${EDITOR_GRID_LINE_CANVAS_WIDTH_PX}px ${lineHeightPx}px`');
    expect(modalSource).toContain("onClick={() => update({ gridLineMode: option.value })}");
    expect(modalSource).toContain('local.gridLineMode === option.value');
    expect(modalSource).not.toContain('checked={local.gridLineEnabled}');
    expect(modalSource).toContain('...getEditorGridLineStyle(local)');
    expect(modalSource).toContain('const editorGridLineStyle = getEditorGridLineStyle(fontSettings);');
    expect(modalSource).toContain('const editorTextPaddingLeft = `${EDITOR_GRID_LINE_LEFT_OFFSET_PX}px`;');
    expect(modalSource).toContain("paddingLeft: editorTextPaddingLeft");
    expect(modalSource).toContain('const editorTextPaddingRight = `${EDITOR_GRID_LINE_RIGHT_OFFSET_PX}px`;');
    expect(modalSource).toContain("paddingRight: editorTextPaddingRight");
    expect(modalSource).toContain("const editorTextIndent = paragraphIndent ? '2em' : undefined;");
    expect(modalSource).toContain("textIndent: editorTextIndent");

    expect(chapterEditorSource).toContain('EDITOR_GRID_LINE_LEFT_OFFSET_PX,');
    expect(chapterEditorSource).toContain('EDITOR_GRID_LINE_RIGHT_OFFSET_PX,');
    expect(chapterEditorSource).toContain('getEditorGridLineStyle,');
    expect(chapterEditorSource).toContain('const editorGridLineStyle = useMemo(() => getEditorGridLineStyle(fontSettings, editorScrollTop), [editorScrollTop, fontSettings]);');
    expect(chapterEditorSource).toContain('const editorTextPaddingLeft = `${EDITOR_GRID_LINE_LEFT_OFFSET_PX}px`;');
    expect(chapterEditorSource).toContain('const editorTextPaddingRight = `${EDITOR_GRID_LINE_RIGHT_OFFSET_PX}px`;');
    expect(chapterEditorSource).toContain("const editorTextIndent = formatSettings.paragraphIndent ? '2em' : undefined;");
    expect(chapterEditorSource).toContain('...editorGridLineStyle');
    expect(chapterEditorSource).toContain("paddingLeft: editorTextPaddingLeft");
    expect(chapterEditorSource).toContain("paddingRight: editorTextPaddingRight");
    expect(chapterEditorSource).toContain("textIndent: editorTextIndent");
    expect(chapterEditorSource).toContain('paragraphIndent={formatSettings.paragraphIndent}');
    expect(chapterEditorSource).toContain('const normalizeEditorText = (value: string) => stripLineIndents(value);');
    expect(chapterEditorSource).toContain("const cleanedPaste = stripLineIndents(pasted);");
    expect(chapterEditorSource).toContain("const next = content.slice(0, start) + '\\n' + content.slice(end);");
    expect(chapterEditorSource).not.toContain('normalizeParagraphIndents');
    expect(chapterEditorSource).not.toContain('PARAGRAPH_INDENT');
    expect(chapterEditorSource).not.toContain('keepSelectionOutOfParagraphIndent');
    expect(chapterEditorSource).toContain('onScroll={(event) => setEditorScrollTop(event.currentTarget.scrollTop)}');
    expect(chapterEditorSource).toContain('placeholder=""');
    expect(chapterEditorSource).not.toContain('placeholder="从这里开始写..."');
    expect(chapterEditorSource).toContain("const WORKBENCH_FOLDER_GROUP_BUTTON_CLASS = 'group flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-[#BDEEF7] bg-[#E7F8FD]");
    expect(chapterEditorSource).toContain("const WORKBENCH_FOLDER_GROUP_ICON_CLASS = 'h-[17px] w-[17px] shrink-0 text-[#08AACE]';");
  });
});
