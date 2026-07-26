import type {
  TemplateDomainNode,
  TemplateEntryNode,
  TemplateFieldNode,
  TemplateGroupNode,
  TemplateSectionNode,
} from '@/features/workbench/model/standardModeTemplateModel';

import type { TemplateMindMapSelection } from './StandardModeTemplateNodeWorkbench';

type StandardModeTemplateDomainOverviewProps = {
  domain: TemplateDomainNode;
  group: TemplateGroupNode;
  selection: TemplateMindMapSelection;
  onSelectGroup: () => void;
  onSelectEntry: (entry: TemplateEntryNode) => void;
  onSelectSection: (entry: TemplateEntryNode, section: TemplateSectionNode) => void;
  onSelectField: (entry: TemplateEntryNode, section: TemplateSectionNode, field: TemplateFieldNode) => void;
};

function getNodeWidth(titles: string[]) {
  const longestTitle = Math.max(...titles.map((title) => Array.from(title || '').length), 6);
  return Math.min(15, Math.max(6, longestTitle)) * 14 + 52;
}

export function StandardModeTemplateDomainOverview({
  domain,
  group,
  selection,
  onSelectGroup,
  onSelectEntry,
  onSelectSection,
  onSelectField,
}: StandardModeTemplateDomainOverviewProps) {
  const groupNodeWidth = getNodeWidth([group.title]);
  const entryLayouts = group.entries.map((entry) => ({
    entry,
    width: getNodeWidth([
      entry.title,
      ...entry.sections.flatMap((section) => [section.title, ...section.fields.map((field) => field.title)]),
    ]),
  }));
  const entryGap = 12;
  const entriesWidth = entryLayouts.reduce((total, item) => total + item.width, 0)
    + Math.max(0, entryLayouts.length - 1) * entryGap;
  const sectionWidth = Math.max(groupNodeWidth, entriesWidth);
  const groupSelected = selection.kind === 'group' && selection.groupId === group.id;

  return (
    <section
      className="flex shrink-0 flex-col items-center"
      data-template-layout="horizontal-group"
      style={{ width: sectionWidth }}
    >
      <div
        data-canvas-control="true"
        data-template-node-id={group.id}
        data-parent-node-id={domain.id}
        title={group.title || '未命名分组'}
        className={`relative shrink-0 rounded-md border bg-white ${
          groupSelected ? 'border-[#078FAE] shadow-[0_0_0_1px_#078FAE]' : 'border-[#CDEFF6]'
        }`}
        style={{ width: groupNodeWidth }}
      >
        <button
          type="button"
          aria-label={`模板节点：${group.title}`}
          onClick={onSelectGroup}
          className="min-h-12 w-full rounded-md bg-[#F7FCFD] px-3 py-2 text-center text-sm font-bold leading-5 text-slate-700"
        >
          <span className="block break-words">{group.title || '未命名分组'}</span>
        </button>
      </div>

      <div className="h-5 w-px bg-[#8FC8D5]" />
      <div
        className="relative flex items-start gap-3 pt-5"
        data-testid={`template-group-entries-${group.id}`}
        data-template-layout="horizontal-entries"
        style={{ width: entriesWidth }}
      >
        {entryLayouts.length > 1 ? (
          <span
            aria-hidden="true"
            className="absolute top-0 h-px bg-[#8FC8D5]"
            style={{ left: entryLayouts[0].width / 2, right: entryLayouts.at(-1)!.width / 2 }}
          />
        ) : null}
        {entryLayouts.map(({ entry, width }) => (
          <div key={entry.id} className="relative shrink-0" style={{ width }}>
            <span aria-hidden="true" className="absolute left-1/2 top-[-20px] h-5 w-px -translate-x-1/2 bg-[#8FC8D5]" />
            <div
              data-canvas-control="true"
              data-template-node-id={entry.id}
              data-parent-node-id={group.id}
              title={entry.title || '未命名设定'}
              className={`overflow-hidden rounded border bg-white shadow-sm ${
                selection.kind === 'entry' && selection.entryId === entry.id
                  ? 'border-[#078FAE] shadow-[0_0_0_1px_#078FAE]'
                  : 'border-[#B7DDE5]'
              }`}
            >
              <button
                type="button"
                aria-label={`模板节点：${entry.title}`}
                onClick={() => onSelectEntry(entry)}
                className="min-h-10 w-full border-b border-[#D8EFF4] bg-[#F7FCFD] px-3 py-2 text-left text-sm font-bold leading-5 text-slate-700 hover:text-[#078FAB]"
              >
                <span className="block break-words">{entry.title || '未命名设定'}</span>
              </button>
              <div className="space-y-2 p-2">
                {entry.sections.map((section) => (
                  <section key={section.id} data-template-layout="vertical-fields">
                    <button
                      type="button"
                      data-canvas-control="true"
                      aria-label={`模板节点：${section.title}`}
                      onClick={() => onSelectSection(entry, section)}
                      className={`mb-1 flex min-h-6 w-full items-center gap-2 text-left text-[11px] font-bold ${
                        selection.kind === 'section' && selection.sectionId === section.id
                          ? 'text-[#078FAB]'
                          : 'text-slate-500'
                      }`}
                    >
                      <span>{section.title || '未命名分类'}</span>
                      <span className="h-px min-w-0 flex-1 bg-[#D8EFF4]" />
                    </button>
                    <div className="space-y-1.5">
                      {section.fields.map((field) => {
                        const selected = selection.kind === 'field' && selection.fieldId === field.id;
                        return (
                          <button
                            key={field.id}
                            type="button"
                            data-canvas-control="true"
                            data-template-node-id={field.id}
                            data-parent-node-id={section.id}
                            aria-label={`模板节点：${field.title}`}
                            title={field.title || '未命名子设定'}
                            onClick={() => onSelectField(entry, section, field)}
                            className={`min-h-9 w-full rounded border bg-white px-3 py-1.5 text-left text-xs font-semibold leading-5 ${
                              selected
                                ? 'border-[#078FAE] text-[#078FAB] shadow-[0_0_0_1px_#078FAE]'
                                : 'border-slate-200 text-slate-600 hover:border-[#8FC8D5]'
                            }`}
                          >
                            <span className="block break-words">{field.title || '未命名子设定'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
