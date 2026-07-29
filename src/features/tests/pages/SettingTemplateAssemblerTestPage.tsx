import { useMemo, useState } from 'react';

import { SMART_TEMPLATE_PRESETS } from '@/features/workbench/model/standardModeSmartSettingFlowModel';
import type {
  TemplateDomainNode,
  TemplateEntryNode,
  TemplateFieldNode,
  TemplateGroupNode,
} from '@/features/workbench/model/standardModeTemplateModel';

type PresetMode = 'compact' | 'standard' | 'complete';
type FieldTag = '必需' | '推荐' | '进阶';

type FieldOption = {
  field: TemplateFieldNode;
  domain: TemplateDomainNode;
  group: TemplateGroupNode;
  entry: TemplateEntryNode;
  tag: FieldTag;
  path: string;
};

const fantasyTemplate = SMART_TEMPLATE_PRESETS.find((preset) => preset.id === 'male-fantasy-xianxia');
const templateStructure = fantasyTemplate?.structure ?? [];

const allFieldOptions: FieldOption[] = templateStructure.flatMap((domain) =>
  domain.groups.flatMap((group) =>
    group.entries.flatMap((entry) => {
      const fields = entry.sections.flatMap((section) => section.fields);
      return fields.map((field, index) => ({
        field,
        domain,
        group,
        entry,
        tag: index < 2 ? '必需' : index < 4 ? '推荐' : '进阶',
        path: `${domain.title} ＞ ${group.title} ＞ ${entry.title} ＞ ${field.title}`,
      }));
    }),
  ),
);

const optionByFieldId = new Map(allFieldOptions.map((option) => [option.field.id, option]));

const PRESET_OPTIONS: Array<{ id: PresetMode; title: string; description: string }> = [
  { id: 'compact', title: '精简模板', description: '只保留每项最关键的必需字段' },
  { id: 'standard', title: '标准模板', description: '必需与推荐字段，适合多数作品' },
  { id: 'complete', title: '完整模板', description: '包含全部进阶字段' },
];

const TAG_STYLES: Record<FieldTag, string> = {
  必需: 'bg-red-50 text-red-600',
  推荐: 'bg-[#EAF9FD] text-[#078FAB]',
  进阶: 'bg-violet-50 text-violet-600',
};

function getPresetFieldIds(mode: PresetMode) {
  return new Set(
    allFieldOptions
      .filter((option) => mode === 'complete' || option.tag === '必需' || (mode === 'standard' && option.tag === '推荐'))
      .map((option) => option.field.id),
  );
}

function getEntryFieldOptions(entry: TemplateEntryNode) {
  return entry.sections
    .flatMap((section) => section.fields)
    .map((field) => optionByFieldId.get(field.id))
    .filter((option): option is FieldOption => Boolean(option));
}

function SelectionCheckbox({
  checked,
  indeterminate = false,
  label,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      ref={(node) => {
        if (node) node.indeterminate = indeterminate;
      }}
      onChange={onChange}
      className="h-4 w-4 shrink-0 cursor-pointer accent-[#08AACE]"
    />
  );
}

function EntrySelectorCard({
  entry,
  expanded,
  selectedIds,
  onToggleExpanded,
  onToggleEntry,
  onToggleField,
}: {
  entry: TemplateEntryNode;
  expanded: boolean;
  selectedIds: Set<string>;
  onToggleExpanded: () => void;
  onToggleEntry: (entry: TemplateEntryNode) => void;
  onToggleField: (fieldId: string) => void;
}) {
  const options = getEntryFieldOptions(entry);
  const selectedCount = options.filter((option) => selectedIds.has(option.field.id)).length;
  const allSelected = selectedCount === options.length && options.length > 0;
  const partiallySelected = selectedCount > 0 && !allSelected;

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.035)]">
      <div className="flex min-h-14 items-center gap-3 bg-[#F8FBFC] px-4">
        <SelectionCheckbox
          checked={allSelected}
          indeterminate={partiallySelected}
          label={`选择${entry.title}全部字段`}
          onChange={() => onToggleEntry(entry)}
        />
        <button
          type="button"
          aria-expanded={expanded}
          onClick={onToggleExpanded}
          className="flex min-w-0 flex-1 items-center justify-between gap-4 py-3 text-left"
        >
          <span className="min-w-0">
            <strong className="block truncate text-sm font-black text-slate-800">{entry.title}</strong>
            <span className="mt-1 block text-xs font-semibold text-slate-400">
              已选 {selectedCount}/{options.length}
            </span>
          </span>
          <span className="shrink-0 text-xs font-bold text-[#078FAB]">{expanded ? '收起字段' : '查看字段'}</span>
        </button>
        <button
          type="button"
          onClick={() => onToggleEntry(entry)}
          className="h-8 shrink-0 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-500 hover:border-[#9DDFEA] hover:text-[#078FAB]"
        >
          {allSelected ? '清空本组' : '选择全部'}
        </button>
      </div>

      {expanded ? (
        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-3">
          {options.map((option) => {
            const selected = selectedIds.has(option.field.id);
            return (
              <label
                key={option.field.id}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition-colors ${
                  selected
                    ? 'border-[#9DDFEA] bg-[#F1FBFD]'
                    : 'border-slate-200 bg-white hover:border-[#C8EAF1] hover:bg-[#FBFEFF]'
                }`}
              >
                <SelectionCheckbox
                  checked={selected}
                  label={option.field.title}
                  onChange={() => onToggleField(option.field.id)}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700" title={option.field.title}>
                  {option.field.title}
                </span>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black ${TAG_STYLES[option.tag]}`}>
                  {option.tag}
                </span>
              </label>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}

export function SettingTemplateAssemblerTestPage() {
  const initialDomain = templateStructure[0];
  const initialGroup = initialDomain?.groups[0];
  const [presetMode, setPresetMode] = useState<PresetMode | null>('standard');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => getPresetFieldIds('standard'));
  const [activeDomainId, setActiveDomainId] = useState(initialDomain?.id ?? '');
  const [activeGroupId, setActiveGroupId] = useState(initialGroup?.id ?? '');
  const [expandedEntryId, setExpandedEntryId] = useState(initialGroup?.entries[0]?.id ?? '');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState('');

  const activeDomain = templateStructure.find((domain) => domain.id === activeDomainId) ?? templateStructure[0] ?? null;
  const activeGroup = activeDomain?.groups.find((group) => group.id === activeGroupId) ?? activeDomain?.groups[0] ?? null;
  const selectedOptions = useMemo(
    () => allFieldOptions.filter((option) => selectedIds.has(option.field.id)),
    [selectedIds],
  );
  const normalizedSearch = search.trim().toLowerCase();
  const searchResults = useMemo(
    () => normalizedSearch
      ? allFieldOptions.filter((option) => option.path.toLowerCase().includes(normalizedSearch))
      : [],
    [normalizedSearch],
  );

  const applyPreset = (mode: PresetMode) => {
    setPresetMode(mode);
    setSelectedIds(getPresetFieldIds(mode));
    setFeedback(`已应用${PRESET_OPTIONS.find((item) => item.id === mode)?.title ?? '模板'}。`);
  };

  const toggleField = (fieldId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(fieldId)) next.delete(fieldId);
      else next.add(fieldId);
      return next;
    });
    setPresetMode(null);
    setFeedback('');
  };

  const toggleEntry = (entry: TemplateEntryNode) => {
    const ids = getEntryFieldOptions(entry).map((option) => option.field.id);
    setSelectedIds((current) => {
      const next = new Set(current);
      const shouldClear = ids.every((id) => next.has(id));
      ids.forEach((id) => {
        if (shouldClear) next.delete(id);
        else next.add(id);
      });
      return next;
    });
    setPresetMode(null);
    setFeedback('');
  };

  const selectDomain = (domain: TemplateDomainNode) => {
    const firstGroup = domain.groups[0];
    setActiveDomainId(domain.id);
    setActiveGroupId(firstGroup?.id ?? '');
    setExpandedEntryId(firstGroup?.entries[0]?.id ?? '');
    setSearch('');
  };

  const selectGroup = (group: TemplateGroupNode) => {
    setActiveGroupId(group.id);
    setExpandedEntryId(group.entries[0]?.id ?? '');
  };

  return (
    <div
      className="flex h-full min-h-[720px] flex-col overflow-hidden bg-[#F5F8FA] text-slate-800"
      data-selected-total={selectedIds.size}
      data-testid="setting-template-assembler-test"
    >
      <header className="flex min-h-[78px] shrink-0 items-center gap-5 border-b border-slate-200 bg-white px-6 py-3">
        <div className="w-[190px] shrink-0">
          <h1 className="text-base font-black">快速模板装配器</h1>
          <p className="mt-1 text-xs font-semibold text-slate-400">先选预设，再按需增减</p>
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-3 gap-2" aria-label="模板预设模式">
          {PRESET_OPTIONS.map((preset) => {
            const active = preset.id === presetMode;
            const count = getPresetFieldIds(preset.id).size;
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={active}
                onClick={() => applyPreset(preset.id)}
                className={`min-h-[52px] min-w-0 rounded-md border px-3 py-2 text-left transition-colors ${
                  active
                    ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAB] shadow-[0_0_0_1px_#08AACE]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#9DDFEA]'
                }`}
              >
                <span className="flex items-center justify-between gap-2 text-sm font-black">
                  <span>{preset.title}</span><span>{count}项</span>
                </span>
                <span className="mt-1 block truncate text-[11px] font-semibold opacity-70">{preset.description}</span>
              </button>
            );
          })}
        </div>
        <label className="w-[280px] shrink-0">
          <span className="sr-only">搜索全部设定</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索全部设定，例如：金手指限制"
            className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold outline-none placeholder:text-xs placeholder:text-slate-400 focus:border-[#08AACE] focus:ring-2 focus:ring-[#DDF7FB]"
          />
        </label>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[190px_minmax(520px,1fr)_310px] overflow-hidden">
        <aside className="editor-scrollbar min-h-0 overflow-y-auto border-r border-slate-200 bg-white p-3" aria-label="一级设定分类">
          <div className="mb-2 px-2 text-xs font-black text-slate-400">一级分类</div>
          <div className="space-y-1.5">
            {templateStructure.map((domain) => {
              const active = domain.id === activeDomain?.id;
              const options = allFieldOptions.filter((option) => option.domain.id === domain.id);
              const selectedCount = options.filter((option) => selectedIds.has(option.field.id)).length;
              return (
                <button
                  key={domain.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectDomain(domain)}
                  className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-md border px-3 text-left text-sm font-bold transition-colors ${
                    active
                      ? 'border-[#8FD8E7] bg-[#EAF9FD] text-[#078FAB]'
                      : 'border-transparent bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{domain.title}</span>
                  <span className="shrink-0 text-[11px] opacity-70">{selectedCount}/{options.length}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden" aria-label="可选设定">
          {normalizedSearch ? (
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-[#FBFCFD] px-5">
              <strong className="text-sm">搜索结果</strong>
              <span className="text-xs font-bold text-slate-400">找到 {searchResults.length} 项</span>
            </div>
          ) : (
            <nav aria-label="二级设定分类" className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-200 bg-[#FBFCFD] px-5">
              {activeDomain?.groups.map((group) => {
                const active = group.id === activeGroup?.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => selectGroup(group)}
                    className={`h-8 min-w-[104px] rounded-md border px-4 text-xs font-black transition-colors ${
                      active
                        ? 'border-[#08AACE] bg-[#08AACE] text-white'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-[#9DDFEA] hover:text-[#078FAB]'
                    }`}
                  >
                    {group.title}
                  </button>
                );
              })}
            </nav>
          )}

          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
            {normalizedSearch ? (
              <div className="space-y-2">
                {searchResults.length > 0 ? searchResults.map((option) => {
                  const selected = selectedIds.has(option.field.id);
                  return (
                    <label
                      key={option.field.id}
                      className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border px-4 py-2 ${
                        selected ? 'border-[#9DDFEA] bg-[#F1FBFD]' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <SelectionCheckbox
                        checked={selected}
                        label={`搜索结果：${option.field.title}`}
                        onChange={() => toggleField(option.field.id)}
                      />
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-sm text-slate-700">{option.field.title}</strong>
                        <span className="mt-1 block truncate text-xs font-semibold text-slate-400">{option.path}</span>
                      </span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-black ${TAG_STYLES[option.tag]}`}>{option.tag}</span>
                    </label>
                  );
                }) : (
                  <div className="grid h-48 place-items-center text-sm font-bold text-slate-400">没有找到相关设定</div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 px-1">
                  <div>
                    <div className="text-xs font-bold text-[#078FAB]">{activeDomain?.title}</div>
                    <h2 className="mt-1 text-lg font-black">{activeGroup?.title}</h2>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">点击“查看字段”只展开，勾选框才会改变模板</span>
                </div>
                {activeGroup?.entries.map((entry) => (
                  <EntrySelectorCard
                    key={entry.id}
                    entry={entry}
                    expanded={expandedEntryId === entry.id}
                    selectedIds={selectedIds}
                    onToggleExpanded={() => setExpandedEntryId((current) => current === entry.id ? '' : entry.id)}
                    onToggleEntry={toggleEntry}
                    onToggleField={toggleField}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="flex min-h-0 flex-col border-l border-slate-200 bg-white" aria-label="我的模板汇总">
          <div className="shrink-0 border-b border-slate-200 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-black">我的模板</h2>
              <span className="rounded bg-[#EAF9FD] px-2 py-1 text-xs font-black text-[#078FAB]">已选 {selectedIds.size} 项</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#08AACE] transition-[width]"
                style={{ width: `${allFieldOptions.length ? selectedIds.size / allFieldOptions.length * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {templateStructure.map((domain) => {
                const selected = selectedOptions.filter((option) => option.domain.id === domain.id);
                const total = allFieldOptions.filter((option) => option.domain.id === domain.id).length;
                return (
                  <button
                    key={domain.id}
                    type="button"
                    onClick={() => selectDomain(domain)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-left hover:border-[#9DDFEA] hover:bg-[#FBFEFF]"
                  >
                    <span className="flex items-center justify-between gap-3 text-sm font-black text-slate-700">
                      <span>{domain.title}</span><span className="text-xs text-[#078FAB]">{selected.length}/{total}</span>
                    </span>
                    <span className="mt-2 block truncate text-xs font-semibold text-slate-400">
                      {selected.length > 0
                        ? `${selected.slice(0, 3).map((option) => option.field.title).join('、')}${selected.length > 3 ? ` 等${selected.length}项` : ''}`
                        : '暂未选择'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      <footer className="flex h-16 shrink-0 items-center justify-between gap-4 border-t border-slate-200 bg-white px-6">
        <div className="min-w-0">
          <div className="text-sm font-black">当前已选择 {selectedIds.size}/{allFieldOptions.length} 项设定</div>
          <div className="mt-1 truncate text-xs font-semibold text-[#078FAB]" aria-live="polite">
            {feedback || '可以继续调整，也可以直接使用标准模板。'}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedIds(new Set());
              setPresetMode(null);
              setFeedback('已清空全部选择。');
            }}
            className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-500 hover:border-red-200 hover:text-red-500"
          >
            清空全部
          </button>
          <button
            type="button"
            onClick={() => applyPreset('standard')}
            className="h-10 rounded-md border border-[#9DDFEA] bg-white px-4 text-sm font-bold text-[#078FAB] hover:bg-[#F1FBFD]"
          >
            恢复推荐
          </button>
          <button
            type="button"
            onClick={() => setFeedback(`已把当前 ${selectedIds.size} 项设定保存为“我的玄幻模板”。`)}
            className="h-10 rounded-md border border-[#08AACE] bg-white px-4 text-sm font-bold text-[#078FAB] hover:bg-[#EAF9FD]"
          >
            保存为我的模板
          </button>
          <button
            type="button"
            disabled={selectedIds.size === 0}
            onClick={() => setFeedback(`已使用当前模板，共包含 ${selectedIds.size} 项设定。`)}
            className="h-10 rounded-md bg-[#08AACE] px-5 text-sm font-black text-white hover:bg-[#0798B8] disabled:bg-slate-200 disabled:text-slate-400"
          >
            使用当前模板
          </button>
        </div>
      </footer>
    </div>
  );
}

export default SettingTemplateAssemblerTestPage;
