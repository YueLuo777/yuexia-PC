import { ChevronDown, ChevronRight, History, LockKeyhole, Search, SendHorizontal, Sparkles, X } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

import { WorkbenchHeaderSelect } from '@/features/workbench/components/WorkbenchHeaderSelect';
import { WorkbenchNameField } from '@/features/workbench/components/WorkbenchNameField';
import { WorkbenchSettingGroupSelect } from '@/features/workbench/components/WorkbenchSettingGroupSelect';
import { WorkbenchSurvivalStatusToggle } from '@/features/workbench/components/WorkbenchSurvivalStatusToggle';
import {
  AI_READY_ENTRIES,
  AI_READY_PROFILES,
  type AiReadyEntry,
  type AiReadyField,
  type AiReadyPreviewId,
} from '@/features/tests/pages/settingAiReadyTaxonomyData';

const TAG_CLASSES: Record<NonNullable<AiReadyEntry['tag']>, string> = {
  男主: 'border-[#F6C453] bg-[#FFF4CC] text-[#9A5B00]',
  女主: 'border-[#F4B8C6] bg-[#FFF0F4] text-[#A33B5B]',
  配角: 'border-[#94DCE8] bg-[#EAF9FC] text-[#087C93]',
  反派: 'border-[#F3A6A6] bg-[#FFF0F0] text-[#B42318]',
};

const EMPTY_DOMAINS = ['势力设定', '道具资源', '怪物图鉴', '伏笔线索'] as const;

function FieldFrame({ field, onRecord }: { field: AiReadyField; onRecord: (label: string) => void }) {
  const heightClass = field.compact
    ? 'min-h-[124px]'
    : field.value.length > 54
      ? 'min-h-[196px]'
      : field.value.length > 32
        ? 'min-h-[168px]'
        : 'min-h-[136px]';
  return (
    <article className={`relative flex flex-col rounded-[20px] border-2 border-slate-950 bg-white px-5 pb-3 pt-3 ${heightClass}`}>
      <div className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950">
        {field.label}
      </div>
      <textarea
        aria-label={field.label}
        defaultValue={field.value}
        rows={field.compact ? 2 : 3}
        className="editor-scrollbar min-h-0 w-full flex-1 resize-none border-0 bg-transparent text-base font-medium leading-8 text-slate-950 outline-none [scrollbar-gutter:stable]"
      />
      <button
        type="button"
        onClick={() => onRecord(field.label)}
        className="xy-border-embedded-transparent-backplate xy-field-record-icon-button absolute right-5 top-0 z-10 grid h-6 w-6 -translate-y-1/2 place-items-center text-[#08AACE] hover:text-[#078fb0]"
        title="字段记录"
        aria-label={`${field.label}字段记录`}
      >
        <History className="h-4 w-4" />
      </button>
    </article>
  );
}

function EntryButton({ entry, selected, onSelect }: { entry: AiReadyEntry; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative flex min-h-9 w-full items-center gap-1.5 rounded-md border px-3 py-2 text-left text-xs font-bold ${
        selected
          ? 'border-2 border-[#2A9FB9] bg-white text-slate-600'
          : 'border-transparent bg-white/70 text-slate-600 hover:border-[#D9F3F8] hover:bg-white'
      }`}
    >
      <span
        aria-hidden="true"
        data-ai-ready-item-connector="true"
        className={`pointer-events-none absolute left-[-12px] top-1/2 z-[1] h-px w-[11px] ${
          selected ? 'bg-[#2A9FB9]' : 'bg-[#9ADFEA]'
        }`}
      />
      <span className={entry.tag ? 'w-[4em] shrink-0 truncate' : 'min-w-0 truncate'}>{entry.title}</span>
      {entry.tag ? (
        <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-black leading-none ${TAG_CLASSES[entry.tag]}`}>
          {entry.tag}
        </span>
      ) : null}
      {entry.domain === 'work' ? <LockKeyhole className="ml-auto h-3.5 w-3.5 text-slate-300" /> : null}
    </button>
  );
}

function TreeGroup({
  title,
  entries,
  selectedId,
  pathActive,
  onSelect,
}: {
  title: string;
  entries: AiReadyEntry[];
  selectedId: AiReadyPreviewId;
  pathActive: boolean;
  onSelect: (id: AiReadyPreviewId) => void;
}) {
  const selectedIndex = entries.findIndex((entry) => entry.id === selectedId);
  const selected = selectedIndex >= 0;
  return (
    <div className="relative">
      {pathActive ? (
        <span
          aria-hidden="true"
          data-ai-ready-domain-selected-path="true"
          className={`pointer-events-none absolute -left-2 z-[1] w-px bg-[#2A9FB9] ${
            selected ? 'top-[-4px] h-7' : 'bottom-[-4px] top-[-4px]'
          }`}
        />
      ) : null}
      <span
        aria-hidden="true"
        data-ai-ready-group-connector="true"
        className={`pointer-events-none absolute -left-2 top-6 z-[1] h-px w-2 ${selected ? 'bg-[#2A9FB9]' : 'bg-[#7DCDDC]'}`}
      />
      <div className="py-1">
        <div className="relative flex h-9 w-full items-center gap-2 rounded-lg border border-[#B7EAF3] bg-[#DDF5FA] px-2 text-xs font-black text-[#155E75]">
          <ChevronDown className="h-3.5 w-3.5 text-[#08AACE]" />
          <span>{title}</span>
          <span className="ml-auto text-[10px] text-slate-400">{entries.length}</span>
        </div>
      </div>
      <div className="relative space-y-px pl-3 before:absolute before:bottom-[18px] before:left-0 before:top-[-4px] before:w-px before:bg-[#9ADFEA] before:content-['']">
        {selected ? (
          <span
            aria-hidden="true"
            data-ai-ready-selected-path="true"
            className="pointer-events-none absolute left-0 top-[-4px] z-[1] w-px bg-[#2A9FB9]"
            style={{ height: 22 + selectedIndex * 37 }}
          />
        ) : null}
        {entries.map((entry) => (
          <EntryButton key={entry.id} entry={entry} selected={entry.id === selectedId} onSelect={() => onSelect(entry.id)} />
        ))}
      </div>
    </div>
  );
}

function DomainBlock({ title, count, children }: { title: string; count: number; children?: ReactNode }) {
  const [open, setOpen] = useState(Boolean(children));
  return (
    <section className="mb-1">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center gap-2 rounded-xl border border-[#AEE7F1] bg-[#CDEFF6] px-2 text-left text-sm font-black text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] hover:bg-[#BFEAF3]"
      >
        {open ? <ChevronDown className="h-4 w-4 text-[#08AACE]" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
        <span>{title}</span>
        <span className="ml-auto rounded-md bg-white px-1.5 py-0.5 text-[10px] text-slate-400">{count}</span>
      </button>
      {open && children ? (
        <div className="relative space-y-1 pl-3 before:absolute before:bottom-2 before:left-1 before:top-0 before:w-px before:bg-[#7DCDDC] before:content-['']">
          {children}
        </div>
      ) : null}
    </section>
  );
}

function ProfileEditor({ selectedId, onRecord }: { selectedId: AiReadyPreviewId; onRecord: (label: string) => void }) {
  const profile = AI_READY_PROFILES[selectedId];
  return (
    <>
      <header className="shrink-0 px-1 pr-2">
        <div className="flex min-h-[48px] flex-wrap items-start gap-3">
          {profile.kind === 'role' ? (
            <>
              <WorkbenchNameField label="人物姓名" value={profile.title} placeholder="填写人物姓名" disabled onValueChange={() => undefined} />
              <WorkbenchHeaderSelect
                label="身份定位"
                width={180}
                value={profile.identity ?? ''}
                options={[profile.identity ?? '']}
                disabled
                onChange={() => undefined}
              />
              <WorkbenchSurvivalStatusToggle value="存活" disabled onChange={() => undefined} />
            </>
          ) : (
            <>
              <WorkbenchNameField label="设定名" value={profile.title} placeholder="填写设定名" width={220} disabled onValueChange={() => undefined} />
              <WorkbenchSettingGroupSelect value={profile.group} options={[profile.group]} disabled onChange={() => undefined} />
            </>
          )}
        </div>
      </header>
      <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-1 pb-2 pr-2 pt-4 [scrollbar-gutter:stable]">
        <div className="space-y-5">
          {profile.sections.map((section) => (
            <section key={`${selectedId}-${section.title}`}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="shrink-0 text-sm font-black text-slate-800">{section.title}</h2>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className={`grid items-stretch gap-3 ${section.columns === 6 ? 'grid-cols-6' : 'grid-cols-2'}`}>
                {section.fields.map((field) => (
                  <div
                    key={`${section.title}-${field.label}`}
                    className={
                      field.colSpan === 6
                        ? 'col-span-6'
                        : field.colSpan === 3
                          ? 'col-span-3'
                          : field.colSpan === 2
                            ? 'col-span-2'
                            : ''
                    }
                  >
                    <FieldFrame field={field} onRecord={onRecord} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

function AiPanel({ selectedId }: { selectedId: AiReadyPreviewId }) {
  const profile = AI_READY_PROFILES[selectedId];
  const [instruction, setInstruction] = useState('在不突破已有边界的前提下，补全当前设定，并检查与其他资料是否冲突。');
  return (
    <aside className="flex min-h-0 flex-col border-l border-slate-200 bg-[#F8FAFC] p-4">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <Sparkles className="h-4 w-4 text-[#08AACE]" />
        <h2 className="text-sm font-black text-slate-800">AI设定助手</h2>
        <span className="ml-auto rounded border border-[#9ADFEA] bg-white px-2 py-1 text-[10px] font-black text-[#087C93]">提示词增强</span>
      </div>
      <div className="editor-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto py-4 [scrollbar-gutter:stable]">
        <section>
          <h3 className="text-xs font-black text-slate-700">本条资料的生成约束</h3>
          <p className="mt-2 rounded-lg border border-[#9ADFEA] bg-white p-3 text-xs font-medium leading-6 text-slate-600">{profile.aiPrompt}</p>
        </section>
        <section>
          <h3 className="text-xs font-black text-slate-700">AI读取范围</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.sections.map((section) => (
              <span key={section.title} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600">
                {section.title}
              </span>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-3">
          <h3 className="text-xs font-black text-slate-700">为什么增加这些字段</h3>
          <p className="mt-2 text-xs font-medium leading-6 text-slate-500">
            让AI同时知道角色能做什么、不能做什么、知道多少、目前处于什么状态，减少续写时战力突变、秘密提前泄露和人物行为失真。
          </p>
        </section>
      </div>
      <label className="shrink-0 rounded-xl border border-[#78CFE0] bg-white p-3 shadow-sm">
        <span className="text-xs font-black text-slate-700">补充要求</span>
        <textarea
          aria-label="AI补充要求"
          value={instruction}
          onChange={(event) => setInstruction(event.target.value)}
          rows={4}
          className="mt-2 w-full resize-none border-0 bg-transparent text-sm font-medium leading-6 text-slate-700 outline-none"
        />
        <button type="button" className="ml-auto grid h-9 w-9 place-items-center rounded-lg bg-[#08AACE] text-white hover:bg-[#078FAE]" title="生成设定" aria-label="生成设定">
          <SendHorizontal className="h-4 w-4" />
        </button>
      </label>
    </aside>
  );
}

export function SettingAiReadyTaxonomyTestPage() {
  const [selectedId, setSelectedId] = useState<AiReadyPreviewId>('lin-ke');
  const [query, setQuery] = useState('');
  const [recordField, setRecordField] = useState<string | null>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredEntries = useMemo(
    () => AI_READY_ENTRIES.filter((entry) => entry.title.toLocaleLowerCase().includes(normalizedQuery)),
    [normalizedQuery],
  );
  const selectedEntry = AI_READY_ENTRIES.find((entry) => entry.id === selectedId) ?? AI_READY_ENTRIES[0];
  const byGroup = (domain: AiReadyEntry['domain'], group: string) =>
    filteredEntries.filter((entry) => entry.domain === domain && entry.group === group);
  const roleGroups = ['男女主', '重要配角', '反派'] as const;
  const selectedRoleGroupIndex = roleGroups.indexOf(selectedEntry.group as (typeof roleGroups)[number]);

  return (
    <div data-testid="ai-ready-setting-simulation" className="xy-setting-workspace-typography flex h-full min-h-0 flex-col overflow-hidden bg-white text-slate-900">
      <header className="flex h-12 shrink-0 items-center border-b border-slate-200 bg-white px-4">
        <div className="flex h-full items-end gap-1">
          <button type="button" className="h-10 border-b-2 border-[#08AACE] px-4 text-sm font-black text-[#078FAE]">切换设定</button>
          <button type="button" className="h-10 border-b-2 border-transparent px-4 text-sm font-bold text-slate-400">更新状态</button>
        </div>
        <span className="ml-auto rounded-md border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-black text-cyan-700">17号模拟 · AI可执行版</span>
      </header>

      <div className="grid min-h-0 min-w-[1180px] flex-1 grid-cols-[250px_minmax(620px,1fr)_320px]">
        <aside className="flex min-h-0 min-w-0 flex-col border-r border-slate-200 bg-[#F7F9FB] px-2 py-2">
          <label className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input aria-label="搜索AI可执行设定" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索资料..." className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400" />
          </label>
          <nav aria-label="17号AI可执行设定资料树" className="xy-setting-sidebar-scrollbar mt-3 min-h-0 flex-1 overflow-y-auto px-1 [scrollbar-gutter:stable]">
            <DomainBlock title="作品设定" count={filteredEntries.filter((entry) => entry.domain === 'work').length}>
              <TreeGroup title="核心设定" entries={byGroup('work', '核心设定')} selectedId={selectedId} pathActive={selectedEntry.domain === 'work'} onSelect={setSelectedId} />
            </DomainBlock>
            <DomainBlock title="人物设定" count={filteredEntries.filter((entry) => entry.domain === 'character').length}>
              {roleGroups.map((group, groupIndex) => {
                const entries = byGroup('character', group);
                return entries.length ? (
                  <TreeGroup
                    key={group}
                    title={group}
                    entries={entries}
                    selectedId={selectedId}
                    pathActive={selectedEntry.domain === 'character' && groupIndex <= selectedRoleGroupIndex}
                    onSelect={setSelectedId}
                  />
                ) : null;
              })}
            </DomainBlock>
            {!normalizedQuery ? EMPTY_DOMAINS.map((title) => <DomainBlock key={title} title={title} count={0} />) : null}
          </nav>
          <div className="mt-3 grid h-11 shrink-0 grid-cols-3 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-center border-r border-slate-200 bg-[#DFF7FC] text-sm font-black text-[#08AACE]">新建</div>
            <button type="button" className="text-xs font-bold text-slate-600">分组</button>
            <button type="button" className="border-l border-slate-200 text-xs font-bold text-slate-600">设定</button>
          </div>
        </aside>

        <main className="relative flex min-h-0 min-w-0 flex-col bg-white px-5 pb-3 pt-[23px]">
          <div className="mb-3 flex shrink-0 items-center gap-2 text-xs font-bold text-slate-400">
            <span>{selectedEntry.domain === 'character' ? '人物设定' : '作品设定'}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>{selectedEntry.group}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-700">{selectedEntry.title}</span>
          </div>
          <ProfileEditor selectedId={selectedId} onRecord={setRecordField} />
          {recordField ? (
            <div className="absolute right-8 top-20 z-20 w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-[#08AACE]" />
                <strong className="text-sm">{recordField}记录</strong>
                <button type="button" onClick={() => setRecordField(null)} className="ml-auto grid h-7 w-7 place-items-center rounded-md hover:bg-slate-100" title="关闭" aria-label="关闭字段记录">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-xs font-medium leading-6 text-slate-500">当前仅展示17号测试记录，正式页面的数据和历史记录均未修改。</p>
            </div>
          ) : null}
        </main>

        <AiPanel selectedId={selectedId} />
      </div>
    </div>
  );
}
