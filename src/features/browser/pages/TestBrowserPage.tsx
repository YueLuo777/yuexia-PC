import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Globe, Home, Maximize2, Minimize2, Plus, RefreshCw, Star, Trash2, X } from 'lucide-react';

const BROWSER_URL_KEY = 'xinyuexia_test_browser_url';
const BROWSER_BOOKMARKS_KEY = 'xinyuexia_test_browser_bookmarks';
const BROWSER_TABS_KEY = 'xinyuexia_test_browser_tabs';
const BROWSER_ACTIVE_TAB_KEY = 'xinyuexia_test_browser_active_tab';
const BROWSER_PARTITION = 'persist:xinyuexia-test-browser';
const DEFAULT_BROWSER_URL = 'https://www.qidian.com';
const DESKTOP_VIEWPORT_MIN_WIDTH = 1280;
const MOBILE_VIEWPORT_WIDTH = 720;

interface BrowserBookmark {
  id: string;
  url: string;
  title: string;
  createdAt: number;
}

interface BrowserTab {
  id: string;
  url: string;
  title: string;
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function readStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function isMobileOptimizedUrl(value: string) {
  try {
    const url = new URL(normalizeUrl(value));
    return url.searchParams.get('force_mobile') === '1' || url.hostname.startsWith('m.');
  } catch {
    return /(^|[?&])force_mobile=1(&|$)/.test(value) || /:\/\/m\./i.test(value);
  }
}

function getHostLabel(value: string) {
  try {
    return new URL(normalizeUrl(value)).hostname.replace(/^www\./, '');
  } catch {
    return value;
  }
}

function createTabId() {
  return `browser-tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createBrowserTab(url = DEFAULT_BROWSER_URL, title?: string): BrowserTab {
  const nextUrl = normalizeUrl(url) || DEFAULT_BROWSER_URL;
  return {
    id: createTabId(),
    url: nextUrl,
    title: title || getHostLabel(nextUrl),
  };
}

function normalizeBrowserTabs(value: unknown): BrowserTab[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const raw = item as Partial<BrowserTab>;
      const url = normalizeUrl(String(raw.url ?? ''));
      if (!url) return null;
      return {
        id: raw.id || createTabId(),
        url,
        title: raw.title || getHostLabel(url),
      };
    })
    .filter((item): item is BrowserTab => Boolean(item));
}

function readBrowserTabs() {
  const stored = normalizeBrowserTabs(readStoredJson<unknown>(BROWSER_TABS_KEY, []));
  if (stored.length > 0) return stored;
  return [createBrowserTab(localStorage.getItem(BROWSER_URL_KEY) ?? DEFAULT_BROWSER_URL)];
}

function readActiveBrowserTabId(fallbackId: string) {
  return localStorage.getItem(BROWSER_ACTIVE_TAB_KEY) || fallbackId;
}

export function TestBrowserPage() {
  const webviewRef = useRef<any>(null);
  const [browserTabs, setBrowserTabs] = useState<BrowserTab[]>(() => readBrowserTabs());
  const [activeTabId, setActiveTabId] = useState(() => readActiveBrowserTabId(browserTabs[0]?.id ?? createTabId()));
  const activeTab = useMemo(
    () => browserTabs.find((tab) => tab.id === activeTabId) ?? browserTabs[0] ?? createBrowserTab(),
    [activeTabId, browserTabs],
  );
  const [inputUrl, setInputUrl] = useState(() => activeTab.url);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [currentUrl, setCurrentUrl] = useState(() => activeTab.url);
  const [pageTitle, setPageTitle] = useState(activeTab.title || '内置浏览器');
  const [bookmarks, setBookmarks] = useState<BrowserBookmark[]>(() => readStoredJson<BrowserBookmark[]>(BROWSER_BOOKMARKS_KEY, []));
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const usesMobileViewport = useMemo(() => isMobileOptimizedUrl(currentUrl), [currentUrl]);

  useEffect(() => {
    localStorage.setItem(BROWSER_URL_KEY, currentUrl);
  }, [currentUrl]);

  useEffect(() => {
    localStorage.setItem(BROWSER_TABS_KEY, JSON.stringify(browserTabs));
  }, [browserTabs]);

  useEffect(() => {
    if (browserTabs.some((tab) => tab.id === activeTabId)) return;
    if (browserTabs[0]) setActiveTabId(browserTabs[0].id);
  }, [activeTabId, browserTabs]);

  useEffect(() => {
    if (activeTabId) localStorage.setItem(BROWSER_ACTIVE_TAB_KEY, activeTabId);
  }, [activeTabId]);

  useEffect(() => {
    setCurrentUrl(activeTab.url);
    setInputUrl(activeTab.url);
    setPageTitle(activeTab.title || getHostLabel(activeTab.url));
    setCanGoBack(false);
    setCanGoForward(false);
  }, [activeTabId]);

  useEffect(() => {
    localStorage.setItem(BROWSER_BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    const view = webviewRef.current;
    if (!view) return;

    const syncState = () => {
      try {
        const latestUrl = view.getURL() || currentUrl;
        const latestTitle = view.getTitle?.() || getHostLabel(latestUrl);
        setCurrentUrl(latestUrl);
        setInputUrl(latestUrl);
        setPageTitle(latestTitle);
        setBrowserTabs((prev) => prev.map((tab) => (
          tab.id === activeTabId ? { ...tab, url: latestUrl, title: latestTitle } : tab
        )));
        setCanGoBack(view.canGoBack());
        setCanGoForward(view.canGoForward());
      } catch {
        // Webview can throw while it is still attaching.
      }
    };

    const handleStart = () => setIsLoading(true);
    const handleStop = () => {
      setIsLoading(false);
      syncState();
    };

    view.addEventListener('did-start-loading', handleStart);
    view.addEventListener('did-stop-loading', handleStop);
    view.addEventListener('did-navigate', syncState);
    view.addEventListener('did-navigate-in-page', syncState);
    view.addEventListener('page-title-updated', syncState);

    return () => {
      view.removeEventListener('did-start-loading', handleStart);
      view.removeEventListener('did-stop-loading', handleStop);
      view.removeEventListener('did-navigate', syncState);
      view.removeEventListener('did-navigate-in-page', syncState);
      view.removeEventListener('page-title-updated', syncState);
    };
  }, [activeTabId, currentUrl]);

  const updateActiveTab = (updates: Partial<Pick<BrowserTab, 'title' | 'url'>>) => {
    setBrowserTabs((prev) => prev.map((tab) => (tab.id === activeTabId ? { ...tab, ...updates } : tab)));
  };

  const openUrl = (rawUrl: string) => {
    const next = normalizeUrl(rawUrl);
    if (!next) return;
    setInputUrl(next);
    setCurrentUrl(next);
    const title = getHostLabel(next);
    setPageTitle(title);
    updateActiveTab({ url: next, title });
  };

  const addBrowserTab = (rawUrl = DEFAULT_BROWSER_URL) => {
    const tab = createBrowserTab(rawUrl);
    setBrowserTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
  };

  const closeBrowserTab = (id: string) => {
    setBrowserTabs((prev) => {
      if (prev.length <= 1) return prev;
      const index = prev.findIndex((tab) => tab.id === id);
      const next = prev.filter((tab) => tab.id !== id);
      if (activeTabId === id) {
        const fallback = next[Math.max(0, Math.min(index - 1, next.length - 1))] ?? next[0];
        setActiveTabId(fallback.id);
      }
      return next;
    });
  };

  const addBookmark = () => {
    const next = normalizeUrl(inputUrl || currentUrl);
    if (!next) return;
    const title = bookmarkTitle.trim() || (pageTitle && pageTitle !== '内置浏览器' ? pageTitle : getHostLabel(next));
    setBookmarks((prev) => {
      const rest = prev.filter((item) => item.url !== next);
      return [{ id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, url: next, title, createdAt: Date.now() }, ...rest].slice(0, 30);
    });
    setBookmarkTitle('');
    setCurrentUrl(next);
    updateActiveTab({ url: next, title });
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((item) => item.id !== id));
  };
  const FullscreenIcon = isFullscreen ? Minimize2 : Maximize2;

  return (
    <div className={`flex h-full min-h-0 flex-col bg-slate-50 ${isFullscreen ? 'fixed inset-x-0 bottom-0 top-12 z-[180]' : ''}`}>
      <header className="shrink-0 border-b border-slate-100 bg-white px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
              <Globe className="h-4 w-4 text-sky-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-900">内置浏览器</h1>
              <p className="truncate text-xs text-slate-400">{pageTitle}</p>
            </div>
          </div>
          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            title={isFullscreen ? '恢复浏览器大小' : '全屏展开浏览器'}
          >
            <FullscreenIcon className="h-4 w-4" />
            {isFullscreen ? '恢复' : '全屏'}
          </button>
        </div>
      </header>

      <div className="flex h-10 shrink-0 items-end overflow-x-auto border-b border-slate-100 bg-slate-50 px-3 pt-1">
        {browserTabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`group flex h-9 min-w-[116px] max-w-[210px] items-center gap-2 rounded-t-xl border px-3 text-left text-sm font-semibold transition-colors ${
                isActive
                  ? 'border-slate-200 border-b-white bg-white text-sky-700'
                  : 'border-transparent bg-slate-100 text-slate-500 hover:bg-white hover:text-slate-800'
              }`}
              title={tab.url}
            >
              <span className="min-w-0 flex-1 truncate">{tab.title || getHostLabel(tab.url)}</span>
              {browserTabs.length > 1 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    closeBrowserTab(tab.id);
                  }}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={() => addBrowserTab(inputUrl || DEFAULT_BROWSER_URL)}
          className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-t-xl border border-transparent text-slate-500 hover:bg-white hover:text-sky-700"
          title="新建标签"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="flex w-[270px] shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                <Star className="h-4 w-4 text-amber-500" />
                收藏夹
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{bookmarks.length}</span>
            </div>
            <input
              value={bookmarkTitle}
              onChange={(event) => setBookmarkTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addBookmark();
              }}
              placeholder="收藏名称"
              className="mb-2 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
            />
            <button
              onClick={addBookmark}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm text-white transition-colors hover:bg-brand-dark"
            >
              <Star className="h-4 w-4" />
              收藏当前网页
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {bookmarks.length === 0 ? (
              <div className="flex h-full min-h-[180px] flex-col items-center justify-center text-center text-slate-300">
                <Star className="mb-2 h-8 w-8" />
                <p className="text-sm">暂无收藏</p>
              </div>
            ) : (
              bookmarks.map((bookmark) => (
                <div key={bookmark.id} className="group rounded-xl border border-slate-100 bg-slate-50 p-2.5 transition-colors hover:border-brand/30 hover:bg-white">
                  <button
                    onClick={() => openUrl(bookmark.url)}
                    className="block w-full text-left"
                    title={bookmark.url}
                  >
                    <div className="truncate text-sm font-semibold text-slate-700">{bookmark.title || getHostLabel(bookmark.url)}</div>
                    <div className="mt-1 truncate text-xs text-slate-400">{bookmark.url}</div>
                  </button>
                  <div className="mt-2 flex justify-end gap-1">
                    <button
                      onClick={() => addBrowserTab(bookmark.url)}
                      className="rounded-md p-1 text-slate-300 transition-colors hover:bg-sky-50 hover:text-sky-600"
                      title="新标签打开"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="rounded-md p-1 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="删除收藏"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
          <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 bg-white px-3 py-2">
            <button
              onClick={() => webviewRef.current?.goBack()}
              disabled={!canGoBack}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              title="后退"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => webviewRef.current?.goForward()}
              disabled={!canGoForward}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              title="前进"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => webviewRef.current?.reload()}
              className={`rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 ${isLoading ? 'animate-spin' : ''}`}
              title="刷新"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => openUrl('https://www.qidian.com')}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50"
              title="首页"
            >
              <Home className="h-4 w-4" />
            </button>

            <div className="flex min-w-0 flex-1 items-center rounded-lg border border-slate-200 bg-white px-3 focus-within:border-brand">
              <Globe className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={inputUrl}
                onChange={(event) => setInputUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') openUrl(inputUrl);
                }}
                placeholder="输入网址，例如 www.qidian.com"
                className="min-w-0 flex-1 py-2 text-sm text-slate-700 outline-none"
              />
              {inputUrl && (
                <button onClick={() => setInputUrl('')} className="text-slate-300 hover:text-slate-500" title="清空">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => openUrl(inputUrl)}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
            >
              打开
            </button>
            <button
              onClick={addBookmark}
              className="flex items-center gap-1.5 rounded-lg border border-brand px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand-light"
            >
              <Star className="h-4 w-4" />
              收藏
            </button>
            <button
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              title={isFullscreen ? '恢复浏览器大小' : '全屏展开浏览器'}
            >
              <FullscreenIcon className="h-4 w-4" />
              {isFullscreen ? '恢复' : '全屏'}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden bg-white [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-slate-100">
            {React.createElement('webview', {
              ref: webviewRef,
              src: currentUrl,
              partition: BROWSER_PARTITION,
              allowpopups: 'true',
              style: {
                display: 'flex',
                width: '100%',
                minWidth: usesMobileViewport ? `${MOBILE_VIEWPORT_WIDTH}px` : `${DESKTOP_VIEWPORT_MIN_WIDTH}px`,
                height: '100%',
              },
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
