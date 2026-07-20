import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkbenchLibraryPanel } from './WorkbenchLibraryPanel';
import {
  TEST_WORK_SETTING_STARTER_VERSION,
  ensureLibraryGroupExpanded,
  readWorkbenchLibraryPanelConstantsSource,
  readWorkbenchLibrarySidebarSource,
} from './WorkbenchLibraryPanel.testUtils';
describe('WorkbenchLibraryPanel pointer drag behavior', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('does not send the first setting entry to the group end before the pointer reaches another row', () => {
    vi.useFakeTimers();
    const storageKey = 'workbench-setting-entry-pointer-sort-group-end-guard-test';
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

    const groupButton = ensureLibraryGroupExpanded('核心设定3');
    const groupRoot = groupButton.closest('[data-library-group-type]');
    const source = screen.getByText('自定义核心一').closest('button');
    const secondRow = screen.getByText('自定义核心二').closest('button');
    const thirdRow = screen.getByText('自定义核心三').closest('button');
    expect(groupRoot).toBeTruthy();
    expect(source).toBeTruthy();
    expect(secondRow).toBeTruthy();
    expect(thirdRow).toBeTruthy();

    const makeRect = (top: number, bottom: number) =>
      ({
        x: 0,
        y: top,
        top,
        bottom,
        left: 0,
        right: 260,
        width: 260,
        height: bottom - top,
        toJSON: () => ({}),
      }) as DOMRect;
    const sourceRect = vi.spyOn(source as HTMLElement, 'getBoundingClientRect').mockReturnValue(makeRect(10, 34));
    const secondRect = vi.spyOn(secondRow as HTMLElement, 'getBoundingClientRect').mockReturnValue(makeRect(38, 62));
    const thirdRect = vi.spyOn(thirdRow as HTMLElement, 'getBoundingClientRect').mockReturnValue(makeRect(66, 90));
    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => groupRoot,
    });

    try {
      fireEvent.pointerDown(source as HTMLElement, { button: 0, pointerId: 15, clientX: 10, clientY: 10 });
      vi.advanceTimersByTime(180);
      fireEvent.pointerMove(window, { pointerId: 15, clientX: 10, clientY: 35 });
      fireEvent.pointerUp(window, { pointerId: 15, clientX: 10, clientY: 35 });
    } finally {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: originalElementFromPoint,
      });
      sourceRect.mockRestore();
      secondRect.mockRestore();
      thirdRect.mockRestore();
      vi.useRealTimers();
    }

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心一', '自定义核心二', '自定义核心三']);
  });
  it('shows the grabbing cursor only after a setting entry enters drag mode', async () => {
    const sidebarSource = await readWorkbenchLibrarySidebarSource();
    const constantsSource = await readWorkbenchLibraryPanelConstantsSource();
    const entryListStart = sidebarSource.indexOf('previewEntries.map((entry, previewIndex) => {');
    const entryListEnd = sidebarSource.indexOf('</button>', entryListStart);
    const entryListSource = sidebarSource.slice(entryListStart, entryListEnd);

    expect(entryListStart).toBeGreaterThan(-1);
    expect(entryListEnd).toBeGreaterThan(entryListStart);
    expect(constantsSource).toContainSource('cursor-default select-none');
    expect(entryListSource).toContainSource("draggingLibraryEntry?.entryId === entry.id ? 'cursor-grabbing");
    expect(entryListSource).not.toContainSource('cursor-grab select-none');
    expect(entryListSource).not.toContainSource('active:cursor-grabbing');
  });
});
