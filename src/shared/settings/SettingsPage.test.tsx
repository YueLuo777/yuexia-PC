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
    expect(testNavigation.textContent?.indexOf('关联设置')).toBeLessThan(
      testNavigation.textContent?.indexOf('软件图标') ?? -1,
    );
    expect(testNavigation.textContent?.indexOf('软件图标')).toBeLessThan(
      testNavigation.textContent?.indexOf('主题颜色') ?? -1,
    );

    fireEvent.click(screen.getByRole('button', { name: '关联设置' }));
    expect(screen.getByRole('heading', { name: '保持关联' })).toBeInTheDocument();
    const keepAssociations = screen.getByRole('button', { name: '启用保持关联' });
    const keepAiOutputs = screen.getByRole('button', { name: '启用保持 AI 输出' });
    expect(keepAssociations).toHaveAttribute('aria-pressed', 'false');
    expect(keepAiOutputs).toHaveAttribute('aria-pressed', 'false');
    expect(keepAssociations).toHaveClass('bg-slate-400');
    expect(keepAiOutputs).toHaveClass('bg-slate-400');
    expect(keepAssociations).toHaveClass('self-end');
    expect(keepAiOutputs).toHaveClass('self-end');
    expect(keepAssociations).toHaveTextContent('点击启用');
    expect(keepAiOutputs).toHaveTextContent('点击启用');
    expect(screen.getByText('两项设置分别生效')).toBeInTheDocument();

    fireEvent.click(keepAssociations);

    expect(keepAssociations).toHaveAttribute('aria-pressed', 'true');
    expect(keepAssociations).toHaveClass('bg-[#08AACE]');
    expect(keepAssociations).toHaveTextContent('已启用');
    expect(localStorage.getItem('xinyuexia_keep_workbench_associations_v1')).toBe('1');
    fireEvent.click(keepAiOutputs);
    expect(keepAiOutputs).toHaveAttribute('aria-pressed', 'true');
    expect(keepAiOutputs).toHaveClass('bg-[#08AACE]');
    expect(keepAiOutputs).toHaveTextContent('已启用');
    expect(localStorage.getItem('xinyuexia_keep_workbench_ai_outputs_v1')).toBe('1');

    localStorage.setItem('xinyuexia_workbench_linked_context_1', JSON.stringify({ items: [{ id: 'linked' }] }));
    localStorage.setItem(
      'xinyuexia_workbench_ai_sessions_1',
      JSON.stringify({ sessions: [{ id: 1, output: 'old output' }] }),
    );
    fireEvent.click(keepAssociations);
    fireEvent.click(keepAiOutputs);
    expect(keepAssociations).toHaveAttribute('aria-pressed', 'false');
    expect(keepAiOutputs).toHaveAttribute('aria-pressed', 'false');
    expect(localStorage.getItem('xinyuexia_workbench_linked_context_1')).toBeNull();
    expect(JSON.parse(localStorage.getItem('xinyuexia_workbench_ai_sessions_1') ?? '{}').sessions[0].output).toBe('');
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
