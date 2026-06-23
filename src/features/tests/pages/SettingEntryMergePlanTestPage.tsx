import {
  ArrowRight,
  BookOpen,
  Boxes,
  Check,
  Flag,
  Gem,
  LockKeyhole,
  MapPinned,
  Merge,
  Sparkles,
  Tags,
  type LucideIcon,
} from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';

type MergeDomain = {
  id: string;
  label: string;
  icon: LucideIcon;
  tone: string;
  beforeCount: number;
  groups: Array<{
    name: string;
    before: string[];
    after: string[];
  }>;
};

type MergePlan = {
  id: 'light' | 'balanced' | 'compact';
  title: string;
  badge: string;
  summary: string;
  recommended?: boolean;
  domains: MergeDomain[];
};

type TagScheme = {
  id: 'seven-tabs' | 'four-tabs' | 'three-tabs' | 'two-layer';
  title: string;
  badge: string;
  tabs: string[];
  summary: string;
  tradeoff: string;
  recommended?: boolean;
};

const tagSchemeOptions: TagScheme[] = [
  {
    id: 'seven-tabs',
    title: '当前七标签',
    badge: '最细',
    tabs: ['作品设定', '人物设定', '势力设定', '道具资源', '地点场景', '伏笔线索', '书写规则'],
    summary: '每类资料都有独立入口，查找直观，但顶部会越来越挤。',
    tradeoff: '适合后期资料很多的长篇；早期设定阶段会显得分散。',
  },
  {
    id: 'four-tabs',
    title: '四标签',
    badge: '推荐',
    tabs: ['作品设定', '人物设定', '世界资料', '追踪规则'],
    summary: '把势力、道具、地点合进世界资料，把伏笔和书写规则合进追踪规则。',
    tradeoff: '保留清晰边界，又不会让顶部标签太多。',
    recommended: true,
  },
  {
    id: 'three-tabs',
    title: '三标签',
    badge: '更省',
    tabs: ['作品蓝图', '角色势力', '章节追踪'],
    summary: '把人物和势力放一起，把伏笔、规则、摘要都作为章节追踪资料。',
    tradeoff: '适合让 AI 多靠提示词自动分拣；人工查资料时入口更粗。',
  },
  {
    id: 'two-layer',
    title: '双层标签',
    badge: '最稳',
    tabs: ['基础设定', '动态追踪'],
    summary: '第一层只分基础资料和随章节变化的资料，第二层再选人物、势力、道具、伏笔。',
    tradeoff: '顶部最干净，但需要在左侧或中区增加二级筛选。',
  },
];

const entryPurposeNotes: Record<string, string> = {
  作品定位与读者承诺: '给 AI 判断题材、卖点、读者期待和不能偏离的方向。',
  主角开局与成长线: '记录主角起点、困境、资源、目标和成长终点，避免开局与后期脱节。',
  核心矛盾与金手指: '约束主线冲突、外挂能力、使用代价和爽点来源。',
  力量与境界规则: '给 AI 生成细纲和正文时检查能力上限、升级条件和代价。',
  资源与交易规则: '让资源、货币、材料、兑换关系有统一尺度。',
  世界背景与社会秩序: '记录时代、地域、阶层、组织秩序和日常运行规则。',
  禁忌规则: '记录世界里不能碰的底层禁忌和触犯后果。',
  主线目标与阶段剧情: '让 AI 知道全书长期目标和当前阶段要推进到哪里。',
  开局事件与关键转折: '记录前三章钩子、觉醒、背叛、地图切换等剧情节点。',
  高潮节点与结局方向: '约束大高潮、大反转和最终走向，防止后期失控。',
  核心卖点与主角线: '把作品定位、主角处境、核心爽点合并成一本书的启动说明。',
  力量资源体系: '合并能力、境界、资源和交易，用于限制 AI 临时乱加设定。',
  世界背景与禁忌: '把世界观、秩序、禁忌放在一起，作为硬背景资料。',
  主线阶段规划: '记录每卷和每个阶段的主要推进方向。',
  关键节点与结局: '记录开局、转折、高潮、结尾这些不可忘的节点。',
  核心设定: '极简记录作品定位、主角线、核心矛盾、金手指和爽点。',
  世界规则: '极简记录力量体系、世界背景、社会秩序和禁忌。',
  剧情规划: '极简记录主线目标、阶段剧情、关键转折和结局。',
  主修体系与特殊能力: '记录主角主要功法、天赋、系统能力和不可复制能力。',
  战斗技能与能力限制: '记录具体招式、战斗边界、冷却条件和使用代价。',
  武器防具: '记录常用装备、防身物和防御能力。',
  法宝与关键道具: '记录会推动剧情、开地图、解谜或引发争夺的物品。',
  通用货币与交易规则: '统一金币、灵石、信用点等价值尺度。',
  修炼与材料资源: '记录升级、炼丹、炼器、战斗消耗的资源。',
  资格与令牌: '记录秘境、宗门、机关、权力调动等进入资格。',
  唯一与稀缺资源: '记录不可复制、全书争夺、名额有限的资源。',
  能力体系: '把功法、技能、特殊能力和限制合成一个大条目。',
  装备与剧情道具: '把武器、防具、法宝、信物和关键物品合成一个大条目。',
  资源货币体系: '把钱、材料、修炼资源和交易规则合成一个大条目。',
  资格与稀缺资源: '把名额、令牌、传承和唯一资源合成一个大条目。',
  世界地图与势力范围: '记录大陆结构、国家城池、宗门位置和势力控制区。',
  交通路线与重要地点: '记录移动方式、距离、限制和常用场景。',
  秘境与禁区: '记录危险区域的进入条件、收益、规则和代价。',
  遗迹与战场: '记录历史遗留、传承线索、大规模冲突和遗留资源。',
  '污染/灾变区域': '记录特殊危险环境、污染规则和生存限制。',
  世界地图: '记录大地图、城市、宗门、交通和重要地点。',
  危险区域: '记录秘境、禁区、遗迹、战场和特殊危险环境。',
  核心秘密与世界真相: '记录后期要揭开的最大秘密和世界观反转。',
  主线线索与后期反转: '记录推进主线调查的信息和需要提前铺垫的反转。',
  身份与身世秘密: '记录角色真实身份、血脉、家族、前世和隐藏背景。',
  关系与立场转变: '记录亲缘、师徒、敌友反转、背叛和阵营变化。',
  已回收记录: '记录已经揭露和解决的线索，防止重复写或重复揭秘。',
  主线伏笔: '记录全书主线秘密、线索和反转铺垫。',
  人物伏笔: '记录角色身份、身世、关系变化和背叛转变铺垫。',
  已回收伏笔: '记录已经回收的伏笔、章节位置和效果。',
  战力与能力边界: '约束境界压制、越级限制和能力不能做到什么。',
  时间与世界硬规则: '约束时间流逝、路程耗时、底层世界规则和绝对不可违背事项。',
  一致性禁写: '防止 AI 改掉既定设定、前后矛盾或写崩人设。',
  铺垫与爽点禁写: '防止跳过铺垫、主角憋屈过久、奖励不足或反派处理不爽。',
  临时设定禁写: '防止 AI 临时乱造新规则、新势力、新能力。',
  写作规范: '记录战力、时间、能力边界和世界底层硬约束。',
  写作禁忌: '记录不能前后矛盾、不能崩人设、不能跳铺垫和不能滥加设定。',
};

const mergePlans: MergePlan[] = [
  {
    id: 'light',
    title: '轻合并',
    badge: '推荐先试',
    summary: '只合并强相关的小条目，保留 AI 生成时最需要明确区分的重点。',
    recommended: true,
    domains: [
      {
        id: 'work',
        label: '作品设定',
        icon: BookOpen,
        tone: 'bg-slate-950 text-white',
        beforeCount: 18,
        groups: [
          {
            name: '核心设定',
            before: ['作品定位', '主角初始处境', '核心爽点', '核心矛盾', '核心金手指', '主角成长方向'],
            after: ['作品定位与读者承诺', '主角开局与成长线', '核心矛盾与金手指'],
          },
          {
            name: '世界规则',
            before: ['力量规则', '境界体系', '资源规则', '世界背景', '社会秩序', '禁忌规则'],
            after: ['力量与境界规则', '资源与交易规则', '世界背景与社会秩序', '禁忌规则'],
          },
          {
            name: '剧情规划',
            before: ['主线目标', '阶段剧情', '开局事件', '关键转折', '高潮节点', '结局方向'],
            after: ['主线目标与阶段剧情', '开局事件与关键转折', '高潮节点与结局方向'],
          },
        ],
      },
      {
        id: 'item',
        label: '道具资源',
        icon: Gem,
        tone: 'bg-amber-400 text-slate-950',
        beforeCount: 16,
        groups: [
          {
            name: '功法能力',
            before: ['主修功法', '战斗技能', '特殊能力', '能力限制'],
            after: ['主修体系与特殊能力', '战斗技能与能力限制'],
          },
          {
            name: '物品装备',
            before: ['武器', '防具/护身物', '法宝/特殊装备', '关键道具'],
            after: ['武器防具', '法宝与关键道具'],
          },
          {
            name: '资源货币',
            before: ['通用货币', '修炼资源', '材料资源', '交易规则'],
            after: ['通用货币与交易规则', '修炼与材料资源'],
          },
          {
            name: '特殊资源',
            before: ['传承资格', '权限令牌', '唯一资源', '稀缺名额'],
            after: ['资格与令牌', '唯一与稀缺资源'],
          },
        ],
      },
      {
        id: 'location',
        label: '地点场景',
        icon: MapPinned,
        tone: 'bg-indigo-500 text-white',
        beforeCount: 10,
        groups: [
          {
            name: '世界地图',
            before: ['大陆结构', '国家城池', '宗门位置', '交通路线', '重要地点'],
            after: ['世界地图与势力范围', '交通路线与重要地点'],
          },
          {
            name: '危险区域',
            before: ['秘境', '禁区', '遗迹', '战场', '污染/灾变区域'],
            after: ['秘境与禁区', '遗迹与战场', '污染/灾变区域'],
          },
        ],
      },
      {
        id: 'foreshadow',
        label: '伏笔线索',
        icon: Flag,
        tone: 'bg-rose-500 text-white',
        beforeCount: 11,
        groups: [
          {
            name: '主线伏笔',
            before: ['核心秘密', '世界真相', '主线线索', '后期反转'],
            after: ['核心秘密与世界真相', '主线线索与后期反转'],
          },
          {
            name: '人物伏笔',
            before: ['身份秘密', '血脉/身世', '关系伏笔', '背叛/转变'],
            after: ['身份与身世秘密', '关系与立场转变'],
          },
          {
            name: '已回收伏笔',
            before: ['已揭露秘密', '已解决线索', '已完成回收'],
            after: ['已回收记录'],
          },
        ],
      },
      {
        id: 'rule',
        label: '书写规则',
        icon: LockKeyhole,
        tone: 'bg-zinc-700 text-white',
        beforeCount: 9,
        groups: [
          {
            name: '写作规范',
            before: ['战力规则', '时间规则', '能力边界', '世界不可违背规则'],
            after: ['战力与能力边界', '时间与世界硬规则'],
          },
          {
            name: '写作禁忌',
            before: ['不能前后矛盾', '不能写崩人设', '不能跳过铺垫', '不能破坏爽点承诺', '不能滥加设定'],
            after: ['一致性禁写', '铺垫与爽点禁写', '临时设定禁写'],
          },
        ],
      },
    ],
  },
  {
    id: 'balanced',
    title: '中合并',
    badge: '写作效率',
    summary: '每个分组保留 1 到 3 个大条目，适合先让 AI 按提示词自动细分内容。',
    domains: [
      {
        id: 'work',
        label: '作品设定',
        icon: BookOpen,
        tone: 'bg-slate-950 text-white',
        beforeCount: 18,
        groups: [
          { name: '核心设定', before: ['作品定位', '主角初始处境', '核心爽点', '核心矛盾', '核心金手指', '主角成长方向'], after: ['核心卖点与主角线', '核心矛盾与金手指'] },
          { name: '世界规则', before: ['力量规则', '境界体系', '资源规则', '世界背景', '社会秩序', '禁忌规则'], after: ['力量资源体系', '世界背景与禁忌'] },
          { name: '剧情规划', before: ['主线目标', '阶段剧情', '开局事件', '关键转折', '高潮节点', '结局方向'], after: ['主线阶段规划', '关键节点与结局'] },
        ],
      },
      {
        id: 'item',
        label: '道具资源',
        icon: Gem,
        tone: 'bg-amber-400 text-slate-950',
        beforeCount: 16,
        groups: [
          { name: '功法能力', before: ['主修功法', '战斗技能', '特殊能力', '能力限制'], after: ['能力体系'] },
          { name: '物品装备', before: ['武器', '防具/护身物', '法宝/特殊装备', '关键道具'], after: ['装备与剧情道具'] },
          { name: '资源货币', before: ['通用货币', '修炼资源', '材料资源', '交易规则'], after: ['资源货币体系'] },
          { name: '特殊资源', before: ['传承资格', '权限令牌', '唯一资源', '稀缺名额'], after: ['资格与稀缺资源'] },
        ],
      },
      {
        id: 'location',
        label: '地点场景',
        icon: MapPinned,
        tone: 'bg-indigo-500 text-white',
        beforeCount: 10,
        groups: [
          { name: '世界地图', before: ['大陆结构', '国家城池', '宗门位置', '交通路线', '重要地点'], after: ['世界地图'] },
          { name: '危险区域', before: ['秘境', '禁区', '遗迹', '战场', '污染/灾变区域'], after: ['危险区域'] },
        ],
      },
      {
        id: 'foreshadow',
        label: '伏笔线索',
        icon: Flag,
        tone: 'bg-rose-500 text-white',
        beforeCount: 11,
        groups: [
          { name: '主线伏笔', before: ['核心秘密', '世界真相', '主线线索', '后期反转'], after: ['主线伏笔'] },
          { name: '人物伏笔', before: ['身份秘密', '血脉/身世', '关系伏笔', '背叛/转变'], after: ['人物伏笔'] },
          { name: '已回收伏笔', before: ['已揭露秘密', '已解决线索', '已完成回收'], after: ['已回收伏笔'] },
        ],
      },
      {
        id: 'rule',
        label: '书写规则',
        icon: LockKeyhole,
        tone: 'bg-zinc-700 text-white',
        beforeCount: 9,
        groups: [
          { name: '写作规范', before: ['战力规则', '时间规则', '能力边界', '世界不可违背规则'], after: ['写作规范'] },
          { name: '写作禁忌', before: ['不能前后矛盾', '不能写崩人设', '不能跳过铺垫', '不能破坏爽点承诺', '不能滥加设定'], after: ['写作禁忌'] },
        ],
      },
    ],
  },
  {
    id: 'compact',
    title: '重合并',
    badge: '极简草稿',
    summary: '每个分组基本只保留一个条目，适合早期空白小说快速启动，但后期查找会变粗。',
    domains: [
      {
        id: 'work',
        label: '作品设定',
        icon: BookOpen,
        tone: 'bg-slate-950 text-white',
        beforeCount: 18,
        groups: [
          { name: '核心设定', before: ['作品定位', '主角初始处境', '核心爽点', '核心矛盾', '核心金手指', '主角成长方向'], after: ['核心设定'] },
          { name: '世界规则', before: ['力量规则', '境界体系', '资源规则', '世界背景', '社会秩序', '禁忌规则'], after: ['世界规则'] },
          { name: '剧情规划', before: ['主线目标', '阶段剧情', '开局事件', '关键转折', '高潮节点', '结局方向'], after: ['剧情规划'] },
        ],
      },
      {
        id: 'item',
        label: '道具资源',
        icon: Gem,
        tone: 'bg-amber-400 text-slate-950',
        beforeCount: 16,
        groups: [
          { name: '功法能力', before: ['主修功法', '战斗技能', '特殊能力', '能力限制'], after: ['功法能力'] },
          { name: '物品装备', before: ['武器', '防具/护身物', '法宝/特殊装备', '关键道具'], after: ['物品装备'] },
          { name: '资源货币', before: ['通用货币', '修炼资源', '材料资源', '交易规则'], after: ['资源货币'] },
          { name: '特殊资源', before: ['传承资格', '权限令牌', '唯一资源', '稀缺名额'], after: ['特殊资源'] },
        ],
      },
      {
        id: 'location',
        label: '地点场景',
        icon: MapPinned,
        tone: 'bg-indigo-500 text-white',
        beforeCount: 10,
        groups: [
          { name: '世界地图', before: ['大陆结构', '国家城池', '宗门位置', '交通路线', '重要地点'], after: ['世界地图'] },
          { name: '危险区域', before: ['秘境', '禁区', '遗迹', '战场', '污染/灾变区域'], after: ['危险区域'] },
        ],
      },
      {
        id: 'foreshadow',
        label: '伏笔线索',
        icon: Flag,
        tone: 'bg-rose-500 text-white',
        beforeCount: 11,
        groups: [
          { name: '主线伏笔', before: ['核心秘密', '世界真相', '主线线索', '后期反转'], after: ['主线伏笔'] },
          { name: '人物伏笔', before: ['身份秘密', '血脉/身世', '关系伏笔', '背叛/转变'], after: ['人物伏笔'] },
          { name: '已回收伏笔', before: ['已揭露秘密', '已解决线索', '已完成回收'], after: ['已回收伏笔'] },
        ],
      },
      {
        id: 'rule',
        label: '书写规则',
        icon: LockKeyhole,
        tone: 'bg-zinc-700 text-white',
        beforeCount: 9,
        groups: [
          { name: '写作规范', before: ['战力规则', '时间规则', '能力边界', '世界不可违背规则'], after: ['写作规范'] },
          { name: '写作禁忌', before: ['不能前后矛盾', '不能写崩人设', '不能跳过铺垫', '不能破坏爽点承诺', '不能滥加设定'], after: ['写作禁忌'] },
        ],
      },
    ],
  },
];

function countAfter(plan: MergePlan) {
  return plan.domains.reduce((sum, domain) => (
    sum + domain.groups.reduce((groupSum, group) => groupSum + group.after.length, 0)
  ), 0);
}

function countBefore(plan: MergePlan) {
  return plan.domains.reduce((sum, domain) => sum + domain.beforeCount, 0);
}

function CountPill({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-black ${active ? 'bg-[#08AACE] text-white' : 'bg-slate-100 text-slate-500'}`}>
      {children}
    </span>
  );
}

function MergeChip({ label, tone = 'plain' }: { label: string; tone?: 'plain' | 'after' }) {
  return (
    <span className={`inline-flex min-h-7 items-center rounded-lg px-2.5 py-1 text-xs font-black ${
      tone === 'after'
        ? 'bg-[#EAF9FD] text-[#078FAE] ring-1 ring-cyan-100'
        : 'bg-slate-100 text-slate-500'
    }`}>
      {label}
    </span>
  );
}

export function SettingEntryMergePlanTestPage() {
  const [activePlanId, setActivePlanId] = useState<MergePlan['id']>('light');
  const [activeDomainId, setActiveDomainId] = useState('work');
  const [activeTagSchemeId, setActiveTagSchemeId] = useState<TagScheme['id']>('four-tabs');
  const activePlan = mergePlans.find((plan) => plan.id === activePlanId) ?? mergePlans[0];
  const activeDomain = activePlan.domains.find((domain) => domain.id === activeDomainId) ?? activePlan.domains[0];
  const activeTagScheme = tagSchemeOptions.find((scheme) => scheme.id === activeTagSchemeId) ?? tagSchemeOptions[0];
  const beforeTotal = countBefore(activePlan);
  const afterTotal = countAfter(activePlan);
  const reducedTotal = beforeTotal - afterTotal;
  const activeDomainAfterCount = useMemo(() => (
    activeDomain.groups.reduce((sum, group) => sum + group.after.length, 0)
  ), [activeDomain]);
  const activeEntryPurposeRows = activeDomain.groups.flatMap((group) => (
    group.after.map((entry) => ({
      group: group.name,
      title: entry,
      purpose: entryPurposeNotes[entry] ?? '用来记录章节推进后发生变化的资料。',
    }))
  ));
  const ActiveIcon = activeDomain.icon;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F6F8FB]">
      <header className="shrink-0 border-b border-slate-100 bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-black text-[#078FAE]">
              <Merge className="h-4 w-4" />
              设定页原型
            </div>
            <h1 className="mt-1 truncate text-xl font-black text-slate-950">设定条目合并方案测试</h1>
          </div>
          <div className="grid shrink-0 grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
            {mergePlans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => {
                  setActivePlanId(plan.id);
                  setActiveDomainId('work');
                }}
                className={`min-w-[150px] rounded-xl px-4 py-2 text-sm font-black transition-colors ${
                  plan.id === activePlan.id
                    ? 'bg-[#08AACE] text-white'
                    : 'bg-white text-slate-600 hover:bg-[#EAF9FD] hover:text-[#078FAE]'
                }`}
              >
                {plan.title}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {tagSchemeOptions.map((scheme) => (
            <button
              key={scheme.id}
              type="button"
              onClick={() => setActiveTagSchemeId(scheme.id)}
              className={`min-h-[96px] rounded-2xl border p-3 text-left transition-colors ${
                scheme.id === activeTagScheme.id
                  ? 'border-[#08AACE] bg-[#EAF9FD] shadow-sm'
                  : 'border-slate-200 bg-white hover:border-[#08AACE]/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-black text-slate-950">{scheme.title}</span>
                <CountPill active={scheme.id === activeTagScheme.id || Boolean(scheme.recommended)}>{scheme.badge}</CountPill>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {scheme.tabs.map((tab) => (
                  <span key={tab} className="rounded-lg bg-white px-2 py-1 text-[11px] font-black text-slate-500 ring-1 ring-slate-100">
                    {tab}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500">
          <div className="min-w-0">
            <span className="font-black text-slate-900">标签方案：</span>
            <span>{activeTagScheme.summary}</span>
          </div>
          <div className="min-w-0">
            <span className="font-black text-slate-900">取舍：</span>
            <span>{activeTagScheme.tradeoff}</span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex min-w-0 items-center gap-2 overflow-hidden">
            <CountPill active={Boolean(activePlan.recommended)}>{activePlan.badge}</CountPill>
            <span className="truncate text-sm font-bold text-slate-500">{activePlan.summary}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-xs font-black text-slate-500">
            <CountPill>合并前 {beforeTotal}</CountPill>
            <ArrowRight className="h-4 w-4 text-slate-300" />
            <CountPill active>合并后 {afterTotal}</CountPill>
            <CountPill>减少 {reducedTotal}</CountPill>
          </div>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)_320px] gap-5 overflow-hidden p-5">
        <aside className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <Boxes className="h-4 w-4 text-[#08AACE]" />
              标签与压缩量
            </div>
            <CountPill active>{activePlan.title}</CountPill>
          </div>
          <div className="editor-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {activePlan.domains.map((domain) => {
              const Icon = domain.icon;
              const active = domain.id === activeDomain.id;
              const afterCount = domain.groups.reduce((sum, group) => sum + group.after.length, 0);
              return (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() => setActiveDomainId(domain.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    active
                      ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE] shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-[#08AACE]/50'
                  }`}
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${domain.tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black">{domain.label}</span>
                    <span className="mt-1 block text-xs font-bold text-slate-400">
                      {domain.beforeCount} {'->'} {afterCount} 条
                    </span>
                  </span>
                  {active ? <Check className="h-4 w-4 shrink-0" /> : null}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-slate-100 px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${activeDomain.tone}`}>
                <ActiveIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black text-slate-950">{activeDomain.label}</h2>
                <p className="mt-0.5 truncate text-xs font-bold text-slate-400">
                  当前只做测试预览，不写入正式设定；确认后再迁移默认条目。
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-black">
              <CountPill>合并前 {activeDomain.beforeCount}</CountPill>
              <CountPill active>合并后 {activeDomainAfterCount}</CountPill>
            </div>
          </div>

          <div className="grid h-11 shrink-0 grid-cols-[180px_minmax(0,1fr)_48px_minmax(0,1fr)] border-b border-slate-100 bg-slate-50 px-5 text-xs font-black text-slate-500">
            <div className="flex items-center">分组</div>
            <div className="flex items-center">合并前</div>
            <div className="flex items-center justify-center">变成</div>
            <div className="flex items-center text-[#078FAE]">合并后</div>
          </div>

          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
            <div className="space-y-4">
              {activeDomain.groups.map((group) => (
                <article
                  key={group.name}
                  className="grid grid-cols-[180px_minmax(0,1fr)_48px_minmax(0,1fr)] gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-slate-950">{group.name}</div>
                    <div className="mt-2 text-xs font-black text-slate-400">
                      {group.before.length} {'->'} {group.after.length}
                    </div>
                  </div>
                  <div className="flex flex-wrap content-start gap-2">
                    {group.before.map((entry) => (
                      <MergeChip key={entry} label={entry} />
                    ))}
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-slate-300" />
                  </div>
                  <div className="flex flex-wrap content-start gap-2">
                    {group.after.map((entry) => (
                      <MergeChip key={entry} label={entry} tone="after" />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <Tags className="h-4 w-4 text-[#08AACE]" />
              设定条目作用
            </div>
            <CountPill active>{activeDomain.label}</CountPill>
          </div>
          <div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            {activeEntryPurposeRows.map((row) => (
              <article key={`${row.group}-${row.title}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-black text-slate-950">{row.title}</h3>
                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-slate-400">
                    {row.group}
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold leading-5 text-slate-500">{row.purpose}</p>
              </article>
            ))}
          </div>
          <div className="shrink-0 border-t border-slate-100 bg-slate-50 p-4 text-xs font-bold leading-5 text-slate-500">
            用来记录章节推进后发生变化的资料，建议放进人物、势力、地点、道具各自的状态更新记录里。
          </div>
        </aside>
      </main>

      <footer className="grid h-14 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-slate-100 bg-white px-5 text-xs font-bold text-slate-500">
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-[#08AACE]" />
          <span className="truncate">我的建议：先试轻合并，它能减少条目数量，但仍保留 AI 生成时最容易写乱的边界。</span>
        </div>
        <div className="flex items-center gap-2">
          <Tags className="h-4 w-4 text-slate-300" />
          <span>{activeDomain.label}</span>
        </div>
      </footer>
    </div>
  );
}

export default SettingEntryMergePlanTestPage;
