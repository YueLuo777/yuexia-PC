import {
  AlertTriangle,
  BookOpen,
  Check,
  ClipboardList,
  FileText,
  Layers,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

type FlowStepId = 'idea' | 'outline' | 'detailOutline' | 'body' | 'review' | 'update' | 'publish';
type UpdateItemType = '人物' | '道具' | '设定' | '状态' | '关系';

type FlowStep = {
  id: FlowStepId;
  title: string;
  role: string;
  output: string;
  primaryAction: string;
};

type UpdateItem = {
  id: string;
  type: UpdateItemType;
  title: string;
  source: string;
  reason: string;
  target: string;
  suggestion: string;
  strict?: boolean;
};

const flowSteps: FlowStep[] = [
  {
    id: 'idea',
    title: '脑洞',
    role: '收集灵感和题材，只负责产生可能性。',
    output: '可采用的核心创意',
    primaryAction: '采用为大纲素材',
  },
  {
    id: 'outline',
    title: '大纲',
    role: '建立正式规则库，包括世界观、人物、道具、势力、禁写规则。',
    output: '正式设定库',
    primaryAction: '生成章纲',
  },
  {
    id: 'detailOutline',
    title: '章纲',
    role: '直接从大纲生成章节执行稿，不再经过剧情点步骤。',
    output: '结构化章纲 + 状态契约',
    primaryAction: '送去正文',
  },
  {
    id: 'body',
    title: '正文',
    role: '根据章纲、状态契约和必要资料生成可读正文。',
    output: '章节正文',
    primaryAction: '进入审核',
  },
  {
    id: 'review',
    title: '审核',
    role: '检查正文是否符合章纲、状态契约和正式设定。',
    output: '通过 / 打回 / 待更新',
    primaryAction: '生成更新项',
  },
  {
    id: 'update',
    title: '更新',
    role: '统一处理新增人物、道具、设定、关系和状态同步。',
    output: '已确认变更 + 状态库事实',
    primaryAction: '确认更新',
  },
  {
    id: 'publish',
    title: '发布',
    role: '检查章节完整性、设定一致性、格式和可发布状态。',
    output: '可发布正文',
    primaryAction: '导出发布版',
  },
];

const updateItems: UpdateItem[] = [
  {
    id: 'role-apothecary',
    type: '人物',
    title: '黑市药铺老板',
    source: '第2章章纲',
    reason: '章纲中出现关键交易对象，但人物设定库没有记录。',
    target: '人物设定 / 配角',
    suggestion: '身份：黑市药铺老板；作用：旧案线索提供者；立场：交易优先，疑似认识主角家族旧徽记。',
    strict: true,
  },
  {
    id: 'item-badge',
    type: '道具',
    title: '旧徽记',
    source: '第2章正文审核',
    reason: '正文中多次触发识别与试探，但道具设定缺少归属、能力和暴露程度。',
    target: '道具设定',
    suggestion: '旧徽记属于主角家族遗物，可被黑市部分人识别；当前状态为被药铺老板注意，未公开暴露。',
    strict: true,
  },
  {
    id: 'state-ledger',
    type: '状态',
    title: '城防军账本成为下一章目标',
    source: '第2章正文',
    reason: '正文实际发生的任务目标，需要同步到正式状态库，供下一章读取。',
    target: '状态库 / 线索信息',
    suggestion: '主角确认城防军账本与旧案有关，下一步行动目标为取回账本。',
  },
  {
    id: 'relation-trade',
    type: '关系',
    title: '主角与药铺老板临时交易',
    source: '第2章审核',
    reason: '关系变化影响后续剧情，但关系库没有该条记录。',
    target: '关系状态',
    suggestion: '主角和药铺老板互不信任，但形成临时交易关系；老板掌握旧案线索。',
  },
  {
    id: 'rule-recognition',
    type: '设定',
    title: '黑市能识别旧家族标记',
    source: '第2章章纲缺口检查',
    reason: '这是世界规则，不应只留在单章章纲里。',
    target: '大纲设定 / 世界规则',
    suggestion: '黑市部分老资格人物能识别旧家族标记，但不会公开说明，以免牵连旧案。',
    strict: true,
  },
];

const updateTypeClass: Record<UpdateItemType, string> = {
  人物: 'border-blue-200 bg-blue-50 text-blue-700',
  道具: 'border-violet-200 bg-violet-50 text-violet-700',
  设定: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  状态: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  关系: 'border-amber-200 bg-amber-50 text-amber-700',
};

const actionRules = [
  ['大纲直接到章纲', '取消剧情点作为正式步骤；章纲直接读取大纲设定、人物设定、必要前文。'],
  ['更新替代状态', '顶部流程中的“状态”改名为“更新”，职责扩大为设定补充 + 状态同步。'],
  ['AI 只能提建议', '新增人物、道具、设定、关系和状态都先进入更新，不自动写入正式库。'],
  ['硬性不匹配打回', '身份、道具归属、秘密暴露、任务目标等硬性状态不匹配时，审核默认打回。'],
  ['用户确认后入库', '更新项可选择补充到设定、标记临时、忽略、打回正文或修改后同步。'],
];

function getStepTone(stepId: FlowStepId, activeStep: FlowStepId) {
  if (stepId === activeStep) return 'border-[#08AACE] bg-[#08AACE] text-white shadow-sm';
  if (stepId === 'update') return 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100';
  return 'border-slate-200 bg-white text-slate-600 hover:border-[#08AACE]/40 hover:bg-[#F0FBFE]';
}

export function NoPlotPointCreationLoopTestPage() {
  const [activeStep, setActiveStep] = useState<FlowStepId>('update');
  const [selectedItemId, setSelectedItemId] = useState(updateItems[0].id);
  const [strictMode, setStrictMode] = useState(true);
  const activeStepData = flowSteps.find((step) => step.id === activeStep) ?? flowSteps[0];
  const selectedItem = updateItems.find((item) => item.id === selectedItemId) ?? updateItems[0];
  const strictCount = updateItems.filter((item) => item.strict).length;

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 p-5">
      <header className="mb-4 flex shrink-0 items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900">无剧情点创作闭环测试</h1>
          <p className="mt-1 text-xs font-bold text-slate-400">
            对照新流程：大纲直接生成章纲，状态改为更新，新增设定和状态同步统一在更新里确认。
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStrictMode((value) => !value)}
          className={`flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-xs font-black ${
            strictMode
              ? 'border-red-200 bg-red-50 text-red-600'
              : 'border-slate-200 bg-white text-slate-500'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          {strictMode ? '严格更新审核' : '普通更新审核'}
        </button>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[280px_minmax(520px,1fr)_430px] gap-4">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 px-4 py-3">
            <div className="text-sm font-black text-slate-900">正式流程</div>
            <div className="mt-1 text-xs font-bold text-slate-400">已移除“剧情点”步骤。</div>
          </div>
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {flowSteps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${getStepTone(step.id, activeStep)}`}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/80 text-xs font-black text-slate-600">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black">{step.title}</span>
                    <span className={`mt-1 block truncate text-xs font-bold ${step.id === activeStep ? 'text-white/80' : 'text-slate-400'}`}>
                      {step.output}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
              <div className="flex items-center gap-2 text-sm font-black text-red-600">
                <AlertTriangle className="h-4 w-4" />
                删除的正式步骤
              </div>
              <p className="mt-2 text-xs font-semibold leading-5 text-red-500">
                剧情点不再出现在正式创作流程中；如果以后需要保留，只作为测试或隐藏工具，不参与主路径。
              </p>
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-black text-[#08AACE]">当前对照</div>
                <h2 className="mt-1 truncate text-lg font-black text-slate-900">{activeStepData.title}</h2>
              </div>
              <span className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">
                {activeStepData.primaryAction}
              </span>
            </div>
          </div>

          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
            <section className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-900">
                <BookOpen className="h-4 w-4 text-[#08AACE]" />
                页面职责
              </div>
              <p className="text-sm font-semibold leading-7 text-slate-600">{activeStepData.role}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white p-3">
                  <div className="text-xs font-bold text-slate-400">产物</div>
                  <div className="mt-1 text-sm font-black text-slate-800">{activeStepData.output}</div>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <div className="text-xs font-bold text-slate-400">主按钮</div>
                  <div className="mt-1 text-sm font-black text-[#078FAE]">{activeStepData.primaryAction}</div>
                </div>
              </div>
            </section>

            <section className="mb-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <Layers className="h-4 w-4 text-[#08AACE]" />
                  大纲到发布闭环
                </div>
                <span className="text-xs font-bold text-slate-400">无剧情点版</span>
              </div>
              <div className="grid grid-cols-7 gap-2 p-4">
                {flowSteps.map((step, index) => (
                  <div key={step.id} className="min-w-0">
                    <button
                      type="button"
                      onClick={() => setActiveStep(step.id)}
                      className={`h-16 w-full rounded-lg border px-2 text-xs font-black transition-colors ${getStepTone(step.id, activeStep)}`}
                    >
                      {step.title}
                    </button>
                    {index < flowSteps.length - 1 && (
                      <div className="mx-auto mt-2 h-1 w-full rounded-full bg-slate-200" />
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-900">实施规则</div>
              <div className="divide-y divide-slate-100">
                {actionRules.map(([title, desc]) => (
                  <div key={title} className="flex gap-3 px-4 py-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#08AACE]" />
                    <div className="min-w-0">
                      <div className="text-sm font-black text-slate-800">{title}</div>
                      <div className="mt-1 text-xs font-semibold leading-5 text-slate-500">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black text-slate-900">更新中心</div>
                <div className="mt-1 text-xs font-bold text-slate-400">替代原“状态”页。</div>
              </div>
              <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">
                {updateItems.length} 项待处理
              </span>
            </div>
          </div>

          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
            <section className="mb-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-xs font-black text-slate-500">
                  <ClipboardList className="h-4 w-4 text-[#08AACE]" />
                  更新项
                </div>
                <div className="mt-1 text-xl font-black text-slate-900">{updateItems.length}</div>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                <div className="flex items-center gap-2 text-xs font-black text-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  硬性项
                </div>
                <div className="mt-1 text-xl font-black text-red-600">{strictCount}</div>
              </div>
            </section>

            <section className="mb-4 space-y-2">
              {updateItems.map((item) => {
                const selected = item.id === selectedItem.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedItemId(item.id)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      selected ? 'border-[#08AACE] bg-[#F0FBFE] ring-2 ring-[#08AACE]/10' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className={`rounded-md border px-2 py-0.5 text-[11px] font-black ${updateTypeClass[item.type]}`}>{item.type}</span>
                      {item.strict && <span className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-black text-red-500">硬性</span>}
                    </div>
                    <div className="line-clamp-1 text-sm font-black text-slate-800">{item.title}</div>
                    <div className="mt-1 line-clamp-1 text-xs font-bold text-slate-400">{item.source}</div>
                  </button>
                );
              })}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-black text-slate-900">{selectedItem.title}</div>
                  <span className={`rounded-md border px-2 py-0.5 text-xs font-black ${updateTypeClass[selectedItem.type]}`}>
                    {selectedItem.type}
                  </span>
                </div>
                <div className="mt-1 text-xs font-bold text-slate-400">{selectedItem.source}</div>
              </div>
              <div className="space-y-3 p-3 text-sm font-semibold leading-6 text-slate-600">
                <div>
                  <div className="text-xs font-black text-slate-400">原因</div>
                  <p>{selectedItem.reason}</p>
                </div>
                <div>
                  <div className="text-xs font-black text-slate-400">目标位置</div>
                  <p>{selectedItem.target}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="mb-1 text-xs font-black text-slate-400">建议写入内容</div>
                  <p>{selectedItem.suggestion}</p>
                </div>
              </div>
            </section>
          </div>

          <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-slate-100 p-4">
            <button type="button" className="flex h-9 items-center justify-center gap-1 rounded-lg bg-[#08AACE] text-sm font-black text-white">
              <RefreshCw className="h-4 w-4" />
              确认更新
            </button>
            <button type="button" className="flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-500">
              <Send className="h-4 w-4" />
              打回正文
            </button>
            <button type="button" className="h-9 rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-500">标记临时</button>
            <button type="button" className="h-9 rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-500">忽略一次</button>
          </footer>
        </aside>
      </main>

      <footer className="mt-4 grid shrink-0 grid-cols-4 gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-500">
        <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#08AACE]" />AI 生成建议</div>
        <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#08AACE]" />审核发现缺口</div>
        <div className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-[#08AACE]" />更新确认入库</div>
        <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-[#08AACE]" />发布读取正式库</div>
      </footer>
    </div>
  );
}
