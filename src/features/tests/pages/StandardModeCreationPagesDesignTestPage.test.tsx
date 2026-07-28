import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

import { StandardModeCreationPagesDesignTestPage } from '@/features/tests/pages/StandardModeCreationPagesDesignTestPage';

vi.mock('@/features/tests/pages/ProfessionalWorkbenchBaselineTestPage', () => ({
  ProfessionalWorkbenchBaselineTestPage: ({
    experience,
    fixedFlow,
  }: {
    experience: string;
    fixedFlow: string;
  }) => <div data-testid="shared-professional-workbench" data-experience={experience} data-flow={fixedFlow} />,
}));

const directory = dirname(fileURLToPath(import.meta.url));

describe('StandardModeCreationPagesDesignTestPage', () => {
  it('switches professional workbench flows without replacing their business pages', () => {
    render(<StandardModeCreationPagesDesignTestPage />);

    const sharedWorkbench = screen.getByTestId('shared-professional-workbench');
    expect(sharedWorkbench).toHaveAttribute('data-experience', 'standard');
    expect(sharedWorkbench).toHaveAttribute('data-flow', 'outline');

    fireEvent.click(screen.getByRole('button', { name: '章纲' }));
    expect(sharedWorkbench).toHaveAttribute('data-flow', 'chapterOutline');
    fireEvent.click(screen.getByRole('button', { name: '正文' }));
    expect(sharedWorkbench).toHaveAttribute('data-flow', 'writing');
    fireEvent.click(screen.getByRole('button', { name: '审核剧情' }));
    expect(sharedWorkbench).toHaveAttribute('data-flow', 'audit');
  });

  it('contains only a presentation adapter and reuses the professional production component chain', () => {
    const pageSource = readFileSync(join(directory, 'StandardModeCreationPagesDesignTestPage.tsx'), 'utf8');
    const baselineSource = readFileSync(join(directory, 'ProfessionalWorkbenchBaselineTestPage.tsx'), 'utf8');

    expect(pageSource).toContain('ProfessionalWorkbenchBaselineTestPage');
    expect(pageSource).toContain('experience="standard"');
    expect(pageSource).not.toContain('SETTING_FIELDS');
    expect(pageSource).not.toContain('CHAPTERS');
    expect(pageSource).not.toContain('开始审核');
    expect(baselineSource).toContain('<WorkbenchCreationFlowContent');
    expect(baselineSource).toContain('<WorkbenchWritingLayout');
    expect(baselineSource).toContain("standardMode={experience === 'standard'}");
  });
});
