import { Check, FileText, Folder, Link2, Search, Settings, X } from 'lucide-react';
import { useMemo, useState } from 'react';

type SettingLinkTab = {
  id: string;
  title: string;
  groups: Array<{
    name: string;
    entries: Array<{
      id: string;
      title: string;
      type: string;
      words: number;
      body: string;
    }>;
  }>;
};

const tabs: SettingLinkTab[] = [
  {
    id: 'work',
    title: '作品设定',
    groups: [
      {
        name: '核心设定',
        entries: [
          {
            id: 'work-basic',
            title: '基础设定',
            type: '核心设定',
            words: 186,
            body: '故事类型：玄幻升级爽文。\n核心创意：林刻可以吞噬万物残留规则，但每次吞噬都会暴露禁忌气息。\n一句话概括：被退婚少年靠吞噬规则逆袭宗门，最终揭开神庭封锁万界的真相。',
          },
          {
            id: 'work-cheat',
            title: '主角金手指/优势',
            type: '核心设定',
            words: 214,
            body: '能力来源：黑玉令中残留的万界吞噬规则。\n核心功能：吞噬材料、残魂和规则碎片，转化为功法熟练度和隐藏感知。\n使用限制：不能吞噬活人完整神魂，强行使用会被神庭印记察觉。',
          },
        ],
      },
      {
        name: '剧情规划',
        entries: [
          {
            id: 'plot-blueprint',
            title: '剧情蓝图',
            type: '剧情规划',
            words: 168,
            body: '整体规划：五卷结构，前期宗门逆袭，中期地图扩张，后期揭开万界封锁。\n主线目标：主角寻找黑玉令上一任持有者，同时摆脱神庭追捕。\n阶段节奏：每卷都有一次资源跃迁、一次身份暴露风险和一次地图开启。',
          },
        ],
      },
    ],
  },
  {
    id: 'roles',
    title: '人物设定',
    groups: [
      {
        name: '男主角',
        entries: [
          {
            id: 'role-linke',
            title: '林刻',
            type: '男主角',
            words: 192,
            body: '外貌：黑发清瘦，眼神沉静，衣着朴素但袖口有黑玉令暗纹。\n核心性格：谨慎、记仇、行动果断，不喜欢把底牌交给任何人。\n人物背景：原本是边境小族旁支，被退婚后发现黑玉令和母族失踪有关。',
          },
        ],
      },
      {
        name: '女主角',
        entries: [
          {
            id: 'role-yunyin',
            title: '云隐',
            type: '女主角',
            words: 134,
            body: '外貌：白衣剑修，气质冷淡。\n核心性格：理性克制，重承诺，讨厌无意义牺牲。\n人物背景：青云宗内门弟子，暗中调查宗门禁地失踪案。',
          },
        ],
      },
    ],
  },
  {
    id: 'factions',
    title: '势力地图',
    groups: [
      {
        name: '正派势力',
        entries: [
          {
            id: 'faction-qingyun',
            title: '青云宗',
            type: '正派势力',
            words: 176,
            body: '基本信息：边境大宗，掌握青岚山脉外围灵矿。\n势力特点：表面正道，内部长老派系争权。\n主要人物：宗主闭关，执法长老掌控外门资源。\n核心问题/矛盾：禁地失踪案被高层压下。',
          },
        ],
      },
      {
        name: '反派势力',
        entries: [
          {
            id: 'faction-godcourt',
            title: '永恒神庭',
            type: '反派势力',
            words: 202,
            body: '基本信息：跨界监察组织，负责追捕吞噬规则持有者。\n势力特点：等级森严，擅长用神印定位目标。\n主要人物：巡界使白烬负责下界追查。\n核心问题/矛盾：神庭并非维护秩序，而是在封锁旧世界真相。',
          },
        ],
      },
      {
        name: '世界地图',
        entries: [
          {
            id: 'world-structure',
            title: '世界架构',
            type: '世界地图',
            words: 188,
            body: '世界架构：大陆分为东荒、北境、西漠和中州四层地图。\n区域划分：边境宗门控制外圈，中州王朝掌握传送阵。\n资源分布：青岚山脉产灵石，黑松岭产妖骨。\n世界规则：高阶修士不能随意跨境出手，否则会触发巡界雷罚。',
          },
        ],
      },
    ],
  },
  {
    id: 'items',
    title: '道具资源',
    groups: [
      {
        name: '功法能力',
        entries: [
          {
            id: 'ability-devour',
            title: '万界吞噬诀',
            type: '功法能力',
            words: 172,
            body: '基本信息：黑玉令附带的残缺功法。\n能力来源：旧万界时代的禁忌传承。\n核心效果：吞噬材料和残魂碎片提升感知、肉身和术法。\n使用限制：吞噬越强，神庭印记越容易感应。',
          },
        ],
      },
      {
        name: '物品装备',
        entries: [
          {
            id: 'item-black-jade',
            title: '黑玉令',
            type: '物品装备',
            words: 156,
            body: '基本信息：巴掌大小的黑色令牌。\n物品描述：表面有碎裂云纹，触碰时会出现微弱吞噬感。\n效果/功能：感知残留规则，封存吞噬诀残篇。\n相关伏笔：令牌曾属于主角母族。',
          },
        ],
      },
      {
        name: '特殊资源',
        entries: [
          {
            id: 'resource-inheritance',
            title: '黑松岭传承资格',
            type: '特殊资源',
            words: 144,
            body: '基本信息：进入黑松岭旧阵门的资格。\n获取条件：持有黑玉令并收集三枚妖骨印。\n使用规则：只能开启一次，进入后资格立即消耗。\n主线关联：旧阵门通向母族失踪线索。',
          },
        ],
      },
    ],
  },
  {
    id: 'monsters',
    title: '怪物图鉴',
    groups: [
      {
        name: '怪物列表',
        entries: [
          {
            id: 'monster-scaled',
            title: '玄鳞兽',
            type: '怪物列表',
            words: 128,
            body: '怪物形象：通体黑鳞，额头有裂纹状骨角。\n怪物能力：夜间感知灵力波动，鳞甲能反震低阶法术。\n怪物弱点：腹部白鳞怕火。\n出没位置：黑松岭外围。',
          },
        ],
      },
    ],
  },
  {
    id: 'foreshadow',
    title: '伏笔线索',
    groups: [
      {
        name: '主线伏笔',
        entries: [
          {
            id: 'foreshadow-jade-origin',
            title: '黑玉令来历',
            type: '主线伏笔',
            words: 118,
            body: '黑玉令不是普通机缘，而是旧万界吞噬者留下的身份钥匙。前期只表现为吞噬残留，后期揭示它能打开神庭封锁的旧界门。',
          },
        ],
      },
      {
        name: '人物伏笔',
        entries: [
          {
            id: 'foreshadow-mother',
            title: '母族失踪',
            type: '人物伏笔',
            words: 96,
            body: '林刻母族并非被灭，而是被迫迁入旧界缝隙。黑玉令上的云纹与母族族徽一致，需要在中期地图揭露。',
          },
        ],
      },
    ],
  },
];

const linkButtonLabels = ['当前设定', '其他设定', '脑洞'] as const;

export function SettingOtherLinkPickerTestPage() {
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [selectedEntryId, setSelectedEntryId] = useState(tabs[0].groups[0].entries[0].id);
  const [linkedIds, setLinkedIds] = useState<string[]>(['work-basic']);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');

  const flatEntries = useMemo(() => (
    tabs.flatMap((tab) => tab.groups.flatMap((group) => (
      group.entries.map((entry) => ({ ...entry, tabTitle: tab.title, groupName: group.name }))
    )))
  ), []);

  const activeTab = useMemo(() => (
    tabs.find((tab) => tab.id === activeTabId) ?? tabs[0]
  ), [activeTabId]);

  const selectedEntry = useMemo(() => (
    flatEntries.find((entry) => entry.id === selectedEntryId) ?? flatEntries[0]
  ), [flatEntries, selectedEntryId]);

  const linkedEntries = linkedIds
    .map((id) => flatEntries.find((entry) => entry.id === id))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const visibleGroups = activeTab.groups
    .map((group) => ({
      ...group,
      entries: group.entries.filter((entry) => {
        const keyword = query.trim();
        return !keyword || `${entry.title}${entry.type}${entry.body}`.includes(keyword);
      }),
    }))
    .filter((group) => group.entries.length > 0);

  const toggleLinked = (id: string) => {
    setLinkedIds((current) => (
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    ));
  };

  return (
    <div className="flex h-full min-h-0 bg-slate-50 text-slate-900">
      <aside className="flex w-[250px] shrink-0 flex-col border-r border-slate-100 bg-white px-1 py-2">
        <div className="mb-3 rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-3">
          <div className="text-sm font-black text-[#08AACE]">设定页关联按钮测试</div>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
            预览“关联其他设定”插入到当前设定和脑洞之间后的弹窗选择方式。
          </p>
        </div>
        {tabs.slice(0, 4).map((tab) => (
          <section key={tab.id} className="mb-3">
            <div className="flex h-11 items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50 px-2 text-sm font-black text-slate-800">
              <Folder className="h-4 w-4 text-[#08AACE]" />
              <span className="min-w-0 flex-1 truncate">{tab.title}</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
                {tab.groups.reduce((sum, group) => sum + group.entries.length, 0)}
              </span>
            </div>
            <div className="mt-1 space-y-1">
              {tab.groups[0].entries.slice(0, 2).map((entry) => (
                <div key={entry.id} className="flex min-h-[34px] items-center rounded-lg bg-white px-3 py-1.5 text-sm font-black text-slate-700">
                  <span className="min-w-0 flex-1 truncate">{entry.title}</span>
                  <span className="ml-2 shrink-0 text-xs text-[#08AACE]">{entry.words}字</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </aside>

      <main className="min-w-0 flex-1 p-7">
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">智能导入后的设定关联流程</h1>
            <p className="mt-2 text-sm font-bold text-slate-400">
              正式页未来可把当前选中设定、其他设定、脑洞三种资料都作为 AI 请求的关联上下文。
            </p>
          </div>
          <div className="flex h-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {linkButtonLabels.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => label === '其他设定' && setModalOpen(true)}
                className={`min-w-[96px] border-slate-200 px-3 text-sm font-black transition-colors ${
                  index < linkButtonLabels.length - 1 ? 'border-r' : ''
                } ${
                  label === '其他设定'
                    ? 'bg-[#EAF9FD] text-[#08AACE] hover:bg-[#DDF5FB]'
                    : 'bg-white text-slate-600 hover:bg-[#EAF9FD] hover:text-[#08AACE]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        <section className="grid max-w-[1180px] grid-cols-[minmax(0,1fr)_340px] gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-black text-slate-500">
              <Settings className="h-4 w-4 text-[#08AACE]" />
              当前正在编辑的设定
            </div>
            <div className="rounded-2xl border-2 border-slate-900 p-5">
              <div className="text-xl font-black">剧情蓝图</div>
              <p className="mt-3 whitespace-pre-line text-sm font-bold leading-7 text-slate-500">
                整体规划：五卷结构。\n主线目标：主角寻找黑玉令上一任持有者。\n阶段节奏：每卷都有资源跃迁、身份暴露风险和地图开启。
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-black text-[#08AACE]">
              <Link2 className="h-4 w-4" />
              已关联资料
            </div>
            <div className="space-y-2">
              {linkedEntries.map((entry) => (
                <div key={entry.id} className="rounded-xl bg-white px-3 py-2 shadow-sm">
                  <div className="text-sm font-black text-slate-800">{entry.title}</div>
                  <div className="mt-1 text-xs font-bold text-slate-400">{entry.tabTitle} / {entry.groupName} / {entry.words}字</div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-4 h-10 w-full rounded-xl bg-[#08AACE] text-sm font-black text-white shadow-sm hover:bg-[#0796B8]"
            >
              打开关联其他设定
            </button>
          </div>
        </section>
      </main>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-5">
          <section className="flex h-[min(760px,92vh)] w-[min(1180px,94vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-5">
              <div>
                <h2 className="text-lg font-black">关联其他设定</h2>
                <p className="mt-0.5 text-xs font-bold text-slate-400">读取设定页面下所有设定条目，勾选后作为 AI 请求上下文。</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-[#9BEFFC] hover:text-[#08AACE]"
                title="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-100 px-5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTabId(tab.id);
                    const firstEntry = tab.groups[0]?.entries[0];
                    if (firstEntry) setSelectedEntryId(firstEntry.id);
                  }}
                  className={`h-9 rounded-xl border px-3 text-sm font-black transition-colors ${
                    activeTabId === tab.id
                      ? 'border-[#9BEFFC] bg-[#EAF9FD] text-[#08AACE]'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-[#9BEFFC] hover:text-[#08AACE]'
                  }`}
                >
                  {tab.title}
                </button>
              ))}
              <div className="relative ml-auto w-[260px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索设定条目"
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-bold outline-none focus:border-[#08AACE] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)_280px]">
              <aside className="min-h-0 overflow-y-auto border-r border-slate-100 bg-slate-50 px-1 py-2">
                {visibleGroups.length === 0 ? (
                  <div className="p-5 text-center text-sm font-bold text-slate-400">暂无匹配设定</div>
                ) : visibleGroups.map((group) => (
                  <section key={group.name} className="mb-3">
                    <div className="flex h-11 items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50 px-2 text-sm font-black text-slate-800">
                      <Folder className="h-4 w-4 text-[#08AACE]" />
                      <span className="min-w-0 flex-1 truncate">{group.name}</span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">{group.entries.length}</span>
                    </div>
                    <div className="mt-1 space-y-1">
                      {group.entries.map((entry) => {
                        const selected = selectedEntry.id === entry.id;
                        const linked = linkedIds.includes(entry.id);
                        return (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => setSelectedEntryId(entry.id)}
                            className={`flex min-h-[38px] w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm font-black transition-colors ${
                              selected
                                ? 'border border-[#08AACE] bg-[#EAF9FD] text-[#078fb0]'
                                : 'bg-white text-slate-700 hover:bg-[#EAF9FD] hover:text-[#08AACE]'
                            }`}
                          >
                            <span className="min-w-0 flex-1 truncate">{entry.title}</span>
                            {linked ? <Check className="h-4 w-4 shrink-0 text-[#08AACE]" /> : null}
                            <span className="shrink-0 text-xs text-[#08AACE]">{entry.words}字</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </aside>

              <article className="min-h-0 overflow-y-auto p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-black text-[#08AACE]">{selectedEntry.tabTitle} / {selectedEntry.groupName}</div>
                    <h3 className="mt-1 text-2xl font-black">{selectedEntry.title}</h3>
                    <p className="mt-1 text-sm font-bold text-slate-400">{selectedEntry.type} · {selectedEntry.words} 字</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleLinked(selectedEntry.id)}
                    className={`h-10 rounded-xl px-4 text-sm font-black transition-colors ${
                      linkedIds.includes(selectedEntry.id)
                        ? 'border border-[#08AACE] bg-white text-[#08AACE] hover:bg-[#EAF9FD]'
                        : 'bg-[#08AACE] text-white hover:bg-[#0796B8]'
                    }`}
                  >
                    {linkedIds.includes(selectedEntry.id) ? '取消关联' : '关联此项'}
                  </button>
                </div>
                <div className="rounded-2xl border-2 border-slate-900 p-5">
                  <p className="whitespace-pre-line text-sm font-bold leading-8 text-slate-600">{selectedEntry.body}</p>
                </div>
              </article>

              <aside className="min-h-0 overflow-y-auto border-l border-slate-100 bg-cyan-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#08AACE]">
                  <FileText className="h-4 w-4" />
                  本次将关联
                </div>
                <div className="space-y-2">
                  {linkedEntries.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => {
                        setActiveTabId(tabs.find((tab) => tab.title === entry.tabTitle)?.id ?? activeTabId);
                        setSelectedEntryId(entry.id);
                      }}
                      className="w-full rounded-xl bg-white px-3 py-2 text-left shadow-sm hover:bg-[#F8FEFF]"
                    >
                      <div className="text-sm font-black text-slate-800">{entry.title}</div>
                      <div className="mt-1 text-xs font-bold text-slate-400">{entry.tabTitle} / {entry.groupName}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-cyan-200 bg-white p-3 text-xs font-bold leading-5 text-slate-500">
                  正式接入时，这些条目会合并成“关联其他设定”上下文，和当前设定、脑洞一起送给 AI。
                </div>
              </aside>
            </div>

            <footer className="flex h-14 shrink-0 items-center justify-between border-t border-slate-100 px-5">
              <div className="text-xs font-bold text-slate-400">
                已选 {linkedEntries.length} 项 · 共 {linkedEntries.reduce((sum, entry) => sum + entry.words, 0)} 字
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLinkedIds([])}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 hover:border-[#9BEFFC] hover:text-[#08AACE]"
                >
                  清空
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-9 rounded-xl bg-[#08AACE] px-4 text-sm font-black text-white hover:bg-[#0796B8]"
                >
                  确认关联
                </button>
              </div>
            </footer>
          </section>
        </div>
      ) : null}
    </div>
  );
}
