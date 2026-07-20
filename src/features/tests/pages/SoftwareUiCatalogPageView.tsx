/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React from 'react';
export function renderSoftwareUiCatalogPageView(scope: Record<string, any>) {
  const {
    ArrowLeft,
    Check,
    ChevronDown,
    ChevronRight,
    Code2,
    Heart,
    MessageSquare,
    NumberPill,
    NumberSpecInput,
    Palette,
    RenderSpecPreview,
    Search,
    SectionTitle,
    Settings,
    Sparkles,
    SpecPill,
    TechDictionaryCard,
    Type,
    X,
    activeSpecItem,
    activeSpecs,
    activeTab,
    catalogNavGroups,
    catalogNavItems,
    catalogSearch,
    collapsedCatalogContentGroups,
    collapsedCatalogNavGroups,
    collectedColorSamples,
    collectedFontSamples,
    collectedManualUiSamples,
    collectedStandardUiSamples,
    collectedTechItems,
    collectedTotalCount,
    embedded,
    filteredColorSamples,
    filteredFontSamples,
    filteredLandingPreviewSamples,
    filteredManualUiSamples,
    filteredStandardUiSamples,
    filteredTechItems,
    getBaseSpecs,
    getManualUiType,
    groups,
    manualUiGroups,
    navigate,
    onClose,
    renderCollectionButton,
    renderMarkControls,
    restoreUiSpecDefault,
    saveUiSpecDefault,
    scrollToCatalogItem,
    setActiveSpecItemId,
    setActiveTab,
    setCatalogSearch,
    toggleCatalogContentGroup,
    toggleCatalogNavGroup,
    uiSpecDefaults,
    uiSpecOverrides,
    updateUiSpec,
  } = scope;
  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900">UI库</h1>
          <p className="mt-0.5 text-xs text-slate-400">
            以后可以直接说编号，例如“用 UI-18 的分割线”或“用 T-01 那个技术”。
          </p>
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-3 pl-6">
          <label className="xy-ui132-search w-[min(560px,52vw)] max-w-[560px]">
            <Search />
            <input
              type="search"
              value={catalogSearch}
              onChange={(event) => setCatalogSearch(event.target.value)}
              placeholder="搜索编号、名称，例如 UI-138"
            />
            {catalogSearch && (
              <button
                type="button"
                onClick={() => setCatalogSearch('')}
                className="grid h-6 w-6 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="清空搜索"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
          <button
            onClick={() => {
              if (embedded) {
                onClose?.();
                return;
              }
              navigate('/test-collection');
            }}
            className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-500 hover:border-brand/40 hover:bg-brand-light hover:text-brand"
          >
            {embedded ? <X className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {embedded ? '关闭' : '返回测试'}
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden p-7">
        <div className="grid h-full min-h-0 grid-cols-[260px_minmax(0,1fr)] gap-5">
          <aside className="flex min-h-0 flex-col rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
            <div className="mb-3 grid grid-cols-3 rounded-[18px] bg-slate-100 p-1.5">
              <button
                onClick={() => setActiveTab('ui')}
                className={`h-10 rounded-[15px] text-sm font-bold ${activeTab === 'ui' ? 'bg-white text-sky-500 shadow-sm' : 'text-slate-500 hover:bg-white/70'}`}
              >
                UI
              </button>
              <button
                onClick={() => setActiveTab('tech')}
                className={`h-10 rounded-[15px] text-sm font-bold ${activeTab === 'tech' ? 'bg-white text-sky-500 shadow-sm' : 'text-slate-500 hover:bg-white/70'}`}
              >
                技术词典
              </button>
              <button
                onClick={() => setActiveTab('collection')}
                className={`h-10 rounded-[15px] text-sm font-bold ${activeTab === 'collection' ? 'bg-white text-sky-500 shadow-sm' : 'text-slate-500 hover:bg-white/70'}`}
              >
                收藏
              </button>
            </div>
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <div className="text-sm font-black text-slate-900">编号导航</div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-400">
                {catalogNavItems.length}
              </span>
            </div>
            <div className="editor-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto pb-8 pr-1">
              {catalogNavItems.length === 0 ? (
                <div className="rounded-xl bg-slate-50 px-3 py-4 text-xs font-bold leading-5 text-slate-400">
                  没有匹配的编号。
                </div>
              ) : (
                catalogNavGroups.map((group) => {
                  const isCollapsed = collapsedCatalogNavGroups[group.title] ?? false;
                  return (
                    <div key={group.title} className="rounded-xl border border-slate-100 bg-slate-50/70 p-1">
                      <button
                        type="button"
                        onClick={() => toggleCatalogNavGroup(group.title)}
                        className="flex h-8 w-full items-center justify-between rounded-lg px-2 text-left text-xs font-black text-slate-700 transition-colors hover:bg-white hover:text-[#08AACE]"
                      >
                        <span className="flex min-w-0 items-center gap-1.5">
                          {isCollapsed ? (
                            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                          )}
                          <span className="truncate">{group.title}</span>
                        </span>
                        <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-black text-slate-400">
                          {group.items.length}
                        </span>
                      </button>
                      {!isCollapsed && (
                        <div className="mt-1 space-y-0.5">
                          {group.items.map((item) => (
                            <button
                              key={`${group.title}-${item.id}`}
                              type="button"
                              onClick={() => scrollToCatalogItem(item.id, item.tab)}
                              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-sky-50 hover:text-[#08AACE]"
                            >
                              <span className="w-12 shrink-0 text-xs font-black text-[#08AACE]">{item.id}</span>
                              <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-600">
                                {item.label}
                              </span>
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

          <div className="editor-scrollbar min-w-0 overflow-y-auto pr-1">
            {activeTab === 'ui' ? (
              <div className="space-y-5">
                <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <SectionTitle
                    icon={<Type className="h-5 w-5 text-brand" />}
                    title="字体设置"
                    desc="全软件常用字号和字重，之后按 F 编号复用。"
                  />
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
                    {filteredFontSamples.map((item) => (
                      <div
                        id={`catalog-${item.id}`}
                        key={item.id}
                        className="scroll-mt-7 rounded-xl border border-slate-100 bg-slate-50 p-3"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <NumberPill id={item.id} />
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-400">{item.name}</span>
                            {renderCollectionButton(item.id)}
                          </div>
                        </div>
                        <div className={item.className}>{item.sample}</div>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{item.usage}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <SectionTitle
                    icon={<Palette className="h-5 w-5 text-brand" />}
                    title="颜色记录"
                    desc="全软件主要颜色，包含用户指定色和品牌色。"
                  />
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2.5">
                    {filteredColorSamples.map((item) => (
                      <div
                        id={`catalog-${item.id}`}
                        key={item.id}
                        className="scroll-mt-7 overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
                      >
                        <div
                          className={`flex h-16 items-center justify-center ${item.textClass ?? 'text-white'}`}
                          style={{ backgroundColor: item.value }}
                        >
                          <span className="text-xl font-black drop-shadow-sm">{item.id}</span>
                        </div>
                        <div className="p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-bold text-slate-900">{item.name}</div>
                            <div className="flex items-center gap-1.5">
                              <code className="text-[11px] font-bold text-slate-400">{item.value}</code>
                              {renderCollectionButton(item.id)}
                            </div>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.usage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {groups.map((group) => {
                  const isContentCollapsed = collapsedCatalogContentGroups[group] ?? false;
                  return (
                    <section key={group} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <SectionTitle
                          icon={
                            group === 'AI' ? (
                              <MessageSquare className="h-5 w-5 text-brand" />
                            ) : (
                              <Sparkles className="h-5 w-5 text-brand" />
                            )
                          }
                          title={`${group}样式`}
                          desc={`全软件${group}相关的常用 UI 编号。`}
                        />
                        <button
                          type="button"
                          onClick={() => toggleCatalogContentGroup(group)}
                          className="flex h-8 shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-black text-slate-500 hover:border-brand/40 hover:text-brand"
                        >
                          {isContentCollapsed ? (
                            <ChevronRight className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                          {filteredStandardUiSamples.filter((item) => item.group === group).length}
                        </button>
                      </div>
                      {!isContentCollapsed && (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
                          {filteredStandardUiSamples
                            .filter((item) => item.group === group)
                            .map((item) => {
                              const specs = {
                                ...getBaseSpecs(item),
                                ...(uiSpecDefaults[item.id] ?? {}),
                                ...(uiSpecOverrides[item.id] ?? {}),
                              };
                              return (
                                <article
                                  id={`catalog-${item.id}`}
                                  key={item.id}
                                  className="scroll-mt-7 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                                >
                                  <div className="mb-3 flex items-start justify-between gap-3">
                                    <div>
                                      <NumberPill id={item.id} />
                                      <h3 className="mt-1 text-sm font-bold text-slate-900">{item.name}</h3>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-400">
                                        {item.group}
                                      </span>
                                      {renderMarkControls(item.id)}
                                    </div>
                                  </div>
                                  <div className="flex min-h-[112px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
                                    {item.preview}
                                  </div>
                                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{item.usage}</p>

                                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                                    <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                                      <SpecPill label="宽" value={`${specs.width}px`} />
                                      <SpecPill label="高" value={`${specs.height}px`} />
                                      <SpecPill label="字号" value={`${specs.fontSize}px`} />
                                      <SpecPill label="圆角" value={`${specs.radius}px`} />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setActiveSpecItemId(item.id)}
                                      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-[#08AACE] px-3 text-xs font-black text-white shadow-sm hover:bg-brand-dark"
                                    >
                                      <Settings className="h-3.5 w-3.5" />
                                      展开规格
                                    </button>
                                  </div>
                                </article>
                              );
                            })}
                        </div>
                      )}
                    </section>
                  );
                })}

                {(() => {
                  const isManualCollapsed = collapsedCatalogContentGroups.manual ?? true;
                  return (
                    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <SectionTitle
                          icon={<Sparkles className="h-5 w-5 text-brand" />}
                          title="手动上传"
                          desc="收纳你手动发来的 UI 网站代码、样式片段和可复用组件，已合并到 UI 分类里。"
                        />
                        <button
                          type="button"
                          onClick={() => toggleCatalogContentGroup('manual')}
                          className="flex h-8 shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-black text-slate-500 hover:border-brand/40 hover:text-brand"
                        >
                          {isManualCollapsed ? (
                            <ChevronRight className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                          {filteredManualUiSamples.length}
                        </button>
                      </div>
                      {!isManualCollapsed && (
                        <div className="space-y-5">
                          {filteredLandingPreviewSamples.length > 0 && (
                            <section className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                  <h3 className="text-sm font-black text-slate-900">UI 落地预览已勾选</h3>
                                  <p className="mt-1 text-xs font-bold text-slate-400">
                                    从落地预览勾选同步过来的 UI，后续优先核对是否已实际落地。
                                  </p>
                                </div>
                                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-sky-500 shadow-sm">
                                  {filteredLandingPreviewSamples.length} 个
                                </span>
                              </div>
                              <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
                                {filteredLandingPreviewSamples.map((item) => (
                                  <article
                                    id={`catalog-${item.id}`}
                                    key={`landing-${item.id}`}
                                    className="scroll-mt-7 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"
                                  >
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                      <div>
                                        <NumberPill id={item.id} />
                                        <h4 className="mt-1 text-sm font-bold text-slate-900">{item.name}</h4>
                                        <p className="mt-1 text-[11px] font-black text-sky-500">
                                          落地预览勾选项 / {getManualUiType(item)}
                                        </p>
                                      </div>
                                      {renderMarkControls(item.id)}
                                    </div>
                                    <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-sky-200 bg-sky-50/50 p-3">
                                      {item.preview}
                                    </div>
                                    <p className="mt-3 text-xs leading-5 text-slate-500">{item.usage}</p>
                                  </article>
                                ))}
                              </div>
                            </section>
                          )}
                          {manualUiGroups.map((group) => (
                            <section
                              key={group.type}
                              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                            >
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <h3 className="text-sm font-black text-slate-900">{group.type}</h3>
                                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-400 shadow-sm">
                                  {group.items.length} 个
                                </span>
                              </div>
                              <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
                                {group.items.map((item) => (
                                  <article
                                    id={`catalog-${item.id}`}
                                    key={item.id}
                                    className="scroll-mt-7 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                                  >
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                      <div>
                                        <NumberPill id={item.id} />
                                        <h4 className="mt-1 text-sm font-bold text-slate-900">{item.name}</h4>
                                      </div>
                                      <div className="flex flex-col items-end gap-1.5">
                                        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-500">
                                          {group.type}
                                        </span>
                                        {renderMarkControls(item.id)}
                                      </div>
                                    </div>
                                    <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
                                      {item.preview}
                                    </div>
                                    <p className="mt-3 text-xs leading-5 text-slate-500">{item.usage}</p>
                                  </article>
                                ))}
                              </div>
                            </section>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })()}
              </div>
            ) : activeTab === 'manual' ? (
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <SectionTitle
                  icon={<Sparkles className="h-5 w-5 text-brand" />}
                  title="手动上传"
                  desc="收纳你手动发来的 UI 网站代码、样式片段和可复用组件。"
                />
                <div className="space-y-5">
                  {filteredLandingPreviewSamples.length > 0 && (
                    <section className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-black text-slate-900">UI 落地预览已勾选</h3>
                          <p className="mt-1 text-xs font-bold text-slate-400">
                            从落地预览勾选同步过来的 UI，后续优先核对是否已实际落地。
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-sky-500 shadow-sm">
                          {filteredLandingPreviewSamples.length} 个
                        </span>
                      </div>
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
                        {filteredLandingPreviewSamples.map((item) => (
                          <article
                            id={`catalog-${item.id}`}
                            key={`landing-${item.id}`}
                            className="scroll-mt-7 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"
                          >
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div>
                                <NumberPill id={item.id} />
                                <h4 className="mt-1 text-sm font-bold text-slate-900">{item.name}</h4>
                                <p className="mt-1 text-[11px] font-black text-sky-500">
                                  落地预览勾选项 / {getManualUiType(item)}
                                </p>
                              </div>
                              {renderMarkControls(item.id)}
                            </div>
                            <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-sky-200 bg-sky-50/50 p-3">
                              {item.preview}
                            </div>
                            <p className="mt-3 text-xs leading-5 text-slate-500">{item.usage}</p>
                          </article>
                        ))}
                      </div>
                    </section>
                  )}
                  {manualUiGroups.map((group) => (
                    <section key={group.type} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-black text-slate-900">{group.type}</h3>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-400 shadow-sm">
                          {group.items.length} 个
                        </span>
                      </div>
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
                        {group.items.map((item) => (
                          <article
                            id={`catalog-${item.id}`}
                            key={item.id}
                            className="scroll-mt-7 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                          >
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div>
                                <NumberPill id={item.id} />
                                <h4 className="mt-1 text-sm font-bold text-slate-900">{item.name}</h4>
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-500">
                                  {group.type}
                                </span>
                                {renderMarkControls(item.id)}
                              </div>
                            </div>
                            <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
                              {item.preview}
                            </div>
                            <p className="mt-3 text-xs leading-5 text-slate-500">{item.usage}</p>
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </section>
            ) : activeTab === 'collection' ? (
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <SectionTitle
                  icon={<Heart className="h-5 w-5 text-rose-500" />}
                  title="收藏"
                  desc="你收藏过的 UI、字体、颜色和技术词典会集中显示在这里。"
                />
                {collectedTotalCount === 0 ? (
                  <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-400">
                    还没有收藏内容。点击任意卡片右上角的“收藏”即可加入这里。
                  </div>
                ) : (
                  <div className="space-y-5">
                    {collectedFontSamples.length > 0 && (
                      <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                        <div className="mb-3 text-sm font-black text-slate-900">字体</div>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
                          {collectedFontSamples.map((item) => (
                            <article
                              id={`catalog-${item.id}`}
                              key={item.id}
                              className="scroll-mt-7 rounded-xl border border-slate-100 bg-white p-3"
                            >
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <NumberPill id={item.id} />
                                {renderCollectionButton(item.id)}
                              </div>
                              <div className={item.className}>{item.sample}</div>
                              <p className="mt-2 text-xs leading-5 text-slate-500">{item.usage}</p>
                            </article>
                          ))}
                        </div>
                      </section>
                    )}

                    {collectedColorSamples.length > 0 && (
                      <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                        <div className="mb-3 text-sm font-black text-slate-900">颜色</div>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2.5">
                          {collectedColorSamples.map((item) => (
                            <article
                              id={`catalog-${item.id}`}
                              key={item.id}
                              className="scroll-mt-7 overflow-hidden rounded-xl border border-slate-100 bg-white"
                            >
                              <div
                                className={`flex h-16 items-center justify-center ${item.textClass ?? 'text-white'}`}
                                style={{ backgroundColor: item.value }}
                              >
                                <span className="text-xl font-black drop-shadow-sm">{item.id}</span>
                              </div>
                              <div className="p-3">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="text-sm font-bold text-slate-900">{item.name}</div>
                                  {renderCollectionButton(item.id)}
                                </div>
                                <code className="mt-1 block text-[11px] font-bold text-slate-400">{item.value}</code>
                                <p className="mt-1 text-xs leading-5 text-slate-500">{item.usage}</p>
                              </div>
                            </article>
                          ))}
                        </div>
                      </section>
                    )}

                    {(collectedStandardUiSamples.length > 0 || collectedManualUiSamples.length > 0) && (
                      <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                        <div className="mb-3 text-sm font-black text-slate-900">UI</div>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
                          {[...collectedStandardUiSamples, ...collectedManualUiSamples].map((item) => (
                            <article
                              id={`catalog-${item.id}`}
                              key={item.id}
                              className="scroll-mt-7 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                            >
                              <div className="mb-3 flex items-start justify-between gap-3">
                                <div>
                                  <NumberPill id={item.id} />
                                  <h4 className="mt-1 text-sm font-bold text-slate-900">{item.name}</h4>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                  <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-500">
                                    {item.group}
                                  </span>
                                  {renderMarkControls(item.id)}
                                </div>
                              </div>
                              <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
                                {item.preview}
                              </div>
                              <p className="mt-3 text-xs leading-5 text-slate-500">{item.usage}</p>
                            </article>
                          ))}
                        </div>
                      </section>
                    )}

                    {collectedTechItems.length > 0 && (
                      <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                        <div className="mb-3 text-sm font-black text-slate-900">技术词典</div>
                        <div className="space-y-3">
                          {collectedTechItems.map((item) => (
                            <TechDictionaryCard
                              key={item.id}
                              item={item}
                              action={renderCollectionButton(item.id)}
                              tone="white"
                            />
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}
              </section>
            ) : (
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <SectionTitle
                  icon={<Code2 className="h-5 w-5 text-brand" />}
                  title="技术词典"
                  desc="把你常用的大白话说法，翻译成我后续能直接定位的技术名称。"
                />
                <div className="space-y-3">
                  {filteredTechItems.map((item) => (
                    <TechDictionaryCard key={item.id} item={item} action={renderCollectionButton(item.id)} />
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-bold text-green-700">
                  <Check className="h-5 w-5" />
                  以后你可以直接说“按 UI-13 做角色卡片”或“这里加 T-03 弹窗栈规则”，我会按这个页面的记录去实现。
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
      {activeSpecItem && activeSpecs && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/35 p-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveSpecItemId(null);
          }}
        >
          <section className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <div className="text-2xl font-black leading-none text-[#08AACE]">{activeSpecItem.id}</div>
                <h2 className="mt-1 truncate text-base font-black text-slate-900">{activeSpecItem.name}</h2>
                <p className="mt-1 text-xs font-bold text-slate-400">单独配置展示规格，列表里只保留简洁梗概。</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSpecItemId(null)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                aria-label="关闭规格配置"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-3 text-sm font-black text-slate-900">当前规格</div>
                    <div className="flex flex-wrap gap-1.5">
                      <SpecPill label="宽" value={`${activeSpecs.width}px`} />
                      <SpecPill label="高" value={`${activeSpecs.height}px`} />
                      <SpecPill label="字号" value={`${activeSpecs.fontSize}px`} />
                      <SpecPill label="圆角" value={`${activeSpecs.radius}px`} />
                      <SpecPill label="左右距" value={`${activeSpecs.paddingX}px`} />
                      <SpecPill label="间隔" value={`${activeSpecs.gap}px`} />
                      <SpecPill label="图标" value={`${activeSpecs.iconSize}px`} />
                      <SpecPill label="+/-" value={`${activeSpecs.plusMinusSize}px`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-white p-4 sm:grid-cols-4">
                    <NumberSpecInput
                      label="宽"
                      value={activeSpecs.width}
                      min={24}
                      max={520}
                      onChange={(value) => updateUiSpec(activeSpecItem.id, 'width', value)}
                    />
                    <NumberSpecInput
                      label="高"
                      value={activeSpecs.height}
                      min={20}
                      max={160}
                      onChange={(value) => updateUiSpec(activeSpecItem.id, 'height', value)}
                    />
                    <NumberSpecInput
                      label="字号"
                      value={activeSpecs.fontSize}
                      min={8}
                      max={48}
                      onChange={(value) => updateUiSpec(activeSpecItem.id, 'fontSize', value)}
                    />
                    <NumberSpecInput
                      label="圆角"
                      value={activeSpecs.radius}
                      min={0}
                      max={48}
                      onChange={(value) => updateUiSpec(activeSpecItem.id, 'radius', value)}
                    />
                    <NumberSpecInput
                      label="左右距"
                      value={activeSpecs.paddingX}
                      min={0}
                      max={80}
                      onChange={(value) => updateUiSpec(activeSpecItem.id, 'paddingX', value)}
                    />
                    <NumberSpecInput
                      label="间隔"
                      value={activeSpecs.gap}
                      min={0}
                      max={48}
                      onChange={(value) => updateUiSpec(activeSpecItem.id, 'gap', value)}
                    />
                    <NumberSpecInput
                      label="图标"
                      value={activeSpecs.iconSize}
                      min={8}
                      max={64}
                      onChange={(value) => updateUiSpec(activeSpecItem.id, 'iconSize', value)}
                    />
                    <NumberSpecInput
                      label="+/-"
                      value={activeSpecs.plusMinusSize}
                      min={8}
                      max={72}
                      onChange={(value) => updateUiSpec(activeSpecItem.id, 'plusMinusSize', value)}
                    />
                  </div>
                </div>

                <aside className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 text-sm font-black text-slate-900">规格预览</div>
                  <div className="flex min-h-[180px] items-center justify-center rounded-xl bg-white p-3">
                    <RenderSpecPreview item={activeSpecItem} specs={activeSpecs} />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">{activeSpecItem.usage}</p>
                </aside>
              </div>
            </div>
            <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={() => restoreUiSpecDefault(activeSpecItem.id)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              >
                恢复默认
              </button>
              <button
                type="button"
                onClick={() => saveUiSpecDefault(activeSpecItem.id, activeSpecs)}
                className="h-9 rounded-xl bg-[#08AACE] px-4 text-xs font-black text-white hover:bg-brand-dark"
              >
                设为默认
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
