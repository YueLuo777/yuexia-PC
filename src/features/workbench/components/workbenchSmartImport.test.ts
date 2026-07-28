import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { parsePromptRoleFields } from './workbenchPromptRoleFields';
import {
  createImportedRoleContent,
  createSmartSettingSegments,
  createTaggedSettingSegments,
  filterStandardGenerationDuplicateEntries,
  normalizeImportedSettingBody,
  normalizeImportedSettingKey,
  takeCanonicalImportedSettingEntry,
} from './workbenchSmartImport';

describe('workbench role smart import', () => {
  it('limits standard generation matching to the original allowed entry', () => {
    const entries: WorkbenchLibraryEntry[] = [
      { id: 'generated', tab: '大纲', title: '作品定位', content: JSON.stringify({ type: '核心设定', body: '错误副本' }), updatedAt: '' },
      { id: 'original', tab: '大纲', title: '作品定位', content: JSON.stringify({ type: '核心设定', body: '' }), updatedAt: '' },
    ];

    const matched = takeCanonicalImportedSettingEntry(
      entries,
      '作品定位',
      '核心设定',
      new Set(['original']),
    );

    expect(matched?.id).toBe('original');
    expect(entries.map((entry) => entry.id)).toEqual(['generated']);
  });

  it('removes only malformed duplicates of standard generation targets after a successful import', () => {
    const originalEntries: WorkbenchLibraryEntry[] = [
      { id: 'original', tab: '大纲', title: '世界背景', content: '{}', updatedAt: '' },
    ];
    const remainingEntries: WorkbenchLibraryEntry[] = [
      { id: 'bad-group', tab: '大纲', title: '<基础设定>', content: '{}', updatedAt: '' },
      { id: 'bad-title', tab: '大纲', title: '世界背景：世界名为九州', content: '{}', updatedAt: '' },
      { id: 'bad-exact', tab: '大纲', title: '世界背景', content: '{}', updatedAt: '' },
      { id: 'user-entry', tab: '大纲', title: '九州风土', content: '{}', updatedAt: '' },
    ];

    expect(filterStandardGenerationDuplicateEntries(
      remainingEntries,
      originalEntries,
      new Set(['original']),
    ).map((entry) => entry.id)).toEqual(['user-entry']);
  });

  it('matches decorative setting titles and unwraps leaked internal JSON', () => {
    expect(normalizeImportedSettingKey('【作品定位】')).toBe('作品定位');
    expect(normalizeImportedSettingKey('*作品定位*：')).toBe('作品定位');
    expect(
      normalizeImportedSettingBody(
        '【作品定位】\n{"type":"核心设定","body":"只保留这段设定内容","structuredFieldSetId":"internal-id"}',
        '【作品定位】',
      ),
    ).toBe('只保留这段设定内容');
  });

  it('splits adjacent bracket-titled settings even when streaming output has only one line break', () => {
    const segments = createSmartSettingSegments(
      '【作品定位】\n{"type":"核心设定","body":"定位内容"}\n【世界背景】\n{"type":"核心设定","body":"背景内容"}',
    );

    expect(segments.map((segment) => normalizeImportedSettingKey(segment.title))).toEqual(['作品定位', '世界背景']);
    expect(segments.map((segment) => normalizeImportedSettingBody(segment.body, segment.title))).toEqual([
      '定位内容',
      '背景内容',
    ]);
  });

  it('splits multiple people from the fixed person setting tag', () => {
    const parsed = createTaggedSettingSegments(`<人物设定>
*林刻*：
【人物姓名】：
林刻

【身份定位】：
男主角

*赵玄*：
【人物姓名】：
赵玄

【身份定位】：
重要反派角色
</人物设定>`);

    expect(parsed.settingSegments).toEqual([]);
    expect(parsed.roleSegments.map((role) => role.title)).toEqual(['林刻', '赵玄']);
  });

  it('imports the formal protagonist fields instead of dropping them into the legacy body', () => {
    const role = createImportedRoleContent({
      title: '林刻',
      body: `【人物姓名】：
林刻

【身份定位】：
男主角

【生存状态】：
存活

【性格】：
冷静克制，遇到弱者受欺时会主动出手。

【当前目标】：
通过天剑宗入门考核。

【金手指当前功能】：
能够识别功法缺陷。

【金手指当前解锁状态】：
只能检查黄阶功法，每日三次。

【当前境界】：
炼气六层。

【人物关系】：
与赵玄因考核名额发生冲突。`,
    });
    const fields = parsePromptRoleFields(role);

    expect(role.type).toBe('男主角');
    expect(role.lifeStatus).toBe('存活');
    expect(role.stateSettings.currentGoal).toBe('通过天剑宗入门考核。');
    expect(role.stateSettings.abilityState).toBe('只能检查黄阶功法，每日三次。');
    expect(role.relationship).toBe('与赵玄因考核名额发生冲突。');
    expect(fields).toMatchObject({
      'prompt:protagonist:性格': '冷静克制，遇到弱者受欺时会主动出手。',
      'prompt:protagonist:当前目标': '通过天剑宗入门考核。',
      'prompt:protagonist:金手指当前功能': '能够识别功法缺陷。',
      'prompt:protagonist:当前境界': '炼气六层。',
    });
  });

  it('imports supporting and antagonist specific fields and keeps the prompt format aligned', () => {
    const supporting = createImportedRoleContent({
      title: '苏晚凝',
      body: `【身份定位】：
女主角

【剧情作用】：
揭开天剑宗内部派系冲突。

【利益立场】：
优先保护师门普通弟子。

【人物关系】：
暂时观察林刻。`,
    });
    const antagonist = createImportedRoleContent({
      title: '赵玄',
      body: `【身份定位】：
重要反派角色

【生存状态】：
死亡

【当前计划】：
在考核中制造林刻作弊的证据。

【主角冲突原因】：
双方争夺唯一的内门名额。

【失败代价】：
失去家族提供的修炼资源。`,
    });

    expect(parsePromptRoleFields(supporting)).toMatchObject({
      'prompt:supporting-role:剧情作用': '揭开天剑宗内部派系冲突。',
      'prompt:supporting-role:利益立场': '优先保护师门普通弟子。',
    });
    expect(antagonist.lifeStatus).toBe('死亡');
    expect(parsePromptRoleFields(antagonist)).toMatchObject({
      'prompt:antagonist:当前计划': '在考核中制造林刻作弊的证据。',
      'prompt:antagonist:主角冲突原因': '双方争夺唯一的内门名额。',
      'prompt:antagonist:失败代价': '失去家族提供的修炼资源。',
    });

    const prompt = readFileSync(resolve(process.cwd(), '提示词/人物设定导入提示词.md'), 'utf8');
    expect(prompt).toContain('<人物设定>');
    expect(prompt).toContain('【身份定位】：');
    expect(prompt).toContain('【金手指当前解锁状态】：');
    expect(prompt).toContain('【剧情作用】：');
    expect(prompt).toContain('【当前计划】：');
  });
});
