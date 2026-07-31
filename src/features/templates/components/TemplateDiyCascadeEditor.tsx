import {
  DiyAddRow,
  DiyDeleteButton,
  DiyEmptyState,
  DiyLockButton,
} from '@/features/templates/components/TemplateDiyEditorPrimitives';
import { getDiyLevelTheme } from '@/features/templates/components/TemplateDiyLevelTheme';
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
  const theme = getDiyLevelTheme(level);
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <h2 className={`text-xs font-black ${theme.text}`}>{title}</h2>
        <DiyLockButton
          level={level}
          locked={controller.lockedLevels[level]}
          onToggle={() => controller.toggleLevelLock(level, title)}
        />
      </div>
      <div className="w-[260px] max-w-full" data-template-name-input-wrap="true">
        <DiyAddRow level={level} disabled={disabled} onAdd={onAdd} compact maxLength={15} />
      </div>
    </div>
  );
}

function CascadeLevelButton({
  level,
  active,
  title,
  count,
  countLabel,
  deleteLabel,
  deleteDisabled,
  onSelect,
  onDelete,
}: {
  level: DiyLevel;
  active: boolean;
  title: string;
  count: number;
  countLabel: string;
  deleteLabel: string;
  deleteDisabled: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const theme = getDiyLevelTheme(level);
  return (
    <div
      className={`relative flex min-h-11 w-[220px] shrink-0 items-center rounded-md border px-1.5 transition-colors ${
        active
          ? `${theme.card} shadow-[0_0_0_1px_currentColor]`
          : theme.cardInactive
      }`}
      data-template-cascade-level-button="true"
      data-template-diy-level={level}
    >
      <button
        type="button"
        aria-label={title}
        aria-pressed={active}
        data-template-cascade-card-select="true"
        onClick={onSelect}
        className={`absolute inset-0 z-0 rounded-md outline-none focus-visible:ring-2 ${theme.focus} focus-visible:ring-offset-1`}
      />
      <div className="pointer-events-none relative z-[1] flex min-w-0 flex-1 items-center justify-between gap-2 px-1.5 py-2 text-left">
        <strong className="truncate text-sm font-black" title={title}>{title}</strong>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black ${
            active ? 'bg-white/80' : `ring-1 ${theme.name}`
          }`}
          aria-label={`${title}包含${count}个${countLabel}`}
        >
          {count}
        </span>
      </div>
      <div className="relative z-10">
        <DiyDeleteButton label={deleteLabel} disabled={deleteDisabled} onClick={onDelete} />
      </div>
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
    <div
      className="editor-scrollbar min-h-0 flex-1 overflow-y-auto bg-white"
      data-template-cascade-scroll="true"
    >
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
              level="domain"
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
              level="group"
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
              level="entry"
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

      <section
        className="bg-white px-4 py-3"
        aria-label="DIY四级设定"
        data-template-fourth-level="true"
      >
        <CascadeLevelHeader
          level="field"
          title={`第四级设定 · 共 ${fields.length} 项`}
          disabled={!entry}
          onAdd={controller.addField}
          controller={controller}
        />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3 pb-4">
          {fields.map((item) => (
            <article
              key={item.id}
              data-template-cascade-field-card="true"
              data-template-diy-level="field"
              className={`relative flex min-h-16 items-center gap-2 rounded-lg border px-3 py-2 shadow-[0_2px_8px_rgba(15,23,42,0.03)] ${
                item.id === fieldId ? getDiyLevelTheme('field').card : getDiyLevelTheme('field').cardInactive
              }`}
            >
              <button
                type="button"
                aria-label={item.title}
                aria-pressed={item.id === fieldId}
                data-template-cascade-card-select="true"
                onClick={() => controller.selectField(item.id)}
                className={`absolute inset-0 z-0 rounded-lg outline-none focus-visible:ring-2 ${getDiyLevelTheme('field').focus} focus-visible:ring-offset-1`}
              />
              <strong className={`pointer-events-none relative z-[1] min-w-0 flex-1 truncate text-sm font-black ${getDiyLevelTheme('field').text}`} title={item.title}>
                {item.title}
              </strong>
              <div className="relative z-10">
                <DiyDeleteButton
                  label={`删除四级设定：${item.title}`}
                  disabled={lockedLevels.field}
                  onClick={() => controller.deleteField(item.id, item.title)}
                />
              </div>
            </article>
          ))}
        </div>
        {entry && fields.length === 0 ? <DiyEmptyState>该设定暂无四级字段。</DiyEmptyState> : null}
      </section>
    </div>
  );
}
