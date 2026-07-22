import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UiConsistencyPlainLanguageExplainer } from './UiConsistencyPlainLanguageExplainers';

describe('UiConsistencyPlainLanguageExplainer', () => {
  it('explains the workflow shell and modal mask in plain language', () => {
    const { rerender } = render(<UiConsistencyPlainLanguageExplainer groupNumber={3} />);
    expect(screen.getByText(/里面差不多，外面的窗口不一样/)).toBeInTheDocument();
    expect(screen.getByText(/建议用点评／润色的可拖动、可缩放外壳/)).toBeInTheDocument();

    rerender(<UiConsistencyPlainLanguageExplainer groupNumber={4} />);
    expect(screen.getByText(/“遮罩”就是弹窗后面那层半透明灰黑背景/)).toBeInTheDocument();
    expect(screen.getByText('最后具体统一这些地方')).toBeInTheDocument();
  });

  it('states that compact forms, confirmations and empty states are not alternatives', () => {
    render(<UiConsistencyPlainLanguageExplainer groupNumber={6} />);

    expect(screen.getByText(/这三项不是三个版本，不能三选一/)).toBeInTheDocument();
    expect(screen.getByText(/分别建立FormDialog、ConfirmDialog和EmptyState三套公共组件/)).toBeInTheDocument();
  });
});
