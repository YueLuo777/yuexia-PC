import { useMemo, useState } from 'react';

import { ProfessionalHierarchyCheckbox } from './ProfessionalHierarchyCheckbox';
import {
  professionalFieldPaths,
  professionalTemplateStructure,
  selectionState,
  type HierarchyVariantProps,
} from './professionalTemplateHierarchyModel';

export function ProfessionalSettingMatrixVariant({ selectedIds, onToggleField, onToggleIds }: HierarchyVariantProps) {
  const [domainId, setDomainId] = useState('all');
  const [search, setSearch] = useState('');
  const [onlyRemoved, setOnlyRemoved] = useState(false);
  const visibleRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return professionalFieldPaths.filter((item) => {
      if (domainId !== 'all' && item.domain.id !== domainId) return false;
      if (onlyRemoved && selectedIds.has(item.id)) return false;
      return !keyword || item.path.toLowerCase().includes(keyword);
    });
  }, [domainId, onlyRemoved, search, selectedIds]);
  const visibleIds = visibleRows.map((item) => item.id);
  const visibleState = selectionState(visibleIds, selectedIds);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F5F8FA]" data-testid="professional-hierarchy-matrix">
      <div className="flex min-h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5 py-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">搜索完整设定路径</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索一级、二级、三级或四级设定"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-[#08AACE] focus:ring-2 focus:ring-[#DDF7FB]"
          />
        </label>
        <select
          aria-label="筛选一级设定"
          value={domainId}
          onChange={(event) => setDomainId(event.target.value)}
          className="h-10 w-[180px] rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-600 outline-none focus:border-[#08AACE]"
        >
          <option value="all">全部一级设定</option>
          {professionalTemplateStructure.map((domain) => (
            <option key={domain.id} value={domain.id}>
              {domain.title}
            </option>
          ))}
        </select>
        <button
          type="button"
          aria-pressed={onlyRemoved}
          onClick={() => setOnlyRemoved((current) => !current)}
          className={`h-10 rounded-md border px-4 text-sm font-bold ${
            onlyRemoved ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAB]' : 'border-slate-300 bg-white text-slate-600'
          }`}
        >
          仅看已移除
        </button>
        <span className="shrink-0 text-xs font-bold text-slate-400">当前 {visibleRows.length} 行</span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-4">
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="grid min-h-12 shrink-0 grid-cols-[48px_1fr_1fr_1.1fr_1.5fr] items-center border-b border-slate-200 bg-[#F1F5F7] text-xs font-black text-slate-500">
            <span className="grid place-items-center">
              <ProfessionalHierarchyCheckbox
                checked={visibleState.allSelected}
                indeterminate={visibleState.partiallySelected}
                label="保留当前筛选结果"
                onChange={() => onToggleIds(visibleIds)}
              />
            </span>
            <span className="border-l border-slate-200 px-3">一级设定</span>
            <span className="border-l border-slate-200 px-3">二级设定</span>
            <span className="border-l border-slate-200 px-3">三级设定</span>
            <span className="border-l border-slate-200 px-3">四级设定</span>
          </div>
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto">
            {visibleRows.length > 0 ? (
              visibleRows.map((item) => {
                const checked = selectedIds.has(item.id);
                return (
                  <label
                    key={item.id}
                    className={`grid min-h-11 cursor-pointer grid-cols-[48px_1fr_1fr_1.1fr_1.5fr] items-stretch border-b border-slate-100 text-sm ${
                      checked ? 'bg-white' : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    <span className="grid place-items-center">
                      <ProfessionalHierarchyCheckbox
                        checked={checked}
                        label={`保留路径：${item.path}`}
                        onChange={() => onToggleField(item.id)}
                      />
                    </span>
                    <span className="flex min-w-0 items-center border-l border-slate-100 px-3 font-bold">
                      <span className="truncate">{item.domain.title}</span>
                    </span>
                    <span className="flex min-w-0 items-center border-l border-slate-100 px-3 font-bold">
                      <span className="truncate">{item.group.title}</span>
                    </span>
                    <span className="flex min-w-0 items-center border-l border-slate-100 px-3 font-bold">
                      <span className="truncate">{item.entry.title}</span>
                    </span>
                    <span className="flex min-w-0 items-center border-l border-slate-100 px-3 font-black text-slate-700">
                      <span className="truncate">{item.field.title}</span>
                    </span>
                  </label>
                );
              })
            ) : (
              <div className="grid h-48 place-items-center text-sm font-bold text-slate-400">
                没有符合当前条件的设定
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
