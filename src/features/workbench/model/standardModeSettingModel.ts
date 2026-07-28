import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import {
  buildDefaultTemplateStructure,
  cloneTemplateStructure,
  type TemplateStructure,
} from '@/features/workbench/model/standardModeTemplateModel';

export type StandardSettingTemplateMode = 'template';

export type StandardSettingCustomField = {
  id: string;
  title: string;
  value: string;
};

export type StandardSettingCustomEntry = {
  id: string;
  title: string;
  fields: StandardSettingCustomField[];
};

export type StandardSettingCustomGroup = {
  id: string;
  title: string;
  entries: StandardSettingCustomEntry[];
};

export type StandardSettingTemplateState = {
  version: 2;
  mode: StandardSettingTemplateMode;
  templateId: string;
  templateName: string;
  structure: TemplateStructure;
};

export type StandardSettingFieldDescriptor = {
  key: string;
  title: string;
  placeholder: string;
  wide?: boolean;
  displaySize?: 'compact' | 'standard' | 'expanded';
  control?: 'input' | 'textarea';
  maxLength?: number;
  fieldClassName?: string;
  value: string;
};

export type StandardSettingSectionDescriptor = {
  id: string;
  title: string;
  fields: StandardSettingFieldDescriptor[];
};

export type StandardSettingEntryDescriptor = {
  id: string;
  title: string;
  domainId: string;
  domainTitle: string;
  groupId: string;
  groupTitle: string;
  sourceKind: 'setting' | 'role' | 'custom';
  sourceEntry?: WorkbenchLibraryEntry;
  sections: StandardSettingSectionDescriptor[];
};

export type StandardSettingEmptyField = {
  entryId: string;
  fieldKey: string;
  path: string;
  fieldTitle: string;
};

export const STANDARD_SETTING_TEMPLATE_VERSION = 2 as const;

export function getStandardSettingTemplateStorageKey(novelId: string) {
  return `xinyuexia_standard_setting_template_${novelId}`;
}

export function createStandardSettingId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptyCustomSettingGroup(): StandardSettingCustomGroup {
  return {
    id: createStandardSettingId('group'),
    title: '',
    entries: [createEmptyCustomSettingEntry()],
  };
}

export function createEmptyCustomSettingEntry(): StandardSettingCustomEntry {
  return {
    id: createStandardSettingId('entry'),
    title: '',
    fields: [createEmptyCustomSettingField()],
  };
}

export function createEmptyCustomSettingField(): StandardSettingCustomField {
  return { id: createStandardSettingId('field'), title: '', value: '' };
}

export function readStandardSettingTemplateState(novelId: string): StandardSettingTemplateState | null {
  if (!novelId) return null;
  try {
    const raw = localStorage.getItem(getStandardSettingTemplateStorageKey(novelId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      version?: number;
      mode?: string;
      templateId?: unknown;
      templateName?: unknown;
      structure?: unknown;
    };
    if (parsed.version === 1 && (parsed.mode === 'default' || parsed.mode === 'custom')) {
      return {
        version: STANDARD_SETTING_TEMPLATE_VERSION,
        mode: 'template',
        templateId: 'legacy-default',
        templateName: '原默认模板',
        structure: buildDefaultTemplateStructure(),
      };
    }
    if (parsed.version !== STANDARD_SETTING_TEMPLATE_VERSION || parsed.mode !== 'template') return null;
    return {
      version: STANDARD_SETTING_TEMPLATE_VERSION,
      mode: 'template',
      templateId: typeof parsed.templateId === 'string' ? parsed.templateId : 'custom-template',
      templateName: typeof parsed.templateName === 'string' ? parsed.templateName : '未命名模板',
      structure: Array.isArray(parsed.structure)
        ? cloneTemplateStructure(parsed.structure as TemplateStructure)
        : [],
    };
  } catch {
    return null;
  }
}

export function writeStandardSettingTemplateState(novelId: string, state: StandardSettingTemplateState) {
  localStorage.setItem(getStandardSettingTemplateStorageKey(novelId), JSON.stringify(state));
}

export function clearStandardSettingTemplateState(novelId: string) {
  if (!novelId) return;
  localStorage.removeItem(getStandardSettingTemplateStorageKey(novelId));
}

export function validateCustomSettingGroups(groups: StandardSettingCustomGroup[]) {
  if (groups.length === 0) return '至少创建一个设定分组。';
  for (const group of groups) {
    if (!group.title.trim()) return '请填写所有分组名称。';
    if (group.entries.length === 0) return `“${group.title}”下至少需要一个设定。`;
    for (const entry of group.entries) {
      if (!entry.title.trim()) return `请填写“${group.title}”下的所有设定名称。`;
      if (entry.fields.length === 0) return `“${entry.title}”下至少需要一个子设定。`;
      if (entry.fields.some((field) => !field.title.trim())) return `请填写“${entry.title}”下的所有子设定名称。`;
    }
  }
  return null;
}

export function buildCustomSettingEntries(groups: StandardSettingCustomGroup[]): StandardSettingEntryDescriptor[] {
  return groups.flatMap((group) =>
    group.entries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      domainId: group.id,
      domainTitle: group.title,
      groupId: group.id,
      groupTitle: group.title,
      sourceKind: 'custom' as const,
      sections: [
        {
          id: `${entry.id}:fields`,
          title: entry.title,
          fields: entry.fields.map((field) => ({
            key: field.id,
            title: field.title,
            placeholder: `填写${field.title}`,
            value: field.value,
          })),
        },
      ],
    })),
  );
}

export function buildTemplateSettingEntries(structure: TemplateStructure): StandardSettingEntryDescriptor[] {
  return structure
    .filter((domain) => domain.enabled)
    .flatMap((domain) => domain.groups
      .filter((group) => group.enabled)
      .flatMap((group) => group.entries
        .filter((entry) => entry.enabled)
        .map((entry) => ({
          id: entry.id,
          title: entry.title,
          domainId: domain.id,
          domainTitle: domain.title,
          groupId: group.id,
          groupTitle: group.title,
          sourceKind: domain.title === '人物设定' ? 'role' as const : 'setting' as const,
          sections: entry.sections
            .filter((section) => section.enabled)
            .map((section) => ({
              id: section.id,
              title: section.title,
              fields: section.fields
                .filter((field) => field.enabled)
                .map((field) => ({
                  key: field.id,
                  title: field.title,
                  placeholder: field.placeholder || `填写${field.title}`,
                  wide: field.wide,
                  displaySize: field.displaySize,
                  control: field.control,
                  maxLength: field.maxLength,
                  fieldClassName: field.fieldClassName,
                  value: field.value ?? '',
                })),
            })),
        }))),
    );
}

export function updateTemplateSettingField(
  structure: TemplateStructure,
  entryId: string,
  fieldId: string,
  value: string,
) {
  return structure.map((domain) => ({
    ...domain,
    groups: domain.groups.map((group) => ({
      ...group,
      entries: group.entries.map((entry) => entry.id !== entryId ? entry : {
        ...entry,
        sections: entry.sections.map((section) => ({
          ...section,
          fields: section.fields.map((field) => field.id === fieldId ? { ...field, value } : field),
        })),
      }),
    })),
  }));
}

export function findEmptyStandardSettingFields(entries: StandardSettingEntryDescriptor[]) {
  return entries.flatMap<StandardSettingEmptyField>((entry) =>
    entry.sections.flatMap((section) =>
      section.fields
        .filter((field) => !field.value.trim())
        .map((field) => ({
          entryId: entry.id,
          fieldKey: field.key,
          path: [entry.domainTitle, entry.groupTitle !== entry.domainTitle ? entry.groupTitle : '', entry.title]
            .filter(Boolean)
            .join(' / '),
          fieldTitle: field.title,
        })),
    ),
  );
}
