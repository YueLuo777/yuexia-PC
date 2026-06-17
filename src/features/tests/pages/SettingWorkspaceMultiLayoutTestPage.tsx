import {
  BookOpen,
  Boxes,
  CircleDot,
  Flag,
  FolderOpen,
  Gem,
  Landmark,
  Link2,
  LockKeyhole,
  MapPinned,
  MessageSquareText,
  PanelRight,
  Search,
  Send,
  Sparkles,
  Tags,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';

type SettingDomain = {
  id: string;
  label: string;
  count: number;
  icon: LucideIcon;
  tone: string;
  groups: Array<{ name: string; count: number; entries: string[] }>;
  editor: {
    title: string;
    group: string;
    status: string;
    chapter: string;
    blocks: Array<{ title: string; hint: string; words: number }>;
  };
};

type LayoutOption = {
  id: 'wide-tabs' | 'compressed-center' | 'status-ledger';
  title: string;
  summary: string;
  recommended?: boolean;
};

const layoutOptions: LayoutOption[] = [
  {
    id: 'wide-tabs',
    title: '方案 A：横向一级标签',
    summary: '把作品、人物、势力、道具等放到同一排，左侧只跟随当前标签显示分组和条目。',
    recommended: true,
  },
  {
    id: 'compressed-center',
    title: '方案 B：压缩中区信息栏',
    summary: '保留左侧主入口，但把红框上方压成一行，让编辑区更像资料卡工作台。',
  },
  {
    id: 'status-ledger',
    title: '方案 C：状态台账优先',
    summary: '适合后期章节很多时查看“基础设定”和“当前状态”的差异与更新记录。',
  },
];

const settingDomains: SettingDomain[] = [
  {
    id: 'work',
    label: '作品设定',
    count: 10,
    icon: BookOpen,
    tone: 'bg-slate-950 text-white',
    groups: [
      { name: '核心设定', count: 2, entries: ['故事起点', '核心矛盾'] },
      { name: '世界规则', count: 3, entries: ['九重天界', '吞噬规则', '修炼限制'] },
      { name: '金手指', count: 2, entries: ['吞噬系统', '误用风险'] },
    ],
    editor: {
      title: '吞噬系统与九重天界',
      group: '核心设定',
      status: '基础设定',
      chapter: '全书通用',
      blocks: [
        { title: '题材卖点', hint: '记录第一眼爽点、差异点、读者期待。', words: 326 },
        { title: '世界规则', hint: '记录不可随意改变的底层逻辑。', words: 512 },
        { title: '禁写规则', hint: '记录不能写错、不能越界的硬约束。', words: 88 },
      ],
    },
  },
  {
    id: 'character',
    label: '人物设定',
    count: 6,
    icon: Users,
    tone: 'bg-[#08AACE] text-white',
    groups: [
      { name: '男主角', count: 1, entries: ['林刻'] },
      { name: '女主角', count: 1, entries: ['沈青璃'] },
      { name: '正派配角', count: 2, entries: ['赵玄', '云澜长老'] },
    ],
    editor: {
      title: '林刻',
      group: '男主角',
      status: '第 12 章状态',
      chapter: '关联第 12 章',
      blocks: [
        { title: '基础设定', hint: '姓名、身份、外貌、核心性格、能力规则。', words: 486 },
        { title: '人物关系', hint: '只写这个人物自己的关系，全局关系另放作品设定。', words: 214 },
        { title: '状态设定', hint: '当前处境、当前目标、身份状态、能力状态。', words: 368 },
      ],
    },
  },
  {
    id: 'faction',
    label: '势力组织',
    count: 5,
    icon: Landmark,
    tone: 'bg-emerald-500 text-white',
    groups: [
      { name: '宗门势力', count: 2, entries: ['青云宗', '万剑阁'] },
      { name: '朝廷势力', count: 1, entries: ['镇天司'] },
      { name: '敌对组织', count: 2, entries: ['血河盟', '黑市会'] },
    ],
    editor: {
      title: '青云宗',
      group: '宗门势力',
      status: '第 12 章状态',
      chapter: '关联第 8-12 章',
      blocks: [
        { title: '基础档案', hint: '立场、等级、核心资源、公开目标。', words: 278 },
        { title: '成员结构', hint: '宗主、长老、弟子、暗线成员。', words: 193 },
        { title: '关系冲突', hint: '盟友、敌人、利益交换、潜在背叛。', words: 241 },
        { title: '当前状态', hint: '当前章节势力损耗、立场变化、掌握情报。', words: 156 },
      ],
    },
  },
  {
    id: 'item',
    label: '道具资源',
    count: 7,
    icon: Gem,
    tone: 'bg-amber-400 text-slate-950',
    groups: [
      { name: '法宝', count: 2, entries: ['吞天骨匣', '九玄令'] },
      { name: '丹药', count: 1, entries: ['破境丹'] },
      { name: '材料', count: 2, entries: ['本源幽火', '魔剑残魂'] },
    ],
    editor: {
      title: '吞天骨匣',
      group: '法宝',
      status: '当前持有人：林刻',
      chapter: '第 3 章首次出现',
      blocks: [
        { title: '基础规则', hint: '用途、来源、稀缺性、不可改变的限制。', words: 226 },
        { title: '持有人变化', hint: '章节推进中的归属、损耗和升级。', words: 142 },
        { title: '限制代价', hint: '误用风险、冷却条件、被克制方式。', words: 198 },
      ],
    },
  },
  {
    id: 'location',
    label: '地点场景',
    count: 4,
    icon: MapPinned,
    tone: 'bg-indigo-500 text-white',
    groups: [
      { name: '宗门地图', count: 2, entries: ['青云宗山门', '禁地石窟'] },
      { name: '城市区域', count: 1, entries: ['黑水城'] },
      { name: '秘境', count: 1, entries: ['碎星古境'] },
    ],
    editor: {
      title: '禁地石窟',
      group: '宗门地图',
      status: '未公开区域',
      chapter: '第 1-4 章',
      blocks: [
        { title: '空间规则', hint: '位置、入口、限制、危险区域。', words: 164 },
        { title: '剧情用途', hint: '埋伏、逃生、突破、揭露秘密。', words: 206 },
        { title: '状态变化', hint: '封印是否破坏、谁知道入口。', words: 92 },
      ],
    },
  },
  {
    id: 'foreshadow',
    label: '伏笔线索',
    count: 8,
    icon: Flag,
    tone: 'bg-rose-500 text-white',
    groups: [
      { name: '主线伏笔', count: 3, entries: ['骨匣低语', '九玄令缺口', '未婚妻退婚原因'] },
      { name: '人物伏笔', count: 2, entries: ['云澜长老旧伤', '沈青璃家族'] },
      { name: '反转伏笔', count: 1, entries: ['镇天司密令'] },
    ],
    editor: {
      title: '九玄令缺口',
      group: '主线伏笔',
      status: '已埋未回收',
      chapter: '埋入第 2 章',
      blocks: [
        { title: '埋入方式', hint: '读者看见什么，角色误解什么。', words: 116 },
        { title: '回收计划', hint: '在哪个阶段揭开，带来什么反转。', words: 188 },
        { title: '风险提醒', hint: '不能提前解释过多，避免破坏悬念。', words: 76 },
      ],
    },
  },
  {
    id: 'rule',
    label: '规则禁区',
    count: 3,
    icon: LockKeyhole,
    tone: 'bg-zinc-700 text-white',
    groups: [
      { name: '不能写错', count: 1, entries: ['主角不能主动滥杀无辜'] },
      { name: '不能越界', count: 1, entries: ['系统不能替主角做决定'] },
      { name: '前后矛盾', count: 1, entries: ['吞噬能力必须有代价'] },
    ],
    editor: {
      title: '吞噬能力必须有代价',
      group: '前后矛盾',
      status: '强约束',
      chapter: '全书通用',
      blocks: [
        { title: '硬规则', hint: '每次吞噬必须暴露风险或消耗资源。', words: 132 },
        { title: '例外条件', hint: '例外必须提前埋伏笔，不能临时开口子。', words: 98 },
        { title: '检查点', hint: '审核和状态更新时优先检查。', words: 64 },
      ],
    },
  },
];

function Pill({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${active ? 'bg-[#08AACE] text-white' : 'bg-slate-100 text-slate-500'}`}>
      {children}
    </span>
  );
}

function CharacterSplitterPreview() {
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-full border border-cyan-100 bg-[#F2FBFE] px-3 py-1.5 text-xs font-black text-slate-600">
      <span className="text-[#078FAE]">基础/状态分割线</span>
      <div className="grid h-7 w-[250px] grid-cols-[minmax(0,1fr)_14px_minmax(0,1fr)] overflow-hidden rounded-xl border border-cyan-100 bg-white">
        <div className="grid place-items-center truncate px-2 text-slate-600">基础设定</div>
        <div
          className="group flex h-full cursor-ew-resize touch-none items-stretch justify-center bg-transparent"
          title="拖拽调整基础设定和状态设定的宽度"
        >
          <div className="h-full w-px bg-[#08AACE] opacity-100" />
        </div>
        <div className="grid place-items-center truncate px-2 text-[#078FAE]">状态设定</div>
      </div>
    </div>
  );
}

function DomainTabs({
  activeDomain,
  onSelect,
}: {
  activeDomain: SettingDomain;
  onSelect: (domain: SettingDomain) => void;
}) {
  return (
    <div className="scrollbar-hidden flex min-w-0 items-center gap-2 overflow-x-auto border-b border-slate-100 bg-white px-4 py-3">
      {settingDomains.map((domain) => {
        const Icon = domain.icon;
        const active = domain.id === activeDomain.id;
        return (
          <button
            key={domain.id}
            type="button"
            onClick={() => onSelect(domain)}
            className={`flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-black transition-colors ${
              active
                ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE] shadow-sm'
                : 'border-slate-200 bg-white text-slate-500 hover:border-[#08AACE]/50 hover:text-[#078FAE]'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{domain.label}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white text-[#078FAE]' : 'bg-slate-100 text-slate-400'}`}>
              {domain.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DomainSidebar({ domain }: { domain: SettingDomain }) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-slate-100 bg-slate-50">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4">
        <div className="flex items-center gap-2 text-sm font-black text-slate-900">
          <FolderOpen className="h-4 w-4 text-[#08AACE]" />
          分组与条目
        </div>
        <Pill active>{domain.count} 项</Pill>
      </div>
      <div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {domain.groups.map((group, groupIndex) => (
          <section key={group.name}>
            <button
              type="button"
              className={`flex h-10 w-full items-center justify-between rounded-xl border px-3 text-left text-sm font-black ${
                groupIndex === 0
                  ? 'border-cyan-200 bg-[#EAF9FD] text-slate-950 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <span className="truncate">{group.name}</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-[#078FAE]">{group.count}</span>
            </button>
            <div className="mt-2 space-y-1.5 pl-3">
              {group.entries.map((entry, entryIndex) => (
                <button
                  key={entry}
                  type="button"
                  className={`flex h-9 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-black ${
                    groupIndex === 0 && entryIndex === 0
                      ? 'bg-amber-50 text-slate-950'
                      : 'bg-white text-slate-500'
                  }`}
                >
                  <span className="truncate">{entry}</span>
                  <span className="text-xs text-slate-400">{entryIndex === 0 ? '当前' : '0字'}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="grid h-14 shrink-0 grid-cols-3 gap-px border-t border-slate-100 bg-slate-100 p-2">
        <button className="rounded-l-xl bg-[#EAF9FD] text-sm font-black text-[#078FAE]">新建</button>
        <button className="bg-white text-sm font-black text-slate-700">分组</button>
        <button className="rounded-r-xl bg-white text-sm font-black text-slate-700">条目</button>
      </div>
    </aside>
  );
}

function InfoBar({ domain }: { domain: SettingDomain }) {
  return (
    <div className="grid shrink-0 grid-cols-[minmax(0,1.3fr)_140px_150px_150px] gap-3 border-b border-slate-100 bg-white px-4 py-3">
      <div className="min-w-0 rounded-xl border-2 border-slate-950 bg-white px-4 py-2">
        <div className="text-[11px] font-black text-slate-400">名称</div>
        <div className="truncate text-lg font-black text-slate-950">{domain.editor.title}</div>
      </div>
      <div className="rounded-xl border border-cyan-200 bg-[#EAF9FD] px-3 py-2">
        <div className="text-[11px] font-black text-[#078FAE]">分组</div>
        <div className="truncate text-sm font-black text-slate-900">{domain.editor.group}</div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <div className="text-[11px] font-black text-slate-400">状态</div>
        <div className="truncate text-sm font-black text-slate-800">{domain.editor.status}</div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <div className="text-[11px] font-black text-slate-400">关联章节</div>
        <div className="truncate text-sm font-black text-slate-800">{domain.editor.chapter}</div>
      </div>
    </div>
  );
}

function EditorBlocks({ domain, compact = false }: { domain: SettingDomain; compact?: boolean }) {
  return (
    <div className={`grid min-h-0 flex-1 gap-4 overflow-hidden p-4 ${compact ? 'grid-cols-2' : 'grid-cols-[repeat(auto-fit,minmax(240px,1fr))]'}`}>
      {domain.editor.blocks.map((block, index) => (
        <section
          key={block.title}
          className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-white ${
            index === 0 ? 'border-slate-200 bg-slate-50' : index === 1 ? 'border-emerald-200 bg-emerald-50/40' : 'border-cyan-200 bg-[#F2FBFE]'
          }`}
        >
          <div className="flex h-13 shrink-0 items-center justify-between border-b border-white/80 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${index === 0 ? 'bg-slate-950' : index === 1 ? 'bg-emerald-500' : 'bg-[#08AACE]'}`} />
              <h3 className="truncate text-base font-black text-slate-950">{block.title}</h3>
            </div>
            <span className="text-sm font-black text-slate-400">{block.words}字</span>
          </div>
          <div className="min-h-0 flex-1 p-4">
            <div className="editor-scrollbar h-full rounded-xl border border-slate-200 bg-white p-5 text-sm font-bold leading-8 text-slate-400">
              {block.hint}
              <div className="mt-5 h-2 w-2/3 rounded-full bg-slate-100" />
              <div className="mt-3 h-2 w-5/6 rounded-full bg-slate-100" />
              <div className="mt-3 h-2 w-1/2 rounded-full bg-slate-100" />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function AiPanel() {
  return (
    <aside className="flex min-h-0 flex-col border-l border-slate-100 bg-white">
      <div className="grid shrink-0 grid-cols-2 gap-2 border-b border-slate-100 p-4">
        <div className="rounded-xl border-2 border-[#08AACE] bg-white px-3 py-2">
          <div className="text-[11px] font-black text-[#078FAE]">模型</div>
          <div className="truncate text-sm font-black text-slate-900">deepseek</div>
        </div>
        <div className="rounded-xl border-2 border-[#08AACE] bg-white px-3 py-2">
          <div className="text-[11px] font-black text-[#078FAE]">提示词</div>
          <div className="truncate text-sm font-black text-slate-900">大纲设定8</div>
        </div>
      </div>
      <div className="min-h-0 flex-1 p-4">
        <div className="flex h-full flex-col rounded-2xl border-2 border-slate-950 bg-white">
          <div className="flex h-12 shrink-0 items-center justify-between px-4">
            <div className="flex items-center gap-2 text-sm font-black text-slate-950">
              <Sparkles className="h-4 w-4 text-[#08AACE]" />
              生成设定
            </div>
            <button className="text-xs font-black text-red-400">清空</button>
          </div>
          <div className="flex-1 border-t border-slate-100 p-4 text-sm font-bold leading-7 text-slate-400">
            右侧 AI 区域保持共用，不因为势力、道具、地点拆成多个正式页面而重复一套。
          </div>
          <div className="grid h-14 shrink-0 grid-cols-[1fr_44px] gap-2 border-t border-slate-100 p-3">
            <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-400">请输入要求</div>
            <button className="grid place-items-center rounded-xl bg-[#08AACE] text-white">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function WideTabsLayout({ domain, onSelectDomain }: { domain: SettingDomain; onSelectDomain: (domain: SettingDomain) => void }) {
  return (
    <div className="grid h-full min-h-0 grid-cols-[260px_minmax(0,1fr)_360px] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="col-span-2">
        <DomainTabs activeDomain={domain} onSelect={onSelectDomain} />
      </div>
      <div className="row-start-2">
        <DomainSidebar domain={domain} />
      </div>
      <main className="row-start-2 flex min-h-0 flex-col bg-white">
        <InfoBar domain={domain} />
        <EditorBlocks domain={domain} />
      </main>
      <div className="row-span-2 col-start-3 row-start-1">
        <AiPanel />
      </div>
    </div>
  );
}

function CompressedCenterLayout({ domain, onSelectDomain }: { domain: SettingDomain; onSelectDomain: (domain: SettingDomain) => void }) {
  return (
    <div className="grid h-full min-h-0 grid-cols-[292px_minmax(0,1fr)_348px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <aside className="flex min-h-0 flex-col border-r border-slate-100 bg-slate-50">
        <div className="border-b border-slate-100 bg-white p-3">
          <div className="grid grid-cols-2 rounded-[20px] bg-slate-200/80 p-1 shadow-inner">
            {settingDomains.slice(0, 2).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectDomain(item)}
                className={`h-10 rounded-[16px] text-sm font-black ${item.id === domain.id ? 'bg-white text-[#078FAE] shadow-sm' : 'text-slate-600'}`}
              >
                {item.label} {item.count}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {settingDomains.slice(2).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectDomain(item)}
                className={`h-9 rounded-xl border text-xs font-black ${item.id === domain.id ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE]' : 'border-slate-200 bg-white text-slate-500'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <DomainSidebar domain={domain} />
      </aside>
      <main className="flex min-h-0 flex-col">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 bg-white px-4">
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${domain.tone}`}>
            <domain.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-black text-slate-950">{domain.editor.title}</div>
            <div className="mt-0.5 flex min-w-0 gap-2">
              <Pill>{domain.label}</Pill>
              <Pill>{domain.editor.group}</Pill>
              <Pill active>{domain.editor.status}</Pill>
              <Pill>{domain.editor.chapter}</Pill>
            </div>
          </div>
          <button className="h-9 rounded-xl border border-red-100 bg-red-50 px-3 text-xs font-black text-red-400">删除</button>
        </div>
        <EditorBlocks domain={domain} compact />
      </main>
      <AiPanel />
    </div>
  );
}

function StatusLedgerLayout({ domain, onSelectDomain }: { domain: SettingDomain; onSelectDomain: (domain: SettingDomain) => void }) {
  const chapters = ['第 8 章', '第 9 章', '第 10 章', '第 11 章', '第 12 章'];
  return (
    <div className="grid h-full min-h-0 grid-cols-[260px_minmax(0,1fr)_360px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <aside className="flex min-h-0 flex-col border-r border-slate-100 bg-slate-50">
        <div className="shrink-0 border-b border-slate-100 bg-white p-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="h-4 w-4 text-slate-300" />
            <span className="text-sm font-bold text-slate-400">搜索设定状态</span>
          </div>
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {settingDomains.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectDomain(item)}
                className={`flex h-12 w-full items-center justify-between rounded-xl border px-3 text-left text-sm font-black ${
                  item.id === domain.id ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE]' : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs">{item.count}</span>
              </button>
            );
          })}
        </div>
      </aside>
      <main className="flex min-h-0 flex-col">
        <InfoBar domain={domain} />
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4 overflow-hidden p-4">
          <section className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4">
              <div className="flex items-center gap-2 text-base font-black text-slate-950">
                <CircleDot className="h-4 w-4" />
                基础设定
              </div>
              <Pill>低频变化</Pill>
            </div>
            <div className="editor-scrollbar flex-1 overflow-y-auto p-4 text-sm font-bold leading-8 text-slate-500">
              {domain.editor.blocks[0]?.hint}
              <div className="mt-5 space-y-3">
                <div className="h-2 rounded-full bg-white" />
                <div className="h-2 w-4/5 rounded-full bg-white" />
                <div className="h-2 w-2/3 rounded-full bg-white" />
              </div>
            </div>
          </section>
          <section className="flex min-h-0 flex-col rounded-2xl border border-[#08AACE]/25 bg-white">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
              <div className="flex items-center gap-2 text-base font-black text-[#078FAE]">
                <Tags className="h-4 w-4" />
                状态台账
              </div>
              <Pill active>按章节更新</Pill>
            </div>
            <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {chapters.map((chapter, index) => (
                  <article
                    key={chapter}
                    className={`rounded-xl border p-3 ${index === chapters.length - 1 ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-200 bg-slate-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-slate-950">{chapter}</span>
                      <span className="text-xs font-black text-slate-400">{index === chapters.length - 1 ? '当前' : '已记录'}</span>
                    </div>
                    <p className="mt-2 text-xs font-bold leading-5 text-slate-500">
                      {index === chapters.length - 1 ? domain.editor.blocks[domain.editor.blocks.length - 1]?.hint : '保留这一章之后的状态快照，方便后期查错。'}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      <AiPanel />
    </div>
  );
}

export function SettingWorkspaceMultiLayoutTestPage() {
  const [activeLayoutId, setActiveLayoutId] = useState<LayoutOption['id']>('wide-tabs');
  const [activeDomainId, setActiveDomainId] = useState('faction');
  const activeLayout = layoutOptions.find((option) => option.id === activeLayoutId) ?? layoutOptions[0];
  const activeDomain = settingDomains.find((domain) => domain.id === activeDomainId) ?? settingDomains[0];
  const LayoutPreview = useMemo(() => {
    if (activeLayout.id === 'compressed-center') return CompressedCenterLayout;
    if (activeLayout.id === 'status-ledger') return StatusLedgerLayout;
    return WideTabsLayout;
  }, [activeLayout.id]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F6F8FB]">
      <header className="shrink-0 border-b border-slate-100 bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-black text-[#078FAE]">
              <PanelRight className="h-4 w-4" />
              设定页原型
            </div>
            <h1 className="mt-1 truncate text-xl font-black text-slate-950">设定工作台多标签布局测试</h1>
          </div>
          <div className="flex max-w-[820px] shrink-0 items-center gap-2 overflow-x-auto">
            {layoutOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setActiveLayoutId(option.id)}
                className={`h-10 shrink-0 rounded-xl border px-4 text-sm font-black transition-colors ${
                  option.id === activeLayout.id
                    ? 'border-[#08AACE] bg-[#08AACE] text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#08AACE]/50 hover:text-[#078FAE]'
                }`}
              >
                <span>{option.title}</span>
                {option.recommended ? (
                  <span className="ml-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-black text-[#078FAE]">
                    推荐方案
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs font-bold text-slate-500">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
            <Boxes className="h-3.5 w-3.5 text-[#08AACE]" />
            一级标签：作品、人物、势力、道具、地点、伏笔、规则
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
            <MessageSquareText className="h-3.5 w-3.5 text-emerald-500" />
            <span className="truncate">{activeLayout.summary}</span>
          </span>
          <CharacterSplitterPreview />
        </div>
      </header>

      <main className="min-h-0 flex-1 p-5">
        <LayoutPreview domain={activeDomain} onSelectDomain={(domain) => setActiveDomainId(domain.id)} />
      </main>

      <footer className="grid h-14 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-slate-100 bg-white px-5 text-xs font-bold text-slate-500">
        <div className="flex min-w-0 items-center gap-2">
          <Link2 className="h-4 w-4 shrink-0 text-[#08AACE]" />
          <span className="truncate">这个页面只用于比较设定页布局，不写入正式数据；你选中方案后再迁到正式设定页。</span>
        </div>
        <div className="flex items-center gap-2">
          <Pill active>{activeDomain.label}</Pill>
          <Pill>{activeLayout.title}</Pill>
        </div>
      </footer>
    </div>
  );
}

export default SettingWorkspaceMultiLayoutTestPage;
