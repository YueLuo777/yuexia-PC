import { BookOpen, MoveDown, MoveUp, RotateCcw, ScrollText, SlidersHorizontal, X } from 'lucide-react';
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

function saveSections(sections: DashboardSection[]) {
  localStorage.setItem(DASHBOARD_SECTIONS_KEY, JSON.stringify(sections));
}

function readUserName() {
  return localStorage.getItem(USER_NAME_KEY) || '月下作者';
}

function formatWords(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value);
}

function SettingsModal({
  isOpen,
  sections,
  onClose,
  onChange,
  onReset,
}: {
  isOpen: boolean;
  sections: DashboardSection[];
  onClose: () => void;
  onChange: (next: DashboardSection[]) => void;
  onReset: () => void;
}) {
  if (!isOpen) return null;

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="flex w-[520px] max-w-[92vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">工作台卡片设置</h2>
            <p className="mt-0.5 text-xs text-slate-400">调整首页模块的显示和顺序。</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 p-6">
          {sections.map((section, index) => (
            <div key={section.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-800">{section.label}</div>
                <div className="text-xs text-slate-400">{section.visible ? '当前显示' : '当前隐藏'}</div>
              </div>
              <button onClick={() => move(index, -1)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-white" title="上移">
                <MoveUp className="h-4 w-4" />
              </button>
              <button onClick={() => move(index, 1)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-white" title="下移">
                <MoveDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => onChange(sections.map((item) => (item.id === section.id ? { ...item, visible: !item.visible } : item)))}
                className={`rounded-lg px-3 py-2 text-xs ${section.visible ? 'border border-red-200 text-red-600 hover:bg-red-50' : 'border border-brand/30 text-brand hover:bg-brand-light'}`}
              >
                {section.visible ? '隐藏' : '恢复'}
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <button onClick={onReset} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs text-slate-600 hover:bg-white">
            <RotateCcw className="h-3.5 w-3.5" />
            恢复默认
          </button>
          <button onClick={onClose} className="rounded-lg bg-brand px-5 py-2 text-xs text-white hover:bg-brand-dark">
            完成
          </button>
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { novels, stats, selectNovel } = useNovelLibrary();
  const [sections, setSections] = useState<DashboardSection[]>(loadSections);
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState(readUserName);
  const [writingSummary, setWritingSummary] = useState(readWritingSummary);

  const recentNovels = [...novels]
    .sort((a, b) => String(b.lastModifiedAt ?? '').localeCompare(String(a.lastModifiedAt ?? ''), 'zh-CN'))
    .slice(0, 4);

  const openNovel = (novelId: number, type: WorkType) => {
    selectNovel(novelId);
    navigate(type === 'script' ? '/script-editor-v2' : '/workbench');
  };

  const handleSectionsChange = (next: DashboardSection[]) => {
    setSections(next);
    saveSections(next);
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
    <main className="relative flex-1 overflow-y-auto p-6">
      <div className="mb-4 flex items-center justify-end">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSettings(true)} className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:bg-slate-50">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            卡片设置
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          {visibleSections.some((section) => section.id === 'welcome') && (
            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div>
                <div>
                  <p className="text-xs text-slate-400">欢迎回来</p>
                  <h1 className="mt-1 text-2xl font-bold text-slate-900">{userName}</h1>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ['昨日新增', writingSummary.yesterdayWords],
                    ['本月新增', writingSummary.monthWords],
                    ['总字数', stats.totalWords],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="mt-1 text-xl font-bold text-slate-900">{formatWords(Number(value))}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {visibleSections.some((section) => section.id === 'recent') && (
            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">最近编辑</h2>
              <div className="mt-4 space-y-2">
                {recentNovels.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">暂无最近作品</p>
                ) : recentNovels.map((novel) => (
                  <button
                    key={novel.id}
                    onClick={() => openNovel(novel.id, novel.type)}
                    className="flex w-full items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 text-left transition-colors hover:bg-slate-50"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        novel.type === 'script' ? 'bg-orange-50 text-orange-500' : 'bg-sky-50 text-brand'
                      }`}
                    >
                      {novel.type === 'script' ? <ScrollText className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{novel.title}</p>
                      <p className="text-[11px] text-slate-400">{novel.lastModifiedAt ?? novel.createdAt}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-lg border px-3 py-1 text-sm font-medium ${
                        novel.type === 'script'
                          ? 'border-orange-200 bg-orange-50 text-orange-600'
                          : 'border-blue-200 bg-blue-50 text-blue-600'
                      }`}
                    >
                      {novel.type === 'script' ? '剧本' : '小说'}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-5">
          {visibleSections.some((section) => section.id === 'stats') && (
            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="space-y-3">
                {[
                  ['小说', stats.novelCount],
                  ['剧本', stats.scriptCount],
                  ['总字数', stats.totalWords],
                  ['作品总数', novels.length],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <SettingsModal
        isOpen={showSettings}
        sections={sections}
        onClose={() => setShowSettings(false)}
        onChange={handleSectionsChange}
        onReset={() => handleSectionsChange(DEFAULT_SECTIONS)}
      />
    </main>
  );
}
