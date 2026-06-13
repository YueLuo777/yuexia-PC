import { useState } from 'react';

const activePreviewIds = ['brainstorm', 'setting', 'chapterOutline', 'writing'] as const;

type FlowId = (typeof activePreviewIds)[number];

type FlowItem = {
  id: FlowId;
  title: string;
  meta: string;
};

type GrayOption = {
  id: string;
  title: string;
  note: string;
  activeClass: string;
  inactiveClass: string;
  swatch: string;
};

const flowItems: FlowItem[] = [
  { id: 'brainstorm', title: '脑洞', meta: '12个脑洞' },
  { id: 'setting', title: '设定', meta: '28个设定' },
  { id: 'chapterOutline', title: '章纲', meta: '46章' },
  { id: 'writing', title: '正文', meta: '46章' },
];

const grayOptions: GrayOption[] = [
  {
    id: 'fog',
    title: '01 雾灰轻底',
    note: '最轻的一档灰，选中感克制，适合不想抢正文区域注意力。',
    swatch: '#F3F4F6',
    activeClass: 'border-[#D1D5DB] bg-[#F3F4F6] text-[#111827] shadow-[inset_0_0_0_1px_#E5E7EB]',
    inactiveClass: 'border-[#E5E7EB] bg-white text-[#1f2933] hover:bg-[#F9FAFB]',
  },
  {
    id: 'silver',
    title: '02 银灰卡片',
    note: '比雾灰更像卡片浮起，边界更清楚，仍然保持工具感。',
    swatch: '#ECEFF3',
    activeClass: 'border-[#CBD5E1] bg-[#ECEFF3] text-[#111827] shadow-[0_2px_8px_rgba(15,23,42,0.10)]',
    inactiveClass: 'border-[#E2E8F0] bg-white text-[#1f2933] hover:bg-[#F8FAFC]',
  },
  {
    id: 'blueGray',
    title: '03 蓝灰边框',
    note: '灰里带一点蓝，和当前浅蓝体系更容易衔接。',
    swatch: '#EEF2F6',
    activeClass: 'border-[#B8C4D2] bg-[#EEF2F6] text-[#0f172a] shadow-[inset_0_0_0_1px_#D7DEE8]',
    inactiveClass: 'border-[#D8E1EC] bg-white text-[#1f2933] hover:bg-[#F8FAFC]',
  },
  {
    id: 'graphiteLine',
    title: '04 石墨细线',
    note: '背景几乎不变，主要靠深一点的灰线和文字权重表达选中。',
    swatch: '#E5E7EB',
    activeClass: 'border-[#6B7280] bg-white text-[#030712] shadow-[inset_0_0_0_1px_#6B7280]',
    inactiveClass: 'border-[#E5E7EB] bg-white text-[#1f2933] hover:bg-[#F9FAFB]',
  },
  {
    id: 'warmGray',
    title: '05 暖灰柔底',
    note: '偏暖的灰，视觉更软，和浅米色/纸感区域比较搭。',
    swatch: '#F2F0ED',
    activeClass: 'border-[#D8D2CA] bg-[#F2F0ED] text-[#111827] shadow-[inset_0_0_0_1px_#E4DED6]',
    inactiveClass: 'border-[#E5E1DC] bg-white text-[#1f2933] hover:bg-[#FAF9F7]',
  },
  {
    id: 'deepGray',
    title: '06 深灰强调',
    note: '识别最强，适合你想先确认灰色方向是否成立。',
    swatch: '#374151',
    activeClass: 'border-[#374151] bg-[#374151] text-white shadow-[0_2px_8px_rgba(17,24,39,0.18)]',
    inactiveClass: 'border-[#D1D5DB] bg-white text-[#1f2933] hover:bg-[#F9FAFB]',
  },
];

function FlowButtonPreview({
  item,
  active,
  option,
}: {
  item: FlowItem;
  active: boolean;
  option: GrayOption;
}) {
  return (
    <button
      type="button"
      className={[
        'relative -ml-px inline-flex h-10 min-w-[78px] shrink-0 flex-col items-center justify-center gap-0.5 border px-2 text-center transition-colors first:ml-0 first:rounded-l-[8px] last:rounded-r-[8px]',
        active ? option.activeClass : option.inactiveClass,
      ].join(' ')}
    >
      <span className="text-[14px] font-black leading-none">{item.title}</span>
      <span className={`text-[10px] font-black leading-none ${active && option.id === 'deepGray' ? 'text-white/80' : active ? 'text-[#64748B]' : 'text-[#9AA4B2]'}`}>
        {item.meta}
      </span>
    </button>
  );
}

function GrayOptionCard({ option }: { option: GrayOption }) {
  const [activeId, setActiveId] = useState<FlowId>('writing');

  return (
    <section className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-black text-slate-950">{option.title}</h2>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{option.note}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500">
          <span className="h-3 w-3 rounded-full border border-slate-200" style={{ backgroundColor: option.swatch }} />
          {option.swatch}
        </div>
      </div>

      <div className="space-y-3 rounded-[8px] bg-[#F6F7F9] p-3">
        <div className="flex flex-wrap gap-2">
          {activePreviewIds.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveId(id)}
              className={`h-7 rounded-[8px] border px-2.5 text-xs font-black transition-colors ${
                activeId === id
                  ? 'border-slate-500 bg-white text-slate-950'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              选中{flowItems.find((item) => item.id === id)?.title}
            </button>
          ))}
        </div>

        <div className="flex min-w-0 overflow-x-auto">
          {flowItems.map((item) => (
            <FlowButtonPreview key={item.id} item={item} option={option} active={item.id === activeId} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function WorkbenchFlowGraySelectedStateTestPage() {
  return (
    <div className="editor-scrollbar h-full overflow-y-auto bg-[#F5F5F7] p-6">
      <div className="mx-auto max-w-[1180px] space-y-5">
        <header className="rounded-[8px] border border-[#E2E8F0] bg-white px-5 py-4 shadow-sm">
          <h1 className="text-xl font-black text-slate-950">脑洞 / 设定 / 章纲 / 正文导航选中灰色方案</h1>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
            只比较选中态灰色，不改正式页面。每张卡都可以切换“脑洞、设定、章纲、正文”哪个按钮被选中，看灰色落在不同文字长度上是否舒服。
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          {grayOptions.map((option) => (
            <GrayOptionCard key={option.id} option={option} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default WorkbenchFlowGraySelectedStateTestPage;
