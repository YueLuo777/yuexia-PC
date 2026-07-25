import {
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  CircleHelp,
  FileText,
  FolderTree,
  GitBranch,
  ListChecks,
  RotateCcw,
  Settings2,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { PROMPT_AUXILIARY_WORKFLOWS, PROMPT_NOVEL_WORKFLOW, PROMPT_WORKSPACE_SECTIONS } from './PromptDrivenNovelWorkspaceData';
import type { PromptWorkflowStep, PromptWorkspaceField, PromptWorkspaceMode, PromptWorkspaceSection } from './PromptDrivenNovelWorkspaceTypes';

const FIELD_KIND_LABEL: Record<PromptWorkspaceField['kind'], string> = {
  core: '核心设定',
  archive: '资料档案',
  rule: '规则约束',
  record: '持续记录',
};

const FIELD_KIND_CLASS: Record<PromptWorkspaceField['kind'], string> = {
  core: 'border-[#9ADFEA] bg-[#ECFAFC] text-[#087C93]',
  archive: 'border-[#D8C5F2] bg-[#F7F1FD] text-[#7250A2]',
  rule: 'border-[#F2D28A] bg-[#FFF8E5] text-[#93610A]',
  record: 'border-[#C8D8E8] bg-[#F1F6FA] text-[#49667D]',
};

function SettingSidebar({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  return (
    <nav aria-label="提示词整理后的设定目录" className="xy-setting-sidebar-scrollbar min-h-0 flex-1 overflow-y-auto px-1 [scrollbar-gutter:stable]">
      <div className="mb-3 rounded-md border border-[#B7EAF3] bg-[#F2FBFD] px-3 py-2 text-xs font-bold leading-5 text-[#17677A]">
        这些内容属于设定页面，AI生成正文时会持续读取。
      </div>
      {PROMPT_WORKSPACE_SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          aria-pressed={selectedId === section.id}
          onClick={() => onSelect(section.id)}
          className={`relative mb-2 flex min-h-11 w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
            selectedId === section.id
              ? 'border-2 border-[#2A9FB9] bg-white text-slate-800'
              : 'border-[#B7EAF3] bg-[#DDF5FA] text-[#155E75] hover:border-[#2A9FB9]'
          }`}
        >
          <span aria-hidden="true" className={`absolute -left-2 top-1/2 h-px w-2 ${selectedId === section.id ? 'bg-[#2A9FB9]' : 'bg-[#7DCDDC]'}`} />
          <FolderTree className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate text-xs font-black">{section.title}</span>
          <span className="rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-black text-slate-400">{section.fields.length}</span>
        </button>
      ))}
    </nav>
  );
}

function WorkflowSidebar({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  return (
    <nav aria-label="AI小说生成流程目录" className="xy-setting-sidebar-scrollbar min-h-0 flex-1 overflow-y-auto px-1 [scrollbar-gutter:stable]">
      <div className="mb-3 rounded-md border border-[#D8C5F2] bg-[#F8F4FD] px-3 py-2 text-xs font-bold leading-5 text-[#7250A2]">
        这是AI创作的先后顺序，不是新的设定分类。
      </div>
      {PROMPT_NOVEL_WORKFLOW.map((step, index) => (
        <button
          key={step.id}
          type="button"
          aria-pressed={selectedId === step.id}
          onClick={() => onSelect(step.id)}
          className={`relative mb-2 flex min-h-12 w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
            selectedId === step.id
              ? 'border-2 border-[#7A56AA] bg-white text-slate-800'
              : 'border-[#D8C5F2] bg-[#F7F1FD] text-[#684A8E] hover:border-[#7A56AA]'
          }`}
        >
          <span aria-hidden="true" className={`absolute -left-2 top-1/2 h-px w-2 ${selectedId === step.id ? 'bg-[#7A56AA]' : 'bg-[#BBA3D8]'}`} />
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-black text-[#7A56AA]">{step.number}</span>
          <span className="min-w-0 flex-1 truncate text-xs font-black">{step.title}</span>
          {index < PROMPT_NOVEL_WORKFLOW.length - 1 ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#BBA3D8]" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-[#7A56AA]" />}
        </button>
      ))}
    </nav>
  );
}

function SourceList({ files }: { files: string[] }) {
  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div key={file} className="flex items-center gap-2 rounded-md border border-[#B7EAF3] bg-white px-3 py-2 text-xs font-bold text-slate-600">
          <FileText className="h-3.5 w-3.5 shrink-0 text-[#08AACE]" />
          <span className="truncate">{file}</span>
        </div>
      ))}
    </div>
  );
}

function FieldFrame({ field }: { field: PromptWorkspaceField }) {
  return (
    <article className="relative min-h-[132px] rounded-[20px] border-2 border-slate-950 bg-white px-5 pb-4 pt-4">
      <div className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950">{field.label}</div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className={`rounded border px-1.5 py-0.5 text-[10px] font-black ${FIELD_KIND_CLASS[field.kind]}`}>{FIELD_KIND_LABEL[field.kind]}</span>
        <span className="truncate text-[11px] font-bold text-slate-400">{field.source}</span>
      </div>
      <p className="text-base font-medium leading-8 text-slate-800">{field.instruction}</p>
    </article>
  );
}

function SettingDetail({ section }: { section: PromptWorkspaceSection }) {
  return (
    <>
      <div className="mb-3 flex shrink-0 items-center gap-2 text-xs font-bold text-slate-400">
        <span>提示词设定</span><ChevronRight className="h-3.5 w-3.5" /><span className="text-slate-700">{section.title}</span>
      </div>
      <header className="shrink-0 px-1 pr-2">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-[260px] items-center rounded-[14px] border-2 border-slate-950 bg-white px-4 text-base font-medium text-slate-800">
            <span className="xy-border-embedded-transparent-backplate absolute left-4 top-0 -translate-y-1/2 pr-2 text-base font-black text-slate-950">设定页面</span>
            {section.title}
          </div>
          <div className="flex items-center gap-2 rounded-md border border-[#9ADFEA] bg-[#ECFAFC] px-3 py-2 text-xs font-black text-[#087C93]">
            <Settings2 className="h-4 w-4" />提示词整理版
          </div>
        </div>
      </header>
      <div className="mt-4 flex items-center gap-2 rounded-md border border-[#B7EAF3] bg-[#F2FBFD] px-3 py-2 text-xs font-bold text-[#17677A]">
        <CircleHelp className="h-4 w-4 shrink-0" />{section.summary}
      </div>
      <div className="editor-scrollbar mt-4 min-h-0 flex-1 overflow-y-auto px-1 pb-3 pr-2 [scrollbar-gutter:stable]">
        <div className="grid grid-cols-2 items-stretch gap-3">
          {section.fields.map((field) => <FieldFrame key={field.label} field={field} />)}
        </div>
      </div>
    </>
  );
}

function WorkflowDetail({ step }: { step: PromptWorkflowStep }) {
  const list = (title: string, values: string[], tone: string) => (
    <section className={`rounded-lg border p-4 ${tone}`}>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-black"><ListChecks className="h-4 w-4" />{title}</h2>
      <ul className="space-y-2 text-sm font-medium leading-6">
        {values.map((value) => <li key={value} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />{value}</li>)}
      </ul>
    </section>
  );

  return (
    <>
      <div className="mb-3 flex shrink-0 items-center gap-2 text-xs font-bold text-slate-400">
        <span>AI生成流程</span><ChevronRight className="h-3.5 w-3.5" /><span className="text-slate-700">{step.number} {step.title}</span>
      </div>
      <header className="flex shrink-0 items-start gap-3 px-1">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F0E9F9] text-lg font-black text-[#7A56AA]">{step.number}</div>
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900">{step.title}</h1>
          <p className="mt-1 text-sm font-medium leading-6 text-slate-500">{step.summary}</p>
        </div>
      </header>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {list('AI需要读取', step.reads, 'border-[#B7EAF3] bg-[#F2FBFD] text-[#17677A]')}
        {list('AI需要产出', step.outputs, 'border-[#D8C5F2] bg-[#F8F4FD] text-[#684A8E]')}
      </div>
      <div className="mt-3 rounded-lg border border-[#B7EAF3] bg-white p-4">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700"><CheckCircle2 className="h-4 w-4 text-[#08AACE]" />完成标志</h2>
        <p className="text-sm font-medium leading-6 text-slate-600">{step.completion}</p>
      </div>
    </>
  );
}

function SettingsSourcePanel({ section }: { section: PromptWorkspaceSection }) {
  return (
    <aside className="flex min-h-0 flex-col border-l border-slate-200 bg-[#F7F9FB] px-4 py-4">
      <div className="flex items-center gap-2 text-sm font-black text-slate-800"><BookOpenText className="h-4 w-4 text-[#08AACE]" />设定来源与边界</div>
      <div className="mt-4 space-y-4 overflow-y-auto pb-3">
        <section>
          <h2 className="mb-2 text-xs font-black text-slate-500">依据的提示词文件</h2>
          <SourceList files={section.sourceFiles} />
        </section>
        <section className="rounded-lg border border-[#B7EAF3] bg-white p-3">
          <h2 className="text-xs font-black text-slate-700">这组设定解决什么</h2>
          <p className="mt-2 text-xs font-medium leading-5 text-slate-500">{section.summary}</p>
        </section>
        <section className="rounded-lg border border-[#F2D28A] bg-[#FFF8E5] p-3 text-xs text-[#93610A]">
          <h2 className="font-black">不放进设定页面</h2>
          <p className="mt-2 font-medium leading-5">具体执行命令、文件写入方式、分批策略和完成报告属于AI流程，不作为小说设定字段。</p>
        </section>
      </div>
    </aside>
  );
}

function WorkflowSourcePanel({ step }: { step: PromptWorkflowStep }) {
  return (
    <aside className="flex min-h-0 flex-col border-l border-slate-200 bg-[#F7F9FB] px-4 py-4">
      <div className="flex items-center gap-2 text-sm font-black text-slate-800"><Workflow className="h-4 w-4 text-[#7A56AA]" />流程衔接</div>
      <div className="mt-4 space-y-4 overflow-y-auto pb-3">
        <section>
          <h2 className="mb-2 text-xs font-black text-slate-500">本步依据</h2>
          <SourceList files={step.sourceFiles} />
        </section>
        <section className="rounded-lg border border-[#D8C5F2] bg-[#F8F4FD] p-3 text-[#684A8E]">
          <h2 className="flex items-center gap-2 text-xs font-black"><ArrowRight className="h-4 w-4" />下一步</h2>
          <p className="mt-2 text-sm font-bold leading-6">{step.next}</p>
        </section>
        <section className="rounded-lg border border-[#B7EAF3] bg-white p-3">
          <h2 className="flex items-center gap-2 text-xs font-black text-slate-700"><GitBranch className="h-4 w-4 text-[#08AACE]" />工作流判断</h2>
          <p className="mt-2 text-xs font-medium leading-5 text-slate-500">第{step.number}步完成后，输出会成为下一步的读取材料。失败时保留问题记录，不直接跳过。</p>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-3">
          <h2 className="flex items-center gap-2 text-xs font-black text-slate-700"><RotateCcw className="h-4 w-4 text-slate-400" />辅助工作流</h2>
          <div className="mt-2 space-y-2">
            {PROMPT_AUXILIARY_WORKFLOWS.map((workflow) => <div key={workflow.title} className="border-t border-slate-100 pt-2 text-xs"><div className="font-black text-slate-600">{workflow.title}</div><div className="mt-1 leading-5 text-slate-400">{workflow.detail}</div></div>)}
          </div>
        </section>
      </div>
    </aside>
  );
}

export function PromptDrivenNovelWorkspaceTestPage() {
  const [mode, setMode] = useState<PromptWorkspaceMode>('settings');
  const [selectedSettingId, setSelectedSettingId] = useState(PROMPT_WORKSPACE_SECTIONS[0].id);
  const [selectedStepId, setSelectedStepId] = useState(PROMPT_NOVEL_WORKFLOW[0].id);
  const selectedSection = useMemo(() => PROMPT_WORKSPACE_SECTIONS.find((section) => section.id === selectedSettingId) ?? PROMPT_WORKSPACE_SECTIONS[0], [selectedSettingId]);
  const selectedStep = useMemo(() => PROMPT_NOVEL_WORKFLOW.find((step) => step.id === selectedStepId) ?? PROMPT_NOVEL_WORKFLOW[0], [selectedStepId]);

  return (
    <div data-testid="prompt-driven-novel-workspace-test" className="xy-setting-workspace-typography flex h-full min-h-0 flex-col overflow-hidden bg-white text-slate-900">
      <header className="flex h-12 shrink-0 items-end border-b border-slate-200 bg-white px-4">
        <button type="button" aria-pressed={mode === 'settings'} onClick={() => setMode('settings')} className={`h-10 border-b-2 px-4 text-sm font-black ${mode === 'settings' ? 'border-[#08AACE] text-[#078FAE]' : 'border-transparent text-slate-400'}`}><Settings2 className="mr-2 inline h-4 w-4" />设定页面</button>
        <button type="button" aria-pressed={mode === 'workflow'} onClick={() => setMode('workflow')} className={`h-10 border-b-2 px-4 text-sm font-black ${mode === 'workflow' ? 'border-[#7A56AA] text-[#7A56AA]' : 'border-transparent text-slate-400'}`}><Workflow className="mr-2 inline h-4 w-4" />AI生成流程</button>
        <span className="mb-2 ml-auto rounded-md border border-[#9ADFEA] bg-[#ECFAFC] px-2.5 py-1 text-xs font-black text-[#087C93]">新版测试 · 提示词工作台</span>
      </header>

      <div className="grid min-h-0 min-w-[1240px] flex-1 grid-cols-[280px_minmax(650px,1fr)_330px]">
        <aside className="flex min-h-0 min-w-0 flex-col border-r border-slate-200 bg-[#F7F9FB] px-2 py-3">
          <div className="mb-3 flex items-center gap-2 px-2 text-sm font-black text-slate-700">{mode === 'settings' ? <FolderTree className="h-4 w-4 text-[#08AACE]" /> : <Workflow className="h-4 w-4 text-[#7A56AA]" />}{mode === 'settings' ? '提示词设定目录' : 'AI创作步骤'}</div>
          {mode === 'settings' ? <SettingSidebar selectedId={selectedSettingId} onSelect={setSelectedSettingId} /> : <WorkflowSidebar selectedId={selectedStepId} onSelect={setSelectedStepId} />}
        </aside>
        <main className="flex min-h-0 min-w-0 flex-col bg-white px-5 pb-3 pt-[23px]">
          {mode === 'settings' ? <SettingDetail section={selectedSection} /> : <WorkflowDetail step={selectedStep} />}
        </main>
        {mode === 'settings' ? <SettingsSourcePanel section={selectedSection} /> : <WorkflowSourcePanel step={selectedStep} />}
      </div>
    </div>
  );
}
