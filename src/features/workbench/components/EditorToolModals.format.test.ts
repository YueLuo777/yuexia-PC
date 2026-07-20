import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { applyFormat, applyParagraphIndentToText, removeParagraphInnerFullWidthSpaces } from './EditorToolModals';

const readSource = () => {
  const baseDir = dirname(fileURLToPath(import.meta.url));
  return [
    'EditorToolModals.tsx',
    'editorToolState.ts',
    'EditorToolModalShell.tsx',
    'EditorGenerateModals.tsx',
    'EditorAiGenerateModal.tsx',
    'EditorFontSettingsModal.tsx',
    'EditorSmartFormatModal.tsx',
    'EditorReplaceTools.tsx',
    'EditorHistoryModals.tsx',
    'ChapterEditorModalHost.tsx',
  ]
    .map((file) => readFileSync(join(baseDir, file), 'utf8'))
    .join('\n\n');
};

describe('EditorToolModals smart format', () => {
  it('persists format switches immediately and describes paragraph indentation accurately', () => {
    const source = readSource();

    expect(source).toContainSource('writeJson(SMART_FORMAT_KEY, next);');
    expect(source).toContainSource('onSettingsChange?.(next);');
    expect(source).toContainSource('每个非空段落开头写入两个全角空格');
    expect(source).not.toContainSource('视觉缩进，不写入正文空格');
    expect(source).toContainSource('onSettingsChange={setFormatSettings}');
  });

  it('always removes full-width spaces inside paragraphs without a visible option', () => {
    const text = '123123131231241234\u3000\u3000aaaa\u3000\u3000bbbb';

    expect(applyFormat(text, { paragraphIndent: false, mergeParagraphs: true })).toBe('123123131231241234aaaabbbb');
  });

  it('does not treat paragraph-leading full-width spaces as inner spaces', () => {
    expect(removeParagraphInnerFullWidthSpaces('\u3000\u3000first\u3000\u3000middle\nsecond\u3000\u3000middle')).toBe(
      '\u3000\u3000firstmiddle\nsecondmiddle',
    );
  });

  it('writes paragraph indent as real textarea text without stacking spaces', () => {
    const formatted = applyFormat('  first\n\u3000\u3000second', { paragraphIndent: true, mergeParagraphs: true });

    expect(formatted).toBe('\u3000\u3000first\n\u3000\u3000second');
    expect(applyParagraphIndentToText(formatted, true)).toBe('\u3000\u3000first\n\u3000\u3000second');
    expect(applyParagraphIndentToText(formatted, false)).toBe('first\nsecond');
  });

  it('keeps the smart format modal compact without large empty gutters', () => {
    const modalSource = readSource();

    expect(modalSource).toContainSource('className="px-5 py-3"');
    expect(modalSource).toContainSource(
      'className="flex items-start justify-between border-b border-gray-100 py-2.5 last:border-0"',
    );
    expect(modalSource).toContainSource(
      'className="flex items-center justify-between border-t border-gray-100 px-5 py-2.5"',
    );
    expect(modalSource).toContainSource('className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3"');
    expect(modalSource).not.toContainSource('className="space-y-1 p-5"');
    expect(modalSource).not.toContainSource('border-b border-gray-100 py-3 last:border-0');
  });
});
