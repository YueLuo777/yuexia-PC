import { useMemo, useState } from 'react';

import {
  FusionCurrentSetting,
  FusionRightPanel,
  FusionSettingDirectory,
  type FusionRightTab,
} from './SettingStatusFusionTestPanels';
import {
  FUSION_HISTORY,
  FUSION_PENDING_UPDATES,
  FUSION_SETTINGS,
  type PendingSettingUpdate,
  type SettingHistoryEvent,
} from './settingStatusFusionTestData';

type UpdateDecision = 'confirmed' | 'ignored';

export function SettingStatusFusionTestPage() {
  const [selectedSettingId, setSelectedSettingId] = useState('lin-yue');
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<FusionRightTab>('status');
  const [valueOverrides, setValueOverrides] = useState<Record<string, string>>({});
  const [updateDecisions, setUpdateDecisions] = useState<Record<string, UpdateDecision>>({});
  const [confirmedHistory, setConfirmedHistory] = useState<SettingHistoryEvent[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<SettingHistoryEvent | PendingSettingUpdate | null>(null);

  const selectedSetting = FUSION_SETTINGS.find((setting) => setting.id === selectedSettingId) ?? FUSION_SETTINGS[0];
  const pendingUpdates = useMemo(
    () => FUSION_PENDING_UPDATES.filter(
      (update) => update.settingId === selectedSetting.id && !updateDecisions[update.id],
    ),
    [selectedSetting.id, updateDecisions],
  );
  const settingHistory = useMemo(
    () => [...confirmedHistory, ...FUSION_HISTORY].filter((event) => event.settingId === selectedSetting.id),
    [confirmedHistory, selectedSetting.id],
  );

  const selectSetting = (settingId: string) => {
    setSelectedSettingId(settingId);
    setActiveFieldKey(null);
    setSelectedEvidence(null);
  };

  const confirmUpdate = (update: PendingSettingUpdate) => {
    const confirmedEvent: SettingHistoryEvent = {
      ...update,
      confirmedAt: '刚刚由用户确认',
    };
    setValueOverrides((current) => ({
      ...current,
      [`${update.settingId}:${update.fieldKey}`]: update.after,
    }));
    setUpdateDecisions((current) => ({ ...current, [update.id]: 'confirmed' }));
    setConfirmedHistory((current) => [confirmedEvent, ...current]);
    setSelectedEvidence(confirmedEvent);
  };

  const ignoreUpdate = (update: PendingSettingUpdate) => {
    setUpdateDecisions((current) => ({ ...current, [update.id]: 'ignored' }));
    if (selectedEvidence?.id === update.id) setSelectedEvidence(null);
  };

  return (
    <div className="flex h-full min-h-[680px] flex-col bg-slate-50 text-slate-700">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-slate-950">设定与状态融合工作台</h1>
            <span className="rounded-full bg-[#EAF9FD] px-2 py-0.5 text-[10px] font-black text-[#078fb0]">当前设定始终可见</span>
          </div>
          <p className="mt-1 text-xs font-bold text-slate-400">字段不再硬分基础/状态 · 每个字段独立设置更新规则 · 历史与依据留在同一页</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black">
          <span className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-600">自动匹配设定</span>
          <span className="rounded-lg bg-amber-50 px-3 py-2 text-amber-700">待确认 {FUSION_PENDING_UPDATES.filter((update) => !updateDecisions[update.id]).length}</span>
          <span className="rounded-lg bg-sky-50 px-3 py-2 text-sky-600">字段级历史</span>
        </div>
      </header>
      <div className="editor-scrollbar min-h-0 flex-1 overflow-x-auto">
        <div data-testid="setting-status-fusion-workbench" className="grid h-full min-h-[620px] min-w-[1120px] grid-cols-[220px_minmax(520px,1fr)_340px]">
          <FusionSettingDirectory selectedSettingId={selectedSetting.id} onSelectSetting={selectSetting} />
          <FusionCurrentSetting
            setting={selectedSetting}
            valueOverrides={valueOverrides}
            pendingUpdates={pendingUpdates}
            activeFieldKey={activeFieldKey}
            onSelectField={(fieldKey) => {
              setActiveFieldKey(fieldKey);
              setRightTab('status');
              setSelectedEvidence(null);
            }}
          />
          <FusionRightPanel
            activeTab={rightTab}
            setting={selectedSetting}
            pendingUpdates={pendingUpdates}
            history={settingHistory}
            activeFieldKey={activeFieldKey}
            selectedEvidence={selectedEvidence}
            onChangeTab={setRightTab}
            onSelectEvidence={setSelectedEvidence}
            onConfirm={confirmUpdate}
            onIgnore={ignoreUpdate}
          />
        </div>
      </div>
    </div>
  );
}
