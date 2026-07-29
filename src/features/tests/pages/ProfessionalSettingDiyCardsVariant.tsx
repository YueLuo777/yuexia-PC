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

const LEVELS: DiyLevel[] = ['domain', 'group', 'entry', 'field'];

export function ProfessionalSettingDiyCardsVariant({
  controller,
}: {
  controller: ProfessionalTemplateDiyController;
}) {
  const { structure, domain, group, entry, fieldId, lockedLevels } = controller;
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#F5F8FA]">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4">
        <strong className="mr-2 text-sm font-black text-slate-700">分级删除保护</strong>
        {LEVELS.map((level) => (
          <div key={level} className="flex items-center gap-1 rounded-md border border-slate-100 bg-[#F8FBFC] px-2 py-1">
            <span className="text-[11px] font-black text-slate-500">{DIY_LEVEL_META[level].short}</span>
            <DiyLockButton
              level={level}
              locked={lockedLevels[level]}
              onToggle={() => controller.toggleLevelLock(level, DIY_LEVEL_META[level].title)}
            />
          </div>
        ))}
        <span className="ml-auto text-xs font-semibold text-slate-400">卡片按层向下展开，适合自由拼装局部结构</span>
      </div>

      <div role="region" className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4" aria-label="DIY分层卡片">
        <section className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-[#078FAB]">一级</span>
              <strong className="ml-2 text-sm font-black text-slate-700">选择设定分类</strong>
            </div>
            <div className="w-[310px]"><DiyAddRow level="domain" onAdd={controller.addDomain} compact /></div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {structure.map((item) => (
              <div
                key={item.id}
                className={`flex min-h-16 items-center gap-2 rounded-md border p-2.5 ${
                  item.id === domain?.id ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-200'
                }`}
              >
                <button type="button" onClick={() => controller.selectDomain(item.id)} className="min-w-0 flex-1 text-left">
                  <strong className="block truncate text-sm text-slate-700">{item.title}</strong>
                  <span className="text-[11px] font-bold text-slate-400">{item.groups.length} 个二级分组</span>
                </button>
                <DiyDeleteButton
                  label={`卡片删除一级分类：${item.title}`}
                  disabled={lockedLevels.domain}
                  onClick={() => controller.deleteDomain(item.id, item.title)}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-[#078FAB]">二级</span>
              <strong className="ml-2 text-sm font-black text-slate-700">{domain?.title ?? '请先选择一级分类'}</strong>
            </div>
            <div className="w-[310px]"><DiyAddRow level="group" disabled={!domain} onAdd={controller.addGroup} compact /></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {domain?.groups.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-2 rounded-md border p-2.5 ${
                  item.id === group?.id ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-200'
                }`}
              >
                <button type="button" onClick={() => controller.selectGroup(item.id)} className="min-w-0 flex-1 text-left">
                  <strong className="block truncate text-sm text-slate-700">{item.title}</strong>
                  <span className="text-[11px] font-bold text-slate-400">{item.entries.length} 个三级设定</span>
                </button>
                <DiyDeleteButton
                  label={`卡片删除二级分组：${item.title}`}
                  disabled={lockedLevels.group}
                  onClick={() => controller.deleteGroup(item.id, item.title)}
                />
              </div>
            ))}
            {domain && domain.groups.length === 0 ? <DiyEmptyState>该分类还没有分组。</DiyEmptyState> : null}
          </div>
        </section>

        <div className="mt-3 grid grid-cols-[minmax(330px,0.8fr)_minmax(480px,1.2fr)] gap-3">
          <section className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="mb-3">
              <span className="text-[10px] font-black text-[#078FAB]">三级</span>
              <strong className="ml-2 text-sm font-black text-slate-700">{group?.title ?? '请先选择二级分组'}</strong>
            </div>
            <div className="mb-3"><DiyAddRow level="entry" disabled={!group} onAdd={controller.addEntry} compact /></div>
            <div className="space-y-2">
              {group?.entries.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 rounded-md border p-2.5 ${
                    item.id === entry?.id ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-200'
                  }`}
                >
                  <button type="button" onClick={() => controller.selectEntry(item.id)} className="min-w-0 flex-1 text-left text-sm font-bold text-slate-700">
                    {item.title}
                  </button>
                  <DiyDeleteButton
                    label={`卡片删除三级设定：${item.title}`}
                    disabled={lockedLevels.entry}
                    onClick={() => controller.deleteEntry(item.id, item.title)}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="mb-3">
              <span className="text-[10px] font-black text-[#078FAB]">四级</span>
              <strong className="ml-2 text-sm font-black text-slate-700">{entry?.title ?? '请先选择三级设定'}</strong>
            </div>
            <div className="mb-3"><DiyAddRow level="field" disabled={!entry} onAdd={controller.addField} compact /></div>
            <div className="grid grid-cols-2 gap-2">
              {controller.fields.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 ${
                    item.id === fieldId ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-200'
                  }`}
                >
                  <button type="button" onClick={() => controller.selectField(item.id)} className="min-w-0 flex-1 truncate text-left text-xs font-bold text-slate-700">
                    {item.title}
                  </button>
                  <DiyDeleteButton
                    label={`卡片删除四级设定：${item.title}`}
                    disabled={lockedLevels.field}
                    onClick={() => controller.deleteField(item.id, item.title)}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
