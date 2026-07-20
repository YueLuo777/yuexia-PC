import { act, fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { NavSettingsModal } from './NavSettingsModal';
import type { NavGroupConfig } from './navConfig';

const config: NavGroupConfig[] = [
  {
    title: '导航',
    iconName: 'LayoutGrid',
    dividerAfterItemTo: null,
    dividerAfterItemTos: [],
    items: [
      { iconName: 'BookOpen', label: 'A', to: '/a' },
      { iconName: 'BookOpen', label: 'B', to: '/b' },
      { iconName: 'BookOpen', label: 'C', to: '/c' },
    ],
  },
];

afterEach(() => {
  vi.useRealTimers();
});

describe('NavSettingsModal pointer sorting', () => {
  it('keeps the list stable during movement and saves the selected order once on release', () => {
    vi.useFakeTimers();
    const onSave = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <NavSettingsModal
          isOpen
          variant="embedded"
          config={config}
          onClose={vi.fn()}
          onSave={onSave}
          onReset={vi.fn()}
        />
      </MemoryRouter>,
    );
    const rows = Array.from(container.querySelectorAll<HTMLElement>('[data-nav-item-index]'));
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: vi.fn(() => rows[2]),
    });

    fireEvent.pointerDown(rows[0], { button: 0, pointerId: 7, clientX: 10, clientY: 10 });
    act(() => vi.advanceTimersByTime(220));
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 10, clientY: 80 });
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 10, clientY: 82 });

    expect(Array.from(container.querySelectorAll('[data-nav-item-index]')).map((row) => row.textContent)).toEqual([
      expect.stringContaining('A'),
      expect.stringContaining('B'),
      expect.stringContaining('C'),
    ]);
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.pointerUp(window, { pointerId: 7, clientX: 10, clientY: 82 });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0][0][0].items.map((item: { to: string }) => item.to)).toEqual(['/b', '/c', '/a']);
  });

  it('does not sort on a short click or tiny pointer movement', () => {
    vi.useFakeTimers();
    const onSave = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <NavSettingsModal
          isOpen
          variant="embedded"
          config={config}
          onClose={vi.fn()}
          onSave={onSave}
          onReset={vi.fn()}
        />
      </MemoryRouter>,
    );
    const row = container.querySelector<HTMLElement>('[data-nav-item-index="0"]')!;

    fireEvent.pointerDown(row, { button: 0, pointerId: 8, clientX: 10, clientY: 10 });
    act(() => vi.advanceTimersByTime(100));
    fireEvent.pointerMove(window, { pointerId: 8, clientX: 14, clientY: 14 });
    fireEvent.pointerUp(window, { pointerId: 8, clientX: 14, clientY: 14 });

    expect(onSave).not.toHaveBeenCalled();
  });
});
