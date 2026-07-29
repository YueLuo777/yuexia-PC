import { useState } from 'react';

import { ProfessionalSettingCardsVariant } from './ProfessionalSettingCardsVariant';
import { ProfessionalSettingColumnsVariant } from './ProfessionalSettingColumnsVariant';
import { ProfessionalSettingMatrixVariant } from './ProfessionalSettingMatrixVariant';
import { ProfessionalSettingTreeVariant } from './ProfessionalSettingTreeVariant';
import { professionalFieldPaths } from './professionalTemplateHierarchyModel';

type VariantId = 'tree' | 'columns' | 'matrix' | 'cards';

const VARIANTS: Array<{
  id: VariantId;
  title: string;
  recommendation: string;
  description: string;
}> = [
  { id: 'tree', title: 'A · 全景树', recommendation: '推荐：整体审查', description: '四级结构纵向完整展开' },
  { id: 'columns', title: 'B · 四栏联动', recommendation: '推荐：快速定位', description: '一级到四级逐列深入' },
  { id: 'matrix', title: 'C · 路径矩阵', recommendation: '推荐：批量删减', description: '完整路径逐行对齐' },
  { id: 'cards', title: 'D · 结构卡片', recommendation: '推荐：视觉浏览', description: '分区卡片直接铺字段' },
];

export function ProfessionalTemplateHierarchyVariantsTestPage() {
  const [variantId, setVariantId] = useState<VariantId>('tree');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(professionalFieldPaths.map((item) => item.id)),
  );
  const [feedback, setFeedback] = useState('从完整结构开始，取消勾选就是从模板中移除。');

  const toggleField = (fieldId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(fieldId)) next.delete(fieldId);
      else next.add(fieldId);
      return next;
    });
    setFeedback('已更新模板结构，切换方案后会保留当前删减结果。');
  };

  const toggleIds = (fieldIds: string[]) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const shouldRemove = fieldIds.length > 0 && fieldIds.every((id) => next.has(id));
      fieldIds.forEach((id) => {
        if (shouldRemove) next.delete(id);
        else next.add(id);
      });
      return next;
    });
    setFeedback('已批量更新这一层级下的全部四级设定。');
  };

  const variantProps = { selectedIds, onToggleField: toggleField, onToggleIds: toggleIds };
  const removedCount = professionalFieldPaths.length - selectedIds.size;

  return (
    <div
      className="flex h-full min-h-[720px] flex-col overflow-hidden bg-[#F5F8FA] text-slate-800"
      data-testid="professional-template-hierarchy-variants-test"
      data-active-variant={variantId}
      data-selected-total={selectedIds.size}
      data-removed-total={removedCount}
    >
      <header className="flex min-h-[86px] shrink-0 items-center gap-5 border-b border-slate-200 bg-white px-5 py-3">
        <div className="w-[230px] shrink-0">
          <h1 className="text-base font-black">专业模板层级设计</h1>
          <p className="mt-1 text-xs font-semibold text-slate-400">不替用户做推荐，只负责把结构讲清楚</p>
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-4 gap-2" aria-label="专业模板层级方案">
          {VARIANTS.map((variant) => {
            const active = variant.id === variantId;
            return (
              <button
                key={variant.id}
                type="button"
                aria-pressed={active}
                onClick={() => setVariantId(variant.id)}
                className={`min-h-[58px] min-w-0 rounded-md border px-3 py-2 text-left ${
                  active
                    ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAB] shadow-[0_0_0_1px_#08AACE]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#9DDFEA]'
                }`}
              >
                <span className="flex items-center justify-between gap-2 text-sm font-black">
                  <span className="truncate">{variant.title}</span>
                  <span className="shrink-0 text-[10px] opacity-70">{variant.recommendation}</span>
                </span>
                <span className="mt-1 block truncate text-[11px] font-semibold opacity-65">{variant.description}</span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        {variantId === 'tree' ? <ProfessionalSettingTreeVariant {...variantProps} /> : null}
        {variantId === 'columns' ? <ProfessionalSettingColumnsVariant {...variantProps} /> : null}
        {variantId === 'matrix' ? <ProfessionalSettingMatrixVariant {...variantProps} /> : null}
        {variantId === 'cards' ? <ProfessionalSettingCardsVariant {...variantProps} /> : null}
      </div>

      <footer className="flex h-16 shrink-0 items-center justify-between gap-4 border-t border-slate-200 bg-white px-5">
        <div className="min-w-0">
          <div className="flex items-center gap-3 text-sm font-black">
            <span>
              保留 {selectedIds.size}/{professionalFieldPaths.length} 项
            </span>
            <span
              className={`rounded px-2 py-1 text-xs ${removedCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}
            >
              已移除 {removedCount} 项
            </span>
          </div>
          <div className="mt-1 truncate text-xs font-semibold text-[#078FAB]" aria-live="polite">
            {feedback}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedIds(new Set());
              setFeedback('已把全部设定标记为移除，可逐项重新加入。');
            }}
            className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-500 hover:border-amber-300 hover:text-amber-700"
          >
            全部移除
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedIds(new Set(professionalFieldPaths.map((item) => item.id)));
              setFeedback('已恢复完整四级结构。');
            }}
            className="h-10 rounded-md border border-[#9DDFEA] bg-white px-4 text-sm font-bold text-[#078FAB] hover:bg-[#F1FBFD]"
          >
            恢复完整结构
          </button>
          <button
            type="button"
            disabled={selectedIds.size === 0}
            onClick={() => setFeedback(`当前专业模板已确认：保留 ${selectedIds.size} 项，移除 ${removedCount} 项。`)}
            className="h-10 rounded-md bg-[#08AACE] px-5 text-sm font-black text-white hover:bg-[#0798B8] disabled:bg-slate-200 disabled:text-slate-400"
          >
            确认当前结构
          </button>
        </div>
      </footer>
    </div>
  );
}

export default ProfessionalTemplateHierarchyVariantsTestPage;
