import { Check, Circle, LoaderCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { usePrompts } from '@/features/prompts/hooks/usePrompts';
import { countTextWords } from '@/features/workbench/model/workbenchLibraryPanelModel';
import { parseRoleContent } from '@/features/workbench/components/workbenchRoleContent';
import { parseSettingContent } from '@/features/workbench/components/workbenchStructuredSettings';
import { normalizeImportedSettingKey } from '@/features/workbench/components/workbenchSmartImport';
import {
  clearStandardModeBrainstormLinkFromSettingsKey,
  readStandardModeBrainstormLinkFromSettingsKey,
  writeStandardModeBrainstormLinkFromSettingsKey,
} from '@/features/workbench/model/standardModeBrainstormLink';
import { subscribeStandardModeSettingNavigationAction } from '@/features/workbench/model/standardModeSettingNavigationEvents';
import { createVersionFromBrainstormEntry } from '@/features/workbench/model/standardModeBrainstormModel';
import { readDefaultStandardSettingEntries } from '@/features/workbench/model/standardModeDefaultSettingAdapter';
import {
  STANDARD_SETTING_GENERATION_STEPS,
  buildStandardSettingStepRequest,
  clearStandardSettingGenerationSnapshot,
  createStandardSettingGenerationState,
  findBuiltInSettingPrompt,
  readStandardSettingGenerationState,
  readStandardSettingGenerationSnapshot,
  writeStandardSettingLastRequest,
  writeStandardSettingGenerationState,
  writeStandardSettingGenerationSnapshot,
  type StandardSettingGenerationState,
} from '@/features/workbench/model/standardModeSettingGenerationFlow';
import { findEmptyStandardSettingFields } from '@/features/workbench/model/standardModeSettingModel';
import type { StandardSettingEmptyField } from '@/features/workbench/model/standardModeSettingModel';
import { readStandardSettingGenerationTargets } from '@/features/workbench/model/standardModeSettingGenerationTargets';
import {
  GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
  readWorkbenchLibraryEntries,
  type WorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';
import { LinkedSourceControl } from '@/shared/ui/LinkedSourceControl';
import { StandardModeSettingCheckResults } from './StandardModeSettingCheckResults';
import { BrainstormReaderModal } from './BrainstormReaderModal';

const FALLBACK_SETTING_PROMPT =
  '你是专业网文设定策划。根据当前模板生成具体、前后一致、可直接用于后续章纲和正文创作的设定。';
const pendingAutoContinueSteps = new Map<string, number>();
const autoContinueTimers = new Map<string, number>();
const autoContinueRunners = new Map<string, (stepIndex: number) => void>();

function clearPendingAutoContinue(storageKey: string) {
  pendingAutoContinueSteps.delete(storageKey);
  const timer = autoContinueTimers.get(storageKey);
  if (timer !== undefined) window.clearTimeout(timer);
  autoContinueTimers.delete(storageKey);
}

function schedulePendingAutoContinue(storageKey: string, stepIndex: number) {
  const existingTimer = autoContinueTimers.get(storageKey);
  if (existingTimer !== undefined) window.clearTimeout(existingTimer);
  pendingAutoContinueSteps.set(storageKey, stepIndex);
  const timer = window.setTimeout(() => {
    autoContinueTimers.delete(storageKey);
    const runner = autoContinueRunners.get(storageKey);
    if (!runner) return;
    pendingAutoContinueSteps.delete(storageKey);
    runner(stepIndex);
  }, 250);
  autoContinueTimers.set(storageKey, timer);
}

function buildExistingSettingContext(
  entries: WorkbenchLibraryEntry[],
  targets: Array<{ id: string; title: string }>,
) {
  const targetIds = new Set(targets.map((target) => target.id));
  const normalizedTargetTitles = targets.map((target) => normalizeImportedSettingKey(target.title));
  return entries
    .filter((entry) => entry.tab === '大纲' || entry.tab === '角色')
    .filter((entry) => {
      if (/^<[^<>]+>$/.test(entry.title.trim())) return false;
      const title = normalizeImportedSettingKey(entry.title);
      const matchesTargetTitle = normalizedTargetTitles.some((targetTitle) =>
        title === targetTitle || title.startsWith(`${targetTitle}：`) || title.startsWith(`${targetTitle}:`),
      );
      if (!matchesTargetTitle || targetIds.has(entry.id) || entry.tab === '角色') return true;
      const setting = parseSettingContent(entry.content);
      return Boolean(setting.lockedDefaultEntryId || setting.structuredFieldSetId);
    })
    .map((entry) => {
      if (entry.tab === '角色') {
        const role = parseRoleContent(entry.content);
        const body = [
          role.baseSetting,
          role.personality ? `性格：${role.personality}` : '',
          role.relationship ? `人物关系：${role.relationship}` : '',
          role.status ? `当前状态：${role.status}` : '',
        ]
          .filter(Boolean)
          .join('\n');
        return body ? `【${role.type} / ${entry.title}】\n${body}` : '';
      }
      const setting = parseSettingContent(entry.content);
      return setting.body.trim() ? `【${setting.type} / ${entry.title}】\n${setting.body.trim()}` : '';
    })
    .filter(Boolean)
    .join('\n\n')
    .slice(0, 12000);
}

type StandardModeSettingGenerationPanelProps = {
  settingsStorageKey: string;
  entries: WorkbenchLibraryEntry[];
  latestOutput: string;
  isGenerating: boolean;
  onGenerate: (request: string, visibleText: string) => void;
  onStop: () => void;
  onImport: (allowedEntryIds: string[], standardGenerationStepId: string) => boolean;
  onJumpToEmptyField: (result: StandardSettingEmptyField) => void;
};

export function StandardModeSettingGenerationPanel({
  settingsStorageKey,
  entries,
  latestOutput,
  isGenerating,
  onGenerate,
  onStop,
  onImport,
  onJumpToEmptyField,
}: StandardModeSettingGenerationPanelProps) {
  const { prompts } = usePrompts();
  const [flow, setFlow] = useState<StandardSettingGenerationState>(() =>
    readStandardSettingGenerationState(settingsStorageKey),
  );
  const [queuedStepIndex, setQueuedStepIndex] = useState<number | null>(null);
  const [panelMode, setPanelMode] = useState<'one-click' | 'step-by-step'>('one-click');
  const [checkResults, setCheckResults] = useState<StandardSettingEmptyField[] | null>(null);
  const [linkedBrainstorm, setLinkedBrainstorm] = useState(() =>
    readStandardModeBrainstormLinkFromSettingsKey(settingsStorageKey),
  );
  const [brainstormEntries, setBrainstormEntries] = useState<WorkbenchLibraryEntry[]>([]);
  const [selectedBrainstormId, setSelectedBrainstormId] = useState<string | null>(null);
  const [isBrainstormReaderOpen, setIsBrainstormReaderOpen] = useState(false);
  const generationObservedRef = useRef(false);
  const generationVisualSnapshotRef = useRef<StandardSettingGenerationState | null>(null);
  const generationTargetEntryIdsRef = useRef<string[]>([]);
  const isGeneratingRef = useRef(isGenerating);
  isGeneratingRef.current = isGenerating;

  useEffect(() => {
    const restoredFlow = readStandardSettingGenerationState(settingsStorageKey);
    const snapshot = readStandardSettingGenerationSnapshot(settingsStorageKey);
    const requestIsActive = isGeneratingRef.current;
    setFlow(snapshot && requestIsActive ? { ...restoredFlow, status: 'running', error: '' } : restoredFlow);
    generationVisualSnapshotRef.current = null;
    generationTargetEntryIdsRef.current = snapshot?.targetEntryIds ?? [];
    generationObservedRef.current = Boolean(snapshot && requestIsActive);
    if (snapshot && !requestIsActive) {
      clearStandardSettingGenerationSnapshot(settingsStorageKey);
    }
    const pendingStepIndex = pendingAutoContinueSteps.get(settingsStorageKey);
    const canResumePendingStep = pendingStepIndex !== undefined
      && restoredFlow.status === 'idle'
      && restoredFlow.autoContinue
      && restoredFlow.currentStepIndex === pendingStepIndex;
    setQueuedStepIndex(canResumePendingStep ? pendingStepIndex : null);
    setPanelMode('one-click');
    setCheckResults(null);
    setLinkedBrainstorm(readStandardModeBrainstormLinkFromSettingsKey(settingsStorageKey));
    setIsBrainstormReaderOpen(false);
  }, [settingsStorageKey]);

  useEffect(() => {
    return subscribeStandardModeSettingNavigationAction((event) => {
      if (event.storageKey !== settingsStorageKey || event.action !== 'settings-cleared') return;
      setFlow(createStandardSettingGenerationState());
      setQueuedStepIndex(null);
      clearPendingAutoContinue(settingsStorageKey);
      setPanelMode('one-click');
      setCheckResults(null);
      generationObservedRef.current = false;
      generationVisualSnapshotRef.current = null;
      generationTargetEntryIdsRef.current = [];
      clearStandardSettingGenerationSnapshot(settingsStorageKey);
    });
  }, [settingsStorageKey]);

  useEffect(() => {
    writeStandardSettingGenerationState(settingsStorageKey, flow);
  }, [flow, settingsStorageKey]);

  const runStep = useCallback(
    (stepIndex: number, autoContinue: boolean) => {
      const step = STANDARD_SETTING_GENERATION_STEPS[stepIndex];
      if (!step || isGenerating) return;
      if (!autoContinue) {
        setQueuedStepIndex(null);
        clearPendingAutoContinue(settingsStorageKey);
      }
      const targets = readStandardSettingGenerationTargets(settingsStorageKey, step);
      if (targets.length === 0) {
        clearPendingAutoContinue(settingsStorageKey);
        setFlow((current) => ({ ...current, status: 'failed', error: '当前模板在本步骤中没有可写入的原有设定。' }));
        return;
      }
      const prompt = findBuiltInSettingPrompt(prompts, step);
      const request = buildStandardSettingStepRequest({
        step,
        requirement: flow.requirement,
        brainstorm: linkedBrainstorm
          ? [linkedBrainstorm.title, linkedBrainstorm.content].filter(Boolean).join('\n')
          : '',
        existingSettings: buildExistingSettingContext(entries, targets),
        promptContent: prompt?.content ?? FALLBACK_SETTING_PROMPT,
        targets,
      });
      generationObservedRef.current = false;
      generationVisualSnapshotRef.current ??= flow;
      generationTargetEntryIdsRef.current = targets.map((target) => target.id);
      writeStandardSettingGenerationSnapshot(settingsStorageKey, {
        stepId: step.id,
        targetEntryIds: targets.map((target) => target.id),
      });
      const runningFlow = {
        ...flow,
        currentStepIndex: stepIndex,
        status: 'running' as const,
        autoContinue,
        error: '',
      };
      setFlow(runningFlow);
      writeStandardSettingGenerationState(settingsStorageKey, runningFlow);
      writeStandardSettingLastRequest(settingsStorageKey, {
        createdAt: new Date().toLocaleString('zh-CN'),
        stepName: step.name,
        promptName: prompt?.name ?? '内置作品设定生成提示词',
        userContent: request,
      });
      onGenerate(request, `生成设定：${step.name}`);
    },
    [entries, flow, isGenerating, linkedBrainstorm, onGenerate, prompts, settingsStorageKey],
  );

  useEffect(() => {
    const runner = (stepIndex: number) => {
      setQueuedStepIndex(null);
      runStep(stepIndex, true);
    };
    autoContinueRunners.set(settingsStorageKey, runner);
    const pendingStepIndex = pendingAutoContinueSteps.get(settingsStorageKey);
    if (pendingStepIndex !== undefined && !autoContinueTimers.has(settingsStorageKey)) {
      schedulePendingAutoContinue(settingsStorageKey, pendingStepIndex);
    }
    return () => {
      if (autoContinueRunners.get(settingsStorageKey) === runner) {
        autoContinueRunners.delete(settingsStorageKey);
      }
    };
  }, [runStep, settingsStorageKey]);

  useEffect(() => {
    if (isGenerating && flow.status === 'running') {
      generationObservedRef.current = true;
      return;
    }
    if (isGenerating || flow.status !== 'running') return;
    if (!generationObservedRef.current) return;
    generationObservedRef.current = false;
    if (!latestOutput.trim() || latestOutput.includes('【错误】')) {
      clearPendingAutoContinue(settingsStorageKey);
      clearStandardSettingGenerationSnapshot(settingsStorageKey);
      generationVisualSnapshotRef.current = null;
      setFlow((current) => ({ ...current, status: 'failed', error: '本步骤生成失败，请重试。' }));
      return;
    }
    const completedStep = STANDARD_SETTING_GENERATION_STEPS[flow.currentStepIndex];
    if (!onImport(generationTargetEntryIdsRef.current, completedStep.id)) {
      clearPendingAutoContinue(settingsStorageKey);
      clearStandardSettingGenerationSnapshot(settingsStorageKey);
      generationVisualSnapshotRef.current = null;
      setFlow((current) => ({
        ...current,
        status: 'failed',
        error: 'AI返回内容无法识别为设定，请调整内置提示词后重试。',
      }));
      return;
    }
    clearStandardSettingGenerationSnapshot(settingsStorageKey);
    const completedStepIds = Array.from(new Set([...flow.completedStepIds, completedStep.id]));
    const nextIndex = flow.currentStepIndex + 1;
    const finished = nextIndex >= STANDARD_SETTING_GENERATION_STEPS.length;
    if (finished || !flow.autoContinue) {
      generationVisualSnapshotRef.current = null;
      clearPendingAutoContinue(settingsStorageKey);
    }
    const completedFlow: StandardSettingGenerationState = {
      ...flow,
      completedStepIds,
      currentStepIndex: finished ? flow.currentStepIndex : nextIndex,
      status: finished ? 'completed' : 'idle',
      error: '',
    };
    writeStandardSettingGenerationState(settingsStorageKey, completedFlow);
    setFlow(completedFlow);
    if (!finished && flow.autoContinue) {
      setQueuedStepIndex(nextIndex);
      schedulePendingAutoContinue(settingsStorageKey, nextIndex);
    }
  }, [
    flow,
    isGenerating,
    latestOutput,
    onImport,
    settingsStorageKey,
  ]);

  const generationInteractionLocked = isGenerating || flow.status === 'running' || queuedStepIndex !== null;
  const visibleFlow = generationInteractionLocked && generationVisualSnapshotRef.current
    ? generationVisualSnapshotRef.current
    : flow;
  const regeneratingCompletedStep = isGenerating
    && visibleFlow.completedStepIds.includes(STANDARD_SETTING_GENERATION_STEPS[flow.currentStepIndex]?.id ?? '');
  const completedProgressCount = visibleFlow.completedStepIds.length - (regeneratingCompletedStep ? 1 : 0);
  const progressPercent = Math.min(
    100,
    Math.round(((completedProgressCount + (isGenerating ? 0.5 : 0)) / STANDARD_SETTING_GENERATION_STEPS.length) * 100),
  );
  const checkSettings = () => {
    const emptyFields = findEmptyStandardSettingFields(readDefaultStandardSettingEntries(settingsStorageKey));
    setCheckResults(emptyFields);
  };
  const pauseGeneration = () => {
    setQueuedStepIndex(null);
    clearPendingAutoContinue(settingsStorageKey);
    generationObservedRef.current = false;
    generationVisualSnapshotRef.current = null;
    clearStandardSettingGenerationSnapshot(settingsStorageKey);
    setFlow((current) => ({ ...current, status: 'paused', autoContinue: false, error: '' }));
    onStop();
  };
  const startOneClickGeneration = () => {
    if (visibleFlow.status !== 'completed') {
      runStep(flow.currentStepIndex, true);
      return;
    }
    const restartedFlow: StandardSettingGenerationState = {
      ...flow,
      currentStepIndex: 0,
      completedStepIds: [],
      status: 'idle',
      autoContinue: true,
      error: '',
    };
    generationVisualSnapshotRef.current = null;
    writeStandardSettingGenerationState(settingsStorageKey, restartedFlow);
    setFlow(restartedFlow);
    setQueuedStepIndex(0);
    schedulePendingAutoContinue(settingsStorageKey, 0);
  };
  const openBrainstormReader = () => {
    const nextEntries = readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY);
    const matchedEntry = linkedBrainstorm
      ? nextEntries.find(
          (entry) =>
            entry.id === linkedBrainstorm.sourceEntryId ||
            entry.id === linkedBrainstorm.id ||
            `saved-${entry.id}` === linkedBrainstorm.id,
        )
      : null;
    setBrainstormEntries(nextEntries);
    setSelectedBrainstormId(matchedEntry?.id ?? null);
    setIsBrainstormReaderOpen(true);
  };
  const confirmBrainstormLink = () => {
    const selectedEntry = brainstormEntries.find((entry) => entry.id === selectedBrainstormId);
    if (!selectedEntry) return;
    const nextLink = createVersionFromBrainstormEntry(selectedEntry);
    writeStandardModeBrainstormLinkFromSettingsKey(settingsStorageKey, nextLink);
    setLinkedBrainstorm(nextLink);
    setIsBrainstormReaderOpen(false);
  };
  const clearBrainstormLink = () => {
    clearStandardModeBrainstormLinkFromSettingsKey(settingsStorageKey);
    setLinkedBrainstorm(null);
    setSelectedBrainstormId(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-standard-setting-generation-panel="true">
      <div className="grid shrink-0 grid-cols-2 overflow-hidden rounded-md border border-[#BFC8D2] bg-white p-0.5">
        <button
          type="button"
          disabled={generationInteractionLocked}
          aria-pressed={panelMode === 'one-click'}
          onClick={() => {
            setPanelMode('one-click');
            setCheckResults(null);
          }}
          className={`h-8 rounded text-xs font-bold ${panelMode === 'one-click' ? 'bg-[#08AACE] text-white' : 'text-[#52606d] hover:bg-[#EAF9FD]'}`}
        >
          一键生成
        </button>
        <button
          type="button"
          disabled={generationInteractionLocked}
          aria-pressed={panelMode === 'step-by-step'}
          onClick={() => {
            setPanelMode('step-by-step');
            setCheckResults(null);
          }}
          className={`h-8 rounded text-xs font-bold ${panelMode === 'step-by-step' ? 'bg-[#08AACE] text-white' : 'text-[#52606d] hover:bg-[#EAF9FD]'}`}
        >
          逐步生成
        </button>
      </div>

      {checkResults === null ? (
        <div className="editor-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto py-3 pr-1">
          <ol className="shrink-0 space-y-2" aria-label="作品设定生成步骤">
            {STANDARD_SETTING_GENERATION_STEPS.map((step, index) => {
              const completed = visibleFlow.completedStepIds.includes(step.id);
              const active = index === visibleFlow.currentStepIndex;
              const generating = isGenerating && active;
              const failed = active && visibleFlow.status === 'failed';
              const paused = active && visibleFlow.status === 'paused';
              const unlocked =
                index === 0 ||
                STANDARD_SETTING_GENERATION_STEPS.slice(0, index).every((previousStep) =>
                  visibleFlow.completedStepIds.includes(previousStep.id),
                );
              const statusText = generating
                ? '生成中'
                : failed
                  ? '生成失败'
                  : paused
                    ? '已暂停'
                    : completed
                      ? '已生成'
                      : '未生成';
              const Icon = generating ? LoaderCircle : completed ? Check : Circle;
              return (
                <li key={step.id}>
                  <div
                    data-standard-setting-step={step.id}
                    className={`flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${
                      active
                        ? 'border-[#08AACE] bg-[#EAF9FD]'
                        : unlocked
                          ? 'border-[#D2D8E0] bg-white'
                          : 'border-[#E1E6EC] bg-slate-50'
                    }`}
                  >
                    <Icon
                      className={`mt-0.5 h-4 w-4 shrink-0 ${generating ? 'animate-spin text-[#08AACE]' : completed ? 'text-emerald-600' : 'text-slate-400'}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <strong className="min-w-0 text-sm font-bold text-[#1f2933]">
                          {index + 1}. {step.name}
                        </strong>
                        <span className="flex shrink-0 items-center gap-2">
                          <span
                            aria-live={generating ? 'polite' : undefined}
                            className={`text-xs font-bold ${generating ? 'text-[#078FAB]' : completed ? 'text-emerald-600' : failed ? 'text-red-600' : paused ? 'text-amber-600' : 'text-slate-400'}`}
                          >
                            {statusText}
                          </span>
                          {panelMode === 'step-by-step' ? (
                            <span
                              aria-hidden={unlocked ? undefined : true}
                              className="flex h-7 w-20 shrink-0 items-center justify-center"
                              data-standard-setting-action-slot="true"
                            >
                              {unlocked ? (
                                <button
                                  type="button"
                                  disabled={generationInteractionLocked}
                                  onClick={() => runStep(index, false)}
                                  className="h-7 w-full whitespace-nowrap rounded-md border border-[#08AACE] bg-white px-2 text-xs font-bold text-[#078FAB] hover:bg-[#E9FAFE]"
                                  title={`${completed ? '重新生成' : '生成'}${step.name}`}
                                >
                                  {completed ? '重新生成' : '生成'}
                                </button>
                              ) : null}
                            </span>
                          ) : null}
                        </span>
                      </span>
                      <span className="mt-1 block text-xs font-medium leading-5 text-[#7b8794]">{step.scope}</span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>

          <section className="mt-4 shrink-0" aria-label="作品设定生成进度" aria-live="polite">
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-bold">
              <span className="truncate text-[#52606d]">
                {isGenerating
                  ? `正在生成：${STANDARD_SETTING_GENERATION_STEPS[flow.currentStepIndex]?.name ?? '作品设定'}`
                  : visibleFlow.status === 'completed'
                    ? '作品设定生成完成'
                    : '作品设定生成进度'}
              </span>
              <span className="shrink-0 tabular-nums text-[#078FAB]">{progressPercent}%</span>
            </div>
            <div
              role="progressbar"
              aria-label="作品设定生成进度"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
              className="h-2.5 overflow-hidden rounded-full border border-[#B9E8F1] bg-[#EAF9FD]"
            >
              <div
                className={`h-full rounded-full bg-[#08AACE] transition-[width] duration-500 ease-out ${isGenerating ? 'animate-pulse' : ''}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </section>

          <label className="mt-4 flex shrink-0 flex-col">
            <span className="mb-2 block text-sm font-bold text-[#52606d]">用户要求</span>
            <textarea
              aria-label="作品设定用户要求"
              value={flow.requirement}
              disabled={generationInteractionLocked}
              onChange={(event) => setFlow((current) => ({ ...current, requirement: event.target.value }))}
              placeholder="例如：世界观偏黑暗，主角做事果断"
              className="h-24 min-h-24 w-full flex-none resize-none rounded-md border border-[#BFC8D2] bg-white p-3 text-sm font-medium leading-6 text-[#1f2933] outline-none placeholder:text-xs placeholder:text-[#9aa3af] focus:border-[#08AACE]"
            />
          </label>

          <div
            inert={generationInteractionLocked ? true : undefined}
            className={`shrink-0 ${generationInteractionLocked ? 'pointer-events-none' : ''}`}
          >
            <LinkedSourceControl
              linked={Boolean(linkedBrainstorm)}
              prefixLabel={linkedBrainstorm ? '已关联' : '关联'}
              label="脑洞"
              linkedLabel={linkedBrainstorm?.title}
              onOpen={openBrainstormReader}
              onClear={linkedBrainstorm ? clearBrainstormLink : undefined}
              meta={linkedBrainstorm ? `共 ${countTextWords(linkedBrainstorm.content)} 字` : undefined}
              title={linkedBrainstorm ? `重新选择关联脑洞：${linkedBrainstorm.title}` : '从脑洞库选择关联脑洞'}
              className="mt-3 flex min-w-0 shrink-0 items-center gap-2"
              groupClassName="flex h-8 w-fit max-w-[252px] shrink-0 overflow-hidden rounded-lg border border-[#08AACE] bg-white shadow-sm"
              prefixClassName="grid h-8 shrink-0 place-items-center border-r border-[#08AACE]/30 bg-[#E9FAFE] px-2.5 text-xs font-black text-[#078BA9]"
              buttonClassName="h-8 min-w-[68px] whitespace-nowrap bg-white px-3 text-xs font-black text-[#52606d] hover:bg-[#E9FAFE] hover:text-[#078BA9]"
              linkedButtonClassName="h-8 min-w-[72px] max-w-[176px] truncate bg-[#08AACE] px-3 text-xs font-black text-white hover:bg-[#079AB9]"
              clearButtonClassName="grid h-8 w-8 shrink-0 place-items-center border-l border-[#08AACE]/30 bg-red-500 text-white hover:bg-red-600"
              metaClassName="shrink-0 text-xs font-bold text-slate-400"
            />
          </div>

          {visibleFlow.error ? (
            <p role="alert" className="mt-3 text-xs font-semibold leading-5 text-red-600">
              {visibleFlow.error}
            </p>
          ) : null}
        </div>
      ) : (
        <div
          className="editor-scrollbar mt-3 min-h-0 flex-1 overflow-y-auto rounded-md border border-[#D2D8E0] bg-white"
          aria-live="polite"
        >
          <StandardModeSettingCheckResults results={checkResults} onJump={onJumpToEmptyField} />
        </div>
      )}

      <footer className="shrink-0 space-y-2 border-t border-[#D2D8E0] pt-3">
        {checkResults === null && (isGenerating || panelMode === 'one-click') ? (
          isGenerating ? (
            <button
              type="button"
              onClick={pauseGeneration}
              className="flex h-10 w-full items-center justify-center rounded-md border border-amber-300 bg-amber-50 text-sm font-bold text-amber-700 hover:bg-amber-100"
            >
              暂停生成
            </button>
          ) : (
            <button
              type="button"
              disabled={generationInteractionLocked}
              onClick={startOneClickGeneration}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#08AACE] text-sm font-bold text-white hover:bg-[#0797B8]"
            >
              {visibleFlow.status === 'failed'
                ? '重试当前步骤'
                : visibleFlow.status === 'paused'
                  ? '继续当前步骤'
                  : visibleFlow.status === 'completed'
                    ? '重新一键生成全部'
                    : visibleFlow.completedStepIds.length
                      ? '继续生成'
                      : '一键生成全部'}
            </button>
          )
        ) : null}
        <button
          type="button"
          disabled={generationInteractionLocked}
          onClick={checkSettings}
          className="h-10 w-full rounded-md border border-[#BFC8D2] bg-white text-sm font-bold text-[#52606d] hover:border-[#63C6D9] hover:text-[#078FAB]"
        >
          {checkResults ? '重新检查' : '一键检查'}
        </button>
      </footer>
      <BrainstormReaderModal
        isOpen={isBrainstormReaderOpen}
        entries={brainstormEntries}
        selectedId={selectedBrainstormId}
        onSelect={setSelectedBrainstormId}
        onClose={() => setIsBrainstormReaderOpen(false)}
        onConfirm={confirmBrainstormLink}
        title="关联脑洞"
        subtitle="左侧选择脑洞，右侧预览完整内容；确认后会作为生成作品设定的参考资料。"
        confirmText="确认关联"
      />
    </div>
  );
}
