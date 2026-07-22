import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WorkbenchContextLibraryModal } from './WorkbenchContextLibraryModal';

describe('WorkbenchContextLibraryModal positioning', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.removeProperty('--xinyuexia-effective-scale');
  });

  it('ignores the retired upper-left geometry and opens centered', () => {
    document.documentElement.style.setProperty('--xinyuexia-effective-scale', '1.1');
    localStorage.setItem(
      'xinyuexia_modal_position_workbench_context_library',
      JSON.stringify({ x: 0, y: 0, left: 235.31, top: 48, width: 1071, height: 660 }),
    );

    render(
      <WorkbenchContextLibraryModal
        open
        tab="outlineChapter"
        rows={[]}
        columns={[]}
        selectedIds={new Set()}
        lockedIds={new Set()}
        searchText=""
        selectedItems={[]}
        chapterWords={0}
        summaryWords={0}
        outlineWords={0}
        totalWords={0}
        canConfirm={false}
        confirmTitle=""
        onClose={vi.fn()}
        onTabChange={vi.fn()}
        onSearchChange={vi.fn()}
        onToggleChapter={vi.fn()}
        onPickItem={vi.fn()}
        onSelectRecent={vi.fn()}
        onClear={vi.fn()}
        onToggle={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    const dialog = document.querySelector('[data-draggable-managed="true"]') as HTMLElement;
    expect(dialog).toBeInTheDocument();
    expect(dialog.style.left).toBe('');
    expect(dialog.style.top).toBe('');
    expect(dialog.style.transform).toBe('translate(0px, 0px)');
    expect(dialog.parentElement).toHaveClass('fixed', 'inset-0', 'items-center', 'justify-center');
  });
});
