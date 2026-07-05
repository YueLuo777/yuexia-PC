import {
  BookOpen,
  CheckCircle2,
  FileText,
  PanelLeft,
  PanelRight,
  Save,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const cleanWriterPanels = [
  {
    title: '写作间',
    summary: '把作品、章节和资料入口压到低对比左栏。',
    accent: '#0F766E',
  },
  {
    title: '章节纸稿',
    summary: '正文区留白更大，减少编辑时的视觉噪声。',
    accent: '#F97316',
  },
  {
    title: '修订台',
    summary: '把检查、润色和上下文提示放在右侧轻面板。',
    accent: '#7C3AED',
  },
];

const chapterRows = [
  { title: '第 021 章 暗潮初现', meta: '3,284 字', state: '正在写' },
  { title: '第 022 章 旧案重启', meta: '细纲完成', state: '待续写' },
  { title: '第 023 章 城门夜雨', meta: '缺伏笔', state: '待检查' },
  { title: '人物档案', meta: '17 条', state: '已同步' },
];

const revisionRows = [
  { label: '节奏', text: '本章收在旧案线索上，下一章再揭冲突。' },
  { label: '人物', text: '主角语气保持克制，避免突然热血。' },
  { label: '资料', text: '铜牌、北城司、旧案卷宗已进入上下文。' },
];

function IconOnlyButton({ label, icon: Icon, active = false }: { label: string; icon: LucideIcon; active?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={[
        'flex h-8 w-8 items-center justify-center rounded-lg border transition-colors',
        active
          ? 'border-[#99F6E4] bg-[#CCFBF1] text-[#0F766E]'
          : 'border-[#D9E2DC] bg-white text-[#64736C] hover:border-[#99F6E4] hover:text-[#0F766E]',
      ].join(' ')}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function CleanSectionTitle({ icon: Icon, title, meta }: { icon: LucideIcon; title: string; meta?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#0F766E]">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="min-w-0 truncate text-sm font-black text-[#10201A]">{title}</h2>
      </div>
      {meta ? <span className="shrink-0 text-xs font-bold text-[#718078]">{meta}</span> : null}
    </div>
  );
}

export function CleanWriterStylePreviewTestPage() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F8FAF7] text-[#10201A]">
      <header className="shrink-0 border-b border-[#DDE7E1] bg-white px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#64736C]">
              <span className="h-2 w-2 rounded-full bg-[#0F766E]" />
              CALM TEST
            </div>
            <h1 className="mt-1 text-xl font-black text-[#10201A]">清爽编辑器风格预览</h1>
          </div>
          <div className="flex items-center gap-2">
            <IconOnlyButton label="收起左栏" icon={PanelLeft} />
            <IconOnlyButton label="搜索" icon={Search} active />
            <IconOnlyButton label="保存" icon={Save} />
            <IconOnlyButton label="收起右栏" icon={PanelRight} />
          </div>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {cleanWriterPanels.map((panel) => (
            <div key={panel.title} className="rounded-lg border border-[#DDE7E1] bg-[#FAFFFD] px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: panel.accent }} />
                <span className="text-sm font-black text-[#10201A]">{panel.title}</span>
              </div>
              <p className="mt-1 text-xs font-bold leading-5 text-[#64736C]">{panel.summary}</p>
            </div>
          ))}
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid min-h-[700px] gap-4 xl:grid-cols-[230px_minmax(0,1fr)_300px]">
          <aside className="flex min-h-0 flex-col rounded-lg border border-[#DDE7E1] bg-white">
            <div className="border-b border-[#E8F0EC] p-4">
              <CleanSectionTitle icon={BookOpen} title="写作间" meta="月下案卷" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <div className="space-y-2">
                {chapterRows.map((row, index) => (
                  <button
                    key={row.title}
                    type="button"
                    className={[
                      'w-full rounded-lg border px-3 py-3 text-left transition-colors',
                      index === 0
                        ? 'border-[#99F6E4] bg-[#ECFDF5]'
                        : 'border-transparent bg-white hover:border-[#DDE7E1] hover:bg-[#F8FAF7]',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-sm font-black text-[#10201A]">{row.title}</span>
                      <span className="shrink-0 rounded bg-[#F1F5F3] px-1.5 py-0.5 text-[11px] font-black text-[#64736C]">
                        {row.state}
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-bold text-[#7B8982]">{row.meta}</div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col rounded-lg border border-[#DDE7E1] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8F0EC] px-4 py-3">
              <CleanSectionTitle icon={FileText} title="章节纸稿" meta="第 021 章" />
              <div className="flex items-center gap-2">
                <IconOnlyButton label="参数" icon={SlidersHorizontal} />
                <IconOnlyButton label="AI 辅助" icon={Sparkles} active />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <article className="mx-auto max-w-3xl rounded-lg border border-[#E5ECE8] bg-[#FDFFFE] px-10 py-9 shadow-[0_16px_40px_rgba(15,118,110,0.08)]">
                <div className="flex items-start justify-between gap-3 border-b border-[#E8F0EC] pb-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black text-[#10201A]">第 021 章 暗潮初现</h3>
                    <p className="mt-1 text-xs font-bold text-[#718078]">正文 3,284 字 · 草稿稳定</p>
                  </div>
                  <div className="shrink-0 whitespace-nowrap rounded-lg border border-[#FDBA74] bg-[#FFF7ED] px-3 py-2 text-xs font-black text-[#F97316]">
                    待微调
                  </div>
                </div>

                <div className="mt-7 space-y-5 text-[18px] leading-9 text-[#17231E]">
                  <p>雨声压在檐角，像一张慢慢收紧的网。</p>
                  <p>沈照把铜牌推到灯下，指腹擦过那道细窄划痕，心里最后一点侥幸也沉了下去。</p>
                  <p>这不是普通的失窃案。三年前同样的纹路，曾出现在北城司的封案卷宗里。</p>
                  <p>他抬头看向窗外。巷口的灯忽明忽暗，有人撑着伞站在雨幕深处，始终没有离开。</p>
                </div>
              </article>
            </div>
          </section>

          <aside className="flex min-h-0 flex-col rounded-lg border border-[#DDE7E1] bg-white">
            <div className="border-b border-[#E8F0EC] p-4">
              <CleanSectionTitle icon={CheckCircle2} title="修订台" meta="3 条" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {revisionRows.map((row) => (
                  <div key={row.label} className="rounded-lg border border-[#E5ECE8] bg-[#FAFFFD] px-3 py-3">
                    <div className="text-xs font-black text-[#0F766E]">{row.label}</div>
                    <p className="mt-1 text-xs font-bold leading-5 text-[#64736C]">{row.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ['一致', '92%'],
                  ['节奏', '稳'],
                  ['爽点', '待补'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-[#F8FAF7] px-2 py-2 text-center">
                    <div className="text-sm font-black text-[#10201A]">{value}</div>
                    <div className="mt-0.5 text-[11px] font-bold text-[#718078]">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
