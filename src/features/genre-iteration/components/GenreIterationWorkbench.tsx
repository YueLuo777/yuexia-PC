import { useMemo, useState, type ReactNode } from 'react';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  FolderOpen,
  Library,
  ListChecks,
  Search,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useModels } from '@/features/models/hooks/useModels';
import { usePrompts } from '@/features/prompts/hooks/usePrompts';
import { GENRE_ITERATION_SAVE_DIRECTORY } from '@/features/genre-iteration/model/genreIterationDefaults';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';
import { CHAPTER_NUMBER_GRID_STYLE, ChapterNumberButton } from '@/shared/ui/ChapterNumberButton';
import {
  CenterTab,
  ExportFormat,
  ChapterPreview,
  SourceBook,
  GENRE_ITERATION_MODEL_ID_STORAGE_KEY,
  GENRE_ITERATION_PROMPT_ID_STORAGE_KEY,
  createChapterList,
  sourceBooks,
  centerTabs,
  iterationOutline,
  readStoredValue,
  writeStoredValue,
  normalizeSearchText,
  getSearchTokens,
  bookMatchesQuery,
  Panel,
  SectionTitle,
  StatCard,
  FormatButton,
  outputPath,
  BookCover,
} from '@/features/genre-iteration/components/genreIterationParts';

export function GenreIterationWorkbench() {
  const navigate = useNavigate();
  const { models } = useModels();
  const { prompts } = usePrompts();
  const [centerTab, setCenterTab] = useState<CenterTab>('detail');
  const [activeBookId, setActiveBookId] = useState(sourceBooks[0].id);
  const [activeChapterId, setActiveChapterId] = useState(sourceBooks[0].chapterList[0].id);
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('TXT');
  const [shelfIds, setShelfIds] = useState<string[]>([]);
  const [historyItems, setHistoryItems] = useState<Array<{ id: string; title: string; path: string; status: string }>>(
    [],
  );
  const [iterationText, setIterationText] = useState('');
  const [status, setStatus] = useState('输入关键词、链接或书籍编号后开始检索');
  const [genreIterationModelId, setGenreIterationModelId] = useState(() =>
    readStoredValue(GENRE_ITERATION_MODEL_ID_STORAGE_KEY),
  );
  const [genreIterationPromptId, setGenreIterationPromptId] = useState(() =>
    readStoredValue(GENRE_ITERATION_PROMPT_ID_STORAGE_KEY),
  );

  const genreIterationPrompts = prompts;
  const genreIterationModel = useMemo(
    () => models.find((model) => model.id === genreIterationModelId) ?? models[0] ?? null,
    [genreIterationModelId, models],
  );
  const activeGenreIterationPromptId = useMemo(
    () =>
      genreIterationPrompts.some((prompt) => prompt.id === genreIterationPromptId)
        ? genreIterationPromptId
        : (genreIterationPrompts[0]?.id ?? ''),
    [genreIterationPromptId, genreIterationPrompts],
  );

  const filteredBooks = useMemo(() => {
    if (!hasSearched) return [];
    return sourceBooks.filter((book) => bookMatchesQuery(book, query));
  }, [hasSearched, query]);

  const activeBook = useMemo(
    () => sourceBooks.find((book) => book.id === activeBookId) ?? filteredBooks[0] ?? sourceBooks[0],
    [activeBookId, filteredBooks],
  );
  const activeChapter =
    activeBook.chapterList.find((chapter) => chapter.id === activeChapterId) ?? activeBook.chapterList[0];
  const shelfBooks = sourceBooks.filter((book) => shelfIds.includes(book.id));

  const setGenreIterationModelIdWithStorage = (nextModelId: string) => {
    setGenreIterationModelId(nextModelId);
    writeStoredValue(GENRE_ITERATION_MODEL_ID_STORAGE_KEY, nextModelId);
  };

  const setGenreIterationPromptIdWithStorage = (nextPromptId: string) => {
    setGenreIterationPromptId(nextPromptId);
    writeStoredValue(GENRE_ITERATION_PROMPT_ID_STORAGE_KEY, nextPromptId);
  };

  const selectBook = (book: SourceBook) => {
    setActiveBookId(book.id);
    setActiveChapterId(book.chapterList[0].id);
    setCenterTab('detail');
    setStatus(`已选中：${book.title}`);
  };

  const runSearch = () => {
    setHasSearched(true);
    const nextResults = sourceBooks.filter((book) => bookMatchesQuery(book, query));
    if (nextResults[0]) selectBook(nextResults[0]);
    setStatus(nextResults.length > 0 ? `共找到 ${nextResults.length} 条结果` : '暂无结果');
  };

  const loadSample = () => {
    setQuery('https://fanqienovel.com/page/7601032456199736382');
    setHasSearched(true);
    selectBook(sourceBooks[0]);
    setStatus('已载入示例链接，后续可接入 Tomato-Novel-Downloader 搜索接口');
  };

  const addToShelf = (book: SourceBook) => {
    setShelfIds((current) => (current.includes(book.id) ? current : [...current, book.id]));
    setStatus(`已加入书架：${book.title}`);
  };

  const startDownload = (book: SourceBook) => {
    setHistoryItems((current) => [
      { id: `${book.id}-${Date.now()}`, title: book.title, path: outputPath(book, format), status: '已创建' },
      ...current,
    ]);
    setStatus(`已创建下载任务：${book.title}`);
  };

  const clearCache = (book: SourceBook) => {
    setStatus(`已清除缓存：${book.title}`);
  };

  const copyBookId = (book: SourceBook) => {
    void navigator.clipboard?.writeText(book.id);
    setStatus(`已复制书籍 ID：${book.id}`);
  };

  const generateIteration = (book: SourceBook) => {
    setIterationText(iterationOutline.map(([title, body]) => `${title}：${body}`).join('\n\n'));
    setStatus(`已生成题材迭代草案：${book.title}`);
  };

  const openReader = () => {
    setCenterTab('reader');
    setStatus(`正在在线预览：${activeBook.title}`);
  };

  const renderSearchLeftPanel = () => (
    <Panel className="flex min-h-0 flex-col">
      <div className="border-b border-slate-100 p-4">
        <SectionTitle icon={Search} title="搜索区域" extra={`${filteredBooks.length} 本`} />
        <div className="mt-3 flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-slate-300" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') runSearch();
            }}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-300"
            placeholder="搜索关键词、链接或书籍编号"
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={runSearch} className="xy-wa-primary h-9 rounded-lg px-4 text-sm font-black">
            搜索
          </button>
          <button
            type="button"
            onClick={loadSample}
            className="xy-capsule-button justify-center bg-white text-slate-600"
          >
            载入
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {filteredBooks.length === 0 ? (
          <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm font-semibold text-slate-400">
            {hasSearched ? '暂无结果。' : '输入后开始检索'}
          </div>
        ) : (
          filteredBooks.map((book) => {
            const active = book.id === activeBook.id;
            return (
              <button
                key={book.id}
                type="button"
                onClick={() => selectBook(book)}
                className={[
                  'w-full rounded-lg border p-3 text-left transition-colors',
                  active
                    ? 'border-[#BDEEF7] bg-[#E7F8FD] text-slate-900'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50',
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  <BookCover book={book} compact />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black">{book.title}</div>
                    <div className="mt-1 min-w-0 truncate text-xs font-semibold text-slate-400" title={`ID ${book.id}`}>
                      {book.author} · ID {book.id}
                    </div>
                    <div className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{book.intro}</div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </Panel>
  );

  const renderDirectoryLeftPanel = () => (
    <Panel className="flex min-h-0 flex-col">
      <div className="border-b border-slate-100 p-4">
        <div className="mb-4 flex h-12 items-center justify-between rounded-xl border border-[#BDEEF7] bg-[#E7F8FD] px-4">
          <div className="flex min-w-0 items-center gap-2">
            <FolderOpen className="h-5 w-5 shrink-0 text-brand" />
            <span className="truncate text-base font-black text-slate-900">第一卷</span>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-slate-500">
            {activeBook.chapterList.length}章
          </span>
        </div>
        <div className="grid gap-3" style={CHAPTER_NUMBER_GRID_STYLE}>
          {activeBook.chapterList.map((chapter) => (
            <ChapterNumberButton
              key={chapter.id}
              selected={chapter.id === activeChapter.id}
              state="empty"
              title={`第${chapter.serialNumber}章 ${chapter.title}`}
              onClick={() => {
                setActiveChapterId(chapter.id);
                setCenterTab('reader');
                setStatus(`正在预览：第${chapter.serialNumber}章 ${chapter.title}`);
              }}
            >
              {chapter.serialNumber}
            </ChapterNumberButton>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm leading-6 text-slate-500">
        点击数字序号后，中间区域会显示对应章节预览。目录样式复用剧情审核里的章节序号按钮。
      </div>
    </Panel>
  );

  const renderDetail = () => (
    <div className="min-h-0 flex-1 overflow-y-auto p-5">
      <div className="flex items-start gap-5 rounded-xl border border-slate-100 bg-slate-50 p-5">
        <BookCover book={activeBook} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-black text-slate-900">{activeBook.title}</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">作者：{activeBook.author}</p>
            </div>
            <span className="rounded-full bg-[#E7F8FD] px-3 py-1 text-xs font-black text-brand">
              {activeBook.status}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <StatCard label="字数" value={activeBook.words} />
            <StatCard label="章节" value={activeBook.chapters} />
            <StatCard label="书籍 ID" value={activeBook.id} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {activeBook.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-sm">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-slate-100 bg-white p-4">
            <div className="text-sm font-black text-slate-900">简介</div>
            <p className="mt-2 text-sm leading-7 text-slate-600">{activeBook.intro}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReader = () => (
    <div className="min-h-0 flex-1 overflow-y-auto p-5">
      <article className="min-h-full rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="min-w-0">
            <div className="text-xs font-black text-brand">在线预览</div>
            <h2 className="mt-1 truncate text-2xl font-black text-slate-900">
              第{activeChapter.serialNumber}章 {activeChapter.title}
            </h2>
            <p className="mt-2 text-xs font-semibold text-slate-400">
              {activeBook.title} · {activeChapter.wordCount} 字
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">预览</span>
        </div>
        <pre className="mt-5 whitespace-pre-wrap text-base font-medium leading-9 text-slate-700">
          {activeChapter.content}
        </pre>
      </article>
    </div>
  );

  const renderCenterPanel = () => (
    <Panel className="flex min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
        <div className="flex items-center gap-2">
          {centerTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'reader') openReader();
                  else setCenterTab('detail');
                }}
                className={[
                  'flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-black transition-colors',
                  centerTab === tab.id ? 'bg-[#E7F8FD] text-brand' : 'text-slate-500 hover:bg-slate-50',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="truncate text-xs font-semibold text-slate-400">
          {centerTab === 'reader' ? '左侧已切换为目录' : '左侧为搜索区域'}
        </div>
      </div>
      {centerTab === 'detail' ? renderDetail() : renderReader()}
    </Panel>
  );

  const renderRightPanel = () => (
    <Panel className="flex min-h-0 flex-col">
      <div className="border-b border-slate-100 p-4">
        <SectionTitle icon={Sparkles} title="题材迭代" extra="输出区" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="text-sm font-black text-slate-900">下载与保存</div>
          <div className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-bold leading-5 text-slate-500">
            {GENRE_ITERATION_SAVE_DIRECTORY}
          </div>
          <div className="mt-3 flex gap-2">
            <FormatButton value="TXT" active={format === 'TXT'} onClick={() => setFormat('TXT')} />
            <FormatButton value="EPUB" active={format === 'EPUB'} onClick={() => setFormat('EPUB')} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => startDownload(activeBook)}
              className="xy-wa-primary h-9 rounded-lg px-4 text-sm font-black"
            >
              开始下载
            </button>
            <button
              type="button"
              onClick={() => addToShelf(activeBook)}
              className="xy-capsule-button justify-center bg-white text-slate-600"
            >
              加入书架
            </button>
            <button
              type="button"
              onClick={() => copyBookId(activeBook)}
              className="xy-capsule-button justify-center bg-white text-slate-600"
            >
              复制 ID
            </button>
            <button
              type="button"
              onClick={() => clearCache(activeBook)}
              className="xy-capsule-button justify-center bg-white text-slate-600"
            >
              清除缓存
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
          <SectionTitle icon={ListChecks} title="可迁移爽点" />
          <div className="mt-3 space-y-2">
            {activeBook.hooks.map((hook) => (
              <div
                key={hook}
                className="flex items-center gap-2 rounded-lg bg-[#EAF9FD] px-3 py-2 text-sm font-bold text-slate-700"
              >
                <CheckCircle2 className="h-4 w-4 text-brand" />
                {hook}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
          <div className="text-sm font-black text-slate-900">规避提醒</div>
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-3 text-sm font-semibold leading-6 text-amber-800">
            {activeBook.risk}
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-black text-slate-900">迭代方案</div>
            <button
              type="button"
              onClick={() => generateIteration(activeBook)}
              className="xy-wa-primary h-8 rounded-lg px-3 text-xs font-black"
            >
              生成迭代
            </button>
          </div>
          {iterationText ? (
            <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-[#BDEEF7] bg-[#F8FDFF] p-3 text-sm font-semibold leading-7 text-slate-700">
              {iterationText}
            </pre>
          ) : (
            <div className="mt-3 space-y-2">
              {iterationOutline.map(([title, body]) => (
                <div key={title} className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs font-black text-slate-900">{title}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{body}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {historyItems.length > 0 && (
          <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
            <div className="text-sm font-black text-slate-900">下载记录</div>
            <div className="mt-3 space-y-2">
              {historyItems.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-lg bg-slate-50 px-3 py-2">
                  <div className="truncate text-xs font-black text-slate-700">{item.title}</div>
                  <div className="mt-1 truncate text-[11px] font-semibold text-slate-400">{item.path}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {shelfBooks.length > 0 && (
          <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
            <div className="text-sm font-black text-slate-900">书架</div>
            <div className="mt-3 text-xs font-semibold text-slate-500">已加入 {shelfBooks.length} 本</div>
          </div>
        )}
      </div>
      <div className="border-t border-slate-100 p-4">
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold leading-5 text-slate-500">
          输出路径：{outputPath(activeBook, format)}
        </div>
      </div>
    </Panel>
  );

  return (
    <div className="writer-assistant-theme flex h-full min-h-0 flex-col bg-[#f5f5f7] text-slate-900">
      <header className="flex min-h-[76px] shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-light text-brand">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black text-slate-900">题材迭代</h1>
            <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
              搜索番茄小说，查看详情或按目录在线预览章节
            </p>
          </div>
        </div>
        <CombinedAiConfigSelect
          className="w-[312px] shrink-0"
          modelValue={genreIterationModel?.id ?? ''}
          promptValue={activeGenreIterationPromptId}
          modelOptions={
            models.length === 0
              ? [{ value: '', label: '暂无可用模型', disabled: true }]
              : models.map((model) => ({ value: model.id, label: model.name }))
          }
          promptOptions={
            genreIterationPrompts.length === 0
              ? [{ value: '', label: '无可用提示词', disabled: true }]
              : genreIterationPrompts.map((prompt) => ({ value: prompt.id, label: prompt.name }))
          }
          onModelChange={setGenreIterationModelIdWithStorage}
          onPromptChange={setGenreIterationPromptIdWithStorage}
          onModelManage={() => navigate('/model-manage')}
          onPromptManage={() => navigate('/prompts')}
        />
      </header>

      <div className="flex h-10 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 text-xs font-semibold text-slate-500">
        <span className="truncate">{status}</span>
        <span className="shrink-0">默认目录：{GENRE_ITERATION_SAVE_DIRECTORY}</span>
      </div>

      <main className="grid min-h-0 flex-1 grid-cols-[320px_minmax(480px,1fr)_380px] gap-4 overflow-hidden p-4">
        {centerTab === 'reader' ? renderDirectoryLeftPanel() : renderSearchLeftPanel()}
        {renderCenterPanel()}
        {renderRightPanel()}
      </main>
    </div>
  );
}
