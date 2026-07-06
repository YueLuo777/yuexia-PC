import type { ReactNode } from 'react';

const sampleHotspots = [
  { rank: 1, title: '中国男篮力克中国台北', source: '抖音', heat: '1215万', fit: 78 },
  { rank: 2, title: '孙颖莎4:3勒曼夺冠', source: '抖音', heat: '1205万', fit: 74 },
  { rank: 3, title: '国产机器人加速走向全球', source: '知乎', heat: '842万', fit: 86 },
  { rank: 4, title: '因为前奏太好听于是我翻遍了相册', source: 'B站', heat: '512万', fit: 69 },
  { rank: 5, title: '记者现场实探六盘水库险情', source: '微博', heat: '486万', fit: 81 },
  { rank: 6, title: '这是大草原给的自由感', source: '百度', heat: '392万', fit: 63 },
];

const sourceStats = [
  { name: '百度', count: 50, tone: '民生 / 突发' },
  { name: '抖音', count: 50, tone: '情绪 / 爆点' },
  { name: '微博', count: 50, tone: '争议 / 人物' },
  { name: '知乎', count: 30, tone: '观点 / 解释' },
  { name: 'B站', count: 50, tone: '青年 / 二创' },
];

const aiNotes = [
  '适合类型：长篇网文、竞技成长、系统流体育题材',
  '核心钩子：冷门天才被临时召回，一场翻盘改写命运',
  '人物关系：新秀、旧日队友、商业赞助方、严苛教练',
  '风险提醒：避开真实姓名和真实赛事复刻，用架空联赛承接情绪',
];

type HotspotLayoutScheme = {
  id: string;
  title: string;
  summary: string;
  bestFor: string;
  render: () => ReactNode;
};

function SourcePill({ name, count }: { name: string; count: number }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
      <span className="text-xs font-bold text-slate-700">{name}</span>
      <span className="text-xs font-black text-[#08AACE]">{count}</span>
    </div>
  );
}

function MiniHotspotRow({ item, compact = false }: { item: (typeof sampleHotspots)[number]; compact?: boolean }) {
  return (
    <div className="grid min-h-12 grid-cols-[42px_minmax(0,1fr)_72px] items-center gap-3 border-b border-slate-100 px-3 py-2 last:border-b-0">
      <span className="text-sm font-black text-slate-400">#{item.rank}</span>
      <div className="min-w-0">
        <div className="truncate text-sm font-black text-slate-900">{item.title}</div>
        {!compact && <div className="mt-0.5 text-xs text-slate-400">{item.source} · {item.heat}</div>}
      </div>
      <span className="rounded-md bg-slate-100 px-2 py-1 text-center text-xs font-bold text-slate-500">{item.fit}</span>
    </div>
  );
}

function AiMemo({ dense = false }: { dense?: boolean }) {
  return (
    <div className="h-full rounded-md border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-black text-slate-900">AI 小说适合度</div>
          <div className="text-xs text-slate-400">点击热点后自动生成</div>
        </div>
        <div className="rounded-md bg-[#08AACE] px-3 py-1 text-sm font-black text-white">78</div>
      </div>
      <div className={dense ? 'space-y-2 text-xs leading-5 text-slate-600' : 'space-y-3 text-sm leading-6 text-slate-600'}>
        {aiNotes.map((note) => (
          <p key={note}>{note}</p>
        ))}
      </div>
    </div>
  );
}

const HOTSPOT_LAYOUT_SCHEMES: HotspotLayoutScheme[] = [
  {
    id: 'command-center',
    title: '方案 A：指挥台三栏',
    summary: '保留平台筛选、热点列表、AI 分析三块，但压缩空白，把操作集中在顶部。',
    bestFor: '适合正式页第一版，学习成本最低。',
    render: () => (
      <div className="grid h-[430px] grid-cols-[150px_minmax(220px,1fr)_300px] overflow-hidden rounded-md border border-slate-200 bg-white">
        <aside className="border-r border-slate-100 bg-slate-50 p-4">
          <div className="mb-4 text-sm font-black text-slate-900">热点源</div>
          <div className="space-y-2">
            {sourceStats.map((source) => <SourcePill key={source.name} name={source.name} count={source.count} />)}
          </div>
        </aside>
        <section className="min-w-0 border-r border-slate-100">
          <div className="flex h-12 items-center justify-between border-b border-slate-100 px-4">
            <div className="text-sm font-black text-slate-900">全平台前 50 热点</div>
            <button className="h-8 rounded-md bg-slate-900 px-3 text-xs font-bold text-white">组合题材</button>
          </div>
          {sampleHotspots.map((item) => <MiniHotspotRow key={item.rank} item={item} />)}
        </section>
        <section className="p-4">
          <AiMemo />
        </section>
      </div>
    ),
  },
  {
    id: 'radar-board',
    title: '方案 B：热点雷达',
    summary: '先看平台热度、题材机会和风险，再进入单条热点，适合做决策面板。',
    bestFor: '适合你想突出“AI 帮你判断值不值得写”。',
    render: () => (
      <div className="h-[430px] overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-4">
        <div className="grid grid-cols-5 gap-3">
          {sourceStats.map((source) => (
            <div key={source.name} className="rounded-md border border-slate-200 bg-white p-3">
              <div className="text-xs font-bold text-slate-400">{source.name}</div>
              <div className="mt-2 text-2xl font-black text-slate-900">{source.count}</div>
              <div className="mt-1 text-xs text-slate-500">{source.tone}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_300px] gap-4">
          <div className="rounded-md border border-slate-200 bg-white">
            <div className="grid grid-cols-3 border-b border-slate-100 text-center text-xs font-bold text-slate-500">
              <span className="py-2">爆点强度 91</span>
              <span className="border-x border-slate-100 py-2">小说适合 78</span>
              <span className="py-2">改写风险 42</span>
            </div>
            {sampleHotspots.slice(0, 5).map((item) => <MiniHotspotRow key={item.rank} item={item} compact />)}
          </div>
          <AiMemo dense />
        </div>
      </div>
    ),
  },
  {
    id: 'editor-desk',
    title: '方案 C：编辑台',
    summary: '把“选热点、拼题材、写钩子”放在同一个横向流程里，像编辑在组稿。',
    bestFor: '适合后续做多选热点组合题材。',
    render: () => (
      <div className="grid h-[430px] grid-cols-[minmax(220px,1fr)_220px_280px] gap-4 rounded-md border border-slate-200 bg-white p-4">
        <section className="min-w-0 rounded-md border border-slate-200">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-900">候选热点</div>
          {sampleHotspots.map((item) => <MiniHotspotRow key={item.rank} item={item} />)}
        </section>
        <section className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-sm font-black text-slate-900">已选组合</div>
          <div className="mt-3 space-y-2">
            {sampleHotspots.slice(0, 3).map((item) => (
              <div key={item.rank} className="rounded-md bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">
                {item.title}
              </div>
            ))}
          </div>
          <button className="mt-4 h-9 w-full rounded-md bg-[#08AACE] text-xs font-black text-white">生成新题材</button>
        </section>
        <section className="rounded-md border border-slate-200 bg-white p-4">
          <div className="text-sm font-black text-slate-900">组合结果</div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            一个被低估的青年教练临时接管残阵球队，同时发现赞助方正在利用机器人训练系统操控比赛结果。
          </p>
          <div className="mt-4 rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            卖点：体育逆袭 + AI 黑箱 + 青年群像。核心冲突清楚，能从真实热搜情绪转成架空小说。
          </div>
        </section>
      </div>
    ),
  },
  {
    id: 'card-wall',
    title: '方案 D：卡片墙',
    summary: '每条热点直接变成一张题材卡，适合快速扫、快速收藏灵感。',
    bestFor: '适合灵感库导入和移动端窄屏延展。',
    render: () => (
      <div className="h-[430px] overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-4">
        <div className="grid grid-cols-3 gap-3">
          {sampleHotspots.map((item) => (
            <article key={item.rank} className="min-h-[184px] rounded-md border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400">#{item.rank} · {item.source}</span>
                <span className="rounded-md bg-brand-light px-2 py-1 text-xs font-black text-[#08AACE]">{item.fit}</span>
              </div>
              <h3 className="mt-3 line-clamp-2 min-h-10 text-base font-black leading-5 text-slate-900">{item.title}</h3>
              <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-500">
                可改写为架空题材：保留情绪，不照搬现实人物；提取“反转、压力、公众视线”做小说冲突。
              </p>
              <button className="mt-3 h-8 w-full rounded-md border border-slate-200 bg-white text-xs font-bold text-slate-600">查看 AI 分析</button>
            </article>
          ))}
        </div>
      </div>
    ),
  },
];

export function HotspotLayoutPreviewTestPage() {
  return (
    <div className="h-full overflow-x-hidden overflow-y-auto bg-slate-50 px-6 py-5">
      <header className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-normal text-slate-950">热点布局方案测试</h1>
          <p className="mt-1 text-sm text-slate-500">对照不同信息密度，先选布局，再迁入正式热点灵感页。</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500">
          样例数据：5个平台 · 130条热点 · AI适合度
        </div>
      </header>

      <div className="space-y-6">
        {HOTSPOT_LAYOUT_SCHEMES.map((layout) => (
          <section key={layout.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 grid grid-cols-[minmax(0,1fr)_280px] gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">{layout.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">{layout.summary}</p>
              </div>
              <div className="rounded-md bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
                <span className="font-black text-slate-700">使用建议：</span>{layout.bestFor}
              </div>
            </div>
            {layout.render()}
          </section>
        ))}
      </div>
    </div>
  );
}
