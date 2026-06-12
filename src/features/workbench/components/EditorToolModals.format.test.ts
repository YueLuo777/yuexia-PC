import { describe, expect, it } from 'vitest';

import { applyFormat, removeParagraphInnerFullWidthSpaces } from './EditorToolModals';

describe('EditorToolModals smart format', () => {
  it('always removes full-width spaces inside paragraphs without a visible option', () => {
    const text = '123123131231241234\u3000\u3000aaaa\u3000\u3000bbbb';

    expect(applyFormat(text, { paragraphIndent: false, mergeParagraphs: true })).toBe(
      '123123131231241234aaaabbbb',
    );
  });

  it('does not treat paragraph-leading full-width spaces as inner spaces', () => {
    expect(removeParagraphInnerFullWidthSpaces('\u3000\u3000first\u3000\u3000middle\nsecond\u3000\u3000middle')).toBe(
      '\u3000\u3000firstmiddle\nsecondmiddle',
    );
  });

  it('keeps paragraph indent as visual state instead of writing full-width spaces', () => {
    const formatted = applyFormat('  first\n\u3000\u3000second', { paragraphIndent: true, mergeParagraphs: true });

    expect(formatted).toBe('first\nsecond');
    expect(formatted).not.toContain('\u3000\u3000');
  });
});
