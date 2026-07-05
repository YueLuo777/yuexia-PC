import { FileText, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';

type PreviewMode = 'audit' | 'polish';
type WidthMode = 'locked' | 'free';

const outlineText = [
  '第1章章纲：',
  '1. 主角夜巡废弃药园，发现灵泉复苏。',
  '2. 主角用祖传玉牌试探灵泉，确认玉牌能吸收泉气。',
  '3. 宗门执事突然出现，主角隐藏玉牌，只承认发现水脉。',
  '4. 本章目标：获得秘密资源，但不能暴露底牌。',
].join('\n');

const originalParagraphs = [
  '夜色压在废弃药园上，沈青沿着塌了一半的石阶往下走，听见枯井里传出细微的水声。',
  '他取出祖传玉牌贴近井口，玉牌边缘浮出一线微光，井底的灵泉也随之翻起淡淡雾气。',
  '沈青刚要继续试探，外院执事的脚步声已经逼近。他立刻收起玉牌，只说自己发现了地下水脉。',
  '执事半信半疑地记下位置，转身去叫人。沈青低头看着掌心余温，知道自己终于有了不能让旁人知道的底牌。',
];

const auditParagraphs = [
  { text: originalParagraphs[0], note: '' },
  { text: originalParagraphs[1], note: '' },
  { text: originalParagraphs[2], note: '审核通过：主角隐藏玉牌，符合章纲目标。' },
  { text: originalParagraphs[3], note: '审核通过：本章结果明确，秘密资源保留到后续剧情。' },
];

const polishParagraphs = [
  '夜色沉沉地压在废弃药园上，沈青沿着坍塌的石阶往下走，枯井深处传来细而冷的水声。',
  '他将祖传玉牌贴近井口，玉牌边缘浮起一线微光，井底灵泉随之翻涌出淡淡雾气。',
  '脚步声忽然逼近，沈青立刻收起玉牌，只低声说自己发现了地下水脉。',
  '执事半信半疑地记下位置，转身去叫人。沈青垂眼看着掌心余温，知道自己终于握住了一张不能示人的底牌。',
];

const textColumnMinWidth = 'calc((100% - 7px) / 3)';
const separatorWidth = 7;

export function ReviewPreviewWidthModeTestPage() {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('audit');
  const [widthMode, setWidthMode] = useState<WidthMode>('locked');
  const [showOutline, setShowOutline] = useState(true);
  const [freeTextWidth, setFreeTextWidth] = useState(320);
  const [usesCustomTextWidth, setUsesCustomTextWidth] = useState(false);
  const outlineWidth = 260;
  const freeTextColumnMinWidth = showOutline
    ? `calc((100% - ${outlineWidth}px - ${separatorWidth * 2}px) / 3)`
    : textColumnMinWidth;
  const useFreeCustomWidth = widthMode === 'free' && usesCustomTextWidth;
  const gridTemplateColumns = useMemo(() => {
    if (!useFreeCustomWidth) {
      return showOutline
        ? `${outlineWidth}px ${separatorWidth}px minmax(0, 1fr) ${separatorWidth}px minmax(0, 1fr)`
        : `minmax(${textColumnMinWidth}, 1fr) ${separatorWidth}px minmax(${textColumnMinWidth}, 1fr)`;
    }
    return showOutline
      ? `${outlineWidth}px ${separatorWidth}px minmax(${freeTextColumnMinWidth}, ${freeTextWidth}px) ${separatorWidth}px minmax(${freeTextColumnMinWidth}, 1fr)`
      : `minmax(${textColumnMinWidth}, ${freeTextWidth}px) ${separatorWidth}px minmax(${textColumnMinWidth}, 1fr)`;
  }, [freeTextColumnMinWidth, freeTextWidth, showOutline, useFreeCustomWidth]);
  const resultTitle = previewMode === 'audit' ? '第1章 审核后' : '第1章 润色后';

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-5">
        <div className="min-w-0">
          <h1 className="truncate text-base font-black text-slate-900">审核润色预览宽度模式测试</h1>
          <p className="mt-0.5 text-xs font-bold text-slate-400">检查等宽锁定、自由调节、显示章纲和隐藏章纲时的原文/结果列宽。</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 overflow-hidden rounded-lg border border-slate-200 bg-white text-xs font-black">
            {([
              ['audit', '剧情审核'] as const,
              ['polish', '文笔润色'] as const,
            ]).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPreviewMode(mode)}
                className={`px-3 transition-colors ${previewMode === mode ? 'bg-[#EAF9FD] text-[#078fb0]' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setShowOutline((value) => !value);
              setUsesCustomTextWidth(false);
            }}
            className={`h-8 rounded-lg border px-3 text-xs font-black transition-colors ${
              showOutline ? 'border-[#9BEFFC] bg-[#EAF9FD] text-[#078fb0]' : 'border-slate-200 bg-white text-slate-500 hover:border-[#9BEFFC] hover:text-[#078fb0]'
            }`}
          >
            {showOutline ? '隐藏章纲' : '显示章纲'}
          </button>
          <div className="flex h-8 overflow-hidden rounded-lg border border-[#9BEFFC] bg-white text-xs font-black">
            {([
              ['locked', '等宽锁定'] as const,
              ['free', '自由调节'] as const,
            ]).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setWidthMode(mode);
                  if (mode === 'free') setUsesCustomTextWidth(false);
                }}
                className={`px-3 transition-colors ${widthMode === mode ? 'bg-[#EAF9FD] text-[#078fb0]' : 'text-slate-500 hover:bg-[#F5FCFE] hover:text-[#078fb0]'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 px-5">
        <div className="flex items-center gap-2 text-xs font-black text-slate-500">
          <SlidersHorizontal className="h-4 w-4 text-[#08AACE]" />
          <span>{widthMode === 'locked' ? '当前：原文和结果列锁定等宽' : `当前：原文列 ${freeTextWidth}px，结果列吃剩余空间`}</span>
        </div>
        <label className={`flex items-center gap-3 text-xs font-black ${widthMode === 'free' ? 'text-slate-600' : 'text-slate-300'}`}>
          原文宽度
          <input
            type="range"
            min={240}
            max={520}
            step={20}
            value={freeTextWidth}
            disabled={widthMode === 'locked'}
            onChange={(event) => {
              setUsesCustomTextWidth(true);
              setFreeTextWidth(Number(event.target.value));
            }}
            className="w-44 accent-[#08AACE] disabled:opacity-40"
          />
        </label>
      </div>

      <main
        className="grid min-h-0 flex-1"
        style={{ gridTemplateColumns }}
        data-width-mode={widthMode}
        data-outline-visible={showOutline}
      >
        {showOutline ? (
          <>
            <section className="flex min-h-0 flex-col bg-white">
              <div className="flex h-[33px] shrink-0 items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 text-xs font-black text-slate-500">
                <FileText className="h-4 w-4 text-[#08AACE]" />
                第1章 章纲
              </div>
              <pre className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap break-words p-5 font-sans text-sm leading-7 text-slate-700">
                {outlineText}
              </pre>
            </section>
            <div className="group flex h-full cursor-ew-resize items-stretch justify-center bg-white" title="章纲宽度可调">
              <div className="h-full w-px bg-slate-300 transition-colors group-hover:bg-[#08AACE]" />
            </div>
          </>
        ) : null}

        <section className="flex min-h-0 flex-col bg-white">
          <div className="flex h-[33px] shrink-0 items-center border-b border-slate-100 bg-slate-50 px-4 text-xs font-black text-slate-500">第1章 原文</div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5 text-sm leading-7 text-slate-700">
            {originalParagraphs.map((paragraph, index) => (
              <p key={index} className="border-l-2 border-transparent px-3 py-1.5">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <div
          className={`group flex h-full w-full items-stretch justify-center bg-white ${widthMode === 'free' ? 'cursor-ew-resize' : 'cursor-default'}`}
          title={widthMode === 'free' ? '自由调节原文宽度' : undefined}
        >
          <div className={`h-full w-px bg-slate-300 ${widthMode === 'free' ? 'transition-colors group-hover:bg-[#08AACE]' : ''}`} />
        </div>

        <section className="flex min-h-0 flex-col bg-white">
          <div className="flex h-[33px] shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-[#EAF9FD] px-4">
            <span className="text-xs font-black text-[#078fb0]">{resultTitle}</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-slate-400">
              {previewMode === 'audit' ? '2 条' : '润色版'}
            </span>
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5 text-sm leading-7 text-slate-700">
            {previewMode === 'audit'
              ? auditParagraphs.map((paragraph, index) => (
                <div key={index} className={`border-l-2 px-3 py-1.5 ${paragraph.note ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-transparent'}`}>
                  <p>{paragraph.text}</p>
                  {paragraph.note ? <p className="mt-2 text-xs font-bold text-[#078fb0]">{paragraph.note}</p> : null}
                </div>
              ))
              : polishParagraphs.map((paragraph, index) => (
                <p key={index} className="border-l-2 border-emerald-300 bg-emerald-50/35 px-3 py-1.5">
                  {paragraph}
                </p>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ReviewPreviewWidthModeTestPage;
