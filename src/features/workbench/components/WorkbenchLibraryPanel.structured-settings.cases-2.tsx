import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { PROMPT_BASED_SETTING_DOMAINS } from '@/features/workbench/model/promptBasedSettingTaxonomyData';
import { PROMPT_SETTING_TEMPLATES } from '@/features/workbench/model/promptBasedSettingTemplates';
import {
  DEFAULT_WORK_SETTING_TYPES,
  SETTING_IMPORT_TOP_LABEL_DEFAULT_TYPES,
  SETTING_WORKSPACE_DOMAIN_GROUPS,
} from '@/features/workbench/model/workbenchSettingTaxonomy';

import { WorkbenchLibraryPanel } from './WorkbenchLibraryPanel';
import {
  TEST_WORK_SETTING_STARTER_VERSION,
  ensureLibraryDomainExpanded,
  ensureLibraryGroupExpanded,
} from './WorkbenchLibraryPanel.testUtils';

describe('WorkbenchLibraryPanel prompt-based structured settings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows all fixed and changing fields for special resources', () => {
    const storageKey = 'workbench-special-resource-structured-preview-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'special-resource',
          tab: '大纲',
          title: '龙脉权限',
          content: JSON.stringify({ type: '特殊资源', body: '' }),
          updatedAt: '2026/7/24',
        },
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryDomainExpanded('道具资源1');
    ensureLibraryGroupExpanded('特殊资源1');
    fireEvent.click(screen.getByText('龙脉权限').closest('button') as HTMLElement);
    expect(screen.getByLabelText('资源类型')).toBeInTheDocument();
    expect(screen.getByLabelText('获取身份条件')).toBeInTheDocument();
    expect(screen.getByLabelText('使用次数')).toBeInTheDocument();
    expect(screen.getByLabelText('使用权限')).toBeInTheDocument();
    expect(screen.getByLabelText('失效条件')).toBeInTheDocument();
    expect(screen.getByLabelText('主线关联')).toBeInTheDocument();
    expect(screen.getByLabelText('当前归属')).toBeInTheDocument();
    expect(screen.getByLabelText('当前可用状态')).toBeInTheDocument();
    expect(screen.getByLabelText('剩余次数')).toBeInTheDocument();
    expect(screen.getByLabelText('争夺暴露风险')).toBeInTheDocument();
  });

  it('uses the expanded overall, volume and payoff planning templates and saves edits', () => {
    const storageKey = 'workbench-plot-planning-structured-preview-test';

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('剧情规划3');
    fireEvent.click(screen.getByText('整体剧情').closest('button') as HTMLElement);
    expect(screen.getByLabelText('全书总篇幅')).toBeInTheDocument();
    expect(screen.getByLabelText('全书主线目标')).toBeInTheDocument();
    expect(screen.getByLabelText('前期剧情安排')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('全书总篇幅'), { target: { value: '全书三卷，一百万字。' } });
    fireEvent.change(screen.getByLabelText('全书主线目标'), { target: { value: '主角推翻旧天庭。' } });

    fireEvent.click(screen.getByText('第一卷').closest('button') as HTMLElement);
    expect(screen.getByLabelText('本卷名称')).toBeInTheDocument();
    expect(screen.getByLabelText('本卷核心事件')).toBeInTheDocument();
    expect(screen.getByLabelText('下卷剧情钩子')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('本卷名称'), { target: { value: '凡界崛起' } });

    fireEvent.click(screen.getByText('爽点设计').closest('button') as HTMLElement);
    expect(screen.getByLabelText('核心爽点类型')).toBeInTheDocument();
    expect(screen.getByLabelText('打脸对象')).toBeInTheDocument();
    expect(screen.getByLabelText('爽点铺垫')).toBeInTheDocument();
    expect(screen.getByLabelText('小爽点频率')).toBeInTheDocument();

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const overallBody = JSON.parse(
      storedEntries.find((entry: { title: string }) => entry.title === '整体剧情').content,
    ).body;
    const volumeBody = JSON.parse(
      storedEntries.find((entry: { title: string }) => entry.title === '第一卷').content,
    ).body;
    expect(overallBody).toContainSource('【全书总篇幅】：\n全书三卷，一百万字。');
    expect(overallBody).toContainSource('【全书主线目标】：\n主角推翻旧天庭。');
    expect(volumeBody).toContainSource('【本卷名称】：\n凡界崛起');
  });

  it('keeps a prompt field set after renaming a custom structured setting', () => {
    const storageKey = 'workbench-structured-setting-fields-survive-rename-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'custom-overall-plot',
          tab: '大纲',
          title: '剧情总表',
          content: JSON.stringify({
            type: '剧情规划',
            body: '',
            structuredFieldSetId: 'prompt-overall-plot',
          }),
          updatedAt: '2026/7/24',
        },
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('剧情规划1');
    fireEvent.click(screen.getByText('剧情总表').closest('button') as HTMLElement);
    fireEvent.change(screen.getByLabelText('全书总篇幅'), { target: { value: '八十万字' } });
    fireEvent.change(screen.getByDisplayValue('剧情总表'), { target: { value: '完整剧情规划' } });

    expect(screen.getByLabelText('全书总篇幅')).toHaveValue('八十万字');
    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const renamed = storedEntries.find((entry: { title: string }) => entry.title === '完整剧情规划');
    expect(JSON.parse(renamed.content)).toMatchObject({ structuredFieldSetId: 'prompt-overall-plot' });
  });

  it('recovers renamed fields from legacy section titles', () => {
    const storageKey = 'workbench-structured-setting-fields-recover-legacy-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'legacy-overall-plot',
          tab: '大纲',
          title: '整体剧情',
          content: JSON.stringify({
            type: '剧情规划',
            body: '【整体规划】：\n全书三卷\n\n【主线目标】：\n主角推翻旧天庭\n\n【阶段节奏】：\n前期求生',
            lockedDefaultEntryId: '剧情规划::剧情蓝图',
          }),
          updatedAt: '2026/7/24',
        },
      ]),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('剧情规划1');
    fireEvent.click(screen.getByText('整体剧情').closest('button') as HTMLElement);
    expect(screen.getByLabelText('每卷安排')).toHaveValue('全书三卷');
    expect(screen.getByLabelText('全书主线目标')).toHaveValue('主角推翻旧天庭');
    expect(screen.getByLabelText('前期剧情安排')).toHaveValue('前期求生');
  });

  it('shows guidance as placeholders without saving it as setting content', () => {
    const storageKey = 'workbench-structured-setting-field-placeholder-test';

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定4');
    fireEvent.click(screen.getByText('作品定位').closest('button') as HTMLElement);
    expect(screen.getByLabelText('小说类型')).toHaveAttribute(
      'placeholder',
      '玄幻、仙侠、都市、历史、科幻；升级流、争霸流等。',
    );
    expect(screen.getByLabelText('一句话写清主线')).toHaveAttribute(
      'placeholder',
      '用一句话说明主角、目标、冲突和看点。',
    );

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const positioningBody = JSON.parse(
      storedEntries.find((entry: { title: string }) => entry.title === '作品定位').content,
    ).body;
    expect(positioningBody).toBe('');
    expect(positioningBody).not.toContainSource('玄幻、仙侠');
  });

  it('keeps taxonomy, import defaults and template groups aligned', () => {
    expect(DEFAULT_WORK_SETTING_TYPES).toEqual(['核心设定', '剧情规划', '创作规范', '剧情时间线']);
    expect(SETTING_WORKSPACE_DOMAIN_GROUPS).toMatchObject({
      'setting:location': ['世界总览', '国家区域', '城池宗门', '建筑地点', '秘境遗迹', '危险区域', '其他地点'],
      'setting:faction': ['正派势力', '反派势力', '中立势力', '其他势力'],
      'setting:item': ['功法能力', '物品装备', '特殊资源', '资源货币'],
      'setting:foreshadow': ['主线伏笔', '人物伏笔', '世界伏笔', '其他线索'],
      'setting:monster': ['常见怪物', '精英怪物', '首领怪物', '特殊生命'],
    });
    expect(SETTING_IMPORT_TOP_LABEL_DEFAULT_TYPES).toMatchObject({
      作品设定: '核心设定',
      地点地图: '世界总览',
      势力设定: '正派势力',
      道具资源: '功法能力',
      伏笔线索: '主线伏笔',
      怪物图鉴: '常见怪物',
    });
    expect(PROMPT_BASED_SETTING_DOMAINS.map((domain) => domain.id)).toEqual([
      'work',
      'character',
      'location',
      'faction',
      'resource',
      'foreshadow',
      'monster',
    ]);
    expect(PROMPT_SETTING_TEMPLATES.foreshadow.sections.flatMap((section) => section.fields.map((field) => field.label))).toEqual(
      expect.arrayContaining(['伏笔编号', '铺垫方式', '埋设章节', '伏笔当前状态', '回收章节']),
    );
  });
});
