export const DEFAULT_TEXT_AUDIT_COUNTDOWN_SECONDS = 3;
export const MIN_TEXT_AUDIT_COUNTDOWN_SECONDS = 0;
export const MAX_TEXT_AUDIT_COUNTDOWN_SECONDS = 300;
export const CHAPTER_AUDIT_WORKFLOW_STORAGE_KEY = 'xinyuexia_chapter_audit_workflow_settings_v1';

export type AuditTextStageStatus =
  | 'countdown'
  | 'running'
  | 'blocked'
  | 'cancelled'
  | 'disabled'
  | 'complete';

export type AuditTextStageState = {
  status: AuditTextStageStatus;
  seconds: number;
};

type CountdownDecision = 'start' | 'cancel';

const AUDIT_TEXT_STAGE_PATTERN = /\[\[AUDIT_TEXT_STAGE status=(countdown|running|blocked|cancelled|disabled|complete) seconds=(\d+)\]\]/g;
const countdownDecisions = new Map<string, CountdownDecision>();

export function normalizeTextAuditCountdownSeconds(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_TEXT_AUDIT_COUNTDOWN_SECONDS;
  return Math.min(MAX_TEXT_AUDIT_COUNTDOWN_SECONDS, Math.max(MIN_TEXT_AUDIT_COUNTDOWN_SECONDS, Math.round(parsed)));
}

export function readTextAuditCountdownSeconds() {
  try {
    const stored = JSON.parse(localStorage.getItem(CHAPTER_AUDIT_WORKFLOW_STORAGE_KEY) ?? '{}') as {
      textAuditCountdownSeconds?: number;
    };
    return normalizeTextAuditCountdownSeconds(stored.textAuditCountdownSeconds);
  } catch {
    return DEFAULT_TEXT_AUDIT_COUNTDOWN_SECONDS;
  }
}

export function writeTextAuditCountdownSeconds(value: number) {
  const normalized = normalizeTextAuditCountdownSeconds(value);
  localStorage.setItem(
    CHAPTER_AUDIT_WORKFLOW_STORAGE_KEY,
    JSON.stringify({ textAuditCountdownSeconds: normalized }),
  );
  return normalized;
}

export function formatAuditTextStage(state: AuditTextStageState) {
  return `[[AUDIT_TEXT_STAGE status=${state.status} seconds=${normalizeTextAuditCountdownSeconds(state.seconds)}]]`;
}

export function getAuditTextStageState(output: string): AuditTextStageState | null {
  const matches = [...output.matchAll(AUDIT_TEXT_STAGE_PATTERN)];
  const match = matches[matches.length - 1];
  if (!match) return null;
  return {
    status: match[1] as AuditTextStageStatus,
    seconds: normalizeTextAuditCountdownSeconds(match[2]),
  };
}

export function stripAuditTextStageMarkers(output: string) {
  return output.replace(AUDIT_TEXT_STAGE_PATTERN, '').replace(/\n{3,}/g, '\n\n').trimEnd();
}

export function setAuditTextCountdownDecision(taskId: string | undefined, decision: CountdownDecision) {
  if (!taskId) return;
  countdownDecisions.set(taskId, decision);
}

function takeCountdownDecision(taskId: string) {
  const decision = countdownDecisions.get(taskId);
  if (decision) countdownDecisions.delete(taskId);
  return decision;
}

function waitForTick(signal: AbortSignal, milliseconds: number) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, milliseconds);
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

export async function waitForAuditTextCountdown(options: {
  taskId: string;
  seconds: number;
  signal: AbortSignal;
  onTick: (seconds: number) => void;
}) {
  let remaining = normalizeTextAuditCountdownSeconds(options.seconds);
  options.onTick(remaining);
  if (remaining === 0) return 'start' as const;

  while (remaining > 0) {
    for (let elapsed = 0; elapsed < 1000; elapsed += 100) {
      const decision = takeCountdownDecision(options.taskId);
      if (decision) return decision;
      await waitForTick(options.signal, 100);
    }
    remaining -= 1;
    options.onTick(remaining);
  }
  countdownDecisions.delete(options.taskId);
  return 'start' as const;
}

export function buildNumberedTextAuditBody(content: string) {
  return content.replace(/\r\n/g, '\n').split('\n').map((paragraph, index) => {
    const body = paragraph || '（空段，不要修改）';
    return `【第${index + 1}段】\n${body}`;
  }).join('\n\n');
}

export function buildTextAuditStagePrompt(textAuditPrompt: string) {
  return [
    textAuditPrompt.trim(),
    '【软件固定输出协议】',
    '以下协议优先于前述提示词中关于输出完整正文、修改后全文或段落数量的要求。',
    '正文已经由软件添加固定段落序号。只检查文本问题，不审核剧情，不改变故事走向。',
    '段首全角空格、半角空格、制表符和空行属于排版，不是文本问题，必须保留。',
    '如果没有明确文本问题，只输出：',
    '【文本审核结果】\n【结果】通过\n【说明】未发现需要修改的明确文本问题。',
    '如果存在问题，先输出【文本审核结果】【结果】不通过和简要说明，然后仅按以下格式输出有问题的段落：',
    '【修改段落】\n【段落序号】第N段\n【修改后段落】该段修改后的完整内容\n【修改原因】简要原因',
    '多个问题段落按原序号重复【修改段落】结构。不要输出无问题段落，不要输出修改后全文。',
    '不得合并、拆分、调换或删除段落；不得输出HTML、Markdown、颜色标签、删除线或固定格式之外的内容。',
  ].filter(Boolean).join('\n\n');
}
