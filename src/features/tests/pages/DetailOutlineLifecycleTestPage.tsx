import {
  AlertTriangle,
  BookOpen,
  Check,
  FileText,
  Link2,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Unlock,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type OutlineLifeState = 'empty' | 'draft' | 'executed' | 'verified' | 'abnormal';
type RightPanelMode = 'review' | 'reverse' | 'status';

type MockChapter = {
  id: string;
  serialNumber: number;
  volume: string;
  title: string;
  outline: string;
  body: string;
  summary: string;
  verified: boolean;
  stateChange: string;
};

const mockChapters: MockChapter[] = [
  {
    id: 'chapter-1',
    serialNumber: 1,
    volume: '第一卷',
    title: '雨夜入城',
    outline:
      '【本章目标】让主角进入边境城，确认旧徽记会引发灵能检测异常。\n\n【剧情流程】\n1. 雨夜排队入城。\n2. 主角旧伤触发检测石异动。\n3. 守卫放行前提到近期失踪案。\n4. 结尾让主角看见熟悉的家族徽记。\n\n【结尾钩子】旧案并未结束。',
    body:
      '雨水顺着铁门缝隙流下，林刻跟在人群后面，把袖口压得更低。检测石亮起的瞬间，守卫的眼神变了。城门没有立刻关闭，但关于失踪案的低语已经钻进他的耳朵。',
    summary: '主角雨夜入城，旧徽记触发检测异常，并听到失踪案传闻。',
    verified: true,
    stateChange: '人物状态：主角进入边境城。\n道具状态：旧徽记被检测石响应。\n线索/信息：失踪案与旧案可能相关。',
  },
  {
    id: 'chapter-2',
    serialNumber: 2,
    volume: '第一卷',
    title: '黑市药铺',
    outline:
      '【本章目标】主角为了妹妹的救命药进入黑市药铺，并获得城防军账本线索。\n\n【核心冲突】主角急需药，药铺老板要求他拿回账本才肯交易。\n\n【剧情流程】\n1. 主角沿暗号进入黑市街巷。\n2. 药铺老板认出旧徽记，只说半句真话。\n3. 老板提出交易：取回城防军扣押的账本。\n4. 城防军突然搜查，老板把主角推入后仓暗门。\n\n【状态变化】\n人物状态：主角从找药转为被迫接触城防军账本。\n道具状态：旧徽记被药铺老板识别。',
    body:
      '黑市没有招牌，只有药味从门缝里漏出来。林刻推门时，柜台后的老人先看他的手，再看他袖口下压着的徽记。老人说药可以给，但账本必须先回来。门外铁靴声逼近时，老人反手按下柜台，后仓地板裂开一道暗门。',
    summary: '主角进入黑市药铺，药铺老板用救命药逼他取回城防军账本。',
    verified: false,
    stateChange: '人物状态：主角接下城防军账本任务。\n关系状态：主角与药铺老板形成临时交易。',
  },
  {
    id: 'chapter-3',
    serialNumber: 3,
    volume: '第一卷',
    title: '城防军账本',
    outline:
      '【本章目标】主角潜入城防军杂物库，确认账本记录了旧案名单。\n\n【剧情流程】\n1. 暗门通向废弃水渠。\n2. 主角绕开巡逻进入杂物库。\n3. 他发现账本缺页。\n4. 结尾被一个熟悉声音叫住。',
    body: '',
    summary: '',
    verified: false,
    stateChange: '人物状态：主角准备进入城防军视野。\n线索/信息：账本缺页将指向旧案名单。',
  },
  {
    id: 'chapter-4',
    serialNumber: 4,
    volume: '第二卷',
    title: '地下旧塔',
    outline: '',
    body:
      '旧塔在城市地下，塔壁还在缓慢呼吸。林刻第一次明白，所谓废墟不是死物，它仍然从城里抽走灵能。',
    summary: '主角发现地下旧塔仍在运行，并和城市灵能异常有关。',
    verified: false,
    stateChange: '',
  },
  {
    id: 'chapter-5',
    serialNumber: 5,
    volume: '第二卷',
    title: '断裂管线',
    outline: '',
    body: '',
    summary: '',
    verified: false,
    stateChange: '',
  },
];

const stateConfig: Record<OutlineLifeState, { label: string; dot: string; button: string; badge: string }> = {
  empty: {
    label: '无章纲',
    dot: 'bg-slate-300',
    button: 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50',
    badge: 'border-slate-200 bg-white text-slate-400',
  },
  draft: {
    label: '待执行',
    dot: 'bg-[#08AACE]',
    button: 'border-[#08AACE]/30 bg-[#EAF9FD] text-[#078FAE] hover:bg-[#DFF6FB]',
    badge: 'border-[#08AACE]/30 bg-[#EAF9FD] text-[#078FAE]',
  },
  executed: {
    label: '正文已生成',
    dot: 'bg-emerald-500',
    button: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  verified: {
    label: '已核对',
    dot: 'bg-violet-500',
    button: 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100',
    badge: 'border-violet-200 bg-violet-50 text-violet-700',
  },
  abnormal: {
    label: '异常',
    dot: 'bg-red-500',
    button: 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100',
    badge: 'border-red-200 bg-red-50 text-red-600',
  },
};

function countWords(text: string) {
  return text.replace(/\s/g, '').length;
}

function getLifeState(outline: string, body: string, verified: boolean): OutlineLifeState {
  const hasOutline = outline.trim().length > 0;
  const hasBody = body.trim().length > 0;
  if (!hasOutline && hasBody) return 'abnormal';
  if (!hasOutline) return 'empty';
  if (!hasBody) return 'draft';
  if (verified) return 'verified';
  return 'executed';
}

function buildReverseOutline(chapter: MockChapter) {
  return [
    '<本章目标>',
    `${chapter.title}已经存在正文，反推目标是还原这一章实际完成的剧情作用，并补齐后续审核需要的写作依据。`,
    '</本章目标>',
    '',
    '<剧情流程>',
    '1. 主角进入关键场景，发现环境并非废弃状态。',
    '2. 通过观察或触碰，确认场景仍在影响城市灵能。',
    '3. 主角获得下一步调查方向。',
    '</剧情流程>',
    '',
    '<状态变化>',
    '人物状态：主角确认城市地下存在仍在运行的旧设施。',
    '线索/信息：旧塔与城市灵能异常有关。',
    '</状态变化>',
  ].join('\n');
}

export function DetailOutlineLifecycleTestPage() {
  const [selectedChapterId, setSelectedChapterId] = useState(mockChapters[1].id);
  const [outlineById, setOutlineById] = useState<Record<string, string>>(() => (
    Object.fromEntries(mockChapters.map((chapter) => [chapter.id, chapter.outline]))
  ));
  const [verifiedById, setVerifiedById] = useState<Record<string, boolean>>(() => (
    Object.fromEntries(mockChapters.map((chapter) => [chapter.id, chapter.verified]))
  ));
  const [editingExecutedOutline, setEditingExecutedOutline] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('review');

  const selectedChapter = mockChapters.find((chapter) => chapter.id === selectedChapterId) ?? mockChapters[1];
  const selectedOutline = outlineById[selectedChapter.id] ?? '';
  const selectedVerified = Boolean(verifiedById[selectedChapter.id]);
  const selectedState = getLifeState(selectedOutline, selectedChapter.body, selectedVerified);
  const selectedStateConfig = stateConfig[selectedState];
  const hasBody = selectedChapter.body.trim().length > 0;
  const isExecutedLike = hasBody && selectedOutline.trim().length > 0;
  const outlineReadonly = isExecutedLike && !editingExecutedOutline;
  const reverseOutline = buildReverseOutline(selectedChapter);

  const groupedChapters = useMemo(() => {
    return mockChapters.reduce<Record<string, MockChapter[]>>((groups, chapter) => {
      groups[chapter.volume] = [...(groups[chapter.volume] ?? []), chapter];
      return groups;
    }, {});
  }, []);

  const setSelected = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setEditingExecutedOutline(false);
    const chapter = mockChapters.find((item) => item.id === chapterId);
    const outline = outlineById[chapterId] ?? '';
    const nextState = chapter ? getLifeState(outline, chapter.body, Boolean(verifiedById[chapterId])) : 'empty';
    setRightPanelMode(nextState === 'abnormal' ? 'reverse' : 'review');
  };

  const applyReverseOutline = () => {
    setOutlineById((current) => ({ ...current, [selectedChapter.id]: reverseOutline }));
    setVerifiedById((current) => ({ ...current, [selectedChapter.id]: false }));
    setRightPanelMode('review');
    setEditingExecutedOutline(true);
  };

  const markVerified = () => {
    if (!selectedOutline.trim() || !hasBody) return;
    setVerifiedById((current) => ({ ...current, [selectedChapter.id]: true }));
    setEditingExecutedOutline(false);
  };

  const resetSelectedOutline = () => {
    setOutlineById((current) => ({ ...current, [selectedChapter.id]: selectedChapter.outline }));
    setVerifiedById((current) => ({ ...current, [selectedChapter.id]: selectedChapter.verified }));
    setEditingExecutedOutline(false);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 p-5">
      <header className="mb-4 flex shrink-0 items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900">章纲生命周期测试</h1>
          <p className="mt-1 text-xs font-bold text-slate-400">
            测试正文生成后，章纲从待执行计划变成已执行依据、审核对象和状态同步来源的完整交互。
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-lg border border-[#08AACE]/20 bg-[#EAF9FD] px-3 py-2 text-xs font-black text-[#078FAE]">
          <ShieldCheck className="h-4 w-4" />
          正文后默认锁定章纲
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[230px_minmax(520px,1fr)_430px] gap-4">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-black text-slate-900">章节序号</div>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-500">
                {mockChapters.filter((chapter) => (outlineById[chapter.id] ?? '').trim()).length}/{mockChapters.length}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-bold text-slate-500">
              {Object.entries(stateConfig).map(([state, config]) => (
                <div key={state} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                  {config.label}
                </div>
              ))}
            </div>
          </div>

          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
            {Object.entries(groupedChapters).map(([volume, chapters]) => (
              <section key={volume} className="mb-4 last:mb-0">
                <div className="mb-2 rounded-lg bg-[#08AACE] px-3 py-2 text-sm font-black text-white">{volume}</div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(38px,max-content))] gap-2">
                  {chapters.map((chapter) => {
                    const outline = outlineById[chapter.id] ?? '';
                    const state = getLifeState(outline, chapter.body, Boolean(verifiedById[chapter.id]));
                    const config = stateConfig[state];
                    const selected = chapter.id === selectedChapter.id;
                    return (
                      <button
                        key={chapter.id}
                        type="button"
                        onClick={() => setSelected(chapter.id)}
                        title={`${chapter.serialNumber}. ${chapter.title} · ${config.label}`}
                        className={`relative h-10 min-w-10 rounded-lg border px-2 text-sm font-black transition-colors ${
                          selected
                            ? 'border-[#08AACE] bg-[#08AACE] text-white shadow-sm ring-2 ring-[#08AACE]/15'
                            : config.button
                        }`}
                      >
                        {chapter.serialNumber}
                        <span className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-white ${config.dot}`} />
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
                <h2 className="mt-1 truncate text-lg font-black text-slate-900">
                  第{selectedChapter.serialNumber}章 {selectedChapter.title}
                </h2>
              </div>
              <span className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-black ${selectedStateConfig.badge}`}>
                {selectedStateConfig.label}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs font-black">
              <div className="rounded-lg bg-slate-50 px-2 py-2 text-slate-500">
                章纲<br /><span className="text-slate-900">{countWords(selectedOutline)}字</span>
              </div>
              <div className="rounded-lg bg-slate-50 px-2 py-2 text-slate-500">
                正文<br /><span className={hasBody ? 'text-slate-900' : 'text-red-500'}>{hasBody ? `${countWords(selectedChapter.body)}字` : '无正文'}</span>
              </div>
              <div className="rounded-lg bg-slate-50 px-2 py-2 text-slate-500">
                梗概<br /><span className={selectedChapter.summary ? 'text-slate-900' : 'text-red-500'}>{selectedChapter.summary ? `${countWords(selectedChapter.summary)}字` : '无梗概'}</span>
              </div>
              <div className="rounded-lg bg-slate-50 px-2 py-2 text-slate-500">
                状态变化<br /><span className={selectedChapter.stateChange ? 'text-slate-900' : 'text-red-500'}>{selectedChapter.stateChange ? `${countWords(selectedChapter.stateChange)}字` : '待补'}</span>
              </div>
            </div>
          </div>

          {selectedState === 'abnormal' && (
            <div className="mx-5 mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-600">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              正文已存在，但缺少章纲。建议先从正文反推章纲，再进入审核。
            </div>
          )}

          {outlineReadonly && (
            <div className="mx-5 mt-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                正文已经生成，章纲默认作为已执行依据锁定。
              </span>
              <button
                type="button"
                onClick={() => setEditingExecutedOutline(true)}
                className="h-8 rounded-lg bg-white px-3 text-xs font-black text-amber-700 hover:bg-amber-100"
              >
                编辑已执行章纲
              </button>
            </div>
          )}

          <div className="min-h-0 flex-1 p-5">
            <textarea
              value={selectedOutline}
              disabled={outlineReadonly}
              onChange={(event) => {
                setOutlineById((current) => ({ ...current, [selectedChapter.id]: event.target.value }));
                setVerifiedById((current) => ({ ...current, [selectedChapter.id]: false }));
              }}
              placeholder="这里显示当前章节章纲。正文生成后默认锁定，需要点击“编辑已执行章纲”才可修改。"
              className={`editor-scrollbar h-full w-full resize-none rounded-xl border p-5 text-sm font-semibold leading-7 outline-none transition-colors ${
                outlineReadonly
                  ? 'border-slate-200 bg-slate-100 text-slate-500'
                  : 'border-slate-200 bg-slate-50 text-slate-700 focus:border-[#08AACE] focus:bg-white'
              }`}
            />
          </div>

          <footer className="grid shrink-0 grid-cols-4 gap-2 border-t border-slate-100 p-4">
            <button
              type="button"
              onClick={() => setRightPanelMode('review')}
              className={`h-9 rounded-lg text-sm font-black ${rightPanelMode === 'review' ? 'bg-[#08AACE] text-white' : 'border border-slate-200 bg-white text-slate-500'}`}
            >
              对照正文审核
            </button>
            <button
              type="button"
              onClick={() => setRightPanelMode('status')}
              className={`h-9 rounded-lg text-sm font-black ${rightPanelMode === 'status' ? 'bg-[#08AACE] text-white' : 'border border-slate-200 bg-white text-slate-500'}`}
            >
              状态同步
            </button>
            <button
              type="button"
              onClick={() => setRightPanelMode('reverse')}
              className={`h-9 rounded-lg text-sm font-black ${rightPanelMode === 'reverse' ? 'bg-[#08AACE] text-white' : 'border border-slate-200 bg-white text-slate-500'}`}
            >
              反推章纲
            </button>
            <button
              type="button"
              onClick={resetSelectedOutline}
              className="flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-500 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              重置
            </button>
          </footer>
        </section>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black text-slate-900">
                  {rightPanelMode === 'review' ? '正文对照审核' : rightPanelMode === 'status' ? '状态变化同步' : '正文反推章纲'}
                </div>
                <div className="mt-1 text-xs font-bold text-slate-400">
                  {rightPanelMode === 'review'
                    ? '判断正文是否完成章纲。'
                    : rightPanelMode === 'status'
                      ? '从计划变化到实际状态库。'
                      : '正文存在但章纲缺失时使用。'}
                </div>
              </div>
              <div className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-500">测试</div>
            </div>
          </div>

          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
            {rightPanelMode === 'review' && (
              <div className="space-y-4">
                <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                    <Link2 className="h-4 w-4 text-[#08AACE]" />
                    审核读取
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
                    <div className="rounded-lg bg-white px-2 py-2 text-slate-600">章纲<br /><span className="text-[#08AACE]">{countWords(selectedOutline)}字</span></div>
                    <div className="rounded-lg bg-white px-2 py-2 text-slate-600">正文<br /><span className="text-[#08AACE]">{countWords(selectedChapter.body)}字</span></div>
                    <div className="rounded-lg bg-white px-2 py-2 text-slate-600">状态变化<br /><span className="text-[#08AACE]">{countWords(selectedChapter.stateChange)}字</span></div>
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-3 py-2 text-sm font-black text-slate-800">审核结论预览</div>
                  <div className="space-y-3 p-3 text-sm font-semibold leading-6 text-slate-600">
                    {selectedState === 'abnormal' ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 font-black text-red-600">
                        无法审核：缺少章纲。先执行“正文反推章纲”。
                      </div>
                    ) : !hasBody ? (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 font-black text-amber-700">
                        正文尚未生成，本章仍是待执行章纲。
                      </div>
                    ) : (
                      <>
                        <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700">已完成：本章目标和主要剧情流程基本覆盖。</div>
                        <div className="rounded-lg bg-amber-50 p-3 text-amber-700">需确认：旧徽记是否被“明确识别”，正文里目前更像被试探。</div>
                        <div className="rounded-lg bg-slate-50 p-3 text-slate-600">建议：标记为轻微偏差，并把实际状态同步为“疑似被识别”。</div>
                      </>
                    )}
                  </div>
                </section>

                <button
                  type="button"
                  onClick={markVerified}
                  disabled={!selectedOutline.trim() || !hasBody}
                  className="h-10 w-full rounded-lg bg-[#08AACE] text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  标记章纲已核对
                </button>
              </div>
            )}

            {rightPanelMode === 'status' && (
              <div className="space-y-4">
                <section className="rounded-xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-3 py-2 text-sm font-black text-slate-800">计划状态变化</div>
                  <div className="whitespace-pre-wrap p-3 text-sm font-semibold leading-6 text-slate-600">
                    {selectedChapter.stateChange || '无计划状态变化。'}
                  </div>
                </section>
                <section className="rounded-xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-3 py-2 text-sm font-black text-slate-800">正文实际提取</div>
                  <div className="space-y-2 p-3 text-sm font-semibold leading-6 text-slate-600">
                    <p>人物状态：主角实际获得了下一步行动压力，但不一定已经拿到目标物。</p>
                    <p>道具状态：旧徽记被注意到，是否明确识别需要用户确认。</p>
                    <p>线索/信息：账本、旧塔或失踪案线索被推进。</p>
                  </div>
                </section>
                <section className="rounded-xl border border-[#08AACE]/20 bg-[#F0FBFE] p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-black text-[#078FAE]">
                    <Sparkles className="h-4 w-4" />
                    建议同步状态库
                  </div>
                  <div className="space-y-2 text-sm font-semibold leading-6 text-slate-600">
                    <p>只同步正文实际发生的事实。</p>
                    <p>章纲里的计划变化如果正文没有写到，保留为审核偏差，不写入状态库。</p>
                  </div>
                </section>
                <button
                  type="button"
                  className="h-10 w-full rounded-lg border border-[#08AACE]/30 bg-[#EAF9FD] text-sm font-black text-[#078FAE]"
                >
                  确认同步状态库
                </button>
              </div>
            )}

            {rightPanelMode === 'reverse' && (
              <div className="space-y-4">
                <section className="rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2">
                    <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                      <FileText className="h-4 w-4 text-[#08AACE]" />
                      正文片段
                    </div>
                    <span className="text-xs font-bold text-slate-400">{countWords(selectedChapter.body)}字</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto p-3 text-sm font-semibold leading-6 text-slate-600">
                    {selectedChapter.body || '当前章节没有正文，不能反推章纲。'}
                  </div>
                </section>
                <section className="rounded-xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-3 py-2 text-sm font-black text-slate-800">AI 反推章纲预览</div>
                  <pre className="editor-scrollbar max-h-72 whitespace-pre-wrap overflow-y-auto p-3 text-sm font-semibold leading-6 text-slate-700">
                    {reverseOutline}
                  </pre>
                </section>
                <button
                  type="button"
                  onClick={applyReverseOutline}
                  disabled={!hasBody}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#08AACE] text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {hasBody ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  填入反推章纲
                </button>
              </div>
            )}
          </div>
        </aside>
      </main>

      <footer className="mt-4 grid shrink-0 grid-cols-4 gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-500">
        <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-[#08AACE]" />章纲是写作计划</div>
        <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#08AACE]" />正文是实际结果</div>
        <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#08AACE]" />审核负责比对</div>
        <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#08AACE]" />状态库只收确认事实</div>
      </footer>
    </div>
  );
}
