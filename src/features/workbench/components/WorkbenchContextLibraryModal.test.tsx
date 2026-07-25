import { render, screen } from '@testing-library/react';
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

  it('uses one compact summary row without the redundant selected-item line', () => {
    render(
      <WorkbenchContextLibraryModal
        open
        tab="outlineChapter"
        rows={[]}
        columns={[]}
        selectedIds={new Set()}
        lockedIds={new Set()}
        searchText=""
        chapterWords={3868}
        summaryWords={0}
        outlineWords={0}
        totalWords={3868}
        canConfirm
        confirmTitle="确认关联资料"
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

    const summary = screen.getByTestId('context-library-summary');
    expect(screen.queryByText(/将读取/)).not.toBeInTheDocument();
    expect(summary).toHaveTextContent(/正文\s*3868\s*字/);
    expect(summary).toHaveTextContent(/梗概\s*无/);
    expect(summary).toHaveTextContent(/章纲\s*无/);
    expect(summary).toHaveTextContent(/合计\s*3868\s*字/);
    expect(screen.getByTestId('context-library-footer')).toHaveClass('py-3');
    expect(screen.getByRole('button', { name: '确认关联' })).toBeEnabled();
  });
});
