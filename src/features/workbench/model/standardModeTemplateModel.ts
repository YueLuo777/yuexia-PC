import { readDefaultStandardSettingEntries } from '@/features/workbench/model/standardModeDefaultSettingAdapter';
import {
  SETTING_GENERATION_CONTRACT_VERSION,
  buildDefaultTemplateGenerationBlueprint,
  createSettingTemplatePackage,
  normalizeTemplateGenerationBlueprint,
  normalizeSettingGenerationPromptProfile,
  type SettingGenerationPromptProfile,
  type TemplateGenerationBlueprint,
} from './standardModeTemplateGenerationModel';

export type TemplateFieldNode = {
  id: string;
  title: string;
  enabled: boolean;
  value?: string;
  placeholder?: string;
  wide?: boolean;
  displaySize?: 'compact' | 'standard' | 'expanded';
  control?: 'input' | 'textarea';
  maxLength?: number;
  fieldClassName?: string;
};

export type TemplateSectionNode = {
  id: string;
  title: string;
  enabled: boolean;
  fields: TemplateFieldNode[];
};

export type TemplateEntryNode = {
  id: string;
  title: string;
  enabled: boolean;
  sections: TemplateSectionNode[];
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
  formatVersion: 3;
  id: string;
  name: string;
  revision: number;
  source: 'custom';
  updatedAt: string;
  structure: TemplateStructure;
  generationBlueprint: TemplateGenerationBlueprint;
  promptProfile: SettingGenerationPromptProfile;
  contractVersion: typeof SETTING_GENERATION_CONTRACT_VERSION;
};

export type TemplateNodeTarget = {
  domainId: string;
  groupId?: string;
  entryId?: string;
  sectionId?: string;
  fieldId?: string;
};

export const SAVED_SETTING_TEMPLATES_STORAGE_KEY = 'xinyuexia_standard_setting_templates_v1';
const TEMPLATE_SOURCE_STORAGE_KEY = 'xinyuexia_standard_setting_template_source_v2';
let generatedNodeSequence = 0;

export function cloneTemplateStructure(structure: TemplateStructure): TemplateStructure {
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
    group.entries.push({
      id: entry.id,
      title: entry.title,
      enabled: true,
      sections: entry.sections.map((section) => ({
        id: `${entry.id}:${section.id}`,
        title: section.title,
        enabled: true,
        fields: section.fields.map((field) => ({
          id: `${entry.id}:${section.id}:${field.key}`,
          title: field.title,
          enabled: true,
          value: '',
          placeholder: field.placeholder,
          wide: field.wide,
          displaySize: field.displaySize,
          control: field.control,
          maxLength: field.maxLength,
          fieldClassName: field.fieldClassName,
        })),
      })),
    });
    domains.set(entry.domainId, domain);
  });
  return [...domains.values()];
}

function mapSelectedEntry(
  structure: TemplateStructure,
  target: TemplateNodeTarget,
  updater: (entry: TemplateEntryNode) => TemplateEntryNode,
) {
  return structure.map((domain) => domain.id !== target.domainId ? domain : {
    ...domain,
    groups: domain.groups.map((group) => group.id !== target.groupId ? group : {
      ...group,
      entries: group.entries.map((entry) => entry.id === target.entryId ? updater(entry) : entry),
    }),
  });
}

export function renameTemplateNode(structure: TemplateStructure, target: TemplateNodeTarget, title: string) {
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
            if (!target.sectionId) return { ...entry, title };
            return {
              ...entry,
              sections: entry.sections.map((section) => {
                if (section.id !== target.sectionId) return section;
                if (!target.fieldId) return { ...section, title };
                return {
                  ...section,
                  fields: section.fields.map((field) => field.id === target.fieldId ? { ...field, title } : field),
                };
              }),
            };
          }),
        };
      }),
    };
  });
}

export function addTemplateDomain(structure: TemplateStructure) {
  const domain: TemplateDomainNode = {
    id: createTemplateNodeId('domain'), title: '新设定分类', enabled: true, groups: [],
  };
  return { structure: [...structure, domain], domain };
}

export function addTemplateGroup(structure: TemplateStructure, domainId: string) {
  const group: TemplateGroupNode = {
    id: createTemplateNodeId('group'), title: '新分组', enabled: true, entries: [],
  };
  return {
    structure: structure.map((domain) => domain.id === domainId
      ? { ...domain, enabled: true, groups: [...domain.groups, group] }
      : domain),
    group,
  };
}

export function addTemplateEntry(structure: TemplateStructure, domainId: string, groupId: string) {
  const section: TemplateSectionNode = {
    id: createTemplateNodeId('section'), title: '基础设定', enabled: true, fields: [],
  };
  const entry: TemplateEntryNode = {
    id: createTemplateNodeId('entry'), title: '新设定', enabled: true, sections: [section],
  };
  return {
    structure: structure.map((domain) => domain.id === domainId ? {
      ...domain,
      enabled: true,
      groups: domain.groups.map((group) => group.id === groupId
        ? { ...group, enabled: true, entries: [...group.entries, entry] }
        : group),
    } : domain),
    entry,
  };
}

export function addTemplateSection(
  structure: TemplateStructure,
  domainId: string,
  groupId: string,
  entryId: string,
) {
  const section: TemplateSectionNode = {
    id: createTemplateNodeId('section'), title: '新分类', enabled: true, fields: [],
  };
  return {
    structure: mapSelectedEntry(structure, { domainId, groupId, entryId }, (entry) => ({
      ...entry, enabled: true, sections: [...entry.sections, section],
    })),
    section,
  };
}

export function addTemplateField(
  structure: TemplateStructure,
  domainId: string,
  groupId: string,
  entryId: string,
  sectionId: string,
) {
  const field: TemplateFieldNode = {
    id: createTemplateNodeId('field'), title: '新子设定', enabled: true, value: '',
  };
  return {
    structure: mapSelectedEntry(structure, { domainId, groupId, entryId }, (entry) => ({
      ...entry,
      enabled: true,
      sections: entry.sections.map((section) => section.id === sectionId
        ? { ...section, enabled: true, fields: [...section.fields, field] }
        : section),
    })),
    field,
  };
}

export function deleteTemplateNode(structure: TemplateStructure, target: TemplateNodeTarget): TemplateStructure {
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
        if (!target.sectionId) {
          return { ...group, entries: group.entries.filter((entry) => entry.id !== target.entryId) };
        }
        return {
          ...group,
          entries: group.entries.map((entry) => entry.id !== target.entryId ? entry : {
            ...entry,
            sections: entry.sections
              .filter((section) => section.id !== target.sectionId || Boolean(target.fieldId))
              .map((section) => section.id === target.sectionId && target.fieldId
                ? { ...section, fields: section.fields.filter((field) => field.id !== target.fieldId) }
                : section),
          }),
        };
      }),
    };
  });
}

export function summarizeTemplate(structure: TemplateStructure) {
  const domains = structure.filter((domain) => domain.enabled);
  const groups = domains.flatMap((domain) => domain.groups.filter((group) => group.enabled));
  const entries = groups.flatMap((group) => group.entries.filter((entry) => entry.enabled));
  const sections = entries.flatMap((entry) => entry.sections.filter((section) => section.enabled));
  const fields = sections.flatMap((section) => section.fields.filter((field) => field.enabled));
  return {
    domainCount: domains.length,
    groupCount: groups.length,
    entryCount: entries.length,
    sectionCount: sections.length,
    fieldCount: fields.length,
  };
}

export function readSavedSettingTemplates(): SavedSettingTemplate[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_SETTING_TEMPLATES_STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((value, index): SavedSettingTemplate[] => {
      if (!value || typeof value !== 'object') return [];
      const input = value as Partial<SavedSettingTemplate>;
      const structure = Array.isArray(input.structure)
        ? cloneTemplateStructure(input.structure as TemplateStructure)
        : [];
      const id = typeof input.id === 'string' && input.id ? input.id : `legacy-setting-template-${index + 1}`;
      const name = typeof input.name === 'string' && input.name.trim() ? input.name : '未命名模板';
      const generationBlueprint = normalizeTemplateGenerationBlueprint(structure, input.generationBlueprint);
      const promptProfile = normalizeSettingGenerationPromptProfile(id, name, input.promptProfile);
      return [{
        formatVersion: 3,
        id,
        name,
        revision: Number.isInteger(input.revision) && Number(input.revision) > 0 ? Number(input.revision) : 1,
        source: 'custom',
        updatedAt: typeof input.updatedAt === 'string' ? input.updatedAt : new Date().toLocaleString('zh-CN'),
        structure,
        generationBlueprint,
        promptProfile,
        contractVersion: SETTING_GENERATION_CONTRACT_VERSION,
      }];
    });
  } catch {
    return [];
  }
}

function writeSavedSettingTemplates(templates: SavedSettingTemplate[]) {
  localStorage.setItem(SAVED_SETTING_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  return templates;
}

export function saveSettingTemplateById(
  templateId: string | null,
  name: string,
  structure: TemplateStructure,
  generationBlueprint?: TemplateGenerationBlueprint,
  promptProfile?: SettingGenerationPromptProfile,
) {
  const templates = readSavedSettingTemplates();
  const normalizedName = name.trim() || '未命名模板';
  const existing = templateId ? templates.find((template) => template.id === templateId) : null;
  const id = templateId ?? `setting-template-${Date.now()}`;
  const normalizedPromptProfile = normalizeSettingGenerationPromptProfile(
    id,
    normalizedName,
    promptProfile ?? existing?.promptProfile,
  );
  const saved = createSettingTemplatePackage({
    id,
    name: normalizedName,
    source: 'custom',
    revision: (existing?.revision ?? 0) + 1,
    structure: cloneTemplateStructure(structure),
    generationBlueprint: normalizeTemplateGenerationBlueprint(
      structure,
      generationBlueprint ?? existing?.generationBlueprint ?? buildDefaultTemplateGenerationBlueprint(structure),
    ),
    promptProfile: {
      ...normalizedPromptProfile,
      revision: existing ? Math.max(existing.promptProfile.revision, normalizedPromptProfile.revision) + 1 : 1,
    },
  }) satisfies SavedSettingTemplate;
  return writeSavedSettingTemplates([saved, ...templates.filter((template) => template.id !== saved.id)]);
}

export function saveSettingTemplate(
  name: string,
  structure: TemplateStructure,
  generationBlueprint?: TemplateGenerationBlueprint,
  promptProfile?: SettingGenerationPromptProfile,
) {
  const templates = readSavedSettingTemplates();
  const existing = templates.find((template) => template.name === name);
  return saveSettingTemplateById(
    existing?.id ?? null,
    name,
    structure,
    generationBlueprint,
    promptProfile,
  );
}

export function deleteSavedSettingTemplate(templateId: string) {
  return writeSavedSettingTemplates(
    readSavedSettingTemplates().filter((template) => template.id !== templateId),
  );
}
