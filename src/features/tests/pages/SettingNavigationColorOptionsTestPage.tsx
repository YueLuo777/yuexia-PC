import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

type SettingItem = {
  title: string;
  words: number;
};

type Category = {
  title: string;
  items: SettingItem[];
};

type ColorVariant = {
  id: string;
  name: string;
  source: string;
  note: string;
  shell: string;
  tabs: string;
  tabActive: string;
  tabInactive: string;
  group: string;
  groupIcon: string;
  groupTitle: string;
  groupCount: string;
  empty: string;
  itemActive: string;
  itemInactive: string;
  itemTitleActive: string;
  itemTitleInactive: string;
  itemWords: string;
};

const categories: Category[] = [
  {
    title: '核心设定',
    items: [
      { title: '世界观规则', words: 1260 },
      { title: '修炼体系', words: 860 },
    ],
  },
  {
    title: '主线剧情',
    items: [
      { title: '主线矛盾', words: 540 },
      { title: '最终目标', words: 320 },
    ],
  },
  {
    title: '等级体系',
    items: [
      { title: '境界划分', words: 430 },
    ],
  },
  { title: '势力设定', items: [] },
  { title: '伏笔设定', items: [] },
  { title: '其他设定', items: [] },
  { title: '未分类', items: [] },
];

const variants: ColorVariant[] = [
  {
    id: 'soft-cyan',
    name: '方案一：浅蓝保留版',
    source: '接近当前视觉，但降低大面积蓝的饱和度',
    note: '改动最小。分组仍是浅蓝底，条目保留正式页的橙色选中态，用来判断当前风格微调后是否够舒服。',
    shell: 'bg-[#F8FBFC]',
    tabs: 'bg-slate-200/70',
    tabActive: 'bg-white text-[#08AACE] shadow-sm',
    tabInactive: 'text-slate-800 hover:bg-white/60',
    group: 'bg-[#E1F3F7] hover:bg-[#D5EEF5]',
    groupIcon: 'text-[#08AACE]',
    groupTitle: 'text-[#078FAE]',
    groupCount: 'text-slate-400',
    empty: 'text-slate-400',
    itemActive: 'border-orange-400 bg-orange-50',
    itemInactive: 'border-transparent hover:bg-white/80',
    itemTitleActive: 'text-orange-600',
    itemTitleInactive: 'text-slate-700',
    itemWords: 'text-slate-400',
  },
  {
    id: 'linear-neutral',
    name: '方案二：中性灰蓝版',
    source: '参考 Linear / Notion 的低饱和侧栏',
    note: '整体更耐看。蓝色从分组大底色里退出来，只在小图标和 hover 里出现，橙色条目会更突出。',
    shell: 'bg-[#F7F8FA]',
    tabs: 'bg-[#E9EDF2]',
    tabActive: 'bg-white text-slate-950 shadow-sm',
    tabInactive: 'text-slate-500 hover:bg-white/70 hover:text-slate-900',
    group: 'border border-slate-200 bg-white hover:bg-[#F1F5F9]',
    groupIcon: 'text-slate-500',
    groupTitle: 'text-slate-800',
    groupCount: 'text-slate-400',
    empty: 'text-slate-400',
    itemActive: 'border-orange-400 bg-orange-50',
    itemInactive: 'border-transparent hover:bg-white',
    itemTitleActive: 'text-orange-600',
    itemTitleInactive: 'text-slate-700',
    itemWords: 'text-slate-400',
  },
  {
    id: 'feishu-line',
    name: '方案三：飞书线条版',
    source: '参考飞书/企业工具的白底分组和左侧强调线',
    note: '这版不再使用大面积浅蓝底，和当前方案差异更明显。分组靠左侧蓝线和淡边框区分，条目仍用橙色选中态。',
    shell: 'bg-white',
    tabs: 'bg-[#F5F8FA] ring-1 ring-[#D7EEF5]',
    tabActive: 'bg-white text-[#078FAE] shadow-sm ring-1 ring-[#BDEEF7]',
    tabInactive: 'text-slate-600 hover:bg-white hover:text-[#078FAE]',
    group: 'border border-[#E2EEF3] border-l-4 border-l-[#08AACE] bg-white hover:bg-[#F7FCFE]',
    groupIcon: 'text-[#08AACE]',
    groupTitle: 'text-slate-900',
    groupCount: 'text-[#94A3B8]',
    empty: 'text-slate-400',
    itemActive: 'border-orange-400 bg-orange-50 shadow-[inset_3px_0_0_#FB923C]',
    itemInactive: 'border-transparent hover:bg-[#F8FAFC]',
    itemTitleActive: 'text-orange-600',
    itemTitleInactive: 'text-slate-700',
    itemWords: 'text-slate-400',
  },
  {
    id: 'apple-sidebar',
    name: '方案四：Apple 侧栏版',
    source: '参考 macOS / iPadOS 侧边栏',
    note: '更像本地工具软件。分组像轻卡片，条目选中更柔和，适合长时间开着侧栏。',
    shell: 'bg-[#F4F6F8]',
    tabs: 'bg-white/80 ring-1 ring-slate-200',
    tabActive: 'bg-[#DCEEFF] text-[#0B67B2] shadow-sm',
    tabInactive: 'text-slate-600 hover:bg-[#EEF4FA]',
    group: 'bg-white/90 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-[#EEF4FA]',
    groupIcon: 'text-[#0B67B2]',
    groupTitle: 'text-slate-800',
    groupCount: 'text-slate-400',
    empty: 'text-slate-400',
    itemActive: 'border-orange-300 bg-[#FFF7ED]',
    itemInactive: 'border-transparent hover:bg-white/80',
    itemTitleActive: 'text-orange-600',
    itemTitleInactive: 'text-slate-700',
    itemWords: 'text-slate-400',
  },
  {
    id: 'ink-focus',
    name: '方案五：墨色聚焦版',
    source: '参考 Obsidian / 专业编辑器的低亮侧栏',
    note: '层级最强，适合以后做深色模式。和当前浅色主界面差异较大，正式迁入要谨慎。',
    shell: 'bg-[#101820]',
    tabs: 'bg-white/8',
    tabActive: 'bg-[#E1F3F7] text-[#075E75]',
    tabInactive: 'text-slate-300 hover:bg-white/10',
    group: 'border border-white/8 bg-white/8 hover:bg-white/12',
    groupIcon: 'text-[#67E8F9]',
    groupTitle: 'text-slate-100',
    groupCount: 'text-slate-400',
    empty: 'text-slate-500',
    itemActive: 'border-orange-400 bg-orange-500/15',
    itemInactive: 'border-transparent hover:bg-white/8',
    itemTitleActive: 'text-orange-300',
    itemTitleInactive: 'text-slate-300',
    itemWords: 'text-slate-500',
  },
];

function SettingNavPreview({ variant }: { variant: ColorVariant }) {
  return (
    <div className={`flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 ${variant.shell}`}>
      <div className="p-4">
        <div className={`flex h-12 items-center overflow-hidden rounded-[24px] p-1 ${variant.tabs}`}>
          {[
            ['作品设定', 5],
            ['人物设定', 1],
          ].map(([label, count], index) => (
            <button
              key={label}
              type="button"
              className={`flex h-full min-w-0 flex-1 items-center justify-center gap-2 rounded-[20px] px-3 text-base font-black transition-colors ${
                index === 0 ? variant.tabActive : variant.tabInactive
              }`}
            >
              <span className="truncate">{label}</span>
              <span>{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-3">
          {categories.map((category, categoryIndex) => (
            <section key={category.title}>
              <button
                type="button"
                className={`flex h-11 w-full items-center gap-2 rounded-xl px-3 text-left transition-colors ${variant.group}`}
              >
                <ChevronDown className={`h-4 w-4 shrink-0 ${variant.groupIcon}`} />
                <span className={`min-w-0 flex-1 truncate text-base font-bold ${variant.groupTitle}`}>{category.title}</span>
                <span className={`shrink-0 text-sm font-bold ${variant.groupCount}`}>{category.items.length}</span>
              </button>

              {category.items.length > 0 ? (
                <div className="mt-1 space-y-1 pl-2">
                  {category.items.map((item, itemIndex) => {
                    const selected = categoryIndex === 0 && itemIndex === 0;
                    return (
                      <button
                        key={item.title}
                        type="button"
                        className={`flex h-9 w-full items-center gap-2 rounded-lg border-l-[3px] px-3 text-left transition-colors ${
                          selected ? variant.itemActive : variant.itemInactive
                        }`}
                      >
                        <span className={`min-w-0 flex-1 truncate text-sm font-bold ${selected ? variant.itemTitleActive : variant.itemTitleInactive}`}>
                          {item.title}
                        </span>
                        <span className={`shrink-0 text-xs font-bold ${variant.itemWords}`}>{item.words}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className={`px-4 py-4 text-sm font-medium ${variant.empty}`}>暂无设定</div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingNavigationColorOptionsTestPage() {
  const [activeVariantId, setActiveVariantId] = useState(variants[1].id);
  const activeVariant = useMemo(
    () => variants.find((variant) => variant.id === activeVariantId) ?? variants[1],
    [activeVariantId],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 p-6">
      <header className="mb-5 flex shrink-0 items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="text-xs font-black text-[#08AACE]">设定导航配色测试</div>
          <h1 className="mt-1 text-xl font-black text-slate-950">作品设定 / 人物设定侧栏配色方案</h1>
          <p className="mt-1 text-sm font-bold text-slate-400">
            现在每个方案都包含分组、分组下设定条目、橙色选中态和空分组状态。
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-5 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {variants.map((variant, index) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => setActiveVariantId(variant.id)}
              className={`h-9 rounded-xl px-3 text-xs font-black transition-colors ${
                activeVariantId === variant.id
                  ? 'bg-[#08AACE] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-[#EAF9FD] hover:text-[#08AACE]'
              }`}
            >
              方案{index + 1}
            </button>
          ))}
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[380px_minmax(0,1fr)] gap-5">
        <SettingNavPreview variant={activeVariant} />

        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-black text-slate-950">{activeVariant.name}</h2>
            <p className="mt-1 text-sm font-bold text-[#08AACE]">{activeVariant.source}</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div className="rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">
              {activeVariant.note}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              {variants.map((variant, index) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setActiveVariantId(variant.id)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    activeVariantId === variant.id
                      ? 'border-[#08AACE] bg-[#EAF9FD] ring-2 ring-[#BDEEF7]'
                      : 'border-slate-200 bg-white hover:border-[#BDEEF7]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-black text-slate-900">方案{index + 1}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-500">{variant.id}</span>
                  </div>
                  <div className="mt-2 text-base font-black text-slate-950">{variant.name.replace(/^方案.：/, '')}</div>
                  <p className="mt-2 text-xs font-bold leading-5 text-slate-400">{variant.note}</p>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-700">
              当前建议：方案二最稳，方案三差异更明显，适合你想削弱“整栏浅蓝”的情况。方案一只是当前方案的小修版。
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
