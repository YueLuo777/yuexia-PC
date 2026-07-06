import { AlertTriangle, Bot, Check, FileText, Palette, Send, Settings, Trash2 } from 'lucide-react';

type ShuimoSemanticPalette = {
  id: string;
  name: string;
  summary: string;
  page: string;
  paper: string;
  paperAlt: string;
  ink: string;
  inkMuted: string;
  border: string;
  primaryAction: string;
  primaryActionHover: string;
  primaryText: string;
  softPanel: string;
  activePanel: string;
  danger: string;
  dangerSoft: string;
  dangerBorder: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  focusRing: string;
  reviewSelection: string;
  aiThought: string;
  topTabActive: string;
  sidebarGroup: string;
  chapterSelected: string;
  inputBorder: string;
};

const shuimoSemanticPalettes: ShuimoSemanticPalette[] = [
  {
    id: 'inkSeal',
    name: '方案 A / 墨印稳重',
    summary: '用松烟墨和朱印色替换高亮青蓝，整体识别强，适合正式迁入水墨主题。',
    page: '#F3ECDF',
    paper: '#FFFDF7',
    paperAlt: '#F9F3E8',
    ink: '#26211B',
    inkMuted: '#746753',
    border: '#D7C7AD',
    primaryAction: '#3E5F54',
    primaryActionHover: '#2F4D44',
    primaryText: '#FDF8EC',
    softPanel: '#F4EFE5',
    activePanel: '#E7DED0',
    danger: '#8F3F32',
    dangerSoft: '#F3DED7',
    dangerBorder: '#D8B5AA',
    success: '#4F6F4F',
    successSoft: '#E7EBDD',
    warning: '#8A6235',
    warningSoft: '#F2E4CB',
    focusRing: '#8F7B5C',
    reviewSelection: '#EDE1CD',
    aiThought: '#EEF0E8',
    topTabActive: '#F1E5D2',
    sidebarGroup: '#E7DECE',
    chapterSelected: '#FFF9ED',
    inputBorder: '#CDBB9D',
  },
  {
    id: 'bambooMist',
    name: '方案 B / 竹雾清雅',
    summary: '保留一点清冷感，但把 #08AACE 压成竹青灰，适合想要更清爽的水墨。',
    page: '#EEF1E8',
    paper: '#FFFDF6',
    paperAlt: '#F6F7EF',
    ink: '#24302A',
    inkMuted: '#687466',
    border: '#C7D2C3',
    primaryAction: '#4E715D',
    primaryActionHover: '#3E5E4D',
    primaryText: '#FBFFF8',
    softPanel: '#F1F5EC',
    activePanel: '#DDE8DC',
    danger: '#9A4B3D',
    dangerSoft: '#F2DDD6',
    dangerBorder: '#D8B8AC',
    success: '#55714B',
    successSoft: '#E5ECDC',
    warning: '#897044',
    warningSoft: '#F1E8D2',
    focusRing: '#8AA083',
    reviewSelection: '#E3ECDD',
    aiThought: '#F1F6F0',
    topTabActive: '#E3EBDD',
    sidebarGroup: '#DDE7D9',
    chapterSelected: '#F9F8ED',
    inputBorder: '#BBCDB8',
  },
  {
    id: 'warmScroll',
    name: '方案 C / 暖卷古朴',
    summary: '用赭、茶、朱做强调色，最像旧纸卷轴；危险色也更像印泥而不是现代红。',
    page: '#F4E9D8',
    paper: '#FFF8EC',
    paperAlt: '#F7EEDC',
    ink: '#2D241A',
    inkMuted: '#7C674E',
    border: '#D5BFA0',
    primaryAction: '#7C5732',
    primaryActionHover: '#654524',
    primaryText: '#FFF8EC',
    softPanel: '#F4E8D5',
    activePanel: '#E9D4B8',
    danger: '#9B4739',
    dangerSoft: '#F2D9CF',
    dangerBorder: '#D8AD9E',
    success: '#667348',
    successSoft: '#E9E8D3',
    warning: '#9A6A2D',
    warningSoft: '#F2DEBA',
    focusRing: '#A98253',
    reviewSelection: '#EFD7B7',
    aiThought: '#F7EEDF',
    topTabActive: '#ECD7B8',
    sidebarGroup: '#EBDCC3',
    chapterSelected: '#FFF4E3',
    inputBorder: '#CDAF87',
  },
];

const replacementRows = [
  ['替换 #08AACE', '主按钮、纸飞机、激活标签、数字强调，不再使用荧光青。'],
  ['替换 #F4FBFC', 'AI 思考框、轻提示、选中浅底，改成纸灰、竹雾或米色。'],
  ['替换 #DC2626', '删除、清空、停止生成，改成朱砂/印泥红，降低现代警告感。'],
];

function ColorDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex min-w-[132px] items-center gap-2 rounded-md border bg-white/45 px-2 py-1" style={{ borderColor: 'rgba(80, 60, 32, 0.16)' }}>
      <span className="h-5 w-5 shrink-0 rounded-full border" style={{ backgroundColor: color, borderColor: 'rgba(45, 36, 26, 0.25)' }} />
      <span className="min-w-0 truncate text-xs font-black">{label}</span>
    </div>
  );
}

function SemanticUsageList({ palette }: { palette: ShuimoSemanticPalette }) {
  const rows = [
    ['主操作', palette.primaryAction, '发送、查找、复制正文、主题确认'],
    ['浅底面板', palette.softPanel, 'AI 输出背景、提示容器、弱分隔区域'],
    ['激活/选中', palette.activePanel, '顶部标签、当前章节、当前设定'],
    ['危险操作', palette.danger, '删除、清空、停止按钮'],
    ['成功状态', palette.success, '已关联、已完成、通过'],
    ['提示状态', palette.warning, '未读取、待更新、注意'],
    ['焦点描边', palette.focusRing, '输入框焦点、选择框聚焦'],
    ['审核选中', palette.reviewSelection, '原文/审核后当前段落高亮'],
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {rows.map(([name, color, usage]) => (
        <div key={name} className="rounded-md border px-3 py-2" style={{ borderColor: palette.border, backgroundColor: palette.paper }}>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: color, borderColor: palette.border }} />
            <span className="text-sm font-black" style={{ color: palette.ink }}>{name}</span>
          </div>
          <p className="text-xs font-bold leading-5" style={{ color: palette.inkMuted }}>{usage}</p>
        </div>
      ))}
    </div>
  );
}

function AppPreview({ palette }: { palette: ShuimoSemanticPalette }) {
  return (
    <div className="overflow-hidden rounded-lg border shadow-sm" style={{ backgroundColor: palette.page, borderColor: palette.border }}>
      <div className="flex h-11 items-center gap-2 border-b px-3" style={{ borderColor: palette.border, backgroundColor: palette.paperAlt }}>
        {['大主宰', '作品信息', '脑洞', '设定', '正文', '剧情审核'].map((tab, index) => (
          <div
            key={tab}
            className="flex h-8 min-w-[76px] items-center justify-center rounded-md border px-3 text-sm font-black"
            style={{
              backgroundColor: index === 5 ? palette.topTabActive : palette.paper,
              borderColor: index === 5 ? palette.focusRing : palette.border,
              color: index === 5 ? palette.primaryAction : palette.ink,
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="grid h-[620px] grid-cols-[240px_minmax(0,1fr)_330px]">
        <aside className="border-r p-3" style={{ backgroundColor: palette.sidebarGroup, borderColor: palette.border }}>
          <div className="mb-3 flex h-10 items-center gap-2 rounded-md border px-3 font-black" style={{ backgroundColor: palette.activePanel, borderColor: palette.border, color: palette.ink }}>
            <FileText className="h-4 w-4" style={{ color: palette.primaryAction }} />
            第一卷
            <span className="ml-auto rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: palette.paper, color: palette.primaryAction }}>7章</span>
          </div>
          {[1, 2, 3, 4, 5, 6, 7].map((chapter) => (
            <div
              key={chapter}
              className="mb-1.5 flex h-9 items-center rounded-md border px-2 text-sm font-black"
              style={{
                backgroundColor: chapter === 2 ? palette.chapterSelected : palette.paperAlt,
                borderColor: chapter === 2 ? palette.focusRing : 'transparent',
                color: palette.ink,
                boxShadow: chapter === 2 ? `inset 4px 0 0 ${palette.primaryAction}` : 'none',
              }}
            >
              <span>第{chapter}章</span>
              <span className="ml-auto text-xs" style={{ color: palette.inkMuted }}>{chapter === 2 ? 4197 : 2680}</span>
            </div>
          ))}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="h-9 rounded-md text-sm font-black" style={{ backgroundColor: palette.primaryAction, color: palette.primaryText }}>新增卷</button>
            <button className="h-9 rounded-md text-sm font-black" style={{ backgroundColor: palette.dangerSoft, color: palette.danger }}>回收站</button>
          </div>
        </aside>

        <main className="min-w-0 overflow-hidden p-5" style={{ backgroundColor: palette.paper }}>
          <div className="mb-4 flex items-center gap-2">
            <button className="h-8 rounded-md px-3 text-sm font-black" style={{ backgroundColor: palette.softPanel, color: palette.primaryAction, border: `1px solid ${palette.border}` }}>显示章纲</button>
            <button className="h-8 rounded-md px-3 text-sm font-black" style={{ backgroundColor: palette.primaryAction, color: palette.primaryText }}>等宽锁定</button>
            <button className="h-8 rounded-md px-3 text-sm font-black" style={{ backgroundColor: palette.warningSoft, color: palette.warning }}>自由调节</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['第2章 原文', '第2章 审核后'].map((title) => (
              <section key={title} className="overflow-hidden rounded-md border" style={{ borderColor: palette.border, backgroundColor: palette.paper }}>
                <div className="h-9 border-b px-3 py-2 text-sm font-black" style={{ borderColor: palette.border, backgroundColor: palette.softPanel, color: palette.primaryAction }}>{title}</div>
                <div className="space-y-5 p-4 text-sm leading-7" style={{ color: palette.inkMuted }}>
                  <p>苏凌他们望着高台上的那些西院学长，一时间气势也是弱了一些。</p>
                  <p>牧尘看了一眼不远处高台上的几人，视线只是在那道纤细的倩影上停了一下。</p>
                  <p className="border-l-4 px-4 py-2" style={{ backgroundColor: palette.reviewSelection, borderColor: palette.primaryAction, color: palette.ink }}>
                    对于西院这些家伙的骄狂，他同样是有些不喜。
                  </p>
                  <p>那种感觉，犹如慵懒云层之中悄然涌动的惊蛰。</p>
                </div>
              </section>
            ))}
          </div>
        </main>

        <aside className="border-l p-4" style={{ backgroundColor: palette.paperAlt, borderColor: palette.border }}>
          <div className="grid grid-cols-2 overflow-hidden rounded-md border" style={{ borderColor: palette.inputBorder, backgroundColor: palette.paper }}>
            <div className="border-r px-3 py-2" style={{ borderColor: palette.border }}>
              <div className="flex items-center justify-between text-xs font-black" style={{ color: palette.primaryAction }}>模型 <Settings className="h-3.5 w-3.5" /></div>
              <div className="mt-1 font-black" style={{ color: palette.ink }}>deepseek</div>
            </div>
            <div className="px-3 py-2">
              <div className="flex items-center justify-between text-xs font-black" style={{ color: palette.primaryAction }}>提示词 <Settings className="h-3.5 w-3.5" /></div>
              <div className="mt-1 font-black" style={{ color: palette.ink }}>结构审核</div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border p-4" style={{ borderColor: palette.border, backgroundColor: palette.paper }}>
            <div className="mb-3 rounded-md border p-3 text-sm leading-6" style={{ borderColor: palette.inputBorder, backgroundColor: palette.aiThought, color: palette.inkMuted }}>
              <div className="mb-2 flex items-center gap-2 font-black" style={{ color: palette.primaryAction }}>
                <Bot className="h-4 w-4" /> 已思考（用时 24 秒）
              </div>
              用户提供了剧情审核请求，需要判断章节结构、人物动机和冲突递进是否清晰。
            </div>
            <p className="text-sm leading-7" style={{ color: palette.inkMuted }}>
              【结构审核结果】整体结构基本通过，但核心悬念可以更强，建议补一处更明确的冲突导火索。
            </p>
          </div>

          <div className="mt-3 flex h-11 overflow-hidden rounded-md border" style={{ borderColor: palette.inputBorder, backgroundColor: palette.paper }}>
            <input className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" placeholder="请输入要求" style={{ color: palette.ink }} />
            <button className="w-12 border-l" style={{ borderColor: palette.border, color: palette.primaryAction }}><Send className="mx-auto h-5 w-5" /></button>
            <button className="w-12 border-l" style={{ borderColor: palette.border, color: palette.danger }}><Trash2 className="mx-auto h-5 w-5" /></button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-black">
            <span className="flex h-8 items-center justify-center rounded-md" style={{ backgroundColor: palette.successSoft, color: palette.success }}><Check className="mr-1 h-3.5 w-3.5" />通过</span>
            <span className="flex h-8 items-center justify-center rounded-md" style={{ backgroundColor: palette.warningSoft, color: palette.warning }}><AlertTriangle className="mr-1 h-3.5 w-3.5" />待读</span>
            <span className="flex h-8 items-center justify-center rounded-md" style={{ backgroundColor: palette.dangerSoft, color: palette.danger }}>清空</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PaletteCard({ palette }: { palette: ShuimoSemanticPalette }) {
  return (
    <section className="rounded-lg border p-4" style={{ borderColor: palette.border, backgroundColor: palette.paper }}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em]" style={{ color: palette.inkMuted }}>
            <Palette className="h-4 w-4" /> SHUIMO SEMANTIC PALETTE
          </div>
          <h2 className="mt-1 text-xl font-black" style={{ color: palette.ink }}>{palette.name}</h2>
          <p className="mt-1 max-w-3xl text-sm font-bold leading-6" style={{ color: palette.inkMuted }}>{palette.summary}</p>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          <ColorDot color={palette.primaryAction} label="主操作" />
          <ColorDot color={palette.softPanel} label="浅底" />
          <ColorDot color={palette.activePanel} label="选中" />
          <ColorDot color={palette.danger} label="危险" />
          <ColorDot color={palette.success} label="通过" />
          <ColorDot color={palette.warning} label="提示" />
        </div>
      </div>
      <SemanticUsageList palette={palette} />
      <div className="mt-4">
        <AppPreview palette={palette} />
      </div>
    </section>
  );
}

export function ShuimoSemanticPalettePreviewTestPage() {
  return (
    <div className="h-full min-h-0 overflow-y-auto bg-[#F2EBDD] p-6 text-[#28241E]">
      <header className="mb-5 rounded-lg border bg-[#FFFDF7] p-5 shadow-sm" style={{ borderColor: '#D7C7AD' }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-[#746753]">SHUIMO GLOBAL UI COLOR TEST</div>
            <h1 className="mt-1 text-2xl font-black">水墨语义配色预览</h1>
            <p className="mt-2 max-w-5xl text-sm font-bold leading-6 text-[#746753]">
              这页不是改正式主题，而是先看“什么 UI 用什么颜色”。重点替换 #08AACE、#F4FBFC、#DC2626 这类现代感太强的颜色，
              覆盖顶部标签、侧栏章节、正文选中、AI 输出框、输入框、按钮、危险操作和状态提示。
            </p>
          </div>
          <div className="grid gap-2 text-sm font-black text-[#5E5140]">
            {replacementRows.map(([title, desc]) => (
              <div key={title} className="rounded-md border bg-[#F8F0E2] px-3 py-2" style={{ borderColor: '#D7C7AD' }}>
                <span className="mr-2 text-[#8F3F32]">{title}</span>
                <span className="font-bold text-[#746753]">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="space-y-6">
        {shuimoSemanticPalettes.map((palette) => (
          <PaletteCard key={palette.id} palette={palette} />
        ))}
      </main>
    </div>
  );
}
