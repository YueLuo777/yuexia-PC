import {
  CheckCircle2,
  DatabaseZap,
  GitBranch,
  MapPinned,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Tags,
} from 'lucide-react';
import { type ReactNode } from 'react';
import { useState } from 'react';

type ViewTab = '补充分类' | '状态流程' | 'AI确认' | '关联规则';

const viewTabs: readonly ViewTab[] = ['补充分类', '状态流程', 'AI确认', '关联规则'];

const settingDomains = [
  {
    title: '作品设定',
    badge: '全书底座',
    fields: ['基础设定', '世界观', '主角金手指/优势', '剧情规划', '书写规则'],
    note: '主要承载长期固定规则，AI 后续扫描正文时不自动覆盖。',
  },
  {
    title: '人物设定',
    badge: '角色档案',
    fields: ['基础设定', '状态设定', '未确认'],
    note: '基础设定写人设底子；状态设定记录当前处境、目标、关系、能力、资源。',
  },
  {
    title: '势力地图',
    badge: '组织与地点',
    fields: ['势力分组', '世界地图', '危险区域'],
    note: '势力分组用组织模板；世界地图和危险区域用独立地点/区域模板。',
  },
  {
    title: '怪物图鉴',
    badge: '新增建议',
    fields: ['怪物列表', '怪物形象', '怪物能力', '怪物背景', '怪物弱点', '出没位置', '掉落/资源'],
    note: '妖兽、怪兽、异兽、灵宠、邪祟等统一放这里，避免混进人物或道具。',
  },
  {
    title: '道具资源',
    badge: '物品流转',
    fields: ['功法能力', '物品装备', '资源货币', '特殊资源'],
    note: '重要道具需要状态；普通资源只记录规则和数量边界。',
  },
  {
    title: '伏笔线索',
    badge: '回收追踪',
    fields: ['主线伏笔', '人物伏笔', '已回收伏笔'],
    note: '记录铺垫章节、当前读者知道什么、是否回收和回收影响。',
  },
];

const statusFlow = [
  {
    title: '1. 正文扫描',
    icon: Sparkles,
    text: 'AI 扫描已写正文，只提取会变化的状态信息，不直接改基础设定。',
  },
  {
    title: '2. 进入未确认区',
    icon: DatabaseZap,
    text: '新状态先进入未确认区，显示更新前和更新后，方便你人工判断。',
  },
  {
    title: '3. 手动或自动确认',
    icon: CheckCircle2,
    text: '重要内容手动确认；低风险内容可开启自动确认，确认后写入状态设定。',
  },
  {
    title: '4. 关联只读状态',
    icon: GitBranch,
    text: '后续写正文时，AI 读取状态设定作为当前事实，不反向污染基础设定。',
  },
];

const aiConfirmSamples = [
  {
    title: '人物关系',
    before: '师兄与林刻只是普通同门。',
    after: '师兄在第36章主动替林刻遮掩行踪，关系可改为暂时结盟。',
  },
  {
    title: '资源状态',
    before: '黑玉令仍由林刻持有，风险未标记。',
    after: '黑玉令被码头掌柜认出，资源风险上升，需要标记为高危物件。',
  },
  {
    title: '当前目标',
    before: '下一步目标未确定。',
    after: '下一步目标建议改为寻找黑玉令上一任持有人。',
  },
];

const associationRules = [
  {
    title: '人物关联',
    icon: Tags,
    items: ['读取基础设定：外貌、核心性格、人物背景、金手指/能力', '读取状态设定：当前处境、当前目标、人物关系、能力状态、资源状态'],
  },
  {
    title: '地图关联',
    icon: MapPinned,
    items: ['世界地图读取空间结构、交通路线、势力分布', '危险区域读取进入条件、危险来源、探索进度、资源剩余'],
  },
  {
    title: '防污染规则',
    icon: ShieldCheck,
    items: ['AI 自动更新只写状态设定', '基础设定需要人工确认才改', '未确认区永远显示更新前后对照'],
  },
];

function SegmentedTabs({ activeTab, onChange }: { activeTab: ViewTab; onChange: (tab: ViewTab) => void }) {
  return (
    <div className="flex h-10 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
      {viewTabs.map((tab, index) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`min-w-[104px] px-4 text-sm font-black transition-colors ${index === 0 ? '' : 'border-l border-gray-200'} ${
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

function FramedBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="relative rounded-[22px] border-2 border-slate-950 bg-white p-4 pt-7">
      <div className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950">
        {title}
      </div>
      {children}
    </article>
  );
}

export function SettingWorkflowOptimizationTestPage() {
  const [activeTab, setActiveTab] = useState<ViewTab>('补充分类');

  return (
    <div className="flex h-full min-h-0 flex-col bg-white text-slate-950">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-black text-[#08AACE]">Setting Workflow Optimization</div>
            <h1 className="mt-1 text-xl font-black">设定流程优化建议测试</h1>
            <p className="mt-1 max-w-4xl text-sm font-medium leading-6 text-slate-500">
              单独预览之前那套整体建议：补哪些设定分类、哪些内容走状态更新、AI 扫描后怎么确认，以及后续正文如何关联读取。
            </p>
          </div>
          <SegmentedTabs activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </header>

      <main className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {activeTab === '补充分类' ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {settingDomains.map((domain) => (
              <FramedBox key={domain.title} title={domain.title}>
                <div className="mb-3 inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-800">
                  {domain.badge}
                </div>
                <div className="flex flex-wrap gap-2">
                  {domain.fields.map((field) => (
                    <span key={field} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
                      {field}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm font-bold leading-7 text-slate-500">{domain.note}</p>
              </FramedBox>
            ))}
          </section>
        ) : null}

        {activeTab === '状态流程' ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {statusFlow.map((step) => {
              const Icon = step.icon;
              return (
                <FramedBox key={step.title} title={step.title}>
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan-50 text-[#08AACE]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold leading-7 text-slate-600">{step.text}</p>
                  </div>
                </FramedBox>
              );
            })}
          </section>
        ) : null}

        {activeTab === 'AI确认' ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {aiConfirmSamples.map((sample) => (
              <FramedBox key={sample.title} title={sample.title}>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs font-black text-slate-500">{sample.title}更新前</div>
                    <p className="mt-2 text-sm font-bold leading-7 text-slate-600">{sample.before}</p>
                  </div>
                  <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3">
                    <div className="text-xs font-black text-cyan-800">{sample.title}更新后</div>
                    <p className="mt-2 text-sm font-bold leading-7 text-slate-700">{sample.after}</p>
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
              </FramedBox>
            ))}
          </section>
        ) : null}

        {activeTab === '关联规则' ? (
          <section className="grid gap-4 lg:grid-cols-3">
            {associationRules.map((rule) => {
              const Icon = rule.icon;
              return (
                <FramedBox key={rule.title} title={rule.title}>
                  <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-cyan-50 text-[#08AACE]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    {rule.items.map((item) => (
                      <div key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold leading-6 text-slate-600">
                        {item}
                      </div>
                    ))}
                  </div>
                </FramedBox>
              );
            })}
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default SettingWorkflowOptimizationTestPage;
