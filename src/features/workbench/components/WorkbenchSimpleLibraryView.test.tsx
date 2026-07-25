import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WorkbenchSimpleLibraryView } from './workbenchSimpleLibraryView';

const entries = [
  { id: 'one', tab: '资料', title: '黑石镇地图', content: '地图内容', updatedAt: '2026-07-22' },
  { id: 'two', tab: '资料', title: '匿名信', content: '信件内容', updatedAt: '2026-07-22' },
];

describe('WorkbenchSimpleLibraryView', () => {
  it('uses the version-two searchable folder and explicit create area', () => {
    const onAddEntry = vi.fn();
    const onSelectEntry = vi.fn();
    const onDeleteEntry = vi.fn();
    render(
      <WorkbenchSimpleLibraryView
        topTabs={<div>顶部标签</div>}
        overlays={null}
        activeTab="资料"
        emptyText="暂无资料"
        entries={entries}
        selectedEntry={entries[0]}
        sidebarWidth={280}
        onAddEntry={onAddEntry}
        onSelectEntry={onSelectEntry}
        onUpdateEntry={vi.fn()}
        onDeleteEntry={onDeleteEntry}
      />,
    );

    fireEvent.change(screen.getByRole('textbox', { name: '搜索资料' }), { target: { value: '匿名' } });
    expect(screen.queryByRole('button', { name: /黑石镇地图/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '匿名信' }));
    expect(onSelectEntry).toHaveBeenCalledWith('two');
    fireEvent.click(screen.getByRole('button', { name: '资料' }));
    expect(onAddEntry).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '删除匿名信' }));
    expect(onDeleteEntry).toHaveBeenCalledWith('two');
  });
});
