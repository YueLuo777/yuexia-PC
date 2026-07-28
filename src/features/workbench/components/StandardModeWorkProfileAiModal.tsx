import { useEffect, useMemo, useRef, useState } from 'react';

import {
  releaseAiCredits,
  reserveAiCredits,
  settleAiCredits,
} from '@/features/credits/services/aiCreditGateway';
import { useModels } from '@/features/models/hooks/useModels';
import { callModel } from '@/features/models/services/callModel';
import { BUILT_IN_PROMPT_CATEGORY, normalizePromptCategoryName, usePrompts } from '@/features/prompts/hooks/usePrompts';
import {
  buildWorkProfileOptimizationUserContent,
  DEFAULT_WORK_PROFILE_OPTIMIZATION_PROMPT,
  parseWorkProfileOptimizationCandidates,
  WORK_PROFILE_OPTIMIZATION_PROMPT_NAME,
  WORK_PROFILE_OPTIMIZATION_STYLES,
  type WorkProfileOptimizationCandidate,
  type WorkProfileOptimizationTarget,
} from '@/features/workbench/model/standardModeWorkProfileOptimization';
import type { WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';
import { ActionButton } from '@/shared/ui/ActionButton';
import { AppModalShell } from '@/shared/ui/AppModalShell';
import { CapsuleSelect } from '@/shared/ui/CapsuleSelect';

type Props = {
  isOpen: boolean;
  novel: WorkbenchNovel;
  title: string;
  synopsis: string;
  initialTarget: WorkProfileOptimizationTarget;
  onClose: () => void;
  onApply: (value: { title?: string; synopsis?: string }) => void;
};

const FIELD_CLASS = 'w-full rounded-md border border-[#BFC8D2] bg-white px-3 py-2 text-sm font-medium text-[#1f2933] outline-none placeholder:text-[#9aa3af] focus:border-[#08AACE]';
const TARGET_OPTIONS: Array<{ value: WorkProfileOptimizationTarget; label: string }> = [
  { value: 'both', label: '书名和简介' },
  { value: 'title', label: '只生成书名' },
  { value: 'synopsis', label: '只生成简介' },
];

export function StandardModeWorkProfileAiModal({
  isOpen,
  novel,
  title,
  synopsis,
  initialTarget,
  onClose,
  onApply,
}: Props) {
  const { models, activeModel } = useModels();
  const { prompts } = usePrompts();
  const [target, setTarget] = useState<WorkProfileOptimizationTarget>(initialTarget);
  const [count, setCount] = useState('5');
  const [style, setStyle] = useState<string>(WORK_PROFILE_OPTIMIZATION_STYLES[0]);
  const [referenceTitles, setReferenceTitles] = useState('');
  const [requirements, setRequirements] = useState('');
  const [candidates, setCandidates] = useState<WorkProfileOptimizationCandidate[]>([]);
  const [status, setStatus] = useState('');
  const [generating, setGenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const selectedModel = activeModel ?? models[0] ?? null;
  const systemPrompt = useMemo(() => {
    const configured = prompts.find((prompt) =>
      normalizePromptCategoryName(prompt.category) === BUILT_IN_PROMPT_CATEGORY
      && prompt.name.trim() === WORK_PROFILE_OPTIMIZATION_PROMPT_NAME,
    )?.content.trim();
    return configured || DEFAULT_WORK_PROFILE_OPTIMIZATION_PROMPT;
  }, [prompts]);

  useEffect(() => {
    if (!isOpen) return;
    setTarget(initialTarget);
    setCandidates([]);
    setStatus('');
    setGenerating(false);
  }, [initialTarget, isOpen]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const closeModal = () => {
    abortRef.current?.abort();
    onClose();
  };

  const generate = async () => {
    if (generating) return;
    if (!selectedModel) {
      setStatus('尚未配置可用模型，请先到模型管理完成配置。');
      return;
    }
    const candidateCount = Math.max(1, Math.min(10, Number(count) || 1));
    const abortController = new AbortController();
    abortRef.current = abortController;
    setGenerating(true);
    setCandidates([]);
    setStatus('正在生成候选方案');
    let reservation: Awaited<ReturnType<typeof reserveAiCredits>> | null = null;
    try {
      reservation = await reserveAiCredits({
        operation: 'work-profile-optimization',
        resourceId: String(novel.id),
        quantity: candidateCount,
        idempotencyKey: `work-profile-${novel.id}-${Date.now()}`,
      });
      const content = await callModel({
        model: selectedModel,
        prompt: systemPrompt,
        userContent: buildWorkProfileOptimizationUserContent({
          target,
          count: candidateCount,
          style,
          referenceTitles,
          requirements,
          currentTitle: title,
          currentSynopsis: synopsis,
          channel: novel.channel === 'female' ? '女频' : '男频',
          category: novel.category ?? '',
          targetWordCount: novel.targetWordCount ?? 0,
        }),
        recordType: 'generate',
        signal: abortController.signal,
        timeoutMs: 120_000,
      });
      setCandidates(parseWorkProfileOptimizationCandidates(content, target, candidateCount));
      await settleAiCredits(reservation);
      setStatus('生成完成，请选择要采用的内容。');
    } catch (error) {
      if (reservation) await releaseAiCredits(reservation);
      if (error instanceof DOMException && error.name === 'AbortError') setStatus('已停止生成。');
      else setStatus(`生成失败：${error instanceof Error ? error.message : '模型请求失败。'}`);
    } finally {
      abortRef.current = null;
      setGenerating(false);
    }
  };

  return (
    <AppModalShell
      title="AI优化作品资料"
      subtitle="生成结果不会自动覆盖，确认后再应用"
      isOpen={isOpen}
      onClose={closeModal}
      widthClass="w-[1040px]"
      heightClass="h-[720px] max-h-[88vh]"
      storageId="standard_work_profile_ai_optimizer"
      centerOnOpen
    >
      <div className="grid min-h-0 flex-1 grid-cols-[390px_minmax(0,1fr)]">
        <section className="editor-scrollbar min-h-0 overflow-y-auto border-r border-slate-200 p-5">
          <fieldset>
            <legend className="mb-2 text-sm font-bold text-[#657180]">生成内容</legend>
            <div className="grid grid-cols-3 gap-2">
              {TARGET_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={target === option.value}
                  onClick={() => setTarget(option.value)}
                  className={`h-10 rounded-md border px-2 text-xs font-bold ${
                    target === option.value
                      ? 'border-[#08AACE] bg-[#DFF6FB] text-[#078FAB]'
                      : 'border-[#BFC8D2] bg-white text-[#657180]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label>
              <span className="mb-2 block text-sm font-bold text-[#657180]">候选数量</span>
              <CapsuleSelect
                ariaLabel="候选数量"
                value={count}
                onChange={setCount}
                options={Array.from({ length: 10 }, (_, index) => ({
                  value: String(index + 1),
                  label: `${index + 1}个`,
                }))}
                className="w-full"
                buttonClassName="!h-10 !rounded-md !border-[#BFC8D2] !bg-white !px-3 !text-sm !font-semibold !shadow-none"
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-bold text-[#657180]">书名风格</span>
              <CapsuleSelect
                ariaLabel="书名风格"
                value={style}
                onChange={setStyle}
                options={WORK_PROFILE_OPTIMIZATION_STYLES.map((value) => ({ value, label: value }))}
                className="w-full"
                buttonClassName="!h-10 !rounded-md !border-[#BFC8D2] !bg-white !px-3 !text-sm !font-semibold !shadow-none"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-bold text-[#657180]">参考书名</span>
            <textarea
              value={referenceTitles}
              onChange={(event) => setReferenceTitles(event.target.value)}
              rows={3}
              maxLength={300}
              placeholder="输入你喜欢的作品书名，可用换行或顿号分隔"
              className={`${FIELD_CLASS} resize-none`}
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-bold text-[#657180]">用户要求</span>
            <textarea
              value={requirements}
              onChange={(event) => setRequirements(event.target.value)}
              rows={5}
              maxLength={1000}
              placeholder="例如：书名突出系统和反差感，简介前三句必须出现核心冲突"
              className={`${FIELD_CLASS} resize-none`}
            />
          </label>
          <div className="mt-5 flex items-center justify-between gap-3">
            <span role="status" className="min-w-0 text-xs font-semibold leading-5 text-[#078FAB]">{status}</span>
            {generating ? (
              <ActionButton variant="secondary" size="sm" onClick={() => abortRef.current?.abort()}>停止</ActionButton>
            ) : (
              <ActionButton size="sm" onClick={() => void generate()}>开始生成</ActionButton>
            )}
          </div>
        </section>

        <section className="flex min-h-0 flex-col bg-[#f7f8fa]">
          <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 px-5">
            <h3 className="text-sm font-bold text-[#1f2933]">候选结果</h3>
            <span className="text-xs font-semibold text-[#8a95a2]">{candidates.length}个方案</span>
          </header>
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
            {candidates.length === 0 ? (
              <div className="grid h-full place-items-center text-center text-sm font-medium leading-6 text-[#8a95a2]">
                {generating ? 'AI正在整理作品资料候选方案…' : '填写生成条件后，候选书名和简介会显示在这里。'}
              </div>
            ) : (
              <div className="space-y-4">
                {candidates.map((candidate, index) => (
                  <article key={candidate.id} className="rounded-md border border-[#BFC8D2] bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#8a95a2]">方案 {index + 1}</span>
                        {candidate.title ? <h4 className="mt-1 text-base font-bold text-[#1f2933]">{candidate.title}</h4> : null}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {candidate.title ? (
                          <ActionButton variant="secondary" size="sm" onClick={() => onApply({ title: candidate.title })}>
                            使用书名
                          </ActionButton>
                        ) : null}
                        {candidate.synopsis ? (
                          <ActionButton variant="secondary" size="sm" onClick={() => onApply({ synopsis: candidate.synopsis })}>
                            使用简介
                          </ActionButton>
                        ) : null}
                        {candidate.title && candidate.synopsis ? (
                          <ActionButton size="sm" onClick={() => onApply({ title: candidate.title, synopsis: candidate.synopsis })}>
                            使用此方案
                          </ActionButton>
                        ) : null}
                      </div>
                    </div>
                    {candidate.synopsis ? (
                      <p className="mt-3 whitespace-pre-wrap border-t border-slate-100 pt-3 text-sm font-medium leading-7 text-[#4b5563]">
                        {candidate.synopsis}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </AppModalShell>
  );
}
