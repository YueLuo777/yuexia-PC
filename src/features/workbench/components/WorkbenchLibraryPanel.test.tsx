import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { WorkbenchLibraryPanel } from './WorkbenchLibraryPanel';

describe('WorkbenchLibraryPanel embedded flow navigation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not render the internal setting role brainstorm tabs but keeps page field size control', () => {
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
    expect(screen.getByRole('button', { name: '脑洞字段尺寸' })).toBeInTheDocument();
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

    expect(screen.getByRole('button', { name: '脑洞字段尺寸' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '大纲字段尺寸' })).not.toBeInTheDocument();
  });
});
