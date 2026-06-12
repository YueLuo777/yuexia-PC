import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8')
);

describe('NovelCard cover and menu behavior', () => {
  it('uses the reference-style default book cover without the private badge', () => {
    const cardSource = readSource('NovelCard.tsx');
    const styles = readSource('../../../shared/styles/index.css');

    expect(cardSource).toContain("import { Feather, MoreHorizontal } from 'lucide-react';");
    expect(cardSource).toContain("novel.cover ? 'xy-wa-book-cover-image' : 'xy-wa-book-cover-empty'");
    expect(cardSource).not.toContain('私密');
    expect(cardSource).not.toContain('绉佸瘑');
    expect(styles).toContain('.xy-wa-book-cover-empty {');
    expect(styles).toContain('.xy-wa-book-cover-empty::before {');
    expect(styles).toContain('linear-gradient(145deg, #a9d7ff 0%, #89b9ff 100%);');
  });

  it('closes the more menu when the user clicks outside the card', () => {
    const cardSource = readSource('NovelCard.tsx');

    expect(cardSource).toContain('const cardRef = useRef<HTMLElement | null>(null);');
    expect(cardSource).toContain('if (cardRef.current?.contains(target)) return;');
    expect(cardSource).toContain("window.addEventListener('pointerdown', handlePointerDown, true);");
    expect(cardSource).toContain("window.removeEventListener('pointerdown', handlePointerDown, true);");
    expect(cardSource).toContain("if (event.key === 'Escape') setIsMenuOpen(false);");
    expect(cardSource).toContain('aria-haspopup="menu"');
    expect(cardSource).toContain('aria-expanded={isMenuOpen}');
  });
});
