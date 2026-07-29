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

export function ProfessionalSettingDiyTreeVariant({
  controller,
}: {
  controller: ProfessionalTemplateDiyController;
}) {
  const { structure, domain, group, entry, fieldId, lockedLevels } = controller;
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[270px_minmax(0,1fr)_330px] gap-px overflow-hidden bg-slate-200">
      <aside className="flex min-h-0 flex-col bg-white" aria-label="树形一级分类">
        <div className="flex h-12 items-center gap-2 border-b border-slate-200 bg-[#F8FBFC] px-3">
          <strong className="text-sm font-black text-slate-700">一级分类目录</strong>
          <DiyLockButton
            level="domain"
            locked={lockedLevels.domain}
            onToggle={() => controller.toggleLevelLock('domain', '设定分类')}
          />
        </div>
        <div className="editor-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
          {structure.map((item) => (
            <div key={item.id} className={`flex items-center rounded-md px-2 ${item.id === domain?.id ? 'bg-[#EAF9FD]' : ''}`}>
              <button type="button" onClick={() => controller.selectDomain(item.id)} className="min-w-0 flex-1 py-3 text-left">
                <strong className="block truncate text-sm text-slate-700">{item.title}</strong>
                <span className="text-[11px] font-bold text-slate-400">{item.groups.length} 个分组</span>
              </button>
              <DiyDeleteButton
                label={`树形删除一级分类：${item.title}`}
                disabled={lockedLevels.domain}
                onClick={() => controller.deleteDomain(item.id, item.title)}
              />
            </div>
          ))}
        </div>
        <DiyAddRow level="domain" onAdd={controller.addDomain} />
      </aside>

      <section className="flex min-h-0 flex-col bg-white" aria-label="可折叠结构树">
        <div className="flex h-12 items-center justify-between border-b border-slate-200 bg-[#F8FBFC] px-4">
          <div>
            <strong className="text-sm font-black text-slate-700">{domain?.title ?? '尚未选择分类'}</strong>
            <span className="ml-2 text-xs font-bold text-slate-400">从二级到四级纵向展开</span>
          </div>
          <div className="flex items-center gap-2">
            {LEVELS.slice(1).map((level) => (
              <div key={level} className="flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5">
                <span className="text-[10px] font-black text-slate-400">{DIY_LEVEL_META[level].short}</span>
                <DiyLockButton
                  level={level}
                  locked={lockedLevels[level]}
                  onToggle={() => controller.toggleLevelLock(level, DIY_LEVEL_META[level].title)}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
          {domain?.groups.map((groupItem) => (
            <div key={groupItem.id} className="mb-3 overflow-hidden rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2">
                <button type="button" onClick={() => controller.selectGroup(groupItem.id)} className="min-w-0 flex-1 text-left">
                  <span className="mr-2 text-[10px] font-black text-slate-400">二级</span>
                  <strong className={groupItem.id === group?.id ? 'text-[#078FAB]' : 'text-slate-700'}>{groupItem.title}</strong>
                </button>
                <DiyDeleteButton
                  label={`树形删除二级分组：${groupItem.title}`}
                  disabled={lockedLevels.group}
                  onClick={() => {
                    controller.selectGroup(groupItem.id);
                    controller.deleteGroup(groupItem.id, groupItem.title);
                  }}
                />
              </div>
              <div className="space-y-2 p-3">
                {groupItem.entries.map((entryItem) => {
                  const fields = getDiyEntryFields(entryItem);
                  return (
                    <div key={entryItem.id} className="rounded-md border border-slate-100 bg-white p-2.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            controller.selectGroup(groupItem.id);
                            controller.selectEntry(entryItem.id);
                          }}
                          className="min-w-0 flex-1 text-left"
                        >
                          <span className="mr-2 text-[10px] font-black text-slate-400">三级</span>
                          <strong className={entryItem.id === entry?.id ? 'text-[#078FAB]' : 'text-slate-700'}>{entryItem.title}</strong>
                        </button>
                        <DiyDeleteButton
                          label={`树形删除三级设定：${entryItem.title}`}
                          disabled={lockedLevels.entry}
                          onClick={() => {
                            controller.deleteEntry(entryItem.id, entryItem.title, groupItem.id);
                          }}
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5 border-l-2 border-[#D9F4F9] pl-3">
                        {fields.map((field) => (
                          <div
                            key={field.id}
                            className={`flex items-center rounded border pl-2 ${
                              field.id === fieldId
                                ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAB]'
                                : 'border-slate-200 text-slate-500'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                controller.selectPath(domain.id, groupItem.id, entryItem.id, field.id);
                              }}
                              className="py-1 text-xs font-bold"
                            >
                              {field.title}
                            </button>
                            <DiyDeleteButton
                              label={`树形删除四级设定：${field.title}`}
                              disabled={lockedLevels.field}
                              onClick={() => {
                            controller.deleteField(field.id, field.title, entryItem.id, groupItem.id);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {!domain ? <DiyEmptyState>请先创建或选择一级分类。</DiyEmptyState> : null}
        </div>
      </section>

      <aside className="flex min-h-0 flex-col gap-3 overflow-y-auto bg-[#F8FBFC] p-4" aria-label="树形快速新增">
        <div>
          <strong className="text-sm font-black text-slate-700">沿当前路径快速新增</strong>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
            当前：{domain?.title ?? '未选'} ＞ {group?.title ?? '未选'} ＞ {entry?.title ?? '未选'}
          </p>
        </div>
        <DiyAddRow level="group" disabled={!domain} onAdd={controller.addGroup} compact />
        <DiyAddRow level="entry" disabled={!group} onAdd={controller.addEntry} compact />
        <DiyAddRow level="field" disabled={!entry} onAdd={controller.addField} compact />
        <div className="rounded-md border border-[#CDEEF4] bg-white p-3 text-xs font-semibold leading-5 text-slate-500">
          树形方案适合一次看清父子关系；锁定控制集中在结构树顶部，不挤占每个节点的内容区域。
        </div>
      </aside>
    </div>
  );
}
