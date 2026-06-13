import { BookOpen, FlaskConical, Minus, Send, Square, X } from 'lucide-react';

type SurfaceColorPlan = {
  id: string;
  title: string;
  desc: string;
  input: string;
  editorLine: string;
  titlebar: string;
  titlebarBorder: string;
  tab: string;
  tabText: string;
  panel: string;
  panelBorder: string;
  accent: string;
  verdict: string;
};

type FlowBorderPlan = {
  id: string;
  title: string;
  desc: string;
  border: string;
  divider: string;
  activeBorder: string;
  activeBg: string;
  activeText: string;
  inactiveText: string;
  shadow: string;
  lineWidth: number;
};

const surfaceColorPlans: SurfaceColorPlan[] = [
  {
    id: 'A',
    title: '方案 A：轻灰输入区 + 原浅灰标题栏',
    desc: '最接近截图。#F5F5F7 放在正文输入区很舒服，标题栏继续浅灰，整体安静但层次略弱。',
    input: '#F5F5F7',
    editorLine: '#C7D2E0',
    titlebar: '#E9EEF5',
    titlebarBorder: '#D8E0EA',
    tab: '#FFFFFF',
    tabText: '#536273',
    panel: '#FFFFFF',
    panelBorder: '#DDE6EF',
    accent: '#08AACE',
    verdict: '稳妥基准',
  },
  {
    id: 'B',
    title: '方案 B：轻灰输入区 + 玻璃浅青标题栏',
    desc: '我更推荐这个。正文仍用 #F5F5F7，标题栏轻轻带一点浅青，和当前品牌色能接上。',
    input: '#F5F5F7',
    editorLine: '#BCD7E5',
    titlebar: '#E7F8FD',
    titlebarBorder: '#BDEEF7',
    tab: '#FFFFFF',
    tabText: '#08AACE',
    panel: '#FFFFFF',
    panelBorder: '#BDEEF7',
    accent: '#08AACE',
    verdict: '推荐先试',
  },
  {
    id: 'C',
    title: '方案 C：轻灰输入区 + 冷蓝灰标题栏',
    desc: '标题栏更像桌面软件，冷静、专业，适合你觉得浅青太跳的时候。',
    input: '#F5F5F7',
    editorLine: '#BFCADC',
    titlebar: '#DDE7F2',
    titlebarBorder: '#C3D0DF',
    tab: '#F8FAFC',
    tabText: '#334155',
    panel: '#FFFFFF',
    panelBorder: '#CBD5E1',
    accent: '#386FA4',
    verdict: '专业克制',
  },
  {
    id: 'D',
    title: '方案 D：暖白输入区 + 奶油标题栏',
    desc: '不走冷灰，改成轻暖色。更像写作纸面，但会比 #F5F5F7 少一点工具感。',
    input: '#FAF7F2',
    editorLine: '#D8CCBC',
    titlebar: '#F2EDE4',
    titlebarBorder: '#DED4C5',
    tab: '#FFFDF9',
    tabText: '#6B5B48',
    panel: '#FFFCF7',
    panelBorder: '#E7DCCB',
    accent: '#B7791F',
    verdict: '偏写作纸感',
  },
  {
    id: 'E',
    title: '方案 E：高边界专业版',
    desc: '仍保留 #F5F5F7，但把标题栏、右栏和输入区边界加深，适合你觉得截图里框线不够明显。',
    input: '#F5F5F7',
    editorLine: '#AEBACC',
    titlebar: '#EEF2F7',
    titlebarBorder: '#CBD5E1',
    tab: '#FFFFFF',
    tabText: '#1F2937',
    panel: '#F8FAFC',
    panelBorder: '#CBD5E1',
    accent: '#0E7490',
    verdict: '边界最清楚',
  },
];

const flowItems = ['作品信息', '脑洞', '设定', '章纲', '正文', '审核', '点评', '润色', '状态', '梗概'];

const flowBorderPlans: FlowBorderPlan[] = [
  {
    id: '1',
    title: '方案 1：浅灰柔线',
    desc: '比现在的灰线稍微收一点，保留轻感，但分隔仍然偏弱。',
    border: '#CBD5E1',
    divider: '#E2E8F0',
    activeBorder: '#BDEEF7',
    activeBg: '#E7F8FD',
    activeText: '#08AACE',
    inactiveText: '#111827',
    shadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
    lineWidth: 1,
  },
  {
    id: '2',
    title: '方案 2：蓝灰清晰线',
    desc: '框线更贴近桌面软件，能看清按钮块，但不抢正文。',
    border: '#94A3B8',
    divider: '#CBD5E1',
    activeBorder: '#08AACE',
    activeBg: '#E7F8FD',
    activeText: '#08AACE',
    inactiveText: '#0F172A',
    shadow: '0 1px 4px rgba(15, 23, 42, 0.10)',
    lineWidth: 1,
  },
  {
    id: '3',
    title: '方案 3：深蓝灰线',
    desc: '比蓝灰更稳，顶部结构非常明确，适合你觉得浅线太虚的时候。',
    border: '#64748B',
    divider: '#94A3B8',
    activeBorder: '#0E7490',
    activeBg: '#E7F8FD',
    activeText: '#0E7490',
    inactiveText: '#020617',
    shadow: '0 2px 5px rgba(15, 23, 42, 0.12)',
    lineWidth: 1,
  },
  {
    id: '4',
    title: '方案 4：黑色细线',
    desc: '黑色线版本。边界最直接，细线能压住灰蒙感，但不会像粗黑框那么重。',
    border: '#111827',
    divider: '#111827',
    activeBorder: '#111827',
    activeBg: '#E7F8FD',
    activeText: '#020617',
    inactiveText: '#020617',
    shadow: '0 1px 2px rgba(17, 24, 39, 0.12)',
    lineWidth: 1,
  },
  {
    id: '5',
    title: '方案 5：黑色加粗线',
    desc: '更显眼的黑线方案，适合做强结构测试；如果觉得太硬，可以退回方案 4。',
    border: '#111827',
    divider: '#111827',
    activeBorder: '#111827',
    activeBg: '#F8FAFC',
    activeText: '#020617',
    inactiveText: '#020617',
    shadow: '0 2px 0 rgba(17, 24, 39, 0.14)',
    lineWidth: 2,
  },
];

function TitlebarPreview({ plan }: { plan: SurfaceColorPlan }) {
  return (
    <div
      className="grid h-11 grid-cols-[120px_minmax(0,1fr)_360px] items-center border-b px-4"
      style={{ backgroundColor: plan.titlebar, borderColor: plan.titlebarBorder }}
    >
      <div className="text-sm font-black" style={{ color: plan.tabText }}>我的小说</div>
      <div className="flex h-full min-w-0 items-end gap-2">
        <div
          className="flex h-9 min-w-[150px] items-center justify-between rounded-t-[8px] border px-4 text-sm font-black shadow-sm"
          style={{ backgroundColor: plan.tab, borderColor: plan.titlebarBorder, color: plan.tabText }}
        >
          默认小说1
          <X className="h-4 w-4 opacity-60" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-4 text-sm font-black" style={{ color: plan.tabText }}>
        <FlaskConical className="h-4 w-4" />
        <BookOpen className="h-4 w-4" />
        <span className="rounded-full bg-white/70 px-3 py-1">主题</span>
        <span className="rounded-full bg-white px-4 py-1 shadow-sm">110%</span>
        <Minus className="h-4 w-4 opacity-60" />
        <span className="h-3 w-3 rounded-sm border" style={{ borderColor: plan.tabText }} />
        <X className="h-4 w-4 opacity-50" />
      </div>
    </div>
  );
}

function FlowPreview({ plan }: { plan: SurfaceColorPlan }) {
  return (
    <div className="flex h-14 items-center gap-3 border-b bg-white px-4" style={{ borderColor: plan.panelBorder }}>
      <button className="h-9 rounded-[8px] border bg-white px-4 text-sm font-black" style={{ borderColor: plan.panelBorder, color: '#111827' }}>默认小说1</button>
      <div className="flex overflow-hidden rounded-[8px] border" style={{ borderColor: plan.panelBorder }}>
        {flowItems.map((item) => (
          <button
            key={item}
            className="h-9 border-r px-4 text-sm font-black last:border-r-0"
            style={{
              borderColor: plan.panelBorder,
              backgroundColor: item === '正文' || item === '作品信息' ? plan.titlebar : '#FFFFFF',
              color: item === '正文' || item === '作品信息' ? plan.accent : '#334155',
            }}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function FlowBorderPlanPreview({ plan }: { plan: FlowBorderPlan }) {
  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">{plan.id}</span>
            <h3 className="text-sm font-black text-slate-950">{plan.title}</h3>
          </div>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{plan.desc}</p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-500">
          {plan.border}
        </span>
      </div>

      <div className="flex h-14 items-center gap-5 rounded-[8px] bg-[#F5F5F7] px-4">
        {[
          ['脑洞', '4个脑洞'],
          ['设定', '0个设定'],
          ['章纲', '2章'],
          ['正文', '2章'],
        ].map(([title, meta]) => {
          const active = title === '正文';
          return (
            <button
              key={title}
              className="h-9 min-w-[112px] rounded-[9px] bg-white px-4 text-center text-sm font-black leading-none"
              style={{
                border: `${plan.lineWidth}px solid ${active ? plan.activeBorder : plan.border}`,
                boxShadow: active ? plan.shadow : 'none',
                backgroundColor: active ? plan.activeBg : '#FFFFFF',
                color: active ? plan.activeText : plan.inactiveText,
              }}
            >
              <span className="block">{title}</span>
              <span className="mt-0.5 block text-[11px]" style={{ color: active ? plan.activeText : '#C46A00' }}>{meta}</span>
            </button>
          );
        })}
        <div
          className="flex overflow-hidden rounded-[9px] bg-white"
          style={{
            border: `${plan.lineWidth}px solid ${plan.border}`,
            boxShadow: plan.shadow,
          }}
        >
          {[
            ['审核', '2章未审'],
            ['点评', '2章未点评'],
            ['润色', ''],
            ['状态', '2章未更新'],
            ['梗概', '0章'],
          ].map(([title, meta], index) => (
            <button
              key={title}
              className="h-9 min-w-[96px] bg-white px-4 text-center text-sm font-black leading-none"
              style={{
                borderRight: index === 4 ? '0' : `${plan.lineWidth}px solid ${plan.divider}`,
                color: plan.inactiveText,
              }}
            >
              <span className="block">{title}</span>
              {meta ? <span className="mt-0.5 block text-[11px] text-[#C46A00]">{meta}</span> : null}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function FlowBorderMatrix() {
  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-950">顶部流程按钮框线方案</h2>
          <p className="mt-1 max-w-5xl text-sm font-bold leading-6 text-slate-500">
            你截图里这些框的灰色线确实偏弱，我先单独把框线拿出来测。这里有浅灰、蓝灰、深蓝灰，也有黑色线；黑色线分成细线和加粗两档。
          </p>
        </div>
        <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">
          含黑色线
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {flowBorderPlans.map((plan) => (
          <FlowBorderPlanPreview key={plan.id} plan={plan} />
        ))}
      </div>
    </section>
  );
}

function EditorSurfacePreview({ plan }: { plan: SurfaceColorPlan }) {
  return (
    <div className="flex min-h-[520px] overflow-hidden rounded-b-[8px] border-x border-b" style={{ borderColor: plan.panelBorder }}>
      <aside className="flex w-[230px] shrink-0 flex-col border-r bg-white" style={{ borderColor: plan.panelBorder }}>
        <div className="flex h-14 items-center gap-2 border-b px-3" style={{ borderColor: plan.panelBorder }}>
          <span className="text-sm font-black text-slate-950">未发布</span>
          <span className="rounded-full px-2 py-0.5 text-xs font-black" style={{ backgroundColor: plan.titlebar, color: plan.accent }}>2</span>
          <button className="ml-auto h-8 rounded-[8px] px-3 text-xs font-black text-white" style={{ backgroundColor: plan.accent }}>展开已发布</button>
        </div>
        <div className="flex-1 p-2">
          {['第一卷', '第1章', '第2章'].map((item, index) => (
            <div
              key={item}
              className="mb-1 flex h-10 items-center justify-between rounded-[8px] px-3 text-sm font-black"
              style={{
                backgroundColor: index === 1 ? '#FFF7ED' : index === 0 ? plan.titlebar : '#FFFFFF',
                color: index === 1 ? '#111827' : '#334155',
              }}
            >
              <span>{item}</span>
              <span className="text-xs text-slate-400">{index === 0 ? '2章' : '0'}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 border-t p-2" style={{ borderColor: plan.panelBorder }}>
          {['新增卷', '倒序', '导出章节'].map((item) => (
            <button key={item} className="h-9 rounded-[8px] text-xs font-black text-white" style={{ backgroundColor: plan.accent }}>{item}</button>
          ))}
          <button className="h-9 rounded-[8px] bg-red-500 text-xs font-black text-white">回收站</button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col" style={{ backgroundColor: plan.input }}>
        <div className="flex h-14 items-center gap-2 border-b bg-white px-4" style={{ borderColor: plan.panelBorder }}>
          <button className="h-9 rounded-[8px] border px-4 text-sm font-black" style={{ borderColor: plan.panelBorder, color: '#475569' }}>第一卷</button>
          <button className="h-9 rounded-[8px] border px-4 text-sm font-black" style={{ borderColor: plan.panelBorder, color: '#475569' }}>第1章</button>
          <input className="h-9 min-w-0 flex-1 rounded-[8px] border bg-white px-3 text-sm font-black outline-none" style={{ borderColor: plan.panelBorder }} placeholder="请输入章节标题" />
          <button className="h-9 rounded-l-[8px] px-4 text-sm font-black text-white" style={{ backgroundColor: plan.accent }}>复制</button>
          <button className="h-9 rounded-r-[8px] px-4 text-sm font-black text-white" style={{ backgroundColor: plan.accent }}>优化</button>
        </div>
        <div className="flex h-14 items-center gap-2 border-b bg-white px-4" style={{ borderColor: plan.panelBorder }}>
          {['字体设置', '智能排版', '高频词', '一键替换', '复制正文', '历史'].map((item) => (
            <button key={item} className="h-9 rounded-[8px] border bg-white px-3 text-sm font-black" style={{ borderColor: plan.panelBorder, color: plan.accent }}>{item}</button>
          ))}
          <button className="ml-auto h-9 rounded-full px-5 text-sm font-black text-white" style={{ backgroundColor: plan.accent }}>查找</button>
          <button className="h-9 rounded-[8px] border border-red-200 px-4 text-sm font-black text-red-500">删除</button>
        </div>
        <div className="relative flex-1 px-14 py-10">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="mb-8 border-t border-dashed" style={{ borderColor: plan.editorLine }} />
          ))}
          <div className="absolute bottom-4 right-5 text-sm font-black text-slate-400">
            字数 <span style={{ color: plan.accent }}>0</span> · 自动保存
          </div>
        </div>
      </main>

      <aside className="flex w-[330px] shrink-0 flex-col border-l p-3" style={{ backgroundColor: plan.panel, borderColor: plan.panelBorder }}>
        <div className="grid h-13 grid-cols-2 overflow-hidden rounded-[14px] border bg-white" style={{ borderColor: plan.panelBorder }}>
          {['模型', '提示词'].map((item) => (
            <div key={item} className="relative flex flex-col justify-center border-r px-3 last:border-r-0" style={{ borderColor: plan.panelBorder }}>
              <span className="absolute -top-1 left-3 bg-white px-1 text-xs font-black" style={{ color: plan.accent }}>{item}</span>
              <span className="text-sm font-black text-slate-950">{item === '模型' ? 'GLM' : '无可用提示词'}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex-1 rounded-[18px] border bg-white p-4 text-lg font-bold text-slate-400" style={{ borderColor: plan.panelBorder }}>
          暂无对话内容...
        </div>
        <div className="mt-3 flex overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: plan.panelBorder }}>
          {['关联', '本章', '已关联资料'].map((item) => (
            <button key={item} className="h-9 flex-1 border-r text-sm font-black last:border-r-0" style={{ borderColor: plan.panelBorder, backgroundColor: item === '已关联资料' ? plan.accent : '#FFFFFF', color: item === '已关联资料' ? '#FFFFFF' : plan.accent }}>
              {item}
            </button>
          ))}
        </div>
        <div className="mt-3 flex h-12 items-center overflow-hidden rounded-[14px] border bg-white" style={{ borderColor: plan.panelBorder }}>
          <input className="min-w-0 flex-1 bg-transparent px-4 text-sm font-bold outline-none" placeholder="请输入要求" />
          <button className="grid h-full w-12 place-items-center border-l" style={{ borderColor: plan.panelBorder, color: plan.accent }}><Send className="h-5 w-5" /></button>
          <button className="grid h-full w-12 place-items-center border-l text-red-500" style={{ borderColor: plan.panelBorder }}><Square className="h-4 w-4 fill-current" /></button>
        </div>
      </aside>
    </div>
  );
}

function SurfacePlanCard({ plan }: { plan: SurfaceColorPlan }) {
  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full text-sm font-black text-white" style={{ backgroundColor: plan.accent }}>{plan.id}</span>
            <h2 className="text-base font-black text-slate-950">{plan.title}</h2>
          </div>
          <p className="mt-2 max-w-5xl text-sm font-bold leading-6 text-slate-500">{plan.desc}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
          {plan.verdict}
        </div>
      </div>
      <TitlebarPreview plan={plan} />
      <FlowPreview plan={plan} />
      <EditorSurfacePreview plan={plan} />
      <div className="mt-4 grid gap-2 text-xs font-black text-slate-500 sm:grid-cols-4">
        <span>内容输入 {plan.input}</span>
        <span>软件标题栏 {plan.titlebar}</span>
        <span>标题栏边线 {plan.titlebarBorder}</span>
        <span>强调色 {plan.accent}</span>
      </div>
    </section>
  );
}

export function WorkbenchSurfaceColorStyleTestPage() {
  return (
    <div className="editor-scrollbar h-full overflow-y-auto bg-[#F5F5F7] p-6">
      <div className="mx-auto max-w-[1680px] space-y-5">
        <header className="rounded-[8px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-950">作品编辑器输入区与标题栏配色测试</h1>
              <p className="mt-2 max-w-5xl text-sm font-bold leading-6 text-slate-500">
                我觉得内容输入 #F5F5F7 是可以的：它比纯白柔和，长时间写作没那么刺眼；但最好让软件标题栏、右侧面板边框和正文虚线稍微拉开层次，否则整屏会有一点灰蒙蒙。下面先放 5 个组合，只在测试页预览。
              </p>
            </div>
            <div className="rounded-full bg-[#E7F8FD] px-4 py-2 text-xs font-black text-[#08AACE]">
              内容输入 #F5F5F7 · 软件标题栏多方案
            </div>
          </div>
        </header>

        <FlowBorderMatrix />

        {surfaceColorPlans.map((plan) => (
          <SurfacePlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}

export default WorkbenchSurfaceColorStyleTestPage;
