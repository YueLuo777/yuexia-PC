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
  saveName: string;
  onRename: (title: string) => void;
  onAddSibling: (title: string) => void;
  onAddChild: (title: string) => void;
  onDelete: () => void;
  onSaveNameChange: (title: string) => void;
  onSaveTemplate: () => void;
};

type SelectedNodeDetails = {
  title: string;
  path: string[];
  siblingLabel: string | null;
  childLabel: string | null;
  childDescription: string;
};

type NodeAction = 'rename' | 'sibling' | 'child' | 'delete';

const NODE_ACTION_LABELS: Record<NodeAction, string> = {
  rename: '改名',
  sibling: '新增同级',
  child: '新增下级',
  delete: '删除',
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
      title: domain.title, path: ['设定', domain.title], siblingLabel: '新增同级分类', childLabel: '新增分组',
      childDescription: `当前包含 ${domain.groups.length} 个分组`,
    };
  }
  const group = domain.groups.find((item) => item.id === selection.groupId);
  if (!group) return resolveSelectedNode(structure, { kind: 'domain', domainId: domain.id });
  if (selection.kind === 'group') {
    return {
      title: group.title, path: ['设定', domain.title, group.title], siblingLabel: '新增同级分组', childLabel: '新增设定',
      childDescription: `当前包含 ${group.entries.length} 个设定`,
    };
  }
  const entry = group.entries.find((item) => item.id === selection.entryId);
  if (!entry) return resolveSelectedNode(structure, { kind: 'group', domainId: domain.id, groupId: group.id });
  if (selection.kind === 'entry') {
    return {
      title: entry.title, path: ['设定', domain.title, group.title, entry.title], siblingLabel: '新增同级设定', childLabel: '新增内部分类',
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
      siblingLabel: '新增同级分类',
      childLabel: '新增子设定',
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
    siblingLabel: '新增同级子设定',
    childLabel: null,
    childDescription: '子设定是模板的最后一级',
  };
}

export function StandardModeTemplateNodeWorkbench({
  structure,
  selection,
  saveName,
  onRename,
  onAddSibling,
  onAddChild,
  onDelete,
  onSaveNameChange,
  onSaveTemplate,
}: NodeWorkbenchProps) {
  const details = useMemo(() => resolveSelectedNode(structure, selection), [selection, structure]);
  const [action, setAction] = useState<NodeAction>('rename');
  const [actionValue, setActionValue] = useState(details.title);
  const availableActions = useMemo<NodeAction[]>(
    () => details.childLabel
      ? ['rename', 'sibling', 'child', 'delete']
      : ['rename', 'sibling', 'delete'],
    [details.childLabel],
  );

  useEffect(() => {
    setAction('rename');
    setActionValue(details.title);
  }, [details.title, selection]);

  const selectAction = (nextAction: NodeAction) => {
    setAction(nextAction);
    setActionValue(nextAction === 'rename' ? details.title : '');
  };

  const submitAction = () => {
    const title = actionValue.trim();
    if (!title) return;
    if (action === 'rename') onRename(title);
    if (action === 'sibling') onAddSibling(title);
    if (action === 'child') onAddChild(title);
  };

  const actionTitle = action === 'rename'
    ? '改名'
    : action === 'sibling'
      ? details.siblingLabel
      : details.childLabel;

  return (
    <aside
      aria-label={selection.kind === 'root' ? '未选择设定' : undefined}
      className="grid min-h-0 w-[390px] shrink-0 grid-rows-[minmax(0,1fr)_auto] border-l border-slate-200 bg-white"
      data-testid="template-node-workbench"
    >
      <section aria-label="设定操作" className="flex min-h-0 flex-col overflow-hidden">
        {selection.kind === 'root' ? null : (
          <>
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-sm font-bold text-slate-800">当前选中：{details.title}</h2>
              <div className="mt-2 break-words text-xs font-semibold leading-5 text-slate-500">{details.path.join(' > ')}</div>
              <div className="mt-1 text-xs font-semibold text-slate-400">{details.childDescription}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b border-slate-200 px-5 py-4">
              {availableActions.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={action === item}
                  onClick={() => selectAction(item)}
                  className={`h-10 min-w-0 rounded-md border text-sm font-bold ${
                    action === item
                      ? item === 'delete'
                        ? 'border-red-300 bg-red-50 text-red-600'
                        : 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAB]'
                      : 'border-slate-300 bg-white text-slate-500 hover:border-[#9DDFEA] hover:text-[#078FAB]'
                  }`}
                >
                  {NODE_ACTION_LABELS[item]}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              {action === 'delete' ? (
                <section>
                  <h3 className="text-sm font-bold text-red-600">删除“{details.title}”？</h3>
                  <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                    该节点下的全部内容也会被删除。点击继续后，还需要进行二次确认。
                  </p>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="mt-5 h-10 w-full rounded-md border border-red-300 bg-white text-sm font-bold text-red-600 hover:bg-red-50"
                  >
                    继续删除
                  </button>
                </section>
              ) : (
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">{actionTitle}</span>
                  <input
                    aria-label={action === 'rename' ? '当前节点名称' : '新节点名称'}
                    value={actionValue}
                    maxLength={30}
                    onChange={(event) => setActionValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') submitAction();
                    }}
                    placeholder={action === 'rename' ? '输入新名称' : `输入${actionTitle ?? '新设定'}名称`}
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold outline-none placeholder:text-xs placeholder:text-slate-400 focus:border-[#08AACE] focus:ring-2 focus:ring-[#DDF7FB]"
                  />
                  <button
                    type="button"
                    disabled={!actionValue.trim()}
                    onClick={submitAction}
                    className="mt-3 h-10 w-full rounded-md bg-[#08AACE] px-4 text-sm font-bold text-white disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    确认{NODE_ACTION_LABELS[action]}
                  </button>
                </label>
              )}
            </div>
          </>
        )}
      </section>
      <section aria-label="保存模板" className="border-t border-slate-300 bg-[#F7F9FB] px-5 py-4">
        <h2 className="text-sm font-bold text-slate-800">保存模板</h2>
        <label className="mt-3 block">
          <span className="mb-2 block text-xs font-bold text-slate-500">模板名称</span>
          <input
            aria-label="保存模板名称"
            value={saveName}
            maxLength={30}
            onChange={(event) => onSaveNameChange(event.target.value)}
            placeholder="输入模板名称"
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-[#08AACE]"
          />
        </label>
        <button
          type="button"
          onClick={onSaveTemplate}
          className="mt-3 h-10 w-full rounded-md border border-[#08AACE] bg-white text-sm font-bold text-[#078FAB] hover:bg-[#EAF9FD]"
        >
          保存到我的模板
        </button>
      </section>
    </aside>
  );
}
