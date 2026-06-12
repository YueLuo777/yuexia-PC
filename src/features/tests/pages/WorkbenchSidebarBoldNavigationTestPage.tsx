import type { ReactNode } from 'react';

type ChapterPreview = {
  id: string;
  title: string;
  count: string;
  selected?: boolean;
};

type LibraryGroupPreview = {
  id: string;
  title: string;
  count: string;
  entries: ChapterPreview[];
};

const chapterRows: ChapterPreview[] = [
  { id: 'chapter-1', title: '第1章 初入月下', count: '812字', selected: true },
  { id: 'chapter-2', title: '第2章 风雨将至', count: '1,246字' },
  { id: 'chapter-3', title: '第3章 旧案重启', count: '935字' },
];

const libraryGroups: LibraryGroupPreview[] = [
  {
    id: 'brainstorm',
    title: '脑洞库',
    count: '4个脑洞',
    entries: [
      { id: 'brainstorm-1', title: '脑洞1：主角误入旧城', count: '612字', selected: true },
      { id: 'brainstorm-2', title: '脑洞2：反派的秘密交易', count: '428字' },
    ],
  },
  {
    id: 'setting',
    title: '世界观设定',
    count: '8个设定',
    entries: [
      { id: 'setting-1', title: '月下城规则', count: '920字', selected: true },
      { id: 'setting-2', title: '灵力等级与限制', count: '754字' },
    ],
  },
  {
    id: 'character',
    title: '人物设定',
    count: '6个设定',
    entries: [
      { id: 'character-1', title: '林照夜', count: '1,106字', selected: true },
      { id: 'character-2', title: '沈青霜', count: '889字' },
    ],
  },
];

function PreviewShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-sm">
      <h2 className="text-base font-black text-[#1f2933]">{title}</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  );
}

function PreviewColumn({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <div className="rounded-[8px] border border-[#edf1f5] bg-[#f8fafc] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-black text-[#1f2933]">{title}</div>
          <p className="mt-1 text-xs font-bold text-[#7b8794]">{note}</p>
        </div>
      </div>
      <div className="w-[300px] rounded-[8px] border border-[#e1e5eb] bg-white p-1.5">
        {children}
      </div>
    </div>
  );
}

function ChapterGroupHeader({ bold = false }: { bold?: boolean }) {
  return (
    <div className="group flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-[#BDEEF7] bg-[#E7F8FD] px-1 text-left text-[14px] font-medium text-[#1f2933] shadow-sm">
      <span className="h-[17px] w-[17px] shrink-0 rounded-[3px] border border-[#08AACE] bg-white" />
      <span className={`min-w-0 flex-1 truncate leading-none ${bold ? 'font-black text-[#111827]' : 'font-medium'}`}>
        第一卷
      </span>
      <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-[#6f7e90]">3章</span>
    </div>
  );
}

function ChapterRows({ bold = false }: { bold?: boolean }) {
  return (
    <div className="mt-0.5 space-y-0.5">
      {chapterRows.map((chapter) => (
        <div
          key={chapter.id}
          className={[
            'group relative flex w-full cursor-pointer items-center gap-2 rounded-[8px] border px-[24px] py-2 text-left transition-colors',
            chapter.selected ? 'border-[#FDBA74] bg-[#FFF7ED]' : 'border-transparent hover:bg-gray-50',
          ].join(' ')}
        >
          <span className={`flex-1 truncate whitespace-nowrap text-sm ${bold ? 'font-black' : 'font-medium'} ${chapter.selected ? 'text-[#F97316]' : 'text-gray-700'}`}>
            {chapter.title}
          </span>
          <span className={`shrink-0 text-xs ${bold ? 'font-black' : 'font-medium'} ${chapter.selected ? 'text-[#2563EB]' : 'text-gray-400'}`}>
            {chapter.count}
          </span>
        </div>
      ))}
    </div>
  );
}

function LibraryPreview({ bold = false }: { bold?: boolean }) {
  return (
    <div className="space-y-1">
      {libraryGroups.map((group) => (
        <div key={group.id}>
          <div className="group flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-[#BDEEF7] bg-[#E7F8FD] px-1 text-left text-[14px] font-medium text-[#1f2933] shadow-sm">
            <span className="h-[17px] w-[17px] shrink-0 rounded-[3px] border border-[#08AACE] bg-white" />
            <span className={`min-w-0 flex-1 truncate leading-none ${bold ? 'font-black text-[#111827]' : 'font-medium'}`}>
              {group.title}
            </span>
            <span className={`rounded-full bg-white/70 px-2 py-0.5 text-xs text-[#6f7e90] ${bold ? 'font-black' : 'font-medium'}`}>
              {group.count}
            </span>
          </div>
          <div className="mt-0.5 space-y-0.5">
            {group.entries.map((entry) => (
              <div
                key={entry.id}
                className={[
                  'flex cursor-pointer items-center gap-2 rounded-[8px] border px-3 py-2 text-left transition-colors',
                  entry.selected ? 'border-[#BDEEF7] bg-[#F1FBFE]' : 'border-transparent hover:bg-gray-50',
                ].join(' ')}
              >
                <span className={`min-w-0 flex-1 truncate text-sm ${bold ? 'font-black text-[#1f2933]' : 'font-medium text-gray-700'}`}>
                  {entry.title}
                </span>
                <span className={`shrink-0 text-xs text-[#6f7e90] ${bold ? 'font-black' : 'font-medium'}`}>
                  {entry.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function WorkbenchSidebarBoldNavigationTestPage() {
  return (
    <div className="editor-scrollbar h-full overflow-y-auto bg-[#f5f5f7] p-6">
      <div className="mx-auto max-w-[1280px] space-y-5">
        <header className="rounded-[8px] border border-[#e2e8f0] bg-white px-5 py-4 shadow-sm">
          <h1 className="text-xl font-black text-[#1f2933]">作品编辑器左侧导航加粗测试</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-[#6f7e90]">
            只在测试页预览：正文里的“第一卷”和章节，以及脑洞、设定、人物设定等页面的分组和设定条目加粗后的效果。
          </p>
        </header>

        <PreviewShell title="正文目录：第一卷与章节加粗">
          <PreviewColumn title="当前样式" note="卷名和章节保持中等字重。">
            <ChapterGroupHeader />
            <ChapterRows />
          </PreviewColumn>
          <PreviewColumn title="加粗方案" note="第一卷、章节标题、字数统一提高字重。">
            <ChapterGroupHeader bold />
            <ChapterRows bold />
          </PreviewColumn>
        </PreviewShell>

        <PreviewShell title="脑洞 / 设定等页面：分组与设定条目加粗">
          <PreviewColumn title="当前样式" note="分组和条目以中等字重显示。">
            <LibraryPreview />
          </PreviewColumn>
          <PreviewColumn title="加粗方案" note="分组名、分组数量、设定条目和字数全部加粗。">
            <LibraryPreview bold />
          </PreviewColumn>
        </PreviewShell>
      </div>
    </div>
  );
}

export default WorkbenchSidebarBoldNavigationTestPage;
