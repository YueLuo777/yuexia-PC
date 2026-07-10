import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useDraggableModal } from './useDraggableModal';

function InlineDefaultGeometryHarness() {
  useDraggableModal('inline-default-geometry-test', { x: 0, y: 0, width: 640, height: 480 });
  return <div>modal hook ready</div>;
}

describe('useDraggableModal', () => {
  it('does not loop when callers pass inline default geometry', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<InlineDefaultGeometryHarness />);

    expect(consoleError).not.toHaveBeenCalledWith(expect.stringContaining('Maximum update depth exceeded'));

    consoleError.mockRestore();
  });
});
