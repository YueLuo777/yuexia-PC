import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import {
  addTemplateDomain,
  addTemplateEntry,
  addTemplateField,
  addTemplateGroup,
  deleteTemplateNode,
  renameTemplateNode,
  summarizeTemplate,
  type TemplateStructure,
} from './standardModeTemplateChoiceTestModel';

type StandardModeSettingTemplateEditorProps = {
  structure: TemplateStructure;
  templateName: string;
  feedback: string;
  onChange: (structure: TemplateStructure) => void;
  onTemplateNameChange: (name: string) => void;
  onReset: () => void;
  onSave: () => void;
  onUse: () => void;
};

function DeleteButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-red-200 bg-white text-red-500 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function EditorStats({ structure }: { structure: TemplateStructure }) {
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

export function StandardModeSettingTemplateEditor({
  structure,
  templateName,
  feedback,
  onChange,
  onTemplateNameChange,
  onReset,
  onSave,
  onUse,
}: StandardModeSettingTemplateEditorProps) {
  const [selectedDomainId, setSelectedDomainId] = useState(() => structure[0]?.id ?? '');
  const [selectedEntryId, setSelectedEntryId] = useState(
    () => structure[0]?.groups[0]?.entries[0]?.id ?? '',
  );

  const selectedDomain = structure.find((domain) => domain.id === selectedDomainId) ?? structure[0];
  const selectedEntry = selectedDomain?.groups
    .flatMap((group) => group.entries)
    .find((entry) => entry.id === selectedEntryId)
    ?? selectedDomain?.groups.flatMap((group) => group.entries)[0];
  const selectedGroup = selectedDomain?.groups.find((group) =>
    group.entries.some((entry) => entry.id === selectedEntry?.id),
  );

  const selectDomain = (domainId: string) => {
    const domain = structure.find((item) => item.id === domainId);
    setSelectedDomainId(domainId);
    setSelectedEntryId(domain?.groups.flatMap((group) => group.entries)[0]?.id ?? '');
  };

  const removeDomain = (domainId: string) => {
    const next = deleteTemplateNode(structure, { domainId });
    onChange(next);
    if (selectedDomain?.id === domainId) {
      setSelectedDomainId(next[0]?.id ?? '');
      setSelectedEntryId(next[0]?.groups.flatMap((group) => group.entries)[0]?.id ?? '');
    }
  };

  const removeGroup = (groupId: string) => {
    if (!selectedDomain) return;
    const next = deleteTemplateNode(structure, { domainId: selectedDomain.id, groupId });
    onChange(next);
    if (selectedGroup?.id === groupId) {
      const domain = next.find((item) => item.id === selectedDomain.id);
      setSelectedEntryId(domain?.groups.flatMap((group) => group.entries)[0]?.id ?? '');
    }
  };

  const removeEntry = (groupId: string, entryId: string) => {
    if (!selectedDomain) return;
    const next = deleteTemplateNode(structure, {
      domainId: selectedDomain.id,
      groupId,
      entryId,
    });
    onChange(next);
    if (selectedEntry?.id === entryId) {
      const domain = next.find((item) => item.id === selectedDomain.id);
      setSelectedEntryId(domain?.groups.flatMap((group) => group.entries)[0]?.id ?? '');
    }
  };

  return (
    <main className="grid min-h-0 flex-1 grid-cols-[270px_390px_minmax(420px,1fr)] bg-white">
      <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-[#F7F9FB]">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <strong className="text-sm">设定分类</strong>
          <button
            type="button"
            onClick={() => {
              const result = addTemplateDomain(structure);
              onChange(result.structure);
              setSelectedDomainId(result.domain.id);
              setSelectedEntryId('');
            }}
            className="h-8 rounded-md border border-[#08AACE] bg-white px-3 text-xs font-bold text-[#078FAB]"
          >
            新增分类
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {structure.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 p-4 text-center text-xs font-semibold text-slate-400">
              暂无设定分类，请点击上方新增。
            </div>
          ) : null}
          {structure.map((domain) => (
            <div
              key={domain.id}
              className={`mb-2 flex min-h-11 items-center gap-2 rounded-md border px-2 ${
                selectedDomain?.id === domain.id
                  ? 'border-[#08AACE] bg-[#EAF9FD]'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <input
                aria-label="设定分类名称"
                value={domain.title}
                onFocus={() => selectDomain(domain.id)}
                onChange={(event) =>
                  onChange(renameTemplateNode(structure, { domainId: domain.id }, event.target.value))
                }
                className="h-8 min-w-0 flex-1 bg-transparent px-1 text-sm font-bold outline-none"
              />
              <DeleteButton label={`删除设定分类：${domain.title}`} onClick={() => removeDomain(domain.id)} />
            </div>
          ))}
        </div>
      </aside>

      <section className="flex min-h-0 flex-col border-r border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <strong className="min-w-0 truncate text-sm">{selectedDomain?.title || '分组与设定'}</strong>
          <button
            type="button"
            disabled={!selectedDomain}
            onClick={() => {
              if (!selectedDomain) return;
              const result = addTemplateGroup(structure, selectedDomain.id);
              onChange(result.structure);
            }}
            className="h-8 rounded-md border border-[#08AACE] bg-white px-3 text-xs font-bold text-[#078FAB] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
          >
            新增分组
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {selectedDomain && selectedDomain.groups.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 p-4 text-center text-xs font-semibold text-slate-400">
              当前分类暂无分组。
            </div>
          ) : null}
          {selectedDomain?.groups.map((group) => (
            <div key={group.id} className="mb-4 rounded-md border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <input
                  aria-label="设定分组名称"
                  value={group.title}
                  onChange={(event) =>
                    onChange(
                      renameTemplateNode(
                        structure,
                        { domainId: selectedDomain.id, groupId: group.id },
                        event.target.value,
                      ),
                    )
                  }
                  className="h-8 min-w-0 flex-1 bg-transparent text-sm font-bold text-[#155E75] outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const result = addTemplateEntry(structure, selectedDomain.id, group.id);
                    onChange(result.structure);
                    setSelectedEntryId(result.entry.id);
                  }}
                  className="h-8 rounded-md border border-[#9DDFEA] bg-[#F2FBFD] px-3 text-xs font-bold text-[#078FAB]"
                >
                  新增设定
                </button>
                <DeleteButton label={`删除设定分组：${group.title}`} onClick={() => removeGroup(group.id)} />
              </div>
              <div className="mt-2 space-y-2">
                {group.entries.length === 0 ? (
                  <div className="py-2 text-center text-xs font-semibold text-slate-400">暂无设定</div>
                ) : null}
                {group.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex min-h-10 items-center gap-2 rounded-md border px-2 ${
                      selectedEntry?.id === entry.id
                        ? 'border-[#2A9FB9] bg-[#F8FDFF]'
                        : 'border-transparent bg-slate-50'
                    }`}
                  >
                    <input
                      aria-label="设定名称"
                      value={entry.title}
                      onFocus={() => setSelectedEntryId(entry.id)}
                      onChange={(event) =>
                        onChange(
                          renameTemplateNode(
                            structure,
                            { domainId: selectedDomain.id, groupId: group.id, entryId: entry.id },
                            event.target.value,
                          ),
                        )
                      }
                      className="h-8 min-w-0 flex-1 bg-transparent px-1 text-xs font-bold outline-none"
                    />
                    <DeleteButton
                      label={`删除设定：${entry.title}`}
                      onClick={() => removeEntry(group.id, entry.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold">{selectedEntry?.title || '子设定'}</h2>
              <div className="mt-2"><EditorStats structure={structure} /></div>
            </div>
            <button
              type="button"
              disabled={!selectedDomain || !selectedGroup || !selectedEntry}
              onClick={() => {
                if (!selectedDomain || !selectedGroup || !selectedEntry) return;
                const result = addTemplateField(
                  structure,
                  selectedDomain.id,
                  selectedGroup.id,
                  selectedEntry.id,
                );
                onChange(result.structure);
              }}
              className="h-8 rounded-md border border-[#08AACE] bg-white px-3 text-xs font-bold text-[#078FAB] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
            >
              新增子设定
            </button>
          </div>
          {!selectedEntry ? (
            <div className="grid min-h-52 place-items-center text-sm font-semibold text-slate-400">
              请先选择或新增一个设定。
            </div>
          ) : null}
          {selectedEntry && selectedEntry.fields.length === 0 ? (
            <div className="mt-4 rounded-md border border-dashed border-slate-300 p-5 text-center text-sm font-semibold text-slate-400">
              当前设定还没有子设定。
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-2 py-4">
            {selectedEntry?.fields.map((field) => (
              <div key={field.id} className="flex min-h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-2">
                <input
                  aria-label="子设定名称"
                  value={field.title}
                  onChange={(event) => {
                    if (!selectedDomain || !selectedGroup) return;
                    onChange(
                      renameTemplateNode(
                        structure,
                        {
                          domainId: selectedDomain.id,
                          groupId: selectedGroup.id,
                          entryId: selectedEntry.id,
                          fieldId: field.id,
                        },
                        event.target.value,
                      ),
                    );
                  }}
                  className="h-8 min-w-0 flex-1 bg-transparent px-1 text-sm font-semibold outline-none"
                />
                <DeleteButton
                  label={`删除子设定：${field.title}`}
                  onClick={() => {
                    if (!selectedDomain || !selectedGroup) return;
                    onChange(
                      deleteTemplateNode(structure, {
                        domainId: selectedDomain.id,
                        groupId: selectedGroup.id,
                        entryId: selectedEntry.id,
                        fieldId: field.id,
                      }),
                    );
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <footer className="grid shrink-0 grid-cols-[minmax(180px,1fr)_auto_auto_auto] items-end gap-3 border-t border-slate-200 p-4">
          <label>
            <span className="mb-1 block text-xs font-bold text-slate-500">模板名称</span>
            <input
              aria-label="模板名称"
              value={templateName}
              onChange={(event) => onTemplateNameChange(event.target.value)}
              placeholder="例如：玄幻精简模板"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-[#08AACE]"
            />
          </label>
          <button
            type="button"
            onClick={onReset}
            className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-600"
          >
            恢复默认模板
          </button>
          <button
            type="button"
            onClick={onSave}
            className="h-10 rounded-md border border-[#08AACE] bg-white px-4 text-sm font-bold text-[#078FAB]"
          >
            保存到我的模板
          </button>
          <button
            type="button"
            onClick={onUse}
            className="h-10 rounded-md bg-[#08AACE] px-5 text-sm font-bold text-white"
          >
            使用当前模板
          </button>
          {feedback ? (
            <span className="col-span-4 text-right text-xs font-semibold text-emerald-600">{feedback}</span>
          ) : null}
        </footer>
      </section>
    </main>
  );
}
