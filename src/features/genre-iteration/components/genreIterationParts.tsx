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
import { GENRE_ITERATION_SAVE_DIRECTORY } from '@/features/genre-iteration/model/genreIterationDefaults';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';
import { CHAPTER_NUMBER_GRID_STYLE, ChapterNumberButton } from '@/shared/ui/ChapterNumberButton';

export type CenterTab = 'detail' | 'reader';
export type ExportFormat = 'TXT' | 'EPUB';

export type ChapterPreview = {
  id: string;
  serialNumber: number;
  title: string;
  wordCount: number;
  content: string;
};

export type SourceBook = {
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

export const GENRE_ITERATION_MODEL_ID_STORAGE_KEY = 'xinyuexia_genre_iteration_model_id';
export const GENRE_ITERATION_PROMPT_ID_STORAGE_KEY = 'xinyuexia_genre_iteration_prompt_id';

export function createChapterList(prefix: string): ChapterPreview[] {
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

export const sourceBooks: SourceBook[] = [
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

export const centerTabs = [
  { id: 'detail', label: '详情页', icon: FileText },
  { id: 'reader', label: '在线阅读', icon: BookOpen },
] satisfies Array<{ id: CenterTab; label: string; icon: LucideIcon }>;

export const iterationOutline = [
  ['核心爽点', '保留“明知会死但能提前拆局”的压力，把读者期待集中到每章如何反转死局。'],
  ['月下迁移', '把地下城换成“题材试炼场”：每次进入都能抽取热门题材规则，并生成可写设定卡。'],
  ['主角定位', '从反派求生改成“被系统误判成题材污染源”的写作者，天然贴合月下创作工具。'],
  ['开篇钩子', '主角刚导入一本番茄热书，月下系统提示：检测到 1380 个死亡节点，是否开始题材净化？'],
];

export function readStoredValue(key: string) {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

export function writeStoredValue(key: string, value: string) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    // Ignore storage failures in restricted preview contexts.
  }
}

export function normalizeSearchText(value: string) {
  return value.trim().toLowerCase();
}

export function getSearchTokens(rawQuery: string) {
  return normalizeSearchText(rawQuery)
    .split(/[\s,，;；|/]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

export function bookMatchesQuery(book: SourceBook, rawQuery: string) {
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

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-slate-100 bg-white shadow-sm ${className}`}>{children}</section>;
}

export function SectionTitle({ icon: Icon, title, extra }: { icon: LucideIcon; title: string; extra?: string }) {
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

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-bold text-slate-400">{label}</div>
      <div className="mt-2 min-w-0 break-all text-lg font-black leading-6 text-slate-900">{value}</div>
    </div>
  );
}

export function FormatButton({
  value,
  active,
  onClick,
}: {
  value: ExportFormat;
  active: boolean;
  onClick: () => void;
}) {
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

export function outputPath(book: SourceBook, format: ExportFormat) {
  return `${GENRE_ITERATION_SAVE_DIRECTORY}\\${book.title}.${format.toLowerCase()}`;
}

export function BookCover({ book, compact = false }: { book: SourceBook; compact?: boolean }) {
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
