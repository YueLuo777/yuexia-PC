import { Trash2 } from 'lucide-react';

import {
  summarizeTemplate,
  type SavedSettingTemplate,
  type TemplateStructure,
} from './standardModeTemplateChoiceTestModel';

export function TemplateStats({ structure }: { structure: TemplateStructure }) {
  const stats = summarizeTemplate(structure);
  return (
    <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
      <span>{stats.domainCount} 个大类</span>
      <span>{stats.groupCount} 个分组</span>
      <span>{stats.entryCount} 个设定</span>
      <span>{stats.fieldCount} 个子设定</span>
    </div>
  );
}

export function DefaultTemplatePanel({
  structure,
  feedback,
  onUse,
}: {
  structure: TemplateStructure;
  feedback: string;
  onUse: () => void;
}) {
  return (
    <main className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
      <section className="mx-auto max-w-[1180px] bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold">默认设定模板</h2>
            <div className="mt-2"><TemplateStats structure={structure} /></div>
          </div>
          <button
            type="button"
            onClick={onUse}
            className="h-10 rounded-md bg-[#08AACE] px-6 text-sm font-bold text-white hover:bg-[#0797B8]"
          >
            使用默认模板
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-8 py-3">
          {structure.map((domain) => (
            <div key={domain.id} className="border-b border-slate-100 py-4">
              <div className="flex items-center justify-between">
                <strong className="text-sm">{domain.title}</strong>
                <span className="text-xs font-semibold text-slate-400">
                  {domain.groups.flatMap((group) => group.entries).length} 个设定
                </span>
              </div>
              <div className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-slate-500">
                {domain.groups.flatMap((group) => group.entries.map((entry) => entry.title)).join('、')}
              </div>
            </div>
          ))}
        </div>
        <div className="pt-4 text-sm font-semibold text-emerald-600">{feedback}</div>
      </section>
    </main>
  );
}

export function SavedTemplatesPanel({
  templates,
  selectedTemplate,
  feedback,
  onSelect,
  onUse,
  onDelete,
  onModifyDefault,
}: {
  templates: SavedSettingTemplate[];
  selectedTemplate: SavedSettingTemplate | null;
  feedback: string;
  onSelect: (id: string) => void;
  onUse: (template: SavedSettingTemplate) => void;
  onDelete: (template: SavedSettingTemplate) => void;
  onModifyDefault: () => void;
}) {
  return (
    <main className="grid min-h-0 flex-1 grid-cols-[320px_minmax(520px,1fr)] bg-white">
      <aside className="min-h-0 overflow-y-auto border-r border-slate-200 bg-[#F7F9FB] p-4">
        <div className="mb-3 text-sm font-bold">我的模板</div>
        {templates.length === 0 ? (
          <div className="border-t border-slate-200 py-6 text-sm font-semibold text-slate-400">
            还没有保存的模板。
          </div>
        ) : (
          templates.map((template) => (
            <button
              key={template.id}
              type="button"
              aria-label={`选择模板：${template.name}`}
              onClick={() => onSelect(template.id)}
              className={`mb-2 w-full rounded-md border px-3 py-3 text-left ${
                selectedTemplate?.id === template.id
                  ? 'border-[#08AACE] bg-[#EAF9FD] shadow-[0_0_0_1px_#08AACE]'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <strong className="block truncate text-sm">{template.name}</strong>
              <span className="mt-1 block text-xs font-medium text-slate-400">{template.updatedAt}</span>
            </button>
          ))
        )}
      </aside>
      <section className="min-h-0 overflow-y-auto p-6">
        {selectedTemplate ? (
          <>
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-bold">{selectedTemplate.name}</h2>
                <div className="mt-2"><TemplateStats structure={selectedTemplate.structure} /></div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onUse(selectedTemplate)}
                  className="h-10 rounded-md bg-[#08AACE] px-5 text-sm font-bold text-white"
                >
                  使用此模板
                </button>
                <button
                  type="button"
                  title="删除模板"
                  aria-label={`删除模板：${selectedTemplate.name}`}
                  onClick={() => onDelete(selectedTemplate)}
                  className="grid h-10 w-10 place-items-center rounded-md border border-red-200 text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 py-3">
              {selectedTemplate.structure.map((domain) => (
                <div key={domain.id} className="border-b border-slate-100 py-4">
                  <strong className="text-sm">{domain.title}</strong>
                  <div className="mt-2 text-xs font-medium leading-5 text-slate-500">
                    {domain.groups
                      .flatMap((group) => group.entries.map((entry) => entry.title))
                      .join('、')}
                  </div>
                </div>
              ))}
            </div>
            {feedback ? <div className="pt-4 text-sm font-semibold text-emerald-600">{feedback}</div> : null}
          </>
        ) : (
          <div className="grid h-full place-items-center">
            <button
              type="button"
              onClick={onModifyDefault}
              className="h-10 rounded-md border border-[#08AACE] bg-white px-5 text-sm font-bold text-[#078FAB]"
            >
              修改默认模板
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
