import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { WorkbenchLibraryPanel } from './WorkbenchLibraryPanel';

describe('WorkbenchLibraryPanel split phase action links', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates a role through the first-render character button without duplicating the seeded protagonist type', () => {
    const storageKey = 'workbench-phase-link-create-role-test';

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '人物设定2' }));
    fireEvent.click(screen.getByRole('button', { name: '角色' }));
    fireEvent.change(screen.getByPlaceholderText('例如：萧炎'), { target: { value: '测试女主角' } });
    fireEvent.click(screen.getByRole('button', { name: '确认创建' }));

    const roleEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]').filter(
      (entry: { tab: string }) => entry.tab === '角色',
    );
    expect(roleEntries).toHaveLength(3);
    expect(roleEntries.find((entry: { title: string }) => entry.title === '测试女主角')).toBeTruthy();
    expect(roleEntries.map((entry: { content: string }) => JSON.parse(entry.content).type)).toEqual(
      expect.arrayContaining(['男主角', '女主角']),
    );
  });

  it('opens, selects, and confirms other settings through the cross-phase reader actions', () => {
    const storageKey = 'workbench-phase-link-other-settings-test';

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByTitle('关联其他设定'));
    expect(screen.getByRole('heading', { name: '关联其他设定' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '关联所有' }));
    fireEvent.click(screen.getByRole('button', { name: '确认关联' }));

    expect(screen.queryByRole('heading', { name: '关联其他设定' })).not.toBeInTheDocument();
    expect(screen.getByTitle('重新选择关联其他设定')).toBeInTheDocument();
  });
});
