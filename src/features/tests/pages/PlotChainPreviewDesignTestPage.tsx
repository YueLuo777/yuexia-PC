import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Gauge,
  GitBranch,
  Link2,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type PlotCandidate = {
  id: string;
  title: string;
  source: string;
  score: number;
  fit: number;
  potential: number;
  clarity: number;
  conflict: string;
  summary: string;
  bridge: string;
  hook: string;
  risk: string;
  tags: string[];
};

const selectedChain = [
  {
    title: '旧巷武馆验血',
    text: '林刻在旧巷武馆被测出异常气血，发现父亲留下的旧拳谱能让他短时间看见招式破绽。',
  },
  {
    title: '校队名额争夺',
    text: '校队名额被权贵子弟内定，林刻必须在公开测试里用最朴素的基础拳证明自己。',
  },
];

const candidates: PlotCandidate[] = [
  {
    id: 'arena',
    title: '联考前夜的地下陪练',
    source: '剧情库改写',
    score: 92,
    fit: 94,
    potential: 91,
    clarity: 89,
    conflict: '生存压力 + 校队暗箱',
    summary:
      '林刻为了凑联考报名费，接下地下陪练单，却发现对手正是校队内定名额背后的财团打手。',
    bridge:
      '承接“校队名额争夺”的不公平矛盾，把公开测试前的压力提前压到现实生计上。',
    hook:
      '打手认出林刻拳谱的起手式，暗示父亲当年和财团有旧账。',
    risk: '地下赛信息量偏大，需要控制篇幅，避免过早进入大地图。',
    tags: ['强衔接', '强冲突', '父亲线'],
  },
  {
    id: 'hospital',
    title: '妹妹住院费的倒计时',
    source: 'AI 生成',
    score: 88,
    fit: 90,
    potential: 86,
    clarity: 92,
    conflict: '亲情代价 + 资源争夺',
    summary:
      '妹妹治疗费突然上涨，林刻必须在三天内拿到武道联考预备奖金，否则家里会失去最后的治疗窗口。',
    bridge:
      '把“必须进入校队”的外部目标转成家庭倒计时，读者能更快理解主角为什么不能退。',
    hook:
      '医院账单上出现陌生资助人，留下和旧拳谱同源的印章。',
    risk: '情绪很稳，但动作爽感较弱，适合和训练或小胜利段落搭配。',
    tags: ['强情绪', '目标清晰', '代价'],
  },
  {
    id: 'beast',
    title: '城市防卫演习失控',
    source: '混合生成',
    score: 85,
    fit: 81,
    potential: 93,
    clarity: 83,
    conflict: '城市危机 + 能力曝光',
    summary:
      '学校组织城市防卫演习时，低阶异兽突破隔离区，林刻被迫用旧拳谱救下同学，也暴露了异常判断力。',
    bridge:
      '能接住前文训练成果，但从校园竞争跳到城市危机跨度较大，需要先铺垫演习制度。',
    hook:
      '监控里捕捉到林刻提前一秒预判异兽动作，引来武道协会关注。',
    risk: '潜力很高，但现在放进第 3 个剧情点可能显得升级过快。',
    tags: ['高潜力', '需铺垫', '能力曝光'],
  },
];

function getScoreClass(score: number) {
  if (score >= 90) return 'text-yellow-500';
  if (score >= 80) return 'text-purple-500';
  if (score >= 70) return 'text-blue-500';
  return 'text-green-500';
}

function getFitTone(fit: number) {
  if (fit >= 90) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (fit >= 82) return 'border-cyan-200 bg-cyan-50 text-cyan-700';
  return 'border-amber-200 bg-amber-50 text-amber-700';
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px] font-black text-slate-500">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-cyan-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function SmallTag({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-black text-slate-500">
      {children}
    </span>
  );
}

function DecisionCard({ candidate, selected, onToggle }: { candidate: PlotCandidate; selected: boolean; onToggle: () => void }) {
  return (
    <article className={`rounded-lg border bg-white p-4 shadow-sm ${selected ? 'border-cyan-400 ring-2 ring-cyan-100' : 'border-slate-200'}`}>
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-950 text-white">
          <Gauge className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate text-base font-black text-slate-950">{candidate.title}</h3>
            <span className="shrink-0 text-xs font-black text-cyan-600">{candidate.source}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`text-lg font-black ${getScoreClass(candidate.score)}`}>{candidate.score}</span>
            <span className={`rounded-full border px-2 py-1 text-[11px] font-black ${getFitTone(candidate.fit)}`}>
              衔接 {candidate.fit}%
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-600">
              潜力 {candidate.potential}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`h-9 rounded-lg px-4 text-sm font-black transition-colors ${
            selected ? 'bg-slate-950 text-white' : 'border border-cyan-400 bg-white text-cyan-600 hover:bg-cyan-50'
          }`}
        >
          {selected ? '已选' : '选择'}
        </button>
      </div>
      <p className="mt-3 text-sm font-bold leading-6 text-slate-700">{candidate.summary}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MetricBar label="内容清晰" value={candidate.clarity} />
        <MetricBar label="潜力" value={candidate.potential} />
        <MetricBar label="衔接" value={candidate.fit} />
      </div>
      <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-800">
        {candidate.bridge}
      </div>
    </article>
  );
}

function ChainBridgeCard({ candidate, selected, onToggle }: { candidate: PlotCandidate; selected: boolean; onToggle: () => void }) {
  return (
    <article className={`rounded-lg border bg-white p-4 ${selected ? 'border-cyan-400' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-black text-slate-400">方案 B · 链路承接卡</div>
          <h3 className="mt-1 text-base font-black text-slate-950">{candidate.title}</h3>
        </div>
        <button
          type="button"
          onClick={onToggle}
          title={selected ? '移出剧情链' : '加入剧情链'}
          className={`grid h-9 w-9 place-items-center rounded-lg ${
            selected ? 'bg-slate-950 text-white' : 'border border-cyan-400 bg-white text-cyan-600 hover:bg-cyan-50'
          }`}
        >
          {selected ? <CheckCircle2 className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
        </button>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-[11px] font-black text-slate-400">已选剧情</div>
          <p className="mt-1 text-sm font-black leading-5 text-slate-800">校队名额争夺</p>
        </div>
        <div className="hidden place-items-center text-slate-300 lg:grid">
          <ArrowRight className="h-5 w-5" />
        </div>
        <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3">
          <div className="text-[11px] font-black text-cyan-600">本剧情点</div>
          <p className="mt-1 text-sm font-black leading-5 text-slate-900">{candidate.conflict}</p>
        </div>
        <div className="hidden place-items-center text-slate-300 lg:grid">
          <ArrowRight className="h-5 w-5" />
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="text-[11px] font-black text-amber-700">下一钩子</div>
          <p className="mt-1 text-sm font-black leading-5 text-slate-900">{candidate.hook}</p>
        </div>
      </div>
      <div className="mt-3 rounded-lg border border-slate-200 p-3 text-xs font-bold leading-5 text-slate-600">
        {candidate.bridge}
      </div>
    </article>
  );
}

function PotentialCard({ candidate, selected, onToggle }: { candidate: PlotCandidate; selected: boolean; onToggle: () => void }) {
  return (
    <article className={`rounded-lg border bg-white p-4 ${selected ? 'border-cyan-400' : 'border-slate-200'}`}>
      <div className="grid gap-4 lg:grid-cols-[140px_minmax(0,1fr)]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
          <div className={`text-4xl font-black ${getScoreClass(candidate.score)}`}>{candidate.score}</div>
          <div className="mt-1 text-xs font-black text-slate-500">综合分</div>
          <div className="mt-3 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">
            {candidate.source}
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-black text-slate-400">方案 C · 潜力评分卡</div>
              <h3 className="mt-1 text-base font-black text-slate-950">{candidate.title}</h3>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className={`h-9 rounded-lg px-4 text-sm font-black ${
                selected ? 'bg-slate-950 text-white' : 'border border-cyan-400 bg-white text-cyan-600 hover:bg-cyan-50'
              }`}
            >
              {selected ? '已选' : '选择'}
            </button>
          </div>
          <p className="mt-3 text-sm font-bold leading-6 text-slate-700">{candidate.summary}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <MetricBar label="类型适配" value={candidate.fit} />
            <MetricBar label="爽点潜力" value={candidate.potential} />
            <MetricBar label="读者理解" value={candidate.clarity} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {candidate.tags.map((tag) => <SmallTag key={tag}>{tag}</SmallTag>)}
          </div>
        </div>
      </div>
    </article>
  );
}

function DenseScanRow({ candidate, selected, onToggle }: { candidate: PlotCandidate; selected: boolean; onToggle: () => void }) {
  return (
    <div className={`grid gap-3 rounded-lg border bg-white p-3 lg:grid-cols-[minmax(160px,220px)_80px_90px_minmax(0,1fr)_96px] ${selected ? 'border-cyan-400' : 'border-slate-200'}`}>
      <div className="min-w-0">
        <div className="truncate text-sm font-black text-slate-950">{candidate.title}</div>
        <div className="mt-1 text-[11px] font-black text-cyan-600">{candidate.source}</div>
      </div>
      <div>
        <div className={`text-lg font-black ${getScoreClass(candidate.score)}`}>{candidate.score}</div>
        <div className="text-[11px] font-black text-slate-400">评分</div>
      </div>
      <div>
        <div className="text-lg font-black text-emerald-600">{candidate.fit}%</div>
        <div className="text-[11px] font-black text-slate-400">衔接</div>
      </div>
      <div className="min-w-0 text-xs font-bold leading-5 text-slate-600">
        <span className="font-black text-slate-900">看点：</span>
        {candidate.summary}
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`h-9 rounded-lg text-sm font-black ${
          selected ? 'bg-slate-950 text-white' : 'border border-cyan-400 bg-white text-cyan-600 hover:bg-cyan-50'
        }`}
      >
        {selected ? '已选' : '选择'}
      </button>
    </div>
  );
}

export function PlotChainPreviewDesignTestPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(['arena']);

  const selectedCandidates = useMemo(
    () => candidates.filter((candidate) => selectedIds.includes(candidate.id)),
    [selectedIds],
  );

  const toggleCandidate = (id: string) => {
    setSelectedIds((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f6f8fb]">
      <header className="shrink-0 border-b border-slate-100 bg-white px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-black text-cyan-600">剧情链 · 方案测试</div>
            <h1 className="mt-1 text-xl font-black text-slate-950">剧情点预览卡片多方案</h1>
            <p className="mt-1 text-xs font-bold text-slate-500">
              同一批候选剧情点，用不同布局表达内容、潜力、衔接度和风险。
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <GitBranch className="h-4 w-4 text-cyan-600" />
            <span className="text-xs font-black text-slate-600">已选 {selectedCandidates.length} 个候选</span>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-5">
        <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-cyan-600" />
              <h2 className="text-sm font-black text-slate-950">当前已选剧情链</h2>
            </div>
            <div className="space-y-3">
              {selectedChain.map((item, index) => (
                <div key={item.title} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-950 text-[11px] font-black text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-black text-slate-900">{item.title}</span>
                  </div>
                  <p className="mt-2 text-xs font-bold leading-5 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-cyan-100 bg-cyan-50 p-3 text-xs font-bold leading-5 text-cyan-800">
              下一剧情点需要接住：校队名额、公开测试、家庭压力、旧拳谱线索。
            </div>
          </aside>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-slate-950">方案 A · 摘要决策卡</h2>
                <p className="text-xs font-bold text-slate-400">适合正式页默认卡片，先看能不能选。</p>
              </div>
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="grid gap-3 2xl:grid-cols-3">
              {candidates.map((candidate) => (
                <DecisionCard
                  key={candidate.id}
                  candidate={candidate}
                  selected={selectedIds.includes(candidate.id)}
                  onToggle={() => toggleCandidate(candidate.id)}
                />
              ))}
            </div>
          </section>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-slate-950">方案 B · 链路承接卡</h2>
                <p className="text-xs font-bold text-slate-400">适合检查是否真正接上已选剧情。</p>
              </div>
              <Link2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="space-y-3">
              {candidates.map((candidate) => (
                <ChainBridgeCard
                  key={candidate.id}
                  candidate={candidate}
                  selected={selectedIds.includes(candidate.id)}
                  onToggle={() => toggleCandidate(candidate.id)}
                />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-slate-950">方案 C · 潜力评分卡</h2>
                <p className="text-xs font-bold text-slate-400">适合比较评分、爽点潜力和读者理解成本。</p>
              </div>
              <Zap className="h-5 w-5 text-amber-500" />
            </div>
            <div className="space-y-3">
              {candidates.map((candidate) => (
                <PotentialCard
                  key={candidate.id}
                  candidate={candidate}
                  selected={selectedIds.includes(candidate.id)}
                  onToggle={() => toggleCandidate(candidate.id)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-950">方案 D · 密集扫读列表</h2>
              <p className="text-xs font-bold text-slate-400">适合一次生成很多剧情点时快速排除弱候选。</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-rose-500" />
          </div>
          <div className="space-y-2">
            {candidates.map((candidate) => (
              <DenseScanRow
                key={candidate.id}
                candidate={candidate}
                selected={selectedIds.includes(candidate.id)}
                onToggle={() => toggleCandidate(candidate.id)}
              />
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-black text-slate-950">已选择结果预览</h2>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            {selectedCandidates.map((candidate, index) => (
              <div key={candidate.id} className="rounded-lg border border-cyan-200 bg-cyan-50 p-3">
                <div className="text-xs font-black text-cyan-700">第 {index + 3} 个剧情点</div>
                <div className="mt-1 text-sm font-black text-slate-950">{candidate.title}</div>
                <p className="mt-2 text-xs font-bold leading-5 text-slate-700">{candidate.hook}</p>
              </div>
            ))}
            {selectedCandidates.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500">
                暂未选择候选剧情点。
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
