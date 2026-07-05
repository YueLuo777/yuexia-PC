import {
  Activity,
  BarChart3,
  CheckCircle2,
  Cpu,
  FileSearch,
  Gauge,
  PanelLeft,
  PanelRight,
  Radar,
  Save,
  Search,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const darkConsoleSignals = [
  { label: '连贯度', value: '91%', tone: 'border-[#22D3EE]/45 bg-[#0E2E3A] text-[#67E8F9]' },
  { label: '伏笔', value: '2 条', tone: 'border-[#F59E0B]/45 bg-[#332714] text-[#FBBF24]' },
  { label: '风险', value: '低', tone: 'border-[#34D399]/45 bg-[#123326] text-[#86EFAC]' },
];

const radarRows = [
  { title: '主线推进', value: '旧案线索已露出', state: 'ON' },
  { title: '人物边界', value: '沈照保持克制', state: 'OK' },
  { title: '世界规则', value: '北城司权责未越界', state: 'OK' },
  { title: '爽点储备', value: '反制节点待补强', state: 'WARN' },
];

const consoleChecks = [
  { label: '章节目标', text: '拿到铜牌线索，保留幕后身份。' },
  { label: '连续性', text: '对应第 018 章的划痕伏笔。' },
  { label: '下一步', text: '补一个主动反制动作，避免只承压。' },
];

function ConsoleIconButton({
  label,
  icon: Icon,
  active = false,
}: {
  label: string;
  icon: LucideIcon;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={[
        'flex h-8 w-8 items-center justify-center rounded-lg border transition-colors',
        active
          ? 'border-[#22D3EE] bg-[#0E7490] text-white shadow-[0_0_20px_rgba(34,211,238,0.24)]'
          : 'border-[#334155] bg-[#111827] text-[#94A3B8] hover:border-[#22D3EE] hover:text-[#67E8F9]',
      ].join(' ')}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function ConsoleSectionTitle({ icon: Icon, title, meta }: { icon: LucideIcon; title: string; meta?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#22D3EE]/35 bg-[#083344] text-[#67E8F9]">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="min-w-0 truncate text-sm font-black text-[#E5F2FF]">{title}</h2>
      </div>
      {meta ? <span className="shrink-0 text-xs font-bold text-[#94A3B8]">{meta}</span> : null}
    </div>
  );
}

export function DarkConsoleStylePreviewTestPage() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#070B12] text-[#E5F2FF]">
      <header className="shrink-0 border-b border-[#1F2937] bg-[#0B1220] px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#94A3B8]">
              <span className="h-2 w-2 rounded-full bg-[#22D3EE]" />
              SIGNAL TEST
            </div>
            <h1 className="mt-1 text-xl font-black text-white">深色控制台风格预览</h1>
          </div>
          <div className="flex items-center gap-2">
            <ConsoleIconButton label="收起左栏" icon={PanelLeft} />
            <ConsoleIconButton label="搜索信号" icon={Search} active />
            <ConsoleIconButton label="保存快照" icon={Save} />
            <ConsoleIconButton label="收起右栏" icon={PanelRight} />
          </div>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {darkConsoleSignals.map((signal) => (
            <div key={signal.label} className={`rounded-lg border px-3 py-2 ${signal.tone}`}>
              <div className="text-sm font-black">{signal.value}</div>
              <div className="mt-1 text-xs font-bold">{signal.label}</div>
            </div>
          ))}
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid min-h-[700px] gap-4 xl:grid-cols-[250px_minmax(0,1fr)_310px]">
          <aside className="flex min-h-0 flex-col rounded-lg border border-[#1F2937] bg-[#0B1220]">
            <div className="border-b border-[#1F2937] p-4">
              <ConsoleSectionTitle icon={Radar} title="项目雷达" meta="LIVE" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <div className="space-y-2">
                {radarRows.map((row, index) => (
                  <button
                    key={row.title}
                    type="button"
                    className={[
                      'w-full rounded-lg border px-3 py-3 text-left transition-colors',
                      index === 0
                        ? 'border-[#22D3EE]/50 bg-[#0E2E3A]'
                        : 'border-[#1F2937] bg-[#0F172A] hover:border-[#334155]',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-sm font-black text-[#E5F2FF]">{row.title}</span>
                      <span className="shrink-0 rounded border border-[#334155] px-1.5 py-0.5 text-[11px] font-black text-[#CBD5E1]">
                        {row.state}
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-bold text-[#94A3B8]">{row.value}</div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col rounded-lg border border-[#1F2937] bg-[#0B1220]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F2937] px-4 py-3">
              <ConsoleSectionTitle icon={Cpu} title="章节指挥台" meta="第 021 章" />
              <div className="flex items-center gap-2">
                <ConsoleIconButton label="节奏面板" icon={Gauge} />
                <ConsoleIconButton label="AI 调度" icon={Sparkles} active />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <article className="mx-auto max-w-3xl rounded-lg border border-[#253247] bg-[#0F172A] px-8 py-8 shadow-[0_20px_55px_rgba(0,0,0,0.35)]">
                <div className="flex items-start justify-between gap-3 border-b border-[#253247] pb-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black text-white">第 021 章 暗潮初现</h3>
                    <p className="mt-1 text-xs font-bold text-[#94A3B8]">正文 3,284 字 · 状态监控中</p>
                  </div>
                  <div className="shrink-0 whitespace-nowrap rounded-lg border border-[#F59E0B]/45 bg-[#332714] px-3 py-2 text-xs font-black text-[#FBBF24]">
                    需补爽点
                  </div>
                </div>

                <div className="mt-7 space-y-5 font-mono text-[16px] leading-8 text-[#D8F3FF]">
                  <p>雨声压在檐角，像一张慢慢收紧的网。</p>
                  <p>沈照把铜牌推到灯下，指腹擦过那道细窄划痕，心里最后一点侥幸也沉了下去。</p>
                  <p>这不是普通的失窃案。三年前同样的纹路，曾出现在北城司的封案卷宗里。</p>
                  <p>巷口的灯忽明忽暗，有人撑着伞站在雨幕深处，始终没有离开。</p>
                </div>

                <div className="mt-7 grid gap-3 border-t border-[#253247] pt-4 md:grid-cols-3">
                  {[
                    ['读者钩子', '强'],
                    ['设定漂移', '低'],
                    ['反制动作', '待补'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-[#1F2937] bg-[#111827] px-3 py-2">
                      <div className="text-[11px] font-black text-[#94A3B8]">{label}</div>
                      <div className="mt-1 text-sm font-black text-[#67E8F9]">{value}</div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>

          <aside className="flex min-h-0 flex-col rounded-lg border border-[#1F2937] bg-[#0B1220]">
            <div className="border-b border-[#1F2937] p-4">
              <ConsoleSectionTitle icon={Activity} title="AI 监控" meta="3 信号" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {consoleChecks.map((row) => (
                  <div key={row.label} className="rounded-lg border border-[#1F2937] bg-[#0F172A] px-3 py-3">
                    <div className="text-xs font-black text-[#22D3EE]">{row.label}</div>
                    <p className="mt-1 text-xs font-bold leading-5 text-[#CBD5E1]">{row.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg border border-[#334155] bg-[#111827] p-3">
                <div className="flex items-center gap-2 text-sm font-black text-[#E5F2FF]">
                  <BarChart3 className="h-4 w-4 text-[#F59E0B]" />
                  输出队列
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    ['细纲校验', '完成'],
                    ['伏笔回收', '待确认'],
                    ['下一章动作', '生成中'],
                  ].map(([label, state]) => (
                    <div key={label} className="flex items-center justify-between rounded-lg bg-[#0B1220] px-3 py-2">
                      <span className="text-xs font-black text-[#E5F2FF]">{label}</span>
                      <span className="text-[11px] font-bold text-[#94A3B8]">{state}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[#1F2937] p-4">
              <div className="grid grid-cols-3 gap-2">
                <ConsoleIconButton label="检查" icon={FileSearch} active />
                <ConsoleIconButton label="确认" icon={CheckCircle2} />
                <ConsoleIconButton label="监控" icon={Activity} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
