import { ChevronRight, EyeOff, FolderOpen, Layers, Route, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type HiddenItemStatus = 'nav-hidden' | 'feature-hidden' | 'embedded-hidden' | 'route-kept';

type HiddenItem = {
  title: string;
  path?: string;
  status: HiddenItemStatus;
  hiddenFrom: string;
  reason: string;
  restore: string;
};

const statusMeta: Record<HiddenItemStatus, { label: string; className: string; icon: typeof EyeOff }> = {
  'nav-hidden': {
    label: '导航隐藏',
    className: 'bg-sky-50 text-sky-700',
    icon: EyeOff,
  },
  'feature-hidden': {
    label: '功能隐藏',
    className: 'bg-amber-50 text-amber-700',
    icon: Layers,
  },
  'embedded-hidden': {
    label: '内嵌隐藏',
    className: 'bg-violet-50 text-violet-700',
    icon: FolderOpen,
  },
  'route-kept': {
    label: '路由保留',
    className: 'bg-slate-100 text-slate-600',
    icon: Route,
  },
};

const hiddenGroups: Array<{ title: string; desc: string; items: HiddenItem[] }> = [
  {
    title: '导航移动到隐藏专区',
    desc: '这些入口从日常创作导航里移走，但仍可在隐藏专区中打开。',
    items: [
      {
        title: '提炼剧情',
        path: '/extract',
        status: 'nav-hidden',
        hiddenFrom: '原位置：创作专区 / 提炼剧情；现位置：隐藏专区 / 提炼剧情。',
        reason: '当前剧情库流程不再作为主线写作流程使用，避免干扰从脑洞、剧情链、章纲到正文的主流程。',
        restore: '如果以后需要恢复，把 /extract 从隐藏专区移动回创作专区，或把 DEFAULT_NAV_CONFIG 中该项放回创作专区。',
      },
      {
        title: '提取设定',
        path: '/moonfall-settings',
        status: 'nav-hidden',
        hiddenFrom: '原位置：创作专区 / 提取设定；现位置：隐藏专区 / 提取设定。',
        reason: '设定提取属于辅助整理功能，不放在主创作流程里，减少新用户看到的入口数量。',
        restore: '如果以后需要恢复，把 /moonfall-settings 从隐藏专区移动回创作专区。',
      },
    ],
  },
  {
    title: '剧情链隐藏内容',
    desc: '这些剧情库相关入口从剧情链正式操作区隐藏，当前默认只保留 AI 生成来源。',
    items: [
      {
        title: '剧情链来源：剧情库按钮',
        status: 'feature-hidden',
        hiddenFrom: '作品编辑器 / 生成剧情链 / 右侧生成规则 / 来源。',
        reason: '剧情库生成效果当前不稳定，容易把已有剧情骨架带入当前小说，造成变量和进度不贴合。',
        restore: '在 WorkbenchLibraryPanel 中把 library 加回可见来源列表，并恢复对应按钮。',
      },
      {
        title: '剧情链来源：混合按钮',
        status: 'feature-hidden',
        hiddenFrom: '作品编辑器 / 生成剧情链 / 右侧生成规则 / 来源。',
        reason: '混合来源仍会引入剧情库参考，当前隐藏以保证剧情链只按关联设定和提示词生成。',
        restore: '在 WorkbenchLibraryPanel 中把 mixed 加回可见来源列表，并确认剧情库参考是否仍要发送给 AI。',
      },
      {
        title: '剧情链请求里的剧情库参考',
        status: 'embedded-hidden',
        hiddenFrom: '生成剧情链请求内容里的“可参考剧情库”。',
        reason: '来源被固定为 AI 生成后，剧情链不会再把剧情库候选作为参考上下文发送给 AI。',
        restore: '恢复剧情库或混合来源后，该参考内容会按来源逻辑重新进入请求。',
      },
    ],
  },
  {
    title: '保留但不作为主入口',
    desc: '这些路由或组件仍存在，主要是为了以后恢复、排查或内嵌使用。',
    items: [
      {
        title: '隐藏内容总览',
        path: '/hidden-content',
        status: 'route-kept',
        hiddenFrom: '隐藏专区 / 隐藏内容。',
        reason: '用于记录被隐藏的入口、功能位置和恢复方法。',
        restore: '这是恢复索引，不建议删除。',
      },
      {
        title: '剧情库内嵌视图',
        status: 'embedded-hidden',
        hiddenFrom: '提炼剧情页面内部的剧情库标签。',
        reason: '提炼剧情已经整体移动到隐藏专区，剧情库也随之离开主导航。',
        restore: '恢复提炼剧情入口后，可继续从提炼剧情页面内部进入剧情库。',
      },
      {
        title: '旧隐藏页面路由',
        path: '/hidden-pages-test',
        status: 'route-kept',
        hiddenFrom: '旧测试路由别名。',
        reason: '保留兼容旧入口，实际内容已经统一到隐藏内容总览。',
        restore: '无需恢复；正式入口使用 /hidden-content。',
      },
    ],
  },
];

function matchesKeyword(item: HiddenItem, keyword: string) {
  const target = [
    item.title,
    item.path ?? '',
    statusMeta[item.status].label,
    item.hiddenFrom,
    item.reason,
    item.restore,
  ].join('\n').toLowerCase();
  return target.includes(keyword);
}

export function HiddenPagesTestPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const visibleGroups = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return hiddenGroups;
    return hiddenGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => matchesKeyword(item, keyword)),
      }))
      .filter((group) => group.items.length > 0);
  }, [search]);

  const totalCount = hiddenGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="flex min-h-[4.5rem] shrink-0 items-center border-b border-slate-100 bg-white px-6 py-3">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900">隐藏内容</h1>
            <p className="mt-1 text-sm font-bold text-slate-400">
              记录当前被隐藏的导航和功能，共 {totalCount} 项，方便以后恢复。
            </p>
          </div>
          <label className="xy-ui132-search w-[300px] max-w-full">
            <Search />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索隐藏位置或恢复方法"
            />
          </label>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-7 py-7">
        <div className="space-y-7">
          {visibleGroups.map((group) => (
            <section key={group.title}>
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-900">{group.title}</h2>
                  <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-black text-slate-500">
                    {group.items.length}
                  </span>
                </div>
                <p className="mt-1 text-sm font-bold text-slate-400">{group.desc}</p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
                {group.items.map((item) => {
                  const StatusIcon = statusMeta[item.status].icon;
                  return (
                    <article key={`${item.status}-${item.path ?? item.title}`} className="flex min-h-[248px] flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-base font-black text-slate-900">{item.title}</div>
                            {item.path ? <div className="mt-1 truncate text-xs font-bold text-slate-400">{item.path}</div> : null}
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ${statusMeta[item.status].className}`}>
                          {statusMeta[item.status].label}
                        </span>
                      </div>

                      <div className="space-y-3 text-sm leading-6">
                        <div>
                          <div className="mb-1 text-xs font-black text-slate-400">隐藏位置</div>
                          <p className="font-bold text-slate-700">{item.hiddenFrom}</p>
                        </div>
                        <div>
                          <div className="mb-1 text-xs font-black text-slate-400">隐藏原因</div>
                          <p className="font-bold text-slate-600">{item.reason}</p>
                        </div>
                        <div>
                          <div className="mb-1 text-xs font-black text-slate-400">恢复方法</div>
                          <p className="font-bold text-slate-600">{item.restore}</p>
                        </div>
                      </div>

                      <div className="mt-auto pt-4">
                        <button
                          type="button"
                          disabled={!item.path}
                          onClick={() => item.path && navigate(item.path)}
                          className="xy-arrow-action-button xy-arrow-action-compact disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <span className="xy-arrow-action-icon" aria-hidden="true"><ChevronRight className="h-4 w-4" /></span>
                          <span className="xy-arrow-action-text">{item.path ? '打开检查' : '仅记录'}</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}

          {visibleGroups.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm font-bold text-slate-400">
              没有找到匹配的隐藏内容。
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
