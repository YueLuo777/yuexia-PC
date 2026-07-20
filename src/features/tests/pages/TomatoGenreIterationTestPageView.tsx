/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React from 'react';
export function renderTomatoGenreIterationTestPageView(scope: Record<string, any>) {
  const {
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
  } = scope;
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
