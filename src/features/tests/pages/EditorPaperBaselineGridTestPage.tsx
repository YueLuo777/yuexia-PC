import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';

const sampleText = [
  '　　烈日如炎，灼热的阳光从天空上倾洒下来，令得整片大地都是处于一片蒸腾之中，杨柳微垂，收敛着枝叶，恹恹不振。',
  '　　在那一片投射着被柳树枝叶切割而开的明亮光斑的空地中，数百道身影静静盘坐，这是一群略显青涩的少年少女。',
  '　　而此时，他们都是面目认真的微闭着双目，鼻息间的呼吸，呈现一种极有节奏之感。微风悄然吹拂而来，衣衫飘动，倒是略显壮观。',
  '　　在这数百道身影前方，有着一座石台，石台上，同样是有着一道身影安静的盘坐，双手在身前相合，十指交叉，双目紧闭。',
].join('\n');

const PAPER_TOP_PADDING_PX = 24;
const PAPER_HORIZONTAL_PADDING_PX = 80;
const DEFAULT_FOOT_GAP_PX = 1;
const DEFAULT_ROW_EXTRA_PX = 20;

type PaperBaselineMetrics = {
  rowHeightPx: number;
  baselineLineOffsetPx: number;
  footGapPx: number;
  rowExtraPx: number;
};

type BaselinePreset = {
  id: string;
  label: string;
  description: string;
  footGapPx: number;
  rowExtraPx: number;
};

const baselinePresets: BaselinePreset[] = [
  {
    id: 'current',
    label: '当前偏吊',
    description: '保留截图里的 36px 方向，用来对照问题。',
    footGapPx: 8,
    rowExtraPx: 20,
  },
  {
    id: 'low-line',
    label: '贴脚低线',
    description: '虚线贴近字脚，文字更像站在线上。',
    footGapPx: 1,
    rowExtraPx: 20,
  },
  {
    id: 'reference',
    label: '图2方向',
    description: '低线位加稍紧行距，减少上下漂浮感。',
    footGapPx: 1,
    rowExtraPx: 18,
  },
  {
    id: 'compact',
    label: '紧凑图2',
    description: '更紧一点，适合想减少行间空旷的效果。',
    footGapPx: 0,
    rowExtraPx: 16,
  },
];

export function getPaperBaselineMetrics(
  fontSizePx: number,
  footGapPx = DEFAULT_FOOT_GAP_PX,
  rowExtraPx = DEFAULT_ROW_EXTRA_PX,
): PaperBaselineMetrics {
  const rowHeightPx = Math.max(fontSizePx + rowExtraPx, Math.round(fontSizePx * 1.75));
  const baselineLineOffsetPx = rowHeightPx - footGapPx;
  return { rowHeightPx, baselineLineOffsetPx, footGapPx, rowExtraPx };
}

function buildPaperLineBackground(rowHeightPx: number, baselineLineOffsetPx: number) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='${rowHeightPx}' viewBox='0 0 1600 ${rowHeightPx}'><line x1='0' y1='${baselineLineOffsetPx}.5' x2='1600' y2='${baselineLineOffsetPx}.5' stroke='%23AFC0D3' stroke-width='1.4' stroke-dasharray='8 8'/></svg>`;
  return `url("data:image/svg+xml,${svg}")`;
}

function getPaperStyle(fontSizePx: number, metrics: PaperBaselineMetrics): CSSProperties {
  return {
    backgroundImage: buildPaperLineBackground(metrics.rowHeightPx, metrics.baselineLineOffsetPx),
    backgroundPosition: `0 ${PAPER_TOP_PADDING_PX}px`,
    backgroundRepeat: 'repeat-y',
    backgroundSize: `100% ${metrics.rowHeightPx}px`,
    fontSize: `${fontSizePx}px`,
    lineHeight: `${metrics.rowHeightPx}px`,
    fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
    paddingTop: PAPER_TOP_PADDING_PX,
    paddingBottom: PAPER_TOP_PADDING_PX,
    paddingLeft: PAPER_HORIZONTAL_PADDING_PX,
    paddingRight: PAPER_HORIZONTAL_PADDING_PX,
  };
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <div className="text-xs font-black text-slate-400">{label}</div>
      <div className="mt-1 font-mono text-lg font-black text-slate-900">{value}</div>
    </div>
  );
}

function SizeButton({ value, active, onClick }: { value: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'h-9 rounded-lg border px-4 text-sm font-black transition-colors',
        active
          ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078fb0]'
          : 'border-slate-200 bg-white text-slate-600 hover:border-[#9BEFFC] hover:text-[#078fb0]',
      ].join(' ')}
    >
      {value}px
    </button>
  );
}

function PresetPreview({
  fontSizePx,
  preset,
  selected,
  onSelect,
}: {
  fontSizePx: number;
  preset: BaselinePreset;
  selected: boolean;
  onSelect: () => void;
}) {
  const metrics = getPaperBaselineMetrics(fontSizePx, preset.footGapPx, preset.rowExtraPx);
  const paperStyle = getPaperStyle(fontSizePx, metrics);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'min-h-[238px] rounded-xl border bg-white text-left shadow-sm transition-colors',
        selected ? 'border-[#08AACE] ring-2 ring-[#C9F3FA]' : 'border-slate-200 hover:border-[#9BEFFC]',
      ].join(' ')}
    >
      <div className="flex h-11 items-center justify-between border-b border-slate-100 px-4">
        <div className="text-sm font-black text-slate-900">{preset.label}</div>
        <div className="font-mono text-xs font-black text-slate-400">
          {fontSizePx}px / {metrics.rowHeightPx}px / {metrics.baselineLineOffsetPx}px
        </div>
      </div>
      <div
        className="h-[132px] overflow-hidden whitespace-pre-wrap bg-white text-slate-900"
        style={{
          ...paperStyle,
          paddingLeft: 28,
          paddingRight: 28,
          paddingTop: 18,
          paddingBottom: 18,
          backgroundPosition: '0 18px',
        }}
      >
        {sampleText}
      </div>
      <div className="border-t border-slate-100 px-4 py-3 text-xs font-bold leading-5 text-slate-500">
        {preset.description}
      </div>
    </button>
  );
}

export function EditorPaperBaselineGridTestPage() {
  const [fontSizePx, setFontSizePx] = useState(22);
  const [selectedPresetId, setSelectedPresetId] = useState('low-line');
  const [manualFootGapPx, setManualFootGapPx] = useState(DEFAULT_FOOT_GAP_PX);
  const [manualRowExtraPx, setManualRowExtraPx] = useState(DEFAULT_ROW_EXTRA_PX);
  const selectedPreset = baselinePresets.find((preset) => preset.id === selectedPresetId) ?? baselinePresets[1];
  const selectedPresetLabel = selectedPresetId === 'manual' ? '手动微调' : selectedPreset.label;
  const metrics = getPaperBaselineMetrics(fontSizePx, manualFootGapPx, manualRowExtraPx);
  const paperStyle = useMemo<CSSProperties>(() => getPaperStyle(fontSizePx, metrics), [fontSizePx, metrics]);

  function applyPreset(preset: BaselinePreset) {
    setSelectedPresetId(preset.id);
    setManualFootGapPx(preset.footGapPx);
    setManualRowExtraPx(preset.rowExtraPx);
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F8FAFC]">
      <header className="shrink-0 border-b border-slate-100 bg-white px-7 py-5">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <h1 className="text-xl font-black text-slate-950">正文稿纸线基准对齐测试</h1>
            <p className="mt-1 text-sm font-bold leading-6 text-slate-500">
              重点看文字是不是站在虚线上方；如果改字号，行高和虚线位置会一起重算。
            </p>
          </div>
          <div className="rounded-lg border border-[#BDEEF7] bg-[#EAF9FD] px-3 py-2 text-sm font-black text-[#078fb0]">
            当前：{selectedPresetLabel}
          </div>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)] gap-5 overflow-hidden p-6">
        <aside className="editor-scrollbar min-h-0 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-black text-slate-900">字号与线位</h2>
          <p className="mt-1 text-sm font-bold leading-6 text-slate-400">
            截图里的 36px 线位偏靠上，所以这里默认改成更靠下的贴脚低线。
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <SizeButton value={18} active={fontSizePx === 18} onClick={() => setFontSizePx(18)} />
            <SizeButton value={22} active={fontSizePx === 22} onClick={() => setFontSizePx(22)} />
            <SizeButton value={24} active={fontSizePx === 24} onClick={() => setFontSizePx(24)} />
          </div>

          <label className="mt-6 block text-xs font-black text-slate-400">自定义字号：{fontSizePx}px</label>
          <input
            type="range"
            min={16}
            max={30}
            value={fontSizePx}
            onChange={(event) => setFontSizePx(Number(event.target.value))}
            className="mt-2 w-full"
          />

          <div className="mt-6 grid gap-3">
            <MetricPill label="当前字号" value={`${fontSizePx}px`} />
            <MetricPill label="两条虚线间距" value={`${metrics.rowHeightPx}px`} />
            <MetricPill label="虚线所在位置" value={`+ ${metrics.baselineLineOffsetPx}px`} />
            <MetricPill label="线距本行底部" value={`${metrics.footGapPx}px`} />
          </div>

          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-500">
            方案公式：行高 = max(字号 + 行距补偿, 字号 * 1.75)，虚线位置 = 行高 - 线距底部。
          </div>

          <div className="mt-6">
            <label className="block text-xs font-black text-slate-400">线距本行底部：{manualFootGapPx}px</label>
            <input
              type="range"
              min={0}
              max={10}
              value={manualFootGapPx}
              onChange={(event) => {
                setSelectedPresetId('manual');
                setManualFootGapPx(Number(event.target.value));
              }}
              className="mt-2 w-full"
            />
          </div>

          <div className="mt-5">
            <label className="block text-xs font-black text-slate-400">行距补偿：{manualRowExtraPx}px</label>
            <input
              type="range"
              min={14}
              max={24}
              value={manualRowExtraPx}
              onChange={(event) => {
                setSelectedPresetId('manual');
                setManualRowExtraPx(Number(event.target.value));
              }}
              className="mt-2 w-full"
            />
          </div>
        </aside>

        <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-5 overflow-hidden">
          <div className="grid grid-cols-4 gap-3">
            {baselinePresets.map((preset) => (
              <PresetPreview
                key = { preset.id }
                fontSizePx={fontSizePx}
                preset={preset}
                selected={selectedPreset.id === preset.id}
                onSelect={() => applyPreset(preset)}
              />
            ))}
          </div>

          <section className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex h-11 items-center justify-between border-b border-slate-100 px-5">
              <div className="text-sm font-black text-slate-800">稿纸线大预览</div>
              <div className="font-mono text-xs font-black text-slate-400">
                {fontSizePx}px / {metrics.rowHeightPx}px / {metrics.baselineLineOffsetPx}px
              </div>
            </div>
            <textarea
              readOnly
              value={sampleText}
              className="editor-scrollbar h-full min-h-0 w-full resize-none border-0 bg-white text-slate-900 outline-none"
              style={paperStyle}
            />
          </section>
        </section>
      </main>
    </div>
  );
}

export default EditorPaperBaselineGridTestPage;
