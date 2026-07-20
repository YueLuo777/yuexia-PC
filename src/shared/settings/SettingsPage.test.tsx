import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { SettingsPage } from './SettingsPage';

describe('SettingsPage hierarchy', () => {
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

    const firstCard = screen.getByRole('heading', { name: '记住窗口大小' }).closest('section');
    const secondCard = screen.getByRole('heading', { name: '恢复默认窗口大小' }).closest('section');
    const settingsGrid = firstCard?.parentElement;
    expect(settingsGrid).toHaveClass('xl:grid-cols-4');
    expect(settingsGrid).not.toHaveClass('mx-auto');
    expect(settingsGrid?.children).toHaveLength(2);
    expect(settingsGrid?.children[0]).toBe(firstCard);
    expect(settingsGrid?.children[1]).toBe(secondCard);

    fireEvent.click(screen.getByRole('button', { name: '测试设置' }));
    const testNavigation = screen.getByRole('navigation', { name: '测试设置顶部导航' });
    expect(testNavigation).toHaveTextContent('关联设置');
    expect(testNavigation).toHaveTextContent('软件图标');

    fireEvent.click(screen.getByRole('button', { name: '关联设置' }));
    expect(screen.getByRole('heading', { name: '关联有效期' })).toBeInTheDocument();
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
