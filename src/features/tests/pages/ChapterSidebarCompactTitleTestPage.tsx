import { FolderOpen } from 'lucide-react';

const chapters = [
  { id: 1, title: '北灵院', words: 4338, selected: true },
  { id: 2, title: '被踢出灵路的少年', words: 4537 },
  { id: 3, title: '牧域', words: 2868 },
  { id: 4, title: '大浮屠诀', words: 2454 },
  { id: 5, title: '大千世界', words: 4061 },
  { id: 6, title: '灵力增幅', words: 2387 },
  { id: 7, title: '慕元', words: 2909 },
];

function ChapterSidebarPreview({ compact }: { compact: boolean }) {
  const chapterRowClass = compact
    ? 'group relative grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_4ch] items-center gap-2 rounded-[8px] border border-transparent py-1 pl-1 pr-1 text-left transition-colors'
    : 'group relative flex w-full cursor-pointer items-center gap-2 rounded-[8px] border border-transparent px-[24px] py-1 text-left transition-colors';

  return (
    <aside className="flex h-[520px] w-[300px] shrink-0 flex-col overflow-hidden border-r border-[#e1e5eb] bg-white">
      <div className="flex h-[42px] shrink-0 items-center justify-between border-b border-[#e6e8ec] bg-[#fbfbfc] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <h2 className="whitespace-nowrap text-sm font-bold text-gray-900">未发布</h2>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F8FD] text-xs font-medium text-[#08AACE]">
            7
          </span>
        </div>
        <button className="flex items-center justify-center whitespace-nowrap rounded-md bg-[#08AACE] px-2 py-1 text-sm text-white">
          收回已发布
        </button>
      </div>

      <div className="editor-scrollbar flex-1 overflow-y-auto px-1 py-2">
        <div className="mb-1">
          <div className="group flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-[#BDEEF7] px-1 text-left text-[14px] font-black text-[#1f2933] shadow-sm xy-flow-group-bg">
            <button className="flex min-w-0 flex-1 items-center gap-2 text-left">
              <FolderOpen className="h-[17px] w-[17px] shrink-0 text-[#08AACE]" />
              <span className="min-w-0 flex-1 truncate leading-none">第一卷</span>
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-black text-[#6f7e90]">7章</span>
            </button>
            <button className="grid h-7 w-7 place-items-center rounded-md bg-white/70 text-xl font-bold leading-none text-[#6f7e90]">
              +
            </button>
          </div>

          <div className="mt-0.5 space-y-0.5">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className={`${chapterRowClass} ${chapter.selected ? 'xy-selected-mint-bg' : 'hover:bg-gray-50'}`}
              >
                <span className={`${compact ? 'min-w-0' : 'flex-1'} truncate whitespace-nowrap text-sm font-black text-gray-700`}>
                  第{chapter.id}章 {chapter.title}
                </span>
                <span className={`${compact ? 'justify-self-end text-right tabular-nums' : 'shrink-0'} text-xs font-black text-gray-400`}>
                  {chapter.words}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function ChapterSidebarCompactTitleTestPage() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
        <div>
          <h1 className="text-lg font-black text-slate-900">正文目录左移测试</h1>
          <p className="mt-0.5 text-xs font-bold text-slate-400">只验证章节标题起点，不改正式正文目录。</p>
        </div>
        <span className="rounded-full border border-[#9BEFFC] bg-[#EAF9FD] px-3 py-1 text-xs font-black text-[#08AACE]">
          测试页
        </span>
      </header>

      <main className="min-h-0 flex-1 overflow-auto p-6">
        <div className="grid min-w-[880px] grid-cols-[300px_300px_minmax(240px,1fr)] gap-6">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-black text-slate-900">当前留白版</h2>
              <p className="mt-1 text-xs font-bold text-slate-400">章节行左右内边距：24px</p>
            </div>
            <ChapterSidebarPreview compact={false} />
          </section>

          <section className="overflow-hidden rounded-xl border border-[#9BEFFC] bg-white shadow-sm">
            <div className="border-b border-[#C9F7FF] bg-[#EAF9FD] px-4 py-3">
              <h2 className="text-sm font-black text-[#066D85]">左移优化版</h2>
              <p className="mt-1 text-xs font-black text-[#08AACE]">章节行左侧内边距：4px</p>
            </div>
            <ChapterSidebarPreview compact />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-black text-slate-900">验证点</h2>
            <div className="mt-4 space-y-3 text-sm font-bold leading-6 text-slate-600">
              <p>1. “第1章”的“第”会从原来的 24px 位置移动到 4px 位置。</p>
              <p>2. 右侧字数仍然固定在最右边，不会和标题挤在一起。</p>
              <p>3. 标题区域变宽，长标题能多显示几个字。</p>
              <p>4. 卷标题行不变，只调整卷下面的章节行。</p>
            </div>
            <div className="mt-5 rounded-lg border border-[#9BEFFC] bg-[#EAF9FD] p-4 text-sm font-black leading-6 text-[#066D85]">
              如果这个左移距离合适，后续可以把正式 `ChapterSidebar` 的章节行从 `px-[24px]` 改成 `pl-1 pr-1`，并让右侧字数使用固定列贴齐最右边。
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
