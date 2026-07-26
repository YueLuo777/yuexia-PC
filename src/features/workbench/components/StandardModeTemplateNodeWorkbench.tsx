import { useEffect, useMemo, useState } from 'react';

import type { TemplateNodeTarget, TemplateStructure } from '@/features/workbench/model/standardModeTemplateModel';

export type TemplateMindMapSelection =
  | { kind: 'root' }
  | ({ kind: 'domain' } & Pick<TemplateNodeTarget, 'domainId'>)
  | ({ kind: 'group' } & Required<Pick<TemplateNodeTarget, 'domainId' | 'groupId'>>)
  | ({ kind: 'entry' } & Required<Pick<TemplateNodeTarget, 'domainId' | 'groupId' | 'entryId'>>)
  | ({ kind: 'section' } & Required<Pick<TemplateNodeTarget, 'domainId' | 'groupId' | 'entryId' | 'sectionId'>>)
  | ({ kind: 'field' } & Required<TemplateNodeTarget>);

type NodeWorkbenchProps = {
  structure: TemplateStructure;
  selection: TemplateMindMapSelection;
  onRename: (title: string) => void;
  onAddSibling: (title: string) => void;
  onAddChild: (title: string) => void;
  onDelete: () => void;
};

type SelectedNodeDetails = {
  title: string;
  path: string[];
  siblingLabel: string | null;
  childLabel: string | null;
  childDescription: string;
};

function resolveSelectedNode(structure: TemplateStructure, selection: TemplateMindMapSelection): SelectedNodeDetails {
  if (selection.kind === 'root') {
    return {
      title: '设定', path: ['设定'], siblingLabel: null, childLabel: '新增一级分类',
      childDescription: `当前包含 ${structure.length} 个一级分类`,
    };
  }
  const domain = structure.find((item) => item.id === selection.domainId);
  if (!domain) return resolveSelectedNode(structure, { kind: 'root' });
  if (selection.kind === 'domain') {
    return {
      title: domain.title, path: ['设定', domain.title], siblingLabel: '新建同级设定', childLabel: '新建下级设定',
      childDescription: `当前包含 ${domain.groups.length} 个分组`,
    };
  }
  const group = domain.groups.find((item) => item.id === selection.groupId);
  if (!group) return resolveSelectedNode(structure, { kind: 'domain', domainId: domain.id });
  if (selection.kind === 'group') {
    return {
      title: group.title, path: ['设定', domain.title, group.title], siblingLabel: '新建同级设定', childLabel: '新建下级设定',
      childDescription: `当前包含 ${group.entries.length} 个设定`,
    };
  }
  const entry = group.entries.find((item) => item.id === selection.entryId);
  if (!entry) return resolveSelectedNode(structure, { kind: 'group', domainId: domain.id, groupId: group.id });
  if (selection.kind === 'entry') {
    return {
      title: entry.title, path: ['设定', domain.title, group.title, entry.title], siblingLabel: '新建同级设定', childLabel: '新建内部分类',
      childDescription: `当前包含 ${entry.sections.length} 个内部分类`,
    };
  }
  const section = entry.sections.find((item) => item.id === selection.sectionId);
  if (!section) {
    return resolveSelectedNode(structure, { kind: 'entry', domainId: domain.id, groupId: group.id, entryId: entry.id });
  }
  if (selection.kind === 'section') {
    return {
      title: section.title,
      path: ['设定', domain.title, group.title, entry.title, section.title],
      siblingLabel: '新建同级分类',
      childLabel: '新建子设定',
      childDescription: `当前分类包含 ${section.fields.length} 个子设定`,
    };
  }
  const field = section.fields.find((item) => item.id === selection.fieldId);
  if (!field) {
    return resolveSelectedNode(structure, {
      kind: 'section', domainId: domain.id, groupId: group.id, entryId: entry.id, sectionId: section.id,
    });
  }
  return {
    title: field.title,
    path: ['设定', domain.title, group.title, entry.title, section.title, field.title],
    siblingLabel: '新建同级设定',
    childLabel: null,
    childDescription: '子设定是模板的最后一级',
  };
}

export function StandardModeTemplateNodeWorkbench({
  structure,
  selection,
  onRename,
  onAddSibling,
  onAddChild,
  onDelete,
}: NodeWorkbenchProps) {
  const details = useMemo(() => resolveSelectedNode(structure, selection), [selection, structure]);
  const [newNodeTitle, setNewNodeTitle] = useState('');
  useEffect(() => setNewNodeTitle(''), [selection]);

  const create = (action: (title: string) => void) => {
    const title = newNodeTitle.trim();
    if (!title) return;
    action(title);
    setNewNodeTitle('');
  };

  if (selection.kind === 'root') {
    return (
      <aside aria-label="未选择设定" className="min-h-0 w-[320px] shrink-0 border-l border-slate-200 bg-white" data-testid="template-node-workbench" />
    );
  }

  return (
    <aside className="flex min-h-0 w-[320px] shrink-0 flex-col border-l border-slate-200 bg-white" data-testid="template-node-workbench">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-bold text-slate-800">当前选中：{details.title}</h2>
        <div className="mt-2 break-words text-xs font-semibold leading-5 text-slate-500">{details.path.join(' > ')}</div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">设定名称</span>
          <input
            aria-label="当前节点名称"
            value={details.title}
            maxLength={30}
            onChange={(event) => onRename(event.target.value)}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-[#08AACE]"
          />
        </label>
        <div className="mt-2 text-xs font-semibold text-slate-400">{details.childDescription}</div>
        <div className="mt-6 border-t border-slate-200 pt-5">
          <div className="text-sm font-bold text-slate-700">新建设定</div>
          <input
            aria-label="新节点名称"
            value={newNodeTitle}
            maxLength={30}
            onChange={(event) => setNewNodeTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && details.childLabel) create(onAddChild);
            }}
            placeholder="输入新设定名称"
            className="mt-3 h-10 w-full rounded-md border border-slate-300 px-3 text-sm font-semibold outline-none placeholder:text-xs placeholder:text-slate-400 focus:border-[#08AACE]"
          />
          <div className="mt-3 grid gap-2">
            {details.childLabel ? (
              <button type="button" disabled={!newNodeTitle.trim()} onClick={() => create(onAddChild)} className="h-10 rounded-md bg-[#08AACE] px-4 text-sm font-bold text-white disabled:bg-slate-200">
                {details.childLabel}
              </button>
            ) : null}
            {details.siblingLabel ? (
              <button type="button" disabled={!newNodeTitle.trim()} onClick={() => create(onAddSibling)} className="h-10 rounded-md border border-[#08AACE] bg-white px-4 text-sm font-bold text-[#078FAB] disabled:border-slate-200 disabled:text-slate-300">
                {details.siblingLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 p-5">
        <button type="button" onClick={onDelete} className="h-10 w-full rounded-md border border-red-200 bg-white text-sm font-bold text-red-600 hover:bg-red-50">
          删除设定
        </button>
      </div>
    </aside>
  );
}
