import { useMemo, useState } from 'react';

type FlowGroup = 'creation' | 'review';

type FlowButtonPreview = {
  id: string;
  title: string;
  meta: string;
  group: FlowGroup;
  tone?: 'normal' | 'warning' | 'quiet';
};

const creationButtons: FlowButtonPreview[] = [
  { id: 'brainstorm', title: '脑洞', meta: '12个脑洞', group: 'creation' },
  { id: 'setting', title: '设定', meta: '28个设定', group: 'creation' },
  { id: 'chapterOutline', title: '章纲', meta: '46章', group: 'creation' },
  { id: 'writing', title: '正文', meta: '46章', group: 'creation' },
];

const reviewButtons: FlowButtonPreview[] = [
  { id: 'audit', title: '审核', meta: '11章未审', group: 'review', tone: 'warning' },
  { id: 'comment', title: '点评', meta: '19章未点评', group: 'review', tone: 'warning' },
  { id: 'polish', title: '润色', meta: '', group: 'review', tone: 'quiet' },
  { id: 'status', title: '状态', meta: '8章未更新', group: 'review', tone: 'warning' },
  { id: 'summary', title: '梗概', meta: '43章', group: 'review' },
];

const allButtons = [...creationButtons, ...reviewButtons];

type FlowCombinationDesign = {
  id: string;
  title: string;
  note: string;
  activeClass: string;
  buttonClass: string;
  metaClass: string;
  mode: 'classic' | 'stack' | 'pill' | 'numbered' | 'progress' | 'tab' | 'groupTitle' | 'timeline' | 'dashboard' | 'underline';
};

const flowCombinationDesigns: FlowCombinationDesign[] = [
  {
    id: '01',
    title: '01 经典分段',
    note: '最接近当前样式，边框更清晰，适合直接迁入。',
    mode: 'classic',
    activeClass: 'border-[#8FE4F2] bg-[#E7F8FD] text-[#08AACE] shadow-[0_0_0_1px_rgba(8,170,206,0.18)]',
    buttonClass: 'h-11 min-w-[104px] border-[#CBD5E1] bg-white px-3',
    metaClass: 'text-[#64748b]',
  },
  {
    id: '02',
    title: '02 双行紧凑',
    note: '标题和数据上下排，横向最省，适合你现在截图里的拥挤区域。',
    mode: 'stack',
    activeClass: 'border-[#8FE4F2] bg-[#E7F8FD] text-[#08AACE]',
    buttonClass: 'h-10 min-w-[78px] border-[#D8E1EC] bg-white px-2',
    metaClass: 'text-[#6f7e90]',
  },
  {
    id: '03',
    title: '03 状态胶囊',
    note: '把数量放进胶囊里，待处理项更像提醒，不容易被忽略。',
    mode: 'pill',
    activeClass: 'border-[#8FE4F2] bg-[#E7F8FD] text-[#08AACE]',
    buttonClass: 'h-11 min-w-[112px] border-[#D8E1EC] bg-white px-2.5',
    metaClass: 'bg-slate-100 text-[#64748b]',
  },
  {
    id: '04',
    title: '04 步骤编号',
    note: '每个按钮带编号，流程感最强，适合强调创作顺序。',
    mode: 'numbered',
    activeClass: 'border-[#8FE4F2] bg-[#E7F8FD] text-[#08AACE]',
    buttonClass: 'h-12 min-w-[112px] border-[#D8E1EC] bg-white px-2.5',
    metaClass: 'text-[#64748b]',
  },
  {
    id: '05',
    title: '05 底部进度条',
    note: '按钮主体很克制，用底部色条表达当前页和待处理压力。',
    mode: 'progress',
    activeClass: 'border-[#8FE4F2] bg-white text-[#08AACE]',
    buttonClass: 'h-11 min-w-[106px] border-[#D8E1EC] bg-white px-3',
    metaClass: 'text-[#64748b]',
  },
  {
    id: '06',
    title: '06 标签页浮层',
    note: '像浏览器标签，当前页抬起来一点，适合软件标题栏附近。',
    mode: 'tab',
    activeClass: 'border-[#8FE4F2] bg-white text-[#08AACE] shadow-[0_-1px_0_#E7F8FD_inset]',
    buttonClass: 'h-11 min-w-[108px] border-[#D8E1EC] bg-[#F8FAFC] px-3',
    metaClass: 'text-[#64748b]',
  },
  {
    id: '07',
    title: '07 分组标题栏',
    note: '保留组合按钮，但给两组加“创作/后期”标题，结构最清楚。',
    mode: 'groupTitle',
    activeClass: 'border-[#8FE4F2] bg-[#E7F8FD] text-[#08AACE]',
    buttonClass: 'h-10 min-w-[88px] border-[#D8E1EC] bg-white px-2',
    metaClass: 'text-[#64748b]',
  },
  {
    id: '08',
    title: '08 时间线节点',
    note: '按钮变成节点，适合表达从脑洞到梗概的连续流程。',
    mode: 'timeline',
    activeClass: 'border-[#08AACE] bg-[#08AACE] text-white',
    buttonClass: 'h-12 min-w-[92px] border-transparent bg-transparent px-2',
    metaClass: 'text-[#64748b]',
  },
  {
    id: '09',
    title: '09 小仪表盘',
    note: '每个入口像小数据块，最适合信息密度优先的工具型页面。',
    mode: 'dashboard',
    activeClass: 'border-[#8FE4F2] bg-[#E7F8FD] text-[#08AACE]',
    buttonClass: 'h-[54px] min-w-[96px] border-[#D8E1EC] bg-white px-2.5',
    metaClass: 'text-[#64748b]',
  },
  {
    id: '10',
    title: '10 极简下划线',
    note: '去掉外框重量，只用底线和文字层级，最轻但识别略弱。',
    mode: 'underline',
    activeClass: 'border-[#08AACE] bg-white text-[#08AACE]',
    buttonClass: 'h-11 min-w-[96px] border-transparent bg-white px-3',
    metaClass: 'text-[#64748b]',
  },
];

function getButtonToneClass(button: FlowButtonPreview, active: boolean) {
  if (active) return 'z-10 border-[#BDEEF7] bg-[#E7F8FD] text-[#08AACE] shadow-[inset_0_0_0_1px_#BDEEF7]';
  if (button.tone === 'warning') return 'border-[#e7edf5] bg-white text-[#1f2933] hover:border-[#f2bf84] hover:bg-[#fff7ed]';
  return 'border-[#e7edf5] bg-white text-[#1f2933] hover:border-[#BDEEF7] hover:bg-[#E7F8FD]';
}

function FlowGroupPreview({
  variant,
  activeId,
  onActiveChange,
}: {
  variant: 'balanced' | 'compact' | 'status' | 'microStack';
  activeId: string;
  onActiveChange: (id: string) => void;
}) {
  const buttonClass = useMemo(() => {
    if (variant === 'microStack') return 'h-[38px] min-w-[82px] px-2';
    if (variant === 'compact') return 'h-10 min-w-[118px] px-3';
    if (variant === 'status') return 'h-[46px] min-w-[132px] px-3.5';
    return 'h-12 min-w-[136px] px-4';
  }, [variant]);
  const titleClass = variant === 'microStack' ? 'text-[14px]' : variant === 'compact' ? 'text-[15px]' : 'text-[17px]';
  const metaClass = variant === 'microStack' ? 'text-[10px]' : variant === 'compact' ? 'text-[11px]' : 'text-xs';

  const renderButton = (button: FlowButtonPreview) => {
    const active = button.id === activeId;
    const showPill = variant === 'status' && button.meta;
    const stackMeta = variant === 'microStack';
    return (
      <button
        key={button.id}
        type="button"
        onClick={() => onActiveChange(button.id)}
        className={`${buttonClass} relative -ml-px inline-flex shrink-0 ${stackMeta ? 'flex-col gap-0.5' : 'items-center gap-2'} justify-center border first:ml-0 first:rounded-l-[8px] last:rounded-r-[8px] ${getButtonToneClass(button, active)}`}
      >
        <span className={`${titleClass} font-black leading-none ${button.id === 'brainstorm' ? 'tracking-wide' : ''}`}>{button.title}</span>
        {button.meta ? (
          showPill ? (
            <span className={`${metaClass} rounded-full ${button.tone === 'warning' ? 'bg-[#fff1e2] text-[#c26a19]' : 'bg-white/80 text-[#64748b]'} px-2 py-0.5 font-black leading-none`}>
              {button.meta}
            </span>
          ) : (
            <span className={`${metaClass} font-bold leading-none ${button.tone === 'warning' ? 'text-[#c26a19]' : active ? 'text-[#08AACE]' : 'text-[#6f7e90]'}`}>
              {button.meta}
            </span>
          )
        ) : null}
      </button>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex min-w-0 overflow-x-auto">{creationButtons.map(renderButton)}</div>
      <div className="flex min-w-0 overflow-x-auto">{reviewButtons.map(renderButton)}</div>
    </div>
  );
}

function ToolbarMicroPreview() {
  const [activeId, setActiveId] = useState('writing');

  const renderButton = (button: FlowButtonPreview) => {
    const active = button.id === activeId;
    return (
      <button
        key={button.id}
        type="button"
        onClick={() => setActiveId(button.id)}
        className={`relative -ml-px inline-flex h-[38px] min-w-[76px] shrink-0 flex-col items-center justify-center gap-0.5 border px-1.5 first:ml-0 first:rounded-l-[8px] last:rounded-r-[8px] ${getButtonToneClass(button, active)}`}
      >
        <span className={`text-[13px] font-black leading-none ${button.id === 'brainstorm' ? 'tracking-wide' : ''}`}>{button.title}</span>
        {button.meta ? (
          <span className={`max-w-[72px] truncate text-[9px] font-black leading-none ${button.tone === 'warning' ? 'text-[#c26a19]' : active ? 'text-[#08AACE]' : 'text-[#6f7e90]'}`}>
            {button.meta}
          </span>
        ) : (
          <span className="text-[9px] font-black leading-none text-transparent">-</span>
        )}
      </button>
    );
  };

  return (
    <div className="overflow-hidden rounded-[8px] border border-[#dce3eb] bg-[#f7f9fb]">
      <div className="flex h-[52px] min-w-0 items-center gap-1.5 overflow-hidden border-b border-[#edf1f5] bg-white px-3">
        <div className="flex shrink-0 overflow-hidden rounded-[8px] border border-[#edf1f5] bg-white">
          <button type="button" className="h-[38px] shrink-0 border-r border-[#edf1f5] px-2.5 text-[13px] font-black text-[#1f2933]">
            默认小说1
          </button>
          <button type="button" className="h-[38px] shrink-0 border border-[#08AACE] bg-[#E7F8FD] px-2.5 text-[13px] font-black text-[#08AACE] shadow-[inset_0_0_0_1px_#08AACE]">
            作品信息
          </button>
        </div>

        <div className="flex shrink-0">
          {creationButtons.map(renderButton)}
        </div>

        <div className="flex shrink-0">
          {reviewButtons.map(renderButton)}
        </div>

        <div className="min-w-2 flex-1" aria-hidden="true" />

        <div className="flex h-8 shrink-0 overflow-hidden rounded-[8px] border border-[#edf1f5] bg-white">
          <button type="button" className="w-7 border-r border-[#edf1f5] text-sm font-black text-[#6f7e90]">-</button>
          <div className="flex w-9 items-center justify-center border-r border-[#edf1f5] text-sm font-black text-[#1f2933]">20</div>
          <button type="button" className="w-7 text-sm font-black text-[#6f7e90]">+</button>
        </div>

        <button type="button" className="h-8 shrink-0 rounded-[8px] border border-[#edf1f5] bg-white px-2.5 text-[13px] font-black text-[#425466]">
          日志
        </button>
      </div>
      <div className="flex items-center justify-between gap-4 bg-[#f8fafc] px-4 py-3 text-xs font-bold text-[#6f7e90]">
        <span>方案 D 把统计文字放到标题下方，按钮宽度更窄，适合正式顶部栏空间不足的情况。</span>
        <span className="shrink-0 text-[#08AACE]">目标：保留数量信息，但减少横向占位</span>
      </div>
    </div>
  );
}

function ToolbarCPreview() {
  const [activeId, setActiveId] = useState('writing');

  const renderButton = (button: FlowButtonPreview) => {
    const active = button.id === activeId;
    return (
      <button
        key={button.id}
        type="button"
        onClick={() => setActiveId(button.id)}
        className={`relative -ml-px inline-flex h-10 shrink-0 items-center justify-center gap-0.5 border px-2 first:ml-0 first:rounded-l-[8px] last:rounded-r-[8px] ${getButtonToneClass(button, active)}`}
      >
        <span className={`text-[13px] font-black leading-none ${button.id === 'brainstorm' ? 'tracking-wide' : ''}`}>{button.title}</span>
        {button.meta ? (
          <span className={`rounded-full px-1 py-0.5 text-[9px] font-black leading-none ${button.tone === 'warning' ? 'bg-[#fff1e2] text-[#c26a19]' : 'bg-white/80 text-[#64748b]'}`}>
            {button.meta}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <div className="overflow-hidden rounded-[8px] border border-[#dce3eb] bg-[#f7f9fb]">
      <div className="flex h-[62px] min-w-0 items-center gap-1.5 overflow-hidden border-b border-[#edf1f5] bg-white px-3">
        <div className="flex shrink-0 overflow-hidden rounded-[8px] border border-[#edf1f5] bg-white">
          <button type="button" className="h-10 shrink-0 border-r border-[#edf1f5] px-2.5 text-sm font-black text-[#1f2933]">
            默认小说1
          </button>
          <button type="button" className="h-10 shrink-0 border border-[#08AACE] bg-[#E7F8FD] px-2.5 text-sm font-black text-[#08AACE] shadow-[inset_0_0_0_1px_#08AACE]">
            作品信息
          </button>
        </div>

        <div className="flex shrink-0">
          {creationButtons.map(renderButton)}
        </div>

        <div className="flex shrink-0">
          {reviewButtons.map(renderButton)}
        </div>

        <div className="min-w-2 flex-1" aria-hidden="true" />

        <div className="flex h-9 shrink-0 overflow-hidden rounded-[8px] border border-[#edf1f5] bg-white">
          <button type="button" className="w-8 border-r border-[#edf1f5] text-base font-black text-[#6f7e90]">-</button>
          <div className="flex w-10 items-center justify-center border-r border-[#edf1f5] text-base font-black text-[#1f2933]">20</div>
          <button type="button" className="w-8 text-base font-black text-[#6f7e90]">+</button>
        </div>

        <button type="button" className="h-9 shrink-0 rounded-[8px] border border-[#edf1f5] bg-white px-2.5 text-sm font-black text-[#425466]">
          日志
        </button>
      </div>
      <div className="flex items-center justify-between gap-4 bg-[#f8fafc] px-4 py-3 text-xs font-bold text-[#6f7e90]">
        <span>按正式顶部栏结构预览：左侧小说入口 + C 方案流程按钮 + 右侧字号/日志控件。</span>
        <span className="shrink-0 text-[#08AACE]">观察中间空白即可判断剩余空间</span>
      </div>
    </div>
  );
}

function FlowCombinationDesignPreview({ design }: { design: FlowCombinationDesign }) {
  const [activeId, setActiveId] = useState('writing');
  const renderButton = (button: FlowButtonPreview, index: number) => {
    const active = button.id === activeId;
    const warning = button.tone === 'warning';
    const base = `${design.buttonClass} relative inline-flex shrink-0 items-center justify-center transition-colors ${active ? design.activeClass : 'text-[#1f2933] hover:border-[#BDEEF7] hover:bg-[#F8FDFF]'}`;

    if (design.mode === 'timeline') {
      return (
        <button key={button.id} type="button" onClick={() => setActiveId(button.id)} className={`${base} flex-col gap-1`}>
          <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-black ${active ? 'bg-[#08AACE] text-white' : warning ? 'bg-[#FFF7ED] text-[#C46A00]' : 'bg-slate-100 text-slate-500'}`}>{index + 1}</span>
          <span className="text-xs font-black leading-none">{button.title}</span>
          <span className={`text-[10px] font-black leading-none ${active ? 'text-[#08AACE]' : warning ? 'text-[#C46A00]' : design.metaClass}`}>{button.meta || '待定'}</span>
        </button>
      );
    }

    if (design.mode === 'dashboard') {
      return (
        <button key={button.id} type="button" onClick={() => setActiveId(button.id)} className={`${base} flex-col rounded-[8px] border`}>
          <span className="text-sm font-black leading-none">{button.title}</span>
          <span className={`mt-1 text-base font-black leading-none ${warning ? 'text-[#C46A00]' : active ? 'text-[#08AACE]' : 'text-slate-500'}`}>{button.meta || '--'}</span>
        </button>
      );
    }

    if (design.mode === 'numbered') {
      return (
        <button key={button.id} type="button" onClick={() => setActiveId(button.id)} className={`${base} gap-2 border -ml-px first:ml-0 first:rounded-l-[8px] last:rounded-r-[8px]`}>
          <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-black ${active ? 'bg-white text-[#08AACE]' : 'bg-slate-100 text-slate-500'}`}>{index + 1}</span>
          <span className="flex flex-col items-start gap-0.5">
            <span className="text-sm font-black leading-none">{button.title}</span>
            <span className={`text-[10px] font-black leading-none ${warning ? 'text-[#C46A00]' : design.metaClass}`}>{button.meta || '待定'}</span>
          </span>
        </button>
      );
    }

    if (design.mode === 'pill') {
      return (
        <button key={button.id} type="button" onClick={() => setActiveId(button.id)} className={`${base} gap-1.5 border -ml-px first:ml-0 first:rounded-l-[8px] last:rounded-r-[8px]`}>
          <span className="text-sm font-black leading-none">{button.title}</span>
          {button.meta && <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none ${warning ? 'bg-[#FFF7ED] text-[#C46A00]' : active ? 'bg-white text-[#08AACE]' : design.metaClass}`}>{button.meta}</span>}
        </button>
      );
    }

    if (design.mode === 'progress') {
      return (
        <button key={button.id} type="button" onClick={() => setActiveId(button.id)} className={`${base} flex-col gap-0.5 overflow-hidden border -ml-px first:ml-0 first:rounded-l-[8px] last:rounded-r-[8px]`}>
          <span className="text-sm font-black leading-none">{button.title}</span>
          <span className={`text-[10px] font-black leading-none ${warning ? 'text-[#C46A00]' : design.metaClass}`}>{button.meta || '待定'}</span>
          <span className={`absolute bottom-0 left-0 h-1 ${warning ? 'bg-[#F59E0B]' : active ? 'bg-[#08AACE]' : 'bg-slate-200'}`} style={{ width: button.meta ? '72%' : '18%' }} />
        </button>
      );
    }

    if (design.mode === 'tab') {
      return (
        <button key={button.id} type="button" onClick={() => setActiveId(button.id)} className={`${base} -mb-px gap-1.5 rounded-t-[8px] border border-b-0`}>
          <span className="text-sm font-black leading-none">{button.title}</span>
          <span className={`text-[10px] font-black leading-none ${warning ? 'text-[#C46A00]' : design.metaClass}`}>{button.meta || '待定'}</span>
        </button>
      );
    }

    if (design.mode === 'underline') {
      return (
        <button key={button.id} type="button" onClick={() => setActiveId(button.id)} className={`${base} flex-col gap-0.5 border-b-2`}>
          <span className="text-sm font-black leading-none">{button.title}</span>
          <span className={`text-[10px] font-black leading-none ${warning ? 'text-[#C46A00]' : design.metaClass}`}>{button.meta || '待定'}</span>
        </button>
      );
    }

    return (
      <button key={button.id} type="button" onClick={() => setActiveId(button.id)} className={`${base} ${design.mode === 'stack' ? 'flex-col gap-0.5' : 'gap-1.5'} border -ml-px first:ml-0 first:rounded-l-[8px] last:rounded-r-[8px]`}>
        <span className={`${design.mode === 'stack' ? 'text-sm' : 'text-[15px]'} font-black leading-none`}>{button.title}</span>
        <span className={`text-[10px] font-black leading-none ${warning ? 'text-[#C46A00]' : active ? 'text-[#08AACE]' : design.metaClass}`}>{button.meta || '待定'}</span>
      </button>
    );
  };

  const renderGroup = (buttons: FlowButtonPreview[], label: string, offset = 0) => {
    const content = (
      <div className={design.mode === 'dashboard' ? 'grid grid-cols-4 gap-2' : design.mode === 'timeline' ? 'flex items-center gap-1 rounded-[8px] bg-white px-2 py-2' : 'flex min-w-0 overflow-x-auto'}>
        {buttons.map((button, index) => renderButton(button, index + offset))}
      </div>
    );
    if (design.mode !== 'groupTitle') return content;
    return (
      <div className="rounded-[8px] border border-[#D8E1EC] bg-white p-2">
        <div className="mb-1 text-[11px] font-black text-slate-400">{label}</div>
        <div className="flex min-w-0 overflow-x-auto">{buttons.map((button, index) => renderButton(button, index + offset))}</div>
      </div>
    );
  };

  return (
    <section className="rounded-[8px] border border-[#D8E1EC] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-black text-slate-950">{design.title}</h2>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{design.note}</p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500">当前：{allButtons.find((item) => item.id === activeId)?.title}</span>
      </div>
      <div className={`${design.mode === 'tab' ? 'items-end border-b border-[#D8E1EC] pb-0' : 'items-center'} flex flex-wrap gap-3 rounded-[8px] bg-[#F5F7FA] p-3`}>
        {renderGroup(creationButtons, '创作流程')}
        {renderGroup(reviewButtons, '后期流程', creationButtons.length)}
      </div>
    </section>
  );
}

function FlowCombinationDesignMatrix() {
  return (
    <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-black text-slate-950">十套组合按钮设计方向</h2>
        <p className="mt-1 text-sm font-bold leading-6 text-slate-500">
          这组只比较顶部流程组合按钮本身：有些更接近当前实现，有些更像标签、时间线或小型仪表盘。点击任意按钮可以看选中态。
        </p>
      </div>
      <div className="grid gap-4">
        {flowCombinationDesigns.map((design) => (
          <FlowCombinationDesignPreview key={design.id} design={design} />
        ))}
      </div>
    </section>
  );
}

function DesignCard({
  title,
  desc,
  variant,
}: {
  title: string;
  desc: string;
  variant: 'balanced' | 'compact' | 'status' | 'microStack';
}) {
  const [activeId, setActiveId] = useState('writing');
  return (
    <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#1f2933]">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#6f7e90]">{desc}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#f5f7fa] px-3 py-1 text-xs font-black text-[#7b8794]">
          当前：{allButtons.find((item) => item.id === activeId)?.title}
        </span>
      </div>
      <div className="rounded-[8px] border border-[#edf1f5] bg-[#f8fafc] p-4">
        <FlowGroupPreview variant={variant} activeId={activeId} onActiveChange={setActiveId} />
      </div>
    </section>
  );
}

export function WorkbenchFlowButtonStatsTestPage() {
  return (
    <div className="editor-scrollbar h-full overflow-y-auto bg-[#f5f5f7] p-6">
      <div className="mx-auto max-w-[1380px] space-y-5">
        <header className="rounded-[8px] border border-[#e2e8f0] bg-white px-5 py-4 shadow-sm">
          <h1 className="text-xl font-black text-[#1f2933]">作品编辑器流程按钮信息化方案</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-[#6f7e90]">
            目标是让顶部两组组合按钮不只显示入口名称，也直接反馈每个入口里的内容数量或待处理数量。下面三套都是同一组真实文案方向，区别在于按钮宽度、数字权重和待处理状态的强调程度。
          </p>
        </header>

        <FlowCombinationDesignMatrix />

        <DesignCard
          title="方案 A：推荐，名称加粗 + 数量同排"
          desc="最接近当前工具栏结构，只把按钮适度加宽并放大主文字；数量在同一行显示，脑洞会变成“脑洞 12个脑洞”，正式迁入风险最低。"
          variant="balanced"
        />

        <DesignCard
          title="方案 B：紧凑，适合保留当前宽度"
          desc="按钮高度和宽度更克制，信息仍在同一行；如果担心顶部工具栏空间不够，可以采用这版。"
          variant="compact"
        />

        <DesignCard
          title="方案 C：状态更明显，待处理数量用胶囊"
          desc="审核、点评、状态这类待处理入口更醒目，适合后续把未审、未点评、未更新作为提醒。"
          variant="status"
        />

        <DesignCard
          title="方案 D：推荐，小号上下排"
          desc="把名称和数量改成上下两行，按钮高度控制在 38px 左右，宽度明显缩小；适合现在顶部栏空间偏紧、但又想保留数量信息的情况。"
          variant="microStack"
        />

        <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-black text-[#1f2933]">方案 C-工具栏形态：按截图结构检查剩余空间</h2>
            <p className="mt-1 text-sm leading-6 text-[#6f7e90]">
              保留 C 方案的数量胶囊，但把它放进接近正式顶部栏的横向结构里，用来观察放入小说入口、作品信息、字号和日志之后会不会拥挤。
            </p>
          </div>
          <ToolbarCPreview />
        </section>

        <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-black text-[#1f2933]">方案 D-工具栏形态：小号上下排，检查是否更省空间</h2>
            <p className="mt-1 text-sm leading-6 text-[#6f7e90]">
              这是我更推荐你看的缩小版：标题仍然清楚，数量信息保留，但不再把每个按钮横向拉得很宽。
            </p>
          </div>
          <ToolbarMicroPreview />
        </section>
      </div>
    </div>
  );
}

export default WorkbenchFlowButtonStatsTestPage;
