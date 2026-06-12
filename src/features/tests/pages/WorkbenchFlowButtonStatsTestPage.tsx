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

function getButtonToneClass(button: FlowButtonPreview, active: boolean) {
  if (active) return 'z-10 border-[#1e71ef] bg-[#eaf2ff] text-[#1e71ef] shadow-[inset_0_0_0_1px_#1e71ef]';
  if (button.tone === 'warning') return 'border-[#e7edf5] bg-white text-[#1f2933] hover:border-[#f2bf84] hover:bg-[#fff7ed]';
  return 'border-[#e7edf5] bg-white text-[#1f2933] hover:border-[#b8caef] hover:bg-[#f7faff]';
}

function FlowGroupPreview({
  variant,
  activeId,
  onActiveChange,
}: {
  variant: 'balanced' | 'compact' | 'status';
  activeId: string;
  onActiveChange: (id: string) => void;
}) {
  const buttonClass = useMemo(() => {
    if (variant === 'compact') return 'h-10 min-w-[118px] px-3';
    if (variant === 'status') return 'h-[46px] min-w-[132px] px-3.5';
    return 'h-12 min-w-[136px] px-4';
  }, [variant]);
  const titleClass = variant === 'compact' ? 'text-[15px]' : 'text-[17px]';
  const metaClass = variant === 'compact' ? 'text-[11px]' : 'text-xs';

  const renderButton = (button: FlowButtonPreview) => {
    const active = button.id === activeId;
    const showPill = variant === 'status' && button.meta;
    return (
      <button
        key={button.id}
        type="button"
        onClick={() => onActiveChange(button.id)}
        className={`${buttonClass} relative -ml-px inline-flex shrink-0 items-center justify-center gap-2 border first:ml-0 first:rounded-l-[8px] last:rounded-r-[8px] ${getButtonToneClass(button, active)}`}
      >
        <span className={`${titleClass} font-black leading-none ${button.id === 'brainstorm' ? 'tracking-wide' : ''}`}>{button.title}</span>
        {button.meta ? (
          showPill ? (
            <span className={`${metaClass} rounded-full ${button.tone === 'warning' ? 'bg-[#fff1e2] text-[#c26a19]' : 'bg-white/80 text-[#64748b]'} px-2 py-0.5 font-black leading-none`}>
              {button.meta}
            </span>
          ) : (
            <span className={`${metaClass} font-bold leading-none ${button.tone === 'warning' ? 'text-[#c26a19]' : active ? 'text-[#1e71ef]' : 'text-[#6f7e90]'}`}>
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

function DesignCard({
  title,
  desc,
  variant,
}: {
  title: string;
  desc: string;
  variant: 'balanced' | 'compact' | 'status';
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

        <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-black text-[#1f2933]">方案 C-工具栏形态：按截图结构检查剩余空间</h2>
            <p className="mt-1 text-sm leading-6 text-[#6f7e90]">
              保留 C 方案的数量胶囊，但把它放进接近正式顶部栏的横向结构里，用来观察放入小说入口、作品信息、字号和日志之后会不会拥挤。
            </p>
          </div>
          <ToolbarCPreview />
        </section>
      </div>
    </div>
  );
}

export default WorkbenchFlowButtonStatsTestPage;
