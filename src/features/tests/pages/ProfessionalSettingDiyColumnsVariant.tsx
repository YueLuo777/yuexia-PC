import {
  DiyAddRow,
  DiyDeleteButton,
  DiyEmptyState,
  DiyLevelHeading,
} from './ProfessionalSettingDiyShared';
import {
  getDiyEntryFields,
  type ProfessionalTemplateDiyController,
} from './useProfessionalTemplateDiyController';

function SelectableRow({
  active,
  title,
  countLabel,
  deleteLabel,
  deleteDisabled,
  onSelect,
  onDelete,
}: {
  active: boolean;
  title: string;
  countLabel: string;
  deleteLabel: string;
  deleteDisabled: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`flex min-h-12 items-center gap-2 rounded-md px-2 ${active ? 'bg-[#EAF9FD]' : 'hover:bg-slate-50'}`}>
      <button type="button" onClick={onSelect} className="min-w-0 flex-1 py-2 text-left">
        <strong className={`block truncate text-sm ${active ? 'text-[#078FAB]' : 'text-slate-700'}`}>{title}</strong>
        <span className="mt-0.5 block text-[11px] font-bold text-slate-400">{countLabel}</span>
      </button>
      <DiyDeleteButton label={deleteLabel} disabled={deleteDisabled} onClick={onDelete} />
    </div>
  );
}

export function ProfessionalSettingDiyColumnsVariant({
  controller,
}: {
  controller: ProfessionalTemplateDiyController;
}) {
  const { structure, domain, group, entry, fields, fieldId, lockedLevels } = controller;
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[220px_220px_250px_minmax(360px,1fr)] gap-px overflow-hidden bg-slate-200">
      <section className="flex min-h-0 flex-col bg-white" aria-label="DIY一级分类">
        <DiyLevelHeading level="domain" title="设定分类" controller={controller} />
        <div className="editor-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
          {structure.map((item) => (
            <SelectableRow
              key={item.id}
              active={item.id === domain?.id}
              title={item.title}
              countLabel={`${item.groups.length} 个二级分组`}
              deleteLabel={`删除一级分类：${item.title}`}
              deleteDisabled={lockedLevels.domain}
              onSelect={() => controller.selectDomain(item.id)}
              onDelete={() => controller.deleteDomain(item.id, item.title)}
            />
          ))}
          {structure.length === 0 ? <DiyEmptyState>暂无一级分类，请在下方新增。</DiyEmptyState> : null}
        </div>
        <DiyAddRow level="domain" onAdd={controller.addDomain} />
      </section>

      <section className="flex min-h-0 flex-col bg-white" aria-label="DIY二级分组">
        <DiyLevelHeading level="group" title={domain?.title ?? '请先选择一级'} controller={controller} />
        <div className="editor-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
          {domain?.groups.map((item) => (
            <SelectableRow
              key={item.id}
              active={item.id === group?.id}
              title={item.title}
              countLabel={`${item.entries.length} 个三级设定`}
              deleteLabel={`删除二级分组：${item.title}`}
              deleteDisabled={lockedLevels.group}
              onSelect={() => controller.selectGroup(item.id)}
              onDelete={() => controller.deleteGroup(item.id, item.title)}
            />
          ))}
          {domain && domain.groups.length === 0 ? <DiyEmptyState>该分类暂无二级分组。</DiyEmptyState> : null}
        </div>
        <DiyAddRow level="group" disabled={!domain} onAdd={controller.addGroup} />
      </section>

      <section className="flex min-h-0 flex-col bg-white" aria-label="DIY三级设定">
        <DiyLevelHeading level="entry" title={group?.title ?? '请先选择二级'} controller={controller} />
        <div className="editor-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
          {group?.entries.map((item) => (
            <SelectableRow
              key={item.id}
              active={item.id === entry?.id}
              title={item.title}
              countLabel={`${getDiyEntryFields(item).length} 个四级设定`}
              deleteLabel={`删除三级设定：${item.title}`}
              deleteDisabled={lockedLevels.entry}
              onSelect={() => controller.selectEntry(item.id)}
              onDelete={() => controller.deleteEntry(item.id, item.title)}
            />
          ))}
          {group && group.entries.length === 0 ? <DiyEmptyState>该分组暂无三级设定。</DiyEmptyState> : null}
        </div>
        <DiyAddRow level="entry" disabled={!group} onAdd={controller.addEntry} />
      </section>

      <section className="flex min-h-0 flex-col bg-white" aria-label="DIY四级设定">
        <DiyLevelHeading level="field" title={entry?.title ?? '请先选择三级'} controller={controller} />
        <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 gap-2">
            {fields.map((item) => (
              <div
                key={item.id}
                className={`flex min-h-11 items-center gap-2 rounded-md border px-3 ${
                  item.id === fieldId ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => controller.selectField(item.id)}
                  className="min-w-0 flex-1 truncate text-left text-sm font-bold text-slate-700"
                >
                  {item.title}
                </button>
                <DiyDeleteButton
                  label={`删除四级设定：${item.title}`}
                  disabled={lockedLevels.field}
                  onClick={() => controller.deleteField(item.id, item.title)}
                />
              </div>
            ))}
          </div>
          {entry && fields.length === 0 ? <DiyEmptyState>该设定暂无四级字段。</DiyEmptyState> : null}
        </div>
        <DiyAddRow level="field" disabled={!entry} onAdd={controller.addField} />
      </section>
    </div>
  );
}
