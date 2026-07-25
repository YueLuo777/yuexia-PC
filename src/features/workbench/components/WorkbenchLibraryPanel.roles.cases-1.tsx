import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { WorkbenchLibraryPanel } from './WorkbenchLibraryPanel';
import {
  TEST_WORK_SETTING_STARTER_VERSION,
  unlockSmartImportSettings,
  ensureLibraryDomainExpanded,
  ensureLibraryGroupExpanded,
  readWorkbenchLibraryPanelSource,
  readWorkbenchStructuredSettingsSource,
  readWorkbenchRoleSettingFieldsSource,
  readWorkbenchRoleEditorSource,
  readWorkbenchFieldSizeSettingsSource,
  readWorkbenchSettingSegmentedTabsSource,
  readSharedSegmentedTabsSource,
  readTestCollectionSource,
} from './WorkbenchLibraryPanel.testUtils';
describe('WorkbenchLibraryPanel role library flows', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('smart-imports top page tags into settings and role libraries', async () => {
    const storageKey = 'workbench-smart-import-top-page-tags-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      `${storageKey}_tab_configs_v1`,
      JSON.stringify({
        大纲: {
          aiOutput: [
            '<作品设定>',
            '<核心设定>',
            '*基础设定*：',
            '',
            '【故事类型】：',
            '东方玄幻升级流。',
            '</核心设定>',
            '<世界地图>',
            '*世界架构*：',
            '',
            '【世界架构】：',
            '凡界、灵界、九重天依次递进。',
            '</世界地图>',
            '</作品设定>',
            '',
            '<人物设定>',
            '*男主角设定*：',
            '',
            '【人物姓名】：',
            '林刻',
            '',
            '【身份定位】：',
            '男主角',
            '',
            '【外貌】：',
            '黑衣少年，目光冷静。',
            '',
            '【核心性格】：',
            '果断但不滥杀。',
            '</人物设定>',
            '',
            '<势力设定>',
            '<正派势力>',
            '*青云宗*：',
            '',
            '【基本信息】：',
            '东域正道宗门。',
            '</正派势力>',
            '</势力设定>',
            '',
            '<道具资源>',
            '<物品装备>',
            '*黑玉令*：',
            '',
            '【基本信息】：',
            '旧界门钥匙。',
            '</物品装备>',
            '</道具资源>',
            '',
            '<怪物图鉴>',
            '<怪物列表>',
            '*黑鳞妖狼*：',
            '',
            '【怪物形象】：',
            '黑鳞覆身，眼泛青光。',
            '</怪物列表>',
            '</怪物图鉴>',
            '',
            '<伏笔线索>',
            '<主线伏笔>',
            '*黑玉令真相*：',
            '',
            '【埋设内容】：',
            '黑玉令来自旧界。',
            '</主线伏笔>',
            '</伏笔线索>',
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

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const storedSettings = storedEntries.filter((entry: { tab: string }) => entry.tab === '大纲');
    const storedRoles = storedEntries.filter((entry: { tab: string }) => entry.tab === '角色');
    expect(storedSettings.map((entry: { title: string }) => entry.title)).toEqual([
      '作品定位',
      '世界架构',
      '青云宗',
      '黑玉令',
      '黑鳞妖狼',
      '黑玉令真相',
    ]);
    expect(storedSettings.map((entry: { content: string }) => JSON.parse(entry.content).type)).toEqual([
      '核心设定',
      '世界总览',
      '正派势力',
      '物品装备',
      '常见怪物',
      '主线伏笔',
    ]);
    expect(storedRoles).toHaveLength(2);
    expect(storedRoles[0].title).toBe('林刻');
    const importedRole = JSON.parse(storedRoles[0].content);
    expect(importedRole.type).toBe('男主角');
    expect(importedRole.baseSetting).toContainSource('【外貌】：\n黑衣少年，目光冷静。');
    expect(importedRole.baseSetting).toContainSource('【性格】：\n果断但不滥杀。');
  });
  it('supports clearing character settings from the setting page without clearing work settings', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource(
      "type ClearSettingsTarget = 'settingCategories' | 'settingEntries' | 'roleCategories' | 'roleEntries';",
    );
    expect(panelSource).toContainSource(
      "const categoryMenuClearCategoryTarget: ClearSettingsTarget = categoryMenu?.kind === 'role' ? 'roleCategories' : 'settingCategories';",
    );
    expect(panelSource).toContainSource(
      "const categoryMenuClearEntryTarget: ClearSettingsTarget = categoryMenu?.kind === 'role' ? 'roleEntries' : 'settingEntries';",
    );
    expect(panelSource).toContainSource('const clearRoleEntries = () => {');
    expect(panelSource).toContainSource(
      'persist(entries.filter((entry) => entry.tab !== ROLE_TAB || isMaleProtagonistRoleType(parseRoleContent(entry.content).type)));',
    );
    expect(panelSource).toContainSource('const deletableRoleEntries = useMemo(');
    expect(panelSource).toContainSource(
      'roleEntries.filter((entry) => !isMaleProtagonistRoleType(parseRoleContent(entry.content).type))',
    );
    expect(panelSource).toContainSource('openClearSettingsConfirmFromMenu(categoryMenuClearEntryTarget)');
    expect(panelSource).toContainSource("if (clearSettingsConfirmTarget === 'roleEntries') clearRoleEntries();");
    expect(panelSource).toContainSource("roleEntries: {\n      label: '角色'");
    expect(panelSource).not.toContainSource('activeTab === SETTING_TAB && !isOutlineCharacterScope && (');
  });
  it('opens setting and role groups by default when the settings page starts', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).not.toContainSource(
      "if (hasStoredExpandedStringSet(storageKey, ROLE_TAB, 'role_types')) return;",
    );
    expect(panelSource).toContainSource('roleTypeOptions.forEach((type) => next.add(type));');
    expect(panelSource).toContainSource('roleExpandedReloadRef.current = true;');
    expect(panelSource).not.toContainSource(
      "if (hasStoredExpandedStringSet(storageKey, activeTab, 'setting_types')) return;",
    );
    expect(panelSource).toContainSource('settingTypeOptions.forEach((type) => next.add(type));');
    expect(panelSource).toContainSource('settingExpandedReloadRef.current = true;');
  });
  it('removes entries when their setting or character group is removed', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const clearSettingCategoriesStart = panelSource.indexOf('const clearSettingCategories = () => {');
    const clearSettingCategoriesEnd = panelSource.indexOf(
      'const clearSettingEntries = () => {',
      clearSettingCategoriesStart,
    );
    const clearSettingEntriesStart = panelSource.indexOf('const clearSettingEntries = () => {');
    const clearSettingEntriesEnd = panelSource.indexOf('const clearRoleCategories = () => {', clearSettingEntriesStart);
    const clearRoleCategoriesStart = panelSource.indexOf('const clearRoleCategories = () => {');
    const clearRoleCategoriesEnd = panelSource.indexOf('const clearRoleEntries = () => {', clearRoleCategoriesStart);
    const deleteRoleTypeStart = panelSource.indexOf('const deleteRoleType = (type: string) => {');
    const deleteRoleTypeEnd = panelSource.indexOf('const deleteSettingType = (type: string) => {', deleteRoleTypeStart);
    const deleteSettingTypeStart = panelSource.indexOf('const deleteSettingType = (type: string) => {');
    const deleteSettingTypeEnd = panelSource.indexOf('const deleteCategoryFromMenu = () => {', deleteSettingTypeStart);
    const clearSettingCategoriesSource = panelSource.slice(clearSettingCategoriesStart, clearSettingCategoriesEnd);
    const clearSettingEntriesSource = panelSource.slice(clearSettingEntriesStart, clearSettingEntriesEnd);
    const clearRoleCategoriesSource = panelSource.slice(clearRoleCategoriesStart, clearRoleCategoriesEnd);
    const deleteRoleTypeSource = panelSource.slice(deleteRoleTypeStart, deleteRoleTypeEnd);
    const deleteSettingTypeSource = panelSource.slice(deleteSettingTypeStart, deleteSettingTypeEnd);

    expect(clearSettingCategoriesSource).toContainSource('const domain = getSelectedSettingWorkspaceDomain();');
    expect(clearSettingCategoriesSource).toContainSource('if (entry.tab !== SETTING_TAB) return true;');
    expect(clearSettingCategoriesSource).toContainSource('if (isLockedDefaultSettingEntry(entry)) return true;');
    expect(clearSettingCategoriesSource).toContainSource(
      'return !isSettingTypeInActiveClearDomain(parseSettingContent(entry.content).type);',
    );
    expect(clearSettingCategoriesSource).toContainSource(
      'const nextCustomTypes = customSettingTypes.filter((type) => !shouldClearType(type));',
    );
    expect(clearSettingEntriesSource).toContainSource(
      'return !isSettingTypeInActiveClearDomain(parseSettingContent(entry.content).type);',
    );
    expect(clearSettingCategoriesSource).not.toContainSource(
      'content: stringifySettingContent({ ...setting, type: UNCATEGORIZED_TYPE })',
    );
    expect(clearRoleCategoriesSource).toContainSource('setHiddenRoleTypes([]);');
    expect(clearRoleCategoriesSource).toContainSource(
      'return isDefaultWorkbenchRoleType(parseRoleContent(entry.content).type);',
    );
    expect(clearRoleCategoriesSource).toContainSource(
      'setExpandedRoleTypes(new Set(DEFAULT_ROLE_TYPES.filter((type) => type !== UNCATEGORIZED_TYPE)));',
    );
    expect(clearRoleCategoriesSource).not.toContainSource(
      'content: stringifyRoleContent({ ...role, type: UNCATEGORIZED_TYPE })',
    );
    expect(deleteSettingTypeSource).toContainSource('persist(entries.filter((entry) => {');
    expect(deleteSettingTypeSource).toContainSource('return setting.type !== type;');
    expect(deleteSettingTypeSource).toContainSource('if (DEFAULT_SETTING_TYPES.includes(type)) return;');
    expect(deleteSettingTypeSource).not.toContainSource(
      'content: stringifySettingContent({ ...setting, type: UNCATEGORIZED_TYPE })',
    );
    expect(deleteRoleTypeSource).toContainSource('persist(entries.filter((entry) => {');
    expect(deleteRoleTypeSource).toContainSource('return role.type !== type;');
    expect(deleteRoleTypeSource).toContainSource(
      'if (type === UNCATEGORIZED_TYPE || isDefaultWorkbenchRoleType(type)) return;',
    );
    expect(deleteRoleTypeSource).not.toContainSource('isMaleProtagonistRoleType(type)) return;');
    expect(deleteRoleTypeSource).not.toContainSource(
      'content: stringifyRoleContent({ ...role, type: DEFAULT_ROLE_TYPES[0] ?? UNCATEGORIZED_TYPE })',
    );
  });
  it('shows the approved default groups for character and setting workspace tabs', async () => {
    const storageKey = 'workbench-approved-setting-default-groups-test';
    localStorage.setItem(
      `${storageKey}_hidden_role_types`,
      JSON.stringify(['男主角', '女主角', '重要正派角色', '正派配角', '重要反派角色', '反派配角', '龙套角色']),
    );
    localStorage.setItem(`${storageKey}_hidden_setting_types`, JSON.stringify(['核心设定', '剧情规划', '世界地图']));

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    expect(screen.getByRole('button', { name: '核心设定4' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '世界规则1' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '剧情规划3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '创作规范4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '剧情时间线1' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '资源体系1' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '书写规则2' })).not.toBeInTheDocument();

    ensureLibraryDomainExpanded('人物设定2');
    expect(screen.getByRole('button', { name: '男女主2' })).toBeInTheDocument();
    ['重要配角', '反派', '其他角色'].forEach((group) => {
      expect(screen.getByRole('button', { name: `${group}0` })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: '未分类0' })).not.toBeInTheDocument();

    const groupsByTab = [
      { tab: '地点地图2', groups: ['世界总览', '国家区域', '城池宗门', '建筑地点', '秘境遗迹', '危险区域', '其他地点'], populated: ['世界总览', '危险区域'] },
      { tab: '势力设定1', groups: ['正派势力', '反派势力', '中立势力', '其他势力'], populated: ['正派势力'] },
      { tab: '道具资源4', groups: ['功法能力', '物品装备', '特殊资源', '资源货币'], populated: ['功法能力', '物品装备', '特殊资源', '资源货币'] },
      { tab: '伏笔线索4', groups: ['主线伏笔', '人物伏笔', '世界伏笔', '其他线索'], populated: ['主线伏笔', '人物伏笔', '世界伏笔', '其他线索'] },
      { tab: '怪物图鉴1', groups: ['常见怪物', '精英怪物', '首领怪物', '特殊生命'], populated: ['常见怪物'] },
    ];

    groupsByTab.forEach(({ tab, groups, populated }) => {
      fireEvent.click(screen.getByRole('button', { name: tab }));
      groups.forEach((group) => {
        expect(screen.getByRole('button', { name: `${group}${populated.includes(group) ? 1 : 0}` })).toBeInTheDocument();
      });
    });
    expect(JSON.parse(localStorage.getItem(`${storageKey}_hidden_role_types`) ?? '[]')).toEqual([]);
    expect(JSON.parse(localStorage.getItem(`${storageKey}_hidden_setting_types`) ?? '[]')).toEqual([]);
  });
  it('seeds a locked male protagonist role for a new novel and opens it from character settings', async () => {
    const storageKey = 'workbench-default-male-protagonist-role-test';
    const panelSource = await readWorkbenchLibraryPanelSource();

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    expect(screen.getByRole('button', { name: '人物设定2' })).toBeInTheDocument();
    ensureLibraryDomainExpanded('人物设定2');
    expect(screen.getByRole('button', { name: '男女主2' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '人物姓名' })).toHaveValue('男主角');
    expect(screen.getByRole('combobox', { name: '身份定位' })).toHaveValue('男主角');
    expect(screen.getByRole('combobox', { name: '身份定位' })).toBeDisabled();
    expect(screen.getByRole('group', { name: '生存状态' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '存活' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '死亡' })).toBeDisabled();
    expect(screen.queryByRole('combobox', { name: '状态标签' })).not.toBeInTheDocument();

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const roleEntries = storedEntries.filter((entry: { tab: string }) => entry.tab === '角色');
    expect(roleEntries).toHaveLength(2);
    expect(roleEntries[0].title).toBe('男主角');
    expect(JSON.parse(roleEntries[0].content)).toMatchObject({
      type: '男主角',
      lifeStatus: '存活',
    });
    expect(panelSource).toContainSource(
      'function isMaleProtagonistRoleTypeChangeLocked(currentType: string, nextType: string) {',
    );
    expect(panelSource).toContainSource(
      'return isMaleProtagonistRoleType(currentType) && !isMaleProtagonistRoleType(nextType);',
    );
    expect(panelSource).toContainSource(
      'if (normalizedUpdates.type && isMaleProtagonistRoleTypeChangeLocked(selectedRole.type, normalizedUpdates.type)) return;',
    );
    expect(panelSource).toContainSource(
      'if (normalizedUpdates.type && isMaleProtagonistRoleTypeChangeLocked(currentSelectedRole.type, normalizedUpdates.type)) return;',
    );
    expect(panelSource).toContainSource(
      'if (!preserveFemaleProtagonist && isMaleProtagonistRoleTypeChangeLocked(role.type, targetType)) return null;',
    );
    expect(panelSource).toContainSource(
      "if (entryMenu.tab === ROLE_TAB && isMaleProtagonistRoleType(entryMenu.roleType ?? '')) return;",
    );
    expect(panelSource).toContainSource(
      "const entryMenuIsMaleProtagonist = Boolean(entryMenu?.tab === ROLE_TAB && isMaleProtagonistRoleType(entryMenu.roleType ?? ''));",
    );
    expect(panelSource).toContainSource('deleteDisabled={entryMenuDeleteDisabled}');
    expect(panelSource).toContainSource('disabled={deleteDisabled}');
    expect(panelSource).toContainSource(
      'disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent',
    );
    expect(panelSource).toContainSource('const roleIsMaleProtagonist = isMaleProtagonistRoleType(role.type);');
    expect(panelSource).toContainSource('const roleIdentityOptionsForCurrentRole = roleIsMaleProtagonist ? [role.type] : roleIdentityTypeOptions;');
    expect(panelSource).toContainSource('label="身份定位"');
    expect(panelSource).toContainSource('disabled={roleIsMaleProtagonist}');
    expect(panelSource).toContainSource('options={roleIdentityOptionsForCurrentRole}');
    expect(panelSource).toContainSource('<WorkbenchSurvivalStatusToggle');
    expect(panelSource).toContainSource("value={roleLifeStatus ?? '存活'}");
    expect(panelSource).toContainSource('disabled={roleIsMaleProtagonist}');
    expect(panelSource).not.toContainSource('xy-role-life-toggle');
  });
  it('moves protagonist cheat advantage fields into the male role editor', async () => {
    const storageKey = 'workbench-cheat-advantage-structured-preview-test';

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryDomainExpanded('人物设定2');
    expect(screen.getByRole('textbox', { name: '人物姓名' })).toHaveValue('男主角');

    expect(screen.getByText('金手指')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('金手指目前能做什么。')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('金手指从哪里来，主角为什么获得。')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('金手指如何进阶和强化。')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('金手指在什么条件下不能使用。')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('金手指真正从何而来。')).toBeInTheDocument();
    expect(screen.queryByText('主角金手指/优势')).not.toBeInTheDocument();
  });
  it('shows righteous faction fixed and status fields together with status history on the right', async () => {
    const storageKey = 'workbench-righteous-faction-structured-preview-test';
    const panelSource = await readWorkbenchLibraryPanelSource();
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'righteous-faction-1',
          tab: '大纲',
          title: '1号势力',
          content: JSON.stringify({ type: '正派势力', body: '' }),
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

    ensureLibraryDomainExpanded('势力设定1');
    ensureLibraryGroupExpanded('正派势力1');
    fireEvent.click(screen.getByText('1号势力').closest('button') as HTMLElement);

    expect(screen.queryByRole('heading', { name: '基础设定' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '状态设定' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '基础设定' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('势力名')).toHaveValue('1号势力');
    expect(screen.getByTestId('structured-title-field')).toContainElement(screen.getByLabelText('势力名'));
    screen.getAllByTestId('structured-setting-fields').forEach((group) => {
      expect(group).not.toContainElement(screen.getByLabelText('势力名'));
    });
    expect(screen.queryByText('设定名')).not.toBeInTheDocument();
    expect(panelSource).not.toContainSource('当前设定完整显示');
    expect(panelSource).toContainSource('testId="structured-title-field"');
    expect(screen.getByLabelText('势力类型')).toBeInTheDocument();
    expect(screen.getByLabelText('核心优势')).toBeInTheDocument();
    expect(screen.getByLabelText('组织架构')).toBeInTheDocument();
    expect(screen.getByLabelText('主要人物')).toBeInTheDocument();
    expect(screen.getByLabelText('势力关系')).toBeInTheDocument();
    expect(screen.getByLabelText('对主角行动')).toBeInTheDocument();
    expect(screen.getByLabelText('当前问题')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('势力类型'), { target: { value: '东洲正道宗门。' } });

    fireEvent.change(screen.getByLabelText('势力关系'), { target: { value: '暂时与主角合作，暗中防备魔道。' } });
    fireEvent.change(screen.getByLabelText('对主角行动'), { target: { value: '先保护主角，再观察其金手指来源。' } });
    fireEvent.change(screen.getByLabelText('当前问题'), { target: { value: '内部长老对是否支持主角存在分歧。' } });

    fireEvent.click(screen.getByRole('button', { name: '更新状态 · 0' }));
    expect(screen.getByText(/当前范围没有待确认更新/)).toBeInTheDocument();

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const factionEntry = storedEntries.find((entry: { title: string }) => entry.title === '1号势力');
    const body = JSON.parse(factionEntry.content).body;
    expect(body).toContainSource('【势力类型】：\n东洲正道宗门。');
    expect(body).toContainSource('【势力关系】：\n暂时与主角合作，暗中防备魔道。');
    expect(body).toContainSource('【对主角行动】：\n先保护主角，再观察其金手指来源。');
    expect(body).toContainSource('【当前问题】：\n内部长老对是否支持主角存在分歧。');
  });
  it('keeps structured settings in continuous black-frame groups with smaller placeholders', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const structuredSettingsSource = await readWorkbenchStructuredSettingsSource();
    expect(structuredSettingsSource).toContainSource("groups: [");
    expect(panelSource).toContainSource('groups.map((group)');
    expect(panelSource).toContainSource('rounded-[22px] border-2 border-slate-950');
    expect(panelSource).toContainSource('resize-none border-0 bg-transparent');
    expect(panelSource).toContainSource('placeholder:font-semibold placeholder:text-slate-400');
    expect(panelSource).not.toContainSource('xy-structured-setting-field');
    expect(panelSource).not.toContainSource('getSettingFieldPolicy');
  });
  it('removes the role editor delete button because protagonist settings are renamed instead of deleted', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const propsStart = panelSource.indexOf('type RoleBaseStateEditorProps = {');
    const propsEnd = panelSource.indexOf('function RoleBaseStateEditor', propsStart);
    const editorStart = propsEnd;
    const editorEnd = panelSource.indexOf('<section className=', editorStart);
    const propsSource = panelSource.slice(propsStart, propsEnd);
    const editorHeaderSource = panelSource.slice(editorStart, editorEnd);

    expect(propsSource).not.toContainSource('deleteUnlocked');
    expect(propsSource).not.toContainSource('onDelete');
    expect(propsSource).not.toContainSource('onToggleDeleteUnlocked');
    expect(editorHeaderSource).not.toContainSource('删除');
    expect(editorHeaderSource).not.toContainSource('onDelete();');
    expect(editorHeaderSource).not.toContainSource('onToggleDeleteUnlocked();');
  });
  it('keeps character relationship as a first-class field with history and update policy', async () => {
    const roleSettingFieldsSource = await readWorkbenchRoleSettingFieldsSource();
    const roleEditorSource = await readWorkbenchRoleEditorSource();

    expect(roleSettingFieldsSource).toContainSource(
      "type RoleStateUpdateChapterKey = RoleStateFieldKey | 'relationshipState';",
    );
    expect(roleEditorSource).toContainSource("field.label === '人物关系'");
    expect(roleEditorSource).toContainSource('relationship: value');
    expect(roleEditorSource).toContainSource('relationshipState: currentChapterNumber');
    expect(roleEditorSource).not.toContainSource('roleSettingTabs');
    expect(roleEditorSource).toContainSource("import { History } from 'lucide-react';");
    expect(roleEditorSource).toContainSource('title="字段记录"');
    expect(roleEditorSource).toContainSource('right-5 top-0 z-10 grid h-6 w-6 -translate-y-1/2');
    expect(roleEditorSource).toContainSource('text-[#08AACE]');
    expect(roleEditorSource).toContainSource('<History className="h-4 w-4" />');
    expect(roleEditorSource).not.toContainSource('字段记录 →');
    expect(roleEditorSource).toContainSource('<WorkbenchFieldRecordModal');
    expect(roleEditorSource).not.toContainSource('getSettingFieldPolicy');
    expect(roleEditorSource).not.toContainSource('<aside');
  });
});
