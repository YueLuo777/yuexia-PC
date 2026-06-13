import { Send, Square } from 'lucide-react';

type Variant = 'recommended' | 'quiet' | 'cyanText' | 'quietBlackText';

const CYAN_TEXT_FORCE_CLASS = 'xy-soft-cyan-force-text';
const BLACK_TEXT_FORCE_CLASS = 'xy-soft-cyan-black-text';
const SOFT_CYAN_BORDER_CLASS = 'border-[#E7F8FD]';
const SOFT_CYAN_STRONG_BORDER_CLASS = 'border-[#BDEEF7]';

function softCyanBorderClass(variant: Variant) {
  return variant === 'quiet' || variant === 'quietBlackText' ? SOFT_CYAN_STRONG_BORDER_CLASS : SOFT_CYAN_BORDER_CLASS;
}

function activeTextClass(variant: Variant) {
  return variant === 'quietBlackText' ? `text-[#111827] ${BLACK_TEXT_FORCE_CLASS}` : 'text-[#08AACE]';
}

const mainFlows = ['默认小说1', '作品信息', '脑洞', '设定', '章纲', '正文', '审核', '点评', '润色', '状态', '梗概'];
const chapterRows = [
  { title: '第一卷', meta: '2章', active: false },
  { title: '第1章', meta: '0', active: true },
  { title: '第2章', meta: '54', active: false },
];

const accentColorOptions = [
  { name: '01 浅青蓝', color: '#08AACE', soft: '#E7F8FD', border: '#BDEEF7', note: '最接近作品信息按钮，整体最轻。' },
  { name: '02 湖蓝', color: '#0891B2', soft: '#EAFBFF', border: '#B8ECF6', note: '比浅青蓝更稳，右侧边框不刺眼。' },
  { name: '03 青绿', color: '#0F766E', soft: '#EAF8F5', border: '#BFE7DE', note: '偏沉静，适合长时间写作界面。' },
  { name: '04 墨青', color: '#256D85', soft: '#EAF4F7', border: '#C0DFEA', note: '蓝灰感更强，按钮权重适中。' },
  { name: '05 蓝灰', color: '#4F6F8F', soft: '#EEF4FA', border: '#CBD9E8', note: '接近系统工具风格，低饱和。' },
  { name: '06 石板蓝', color: '#475569', soft: '#F1F5F9', border: '#CBD5E1', note: '最克制，几乎不抢正文区注意力。' },
  { name: '07 蓝紫灰', color: '#5B5F97', soft: '#F0F1FB', border: '#D5D7F2', note: '有识别度，但比原蓝柔和。' },
  { name: '08 松石绿', color: '#2D8C7C', soft: '#ECF9F6', border: '#C5E9E2', note: '和浅灰背景搭配清爽。' },
  { name: '09 钢蓝', color: '#386FA4', soft: '#EDF5FC', border: '#C7DEF2', note: '保留蓝色操作感，降低鲜艳度。' },
  { name: '10 深天青', color: '#0E7490', soft: '#E7F7FB', border: '#B9E4EE', note: '比 #1E71EF 更贴近青色体系。' },
];

function softButtonClass(active = false, variant: Variant = 'recommended') {
  const base = 'inline-flex h-9 shrink-0 items-center justify-center rounded-[8px] border px-4 text-sm font-black transition-colors';
  const forceText = variant === 'cyanText' ? ` ${CYAN_TEXT_FORCE_CLASS}` : '';
  const borderClass = softCyanBorderClass(variant);
  if (active) return `${base} ${borderClass} bg-[#E7F8FD] ${activeTextClass(variant)}${forceText}`;
  if (variant === 'cyanText') return `${base} ${borderClass} bg-white text-[#08AACE] hover:bg-[#E7F8FD]${forceText}`;
  if (variant === 'quiet' || variant === 'quietBlackText') return `${base} ${borderClass} bg-white text-[#4f5d6b] hover:bg-[#E7F8FD] hover:text-[#08AACE]`;
  return `${base} ${borderClass} bg-white text-[#586574] hover:bg-[#DDF5FC] hover:text-[#08AACE]`;
}

function splitButtonClass(active = false, variant: Variant = 'recommended') {
  const forceText = variant === 'cyanText' ? ` ${CYAN_TEXT_FORCE_CLASS}` : '';
  const borderClass = softCyanBorderClass(variant);
  return [
    'inline-flex h-9 shrink-0 items-center justify-center border-y border-r px-3 text-sm font-black first:rounded-l-[8px] first:border-l last:rounded-r-[8px]',
    active
      ? `${borderClass} bg-[#E7F8FD] ${activeTextClass(variant)}${forceText}`
      : variant === 'cyanText'
        ? `${borderClass} bg-white text-[#08AACE] hover:bg-[#E7F8FD]${forceText}`
      : `${borderClass} bg-white text-[#526171] hover:bg-[#DDF5FC] hover:text-[#08AACE]`,
  ].join(' ');
}

function HeaderFlowPreview({ variant }: { variant: Variant }) {
  const headerBorderClass = variant === 'quiet' || variant === 'quietBlackText' ? 'border-[#cfeff7]' : 'border-[#edf1f5]';
  const activeFlowClass = variant === 'quietBlackText'
    ? `bg-[#E7F8FD] text-[#111827] ${BLACK_TEXT_FORCE_CLASS}`
    : 'bg-[#E7F8FD] text-[#08AACE]';
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-[#e4e9ef] bg-white p-3">
      <div className={`flex overflow-hidden rounded-[8px] border ${headerBorderClass}`}>
        {mainFlows.map((flow) => (
          <button
            key={flow}
            type="button"
            className={`h-9 shrink-0 border-r ${headerBorderClass} px-4 text-sm font-black last:border-r-0 ${variant === 'cyanText' ? CYAN_TEXT_FORCE_CLASS : ''} ${
              flow === '作品信息' || flow === '正文'
                ? activeFlowClass
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
                ? `border-[#E7F8FD] bg-[#E7F8FD] ${activeTextClass(variant)}`
                : variant === 'cyanText'
                  ? 'border-transparent bg-white text-[#08AACE] hover:bg-[#E7F8FD]'
                : 'border-transparent bg-white text-[#4f5d6b] hover:bg-[#f7fbfd]'
            }`}
          >
            <span className="truncate">{row.title}</span>
            <span className={row.active ? activeTextClass(variant) : variant === 'cyanText' ? `text-[#08AACE] ${CYAN_TEXT_FORCE_CLASS}` : 'text-[#9aa3af]'}>{row.meta}</span>
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
        <input className={`h-9 min-w-[260px] flex-1 rounded-[8px] border ${softCyanBorderClass(variant)} bg-white px-3 text-sm font-bold text-[#586574] outline-none`} placeholder="请输入章节标题" />
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
  const borderClass = softCyanBorderClass(variant);
  return (
    <aside className="flex h-[600px] w-[360px] shrink-0 flex-col border-l border-[#e4e9ef] bg-white p-4">
      <div className={`grid h-14 grid-cols-2 overflow-hidden rounded-[16px] border ${borderClass}`}>
        {['模型', '提示词'].map((label) => (
          <label key={label} className={`relative flex flex-col justify-center border-r ${borderClass} px-4 last:border-r-0`}>
            <span className="absolute -top-2 left-3 bg-white px-1 text-xs font-black text-[#08AACE]">{label}</span>
            <span className="text-sm font-black text-[#1f2933]">{label === '模型' ? 'GLM' : '无可用提示词'}</span>
          </label>
        ))}
      </div>
      <div className={`mt-3 min-h-0 flex-1 rounded-[20px] border ${borderClass} bg-white p-5 text-lg font-bold text-[#9aa3af]`}>
        暂无对话内容...
        <div className="mt-[360px] text-right text-sm">
          <span className="font-black text-[#08AACE]">0</span> 字
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className={`flex overflow-hidden rounded-[12px] border ${borderClass}`}>
          <button className={splitButtonClass(false, variant)}>关联</button>
          <button className={splitButtonClass(false, variant)}>本章</button>
          <button className={splitButtonClass(true, variant)}>已关联资料</button>
        </div>
        <span className="text-sm font-bold text-[#9aa3af]">
          关联 <span className="text-[#08AACE]">1865</span> 字
        </span>
      </div>
      <div className={`mt-3 flex h-12 items-center overflow-hidden rounded-[16px] border ${borderClass} bg-white`}>
        <input className="min-w-0 flex-1 bg-transparent px-4 text-sm font-bold text-[#586574] outline-none" placeholder="请输入要求" />
        <button className={`grid h-full w-14 place-items-center border-l ${borderClass} text-[#08AACE]`}><Send className="h-5 w-5" /></button>
        <button className={`grid h-full w-12 place-items-center border-l ${borderClass} text-red-500`}><Square className="h-4 w-4 fill-current" /></button>
      </div>
      <div className="mt-3 flex gap-2">
        {['替换正文', '撤回替换', '复制内容'].map((label) => (
          <button
            key={label}
            className={`h-10 flex-1 rounded-[8px] text-sm font-black ${
              variant === 'quietBlackText'
                ? `bg-[#E7F8FD] text-[#111827] ${BLACK_TEXT_FORCE_CLASS}`
                : variant === 'cyanText'
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

function AccentColorCard({ option }: { option: (typeof accentColorOptions)[number] }) {
  const activeStyle = {
    backgroundColor: option.soft,
    borderColor: option.border,
    color: option.color,
  };
  const outlineStyle = {
    borderColor: option.border,
    color: option.color,
  };
  return (
    <section className="overflow-hidden rounded-[8px] border border-[#e2e8f0] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[#edf1f5] px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black text-[#1f2933]">{option.name}</h3>
          <p className="mt-1 truncate text-xs font-bold text-[#7b8794]">{option.note}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-[#f7f9fb] px-2.5 py-1 text-xs font-black text-[#526171]">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: option.color }} />
          {option.color}
        </div>
      </div>

      <div className="bg-[#f5f5f7] p-3">
        <div className="rounded-[8px] border border-[#e4e9ef] bg-white">
          <div className="flex items-center gap-1 border-b border-[#edf1f5] px-3 py-2">
            {['作品信息', '脑洞', '设定', '章纲', '正文'].map((label) => (
              <button
                key={label}
                type="button"
                className="h-8 rounded-[8px] border px-3 text-xs font-black"
                style={label === '正文' || label === '作品信息' ? activeStyle : { borderColor: '#edf1f5', color: '#586574' }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-[92px_minmax(0,1fr)_132px] gap-0">
            <div className="border-r border-[#edf1f5] p-2">
              {['第一卷', '第1章', '第2章'].map((label, index) => (
                <div
                  key={label}
                  className="mb-1 flex h-8 items-center justify-between rounded-[8px] border px-2 text-xs font-bold"
                  style={index === 1 ? activeStyle : { borderColor: 'transparent', color: '#4f5d6b' }}
                >
                  <span>{label}</span>
                  <span style={{ color: index === 1 ? option.color : '#a1aab6' }}>{index === 0 ? '2章' : index === 1 ? '0' : '54'}</span>
                </div>
              ))}
            </div>

            <div className="min-h-[180px] px-4 py-3">
              <div className="mb-3 flex items-center gap-2">
                <button type="button" className="h-8 rounded-[8px] border px-3 text-xs font-black" style={outlineStyle}>字体设置</button>
                <button type="button" className="h-8 rounded-[8px] border px-3 text-xs font-black" style={outlineStyle}>智能排版</button>
                <button type="button" className="h-8 rounded-[8px] px-4 text-xs font-black text-white" style={{ backgroundColor: option.color }}>查找</button>
              </div>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="mb-6 border-t border-dashed border-[#cbd5e1]" />
              ))}
              <div className="text-right text-xs font-bold text-[#9aa3af]">
                字数 <span style={{ color: option.color }}>0</span> · 自动保存
              </div>
            </div>

            <div className="border-l border-[#edf1f5] p-2">
              <div className="mb-2 grid h-9 grid-cols-2 overflow-hidden rounded-[10px] border" style={{ borderColor: option.color }}>
                <div className="flex flex-col justify-center border-r px-2" style={{ borderColor: option.border }}>
                  <span className="text-[10px] font-black" style={{ color: option.color }}>模型</span>
                  <span className="text-xs font-black text-[#1f2933]">GLM</span>
                </div>
                <div className="flex flex-col justify-center px-2">
                  <span className="text-[10px] font-black" style={{ color: option.color }}>提示词</span>
                  <span className="text-xs font-black text-[#1f2933]">无可用提示词</span>
                </div>
              </div>
              <div className="h-[92px] rounded-[12px] border p-2 text-xs font-bold text-[#9aa3af]" style={{ borderColor: option.border }}>
                暂无对话内容...
              </div>
              <div className="mt-2 flex overflow-hidden rounded-[10px] border" style={{ borderColor: option.color }}>
                {['关联', '本章', '已关联资料'].map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    className="h-8 flex-1 border-r text-[11px] font-black last:border-r-0"
                    style={index === 2 ? { backgroundColor: option.color, borderColor: option.border, color: '#fff' } : { borderColor: option.border, color: option.color }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-right text-xs font-black" style={{ color: option.color }}>1865 字</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AccentColorMatrix() {
  return (
    <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#1f2933]">#1E71EF 主色替换 10 方案</h2>
          <p className="mt-1 text-sm leading-6 text-[#6f7e90]">
            每个方案都把截图里原本偏蓝的主按钮、当前页文字、右侧配置框边线、关联资料按钮和数字强调换成同一个候选主色，方便你直接看哪种更贴合软件风格。
          </p>
        </div>
        <div className="shrink-0 rounded-full bg-[#f5f7fa] px-3 py-1 text-xs font-black text-[#7b8794]">只在测试页预览</div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {accentColorOptions.map((option) => (
          <AccentColorCard key={option.color} option={option} />
        ))}
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
          .writer-assistant-theme .${BLACK_TEXT_FORCE_CLASS},
          .${BLACK_TEXT_FORCE_CLASS} {
            color: #111827 !important;
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
          title="方案 B：浅青边框加深，轮廓更清楚"
          desc="保留浅青体系，但把 B 方案里的按钮、输入框、右侧配置框和关联区边框加深到 #BDEEF7，让框线更容易被看见。"
          variant="quiet"
        />

        <DesignPreview
          title="方案 C：按钮文字统一 #08AACE"
          desc="不只改按钮底色，把按钮文字也统一成 #08AACE。选中态保留 #E7F8FD 底色，未选中按钮保持白底，但文字同样是 #08AACE。"
          variant="cyanText"
        />

        <DesignPreview
          title="方案 D：基于 B，选中字体改为黑色"
          desc="复制 B 方案的浅青加深边框和按钮轮廓，只把选中态里原本偏蓝的字体强制改成黑色，用来对比是否比 #1E71EF 更稳。"
          variant="quietBlackText"
        />

        <AccentColorMatrix />
      </div>
    </div>
  );
}

export default WorkbenchSoftCyanButtonStyleTestPage;
