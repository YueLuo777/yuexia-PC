import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AssociationReaderItemRow } from './AssociationReaderItemRow';
import { BrainstormReaderModal } from './BrainstormReaderModal';

describe('AssociationReaderItemRow', () => {
  it('previews from the content area and selects only from the final square control', () => {
    const onPreview = vi.fn();
    const onToggle = vi.fn();
    const { container } = render(
      <AssociationReaderItemRow
        title="废土求生"
        selected={false}
        checked={false}
        meta="120字"
        onPreview={onPreview}
        onToggle={onToggle}
      />,
    );

    fireEvent.click(screen.getByText('废土求生').closest('button')!);
    expect(onPreview).toHaveBeenCalledOnce();
    expect(onToggle).not.toHaveBeenCalled();

    const selectionBox = screen.getByRole('button', { name: '选择废土求生' });
    expect(selectionBox).toHaveClass('rounded-[3px]');
    expect(selectionBox).not.toHaveClass('rounded-full', 'rounded-md');
    expect(selectionBox).toBeEmptyDOMElement();
    expect(selectionBox).not.toHaveClass('hover:text-[#08AACE]');
    expect(container.firstElementChild?.lastElementChild).toBe(selectionBox);

    fireEvent.click(selectionBox);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('renders the check mark only after the item is checked', () => {
    const { rerender } = render(
      <AssociationReaderItemRow
        title="万界吞噬"
        selected
        checked={false}
        onPreview={vi.fn()}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: '选择万界吞噬' })).toBeEmptyDOMElement();

    rerender(
      <AssociationReaderItemRow
        title="万界吞噬"
        selected
        checked
        onPreview={vi.fn()}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: '取消选择万界吞噬' })).toHaveTextContent('✓');
  });

  it('keeps brainstorm preview and single selection as separate actions', () => {
    const onSelect = vi.fn();
    render(
      <BrainstormReaderModal
        isOpen
        entries={[
          { id: 'idea-1', tab: '脑洞', title: '废土求生', content: '第一份内容', updatedAt: '2026-07-22' },
          { id: 'idea-2', tab: '脑洞', title: '仙侠经营', content: '第二份内容', updatedAt: '2026-07-22' },
        ]}
        selectedId={null}
        onSelect={onSelect}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('仙侠经营').closest('button')!);
    expect(screen.getByText('第二份内容')).toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '选择仙侠经营' }));
    expect(onSelect).toHaveBeenCalledWith('idea-2');
  });

  it('orders brainstorms by their library serial and labels the candidate area as a brainstorm list', () => {
    render(
      <BrainstormReaderModal
        isOpen
        entries={[
          {
            id: 'idea-2',
            tab: '脑洞',
            title: '第二个脑洞',
            content: '第二份内容',
            updatedAt: '2026-07-22',
            brainstormSerialNumber: 2,
          },
          {
            id: 'idea-1',
            tab: '脑洞',
            title: '第一个脑洞',
            content: '第一份内容',
            updatedAt: '2026-07-22',
            brainstormSerialNumber: 1,
          },
        ]}
        selectedId={null}
        onSelect={vi.fn()}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText('脑洞列表')).toBeInTheDocument();
    expect(screen.queryByText('候选书单')).not.toBeInTheDocument();
    const brainstormList = within(screen.getByTestId('brainstorm-reader-list'));
    const firstButton = brainstormList.getByText('第一个脑洞').closest('button')!;
    const secondButton = brainstormList.getByText('第二个脑洞').closest('button')!;
    expect(firstButton.compareDocumentPosition(secondButton)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(
      [...document.querySelectorAll('[data-association-reader-serial="true"]')].map((item) => item.textContent),
    ).toEqual(['1', '2']);
  });

  it('keeps long brainstorm names and metadata in one adaptive heading above a resizable split', () => {
    window.localStorage.clear();
    const longTitle = '万界吞噬之从边荒小城一路修炼到九重天巅峰';
    render(
      <BrainstormReaderModal
        isOpen
        entries={[
          {
            id: 'idea-long',
            tab: '脑洞',
            title: longTitle,
            content: '卖点：吞噬诸天万界',
            updatedAt: '2026-07-24 16:49:52',
          },
        ]}
        selectedId="idea-long"
        onSelect={vi.fn()}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.queryByText('单选 · 点击资料预览，点击右侧方框关联')).not.toBeInTheDocument();
    const heading = screen.getByTestId('brainstorm-preview-heading');
    const headingTitle = within(heading).getByText(longTitle);
    const metadata = screen.getByTestId('brainstorm-preview-meta');
    const previewContent = screen.getByTestId('brainstorm-preview-content');
    expect(headingTitle).toHaveClass('inline', 'break-words');
    expect(metadata).toHaveClass('inline-flex', 'flex-wrap', 'align-baseline', 'text-sm', 'leading-6');
    expect(metadata).toHaveTextContent(/字.*2026-07-24 16:49:52/);
    expect(metadata).not.toHaveTextContent('脑洞库');
    expect(metadata.querySelector('svg')).toBeNull();
    expect(heading).toContainElement(metadata);
    expect(previewContent).toHaveClass('px-5', 'pb-5', 'pt-2');
    expect(previewContent).not.toHaveClass('p-5');

    const grid = screen.getByTestId('brainstorm-reader-grid');
    const splitter = screen.getByRole('separator', { name: '调整脑洞列表宽度' });
    expect(grid).toHaveStyle({ gridTemplateColumns: '300px 8px minmax(0, 1fr)' });
    expect(splitter).toHaveAttribute('aria-valuenow', '300');

    fireEvent.keyDown(splitter, { key: 'ArrowRight' });
    expect(grid).toHaveStyle({ gridTemplateColumns: '312px 8px minmax(0, 1fr)' });
    expect(splitter).toHaveAttribute('aria-valuenow', '312');

    fireEvent.pointerDown(splitter, { pointerId: 1, clientX: 312 });
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 352 });
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 352 });
    expect(grid).toHaveStyle({ gridTemplateColumns: '352px 8px minmax(0, 1fr)' });
    expect(window.localStorage.getItem('xinyuexia_brainstorm_reader_candidate_width_v1')).toBe('352');
  });
});
