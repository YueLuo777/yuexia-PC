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
