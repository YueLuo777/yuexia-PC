import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WindowSettingsCompactSection } from './SystemSettingsCompactSections';

describe('WindowSettingsCompactSection', () => {
  it('integrates memory mode, startup presets, and custom dimensions', () => {
    const onApplyStartupBounds = vi.fn();
    render(
      <WindowSettingsCompactSection
        settings={{
          rememberSize: false,
          startMaximized: false,
          startupBounds: { width: 1600, height: 900 },
          defaultBounds: { width: 1600, height: 900 },
          currentBounds: { x: 100, y: 80, width: 1602, height: 902 },
        }}
        onToggleRemember={vi.fn()}
        onToggleStartMaximized={vi.fn()}
        onApplyStartupBounds={onApplyStartupBounds}
      />,
    );

    expect(screen.getByRole('heading', { name: '窗口大小' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: '窗口大小记忆' })).not.toBeChecked();
    expect(screen.getByRole('group')).not.toBeDisabled();
    expect(screen.getByText('默认 1600 × 900')).toBeInTheDocument();
    expect(screen.getByText('当前 1602 × 902')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1600 × 900' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '1366 × 768' })).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(screen.getByRole('button', { name: '2064 × 1120' }));
    expect(onApplyStartupBounds).toHaveBeenCalledWith({ width: 2064, height: 1120 });

    fireEvent.change(screen.getByRole('spinbutton', { name: '宽度' }), { target: { value: '1500' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: '高度' }), { target: { value: '840' } });
    fireEvent.click(screen.getByRole('button', { name: '应用并预览' }));
    expect(onApplyStartupBounds).toHaveBeenLastCalledWith({ width: 1500, height: 840 });
  });

  it('disables fixed startup controls while window size memory is enabled', () => {
    render(
      <WindowSettingsCompactSection
        settings={{
          rememberSize: true,
          startMaximized: false,
          startupBounds: { width: 1600, height: 900 },
          defaultBounds: { width: 1600, height: 900 },
          currentBounds: { x: 100, y: 80, width: 1800, height: 1000 },
        }}
        onToggleRemember={vi.fn()}
        onToggleStartMaximized={vi.fn()}
        onApplyStartupBounds={vi.fn()}
      />,
    );

    expect(screen.getByRole('checkbox', { name: '窗口大小记忆' })).toBeChecked();
    expect(screen.getByRole('group')).toBeDisabled();
    expect(screen.getByText('已由窗口大小记忆接管，此区域暂时失效。')).toBeInTheDocument();
  });

  it('disables fixed startup controls while start-maximized is enabled', () => {
    render(
      <WindowSettingsCompactSection
        settings={{
          rememberSize: false,
          startMaximized: true,
          startupBounds: { width: 1600, height: 900 },
          defaultBounds: { width: 1600, height: 900 },
          currentBounds: { x: 100, y: 80, width: 1800, height: 1000 },
        }}
        onToggleRemember={vi.fn()}
        onToggleStartMaximized={vi.fn()}
        onApplyStartupBounds={vi.fn()}
      />,
    );

    expect(screen.getByRole('checkbox', { name: '启动时最大化' })).toBeChecked();
    expect(screen.getByRole('group')).toBeDisabled();
    expect(screen.getByText('启动时最大化已开启，此区域暂时失效。')).toBeInTheDocument();
  });
});
