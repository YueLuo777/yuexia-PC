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

export function ProfessionalSettingCardsVariant({ selectedIds, onToggleField, onToggleIds }: HierarchyVariantProps) {
  const [activeDomainId, setActiveDomainId] = useState(professionalTemplateStructure[0]?.id ?? '');
  const activeDomain =
    professionalTemplateStructure.find((domain) => domain.id === activeDomainId) ?? professionalTemplateStructure[0];

  return (
    <div
      className="grid h-full min-h-0 grid-cols-[210px_minmax(0,1fr)] overflow-hidden"
      data-testid="professional-hierarchy-cards"
    >
      <aside
        className="editor-scrollbar min-h-0 overflow-y-auto border-r border-slate-200 bg-white p-3"
        aria-label="结构卡片一级导航"
      >
        <div className="mb-3 px-2 text-xs font-black text-slate-400">一级设定</div>
        <div className="space-y-1.5">
          {professionalTemplateStructure.map((domain) => {
            const ids = getDomainFieldPaths(domain).map((item) => item.id);
            const state = selectionState(ids, selectedIds);
            return (
              <button
                key={domain.id}
                type="button"
                aria-pressed={domain.id === activeDomain?.id}
                onClick={() => setActiveDomainId(domain.id)}
                className={`w-full rounded-md border px-3 py-3 text-left ${
                  domain.id === activeDomain?.id
                    ? 'border-[#8FD8E7] bg-[#EAF9FD] text-[#078FAB]'
                    : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center justify-between gap-2 text-sm font-black">
                  <span className="truncate">{domain.title}</span>
                  <span className="text-[11px]">
                    {state.selectedCount}/{ids.length}
                  </span>
                </span>
                <span className="mt-1 block text-[11px] font-semibold opacity-65">
                  {domain.groups.length} 个二级分组
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <main className="editor-scrollbar min-h-0 overflow-y-auto bg-[#F5F8FA] p-5">
        {activeDomain ? (
          <div className="mx-auto max-w-[1500px] space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black text-[#078FAB]">一级设定</span>
                <h2 className="mt-1 text-xl font-black text-slate-800">{activeDomain.title}</h2>
              </div>
              <p className="text-xs font-semibold text-slate-400">二级分区并列展示，三级卡片中直接铺开四级字段</p>
            </div>

            {activeDomain.groups.map((group) => {
              const groupIds = getGroupFieldPaths(group).map((item) => item.id);
              const groupState = selectionState(groupIds, selectedIds);
              return (
                <section key={group.id}>
                  <div className="mb-2 flex items-center gap-3 border-b border-slate-300 pb-2">
                    <ProfessionalHierarchyCheckbox
                      checked={groupState.allSelected}
                      indeterminate={groupState.partiallySelected}
                      label={`保留二级分区：${group.title}`}
                      onChange={() => onToggleIds(groupIds)}
                    />
                    <span className="rounded bg-slate-700 px-2 py-1 text-[10px] font-black text-white">二级</span>
                    <strong className="text-base font-black text-slate-800">{group.title}</strong>
                    <span className="ml-auto text-xs font-bold text-slate-400">
                      保留 {groupState.selectedCount}/{groupIds.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-[repeat(auto-fit,minmax(520px,1fr))] gap-3">
                    {group.entries.map((entry) => {
                      const fields = getEntryFieldPaths(entry);
                      const entryIds = fields.map((item) => item.id);
                      const entryState = selectionState(entryIds, selectedIds);
                      return (
                        <article
                          key={entry.id}
                          className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                        >
                          <div className="flex min-h-12 items-center gap-3 border-b border-slate-100 bg-[#F8FBFC] px-3">
                            <ProfessionalHierarchyCheckbox
                              checked={entryState.allSelected}
                              indeterminate={entryState.partiallySelected}
                              label={`保留三级卡片：${entry.title}`}
                              onChange={() => onToggleIds(entryIds)}
                            />
                            <span className="rounded bg-[#EAF9FD] px-1.5 py-0.5 text-[10px] font-black text-[#078FAB]">
                              三级
                            </span>
                            <strong className="min-w-0 flex-1 truncate text-sm font-black text-slate-700">
                              {entry.title}
                            </strong>
                            <span className="text-[11px] font-bold text-slate-400">
                              {entryState.selectedCount}/{entryIds.length}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 p-3">
                            {fields.map((item) => {
                              const checked = selectedIds.has(item.id);
                              return (
                                <label
                                  key={item.id}
                                  className={`flex min-h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 ${
                                    checked
                                      ? 'border-[#9DDFEA] bg-[#F1FBFD]'
                                      : 'border-slate-200 bg-slate-50 opacity-50'
                                  }`}
                                >
                                  <ProfessionalHierarchyCheckbox
                                    checked={checked}
                                    label={`保留四级卡片字段：${item.field.title}`}
                                    onChange={() => onToggleField(item.id)}
                                  />
                                  <span className="text-xs font-bold text-slate-700">{item.field.title}</span>
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
      </main>
    </div>
  );
}
