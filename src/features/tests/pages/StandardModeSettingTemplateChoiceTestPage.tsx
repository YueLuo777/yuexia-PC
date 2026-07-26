import { useState } from 'react';

import { StandardModeSettingTemplateEditor } from './StandardModeSettingTemplateEditor';
import {
  DefaultTemplatePanel,
  SavedTemplatesPanel,
} from './StandardModeSettingTemplatePanels';
import {
  buildDefaultTemplateStructure,
  deleteSavedSettingTemplate,
  readSavedSettingTemplates,
  saveSettingTemplate,
  type SavedSettingTemplate,
  type TemplateStructure,
} from './standardModeTemplateChoiceTestModel';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

type TemplateView = 'default' | 'modify' | 'mine';

const VIEW_OPTIONS: Array<{ id: TemplateView; title: string; description: string }> = [
  { id: 'default', title: '默认设定模板', description: '直接使用软件内置的完整设定结构。' },
  { id: 'modify', title: '修改默认模板', description: '改名、新增或删除分类、设定和子设定。' },
  { id: 'mine', title: '我的模板', description: '使用以前保存的设定模板。' },
];

function cloneStructure(structure: TemplateStructure): TemplateStructure {
  return JSON.parse(JSON.stringify(structure)) as TemplateStructure;
}

export function StandardModeSettingTemplateChoiceTestPage() {
  const [view, setView] = useState<TemplateView>('default');
  const [defaultStructure] = useState(buildDefaultTemplateStructure);
  const [draft, setDraft] = useState<TemplateStructure>(() => buildDefaultTemplateStructure());
  const [savedTemplates, setSavedTemplates] = useState(readSavedSettingTemplates);
  const [templateName, setTemplateName] = useState('');
  const [selectedSavedId, setSelectedSavedId] = useState('');
  const [pendingDelete, setPendingDelete] = useState<SavedSettingTemplate | null>(null);
  const [feedback, setFeedback] = useState('');

  const selectedSaved = savedTemplates.find((template) => template.id === selectedSavedId)
    ?? savedTemplates[0]
    ?? null;

  const selectView = (nextView: TemplateView) => {
    setView(nextView);
    setFeedback('');
    if (nextView === 'mine' && !selectedSavedId) setSelectedSavedId(savedTemplates[0]?.id ?? '');
  };

  const useSavedTemplate = (template: SavedSettingTemplate) => {
    setDraft(cloneStructure(template.structure));
    setTemplateName(template.name);
    setFeedback(`已选择“${template.name}”。`);
  };

  return (
    <div
      className="flex h-full min-h-[720px] flex-col bg-[#F5F7F9] text-slate-800"
      data-testid="setting-template-choice-test"
    >
      <header className="shrink-0 border-b border-slate-200 bg-white px-7 py-5">
        <h1 className="text-xl font-bold">新建设定</h1>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {VIEW_OPTIONS.map((option) => {
            const active = option.id === view;
            const suffix = option.id === 'mine' ? `（${savedTemplates.length}）` : '';
            return (
              <button
                key={option.id}
                type="button"
                aria-label={option.title}
                aria-current={active ? 'page' : undefined}
                onClick={() => selectView(option.id)}
                className={`relative min-h-[82px] rounded-md border px-4 py-3 text-left transition-colors ${
                  active
                    ? 'border-[#08AACE] bg-[#EAF9FD] shadow-[0_0_0_1px_#08AACE]'
                    : 'border-slate-200 bg-white hover:border-[#9DDFEA]'
                }`}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-md border-2 border-[#08AACE]"
                  />
                ) : null}
                <strong className={active ? 'text-sm text-[#078FAB]' : 'text-sm text-slate-800'}>
                  {option.title}{suffix}
                </strong>
                <span className="mt-1.5 block text-xs font-medium text-slate-500">{option.description}</span>
              </button>
            );
          })}
        </div>
      </header>

      {view === 'default' ? (
        <DefaultTemplatePanel
          structure={defaultStructure}
          feedback={feedback}
          onUse={() => setFeedback('已选择默认设定模板。')}
        />
      ) : null}

      {view === 'modify' ? (
        <StandardModeSettingTemplateEditor
          structure={draft}
          templateName={templateName}
          feedback={feedback}
          onChange={(next) => {
            setDraft(next);
            setFeedback('');
          }}
          onTemplateNameChange={setTemplateName}
          onReset={() => {
            setDraft(cloneStructure(defaultStructure));
            setFeedback('已恢复默认模板结构。');
          }}
          onSave={() => {
            const name = templateName.trim() || '未命名模板';
            const next = saveSettingTemplate(name, draft);
            setSavedTemplates(next);
            setSelectedSavedId(next[0].id);
            setFeedback(`已保存“${name}”。`);
          }}
          onUse={() => setFeedback('已选择当前修改后的模板。')}
        />
      ) : null}

      {view === 'mine' ? (
        <SavedTemplatesPanel
          templates={savedTemplates}
          selectedTemplate={selectedSaved}
          feedback={feedback}
          onSelect={setSelectedSavedId}
          onUse={useSavedTemplate}
          onDelete={setPendingDelete}
          onModifyDefault={() => selectView('modify')}
        />
      ) : null}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="删除模板？"
        description={pendingDelete ? `删除“${pendingDelete.name}”后将无法继续复用这个模板。` : ''}
        confirmText="删除模板"
        cancelText="保留模板"
        confirmVariant="danger"
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          const next = deleteSavedSettingTemplate(pendingDelete.id);
          setSavedTemplates(next);
          setSelectedSavedId(next[0]?.id ?? '');
          setPendingDelete(null);
          setFeedback('模板已删除。');
        }}
      />
    </div>
  );
}
