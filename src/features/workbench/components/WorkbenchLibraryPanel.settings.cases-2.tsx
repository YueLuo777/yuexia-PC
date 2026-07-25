import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { WorkbenchLibraryPanel } from './WorkbenchLibraryPanel';
import {
  TEST_WORK_SETTING_STARTER_VERSION,
  ensureLibraryGroupExpanded,
  readWorkbenchLibraryPanelSource,
  readWorkbenchStructuredSettingsSource,
  readWorkbenchLibraryPanelConstantsSource,
  readWorkbenchLibrarySidebarSource,
  readWorkbenchOtherSettingReaderModalSource,
  readSharedStylesSource,
  readAiRequestLogModalLayoutSource,
  readChapterEditorSource,
  readEditorToolModalsSource,
} from './WorkbenchLibraryPanel.testUtils';
describe('WorkbenchLibraryPanel setting library flows', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('freezes the current setting workspace catalog as the new-novel default', async () => {
    const storageKey = 'workbench-current-setting-default-catalog-test';
    const expectedCatalog = {
      作品设定: {
        核心设定: ['作品定位', '世界背景', '力量体系', '设定红线'],
        剧情规划: ['整体剧情', '第一卷', '爽点设计'],
        创作规范: ['写作风格', '章节规则', '禁止事项', '称呼与格式'],
        剧情时间线: ['时间线发展记录'],
      },
      地点地图: {
        世界总览: ['世界架构'],
        危险区域: ['危险区域'],
      },
      势力设定: {
        正派势力: ['1号势力'],
        反派势力: [],
        中立势力: [],
        其他势力: [],
      },
      道具资源: {
        功法能力: ['功法能力'],
        物品装备: ['物品装备'],
        特殊资源: ['特殊资源'],
        资源货币: ['资源货币'],
      },
      怪物图鉴: {
        常见怪物: ['怪物图鉴'],
      },
      伏笔线索: {
        主线伏笔: ['1号主线伏笔'],
        人物伏笔: ['1号人物伏笔'],
        世界伏笔: ['1号世界伏笔'],
        其他线索: ['1号其他线索'],
      },
    };

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    expect(screen.getByRole('button', { name: '作品设定12' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '人物设定2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '地点地图2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '势力设定1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '道具资源4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '伏笔线索4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '怪物图鉴1' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '资源体系1' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '书写规则2' })).not.toBeInTheDocument();

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const settingEntries = storedEntries.filter((entry: { tab: string }) => entry.tab === '大纲');
    const entriesByType = new Map<string, string[]>();
    settingEntries.forEach((entry: { title: string; content: string }) => {
      const type = JSON.parse(entry.content).type;
      entriesByType.set(type, [...(entriesByType.get(type) ?? []), entry.title]);
      expect(JSON.parse(entry.content).body).toBe('');
    });

    Object.values(expectedCatalog).forEach((groups) => {
      Object.entries(groups).forEach(([group, titles]) => {
        expect(entriesByType.get(group) ?? []).toEqual(titles);
      });
    });
  });
  it('splits work positioning into six AI-readable fields', async () => {
    const storageKey = 'workbench-basic-setting-structured-preview-test';

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定4');

    expect(screen.getByDisplayValue('作品定位')).toBeInTheDocument();
    expect(screen.getByLabelText('小说类型')).toBeInTheDocument();
    expect(screen.getByLabelText('故事发生时代')).toBeInTheDocument();
    expect(screen.getByLabelText('作品卖点')).toBeInTheDocument();
    expect(screen.getByLabelText('读者主要想看什么')).toBeInTheDocument();
    expect(screen.getByLabelText('目标读者类型')).toBeInTheDocument();
    expect(screen.getByLabelText('一句话写清主线')).toBeInTheDocument();
    expect(screen.queryByText('设定预览')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('小说类型'), { target: { value: '玄幻升级流' } });
    fireEvent.change(screen.getByLabelText('作品卖点'), { target: { value: '主角靠吞噬旧神残骸修炼。' } });
    fireEvent.change(screen.getByLabelText('一句话写清主线'), {
      target: { value: '被逐出宗门的少年一路吞噬神明遗骨，推翻天道秩序。' },
    });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const basicSettingEntry = storedEntries.find((entry: { title: string }) => entry.title === '作品定位');
    const body = JSON.parse(basicSettingEntry.content).body;
    expect(body).toContainSource('【小说类型】：\n玄幻升级流');
    expect(body).toContainSource('【作品卖点】：\n主角靠吞噬旧神残骸修炼。');
    expect(body).toContainSource('【一句话写清主线】：\n被逐出宗门的少年一路吞噬神明遗骨，推翻天道秩序。');
  });
  it('clears old default filling instructions without touching user setting content', async () => {
    const storageKey = 'workbench-clear-old-default-setting-instructions-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, '2026-06-16-setting-starter-v2');
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'old-default-positioning',
          tab: '大纲',
          title: '作品定位',
          content: JSON.stringify({
            type: '核心设定',
            body: '填写说明：记录题材、风格、目标读者、主打体验和整体卖点，让 AI 明白这本书要给读者什么感觉。',
          }),
          updatedAt: '2026/6/16 20:00:00',
        },
        {
          id: 'user-positioning',
          tab: '大纲',
          title: '作品定位',
          content: JSON.stringify({
            type: '核心设定',
            body: '这是我自己写的作品定位。',
          }),
          updatedAt: '2026/6/16 20:01:00',
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

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const oldDefaultEntry = storedEntries.find((entry: { id: string }) => entry.id === 'old-default-positioning');
    const userEntry = storedEntries.find((entry: { id: string }) => entry.id === 'user-positioning');
    expect(oldDefaultEntry).toBeUndefined();
    expect(JSON.parse(userEntry.content).body).toBe('这是我自己写的作品定位。');
  });
  it('moves setting page scheme A into the production red-frame area without replacing the right AI panel', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).toContainSource("const [outlineSettingDomain, setOutlineSettingDomain] = useState('work')");
    expect(panelSource).toContainSource('const settingTreeDomains = [');
    expect(panelSource).toContainSource(
      "{ id: 'work', label: '作品设定', settingDomain: null }",
    );
    expect(panelSource).toContainSource("{ id: 'character', label: '人物设定', settingDomain: null }");
    expect(panelSource).toContainSource("{ id: 'setting:faction', label: '势力设定', settingDomain: 'setting:faction' }");
    expect(panelSource).toContainSource("{ id: 'setting:item', label: '道具资源', settingDomain: 'setting:item' }");
    expect(panelSource).toContainSource("{ id: 'setting:monster', label: '怪物图鉴', settingDomain: 'setting:monster' }");
    expect(panelSource).not.toContainSource("label: '地点场景'");
    expect(panelSource).toContainSource("{ id: 'setting:foreshadow', label: '伏笔线索', settingDomain: 'setting:foreshadow' }");
    expect(panelSource).not.toContainSource("{ id: 'setting:rule', label: '书写规则', type: 'setting:rule' }");
    expect(panelSource).toContainSource(
      "gridTemplateRows: activeTab === SETTING_TAB && !activeIsBrainstorm ? 'minmax(0,1fr)' : undefined",
    );
    expect(panelSource).toContainSource('<WorkbenchSettingTreeSidebar');
    expect(panelSource).toContainSource('getSettingTypeWorkspaceDomain(type) === activeSettingWorkspaceDomain');
    expect(panelSource).toContainSource('const selectedSettingWorkspaceType = getSelectedSettingWorkspaceType();');
    expect(panelSource).toContainSource('rightResizeHandle');
    expect(panelSource).toContainSource('CombinedAiConfigSelect');
  });
});
