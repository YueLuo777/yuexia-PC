import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { APPLICATION_MODE_STORAGE_KEY } from '@/shared/mode/applicationMode';
import { ApplicationModeToggle } from './ApplicationModeToggle';

describe('ApplicationModeToggle', () => {
  afterEach(() => {
    localStorage.removeItem(APPLICATION_MODE_STORAGE_KEY);
  });

  it('switches between the professional and standard labels', () => {
    render(<ApplicationModeToggle />);

    fireEvent.click(screen.getByRole('button', { name: '进入标准模式' }));
    expect(screen.getByRole('button', { name: '进入专业模式' })).toBeInTheDocument();
    expect(localStorage.getItem(APPLICATION_MODE_STORAGE_KEY)).toBe('standard');
  });
});

