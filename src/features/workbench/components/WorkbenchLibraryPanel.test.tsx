import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { WorkbenchLibraryPanel } from './WorkbenchLibraryPanel';

describe('WorkbenchLibraryPanel embedded flow navigation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not render the internal setting role brainstorm tabs and shows the requested brainstorm page', () => {
    render(
      <WorkbenchLibraryPanel
        storageKey="workbench-library-panel-test"
        outlineStorageKey="workbench-library-panel-outline-test"
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无内容"
        defaultActiveTab="脑洞"
      />,
    );

    const main = screen.getByRole('main');

    expect(within(main).queryByRole('button', { name: '设置' })).not.toBeInTheDocument();
    expect(within(main).queryByRole('button', { name: '角色' })).not.toBeInTheDocument();
    expect(within(main).queryByRole('button', { name: '脑洞' })).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('这里显示选中的脑洞内容，也可以直接编辑。')).toBeInTheDocument();
  });

  it('uses the requested default tab even when the shared storage remembered another setting tab', () => {
    localStorage.setItem('workbench-library-panel-test_active_tab', '大纲');

    render(
      <WorkbenchLibraryPanel
        storageKey="workbench-library-panel-test"
        outlineStorageKey="workbench-library-panel-outline-test"
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无内容"
        defaultActiveTab="脑洞"
      />,
    );

    expect(screen.getByPlaceholderText('这里显示选中的脑洞内容，也可以直接编辑。')).toBeInTheDocument();
    expect(screen.queryByText('暂无大纲')).not.toBeInTheDocument();
  });

  it('hides inline field size control when the workbench header owns the entry and opens from external signal', () => {
    const { rerender } = render(
      <WorkbenchLibraryPanel
        storageKey="workbench-library-panel-test"
        outlineStorageKey="workbench-library-panel-outline-test"
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无内容"
        defaultActiveTab="脑洞"
        showInlineFieldSizeButton={false}
        fieldSizeOpenSignal={0}
      />,
    );

    expect(screen.queryByRole('button', { name: '脑洞字段尺寸' })).not.toBeInTheDocument();

    rerender(
      <WorkbenchLibraryPanel
        storageKey="workbench-library-panel-test"
        outlineStorageKey="workbench-library-panel-outline-test"
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无内容"
        defaultActiveTab="脑洞"
        showInlineFieldSizeButton={false}
        fieldSizeOpenSignal={1}
      />,
    );

    expect(screen.getByRole('heading', { name: '脑洞字段尺寸' })).toBeInTheDocument();
  });

  it('requires right-click unlock before opening the clear settings confirmation dialog', () => {
    localStorage.setItem('workbench-library-panel-clear-test', JSON.stringify([
      {
        id: 'setting-1',
        tab: '大纲',
        title: '灵气复苏规则',
        content: JSON.stringify({ type: '世界观', body: '灵气复苏后城市秩序重组。' }),
        updatedAt: '2026-06-06',
      },
    ]));

    render(
      <WorkbenchLibraryPanel
        storageKey="workbench-library-panel-clear-test"
        outlineStorageKey="workbench-library-panel-outline-clear-test"
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无内容"
        defaultActiveTab="大纲"
      />,
    );

    const clearSettingsButton = screen.getByRole('button', { name: '清空设定' });

    expect(clearSettingsButton).toHaveAttribute('aria-disabled', 'true');
    expect(clearSettingsButton).toHaveAttribute('title', '已锁定，右键可以解锁');

    fireEvent.click(clearSettingsButton);
    expect(screen.queryByRole('heading', { name: '清空设定' })).not.toBeInTheDocument();

    fireEvent.contextMenu(clearSettingsButton);

    expect(screen.queryByRole('heading', { name: '解锁清空设定' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '解锁' }));

    expect(clearSettingsButton).toHaveAttribute('aria-disabled', 'false');
    expect(clearSettingsButton).toHaveAttribute('title', '已解锁，左键清空');

    fireEvent.click(clearSettingsButton);

    expect(screen.getByRole('heading', { name: '清空设定' })).toBeInTheDocument();
    expect(screen.getByText(/当前共有 1 条设定会被删除/)).toBeInTheDocument();
    const [, confirmClearSettingsButton] = screen.getAllByRole('button', { name: '清空设定' });
    fireEvent.click(confirmClearSettingsButton);

    expect(clearSettingsButton).toHaveAttribute('aria-disabled', 'true');
    expect(clearSettingsButton).toHaveAttribute('title', '已锁定，右键可以解锁');
  });
});
