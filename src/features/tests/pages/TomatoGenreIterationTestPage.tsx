import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Camera,
  ExternalLink,
  Globe,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  RefreshCw,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';

import { getBrowserHostLabel, isEmbeddedBrowserEnabled, normalizeBrowserUrl } from '@/shared/browser/browserUrl';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';

const TOMATO_BROWSER_PARTITION = 'persist:xinyuexia-tomato-genre-iteration-test';
const TOMATO_BOOKMARKS_KEY = 'xinyuexia_tomato_browser_bookmarks';
const TOMATO_HOME_URL_KEY = 'xinyuexia_tomato_browser_home_url';
const TOMATO_OLD_DEFAULT_URL = 'https://fanqienovel.com/rank';
const TOMATO_DEFAULT_URL = 'https://fanqienovel.com/rank/1_1_8';
const TOMATO_AI_PANEL_WIDTH = 420;
const TOMATO_AI_PANEL_MIN_WIDTH = Math.round(TOMATO_AI_PANEL_WIDTH * 0.6);
const TOMATO_AI_PANEL_MAX_WIDTH = 720;
const TOMATO_AI_PANEL_COLLAPSED_WIDTH = 56;
const TOMATO_AI_PANEL_RESIZER_WIDTH = 6;
const TOMATO_BROWSER_DESKTOP_MIN_WIDTH = 1280;

const tomatoNavItems = [{ id: 'rank', title: '番茄排行榜', url: TOMATO_DEFAULT_URL, note: '先从榜单挑书' }];

const sampleBookInfo = {
  title: '我在都市鉴宝成神',
  author: '番茄作者',
  category: '都市 / 鉴宝 / 神豪',
  status: '连载中 · 128万字',
  rank: '都市脑洞榜 #12',
  description: '落魄青年意外获得鉴定万物的能力，从古玩市场捡漏开始，一路打脸质疑者，进入豪门、商会和隐秘收藏圈。',
  tags: ['逆袭', '鉴宝', '信息差', '扮猪吃虎', '神豪'],
  chapters: ['第1章 被女友嫌弃的穷小子', '第2章 地摊捡漏', '第3章 当众打脸专家', '第4章 豪门邀请'],
};

const modelOptions = [
  { value: 'deepseek', label: 'deepseek' },
  { value: 'gpt', label: 'gpt' },
];

const promptOptions = [
  { value: 'genre-iteration', label: '题材迭代' },
  { value: 'selling-point', label: '爽点提炼' },
];

const targetGenres = ['玄幻', '仙侠', '科幻', '灵异', '末世', '都市'];

interface TomatoBookmark {
  id: string;
  title: string;
  url: string;
}

function readStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readStoredUrl(key: string, fallback: string) {
  const stored = normalizeTomatoHomeUrl(localStorage.getItem(key) || '');
  if (!stored || stored === TOMATO_OLD_DEFAULT_URL) return fallback;
  return stored;
}

function normalizeTomatoBrowserUrl(value: string) {
  const normalized = normalizeBrowserUrl(value);
  if (!normalized) return '';
  try {
    const url = new URL(normalized);
    url.searchParams.delete('force_mobile');
    const cleanUrl = url.toString();
    return cleanUrl.endsWith('/') && !url.pathname.endsWith('/') ? cleanUrl.slice(0, -1) : cleanUrl;
  } catch {
    return normalized
      .replace(/([?&])force_mobile=1(&)?/, (_match, prefix: string, suffix: string | undefined) =>
        prefix === '?' && suffix ? '?' : '',
      )
      .replace(/[?&]$/, '');
  }
}

function normalizeTomatoHomeUrl(value: string) {
  return normalizeTomatoBrowserUrl(value);
}

function createBookmarkId() {
  return `tomato-bookmark-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeBookmarks(value: unknown): TomatoBookmark[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const raw = item as Partial<TomatoBookmark>;
      const url = normalizeTomatoBrowserUrl(String(raw.url ?? ''));
      if (!url) return null;
      return {
        id: raw.id || createBookmarkId(),
        title: raw.title?.trim() || getBrowserHostLabel(url),
        url,
      };
    })
    .filter((item): item is TomatoBookmark => Boolean(item));
}

function getWebviewNavigationUrl(event: Event) {
  const payload = event as Event & { url?: string; detail?: { url?: string } };
  return payload.url || payload.detail?.url || '';
}

function patchTomatoLinksToCurrentView(view: ElectronWebviewElement) {
  void view
    .executeJavaScript?.(
      `
    (() => {
      if (window.__xinyuexiaTomatoLinkPatch) return;
      window.__xinyuexiaTomatoLinkPatch = true;
      const patchLinks = () => {
        document.querySelectorAll('a[target]').forEach((link) => {
          if (link.getAttribute('target') !== '_self') link.setAttribute('target', '_self');
        });
      };
      patchLinks();
      new MutationObserver(patchLinks).observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['target'],
      });
      document.addEventListener('click', (event) => {
        const target = event.target;
        const link = target?.closest?.('a[href]');
        if (link) link.setAttribute('target', '_self');
      }, true);
    })();
  `,
    )
    .catch(() => undefined);
}

function buildSampleOutput(targetGenre: string) {
  return `《万宝灵纹录》

核心爽点：
底层主角被轻视，凭借“看穿万物价值”的信息差不断捡漏、打脸、升级。

${targetGenre}迁移：
古玩鉴定改为灵器、丹药、功法残卷鉴定；豪门圈改为宗门、商会和炼器世家。

金手指：
主角觉醒“万物灵纹眼”，能看见法宝缺陷、材料年份和功法隐藏分支。

开篇钩子：
杂役弟子被逐出外门前，在废弃法器堆里看见一枚“残破铜铃”的隐藏神纹。

规避提醒：
只保留“信息差捡漏+低开高走”的爽点，不复刻原书人物名、具体交易桥段和章节顺序。`;
}

export function TomatoGenreIterationTestPage() {
  const webviewRef = useRef<ElectronWebviewElement | null>(null);
  const aiPanelResizeRef = useRef({ startX: 0, startWidth: TOMATO_AI_PANEL_WIDTH });
  const stopAiPanelResizeRef = useRef<(() => void) | null>(null);
  const [homeUrl, setHomeUrl] = useState(() => readStoredUrl(TOMATO_HOME_URL_KEY, TOMATO_DEFAULT_URL));
  const [activeNavId, setActiveNavId] = useState('rank');
  const [inputUrl, setInputUrl] = useState(homeUrl);
  const [currentUrl, setCurrentUrl] = useState(homeUrl);
  const currentUrlRef = useRef(homeUrl);
  const [pageTitle, setPageTitle] = useState(() => getBrowserHostLabel(homeUrl));
  const [bookmarkName, setBookmarkName] = useState('');
  const [bookmarks, setBookmarks] = useState<TomatoBookmark[]>(() =>
    normalizeBookmarks(readStoredJson<unknown>(TOMATO_BOOKMARKS_KEY, [])),
  );
  const [modelValue, setModelValue] = useState('deepseek');
  const [promptValue, setPromptValue] = useState('genre-iteration');
  const [targetGenre, setTargetGenre] = useState('玄幻');
  const [aiInput, setAiInput] = useState(
    '请读取当前小说的书名、简介、标签、目录标题和截图信息，提炼核心爽点，并迁移成新的题材方案。',
  );
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [screenshotStatus, setScreenshotStatus] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [hasBookInfo, setHasBookInfo] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiOutput, setAiOutput] = useState('');
  const [isAiPanelCollapsed, setIsAiPanelCollapsed] = useState(false);
  const [aiPanelWidth, setAiPanelWidth] = useState(TOMATO_AI_PANEL_WIDTH);
  const embeddedBrowserEnabled = isEmbeddedBrowserEnabled();
  const layoutColumns = `minmax(0, 1fr) ${isAiPanelCollapsed ? 0 : TOMATO_AI_PANEL_RESIZER_WIDTH}px ${isAiPanelCollapsed ? TOMATO_AI_PANEL_COLLAPSED_WIDTH : aiPanelWidth}px`;

  useEffect(() => {
    localStorage.setItem(TOMATO_BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem(TOMATO_HOME_URL_KEY, normalizeTomatoHomeUrl(homeUrl) || TOMATO_DEFAULT_URL);
  }, [homeUrl]);

  useEffect(() => {
    currentUrlRef.current = currentUrl;
  }, [currentUrl]);

  useEffect(() => {
    const view = webviewRef.current;
    if (!view) return;

    const syncState = () => {
      try {
        const latestRawUrl = normalizeBrowserUrl(view.getURL?.() || currentUrlRef.current);
        const latestDisplayUrl = normalizeTomatoBrowserUrl(latestRawUrl) || latestRawUrl;
        const latestTitle = view.getTitle?.() || getBrowserHostLabel(latestDisplayUrl);
        if (latestRawUrl) setCurrentUrl(latestRawUrl);
        setInputUrl(latestDisplayUrl);
        setPageTitle(latestTitle);
      } catch {
        // Webview can throw while it is attaching or navigating.
      }
    };

    const patchLinks = () => patchTomatoLinksToCurrentView(view);
    view.addEventListener('did-stop-loading', syncState);
    view.addEventListener('did-navigate', syncState);
    view.addEventListener('did-navigate-in-page', syncState);
    view.addEventListener('page-title-updated', syncState);
    view.addEventListener('dom-ready', patchLinks);
    view.addEventListener('did-finish-load', patchLinks);
    const openNewWindowInCurrentView = (event: Event) => {
      const nextUrl = normalizeTomatoBrowserUrl(getWebviewNavigationUrl(event));
      if (!nextUrl) return;
      event.preventDefault();
      setCurrentUrl(nextUrl);
      setInputUrl(nextUrl);
      setPageTitle(getBrowserHostLabel(nextUrl));
    };
    view.addEventListener('new-window', openNewWindowInCurrentView);
    view.addEventListener('did-create-window', openNewWindowInCurrentView);

    return () => {
      view.removeEventListener('did-stop-loading', syncState);
      view.removeEventListener('did-navigate', syncState);
      view.removeEventListener('did-navigate-in-page', syncState);
      view.removeEventListener('page-title-updated', syncState);
      view.removeEventListener('dom-ready', patchLinks);
      view.removeEventListener('did-finish-load', patchLinks);
      view.removeEventListener('new-window', openNewWindowInCurrentView);
      view.removeEventListener('did-create-window', openNewWindowInCurrentView);
    };
  }, []);

  const openUrl = (rawUrl: string) => {
    const nextUrl = normalizeTomatoBrowserUrl(rawUrl) || TOMATO_DEFAULT_URL;
    setCurrentUrl(nextUrl);
    setInputUrl(nextUrl);
    setPageTitle(getBrowserHostLabel(nextUrl));
  };

  const openNavItem = (item: (typeof tomatoNavItems)[number]) => {
    setActiveNavId(item.id);
    openUrl(item.url);
  };

  const saveCurrentBookmark = () => {
    const view = webviewRef.current;
    const rawUrl = normalizeBrowserUrl(view?.getURL?.() || inputUrl || currentUrl);
    const nextUrl = normalizeTomatoBrowserUrl(rawUrl);
    if (!nextUrl) return;
    const title = bookmarkName.trim() || view?.getTitle?.() || pageTitle || getBrowserHostLabel(nextUrl);
    setBookmarks((prev) =>
      [{ id: createBookmarkId(), title, url: nextUrl }, ...prev.filter((item) => item.url !== nextUrl)].slice(0, 24),
    );
    setBookmarkName('');
    if (rawUrl) setCurrentUrl(rawUrl);
    setInputUrl(nextUrl);
    setPageTitle(title);
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((item) => item.id !== id));
  };

  const openHome = () => {
    openUrl(homeUrl);
  };

  const setCurrentAsHome = () => {
    const view = webviewRef.current;
    const rawUrl = normalizeBrowserUrl(view?.getURL?.() || inputUrl || currentUrl);
    const nextUrl = normalizeTomatoHomeUrl(rawUrl) || TOMATO_DEFAULT_URL;
    setHomeUrl(nextUrl);
    if (rawUrl) setCurrentUrl(rawUrl);
    setInputUrl(nextUrl);
    setPageTitle(view?.getTitle?.() || getBrowserHostLabel(nextUrl));
  };

  const startAiPanelResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    stopAiPanelResizeRef.current?.();
    aiPanelResizeRef.current = { startX: event.clientX, startWidth: aiPanelWidth };
    const handle = event.currentTarget;
    const pointerId = event.pointerId;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = aiPanelResizeRef.current.startX - moveEvent.clientX;
      const nextWidth = Math.min(
        TOMATO_AI_PANEL_MAX_WIDTH,
        Math.max(TOMATO_AI_PANEL_MIN_WIDTH, aiPanelResizeRef.current.startWidth + deltaX),
      );
      setAiPanelWidth(nextWidth);
    };

    const stopAiPanelResize = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopAiPanelResize);
      window.removeEventListener('pointercancel', stopAiPanelResize);
      window.removeEventListener('blur', stopAiPanelResize);
      try {
        if (handle.hasPointerCapture?.(pointerId)) handle.releasePointerCapture(pointerId);
      } catch {
        // Pointer capture can already be released by the browser.
      }
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      stopAiPanelResizeRef.current = null;
    };
    stopAiPanelResizeRef.current = stopAiPanelResize;

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    try {
      handle.setPointerCapture?.(pointerId);
    } catch {
      // Some embedded browser states may reject capture; window events still clean up.
    }
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopAiPanelResize);
    window.addEventListener('pointercancel', stopAiPanelResize);
    window.addEventListener('blur', stopAiPanelResize);
  };

  const readCurrentBook = () => {
    setIsReading(true);
    window.setTimeout(() => {
      const view = webviewRef.current;
      setCurrentUrl(normalizeBrowserUrl(view?.getURL?.() || currentUrlRef.current) || currentUrlRef.current);
      setPageTitle(view?.getTitle?.() || sampleBookInfo.title);
      setHasBookInfo(true);
      setIsReading(false);
    }, 500);
  };

  const captureBrowserToInput = async () => {
    const view = webviewRef.current;
    if (!view?.capturePage) {
      setScreenshotStatus('当前环境暂不支持浏览器截图，已写入截图占位。');
      setAiInput((current) => `${current.trim()}\n\n[浏览器截图：当前环境暂不支持截图，请按当前页面可见内容分析。]`);
      return;
    }
    try {
      setScreenshotStatus('正在截图...');
      const image = await view.capturePage();
      const dataUrl = image.toDataURL();
      setScreenshotPreview(dataUrl);
      setScreenshotStatus('已把浏览器截图附加到输入框。');
      setAiInput(
        (current) =>
          `${current.trim()}\n\n[已附加浏览器截图：请结合截图里的书名、简介、榜单位置、标签和目录信息分析。]`,
      );
    } catch (error) {
      setScreenshotStatus(error instanceof Error ? error.message : '浏览器截图失败');
    }
  };

  const startIteration = () => {
    setIsAnalyzing(true);
    setAiOutput('');
    window.setTimeout(() => {
      setAiOutput(buildSampleOutput(targetGenre));
      setIsAnalyzing(false);
    }, 700);
  };

  return (
    <div className="grid h-full min-h-0 bg-slate-50 text-slate-900" style={{ gridTemplateColumns: layoutColumns }}>
      <main className="flex min-h-0 flex-col overflow-hidden border-r border-slate-200 bg-white">
        <header className="shrink-0 border-b border-slate-100 bg-white p-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => webviewRef.current?.goBack()}
              className="h-9 rounded-md border border-slate-200 px-3 text-sm font-black text-slate-500 hover:bg-slate-50"
            >
              后退
            </button>
            <button
              type="button"
              onClick={() => webviewRef.current?.reload()}
              className="flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-slate-500 hover:bg-slate-50"
              title="刷新网页"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 flex-1 items-center rounded-md border border-slate-200 bg-slate-50 px-3">
              <Globe className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={inputUrl}
                onChange={(event) => setInputUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') openUrl(inputUrl);
                }}
                className="h-9 min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none"
              />
            </div>
            <div className="flex h-9 shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5">
              <input
                value={bookmarkName}
                onChange={(event) => setBookmarkName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') saveCurrentBookmark();
                }}
                className="h-7 w-40 bg-transparent px-2 text-xs font-semibold text-slate-600 outline-none focus:text-slate-800"
                placeholder="收藏名称"
              />
              <button
                type="button"
                onClick={saveCurrentBookmark}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
                title="收藏当前网页"
              >
                <Star className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={setCurrentAsHome}
              className="h-9 shrink-0 rounded-md border border-cyan-200 bg-cyan-50 px-3 text-sm font-black text-cyan-700 hover:bg-cyan-100"
              title="把当前网页设为下次进入番茄浏览器时打开的首页"
            >
              设为首页
            </button>
            <button
              type="button"
              onClick={() => openUrl(inputUrl)}
              className="h-9 rounded-md bg-cyan-600 px-4 text-sm font-black text-white hover:bg-cyan-700"
            >
              打开
            </button>
          </div>
          <div className="mt-2 flex h-11 items-center gap-2 overflow-x-auto rounded-md border border-slate-100 bg-slate-50 px-2 [scrollbar-width:thin]">
            <span className="flex shrink-0 items-center gap-1.5 px-1 text-xs font-black text-slate-400">
              <Sparkles className="h-3.5 w-3.5" />
              快捷栏
            </span>
            {tomatoNavItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openNavItem(item)}
                className={`flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-3 text-xs font-black transition-colors ${
                  activeNavId === item.id
                    ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-white hover:text-cyan-700'
                }`}
                title={item.note}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {item.title}
              </button>
            ))}
            <div className="mx-1 h-6 w-px shrink-0 bg-slate-200" />
            <button
              type="button"
              onClick={openHome}
              className="h-8 shrink-0 rounded-md border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 hover:bg-white hover:text-cyan-700"
              title={homeUrl}
            >
              打开首页
            </button>
            {bookmarks.length > 0 && (
              <div className="flex shrink-0 items-center gap-1.5">
                {bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="group flex h-8 max-w-[220px] shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white pl-2.5 pr-1 text-xs font-bold text-slate-600"
                    title={bookmark.url}
                  >
                    <button
                      type="button"
                      onClick={() => openUrl(bookmark.url)}
                      className="min-w-0 truncate hover:text-cyan-700"
                    >
                      {bookmark.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBookmark(bookmark.id)}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-300 hover:bg-red-50 hover:text-red-500"
                      title="删除收藏"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden bg-white [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
          {embeddedBrowserEnabled ? (
            React.createElement('webview', {
              ref: webviewRef,
              src: currentUrl,
              partition: TOMATO_BROWSER_PARTITION,
              style: {
                display: 'flex',
                width: '100%',
                minWidth: `${TOMATO_BROWSER_DESKTOP_MIN_WIDTH}px`,
                height: '100%',
              },
            })
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-50 px-8 text-center text-sm leading-6 text-slate-500">
              内置浏览器仅在开发模式或显式启用的内部包中开放。这里保留同样布局，用于确认题材迭代工作台结构。
            </div>
          )}
        </div>
      </main>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="拖拽调整 AI 配置宽度"
        data-no-modal-drag
        onPointerDown={startAiPanelResize}
        className={`group relative min-h-0 cursor-col-resize bg-slate-100 transition-colors hover:bg-cyan-100 ${isAiPanelCollapsed ? 'pointer-events-none opacity-0' : ''}`}
        title="拖拽调整 AI 配置宽度"
      >
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-slate-300 group-hover:bg-cyan-400" />
      </div>

      <aside
        className={`flex min-h-0 flex-col border-l border-slate-200 bg-gray-50 transition-[width] duration-200 ${isAiPanelCollapsed ? 'items-center px-2 py-3' : 'px-4 pb-4 pt-3'}`}
      >
        {isAiPanelCollapsed ? (
          <>
            <button
              type="button"
              onClick={() => setIsAiPanelCollapsed(false)}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-cyan-700 shadow-sm hover:bg-cyan-50"
              title="展开 AI 配置"
            >
              <PanelRightOpen className="h-4 w-4" />
            </button>
            <div className="mt-3 flex flex-1 items-center justify-center">
              <div className="whitespace-nowrap text-xs font-black tracking-normal text-slate-400 [writing-mode:vertical-rl]">
                AI 配置
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="min-w-0 text-sm font-black text-slate-700">AI 配置</div>
              <button
                type="button"
                onClick={() => setIsAiPanelCollapsed(true)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                title="收起 AI 配置"
              >
                <PanelRightClose className="h-4 w-4" />
              </button>
            </div>
            <CombinedAiConfigSelect
              className="w-full"
              modelValue={modelValue}
              promptValue={promptValue}
              modelOptions={modelOptions}
              promptOptions={promptOptions}
              onModelChange={setModelValue}
              onPromptChange={setPromptValue}
              onModelManage={() => undefined}
              onPromptManage={() => undefined}
            />

            <section className="mt-3 rounded-md border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-black text-slate-900">当前小说信息</h2>
                  <p className="mt-0.5 text-xs text-slate-400">读取当前页可见信息</p>
                </div>
                <button
                  type="button"
                  onClick={readCurrentBook}
                  disabled={isReading}
                  className="h-8 rounded-md border border-cyan-100 bg-cyan-50 px-3 text-xs font-black text-cyan-700 disabled:text-slate-300"
                >
                  {isReading ? '读取中' : '读取'}
                </button>
              </div>
              {hasBookInfo ? (
                <div className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
                  <div className="flex items-start gap-2 rounded-md bg-slate-50 p-2">
                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-black text-slate-900">{sampleBookInfo.title}</div>
                      <div className="truncate">
                        {sampleBookInfo.category} · {sampleBookInfo.status}
                      </div>
                      <div className="truncate">{sampleBookInfo.rank}</div>
                    </div>
                  </div>
                  <p>{sampleBookInfo.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {sampleBookInfo.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-cyan-50 px-2 py-0.5 font-bold text-cyan-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs leading-5 text-slate-400">
                  在中间浏览器打开小说详情页后点击读取。
                </div>
              )}
            </section>

            <section className="mt-3 rounded-md border border-slate-200 bg-white p-3">
              <div className="text-sm font-black text-slate-900">题材迁移</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {targetGenres.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => setTargetGenre(genre)}
                    className={`h-8 rounded-md border text-xs font-black ${
                      targetGenre === genre
                        ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </section>

            <section className="relative mt-3 min-h-0 flex-1">
              <div className="xy-floating-outline-clear-button xy-border-embedded-transparent-backplate absolute -top-2 right-4 z-40 flex items-center gap-3 px-1">
                <button
                  type="button"
                  onClick={() => setAiOutput('')}
                  className="text-xs font-black text-red-500 hover:text-red-600"
                >
                  清空
                </button>
              </div>
              <div className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill h-full xy-has-value">
                <div className="xy-floating-rich-preview editor-scrollbar h-full w-full overflow-y-auto text-sm leading-6 text-slate-700">
                  {isAnalyzing ? (
                    <div className="flex h-full items-center justify-center gap-2 text-sm font-black text-cyan-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI 正在进行题材迭代
                    </div>
                  ) : aiOutput.trim() ? (
                    <pre className="whitespace-pre-wrap break-words">{aiOutput}</pre>
                  ) : (
                    <span className="text-slate-400">题材迭代结果会显示在这里。</span>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-2 shrink-0 rounded-md border border-slate-200 bg-white p-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={captureBrowserToInput}
                  className="flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 text-xs font-black text-slate-600 hover:bg-slate-50"
                >
                  <Camera className="h-3.5 w-3.5" />
                  截图到输入框
                </button>
                <button
                  type="button"
                  onClick={startIteration}
                  disabled={isAnalyzing}
                  className="h-8 rounded-md bg-cyan-600 px-3 text-xs font-black text-white hover:bg-cyan-700 disabled:bg-slate-200"
                >
                  开始分析
                </button>
              </div>
              {screenshotPreview && (
                <div className="mb-2 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                  <img src={screenshotPreview} alt="浏览器截图预览" className="h-24 w-full object-cover" />
                </div>
              )}
              <textarea
                value={aiInput}
                onChange={(event) => setAiInput(event.target.value)}
                className="editor-scrollbar h-24 w-full resize-none rounded-md border border-slate-200 bg-slate-50 p-2 text-sm leading-6 text-slate-700 outline-none focus:border-cyan-200 focus:bg-white"
                placeholder="输入题材迭代要求，或点击截图到输入框。"
              />
              {screenshotStatus && <div className="mt-1 truncate text-xs text-slate-400">{screenshotStatus}</div>}
            </section>
          </>
        )}
      </aside>
    </div>
  );
}
