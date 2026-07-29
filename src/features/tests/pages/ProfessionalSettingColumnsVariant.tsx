import { useMemo, useState } from 'react';

import { ProfessionalHierarchyCheckbox } from './ProfessionalHierarchyCheckbox';
import {
  getDomainFieldPaths,
  getEntryFieldPaths,
  getGroupFieldPaths,
  professionalTemplateStructure,
  selectionState,
  type HierarchyVariantProps,
} from './professionalTemplateHierarchyModel';

function ColumnTitle({ level, title }: { level: string; title: string }) {
  return (
    <div className="flex h-12 items-center gap-2 border-b border-slate-200 bg-[#F8FBFC] px-4">
      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-black text-slate-600">{level}</span>
      <strong className="text-sm font-black text-slate-700">{title}</strong>
    </div>
  );
}

export function ProfessionalSettingColumnsVariant({ selectedIds, onToggleField, onToggleIds }: HierarchyVariantProps) {
  const firstDomain = professionalTemplateStructure[0];
  const [domainId, setDomainId] = useState(firstDomain?.id ?? '');
  const domain = professionalTemplateStructure.find((item) => item.id === domainId) ?? firstDomain;
  const [groupId, setGroupId] = useState(domain?.groups[0]?.id ?? '');
  const group = domain?.groups.find((item) => item.id === groupId) ?? domain?.groups[0];
  const [entryId, setEntryId] = useState(group?.entries[0]?.id ?? '');
  const entry = group?.entries.find((item) => item.id === entryId) ?? group?.entries[0];
  const fields = useMemo(() => (entry ? getEntryFieldPaths(entry) : []), [entry]);

  const selectDomain = (nextDomainId: string) => {
    const nextDomain = professionalTemplateStructure.find((item) => item.id === nextDomainId);
    const nextGroup = nextDomain?.groups[0];
    setDomainId(nextDomainId);
    setGroupId(nextGroup?.id ?? '');
    setEntryId(nextGroup?.entries[0]?.id ?? '');
  };

  const selectGroup = (nextGroupId: string) => {
    const nextGroup = domain?.groups.find((item) => item.id === nextGroupId);
    setGroupId(nextGroupId);
    setEntryId(nextGroup?.entries[0]?.id ?? '');
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F5F8FA]" data-testid="professional-hierarchy-columns">
      <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5">
        <div className="min-w-0 truncate text-sm font-bold text-slate-500">
          当前路径：
          <span className="text-[#078FAB]">
            {domain?.title} ＞ {group?.title} ＞ {entry?.title}
          </span>
        </div>
        <span className="shrink-0 text-xs font-semibold text-slate-400">每一列固定代表一级，避免层级混淆</span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[220px_220px_250px_minmax(360px,1fr)] gap-px overflow-hidden bg-slate-200">
        <section className="flex min-h-0 flex-col bg-white" aria-label="一级设定列">
          <ColumnTitle level="一级" title="设定分类" />
          <div className="editor-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
            {professionalTemplateStructure.map((item) => {
              const ids = getDomainFieldPaths(item).map((field) => field.id);
              const state = selectionState(ids, selectedIds);
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 rounded-md px-2 ${item.id === domain?.id ? 'bg-[#EAF9FD]' : ''}`}
                >
                  <ProfessionalHierarchyCheckbox
                    checked={state.allSelected}
                    indeterminate={state.partiallySelected}
                    label={`保留一级：${item.title}`}
                    onChange={() => onToggleIds(ids)}
                  />
                  <button
                    type="button"
                    onClick={() => selectDomain(item.id)}
                    className="min-h-11 min-w-0 flex-1 text-left"
                  >
                    <strong className="block truncate text-sm text-slate-700">{item.title}</strong>
                    <span className="text-[11px] font-bold text-slate-400">
                      {state.selectedCount}/{ids.length}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex min-h-0 flex-col bg-white" aria-label="二级设定列">
          <ColumnTitle level="二级" title="设定分组" />
          <div className="editor-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
            {domain?.groups.map((item) => {
              const ids = getGroupFieldPaths(item).map((field) => field.id);
              const state = selectionState(ids, selectedIds);
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 rounded-md px-2 ${item.id === group?.id ? 'bg-[#EAF9FD]' : ''}`}
                >
                  <ProfessionalHierarchyCheckbox
                    checked={state.allSelected}
                    indeterminate={state.partiallySelected}
                    label={`保留二级：${item.title}`}
                    onChange={() => onToggleIds(ids)}
                  />
                  <button
                    type="button"
                    onClick={() => selectGroup(item.id)}
                    className="min-h-11 min-w-0 flex-1 text-left"
                  >
                    <strong className="block truncate text-sm text-slate-700">{item.title}</strong>
                    <span className="text-[11px] font-bold text-slate-400">
                      {state.selectedCount}/{ids.length}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex min-h-0 flex-col bg-white" aria-label="三级设定列">
          <ColumnTitle level="三级" title="设定条目" />
          <div className="editor-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
            {group?.entries.map((item) => {
              const ids = getEntryFieldPaths(item).map((field) => field.id);
              const state = selectionState(ids, selectedIds);
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 rounded-md px-2 ${item.id === entry?.id ? 'bg-[#EAF9FD]' : ''}`}
                >
                  <ProfessionalHierarchyCheckbox
                    checked={state.allSelected}
                    indeterminate={state.partiallySelected}
                    label={`保留三级：${item.title}`}
                    onChange={() => onToggleIds(ids)}
                  />
                  <button
                    type="button"
                    onClick={() => setEntryId(item.id)}
                    className="min-h-11 min-w-0 flex-1 text-left"
                  >
                    <strong className="block truncate text-sm text-slate-700">{item.title}</strong>
                    <span className="text-[11px] font-bold text-slate-400">
                      {state.selectedCount}/{ids.length}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex min-h-0 flex-col bg-white" aria-label="四级设定列">
          <ColumnTitle level="四级" title={entry?.title ?? '字段'} />
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-2 gap-2">
              {fields.map((item) => {
                const checked = selectedIds.has(item.id);
                return (
                  <label
                    key={item.id}
                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-3 ${
                      checked ? 'border-[#9DDFEA] bg-[#F1FBFD]' : 'border-slate-200 bg-white opacity-55'
                    }`}
                  >
                    <ProfessionalHierarchyCheckbox
                      checked={checked}
                      label={`保留四级：${item.field.title}`}
                      onChange={() => onToggleField(item.id)}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700">{item.field.title}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
