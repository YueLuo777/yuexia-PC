import { Archive, BookOpen, Clock3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useNovelLibrary } from '@/features/novels/hooks/useNovelLibrary';
import type { WorkType } from '@/features/novels/model/novelTypes';
import { readWritingSummary, WRITING_STATS_UPDATED_EVENT } from '@/shared/stats/writingStats';

type DashboardSectionId = 'welcome' | 'recent' | 'stats';

interface DashboardSection {
  id: DashboardSectionId;
  label: string;
  visible: boolean;
}

const DASHBOARD_SECTIONS_KEY = 'xinyuexia_dashboard_sections_v1';
const USER_NAME_KEY = 'xinyuexia_sidebar_user_name';
const USER_NAME_UPDATED_EVENT = 'xinyuexia_user_name_updated';
const DEFAULT_SECTIONS: DashboardSection[] = [
  { id: 'welcome', label: '欢迎区', visible: true },
  { id: 'recent', label: '最近编辑', visible: true },
  { id: 'stats', label: '统计概览', visible: true },
];

const SECTION_IDS = new Set<DashboardSectionId>(DEFAULT_SECTIONS.map((section) => section.id));

function loadSections() {
  try {
    const raw = localStorage.getItem(DASHBOARD_SECTIONS_KEY);
    if (!raw) return DEFAULT_SECTIONS;
    const parsed = JSON.parse(raw) as DashboardSection[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_SECTIONS;
    const validSections = parsed.filter((section): section is DashboardSection => SECTION_IDS.has(section.id as DashboardSectionId));
    return validSections.length > 0 ? validSections : DEFAULT_SECTIONS;
  } catch {
    return DEFAULT_SECTIONS;
  }
}

function readUserName() {
  return localStorage.getItem(USER_NAME_KEY) || '月下作者';
}

function formatWords(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value);
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { novels, stats, selectNovel } = useNovelLibrary();
  const [sections] = useState<DashboardSection[]>(loadSections);
  const [userName, setUserName] = useState(readUserName);
  const [writingSummary, setWritingSummary] = useState(readWritingSummary);

  const recentNovels = [...novels]
    .sort((a, b) => String(b.lastModifiedAt ?? '').localeCompare(String(a.lastModifiedAt ?? ''), 'zh-CN'))
    .slice(0, 4);
  const latestNovel = recentNovels[0] ?? null;
  const novelWordCount = useMemo(
    () => novels.filter((novel) => novel.type === 'novel').reduce((sum, novel) => sum + novel.wordCount, 0),
    [novels],
  );

  const openNovel = (novelId: number, type: WorkType) => {
    selectNovel(novelId);
    navigate(type === 'script' ? '/script-editor-v2' : '/workbench');
  };

  useEffect(() => {
    const updateUserName = () => setUserName(readUserName());
    window.addEventListener(USER_NAME_UPDATED_EVENT, updateUserName);
    window.addEventListener('storage', updateUserName);
    return () => {
      window.removeEventListener(USER_NAME_UPDATED_EVENT, updateUserName);
      window.removeEventListener('storage', updateUserName);
    };
  }, []);

  useEffect(() => {
    const updateWritingSummary = () => setWritingSummary(readWritingSummary());
    window.addEventListener(WRITING_STATS_UPDATED_EVENT, updateWritingSummary);
    window.addEventListener('storage', updateWritingSummary);
    return () => {
      window.removeEventListener(WRITING_STATS_UPDATED_EVENT, updateWritingSummary);
      window.removeEventListener('storage', updateWritingSummary);
    };
  }, []);

  const visibleSections = useMemo(() => sections.filter((section) => section.visible), [sections]);
  const showDashboardCards = visibleSections.some((section) => section.id === 'welcome' || section.id === 'stats' || section.id === 'recent');

  return (
    <main className="relative flex-1 overflow-y-auto bg-white px-8 py-7">
      {showDashboardCards && (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="flex min-h-[184px] flex-col rounded-[8px] border border-[#dfe5ec] bg-[#f7faff] px-5 py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#6b7b8d]">欢迎回来，{userName}</p>
                <h2 className="mt-2 truncate text-[24px] font-bold text-[#16518f]">我的小说</h2>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#eaf2ff] text-[#1e71ef]">
                <BookOpen className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-5 grid gap-2 text-[13px] font-medium text-[#586574]">
              <div className="flex items-center justify-between gap-3">
                <span>作品</span>
                <strong className="text-[#1f2933]">{stats.novelCount} 本</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>昨日更新</span>
                <strong className="text-[#1f2933]">{formatWords(writingSummary.yesterdayWords)} 字</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>字数</span>
                <strong className="text-[#1f2933]">{formatWords(novelWordCount)} 字</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>预留</span>
                <strong className="text-[#9aa3af]">--</strong>
              </div>
            </div>
          </article>

          <button
            type="button"
            onClick={() => navigate('/novels')}
            className="flex min-h-[184px] flex-col rounded-[8px] border border-[#dfe5ec] bg-white px-5 py-5 text-left transition-colors hover:border-[#b8caef] hover:bg-[#f6f9ff]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#6b7b8d]">作品入口</p>
                <h2 className="mt-2 truncate text-[24px] font-bold text-[#1f2933]">作品整理</h2>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#f2f5f8] text-[#586574]">
                <Archive className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-5 text-[14px] font-medium leading-6 text-[#586574]">整理小说、分类、封面和导入作品。</p>
            <span className="mt-auto text-[13px] font-semibold text-[#1e71ef]">进入作品整理</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (latestNovel) openNovel(latestNovel.id, latestNovel.type);
              else navigate('/novels');
            }}
            className="flex min-h-[184px] flex-col rounded-[8px] border border-[#dfe5ec] bg-white px-5 py-5 text-left transition-colors hover:border-[#b8caef] hover:bg-[#f6f9ff]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#6b7b8d]">快速进入</p>
                <h2 className="mt-2 truncate text-[24px] font-bold text-[#1f2933]">最近编辑</h2>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#fff4e5] text-[#d97706]">
                <Clock3 className="h-5 w-5" />
              </span>
            </div>
            {latestNovel ? (
              <div className="mt-5 min-w-0">
                <span className="block truncate text-[16px] font-semibold text-[#1f2933]">{latestNovel.title}</span>
                <span className="mt-2 block truncate text-[13px] font-medium text-[#9aa3af]">
                  {latestNovel.type === 'script' ? '剧本' : '小说'} · {latestNovel.lastModifiedAt ?? latestNovel.createdAt}
                </span>
              </div>
            ) : (
              <p className="mt-5 text-[14px] font-medium text-[#9aa3af]">暂无最近编辑的作品</p>
            )}
            <span className="mt-auto text-[13px] font-semibold text-[#1e71ef]">{latestNovel ? '继续编辑' : '先创建作品'}</span>
          </button>

          <article className="flex min-h-[184px] flex-col rounded-[8px] border border-dashed border-[#d7dce4] bg-[#fbfbfc] px-5 py-5">
            <p className="text-[13px] font-medium text-[#9aa3af]">预留</p>
            <h2 className="mt-2 truncate text-[24px] font-bold text-[#68727f]">扩展卡片</h2>
            <p className="mt-5 text-[14px] font-medium leading-6 text-[#9aa3af]">后续可以放灵感、待办、今日目标或资料提醒。</p>
          </article>
        </section>
      )}
    </main>
  );
}
