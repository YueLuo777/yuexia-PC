import { describe, expect, it } from 'vitest';

import { createEmptyRoleStateSettings, stringifyRoleContent } from './workbenchRoleContent';
import { buildWorkbenchRoleTypeOptions } from './workbenchRoleTypeOptions';

describe('buildWorkbenchRoleTypeOptions', () => {
  it('combines defaults, custom types and saved role entries while respecting hidden types', () => {
    const options = buildWorkbenchRoleTypeOptions({
      entries: [
        {
          id: 'role-1',
          tab: '角色',
          title: '测试角色',
          content: stringifyRoleContent({
            type: '宗门长老',
            lifeStatus: '存活',
            baseSetting: '',
            relationship: '',
            stateSettings: createEmptyRoleStateSettings(),
            personality: '',
            background: '',
            status: '',
          }),
          updatedAt: '2026-07-12',
        },
      ],
      customRoleTypes: ['客卿', '未分类'],
      hiddenRoleTypes: ['女主角'],
    });

    expect(options).toContain('宗门长老');
    expect(options).toContain('客卿');
    expect(options).not.toContain('女主角');
    expect(options).not.toContain('未分类');
  });
});
