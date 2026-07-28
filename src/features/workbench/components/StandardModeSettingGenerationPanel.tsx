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
import { createVersionFromBrainstormEntry } from '@/features/workbench/model/standardModeBrainstormModel';
import { readDefaultStandardSettingEntries } from '@/features/workbench/model/standardModeDefaultSettingAdapter';
import {
  STANDARD_SETTING_GENERATION_STEPS,
  buildStandardSettingStepRequest,
  findBuiltInSettingPrompt,
  readStandardSettingGenerationState,
  writeStandardSettingGenerationState,
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
  onImport: (allowedEntryIds: string[]) => boolean;
  onJumpToEmptyField: (result: StandardSettingEmptyField) => void;
};

export function StandardModeSettingGenerationPanel({
  settingsStorageKey,
  entries,
  latestOutput,
  isGenerating,
  onGenerate,
  onImport,
  onJumpToEmptyField,
}: StandardModeSettingGenerationPanelProps) {
  const { prompts } = usePrompts();
  const [flow, setFlow] = useState<StandardSettingGenerationState>(() =>
    readStandardSettingGenerationState(settingsStorageKey),
  );
  const [queuedStepIndex, setQueuedStepIndex] = useState<number | null>(null);
  const [panelMode, setPanelMode] = useState<'generate' | 'check'>('generate');
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

  useEffect(() => {
    setFlow(readStandardSettingGenerationState(settingsStorageKey));
    generationVisualSnapshotRef.current = null;
    generationTargetEntryIdsRef.current = [];
    setQueuedStepIndex(null);
    setPanelMode('generate');
    setCheckResults(null);
    setLinkedBrainstorm(readStandardModeBrainstormLinkFromSettingsKey(settingsStorageKey));
    setIsBrainstormReaderOpen(false);
  }, [settingsStorageKey]);

  useEffect(() => {
    writeStandardSettingGenerationState(settingsStorageKey, flow);
  }, [flow, settingsStorageKey]);

  const runStep = useCallback(
    (stepIndex: number, autoContinue: boolean) => {
      const step = STANDARD_SETTING_GENERATION_STEPS[stepIndex];
      if (!step || isGenerating) return;
      const targets = readStandardSettingGenerationTargets(settingsStorageKey, step);
      if (targets.length === 0) {
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
      setFlow((current) => ({
        ...current,
        currentStepIndex: stepIndex,
        status: 'running',
        autoContinue,
        error: '',
      }));
      onGenerate(request, `生成设定：${step.name}`);
    },
    [entries, flow, isGenerating, linkedBrainstorm, onGenerate, prompts, settingsStorageKey],
  );

  useEffect(() => {
    if (isGenerating && flow.status === 'running') {
      generationObservedRef.current = true;
      return;
    }
    if (isGenerating || flow.status !== 'running') return;
    if (!generationObservedRef.current) return;
    generationObservedRef.current = false;
    if (!latestOutput.trim() || latestOutput.includes('【错误】')) {
      generationVisualSnapshotRef.current = null;
      setFlow((current) => ({ ...current, status: 'failed', error: '本步骤生成失败，请重试。' }));
      return;
    }
    if (!onImport(generationTargetEntryIdsRef.current)) {
      generationVisualSnapshotRef.current = null;
      setFlow((current) => ({
        ...current,
        status: 'failed',
        error: 'AI返回内容无法识别为设定，请调整内置提示词后重试。',
      }));
      return;
    }
    const completedStep = STANDARD_SETTING_GENERATION_STEPS[flow.currentStepIndex];
    const completedStepIds = Array.from(new Set([...flow.completedStepIds, completedStep.id]));
    const nextIndex = flow.currentStepIndex + 1;
    const finished = nextIndex >= STANDARD_SETTING_GENERATION_STEPS.length;
    if (finished || !flow.autoContinue) generationVisualSnapshotRef.current = null;
    setFlow((current) => ({
      ...current,
      completedStepIds,
      currentStepIndex: finished ? current.currentStepIndex : nextIndex,
      status: finished ? 'completed' : 'idle',
      error: '',
    }));
    if (!finished && flow.autoContinue) setQueuedStepIndex(nextIndex);
  }, [
    flow.autoContinue,
    flow.completedStepIds,
    flow.currentStepIndex,
    flow.status,
    isGenerating,
    latestOutput,
    onImport,
  ]);

  useEffect(() => {
    if (queuedStepIndex === null) return;
    const timer = window.setTimeout(() => {
      const nextIndex = queuedStepIndex;
      setQueuedStepIndex(null);
      runStep(nextIndex, true);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [queuedStepIndex, runStep]);

  const generationInteractionLocked = isGenerating || flow.status === 'running' || queuedStepIndex !== null;
  const visibleFlow = generationInteractionLocked && generationVisualSnapshotRef.current
    ? generationVisualSnapshotRef.current
    : flow;
  const checkSettings = () => {
    const emptyFields = findEmptyStandardSettingFields(readDefaultStandardSettingEntries(settingsStorageKey));
    setCheckResults(emptyFields);
    setPanelMode('check');
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
          aria-pressed={panelMode === 'generate'}
          onClick={() => setPanelMode('generate')}
          className={`h-8 rounded text-xs font-bold ${panelMode === 'generate' ? 'bg-[#08AACE] text-white' : 'text-[#52606d] hover:bg-[#EAF9FD]'}`}
        >
          生成设定
        </button>
        <button
          type="button"
          disabled={generationInteractionLocked}
          aria-pressed={panelMode === 'check'}
          onClick={() => setPanelMode('check')}
          className={`h-8 rounded text-xs font-bold ${panelMode === 'check' ? 'bg-[#08AACE] text-white' : 'text-[#52606d] hover:bg-[#EAF9FD]'}`}
        >
          检查设定{checkResults ? ` ${checkResults.length}` : ''}
        </button>
      </div>

      {panelMode === 'generate' ? (
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
                          <span
                            aria-hidden={unlocked ? undefined : true}
                            className="flex h-7 w-16 shrink-0 items-center justify-center"
                            data-standard-setting-action-slot="true"
                          >
                            {unlocked ? (
                              <button
                                type="button"
                                disabled={generationInteractionLocked}
                                onClick={() => runStep(index, false)}
                                className="h-7 w-full rounded-md border border-[#08AACE] bg-white px-2 text-xs font-bold text-[#078FAB] hover:bg-[#E9FAFE]"
                                title={`${completed ? '重新生成' : '生成'}${step.name}`}
                              >
                                {completed ? '重新生成' : '生成'}
                              </button>
                            ) : null}
                          </span>
                        </span>
                      </span>
                      <span className="mt-1 block text-xs font-medium leading-5 text-[#7b8794]">{step.scope}</span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>

          <label className="mt-4 flex min-h-[120px] flex-1 flex-col">
            <span className="mb-2 block text-sm font-bold text-[#52606d]">用户要求</span>
            <textarea
              aria-label="作品设定用户要求"
              value={flow.requirement}
              disabled={generationInteractionLocked}
              onChange={(event) => setFlow((current) => ({ ...current, requirement: event.target.value }))}
              placeholder="例如：世界观偏黑暗，主角做事果断"
              className="min-h-[120px] w-full flex-1 resize-none rounded-md border border-[#BFC8D2] bg-white p-3 text-sm font-medium leading-6 text-[#1f2933] outline-none placeholder:text-xs placeholder:text-[#9aa3af] focus:border-[#08AACE]"
            />
          </label>

          <div
            inert={generationInteractionLocked ? true : undefined}
            className={generationInteractionLocked ? 'pointer-events-none' : undefined}
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
        {panelMode === 'generate' ? (
          <button
            type="button"
            disabled={generationInteractionLocked}
            onClick={() => runStep(flow.currentStepIndex, true)}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#08AACE] text-sm font-bold text-white hover:bg-[#0797B8]"
          >
            {visibleFlow.status === 'failed'
              ? '重试当前步骤'
              : visibleFlow.status === 'paused'
                ? '继续当前步骤'
                : visibleFlow.status === 'completed'
                  ? '重新生成当前步骤'
                  : visibleFlow.completedStepIds.length
                    ? '继续生成'
                    : '一键生成全部'}
          </button>
        ) : null}
        <button
          type="button"
          disabled={generationInteractionLocked}
          onClick={checkSettings}
          className="h-10 w-full rounded-md border border-[#BFC8D2] bg-white text-sm font-bold text-[#52606d] hover:border-[#63C6D9] hover:text-[#078FAB]"
        >
          {panelMode === 'check' ? '重新检查' : '一键检查'}
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
