import type { CSSProperties } from 'react';

import { stripAiThinkingBlock, stripBrainstormRequestHeader } from './workbenchLibraryAiText';

export type BrainstormAiConfigSnapshot = {
  aiInput?: string;
  aiOutput?: string;
  aiResult?: string;
};

export type BrainstormQuestionKey =
  | 'brainstormGenre'
  | 'brainstormBackground'
  | 'brainstormIdea'
  | 'brainstormCheat'
  | 'brainstormCount'
  | 'brainstormRequirement';

export type BrainstormQuestionDraft = Record<BrainstormQuestionKey, string>;

export const EMPTY_BRAINSTORM_QUESTION_DRAFT: BrainstormQuestionDraft = {
  brainstormGenre: '',
  brainstormBackground: '',
  brainstormIdea: '',
  brainstormCheat: '',
  brainstormCount: '',
  brainstormRequirement: '',
};

export type BrainstormAiSession = {
  id: string;
  input: string;
  output: string;
  result: string;
  previewTitles?: string[];
  previewDrafts?: string[];
  previewSelectedIndexes?: number[];
  previewCount?: number;
  backgroundAiTaskId?: string;
};

export function createBrainstormAiSession(id = '1', config?: BrainstormAiConfigSnapshot): BrainstormAiSession {
  return {
    id,
    input: config?.aiInput ?? '',
    output: config?.aiOutput ?? '',
    result: config?.aiResult ?? '',
  };
}

export function normalizeBrainstormAiSessions(
  value: unknown,
  fallbackConfig: BrainstormAiConfigSnapshot,
): BrainstormAiSession[] {
  if (!Array.isArray(value)) return [createBrainstormAiSession('1', fallbackConfig)];
  const sessions = value
    .map((item, index): BrainstormAiSession | null => {
      if (!item || typeof item !== 'object') return null;
      const session = item as Partial<BrainstormAiSession>;
      const id = typeof session.id === 'string' && session.id.trim() ? session.id.trim() : String(index + 1);
      return {
        id,
        input: typeof session.input === 'string' ? session.input : '',
        output: typeof session.output === 'string' ? session.output : '',
        result: typeof session.result === 'string' ? session.result : '',
        previewTitles: Array.isArray(session.previewTitles)
          ? session.previewTitles.filter((item): item is string => typeof item === 'string')
          : undefined,
        previewDrafts: Array.isArray(session.previewDrafts)
          ? session.previewDrafts.filter((item): item is string => typeof item === 'string')
          : undefined,
        previewSelectedIndexes: Array.isArray(session.previewSelectedIndexes)
          ? session.previewSelectedIndexes.filter((item): item is number => Number.isInteger(item) && item >= 0)
          : undefined,
        previewCount:
          Number.isFinite(session.previewCount) && Number(session.previewCount) > 0
            ? Number(session.previewCount)
            : undefined,
        backgroundAiTaskId: typeof session.backgroundAiTaskId === 'string' ? session.backgroundAiTaskId : undefined,
      };
    })
    .filter((session): session is BrainstormAiSession => Boolean(session));
  return sessions.length > 0 ? sessions : [createBrainstormAiSession('1', fallbackConfig)];
}

export function getActiveBrainstormAiSessionId(value: unknown, sessions: BrainstormAiSession[]) {
  const activeId = typeof value === 'string' ? value : '';
  return sessions.some((session) => session.id === activeId) ? activeId : (sessions[0]?.id ?? '1');
}

export function getBrainstormOutputCount(value: string) {
  const count = Number(normalizeBrainstormCountValue(value));
  return Number.isFinite(count) && count > 0 ? count : 1;
}

export function getTemporaryBrainstormTitle(_index: number) {
  return 'AI输出';
}

export function getSelectedBrainstormPreviewIndexes(previews: string[], selectedIndexes?: number[]) {
  if (Array.isArray(selectedIndexes)) {
    return selectedIndexes.filter((index) => index >= 0 && index < previews.length);
  }
  return previews.map((preview, index) => (preview.trim() ? index : -1)).filter((index) => index >= 0);
}

export function getFloatingTitleInputStyle(value: string, minCh: number, maxCh: number): CSSProperties {
  const normalizedLength = Math.max(
    minCh,
    Math.min(
      maxCh,
      Array.from(value.trim() || ' ').reduce((sum, char) => sum + (/[\u4e00-\u9fff]/.test(char) ? 1 : 0.62), 0) + 0.35,
    ),
  );
  return {
    '--xy-floating-title-input-width': `${normalizedLength.toFixed(2)}em`,
  } as CSSProperties;
}

export function splitBrainstormGeneratedText(text: string, count: number) {
  const clean = stripBrainstormRequestHeader(stripAiThinkingBlock(text)).trim();
  if (!clean) return Array.from({ length: count }, () => '');
  const numberedParts = clean
    .split(/\n(?=\s*(?:[-*]\s*)?(?:脑洞\s*)?\d+[.、）)]\s*)/)
    .map((part) =>
      part
        .trim()
        .replace(/^(?:[-*]\s*)?(?:脑洞\s*)?\d+[.、）)]\s*/, '')
        .trim(),
    )
    .filter(Boolean);
  const parts =
    numberedParts.length >= 2
      ? numberedParts
      : clean
          .split(/\n{2,}/)
          .map((part) => part.trim())
          .filter(Boolean);
  if (parts.length >= count) return parts.slice(0, count);
  return Array.from({ length: count }, (_, index) => parts[index] ?? (index === 0 ? clean : ''));
}

export const BRAINSTORM_QUESTION_FIELDS: Array<{
  key: BrainstormQuestionKey;
  label: string;
  placeholder: string;
}> = [
  { key: 'brainstormGenre', label: '题材', placeholder: '如都市、玄幻' },
  { key: 'brainstormBackground', label: '故事主题', placeholder: '如系统流' },
  { key: 'brainstormIdea', label: '主角金手指', placeholder: '如吞噬系统、神豪系统' },
  { key: 'brainstormCheat', label: '你的构思', placeholder: '任何灵感都可以' },
  { key: 'brainstormCount', label: '逐个生成几个脑洞', placeholder: '' },
  { key: 'brainstormRequirement', label: '补充内容', placeholder: '主角名字、性格、女主设定等' },
];
export const BRAINSTORM_OUTPUT_ONLY_INSTRUCTION =
  '请直接输出实际脑洞内容，不要复述提示词、其他要求、题材、故事主题等标签。';
export const BRAINSTORM_GENERATE_TASK_TEXT = '请根据以下信息，生成一个可以保存进脑洞库的小说脑洞设定。';
export const BRAINSTORM_GENERATE_RULE_TEXT =
  '要求：内容要具体、可继续扩展，避免只复述问题；如果信息不足，请合理补全但不要偏离用户要求。';

export function normalizeBrainstormCountValue(value: string) {
  const trimmed = value.trim();
  const legacyMatch = trimmed.match(/^(\d+)\s*个$/);
  return legacyMatch?.[1] ?? trimmed;
}

export const BRAINSTORM_PREVIEW_MIN_FONT_SIZE = 12;
export const BRAINSTORM_PREVIEW_MAX_FONT_SIZE = 28;
export const BRAINSTORM_OUTPUT_MIN_FONT_SIZE = 12;
export const BRAINSTORM_OUTPUT_MAX_FONT_SIZE = 28;
export const SETTING_PREVIEW_MIN_FONT_SIZE = 12;
export const SETTING_PREVIEW_MAX_FONT_SIZE = 28;
export const ROLE_TEXT_MIN_FONT_SIZE = 12;
export const ROLE_TEXT_MAX_FONT_SIZE = 28;
export const DETAIL_OUTLINE_MIN_FONT_SIZE = 12;
export const DETAIL_OUTLINE_MAX_FONT_SIZE = 28;
export const LIBRARY_AI_TIMEOUT_MS = 180000;
