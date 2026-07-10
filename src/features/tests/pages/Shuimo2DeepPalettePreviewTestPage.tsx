import { Bot, BookOpen, Home, Minus, Palette, Plus, Search, Send, Settings, Trash2 } from 'lucide-react';

type Shuimo2DeepPaletteScheme = {
  id: string;
  name: string;
  summary: string;
  titlebar: string;
  appBg: string;
  sidebarBg: string;
  dashboardSidebar: string;
  panel: string;
  paper: string;
  paperAlt: string;
  groupBg: string;
  groupActive: string;
  activeTab: string;
  selectionBg: string;
  selectionBorder: string;
  inputBg: string;
  inputBorder: string;
  button: string;
  buttonHover: string;
  buttonText: string;
  sendIcon: string;
  lockButton: string;
  stepper: string;
  danger: string;
  dangerSoft: string;
  ink: string;
  muted: string;
  faint: string;
  line: string;
};

const problemColors = ['#E4E9EF', '#E7F8FD', '#08AACE', '#F4FBFC', '#DC2626'];

const shuimo2DeepPaletteSchemes: Shuimo2DeepPaletteScheme[] = [
  {
    id: 'agedScroll',
    name: '方案 A / 旧卷米墨',
    summary: '最接近当前水墨2，但把标题栏、分组和正文选中统一压进米纸、茶边、棕墨体系。',
    titlebar: '#E8D6BD',
    appBg: '#F4E9D8',
    sidebarBg: '#EBDCC3',
    dashboardSidebar: '#E4D1B3',
    panel: '#FFF8EC',
    paper: '#FFF9F0',
    paperAlt: '#F7EEDC',
    groupBg: '#EBDCC3',
    groupActive: '#F0D8B8',
    activeTab: '#EAD2AE',
    selectionBg: '#EFD7B7',
    selectionBorder: '#A98253',
    inputBg: '#FFF8EC',
    inputBorder: '#CDAF87',
    button: '#7C5732',
    buttonHover: '#654524',
    buttonText: '#FFF8EC',
    sendIcon: '#8A5A18',
    lockButton: '#EAD2AE',
    stepper: '#F4E8D5',
    danger: '#9B4739',
    dangerSoft: '#F2D9CF',
    ink: '#2D241A',
    muted: '#7C674E',
    faint: '#A88E6B',
    line: '#D5BFA0',
  },
  {
    id: 'inkStone',
    name: '方案 B / 砚灰淡墨',
    summary: '更克制，标题栏用暖灰纸色，选中态用淡砚灰，适合想减少棕色按钮占比的方向。',
    titlebar: '#DDD8CD',
    appBg: '#F1EDE4',
    sidebarBg: '#E2D8C7',
    dashboardSidebar: '#D8CCB8',
    panel: '#FFFDF7',
    paper: '#FFFDF8',
    paperAlt: '#F4F0E7',
    groupBg: '#E7E0D3',
    groupActive: '#DCD2C0',
    activeTab: '#DED5C5',
    selectionBg: '#E3D8C5',
    selectionBorder: '#8B7A63',
    inputBg: '#FFFDF7',
    inputBorder: '#BFAF95',
    button: '#5F5547',
    buttonHover: '#4D4439',
    buttonText: '#FFFDF7',
    sendIcon: '#6F5F47',
    lockButton: '#E3D8C5',
    stepper: '#F2EDE4',
    danger: '#8F463A',
    dangerSoft: '#F0DCD5',
    ink: '#29241D',
    muted: '#6F6658',
    faint: '#9B907E',
    line: '#CEC2AE',
  },
  {
    id: 'teaPaper',
    name: '方案 C / 茶纸层叠',
    summary: '层次更明显，分组、选中和工具控件都走茶褐递进，适合正文页和设定页统一。',
    titlebar: '#EAD8BC',
    appBg: '#F6EBD8',
    sidebarBg: '#E9D8BC',
    dashboardSidebar: '#E0C9A4',
    panel: '#FFF7E9',
    paper: '#FFF9EF',
    paperAlt: '#F1E3CA',
    groupBg: '#E6D1AD',
    groupActive: '#DDBE8B',
    activeTab: '#E8C99D',
    selectionBg: '#F0D0A0',
    selectionBorder: '#966832',
    inputBg: '#FFF7E9',
    inputBorder: '#C8A36F',
    button: '#80582B',
    buttonHover: '#68451F',
    buttonText: '#FFF7E9',
    sendIcon: '#9A6A2D',
    lockButton: '#E8C99D',
    stepper: '#F4E3C9',
    danger: '#A34835',
    dangerSoft: '#F1D7C9',
    ink: '#2D2116',
    muted: '#755D3E',
    faint: '#9C8664',
    line: '#D0B184',
  },
  {
    id: 'cinnabarWarm',
    name: '方案 D / 朱砂暖印',
    summary: '保留古朴米纸，少量朱砂只用于危险和强调，替代现代红与荧光青。',
    titlebar: '#E9D4C4',
    appBg: '#F5E9DD',
    sidebarBg: '#EBDACB',
    dashboardSidebar: '#DFC8B4',
    panel: '#FFF8F0',
    paper: '#FFF9F2',
    paperAlt: '#F6E7D8',
    groupBg: '#EAD7C6',
    groupActive: '#F0D8CC',
    activeTab: '#EFD4C6',
    selectionBg: '#F1D5C8',
    selectionBorder: '#A04F3F',
    inputBg: '#FFF8F0',
    inputBorder: '#D1AD9A',
    button: '#7D533C',
    buttonHover: '#65422F',
    buttonText: '#FFF8F0',
    sendIcon: '#A04F3F',
    lockButton: '#EDD6C8',
    stepper: '#F7E9DE',
    danger: '#A04F3F',
    dangerSoft: '#F3DCD4',
    ink: '#2B211C',
    muted: '#765F52',
    faint: '#9A8579',
    line: '#D8C0B1',
  },
];

function ColorPill({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex min-w-[132px] items-center gap-2 rounded-md border bg-white/50 px-2 py-1">
      <span
        className="h-5 w-5 rounded-full border"
        style={{ backgroundColor: color, borderColor: 'rgba(40, 30, 18, 0.24)' }}
      />
      <span className="truncate text-xs font-black">{label}</span>
    </div>
  );
}

function WorkbenchPreview({ scheme }: { scheme: Shuimo2DeepPaletteScheme }) {
  return (
    <div
      className="overflow-hidden rounded-lg border shadow-sm"
      style={{ borderColor: scheme.line, backgroundColor: scheme.appBg }}
    >
      <div
        className="flex h-10 items-center gap-2 border-b px-3"
        style={{ borderColor: scheme.line, backgroundColor: scheme.titlebar }}
      >
        {['首页', '大主宰', '正文', '剧情审核'].map((label, index) => (
          <div
            key={label}
            className="flex h-8 min-w-[78px] items-center justify-center rounded-md border px-3 text-sm font-black"
            style={{
              borderColor: index === 2 ? scheme.selectionBorder : scheme.line,
              backgroundColor: index === 2 ? scheme.activeTab : scheme.paperAlt,
              color: index === 2 ? scheme.button : scheme.ink,
            }}
          >
            {label}
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs font-black" style={{ color: scheme.muted }}>
          <span>主题</span>
          <span>110%</span>
        </div>
      </div>

      <div className="grid h-[480px] grid-cols-[190px_minmax(0,1fr)_280px]">
        <aside className="border-r p-2" style={{ borderColor: scheme.line, backgroundColor: scheme.sidebarBg }}>
          <div
            className="mb-2 flex h-9 items-center gap-2 rounded-md border px-2 font-black"
            style={{ borderColor: scheme.selectionBorder, backgroundColor: scheme.groupActive, color: scheme.ink }}
          >
            <BookOpen className="h-4 w-4" style={{ color: scheme.button }} />
            第一卷
            <span
              className="ml-auto rounded-full px-2 py-0.5 text-xs"
              style={{ backgroundColor: scheme.paper, color: scheme.button }}
            >
              7章
            </span>
          </div>
          {[1, 2, 3, 4, 5, 6, 7].map((chapter) => (
            <div
              key={chapter}
              className="mb-1 flex h-8 items-center rounded-md border px-2 text-sm font-black"
              style={{
                borderColor: chapter === 2 ? scheme.selectionBorder : 'transparent',
                backgroundColor: chapter === 2 ? scheme.selectionBg : scheme.groupBg,
                color: scheme.ink,
              }}
            >
              第{chapter}章
              <span className="ml-auto text-xs" style={{ color: scheme.muted }}>
                {chapter === 2 ? 4197 : 2680}
              </span>
            </div>
          ))}
        </aside>

        <main className="min-w-0 p-4" style={{ backgroundColor: scheme.paper }}>
          <div className="mb-3 flex items-center gap-2">
            <button
              className="h-8 rounded-md border px-3 text-sm font-black"
              style={{ borderColor: scheme.inputBorder, backgroundColor: scheme.lockButton, color: scheme.button }}
            >
              等宽锁定
            </button>
            <button
              className="h-8 rounded-md border px-3 text-sm font-black"
              style={{ borderColor: scheme.inputBorder, backgroundColor: scheme.paperAlt, color: scheme.muted }}
            >
              自由调节
            </button>
            <div
              className="ml-auto grid h-8 grid-cols-3 overflow-hidden rounded-md border text-sm font-black"
              style={{ borderColor: scheme.line, backgroundColor: scheme.stepper, color: scheme.ink }}
            >
              <button className="w-8">
                <Minus className="mx-auto h-3.5 w-3.5" />
              </button>
              <div
                className="grid w-10 place-items-center border-x"
                style={{ borderColor: scheme.line, backgroundColor: scheme.paper }}
              >
                14
              </div>
              <button className="w-8">
                <Plus className="mx-auto h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <section className="rounded-md border" style={{ borderColor: scheme.line, backgroundColor: scheme.paper }}>
            <div
              className="h-8 border-b px-3 py-1.5 text-sm font-black"
              style={{ borderColor: scheme.line, backgroundColor: scheme.paperAlt, color: scheme.button }}
            >
              正文页 / 选中段落
            </div>
            <div className="space-y-4 p-4 text-sm leading-7" style={{ color: scheme.ink }}>
              <p>苏凌他们望着高台上的那些西院学长，一时间气势也是弱了一些。</p>
              <p>牧尘看了一眼不远处高台上的几人，视线只是在那道纤细的倩影上停了一下。</p>
              <p
                className="border-l-4 px-4 py-2"
                style={{ borderColor: scheme.selectionBorder, backgroundColor: scheme.selectionBg }}
              >
                对于西院这些家伙的骄狂，他同样是有些不喜。
              </p>
              <p>那种感觉，犹如慵懒云层之中悄然涌动的惊蛰。</p>
            </div>
          </section>
        </main>

        <aside className="border-l p-3" style={{ borderColor: scheme.line, backgroundColor: scheme.paperAlt }}>
          <div
            className="grid grid-cols-2 overflow-hidden rounded-md border"
            style={{ borderColor: scheme.inputBorder, backgroundColor: scheme.inputBg }}
          >
            <div className="border-r px-3 py-2" style={{ borderColor: scheme.line }}>
              <div className="flex items-center justify-between text-xs font-black" style={{ color: scheme.button }}>
                模型 <Settings className="h-3.5 w-3.5" />
              </div>
              <div className="font-black" style={{ color: scheme.ink }}>
                deepseek
              </div>
            </div>
            <div className="px-3 py-2">
              <div className="flex items-center justify-between text-xs font-black" style={{ color: scheme.button }}>
                提示词 <Settings className="h-3.5 w-3.5" />
              </div>
              <div className="font-black" style={{ color: scheme.ink }}>
                无可用提示词
              </div>
            </div>
          </div>
          <div
            className="mt-3 h-[280px] rounded-lg border p-4"
            style={{ borderColor: scheme.inputBorder, backgroundColor: scheme.panel }}
          >
            <div
              className="mb-3 rounded-md border p-3 text-sm"
              style={{ borderColor: scheme.line, backgroundColor: scheme.groupBg, color: scheme.muted }}
            >
              <div className="mb-1 flex items-center gap-2 font-black" style={{ color: scheme.button }}>
                <Bot className="h-4 w-4" /> AI输出框
              </div>
              这里替代原来的 #F4FBFC，不再出现冷青色背景。
            </div>
            <p className="text-sm leading-6" style={{ color: scheme.muted }}>
              结构审核结果保持纸面感，边框和滚动区域也进入同一色系。
            </p>
          </div>
          <div
            className="mt-3 flex h-10 overflow-hidden rounded-md border"
            style={{ borderColor: scheme.inputBorder, backgroundColor: scheme.inputBg }}
          >
            <input className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" placeholder="请输入要求" />
            <button className="w-12 border-l" style={{ borderColor: scheme.line, color: scheme.sendIcon }}>
              <Send className="mx-auto h-5 w-5" />
            </button>
            <button className="w-10" style={{ backgroundColor: scheme.dangerSoft, color: scheme.danger }}>
              <Trash2 className="mx-auto h-4 w-4" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function DashboardPreview({ scheme }: { scheme: Shuimo2DeepPaletteScheme }) {
  return (
    <div
      className="overflow-hidden rounded-lg border"
      style={{ borderColor: scheme.line, backgroundColor: scheme.appBg }}
    >
      <div className="grid h-[220px] grid-cols-[150px_minmax(0,1fr)]">
        <aside className="border-r p-3" style={{ borderColor: scheme.line, backgroundColor: scheme.dashboardSidebar }}>
          <div className="mb-4 grid place-items-center">
            <div
              className="grid h-12 w-12 place-items-center rounded-full border bg-white text-xs font-black"
              style={{ borderColor: scheme.line, color: scheme.ink }}
            >
              月落
            </div>
          </div>
          {['我的小说', '我的剧本', '资料库', '测试'].map((item, index) => (
            <div
              key={item}
              className="mb-2 flex h-8 items-center gap-2 rounded-md px-2 text-sm font-black"
              style={{
                backgroundColor: index === 0 ? scheme.selectionBg : scheme.paper,
                color: index === 0 ? scheme.button : scheme.ink,
              }}
            >
              <Home className="h-3.5 w-3.5" /> {item}
            </div>
          ))}
        </aside>
        <main className="p-4">
          <div className="grid gap-3 md:grid-cols-3">
            {['作品概览', '作品整理', '最近编辑'].map((card) => (
              <section
                key={card}
                className="rounded-md border p-3"
                style={{ borderColor: scheme.inputBorder, backgroundColor: scheme.panel }}
              >
                <div className="mb-2 font-black" style={{ color: scheme.ink }}>
                  {card}
                </div>
                <div
                  className="h-8 rounded-md border px-3 py-1.5 text-sm font-black"
                  style={{ borderColor: scheme.line, backgroundColor: scheme.paper, color: scheme.muted }}
                >
                  大主宰
                </div>
              </section>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <div
              className="flex h-9 w-[230px] items-center rounded-md border px-3"
              style={{ borderColor: scheme.inputBorder, backgroundColor: scheme.inputBg, color: scheme.faint }}
            >
              <Search className="mr-2 h-4 w-4" /> 搜索小说
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SchemeCard({ scheme }: { scheme: Shuimo2DeepPaletteScheme }) {
  return (
    <section className="rounded-lg border bg-white/60 p-4" style={{ borderColor: scheme.line }}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black">{scheme.name}</h2>
          <p className="mt-1 max-w-3xl text-sm font-bold leading-6" style={{ color: scheme.muted }}>
            {scheme.summary}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5" style={{ color: scheme.ink }}>
          <ColorPill color={scheme.titlebar} label="软件标题" />
          <ColorPill color={scheme.activeTab} label="页面选中" />
          <ColorPill color={scheme.groupBg} label="分组" />
          <ColorPill color={scheme.selectionBg} label="正文选中" />
          <ColorPill color={scheme.sendIcon} label="发送图标" />
        </div>
      </div>
      <div className="space-y-4">
        <WorkbenchPreview scheme={scheme} />
        <DashboardPreview scheme={scheme} />
      </div>
    </section>
  );
}

export function Shuimo2DeepPalettePreviewTestPage() {
  return (
    <div className="h-full min-h-0 overflow-y-auto bg-[#F2E8DA] p-6 text-[#2D241A]">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-[#CDB89A] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#7C674E]">
            <Palette className="h-4 w-4" /> SHUIMO2 DEEP COLOR TEST
          </div>
          <h1 className="mt-1 text-2xl font-black">水墨2 深度配色预览</h1>
          <p className="mt-2 max-w-4xl text-sm font-bold leading-6 text-[#7C674E]">
            专门覆盖截图里的残留冷色：软件标题的 #E4E9EF、正文等页面选中的 #E7F8FD、分组的
            #E7F8FD、AI输入区、发送图标、等宽锁定、字号步进器和首页侧栏。
          </p>
        </div>
        <div className="rounded-md border border-[#CDB89A] bg-[#FFF8EC] px-3 py-2 text-sm font-black text-[#7C5732]">
          {shuimo2DeepPaletteSchemes.length} 个候选版本
        </div>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {problemColors.map((color) => (
          <ColorPill key={color} color={color} label={`待替换 ${color}`} />
        ))}
      </div>

      <main className="grid gap-5">
        {shuimo2DeepPaletteSchemes.map((scheme) => (
          <SchemeCard key={scheme.id} scheme={scheme} />
        ))}
      </main>
    </div>
  );
}
