import { Check, Star } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  PROJECT_PROGRESS_GROUPS,
  PROJECT_PROGRESS_STATUS_LABELS,
  PROJECT_RECOMMENDATION_LABELS,
  getDefaultProjectDecision,
  type ProjectDecision,
  type ProjectProgressItem,
  type ProjectProgressStatus,
} from './standardModeProjectProgressModel';

const STORAGE_KEY = 'xinyuexia_standard_mode_project_progress_decisions_v1';
const SELECTED_STORAGE_KEY = 'xinyuexia_standard_mode_project_progress_selected_v1';

const STATUS_CLASS: Record<ProjectProgressStatus, string> = {
  complete: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  partial: 'border-amber-200 bg-amber-50 text-amber-700',
  missing: 'border-slate-200 bg-slate-100 text-slate-600',
};

function readStoredDecisions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, ProjectDecision>;
  } catch {
    return {};
  }
}

function readStoredSelection() {
  try {
    return new Set(JSON.parse(localStorage.getItem(SELECTED_STORAGE_KEY) ?? '[]') as string[]);
  } catch {
    return new Set<string>();
  }
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      textarea.remove();
    }
  }
}

function RecommendationStars({ rating }: { rating: ProjectProgressItem['rating'] }) {
  return (
    <div className="flex items-center gap-2" aria-label={`推荐程度：${rating}星，${PROJECT_RECOMMENDATION_LABELS[rating]}`}>
      <div className="flex gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className="h-3.5 w-3.5" fill={star <= rating ? 'currentColor' : 'none'} />
        ))}
      </div>
      <span className="whitespace-nowrap text-xs font-bold text-slate-600">{PROJECT_RECOMMENDATION_LABELS[rating]}</span>
    </div>
  );
}

function DecisionButtons({ item, value, onChange }: {
  item: ProjectProgressItem;
  value: ProjectDecision;
  onChange: (value: ProjectDecision) => void;
}) {
  const options: Array<{ value: ProjectDecision; label: string }> = item.status === 'complete'
    ? [{ value: 'keep', label: '保留' }, { value: 'revise', label: '要调整' }]
    : [{ value: 'do', label: '要做' }, { value: 'later', label: '暂缓' }, { value: 'skip', label: '不做' }];
  return (
    <div className="inline-grid h-8 grid-flow-col overflow-hidden rounded-md border border-slate-200 bg-white">
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`min-w-[58px] border-slate-200 px-2 text-xs font-bold transition-colors ${
            index > 0 ? 'border-l' : ''
          } ${value === option.value ? 'bg-[#DFF6FB] text-[#078FAB]' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function StandardModeProjectProgressTestPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectProgressStatus>('all');
  const [decisions, setDecisions] = useState<Record<string, ProjectDecision>>(readStoredDecisions);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(readStoredSelection);
  const [copyState, setCopyState] = useState('');
  const allItems = useMemo(() => PROJECT_PROGRESS_GROUPS.flatMap((group) => group.items), []);
  const counts = useMemo(() => ({
    complete: allItems.filter((item) => item.status === 'complete').length,
    partial: allItems.filter((item) => item.status === 'partial').length,
    missing: allItems.filter((item) => item.status === 'missing').length,
  }), [allItems]);

  const updateDecision = (item: ProjectProgressItem, decision: ProjectDecision) => {
    const next = { ...decisions, [item.id]: decision };
    setDecisions(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (decision === 'do' || decision === 'revise') {
      const nextSelected = new Set(selectedIds).add(item.id);
      setSelectedIds(nextSelected);
      localStorage.setItem(SELECTED_STORAGE_KEY, JSON.stringify([...nextSelected]));
    }
  };

  const toggleSelected = (itemId: string) => {
    const next = new Set(selectedIds);
    if (next.has(itemId)) next.delete(itemId);
    else next.add(itemId);
    setSelectedIds(next);
    localStorage.setItem(SELECTED_STORAGE_KEY, JSON.stringify([...next]));
  };

  const copySelected = async () => {
    const selected = allItems.filter((item) => selectedIds.has(item.id));
    if (selected.length === 0) {
      setCopyState('请先勾选');
      return;
    }
    const content = [
      '标准模式项目取舍清单',
      ...selected.map((item, index) => {
        const decision = decisions[item.id] ?? getDefaultProjectDecision(item);
        const decisionLabel = decision === 'revise' ? '要调整' : decision === 'do' ? '要做' : decision === 'later' ? '暂缓' : decision === 'skip' ? '不做' : '保留';
        return `${index + 1}. ${item.title}｜当前：${PROJECT_PROGRESS_STATUS_LABELS[item.status]}｜决定：${decisionLabel}｜推荐：${item.rating}星 ${PROJECT_RECOMMENDATION_LABELS[item.rating]}`;
      }),
    ].join('\n');
    setCopyState(await copyText(content) ? '已复制' : '复制失败');
  };

  return (
    <main className="flex h-full min-h-0 flex-col bg-[#f5f5f7]" data-standard-project-progress-test="true">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">标准模式项目进度与功能取舍</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">根据当前V6实现整理。勾选准备处理的项目，再选择保留、调整、要做、暂缓或不做。</p>
          </div>
          <div className="flex items-center gap-3 text-sm font-bold">
            <span className="text-emerald-700">已完成 {counts.complete}</span>
            <span className="text-amber-700">部分完成 {counts.partial}</span>
            <span className="text-slate-600">未完成 {counts.missing}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex h-9 overflow-hidden rounded-md border border-slate-200 bg-white">
            {([
              ['all', `全部 ${allItems.length}`],
              ['complete', `已完成 ${counts.complete}`],
              ['partial', `部分完成 ${counts.partial}`],
              ['missing', `未完成 ${counts.missing}`],
            ] as const).map(([value, label], index) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`border-slate-200 px-4 text-xs font-bold ${index > 0 ? 'border-l' : ''} ${
                  statusFilter === value ? 'bg-[#DFF6FB] text-[#078FAB]' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-14 text-right text-xs font-bold text-[#078FAB]" role="status">{copyState}</span>
            <button type="button" onClick={() => {
              setSelectedIds(new Set());
              localStorage.removeItem(SELECTED_STORAGE_KEY);
              setCopyState('');
            }} className="h-9 rounded-md border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600">
              清空勾选
            </button>
            <button type="button" onClick={copySelected} className="h-9 rounded-md bg-[#08AACE] px-4 text-xs font-bold text-white">
              复制已勾选（{selectedIds.size}）
            </button>
          </div>
        </div>
      </header>

      <div className="editor-scrollbar min-h-0 flex-1 overflow-auto px-6 py-5">
        <div className="mx-auto min-w-[1180px] max-w-[1580px] space-y-5">
          {PROJECT_PROGRESS_GROUPS.map((group) => {
            const items = statusFilter === 'all' ? group.items : group.items.filter((item) => item.status === statusFilter);
            if (items.length === 0) return null;
            return (
              <section key={group.id} aria-labelledby={`progress-group-${group.id}`} className="overflow-hidden rounded-md border border-slate-200 bg-white">
                <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <h2 id={`progress-group-${group.id}`} className="text-sm font-bold text-slate-900">{group.title}</h2>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">{group.description}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{items.length} 项</span>
                </header>
                <div className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const decision = decisions[item.id] ?? getDefaultProjectDecision(item);
                    const checked = selectedIds.has(item.id);
                    return (
                      <article key={item.id} className="grid grid-cols-[36px_minmax(360px,1fr)_104px_178px_190px] items-center gap-4 px-4 py-3">
                        <button
                          type="button"
                          aria-label={`勾选功能：${item.title}`}
                          aria-pressed={checked}
                          onClick={() => toggleSelected(item.id)}
                          className={`grid h-5 w-5 place-items-center rounded border ${checked ? 'border-[#08AACE] bg-[#08AACE] text-white' : 'border-slate-300 bg-white'}`}
                        >
                          {checked ? <Check className="h-3.5 w-3.5" /> : null}
                        </button>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                          <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{item.current}</p>
                          <p className="mt-1 text-xs font-semibold leading-5 text-[#078FAB]">建议：{item.recommendation}</p>
                        </div>
                        <span className={`justify-self-start rounded-md border px-2.5 py-1 text-xs font-bold ${STATUS_CLASS[item.status]}`}>
                          {PROJECT_PROGRESS_STATUS_LABELS[item.status]}
                        </span>
                        <RecommendationStars rating={item.rating} />
                        <DecisionButtons item={item} value={decision} onChange={(value) => updateDecision(item, value)} />
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default StandardModeProjectProgressTestPage;
