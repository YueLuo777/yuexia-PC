import { Folder, Plus } from 'lucide-react';

const options = [
  {
    id: 'soft-blue',
    name: '浅蓝底',
    desc: '接近当前选中蓝，分组更容易扫到。',
    shell: 'border-[#d9e7ff] bg-[#f3f7ff]',
    row: 'border-[#c7dcff] bg-[#eaf2ff] text-[#1f2933]',
    icon: 'text-[#1e71ef]',
    count: 'bg-white/70 text-[#6f7e90]',
  },
  {
    id: 'quiet-slate',
    name: '灰蓝底',
    desc: '低干扰，适合长时间写作。',
    shell: 'border-[#dfe5ec] bg-[#f7f9fb]',
    row: 'border-[#d7dde6] bg-[#eef3f8] text-[#223041]',
    icon: 'text-[#66788f]',
    count: 'bg-white/75 text-[#738194]',
  },
  {
    id: 'cyan-left',
    name: '青色左线',
    desc: '只强调层级，不大面积上色。',
    shell: 'border-[#d8eef4] bg-[#f7fbfc]',
    row: 'border-[#bdeaf3] bg-white text-[#1f2933]',
    icon: 'text-[#08AACE]',
    count: 'bg-[#e8f8fb] text-[#18869d]',
    accent: 'bg-[#08AACE]',
  },
  {
    id: 'ink-band',
    name: '深色标题',
    desc: '识别最强，适合分卷很多时使用。',
    shell: 'border-[#d6dce5] bg-[#f7f8fa]',
    row: 'border-[#243244] bg-[#2f3c4f] text-white',
    icon: 'text-white',
    count: 'bg-white/12 text-white/80',
  },
  {
    id: 'green-paper',
    name: '绿色资料感',
    desc: '偏资料库气质，和正文蓝色选中区分开。',
    shell: 'border-[#dcebe4] bg-[#f7fbf8]',
    row: 'border-[#cbe7d7] bg-[#edf8f1] text-[#20352b]',
    icon: 'text-[#2a9b61]',
    count: 'bg-white/70 text-[#5f7f6d]',
  },
  {
    id: 'warm-outline',
    name: '暖色细边',
    desc: '温和但有分隔感，避免全页面偏蓝。',
    shell: 'border-[#eadfce] bg-[#fbf8f2]',
    row: 'border-[#ead7b9] bg-[#fff8ec] text-[#2f2a22]',
    icon: 'text-[#b7791f]',
    count: 'bg-white/75 text-[#8b7657]',
  },
];

function PreviewSidebar({ option }: { option: typeof options[number] }) {
  return (
    <div className={`w-[292px] rounded-lg border ${option.shell} p-2`}>
      <div className="mb-2 flex h-10 items-center justify-between border-b border-black/5 px-2">
        <span className="text-sm font-bold text-slate-800">未发布</span>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-400">2</span>
      </div>

      <div className={`relative flex h-9 items-center gap-2 rounded-md border px-1 text-[14px] font-medium shadow-sm ${option.row}`}>
        {option.accent ? <span className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full ${option.accent}`} /> : null}
        <Folder className={`h-[17px] w-[17px] shrink-0 ${option.icon}`} />
        <span className="min-w-0 flex-1 truncate leading-none">第一卷</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${option.count}`}>2章</span>
        <button className={`grid h-7 w-7 place-items-center rounded-md ${option.count}`} title="新增章节">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-1 space-y-0.5">
        <div className="flex h-10 items-center gap-2 rounded-md border-l-[3px] border-transparent px-[26px] text-sm font-medium text-slate-700">
          <span className="min-w-0 flex-1 truncate">第1章</span>
          <span className="text-xs text-slate-400">0</span>
        </div>
        <div className="flex h-10 items-center gap-2 rounded-md border-l-[3px] border-[#1e71ef] bg-[#d4e2f9] px-[26px] text-sm font-medium text-[#1f2933]">
          <span className="min-w-0 flex-1 truncate">第2章</span>
          <span className="text-xs text-slate-500">0</span>
        </div>
      </div>
    </div>
  );
}

export function ChapterGroupColorOptionsTestPage() {
  return (
    <div className="h-full overflow-y-auto bg-[#f5f5f7] p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5">
          <h1 className="text-xl font-black text-slate-900">章节分组配色方案</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">用于对比作品编辑器左侧“第一卷”这类分组行的背景、边线和图标颜色。</p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {options.map((option, index) => (
            <section key={option.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-900">{index + 1}. {option.name}</h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">{option.desc}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500">{option.id}</span>
              </div>
              <PreviewSidebar option={option} />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChapterGroupColorOptionsTestPage;
