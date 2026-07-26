import { readDefaultStandardSettingEntries } from '@/features/workbench/model/standardModeDefaultSettingAdapter';

export type TemplateFieldNode = {
  id: string;
  title: string;
  enabled: boolean;
};

export type TemplateEntryNode = {
  id: string;
  title: string;
  enabled: boolean;
  fields: TemplateFieldNode[];
};

export type TemplateGroupNode = {
  id: string;
  title: string;
  enabled: boolean;
  entries: TemplateEntryNode[];
};

export type TemplateDomainNode = {
  id: string;
  title: string;
  enabled: boolean;
  groups: TemplateGroupNode[];
};

export type TemplateStructure = TemplateDomainNode[];

export type SavedSettingTemplate = {
  id: string;
  name: string;
  updatedAt: string;
  structure: TemplateStructure;
};

export type TemplateNodeTarget = {
  domainId: string;
  groupId?: string;
  entryId?: string;
  fieldId?: string;
};

export const TEMPLATE_CHOICE_TEST_STORAGE_KEY = 'xinyuexia_test_standard_setting_templates_v1';
const TEMPLATE_SOURCE_STORAGE_KEY = 'xinyuexia_test_standard_setting_template_source_v1';
let generatedNodeSequence = 0;

function cloneStructure(structure: TemplateStructure): TemplateStructure {
  return JSON.parse(JSON.stringify(structure)) as TemplateStructure;
}

function createTemplateNodeId(prefix: string) {
  generatedNodeSequence += 1;
  return `${prefix}-${Date.now()}-${generatedNodeSequence}`;
}

export function buildDefaultTemplateStructure(): TemplateStructure {
  const entries = readDefaultStandardSettingEntries(TEMPLATE_SOURCE_STORAGE_KEY);
  const domains = new Map<string, TemplateDomainNode>();
  entries.forEach((entry) => {
    const domain = domains.get(entry.domainId) ?? {
      id: entry.domainId,
      title: entry.domainTitle,
      enabled: true,
      groups: [],
    };
    let group = domain.groups.find((item) => item.id === entry.groupId);
    if (!group) {
      group = { id: entry.groupId, title: entry.groupTitle, enabled: true, entries: [] };
      domain.groups.push(group);
    }
    const fields = entry.sections.flatMap((section) =>
      section.fields.map((field) => ({
        id: `${entry.id}:${section.id}:${field.key}`,
        title: field.title,
        enabled: true,
      })),
    );
    group.entries.push({ id: entry.id, title: entry.title, enabled: true, fields });
    domains.set(entry.domainId, domain);
  });
  return [...domains.values()];
}

export function setTemplateNodeEnabled(
  structure: TemplateStructure,
  target: TemplateNodeTarget,
  enabled: boolean,
) {
  return structure.map((domain) => {
    if (domain.id !== target.domainId) return domain;
    if (!target.groupId) {
      return {
        ...domain,
        enabled,
        groups: domain.groups.map((group) => ({
          ...group,
          enabled,
          entries: group.entries.map((entry) => ({
            ...entry,
            enabled,
            fields: entry.fields.map((field) => ({ ...field, enabled })),
          })),
        })),
      };
    }
    return {
      ...domain,
      enabled: enabled || domain.enabled,
      groups: domain.groups.map((group) => {
        if (group.id !== target.groupId) return group;
        if (!target.entryId) {
          return {
            ...group,
            enabled,
            entries: group.entries.map((entry) => ({
              ...entry,
              enabled,
              fields: entry.fields.map((field) => ({ ...field, enabled })),
            })),
          };
        }
        return {
          ...group,
          enabled: enabled || group.enabled,
          entries: group.entries.map((entry) => {
            if (entry.id !== target.entryId) return entry;
            if (!target.fieldId) {
              return { ...entry, enabled, fields: entry.fields.map((field) => ({ ...field, enabled })) };
            }
            return {
              ...entry,
              enabled: enabled || entry.enabled,
              fields: entry.fields.map((field) =>
                field.id === target.fieldId ? { ...field, enabled } : field,
              ),
            };
          }),
        };
      }),
    };
  });
}

export function renameTemplateNode(
  structure: TemplateStructure,
  target: TemplateNodeTarget,
  title: string,
): TemplateStructure {
  return structure.map((domain) => {
    if (domain.id !== target.domainId) return domain;
    if (!target.groupId) return { ...domain, title };
    return {
      ...domain,
      groups: domain.groups.map((group) => {
        if (group.id !== target.groupId) return group;
        if (!target.entryId) return { ...group, title };
        return {
          ...group,
          entries: group.entries.map((entry) => {
            if (entry.id !== target.entryId) return entry;
            if (!target.fieldId) return { ...entry, title };
            return {
              ...entry,
              fields: entry.fields.map((field) =>
                field.id === target.fieldId ? { ...field, title } : field,
              ),
            };
          }),
        };
      }),
    };
  });
}

export function addTemplateDomain(structure: TemplateStructure) {
  const domain: TemplateDomainNode = {
    id: createTemplateNodeId('domain'),
    title: '新设定分类',
    enabled: true,
    groups: [],
  };
  return { structure: [...structure, domain], domain };
}

export function addTemplateGroup(structure: TemplateStructure, domainId: string) {
  const group: TemplateGroupNode = {
    id: createTemplateNodeId('group'),
    title: '新分组',
    enabled: true,
    entries: [],
  };
  return {
    structure: structure.map((domain) =>
      domain.id === domainId
        ? { ...domain, enabled: true, groups: [...domain.groups, group] }
        : domain,
    ),
    group,
  };
}

export function addTemplateEntry(structure: TemplateStructure, domainId: string, groupId: string) {
  const entry: TemplateEntryNode = {
    id: createTemplateNodeId('entry'),
    title: '新设定',
    enabled: true,
    fields: [],
  };
  return {
    structure: structure.map((domain) =>
      domain.id === domainId
        ? {
            ...domain,
            enabled: true,
            groups: domain.groups.map((group) =>
              group.id === groupId
                ? { ...group, enabled: true, entries: [...group.entries, entry] }
                : group,
            ),
          }
        : domain,
    ),
    entry,
  };
}

export function addTemplateField(
  structure: TemplateStructure,
  domainId: string,
  groupId: string,
  entryId: string,
) {
  const field: TemplateFieldNode = {
    id: createTemplateNodeId('field'),
    title: '新子设定',
    enabled: true,
  };
  return {
    structure: structure.map((domain) =>
      domain.id === domainId
        ? {
            ...domain,
            groups: domain.groups.map((group) =>
              group.id === groupId
                ? {
                    ...group,
                    entries: group.entries.map((entry) =>
                      entry.id === entryId
                        ? { ...entry, enabled: true, fields: [...entry.fields, field] }
                        : entry,
                    ),
                  }
                : group,
            ),
          }
        : domain,
    ),
    field,
  };
}

export function deleteTemplateNode(
  structure: TemplateStructure,
  target: TemplateNodeTarget,
): TemplateStructure {
  if (!target.groupId) return structure.filter((domain) => domain.id !== target.domainId);
  return structure.map((domain) => {
    if (domain.id !== target.domainId) return domain;
    if (!target.entryId) {
      return { ...domain, groups: domain.groups.filter((group) => group.id !== target.groupId) };
    }
    return {
      ...domain,
      groups: domain.groups.map((group) => {
        if (group.id !== target.groupId) return group;
        if (!target.fieldId) {
          return { ...group, entries: group.entries.filter((entry) => entry.id !== target.entryId) };
        }
        return {
          ...group,
          entries: group.entries.map((entry) =>
            entry.id === target.entryId
              ? { ...entry, fields: entry.fields.filter((field) => field.id !== target.fieldId) }
              : entry,
          ),
        };
      }),
    };
  });
}

export function summarizeTemplate(structure: TemplateStructure) {
  const domains = structure.filter((domain) => domain.enabled);
  const groups = domains.flatMap((domain) => domain.groups.filter((group) => group.enabled));
  const entries = groups.flatMap((group) => group.entries.filter((entry) => entry.enabled));
  const fields = entries.flatMap((entry) => entry.fields.filter((field) => field.enabled));
  return { domainCount: domains.length, groupCount: groups.length, entryCount: entries.length, fieldCount: fields.length };
}

export function readSavedSettingTemplates(): SavedSettingTemplate[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(TEMPLATE_CHOICE_TEST_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? (parsed as SavedSettingTemplate[]) : [];
  } catch {
    return [];
  }
}

export function saveSettingTemplate(name: string, structure: TemplateStructure) {
  const templates = readSavedSettingTemplates();
  const existing = templates.find((template) => template.name === name);
  const saved: SavedSettingTemplate = {
    id: existing?.id ?? `setting-template-${Date.now()}`,
    name,
    updatedAt: new Date().toLocaleString('zh-CN'),
    structure: cloneStructure(structure),
  };
  const next = [saved, ...templates.filter((template) => template.id !== saved.id)];
  localStorage.setItem(TEMPLATE_CHOICE_TEST_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function deleteSavedSettingTemplate(id: string) {
  const next = readSavedSettingTemplates().filter((template) => template.id !== id);
  localStorage.setItem(TEMPLATE_CHOICE_TEST_STORAGE_KEY, JSON.stringify(next));
  return next;
}
