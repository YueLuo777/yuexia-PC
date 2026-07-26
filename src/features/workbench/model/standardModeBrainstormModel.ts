import {
  createWorkbenchLibraryEntry,
  ensureBrainstormSerialNumbers,
  type WorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';
import { getBrainstormEntryBody } from '@/features/workbench/components/workbenchLibraryAiText';
import { BRAINSTORM_TYPE } from '@/features/workbench/components/workbenchLibraryTabs';
import { stringifySettingContent } from '@/features/workbench/components/workbenchStructuredSettings';

export interface StandardBrainstormVersion {
  id: string;
  title: string;
  content: string;
  sourceEntryId?: string;
}

export interface StandardBrainstormGenerationDraft {
  workType: string;
  genre: string;
  expectedLength: string;
  protagonistCheat: string;
  otherRequirements: string;
}

export const DEFAULT_STANDARD_BRAINSTORM_DRAFT: StandardBrainstormGenerationDraft = {
  workType: '',
  genre: '',
  expectedLength: '',
  protagonistCheat: '',
  otherRequirements: '',
};

export function getBrainstormTitleFieldCharacterWidth(title: string) {
  const characterCount = Array.from(title.trim()).length;
  return Math.max(6, Math.min(15, characterCount));
}

export function createVersionFromBrainstormEntry(entry: WorkbenchLibraryEntry): StandardBrainstormVersion {
  return {
    id: `saved-${entry.id}`,
    title: entry.title,
    content: getBrainstormEntryBody(entry),
    sourceEntryId: entry.id,
  };
}

export function createEmptyGeneratedVersion(): StandardBrainstormVersion {
  return {
    id: `generated-${Date.now()}`,
    title: '未命名脑洞',
    content: '',
  };
}

export function createSavedBrainstormEntry(
  entries: WorkbenchLibraryEntry[],
  requestedTitle: string,
  content: string,
) {
  const title = requestedTitle.trim() || '未命名脑洞';
  const maxSerial = entries.reduce(
    (max, entry) => Math.max(max, Number(entry.brainstormSerialNumber) || 0),
    0,
  );
  return {
    ...createWorkbenchLibraryEntry('脑洞', title),
    content: stringifySettingContent({ type: BRAINSTORM_TYPE, body: content.trim() }),
    brainstormSerialNumber: maxSerial + 1,
  } satisfies WorkbenchLibraryEntry;
}

export function normalizeBrainstormEntries(entries: WorkbenchLibraryEntry[]) {
  return ensureBrainstormSerialNumbers(entries.filter((entry) => entry.tab === '脑洞' && !entry.deletedAt));
}

export function buildStandardBrainstormGenerationRequest(
  draft: StandardBrainstormGenerationDraft,
) {
  return [
    '请生成一份可以继续扩展为网文设定的完整脑洞。',
    `作品类型：${draft.workType.trim() || '请合理补全'}`,
    `作品流派：${draft.genre.trim() || '请合理补全'}`,
    `预计篇幅：${draft.expectedLength.trim() || '请合理补全'}`,
    `主角金手指：${draft.protagonistCheat.trim() || '请合理补全'}`,
    `其他要求：${draft.otherRequirements.trim() || '无额外要求'}`,
    '请直接输出脑洞的完整内容，不要解释，不要输出编号。',
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function buildStandardBrainstormRevisionRequest(content: string, requirement: string) {
  return [
    '请根据修改要求重写下面这版脑洞。',
    '只输出修改后的完整脑洞，不要解释修改过程，不要省略未要求修改但仍然需要保留的内容。',
    `【当前脑洞】\n${content.trim()}`,
    `【修改要求】\n${requirement.trim()}`,
  ].join('\n\n');
}
