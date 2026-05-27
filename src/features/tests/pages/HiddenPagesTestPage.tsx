import { ArrowLeft, ChevronRight, EyeOff, FolderOpen, Route, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type HiddenItem = {
  title: string;
  path?: string;
  status: 'hidden-route' | 'test-route' | 'embedded';
  description: string;
  conclusion: string;
  selectable?: boolean;
};

const statusMeta: Record<HiddenItem['status'], { label: string; className: string }> = {
  'hidden-route': {
    label: '隐藏路由',
    className: 'bg-amber-50 text-amber-700',
  },
  'test-route': {
    label: '测试入口',
    className: 'bg-blue-50 text-blue-700',
  },
  embedded: {
    label: '内嵌功能',
    className: 'bg-slate-100 text-slate-600',
  },
};

const groups: Array<{ title: string; desc: string; items: HiddenItem[] }> = [
  {
    title: '保留的隐藏入口',
    desc: '这些路由仍被现有功能、测试专区或工作区使用，暂不删除。',
    items: [
      {
        title: '脚本编辑器 V2',
        path: '/script-editor-v2',
        status: 'hidden-route',
        description: '我的剧本、作品工作区标签会打开这个编辑器路由。',
        conclusion: '不能删除。删除会影响创作专区里剧本作品进入编辑器。',
        selectable: false,
      },
      {
        title: '脑洞库旧入口',
        path: '/idea-library',
        status: 'hidden-route',
        description: '大纲生成器里仍有按钮跳转到这个路由。',
        conclusion: '暂不删除。要删需要先把大纲生成器里的跳转改到当前库入口，否则会影响创作专区。',
        selectable: false,
      },
      {
        title: '内置浏览器测试页',
        path: '/test-browser',
        status: 'test-route',
        description: '测试专区仍保留的浏览器测试能力。',
        conclusion: '不属于“可以删除且不影响”的项；删除会让测试专区入口失效。',
        selectable: false,
      },
    ],
  },
  {
    title: '测试专区入口',
    desc: '这些页面只在测试中使用，不影响创作专区和数据专区。',
    items: [
      {
        title: 'AI 生成链路测试中心',
        path: '/brainstorm-ai-chain-test',
        status: 'test-route',
        description: '用于检查脑洞、设定、大纲等链路发给 AI 的完整内容。',
        conclusion: '可以以后单独删，但当前仍作为测试专区工具保留。',
      },
      {
        title: 'UI库',
        path: '/software-ui-catalog',
        status: 'test-route',
        description: 'UI 规范、手动上传和技术词典的记录页。',
        conclusion: '当前测试页面和调整模式里仍有入口，暂不删。',
        selectable: false,
      },
      {
        title: '主题颜色',
        path: '/theme-colors',
        status: 'test-route',
        description: '主题色配置测试页。',
        conclusion: '保留正式 /theme-colors；旧别名 /dark-theme-colors 已删除。',
        selectable: false,
      },
    ],
  },
  {
    title: '复用组件',
    desc: '这些不是独立入口，仍由创作专区或数据专区内嵌调用。',
    items: [
      {
        title: '剧情库内嵌视图',
        status: 'embedded',
        description: '提炼剧情页面会内嵌剧情库。',
        conclusion: '组件不能删；已只删除 /plot-library 独立路由，不影响提炼剧情。',
        selectable: false,
      },
      {
        title: '脑洞库内嵌视图',
        status: 'embedded',
        description: '库页面会内嵌脑洞库。',
        conclusion: '组件不能删；已只删除 /brainstorm-library 独立路由，不影响库页面。',
        selectable: false,
      },
      {
        title: '封面库内嵌视图',
        status: 'embedded',
        description: '库页面会内嵌封面库。',
        conclusion: '组件不能删；已只删除 /cover-library 独立路由，不影响库页面。',
        selectable: false,
      },
      {
        title: '模型管理弹窗',
        status: 'embedded',
        description: '作品页 AI 对话、大纲设定等位置会打开模型管理。',
        conclusion: '不能删。删除会影响数据专区和创作专区里的模型维护入口。',
        selectable: false,
      },
      {
        title: '提示词管理弹窗',
        status: 'embedded',
        description: '作品页 AI 对话、大纲设定、脑洞生成等位置会打开提示词管理。',
        conclusion: '不能删。删除会影响提示词维护和创作链路。',
        selectable: false,
      },
    ],
  },
];

const statusIcons: Record<HiddenItem['status'], typeof EyeOff> = {
  'hidden-route': EyeOff,
  'test-route': Route,
  embedded: FolderOpen,
};

const DELETE_SELECTION_STORAGE_KEY = 'xinyuexia_hidden_pages_delete_selection_v1';

function getHiddenItemKey(item: HiddenItem) {
  return `${item.status}::${item.path ?? 'embedded'}::${item.title}`;
}

function readDeleteSelection() {
  if (typeof window === 'undefined') return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(DELETE_SELECTION_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function writeDeleteSelection(selectedKeys: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DELETE_SELECTION_STORAGE_KEY, JSON.stringify(selectedKeys));
}

export function HiddenPagesTestPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [conclusionTarget, setConclusionTarget] = useState<HiddenItem | null>(null);
  const [selectedDeleteKeys, setSelectedDeleteKeys] = useState<string[]>(readDeleteSelection);

  const visibleGroups = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => (
          item.title.toLowerCase().includes(keyword) ||
          item.description.toLowerCase().includes(keyword) ||
          item.conclusion.toLowerCase().includes(keyword) ||
          statusMeta[item.status].label.toLowerCase().includes(keyword) ||
          (item.path ?? '').toLowerCase().includes(keyword)
        )),
      }))
      .filter((group) => group.items.length > 0);
  }, [search]);

  const totalCount = groups.reduce((sum, group) => sum + group.items.length, 0);
  const selectedDeleteSet = useMemo(() => new Set(selectedDeleteKeys), [selectedDeleteKeys]);
  const selectedDeleteCount = selectedDeleteKeys.length;

  const toggleDeleteSelection = (item: HiddenItem) => {
    if (item.selectable === false) return;
    const itemKey = getHiddenItemKey(item);
    setSelectedDeleteKeys((current) => {
      const next = current.includes(itemKey) ? current.filter((key) => key !== itemKey) : [...current, itemKey];
      writeDeleteSelection(next);
      return next;
    });
  };

  const clearDeleteSelection = () => {
    setSelectedDeleteKeys([]);
    writeDeleteSelection([]);
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="flex min-h-[4rem] shrink-0 items-center border-b border-slate-100 bg-white px-6 py-3">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900">隐藏页面</h1>
            <p className="mt-0.5 text-xs text-slate-400">只保留仍需检查的隐藏入口和复用组件，共 {totalCount} 项。</p>
            {selectedDeleteCount > 0 && (
              <div className="mt-2 flex items-center gap-2 text-xs font-bold text-red-500">
                <span>已勾选 {selectedDeleteCount} 项待删除</span>
                <button type="button" className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] text-red-600 hover:bg-red-100" onClick={clearDeleteSelection}>
                  清空
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/test-collection')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-brand"
              title="返回测试"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="relative w-[280px] max-w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索页面、路径或状态"
                className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition-colors focus:border-brand focus:bg-white"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-7 py-7">
        <div className="space-y-7">
          {visibleGroups.map((group) => (
            <section key={group.title}>
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-800">{group.title}</h2>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-500">{group.items.length}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{group.desc}</p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {group.items.map((item) => {
                  const StatusIcon = statusIcons[item.status];
                  const canOpen = Boolean(item.path);
                  const itemKey = getHiddenItemKey(item);
                  const isDeleteMarked = selectedDeleteSet.has(itemKey);
                  const canSelect = item.selectable !== false;
                  return (
                    <article
                      key={itemKey}
                      className={`flex min-h-[156px] flex-col rounded-2xl border p-5 shadow-sm transition-colors ${
                        isDeleteMarked ? 'border-red-200 bg-red-50/50 ring-1 ring-red-100' : 'border-slate-100 bg-white'
                      }`}
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-base font-bold text-slate-900">{item.title}</div>
                            {item.path && <div className="mt-1 truncate text-xs font-semibold text-slate-400">{item.path}</div>}
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusMeta[item.status].className}`}>
                          {statusMeta[item.status].label}
                        </span>
                      </div>
                      <p className="min-h-[42px] text-sm leading-6 text-slate-500">{item.description}</p>
                      <div className="mt-auto pt-4">
                        <div className="flex flex-wrap gap-2">
                          <label
                            className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition-colors ${
                              canSelect
                                ? isDeleteMarked
                                  ? 'cursor-pointer border-red-200 bg-white text-red-600'
                                  : 'cursor-pointer border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:text-red-500'
                                : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isDeleteMarked}
                              disabled={!canSelect}
                              onChange={() => toggleDeleteSelection(item)}
                              className="h-4 w-4 rounded border-slate-300 text-red-500 focus:ring-red-200 disabled:text-slate-200"
                            />
                            待删除
                          </label>
                          <button
                            type="button"
                            disabled={!canOpen}
                            onClick={() => item.path && navigate(item.path)}
                            className="xy-arrow-action-button xy-arrow-action-compact disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            <span className="xy-arrow-action-icon" aria-hidden="true"><ChevronRight className="h-4 w-4" /></span>
                            <span className="xy-arrow-action-text">{canOpen ? '打开检查' : '不可打开'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConclusionTarget(item)}
                            className="inline-flex h-9 items-center rounded-lg border border-brand/30 bg-brand-light px-3 text-sm font-bold text-brand transition-colors hover:bg-brand hover:text-white"
                          >
                            结论
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
          {visibleGroups.length === 0 && (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400">
              没有找到匹配的隐藏页面。
            </div>
          )}
        </div>
      </main>
      {conclusionTarget && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/35 px-6" onClick={() => setConclusionTarget(null)}>
          <div
            className="w-[520px] max-w-[92vw] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-base font-black text-slate-900">{conclusionTarget.title}</h3>
                {conclusionTarget.path && <div className="mt-1 text-xs font-bold text-slate-400">{conclusionTarget.path}</div>}
              </div>
              <button
                type="button"
                onClick={() => setConclusionTarget(null)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-5">
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold leading-7 text-amber-800">
                {conclusionTarget.conclusion}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
