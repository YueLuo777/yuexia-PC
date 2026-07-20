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

export function MaterialPreviewArea({ material, width }: { material: MaterialItem | null; width: number }) {
  return (
    <section className="flex shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white" style={{ width }}>
      <AreaHeader label="资料预览区" />
      {!material ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xs text-gray-400">请从右侧资料库选择资料</p>
        </div>
      ) : (
        <>
          <div className="shrink-0 space-y-1 border-b border-gray-100 bg-white px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[10px] text-gray-400">标题</span>
              <span className="truncate text-xs font-medium text-gray-800">{material.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[10px] text-gray-400">作品</span>
              <span className="truncate text-xs text-gray-600">{material.novelTitle}</span>
              {material.chapterSerial ? (
                <span className="truncate text-xs text-gray-600">
                  第{material.chapterSerial}章{material.chapterName ? ` ${material.chapterName}` : ''}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">{material.content}</p>
          </div>
          <div className="flex h-9 shrink-0 items-center border-t border-gray-100 bg-white px-3 text-xs text-gray-400">
            字数 <span className="ml-1 font-medium text-brand">{countText(material.content)}</span>
          </div>
        </>
      )}
    </section>
  );
}

export function MaterialSidebar({
  width,
  materials,
  selectedMaterialId,
  onSelectMaterial,
}: {
  width: number;
  materials: MaterialItem[];
  selectedMaterialId: string | null;
  onSelectMaterial: (id: string) => void;
}) {
  const [filterType, setFilterType] = useState<MaterialFilterType>('novel');
  const [expandedNovelIds, setExpandedNovelIds] = useState<Set<number>>(new Set());
  const initializedExpandedNovelIdsRef = useRef<Set<number>>(new Set());

  const filteredMaterials = useMemo(
    () => (filterType === 'all' ? materials : materials.filter((item) => item.type === filterType)),
    [filterType, materials],
  );

  const groups = useMemo(() => {
    const grouped = new Map<number, { novelId: number; title: string; materials: MaterialItem[] }>();
    filteredMaterials.forEach((material) => {
      if (!grouped.has(material.novelId)) {
        grouped.set(material.novelId, {
          novelId: material.novelId,
          title: material.novelTitle,
          materials: [],
        });
      }
      grouped.get(material.novelId)?.materials.push(material);
    });
    return Array.from(grouped.values()).map((group) => ({
      ...group,
      materials: [...group.materials].sort(
        (a, b) => (a.chapterSerial ?? Number.MAX_SAFE_INTEGER) - (b.chapterSerial ?? Number.MAX_SAFE_INTEGER),
      ),
    }));
  }, [filteredMaterials]);

  useEffect(() => {
    const nextNovelIds = groups
      .map((group) => group.novelId)
      .filter((novelId) => !initializedExpandedNovelIdsRef.current.has(novelId));
    if (nextNovelIds.length === 0) return;
    nextNovelIds.forEach((novelId) => initializedExpandedNovelIdsRef.current.add(novelId));
    setExpandedNovelIds((prev) => new Set([...prev, ...nextNovelIds]));
  }, [groups]);

  const filterButtons: Array<{ key: MaterialFilterType; label: string; icon: React.ReactNode }> = [
    { key: 'novel', label: '小说', icon: <BookOpen className="h-3.5 w-3.5" /> },
    { key: 'script', label: '剧本', icon: <PenLine className="h-3.5 w-3.5" /> },
    { key: 'all', label: '全部', icon: <Library className="h-3.5 w-3.5" /> },
  ];

  return (
    <aside className="flex shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white" style={{ width }}>
      <AreaHeader label="资料库侧边栏" />
      <div className="flex shrink-0 items-center gap-1 border-b border-gray-100 px-2 py-2">
        {filterButtons.map((button) => (
          <button
            key={button.key}
            onClick={() => setFilterType(button.key)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-md px-2.5 py-1 text-xs transition-colors ${
              filterType === button.key
                ? 'bg-brand font-medium text-white'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            {button.icon}
            <span>{button.label}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {groups.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-400">当前筛选下暂无资料</p>
        ) : (
          groups.map((group) => {
            const expanded = expandedNovelIds.has(group.novelId);
            return (
              <div key={group.novelId}>
                <button
                  onClick={() => {
                    setExpandedNovelIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(group.novelId)) next.delete(group.novelId);
                      else next.add(group.novelId);
                      return next;
                    });
                  }}
                  className="script-editor-group-toggle mb-1 flex w-full items-center gap-1 rounded-md bg-[#E6F7FB] px-2 py-1.5 text-xs font-bold text-[#08B3D9] transition-colors hover:bg-[#D5F0F7]"
                >
                  {expanded ? (
                    <ChevronDown className="h-3 w-3 shrink-0 text-[#08B3D9]/80" />
                  ) : (
                    <ChevronRight className="h-3 w-3 shrink-0 text-[#08B3D9]/80" />
                  )}
                  <span className="flex-1 truncate text-left">{group.title}</span>
                  <span className="text-[10px] text-[#08B3D9]/70">{group.materials.length}条</span>
                </button>
                {expanded && (
                  <div className="ml-1 space-y-2">
                    {group.materials.map((material) => (
                      <button
                        key={material.id}
                        onClick={() => onSelectMaterial(material.id)}
                        className={`script-editor-material-card w-full rounded-lg border p-3 text-left transition-colors ${
                          selectedMaterialId === material.id
                            ? 'script-editor-material-active border-orange-200 bg-orange-50'
                            : 'script-editor-material-idle border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <p className="line-clamp-2 text-xs leading-5 text-gray-700">{material.content}</p>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400">
                          <span>
                            {material.chapterSerial
                              ? `第${material.chapterSerial}章`
                              : material.type === 'script'
                                ? '剧本资料'
                                : '小说资料'}
                          </span>
                          <span>{new Date(material.updatedAt).toLocaleDateString('zh-CN')}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
