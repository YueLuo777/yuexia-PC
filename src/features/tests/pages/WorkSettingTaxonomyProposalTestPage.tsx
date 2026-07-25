import { ChevronDown, ChevronRight, History, LockKeyhole, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { WorkbenchHeaderSelect } from '@/features/workbench/components/WorkbenchHeaderSelect';
import { WorkbenchNameField } from '@/features/workbench/components/WorkbenchNameField';
import { WorkbenchSettingGroupSelect } from '@/features/workbench/components/WorkbenchSettingGroupSelect';
import { WorkbenchSurvivalStatusToggle } from '@/features/workbench/components/WorkbenchSurvivalStatusToggle';
import { WorkSettingTaxonomyAiPanel } from '@/features/tests/pages/WorkSettingTaxonomyAiPanel';
import {
  PREVIEW_ENTRIES,
  ROLE_PROFILES,
  WORK_PREVIEWS,
  isRolePreviewId,
  type FieldDefinition,
  type PreviewEntry,
  type PreviewId,
  type RolePreviewId,
  type WorkPreviewId,
} from '@/features/tests/pages/workSettingTaxonomyProposalData';

const COLLAPSED_DOMAINS = [
  ['势力设定', 0],
  ['道具资源', 0],
  ['怪物图鉴', 0],
  ['伏笔线索', 0],
] as const;

const TAG_CLASSES: Record<NonNullable<PreviewEntry['tag']>, string> = {
  男主: 'border-[#F6C453] bg-[#FFF4CC] text-[#9A5B00]',
  女主: 'border-[#F4B8C6] bg-[#FFF0F4] text-[#A33B5B]',
  配角: 'border-[#94DCE8] bg-[#EAF9FC] text-[#087C93]',
  反派: 'border-[#F3A6A6] bg-[#FFF0F0] text-[#B42318]',
};

function FieldFrame({ field, onRecord }: { field: FieldDefinition; onRecord: (label: string) => void }) {
  return (
    <article
      className={`relative flex flex-col rounded-[20px] border-2 border-slate-950 bg-white px-5 pb-3 pt-3 ${
        field.compact ? 'min-h-[92px]' : 'min-h-[136px]'
      }`}
    >
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

function EntryButton({ entry, selected, onSelect }: { entry: PreviewEntry; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative flex min-h-9 w-full items-center gap-1.5 rounded-md border px-3 py-2 text-left text-xs font-bold ${
        selected
          ? 'border-2 border-[#078FAE] bg-white text-slate-700'
          : 'border-transparent bg-white/70 text-slate-600 hover:border-[#D9F3F8] hover:bg-white'
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[-12px] bottom-1/2 top-[-1px] w-px bg-[#9ADFEA]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[-12px] top-1/2 h-px w-[11px] bg-[#9ADFEA]"
      />
      <span className={entry.tag ? 'w-[4em] shrink-0 truncate' : 'min-w-0 truncate'}>{entry.title}</span>
      {entry.tag ? (
        <span
          className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-black leading-none ${TAG_CLASSES[entry.tag]}`}
        >
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
  onSelect,
}: {
  title: string;
  entries: PreviewEntry[];
  selectedId: PreviewId;
  onSelect: (id: PreviewId) => void;
}) {
  return (
    <div>
      <div className="relative flex h-9 w-full items-center gap-2 rounded-lg border border-[#B7EAF3] bg-[#DDF5FA] px-2 text-xs font-black text-[#155E75]">
        <ChevronDown className="h-3.5 w-3.5 text-[#08AACE]" />
        <span>{title}</span>
        <span className="ml-auto text-[10px] text-slate-400">{entries.length}</span>
      </div>
      <div className="relative space-y-px pl-3">
        {entries.map((entry) => (
          <EntryButton
            key={entry.id}
            entry={entry}
            selected={selectedId === entry.id}
            onSelect={() => onSelect(entry.id)}
          />
        ))}
      </div>
    </div>
  );
}

function DomainBlock({ title, count, children }: { title: string; count: number; children?: React.ReactNode }) {
  const [open, setOpen] = useState(Boolean(children));
  return (
    <section className="mb-1">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center gap-2 rounded-xl border border-[#AEE7F1] bg-[#CDEFF6] px-2 text-left text-sm font-black text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] hover:bg-[#BFEAF3]"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-[#08AACE]" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400" />
        )}
        <span>{title}</span>
        <span className="ml-auto rounded-md bg-white px-1.5 py-0.5 text-[10px] text-slate-400">{count}</span>
      </button>
      {open && children ? (
        <div className="relative space-y-1 pl-3 before:absolute before:bottom-2 before:left-1 before:top-2 before:w-px before:bg-[#7DCDDC] before:content-['']">
          {children}
        </div>
      ) : null}
    </section>
  );
}

function RolePreview({ id, onRecord }: { id: RolePreviewId; onRecord: (label: string) => void }) {
  const profile = ROLE_PROFILES[id];
  return (
    <>
      <header className="shrink-0 px-1 pr-2">
        <div className="flex min-h-[48px] flex-wrap items-start gap-3">
          <WorkbenchNameField
            label="人物姓名"
            value={profile.name}
            placeholder="填写人物姓名"
            disabled
            onValueChange={() => undefined}
          />
          <WorkbenchHeaderSelect
            label="身份定位"
            width={180}
            value={profile.identity}
            options={[profile.identity]}
            disabled
            onChange={() => undefined}
          />
          <WorkbenchSurvivalStatusToggle value="存活" disabled onChange={() => undefined} />
        </div>
      </header>
      <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-1 pb-2 pr-2 pt-4 [scrollbar-gutter:stable]">
        <div className="space-y-5">
          {profile.sections.map((section) => (
            <section key={section.title} aria-labelledby={`${id}-section-${section.title}`}>
              <div className="mb-4 flex items-center gap-3">
                <h2 id={`${id}-section-${section.title}`} className="shrink-0 text-sm font-black text-slate-800">
                  {section.title}
                </h2>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div
                className={`grid items-stretch gap-3 ${
                  section.columns === 6 ? 'grid-cols-6' : section.columns === 3 ? 'grid-cols-3' : 'grid-cols-2'
                }`}
              >
                {section.fields.map((field) => (
                  <div
                    key={`${id}-${field.key}`}
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

function WorkPreview({ id, onRecord }: { id: WorkPreviewId; onRecord: (label: string) => void }) {
  const preview = WORK_PREVIEWS[id];
  return (
    <>
      <header className="shrink-0 px-1 pr-2">
        <div className="flex min-h-[48px] flex-wrap items-start gap-3">
          <WorkbenchNameField
            label="设定名"
            value={id === 'work-positioning' ? '作品定位' : '世界背景'}
            placeholder="填写设定名"
            width={220}
            disabled
            onValueChange={() => undefined}
          />
          <WorkbenchSettingGroupSelect
            value={preview.group}
            options={['核心设定']}
            disabled
            onChange={() => undefined}
          />
        </div>
      </header>
      <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-1 pb-2 pr-2 pt-4 [scrollbar-gutter:stable]">
        <div className="grid grid-cols-2 items-stretch gap-3">
          {preview.fields.map((field, index) => (
            <div
              key={field.key}
              className={index === preview.fields.length - 1 && preview.fields.length % 2 === 1 ? 'col-span-2' : ''}
            >
              <FieldFrame field={field} onRecord={onRecord} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function WorkSettingTaxonomyProposalTestPage() {
  const [selectedId, setSelectedId] = useState<PreviewId>('lin-ke');
  const [query, setQuery] = useState('');
  const [recordField, setRecordField] = useState<string | null>(null);
  const selectedEntry = PREVIEW_ENTRIES.find((entry) => entry.id === selectedId) ?? PREVIEW_ENTRIES[2];
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredEntries = useMemo(
    () => PREVIEW_ENTRIES.filter((entry) => entry.title.toLocaleLowerCase().includes(normalizedQuery)),
    [normalizedQuery],
  );
  const entriesForGroup = (domain: PreviewEntry['domain'], group: string) =>
    filteredEntries.filter((entry) => entry.domain === domain && entry.group === group);

  return (
    <div
      data-testid="setting-format-simulation"
      className="xy-setting-workspace-typography flex h-full min-h-0 flex-col overflow-hidden bg-white text-slate-900"
    >
      <header className="flex h-12 shrink-0 items-center border-b border-slate-200 bg-white px-4">
        <div className="flex h-full items-end gap-1">
          <button type="button" className="h-10 border-b-2 border-[#08AACE] px-4 text-sm font-black text-[#078FAE]">
            切换设定
          </button>
          <button type="button" className="h-10 border-b-2 border-transparent px-4 text-sm font-bold text-slate-400">
            更新状态
          </button>
        </div>
        <span className="ml-auto rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700">
          16号模拟
        </span>
      </header>

      <div className="grid min-h-0 min-w-[1180px] flex-1 grid-cols-[250px_minmax(620px,1fr)_300px]">
        <aside className="flex min-h-0 min-w-0 flex-col border-r border-slate-200 bg-[#F7F9FB] px-2 py-2">
          <label className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              aria-label="搜索设定资料"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索资料..."
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>
          <nav
            aria-label="16号设定资料树"
            className="xy-setting-sidebar-scrollbar mt-3 min-h-0 flex-1 overflow-y-auto px-1"
          >
            <DomainBlock title="作品设定" count={entriesForGroup('work', '核心设定').length}>
              <TreeGroup
                title="核心设定"
                entries={entriesForGroup('work', '核心设定')}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </DomainBlock>
            <DomainBlock
              title="人物设定"
              count={filteredEntries.filter((entry) => entry.domain === 'character').length}
            >
              {(['男女主', '重要配角', '反派'] as const).map((group) => {
                const entries = entriesForGroup('character', group);
                return entries.length ? (
                  <TreeGroup
                    key={group}
                    title={group}
                    entries={entries}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                  />
                ) : null;
              })}
            </DomainBlock>
            {!normalizedQuery
              ? COLLAPSED_DOMAINS.map(([title, count]) => <DomainBlock key={title} title={title} count={count} />)
              : null}
          </nav>
          <div className="mt-3 grid h-11 shrink-0 grid-cols-3 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-center border-r border-slate-200 bg-[#DFF7FC] text-sm font-black text-[#08AACE]">
              新建
            </div>
            <button type="button" className="text-xs font-bold text-slate-600">
              分组
            </button>
            <button type="button" className="border-l border-slate-200 text-xs font-bold text-slate-600">
              设定
            </button>
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
          {isRolePreviewId(selectedId) ? (
            <RolePreview id={selectedId} onRecord={setRecordField} />
          ) : (
            <WorkPreview id={selectedId} onRecord={setRecordField} />
          )}
          {recordField ? (
            <div className="absolute right-8 top-20 z-20 w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-[#08AACE]" />
                <strong className="text-sm">{recordField}记录</strong>
                <button
                  type="button"
                  onClick={() => setRecordField(null)}
                  className="ml-auto grid h-7 w-7 place-items-center rounded-md hover:bg-slate-100"
                  title="关闭"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-xs font-medium leading-6 text-slate-500">
                当前为16号测试模拟记录，正式页面的数据和历史记录均未修改。
              </p>
            </div>
          ) : null}
        </main>

        <WorkSettingTaxonomyAiPanel selectedId={selectedId} />
      </div>
    </div>
  );
}
