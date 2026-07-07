import React, { useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Camera,
  ChevronRight,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

import {
  getBrowserHostLabel,
  isEmbeddedBrowserEnabled,
  normalizeBrowserUrl,
} from '@/shared/browser/browserUrl';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';

const TOMATO_BROWSER_PARTITION = 'persist:xinyuexia-tomato-genre-iteration-test';
const TOMATO_DEFAULT_URL = 'https://fanqienovel.com/rank';
const TOMATO_DESKTOP_MIN_WIDTH = 1280;

const tomatoNavItems = [
  { id: 'rank', title: '番茄排行榜', url: 'https://fanqienovel.com/rank', note: '先从榜单挑书' },
  { id: 'male', title: '男频分类', url: 'https://fanqienovel.com/category', note: '找都市、玄幻、脑洞' },
  { id: 'search', title: '搜索小说', url: 'https://fanqienovel.com/search', note: '按书名定位' },
  { id: 'workflow', title: '迭代流程', url: TOMATO_DEFAULT_URL, note: '读取、截图、分析' },
];

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
  const [activeNavId, setActiveNavId] = useState('rank');
  const [inputUrl, setInputUrl] = useState(TOMATO_DEFAULT_URL);
  const [currentUrl, setCurrentUrl] = useState(TOMATO_DEFAULT_URL);
  const [pageTitle, setPageTitle] = useState('番茄小说排行榜');
  const [modelValue, setModelValue] = useState('deepseek');
  const [promptValue, setPromptValue] = useState('genre-iteration');
  const [targetGenre, setTargetGenre] = useState('玄幻');
  const [aiInput, setAiInput] = useState('请读取当前小说的书名、简介、标签、目录标题和截图信息，提炼核心爽点，并迁移成新的题材方案。');
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [screenshotStatus, setScreenshotStatus] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [hasBookInfo, setHasBookInfo] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiOutput, setAiOutput] = useState('');
  const embeddedBrowserEnabled = isEmbeddedBrowserEnabled();
  const hostLabel = useMemo(() => getBrowserHostLabel(currentUrl), [currentUrl]);

  const openUrl = (rawUrl: string) => {
    const nextUrl = normalizeBrowserUrl(rawUrl) || TOMATO_DEFAULT_URL;
    setCurrentUrl(nextUrl);
    setInputUrl(nextUrl);
    setPageTitle(getBrowserHostLabel(nextUrl));
  };

  const openNavItem = (item: (typeof tomatoNavItems)[number]) => {
    setActiveNavId(item.id);
    openUrl(item.url);
  };

  const readCurrentBook = () => {
    setIsReading(true);
    window.setTimeout(() => {
      const view = webviewRef.current;
      setCurrentUrl(view?.getURL?.() || currentUrl);
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
      setAiInput((current) => `${current.trim()}\n\n[已附加浏览器截图：请结合截图里的书名、简介、榜单位置、标签和目录信息分析。]`);
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
    <div className="grid h-full min-h-0 grid-cols-[220px_minmax(560px,1fr)_420px] bg-slate-50 text-slate-900">
      <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-4">
          <div className="text-lg font-black">题材迭代</div>
          <div className="mt-1 text-xs leading-5 text-slate-400">番茄榜单 → 小说详情 → 截图/读取 → AI 换题材</div>
        </div>
        <nav className="space-y-2 p-3">
          {tomatoNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openNavItem(item)}
              className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left transition-colors ${
                activeNavId === item.id
                  ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
                  : 'border-transparent bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-black">{item.title}</span>
                <span className="mt-0.5 block truncate text-xs text-slate-400">{item.note}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-100 p-3 text-xs leading-5 text-slate-400">
          这个原型只读取当前页面可见信息，不自动抓全文。
        </div>
      </aside>

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
            <button
              type="button"
              onClick={() => openUrl(inputUrl)}
              className="h-9 rounded-md bg-cyan-600 px-4 text-sm font-black text-white hover:bg-cyan-700"
            >
              打开
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-400">
            <span className="min-w-0 truncate">当前页面：{pageTitle || hostLabel}</span>
            <span className="shrink-0">中间浏览器保留登录态，右侧负责 AI 配置和输入输出</span>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden bg-white [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
          {embeddedBrowserEnabled ? React.createElement('webview', {
            ref: webviewRef,
            src: currentUrl,
            partition: TOMATO_BROWSER_PARTITION,
            style: {
              display: 'flex',
              width: '100%',
              minWidth: `${TOMATO_DESKTOP_MIN_WIDTH}px`,
              height: '100%',
            },
          }) : (
            <div className="flex h-full items-center justify-center bg-slate-50 px-8 text-center text-sm leading-6 text-slate-500">
              内置浏览器仅在开发模式或显式启用的内部包中开放。这里保留同样布局，用于确认题材迭代工作台结构。
            </div>
          )}
        </div>
      </main>

      <aside className="flex min-h-0 flex-col bg-gray-50 px-4 pb-4 pt-3">
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
                  <div className="truncate">{sampleBookInfo.category} · {sampleBookInfo.status}</div>
                  <div className="truncate">{sampleBookInfo.rank}</div>
                </div>
              </div>
              <p>{sampleBookInfo.description}</p>
              <div className="flex flex-wrap gap-1">
                {sampleBookInfo.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-cyan-50 px-2 py-0.5 font-bold text-cyan-700">{tag}</span>
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
      </aside>
    </div>
  );
}
