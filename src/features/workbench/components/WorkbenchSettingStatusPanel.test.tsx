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
    fireEvent.click(screen.getByRole('button', { name: '状态 · 2' }));
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

  it('shows migrated legacy chapter history without inventing paragraph evidence', () => {
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

    fireEvent.click(screen.getByRole('button', { name: /第11章 · 当前处境/ }));
    expect(screen.getByText('旧记录没有保存具体原文段落。')).toBeInTheDocument();
    expect(screen.getByText(/旧版“更新至章节”记录迁移/)).toBeInTheDocument();
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
