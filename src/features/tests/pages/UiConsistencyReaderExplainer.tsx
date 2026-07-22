import { useMemo, useState } from 'react';

type ReaderMode = 'brainstorm' | 'setting' | 'outline';

type ReaderConfig = {
  label: string;
  before: string;
  categories: string[];
  candidates: string[];
  single: boolean;
  selectedColumn: boolean;
};

const READER_CONFIGS: Record<ReaderMode, ReaderConfig> = {
  brainstorm: {
    label: '关联脑洞',
    before: '点击整张卡片就会选中，关联按钮还放在预览内部。',
    categories: ['脑洞'],
    candidates: ['废土求生', '仙侠经营', '悬疑古城'],
    single: true,
    selectedColumn: false,
  },
  setting: {
    label: '关联其他设定',
    before: '使用复选框，但分类、搜索和确认区的位置与脑洞不同。',
    categories: ['作品', '世界观', '势力'],
    candidates: ['世界结构', '主角势力', '灵脉体系'],
    single: false,
    selectedColumn: false,
  },
  outline: {
    label: '章纲关联资料',
    before: '额外增加已选资料栏，整体变成另一套三栏实现。',
    categories: ['章纲', '设定', '角色'],
    candidates: ['第11章章纲', '世界结构', '苏婉'],
    single: false,
    selectedColumn: true,
  },
};

const MODE_ORDER: ReaderMode[] = ['brainstorm', 'setting', 'outline'];

export function UiConsistencyReaderExplainer() {
  const [mode, setMode] = useState<ReaderMode>('brainstorm');
  const [previewed, setPreviewed] = useState(READER_CONFIGS.brainstorm.candidates[0]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [activeCategory, setActiveCategory] = useState(0);
  const config = READER_CONFIGS[mode];

  const selectedItems = useMemo(
    () => config.candidates.filter((candidate) => selected.has(candidate)),
    [config.candidates, selected],
  );

  const switchMode = (nextMode: ReaderMode) => {
    const nextConfig = READER_CONFIGS[nextMode];
    setMode(nextMode);
    setPreviewed(nextConfig.candidates[0]);
    setSelected(new Set());
    setActiveCategory(0);
  };

  const toggleSelected = (candidate: string) => {
    setSelected((current) => {
      if (config.single) return current.has(candidate) ? new Set() : new Set([candidate]);
      const next = new Set(current);
      if (next.has(candidate)) next.delete(candidate);
      else next.add(candidate);
      return next;
    });
  };

  return (
    <div data-testid="reader-change-explainer" className="rounded-2xl border border-[#9BEFFC] bg-[#F8FDFF] p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_56px_minmax(0,1.15fr)]">
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-black text-amber-900">修改前：三套阅读器各自长得不一样</h3>
          <div className="mt-3 space-y-2">
            {MODE_ORDER.map((item, index) => (
              <div key={item} className="rounded-lg bg-white px-3 py-2 text-xs font-bold leading-5 text-slate-600">
                <strong className="text-slate-900">{index + 1}. {READER_CONFIGS[item].label}：</strong>
                {READER_CONFIGS[item].before}
              </div>
            ))}
          </div>
        </section>
        <div className="flex items-center justify-center text-2xl font-black text-[#08AACE]">→</div>
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="text-sm font-black text-emerald-900">统一后：只保留一套固定操作顺序</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-black text-emerald-800 sm:grid-cols-3">
            {['1 分类切换', '2 点击只预览', '3 勾选才关联', '4 查看已选资料', '5 底部统一确认', '6 单选/多选可配置'].map(
              (item) => (
                <div key={item} className="rounded-lg bg-white px-3 py-2">{item}</div>
              ),
            )}
          </div>
        </section>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-950">统一阅读器交互示意</h3>
            <p className="mt-1 text-xs font-bold text-slate-400">切换入口后观察：外壳和操作位置不动，只改变资料来源与选择规则。</p>
          </div>
          <div className="flex gap-2" role="tablist" aria-label="关联阅读器入口">
            {MODE_ORDER.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={mode === item}
                onClick={() => switchMode(item)}
                className={`h-8 rounded-lg border px-3 text-xs font-black ${
                  mode === item
                    ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE]'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                {READER_CONFIGS[item].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
          <header className="flex h-12 items-center justify-between border-b border-slate-200 px-4">
            <div>
              <strong className="text-sm text-slate-950">{config.label}</strong>
              <p className="mt-0.5 text-[11px] font-bold text-slate-400">先预览内容，再明确选择是否关联</p>
            </div>
            <span className="rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-black text-slate-500">
              {config.single ? '单选' : '多选'}
            </span>
          </header>

          <div className="flex h-11 items-center gap-2 border-b border-slate-200 px-4" role="tablist" aria-label="资料分类">
            {config.categories.map((category, index) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={activeCategory === index}
                onClick={() => setActiveCategory(index)}
                className={`rounded-lg px-3 py-1.5 text-xs font-black ${
                  activeCategory === index ? 'bg-[#08AACE] text-white' : 'bg-slate-50 text-slate-500'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className={`grid min-h-[250px] ${config.selectedColumn ? 'grid-cols-[220px_minmax(0,1fr)_190px]' : 'grid-cols-[220px_minmax(0,1fr)]'}`}>
            <aside className="border-r border-slate-200 bg-gray-50 p-3">
              <div className="mb-2 text-xs font-black text-slate-500">候选资料</div>
              <div className="space-y-2">
                {config.candidates.map((candidate) => {
                  const checked = selected.has(candidate);
                  return (
                    <div
                      key={candidate}
                      className={`flex items-center gap-2 rounded-lg border bg-white px-2 py-2 ${
                        previewed === candidate ? 'border-[#8DE4F4]' : 'border-slate-200'
                      }`}
                    >
                      <input
                        type={config.single ? 'radio' : 'checkbox'}
                        name={config.single ? 'reader-single-selection' : undefined}
                        aria-label={`关联${candidate}`}
                        checked={checked}
                        onChange={() => toggleSelected(candidate)}
                        className="h-4 w-4 shrink-0 border-slate-300 text-[#08AACE] focus:ring-[#08AACE]/20"
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewed(candidate)}
                        className="min-w-0 flex-1 truncate text-left text-xs font-black text-slate-700"
                      >
                        {candidate}
                      </button>
                    </div>
                  );
                })}
              </div>
            </aside>

            <section className="p-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-black text-slate-950">正在预览：{previewed}</h4>
                <span className="text-[11px] font-black text-[#08AACE]">点击候选项只切换这里</span>
              </div>
              <div className="mt-3 min-h-[160px] rounded-xl border-2 border-slate-950 bg-white p-4 text-sm font-medium leading-7 text-slate-600">
                这里显示“{previewed}”的完整内容。预览不会自动关联；只有左侧选择控件被勾选后，资料才会进入待关联列表。
              </div>
            </section>

            {config.selectedColumn ? (
              <aside className="border-l border-slate-200 bg-gray-50 p-3">
                <div className="text-xs font-black text-slate-500">已选资料</div>
                <div className="mt-2 space-y-2">
                  {selectedItems.length > 0 ? selectedItems.map((item) => (
                    <div key={item} className="rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-700">✓ {item}</div>
                  )) : <div className="rounded-lg border border-dashed border-slate-200 bg-white p-3 text-center text-xs font-bold text-slate-400">暂未选择</div>}
                </div>
              </aside>
            ) : null}
          </div>

          <footer className="flex h-12 items-center justify-between border-t border-slate-200 bg-white px-4">
            <span className="text-xs font-black text-slate-500">已选 {selectedItems.length} 项</span>
            <button
              type="button"
              disabled={selectedItems.length === 0}
              className="h-8 rounded-lg bg-[#08AACE] px-5 text-xs font-black text-white disabled:bg-slate-300"
            >
              确认关联
            </button>
          </footer>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold leading-6 text-white">
        最终要修改的不是资料内容，而是操作外壳：标题栏、分类栏、候选列表、预览区、明确选择控件和底部确认区统一；单选、多选及第三栏按业务开启。
      </div>
    </div>
  );
}
