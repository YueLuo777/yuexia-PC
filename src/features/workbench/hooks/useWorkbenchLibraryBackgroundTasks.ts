import { useEffect, type Dispatch, type SetStateAction } from 'react';

import { getBackgroundAiTask, subscribeBackgroundAiTasks } from '@/shared/ai/backgroundAiTasks';

import {
  getActiveBrainstormAiSessionId,
  normalizeBrainstormAiSessions,
  type BrainstormAiSession,
} from '../components/workbenchBrainstormState';
import type { LibraryTabConfig, LibraryTabConfigs } from '../components/workbenchLibraryDataState';
import {
  getBrainstormBackgroundTaskResult,
  getLibraryBackgroundTaskOutput,
} from '../components/workbenchLibraryAiText';
import { BRAINSTORM_TAB, DETAIL_OUTLINE_TAB, OUTLINE_LIBRARY_TAB } from '../components/workbenchLibraryTabs';
import { getTabConfigsStorageKey } from '../components/workbenchLibraryStorageState';

interface UseWorkbenchLibraryBackgroundTasksOptions {
  storageKey: string;
  activeTab: string;
  activeBrainstormAiSession?: BrainstormAiSession;
  tabConfigs: LibraryTabConfigs;
  setTabConfigs: Dispatch<SetStateAction<LibraryTabConfigs>>;
  setOutlinePreviewDraftState: Dispatch<SetStateAction<string>>;
  setIsLibraryAiLoading: Dispatch<SetStateAction<boolean>>;
}

export function useWorkbenchLibraryBackgroundTasks({
  storageKey,
  activeTab,
  activeBrainstormAiSession,
  tabConfigs,
  setTabConfigs,
  setOutlinePreviewDraftState,
  setIsLibraryAiLoading,
}: UseWorkbenchLibraryBackgroundTasksOptions) {
  useEffect(() => {
    const syncBackgroundTasks = () => {
      setTabConfigs((prev) => {
        let changed = false;
        const next: LibraryTabConfigs = { ...prev };
        Object.entries(prev).forEach(([tab, config]) => {
          let nextConfig = config;
          if (tab === BRAINSTORM_TAB) {
            const sessions = normalizeBrainstormAiSessions(config.aiSessions, config);
            let sessionsChanged = false;
            const nextSessions = sessions.map((session) => {
              if (!session.backgroundAiTaskId) return session;
              const task = getBackgroundAiTask(session.backgroundAiTaskId);
              if (!task || task.meta?.target !== 'workbenchLibraryAi' || task.meta.storageKey !== storageKey) {
                return session;
              }
              const output = getLibraryBackgroundTaskOutput(task);
              const result = getBrainstormBackgroundTaskResult(task);
              if (session.output === output && session.result === result) return session;
              sessionsChanged = true;
              return { ...session, output, result };
            });
            if (sessionsChanged) {
              const activeId = getActiveBrainstormAiSessionId(config.activeAiSessionId, nextSessions);
              const activeSession = nextSessions.find((session) => session.id === activeId) ?? nextSessions[0];
              nextConfig = {
                ...nextConfig,
                aiSessions: nextSessions,
                activeAiSessionId: activeId,
                aiInput: activeSession?.input ?? '',
                aiOutput: activeSession?.output ?? '',
                aiResult: activeSession?.result ?? '',
              };
            }
          } else if (nextConfig.libraryAiTaskId) {
            const task = getBackgroundAiTask(nextConfig.libraryAiTaskId);
            if (task && task.meta?.target === 'workbenchLibraryAi' && task.meta.storageKey === storageKey) {
              const output = getLibraryBackgroundTaskOutput(task);
              if (nextConfig.aiOutput !== output) nextConfig = { ...nextConfig, aiOutput: output };
            }
          }
          if (nextConfig !== config) {
            changed = true;
            next[tab] = nextConfig;
          }
        });
        if (changed) localStorage.setItem(getTabConfigsStorageKey(storageKey), JSON.stringify(next));
        return changed ? next : prev;
      });

      const activeConfig = tabConfigs[activeTab] ?? {};
      const activeBrainstormTaskId =
        activeTab === BRAINSTORM_TAB ? activeBrainstormAiSession?.backgroundAiTaskId : undefined;
      const activeLibraryTask = activeBrainstormTaskId
        ? getBackgroundAiTask(activeBrainstormTaskId)
        : activeConfig.libraryAiTaskId
          ? getBackgroundAiTask(activeConfig.libraryAiTaskId)
          : null;
      const activeOutlineTask = activeConfig.outlineAiTaskId ? getBackgroundAiTask(activeConfig.outlineAiTaskId) : null;
      if (
        activeOutlineTask &&
        activeOutlineTask.meta?.target === 'workbenchOutlineAi' &&
        activeOutlineTask.meta.storageKey === storageKey
      ) {
        const output = getLibraryBackgroundTaskOutput(activeOutlineTask);
        setOutlinePreviewDraftState(output);
      }

      const relevantTask =
        activeTab === OUTLINE_LIBRARY_TAB || activeTab === DETAIL_OUTLINE_TAB
          ? activeOutlineTask
          : activeLibraryTask;
      setIsLibraryAiLoading(relevantTask?.status === 'running');
    };

    syncBackgroundTasks();
    return subscribeBackgroundAiTasks(syncBackgroundTasks);
  }, [
    activeBrainstormAiSession?.backgroundAiTaskId,
    activeTab,
    setIsLibraryAiLoading,
    setOutlinePreviewDraftState,
    setTabConfigs,
    storageKey,
    tabConfigs,
  ]);
}
