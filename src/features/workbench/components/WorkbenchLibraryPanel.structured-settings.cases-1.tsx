import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { PROMPT_BASED_SETTING_DOMAINS } from '@/features/workbench/model/promptBasedSettingTaxonomyData';
import { DEFAULT_WORK_SETTING_STARTER_ENTRIES } from '@/features/workbench/model/workbenchSettingTaxonomy';

import { WorkbenchLibraryPanel } from './WorkbenchLibraryPanel';
import {
  TEST_WORK_SETTING_STARTER_VERSION,
  ensureLibraryDomainExpanded,
  ensureLibraryGroupExpanded,
  unlockSmartImportSettings,
} from './WorkbenchLibraryPanel.testUtils';

describe('WorkbenchLibraryPanel structured setting flows', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('imports compact legacy headings into the renamed world-background fields', () => {
    const storageKey = 'workbench-smart-import-compact-structured-fields-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      `${storageKey}_tab_configs_v1`,
      JSON.stringify({
        大纲: {
          aiOutput: [
            '<作品设定>',
            '<核心设定>',
            '*世界观*：',
            '【时代背景】：',
            '宇宙纪元末期，混沌之力侵蚀诸天万界。',
            '旧日神魔陨落，新生文明在废墟上挣扎求存。',
            '【世界格局】：',
            '各大宗门围绕位面节点争夺通道权。',
            '【社会秩序】：',
            '宗门掌控资源，边城依靠贸易和庇护维持秩序。',
            '</核心设定>',
            '</作品设定>',
          ].join('\n'),
        },
      }),
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    unlockSmartImportSettings();
    fireEvent.click(screen.getByRole('button', { name: '智能导入设定' }));
    fireEvent.click(screen.getByText('世界背景').closest('button') as HTMLElement);

    expect(screen.getByLabelText('故事发生时代')).toHaveValue(
      ['宇宙纪元末期，混沌之力侵蚀诸天万界。', '旧日神魔陨落，新生文明在废墟上挣扎求存。'].join('\n'),
    );
    expect(screen.getByLabelText('主要势力')).toHaveValue('各大宗门围绕位面节点争夺通道权。');
    expect(screen.getByLabelText('社会运行规则')).toHaveValue('宗门掌控资源，边城依靠贸易和庇护维持秩序。');
  });

  it('seeds the approved seven-domain taxonomy in the requested order', () => {
    const storageKey = 'workbench-default-prompt-setting-starter-test';

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    expect(PROMPT_BASED_SETTING_DOMAINS.map((domain) => domain.title)).toEqual([
      '作品设定',
      '人物设定',
      '地点地图',
      '势力设定',
      '道具资源',
      '伏笔线索',
      '怪物图鉴',
    ]);
    expect(screen.getByRole('button', { name: '作品设定12' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '地点地图2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '势力设定1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '道具资源4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '伏笔线索4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '怪物图鉴1' })).toBeInTheDocument();

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]').filter(
      (entry: { tab: string }) => entry.tab === '大纲',
    );
    expect(storedEntries).toHaveLength(DEFAULT_WORK_SETTING_STARTER_ENTRIES.length);
    expect(storedEntries.map((entry: { title: string }) => entry.title)).toEqual(
      expect.arrayContaining(['作品定位', '世界背景', '力量体系', '设定红线', '世界架构', '资源货币', '怪物图鉴']),
    );
    storedEntries.forEach((entry: { content: string }) => {
      expect(JSON.parse(entry.content).body).toBe('');
    });
  });

  it('creates an inline setting in the selected group and lets it move to another group', () => {
    const storageKey = 'workbench-inline-setting-group-picker-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryDomainExpanded('道具资源0');
    fireEvent.change(screen.getByLabelText('当前设定分组'), { target: { value: '特殊资源' } });
    fireEvent.change(screen.getByLabelText('设定名'), { target: { value: '稀有血脉' } });
    expect(JSON.parse(localStorage.getItem(storageKey) ?? '[]').some((entry: { title: string }) => entry.title === '稀有血脉')).toBe(true);

    fireEvent.change(screen.getByLabelText('当前设定分组'), { target: { value: '物品装备' } });
    const moved = JSON.parse(localStorage.getItem(storageKey) ?? '[]').find(
      (entry: { title: string }) => entry.title === '稀有血脉',
    );
    expect(JSON.parse(moved.content).type).toBe('物品装备');
  });

  it('keeps approved default groups and entries locked', () => {
    const storageKey = 'workbench-default-setting-entry-lock-test';

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
    expect(screen.getByDisplayValue('整体剧情')).toBeDisabled();

    fireEvent.contextMenu(screen.getByText('整体剧情').closest('button') as HTMLElement);
    expect(screen.getByRole('button', { name: '重命名' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '删除' })).toBeDisabled();
  });

  it('preserves legacy foreshadow metadata in the formal prompt-based fields', () => {
    const storageKey = 'workbench-production-foreshadow-fields-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'legacy-foreshadow',
          tab: '大纲',
          title: '旧矿洞异响',
          content: JSON.stringify({
            type: '主线伏笔',
            body: '【伏笔编号】：\nF-001\n\n【首次出现章节】：\n第3章\n\n【铺垫方式】：\n矿工听见规律敲击声\n\n【伏笔内容】：\n矿洞下方封着旧时代遗迹',
          }),
          updatedAt: '2026/7/24 10:00:00',
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

    ensureLibraryDomainExpanded('伏笔线索1');
    ensureLibraryGroupExpanded('主线伏笔1');
    fireEvent.click(screen.getByText('旧矿洞异响').closest('button') as HTMLElement);
    expect(screen.getByLabelText('伏笔编号')).toHaveValue('F-001');
    expect(screen.getByLabelText('埋设章节')).toHaveValue('第3章');
    expect(screen.getByLabelText('铺垫方式')).toHaveValue('矿工听见规律敲击声');
    expect(screen.getByLabelText('伏笔内容')).toHaveValue('矿洞下方封着旧时代遗迹');
    expect(screen.getByLabelText('伏笔当前状态')).toBeInTheDocument();
  });

  it('migrates old world-map entries into the standalone location domain', () => {
    const storageKey = 'workbench-location-migration-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'world-map-1',
          tab: '大纲',
          title: '东洲全图',
          content: JSON.stringify({ type: '世界地图', body: '' }),
          updatedAt: '2026/6/22 02:00:00',
        },
        {
          id: 'danger-zone-1',
          tab: '大纲',
          title: '黑石禁地',
          content: JSON.stringify({ type: '世界地图', body: '' }),
          updatedAt: '2026/6/22 02:10:00',
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

    ensureLibraryDomainExpanded('地点地图2');
    ensureLibraryGroupExpanded('其他地点1');
    fireEvent.click(screen.getByText('东洲全图').closest('button') as HTMLElement);
    expect(screen.getByLabelText('地点名')).toHaveValue('东洲全图');
    expect(screen.getByLabelText('地点类型')).toBeInTheDocument();

    ensureLibraryGroupExpanded('危险区域1');
    fireEvent.click(screen.getByText('黑石禁地').closest('button') as HTMLElement);
    expect(screen.getByLabelText('区域名')).toHaveValue('黑石禁地');
    expect(screen.getByLabelText('区域环境')).toBeInTheDocument();
    expect(screen.getByLabelText('区域生存规则')).toBeInTheDocument();
  });

  it('uses the formal monster, item, ability and currency templates', () => {
    const storageKey = 'workbench-resource-template-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        { id: 'monster', tab: '大纲', title: '黑鳞妖狼', content: JSON.stringify({ type: '常见怪物', body: '' }), updatedAt: '2026/7/24' },
        { id: 'item', tab: '大纲', title: '玄青药鼎', content: JSON.stringify({ type: '物品装备', body: '' }), updatedAt: '2026/7/24' },
        { id: 'ability', tab: '大纲', title: '玄雷步', content: JSON.stringify({ type: '功法能力', body: '' }), updatedAt: '2026/7/24' },
        { id: 'currency', tab: '大纲', title: '灵石体系', content: JSON.stringify({ type: '资源货币', body: '' }), updatedAt: '2026/7/24' },
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

    ensureLibraryDomainExpanded('怪物图鉴1');
    ensureLibraryGroupExpanded('常见怪物1');
    fireEvent.click(screen.getByText('黑鳞妖狼').closest('button') as HTMLElement);
    expect(screen.getByLabelText('外貌特征')).toBeInTheDocument();
    expect(screen.getByLabelText('掉落资源')).toBeInTheDocument();

    ensureLibraryDomainExpanded('道具资源3');
    ensureLibraryGroupExpanded('物品装备1');
    fireEvent.click(screen.getByText('玄青药鼎').closest('button') as HTMLElement);
    expect(screen.getByLabelText('物品类型')).toBeInTheDocument();
    expect(screen.getByLabelText('具体功能')).toBeInTheDocument();

    ensureLibraryGroupExpanded('功法能力1');
    fireEvent.click(screen.getByText('玄雷步').closest('button') as HTMLElement);
    expect(screen.getByLabelText('能力类型')).toBeInTheDocument();
    expect(screen.getByLabelText('当前掌握程度')).toBeInTheDocument();

    ensureLibraryGroupExpanded('资源货币1');
    fireEvent.click(screen.getByText('灵石体系').closest('button') as HTMLElement);
    expect(screen.getByLabelText('货币类型')).toBeInTheDocument();
    expect(screen.getByLabelText('换算比例')).toBeInTheDocument();
  });
});
