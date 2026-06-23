import {
  Boxes,
  Coins,
  Gem,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type ItemLayoutTab = '固定设定' | '状态设定' | '确认';
type ItemCategoryId = 'ability' | 'equipment' | 'currency' | 'special';

type ItemField = {
  title: string;
  placeholder: string;
  sample: string;
};

type PendingUpdate = {
  title: string;
  before: string;
  after: string;
};

type ItemCategoryPlan = {
  id: ItemCategoryId;
  groupTitle: string;
  settingName: string;
  settingLabel: string;
  icon: LucideIcon;
  needsStatus?: '需要状态设定' | '通常不需要状态设定';
  reason: string;
  fixedDescription: string;
  stateDescription?: string;
  statusGuidelines?: string[];
  fixedFields: ItemField[];
  stateFields?: ItemField[];
  pendingUpdates?: PendingUpdate[];
};

const itemTabs: readonly ItemLayoutTab[] = ['固定设定', '状态设定', '确认'];

const itemCategoryPlans: readonly ItemCategoryPlan[] = [
  {
    id: 'ability',
    groupTitle: '功法能力',
    settingName: '玄雷步',
    settingLabel: '设定名',
    icon: Sparkles,
    needsStatus: '需要状态设定',
    reason: '功法和能力会随着章节推进出现熟练度、突破、受损、封印、冷却和暴露程度变化。',
    fixedDescription: '固定设定记录功法/能力的来源、规则、上限和代价，除非设定被你手动改写，否则 AI 不应覆盖。',
    stateDescription: '状态设定记录当前掌握程度、可用状态、限制变化和最近使用结果，适合 AI 扫描正文后更新。',
    statusGuidelines: ['掌握进度发生变化', '能力被封印、受损或临时强化', '使用后产生冷却、代价或暴露风险', '敌人识破能力来源或弱点'],
    fixedFields: [
      { title: '基本信息', placeholder: '能力名称、类型、等级、首次登场章节。', sample: '身法类功法，初次出现在第12章。' },
      { title: '能力规则', placeholder: '能力来源、核心效果、触发条件、成长边界。', sample: '以雷属性灵力刺激经脉，可短距离爆发移动。' },
      { title: '使用限制', placeholder: '冷却、代价、条件、风险，以及不能做到什么。', sample: '连续使用会麻痹右腿，雨天效果增强但更难控制。' },
      { title: '关联伏笔', placeholder: '隐藏能力、后续解锁、与身世/地图/主线秘密的关联。', sample: '完整版本可能来自主角母族遗留的雷纹传承。' },
    ],
    stateFields: [
      { title: '掌握进度', placeholder: '当前修炼到哪一层、熟练度、突破条件。', sample: '第36章后可稳定使用三次短距闪身。' },
      { title: '可用状态', placeholder: '是否冷却、受损、封印、消耗过大或临时增强。', sample: '刚经历强行连用，右腿仍有麻痹残留。' },
      { title: '暴露程度', placeholder: '有谁见过、是否被敌人识破、是否需要隐藏。', sample: '码头掌柜已认出雷步痕迹，风险上升。' },
      { title: '最近使用', placeholder: '最近在哪章使用、结果、代价和后续影响。', sample: '第36章借玄雷步脱离包围，但留下雷痕。' },
    ],
    pendingUpdates: [
      {
        title: '掌握进度',
        before: '只能勉强完成一次短距闪身。',
        after: '第36章后可连续完成三次短距闪身，但第三次会明显失控。',
      },
      {
        title: '暴露程度',
        before: '暂无外人认出玄雷步。',
        after: '码头掌柜疑似认出雷步痕迹，需要标记为有暴露风险。',
      },
    ],
  },
  {
    id: 'equipment',
    groupTitle: '物品装备',
    settingName: '黑玉令',
    settingLabel: '设定名',
    icon: Boxes,
    needsStatus: '需要状态设定',
    reason: '重要道具会变化：持有人、所在位置、损坏/封印/激活、是否暴露、归属争夺都需要状态。',
    fixedDescription: '固定设定写物品是什么、有什么效果、来历和伏笔，保证道具底层规则稳定。',
    stateDescription: '状态设定写当前谁拿着、能不能用、是否损坏、是否被认出和最近归属变化。',
    statusGuidelines: ['持有人或存放位置改变', '道具损坏、封印、激活或暂时不可用', '被他人认出并引来追踪或争夺', '归属发生争夺、失窃、转交或夺回'],
    fixedFields: [
      { title: '基本信息', placeholder: '类型、等级、初次登场章节。', sample: '身份令牌类特殊道具，第18章首次出现。' },
      { title: '物品描述', placeholder: '外观、材质、标志性细节、识别特征。', sample: '通体黑玉，背面刻有半枚断裂云纹。' },
      { title: '效果/功能', placeholder: '主要能力、使用条件、副作用、限制和战斗/剧情用途。', sample: '可开启黑市暗门，也能验证持令者身份。' },
      { title: '来历', placeholder: '来源背景、制造者、历史、被谁发现或带入剧情。', sample: '上一任持有人失踪前留给主角。' },
      { title: '相关伏笔', placeholder: '隐藏能力、后续解锁、与人物身世/主线秘密/地图线索的关联。', sample: '令牌可能指向黑雾禁地深处的旧阵门。' },
    ],
    stateFields: [
      { title: '当前持有', placeholder: '持有人、存放位置、是否被夺走或借出。', sample: '当前由林刻贴身携带。' },
      { title: '可用状态', placeholder: '损坏、封印、激活、冷却、能否使用。', sample: '令牌可用，但边缘裂痕扩大。' },
      { title: '暴露风险', placeholder: '是否被他人认出、是否引来追踪或争夺。', sample: '码头掌柜认出令牌材质，暴露风险高。' },
      { title: '归属变化', placeholder: '最近转手、争夺、失窃、夺回和当前归属形成原因。', sample: '第36章被掌柜短暂扣留，随后由林刻夺回。' },
    ],
    pendingUpdates: [
      {
        title: '暴露风险',
        before: '令牌暂未暴露。',
        after: '码头掌柜认出黑玉令材质，建议写入高风险物品状态。',
      },
      {
        title: '当前持有',
        before: '林刻持有。',
        after: '第36章后仍由林刻持有，但曾被掌柜短暂接触。',
      },
    ],
  },
  {
    id: 'currency',
    groupTitle: '资源货币',
    settingName: '灵石体系',
    settingLabel: '设定名',
    icon: Coins,
    reason: '资源货币属于世界规则，不做状态更新；这里只记录价值体系、等级换算、获取渠道、消耗用途和流通限制。',
    fixedDescription: '固定设定记录资源货币的价值体系、等级换算、获取渠道、消耗用途和流通限制，不写主角背包、个人库存或确认更新。',
    fixedFields: [
      { title: '基本信息', placeholder: '资源名称、货币类型、主要用途、流通范围。', sample: '灵石是修行界通用资源，可交易、修炼、布阵。' },
      { title: '价值等级', placeholder: '下品、中品、上品等换算比例、购买力和价格边界。', sample: '一枚中品灵石可换一百枚下品灵石，黑市会浮动。' },
      { title: '获取渠道', placeholder: '矿脉、任务、宗门俸禄、交易、掠夺、奖励。', sample: '散修主要靠任务和黑市交易获得，宗门弟子有月俸。' },
      { title: '消耗用途', placeholder: '修炼、炼器、阵法、交通、情报、治疗等消耗场景。', sample: '传送阵、疗伤丹和阵法启动都需要消耗灵石。' },
      { title: '流通限制', placeholder: '禁区、黑市、势力管制、假币、兑换门槛。', sample: '边境城只认下品灵石，黑市交易会抽取一成手续费。' },
      { title: '关联规则', placeholder: '与势力税收、资源矿脉、物品价格、人物债务的关系。', sample: '青岚矿脉枯竭会让边境灵石价格上涨。' },
    ],
  },
  {
    id: 'special',
    groupTitle: '特殊资源',
    settingName: '传承资格',
    settingLabel: '设定名',
    icon: Gem,
    needsStatus: '需要状态设定',
    reason: '特殊资源通常有唯一性、权限、消耗、有效期、激活进度和争夺状态，章节推进后很容易变化，建议默认保留状态设定。',
    fixedDescription: '固定设定记录特殊资源为什么珍贵、如何获得、使用条件、权限边界、失效条件和主线关联。',
    stateDescription: '状态设定记录当前归属、是否可用、剩余次数、竞争对手、激活进度和最近触发情况。',
    statusGuidelines: ['归属、权限或持有资格发生改变', '资源被激活、封锁、消耗或接近失效', '出现新的竞争者、追踪者或争夺势力', '触发了主线线索、地图入口或隐藏条件'],
    fixedFields: [
      { title: '基本信息', placeholder: '资源类型、唯一性、等级、首次登场章节。', sample: '旧宗门遗留的试炼资格，名额极少。' },
      { title: '获取条件', placeholder: '身份、令牌、任务、地点、境界、代价。', sample: '需持黑玉令并通过黑雾禁地外层阵门。' },
      { title: '使用规则', placeholder: '使用次数、有效期、限制、失败代价。', sample: '每枚令牌只可开启一次试炼入口。' },
      { title: '权限边界', placeholder: '谁能使用、是否可转让、是否绑定身份或血脉。', sample: '资格会绑定持令者气息，强行转让会使入口失效。' },
      { title: '失效条件', placeholder: '过期、被夺、违约、地点关闭、次数耗尽等失效规则。', sample: '月蚀结束前未进入禁地，试炼资格自动作废。' },
      { title: '主线关联', placeholder: '与人物身世、势力争夺、地图线索或后期反转的关系。', sample: '传承可能藏着林刻母族失踪真相。' },
    ],
    stateFields: [
      { title: '当前归属', placeholder: '谁拥有资格、资格是否被抢夺、转让或冻结。', sample: '林刻暂时拥有资格，但黑市已盯上。' },
      { title: '可用状态', placeholder: '是否激活、过期、封锁、已使用或待确认。', sample: '资格尚未激活，需要进入黑雾禁地确认。' },
      { title: '剩余次数', placeholder: '还能使用几次、是否已有部分消耗或临时锁定。', sample: '入口仍可开启一次，但开启后资格立即耗尽。' },
      { title: '竞争风险', placeholder: '哪些人物或势力正在争夺、是否暴露。', sample: '码头掌柜疑似把消息卖给黑市。' },
      { title: '激活进度', placeholder: '已满足哪些条件、还缺哪些钥匙、地点或章节触发。', sample: '已获得黑玉令，还缺禁地外层阵门坐标。' },
      { title: '最近触发', placeholder: '最近章节触发了什么条件、线索或限制。', sample: '第36章黑玉令与传承资格产生感应。' },
    ],
    pendingUpdates: [
      {
        title: '可用状态',
        before: '传承资格是否可用未知。',
        after: '黑玉令产生感应后，资格状态改为待激活。',
      },
      {
        title: '竞争风险',
        before: '暂无争夺者。',
        after: '黑市获得线索，传承资格进入被争夺状态。',
      },
    ],
  },
];

function ItemSegmentedTabs({
  activeTab,
  onChange,
}: {
  activeTab: ItemLayoutTab;
  onChange: (tab: ItemLayoutTab) => void;
}) {
  return (
    <div className="flex h-10 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
      {itemTabs.map((tab, index) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`min-w-[96px] px-4 text-sm font-black transition-colors ${index === 0 ? '' : 'border-l border-gray-200'} ${
            activeTab === tab
              ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE]'
              : 'bg-white text-slate-600 hover:bg-[#EAF9FD] hover:text-[#078FAE]'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function FieldCard({ field }: { field: ItemField }) {
  return (
    <article className="relative min-h-[176px] rounded-[22px] border-2 border-slate-950 bg-white p-4 pt-7">
      <div className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950">
        {field.title} <span className="text-sm text-[#08AACE]">0 字</span>
      </div>
      <p className="text-sm font-medium leading-7 text-slate-400">{field.placeholder}</p>
      <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold leading-7 text-slate-600">{field.sample}</p>
    </article>
  );
}

function ConfirmCard({ item }: { item: PendingUpdate }) {
  return (
    <article className="relative min-h-[176px] rounded-[22px] border-2 border-slate-950 bg-white p-4 pt-8">
      <div className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950">
        {item.title}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-black text-slate-500">{item.title}更新前</div>
          <p className="mt-2 text-sm font-bold leading-7 text-slate-600">{item.before}</p>
        </div>
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3">
          <div className="text-xs font-black text-cyan-800">{item.title}更新后</div>
          <p className="mt-2 text-sm font-bold leading-7 text-slate-700">{item.after}</p>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" className="rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-black text-cyan-700">
          手动确认
        </button>
        <button type="button" className="rounded-full bg-[#08AACE] px-3 py-1 text-xs font-black text-white">
          一键确认
        </button>
      </div>
    </article>
  );
}

export function SettingItemResourceStatusLayoutTestPage() {
  const [activeCategoryId, setActiveCategoryId] = useState<ItemCategoryId>('equipment');
  const [activeTab, setActiveTab] = useState<ItemLayoutTab>('固定设定');
  const activePlan = useMemo(
    () => itemCategoryPlans.find((plan) => plan.id === activeCategoryId) ?? itemCategoryPlans[0],
    [activeCategoryId],
  );
  const hasStateTabs = activePlan.id !== 'currency';
  const activeFields = hasStateTabs && activeTab === '状态设定' ? activePlan.stateFields ?? [] : activePlan.fixedFields;

  return (
    <div className="flex h-full min-h-0 bg-white text-slate-950">
      <aside className="flex w-[340px] shrink-0 flex-col border-r border-slate-100 bg-slate-50 p-3">
        <div className="mb-3 px-2 text-sm font-black text-[#08AACE]">道具资源状态结构测试</div>
        <div className="space-y-3">
          {itemCategoryPlans.map((plan) => {
            const Icon = plan.icon;
            const selected = plan.id === activeCategoryId;
            return (
              <div key={plan.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategoryId(plan.id);
                    setActiveTab('固定设定');
                  }}
                  className={`flex h-12 w-full items-center gap-2 rounded-md border px-3 text-left text-sm font-black shadow-sm transition-colors ${
                    selected
                      ? 'border-[#BDEEF7] bg-[#EAF9FD] text-[#078FAE]'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-[#BDEEF7] hover:bg-[#EAF9FD]'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0 text-[#08AACE]" />
                  <span className="min-w-0 flex-1">{plan.groupTitle}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-400">1</span>
                </button>
                <div className={`mt-1 rounded-md px-5 py-2 text-sm font-black ${selected ? 'bg-orange-50 text-slate-800' : 'text-slate-400'}`}>
                  {plan.settingName}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      <main className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <header className="mb-6 border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-4">
              <div className="relative flex h-[58px] w-[260px] items-center rounded-[22px] border-2 border-slate-950 bg-white px-5">
                <div className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950">
                  {activePlan.settingLabel}
                </div>
                <div className="text-lg font-medium text-slate-950">{activePlan.settingName}</div>
              </div>
              {hasStateTabs ? <ItemSegmentedTabs activeTab={activeTab} onChange={setActiveTab} /> : null}
            </div>
            {hasStateTabs ? (
              <div className="max-w-xl rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-bold leading-7 text-slate-600">
                <span className="font-black text-cyan-800">{activePlan.needsStatus}：</span>
                {activePlan.reason}
              </div>
            ) : null}
          </div>
        </header>

        {!hasStateTabs || activeTab === '固定设定' ? (
          <>
            <p className="mb-5 text-sm font-bold leading-7 text-slate-500">{activePlan.fixedDescription}</p>
            <section className="grid gap-5 xl:grid-cols-2">
              {activeFields.map((field) => (
                <FieldCard key={field.title} field={field} />
              ))}
            </section>
          </>
        ) : null}

        {hasStateTabs && activeTab === '状态设定' ? (
          <>
            <p className="mb-5 text-sm font-bold leading-7 text-slate-500">{activePlan.stateDescription}</p>
            <section className="grid gap-5 xl:grid-cols-2">
              {activeFields.map((field) => (
                <FieldCard key={field.title} field={field} />
              ))}
            </section>
          </>
        ) : null}

        {hasStateTabs && activeTab === '确认' ? (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3">
              <div>
                <div className="text-sm font-black text-slate-950">未确认更新</div>
                <p className="mt-1 text-sm font-bold text-slate-500">AI 只写入状态设定，确认后才覆盖当前状态，不改固定设定。</p>
              </div>
              <button type="button" className="rounded-full bg-[#08AACE] px-4 py-2 text-sm font-black text-white">
                一键确认
              </button>
            </div>
            <section className="grid gap-5 xl:grid-cols-2">
              {(activePlan.pendingUpdates ?? []).map((item) => (
                <ConfirmCard key={item.title} item={item} />
              ))}
            </section>
          </>
        ) : null}

        {hasStateTabs ? <section className="mt-8 border-t border-slate-200 pt-5">
          <h2 className="text-base font-black text-slate-950">{activePlan.groupTitle}状态设定范围</h2>
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {(activePlan.statusGuidelines ?? []).map((item) => (
              <div key={item} className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-black leading-7 text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </section> : null}
      </main>
    </div>
  );
}

export default SettingItemResourceStatusLayoutTestPage;
