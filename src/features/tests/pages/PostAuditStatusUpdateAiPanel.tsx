import { Bot, ChevronDown, Link2, Play, Search, Settings2 } from 'lucide-react';
import { useState } from 'react';

import { AssociationSelectionBox } from '@/features/workbench/components/AssociationReaderItemRow';

import {
  STATUS_TEST_DISCOVERED,
  STATUS_TEST_SETTINGS,
  type NewSettingDecision,
} from './postAuditStatusUpdateTestData';

type StatusAiPanelProps = {
  linkedIds: Set<string>;
  hasRun: boolean;
  newSettingDecisions: Record<string, NewSettingDecision>;
  onToggleLinked: (id: string) => void;
  onDecideNewSetting: (name: string, decision: NewSettingDecision) => void;
  onStart: () => void;
};

type PanelTab = 'setting' | 'status';

export function StatusAiPanel({
  linkedIds,
  hasRun,
  newSettingDecisions,
  onToggleLinked,
  onDecideNewSetting,
  onStart,
}: StatusAiPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('status');
  const matchedSettings = STATUS_TEST_DISCOVERED.flatMap((candidate) => {
    if (!candidate.settingId) return [];
    const setting = STATUS_TEST_SETTINGS.find((item) => item.id === candidate.settingId);
    return setting ? [{ ...setting, clue: candidate.clue }] : [];
  });
  const groupedSettings = Array.from(
    matchedSettings.reduce((groups, setting) => {
      const entries = groups.get(setting.group) ?? [];
      entries.push(setting);
      groups.set(setting.group, entries);
      return groups;
    }, new Map<string, typeof matchedSettings>()),
  );
  const unmatched = STATUS_TEST_DISCOVERED.filter((candidate) => !candidate.settingId);
  const pendingCandidates = unmatched.filter(
    (candidate) => (newSettingDecisions[candidate.name] ?? 'pending') === 'pending',
  );
  const createCandidates = unmatched.filter(
    (candidate) => newSettingDecisions[candidate.name] === 'create',
  );

  const startAnalysis = () => {
    onStart();
    setActiveTab('setting');
  };

  return (
    <aside className="flex min-h-0 flex-col bg-white p-3">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-[#08AACE]" />
        <h2 className="text-sm font-black text-slate-900">AI状态更新</h2>
      </div>
      <div className="mt-3 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('setting')}
          className={`h-8 rounded-lg text-xs font-black ${activeTab === 'setting' ? 'bg-white text-[#078fb0] shadow-sm' : 'text-slate-500'}`}
        >
          设定{hasRun ? ` · ${matchedSettings.length + unmatched.length}` : ''}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('status')}
          className={`h-8 rounded-lg text-xs font-black ${activeTab === 'status' ? 'bg-white text-[#078fb0] shadow-sm' : 'text-slate-500'}`}
        >
          状态{hasRun ? ' · 5' : ''}
        </button>
      </div>

      {activeTab === 'status' ? (
        <StatusAnalysisTab hasRun={hasRun} onStart={startAnalysis} />
      ) : (
        <SettingMatchTab
          hasRun={hasRun}
          linkedIds={linkedIds}
          groupedSettings={groupedSettings}
          pendingCandidates={pendingCandidates}
          createCandidates={createCandidates}
          onToggleLinked={onToggleLinked}
          onDecideNewSetting={onDecideNewSetting}
          onStart={startAnalysis}
        />
      )}
    </aside>
  );
}

function StatusAnalysisTab({ hasRun, onStart }: { hasRun: boolean; onStart: () => void }) {
  return (
    <>
      <div className="mt-3 space-y-2">
        <button type="button" className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-700">
          <span>模型 · DeepSeek V3</span><ChevronDown className="h-4 w-4" />
        </button>
        <button type="button" className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-700">
          <span>提示词 · 更新状态</span><ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50 p-3 text-[10px] font-bold leading-5 text-sky-700">
        <Search className="mr-1 inline h-3.5 w-3.5" />AI自动扫描正文，再查询设定库；用户不必预先手动关联，只需处理疑似匹配和新对象。
      </div>
      <div className="mt-3 flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <h3 className="text-xs font-black text-slate-900">自动处理流程</h3>
        <ol className="mt-3 space-y-3 text-[10px] font-bold leading-5 text-slate-500">
          <li><strong className="text-[#078fb0]">1. 识别</strong>　从正文找人物、道具、地点、称号与伏笔</li>
          <li><strong className="text-[#078fb0]">2. 查询</strong>　按名称、别名和类型匹配现有设定</li>
          <li><strong className="text-[#078fb0]">3. 确认</strong>　有歧义或未匹配项交给用户决定</li>
          <li><strong className="text-[#078fb0]">4. 写入</strong>　仅写入用户已经确认的状态变化</li>
        </ol>
      </div>
      <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50 p-3 text-[10px] font-bold leading-5 text-sky-700">
        <Settings2 className="mr-1 inline h-3.5 w-3.5" />发送内容：当前章节正文＋自动匹配到的状态设定。
      </div>
      {hasRun ? <div className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-center text-[11px] font-black text-emerald-600">AI状态分析已完成</div> : null}
      <button type="button" onClick={onStart} className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#08AACE] text-sm font-black text-white hover:bg-[#0798b8]">
        <Play className="h-4 w-4" />{hasRun ? '重新智能分析' : '开始智能分析'}
      </button>
    </>
  );
}

type SettingMatchTabProps = {
  hasRun: boolean;
  linkedIds: Set<string>;
  groupedSettings: Array<[string, Array<{ id: string; name: string; group: string; status: string; clue: string }>] >;
  pendingCandidates: typeof STATUS_TEST_DISCOVERED[number][];
  createCandidates: typeof STATUS_TEST_DISCOVERED[number][];
  onToggleLinked: (id: string) => void;
  onDecideNewSetting: (name: string, decision: NewSettingDecision) => void;
  onStart: () => void;
};

function SettingMatchTab({
  hasRun,
  linkedIds,
  groupedSettings,
  pendingCandidates,
  createCandidates,
  onToggleLinked,
  onDecideNewSetting,
  onStart,
}: SettingMatchTabProps) {
  if (!hasRun) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-8 text-center text-[11px] font-bold leading-5 text-slate-400">分析后，这里会优先显示未匹配对象和待新建设定。</div>
        <button type="button" onClick={onStart} className="mt-auto flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#08AACE] text-sm font-black text-white"><Play className="h-4 w-4" />开始智能分析</button>
      </div>
    );
  }

  return (
    <div className="editor-scrollbar mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
      <div className="grid grid-cols-3 gap-1 text-center text-[9px] font-black">
        <span className="rounded-md bg-sky-50 px-1 py-1.5 text-sky-600">已匹配 {linkedIds.size}</span>
        <span className="rounded-md bg-amber-50 px-1 py-1.5 text-amber-600">未匹配 {pendingCandidates.length}</span>
        <span className="rounded-md bg-emerald-50 px-1 py-1.5 text-emerald-600">待新建 {createCandidates.length}</span>
      </div>

      <CandidateSection
        title={`未匹配对象 · ${pendingCandidates.length}`}
        tone="pending"
        candidates={pendingCandidates}
        onDecide={onDecideNewSetting}
      />
      <CandidateSection
        title={`待新建设定 · ${createCandidates.length}`}
        tone="create"
        candidates={createCandidates}
        onDecide={onDecideNewSetting}
      />

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-black text-slate-900"><Link2 className="h-4 w-4 text-[#08AACE]" />自动匹配设定</span>
        <span className="text-[10px] font-black text-slate-400">仅需纠错</span>
      </div>
      {groupedSettings.map(([group, settings]) => (
        <section key={group}>
          <div className="mb-1 flex items-center justify-between text-[10px] font-black text-slate-500"><span>{group}</span><span>{settings.length}项</span></div>
          <div className="space-y-1.5">
            {settings.map((setting) => {
              const checked = linkedIds.has(setting.id);
              return (
                <div key={setting.id} className={`flex items-start gap-2 rounded-lg border p-2 ${checked ? 'border-[#9BEFFC] bg-[#F8FEFF]' : 'border-slate-200 bg-slate-50 opacity-65'}`}>
                  <div className="min-w-0 flex-1"><strong className="block truncate text-[11px] text-slate-900">{setting.name}</strong><span className="mt-0.5 block line-clamp-2 text-[9px] font-bold leading-4 text-slate-500">发现：{setting.clue}<br />原状态：{setting.status}</span></div>
                  <AssociationSelectionBox checked={checked} label={`${checked ? '取消关联' : '关联'}${setting.name}`} onToggle={() => onToggleLinked(setting.id)} />
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function CandidateSection({
  title,
  tone,
  candidates,
  onDecide,
}: {
  title: string;
  tone: 'pending' | 'create';
  candidates: typeof STATUS_TEST_DISCOVERED[number][];
  onDecide: (name: string, decision: NewSettingDecision) => void;
}) {
  const isCreate = tone === 'create';
  return (
    <section className={`rounded-xl border p-2 ${isCreate ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
      <div className={`text-[10px] font-black ${isCreate ? 'text-emerald-700' : 'text-amber-700'}`}>{title}</div>
      {candidates.length === 0 ? (
        <div className="mt-2 rounded-lg border border-dashed border-current/20 px-2 py-3 text-center text-[9px] font-bold opacity-60">暂无内容</div>
      ) : candidates.map((candidate) => (
        <div key={candidate.name} className="mt-2 rounded-lg bg-white p-2 text-[9px] font-bold text-slate-600 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span>{candidate.kind} · {candidate.name}</span>
            <span className={isCreate ? 'text-emerald-600' : 'text-amber-700'}>{isCreate ? '等待创建' : '需要决定'}</span>
          </div>
          <p className="mt-1 leading-4 text-slate-400">{candidate.clue}</p>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            {isCreate ? <span className="text-[9px] text-emerald-600">建议分类：{candidate.kind === '人物' ? '人物设定' : '伏笔线索'}</span> : <span />}
            <div className="flex gap-1.5">
              <button type="button" onClick={() => onDecide(candidate.name, isCreate ? 'pending' : 'ignored')} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[9px] font-black text-slate-500">{isCreate ? '撤销' : '忽略'}</button>
              {!isCreate ? <button type="button" onClick={() => onDecide(candidate.name, 'create')} className="rounded-md bg-amber-500 px-2 py-1 text-[9px] font-black text-white">新建设定</button> : null}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
