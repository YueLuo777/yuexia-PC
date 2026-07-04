import type { ReactNode } from 'react';

const creationFlows = [
  { title: '脑洞', meta: '5个脑洞' },
  { title: '设定', meta: '81个设定' },
  { title: '章纲', meta: '2章' },
  { title: '正文', meta: '2章', active: true },
];

const reviewFlows = [
  { title: '审核', meta: '2章未审', warning: true },
  { title: '综合点评', meta: '2章未点评', warning: true },
  { title: '润色', meta: '' },
  { title: '更新状态', meta: '2章未更新', warning: true },
  { title: '生成梗概', meta: '0章', warning: true },
];

const titles = [
  '默认小说1',
  '大主宰',
  '二十字书名固定基准位置测试样例作品标题一',
];

const TITLE_BASELINE_WIDTH = 360;

function FlowButton({ title, meta, active = false, warning = false }: { title: string; meta: string; active?: boolean; warning?: boolean }) {
  return (
    <button
      type="button"
      className={[
        'grid h-10 min-w-[78px] place-items-center border-l border-[#D8E1EC] px-4 text-center leading-none first:border-l-0',
        active ? 'border-[#8FE4F2] bg-[#DDF7FC] text-[#08AACE]' : 'bg-white text-slate-900',
      ].join(' ')}
    >
      <span className="text-sm font-black">{title}</span>
      {meta ? <span className={`mt-0.5 text-[9px] font-black ${warning ? 'text-[#d26400]' : 'text-slate-500'}`}>{meta}</span> : null}
    </button>
  );
}

function FlowGroup({ items }: { items: typeof creationFlows }) {
  return (
    <div className="inline-flex h-10 shrink-0 overflow-hidden rounded-xl border border-[#D8E1EC] bg-white">
      {items.map((item) => (
        <FlowButton key={item.title} {...item} />
      ))}
    </div>
  );
}

function WorkInfoGroup({ title }: { title: string }) {
  return (
    <div className="inline-flex h-10 shrink-0 overflow-hidden rounded-xl border border-[#D8E1EC] bg-white">
      <div
        title={title}
        className="grid h-10 max-w-[260px] items-center border-r border-[#D8E1EC] px-3 text-sm font-black text-slate-900"
      >
        <span className="truncate">{title}</span>
      </div>
      <button className="h-10 bg-[#EAF9FD] px-4 text-sm font-black text-[#08AACE]">作品信息</button>
    </div>
  );
}

function HeaderPreview({ title, fixed = false }: { title: string; fixed?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className={fixed ? 'grid h-12 grid-cols-[360px_auto_auto] items-center gap-4 overflow-x-auto bg-[#f8fafc] px-4' : 'flex h-12 items-center gap-4 overflow-x-auto bg-[#f8fafc] px-4'}>
        <div className={fixed ? 'relative flex items-center' : 'flex items-center'}>
          {fixed ? (
            <span
              className="pointer-events-none absolute inset-y-1 left-0 rounded-lg border border-dashed border-[#9BEFFC] bg-[#EAF9FD]/30 px-2 text-[10px] font-black leading-10 text-[#08AACE]/60"
              style={{ width: TITLE_BASELINE_WIDTH }}
              aria-hidden="true"
            >
              20字书名基准
            </span>
          ) : null}
          <WorkInfoGroup title={title} />
        </div>
        <FlowGroup items={creationFlows} />
        <FlowGroup items={reviewFlows} />
      </div>
      <div className="border-t border-slate-100 px-4 py-2 text-xs font-bold text-slate-400">
        书名：{title}
      </div>
    </div>
  );
}

function OptionCard({
  title,
  description,
  children,
  recommended = false,
}: {
  title: string;
  description: string;
  children: ReactNode;
  recommended?: boolean;
}) {
  return (
    <section className={`rounded-2xl border bg-white shadow-sm ${recommended ? 'border-[#9BEFFC]' : 'border-slate-200'}`}>
      <div className={`border-b px-5 py-4 ${recommended ? 'border-[#C9F7FF] bg-[#EAF9FD]' : 'border-slate-100'}`}>
        <h2 className={`text-base font-black ${recommended ? 'text-[#066D85]' : 'text-slate-900'}`}>{title}</h2>
        <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{description}</p>
      </div>
      <div className="space-y-3 p-5">{children}</div>
    </section>
  );
}

export function WorkbenchHeaderFixedFlowPositionTestPage() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
        <div>
          <h1 className="text-lg font-black text-slate-900">工作台流程按钮固定位置测试</h1>
          <p className="mt-0.5 text-xs font-bold text-slate-400">用 20 字书名作为基准，比较“脑洞/设定/章纲/正文”和“审核/综合点评/润色/更新状态/生成梗概”两组按钮是否还会随书名长短移动。</p>
        </div>
        <span className="rounded-full border border-[#9BEFFC] bg-[#EAF9FD] px-3 py-1 text-xs font-black text-[#08AACE]">测试页</span>
      </header>

      <main className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid min-w-[1180px] gap-5">
          <OptionCard
            title="当前跟随书名宽度"
            description="书名短时按钮靠左，书名长时按钮整体向右移动；这就是你截图里出现体感差异的原因。"
          >
            {titles.map((title) => (
              <HeaderPreview key={title} title={title} />
            ))}
          </OptionCard>

          <OptionCard
            title="固定预留书名区"
            description="左侧书名/作品信息组合仍跟随书名改变宽度；外层按 20 个字书名预留基准位，后面两个组合按钮从同一个位置开始。"
            recommended
          >
            {titles.map((title) => (
              <HeaderPreview key={title} title={title} fixed />
            ))}
            <div className="rounded-xl border border-[#9BEFFC] bg-[#F0FCFF] px-4 py-3 text-sm font-black leading-6 text-[#066D85]">
              建议正式页采用这个方向：左侧书名组合按真实书名伸缩，但右侧流程按钮以 20 字书名的最宽基准固定起点。这样“默认小说1”“大主宰”和最长 20 字书名下，按钮位置都一致。
            </div>
          </OptionCard>
        </div>
      </main>
    </div>
  );
}
