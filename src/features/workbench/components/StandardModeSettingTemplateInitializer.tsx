import { useMemo, useState } from 'react';

import {
  SMART_TEMPLATE_PRESETS,
  cloneSmartTemplateStructure,
  getRecommendedTemplatesForNovelCategory,
  recommendTemplateForNovelCategory,
  type BookChannel,
} from '@/features/workbench/model/standardModeSmartSettingFlowModel';
import {
  readSavedSettingTemplates,
  saveSettingTemplate,
  type TemplateStructure,
} from '@/features/workbench/model/standardModeTemplateModel';

import { StandardModeTemplateMindMap } from './StandardModeTemplateMindMap';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

type ConfirmedTemplate = {
  id: string;
  name: string;
  structure: TemplateStructure;
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

const TEMPLATE_CHANNEL_GROUPS = [
  { channel: 'male', title: '男频模板' },
  { channel: 'female', title: '女频模板' },
  { channel: 'general', title: '通用模板' },
] as const;

function formatTargetWordCount(value?: number) {
  if (!Number.isFinite(value) || !value || value <= 0) return '未填写';
  if (value < 10_000) return `${Math.round(value).toLocaleString('zh-CN')}字`;
  const tenThousands = value / 10_000;
  return `${Number.isInteger(tenThousands) ? tenThousands : Number(tenThousands.toFixed(1))}万字`;
}

export function StandardModeSettingTemplateInitializer({
  novelTitle,
  novelCategory,
  novelChannel,
  novelTargetWordCount,
  onConfirm,
  onNovelChannelChange,
  onCancel,
}: StandardModeSettingTemplateInitializerProps) {
  const recommended = useMemo(
    () => recommendTemplateForNovelCategory(novelCategory, novelChannel),
    [novelCategory, novelChannel],
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(recommended.id);
  const [selectedTemplateName, setSelectedTemplateName] = useState(recommended.title);
  const [structure, setStructure] = useState(() => cloneSmartTemplateStructure(recommended.structure));
  const [savedTemplates, setSavedTemplates] = useState(readSavedSettingTemplates);
  const [saveName, setSaveName] = useState(`${novelTitle}模板`);
  const [templateListMode, setTemplateListMode] = useState<'recommended' | 'all'>('recommended');
  const [pendingChannelPresetId, setPendingChannelPresetId] = useState<string | null>(null);
  const recommendedPresets = useMemo(
    () => getRecommendedTemplatesForNovelCategory(novelCategory, novelChannel),
    [novelCategory, novelChannel],
  );

  const applyBuiltIn = (id: string) => {
    const preset = SMART_TEMPLATE_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    setSelectedTemplateId(preset.id);
    setSelectedTemplateName(preset.title);
    setStructure(cloneSmartTemplateStructure(preset.structure));
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
    setSelectedTemplateId(template.id);
    setSelectedTemplateName(template.name);
    setSaveName(template.name);
    setStructure(cloneSmartTemplateStructure(template.structure));
  };

  const saveCurrentTemplate = () => {
    const name = saveName.trim() || '未命名模板';
    const next = saveSettingTemplate(name, structure);
    setSavedTemplates(next);
    setSelectedTemplateId(next[0].id);
    setSelectedTemplateName(name);
  };

  const renderPresetButton = (preset: (typeof SMART_TEMPLATE_PRESETS)[number]) => (
    <button
      key={preset.id}
      type="button"
      aria-label={`选择内置模板：${preset.title}`}
      aria-pressed={selectedTemplateId === preset.id}
      onClick={() => selectBuiltIn(preset.id)}
      className={`w-full rounded-md border px-3 py-3 text-left ${
        selectedTemplateId === preset.id
          ? 'border-[#08AACE] bg-[#EAF9FD] shadow-[0_0_0_1px_#08AACE]'
          : 'border-slate-200 bg-white hover:border-[#9DDFEA]'
      }`}
    >
      <strong className="block text-sm">{preset.title}</strong>
      <span className="mt-1.5 block text-xs font-medium leading-5 text-slate-500">{preset.description}</span>
    </button>
  );

  return (
    <main
      className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden bg-white"
      data-standard-setting-initializer="true"
    >
      <div className="relative z-0 grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)] overflow-hidden">
        <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-[#F7F9FB] p-4">
          <section
            aria-label="模板推荐依据"
            className="mb-3 shrink-0 rounded-md border border-[#B9E8F0] bg-[#F1FBFD] px-3 py-2.5"
          >
            <div className="text-xs font-bold text-[#078FAB]">推荐依据</div>
            <dl className="mt-2 space-y-1.5 text-xs font-semibold">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">作品频道</dt>
                <dd className="truncate text-slate-800">{novelChannel === 'female' ? '女频' : '男频'}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">作品题材</dt>
                <dd className="truncate text-slate-800" title={novelCategory || '未填写'}>{novelCategory || '未填写'}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">预计篇幅</dt>
                <dd className="truncate text-slate-800">{formatTargetWordCount(novelTargetWordCount)}</dd>
              </div>
            </dl>
          </section>
          <div
            role="tablist"
            aria-label="模板分类"
            className="grid shrink-0 grid-cols-2 overflow-hidden rounded-md border border-slate-300 bg-white p-0.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={templateListMode === 'recommended'}
              onClick={() => setTemplateListMode('recommended')}
              className={`h-8 rounded text-xs font-bold ${
                templateListMode === 'recommended' ? 'bg-[#08AACE] text-white' : 'text-slate-600 hover:bg-[#EAF9FD]'
              }`}
            >
              推荐模板
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={templateListMode === 'all'}
              onClick={() => setTemplateListMode('all')}
              className={`h-8 rounded text-xs font-bold ${
                templateListMode === 'all' ? 'bg-[#08AACE] text-white' : 'text-slate-600 hover:bg-[#EAF9FD]'
              }`}
            >
              其他分类模板
            </button>
          </div>
          <div className="editor-scrollbar mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
            {templateListMode === 'recommended' ? (
              <>
                <div className="space-y-2">{recommendedPresets.map(renderPresetButton)}</div>
                <div className="mb-3 mt-6 border-t border-slate-200 pt-4 text-sm font-bold">我的模板</div>
                {savedTemplates.length === 0 ? (
                  <div className="text-xs font-semibold text-slate-400">还没有保存的模板。</div>
                ) : (
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
                            ? 'border-[#08AACE] bg-[#EAF9FD]'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-5">
                {TEMPLATE_CHANNEL_GROUPS.map((group) => (
                  <section key={group.channel} aria-label={group.title}>
                    <div className="mb-2 text-xs font-bold text-slate-500">{group.title}</div>
                    <div className="space-y-4">
                      {Array.from(new Set(
                        SMART_TEMPLATE_PRESETS
                          .filter((preset) => preset.channel === group.channel)
                          .map((preset) => preset.genreCategory),
                      )).map((genreCategory) => (
                        <div key={genreCategory} data-template-genre-category={genreCategory}>
                          <div className="mb-2 border-l-2 border-[#08AACE] pl-2 text-xs font-bold text-slate-700">
                            {genreCategory}
                          </div>
                          <div className="space-y-2">
                            {SMART_TEMPLATE_PRESETS
                              .filter((preset) =>
                                preset.channel === group.channel && preset.genreCategory === genreCategory,
                              )
                              .map(renderPresetButton)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </aside>

        <StandardModeTemplateMindMap
          key={selectedTemplateId}
          structure={structure}
          initialActiveDomainId={structure[0]?.id}
          onChange={setStructure}
          saveName={saveName}
          onSaveNameChange={setSaveName}
          onSaveTemplate={saveCurrentTemplate}
        />
      </div>

      <footer className="relative z-20 flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-5 py-3">
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
          onClick={() => onConfirm({ id: selectedTemplateId, name: selectedTemplateName, structure })}
          className="h-10 rounded-md bg-[#08AACE] px-6 text-sm font-bold text-white"
        >
          确认模板并创建设定
        </button>
      </footer>
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
