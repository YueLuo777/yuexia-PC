import { useMemo, useState } from 'react';

import {
  addTemplateDomain,
  addTemplateEntry,
  addTemplateField,
  addTemplateGroup,
  addTemplateSection,
  cloneTemplateStructure,
  deleteTemplateNode,
  renameTemplateNode,
  summarizeTemplate,
  type TemplateStructure,
} from '@/features/workbench/model/standardModeTemplateModel';

import { professionalTemplateStructure } from './professionalTemplateHierarchyModel';

function getEntryFields(entry: TemplateStructure[number]['groups'][number]['entries'][number] | undefined) {
  return entry?.sections.flatMap((section) => section.fields) ?? [];
}

function DiyColumnHeader({ level, title }: { level: string; title: string }) {
  return (
    <div className="flex h-12 items-center gap-2 border-b border-slate-200 bg-[#F8FBFC] px-3">
      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-black text-slate-600">{level}</span>
      <strong className="min-w-0 truncate text-sm font-black text-slate-700">{title}</strong>
    </div>
  );
}

function AddRow({
  label,
  value,
  disabled = false,
  onChange,
  onAdd,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="shrink-0 border-t border-slate-200 bg-[#FBFCFD] p-2">
      <div className="flex items-center gap-2">
        <input
          value={value}
          disabled={disabled}
          aria-label={label}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onAdd();
          }}
          placeholder={label}
          className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 text-xs font-semibold outline-none placeholder:text-slate-400 focus:border-[#08AACE] disabled:bg-slate-100"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={onAdd}
          className="h-9 shrink-0 rounded-md bg-[#08AACE] px-3 text-xs font-black text-white hover:bg-[#0798B8] disabled:bg-slate-200 disabled:text-slate-400"
        >
          新增
        </button>
      </div>
    </div>
  );
}

function StructureRow({
  active,
  title,
  countLabel,
  deleteLabel,
  onSelect,
  onDelete,
}: {
  active: boolean;
  title: string;
  countLabel: string;
  deleteLabel: string;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`group flex min-h-12 items-center gap-2 rounded-md px-2 ${active ? 'bg-[#EAF9FD]' : 'hover:bg-slate-50'}`}
    >
      <button type="button" onClick={onSelect} className="min-w-0 flex-1 py-2 text-left">
        <strong className={`block truncate text-sm ${active ? 'text-[#078FAB]' : 'text-slate-700'}`}>{title}</strong>
        <span className="mt-0.5 block text-[11px] font-bold text-slate-400">{countLabel}</span>
      </button>
      <button
        type="button"
        aria-label={deleteLabel}
        onClick={onDelete}
        className="h-7 shrink-0 rounded border border-transparent px-2 text-[11px] font-bold text-slate-400 hover:border-red-200 hover:bg-white hover:text-red-500"
      >
        删除
      </button>
    </div>
  );
}

export function ProfessionalSettingDiyColumnsVariant() {
  const [structure, setStructure] = useState<TemplateStructure>(() =>
    cloneTemplateStructure(professionalTemplateStructure),
  );
  const [domainId, setDomainId] = useState(structure[0]?.id ?? '');
  const domain = structure.find((item) => item.id === domainId) ?? structure[0];
  const [groupId, setGroupId] = useState(domain?.groups[0]?.id ?? '');
  const group = domain?.groups.find((item) => item.id === groupId) ?? domain?.groups[0];
  const [entryId, setEntryId] = useState(group?.entries[0]?.id ?? '');
  const entry = group?.entries.find((item) => item.id === entryId) ?? group?.entries[0];
  const [fieldId, setFieldId] = useState(getEntryFields(entry)[0]?.id ?? '');
  const fields = useMemo(() => getEntryFields(entry), [entry]);
  const [domainName, setDomainName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [entryName, setEntryName] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [feedback, setFeedback] = useState('四级结构都可以新增或删除；删除上级会同时删除其全部下级。');
  const summary = summarizeTemplate(structure);

  const selectDomain = (nextDomainId: string) => {
    const nextDomain = structure.find((item) => item.id === nextDomainId);
    const nextGroup = nextDomain?.groups[0];
    const nextEntry = nextGroup?.entries[0];
    setDomainId(nextDomainId);
    setGroupId(nextGroup?.id ?? '');
    setEntryId(nextEntry?.id ?? '');
    setFieldId(getEntryFields(nextEntry)[0]?.id ?? '');
  };

  const selectGroup = (nextGroupId: string) => {
    const nextGroup = domain?.groups.find((item) => item.id === nextGroupId);
    const nextEntry = nextGroup?.entries[0];
    setGroupId(nextGroupId);
    setEntryId(nextEntry?.id ?? '');
    setFieldId(getEntryFields(nextEntry)[0]?.id ?? '');
  };

  const selectEntry = (nextEntryId: string) => {
    const nextEntry = group?.entries.find((item) => item.id === nextEntryId);
    setEntryId(nextEntryId);
    setFieldId(getEntryFields(nextEntry)[0]?.id ?? '');
  };

  const requireName = (name: string, level: string) => {
    const normalized = name.trim();
    if (!normalized) setFeedback(`请先输入${level}名称。`);
    return normalized;
  };

  const addDomain = () => {
    const name = requireName(domainName, '一级分类');
    if (!name) return;
    const added = addTemplateDomain(structure);
    const next = renameTemplateNode(added.structure, { domainId: added.domain.id }, name);
    setStructure(next);
    setDomainId(added.domain.id);
    setGroupId('');
    setEntryId('');
    setFieldId('');
    setDomainName('');
    setFeedback(`已新增一级分类“${name}”，现在可以继续添加二级分组。`);
  };

  const addGroup = () => {
    const name = requireName(groupName, '二级分组');
    if (!name || !domain) return;
    const added = addTemplateGroup(structure, domain.id);
    const next = renameTemplateNode(added.structure, { domainId: domain.id, groupId: added.group.id }, name);
    setStructure(next);
    setGroupId(added.group.id);
    setEntryId('');
    setFieldId('');
    setGroupName('');
    setFeedback(`已在“${domain.title}”下新增二级分组“${name}”。`);
  };

  const addEntry = () => {
    const name = requireName(entryName, '三级设定');
    if (!name || !domain || !group) return;
    const added = addTemplateEntry(structure, domain.id, group.id);
    const next = renameTemplateNode(
      added.structure,
      { domainId: domain.id, groupId: group.id, entryId: added.entry.id },
      name,
    );
    setStructure(next);
    setEntryId(added.entry.id);
    setFieldId('');
    setEntryName('');
    setFeedback(`已在“${group.title}”下新增三级设定“${name}”。`);
  };

  const addField = () => {
    const name = requireName(fieldName, '四级设定');
    if (!name || !domain || !group || !entry) return;
    let baseStructure = structure;
    let sectionId = entry.sections[0]?.id;
    if (!sectionId) {
      const sectionAdded = addTemplateSection(baseStructure, domain.id, group.id, entry.id);
      baseStructure = sectionAdded.structure;
      sectionId = sectionAdded.section.id;
    }
    const added = addTemplateField(baseStructure, domain.id, group.id, entry.id, sectionId);
    const next = renameTemplateNode(
      added.structure,
      { domainId: domain.id, groupId: group.id, entryId: entry.id, sectionId, fieldId: added.field.id },
      name,
    );
    setStructure(next);
    setFieldId(added.field.id);
    setFieldName('');
    setFeedback(`已在“${entry.title}”下新增四级设定“${name}”。`);
  };

  const deleteDomain = (targetDomainId: string, title: string) => {
    const next = deleteTemplateNode(structure, { domainId: targetDomainId });
    setStructure(next);
    if (targetDomainId === domain?.id) {
      const nextDomain = next[0];
      const nextGroup = nextDomain?.groups[0];
      const nextEntry = nextGroup?.entries[0];
      setDomainId(nextDomain?.id ?? '');
      setGroupId(nextGroup?.id ?? '');
      setEntryId(nextEntry?.id ?? '');
      setFieldId(getEntryFields(nextEntry)[0]?.id ?? '');
    }
    setFeedback(`已删除一级分类“${title}”及其全部下级设定。`);
  };

  const deleteGroup = (targetGroupId: string, title: string) => {
    if (!domain) return;
    const next = deleteTemplateNode(structure, { domainId: domain.id, groupId: targetGroupId });
    setStructure(next);
    if (targetGroupId === group?.id) {
      const nextDomain = next.find((item) => item.id === domain.id);
      const nextGroup = nextDomain?.groups[0];
      const nextEntry = nextGroup?.entries[0];
      setGroupId(nextGroup?.id ?? '');
      setEntryId(nextEntry?.id ?? '');
      setFieldId(getEntryFields(nextEntry)[0]?.id ?? '');
    }
    setFeedback(`已删除二级分组“${title}”及其全部下级设定。`);
  };

  const deleteEntry = (targetEntryId: string, title: string) => {
    if (!domain || !group) return;
    const next = deleteTemplateNode(structure, { domainId: domain.id, groupId: group.id, entryId: targetEntryId });
    setStructure(next);
    if (targetEntryId === entry?.id) {
      const nextDomain = next.find((item) => item.id === domain.id);
      const nextGroup = nextDomain?.groups.find((item) => item.id === group.id);
      const nextEntry = nextGroup?.entries[0];
      setEntryId(nextEntry?.id ?? '');
      setFieldId(getEntryFields(nextEntry)[0]?.id ?? '');
    }
    setFeedback(`已删除三级设定“${title}”及其全部四级设定。`);
  };

  const deleteField = (targetFieldId: string, title: string) => {
    if (!domain || !group || !entry) return;
    const section = entry.sections.find((item) => item.fields.some((field) => field.id === targetFieldId));
    if (!section) return;
    const next = deleteTemplateNode(structure, {
      domainId: domain.id,
      groupId: group.id,
      entryId: entry.id,
      sectionId: section.id,
      fieldId: targetFieldId,
    });
    setStructure(next);
    if (targetFieldId === fieldId) {
      const nextDomain = next.find((item) => item.id === domain.id);
      const nextGroup = nextDomain?.groups.find((item) => item.id === group.id);
      const nextEntry = nextGroup?.entries.find((item) => item.id === entry.id);
      setFieldId(getEntryFields(nextEntry)[0]?.id ?? '');
    }
    setFeedback(`已删除四级设定“${title}”。`);
  };

  const resetStructure = () => {
    const next = cloneTemplateStructure(professionalTemplateStructure);
    const nextDomain = next[0];
    const nextGroup = nextDomain?.groups[0];
    const nextEntry = nextGroup?.entries[0];
    setStructure(next);
    setDomainId(nextDomain?.id ?? '');
    setGroupId(nextGroup?.id ?? '');
    setEntryId(nextEntry?.id ?? '');
    setFieldId(getEntryFields(nextEntry)[0]?.id ?? '');
    setFeedback('已恢复默认完整结构。');
  };

  return (
    <div
      className="flex h-full min-h-0 flex-col bg-[#F5F8FA]"
      data-testid="professional-hierarchy-diy-columns"
      data-domain-count={summary.domainCount}
      data-group-count={summary.groupCount}
      data-entry-count={summary.entryCount}
      data-field-count={summary.fieldCount}
    >
      <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4">
        <div className="min-w-0 truncate text-sm font-bold text-slate-500">
          当前路径：
          <span className="text-[#078FAB]">
            {domain?.title ?? '未选择'} ＞ {group?.title ?? '未选择'} ＞ {entry?.title ?? '未选择'}
          </span>
        </div>
        <span className="shrink-0 text-xs font-semibold text-slate-400">每一级底部均可新增，每一项右侧均可删除</span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[220px_220px_250px_minmax(360px,1fr)] gap-px overflow-hidden bg-slate-200">
        <section className="flex min-h-0 flex-col bg-white" aria-label="DIY一级分类">
          <DiyColumnHeader level="一级" title="设定分类" />
          <div className="editor-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
            {structure.map((item) => (
              <StructureRow
                key={item.id}
                active={item.id === domain?.id}
                title={item.title}
                countLabel={`${item.groups.length} 个二级分组`}
                deleteLabel={`删除一级分类：${item.title}`}
                onSelect={() => selectDomain(item.id)}
                onDelete={() => deleteDomain(item.id, item.title)}
              />
            ))}
          </div>
          <AddRow label="输入一级分类名称" value={domainName} onChange={setDomainName} onAdd={addDomain} />
        </section>

        <section className="flex min-h-0 flex-col bg-white" aria-label="DIY二级分组">
          <DiyColumnHeader level="二级" title={domain?.title ?? '请先选择一级'} />
          <div className="editor-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
            {domain?.groups.map((item) => (
              <StructureRow
                key={item.id}
                active={item.id === group?.id}
                title={item.title}
                countLabel={`${item.entries.length} 个三级设定`}
                deleteLabel={`删除二级分组：${item.title}`}
                onSelect={() => selectGroup(item.id)}
                onDelete={() => deleteGroup(item.id, item.title)}
              />
            ))}
          </div>
          <AddRow
            label="输入二级分组名称"
            value={groupName}
            disabled={!domain}
            onChange={setGroupName}
            onAdd={addGroup}
          />
        </section>

        <section className="flex min-h-0 flex-col bg-white" aria-label="DIY三级设定">
          <DiyColumnHeader level="三级" title={group?.title ?? '请先选择二级'} />
          <div className="editor-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
            {group?.entries.map((item) => (
              <StructureRow
                key={item.id}
                active={item.id === entry?.id}
                title={item.title}
                countLabel={`${getEntryFields(item).length} 个四级设定`}
                deleteLabel={`删除三级设定：${item.title}`}
                onSelect={() => selectEntry(item.id)}
                onDelete={() => deleteEntry(item.id, item.title)}
              />
            ))}
          </div>
          <AddRow
            label="输入三级设定名称"
            value={entryName}
            disabled={!group}
            onChange={setEntryName}
            onAdd={addEntry}
          />
        </section>

        <section className="flex min-h-0 flex-col bg-white" aria-label="DIY四级设定">
          <DiyColumnHeader level="四级" title={entry?.title ?? '请先选择三级'} />
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-2 gap-2">
              {fields.map((item) => (
                <div
                  key={item.id}
                  className={`flex min-h-11 items-center gap-2 rounded-md border px-3 ${item.id === fieldId ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-200 bg-white'}`}
                >
                  <button
                    type="button"
                    onClick={() => setFieldId(item.id)}
                    className="min-w-0 flex-1 truncate text-left text-sm font-bold text-slate-700"
                  >
                    {item.title}
                  </button>
                  <button
                    type="button"
                    aria-label={`删除四级设定：${item.title}`}
                    onClick={() => deleteField(item.id, item.title)}
                    className="h-7 shrink-0 rounded px-2 text-[11px] font-bold text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>
          <AddRow
            label="输入四级设定名称"
            value={fieldName}
            disabled={!entry}
            onChange={setFieldName}
            onAdd={addField}
          />
        </section>
      </div>

      <footer className="flex h-16 shrink-0 items-center justify-between gap-4 border-t border-slate-200 bg-white px-5">
        <div className="min-w-0">
          <div className="text-sm font-black">
            当前结构：{summary.domainCount} 个一级 · {summary.groupCount} 个二级 · {summary.entryCount} 个三级 ·{' '}
            {summary.fieldCount} 个四级
          </div>
          <div className="mt-1 truncate text-xs font-semibold text-[#078FAB]" aria-live="polite">
            {feedback}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={resetStructure}
            className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-500 hover:border-[#9DDFEA] hover:text-[#078FAB]"
          >
            重置默认结构
          </button>
          <button
            type="button"
            onClick={() => setFeedback('当前 DIY 模板结构已确认。')}
            className="h-10 rounded-md bg-[#08AACE] px-5 text-sm font-black text-white hover:bg-[#0798B8]"
          >
            确认DIY结构
          </button>
        </div>
      </footer>
    </div>
  );
}
