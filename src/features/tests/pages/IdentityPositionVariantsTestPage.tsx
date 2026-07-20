import { Check, ChevronDown, Circle } from 'lucide-react';
import { useState } from 'react';

import { DEFAULT_WORKBENCH_ROLE_TYPES, isMaleProtagonistRoleType } from '@/features/workbench/model/workbenchRoleTypes';

type VariantId = 'outline' | 'segmented' | 'tag' | 'current';

const variants: Array<{ id: VariantId; title: string; note: string }> = [
  { id: 'outline', title: '方案一：嵌入式浮动边框', note: '用浮动边框显示人物分组，与人物姓名和设定字段保持一致。' },
  { id: 'segmented', title: '方案二：分组分段按钮', note: '直接显示配角等人物分组，点击切换明确，并排除男主角。' },
  { id: 'tag', title: '方案三：分组标签组', note: '更轻量，适合顶部空间紧张或需要快速扫读的页面。' },
  { id: 'current', title: '当前方案：胶囊下拉框', note: '保留现状作为对照，人物分组与存活状态容易显得割裂。' },
];

const ROLE_GROUP_OPTIONS = DEFAULT_WORKBENCH_ROLE_TYPES.filter((type) => !isMaleProtagonistRoleType(type));

function StatusPill({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'flex items-center gap-1.5' : 'flex items-center gap-1 rounded-full bg-slate-100 p-1'}>
      <span className={compact ? 'rounded-full bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700' : 'rounded-full bg-white px-3 py-2 text-xs font-black text-emerald-600 shadow-sm'}>
        存活
      </span>
      {!compact ? <span className="px-2 text-xs font-black text-slate-400">死亡</span> : null}
    </div>
  );
}

function VariantPreview({
  id,
  selectedGroup,
  onSelectGroup,
}: {
  id: VariantId;
  selectedGroup: string;
  onSelectGroup: (group: string) => void;
}) {
  if (id === 'outline') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="xy-workbench-name-field">
          <span className="xy-workbench-name-field-caption">人物姓名</span>
          <div className="xy-workbench-name-field-input flex items-center">苏婉</div>
        </div>
        <div className="relative h-[48px] w-[168px] rounded-[23px] border-2 border-slate-950 bg-white">
          <span className="absolute left-[22px] top-0 -translate-y-1/2 bg-white px-1.5 text-base font-medium leading-5 text-slate-950">人物分组</span>
          <div className="flex h-full items-center justify-between px-5 text-base font-medium text-slate-950">{selectedGroup} <ChevronDown className="h-4 w-4" /></div>
        </div>
        <StatusPill />
      </div>
    );
  }
  if (id === 'segmented') {
    return (
      <div
        data-testid="segmented-role-header-row"
        className="grid min-w-[900px] grid-cols-[232px_minmax(0,1fr)_112px] items-end gap-3"
      >
        <div className="xy-workbench-name-field">
          <span className="xy-workbench-name-field-caption">人物姓名</span>
          <div className="xy-workbench-name-field-input flex items-center">苏婉</div>
        </div>
        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">人物分组</div>
          <div className="flex flex-nowrap rounded-xl border border-slate-200 bg-slate-50 p-1">
            {ROLE_GROUP_OPTIONS.map((label) => (
              <button
                key={label}
                type="button"
                aria-pressed={label === selectedGroup}
                onClick={() => onSelectGroup(label)}
                className={label === selectedGroup ? 'min-w-0 flex-1 whitespace-nowrap rounded-lg bg-slate-950 px-2 py-2 text-xs font-black text-white' : 'min-w-0 flex-1 whitespace-nowrap rounded-lg px-2 py-2 text-xs font-medium text-slate-500 hover:bg-white'}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <StatusPill />
      </div>
    );
  }
  if (id === 'tag') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="xy-workbench-name-field">
          <span className="xy-workbench-name-field-caption">人物姓名</span>
          <div className="xy-workbench-name-field-input flex items-center">苏婉</div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
          <span className="text-xs font-medium text-slate-500">人物分组</span>
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-black text-cyan-700">{selectedGroup}</span>
        </div>
        <StatusPill compact />
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="xy-workbench-name-field">
        <span className="xy-workbench-name-field-caption">人物姓名</span>
        <div className="xy-workbench-name-field-input flex items-center">苏婉</div>
      </div>
      <div className="rounded-[22px] border-2 border-cyan-200 bg-white px-4 py-2 text-sm font-black text-slate-800">人物分组　{selectedGroup}⌄</div>
      <StatusPill />
    </div>
  );
}

export function IdentityPositionVariantsTestPage() {
  const [activeId, setActiveId] = useState<VariantId>('outline');
  const [selectedGroup, setSelectedGroup] = useState('正派配角');
  const active = variants.find((item) => item.id === activeId) ?? variants[0];

  return (
    <div className="min-h-full bg-[#f7faff] p-6 text-slate-900">
      <header className="mx-auto max-w-6xl">
        <div className="text-xs font-black uppercase tracking-[0.16em] text-cyan-600">ROLE HEADER / IDENTITY POSITION</div>
        <h1 className="mt-2 text-2xl font-black">身份定位样式方案</h1>
        <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">四款方案共用已统一的“人物姓名”标题与输入字号。点击左侧方案，比较人物分组和存活状态如何组合；分组选项不包含男主角。</p>
      </header>
      <main className="mx-auto mt-6 grid max-w-6xl gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-2">
          {variants.map((variant) => {
            const selected = variant.id === activeId;
            return (
              <button key={variant.id} type="button" onClick={() => setActiveId(variant.id)} className={`w-full rounded-xl border p-3 text-left transition-colors ${selected ? 'border-cyan-300 bg-cyan-50' : 'border-slate-200 bg-white hover:border-cyan-200'}`}>
                <div className="flex items-center gap-2 text-sm font-black">{selected ? <Check className="h-4 w-4 text-cyan-600" /> : <Circle className="h-4 w-4 text-slate-300" />}{variant.title}</div>
                <p className="mt-1 pl-6 text-xs leading-5 text-slate-500">{variant.note}</p>
              </button>
            );
          })}
        </aside>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div><h2 className="text-lg font-black">{active.title}</h2><p className="mt-1 text-sm text-slate-500">{active.note}</p></div>
            {activeId === 'outline' ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">推荐</span> : null}
          </div>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50 p-8">
            <VariantPreview id={activeId} selectedGroup={selectedGroup} onSelectGroup={setSelectedGroup} />
          </div>
          {activeId === 'segmented' ? (
            <p className="mt-3 text-xs font-bold text-slate-500">按正式人物编辑区约 900px 可用宽度模拟：姓名、人物分组和存活状态保持同一行。</p>
          ) : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {['标题字号统一为 16px', '姓名与人物分组同高', '状态控件不再抢主视觉'].map((item) => <div key={item} className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">{item}</div>)}
          </div>
        </section>
      </main>
    </div>
  );
}
