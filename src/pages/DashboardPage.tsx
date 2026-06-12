import { BookOpen, ScrollText } from 'lucide-react';
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

  return (
    <main className="relative flex-1 overflow-y-auto bg-white px-8 py-7">
      <div className="grid gap-5 xl:grid-cols-[minmax(520px,1fr)_minmax(520px,1.25fr)]">
        {visibleSections.some((section) => section.id === 'welcome') && (
          <section className="relative min-h-[184px] overflow-hidden rounded-[8px] border border-[#dfe5ec] bg-[#e7eef7] px-12 py-8">
            <div className="absolute inset-0 opacity-75" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(207,222,240,0.6))' }} />
            <div className="absolute right-0 top-0 h-full w-1/2 opacity-45" style={{ background: 'radial-gradient(circle at 72% 18%, rgba(96,132,88,0.35), transparent 28%), linear-gradient(140deg, transparent 0 46%, rgba(30,113,239,0.08) 46% 54%, transparent 54%)' }} />
            <div className="relative">
              <p className="text-[14px] font-medium text-[#4f6e8e]">欢迎回来</p>
              <h1 className="mt-2 text-[34px] font-bold leading-tight text-[#16518f]">{userName}</h1>
              <p className="mt-4 text-[15px] font-medium text-[#4f6e8e]">继续维护你的原创作品、章节和资料库。</p>
            </div>
          </section>
        )}

        {visibleSections.some((section) => section.id === 'stats') && (
          <section className="min-h-[184px] rounded-[8px] border border-[#e6e8ec] bg-[#fbfbfc] px-7 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-[#1f2933]">写作概览</h2>
              <span className="text-[13px] font-medium text-[#9aa3af]">实时统计</span>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-3">
              {[
                ['昨日新增', writingSummary.yesterdayWords],
                ['本月新增', writingSummary.monthWords],
                ['总字数', stats.totalWords],
                ['作品总数', novels.length],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[8px] border border-[#e6e8ec] bg-white px-4 py-4">
                  <p className="text-[12px] text-[#9aa3af]">{label}</p>
                  <p className="mt-2 truncate text-[22px] font-semibold text-[#1f2933]">{formatWords(Number(value))}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {visibleSections.some((section) => section.id === 'recent') && (
        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-[#1f2933]">最近编辑</h2>
            <div className="flex gap-2">
              <button onClick={() => navigate('/novels')} className="h-8 rounded-md bg-[#1e71ef] px-4 text-sm font-medium text-white hover:bg-[#155ed1]">小说作品</button>
              <button onClick={() => navigate('/scripts')} className="h-8 rounded-md border border-[#dce1e8] bg-white px-4 text-sm font-medium text-[#586574] hover:border-[#1e71ef] hover:text-[#1e71ef]">短剧剧本</button>
            </div>
          </div>

          {recentNovels.length === 0 ? (
            <p className="rounded-[8px] border border-dashed border-[#d7dce4] bg-[#fbfbfc] py-12 text-center text-sm text-[#9aa3af]">暂无最近作品</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
              {recentNovels.map((novel) => (
                <button
                  key={novel.id}
                  onClick={() => openNovel(novel.id, novel.type)}
                  className="flex h-[86px] items-center gap-3 rounded-[8px] border border-[#e6e8ec] bg-white px-4 text-left transition-colors hover:border-[#b8caef] hover:bg-[#f6f9ff]"
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] ${novel.type === 'script' ? 'bg-[#fff4e5] text-[#d97706]' : 'bg-[#eaf2ff] text-[#1e71ef]'}`}>
                    {novel.type === 'script' ? <ScrollText className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium text-[#1f2933]">{novel.title}</span>
                    <span className="mt-1 block truncate text-[12px] text-[#9aa3af]">{novel.lastModifiedAt ?? novel.createdAt}</span>
                  </span>
                  <span className="shrink-0 text-[12px] font-medium text-[#9aa3af]">{novel.type === 'script' ? '剧本' : '小说'}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
