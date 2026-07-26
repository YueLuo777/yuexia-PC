import { useState } from 'react';

import blueMinimalCover from '@/assets/default-novel-covers/blue-minimal-03-moon-orbit.png';
import moonlitCover from '@/assets/default-novel-covers/moonlit-01-deep-blue.png';
import type { WorkbenchCreationFlowPageKey } from '@/features/workbench/model/workbenchCreationFlow';

import { StandardModeCreationDialog } from './StandardModeCreationFlowDialogs';
import { StandardModeProfessionalEditorPreview } from './StandardModeProfessionalEditorPreview';
import { StandardModeUnifiedWorkbenchPreview } from './StandardModeUnifiedWorkbenchPreview';
import type {
  StandardModeNovel,
  StandardModeNovelId,
  StandardModeWorkbenchTool,
} from './standardModeWorkbenchTestData';

type TestView = 'library' | 'workbench' | 'editor';

const NOVELS: StandardModeNovel[] = [
  {
    id: 'ongoing',
    title: '九重天劫',
    cover: moonlitCover,
    category: '玄幻升级',
    chapters: 18,
    words: '6.8万',
    progress: 42,
    lastChapter: '第18章 天门试炼',
    nextAction: '生成第19章章纲',
  },
  {
    id: 'new',
    title: '万界商途',
    cover: blueMinimalCover,
    category: '仙侠经营',
    chapters: 0,
    words: '0',
    progress: 5,
    lastChapter: '第1章 未开始',
    nextAction: '生成脑洞',
  },
];

function StandardNovelCard({
  novel,
  onOpenEditor,
  onOpenWorkbench,
}: {
  novel: StandardModeNovel;
  onOpenEditor: () => void;
  onOpenWorkbench: () => void;
}) {
  return (
    <article className="flex w-[238px] shrink-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        aria-label={`打开《${novel.title}》正文`}
        onClick={onOpenEditor}
        className="group text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#08AACE]/40"
      >
        <div className="relative h-[286px] overflow-hidden bg-slate-100">
          <img
            src={novel.cover}
            alt={`${novel.title}封面`}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
          <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-slate-600 shadow-sm">
            {novel.category}
          </span>
        </div>
        <div className="px-4 pb-3 pt-4">
          <h2 className="truncate text-base font-black text-slate-900">{novel.title}</h2>
          <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-400">
            <span>{novel.chapters}章</span>
            <span>{novel.words}字</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-[#08AACE]" style={{ width: `${novel.progress}%` }} />
          </div>
          <p className="mt-3 truncate text-xs font-bold text-slate-500">下一步：{novel.nextAction}</p>
        </div>
      </button>
      <button
        type="button"
        aria-label={`进入《${novel.title}》创作工作台`}
        onClick={onOpenWorkbench}
        className="h-11 border-t border-slate-200 bg-slate-50 text-sm font-black text-[#078FAB] transition-colors hover:bg-[#EAF9FD]"
      >
        进入创作工作台
      </button>
    </article>
  );
}

function LibraryView({
  onOpenEditor,
  onOpenWorkbench,
  onCreateNovel,
}: {
  onOpenEditor: (novelId: StandardModeNovelId) => void;
  onOpenWorkbench: (novelId: StandardModeNovelId) => void;
  onCreateNovel: () => void;
}) {
  return (
    <div className="h-full overflow-y-auto bg-slate-50 px-8 py-7" data-testid="standard-mode-library">
      <header className="mx-auto flex max-w-6xl items-end justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="text-xs font-black text-[#078FAB]">标准模式</div>
          <h1 className="mt-1 text-2xl font-black text-slate-900">我的小说</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            点击书籍直接进入专业模式正文页；需要创作指引时进入工作台。
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateNovel}
          className="h-9 rounded-md bg-[#08AACE] px-4 text-sm font-black text-white hover:bg-[#078FAB]"
        >
          新建小说
        </button>
      </header>
      <main className="mx-auto max-w-6xl py-7">
        <div className="flex flex-wrap gap-6">
          {NOVELS.map((novel) => (
            <StandardNovelCard
              key={novel.id}
              novel={novel}
              onOpenEditor={() => onOpenEditor(novel.id)}
              onOpenWorkbench={() => onOpenWorkbench(novel.id)}
            />
          ))}
        </div>
        <div className="mt-8 border-l-4 border-[#08AACE] bg-[#F2FBFD] px-4 py-3 text-sm font-medium leading-6 text-slate-600">
          标准模式只新增书籍工作台；正文页、小说数据、历史记录和专业模式完全共用。
        </div>
      </main>
    </div>
  );
}

function toStandardTool(flow?: WorkbenchCreationFlowPageKey): StandardModeWorkbenchTool | undefined {
  if (
    flow === 'brainstorm' ||
    flow === 'outline' ||
    flow === 'chapterOutline' ||
    flow === 'writing' ||
    flow === 'audit' ||
    flow === 'status' ||
    flow === 'summary'
  )
    return flow;
  return undefined;
}

export function StandardModeWorkbenchTestPage() {
  const [view, setView] = useState<TestView>('library');
  const [selectedNovelId, setSelectedNovelId] = useState<StandardModeNovelId>('ongoing');
  const [initialTool, setInitialTool] = useState<StandardModeWorkbenchTool>();
  const [showCreationDialog, setShowCreationDialog] = useState(false);
  const [linkedBrainstorm, setLinkedBrainstorm] = useState<string>();
  const [createdNovelTitle, setCreatedNovelTitle] = useState<string>();
  const baseSelectedNovel = NOVELS.find((novel) => novel.id === selectedNovelId) ?? NOVELS[0];
  const selectedNovel = createdNovelTitle
    ? { ...baseSelectedNovel, title: createdNovelTitle }
    : baseSelectedNovel;

  const openView = (novelId: StandardModeNovelId, nextView: TestView) => {
    setSelectedNovelId(novelId);
    setInitialTool(undefined);
    setCreatedNovelTitle(undefined);
    setView(nextView);
  };

  if (view === 'editor') {
    return (
      <StandardModeProfessionalEditorPreview
        novel={selectedNovel}
        onBack={() => setView('library')}
        onOpenWorkbench={(flow) => {
          setInitialTool(toStandardTool(flow));
          setView('workbench');
        }}
      />
    );
  }

  if (view === 'workbench') {
    return (
      <StandardModeUnifiedWorkbenchPreview
        key={`${selectedNovel.id}:${initialTool ?? 'default'}`}
        novel={selectedNovel}
        initialTool={initialTool}
        linkedBrainstorm={linkedBrainstorm}
        onBack={() => setView('library')}
        onOpenEditor={() => setView('editor')}
      />
    );
  }

  return (
    <>
      <LibraryView
        onOpenEditor={(novelId) => openView(novelId, 'editor')}
        onOpenWorkbench={(novelId) => {
          setLinkedBrainstorm(undefined);
          openView(novelId, 'workbench');
        }}
        onCreateNovel={() => setShowCreationDialog(true)}
      />
      <StandardModeCreationDialog
        isOpen={showCreationDialog}
        onClose={() => setShowCreationDialog(false)}
        onCreateBlank={() => {
          setShowCreationDialog(false);
          setLinkedBrainstorm(undefined);
          setCreatedNovelTitle('未命名小说');
          setSelectedNovelId('new');
          setInitialTool('brainstorm');
          setView('workbench');
        }}
        onCreateFromBrainstorm={(brainstormTitle) => {
          setShowCreationDialog(false);
          setLinkedBrainstorm(brainstormTitle);
          setCreatedNovelTitle(brainstormTitle);
          setSelectedNovelId('new');
          setInitialTool('brainstorm');
          setView('workbench');
        }}
      />
    </>
  );
}

export default StandardModeWorkbenchTestPage;
