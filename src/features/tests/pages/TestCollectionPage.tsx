import { ArrowLeft, Globe, Maximize2, Moon, Palette, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const testGroups = [
  {
    title: '界面测试',
    items: [
      {
        title: '按钮颜色',
        description: '集中查看按钮色彩、悬停状态和卡片按钮效果。',
        path: '/button-test',
        icon: Palette,
        badge: 'UI',
      },
      {
        title: '主题颜色',
        description: '切换白色/黑色主题，给不同界面位置测试填色效果。',
        path: '/theme-colors',
        icon: Moon,
        badge: 'Theme',
      },
      {
        title: 'AI 生成链路测试中心',
        description: '集中测试脑洞、大纲、细纲、概要、提炼、续写、审核、更新等 AI 生成链路。',
        path: '/brainstorm-ai-chain-test',
        icon: Sparkles,
        badge: 'AI',
      },
      {
        title: '弹窗自由缩放',
        description: '测试弹窗像软件窗口一样拖拽四边和四角，自由调整大小。',
        path: '/resizable-modal-test',
        icon: Maximize2,
        badge: 'Modal',
      },
    ],
  },
  {
    title: '工具测试',
    items: [
      {
        title: '内置浏览器',
        description: '测试网页打开、收藏和登录状态保留。',
        path: '/test-browser',
        icon: Globe,
        badge: 'Browser',
      },
    ],
  }
];

export function TestCollectionPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/dashboard');
  };

  const visibleGroups = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return testGroups;
    return testGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => (
          item.title.toLowerCase().includes(keyword) ||
          item.description.toLowerCase().includes(keyword) ||
          item.badge.toLowerCase().includes(keyword)
        )),
      }))
      .filter((group) => group.items.length > 0);
  }, [search]);

  const totalCount = testGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="flex h-16 shrink-0 items-center border-b border-slate-100 bg-white px-6">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900">测试合集</h1>
              <p className="mt-0.5 text-xs text-slate-400">已收纳 {totalCount} 个测试内容</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-brand"
              title="返回"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="relative w-[280px] max-w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索测试内容"
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
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-700">{group.title}</h2>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-500">{group.items.length}</span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="group flex min-h-[128px] flex-col rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-400 transition-colors group-hover:bg-brand-light group-hover:text-brand">
                          {item.badge}
                        </span>
                      </div>
                      <div className="text-base font-bold text-slate-900">{item.title}</div>
                      <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-400">{item.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
          {visibleGroups.length === 0 && (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400">
              没有找到匹配的测试内容
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
