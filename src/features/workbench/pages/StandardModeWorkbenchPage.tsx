import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import { WorkbenchNoNovelState } from '@/features/workbench/components/workbenchPageSupport';
import {
  StandardModeWorkbenchNavigation,
  type StandardStageAction,
} from '@/features/workbench/components/StandardModeWorkbenchNavigation';
import { StandardModeSharedCreationPage } from '@/features/workbench/components/StandardModeSharedCreationPage';
import { StandardModeWorkDetailsPage } from '@/features/workbench/components/StandardModeWorkDetailsPage';
import { useWorkbenchData, readChapterContent } from '@/features/workbench/hooks/useWorkbenchData';
import {
  hasStandardModeSettingEntries,
  repairStandardModeGeneratedSettingEntries,
  replaceProfessionalSettingEntriesFromTemplate,
} from '@/features/workbench/model/standardModeDefaultSettingAdapter';
import { readStandardSettingTemplateState } from '@/features/workbench/model/standardModeSettingModel';
import { subscribeStandardSettingGenerationLock } from '@/features/workbench/model/standardModeSettingGenerationRuntime';
import { subscribeStandardModeSettingNavigationAction } from '@/features/workbench/model/standardModeSettingNavigationEvents';
import { buildStandardModeWorkbenchStats } from '@/features/workbench/model/standardModeWorkbenchStats';
import { readWorkbenchLibraryEntries } from '@/features/workbench/model/workbenchLibraryStorage';
import { StandardModeBrainstormPage } from '@/features/workbench/pages/StandardModeBrainstormPage';
import {
  StandardModeSettingPage,
  TemplateReplacementWarning,
} from '@/features/workbench/pages/StandardModeSettingPage';
import { getBackgroundAiTasksSnapshot, subscribeBackgroundAiTasks } from '@/shared/ai/backgroundAiTasks';
import { useWorkspaceTabs } from '@/shared/tabs/WorkspaceTabsContext';

export function StandardModeWorkbenchPage() {
  const [activeAction, setActiveAction] = useState<StandardStageAction>('writing');
  const [templateChangeWarningOpen, setTemplateChangeWarningOpen] = useState(false);
  const [settingGenerationLocked, setSettingGenerationLocked] = useState(false);
  const [, setSettingsMigrationRevision] = useState(0);
  const { tabs, activeTabId } = useWorkspaceTabs();
  const { currentNovel, currentNovelId, volumes, setCurrentNovel, updateCurrentNovelDetails } = useWorkbenchData();
  const reviewTasks = useSyncExternalStore(
    subscribeBackgroundAiTasks,
    getBackgroundAiTasksSnapshot,
    getBackgroundAiTasksSnapshot,
  );
  const settingsStorageKey = currentNovelId ? `xinyuexia_workbench_settings_${currentNovelId}` : '';
  const outlineStorageKey = currentNovelId ? `xinyuexia_workbench_outline_${currentNovelId}` : '';
  const templateState = currentNovel ? readStandardSettingTemplateState(String(currentNovel.id)) : null;

  useEffect(() => {
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    if (!activeTab?.workId || activeTab.workId === currentNovelId) return;
    setCurrentNovel(activeTab.workId);
  }, [activeTabId, currentNovelId, setCurrentNovel, tabs]);

  useEffect(() => {
    return subscribeStandardSettingGenerationLock(setSettingGenerationLocked);
  }, []);

  useEffect(() => {
    setActiveAction('writing');
    setTemplateChangeWarningOpen(false);
    setSettingGenerationLocked(false);
  }, [currentNovelId]);

  useEffect(
    () => subscribeStandardModeSettingNavigationAction((event) => {
      if (event.storageKey !== settingsStorageKey) return;
      if (event.action === 'change-template') {
        setTemplateChangeWarningOpen(true);
        return;
      }
      setSettingsMigrationRevision((revision) => revision + 1);
      setActiveAction('createSettings');
    }),
    [settingsStorageKey],
  );

  const stats = useMemo(() => {
    if (!currentNovel) return null;
    const outlineEntries = outlineStorageKey ? readWorkbenchLibraryEntries(outlineStorageKey) : [];
    return buildStandardModeWorkbenchStats({
      novelWordCount:
        currentNovel.wordCount ??
        volumes.flatMap((volume) => volume.chapters).reduce((total, chapter) => total + chapter.wordCount, 0),
      volumes,
      outlineEntries,
      reviewTasks,
      settingsStorageKey,
      settingTemplateState: templateState,
      readChapterContent: (chapterId) => readChapterContent(currentNovel.id, chapterId),
    });
  }, [currentNovel, outlineStorageKey, reviewTasks, settingsStorageKey, templateState, volumes]);
  const hasProfessionalSettings = currentNovel ? hasStandardModeSettingEntries(settingsStorageKey) : false;
  const needsProfessionalSettingMigration = Boolean(templateState && !hasProfessionalSettings);

  useEffect(() => {
    if (!templateState || !needsProfessionalSettingMigration) return;
    replaceProfessionalSettingEntriesFromTemplate(settingsStorageKey, templateState.structure);
    setSettingsMigrationRevision((revision) => revision + 1);
  }, [needsProfessionalSettingMigration, settingsStorageKey, templateState]);

  useEffect(() => {
    if (!currentNovel || needsProfessionalSettingMigration) return;
    if (repairStandardModeGeneratedSettingEntries(settingsStorageKey)) {
      setSettingsMigrationRevision((revision) => revision + 1);
    }
  }, [currentNovel, needsProfessionalSettingMigration, settingsStorageKey]);

  if (!currentNovel || !stats) return <WorkbenchNoNovelState />;

  const isBrainstormPage = activeAction === 'brainstormLibrary' || activeAction === 'generateBrainstorm';
  const hasSettings = Boolean(templateState) || hasProfessionalSettings;
  const isSettingSetupPage =
    activeAction === 'createSettings' ||
    activeAction === 'changeSettingTemplate' ||
    (activeAction === 'settingsList' && !hasSettings);
  const isSharedCreationPage =
    (activeAction === 'settingsList' && hasSettings && !needsProfessionalSettingMigration) ||
    activeAction === 'chapterOutline' ||
    activeAction === 'writing' ||
    activeAction === 'storyAudit' ||
    activeAction === 'statusUpdate' ||
    activeAction === 'summary';

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f5f5f7]" data-standard-mode-workbench="true">
      <StandardModeWorkbenchNavigation
        locked={settingGenerationLocked}
        activeAction={activeAction}
        onSelectAction={(_group, action) => {
          if (action === 'settingsList') {
            setActiveAction(hasSettings ? 'settingsList' : 'createSettings');
            return;
          }
          setActiveAction(action);
        }}
      />
      <TemplateReplacementWarning
        isOpen={templateChangeWarningOpen}
        onClose={() => setTemplateChangeWarningOpen(false)}
        onConfirm={() => {
          setTemplateChangeWarningOpen(false);
          setActiveAction('changeSettingTemplate');
        }}
      />

      {activeAction === 'workDetails' || activeAction === 'naming' ? (
        <StandardModeWorkDetailsPage
          key={currentNovel.id}
          novel={currentNovel}
          stats={stats}
          settingsStorageKey={settingsStorageKey}
          externalAiOptimizerTarget={activeAction === 'naming' ? 'both' : null}
          onExternalAiOptimizerClose={() => setActiveAction('workDetails')}
          onSave={updateCurrentNovelDetails}
          onOpenBrainstorm={() => {
            setActiveAction('generateBrainstorm');
          }}
          onOpenSettings={() => {
            setActiveAction(hasSettings ? 'settingsList' : 'createSettings');
          }}
          onOpenOutline={() => {
            setActiveAction('chapterOutline');
          }}
          onOpenWriting={() => {
            setActiveAction('writing');
          }}
          onOpenAudit={() => {
            setActiveAction('storyAudit');
          }}
        />
      ) : isBrainstormPage ? (
        <main className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
          <StandardModeBrainstormPage
            focusGeneration={activeAction === 'generateBrainstorm'}
            novelId={String(currentNovel.id)}
            onOpenLibrary={() => {
              setActiveAction('brainstormLibrary');
            }}
            onCreateSettings={() => {
              setActiveAction(hasSettings ? 'settingsList' : 'createSettings');
            }}
          />
        </main>
      ) : isSettingSetupPage ? (
        <main className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
          <StandardModeSettingPage
            novelId={String(currentNovel.id)}
            novelTitle={currentNovel.title}
            novelCategory={currentNovel.category || '玄幻'}
            novelChannel={currentNovel.channel === 'female' ? 'female' : 'male'}
            novelTargetWordCount={currentNovel.targetWordCount}
            settingsStorageKey={settingsStorageKey}
            forceTemplateSelection={activeAction === 'createSettings'}
            startInTemplateSelector={activeAction === 'changeSettingTemplate'}
            onTemplateChangeCancelled={() => setActiveAction('settingsList')}
            onNovelChannelChange={(channel) => updateCurrentNovelDetails({ channel })}
            onInitialized={() => {
              setActiveAction('settingsList');
            }}
          />
        </main>
      ) : activeAction === 'settingsList' && needsProfessionalSettingMigration ? (
        <main className="grid min-h-0 flex-1 place-items-center bg-white text-sm font-semibold text-[#7b8794]">
          正在同步设定模板…
        </main>
      ) : isSharedCreationPage ? (
        <main className="min-h-0 flex-1 overflow-hidden">
          <StandardModeSharedCreationPage action={activeAction} />
        </main>
      ) : (
        <main className="grid min-h-0 flex-1 place-items-center bg-white text-sm font-semibold text-[#7b8794]">
          正在打开创作页面…
        </main>
      )}
    </div>
  );
}
