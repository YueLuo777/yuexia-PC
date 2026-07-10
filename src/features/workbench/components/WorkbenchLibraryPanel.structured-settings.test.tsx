import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { WorkbenchLibraryPanel } from './WorkbenchLibraryPanel';
import {
  TEST_WORK_SETTING_STARTER_VERSION,
  unlockSmartImportSettings,
  ensureLibraryGroupExpanded,
  readWorkbenchLibraryPanelSource,
  readWorkbenchSettingTaxonomySource,
  readWorkbenchStructuredSettingsSource,
  readSharedStylesSource,
  readTestCollectionSource,
} from './WorkbenchLibraryPanel.testUtils';

describe('WorkbenchLibraryPanel structured setting flows', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('splits smart-imported structured fields even when bracket headings are not separated by blank lines', async () => {
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
            '宇宙分为三层：底层物质位面，中层位面节点，顶层混沌虚空。',
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
    fireEvent.click(screen.getByText('世界观').closest('button') as HTMLElement);

    expect(screen.getByLabelText('时代背景')).toHaveValue(
      ['宇宙纪元末期，混沌之力侵蚀诸天万界。', '旧日神魔陨落，新生文明在废墟上挣扎求存。'].join('\n'),
    );
    expect(screen.getByLabelText('世界格局')).toHaveValue(
      ['宇宙分为三层：底层物质位面，中层位面节点，顶层混沌虚空。', '各大宗门围绕位面节点争夺通道权。'].join('\n'),
    );
    expect(screen.getByLabelText('社会秩序')).toHaveValue('宗门掌控资源，边城依靠贸易和庇护维持秩序。');
  });

  it('seeds the approved default setting entries with empty bodies by the current setting workspace groups', async () => {
    const storageKey = 'workbench-default-core-setting-starter-test';
    const expectedEntriesByType = new Map([
      ['核心设定', ['基础设定', '世界观', '主角金手指/优势']],
      ['剧情规划', ['剧情蓝图', '爽点设计', '分卷剧情']],
      ['资源货币', ['资源货币']],
      ['世界地图', ['世界架构', '危险区域']],
      ['正派势力', []],
      ['反派势力', []],
      ['中立势力', []],
      ['其他势力', []],
      ['功法能力', []],
      ['物品装备', []],
      ['特殊资源', []],
      ['怪物列表', []],
      ['主线伏笔', ['1号主线伏笔']],
      ['人物伏笔', ['1号人物伏笔']],
    ]);
    const expectedEntryCount = Array.from(expectedEntriesByType.values()).reduce(
      (total, titles) => total + titles.length,
      0,
    );

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    expect(screen.getByRole('button', { name: '作品设定9' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '势力设定0' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '核心设定3' })).toBeInTheDocument();
    ensureLibraryGroupExpanded('核心设定3');
    expect(screen.getAllByText('核心设定').length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue('基础设定')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('世界规则')).not.toBeInTheDocument();

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const storedSettingEntries = storedEntries.filter((entry: { tab: string }) => entry.tab === '大纲');
    expect(storedSettingEntries).toHaveLength(expectedEntryCount);
    expectedEntriesByType.forEach((expectedTitles, type) => {
      const titles = storedSettingEntries
        .filter((entry: { content: string }) => JSON.parse(entry.content).type === type)
        .map((entry: { title: string }) => entry.title);
      expect(titles).toEqual(expectedTitles);
    });
    const worldViewEntry = storedSettingEntries.find((entry: { title: string }) => entry.title === '世界观');
    expect(worldViewEntry).toBeTruthy();
    expect(JSON.parse(worldViewEntry.content).type).toBe('核心设定');
    expect(JSON.parse(worldViewEntry.content).body).toBe('');
    const positioningEntry = storedSettingEntries.find((entry: { title: string }) => entry.title === '基础设定');
    expect(JSON.parse(positioningEntry.content).body).toBe('');
    expect(storedSettingEntries.some((entry: { title: string }) => entry.title === '正派势力')).toBe(false);
    expect(storedSettingEntries.some((entry: { title: string }) => entry.title === '反派势力')).toBe(false);
    expect(storedSettingEntries.some((entry: { title: string }) => entry.title === '中立势力')).toBe(false);
    expect(storedSettingEntries.some((entry: { title: string }) => entry.title === '其他势力')).toBe(false);
    const resourceCurrencyEntry = storedSettingEntries.find((entry: { title: string }) => entry.title === '资源货币');
    expect(resourceCurrencyEntry).toBeTruthy();
    expect(JSON.parse(resourceCurrencyEntry.content)).toMatchObject({
      type: '资源货币',
      lockedDefaultEntryId: '资源货币::资源货币',
    });
    expect(storedSettingEntries.some((entry: { title: string }) => entry.title === '写作规范')).toBe(false);
    expect(storedSettingEntries.some((entry: { title: string }) => entry.title === '写作禁忌')).toBe(false);
    storedSettingEntries.forEach((entry: { title: string; content: string }) => {
      expect(entry.title).not.toContainSource('：');
      expect(JSON.parse(entry.content).body).not.toContainSource('填写说明');
      expect(JSON.parse(entry.content).body).toBe('');
    });
  });

  it('locks default setting groups and default setting entries from rename and delete actions', async () => {
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
    fireEvent.click(screen.getByText('剧情蓝图').closest('button') as HTMLElement);

    const defaultTitleInput = screen.getByDisplayValue('剧情蓝图');
    expect(defaultTitleInput).toBeDisabled();
    expect(screen.queryByRole('button', { name: '删除' })).not.toBeInTheDocument();

    fireEvent.contextMenu(screen.getByText('剧情蓝图').closest('button') as HTMLElement);
    expect(screen.getByRole('button', { name: '重命名' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '删除' })).toBeDisabled();

    fireEvent.contextMenu(screen.getByRole('button', { name: '剧情规划3' }));
    expect(screen.queryByText('删除分类')).not.toBeInTheDocument();
  });

  it('uses two chapter fields in production foreshadow settings instead of a status toggle', async () => {
    const storageKey = 'workbench-production-foreshadow-fields-test';
    const panelSource = await readWorkbenchLibraryPanelSource();

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '伏笔线索2' }));
    expect(screen.getByRole('button', { name: '主线伏笔1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '人物伏笔1' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '已回收伏笔1' })).not.toBeInTheDocument();

    ensureLibraryGroupExpanded('主线伏笔1');
    fireEvent.click(screen.getByText('1号主线伏笔').closest('button') as HTMLElement);

    expect(screen.getByDisplayValue('1号主线伏笔')).toBeInTheDocument();
    expect(screen.getByLabelText('首次出现章节')).toBeInTheDocument();
    expect(screen.getByLabelText('回收章节')).toBeInTheDocument();
    expect(screen.getByLabelText('关联对象')).toBeInTheDocument();
    expect(screen.getByLabelText('铺垫方式')).toBeInTheDocument();
    expect(screen.getByLabelText('伏笔内容')).toBeInTheDocument();
    expect(screen.queryByText('伏笔状态')).not.toBeInTheDocument();

    const foreshadowCodeInput = screen.getByLabelText('伏笔编号');
    const firstSeenChapterInput = screen.getByLabelText('首次出现章节');
    const recoveredChapterInput = screen.getByLabelText('回收章节');
    expect(foreshadowCodeInput.tagName).toBe('INPUT');
    expect(firstSeenChapterInput.tagName).toBe('INPUT');
    expect(recoveredChapterInput.tagName).toBe('INPUT');
    expect(foreshadowCodeInput).toHaveAttribute('maxlength', '10');
    expect(firstSeenChapterInput).toHaveAttribute('maxlength', '7');
    expect(recoveredChapterInput).toHaveAttribute('maxlength', '7');

    const titleRow = screen.getByTestId('structured-title-row');
    expect(within(titleRow).getByLabelText('伏笔名称')).toBeInTheDocument();
    expect(within(titleRow).getByLabelText('伏笔编号')).toBeInTheDocument();
    expect(within(titleRow).getByLabelText('首次出现章节')).toBeInTheDocument();
    expect(within(titleRow).getByLabelText('回收章节')).toBeInTheDocument();
    const structuredFields = screen.getByTestId('structured-setting-fields');
    expect(within(structuredFields).queryByLabelText('伏笔编号')).not.toBeInTheDocument();
    expect(within(structuredFields).queryByLabelText('首次出现章节')).not.toBeInTheDocument();
    expect(within(structuredFields).queryByLabelText('回收章节')).not.toBeInTheDocument();

    const structuredSettingsSource = await readWorkbenchStructuredSettingsSource();

    expect(structuredSettingsSource).toContainSource("id: 'foreshadow-main'");
    expect(structuredSettingsSource).toContainSource("id: 'foreshadow-character'");
    expect(panelSource).toContainSource('<header className="shrink-0 pb-3">');
    expect(panelSource).toContainSource('grid grid-cols-[4fr_2fr_2fr_2fr] gap-4 overflow-visible pb-1 pt-3');
    expect(panelSource).toContainSource('usesForeshadowHeaderLayout');
    expect(panelSource).toContainSource(
      'left-5 top-0 z-10 -translate-y-1/2 text-base font-medium leading-5 text-slate-950',
    );
    expect(structuredSettingsSource).toContainSource("fieldClassName: 'xy-structured-header-field h-[48px] min-w-0'");
    expect(panelSource).not.toContainSource('headerWidth');
    const styleSource = await readSharedStylesSource();
    expect(styleSource).toContainSource(
      '.xy-floating-field.xy-structured-header-field.xy-floating-outline-fixed input',
    );
    expect(styleSource).toContainSource('height: 48px;');
    expect(styleSource).toContainSource('.xy-floating-field.xy-structured-header-field input::placeholder');
    expect(styleSource).toContainSource('font-size: 0.8125rem;');
    expect(structuredSettingsSource).toContainSource("gridContentClassName: 'grid-rows-[150px_minmax(0,1fr)]'");
    expect(structuredSettingsSource).toContainSource("fieldClassName: 'col-span-2 min-h-0'");
    expect(structuredSettingsSource).toContainSource("title: '首次出现章节'");
    expect(structuredSettingsSource).toContainSource("title: '回收章节'");
    expect(panelSource).not.toContainSource("'setting:foreshadow': ['主线伏笔', '人物伏笔', '已回收伏笔']");
  });

  it('retires the foreshadow status test pages from the test collection after moving the layout into production', async () => {
    const testCollectionSource = await readTestCollectionSource();

    expect(testCollectionSource).not.toContainSource('ForeshadowStatusToggleLayoutTestPage');
    expect(testCollectionSource).not.toContainSource('ForeshadowStatusFrameOptionsTestPage');
    expect(testCollectionSource).not.toContainSource('/foreshadow-status-toggle-layout-test');
    expect(testCollectionSource).not.toContainSource('/foreshadow-status-frame-options-test');
  });

  it('uses dedicated structured templates for world maps and danger zones', async () => {
    const storageKey = 'workbench-world-map-danger-zone-structured-template-test';
    const panelSource = await readWorkbenchLibraryPanelSource();
    const structuredSettingsSource = await readWorkbenchStructuredSettingsSource();
    const taxonomySource = await readWorkbenchSettingTaxonomySource();
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
          title: '危险区域',
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

    expect(structuredSettingsSource).toContainSource("id: 'faction-world-map'");
    expect(taxonomySource).toContainSource(
      "const DEFAULT_WORK_SETTING_STARTER_VERSION = '2026-06-25-foreshadow-fields-v1';",
    );
    expect(taxonomySource).toContainSource("{ type: '世界地图', title: '世界架构' }");
    expect(taxonomySource).toContainSource("{ type: '世界地图', title: '危险区域' }");
    expect(panelSource).toContainSource('lockedDefaultEntryId: getDefaultWorkSettingEntryId(item.type, item.title)');
    expect(structuredSettingsSource).toContainSource("entryType: '世界地图'");
    expect(structuredSettingsSource).toContainSource("titleFieldLabel: '地图名'");
    expect(structuredSettingsSource).toContainSource("title: '世界架构'");
    expect(structuredSettingsSource).toContainSource("title: '区域划分'");
    expect(structuredSettingsSource).toContainSource("title: '势力分布'");
    expect(structuredSettingsSource).toContainSource("title: '资源分布'");
    expect(structuredSettingsSource).toContainSource("title: '世界规则'");
    expect(structuredSettingsSource).not.toContainSource("key: 'trafficRoutes'");
    expect(panelSource).not.toContainSource("title: '交通路线'");
    expect(panelSource).not.toContainSource("title: '主角已知范围'");
    expect(structuredSettingsSource).toContainSource("id: 'faction-danger-zone'");
    expect(structuredSettingsSource).toContainSource("entryType: '世界地图'");
    expect(structuredSettingsSource).toContainSource("titleFieldLabel: '区域名'");
    expect(structuredSettingsSource).toContainSource("title: '区域概况'");
    expect(structuredSettingsSource).toContainSource("title: '危险来源'");
    expect(structuredSettingsSource).toContainSource("title: '进入条件'");
    expect(structuredSettingsSource).toContainSource("title: '资源收益'");
    expect(structuredSettingsSource).toContainSource("title: '核心规则'");
    expect(panelSource).not.toContainSource("title: '探索进度'");
    expect(panelSource).not.toContainSource("title: '外部势力介入'");

    fireEvent.click(screen.getByRole('button', { name: /^作品设定/ }));
    ensureLibraryGroupExpanded('世界地图2');
    fireEvent.click(screen.getByText('东洲全图').closest('button') as HTMLElement);

    expect(screen.getByTestId('structured-title-field')).toContainElement(screen.getByLabelText('地图名'));
    expect(screen.getByLabelText('地图名')).toHaveValue('东洲全图');
    expect(screen.queryByRole('button', { name: '固定设定' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '状态设定' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '确认' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('世界架构')).toBeInTheDocument();
    expect(screen.getByLabelText('区域划分')).toBeInTheDocument();
    expect(screen.getByLabelText('势力分布')).toBeInTheDocument();
    expect(screen.getByLabelText('资源分布')).toBeInTheDocument();
    expect(screen.getByLabelText('世界规则')).toBeInTheDocument();
    expect(screen.queryByLabelText('交通路线')).not.toBeInTheDocument();

    expect(screen.queryByLabelText('当前局势')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('封锁/开放')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('主角已知范围')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('近期变化')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('危险区域').closest('button') as HTMLElement);

    expect(screen.getByTestId('structured-title-field')).toContainElement(screen.getByLabelText('区域名'));
    expect(screen.getByLabelText('区域名')).toHaveValue('危险区域');
    expect(screen.getByLabelText('区域名')).toBeDisabled();
    fireEvent.contextMenu(screen.getByText('危险区域').closest('button') as HTMLElement);
    expect(screen.getByRole('button', { name: '重命名' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '删除' })).toBeDisabled();
    expect(screen.getByLabelText('区域概况')).toBeInTheDocument();
    expect(screen.getByLabelText('危险来源')).toBeInTheDocument();
    expect(screen.getByLabelText('进入条件')).toBeInTheDocument();
    expect(screen.getByLabelText('资源收益')).toBeInTheDocument();
    expect(screen.getByLabelText('历史背景')).toBeInTheDocument();
    expect(screen.getByLabelText('核心规则')).toBeInTheDocument();

    expect(screen.queryByLabelText('当前状态')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('探索进度')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('风险变化')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('资源剩余')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('已触发事件')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('外部势力介入')).not.toBeInTheDocument();
  });

  it('restores world map default entries for older projects', () => {
    const storageKey = 'workbench-world-map-locked-default-restored-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, '2026-06-22-danger-zone-under-world-map-v1');
    localStorage.setItem(storageKey, JSON.stringify([]));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as Array<{
      title: string;
      content: string;
    }>;
    const worldMapDefaults = storedEntries
      .filter((entry) => JSON.parse(entry.content).type === '世界地图')
      .map((entry) => ({
        title: entry.title,
        lockedDefaultEntryId: JSON.parse(entry.content).lockedDefaultEntryId,
      }));

    expect(worldMapDefaults).toEqual(
      expect.arrayContaining([
        { title: '世界架构', lockedDefaultEntryId: '世界地图::世界架构' },
        { title: '危险区域', lockedDefaultEntryId: '世界地图::危险区域' },
      ]),
    );
  });

  it('adds monster bestiary as a structured setting workspace', async () => {
    const storageKey = 'workbench-monster-bestiary-structured-preview-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'monster-bestiary-1',
          tab: '大纲',
          title: '黑鳞妖狼',
          content: JSON.stringify({ type: '怪物列表', body: '' }),
          updatedAt: '2026/6/22 01:00:00',
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

    fireEvent.click(screen.getByRole('button', { name: '怪物图鉴1' }));
    ensureLibraryGroupExpanded('怪物列表1');
    fireEvent.click(screen.getByText('黑鳞妖狼').closest('button') as HTMLElement);

    expect(screen.getByTestId('structured-title-field')).toContainElement(screen.getByLabelText('怪物名'));
    expect(screen.getByLabelText('怪物名')).toHaveValue('黑鳞妖狼');
    expect(screen.queryByRole('button', { name: '固定设定' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '状态设定' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '确认' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('怪物形象')).toBeInTheDocument();
    expect(screen.getByLabelText('怪物能力')).toBeInTheDocument();
    expect(screen.getByLabelText('怪物背景')).toBeInTheDocument();
    expect(screen.getByLabelText('怪物弱点')).toBeInTheDocument();
    expect(screen.getByLabelText('出没位置')).toBeInTheDocument();
    expect(screen.getByLabelText('掉落/资源')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('怪物形象'), { target: { value: '黑鳞覆背，额头有银色竖纹。' } });
    fireEvent.change(screen.getByLabelText('怪物能力'), { target: { value: '夜间群猎，速度极快，擅长围杀。' } });
    fireEvent.change(screen.getByLabelText('怪物背景'), { target: { value: '三阶妖狼，首次出现在黑松岭。' } });
    fireEvent.change(screen.getByLabelText('怪物弱点'), { target: { value: '惧火，腹部鳞片较薄。' } });
    fireEvent.change(screen.getByLabelText('出没位置'), { target: { value: '第十二章追踪主角至山谷。' } });
    fireEvent.change(screen.getByLabelText('掉落/资源'), { target: { value: '妖丹、黑鳞、狼牙。' } });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const monsterEntry = storedEntries.find((entry: { title: string }) => entry.title === '黑鳞妖狼');
    const body = JSON.parse(monsterEntry.content).body;
    expect(body).toContainSource('【怪物形象】：\n黑鳞覆背，额头有银色竖纹。');
    expect(body).toContainSource('【怪物能力】：\n夜间群猎，速度极快，擅长围杀。');
    expect(body).toContainSource('【怪物背景】：\n三阶妖狼，首次出现在黑松岭。');
    expect(body).toContainSource('【怪物弱点】：\n惧火，腹部鳞片较薄。');
    expect(body).toContainSource('【出没位置】：\n第十二章追踪主角至山谷。');
    expect(body).toContainSource('【掉落/资源】：\n妖丹、黑鳞、狼牙。');
  });

  it('splits item equipment preview into the approved resource fields', async () => {
    const storageKey = 'workbench-item-equipment-structured-preview-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'item-equipment',
          tab: '大纲',
          title: '玄青药鼎',
          content: JSON.stringify({ type: '物品装备', body: '' }),
          updatedAt: '2026/6/19 01:00:00',
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

    fireEvent.click(screen.getByRole('button', { name: '道具资源1' }));
    ensureLibraryGroupExpanded('物品装备1');
    fireEvent.click(screen.getByText('玄青药鼎').closest('button') as HTMLElement);

    expect(screen.getByDisplayValue('玄青药鼎')).toBeInTheDocument();
    expect(screen.getByLabelText('基本信息')).toBeInTheDocument();
    expect(screen.getByLabelText('物品描述')).toBeInTheDocument();
    expect(screen.getByLabelText('效果/功能')).toBeInTheDocument();
    expect(screen.getByLabelText('来历')).toBeInTheDocument();
    expect(screen.getByLabelText('归属变化')).toBeInTheDocument();
    expect(screen.getByLabelText('当前状态')).toBeInTheDocument();
    expect(screen.getByLabelText('相关伏笔')).toBeInTheDocument();
    expect(screen.queryByText('设定预览')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('基本信息'), { target: { value: '法宝，玄阶上品，第三章初次登场。' } });
    fireEvent.change(screen.getByLabelText('物品描述'), { target: { value: '青铜小鼎，鼎身有裂纹和云纹。' } });
    fireEvent.change(screen.getByLabelText('效果/功能'), { target: { value: '可炼化灵草并短暂压制魔气。' } });
    fireEvent.change(screen.getByLabelText('来历'), { target: { value: '来自上古药宗遗址，是宗门叛徒偷出的残器。' } });
    fireEvent.change(screen.getByLabelText('归属变化'), { target: { value: '先由反派持有，后被主角夺回。' } });
    fireEvent.change(screen.getByLabelText('当前状态'), { target: { value: '主角持有，器灵沉睡，裂纹未修复。' } });
    fireEvent.change(screen.getByLabelText('相关伏笔'), { target: { value: '鼎底残符指向药宗真正传承地。' } });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const itemEntry = storedEntries.find((entry: { title: string }) => entry.title === '玄青药鼎');
    const body = JSON.parse(itemEntry.content).body;
    expect(body).toContainSource('【基本信息】：\n法宝，玄阶上品，第三章初次登场。');
    expect(body).toContainSource('【物品描述】：\n青铜小鼎，鼎身有裂纹和云纹。');
    expect(body).toContainSource('【效果/功能】：\n可炼化灵草并短暂压制魔气。');
    expect(body).toContainSource('【来历】：\n来自上古药宗遗址，是宗门叛徒偷出的残器。');
    expect(body).toContainSource('【归属变化】：\n先由反派持有，后被主角夺回。');
    expect(body).toContainSource('【当前状态】：\n主角持有，器灵沉睡，裂纹未修复。');
    expect(body).toContainSource('【相关伏笔】：\n鼎底残符指向药宗真正传承地。');
  });

  it('splits ability settings into fixed settings, status settings, and confirmation tabs', async () => {
    const storageKey = 'workbench-item-ability-structured-preview-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'item-ability',
          tab: '大纲',
          title: '玄雷步',
          content: JSON.stringify({ type: '功法能力', body: '' }),
          updatedAt: '2026/6/22 23:10:00',
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

    fireEvent.click(screen.getByRole('button', { name: '道具资源1' }));
    ensureLibraryGroupExpanded('功法能力1');
    fireEvent.click(screen.getByText('玄雷步').closest('button') as HTMLElement);

    expect(screen.getByRole('button', { name: '固定设定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '状态设定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确认' })).toBeInTheDocument();
    expect(screen.getByLabelText('基本信息')).toBeInTheDocument();
    expect(screen.getByLabelText('能力来源')).toBeInTheDocument();
    expect(screen.getByLabelText('核心效果')).toBeInTheDocument();
    expect(screen.getByLabelText('修炼/升级')).toBeInTheDocument();
    expect(screen.getByLabelText('使用限制')).toBeInTheDocument();
    expect(screen.getByLabelText('相关伏笔')).toBeInTheDocument();
    expect(
      screen.queryByText('功法能力的长期规则，记录来源、核心效果、成长方式、限制和伏笔。'),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '状态设定' }));
    expect(screen.getByLabelText('当前熟练度')).toBeInTheDocument();
    expect(screen.getByLabelText('当前突破')).toBeInTheDocument();
    expect(screen.getByLabelText('受损/封印')).toBeInTheDocument();
    expect(screen.getByLabelText('暴露程度')).toBeInTheDocument();
    expect(screen.getByLabelText('冷却/代价')).toBeInTheDocument();
    expect(screen.getByLabelText('最近使用')).toBeInTheDocument();
    expect(
      screen.queryByText('章节推进后会变化，AI 更新时只刷新熟练度、突破、受损封印、暴露程度、代价和最近使用。'),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '确认' }));
    expect(screen.getByText('确认更新')).toBeInTheDocument();
    expect(screen.getByText(/确认后才写入状态设定/)).toBeInTheDocument();
  });

  it('keeps resource currency as fixed structured settings without status or confirm tabs', async () => {
    const storageKey = 'workbench-resource-currency-structured-preview-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'resource-currency',
          tab: '大纲',
          title: '灵石体系',
          content: JSON.stringify({ type: '资源货币', body: '' }),
          updatedAt: '2026/6/22 22:30:00',
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

    fireEvent.click(screen.getByRole('button', { name: /^作品设定/ }));
    expect(screen.queryByRole('button', { name: '资源体系1' })).not.toBeInTheDocument();
    ensureLibraryGroupExpanded('资源货币1');
    fireEvent.click(screen.getByText('灵石体系').closest('button') as HTMLElement);

    expect(screen.getByDisplayValue('灵石体系')).toBeInTheDocument();
    expect(screen.getByLabelText('基本信息')).toBeInTheDocument();
    expect(screen.getByLabelText('价值等级')).toBeInTheDocument();
    expect(screen.getByLabelText('获取渠道')).toBeInTheDocument();
    expect(screen.getByLabelText('消耗用途')).toBeInTheDocument();
    expect(screen.getByLabelText('流通限制')).toBeInTheDocument();
    expect(screen.getByLabelText('关联规则')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '固定设定' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '状态设定' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '确认' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('当前库存')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('债务关系')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('基本信息'), { target: { value: '灵石是修行界通用资源。' } });
    fireEvent.change(screen.getByLabelText('价值等级'), { target: { value: '一枚中品灵石可换一百枚下品灵石。' } });
    fireEvent.change(screen.getByLabelText('获取渠道'), { target: { value: '矿脉、任务、宗门俸禄和黑市交易。' } });
    fireEvent.change(screen.getByLabelText('消耗用途'), { target: { value: '修炼、炼器、阵法、传送和购买情报。' } });
    fireEvent.change(screen.getByLabelText('流通限制'), { target: { value: '边境城只认下品灵石，黑市交易抽成。' } });
    fireEvent.change(screen.getByLabelText('关联规则'), { target: { value: '矿脉枯竭会推高边境灵石价格。' } });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const resourceEntry = storedEntries.find((entry: { title: string }) => entry.title === '灵石体系');
    const body = JSON.parse(resourceEntry.content).body;
    expect(body).toContainSource('【基本信息】：\n灵石是修行界通用资源。');
    expect(body).toContainSource('【价值等级】：\n一枚中品灵石可换一百枚下品灵石。');
    expect(body).toContainSource('【获取渠道】：\n矿脉、任务、宗门俸禄和黑市交易。');
    expect(body).toContainSource('【消耗用途】：\n修炼、炼器、阵法、传送和购买情报。');
    expect(body).toContainSource('【流通限制】：\n边境城只认下品灵石，黑市交易抽成。');
    expect(body).toContainSource('【关联规则】：\n矿脉枯竭会推高边境灵石价格。');
    expect(body).not.toContainSource('【当前库存】');
    expect(body).not.toContainSource('【债务关系】');
  });

  it('splits special resources into fixed settings, status settings, and confirmation tabs', async () => {
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
          updatedAt: '2026/6/22 22:31:00',
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

    fireEvent.click(screen.getByRole('button', { name: '道具资源1' }));
    ensureLibraryGroupExpanded('特殊资源1');
    fireEvent.click(screen.getByText('龙脉权限').closest('button') as HTMLElement);

    expect(screen.getByRole('button', { name: '固定设定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '状态设定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确认' })).toBeInTheDocument();
    expect(screen.getByLabelText('基本信息')).toBeInTheDocument();
    expect(screen.getByLabelText('获取条件')).toBeInTheDocument();
    expect(screen.getByLabelText('使用规则')).toBeInTheDocument();
    expect(screen.getByLabelText('权限边界')).toBeInTheDocument();
    expect(screen.getByLabelText('失效条件')).toBeInTheDocument();
    expect(screen.getByLabelText('主线关联')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '状态设定' }));
    expect(screen.getByLabelText('当前归属')).toBeInTheDocument();
    expect(screen.getByLabelText('可用状态')).toBeInTheDocument();
    expect(screen.getByLabelText('剩余次数')).toBeInTheDocument();
    expect(screen.getByLabelText('竞争风险')).toBeInTheDocument();
    expect(screen.getByLabelText('激活进度')).toBeInTheDocument();
    expect(screen.getByLabelText('最近触发')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '确认' }));
    expect(screen.getByText('确认更新')).toBeInTheDocument();
    expect(screen.getByText(/确认后才写入状态设定/)).toBeInTheDocument();
  });

  it('splits plot planning previews into blueprint, volume, and payoff fields', async () => {
    const storageKey = 'workbench-plot-planning-structured-preview-test';
    const structuredSettingsSource = await readWorkbenchStructuredSettingsSource();
    const blueprintSetStart = structuredSettingsSource.indexOf("id: 'work-plot-blueprint'");
    const blueprintSetEnd = structuredSettingsSource.indexOf("id: 'work-plot-volume'", blueprintSetStart);
    const blueprintSetSource = structuredSettingsSource.slice(blueprintSetStart, blueprintSetEnd);

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('剧情规划3');

    fireEvent.click(screen.getByText('剧情蓝图').closest('button') as HTMLElement);
    expect(screen.getByLabelText('整体规划')).toBeInTheDocument();
    expect(screen.getByLabelText('主线目标')).toBeInTheDocument();
    expect(screen.getByLabelText('阶段节奏')).toBeInTheDocument();
    expect(blueprintSetSource).toContainSource("gridColumnsClassName: 'grid-cols-2'");
    expect(blueprintSetSource).not.toContainSource("gridColumnsClassName: 'grid-cols-3'");
    fireEvent.change(screen.getByLabelText('整体规划'), { target: { value: '全书三卷，一百万字。' } });
    fireEvent.change(screen.getByLabelText('主线目标'), { target: { value: '主角推翻旧天庭。' } });
    fireEvent.change(screen.getByLabelText('阶段节奏'), { target: { value: '前期求生，中期扩张，后期决战。' } });

    fireEvent.click(screen.getByText('分卷剧情').closest('button') as HTMLElement);
    expect(screen.getByLabelText('分卷总览')).toBeInTheDocument();
    expect(screen.getByLabelText('卷核心事件')).toBeInTheDocument();
    expect(screen.getByLabelText('卷末高潮')).toBeInTheDocument();
    expect(screen.getByLabelText('下一卷钩子')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('分卷总览'), { target: { value: '第一卷凡界崛起。' } });
    fireEvent.change(screen.getByLabelText('卷核心事件'), { target: { value: '主角夺回祖地。' } });
    fireEvent.change(screen.getByLabelText('卷末高潮'), { target: { value: '宗门大比反杀。' } });
    fireEvent.change(screen.getByLabelText('下一卷钩子'), { target: { value: '通往上界的钥匙出现。' } });

    fireEvent.click(screen.getByText('爽点设计').closest('button') as HTMLElement);
    expect(screen.getByLabelText('核心爽点类型')).toBeInTheDocument();
    expect(screen.getByLabelText('打脸对象设计')).toBeInTheDocument();
    expect(screen.getByLabelText('爽点公式')).toBeInTheDocument();
    expect(screen.getByLabelText('爽点节奏')).toBeInTheDocument();
    expect(screen.queryByText('设定预览')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('核心爽点类型'), { target: { value: '升级、反杀、打脸。' } });
    fireEvent.change(screen.getByLabelText('打脸对象设计'), { target: { value: '看不起主角的宗门长老。' } });
    fireEvent.change(screen.getByLabelText('爽点公式'), { target: { value: '误判主角实力，公开挑衅，被当场反杀。' } });
    fireEvent.change(screen.getByLabelText('爽点节奏'), { target: { value: '每三章一个小回报，每卷一个大爆点。' } });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const blueprintBody = JSON.parse(
      storedEntries.find((entry: { title: string }) => entry.title === '剧情蓝图').content,
    ).body;
    const volumeBody = JSON.parse(
      storedEntries.find((entry: { title: string }) => entry.title === '分卷剧情').content,
    ).body;
    const payoffBody = JSON.parse(
      storedEntries.find((entry: { title: string }) => entry.title === '爽点设计').content,
    ).body;
    expect(blueprintBody).toContainSource('【整体规划】：\n全书三卷，一百万字。');
    expect(blueprintBody).toContainSource('【主线目标】：\n主角推翻旧天庭。');
    expect(blueprintBody).toContainSource('【阶段节奏】：\n前期求生，中期扩张，后期决战。');
    expect(volumeBody).toContainSource('【分卷总览】：\n第一卷凡界崛起。');
    expect(volumeBody).toContainSource('【卷核心事件】：\n主角夺回祖地。');
    expect(volumeBody).toContainSource('【卷末高潮】：\n宗门大比反杀。');
    expect(volumeBody).toContainSource('【下一卷钩子】：\n通往上界的钥匙出现。');
    expect(payoffBody).toContainSource('【核心爽点类型】：\n升级、反杀、打脸。');
    expect(payoffBody).toContainSource('【打脸对象设计】：\n看不起主角的宗门长老。');
    expect(payoffBody).toContainSource('【爽点公式】：\n误判主角实力，公开挑衅，被当场反杀。');
    expect(payoffBody).toContainSource('【爽点节奏】：\n每三章一个小回报，每卷一个大爆点。');
  });

  it('keeps structured plot planning fields after renaming a custom structured setting entry', async () => {
    const storageKey = 'workbench-structured-setting-fields-survive-rename-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'custom-structured-blueprint',
          tab: '大纲',
          title: '剧情蓝图总表',
          content: JSON.stringify({
            type: '剧情规划',
            body: '',
            structuredFieldSetId: 'work-plot-blueprint',
          }),
          updatedAt: '2026/6/19 00:10:00',
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
    fireEvent.click(screen.getByText('剧情蓝图总表').closest('button') as HTMLElement);
    fireEvent.change(screen.getByLabelText('整体规划'), { target: { value: '全书三卷，一百万字。' } });

    fireEvent.change(screen.getByDisplayValue('剧情蓝图总表'), { target: { value: '完整剧情蓝图' } });

    expect(screen.getByLabelText('整体规划')).toBeInTheDocument();
    expect(screen.getByLabelText('整体规划')).toHaveValue('全书三卷，一百万字。');
    expect(screen.getByLabelText('主线目标')).toBeInTheDocument();
    expect(screen.getByLabelText('阶段节奏')).toBeInTheDocument();
    expect(screen.queryByText('设定预览')).not.toBeInTheDocument();

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const renamedEntry = storedEntries.find((entry: { title: string }) => entry.title === '完整剧情蓝图');
    expect(renamedEntry).toBeTruthy();
    const renamedSetting = JSON.parse(renamedEntry.content);
    expect(renamedSetting.structuredFieldSetId).toBe('work-plot-blueprint');
    expect(renamedSetting.body).toContainSource('【整体规划】：\n全书三卷，一百万字。');
  });

  it('recovers structured fields for custom entries when their body already has matching section titles', async () => {
    const storageKey = 'workbench-structured-setting-fields-recover-custom-entry-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'custom-body-blueprint',
          tab: '大纲',
          title: '剧情蓝图总表',
          content: JSON.stringify({
            type: '剧情规划',
            body: '【整体规划】：\n全书三卷，一百万字。\n\n【主线目标】：\n主角推翻旧天庭。\n\n【阶段节奏】：\n前期求生，中期扩张，后期决战。',
          }),
          updatedAt: '2026/6/19 00:10:00',
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
    fireEvent.click(screen.getByText('剧情蓝图总表').closest('button') as HTMLElement);

    expect(screen.getByLabelText('整体规划')).toHaveValue('全书三卷，一百万字。');
    expect(screen.getByLabelText('主线目标')).toHaveValue('主角推翻旧天庭。');
    expect(screen.getByLabelText('阶段节奏')).toHaveValue('前期求生，中期扩张，后期决战。');
    expect(screen.queryByText('设定预览')).not.toBeInTheDocument();
  });

  it('uses gray placeholder prompts for structured setting fields without saving them as content', async () => {
    const storageKey = 'workbench-structured-setting-field-placeholder-test';

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('剧情规划3');

    fireEvent.click(screen.getByText('剧情蓝图').closest('button') as HTMLElement);
    expect(screen.getByLabelText('整体规划')).toHaveAttribute(
      'placeholder',
      '预计总字数、共几卷、故事从哪里开始到哪里结束。',
    );
    expect(screen.getByLabelText('整体规划').closest('.xy-floating-field')).toHaveClass(
      'xy-floating-visible-placeholder',
    );
    expect(screen.getByLabelText('主线目标')).toHaveAttribute('placeholder', '主角长期要完成的大目标。');
    expect(screen.getByLabelText('阶段节奏')).toHaveAttribute('placeholder', '前期、中期、后期分别推进什么内容。');

    fireEvent.click(screen.getByText('分卷剧情').closest('button') as HTMLElement);
    expect(screen.getByLabelText('分卷总览')).toHaveAttribute(
      'placeholder',
      '每一卷的卷名、字数、核心阶段和主要任务。',
    );
    expect(screen.getByLabelText('卷核心事件')).toHaveAttribute('placeholder', '这一卷最重要的剧情事件和冲突推进。');

    fireEvent.click(screen.getByText('爽点设计').closest('button') as HTMLElement);
    expect(screen.getByLabelText('爽点公式')).toHaveAttribute(
      'placeholder',
      '主角想法、实际行动、结果、配角反应、主角内心反应。',
    );

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const blueprintBody = JSON.parse(
      storedEntries.find((entry: { title: string }) => entry.title === '剧情蓝图').content,
    ).body;
    expect(blueprintBody).not.toContainSource('预计总字数');
  });

  it('migrates the approved setting taxonomy into the production setting library', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const structuredSettingsSource = await readWorkbenchStructuredSettingsSource();
    const taxonomySource = await readWorkbenchSettingTaxonomySource();
    const settingTypeOptionsStart = panelSource.indexOf('const settingTypeOptions = useMemo(() => {');
    const settingTypeOptionsEnd = panelSource.indexOf('const clearSettingsTargetMeta', settingTypeOptionsStart);
    const settingTypeOptionsSource = panelSource.slice(settingTypeOptionsStart, settingTypeOptionsEnd);

    expect(taxonomySource).toContainSource(
      "const DEFAULT_WORK_SETTING_TYPES = ['核心设定', '剧情规划', '资源货币', '世界地图'];",
    );
    expect(taxonomySource).not.toContainSource("{ type: '资源体系', title: '资源货币' }");
    expect(taxonomySource).toContainSource("{ type: '资源货币', title: '资源货币' }");
    expect(taxonomySource).not.toContainSource("{ type: '书写规则', title: '写作规范' }");
    expect(taxonomySource).not.toContainSource("{ type: '书写规则', title: '写作禁忌' }");
    expect(taxonomySource).toContainSource("'setting:faction': ['正派势力', '反派势力', '中立势力', '其他势力']");
    expect(taxonomySource).toContainSource("'setting:item': ['功法能力', '物品装备', '特殊资源']");
    expect(taxonomySource).toContainSource("'setting:monster': ['怪物列表']");
    expect(taxonomySource).not.toContainSource("'setting:location': ['世界地图', '危险区域']");
    expect(taxonomySource).toContainSource("'setting:foreshadow': ['主线伏笔', '人物伏笔']");
    expect(taxonomySource).not.toContainSource("'setting:rule': ['硬规则', '禁写规则']");
    expect(panelSource).toContainSource(
      'const DEFAULT_SETTING_ENTRY_TYPE = DEFAULT_SETTING_TYPES[0] ?? UNCATEGORIZED_TYPE;',
    );
    expect(settingTypeOptionsSource).toContainSource('return merged;');
    expect(settingTypeOptionsSource).not.toContainSource('return [...merged, UNCATEGORIZED_TYPE];');
    expect(panelSource).not.toContainSource("if (type === '主线剧情') return '剧情规划';");
    expect(panelSource).not.toContainSource("if (type === '道具资源') return '物品装备';");
    expect(panelSource).not.toContainSource("if (type === '妖兽图鉴' || type === '异兽图鉴'");
    expect(panelSource).not.toContainSource("if (type === '危险区域') return '世界地图';");
    expect(panelSource).toContainSource(
      "if (/(世界|规则|背景|科技|修炼|社会秩序|限制条件|天道|能量)/.test(source)) return '核心设定';",
    );
    expect(panelSource).toContainSource(
      "if (/(主线|剧情|任务|目标|冲突|开局|转折|高潮|结局|章节|卷|事件)/.test(source)) return '剧情规划';",
    );
    expect(panelSource).toContainSource("if (/(功法|能力|技能|神通|法术|异能|招式)/.test(source)) return '功法能力';");
    expect(panelSource).toContainSource("if (/(道具|装备|物品|法宝|武器|载具|机甲)/.test(source)) return '物品装备';");
    expect(panelSource).toContainSource(
      "if (/(妖兽|怪兽|怪物|魔兽|异兽|凶兽|灵兽|灵宠|邪祟|兽潮|妖丹|兽骨|鳞甲|毒囊)/.test(source)) return '怪物列表';",
    );
    expect(panelSource).toContainSource(
      "if (/(禁区|危险|秘境|遗迹|灾区|战场|污染区)/.test(source)) return '世界地图';",
    );
    expect(panelSource).toContainSource(
      "if (/(地点|地图|交通|地域|地理|重要地点|世界地图)/.test(source)) return '世界地图';",
    );
    expect(panelSource).not.toContainSource(
      "if (/(禁写|不能写错|不能越界|硬约束|前后矛盾|规则红线)/.test(source)) return '书写规则';",
    );
  });
});
