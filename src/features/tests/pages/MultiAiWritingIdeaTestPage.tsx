import { CheckCircle2, CircleDollarSign, GitCompareArrows, Sparkles, Square } from 'lucide-react';

const candidateModels = ['GPT', 'Kimi', 'DeepSeek', '通义千问', 'Claude'] as const;

const plannedFlow = [
  '选择本次参与生成的多个 AI，并读取同一份章纲、设定、前文和用户要求',
  '点击一次后并行发送生成任务，分别显示模型进度、耗时、费用和失败原因',
  '所有结果集中并排预览，支持字数、剧情符合度、文风和重复内容对比',
  '用户选择一个版本作为正文，也可以指定某个版本继续修改或融合重写',
] as const;

const safeguards = [
  '发送前明确显示预计调用数量，避免一次点击产生意外的多倍费用',
  '支持单独停止某个模型和全部停止，失败模型可单独重试',
  '每个模型使用各自配置和上下文上限，输入内容保持一致且可在日志中核对',
  '只有用户明确点击采用后才写入正文，未采用结果保留为临时对比稿',
] as const;

export function MultiAiWritingIdeaTestPage() {
  return (
    <div className="min-h-full overflow-y-auto bg-[#F5F7FA] p-5 text-slate-700">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-5">
        <header className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                <Sparkles className="h-4 w-4" />
                未做·功能想法记录
              </div>
              <h1 className="mt-3 text-2xl font-black text-slate-950">一键调用多个 AI 生成正文</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                让 GPT、Kimi、DeepSeek 等模型读取同一份创作材料并行生成，用户在一个页面里比较多个正文版本，再决定采用哪一版。
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-right">
              <div className="text-xs font-bold text-amber-700">当前状态</div>
              <div className="mt-1 text-lg font-black text-amber-900">仅记录，尚未实现</div>
            </div>
          </div>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <GitCompareArrows className="h-5 w-5 text-cyan-700" />
            <h2 className="text-base font-black text-slate-950">候选模型</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {candidateModels.map((model) => (
              <div key={model} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <Square className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-black text-slate-800">{model}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-black text-slate-950">计划中的使用流程</h2>
            <div className="mt-4 space-y-3">
              {plannedFlow.map((item, index) => (
                <div key={item} className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-700 text-xs font-black text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm font-bold leading-6">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <CircleDollarSign className="h-5 w-5 text-cyan-700" />
              <h2 className="text-base font-black text-slate-950">以后实现时必须保留的控制</h2>
            </div>
            <div className="mt-4 space-y-3">
              {safeguards.map((item) => (
                <div key={item} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cyan-700" />
                  <p className="text-sm font-bold leading-6">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default MultiAiWritingIdeaTestPage;
