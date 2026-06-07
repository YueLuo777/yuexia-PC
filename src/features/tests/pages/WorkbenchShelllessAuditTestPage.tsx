import { CheckCircle2, FileText, Layers, Lightbulb, MessageSquareText, PenLine, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

type AuditStatus = 'shellless' | 'keep' | 'soften';

type AuditPage = {
  id: string;
  title: string;
  icon: typeof Lightbulb;
  status: AuditStatus;
  conclusion: string;
  reason: string;
  fields: Array<{ label: string; placeholder: string; wide?: boolean; tall?: boolean; count?: boolean }>;
};

const auditPages: AuditPage[] = [
  {
    id: 'brainstorm',
    title: '脑洞',
    icon: Lightbulb,
    status: 'shellless',
    conclusion: '输入字段外层建议去卡片壳',
    reason: '题材、故事主题、主角金手指等字段本身已经是强边框浮动字段，外层再包卡片会变成框里套框。',
    fields: [
      { label: '题材', placeholder: '如都市、玄幻' },
      { label: '故事主题', placeholder: '如系统流' },
      { label: '主角金手指', placeholder: '如吞噬系统、神豪系统', wide: true },
      { label: '你的构思', placeholder: '任何灵感都可以', wide: true },
      { label: '一次生成几个脑洞', placeholder: '1   2   3   5   10', wide: true, count: true },
      { label: '补充内容', placeholder: '主角名字、性格、女主设定等', wide: true, tall: true },
    ],
  },
  {
    id: 'outline',
    title: '大纲',
    icon: Layers,
    status: 'soften',
    conclusion: '生成参数区可弱化，AI 输出卡片保留',
    reason: '大纲右侧主输出框是页面核心卡片，应该保留；但模型、提示词、生成规则这类字段组外层不需要再套重卡片。',
    fields: [
      { label: '作品题材', placeholder: '都市异能' },
      { label: '结构', placeholder: '三幕式' },
      { label: '爽点', placeholder: '升级、反转、打脸', wide: true },
      { label: '补充要求', placeholder: '强调主角从普通维修工进入高武世界', wide: true, tall: true },
    ],
  },
  {
    id: 'detail',
    title: '章纲/概要',
    icon: FileText,
    status: 'keep',
    conclusion: '章节输出预览保留主卡片',
    reason: '章纲/概要的每个章节框就是主要阅读单位，不属于外层包裹卡片；应继续保留边框，但去掉贴边标题白底。',
    fields: [
      { label: '第1章章纲（第1卷）', placeholder: '主角夜间维修地下管廊，发现水表倒转...', wide: true, tall: true },
      { label: '第2章章纲（第1卷）', placeholder: '神秘住户提醒他不要触碰旧阀门...', wide: true, tall: true },
    ],
  },
  {
    id: 'writing',
    title: '正文',
    icon: PenLine,
    status: 'keep',
    conclusion: '正文 AI 主输出卡片保留',
    reason: '正文右侧 AI 输出区承载会话、字数统计、删除/清空和结果操作，是主工作面，不建议去掉主边界。',
    fields: [
      { label: 'AI 续写输出', placeholder: '这里显示续写、改写、审核或点评结果...', wide: true, tall: true },
      { label: '输入要求', placeholder: '请输入你对正文的要求...', wide: true },
    ],
  },
  {
    id: 'role',
    title: '角色/设定',
    icon: MessageSquareText,
    status: 'soften',
    conclusion: '字段组可去外壳，资料卡保留',
    reason: '角色名、状态、背景等编辑字段本身边界明确；角色列表项和资料卡仍需要保留卡片，方便扫读和选择。',
    fields: [
      { label: '角色名', placeholder: '林澈' },
      { label: '身份', placeholder: '维修工' },
      { label: '背景', placeholder: '从旧城管廊接触灵气复苏的普通人', wide: true, tall: true },
    ],
  },
  {
    id: 'review',
    title: '审核/点评/状态',
    icon: Sparkles,
    status: 'keep',
    conclusion: '操作结果卡片保留，只清理嵌套字段壳',
    reason: '这些页面更像结果工作台，需要明确分区承载审核结果、点评意见和状态更新；只需要避免参数字段外再套重卡片。',
    fields: [
      { label: '审核范围', placeholder: '当前章节' },
      { label: '输出方式', placeholder: '问题定位 + 修改建议' },
      { label: '补充要求', placeholder: '重点检查节奏、动机和前后文承接', wide: true, tall: true },
    ],
  },
];

const statusMeta: Record<AuditStatus, { label: string; className: string }> = {
  shellless: {
    label: '建议去外壳',
    className: 'border-[#08AACE]/30 bg-[#EAF9FD] text-[#08AACE]',
  },
  soften: {
    label: '建议弱化',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  keep: {
    label: '建议保留',
    className: 'border-slate-200 bg-slate-50 text-slate-600',
  },
};

function FloatingMockField({ field }: { field: AuditPage['fields'][number] }) {
  if (field.count) {
    return (
      <div className="xy-floating-field xy-floating-outline-fixed xy-floating-label-fixed xy-brainstorm-count-field xy-has-value">
        <div className="xy-brainstorm-count-options flex min-h-[52px] flex-nowrap items-center gap-1.5 px-3 pt-3">
          <button type="button" className="inline-flex h-8 min-w-[40px] items-center justify-center whitespace-nowrap rounded-xl border border-slate-200 bg-white px-2 text-sm font-black leading-none text-slate-700">1</button>
          <button type="button" className="inline-flex h-8 min-w-[40px] items-center justify-center whitespace-nowrap rounded-xl border border-[#08AACE] bg-[#08AACE] px-2 text-sm font-black leading-none text-white">2</button>
          <button type="button" className="inline-flex h-8 min-w-[40px] items-center justify-center whitespace-nowrap rounded-xl border border-slate-200 bg-white px-2 text-sm font-black leading-none text-slate-700">3</button>
          <button type="button" className="inline-flex h-8 min-w-[40px] items-center justify-center whitespace-nowrap rounded-xl border border-slate-200 bg-white px-2 text-sm font-black leading-none text-slate-700">5</button>
          <button type="button" className="inline-flex h-8 min-w-[40px] items-center justify-center whitespace-nowrap rounded-xl border border-slate-200 bg-white px-2 text-sm font-black leading-none text-slate-700">10</button>
        </div>
        <label>{field.label}</label>
      </div>
    );
  }

  return (
    <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact-textarea xy-floating-visible-placeholder xy-has-value ${field.wide ? 'md:col-span-2' : ''} ${field.tall ? 'flex min-h-[160px] flex-col' : ''}`}>
      <textarea
        readOnly
        value=""
        placeholder={field.placeholder}
        className="font-bold leading-5"
        style={{ height: field.tall ? '100%' : '52px' }}
      />
      <label>{field.label}</label>
    </div>
  );
}

function ShelllessPreview({ page }: { page: AuditPage }) {
  const showFrame = page.status === 'keep';
  const softened = page.status === 'soften';
  return (
    <div className={`min-h-0 ${showFrame ? 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm' : softened ? 'xy-soft-shell-panel p-4' : 'xy-shellless-panel p-4'}`}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {page.fields.map((field) => (
          <FloatingMockField field={field} />
        ))}
      </div>
    </div>
  );
}

export function WorkbenchShelllessAuditTestPage() {
  const [activeId, setActiveId] = useState(auditPages[0].id);
  const activePage = useMemo(() => auditPages.find((page) => page.id === activeId) ?? auditPages[0], [activeId]);
  const ActiveIcon = activePage.icon;
  const meta = statusMeta[activePage.status];

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <header className="shrink-0 border-b border-slate-100 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-950">作品编辑器外层卡片审查</h1>
            <p className="mt-1 text-xs font-bold text-slate-400">检查大纲、脑洞、正文等页面：只去掉多余外层壳，不动字段本体。</p>
          </div>
          <div className="rounded-2xl border border-[#08AACE]/20 bg-[#EAF9FD] px-4 py-2 text-xs font-black text-[#08AACE]">
            技术：xy-shellless-panel
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[270px_minmax(0,1fr)] overflow-hidden">
        <aside className="border-r border-slate-100 bg-white p-4">
          <div className="space-y-2">
            {auditPages.map((page) => {
              const Icon = page.icon;
              const itemMeta = statusMeta[page.status];
              const active = page.id === activeId;
              return (
                <button
                  type="button"
                  onClick={() => setActiveId(page.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition-colors ${
                    active ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-100 bg-white hover:border-[#08AACE]/40 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${active ? 'text-[#08AACE]' : 'text-slate-400'}`} />
                    <span className="min-w-0 flex-1 truncate text-sm font-black text-slate-900">{page.title}</span>
                  </div>
                  <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-black ${itemMeta.className}`}>
                    {itemMeta.label}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="editor-scrollbar min-h-0 overflow-y-auto p-6">
          <section className="mb-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <ActiveIcon className="h-5 w-5 text-[#08AACE]" />
                  <h2 className="text-lg font-black text-slate-950">{activePage.title}</h2>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-black ${meta.className}`}>{meta.label}</span>
                </div>
                <p className="mt-2 text-sm font-black text-slate-800">{activePage.conclusion}</p>
                <p className="mt-1 text-sm font-bold leading-6 text-slate-500">{activePage.reason}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 shrink-0 text-[#08AACE]" />
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-black text-slate-950">测试预览</h3>
                <span className="text-xs font-bold text-slate-400">模拟作品编辑器当前页字段区</span>
              </div>
              <ShelllessPreview page={activePage} />
            </section>

            <aside className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-black text-slate-950">审查规则</h3>
              <div className="mt-3 space-y-3 text-sm font-bold leading-6 text-slate-500">
                <p>去掉的是外层承载卡片，不是各个输入框。</p>
                <p>字段本身有粗边框、圆角、浮动标题时，外层只保留留白和滚动。</p>
                <p>AI 主输出、章节预览、列表项、弹窗、结果卡片仍保留边界。</p>
                <p>落地技术用 `xy-shellless-panel`，配合原容器的 `p-*`、滚动和宽度限制。</p>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
