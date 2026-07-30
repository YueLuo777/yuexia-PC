import {
  DiyAddRow,
  DiyDeleteButton,
  DiyEmptyState,
  DiyLockButton,
} from '@/features/templates/components/TemplateDiyEditorPrimitives';
import {
  getDiyEntryFields,
  type DiyLevel,
  type TemplateDiyController,
} from '@/features/templates/hooks/useTemplateDiyController';

function CascadeLevelHeader({
  level,
  title,
  disabled = false,
  onAdd,
  controller,
}: {
  level: DiyLevel;
  title: string;
  disabled?: boolean;
  onAdd: (value: string) => boolean;
  controller: TemplateDiyController;
}) {
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-black text-slate-500">{title}</h2>
        <DiyLockButton
          level={level}
          locked={controller.lockedLevels[level]}
          onToggle={() => controller.toggleLevelLock(level, title)}
        />
      </div>
      <div className="w-[360px] max-w-full">
        <DiyAddRow level={level} disabled={disabled} onAdd={onAdd} compact />
      </div>
    </div>
  );
}

function CascadeLevelButton({
  active,
  title,
  count,
  countLabel,
  deleteLabel,
  deleteDisabled,
  onSelect,
  onDelete,
}: {
  active: boolean;
  title: string;
  count: number;
  countLabel: string;
  deleteLabel: string;
  deleteDisabled: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`flex min-h-11 w-[220px] shrink-0 items-center rounded-md border px-1.5 transition-colors ${
        active
          ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAB] shadow-[0_0_0_1px_#08AACE]'
          : 'border-slate-200 bg-white text-slate-600 hover:border-[#9DDFEA]'
      }`}
      data-template-cascade-level-button="true"
    >
      <button
        type="button"
        aria-label={title}
        aria-pressed={active}
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center justify-between gap-2 px-1.5 py-2 text-left"
      >
        <strong className="truncate text-sm font-black" title={title}>{title}</strong>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black ${
            active ? 'bg-white text-[#078FAB]' : 'bg-slate-100 text-slate-500'
          }`}
          aria-label={`${title}包含${count}个${countLabel}`}
        >
          {count}
        </span>
      </button>
      <DiyDeleteButton label={deleteLabel} disabled={deleteDisabled} onClick={onDelete} />
    </div>
  );
}

export function TemplateDiyCascadeEditor({
  controller,
}: {
  controller: TemplateDiyController;
}) {
  const { structure, domain, group, entry, fields, fieldId, lockedLevels } = controller;

  return (
    <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto bg-[#F5F8FA]">
      <section className="border-b border-slate-200 bg-white px-4 py-3" aria-label="DIY一级分类">
        <CascadeLevelHeader
          level="domain"
          title="第一行 · 一级设定"
          onAdd={controller.addDomain}
          controller={controller}
        />
        <nav aria-label="模板一级设定" className="flex flex-wrap gap-2">
          {structure.map((item) => (
            <CascadeLevelButton
              key={item.id}
              active={item.id === domain?.id}
              title={item.title}
              count={item.groups.reduce((total, itemGroup) => total + itemGroup.entries.length, 0)}
              countLabel="三级设定"
              deleteLabel={`删除一级分类：${item.title}`}
              deleteDisabled={lockedLevels.domain}
              onSelect={() => controller.selectDomain(item.id)}
              onDelete={() => controller.deleteDomain(item.id, item.title)}
            />
          ))}
        </nav>
        {structure.length === 0 ? <DiyEmptyState>暂无一级分类，请在上方新增。</DiyEmptyState> : null}
      </section>

      <section className="border-b border-slate-200 bg-white px-4 py-3" aria-label="DIY二级分组">
        <CascadeLevelHeader
          level="group"
          title="第二行 · 二级设定"
          disabled={!domain}
          onAdd={controller.addGroup}
          controller={controller}
        />
        <nav aria-label="模板二级设定" className="flex flex-wrap gap-2">
          {domain?.groups.map((item) => (
            <CascadeLevelButton
              key={item.id}
              active={item.id === group?.id}
              title={item.title}
              count={item.entries.length}
              countLabel="三级设定"
              deleteLabel={`删除二级分组：${item.title}`}
              deleteDisabled={lockedLevels.group}
              onSelect={() => controller.selectGroup(item.id)}
              onDelete={() => controller.deleteGroup(item.id, item.title)}
            />
          ))}
        </nav>
        {domain && domain.groups.length === 0 ? <DiyEmptyState>该分类暂无二级设定。</DiyEmptyState> : null}
      </section>

      <section className="border-b border-slate-200 bg-white px-4 py-3" aria-label="DIY三级设定">
        <CascadeLevelHeader
          level="entry"
          title="第三行 · 三级设定"
          disabled={!group}
          onAdd={controller.addEntry}
          controller={controller}
        />
        <nav aria-label="模板三级设定" className="flex flex-wrap gap-2">
          {group?.entries.map((item) => (
            <CascadeLevelButton
              key={item.id}
              active={item.id === entry?.id}
              title={item.title}
              count={getDiyEntryFields(item).length}
              countLabel="四级设定"
              deleteLabel={`删除三级设定：${item.title}`}
              deleteDisabled={lockedLevels.entry}
              onSelect={() => controller.selectEntry(item.id)}
              onDelete={() => controller.deleteEntry(item.id, item.title)}
            />
          ))}
        </nav>
        {group && group.entries.length === 0 ? <DiyEmptyState>该分组暂无三级设定。</DiyEmptyState> : null}
      </section>

      <section className="bg-[#F5F8FA] px-4 py-3" aria-label="DIY四级设定">
        <CascadeLevelHeader
          level="field"
          title={`第四级设定 · 共 ${fields.length} 项`}
          disabled={!entry}
          onAdd={controller.addField}
          controller={controller}
        />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3 pb-4">
          {fields.map((item, index) => (
            <article
              key={item.id}
              className={`flex min-h-16 items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-[0_2px_8px_rgba(15,23,42,0.03)] ${
                item.id === fieldId ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-200'
              }`}
            >
              <button
                type="button"
                aria-label={item.title}
                aria-pressed={item.id === fieldId}
                onClick={() => controller.selectField(item.id)}
                className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
              >
                <strong className="truncate text-sm font-black text-slate-700" title={item.title}>{item.title}</strong>
                <span className="shrink-0 text-[11px] font-black text-slate-300">{String(index + 1).padStart(2, '0')}</span>
              </button>
              <DiyDeleteButton
                label={`删除四级设定：${item.title}`}
                disabled={lockedLevels.field}
                onClick={() => controller.deleteField(item.id, item.title)}
              />
            </article>
          ))}
        </div>
        {entry && fields.length === 0 ? <DiyEmptyState>该设定暂无四级字段。</DiyEmptyState> : null}
      </section>
    </div>
  );
}
