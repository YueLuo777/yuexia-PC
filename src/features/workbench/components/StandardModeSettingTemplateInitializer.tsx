import { useMemo, useState } from 'react';

import {
  SMART_TEMPLATE_PRESETS,
  cloneSmartTemplateStructure,
  recommendTemplateForNovelCategory,
  type BookChannel,
} from '@/features/workbench/model/standardModeSmartSettingFlowModel';
import {
  readSavedSettingTemplates,
  saveSettingTemplate,
  type TemplateStructure,
} from '@/features/workbench/model/standardModeTemplateModel';
import { ManagedTemplateDiyEditor } from '@/features/templates/components/ManagedTemplateDiyEditor';

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

type TemplateListMode = 'male' | 'female' | 'saved';

const CHANNEL_LABELS = {
  male: '男频',
  female: '女频',
  general: '通用',
} as const;

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
  const [templateListMode, setTemplateListMode] = useState<TemplateListMode>(novelChannel);
  const [pendingChannelPresetId, setPendingChannelPresetId] = useState<string | null>(null);
  const visibleBuiltInTemplates = useMemo(
    () => templateListMode === 'saved'
      ? []
      : SMART_TEMPLATE_PRESETS.filter((preset) => preset.channel === templateListMode || preset.channel === 'general'),
    [templateListMode],
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
    setTemplateListMode('saved');
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
      <span className="mt-1.5 flex items-start justify-between gap-2 text-xs font-medium leading-5 text-slate-500">
        <span>{preset.description}</span>
        <span className="shrink-0 rounded-full border border-cyan-200 bg-[#EAF9FD] px-2 py-0.5 text-[10px] font-bold text-[#078FAB]">
          {CHANNEL_LABELS[preset.channel]} · {preset.genreCategory}
        </span>
      </span>
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
              <div className="space-y-2">{visibleBuiltInTemplates.map(renderPresetButton)}</div>
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
