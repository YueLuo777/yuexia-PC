import {
  BookOpen,
  ChevronRight,
  GripVertical,
  LayoutGrid,
  Plus,
  RotateCcw,
  Settings,
  Tag,
  Trash2,
  Undo2,
} from 'lucide-react';
import { type MouseEvent, useMemo, useState } from 'react';

type NavEntry = {
  id: string;
  label: string;
  icon: typeof BookOpen;
  hidden?: boolean;
};

type DividerEntry = {
  id: string;
  afterId: string | null;
};

type ContextMenu =
  | { type: 'item'; id: string; x: number; y: number }
  | { type: 'blank'; x: number; y: number }
  | { type: 'divider'; id: string; x: number; y: number }
  | null;

const DEFAULT_NAV_ITEMS: NavEntry[] = [
  { id: 'novels', label: '我的小说', icon: BookOpen },
  { id: 'scripts', label: '我的剧本', icon: LayoutGrid },
  { id: 'genre', label: '题材迭代', icon: LayoutGrid },
  { id: 'library', label: '资料库', icon: LayoutGrid },
  { id: 'prompts', label: '提示词管理', icon: Tag },
  { id: 'models', label: '模型管理', icon: Settings },
];

const DEFAULT_DIVIDERS: DividerEntry[] = [{ id: 'divider-novels', afterId: 'novels' }];

function clampMenuPosition(x: number, y: number) {
  return {
    x: Math.min(Math.max(12, x), window.innerWidth - 220),
    y: Math.min(Math.max(12, y), window.innerHeight - 220),
  };
}

function reorderItems(items: NavEntry[], sourceId: string, targetId: string) {
  if (sourceId === targetId) return items;
  const sourceIndex = items.findIndex((item) => item.id === sourceId);
  const targetIndex = items.findIndex((item) => item.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return items;
  const next = [...items];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export function NavigationContextMenuPrototypeTestPage() {
  const [items, setItems] = useState<NavEntry[]>(() =>
    DEFAULT_NAV_ITEMS.map((item) => (item.id === 'genre' ? { ...item, hidden: true } : item)),
  );
  const [dividers, setDividers] = useState<DividerEntry[]>(DEFAULT_DIVIDERS);
  const [menu, setMenu] = useState<ContextMenu>(null);
  const [showHiddenSubmenu, setShowHiddenSubmenu] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const visibleItems = useMemo(() => items.filter((item) => !item.hidden), [items]);
  const hiddenItems = useMemo(() => items.filter((item) => item.hidden), [items]);

  const openMenu = (event: MouseEvent, nextMenu: Exclude<ContextMenu, null>) => {
    event.preventDefault();
    event.stopPropagation();
    setShowHiddenSubmenu(false);
    setMenu({ ...nextMenu, ...clampMenuPosition(event.clientX, event.clientY) });
  };

  const hideItem = (id: string) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, hidden: true } : item)));
    setMenu(null);
  };

  const renameItem = (id: string) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, label: `${item.label}（重命名预览）` } : item)),
    );
    setMenu(null);
  };

  const restoreItem = (id: string) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, hidden: false } : item)));
    setMenu(null);
  };

  const addDivider = () => {
    const lastVisibleId = visibleItems[visibleItems.length - 1]?.id ?? null;
    setDividers((current) => [...current, { id: `divider-${Date.now()}`, afterId: lastVisibleId }]);
    setMenu(null);
  };

  const removeDivider = (id: string) => {
    setDividers((current) => current.filter((divider) => divider.id !== id));
    setMenu(null);
  };

  const resetDefault = () => {
    setItems(DEFAULT_NAV_ITEMS.map((item) => ({ ...item })));
    setDividers(DEFAULT_DIVIDERS);
    setMenu(null);
  };

  const renderContextMenu = () => {
    if (!menu) return null;
    const menuItem = items.find((item) => menu.type === 'item' && item.id === menu.id);
    return (
      <div
        className="fixed z-[260] min-w-[196px] rounded-lg border border-slate-200 bg-white p-1 text-sm font-bold text-slate-600 shadow-[0_18px_42px_rgba(15,23,42,0.18)]"
        style={{ left: menu.x, top: menu.y }}
        onClick={(event) => event.stopPropagation()}
      >
        {menu.type === 'item' && menuItem ? (
          <>
            <button
              type="button"
              onClick={() => renameItem(menuItem.id)}
              className="flex h-9 w-full items-center rounded-md px-3 text-left hover:bg-slate-50"
            >
              重命名“{menuItem.label}”
            </button>
            <button
              type="button"
              onClick={() => hideItem(menuItem.id)}
              className="flex h-9 w-full items-center rounded-md px-3 text-left text-red-500 hover:bg-red-50"
            >
              隐藏导航
            </button>
          </>
        ) : null}

        {menu.type === 'blank' ? (
          <>
            <button
              type="button"
              onClick={addDivider}
              className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-left hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              新增分割线
            </button>
            <button
              type="button"
              onClick={resetDefault}
              className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-left hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              恢复默认导航
            </button>
            <button
              type="button"
              onMouseEnter={() => setShowHiddenSubmenu(true)}
              onClick={() => setShowHiddenSubmenu((current) => !current)}
              className="relative flex h-9 w-full items-center justify-between rounded-md px-3 text-left hover:bg-slate-50"
            >
              <span className="flex items-center gap-2">
                <Undo2 className="h-4 w-4" />
                恢复隐藏导航
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
            {showHiddenSubmenu ? (
              <div className="absolute left-[calc(100%-4px)] top-[78px] min-w-[172px] rounded-lg border border-slate-200 bg-white p-1 shadow-[0_18px_42px_rgba(15,23,42,0.18)]">
                {hiddenItems.length > 0 ? (
                  hiddenItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => restoreItem(item.id)}
                      className="flex h-9 w-full items-center rounded-md px-3 text-left hover:bg-slate-50"
                    >
                      {item.label}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-slate-400">没有隐藏导航</div>
                )}
              </div>
            ) : null}
          </>
        ) : null}

        {menu.type === 'divider' ? (
          <button
            type="button"
            onClick={() => removeDivider(menu.id)}
            className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-left text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            删除分割线
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <div className="flex h-full bg-slate-50 p-6" onClick={() => setMenu(null)}>
      <section className="flex min-h-0 w-[320px] shrink-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-100 px-4 py-4">
          <div className="text-base font-black text-slate-900">左侧导航右键菜单原型</div>
          <div className="mt-1 text-xs font-bold text-slate-400">只在测试区预览，不写入正式导航配置</div>
        </header>
        <div
          className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-3"
          onContextMenu={(event) => openMenu(event, { type: 'blank', x: event.clientX, y: event.clientY })}
        >
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const itemDividers = dividers.filter((divider) => divider.afterId === item.id);
            return (
              <div key={item.id}>
                <button
                  type="button"
                  draggable
                  onDragStart={() => setDraggingId(item.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (draggingId) setItems((current) => reorderItems(current, draggingId, item.id));
                    setDraggingId(null);
                  }}
                  onContextMenu={(event) =>
                    openMenu(event, { type: 'item', id: item.id, x: event.clientX, y: event.clientY })
                  }
                  className={[
                    'flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-black transition-colors',
                    draggingId === item.id ? 'bg-cyan-50 text-[#078fb0]' : 'text-slate-700 hover:bg-slate-50',
                  ].join(' ')}
                >
                  <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                  <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </button>
                {itemDividers.map((divider) => (
                  <div
                    key={divider.id}
                    onContextMenu={(event) =>
                      openMenu(event, { type: 'divider', id: divider.id, x: event.clientX, y: event.clientY })
                    }
                    className="group mx-2 my-2 flex h-4 cursor-context-menu items-center"
                    title="右键删除分割线"
                  >
                    <div className="h-px flex-1 bg-slate-200 group-hover:bg-red-300" />
                  </div>
                ))}
              </div>
            );
          })}
          <div className="flex min-h-[120px] items-center justify-center rounded-md border border-dashed border-slate-200 text-xs font-bold text-slate-300">
            右键空白处
          </div>
        </div>
      </section>

      <section className="ml-6 min-w-0 flex-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-slate-900">需求拆解</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            ['导航项右键', '右键“我的小说”等导航项，弹出重命名、隐藏导航。'],
            ['空白处右键', '右键导航空白区域，弹出新增分割线、恢复默认导航、恢复隐藏导航。'],
            ['恢复隐藏导航', '“恢复隐藏导航”右侧带箭头，悬停或点击后显示被隐藏的导航列表。'],
            ['分割线右键', '右键分割线，只显示删除分割线，避免误删导航项。'],
            ['拖拽排序', '按住导航项拖拽到目标位置，松手后调整顺序。'],
            ['正式迁移边界', '后续迁入正式导航时复用现有导航配置结构和设置页数据。'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="text-sm font-black text-slate-800">{title}</div>
              <div className="mt-2 text-sm leading-6 text-slate-500">{body}</div>
            </div>
          ))}
        </div>
      </section>

      {renderContextMenu()}
    </div>
  );
}

export default NavigationContextMenuPrototypeTestPage;
