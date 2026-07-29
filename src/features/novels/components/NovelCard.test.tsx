import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { NovelCard } from './NovelCard';

const readSource = (relativePath: string) =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');

describe('NovelCard cover and menu behavior', () => {
  it('uses the configured moon cover for novels without a custom cover', () => {
    const cardSource = readSource('NovelCard.tsx');

    expect(cardSource).toContainSource("import { Check, ChevronRight, Feather, MoreHorizontal } from 'lucide-react';");
    expect(cardSource).toContainSource(
      "const coverSrc = novel.cover || (novel.type === 'novel' ? defaultCoverSrc : undefined);",
    );
    expect(cardSource).toContainSource("coverSrc ? 'xy-wa-book-cover-image' : 'xy-wa-book-cover-empty'");
    expect(cardSource).toContainSource("alt={novel.cover ? '封面' : '默认封面'}");
    expect(cardSource).not.toContainSource('isSelected');
    expect(cardSource).not.toContainSource('border-[#1e71ef] ring-2 ring-[#1e71ef]/20');
    expect(cardSource).toContainSource('border border-[#d8dde6]');
    expect(cardSource).not.toContainSource('私密');
    expect(cardSource).not.toContainSource('绉佸瘑');
  });

  it('opens the professional workbench from the cover hover button', () => {
    const onOpen = vi.fn();
    const onOpenStandardWorkbench = vi.fn();
    render(
      <NovelCard
        novel={{
          id: 11,
          title: '吞噬系统',
          type: 'novel',
          category: '玄幻',
          wordCount: 0,
          createdAt: '2026/7/29',
          lastModifiedAt: '2026/7/29',
        }}
        settings={{ cardWidth: 'medium', coverHeight: 'medium' }}
        categories={['未分类', '玄幻']}
        onOpen={onOpen}
        onOpenStandardWorkbench={onOpenStandardWorkbench}
        onRename={vi.fn()}
        onCover={vi.fn()}
        onExport={vi.fn()}
        onMoveToCategory={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const button = screen.getByRole('button', { name: '进入工作台' });
    expect(button.closest('[data-professional-workbench-overlay="true"]')).toHaveClass('opacity-0');
    fireEvent.click(button);
    expect(onOpenStandardWorkbench).toHaveBeenCalledWith(11);
    expect(onOpen).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('heading', { name: '吞噬系统' }).closest('article')!);
    expect(onOpen).toHaveBeenCalledWith(11);
  });

  it('closes the more menu when the user clicks outside the card', () => {
    const cardSource = readSource('NovelCard.tsx');

    expect(cardSource).toContainSource('const cardRef = useRef<HTMLElement | null>(null);');
    expect(cardSource).toContainSource('if (cardRef.current?.contains(target)) return;');
    expect(cardSource).toContainSource("window.addEventListener('pointerdown', handlePointerDown, true);");
    expect(cardSource).toContainSource("window.removeEventListener('pointerdown', handlePointerDown, true);");
    expect(cardSource).toContainSource("if (event.key === 'Escape') {");
    expect(cardSource).toContainSource('setIsMoveMenuOpen(false);');
    expect(cardSource).toContainSource('aria-haspopup="menu"');
    expect(cardSource).toContainSource('aria-expanded={isMenuOpen}');
  });

  it('moves a work from the category submenu and keeps both menus open', () => {
    const cardSource = readSource('NovelCard.tsx');
    const onMoveToCategory = vi.fn();

    expect(cardSource).toContainSource('aria-label="作品操作菜单"');
    expect(cardSource).toContainSource('w-[222px] rounded-xl');
    expect(cardSource).toContainSource("最近更新：{novel.lastModifiedAt || '暂无记录'}");
    expect(cardSource).toContainSource('getMenuLabel');
    expect(cardSource).toContainSource('left-[calc(100%-1px)] top-0');
    expect(cardSource).not.toContainSource('left-full top-0 z-30 ml-1');

    render(
      <NovelCard
        novel={{
          id: 7,
          title: '测试作品',
          type: 'novel',
          category: '玄幻',
          wordCount: 1200,
          createdAt: '2026/7/19',
          lastModifiedAt: '2026/7/19',
        }}
        settings={{ cardWidth: 'medium', coverHeight: 'medium' }}
        categories={['未分类', '玄幻', '都市', '仙侠']}
        onOpen={vi.fn()}
        onOpenStandardWorkbench={vi.fn()}
        onRename={vi.fn()}
        onCover={vi.fn()}
        onExport={vi.fn()}
        onMoveToCategory={onMoveToCategory}
        onDelete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTitle('更多'));
    fireEvent.mouseEnter(screen.getByRole('menuitem', { name: '移入分类' }));

    expect(screen.getByRole('menuitemradio', { name: '玄幻' })).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByRole('menuitemradio', { name: '都市' }));

    expect(onMoveToCategory).toHaveBeenCalledWith(7, '都市');
    expect(screen.getByRole('menuitem', { name: '移入分类' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu', { name: '分类选择' })).toBeInTheDocument();
  });
});
