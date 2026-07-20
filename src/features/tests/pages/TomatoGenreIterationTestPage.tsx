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
import { renderTomatoGenreIterationTestPageView } from './TomatoGenreIterationTestPageView';

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

  return renderTomatoGenreIterationTestPageView({
    BookOpen,
    Camera,
    CombinedAiConfigSelect,
    ExternalLink,
    Globe,
    Loader2,
    PanelRightClose,
    PanelRightOpen,
    React,
    RefreshCw,
    Sparkles,
    Star,
    TOMATO_BROWSER_DESKTOP_MIN_WIDTH,
    TOMATO_BROWSER_PARTITION,
    Trash2,
    activeNavId,
    aiInput,
    aiOutput,
    bookmarkName,
    bookmarks,
    captureBrowserToInput,
    currentUrl,
    embeddedBrowserEnabled,
    hasBookInfo,
    homeUrl,
    inputUrl,
    isAiPanelCollapsed,
    isAnalyzing,
    isReading,
    layoutColumns,
    modelOptions,
    modelValue,
    openHome,
    openNavItem,
    openUrl,
    promptOptions,
    promptValue,
    readCurrentBook,
    removeBookmark,
    sampleBookInfo,
    saveCurrentBookmark,
    screenshotPreview,
    screenshotStatus,
    setAiInput,
    setAiOutput,
    setBookmarkName,
    setCurrentAsHome,
    setInputUrl,
    setIsAiPanelCollapsed,
    setModelValue,
    setPromptValue,
    setTargetGenre,
    startAiPanelResize,
    startIteration,
    targetGenre,
    targetGenres,
    tomatoNavItems,
    webviewRef,
  });
}
