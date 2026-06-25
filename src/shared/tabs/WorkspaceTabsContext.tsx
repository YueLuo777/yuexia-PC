import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { WorkType } from '@/features/novels/model/novelTypes';

export interface WorkspaceTab {
  id: string;
  title: string;
  path: string;
  fixed?: boolean;
  workId?: number;
  workType?: WorkType;
}

interface OpenWorkTabInput {
  workId: number;
  workType: WorkType;
  title: string;
  path: string;
}

interface WorkspaceTabsContextValue {
  tabs: WorkspaceTab[];
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  openWorkTab: (input: OpenWorkTabInput) => WorkspaceTab;
  closeTab: (id: string) => void;
}

const STORAGE_KEY = 'xinyuexia_workspace_tabs_v1';
const ACTIVE_KEY = 'xinyuexia_workspace_active_tab_v1';
const STARTUP_RESET_KEY = 'xinyuexia_workspace_tabs_reset_this_session_v1';

export const HOME_TAB: WorkspaceTab = {
  id: 'home',
  title: '首页',
  path: '/novels',
  fixed: true,
};

function getWorkTabId(workType: WorkType, workId: number) {
  return `${workType}-${workId}`;
}

function normalizeTabs(value: unknown): WorkspaceTab[] {
  if (!Array.isArray(value)) return [HOME_TAB];

  const seen = new Set<string>();
  const tabs = [HOME_TAB];
  seen.add(HOME_TAB.id);

  value.forEach((tab) => {
    if (!tab || typeof tab !== 'object') return;
    const item = tab as Partial<WorkspaceTab>;
    if (!item.id || seen.has(item.id) || item.id === HOME_TAB.id) return;
    if (!item.title || !item.path) return;
    tabs.push({
      id: item.id,
      title: item.title,
      path: item.path,
      fixed: false,
      workId: item.workId,
      workType: item.workType,
    });
    seen.add(item.id);
  });

  return tabs;
}

function shouldResetTabsForSession() {
  try {
    if (sessionStorage.getItem(STARTUP_RESET_KEY) === '1') return false;
    sessionStorage.setItem(STARTUP_RESET_KEY, '1');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_KEY);
    return true;
  } catch {
    return false;
  }
}

function loadTabs() {
  if (shouldResetTabsForSession()) return [HOME_TAB];
  try {
    return normalizeTabs(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
  } catch {
    return [HOME_TAB];
  }
}

function loadActiveTabId(tabs: WorkspaceTab[]) {
  const saved = localStorage.getItem(ACTIVE_KEY);
  return tabs.some((tab) => tab.id === saved) ? saved! : HOME_TAB.id;
}

const WorkspaceTabsContext = createContext<WorkspaceTabsContextValue | null>(null);

export function WorkspaceTabsProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<WorkspaceTab[]>(loadTabs);
  const [activeTabId, setActiveTabIdState] = useState(() => loadActiveTabId(loadTabs()));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_KEY, activeTabId);
  }, [activeTabId]);

  const setActiveTabId = useCallback((id: string) => {
    setActiveTabIdState((current) => (current === id ? current : id));
  }, []);

  const openWorkTab = useCallback((input: OpenWorkTabInput) => {
    const nextTab: WorkspaceTab = {
      id: getWorkTabId(input.workType, input.workId),
      title: input.title,
      path: input.path,
      workId: input.workId,
      workType: input.workType,
    };

    setTabs((prev) => {
      const exists = prev.some((tab) => tab.id === nextTab.id);
      if (exists) {
        return prev.map((tab) => (tab.id === nextTab.id ? { ...tab, ...nextTab } : tab));
      }
      return [...prev, nextTab];
    });
    setActiveTabIdState(nextTab.id);
    return nextTab;
  }, []);

  const closeTab = useCallback((id: string) => {
    if (id === HOME_TAB.id) return;
    setTabs((prev) => prev.filter((tab) => tab.id !== id || tab.fixed));
    setActiveTabIdState((prev) => (prev === id ? HOME_TAB.id : prev));
  }, []);

  const value = useMemo<WorkspaceTabsContextValue>(() => ({
    tabs,
    activeTabId,
    setActiveTabId,
    openWorkTab,
    closeTab,
  }), [activeTabId, closeTab, openWorkTab, setActiveTabId, tabs]);

  return (
    <WorkspaceTabsContext.Provider value={value}>
      {children}
    </WorkspaceTabsContext.Provider>
  );
}

export function useWorkspaceTabs() {
  const context = useContext(WorkspaceTabsContext);
  if (!context) {
    throw new Error('useWorkspaceTabs must be used within WorkspaceTabsProvider');
  }
  return context;
}
