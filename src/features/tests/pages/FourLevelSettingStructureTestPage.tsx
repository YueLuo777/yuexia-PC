import { useMemo, useState } from 'react';

import { SMART_TEMPLATE_PRESETS } from '@/features/workbench/model/standardModeSmartSettingFlowModel';
import type {
  TemplateDomainNode,
  TemplateEntryNode,
  TemplateFieldNode,
  TemplateGroupNode,
} from '@/features/workbench/model/standardModeTemplateModel';

const fantasyTemplate = SMART_TEMPLATE_PRESETS.find((preset) => preset.id === 'male-fantasy-xianxia');
const templateStructure = fantasyTemplate?.structure ?? [];

type SelectedNode = {
  id: string;
  title: string;
  path: string;
};

function getFirstGroup(domain?: TemplateDomainNode) {
  return domain?.groups[0] ?? null;
}

function flattenEntryFields(entry: TemplateEntryNode) {
  return entry.sections.flatMap((section) => section.fields);
}

function EntryRows({
  domain,
  group,
  entry,
  rowIndex,
  selectedId,
  onSelect,
}: {
  domain: TemplateDomainNode;
  group: TemplateGroupNode;
  entry: TemplateEntryNode;
  rowIndex: number;
  selectedId: string;
  onSelect: (node: SelectedNode) => void;
}) {
  const fields = flattenEntryFields(entry);
  const entrySelected = selectedId === entry.id;

  const selectEntry = () => onSelect({
    id: entry.id,
    title: entry.title,
    path: `${domain.title} ＞ ${group.title} ＞ ${entry.title}`,
  });

  const selectField = (field: TemplateFieldNode) => onSelect({
    id: field.id,
    title: field.title,
    path: `${domain.title} ＞ ${group.title} ＞ ${entry.title} ＞ ${field.title}`,
  });

  return (
    <article
      className="overflow-hidden rounded-lg border border-[#D9E5E9] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.035)]"
      data-four-level-entry={entry.title}
    >
      <div
        className="grid min-h-12 grid-cols-[72px_minmax(0,1fr)] items-stretch border-b border-[#D9E5E9] bg-[#F6FBFC]"
        data-four-level-display-row={rowIndex}
      >
        <span className="grid place-items-center border-r border-[#D9E5E9] text-xs font-bold text-slate-400">
          第{rowIndex}行
        </span>
        <button
          type="button"
          aria-label={entry.title}
          aria-pressed={entrySelected}
          onClick={selectEntry}
          className={`flex min-w-0 items-center justify-between gap-4 px-5 text-left transition-colors ${
            entrySelected ? 'bg-[#EAF9FD] text-[#078FAB]' : 'text-slate-800 hover:bg-[#F1FBFD]'
          }`}
        >
          <strong className="truncate text-[15px] font-black">{entry.title}</strong>
          <span className="shrink-0 text-xs font-bold text-slate-400">{fields.length} 项四级设定</span>
        </button>
      </div>

      <div
        className="grid min-h-[76px] grid-cols-[72px_minmax(0,1fr)] items-stretch bg-white"
        data-four-level-display-row={rowIndex + 1}
      >
        <span className="grid place-items-center border-r border-[#E5ECEF] text-xs font-bold text-slate-400">
          第{rowIndex + 1}行
        </span>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(168px,1fr))] gap-2 p-3">
          {fields.map((field) => {
            const selected = selectedId === field.id;
            return (
              <button
                key={field.id}
                type="button"
                aria-pressed={selected}
                title={field.title}
                onClick={() => selectField(field)}
                className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm font-bold leading-5 transition-colors ${
                  selected
                    ? 'border-[#078FAE] bg-[#EAF9FD] text-[#078FAB] shadow-[0_0_0_1px_#078FAE]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#8FD8E7] hover:bg-[#F7FCFD] hover:text-[#078FAB]'
                }`}
              >
                {field.title}
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}

export function FourLevelSettingStructureTestPage() {
  const initialDomain = templateStructure[0];
  const [activeDomainId, setActiveDomainId] = useState(initialDomain?.id ?? '');
  const [activeGroupId, setActiveGroupId] = useState(getFirstGroup(initialDomain)?.id ?? '');
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);

  const activeDomain = useMemo(
    () => templateStructure.find((domain) => domain.id === activeDomainId) ?? templateStructure[0] ?? null,
    [activeDomainId],
  );
  const activeGroup = useMemo(
    () => activeDomain?.groups.find((group) => group.id === activeGroupId) ?? getFirstGroup(activeDomain),
    [activeDomain, activeGroupId],
  );
  const fieldCount = activeGroup?.entries.reduce(
    (total, entry) => total + flattenEntryFields(entry).length,
    0,
  ) ?? 0;

  const selectDomain = (domain: TemplateDomainNode) => {
    setActiveDomainId(domain.id);
    setActiveGroupId(getFirstGroup(domain)?.id ?? '');
    setSelectedNode(null);
  };

  const selectGroup = (group: TemplateGroupNode) => {
    setActiveGroupId(group.id);
    setSelectedNode(null);
  };

  return (
    <div
      className="flex h-full min-h-[720px] flex-col overflow-hidden bg-[#F5F8FA] text-slate-800"
      data-testid="four-level-setting-structure-test"
    >
      <header className="flex min-h-14 shrink-0 items-center justify-between gap-6 border-b border-slate-200 bg-white px-7 py-3">
        <div className="min-w-0">
          <h1 className="text-base font-black text-slate-800">设定模板四级完整展示</h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            取消画布、缩放和连线；三级设定与它的四级字段上下成组完整显示。
          </p>
        </div>
        <div className="min-w-0 shrink-0 text-right" aria-live="polite">
          <div className="text-xs font-bold text-[#078FAB]">
            {activeGroup ? `${activeGroup.entries.length} 个三级设定 · ${fieldCount} 个四级设定` : '暂无设定'}
          </div>
          <div className="mt-1 max-w-[420px] truncate text-xs font-semibold text-slate-400">
            {selectedNode ? `当前选中：${selectedNode.path}` : `当前模板：${fantasyTemplate?.title ?? '玄幻仙侠'}`}
          </div>
        </div>
      </header>

      <div className="editor-scrollbar shrink-0 overflow-x-auto border-b border-slate-200 bg-white">
        <nav
          aria-label="设定一级分类"
          className="grid min-w-[1040px] grid-cols-7 gap-3 px-7 py-3"
        >
          {templateStructure.map((domain) => {
            const active = domain.id === activeDomain?.id;
            return (
              <button
                key={domain.id}
                type="button"
                aria-pressed={active}
                onClick={() => selectDomain(domain)}
                className={`min-h-12 min-w-0 rounded-md border px-3 py-2 text-sm font-black transition-colors ${
                  active
                    ? 'border-[#078FAE] bg-white text-[#078FAB] shadow-[0_0_0_1px_#078FAE]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#9DDFEA] hover:bg-[#F7FCFD]'
                }`}
              >
                <span className="block truncate" title={domain.title}>{domain.title}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <nav
        aria-label="设定二级分类"
        className="flex min-h-[58px] shrink-0 items-center gap-2 border-b border-slate-200 bg-[#FBFCFD] px-7 py-2.5"
      >
        {activeDomain?.groups.map((group) => {
          const active = group.id === activeGroup?.id;
          return (
            <button
              key={group.id}
              type="button"
              aria-pressed={active}
              onClick={() => selectGroup(group)}
              className={`h-9 min-w-[116px] rounded-md border px-5 text-sm font-bold transition-colors ${
                active
                  ? 'border-[#08AACE] bg-[#08AACE] text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-[#9DDFEA] hover:text-[#078FAB]'
              }`}
            >
              {group.title}
            </button>
          );
        })}
      </nav>

      <main className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-7 py-5">
        {activeDomain && activeGroup ? (
          <div className="mx-auto max-w-[1500px] space-y-3" data-four-level-content="true">
            <div className="flex items-end justify-between gap-4 px-1 pb-1">
              <div>
                <div className="text-xs font-bold text-[#078FAB]">{activeDomain.title}</div>
                <h2 className="mt-1 text-lg font-black text-slate-800">{activeGroup.title}</h2>
              </div>
              <p className="text-xs font-semibold text-slate-400">每个三级设定占一行，下一行完整展示其四级字段</p>
            </div>
            {activeGroup.entries.map((entry, index) => (
              <EntryRows
                key={entry.id}
                domain={activeDomain}
                group={activeGroup}
                entry={entry}
                rowIndex={index * 2 + 1}
                selectedId={selectedNode?.id ?? ''}
                onSelect={setSelectedNode}
              />
            ))}
          </div>
        ) : (
          <div className="grid h-full place-items-center text-sm font-bold text-slate-400">当前分类暂无设定</div>
        )}
      </main>
    </div>
  );
}

export default FourLevelSettingStructureTestPage;
