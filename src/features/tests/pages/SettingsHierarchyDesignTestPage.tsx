import { AppWindow, BookImage, DatabaseBackup, Keyboard, Link2, Monitor, Route, Search, Settings } from 'lucide-react';
import { useMemo, useState, type ComponentType } from 'react';

type SchemeId = 'top-navigation' | 'icon-rail' | 'card-drill-down' | 'search-first' | 'single-page';
type SystemTab = 'window' | 'association' | 'appIcon';

const USER_SETTINGS = ['系统设置', '数据迁移', '快捷键设置', '导航设置', '默认封面设置'] as const;
const SYSTEM_TABS: Array<{ id: SystemTab; label: string; icon: typeof Monitor }> = [
  { id: 'window', label: '窗口', icon: Monitor },
  { id: 'association', label: '关联设置', icon: Link2 },
  { id: 'appIcon', label: '软件图标', icon: AppWindow },
];
const SCHEMES: Array<{ id: SchemeId; number: string; title: string; summary: string; strength: string }> = [
  {
    id: 'top-navigation',
    number: '方案二',
    title: '全顶部导航',
    summary: '一级设置横向排列，系统子项位于内容标题右侧。',
    strength: '内容最宽',
  },
  {
    id: 'icon-rail',
    number: '方案三',
    title: '图标窄栏＋文字次栏',
    summary: '左侧只放图标，选中后在旁边展开当前分类文字列表。',
    strength: '切换最快',
  },
  {
    id: 'card-drill-down',
    number: '方案四',
    title: '卡片首页逐级进入',
    summary: '设置首页只展示入口卡片，进入后专注当前页面。',
    strength: '最易理解',
  },
  {
    id: 'search-first',
    number: '方案五',
    title: '搜索优先设置中心',
    summary: '默认先搜索设置项，同时保留少量常用快捷入口。',
    strength: '查找最快',
  },
  {
    id: 'single-page',
    number: '方案六',
    title: '单页折叠设置',
    summary: '所有设置纵向排列，用折叠区代替多级页面切换。',
    strength: '路径最少',
  },
];

function WindowSettingsPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid gap-3 md:grid-cols-2 ${compact ? 'py-3' : 'py-4'}`}>
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h3 className="text-sm font-black text-slate-950">记住窗口大小</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">下次启动时继续使用当前窗口的宽高和位置。</p>
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-[11px] font-bold text-slate-500">
            <span className="rounded-md bg-slate-100 px-2.5 py-1">默认 1366 × 768</span>
            <span className="rounded-md bg-slate-100 px-2.5 py-1">当前 2064 × 1120</span>
          </div>
          <button type="button" className="h-8 rounded-md bg-[#08AACE] px-3 text-xs font-black text-white">
            已开启
          </button>
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h3 className="text-sm font-black text-slate-950">恢复默认窗口大小</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">清除保存的窗口尺寸，并立即恢复默认宽高。</p>
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
            启动尺寸 1366 × 768
          </span>
          <button type="button" className="h-8 rounded-md bg-[#08AACE] px-3 text-xs font-black text-white">
            恢复默认
          </button>
        </div>
      </section>
    </div>
  );
}

function SystemContent({ tab }: { tab: SystemTab }) {
  if (tab === 'window') return <WindowSettingsPreview />;
  const association = tab === 'association';
  return (
    <div className="py-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-black text-slate-950">{association ? '关联有效期' : '软件图标'}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {association
            ? '控制章节、上下文和关联资料在软件关闭后是否继续保留。'
            : '查看当前软件图标，并从项目图标目录中选择新的图标。'}
        </p>
      </div>
    </div>
  );
}

function SystemTabButtons({ active, onChange }: { active: SystemTab; onChange: (tab: SystemTab) => void }) {
  return (
    <div className="flex items-center gap-2" aria-label="系统设置子导航">
      {SYSTEM_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? 'page' : undefined}
          className={`h-10 rounded-lg px-4 text-sm font-black transition-colors ${
            active === tab.id ? 'bg-[#08AACE] text-white' : 'text-slate-500 hover:bg-[#E7F8FD] hover:text-[#08AACE]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function TopNavigationPreview() {
  const [activeSection, setActiveSection] = useState<(typeof USER_SETTINGS)[number]>('系统设置');
  const [activeTab, setActiveTab] = useState<SystemTab>('window');
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-6 pt-4">
        <h2 className="text-xl font-black text-slate-950">设置</h2>
        <nav className="mt-3 flex gap-1 overflow-x-auto" aria-label="方案二一级导航">
          {USER_SETTINGS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveSection(item)}
              aria-current={activeSection === item ? 'page' : undefined}
              className={`h-10 whitespace-nowrap border-b-2 px-4 text-sm font-black ${
                activeSection === item ? 'border-[#A9EAF5] text-[#08AACE]' : 'border-transparent text-slate-500'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex min-h-[72px] items-center justify-between gap-4 border-b border-slate-100 px-6 py-3">
        <div>
          <h3 className="text-xl font-black text-slate-950">{activeSection}</h3>
          <p className="mt-1 text-sm font-bold text-slate-400">窗口、关联、软件图标</p>
        </div>
        {activeSection === '系统设置' ? <SystemTabButtons active={activeTab} onChange={setActiveTab} /> : null}
      </div>
      <div className="mx-auto min-h-[220px] w-full max-w-[1080px] px-6">
        {activeSection === '系统设置' ? (
          <SystemContent tab={activeTab} />
        ) : (
          <PreviewPlaceholder title={activeSection} />
        )}
      </div>
    </div>
  );
}

function IconRailPreview() {
  const railItems = [Settings, DatabaseBackup, Keyboard, Route, BookImage];
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<SystemTab>('window');
  return (
    <div className="grid min-h-[420px] grid-cols-[68px_218px_minmax(0,1fr)] overflow-hidden rounded-xl border border-slate-200 bg-white">
      <nav className="border-r border-slate-100 bg-slate-50 px-2 py-4" aria-label="方案三图标导航">
        <div className="mb-4 text-center text-xs font-black text-[#08AACE]">设置</div>
        <div className="space-y-2">
          {railItems.map((Icon, index) => (
            <button
              key={USER_SETTINGS[index]}
              type="button"
              title={USER_SETTINGS[index]}
              aria-label={USER_SETTINGS[index]}
              aria-current={activeIndex === index ? 'page' : undefined}
              onClick={() => setActiveIndex(index)}
              className={`grid h-11 w-full place-items-center rounded-xl ${
                activeIndex === index ? 'bg-[#08AACE] text-white shadow-sm' : 'text-slate-400 hover:bg-white'
              }`}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </nav>
      <aside className="border-r border-slate-100 px-3 py-5">
        <h2 className="px-2 text-lg font-black text-slate-950">{USER_SETTINGS[activeIndex]}</h2>
        <div className="mt-4 space-y-1">
          {(activeIndex === 0 ? SYSTEM_TABS.map((item) => item.label) : ['常规选项', '高级选项']).map(
            (label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => activeIndex === 0 && setActiveTab(SYSTEM_TABS[index].id)}
                className={`h-10 w-full rounded-lg px-3 text-left text-sm font-black ${
                  activeIndex === 0 && SYSTEM_TABS[index].id === activeTab
                    ? 'bg-[#E7F8FD] text-[#078FAE]'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ),
          )}
        </div>
      </aside>
      <main className="min-w-0 px-7 py-5">
        <h3 className="text-xl font-black text-slate-950">
          {activeIndex === 0 ? SYSTEM_TABS.find((item) => item.id === activeTab)?.label : USER_SETTINGS[activeIndex]}
        </h3>
        <div className="mt-2">
          {activeIndex === 0 ? (
            <SystemContent tab={activeTab} />
          ) : (
            <PreviewPlaceholder title={USER_SETTINGS[activeIndex]} />
          )}
        </div>
      </main>
    </div>
  );
}

function CardDrillDownPreview() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  return (
    <div className="min-h-[420px] rounded-xl border border-slate-200 bg-white p-6">
      {activeSection ? (
        <>
          <button type="button" onClick={() => setActiveSection(null)} className="text-sm font-black text-[#08AACE]">
            ← 返回设置首页
          </button>
          <div className="mt-5 border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-black text-slate-950">{activeSection}</h2>
            <p className="mt-1 text-sm text-slate-400">当前只显示这一项设置，减少同时出现的导航层级。</p>
          </div>
          <div className="mx-auto max-w-[900px]">
            {activeSection === '系统设置' ? (
              <SystemContent tab="window" />
            ) : (
              <PreviewPlaceholder title={activeSection} />
            )}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-black text-slate-950">设置首页</h2>
          <p className="mt-1 text-sm text-slate-400">选择需要调整的功能。</p>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {USER_SETTINGS.map((item, index) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveSection(item)}
                className="min-h-[110px] rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-[#8FE4F2] hover:bg-[#F4FCFE]"
              >
                <span className="text-xs font-black text-[#08AACE]">{String(index + 1).padStart(2, '0')}</span>
                <span className="mt-3 block text-base font-black text-slate-900">{item}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-400">点击进入独立设置页面</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SearchFirstPreview() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('系统设置');
  const results = useMemo(() => USER_SETTINGS.filter((item) => !query.trim() || item.includes(query.trim())), [query]);
  return (
    <div className="min-h-[420px] rounded-xl border border-slate-200 bg-white p-6">
      <div className="mx-auto max-w-[900px]">
        <h2 className="text-center text-2xl font-black text-slate-950">想调整什么？</h2>
        <label className="mx-auto mt-5 flex h-12 max-w-[620px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-[#08AACE]">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索窗口、快捷键、封面……"
            className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-700 outline-none"
          />
        </label>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {USER_SETTINGS.slice(0, 3).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSelected(item)}
              className="rounded-full bg-[#E7F8FD] px-4 py-2 text-xs font-black text-[#078FAE]"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
          <div className="rounded-xl border border-slate-100 p-2">
            {results.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSelected(item)}
                className={`h-10 w-full rounded-lg px-3 text-left text-sm font-black ${selected === item ? 'bg-[#08AACE] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {item}
              </button>
            ))}
            {results.length === 0 ? (
              <div className="px-3 py-5 text-center text-sm text-slate-400">没有匹配的设置</div>
            ) : null}
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
            <h3 className="text-xl font-black text-slate-950">{selected}</h3>
            <PreviewPlaceholder title={selected} compact />
          </div>
        </div>
      </div>
    </div>
  );
}

function SinglePagePreview() {
  const [openSections, setOpenSections] = useState(() => new Set<string>(['系统设置']));
  const toggle = (section: string) => {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };
  return (
    <div className="min-h-[420px] rounded-xl border border-slate-200 bg-white p-6">
      <div className="mx-auto max-w-[940px]">
        <h2 className="text-2xl font-black text-slate-950">全部设置</h2>
        <p className="mt-1 text-sm text-slate-400">不离开当前页面，按需要展开设置。</p>
        <div className="mt-5 space-y-2">
          {USER_SETTINGS.map((item) => {
            const open = openSections.has(item);
            return (
              <section key={item} className="overflow-hidden rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => toggle(item)}
                  aria-expanded={open}
                  className={`flex h-12 w-full items-center justify-between px-4 text-left text-sm font-black ${open ? 'bg-[#E7F8FD] text-[#078FAE]' : 'bg-white text-slate-700'}`}
                >
                  <span>{item}</span>
                  <span>{open ? '收起' : '展开'}</span>
                </button>
                {open ? (
                  <div className="px-5">
                    {item === '系统设置' ? (
                      <WindowSettingsPreview compact />
                    ) : (
                      <PreviewPlaceholder title={item} compact />
                    )}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PreviewPlaceholder({ title, compact = false }: { title: string; compact?: boolean }) {
  return (
    <div className={`${compact ? 'py-4' : 'py-10'} text-sm font-bold leading-6 text-slate-400`}>
      {title}的真实内容在正式设置页中保持不变，这里只比较入口、导航和页面层级。
    </div>
  );
}

const PREVIEW_BY_SCHEME: Record<SchemeId, ComponentType> = {
  'top-navigation': TopNavigationPreview,
  'icon-rail': IconRailPreview,
  'card-drill-down': CardDrillDownPreview,
  'search-first': SearchFirstPreview,
  'single-page': SinglePagePreview,
};

export function SettingsHierarchyDesignTestPage() {
  const [activeScheme, setActiveScheme] = useState<SchemeId>('top-navigation');
  const activeMeta = SCHEMES.find((item) => item.id === activeScheme) ?? SCHEMES[0];
  const ActivePreview = PREVIEW_BY_SCHEME[activeScheme];

  return (
    <div className="min-h-full overflow-y-auto bg-[#F2F5F8] p-5 text-slate-700">
      <div className="mx-auto max-w-[1420px]">
        <header className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <span className="text-xs font-black tracking-[0.18em] text-[#08AACE]">SETTINGS DESIGN TEST</span>
          <h1 className="mt-2 text-2xl font-black text-slate-950">软件设置入口多方案</h1>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            继续比较设置入口打开后的信息架构；这里只改测试页，不改左下角入口和正式设置内容。
          </p>
        </header>

        <section className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5" aria-label="设置布局方案">
          {SCHEMES.map((scheme) => (
            <button
              key={scheme.id}
              type="button"
              onClick={() => setActiveScheme(scheme.id)}
              aria-pressed={activeScheme === scheme.id}
              className={`rounded-xl border p-4 text-left transition-colors ${
                activeScheme === scheme.id
                  ? 'border-[#08AACE] bg-[#E7F8FD] shadow-sm'
                  : 'border-slate-200 bg-white hover:border-[#8FE4F2]'
              }`}
            >
              <span className="text-xs font-black text-[#08AACE]">{scheme.number}</span>
              <span className="mt-2 block text-base font-black text-slate-950">{scheme.title}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">{scheme.summary}</span>
              <span className="mt-3 inline-block rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-500">
                {scheme.strength}
              </span>
            </button>
          ))}
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-end justify-between gap-4 px-1">
            <div>
              <div className="text-xs font-black text-[#08AACE]">{activeMeta.number}</div>
              <h2 className="mt-1 text-xl font-black text-slate-950">{activeMeta.title}</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
              {activeMeta.strength}
            </span>
          </div>
          <ActivePreview />
        </section>
      </div>
    </div>
  );
}
