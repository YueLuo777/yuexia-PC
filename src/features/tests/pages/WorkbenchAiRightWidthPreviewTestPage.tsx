import { Lock, Minus, Plus, Unlock, X } from 'lucide-react';
import { useState } from 'react';

import type { CapsuleSelectOption } from '@/shared/ui/CapsuleSelect';
import { AiInlineInput } from '@/shared/ui/AiInlineInput';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';

const RIGHT_PANEL_WIDTHS = [420, 460];
const WORKBENCH_FLOW_TABS = [
  { id: 'brainstorm', title: '脑洞', meta: '1个脑洞' },
  { id: 'setting', title: '设定', meta: '14个设定' },
  { id: 'detailOutline', title: '章纲', meta: '0章' },
  { id: 'chapterText', title: '正文', meta: '7章' },
  { id: 'reviewAudit', title: '剧情审核', meta: '7章未审' },
  { id: 'reviewPolish', title: '文笔润色', meta: '7章未润色' },
  { id: 'reviewComment', title: '综合点评', meta: '7章未点评' },
  { id: 'statusUpdate', title: '更新状态', meta: '7章未更新' },
  { id: 'summary', title: '生成梗概', meta: '0章' },
] as const;

type FlowId = (typeof WORKBENCH_FLOW_TABS)[number]['id'];
type RightPanelKind = 'brainstorm' | 'setting' | 'outline' | 'chapterText' | 'review' | 'status';

type PreviewFlow = {
  id: FlowId;
  title: string;
  prompt: string;
  rightPanelKind: RightPanelKind;
  outputTitle: string;
  outputPlaceholder: string;
  footerButtons?: string[];
};

const modelOptions: CapsuleSelectOption[] = [
  { value: 'deepseek', label: 'deepseek' },
  { value: 'gpt', label: 'GPT' },
];

const promptOptions: CapsuleSelectOption[] = [
  { value: 'brainstorm', label: '脑洞' },
  { value: 'outline', label: '大纲11' },
  { value: 'detailOutline', label: '章纲' },
  { value: 'chapterText', label: '无可用提示词' },
  { value: 'reviewAudit', label: '结构审核' },
  { value: 'reviewPolish', label: '文笔润色' },
  { value: 'reviewComment', label: '综合点评' },
  { value: 'statusUpdate', label: '更新状态' },
  { value: 'summary', label: '生成梗概' },
];

const previewFlows: PreviewFlow[] = [
  {
    id: 'brainstorm',
    title: '脑洞',
    prompt: 'brainstorm',
    rightPanelKind: 'brainstorm',
    outputTitle: '脑洞输出',
    outputPlaceholder: '这里显示本次 AI 生成的脑洞，保存脑洞时只保存这里的内容。',
    footerButtons: ['保存脑洞', '复制脑洞', '清空脑洞'],
  },
  {
    id: 'setting',
    title: '设定',
    prompt: 'outline',
    rightPanelKind: 'setting',
    outputTitle: '生成设定',
    outputPlaceholder: '这里显示 AI 生成或整理后的设定内容。',
    footerButtons: ['替换设定', '复制内容', '清空内容'],
  },
  {
    id: 'detailOutline',
    title: '章纲',
    prompt: 'detailOutline',
    rightPanelKind: 'outline',
    outputTitle: '生成章纲',
    outputPlaceholder: '生成后的章纲会显示在这里，也可以手动编辑后替换所选章纲。',
    footerButtons: ['替换章纲', '撤销替换', '复制章纲'],
  },
  {
    id: 'chapterText',
    title: '正文',
    prompt: 'chapterText',
    rightPanelKind: 'chapterText',
    outputTitle: 'AI 对话框',
    outputPlaceholder: '暂无对话内容...',
    footerButtons: ['替换正文', '撤回替换', '复制正文', '清空内容'],
  },
  {
    id: 'reviewAudit',
    title: '剧情审核',
    prompt: 'reviewAudit',
    rightPanelKind: 'review',
    outputTitle: 'AI 输出',
    outputPlaceholder: '结构审核结果会显示在这里。',
  },
  {
    id: 'reviewPolish',
    title: '文笔润色',
    prompt: 'reviewPolish',
    rightPanelKind: 'review',
    outputTitle: 'AI 输出',
    outputPlaceholder: '文笔润色结果会显示在这里。',
  },
  {
    id: 'reviewComment',
    title: '综合点评',
    prompt: 'reviewComment',
    rightPanelKind: 'review',
    outputTitle: 'AI 输出',
    outputPlaceholder: '综合点评内容会显示在这里。',
  },
  {
    id: 'statusUpdate',
    title: '更新状态',
    prompt: 'statusUpdate',
    rightPanelKind: 'status',
    outputTitle: '生成状态',
    outputPlaceholder: '状态更新结果会显示在这里。',
  },
  {
    id: 'summary',
    title: '生成梗概',
    prompt: 'summary',
    rightPanelKind: 'outline',
    outputTitle: '生成梗概',
    outputPlaceholder: '生成后的梗概会显示在这里，也可以手动编辑后保存。',
    footerButtons: ['保存梗概', '撤销替换', '复制梗概'],
  },
];

function WidthStepper() {
  return (
    <div className="grid h-9 w-[100px] shrink-0 grid-cols-[1fr_42px_1fr] overflow-hidden rounded-lg border border-gray-200 bg-white text-sm font-black">
      <button type="button" className="grid place-items-center bg-slate-50 text-slate-600">
        <Minus className="h-4 w-4" />
      </button>
      <div className="grid place-items-center border-x border-gray-200 text-slate-950">14</div>
      <button type="button" className="grid place-items-center bg-slate-50 text-slate-600">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function SettingAssociationBar() {
  return (
    <div className="mt-3">
      <div className="flex h-10 w-full min-w-0 overflow-hidden rounded-lg border border-[#08B3D9]/30 bg-white">
        <div className="flex w-12 shrink-0 items-center justify-center border-r border-[#08B3D9]/30 bg-[#E9FAFE] text-sm font-black text-[#078BA9]">
          关联
        </div>
        <button type="button" className="w-[86px] shrink-0 bg-white px-2 text-sm font-bold text-gray-600">
          当前设定
        </button>
        <div className="flex shrink-0 border-l border-[#08B3D9]/30">
          <button type="button" className="w-[96px] px-1.5 text-sm font-bold text-gray-700">
            其他设定
          </button>
          <button type="button" className="grid w-9 place-items-center bg-red-500 text-white" title="取消关联其他设定">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex shrink-0 border-l border-[#08B3D9]/30">
          <button type="button" className="w-[90px] px-1.5 text-sm font-bold text-gray-700">
            已关联脑洞
          </button>
          <button type="button" className="grid w-9 place-items-center bg-red-500 text-white" title="取消关联脑洞">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-1 text-right text-xs font-bold text-slate-400">关联 4074 字</div>
    </div>
  );
}

function OutlineAssociationBar() {
  return (
    <div className="mt-3 flex items-center gap-2">
      <div className="flex h-10 w-[132px] shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <button type="button" className="min-w-0 flex-1 whitespace-nowrap bg-brand px-3 text-sm font-black text-white">
          已关联大纲
        </button>
        <button type="button" className="flex h-full w-9 shrink-0 items-center justify-center border-l border-blue-200 bg-white text-brand">
          <X className="h-4 w-4" />
        </button>
      </div>
      <span className="min-w-0 truncate text-xs font-bold text-slate-400">关联 8261 字</span>
    </div>
  );
}

function ContextMaterialTabs() {
  return (
    <div className="mt-3 grid h-10 grid-cols-3 overflow-hidden rounded-xl border border-gray-200 bg-white text-sm font-black">
      <button type="button" className="bg-white text-brand">关联</button>
      <button type="button" className="border-l border-gray-200 text-slate-700">本章</button>
      <button type="button" className="border-l border-gray-200 bg-brand text-white">已关联资料</button>
    </div>
  );
}

function SmartImportControl() {
  const [locked, setLocked] = useState(true);
  return (
    <div className="mt-3 flex h-10 w-44 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        disabled={locked}
        className={`min-w-0 flex-1 whitespace-nowrap px-3 text-sm font-bold ${
          locked ? 'cursor-not-allowed bg-gray-50 text-gray-300' : 'bg-[#08AACE] text-white'
        }`}
      >
        智能导入设定
      </button>
      <button
        type="button"
        onClick={() => setLocked((value) => !value)}
        className="flex h-full w-10 shrink-0 items-center justify-center border-l border-amber-200 bg-amber-50 text-amber-500"
      >
        {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
      </button>
    </div>
  );
}

function FloatingOutput({ flow }: { flow: PreviewFlow }) {
  return (
    <div className="relative mt-5 min-h-[250px] flex-1">
      <div className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-fill xy-floating-with-bottom-count h-full">
        <textarea readOnly value="" placeholder={flow.outputPlaceholder} className="editor-scrollbar" />
        <label>{flow.outputTitle}</label>
        <span className="xy-floating-count">0 字</span>
      </div>
    </div>
  );
}

function FooterButtons({ labels }: { labels: string[] }) {
  return (
    <div className={`mt-3 grid h-10 overflow-hidden rounded-xl border border-gray-200 bg-white text-sm font-black ${labels.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
      {labels.map((label, index) => (
        <button
          key={label}
          type="button"
          className={[
            'min-w-[92px] whitespace-nowrap px-2 transition-colors',
            index === 0 ? 'bg-brand text-white' : 'border-l border-gray-200 text-slate-600',
            label.includes('清空') ? 'text-red-500' : '',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function RightAiRegion({ flow, rightWidth }: { flow: PreviewFlow; rightWidth: number }) {
  const [input, setInput] = useState('');
  const isReviewLike = flow.rightPanelKind === 'review' || flow.rightPanelKind === 'status';

  return (
    <aside
      className="min-w-0 flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2"
      style={{ width: rightWidth }}
    >
      <CombinedAiConfigSelect
        modelValue="deepseek"
        promptValue={flow.prompt}
        modelOptions={modelOptions}
        promptOptions={promptOptions}
        onModelChange={() => undefined}
        onPromptChange={() => undefined}
        onModelManage={() => undefined}
        onPromptManage={() => undefined}
        className="shrink-0"
      />

      {flow.rightPanelKind === 'setting' && <SettingAssociationBar />}
      {flow.rightPanelKind === 'setting' && <SmartImportControl />}
      {flow.rightPanelKind === 'outline' && <OutlineAssociationBar />}
      {flow.rightPanelKind === 'chapterText' && <ContextMaterialTabs />}
      {flow.rightPanelKind === 'review' && (
        <div className="mt-3 text-sm font-black leading-7 text-slate-900">
          当前章节：第5章<br />
          正文字数：3813 字<br />
          关联章纲：未读取到
        </div>
      )}
      {flow.rightPanelKind === 'status' && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3 text-xs font-bold leading-6 text-slate-500">
          选择状态条目后，AI 会根据正文和关联资料更新当前人物、势力、道具状态。
        </div>
      )}

      <FloatingOutput flow={flow} />

      <AiInlineInput
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onSend={() => undefined}
        onStop={() => undefined}
        placeholder="请输入要求"
        aria-label={`${flow.title}要求`}
        className="mt-3 shrink-0"
      />

      {flow.footerButtons && !isReviewLike && <FooterButtons labels={flow.footerButtons} />}
    </aside>
  );
}

function WorkbenchTopTabs({ activeId }: { activeId: FlowId }) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-3">
      <div className="grid h-9 grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white text-sm font-black">
        <button type="button" className="px-5 text-slate-900">大主宰</button>
        <button type="button" className="border-l border-slate-200 bg-[#E7F8FD] px-5 text-[#08AACE]">作品信息</button>
      </div>
      <div className="flex min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200">
        {WORKBENCH_FLOW_TABS.map((tab) => (
          <div
            key={tab.id}
            className={`flex h-10 min-w-[118px] flex-col items-center justify-center border-r border-slate-200 px-3 text-center last:border-r-0 ${
              tab.id === activeId ? 'bg-[#E7F8FD] text-[#08AACE]' : 'bg-white text-slate-950'
            }`}
          >
            <span className="text-sm font-black leading-4">{tab.title}</span>
            <span className="text-[11px] font-black leading-4 text-amber-700">{tab.meta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkbenchCenterMock({ flow }: { flow: PreviewFlow }) {
  return (
    <main className="min-w-0 flex-1 overflow-hidden bg-white">
      <div className="flex h-14 items-center justify-between border-b border-gray-100 px-5">
        <div>
          <div className="text-xl font-black text-slate-950">{flow.title} 页面预览</div>
          <div className="mt-0.5 text-xs font-bold text-slate-400">中间区域只是占位，右侧区域按宽度对比。</div>
        </div>
        {(flow.id === 'chapterText' || flow.id === 'reviewAudit') && <WidthStepper />}
      </div>
      <div className="h-full bg-[#fffdf8] p-8">
        <div className="mx-auto h-full max-w-[760px] rounded-2xl border border-dashed border-slate-200 bg-white/70 p-8 text-lg leading-10 text-slate-500">
          用这个完整页面框架判断右侧区域在 420px 和 460px 下，会不会把按钮挤出软件宽度或造成换行。
        </div>
      </div>
    </main>
  );
}

function WorkbenchFlowShell({ flow, rightWidth }: { flow: PreviewFlow; rightWidth: number }) {
  return (
    <div className="w-[1280px] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <WorkbenchTopTabs activeId={flow.id} />
      <div className="flex h-[620px] min-h-0">
        <WorkbenchCenterMock flow={flow} />
        <RightAiRegion flow={flow} rightWidth={rightWidth} />
      </div>
    </div>
  );
}

export function WorkbenchAiRightWidthPreviewTestPage() {
  return (
    <div className="h-full overflow-y-auto bg-slate-100 px-6 py-6 text-slate-900">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-black">右侧 AI 区宽度预览</h1>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
            第 10 号测试：每个流程页都放进同一套 1280px 页面框架里，分别查看 420px 和 460px 右侧 AI 区是否导致按钮换行、X 按钮溢出或超出软件区域。
          </p>
        </header>

        {previewFlows.map((flow) => (
          <section key={flow.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">{flow.title}</h2>
                <p className="mt-1 text-sm font-bold text-slate-400">左侧为 420px，右侧为 460px，均包含顶部流程导航和中间页面区域。</p>
              </div>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-2">
              {RIGHT_PANEL_WIDTHS.map((rightWidth) => (
                <div key={`${flow.id}-${rightWidth}`} className="space-y-2">
                  <div className="rounded-full bg-slate-900 px-3 py-1 text-center text-xs font-black text-white">{rightWidth}px</div>
                  <WorkbenchFlowShell flow={flow} rightWidth={rightWidth} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
