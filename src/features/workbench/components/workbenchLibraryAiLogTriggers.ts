import { useEffect, useRef, type MutableRefObject } from 'react';

import { BRAINSTORM_TAB, ROLE_TAB, SETTING_TAB } from './workbenchLibraryTabs';
import { useWorkbenchLibraryVisibility } from './workbenchLibraryVisibility';

export type WorkbenchLibraryAiLogScope = 'library' | 'outline';

export function getWorkbenchLibraryAiLogScope(activeTab: string): WorkbenchLibraryAiLogScope {
  return activeTab === SETTING_TAB || activeTab === ROLE_TAB || activeTab === BRAINSTORM_TAB ? 'library' : 'outline';
}

interface WorkbenchLibraryAiLogTriggerOptions {
  activeTab: string;
  openLogSignal: number;
  lastOpenLogSignalRef: MutableRefObject<number>;
  onRegisterHeaderLog?: (handler: (() => void) | null) => void;
  openLibraryAiLog: (scope: WorkbenchLibraryAiLogScope, isOpen?: boolean) => void;
}

export function useWorkbenchLibraryAiLogTriggers({
  activeTab,
  openLogSignal,
  lastOpenLogSignalRef,
  onRegisterHeaderLog,
  openLibraryAiLog,
}: WorkbenchLibraryAiLogTriggerOptions) {
  const { isActive, activePageKey } = useWorkbenchLibraryVisibility();
  const wasActiveRef = useRef(isActive);

  useEffect(() => {
    if (!isActive) openLibraryAiLog('library', false);
    return () => openLibraryAiLog('library', false);
  }, [activePageKey, isActive, openLibraryAiLog]);

  useEffect(() => {
    const wasActive = wasActiveRef.current;
    wasActiveRef.current = isActive;
    if (!isActive) {
      lastOpenLogSignalRef.current = openLogSignal;
      return;
    }
    if (!wasActive) {
      lastOpenLogSignalRef.current = openLogSignal;
      return;
    }
    if (openLogSignal <= 0 || openLogSignal === lastOpenLogSignalRef.current) return;
    lastOpenLogSignalRef.current = openLogSignal;
    openLibraryAiLog(getWorkbenchLibraryAiLogScope(activeTab));
  }, [activeTab, isActive, lastOpenLogSignalRef, openLibraryAiLog, openLogSignal]);

  useEffect(() => {
    if (!onRegisterHeaderLog) return;
    const scope = getWorkbenchLibraryAiLogScope(activeTab);
    onRegisterHeaderLog(() => openLibraryAiLog(scope));
    return () => onRegisterHeaderLog(null);
  }, [activeTab, onRegisterHeaderLog, openLibraryAiLog]);
}
