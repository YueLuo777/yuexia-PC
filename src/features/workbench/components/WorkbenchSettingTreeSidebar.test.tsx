import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import {
  getWorkbenchSettingTreeEndSpacerHeight,
  getWorkbenchSettingTreeSelectedPathHeight,
} from '@/features/workbench/hooks/useWorkbenchSettingTreeStickyNavigation';

import { WorkbenchSettingTreeSidebar } from './WorkbenchSettingTreeSidebar';
import { stringifySettingContent } from './workbenchStructuredSettings';

const settingEntry: WorkbenchLibraryEntry = {
  id: 'setting-1',
  tab: '大纲',
  title: '作品定位',
  content: stringifySettingContent({
    type: '核心设定',
    body: '测试内容',
    lockedDefaultEntryId: '核心设定::作品定位',
    pendingStatusUpdates: [{ id: 'pending-1', fieldKey: 'body', fieldLabel: '设定内容', kind: '状态变化', before: '旧', after: '新', evidence: '第1段' }],
  }),
  updatedAt: '2026-07-22',
};

const secondSettingEntry: WorkbenchLibraryEntry = {
  id: 'setting-2',
  tab: '大纲',
  title: '世界法则',
  content: stringifySettingContent({
    type: '核心设定',
    body: '世界法则内容',
  }),
  updatedAt: '2026-07-22',
};

const roleEntry: WorkbenchLibraryEntry = {
  id: 'role-1',
  tab: '人物',
  title: '林刻',
  content: JSON.stringify({ type: '男主角' }),
  updatedAt: '2026-07-22',
};

function Harness({ onSelectEntry = vi.fn() }: { onSelectEntry?: (tab: string, id: string) => void }) {
  const [activeDomainId, setActiveDomainId] = useState('work');
  const [selectedEntryId, setSelectedEntryId] = useState('setting-1');
  const [expandedSettingTypes, setExpandedSettingTypes] = useState(new Set(['核心设定']));
  const [expandedRoleTypes, setExpandedRoleTypes] = useState(new Set(['男主角']));
  return (
    <WorkbenchSettingTreeSidebar
      domains={[
        { id: 'character', label: '人物设定', settingDomain: null },
        { id: 'setting:foreshadow', label: '伏笔线索', settingDomain: 'setting:foreshadow' },
        { id: 'setting:item', label: '道具资源', settingDomain: 'setting:item' },
        { id: 'work', label: '作品设定', settingDomain: null },
      ]}
      activeDomainId={activeDomainId}
      settingEntries={[settingEntry]}
      roleEntries={[roleEntry]}
      settingTypeOptions={['核心设定']}
      roleTypeOptions={['男主角']}
      selectedEntryId={selectedEntryId}
      expandedSettingTypes={expandedSettingTypes}
      expandedRoleTypes={expandedRoleTypes}
      setExpandedSettingTypes={setExpandedSettingTypes}
      setExpandedRoleTypes={setExpandedRoleTypes}
      getSettingTypeWorkspaceDomain={() => null}
      onSelectDomain={setActiveDomainId}
      onSelectEntry={(tab, id) => {
        setSelectedEntryId(id);
        onSelectEntry(tab, id);
      }}
      onOpenCategoryMenu={vi.fn()}
      onOpenEntryMenu={vi.fn()}
      onOpenCreateDialog={vi.fn()}
      onScroll={vi.fn()}
      scrollActive={false}
      libraryDropTarget={null}
      draggingLibraryEntry={null}
      libraryPointerSuppressClickRef={{ current: false }}
      getPreviewedGroupEntries={(entries) => entries}
      onCategoryDragOver={vi.fn()}
      onCategoryDragLeave={vi.fn()}
      onCategoryDrop={vi.fn()}
      onEntryDragStart={vi.fn()}
      onEntryDragOver={vi.fn()}
      onEntryDrop={vi.fn()}
      onEntryDragEnd={vi.fn()}
      onEntryPointerDown={vi.fn()}
      onEntryPointerMove={vi.fn()}
      onEntryPointerUp={vi.fn()}
    />
  );
}

function MultiEntryHarness() {
  const [activeDomainId, setActiveDomainId] = useState('work');
  const [expandedSettingTypes, setExpandedSettingTypes] = useState(new Set(['核心设定']));
  const [expandedRoleTypes, setExpandedRoleTypes] = useState(new Set<string>());
  return (
    <WorkbenchSettingTreeSidebar
      domains={[{ id: 'work', label: '作品设定', settingDomain: null }]}
      activeDomainId={activeDomainId}
      settingEntries={[settingEntry, secondSettingEntry]}
      roleEntries={[]}
      settingTypeOptions={['核心设定']}
      roleTypeOptions={[]}
      selectedEntryId="setting-1"
      expandedSettingTypes={expandedSettingTypes}
      expandedRoleTypes={expandedRoleTypes}
      setExpandedSettingTypes={setExpandedSettingTypes}
      setExpandedRoleTypes={setExpandedRoleTypes}
      getSettingTypeWorkspaceDomain={() => null}
      onSelectDomain={setActiveDomainId}
      onSelectEntry={vi.fn()}
      onOpenCategoryMenu={vi.fn()}
      onOpenEntryMenu={vi.fn()}
      onOpenCreateDialog={vi.fn()}
      onScroll={vi.fn()}
      scrollActive={false}
      libraryDropTarget={null}
      draggingLibraryEntry={null}
      libraryPointerSuppressClickRef={{ current: false }}
      getPreviewedGroupEntries={(entries) => entries}
      onCategoryDragOver={vi.fn()}
      onCategoryDragLeave={vi.fn()}
      onCategoryDrop={vi.fn()}
      onEntryDragStart={vi.fn()}
      onEntryDragOver={vi.fn()}
      onEntryDrop={vi.fn()}
      onEntryDragEnd={vi.fn()}
      onEntryPointerDown={vi.fn()}
      onEntryPointerMove={vi.fn()}
      onEntryPointerUp={vi.fn()}
    />
  );
}

describe('WorkbenchSettingTreeSidebar', () => {
  it('renders real three-level setting data and aggregates pending update badges', () => {
    render(<Harness />);

    expect(screen.getByText('作品设定')).toBeInTheDocument();
    expect(screen.getByText('核心设定')).toBeInTheDocument();
    expect(screen.getByText('作品定位')).toBeInTheDocument();
    expect(screen.getAllByText('新')).toHaveLength(3);
    expect(screen.queryByText(/\d+字/)).not.toBeInTheDocument();
  });

  it('keeps hidden first-level domain order and selects an entry through the leaf only', () => {
    const onSelectEntry = vi.fn();
    const { container } = render(<Harness onSelectEntry={onSelectEntry} />);

    const initialDomains = Array.from(container.querySelectorAll('nav > section'));
    expect(initialDomains.map((section) => section.querySelector('button')?.textContent)).toEqual([
      expect.stringContaining('作品设定'),
      expect.stringContaining('人物设定'),
      expect.stringContaining('道具资源'),
      expect.stringContaining('伏笔线索'),
    ]);

    fireEvent.click(screen.getByText('人物设定'));
    expect(screen.getByRole('button', { name: '作品设定1' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: '人物设定1' })).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByText('林刻'));
    expect(onSelectEntry).toHaveBeenCalledWith('角色', 'role-1');
  });

  it('shows a male protagonist badge next to male protagonist role entries only', () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('人物设定'));
    const roleEntryButton = screen.getByRole('button', { name: /林刻/ });
    expect(roleEntryButton).toHaveTextContent('男主');
    expect(screen.getByText('林刻')).toHaveClass('w-[4em]', 'shrink-0', 'truncate');
    expect(screen.getByText('男主')).toHaveClass('shrink-0', 'rounded-md', 'bg-[#FFF4CC]', 'text-[#9A5B00]');
    expect(screen.getByRole('button', { name: /作品定位/ })).not.toHaveTextContent('男主');
  });

  it('uses only a blue outline for the selected role in the formal setting tree', () => {
    render(<Harness />);

    expect(screen.getByRole('button', { name: /作品定位/ })).toHaveClass(
      'border-2',
      'border-[#078FAE]',
      'bg-white',
    );
    fireEvent.click(screen.getByText('人物设定'));
    const roleEntryButton = screen.getByRole('button', { name: /林刻/ });
    fireEvent.click(roleEntryButton);

    expect(roleEntryButton).toHaveClass('border-2', 'border-[#078FAE]', 'bg-white', 'text-slate-600');
    expect(roleEntryButton).not.toHaveClass('bg-[#EAF9FD]', 'ring-1', 'ring-inset');
    expect(screen.getByText('男主')).toHaveClass('bg-[#FFF4CC]', 'text-[#9A5B00]');
  });

  it('toggles a first-level domain without resetting its nested group expansion', () => {
    render(<Harness />);

    const workDomain = screen.getByRole('button', { name: '作品设定1' });
    expect(workDomain).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: '核心设定1' })).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(workDomain);
    expect(workDomain).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: '核心设定1' })).not.toBeInTheDocument();

    fireEvent.click(workDomain);
    const restoredGroup = screen.getByRole('button', { name: '核心设定1' });
    expect(restoredGroup).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('作品定位')).toBeInTheDocument();

    fireEvent.click(restoredGroup);
    expect(restoredGroup).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(workDomain);
    fireEvent.click(workDomain);
    expect(screen.getByRole('button', { name: '核心设定1' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('作品定位')).not.toBeInTheDocument();
  });

  it('keeps a continuous third-level tree and colors only the selected path', () => {
    const { container } = render(<MultiEntryHarness />);

    const entryButtons = Array.from(container.querySelectorAll('[data-library-entry-id]'));
    const itemTree = container.querySelector('[data-setting-tree-item-list="true"]');
    const groupConnector = container.querySelector('[data-setting-tree-group-connector="true"]');
    const selectedPath = container.querySelector<HTMLElement>('[data-setting-tree-selected-path="true"]');
    expect(entryButtons).toHaveLength(2);
    expect(itemTree).toHaveClass('before:top-[-4px]', 'before:bottom-[18px]');
    expect(groupConnector).toHaveClass('bg-[#078FAE]');
    expect(entryButtons[0].querySelector('[data-setting-tree-item-connector="true"]')).toHaveClass('bg-[#078FAE]');
    expect(entryButtons[1].querySelector('[data-setting-tree-item-connector="true"]')).toHaveClass('bg-[#9ADFEA]');
    expect(selectedPath).toHaveClass('bg-[#078FAE]');
    expect(selectedPath).toHaveStyle({ height: '22px' });
    expect(getWorkbenchSettingTreeSelectedPathHeight(1)).toBe(59);
  });

  it('pins both navigation levels and reserves one complete setting row at the end', () => {
    const { container } = render(<MultiEntryHarness />);

    expect(container.querySelector('[data-sticky-level="1"]')).toHaveClass('sticky', 'top-0', 'z-30');
    expect(container.querySelector('[data-sticky-level="2"]')).toHaveClass('sticky', 'top-10', 'z-20');
    expect(container.querySelector('[data-setting-tree-end-spacer="true"]')).toHaveClass(
      'h-[var(--workbench-setting-tree-end-spacer-height)]',
      'shrink-0',
    );
    expect(getWorkbenchSettingTreeEndSpacerHeight(600, 44, 44, 36)).toBe(476);
  });

  it('returns to the top and removes the end reserve when every first-level domain is collapsed', async () => {
    const { container } = render(<MultiEntryHarness />);
    const navigation = container.querySelector('nav');
    expect(navigation).not.toBeNull();
    if (!navigation) return;
    navigation.scrollTop = 300;

    fireEvent.click(screen.getByRole('button', { name: '作品设定2' }));

    await waitFor(() => expect(navigation.scrollTop).toBe(0));
    expect(screen.getByRole('button', { name: '作品设定2' })).toHaveAttribute('aria-expanded', 'false');
    expect(container.querySelector('[data-setting-tree-end-spacer="true"]')).not.toBeInTheDocument();
  });

  it('explains locked built-in setting entries on hover', () => {
    render(<Harness />);

    expect(screen.getByRole('button', { name: /作品定位/ })).toHaveAttribute('title', '内置设定，无法删除');
    fireEvent.click(screen.getByText('人物设定'));
    expect(screen.getByRole('button', { name: /林刻/ })).not.toHaveAttribute('title', '内置设定，无法删除');
  });
});
