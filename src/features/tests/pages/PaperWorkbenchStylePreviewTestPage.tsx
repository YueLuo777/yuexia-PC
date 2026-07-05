import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Layers3,
  MessageSquareText,
  PanelLeft,
  PanelRight,
  Save,
  Search,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const PAPER_SURFACE_COLOR = '#F6F1E7';
const BRAND_CYAN = '#08AACE';

type PreviewColumn = {
  id: string;
  title: string;
  summary: string;
  accent: string;
};

const paperWorkbenchPreviewColumns: PreviewColumn[] = [
  {
    id: 'library',
    title: '作品索引',
    summary: '作品、章纲、设定和资料入口收在左侧，密度更高。',
    accent: '#6C7F45',
  },
  {
    id: 'paper',
    title: '正文纸面',
    summary: '中区保留稿纸感和清晰正文层级，减少多余装饰。',
    accent: BRAND_CYAN,
  },
  {
    id: 'ai',
    title: 'AI 侧栏',
    summary: '右侧只放上下文、检查结果和下一步动作。',
    accent: '#B97719',
  },
];

const outlineRows = [
  { title: '第 021 章  暗潮初现', meta: '正文 3,284 字', state: '编辑中', active: true },
  { title: '第 022 章  旧案重启', meta: '细纲完成', state: '待写', active: false },
  { title: '第 023 章  城门夜雨', meta: '梗概缺伏笔', state: '检查', active: false },
  { title: '人物状态', meta: '17 条资料', state: '同步', active: false },
  { title: '地点场景', meta: '6 条资料', state: '更新', active: false },
];

const manuscriptLines = [
  '雨声压在檐角，像一张慢慢收紧的网。',
  '沈照把铜牌推到灯下，指腹擦过那道细窄划痕，心里最后一点侥幸也沉了下去。',
  '这不是普通的失窃案。三年前同样的纹路，曾出现在北城司的封案卷宗里。',
  '他抬头看向窗外。巷口的灯忽明忽暗，有人撑着伞站在雨幕深处，始终没有离开。',
];

const contextItems = [
  { label: '章纲命中', value: '4/5', tone: 'bg-[#E9F8F5] text-[#0F766E]' },
  { label: '伏笔提醒', value: '2 条', tone: 'bg-[#FFF4D7] text-[#9A5B00]' },
  { label: '人设风险', value: '低', tone: 'bg-[#EAF9FD] text-[#087F99]' },
];

const reviewRows = [
  { label: '主角目标', text: '本章要拿到旧案线索，不提前揭底。' },
  { label: '爽点节奏', text: '结尾放反制，不让主角只被动挨打。' },
  { label: '连续性', text: '铜牌划痕需对应第 018 章铺垫。' },
];

function IconButton({ label, icon: Icon, active = false }: { label: string; icon: LucideIcon; active?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={[
        'flex h-8 w-8 items-center justify-center rounded-lg border transition-colors',
        active
          ? 'border-[#9BEFFC] bg-[#EAF9FD] text-[#087F99]'
          : 'border-[#DED4C4] bg-[#FFFDF8] text-[#776C5E] hover:border-[#9BEFFC] hover:text-[#087F99]',
      ].join(' ')}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function SectionTitle({ icon: Icon, title, meta }: { icon: LucideIcon; title: string; meta?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF9FD] text-[#087F99]">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="min-w-0 truncate text-sm font-black text-[#24211C]">{title}</h2>
      </div>
      {meta ? <span className="shrink-0 text-xs font-bold text-[#9C9285]">{meta}</span> : null}
    </div>
  );
}

export function PaperWorkbenchStylePreviewTestPage() {
  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden text-[#24211C]"
      style={{
        backgroundColor: PAPER_SURFACE_COLOR,
        backgroundImage:
          'linear-gradient(90deg, rgba(80, 68, 46, 0.045) 1px, transparent 1px), linear-gradient(180deg, rgba(80, 68, 46, 0.035) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      <header className="shrink-0 border-b border-[#DED4C4] bg-[#FFFDF8]/95 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#7D715F]">
              <span className="h-2 w-2 rounded-full bg-[#08AACE]" />
              STYLE TEST
            </div>
            <h1 className="mt-1 text-xl font-black text-[#1F2933]">纸墨工作台风格预览</h1>
          </div>
          <div className="flex items-center gap-2">
            <IconButton label="收起左栏" icon={PanelLeft} />
            <IconButton label="搜索资料" icon={Search} active />
            <IconButton label="保存样张" icon={Save} />
            <IconButton label="收起右栏" icon={PanelRight} />
          </div>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {paperWorkbenchPreviewColumns.map((column) => (
            <div key={column.id} className="rounded-lg border border-[#E2D7C6] bg-[#FFFDF8] px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: column.accent }} />
                <span className="text-sm font-black text-[#24211C]">{column.title}</span>
              </div>
              <p className="mt-1 text-xs font-bold leading-5 text-[#7D715F]">{column.summary}</p>
            </div>
          ))}
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid min-h-[720px] gap-4 xl:grid-cols-[240px_minmax(0,1fr)_300px]">
          <aside className="flex min-h-0 flex-col rounded-lg border border-[#D8CDBB] bg-[#FFFDF8]">
            <div className="border-b border-[#E7DDCC] p-4">
              <SectionTitle icon={BookOpen} title="作品索引" meta="月下案卷" />
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  ['设定', '42'],
                  ['章纲', '23'],
                  ['伏笔', '18'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-[#F6F1E7] px-2 py-2">
                    <div className="text-base font-black text-[#1F2933]">{value}</div>
                    <div className="text-[11px] font-bold text-[#8A7E6C]">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <div className="space-y-2">
                {outlineRows.map((row) => (
                  <button
                    key={row.title}
                    type="button"
                    className={[
                      'w-full rounded-lg border px-3 py-3 text-left transition-colors',
                      row.active
                        ? 'border-[#9BEFFC] bg-[#EAF9FD]'
                        : 'border-transparent bg-transparent hover:border-[#E2D7C6] hover:bg-[#FCF8EE]',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-sm font-black text-[#24211C]">{row.title}</span>
                      <span className="shrink-0 rounded bg-[#EFE7DA] px-1.5 py-0.5 text-[11px] font-black text-[#7D715F]">
                        {row.state}
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-bold text-[#928676]">{row.meta}</div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col rounded-lg border border-[#D8CDBB] bg-[#FFFDF8]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7DDCC] px-4 py-3">
              <SectionTitle icon={FileText} title="正文纸面" meta="第 021 章" />
              <div className="flex items-center gap-2">
                <IconButton label="上一章" icon={ChevronLeft} />
                <IconButton label="下一章" icon={ChevronRight} />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
              <article className="mx-auto max-w-3xl rounded-lg border border-[#E3D7C5] bg-[#FFFDF9] px-8 py-8 shadow-[0_18px_45px_rgba(80,68,46,0.10)]">
                <div className="flex items-start justify-between gap-3 border-b border-[#EEE4D3] pb-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black text-[#1F2933]">第 021 章 暗潮初现</h3>
                    <p className="mt-1 text-xs font-bold text-[#8A7E6C]">正文 3,284 字 · 最近保存 02:16</p>
                  </div>
                  <div className="shrink-0 whitespace-nowrap rounded-lg border border-[#BDEEF7] bg-[#EAF9FD] px-3 py-2 text-xs font-black text-[#087F99]">
                    风格稳定
                  </div>
                </div>

                <div
                  className="mt-7 whitespace-pre-wrap text-[18px] leading-[38px] text-[#25211B]"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(to bottom, transparent 0, transparent 37px, rgba(139, 119, 86, 0.22) 38px)',
                  }}
                >
                  {manuscriptLines.join('\n\n')}
                </div>

                <div className="mt-8 grid gap-3 border-t border-[#EEE4D3] pt-4 md:grid-cols-3">
                  {[
                    ['节奏', '收束铺垫'],
                    ['视角', '主角近景'],
                    ['语气', '冷静压迫'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-[#F6F1E7] px-3 py-2">
                      <div className="text-[11px] font-black text-[#8A7E6C]">{label}</div>
                      <div className="mt-1 text-sm font-black text-[#24211C]">{value}</div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>

          <aside className="flex min-h-0 flex-col rounded-lg border border-[#D8CDBB] bg-[#FFFDF8]">
            <div className="border-b border-[#E7DDCC] p-4">
              <SectionTitle icon={BrainCircuit} title="AI 侧栏" meta="上下文" />
              <div className="mt-4 grid grid-cols-3 gap-2">
                {contextItems.map((item) => (
                  <div key={item.label} className={`rounded-lg px-2 py-2 text-center ${item.tone}`}>
                    <div className="text-sm font-black">{item.value}</div>
                    <div className="mt-0.5 text-[11px] font-bold">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="rounded-lg border border-[#E2D7C6] bg-[#FCF8EE] p-3">
                <div className="flex items-center gap-2 text-sm font-black text-[#24211C]">
                  <Sparkles className="h-4 w-4 text-[#B97719]" />
                  章节检查
                </div>
                <div className="mt-3 space-y-3">
                  {reviewRows.map((row) => (
                    <div key={row.label} className="rounded-lg bg-[#FFFDF8] px-3 py-2">
                      <div className="text-xs font-black text-[#087F99]">{row.label}</div>
                      <p className="mt-1 text-xs font-bold leading-5 text-[#6F6457]">{row.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-[#E2D7C6] bg-[#FFFDF8] p-3">
                <div className="flex items-center gap-2 text-sm font-black text-[#24211C]">
                  <Layers3 className="h-4 w-4 text-[#6C7F45]" />
                  关联资料
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    ['旧案卷宗', '已读取'],
                    ['铜牌伏笔', '待回收'],
                    ['北城司关系', '已同步'],
                  ].map(([title, state]) => (
                    <div key={title} className="flex items-center justify-between rounded-lg bg-[#F6F1E7] px-3 py-2">
                      <span className="text-xs font-black text-[#24211C]">{title}</span>
                      <span className="text-[11px] font-bold text-[#8A7E6C]">{state}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[#E7DDCC] p-4">
              <div className="grid grid-cols-3 gap-2">
                <IconButton label="继续生成" icon={MessageSquareText} active />
                <IconButton label="一致性检查" icon={CheckCircle2} />
                <IconButton label="记录时间线" icon={Clock3} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
