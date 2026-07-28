import { useMemo, useState } from 'react';

import { WorkbenchCreationFlowContent } from '@/features/workbench/components/WorkbenchCreationFlowContent';
import { WorkbenchHeader, type WorkbenchHeaderFlowStats } from '@/features/workbench/components/WorkbenchHeader';
import { WorkbenchWritingLayout } from '@/features/workbench/components/WorkbenchWritingLayout';
import { FIELD_SIZE_FLOW_IDS } from '@/features/workbench/components/workbenchPageSupport';
import {
  WORKBENCH_HEADER_FLOW_ITEMS,
  type WorkbenchCreationFlowPageKey,
} from '@/features/workbench/model/workbenchCreationFlow';
import type { Chapter, Volume } from '@/features/workbench/model/workbenchTypes';

const SETTINGS_STORAGE_KEY = 'xinyuexia_professional_baseline_test_settings_v1';
const OUTLINE_STORAGE_KEY = 'xinyuexia_professional_baseline_test_outline_v1';

const INITIAL_CHAPTERS: Chapter[] = [
  { id: 1301, serialNumber: 1, title: '山门测试', wordCount: 112, isSelected: true },
  { id: 1302, serialNumber: 2, title: '残缺功法', wordCount: 96, isSelected: false },
  { id: 1303, serialNumber: 3, title: '第一次修炼', wordCount: 0, isSelected: false },
];

const INITIAL_CONTENT: Record<number, string> = {
  1301:
    '晨雾尚未散尽，林刻已经站在青岳宗的山门前。\n\n石阶尽头的试功碑布满裂纹，其他弟子只看见岁月留下的痕迹，林刻眼中却浮现出一行清晰提示。',
  1302:
    '灵气沿经脉缓慢前行。抵达第三处关窍时，林刻眼前再次浮现提示：第三道运行路线存在缺陷。',
  1303: '',
};

const FLOW_STATS: WorkbenchHeaderFlowStats = {
  brainstorm: { meta: '2个脑洞' },
  outline: { meta: '18个设定' },
  chapterOutline: { meta: '2篇章纲' },
  writing: { meta: '2章正文' },
  audit: { meta: '1章待审核', tone: 'warning' },
  status: { meta: '3项待确认', tone: 'warning' },
  summary: { meta: '1章缺失', tone: 'warning' },
  polish: { meta: '2章未润色', tone: 'warning' },
  comment: { meta: '1章待点评', tone: 'warning' },
};

type ProfessionalWorkbenchBaselineTestPageProps = {
  experience?: 'professional' | 'standard';
  fixedFlow?: Extract<WorkbenchCreationFlowPageKey, 'outline' | 'chapterOutline' | 'writing' | 'audit'>;
  showHeader?: boolean;
};

export function ProfessionalWorkbenchBaselineTestPage({
  experience = 'professional',
  fixedFlow,
  showHeader = experience === 'professional',
}: ProfessionalWorkbenchBaselineTestPageProps = {}) {
  const [internalActiveFlow, setInternalActiveFlow] = useState<WorkbenchCreationFlowPageKey>('brainstorm');
  const activeFlow = fixedFlow ?? internalActiveFlow;
  const [chapters, setChapters] = useState(INITIAL_CHAPTERS);
  const [selectedChapterId, setSelectedChapterId] = useState(INITIAL_CHAPTERS[0].id);
  const [contentByChapter, setContentByChapter] = useState(INITIAL_CONTENT);
  const selectedChapter = chapters.find((chapter) => chapter.id === selectedChapterId) ?? chapters[0];
  const editorContent = contentByChapter[selectedChapter.id] ?? '';
  const volumes: Volume[] = useMemo(
    () => [
      {
        id: 130,
        name: '第一卷',
        isExpanded: true,
        chapters: chapters.map((chapter) => ({ ...chapter, isSelected: chapter.id === selectedChapterId })),
      },
    ],
    [chapters, selectedChapterId],
  );

  const updateContent = (chapterId: number, content: string) => {
    setContentByChapter((current) => ({ ...current, [chapterId]: content }));
    setChapters((current) =>
      current.map((chapter) =>
        chapter.id === chapterId ? { ...chapter, wordCount: content.replace(/\s/g, '').length } : chapter,
      ),
    );
  };

  const chapterEditorProps = {
    chapter: selectedChapter,
    volumeName: '第一卷',
    content: editorContent,
    lastSavedAt: null,
    allChapters: chapters,
    volumes,
    settingsStorageKey: SETTINGS_STORAGE_KEY,
    outlineStorageKey: OUTLINE_STORAGE_KEY,
    reviewLibraryEntries: [],
    getChapterContent: (chapterId: number) => contentByChapter[chapterId] ?? '',
    onUpdateChapterContent: updateContent,
    onRenameChapter: (chapterId: number, title: string) =>
      setChapters((current) => current.map((chapter) => (chapter.id === chapterId ? { ...chapter, title } : chapter))),
    onChangeContent: (content: string) => updateContent(selectedChapter.id, content),
    onUpdateSerialNumber: (chapterId: number, serialNumber: number) =>
      setChapters((current) =>
        current.map((chapter) => (chapter.id === chapterId ? { ...chapter, serialNumber } : chapter)),
      ),
    onDeleteChapter: () => undefined,
    onOpenFind: () => undefined,
    onOpenSummaryLibrary: () => {
      if (!fixedFlow) setInternalActiveFlow('summary');
    },
  };

  const content = (
    <WorkbenchCreationFlowContent
      activeFlow={activeFlow}
      settingsStorageKey={SETTINGS_STORAGE_KEY}
      outlineStorageKey={OUTLINE_STORAGE_KEY}
      volumes={volumes}
      fieldSizeOpenSignal={0}
      aiLogOpenSignal={0}
      onRegisterHeaderLog={() => undefined}
      getChapterContent={chapterEditorProps.getChapterContent}
      chapterEditorProps={chapterEditorProps}
      standardMode={experience === 'standard'}
    />
  );

  return (
    <div
      className="relative flex h-full min-h-0 flex-col bg-[#f5f5f7]"
      data-testid="professional-workbench-baseline"
      data-workbench-experience={experience}
      data-workbench-flow={activeFlow}
    >
      {showHeader ? (
        <WorkbenchHeader
          workTitle="九重天劫"
          flowItems={WORKBENCH_HEADER_FLOW_ITEMS}
          activeFlow={activeFlow}
          flowStats={FLOW_STATS}
          fieldSizeVisible={activeFlow === 'writing' || FIELD_SIZE_FLOW_IDS.has(activeFlow)}
          logVisible
          extraTools={<div id="professional-baseline-header-extra-tools" className="inline-flex items-center gap-2" />}
          onOpenFieldSize={() => undefined}
          onOpenLog={() => undefined}
          onSelectFlow={setInternalActiveFlow}
          onOpenWorkInfo={() => undefined}
        />
      ) : null}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <WorkbenchWritingLayout
          writing={activeFlow === 'writing'}
          content={content}
          showPublished={false}
          aiPanelWidth={experience === 'standard' ? 390 : 360}
          onChapterResize={() => undefined}
          onPublishedResize={() => undefined}
          onAiResize={() => undefined}
          chapterSidebarProps={{
            volumes,
            width: experience === 'standard' ? 280 : 220,
            sortAsc: true,
            recycledCount: 0,
            workType: 'novel',
            showPublished: false,
            onTogglePublished: () => undefined,
            onToggleVolume: () => undefined,
            onToggleSort: () => undefined,
            onSelectChapter: setSelectedChapterId,
            onEditChapter: setSelectedChapterId,
            onAddChapter: () => undefined,
            onAddVolume: () => undefined,
            onDeleteVolume: () => undefined,
            onDeleteChapter: () => undefined,
            onPublishChapter: () => undefined,
            onOpenRecycle: () => undefined,
            onExportChapters: () => undefined,
            getChapterWordCount: (chapterId) => chapters.find((chapter) => chapter.id === chapterId)?.wordCount ?? 0,
          }}
          publishedSidebarProps={{
            volumes,
            width: 220,
            onSelectChapter: setSelectedChapterId,
            onEditChapter: setSelectedChapterId,
            onUnpublishChapter: () => undefined,
            onDeleteChapter: () => undefined,
            getChapterWordCount: (chapterId) => chapters.find((chapter) => chapter.id === chapterId)?.wordCount ?? 0,
          }}
          aiPanelProps={{
            standardMode: experience === 'standard',
            activeTool: 'ai',
            workId: 'professional-workbench-baseline-test',
            selectedChapterContent: editorContent,
            linkedContextItems: [],
            onReplaceContent: (content) => updateContent(selectedChapter.id, content),
            onOpenModelManage: () => undefined,
            onOpenAgentManage: () => undefined,
            onOpenContextLibrary: () => undefined,
            onClearLinkedContext: () => undefined,
          }}
        />
      </div>
    </div>
  );
}

export default ProfessionalWorkbenchBaselineTestPage;
