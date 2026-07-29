import {
  DIY_LEVEL_META,
  DiyAddRow,
  DiyDeleteButton,
  DiyEmptyState,
  DiyLockButton,
} from './ProfessionalSettingDiyShared';
import {
  getDiyEntryFields,
  type DiyLevel,
  type ProfessionalTemplateDiyController,
} from './useProfessionalTemplateDiyController';
import type {
  TemplateDomainNode,
  TemplateEntryNode,
  TemplateFieldNode,
  TemplateGroupNode,
} from '@/features/workbench/model/standardModeTemplateModel';

const LEVELS: DiyLevel[] = ['domain', 'group', 'entry', 'field'];
type DiyPathItem = {
  domain: TemplateDomainNode;
  group: TemplateGroupNode;
  entry: TemplateEntryNode;
  field: TemplateFieldNode | undefined;
};

export function ProfessionalSettingDiyPathVariant({
  controller,
}: {
  controller: ProfessionalTemplateDiyController;
}) {
  const { structure, domain, group, entry, fieldId, lockedLevels } = controller;
  const paths: DiyPathItem[] = [];
  structure.forEach((domainItem) => {
    domainItem.groups.forEach((groupItem) => {
      groupItem.entries.forEach((entryItem) => {
        const fields = getDiyEntryFields(entryItem);
        if (fields.length === 0) {
          paths.push({ domain: domainItem, group: groupItem, entry: entryItem, field: undefined });
          return;
        }
        fields.forEach((field) => paths.push({ domain: domainItem, group: groupItem, entry: entryItem, field }));
      });
    });
  });
  paths.sort((left, right) => {
    const leftSelected = left.domain.id === domain?.id && left.group.id === group?.id
      && left.entry.id === entry?.id && (left.field?.id ?? '') === fieldId;
    const rightSelected = right.domain.id === domain?.id && right.group.id === group?.id
      && right.entry.id === entry?.id && (right.field?.id ?? '') === fieldId;
    return Number(rightSelected) - Number(leftSelected);
  });
  const selectedTitles: Record<DiyLevel, string> = {
    domain: domain?.title ?? '未选择一级分类',
    group: group?.title ?? '未选择二级分组',
    entry: entry?.title ?? '未选择三级设定',
    field: controller.fields.find((item) => item.id === fieldId)?.title ?? '未选择四级字段',
  };
  const addActions = {
    domain: controller.addDomain,
    group: controller.addGroup,
    entry: controller.addEntry,
    field: controller.addField,
  };
  const addDisabled = { domain: false, group: !domain, entry: !group, field: !entry };

  const deleteSelected = (level: DiyLevel) => {
    if (level === 'domain' && domain) controller.deleteDomain(domain.id, domain.title);
    if (level === 'group' && group) controller.deleteGroup(group.id, group.title);
    if (level === 'entry' && entry) controller.deleteEntry(entry.id, entry.title);
    const field = controller.fields.find((item) => item.id === fieldId);
    if (level === 'field' && field) controller.deleteField(field.id, field.title);
  };

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(620px,1.35fr)_minmax(440px,0.65fr)] gap-px overflow-hidden bg-slate-200">
      <section className="flex min-h-0 flex-col bg-white" aria-label="DIY完整路径清单">
        <div className="flex h-12 items-center justify-between border-b border-slate-200 bg-[#F8FBFC] px-4">
          <div>
            <strong className="text-sm font-black text-slate-700">完整路径清单</strong>
            <span className="ml-2 text-xs font-semibold text-slate-400">直接比较所有四级归属</span>
          </div>
          <span className="rounded bg-white px-2 py-1 text-xs font-black text-[#078FAB]">{paths.length} 条路径</span>
        </div>
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr] border-b border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-400">
          <span>一级分类</span><span>二级分组</span><span>三级设定</span><span>四级字段</span>
        </div>
        <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
          {paths.map((path) => {
            const active = path.domain.id === domain?.id && path.group.id === group?.id
              && path.entry.id === entry?.id && (path.field?.id ?? '') === fieldId;
            return (
              <button
                type="button"
                key={`${path.entry.id}:${path.field?.id ?? 'empty'}`}
                onClick={() => controller.selectPath(path.domain.id, path.group.id, path.entry.id, path.field?.id)}
                className={`mb-1 grid w-full grid-cols-[1fr_1fr_1fr_1fr] rounded-md border px-3 py-2 text-left text-xs font-bold ${
                  active ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAB]' : 'border-transparent text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="truncate pr-3">{path.domain.title}</span>
                <span className="truncate pr-3">{path.group.title}</span>
                <span className="truncate pr-3">{path.entry.title}</span>
                <span className="truncate">{path.field?.title ?? '暂无字段'}</span>
              </button>
            );
          })}
          {paths.length === 0 ? <DiyEmptyState>当前还没有可显示的完整路径。</DiyEmptyState> : null}
        </div>
      </section>

      <aside className="editor-scrollbar min-h-0 overflow-y-auto bg-[#F8FBFC] p-4" aria-label="DIY路径节点工作台">
        <div className="mb-3">
          <strong className="text-sm font-black text-slate-700">当前路径工作台</strong>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">选中左侧任一路径，在这里逐级新增、保护或删除。</p>
        </div>
        <div className="space-y-3">
          {LEVELS.map((level) => {
            const meta = DIY_LEVEL_META[level];
            const missing = level === 'domain' ? !domain : level === 'group' ? !group : level === 'entry' ? !entry : !fieldId;
            return (
              <section key={level} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">{meta.short}</span>
                  <strong className="min-w-0 flex-1 truncate text-sm font-black text-slate-700">{selectedTitles[level]}</strong>
                  <DiyLockButton
                    level={level}
                    locked={lockedLevels[level]}
                    onToggle={() => controller.toggleLevelLock(level, meta.title)}
                  />
                  <DiyDeleteButton
                    label={`路径工作台删除${meta.title}：${selectedTitles[level]}`}
                    disabled={lockedLevels[level] || missing}
                    onClick={() => deleteSelected(level)}
                  />
                </div>
                <DiyAddRow level={level} disabled={addDisabled[level]} onAdd={addActions[level]} compact />
              </section>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
