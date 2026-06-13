import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WORKBENCH_HEADER_FLOW_ITEMS } from '@/features/workbench/model/workbenchCreationFlow';

import { WorkbenchHeader } from './WorkbenchHeader';

const readSource = (relativePath: string) => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8')
);

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
    expect(capsuleGroups[2]).toContainElement(screen.getByRole('button', { name: '梗概' }));

    const creationButtons = Array.from(capsuleGroups[1].querySelectorAll('button')).map((button) => button.textContent);
    expect(creationButtons).toEqual(['脑洞', '设定', '章纲', '正文']);
    expect(creationButtons).not.toContain('剧情链');

    for (const label of ['作品信息', '设定', '章纲', '正文', '脑洞', '审核', '点评', '润色', '状态', '梗概']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
    expect(screen.queryByRole('button', { name: '剧情链' })).not.toBeInTheDocument();
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

  it('renders flow stats with the option 02 compact double-line layout', () => {
    const { container } = render(
      <WorkbenchHeader
        workTitle="默认小说1"
        flowItems={WORKBENCH_HEADER_FLOW_ITEMS}
        activeFlow="writing"
        flowStats={{
          brainstorm: { meta: '12个脑洞' },
          outline: { meta: '28个设定' },
          chapterOutline: { meta: '46章' },
          writing: { meta: '46章' },
          audit: { meta: '11章未审', tone: 'warning' },
          comment: { meta: '19章未点评', tone: 'warning' },
          status: { meta: '8章未更新', tone: 'warning' },
          summary: { meta: '43章', tone: 'warning' },
        }}
        onOpenWorkInfo={vi.fn()}
        onSelectFlow={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /脑洞.*12个脑洞/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /正文.*46章/ })).toHaveClass('xy-active');
    expect(screen.getByRole('button', { name: /审核.*11章未审/ })).toHaveClass('xy-flow-warning');
    expect(container.querySelectorAll('.xy-flow-status-group')).toHaveLength(2);
    expect(container.querySelectorAll('.xy-flow-status-meta-warning')).toHaveLength(4);
    const flowGroups = container.querySelector('.xy-workbench-flow-groups');
    expect(flowGroups).not.toBeNull();
    expect(flowGroups).toHaveClass('ml-8');
    const styleSource = readSource('../../../shared/styles/index.css');
    expect(styleSource).toContain('min-height: 2.5rem;');
    expect(styleSource).toContain('min-width: 4.875rem;');
    expect(styleSource).toContain('flex-direction: column;');
    expect(styleSource).toContain('border: 1px solid #D8E1EC;');
    expect(styleSource).toContain('border-left: 1px solid #D8E1EC;');
    expect(styleSource).toContain('font-size: 0.5625rem;');
    expect(styleSource).not.toContain('border: 1px solid #CBD5E1;');
    expect(styleSource).not.toContain('border-left: 1px solid #E2E8F0;');
    expect(styleSource).not.toContain('min-width: 8.25rem;');
    expect(styleSource).not.toContain('background: #fff1e2;');
  });

  it('applies the option 02 compact border without importing preview-only dividers', () => {
    const styleSource = readSource('../../../shared/styles/index.css');

    expect(styleSource).toContain('border: 1px solid #D8E1EC;');
    expect(styleSource).toContain('border-left: 1px solid #D8E1EC;');
    expect(styleSource).toContain('border-color: #8FE4F2;');
    expect(styleSource).toContain('background: var(--xy-custom-flow-group-bg);');
    expect(styleSource).toContain('border-right-color: transparent;');
    expect(styleSource).not.toContain('box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);');
    expect(styleSource).not.toContain('border: 1px solid #111827;');
    expect(styleSource).not.toContain('box-shadow: 0 0 0 1px rgba(17, 24, 39, 0.12);');
    expect(styleSource.indexOf('.xy-flow-status-group > * + *')).toBeGreaterThan(styleSource.indexOf('.xy-flow-status-button {'));
    expect(styleSource.indexOf('.xy-flow-status-button.xy-active')).toBeGreaterThan(styleSource.indexOf('.xy-flow-status-group > * + *'));
  });

  it('renders extra tools before field size and log actions', () => {
    const { container } = render(
      <WorkbenchHeader
        workTitle="榛樿灏忚1"
        flowItems={WORKBENCH_HEADER_FLOW_ITEMS}
        activeFlow="chapterOutline"
        fieldSizeVisible
        logVisible
        extraTools={<span data-testid="extra-tool">14</span>}
        onOpenWorkInfo={vi.fn()}
        onOpenFieldSize={vi.fn()}
        onOpenLog={vi.fn()}
        onSelectFlow={vi.fn()}
      />,
    );

    const rightTools = container.querySelector('.absolute.right-5');
    expect(rightTools).not.toBeNull();
    expect(rightTools?.children[0]).toBe(screen.getByTestId('extra-tool'));
    expect(rightTools?.children[1]?.tagName).toBe('BUTTON');
    expect(rightTools?.children[2]?.tagName).toBe('BUTTON');
  });
});
