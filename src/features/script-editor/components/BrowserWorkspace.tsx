import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Globe, Maximize2, Minimize2, Plus, RefreshCw, Save, Star, Trash2, X } from 'lucide-react';

const BROWSER_URL_KEY = 'xinyuexia_script_browser_url';
const BROWSER_SAVED_URLS_KEY = 'xinyuexia_script_browser_saved_urls';
const BROWSER_TABS_KEY = 'xinyuexia_script_browser_tabs';
const BROWSER_ACTIVE_TAB_KEY = 'xinyuexia_script_browser_active_tab';
const BROWSER_PARTITION = 'persist:xinyuexia-script-browser';
const DEFAULT_BROWSER_URL = 'https://www.qidian.com';
const FULL_WIDTH = 9999;
const DESKTOP_VIEWPORT_MIN_WIDTH = 1280;
const MOBILE_VIEWPORT_WIDTH = 720;

interface BrowserSavedUrl {
  title: string;
  url: string;
}

interface BrowserTab {
  id: string;
  title: string;
  url: string;
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
    title: title || getHostLabel(nextUrl),
    url: nextUrl,
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
        title: raw.title || getHostLabel(url),
        url,
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

function normalizeSavedUrls(value: Array<string | BrowserSavedUrl>) {
  return value.map((item) => {
    if (typeof item === 'string') {
      return { title: getHostLabel(item), url: item };
    }
    return {
      title: item.title || getHostLabel(item.url),
      url: item.url,
    };
  }).filter((item) => item.url);
}

function isMobileOptimizedUrl(value: string) {
  try {
    const url = new URL(normalizeUrl(value));
    return url.searchParams.get('force_mobile') === '1' || url.hostname.startsWith('m.');
  } catch {
    return /(^|[?&])force_mobile=1(&|$)/.test(value) || /:\/\/m\./i.test(value);
  }
}

export function BrowserWorkspace({ width }: { width: number }) {
  const webviewRef = useRef<ElectronWebviewElement | null>(null);
  const [browserTabs, setBrowserTabs] = useState<BrowserTab[]>(() => readBrowserTabs());
  const [activeTabId, setActiveTabId] = useState(() => readActiveBrowserTabId(browserTabs[0]?.id));
  const activeTab = useMemo(
    () => browserTabs.find((tab) => tab.id === activeTabId) ?? browserTabs[0] ?? createBrowserTab(),
    [activeTabId, browserTabs],
  );
  const [inputUrl, setInputUrl] = useState(() => activeTab.url);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [currentUrl, setCurrentUrl] = useState(() => activeTab.url);
  const [savedUrls, setSavedUrls] = useState<BrowserSavedUrl[]>(() => normalizeSavedUrls(readStoredJson<Array<string | BrowserSavedUrl>>(BROWSER_SAVED_URLS_KEY, [])));
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
    if (!activeTab) return;
    setCurrentUrl(activeTab.url);
    setInputUrl(activeTab.url);
    setCanGoBack(false);
    setCanGoForward(false);
  }, [activeTabId]);

  useEffect(() => {
    localStorage.setItem(BROWSER_SAVED_URLS_KEY, JSON.stringify(savedUrls));
  }, [savedUrls]);

  useEffect(() => {
    const view = webviewRef.current;
    if (!view) return;

    const syncState = () => {
      try {
        const latestUrl = view.getURL() || currentUrl;
        const latestTitle = view.getTitle?.() || getHostLabel(latestUrl);
        setCurrentUrl(latestUrl);
        setInputUrl(latestUrl);
        setBrowserTabs((prev) => prev.map((tab) => (
          tab.id === activeTabId ? { ...tab, url: latestUrl, title: latestTitle } : tab
        )));
        setCanGoBack(view.canGoBack());
        setCanGoForward(view.canGoForward());
      } catch {
        // ignore
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

    return () => {
      view.removeEventListener('did-start-loading', handleStart);
      view.removeEventListener('did-stop-loading', handleStop);
      view.removeEventListener('did-navigate', syncState);
      view.removeEventListener('did-navigate-in-page', syncState);
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
    updateActiveTab({ url: next, title: getHostLabel(next) });
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

  const saveCurrentUrl = () => {
    const next = normalizeUrl(inputUrl);
    if (!next) return;
    const title = bookmarkTitle.trim() || getHostLabel(next);
    setSavedUrls((prev) => [{ title, url: next }, ...prev.filter((item) => item.url !== next)].slice(0, 12));
    setBookmarkTitle('');
    setCurrentUrl(next);
    updateActiveTab({ url: next, title });
  };

  const removeSavedUrl = (url: string) => {
    setSavedUrls((prev) => prev.filter((item) => item.url !== url));
  };

  const isFlexible = width >= FULL_WIDTH;
  const FullscreenIcon = isFullscreen ? Minimize2 : Maximize2;

  return (
    <section
      className={`flex min-w-[320px] flex-col overflow-hidden border-l border-gray-200 bg-white ${
        isFullscreen ? 'fixed inset-x-0 bottom-0 top-12 z-[180] border-l-0' : isFlexible ? 'flex-1' : 'shrink-0'
      }`}
      style={isFullscreen || isFlexible ? undefined : { width }}
    >
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-3">
        <span className="text-sm font-bold text-blue-600">内置浏览器</span>
        <button
          onClick={() => setIsFullscreen((prev) => !prev)}
          className="rounded-md border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
          title={isFullscreen ? '恢复' : '全屏展开'}
        >
          <FullscreenIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex h-9 shrink-0 items-end overflow-x-auto border-b border-gray-100 bg-gray-50 px-2 pt-1">
        {browserTabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`group flex h-8 min-w-[96px] max-w-[168px] items-center gap-1.5 rounded-t-lg border px-2 text-left text-xs font-semibold transition-colors ${
                isActive
                  ? 'border-gray-200 border-b-white bg-white text-blue-600'
                  : 'border-transparent bg-gray-100 text-gray-500 hover:bg-white hover:text-gray-800'
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
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={() => addBrowserTab(inputUrl || DEFAULT_BROWSER_URL)}
          className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-t-lg border border-transparent text-gray-500 hover:bg-white hover:text-blue-600"
          title="新建标签"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-b border-gray-100 bg-white p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => webviewRef.current?.goBack()}
            disabled={!canGoBack}
            className="rounded border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            title="后退"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => webviewRef.current?.goForward()}
            disabled={!canGoForward}
            className="rounded border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            title="前进"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => webviewRef.current?.reload()}
            className={`rounded border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 ${isLoading ? 'animate-spin' : ''}`}
            title="刷新"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          <div className="flex min-w-0 flex-1 items-center rounded-md border border-gray-200 bg-white px-2">
            <Globe className="mr-1.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
            <input
              value={inputUrl}
              onChange={(event) => setInputUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') openUrl(inputUrl);
              }}
              placeholder="输入网址，例如 www.qidian.com"
              className="min-w-0 flex-1 py-1.5 text-xs text-gray-700 outline-none"
            />
          </div>

          <button
            onClick={() => openUrl(inputUrl)}
            className="rounded-md bg-brand px-3 py-1.5 text-xs text-white transition-colors hover:bg-brand-dark"
          >
            打开
          </button>
          <input
            value={bookmarkTitle}
            onChange={(event) => setBookmarkTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') saveCurrentUrl();
            }}
            placeholder="收藏名"
            className="h-[30px] w-[120px] shrink-0 rounded-md border border-gray-200 bg-white px-2.5 text-xs text-gray-700 outline-none transition-colors focus:border-brand"
          />
          <button
            onClick={saveCurrentUrl}
            className="flex items-center gap-1 rounded-md border border-brand px-2.5 py-1.5 text-xs text-brand transition-colors hover:bg-brand-light"
          >
            <Save className="h-3.5 w-3.5" />
            加入收藏夹
          </button>
          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50"
            title={isFullscreen ? '恢复浏览器大小' : '全屏展开浏览器'}
          >
            <FullscreenIcon className="h-3.5 w-3.5" />
            {isFullscreen ? '恢复' : '全屏'}
          </button>
        </div>

        <div className="rounded-lg border border-gray-100 bg-gray-50 p-2">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              收藏夹
            </div>
            <span className="rounded bg-white px-2 py-0.5 text-[11px] text-gray-500">{savedUrls.length}</span>
          </div>
          {savedUrls.length > 0 ? (
            <div className="flex max-h-[76px] flex-wrap gap-1.5 overflow-y-auto pr-1">
            {savedUrls.map((item) => (
              <div
                key={item.url}
                className="group flex max-w-[220px] items-center gap-1 rounded-full border border-gray-200 bg-white pl-2.5 pr-1 py-1 text-[11px] text-gray-600"
                title={item.url}
              >
                <button onClick={() => openUrl(item.url)} className="min-w-0 flex-1 truncate text-left hover:text-brand">
                  {item.title}
                </button>
                <button
                  onClick={() => addBrowserTab(item.url)}
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-gray-300 hover:bg-gray-100 hover:text-blue-600"
                  title="新标签打开"
                >
                  <Plus className="h-3 w-3" />
                </button>
                <button
                  onClick={() => removeSavedUrl(item.url)}
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-gray-300 hover:bg-red-50 hover:text-red-500"
                  title="删除收藏"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-gray-200 bg-white px-3 py-2 text-center text-xs text-gray-400">
              暂无收藏
            </div>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden bg-white [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#9a9a9a] [&::-webkit-scrollbar-track]:bg-transparent">
        {React.createElement('webview', {
          ref: webviewRef,
          src: currentUrl,
          partition: BROWSER_PARTITION,
          style: {
            display: 'flex',
            width: '100%',
            minWidth: usesMobileViewport ? `${MOBILE_VIEWPORT_WIDTH}px` : `${DESKTOP_VIEWPORT_MIN_WIDTH}px`,
            height: '100%',
          },
        })}
      </div>
    </section>
  );
}
