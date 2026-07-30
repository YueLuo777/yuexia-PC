import { normalizeTabName, ROLE_TAB, SETTING_TAB } from '@/features/workbench/components/workbenchLibraryTabs';
import { parsePromptRoleFields } from '@/features/workbench/components/workbenchPromptRoleFields';
import { parseRoleContent } from '@/features/workbench/components/workbenchRoleContent';
import {
  getStructuredSettingFieldSet,
  parseSectionedSettingBody,
  parseSettingContent,
  parseStructuredSettingFields,
} from '@/features/workbench/components/workbenchStructuredSettings';
import type { StandardSettingTemplateSnapshot } from '@/features/workbench/model/standardModeSettingModel';
import { readWorkbenchLibraryEntriesWithGlobalBrainstorm } from '@/features/workbench/model/workbenchLibraryStorage';

function hasItems(value: unknown[] | undefined) {
  return Boolean(value?.length);
}

function hasKeys(value: object | undefined) {
  return Boolean(value && Object.keys(value).length);
}

export function hasStandardModeSettingContent(
  storageKey: string,
  template: StandardSettingTemplateSnapshot | null,
) {
  const templateHasContent = template?.structure.some((domain) => domain.groups.some((group) =>
    group.entries.some((entry) => entry.sections.some((section) =>
      section.fields.some((field) => Boolean(field.value?.trim())),
    )),
  ));
  if (templateHasContent) return true;

  return readWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey).some((entry) => {
    const tab = normalizeTabName(entry.tab);
    if (tab === SETTING_TAB) {
      const setting = parseSettingContent(entry.content);
      const fieldSet = getStructuredSettingFieldSet(entry, setting);
      const genericSections = fieldSet ? null : parseSectionedSettingBody(setting.body);
      const bodyHasContent = fieldSet
        ? Object.values(parseStructuredSettingFields(setting.body, fieldSet)).some((value) => value.trim())
        : genericSections && Object.keys(genericSections).length > 0
          ? Object.values(genericSections).some((value) => value.trim())
          : Boolean(setting.body.trim());
      return bodyHasContent
        || hasItems(setting.statusHistory)
        || hasItems(setting.pendingStatusUpdates)
        || hasKeys(setting.fieldUpdatePolicies);
    }
    if (tab !== ROLE_TAB) return false;
    const role = parseRoleContent(entry.content);
    return Object.values(parsePromptRoleFields(role)).some((value) => value.trim())
      || role.lifeStatus === '死亡'
      || hasItems(role.history)
      || hasItems(role.statusHistory)
      || hasItems(role.pendingStatusUpdates)
      || hasKeys(role.stateUpdateChapters)
      || hasKeys(role.fieldUpdatePolicies);
  });
}
