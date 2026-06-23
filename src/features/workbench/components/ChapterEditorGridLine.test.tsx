import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8')
);

describe('ChapterEditor grid line font setting', () => {
  it('keeps review chapter selection non-orange and strengthens review preview dividers', () => {
    const chapterEditorSource = readSource('ChapterEditor.tsx');
    const reviewPanelStart = chapterEditorSource.indexOf('canRenderReviewPanel && createPortal');
    const reviewPanelSource = chapterEditorSource.slice(reviewPanelStart, reviewPanelStart + 22000);

    expect(reviewPanelStart).toBeGreaterThan(-1);
    expect(reviewPanelSource).toContain("selected\n                                      ? 'border-[#08B3D9] bg-[#EAF9FD] text-[#078fb0]'");
    expect(reviewPanelSource).toContain('flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white');
    expect(reviewPanelSource).not.toContain('flex h-full min-h-0 flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white');
    expect(reviewPanelSource).not.toContain('flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white');
    expect(reviewPanelSource).toContain('grid min-h-0 flex-1 grid-cols-2 divide-x divide-slate-300');
    expect(chapterEditorSource).toContain("import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';");
    expect(chapterEditorSource).toContain('const [reviewPreviewFontSize, setReviewPreviewFontSize] = useState(14);');
    expect(reviewPanelSource).toContain('ariaLabel="审核原文字号"');
    expect(reviewPanelSource).toContain('style={{ fontSize: reviewPreviewFontSize }}');
    expect(reviewPanelSource).not.toContain('xy-selected-orange-bg');
    expect(reviewPanelSource).not.toContain('grid min-h-0 flex-1 grid-cols-2 divide-x divide-slate-100');
  });

  it('uses minimum left panel widths as review and status defaults for new works', () => {
    const chapterEditorSource = readSource('ChapterEditor.tsx');

    expect(chapterEditorSource).toContain('const REVIEW_PAGE_LEFT_WIDTH = 180;');
    expect(chapterEditorSource).toContain('const STATUS_PAGE_LEFT_WIDTH = 190;');
    expect(chapterEditorSource).toContain('const REVIEW_PAGE_LEFT_WIDTH_LIMIT = { min: 180, max: 360 };');
    expect(chapterEditorSource).toContain('const STATUS_PAGE_LEFT_WIDTH_LIMIT = { min: 190, max: 360 };');
    expect(chapterEditorSource).not.toContain('const REVIEW_PAGE_LEFT_WIDTH = 220;');
    expect(chapterEditorSource).not.toContain('const STATUS_PAGE_LEFT_WIDTH = 230;');
  });

  it('keeps the editor paper line mode in the real chapter editor font settings', () => {
    const chapterEditorSource = readSource('ChapterEditor.tsx');
    const modalSource = readSource('EditorToolModals.tsx');

    expect(modalSource).toContain("export type EditorGridLineMode = 'none' | 'solid' | 'dashed';");
    expect(modalSource).toContain("gridLineMode: 'dashed'");
    expect(modalSource).toContain("gridLineEnabled: gridLineMode !== 'none'");
    expect(modalSource).toContain('export const EDITOR_GRID_LINE_LEFT_OFFSET_PX = 64;');
    expect(modalSource).toContain('export const EDITOR_GRID_LINE_RIGHT_OFFSET_PX = 64;');
    expect(modalSource).toContain("const EDITOR_GRID_LINE_MASK_COLOR = '#FFFFFF';");
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
    expect(chapterEditorSource).toContain("backgroundColor: 'transparent'");
    expect(chapterEditorSource).toContain("paddingLeft: editorTextPaddingLeft");
    expect(chapterEditorSource).toContain("paddingRight: editorTextPaddingRight");
    expect(chapterEditorSource).toContain("textIndent: editorTextIndent");
    expect(chapterEditorSource).toContain('paragraphIndent={formatSettings.paragraphIndent}');
    expect(chapterEditorSource).toContain('const normalizeEditorText = (value: string) => stripLineIndents(value);');
    expect(chapterEditorSource).toContain("const cleanedPaste = stripLineIndents(pasted);");
    expect(chapterEditorSource).toContain("const next = content.slice(0, start) + '\\n' + content.slice(end);");
    expect(chapterEditorSource).toContain('className="flex items-center gap-2 border-b border-[#e1e5eb] bg-white px-4 py-2"');
    expect(chapterEditorSource).not.toContain('className="flex items-center gap-2 bg-white px-4 py-2"');
    expect(chapterEditorSource).not.toContain('normalizeParagraphIndents');
    expect(chapterEditorSource).not.toContain('PARAGRAPH_INDENT');
    expect(chapterEditorSource).not.toContain('keepSelectionOutOfParagraphIndent');
    expect(chapterEditorSource).toContain('onScroll={(event) => setEditorScrollTop(event.currentTarget.scrollTop)}');
    expect(chapterEditorSource).toContain('placeholder=""');
    expect(chapterEditorSource).not.toContain('placeholder="从这里开始写..."');
    expect(chapterEditorSource).toContain("const WORKBENCH_FOLDER_GROUP_BUTTON_CLASS = 'group flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-[#BDEEF7] xy-flow-group-bg");
    expect(chapterEditorSource).toContain("const WORKBENCH_FOLDER_GROUP_ICON_CLASS = 'h-[17px] w-[17px] shrink-0 text-[#08AACE]';");
  });

  it('keeps high frequency word highlighting visible and color configurable', () => {
    const chapterEditorSource = readSource('ChapterEditor.tsx');
    const modalSource = readSource('EditorToolModals.tsx');

    expect(modalSource).toContain("const HIGH_FREQ_HIGHLIGHT_COLOR_KEY = 'xinyuexia_high_freq_highlight_color';");
    expect(modalSource).toContain('const highFreqHighlightColorOptions = [');
    expect(modalSource).toContain("{ label: '暖黄', value: '#FDE68A'");
    expect(modalSource).toContain("{ label: '浅青', value: '#BDEEF7'");
    expect(modalSource).toContain("{ label: '浅紫', value: '#DDD6FE'");
    expect(modalSource).toContain('function getStoredHighFreqHighlightColor()');
    expect(modalSource).toContain('const [highlightColor, setHighlightColor] = useState(getStoredHighFreqHighlightColor);');
    expect(modalSource).toContain('setHighlightColor(getStoredHighFreqHighlightColor());');
    expect(modalSource).toContain('writeJson(HIGH_FREQ_HIGHLIGHT_COLOR_KEY, highlightColor)');
    expect(modalSource).toContain('style={{ backgroundColor: option.value }}');
    expect(modalSource).toContain('backgroundColor: highlightOption.value');
    expect(modalSource).toContain('boxShadow: `0 0 0 1px ${highlightOption.ring}`');
    expect(modalSource).not.toContain('bg-yellow-300/90');
    expect(chapterEditorSource).toContain("backgroundColor: 'transparent'");
  });
});
