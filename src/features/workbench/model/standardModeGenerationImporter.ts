import { parsePromptRoleFields } from '@/features/workbench/components/workbenchPromptRoleFields';
import { createImportedRoleContent } from '@/features/workbench/components/workbenchSmartImport';
import { parseRoleContent, stringifyRoleContent } from '@/features/workbench/components/workbenchRoleContent';
import {
  parseSectionedSettingBody,
  parseSettingContent,
  stringifySettingContent,
} from '@/features/workbench/components/workbenchStructuredSettings';
import {
  createWorkbenchLibraryEntry,
  readWorkbenchLibraryEntriesWithGlobalBrainstorm,
  writeWorkbenchLibraryEntriesWithGlobalBrainstorm,
  type WorkbenchLibraryEntry,
} from './workbenchLibraryStorage';
import {
  parseStandardSettingGenerationOutput,
  type ParsedStandardSettingItem,
} from './standardModeGenerationProtocol';
import type { StandardSettingGenerationTarget } from './standardModeSettingGenerationTargets';

export type StandardSettingGenerationImportResult =
  | { ok: true; importedEntryIds: string[] }
  | { ok: false; error: string };

function hasVisibleContent(entry: WorkbenchLibraryEntry) {
  if (entry.tab === '角色') {
    return Object.values(parsePromptRoleFields(parseRoleContent(entry.content))).some((value) => value.trim());
  }
  const setting = parseSettingContent(entry.content);
  const sections = parseSectionedSettingBody(setting.body);
  return Object.values(sections).some((value) => value.trim()) || Boolean(setting.body.trim() && !Object.keys(sections).length);
}

function buildSectionedBody(target: StandardSettingGenerationTarget, item: ParsedStandardSettingItem) {
  return (target.fields ?? []).map((field) => `【${field.title}】：\n${item.fields[field.id].trim()}`).join('\n\n');
}

function createSettingEntry(
  base: WorkbenchLibraryEntry | undefined,
  target: StandardSettingGenerationTarget,
  item: ParsedStandardSettingItem,
  id: string,
  stepId: string,
) {
  const baseSetting = base ? parseSettingContent(base.content) : null;
  const title = target.rule?.titleFieldId ? item.title : target.title;
  return {
    ...(base ?? createWorkbenchLibraryEntry('大纲', title)),
    id,
    tab: '大纲',
    title,
    content: stringifySettingContent({
      ...(baseSetting ?? { type: target.groupTitle, body: '' }),
      type: target.groupTitle,
      body: buildSectionedBody(target, item),
    }),
    standardGenerationStepId: stepId,
    standardTemplateEntryId: target.templateEntryId ?? target.id,
    standardTemplateGenerated: true,
    standardTemplatePlaceholder: false,
    standardTemplateCollection: target.rule?.mode === 'collection',
    updatedAt: new Date().toLocaleString('zh-CN'),
  } satisfies WorkbenchLibraryEntry;
}

function createRoleEntry(
  base: WorkbenchLibraryEntry | undefined,
  target: StandardSettingGenerationTarget,
  item: ParsedStandardSettingItem,
  id: string,
  stepId: string,
) {
  const title = target.rule?.titleFieldId ? item.title : target.title;
  const body = buildSectionedBody(target, item);
  const role = createImportedRoleContent(
    { title, body },
    base ? parseRoleContent(base.content) : undefined,
  );
  return {
    ...(base ?? createWorkbenchLibraryEntry('角色', title)),
    id,
    tab: '角色',
    title,
    content: stringifyRoleContent(role),
    standardGenerationStepId: stepId,
    standardTemplateEntryId: target.templateEntryId ?? target.id,
    standardTemplateGenerated: true,
    standardTemplatePlaceholder: false,
    standardTemplateCollection: target.rule?.mode === 'collection',
    updatedAt: new Date().toLocaleString('zh-CN'),
  } satisfies WorkbenchLibraryEntry;
}

function buildTargetReplacement(
  entries: WorkbenchLibraryEntry[],
  target: StandardSettingGenerationTarget,
  items: ParsedStandardSettingItem[],
  stepId: string,
) {
  const templateEntryId = target.templateEntryId ?? target.id;
  const matching = entries.filter((entry) =>
    entry.id === templateEntryId || entry.standardTemplateEntryId === templateEntryId,
  );
  const base = matching.find((entry) => entry.id === templateEntryId) ?? matching[0];
  const createEntry = target.sourceKind === 'role' ? createRoleEntry : createSettingEntry;
  if (target.rule?.mode !== 'collection') {
    return [createEntry(base, target, items[0], base?.id ?? templateEntryId, stepId)];
  }
  const manualEntries = matching.filter((entry) =>
    !entry.standardTemplateGenerated
    && (!entry.standardTemplatePlaceholder || hasVisibleContent(entry)),
  ).map((entry) => ({ ...entry, standardTemplatePlaceholder: false }));
  const generatedEntries = items.map((item, index) => createEntry(
    base,
    target,
    item,
    `${templateEntryId}:generated:${index + 1}`,
    stepId,
  ));
  return [...manualEntries, ...generatedEntries];
}

export function importStandardSettingGenerationOutput({
  settingsStorageKey,
  output,
  stepId,
  targets,
}: {
  settingsStorageKey: string;
  output: string;
  stepId: string;
  targets: StandardSettingGenerationTarget[];
}): StandardSettingGenerationImportResult {
  const parsed = parseStandardSettingGenerationOutput(output, targets);
  if (!parsed.ok) return parsed;
  const parsedByTargetId = new Map(parsed.entries.map((entry) => [entry.templateEntryId, entry.items]));
  const entries = readWorkbenchLibraryEntriesWithGlobalBrainstorm(settingsStorageKey);
  const replacements = new Map<string, WorkbenchLibraryEntry[]>();
  targets.forEach((target) => {
    const templateEntryId = target.templateEntryId ?? target.id;
    replacements.set(templateEntryId, buildTargetReplacement(
      entries,
      target,
      parsedByTargetId.get(templateEntryId) ?? [],
      stepId,
    ));
  });

  const emitted = new Set<string>();
  const nextEntries = entries.flatMap((entry) => {
    const templateEntryId = entry.standardTemplateEntryId
      ?? (replacements.has(entry.id) ? entry.id : '');
    if (!templateEntryId || !replacements.has(templateEntryId)) return [entry];
    if (emitted.has(templateEntryId)) return [];
    emitted.add(templateEntryId);
    return replacements.get(templateEntryId) ?? [];
  });
  replacements.forEach((replacement, templateEntryId) => {
    if (!emitted.has(templateEntryId)) nextEntries.push(...replacement);
  });
  const importedEntryIds = Array.from(replacements.values()).flat().map((entry) => entry.id);
  if (importedEntryIds.length === 0) return { ok: false, error: '生成结果没有可写入的设定。' };
  writeWorkbenchLibraryEntriesWithGlobalBrainstorm(settingsStorageKey, nextEntries);
  return { ok: true, importedEntryIds };
}
