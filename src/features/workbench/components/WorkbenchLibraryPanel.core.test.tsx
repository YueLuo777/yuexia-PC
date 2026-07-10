import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { WorkbenchLibraryPanel } from './WorkbenchLibraryPanel';
import {
  readWorkbenchLibraryPanelSource,
  readWorkbenchLibraryPanelEntrySource,
  readSharedStylesSource,
  readChapterEditorSource,
  readEditorToolModalsSource,
  readTestCollectionSource,
} from './WorkbenchLibraryPanel.testUtils';

describe('WorkbenchLibraryPanel core integration contracts', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps workbench library panel split into focused helper modules', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const entrySource = await readWorkbenchLibraryPanelEntrySource();

    expect(panelSource).toContainSource("import { LibraryAiLogShell } from './workbenchLibraryAiLogShell';");
    expect(panelSource).toContainSource(
      "import { SettingImportFormatPreviewText } from './workbenchSettingImportFormatPreview';",
    );
    expect(panelSource).toContainSource("import { resizeFloatingAiTextarea } from './workbenchFloatingAiTextarea';");
    expect(panelSource).toContainSource(
      "import { LibraryManagementModal, type LibraryManagementModalState } from './workbenchLibraryManagementModal';",
    );
    expect(panelSource).toContainSource("from './workbenchLibraryPanelConstants';");
    expect(panelSource).toContainSource("import { SettingSegmentedTabs } from './workbenchSettingSegmentedTabs';");
    expect(panelSource).toContainSource("import { WorkbenchRoleLibraryView } from './workbenchRoleLibraryView';");
    expect(panelSource).toContainSource("import { WorkbenchSimpleLibraryView } from './workbenchSimpleLibraryView';");
    expect(panelSource).toContainSource("from './workbenchFieldSizeSettings';");
    expect(panelSource).not.toContainSource('function LibraryAiLogShell({');
    expect(panelSource).not.toContainSource('function LibraryManagementModal({');
    expect(panelSource).not.toContainSource('function SettingSegmentedTabs<T extends string>');
    expect(panelSource).not.toContainSource('function SettingImportFormatPreviewText({ content }');
    expect(panelSource).not.toContainSource('function resizeFloatingAiTextarea(textarea: HTMLTextAreaElement | null)');
    expect(panelSource).not.toContainSource('function FieldSizeNumberInput({');
    expect(entrySource).not.toContainSource('<h3 className="shrink-0 text-base font-bold text-gray-900">角色生成</h3>');
  });

  it('keeps the main chapter writing surface on the white paper background', async () => {
    const styleSource = await readSharedStylesSource();
    const chapterEditorSource = await readChapterEditorSource();

    expect(styleSource).toContainSource('--xy-wa-editor-bg: #FFFFFF;');
    expect(styleSource).toContainSource('.xy-wa-editor-root {\n  background: var(--xy-wa-editor-bg);\n}');
    expect(styleSource).toContainSource('.xy-wa-editor-surface {\n  background: var(--xy-wa-editor-bg);\n}');
    expect(styleSource).toContainSource(
      '.xy-wa-editor-surface .xy-wa-editor-text-layer {\n  background: var(--xy-wa-editor-bg);\n}',
    );
    expect(styleSource).not.toContainSource('.xy-wa-editor-paragraph-overlay > span {');
    expect(styleSource).not.toContainSource('text-indent: 2em;');
    expect(chapterEditorSource).toContainSource(
      'className="xy-wa-editor-root flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden"',
    );
    expect(chapterEditorSource).toContainSource(
      'className="xy-wa-editor-surface relative min-h-0 flex-1 overflow-hidden"',
    );
    expect(chapterEditorSource).toContainSource(
      'className="xy-wa-editor-text-layer editor-scrollbar relative z-10 h-full min-h-0 w-full resize-none border-0 bg-transparent pb-6 pt-3 outline-none"',
    );
    expect(chapterEditorSource).toContainSource('paddingLeft: editorTextPaddingLeft');
    expect(chapterEditorSource).toContainSource('paddingRight: editorTextPaddingRight');
    expect(chapterEditorSource).toContainSource('color: fontSettings.fontColor');
    expect(chapterEditorSource).not.toContainSource(
      "color: formatSettings.paragraphIndent ? 'transparent' : fontSettings.fontColor",
    );
    expect(chapterEditorSource).not.toContainSource('textIndent: editorTextIndent');
    expect(chapterEditorSource).not.toContainSource('overflow-hidden bg-[#f5f5f7]');
    expect(chapterEditorSource).not.toContainSource('px-6 pb-6 pt-10 outline-none');
  });

  it('keeps paragraph indentation as real textarea text instead of overlay text', async () => {
    const chapterEditorSource = await readChapterEditorSource();
    const modalSource = await readEditorToolModalsSource();

    expect(chapterEditorSource).toContainSource(
      'const normalizeEditorText = (value: string) => applyParagraphIndentToText(value, formatSettings.paragraphIndent);',
    );
    expect(chapterEditorSource).toContainSource(
      'const editorTextPaddingLeft = `${EDITOR_GRID_LINE_LEFT_OFFSET_PX}px`;',
    );
    expect(chapterEditorSource).toContainSource(
      'const editorTextPaddingRight = `${EDITOR_GRID_LINE_RIGHT_OFFSET_PX}px`;',
    );
    expect(chapterEditorSource).not.toContainSource(
      "const editorTextIndent = formatSettings.paragraphIndent ? '2em' : undefined;",
    );
    expect(chapterEditorSource).toContainSource('const cleanedPaste = stripLineIndents(pasted);');
    expect(chapterEditorSource).toContainSource(
      "const insertText = formatSettings.paragraphIndent ? '\\n\\u3000\\u3000' : '\\n';",
    );
    expect(chapterEditorSource).not.toContainSource('paragraphIndent={formatSettings.paragraphIndent}');
    expect(chapterEditorSource).not.toContainSource('keepSelectionOutOfParagraphIndent');
    expect(chapterEditorSource).not.toContainSource('normalizeParagraphIndents');
    expect(modalSource).toContainSource('const editorTextPaddingLeft = `${EDITOR_GRID_LINE_LEFT_OFFSET_PX}px`;');
    expect(modalSource).toContainSource('const editorTextPaddingRight = `${EDITOR_GRID_LINE_RIGHT_OFFSET_PX}px`;');
    expect(modalSource).not.toContainSource("const editorTextIndent = paragraphIndent ? '2em' : undefined;");
    expect(modalSource).toContainSource('export function applyParagraphIndentToText(text: string, enabled: boolean)');
    expect(modalSource).not.toContainSource('xy-wa-editor-paragraph-overlay');
    expect(modalSource).not.toContainSource("color: paragraphIndent ? fontSettings.fontColor : 'transparent'");
    expect(modalSource).not.toContainSource('normalizeParagraphIndents');
  });

  it('records shellless techniques while official right panels avoid soft card wrappers', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterSource = await readChapterEditorSource();
    const styleSource = await readSharedStylesSource();

    expect(styleSource).toContainSource('.xy-shellless-panel {');
    expect(styleSource).toContainSource('.xy-soft-shell-panel {');
    expect(panelSource).not.toContainSource(
      '<div className="mt-3 shrink-0 text-sm font-bold leading-6 text-gray-600">',
    );
    expect(chapterSource).toContainSource('mt-3 text-xs font-bold leading-5 text-slate-500');
    expect(panelSource).not.toContainSource('xy-soft-shell-panel mt-3 p-3');
    expect(chapterSource).not.toContainSource('xy-soft-shell-panel p-3 text-xs leading-5 text-slate-500');
  });

  it('uses the writing page cursor for official horizontal resize splitters', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const styleSource = await readSharedStylesSource();
    const testCollectionSource = await readTestCollectionSource();

    expect(panelSource).toContainSource("document.body.style.cursor = 'ew-resize';");
    expect(panelSource).toContainSource('cursor-ew-resize touch-none items-stretch');
    expect(styleSource).not.toContainSource('cursor-col-resize');
    expect(panelSource).not.toContainSource("document.body.style.cursor = 'col-resize';");
    expect(panelSource).not.toContainSource('cursor-col-resize');
    expect(testCollectionSource).not.toContainSource('DragSplitterIconTestPage');
    expect(testCollectionSource).not.toContainSource('/drag-splitter-icon-test');
  });

  it('uses the 07 no-card right-side shell across official editor right panels', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterSource = await readChapterEditorSource();

    expect(panelSource).toContainSource(
      '<aside className="flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">',
    );
    expect(panelSource).toContainSource(
      '<aside className="min-w-0 flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">',
    );
    expect(panelSource).toContainSource(
      'xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-fill xy-floating-with-bottom-count h-full',
    );
    expect(chapterSource).toContainSource(
      'xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count mt-4 min-h-0 flex-1',
    );
    expect(chapterSource).toContainSource(
      'xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill h-full xy-has-value',
    );
    expect(chapterSource).toContainSource(
      "const CHAPTER_EDITOR_RESIZE_HANDLE_CLASS = 'group relative z-10 flex h-full w-3 -translate-x-1/2 cursor-ew-resize items-stretch justify-center bg-transparent';",
    );
    expect(chapterSource).toContainSource(
      'style={{ gridTemplateColumns: `${statusPageLeftWidth}px 0px minmax(0,1fr) 0px ${statusPageRightWidth}px` }}',
    );
    expect(chapterSource).toContainSource(
      'style={{ gridTemplateColumns: `${reviewPageLeftWidth}px 0px minmax(0,1fr) 0px ${reviewPageRightWidth}px` }}',
    );
    expect(panelSource).not.toContainSource(
      'relative mt-5 flex min-h-0 flex-1 flex-col rounded-xl border border-gray-200 bg-white px-3 pb-3 pt-5',
    );
    expect(panelSource).not.toContainSource(
      'relative flex h-full min-h-0 flex-col rounded-xl border border-gray-200 bg-white px-3 pb-3 pt-5',
    );
    expect(panelSource).not.toContainSource(
      'relative flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white px-3 pb-3 pt-5',
    );
    expect(chapterSource).not.toContainSource('AI 閰嶇疆');
    expect(chapterSource).not.toContainSource('AI 输出框');
    expect(chapterSource).not.toContainSource(
      'flex min-h-[240px] flex-col rounded-2xl border border-[#08AACE] bg-white',
    );
  });

  it('keeps fixed right-click menus inside the viewport before opening', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const openCategoryMenuSource = panelSource.slice(
      panelSource.indexOf('const openCategoryMenu = (event: MouseEvent<HTMLButtonElement>'),
      panelSource.indexOf(
        'const openEntryMenu = (event: MouseEvent<HTMLElement>',
        panelSource.indexOf('const openCategoryMenu = (event: MouseEvent<HTMLButtonElement>'),
      ),
    );
    const openEntryMenuSource = panelSource.slice(
      panelSource.indexOf('const openEntryMenu = (event: MouseEvent<HTMLElement>'),
      panelSource.indexOf(
        'const deleteRoleType = (type: string) => {',
        panelSource.indexOf('const openEntryMenu = (event: MouseEvent<HTMLElement>'),
      ),
    );

    expect(panelSource).toContainSource('const CONTEXT_MENU_VIEWPORT_PADDING = 8;');
    expect(panelSource).toContainSource('const SETTING_CATEGORY_CONTEXT_MENU_SIZE = { width: 220, height: 300 };');
    expect(panelSource).toContainSource('const SETTING_ENTRY_CONTEXT_MENU_SIZE = { width: 180, height: 280 };');
    expect(panelSource).toContainSource('const PROMPT_DISABLE_CONTEXT_MENU_SIZE = { width: 140, height: 72 };');
    expect(openCategoryMenuSource).toContainSource(
      'const { left, top } = clampFixedMenuPosition(event.clientX, event.clientY, SETTING_CATEGORY_CONTEXT_MENU_SIZE);',
    );
    expect(openCategoryMenuSource).toContainSource('setCategoryMenu({ kind, type, x: left, y: top });');
    expect(openEntryMenuSource).toContainSource(
      'const { left, top } = clampFixedMenuPosition(event.clientX, event.clientY, SETTING_ENTRY_CONTEXT_MENU_SIZE);',
    );
    expect(openEntryMenuSource).toContainSource('x: left,');
    expect(openEntryMenuSource).toContainSource('y: top,');
    expect(openCategoryMenuSource).not.toContainSource('x: event.clientX');
    expect(openEntryMenuSource).not.toContainSource('x: event.clientX');
    expect(panelSource).toContainSource(
      'clampFixedMenuPosition(event.clientX, event.clientY, PROMPT_DISABLE_CONTEXT_MENU_SIZE)',
    );
  });

  it('removes old empty auto-created faction item and location entries without removing user content', async () => {
    const storageKey = 'workbench-clear-old-auto-domain-setting-items-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, '2026-06-17-setting-starter-empty-body-v3');
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'old-auto-faction',
          tab: '大纲',
          title: '正派势力',
          content: JSON.stringify({ type: '正派势力', body: '' }),
          updatedAt: '2026/6/17 10:00:00',
        },
        {
          id: 'old-auto-item',
          tab: '大纲',
          title: '功法能力',
          content: JSON.stringify({ type: '功法能力', body: '' }),
          updatedAt: '2026/6/17 10:01:00',
        },
        {
          id: 'old-auto-location',
          tab: '大纲',
          title: '世界地图',
          content: JSON.stringify({ type: '世界地图', body: '' }),
          updatedAt: '2026/6/17 10:02:00',
        },
        {
          id: 'user-faction',
          tab: '大纲',
          title: '正派势力',
          content: JSON.stringify({ type: '正派势力', body: '这是我自己写的正派势力。' }),
          updatedAt: '2026/6/17 10:03:00',
        },
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    expect(storedEntries.some((entry: { id: string }) => entry.id === 'old-auto-faction')).toBe(false);
    expect(storedEntries.some((entry: { id: string }) => entry.id === 'old-auto-item')).toBe(false);
    expect(storedEntries.some((entry: { id: string }) => entry.id === 'old-auto-location')).toBe(false);
    const userFactionEntry = storedEntries.find((entry: { id: string }) => entry.id === 'user-faction');
    expect(JSON.parse(userFactionEntry.content).body).toBe('这是我自己写的正派势力。');
  });
});
