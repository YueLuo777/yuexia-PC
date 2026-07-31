import { useMemo, useState, type ReactNode } from 'react';

import {
  SMART_TEMPLATE_PRESETS,
  cloneSmartTemplateStructure,
  sortSmartTemplatePresetsForDisplay,
} from '@/features/workbench/model/standardModeSmartSettingFlowModel';
import {
  buildDefaultTemplateStructure,
  cloneTemplateStructure,
  deleteSavedSettingTemplate,
  readSavedSettingTemplates,
  saveSettingTemplateById,
  summarizeTemplate,
  type SavedSettingTemplate,
  type SavedTemplateClassification,
  type TemplateStructure,
} from '@/features/workbench/model/standardModeTemplateModel';
import {
  buildDefaultTemplateGenerationBlueprint,
  createDefaultSettingGenerationPromptProfile,
} from '@/features/workbench/model/standardModeTemplateGenerationModel';
import { ManagedTemplateDiyEditor } from '@/features/templates/components/ManagedTemplateDiyEditor';
import {
  TemplateCreateDialog,
  type TemplateCreationChoice,
} from '@/features/templates/components/TemplateCreateDialog';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

type TemplateSource =
  | { kind: 'builtIn'; id: string }
  | { kind: 'saved'; id: string }
  | { kind: 'new' }
  | { kind: 'none' };

type TemplateListMode = 'male' | 'female' | 'saved';

const CHANNEL_LABELS = {
  male: '男频',
  female: '女频',
  general: '通用',
} as const;

function getVisibleBuiltInTemplates(mode: Exclude<TemplateListMode, 'saved'>) {
  return sortSmartTemplatePresetsForDisplay(
    SMART_TEMPLATE_PRESETS.filter((preset) => preset.channel === mode || preset.channel === 'general'),
  );
}

function ensureManagedTemplateDomains(structure: TemplateStructure) {
  const canonicalDomains = buildDefaultTemplateStructure();
  const canonicalTitles = new Set(canonicalDomains.map((domain) => domain.title.trim()));
  return [
    ...canonicalDomains.map((canonical) => {
      const existing = structure.find((domain) => domain.title.trim() === canonical.title.trim());
      return existing ? cloneTemplateStructure([existing])[0] : { ...canonical, groups: [] };
    }),
    ...cloneTemplateStructure(structure).filter((domain) => !canonicalTitles.has(domain.title.trim())),
  ];
}

function getInitialTemplate() {
  const preset = getVisibleBuiltInTemplates('male')[0] ?? SMART_TEMPLATE_PRESETS[0];
  return {
    source: { kind: 'builtIn', id: preset.id } as TemplateSource,
    structure: ensureManagedTemplateDomains(cloneSmartTemplateStructure(preset.structure)),
    saveName: `${preset.title}副本`,
  };
}

function TemplateListButton({
  title,
  description,
  active,
  badge,
  onClick,
  action,
}: {
  title: string;
  description: string;
  active: boolean;
  badge?: string;
  onClick: () => void;
  action?: ReactNode;
}) {
  return (
    <div
      className={`rounded-md border bg-white ${
        active ? 'border-[#08AACE] shadow-[0_0_0_1px_#08AACE]' : 'border-slate-200 hover:border-[#9DDFEA]'
      }`}
    >
      <button
        type="button"
        aria-pressed={active}
        onClick={onClick}
        className="flex min-h-[132px] w-full flex-col px-3 py-3 text-left"
      >
        <strong className="block text-sm leading-5 text-slate-800">{title}</strong>
        <span className="mt-1.5 line-clamp-3 min-w-0 text-xs font-semibold leading-5 text-slate-500">{description}</span>
        <span className="mt-auto flex justify-end pt-3">
          {badge ? (
            <span className="shrink-0 rounded-full border border-cyan-200 bg-[#EAF9FD] px-2 py-0.5 text-[11px] font-bold text-[#078FAB]">
              {badge}
            </span>
          ) : null}
        </span>
      </button>
      {action ? <div className="border-t border-slate-100 px-3 py-2">{action}</div> : null}
    </div>
  );
}

export function TemplateManagePage() {
  const initial = useMemo(getInitialTemplate, []);
  const [listMode, setListMode] = useState<TemplateListMode>('male');
  const [source, setSource] = useState<TemplateSource>(initial.source);
  const [structure, setStructure] = useState<TemplateStructure>(initial.structure);
  const [saveName, setSaveName] = useState(initial.saveName);
  const [savedTemplates, setSavedTemplates] = useState(readSavedSettingTemplates);
  const [pendingDelete, setPendingDelete] = useState<SavedSettingTemplate | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [draftClassification, setDraftClassification] = useState<SavedTemplateClassification>({
    channel: 'male',
    applicability: 'general',
    genreCategory: '通用',
  });
  const [notice, setNotice] = useState('');
  const summary = useMemo(() => summarizeTemplate(structure), [structure]);
  const visibleBuiltInTemplates = useMemo(
    () =>
      listMode === 'saved'
        ? []
        : getVisibleBuiltInTemplates(listMode),
    [listMode],
  );

  const selectBuiltIn = (presetId: string) => {
    const preset = SMART_TEMPLATE_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setSource({ kind: 'builtIn', id: preset.id });
    const nextStructure = ensureManagedTemplateDomains(cloneSmartTemplateStructure(preset.structure));
    setStructure(nextStructure);
    setSaveName('');
    setNotice('内置模板为固定模板，只能查看。');
  };

  const selectSaved = (template: SavedSettingTemplate) => {
    setSource({ kind: 'saved', id: template.id });
    setStructure(cloneTemplateStructure(template.structure));
    setSaveName(template.name);
    setDraftClassification({
      channel: template.channel,
      applicability: template.applicability,
      genreCategory: template.genreCategory,
      ...(template.basePresetId ? { basePresetId: template.basePresetId } : null),
    });
    setNotice('');
  };

  const changeListMode = (nextMode: TemplateListMode) => {
    setListMode(nextMode);
    if (nextMode === 'saved') {
      const firstSavedTemplate = savedTemplates[0];
      if (firstSavedTemplate) selectSaved(firstSavedTemplate);
      else {
        setSource({ kind: 'none' });
        setStructure([]);
        setSaveName('');
        setNotice('还没有我的模板，请先新建。');
      }
      return;
    }
    const firstBuiltInTemplate = getVisibleBuiltInTemplates(nextMode)[0];
    if (firstBuiltInTemplate) selectBuiltIn(firstBuiltInTemplate.id);
  };

  const createTemplate = (choice: TemplateCreationChoice) => {
    setListMode('saved');
    setSource({ kind: 'new' });
    const preset = choice.baseMode === 'preset'
      ? SMART_TEMPLATE_PRESETS.find((item) => item.id === choice.basePresetId)
      : undefined;
    const nextStructure = preset
      ? ensureManagedTemplateDomains(cloneSmartTemplateStructure(preset.structure))
      : [];
    setStructure(nextStructure);
    setSaveName(choice.suggestedName);
    setDraftClassification({
      channel: choice.channel,
      applicability: choice.applicability,
      genreCategory: choice.genreCategory,
      ...(choice.basePresetId ? { basePresetId: choice.basePresetId } : null),
    });
    setCreateDialogOpen(false);
    setNotice(choice.baseMode === 'preset' ? '已基于内置模板创建草稿。' : '空模板草稿已创建。');
  };

  const saveCurrentTemplate = () => {
    const templateId = source.kind === 'saved' ? source.id : null;
    const next = saveSettingTemplateById(
      templateId,
      saveName,
      structure,
      buildDefaultTemplateGenerationBlueprint(structure),
      createDefaultSettingGenerationPromptProfile(),
      draftClassification,
    );
    const saved = next[0];
    setSavedTemplates(next);
    setSource({ kind: 'saved', id: saved.id });
    setSaveName(saved.name);
    setListMode('saved');
    setNotice(`已保存“${saved.name}”`);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const next = deleteSavedSettingTemplate(pendingDelete.id);
    setSavedTemplates(next);
    if (source.kind === 'saved' && source.id === pendingDelete.id) {
      if (next[0]) selectSaved(next[0]);
      else {
        setSource({ kind: 'none' });
        setStructure([]);
        setSaveName('');
        setNotice('模板已删除，可以新建新的模板。');
      }
    }
    setPendingDelete(null);
    setNotice('模板已删除');
  };

  const sourceKey = source.kind === 'new' || source.kind === 'none' ? source.kind : `${source.kind}-${source.id}`;

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-white" data-template-manage-page="true">
      <header className="flex min-h-[72px] shrink-0 items-center justify-between gap-5 border-b border-slate-200 px-5 py-3">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-950">模板管理</h1>
          <p className="mt-1 truncate text-sm font-semibold text-slate-500">
            集中管理作品设定、人物设定、地点地图、势力设定、道具资源、伏笔线索和怪物图鉴模板
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span aria-live="polite" className="w-64 truncate text-right text-xs font-bold text-[#078FAB]" title={notice}>
            {notice}
          </span>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
            {summary.domainCount} 类型 · {summary.entryCount} 设定 · {summary.fieldCount} 字段
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)] overflow-hidden">
        <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-[#F7F9FB] p-4">
          <div role="tablist" aria-label="模板来源" className="grid shrink-0 grid-cols-3 rounded-md border border-slate-300 bg-white p-0.5">
            <button
              type="button"
              role="tab"
              aria-selected={listMode === 'male'}
              onClick={() => changeListMode('male')}
              className={`h-9 rounded text-sm font-bold ${listMode === 'male' ? 'bg-[#08AACE] text-white' : 'text-slate-600 hover:bg-[#EAF9FD]'}`}
            >
              男频
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={listMode === 'female'}
              onClick={() => changeListMode('female')}
              className={`h-9 rounded text-sm font-bold ${listMode === 'female' ? 'bg-[#08AACE] text-white' : 'text-slate-600 hover:bg-[#EAF9FD]'}`}
            >
              女频
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={listMode === 'saved'}
              onClick={() => changeListMode('saved')}
              className={`h-9 rounded text-sm font-bold ${listMode === 'saved' ? 'bg-[#08AACE] text-white' : 'text-slate-600 hover:bg-[#EAF9FD]'}`}
            >
              我的模板
            </button>
          </div>

          {listMode === 'saved' ? (
            <button
              type="button"
              onClick={() => setCreateDialogOpen(true)}
              className="mt-3 h-10 shrink-0 rounded-md bg-[#08AACE] px-4 text-sm font-bold text-white hover:bg-[#0797B8]"
            >
              新建模板
            </button>
          ) : null}

          <div className="editor-scrollbar mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
            {listMode !== 'saved' ? (
              visibleBuiltInTemplates.map((preset) => (
                <TemplateListButton
                  key={preset.id}
                  title={preset.title}
                  description={preset.description}
                  badge={`${CHANNEL_LABELS[preset.channel]} · ${preset.genreCategory}`}
                  active={source.kind === 'builtIn' && source.id === preset.id}
                  onClick={() => selectBuiltIn(preset.id)}
                />
              ))
            ) : savedTemplates.length > 0 ? (
              savedTemplates.map((template) => (
                <TemplateListButton
                  key={template.id}
                  title={template.name}
                  description={`最后保存：${template.updatedAt}`}
                  badge={`${CHANNEL_LABELS[template.channel]} · ${template.applicability === 'general' ? '通用' : template.genreCategory}`}
                  active={source.kind === 'saved' && source.id === template.id}
                  onClick={() => selectSaved(template)}
                  action={
                    <button
                      type="button"
                      onClick={() => setPendingDelete(template)}
                      className="text-xs font-bold text-red-500 hover:text-red-600"
                    >
                      删除模板
                    </button>
                  }
                />
              ))
            ) : (
              <div className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
                <strong className="block text-sm text-slate-600">还没有自定义模板</strong>
                <span className="mt-2 block text-xs font-semibold leading-5 text-slate-400">
                  点击上方“新建模板”，可以创建空模板，也可以基于内置模板扩展。
                </span>
              </div>
            )}
          </div>
        </aside>

        {source.kind === 'none' ? (
          <section className="grid min-h-0 place-items-center bg-white" aria-label="我的模板空状态">
            <div className="max-w-md rounded-xl border border-dashed border-slate-300 bg-slate-50 px-8 py-10 text-center">
              <strong className="block text-base font-black text-slate-700">先新建一个我的模板</strong>
              <span className="mt-2 block text-sm font-semibold leading-6 text-slate-500">
                可以从空模板开始，也可以选择一个内置模板作为基础继续扩展。
              </span>
            </div>
          </section>
        ) : (
          <ManagedTemplateDiyEditor
            key={sourceKey}
            initialStructure={structure}
            onChange={setStructure}
            saveName={saveName}
            onSaveNameChange={setSaveName}
            onSaveTemplate={saveCurrentTemplate}
            readOnly={source.kind === 'builtIn'}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="删除模板？"
        description={`确认删除“${pendingDelete?.name ?? ''}”？删除后无法恢复，内置模板不会受到影响。`}
        confirmText="删除模板"
        cancelText="取消"
        confirmVariant="danger"
        initialFocus="cancel"
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
      <TemplateCreateDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={createTemplate}
      />
    </main>
  );
}
