import { useState } from 'react';

import { StatusAiPanel } from './PostAuditStatusUpdateAiPanel';
import {
  StatusChapterNavigation,
  StatusOriginalColumn,
  StatusResultColumn,
} from './PostAuditStatusUpdateTestPanels';
import {
  STATUS_TEST_CHANGES,
  STATUS_TEST_DISCOVERED,
  type NewSettingDecision,
  type StatusChangeDecision,
} from './postAuditStatusUpdateTestData';

export function PostAuditStatusUpdateTestPage() {
  const [linkedIds, setLinkedIds] = useState<Set<string>>(() => new Set());
  const [changeDecisions, setChangeDecisions] = useState<Record<string, StatusChangeDecision>>({});
  const [newSettingDecisions, setNewSettingDecisions] = useState<Record<string, NewSettingDecision>>({});
  const [writtenIds, setWrittenIds] = useState<Set<string>>(() => new Set());
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);
  const [hasRun, setHasRun] = useState(false);

  const toggleLinked = (id: string) => {
    setLinkedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startAnalysis = () => {
    const matchedIds = new Set<string>(
      STATUS_TEST_DISCOVERED.flatMap((candidate) => (candidate.settingId ? [candidate.settingId] : [])),
    );
    const availableChanges = STATUS_TEST_CHANGES.filter((change) => matchedIds.has(change.targetId));
    setLinkedIds(matchedIds);
    setChangeDecisions(Object.fromEntries(availableChanges.map((change) => [change.id, 'pending'])));
    setNewSettingDecisions(
      Object.fromEntries(
        STATUS_TEST_DISCOVERED.filter((candidate) => !candidate.settingId).map((candidate) => [candidate.name, 'pending']),
      ),
    );
    setWrittenIds(new Set());
    setActiveParagraph(null);
    setHasRun(true);
  };

  const decideChange = (id: string, decision: StatusChangeDecision) => {
    setChangeDecisions((current) => ({ ...current, [id]: decision }));
  };

  const confirmAllChanges = () => {
    setChangeDecisions((current) =>
      Object.fromEntries(Object.keys(current).map((id) => [id, 'confirmed' as const])),
    );
  };

  const writeConfirmed = () => {
    const confirmedIds = Object.entries(changeDecisions)
      .filter(([, decision]) => decision === 'confirmed')
      .map(([id]) => id);
    setWrittenIds((current) => new Set([...current, ...confirmedIds]));
  };

  return (
    <div className="flex h-full min-h-[680px] flex-col bg-slate-50 text-slate-700">
      <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900">第12章 · 状态更新工作台</h1>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-black text-emerald-600">剧情审核 通过</span>
            </div>
            <p className="mt-1 text-xs font-bold text-slate-400">章节导航｜原文｜状态更新结果｜AI面板</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-black">
            <span className={`rounded-lg px-3 py-1.5 ${hasRun ? 'bg-emerald-500 text-white' : 'bg-[#08AACE] text-white'}`}>1 发现正文对象</span>
            <span className={`rounded-lg px-3 py-1.5 ${hasRun ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>2 查询并关联设定</span>
            <span className={`rounded-lg px-3 py-1.5 ${writtenIds.size > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>3 写入设定</span>
          </div>
        </div>
      </header>

      <div className="editor-scrollbar min-h-0 flex-1 overflow-x-auto">
        <div
          data-testid="status-four-column-workbench"
          className="grid h-full min-h-[620px] min-w-[1100px] grid-cols-[170px_300px_minmax(350px,1fr)_280px]"
        >
          <StatusChapterNavigation />
          <StatusOriginalColumn activeParagraph={activeParagraph} onSelectParagraph={setActiveParagraph} />
          <StatusResultColumn
            hasRun={hasRun}
            linkedIds={linkedIds}
            changeDecisions={changeDecisions}
            writtenIds={writtenIds}
            onDecideChange={decideChange}
            onConfirmAll={confirmAllChanges}
            onShowEvidence={setActiveParagraph}
            onWriteConfirmed={writeConfirmed}
          />
          <StatusAiPanel
            linkedIds={linkedIds}
            hasRun={hasRun}
            newSettingDecisions={newSettingDecisions}
            onToggleLinked={toggleLinked}
            onDecideNewSetting={(name, decision) =>
              setNewSettingDecisions((current) => ({ ...current, [name]: decision }))
            }
            onStart={startAnalysis}
          />
        </div>
      </div>
    </div>
  );
}
