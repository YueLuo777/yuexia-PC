import { CheckCircle2, Layers3, Merge, Scissors, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

import { SMART_TEMPLATE_PRESETS } from '@/features/workbench/model/standardModeSmartSettingFlowModel';
import { FANTASY_REDUCTION_PLANS } from './fantasyTemplateFieldReductionPlans';

export { FANTASY_REDUCTION_PLANS } from './fantasyTemplateFieldReductionPlans';

const currentFantasyTemplate = SMART_TEMPLATE_PRESETS.find((preset) => preset.id === 'male-fantasy-xianxia');

export const CURRENT_FANTASY_FIELD_COUNT = currentFantasyTemplate?.structure.reduce(
  (domainTotal, domain) => domainTotal + domain.groups.reduce(
    (groupTotal, group) => groupTotal + group.entries.reduce(
      (entryTotal, entry) => entryTotal + entry.sections.reduce(
        (sectionTotal, section) => sectionTotal + section.fields.length,
        0,
      ),
      0,
    ),
    0,
  ),
  0,
) ?? 0;

const maxCategoryCount = 27;

export function FantasyTemplateFieldReductionTestPage() {
  const [selectedId, setSelectedId] = useState('serial');
  const selected = FANTASY_REDUCTION_PLANS.find((plan) => plan.id === selectedId) ?? FANTASY_REDUCTION_PLANS[1];

  return (
    <div className="min-h-full overflow-y-auto bg-[#F5F7FA] p-5 text-slate-700">
      <div className="mx-auto flex max-w-[1460px] flex-col gap-4">
        <header className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="text-xs font-black text-[#078FAB]">只读方案对比 · 不生成模板</div>
              <h1 className="mt-2 text-2xl font-black text-slate-950">玄幻仙侠设定字段精简方案</h1>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                当前正式模板共 {CURRENT_FANTASY_FIELD_COUNT} 个字段。下面只比较删减逻辑，不修改正式模板，也不保存选择结果。
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-right">
              <div className="text-xs font-bold text-amber-700">当前基线</div>
              <div className="mt-1 text-xl font-black text-amber-900">7类 · 19设定 · {CURRENT_FANTASY_FIELD_COUNT}字段</div>
            </div>
          </div>
        </header>

        <nav aria-label="字段精简方案" className="grid gap-3 lg:grid-cols-5">
          {FANTASY_REDUCTION_PLANS.map((plan) => {
            const selectedPlan = plan.id === selected.id;
            return (
              <button
                key={plan.id}
                type="button"
                aria-pressed={selectedPlan}
                onClick={() => setSelectedId(plan.id)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  selectedPlan
                    ? 'border-[#078FAB] bg-[#EAF9FD] shadow-sm ring-2 ring-[#BFEFF7]'
                    : 'border-slate-200 bg-white hover:border-[#9DDFEA]'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <strong className="text-sm font-black text-slate-900">{plan.title}</strong>
                  {selectedPlan || plan.recommended ? (
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-black ${
                      selectedPlan ? 'bg-cyan-700 text-white' : 'bg-cyan-50 text-cyan-700'
                    }`}>
                      {selectedPlan ? (plan.recommended ? '当前·推荐' : '当前') : '推荐'}
                    </span>
                  ) : null}
                </span>
                <span className="mt-2 block text-xl font-black text-[#078FAB]">{plan.fieldCount}字段</span>
                <span className="mt-1 block text-xs font-bold text-slate-400">{plan.reduction}</span>
              </button>
            );
          })}
        </nav>

        <section aria-label={`${selected.title}详情`} className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-950">{selected.title}</h2>
                <span className="rounded bg-slate-100 px-2 py-1 text-xs font-black text-slate-500">{selected.badge}</span>
              </div>
              <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-slate-500">{selected.summary}</p>
            </div>
            <div className="rounded-md bg-[#F5FBFC] px-3 py-2 text-sm font-bold text-[#078FAB]">适合：{selected.audience}</div>
          </div>

          <div className="grid xl:grid-cols-[1.15fr_0.85fr]">
            <div className="border-b border-slate-200 p-5 xl:border-b-0 xl:border-r">
              <div className="flex items-center gap-2">
                <Layers3 className="h-5 w-5 text-cyan-700" aria-hidden="true" />
                <h3 className="text-sm font-black text-slate-900">各类字段预算</h3>
              </div>
              <div className="mt-4 space-y-3">
                {selected.categories.map((category) => (
                  <div key={category.title} className="grid grid-cols-[92px_1fr_44px] items-center gap-3">
                    <span className="text-sm font-bold text-slate-700">{category.title}</span>
                    <div className="min-w-0">
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-[#08AACE]" style={{ width: `${Math.max(8, category.count / maxCategoryCount * 100)}%` }} />
                      </div>
                      <div className="mt-1 truncate text-xs font-semibold text-slate-400" title={category.note}>{category.note}</div>
                    </div>
                    <strong className="text-right text-sm font-black text-[#078FAB]">{category.count}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 p-5">
              <div>
                <div className="flex items-center gap-2">
                  <Merge className="h-4 w-4 text-cyan-700" aria-hidden="true" />
                  <h3 className="text-sm font-black text-slate-900">建议合并</h3>
                </div>
                <div className="mt-3 space-y-2">
                  {selected.merges.map((item) => <p key={item} className="rounded-md bg-[#F3FBFD] px-3 py-2 text-sm font-bold">{item}</p>)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-rose-500" aria-hidden="true" />
                  <h3 className="text-sm font-black text-slate-900">删除或暂缓</h3>
                </div>
                <div className="mt-3 space-y-2">
                  {selected.deferred.map((item) => <p key={item} className="rounded-md bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{item}</p>)}
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                <p className="text-sm font-bold leading-6 text-amber-900">取舍：{selected.tradeoff}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 p-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900">具体保留字段</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  字段按所属类别完整列出；带“·”的名称表示该角色或阶段下的独立字段。
                </p>
              </div>
              <span className="rounded bg-cyan-50 px-2.5 py-1 text-xs font-black text-cyan-700">
                共 {selected.fieldCount} 字段
              </span>
            </div>
            <div className="mt-4 grid items-start gap-3 lg:grid-cols-2">
              {selected.categories.map((category) => (
                <article key={`fields-${category.title}`} className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-black text-slate-800">{category.title}</h4>
                    <span className="shrink-0 text-xs font-black text-[#078FAB]">{category.count} 项</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {category.fields.map((field) => (
                      <span key={field} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold leading-5 text-slate-600">
                        {field}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <footer className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-500 shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-cyan-700" aria-hidden="true" />
          本页只展示方案，不会修改玄幻仙侠模板、写入本地数据或影响新建书籍。
        </footer>
      </div>
    </div>
  );
}

export default FantasyTemplateFieldReductionTestPage;
