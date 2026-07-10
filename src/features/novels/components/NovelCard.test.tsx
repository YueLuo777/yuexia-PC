import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');

describe('NovelCard cover and menu behavior', () => {
  it('uses the reference-style default book cover without the private badge', () => {
    const cardSource = readSource('NovelCard.tsx');
    const styles = readSource('../../../shared/styles/index.css');

    expect(cardSource).toContainSource("import { Feather, MoreHorizontal } from 'lucide-react';");
    expect(cardSource).toContainSource("novel.cover ? 'xy-wa-book-cover-image' : 'xy-wa-book-cover-empty'");
    expect(cardSource).not.toContainSource('私密');
    expect(cardSource).not.toContainSource('绉佸瘑');
    expect(styles).toContainSource('.xy-wa-book-cover-empty {');
    expect(styles).toContainSource('.xy-wa-book-cover-empty::before {');
    expect(styles).toContainSource('linear-gradient(145deg, #a9d7ff 0%, #89b9ff 100%);');
  });

  it('closes the more menu when the user clicks outside the card', () => {
    const cardSource = readSource('NovelCard.tsx');

    expect(cardSource).toContainSource('const cardRef = useRef<HTMLElement | null>(null);');
    expect(cardSource).toContainSource('if (cardRef.current?.contains(target)) return;');
    expect(cardSource).toContainSource("window.addEventListener('pointerdown', handlePointerDown, true);");
    expect(cardSource).toContainSource("window.removeEventListener('pointerdown', handlePointerDown, true);");
    expect(cardSource).toContainSource("if (event.key === 'Escape') setIsMenuOpen(false);");
    expect(cardSource).toContainSource('aria-haspopup="menu"');
    expect(cardSource).toContainSource('aria-expanded={isMenuOpen}');
  });
});
