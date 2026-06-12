import { ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

type DirectoryItem = {
  id: string;
  title: string;
  meta: string;
  words: number;
  status?: string;
};

type DirectoryGroup = {
  id: string;
  title: string;
  countLabel: string;
  items: DirectoryItem[];
};

type DirectoryDemo = {
  id: 'brainstorm' | 'setting' | 'detailOutline';
  title: string;
  summary: string;
  groupUnit: string;
  groups: DirectoryGroup[];
};

const directoryDemos: DirectoryDemo[] = [
  {
    id: 'brainstorm',
    title: '脑洞',
    summary: '把脑洞库按脑洞类型分组，分组像正文卷，单个脑洞像正文章节。适合快速扫到“这条脑洞属于哪一类”。',
    groupUnit: '条',
    groups: [
      {
        id: 'brainstorm-main',
        title: '可写成长篇',
        countLabel: '3条',
        items: [
          { id: 'b1', title: '废土修仙公司的天命打工人', meta: '玄幻 / 都市', words: 426, status: '已整理' },
          { id: 'b2', title: '赛博山海经巡夜人', meta: '科幻 / 玄幻', words: 318, status: '待扩写' },
          { id: 'b3', title: '反派宗门绩效考核', meta: '仙侠', words: 265, status: '已收藏' },
        ],
      },
      {
        id: 'brainstorm-fragment',
        title: '短灵感',
        countLabel: '4条',
        items: [
          { id: 'b4', title: '主角只会失败预言', meta: '人设', words: 96, status: '待整理' },
          { id: 'b5', title: '城里所有镜子都延迟一天', meta: '桥段', words: 112 },
          { id: 'b6', title: '灵兽靠差评进化', meta: '设定', words: 88 },
          { id: 'b7', title: '师父其实是上一版主角', meta: '反转', words: 156 },
        ],
      },
    ],
  },
  {
    id: 'setting',
    title: '设定',
    summary: '把作品设定按分类折叠，分类是浅蓝条目，具体设定是橙色选中项。比现在的深色分类更接近正文目录。',
    groupUnit: '项',
    groups: [
      {
        id: 'setting-core',
        title: '核心设定',
        countLabel: '3项',
        items: [
          { id: 's1', title: '世界观规则', meta: '高优先级', words: 1280, status: '已锁定' },
          { id: 's2', title: '修炼体系', meta: '等级 / 资源', words: 956, status: '可补充' },
          { id: 's3', title: '主线矛盾', meta: '剧情核心', words: 684 },
        ],
      },
      {
        id: 'setting-role',
        title: '人物设定',
        countLabel: '4项',
        items: [
          { id: 's4', title: '男主角', meta: '基础设定 / 状态设定', words: 1460, status: '存活' },
          { id: 's5', title: '女主角', meta: '基础设定 / 状态设定', words: 1188, status: '存活' },
          { id: 's6', title: '师父', meta: '关键配角', words: 760 },
          { id: 's7', title: '旧案商人', meta: '龙套', words: 354 },
        ],
      },
      {
        id: 'setting-foreshadow',
        title: '伏笔设定',
        countLabel: '2项',
        items: [
          { id: 's8', title: '断剑上的旧编号', meta: '第12章回收', words: 240 },
          { id: 's9', title: '无人认领的灵契', meta: '第28章回收', words: 312 },
        ],
      },
    ],
  },
  {
    id: 'detailOutline',
    title: '章纲',
    summary: '章纲直接按卷和章节重组。左侧只扫章节号和是否有章纲，右侧再看完整章纲内容。',
    groupUnit: '章',
    groups: [
      {
        id: 'volume-1',
        title: '第一卷',
        countLabel: '5章',
        items: [
          { id: 'd1', title: '第1章 雨夜入城', meta: '有章纲', words: 824, status: '已生成' },
          { id: 'd2', title: '第2章 黑市药铺', meta: '有章纲', words: 912, status: '当前章' },
          { id: 'd3', title: '第3章 城防军账本', meta: '缺少状态变化', words: 640, status: '待检查' },
          { id: 'd4', title: '第4章 地下旧塔', meta: '无章纲', words: 0, status: '未生成' },
          { id: 'd5', title: '第5章 旧神铃声', meta: '无章纲', words: 0, status: '未生成' },
        ],
      },
      {
        id: 'volume-2',
        title: '第二卷',
        countLabel: '3章',
        items: [
          { id: 'd6', title: '第6章 归墟名单', meta: '无章纲', words: 0 },
          { id: 'd7', title: '第7章 失控祭礼', meta: '无章纲', words: 0 },
          { id: 'd8', title: '第8章 长生债', meta: '无章纲', words: 0 },
        ],
      },
    ],
  },
];

function getDefaultSelectedIds() {
  return Object.fromEntries(directoryDemos.map((demo) => [demo.id, demo.groups[0]?.items[0]?.id ?? ''])) as Record<DirectoryDemo['id'], string>;
}

function GroupedDirectory({
  demo,
  selectedId,
  expandedGroupIds,
  onToggleGroup,
  onSelectItem,
}: {
  demo: DirectoryDemo;
  selectedId: string;
  expandedGroupIds: Set<string>;
  onToggleGroup: (groupId: string) => void;
  onSelectItem: (itemId: string) => void;
}) {
  return (
    <aside className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 px-3">
        <div className="text-sm font-black text-slate-900">{demo.title}目录</div>
        <div className="rounded-full bg-[#EAF9FD] px-2 py-0.5 text-xs font-black text-[#078FAE]">
          {demo.groups.reduce((sum, group) => sum + group.items.length, 0)}{demo.groupUnit}
        </div>
      </div>

      <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {demo.groups.map((group) => {
          const expanded = expandedGroupIds.has(group.id);
          return (
            <div key={group.id} className="mb-1">
              <div className="group flex h-[36px] items-center gap-1 rounded-md bg-brand-light px-2 py-1.5 transition-colors hover:bg-brand/10">
                <button
                  type="button"
                  onClick={() => onToggleGroup(group.id)}
                  className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                >
                  {expanded ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-brand-dark" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-brand-dark" />
                  )}
                  <span className="truncate text-sm font-medium text-brand-dark">{group.title}</span>
                  <span className="ml-1 shrink-0 text-xs text-gray-400">{group.countLabel}</span>
                </button>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded text-xl font-bold text-brand-dark transition-colors hover:bg-brand/20"
                  title={`新增${demo.groupUnit}`}
                >
                  +
                </button>
              </div>

              {expanded && (
                <div className="ml-1 mt-0.5 space-y-0.5">
                  {group.items.map((item) => {
                    const selected = selectedId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectItem(item.id)}
                        className={`group relative flex w-full cursor-pointer items-center gap-2 rounded-md border-l-[3px] px-3 py-2 text-left transition-colors ${
                          selected
                            ? 'border-orange-400 bg-orange-50'
                            : 'border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <span className={`min-w-0 flex-1 truncate whitespace-nowrap text-sm font-medium ${selected ? 'text-orange-600' : 'text-gray-700'}`}>
                          {item.title}
                        </span>
                        <span className="shrink-0 text-xs text-gray-400">{item.words}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export function WorkbenchGroupedDirectoryStyleTestPage() {
  const [activeDemoId, setActiveDemoId] = useState<DirectoryDemo['id']>('brainstorm');
  const [selectedIds, setSelectedIds] = useState<Record<DirectoryDemo['id'], string>>(getDefaultSelectedIds);
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(
    () => new Set(directoryDemos.flatMap((demo) => demo.groups.map((group) => group.id))),
  );
  const activeDemo = directoryDemos.find((demo) => demo.id === activeDemoId) ?? directoryDemos[0];
  const selectedItem = useMemo(() => (
    activeDemo.groups.flatMap((group) => group.items).find((item) => item.id === selectedIds[activeDemo.id]) ??
    activeDemo.groups[0]?.items[0] ??
    null
  ), [activeDemo, selectedIds]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroupIds((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 p-6">
      <header className="mb-5 flex shrink-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-black text-[#08AACE]">目录分组重组测试</div>
          <h1 className="mt-1 text-xl font-black text-slate-950">脑洞 / 设定 / 章纲分组改成正文目录样式</h1>
          <p className="mt-1 text-sm font-bold text-slate-400">
            复用正文页面“卷”浅蓝分组和“章”橙色选中行，先测试三类目录是否都适合这种层级。
          </p>
        </div>
        <div className="inline-flex shrink-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
          {directoryDemos.map((demo) => (
            <button
              key={demo.id}
              type="button"
              onClick={() => setActiveDemoId(demo.id)}
              className={`h-11 border-r border-slate-200 px-5 text-sm font-black last:border-r-0 ${
                activeDemoId === demo.id
                  ? 'bg-[#DFF7FC] text-[#08AACE]'
                  : 'bg-white text-slate-700 hover:bg-[#EAF9FD] hover:text-[#08AACE]'
              }`}
            >
              {demo.title}
            </button>
          ))}
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[310px_minmax(0,1fr)] gap-5">
        <GroupedDirectory
          demo={activeDemo}
          selectedId={selectedIds[activeDemo.id]}
          expandedGroupIds={expandedGroupIds}
          onToggleGroup={toggleGroup}
          onSelectItem={(itemId) => setSelectedIds((current) => ({ ...current, [activeDemo.id]: itemId }))}
        />

        <section className="grid min-h-0 grid-cols-[minmax(0,1fr)_340px] gap-5">
          <div className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-5">
              <div className="min-w-0">
                <h2 className="truncate text-base font-black text-slate-950">{selectedItem?.title ?? '未选择内容'}</h2>
                <p className="mt-0.5 text-xs font-bold text-slate-400">{selectedItem?.meta ?? activeDemo.title}</p>
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-500">
                {selectedItem?.status ?? '预览'}
              </span>
            </div>
            <div className="min-h-0 flex-1 p-5">
              <div className="h-full rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div className="text-sm font-black text-slate-700">测试预览</div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  当前目录把“分组”处理成正文页的卷头，把具体内容处理成正文页的章节行。选中项使用橙色左边线和淡橙背景，未选中项保持白底，字数放在右侧，避免挤占标题。
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  如果迁入正式页，脑洞可以按脑洞类型折叠，设定可以按设定分类折叠，章纲可以按卷折叠；三者保持同一套目录交互。
                </p>
              </div>
            </div>
          </div>

          <aside className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-sm font-black text-slate-950">迁移说明</div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>{activeDemo.summary}</p>
              <p>保留右侧“+”入口，后续正式迁移时可以对应新建脑洞、新建设定或新建章纲。</p>
              <p>分组折叠状态建议继续记忆到本地，避免用户每次进入都重新展开。</p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
