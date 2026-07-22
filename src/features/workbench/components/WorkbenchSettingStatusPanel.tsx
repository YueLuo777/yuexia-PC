import { Check, FileSearch, History, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  createConfirmedSettingFieldEvent,
  createLegacySettingFieldEvent,
  getSettingFieldPolicy,
  type PendingSettingFieldUpdate,
  type SettingFieldHistoryEvent,
} from '@/features/workbench/model/workbenchSettingStatus';
import { useWorkbenchSettingStatusSelection } from '@/features/workbench/model/workbenchSettingStatusSelection';
import { OPEN_WORKBENCH_STATUS_FLOW_EVENT } from '@/features/workbench/model/workbenchSettingStatusSelection';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';

import {
  buildRoleStateSettingsText,
  getRoleBaseSetting,
  getRoleStateSettings,
  getRoleStateUpdateChapters,
  parseRoleBaseSettingFields,
  stringifyRoleBaseSettingFields,
  type RoleContent,
} from './workbenchRoleContent';
import {
  ROLE_BASE_SETTING_FIELD_DEFINITIONS,
  ROLE_STATE_FIELD_DEFINITIONS,
  type RoleBaseSettingFieldKey,
  type RoleStateFieldKey,
} from './workbenchRoleSettingFields';
import {
  parseStructuredSettingFields,
  stringifyStructuredSettingFields,
  type SettingContent,
  type StructuredSettingFieldSet,
} from './workbenchStructuredSettings';

export function WorkbenchSettingPanelTabs({
  mode,
  pendingCount,
  onChange,
}: {
  mode: 'setting' | 'status';
  pendingCount: number;
  onChange: (mode: 'setting' | 'status') => void;
}) {
  return (
    <div className="mb-3 grid shrink-0 grid-cols-2 rounded-xl bg-slate-200/70 p-1">
      <button type="button" onClick={() => onChange('setting')} className={`h-9 rounded-lg text-xs font-black ${mode === 'setting' ? 'bg-white text-[#078fb0] shadow-sm' : 'text-slate-500'}`}>设定</button>
      <button type="button" onClick={() => onChange('status')} className={`h-9 rounded-lg text-xs font-black ${mode === 'status' ? 'bg-white text-[#078fb0] shadow-sm' : 'text-slate-500'}`}>状态 · {pendingCount}</button>
    </div>
  );
}

type StatusPanelProps = {
  entry: WorkbenchLibraryEntry | null;
  role: RoleContent | null;
  setting: SettingContent | null;
  structuredFieldSet: StructuredSettingFieldSet | null;
  onRoleChange: (updates: Partial<RoleContent>) => void;
  onSettingChange: (setting: SettingContent) => void;
};

type FieldSnapshot = {
  key: string;
  label: string;
  value: string;
  chapter?: number;
};

function buildRoleFields(role: RoleContent): FieldSnapshot[] {
  const baseFields = parseRoleBaseSettingFields(getRoleBaseSetting(role));
  const stateFields = getRoleStateSettings(role);
  const chapters = getRoleStateUpdateChapters(role);
  return [
    ...ROLE_BASE_SETTING_FIELD_DEFINITIONS.map((field) => ({ key: field.key, label: field.title, value: baseFields[field.key] })),
    { key: 'relationshipState', label: '人物关系', value: role.relationship, chapter: chapters.relationshipState },
    ...ROLE_STATE_FIELD_DEFINITIONS.map((field) => ({ key: field.key, label: field.title, value: stateFields[field.key], chapter: chapters[field.key] })),
  ];
}

function buildSettingFields(setting: SettingContent, fieldSet: StructuredSettingFieldSet | null): FieldSnapshot[] {
  if (!fieldSet) return [{ key: 'body', label: '设定内容', value: setting.body }];
  const values = parseStructuredSettingFields(setting.body, fieldSet);
  return fieldSet.fields.map((field) => ({ key: field.key, label: field.title, value: values[field.key] ?? '' }));
}

export function WorkbenchSettingStatusPanel({
  entry,
  role,
  setting,
  structuredFieldSet,
  onRoleChange,
  onSettingChange,
}: StatusPanelProps) {
  const selection = useWorkbenchSettingStatusSelection();
  const activeFieldKey = selection?.entryId === entry?.id ? (selection?.fieldKey ?? null) : null;
  const fields = useMemo(
    () => (role ? buildRoleFields(role) : setting ? buildSettingFields(setting, structuredFieldSet) : []),
    [role, setting, structuredFieldSet],
  );
  const explicitHistory = role?.statusHistory ?? setting?.statusHistory ?? [];
  const legacyHistory = role
    ? fields.flatMap((field) => {
        if (explicitHistory.some((event) => event.fieldKey === field.key)) return [];
        const event = createLegacySettingFieldEvent({
          fieldKey: field.key,
          fieldLabel: field.label,
          value: field.value,
          chapter: field.chapter,
        });
        return event ? [event] : [];
      })
    : [];
  const history = [...explicitHistory, ...legacyHistory];
  const pending = role?.pendingStatusUpdates ?? setting?.pendingStatusUpdates ?? [];
  const visibleHistory = activeFieldKey ? history.filter((event) => event.fieldKey === activeFieldKey) : history;
  const visiblePending = activeFieldKey ? pending.filter((event) => event.fieldKey === activeFieldKey) : pending;
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const selectedEvidence = [...pending, ...history].find((event) => event.id === selectedEvidenceId) ?? null;

  useEffect(() => {
    setSelectedEvidenceId(null);
  }, [entry?.id, activeFieldKey]);

  const applyRoleUpdate = (update: PendingSettingFieldUpdate, confirm: boolean) => {
    if (!role) return;
    const nextPending = (role.pendingStatusUpdates ?? []).filter((event) => event.id !== update.id);
    if (!confirm) {
      onRoleChange({ pendingStatusUpdates: nextPending });
      return;
    }
    const event = createConfirmedSettingFieldEvent(update);
    const sharedUpdates: Partial<RoleContent> = {
      pendingStatusUpdates: nextPending,
      statusHistory: [event, ...(role.statusHistory ?? [])],
    };
    if (update.fieldKey === 'relationshipState') {
      sharedUpdates.relationship = update.after;
      sharedUpdates.stateUpdateChapters = { ...getRoleStateUpdateChapters(role), relationshipState: update.chapter };
    } else if (ROLE_STATE_FIELD_DEFINITIONS.some((field) => field.key === update.fieldKey)) {
      const key = update.fieldKey as RoleStateFieldKey;
      const stateSettings = { ...getRoleStateSettings(role), [key]: update.after };
      sharedUpdates.stateSettings = stateSettings;
      sharedUpdates.status = buildRoleStateSettingsText(stateSettings);
      sharedUpdates.stateUpdateChapters = { ...getRoleStateUpdateChapters(role), [key]: update.chapter };
    } else if (ROLE_BASE_SETTING_FIELD_DEFINITIONS.some((field) => field.key === update.fieldKey)) {
      const key = update.fieldKey as RoleBaseSettingFieldKey;
      const baseFields = { ...parseRoleBaseSettingFields(getRoleBaseSetting(role)), [key]: update.after };
      const baseSetting = stringifyRoleBaseSettingFields(baseFields);
      sharedUpdates.baseSetting = baseSetting;
      sharedUpdates.background = baseSetting;
    }
    onRoleChange(sharedUpdates);
    setSelectedEvidenceId(event.id);
  };

  const applySettingUpdate = (update: PendingSettingFieldUpdate, confirm: boolean) => {
    if (!setting) return;
    const nextPending = (setting.pendingStatusUpdates ?? []).filter((event) => event.id !== update.id);
    if (!confirm) {
      onSettingChange({ ...setting, pendingStatusUpdates: nextPending });
      return;
    }
    const event = createConfirmedSettingFieldEvent(update);
    let body = setting.body;
    if (structuredFieldSet) {
      const values = parseStructuredSettingFields(setting.body, structuredFieldSet);
      body = stringifyStructuredSettingFields({ ...values, [update.fieldKey]: update.after }, structuredFieldSet);
    } else if (update.fieldKey === 'body') {
      body = update.after;
    }
    onSettingChange({
      ...setting,
      body,
      pendingStatusUpdates: nextPending,
      statusHistory: [event, ...(setting.statusHistory ?? [])],
    });
    setSelectedEvidenceId(event.id);
  };

  const decide = (update: PendingSettingFieldUpdate, confirm: boolean) => {
    if (role) applyRoleUpdate(update, confirm);
    else applySettingUpdate(update, confirm);
  };

  if (!entry) {
    return <div className="flex flex-1 items-center justify-center text-xs font-bold text-slate-400">请先从左侧选择一个设定</div>;
  }

  return (
    <div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-bold leading-5 text-emerald-700">已自动匹配：{entry.title || '暂无设定'}。状态分析不要求预先手动关联。</div>
      <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-black">
        <span className="rounded-lg bg-amber-50 px-2 py-2 text-amber-700">待确认 {visiblePending.length}</span>
        <span className="rounded-lg bg-sky-50 px-2 py-2 text-sky-600">历史变化 {visibleHistory.length}</span>
      </div>
      <section>
        <h3 className="mb-2 text-xs font-black text-slate-900">待确认更新</h3>
        {visiblePending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-5 text-center text-[10px] font-bold leading-5 text-slate-400">当前范围没有待确认更新。完成章节状态分析后，建议会进入这里。</div>
        ) : visiblePending.map((update) => (
          <article key={update.id} className="mb-2 rounded-xl border border-amber-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between gap-2"><strong className="text-xs text-slate-900">{update.fieldLabel}</strong><span className="rounded-md bg-amber-50 px-2 py-1 text-[9px] font-black text-amber-700">{update.kind}</span></div>
            <button type="button" onClick={() => setSelectedEvidenceId(update.id)} className="mt-2 w-full text-left">
              <p className="rounded-lg bg-slate-50 px-2 py-1.5 text-[10px] font-bold leading-5 text-slate-500">原：{update.before || '暂无内容'}</p>
              <p className="mt-1 rounded-lg bg-sky-50 px-2 py-1.5 text-[10px] font-black leading-5 text-sky-700">新：{update.after}</p>
              <span className="mt-1.5 block text-[9px] font-black text-amber-600">{update.chapter ? `第${update.chapter}章` : '未记录章节'}{update.paragraph ? `第${update.paragraph}段` : ''} · 查看依据</span>
            </button>
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" onClick={() => decide(update, false)} className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-400" title={`忽略${update.fieldLabel}`}><X className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => decide(update, true)} className="grid h-7 w-7 place-items-center rounded-md bg-[#08AACE] text-white" title={`确认${update.fieldLabel}`}><Check className="h-3.5 w-3.5" /></button>
            </div>
          </article>
        ))}
      </section>
      <section>
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-black text-slate-900"><History className="h-3.5 w-3.5 text-[#08AACE]" />历史状态</h3>
        {visibleHistory.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-5 text-center text-[10px] font-bold text-slate-400">当前字段暂无历史变化</div>
        ) : visibleHistory.map((event) => (
          <button key={event.id} type="button" onClick={() => setSelectedEvidenceId(event.id)} className={`mb-2 w-full rounded-xl border bg-white p-3 text-left ${selectedEvidenceId === event.id ? 'border-[#08AACE]' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between gap-2"><strong className="text-[11px] text-slate-900">{event.chapter ? `第${event.chapter}章` : '历史'} · {event.fieldLabel}</strong><span className="text-[9px] font-black text-slate-400">{event.kind}</span></div>
            <p className="mt-1 line-clamp-2 text-[10px] font-bold leading-5 text-slate-500">{event.before} → {event.after}</p>
          </button>
        ))}
      </section>
      <EvidencePanel event={selectedEvidence} />
      <section className="rounded-xl border border-slate-200 bg-white p-3">
        <h3 className="text-xs font-black text-slate-900">字段更新规则</h3>
        <div className="mt-2 space-y-1.5">
          {fields.map((field) => (
            <button key={field.key} type="button" className="flex w-full items-center justify-between gap-2 rounded-lg bg-slate-50 px-2 py-1.5 text-left" onClick={() => setSelectedEvidenceId(history.find((event) => event.fieldKey === field.key)?.id ?? null)}>
              <span className="truncate text-[10px] font-bold text-slate-600">{field.label}</span>
              <span className="shrink-0 text-[9px] font-black text-[#078fb0]">{getSettingFieldPolicy(role?.fieldUpdatePolicies ?? setting?.fieldUpdatePolicies, field.key, field.label)}</span>
            </button>
          ))}
        </div>
      </section>
      <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_WORKBENCH_STATUS_FLOW_EVENT))} className="h-11 w-full rounded-xl bg-[#08AACE] text-sm font-black text-white hover:bg-[#0796B8]">分析正文状态变化</button>
    </div>
  );
}

function EvidencePanel({ event }: { event: SettingFieldHistoryEvent | PendingSettingFieldUpdate | null }) {
  return (
    <section className="rounded-xl border border-sky-200 bg-sky-50 p-3">
      <h3 className="flex items-center gap-1.5 text-xs font-black text-sky-800"><FileSearch className="h-3.5 w-3.5" />更新依据</h3>
      {!event ? <p className="mt-2 text-[10px] font-bold leading-5 text-sky-600">点击待确认或历史记录后，在这里查看原文依据，不离开设定页面。</p> : (
        <>
          <div className="mt-2 text-[9px] font-black text-sky-700">{event.chapter ? `第${event.chapter}章` : '未记录章节'}{event.paragraph ? ` · 第${event.paragraph}段` : ''}</div>
          <blockquote className="mt-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-[10px] font-bold leading-5 text-slate-700">{event.evidence || '旧记录没有保存具体原文段落。'}</blockquote>
          {event.context ? <p className="mt-2 whitespace-pre-line text-[10px] font-bold leading-5 text-slate-500">{event.context}</p> : null}
          <p className="mt-2 text-[10px] font-black leading-5 text-sky-700">判断：{event.reason || '旧记录没有保存判断说明。'}</p>
        </>
      )}
    </section>
  );
}
