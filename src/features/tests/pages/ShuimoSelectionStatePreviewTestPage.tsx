import { Check, CircleDot, Folder, FolderOpen, Sparkles } from 'lucide-react';

type SelectionStateScheme = {
  id: string;
  name: string;
  summary: string;
  activeClass: string;
  marker: 'line' | 'outline' | 'lift' | 'dot';
  swatches: [string, string, string];
};

const shuimoSelectionStateSchemes: SelectionStateScheme[] = [
  {
    id: 'inkLine',
    name: '方案 A / 左侧墨线',
    summary: '左侧粗墨线加深文字，选中态最直接。',
    activeClass: 'border-[#25211B] bg-[#FFFDF8] text-[#25211B] shadow-[inset_4px_0_0_#25211B,0_2px_8px_rgba(37,33,27,0.12)]',
    marker: 'line',
    swatches: ['#FFFDF8', '#25211B', '#D8CDBB'],
  },
  {
    id: 'cyanOutline',
    name: '方案 B / 青色描边',
    summary: '使用青色描边和浅青底，和水墨主题强调色一致。',
    activeClass: 'border-[#08AACE] bg-[#EAF9FD] text-[#087F99] shadow-[0_0_0_2px_rgba(8,170,206,0.18)]',
    marker: 'outline',
    swatches: ['#EAF9FD', '#08AACE', '#087F99'],
  },
  {
    id: 'paperLift',
    name: '方案 C / 纸卡浮起',
    summary: '用白纸底、暖灰边框和阴影让当前条目像纸卡浮起。',
    activeClass: 'border-[#B8A78D] bg-[#FFFFFF] text-[#25211B] shadow-[0_6px_14px_rgba(80,58,28,0.18)]',
    marker: 'lift',
    swatches: ['#FFFFFF', '#B8A78D', '#25211B'],
  },
  {
    id: 'dotMarker',
    name: '方案 D / 圆点标记',
    summary: '保留克制浅底，在条目前方加青色圆点识别当前项。',
    activeClass: 'border-[#9DEBFA] bg-[#F4FBFC] text-[#25211B] shadow-[0_1px_4px_rgba(8,170,206,0.12)]',
    marker: 'dot',
    swatches: ['#F4FBFC', '#9DEBFA', '#08AACE'],
  },
];

function Marker({ type }: { type: SelectionStateScheme['marker'] }) {
  if (type === 'line') return <span className="h-6 w-1.5 rounded-full bg-[#25211B]" />;
  if (type === 'outline') return <Check className="h-4 w-4 text-[#08AACE]" />;
  if (type === 'lift') return <Sparkles className="h-4 w-4 text-[#8A5A18]" />;
  return <CircleDot className="h-4 w-4 text-[#08AACE]" />;
}

function Swatches({ colors }: { colors: [string, string, string] }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-5 w-5 rounded-full border border-[#D8CDBB]" style={{ backgroundColor: colors[0] }} />
      <span className="h-5 w-5 rounded-full border border-[#D8CDBB]" style={{ backgroundColor: colors[1] }} />
      <span className="h-5 w-5 rounded-full border border-[#D8CDBB]" style={{ backgroundColor: colors[2] }} />
    </div>
  );
}

function SidebarRow({
  label,
  count,
  folder,
  active,
  scheme,
}: {
  label: string;
  count: number;
  folder?: boolean;
  active?: boolean;
  scheme: SelectionStateScheme;
}) {
  const FolderIcon = active || folder ? FolderOpen : Folder;
  return (
    <div
      className={[
        'flex h-10 items-center gap-2 rounded-xl border px-2 text-left text-sm font-black transition-colors',
        active
          ? scheme.activeClass
          : folder
            ? 'border-[#BDEEF7] bg-[#EAF9FD] text-[#1f2933] shadow-sm'
            : 'border-[#E2D7C6] bg-[#FFFDF8] text-[#3B3730] shadow-sm',
      ].join(' ')}
    >
      {active ? (
        <Marker type={scheme.marker} />
      ) : folder ? (
        <FolderIcon className="h-[17px] w-[17px] shrink-0 text-[#08AACE]" />
      ) : (
        <span className="w-4 shrink-0" />
      )}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className={['rounded-full px-2 py-0.5 text-xs font-black', active ? 'bg-white/80 text-[#087F99]' : 'bg-[#F6F1E7] text-[#6f7e90]'].join(' ')}>
        {count} 字
      </span>
    </div>
  );
}

function SelectionPreview({ scheme }: { scheme: SelectionStateScheme }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#D8CDBB] bg-[#F2E9D8] shadow-sm">
      <div className="grid grid-cols-[240px_minmax(0,1fr)]">
        <aside className="min-h-[470px] border-r border-[#D8CDBB] bg-[#F2E9D8] px-1.5 py-4">
          <div className="space-y-1">
            <SidebarRow label="核心设定" count={3} folder scheme={scheme} />
            <SidebarRow label="基础设定" count={0} scheme={scheme} />
            <SidebarRow label="世界观" count={0} scheme={scheme} />
            <SidebarRow label="主角金手指/优势" count={0} active scheme={scheme} />
            <SidebarRow label="剧本规划" count={3} folder scheme={scheme} />
            <SidebarRow label="剧情蓝图" count={0} scheme={scheme} />
            <SidebarRow label="爽点设计" count={0} scheme={scheme} />
            <SidebarRow label="分卷剧情" count={0} scheme={scheme} />
            <SidebarRow label="资源货币" count={1} folder scheme={scheme} />
          </div>
        </aside>

        <main className="min-h-[470px] bg-[#FFFDF8] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.16em] text-[#7D715F]">SELECTED ENTRY</div>
              <h3 className="mt-1 text-lg font-black text-[#25211B]">{scheme.name}</h3>
            </div>
            <Swatches colors={scheme.swatches} />
          </div>

          <div className="space-y-5">
            <label className="relative flex h-[84px] items-center rounded-[32px] border-2 border-[#D8CDBB] bg-[#FFFDF8] px-8">
              <span className="absolute left-9 top-0 -translate-y-1/2 bg-[#FFFDF8] px-2 text-base font-medium text-[#25211B]">设定名</span>
              <span className="text-xl font-medium text-[#5E5346]">主角金手指/优势</span>
            </label>

            <section className="relative min-h-[118px] rounded-[28px] border-2 border-[#D8CDBB] bg-[#FFFDF8] px-8 py-8">
              <span className="absolute left-9 top-0 -translate-y-1/2 bg-[#FFFDF8] px-2 text-base font-medium text-[#25211B]">能力来源 <b className="text-[#087F99]">0 字</b></span>
              <p className="text-sm font-black leading-7 text-[#A99C88]">金手指从哪里来，主角为什么拥有它。</p>
            </section>
            <section className="relative min-h-[118px] rounded-[28px] border-2 border-[#D8CDBB] bg-[#FFFDF8] px-8 py-8">
              <span className="absolute left-9 top-0 -translate-y-1/2 bg-[#FFFDF8] px-2 text-base font-medium text-[#25211B]">升级方式 <b className="text-[#087F99]">0 字</b></span>
              <p className="text-sm font-black leading-7 text-[#A99C88]">如何解锁、进阶、强化或扩展能力。</p>
            </section>
            <section className="relative min-h-[118px] rounded-[28px] border-2 border-[#D8CDBB] bg-[#FFFDF8] px-8 py-8">
              <span className="absolute left-9 top-0 -translate-y-1/2 bg-[#FFFDF8] px-2 text-base font-medium text-[#25211B]">隐藏真相 <b className="text-[#087F99]">0 字</b></span>
              <p className="text-sm font-black leading-7 text-[#A99C88]">金手指背后的来源、阴谋、使命或后期反转。</p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export function ShuimoSelectionStatePreviewTestPage() {
  return (
    <div className="h-full min-h-0 overflow-y-auto bg-[#F6F1E7] p-6 text-[#25211B]">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-[#D8CDBB] pb-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.16em] text-[#7D715F]">SHUIMO SELECTED STATE TEST</div>
          <h1 className="mt-1 text-2xl font-black">水墨设定条目选中态预览</h1>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-[#6F675B]">
            只比较左侧设定条目被选中时的识别强度，布局、行高、圆角和字数徽标尽量贴近正式作品编辑器。
          </p>
        </div>
        <div className="rounded-lg border border-[#BDEEF7] bg-[#EAF9FD] px-3 py-2 text-sm font-black text-[#087F99]">
          4 个选中态方案
        </div>
      </header>

      <main className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-lg border border-[#D8CDBB] bg-[#FFFDF8] p-4">
          <div className="mb-3">
            <h2 className="text-base font-black">{shuimoSelectionStateSchemes[0].name}</h2>
            <p className="mt-1 text-sm font-bold leading-6 text-[#7D715F]">{shuimoSelectionStateSchemes[0].summary}</p>
          </div>
          <SelectionPreview scheme={shuimoSelectionStateSchemes[0]} />
        </section>
        <section className="rounded-lg border border-[#D8CDBB] bg-[#FFFDF8] p-4">
          <div className="mb-3">
            <h2 className="text-base font-black">{shuimoSelectionStateSchemes[1].name}</h2>
            <p className="mt-1 text-sm font-bold leading-6 text-[#7D715F]">{shuimoSelectionStateSchemes[1].summary}</p>
          </div>
          <SelectionPreview scheme={shuimoSelectionStateSchemes[1]} />
        </section>
        <section className="rounded-lg border border-[#D8CDBB] bg-[#FFFDF8] p-4">
          <div className="mb-3">
            <h2 className="text-base font-black">{shuimoSelectionStateSchemes[2].name}</h2>
            <p className="mt-1 text-sm font-bold leading-6 text-[#7D715F]">{shuimoSelectionStateSchemes[2].summary}</p>
          </div>
          <SelectionPreview scheme={shuimoSelectionStateSchemes[2]} />
        </section>
        <section className="rounded-lg border border-[#D8CDBB] bg-[#FFFDF8] p-4">
          <div className="mb-3">
            <h2 className="text-base font-black">{shuimoSelectionStateSchemes[3].name}</h2>
            <p className="mt-1 text-sm font-bold leading-6 text-[#7D715F]">{shuimoSelectionStateSchemes[3].summary}</p>
          </div>
          <SelectionPreview scheme={shuimoSelectionStateSchemes[3]} />
        </section>
      </main>
    </div>
  );
}
