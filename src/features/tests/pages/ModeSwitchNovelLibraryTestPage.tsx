import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import blueMinimalCover from '@/assets/default-novel-covers/blue-minimal-03-moon-orbit.png';
import moonlitCover from '@/assets/default-novel-covers/moonlit-01-deep-blue.png';
import { NovelCard, type NovelCardSettings } from '@/features/novels/components/NovelCard';
import type { Novel } from '@/features/novels/model/novelTypes';

import { StandardModeCreationDialog } from './StandardModeCreationFlowDialogs';
import { StandardModeProfessionalEditorPreview } from './StandardModeProfessionalEditorPreview';
import { StandardModeUnifiedWorkbenchPreview } from './StandardModeUnifiedWorkbenchPreview';
import type { StandardModeNovel, StandardModeNovelId } from './standardModeWorkbenchTestData';

type DisplayMode = 'professional' | 'standard';
type TestView = 'library' | 'editor' | 'workbench';

const CARD_SETTINGS: NovelCardSettings = {
  cardWidth: 'medium',
  coverHeight: 'medium',
  statFontSize: 'medium',
};

const NOVELS: Novel[] = [
  {
    id: 1,
    title: '九重天劫',
    type: 'novel',
    category: '玄幻升级',
    wordCount: 68120,
    createdAt: '2026/07/12',
    lastModifiedAt: '2026/07/25',
    cover: moonlitCover,
  },
  {
    id: 2,
    title: '万界商途',
    type: 'novel',
    category: '仙侠经营',
    wordCount: 12460,
    createdAt: '2026/07/20',
    lastModifiedAt: '2026/07/25',
    cover: blueMinimalCover,
  },
];

function toStandardNovel(novel: Novel): StandardModeNovel {
  return {
    id: novel.id === 1 ? 'ongoing' : 'new',
    title: novel.title,
    cover: novel.cover ?? '',
    category: novel.category,
    chapters: novel.id === 1 ? 18 : 3,
    words: `${Math.max(0, Math.round(novel.wordCount / 1000) / 10)}万`,
    progress: novel.id === 1 ? 42 : 12,
    lastChapter: novel.id === 1 ? '第18章 天门试炼' : '第3章 诸界来客',
    nextAction: novel.id === 1 ? '生成第19章章纲' : '完善作品设定',
  };
}

function BookGrid({
  mode,
  onOpenEditor,
  onOpenWorkbench,
}: {
  mode: DisplayMode;
  onOpenEditor: (novel: Novel) => void;
  onOpenWorkbench: (novel: Novel) => void;
}) {
  return (
    <div className="flex flex-wrap items-start gap-x-7 gap-y-8" data-testid={`${mode}-novel-grid`}>
      {NOVELS.map((novel) => {
        const card = (
          <NovelCard
            novel={novel}
            settings={CARD_SETTINGS}
            categories={['未分类', '玄幻升级', '仙侠经营']}
            onOpen={() => onOpenEditor(novel)}
            onRename={() => undefined}
            onCover={() => undefined}
            onExport={() => undefined}
            onMoveToCategory={() => undefined}
            onDelete={() => undefined}
          />
        );

        if (mode === 'professional') return <div key={novel.id}>{card}</div>;

        return (
          <div key={novel.id} className="w-[178px]" data-testid="standard-mode-novel-card">
            {card}
            <button
              type="button"
              onClick={() => onOpenWorkbench(novel)}
              className="mt-2 h-9 w-full rounded-md border border-[#9DDFEA] bg-white text-sm font-black text-[#078FAB] hover:bg-[#EAF9FD]"
            >
              进入创作工作台
            </button>
          </div>
        );
      })}
    </div>
  );
}

function LibraryContent({
  mode,
  onToggleMode,
  onOpenEditor,
  onOpenWorkbench,
  onCreateNovel,
}: {
  mode: DisplayMode;
  onToggleMode: () => void;
  onOpenEditor: (novel: Novel) => void;
  onOpenWorkbench: (novel: Novel) => void;
  onCreateNovel: () => void;
}) {
  const currentModeLabel = mode === 'professional' ? '专业模式' : '标准模式';
  const targetModeLabel = mode === 'professional' ? '标准模式' : '专业模式';

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-white" data-testid={`novel-library-${mode}`}>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-6">
        <h1 className="text-lg font-black text-slate-900">我的小说</h1>
        <button
          type="button"
          onClick={onToggleMode}
          aria-label={`当前${currentModeLabel}，切换到${targetModeLabel}`}
          title={`点击切换到${targetModeLabel}`}
          className="h-9 min-w-[92px] rounded-md border border-[#08AACE] bg-white px-4 text-sm font-black text-[#078FAB] hover:bg-[#EAF9FD]"
        >
          {currentModeLabel}
        </button>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
        <section className="flex items-end justify-between border-b border-slate-200 pb-5">
          <div>
            <div className="text-2xl font-black text-slate-900">作品库</div>
            <div className="mt-2 text-sm font-medium text-slate-500">2 部小说 · 80,580 字</div>
          </div>
          <button
            type="button"
            onClick={onCreateNovel}
            className="h-10 rounded-md bg-[#08AACE] px-5 text-sm font-black text-white hover:bg-[#078FAB]"
          >
            新建小说
          </button>
        </section>

        <section className="flex items-center gap-3 py-5">
          <label className="relative block w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="搜索小说"
              className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm font-medium outline-none focus:border-[#08AACE]"
            />
          </label>
          <button
            type="button"
            className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-600"
          >
            全部作品
          </button>
        </section>

        <BookGrid mode={mode} onOpenEditor={onOpenEditor} onOpenWorkbench={onOpenWorkbench} />
      </main>
    </div>
  );
}

export function ModeSwitchNovelLibraryTestPage() {
  const [mode, setMode] = useState<DisplayMode>('professional');
  const [view, setView] = useState<TestView>('library');
  const [selectedNovelId, setSelectedNovelId] = useState(1);
  const [showCreationDialog, setShowCreationDialog] = useState(false);
  const selectedNovel = useMemo(
    () => toStandardNovel(NOVELS.find((novel) => novel.id === selectedNovelId) ?? NOVELS[0]),
    [selectedNovelId],
  );

  if (view === 'editor') {
    return (
      <StandardModeProfessionalEditorPreview
        novel={selectedNovel}
        onBack={() => setView('library')}
        onOpenWorkbench={() => setView('workbench')}
      />
    );
  }

  if (view === 'workbench') {
    return (
      <StandardModeUnifiedWorkbenchPreview
        novel={selectedNovel}
        onBack={() => setView('library')}
        onOpenEditor={() => setView('editor')}
      />
    );
  }

  const openNovel = (novel: Novel, nextView: TestView) => {
    setSelectedNovelId(novel.id);
    setView(nextView);
  };

  return (
    <div className="flex h-full min-h-0 bg-white" data-testid="mode-switch-library-test-page">
      <LibraryContent
        mode={mode}
        onToggleMode={() => setMode((current) => (current === 'professional' ? 'standard' : 'professional'))}
        onOpenEditor={(novel) => openNovel(novel, 'editor')}
        onOpenWorkbench={(novel) => openNovel(novel, 'workbench')}
        onCreateNovel={() => setShowCreationDialog(true)}
      />
      <StandardModeCreationDialog
        isOpen={showCreationDialog}
        onClose={() => setShowCreationDialog(false)}
        onCreateBlank={() => {
          setShowCreationDialog(false);
          setSelectedNovelId(2);
          setView('workbench');
        }}
        onCreateFromBrainstorm={() => {
          setShowCreationDialog(false);
          setSelectedNovelId(2);
          setView('workbench');
        }}
      />
    </div>
  );
}

export default ModeSwitchNovelLibraryTestPage;
