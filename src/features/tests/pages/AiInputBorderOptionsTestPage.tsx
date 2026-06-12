import { Check, Copy, RotateCcw, Send, Sparkles, Square, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

type AiInputBorderVariant = {
  id: string;
  name: string;
  shortName: string;
  source: string;
  note: string;
  panelBg: string;
  controlBg: string;
  controlBorder: string;
  tabActiveBg: string;
  tabActiveText: string;
  tabMutedBg: string;
  tabMutedText: string;
  linkedPillBg: string;
  linkedPillText: string;
  inputBg: string;
  inputBorder: string;
  inputFocus: string;
  inputText: string;
  sendBg: string;
  sendText: string;
  stopText: string;
  actionBg: string;
  actionBorder: string;
};

const aiInputBorderVariants: AiInputBorderVariant[] = [
  {
    id: 'neutral-slate',
    name: '方案一：中性灰线',
    shortName: '中性灰',
    source: '把蓝色从边框里拿掉，只保留清晰的灰色层级。',
    note: '最稳妥，和编辑器、资料区、按钮都容易融合。适合长时间写作，不会抢正文注意力。',
    panelBg: '#F8FAFC',
    controlBg: '#FFFFFF',
    controlBorder: '#D7DEE8',
    tabActiveBg: '#EEF3F8',
    tabActiveText: '#334155',
    tabMutedBg: '#F8FAFC',
    tabMutedText: '#64748B',
    linkedPillBg: '#F1F5F9',
    linkedPillText: '#475569',
    inputBg: '#FFFFFF',
    inputBorder: '#D7DEE8',
    inputFocus: '#94A3B8',
    inputText: '#334155',
    sendBg: '#334155',
    sendText: '#FFFFFF',
    stopText: '#E25555',
    actionBg: '#FFFFFF',
    actionBorder: '#E2E8F0',
  },
  {
    id: 'mist-cyan',
    name: '方案二：雾蓝低饱和',
    shortName: '雾蓝',
    source: '保留一点 AI 区域识别感，但避开当前高饱和亮蓝。',
    note: '比现有蓝色柔和很多，仍然能让“关联资料”和发送按钮保持轻微科技感。',
    panelBg: '#F7FBFC',
    controlBg: '#FFFFFF',
    controlBorder: '#9FD9E5',
    tabActiveBg: '#EAF8FB',
    tabActiveText: '#0F6675',
    tabMutedBg: '#F8FCFD',
    tabMutedText: '#5A7280',
    linkedPillBg: '#EAF8FB',
    linkedPillText: '#0F6675',
    inputBg: '#FFFFFF',
    inputBorder: '#9FD9E5',
    inputFocus: '#55B9CC',
    inputText: '#254152',
    sendBg: '#3B8797',
    sendText: '#FFFFFF',
    stopText: '#D64F4F',
    actionBg: '#FFFFFF',
    actionBorder: '#D4EEF3',
  },
  {
    id: 'indigo-gray',
    name: '方案三：灰紫蓝线',
    shortName: '灰紫蓝',
    source: '用偏灰的靛蓝替代青蓝，视觉更像专业编辑工具。',
    note: '边框有颜色但不刺眼，适合你现在这种浅色桌面软件风格。',
    panelBg: '#F8F8FD',
    controlBg: '#FFFFFF',
    controlBorder: '#B9C7E6',
    tabActiveBg: '#EEF2FF',
    tabActiveText: '#3D4D87',
    tabMutedBg: '#FAFAFF',
    tabMutedText: '#667085',
    linkedPillBg: '#EEF2FF',
    linkedPillText: '#3D4D87',
    inputBg: '#FFFFFF',
    inputBorder: '#B9C7E6',
    inputFocus: '#7C8EC8',
    inputText: '#30384F',
    sendBg: '#4B5F9C',
    sendText: '#FFFFFF',
    stopText: '#D14C55',
    actionBg: '#FFFFFF',
    actionBorder: '#DDE3F4',
  },
  {
    id: 'sage-green',
    name: '方案四：浅绿安静版',
    shortName: '浅绿',
    source: '用低饱和绿色表达“已关联资料”的可用状态。',
    note: '关联感更自然，适合把“资料已准备好”做成轻提示，而不是强按钮。',
    panelBg: '#F7FBF8',
    controlBg: '#FFFFFF',
    controlBorder: '#A7D7C5',
    tabActiveBg: '#ECFDF5',
    tabActiveText: '#216C4F',
    tabMutedBg: '#FAFFFC',
    tabMutedText: '#5F756B',
    linkedPillBg: '#ECFDF5',
    linkedPillText: '#216C4F',
    inputBg: '#FFFFFF',
    inputBorder: '#A7D7C5',
    inputFocus: '#5FAF8F',
    inputText: '#2C453A',
    sendBg: '#347C61',
    sendText: '#FFFFFF',
    stopText: '#D55353',
    actionBg: '#FFFFFF',
    actionBorder: '#D7EFE4',
  },
  {
    id: 'warm-paper',
    name: '方案五：暖纸张线',
    shortName: '暖纸张',
    source: '让输入框更接近纸张和写作工具，减少冷色 UI 感。',
    note: '比灰线更有温度，适合小说编辑器，但需要注意不要让页面变成泛黄主题。',
    panelBg: '#FBFAF7',
    controlBg: '#FFFFFF',
    controlBorder: '#E8D5B7',
    tabActiveBg: '#FFF7ED',
    tabActiveText: '#8A5A25',
    tabMutedBg: '#FFFDF9',
    tabMutedText: '#76695A',
    linkedPillBg: '#FFF7ED',
    linkedPillText: '#8A5A25',
    inputBg: '#FFFFFF',
    inputBorder: '#E8D5B7',
    inputFocus: '#C89B5E',
    inputText: '#4A3B2B',
    sendBg: '#8A6A43',
    sendText: '#FFFFFF',
    stopText: '#C84D4D',
    actionBg: '#FFFFFF',
    actionBorder: '#F0E1CC',
  },
  {
    id: 'hairline-minimal',
    name: '方案六：极细发丝线',
    shortName: '发丝线',
    source: '弱化所有色彩，只靠细边框和阴影区分可输入区域。',
    note: '最轻，最不打扰正文。适合正式迁入时作为安全版本，但激活态需要靠光标和发送按钮识别。',
    panelBg: '#F9FAFB',
    controlBg: '#FFFFFF',
    controlBorder: '#CBD5E1',
    tabActiveBg: '#FFFFFF',
    tabActiveText: '#111827',
    tabMutedBg: '#F8FAFC',
    tabMutedText: '#6B7280',
    linkedPillBg: '#FFFFFF',
    linkedPillText: '#475569',
    inputBg: '#FFFFFF',
    inputBorder: '#CBD5E1',
    inputFocus: '#64748B',
    inputText: '#1F2937',
    sendBg: '#111827',
    sendText: '#FFFFFF',
    stopText: '#DC5555',
    actionBg: '#FFFFFF',
    actionBorder: '#E5E7EB',
  },
  {
    id: 'graphite-focus',
    name: '方案七：石墨聚焦版',
    shortName: '石墨',
    source: '平时是浅灰，真正可操作的按钮用深色聚焦。',
    note: '视觉更干净，按钮更明确；适合用户频繁输入、发送、停止的场景。',
    panelBg: '#F7F8FA',
    controlBg: '#FFFFFF',
    controlBorder: '#E2E8F0',
    tabActiveBg: '#F8FAFC',
    tabActiveText: '#1E293B',
    tabMutedBg: '#FFFFFF',
    tabMutedText: '#64748B',
    linkedPillBg: '#F8FAFC',
    linkedPillText: '#1E293B',
    inputBg: '#FFFFFF',
    inputBorder: '#E2E8F0',
    inputFocus: '#1F2937',
    inputText: '#1E293B',
    sendBg: '#1F2937',
    sendText: '#FFFFFF',
    stopText: '#D94848',
    actionBg: '#FFFFFF',
    actionBorder: '#E2E8F0',
  },
  {
    id: 'muted-violet',
    name: '方案八：淡紫资料感',
    shortName: '淡紫',
    source: '让“已关联资料”更像资料标签，而不是蓝色功能按钮。',
    note: '有一点资料库/知识库气质，和 AI 面板也有区分度，但不建议再叠加大面积紫色背景。',
    panelBg: '#FAF9FF',
    controlBg: '#FFFFFF',
    controlBorder: '#C8BFE7',
    tabActiveBg: '#F5F3FF',
    tabActiveText: '#5B4A91',
    tabMutedBg: '#FFFFFF',
    tabMutedText: '#6B647D',
    linkedPillBg: '#F5F3FF',
    linkedPillText: '#5B4A91',
    inputBg: '#FFFFFF',
    inputBorder: '#C8BFE7',
    inputFocus: '#927FD2',
    inputText: '#39324D',
    sendBg: '#6554A6',
    sendText: '#FFFFFF',
    stopText: '#D24D57',
    actionBg: '#FFFFFF',
    actionBorder: '#E5DFF7',
  },
];

function MiniActionButton({ label, danger = false }: { label: string; danger?: boolean }) {
  return (
    <button
      type="button"
      className={`h-8 rounded-lg px-3 text-xs font-black transition-colors ${
        danger ? 'text-[#D24D57] hover:bg-red-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      {label}
    </button>
  );
}

function AiInputPreview({ variant, dense = false }: { variant: AiInputBorderVariant; dense?: boolean }) {
  return (
    <div
      className={`flex min-h-0 flex-col rounded-2xl border p-4 ${dense ? 'gap-3' : 'gap-4'}`}
      style={{ backgroundColor: variant.panelBg, borderColor: variant.actionBorder }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 min-w-0 flex-1 overflow-hidden rounded-xl border p-0.5 shadow-sm"
          style={{ backgroundColor: variant.controlBg, borderColor: variant.controlBorder }}
        >
          {['关联', '本章', '已关联资料'].map((label, index) => {
            const active = index === 2;
            return (
              <button
                key={label}
                type="button"
                className="min-w-0 flex-1 rounded-[10px] px-2 text-xs font-black transition-colors"
                style={{
                  backgroundColor: active ? variant.tabActiveBg : index === 0 ? variant.tabMutedBg : 'transparent',
                  color: active ? variant.tabActiveText : variant.tabMutedText,
                }}
              >
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>
        <div
          className="hidden h-9 shrink-0 items-center rounded-xl border px-3 text-xs font-black sm:flex"
          style={{
            backgroundColor: variant.linkedPillBg,
            borderColor: variant.controlBorder,
            color: variant.linkedPillText,
          }}
        >
          已关联：1865 字
        </div>
      </div>

      <div
        className="flex min-h-[72px] items-center gap-3 rounded-2xl border px-4 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.06)]"
        style={{
          backgroundColor: variant.inputBg,
          borderColor: variant.inputBorder,
          boxShadow: `0 0 0 3px ${variant.inputFocus}16, 0 10px 28px rgba(15,23,42,0.06)`,
        }}
      >
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-black" style={{ color: variant.linkedPillText }}>请输入要求</div>
          <div className="mt-1 truncate text-sm font-bold" style={{ color: variant.inputText }}>
            请输入你的要求，例如：结合已关联资料润色这一段冲突。
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-xl"
            style={{ backgroundColor: variant.sendBg, color: variant.sendText }}
            aria-label="发送"
          >
            <Send className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-xl bg-white"
            style={{ color: variant.stopText, border: `1px solid ${variant.actionBorder}` }}
            aria-label="停止"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </button>
        </div>
      </div>

      {!dense && (
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex overflow-hidden rounded-xl border"
            style={{ backgroundColor: variant.actionBg, borderColor: variant.actionBorder }}
          >
            <MiniActionButton label="替换正文" />
            <MiniActionButton label="撤回替换" />
          </div>
          <div
            className="flex overflow-hidden rounded-xl border"
            style={{ backgroundColor: variant.actionBg, borderColor: variant.actionBorder }}
          >
            <MiniActionButton label="复制内容" />
            <MiniActionButton label="清空内容" danger />
          </div>
        </div>
      )}
    </div>
  );
}

function VariantCard({
  variant,
  index,
  selected,
  onSelect,
}: {
  variant: AiInputBorderVariant;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex h-full min-h-[216px] flex-col rounded-2xl border bg-white p-4 text-left transition-colors ${
        selected ? 'border-slate-900 shadow-sm' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-black text-slate-400">方案 {index + 1}</div>
          <div className="mt-1 truncate text-base font-black text-slate-950">{variant.shortName}</div>
        </div>
        <span
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full border"
          style={{
            backgroundColor: selected ? variant.tabActiveBg : '#FFFFFF',
            borderColor: selected ? variant.controlBorder : '#E2E8F0',
            color: selected ? variant.tabActiveText : 'transparent',
          }}
        >
          <Check className="h-4 w-4" />
        </span>
      </div>
      <AiInputPreview variant={variant} dense />
      <p className="mt-3 line-clamp-2 text-xs font-bold leading-5 text-slate-500">{variant.source}</p>
    </button>
  );
}

export function AiInputBorderOptionsTestPage() {
  const [activeVariantId, setActiveVariantId] = useState(aiInputBorderVariants[0].id);
  const activeVariant = useMemo(
    () => aiInputBorderVariants.find((variant) => variant.id === activeVariantId) ?? aiInputBorderVariants[0],
    [activeVariantId],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 p-6">
      <header className="mb-5 flex shrink-0 items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-black text-slate-400">
            <Sparkles className="h-4 w-4 text-slate-500" />
            AI 输入框边框与已关联资料背景测试
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-950">右侧 AI 输入区视觉方案</h1>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-slate-500">
            集中对比输入框边框线、聚焦光晕、已关联资料背景、已关联字数提示和发送/停止按钮，正式编辑器暂不改动。
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <button type="button" className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-500">
            <Copy className="h-4 w-4" />
          </button>
          <button type="button" className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-500">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button type="button" className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-[#D24D57]">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-black text-slate-400">{activeVariant.name}</div>
                <h2 className="mt-1 text-xl font-black text-slate-950">放大预览</h2>
              </div>
              <span
                className="shrink-0 rounded-full border px-3 py-1 text-xs font-black"
                style={{
                  backgroundColor: activeVariant.linkedPillBg,
                  borderColor: activeVariant.controlBorder,
                  color: activeVariant.linkedPillText,
                }}
              >
                已关联资料背景
              </span>
            </div>
            <AiInputPreview variant={activeVariant} />
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-black text-slate-400">设计判断</div>
            <h2 className="mt-1 text-lg font-black text-slate-950">{activeVariant.shortName}</h2>
            <p className="mt-3 text-sm font-bold leading-7 text-slate-600">{activeVariant.note}</p>
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-black text-slate-500">
              <div className="rounded-xl bg-slate-50 p-3">
                <div>边框线</div>
                <div className="mt-2 h-3 rounded-full" style={{ backgroundColor: activeVariant.inputBorder }} />
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div>资料背景</div>
                <div className="mt-2 h-3 rounded-full" style={{ backgroundColor: activeVariant.linkedPillBg }} />
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div>聚焦色</div>
                <div className="mt-2 h-3 rounded-full" style={{ backgroundColor: activeVariant.inputFocus }} />
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div>发送按钮</div>
                <div className="mt-2 h-3 rounded-full" style={{ backgroundColor: activeVariant.sendBg }} />
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {aiInputBorderVariants.map((variant, index) => (
            <VariantCard
              key={variant.id}
              variant={variant}
              index={index}
              selected={variant.id === activeVariantId}
              onSelect={() => setActiveVariantId(variant.id)}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

export default AiInputBorderOptionsTestPage;
