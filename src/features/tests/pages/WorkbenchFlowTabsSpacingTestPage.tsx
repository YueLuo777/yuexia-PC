import { useState } from 'react';

type FlowDesign = 'current' | 'relaxed' | 'grouped';

const flowItems = [
  ['脑洞', '1个脑洞'],
  ['设定', '14个设定'],
  ['章纲', '1章'],
  ['正文', '1章'],
  ['剧情审核', '1章未审'],
  ['文笔润色', '1章未润色'],
  ['综合点评', '1章未点评'],
  ['更新状态', '1章未更新'],
  ['生成梗概', '0章'],
] as const;

const designs: Array<{ key: FlowDesign; title: string; description: string }> = [
  { key: 'current', title: '方案 A：当前布局', description: '按钮连续贴合，底部留白较少。' },
  { key: 'relaxed', title: '方案 B：宽松分组', description: '增加底部留白和按钮之间的呼吸感。' },
  { key: 'grouped', title: '方案 C：双组卡片', description: '按创作与审核流程分成两组，层次最清楚。' },
];

function FlowButton({ label, meta, active = false }: { label: string; meta: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`flex h-[62px] min-w-[112px] flex-1 flex-col items-center justify-center rounded-xl border px-3 transition-colors ${
        active ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE]' : 'border-slate-200 bg-white text-slate-900'
      }`}
    >
      <span className="text-base font-black leading-5">{label}</span>
      <span className={`mt-1 text-xs font-bold ${active ? 'text-[#078FAE]' : 'text-slate-500'}`}>{meta}</span>
    </button>
  );
}

function FlowPreview({ design }: { design: FlowDesign }) {
  if (design === 'grouped') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="mb-2 px-2 text-xs font-black tracking-wide text-slate-400">创作流程</div>
          <div className="grid grid-cols-4 gap-1">
            {flowItems.slice(0, 4).map(([label, meta], index) => (
              <FlowButton key={label} label={label} meta={meta} active={index === 2} />
            ))}
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="mb-2 px-2 text-xs font-black tracking-wide text-slate-400">审核与发布</div>
          <div className="grid grid-cols-5 gap-1">
            {flowItems.slice(4).map(([label, meta]) => <FlowButton key={label} label={label} meta={meta} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white ${design === 'relaxed' ? 'p-5' : 'p-2'}`}>
      <div className={`${design === 'relaxed' ? 'gap-2' : 'gap-0'} flex flex-wrap`}>
        {flowItems.map(([label, meta], index) => <FlowButton key={label} label={label} meta={meta} active={index === 2} />)}
      </div>
      <div className={`${design === 'relaxed' ? 'mt-5' : 'mt-2'} h-px bg-slate-100`} />
      <p className="mt-3 text-xs font-bold text-slate-400">下方内容从这条分界线开始，观察按钮栏与正文的距离。</p>
    </div>
  );
}

export function WorkbenchFlowTabsSpacingTestPage() {
  const [activeDesign, setActiveDesign] = useState<FlowDesign>('relaxed');
  const design = designs.find((item) => item.key === activeDesign) ?? designs[1];

  return (
    <div className="min-h-full bg-[#F3F6F9] p-6 text-slate-700">
      <div className="mx-auto max-w-[1280px]">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold tracking-[0.16em] text-[#08AACE]">WORKBENCH FLOW TABS</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950">顶部工作流按钮栏间距测试</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">对比按钮下边线与页面内容分界线的距离。当前推荐方案 B；确认后再迁移到正式工作台。</p>
        </header>
        <div className="mt-5 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400">选择布局方案</p>
            <div className="mt-3 space-y-2">
              {designs.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveDesign(item.key)}
                  className={`w-full rounded-xl border px-3 py-3 text-left ${activeDesign === item.key ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-200 bg-white'}`}
                >
                  <div className="text-sm font-black text-slate-900">{item.title}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-500">{item.description}</div>
                </button>
              ))}
            </div>
          </aside>
          <main className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div><h2 className="text-lg font-black text-slate-950">{design.title}</h2><p className="mt-1 text-sm text-slate-500">{design.description}</p></div>
              <span className="rounded-full bg-[#EAF9FD] px-3 py-1 text-xs font-black text-[#078FAE]">仅测试预览</span>
            </div>
            <FlowPreview design={activeDesign} />
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">观察重点：按钮组底部是否有足够留白、当前按钮是否仍突出、两组流程是否容易区分。</div>
          </main>
        </div>
      </div>
    </div>
  );
}
