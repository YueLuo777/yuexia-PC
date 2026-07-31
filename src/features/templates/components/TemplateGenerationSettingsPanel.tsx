import type { ReactNode } from 'react';

import { getDiyLevelByIndex, getDiyLevelTheme } from '@/features/templates/components/TemplateDiyLevelTheme';
import type { DiyLevel, TemplateDiyController } from '@/features/templates/hooks/useTemplateDiyController';
import {
  validateTemplateGenerationBlueprint,
  type SettingGenerationPromptProfile,
  type TemplateEntryGenerationRule,
  type TemplateGenerationBlueprint,
} from '@/features/workbench/model/standardModeTemplateGenerationModel';

type TemplateGenerationSettingsPanelProps = {
  controller: TemplateDiyController;
  blueprint: TemplateGenerationBlueprint;
  onBlueprintChange: (blueprint: TemplateGenerationBlueprint) => void;
  promptProfile: SettingGenerationPromptProfile;
  onPromptProfileChange: (profile: SettingGenerationPromptProfile) => void;
};

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="min-w-0">
      <span className="mb-1.5 block text-xs font-bold text-slate-500">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Math.max(min, Math.min(max, Number(event.target.value) || 0)))}
        className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-[#08AACE]"
      />
    </label>
  );
}

function LevelName({
  level,
  children,
  className = '',
}: {
  level: DiyLevel;
  children: ReactNode;
  className?: string;
}) {
  const theme = getDiyLevelTheme(level);
  return (
    <span
      className={`inline-flex max-w-full items-center truncate rounded px-2 py-0.5 font-black ring-1 ${theme.name} ${className}`}
      data-template-generation-level-name={level}
    >
      {children}
    </span>
  );
}

export function TemplateGenerationSettingsPanel({
  controller,
  blueprint,
  onBlueprintChange,
  promptProfile,
  onPromptProfileChange,
}: TemplateGenerationSettingsPanelProps) {
  const entries = controller.structure.flatMap((domain) => domain.groups.flatMap((group) =>
    group.entries.map((entry) => ({ domain, group, entry })),
  ));
  const selected = entries.find(({ entry }) => entry.id === controller.entry?.id) ?? entries[0];
  const rule = selected ? blueprint.entryRules[selected.entry.id] : undefined;
  const validation = validateTemplateGenerationBlueprint(controller.structure, blueprint);

  const updateRule = (patch: Partial<TemplateEntryGenerationRule>) => {
    if (!selected || !rule) return;
    onBlueprintChange({
      ...blueprint,
      entryRules: {
        ...blueprint.entryRules,
        [selected.entry.id]: { ...rule, ...patch, entryId: selected.entry.id },
      },
    });
  };

  const updateStage = (stageId: string, patch: Partial<TemplateGenerationBlueprint['stages'][number]>) => {
    onBlueprintChange({
      ...blueprint,
      stages: blueprint.stages.map((stage) => stage.id === stageId ? { ...stage, ...patch } : stage),
    });
  };

  const moveStage = (stageId: string, direction: -1 | 1) => {
    const index = blueprint.stages.findIndex((stage) => stage.id === stageId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= blueprint.stages.length) return;
    const stages = [...blueprint.stages];
    [stages[index], stages[targetIndex]] = [stages[targetIndex], stages[index]];
    onBlueprintChange({
      ...blueprint,
      stages: stages.map((stage, order) => ({ ...stage, order })),
    });
  };

  const addStage = () => {
    const id = `stage:custom-${Date.now()}`;
    onBlueprintChange({
      ...blueprint,
      stages: [...blueprint.stages, {
        id,
        name: `生成步骤${blueprint.stages.length + 1}`,
        order: blueprint.stages.length,
        description: '',
        promptName: '作品设定生成',
        promptGuidance: '',
      }],
    });
  };

  const deleteStage = (stageId: string) => {
    if (blueprint.stages.length <= 1) return;
    const fallbackStageId = blueprint.stages.find((stage) => stage.id !== stageId)?.id ?? '';
    const stages = blueprint.stages
      .filter((stage) => stage.id !== stageId)
      .map((stage, order) => ({ ...stage, order }));
    const entryRules = Object.fromEntries(Object.entries(blueprint.entryRules).map(([entryId, entryRule]) => [
      entryId,
      entryRule.stageId === stageId ? { ...entryRule, stageId: fallbackStageId } : entryRule,
    ]));
    const { [stageId]: _removed, ...stageGuidance } = promptProfile.stageGuidance;
    onBlueprintChange({ ...blueprint, stages, entryRules });
    onPromptProfileChange({ ...promptProfile, stageGuidance });
  };

  return (
    <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto bg-white px-4 py-4" data-template-generation-settings="true">
      <section className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-4" aria-label="模板生成步骤">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-black text-slate-800">生成步骤与顺序</h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">一键生成按这里从上到下执行；逐步生成每次只执行所选步骤。</p>
          </div>
          <button type="button" onClick={addStage} className="h-9 rounded-md bg-[#08AACE] px-4 text-sm font-bold text-white">
            新增步骤
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {blueprint.stages.map((stage, index) => {
            const stageLevel = getDiyLevelByIndex(index);
            const stageTheme = getDiyLevelTheme(stageLevel);
            return (
              <article
                key={stage.id}
                className={`rounded-md border p-2 ${stageTheme.card}`}
                data-template-generation-stage-level={stageLevel}
              >
                <div className="grid grid-cols-[44px_minmax(150px,0.55fr)_minmax(240px,1fr)_auto] items-center gap-2">
                  <span className={`mx-auto rounded px-2 py-0.5 text-center text-sm font-black ring-1 ${stageTheme.name}`}>{index + 1}</span>
                  <input
                    aria-label={`步骤名称：${stage.name}`}
                    value={stage.name}
                    maxLength={15}
                    onChange={(event) => updateStage(stage.id, { name: event.target.value })}
                    className="h-9 min-w-0 rounded-md border border-slate-300 px-3 text-sm font-bold outline-none focus:border-[#08AACE]"
                  />
                  <input
                    aria-label={`${stage.name}生成范围`}
                    value={stage.description}
                    onChange={(event) => updateStage(stage.id, { description: event.target.value })}
                    placeholder="说明本步骤生成哪些内容"
                    className="h-9 min-w-0 rounded-md border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-[#08AACE]"
                  />
                  <div className="flex items-center gap-1">
                    <button type="button" disabled={index === 0} onClick={() => moveStage(stage.id, -1)} className="h-8 rounded border border-slate-200 px-2 text-xs font-bold disabled:text-slate-300">上移</button>
                    <button type="button" disabled={index === blueprint.stages.length - 1} onClick={() => moveStage(stage.id, 1)} className="h-8 rounded border border-slate-200 px-2 text-xs font-bold disabled:text-slate-300">下移</button>
                    <button type="button" disabled={blueprint.stages.length <= 1} onClick={() => deleteStage(stage.id)} className="h-8 rounded border border-red-200 px-2 text-xs font-bold text-red-500 disabled:text-slate-300">删除</button>
                  </div>
                </div>
                <label className="mt-2 grid grid-cols-[44px_minmax(0,1fr)] items-start gap-2">
                  <span className="pt-2 text-center text-[11px] font-bold text-slate-400">提示词</span>
                  <textarea
                    aria-label={`${stage.name}步骤专属提示词`}
                    value={promptProfile.stageGuidance[stage.id] ?? stage.promptGuidance}
                    onChange={(event) => onPromptProfileChange({
                      ...promptProfile,
                      stageGuidance: { ...promptProfile.stageGuidance, [stage.id]: event.target.value },
                    })}
                    placeholder="说明本步骤的生成重点、质量要求和与前序设定的衔接方式"
                    className="h-16 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold leading-5 outline-none focus:border-[#08AACE]"
                  />
                </label>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4" aria-label="三级设定生成规则">
        <div className="grid grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)] gap-4">
          <div>
            <label>
              <span className="mb-1.5 block text-xs font-bold text-slate-500">选择三级设定</span>
              <select
                value={selected?.entry.id ?? ''}
                onChange={(event) => {
                  const next = entries.find(({ entry }) => entry.id === event.target.value);
                  if (next) controller.selectPath(next.domain.id, next.group.id, next.entry.id);
                }}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-[#08AACE]"
              >
                {entries.map(({ domain, group, entry }) => (
                  <option key={entry.id} value={entry.id}>{domain.title} / {group.title} / {entry.title}</option>
                ))}
              </select>
            </label>
            {selected ? (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]" data-template-generation-selected-path="true">
                <LevelName level="domain">{selected.domain.title}</LevelName>
                <LevelName level="group">{selected.group.title}</LevelName>
                <LevelName level="entry">{selected.entry.title}</LevelName>
              </div>
            ) : null}
            {rule ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label>
                  <span className="mb-1.5 block text-xs font-bold text-slate-500">生成方式</span>
                  <select
                    value={rule.mode}
                    onChange={(event) => updateRule({ mode: event.target.value === 'collection' ? 'collection' : 'single' })}
                    className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold"
                  >
                    <option value="single">单项设定</option>
                    <option value="collection">多项设定</option>
                  </select>
                </label>
                <label>
                  <span className="mb-1.5 block text-xs font-bold text-slate-500">所属步骤</span>
                  <select value={rule.stageId} onChange={(event) => updateRule({ stageId: event.target.value })} className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold">
                    {blueprint.stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}
                  </select>
                </label>
              </div>
            ) : null}
          </div>

          {selected && rule ? (
            <div className="rounded-md border border-cyan-100 bg-[#F4FCFE] p-3">
              {rule.mode === 'collection' ? (
                <>
                  <div className="grid grid-cols-4 gap-3">
                    <label>
                      <span className="mb-1.5 block text-xs font-bold text-slate-500">名称字段</span>
                      <LevelName level="field" className="mb-1.5 text-[11px]">
                        {selected.entry.sections.flatMap((section) => section.fields)
                          .find((field) => field.id === rule.titleFieldId)?.title ?? '四级字段'}
                      </LevelName>
                      <select value={rule.titleFieldId ?? ''} onChange={(event) => updateRule({ titleFieldId: event.target.value })} className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm font-semibold">
                        {selected.entry.sections.flatMap((section) => section.fields).map((field) => <option key={field.id} value={field.id}>{field.title}</option>)}
                      </select>
                    </label>
                    <NumberField label="最少数量" value={rule.minCount} min={0} max={20} onChange={(value) => updateRule({ minCount: value })} />
                    <NumberField label="推荐数量" value={rule.recommendedCount} min={0} max={20} onChange={(value) => updateRule({ recommendedCount: value })} />
                    <NumberField label="最大数量" value={rule.maxCount} min={1} max={50} onChange={(value) => updateRule({ maxCount: value })} />
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <input type="checkbox" checked={rule.required} onChange={(event) => updateRule({ required: event.target.checked })} />
                    该类设定至少需要生成一项
                  </label>
                </>
              ) : (
                <p className="text-sm font-semibold leading-6 text-slate-600">单项设定只保留一个固定条目；生成时填写原有字段，不会额外新建同类条目。</p>
              )}
            </div>
          ) : null}
        </div>

        {selected && rule ? (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <label>
              <span className="mb-1.5 block text-xs font-bold text-slate-500">该设定专属提示词</span>
              <textarea
                value={promptProfile.entryGuidance[selected.entry.id] ?? rule.promptGuidance}
                onChange={(event) => onPromptProfileChange({
                  ...promptProfile,
                  entryGuidance: { ...promptProfile.entryGuidance, [selected.entry.id]: event.target.value },
                })}
                placeholder="例如：功法必须说明修炼条件、核心效果、限制和后续升级。"
                className="h-24 w-full resize-none rounded-md border border-slate-300 p-3 text-sm font-semibold leading-6 outline-none focus:border-[#08AACE]"
              />
            </label>
            <fieldset>
              <legend className="mb-1.5 text-xs font-bold text-slate-500">依赖的设定</legend>
              <div className="editor-scrollbar h-24 overflow-y-auto rounded-md border border-slate-300 bg-white p-2">
                {entries.filter(({ entry }) => entry.id !== selected.entry.id).map(({ entry }) => (
                  <label key={entry.id} className="flex items-center gap-2 px-1 py-1 text-xs font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={rule.dependencyEntryIds.includes(entry.id)}
                      onChange={(event) => updateRule({
                        dependencyEntryIds: event.target.checked
                          ? [...rule.dependencyEntryIds, entry.id]
                          : rule.dependencyEntryIds.filter((id) => id !== entry.id),
                      })}
                    />
                    <LevelName level="entry" className="text-[11px]">{entry.title}</LevelName>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        ) : null}
      </section>

      <section className="mt-4 rounded-lg border border-slate-200 bg-[#F8FAFC] p-4" aria-label="模板总提示词">
        <h2 className="text-sm font-black text-slate-800">模板总提示词</h2>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <label>
            <span className="mb-1.5 block text-xs font-bold text-slate-500">生成目标</span>
            <textarea value={promptProfile.globalGuidance} onChange={(event) => onPromptProfileChange({ ...promptProfile, globalGuidance: event.target.value })} className="h-24 w-full resize-none rounded-md border border-slate-300 bg-white p-3 text-sm font-semibold leading-6 outline-none focus:border-[#08AACE]" />
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-bold text-slate-500">禁止事项</span>
            <textarea value={promptProfile.forbiddenGuidance} onChange={(event) => onPromptProfileChange({ ...promptProfile, forbiddenGuidance: event.target.value })} className="h-24 w-full resize-none rounded-md border border-slate-300 bg-white p-3 text-sm font-semibold leading-6 outline-none focus:border-[#08AACE]" />
          </label>
        </div>
      </section>

      <div className={`mt-4 rounded-md border px-3 py-2 text-xs font-bold ${validation.valid ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-600'}`} role="status">
        {validation.valid
          ? `生成配置有效；共 ${blueprint.stages.length} 个步骤、${Object.keys(blueprint.entryRules).length} 个设定规则。`
          : validation.errors.map((issue) => issue.message).join('；')}
      </div>
    </div>
  );
}
