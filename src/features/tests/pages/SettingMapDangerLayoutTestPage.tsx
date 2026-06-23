import {
  CheckCircle2,
  Flame,
  MapPinned,
  RefreshCcw,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type LayoutTab = '固定设定' | '状态设定' | '确认';
type LayoutKind = 'world-map' | 'danger-zone';

type LayoutField = {
  title: string;
  placeholder: string;
  sample: string;
};

type LayoutPlan = {
  id: LayoutKind;
  title: string;
  titleLabel: string;
  titleValue: string;
  icon: LucideIcon;
  tone: string;
  summary: string;
  fixedDescription: string;
  stateDescription: string;
  fixedFields: LayoutField[];
  stateFields: LayoutField[];
  pendingUpdates: Array<{
    title: string;
    before: string;
    after: string;
  }>;
};

const tabs: readonly LayoutTab[] = ['固定设定', '状态设定', '确认'];

const layoutPlans: readonly LayoutPlan[] = [
  {
    id: 'world-map',
    title: '世界地图',
    titleLabel: '地图名',
    titleValue: '东玄大陆',
    icon: MapPinned,
    tone: 'border-sky-200 bg-sky-50 text-sky-950',
    summary: '世界地图负责记录地理结构、移动路线、势力范围和资源分布。它不是势力组织，所以不放组织架构、主要人物这种字段。',
    fixedDescription: '固定设定记录长期稳定的地理底图，后续 AI 扫描正文时一般不覆盖，除非你手动确认世界观有变化。',
    stateDescription: '状态设定记录章节推进后改变的地图开放度、封锁情况、主角已知范围和近期局势。',
    fixedFields: [
      {
        title: '地图概况',
        placeholder: '大陆规模、地理风貌、主要国家/宗门分布和世界层级。',
        sample: '东玄大陆由三国、五宗、两片荒域构成，修士主要沿灵脉城市活动。',
      },
      {
        title: '区域划分',
        placeholder: '国家、城池、宗门地盘、荒域、边境、海域等区域层级。',
        sample: '中州为修行中心，北境多雪原和矿脉，南荒妖兽密集。',
      },
      {
        title: '交通路线',
        placeholder: '官道、传送阵、商路、禁飞区、远行耗时和通行限制。',
        sample: '青云城到黑松岭需三日马车，宗门传送阵只对内门弟子开放。',
      },
      {
        title: '势力分布',
        placeholder: '哪些势力控制哪些地域，边界、缓冲区和争夺区在哪里。',
        sample: '玄天宗控制东部灵脉，黑市势力潜伏在边境城池。',
      },
      {
        title: '资源分布',
        placeholder: '矿脉、灵药、妖兽材料、遗迹、交易中心和稀缺产地。',
        sample: '北境产寒铁，南荒产妖丹，赤霞谷每十年开启一次灵药潮。',
      },
      {
        title: '地理规则',
        placeholder: '禁飞、灵气浓度、空间异常、天气灾害等地图底层规则。',
        sample: '越靠近南荒深处灵气越混乱，高阶飞行法器容易失控。',
      },
    ],
    stateFields: [
      {
        title: '当前局势',
        placeholder: '当前区域冲突、战争、封锁、灾变、秘境开启或势力扩张。',
        sample: '黑松岭附近出现兽潮，玄天宗和散修联盟都派人封锁入口。',
      },
      {
        title: '封锁/开放',
        placeholder: '哪些城市、路线、传送阵、危险区域当前可通行或不可通行。',
        sample: '青云城北门封闭，东门仍可出入，但需要宗门通行令。',
      },
      {
        title: '主角已知范围',
        placeholder: '主角亲自到过哪里、听说过哪里、哪些信息还只是传闻。',
        sample: '林刻只去过青云城和黑松岭外围，还不知道赤霞谷真实入口。',
      },
      {
        title: '近期变化',
        placeholder: '最近章节中地图、路线、资源点、势力边界发生了什么改变。',
        sample: '第36章后黑松岭被标记为高危，商队路线临时改走东线。',
      },
    ],
    pendingUpdates: [
      {
        title: '当前局势',
        before: '黑松岭只是普通妖兽出没地。',
        after: '黑松岭爆发兽潮，宗门暂时封锁北侧入口。',
      },
      {
        title: '主角已知范围',
        before: '林刻只知道黑松岭外围有妖狼。',
        after: '林刻发现黑松岭深处可能连接一处旧遗迹。',
      },
    ],
  },
  {
    id: 'danger-zone',
    title: '危险区域',
    titleLabel: '区域名',
    titleValue: '黑松岭禁区',
    icon: ShieldAlert,
    tone: 'border-rose-200 bg-rose-50 text-rose-950',
    summary: '危险区域负责记录秘境、禁区、遗迹、战场、污染区这类可探索风险点。它重点是进入条件、危险来源、资源收益和探索状态。',
    fixedDescription: '固定设定锁定这个危险区为什么危险、怎么进入、有什么收益和历史背景。',
    stateDescription: '状态设定只记录当前探索进度、风险变化、资源剩余和已触发事件，适合 AI 后续自动更新。',
    fixedFields: [
      {
        title: '区域概况',
        placeholder: '危险区类型、范围、环境、入口位置和外界认知。',
        sample: '黑松岭禁区位于青云城北侧，常年雾气笼罩，外围妖狼群活动频繁。',
      },
      {
        title: '危险来源',
        placeholder: '怪物、机关、污染、阵法、诅咒、空间异常或人为伏击。',
        sample: '危险主要来自黑鳞妖狼、迷雾阵和深处不稳定的旧传送裂缝。',
      },
      {
        title: '进入条件',
        placeholder: '开启时间、令牌、境界限制、路线门槛、代价和禁忌。',
        sample: '需要宗门通行令或熟悉山路的猎户带路，夜间进入死亡率极高。',
      },
      {
        title: '资源收益',
        placeholder: '灵药、矿石、妖丹、传承、情报、地图线索和可获得奖励。',
        sample: '外围可采黑松脂和妖狼牙，深处疑似有失传阵图残片。',
      },
      {
        title: '历史背景',
        placeholder: '禁区形成原因、旧战场、遗迹主人、传说和主线关联。',
        sample: '百年前玄天宗在此镇压过一名叛徒，禁区深处留下封印阵基。',
      },
      {
        title: '核心规则',
        placeholder: '危险区内不可违反的底层规则、触发机制和生存限制。',
        sample: '雾中不能点明火，火光会吸引狼群并唤醒旧阵法残响。',
      },
    ],
    stateFields: [
      {
        title: '当前状态',
        placeholder: '危险区当前开放、封锁、暴动、沉寂、崩塌或被势力占据。',
        sample: '当前处于封锁状态，外围有宗门弟子巡查。',
      },
      {
        title: '探索进度',
        placeholder: '主角探索到哪里，哪些区域已确认，哪些区域仍未知。',
        sample: '林刻只进入过外围猎道，尚未抵达雾阵核心。',
      },
      {
        title: '风险变化',
        placeholder: '怪物迁移、机关触发、封印松动、污染扩散或追兵介入。',
        sample: '兽潮后妖狼活动范围外扩，白天也可能袭击商路。',
      },
      {
        title: '资源剩余',
        placeholder: '资源是否已被取走、被谁占有、还剩什么可争夺。',
        sample: '外围黑松脂已被散修采走大半，深处阵图仍未被确认。',
      },
      {
        title: '已触发事件',
        placeholder: '机关、战斗、救援、背叛、封印破坏和关键发现。',
        sample: '第36章林刻救下猎户，获得通往旧猎道的口头地图。',
      },
      {
        title: '外部势力介入',
        placeholder: '宗门、黑市、敌对角色、怪物族群是否正在争夺该区域。',
        sample: '黑市正在收购妖狼牙，疑似想引更多散修进入禁区。',
      },
    ],
    pendingUpdates: [
      {
        title: '探索进度',
        before: '林刻尚未进入黑松岭。',
        after: '林刻已抵达黑松岭外围猎道，并确认雾阵入口方向。',
      },
      {
        title: '风险变化',
        before: '妖狼只在夜间出没。',
        after: '兽潮后妖狼白天也开始袭击商路，危险等级上升。',
      },
    ],
  },
];

function SettingSegmentedTabs({
  activeTab,
  onChange,
}: {
  activeTab: LayoutTab;
  onChange: (tab: LayoutTab) => void;
}) {
  return (
    <div className="flex h-10 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
      {tabs.map((tab, index) => (
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

function FieldCard({ field }: { field: LayoutField }) {
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

function ConfirmCard({ item }: { item: LayoutPlan['pendingUpdates'][number] }) {
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
        <button type="button" className="rounded-full bg-cyan-600 px-3 py-1 text-xs font-black text-white">
          一键确认
        </button>
      </div>
    </article>
  );
}

export function SettingMapDangerLayoutTestPage() {
  const [activePlanId, setActivePlanId] = useState<LayoutKind>('world-map');
  const [activeTab, setActiveTab] = useState<LayoutTab>('固定设定');
  const activePlan = useMemo(
    () => layoutPlans.find((plan) => plan.id === activePlanId) ?? layoutPlans[0],
    [activePlanId],
  );
  const Icon = activePlan.icon;
  const activeFields = activeTab === '固定设定' ? activePlan.fixedFields : activePlan.stateFields;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white text-slate-950">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-black text-[#08AACE]">Map & Danger Layout</div>
            <h1 className="mt-1 text-xl font-black">世界地图与危险区域布局测试</h1>
            <p className="mt-1 max-w-4xl text-sm font-medium leading-6 text-slate-500">
              参考人物设定、势力地图的三标签格局，单独测试世界地图和危险区域应该怎么放固定设定、状态设定和确认更新。
            </p>
          </div>
          <div className="flex h-10 overflow-hidden rounded-lg border border-gray-200 bg-white">
            {layoutPlans.map((plan, index) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => {
                  setActivePlanId(plan.id);
                  setActiveTab('固定设定');
                }}
                className={`min-w-[120px] px-4 text-sm font-black transition-colors ${index === 0 ? '' : 'border-l border-gray-200'} ${
                  activePlanId === plan.id
                    ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE]'
                    : 'bg-white text-slate-600 hover:bg-[#EAF9FD] hover:text-[#078FAE]'
                }`}
              >
                {plan.title}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <section className={`mb-5 rounded-xl border p-4 ${activePlan.tone}`}>
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/85">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black">{activePlan.title}</h2>
              <p className="mt-1 text-sm font-bold leading-6 opacity-80">{activePlan.summary}</p>
            </div>
          </div>
        </section>

        <section className="mb-5 border-b border-slate-200 pb-4">
          <div className="flex items-start justify-between gap-4">
            <label className="relative flex h-[48px] w-[188px] shrink-0 items-center rounded-[20px] border-2 border-slate-950 bg-white px-4 py-0">
              <span className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-sm font-medium leading-5 text-slate-500">
                {activePlan.titleLabel}
              </span>
              <input
                aria-label={activePlan.titleLabel}
                value={activePlan.titleValue}
                readOnly
                className="h-7 w-full bg-transparent text-lg font-medium leading-7 text-slate-950 outline-none"
              />
            </label>
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-1.5">
              <RefreshCcw className="h-4 w-4 text-cyan-700" />
              <span className="text-xs font-black text-cyan-800">AI 只更新状态设定</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4 overflow-x-auto pb-1">
            <SettingSegmentedTabs activeTab={activeTab} onChange={setActiveTab} />
            {activeTab === '确认' ? (
              <div className="flex shrink-0 items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-1.5">
                <span className="text-xs font-black text-cyan-800">未确认更新</span>
                <button type="button" className="rounded-full border border-cyan-200 bg-white px-2.5 py-1 text-xs font-black text-cyan-700">
                  自动确认 关
                </button>
                <button type="button" className="rounded-full bg-cyan-600 px-2.5 py-1 text-xs font-black text-white">
                  一键确认
                </button>
              </div>
            ) : (
              <p className="shrink-0 text-xs font-black text-slate-400">
                {activeTab}共 0 字
              </p>
            )}
          </div>
        </section>

        {activeTab === '确认' ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {activePlan.pendingUpdates.map((item) => (
              <ConfirmCard key={item.title} item={item} />
            ))}
          </section>
        ) : (
          <section className="grid gap-4 lg:grid-cols-2">
            {activeFields.map((field) => (
              <FieldCard key={field.title} field={field} />
            ))}
          </section>
        )}

        <section className="mt-5 grid gap-3 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#08AACE]" />
              <h3 className="font-black">固定设定边界</h3>
            </div>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-500">{activePlan.fixedDescription}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-[#08AACE]" />
              <h3 className="font-black">状态设定边界</h3>
            </div>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-500">{activePlan.stateDescription}</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SettingMapDangerLayoutTestPage;
