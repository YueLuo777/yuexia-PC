import { useMemo, useState } from 'react';

type OutlineFilter = 'all' | 'unused' | 'used';

type DemoChapter = {
  number: number;
  hasOutline: boolean;
  used: boolean;
};

type DemoVolume = {
  title: string;
  chapters: DemoChapter[];
};

const demoVolumes: DemoVolume[] = [
  {
    title: '第一卷',
    chapters: [
      { number: 1, hasOutline: true, used: true },
      { number: 2, hasOutline: true, used: false },
      { number: 3, hasOutline: false, used: false },
      { number: 4, hasOutline: true, used: true },
      { number: 5, hasOutline: true, used: false },
      { number: 6, hasOutline: false, used: false },
      { number: 7, hasOutline: true, used: false },
      { number: 8, hasOutline: true, used: true },
    ],
  },
  {
    title: '第二卷',
    chapters: [
      { number: 101, hasOutline: true, used: false },
      { number: 102, hasOutline: true, used: false },
      { number: 103, hasOutline: false, used: false },
      { number: 104, hasOutline: true, used: true },
      { number: 105, hasOutline: false, used: false },
      { number: 106, hasOutline: true, used: true },
      { number: 107, hasOutline: true, used: false },
      { number: 108, hasOutline: true, used: true },
      { number: 109, hasOutline: false, used: false },
      { number: 110, hasOutline: true, used: false },
    ],
  },
  {
    title: '第三卷',
    chapters: [
      { number: 201, hasOutline: true, used: true },
      { number: 202, hasOutline: true, used: false },
      { number: 203, hasOutline: true, used: false },
      { number: 204, hasOutline: false, used: false },
      { number: 205, hasOutline: true, used: true },
      { number: 206, hasOutline: true, used: false },
      { number: 207, hasOutline: true, used: false },
      { number: 208, hasOutline: false, used: false },
      { number: 209, hasOutline: true, used: true },
      { number: 210, hasOutline: true, used: false },
      { number: 211, hasOutline: true, used: false },
      { number: 212, hasOutline: true, used: true },
    ],
  },
];

const filters: Array<{ id: OutlineFilter; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'unused', label: '未用' },
  { id: 'used', label: '已用' },
];

function getChapterButtonClass(chapter: DemoChapter, selected: boolean) {
  const base = 'flex h-[36px] w-[36px] items-center justify-center rounded-[8px] border text-[15px] font-black leading-none transition-colors';
  if (selected) return `${base} border-[#08AACE] bg-[#E7F8FD] text-[#071923] shadow-[0_0_0_2px_rgba(8,170,206,0.22)]`;
  if (chapter.used) return `${base} border-[#C7D2FE] bg-[#EEF2FF] text-[#3730A3]`;
  if (chapter.hasOutline) return `${base} border-[#BDEEF7] bg-[#E7F8FD] text-[#075A6C]`;
  return `${base} border-[#D8E1EC] bg-white text-[#9AA4B2]`;
}

function getChapterStateLabel(chapter: DemoChapter, selected: boolean) {
  if (selected) return '选中';
  if (chapter.used) return '已用';
  if (chapter.hasOutline) return '有章纲';
  return '无章纲';
}

export function WorkbenchDetailOutlineNumberBlockTestPage() {
  const [outlineFilter, setOutlineFilter] = useState<OutlineFilter>('all');
  const [selectedChapterNumber, setSelectedChapterNumber] = useState(2);
  const showUsedOnly = outlineFilter === 'used';

  const visibleVolumes = useMemo(() => demoVolumes.map((volume) => ({
    ...volume,
    chapters: volume.chapters.filter((chapter) => {
      if (outlineFilter === 'used') return chapter.used;
      if (outlineFilter === 'unused') return !chapter.used;
      return true;
    }),
  })).filter((volume) => volume.chapters.length > 0), [outlineFilter]);

  const selectedChapter = demoVolumes
    .flatMap((volume) => volume.chapters)
    .find((chapter) => chapter.number === selectedChapterNumber);

  return (
    <div className="editor-scrollbar h-full overflow-y-auto bg-[#F5F5F7] p-6">
      <div className="mx-auto max-w-[1160px] space-y-5">
        <header className="rounded-[8px] border border-[#E2E8F0] bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-black text-slate-950">章纲目录最终方案测试</h1>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-500">36px 小数字块 + 三状态颜色 + 已用筛选。先在这里确认，再迁入正式章纲页。</p>
            </div>
            <div className="inline-flex rounded-[8px] border border-[#D8E1EC] bg-white p-0.5">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setOutlineFilter(filter.id)}
                  className={`h-8 rounded-[7px] px-4 text-sm font-black transition-colors ${
                    outlineFilter === filter.id ? 'bg-[#08AACE] text-white' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="rounded-[8px] border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-950">章节数字块</h2>
                <p className="mt-1 text-xs font-bold text-slate-400">{showUsedOnly ? '只看已经被正文使用过的章纲' : '小块固定 36px，几百章时可以密集排列'}</p>
              </div>
              <div className="text-xs font-black text-slate-400">
                当前 {visibleVolumes.reduce((sum, volume) => sum + volume.chapters.length, 0)} 章
              </div>
            </div>

            <div className="space-y-4">
              {visibleVolumes.map((volume) => (
                <section key={volume.title} className="rounded-[8px] border border-[#EDF1F6] bg-[#FAFBFD] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-800">{volume.title}</h3>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-400">{volume.chapters.length}章</span>
                  </div>
                  <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, 36px)' }}>
                    {volume.chapters.map((chapter) => {
                      const selected = chapter.number === selectedChapterNumber;
                      return (
                        <button
                          key={chapter.number}
                          type="button"
                          onClick={() => setSelectedChapterNumber(chapter.number)}
                          className={getChapterButtonClass(chapter, selected)}
                          title={`第${chapter.number}章：${getChapterStateLabel(chapter, selected)}`}
                        >
                          {chapter.number}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-sm">
              <h2 className="text-base font-black text-slate-950">三状态颜色</h2>
              <div className="mt-4 space-y-3">
                {[
                  { label: '选中', sample: { number: 1, hasOutline: true, used: false }, selected: true, note: '强蓝描边，当前编辑目标最醒目。' },
                  { label: '已用', sample: { number: 2, hasOutline: true, used: true }, selected: false, note: '淡紫蓝，表示已经被正文消耗。' },
                  { label: '有章纲', sample: { number: 3, hasOutline: true, used: false }, selected: false, note: '浅青底，表示可继续使用。' },
                  { label: '无章纲', sample: { number: 4, hasOutline: false, used: false }, selected: false, note: '白底灰字，存在但还没内容。' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className={getChapterButtonClass(item.sample, item.selected)}>{item.sample.number}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-black text-slate-800">{item.label}</span>
                      <span className="block text-xs font-bold leading-5 text-slate-400">{item.note}</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-sm">
              <h2 className="text-base font-black text-slate-950">当前章</h2>
              <div className="mt-3 rounded-[8px] bg-[#F6F8FB] p-3">
                <div className="text-sm font-black text-slate-800">第 {selectedChapterNumber} 章</div>
                <div className="mt-1 text-xs font-bold text-slate-400">
                  {selectedChapter ? getChapterStateLabel(selectedChapter, true) : '未显示'}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default WorkbenchDetailOutlineNumberBlockTestPage;
