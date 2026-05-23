import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Minus, Moon, Plus, Search, Square, X } from 'lucide-react';

import { useNovelLibrary } from '@/features/novels/hooks/useNovelLibrary';
import {
  loadShortcutBindings,
  matchesShortcut,
  SHORTCUT_ACTION_EVENT,
  SHORTCUT_UPDATED_EVENT,
  shortcutActions,
  type ShortcutActionId,
} from '@/shared/shortcuts/shortcutConfig';
import { HOME_TAB, useWorkspaceTabs, type WorkspaceTab } from '@/shared/tabs/WorkspaceTabsContext';

declare global {
  interface Window {
    xinyuexiaWindow?: {
      minimize: () => Promise<void>;
      maximizeToggle: () => Promise<boolean>;
      close: () => Promise<void>;
      isMaximized: () => Promise<boolean>;
      reload: () => Promise<void>;
    };
  }
}

const APP_SCALE_KEY = 'xinyuexia_app_scale';
const DARK_THEME_KEY = 'xinyuexia_dark_theme';
const BASE_APP_SCALE = 1.1;

function loadScale() {
  try {
    const raw = Number(localStorage.getItem(APP_SCALE_KEY) ?? '1');
    if (!Number.isFinite(raw)) return 1;
    return Math.max(0.8, Math.min(1.5, raw));
  } catch {
    return 1;
  }
}

function loadDarkTheme() {
  try {
    return localStorage.getItem(DARK_THEME_KEY) === '1';
  } catch {
    return false;
  }
}

interface AppFrameProps {
  children: ReactNode;
}

export function AppFrame({ children }: AppFrameProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { novels, selectNovel } = useNovelLibrary();
  const { tabs, activeTabId, setActiveTabId, openWorkTab, closeTab } = useWorkspaceTabs();
  const [isMaximized, setIsMaximized] = useState(false);
  const [appScale, setAppScale] = useState(loadScale);
  const [isDarkTheme, setIsDarkTheme] = useState(loadDarkTheme);
  const [shortcutBindings, setShortcutBindings] = useState(loadShortcutBindings);

  const effectiveScale = useMemo(() => Number((BASE_APP_SCALE * appScale).toFixed(3)), [appScale]);

  useEffect(() => {
    localStorage.setItem(APP_SCALE_KEY, String(appScale));
  }, [appScale]);

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', isDarkTheme);
    localStorage.setItem(DARK_THEME_KEY, isDarkTheme ? '1' : '0');
  }, [isDarkTheme]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyZoom = body.style.zoom;
    const prevRootOverflow = root?.style.overflow ?? '';

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.zoom = '1';
    if (root) root.style.overflow = 'hidden';

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.zoom = prevBodyZoom;
      if (root) root.style.overflow = prevRootOverflow;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    window.xinyuexiaWindow?.isMaximized().then((value) => {
      if (mounted) setIsMaximized(value);
    }).catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F5') {
        event.preventDefault();
        void window.xinyuexiaWindow?.reload();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    type DragState = {
      dialog: HTMLElement;
      key: string;
      pointerId: number;
      startX: number;
      startY: number;
      originX: number;
      originY: number;
    };
    let dragState: DragState | null = null;

    const isOverlay = (element: HTMLElement) => (
      element.classList.contains('fixed') && element.classList.contains('inset-0')
    );
    const findOverlay = (target: HTMLElement | null) => {
      let current: HTMLElement | null = target;
      while (current) {
        if (isOverlay(current)) return current;
        current = current.parentElement;
      }
      return null;
    };
    const findDialog = (overlay: HTMLElement, target: HTMLElement) => {
      const children = Array.from(overlay.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
      return children.find((child) => child.contains(target)) ?? null;
    };
    const getDialogKey = (dialog: HTMLElement) => {
      const title = dialog.querySelector('h1,h2,h3')?.textContent?.trim() || dialog.className || 'modal';
      return `xinyuexia_global_modal_position_${title.slice(0, 40)}`;
    };
    const readDialogPosition = (key: string) => {
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || '{}') as { x?: number; y?: number };
        return {
          x: Number.isFinite(parsed.x) ? Number(parsed.x) : 0,
          y: Number.isFinite(parsed.y) ? Number(parsed.y) : 0,
        };
      } catch {
        return { x: 0, y: 0 };
      }
    };
    const applyDialogPosition = (dialog: HTMLElement) => {
      if (dialog.dataset.draggableManaged === 'true' || dialog.dataset.globalDraggableApplied === 'true') return;
      const position = readDialogPosition(getDialogKey(dialog));
      dialog.dataset.globalDraggableApplied = 'true';
      dialog.dataset.globalDragX = String(position.x);
      dialog.dataset.globalDragY = String(position.y);
      dialog.style.transform = `translate(${position.x}px, ${position.y}px)`;
      dialog.style.willChange = 'transform';
    };
    const applyAllPositions = () => {
      document.querySelectorAll<HTMLElement>('.fixed.inset-0').forEach((overlay) => {
        Array.from(overlay.children).forEach((child) => {
          if (child instanceof HTMLElement) applyDialogPosition(child);
        });
      });
    };
    const isInteractive = (target: HTMLElement) => Boolean(
      target.closest('button,input,textarea,select,a,[contenteditable="true"],[data-no-modal-drag="true"]'),
    );

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !(event.target instanceof HTMLElement) || isInteractive(event.target)) return;
      const overlay = findOverlay(event.target);
      if (!overlay) return;
      const dialog = findDialog(overlay, event.target);
      if (!dialog || dialog.dataset.draggableManaged === 'true') return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientY > rect.top + 64) return;
      event.preventDefault();
      event.stopPropagation();
      applyDialogPosition(dialog);
      const key = getDialogKey(dialog);
      dragState = {
        dialog,
        key,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: Number(dialog.dataset.globalDragX || 0),
        originY: Number(dialog.dataset.globalDragY || 0),
      };
      try {
        dialog.setPointerCapture(event.pointerId);
      } catch {
        // Window-level listeners still receive the drag events in capture phase.
      }
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      event.preventDefault();
      const x = dragState.originX + event.clientX - dragState.startX;
      const y = dragState.originY + event.clientY - dragState.startY;
      dragState.dialog.dataset.globalDragX = String(x);
      dragState.dialog.dataset.globalDragY = String(y);
      dragState.dialog.style.transform = `translate(${x}px, ${y}px)`;
    };
    const handlePointerUp = (event: PointerEvent) => {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      const x = Number(dragState.dialog.dataset.globalDragX || 0);
      const y = Number(dragState.dialog.dataset.globalDragY || 0);
      localStorage.setItem(dragState.key, JSON.stringify({ x, y }));
      dragState = null;
    };

    applyAllPositions();
    const observer = new MutationObserver(applyAllPositions);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('pointermove', handlePointerMove, true);
    window.addEventListener('pointerup', handlePointerUp, true);
    window.addEventListener('pointercancel', handlePointerUp, true);
    return () => {
      observer.disconnect();
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('pointermove', handlePointerMove, true);
      window.removeEventListener('pointerup', handlePointerUp, true);
      window.removeEventListener('pointercancel', handlePointerUp, true);
    };
  }, []);

  useEffect(() => {
    const updateShortcuts = () => setShortcutBindings(loadShortcutBindings());
    window.addEventListener(SHORTCUT_UPDATED_EVENT, updateShortcuts);
    return () => window.removeEventListener(SHORTCUT_UPDATED_EVENT, updateShortcuts);
  }, []);

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    };

    const dispatchShortcutAction = (id: ShortcutActionId) => {
      window.dispatchEvent(new CustomEvent(SHORTCUT_ACTION_EVENT, { detail: { id } }));
    };

    const executeShortcut = (id: ShortcutActionId) => {
      if (id === 'close_floating') {
        dispatchShortcutAction(id);
        return;
      }
      if (id === 'go_home') {
        setActiveTabId(HOME_TAB.id);
        navigate('/dashboard');
        return;
      }
      if (id === 'close_work_tab') {
        const activeTab = tabs.find((tab) => tab.id === activeTabId);
        if (!activeTab || activeTab.fixed) return;
        const tabIndex = tabs.findIndex((tab) => tab.id === activeTab.id);
        const remainingTabs = tabs.filter((tab) => tab.id !== activeTab.id);
        const fallbackIndex = Math.max(0, Math.min(tabIndex - 1, remainingTabs.length - 1));
        const fallbackTab = remainingTabs[fallbackIndex] ?? HOME_TAB;
        closeTab(activeTab.id);
        if (fallbackTab.workId) selectNovel(fallbackTab.workId);
        setActiveTabId(fallbackTab.id);
        navigate(fallbackTab.path);
        return;
      }
      if (id === 'theme_colors') {
        navigate('/theme-colors');
        return;
      }
      dispatchShortcutAction(id);
    };

    const handleShortcut = (event: KeyboardEvent) => {
      const matched = shortcutActions.find((action) => matchesShortcut(event, shortcutBindings[action.id]));
      if (!matched) return;

      const editable = isEditableTarget(event.target);
      if (editable && (matched.id === 'delete_chapter' || matched.id === 'undo_edit')) return;
      if (matched.id === 'close_floating') {
        executeShortcut(matched.id);
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      executeShortcut(matched.id);
    };

    window.addEventListener('keydown', handleShortcut, true);
    return () => window.removeEventListener('keydown', handleShortcut, true);
  }, [activeTabId, closeTab, navigate, selectNovel, setActiveTabId, shortcutBindings, tabs]);

  useEffect(() => {
    if (location.pathname === '/dashboard') {
      setActiveTabId(HOME_TAB.id);
      return;
    }

    if (location.pathname !== '/workbench' && location.pathname !== '/script-editor-v2') return;

    const raw = localStorage.getItem('xinyuexia_current_novel_id');
    const workId = raw ? Number(raw) : null;
    if (!workId || !Number.isFinite(workId)) return;

    const work = novels.find((item) => item.id === workId);
    if (!work) return;
    const path = work.type === 'script' ? '/script-editor-v2' : '/workbench';
    if (path !== location.pathname) return;

    openWorkTab({
      workId: work.id,
      workType: work.type,
      title: work.title,
      path,
    });
  }, [location.pathname, novels, openWorkTab, setActiveTabId]);

  const activateTab = (tab: WorkspaceTab) => {
    if (tab.workId) selectNovel(tab.workId);
    setActiveTabId(tab.id);
    navigate(tab.path);
  };

  const handleCloseTab = (event: MouseEvent<HTMLButtonElement>, tab: WorkspaceTab) => {
    event.stopPropagation();
    if (tab.fixed) return;

    const tabIndex = tabs.findIndex((item) => item.id === tab.id);
    const remainingTabs = tabs.filter((item) => item.id !== tab.id);
    const fallbackIndex = Math.max(0, Math.min(tabIndex - 1, remainingTabs.length - 1));
    const fallbackTab = remainingTabs[fallbackIndex] ?? HOME_TAB;

    closeTab(tab.id);
    if (activeTabId === tab.id) activateTab(fallbackTab);
  };

  const toggleMaximizeWindow = async () => {
    const next = await window.xinyuexiaWindow?.maximizeToggle();
    if (typeof next === 'boolean') setIsMaximized(next);
  };

  const handleTitlebarDoubleClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;
    void toggleMaximizeWindow();
  };

  return (
    <div className={`flex h-screen w-screen flex-col overflow-hidden bg-slate-50 ${isDarkTheme ? 'theme-dark' : ''}`}>
      <header
        className="app-titlebar flex h-12 shrink-0 items-center border-b border-slate-200 bg-white px-3"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-center gap-2 pr-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white shadow-sm">
            月
          </div>
          <span className="whitespace-nowrap text-[14px] font-semibold text-slate-700">月下写作</span>
        </div>
        <div className="h-5 w-px shrink-0 bg-slate-200" />

        <nav
          className="flex h-full min-w-0 flex-1 items-end overflow-x-auto pl-2"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onDoubleClick={handleTitlebarDoubleClick}
        >
          {tabs.map((tab, index) => {
            const isActive = activeTabId === tab.id;
            const isHomeTab = tab.id === HOME_TAB.id;
            return (
              <div key={tab.id} className={`flex h-10 shrink-0 items-center ${index === 0 ? '' : '-ml-px'}`}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => activateTab(tab)}
                  onDoubleClick={handleTitlebarDoubleClick}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') activateTab(tab);
                  }}
                  className={`workspace-tab group relative flex h-9 min-w-[104px] max-w-[184px] shrink-0 cursor-pointer items-center gap-2 border px-3 text-left text-sm font-semibold transition-colors ${
                    isActive
                      ? `workspace-tab-active rounded-t-xl border-slate-200 border-b-slate-100 bg-slate-100 text-slate-950 shadow-[0_-2px_8px_rgba(15,23,42,0.08)] ${isHomeTab ? 'workspace-tab-home' : ''}`
                      : `workspace-tab-inactive border-transparent bg-transparent text-slate-500 shadow-none hover:text-slate-900 ${isHomeTab ? 'workspace-tab-home-inactive text-blue-600' : ''}`
                  }`}
                  title={tab.title}
                >
                  <span className={`min-w-0 flex-1 truncate ${isHomeTab ? 'text-base font-bold' : ''}`}>{tab.title}</span>
                  {!tab.fixed && (
                    <button
                      type="button"
                      onClick={(event) => handleCloseTab(event, tab)}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors ${
                        isActive ? 'text-slate-500 hover:bg-slate-200 hover:text-slate-800' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-700'
                      }`}
                      aria-label={`关闭${tab.title}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button
            onClick={() => setIsDarkTheme((prev) => !prev)}
            className={`mr-2 flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors ${
              isDarkTheme
                ? 'border-blue-500/50 bg-blue-500/15 text-blue-200 hover:bg-blue-500/25'
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
            title="黑色主题"
          >
            <Moon className="h-4 w-4" />
            黑色主题
          </button>
          <button
            onClick={() => navigate('/novels')}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            title="打开作品列表"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <div className="ml-1 flex items-center rounded-xl border border-slate-200 bg-white">
            <button
              onClick={() => setAppScale((prev) => Math.max(0.8, Number((prev - 0.1).toFixed(1))))}
              className="px-2.5 py-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              title="缩小 10%"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[48px] text-center text-xs text-slate-500">{Math.round(appScale * 100)}%</span>
            <button
              onClick={() => setAppScale((prev) => Math.min(1.5, Number((prev + 0.1).toFixed(1))))}
              className="px-2.5 py-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              title="放大 10%"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => void window.xinyuexiaWindow?.minimize()}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            title="最小化"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={async () => {
              await toggleMaximizeWindow();
            }}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            title={isMaximized ? '还原' : '最大化'}
          >
            <Square className="h-4 w-4" />
          </button>
          <button
            onClick={() => void window.xinyuexiaWindow?.close()}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
            title="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden bg-slate-50">
        <div
          className="origin-top-left overflow-hidden bg-slate-50"
          style={{
            width: `${100 / effectiveScale}%`,
            height: `${100 / effectiveScale}%`,
            transform: `scale(${effectiveScale})`,
          }}
        >
          <div className="h-full bg-slate-50">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
