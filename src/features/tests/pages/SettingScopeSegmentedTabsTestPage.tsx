import { useMemo, useState } from 'react';

const scopeTabs = [
  {
    id: 'work',
    label: '作品设定',
    count: 4,
    items: ['核心设定', '世界规则', '成长体系', '主线剧情'],
  },
  {
    id: 'character',
    label: '人物设定',
    count: 7,
    items: ['林刻', '沈清霜', '陆承渊', '周砚', '外门执事', '旧案商人', '匿名线人'],
  },
] as const;

type ScopeTabId = typeof scopeTabs[number]['id'];

export function SettingScopeSegmentedTabsTestPage() {
  const [activeScope, setActiveScope] = useState<ScopeTabId>('work');
  const activeTab = useMemo(
    () => scopeTabs.find((tab) => tab.id === activeScope) ?? scopeTabs[0],
    [activeScope],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 p-6">
      <header className="mb-5 flex shrink-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-black text-[#08AACE]">设定页顶部切换测试</div>
          <h1 className="mt-1 text-xl font-black text-slate-950">作品设定 / 人物设定胶囊标签</h1>
          <p className="mt-1 text-sm font-bold text-slate-400">
            测试把设定页的两个入口改成截图同款胶囊分段，保留数量统计并减少左侧栏顶部占用。
          </p>
        </div>
        <div className="rounded-full border border-[#08AACE]/20 bg-[#EAF9FD] px-3 py-1.5 text-xs font-black text-[#078FAE]">
          待确认视觉
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)] gap-5">
        <aside className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-5">
          <div className="w-fit rounded-[22px] bg-slate-200/80 p-1.5 shadow-inner">
            <div className="flex items-center gap-1">
              {scopeTabs.map((tab) => {
                const active = activeScope === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveScope(tab.id)}
                    className={`flex h-14 items-center gap-3 rounded-[17px] px-5 text-lg font-black transition-colors ${
                      active
                        ? 'bg-white text-[#08AACE] shadow-sm'
                        : 'bg-transparent text-slate-900 hover:bg-white/45'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={active ? 'text-[#08AACE]' : 'text-slate-500'}>{tab.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
            这个方案保持两个标签始终同宽感、同高度，不会像普通按钮一样显得零散。数量直接跟在文字后面，用户切换时能看到当前类型有多少条。
          </div>

          <div className="mt-5 min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-100">
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
              {activeTab.label}目录
            </div>
            <div className="editor-scrollbar max-h-full overflow-y-auto p-3">
              <div className="space-y-2">
                {activeTab.items.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    className={`flex h-10 w-full items-center justify-between rounded-lg border px-3 text-left text-sm font-bold ${
                      index === 0
                        ? 'border-[#08AACE]/40 bg-[#EAF9FD] text-[#078FAE]'
                        : 'border-slate-100 bg-white text-slate-600'
                    }`}
                  >
                    <span>{item}</span>
                    <span className="text-xs text-slate-400">{index + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-5">
            <h2 className="text-base font-black text-slate-950">{activeTab.label}预览</h2>
            <span className="text-sm font-black text-slate-400">已选择 1 项</span>
          </div>
          <div className="min-h-0 flex-1 p-5">
            <div className="h-full rounded-[22px] border-2 border-slate-950 bg-white p-5">
              <div className="text-lg font-black text-slate-950">{activeTab.items[0]}</div>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                这里模拟正式设定页中间预览区。确认这个顶部切换样式后，可以把正式页左侧顶部的“作品设定 / 人物设定”按钮替换为这套胶囊分段。
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
