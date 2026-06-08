import {
  Brain,
  CheckCircle2,
  ChevronDown,
  GitBranch,
  Link2,
  MessageSquareText,
  Sparkles,
  Wand2,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type PlotChainTab = 'generate' | 'preview';

type PlotPoint = {
  id: number;
  title: string;
  content: string;
  bridge: string;
  review: string;
  score: number;
  status: 'written' | 'unwritten';
};

type Candidate = {
  title: string;
  content: string;
  reason: string;
  bridge: string;
  review: string;
  score: number;
};

const plotPoints: PlotPoint[] = [
  {
    id: 1,
    title: '维修单引出地下水压异常',
    content: '主角在深夜接到小区维修单，发现水表倒转，地下管廊里有一段不属于现代城市的青铜水渠。',
    bridge: '结尾留下青铜水渠会在凌晨三点再次开启的悬念，推动主角不得不返回现场。',
    review: '开局压力清楚，生活职业和异变入口贴合，适合作为第一章第一幕。',
    score: 86,
    status: 'written',
  },
  {
    id: 2,
    title: '第一次进入旧城灵脉',
    content: '主角带着工具箱返回管廊，误触青铜阀门，被卷入旧城灵脉的残破街巷，看到同一栋楼在灵脉中已经坍塌。',
    bridge: '由“异常水渠”自然进入“旧城灵脉”，并把现实小区和灵脉灾变绑定起来。',
    review: '承接明确，空间升级有效，但需要避免解释太多灵脉规则。',
    score: 91,
    status: 'written',
  },
  {
    id: 3,
    title: '救下知道真相的住户',
    content: '主角在灵脉街巷里救下失踪住户，对方认出他手里的维修铭牌，说明上一任维修工曾经封住过这里。',
    bridge: '把主角职业变成线索来源，同时引出上一任维修工，形成下一步调查目标。',
    review: '人物关系和线索递进都顺，能把单次奇遇变成长期主线。',
    score: 88,
    status: 'unwritten',
  },
  {
    id: 4,
    title: '物业公司掩盖灵脉事故',
    content: '主角回到现实后发现维修记录被删除，物业经理暗示他闭嘴，并安排人提前封锁地下入口。',
    bridge: '从奇异探索转入现实阻力，冲突层次从环境危险扩展到人为遮掩。',
    review: '现实反派介入及时，能防止剧情只停留在探险。',
    score: 82,
    status: 'unwritten',
  },
  {
    id: 5,
    title: '主角发现维修铭牌能控水',
    content: '主角被困在封锁管廊时，维修铭牌吸收灵脉水汽，短暂打开一道水盾，证明他的职业道具不是普通物品。',
    bridge: '承接物业封锁造成的危机，在危机中给出能力觉醒，适合进入下一章爽点。',
    review: '能力出现的位置好，但要控制强度，只解决当下危机，不要立刻碾压反派。',
    score: 94,
    status: 'unwritten',
  },
];

const candidates: Candidate[] = [
  {
    title: '候选A：住户留下旧钥匙',
    content: '获救住户把一枚旧钥匙塞给主角，钥匙能打开灵脉中某扇只在水声里出现的门。',
    reason: '更偏悬疑推进，适合强化线索感。',
    bridge: '承接维修铭牌控水后的线索推进，让主角从防守转入主动调查。',
    review: '适合作为链尾之后的新目标，悬疑感强，节奏不会突然跳级。',
    score: 89,
  },
  {
    title: '候选B：物业提前派人灭口',
    content: '物业派人进入管廊抢走维修记录，主角第一次正面遭遇现实势力阻拦。',
    reason: '更偏冲突推进，适合让节奏更快。',
    bridge: '承接能力觉醒后的现实反扑，让新能力马上接受压力测试。',
    review: '冲突明确，但需要控制反派强度，避免过早进入全面对抗。',
    score: 86,
  },
  {
    title: '候选C：灵脉倒灌现实楼层',
    content: '凌晨三点，三号楼墙面渗出青色水痕，现实住户开始听见旧城叫卖声。',
    reason: '更偏奇观推进，适合扩大世界观吸引力。',
    bridge: '承接管廊危机，把灵脉影响扩散到现实楼层，形成更大的外部压力。',
    review: '奇观强，适合扩大主线规模，但要避免一次性暴露太多世界观。',
    score: 92,
  },
];

function scoreClass(score: number) {
  if (score >= 90) return 'border-amber-200 bg-amber-50 text-amber-700';
  if (score >= 85) return 'border-purple-200 bg-purple-50 text-purple-700';
  if (score >= 80) return 'border-sky-200 bg-sky-50 text-sky-700';
  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

function ChainSidebar({
  activePoint,
  activeTab,
  points,
  tabs,
  onPointSelect,
  onTabChange,
}: {
  activePoint: number;
  activeTab: PlotChainTab;
  points: PlotPoint[];
  tabs: Array<{ id: PlotChainTab; label: string; icon: LucideIcon }>;
  onPointSelect: (id: number) => void;
  onTabChange: (tab: PlotChainTab) => void;
}) {
  const unwritten = points.filter((point) => point.status === 'unwritten');
  const written = points.filter((point) => point.status === 'written');
  const groups = [
    { id: 'unwritten', title: '未写剧情', points: unwritten, accent: 'cyan' },
    { id: 'written', title: '已写剧情', points: written, accent: 'slate' },
  ];

  return (
    <aside className="min-h-0 border-r border-slate-100 bg-slate-50">
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-b border-slate-100 bg-white px-4 py-3">
          <div className="mb-3 flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-black transition-colors ${
                    activeTab === tab.id ? 'bg-[#08AACE] text-white shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-sm font-black text-slate-950">
            <GitBranch className="h-4 w-4 text-[#08AACE]" />
            剧情链
          </div>
          <div className="mt-1 text-xs font-bold text-slate-400">唯一主线 · {plotPoints.length} 个剧情点</div>
        </div>
        <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
          <div className="space-y-3">
            {groups.map((group) => (
              <section
                key={group.id}
                className={`overflow-hidden rounded-xl border-2 bg-white shadow-sm ${
                  group.accent === 'cyan' ? 'border-[#9DEBFA]' : 'border-slate-200'
                }`}
              >
                <div className={`flex items-center justify-between gap-2 px-3 py-2 text-xs font-black ${
                  group.id === 'unwritten' ? 'bg-[#DDF7FC] text-[#078fb0]' : 'bg-slate-100 text-slate-600'
                }`}
                >
                  <span className="text-sm">{group.title}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs shadow-sm">{group.points.length}</span>
                </div>
                <div className="flex min-h-[58px] flex-wrap gap-2 px-3 py-3">
                  {group.points.map((point) => (
                    <button
                      key={point.id}
                      type="button"
                      onClick={() => onPointSelect(point.id)}
                      className={`grid h-9 w-10 place-items-center rounded-lg border text-sm font-black transition-colors ${
                        activePoint === point.id
                          ? 'border-[#08AACE] bg-[#08AACE] text-white'
                          : point.status === 'written'
                            ? 'border-slate-200 bg-slate-100 text-slate-400 hover:border-slate-300'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-[#08AACE] hover:text-[#08AACE]'
                      }`}
                    >
                      {point.id}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function RightAiPanel({ activePoint, points }: { activePoint: PlotPoint; points: PlotPoint[] }) {
  const [reviewOpen, setReviewOpen] = useState(true);
  const chainTailPoint = points.reduce((tail, point) => (point.id > tail.id ? point : tail), points[0]);
  const shouldShowSuggestion = activePoint.id === chainTailPoint.id;

  return (
    <aside className="min-h-0 border-l border-slate-100 bg-white">
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-black text-slate-950">
            <Brain className="h-4 w-4 text-[#08AACE]" />
            AI 判断
          </div>
          <div className="mt-1 text-xs font-bold text-slate-400">关联大纲 6 项 · 当前剧情点 {activePoint.id}</div>
        </div>
        <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 text-xs font-black text-slate-400">主线健康度</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['衔接', activePoint.score],
                  ['冲突', 87],
                  ['可写', 92],
                ].map(([label, value]) => (
                  <div key={label} className={`rounded-lg border px-2 py-2 text-center ${scoreClass(Number(value))}`}>
                    <div className="text-[11px] font-black opacity-80">{label}</div>
                    <div className="mt-0.5 text-base font-black">{value}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setReviewOpen((current) => !current)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm font-black text-slate-800 hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4 text-[#08AACE]" />
                  AI评价
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${reviewOpen ? '' : '-rotate-90'}`} />
              </button>
              {reviewOpen && (
                <div className="border-t border-slate-100 px-3 py-3 text-sm font-bold leading-6 text-slate-600">
                  {activePoint.review}
                </div>
              )}
            </section>

            {shouldShowSuggestion && (
              <section className="rounded-xl border border-cyan-100 bg-cyan-50 p-3 text-sm font-bold leading-6 text-cyan-800">
                <div className="mb-1 flex items-center gap-2 text-xs font-black text-cyan-600">
                  <Link2 className="h-4 w-4" />
                  接下来建议
                </div>
                优先生成“{activePoint.title}”之后的同一进度候选，不要跨到下一卷，也不要让能力强度突然越级。
              </section>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function GeneratePanel({
  points,
  onAddCandidate,
}: {
  points: PlotPoint[];
  onAddCandidate: (candidate: Candidate) => void;
}) {
  const chainTailPoint = points.reduce((tail, point) => (point.id > tail.id ? point : tail), points[0]);
  const nextPointId = chainTailPoint.id + 1;

  return (
    <main className="min-h-0 bg-white">
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 px-4">
          <div className="flex items-center gap-2 text-sm font-black text-slate-950">
            <Sparkles className="h-4 w-4 text-[#08AACE]" />
            生成第{nextPointId}号剧情点
          </div>
          <button className="rounded-lg bg-[#08AACE] px-3 py-1.5 text-xs font-black text-white shadow-sm hover:bg-[#0795b5]">
            刷新剧情点
          </button>
        </div>
        <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-black text-slate-400">链尾剧情点</div>
            <div className="mt-1 text-sm font-black text-slate-900">{chainTailPoint.id}. {chainTailPoint.title}</div>
            <div className="mt-2 text-sm font-bold leading-6 text-slate-600">下面候选会作为第{nextPointId}号剧情点，衔接到当前链尾。</div>
          </div>
          <div className="space-y-3">
            {candidates.map((candidate) => (
              <article key={candidate.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-black text-slate-950">{candidate.title}</div>
                    <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{candidate.content}</p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg border border-[#bdeef7] bg-[#EAF9FD] px-3 py-1.5 text-xs font-black text-[#078fb0] hover:border-[#08AACE]"
                    onClick={() => onAddCandidate(candidate)}
                  >
                    加入为{nextPointId}号
                  </button>
                </div>
                <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold leading-5 text-slate-500">
                  {candidate.reason}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function PreviewPanel({
  activePoint,
  points,
  onMarkWritten,
  onMoveUnwritten,
  onPointSelect,
}: {
  activePoint: PlotPoint;
  points: PlotPoint[];
  onMarkWritten: (id: number) => void;
  onMoveUnwritten: (id: number) => void;
  onPointSelect: (id: number) => void;
}) {
  const chainTailPoint = points.reduce((tail, point) => (point.id > tail.id ? point : tail), points[0]);

  return (
    <main className="min-h-0 bg-white">
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 px-4">
          <div className="flex items-center gap-2 text-sm font-black text-slate-950">
            <Link2 className="h-4 w-4 text-[#08AACE]" />
            剧情链衔接预览
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
            主线可写度 92
          </div>
        </div>
        <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
          <section className="mb-4 rounded-xl border border-[#BDEEF7] bg-[#F1FBFE] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black text-slate-950">剧情链总览</div>
                <div className="mt-1 text-xs font-bold text-slate-400">按序号查看整条主线，链尾只显示下一步建议。</div>
              </div>
              <div className="rounded-full border border-[#9DEBFA] bg-white px-3 py-1 text-xs font-black text-[#078fb0]">
                链尾 {chainTailPoint.id}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {points.map((point, index) => (
                <button
                  key={point.id}
                  type="button"
                  onClick={() => onPointSelect(point.id)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition-colors ${
                    point.id === activePoint.id
                      ? 'border-[#08AACE] bg-[#08AACE] text-white'
                      : point.status === 'written'
                        ? 'border-slate-200 bg-white text-slate-500'
                        : 'border-[#BDEEF7] bg-white text-[#078fb0] hover:border-[#08AACE]'
                  }`}
                >
                  <span>{point.id}</span>
                  <span className="max-w-[120px] truncate">{point.title}</span>
                  {index < points.length - 1 && <span className="text-slate-300">→</span>}
                </button>
              ))}
            </div>
          </section>
          <div className="space-y-3">
            {points.map((point) => {
              const active = point.id === activePoint.id;
              const written = point.status === 'written';
              const showNextDirection = point.id === chainTailPoint.id;
              return (
                <section key={point.id} className={`rounded-xl border p-4 ${active ? 'border-[#08AACE] bg-[#F1FBFE]' : 'border-slate-200 bg-white'}`}>
                  <div className="flex w-full items-start gap-3 text-left">
                    <button type="button" onClick={() => onPointSelect(point.id)} className="contents text-left">
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-black ${active ? 'bg-[#08AACE] text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {point.id}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black text-slate-950">{point.title}</span>
                        <span className="mt-1 block text-sm font-bold leading-6 text-slate-600">{point.content}</span>
                      </span>
                    </button>
                    <div className="flex shrink-0 flex-col items-end gap-3">
                    <button
                      type="button"
                      onClick={() => (written ? onMoveUnwritten(point.id) : onMarkWritten(point.id))}
                      className={`h-8 rounded-lg border px-3 text-xs font-black shadow-sm transition-colors ${
                        written
                          ? 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {written ? '移回未写' : '标为已写'}
                    </button>
                      <span className={`shrink-0 rounded-full border px-2 py-1 text-xs font-black ${scoreClass(point.score)}`}>
                        {point.score}
                      </span>
                    </div>
                  </div>
                  {showNextDirection && (
                    <div className="ml-4 mt-3 border-l-2 border-dashed border-cyan-200 pl-7">
                      <div className="rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-bold leading-5 text-cyan-800">
                        下一步推荐方向：{point.bridge}
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

export function PlotChainTabbedLayoutTestPage() {
  const [activeTab, setActiveTab] = useState<PlotChainTab>('generate');
  const [activePointId, setActivePointId] = useState(3);
  const [extraPoints, setExtraPoints] = useState<PlotPoint[]>([]);
  const [writtenPointIds, setWrittenPointIds] = useState<Set<number>>(() => (
    new Set(plotPoints.filter((point) => point.status === 'written').map((point) => point.id))
  ));
  const points = useMemo(
    () => [...plotPoints, ...extraPoints].map((point) => ({
      ...point,
      status: writtenPointIds.has(point.id) ? 'written' as const : 'unwritten' as const,
    })),
    [extraPoints, writtenPointIds],
  );
  const activePoint = useMemo(
    () => points.find((point) => point.id === activePointId) ?? points[0],
    [activePointId, points],
  );
  const markPointWritten = (id: number) => {
    setWrittenPointIds((current) => new Set([...current, id]));
  };
  const movePointUnwritten = (id: number) => {
    setWrittenPointIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  };
  const addCandidateToChain = (candidate: Candidate) => {
    const nextPointId = Math.max(...points.map((point) => point.id)) + 1;
    setExtraPoints((current) => ([
      ...current,
      {
        id: nextPointId,
        title: candidate.title.replace(/^候选[A-Z]：/, ''),
        content: candidate.content,
        bridge: candidate.bridge,
        review: candidate.review,
        score: candidate.score,
        status: 'unwritten',
      },
    ]));
    setActivePointId(nextPointId);
    setActiveTab('preview');
  };

  const tabs: Array<{ id: PlotChainTab; label: string; icon: LucideIcon }> = [
    { id: 'generate', label: '生成剧情链', icon: Wand2 },
    { id: 'preview', label: '剧情链预览', icon: Link2 },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <header className="shrink-0 border-b border-slate-100 bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-black text-slate-950">剧情链双标签布局测试</h1>
            <p className="mt-1 text-xs font-bold text-slate-400">把“生成候选”和“检查主线衔接”拆成两个工作视角。</p>
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[240px_minmax(0,1fr)_340px] overflow-hidden">
        <ChainSidebar
          activePoint={activePoint.id}
          activeTab={activeTab}
          points={points}
          tabs={tabs}
          onPointSelect={setActivePointId}
          onTabChange={setActiveTab}
        />
        {activeTab === 'generate'
          ? <GeneratePanel points={points} onAddCandidate={addCandidateToChain} />
          : (
            <PreviewPanel
              activePoint={activePoint}
              points={points}
              onMarkWritten={markPointWritten}
              onMoveUnwritten={movePointUnwritten}
              onPointSelect={setActivePointId}
            />
          )}
        <RightAiPanel activePoint={activePoint} points={points} />
      </div>

      <footer className="grid shrink-0 grid-cols-3 gap-3 border-t border-slate-100 bg-white px-5 py-3 text-xs font-bold text-slate-500">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          左侧固定为剧情链目录，减少切换成本
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#08AACE]" />
          生成页只处理候选和加入主链
        </div>
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-purple-500" />
          预览页专门检查剧情点之间的衔接
        </div>
      </footer>
    </div>
  );
}

export default PlotChainTabbedLayoutTestPage;
