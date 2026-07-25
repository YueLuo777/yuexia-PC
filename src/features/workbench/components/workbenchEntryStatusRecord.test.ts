import { describe, expect, it } from 'vitest';

import type { Chapter } from '@/features/workbench/model/workbenchTypes';

import { getRoleStateSettings, parseRoleContent, stringifyRoleContent } from './workbenchRoleContent';
import { getExistingWorkbenchEntryStatus, upsertWorkbenchEntryStatus } from './workbenchEntryStatusRecord';
import { parseSettingContent, stringifySettingContent } from './workbenchStructuredSettings';

const chapter = { id: 12, serialNumber: 12, title: '黑石镇' } as Chapter;

describe('workbench entry status record', () => {
  it('updates role JSON without appending text after the JSON document', () => {
    const content = stringifyRoleContent(parseRoleContent(JSON.stringify({
      type: '女主角', lifeStatus: '存活', baseSetting: '', relationship: '',
      stateSettings: { currentSituation: '', currentGoal: '', abilityState: '', resourceState: '', otherState: '' },
    })));
    const nextContent = upsertWorkbenchEntryStatus(content, chapter, '已进入黑石镇，右肩伤势加重');
    expect(() => JSON.parse(nextContent)).not.toThrow();
    const role = parseRoleContent(nextContent);
    expect(getRoleStateSettings(role).otherState).toBe('已进入黑石镇，右肩伤势加重');
    expect(role.statusHistory?.[0]).toMatchObject({ fieldKey: 'otherState', chapter: 12 });
    expect(getExistingWorkbenchEntryStatus(nextContent, 12)).toBe('已进入黑石镇，右肩伤势加重');
  });

  it('keeps structured setting JSON valid and stores field-level history', () => {
    const content = stringifySettingContent({ type: '物品装备', body: '【名称】：\n赤霄剑' });
    const nextContent = upsertWorkbenchEntryStatus(content, chapter, '当前持有者已变为韩策');
    expect(() => JSON.parse(nextContent)).not.toThrow();
    const setting = parseSettingContent(nextContent);
    expect(setting.body).toContain('【状态记录】');
    expect(setting.statusHistory?.[0]).toMatchObject({ fieldKey: 'statusRecord', chapter: 12 });
    expect(getExistingWorkbenchEntryStatus(nextContent, 12)).toBe('当前持有者已变为韩策');
  });
});
