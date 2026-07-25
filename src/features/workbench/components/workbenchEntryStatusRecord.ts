import type { Chapter } from '@/features/workbench/model/workbenchTypes';
import { createConfirmedSettingFieldEvent } from '@/features/workbench/model/workbenchSettingStatus';

import { getExistingStatusForChapter, upsertEntryStatus } from './chapterEditorPresentation';
import {
  buildRoleStateSettingsText,
  getRoleStateSettings,
  getRoleStateUpdateChapters,
  parseRoleContent,
  stringifyRoleContent,
} from './workbenchRoleContent';
import { parseSettingContent, stringifySettingContent } from './workbenchStructuredSettings';

function isRoleJson(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && ('stateSettings' in value || 'lifeStatus' in value));
}

function isSettingJson(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && 'body' in value && 'type' in value);
}

export function getExistingWorkbenchEntryStatus(content: string, chapterSerial: number) {
  try {
    const raw = JSON.parse(content) as unknown;
    if (isRoleJson(raw)) {
      const role = parseRoleContent(content);
      const historyValue = role.statusHistory?.find(
        (event) => event.chapter === chapterSerial && event.fieldKey === 'otherState',
      )?.after;
      if (historyValue) return historyValue;
      return getRoleStateUpdateChapters(role).otherState === chapterSerial
        ? getRoleStateSettings(role).otherState
        : '';
    }
    if (isSettingJson(raw)) {
      const setting = parseSettingContent(content);
      return setting.statusHistory?.find(
        (event) => event.chapter === chapterSerial && event.fieldKey === 'statusRecord',
      )?.after ?? getExistingStatusForChapter(setting.body, chapterSerial);
    }
  } catch {
    // Legacy plain-text entries continue through the old status marker reader.
  }
  return getExistingStatusForChapter(content, chapterSerial);
}

export function upsertWorkbenchEntryStatus(content: string, chapter: Chapter, status: string) {
  const cleanStatus = status.trim();
  if (!cleanStatus) return content;
  try {
    const raw = JSON.parse(content) as unknown;
    if (isRoleJson(raw)) {
      const role = parseRoleContent(content);
      const stateSettings = getRoleStateSettings(role);
      const before = stateSettings.otherState;
      const event = createConfirmedSettingFieldEvent({
        id: `manual-role-status-${chapter.id}-${Date.now()}`,
        fieldKey: 'otherState',
        fieldLabel: '其他',
        kind: '状态变化',
        before,
        after: cleanStatus,
        chapter: chapter.serialNumber,
        reason: '由用户在章节“更新状态”流程中确认写入。',
      });
      const nextStateSettings = { ...stateSettings, otherState: cleanStatus };
      return stringifyRoleContent({
        ...role,
        stateSettings: nextStateSettings,
        stateUpdateChapters: { ...getRoleStateUpdateChapters(role), otherState: chapter.serialNumber },
        status: buildRoleStateSettingsText(nextStateSettings),
        statusHistory: [event, ...(role.statusHistory ?? [])],
      });
    }
    if (isSettingJson(raw)) {
      const setting = parseSettingContent(content);
      const before = getExistingStatusForChapter(setting.body, chapter.serialNumber);
      const event = createConfirmedSettingFieldEvent({
        id: `manual-setting-status-${chapter.id}-${Date.now()}`,
        fieldKey: 'statusRecord',
        fieldLabel: '状态记录',
        kind: '状态变化',
        before,
        after: cleanStatus,
        chapter: chapter.serialNumber,
        reason: '由用户在章节“更新状态”流程中确认写入。',
      });
      return stringifySettingContent({
        ...setting,
        body: upsertEntryStatus(setting.body, chapter, cleanStatus),
        statusHistory: [event, ...(setting.statusHistory ?? [])],
      });
    }
  } catch {
    // Legacy plain text remains compatible with the original marker format.
  }
  return upsertEntryStatus(content, chapter, cleanStatus);
}
