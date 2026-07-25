import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { OPEN_WORKBENCH_STATUS_FLOW_EVENT } from '@/features/workbench/model/workbenchSettingStatusSelection';

import { parseRoleBaseSettingFields, parseRoleContent, type RoleContent } from './workbenchRoleContent';
import { WorkbenchSettingPanelTabs, WorkbenchSettingStatusPanel } from './WorkbenchSettingStatusPanel';
import type { SettingContent, StructuredSettingFieldSet } from './workbenchStructuredSettings';

const entry: WorkbenchLibraryEntry = {
  id: 'role-1',
  tab: '人物设定',
  title: '林月',
  content: '',
  updatedAt: '2026-07-22',
};

function createRole(): RoleContent {
  return parseRoleContent(JSON.stringify({
    type: '女主角',
    lifeStatus: '存活',
    baseSetting: '【外貌】：\n青色长衫\n\n【称号/外号/别称】：\n\n【核心性格】：\n克制\n\n【人物背景】：\n林家遗孤\n\n【金手指/能力】：\n无',
    relationship: '与韩策互相戒备',
    stateSettings: { currentSituation: '前往黑石镇', currentGoal: '', abilityState: '', resourceState: '', otherState: '' },
    stateUpdateChapters: { currentSituation: 11 },
    pendingStatusUpdates: [{
      id: 'appearance-12', fieldKey: 'appearance', fieldLabel: '外貌', kind: '状态变化',
      before: '青色长衫', after: '白色劲装，右肩缠着染血绷带', chapter: 12, paragraph: 4,
      evidence: '白色劲装很快又被右肩渗出的血染红。', reason: '衣着和可见伤势都发生变化。',
    }],
  }));
}

describe('WorkbenchSettingStatusPanel', () => {
  it('switches between setting and status modes with a pending count', () => {
    const onChange = vi.fn();
    render(<WorkbenchSettingPanelTabs mode="setting" pendingCount={2} onChange={onChange} />);
    expect(screen.getByRole('button', { name: '切换设定' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '更新状态 · 2' }));
    expect(onChange).toHaveBeenCalledWith('status');
  });

  it('confirms a role field update, writes the current value and appends field history', () => {
    const onRoleChange = vi.fn();
    render(
      <WorkbenchSettingStatusPanel
        entry={entry}
        role={createRole()}
        setting={null}
        structuredFieldSet={null}
        onRoleChange={onRoleChange}
        onSettingChange={vi.fn()}
      />,
    );

    expect(screen.getByText('待确认 1')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('确认外貌'));
    const update = onRoleChange.mock.calls[0][0] as Partial<RoleContent>;
    expect(parseRoleBaseSettingFields(update.baseSetting ?? '').appearance).toBe('白色劲装，右肩缠着染血绷带');
    expect(update.pendingStatusUpdates).toEqual([]);
    expect(update.statusHistory?.[0]).toMatchObject({ fieldKey: 'appearance', chapter: 12, paragraph: 4 });
  });

  it('does not show the old history status section in the right panel', () => {
    const role = createRole();
    role.pendingStatusUpdates = [];
    render(
      <WorkbenchSettingStatusPanel
        entry={entry}
        role={role}
        setting={null}
        structuredFieldSet={null}
        onRoleChange={vi.fn()}
        onSettingChange={vi.fn()}
      />,
    );

    expect(screen.queryByText('历史状态')).not.toBeInTheDocument();
    expect(screen.queryByText(/历史变化/)).not.toBeInTheDocument();
    expect(screen.queryByText('当前字段暂无历史变化')).not.toBeInTheDocument();
    expect(screen.getByText('点击待确认更新后，在这里查看原文依据，不离开设定页面。')).toBeInTheDocument();
  });

  it('opens the existing chapter status workflow from the setting page', () => {
    const listener = vi.fn();
    window.addEventListener(OPEN_WORKBENCH_STATUS_FLOW_EVENT, listener);
    render(
      <WorkbenchSettingStatusPanel
        entry={entry}
        role={createRole()}
        setting={null}
        structuredFieldSet={null}
        onRoleChange={vi.fn()}
        onSettingChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '分析正文状态变化' }));
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener(OPEN_WORKBENCH_STATUS_FLOW_EVENT, listener);
  });

  it('confirms a structured setting update through the same field-level history model', () => {
    const fieldSet: StructuredSettingFieldSet = {
      id: 'item-test', entryType: '物品装备', entryTitle: '测试道具', gridColumnsClassName: 'grid-cols-2',
      fields: [{ key: 'owner', title: '当前持有者' }],
    };
    const setting: SettingContent = {
      type: '物品装备',
      body: '【当前持有者】：\n林月',
      pendingStatusUpdates: [{
        id: 'owner-12', fieldKey: 'owner', fieldLabel: '当前持有者', kind: '状态变化',
        before: '林月', after: '韩策', chapter: 12, paragraph: 6,
      }],
    };
    const onSettingChange = vi.fn();
    render(
      <WorkbenchSettingStatusPanel
        entry={{ ...entry, id: 'item-1', tab: '设定', title: '赤霄剑' }}
        role={null}
        setting={setting}
        structuredFieldSet={fieldSet}
        onRoleChange={vi.fn()}
        onSettingChange={onSettingChange}
      />,
    );

    fireEvent.click(screen.getByTitle('确认当前持有者'));
    expect(onSettingChange).toHaveBeenCalledWith(expect.objectContaining({
      body: expect.stringContaining('【当前持有者】：\n韩策'),
      pendingStatusUpdates: [],
      statusHistory: [expect.objectContaining({ fieldKey: 'owner', after: '韩策' })],
    }));
  });
});
