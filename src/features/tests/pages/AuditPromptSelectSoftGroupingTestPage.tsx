import { Check, ChevronDown, FileText, FolderTree, Layers3, ListTree, Search, Tags } from 'lucide-react';

type AuditPromptOption = {
  id: string;
  title: string;
  group: '剧情审核' | '文本审核';
  description: string;
  active?: boolean;
};

type SoftGroupingPrototype = {
  id: string;
  title: string;
  summary: string;
  recommended?: boolean;
};

const promptOptions: AuditPromptOption[] = [
  {
    id: 'structure',
    title: '结构审核',
    group: '剧情审核',
    description: '检查章纲贴合、主事件、人物动机、前后逻辑、推进和伏笔设定。',
    active: true,
  },
  {
    id: 'conflict',
    title: '矛盾强度审核',
    group: '剧情审核',
    description: '检查本章阻碍、压力、冲突升级和章末牵引。',
  },
  {
    id: 'outline-fit',
    title: '章纲贴合审核',
    group: '剧情审核',
    description: '专门核对正文与章纲关键事件的覆盖比例。',
  },
  {
    id: 'ai-tone',
    title: 'AI感审核',
    group: '文本审核',
    description: '检查句式机械、转折生硬和口吻不稳定。',
  },
  {
    id: 'polish',
    title: '错字病句审核',
    group: '文本审核',
    description: '检查错字、重复词、标点和病句。',
  },
];

const groupCounts = promptOptions.reduce<Record<AuditPromptOption['group'], number>>(
  (acc, option) => {
    acc[option.group] += 1;
    return acc;
  },
  { 剧情审核: 0, 文本审核: 0 },
);

const prototypes: SoftGroupingPrototype[] = [
  {
    id: 'inline-badge',
    title: '方案 A：提示词后加小标签',
    summary: '去掉分组行，所有提示词平铺；用小标签说明它属于剧情审核还是文本审核。切换感最弱，最简单。',
    recommended: true,
  },
  {
    id: 'section-divider',
    title: '方案 B：轻分隔标题',
    summary: '保留分类，但只作为很浅的分隔文字，不用树线和文件层级，视觉压力比方案 D 小。',
  },
  {
    id: 'top-tabs',
    title: '方案 C：顶部小筛选',
    summary: '下拉顶部放“全部 / 剧情审核 / 文本审核”小筛选，列表里只显示提示词，分类不混在选项中。',
  },
  {
    id: 'two-column',
    title: '方案 D：双列分类',
    summary: '左侧是两个轻量分类按钮，右侧是对应提示词。适合以后提示词数量变多，但现在可能略占空间。',
  },
];

function ActiveSelectField() {
  return (
    <div className="w-[250px] rounded-lg border border-cyan-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="min-w-0">
          <div className="text-xs font-black text-cyan-600">提示词</div>
          <div className="truncate text-base font-black text-slate-950">结构审核</div>
        </div>
        <ChevronDown className="h-4 w-4 text-cyan-600" />
      </div>
    </div>
  );
}

function OptionRow({
  option,
  showBadge = false,
  compact = false,
}: {
  option: AuditPromptOption;
  showBadge?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={[
        'flex items-center justify-between gap-3 rounded-lg transition-colors',
        compact ? 'px-3 py-2' : 'px-3 py-2.5',
        option.active ? 'bg-cyan-50 text-slate-950' : 'text-slate-700 hover:bg-slate-50',
      ].join(' ')}
    >
      <div className="flex min-w-0 items-start gap-2">
        <FileText
          className={['mt-0.5 h-4 w-4 shrink-0', option.active ? 'text-cyan-600' : 'text-slate-300'].join(' ')}
        />
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <div className="truncate text-sm font-black">{option.title}</div>
            {showBadge ? (
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-400">
                {option.group}
              </span>
            ) : null}
          </div>
          <div className="truncate text-xs font-bold text-slate-400">{option.description}</div>
        </div>
      </div>
      {option.active ? <Check className="h-4 w-4 shrink-0 text-cyan-600" /> : null}
    </div>
  );
}

function InlineBadgePreview() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
      <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-black text-slate-400">
        <Search className="h-3.5 w-3.5" />
        <span>输入关键字或直接选择提示词</span>
      </div>
      <div className="space-y-1">
        {promptOptions.map((option) => (
          <OptionRow key={option.id} option={option} showBadge />
        ))}
      </div>
    </div>
  );
}

function SectionDividerPreview() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
      {(['剧情审核', '文本审核'] as const).map((group) => (
        <div key={group} className="mb-1 last:mb-0">
          <div className="flex h-7 items-center gap-2 px-2 text-[11px] font-black text-slate-400">
            <FolderTree className="h-3.5 w-3.5 text-slate-300" />
            <span>{group}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] leading-none text-slate-400">
              {groupCounts[group]}
            </span>
          </div>
          <div className="space-y-1">
            {promptOptions
              .filter((option) => option.group === group)
              .map((option) => (
                <OptionRow key={option.id} option={option} compact />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TopTabsPreview() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
      <div className="mb-2 grid h-8 grid-cols-3 overflow-hidden rounded-lg bg-slate-100 p-0.5 text-xs font-black">
        <button className="rounded-md bg-white text-cyan-700 shadow-sm">全部</button>
        <button className="text-slate-500">剧情 {groupCounts['剧情审核']}</button>
        <button className="text-slate-500">文本 {groupCounts['文本审核']}</button>
      </div>
      <div className="space-y-1">
        {promptOptions.map((option) => (
          <OptionRow key={option.id} option={option} showBadge compact />
        ))}
      </div>
    </div>
  );
}

function TwoColumnPreview() {
  const plotOptions = promptOptions.filter((option) => option.group === '剧情审核');
  return (
    <div className="grid min-h-[260px] grid-cols-[104px_minmax(0,1fr)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-r border-slate-100 bg-slate-50 p-2">
        <button className="mb-1 flex h-9 w-full items-center justify-between rounded-lg bg-white px-2 text-xs font-black text-cyan-700 shadow-sm">
          剧情
          <span className="rounded-full bg-cyan-50 px-1.5 py-0.5 text-[10px]">{groupCounts['剧情审核']}</span>
        </button>
        <button className="flex h-9 w-full items-center justify-between rounded-lg px-2 text-xs font-black text-slate-500">
          文本
          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px]">{groupCounts['文本审核']}</span>
        </button>
      </div>
      <div className="space-y-1 p-2">
        {plotOptions.map((option) => (
          <OptionRow key={option.id} option={option} compact />
        ))}
      </div>
    </div>
  );
}

function PrototypePreview({ prototype }: { prototype: SoftGroupingPrototype }) {
  const renderPreview = () => {
    switch (prototype.id) {
      case 'section-divider':
        return <SectionDividerPreview />;
      case 'top-tabs':
        return <TopTabsPreview />;
      case 'two-column':
        return <TwoColumnPreview />;
      default:
        return <InlineBadgePreview />;
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-950">{prototype.title}</h2>
            {prototype.recommended ? (
              <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-black text-cyan-700">推荐</span>
            ) : null}
          </div>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{prototype.summary}</p>
        </div>
        <Layers3 className="h-5 w-5 shrink-0 text-slate-300" />
      </div>
      <div className="mb-2">
        <ActiveSelectField />
      </div>
      {renderPreview()}
    </section>
  );
}

export function AuditPromptSelectSoftGroupingTestPage() {
  return (
    <div className="h-full overflow-y-auto bg-[#F6F8FB] p-5 text-slate-900">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
        <header className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
                <Tags className="h-4 w-4" />
                审核提示词轻量下拉方案
              </div>
              <h1 className="text-xl font-black tracking-normal text-slate-950">降低“剧情审核 / 文本审核”的切换感</h1>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500">
                上一版树形方案把分类层级表达得太强，像在切换目录。这里改成更轻的表达：分类只作为标签、筛选或很弱的分隔，不抢提示词本身的视觉权重。
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xl font-black text-slate-900">{promptOptions.length}</div>
                <div className="text-xs font-bold text-slate-400">提示词</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xl font-black text-slate-900">{Object.keys(groupCounts).length}</div>
                <div className="text-xs font-bold text-slate-400">分类</div>
              </div>
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3">
                <div className="text-xl font-black text-cyan-700">A</div>
                <div className="text-xs font-bold text-cyan-600">建议先试</div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-2">
          {prototypes.map((prototype) => (
            <PrototypePreview key={prototype.id} prototype={prototype} />
          ))}
        </div>
      </div>
    </div>
  );
}
