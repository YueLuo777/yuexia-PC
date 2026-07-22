import { useRef } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useWorkbenchLibraryAiLogTriggers, type WorkbenchLibraryAiLogScope } from './workbenchLibraryAiLogTriggers';
import { WorkbenchLibraryVisibilityProvider } from './workbenchLibraryVisibility';

type OpenLog = (scope: WorkbenchLibraryAiLogScope, isOpen?: boolean) => void;

function TriggerHarness({ openLibraryAiLog, signal }: { openLibraryAiLog: OpenLog; signal: number }) {
  const lastOpenLogSignalRef = useRef(0);
  useWorkbenchLibraryAiLogTriggers({
    activeTab: '大纲',
    openLogSignal: signal,
    lastOpenLogSignalRef,
    openLibraryAiLog,
  });
  return null;
}

function TestTree({
  isActive,
  activePageKey,
  openLibraryAiLog,
  signal = 0,
}: {
  isActive: boolean;
  activePageKey: string;
  openLibraryAiLog: OpenLog;
  signal?: number;
}) {
  return (
    <WorkbenchLibraryVisibilityProvider isActive={isActive} activePageKey={activePageKey}>
      <TriggerHarness openLibraryAiLog={openLibraryAiLog} signal={signal} />
    </WorkbenchLibraryVisibilityProvider>
  );
}

describe('workbench library AI log visibility', () => {
  it('closes a portal log when the active workbench page changes', () => {
    const openLibraryAiLog = vi.fn<OpenLog>();
    const { rerender } = render(
      <TestTree isActive activePageKey="outline" openLibraryAiLog={openLibraryAiLog} />,
    );

    expect(openLibraryAiLog).not.toHaveBeenCalled();
    rerender(<TestTree isActive activePageKey="chapterOutline" openLibraryAiLog={openLibraryAiLog} />);

    expect(openLibraryAiLog).toHaveBeenCalledWith('library', false);
  });

  it('closes a portal log when its cached panel becomes hidden', () => {
    const openLibraryAiLog = vi.fn<OpenLog>();
    const { rerender } = render(
      <TestTree isActive activePageKey="outline" openLibraryAiLog={openLibraryAiLog} />,
    );

    rerender(<TestTree isActive={false} activePageKey="chapterOutline" openLibraryAiLog={openLibraryAiLog} />);

    expect(openLibraryAiLog).toHaveBeenCalledWith('library', false);
    expect(openLibraryAiLog.mock.calls.every(([, isOpen]) => isOpen === false)).toBe(true);
  });

  it('does not replay a log signal received while the cached panel was hidden', () => {
    const openLibraryAiLog = vi.fn<OpenLog>();
    const { rerender } = render(
      <TestTree isActive={false} activePageKey="writing" openLibraryAiLog={openLibraryAiLog} signal={0} />,
    );

    rerender(<TestTree isActive={false} activePageKey="writing" openLibraryAiLog={openLibraryAiLog} signal={1} />);
    rerender(<TestTree isActive activePageKey="outline" openLibraryAiLog={openLibraryAiLog} signal={1} />);

    expect(openLibraryAiLog.mock.calls.every(([, isOpen]) => isOpen === false)).toBe(true);

    rerender(<TestTree isActive activePageKey="outline" openLibraryAiLog={openLibraryAiLog} signal={2} />);
    expect(openLibraryAiLog).toHaveBeenLastCalledWith('library');
  });
});
