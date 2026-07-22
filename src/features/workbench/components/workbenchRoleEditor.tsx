import { useEffect, useMemo, useState } from 'react';

import type { SettingFieldUpdatePolicy } from '@/features/workbench/model/workbenchSettingStatus';
import { getSettingFieldPolicy } from '@/features/workbench/model/workbenchSettingStatus';
import { selectWorkbenchSettingStatusField } from '@/features/workbench/model/workbenchSettingStatusSelection';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { isMaleProtagonistRoleType } from '@/features/workbench/model/workbenchRoleTypes';

import { WorkbenchHeaderSelect } from './WorkbenchHeaderSelect';
import { WorkbenchNameField } from './WorkbenchNameField';
import { WorkbenchSurvivalStatusToggle } from './WorkbenchSurvivalStatusToggle';
import {
  buildRoleStateSettingsText,
  getRoleBaseSetting,
  getRoleStateSettings,
  getRoleStateUpdateChapters,
  getRoleStateUpdateLabel,
  parseRoleBaseSettingFields,
  stringifyRoleBaseSettingFields,
  type RoleContent,
} from './workbenchRoleContent';
import { getRoleIdentityTypeOptions } from './workbenchRoleIdentityOptions';
import {
  ROLE_BASE_SETTING_FIELD_DEFINITIONS,
  ROLE_STATE_FIELD_DEFINITIONS,
  type RoleBaseSettingFieldKey,
  type RoleStateFieldKey,
} from './workbenchRoleSettingFields';

const BASE_FIELD_GROUPS: Array<{ title: string; keys: RoleBaseSettingFieldKey[] }> = [
  { title: '外貌与称号', keys: ['appearance', 'aliasName'] },
  { title: '性格与背景', keys: ['corePersonality', 'background'] },
  { title: '能力与限制', keys: ['abilityRules'] },
];

const policyClasses: Record<SettingFieldUpdatePolicy, string> = {
  锁定: 'bg-slate-100 text-slate-500',
  谨慎更新: 'bg-violet-50 text-violet-600',
  变化时检测: 'bg-sky-50 text-sky-600',
  每章检测: 'bg-emerald-50 text-emerald-600',
  关键变化: 'bg-amber-50 text-amber-700',
};

type RoleBaseStateEditorProps = {
  entry: WorkbenchLibraryEntry;
  role: RoleContent;
  roleEntries: WorkbenchLibraryEntry[];
  roleTypeOptions: string[];
  roleTextFontSize: number;
  currentChapterNumber?: number | null;
  roleLifeStatus: '存活' | '死亡' | undefined;
  onTitleChange: (title: string) => void;
  onRoleChange: (updates: Partial<RoleContent>) => void;
  onOpenStatus?: () => void;
};

export function RoleBaseStateEditor({
  entry,
  role,
  roleTypeOptions,
  roleTextFontSize,
  currentChapterNumber,
  roleLifeStatus,
  onTitleChange,
  onRoleChange,
  onOpenStatus,
}: RoleBaseStateEditorProps) {
  const baseSetting = getRoleBaseSetting(role);
  const parsedBaseSettingFields = useMemo(() => parseRoleBaseSettingFields(baseSetting), [baseSetting]);
  const [baseSettingFieldDrafts, setBaseSettingFieldDrafts] = useState(parsedBaseSettingFields);
  const stateSettings = getRoleStateSettings(role);
  const stateUpdateChapters = getRoleStateUpdateChapters(role);
  const roleIdentityTypeOptions = getRoleIdentityTypeOptions(roleTypeOptions);
  const showRoleIdentityControls = !isMaleProtagonistRoleType(role.type);
  const pendingKeys = new Set((role.pendingStatusUpdates ?? []).map((update) => update.fieldKey));

  useEffect(() => {
    setBaseSettingFieldDrafts(parsedBaseSettingFields);
  }, [parsedBaseSettingFields]);

  const updateRoleBaseSettingField = (key: RoleBaseSettingFieldKey, value: string) => {
    const nextFields = { ...baseSettingFieldDrafts, [key]: value };
    setBaseSettingFieldDrafts(nextFields);
    const nextBaseSetting = stringifyRoleBaseSettingFields(nextFields);
    onRoleChange({ baseSetting: nextBaseSetting, background: nextBaseSetting, personality: '' });
  };

  const updateStateField = (key: RoleStateFieldKey, value: string) => {
    const nextStateSettings = { ...stateSettings, [key]: value };
    onRoleChange({
      stateSettings: nextStateSettings,
      stateUpdateChapters: currentChapterNumber ? { ...stateUpdateChapters, [key]: currentChapterNumber } : stateUpdateChapters,
      status: buildRoleStateSettingsText(nextStateSettings),
    });
  };

  const updateRelationshipState = (value: string) => {
    onRoleChange({
      relationship: value,
      stateUpdateChapters: currentChapterNumber
        ? { ...stateUpdateChapters, relationshipState: currentChapterNumber }
        : stateUpdateChapters,
    });
  };

  const openFieldStatus = (fieldKey: string, fieldLabel: string) => {
    selectWorkbenchSettingStatusField({ entryId: entry.id, fieldKey, fieldLabel });
    onOpenStatus?.();
  };

  const renderFieldCard = (options: {
    key: string;
    label: string;
    value: string;
    placeholder: string;
    updateLabel: string;
    onChange: (value: string) => void;
  }) => {
    const policy = getSettingFieldPolicy(role.fieldUpdatePolicies, options.key, options.label);
    return (
      <article key={options.key} className="relative flex min-h-[150px] flex-col rounded-[22px] border-2 border-slate-950 bg-white p-4 pt-5">
        <div className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950">{options.label}</div>
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          {pendingKeys.has(options.key) ? <span className="rounded-md bg-red-50 px-2 py-1 text-[9px] font-black text-red-600">待确认</span> : null}
          <span className={`rounded-md px-2 py-1 text-[9px] font-black ${policyClasses[policy]}`}>{policy}</span>
        </div>
        <textarea data-no-modal-drag="true" value={options.value} onChange={(event) => options.onChange(event.target.value)} placeholder={options.placeholder} className="editor-scrollbar mt-6 min-h-[76px] flex-1 resize-none bg-transparent text-sm leading-7 text-slate-700 outline-none placeholder:text-slate-400" style={{ fontSize: roleTextFontSize }} />
        <div className="mt-2 flex items-center justify-between gap-3 text-[10px] font-bold text-slate-400">
          <span>{options.updateLabel}</span>
          <button type="button" onClick={() => openFieldStatus(options.key, options.label)} className="font-black text-[#078fb0]">查看轨迹 →</button>
        </div>
      </article>
    );
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-white">
      <div className="xy-setting-name-editor flex min-h-0 flex-1 flex-col px-5 py-3">
        <header className="shrink-0 space-y-3">
          <div className="flex min-h-[48px] flex-wrap items-start gap-3">
            <WorkbenchNameField label="人物姓名" value={entry.title} onValueChange={onTitleChange} placeholder="填写人物姓名" />
            {showRoleIdentityControls ? (
              <WorkbenchHeaderSelect label="身份定位" width={180} value={role.type} onChange={(value) => onRoleChange({ type: value })} options={roleIdentityTypeOptions} />
            ) : <div aria-hidden="true" className="h-[48px] min-w-[180px] shrink-0" />}
            {showRoleIdentityControls ? <WorkbenchSurvivalStatusToggle value={roleLifeStatus ?? '存活'} onChange={(lifeStatus) => onRoleChange({ lifeStatus })} /> : null}
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <p className="text-xs font-black text-slate-600">当前设定完整显示 · 每个字段独立控制更新规则</p>
            <p className="shrink-0 text-xs font-black text-slate-400">{currentChapterNumber ? `当前编辑：第${currentChapterNumber}章` : '未选择章节'} · 待确认 {(role.pendingStatusUpdates ?? []).length}</p>
          </div>
        </header>
        <section className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-1 pb-1 pr-2 pt-4">
          <div className="space-y-6">
            {BASE_FIELD_GROUPS.map((group) => (
              <section key={group.title}>
                <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black text-slate-900">{group.title}</h2><span className="text-[10px] font-bold text-slate-400">{group.keys.length}个字段</span></div>
                <div className="grid grid-cols-2 gap-3">
                  {group.keys.map((key) => {
                    const field = ROLE_BASE_SETTING_FIELD_DEFINITIONS.find((item) => item.key === key)!;
                    return renderFieldCard({ key, label: field.title, value: baseSettingFieldDrafts[key], placeholder: field.placeholder, updateLabel: '设定字段 · 保留历史', onChange: (value) => updateRoleBaseSettingField(key, value) });
                  })}
                </div>
              </section>
            ))}
            <section>
              <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black text-slate-900">当前状态</h2><span className="text-[10px] font-bold text-slate-400">{ROLE_STATE_FIELD_DEFINITIONS.length + 1}个字段</span></div>
              <div className="grid grid-cols-2 gap-3">
                {renderFieldCard({ key: 'relationshipState', label: '人物关系', value: role.relationship, placeholder: '记录与主角、阵营、亲友、敌人、师徒、利益对象的关系。', updateLabel: getRoleStateUpdateLabel(stateUpdateChapters.relationshipState), onChange: updateRelationshipState })}
                {ROLE_STATE_FIELD_DEFINITIONS.map((field) => renderFieldCard({ key: field.key, label: field.title, value: stateSettings[field.key], placeholder: `记录${field.title}`, updateLabel: getRoleStateUpdateLabel(stateUpdateChapters[field.key]), onChange: (value) => updateStateField(field.key, value) }))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
