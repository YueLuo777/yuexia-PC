import { Folder, MoreHorizontal } from 'lucide-react';
import { useMemo, useState, type MouseEvent } from 'react';

type SettingDomain = {
  id: string;
  title: string;
  groupLabel: string;
  itemLabel: string;
  groups: Array<{
    name: string;
    count: number;
    items: string[];
  }>;
};

type ClearTarget = 'groups' | 'items';

const domains: SettingDomain[] = [
  {
    id: 'characters',
    title: '人物设定',
    groupLabel: '分组',
    itemLabel: '角色',
    groups: [
      { name: '男主角', count: 1, items: ['林刻'] },
      { name: '女主角', count: 0, items: [] },
    ],
  },
  {
    id: 'factions',
    title: '势力地图',
    groupLabel: '分组',
    itemLabel: '势力',
    groups: [
      { name: '正派势力', count: 1, items: ['青云宗'] },
      { name: '反派势力', count: 0, items: [] },
    ],
  },
  {
    id: 'items',
    title: '道具资源',
    groupLabel: '分组',
    itemLabel: '道具资源',
    groups: [
      { name: '物品装备', count: 1, items: ['黑玉令'] },
      { name: '特殊资源', count: 0, items: [] },
    ],
  },
  {
    id: 'monsters',
    title: '怪物图鉴',
    groupLabel: '分组',
    itemLabel: '怪物',
    groups: [
      { name: '怪物列表', count: 1, items: ['玄鳞兽'] },
    ],
  },
  {
    id: 'foreshadowing',
    title: '伏笔线索',
    groupLabel: '分组',
    itemLabel: '伏笔',
    groups: [
      { name: '主线伏笔', count: 1, items: ['黑玉令来历'] },
      { name: '人物伏笔', count: 0, items: [] },
    ],
  },
];

type ContextMenuState = {
  x: number;
  y: number;
  domainId: string;
  groupName: string;
} | null;

type ConfirmState = {
  target: ClearTarget;
  domain: SettingDomain;
  groupName: string;
  step: 1 | 2;
} | null;

function getClearLabel(domain: SettingDomain, target: ClearTarget) {
  return target === 'groups' ? `清空${domain.itemLabel}分组` : `清空${domain.itemLabel}`;
}

export function SettingClearContextMenuTestPage() {
  const [activeDomainId, setActiveDomainId] = useState(domains[0].id);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [lastAction, setLastAction] = useState('尚未执行清空操作。');

  const activeDomain = useMemo(() => (
    domains.find((domain) => domain.id === activeDomainId) ?? domains[0]
  ), [activeDomainId]);

  const menuDomain = contextMenu
    ? domains.find((domain) => domain.id === contextMenu.domainId) ?? activeDomain
    : activeDomain;

  const openGroupMenu = (event: MouseEvent, domain: SettingDomain, groupName: string) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      domainId: domain.id,
      groupName,
    });
  };

  const openConfirm = (target: ClearTarget) => {
    if (!contextMenu) return;
    setConfirmState({
      target,
      domain: menuDomain,
      groupName: contextMenu.groupName,
      step: 1,
    });
    setContextMenu(null);
  };

  const confirmClear = () => {
    if (!confirmState) return;
    if (confirmState.step === 1) {
      setConfirmState({ ...confirmState, step: 2 });
      return;
    }
    setLastAction(`已模拟${getClearLabel(confirmState.domain, confirmState.target)}：${confirmState.groupName}`);
    setConfirmState(null);
  };

  return (
    <div className="flex h-full min-h-0 bg-slate-50 text-slate-900" onClick={() => setContextMenu(null)}>
      <aside className="flex w-[260px] shrink-0 flex-col border-r border-slate-100 bg-white p-4">
        <h1 className="text-lg font-black">右键清空菜单测试</h1>
        <div className="mt-4 space-y-2">
          {domains.map((domain) => (
            <button
              key={domain.id}
              type="button"
              onClick={() => setActiveDomainId(domain.id)}
              className={`h-11 w-full rounded-xl border px-3 text-left text-sm font-black transition-colors ${
                activeDomainId === domain.id
                  ? 'border-[#9BEFFC] bg-[#E7FAFD] text-[#08AACE]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-[#9BEFFC] hover:text-[#08AACE]'
              }`}
            >
              {domain.title}
            </button>
          ))}
        </div>
        <div className="mt-auto rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-xs font-bold leading-5 text-slate-600">
          {lastAction}
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black">{activeDomain.title}</h2>
            <p className="mt-1 text-sm font-bold text-slate-400">分组右键菜单承载清空操作，底部常驻区只保留新建。</p>
          </div>
          <div className="grid h-11 grid-cols-3 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
            <div className="flex min-w-0 items-center justify-center whitespace-nowrap border-r border-slate-200 bg-[#DFF7FC] px-3 text-sm font-black text-[#08AACE]">
              新建
            </div>
            <button className="min-w-0 whitespace-nowrap border-r border-slate-200 bg-white px-3 text-sm font-black text-slate-700">
              分组
            </button>
            <button className="min-w-0 whitespace-nowrap bg-white px-3 text-sm font-black text-slate-700">
              {activeDomain.itemLabel}
            </button>
          </div>
        </div>

        <section className="grid max-w-[980px] grid-cols-2 gap-4">
          {activeDomain.groups.map((group) => (
            <div key={group.name} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <button
                type="button"
                onContextMenu={(event) => openGroupMenu(event, activeDomain, group.name)}
                className="flex h-12 w-full items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50 px-3 text-left text-sm font-black text-slate-800"
              >
                <Folder className="h-4 w-4 text-[#08AACE]" />
                <span className="min-w-0 flex-1 truncate">{group.name}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">{group.count}</span>
                <MoreHorizontal className="h-4 w-4 text-slate-400" />
              </button>
              <div className="mt-2 space-y-1">
                {group.items.length === 0 ? (
                  <div className="flex min-h-[34px] items-center rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-400">
                    暂无{activeDomain.itemLabel}
                  </div>
                ) : group.items.map((item) => (
                  <div key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-black text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>

      {contextMenu ? (
        <div
          className="fixed z-50 w-[168px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <button className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50">
            重命名分组
          </button>
          <button className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50">
            新建{menuDomain.itemLabel}
          </button>
          <div className="my-1 border-t border-slate-100" />
          <button
            type="button"
            onClick={() => openConfirm('items')}
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50"
          >
            {getClearLabel(menuDomain, 'items')}
          </button>
          <button
            type="button"
            onClick={() => openConfirm('groups')}
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50"
          >
            {getClearLabel(menuDomain, 'groups')}
          </button>
        </div>
      ) : null}

      {confirmState ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/35 p-5">
          <section className="w-[min(420px,92vw)] rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-black">
              {confirmState.step === 1 ? '确认' : '再次确认'}{getClearLabel(confirmState.domain, confirmState.target)}
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm font-bold leading-6 text-slate-500">
              {confirmState.step === 1
                ? `将清空“${confirmState.groupName}”下的${confirmState.target === 'groups' ? '自建分组' : confirmState.domain.itemLabel}。\n这是第一次确认，继续后还需要再次确认。`
                : `最后确认：即将执行${getClearLabel(confirmState.domain, confirmState.target)}。\n这个测试页只模拟，不会写入正式数据。`}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className="h-10 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-600"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmClear}
                className="h-10 rounded-xl bg-red-500 text-sm font-black text-white"
              >
                {confirmState.step === 1 ? '确认，继续' : getClearLabel(confirmState.domain, confirmState.target)}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default SettingClearContextMenuTestPage;
