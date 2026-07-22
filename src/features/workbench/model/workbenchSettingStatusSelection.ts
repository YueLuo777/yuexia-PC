import { useEffect, useSyncExternalStore } from 'react';

export const OPEN_WORKBENCH_STATUS_FLOW_EVENT = 'xinyuexia_open_workbench_status_flow';

export type WorkbenchSettingStatusSelection = {
  entryId: string;
  fieldKey: string | null;
  fieldLabel?: string;
};

let currentSelection: WorkbenchSettingStatusSelection | null = null;
const listeners = new Set<() => void>();

export function selectWorkbenchSettingStatusField(selection: WorkbenchSettingStatusSelection) {
  currentSelection = selection;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentSelection;
}

export function useWorkbenchSettingStatusSelection() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useWorkbenchStatusFlowNavigation(setActiveFlow: (flow: 'status') => void) {
  useEffect(() => {
    const openStatusFlow = () => setActiveFlow('status');
    window.addEventListener(OPEN_WORKBENCH_STATUS_FLOW_EVENT, openStatusFlow);
    return () => window.removeEventListener(OPEN_WORKBENCH_STATUS_FLOW_EVENT, openStatusFlow);
  }, [setActiveFlow]);
}
