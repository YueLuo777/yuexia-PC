import { describe, expect, it } from 'vitest';

import { PROMPT_BASED_SETTING_DOMAINS } from '@/features/workbench/model/promptBasedSettingTaxonomyData';
import {
  DEFAULT_WORK_SETTING_STARTER_ENTRIES,
  DEFAULT_WORK_SETTING_TYPES,
  SETTING_WORKSPACE_DOMAIN_GROUPS,
} from '@/features/workbench/model/workbenchSettingTaxonomy';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';

import { migratePromptBasedSettingTaxonomy } from './workbenchPromptTaxonomyMigration';
import { PROMPT_BASED_STRUCTURED_SETTING_FIELD_SETS } from './workbenchPromptStructuredSettingDefinitions';
import { getPromptRoleFieldSections, parsePromptRoleFields } from './workbenchPromptRoleFields';
import { parseRoleContent, stringifyRoleContent } from './workbenchRoleContent';
import {
  getStructuredSettingFieldSet,
  parseSettingContent,
  parseStructuredSettingFields,
  stringifySettingContent,
} from './workbenchStructuredSettings';

const entry = (id: string, tab: string, title: string, content: string): WorkbenchLibraryEntry => ({
  id,
  tab,
  title,
  content,
  updatedAt: '2026-07-24',
});

describe('prompt based setting formal migration', () => {
  it('uses the approved seven-domain order and all approved secondary groups', () => {
    expect(PROMPT_BASED_SETTING_DOMAINS.map((domain) => domain.title)).toEqual([
      '作品设定',
      '人物设定',
      '地点地图',
      '势力设定',
      '道具资源',
      '伏笔线索',
      '怪物图鉴',
    ]);
    expect(DEFAULT_WORK_SETTING_TYPES).toEqual(['核心设定', '剧情规划', '创作规范', '剧情时间线']);
    expect(SETTING_WORKSPACE_DOMAIN_GROUPS['setting:location']).toEqual([
      '世界总览',
      '国家区域',
      '城池宗门',
      '建筑地点',
      '秘境遗迹',
      '危险区域',
      '其他地点',
    ]);
    expect(SETTING_WORKSPACE_DOMAIN_GROUPS['setting:foreshadow']).toEqual([
      '主线伏笔',
      '人物伏笔',
      '世界伏笔',
      '其他线索',
    ]);
  });

  it('creates generic formal starters without copying the test page sample names', () => {
    const starters = DEFAULT_WORK_SETTING_STARTER_ENTRIES.map((item) => `${item.type}::${item.title}`);
    expect(starters).toContain('核心设定::作品定位');
    expect(starters).toContain('世界总览::世界架构');
    expect(starters).toContain('正派势力::1号势力');
    expect(starters).toContain('资源货币::资源货币');
    expect(starters).not.toContain('城池宗门::青云城');
    expect(starters).not.toContain('正派势力::寒月剑宗');
  });

  it('migrates old locked entries and preserves old field values through aliases', () => {
    const old = entry(
      'setting-1',
      '大纲',
      '基础设定',
      stringifySettingContent({
        type: '核心设定',
        body: '【故事类型】：\n玄幻升级流\n\n【核心创意】：\n吞噬万物成长\n\n【一句话概括】：\n林刻逆势登天',
        structuredFieldSetId: 'work-core-basic',
        lockedDefaultEntryId: '核心设定::基础设定',
      }),
    );
    const migrated = migratePromptBasedSettingTaxonomy([old])[0];
    const setting = parseSettingContent(migrated.content);
    const fieldSet = getStructuredSettingFieldSet(migrated, setting);

    expect(migrated.title).toBe('作品定位');
    expect(setting.type).toBe('核心设定');
    expect(setting.structuredFieldSetId).toBe('prompt-work-positioning');
    expect(setting.lockedDefaultEntryId).toBe('核心设定::作品定位');
    expect(fieldSet).not.toBeNull();
    expect(parseStructuredSettingFields(setting.body, fieldSet!)).toMatchObject({
      'prompt:work-positioning:小说类型': '玄幻升级流',
      'prompt:work-positioning:作品卖点': '吞噬万物成长',
      'prompt:work-positioning:一句话写清主线': '林刻逆势登天',
    });
  });

  it('moves existing protagonist advantage content into the male role and removes the old entry', () => {
    const male = entry(
      'role-1',
      '角色',
      '林刻',
      stringifyRoleContent({
        type: '男主角',
        lifeStatus: '存活',
        baseSetting: '',
        relationship: '',
        stateSettings: { currentSituation: '', currentGoal: '', abilityState: '', resourceState: '', otherState: '' },
        personality: '',
        background: '',
        status: '',
      }),
    );
    const cheat = entry(
      'setting-cheat',
      '大纲',
      '主角金手指/优势',
      stringifySettingContent({
        type: '核心设定',
        body: '【能力来源】：\n上古吞噬珠\n\n【核心功能】：\n吞噬灵物提升修为',
        lockedDefaultEntryId: '核心设定::主角金手指/优势',
      }),
    );
    const migrated = migratePromptBasedSettingTaxonomy([male, cheat]);
    const migratedMale = migrated.find((item) => item.id === 'role-1');

    expect(migrated.some((item) => item.id === 'setting-cheat')).toBe(false);
    expect(migratedMale).toBeDefined();
    expect(parsePromptRoleFields(parseRoleContent(migratedMale!.content))).toMatchObject({
      'prompt:protagonist:金手指当前功能': expect.stringContaining('吞噬灵物提升修为'),
    });
  });

  it('uses protagonist, supporting-role and antagonist prompt sections in the formal role editor', () => {
    expect(getPromptRoleFieldSections('男主角').map((section) => section.title)).toEqual([
      '基础档案',
      '动机与行为规则',
      '金手指',
      '实力与手段',
      '当前状态',
      '关系',
    ]);
    expect(getPromptRoleFieldSections('女主角').map((section) => section.title)).toContain('剧情职能');
    expect(getPromptRoleFieldSections('重要反派角色').map((section) => section.title)).toContain('反派计划');
  });

  it('uses one shared placeholder for every repeated role field', () => {
    const roleTypes = ['男主角', '女主角', '重要反派角色'];
    const placeholdersByLabel = new Map<string, Set<string>>();

    roleTypes.forEach((roleType) => {
      getPromptRoleFieldSections(roleType)
        .flatMap((section) => section.fields)
        .forEach((field) => {
          const placeholders = placeholdersByLabel.get(field.label) ?? new Set<string>();
          placeholders.add(field.placeholder);
          placeholdersByLabel.set(field.label, placeholders);
        });
    });

    placeholdersByLabel.forEach((placeholders, label) => {
      expect(placeholders.size, `${label}在不同人物模板中使用了不同提示文案`).toBe(1);
    });
    expect(placeholdersByLabel.get('性格')).toEqual(
      new Set(['稳定性格、行事方式、情绪底色和关键弱点。']),
    );
    expect(placeholdersByLabel.get('当前目标')).toEqual(
      new Set(['这个人物当前想达成的具体结果。']),
    );
  });

  it('preserves prompt-template sections and gives short chapter-rule fields compact cards', () => {
    const chapterRules = PROMPT_BASED_STRUCTURED_SETTING_FIELD_SETS.find(
      (fieldSet) => fieldSet.id === 'prompt-chapter-rules',
    );

    expect(chapterRules?.groups?.map((group) => group.title)).toEqual([
      '字数要求',
      '章节结构',
      '描写比例',
      '爽点与结尾',
    ]);
    expect(
      chapterRules?.fields
        .filter((field) => ['章节正常字数', '章节最低字数', '章节最高字数'].includes(field.title))
        .map((field) => field.displaySize),
    ).toEqual(['compact', 'compact', 'compact']);
  });
});
