import { Check } from 'lucide-react';
import { useState } from 'react';

import type { StandardModeWorkbenchStats } from '@/features/workbench/model/standardModeWorkbenchStats';

type GuideStep = {
  id: 'brainstorm' | 'settings' | 'outline' | 'writing' | 'check';
  title: string;
  shortTitle: string;
  purpose: string;
  complete: boolean;
  action: string;
  onOpen: () => void;
  progress: string;
};

type StandardModeCreationGuidePanelProps = {
  hasBrainstorm: boolean;
  hasSettings: boolean;
  stats: StandardModeWorkbenchStats;
  onOpenBrainstorm: () => void;
  onOpenSettings: () => void;
  onOpenOutline: () => void;
  onOpenWriting: () => void;
  onOpenAudit: () => void;
};

export function StandardModeCreationGuidePanel({
  hasBrainstorm,
  hasSettings,
  stats,
  onOpenBrainstorm,
  onOpenSettings,
  onOpenOutline,
  onOpenWriting,
  onOpenAudit,
}: StandardModeCreationGuidePanelProps) {
  const steps: GuideStep[] = [
    {
      id: 'brainstorm',
      title: '准备脑洞',
      shortTitle: '脑洞',
      purpose: '确定题材、主角、卖点和故事方向',
      complete: hasBrainstorm,
      action: hasBrainstorm ? '查看脑洞' : '生成脑洞',
      onOpen: onOpenBrainstorm,
      progress: `脑洞库：${stats.brainstormCount} 个${hasBrainstorm ? '，当前作品已关联 1 个' : ''}`,
    },
    {
      id: 'settings',
      title: '建立设定',
      shortTitle: '设定',
      purpose: '把脑洞扩展为世界、人物和规则',
      complete: hasSettings,
      action: hasSettings ? '查看设定' : '开始设定',
      onOpen: onOpenSettings,
      progress: stats.settingTotalCount > 0
        ? `设定完善度：${stats.settingCompletedCount} / ${stats.settingTotalCount}，还有 ${stats.settingTotalCount - stats.settingCompletedCount} 个未完善`
        : '设定模板：尚未创建',
    },
    {
      id: 'outline',
      title: '生成章纲',
      shortTitle: '章纲',
      purpose: '规划每章发生什么以及如何推进',
      complete: stats.outlineCount > 0,
      action: '生成章纲',
      onOpen: onOpenOutline,
      progress: `已有 ${stats.outlineCount} 个章纲`,
    },
    {
      id: 'writing',
      title: '生成正文',
      shortTitle: '正文',
      purpose: '根据章纲和设定完成章节内容',
      complete: stats.draftCount > 0,
      action: '生成正文',
      onOpen: onOpenWriting,
      progress: `已完成 ${stats.draftCount} 章正文`,
    },
    {
      id: 'check',
      title: '完成检查',
      shortTitle: '检查',
      purpose: '审核剧情、更新状态并生成梗概',
      complete: stats.draftCount > 0 && stats.reviewedChapterCount >= stats.draftCount,
      action: '审核剧情',
      onOpen: onOpenAudit,
      progress: `已审核 ${stats.reviewedChapterCount} / ${stats.draftCount} 章`,
    },
  ];
  const nextStep = steps.find((step) => !step.complete) ?? steps.at(-1)!;
  const [activeId, setActiveId] = useState<GuideStep['id']>(nextStep.id);
  const activeStep = steps.find((step) => step.id === activeId) ?? nextStep;
  const activeState = activeStep.complete ? 'complete' : activeStep.id === nextStep.id ? 'next' : 'pending';

  return (
    <aside
      className="flex min-h-0 flex-col border-l border-[#dce1e8] bg-white p-5"
      data-standard-creation-guide="true"
      data-creation-guide-layout="overview"
    >
      <header className="shrink-0 border-b border-[#dce1e8] pb-4">
        <h2 className="text-base font-bold text-[#1f2933]">创作向导</h2>
        <p className="mt-1.5 text-xs font-medium leading-5 text-[#7b8794]">
          上方查看完整流程，下方处理当前任务
        </p>
      </header>

      <nav aria-label="创作步骤总览" className="mt-4 grid shrink-0 grid-cols-5 gap-1.5">
        {steps.map((step, index) => {
          const selected = step.id === activeStep.id;
          const isNext = step.id === nextStep.id;
          return (
            <button
              key={step.id}
              type="button"
              aria-label={`查看${step.title}`}
              aria-pressed={selected}
              onClick={() => setActiveId(step.id)}
              className={`flex min-w-0 flex-col items-center gap-1.5 rounded-md border px-1 py-2 focus-visible:outline-none ${
                selected
                  ? 'border-[#08AACE] bg-[#EAF9FD]'
                  : 'border-[#dce1e8] bg-white hover:border-[#9DDFEA] hover:bg-[#F7FCFD]'
              }`}
              data-guide-step-tab={step.id}
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                step.complete
                  ? 'border-[#08AACE] bg-[#08AACE] text-white'
                  : isNext
                    ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAB]'
                    : 'border-[#cbd3dc] bg-white text-[#7b8794]'
              }`}>
                {step.complete ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
              </span>
              <span className="text-[11px] font-bold text-[#46515f]">{step.shortTitle}</span>
            </button>
          );
        })}
      </nav>

      <section
        className="mt-4 rounded-md border border-[#dce1e8] bg-white p-4"
        data-guide-current-task={activeStep.id}
        data-guide-step-state={activeState}
      >
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-[#078FAB]">当前任务</div>
          <h3 className="mt-1 text-lg font-bold text-[#1f2933]">{activeStep.title}</h3>
        </div>
        <p className="mt-3 text-xs font-medium leading-5 text-[#657180]">{activeStep.purpose}</p>
        <div
          className="mt-3 break-words rounded-md bg-[#F7F9FB] px-3 py-2 text-xs font-bold leading-5 text-[#078FAB]"
          data-guide-step-progress={activeStep.id}
        >
          {activeStep.progress}
        </div>
        <button
          type="button"
          onClick={activeStep.onOpen}
          className="mt-4 h-10 w-full rounded-md bg-[#08AACE] text-sm font-bold text-white hover:bg-[#0797b8] focus-visible:outline-none"
        >
          {activeStep.action}
        </button>
      </section>

      <section className="mt-4 border-t border-[#dce1e8] pt-4">
        <h3 className="text-xs font-bold text-[#657180]">流程说明</h3>
        <p className="mt-2 text-xs font-medium leading-6 text-[#657180]">
          脑洞形成方向，设定约束内容，章纲规划推进，正文完成章节，最后检查剧情与状态。
        </p>
      </section>
    </aside>
  );
}
