import React, { useMemo, useRef, useState } from 'react';
import { BookOpen, ExternalLink, FileText, Globe, Loader2, RefreshCw, Sparkles } from 'lucide-react';

import {
  getBrowserHostLabel,
  isEmbeddedBrowserEnabled,
  normalizeBrowserUrl,
} from '@/shared/browser/browserUrl';
import { ActionButton } from '@/shared/ui/ActionButton';
import { CapsuleSelect } from '@/shared/ui/CapsuleSelect';

const TOMATO_BROWSER_PARTITION = 'persist:xinyuexia-tomato-genre-iteration-test';
const TOMATO_DEFAULT_URL = 'https://fanqienovel.com/rank';
const TOMATO_DESKTOP_MIN_WIDTH = 1280;

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

const genreOptions = [
  { value: '玄幻', label: '玄幻' },
  { value: '仙侠', label: '仙侠' },
  { value: '科幻', label: '科幻' },
  { value: '灵异', label: '灵异' },
  { value: '末世', label: '末世' },
  { value: '都市', label: '都市' },
];

export function TomatoGenreIterationTestPage() {
  const webviewRef = useRef<ElectronWebviewElement | null>(null);
  const [inputUrl, setInputUrl] = useState(TOMATO_DEFAULT_URL);
  const [currentUrl, setCurrentUrl] = useState(TOMATO_DEFAULT_URL);
  const [pageTitle, setPageTitle] = useState('番茄小说排行榜');
  const [targetGenre, setTargetGenre] = useState('玄幻');
  const [isReading, setIsReading] = useState(false);
  const [hasBookInfo, setHasBookInfo] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const embeddedBrowserEnabled = isEmbeddedBrowserEnabled();
  const hostLabel = useMemo(() => getBrowserHostLabel(currentUrl), [currentUrl]);

  const openUrl = (rawUrl: string) => {
    const nextUrl = normalizeBrowserUrl(rawUrl) || TOMATO_DEFAULT_URL;
    setCurrentUrl(nextUrl);
    setInputUrl(nextUrl);
    setPageTitle(getBrowserHostLabel(nextUrl));
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

  const startIteration = () => {
    setIsAnalyzing(true);
    window.setTimeout(() => setIsAnalyzing(false), 700);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 text-slate-900">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5">
        <div className="min-w-0">
          <div className="text-lg font-black">题材迭代 · 番茄榜单原型</div>
          <div className="mt-0.5 truncate text-xs text-slate-400">用户在内置浏览器打开番茄小说，软件读取当前可见的书名、简介、标签和目录信息，再做题材迁移。</div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ActionButton size="sm" variant="secondary" onClick={readCurrentBook} disabled={isReading}>
            {isReading ? '读取中' : '读取当前小说'}
          </ActionButton>
          <ActionButton size="sm" onClick={startIteration} disabled={!hasBookInfo || isAnalyzing}>
            {isAnalyzing ? '分析中' : '开始题材迭代'}
          </ActionButton>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[minmax(560px,1.15fr)_minmax(430px,0.85fr)] gap-4 p-4">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 bg-white p-3">
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
              <span className="shrink-0">建议路径：排行榜 → 小说详情页 → 读取当前小说</span>
            </div>
          </div>
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
        </section>

        <section className="flex min-h-0 flex-col gap-4 overflow-hidden">
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900">当前小说信息</h2>
                <p className="mt-1 text-xs text-slate-400">只读取当前详情页可见信息，不自动抓全文。</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-black ${hasBookInfo ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                {hasBookInfo ? '已读取' : '待读取'}
              </span>
            </div>
            {hasBookInfo ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-md bg-slate-50 p-3">
                  <div className="flex items-start gap-3">
                    <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600" />
                    <div className="min-w-0">
                      <div className="truncate text-lg font-black text-slate-900">{sampleBookInfo.title}</div>
                      <div className="mt-1 text-xs text-slate-400">{sampleBookInfo.author} · {sampleBookInfo.category} · {sampleBookInfo.status}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{sampleBookInfo.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sampleBookInfo.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-bold text-cyan-700">{tag}</span>
                  ))}
                </div>
                <div className="rounded-md border border-slate-100 p-3">
                  <div className="text-xs font-black text-slate-400">可见目录样本</div>
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    {sampleBookInfo.chapters.map((chapter) => <div key={chapter}>{chapter}</div>)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-md border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm leading-6 text-slate-400">
                先在左侧打开番茄小说详情页，然后点击“读取当前小说”。
              </div>
            )}
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-4">
            <h2 className="text-base font-black text-slate-900">迭代设置</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-xs font-black text-slate-400">原题材</div>
                <div className="flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-700">自动识别：都市</div>
              </div>
              <div>
                <div className="mb-1 text-xs font-black text-slate-400">目标题材</div>
                <CapsuleSelect value={targetGenre} options={genreOptions} onChange={setTargetGenre} buttonClassName="h-10 w-full" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-bold text-slate-500">
              {['保留爽点', '重写世界观', '规避相似桥段'].map((item) => (
                <div key={item} className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-center">{item}</div>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-slate-200 bg-white">
            <div className="flex h-12 items-center justify-between border-b border-slate-100 px-4">
              <div>
                <h2 className="text-base font-black text-slate-900">AI 题材迭代结果</h2>
                <p className="text-xs text-slate-400">提炼爽点后迁移为{targetGenre}方案</p>
              </div>
              <button className="flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-3 text-xs font-black text-slate-500 hover:bg-slate-50">
                <ExternalLink className="h-3.5 w-3.5" />
                送入梗概
              </button>
            </div>
            <div className="h-[calc(100%-48px)] overflow-auto bg-slate-50 p-4">
              {isAnalyzing ? (
                <div className="flex h-full items-center justify-center gap-2 text-sm font-black text-cyan-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI 正在提炼爽点并迁移题材
                </div>
              ) : hasBookInfo ? (
                <div className="space-y-3 rounded-md bg-white p-4 text-sm leading-7 text-slate-700 shadow-sm">
                  <div className="flex items-center gap-2 text-base font-black text-slate-900"><Sparkles className="h-4 w-4 text-cyan-600" />《万宝灵纹录》</div>
                  <p><strong>核心爽点：</strong>底层主角被轻视，凭借“看穿万物价值”的信息差不断捡漏、打脸、升级。</p>
                  <p><strong>玄幻迁移：</strong>古玩鉴定改为灵器、丹药、功法残卷鉴定；豪门圈改为宗门、商会和炼器世家。</p>
                  <p><strong>金手指：</strong>主角觉醒“万物灵纹眼”，能看见法宝缺陷、材料年份和功法隐藏分支。</p>
                  <p><strong>开篇钩子：</strong>杂役弟子被逐出外门前，在废弃法器堆里看见一枚“残破铜铃”的隐藏神纹。</p>
                  <p><strong>规避提醒：</strong>只保留“信息差捡漏+低开高走”的爽点，不复刻原书人物名、具体交易桥段和章节顺序。</p>
                </div>
              ) : (
                <div className="grid h-full place-items-center">
                  <div className="max-w-sm text-center">
                    <FileText className="mx-auto h-8 w-8 text-slate-300" />
                    <div className="mt-3 text-sm font-black text-slate-700">等待读取小说信息</div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">读取后这里会展示爽点提炼、题材映射、金手指、世界观和开篇钩子。</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
