import { AlertTriangle, Image as ImageIcon, RefreshCw, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ImportModal } from '@/features/novels/components/ImportModal';
import { useCoverLibrary } from '@/features/covers/hooks/useCoverLibrary';
import { NewNovelModal } from '@/features/novels/components/NewNovelModal';
import { NovelCard, type NovelCardSettings } from '@/features/novels/components/NovelCard';
import { RecycleBinModal } from '@/features/novels/components/RecycleBinModal';
import { useNovelLibrary } from '@/features/novels/hooks/useNovelLibrary';
import { useDefaultNovelCover } from '@/features/novels/hooks/useDefaultNovelCover';
import type { Novel, WorkType } from '@/features/novels/model/novelTypes';
import { readWritingSummary, WRITING_STATS_UPDATED_EVENT } from '@/shared/stats/writingStats';
import { useWorkspaceTabs } from '@/shared/tabs/WorkspaceTabsContext';
import { AutoFitText } from '@/shared/ui/AutoFitText';

import {
  type BtnColor,
  type FullCardSettings,
  CARD_SETTINGS_KEY,
  defaultBtnOrder,
  defaultBtnColors,
  defaultCardSettings,
  preloadEditorPage,
  formatWords,
  parseWorkDateValue,
  formatWorkDate,
  colorOptions,
  PillSegmentGroup,
  PillSegmentButton,
  loadCardSettings,
  saveCardSettings,
  CardSettingsModal,
  DeleteConfirmModal,
  CoverModal,
} from '@/features/novels/components/NovelLibraryParts';

export function NovelLibraryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openWorkTab } = useWorkspaceTabs();
  const workType: WorkType = location.pathname === '/scripts' ? 'script' : 'novel';
  const typeLabel = workType === 'novel' ? '小说' : '剧本';
  const { selectedCover: defaultNovelCover } = useDefaultNovelCover();

  const {
    novels,
    categories,
    recycledNovels,
    getNovelsByType,
    createNovel,
    renameNovel,
    updateCategory,
    moveToRecycle,
    restoreNovel,
    permanentDelete,
    selectNovel,
    updateCover,
    exportNovelAsText,
    importNovelWithChapters,
  } = useNovelLibrary();

  const [activeFilter, setActiveFilter] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isRecycleOpen, setIsRecycleOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: number; title: string } | null>(null);
  const [coverTargetId, setCoverTargetId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [showCardSettings, setShowCardSettings] = useState(false);
  const [cardSettings, setCardSettings] = useState<FullCardSettings>(loadCardSettings);
  const [notice, setNotice] = useState('');
  const [writingSummary, setWritingSummary] = useState(readWritingSummary);
  useEffect(() => {
    setIsNewOpen(false);
    setIsImportOpen(false);
    setIsRecycleOpen(false);
    setRenameTarget(null);
    setCoverTargetId(null);
    setDeleteTargetId(null);
    setNotice('');
  }, [workType]);

  useEffect(() => {
    void preloadEditorPage(workType);
  }, [workType]);

  const sourceNovels = getNovelsByType(workType);
  const totalWorkWords = sourceNovels.reduce((sum, novel) => sum + novel.wordCount, 0);
  const averageWorkWords = sourceNovels.length > 0 ? Math.round(totalWorkWords / sourceNovels.length) : 0;
  const recentWorks = [...sourceNovels]
    .sort(
      (a, b) =>
        parseWorkDateValue(b.lastModifiedAt || b.createdAt) - parseWorkDateValue(a.lastModifiedAt || a.createdAt),
    )
    .slice(0, 3);
  const filters = ['全部', ...categories];
  const filteredNovels = useMemo(
    () =>
      sourceNovels.filter((novel) => {
        const matchFilter = activeFilter === '全部' || novel.category === activeFilter;
        const matchSearch = !searchQuery.trim() || novel.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
        return matchFilter && matchSearch;
      }),
    [activeFilter, searchQuery, sourceNovels],
  );

  const coverTarget = novels.find((novel) => novel.id === coverTargetId) ?? null;

  useEffect(() => {
    const updateWritingSummary = () => setWritingSummary(readWritingSummary());
    window.addEventListener(WRITING_STATS_UPDATED_EVENT, updateWritingSummary);
    window.addEventListener('storage', updateWritingSummary);
    return () => {
      window.removeEventListener(WRITING_STATS_UPDATED_EVENT, updateWritingSummary);
      window.removeEventListener('storage', updateWritingSummary);
    };
  }, []);

  const handlePrepareOpen = (id: number) => {
    const novel = novels.find((item) => item.id === id);
    if (!novel) return;
    void preloadEditorPage(novel.type);
  };

  const handleOpen = (id: number) => {
    const novel = novels.find((item) => item.id === id);
    if (!novel) return;
    void preloadEditorPage(novel.type);
    selectNovel(id);
    const path = novel.type === 'script' ? '/script-editor-v2' : '/workbench';
    openWorkTab({
      workId: novel.id,
      workType: novel.type,
      title: novel.title,
      path,
    });
    navigate(path);
  };

  const confirmRename = () => {
    if (!renameTarget?.title.trim()) return;
    renameNovel(renameTarget.id, renameTarget.title);
    setRenameTarget(null);
  };

  const handleExportNovel = (id: number) => {
    const exported = exportNovelAsText(id);
    if (!exported) return;
    const blob = new Blob([exported.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exported.fileName;
    link.click();
    URL.revokeObjectURL(url);
    setNotice(`已导出 ${exported.fileName}`);
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      <main className="flex-1 overflow-y-auto px-[21px] py-3.5">
        <div className="min-w-0 space-y-3 overflow-x-hidden">
          <div className="grid w-full min-w-0 grid-cols-3 gap-3">
            <section
              data-user-check-in-card
              className="flex min-h-[126px] min-w-0 flex-col rounded-xl border border-slate-200 bg-[#fbfdff] px-4 py-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-[15px] font-bold text-[#1f2933]">用户签到</p>
                <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                  功能预留
                </span>
              </div>
              <div className="mt-3 flex flex-1 flex-col justify-center rounded-[10px] border border-dashed border-slate-200 bg-white px-3 py-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12px] font-semibold text-slate-500">连续签到</span>
                  <span className="text-[18px] font-black text-slate-400">-- 天</span>
                </div>
                <p className="mt-1 text-[11px] font-medium leading-4 text-slate-400">用户系统接入后开放</p>
              </div>
            </section>

            <section className="flex min-h-[126px] min-w-0 flex-col rounded-xl border border-slate-200 bg-[#f7faff] px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-[#1f2933]">作品概览</p>
                </div>
                <span className="shrink-0 rounded-full border border-[#dbe7f8] bg-white/80 px-2.5 py-0.5 text-[12px] font-semibold text-[#6b7b8d]">
                  预留 --
                </span>
              </div>
              <div className="mt-3 grid flex-1 grid-cols-2 grid-rows-2 gap-2">
                {[
                  { label: '作品', value: `${sourceNovels.length} 本` },
                  { label: '昨日更新', value: `${formatWords(writingSummary.yesterdayWords)} 字` },
                  { label: '字数', value: `${formatWords(totalWorkWords)} 字` },
                  { label: '平均字数', value: `${formatWords(averageWorkWords)} 字` },
                ].map((item) => (
                  <article
                    key={item.label}
                    data-overview-stat
                    className="grid h-full min-h-[40px] min-w-0 grid-cols-[max-content_minmax(0,1fr)] items-center gap-1.5 overflow-hidden rounded-[10px] border border-slate-200 bg-white px-2.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                  >
                    <span className="min-w-0 shrink-0">
                      <span className="block whitespace-nowrap text-[12px] font-semibold text-[#1f2933]">
                        {item.label}
                      </span>
                    </span>
                    <AutoFitText className="font-bold text-[#111827]" minFontSize={11} maxFontSize={18}>
                      {item.value}
                    </AutoFitText>
                  </article>
                ))}
              </div>
            </section>

            <section className="flex min-h-[126px] min-w-0 flex-col rounded-xl border border-slate-200 bg-white px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="truncate text-[15px] font-semibold leading-none text-[#1f2933]">最近编辑：</h2>
                <span className="shrink-0 text-[12px] font-medium text-[#9aa3af]">最多显示 3 本</span>
              </div>
              {recentWorks.length > 0 ? (
                <div className="mt-3 grid flex-1 grid-cols-3 gap-2">
                  {recentWorks.map((work) => (
                    <button
                      key={work.id}
                      type="button"
                      onClick={() => handleOpen(work.id)}
                      onMouseEnter={() => handlePrepareOpen(work.id)}
                      onFocus={() => handlePrepareOpen(work.id)}
                      className="min-w-0 rounded-[10px] border border-slate-200 bg-[#fbfdff] px-3 py-2.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-[#08AACE]/40 hover:bg-[#E7F8FD]"
                    >
                      <span className="block min-w-0 truncate text-[14px] font-bold text-[#1f2933]">{work.title}</span>
                      <span className="mt-1 block text-[12px] font-medium text-[#8d98a6]">
                        {formatWorkDate(work.lastModifiedAt || work.createdAt)}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-[14px] font-medium text-[#9aa3af]">暂无最近编辑的{typeLabel}</p>
              )}
            </section>
          </div>
        </div>

        {notice && (
          <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">{notice}</div>
        )}

        <div className="mb-7 mt-7 flex items-center justify-between gap-4">
          <div className="xy-category-capsules min-w-0">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`xy-category-capsule ${activeFilter === filter ? 'xy-active' : ''}`}
              >
                <span>{filter}</span>
                <span className="xy-category-capsule-count">
                  {filter === '全部'
                    ? sourceNovels.length
                    : sourceNovels.filter((novel) => novel.category === filter).length}
                </span>
              </button>
            ))}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <label className="xy-ui132-search xy-novel-search shrink-0" style={{ width: 156, maxWidth: 156 }}>
              <Search />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={`搜索${typeLabel}`}
                style={{ height: 40 }}
              />
            </label>
            <button
              type="button"
              onClick={() => setIsRecycleOpen(true)}
              className="h-10 rounded-[10px] border border-red-300 bg-red-50 px-4 text-sm font-bold text-red-600 transition-colors hover:border-red-400 hover:bg-red-100"
            >
              回收站（{recycledNovels.length}）
            </button>
            <button
              type="button"
              onClick={() => setShowCardSettings(true)}
              className="h-10 rounded-[10px] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-colors hover:border-[#08AACE]/40 hover:bg-[#E7F8FD] hover:text-[#078FAE]"
            >
              卡片设置
            </button>
            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="h-10 rounded-[10px] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-colors hover:border-[#08AACE]/40 hover:bg-[#E7F8FD] hover:text-[#078FAE]"
            >
              导入{typeLabel}
            </button>
            <button
              type="button"
              onClick={() => setIsNewOpen(true)}
              className="h-10 rounded-[10px] bg-[#08AACE] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0798B8]"
            >
              新建{typeLabel}
            </button>
          </div>
        </div>

        {filteredNovels.length === 0 ? (
          <div className="flex h-[360px] flex-col items-center justify-center rounded-[8px] border border-dashed border-[#d7dce4] bg-[#fbfbfc]">
            <p className="text-3xl text-gray-500">暂无{typeLabel}</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-16 gap-y-14">
            {filteredNovels.map((novel) => (
              <NovelCard
                key={novel.id}
                novel={novel}
                settings={cardSettings}
                defaultCoverSrc={defaultNovelCover.src}
                categories={categories}
                onPrepareOpen={handlePrepareOpen}
                onOpen={handleOpen}
                onRename={(id, currentTitle) => setRenameTarget({ id, title: currentTitle })}
                onCover={(id) => setCoverTargetId(id)}
                onExport={handleExportNovel}
                onMoveToCategory={updateCategory}
                onDelete={(id) => setDeleteTargetId(id)}
              />
            ))}
          </div>
        )}
      </main>

      <NewNovelModal
        isOpen={isNewOpen}
        type={workType}
        categories={categories}
        onClose={() => setIsNewOpen(false)}
        onCreate={createNovel}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={importNovelWithChapters}
        defaultType={workType}
      />

      <RecycleBinModal
        isOpen={isRecycleOpen}
        type={workType}
        items={recycledNovels}
        onClose={() => setIsRecycleOpen(false)}
        onRestore={restoreNovel}
        onPermanentDelete={permanentDelete}
      />

      <CardSettingsModal
        isOpen={showCardSettings}
        settings={cardSettings}
        onClose={() => setShowCardSettings(false)}
        onChange={(next) => {
          setCardSettings(next);
          saveCardSettings(next);
        }}
      />

      <CoverModal
        isOpen={coverTargetId !== null}
        novel={coverTarget}
        onClose={() => setCoverTargetId(null)}
        onSave={(cover) => {
          if (coverTargetId !== null) updateCover(coverTargetId, cover);
          setCoverTargetId(null);
          setNotice('封面已更新');
        }}
      />

      <DeleteConfirmModal
        isOpen={deleteTargetId !== null}
        title={novels.find((novel) => novel.id === deleteTargetId)?.title || ''}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId !== null) moveToRecycle(deleteTargetId);
          setDeleteTargetId(null);
        }}
      />

      {renameTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setRenameTarget(null)}
        >
          <div className="w-[360px] rounded-xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <h3 className="mb-4 text-base font-bold text-gray-900">修改作品名称</h3>
            <input
              value={renameTarget.title}
              onChange={(event) => setRenameTarget({ ...renameTarget, title: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === 'Enter') confirmRename();
              }}
              className="mb-5 w-full rounded-md border border-gray-200 px-3 py-2 text-sm transition-colors focus:border-brand"
              autoFocus
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setRenameTarget(null)}
                className="px-4 py-2 text-sm text-gray-500 transition-colors hover:text-gray-700"
              >
                取消
              </button>
              <button
                onClick={confirmRename}
                className="rounded-lg bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand-dark"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
