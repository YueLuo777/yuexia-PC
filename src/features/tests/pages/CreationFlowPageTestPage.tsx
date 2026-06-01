import { ArrowRight, BookOpenText, Check, FileText, Layers3, MessageSquareText, PenLine, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

type FlowId = 'brainstorm' | 'outline' | 'plotChain' | 'chapterOutline' | 'writing';

type FlowStep = {
  id: FlowId;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
};

const flowSteps: FlowStep[] = [
  { id: 'brainstorm', number: 1, title: '生成脑洞', shortTitle: '脑洞', description: '先确定题材、卖点和开书方向。' },
  { id: 'outline', number: 2, title: '生成大纲', shortTitle: '大纲', description: '把脑洞整理成设定、主线和分卷。' },
  { id: 'plotChain', number: 3, title: '生成剧情链', shortTitle: '剧情链', description: '生成同一进度的剧情候选，并选出后续走向。' },
  { id: 'chapterOutline', number: 4, title: '生成章纲', shortTitle: '章纲', description: '把选中的剧情链展开成当前章结构。' },
  { id: 'writing', number: 5, title: '续写正文', shortTitle: '正文', description: '根据章纲、上下文和设定写出正文。' },
];

const flowContent: Record<FlowId, {
  icon: typeof Sparkles;
  leftTitle: string;
  centerTitle: string;
  rightTitle: string;
  previewTitle: string;
  preview: string[];
  list: string[];
  inputPlaceholder: string;
}> = {
  brainstorm: {
    icon: Sparkles,
    leftTitle: '脑洞列表',
    centerTitle: '脑洞预览',
    rightTitle: '脑洞生成',
    previewTitle: '都市高武开书脑洞',
    preview: [
      '灵气复苏三十年后，高考不只考文化课，还考气血、反应和实战。',
      '主角原本气血平平，却能回收战斗现场残留的武道经验，把别人的失败变成自己的成长资源。',
      '开局重点不是直接无敌，而是让读者看到“底层少年有办法追上来”。',
    ],
    list: ['都市高武', '玄幻废柴流', '仙侠凡人流', '科幻遗迹流'],
    inputPlaceholder: '输入题材、主题、金手指要求',
  },
  outline: {
    icon: BookOpenText,
    leftTitle: '设定目录',
    centerTitle: '大纲预览',
    rightTitle: '大纲生成',
    previewTitle: '第一卷：武考前夜',
    preview: [
      '世界规则：灵气复苏后，武道资源被学校、财团和军部共同掌控。',
      '主线目标：主角从底层城市考入顶级武院，逐步查清父亲失踪和灵气异变的关系。',
      '第一卷节奏：觉醒能力、进入武考、第一次公开证明自己。',
    ],
    list: ['世界观', '主角设定', '势力设定', '剧情大纲'],
    inputPlaceholder: '输入大纲生成要求',
  },
  plotChain: {
    icon: Layers3,
    leftTitle: '剧情链',
    centerTitle: '剧情点候选',
    rightTitle: '剧情链生成',
    previewTitle: '同一进度候选',
    preview: [
      '候选 1：主角在武考体测被判气血不足，却发现测试场地残留着上一批考生失败后的经验碎片。',
      '候选 2：主角被安排到最差考场，意外看见监考老师故意压低底层学生成绩。',
      '候选 3：主角为了保住报名资格，必须在当天夜里完成一次危险的街区实战任务。',
    ],
    list: ['剧情链 1', '剧情链 2', '剧情链 3'],
    inputPlaceholder: '输入剧情点生成要求',
  },
  chapterOutline: {
    icon: FileText,
    leftTitle: '章节目录',
    centerTitle: '章纲预览',
    rightTitle: '章纲生成',
    previewTitle: '第1章章纲（第一卷）',
    preview: [
      '开场：主角在体测大厅排队，周围同学讨论武考名额和资源差距。',
      '冲突：测试结果显示气血不足，老师建议他放弃实战科。',
      '转折：主角在废弃训练垫上触碰到残留经验，第一次感知到回收能力。',
      '收尾：他决定不退考，反而申请进入难度最高的实战考场。',
    ],
    list: ['第1章', '第2章', '第3章', '第4章'],
    inputPlaceholder: '输入章纲生成要求',
  },
  writing: {
    icon: PenLine,
    leftTitle: '作品目录',
    centerTitle: '正文编辑器',
    rightTitle: 'AI续写',
    previewTitle: '第1章：气血不合格',
    preview: [
      '体测大厅里，电子屏一遍遍刷新着考生编号。',
      '林刻站在队伍最后，掌心贴着那张被汗水浸软的准考证，听见前方传来一阵压低的笑声。',
      '“气血 0.7，也敢报名实战科？”',
      '他没有抬头，只是看向角落里那块破旧训练垫。那里有一点微弱的光，像某种失败后留下的余温。',
    ],
    list: ['第一卷', '第1章', '第2章', '回收站'],
    inputPlaceholder: '输入正文续写要求',
  },
};

function stepClass(active: boolean, completed: boolean) {
  if (active) return 'border-[#08AACE] bg-[#EAF9FD] text-[#08AACE]';
  if (completed) return 'border-slate-200 bg-white text-slate-800';
  return 'border-slate-200 bg-white text-slate-400';
}

export function CreationFlowPageTestPage() {
  const [activeFlow, setActiveFlow] = useState<FlowId>('outline');
  const activeIndex = flowSteps.findIndex((step) => step.id === activeFlow);
  const activeStep = flowSteps[activeIndex] ?? flowSteps[0];
  const content = flowContent[activeStep.id];
  const Icon = content.icon;

  const inheritedContext = useMemo(() => {
    if (activeFlow === 'brainstorm') return ['空白开书', '用户要求'];
    if (activeFlow === 'outline') return ['已选脑洞', '用户要求'];
    if (activeFlow === 'plotChain') return ['大纲设定', '已选脑洞'];
    if (activeFlow === 'chapterOutline') return ['大纲设定', '已选剧情链', '前文章纲'];
    return ['当前章纲', '上下文', '关联设定'];
  }, [activeFlow]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 p-5">
      <header className="mb-4 shrink-0">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-black text-[#08AACE]">08号测试</div>
            <h1 className="mt-1 text-2xl font-black text-slate-950">创作流程页面化测试</h1>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm">
            当前：{activeStep.title}
          </div>
        </div>

        <div className="mt-4 rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="mb-2 text-xs font-black text-slate-500">创作流程</div>
          <div className="grid grid-cols-5 gap-2">
            {flowSteps.map((step, index) => {
              const active = step.id === activeFlow;
              const completed = index < activeIndex;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveFlow(step.id)}
                  className={`flex h-14 items-center gap-3 rounded-2xl border px-3 text-left transition-colors ${stepClass(active, completed)}`}
                >
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black ${active ? 'bg-[#08AACE] text-white' : completed ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {completed ? <Check className="h-4 w-4" /> : step.number}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black">{step.shortTitle}</span>
                    <span className="mt-0.5 block truncate text-[11px] font-bold opacity-70">{step.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)_350px] gap-5 overflow-hidden">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-5">
            <div className="text-sm font-black text-slate-950">{content.leftTitle}</div>
            <button className="rounded-xl bg-[#EAF9FD] px-3 py-1 text-xs font-black text-[#08AACE]">新增</button>
          </div>
          <div className="editor-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {content.list.map((item, index) => (
              <button
                key={item}
                type="button"
                className={`flex h-12 w-full items-center justify-between rounded-xl border px-3 text-left text-sm font-black ${
                  index === 0 ? 'border-[#08AACE] bg-[#EAF9FD] text-[#08AACE]' : 'border-slate-100 bg-white text-slate-500 hover:border-[#08AACE]/40'
                }`}
              >
                <span className="truncate">{item}</span>
                {index === 0 && <ArrowRight className="h-4 w-4" />}
              </button>
            ))}
          </div>
          <div className="border-t border-slate-100 bg-slate-50 p-4 text-xs font-bold leading-5 text-slate-500">
            页面化后，左侧列表不会被弹窗尺寸挤压，也不用反复拖动弹窗。
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-5">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-[#08AACE]" />
              <div className="text-sm font-black text-slate-950">{content.centerTitle}</div>
            </div>
            <div className="text-xs font-black text-slate-400">页面，不是弹窗</div>
          </div>
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
            <div className="rounded-[28px] border-2 border-slate-900 bg-white p-6">
              <div className="-mt-9 mb-5 w-fit bg-white px-3 text-base font-black text-slate-900">{content.previewTitle}</div>
              <div className="space-y-4 text-base font-medium leading-8 text-slate-900">
                {content.preview.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {inheritedContext.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs font-black text-slate-400">自动继承</div>
                  <div className="mt-1 text-sm font-black text-slate-900">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-5">
            <div className="text-sm font-black text-slate-950">{content.rightTitle}</div>
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-700">输出日志</button>
          </div>

          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-[#08AACE] bg-white p-3">
                <div className="-mt-6 w-fit bg-white px-2 text-xs font-black text-[#08AACE]">模型</div>
                <div className="mt-1 truncate text-sm font-black text-slate-950">DeepSeek V3</div>
              </div>
              <div className="rounded-2xl border-2 border-[#08AACE] bg-white p-3">
                <div className="-mt-6 w-fit bg-white px-2 text-xs font-black text-[#08AACE]">提示词</div>
                <div className="mt-1 truncate text-sm font-black text-slate-950">{activeStep.shortTitle}默认提示词</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-950">
                  <MessageSquareText className="h-4 w-4 text-[#08AACE]" />
                  用户输入
                </div>
                <textarea
                  className="h-32 w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold leading-6 text-slate-700 outline-none focus:border-[#08AACE]"
                  placeholder={content.inputPlaceholder}
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-100 bg-white p-5">
            <button className="h-11 w-full rounded-2xl bg-[#08AACE] text-sm font-black text-white shadow-lg shadow-cyan-200">
              {activeStep.title}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default CreationFlowPageTestPage;
