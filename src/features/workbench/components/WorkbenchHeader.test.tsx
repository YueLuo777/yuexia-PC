import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WORKBENCH_HEADER_FLOW_ITEMS } from '@/features/workbench/model/workbenchCreationFlow';

import { WorkbenchHeader } from './WorkbenchHeader';

describe('WorkbenchHeader', () => {
  it('renders work info, creation flow, and review flow as separate button groups', () => {
    const { container } = render(
      <WorkbenchHeader
        workTitle="默认小说1"
        flowItems={WORKBENCH_HEADER_FLOW_ITEMS}
        activeFlow="writing"
        onOpenWorkInfo={vi.fn()}
        onSelectFlow={vi.fn()}
      />,
    );

    const capsuleGroups = container.querySelectorAll('.xy-capsule-group');
    expect(capsuleGroups).toHaveLength(3);
    expect(capsuleGroups[0]).toContainElement(screen.getByRole('button', { name: '作品信息' }));
    expect(capsuleGroups[0]).not.toContainElement(screen.getByRole('button', { name: '脑洞' }));
    expect(capsuleGroups[1]).toContainElement(screen.getByRole('button', { name: '脑洞' }));
    expect(capsuleGroups[1]).toContainElement(screen.getByRole('button', { name: '正文' }));
    expect(capsuleGroups[1]).not.toContainElement(screen.getByRole('button', { name: '审核' }));
    expect(capsuleGroups[2]).toContainElement(screen.getByRole('button', { name: '审核' }));
    expect(capsuleGroups[2]).toContainElement(screen.getByRole('button', { name: '概要' }));

    const creationButtons = Array.from(capsuleGroups[1].querySelectorAll('button')).map((button) => button.textContent);
    expect(creationButtons).toEqual(['大纲', '剧情链', '章纲', '正文', '脑洞']);

    for (const label of ['作品信息', '大纲', '剧情链', '章纲', '正文', '脑洞', '审核', '点评', '状态', '概要']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
  });

  it('calls the selected flow when clicking brainstorm', () => {
    const onSelectFlow = vi.fn();
    render(
      <WorkbenchHeader
        workTitle="默认小说1"
        flowItems={WORKBENCH_HEADER_FLOW_ITEMS}
        activeFlow="writing"
        onOpenWorkInfo={vi.fn()}
        onSelectFlow={onSelectFlow}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '脑洞' }));

    expect(onSelectFlow).toHaveBeenCalledWith('brainstorm');
  });
});
