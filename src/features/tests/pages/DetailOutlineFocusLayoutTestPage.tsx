import { Check, ChevronLeft, ChevronRight, FileText, Link2, Settings, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

type ChapterStatus = 'done' | 'empty' | 'draft';

type MockChapter = {
  id: string;
  volume: string;
  title: string;
  status: ChapterStatus;
  outline: string;
  aiOutput: string;
};

const chapters: MockChapter[] = [
  {
    id: 'chapter-1',
    volume: '第一卷',
    title: '第1章 雨夜入城',
    status: 'done',
    outline:
      '主角在雨夜抵达边境城，发现城门口的身份核验异常严格。\n\n1. 开篇用雨声、铁门和排队人群建立压迫感。\n2. 主角试图低调入城，却被旧伤触发灵能检测。\n3. 守卫放行前暗示城内最近连续有人失踪。\n4. 结尾让主角看到熟悉的家族徽记，确认旧案并未结束。',
    aiOutput:
      '第1章可强化“入城即入局”的感觉：主角不是主动卷入，而是被检测、徽记、失踪案三件事连续推着走。替换章纲后，右侧输出区应该清空，切换章节也不应回填旧内容。',
  },
  {
    id: 'chapter-2',
    volume: '第一卷',
    title: '第2章 黑市药铺',
    status: 'draft',
    outline:
      '主角按照徽记线索找到黑市药铺。药铺老板认出主角旧伤，提出交易：帮他取回一份被城防军扣押的账本。',
    aiOutput:
      '本章重点是交易条件和信息交换，避免一上来打斗。可以让药铺老板只说半句真话，保留后续反转空间。',
  },
  {
    id: 'chapter-3',
    volume: '第一卷',
    title: '第3章 城防军账本',
    status: 'empty',
    outline: '',
    aiOutput: '',
  },
  {
    id: 'chapter-4',
    volume: '第二卷',
    title: '第4章 地下旧塔',
    status: 'done',
    outline:
      '主角进入地下旧塔，第一次看到旧时代遗留的灵能管线。旧塔不是废墟，而是仍在运行的城市心脏。',
    aiOutput:
      '这里适合把世界观信息放进行动里：主角修复管线时发现系统仍在抽取居民灵能。',
  },
];

const statusConfig: Record<ChapterStatus, { label: string; className: string }> = {
  done: {
    label: '已有章纲',
    className: 'border-[#08AACE]/30 bg-[#EAF9FD] text-[#078FAE]',
  },
  draft: {
    label: '待确认',
    className: 'border-amber-200 bg-amber-50 text-amber-600',
  },
  empty: {
    label: '空白',
    className: 'border-slate-200 bg-white text-slate-400',
  },
};

function countWords(text: string) {
  return text.replace(/\s/g, '').length;
}

export function DetailOutlineFocusLayoutTestPage() {
  const [selectedId, setSelectedId] = useState(chapters[0].id);
  const [outlineTextById, setOutlineTextById] = useState<Record<string, string>>(() => (
    Object.fromEntries(chapters.map((chapter) => [chapter.id, chapter.outline]))
  ));
  const [aiOutputById, setAiOutputById] = useState<Record<string, string>>(() => (
    Object.fromEntries(chapters.map((chapter) => [chapter.id, chapter.aiOutput]))
  ));
  const [linkedContext, setLinkedContext] = useState(true);

  const selectedIndex = chapters.findIndex((chapter) => chapter.id === selectedId);
  const selectedChapter = chapters[selectedIndex] ?? chapters[0];
  const selectedOutline = outlineTextById[selectedChapter.id] ?? '';
  const selectedAiOutput = aiOutputById[selectedChapter.id] ?? '';

  const groupedChapters = useMemo(() => {
    return chapters.reduce<Record<string, MockChapter[]>>((groups, chapter) => {
      groups[chapter.volume] = [...(groups[chapter.volume] ?? []), chapter];
      return groups;
    }, {});
  }, []);

  const selectByOffset = (offset: number) => {
    const next = chapters[selectedIndex + offset];
    if (next) setSelectedId(next.id);
  };

  const replaceOutline = () => {
    if (!selectedAiOutput.trim()) return;
    setOutlineTextById((current) => ({
      ...current,
      [selectedChapter.id]: selectedAiOutput,
    }));
    setAiOutputById((current) => ({
      ...current,
      [selectedChapter.id]: '',
    }));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 p-5">
      <header className="mb-4 flex shrink-0 items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900">章纲单章聚焦布局测试</h1>
          <p className="mt-1 text-xs font-bold text-slate-400">
            测试目标：左侧只负责选章，中间只编辑当前章纲，右侧专门处理 AI 输出和关联资料。
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-lg border border-[#08AACE]/20 bg-[#EAF9FD] px-3 py-2 text-xs font-black text-[#078FAE]">
          <Check className="h-4 w-4" />
          单章切换不会回填 AI 输出
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[240px_minmax(420px,1fr)_390px] gap-4">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 px-4 py-3">
            <div className="text-sm font-black text-slate-900">章节目录</div>
            <div className="mt-1 text-xs font-bold text-slate-400">点击章节只切换中间编辑对象</div>
          </div>
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
            {Object.entries(groupedChapters).map(([volume, volumeChapters]) => (
              <section key={volume} className="mb-4 last:mb-0">
                <div className="mb-2 px-1 text-xs font-black text-slate-400">{volume}</div>
                <div className="space-y-2">
                  {volumeChapters.map((chapter, index) => {
                    const selected = chapter.id === selectedChapter.id;
                    const status = statusConfig[chapter.status];
                    return (
                      <button
                        key={chapter.id}
                        type="button"
                        onClick={() => setSelectedId(chapter.id)}
                        className={`w-full rounded-lg border p-3 text-left transition-colors ${
                          selected
                            ? 'border-[#08AACE] bg-[#F0FBFE] shadow-sm ring-2 ring-[#08AACE]/10'
                            : 'border-slate-100 bg-slate-50 hover:border-[#08AACE]/30 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white text-xs font-black text-slate-500 shadow-sm">
                            {chapters.findIndex((item) => item.id === chapter.id) + 1}
                          </span>
                          <span className={`rounded-md border px-2 py-0.5 text-[11px] font-black ${status.className}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="mt-2 line-clamp-2 text-sm font-black leading-5 text-slate-800">
                          {chapter.title}
                        </div>
                        <div className="mt-1 text-xs font-bold text-slate-400">
                          {countWords(outlineTextById[chapter.id] ?? '')} 字
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-black text-[#08AACE]">{selectedChapter.volume}</div>
                <h2 className="mt-1 truncate text-lg font-black text-slate-900">{selectedChapter.title}</h2>
              </div>
              <div className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">
                当前章纲 {countWords(selectedOutline)} 字
              </div>
            </div>
          </div>
          <div className="min-h-0 flex-1 p-5">
            <textarea
              value={selectedOutline}
              onChange={(event) => {
                setOutlineTextById((current) => ({
                  ...current,
                  [selectedChapter.id]: event.target.value,
                }));
              }}
              placeholder="当前章节的章纲只在这里编辑。空白章节不会被其他章节或 AI 输出自动填充。"
              className="editor-scrollbar h-full w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold leading-7 text-slate-700 outline-none transition-colors focus:border-[#08AACE] focus:bg-white"
            />
          </div>
          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
            <button
              type="button"
              onClick={() => selectByOffset(-1)}
              disabled={selectedIndex <= 0}
              className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              上一章
            </button>
            <div className="text-xs font-bold text-slate-400">
              {selectedIndex + 1} / {chapters.length}
            </div>
            <button
              type="button"
              onClick={() => selectByOffset(1)}
              disabled={selectedIndex >= chapters.length - 1}
              className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              下一章
              <ChevronRight className="h-4 w-4" />
            </button>
          </footer>
        </section>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black text-slate-900">AI 工作区</div>
                <div className="mt-1 text-xs font-bold text-slate-400">输出、资料、要求集中在右侧</div>
              </div>
              <button type="button" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
            <div className="mb-3 flex items-center gap-2">
              <button type="button" className="rounded-lg bg-[#08AACE] px-3 py-1.5 text-xs font-black text-white">
                章纲
              </button>
              <button type="button" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-500">
                设定
              </button>
              <button type="button" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-500">
                角色
              </button>
            </div>

            <section className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                  <Link2 className="h-4 w-4 text-[#08AACE]" />
                  关联资料
                </div>
                <button
                  type="button"
                  onClick={() => setLinkedContext((value) => !value)}
                  className={`rounded-md px-2 py-1 text-xs font-black ${
                    linkedContext ? 'bg-[#EAF9FD] text-[#078FAE]' : 'bg-white text-slate-400'
                  }`}
                >
                  {linkedContext ? '已关联 2475 字' : '未关联'}
                </button>
              </div>
              <div className="rounded-lg bg-white p-3 text-xs font-semibold leading-6 text-slate-600">
                {linkedContext
                  ? '【关联大纲】世界观、主线目标、角色动机将随本次章纲请求发送给 AI。'
                  : '未选择关联资料，本次只使用当前输入要求。'}
              </div>
            </section>

            <section className="mb-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                  <Sparkles className="h-4 w-4 text-[#08AACE]" />
                  AI 输出框
                </div>
                <span className="text-xs font-bold text-slate-400">{countWords(selectedAiOutput)} 字</span>
              </div>
              <textarea
                value={selectedAiOutput}
                onChange={(event) => {
                  setAiOutputById((current) => ({
                    ...current,
                    [selectedChapter.id]: event.target.value,
                  }));
                }}
                placeholder="AI 输出显示在这里。点击“替换章纲”后，会写入中间章纲，并清空当前 AI 输出。"
                className="editor-scrollbar h-44 w-full resize-none rounded-b-xl border-0 p-3 text-sm font-semibold leading-6 text-slate-700 outline-none"
              />
            </section>

            <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                <FileText className="h-4 w-4 text-[#08AACE]" />
                其他要求
              </div>
              <textarea
                placeholder="例如：把本章节奏压紧，突出主角被动入局，不要提前泄露幕后黑手。"
                className="h-24 w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold leading-6 text-slate-700 outline-none focus:border-[#08AACE]"
              />
            </section>
          </div>

          <footer className="grid shrink-0 grid-cols-3 gap-2 border-t border-slate-100 p-4">
            <button type="button" className="h-9 rounded-lg bg-[#08AACE] text-sm font-black text-white">
              生成
            </button>
            <button
              type="button"
              onClick={replaceOutline}
              className="h-9 rounded-lg border border-[#08AACE]/30 bg-[#EAF9FD] text-sm font-black text-[#078FAE]"
            >
              替换章纲
            </button>
            <button
              type="button"
              onClick={() => setAiOutputById((current) => ({ ...current, [selectedChapter.id]: '' }))}
              className="h-9 rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-500"
            >
              清空输出
            </button>
          </footer>
        </aside>
      </main>
    </div>
  );
}
