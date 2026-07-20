import { lazy, memo, Suspense, type ComponentProps } from 'react';
import { ChapterEditor } from './ChapterEditor';
import type { WorkbenchCreationFlowPageKey } from '../model/workbenchCreationFlow';

const LazyWorkbenchLibraryPanel = lazy(() =>
  import('./WorkbenchLibraryPanel').then((module) => ({ default: module.WorkbenchLibraryPanel })),
);
const SETTING_LIBRARY_FLOW_TABS = ['大纲', '角色', '脑洞'];
type CachedLibraryPanelProps = ComponentProps<typeof LazyWorkbenchLibraryPanel> & { cacheVisible: boolean };
const LibraryPanel = memo(
  function LibraryPanel({ cacheVisible: _, ...props }: CachedLibraryPanelProps) {
    return (
      <Suspense
        fallback={
          <div className="flex h-full min-h-[240px] items-center justify-center bg-white text-sm font-bold text-slate-400">
            正在加载资料库…
          </div>
        }
      >
        <LazyWorkbenchLibraryPanel {...props} />
      </Suspense>
    );
  },
  (previous, next) =>
    !previous.cacheVisible &&
    !next.cacheVisible &&
    previous.storageKey === next.storageKey &&
    previous.outlineStorageKey === next.outlineStorageKey,
);

export function WorkbenchCreationFlowContent({
  activeFlow,
  settingsStorageKey,
  outlineStorageKey,
  volumes,
  fieldSizeOpenSignal,
  aiLogOpenSignal,
  onRegisterHeaderLog,
  getChapterContent,
  chapterEditorProps,
}: {
  activeFlow: WorkbenchCreationFlowPageKey;
  settingsStorageKey: string;
  outlineStorageKey: string;
  volumes: ComponentProps<typeof LazyWorkbenchLibraryPanel>['volumes'];
  fieldSizeOpenSignal: number;
  aiLogOpenSignal: number;
  onRegisterHeaderLog: (handler: (() => void) | null) => void;
  getChapterContent: (chapterId: number) => string;
  chapterEditorProps: ComponentProps<typeof ChapterEditor>;
}) {
  const shared = {
    fieldSizeOpenSignal,
    openLogSignal: aiLogOpenSignal,
    onRegisterHeaderLog,
    showInlineFieldSizeButton: false,
  };
  const settingLibraryVisible = activeFlow === 'brainstorm' || activeFlow === 'outline';
  const chapterOutlineVisible = activeFlow === 'chapterOutline';
  const summaryVisible = activeFlow === 'summary';
  const getCachedLibrarySignals = (visible: boolean) => ({
    fieldSizeOpenSignal: visible ? fieldSizeOpenSignal : 0,
    openLogSignal: visible ? aiLogOpenSignal : 0,
    onRegisterHeaderLog: undefined,
    showInlineFieldSizeButton: !visible,
  });

  return (
    <>
      <div
        className={settingLibraryVisible ? 'flex h-full min-h-0 min-w-0 flex-1' : 'hidden'}
        data-setting-library-cache
      >
        <LibraryPanel
          cacheVisible={settingLibraryVisible}
          {...getCachedLibrarySignals(settingLibraryVisible)}
          storageKey={settingsStorageKey}
          outlineStorageKey={outlineStorageKey}
          tabs={SETTING_LIBRARY_FLOW_TABS}
          emptyText="暂无内容"
          volumes={volumes}
          scale={1}
          defaultActiveTab={activeFlow === 'outline' ? '大纲' : '脑洞'}
        />
      </div>
      <div
        className={chapterOutlineVisible ? 'flex h-full min-h-0 min-w-0 flex-1' : 'hidden'}
        data-chapter-outline-library-cache
      >
        <LibraryPanel
          cacheVisible={chapterOutlineVisible}
          {...getCachedLibrarySignals(chapterOutlineVisible)}
          storageKey={settingsStorageKey}
          outlineStorageKey={outlineStorageKey}
          tabs={['细纲']}
          emptyText="暂无章纲内容"
          volumes={volumes}
          getChapterContent={getChapterContent}
          scale={1}
        />
      </div>
      <div className={summaryVisible ? 'flex h-full min-h-0 min-w-0 flex-1' : 'hidden'} data-summary-library-cache>
        <LibraryPanel
          cacheVisible={summaryVisible}
          {...getCachedLibrarySignals(summaryVisible)}
          storageKey={outlineStorageKey}
          outlineStorageKey={outlineStorageKey}
          tabs={['梗概']}
          emptyText="暂无梗概内容"
          volumes={volumes}
          getChapterContent={getChapterContent}
          scale={1}
        />
      </div>
      {(activeFlow === 'audit' || activeFlow === 'comment' || activeFlow === 'polish' || activeFlow === 'status') && (
        <ChapterEditor {...chapterEditorProps} {...shared} embeddedMode={activeFlow} />
      )}
      {activeFlow === 'writing' && <ChapterEditor {...chapterEditorProps} />}
    </>
  );
}
