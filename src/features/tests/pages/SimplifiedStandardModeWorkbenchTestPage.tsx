import { useMemo, useState } from 'react';

import {
  AuditStagePreview,
  PolishStagePreview,
  ReviewStagePreview,
  StatusStagePreview,
  SummaryStagePreview,
} from './StandardModeFinishingStagePreviews';
import {
  BrainstormStagePreview,
  ChapterOutlineStagePreview,
  SettingStagePreview,
  WritingStagePreview,
} from './StandardModePrimaryStagePreviews';
import {
  STANDARD_MODE_TOOLS,
  STANDARD_MODE_TOOL_ORDER,
  type StandardModeBrainstormView,
  type StandardModeWorkbenchTool,
} from './standardModeWorkbenchTestData';

const STAGE_GROUPS = [
  { title: '创作准备', tools: ['brainstorm', 'outline'] },
  { title: '章节创作', tools: ['chapterOutline', 'writing'] },
  { title: '写后完善', tools: ['audit', 'status', 'summary', 'polish', 'review'] },
] as const satisfies ReadonlyArray<{
  title: string;
  tools: ReadonlyArray<StandardModeWorkbenchTool>;
}>;

const PRIMARY_ACTIONS: Record<StandardModeWorkbenchTool, string> = {
  brainstorm: '生成脑洞',
  outline: '生成整套设定',
  chapterOutline: '生成本章章纲',
  writing: '生成本章正文',
  audit: '开始自动审核',
  status: '检测状态变化',
  summary: '生成缺失梗概',
  polish: '生成润色稿',
  review: '开始综合点评',
};

const BRAINSTORM_VIEWS: ReadonlyArray<{ id: StandardModeBrainstormView; label: string }> = [
  { id: 'generate', label: '生成脑洞' },
  { id: 'library', label: '脑洞库' },
  { id: 'link', label: '关联脑洞' },
];

function StagePreview({
  tool,
  brainstormView,
}: {
  tool: StandardModeWorkbenchTool;
  brainstormView: StandardModeBrainstormView;
}) {
  if (tool === 'brainstorm') return <BrainstormStagePreview view={brainstormView} />;
  if (tool === 'outline') return <SettingStagePreview templateName="默认男频长篇模板" />;
  if (tool === 'chapterOutline') return <ChapterOutlineStagePreview />;
  if (tool === 'writing') return <WritingStagePreview />;
  if (tool === 'audit') return <AuditStagePreview />;
  if (tool === 'status') return <StatusStagePreview />;
  if (tool === 'summary') return <SummaryStagePreview />;
  if (tool === 'polish') return <PolishStagePreview />;
  return <ReviewStagePreview />;
}

function WorkflowSidebar({
  activeTool,
  completedTools,
  onSelect,
}: {
  activeTool: StandardModeWorkbenchTool;
  completedTools: ReadonlySet<StandardModeWorkbenchTool>;
  onSelect: (tool: StandardModeWorkbenchTool) => void;
}) {
  return (
    <aside
      className="w-56 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50 px-3 py-4"
      aria-label="标准模式创作步骤"
    >
      <div className="mb-4 border-b border-slate-200 px-2 pb-4">
        <div className="text-sm font-black text-slate-900">创作进度</div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[#08AACE] transition-[width]"
            style={{ width: `${(completedTools.size / STANDARD_MODE_TOOL_ORDER.length) * 100}%` }}
          />
        </div>
        <div className="mt-2 text-xs font-bold text-slate-400">
          已完成 {completedTools.size}/{STANDARD_MODE_TOOL_ORDER.length}
        </div>
      </div>

      {STAGE_GROUPS.map((group) => (
        <section key={group.title} className="mb-5">
          <h2 className="px-2 pb-2 text-xs font-black text-slate-400">{group.title}</h2>
          <div className="space-y-1.5">
            {group.tools.map((toolId) => {
              const definition = STANDARD_MODE_TOOLS.find((item) => item.id === toolId)!;
              const index = STANDARD_MODE_TOOL_ORDER.indexOf(toolId) + 1;
              const selected = activeTool === toolId;
              const completed = completedTools.has(toolId);
              return (
                <button
                  key={toolId}
                  type="button"
                  aria-current={selected ? 'step' : undefined}
                  onClick={() => onSelect(toolId)}
                  className={`flex h-11 w-full items-center rounded-md border px-3 text-left text-sm font-black outline-none transition-colors ${
                    selected
                      ? 'border-[#08AACE] bg-white text-[#078FAB]'
                      : 'border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white'
                  }`}
                >
                  <span className="w-7 shrink-0 text-xs text-slate-400">{String(index).padStart(2, '0')}</span>
                  <span className="min-w-0 flex-1 truncate">{definition.label}</span>
                  <span className={`text-xs ${completed ? 'text-emerald-600' : 'text-slate-300'}`}>
                    {completed ? '完成' : '待做'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </aside>
  );
}

function BottomActionBar({
  activeTool,
  completed,
  resultMessage,
  onPrevious,
  onRun,
  onNext,
}: {
  activeTool: StandardModeWorkbenchTool;
  completed: boolean;
  resultMessage: string;
  onPrevious: () => void;
  onRun: () => void;
  onNext: () => void;
}) {
  const currentIndex = STANDARD_MODE_TOOL_ORDER.indexOf(activeTool);
  return (
    <footer className="flex h-16 shrink-0 items-center gap-3 border-t border-slate-200 bg-white px-5">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="h-9 min-w-[82px] rounded-md border border-slate-300 bg-white px-4 text-sm font-black text-slate-600 disabled:cursor-not-allowed disabled:text-slate-300"
      >
        上一步
      </button>
      <div className="min-w-0 flex-1 text-center text-sm font-bold text-slate-500" role="status">
        {resultMessage || '默认模型、提示词和关联资料已自动准备'}
      </div>
      <button
        type="button"
        onClick={onRun}
        className="h-10 min-w-[140px] rounded-md bg-[#08AACE] px-5 text-sm font-black text-white hover:bg-[#078FAB]"
      >
        {completed ? `重新${PRIMARY_ACTIONS[activeTool]}` : PRIMARY_ACTIONS[activeTool]}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={currentIndex === STANDARD_MODE_TOOL_ORDER.length - 1}
        className="h-9 min-w-[82px] rounded-md border border-slate-300 bg-white px-4 text-sm font-black text-slate-600 disabled:cursor-not-allowed disabled:text-slate-300"
      >
        下一步
      </button>
    </footer>
  );
}

export function SimplifiedStandardModeWorkbenchTestPage() {
  const [activeTool, setActiveTool] = useState<StandardModeWorkbenchTool>('brainstorm');
  const [brainstormView, setBrainstormView] = useState<StandardModeBrainstormView>('generate');
  const [completedTools, setCompletedTools] = useState<Set<StandardModeWorkbenchTool>>(() => new Set());
  const [resultByTool, setResultByTool] = useState<Partial<Record<StandardModeWorkbenchTool, string>>>({});
  const activeDefinition = useMemo(
    () => STANDARD_MODE_TOOLS.find((item) => item.id === activeTool)!,
    [activeTool],
  );

  const move = (offset: number) => {
    const nextTool = STANDARD_MODE_TOOL_ORDER[STANDARD_MODE_TOOL_ORDER.indexOf(activeTool) + offset];
    if (nextTool) setActiveTool(nextTool);
  };

  const runCurrentAction = () => {
    setCompletedTools((current) => new Set(current).add(activeTool));
    setResultByTool((current) => ({
      ...current,
      [activeTool]: `${PRIMARY_ACTIONS[activeTool]}已完成，结果已填入当前页面`,
    }));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white" data-testid="simplified-standard-workbench">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-slate-200 px-5">
        <button
          type="button"
          className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-black text-slate-600"
        >
          返回书籍
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-black text-slate-900">九重天劫 · 创作工作台</div>
          <div className="mt-0.5 text-xs font-bold text-slate-400">
            第 {STANDARD_MODE_TOOL_ORDER.indexOf(activeTool) + 1} 步，共 {STANDARD_MODE_TOOL_ORDER.length} 步
          </div>
        </div>
        <span className="text-sm font-black text-[#078FAB]">标准模式</span>
      </header>

      <div className="flex min-h-0 flex-1">
        <WorkflowSidebar
          activeTool={activeTool}
          completedTools={completedTools}
          onSelect={(tool) => setActiveTool(tool)}
        />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden" data-testid="simplified-stage-area">
          {activeTool === 'brainstorm' ? (
            <div className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-200 bg-slate-50 px-5">
              {BRAINSTORM_VIEWS.map((view) => (
                <button
                  key={view.id}
                  type="button"
                  aria-current={brainstormView === view.id ? 'page' : undefined}
                  onClick={() => setBrainstormView(view.id)}
                  className={`h-8 rounded-md border px-4 text-xs font-black ${
                    brainstormView === view.id
                      ? 'border-[#08AACE] bg-white text-[#078FAB]'
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto bg-white">
            <StagePreview tool={activeTool} brainstormView={brainstormView} />
          </div>

          <BottomActionBar
            activeTool={activeTool}
            completed={completedTools.has(activeTool)}
            resultMessage={resultByTool[activeTool] ?? activeDefinition.description}
            onPrevious={() => move(-1)}
            onRun={runCurrentAction}
            onNext={() => move(1)}
          />
        </main>
      </div>
    </div>
  );
}

export default SimplifiedStandardModeWorkbenchTestPage;
