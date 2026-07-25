export type SettingFieldUpdatePolicy = '锁定' | '谨慎更新' | '变化时检测' | '每章检测' | '关键变化';
export type SettingFieldUpdateKind = '状态变化' | '信息补充' | '内容纠错';

export type SettingFieldHistoryEvent = {
  id: string;
  fieldKey: string;
  fieldLabel: string;
  kind: SettingFieldUpdateKind;
  before: string;
  after: string;
  chapter?: number;
  paragraph?: number;
  evidence?: string;
  context?: string;
  reason?: string;
  confirmedAt: string;
};

export type PendingSettingFieldUpdate = Omit<SettingFieldHistoryEvent, 'confirmedAt'>;

const POLICIES = new Set<SettingFieldUpdatePolicy>(['锁定', '谨慎更新', '变化时检测', '每章检测', '关键变化']);
const UPDATE_KINDS = new Set<SettingFieldUpdateKind>(['状态变化', '信息补充', '内容纠错']);

function normalizeEvent(value: unknown, pending: boolean): SettingFieldHistoryEvent | PendingSettingFieldUpdate | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || typeof record.fieldKey !== 'string') return null;
  if (typeof record.before !== 'string' || typeof record.after !== 'string') return null;
  const base = {
    id: record.id,
    fieldKey: record.fieldKey,
    fieldLabel: typeof record.fieldLabel === 'string' ? record.fieldLabel : record.fieldKey,
    kind: UPDATE_KINDS.has(record.kind as SettingFieldUpdateKind)
      ? (record.kind as SettingFieldUpdateKind)
      : ('状态变化' as const),
    before: record.before,
    after: record.after,
    chapter: typeof record.chapter === 'number' && record.chapter > 0 ? Math.floor(record.chapter) : undefined,
    paragraph: typeof record.paragraph === 'number' && record.paragraph > 0 ? Math.floor(record.paragraph) : undefined,
    evidence: typeof record.evidence === 'string' ? record.evidence : undefined,
    context: typeof record.context === 'string' ? record.context : undefined,
    reason: typeof record.reason === 'string' ? record.reason : undefined,
  };
  if (pending) return base;
  return {
    ...base,
    confirmedAt: typeof record.confirmedAt === 'string' ? record.confirmedAt : '历史记录',
  };
}

export function normalizeSettingFieldHistory(value: unknown): SettingFieldHistoryEvent[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const event = normalizeEvent(item, false);
    return event ? [event as SettingFieldHistoryEvent] : [];
  });
}

export function normalizePendingSettingFieldUpdates(value: unknown): PendingSettingFieldUpdate[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const event = normalizeEvent(item, true);
    return event ? [event as PendingSettingFieldUpdate] : [];
  });
}

export function normalizeSettingFieldPolicies(value: unknown): Record<string, SettingFieldUpdatePolicy> {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).flatMap(([key, policy]) =>
      typeof policy === 'string' && POLICIES.has(policy as SettingFieldUpdatePolicy)
        ? [[key, policy as SettingFieldUpdatePolicy]]
        : [],
    ),
  );
}

export function getDefaultSettingFieldPolicy(fieldKey: string, fieldLabel: string): SettingFieldUpdatePolicy {
  const source = `${fieldKey} ${fieldLabel}`;
  if (/身份定位|世界规则|能力.*限制|使用限制|核心规则/.test(source)) return '锁定';
  if (/背景|核心性格|称号|别称|来历|真相|能力来源/.test(source)) return '谨慎更新';
  if (/生存|持有者|归属|伏笔.*阶段|当前阶段/.test(source)) return '关键变化';
  if (/当前处境|当前目标|位置|伤势|能力状态/.test(source)) return '每章检测';
  return '变化时检测';
}

export function getSettingFieldPolicy(
  policies: Record<string, SettingFieldUpdatePolicy> | undefined,
  fieldKey: string,
  fieldLabel: string,
) {
  return policies?.[fieldKey] ?? getDefaultSettingFieldPolicy(fieldKey, fieldLabel);
}

export function createConfirmedSettingFieldEvent(update: PendingSettingFieldUpdate): SettingFieldHistoryEvent {
  return {
    ...update,
    confirmedAt: new Date().toLocaleString('zh-CN'),
  };
}

export function createLegacySettingFieldEvent(options: {
  fieldKey: string;
  fieldLabel: string;
  value: string;
  chapter?: number;
}): SettingFieldHistoryEvent | null {
  if (!options.value.trim() || !options.chapter) return null;
  return {
    id: `legacy-${options.fieldKey}-${options.chapter}`,
    fieldKey: options.fieldKey,
    fieldLabel: options.fieldLabel,
    kind: '状态变化',
    before: '旧版本未保存修改前内容',
    after: options.value,
    chapter: options.chapter,
    reason: '这是从旧版“更新至章节”记录迁移出的历史。旧数据没有保存具体段落依据。',
    confirmedAt: `更新至第${options.chapter}章`,
  };
}
