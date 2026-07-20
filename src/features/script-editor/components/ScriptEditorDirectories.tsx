import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Library,
  Link2,
  PenLine,
  Plus,
  Trash2,
} from 'lucide-react';

import { BrowserWorkspace } from '@/features/script-editor/components/BrowserWorkspace';
import {
  readScriptLinkedNovelId,
  writeScriptLinkedNovelId,
} from '@/features/script-editor/model/scriptLinkedNovelStorage';
import { useMaterials } from '@/features/materials/hooks/useMaterials';
import type { MaterialItem } from '@/features/materials/model/materialTypes';
import { WorkbenchAIPanel } from '@/features/workbench/components/WorkbenchAIPanel';
import { readChapterContent, useWorkbenchData } from '@/features/workbench/hooks/useWorkbenchData';
import type { Chapter, Volume, WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';
import { SHORTCUT_ACTION_EVENT } from '@/shared/shortcuts/shortcutConfig';
import { useWorkspaceTabs } from '@/shared/tabs/WorkspaceTabsContext';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import { loadNavConfig, normalizeNavConfig, type NavGroupConfig } from '@/shared/navigation/navConfig';

export type EditorMode = 'dual' | 'script' | 'browser';
export type MaterialFilterType = 'novel' | 'script' | 'all';

export const MIN_WIDTH = 150;
export const GROUP_SIZE = 50;
export const FULL_WIDTH = 9999;
export const EDITOR_MODE_KEY = 'xinyuexia_script_editor_mode';
export const WIDTH_STORAGE_KEYS: Record<EditorMode, string> = {
  dual: 'xinyuexia_script_editor_widths_dual',
  script: 'xinyuexia_script_editor_widths_script',
  browser: 'xinyuexia_script_editor_widths_browser',
};
export const AI_COLLAPSED_KEYS: Record<EditorMode, string> = {
  dual: 'xinyuexia_script_editor_ai_collapsed_dual',
  script: 'xinyuexia_script_editor_ai_collapsed_script',
  browser: 'xinyuexia_script_editor_ai_collapsed_browser',
};
export const MODE_LABELS: Record<EditorMode, string> = {
  dual: '小说对照编辑',
  script: '纯剧本编辑',
  browser: '浏览器编辑',
};

export function countText(text: string) {
  return text.replace(/\s/g, '').length;
}

export function readStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getVolumeChapterLabel(volumeName: string, chapter: Pick<Chapter, 'serialNumber' | 'title'>) {
  if (volumeName === '集纲') {
    return chapter.title || `集纲${chapter.serialNumber}`;
  }
  return `第${chapter.serialNumber}集${chapter.title ? ` ${chapter.title}` : ''}`;
}

export function normalizeEditorContent(text: string) {
  const lines = text.split('\n');
  return lines
    .map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (index === 0 || lines[index - 1].trim() === '') {
        return line.startsWith('　　') ? line : `　　${trimmed}`;
      }
      return trimmed;
    })
    .join('\n');
}

export function AreaHeader({ label, extra }: { label: string; extra?: React.ReactNode }) {
  return (
    <div className="script-editor-area-header flex h-10 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-3">
      <span className="script-editor-area-title text-sm font-bold text-blue-600">{label}</span>
      {extra}
    </div>
  );
}

export function ResizeHandle({ onMouseDown }: { onMouseDown: (event: ReactMouseEvent) => void }) {
  return (
    <div
      data-no-modal-drag="true"
      onMouseDown={onMouseDown}
      className="group z-10 flex w-[6px] shrink-0 cursor-ew-resize items-center justify-center bg-transparent"
    >
      <div className="h-8 w-px rounded-full bg-slate-300 opacity-0 transition-opacity group-hover:opacity-60" />
    </div>
  );
}

export function LinkNovelModal({
  isOpen,
  novels,
  onClose,
  onLink,
}: {
  isOpen: boolean;
  novels: WorkbenchNovel[];
  onClose: () => void;
  onLink: (novelId: number) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="flex max-h-[70vh] w-[440px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h3 className="text-base font-bold text-gray-900">关联小说</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {novels.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">当前没有可关联的小说作品</p>
          ) : (
            <div className="space-y-1">
              {novels.map((novel) => (
                <button
                  key={novel.id}
                  onClick={() => onLink(novel.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                >
                  <BookOpen className="h-4 w-4 shrink-0 text-brand" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{novel.title}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{novel.category || '未分类'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ScriptEditorQuickNav({
  isOpen,
  navConfig,
  currentPath,
  onOpen,
  onClose,
}: {
  isOpen: boolean;
  navConfig: NavGroupConfig[];
  currentPath: string;
  onOpen: () => void;
  onClose: () => void;
}) {
  const visibleGroups = navConfig
    .filter((group) => !group.hidden)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.hidden),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="absolute left-0 top-1/2 z-40 flex h-20 w-6 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-brand-light hover:text-brand"
        title="打开导航栏"
        aria-label="打开导航栏"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute inset-0 z-50 flex bg-black/10" onMouseDown={onClose}>
          <aside
            className="flex h-full w-[220px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-[12px_0_36px_rgba(15,23,42,0.16)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
              <div className="text-base font-bold text-slate-900">快速导航</div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                title="收起导航栏"
                aria-label="收起导航栏"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
            </header>

            <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              {visibleGroups.map((group) => (
                <section key={group.title} className="mb-4">
                  <div className="mb-2 rounded-lg bg-brand-light px-3 py-2 text-sm font-bold text-brand-dark">
                    {group.title}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = currentPath === item.to;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={onClose}
                          className={`block rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors ${
                            isActive
                              ? 'bg-orange-50 text-orange-500'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

export function ScriptSidebar({
  volumes,
  selectedChapterId,
  width,
  onToggleVolume,
  onSelectChapter,
  onAddVolume,
  onAddChapter,
  onDeleteChapter,
}: {
  volumes: Volume[];
  selectedChapterId: number | null;
  width: number;
  onToggleVolume: (volumeId: number) => void;
  onSelectChapter: (volumeId: number, chapterId: number) => void;
  onAddVolume: () => void;
  onAddChapter: (volumeId: number) => void;
  onDeleteChapter: (volumeId: number, chapterId: number) => void;
}) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; volumeId: number; chapterId: number } | null>(
    null,
  );

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [contextMenu]);

  return (
    <aside className="flex shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white" style={{ width }}>
      <AreaHeader
        label="剧本目录"
        extra={
          <button onClick={onAddVolume} className="xy-ui125-plus-button" title="新增卷">
            <Plus />
          </button>
        }
      />
      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {volumes.map((volume) => (
          <div key={volume.id}>
            <button
              onClick={() => onToggleVolume(volume.id)}
              className="script-editor-group-toggle mb-1 flex h-9 w-full items-center gap-1 rounded-md bg-[#E6F7FB] px-2 text-xs font-bold text-[#08B3D9] transition-colors hover:bg-[#D5F0F7]"
            >
              {volume.isExpanded ? (
                <ChevronDown className="h-3 w-3 shrink-0 text-[#08B3D9]/80" />
              ) : (
                <ChevronRight className="h-3 w-3 shrink-0 text-[#08B3D9]/80" />
              )}
              <span className="flex-1 truncate text-left">{volume.name}</span>
              <span className="text-[10px] text-[#08B3D9]/70">{volume.chapters.length}集</span>
              <span
                onClick={(event) => {
                  event.stopPropagation();
                  onAddChapter(volume.id);
                }}
                className="rounded p-0.5 text-[#08B3D9]/70 transition-colors hover:text-[#08B3D9]"
              >
                <Plus className="h-3 w-3" />
              </span>
            </button>
            {volume.isExpanded && (
              <div className="ml-2 space-y-0.5">
                {volume.chapters.length === 0 ? (
                  <p className="px-2 py-1 text-xs text-gray-300">空</p>
                ) : (
                  volume.chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => onSelectChapter(volume.id, chapter.id)}
                      onContextMenu={(event) => {
                        event.preventDefault();
                        setContextMenu({
                          x: event.clientX,
                          y: event.clientY,
                          volumeId: volume.id,
                          chapterId: chapter.id,
                        });
                      }}
                      className={`script-editor-chapter-item flex w-full items-center rounded px-2 py-1.5 text-xs transition-colors ${
                        selectedChapterId === chapter.id
                          ? 'script-editor-chapter-active bg-orange-50 font-medium text-orange-600'
                          : 'script-editor-chapter-idle text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex-1 truncate text-left">{getVolumeChapterLabel(volume.name, chapter)}</span>
                      <span
                        className={`ml-1 shrink-0 text-[10px] ${selectedChapterId === chapter.id ? 'text-orange-400' : 'text-gray-400'}`}
                      >
                        {chapter.wordCount || 0}字
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {contextMenu && (
        <div
          className="fixed z-[90] min-w-[120px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              onDeleteChapter(contextMenu.volumeId, contextMenu.chapterId);
              setContextMenu(null);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-500 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
            删除
          </button>
        </div>
      )}
    </aside>
  );
}

export function groupChapters(chapters: Array<{ id: number; serialNumber: number; title: string }>) {
  const groups: Array<{
    index: number;
    label: string;
    chapters: Array<{ id: number; serialNumber: number; title: string }>;
  }> = [];
  for (let i = 0; i < chapters.length; i += GROUP_SIZE) {
    const slice = chapters.slice(i, i + GROUP_SIZE);
    groups.push({
      index: groups.length + 1,
      label: `第${slice[0].serialNumber}章 - 第${slice[slice.length - 1].serialNumber}章`,
      chapters: slice,
    });
  }
  return groups;
}

export function NovelSidebar({
  linkedNovel,
  linkedVolumes,
  selectedChapterId,
  onSelectChapter,
}: {
  linkedNovel: WorkbenchNovel | null;
  linkedVolumes: Volume[];
  selectedChapterId: number | null;
  onSelectChapter: (chapterId: number) => void;
}) {
  const chapters = useMemo(
    () =>
      linkedVolumes
        .flatMap((volume) =>
          volume.chapters.map((chapter) => ({
            id: chapter.id,
            serialNumber: chapter.serialNumber,
            title: chapter.title,
          })),
        )
        .sort((a, b) => a.serialNumber - b.serialNumber),
    [linkedVolumes],
  );
  const groups = useMemo(() => groupChapters(chapters), [chapters]);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set([1]));

  useEffect(() => {
    setExpandedGroups(new Set([1]));
  }, [linkedNovel?.id]);

  return (
    <aside className="flex min-w-[150px] flex-1 flex-col overflow-hidden border-l border-gray-200 bg-white">
      <AreaHeader
        label="小说目录"
        extra={!linkedNovel ? <span className="text-xs text-gray-400">未关联小说</span> : undefined}
      />
      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {!linkedNovel ? (
          <div className="h-full" />
        ) : chapters.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-300">当前小说暂无章节</p>
        ) : (
          groups.map((group) => (
            <div key={group.index}>
              <button
                onClick={() => {
                  setExpandedGroups((prev) => {
                    const next = new Set(prev);
                    if (next.has(group.index)) next.delete(group.index);
                    else next.add(group.index);
                    return next;
                  });
                }}
                className="script-editor-group-toggle mb-1 flex w-full items-center gap-1 rounded-md bg-[#E6F7FB] px-2 py-2 text-sm font-bold text-[#08B3D9] transition-colors hover:bg-[#D5F0F7]"
              >
                {expandedGroups.has(group.index) ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#08B3D9]/80" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#08B3D9]/80" />
                )}
                <span className="flex-1 truncate text-left">{group.label}</span>
                <span className="text-xs text-[#08B3D9]/70">{group.chapters.length}章</span>
              </button>
              {expandedGroups.has(group.index) && (
                <div className="flex flex-wrap gap-1 p-1">
                  {group.chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => onSelectChapter(chapter.id)}
                      title={chapter.title || `第${chapter.serialNumber}章`}
                      className={`script-editor-number-chip flex h-7 w-7 items-center justify-center rounded-md border text-[11px] transition-colors ${
                        selectedChapterId === chapter.id
                          ? 'script-editor-number-active border-brand bg-brand font-medium text-white'
                          : 'script-editor-number-idle border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {chapter.serialNumber}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
