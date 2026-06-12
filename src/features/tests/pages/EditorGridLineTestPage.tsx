import { Minus, Rows3, Type } from 'lucide-react';
import { useMemo, useState } from 'react';

type GridLineMode = 'none' | 'solid' | 'dashed';

const modeItems: Array<{ id: GridLineMode; label: string; icon: typeof Minus }> = [
  { id: 'none', label: '无', icon: Minus },
  { id: 'solid', label: '实线', icon: Rows3 },
  { id: 'dashed', label: '虚线', icon: Rows3 },
];

const sampleText = [
  '【首尾呼应】',
  '前面禁止，后面再禁止一次。',
  '或者后面进行自检，如果不符合就打回继续，直到符合。',
  '【示例】',
  '给出一个模板，让Ai去抄，',
].join('\n');

function buildGridBackground(mode: GridLineMode, lineHeightPx: number, lineOffsetPx: number) {
  if (mode === 'none') return 'none';
  const stroke = encodeURIComponent('#aab4c0');
  const dash = mode === 'dashed' ? " stroke-dasharray='7 7'" : '';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='${lineHeightPx}' viewBox='0 0 1200 ${lineHeightPx}'><line x1='0' y1='${lineOffsetPx}.5' x2='1200' y2='${lineOffsetPx}.5' stroke='${stroke}' stroke-width='1'${dash}/></svg>`;
  return `url("data:image/svg+xml,${svg}")`;
}

export function EditorGridLineTestPage() {
  const [fontSize, setFontSize] = useState(28);
  const [mode, setMode] = useState<GridLineMode>('dashed');
  const lineHeightPx = Math.round(fontSize * 1.72);
  const lineOffsetPx = Math.min(lineHeightPx - 2, Math.round((lineHeightPx + fontSize) / 2 + 3));
  const gridBackground = useMemo(() => buildGridBackground(mode, lineHeightPx, lineOffsetPx), [lineHeightPx, lineOffsetPx, mode]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f5f5f7]">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="min-w-0">
          <h1 className="text-lg font-black text-slate-900">编辑器网格虚线测试</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">测试正文背景网格线随字号同步变化，先只在测试集合预览。</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
            <Type className="h-4 w-4 text-slate-400" />
            <span>{fontSize}px</span>
            <input
              aria-label="字号"
              type="range"
              min={18}
              max={40}
              step={1}
              value={fontSize}
              onChange={(event) => setFontSize(Number(event.target.value))}
              className="w-32 accent-[#1e71ef]"
            />
          </label>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)] overflow-hidden">
        <aside className="border-r border-slate-200 bg-white p-5">
          <div>
            <h2 className="text-sm font-black text-slate-900">网格线</h2>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {modeItems.map((item) => {
                const Icon = item.icon;
                const active = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={`rounded-lg border px-2 py-2 text-center transition-colors ${
                      active
                        ? 'border-[#1e71ef] bg-[#eef5ff] text-[#155ed1]'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-[#9ec1ff]'
                    }`}
                  >
                    <span className="mx-auto flex h-9 items-center justify-center rounded-md bg-white">
                      <Icon className={`h-7 w-7 ${item.id === 'none' ? 'rotate-[-32deg]' : ''}`} />
                    </span>
                    <span className="mt-1 block text-sm font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-black text-slate-800">当前参数</h3>
            <div className="mt-3 space-y-2 text-sm font-medium text-slate-500">
              <div className="flex justify-between">
                <span>字号</span>
                <strong className="text-slate-900">{fontSize}px</strong>
              </div>
              <div className="flex justify-between">
                <span>行距</span>
                <strong className="text-slate-900">{lineHeightPx}px</strong>
              </div>
              <div className="flex justify-between">
                <span>线型</span>
                <strong className="text-slate-900">{mode === 'dashed' ? '虚线' : mode === 'solid' ? '实线' : '无'}</strong>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-h-0 overflow-auto bg-[#f5f5f7] px-12 py-10">
          <div className="mx-auto min-h-[720px] max-w-[1200px]">
            <h2 className="text-[44px] font-normal leading-none text-[#25303b]">第1章</h2>
            <div
              className="mt-16 min-h-[620px] whitespace-pre-wrap px-16 py-0 text-[#162232]"
              style={{
                backgroundImage: gridBackground,
                backgroundPosition: '0 0',
                backgroundRepeat: mode === 'none' ? 'no-repeat' : 'repeat-y',
                backgroundSize: `100% ${lineHeightPx}px`,
                fontSize,
                lineHeight: `${lineHeightPx}px`,
              }}
            >
              {sampleText}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default EditorGridLineTestPage;
