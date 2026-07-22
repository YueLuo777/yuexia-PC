import { Lock } from 'lucide-react';
import { useState } from 'react';

import { AiInlineInput } from '@/shared/ui/AiInlineInput';

type PanelSpec = {
  kind: 'setting' | 'outline' | 'chapter';
  title: string;
  outputTitle: string;
  description: string;
  associations: string[];
  associationGroupClassName: string;
  associationButtonClassNames: string[];
  primaryAction: string;
  secondaryActions: string[];
  sampleOutput: string;
};

const PANEL_SPECS: PanelSpec[] = [
  {
    kind: 'setting',
    title: '设定页面',
    outputTitle: '生成设定',
    description: '保留设定页的多来源关联和智能导入操作。',
    associations: ['当前设定', '其他设定', '脑洞'],
    associationGroupClassName: 'w-[288px]',
    associationButtonClassNames: ['w-[86px]', 'w-[86px]', 'w-[68px]'],
    primaryAction: '智能导入设定',
    secondaryActions: [],
    sampleOutput: '能力来源：万界吞噬系统。\n核心功能：吞噬目标力量并转化为主角成长资源。',
  },
  {
    kind: 'outline',
    title: '章纲页面',
    outputTitle: 'AI输出章纲',
    description: '保留关联大纲以及替换、撤销、复制三个章纲操作。',
    associations: ['大纲'],
    associationGroupClassName: 'w-[134px]',
    associationButtonClassNames: ['w-[86px]'],
    primaryAction: '替换章纲',
    secondaryActions: ['撤销替换', '复制章纲'],
    sampleOutput: '本章目标：主角在家族大比中完成第一次吞噬。\n状态变化：修为提升至炼气九层。',
  },
  {
    kind: 'chapter',
    title: '正文页面',
    outputTitle: 'AI输出正文',
    description: '保留正文会话编号以及替换、撤回、复制操作。',
    associations: ['当前章节', '资料'],
    associationGroupClassName: 'w-[256px]',
    associationButtonClassNames: ['w-24', 'w-28'],
    primaryAction: '替换正文',
    secondaryActions: ['撤回替换', '复制内容'],
    sampleOutput: '林刻缓缓抬起头。擂台四周的嘲笑声仍未停歇，冰冷的机械提示却已经在脑海中响起。',
  },
];

function ConfigSelectPreview() {
  return (
    <div className="grid h-12 grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <button type="button" className="border-r border-slate-200 px-3 text-left">
        <span className="block text-[11px] font-black text-[#08AACE]">模型</span>
        <span className="block truncate text-sm font-bold text-slate-700">DeepSeek Chat</span>
      </button>
      <button type="button" className="px-3 text-left">
        <span className="block text-[11px] font-black text-[#08AACE]">提示词</span>
        <span className="block truncate text-sm font-bold text-slate-700">默认生成提示词</span>
      </button>
    </div>
  );
}

function OutputFrame({ spec, output, onClear }: { spec: PanelSpec; output: string; onClear: () => void }) {
  return (
    <section className="relative mt-5 min-h-[250px] rounded-[20px] border-2 border-[#111827] bg-white px-5 pb-14 pt-6">
      <strong className="xy-border-embedded-transparent-backplate absolute left-5 top-0 -translate-y-1/2 text-sm font-black text-slate-950">
        {spec.outputTitle}
      </strong>
      <button
        type="button"
        onClick={onClear}
        className="xy-border-embedded-transparent-backplate absolute right-5 top-0 -translate-y-1/2 text-xs font-black text-red-500 hover:text-red-600"
      >
        清空
      </button>
      {spec.kind === 'chapter' ? (
        <div className="mb-3 flex gap-1.5" aria-label="正文会话编号">
          <span className="grid h-6 w-6 place-items-center rounded-md border border-[#08AACE]/30 bg-[#EAF9FD] text-xs font-black text-[#078FAE]">1</span>
          <span className="grid h-6 w-6 place-items-center rounded-md border border-slate-200 text-xs font-black text-slate-400">2</span>
        </div>
      ) : null}
      <div className="whitespace-pre-wrap text-sm font-medium leading-6 text-slate-700">
        {output || 'AI 生成内容会显示在这里。'}
      </div>
      <div className="absolute bottom-3 left-5 flex h-8 overflow-hidden rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-700">
        <button type="button" className="w-9 border-r border-slate-200">−</button>
        <span className="grid w-10 place-items-center">16</span>
        <button type="button" className="w-9 border-l border-slate-200">＋</button>
      </div>
    </section>
  );
}

function AssociationControl({ spec }: { spec: PanelSpec }) {
  const [active, setActive] = useState(spec.associations[0]);
  return (
    <div className={`mt-3 flex h-10 max-w-full overflow-hidden rounded-xl border border-[#08AACE] bg-white shadow-sm ${spec.associationGroupClassName}`}>
      <span className="grid w-12 shrink-0 place-items-center border-r border-[#08AACE]/30 bg-[#E9FAFE] text-sm font-black text-[#078BA9]">关联</span>
      {spec.associations.map((label, index) => (
        <button
          key={label}
          type="button"
          onClick={() => setActive(label)}
          className={`shrink-0 border-r border-[#08AACE]/30 px-2 text-sm font-bold last:border-r-0 ${spec.associationButtonClassNames[index]} ${
            active === label ? 'bg-[#08AACE] text-white' : 'bg-white text-slate-600 hover:bg-[#E9FAFD]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ActionBar({ spec }: { spec: PanelSpec }) {
  if (spec.kind === 'setting') {
    return (
      <div className="mt-3 flex h-10 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <button type="button" className="min-w-0 flex-1 bg-[#08AACE] px-3 text-sm font-black text-white hover:bg-[#0796B8]">
          智能导入设定
        </button>
        <button type="button" title="锁定智能导入设定" className="grid w-10 shrink-0 place-items-center border-l border-[#08AACE]/30 bg-[#EAF9FD] text-[#08AACE]">
          <Lock className="h-4 w-4" />
        </button>
      </div>
    );
  }
  return (
    <div className="mt-3 flex h-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button type="button" className="min-w-0 flex-1 bg-[#08AACE] px-3 text-sm font-black text-white hover:bg-[#0796B8]">
        {spec.primaryAction}
      </button>
      {spec.secondaryActions.map((action) => (
        <button key={action} type="button" className="min-w-0 flex-1 border-l border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
          {action}
        </button>
      ))}
    </div>
  );
}

function UnifiedPanelPreview({ spec }: { spec: PanelSpec }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState(spec.sampleOutput);
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-slate-950">{spec.title}</h2>
          <span className="rounded-full bg-[#EAF9FD] px-2.5 py-1 text-[11px] font-black text-[#078FAE]">统一方案</span>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-500">{spec.description}</p>
      </div>
      <ConfigSelectPreview />
      <OutputFrame spec={spec} output={output} onClear={() => setOutput('')} />
      <AssociationControl spec={spec} />
      <div className="mt-3">
        <AiInlineInput
          aria-label={`${spec.title}请输入要求`}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onSend={() => {
            if (input.trim()) setOutput(`${spec.sampleOutput}\n\n追加要求：${input.trim()}`);
          }}
          onStop={() => undefined}
          sendDisabled={!input.trim()}
          stopDisabled
        />
      </div>
      <ActionBar spec={spec} />
    </article>
  );
}

export function AiPanelVisualConsistencyTestPage() {
  return (
    <div className="writer-assistant-theme min-h-full overflow-y-auto bg-[#F3F6F9] p-6 text-slate-700">
      <div className="mx-auto max-w-[1500px]">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black tracking-[0.16em] text-[#08AACE]">AI PANEL CONSISTENCY</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950">设定、章纲、正文 AI 面板统一方案</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">三个页面统一骨架、间距、按钮高度、圆角和颜色；每列继续保留真实业务按钮，方便直接比较差异。</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
            {['输出前 20px', '区块间 12px', '按钮高 40px', '圆角 12px', '框线 2px #111827'].map((item) => (
              <span key={item} className="rounded-lg bg-slate-100 px-3 py-2">{item}</span>
            ))}
          </div>
        </header>
        <main className="mt-5 grid gap-4 xl:grid-cols-3">
          {PANEL_SPECS.map((spec) => <UnifiedPanelPreview key={spec.kind} spec={spec} />)}
        </main>
      </div>
    </div>
  );
}
