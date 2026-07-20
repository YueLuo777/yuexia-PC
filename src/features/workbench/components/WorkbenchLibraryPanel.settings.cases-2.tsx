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
        核心设定: ['基础设定', '世界观', '主角金手指/优势'],
        剧情规划: ['剧情蓝图', '爽点设计', '分卷剧情'],
        世界地图: ['世界架构', '危险区域'],
        资源货币: ['资源货币'],
      },
      势力设定: {
        正派势力: [],
        反派势力: [],
        中立势力: [],
        其他势力: [],
      },
      道具资源: {
        功法能力: [],
        物品装备: [],
        特殊资源: [],
      },
      怪物图鉴: {
        怪物列表: [],
      },
      伏笔线索: {
        主线伏笔: ['1号主线伏笔'],
        人物伏笔: ['1号人物伏笔'],
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

    expect(screen.getByRole('button', { name: '作品设定9' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '人物设定1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '势力设定0' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '道具资源0' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '怪物图鉴0' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '伏笔线索2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '资源货币1' })).toBeInTheDocument();
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
  it('splits basic setting preview into story type, core concept, and one sentence summary fields', async () => {
    const storageKey = 'workbench-basic-setting-structured-preview-test';
    const structuredSettingsSource = await readWorkbenchStructuredSettingsSource();
    const basicSetStart = structuredSettingsSource.indexOf("id: 'work-core-basic'");
    const basicSetEnd = structuredSettingsSource.indexOf("id: 'work-core-world-view'", basicSetStart);
    const basicSetSource = structuredSettingsSource.slice(basicSetStart, basicSetEnd);

    render(
      <WorkbenchLibraryPanel
        storageKey={storageKey}
        tabs={['大纲', '角色', '脑洞']}
        emptyText="暂无设定"
        defaultActiveTab="大纲"
      />,
    );

    ensureLibraryGroupExpanded('核心设定3');

    expect(screen.getByDisplayValue('基础设定')).toBeInTheDocument();
    expect(basicSetSource).toContainSource("gridColumnsClassName: 'grid-cols-2'");
    expect(basicSetSource).not.toContainSource("gridColumnsClassName: 'grid-cols-3'");
    expect(screen.getByLabelText('故事类型')).toBeInTheDocument();
    expect(screen.getByLabelText('核心创意')).toBeInTheDocument();
    expect(screen.getByLabelText('一句话概括')).toBeInTheDocument();
    expect(screen.queryByText('设定预览')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('故事类型'), { target: { value: '玄幻升级流' } });
    fireEvent.change(screen.getByLabelText('核心创意'), { target: { value: '主角靠吞噬旧神残骸修炼。' } });
    fireEvent.change(screen.getByLabelText('一句话概括'), {
      target: { value: '被逐出宗门的少年一路吞噬神明遗骨，推翻天道秩序。' },
    });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const basicSettingEntry = storedEntries.find((entry: { title: string }) => entry.title === '基础设定');
    const body = JSON.parse(basicSettingEntry.content).body;
    expect(body).toContainSource('【故事类型】：\n玄幻升级流');
    expect(body).toContainSource('【核心创意】：\n主角靠吞噬旧神残骸修炼。');
    expect(body).toContainSource('【一句话概括】：\n被逐出宗门的少年一路吞噬神明遗骨，推翻天道秩序。');
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
    expect(panelSource).toContainSource('const settingWorkspaceDomainTabs = [');
    expect(panelSource).toContainSource(
      "{ id: 'work', label: '作品设定', count: visibleWorkSettingCount, type: null }",
    );
    expect(panelSource).toContainSource("{ id: 'character', label: '人物设定', count: visibleRoleCount, type: null }");
    expect(panelSource).toContainSource("{ id: 'setting:faction', label: '势力设定', type: 'setting:faction' }");
    expect(panelSource).toContainSource("{ id: 'setting:item', label: '道具资源', type: 'setting:item' }");
    expect(panelSource).toContainSource("{ id: 'setting:monster', label: '怪物图鉴', type: 'setting:monster' }");
    expect(panelSource).not.toContainSource("label: '地点场景'");
    expect(panelSource).toContainSource("{ id: 'setting:foreshadow', label: '伏笔线索', type: 'setting:foreshadow' }");
    expect(panelSource).not.toContainSource("{ id: 'setting:rule', label: '书写规则', type: 'setting:rule' }");
    expect(panelSource).toContainSource(
      "gridTemplateRows: activeTab === SETTING_TAB && !activeIsBrainstorm ? 'auto minmax(0,1fr)' : undefined",
    );
    expect(panelSource).toContainSource("gridColumn: '1 / 4'");
    expect(panelSource).toContainSource('settingWorkspaceTopTabs');
    expect(panelSource).toContainSource('getSettingTypeWorkspaceDomain(type) === activeSettingWorkspaceDomain');
    expect(panelSource).toContainSource('const selectedSettingWorkspaceType = getSelectedSettingWorkspaceType();');
    expect(panelSource).toContainSource('rightResizeHandle');
    expect(panelSource).toContainSource('CombinedAiConfigSelect');
  });
});
