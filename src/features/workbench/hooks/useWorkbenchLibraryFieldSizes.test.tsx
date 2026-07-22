import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WorkbenchLibraryVisibilityProvider } from '../components/workbenchLibraryVisibility';
import { useWorkbenchLibraryFieldSizes } from './useWorkbenchLibraryFieldSizes';

function FieldSizeState({ signal }: { signal: number }) {
  const { isFieldSizeSettingsOpen } = useWorkbenchLibraryFieldSizes({
    activeTab: '大纲',
    fieldSizeOpenSignal: signal,
    showInlineFieldSizeButton: false,
  });
  return <div>{isFieldSizeSettingsOpen ? '尺寸弹窗已打开' : '尺寸弹窗已关闭'}</div>;
}

function Harness({ isActive, signal }: { isActive: boolean; signal: number }) {
  return (
    <WorkbenchLibraryVisibilityProvider isActive={isActive} activePageKey={isActive ? 'outline' : 'writing'}>
      <FieldSizeState signal={signal} />
    </WorkbenchLibraryVisibilityProvider>
  );
}

describe('useWorkbenchLibraryFieldSizes', () => {
  it('consumes hidden-page signals without replaying them when the page becomes active', () => {
    const { rerender } = render(<Harness isActive={false} signal={0} />);

    rerender(<Harness isActive={false} signal={1} />);
    expect(screen.getByText('尺寸弹窗已关闭')).toBeInTheDocument();

    rerender(<Harness isActive signal={1} />);
    expect(screen.getByText('尺寸弹窗已关闭')).toBeInTheDocument();

    rerender(<Harness isActive signal={2} />);
    expect(screen.getByText('尺寸弹窗已打开')).toBeInTheDocument();

    rerender(<Harness isActive={false} signal={2} />);
    expect(screen.getByText('尺寸弹窗已关闭')).toBeInTheDocument();

    rerender(<Harness isActive signal={2} />);
    expect(screen.getByText('尺寸弹窗已关闭')).toBeInTheDocument();
  });
});
