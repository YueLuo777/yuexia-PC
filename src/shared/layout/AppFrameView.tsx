/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- AppFrame view receives its typed controller scope.
import React from 'react';
export function renderAppFrameView(scope: Record<string, any>) {
  const {
    APP_SCALE_OPTIONS,
    BookOpen,
    FlaskConical,
    HOME_TAB,
    Minus,
    Plus,
    SoftwareUiCatalogPage,
    Square,
    Suspense,
    THEME_OPTIONS,
    TestCollectionPage,
    X,
    activateTab,
    activeTabId,
    appScale,
    children,
    effectiveScale,
    getScaleLabel,
    handleCloseTab,
    isMaximized,
    isScaleMenuOpen,
    isThemeMenuOpen,
    mouseGestureArrow,
    mouseGestureContinueLabel,
    mouseGestureDirectionLabel,
    mouseGesturePath,
    mouseGesturePreview,
    renderThemeOption,
    routePath,
    setAppScale,
    setIsScaleMenuOpen,
    setIsThemeMenuOpen,
    setShowSoftwareUiCatalog,
    setShowTestCollection,
    showInternalTools,
    showSoftwareUiCatalog,
    showTestCollection,
    tabs,
    themeClassName,
    themeMenuRef,
    themeMode,
    toggleMaximizeWindow,
  } = scope;
  return (
    <div
      data-route-ready={routePath}
      className={`writer-assistant-theme flex h-screen w-screen flex-col overflow-hidden bg-[var(--xy-wa-app-bg)] ${themeClassName}`}
    >
      <header
        className="app-titlebar xy-wa-titlebar flex h-12 shrink-0 items-center border-b px-2"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <nav
          className="flex h-full min-w-0 flex-1 items-center overflow-x-auto"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
          <div
            className="flex h-full max-w-full shrink-0 items-end overflow-hidden"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            {tabs.map((tab) => {
              const isActive = activeTabId === tab.id;
              const isHomeTab = tab.id === HOME_TAB.id;
              return (
                <div
                  key={tab.id}
                  role="button"
                  tabIndex={0}
                  data-titlebar-no-drag="true"
                  style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                  onClick={() => activateTab(tab)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') activateTab(tab);
                  }}
                  className={`workspace-tab group relative flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-t-md border px-3 text-[15px] font-bold text-[#68727f] transition-all hover:text-[#1f2933] ${
                    isActive
                      ? `workspace-tab-active border-[#cfd6df] border-b-white bg-white font-bold text-[#1f2933] shadow-[0_-1px_0_rgba(255,255,255,0.6)_inset] ${isHomeTab ? 'workspace-tab-home' : ''}`
                      : `workspace-tab-inactive border-transparent bg-transparent ${isHomeTab ? 'workspace-tab-home-inactive' : ''}`
                  } ${isHomeTab ? 'w-[126px] text-center' : 'min-w-[128px] max-w-[230px] text-left'}`}
                  title={tab.title}
                >
                  <span className={`${isHomeTab ? 'shrink-0' : 'min-w-0 flex-1 truncate text-center'}`}>
                    {tab.title}
                  </span>
                  {!tab.fixed && (
                    <button
                      type="button"
                      onClick={(event) => handleCloseTab(event, tab)}
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-md transition-colors ${
                        isActive
                          ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                          : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
                      }`}
                      aria-label={`关闭${tab.title}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div
          className="flex shrink-0 items-center gap-1.5"
          data-titlebar-no-drag="true"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {showInternalTools && (
            <>
              <button
                onClick={() => {
                  setShowSoftwareUiCatalog(false);
                  setShowTestCollection(true);
                }}
                className="xy-wa-icon-button"
                title="测试板块"
              >
                <FlaskConical className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setShowTestCollection(false);
                  setShowSoftwareUiCatalog(true);
                }}
                className="xy-wa-icon-button"
                title="UI库"
              >
                <BookOpen className="h-4 w-4" />
              </button>
            </>
          )}
          <div ref={themeMenuRef} className="relative mr-2">
            <button
              type="button"
              onClick={() => {
                setIsScaleMenuOpen(false);
                setIsThemeMenuOpen((prev) => !prev);
              }}
              className={`xy-theme-trigger-button xy-${themeMode}-active`}
              title="主题"
              aria-haspopup="menu"
              aria-expanded={isThemeMenuOpen}
            >
              <span className="xy-theme-trigger-label">主题</span>
            </button>
            {isThemeMenuOpen && (
              <div className="xy-theme-menu absolute right-0 top-10 z-[90] w-52 p-1.5" role="menu" aria-label="主题">
                {THEME_OPTIONS.map(renderThemeOption)}
              </div>
            )}
          </div>
          <div className="relative ml-1">
            <button
              onClick={() => {
                setIsThemeMenuOpen(false);
                setIsScaleMenuOpen((prev) => !prev);
              }}
              className="h-8 min-w-[70px] rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
              title="界面比例"
            >
              {getScaleLabel(appScale)}%
            </button>
            {isScaleMenuOpen && (
              <div className="absolute right-0 top-10 z-[80] w-[104px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                {APP_SCALE_OPTIONS.map((option) => {
                  const isSelected = Math.abs(appScale - option.effectiveScale) < 0.001;
                  return (
                    <button
                      key={option.labelScale}
                      onClick={() => {
                        setAppScale(option.effectiveScale);
                        setIsScaleMenuOpen(false);
                      }}
                      className={`grid h-9 w-full grid-cols-[22px_1fr] items-center px-3 text-left text-sm transition-colors ${
                        isSelected ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-center text-base leading-none">{isSelected ? '✓' : ''}</span>
                      <span>{Math.round(option.labelScale * 100)}%</span>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="hidden">
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
          className="relative origin-top-left overflow-hidden bg-slate-50"
          data-capsule-select-portal-root="true"
          style={{
            width: `${100 / effectiveScale}%`,
            height: `${100 / effectiveScale}%`,
            transform: `scale(${effectiveScale})`,
          }}
        >
          <div className="h-full bg-slate-50">{children}</div>
        </div>
      </div>
      {mouseGesturePreview && (
        <div className="pointer-events-none fixed inset-0 z-[9999]">
          <svg className="absolute inset-0 h-full w-full">
            <path
              d={mouseGesturePath}
              fill="none"
              stroke={mouseGesturePreview.invalid ? '#ef4444' : mouseGesturePreview.ready ? '#0284c7' : '#0ea5e9'}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="5"
            />
          </svg>
          <div
            className={`absolute flex min-w-[140px] items-center gap-3 rounded-2xl border px-5 py-4 text-white shadow-2xl ${
              mouseGesturePreview.invalid ? 'border-red-500 bg-red-600' : 'border-slate-700 bg-slate-950'
            }`}
            style={{
              left: Math.max(20, mouseGesturePreview.startX - 92),
              top: Math.max(58, mouseGesturePreview.startY - 96),
            }}
          >
            <span className="text-4xl leading-none">{mouseGestureArrow}</span>
            <span className="text-lg font-black text-white">
              {mouseGesturePreview.invalid
                ? '无效手势'
                : mouseGesturePreview.ready
                  ? mouseGestureDirectionLabel
                  : mouseGestureContinueLabel}
            </span>
          </div>
        </div>
      )}
      {showInternalTools && showTestCollection && TestCollectionPage && (
        <div
          className="fixed inset-0 z-[335] flex items-center justify-center bg-slate-950/45 p-5"
          data-titlebar-no-drag="true"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowTestCollection(false);
          }}
        >
          <div
            className="flex h-[min(820px,90vh)] w-[min(1180px,94vw)] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">
                  正在打开测试...
                </div>
              }
            >
              <TestCollectionPage embedded onClose={() => setShowTestCollection(false)} />
            </Suspense>
          </div>
        </div>
      )}
      {showInternalTools && showSoftwareUiCatalog && SoftwareUiCatalogPage && (
        <div
          className="fixed inset-0 z-[340] flex items-center justify-center bg-slate-950/45 p-5"
          data-titlebar-no-drag="true"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowSoftwareUiCatalog(false);
          }}
        >
          <div
            className="flex h-[min(900px,92vh)] w-[min(1520px,96vw)] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">
                  正在打开 UI库...
                </div>
              }
            >
              <SoftwareUiCatalogPage embedded onClose={() => setShowSoftwareUiCatalog(false)} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
