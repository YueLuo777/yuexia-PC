import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { WorkbenchCreationFlowPageKey } from '@/features/workbench/model/workbenchCreationFlow';

vi.mock('@/features/workbench/components/WorkbenchHeader', () => ({
  WorkbenchHeader: ({
    activeFlow,
    onSelectFlow,
  }: {
    activeFlow: WorkbenchCreationFlowPageKey;
    onSelectFlow: (flow: WorkbenchCreationFlowPageKey) => void;
  }) => (
    <header>
      {(['brainstorm', 'outline', 'chapterOutline', 'writing', 'audit', 'status', 'summary', 'polish', 'comment'] as const).map(
        (flow) => (
          <button key={flow} type="button" aria-current={activeFlow === flow ? 'page' : undefined} onClick={() => onSelectFlow(flow)}>
            {flow}
          </button>
        ),
      )}
    </header>
  ),
}));

vi.mock('@/features/workbench/components/WorkbenchCreationFlowContent', () => ({
  WorkbenchCreationFlowContent: ({ activeFlow }: { activeFlow: WorkbenchCreationFlowPageKey }) => (
    <main data-testid="formal-flow-content">{activeFlow}</main>
  ),
}));

vi.mock('@/features/workbench/components/WorkbenchWritingLayout', () => ({
  WorkbenchWritingLayout: ({ writing, content }: { writing: boolean; content: ReactNode }) => (
    <div data-testid="formal-writing-layout" data-writing={String(writing)}>
      {content}
    </div>
  ),
}));

import { ProfessionalWorkbenchBaselineTestPage } from './ProfessionalWorkbenchBaselineTestPage';
import { readTestCollectionSource } from './testCollectionSource.testUtils';

describe('ProfessionalWorkbenchBaselineTestPage', () => {
  it('replaces test 13 with the professional-mode baseline', () => {
    const collection = readTestCollectionSource();
    expect(collection).toContain("path: '/professional-workbench-baseline-test'");
    expect(collection).not.toContain("path: '/simplified-standard-mode-workbench-test'");
  });

  it('uses the formal header, flow content, writing layout, and AI panel contract', () => {
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), 'ProfessionalWorkbenchBaselineTestPage.tsx'),
      'utf8',
    );
    expect(source).toContain("from '@/features/workbench/components/WorkbenchCreationFlowContent'");
    expect(source).toContain("from '@/features/workbench/components/WorkbenchHeader'");
    expect(source).toContain("from '@/features/workbench/components/WorkbenchWritingLayout'");
    expect(source).toContain('aiPanelProps={{');
    expect(source).not.toContain('PRIMARY_ACTIONS');
    expect(source).not.toContain('STAGE_GROUPS');
  });

  it('switches all nine original professional flows from the formal header', () => {
    render(<ProfessionalWorkbenchBaselineTestPage />);
    expect(screen.getByTestId('formal-flow-content')).toHaveTextContent('brainstorm');

    for (const flow of ['outline', 'chapterOutline', 'writing', 'audit', 'status', 'summary', 'polish', 'comment']) {
      fireEvent.click(screen.getByRole('button', { name: flow }));
      expect(screen.getByTestId('formal-flow-content')).toHaveTextContent(flow);
    }

    fireEvent.click(screen.getByRole('button', { name: 'writing' }));
    expect(screen.getByTestId('formal-writing-layout')).toHaveAttribute('data-writing', 'true');
  });
});
