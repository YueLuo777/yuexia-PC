import {
  AlertTriangle,
  BookOpen,
  Check,
  ClipboardList,
  FileText,
  Link2,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type SettingTab = 'work' | 'characters';
type CheckSourceId = 'outline' | 'characters' | 'detailOutline' | 'body' | 'summary' | 'state';
type FindingType = '人物' | '道具' | '势力' | '地点' | '规则' | '状态';

type CheckSource = {
  id: CheckSourceId;
  title: string;
  description: string;
  words: number;
  recommended?: boolean;
};

type Finding = {
  id: string;
  type: FindingType;
  title: string;
  source: string;
  reason: string;
  target: string;
  suggestion: string;
  strict?: boolean;
};

const settingCategories = [
  {
    title: '作品设定',
    items: ['世界观', '力量体系', '主线目标', '禁写规则'],
  },
  {
    title: '人物设定',
    items: ['男主角', '女主角', '正派配角', '反派角色', '临时角色'],
  },
];

const checkSources: CheckSource[] = [
  { id: 'outline', title: '设定库', description: '正式世界观、人物、道具、势力和禁写规则。', words: 4380, recommended: true },
  { id: 'characters', title: '人物设定', description: '当前人物设定分类与角色档案。', words: 2860, recommended: true },
  { id: 'detailOutline', title: '章纲', description: '当前章纲和状态契约，最容易出现新设定。', words: 1320, recommended: true },
  { id: 'body', title: '正文', description: '已写正文，检查实际出现的新人物、新道具和状态变化。', words: 5840 },
  { id: 'summary', title: '梗概', description: '章节梗概，用于快速确认剧情事实。', words: 620 },
  { id: 'state', title: '更新/状态库', description: '已确认状态事实和待同步更新项。', words: 980 },
];

const findings: Finding[] = [
  {
    id: 'apothecary',
    type: '人物',
    title: '黑市药铺老板',
    source: '第2章章纲',
    reason: '章纲中承担交易与旧案线索功能，但人物设定库没有该角色。',
    target: '人物设定 / 配角',
    suggestion: '身份：黑市药铺老板；作用：旧案线索提供者；立场：交易优先，疑似认识主角家族旧徽记。',
    strict: true,
  },
  {
    id: 'badge',
    type: '道具',
    title: '旧徽记',
    source: '第1章正文、第2章章纲',
    reason: '旧徽记多次影响剧情，但道具设定里没有归属、能力和暴露状态。',
    target: '作品设定 / 道具设定',
    suggestion: '主角家族遗物；可被黑市老资格人物识别；当前处于被注意但未公开暴露状态。',
    strict: true,
  },
  {
    id: 'black-market-rule',
    type: '规则',
    title: '黑市暗号和旧家族标记识别规则',
    source: '第2章章纲',
    reason: '这属于世界运行规则，不应只保存在单章章纲。',
    target: '作品设定 / 世界规则',
    suggestion: '黑市依赖药味、门牌和旧家族标记识别来客；识别者通常不会公开点破身份。',
  },
  {
    id: 'ledger',
    type: '状态',
    title: '城防军账本成为下一章目标',
    source: '第2章正文',
    reason: '正文实际推进了下一章任务目标，需要同步到更新/状态库。',
    target: '更新 / 线索状态',
    suggestion: '主角确认城防军账本与旧案有关，下一步行动目标为取回账本。',
  },
  {
    id: 'city-guard',
    type: '势力',
    title: '边境城防军',
    source: '第1章正文、第2章正文',
    reason: '城防军连续出现并推动冲突，但势力设定缺少目标、权限和与旧案的关系。',
    target: '作品设定 / 势力设定',
    suggestion: '边境城防军负责入城检测和黑市搜查，内部可能保存旧案账本。',
    strict: true,
  },
];

const findingTypeClass: Record<FindingType, string> = {
  人物: 'border-blue-200 bg-blue-50 text-blue-700',
  道具: 'border-violet-200 bg-violet-50 text-violet-700',
  势力: 'border-amber-200 bg-amber-50 text-amber-700',
  地点: 'border-slate-200 bg-slate-50 text-slate-700',
  规则: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  状态: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

function countSelectedWords(selectedIds: Set<CheckSourceId>) {
  return checkSources
    .filter((source) => selectedIds.has(source.id))
    .reduce((sum, source) => sum + source.words, 0);
}

export function SettingCheckModalTestPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>('characters');
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [selectedSourceIds, setSelectedSourceIds] = useState<Set<CheckSourceId>>(() => new Set(['outline', 'characters', 'detailOutline']));
  const [selectedFindingId, setSelectedFindingId] = useState(findings[0].id);
  const selectedWords = useMemo(() => countSelectedWords(selectedSourceIds), [selectedSourceIds]);
  const selectedFinding = findings.find((finding) => finding.id === selectedFindingId) ?? findings[0];

  const toggleSource = (sourceId: CheckSourceId) => {
    setSelectedSourceIds((current) => {
      const next = new Set(current);
      if (next.has(sourceId)) next.delete(sourceId);
      else next.add(sourceId);
      return next;
    });
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-slate-50 p-5">
      <header className="mb-4 flex shrink-0 items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900">设定检查弹窗测试</h1>
          <p className="mt-1 text-xs font-bold text-slate-400">
            预览“大纲”改名为“设定”后，在人物设定右侧新增“检查设定”的交互方案。
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex h-9 shrink-0 items-center gap-2 rounded-lg bg-[#08AACE] px-4 text-sm font-black text-white"
        >
          <Search className="h-4 w-4" />
          检查设定
        </button>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[260px_minmax(520px,1fr)_360px] gap-4">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 px-4 py-3">
            <div className="text-sm font-black text-slate-900">设定</div>
            <div className="mt-1 text-xs font-bold text-slate-400">原“大纲”页面命名预览。</div>
          </div>
          <div className="grid grid-cols-2 gap-2 border-b border-slate-100 p-3">
            {[
              ['work', '作品设定'],
              ['characters', '人物设定'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id as SettingTab)}
                className={`h-9 rounded-lg text-sm font-black ${
                  activeTab === id ? 'bg-[#08AACE] text-white' : 'border border-slate-200 bg-white text-slate-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
            {(activeTab === 'characters' ? settingCategories[1] : settingCategories[0]).items.map((item, index) => (
              <button
                key={item}
                type="button"
                className={`mb-2 flex w-full items-center gap-3 rounded-lg border p-3 text-left ${
                  index === 0 ? 'border-[#08AACE] bg-[#F0FBFE]' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-black text-slate-500">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-black text-slate-800">{item}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black text-[#08AACE]">{activeTab === 'characters' ? '人物设定' : '作品设定'}</div>
                <h2 className="mt-1 text-lg font-black text-slate-900">{activeTab === 'characters' ? '男主角' : '世界观'}</h2>
              </div>
              {activeTab === 'characters' && (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="flex h-9 items-center gap-2 rounded-lg border border-[#08AACE]/30 bg-[#EAF9FD] px-3 text-sm font-black text-[#078FAE]"
                >
                  <Search className="h-4 w-4" />
                  检查设定
                </button>
              )}
            </div>
          </div>
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-3 gap-3">
              {['角色名：林刻', '分类：男主角', '状态：存活'].map((field) => (
                <div key={field} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-700">
                  {field}
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4">
              {[
                ['性格', '表面冷静，遇到妹妹相关事件会变得急切；不愿主动暴露底牌。'],
                ['背景', '旧家族幸存者，携带旧徽记进入边境城，暂不清楚家族旧案真相。'],
                ['当前状态', '已进入边境城，旧徽记被检测石响应，正在寻找救命药和城防军账本线索。'],
              ].map(([title, text]) => (
                <section key={title} className="rounded-xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-900">{title}</div>
                  <div className="min-h-24 p-4 text-sm font-semibold leading-7 text-slate-600">{text}</div>
                </section>
              ))}
            </div>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 px-4 py-3">
            <div className="text-sm font-black text-slate-900">检查结果预览</div>
            <div className="mt-1 text-xs font-bold text-slate-400">AI 只给建议，用户确认后才补充设定。</div>
          </div>
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {findings.slice(0, 3).map((finding) => (
                <div key={finding.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className={`rounded-md border px-2 py-0.5 text-[11px] font-black ${findingTypeClass[finding.type]}`}>{finding.type}</span>
                    {finding.strict && <span className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-black text-red-500">硬性</span>}
                  </div>
                  <div className="text-sm font-black text-slate-800">{finding.title}</div>
                  <div className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{finding.reason}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-6">
          <div className="grid h-full max-h-[760px] w-full max-w-[1180px] grid-cols-[300px_minmax(420px,1fr)_360px] overflow-hidden rounded-2xl bg-white shadow-2xl">
            <aside className="flex min-h-0 flex-col border-r border-slate-100 bg-slate-50">
              <div className="shrink-0 border-b border-slate-100 bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-slate-900">关联内容</div>
                    <div className="mt-1 text-xs font-bold text-slate-400">选择本次让 AI 检查的资料。</div>
                  </div>
                  <span className="rounded-lg bg-[#EAF9FD] px-2 py-1 text-xs font-black text-[#078FAE]">{selectedWords}字</span>
                </div>
              </div>
              <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
                <div className="space-y-2">
                  {checkSources.map((source) => {
                    const selected = selectedSourceIds.has(source.id);
                    return (
                      <button
                        key={source.id}
                        type="button"
                        onClick={() => toggleSource(source.id)}
                        className={`w-full rounded-xl border p-3 text-left transition-colors ${
                          selected ? 'border-[#08AACE] bg-[#F0FBFE]' : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`grid h-5 w-5 place-items-center rounded-full border ${selected ? 'border-[#08AACE] bg-[#08AACE] text-white' : 'border-slate-300 bg-white text-transparent'}`}>
                              <Check className="h-3 w-3" />
                            </span>
                            <span className="text-sm font-black text-slate-800">{source.title}</span>
                          </div>
                          {source.recommended && <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-black text-amber-600">推荐</span>}
                        </div>
                        <div className="mt-2 text-xs font-semibold leading-5 text-slate-500">{source.description}</div>
                        <div className="mt-1 text-xs font-bold text-slate-400">{source.words} 字</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            <section className="flex min-h-0 flex-col">
              <div className="shrink-0 border-b border-slate-100 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">检查设定</h2>
                    <p className="mt-1 text-xs font-bold text-slate-400">检查新增人物、道具、势力、地点、规则和状态缺口。</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
                <section className="mb-4 rounded-xl border border-[#08AACE]/20 bg-[#F0FBFE] p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-black text-[#078FAE]">
                    <Sparkles className="h-4 w-4" />
                    AI 检查说明
                  </div>
                  <div className="text-sm font-semibold leading-7 text-slate-600">
                    AI 会对比“正式设定”和“关联内容”，找出正文或章纲里已经出现、但设定库还没有保存的内容。结果只进入待确认列表，用户确认后才写入设定。
                  </div>
                </section>

                <div className="space-y-3">
                  {findings.map((finding) => {
                    const selected = finding.id === selectedFinding.id;
                    return (
                      <button
                        key={finding.id}
                        type="button"
                        onClick={() => setSelectedFindingId(finding.id)}
                        className={`w-full rounded-xl border p-4 text-left transition-colors ${
                          selected ? 'border-[#08AACE] bg-[#F0FBFE] ring-2 ring-[#08AACE]/10' : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`rounded-md border px-2 py-0.5 text-xs font-black ${findingTypeClass[finding.type]}`}>{finding.type}</span>
                            <span className="text-sm font-black text-slate-900">{finding.title}</span>
                          </div>
                          {finding.strict && (
                            <span className="flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-xs font-black text-red-500">
                              <AlertTriangle className="h-3 w-3" />
                              硬性缺口
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-400">{finding.source}</div>
                        <div className="mt-2 text-sm font-semibold leading-6 text-slate-600">{finding.reason}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <aside className="flex min-h-0 flex-col border-l border-slate-100 bg-white">
              <div className="shrink-0 border-b border-slate-100 px-4 py-3">
                <div className="text-sm font-black text-slate-900">补充预览</div>
                <div className="mt-1 text-xs font-bold text-slate-400">用户确认后写入目标库。</div>
              </div>
              <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
                <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className={`rounded-md border px-2 py-0.5 text-xs font-black ${findingTypeClass[selectedFinding.type]}`}>{selectedFinding.type}</span>
                    {selectedFinding.strict && <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-black text-red-500">必须处理</span>}
                  </div>
                  <div className="text-base font-black text-slate-900">{selectedFinding.title}</div>
                  <div className="mt-3 text-xs font-black text-slate-400">目标位置</div>
                  <div className="mt-1 text-sm font-semibold leading-6 text-slate-600">{selectedFinding.target}</div>
                  <div className="mt-3 text-xs font-black text-slate-400">建议内容</div>
                  <div className="mt-1 rounded-lg bg-white p-3 text-sm font-semibold leading-6 text-slate-600">{selectedFinding.suggestion}</div>
                </section>

                <section className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-black text-amber-700">
                    <ShieldCheck className="h-4 w-4" />
                    严谨规则
                  </div>
                  <div className="space-y-2 text-xs font-semibold leading-5 text-amber-700">
                    <p>硬性缺口必须处理，否则正文审核不能通过。</p>
                    <p>临时人物可以标记临时，但会在发布前再次检查。</p>
                    <p>AI 不直接写入正式库，用户确认后才补充。</p>
                  </div>
                </section>
              </div>

              <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-slate-100 p-4">
                <button type="button" className="flex h-9 items-center justify-center gap-1 rounded-lg bg-[#08AACE] text-sm font-black text-white">
                  <Plus className="h-4 w-4" />
                  补充设定
                </button>
                <button type="button" className="h-9 rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-500">标记临时</button>
                <button type="button" className="h-9 rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-500">忽略一次</button>
                <button type="button" className="h-9 rounded-lg border border-red-200 bg-red-50 text-sm font-black text-red-600">打回修改</button>
              </footer>
            </aside>
          </div>
        </div>
      )}

      <footer className="mt-4 grid shrink-0 grid-cols-4 gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-500">
        <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-[#08AACE]" />设定页替代大纲命名</div>
        <div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-[#08AACE]" />人物设定右侧检查</div>
        <div className="flex items-center gap-2"><Link2 className="h-4 w-4 text-[#08AACE]" />弹窗关联多类内容</div>
        <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#08AACE]" />确认后补充正式设定</div>
      </footer>
    </div>
  );
}
