import { useMemo, useRef, useState } from 'react';

import {
  SMART_TEMPLATE_PRESETS,
  cloneSmartTemplateStructure,
  getRecommendedTemplatesForNovelCategory,
  getSmartTemplatePackage,
  recommendTemplateForNovelCategory,
  sortSmartTemplatePresetsForDisplay,
  type BookChannel,
} from '@/features/workbench/model/standardModeSmartSettingFlowModel';
import {
  readSavedSettingTemplates,
  saveSettingTemplate,
  type TemplateStructure,
} from '@/features/workbench/model/standardModeTemplateModel';
import {
  buildDefaultTemplateGenerationBlueprint,
  createDefaultSettingGenerationPromptProfile,
  normalizeTemplateGenerationBlueprint,
  validateTemplateGenerationBlueprint,
  type SettingGenerationPromptProfile,
  type TemplateGenerationBlueprint,
} from '@/features/workbench/model/standardModeTemplateGenerationModel';
import {
  CUSTOM_SETTING_TEMPLATE_ID,
  CUSTOM_SETTING_TEMPLATE_NAME,
  hasSameTemplateDefinition,
} from '@/features/workbench/model/standardModeTemplateIdentity';
import { ManagedTemplateDiyEditor } from '@/features/templates/components/ManagedTemplateDiyEditor';

import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

type ConfirmedTemplate = {
  id: string;
  name: string;
  revision: number;
  structure: TemplateStructure;
  generationBlueprint: TemplateGenerationBlueprint;
  promptProfile: SettingGenerationPromptProfile;
};

type StandardModeSettingTemplateInitializerProps = {
  novelTitle: string;
  novelCategory: string;
  novelChannel: Extract<BookChannel, 'male' | 'female'>;
  novelTargetWordCount?: number;
  replacingExisting: boolean;
  onConfirm: (template: ConfirmedTemplate) => void;
  onNovelChannelChange: (channel: Extract<BookChannel, 'male' | 'female'>) => void;
  onCancel?: () => void;
};

type TemplateListMode = 'male' | 'female' | 'saved';

type TemplateSelectionSnapshot = ConfirmedTemplate & {
  sourceStructure: TemplateStructure;
  customized: boolean;
};

const CHANNEL_LABELS = {
  male: '男频',
  female: '女频',
  general: '通用',
} as const;

export function StandardModeSettingTemplateInitializer({
  novelTitle,
  novelCategory,
  novelChannel,
  onConfirm,
  onNovelChannelChange,
  onCancel,
}: StandardModeSettingTemplateInitializerProps) {
  const recommended = useMemo(
    () => recommendTemplateForNovelCategory(novelCategory, novelChannel),
    [novelCategory, novelChannel],
  );
  const selectionRef = useRef<TemplateSelectionSnapshot>({
    ...getSmartTemplatePackage(recommended),
    structure: cloneSmartTemplateStructure(recommended.structure),
    sourceStructure: recommended.structure,
    customized: false,
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState(recommended.id);
  const [structure, setStructure] = useState(() => selectionRef.current.structure);
  const [generationBlueprint, setGenerationBlueprint] = useState(() => selectionRef.current.generationBlueprint);
  const [savedTemplates, setSavedTemplates] = useState(readSavedSettingTemplates);
  const [saveName, setSaveName] = useState(`${novelTitle}模板`);
  const [templateListMode, setTemplateListMode] = useState<TemplateListMode>(novelChannel);
  const [pendingChannelPresetId, setPendingChannelPresetId] = useState<string | null>(null);
  const generationConfigurationValid = validateTemplateGenerationBlueprint(
    structure,
    generationBlueprint,
  ).valid;
  const visibleBuiltInTemplates = useMemo(
    () => templateListMode === 'saved'
      ? []
      : sortSmartTemplatePresetsForDisplay(
          SMART_TEMPLATE_PRESETS.filter((preset) => preset.channel === templateListMode || preset.channel === 'general'),
        ),
    [templateListMode],
  );
  const groupedBuiltInTemplates = useMemo(() => {
    if (templateListMode === 'saved') return { matching: [], others: [], otherLabel: '' };
    const matchingIds = new Set(
      getRecommendedTemplatesForNovelCategory(novelCategory, templateListMode).map((preset) => preset.id),
    );
    return {
      matching: visibleBuiltInTemplates.filter((preset) => matchingIds.has(preset.id)),
      others: visibleBuiltInTemplates.filter((preset) => !matchingIds.has(preset.id)),
      otherLabel: `其他${templateListMode === 'female' ? '女频' : '男频'}题材模板`,
    };
  }, [novelCategory, templateListMode, visibleBuiltInTemplates]);

  const applyBuiltIn = (id: string) => {
    const preset = SMART_TEMPLATE_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    const templatePackage = getSmartTemplatePackage(preset);
    const nextStructure = cloneSmartTemplateStructure(templatePackage.structure);
    selectionRef.current = {
      ...templatePackage,
      structure: nextStructure,
      sourceStructure: preset.structure,
      customized: false,
    };
    setSelectedTemplateId(preset.id);
    setStructure(nextStructure);
    setGenerationBlueprint(templatePackage.generationBlueprint);
  };

  const selectBuiltIn = (id: string) => {
    const preset = SMART_TEMPLATE_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    if (preset.channel !== 'general' && preset.channel !== novelChannel) {
      setPendingChannelPresetId(id);
      return;
    }
    applyBuiltIn(id);
  };

  const selectSaved = (id: string) => {
    const template = savedTemplates.find((item) => item.id === id);
    if (!template) return;
    const nextStructure = cloneSmartTemplateStructure(template.structure);
    const nextGenerationBlueprint = buildDefaultTemplateGenerationBlueprint(nextStructure);
    const nextPromptProfile = createDefaultSettingGenerationPromptProfile();
    selectionRef.current = {
      id: template.id,
      name: template.name,
      revision: template.revision,
      structure: nextStructure,
      generationBlueprint: nextGenerationBlueprint,
      promptProfile: nextPromptProfile,
      sourceStructure: template.structure,
      customized: false,
    };
    setSelectedTemplateId(template.id);
    setSaveName(template.name);
    setStructure(nextStructure);
    setGenerationBlueprint(nextGenerationBlueprint);
  };

  const saveCurrentTemplate = () => {
    if (!generationConfigurationValid) return;
    const name = saveName.trim() || '未命名模板';
    const next = saveSettingTemplate(
      name,
      selectionRef.current.structure,
      selectionRef.current.generationBlueprint,
      selectionRef.current.promptProfile,
      {
        channel: novelChannel,
        applicability: novelCategory.trim() ? 'genre' : 'general',
        genreCategory: novelCategory.trim() || '通用',
        ...(SMART_TEMPLATE_PRESETS.some((preset) => preset.id === selectedTemplateId)
          ? { basePresetId: selectedTemplateId }
          : null),
      },
    );
    selectionRef.current = {
      id: next[0].id,
      name,
      revision: next[0].revision,
      structure: next[0].structure,
      generationBlueprint: next[0].generationBlueprint,
      promptProfile: next[0].promptProfile,
      sourceStructure: next[0].structure,
      customized: false,
    };
    setSavedTemplates(next);
    setSelectedTemplateId(next[0].id);
    setStructure(next[0].structure);
    setGenerationBlueprint(next[0].generationBlueprint);
    setTemplateListMode('saved');
  };

  const updateStructure = (nextStructure: TemplateStructure) => {
    const customized = !hasSameTemplateDefinition(nextStructure, selectionRef.current.sourceStructure);
    const nextBlueprint = normalizeTemplateGenerationBlueprint(nextStructure, generationBlueprint);
    selectionRef.current = {
      ...selectionRef.current,
      structure: nextStructure,
      generationBlueprint: nextBlueprint,
      customized,
    };
    setStructure(nextStructure);
    setGenerationBlueprint(nextBlueprint);
  };

  const confirmCurrentTemplate = () => {
    if (!generationConfigurationValid) return;
    const selected = selectionRef.current;
    onConfirm({
      id: selected.customized ? CUSTOM_SETTING_TEMPLATE_ID : selected.id,
      name: selected.customized ? CUSTOM_SETTING_TEMPLATE_NAME : selected.name,
      revision: selected.revision,
      structure: selected.structure,
      generationBlueprint: selected.generationBlueprint,
      promptProfile: selected.promptProfile,
    });
  };

  const renderPresetButton = (preset: (typeof SMART_TEMPLATE_PRESETS)[number]) => (
    <button
      key={preset.id}
      type="button"
      aria-label={`选择内置模板：${preset.title}`}
      aria-pressed={selectedTemplateId === preset.id}
      onClick={() => selectBuiltIn(preset.id)}
      className={`flex min-h-[132px] w-full flex-col rounded-md border px-3 py-3 text-left ${
        selectedTemplateId === preset.id
          ? 'border-[#08AACE] bg-[#EAF9FD] shadow-[0_0_0_1px_#08AACE]'
          : 'border-slate-200 bg-white hover:border-[#9DDFEA]'
      }`}
    >
      <strong className="block text-sm">{preset.title}</strong>
      <span className="mt-1.5 line-clamp-3 text-xs font-medium leading-5 text-slate-500">{preset.description}</span>
      <span className="mt-auto flex justify-end pt-3">
        <span className="shrink-0 rounded-full border border-cyan-200 bg-[#EAF9FD] px-2 py-0.5 text-[10px] font-bold text-[#078FAB]">
          {CHANNEL_LABELS[preset.channel]} · {preset.genreCategory}
        </span>
      </span>
    </button>
  );

  return (
    <main
      className="h-full min-h-0 overflow-hidden bg-white"
      data-standard-setting-initializer="true"
    >
      <div className="relative z-0 grid h-full min-h-0 grid-cols-[280px_minmax(0,1fr)] overflow-hidden">
        <aside className="flex h-full min-h-0 flex-col border-r border-slate-200 bg-[#F7F9FB] p-4" data-template-list-panel="true">
          <div
            role="tablist"
            aria-label="模板来源"
            className="grid shrink-0 grid-cols-3 overflow-hidden rounded-md border border-slate-300 bg-white p-0.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={templateListMode === 'male'}
              onClick={() => setTemplateListMode('male')}
              className={`h-8 rounded text-xs font-bold ${
                templateListMode === 'male' ? 'bg-[#08AACE] text-white' : 'text-slate-600 hover:bg-[#EAF9FD]'
              }`}
            >
              男频
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={templateListMode === 'female'}
              onClick={() => setTemplateListMode('female')}
              className={`h-8 rounded text-xs font-bold ${
                templateListMode === 'female' ? 'bg-[#08AACE] text-white' : 'text-slate-600 hover:bg-[#EAF9FD]'
              }`}
            >
              女频
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={templateListMode === 'saved'}
              onClick={() => setTemplateListMode('saved')}
              className={`h-8 rounded text-xs font-bold ${
                templateListMode === 'saved' ? 'bg-[#08AACE] text-white' : 'text-slate-600 hover:bg-[#EAF9FD]'
              }`}
            >
              我的模板
            </button>
          </div>
          <div className="editor-scrollbar mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
            {templateListMode !== 'saved' ? (
              <div className="space-y-2">
                {groupedBuiltInTemplates.matching.map(renderPresetButton)}
                {groupedBuiltInTemplates.others.length > 0 ? (
                  <div
                    role="separator"
                    aria-label={groupedBuiltInTemplates.otherLabel}
                    className="flex items-center gap-2 py-1 text-[11px] font-bold text-slate-400"
                  >
                    <span className="h-px min-w-3 flex-1 bg-slate-200" />
                    <span className="shrink-0">{groupedBuiltInTemplates.otherLabel}</span>
                    <span className="h-px min-w-3 flex-1 bg-slate-200" />
                  </div>
                ) : null}
                {groupedBuiltInTemplates.others.map(renderPresetButton)}
              </div>
            ) : savedTemplates.length > 0 ? (
              <div className="space-y-2">
                {savedTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    aria-label={`选择我的模板：${template.name}`}
                    aria-pressed={selectedTemplateId === template.id}
                    onClick={() => selectSaved(template.id)}
                    className={`w-full rounded-md border px-3 py-3 text-left text-sm font-bold ${
                      selectedTemplateId === template.id
                        ? 'border-[#08AACE] bg-[#EAF9FD] shadow-[0_0_0_1px_#08AACE]'
                        : 'border-slate-200 bg-white hover:border-[#9DDFEA]'
                    }`}
                  >
                    <span className="block truncate">{template.name}</span>
                    <span className="mt-1.5 block text-xs font-semibold text-slate-400">最后保存：{template.updatedAt}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
                <strong className="block text-sm text-slate-600">还没有自定义模板</strong>
                <span className="mt-2 block text-xs font-semibold leading-5 text-slate-400">
                  请先到首页的模板管理中创建并保存模板。
                </span>
              </div>
            )}
          </div>
        </aside>

        <ManagedTemplateDiyEditor
          key={selectedTemplateId}
          initialStructure={structure}
          onChange={updateStructure}
          saveName={saveName}
          onSaveNameChange={setSaveName}
          onSaveTemplate={saveCurrentTemplate}
          readOnly={SMART_TEMPLATE_PRESETS.some((preset) => preset.id === selectedTemplateId)}
          footerActions={(
            <>
              {onCancel ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="h-10 rounded-md border border-[#dce1e8] bg-white px-5 text-sm font-semibold text-[#657180]"
                >
                  返回设定列表
                </button>
              ) : null}
              <button
                type="button"
                disabled={!generationConfigurationValid}
                onClick={confirmCurrentTemplate}
                className="h-10 rounded-md bg-[#08AACE] px-6 text-sm font-bold text-white disabled:bg-slate-200 disabled:text-slate-400"
              >
                确认模板并创建设定
              </button>
            </>
          )}
        />
      </div>
      <ConfirmDialog
        isOpen={pendingChannelPresetId !== null}
        title="切换作品频道？"
        description={`你选择的是${SMART_TEMPLATE_PRESETS.find((preset) => preset.id === pendingChannelPresetId)?.channel === 'female' ? '女频' : '男频'}模板。继续后，作品详情里的作品频道也会同步切换。`}
        confirmText="切换频道并选择模板"
        cancelText="取消"
        confirmVariant="primary"
        initialFocus="cancel"
        onClose={() => setPendingChannelPresetId(null)}
        onConfirm={() => {
          const preset = SMART_TEMPLATE_PRESETS.find((item) => item.id === pendingChannelPresetId);
          if (preset?.channel === 'male' || preset?.channel === 'female') {
            onNovelChannelChange(preset.channel);
            applyBuiltIn(preset.id);
          }
          setPendingChannelPresetId(null);
        }}
      />
    </main>
  );
}
