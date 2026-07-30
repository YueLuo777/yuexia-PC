import { useMemo, useState } from 'react';

import {
  SMART_TEMPLATE_PRESETS,
  cloneSmartTemplateStructure,
  sortSmartTemplatePresetsForDisplay,
  type BookChannel,
  type SmartTemplatePreset,
} from '@/features/workbench/model/standardModeSmartSettingFlowModel';
import {
  readSavedSettingTemplates,
  type TemplateDomainNode,
  type TemplateEntryNode,
  type TemplateGroupNode,
  type TemplateStructure,
} from '@/features/workbench/model/standardModeTemplateModel';

type TemplateListMode = 'male' | 'female' | 'saved';

const CHANNEL_LABELS: Record<BookChannel, string> = {
  male: '男频',
  female: '女频',
  general: '通用',
};

function entryFieldCount(entry?: TemplateEntryNode | null) {
  return entry?.sections.reduce((total, section) => total + section.fields.length, 0) ?? 0;
}

function groupEntryCount(group?: TemplateGroupNode | null) {
  return group?.entries.length ?? 0;
}

function domainEntryCount(domain: TemplateDomainNode) {
  return domain.groups.reduce((total, group) => total + group.entries.length, 0);
}

function structureFieldCount(structure: TemplateStructure) {
  return structure.reduce(
    (domainTotal, domain) => domainTotal + domain.groups.reduce(
      (groupTotal, group) => groupTotal + group.entries.reduce(
        (entryTotal, entry) => entryTotal + entryFieldCount(entry),
        0,
      ),
      0,
    ),
    0,
  );
}

function firstPath(structure: TemplateStructure) {
  const domain = structure[0] ?? null;
  const group = domain?.groups[0] ?? null;
  const entry = group?.entries[0] ?? null;
  return { domainId: domain?.id ?? '', groupId: group?.id ?? '', entryId: entry?.id ?? '' };
}

function TemplateCard({
  preset,
  active,
  onClick,
}: {
  preset: SmartTemplatePreset;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`测试选择模板：${preset.title}`}
      aria-pressed={active}
      onClick={onClick}
      className={`flex min-h-[132px] w-full flex-col rounded-lg border px-4 py-3 text-left transition-colors ${
        active
          ? 'border-[#08AACE] bg-[#EAF9FD] shadow-[0_0_0_1px_#08AACE]'
          : 'border-slate-200 bg-white hover:border-[#9DDFEA]'
      }`}
    >
      <strong className="text-[15px] font-black text-slate-800">{preset.title}</strong>
      <span className="mt-1.5 line-clamp-3 text-xs font-semibold leading-5 text-slate-500">
        {preset.description}
      </span>
      <span className="mt-auto flex justify-end pt-3">
        <span className="rounded-full border border-cyan-200 bg-white/80 px-2.5 py-1 text-[11px] font-bold text-[#078FAB]">
          {CHANNEL_LABELS[preset.channel]} · {preset.genreCategory}
        </span>
      </span>
    </button>
  );
}

function LevelButton({
  title,
  count,
  countLabel,
  active,
  onClick,
}: {
  title: string;
  count: number;
  countLabel: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex min-h-11 min-w-0 items-center justify-between gap-3 rounded-md border px-3 text-left transition-colors ${
        active
          ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAB] shadow-[0_0_0_1px_#08AACE]'
          : 'border-slate-200 bg-white text-slate-600 hover:border-[#9DDFEA] hover:text-[#078FAB]'
      }`}
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
  );
}

export function TemplateManagementCascadeTestPage() {
  const initialPreset = SMART_TEMPLATE_PRESETS.find((preset) => preset.id === 'male-fantasy-xianxia-light')
    ?? SMART_TEMPLATE_PRESETS[0];
  const initialStructure = cloneSmartTemplateStructure(initialPreset.structure);
  const initialPath = firstPath(initialStructure);
  const [listMode, setListMode] = useState<TemplateListMode>('male');
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialPreset.id);
  const [selectedTemplateTitle, setSelectedTemplateTitle] = useState(initialPreset.title);
  const [structure, setStructure] = useState<TemplateStructure>(initialStructure);
  const [activeDomainId, setActiveDomainId] = useState(initialPath.domainId);
  const [activeGroupId, setActiveGroupId] = useState(initialPath.groupId);
  const [activeEntryId, setActiveEntryId] = useState(initialPath.entryId);
  const savedTemplates = useMemo(readSavedSettingTemplates, []);

  const visiblePresets = useMemo(
    () => listMode === 'saved'
      ? []
      : sortSmartTemplatePresetsForDisplay(
          SMART_TEMPLATE_PRESETS.filter((preset) => preset.channel === listMode || preset.channel === 'general'),
        ),
    [listMode],
  );
  const activeDomain = structure.find((domain) => domain.id === activeDomainId) ?? structure[0] ?? null;
  const activeGroup = activeDomain?.groups.find((group) => group.id === activeGroupId)
    ?? activeDomain?.groups[0]
    ?? null;
  const activeEntry = activeGroup?.entries.find((entry) => entry.id === activeEntryId)
    ?? activeGroup?.entries[0]
    ?? null;
  const activeFields = activeEntry?.sections.flatMap((section) => section.fields) ?? [];

  const applyStructure = (id: string, title: string, nextStructure: TemplateStructure) => {
    const cloned = cloneSmartTemplateStructure(nextStructure);
    const path = firstPath(cloned);
    setSelectedTemplateId(id);
    setSelectedTemplateTitle(title);
    setStructure(cloned);
    setActiveDomainId(path.domainId);
    setActiveGroupId(path.groupId);
    setActiveEntryId(path.entryId);
  };

  const selectDomain = (domain: TemplateDomainNode) => {
    const group = domain.groups[0] ?? null;
    setActiveDomainId(domain.id);
    setActiveGroupId(group?.id ?? '');
    setActiveEntryId(group?.entries[0]?.id ?? '');
  };

  const selectGroup = (group: TemplateGroupNode) => {
    setActiveGroupId(group.id);
    setActiveEntryId(group.entries[0]?.id ?? '');
  };

  return (
    <main
      className="flex h-full min-h-[720px] flex-col overflow-hidden bg-[#F5F8FA] text-slate-800"
      data-template-management-cascade-test="true"
    >
      <header className="flex min-h-16 shrink-0 items-center justify-between gap-5 border-b border-slate-200 bg-white px-6 py-3">
        <div className="min-w-0">
          <h1 className="text-lg font-black">模板管理 · 逐级选择方案</h1>
          <p className="mt-1 truncate text-xs font-semibold text-slate-500">
            左侧模板来源保持不变；右侧按一级、二级、三级依次选择，四级设定集中在下方展示。
          </p>
        </div>
        <div className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
          {selectedTemplateTitle} · {structure.length} 个一级 · {structureFieldCount(structure)} 个四级
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[310px_minmax(0,1fr)] overflow-hidden">
        <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-[#F7F9FB] p-4">
          <div role="tablist" aria-label="测试模板来源" className="grid shrink-0 grid-cols-3 rounded-md border border-slate-300 bg-white p-0.5">
            {([
              ['male', '男频'],
              ['female', '女频'],
              ['saved', '我的模板'],
            ] as const).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={listMode === mode}
                onClick={() => setListMode(mode)}
                className={`h-9 rounded text-sm font-bold ${
                  listMode === mode ? 'bg-[#08AACE] text-white' : 'text-slate-600 hover:bg-[#EAF9FD]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="editor-scrollbar mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
            {listMode !== 'saved' ? visiblePresets.map((preset) => (
              <TemplateCard
                key={preset.id}
                preset={preset}
                active={selectedTemplateId === preset.id}
                onClick={() => applyStructure(preset.id, preset.title, preset.structure)}
              />
            )) : savedTemplates.length > 0 ? savedTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => applyStructure(template.id, template.name, template.structure)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-left hover:border-[#9DDFEA]"
              >
                <strong className="block truncate text-sm font-black">{template.name}</strong>
                <span className="mt-1.5 block text-xs font-semibold text-slate-400">最后保存：{template.updatedAt}</span>
              </button>
            )) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-xs font-semibold leading-5 text-slate-400">
                暂无“我的模板”，此处保持正式页面的空状态。
              </div>
            )}
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden" aria-label="逐级模板结构">
          <div className="shrink-0 space-y-3 border-b border-slate-200 bg-white px-5 py-4">
            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <h2 className="text-xs font-black text-slate-500">第一行 · 一级设定</h2>
                <span className="text-[11px] font-semibold text-slate-400">数字表示包含的三级设定数量</span>
              </div>
              <nav aria-label="测试一级设定" className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
                {structure.map((domain) => (
                  <LevelButton
                    key={domain.id}
                    title={domain.title}
                    count={domainEntryCount(domain)}
                    countLabel="三级设定"
                    active={activeDomain?.id === domain.id}
                    onClick={() => selectDomain(domain)}
                  />
                ))}
              </nav>
            </div>

            <div>
              <h2 className="mb-2 text-xs font-black text-slate-500">第二行 · 二级设定</h2>
              <nav aria-label="测试二级设定" className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
                {activeDomain?.groups.map((group) => (
                  <LevelButton
                    key={group.id}
                    title={group.title}
                    count={groupEntryCount(group)}
                    countLabel="三级设定"
                    active={activeGroup?.id === group.id}
                    onClick={() => selectGroup(group)}
                  />
                ))}
              </nav>
            </div>

            <div>
              <h2 className="mb-2 text-xs font-black text-slate-500">第三行 · 三级设定</h2>
              <nav aria-label="测试三级设定" className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-2">
                {activeGroup?.entries.map((entry) => (
                  <LevelButton
                    key={entry.id}
                    title={entry.title}
                    count={entryFieldCount(entry)}
                    countLabel="四级设定"
                    active={activeEntry?.id === entry.id}
                    onClick={() => setActiveEntryId(entry.id)}
                  />
                ))}
              </nav>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-4">
            <div className="mb-3 flex shrink-0 items-end justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-[#078FAB]">
                  {activeDomain?.title} ＞ {activeGroup?.title}
                </div>
                <h2 className="mt-1 text-lg font-black text-slate-800">{activeEntry?.title ?? '暂无三级设定'}</h2>
              </div>
              <span className="text-xs font-bold text-slate-400">第四级设定 · 共 {activeFields.length} 项</span>
            </div>
            <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3 pb-4" aria-label="测试四级设定">
                {activeFields.map((field, index) => (
                  <article key={field.id} className="min-h-28 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
                    <div className="flex items-start justify-between gap-3">
                      <strong className="text-sm font-black text-slate-700">{field.title}</strong>
                      <span className="shrink-0 text-[11px] font-black text-slate-300">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-400">
                      {field.placeholder || '填写该项设定内容；正式版本中保留编辑、启用和删除保护。'}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default TemplateManagementCascadeTestPage;
