import { Minus, Plus, Trash2, Type } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

type BackplateExample = {
  id: string;
  title: string;
  area: string;
  note: string;
  preview: ReactNode;
};

function PreviewFrame({
  children,
  content,
  height = 'h-[150px]',
}: {
  children: ReactNode;
  content?: ReactNode;
  height?: string;
}) {
  return (
    <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview relative ${height}`}>
      <div className="h-full rounded-[20px] border-2 border-[#d9e2ea] bg-white px-5 py-6 text-sm font-bold leading-7 text-slate-600">
        {content ?? '这里是测试内容区域。看边框上的控件是否遮线、是否有白底块、是否和正文区域的位置一致。'}
      </div>
      {children}
    </div>
  );
}

function FontToolPreview() {
  return (
    <div className="xy-floating-border-font-tool">
      <div className="flex h-full w-full items-center overflow-hidden rounded-md border border-slate-200 bg-white text-slate-700">
        <button type="button" className="grid h-full w-7 place-items-center border-r border-slate-100 text-slate-500">
          <Minus className="h-3 w-3" />
        </button>
        <span className="grid h-full w-8 place-items-center text-xs font-black">14</span>
        <button type="button" className="grid h-full w-7 place-items-center border-l border-slate-100 text-slate-500">
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

const brainstormLabelPreviewFields = [
  { label: '题材', placeholder: '如都市、玄幻', wide: false },
  { label: '故事主题', placeholder: '如系统流', wide: false },
  { label: '主角金手指', placeholder: '如吞噬系统、神豪系统', wide: true },
  { label: '你的构思', placeholder: '任何灵感都可以', wide: true },
  { label: '补充内容', placeholder: '主角名字、性格、女主设定等', wide: true },
];

function BrainstormLabelFieldPreview({
  field,
  previewFont = false,
}: {
  field: (typeof brainstormLabelPreviewFields)[number];
  previewFont?: boolean;
}) {
  return (
    <div className={`${field.wide ? 'col-span-2' : ''} xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact-textarea xy-floating-visible-placeholder xy-has-value`}>
      <textarea
        readOnly
        value=""
        placeholder={field.placeholder}
        rows={1}
        className="font-bold leading-5"
        style={{ height: '54px', overflowY: 'hidden' }}
      />
      <label
        style={previewFont ? {
          left: '22px',
          fontSize: '1rem',
          fontWeight: 500,
          lineHeight: '20px',
        } : undefined}
      >
        {field.label}
      </label>
    </div>
  );
}

function BrainstormLabelFontPreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <div className="mb-2 text-xs font-black text-slate-500">当前输入框标题</div>
        <div className="xy-brainstorm-question-panel grid grid-cols-2 gap-2.5 rounded-2xl bg-white p-3">
          {brainstormLabelPreviewFields.map((field) => (
            <BrainstormLabelFieldPreview {...{ key: field.label }} field={field} />
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 text-xs font-black text-[#08AACE]">脑洞预览字体方案 + T20</div>
        <div className="xy-brainstorm-question-panel grid grid-cols-2 gap-2.5 rounded-2xl bg-white p-3">
          {brainstormLabelPreviewFields.map((field) => (
            <BrainstormLabelFieldPreview {...{ key: field.label }} field={field} previewFont />
          ))}
        </div>
      </div>
    </div>
  );
}

const examples: BackplateExample[] = [
  {
    id: 'brainstorm-label-preview-font',
    title: '脑洞输入标题字体对比',
    area: '脑洞 / 题材、故事主题、构思输入框',
    note: '左侧是当前输入框标题字体；右侧把标题改成脑洞预览同级字号和字重，同时继续走 T20 透明背板遮线。',
    preview: <BrainstormLabelFontPreview />,
  },
  {
    id: 'left-title',
    title: '左上标题',
    area: '脑洞标题 / 输出框名',
    note: '只测试左上角贴边标题。标题本身透明遮线，不带一整块白底。',
    preview: (
      <PreviewFrame>
        <span className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-20 -translate-y-1/2 text-base font-black leading-5 text-slate-950">
          脑洞4
        </span>
      </PreviewFrame>
    ),
  },
  {
    id: 'detail-count-after-title',
    title: '章纲字数位置',
    area: '章纲卡片 / 左上标题右侧',
    note: '专门测试你刚指出的章纲字数位置：它不挤在卷号上，而是放到标题后面的边框空白处。',
    preview: (
      <PreviewFrame content="123333">
        <span className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-20 -translate-y-1/2 text-base font-black leading-5 text-slate-950">
          第1章章纲（第1卷）
        </span>
        <span className="xy-floating-count xy-floating-count-top-left" style={{ '--xy-floating-count-left': '12.8rem' } as CSSProperties}>
          6字
        </span>
      </PreviewFrame>
    ),
  },
  {
    id: 'right-meta',
    title: '右上章节元信息',
    area: '章纲卡片 / 右上角',
    note: '测试章节序号、章节名、正文字数贴在右上边框，不和左侧标题抢位置。',
    preview: (
      <PreviewFrame>
        <span className="xy-floating-outline-chapter-meta xy-border-embedded-transparent-backplate absolute right-8 top-0 z-20 max-w-[58%] -translate-y-1/2 truncate text-sm font-black leading-5 text-slate-950">
          第12章 雨夜入局 3056字
        </span>
      </PreviewFrame>
    ),
  },
  {
    id: 'right-actions',
    title: '右上删除清空',
    area: '脑洞输出框 / 正文右侧输出',
    note: '测试按钮本体压在线上。这里允许按钮是白色，因为白色是按钮本体，不是贴边文字背板。',
    preview: (
      <PreviewFrame>
        <div className="xy-floating-outline-output-clear-tool absolute z-30">
          <div className="flex h-7 max-w-full items-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <button type="button" className="h-full border-r border-slate-200 px-3 text-sm font-black text-red-500">
              删除
            </button>
            <button type="button" className="h-full px-3 text-sm font-black text-slate-700">
              清空
            </button>
          </div>
        </div>
      </PreviewFrame>
    ),
  },
  {
    id: 'bottom-left-font',
    title: '左下字号',
    area: '大纲 / 章纲 / 脑洞 / 正文右侧',
    note: '测试左下角字号工具。它是控件本体遮线，所以和文字透明背板不是同一种形态。',
    preview: (
      <PreviewFrame>
        <FontToolPreview />
      </PreviewFrame>
    ),
  },
  {
    id: 'bottom-stream',
    title: '底边流式输出',
    area: '脑洞输出框底边',
    note: '测试“流式输出 + 小滑块”整体嵌入边框，不能只剩一个孤立大滑块。',
    preview: (
      <PreviewFrame>
        <label className="xy-floating-border-stream-tool">
          <span className="xy-stream-toggle-text">流式输出</span>
          <input type="checkbox" checked readOnly />
          <span className="xy-stream-toggle-track">
            <span className="xy-stream-toggle-thumb" />
          </span>
        </label>
      </PreviewFrame>
    ),
  },
  {
    id: 'config-labels',
    title: '模型提示词标签',
    area: '右侧 AI 配置框',
    note: '测试模型和提示词的浮动标签。它们是输入框标签，不应该压到选中内容上。',
    preview: (
      <div className="grid gap-4">
        <div className="relative h-12 rounded-xl border border-slate-200 bg-white px-4 pt-4 text-sm font-black text-slate-700">
          <span className="xy-border-embedded-transparent-backplate absolute left-4 top-0 z-10 -translate-y-1/2 text-[11px] font-black leading-none text-[#08AACE]">
            模型
          </span>
          DeepSeek-R1
        </div>
        <div className="relative h-12 rounded-xl border border-slate-200 bg-white px-4 pt-4 text-sm font-black text-slate-700">
          <span className="xy-border-embedded-transparent-backplate absolute left-4 top-0 z-10 -translate-y-1/2 text-[11px] font-black leading-none text-[#08AACE]">
            提示词
          </span>
          章纲生成
        </div>
      </div>
    ),
  },
  {
    id: 'session-buttons',
    title: '会话按钮',
    area: '正文 AI 输出框',
    note: '测试 +、会话序号、垃圾桶这类按钮。它们应该靠按钮本体遮线，不要再套一层白色大背板。',
    preview: (
      <PreviewFrame>
        <div className="absolute left-5 top-0 z-20 flex -translate-y-1/2 items-center gap-1">
          <button type="button" className="grid h-6 w-6 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-[0_0_0_1px_#ffffff]">
            <Plus className="h-3 w-3" />
          </button>
          <button type="button" className="grid h-6 min-w-6 place-items-center rounded-md border border-[#08AACE] bg-[#EAF9FD] px-2 text-xs font-black text-[#08AACE] shadow-[0_0_0_1px_#ffffff]">
            1
          </button>
        </div>
        <button type="button" className="absolute right-5 top-0 z-20 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md border border-red-100 bg-white text-red-500 shadow-[0_0_0_1px_#ffffff]">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </PreviewFrame>
    ),
  },
];

export function BorderBackplateApplicationTestPage() {
  const renderExample = (example: BackplateExample) => (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-black text-slate-950">{example.title}</h2>
          <p className="mt-1 text-xs font-black text-[#08AACE]">{example.area}</p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-400">
          位置测试
        </span>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
        {example.preview}
      </div>
      <p className="mt-3 text-xs font-bold leading-5 text-slate-500">{example.note}</p>
    </section>
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-100 text-slate-900">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <Type className="h-5 w-5 text-[#08AACE]" />
          <h1 className="text-xl font-black text-slate-950">边框透明背板应用预览</h1>
        </div>
        <p className="mt-1 text-xs font-bold text-slate-400">
          这里不再测试同一张卡片的复制品，而是分别测试标题、字数、元信息、按钮、字号、流式输出、配置标签和会话按钮的真实边框位置。
        </p>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-5">
          {examples.map(renderExample)}
        </div>
      </main>
    </div>
  );
}
