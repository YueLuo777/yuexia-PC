import {
  createEmptyRoleStateSettings,
  stringifyRoleContent,
} from '@/features/workbench/components/workbenchRoleContent';
import {
  parseSettingContent,
  stringifySettingContent,
} from '@/features/workbench/components/workbenchStructuredSettings';
import {
  createWorkbenchLibraryEntry,
  type WorkbenchLibraryEntry,
} from './workbenchLibraryStorage';

export function createManualStandardTemplateRoleInstance({
  entries,
  selectedRoleId,
  title,
  type,
}: {
  entries: WorkbenchLibraryEntry[];
  selectedRoleId: string | null;
  title: string;
  type: string;
}) {
  const source = selectedRoleId ? entries.find((entry) => entry.id === selectedRoleId) : null;
  return {
    ...createWorkbenchLibraryEntry('角色', title),
    content: stringifyRoleContent({
      type,
      lifeStatus: '存活',
      baseSetting: '',
      relationship: '',
      stateSettings: createEmptyRoleStateSettings(),
      personality: '',
      background: '',
      status: '',
      history: [],
    }),
    ...(source?.standardTemplateCollection ? {
      standardTemplateEntryId: source.standardTemplateEntryId,
      standardTemplateCollection: true,
      standardTemplateGenerated: false,
      standardTemplatePlaceholder: false,
    } : {}),
  } satisfies WorkbenchLibraryEntry;
}

export function createManualStandardTemplateSettingInstance({
  source,
  title,
  type,
}: {
  source: WorkbenchLibraryEntry | null;
  title: string;
  type: string;
}) {
  const sourceSetting = source?.standardTemplateCollection ? parseSettingContent(source.content) : null;
  return {
    ...createWorkbenchLibraryEntry('大纲', title),
    content: stringifySettingContent({
      type,
      body: '',
      ...(sourceSetting?.structuredFieldSetId
        ? { structuredFieldSetId: sourceSetting.structuredFieldSetId }
        : {}),
      ...(sourceSetting?.templateFieldLayout
        ? { templateFieldLayout: sourceSetting.templateFieldLayout }
        : {}),
    }),
    ...(source?.standardTemplateCollection ? {
      standardTemplateEntryId: source.standardTemplateEntryId,
      standardTemplateCollection: true,
      standardTemplateGenerated: false,
      standardTemplatePlaceholder: false,
    } : {}),
  } satisfies WorkbenchLibraryEntry;
}
