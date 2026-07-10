import { useEffect, type MutableRefObject } from 'react';

import { BRAINSTORM_TAB, ROLE_TAB, SETTING_TAB } from './workbenchLibraryTabs';

export type WorkbenchLibraryAiLogScope = 'library' | 'outline';

export function getWorkbenchLibraryAiLogScope(activeTab: string): WorkbenchLibraryAiLogScope {
  return activeTab === SETTING_TAB || activeTab === ROLE_TAB || activeTab === BRAINSTORM_TAB ? 'library' : 'outline';
}

interface WorkbenchLibraryAiLogTriggerOptions {
  activeTab: string;
  openLogSignal: number;
  lastOpenLogSignalRef: MutableRefObject<number>;
  onRegisterHeaderLog?: (handler: (() => void) | null) => void;
  openLibraryAiLog: (scope: WorkbenchLibraryAiLogScope) => void;
}

export function useWorkbenchLibraryAiLogTriggers({
  activeTab,
  openLogSignal,
  lastOpenLogSignalRef,
  onRegisterHeaderLog,
  openLibraryAiLog,
}: WorkbenchLibraryAiLogTriggerOptions) {
  useEffect(() => {
    if (openLogSignal <= 0 || openLogSignal === lastOpenLogSignalRef.current) return;
    lastOpenLogSignalRef.current = openLogSignal;
    openLibraryAiLog(getWorkbenchLibraryAiLogScope(activeTab));
  }, [activeTab, lastOpenLogSignalRef, openLibraryAiLog, openLogSignal]);

  useEffect(() => {
    if (!onRegisterHeaderLog) return;
    const scope = getWorkbenchLibraryAiLogScope(activeTab);
    onRegisterHeaderLog(() => openLibraryAiLog(scope));
    return () => onRegisterHeaderLog(null);
  }, [activeTab, onRegisterHeaderLog, openLibraryAiLog]);
}
