import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { WorkbenchLibraryPanel } from './WorkbenchLibraryPanel';
import {
  TEST_WORK_SETTING_STARTER_VERSION,
  ensureLibraryGroupExpanded,
  readWorkbenchLibraryPanelSource,
  readWorkbenchStructuredSettingsSource,
  readWorkbenchLibraryPanelConstantsSource,
  readSharedStylesSource,
  readCombinedAiConfigSelectSource,
  readCapsuleSelectSource,
  readChapterEditorSource,
  readAiInlineInputSource,
  readTestCollectionSource,
} from './WorkbenchLibraryPanel.testUtils';
describe('WorkbenchLibraryPanel entry ordering behavior', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('uses swap-style preview when dragging a setting entry onto the next row', async () => {
    const storageKey = 'workbench-drag-swap-preview-setting-entry-order-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'core-one',
          tab: '大纲',
          title: '自定义核心一',
          content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
          updatedAt: '2026/6/18 01:00:00',
        },
        {
          id: 'core-two',
          tab: '大纲',
          title: '自定义核心二',
          content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
          updatedAt: '2026/6/18 01:01:00',
        },
        {
          id: 'core-three',
          tab: '大纲',
          title: '自定义核心三',
          content: JSON.stringify({ type: '核心设定', body: '用户已有核心爽点。' }),
          updatedAt: '2026/6/18 01:02:00',
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

    ensureLibraryGroupExpanded('核心设定3');
    const getVisibleCoreTitles = () =>
      screen
        .getAllByRole('button')
        .map((button) =>
          ['自定义核心一', '自定义核心二', '自定义核心三'].find((title) => button.textContent?.includes(title)),
        )
        .filter((title): title is string => Boolean(title));

    expect(getVisibleCoreTitles()).toEqual(['自定义核心一', '自定义核心二', '自定义核心三']);

    const source = screen.getByText('自定义核心一').closest('button');
    const target = screen.getByText('自定义核心二').closest('button');
    expect(source).toBeTruthy();
    expect(target).toBeTruthy();
    const dataTransfer = {
      data: {} as Record<string, string>,
      effectAllowed: '',
      dropEffect: '',
      setData(type: string, value: string) {
        this.data[type] = value;
      },
      getData(type: string) {
        return this.data[type] ?? '';
      },
    };

    fireEvent.dragStart(source as HTMLElement, { dataTransfer });
    fireEvent.dragOver(target as HTMLElement, { dataTransfer });

    expect(getVisibleCoreTitles()).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);

    fireEvent.drop(target as HTMLElement, { dataTransfer });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);
  });
  it('commits the last previewed setting order when drag end fires without a drop event', async () => {
    const storageKey = 'workbench-drag-end-commits-preview-setting-entry-order-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'core-one',
          tab: '大纲',
          title: '自定义核心一',
          content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
          updatedAt: '2026/6/18 01:00:00',
        },
        {
          id: 'core-two',
          tab: '大纲',
          title: '自定义核心二',
          content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
          updatedAt: '2026/6/18 01:01:00',
        },
        {
          id: 'core-three',
          tab: '大纲',
          title: '自定义核心三',
          content: JSON.stringify({ type: '核心设定', body: '用户已有核心爽点。' }),
          updatedAt: '2026/6/18 01:02:00',
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

    ensureLibraryGroupExpanded('核心设定3');
    const source = screen.getByText('自定义核心一').closest('button');
    const target = screen.getByText('自定义核心二').closest('button');
    expect(source).toBeTruthy();
    expect(target).toBeTruthy();
    const dataTransfer = {
      data: {} as Record<string, string>,
      effectAllowed: '',
      dropEffect: '',
      setData(type: string, value: string) {
        this.data[type] = value;
      },
      getData(type: string) {
        return this.data[type] ?? '';
      },
    };

    fireEvent.dragStart(source as HTMLElement, { dataTransfer });
    fireEvent.dragOver(target as HTMLElement, { dataTransfer });
    fireEvent.dragEnd(source as HTMLElement, { dataTransfer });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);
  });
  it('keeps the latest drag preview in a synchronous ref for real browser drag end timing', async () => {
    const source = await readWorkbenchLibraryPanelSource();

    expect(source).toContainSource('const libraryEntryDropPreviewRef = useRef<LibraryEntryDropPreviewState>(null);');
    expect(source).toContainSource('const setLibraryEntryDropPreviewState = (next: LibraryEntryDropPreviewState)');
    expect(source).toContainSource('libraryEntryDropPreviewRef.current = next;');
    expect(source).toContainSource('commitLibraryEntryDropPreview(libraryEntryDropPreviewRef.current);');
    expect(source).toContainSource('type LibraryEntryPointerDragState');
    expect(source).toContainSource('beginLibraryEntryPointerDrag');
    expect(source).toContainSource('updateLibraryEntryPointerPreview');
    expect(source).toContainSource('finishLibraryEntryPointerDrag');
    expect(source).toContainSource('data-library-entry-id={entry.id}');
  });
  it('keeps setting entry order stable when dragging across a non-empty group header', async () => {
    const storageKey = 'workbench-drag-stable-over-non-empty-group-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'core-one',
          tab: '大纲',
          title: '自定义核心一',
          content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
          updatedAt: '2026/6/18 01:00:00',
        },
        {
          id: 'core-two',
          tab: '大纲',
          title: '自定义核心二',
          content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
          updatedAt: '2026/6/18 01:01:00',
        },
        {
          id: 'core-three',
          tab: '大纲',
          title: '自定义核心三',
          content: JSON.stringify({ type: '核心设定', body: '用户已有核心爽点。' }),
          updatedAt: '2026/6/18 01:02:00',
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

    const groupHeader = ensureLibraryGroupExpanded('核心设定3');
    const getVisibleCoreTitles = () =>
      screen
        .getAllByRole('button')
        .map((button) =>
          ['自定义核心一', '自定义核心二', '自定义核心三'].find((title) => button.textContent?.includes(title)),
        )
        .filter((title): title is string => Boolean(title));
    const source = screen.getByText('自定义核心二').closest('button');
    expect(source).toBeTruthy();
    const dataTransfer = {
      data: {} as Record<string, string>,
      effectAllowed: '',
      dropEffect: '',
      setData(type: string, value: string) {
        this.data[type] = value;
      },
      getData(type: string) {
        return this.data[type] ?? '';
      },
    };

    fireEvent.dragStart(source as HTMLElement, { dataTransfer });
    fireEvent.dragOver(groupHeader, { dataTransfer });

    expect(getVisibleCoreTitles()).toEqual(['自定义核心一', '自定义核心二', '自定义核心三']);
  });
  it('moves a setting entry to the end of its group when dropping on the group area', async () => {
    const storageKey = 'workbench-drag-setting-entry-to-group-end-test';
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'core-one',
          tab: '大纲',
          title: '自定义核心一',
          content: JSON.stringify({ type: '核心设定', body: '用户已有作品定位。' }),
          updatedAt: '2026/6/18 01:00:00',
        },
        {
          id: 'core-two',
          tab: '大纲',
          title: '自定义核心二',
          content: JSON.stringify({ type: '核心设定', body: '用户已有主角初始处境。' }),
          updatedAt: '2026/6/18 01:01:00',
        },
        {
          id: 'core-three',
          tab: '大纲',
          title: '自定义核心三',
          content: JSON.stringify({ type: '核心设定', body: '用户已有核心爽点。' }),
          updatedAt: '2026/6/18 01:02:00',
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

    ensureLibraryGroupExpanded('核心设定3');
    const source = screen.getByText('自定义核心一').closest('button');
    const targetGroup = screen.getByRole('button', { name: '核心设定3' });
    expect(source).toBeTruthy();
    const dataTransfer = {
      data: {} as Record<string, string>,
      effectAllowed: '',
      dropEffect: '',
      setData(type: string, value: string) {
        this.data[type] = value;
      },
      getData(type: string) {
        return this.data[type] ?? '';
      },
    };

    fireEvent.dragStart(source as HTMLElement, { dataTransfer });
    fireEvent.dragOver(targetGroup, { dataTransfer });
    fireEvent.drop(targetGroup, { dataTransfer });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心二', '自定义核心三', '自定义核心一']);
  });
  it('splits world view preview into era background, world pattern, and social order fields', async () => {
    const storageKey = 'workbench-world-view-structured-preview-test';
    const structuredSettingsSource = await readWorkbenchStructuredSettingsSource();
    const worldViewSetStart = structuredSettingsSource.indexOf("id: 'work-core-world-view'");
    const worldViewSetEnd = structuredSettingsSource.indexOf("id: 'work-core-cheat-advantage'", worldViewSetStart);
    const worldViewSetSource = structuredSettingsSource.slice(worldViewSetStart, worldViewSetEnd);
    localStorage.setItem(`${storageKey}_work_setting_starter_version`, TEST_WORK_SETTING_STARTER_VERSION);
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'world-view',
          tab: '大纲',
          title: '世界观',
          content: JSON.stringify({ type: '核心设定', body: '' }),
          updatedAt: '2026/6/18 12:00:00',
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

    ensureLibraryGroupExpanded('核心设定1');

    expect(screen.getByDisplayValue('世界观')).toBeInTheDocument();
    expect(worldViewSetSource).toContainSource("gridColumnsClassName: 'grid-cols-2'");
    expect(worldViewSetSource).not.toContainSource("gridColumnsClassName: 'grid-cols-3'");
    expect(screen.getByLabelText('时代背景')).toBeInTheDocument();
    expect(screen.getByLabelText('世界格局')).toBeInTheDocument();
    expect(screen.getByLabelText('社会秩序')).toBeInTheDocument();
    expect(screen.queryByText('设定预览')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('时代背景'), { target: { value: '诸国割据后的灵气复苏时代。' } });
    fireEvent.change(screen.getByLabelText('世界格局'), { target: { value: '宗门、王朝与商会三方争夺新矿脉。' } });
    fireEvent.change(screen.getByLabelText('社会秩序'), {
      target: { value: '凡人依附城邦，修士受宗门律令和资源契约约束。' },
    });

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const worldViewEntry = storedEntries.find((entry: { title: string }) => entry.title === '世界观');
    const body = JSON.parse(worldViewEntry.content).body;
    expect(body).toContainSource('【时代背景】：\n诸国割据后的灵气复苏时代。');
    expect(body).toContainSource('【世界格局】：\n宗门、王朝与商会三方争夺新矿脉。');
    expect(body).toContainSource('【社会秩序】：\n凡人依附城邦，修士受宗门律令和资源契约约束。');
  });
});
