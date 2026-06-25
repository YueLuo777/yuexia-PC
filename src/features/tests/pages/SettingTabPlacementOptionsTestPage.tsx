import { FolderOpen, Plus } from 'lucide-react';
import type { ReactNode } from 'react';

const settingTabs = [
  { label: '作品设定', count: 8 },
  { label: '人物设定', count: 1 },
  { label: '势力地图', count: 38 },
  { label: '道具资源', count: 22 },
  { label: '怪物图鉴', count: 4 },
  { label: '伏笔线索', count: 9 },
];

const settingGroups = [
  { title: '核心设定', count: 3, items: ['基础设定', '世界观', '主角金手指/优势'] },
  { title: '剧情规划', count: 3, items: ['剧情蓝图', '爽点设计', '分卷剧情'] },
  { title: '书写规则', count: 2, items: ['写作规范', '写作禁忌'] },
];

const fields = [
  { title: '故事类型', desc: '题材类型、时代背景、风格方向和读者期待。' },
  { title: '核心创意', desc: '这本书最核心、最有辨识度的卖点。' },
  { title: '一句话概括', desc: '用一句话概括主角、目标、冲突和看点。' },
];

function CountBadge({ count }: { count: number }) {
  return (
    <span className="grid h-6 min-w-6 place-items-center rounded-full bg-white px-2 text-xs font-black text-slate-400">
      {count}
    </span>
  );
}

function SettingTopTab({ label, count, active = false, compact = false }: { label: string; count: number; active?: boolean; compact?: boolean }) {
  return (
    <button
      type="button"
      className={[
        'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-black transition-colors',
        compact ? 'min-w-[128px]' : 'min-w-[142px]',
        active
          ? 'border-[#9BEFFC] bg-[#EAF9FD] text-[#08AACE]'
          : 'border-slate-200 bg-white text-slate-700',
      ].join(' ')}
    >
      <span>{label}</span>
      <CountBadge count={count} />
    </button>
  );
}

function SidebarPreview({ extraTop }: { extraTop?: ReactNode }) {
  return (
    <aside className="flex min-h-0 w-[250px] shrink-0 flex-col border-r border-slate-100 bg-slate-50">
      {extraTop}
      <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-1 py-2">
        {settingGroups.map((group) => (
          <section key={group.title} className="mb-1">
            <div className="flex h-9 items-center gap-2 rounded-lg border border-[#BDEEF7] bg-[#EAF9FD] px-1 text-sm font-black text-slate-900">
              <FolderOpen className="h-4 w-4 shrink-0 text-[#08AACE]" />
              <span className="min-w-0 flex-1 truncate">{group.title}</span>
              <CountBadge count={group.count} />
            </div>
            <div className="mt-0.5 space-y-0.5">
              {group.items.map((item, index) => (
                <div
                  key={item}
                  className={[
                    'grid min-h-[34px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-1 py-1.5 text-sm font-black',
                    index === 0 && group.title === '核心设定' ? 'bg-[#fff7ed] text-slate-900' : 'bg-white text-slate-700',
                  ].join(' ')}
                >
                  <span className="truncate">{item}</span>
                  <span className="text-[11px] text-[#08AACE]">0 字</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="grid h-12 shrink-0 grid-cols-3 overflow-hidden rounded-t-3xl border border-slate-200 bg-white text-sm font-black text-slate-700">
        <button className="bg-[#EAF9FD] text-[#08AACE]">新建</button>
        <button className="border-l border-slate-200">分组</button>
        <button className="border-l border-slate-200">设定</button>
      </div>
    </aside>
  );
}

function ContentPreview({ bottomTabs = false }: { bottomTabs?: boolean }) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
      <div className="flex h-16 shrink-0 items-center border-b border-slate-100 px-6">
        <div className="relative h-12 w-[230px] rounded-[24px] border-2 border-slate-900 px-6 py-2">
          <span className="absolute -top-3 left-8 bg-white px-1 text-sm font-bold text-slate-500">设定名</span>
          <div className="text-lg text-slate-900">基础设定</div>
        </div>
      </div>
      <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="grid grid-cols-2 gap-5">
          {fields.map((field) => (
            <div key={field.title} className="relative min-h-[220px] rounded-[28px] border-2 border-slate-900 p-6">
              <span className="absolute -top-4 left-7 bg-white px-1 text-base font-black text-slate-900">{field.title} <span className="text-[#08AACE]">0 字</span></span>
              <p className="text-sm font-bold leading-7 text-slate-400">{field.desc}</p>
            </div>
          ))}
        </div>
      </div>
      {bottomTabs && (
        <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-3">
          <div className="grid grid-cols-3 gap-2">
            {settingTabs.map((tab, index) => (
              <SettingTopTab key={tab.label} {...tab} active={index === 0} compact />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function AiPanelPreview() {
  return (
    <aside className="hidden w-[280px] shrink-0 border-l border-slate-100 bg-white p-4 xl:block">
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#9BEFFC] text-sm font-black">
        <button className="h-12 bg-white text-slate-800">模型<br /><span className="text-xs">deepseek</span></button>
        <button className="h-12 border-l border-[#9BEFFC] bg-white text-slate-800">提示词<br /><span className="text-xs">大纲10</span></button>
      </div>
      <div className="mt-4 min-h-[360px] rounded-[28px] border-2 border-slate-900 p-5">
        <span className="bg-white px-1 text-base font-black text-slate-900">生成设定</span>
      </div>
      <div className="mt-3 inline-grid grid-cols-4 overflow-hidden rounded-2xl border border-slate-200 bg-white text-xs font-black">
        {['关联', '当前设定', '其他设定', '脑洞'].map((item, index) => (
          <button key={item} className={`h-9 px-3 ${index === 0 ? 'bg-[#EAF9FD] text-[#08AACE]' : 'border-l border-slate-200 text-slate-600'}`}>{item}</button>
        ))}
      </div>
    </aside>
  );
}

function OptionFrame({
  title,
  badge,
  note,
  children,
  recommended = false,
}: {
  title: string;
  badge: string;
  note: string;
  children: ReactNode;
  recommended?: boolean;
}) {
  return (
    <section className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${recommended ? 'border-[#9BEFFC]' : 'border-slate-200'}`}>
      <div className={`flex items-center justify-between border-b px-4 py-3 ${recommended ? 'border-[#C9F7FF] bg-[#EAF9FD]' : 'border-slate-100 bg-white'}`}>
        <div>
          <h2 className={`text-base font-black ${recommended ? 'text-[#066D85]' : 'text-slate-900'}`}>{title}</h2>
          <p className="mt-1 text-xs font-bold text-slate-500">{note}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${recommended ? 'bg-white text-[#08AACE]' : 'bg-slate-100 text-slate-500'}`}>{badge}</span>
      </div>
      {children}
    </section>
  );
}

export function SettingTabPlacementOptionsTestPage() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
        <div>
          <h1 className="text-lg font-black text-slate-900">设定标签布局方案测试</h1>
          <p className="mt-0.5 text-xs font-bold text-slate-400">只测试“作品设定/人物设定/势力地图”等大类标签放哪里更顺手，不改正式页面。</p>
        </div>
        <span className="rounded-full border border-[#9BEFFC] bg-[#EAF9FD] px-3 py-1 text-xs font-black text-[#08AACE]">测试页</span>
      </header>

      <main className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid min-w-[1180px] gap-5">
          <OptionFrame
            title="方案A：两行紧凑标签区"
            badge="推荐"
            recommended
            note="放在当前红框位置，最多两行：第一行常用，第二行资料类；不占用编辑区，也不挤左侧导航。"
          >
            <div className="flex h-[610px] min-h-0 flex-col overflow-hidden">
              <div className="shrink-0 border-b border-slate-100 bg-white px-4 py-3">
                <div className="grid max-w-[900px] grid-cols-3 gap-2">
                  {settingTabs.map((tab, index) => (
                    <SettingTopTab key={tab.label} {...tab} active={index === 0} compact />
                  ))}
                </div>
              </div>
              <div className="flex min-h-0 flex-1">
                <SidebarPreview />
                <ContentPreview />
                <AiPanelPreview />
              </div>
            </div>
          </OptionFrame>

          <div className="grid grid-cols-2 gap-5">
            <OptionFrame
              title="方案B：一行横向滚动"
              badge="最省高"
              note="标签仍在顶部，只占一行；适合以后标签继续增加，但需要横向滚动。"
            >
              <div className="h-[520px] overflow-hidden">
                <div className="flex gap-2 overflow-x-auto border-b border-slate-100 bg-white px-4 py-3">
                  {settingTabs.map((tab, index) => (
                    <SettingTopTab key={tab.label} {...tab} active={index === 0} />
                  ))}
                  <button className="inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-500">
                    更多 <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex h-[455px] min-h-0">
                  <SidebarPreview />
                  <ContentPreview />
                </div>
              </div>
            </OptionFrame>

            <OptionFrame
              title="方案C：左侧三行两列"
              badge="你提出的方案"
              note="标签放在导航上方，三行两列；层级清楚，但会压缩左侧设定条目可见高度。"
            >
              <div className="flex h-[520px] min-h-0 overflow-hidden">
                <SidebarPreview
                  extraTop={(
                    <div className="shrink-0 border-b border-slate-100 bg-white p-2">
                      <div className="grid grid-cols-2 gap-2">
                        {settingTabs.map((tab, index) => (
                          <button
                            key={tab.label}
                            className={`flex h-10 items-center justify-between gap-1 rounded-xl border px-2 text-xs font-black ${
                              index === 0 ? 'border-[#9BEFFC] bg-[#EAF9FD] text-[#08AACE]' : 'border-slate-200 bg-white text-slate-600'
                            }`}
                          >
                            <span className="truncate">{tab.label}</span>
                            <CountBadge count={tab.count} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                />
                <ContentPreview />
              </div>
            </OptionFrame>
          </div>

          <OptionFrame
            title="方案D：底部贴边标签"
            badge="不推荐"
            note="放在你截图下面红框位置，可和底部留白对齐，但大类切换离左侧导航太远，视线会来回跑。"
          >
            <div className="flex h-[560px] min-h-0 overflow-hidden">
              <SidebarPreview />
              <ContentPreview bottomTabs />
              <AiPanelPreview />
            </div>
          </OptionFrame>
        </div>
      </main>
    </div>
  );
}
