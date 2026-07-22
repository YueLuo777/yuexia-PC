import { Bot, Check, ChevronDown, CircleDot, Clock3, FileSearch, FolderOpen, History, Search, Sparkles, X } from 'lucide-react';

import {
  WORKBENCH_FOLDER_GROUP_BUTTON_CLASS,
  WORKBENCH_FOLDER_GROUP_COUNT_CLASS,
  WORKBENCH_FOLDER_GROUP_ICON_CLASS,
} from '@/features/workbench/components/chapterEditorLayout';

import {
  FUSION_SETTING_CATEGORIES,
  FUSION_SETTINGS,
  type FusionSetting,
  type PendingSettingUpdate,
  type SettingField,
  type SettingHistoryEvent,
} from './settingStatusFusionTestData';

export function FusionSettingDirectory({
  selectedSettingId,
  onSelectSetting,
}: {
  selectedSettingId: string;
  onSelectSetting: (id: string) => void;
}) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-gray-50 px-2 py-3">
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
        <input readOnly placeholder="搜索设定" className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs outline-none" />
      </div>
      <div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto">
        {FUSION_SETTING_CATEGORIES.map((category) => {
          const entries = FUSION_SETTINGS.filter((setting) => setting.category === category.name);
          return (
            <section key={category.name}>
              <button type="button" className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS} aria-expanded="true">
                <FolderOpen className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />
                <span className="min-w-0 flex-1 truncate leading-none">{category.name}</span>
                <span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{category.count}</span>
              </button>
              <div className="mt-1 space-y-1 pl-1">
                {entries.map((entry) => {
                  const selected = selectedSettingId === entry.id;
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      aria-label={`打开设定：${entry.title}`}
                      onClick={() => onSelectSetting(entry.id)}
                      className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                        selected
                          ? 'border-[#08AACE] bg-[#EAF9FD] shadow-sm'
                          : 'border-transparent bg-white/60 hover:border-slate-200 hover:bg-white'
                      }`}
                    >
                      <span className="block truncate text-xs font-black text-slate-900">{entry.title}</span>
                      <span className="mt-0.5 block truncate text-[10px] font-bold text-slate-400">{entry.subtitle}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[10px] font-bold leading-5 text-sky-700">
        AI自动识别并匹配设定；目录只负责查看，不要求用户预先勾选关联。
      </div>
    </aside>
  );
}

const policyClasses: Record<SettingField['policy'], string> = {
  锁定: 'bg-slate-100 text-slate-500',
  谨慎更新: 'bg-violet-50 text-violet-600',
  变化时检测: 'bg-sky-50 text-sky-600',
  每章检测: 'bg-emerald-50 text-emerald-600',
  关键变化: 'bg-amber-50 text-amber-700',
};

export function FusionCurrentSetting({
  setting,
  valueOverrides,
  pendingUpdates,
  activeFieldKey,
  onSelectField,
}: {
  setting: FusionSetting;
  valueOverrides: Record<string, string>;
  pendingUpdates: PendingSettingUpdate[];
  activeFieldKey: string | null;
  onSelectField: (key: string | null) => void;
}) {
  const groups = Array.from(
    setting.fields.reduce((result, field) => {
      const fields = result.get(field.group) ?? [];
      fields.push(field);
      result.set(field.group, fields);
      return result;
    }, new Map<string, SettingField[]>()),
  );
  return (
    <main className="flex min-h-0 flex-col bg-white">
      <header className="shrink-0 border-b border-slate-100 px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-950">{setting.title}</h1>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">{setting.category}</span>
            </div>
            <p className="mt-1 text-xs font-bold text-slate-400">{setting.subtitle} · 当前设定始终显示，不再切换基础/状态页面</p>
          </div>
          <button type="button" onClick={() => onSelectField(null)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-500">查看全部字段</button>
        </div>
      </header>
      <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="space-y-6">
          {groups.map(([group, fields]) => (
            <section key={group}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900">{group}</h2>
                <span className="text-[10px] font-bold text-slate-400">{fields.length}个字段</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {fields.map((field) => {
                  const pending = pendingUpdates.find((update) => update.fieldKey === field.key);
                  const selected = activeFieldKey === field.key;
                  const currentValue = valueOverrides[`${setting.id}:${field.key}`] ?? field.value;
                  return (
                    <button
                      key={field.key}
                      type="button"
                      aria-label={`查看字段：${field.label}`}
                      onClick={() => onSelectField(field.key)}
                      className={`relative min-h-[126px] rounded-[20px] border-2 bg-white p-4 text-left transition-colors ${
                        selected ? 'border-[#08AACE] shadow-[0_0_0_3px_rgba(8,170,206,0.08)]' : 'border-slate-950 hover:border-[#08AACE]'
                      }`}
                    >
                      <div className="xy-border-embedded-transparent-backplate absolute left-4 top-0 -translate-y-1/2 pr-2 text-sm font-black text-slate-950">{field.label}</div>
                      <div className="absolute right-3 top-3 flex items-center gap-1.5">
                        {pending ? <span className="rounded-md bg-red-50 px-2 py-1 text-[9px] font-black text-red-600">待确认</span> : null}
                        <span className={`rounded-md px-2 py-1 text-[9px] font-black ${policyClasses[field.policy]}`}>{field.policy}</span>
                      </div>
                      <p className="mt-6 whitespace-pre-wrap text-sm font-bold leading-6 text-slate-700">{currentValue}</p>
                      <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-slate-400">
                        <span>{field.updatedChapter ? `最近更新：第${field.updatedChapter}章` : '尚无历史更新'}</span>
                        <span>查看轨迹 →</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

export type FusionRightTab = 'setting' | 'status';

export function FusionRightPanel({
  activeTab,
  setting,
  pendingUpdates,
  history,
  activeFieldKey,
  selectedEvidence,
  onChangeTab,
  onSelectEvidence,
  onConfirm,
  onIgnore,
}: {
  activeTab: FusionRightTab;
  setting: FusionSetting;
  pendingUpdates: PendingSettingUpdate[];
  history: SettingHistoryEvent[];
  activeFieldKey: string | null;
  selectedEvidence: SettingHistoryEvent | PendingSettingUpdate | null;
  onChangeTab: (tab: FusionRightTab) => void;
  onSelectEvidence: (event: SettingHistoryEvent | PendingSettingUpdate) => void;
  onConfirm: (update: PendingSettingUpdate) => void;
  onIgnore: (update: PendingSettingUpdate) => void;
}) {
  const visiblePending = activeFieldKey ? pendingUpdates.filter((item) => item.fieldKey === activeFieldKey) : pendingUpdates;
  const visibleHistory = activeFieldKey ? history.filter((item) => item.fieldKey === activeFieldKey) : history;
  return (
    <aside className="flex min-h-0 flex-col border-l border-slate-200 bg-gray-50 p-3">
      <div className="grid grid-cols-2 rounded-xl bg-slate-200/70 p-1">
        <button type="button" onClick={() => onChangeTab('setting')} className={`h-9 rounded-lg text-xs font-black ${activeTab === 'setting' ? 'bg-white text-[#078fb0] shadow-sm' : 'text-slate-500'}`}>设定</button>
        <button type="button" onClick={() => onChangeTab('status')} className={`h-9 rounded-lg text-xs font-black ${activeTab === 'status' ? 'bg-white text-[#078fb0] shadow-sm' : 'text-slate-500'}`}>状态 · {pendingUpdates.length}</button>
      </div>
      {activeTab === 'setting' ? (
        <FusionSettingAssistant setting={setting} />
      ) : (
        <div className="editor-scrollbar mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-black">
            <span className="rounded-lg bg-amber-50 px-2 py-2 text-amber-700">待确认 {visiblePending.length}</span>
            <span className="rounded-lg bg-sky-50 px-2 py-2 text-sky-600">历史变化 {visibleHistory.length}</span>
          </div>
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-xs font-black text-slate-900"><CircleDot className="h-3.5 w-3.5 text-amber-500" />待确认更新</h3>
              <span className="text-[9px] font-bold text-slate-400">{activeFieldKey ? '当前字段' : '当前设定'}</span>
            </div>
            {visiblePending.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-5 text-center text-[10px] font-bold text-slate-400">当前范围没有待确认更新</div>
            ) : visiblePending.map((update) => (
              <article key={update.id} className="mb-2 rounded-xl border border-amber-200 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2"><strong className="text-xs text-slate-900">{update.fieldLabel}</strong><span className="rounded-md bg-amber-50 px-2 py-1 text-[9px] font-black text-amber-700">{update.kind}</span></div>
                <button type="button" onClick={() => onSelectEvidence(update)} className="mt-2 w-full text-left">
                  <p className="rounded-lg bg-slate-50 px-2 py-1.5 text-[10px] font-bold leading-5 text-slate-500">原：{update.before}</p>
                  <p className="mt-1 rounded-lg bg-sky-50 px-2 py-1.5 text-[10px] font-black leading-5 text-sky-700">新：{update.after}</p>
                  <span className="mt-1.5 block text-[9px] font-black text-amber-600">第{update.chapter}章第{update.paragraph}段 · 查看依据</span>
                </button>
                <div className="mt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => onIgnore(update)} className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-400" title={`忽略${update.fieldLabel}`}><X className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => onConfirm(update)} className="grid h-7 w-7 place-items-center rounded-md bg-[#08AACE] text-white" title={`确认${update.fieldLabel}`}><Check className="h-3.5 w-3.5" /></button>
                </div>
              </article>
            ))}
          </section>
          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-black text-slate-900"><History className="h-3.5 w-3.5 text-[#08AACE]" />历史状态</h3>
            {visibleHistory.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-5 text-center text-[10px] font-bold text-slate-400">当前字段暂无历史变化</div>
            ) : visibleHistory.map((event) => (
              <button key={event.id} type="button" onClick={() => onSelectEvidence(event)} className={`mb-2 w-full rounded-xl border bg-white p-3 text-left ${selectedEvidence?.id === event.id ? 'border-[#08AACE]' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between gap-2"><strong className="text-[11px] text-slate-900">第{event.chapter}章 · {event.fieldLabel}</strong><span className="text-[9px] font-black text-slate-400">{event.kind}</span></div>
                <p className="mt-1 line-clamp-2 text-[10px] font-bold leading-5 text-slate-500">{event.before} → {event.after}</p>
              </button>
            ))}
          </section>
          <EvidencePanel event={selectedEvidence} />
        </div>
      )}
    </aside>
  );
}

function FusionSettingAssistant({ setting }: { setting: FusionSetting }) {
  return (
    <div className="mt-3 flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2"><Bot className="h-5 w-5 text-[#08AACE]" /><h3 className="text-sm font-black text-slate-900">设定助手</h3></div>
      <button type="button" className="mt-3 flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600"><span>模型与提示词</span><ChevronDown className="h-4 w-4" /></button>
      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[10px] font-bold leading-5 text-emerald-700"><Sparkles className="mr-1 inline h-3.5 w-3.5" />已自动匹配：{setting.category} / {setting.title}</div>
      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
        <h4 className="text-xs font-black text-slate-900">字段更新规则</h4>
        <div className="mt-2 space-y-2 text-[10px] font-bold leading-5 text-slate-500">
          <p><strong className="text-slate-700">锁定：</strong>AI只能提出建议，不能自动覆盖。</p>
          <p><strong className="text-violet-600">谨慎更新：</strong>优先补充信息，避免误判成状态变化。</p>
          <p><strong className="text-sky-600">变化时检测：</strong>正文出现明确变化才生成待确认。</p>
          <p><strong className="text-emerald-600">每章检测：</strong>每章审核后检查一次。</p>
        </div>
      </div>
      <div className="mt-auto rounded-xl border border-sky-100 bg-sky-50 p-3 text-[10px] font-bold leading-5 text-sky-700"><FileSearch className="mr-1 inline h-3.5 w-3.5" />分析正文时会自动查询设定库，不需要手动关联。</div>
      <button type="button" className="mt-2 h-11 rounded-xl bg-[#08AACE] text-sm font-black text-white">分析第12章设定变化</button>
    </div>
  );
}

function EvidencePanel({ event }: { event: SettingHistoryEvent | PendingSettingUpdate | null }) {
  return (
    <section className="rounded-xl border border-sky-200 bg-sky-50 p-3">
      <h3 className="flex items-center gap-1.5 text-xs font-black text-sky-800"><FileSearch className="h-3.5 w-3.5" />更新依据</h3>
      {!event ? <p className="mt-2 text-[10px] font-bold leading-5 text-sky-600">点击待确认或历史记录后，在这里直接查看原文依据，不离开设定页面。</p> : (
        <>
          <div className="mt-2 flex items-center gap-2 text-[9px] font-black text-sky-700"><Clock3 className="h-3 w-3" />第{event.chapter}章 · 第{event.paragraph}段</div>
          <blockquote className="mt-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-[10px] font-bold leading-5 text-slate-700">{event.evidence}</blockquote>
          <p className="mt-2 whitespace-pre-line text-[10px] font-bold leading-5 text-slate-500">{event.context}</p>
          <p className="mt-2 text-[10px] font-black leading-5 text-sky-700">判断：{event.reason}</p>
        </>
      )}
    </section>
  );
}
