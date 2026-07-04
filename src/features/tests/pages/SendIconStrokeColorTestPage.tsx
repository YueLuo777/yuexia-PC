import { Send, Square } from 'lucide-react';
import type { ReactNode } from 'react';

const previewOptions = [
  {
    title: '浅青加强',
    strokeColor: '#9BEFFC',
    note: '比原来的 #E7F8FD 深一档，仍然很轻。',
  },
  {
    title: '标准推荐',
    strokeColor: '#62DFF2',
    note: '白底上更清楚，但还保留浅青的干净感。',
  },
  {
    title: '深青高对比',
    strokeColor: '#21B8DA',
    note: '对比最明显，适合正式按钮常态。',
  },
  {
    title: '蓝青稳重',
    strokeColor: '#009FC5',
    note: '颜色更沉，识别度高，视觉存在感也更强。',
  },
];

function SendArrow({ strokeColor }: { strokeColor: string }) {
  return (
    <Send
      className="h-6 w-6 stroke-[1.9]"
      stroke={strokeColor}
      style={{ color: strokeColor }}
    />
  );
}

function PreviewFrame({
  title,
  note,
  strokeColor,
  children,
  recommended = false,
}: {
  title: string;
  note: string;
  strokeColor: string;
  children: ReactNode;
  recommended?: boolean;
}) {
  return (
    <section className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${recommended ? 'border-[#9BEFFC]' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900">{title}</h2>
            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-xs font-black text-slate-500">{strokeColor}</span>
          </div>
          <p className="mt-1 text-xs font-bold text-slate-500">{note}</p>
        </div>
        {recommended && (
          <span className="rounded-full border border-[#9BEFFC] bg-white px-3 py-1 text-xs font-black text-[#08AACE]">推荐</span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function InlineInputPreview({
  option,
  recommended = false,
}: {
  option: (typeof previewOptions)[number];
  recommended?: boolean;
}) {
  return (
    <PreviewFrame
      title={option.title}
      note={option.note}
      strokeColor={option.strokeColor}
      recommended={recommended}
    >
      <div className="rounded-[22px] border border-slate-200 bg-white p-4">
        <div className="mx-auto flex h-14 max-w-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex min-w-0 flex-1 items-center border-r border-slate-200 bg-white px-4 text-sm font-bold text-slate-400">
            请输入要求
          </div>
          <button
            type="button"
            className="flex w-16 items-center justify-center border-r border-slate-200 bg-white transition-transform hover:scale-[1.02]"
            aria-label="发送"
          >
            <SendArrow strokeColor={option.strokeColor} />
          </button>
          <button
            type="button"
            className="flex w-14 items-center justify-center bg-white text-red-500"
            aria-label="停止"
          >
            <Square className="h-[18px] w-[18px] fill-current stroke-[1.9]" />
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {['默认', '悬停', '禁用'].map((state, index) => (
          <div key={state} className="rounded-xl border border-slate-100 bg-white p-3">
            <div className="mb-2 text-xs font-black text-slate-400">{state}</div>
            <button
              type="button"
              disabled={index === 2}
              className={`flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white ${index === 1 ? 'scale-[1.02] shadow-sm' : ''} ${index === 2 ? 'opacity-50' : ''}`}
              aria-label={`${option.title}${state}发送`}
            >
              <SendArrow strokeColor={option.strokeColor} />
            </button>
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}

export function SendIconStrokeColorTestPage() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
        <div>
          <h1 className="text-lg font-black text-slate-900">发送箭头线条颜色测试</h1>
          <p className="mt-0.5 text-xs font-bold text-slate-400">
            全部统一白底，只比较纸飞机箭头线条颜色深浅，不改正式页面。
          </p>
        </div>
        <span className="rounded-full border border-[#9BEFFC] bg-white px-3 py-1 text-xs font-black text-[#08AACE]">测试页</span>
      </header>

      <main className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid min-w-[980px] gap-5">
          {previewOptions.map((option, index) => (
            <InlineInputPreview key={option.title} option={option} recommended={index === 2} />
          ))}
        </div>
      </main>
    </div>
  );
}
