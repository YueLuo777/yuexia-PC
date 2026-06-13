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
  { id: 'chapter-1', title: '第1章 初入月下', count: '812字' },
  { id: 'chapter-2', title: '第2章 风雨将至', count: '1,246字', selected: true },
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
      <div className="mt-4 grid gap-4 lg:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">{children}</div>
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

type SelectedTone = 'default' | 'orange' | 'softBlue' | 'coolGray' | 'mint' | 'outline' | 'lavender';

function getSelectedPreviewClass(selected: boolean | undefined, tone: SelectedTone) {
  if (!selected) return 'border-transparent hover:bg-gray-50';
  switch (tone) {
    case 'orange':
      return 'border-transparent xy-selected-orange-bg';
    case 'softBlue':
      return 'border-[#BDEEF7] bg-[#E7F8FD] shadow-[0_0_0_1px_rgba(8,170,206,0.10)]';
    case 'coolGray':
      return 'border-[#CBD5E1] bg-[#EEF2F7] shadow-[0_1px_2px_rgba(15,23,42,0.06)]';
    case 'mint':
      return 'border-[#A7F3D0] bg-[#ECFDF5] shadow-[0_0_0_1px_rgba(16,185,129,0.10)]';
    case 'outline':
      return 'border-[#08AACE] bg-white shadow-[inset_0_0_0_1px_rgba(8,170,206,0.24)]';
    case 'lavender':
      return 'border-[#DDD6FE] bg-[#F5F3FF] shadow-[0_1px_2px_rgba(139,92,246,0.08)]';
    default:
      return 'border-[#BDEEF7] bg-[#F1FBFE]';
  }
}

const selectedTonePlans: { id: string; title: string; note: string; tone: SelectedTone }[] = [
  { id: 'current-orange', title: '当前橙底', note: '当前效果，仅作为对照。', tone: 'orange' },
  { id: 'soft-blue', title: '方案 1：浅青蓝', note: '和卷标题同色系，弱化橙色跳出感。', tone: 'softBlue' },
  { id: 'cool-gray', title: '方案 2：冷灰', note: '更克制，适合长时间写作。', tone: 'coolGray' },
  { id: 'mint', title: '方案 3：薄荷绿', note: '区分度比灰色高，但比橙色安静。', tone: 'mint' },
  { id: 'outline', title: '方案 4：蓝色描边', note: '主要用边框表示选中，背景保持白色。', tone: 'outline' },
  { id: 'lavender', title: '方案 5：淡紫灰', note: '柔和但有轻微识别度。', tone: 'lavender' },
];

function ChapterRows({ bold = false, selectedTone = 'default' }: { bold?: boolean; selectedTone?: SelectedTone }) {
  return (
    <div className="mt-0.5 space-y-0.5">
      {chapterRows.map((chapter) => (
        <div
          key={chapter.id}
          className={[
            'group relative flex w-full cursor-pointer items-center gap-2 rounded-[8px] border px-[24px] py-2 text-left transition-colors',
            getSelectedPreviewClass(chapter.selected, selectedTone),
          ].join(' ')}
        >
          <span className={`flex-1 truncate whitespace-nowrap text-sm text-gray-700 ${bold ? 'font-black' : 'font-medium'}`}>
            {chapter.title}
          </span>
          <span className={`shrink-0 text-xs text-gray-400 ${bold ? 'font-black' : 'font-medium'}`}>
            {chapter.count}
          </span>
        </div>
      ))}
    </div>
  );
}

function LibraryPreview({ bold = false, selectedTone = 'default' }: { bold?: boolean; selectedTone?: SelectedTone }) {
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
                  getSelectedPreviewClass(entry.selected, selectedTone),
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

        <PreviewShell title="正文目录：选中背景方案对比">
          {selectedTonePlans.map((plan) => (
            <PreviewColumn key={plan.id} title={plan.title} note={plan.note}>
              <ChapterGroupHeader bold />
              <ChapterRows bold selectedTone={plan.tone} />
            </PreviewColumn>
          ))}
        </PreviewShell>

        <PreviewShell title="正文目录：第一卷与章节加粗">
          <PreviewColumn title="当前样式" note="卷名和章节保持中等字重。">
            <ChapterGroupHeader />
            <ChapterRows />
          </PreviewColumn>
          <PreviewColumn title="加粗方案" note="第一卷、章节标题、字数统一提高字重。">
            <ChapterGroupHeader bold />
            <ChapterRows bold />
          </PreviewColumn>
          <PreviewColumn title="加粗橙底方案" note="在加粗基础上，把选中章节背景改为 #FFF7ED。">
            <ChapterGroupHeader bold />
            <ChapterRows bold selectedTone="orange" />
          </PreviewColumn>
        </PreviewShell>

        <PreviewShell title="脑洞 / 设定等页面：分组与设定条目加粗">
          <PreviewColumn title="当前样式" note="分组和条目以中等字重显示。">
            <LibraryPreview />
          </PreviewColumn>
          <PreviewColumn title="加粗方案" note="分组名、分组数量、设定条目和字数全部加粗。">
            <LibraryPreview bold />
          </PreviewColumn>
          <PreviewColumn title="加粗橙底方案" note="保持加粗效果，选中条目背景改为 #FFF7ED。">
            <LibraryPreview bold selectedTone="orange" />
          </PreviewColumn>
        </PreviewShell>
      </div>
    </div>
  );
}

export default WorkbenchSidebarBoldNavigationTestPage;
