import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { SettingsPage } from './SettingsPage';

describe('SettingsPage hierarchy', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps only window settings in user settings and moves association and app icon into test settings', () => {
    render(
      <MemoryRouter initialEntries={['/settings?section=system']}>
        <SettingsPage />
      </MemoryRouter>,
    );

    const primaryNavigation = screen.getByRole('navigation', { name: '用户设置顶部导航' });
    expect(primaryNavigation).not.toHaveTextContent('关联设置');
    expect(primaryNavigation).not.toHaveTextContent('软件图标');
    expect(screen.queryByLabelText('系统设置子导航')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '系统设置' })).not.toBeInTheDocument();

    const windowSection = screen.getByRole('heading', { name: '窗口大小' }).closest('section');
    expect(windowSection).toHaveTextContent('默认 1600 × 900');
    expect(windowSection).toHaveTextContent('当前 1600 × 900');
    expect(windowSection).toHaveTextContent('启动 1600 × 900');
    expect(screen.getByRole('checkbox', { name: '窗口大小记忆' })).not.toBeChecked();
    expect(screen.getByRole('group')).not.toBeDisabled();
    expect(screen.getByRole('button', { name: '1600 × 900' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: '测试设置' }));
    const testNavigation = screen.getByRole('navigation', { name: '测试设置顶部导航' });
    expect(testNavigation).toHaveTextContent('关联设置');
    expect(testNavigation).toHaveTextContent('软件图标');

    fireEvent.click(screen.getByRole('button', { name: '关联设置' }));
    expect(screen.getByRole('heading', { name: '保持关联' })).toBeInTheDocument();
    const keepAssociations = screen.getByRole('checkbox', { name: '保持关联' });
    expect(keepAssociations).not.toBeChecked();
    expect(screen.getByText('恢复未关联状态')).toBeInTheDocument();

    fireEvent.click(keepAssociations);

    expect(keepAssociations).toBeChecked();
    expect(localStorage.getItem('xinyuexia_keep_workbench_associations_v1')).toBe('1');
    expect(screen.getByText('保留全部关联')).toBeInTheDocument();
  });

  it('shows five shortcut settings per row on wide screens', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/settings?section=shortcuts']}>
        <SettingsPage />
      </MemoryRouter>,
    );

    const firstShortcutCard = container.querySelector('article');
    expect(firstShortcutCard?.parentElement).toHaveClass('xl:grid-cols-5');
    expect(screen.queryByText('文案修改模式')).not.toBeInTheDocument();
  });

  it('keeps navigation editing in a left-aligned work area and leaves the right side empty', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/settings?section=navigation']}>
        <SettingsPage />
      </MemoryRouter>,
    );

    const navigationWorkArea = container.querySelector('[data-nav-settings-layout="embedded"]');
    expect(navigationWorkArea).toHaveClass('w-full', 'max-w-[960px]');
    expect(navigationWorkArea).not.toHaveClass('mx-auto');
    expect(navigationWorkArea?.nextElementSibling).toBeNull();
  });
});
