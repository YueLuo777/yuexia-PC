import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useModels } from '@/features/models/hooks/useModels';
import { usePrompts } from '@/features/prompts/hooks/usePrompts';
import {
  appendSettingGenerationStep,
  readSettingGenerationFlow,
  writeSettingGenerationFlow,
  type SettingGenerationFlow,
  type SettingGenerationStep,
} from '@/features/owner-test-mode/model/settingGenerationFlow';
import { AppModalShell } from '@/shared/ui/AppModalShell';
import { CapsuleSelect } from '@/shared/ui/CapsuleSelect';

function moveStep(flow: SettingGenerationFlow, index: number, offset: number) {
  const target = index + offset;
  if (target < 0 || target >= flow.steps.length) return flow;
  const steps = [...flow.steps];
  const [step] = steps.splice(index, 1);
  steps.splice(target, 0, step);
  return { ...flow, steps };
}

export function SettingGenerationFlowLauncher() {
  const [open, setOpen] = useState(false);
  const [flow, setFlow] = useState<SettingGenerationFlow>(readSettingGenerationFlow);
  const [selectedStepId, setSelectedStepId] = useState(flow.steps[0]?.id ?? '');
  const [saved, setSaved] = useState(false);
  const { models } = useModels();
  const { prompts } = usePrompts();
  const settingPrompts = useMemo(() => prompts.filter((prompt) => prompt.category === '设定'), [prompts]);
  const selectedIndex = flow.steps.findIndex((step) => step.id === selectedStepId);
  const selectedStep = flow.steps[selectedIndex] ?? flow.steps[0] ?? null;

  useEffect(() => {
    if (!open) return;
    const stored = readSettingGenerationFlow();
    setFlow(stored);
    setSelectedStepId(stored.steps[0]?.id ?? '');
    setSaved(false);
  }, [open]);

  const updateSelectedStep = (updates: Partial<SettingGenerationStep>) => {
    if (!selectedStep) return;
    setSaved(false);
    setFlow((current) => ({
      ...current,
      steps: current.steps.map((step) => (step.id === selectedStep.id ? { ...step, ...updates } : step)),
    }));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-10 w-full rounded-md border border-amber-400 bg-amber-50 px-3 text-sm font-bold text-amber-800 hover:bg-amber-100"
      >
        设定生成流程
      </button>
      <AppModalShell
        title="设定生成流程"
        subtitle="内置流程配置"
        isOpen={open}
        onClose={() => setOpen(false)}
        widthClass="w-[1080px]"
        heightClass="h-[720px] max-h-[88vh]"
        storageId="owner_setting_generation_flow"
        centerOnOpen
      >
        <div className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <strong className="text-sm font-bold text-slate-900">生成步骤</strong>
              <button
                type="button"
                title="新增步骤"
                aria-label="新增步骤"
                onClick={() => {
                  const next = appendSettingGenerationStep(flow);
                  setFlow(next);
                  setSelectedStepId(next.steps.at(-1)?.id ?? '');
                  setSaved(false);
                }}
                className="grid h-8 w-8 place-items-center rounded-md border border-slate-300 bg-white text-slate-600 hover:border-[#08AACE] hover:text-[#078FAB]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto py-3">
              {flow.steps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setSelectedStepId(step.id)}
                  className={`mb-2 flex min-h-12 w-full items-center gap-3 rounded-md border px-3 text-left ${
                    selectedStep?.id === step.id
                      ? 'border-[#08AACE] bg-[#EAF9FD] text-[#076F87]'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-[#9DDFEA]'
                  }`}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white text-xs font-bold text-[#078FAB]">
                    {index + 1}
                  </span>
                  <span className="min-w-0 truncate text-sm font-bold">{step.name}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col bg-white">
            {selectedStep ? (
              <div className="min-h-0 flex-1 overflow-y-auto p-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <strong className="text-base font-bold text-slate-900">第 {selectedIndex + 1} 步</strong>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title="上移"
                      aria-label="上移当前步骤"
                      disabled={selectedIndex <= 0}
                      onClick={() => {
                        setFlow((current) => moveStep(current, selectedIndex, -1));
                        setSaved(false);
                      }}
                      className="grid h-8 w-8 place-items-center rounded-md border border-slate-300 text-slate-600 disabled:opacity-35"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="下移"
                      aria-label="下移当前步骤"
                      disabled={selectedIndex >= flow.steps.length - 1}
                      onClick={() => {
                        setFlow((current) => moveStep(current, selectedIndex, 1));
                        setSaved(false);
                      }}
                      className="grid h-8 w-8 place-items-center rounded-md border border-slate-300 text-slate-600 disabled:opacity-35"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="删除步骤"
                      aria-label="删除当前步骤"
                      disabled={flow.steps.length <= 1}
                      onClick={() => {
                        const remaining = flow.steps.filter((step) => step.id !== selectedStep.id);
                        setFlow({ ...flow, steps: remaining });
                        setSelectedStepId(remaining[Math.max(0, selectedIndex - 1)]?.id ?? '');
                        setSaved(false);
                      }}
                      className="grid h-8 w-8 place-items-center rounded-md border border-red-200 text-red-500 disabled:opacity-35"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">步骤名称</span>
                    <input
                      aria-label="步骤名称"
                      value={selectedStep.name}
                      onChange={(event) => updateSelectedStep({ name: event.target.value })}
                      className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#08AACE]"
                    />
                  </label>
                  <label className="flex items-end pb-2">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedStep.includePreviousResults}
                        disabled={selectedIndex === 0}
                        onChange={(event) => updateSelectedStep({ includePreviousResults: event.target.checked })}
                        className="h-4 w-4 accent-[#08AACE]"
                      />
                      读取前面步骤的生成结果
                    </span>
                  </label>
                  <CapsuleSelect
                    floatingLabel="模型"
                    value={selectedStep.modelId}
                    onChange={(modelId) => updateSelectedStep({ modelId })}
                    options={
                      models.length
                        ? models.map((model) => ({ value: model.id, label: model.name }))
                        : [{ value: '', label: '暂无可用模型', disabled: true }]
                    }
                    buttonClassName="h-11 rounded-md"
                  />
                  <CapsuleSelect
                    floatingLabel="提示词"
                    value={selectedStep.promptId}
                    onChange={(promptId) => updateSelectedStep({ promptId })}
                    options={
                      settingPrompts.length
                        ? settingPrompts.map((prompt) => ({ value: prompt.id, label: prompt.name }))
                        : [{ value: '', label: '暂无设定类提示词', disabled: true }]
                    }
                    buttonClassName="h-11 rounded-md"
                  />
                </div>
                <label className="mt-6 block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">本步骤生成范围</span>
                  <textarea
                    aria-label="本步骤生成范围"
                    value={selectedStep.scope}
                    onChange={(event) => updateSelectedStep({ scope: event.target.value })}
                    className="h-40 w-full resize-none rounded-md border border-slate-300 p-3 text-sm font-semibold leading-6 text-slate-800 outline-none focus:border-[#08AACE]"
                  />
                </label>
              </div>
            ) : null}
            <footer className="flex h-16 shrink-0 items-center justify-end gap-3 border-t border-slate-200 px-6">
              {saved ? <span className="text-sm font-semibold text-emerald-600">已保存</span> : null}
              <button
                type="button"
                onClick={() => {
                  writeSettingGenerationFlow(flow);
                  setSaved(true);
                }}
                className="h-10 rounded-md bg-[#08AACE] px-6 text-sm font-bold text-white hover:bg-[#0797B8]"
              >
                保存流程
              </button>
            </footer>
          </section>
        </div>
      </AppModalShell>
    </>
  );
}
