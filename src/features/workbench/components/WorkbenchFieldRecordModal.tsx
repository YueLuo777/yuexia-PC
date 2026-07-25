import { useMemo, useState } from 'react';

import type {
  PendingSettingFieldUpdate,
  SettingFieldHistoryEvent,
} from '@/features/workbench/model/workbenchSettingStatus';

import { WorkbenchModal } from './WorkbenchModal';

type FieldRecordTab = 'history' | 'trace';

type WorkbenchFieldRecordModalProps = {
  entryTitle: string;
  fieldKey: string;
  fieldLabel: string;
  history: SettingFieldHistoryEvent[];
  pending: PendingSettingFieldUpdate[];
  onClose: () => void;
};

function formatPosition(event: SettingFieldHistoryEvent | PendingSettingFieldUpdate) {
  return [event.chapter ? `第${event.chapter}章` : '未记录章节', event.paragraph ? `第${event.paragraph}段` : '']
    .filter(Boolean)
    .join(' · ');
}

function FieldChangeCard({ event }: { event: SettingFieldHistoryEvent | PendingSettingFieldUpdate }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <strong className="text-xs text-slate-900">{event.fieldLabel}</strong>
        <span className="shrink-0 rounded-md bg-[#EAF9FD] px-2 py-1 text-[10px] font-black text-[#078fb0]">
          {event.kind}
        </span>
      </div>
      <div className="mt-2 grid gap-2 text-[11px] font-bold leading-5">
        <p className="rounded-lg bg-slate-50 px-2 py-1.5 text-slate-500">旧：{event.before || '暂无内容'}</p>
        <p className="rounded-lg bg-sky-50 px-2 py-1.5 text-sky-700">新：{event.after || '暂无内容'}</p>
      </div>
      {'confirmedAt' in event ? (
        <p className="mt-2 text-[10px] font-black text-slate-400">{event.confirmedAt}</p>
      ) : null}
    </article>
  );
}

function TraceCard({
  event,
  pending,
}: {
  event: SettingFieldHistoryEvent | PendingSettingFieldUpdate;
  pending: boolean;
}) {
  return (
    <article className="rounded-xl border border-sky-100 bg-sky-50/70 p-3">
      <div className="flex items-center justify-between gap-3">
        <strong className="text-xs text-sky-900">{formatPosition(event)}</strong>
        <span
          className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-black ${
            pending ? 'bg-amber-50 text-amber-700' : 'bg-white text-[#078fb0]'
          }`}
        >
          {pending ? '待确认' : '已确认'}
        </span>
      </div>
      <blockquote className="mt-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-[11px] font-bold leading-5 text-slate-700">
        {event.evidence || '这条记录没有保存具体原文段落。'}
      </blockquote>
      {event.context ? (
        <p className="mt-2 whitespace-pre-line text-[11px] font-bold leading-5 text-slate-500">{event.context}</p>
      ) : null}
      <p className="mt-2 text-[11px] font-black leading-5 text-sky-700">
        判断：{event.reason || '这条记录没有保存判断说明。'}
      </p>
    </article>
  );
}

export function WorkbenchFieldRecordModal({
  entryTitle,
  fieldKey,
  fieldLabel,
  history,
  pending,
  onClose,
}: WorkbenchFieldRecordModalProps) {
  const [activeTab, setActiveTab] = useState<FieldRecordTab>('history');
  const fieldHistory = useMemo(() => history.filter((event) => event.fieldKey === fieldKey), [fieldKey, history]);
  const fieldPending = useMemo(() => pending.filter((event) => event.fieldKey === fieldKey), [fieldKey, pending]);
  const traceItems = useMemo(
    () => [
      ...fieldPending.map((event) => ({ event, pending: true })),
      ...fieldHistory.map((event) => ({ event, pending: false })),
    ],
    [fieldHistory, fieldPending],
  );

  return (
    <WorkbenchModal
      title="字段记录"
      subtitle={`${entryTitle || '未命名设定'} · ${fieldLabel}`}
      isOpen
      onClose={onClose}
      storageId="workbench_field_record"
      widthClass="w-[min(760px,calc(100vw-4rem))]"
      heightClass="h-[min(620px,calc(100vh-4rem))]"
      defaultGeometry={{ x: 0, y: 0, width: 760, height: 620 }}
      contentClassName="p-0"
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="grid h-11 shrink-0 grid-cols-2 border-b border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`rounded-lg text-sm font-black ${
              activeTab === 'history' ? 'bg-white text-[#078fb0] shadow-sm' : 'text-slate-500'
            }`}
          >
            历史记录
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trace')}
            className={`rounded-lg text-sm font-black ${
              activeTab === 'trace' ? 'bg-white text-[#078fb0] shadow-sm' : 'text-slate-500'
            }`}
          >
            操作轨迹
          </button>
        </div>
        <div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#F8FAFC] p-4">
          {activeTab === 'history' ? (
            fieldHistory.length > 0 ? (
              fieldHistory.map((event) => <FieldChangeCard key={event.id} event={event} />)
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm font-bold text-slate-400">
                当前字段暂无历史记录
              </div>
            )
          ) : traceItems.length > 0 ? (
            traceItems.map((item) => <TraceCard key={item.event.id} event={item.event} pending={item.pending} />)
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm font-bold text-slate-400">
              当前字段暂无操作轨迹
            </div>
          )}
        </div>
      </div>
    </WorkbenchModal>
  );
}
