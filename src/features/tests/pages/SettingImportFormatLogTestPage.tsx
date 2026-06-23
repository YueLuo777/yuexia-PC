import { Check, ClipboardList, FileText, Folder, Logs, Tags } from 'lucide-react';
import { useMemo, useState } from 'react';

type FormatEntry = {
  id: string;
  tab: string;
  group: string;
  title: string;
  fields: string[];
  note?: string;
};

type FormatTab = {
  id: string;
  title: string;
  groups: Array<{
    name: string;
    entries: FormatEntry[];
  }>;
};

const formatTabs: FormatTab[] = [
  {
    id: 'work',
    title: '作品设定',
    groups: [
      {
        name: '核心设定',
        entries: [
          {
            id: 'work-basic',
            tab: '作品设定',
            group: '核心设定',
            title: '基础设定',
            fields: ['故事类型', '核心创意', '一句话概括'],
          },
          {
            id: 'work-world-view',
            tab: '作品设定',
            group: '核心设定',
            title: '世界观',
            fields: ['时代背景', '世界格局', '社会秩序'],
          },
          {
            id: 'work-cheat',
            tab: '作品设定',
            group: '核心设定',
            title: '主角金手指/优势',
            fields: ['能力来源', '核心功能', '升级方式', '使用限制', '隐藏真相'],
          },
        ],
      },
      {
        name: '剧情规划',
        entries: [
          {
            id: 'plot-blueprint',
            tab: '作品设定',
            group: '剧情规划',
            title: '剧情蓝图',
            fields: ['整体规划', '主线目标', '阶段节奏'],
          },
          {
            id: 'plot-payoff',
            tab: '作品设定',
            group: '剧情规划',
            title: '爽点设计',
            fields: ['核心爽点类型', '打脸对象设计', '爽点公式', '爽点节奏'],
          },
          {
            id: 'plot-volume',
            tab: '作品设定',
            group: '剧情规划',
            title: '分卷剧情',
            fields: ['分卷总览', '卷核心事件', '卷末高潮', '下一卷钩子'],
          },
        ],
      },
      {
        name: '书写规则',
        entries: [
          {
            id: 'writing-style',
            tab: '作品设定',
            group: '书写规则',
            title: '写作规范',
            fields: ['行文风格', '对话风格', '节奏规则', '视角规则'],
          },
          {
            id: 'writing-ban',
            tab: '作品设定',
            group: '书写规则',
            title: '写作禁忌',
            fields: ['不能前后矛盾', '不能写崩人设', '不能跳过铺垫', '不能破坏爽点承诺'],
          },
        ],
      },
    ],
  },
  {
    id: 'role',
    title: '人物设定',
    groups: [
      {
        name: '男主角',
        entries: [
          {
            id: 'role-male-lead',
            tab: '人物设定',
            group: '男主角',
            title: '男主角设定',
            fields: [
              '人物姓名',
              '身份定位',
              '外貌',
              '称号/外号/别称',
              '核心性格',
              '人物背景',
              '金手指/能力',
              '人物关系',
              '当前处境',
              '当前目标',
              '能力状态',
              '资源状态',
              '其他',
            ],
            note: '人物设定会写入角色库；写上“身份定位：男主角”时，会优先匹配男主角角色。',
          },
        ],
      },
    ],
  },
  {
    id: 'faction',
    title: '势力地图',
    groups: [
      {
        name: '正派势力',
        entries: [
          {
            id: 'faction-righteous',
            tab: '势力地图',
            group: '正派势力',
            title: '1号势力',
            fields: ['基本信息', '势力特点', '组织架构', '主要人物', '势力关系', '对主角策略', '核心问题/矛盾'],
          },
        ],
      },
      {
        name: '反派势力',
        entries: [
          {
            id: 'faction-villain',
            tab: '势力地图',
            group: '反派势力',
            title: '反派势力',
            fields: ['基本信息', '势力特点', '组织架构', '主要人物', '势力关系', '对主角策略', '核心问题/矛盾'],
          },
        ],
      },
      {
        name: '中立势力',
        entries: [
          {
            id: 'faction-neutral',
            tab: '势力地图',
            group: '中立势力',
            title: '中立势力',
            fields: ['基本信息', '势力特点', '组织架构', '主要人物', '势力关系', '对主角策略', '核心问题/矛盾'],
          },
        ],
      },
      {
        name: '其他势力',
        entries: [
          {
            id: 'faction-other',
            tab: '势力地图',
            group: '其他势力',
            title: '其他势力',
            fields: ['基本信息', '势力特点', '组织架构', '主要人物', '势力关系', '对主角策略', '核心问题/矛盾'],
          },
        ],
      },
      {
        name: '世界地图',
        entries: [
          {
            id: 'world-structure',
            tab: '势力地图',
            group: '世界地图',
            title: '世界架构',
            fields: ['世界架构', '区域划分', '势力分布', '资源分布', '世界规则', '当前局势', '封锁/开放', '主角已知范围', '近期变化'],
          },
          {
            id: 'danger-zone',
            tab: '势力地图',
            group: '世界地图',
            title: '危险区域',
            fields: ['区域概况', '危险来源', '进入条件', '资源收益', '历史背景', '核心规则', '当前状态', '探索进度', '风险变化', '资源剩余', '已触发事件', '外部势力介入'],
          },
        ],
      },
    ],
  },
  {
    id: 'item',
    title: '道具资源',
    groups: [
      {
        name: '功法能力',
        entries: [
          {
            id: 'ability',
            tab: '道具资源',
            group: '功法能力',
            title: '功法能力',
            fields: ['基本信息', '能力来源', '核心效果', '修炼/升级', '使用限制', '相关伏笔', '当前熟练度', '当前突破', '受损/封印', '暴露程度', '冷却/代价', '最近使用'],
          },
        ],
      },
      {
        name: '物品装备',
        entries: [
          {
            id: 'equipment',
            tab: '道具资源',
            group: '物品装备',
            title: '物品装备',
            fields: ['基本信息', '物品描述', '效果/功能', '来历', '归属变化', '当前状态', '相关伏笔'],
          },
        ],
      },
      {
        name: '资源货币',
        entries: [
          {
            id: 'currency',
            tab: '道具资源',
            group: '资源货币',
            title: '资源货币',
            fields: ['基本信息', '价值等级', '获取渠道', '消耗用途', '流通限制', '关联规则'],
            note: '资源货币只做规则设定，不写主角库存；状态更新一般不写这里。',
          },
        ],
      },
      {
        name: '特殊资源',
        entries: [
          {
            id: 'special-resource',
            tab: '道具资源',
            group: '特殊资源',
            title: '特殊资源',
            fields: ['基本信息', '获取条件', '使用规则', '权限边界', '失效条件', '主线关联', '当前归属', '可用状态', '剩余次数', '竞争风险', '激活进度', '最近触发'],
          },
        ],
      },
    ],
  },
  {
    id: 'monster',
    title: '怪物图鉴',
    groups: [
      {
        name: '怪物列表',
        entries: [
          {
            id: 'monster-list',
            tab: '怪物图鉴',
            group: '怪物列表',
            title: '怪物图鉴',
            fields: ['怪物形象', '怪物能力', '怪物背景', '怪物弱点', '出没位置', '掉落/资源'],
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
            id: 'main-foreshadow',
            tab: '伏笔线索',
            group: '主线伏笔',
            title: '主线伏笔',
            fields: ['埋设内容', '出现位置', '误导方向', '回收计划', '最终真相'],
          },
        ],
      },
      {
        name: '人物伏笔',
        entries: [
          {
            id: 'role-foreshadow',
            tab: '伏笔线索',
            group: '人物伏笔',
            title: '人物伏笔',
            fields: ['身份秘密', '血脉/身世', '关系伏笔', '背叛/转变', '回收计划'],
          },
        ],
      },
      {
        name: '已回收伏笔',
        entries: [
          {
            id: 'resolved-foreshadow',
            tab: '伏笔线索',
            group: '已回收伏笔',
            title: '已回收伏笔',
            fields: ['已揭露秘密', '已解决线索', '已完成回收', '影响结果'],
          },
        ],
      },
    ],
  },
];

const logTabs = ['输出日志', '格式'] as const;
type LogTab = (typeof logTabs)[number];

function findEntry(entryId: string) {
  return formatTabs.flatMap((tab) => tab.groups.flatMap((group) => group.entries)).find((entry) => entry.id === entryId) ?? formatTabs[0].groups[0].entries[0];
}

function buildImportFormat(entry: FormatEntry) {
  if (entry.tab === '人物设定') {
    return [
      '<人物设定>',
      `*${entry.title}*：`,
      '',
      ...entry.fields.flatMap((field) => [`【${field}】：`, field === '身份定位' ? '男主角' : '内容', '']),
      '</人物设定>',
    ].join('\n').trimEnd();
  }

  return [
    `<${entry.tab}>`,
    `<${entry.group}>`,
    `*${entry.title}*：`,
    '',
    ...entry.fields.flatMap((field) => [`【${field}】：`, '内容', '']),
    `</${entry.group}>`,
    `</${entry.tab}>`,
  ].join('\n').trimEnd();
}

export function SettingImportFormatLogTestPage() {
  const [activeLogTab, setActiveLogTab] = useState<LogTab>('格式');
  const [activeTabId, setActiveTabId] = useState(formatTabs[0].id);
  const [selectedEntryId, setSelectedEntryId] = useState(formatTabs[0].groups[0].entries[0].id);

  const activeFormatTab = formatTabs.find((tab) => tab.id === activeTabId) ?? formatTabs[0];
  const selectedEntry = findEntry(selectedEntryId);
  const previewText = useMemo(() => buildImportFormat(selectedEntry), [selectedEntry]);

  const selectFormatTab = (tabId: string) => {
    const nextTab = formatTabs.find((tab) => tab.id === tabId) ?? formatTabs[0];
    setActiveTabId(nextTab.id);
    setSelectedEntryId(nextTab.groups[0].entries[0].id);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-black text-slate-950">智能导入格式日志测试</h1>
          <p className="mt-1 text-xs font-bold text-slate-400">模拟在右上角日志中新增“格式”标签，查看每个设定条目可写入的智能导入格式。</p>
        </div>
        <button className="flex h-10 items-center gap-2 rounded-xl border border-cyan-200 bg-white px-4 text-sm font-black text-[#08AACE]">
          <Logs className="h-4 w-4" />
          日志
        </button>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden p-5">
        <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-base font-black text-slate-900">日志</h2>
              <p className="mt-1 text-xs font-bold text-slate-400">输出日志保留原有请求预览；格式页专门展示可复制给 AI 的导入结构。</p>
            </div>
            <div className="inline-grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white text-sm font-black">
              {logTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveLogTab(tab)}
                  className={`h-10 min-w-[104px] px-5 transition-colors ${
                    activeLogTab === tab
                      ? 'bg-[#EAF9FD] text-[#08AACE]'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {activeLogTab === '输出日志' ? (
            <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 text-sm font-bold text-slate-400">
              这里是原本的输出日志页面。
            </div>
          ) : (
            <div className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)] overflow-hidden">
              <aside className="flex min-h-0 flex-col border-r border-slate-100 bg-slate-50">
                <div className="shrink-0 border-b border-slate-100 bg-white p-3">
                  <div className="grid grid-cols-2 gap-1">
                    {formatTabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => selectFormatTab(tab.id)}
                        className={`h-9 rounded-lg text-xs font-black transition-colors ${
                          activeTabId === tab.id
                            ? 'border border-[#9FEAF6] bg-[#EAF9FD] text-[#08AACE]'
                            : 'border border-transparent bg-white text-slate-600 hover:border-cyan-100 hover:text-[#08AACE]'
                        }`}
                      >
                        {tab.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
                  {activeFormatTab.groups.map((group) => (
                    <section key={group.name}>
                      <div className="flex h-9 items-center gap-2 rounded-md border border-[#BDEEF7] bg-[#EAF9FD] px-2 text-sm font-black text-slate-900">
                        <Folder className="h-4 w-4 text-[#08AACE]" />
                        <span className="min-w-0 flex-1 truncate">{group.name}</span>
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">{group.entries.length}</span>
                      </div>
                      <div className="mt-1 space-y-1">
                        {group.entries.map((entry) => (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => setSelectedEntryId(entry.id)}
                            className={`flex min-h-[34px] w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-sm font-black transition-colors ${
                              selectedEntry.id === entry.id
                                ? 'border border-[#9FEAF6] bg-[#EAF9FD] text-[#08AACE]'
                                : 'bg-white text-slate-700 hover:bg-[#F8FEFF]'
                            }`}
                          >
                            <span className="min-w-0 truncate">{entry.title}</span>
                            <span className="shrink-0 rounded-full bg-slate-50 px-2 py-0.5 text-xs text-[#08AACE]">{entry.fields.length}</span>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </aside>

              <section className="min-h-0 overflow-y-auto bg-white p-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-black text-[#08AACE]">
                      <span>{selectedEntry.tab}</span>
                      <span>/</span>
                      <span>{selectedEntry.group}</span>
                    </div>
                    <h3 className="mt-1 text-2xl font-black text-slate-950">{selectedEntry.title}</h3>
                    <p className="mt-2 text-sm font-bold text-slate-500">
                      智能导入会写入到：{selectedEntry.tab} / {selectedEntry.group} / {selectedEntry.title}
                    </p>
                  </div>
                  <span className="rounded-xl border border-cyan-200 bg-[#EAF9FD] px-3 py-2 text-xs font-black text-[#08AACE]">格式预览</span>
                </div>

                {selectedEntry.note && (
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-black leading-6 text-amber-800">
                    {selectedEntry.note}
                  </div>
                )}

                <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-900">
                    <ClipboardList className="h-4 w-4 text-[#08AACE]" />
                    条目下的子设定
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedEntry.fields.map((field) => (
                      <div key={field} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="text-sm font-black text-slate-900">【{field}】：</div>
                        <div className="mt-2 h-12 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-400">内容</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-900 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                      <FileText className="h-4 w-4 text-[#08AACE]" />
                      可复制格式
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                      <Check className="h-3.5 w-3.5" />
                      按智能导入结构生成
                    </span>
                  </div>
                  <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-sm font-bold leading-7 text-slate-100">
                    {previewText}
                  </pre>
                </div>
              </section>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default SettingImportFormatLogTestPage;
