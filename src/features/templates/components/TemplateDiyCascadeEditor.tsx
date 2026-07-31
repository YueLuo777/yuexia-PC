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
  readOnly,
}: {
  level: DiyLevel;
  title: string;
  disabled?: boolean;
  onAdd: (value: string) => boolean;
  controller: TemplateDiyController;
  readOnly: boolean;
}) {
  const theme = getDiyLevelTheme(level);
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <h2 className={`text-xs font-black ${theme.text}`}>{title}</h2>
        {!readOnly ? (
          <DiyLockButton
            level={level}
            locked={controller.lockedLevels[level]}
            onToggle={() => controller.toggleLevelLock(level, title)}
          />
        ) : null}
      </div>
      {!readOnly ? (
        <div className="w-[260px] max-w-full" data-template-name-input-wrap="true">
          <DiyAddRow level={level} disabled={disabled} onAdd={onAdd} compact maxLength={15} />
        </div>
      ) : null}
    </div>
  );
}

function CascadeLevelButton({
  level,
  active,
  dimmed,
  title,
  count,
  countLabel,
  deleteLabel,
  deleteDisabled,
  onSelect,
  onDelete,
  readOnly,
}: {
  level: DiyLevel;
  active: boolean;
  dimmed: boolean;
  title: string;
  count: number;
  countLabel: string;
  deleteLabel: string;
  deleteDisabled: boolean;
  onSelect: () => void;
  onDelete: () => void;
  readOnly: boolean;
}) {
  const theme = getDiyLevelTheme(level);
  return (
    <div
      className={`relative flex min-h-11 shrink-0 items-center rounded-md border px-1.5 transition-colors ${
        level === 'domain' ? 'w-[145px]' : 'w-[220px]'
      } ${
        active
          ? `${theme.card} shadow-[0_0_0_1px_currentColor]`
          : dimmed
            ? 'border-slate-200 bg-slate-100 text-slate-400 opacity-70 grayscale hover:border-slate-300 hover:bg-slate-50'
            : theme.cardInactive
      }`}
      data-template-cascade-level-button="true"
      data-template-diy-level={level}
      data-template-selection-state={active ? 'selected' : dimmed ? 'dimmed' : 'available'}
    >
      <button
        type="button"
        aria-label={title}
        aria-pressed={active}
        data-template-cascade-card-select="true"
        onClick={onSelect}
        className={`absolute inset-0 z-0 rounded-md outline-none focus-visible:ring-2 ${theme.focus} focus-visible:ring-offset-1`}
      />
      <div className={`pointer-events-none relative z-[1] flex min-w-0 flex-1 items-center justify-between py-2 text-left ${
        level === 'domain' ? 'gap-1 px-0.5' : 'gap-2 px-1.5'
      }`}>
        <strong className="truncate text-sm font-black" title={title}>{title}</strong>
        <span
          className={`shrink-0 rounded-full py-0.5 text-[11px] font-black ${
            level === 'domain' ? 'px-1.5' : 'px-2'
          } ${
            active
              ? 'bg-white/80'
              : dimmed
                ? 'bg-white/70 text-slate-400 ring-1 ring-slate-200'
                : `ring-1 ${theme.name}`
          }`}
          aria-label={`${title}包含${count}个${countLabel}`}
        >
          {count}
        </span>
      </div>
      {!readOnly ? <div className="relative z-10">
        <DiyDeleteButton
          label={deleteLabel}
          disabled={deleteDisabled}
          onClick={onDelete}
          compact={level === 'domain'}
        />
      </div> : null}
    </div>
  );
}

export function TemplateDiyCascadeEditor({
  controller,
  readOnly = false,
}: {
  controller: TemplateDiyController;
  readOnly?: boolean;
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
          title="一级设定"
          onAdd={controller.addDomain}
          controller={controller}
          readOnly={readOnly}
        />
        <nav aria-label="模板一级设定" className="flex flex-wrap gap-2">
          {structure.map((item) => (
            <CascadeLevelButton
              key={item.id}
              level="domain"
              active={item.id === domain?.id}
              dimmed={Boolean(domain) && item.id !== domain?.id}
              title={item.title}
              count={item.groups.reduce((total, itemGroup) => total + itemGroup.entries.length, 0)}
              countLabel="三级设定"
              deleteLabel={`删除一级分类：${item.title}`}
              deleteDisabled={lockedLevels.domain}
              onSelect={() => controller.selectDomain(item.id)}
              onDelete={() => controller.deleteDomain(item.id, item.title)}
              readOnly={readOnly}
            />
          ))}
        </nav>
        {structure.length === 0 ? <DiyEmptyState>暂无一级分类，请在上方新增。</DiyEmptyState> : null}
      </section>

      <section className="border-b border-slate-200 bg-white px-4 py-3" aria-label="DIY二级分组">
        <CascadeLevelHeader
          level="group"
          title="二级设定"
          disabled={!domain}
          onAdd={controller.addGroup}
          controller={controller}
          readOnly={readOnly}
        />
        <nav aria-label="模板二级设定" className="flex flex-wrap gap-2">
          {domain?.groups.map((item) => (
            <CascadeLevelButton
              key={item.id}
              level="group"
              active={item.id === group?.id}
              dimmed={Boolean(group) && item.id !== group?.id}
              title={item.title}
              count={item.entries.length}
              countLabel="三级设定"
              deleteLabel={`删除二级分组：${item.title}`}
              deleteDisabled={lockedLevels.group}
              onSelect={() => controller.selectGroup(item.id)}
              onDelete={() => controller.deleteGroup(item.id, item.title)}
              readOnly={readOnly}
            />
          ))}
        </nav>
        {domain && domain.groups.length === 0 ? <DiyEmptyState>该分类暂无二级设定。</DiyEmptyState> : null}
      </section>

      <section className="border-b border-slate-200 bg-white px-4 py-3" aria-label="DIY三级设定">
        <CascadeLevelHeader
          level="entry"
          title="三级设定"
          disabled={!group}
          onAdd={controller.addEntry}
          controller={controller}
          readOnly={readOnly}
        />
        <nav aria-label="模板三级设定" className="flex flex-wrap gap-2">
          {group?.entries.map((item) => (
            <CascadeLevelButton
              key={item.id}
              level="entry"
              active={item.id === entry?.id}
              dimmed={Boolean(entry) && item.id !== entry?.id}
              title={item.title}
              count={getDiyEntryFields(item).length}
              countLabel="四级设定"
              deleteLabel={`删除三级设定：${item.title}`}
              deleteDisabled={lockedLevels.entry}
              onSelect={() => controller.selectEntry(item.id)}
              onDelete={() => controller.deleteEntry(item.id, item.title)}
              readOnly={readOnly}
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
          title="四级设定"
          disabled={!entry}
          onAdd={controller.addField}
          controller={controller}
          readOnly={readOnly}
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
              {!readOnly ? <div className="relative z-10">
                <DiyDeleteButton
                  label={`删除四级设定：${item.title}`}
                  disabled={lockedLevels.field}
                  onClick={() => controller.deleteField(item.id, item.title)}
                />
              </div> : null}
            </article>
          ))}
        </div>
        {entry && fields.length === 0 ? <DiyEmptyState>该设定暂无四级字段。</DiyEmptyState> : null}
      </section>
    </div>
  );
}
