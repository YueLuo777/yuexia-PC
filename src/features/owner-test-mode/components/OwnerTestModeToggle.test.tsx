import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { readOwnerTestMode } from '@/features/owner-test-mode/model/ownerTestMode';
import { readApplicationMode, writeApplicationMode } from '@/shared/mode/applicationMode';

import { OwnerTestModeToggle } from './OwnerTestModeToggle';

describe('OwnerTestModeToggle', () => {
  beforeEach(() => localStorage.clear());

  it('enters the owner test workspace through standard mode and can exit independently', () => {
    writeApplicationMode('professional');
    render(<OwnerTestModeToggle />);

    fireEvent.click(screen.getByRole('button', { name: '进入测试模式' }));
    expect(readApplicationMode()).toBe('standard');
    expect(readOwnerTestMode()).toBe(true);
    expect(screen.getByRole('button', { name: '退出测试模式' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '退出测试模式' }));
    expect(readOwnerTestMode()).toBe(false);
  });
});
