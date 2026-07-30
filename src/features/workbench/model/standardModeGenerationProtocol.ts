import type { StandardSettingGenerationTarget } from './standardModeSettingGenerationTargets';

export const STANDARD_SETTING_OUTPUT_PROTOCOL_VERSION = 'setting-output-lines-v1' as const;

export type ParsedStandardSettingItem = {
  title: string;
  fields: Record<string, string>;
};

export type ParsedStandardSettingEntry = {
  templateEntryId: string;
  items: ParsedStandardSettingItem[];
};

export type StandardSettingProtocolParseResult =
  | { ok: true; entries: ParsedStandardSettingEntry[] }
  | { ok: false; error: string };

type ItemDraft = {
  title: string;
  fields: Record<string, string>;
  activeFieldId: string;
};

function finishField(item: ItemDraft, fieldLines: string[]) {
  if (!item.activeFieldId) return;
  item.fields[item.activeFieldId] = fieldLines.join('\n').trim();
  item.activeFieldId = '';
  fieldLines.length = 0;
}

export function parseStandardSettingGenerationOutput(
  output: string,
  targets: StandardSettingGenerationTarget[],
): StandardSettingProtocolParseResult {
  const targetById = new Map(targets.map((target) => [target.templateEntryId ?? target.id, target]));
  const parsedEntries: ParsedStandardSettingEntry[] = [];
  let currentEntry: ParsedStandardSettingEntry | null = null;
  let currentItem: ItemDraft | null = null;
  const fieldLines: string[] = [];

  const fail = (error: string): StandardSettingProtocolParseResult => ({ ok: false, error });
  const lines = output.replace(/\r\n/g, '\n').trim().split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const entryMatch = line.match(/^\[\[SETTING_ENTRY:([^\]\n]+)\]\]$/);
    const fieldMatch = line.match(/^\[\[FIELD:([^\]\n]+)\]\](.*)$/);
    if (entryMatch) {
      if (currentEntry || currentItem) return fail('输出协议中的设定块发生嵌套。');
      const templateEntryId = entryMatch[1].trim();
      if (!targetById.has(templateEntryId)) return fail(`输出包含未请求的设定ID：${templateEntryId}`);
      if (parsedEntries.some((entry) => entry.templateEntryId === templateEntryId)) {
        return fail(`设定ID重复输出：${templateEntryId}`);
      }
      currentEntry = { templateEntryId, items: [] };
      continue;
    }
    if (line === '[[ITEM]]') {
      if (!currentEntry || currentItem) return fail('ITEM 标记位置无效。');
      currentItem = { title: '', fields: {}, activeFieldId: '' };
      continue;
    }
    if (line.startsWith('[[TITLE]]')) {
      if (!currentItem || currentItem.activeFieldId || currentItem.title) return fail('TITLE 标记位置无效或重复。');
      currentItem.title = line.slice('[[TITLE]]'.length).trim();
      continue;
    }
    if (fieldMatch) {
      if (!currentEntry || !currentItem) return fail('FIELD 标记必须位于 ITEM 内。');
      finishField(currentItem, fieldLines);
      const fieldId = fieldMatch[1].trim();
      const target = targetById.get(currentEntry.templateEntryId);
      const validFieldIds = new Set(target?.fields?.map((field) => field.id) ?? []);
      if (!validFieldIds.has(fieldId)) return fail(`输出包含未请求的字段ID：${fieldId}`);
      if (Object.hasOwn(currentItem.fields, fieldId)) return fail(`字段ID重复输出：${fieldId}`);
      currentItem.activeFieldId = fieldId;
      fieldLines.push(fieldMatch[2].trimStart());
      continue;
    }
    if (line === '[[END_ITEM]]') {
      if (!currentEntry || !currentItem) return fail('END_ITEM 标记位置无效。');
      finishField(currentItem, fieldLines);
      if (!currentItem.title) return fail(`设定 ${currentEntry.templateEntryId} 缺少名称。`);
      currentEntry.items.push({ title: currentItem.title, fields: currentItem.fields });
      currentItem = null;
      continue;
    }
    if (line === '[[END_SETTING_ENTRY]]') {
      if (!currentEntry || currentItem) return fail('END_SETTING_ENTRY 标记位置无效。');
      parsedEntries.push(currentEntry);
      currentEntry = null;
      continue;
    }
    if (!currentItem?.activeFieldId) {
      if (line.trim()) return fail(`输出协议外存在额外内容：${line.slice(0, 30)}`);
      continue;
    }
    fieldLines.push(rawLine);
  }
  if (currentEntry || currentItem) return fail('输出协议没有完整结束。');

  for (const target of targets) {
    const templateEntryId = target.templateEntryId ?? target.id;
    const parsed = parsedEntries.find((entry) => entry.templateEntryId === templateEntryId);
    const rule = target.rule;
    const minCount = rule?.mode === 'collection' ? rule.minCount : 1;
    const maxCount = rule?.mode === 'collection' ? rule.maxCount : 1;
    const count = parsed?.items.length ?? 0;
    if (count < minCount || count > maxCount) {
      return fail(`“${target.title}”生成数量应为 ${minCount}-${maxCount} 项，实际为 ${count} 项。`);
    }
    if (!parsed && minCount === 0) continue;
    const requiredFieldIds = target.fields?.map((field) => field.id) ?? [];
    for (const item of parsed?.items ?? []) {
      const missingField = requiredFieldIds.find((fieldId) => !item.fields[fieldId]?.trim());
      if (missingField) {
        const fieldTitle = target.fields?.find((field) => field.id === missingField)?.title ?? missingField;
        return fail(`“${target.title}”中的“${fieldTitle}”没有生成内容。`);
      }
      if (rule?.titleFieldId && item.fields[rule.titleFieldId]?.trim() !== item.title) {
        return fail(`“${target.title}”的名称必须与名称字段内容完全一致。`);
      }
      if (!rule?.titleFieldId && item.title !== target.title) {
        return fail(`固定设定“${target.title}”不能改名为“${item.title}”。`);
      }
    }
  }
  return { ok: true, entries: parsedEntries };
}
