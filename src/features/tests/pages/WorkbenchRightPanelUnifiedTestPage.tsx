import { Link2, MessageSquareText, Send, Settings2, SlidersHorizontal, type LucideIcon } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { Settings } from 'lucide-react';
import { useMemo, useState } from 'react';

type PanelMode = {
  id: string;
  title: string;
  width: number;
  prompt: string;
  contextLabel: string;
  contextMeta: string;
  rules: Array<{ label: string; value: string }>;
  inputLabel: string;
  action: string;
};

const t = {
  workTitle: '\u6d4b\u8bd5\u4f5c\u54c1\uff1a\u7075\u6c14\u590d\u82cf\u4e4b\u540e',
  info: '\u4f5c\u54c1\u4fe1\u606f',
  outline: '\u5927\u7eb2',
  plot: '\u5267\u60c5\u94fe',
  detail: '\u7ae0\u7eb2',
  writing: '\u6b63\u6587',
  brainstorm: '\u8111\u6d1e',
  audit: '\u5ba1\u6838',
  comment: '\u70b9\u8bc4',
  status: '\u72b6\u6001',
  summary: '\u6982\u8981',
  aiConfig: 'AI \u914d\u7f6e',
  model: '\u6a21\u578b',
  prompt: '\u63d0\u793a\u8bcd',
  log: '\u8f93\u51fa\u65e5\u5fd7',
  manage: '\u7ba1\u7406',
  rules: '\u751f\u6210\u89c4\u5219',
  clear: '\u6e05\u7a7a',
  current: '\u5f53\u524d\u53f3\u4fa7\u533a\u57df',
  unifiedSettings: '\u7edf\u4e00\u6a21\u578b\u4e0e\u63d0\u793a\u8bcd\u8bbe\u7f6e',
  after: '\u6539\u540e\u53f3\u4fa7\u533a\u57df',
  adjust: '\u8c03\u6574',
  saveAll: '\u4fdd\u5b58\u5168\u90e8',
};

const modes: PanelMode[] = [
  {
    id: 'outline',
    title: t.outline,
    width: 360,
    prompt: '\u5927\u7eb2\u751f\u6210\u9ed8\u8ba4\u63d0\u793a\u8bcd',
    contextLabel: '\u5173\u8054\u8111\u6d1e',
    contextMeta: '\u5df2\u5173\u8054 1 \u9879 · 1280 \u5b57',
    rules: [
      { label: '\u7ed3\u6784', value: '\u4e09\u5e55\u5f0f' },
      { label: '\u957f\u5ea6', value: '\u4e2d\u7b49' },
      { label: '\u89c6\u89d2', value: '\u7537\u9891\u723d\u6587' },
    ],
    inputLabel: '\u8865\u5145\u8981\u6c42',
    action: '\u751f\u6210\u5927\u7eb2',
  },
  {
    id: 'plot',
    title: t.plot,
    width: 360,
    prompt: '\u5267\u60c5\u94fe2',
    contextLabel: '\u5173\u8054\u8bbe\u5b9a',
    contextMeta: '\u5df2\u5173\u8054 6 \u9879 · 5420 \u5b57',
    rules: [
      { label: '\u6570\u91cf', value: '5 \u4e2a' },
      { label: '\u9636\u6bb5', value: '\u7ee7\u7eed\u751f\u6210' },
      { label: '\u957f\u5ea6', value: '\u7cbe\u70bc' },
    ],
    inputLabel: '\u5267\u60c5\u70b9\u8981\u6c42',
    action: '\u5237\u65b0\u5267\u60c5\u70b9',
  },
  {
    id: 'detail',
    title: t.detail,
    width: 360,
    prompt: '\u7ae0\u7eb2\u9ed8\u8ba4\u63d0\u793a\u8bcd',
    contextLabel: '\u5173\u8054\u5185\u5bb9',
    contextMeta: '\u8bbe\u5b9a 4 \u9879 · \u5267\u60c5\u94fe 3 \u6761 · \u524d\u6587 2 \u7ae0',
    rules: [
      { label: '\u8f93\u51fa', value: '\u5199\u4f5c\u6267\u884c\u7a3f' },
      { label: '\u8282\u594f', value: '\u5f3a\u51b2\u7a81' },
      { label: '\u5b57\u6570', value: '800 \u5b57\u5185' },
    ],
    inputLabel: '\u672c\u7ae0\u8981\u6c42',
    action: '\u751f\u6210\u7ae0\u7eb2',
  },
  {
    id: 'summary',
    title: t.summary,
    width: 360,
    prompt: '\u6982\u8981\u9ed8\u8ba4\u63d0\u793a\u8bcd',
    contextLabel: '\u5f53\u524d\u7ae0\u8282',
    contextMeta: '\u7b2c 2 \u7ae0 · \u7b2c 1 \u5377 · 3260 \u5b57',
    rules: [
      { label: '\u8303\u56f4', value: '\u672c\u7ae0' },
      { label: '\u8f93\u51fa', value: '\u7b80\u6d01\u6982\u8981' },
      { label: '\u957f\u5ea6', value: '300 \u5b57\u5185' },
    ],
    inputLabel: '\u6982\u8981\u8981\u6c42',
    action: '\u751f\u6210\u6982\u8981',
  },
  {
    id: 'audit',
    title: t.audit,
    width: 300,
    prompt: '\u7ae0\u8282\u5ba1\u6838',
    contextLabel: '\u5f53\u524d\u7ae0\u8282',
    contextMeta: '\u7b2c 12 \u7ae0 · 3240 \u5b57',
    rules: [
      { label: '\u8303\u56f4', value: '\u95ee\u9898\u5b9a\u4f4d' },
      { label: '\u8f93\u51fa', value: '\u4fee\u6539\u5efa\u8bae' },
      { label: '\u5bf9\u7167', value: '\u7ae0\u7eb2' },
    ],
    inputLabel: '\u5ba1\u6838\u8981\u6c42',
    action: '\u5f00\u59cb\u5ba1\u6838',
  },
  {
    id: 'status',
    title: t.status,
    width: 360,
    prompt: '\u72b6\u6001\u66f4\u65b0',
    contextLabel: '\u72b6\u6001\u76ee\u6807',
    contextMeta: '\u5df2\u9009\u62e9 5 \u5f20\u8bbe\u5b9a\u5361',
    rules: [
      { label: '\u7ae0\u8282', value: '\u66f4\u65b0\u5230\u7b2c 12 \u7ae0' },
      { label: '\u5199\u5165', value: '\u8986\u76d6\u65e7\u72b6\u6001' },
      { label: '\u7c7b\u578b', value: '\u89d2\u8272/\u5b9d\u7269/\u52bf\u529b' },
    ],
    inputLabel: '\u65b0\u7684\u72b6\u6001',
    action: '\u4fdd\u5b58\u72b6\u6001',
  },
];

function FlowButton({ active, children, onClick }: { active: boolean; children: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-xl px-4 text-sm font-black transition-colors ${
        active ? 'bg-[#08AACE] text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-[#EAF9FD] hover:text-[#08AACE]'
      }`}
    >
      {children}
    </button>
  );
}

function SectionHeader({ icon: Icon, title, action }: { icon: LucideIcon; title: string; action?: string }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-[#08AACE]" />
        <h3 className="truncate text-sm font-black text-slate-950">{title}</h3>
      </div>
      {action ? (
        <button className="h-7 shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-black text-slate-500 hover:border-[#08AACE] hover:text-[#08AACE]">
          {action}
        </button>
      ) : null}
    </div>
  );
}

function CurrentCapsuleSelectMock({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative h-11 min-w-0 rounded-xl border-2 border-[#08AACE] bg-white">
      <span className="absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-1.5 text-[11px] font-black leading-none text-[#08AACE]">
        {label}
      </span>
      <button
        type="button"
        className="grid h-full w-full grid-cols-[minmax(0,1fr)_30px_48px] items-center overflow-hidden rounded-[10px] text-left"
      >
        <span className="min-w-0 truncate pl-6 pr-1 text-sm font-black text-slate-800">{value}</span>
        <span className="grid h-full place-items-center text-sm font-black text-[#08AACE]">{'\u2304'}</span>
        <span className="grid h-full place-items-center border-l border-[#08AACE]/25 bg-[#EAF9FD] text-xs font-black text-[#08AACE]">
          {t.manage}
        </span>
      </button>
    </div>
  );
}

function FloatingSessionToolMock() {
  return (
    <div className="xy-floating-edge-tool xy-floating-chat-session-tool">
      <div className="flex h-7 max-w-full items-center gap-1 overflow-hidden bg-white">
        <div className="scrollbar-hidden flex min-w-0 items-center gap-1 overflow-x-auto">
          <button
            type="button"
            className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-gray-200 bg-white text-gray-700 hover:border-[#08AACE] hover:text-[#08AACE]"
            title="新建会话"
          >
            <span className="-mt-px block text-[17px] font-bold leading-none">+</span>
          </button>
          <button
            type="button"
            className="flex h-6 min-w-6 items-center justify-center rounded-md border border-[#08AACE]/30 bg-[#08AACE]/10 px-1.5 text-xs font-bold leading-none text-[#08AACE]"
            title="会话 1"
          >
            1
          </button>
        </div>
      </div>
    </div>
  );
}

function CurrentRightPanel({ mode }: { mode: PanelMode }) {
  return (
    <aside className="flex h-full min-h-0 flex-col border border-slate-200 bg-gray-50" style={{ width: mode.width }}>
      <div className="editor-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <section className="space-y-3">
          <div className="grid grid-cols-[minmax(0,1fr)_76px] items-center gap-2">
            <CurrentCapsuleSelectMock label={t.model} value="DS-v4-flash" />
            <button className="h-10 rounded-xl border border-slate-200 bg-white px-2 text-xs font-black text-slate-600 shadow-sm hover:border-[#08AACE] hover:text-[#08AACE]">
              {t.log}
            </button>
          </div>
          <CurrentCapsuleSelectMock label={t.prompt} value={mode.prompt} />
        </section>

        <section className="relative min-h-[170px] rounded-xl border-2 border-[#08AACE] bg-white p-3 pt-5">
          <span className="absolute left-4 top-0 -translate-y-1/2 bg-white px-1.5 text-[11px] font-black leading-none text-[#08AACE]">
            {'AI\u5bf9\u8bdd\u6846'}
          </span>
          <FloatingSessionToolMock />
          <button className="absolute right-3 top-2 text-xs font-black text-red-500">{t.clear}</button>
          <div className="editor-scrollbar flex h-[132px] flex-col gap-3 overflow-y-auto pt-9 text-sm font-bold leading-6 text-slate-600">
            <div className="rounded-xl bg-[#EAF9FD] px-3 py-2 text-[#057F9B]">
              {'\u5f53\u524d\u9875\u9762\u7684 AI \u8f93\u5165\u548c\u8f93\u51fa\u533a\u57df'}
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-slate-500">
              {'\u4fdd\u7559\u73b0\u6709\u5bf9\u8bdd\u6846\u7684\u5927\u8fb9\u6846\u548c\u53f3\u4e0a\u6e05\u7a7a\u5165\u53e3'}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-2 text-sm font-black text-slate-950">{mode.contextLabel}</div>
          <button className="h-10 min-w-[118px] whitespace-nowrap rounded-xl border border-[#08AACE] bg-white px-4 text-sm font-black text-[#08AACE]">
            {mode.contextLabel}
          </button>
          <div className="mt-2 text-xs font-black leading-5 text-[#08AACE]">{mode.contextMeta}</div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-2 text-sm font-black text-slate-950">{t.rules}</div>
          <div className="space-y-2">
            {mode.rules.map((rule) => (
              <label key={rule.label} className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-2 text-xs font-black text-slate-500">
                <span>{rule.label}</span>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">{rule.value}</div>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-black text-slate-950">{mode.inputLabel}</div>
            <button className="text-xs font-black text-red-500">{t.clear}</button>
          </div>
          <textarea
            className="editor-scrollbar h-32 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold leading-6 text-slate-700 outline-none"
            defaultValue={'\u5e0c\u671b\u66f4\u5f3a\u8c03\u4e3b\u89d2\u5f53\u4e0b\u76ee\u6807\u3002'}
          />
        </section>
      </div>
    </aside>
  );
}
function UnifiedSettingsPage({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  return (
    <section className="flex h-full min-h-0 w-[620px] shrink-0 flex-col overflow-hidden border border-slate-200 bg-white">
      <div className="shrink-0 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-950">{t.unifiedSettings}</h2>
            <p className="mt-1 text-xs font-bold text-slate-400">{'\u7edf\u4e00\u9ed8\u8ba4\uff0c\u6bcf\u4e2a\u9875\u9762\u4ecd\u53ef\u5728\u53f3\u4fa7\u5feb\u6377\u8986\u76d6'}</p>
          </div>
          <button className="h-9 rounded-xl bg-[#08AACE] px-4 text-xs font-black text-white">{t.saveAll}</button>
        </div>
      </div>

      <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-[112px_minmax(0,1fr)_minmax(0,1fr)_72px] items-center gap-3 border-b border-slate-100 pb-2 text-xs font-black text-slate-400">
          <span>{'\u9875\u9762'}</span>
          <span>{'\u9ed8\u8ba4\u6a21\u578b'}</span>
          <span>{'\u9ed8\u8ba4\u63d0\u793a\u8bcd'}</span>
          <span>{'\u72b6\u6001'}</span>
        </div>
        <div className="space-y-2 pt-3">
          {modes.map((item) => {
            const active = item.id === activeId;
            return (
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className={`grid w-full grid-cols-[112px_minmax(0,1fr)_minmax(0,1fr)_72px] items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${
                  active ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-100 bg-white hover:border-[#08AACE]/40'
                }`}
              >
                <span className="text-sm font-black text-slate-950">{item.title}</span>
                <span className="truncate rounded-lg bg-slate-50 px-3 py-2 text-xs font-black text-slate-700">DeepSeek V3</span>
                <span className="truncate rounded-lg bg-slate-50 px-3 py-2 text-xs font-black text-slate-700">{item.prompt}</span>
                <span className={`justify-self-start rounded-full px-2 py-1 text-[11px] font-black ${active ? 'bg-[#08AACE] text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {active ? '\u5f53\u524d' : '\u9ed8\u8ba4'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PageOverrideRightPanel({ mode }: { mode: PanelMode }) {
  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-slate-100 bg-slate-50" style={{ width: mode.width }}>
      <div className="shrink-0 border-b border-slate-100 bg-white px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-base font-black text-slate-950">{t.after}</h2>
            </div>
            <p className="mt-1 text-xs font-bold leading-5 text-slate-400">{'\u4f7f\u7528\u7edf\u4e00\u8bbe\u7f6e\uff0c\u672c\u9875\u53ef\u4e34\u65f6\u8986\u76d6'}</p>
          </div>
          <button className="h-8 shrink-0 rounded-lg border border-[#08AACE]/30 bg-white px-3 text-xs font-black text-[#078fb0] hover:bg-[#EAF9FD]">{t.log}</button>
        </div>
      </div>

      <div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        <section className="rounded-lg border border-slate-200 bg-white p-3">
          <SectionHeader icon={Settings2} title={'\u5f53\u524d AI \u914d\u7f6e'} action={t.adjust} />
          <div className="space-y-2 text-xs font-black">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-slate-400">{t.model}</span>
              <span className="text-slate-800">DeepSeek V3</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-slate-400">{t.prompt}</span>
              <span className="min-w-0 truncate text-slate-800">{mode.prompt}</span>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-3">
          <SectionHeader icon={Link2} title={mode.contextLabel} action={t.manage} />
          <div className="rounded-lg bg-[#EAF9FD] px-3 py-2 text-xs font-black leading-5 text-[#078fb0]">{mode.contextMeta}</div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-3">
          <SectionHeader icon={SlidersHorizontal} title={t.rules} />
          <div className="grid grid-cols-1 gap-2">
            {mode.rules.map((rule) => (
              <div className="flex h-9 items-center justify-between rounded-lg bg-slate-50 px-3 text-xs font-black">
                <span className="text-slate-400">{rule.label}</span>
                <span className="text-slate-800">{rule.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-3">
          <SectionHeader icon={MessageSquareText} title={mode.inputLabel} action={t.clear} />
          <textarea
            className="editor-scrollbar h-36 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold leading-6 text-slate-700 outline-none focus:border-[#08AACE]"
            defaultValue={'\u5e0c\u671b\u66f4\u5f3a\u8c03\u4e3b\u89d2\u5f53\u4e0b\u76ee\u6807\u3001\u5916\u90e8\u538b\u529b\u548c\u4e0b\u4e00\u5e55\u94a9\u5b50\u3002'}
          />
        </section>
      </div>

      <div className="shrink-0 border-t border-slate-100 bg-white p-4">
        <button className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#08AACE] text-sm font-black text-white shadow-sm hover:bg-[#0798b8]">
          <Send className="h-4 w-4" />
          {mode.action}
        </button>
      </div>
    </aside>
  );
}

type CompactScheme = 'gear' | 'capsule' | 'edge' | 'bottom' | 'summary';

const compactSchemeMeta: Array<{ id: CompactScheme; title: string; desc: string }> = [
  { id: 'gear', title: 'A 小齿轮展开行', desc: '默认只露出模型简称和配置入口，点击后在顶部原地展开。' },
  { id: 'capsule', title: 'B 折叠胶囊条', desc: '模型和提示词合成一条 AI 配置胶囊，展开后显示组合下拉框。' },
  { id: 'edge', title: 'C 侧边悬停配置', desc: '默认只在右边缘露出 AI 小按钮，悬停时在栏内覆盖配置层。' },
  { id: 'bottom', title: 'D 底部工具条', desc: '配置摘要固定在底部，顶部和主体空间全部留给生成内容。' },
  { id: 'summary', title: 'E 摘要行编辑态', desc: '默认是一行配置摘要，点击后原地切换成组合下拉框。' },
];

function CombinedConfigSelectMock({ modelValue, promptValue }: { modelValue: string; promptValue: string }) {
  const [managementPanel, setManagementPanel] = useState<'model' | 'prompt' | null>(null);
  const managementTitle = managementPanel === 'model' ? '模型管理' : '提示词管理';

  return (
    <>
      <div className="grid h-11 min-w-0 grid-cols-2 overflow-visible rounded-xl border-2 border-[#08AACE] bg-white">
        <div className="relative min-w-0 border-r border-[#08AACE]/25">
          <button
            type="button"
            title={t.model}
            className="grid h-full w-full min-w-0 grid-cols-[minmax(0,1fr)_24px] items-center rounded-l-[10px] text-left transition-colors hover:bg-[#EAF9FD]"
          >
            <span className="min-w-0 truncate pl-4 pr-1 text-sm font-black text-slate-800">{modelValue}</span>
            <ChevronDown className="h-4 w-4 text-[#08AACE]" />
          </button>
          <span className="absolute left-3 top-0 z-10 -translate-y-1/2 bg-white px-1.5 text-[11px] font-black leading-none text-[#08AACE]">
            {t.model}
          </span>
          <button
            type="button"
            aria-label="模型管理"
            title="模型管理"
            onClick={() => setManagementPanel('model')}
            className="absolute right-7 top-0 z-10 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full bg-white text-[#08AACE] hover:bg-[#EAF9FD] hover:text-[#057F9B]"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="relative min-w-0">
          <button
            type="button"
            title={t.prompt}
            className="grid h-full w-full min-w-0 grid-cols-[minmax(0,1fr)_24px] items-center rounded-r-[10px] text-left transition-colors hover:bg-[#EAF9FD]"
          >
            <span className="min-w-0 truncate pl-4 pr-1 text-sm font-black text-slate-800">{promptValue}</span>
            <ChevronDown className="h-4 w-4 text-[#08AACE]" />
          </button>
          <span className="absolute left-3 top-0 z-10 -translate-y-1/2 bg-white px-1.5 text-[11px] font-black leading-none text-[#08AACE]">
            {t.prompt}
          </span>
          <button
            type="button"
            aria-label="提示词管理"
            title="提示词管理"
            onClick={() => setManagementPanel('prompt')}
            className="absolute right-7 top-0 z-10 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full bg-white text-[#08AACE] hover:bg-[#EAF9FD] hover:text-[#057F9B]"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {managementPanel && (
        <div className="fixed inset-0 z-[280] flex items-center justify-center bg-slate-950/35" onClick={() => setManagementPanel(null)}>
          <div
            className="w-[min(520px,92vw)] rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-950">{managementTitle}</h3>
              <button
                type="button"
                onClick={() => setManagementPanel(null)}
                className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-black text-slate-500 hover:border-[#08AACE] hover:text-[#08AACE]"
              >
                关闭
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm font-bold text-slate-600">
              <div className="rounded-xl bg-[#EAF9FD] px-3 py-2 text-[#078fb0]">
                {managementPanel === 'model' ? '这里预览模型管理窗口入口。' : '这里预览提示词管理窗口入口。'}
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                {managementPanel === 'model' ? modelValue : promptValue}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CompactConfigControls({ mode }: { mode: PanelMode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_76px] items-center gap-2">
      <CombinedConfigSelectMock modelValue="DS-v4-flash" promptValue={mode.prompt} />
      <button className="h-11 rounded-xl border border-slate-200 bg-white px-2 text-xs font-black text-slate-600 shadow-sm hover:border-[#08AACE] hover:text-[#08AACE]">
        {t.log}
      </button>
    </div>
  );
}

function CompactAiBody({ mode, bottomPadding = false }: { mode: PanelMode; bottomPadding?: boolean }) {
  if (mode.id === 'detail' || mode.id === 'summary') {
    const frameTitle = mode.id === 'detail' ? '\u7b2c2\u7ae0\u7ae0\u7eb2\uff08\u7b2c1\u5377\uff09' : '\u7b2c2\u7ae0\u6982\u8981\uff08\u7b2c1\u5377\uff09';
    const placeholder = mode.id === 'detail'
      ? '\u8fd9\u91cc\u662f\u7ae0\u7eb2\u5185\u5bb9\u3002\u5916\u5c42\u4e0d\u518d\u989d\u5916\u663e\u793a AI \u5bf9\u8bdd\u6846\uff0c\u6e05\u7a7a\u56de\u5230\u7ae0\u7eb2\u8fb9\u6846\u53f3\u4e0a\u89d2\u3002'
      : '\u8fd9\u91cc\u662f\u6982\u8981\u5185\u5bb9\u3002\u5916\u5c42\u53ea\u627f\u62c5\u5e03\u5c40\uff0c\u4e0d\u518d\u591a\u5957\u4e00\u5c42 AI \u5bf9\u8bdd\u6846\u6807\u9898\u3002';

    return (
      <div className={`editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-4 ${bottomPadding ? 'pb-16' : ''}`}>
        <section className="relative min-h-[220px]">
          <div className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count h-[220px] xy-has-value">
            <textarea
              value={placeholder}
              readOnly
              className="editor-scrollbar text-sm font-bold leading-6 text-slate-700 outline-none"
            />
            <label>{frameTitle}</label>
            <button className="xy-floating-edge-tool text-xs font-black text-red-500 hover:text-red-600">
              {t.clear}
            </button>
            <span className="xy-floating-count"><span className="text-brand">326</span><span className="text-slate-400"> 字</span></span>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mt-3 flex items-center justify-between gap-3">
            <button className="h-9 shrink-0 rounded-xl border border-[#08AACE] bg-white px-3 text-sm font-black text-[#08AACE] hover:bg-[#EAF9FD]">
              {mode.id === 'detail' ? '\u5173\u8054\u8bbe\u5b9a' : '\u5173\u8054\u7ae0\u8282'}
            </button>
            <div className="min-w-0 truncate text-right text-xs font-bold text-slate-400">
              {mode.contextMeta}
            </div>
          </div>

          <div className="mt-3">
            <div className="xy-floating-field xy-floating-ai xy-floating-compact xy-floating-with-inline-actions">
              <textarea rows={1} className="editor-scrollbar" />
              <label>{mode.inputLabel}</label>
              <div className="xy-ai-inline-actions">
                <button type="button" className="xy-ai-inline-send">
                  <span className="xy-ai-inline-send-icon"><Send className="h-6 w-6 stroke-[1.9]" /></span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex overflow-hidden rounded-xl border border-gray-200 bg-white">
            <button className="min-w-0 flex-1 bg-[#08AACE] px-3 py-2 text-sm font-bold text-white">
              {mode.id === 'detail' ? '\u4fdd\u5b58\u7ae0\u7eb2' : '\u4fdd\u5b58\u6982\u8981'}
            </button>
            <button className="min-w-0 flex-1 border-l border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-600">
              {mode.id === 'detail' ? '\u590d\u5236\u7ae0\u7eb2' : '\u590d\u5236\u6982\u8981'}
            </button>
            <button className="min-w-0 flex-1 border-l border-red-200 bg-red-600 px-3 py-2 text-sm font-bold text-white">
              {mode.id === 'detail' ? '\u6e05\u7a7a\u7ae0\u7eb2' : '\u6e05\u7a7a\u6982\u8981'}
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={`editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-4 ${bottomPadding ? 'pb-16' : ''}`}>
      <section className="relative min-h-[172px] rounded-xl border-2 border-[#08AACE] bg-white p-3 pt-5">
        <span className="absolute left-4 top-0 -translate-y-1/2 bg-white px-1.5 text-[11px] font-black leading-none text-[#08AACE]">
          {'AI\u5bf9\u8bdd\u6846'}
        </span>
        <FloatingSessionToolMock />
        <button className="absolute right-3 top-2 text-xs font-black text-red-500">{t.clear}</button>
        <div className="editor-scrollbar h-[132px] overflow-y-auto whitespace-pre-wrap rounded-xl bg-slate-50 px-3 pb-3 pt-10 text-xs font-bold leading-6 text-slate-600">
          {'\u8fd9\u91cc\u4fdd\u7559\u73b0\u6709 AI \u5bf9\u8bdd\u6846 UI\uff0c\u53ea\u628a\u6a21\u578b\u548c\u63d0\u793a\u8bcd\u914d\u7f6e\u6536\u7eb3\u8d77\u6765\u3002'}
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-3">
        <SectionHeader icon={Link2} title={mode.contextLabel} action={t.manage} />
        <div className="rounded-lg bg-[#EAF9FD] px-3 py-2 text-xs font-black leading-5 text-[#078fb0]">{mode.contextMeta}</div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-3">
        <SectionHeader icon={SlidersHorizontal} title={t.rules} />
        <div className="space-y-2">
          {mode.rules.map((rule) => (
            <div key={rule.label} className="flex h-9 items-center justify-between rounded-lg bg-slate-50 px-3 text-xs font-black">
              <span className="text-slate-400">{rule.label}</span>
              <span className="text-slate-800">{rule.value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CompactSchemeHeader({ scheme, mode }: { scheme: CompactScheme; mode: PanelMode }) {
  const [isGearConfigOpen, setIsGearConfigOpen] = useState(false);

  if (scheme === 'gear') {
    return (
      <div className="border-b border-slate-100 bg-white p-3">
        <div className={`${isGearConfigOpen ? 'mb-3' : ''} flex items-center justify-between gap-2`}>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#EAF9FD] px-2.5 py-1 text-xs font-black text-[#078fb0]">DS-v4</span>
            <button
              type="button"
              aria-pressed={isGearConfigOpen}
              aria-label={isGearConfigOpen ? '\u6536\u8d77 AI \u914d\u7f6e' : '\u5c55\u5f00 AI \u914d\u7f6e'}
              onClick={() => setIsGearConfigOpen((value) => !value)}
              className={`grid h-8 w-8 place-items-center rounded-xl border bg-white text-[#08AACE] shadow-sm transition-colors ${
                isGearConfigOpen ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-200 hover:border-[#08AACE] hover:bg-[#EAF9FD]'
              }`}
            >
              <Settings2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {isGearConfigOpen && <CompactConfigControls mode={mode} />}
      </div>
    );
  }

  if (scheme === 'capsule') {
    return (
      <div className="border-b border-slate-100 bg-white p-3">
        <button className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border-2 border-[#08AACE] bg-white px-3 text-left shadow-sm">
          <span className="min-w-0 truncate text-sm font-black text-slate-800">AI配置：DS-v4-flash / {mode.prompt}</span>
          <span className="shrink-0 text-sm font-black text-[#08AACE]">{'\u2304'}</span>
        </button>
        <div className="mt-3 rounded-xl bg-slate-50 p-3">
          <CompactConfigControls mode={mode} />
        </div>
      </div>
    );
  }

  if (scheme === 'edge') {
    return (
      <div className="relative border-b border-slate-100 bg-white p-3">
        <div className="absolute right-0 top-11 z-20 rounded-l-xl bg-[#08AACE] px-2 py-4 text-xs font-black text-white shadow-lg">AI</div>
        <div className="mt-3 rounded-xl border border-[#08AACE]/30 bg-white p-3 shadow-[0_16px_40px_rgba(8,170,206,0.16)]">
          <div className="mb-2 text-xs font-black text-[#078fb0]">悬停展开预览</div>
          <CompactConfigControls mode={mode} />
        </div>
      </div>
    );
  }

  if (scheme === 'summary') {
    return (
      <div className="border-b border-slate-100 bg-white p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <button className="min-w-0 flex-1 truncate rounded-xl border border-[#08AACE]/30 bg-[#EAF9FD] px-3 py-2 text-left text-xs font-black text-[#078fb0]">
            AI：DS-v4-flash · {mode.prompt}
          </button>
        </div>
        <CompactConfigControls mode={mode} />
      </div>
    );
  }

  return (
    <div className="border-b border-slate-100 bg-white p-3">
    </div>
  );
}

function CompactSchemePanel({ scheme, mode }: { scheme: CompactScheme; mode: PanelMode }) {
  return (
    <aside className="relative flex h-full min-h-0 flex-col border border-slate-200 bg-gray-50" style={{ width: mode.width }}>
      <CompactSchemeHeader scheme={scheme} mode={mode} />
      <CompactAiBody mode={mode} bottomPadding={scheme === 'bottom'} />
      {scheme === 'bottom' && (
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-white px-3 py-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)]">
          <button className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-[#08AACE]/30 bg-[#EAF9FD] px-3 text-xs font-black text-[#078fb0]">
            <span className="truncate">AI  DS-v4  ·  {mode.prompt}</span>
            <Settings2 className="h-4 w-4 shrink-0" />
          </button>
        </div>
      )}
    </aside>
  );
}

export function WorkbenchRightPanelUnifiedTestPage() {
  const [activeId, setActiveId] = useState(modes[0].id);
  const [activeScheme, setActiveScheme] = useState<CompactScheme>('capsule');
  const activeMode = useMemo(() => modes.find((item) => item.id === activeId) ?? modes[0], [activeId]);
  const activeSchemeMeta = compactSchemeMeta.find((item) => item.id === activeScheme) ?? compactSchemeMeta[0];

  return (
    <div className="xy-test-no-floating-tool-backplate flex h-full min-h-0 flex-col bg-white text-slate-900">
      <header className="shrink-0 border-b-2 border-[#08AACE] bg-white px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="min-w-[180px] text-base font-black text-slate-950">{t.workTitle}</div>
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
            <FlowButton active={false}>{t.info}</FlowButton>
            {modes.map((mode) => (
              <FlowButton key={mode.id} active={mode.id === activeId} onClick={() => setActiveId(mode.id)}>
                {mode.title}
              </FlowButton>
            ))}
            <FlowButton active={false}>{t.writing}</FlowButton>
            <FlowButton active={false}>{t.brainstorm}</FlowButton>
            <FlowButton active={false}>{t.comment}</FlowButton>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pl-[180px]">
          {compactSchemeMeta.map((scheme) => (
            <button
              key={scheme.id}
              type="button"
              onClick={() => setActiveScheme(scheme.id)}
              className={`h-8 shrink-0 rounded-xl px-3 text-xs font-black transition-colors ${
                activeScheme === scheme.id
                  ? 'bg-slate-950 text-white'
                  : 'border border-slate-200 bg-white text-slate-500 hover:border-[#08AACE] hover:text-[#08AACE]'
              }`}
            >
              {scheme.title}
            </button>
          ))}
          <span className="shrink-0 text-xs font-bold text-slate-400">{activeSchemeMeta.desc}</span>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden bg-slate-100 p-5">
        <div className="flex h-full min-h-0 items-stretch justify-center gap-10 overflow-hidden">
          <div className="flex min-h-0 flex-col">
            <div className="mb-2 text-sm font-black text-slate-700">当前右侧区域</div>
            <CurrentRightPanel mode={activeMode} />
          </div>
          <div className="flex min-h-0 flex-col">
            <div className="mb-2 text-sm font-black text-slate-700">方案预览：{activeSchemeMeta.title}</div>
            <CompactSchemePanel scheme={activeScheme} mode={activeMode} />
          </div>
        </div>
      </main>
    </div>
  );
}
