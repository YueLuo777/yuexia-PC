import { BookOpen, ScrollText, X } from 'lucide-react';
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

function SystemSettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [iconInfo, setIconInfo] = useState<AppIconResult | null>(null);
  const [status, setStatus] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setStatus('');
    void window.xinyuexiaAppIcon?.read().then(setIconInfo);
  }, [isOpen]);

  if (!isOpen) return null;

  const selectIcon = async () => {
    if (!window.xinyuexiaAppIcon) {
      setStatus('当前运行环境不支持设置任务栏图标。');
      return;
    }
    setIsBusy(true);
    const result = await window.xinyuexiaAppIcon.select();
    setIsBusy(false);
    if (result.canceled) return;
    setIconInfo(result);
    setStatus(result.message ?? (result.ok ? '图标已更新。' : '图标更新失败。'));
  };

  const resetIcon = async () => {
    if (!window.xinyuexiaAppIcon) {
      setStatus('当前运行环境不支持设置任务栏图标。');
      return;
    }
    setIsBusy(true);
    const result = await window.xinyuexiaAppIcon.reset();
    setIsBusy(false);
    setIconInfo(result);
    setStatus(result.message ?? (result.ok ? '已恢复默认图标。' : '恢复失败。'));
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-[520px] max-w-[92vw] overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">系统设置</h2>
            <p className="mt-0.5 text-xs text-slate-400">上传图片后，会作为软件在任务栏显示的图标。</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {iconInfo?.dataUrl ? (
                <img src={iconInfo.dataUrl} alt="当前软件图标" className="h-full w-full object-contain p-2" />
              ) : (
                <span className="text-sm font-bold text-brand">月</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">{iconInfo?.isCustom ? '当前使用自定义图标' : '当前使用默认图标'}</p>
              <p className="mt-1 truncate text-xs text-slate-400">{iconInfo?.iconPath ?? '未读取到图标路径'}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">建议上传正方形 PNG 图片，透明背景效果最好。</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={resetIcon}
              disabled={isBusy}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              恢复默认
            </button>
            <button
              onClick={selectIcon}
              disabled={isBusy}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:bg-slate-300"
            >
              上传图片
            </button>
          </div>

          {status && <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{status}</p>}
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { novels, stats, selectNovel } = useNovelLibrary();
  const [sections] = useState<DashboardSection[]>(loadSections);
  const [showSystemSettings, setShowSystemSettings] = useState(false);
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
    <main className="relative flex-1 overflow-y-auto p-6">
      <button
        onClick={() => setShowSystemSettings(true)}
        className="fixed bottom-6 left-6 z-20 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-brand"
      >
        系统设置
      </button>

      <div className="grid gap-5 xl:grid-cols-3">
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

        <div className="space-y-5" />
      </div>

      <SystemSettingsModal isOpen={showSystemSettings} onClose={() => setShowSystemSettings(false)} />
    </main>
  );
}
