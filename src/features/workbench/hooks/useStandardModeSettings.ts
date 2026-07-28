import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  hasStandardModeSettingEntries,
  replaceProfessionalSettingEntriesFromTemplate,
} from '@/features/workbench/model/standardModeDefaultSettingAdapter';
import {
  buildTemplateSettingEntries,
  findEmptyStandardSettingFields,
  readStandardSettingTemplateState,
  updateTemplateSettingField,
  writeStandardSettingTemplateState,
  type StandardSettingEmptyField,
  type StandardSettingTemplateState,
} from '@/features/workbench/model/standardModeSettingModel';
import { subscribeStandardModeSettingNavigationAction } from '@/features/workbench/model/standardModeSettingNavigationEvents';
import {
  cloneTemplateStructure,
  type TemplateStructure,
} from '@/features/workbench/model/standardModeTemplateModel';

function createBookTemplateState(templateId: string, templateName: string, structure: TemplateStructure) {
  const cleanStructure = cloneTemplateStructure(structure).map((domain) => ({
    ...domain,
    groups: domain.groups.map((group) => ({
      ...group,
      entries: group.entries.map((entry) => ({
        ...entry,
        sections: entry.sections.map((section) => ({
          ...section,
          fields: section.fields.map((field) => ({ ...field, value: '' })),
        })),
      })),
    })),
  }));
  return {
    version: 2,
    mode: 'template',
    templateId,
    templateName,
    structure: cleanStructure,
  } satisfies StandardSettingTemplateState;
}

export function useStandardModeSettings(novelId: string, settingsStorageKey: string) {
  const [template, setTemplate] = useState<StandardSettingTemplateState | null>(() =>
    readStandardSettingTemplateState(novelId),
  );
  const [hasExistingSettings, setHasExistingSettings] = useState(() =>
    Boolean(readStandardSettingTemplateState(novelId)) || hasStandardModeSettingEntries(settingsStorageKey),
  );
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [checkResults, setCheckResults] = useState<StandardSettingEmptyField[] | null>(null);
  const [focusTarget, setFocusTarget] = useState<{ entryId: string; fieldKey: string; nonce: number } | null>(null);

  useEffect(() => {
    const saved = readStandardSettingTemplateState(novelId);
    setTemplate(saved);
    setHasExistingSettings(Boolean(saved) || hasStandardModeSettingEntries(settingsStorageKey));
    setSelectedEntryId(null);
    setCheckResults(null);
    setFocusTarget(null);
  }, [novelId, settingsStorageKey]);

  useEffect(
    () => subscribeStandardModeSettingNavigationAction((event) => {
      if (event.storageKey !== settingsStorageKey || event.action !== 'settings-cleared') return;
      const saved = readStandardSettingTemplateState(novelId);
      setTemplate(saved);
      setHasExistingSettings(Boolean(saved) || hasStandardModeSettingEntries(settingsStorageKey));
      setCheckResults(null);
      setFocusTarget(null);
    }),
    [novelId, settingsStorageKey],
  );

  const entries = useMemo(() => template ? buildTemplateSettingEntries(template.structure) : [], [template]);

  useEffect(() => {
    if (entries.length === 0) {
      setSelectedEntryId(null);
      return;
    }
    if (!selectedEntryId || !entries.some((entry) => entry.id === selectedEntryId)) {
      setSelectedEntryId(entries[0].id);
    }
  }, [entries, selectedEntryId]);

  const initializeTemplate = useCallback((templateId: string, templateName: string, structure: TemplateStructure) => {
    const next = createBookTemplateState(templateId, templateName, structure);
    replaceProfessionalSettingEntriesFromTemplate(settingsStorageKey, next.structure);
    writeStandardSettingTemplateState(novelId, next);
    setTemplate(next);
    setHasExistingSettings(true);
    setCheckResults(null);
    setSelectedEntryId(null);
  }, [novelId, settingsStorageKey]);

  const updateField = useCallback((entryId: string, fieldKey: string, _fieldTitle: string, value: string) => {
    if (!template) return;
    const next: StandardSettingTemplateState = {
      ...template,
      structure: updateTemplateSettingField(template.structure, entryId, fieldKey, value),
    };
    writeStandardSettingTemplateState(novelId, next);
    setTemplate(next);
    setCheckResults(null);
  }, [novelId, template]);

  const runCheck = useCallback(() => {
    const results = findEmptyStandardSettingFields(entries);
    setCheckResults(results);
    return results;
  }, [entries]);

  const jumpToEmptyField = useCallback((result: StandardSettingEmptyField) => {
    setSelectedEntryId(result.entryId);
    setFocusTarget({ entryId: result.entryId, fieldKey: result.fieldKey, nonce: Date.now() });
  }, []);

  return {
    template,
    hasExistingSettings,
    entries,
    selectedEntryId,
    selectedEntry: entries.find((entry) => entry.id === selectedEntryId) ?? null,
    checkResults,
    focusTarget,
    setSelectedEntryId,
    initializeTemplate,
    updateField,
    runCheck,
    jumpToEmptyField,
  };
}
