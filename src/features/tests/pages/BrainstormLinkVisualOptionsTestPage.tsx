import { BookOpen, Check, Clock, FileText, Layers, Pin, Sparkles, Star, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

type BrainstormMockItem = {
  id: string;
  title: string;
  genre: string;
  platform: string;
  scale: string;
  updatedAt: string;
  tags: string[];
  sellingPoint: string;
  conflict: string;
  summary: string;
  content: string;
};

const brainstormItems: BrainstormMockItem[] = [
  {
    id: 'brainstorm-1',
    title: '霓虹剑骨',
    genre: '玄幻 + 赛博朋克',
    platform: '番茄 / 起点皆可',
    scale: '120-180 万字',
    updatedAt: '今天 14:20',
    tags: ['废土都市', '修炼体系', '身份觉醒'],
    sellingPoint: '用赛博城市承载玄幻升级，主角的剑骨和义体技术形成双体系成长。',
    conflict: '财阀垄断灵能检测，把底层人改造成消耗品；主角要从维修工一路查到古武断代真相。',
    summary: '失忆剑修在霓虹巨城做义体维修工，一次维修事故唤醒体内剑骨，发现整个城市的灵能秩序都建立在古武遗骸之上。',
    content:
      '这是一本完整长篇的种子：主角从底层维修工开局，前期用义体维修和街区生存切入，中期揭开灵能财阀、地下武馆、古代剑宗遗迹之间的关系，后期把“科技改造”和“剑骨修炼”合成一条新路。核心爽点是底层逆袭、双体系升级、城市阴谋和旧时代传承复苏。',
  },
  {
    id: 'brainstorm-2',
    title: '我在修仙宗门做财务总监',
    genre: '仙侠 + 宗门经营',
    platform: '番茄',
    scale: '80-120 万字',
    updatedAt: '昨天 22:13',
    tags: ['轻喜剧', '经营流', '误会流'],
    sellingPoint: '把修仙宗门写成濒临破产的公司，主角靠财务、采购、债务和资源调度逆转局面。',
    conflict: '外界以为主角是幕后反派，实际上他每次出手都只是为了追回坏账、压低丹药成本、阻止掌门乱花钱。',
    summary: '现代财务穿成小宗门账房，发现宗门灵石亏空、债主上门、掌门沉迷买飞舟，只能靠财务手段把宗门救回来。',
    content:
      '这是一本可独立成书的经营流仙侠。开篇是宗门破产危机，主角用账本发现资源黑洞。前期解决欠债、采购、弟子福利，中期做宗门产业、秘境投资、丹药供应链，后期参与修真界金融秩序重建。笑点来自“别人以为他在布局天下，他只是在做预算”。',
  },
  {
    id: 'brainstorm-3',
    title: '零点重置街区',
    genre: '都市 + 悬疑规则',
    platform: '起点',
    scale: '100-150 万字',
    updatedAt: '06-10 09:35',
    tags: ['规则怪谈', '都市异闻', '调查流'],
    sellingPoint: '城市规则不是副本，而是日常生活的一部分；主角通过快递系统追踪被城市抹掉的人。',
    conflict: '每天零点有一条街被重置，居民记忆会自动合理化，只有无法投递的包裹保留异常证据。',
    summary: '快递员主角发现某些地址永远送不到，追查后发现城市每天都在重置街区，被重置的不只是建筑，还有试图逃离城市的人。',
    content:
      '这是一本完整都市悬疑长篇。主角用快递路线、异常订单、失效门牌逐步建立城市异常地图。前期是单元调查，中期发现重置背后的城市意志和管理者组织，后期冲突升级到“保留真相还是维持城市稳定”。适合做强悬念、规则推理和人物关系反转。',
  },
  {
    id: 'brainstorm-4',
    title: '县志系统',
    genre: '历史 + 基层治理',
    platform: '起点',
    scale: '150-200 万字',
    updatedAt: '06-09 18:02',
    tags: ['历史', '系统流', '治理流'],
    sellingPoint: '系统不发任务也不给奖励，只给县志旧档；主角靠历史记录预判灾害、冤案和地方势力变化。',
    conflict: '主角知道县志里记录的灾祸，却必须判断哪些能改，哪些一改会牵动更大的政治后果。',
    summary: '穿越者得到一本会提前显示地方县志的系统，从救一场洪水开始，一步步卷入地方治理、士绅博弈和朝堂风暴。',
    content:
      '这是一本历史长篇的完整题材。前期是县衙基层事务，主角用县志信息处理洪水、瘟疫、冤案和税粮问题；中期扩展到州府、盐铁、军粮和地方豪强；后期进入朝堂制度冲突。核心不是开挂碾压，而是“知道未来记录，但每次改变都要承担连锁代价”。',
  },
];

const variantOptions = [
  { id: 'cards', label: '方案一：重点卡片' },
  { id: 'timeline', label: '方案二：时间线' },
  { id: 'focus', label: '方案三：双栏聚焦' },
  { id: 'compact', label: '方案四：紧凑高亮' },
] as const;

type VariantId = (typeof variantOptions)[number]['id'];

function SelectionBox({ selected }: { selected: boolean }) {
  return (
    <span
      className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border text-[11px] ${
        selected ? 'border-[#08AACE] bg-[#08AACE] text-white' : 'border-slate-300 bg-white text-transparent'
      }`}
    >
      <Check className="h-3.5 w-3.5" />
    </span>
  );
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span {...{ key: tag }} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-500">
          {tag}
        </span>
      ))}
    </div>
  );
}

function VariantShell({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-black text-slate-900">{title}</h2>
          <p className="mt-1 text-xs font-bold text-slate-400">{note}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs font-black text-[#08AACE]">
          <span className="rounded-full bg-[#EAF9FD] px-2.5 py-1">已关联 2 本候选</span>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-600">完整书稿种子</span>
        </div>
      </header>
      {children}
    </section>
  );
}

function CardsVariant({ selectedIds, toggleSelected }: { selectedIds: Set<string>; toggleSelected: (id: string) => void }) {
  return (
    <VariantShell title="方案一：书籍候选卡" note="每个脑洞按一本书的候选项目呈现，优先突出题材、平台、卖点和主线冲突。">
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_340px] gap-4 p-5">
        <div className="editor-scrollbar min-h-0 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            {brainstormItems.map((item, index) => {
              const selected = selectedIds.has(item.id);
              const tone = index % 4 === 0 ? 'border-[#08AACE]/45 bg-[#F0FBFE]' : index % 4 === 1 ? 'border-amber-200 bg-amber-50' : index % 4 === 2 ? 'border-violet-200 bg-violet-50' : 'border-rose-200 bg-rose-50';
              return (
                <button
                  {...{ key: item.id }}
                  type="button"
                  onClick={() => toggleSelected(item.id)}
                  className={`min-h-[188px] rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${selected ? 'ring-2 ring-[#08AACE]' : ''} ${tone}`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#08AACE] shadow-sm">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <SelectionBox selected={selected} />
                  </div>
                  <div className="text-lg font-black leading-6 text-slate-900">{item.title}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs font-black text-slate-400">
                    <span>{item.genre}</span>
                    <span>·</span>
                    <span>{item.scale}</span>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">{item.summary}</p>
                  <div className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-xs font-bold leading-5 text-slate-600">
                    卖点：{item.sellingPoint}
                  </div>
                  <div className="mt-3">
                    <TagList tags={item.tags} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <aside className="min-h-0 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="mb-3 text-sm font-black text-slate-900">当前预览</div>
          <div className="rounded-xl bg-white p-4 text-sm font-semibold leading-7 text-slate-600 shadow-sm">
            {brainstormItems[0].content}
          </div>
        </aside>
      </div>
    </VariantShell>
  );
}

function TimelineVariant({ selectedIds, toggleSelected }: { selectedIds: Set<string>; toggleSelected: (id: string) => void }) {
  return (
    <VariantShell title="方案二：候选书单" note="按创建时间展示多个独立成书的脑洞，更像待开发项目列表。">
      <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
        <div className="relative mx-auto max-w-4xl">
          <div className="absolute bottom-4 left-[18px] top-4 w-px bg-slate-200" />
          <div className="space-y-4">
            {brainstormItems.map((item, index) => {
              const selected = selectedIds.has(item.id);
              return (
                <button
                  {...{ key: item.id }}
                  type="button"
                  onClick={() => toggleSelected(item.id)}
                  className={`relative grid w-full grid-cols-[38px_minmax(0,1fr)] gap-3 text-left ${selected ? 'text-slate-900' : 'text-slate-600'}`}
                >
                  <span className={`z-10 grid h-9 w-9 place-items-center rounded-full border-4 border-white text-xs font-black shadow-sm ${selected ? 'bg-[#08AACE] text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {index + 1}
                  </span>
                  <span className={`rounded-xl border p-4 shadow-sm transition hover:border-[#08AACE]/40 ${selected ? 'border-[#08AACE] bg-[#F0FBFE]' : 'border-slate-100 bg-white'}`}>
                    <span className="flex items-start justify-between gap-4">
                      <span className="min-w-0">
                        <span className="block text-lg font-black text-slate-900">{item.title}</span>
                        <span className="mt-1 flex items-center gap-2 text-xs font-black text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          {item.updatedAt}
                          <span>·</span>
                          {item.genre}
                          <span>·</span>
                          {item.platform}
                        </span>
                      </span>
                      <SelectionBox selected={selected} />
                    </span>
                    <span className="mt-3 block text-sm font-semibold leading-6 text-slate-600">{item.summary}</span>
                    <span className="mt-3 block rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold leading-5 text-slate-500">
                      主线冲突：{item.conflict}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </VariantShell>
  );
}

function FocusVariant({ selectedIds, toggleSelected }: { selectedIds: Set<string>; toggleSelected: (id: string) => void }) {
  const [previewId, setPreviewId] = useState(brainstormItems[0].id);
  const preview = useMemo(() => brainstormItems.find((item) => item.id === previewId) ?? brainstormItems[0], [previewId]);

  return (
    <VariantShell title="方案三：项目预览" note="左侧是独立书籍候选，右侧预览完整开发信息，适合迁入正式关联脑洞页。">
      <div className="grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)]">
        <aside className="min-h-0 border-r border-slate-100 bg-slate-50 p-4">
          <div className="editor-scrollbar h-full space-y-2 overflow-y-auto pr-1">
            {brainstormItems.map((item) => {
              const selected = selectedIds.has(item.id);
              const active = preview.id === item.id;
              return (
                <button
                  {...{ key: item.id }}
                  type="button"
                  onClick={() => setPreviewId(item.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${active ? 'border-[#08AACE] bg-white shadow-sm' : 'border-transparent bg-white/70 hover:bg-white'} ${selected ? 'ring-1 ring-[#08AACE]/40' : ''}`}
                >
                  <span className="mb-2 flex items-start justify-between gap-3">
                    <span className="min-w-0 truncate text-base font-black text-slate-900">{item.title}</span>
                    <span
                      role="checkbox"
                      aria-checked={selected}
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleSelected(item.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter' && event.key !== ' ') return;
                        event.preventDefault();
                        event.stopPropagation();
                        toggleSelected(item.id);
                      }}
                    >
                      <SelectionBox selected={selected} />
                    </span>
                  </span>
                  <span className="mb-2 flex flex-wrap gap-1.5">
                    <span className="rounded-md bg-[#EAF9FD] px-2 py-0.5 text-[11px] font-black text-[#08AACE]">{item.genre}</span>
                    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-black text-amber-600">{item.scale}</span>
                  </span>
                  <span className="line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{item.summary}</span>
                </button>
              );
            })}
          </div>
        </aside>
        <main className="min-h-0 p-5">
          <article className="flex h-full min-h-0 flex-col rounded-2xl border border-[#08AACE]/30 bg-[#F8FDFF] p-5">
            <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-black text-[#08AACE]">
                  <Pin className="h-4 w-4" />
                  {preview.genre} · {preview.platform} · {preview.scale}
                </div>
                <h3 className="mt-2 text-2xl font-black text-slate-900">{preview.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => toggleSelected(preview.id)}
                className={`h-9 rounded-xl px-4 text-sm font-black ${selectedIds.has(preview.id) ? 'bg-[#08AACE] text-white' : 'border border-[#08AACE] bg-white text-[#08AACE]'}`}
              >
                {selectedIds.has(preview.id) ? '已关联' : '关联此项'}
              </button>
            </div>
            <TagList tags={preview.tags} />
            <div className="mt-4 grid shrink-0 grid-cols-2 gap-3">
              <div className="rounded-xl bg-white p-3 text-xs font-bold leading-5 text-slate-600">
                <div className="mb-1 text-[11px] font-black text-[#08AACE]">核心卖点</div>
                {preview.sellingPoint}
              </div>
              <div className="rounded-xl bg-white p-3 text-xs font-bold leading-5 text-slate-600">
                <div className="mb-1 text-[11px] font-black text-amber-600">主线冲突</div>
                {preview.conflict}
              </div>
            </div>
            <div className="editor-scrollbar mt-4 min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-xl bg-white p-4 text-sm font-semibold leading-7 text-slate-600">
              {preview.content}
            </div>
          </article>
        </main>
      </div>
    </VariantShell>
  );
}

function CompactVariant({ selectedIds, toggleSelected }: { selectedIds: Set<string>; toggleSelected: (id: string) => void }) {
  return (
    <VariantShell title="方案四：项目表格" note="适合候选书很多时使用，用更高密度比较题材、平台、体量和卖点。">
      <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
        <div className="space-y-2">
          {brainstormItems.map((item) => {
            const selected = selectedIds.has(item.id);
            return (
              <button
                {...{ key: item.id }}
                type="button"
                onClick={() => toggleSelected(item.id)}
                className={`grid w-full grid-cols-[28px_minmax(0,1.1fr)_150px_120px_minmax(0,1fr)] items-center gap-3 rounded-xl border px-3 py-3 text-left transition hover:border-[#08AACE]/50 ${selected ? 'border-[#08AACE] bg-[#F0FBFE]' : 'border-slate-100 bg-white'}`}
              >
                <SelectionBox selected={selected} />
                <span className="min-w-0">
                  <span className="block truncate text-base font-black text-slate-900">{item.title}</span>
                  <span className="mt-0.5 block truncate text-xs font-bold text-slate-400">{item.summary}</span>
                </span>
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-center text-xs font-black text-slate-500">{item.genre}</span>
                <span className="text-xs font-black text-slate-400">{item.scale}</span>
                <span className="truncate text-xs font-bold text-slate-500">{item.sellingPoint}</span>
              </button>
            );
          })}
        </div>
      </div>
    </VariantShell>
  );
}

export function BrainstormLinkVisualOptionsTestPage() {
  const [variant, setVariant] = useState<VariantId>('cards');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(['brainstorm-1', 'brainstorm-2']));

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <header className="shrink-0 border-b border-slate-100 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-black text-slate-900">关联脑洞视觉方案测试</h1>
            <p className="mt-1 text-sm font-bold text-slate-400">目标：把每个脑洞当成一本可独立开发的小说候选，而不是零散人物、桥段或设定。</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
            {variantOptions.map((item) => (
              <button
                {...{ key: item.id }}
                type="button"
                onClick={() => setVariant(item.id)}
                className={`h-9 rounded-xl px-3 text-xs font-black transition-colors ${variant === item.id ? 'bg-[#08AACE] text-white shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[240px_minmax(0,1fr)] gap-4 p-5">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-black text-slate-900">方案判断</div>
            <Sparkles className="h-4 w-4 text-[#08AACE]" />
          </div>
          <div className="space-y-3 text-xs font-bold leading-5 text-slate-500">
            <div className="rounded-xl bg-[#F0FBFE] p-3">
              <div className="mb-1 flex items-center gap-2 font-black text-[#08AACE]">
                <Star className="h-3.5 w-3.5" />
                推荐方向
              </div>
              正式页更建议用方案三，能保持“左边目录，右边预览”的一致性，同时把脑洞卡片做得更突出。
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
              <div className="mb-1 flex items-center gap-2 font-black">
                <Zap className="h-3.5 w-3.5" />
                可组合点
              </div>
              方案三的结构可以加方案一的题材、平台、体量、卖点字段，让每本候选书更容易比较。
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="mb-1 flex items-center gap-2 font-black text-slate-700">
                <Layers className="h-3.5 w-3.5" />
                交互规则
              </div>
              点击脑洞主体只预览；点击勾选框或“关联此项”才关联。关联的是一整本书的脑洞项目。
            </div>
            <div className="rounded-xl bg-rose-50 p-3 text-rose-700">
              <div className="mb-1 flex items-center gap-2 font-black">
                <FileText className="h-3.5 w-3.5" />
                适用场景
              </div>
              候选书少用卡片，候选书多用项目表格；正式关联页建议用双栏项目预览。
            </div>
          </div>
        </aside>

        {variant === 'cards' && <CardsVariant selectedIds={selectedIds} toggleSelected={toggleSelected} />}
        {variant === 'timeline' && <TimelineVariant selectedIds={selectedIds} toggleSelected={toggleSelected} />}
        {variant === 'focus' && <FocusVariant selectedIds={selectedIds} toggleSelected={toggleSelected} />}
        {variant === 'compact' && <CompactVariant selectedIds={selectedIds} toggleSelected={toggleSelected} />}
      </main>
    </div>
  );
}
