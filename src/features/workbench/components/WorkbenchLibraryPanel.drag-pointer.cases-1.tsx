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
  it('uses pointer sorting instead of native draggable attributes on setting entries', () => {
    const storageKey = 'workbench-setting-entry-pointer-sort-only-test';
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

    ensureLibraryGroupExpanded('核心设定2');

    expect(screen.getByText('自定义核心一').closest('button')).not.toHaveAttribute('draggable');
    expect(screen.getByText('自定义核心二').closest('button')).not.toHaveAttribute('draggable');
  });
  it('persists setting order after a real pointer move and pointer up', () => {
    vi.useFakeTimers();
    const storageKey = 'workbench-setting-entry-pointer-sort-commit-test';
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

    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => target,
    });

    try {
      fireEvent.pointerDown(source as HTMLElement, { button: 0, pointerId: 11, clientX: 10, clientY: 10 });
      vi.advanceTimersByTime(180);
      fireEvent.pointerMove(window, { pointerId: 11, clientX: 10, clientY: 42 });
      fireEvent.pointerUp(window, { pointerId: 11, clientX: 10, clientY: 42 });
    } finally {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: originalElementFromPoint,
      });
      vi.useRealTimers();
    }

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);
  });
  it('does not start setting pointer sorting from a small accidental movement', () => {
    const storageKey = 'workbench-setting-entry-pointer-sort-threshold-test';
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

    ensureLibraryGroupExpanded('核心设定2');
    const source = screen.getByText('自定义核心一').closest('button');
    const target = screen.getByText('自定义核心二').closest('button');
    expect(source).toBeTruthy();
    expect(target).toBeTruthy();

    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => target,
    });

    try {
      fireEvent.pointerDown(source as HTMLElement, { button: 0, pointerId: 12, clientX: 10, clientY: 10 });
      fireEvent.pointerMove(window, { pointerId: 12, clientX: 10, clientY: 22 });
      fireEvent.pointerUp(window, { pointerId: 12, clientX: 10, clientY: 22 });
    } finally {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: originalElementFromPoint,
      });
    }

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心一', '自定义核心二']);
  });
  it('does not start setting pointer sorting before the intentional hold delay', () => {
    vi.useFakeTimers();
    const storageKey = 'workbench-setting-entry-pointer-sort-hold-delay-test';
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

    ensureLibraryGroupExpanded('核心设定2');
    const source = screen.getByText('自定义核心一').closest('button');
    const target = screen.getByText('自定义核心二').closest('button');
    expect(source).toBeTruthy();
    expect(target).toBeTruthy();

    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => target,
    });

    try {
      fireEvent.pointerDown(source as HTMLElement, { button: 0, pointerId: 13, clientX: 10, clientY: 10 });
      fireEvent.pointerMove(window, { pointerId: 13, clientX: 10, clientY: 48 });
      fireEvent.pointerUp(window, { pointerId: 13, clientX: 10, clientY: 48 });
    } finally {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: originalElementFromPoint,
      });
      vi.useRealTimers();
    }

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心一', '自定义核心二']);
  });
  it('keeps the first setting entry from chaining into the third row on the same pointer position', () => {
    vi.useFakeTimers();
    const storageKey = 'workbench-setting-entry-pointer-sort-retarget-guard-test';
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
    const secondRow = screen.getByText('自定义核心二').closest('button');
    const thirdRow = screen.getByText('自定义核心三').closest('button');
    expect(source).toBeTruthy();
    expect(secondRow).toBeTruthy();
    expect(thirdRow).toBeTruthy();

    let hoverTarget: Element | null = secondRow;
    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => hoverTarget,
    });

    try {
      fireEvent.pointerDown(source as HTMLElement, { button: 0, pointerId: 14, clientX: 10, clientY: 10 });
      vi.advanceTimersByTime(180);
      fireEvent.pointerMove(window, { pointerId: 14, clientX: 10, clientY: 42 });
      hoverTarget = thirdRow;
      fireEvent.pointerMove(window, { pointerId: 14, clientX: 10, clientY: 42 });
      fireEvent.pointerUp(window, { pointerId: 14, clientX: 10, clientY: 42 });
    } finally {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: originalElementFromPoint,
      });
      vi.useRealTimers();
    }

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);
  });
  it('does not retarget a dragged setting entry from the second row to the third row on a modest movement', () => {
    vi.useFakeTimers();
    const storageKey = 'workbench-setting-entry-pointer-sort-modest-retarget-test';
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
    const secondRow = screen.getByText('自定义核心二').closest('button');
    const thirdRow = screen.getByText('自定义核心三').closest('button');
    expect(source).toBeTruthy();
    expect(secondRow).toBeTruthy();
    expect(thirdRow).toBeTruthy();

    let hoverTarget: Element | null = secondRow;
    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => hoverTarget,
    });

    try {
      fireEvent.pointerDown(source as HTMLElement, { button: 0, pointerId: 18, clientX: 10, clientY: 10 });
      vi.advanceTimersByTime(180);
      fireEvent.pointerMove(window, { pointerId: 18, clientX: 10, clientY: 42 });
      hoverTarget = thirdRow;
      fireEvent.pointerMove(window, { pointerId: 18, clientX: 10, clientY: 64 });
      fireEvent.pointerUp(window, { pointerId: 18, clientX: 10, clientY: 64 });
    } finally {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: originalElementFromPoint,
      });
      vi.useRealTimers();
    }

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);
  });
  it('keeps a dragged setting entry on its preview row when the pointer is over its own ghost', () => {
    vi.useFakeTimers();
    const storageKey = 'workbench-setting-entry-pointer-sort-ghost-row-test';
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
    const secondRow = screen.getByText('自定义核心二').closest('button');
    expect(source).toBeTruthy();
    expect(secondRow).toBeTruthy();

    let hoverTarget: Element | null = secondRow;
    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => hoverTarget,
    });

    try {
      fireEvent.pointerDown(source as HTMLElement, { button: 0, pointerId: 19, clientX: 10, clientY: 10 });
      vi.advanceTimersByTime(180);
      fireEvent.pointerMove(window, { pointerId: 19, clientX: 10, clientY: 42 });
      hoverTarget = source;
      fireEvent.pointerMove(window, { pointerId: 19, clientX: 10, clientY: 74 });
      fireEvent.pointerUp(window, { pointerId: 19, clientX: 10, clientY: 74 });
    } finally {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: originalElementFromPoint,
      });
      vi.useRealTimers();
    }

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);
  });
  it('does not return a dragged setting entry to its original row from a tiny reverse movement', () => {
    vi.useFakeTimers();
    const storageKey = 'workbench-setting-entry-pointer-sort-return-to-origin-test';
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
    const secondRow = screen.getByText('自定义核心二').closest('button');
    expect(source).toBeTruthy();
    expect(secondRow).toBeTruthy();

    let hoverTarget: Element | null = secondRow;
    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => hoverTarget,
    });

    try {
      fireEvent.pointerDown(source as HTMLElement, { button: 0, pointerId: 16, clientX: 10, clientY: 10 });
      vi.advanceTimersByTime(180);
      fireEvent.pointerMove(window, { pointerId: 16, clientX: 10, clientY: 42 });
      hoverTarget = source;
      fireEvent.pointerMove(window, { pointerId: 16, clientX: 10, clientY: 30 });
      fireEvent.pointerUp(window, { pointerId: 16, clientX: 10, clientY: 30 });
    } finally {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: originalElementFromPoint,
      });
      vi.useRealTimers();
    }

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心二', '自定义核心一', '自定义核心三']);
  });
  it('lets a dragged setting entry return to its original row after a deliberate reverse movement', () => {
    vi.useFakeTimers();
    const storageKey = 'workbench-setting-entry-pointer-sort-deliberate-return-test';
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
    const secondRow = screen.getByText('自定义核心二').closest('button');
    expect(source).toBeTruthy();
    expect(secondRow).toBeTruthy();

    let hoverTarget: Element | null = secondRow;
    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => hoverTarget,
    });

    try {
      fireEvent.pointerDown(source as HTMLElement, { button: 0, pointerId: 17, clientX: 10, clientY: 10 });
      vi.advanceTimersByTime(180);
      fireEvent.pointerMove(window, { pointerId: 17, clientX: 10, clientY: 42 });
      hoverTarget = secondRow;
      fireEvent.pointerMove(window, { pointerId: 17, clientX: 10, clientY: 12 });
      fireEvent.pointerUp(window, { pointerId: 17, clientX: 10, clientY: 12 });
    } finally {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: originalElementFromPoint,
      });
      vi.useRealTimers();
    }

    const storedEntries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    const coreTitles = storedEntries
      .filter((entry: { content: string }) => JSON.parse(entry.content).type === '核心设定')
      .map((entry: { title: string }) => entry.title);
    expect(coreTitles).toEqual(['自定义核心一', '自定义核心二', '自定义核心三']);
  });
});
