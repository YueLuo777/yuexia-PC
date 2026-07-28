import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDraggableModal } from './useDraggableModal';

function InlineDefaultGeometryHarness() {
  useDraggableModal('inline-default-geometry-test', { x: 0, y: 0, width: 640, height: 480 });
  return <div>modal hook ready</div>;
}

function DragHarness() {
  const draggable = useDraggableModal('two-axis-drag-test', { x: 0, y: 0, width: 640, height: 480 });
  return (
    <section data-testid="dialog" data-draggable-managed="true" style={draggable.style}>
      <header data-testid="drag-handle" {...draggable.dragHandleProps}>Drag</header>
    </section>
  );
}

function CompactDragHarness() {
  const draggable = useDraggableModal('compact-drag-test');
  return (
    <section data-testid="compact-dialog" data-draggable-managed="true" style={draggable.style}>
      <header data-testid="compact-drag-handle" {...draggable.dragHandleProps}>Drag</header>
    </section>
  );
}

function ResizeHarness() {
  const draggable = useDraggableModal('smooth-resize-test', { x: 0, y: 0, width: 900, height: 700 });
  return (
    <section data-testid="resize-dialog" data-draggable-managed="true" style={draggable.style}>
      <button data-testid="resize-handle" {...draggable.resizeHandleProps}>Resize</button>
    </section>
  );
}

describe('useDraggableModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    document.documentElement.style.removeProperty('--xinyuexia-effective-scale');
  });

  it('does not loop when callers pass inline default geometry', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<InlineDefaultGeometryHarness />);

    expect(consoleError).not.toHaveBeenCalledWith(expect.stringContaining('Maximum update depth exceeded'));

    consoleError.mockRestore();
  });

  it('drags a body-portaled centered modal on both axes without applying the scaled app root factor', () => {
    document.documentElement.style.setProperty('--xinyuexia-effective-scale', '1.25');
    render(<DragHarness />);
    const dialog = screen.getByTestId('dialog');
    const handle = screen.getByTestId('drag-handle');
    dialog.getBoundingClientRect = vi.fn(() => ({
      x: 120,
      y: 80,
      left: 120,
      top: 80,
      right: 760,
      bottom: 560,
      width: 640,
      height: 480,
      toJSON: () => ({}),
    }));

    fireEvent.pointerDown(handle, { button: 0, pointerId: 9, clientX: 200, clientY: 100 });
    fireEvent.pointerMove(handle, { pointerId: 9, clientX: 250, clientY: 180 });

    expect(dialog.style.position).toBe('fixed');
    expect(dialog.style.left).toBe('170px');
    expect(dialog.style.top).toBe('160px');
    expect(dialog.style.transform).toBe('none');
  });

  it('keeps a compact auto-sized modal at its rendered height while moving it', () => {
    render(<CompactDragHarness />);
    const dialog = screen.getByTestId('compact-dialog');
    const handle = screen.getByTestId('compact-drag-handle');
    dialog.getBoundingClientRect = vi.fn(() => ({
      x: 120,
      y: 80,
      left: 120,
      top: 80,
      right: 580,
      bottom: 300,
      width: 460,
      height: 220,
      toJSON: () => ({}),
    }));

    fireEvent.pointerDown(handle, { button: 0, pointerId: 10, clientX: 200, clientY: 100 });
    fireEvent.pointerMove(handle, { pointerId: 10, clientX: 240, clientY: 140 });

    expect(dialog.style.width).toBe('460px');
    expect(dialog.style.height).toBe('220px');
    expect(dialog.style.left).toBe('160px');
    expect(dialog.style.top).toBe('120px');
  });

  it('resizes from the rendered size without a large first-move jump', () => {
    render(<ResizeHarness />);
    const dialog = screen.getByTestId('resize-dialog');
    const handle = screen.getByTestId('resize-handle');
    dialog.getBoundingClientRect = vi.fn(() => ({
      x: 20,
      y: 20,
      left: 20,
      top: 20,
      right: 920,
      bottom: 720,
      width: 900,
      height: 700,
      toJSON: () => ({}),
    }));

    fireEvent.pointerDown(handle, { button: 0, pointerId: 12, clientX: 900, clientY: 700 });
    fireEvent.pointerMove(window, { pointerId: 12, clientX: 890, clientY: 690 });

    expect(dialog.style.width).toBe('890px');
    expect(dialog.style.height).toBe('690px');
  });
});
