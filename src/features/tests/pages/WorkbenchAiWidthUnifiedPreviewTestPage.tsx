import { Bot, Check, ChevronDown, Copy, FileText, RefreshCw, Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';

type FlowKey = 'brainstorm' | 'setting' | 'chapterOutline' | 'writing' | 'audit' | 'polish' | 'comment' | 'status' | 'summary';

type FlowPreview = {
  key: FlowKey;
  title: string;
  subtitle: string;
  rightTitle: string;
  outputLabel: string;
  placeholder: string;
  primaryAction: string;
  secondaryAction: string;
  accent: string;
};

const flowPreviews: FlowPreview[] = [
  {
    key: 'brainstorm',
    title: '脑洞',
    subtitle: '题材、背景、金手指和卖点问题区',
    rightTitle: '脑洞生成',
    outputLabel: '脑洞输出',
    placeholder: '输入脑洞要求',
    primaryAction: '生成脑洞',
    secondaryAction: '放入脑洞',
    accent: '#08AACE',
  },
  {
    key: 'setting',
    title: '设定',
    subtitle: '作品设定、人物设定和状态设定编辑区',
    rightTitle: '设定生成',
    outputLabel: '设定输出',
    placeholder: '输入设定要求',
    primaryAction: '生成设定',
    secondaryAction: '智能导入',
    accent: '#0EA5E9',
  },
  {
    key: 'chapterOutline',
    title: '章纲',
    subtitle: '章节目录、章纲正文和状态变化',
    rightTitle: '章纲生成',
    outputLabel: '章纲预览',
    placeholder: '输入本章要求',
    primaryAction: '生成章纲',
    secondaryAction: '替换章纲',
    accent: '#08AACE',
  },
  {
    key: 'writing',
    title: '正文',
    subtitle: '章节目录、正文编辑器和右侧对话 AI',
    rightTitle: '正文 AI',
    outputLabel: '对话内容',
    placeholder: '输入要求',
    primaryAction: '替换正文',
    secondaryAction: '复制内容',
    accent: '#06B6D4',
  },
  {
    key: 'audit',
    title: '剧情审核',
    subtitle: '左侧章节、原文预览、审核结果',
    rightTitle: '审核参数',
    outputLabel: '审核输出',
    placeholder: '输入审核要求',
    primaryAction: '开始审核',
    secondaryAction: '复制审核',
    accent: '#0F9FBF',
  },
  {
    key: 'polish',
    title: '文笔润色',
    subtitle: '原文与润色后内容并排预览',
    rightTitle: '润色参数',
    outputLabel: '润色后内容',
    placeholder: '输入润色要求',
    primaryAction: '开始润色',
    secondaryAction: '替换正文',
    accent: '#10B981',
  },
  {
    key: 'comment',
    title: '综合点评',
    subtitle: '正文质量、剧情结构和表达综合评价',
    rightTitle: '点评参数',
    outputLabel: '点评输出',
    placeholder: '输入点评要求',
    primaryAction: '开始点评',
    secondaryAction: '复制点评',
    accent: '#6366F1',
  },
  {
    key: 'status',
    title: '更新状态',
    subtitle: '前文预览、状态目标和新状态草稿',
    rightTitle: '状态更新',
    outputLabel: '新的状态',
    placeholder: '输入状态更新要求',
    primaryAction: '生成状态',
    secondaryAction: '保存状态',
    accent: '#14B8A6',
  },
  {
    key: 'summary',
    title: '生成梗概',
    subtitle: '章节梗概、卷梗概和 AI 梗概输出',
    rightTitle: '梗概生成',
    outputLabel: '梗概输出',
    placeholder: '输入梗概要求',
    primaryAction: '生成梗概',
    secondaryAction: '保存梗概',
    accent: '#08AACE',
  },
];

const sampleLines = [
  '第一段：主角在废弃药园发现异常灵泉，意识到祖传玉牌能吸收灵气。',
  '第二段：执事突然靠近，主角隐藏玉牌，只承认自己发现了地下水脉。',
  '第三段：本章保留秘密资源，为后续修炼和宗门冲突埋下钩子。',
];

function FlowButton({ flow, active, onClick }: { flow: FlowPreview; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'h-10 whitespace-nowrap rounded-xl border px-4 text-sm font-black transition-colors',
        active
          ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078fb0] shadow-sm'
          : 'border-slate-200 bg-white text-slate-600 hover:border-[#9BEFFC] hover:text-[#078fb0]',
      ].join(' ')}
    >
      {flow.title}
    </button>
  );
}

function AiConfigRow() {
  return (
    <div className="relative pt-3">
      <div className="grid h-11 min-w-0 grid-cols-2 overflow-visible rounded-xl border-2 border-[#08AACE] bg-white shadow-[0_8px_18px_rgba(8,170,206,0.08)]">
        <div className="relative min-w-0 border-r border-[#08AACE]/25">
          <span className="xy-border-embedded-transparent-backplate absolute left-3 top-0 z-10 -translate-y-1/2 font-black leading-none text-[#08AACE]">模型</span>
          <button type="button" className="grid h-full w-full min-w-0 grid-cols-[minmax(0,1fr)_24px] items-center rounded-l-[10px] text-left">
            <span className="min-w-0 truncate pl-4 pr-1 text-sm font-black text-slate-800">deepseek</span>
            <ChevronDown className="h-4 w-4 text-[#08AACE]" />
          </button>
          <Settings className="xy-border-embedded-transparent-backplate absolute right-7 top-0 z-10 h-5 w-5 -translate-y-1/2 rounded-full p-0.5 text-[#08AACE]" />
        </div>
        <div className="relative min-w-0">
          <span className="xy-border-embedded-transparent-backplate absolute left-3 top-0 z-10 -translate-y-1/2 font-black leading-none text-[#08AACE]">提示词</span>
          <button type="button" className="grid h-full w-full min-w-0 grid-cols-[minmax(0,1fr)_24px] items-center rounded-r-[10px] text-left">
            <span className="min-w-0 truncate pl-4 pr-1 text-sm font-black text-slate-800">结构审核提示词</span>
            <ChevronDown className="h-4 w-4 text-[#08AACE]" />
          </button>
          <Settings className="xy-border-embedded-transparent-backplate absolute right-7 top-0 z-10 h-5 w-5 -translate-y-1/2 rounded-full p-0.5 text-[#08AACE]" />
        </div>
      </div>
    </div>
  );
}

function RightAiPanel({ flow }: { flow: FlowPreview }) {
  return (
    <aside className="flex h-full min-h-0 w-[420px] min-w-[420px] max-w-[420px] flex-col border-l border-slate-200 bg-slate-50 px-4 pb-4 pt-2">
      <div className="flex h-8 shrink-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Bot className="h-4 w-4 shrink-0" style={{ color: flow.accent }} />
          <h3 className="min-w-0 truncate text-base font-black text-slate-900">{flow.rightTitle}</h3>
        </div>
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-slate-400">420px</span>
      </div>

      <AiConfigRow />

      <div className="relative mt-5 min-h-0 flex-1">
        <div className="absolute -top-2 right-4 z-10 flex items-center gap-2 bg-slate-50 px-1">
          <button type="button" className="whitespace-nowrap text-xs font-black text-red-500">清空</button>
          <button type="button" className="whitespace-nowrap text-xs font-black text-slate-500">日志</button>
        </div>
        <div className="flex h-full min-h-[220px] flex-col rounded-xl border border-[#BDEEF7] bg-white p-4">
          <label className="mb-2 text-xs font-black text-[#078fb0]">{flow.outputLabel}</label>
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap text-sm font-bold leading-7 text-slate-600">
            {sampleLines.join('\n\n')}
          </div>
          <div className="mt-2 text-right text-xs font-black text-slate-400">4074 字</div>
        </div>
      </div>

      <div className="mt-3 shrink-0">
        <div className="flex h-11 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <input
            readOnly
            value=""
            placeholder={flow.placeholder}
            className="min-w-0 flex-1 px-3 text-sm font-bold outline-none placeholder:text-slate-400"
          />
          <button type="button" className="grid h-full w-12 shrink-0 place-items-center border-l border-slate-200 text-[#08AACE]">
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid h-11 shrink-0 grid-cols-3 overflow-hidden rounded-xl border border-slate-200 bg-white text-sm font-black">
        <button type="button" className="whitespace-nowrap px-2 text-white" style={{ backgroundColor: flow.accent }}>
          {flow.primaryAction}
        </button>
        <button type="button" className="whitespace-nowrap border-l border-slate-200 px-2 text-slate-600 hover:bg-slate-50">
          {flow.secondaryAction}
        </button>
        <button type="button" className="whitespace-nowrap border-l border-red-200 bg-red-600 px-2 text-white hover:bg-red-700">
          清空内容
        </button>
      </div>
    </aside>
  );
}

function MainPreview({ flow }: { flow: FlowPreview }) {
  return (
    <main className="flex min-h-0 flex-1 flex-col bg-white">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-5">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-black text-slate-950">{flow.title}</h2>
          <p className="mt-0.5 truncate text-xs font-bold text-slate-400">{flow.subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" className="h-8 whitespace-nowrap rounded-lg border border-[#9BEFFC] bg-white px-3 text-xs font-black text-[#078fb0]">复制</button>
          <button type="button" className="h-8 whitespace-nowrap rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white">优化</button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)] overflow-hidden">
        <aside className="min-h-0 border-r border-slate-100 bg-slate-50 px-2 py-3">
          <div className="mb-3 flex h-9 items-center justify-between rounded-lg border border-[#BDEEF7] bg-[#EAF9FD] px-3 text-sm font-black text-slate-900">
            <span>第一卷</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs text-[#08AACE]">7章</span>
          </div>
          <div className="space-y-1">
            <button type="button" className="flex h-9 w-full items-center justify-between rounded-lg bg-white px-3 text-left text-sm font-black text-slate-900 shadow-sm">
              <span className="truncate">第2章 被踢出灵路...</span>
              <span className="text-xs text-slate-400">3650</span>
            </button>
            <button type="button" className="flex h-9 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-black text-slate-600">
              <span className="truncate">第3章 牧域</span>
              <span className="text-xs text-slate-400">2352</span>
            </button>
            <button type="button" className="flex h-9 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-black text-slate-600">
              <span className="truncate">第4章 大浮屠诀</span>
              <span className="text-xs text-slate-400">2454</span>
            </button>
          </div>
        </aside>

        <section className="min-h-0 overflow-hidden p-5">
          <div className="flex h-full min-h-0 flex-col rounded-xl border border-slate-200 bg-white">
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-slate-100 px-4">
              <div className="flex min-w-0 items-center gap-2 text-sm font-black text-slate-700">
                <FileText className="h-4 w-4 text-[#08AACE]" />
                <span className="truncate">{flow.title}工作区</span>
              </div>
              <span className="text-xs font-black text-slate-400">右侧 AI 固定 420px</span>
            </div>
            <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5 text-sm font-bold leading-7 text-slate-600">
              {sampleLines.map((line) => (
                <p className="mb-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                  {line}
                </p>
              ))}
              <div className="rounded-lg border border-dashed border-[#BDEEF7] bg-[#F8FEFF] px-4 py-5 text-center text-sm font-black text-[#078fb0]">
                切换顶部流程按钮时，观察右侧 AI 面板宽度、模型/提示词行和底部按钮是否稳定。
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function WorkbenchAiWidthUnifiedPreviewTestPage() {
  const [activeKey, setActiveKey] = useState<FlowKey>('brainstorm');
  const activeFlow = flowPreviews.find((flow) => flow.key === activeKey) ?? flowPreviews[0];

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F8FAFC]">
      <header className="shrink-0 border-b border-slate-100 bg-white px-6 py-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-black text-slate-950">右侧 AI 区 420px 统一宽度切换测试</h1>
            <p className="mt-1 text-sm font-bold text-slate-500">
              逐个切换页面，检查右侧 AI 区、模型/提示词行和底部按钮是否有体感跳动或文字换行。
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-[#BDEEF7] bg-[#EAF9FD] px-3 py-2 text-sm font-black text-[#078fb0]">
            <Check className="h-4 w-4" />
            基准宽度 420px
          </div>
        </div>
        <nav className="flex flex-wrap gap-2">
          {flowPreviews.map((flow) => (
            <FlowButton flow={flow} active={flow.key === activeKey} onClick={() => setActiveKey(flow.key)} />
          ))}
        </nav>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden p-5">
        <div className="flex h-full min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <MainPreview flow={activeFlow} />
          <RightAiPanel flow={activeFlow} />
        </div>
      </div>
    </div>
  );
}

export default WorkbenchAiWidthUnifiedPreviewTestPage;
