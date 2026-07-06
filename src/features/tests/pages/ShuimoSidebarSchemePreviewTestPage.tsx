import { Folder, FolderOpen, Palette } from 'lucide-react';

type ShuimoLayeredScheme = {
  id: string;
  name: string;
  summary: string;
  pageBg: string;
  topGroupBg: string;
  topGroupActiveBg: string;
  sidebarBg: string;
  folderBg: string;
  settingItemBg: string;
  selectedSettingBg: string;
  settingNameBg: string;
  fieldBg: string;
  accent: string;
  ink: string;
  muted: string;
  border: string;
};

const shuimoLayeredSchemes: ShuimoLayeredScheme[] = [
  {
    id: 'riceInk',
    name: '方案 A / 米纸墨青',
    summary: '整体最接近现在的水墨气质，但把原来的亮青底改成米纸、墨字和低饱和青绿层级。',
    pageBg: '#F4EFE4',
    topGroupBg: '#FFFDF8',
    topGroupActiveBg: '#E8F1EA',
    sidebarBg: '#EFE6D6',
    folderBg: '#E9EFE5',
    settingItemBg: '#FFFBF2',
    selectedSettingBg: '#EDE6D8',
    settingNameBg: '#FFFCF5',
    fieldBg: '#FFFDF8',
    accent: '#3F7D70',
    ink: '#28241E',
    muted: '#817463',
    border: '#D4C7B3',
  },
  {
    id: 'pineMist',
    name: '方案 B / 松烟雾绿',
    summary: '分组和选中项偏松绿色，背景保留纸感，层次比浅青更安静。',
    pageBg: '#EEF1E8',
    topGroupBg: '#FAF8EF',
    topGroupActiveBg: '#DDE8DC',
    sidebarBg: '#E2E7DD',
    folderBg: '#DCE8DE',
    settingItemBg: '#FAF8EF',
    selectedSettingBg: '#D8E4D8',
    settingNameBg: '#FCFAF2',
    fieldBg: '#FFFDF6',
    accent: '#426D54',
    ink: '#253129',
    muted: '#667467',
    border: '#C6D0C2',
  },
  {
    id: 'teaSmoke',
    name: '方案 C / 茶烟暖褐',
    summary: '用茶褐色做层级，适合更古朴的水墨方向，青色只退到辅助位置。',
    pageBg: '#F1E9DB',
    topGroupBg: '#FFF9EF',
    topGroupActiveBg: '#EADCC2',
    sidebarBg: '#E7DAC6',
    folderBg: '#EDE2CD',
    settingItemBg: '#FFF8EC',
    selectedSettingBg: '#E5D2B3',
    settingNameBg: '#FFF9F0',
    fieldBg: '#FFFDF8',
    accent: '#8A643A',
    ink: '#2D251C',
    muted: '#7E6A51',
    border: '#D2BFA3',
  },
  {
    id: 'blueGreyInk',
    name: '方案 D / 蓝灰淡墨',
    summary: '用蓝灰代替亮青，保留清冷感但不跳，分组、目录和内容区边界更稳。',
    pageBg: '#EEF0EC',
    topGroupBg: '#FCFBF6',
    topGroupActiveBg: '#DFE7E5',
    sidebarBg: '#E3E8E6',
    folderBg: '#DCE5E2',
    settingItemBg: '#FBFAF4',
    selectedSettingBg: '#D9E2E0',
    settingNameBg: '#FFFDF7',
    fieldBg: '#FFFDF8',
    accent: '#4F6972',
    ink: '#22292B',
    muted: '#667175',
    border: '#C5D0CF',
  },
  {
    id: 'cinnabarSeal',
    name: '方案 E / 朱印宣纸',
    summary: '用少量朱砂色做选中和强调，像印章落在宣纸上，视觉识别最强。',
    pageBg: '#F4EDE1',
    topGroupBg: '#FFF9F0',
    topGroupActiveBg: '#F2DFD3',
    sidebarBg: '#EDE2D2',
    folderBg: '#EFE4D6',
    settingItemBg: '#FFF9EF',
    selectedSettingBg: '#F0D8CC',
    settingNameBg: '#FFFDF8',
    fieldBg: '#FFFDF8',
    accent: '#A04F3F',
    ink: '#2B211C',
    muted: '#806A5B',
    border: '#D5C1AF',
  },
  {
    id: 'jadePaper',
    name: '方案 F / 玉纸青灰',
    summary: '偏清雅的玉色纸面，适合想保留一点青色但不要高亮荧光感的版本。',
    pageBg: '#EFF2EA',
    topGroupBg: '#FEFCF5',
    topGroupActiveBg: '#DCEBE3',
    sidebarBg: '#E5ECE2',
    folderBg: '#DAEADF',
    settingItemBg: '#FEFCF5',
    selectedSettingBg: '#D6E6DC',
    settingNameBg: '#FFFDF7',
    fieldBg: '#FFFDF8',
    accent: '#3F7C68',
    ink: '#24312B',
    muted: '#657469',
    border: '#C2D3C8',
  },
  {
    id: 'reverseCinnabar',
    name: '方案 G / 浅入朱印',
    summary: '基于 E 的朱印宣纸反向做由浅到深：分组名最轻，设定名加深，具体设定卡片最厚重。',
    pageBg: '#FFF9F1',
    topGroupBg: '#FFFDF8',
    topGroupActiveBg: '#FFF4E8',
    sidebarBg: '#F8ECDE',
    folderBg: '#F9F0E4',
    settingItemBg: '#FFFDF8',
    selectedSettingBg: '#F0D8CC',
    settingNameBg: '#F3DED2',
    fieldBg: '#E8CCBE',
    accent: '#A04F3F',
    ink: '#2B211C',
    muted: '#755A4D',
    border: '#D2B49F',
  },
];

const topGroups = [
  ['作品设定', '12'],
  ['人物设定', '1'],
  ['势力设定', '0'],
  ['道具资源', '0'],
  ['伏笔线索', '2'],
];

const sidebarRows = [
  { label: '核心设定', count: '3', folder: true },
  { label: '基础设定', count: '0 字' },
  { label: '世界观', count: '0 字' },
  { label: '主角金手指/优势', count: '0 字', selected: true },
  { label: '剧情规划', count: '3', folder: true },
  { label: '剧情蓝图', count: '0 字' },
  { label: '爽点设计', count: '0 字' },
  { label: '资源货币', count: '1', folder: true },
];

const fields = [
  ['能力来源', '金手指从哪里来，主角为什么拥有它。'],
  ['核心功能', '最常用、最能制造爽点的主要能力。'],
  ['升级方式', '如何解锁、进阶、强化或扩展能力。'],
  ['使用限制', '冷却、代价、条件、风险，以及不能做到什么。'],
];

function Swatches({ scheme }: { scheme: ShuimoLayeredScheme }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {[
        scheme.pageBg,
        scheme.topGroupActiveBg,
        scheme.folderBg,
        scheme.selectedSettingBg,
        scheme.settingNameBg,
        scheme.fieldBg,
        scheme.accent,
      ].map((color, index) => (
        <span className="h-5 w-5 rounded-full border" style={{ backgroundColor: color, borderColor: scheme.border }} />
      ))}
    </div>
  );
}

function SettingPageMock({ scheme }: { scheme: ShuimoLayeredScheme }) {
  return (
    <div className="overflow-hidden rounded-lg border shadow-sm" style={{ backgroundColor: scheme.pageBg, borderColor: scheme.border }}>
      <div className="flex gap-2 border-b p-3" style={{ borderColor: scheme.border }}>
        {topGroups.map(([label, count], index) => (
          <div
            className="flex h-9 min-w-[106px] items-center justify-center gap-2 rounded-md border px-3 text-sm font-black"
            style={{
              backgroundColor: index === 0 ? scheme.topGroupActiveBg : scheme.topGroupBg,
              borderColor: index === 0 ? scheme.accent : scheme.border,
              color: index === 0 ? scheme.accent : scheme.ink,
            }}
          >
            <span>{label}</span>
            <span style={{ color: index === 0 ? scheme.accent : scheme.muted }}>{count}</span>
          </div>
        ))}
      </div>

      <div className="grid h-[520px] grid-cols-[250px_minmax(0,1fr)]">
        <aside className="space-y-1.5 border-r p-3" style={{ backgroundColor: scheme.sidebarBg, borderColor: scheme.border }}>
          {sidebarRows.map((row) => {
            const FolderIcon = row.folder ? FolderOpen : Folder;
            return (
              <div
                className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-black"
                style={{
                  backgroundColor: row.folder ? scheme.folderBg : row.selected ? scheme.selectedSettingBg : scheme.settingItemBg,
                  borderColor: row.selected ? scheme.accent : scheme.border,
                  color: row.selected ? scheme.accent : scheme.ink,
                  boxShadow: row.selected ? `inset 4px 0 0 ${scheme.accent}` : 'none',
                }}
              >
                {row.folder ? <FolderIcon className="h-4 w-4" style={{ color: scheme.accent }} /> : null}
                <span className="min-w-0 flex-1 truncate">{row.label}</span>
                <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: scheme.topGroupBg, color: scheme.accent }}>
                  {row.count}
                </span>
              </div>
            );
          })}
        </aside>

        <main className="min-w-0 overflow-hidden p-5">
          <div
            className="mb-5 inline-flex min-w-[260px] flex-col rounded-lg border px-5 py-3"
            style={{ backgroundColor: scheme.settingNameBg, borderColor: scheme.border }}
          >
            <span className="text-xs font-black" style={{ color: scheme.accent }}>设定名</span>
            <span className="mt-1 text-xl font-medium" style={{ color: scheme.ink }}>主角金手指/优势</span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {fields.map(([title, hint]) => (
              <section
                className="min-h-[150px] rounded-lg border px-5 py-4"
                style={{ backgroundColor: scheme.fieldBg, borderColor: scheme.border }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-base font-black" style={{ color: scheme.ink }}>{title}</span>
                  <span className="text-sm font-black" style={{ color: scheme.accent }}>0 字</span>
                </div>
                <p className="text-sm font-bold leading-6" style={{ color: scheme.muted }}>{hint}</p>
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export function ShuimoSidebarSchemePreviewTestPage() {
  return (
    <div className="h-full min-h-0 overflow-y-auto bg-[#F2EDE2] p-6 text-[#25211B]">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-[#D1C2AD] pb-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.16em] text-[#7D715F]">SHUIMO LAYER TEST</div>
          <h1 className="mt-1 text-2xl font-black">水墨层级配色方案预览</h1>
          <p className="mt-2 max-w-4xl text-sm font-bold leading-6 text-[#6F675B]">
            同时比较分组、设定名、选中设定、背景和内容卡片的颜色层级，避开当前不搭的浅青底。
          </p>
        </div>
        <div className="rounded-md border border-[#D1C2AD] bg-[#FFFDF8] px-3 py-2 text-sm font-black text-[#3F7D70]">
          7 个候选方案
        </div>
      </header>

      <main className="grid gap-5 2xl:grid-cols-2">
        {shuimoLayeredSchemes.map((scheme) => (
          <section className="rounded-lg border bg-[#FFFDF8] p-4" style={{ borderColor: scheme.border }}>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-black">{scheme.name}</h2>
                <p className="mt-1 max-w-xl text-sm font-bold leading-6 text-[#7D715F]">{scheme.summary}</p>
              </div>
              <Swatches scheme={scheme} />
            </div>
            <SettingPageMock scheme={scheme} />
          </section>
        ))}
      </main>
    </div>
  );
}
