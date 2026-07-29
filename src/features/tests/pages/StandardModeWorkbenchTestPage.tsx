import { ChevronRight, MoreHorizontal } from 'lucide-react';
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
  },
  {
    id: 'new',
    title: '万界商途',
    cover: blueMinimalCover,
    category: '仙侠经营',
    chapters: 0,
    words: '0',
  },
];

function StandardNovelCard({
  novel,
  onOpenStandardWorkbench,
  onOpenProfessionalWorkbench,
  onMenuAction,
}: {
  novel: StandardModeNovel;
  onOpenStandardWorkbench: () => void;
  onOpenProfessionalWorkbench: () => void;
  onMenuAction: (message: string) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);

  const runMenuAction = (message: string) => {
    setIsMenuOpen(false);
    setIsMoveMenuOpen(false);
    onMenuAction(message);
  };

  return (
    <article className="relative flex w-[238px] shrink-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        aria-label={`点击《${novel.title}》封面进入标准工作台`}
        onClick={onOpenStandardWorkbench}
        className="group overflow-hidden rounded-t-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#08AACE]/40"
      >
        <div className="relative h-[286px] overflow-hidden bg-slate-100">
          <img
            src={novel.cover}
            alt={`${novel.title}封面`}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </div>
      </button>
      <div className="px-4 pb-3 pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="min-w-0 flex-1 truncate text-base font-black text-slate-900">{novel.title}</h2>
          <button
            type="button"
            aria-label={`《${novel.title}》更多操作`}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={() => {
              if (isMenuOpen) setIsMoveMenuOpen(false);
              setIsMenuOpen((current) => !current);
            }}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-slate-300 text-slate-500 transition-colors hover:border-[#08AACE] hover:text-[#078FAB]"
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-400">
          <span>{novel.chapters}章</span>
          <span>{novel.words}字</span>
        </div>
      </div>
      <div className="grid grid-cols-2 overflow-hidden rounded-b-lg border-t border-slate-200">
        <button
          type="button"
          aria-label={`进入《${novel.title}》标准工作台`}
          onClick={onOpenStandardWorkbench}
          className="h-11 bg-slate-50 text-xs font-black text-[#078FAB] transition-colors hover:bg-[#EAF9FD]"
        >
          进入标准工作台
        </button>
        <button
          type="button"
          aria-label={`进入《${novel.title}》专业工作台`}
          onClick={onOpenProfessionalWorkbench}
          className="h-11 border-l border-slate-200 bg-slate-50 text-xs font-black text-slate-600 transition-colors hover:bg-slate-100"
        >
          进入专业工作台
        </button>
      </div>
      {isMenuOpen ? (
        <div
          role="menu"
          aria-label={`《${novel.title}》作品操作菜单`}
          className="absolute right-0 top-[328px] z-20 w-[222px] rounded-xl border border-slate-100 bg-white py-2 shadow-[0_14px_35px_rgba(15,23,42,0.16)]"
        >
          <div className="px-3 pb-2 pt-1 text-[13px] font-medium text-slate-400">
            <div>最近更新：2026/7/28</div>
            <div className="mt-1">当前分类：{novel.category}</div>
          </div>
          <div className="mx-1 border-t border-slate-200" />
          {['重命名', '书封管理', '导出'].map((label) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              onClick={() => runMenuAction(`已打开《${novel.title}》${label}`)}
              className="h-11 w-full rounded-md px-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {label}
            </button>
          ))}
          <div className="mx-1 border-t border-slate-200" />
          <div className="relative">
            <button
              type="button"
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={isMoveMenuOpen}
              onClick={() => setIsMoveMenuOpen((current) => !current)}
              className="flex h-11 w-full items-center justify-between rounded-md px-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <span>移入分类</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
            {isMoveMenuOpen ? (
              <div role="menu" aria-label="可移动分类" className="absolute left-full top-0 ml-1 w-32 rounded-lg border border-slate-100 bg-white p-1 shadow-lg">
                {['玄幻', '仙侠', '都市'].map((category) => (
                  <button
                    key={category}
                    type="button"
                    role="menuitem"
                    onClick={() => runMenuAction(`已将《${novel.title}》移入${category}`)}
                    className="h-9 w-full rounded px-3 text-left text-sm text-slate-700 hover:bg-slate-100"
                  >
                    {category}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="mx-1 border-t border-slate-200" />
          <button
            type="button"
            role="menuitem"
            onClick={() => runMenuAction(`已准备将《${novel.title}》移入回收站`)}
            className="h-11 w-full rounded-md px-3 text-left text-sm font-medium text-red-500 hover:bg-red-50"
          >
            移入回收站
          </button>
        </div>
      ) : null}
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
  const [menuFeedback, setMenuFeedback] = useState('');

  return (
    <div className="h-full overflow-y-auto bg-slate-50 px-8 py-7" data-testid="standard-mode-library">
      <header className="mx-auto flex max-w-6xl items-end justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="text-xs font-black text-[#078FAB]">标准模式</div>
          <h1 className="mt-1 text-2xl font-black text-slate-900">我的小说</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            点击封面或左侧按钮进入标准工作台，右侧按钮进入专业工作台。
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
              onOpenStandardWorkbench={() => onOpenWorkbench(novel.id)}
              onOpenProfessionalWorkbench={() => onOpenEditor(novel.id)}
              onMenuAction={setMenuFeedback}
            />
          ))}
        </div>
        <div aria-live="polite" className="mt-4 min-h-5 text-sm font-bold text-[#078FAB]">
          {menuFeedback}
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
