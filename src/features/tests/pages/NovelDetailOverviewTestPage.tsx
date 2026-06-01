import {
  ArrowRight,
  BookOpenText,
  Check,
  FileText,
  Layers3,
  PenLine,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

type FlowId = 'outline' | 'plotChain' | 'chapterOutline' | 'writing';

type ChapterStatus = 'done' | 'draft' | 'next';

const flowSteps: Array<{ id: FlowId; label: string; status: 'done' | 'active' | 'pending' }> = [
  { id: 'outline', label: '生成大纲', status: 'done' },
  { id: 'plotChain', label: '生成剧情链', status: 'active' },
  { id: 'chapterOutline', label: '生成章纲', status: 'pending' },
  { id: 'writing', label: '生成正文', status: 'pending' },
];

const plotStages = [
  { label: '觉醒前夜', summary: '主角发现城市武考背后有资源倾斜。' },
  { label: '武考阶段', summary: '主角正在通过实战考试证明自己。' },
  { label: '武院阶段', summary: '进入顶级武院后接触更高层势力。' },
  { label: '边境战场', summary: '从学生竞争转入真正的生死战。' },
  { label: '灵气真相', summary: '追查父亲失踪和灵气复苏源头。' },
];

const settingGroups = [
  ['世界观', '12项'],
  ['角色', '18项'],
  ['势力', '7项'],
  ['剧情大纲', '11项'],
];

const chapters: Array<{ id: number; title: string; words: number; status: ChapterStatus; comment: string }> = [
  { id: 1, title: '气血不合格', words: 3120, status: 'done', comment: '开场压力清楚，主角目标明确，但金手指出现可以再压后半页。' },
  { id: 2, title: '废弃训练垫', words: 2980, status: 'done', comment: '能力发现比较自然，适合补一段同学对照，强化读者期待。' },
  { id: 3, title: '最差考场', words: 3260, status: 'done', comment: '冲突够强，监考老师的动机还可以再埋一个细节。' },
  { id: 4, title: '第一次回收', words: 2850, status: 'done', comment: '爽点明确，建议把能力代价写得更清楚，避免显得太轻松。' },
  { id: 5, title: '夜训任务', words: 0, status: 'next', comment: '下一章建议承接第4章能力代价，让主角主动选择更危险的夜训任务。' },
];

function flowButtonClass(active: boolean, done: boolean) {
  if (active) return 'border-[#08AACE] bg-[#EAF9FD] text-[#08AACE]';
  if (done) return 'border-slate-200 bg-white text-slate-900';
  return 'border-slate-200 bg-white text-slate-400';
}

function statusLabel(status: ChapterStatus) {
  if (status === 'done') return '已写完';
  if (status === 'next') return '待写';
  return '草稿';
}

export function NovelDetailOverviewTestPage() {
  const [activeFlow, setActiveFlow] = useState<FlowId>('plotChain');
  const [selectedChapterId, setSelectedChapterId] = useState(5);
  const selectedChapter = chapters.find((chapter) => chapter.id === selectedChapterId) ?? chapters[0];

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 p-5">
      <header className="mb-4 shrink-0">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-black text-[#08AACE]">09号测试</div>
            <h1 className="mt-1 text-2xl font-black text-slate-950">作品详情总览页测试</h1>
          </div>
          <button className="h-10 rounded-xl bg-[#08AACE] px-5 text-sm font-black text-white shadow-sm">
            进入正文编辑器
          </button>
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_520px] gap-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-black text-slate-950">星火武考</h2>
                  <span className="rounded-full bg-[#EAF9FD] px-3 py-1 text-xs font-black text-[#08AACE]">都市高武</span>
                  <span className="rounded-full bg-[#FFF7ED] px-3 py-1 text-xs font-black text-[#C56A00]">系统流</span>
                </div>
                <p className="mt-3 max-w-4xl text-sm font-medium leading-6 text-slate-600">
                  灵气复苏三十年后，底层少年林刻在武考前觉醒“战后回收”能力，能从失败、残痕和战场余温里提炼经验。
                </p>
              </div>
              <div className="grid shrink-0 grid-cols-3 gap-2 text-center">
                {[
                  ['总字数', '2.36万'],
                  ['已写章节', '4章'],
                  ['设定数量', '48项'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="text-lg font-black text-slate-950">{value}</div>
                    <div className="mt-0.5 text-[11px] font-bold text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                <Target className="h-4 w-4 text-[#08AACE]" />
                作品主线
              </div>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                主角目标：从底层城区考入顶级武院，查清父亲失踪和灵气异变的关系，并在被资源垄断的武道体系里夺回上升通道。
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 text-sm font-black text-slate-950">流程顺序</div>
            <div className="grid grid-cols-4 gap-2">
              {flowSteps.map((step, index) => {
                const active = activeFlow === step.id;
                const done = step.status === 'done';
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveFlow(step.id)}
                    className={`h-16 rounded-xl border px-3 text-left transition-colors ${flowButtonClass(active, done)}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-xs font-black shadow-sm">
                        {done ? <Check className="h-4 w-4" /> : index + 1}
                      </span>
                      {index < flowSteps.length - 1 && <ArrowRight className="h-4 w-4 opacity-50" />}
                    </div>
                    <div className="mt-1 truncate text-sm font-black">{step.label}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 rounded-lg bg-[#FFF7ED] px-3 py-2 text-xs font-bold leading-5 text-[#9A4B00]">
              当前建议：剧情链已经到武考阶段，下一步先确定第5章剧情点，再生成第5章章纲。
            </div>
          </section>
        </div>
      </header>

      <main className="editor-scrollbar min-h-0 flex-1 overflow-auto">
        <div className="grid min-w-[1180px] grid-cols-4 gap-4 pb-2">
          <section className={`rounded-xl border bg-white p-4 shadow-sm ${activeFlow === 'outline' ? 'border-[#08AACE]' : 'border-slate-200'}`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BookOpenText className="h-5 w-5 text-[#08AACE]" />
                <h3 className="text-lg font-black text-slate-950">大纲区</h3>
              </div>
              <button onClick={() => setActiveFlow('outline')} className="h-8 rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white">
                生成大纲
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                ['设定字数', '2.48万'],
                ['设定数量', '48项'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xl font-black text-slate-950">{value}</div>
                  <div className="mt-1 text-xs font-bold text-slate-400">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              {settingGroups.map(([label, count]) => (
                <div key={label} className="flex h-10 items-center justify-between rounded-lg border border-slate-100 px-3 text-sm font-black">
                  <span className="text-slate-700">{label}</span>
                  <span className="text-[#08AACE]">{count}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-black text-slate-400">最近更新</div>
              <p className="mt-1 text-sm font-bold leading-6 text-slate-700">新增“武考资源垄断”和“战后回收能力代价”两项设定。</p>
            </div>
          </section>

          <section className={`rounded-xl border bg-white p-4 shadow-sm ${activeFlow === 'plotChain' ? 'border-[#08AACE]' : 'border-slate-200'}`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers3 className="h-5 w-5 text-[#08AACE]" />
                <h3 className="text-lg font-black text-slate-950">剧情链区</h3>
              </div>
              <button onClick={() => setActiveFlow('plotChain')} className="h-8 rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white">
                生成剧情链
              </button>
            </div>

            <div className="mb-4 rounded-lg bg-[#EAF9FD] p-3">
              <div className="text-xs font-black text-[#08AACE]">当前阶段</div>
              <div className="mt-1 text-xl font-black text-slate-950">武考阶段</div>
              <p className="mt-1 text-xs font-bold leading-5 text-slate-600">已选剧情点 4 个，正在衔接第5章。</p>
            </div>

            <div className="space-y-3">
              {plotStages.map((stage, index) => {
                const active = stage.label === '武考阶段';
                const passed = index === 0;
                return (
                  <div key={stage.label} className="grid grid-cols-[22px_minmax(0,1fr)] gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`mt-1 grid h-5 w-5 place-items-center rounded-full border text-[10px] font-black ${active ? 'border-[#08AACE] bg-[#08AACE] text-white' : passed ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-300'}`}>
                        {passed ? <Check className="h-3 w-3" /> : index + 1}
                      </span>
                      {index < plotStages.length - 1 && <span className={`mt-1 h-8 w-px ${passed || active ? 'bg-[#08AACE]' : 'bg-slate-200'}`} />}
                    </div>
                    <div className={`rounded-lg border px-3 py-2 ${active ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-100 bg-white'}`}>
                      <div className="text-sm font-black text-slate-950">{stage.label}</div>
                      <div className="mt-1 text-xs font-bold leading-5 text-slate-500">{stage.summary}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={`rounded-xl border bg-white p-4 shadow-sm ${activeFlow === 'chapterOutline' ? 'border-[#08AACE]' : 'border-slate-200'}`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#08AACE]" />
                <h3 className="text-lg font-black text-slate-950">章纲区</h3>
              </div>
              <button onClick={() => setActiveFlow('chapterOutline')} className="h-8 rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white">
                生成章纲
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                ['章纲', '12章'],
                ['正文', '4章'],
                ['待写', '8章'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-3 text-center">
                  <div className="text-lg font-black text-slate-950">{value}</div>
                  <div className="mt-1 text-xs font-bold text-slate-400">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-950">
                <TrendingUp className="h-4 w-4 text-[#08AACE]" />
                章纲进度
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[60%] rounded-full bg-[#08AACE]" />
              </div>
              <div className="mt-2 flex justify-between text-xs font-bold text-slate-400">
                <span>已生成 12章</span>
                <span>正文追到第4章</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {['第5章：夜训任务', '第6章：黑街实战', '第7章：资源争夺'].map((item, index) => (
                <div key={item} className={`rounded-lg border px-3 py-2 ${index === 0 ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-100 bg-white'}`}>
                  <div className="truncate text-sm font-black text-slate-950">{item}</div>
                  <div className="mt-1 text-xs font-bold text-slate-400">{index === 0 ? '下一章优先生成正文' : '已有章纲，未写正文'}</div>
                </div>
              ))}
            </div>
          </section>

          <section className={`rounded-xl border bg-white p-4 shadow-sm ${activeFlow === 'writing' ? 'border-[#08AACE]' : 'border-slate-200'}`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <PenLine className="h-5 w-5 text-[#08AACE]" />
                <h3 className="text-lg font-black text-slate-950">正文区</h3>
              </div>
              <button onClick={() => setActiveFlow('writing')} className="h-8 rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white">
                生成正文
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                ['正文章节', '4章'],
                ['正文字数', '1.22万'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xl font-black text-slate-950">{value}</div>
                  <div className="mt-1 text-xs font-bold text-slate-400">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              {chapters.map((chapter) => {
                const selected = chapter.id === selectedChapterId;
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => setSelectedChapterId(chapter.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${selected ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-100 bg-white hover:border-[#08AACE]/40'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-black text-slate-950">第{chapter.id}章 {chapter.title}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black ${chapter.status === 'next' ? 'bg-[#FFF7ED] text-[#C56A00]' : 'bg-slate-100 text-slate-500'}`}>
                        {statusLabel(chapter.status)}
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-400">{chapter.words > 0 ? `${chapter.words}字` : '未写正文'}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-black text-slate-400">章节点评</div>
              <div className="mt-1 text-sm font-black text-slate-950">第{selectedChapter.id}章：{selectedChapter.title}</div>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-700">{selectedChapter.comment}</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default NovelDetailOverviewTestPage;
