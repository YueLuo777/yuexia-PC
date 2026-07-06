import { Lock, Sparkles, Unlock } from 'lucide-react';

const samplePrompts = [
  {
    name: '结构审核-长篇节奏与毒点检测提示词',
    description: '检查章节结构、爽点密度、逻辑断层、人物动机和可能劝退的剧情问题。',
    contentLength: 685,
    locked: false,
  },
  {
    name: '结构审核-反派压迫感与主角反击链路',
    description: '重点判断冲突推进是否清晰，反派压迫是否足够，主角反击是否有铺垫。',
    contentLength: 1240,
    locked: true,
  },
];

function PromptActions() {
  return (
    <div className="xy-capsule-group w-full">
      <button type="button" className="xy-capsule-button flex-1">置顶</button>
      <button type="button" className="xy-capsule-button flex-1">编辑</button>
      <button type="button" className="xy-capsule-button xy-danger flex-1">删除</button>
    </div>
  );
}

function OldPromptCard({ prompt }: { prompt: typeof samplePrompts[number] }) {
  const LockIcon = prompt.locked ? Lock : Unlock;
  return (
    <article className="flex h-[247px] w-[255px] flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-[17px] font-bold text-slate-900">{prompt.name}</h2>
            <span className="rounded-xl border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-500">审核</span>
            <span className="rounded-xl border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-xs text-cyan-600">结构审核</span>
          </div>
        </div>
        <button type="button" className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-slate-200 bg-white text-slate-400">
          <LockIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 line-clamp-4 text-[13px] leading-6 text-slate-500">{prompt.description}</div>
      <div className="mt-auto">
        <p className="mb-2 text-left text-[13px] font-medium text-blue-500">{prompt.contentLength} 字</p>
        <PromptActions />
      </div>
    </article>
  );
}

function TwoLineAuditBadgeCard({ prompt }: { prompt: typeof samplePrompts[number] }) {
  const LockIcon = prompt.locked ? Lock : Unlock;
  return (
    <article className="flex h-[247px] w-[255px] flex-col rounded-lg border border-cyan-200 bg-white p-4 shadow-sm ring-2 ring-cyan-50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[17px] font-bold text-slate-900">{prompt.name}</h2>
          <div className="mt-2 flex flex-col items-start gap-1">
            <span className="rounded-xl border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-bold leading-4 text-blue-500">审核</span>
            <span className="rounded-xl border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-xs font-bold leading-4 text-cyan-600">结构审核</span>
          </div>
        </div>
        <button type="button" className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-slate-200 bg-white text-slate-400">
          <LockIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 line-clamp-3 text-[13px] leading-6 text-slate-500">{prompt.description}</div>
      <div className="mt-auto">
        <p className="mb-2 text-left text-[13px] font-medium text-blue-500">{prompt.contentLength} 字</p>
        <PromptActions />
      </div>
    </article>
  );
}

export function PromptAuditBadgeLayoutTestPage() {
  return (
    <div className="h-full overflow-auto bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
            <Sparkles className="h-3.5 w-3.5" />
            提示词卡片标签测试
          </div>
          <h1 className="mt-3 text-2xl font-black">审核提示词标签两行显示预览</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            左侧保留当前横排标签，右侧把“审核”和“结构审核”独立放到标题下方两行，避免提示词名称被标签挤压或遮挡。
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white/60 p-5">
            <h2 className="text-sm font-black text-slate-500">当前横排标签</h2>
            <div className="mt-4 flex flex-wrap gap-4">
              {samplePrompts.map((prompt) => (
                <OldPromptCard key={prompt.name} prompt={prompt} />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-cyan-200 bg-cyan-50/40 p-5">
            <h2 className="text-sm font-black text-cyan-700">两行标签候选</h2>
            <div className="mt-4 flex flex-wrap gap-4">
              {samplePrompts.map((prompt) => (
                <TwoLineAuditBadgeCard key={prompt.name} prompt={prompt} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
