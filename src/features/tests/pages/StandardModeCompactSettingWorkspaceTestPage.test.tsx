import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { StandardModeCompactSettingWorkspaceTestPage } from './StandardModeCompactSettingWorkspaceTestPage';

describe('StandardModeCompactSettingWorkspaceTestPage', () => {
  beforeEach(() => localStorage.clear());

  it('preserves the replaced three-column standard setting workspace in test 23', async () => {
    render(<StandardModeCompactSettingWorkspaceTestPage />);

    await waitFor(() => expect(screen.getByRole('navigation', { name: '设定目录' })).toBeInTheDocument());
    expect(screen.getByLabelText('设定名')).toHaveValue('作品定位');
    expect(screen.getByText('设定检查')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '一键检查' })).toBeInTheDocument();
  });
});
