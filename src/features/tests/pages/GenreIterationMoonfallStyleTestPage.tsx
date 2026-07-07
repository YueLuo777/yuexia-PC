import { useMemo, useState, type ReactNode } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  History,
  Library,
  ListChecks,
  Search,
  Settings,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import { GENRE_ITERATION_SAVE_DIRECTORY } from '@/features/genre-iteration/model/genreIterationDefaults';

type PanelKey = 'search' | 'shelf' | 'history' | 'settings';
type ExportFormat = 'TXT' | 'EPUB';

type SourceBook = {
  id: string;
  title: string;
  author: string;
  words: string;
  chapters: string;
  status: string;
  direction: string;
  hooks: string[];
  risk: string;
  intro: string;
};

const sourceBooks: SourceBook[] = [
  {
    id: '7601032456199736382',
    title: '什么叫我洗白后，她们全部黑化了',
    author: '黑暗加鲁鲁兽',
    words: '59.7 万字',
    chapters: '251 章',
    status: '连载中',
    direction: '反派求生 / 地下城 / 误会流',
    hooks: ['高死亡压力', '信息差反转', '关系黑化', '地下城阶段目标'],
    risk: '不要复刻原书人物关系、具体地下城事件和章节推进顺序。',
    intro: '主角穿进日式西幻 galgame，成为原作里死亡路线最多的反派角色，只能依靠信息差和求生策略逃离结局。',
  },
  {
    id: '7658123944175619096',
    title: '必死反派的学院地下城生存指南',
    author: '少时诵诗书1988',
    words: '82.4 万字',
    chapters: '318 章',
    status: '已完结',
    direction: '学院 / 反派 / 副本求生',
    hooks: ['学院秩序', '副本规则', '身份误判', '低开高走'],
    risk: '把学院、副本和误判机制换成月下自己的设定骨架。',
    intro: '路人反派开局被丢进地下城训练课，只能利用熟悉原作规则的优势，把必死节点改写成升级节点。',
  },
  {
    id: '7585610797334678590',
    title: '这破游戏怎么还不能删档！',
    author: '一片五花肉干',
    words: '41.2 万字',
    chapters: '167 章',
    status: '连载中',
    direction: '游戏异界 / 循环 / 错误数据',
    hooks: ['删档失败', '循环成长', '系统漏洞', '轻喜剧吐槽'],
    risk: '保留循环爽点即可，避免照搬游戏系统名和关键关卡。',
    intro: '玩家被困在测试服，死亡回到角色创建界面，但每一次错误数据都会悄悄改变世界规则。',
  },
];

const tabs = [
  { id: 'search', label: '搜索', icon: Search },
  { id: 'shelf', label: '书架', icon: Library },
  { id: 'history', label: '历史', icon: History },
  { id: 'settings', label: '设置', icon: Settings },
] satisfies Array<{ id: PanelKey; label: string; icon: LucideIcon }>;

const iterationOutline = [
  ['核心爽点', '保留“明知会死但能提前拆局”的压力，把读者期待集中到每章如何反转死局。'],
  ['月下迁移', '把地下城换成“题材试炼场”：每次进入都能抽取热门题材规则，并生成可写设定卡。'],
  ['主角定位', '从反派求生改成“被系统误判成题材污染源”的写作者，天然贴合月下创作工具。'],
  ['开篇钩子', '主角刚导入一本番茄热书，月下系统提示：检测到 1380 个死亡节点，是否开始题材净化？'],
];

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-slate-100 bg-white shadow-sm ${className}`}>
      {children}
    </section>
  );
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
      {extra && <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">{extra}</span>}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-bold text-slate-400">{label}</div>
      <div className="mt-2 text-lg font-black text-slate-900">{value}</div>
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
        active ? 'border-[#BDEEF7] bg-[#E7F8FD] text-brand' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
      ].join(' ')}
    >
      {value}
    </button>
  );
}

function outputPath(book: SourceBook, format: ExportFormat) {
  return `${GENRE_ITERATION_SAVE_DIRECTORY}\\${book.title}.${format.toLowerCase()}`;
}

export function GenreIterationMoonfallStyleTestPage() {
  const [activePanel, setActivePanel] = useState<PanelKey>('search');
  const [activeBookId, setActiveBookId] = useState(sourceBooks[0].id);
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('TXT');
  const [shelfIds, setShelfIds] = useState<string[]>([]);
  const [historyItems, setHistoryItems] = useState<Array<{ id: string; title: string; path: string; status: string }>>([]);
  const [enableLog, setEnableLog] = useState(false);
  const [iterationText, setIterationText] = useState('');
  const [status, setStatus] = useState('输入关键词、链接或书籍编号后开始检索');

  const filteredBooks = useMemo(() => {
    if (!hasSearched) return [];
    const keyword = query.trim();
    if (!keyword) return sourceBooks;
    const directId = keyword.match(/\d{8,}/)?.[0];
    return sourceBooks.filter((book) => (
      book.title.includes(keyword) ||
      book.author.includes(keyword) ||
      book.id.includes(directId || keyword) ||
      book.direction.includes(keyword) ||
      book.hooks.some((hook) => keyword.includes(hook) || hook.includes(keyword))
    ));
  }, [hasSearched, query]);

  const activeBook = useMemo(
    () => sourceBooks.find((book) => book.id === activeBookId) ?? filteredBooks[0] ?? sourceBooks[0],
    [activeBookId, filteredBooks],
  );
  const shelfBooks = sourceBooks.filter((book) => shelfIds.includes(book.id));

  const runSearch = () => {
    setHasSearched(true);
    const keyword = query.trim();
    const nextResults = keyword
      ? sourceBooks.filter((book) => (
        book.title.includes(keyword) ||
        book.author.includes(keyword) ||
        book.id.includes(keyword.match(/\d{8,}/)?.[0] || keyword) ||
        keyword.includes(book.id) ||
        book.direction.includes(keyword)
      ))
      : sourceBooks;
    if (nextResults[0]) setActiveBookId(nextResults[0].id);
    setStatus(nextResults.length > 0 ? `共找到 ${nextResults.length} 条结果` : '暂无结果');
  };

  const loadSample = () => {
    setQuery('https://fanqienovel.com/page/7601032456199736382');
    setHasSearched(true);
    setActiveBookId(sourceBooks[0].id);
    setStatus('已载入示例链接，后续可接入 Tomato-Novel-Downloader 搜索接口');
  };

  const addToShelf = (book: SourceBook) => {
    setShelfIds((current) => current.includes(book.id) ? current : [...current, book.id]);
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

  const renderBookDetail = () => (
    <Panel className="flex min-h-0 flex-col">
      <div className="border-b border-slate-100 p-4">
        <SectionTitle icon={FileText} title="详情与操作" extra={activeBook.status} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-start gap-4">
            <div className="grid h-28 w-20 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-slate-100 to-cyan-100 text-brand">
              <BookOpen className="h-8 w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-black text-slate-900">{activeBook.title}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">{activeBook.author} · ID {activeBook.id}</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <StatCard label="字数" value={activeBook.words} />
                <StatCard label="章节" value={activeBook.chapters} />
                <StatCard label="导出" value={format} />
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">{activeBook.intro}</p>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <SectionTitle icon={ListChecks} title="可迁移爽点" />
            <div className="mt-3 space-y-2">
              {activeBook.hooks.map((hook) => (
                <div key={hook} className="flex items-center gap-2 rounded-lg bg-[#EAF9FD] px-3 py-2 text-sm font-bold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-brand" />
                  {hook}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <SectionTitle icon={Library} title="规避提醒" />
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-3 text-sm font-semibold leading-6 text-amber-800">{activeBook.risk}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <FormatButton value="TXT" active={format === 'TXT'} onClick={() => setFormat('TXT')} />
              <FormatButton value="EPUB" active={format === 'EPUB'} onClick={() => setFormat('EPUB')} />
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
          <div className="text-xs font-bold text-slate-400">默认保存目录</div>
          <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">{GENRE_ITERATION_SAVE_DIRECTORY}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => startDownload(activeBook)} className="xy-wa-primary h-9 rounded-lg px-4 text-sm font-black">开始下载</button>
            <button type="button" onClick={() => addToShelf(activeBook)} className="xy-capsule-button bg-white text-slate-600">加入书架</button>
            <button type="button" onClick={() => generateIteration(activeBook)} className="xy-capsule-button bg-white text-slate-600">生成迭代</button>
            <button type="button" onClick={() => copyBookId(activeBook)} className="xy-capsule-button bg-white text-slate-600">复制 ID</button>
            <button type="button" onClick={() => clearCache(activeBook)} className="xy-capsule-button bg-white text-slate-600">清除缓存</button>
            <button type="button" className="xy-capsule-button bg-white text-slate-600">在线阅读</button>
          </div>
        </div>
      </div>
    </Panel>
  );

  const renderIterationPanel = () => (
    <Panel className="flex min-h-0 flex-col">
      <div className="border-b border-slate-100 p-4">
        <SectionTitle icon={Sparkles} title="迭代方案" extra="月下输出" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {iterationText ? (
          <pre className="whitespace-pre-wrap rounded-xl border border-[#BDEEF7] bg-[#F8FDFF] p-4 text-sm font-semibold leading-7 text-slate-700">{iterationText}</pre>
        ) : (
          <div className="space-y-3">
            {iterationOutline.map(([title, body]) => (
              <div key={title} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-sm font-black text-slate-900">{title}</div>
                <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="border-t border-slate-100 p-4">
        <div className="mb-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold leading-5 text-slate-500">
          输出路径：{outputPath(activeBook, format)}
        </div>
        <button type="button" onClick={() => generateIteration(activeBook)} className="xy-wa-primary h-9 w-full rounded-lg px-4 text-sm font-black">
          生成迭代
        </button>
      </div>
    </Panel>
  );

  const renderSearchPanel = () => (
    <div className="grid min-h-0 flex-1 grid-cols-[300px_minmax(420px,1fr)_380px] gap-4 overflow-hidden">
      <Panel className="flex min-h-0 flex-col">
        <div className="border-b border-slate-100 p-4">
          <SectionTitle icon={Search} title="素材检索" extra={`${filteredBooks.length} 本`} />
          <div className="mt-3 flex gap-2">
            <div className="flex h-10 min-w-0 flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 text-slate-300" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') runSearch();
                }}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-300"
                placeholder="关键词、链接或书籍编号"
              />
            </div>
            <button type="button" onClick={runSearch} className="xy-wa-primary h-10 rounded-lg px-4 text-sm font-black">搜索</button>
            <button type="button" onClick={loadSample} className="xy-capsule-button bg-white text-slate-600">载入</button>
          </div>
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {filteredBooks.length === 0 ? (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm font-semibold text-slate-400">
              {hasSearched ? '暂无结果。' : '输入后开始检索'}
            </div>
          ) : filteredBooks.map((book) => {
            const active = book.id === activeBook.id;
            return (
              <button
                key={book.id}
                type="button"
                onClick={() => setActiveBookId(book.id)}
                className={[
                  'w-full rounded-lg border p-3 text-left transition-colors',
                  active ? 'border-[#BDEEF7] bg-[#E7F8FD] text-slate-900' : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50',
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-14 w-11 shrink-0 place-items-center rounded-md bg-gradient-to-br from-slate-100 to-cyan-100 text-brand">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black">{book.title}</div>
                    <div className="mt-1 truncate text-xs font-semibold text-slate-400">{book.author} · {book.id}</div>
                    <div className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{book.direction}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Panel>
      {renderBookDetail()}
      {renderIterationPanel()}
    </div>
  );

  const renderShelfPanel = () => (
    <Panel className="min-h-0 flex-1 overflow-y-auto p-4">
      <SectionTitle icon={Library} title="书架" extra={`${shelfBooks.length} 本`} />
      {shelfBooks.length === 0 ? (
        <div className="mt-4 flex h-36 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm font-semibold text-slate-400">
          书架为空。搜索书籍后可添加到书架。
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
          {shelfBooks.map((book) => (
            <button key={book.id} type="button" onClick={() => { setActiveBookId(book.id); setActivePanel('search'); }} className="rounded-xl border border-slate-100 bg-white p-4 text-left shadow-sm hover:border-[#BDEEF7] hover:bg-[#F8FDFF]">
              <div className="text-base font-black text-slate-900">{book.title}</div>
              <div className="mt-1 text-xs font-semibold text-slate-400">{book.author} · {book.status}</div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{book.direction}</p>
            </button>
          ))}
        </div>
      )}
    </Panel>
  );

  const renderHistoryPanel = () => (
    <Panel className="min-h-0 flex-1 overflow-y-auto p-4">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle icon={History} title="历史" extra="本地下载记录" />
        <div className="flex gap-2">
          <button type="button" onClick={() => setStatus('历史记录已刷新')} className="xy-capsule-button bg-white text-slate-600">刷新</button>
          <button type="button" onClick={() => setHistoryItems([])} className="h-8 rounded-lg bg-red-50 px-4 text-xs font-black text-red-600">清空</button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <StatCard label="历史记录" value={historyItems.length} />
        <StatCard label="当前任务" value={0} />
        <StatCard label="文件仍存在" value={historyItems.length} />
        <StatCard label="文件缺失" value={0} />
      </div>
      <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
        {historyItems.length === 0 ? (
          <div className="py-6 text-center text-sm font-semibold text-slate-400">当前没有符合条件的历史记录。</div>
        ) : (
          <div className="space-y-2">
            {historyItems.map((item) => (
              <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_80px] gap-3 rounded-lg bg-white px-3 py-2 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-black text-slate-900">{item.title}</div>
                  <div className="mt-1 truncate text-xs font-semibold text-slate-400">{item.path}</div>
                </div>
                <div className="self-center rounded-full bg-[#E7F8FD] px-2 py-1 text-center text-xs font-black text-brand">{item.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );

  const renderSettingsPanel = () => (
    <Panel className="min-h-0 flex-1 overflow-y-auto p-4">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle icon={Settings} title="设置" extra="全局默认下载选项" />
        <button type="button" onClick={() => setStatus('设置已保存')} className="xy-wa-primary h-9 rounded-lg px-4 text-sm font-black">保存设置</button>
      </div>
      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <div className="text-sm font-black text-slate-900">默认保存目录</div>
        <div className="mt-3 flex gap-2">
          <button type="button" className="xy-capsule-button bg-white text-slate-600">选择目录</button>
          <div className="flex h-9 min-w-0 flex-1 items-center truncate rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
            {GENRE_ITERATION_SAVE_DIRECTORY}
          </div>
        </div>
        <div className="mt-4 text-sm font-black text-slate-900">默认导出格式</div>
        <div className="mt-3 flex gap-2">
          <FormatButton value="TXT" active={format === 'TXT'} onClick={() => setFormat('TXT')} />
          <FormatButton value="EPUB" active={format === 'EPUB'} onClick={() => setFormat('EPUB')} />
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
        <div className="text-sm font-black text-slate-900">诊断日志</div>
        <label className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-700">
          <input type="checkbox" checked={enableLog} onChange={(event) => setEnableLog(event.target.checked)} className="h-4 w-4 accent-brand" />
          启用安全诊断日志
        </label>
        <p className="mt-2 text-xs leading-5 text-slate-400">默认关闭。开启后日志保存在程序目录的 .log 文件夹，接口地址、参数、签名、Cookie、书籍/章节 ID 均会脱敏。</p>
      </div>
    </Panel>
  );

  return (
    <div className="writer-assistant-theme flex h-full min-h-0 flex-col bg-[#f5f5f7] text-slate-900">
      <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-light text-brand">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black text-slate-900">题材迭代 · 月下风格功能版</h1>
            <p className="mt-0.5 truncate text-xs font-medium text-slate-400">功能保持和正式题材迭代一致，只调整为月下软件布局</p>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActivePanel(tab.id)}
              className={[
                'h-9 rounded-lg px-4 text-sm font-black transition-colors',
                activePanel === tab.id ? 'bg-[#E7F8FD] text-brand' : 'bg-white text-slate-500 hover:bg-slate-50',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex h-10 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 text-xs font-semibold text-slate-500">
        <span className="truncate">{status}</span>
        <span className="shrink-0">默认目录：{GENRE_ITERATION_SAVE_DIRECTORY}</span>
      </div>

      <main className="flex min-h-0 flex-1 overflow-hidden p-4">
        {activePanel === 'search' && renderSearchPanel()}
        {activePanel === 'shelf' && renderShelfPanel()}
        {activePanel === 'history' && renderHistoryPanel()}
        {activePanel === 'settings' && renderSettingsPanel()}
      </main>
    </div>
  );
}
