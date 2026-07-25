import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WorkbenchFieldRecordModal } from './WorkbenchFieldRecordModal';

describe('WorkbenchFieldRecordModal', () => {
  it('combines field history and trace into one two-tab modal', () => {
    render(
      <WorkbenchFieldRecordModal
        entryTitle="林刻"
        fieldKey="appearance"
        fieldLabel="外貌"
        history={[
          {
            id: 'history-1',
            fieldKey: 'appearance',
            fieldLabel: '外貌',
            kind: '状态变化',
            before: '黑衣',
            after: '白衣染血',
            chapter: 12,
            paragraph: 4,
            evidence: '右肩渗血。',
            reason: '衣着和伤势变化。',
            confirmedAt: '2026/7/22 22:40:00',
          },
          {
            id: 'history-other',
            fieldKey: 'background',
            fieldLabel: '人物背景',
            kind: '信息补充',
            before: '',
            after: '旧事',
            confirmedAt: '2026/7/22 22:41:00',
          },
        ]}
        pending={[
          {
            id: 'pending-1',
            fieldKey: 'appearance',
            fieldLabel: '外貌',
            kind: '内容纠错',
            before: '白衣染血',
            after: '灰衣染血',
            chapter: 13,
            evidence: '灰衣残破。',
            reason: '原文颜色更正。',
          },
        ]}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: '字段记录' })).toBeInTheDocument();
    expect(screen.getByText('林刻 · 外貌')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '历史记录' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '操作轨迹' })).toBeInTheDocument();
    expect(screen.getByText('旧：黑衣')).toBeInTheDocument();
    expect(screen.getByText('新：白衣染血')).toBeInTheDocument();
    expect(screen.queryByText('旧事')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '操作轨迹' }));

    expect(screen.getByText('待确认')).toBeInTheDocument();
    expect(screen.getByText('已确认')).toBeInTheDocument();
    expect(screen.getByText('灰衣残破。')).toBeInTheDocument();
    expect(screen.getByText('判断：原文颜色更正。')).toBeInTheDocument();
    expect(screen.getByText('右肩渗血。')).toBeInTheDocument();
  });
});
