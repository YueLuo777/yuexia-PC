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
import {
  HOTSPOT_ANALYSIS_PROMPT_CATEGORY as GENRE_ITERATION_PROMPT_CATEGORY,
  normalizePromptCategoryName,
  usePrompts,
} from '@/features/prompts/hooks/usePrompts';
import { GENRE_ITERATION_SAVE_DIRECTORY } from '@/features/genre-iteration/model/genreIterationDefaults';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';
import { CHAPTER_NUMBER_GRID_STYLE, ChapterNumberButton } from '@/shared/ui/ChapterNumberButton';

type CenterTab = 'detail' | 'reader';
type ExportFormat = 'TXT' | 'EPUB';

type ChapterPreview = {
  id: string;
  serialNumber: number;
  title: string;
  wordCount: number;
  content: string;
};

type SourceBook = {
  id: string;
  title: string;
  author: string;
  words: string;
  chapters: string;
  status: string;
  direction: string;
  tags: string[];
  hooks: string[];
  risk: string;
  intro: string;
  coverAccent: string;
  chapterList: ChapterPreview[];
};

const GENRE_ITERATION_MODEL_ID_STORAGE_KEY = 'xinyuexia_genre_iteration_model_id';
const GENRE_ITERATION_PROMPT_ID_STORAGE_KEY = 'xinyuexia_genre_iteration_prompt_id';

function createChapterList(prefix: string): ChapterPreview[] {
  return Array.from({ length: 7 }, (_, index) => {
    const serialNumber = index + 1;
    return {
      id: `${prefix}-${serialNumber}`,
      serialNumber,
      title: [
        '醒来就是死亡节点',
        '地下城入口的错误提示',
        '第一份误会报告',
        '被当成幕后黑手',
        '临时队友的危险试探',
        '隐藏规则浮出水面',
        '反向洗白失败',
      ][index],
      wordCount: 2600 + index * 180,
      content: `第 ${serialNumber} 章预览\n\n主角在新的规则里重新确认自己的处境：他不能照搬原剧情，也不能直接逃离地下城。每一次选择都会改变其他角色对他的判断，而这些误判会逐渐变成新的爽点。\n\n这一章主要展示“信息差 + 求生压力”的组合：读者知道主角只想活下去，但书中角色会把他的行动解读成更深的布局。后续题材迭代时，可以保留这种读者视角和角色视角错位的结构。`,
    };
  });
}

const sourceBooks: SourceBook[] = [
  {
    id: '7601032456199736382',
    title: '什么叫我洗白后，她们全部黑化了',
    author: '黑暗加鲁鲁兽',
    words: '59.7 万字',
    chapters: '251 章',
    status: '连载中',
    direction: '反派求生 / 地下城 / 误会流',
    tags: ['高死亡压力', '信息差反转', '关系黑化', '地下城阶段目标'],
    hooks: ['必死反派求生', '误会流推进关系', '地下城阶段目标', '洗白失败反成黑化'],
    risk: '不要复刻原书人物关系、具体地下城事件和章节推进顺序。',
    intro: '主角穿进日式西幻 galgame，成为原作里死亡路线最多的反派角色，只能依靠信息差和求生策略逃离结局。',
    coverAccent: 'from-slate-200 via-cyan-100 to-[#4d8fc8]',
    chapterList: createChapterList('wash-white'),
  },
  {
    id: '7658123944175619096',
    title: '必死反派的学院地下城生存指南',
    author: '少时诵诗书1988',
    words: '82.4 万字',
    chapters: '318 章',
    status: '已完结',
    direction: '学院 / 反派 / 副本求生',
    tags: ['学院秩序', '副本规则', '身份误判', '低开高走'],
    hooks: ['学院训练课', '副本规则拆解', '身份误判', '路人反派逆转'],
    risk: '把学院、副本和误判机制换成月下自己的设定骨架。',
    intro: '路人反派开局被丢进地下城训练课，只能利用熟悉原作规则的优势，把必死节点改写成升级节点。',
    coverAccent: 'from-amber-100 via-sky-100 to-[#4c78b8]',
    chapterList: createChapterList('academy-dungeon'),
  },
  {
    id: '7585610797334678590',
    title: '这破游戏怎么还不能删档！',
    author: '一片五花肉干',
    words: '41.2 万字',
    chapters: '167 章',
    status: '连载中',
    direction: '游戏异界 / 循环 / 错误数据',
    tags: ['删档失败', '循环成长', '系统漏洞', '轻喜剧吐槽'],
    hooks: ['删档失败', '死亡回档', '错误数据成长', '系统漏洞爽点'],
    risk: '保留循环爽点即可，避免照搬游戏系统名和关键关卡。',
    intro: '玩家被困在测试服，死亡回到角色创建界面，但每一次错误数据都会悄悄改变世界规则。',
    coverAccent: 'from-rose-100 via-slate-100 to-[#6c7aa8]',
    chapterList: createChapterList('broken-game'),
  },
];

const centerTabs = [
  { id: 'detail', label: '详情页', icon: FileText },
  { id: 'reader', label: '在线阅读', icon: BookOpen },
] satisfies Array<{ id: CenterTab; label: string; icon: LucideIcon }>;

const iterationOutline = [
  ['核心爽点', '保留“明知会死但能提前拆局”的压力，把读者期待集中到每章如何反转死局。'],
  ['月下迁移', '把地下城换成“题材试炼场”：每次进入都能抽取热门题材规则，并生成可写设定卡。'],
  ['主角定位', '从反派求生改成“被系统误判成题材污染源”的写作者，天然贴合月下创作工具。'],
  ['开篇钩子', '主角刚导入一本番茄热书，月下系统提示：检测到 1380 个死亡节点，是否开始题材净化？'],
];

function readStoredValue(key: string) {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function writeStoredValue(key: string, value: string) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    // Ignore storage failures in restricted preview contexts.
  }
}

function normalizeSearchText(value: string) {
  return value.trim().toLowerCase();
}

function getSearchTokens(rawQuery: string) {
  return normalizeSearchText(rawQuery)
    .split(/[\s,，;；|/]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function bookMatchesQuery(book: SourceBook, rawQuery: string) {
  const query = normalizeSearchText(rawQuery);
  if (!query) return true;
  const directId = query.match(/\d{8,}/)?.[0];
  if (directId && book.id.includes(directId)) return true;
  const haystack = normalizeSearchText(
    [book.id, book.title, book.author, book.direction, book.intro, ...book.tags, ...book.hooks].join(' '),
  );
  const tokens = getSearchTokens(query.replace(/^https?:\/\/\S+/i, directId ?? query));
  return tokens.length > 0 && tokens.every((token) => haystack.includes(token));
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-slate-100 bg-white shadow-sm ${className}`}>{children}</section>;
}

function SectionTitle({ icon: Icon, title, extra }: { icon: LucideIcon; title: string; extra?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-light text-brand">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="truncate text-base font-black text-slate-900">{title}</h2>
      </div>
      {extra && (
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">{extra}</span>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-bold text-slate-400">{label}</div>
      <div className="mt-2 min-w-0 break-all text-lg font-black leading-6 text-slate-900">{value}</div>
    </div>
  );
}

function FormatButton({ value, active, onClick }: { value: ExportFormat; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'h-8 rounded-lg border px-4 text-xs font-black',
        active
          ? 'border-[#BDEEF7] bg-[#E7F8FD] text-brand'
          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
      ].join(' ')}
    >
      {value}
    </button>
  );
}

function outputPath(book: SourceBook, format: ExportFormat) {
  return `${GENRE_ITERATION_SAVE_DIRECTORY}\\${book.title}.${format.toLowerCase()}`;
}

function BookCover({ book, compact = false }: { book: SourceBook; compact?: boolean }) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${book.coverAccent} shadow-sm ${compact ? 'h-20 w-14' : 'h-44 w-32'}`}
    >
      <div className="absolute inset-x-2 top-2 h-12 rounded-full bg-white/50 blur-xl" />
      <div className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-white/65 text-brand shadow-sm">
        <BookOpen className="h-4 w-4" />
      </div>
      <div className="absolute inset-x-2 top-12 rounded-lg bg-white/25 px-2 py-1">
        <div className="line-clamp-2 text-[10px] font-black leading-3 text-slate-900">{book.author}</div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 bg-slate-950/75 ${compact ? 'p-1.5' : 'p-3'}`}>
        <div
          className={`${compact ? 'text-[10px] leading-3' : 'text-sm leading-5'} line-clamp-2 font-black text-white`}
        >
          {book.title}
        </div>
        {!compact && <div className="mt-1 truncate text-[11px] font-bold text-cyan-100">{book.direction}</div>}
      </div>
    </div>
  );
}

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

  const genreIterationPrompts = useMemo(
    () => prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === GENRE_ITERATION_PROMPT_CATEGORY),
    [prompts],
  );
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
          onPromptManage={() => navigate(`/prompts?category=${encodeURIComponent(GENRE_ITERATION_PROMPT_CATEGORY)}`)}
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
