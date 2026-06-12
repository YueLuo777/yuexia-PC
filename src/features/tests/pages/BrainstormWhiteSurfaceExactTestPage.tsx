import { ChevronDown, Copy, Database, Lightbulb, Save, Send, Sparkles, Trash2 } from 'lucide-react';

const brainstormItems = [
  { title: '废土修仙公司的天命打工人', words: 426, active: true },
  { title: '赛博山海经巡夜人', words: 318 },
  { title: '反派宗门绩效考核', words: 265 },
];

const outputItems = [
  {
    title: '1号脑洞',
    words: 624,
    body: '主角是废土城市里一家修仙外包公司的底层员工，负责替高阶修士处理危险委托。一次公司绩效考核中，他发现所谓天命并不是玄学，而是一套被资本垄断的气运分配系统。',
  },
  {
    title: '2号脑洞',
    words: 588,
    body: '城市上空漂浮着失控仙门，地面由公司接管灵气管网。主角意外获得一份旧时代天命合同，可以修改自己被压榨的命格，但每次修改都会让世界线出现债务。',
  },
];

function FloatingCard({
  title,
  meta,
  children,
  className = '',
}: {
  title: string;
  meta?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="absolute left-5 top-0 z-10 flex -translate-y-1/2 items-center gap-2 bg-white px-1">
        <span className="text-sm font-black text-[#08AACE]">{title}</span>
        {meta ? <span className="text-xs font-black text-slate-400">{meta}</span> : null}
      </div>
      {children}
    </section>
  );
}

function BrainstormLibraryColumn() {
  return (
    <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-white px-3 py-3">
      <div className="mb-3 flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-500">
        <span className="flex items-center gap-2">
          <Database className="h-4 w-4 text-[#08AACE]" />
          脑洞库
        </span>
        <span className="rounded-full bg-[#F5F5F7] px-2 py-0.5 text-xs text-slate-400">3</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="group mb-1 flex h-9 items-center gap-1 rounded-md bg-white px-2 text-left transition-colors hover:bg-[#F5F5F7]">
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#08AACE]" />
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-800">脑洞库</span>
          <span className="ml-1 shrink-0 text-xs font-bold text-slate-400">3</span>
        </div>

        <div className="space-y-1">
          {brainstormItems.map((item) => (
            <button
              key={item.title}
              type="button"
              className={`group flex h-10 w-full items-center gap-2 rounded-lg border px-3 text-left text-sm leading-5 transition-colors ${
                item.active
                  ? 'border-orange-300 bg-orange-50 text-orange-500'
                  : 'border-transparent bg-white text-orange-500 hover:border-orange-200 hover:bg-orange-50/60'
              }`}
            >
              <span className="min-w-0 flex-1 truncate font-black">{item.title}</span>
              <span className="shrink-0 rounded-full bg-[#F5F5F7] px-2 py-0.5 text-[11px] font-bold text-[#08AACE]">{item.words}</span>
            </button>
          ))}
        </div>
      </div>

      <button className="mt-3 flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-left shadow-sm transition-colors hover:border-red-200 hover:bg-red-100">
        <span className="flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-red-500">
            <Trash2 className="h-4 w-4" />
          </span>
          <span className="truncate text-sm font-black text-slate-800">脑洞回收站</span>
        </span>
        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-black text-red-400">0</span>
      </button>
    </aside>
  );
}

function BrainstormPreviewColumn() {
  return (
    <main className="flex min-h-0 flex-col bg-white p-5">
      <FloatingCard title="废土修仙公司的天命打工人" meta="426字" className="min-h-0 flex-1">
        <textarea
          readOnly
          value={'故事主题：废土修仙 + 公司职场 + 天命垄断\n\n主角是灵气管网维护员，平时替修仙公司处理污染灵脉、报废法器和危险客户投诉。他发现所谓天命并不是自然选择，而是公司高层用算法分配的资源。\n\n卖点：把修仙里的命格、气运、宗门资源，转译成现代公司里的绩效、合同、职级和外包制度。主角不是天生龙傲天，而是从制度漏洞里抢回命运。'}
          className="h-full w-full resize-none rounded-2xl border-0 bg-[#F5F5F7] px-5 py-6 text-sm leading-7 text-slate-700 outline-none"
        />
      </FloatingCard>
    </main>
  );
}

function BrainstormOutputColumn() {
  return (
    <section className="flex min-h-0 flex-col border-l border-r border-slate-200 bg-white p-4">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {outputItems.map((item, index) => (
          <FloatingCard key={item.title} title={item.title} meta={`${item.words}字`} className="min-h-[210px]">
            <textarea
              readOnly
              value={item.body}
              className="h-[210px] w-full resize-none rounded-2xl border-0 bg-[#F5F5F7] px-5 py-6 text-sm leading-7 text-slate-700 outline-none"
            />
            <button className={`absolute left-3 top-3 grid h-4 w-4 place-items-center rounded border text-[10px] font-black ${index === 0 ? 'border-[#08AACE] bg-[#08AACE] text-white' : 'border-slate-300 bg-white text-transparent'}`}>
              ✓
            </button>
          </FloatingCard>
        ))}
      </div>

      <div className="mt-4 shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-end gap-2">
          <textarea
            readOnly
            value=""
            placeholder="输入对话指令..."
            className="h-11 min-w-0 flex-1 resize-none rounded-xl border border-slate-200 bg-[#F5F5F7] px-3 py-2 text-sm font-bold outline-none"
          />
          <button className="grid h-11 w-11 place-items-center rounded-xl bg-[#08AACE] text-white">
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex h-9 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <button className="px-3 text-xs font-black text-slate-700 hover:bg-[#F5F5F7]">替换当前脑洞</button>
            <button className="border-l border-slate-200 px-3 text-xs font-black text-slate-700 hover:bg-[#F5F5F7]">保存为新脑洞</button>
          </div>
          <div className="flex h-9 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <button className="flex items-center gap-1 px-3 text-xs font-black text-slate-700 hover:bg-[#F5F5F7]"><Copy className="h-3.5 w-3.5" />复制脑洞</button>
            <button className="border-l border-slate-200 px-3 text-xs font-black text-red-500 hover:bg-red-50">清空脑洞</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrainstormConfigColumn() {
  return (
    <aside className="flex min-h-0 flex-col bg-white px-4 pb-4 pt-3">
      <div className="grid h-12 grid-cols-2 overflow-visible rounded-xl border-2 border-[#08AACE] bg-white shadow-[0_8px_18px_rgba(8,170,206,0.08)]">
        <div className="relative border-r border-[#08AACE]/25">
          <div className="grid h-full grid-cols-[minmax(0,1fr)_24px] items-center px-4 text-sm font-black text-slate-800">
            DeepSeek
            <ChevronDown className="h-4 w-4 text-[#08AACE]" />
          </div>
          <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs font-black text-[#08AACE]">模型</span>
        </div>
        <div className="relative">
          <div className="grid h-full grid-cols-[minmax(0,1fr)_24px] items-center px-4 text-sm font-black text-slate-800">
            脑洞
            <ChevronDown className="h-4 w-4 text-[#08AACE]" />
          </div>
          <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs font-black text-[#08AACE]">提示词</span>
        </div>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4">
        <div className="space-y-4">
          {[
            ['题材', '废土修仙、公司职场'],
            ['故事主题', '天命被大公司垄断，主角从底层员工夺回命运'],
            ['主角设定', '灵气管网维护员，谨慎、会算账，有底层生存经验'],
            ['其他要求', '不要写成传统宗门开局，要突出职场制度和修仙资源垄断'],
          ].map(([label, value], index) => (
            <label key={label} className="block">
              <span className="mb-1 block text-xs font-black text-[#08AACE]">{label}</span>
              <textarea
                readOnly
                value={value}
                className={`w-full resize-none rounded-xl border border-slate-200 bg-[#F5F5F7] px-3 py-2 text-sm font-bold leading-6 text-slate-700 outline-none ${index === 3 ? 'h-32' : 'h-14'}`}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex h-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <button className="w-12 bg-[#08AACE] text-sm font-black text-white">逐个</button>
          <button className="w-12 border-l border-slate-200 text-sm font-black text-slate-700">一次</button>
        </div>
        <span className="text-sm font-black text-slate-950">生成</span>
        <div className="flex h-8 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <button className="flex-1 bg-[#08AACE] text-sm font-black text-white">3</button>
          <button className="flex-1 border-l border-slate-200 text-sm font-black text-slate-700">5</button>
          <button className="flex-1 border-l border-slate-200 text-sm font-black text-slate-700">10</button>
        </div>
        <button className="h-10 w-16 rounded-xl bg-[#08AACE] text-sm font-black text-white shadow-sm">生成</button>
      </div>
    </aside>
  );
}

export function BrainstormWhiteSurfaceExactTestPage() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 p-5">
      <header className="mb-4 flex h-12 shrink-0 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-black text-slate-900">
          <Lightbulb className="h-4 w-4 text-[#08AACE]" />
          脑洞页面白侧栏灰工作区成品测试
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600"><Save className="h-3.5 w-3.5" />保存布局</button>
          <button className="flex h-8 items-center gap-1.5 rounded-lg border border-[#08AACE]/30 bg-[#EAF9FD] px-3 text-xs font-black text-[#08AACE]"><Sparkles className="h-3.5 w-3.5" />对比正式页</button>
        </div>
      </header>

      <main
        className="grid min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        style={{ gridTemplateColumns: '250px 16px minmax(260px, 0.9fr) 8px minmax(300px, 1fr) 8px 340px' }}
      >
        <BrainstormLibraryColumn />
        <div className="bg-white" />
        <BrainstormPreviewColumn />
        <div className="bg-white" />
        <BrainstormOutputColumn />
        <div className="bg-white" />
        <BrainstormConfigColumn />
      </main>
    </div>
  );
}
