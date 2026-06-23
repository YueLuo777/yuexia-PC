import {
  BookOpen,
  Boxes,
  CheckCircle2,
  Flag,
  Gem,
  GitBranch,
  Landmark,
  Layers3,
  RefreshCcw,
  Shield,
  Sparkles,
  Swords,
  Tags,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type PlanId = 'compact' | 'balanced' | 'stateful';

type PlanOption = {
  id: PlanId;
  title: string;
  badge: string;
  summary: string;
  tradeoff: string;
};

type SettingBlock = {
  title: string;
  mode: '固定档案' | '状态设定' | '回收记录';
  fields: string[];
  purpose: string;
};

type DomainPlan = {
  id: string;
  title: string;
  icon: LucideIcon;
  tone: string;
  recommendation: string;
  plans: Record<PlanId, SettingBlock[]>;
};

const planOptions: PlanOption[] = [
  {
    id: 'compact',
    title: '轻量合并版',
    badge: '最省事',
    summary: '每个分组只保留少量大条目，适合早期设定和 AI 自动导入。',
    tradeoff: '查找快、维护少，但后期想按章节追踪变化时，需要在正文里自己写小标题。',
  },
  {
    id: 'balanced',
    title: '固定 + 状态版',
    badge: '推荐',
    summary: '像人物设定一样，每类资料都分成固定档案和状态设定。',
    tradeoff: '既能保留长期不变的基础设定，又能按章节更新变化，是最适合长篇小说的结构。',
  },
  {
    id: 'stateful',
    title: '强追踪版',
    badge: '后期长篇',
    summary: '把势力、道具、伏笔都拆出当前状态、关联章节、变化记录。',
    tradeoff: '最清楚，但条目变多，适合写到中后期、资料开始复杂时再启用。',
  },
];

const domainPlans: DomainPlan[] = [
  {
    id: 'goldfinger',
    title: '主角金手指/优势',
    icon: Sparkles,
    tone: 'border-cyan-200 bg-cyan-50 text-cyan-900',
    recommendation: '建议把它从单个普通预览，扩展成一个多框设定：基础规则固定，当前解锁状态随章节刷新。',
    plans: {
      compact: [
        {
          title: '金手指总览',
          mode: '固定档案',
          fields: ['能力来源', '核心功能', '爽点机制', '使用限制'],
          purpose: '让 AI 明确主角外挂是什么、为什么爽、不能乱用到什么程度。',
        },
      ],
      balanced: [
        {
          title: '金手指基础设定',
          mode: '固定档案',
          fields: ['能力来源', '核心功能', '升级方式', '使用限制', '隐藏真相'],
          purpose: '记录长期不变的外挂规则，防止 AI 临时改外挂。',
        },
        {
          title: '金手指当前状态',
          mode: '状态设定',
          fields: ['当前等级', '已解锁能力', '冷却/代价', '本阶段用途', '最近一次变化章节'],
          purpose: '记录写到当前章节时，主角已经能用什么，还不能用什么。',
        },
      ],
      stateful: [
        {
          title: '金手指基础设定',
          mode: '固定档案',
          fields: ['能力来源', '底层规则', '核心功能', '成长路线', '终局真相'],
          purpose: '作为全书金手指底层设定，长期锁定。',
        },
        {
          title: '金手指状态设定',
          mode: '状态设定',
          fields: ['当前等级', '已解锁模块', '未解锁模块', '使用次数/冷却', '副作用/风险'],
          purpose: '每次升级、觉醒、暴露、封印、受损后更新。',
        },
        {
          title: '金手指剧情绑定',
          mode: '状态设定',
          fields: ['关联伏笔', '关联敌人', '本卷作用', '下一次升级条件'],
          purpose: '把外挂和剧情推进绑住，避免外挂只当万能工具。',
        },
      ],
    },
  },
  {
    id: 'faction',
    title: '势力分组',
    icon: Landmark,
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    recommendation: '这套只适用于正派势力、反派势力、中立势力、其他势力；世界地图和危险区域不要套组织模板。',
    plans: {
      compact: [
        {
          title: '势力档案',
          mode: '固定档案',
          fields: ['势力定位', '首领/核心成员', '地盘资源', '与主角关系'],
          purpose: '记录这个势力是谁、站哪边、有什么资源。',
        },
      ],
      balanced: [
        {
          title: '势力基础档案',
          mode: '固定档案',
          fields: ['势力类型', '核心目标', '组织结构', '主要成员', '资源地盘'],
          purpose: '记录长期不变的势力底子。',
        },
        {
          title: '势力当前状态',
          mode: '状态设定',
          fields: ['当前立场', '当前战力/损失', '当前地盘', '与主角关系', '最近事件章节'],
          purpose: '记录势力在当前章节后的变化，适合写战争、联盟、背叛、吞并。',
        },
      ],
      stateful: [
        {
          title: '势力基础档案',
          mode: '固定档案',
          fields: ['势力起源', '组织层级', '核心人物', '资源体系', '长期目标'],
          purpose: '作为势力百科，不随普通章节频繁改动。',
        },
        {
          title: '势力状态设定',
          mode: '状态设定',
          fields: ['当前掌权者', '当前盟友/敌人', '当前损失', '当前地盘变化', '当前秘密'],
          purpose: '每次大战、谈判、叛变、地图切换后刷新。',
        },
        {
          title: '势力关系网',
          mode: '状态设定',
          fields: ['敌对势力', '合作势力', '潜在背叛者', '主角可利用点'],
          purpose: '让 AI 写势力冲突时不乱改阵营关系。',
        },
      ],
    },
  },
  {
    id: 'world-map',
    title: '世界地图',
    icon: Layers3,
    tone: 'border-sky-200 bg-sky-50 text-sky-950',
    recommendation: '世界地图记录的是空间结构，不是组织档案。重点放在地图概况、区域划分、交通路线、势力分布、资源分布和当前局势。',
    plans: {
      compact: [
        {
          title: '世界地图总览',
          mode: '固定档案',
          fields: ['地图概况', '区域划分', '交通路线', '势力分布', '资源分布', '当前局势'],
          purpose: '早期只保留一张大地图说明，让 AI 知道世界由哪些区域构成、主要路线和势力范围在哪里。',
        },
      ],
      balanced: [
        {
          title: '世界地图基础信息',
          mode: '固定档案',
          fields: ['地图概况', '区域划分', '交通路线', '势力分布', '资源分布'],
          purpose: '记录长期稳定的地理结构、地名层级、通行方式、势力范围和重要资源点。',
        },
        {
          title: '世界地图当前局势',
          mode: '状态设定',
          fields: ['当前局势', '封锁/开放', '主角已知范围', '近期变化', '最近影响章节'],
          purpose: '记录章节推进后哪些路线开放、哪些区域封锁、势力边界是否变化，以及主角实际知道多少。',
        },
      ],
      stateful: [
        {
          title: '世界地图基础信息',
          mode: '固定档案',
          fields: ['地图概况', '区域划分', '交通路线', '势力分布', '资源分布', '地理规则'],
          purpose: '作为全书地理底图，不随普通章节频繁改动。',
        },
        {
          title: '世界地图状态设定',
          mode: '状态设定',
          fields: ['当前局势', '通行状态', '战争/灾变范围', '主角探索范围', '资源占有变化'],
          purpose: '大战、迁徙、封城、灾变、秘境开启、主角远行后刷新。',
        },
        {
          title: '地图关联记录',
          mode: '状态设定',
          fields: ['关联势力', '关联危险区域', '关联资源', '关联伏笔'],
          purpose: '把地理位置和势力、资源、危险区、伏笔串起来，方便后续 AI 调用。',
        },
      ],
    },
  },
  {
    id: 'danger-zone',
    title: '危险区域',
    icon: Shield,
    tone: 'border-rose-200 bg-rose-50 text-rose-950',
    recommendation: '危险区域记录的是可探索风险点，重点放在区域概况、危险来源、进入条件、资源收益、历史背景和当前状态。',
    plans: {
      compact: [
        {
          title: '危险区域总览',
          mode: '固定档案',
          fields: ['区域概况', '危险来源', '进入条件', '资源收益', '历史背景', '当前状态'],
          purpose: '早期只保留核心危险、进入门槛和收益，避免把秘境、禁区、遗迹拆得过细。',
        },
      ],
      balanced: [
        {
          title: '危险区域基础信息',
          mode: '固定档案',
          fields: ['区域概况', '危险来源', '进入条件', '资源收益', '历史背景'],
          purpose: '记录危险区为什么存在、怎么进去、危险来自哪里、有什么收益和过去发生过什么。',
        },
        {
          title: '危险区域当前状态',
          mode: '状态设定',
          fields: ['当前状态', '探索进度', '风险变化', '已触发事件', '最近影响章节'],
          purpose: '记录主角进入后已经探索到哪里、危险是否升级、机关是否触发、资源是否被取走。',
        },
      ],
      stateful: [
        {
          title: '危险区域基础信息',
          mode: '固定档案',
          fields: ['区域概况', '危险来源', '进入条件', '资源收益', '历史背景', '核心规则'],
          purpose: '作为危险区底层设定，锁定禁区规则、秘境边界和历史真相。',
        },
        {
          title: '危险区域状态设定',
          mode: '状态设定',
          fields: ['当前状态', '探索进度', '怪物/机关变化', '资源剩余', '外部势力介入'],
          purpose: '每次探索、撤离、封印破坏、资源收取、怪物迁移后刷新。',
        },
        {
          title: '危险区域后续钩子',
          mode: '状态设定',
          fields: ['未探索区域', '未触发危险', '隐藏奖励', '关联伏笔'],
          purpose: '保留下次进入时可以继续使用的悬念和风险，不让危险区写完就消失。',
        },
      ],
    },
  },
  {
    id: 'item',
    title: '道具资源',
    icon: Gem,
    tone: 'border-amber-200 bg-amber-50 text-amber-950',
    recommendation: '道具资源建议不要每个小物品都做状态，只有主角持有、会推动剧情、会改变归属的道具才需要状态设定。',
    plans: {
      compact: [
        {
          title: '资源道具总表',
          mode: '固定档案',
          fields: ['功法能力', '物品装备', '资源货币', '特殊资源'],
          purpose: '把规则和重要物品集中记录，适合早期。',
        },
      ],
      balanced: [
        {
          title: '道具资源基础设定',
          mode: '固定档案',
          fields: ['功能规则', '等级/品质', '来源获取', '限制代价'],
          purpose: '记录物品和资源的底层规则。',
        },
        {
          title: '重要道具当前状态',
          mode: '状态设定',
          fields: ['当前持有人', '当前完整度', '当前能力', '消耗/冷却', '最近使用章节'],
          purpose: '记录关键道具、法宝、令牌、传承资格的当前情况。',
        },
      ],
      stateful: [
        {
          title: '能力与装备档案',
          mode: '固定档案',
          fields: ['能力体系', '装备等级', '资源价值', '唯一资源规则'],
          purpose: '统一功法、装备、货币、特殊资源的规则。',
        },
        {
          title: '持有与消耗状态',
          mode: '状态设定',
          fields: ['持有人', '剩余数量', '损坏/封印', '使用记录', '争夺方'],
          purpose: '适合写资源争夺、装备升级、法宝损坏和资格转移。',
        },
        {
          title: '资源流动记录',
          mode: '状态设定',
          fields: ['获得章节', '消耗章节', '交易对象', '价值变化'],
          purpose: '避免主角资源凭空增加或重复使用。',
        },
      ],
    },
  },
  {
    id: 'foreshadow',
    title: '伏笔线索',
    icon: GitBranch,
    tone: 'border-violet-200 bg-violet-50 text-violet-950',
    recommendation: '伏笔天然需要状态。建议固定记录“伏笔内容”，状态记录“铺垫到哪、是否回收、在哪章回收”。',
    plans: {
      compact: [
        {
          title: '伏笔总表',
          mode: '回收记录',
          fields: ['伏笔内容', '铺垫章节', '回收章节', '当前状态'],
          purpose: '一张表记录主线伏笔、人物伏笔和已回收伏笔。',
        },
      ],
      balanced: [
        {
          title: '伏笔基础设定',
          mode: '固定档案',
          fields: ['伏笔真相', '涉及人物/势力', '前期表现', '最终用途'],
          purpose: '记录这个伏笔真正是什么，不随读者视角改变。',
        },
        {
          title: '伏笔回收状态',
          mode: '状态设定',
          fields: ['已铺垫章节', '当前读者知道什么', '是否回收', '回收章节', '后续影响'],
          purpose: '记录读者视角和作者真相的差异，防止提前泄露或忘记回收。',
        },
      ],
      stateful: [
        {
          title: '主线伏笔档案',
          mode: '固定档案',
          fields: ['核心秘密', '世界真相', '后期反转', '最终回收方式'],
          purpose: '锁住全书最重要的秘密。',
        },
        {
          title: '人物伏笔档案',
          mode: '固定档案',
          fields: ['身份秘密', '身世血脉', '关系反转', '背叛转变'],
          purpose: '锁住人物线里的长线秘密。',
        },
        {
          title: '伏笔状态追踪',
          mode: '状态设定',
          fields: ['铺垫章节', '加强章节', '误导信息', '回收章节', '是否完成'],
          purpose: '按章节追踪伏笔生命周期。',
        },
      ],
    },
  },
  {
    id: 'rules',
    title: '书写规则',
    icon: Shield,
    tone: 'border-rose-200 bg-rose-50 text-rose-950',
    recommendation: '书写规则通常不需要章节状态，但可以增加“本卷特别禁写”作为临时约束。',
    plans: {
      compact: [
        {
          title: '写作红线',
          mode: '固定档案',
          fields: ['写作规范', '写作禁忌', '爽点承诺'],
          purpose: '给 AI 的全局约束，不随章节频繁变。',
        },
      ],
      balanced: [
        {
          title: '写作规范',
          mode: '固定档案',
          fields: ['战力边界', '时间规则', '能力边界', '世界不可违背规则'],
          purpose: '约束逻辑一致性。',
        },
        {
          title: '写作禁忌',
          mode: '固定档案',
          fields: ['不能前后矛盾', '不能写崩人设', '不能跳过铺垫', '不能滥加设定'],
          purpose: '约束 AI 的写作行为。',
        },
        {
          title: '本卷临时规则',
          mode: '状态设定',
          fields: ['本卷不能提前揭露', '本卷不能杀死角色', '本卷必须保留爽点'],
          purpose: '临时约束当前卷，避免 AI 提前写爆后期内容。',
        },
      ],
      stateful: [
        {
          title: '全书写作规范',
          mode: '固定档案',
          fields: ['战力', '时间', '能力', '世界底层规则'],
          purpose: '全书不可违背。',
        },
        {
          title: '全书写作禁忌',
          mode: '固定档案',
          fields: ['人设', '铺垫', '爽点', '临时设定'],
          purpose: '全书 AI 禁区。',
        },
        {
          title: '当前阶段写作限制',
          mode: '状态设定',
          fields: ['当前卷禁写', '当前敌人处理尺度', '当前奖励节奏', '当前保密信息'],
          purpose: '随卷或阶段更新，防止 AI 写过头。',
        },
      ],
    },
  },
];

const recommendedStructure = [
  {
    tab: '作品设定',
    groups: [
      ['核心设定', '基础设定、世界观、主角金手指/优势'],
      ['剧情规划', '剧情蓝图、爽点设计、分卷剧情'],
      ['书写规则', '写作规范、写作禁忌、本卷临时规则'],
    ],
  },
  {
    tab: '势力地图',
    groups: [
      ['正派势力 / 反派势力 / 中立势力 / 其他势力', '势力分组模板：基本信息、势力特点、组织架构、主要人物 + 当前状态'],
      ['世界地图', '地图模板：地图概况、区域划分、交通路线、势力分布、资源分布 + 当前局势'],
      ['危险区域', '危险区模板：区域概况、危险来源、进入条件、资源收益、历史背景 + 当前状态'],
    ],
  },
  {
    tab: '道具资源',
    groups: [
      ['功法能力 / 物品装备', '基础规则 + 当前持有/使用状态'],
      ['资源货币 / 特殊资源', '价值规则 + 数量/归属/争夺状态'],
    ],
  },
  {
    tab: '伏笔线索',
    groups: [
      ['主线伏笔 / 人物伏笔', '伏笔基础设定 + 伏笔回收状态'],
      ['已回收伏笔', '已回收记录'],
    ],
  },
];

const modeStyle: Record<SettingBlock['mode'], string> = {
  固定档案: 'border-slate-200 bg-white text-slate-700',
  状态设定: 'border-cyan-200 bg-cyan-50 text-cyan-800',
  回收记录: 'border-violet-200 bg-violet-50 text-violet-800',
};

const goldfingerLongTextFieldNames = new Set([
  '能力来源',
  '核心功能',
  '升级方式',
  '底层规则',
  '成长路线',
  '已解锁能力',
  '已解锁模块',
  '未解锁模块',
  '本阶段用途',
  '关联伏笔',
  '本卷作用',
]);

function splitGoldfingerFields(fields: string[]) {
  const primary = fields.filter((field) => goldfingerLongTextFieldNames.has(field));
  const secondary = fields.filter((field) => !goldfingerLongTextFieldNames.has(field));
  if (primary.length === 0) return { primary: fields.slice(0, 2), secondary: fields.slice(2) };
  return { primary, secondary };
}

export function SettingStateStructurePlanTestPage() {
  const [activePlan, setActivePlan] = useState<PlanId>('balanced');
  const activeOption = useMemo(() => planOptions.find((item) => item.id === activePlan) ?? planOptions[1], [activePlan]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 text-slate-950">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-black text-[#08AACE]">Setting State Structure</div>
            <h1 className="mt-1 text-xl font-black">设定状态结构方案测试</h1>
            <p className="mt-1 max-w-4xl text-sm font-medium leading-6 text-slate-500">
              比较主角金手指、势力、道具资源、伏笔线索在“固定档案”和“状态设定”之间怎么拆。这个页面只做方案预览，不写入正式设定。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {planOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setActivePlan(option.id)}
                className={`h-10 rounded-lg border px-3 text-sm font-black transition-colors ${
                  activePlan === option.id
                    ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#08AACE]/50'
                }`}
              >
                {option.title}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
        <section className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#08AACE]" />
              <h2 className="text-base font-black">当前选择：{activeOption.title}</h2>
              <span className="rounded-full bg-[#EAF9FD] px-2 py-0.5 text-xs font-black text-[#078FAE]">{activeOption.badge}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{activeOption.summary}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{activeOption.tradeoff}</p>
          </div>

          <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
            <div className="flex items-center gap-2">
              <RefreshCcw className="h-5 w-5 text-[#08AACE]" />
              <h2 className="text-base font-black text-slate-950">我建议迁入正式页的方向</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              用“固定档案 + 状态设定”作为默认思路。金手指、势力、重要道具、伏笔都适合记录当前章节状态；书写规则主要固定，只额外加本卷临时规则。
            </p>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          {domainPlans.map((domain) => {
            const Icon = domain.icon;
            const blocks = domain.plans[activePlan];
            return (
              <article key={domain.id} className={`rounded-lg border p-4 ${domain.tone}`}>
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/80">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black">{domain.title}</h3>
                    <p className="mt-1 text-sm font-medium leading-6 opacity-80">{domain.recommendation}</p>
                  </div>
                </div>

                 <div className="mt-4 grid gap-3">
                   {blocks.map((block) => (
                     <div key={block.title} className="rounded-lg border border-white/70 bg-white/85 p-3 text-slate-800 shadow-sm">
                       <div className="flex flex-wrap items-center gap-2">
                         <span className={`rounded-full border px-2 py-0.5 text-xs font-black ${modeStyle[block.mode]}`}>{block.mode}</span>
                         <h4 className="text-sm font-black">{block.title}</h4>
                       </div>
                       <p className="mt-2 text-xs font-medium leading-5 text-slate-500">{block.purpose}</p>
                       {domain.id === 'goldfinger' ? (
                         <div className="goldfinger-advantage-layout mt-3 grid gap-2 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
                           <div className="goldfinger-advantage-primary-fields grid gap-2 sm:grid-cols-2">
                             {splitGoldfingerFields(block.fields).primary.map((field) => (
                               <div key={field} className="min-h-[72px] rounded-lg border border-cyan-100 bg-cyan-50/70 p-3">
                                 <div className="text-xs font-black text-cyan-900">{field}</div>
                                 <div className="mt-1 text-[11px] font-medium leading-5 text-cyan-700">
                                   适合写成 1-3 句说明，保留来源、机制、边界和阶段作用。
                                 </div>
                               </div>
                             ))}
                           </div>
                           <div className="goldfinger-advantage-secondary-fields grid gap-2">
                             {splitGoldfingerFields(block.fields).secondary.map((field) => (
                               <div key={field} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                                 {field}
                               </div>
                             ))}
                           </div>
                         </div>
                       ) : (
                         <div className="mt-3 flex flex-wrap gap-1.5">
                           {block.fields.map((field) => (
                             <span key={field} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{field}</span>
                           ))}
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               </article>
            );
          })}
        </section>

        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <Layers3 className="h-5 w-5 text-[#08AACE]" />
            <h2 className="text-base font-black">推荐落地结构</h2>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
            {recommendedStructure.map((item) => (
              <div key={item.tab} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="mb-3 flex items-center gap-2">
                  <Tags className="h-4 w-4 text-[#08AACE]" />
                  <h3 className="font-black">{item.tab}</h3>
                </div>
                <div className="space-y-2">
                  {item.groups.map(([group, entries]) => (
                    <div key={group} className="rounded-md bg-white p-2">
                      <div className="text-xs font-black text-slate-900">{group}</div>
                      <div className="mt-1 text-xs font-medium leading-5 text-slate-500">{entries}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 grid gap-3 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-[#08AACE]" />
              <h2 className="font-black">势力状态什么时候更新</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">大战、结盟、背叛、换首领、换地盘、资源损失、主角关系改变时更新。</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-[#08AACE]" />
              <h2 className="font-black">道具资源什么时候更新</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">获得、消耗、损坏、升级、换持有人、暴露给敌人、引发争夺时更新。</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-[#08AACE]" />
              <h2 className="font-black">伏笔状态什么时候更新</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">首次铺垫、再次强化、误导读者、部分揭露、完全回收、回收后产生影响时更新。</p>
          </div>
        </section>

        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#08AACE]" />
            <h2 className="text-base font-black">具体作用说明</h2>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {[
              ['金手指基础设定', '锁定外挂来源、能力边界、升级路线和隐藏真相。'],
              ['金手指当前状态', '记录当前章节已解锁能力、冷却代价和下一次升级条件。'],
              ['势力基础档案', '记录势力的组织结构、核心人物、资源地盘和长期目标。'],
              ['势力当前状态', '记录势力在当前章节后的立场、损失、地盘和敌友关系。'],
              ['重要道具当前状态', '记录关键物品的持有人、完整度、能力、消耗和最近使用章节。'],
              ['伏笔回收状态', '记录铺垫章节、读者已知信息、是否回收、回收章节和后续影响。'],
              ['本卷临时规则', '记录当前卷不能提前揭露、不能杀死、不能破坏的临时限制。'],
              ['资源流动记录', '记录获得、消耗、交易和价值变化，防止资源凭空出现。'],
              ['势力关系网', '记录合作、敌对、背叛和主角可利用点，防止阵营混乱。'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="text-sm font-black text-slate-900">{title}</div>
                <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default SettingStateStructurePlanTestPage;
