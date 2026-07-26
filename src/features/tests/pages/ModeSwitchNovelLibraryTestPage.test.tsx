import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./StandardModeProfessionalEditorPreview', () => ({
  StandardModeProfessionalEditorPreview: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="shared-body-editor">
      正文编辑器
      <button type="button" onClick={onBack}>
        返回书籍
      </button>
    </div>
  ),
}));

vi.mock('./StandardModeUnifiedWorkbenchPreview', () => ({
  StandardModeUnifiedWorkbenchPreview: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="shared-standard-workbench">
      标准模式工作台
      <button type="button" onClick={onBack}>
        返回书籍
      </button>
    </div>
  ),
}));

import { ModeSwitchNovelLibraryTestPage } from './ModeSwitchNovelLibraryTestPage';

describe('ModeSwitchNovelLibraryTestPage', () => {
  it('leaves application navigation to the shared shell and changes only the book-card actions when toggled', () => {
    render(<ModeSwitchNovelLibraryTestPage />);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /当前专业模式/ })).toHaveTextContent('专业模式');
    expect(screen.getByTestId('professional-novel-grid')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '进入创作工作台' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /当前专业模式/ }));

    expect(screen.getByRole('button', { name: /当前标准模式/ })).toHaveTextContent('标准模式');
    expect(screen.getByTestId('standard-novel-grid')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '进入创作工作台' })).toHaveLength(2);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('opens the shared body editor from the book and the guided workbench from its explicit button', () => {
    render(<ModeSwitchNovelLibraryTestPage />);
    fireEvent.click(screen.getByRole('button', { name: /当前专业模式/ }));

    const firstCard = screen.getAllByTestId('standard-mode-novel-card')[0];
    fireEvent.click(within(firstCard).getByRole('button', { name: '进入创作工作台' }));
    expect(screen.getByTestId('shared-standard-workbench')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '返回书籍' }));
    fireEvent.click(screen.getAllByRole('img', { name: '封面' })[0]);
    expect(screen.getByTestId('shared-body-editor')).toBeInTheDocument();
  });
});
