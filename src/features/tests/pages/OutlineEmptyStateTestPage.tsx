import { ArrowLeft, CheckCircle2, Circle, MousePointer2, Palette } from 'lucide-react';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';

type ChapterState = 'filled' | 'empty' | 'selectedFilled' | 'selectedEmpty';

interface DemoChapter {
  serial: number;
  state: ChapterState;
}

interface Variant {
  title: string;
  description: string;
  render: (chapter: DemoChapter) => ReactElement;
}

const chapters: DemoChapter[] = [
  { serial: 1, state: 'filled' },
  { serial: 2, state: 'empty' },
  { serial: 3, state: 'filled' },
  { serial: 4, state: 'selectedEmpty' },
  { serial: 5, state: 'empty' },
  { serial: 6, state: 'filled' },
  { serial: 7, state: 'empty' },
  { serial: 8, state: 'selectedFilled' },
  { serial: 9, state: 'empty' },
  { serial: 10, state: 'filled' },
  { serial: 11, state: 'empty' },
  { serial: 12, state: 'filled' },
];

function hasSummary(state: ChapterState) {
  return state === 'filled' || state === 'selectedFilled';
}

function isSelected(state: ChapterState) {
  return state === 'selectedFilled' || state === 'selectedEmpty';
}

function baseTile(chapter: DemoChapter, className: string, children?: ReactElement) {
  return (
    <span className={`relative flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold ${className}`}>
      {chapter.serial}
      {children}
    </span>
  );
}

const variants: Variant[] = [
  {
    title: '方案一：选中用外圈强调',
    description: '有无概要保持原本颜色，选中态只加外圈，不遮盖空状态。',
    render: (chapter) => {
      const filled = hasSummary(chapter.state);
      const selected = isSelected(chapter.state);
      return baseTile(
        chapter,
        `${filled ? 'border-[#08B3D9] bg-[#08B3D9] text-white' : 'border-slate-300 bg-white text-slate-400'} ${
          selected ? 'ring-2 ring-[#08B3D9] ring-offset-2' : ''
        }`,
      );
    },
  },
  {
    title: '方案二：选中整块变深，角标保留',
    description: '选中态最明显，右上角状态点继续表示有没有概要。',
    render: (chapter) => {
      const filled = hasSummary(chapter.state);
      const selected = isSelected(chapter.state);
      return baseTile(
        chapter,
        selected
          ? 'border-[#036C83] bg-[#036C83] text-white shadow-sm'
          : filled
            ? 'border-[#08B3D9]/40 bg-[#08B3D9]/10 text-[#067B96]'
            : 'border-slate-200 bg-slate-50 text-slate-500',
        <span
          className={`absolute right-1 top-1 h-2.5 w-2.5 rounded-full border ${
            filled
              ? selected ? 'border-white bg-white' : 'border-[#08B3D9] bg-[#08B3D9]'
              : selected ? 'border-white bg-transparent' : 'border-slate-300 bg-white'
          }`}
        />,
      );
    },
  },
  {
    title: '方案三：选中用左侧竖条',
    description: '选中态像列表焦点，数字本身仍可表达有概要或无概要。',
    render: (chapter) => {
      const filled = hasSummary(chapter.state);
      const selected = isSelected(chapter.state);
      return baseTile(
        chapter,
        `${filled ? 'border-[#08B3D9]/40 bg-white text-[#067B96]' : 'border-slate-200 bg-white text-slate-400'} ${
          selected ? 'pl-1 ring-1 ring-[#08B3D9]/50' : ''
        }`,
        selected ? <span className="absolute bottom-1 left-1 top-1 w-1 rounded-full bg-[#08B3D9]" /> : undefined,
      );
    },
  },
  {
    title: '方案四：无概要用斜纹，选中用蓝框',
    description: '空状态最强，适合章节很多但未生成概要较多的情况。',
    render: (chapter) => {
      const filled = hasSummary(chapter.state);
      const selected = isSelected(chapter.state);
      return (
        <span
          className={`relative flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold ${
            filled ? 'border-[#08B3D9] bg-[#08B3D9] text-white' : 'border-slate-200 text-slate-500'
          } ${selected ? 'ring-2 ring-[#08B3D9] ring-offset-2' : ''}`}
          style={filled ? undefined : {
            backgroundImage: 'repeating-linear-gradient(135deg, #f8fafc 0, #f8fafc 5px, #e2e8f0 5px, #e2e8f0 6px)',
          }}
        >
          {chapter.serial}
        </span>
      );
    },
  },
  {
    title: '方案五：选中用底色，概要用底线',
    description: '底线负责概要状态，选中负责背景状态，两者职责分离。',
    render: (chapter) => {
      const filled = hasSummary(chapter.state);
      const selected = isSelected(chapter.state);
      return baseTile(
        chapter,
        selected
          ? 'border-[#08B3D9] bg-[#E6F8FC] text-[#036C83]'
          : filled
            ? 'border-[#08B3D9]/40 bg-white text-[#067B96]'
            : 'border-slate-200 bg-white text-slate-400',
        <span className={`absolute bottom-1 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full ${filled ? 'bg-[#08B3D9]' : 'bg-slate-200'}`} />,
      );
    },
  },
  {
    title: '推荐方案：选中外圈 + 状态点',
    description: '三种状态区分最稳定：数字颜色看概要，外圈看选中，状态点做二次确认。',
    render: (chapter) => {
      const filled = hasSummary(chapter.state);
      const selected = isSelected(chapter.state);
      return baseTile(
        chapter,
        `${filled ? 'border-[#08B3D9] bg-[#08B3D9] text-white' : 'border-slate-300 bg-white text-slate-400'} ${
          selected ? 'ring-2 ring-[#08B3D9] ring-offset-2' : ''
        }`,
        <span
          className={`absolute right-1 top-1 h-2.5 w-2.5 rounded-full border ${
            filled ? 'border-white bg-white' : 'border-slate-300 bg-white'
          }`}
        />,
      );
    },
  },
];

export function OutlineEmptyStateTestPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
        <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900">章节概要状态样式</h1>
            <p className="mt-0.5 text-xs text-slate-400">同时比较有概要、无概要和选中状态</p>
        </div>
        <button
          onClick={() => navigate('/test-collection')}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-brand"
          title="返回测试合集"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-7">
        <div className="mb-5 grid grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-[#08B3D9]" />
              有概要
            </div>
            <p className="mt-1 text-xs text-slate-400">已经填写或生成概要</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Circle className="h-4 w-4 text-slate-400" />
              无概要
            </div>
            <p className="mt-1 text-xs text-slate-400">需要快速识别的空状态</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <MousePointer2 className="h-4 w-4 text-[#08B3D9]" />
              选中
            </div>
            <p className="mt-1 text-xs text-slate-400">鼠标点击后的当前章节</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <MousePointer2 className="h-4 w-4 text-[#036C83]" />
              两种选中
            </div>
            <p className="mt-1 text-xs text-slate-400">第4章无概要选中，第8章有概要选中</p>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(360px,1fr))] gap-5">
          {variants.map((variant) => (
            <section key={variant.title} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900">{variant.title}</h2>
                <p className="mt-1 text-sm leading-5 text-slate-400">{variant.description}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-3 rounded-lg px-3 py-2 text-sm font-bold text-white" style={{ backgroundColor: '#08B3D9' }}>
                  第一卷
                </div>
                <div className="grid grid-cols-10 gap-2">
                  {chapters.map((chapter) => (
                    <div key={chapter.serial} className="flex justify-center">
                      {variant.render(chapter)}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
