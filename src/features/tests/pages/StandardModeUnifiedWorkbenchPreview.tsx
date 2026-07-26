import { CheckCircle2, Circle, FileText, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { StandardModeTemplateDialog } from './StandardModeCreationFlowDialogs';
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
  STANDARD_MODE_TOOL_ORDER,
  STANDARD_MODE_TOOLS,
  type StandardModeBrainstormView,
  type StandardModeNovel,
  type StandardModeWorkbenchTool,
} from './standardModeWorkbenchTestData';

function getBrainstormActions(view: StandardModeBrainstormView, linkedBrainstorm?: string) {
  if (view === 'library') return ['选择一个脑洞', '扩展选中脑洞'];
  if (view === 'link')
    return linkedBrainstorm ? ['选择设定模板', '更换关联脑洞', '取消当前关联'] : ['选择并关联脑洞', '进入脑洞库'];
  return ['生成脑洞', '换一个方向', '采用并选择设定模板'];
}

function StageContent({
  tool,
  brainstormView,
  linkedBrainstorm,
  templateName,
}: {
  tool: StandardModeWorkbenchTool;
  brainstormView: StandardModeBrainstormView;
  linkedBrainstorm?: string;
  templateName?: string;
}) {
  if (tool === 'brainstorm') {
    return <BrainstormStagePreview view={brainstormView} linkedBrainstorm={linkedBrainstorm} />;
  }
  if (tool === 'outline') return <SettingStagePreview templateName={templateName} />;
  if (tool === 'chapterOutline') return <ChapterOutlineStagePreview />;
  if (tool === 'writing') return <WritingStagePreview />;
  if (tool === 'audit') return <AuditStagePreview />;
  if (tool === 'status') return <StatusStagePreview />;
  if (tool === 'summary') return <SummaryStagePreview />;
  if (tool === 'polish') return <PolishStagePreview />;
  return <ReviewStagePreview />;
}

function StageNavigation({ tool, onMove }: { tool: StandardModeWorkbenchTool; onMove: (offset: number) => void }) {
  return (
    <footer className="flex h-14 shrink-0 items-center justify-between border-t border-slate-200 bg-white px-6">
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={tool === STANDARD_MODE_TOOL_ORDER[0]}
        className="h-9 min-w-[92px] rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 disabled:cursor-not-allowed disabled:text-slate-300"
      >
        上一步
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={tool === STANDARD_MODE_TOOL_ORDER.at(-1)}
        className="h-9 min-w-[110px] rounded-md bg-[#08AACE] px-4 text-sm font-black text-white hover:bg-[#078FAB] disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        完成并下一步
      </button>
    </footer>
  );
}

export function StandardModeUnifiedWorkbenchPreview({
  novel,
  onBack,
  onOpenEditor,
  initialTool,
  linkedBrainstorm,
}: {
  novel: StandardModeNovel;
  onBack: () => void;
  onOpenEditor: () => void;
  initialTool?: StandardModeWorkbenchTool;
  linkedBrainstorm?: string;
}) {
  const [activeTool, setActiveTool] = useState<StandardModeWorkbenchTool>(
    initialTool ?? (novel.id === 'new' ? 'brainstorm' : 'chapterOutline'),
  );
  const [brainstormView, setBrainstormView] = useState<StandardModeBrainstormView>(
    linkedBrainstorm ? 'link' : 'generate',
  );
  const [lastAction, setLastAction] = useState('');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState<string>();
  const tool = useMemo(() => STANDARD_MODE_TOOLS.find((item) => item.id === activeTool)!, [activeTool]);
  const actions = activeTool === 'brainstorm' ? getBrainstormActions(brainstormView, linkedBrainstorm) : tool.actions;

  const selectTool = (nextTool: StandardModeWorkbenchTool) => {
    setActiveTool(nextTool);
    setLastAction('');
  };

  const moveStep = (offset: number) => {
    const currentIndex = STANDARD_MODE_TOOL_ORDER.indexOf(activeTool);
    const nextTool = STANDARD_MODE_TOOL_ORDER[currentIndex + offset];
    if (nextTool) selectTool(nextTool);
  };

  const runAction = (action: string) => {
    if (activeTool === 'writing' && action === '打开正文页面') {
      onOpenEditor();
      return;
    }
    if (action.includes('设定模板') || action === '扩展选中脑洞') {
      setShowTemplateDialog(true);
      return;
    }
    setLastAction(`已执行：${action}`);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white" data-testid="standard-mode-workbench">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-slate-200 px-5">
        <button
          type="button"
          onClick={onBack}
          className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-black text-slate-600 hover:bg-slate-50"
        >
          返回书籍
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-black text-slate-900">{novel.title} · 创作工作台</div>
          <div className="mt-0.5 text-xs font-bold text-slate-400">左侧快速进入功能，中间创作，右侧执行AI操作</div>
        </div>
        <span className="text-sm font-black text-[#078FAB]">标准模式</span>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className="w-60 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50 px-3 py-4"
          aria-label="创作功能区"
        >
          <button
            type="button"
            onClick={() => setLastAction('已打开：智能导入已有小说')}
            className="mb-4 h-10 w-full rounded-md border border-slate-300 bg-white text-sm font-black text-slate-600 hover:border-[#8EDFEB] hover:text-[#078FAB]"
          >
            导入已有小说
          </button>
          <section className="mb-5">
            <h2 className="px-2 pb-2 text-xs font-black text-slate-400">脑洞</h2>
            <div className="grid grid-cols-2 gap-2" data-testid="brainstorm-shortcuts">
              {(['generate', 'library', 'link'] as const).map((view) => {
                const selected = activeTool === 'brainstorm' && brainstormView === view;
                return (
                  <button
                    key={view}
                    type="button"
                    aria-current={selected ? 'page' : undefined}
                    onClick={() => {
                      setBrainstormView(view);
                      selectTool('brainstorm');
                    }}
                    className={`h-10 rounded-md border px-2 text-center text-xs font-black outline-none ${view === 'link' ? 'col-span-2' : ''} ${selected ? 'border-[#08AACE] bg-white text-[#078FAB]' : 'border-slate-200 bg-white text-slate-600 hover:border-[#8EDFEB] hover:text-[#078FAB]'}`}
                  >
                    {view === 'generate' ? '生成脑洞' : view === 'library' ? '进入脑洞库' : '关联脑洞'}
                  </button>
                );
              })}
            </div>
          </section>
          <section>
            <h2 className="px-2 pb-2 text-xs font-black text-slate-400">流程快捷入口</h2>
            <div className="grid grid-cols-2 gap-2" data-testid="workflow-shortcuts">
              {STANDARD_MODE_TOOLS.filter((item) => item.id !== 'brainstorm').map((item) => {
                const selected = activeTool === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={selected ? 'page' : undefined}
                    onClick={() => selectTool(item.id)}
                    className={`h-10 rounded-md border px-2 text-center text-xs font-black outline-none ${selected ? 'border-[#08AACE] bg-white text-[#078FAB]' : 'border-slate-200 bg-white text-slate-600 hover:border-[#8EDFEB] hover:text-[#078FAB]'}`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </section>
        </aside>

        <main
          className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white"
          data-testid="standard-mode-center-content"
        >
          <div className="min-h-0 flex-1 overflow-y-auto">
            <StageContent
              tool={activeTool}
              brainstormView={brainstormView}
              linkedBrainstorm={linkedBrainstorm}
              templateName={templateName}
            />
          </div>
          <StageNavigation tool={activeTool} onMove={moveStep} />
        </main>

        <aside
          className="w-80 shrink-0 overflow-y-auto border-l border-slate-200 bg-[#FBFCFD]"
          aria-label="当前功能操作台"
        >
          <div className="border-b border-slate-200 px-5 py-5">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              {activeTool === 'brainstorm' ? (
                <Sparkles className="h-4 w-4 text-[#08AACE]" />
              ) : (
                <FileText className="h-4 w-4 text-[#08AACE]" />
              )}
              AI配置与操作
            </div>
            <p className="mt-2 text-xs font-medium leading-5 text-slate-500">{tool.description}</p>
          </div>
          <div className="space-y-4 border-b border-slate-200 px-5 py-5">
            <label className="block text-xs font-black text-slate-500">
              AI配置
              <select className="mt-2 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
                <option>默认创作模型</option>
                <option>长文本模型</option>
              </select>
            </label>
            {activeTool === 'chapterOutline' ? (
              <label className="block text-xs font-black text-slate-500">
                一次生成
                <select className="mt-2 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
                  <option>1个章纲</option>
                  <option>3个章纲</option>
                  <option>5个章纲</option>
                </select>
              </label>
            ) : null}
          </div>
          <div className="space-y-3 px-5 py-5">
            {actions.map((action, index) => (
              <button
                key={action}
                type="button"
                onClick={() => runAction(action)}
                className={`h-10 w-full rounded-md px-4 text-sm font-black transition-colors ${index === 0 ? 'bg-[#08AACE] text-white hover:bg-[#078FAB]' : 'border border-slate-300 bg-white text-slate-600 hover:border-[#8EDFEB] hover:text-[#078FAB]'}`}
              >
                {action}
              </button>
            ))}
          </div>
          <div className="border-t border-slate-200 px-5 py-5">
            <h3 className="text-xs font-black text-slate-400">自动保存</h3>
            <div className="mt-3 space-y-3 text-sm font-bold text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                当前步骤和输入
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                AI配置与关联资料
              </div>
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-slate-300" />
                待确认修改草稿
              </div>
            </div>
          </div>
          {lastAction ? (
            <div
              className="mx-5 mb-5 border-l-4 border-emerald-400 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700"
              role="status"
            >
              {lastAction}
            </div>
          ) : null}
        </aside>
      </div>

      <StandardModeTemplateDialog
        isOpen={showTemplateDialog}
        onClose={() => setShowTemplateDialog(false)}
        onConfirm={(name) => {
          setTemplateName(name);
          setShowTemplateDialog(false);
          setActiveTool('outline');
          setLastAction(`已采用：${name}`);
        }}
      />
    </div>
  );
}
