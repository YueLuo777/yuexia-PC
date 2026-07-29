import { useState } from 'react';

import { ProfessionalHierarchyCheckbox } from './ProfessionalHierarchyCheckbox';
import {
  getDomainFieldPaths,
  getEntryFieldPaths,
  getGroupFieldPaths,
  professionalTemplateStructure,
  selectionState,
  type HierarchyVariantProps,
} from './professionalTemplateHierarchyModel';

export function ProfessionalSettingTreeVariant({ selectedIds, onToggleField, onToggleIds }: HierarchyVariantProps) {
  const [activeDomainId, setActiveDomainId] = useState(professionalTemplateStructure[0]?.id ?? '');
  const activeDomain =
    professionalTemplateStructure.find((domain) => domain.id === activeDomainId) ?? professionalTemplateStructure[0];

  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="professional-hierarchy-tree">
      <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-slate-200 bg-white px-5 py-3">
        <span className="mr-2 shrink-0 text-xs font-black text-slate-400">一级设定</span>
        {professionalTemplateStructure.map((domain) => {
          const ids = getDomainFieldPaths(domain).map((item) => item.id);
          const state = selectionState(ids, selectedIds);
          return (
            <button
              key={domain.id}
              type="button"
              aria-pressed={domain.id === activeDomain?.id}
              onClick={() => setActiveDomainId(domain.id)}
              className={`min-w-[132px] shrink-0 rounded-md border px-3 py-2 text-left ${
                domain.id === activeDomain?.id
                  ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAB]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-[#9DDFEA]'
              }`}
            >
              <strong className="block truncate text-sm">{domain.title}</strong>
              <span className="mt-1 block text-[11px] font-bold opacity-70">
                保留 {state.selectedCount}/{ids.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto bg-[#F5F8FA] p-5">
        {activeDomain ? (
          <div className="mx-auto max-w-[1500px] space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-[#BDE7EF] bg-[#ECFAFC] px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                {(() => {
                  const ids = getDomainFieldPaths(activeDomain).map((item) => item.id);
                  const state = selectionState(ids, selectedIds);
                  return (
                    <ProfessionalHierarchyCheckbox
                      checked={state.allSelected}
                      indeterminate={state.partiallySelected}
                      label={`保留一级设定：${activeDomain.title}`}
                      onChange={() => onToggleIds(ids)}
                    />
                  );
                })()}
                <span className="rounded bg-[#08AACE] px-2 py-1 text-[11px] font-black text-white">一级</span>
                <strong className="truncate text-base font-black text-slate-800">{activeDomain.title}</strong>
              </div>
              <span className="shrink-0 text-xs font-bold text-[#078FAB]">以下完整显示二级、三级与四级设定</span>
            </div>

            {activeDomain.groups.map((group) => {
              const groupIds = getGroupFieldPaths(group).map((item) => item.id);
              const groupState = selectionState(groupIds, selectedIds);
              return (
                <section
                  key={group.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex min-h-14 items-center gap-3 border-b border-slate-200 bg-[#F8FBFC] px-4">
                    <ProfessionalHierarchyCheckbox
                      checked={groupState.allSelected}
                      indeterminate={groupState.partiallySelected}
                      label={`保留二级设定：${group.title}`}
                      onChange={() => onToggleIds(groupIds)}
                    />
                    <span className="rounded bg-slate-200 px-2 py-1 text-[11px] font-black text-slate-600">二级</span>
                    <strong className="text-sm font-black text-slate-800">{group.title}</strong>
                    <span className="ml-auto text-xs font-bold text-slate-400">
                      保留 {groupState.selectedCount}/{groupIds.length}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {group.entries.map((entry) => {
                      const fields = getEntryFieldPaths(entry);
                      const entryIds = fields.map((item) => item.id);
                      const entryState = selectionState(entryIds, selectedIds);
                      return (
                        <article key={entry.id} className="grid grid-cols-[210px_minmax(0,1fr)]">
                          <div className="flex items-start gap-3 border-r border-slate-100 bg-[#FCFDFE] px-4 py-4">
                            <ProfessionalHierarchyCheckbox
                              checked={entryState.allSelected}
                              indeterminate={entryState.partiallySelected}
                              label={`保留三级设定：${entry.title}`}
                              onChange={() => onToggleIds(entryIds)}
                            />
                            <div className="min-w-0">
                              <span className="rounded bg-[#EAF9FD] px-2 py-1 text-[10px] font-black text-[#078FAB]">
                                三级
                              </span>
                              <strong className="mt-2 block truncate text-sm font-black text-slate-700">
                                {entry.title}
                              </strong>
                              <span className="mt-1 block text-xs font-semibold text-slate-400">
                                保留 {entryState.selectedCount}/{entryIds.length}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-2 p-3">
                            {fields.map((item) => {
                              const checked = selectedIds.has(item.id);
                              return (
                                <label
                                  key={item.id}
                                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 ${
                                    checked ? 'border-[#9DDFEA] bg-[#F1FBFD]' : 'border-slate-200 bg-white opacity-55'
                                  }`}
                                >
                                  <ProfessionalHierarchyCheckbox
                                    checked={checked}
                                    label={`保留四级设定：${item.field.title}`}
                                    onChange={() => onToggleField(item.id)}
                                  />
                                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700">
                                    {item.field.title}
                                  </span>
                                  <span className="shrink-0 text-[10px] font-black text-slate-400">四级</span>
                                </label>
                              );
                            })}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
