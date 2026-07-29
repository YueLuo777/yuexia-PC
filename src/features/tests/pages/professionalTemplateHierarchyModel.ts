import { SMART_TEMPLATE_PRESETS } from '@/features/workbench/model/standardModeSmartSettingFlowModel';
import type {
  TemplateDomainNode,
  TemplateEntryNode,
  TemplateFieldNode,
  TemplateGroupNode,
} from '@/features/workbench/model/standardModeTemplateModel';

export type HierarchyFieldPath = {
  id: string;
  domain: TemplateDomainNode;
  group: TemplateGroupNode;
  entry: TemplateEntryNode;
  field: TemplateFieldNode;
  path: string;
};

export type HierarchyVariantProps = {
  selectedIds: Set<string>;
  onToggleField: (fieldId: string) => void;
  onToggleIds: (fieldIds: string[]) => void;
};

export const professionalTemplate = SMART_TEMPLATE_PRESETS.find((preset) => preset.id === 'male-fantasy-xianxia');
export const professionalTemplateStructure = professionalTemplate?.structure ?? [];

export const professionalFieldPaths: HierarchyFieldPath[] = professionalTemplateStructure.flatMap((domain) =>
  domain.groups.flatMap((group) =>
    group.entries.flatMap((entry) =>
      entry.sections
        .flatMap((section) => section.fields)
        .map((field) => ({
          id: field.id,
          domain,
          group,
          entry,
          field,
          path: `${domain.title} ＞ ${group.title} ＞ ${entry.title} ＞ ${field.title}`,
        })),
    ),
  ),
);

export const professionalFieldById = new Map(professionalFieldPaths.map((item) => [item.id, item]));

export function getEntryFieldPaths(entry: TemplateEntryNode) {
  return professionalFieldPaths.filter((item) => item.entry.id === entry.id);
}

export function getGroupFieldPaths(group: TemplateGroupNode) {
  return professionalFieldPaths.filter((item) => item.group.id === group.id);
}

export function getDomainFieldPaths(domain: TemplateDomainNode) {
  return professionalFieldPaths.filter((item) => item.domain.id === domain.id);
}

export function countSelected(fieldIds: string[], selectedIds: Set<string>) {
  return fieldIds.filter((id) => selectedIds.has(id)).length;
}

export function selectionState(fieldIds: string[], selectedIds: Set<string>) {
  const selectedCount = countSelected(fieldIds, selectedIds);
  return {
    selectedCount,
    allSelected: fieldIds.length > 0 && selectedCount === fieldIds.length,
    partiallySelected: selectedCount > 0 && selectedCount < fieldIds.length,
  };
}
