import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { WorkbenchPlotPointCandidate } from '@/features/workbench/model/workbenchPlotChain';

import { PlotPointChainWorkspace } from './workbenchPlotPointChainWorkspace';

const candidate: WorkbenchPlotPointCandidate = {
  id: 'point-1',
  title: '缴费窗口冲突',
  source: 'AI生成',
  originalGenre: '都市',
  original: '',
  adapted: '主角在缴费窗口遭到阻拦，只能当场寻找突破口。',
  variable: '缴费窗口 / 阻拦 / 突破口',
  score: '86',
};

const renderWorkspace = (overrides: Partial<Parameters<typeof PlotPointChainWorkspace>[0]> = {}) => {
  const props: Parameters<typeof PlotPointChainWorkspace>[0] = {
    filterMode: 'all',
    selectedItems: [candidate],
    visibleSelectedItems: [candidate],
    writtenIds: new Set(),
    activeItemId: candidate.id,
    expandedPreviewIds: [],
    visibleCandidates: [candidate],
    selectedIds: [candidate.id],
    hasChain: true,
    isFollowupStage: false,
    isLoading: false,
    leftResizeHandle: <div data-testid="resize-handle" />,
    onFilterChange: vi.fn(),
    onOpenDetailOutline: vi.fn(),
    onSelectActiveItem: vi.fn(),
    onTogglePreviewExpanded: vi.fn(),
    onMarkWritten: vi.fn(),
    onMoveToUnwritten: vi.fn(),
    onToggleCandidate: vi.fn(),
    onClearPreview: vi.fn(),
    onRegenerate: vi.fn(),
    onContinue: vi.fn(),
    ...overrides,
  };
  render(<PlotPointChainWorkspace {...props} />);
  return props;
};

describe('PlotPointChainWorkspace', () => {
  it('keeps chain filters, selected actions and candidate selection wired', () => {
    const props = renderWorkspace();

    fireEvent.click(screen.getByRole('button', { name: '只看未写' }));
    fireEvent.click(screen.getByRole('button', { name: '标为已写' }));
    fireEvent.click(screen.getByRole('button', { name: '删除' }));
    fireEvent.click(screen.getByRole('button', { name: '已选' }));

    expect(props.onFilterChange).toHaveBeenCalledWith('unwritten');
    expect(props.onMarkWritten).toHaveBeenCalledWith(candidate.id);
    expect(props.onToggleCandidate).toHaveBeenCalledWith(candidate.id);
    expect(screen.getByTestId('resize-handle')).toBeInTheDocument();
  });

  it('uses move-back for written points and disables generation actions while loading', () => {
    const props = renderWorkspace({ writtenIds: new Set([candidate.id]), isLoading: true });

    fireEvent.click(screen.getByRole('button', { name: '移回未写' }));
    expect(props.onMoveToUnwritten).toHaveBeenCalledWith(candidate.id);
    expect(screen.getByRole('button', { name: '重新生成' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '继续生成' })).toBeDisabled();
  });
});
