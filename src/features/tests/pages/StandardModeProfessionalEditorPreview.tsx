import { useMemo, useState } from 'react';

import { ChapterEditor } from '@/features/workbench/components/ChapterEditor';
import { WorkbenchHeader } from '@/features/workbench/components/WorkbenchHeader';
import { WorkbenchWritingLayout } from '@/features/workbench/components/WorkbenchWritingLayout';
import {
  WORKBENCH_HEADER_FLOW_ITEMS,
  type WorkbenchCreationFlowPageKey,
} from '@/features/workbench/model/workbenchCreationFlow';
import type { Chapter, Volume } from '@/features/workbench/model/workbenchTypes';

import type { StandardModeNovel } from './standardModeWorkbenchTestData';

const BODY_BY_NOVEL_ID = {
  ongoing:
    '天门在云海深处缓缓开启。\n\n林刻踏上最后一级石阶时，破损的石碑突然发出低沉嗡鸣。碑面上的裂纹并非自然形成，而是有人刻意抹去了其中最关键的一段铭文。',
  new: '晨雾尚未散尽，林刻已经站在青岳宗的山门前。\n\n石阶尽头的试功碑布满裂纹，其他弟子只看见岁月留下的痕迹，林刻眼中却浮现出一行清晰的提示：第三道阵纹缺失，强行运转将反噬经脉。',
} satisfies Record<StandardModeNovel['id'], string>;

export function StandardModeProfessionalEditorPreview({
  novel,
  onBack,
  onOpenWorkbench,
}: {
  novel: StandardModeNovel;
  onBack: () => void;
  onOpenWorkbench: (tool?: WorkbenchCreationFlowPageKey) => void;
}) {
  const initialTitle = novel.id === 'new' ? '初入青岳宗' : '天门试炼';
  const initialSerial = novel.id === 'new' ? 1 : 18;
  const [title, setTitle] = useState(initialTitle);
  const [serialNumber, setSerialNumber] = useState(initialSerial);
  const [content, setContent] = useState(BODY_BY_NOVEL_ID[novel.id]);
  const chapter: Chapter = useMemo(
    () => ({ id: 1, title, serialNumber, wordCount: content.replace(/\s/g, '').length, isSelected: true }),
    [content, serialNumber, title],
  );
  const volumes: Volume[] = useMemo(
    () => [{ id: 1, name: '第一卷', isExpanded: true, chapters: [chapter] }],
    [chapter],
  );
  const noop = () => undefined;

  const editor = (
    <ChapterEditor
      chapter={chapter}
      volumeName="第一卷"
      content={content}
      lastSavedAt={null}
      allChapters={[chapter]}
      volumes={volumes}
      settingsStorageKey={`xinyuexia_standard_mode_test_settings_${novel.id}`}
      outlineStorageKey={`xinyuexia_standard_mode_test_outline_${novel.id}`}
      getChapterContent={() => content}
      onUpdateChapterContent={(_chapterId, nextContent) => setContent(nextContent)}
      onRenameChapter={(_chapterId, nextTitle) => setTitle(nextTitle)}
      onChangeContent={setContent}
      onUpdateSerialNumber={(_chapterId, nextSerial) => setSerialNumber(nextSerial)}
      onDeleteChapter={noop}
      onOpenFind={noop}
      onOpenSummaryLibrary={() => onOpenWorkbench('summary')}
    />
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[#f5f5f7]" data-testid="professional-mode-editor-preview">
      <WorkbenchHeader
        workTitle={novel.title}
        flowItems={WORKBENCH_HEADER_FLOW_ITEMS}
        activeFlow="writing"
        flowStats={{ writing: { meta: `${Math.max(1, novel.chapters)}章` } }}
        fieldSizeVisible
        logVisible
        extraTools={
          <button
            type="button"
            onClick={onBack}
            className="h-8 rounded-md border border-[#dce1e8] bg-white px-3 text-sm font-medium text-[#586574] hover:border-[#08AACE] hover:text-[#08AACE]"
          >
            返回书籍
          </button>
        }
        onOpenWorkInfo={noop}
        onOpenFieldSize={noop}
        onOpenLog={noop}
        onSelectFlow={(flow) => {
          if (flow !== 'writing') onOpenWorkbench(flow);
        }}
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <WorkbenchWritingLayout
          writing
          content={editor}
          showPublished={false}
          aiPanelWidth={360}
          onChapterResize={noop}
          onPublishedResize={noop}
          onAiResize={noop}
          chapterSidebarProps={{
            volumes,
            width: 220,
            sortAsc: true,
            recycledCount: 0,
            workType: 'novel',
            showPublished: false,
            onTogglePublished: noop,
            onToggleVolume: noop,
            onToggleSort: noop,
            onSelectChapter: noop,
            onEditChapter: noop,
            onAddChapter: noop,
            onAddVolume: noop,
            onDeleteVolume: noop,
            onDeleteChapter: noop,
            onPublishChapter: noop,
            onOpenRecycle: noop,
            onExportChapters: noop,
            getChapterWordCount: () => chapter.wordCount,
          }}
          publishedSidebarProps={{
            volumes,
            width: 220,
            onSelectChapter: noop,
            onEditChapter: noop,
            onUnpublishChapter: noop,
            onDeleteChapter: noop,
            getChapterWordCount: () => chapter.wordCount,
          }}
          aiPanelProps={{
            activeTool: 'ai',
            workId: `standard-mode-test-${novel.id}`,
            selectedChapterContent: content,
            linkedContextItems: [],
            onReplaceContent: setContent,
            onOpenModelManage: noop,
            onOpenAgentManage: noop,
            onOpenContextLibrary: noop,
            onClearLinkedContext: noop,
          }}
        />
      </div>
    </div>
  );
}
