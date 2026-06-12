import { Send, Square } from 'lucide-react';

type Variant = 'recommended' | 'quiet' | 'cyanText';

const CYAN_TEXT_FORCE_CLASS = 'xy-soft-cyan-force-text';

const mainFlows = ['默认小说1', '作品信息', '脑洞', '设定', '章纲', '正文', '审核', '点评', '润色', '状态', '梗概'];
const chapterRows = [
  { title: '第一卷', meta: '2章', active: false },
  { title: '第1章', meta: '0', active: true },
  { title: '第2章', meta: '54', active: false },
];

function softButtonClass(active = false, variant: Variant = 'recommended') {
  const base = 'inline-flex h-9 shrink-0 items-center justify-center rounded-[8px] border px-4 text-sm font-black transition-colors';
  const forceText = variant === 'cyanText' ? ` ${CYAN_TEXT_FORCE_CLASS}` : '';
  if (active) return `${base} border-[#E7F8FD] bg-[#E7F8FD] text-[#08AACE]${forceText}`;
  if (variant === 'cyanText') return `${base} border-[#E7F8FD] bg-white text-[#08AACE] hover:bg-[#E7F8FD]${forceText}`;
  if (variant === 'quiet') return `${base} border-[#E7F8FD] bg-white text-[#4f5d6b] hover:bg-[#E7F8FD] hover:text-[#08AACE]`;
  return `${base} border-[#E7F8FD] bg-white text-[#586574] hover:bg-[#DDF5FC] hover:text-[#08AACE]`;
}

function splitButtonClass(active = false, variant: Variant = 'recommended') {
  const forceText = variant === 'cyanText' ? ` ${CYAN_TEXT_FORCE_CLASS}` : '';
  return [
    'inline-flex h-9 shrink-0 items-center justify-center border-y border-r px-3 text-sm font-black first:rounded-l-[8px] first:border-l last:rounded-r-[8px]',
    active
      ? `border-[#E7F8FD] bg-[#E7F8FD] text-[#08AACE]${forceText}`
      : variant === 'cyanText'
        ? `border-[#E7F8FD] bg-white text-[#08AACE] hover:bg-[#E7F8FD]${forceText}`
      : 'border-[#E7F8FD] bg-white text-[#526171] hover:bg-[#DDF5FC] hover:text-[#08AACE]',
  ].join(' ');
}

function HeaderFlowPreview({ variant }: { variant: Variant }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-[#e4e9ef] bg-white p-3">
      <div className="flex overflow-hidden rounded-[8px] border border-[#edf1f5]">
        {mainFlows.map((flow) => (
          <button
            key={flow}
            type="button"
            className={`h-9 shrink-0 border-r border-[#edf1f5] px-4 text-sm font-black last:border-r-0 ${variant === 'cyanText' ? CYAN_TEXT_FORCE_CLASS : ''} ${
              flow === '作品信息' || flow === '正文'
                ? 'bg-[#E7F8FD] text-[#08AACE]'
                : variant === 'cyanText'
                  ? 'bg-white text-[#08AACE] hover:bg-[#E7F8FD]'
                : 'bg-white text-[#586574]'
            }`}
          >
            {flow}
          </button>
        ))}
      </div>
      <span className="text-xs font-bold text-[#9aa3af]">当前页选中态统一使用浅青底，不再使用深蓝块。</span>
    </div>
  );
}

function LeftSidebarPreview({ variant }: { variant: Variant }) {
  return (
    <aside className="flex h-[600px] w-[260px] shrink-0 flex-col border-r border-[#e4e9ef] bg-white">
      <div className="flex h-14 items-center gap-3 border-b border-[#e4e9ef] px-4">
        <span className="text-lg font-black text-[#1f2933]">未发布</span>
        <span className="rounded-full bg-[#E7F8FD] px-2.5 py-1 text-sm font-black text-[#08AACE]">2</span>
        <button className={`${softButtonClass(true, variant)} ml-auto px-3`}>展开已发布</button>
      </div>
      <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
        {chapterRows.map((row) => (
          <button
            key={row.title}
            type="button"
            className={`mb-1 grid h-11 w-full grid-cols-[minmax(0,1fr)_auto] items-center rounded-[8px] border px-3 text-left text-sm font-bold ${variant === 'cyanText' ? CYAN_TEXT_FORCE_CLASS : ''} ${
              row.active
                ? 'border-[#E7F8FD] bg-[#E7F8FD] text-[#08AACE]'
                : variant === 'cyanText'
                  ? 'border-transparent bg-white text-[#08AACE] hover:bg-[#E7F8FD]'
                : 'border-transparent bg-white text-[#4f5d6b] hover:bg-[#f7fbfd]'
            }`}
          >
            <span className="truncate">{row.title}</span>
            <span className={row.active || variant === 'cyanText' ? `text-[#08AACE] ${variant === 'cyanText' ? CYAN_TEXT_FORCE_CLASS : ''}` : 'text-[#9aa3af]'}>{row.meta}</span>
          </button>
        ))}
      </div>
      <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-[#e4e9ef] p-3">
        {['新增卷', '倒序', '导出章节'].map((label) => (
          <button key={label} type="button" className={softButtonClass(true, variant)}>{label}</button>
        ))}
        <button type="button" className="inline-flex h-9 items-center justify-center rounded-[8px] border border-red-100 bg-white px-4 text-sm font-black text-red-500">回收站</button>
      </div>
    </aside>
  );
}

function EditorToolbarPreview({ variant }: { variant: Variant }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[#f5f5f7]">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e4e9ef] bg-white px-4 py-3">
        <button className={softButtonClass(false, variant)}>第一卷</button>
        <button className={softButtonClass(false, variant)}>第1章</button>
        <input className="h-9 min-w-[260px] flex-1 rounded-[8px] border border-[#E7F8FD] bg-white px-3 text-sm font-bold text-[#586574] outline-none" placeholder="请输入章节标题" />
        <button className={splitButtonClass(false, variant)}>复制</button>
        <button className={splitButtonClass(true, variant)}>优化</button>
      </div>
      <div className="flex flex-wrap items-center gap-2 bg-white px-4 py-3">
        {['字体设置', '智能排版', '高频词', '一键替换', '复制正文', '历史'].map((label) => (
          <button key={label} className={softButtonClass(false, variant)}>{label}</button>
        ))}
        <button className={softButtonClass(true, variant)}>查找</button>
        <button className="inline-flex h-9 items-center justify-center rounded-[8px] border border-red-100 bg-white px-4 text-sm font-black text-red-500">删除</button>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden border-t border-[#edf1f5] px-8 py-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="mb-8 border-t border-dashed border-[#cbd5e1]" />
        ))}
        <div className="absolute bottom-4 right-5 text-sm font-bold text-[#9aa3af]">
          字数 <span className="text-[#08AACE]">0</span> · 自动保存
        </div>
      </div>
    </div>
  );
}

function RightPanelPreview({ variant }: { variant: Variant }) {
  return (
    <aside className="flex h-[600px] w-[360px] shrink-0 flex-col border-l border-[#e4e9ef] bg-white p-4">
      <div className="grid h-14 grid-cols-2 overflow-hidden rounded-[16px] border border-[#E7F8FD]">
        {['模型', '提示词'].map((label) => (
          <label key={label} className="relative flex flex-col justify-center border-r border-[#E7F8FD] px-4 last:border-r-0">
            <span className="absolute -top-2 left-3 bg-white px-1 text-xs font-black text-[#08AACE]">{label}</span>
            <span className="text-sm font-black text-[#1f2933]">{label === '模型' ? 'GLM' : '无可用提示词'}</span>
          </label>
        ))}
      </div>
      <div className="mt-3 min-h-0 flex-1 rounded-[20px] border border-[#E7F8FD] bg-white p-5 text-lg font-bold text-[#9aa3af]">
        暂无对话内容...
        <div className="mt-[360px] text-right text-sm">
          <span className="font-black text-[#08AACE]">0</span> 字
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex overflow-hidden rounded-[12px] border border-[#E7F8FD]">
          <button className={splitButtonClass(false, variant)}>关联</button>
          <button className={splitButtonClass(false, variant)}>本章</button>
          <button className={splitButtonClass(true, variant)}>已关联资料</button>
        </div>
        <span className="text-sm font-bold text-[#9aa3af]">
          已关联：<span className="text-[#08AACE]">1865</span> 字
        </span>
      </div>
      <div className="mt-3 flex h-12 items-center overflow-hidden rounded-[16px] border border-[#E7F8FD] bg-white">
        <input className="min-w-0 flex-1 bg-transparent px-4 text-sm font-bold text-[#586574] outline-none" placeholder="请输入要求" />
        <button className="grid h-full w-14 place-items-center border-l border-[#E7F8FD] text-[#08AACE]"><Send className="h-5 w-5" /></button>
        <button className="grid h-full w-12 place-items-center border-l border-[#E7F8FD] text-red-500"><Square className="h-4 w-4 fill-current" /></button>
      </div>
      <div className="mt-3 flex gap-2">
        {['替换正文', '撤回替换', '复制内容'].map((label) => (
          <button
            key={label}
            className={`h-10 flex-1 rounded-[8px] text-sm font-black ${
              variant === 'cyanText'
                ? `bg-[#E7F8FD] text-[#08AACE] ${CYAN_TEXT_FORCE_CLASS}`
                : 'bg-[#edf1f5] text-[#9aa3af]'
            }`}
          >
            {label}
          </button>
        ))}
        <button className="h-10 flex-1 rounded-[8px] bg-red-500 text-sm font-black text-white">清空内容</button>
      </div>
    </aside>
  );
}

function DesignPreview({ title, desc, variant }: { title: string; desc: string; variant: Variant }) {
  return (
    <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#1f2933]">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#6f7e90]">{desc}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[#f5f7fa] px-3 py-1 text-xs font-black text-[#7b8794]">
          <span className="h-3 w-3 rounded-full bg-[#E7F8FD] ring-1 ring-[#E7F8FD]" />
          #E7F8FD / #08AACE
        </div>
      </div>
      <HeaderFlowPreview variant={variant} />
      <div className="mt-4 flex overflow-hidden rounded-[8px] border border-[#e4e9ef]">
        <LeftSidebarPreview variant={variant} />
        <EditorToolbarPreview variant={variant} />
        <RightPanelPreview variant={variant} />
      </div>
    </section>
  );
}

export function WorkbenchSoftCyanButtonStyleTestPage() {
  return (
    <div className="editor-scrollbar h-full overflow-y-auto bg-[#f5f5f7] p-6">
      <style>
        {`
          .writer-assistant-theme .${CYAN_TEXT_FORCE_CLASS},
          .${CYAN_TEXT_FORCE_CLASS} {
            color: #08AACE !important;
          }
        `}
      </style>
      <div className="mx-auto max-w-[1680px] space-y-5">
        <header className="rounded-[8px] border border-[#e2e8f0] bg-white px-5 py-4 shadow-sm">
          <h1 className="text-xl font-black text-[#1f2933]">作品编辑器浅青按钮状态测试</h1>
          <p className="mt-2 max-w-5xl text-sm leading-6 text-[#6f7e90]">
            按你的截图，把红框中的当前页、主要操作按钮、展开已发布、章节操作、右侧配置边框、关联资料、输入框和已关联字数统一测试为浅青体系。选中态使用作品信息同款底色 #E7F8FD 和字体 #08AACE，蓝色边框改为 #E7F8FD。
          </p>
        </header>

        <DesignPreview
          title="方案 A：推荐，浅青选中态 + 白底操作按钮"
          desc="当前页和关键选中按钮用浅青底；普通操作保持白底，只把蓝色边框降为 #E7F8FD，整体比深蓝更轻。"
          variant="recommended"
        />

        <DesignPreview
          title="方案 B：更轻，边框存在感继续降低"
          desc="适合你觉得按钮还是太抢眼时使用。保留可点击感，但把 hover 和未选中状态都压低。"
          variant="quiet"
        />

        <DesignPreview
          title="方案 C：按钮文字统一 #08AACE"
          desc="不只改按钮底色，把按钮文字也统一成 #08AACE。选中态保留 #E7F8FD 底色，未选中按钮保持白底，但文字同样是 #08AACE。"
          variant="cyanText"
        />
      </div>
    </div>
  );
}

export default WorkbenchSoftCyanButtonStyleTestPage;
