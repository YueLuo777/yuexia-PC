import { useEffect, useMemo, useState } from 'react';

import {
  canCreateWorkbenchRoleInType,
  isMaleProtagonistRoleType,
  normalizeWorkbenchRoleType,
} from '@/features/workbench/model/workbenchRoleTypes';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { CapsuleSelect } from '@/shared/ui/CapsuleSelect';

import {
  buildRoleStateSettingsText,
  getRoleBaseSetting,
  getRoleStateSettings,
  getRoleStateUpdateChapters,
  getRoleStateUpdateLabel,
  parseRoleBaseSettingFields,
  parseRoleContent,
  stringifyRoleBaseSettingFields,
  type RoleContent,
} from './workbenchRoleContent';
import {
  ROLE_BASE_SETTING_FIELD_DEFINITIONS,
  ROLE_STATE_FIELD_DEFINITIONS,
  type RoleBaseSettingFieldKey,
  type RoleStateFieldKey,
} from './workbenchRoleSettingFields';
import { SettingSegmentedTabs } from './workbenchSettingSegmentedTabs';

function countTextWords(content: string) {
  return content.replace(/\s/g, '').length;
}

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
};

export function RoleBaseStateEditor({
  entry,
  role,
  roleEntries,
  roleTypeOptions,
  roleTextFontSize,
  currentChapterNumber,
  roleLifeStatus,
  onTitleChange,
  onRoleChange,
}: RoleBaseStateEditorProps) {
  const baseSetting = getRoleBaseSetting(role);
  const parsedBaseSettingFields = useMemo(() => parseRoleBaseSettingFields(baseSetting), [baseSetting]);
  const [baseSettingFieldDrafts, setBaseSettingFieldDrafts] = useState(parsedBaseSettingFields);
  const stateSettings = getRoleStateSettings(role);
  const stateUpdateChapters = getRoleStateUpdateChapters(role);
  const relationshipWords = countTextWords(role.relationship);
  const relationshipUpdateLabel = getRoleStateUpdateLabel(stateUpdateChapters.relationshipState);
  const stateWords = countTextWords(buildRoleStateSettingsText(stateSettings)) + relationshipWords;
  const roleIsMaleProtagonist = isMaleProtagonistRoleType(role.type);
  const showRoleIdentityControls = !roleIsMaleProtagonist;
  const currentChapterLabel = currentChapterNumber ? `当前编辑：第${currentChapterNumber}章` : '当前编辑：未选择章节';
  const roleSettingTabs = ['基础设定', '状态设定', '未确认'] as const;
  const [activeRoleSettingTab, setActiveRoleSettingTab] = useState<(typeof roleSettingTabs)[number]>('基础设定');
  const [autoConfirmRoleState, setAutoConfirmRoleState] = useState(false);
  const pendingRoleStateUpdates = [
    {
      title: '人物关系',
      beforeTitle: '人物关系未更新前',
      afterTitle: '人物关系更新后',
      beforeValue: role.relationship.trim() || '暂无已确认人物关系。',
      afterValue: '正文中出现新的关系变化，建议写入人物关系。',
    },
    {
      title: '资源状态',
      beforeTitle: '资源状态未更新前',
      afterTitle: '资源状态更新后',
      beforeValue: stateSettings.resourceState.trim() || '暂无已确认资源状态。',
      afterValue: '正文中出现资源得失，建议写入资源状态。',
    },
    {
      title: '当前目标',
      beforeTitle: '当前目标未更新前',
      afterTitle: '当前目标更新后',
      beforeValue: stateSettings.currentGoal.trim() || '暂无已确认当前目标。',
      afterValue: '角色目标可能发生变化，建议写入当前目标。',
    },
  ];
  const contentGridClassName = 'grid min-h-full grid-cols-2 auto-rows-fr gap-3';

  useEffect(() => {
    setBaseSettingFieldDrafts(parsedBaseSettingFields);
  }, [parsedBaseSettingFields]);

  const updateRoleBaseSettingField = (key: RoleBaseSettingFieldKey, value: string) => {
    const nextFields = {
      ...baseSettingFieldDrafts,
      [key]: value,
    };
    setBaseSettingFieldDrafts(nextFields);
    const nextBaseSetting = stringifyRoleBaseSettingFields(nextFields);
    onRoleChange({
      baseSetting: nextBaseSetting,
      background: nextBaseSetting,
      personality: '',
    });
  };

  const updateStateField = (key: RoleStateFieldKey, value: string) => {
    const nextStateSettings = {
      ...stateSettings,
      [key]: value,
    };
    const nextStateUpdateChapters = currentChapterNumber
      ? {
          ...stateUpdateChapters,
          [key]: currentChapterNumber,
        }
      : stateUpdateChapters;
    onRoleChange({
      stateSettings: nextStateSettings,
      stateUpdateChapters: nextStateUpdateChapters,
      status: buildRoleStateSettingsText(nextStateSettings),
    });
  };

  const updateRelationshipState = (value: string) => {
    const nextStateUpdateChapters = currentChapterNumber
      ? {
          ...stateUpdateChapters,
          relationshipState: currentChapterNumber,
        }
      : stateUpdateChapters;
    onRoleChange({
      relationship: value,
      stateUpdateChapters: nextStateUpdateChapters,
    });
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-white">
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 py-3">
        <header className="shrink-0 border-b border-slate-200 pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <div className="xy-floating-field xy-floating-outline-fixed xy-role-name-embedded-field h-[48px] w-[148px] shrink-0">
                  <label className="xy-floating-title-count xy-role-name-embedded-label">
                    人物姓名
                  </label>
                  <input
                    aria-label="人物姓名"
                    value={entry.title}
                    onChange={(event) => onTitleChange(event.target.value)}
                    placeholder="填写人物姓名"
                    className="h-6 w-full bg-transparent text-[17px] font-medium leading-6 text-slate-950 outline-none placeholder:text-slate-400"
                  />
                </div>
                {showRoleIdentityControls ? (
                  <CapsuleSelect
                    floatingLabel="身份定位"
                    className="xy-capsule-fill min-w-[168px]"
                    value={role.type}
                    onChange={(value) => onRoleChange({ type: value })}
                    options={roleTypeOptions.map((type) => ({
                      value: type,
                      label: type,
                      disabled:
                        role.type !== '男主角' &&
                        normalizeWorkbenchRoleType(type) === '男主角' &&
                        !canCreateWorkbenchRoleInType(
                          roleEntries
                            .filter((item) => item.id !== entry.id)
                            .map((item) => parseRoleContent(item.content).type),
                          type,
                        ),
                    }))}
                    buttonClassName="h-[42px] px-3 text-sm"
                  />
                ) : (
                  <div aria-hidden="true" className="h-[42px] min-w-[168px] shrink-0" />
                )}
              </div>
            </div>
            {showRoleIdentityControls ? (
              <div className="inline-flex h-9 w-[112px] shrink-0 rounded-[18px] bg-slate-100 p-1">
                {(['存活', '死亡'] as const).map((status) => {
                  const active = roleLifeStatus === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => onRoleChange({ lifeStatus: status })}
                      className={`flex-1 rounded-2xl text-xs font-black transition-colors ${
                        active ? 'bg-white text-[#08AACE] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div aria-hidden="true" className="h-9 w-[112px] shrink-0" />
            )}
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 overflow-x-auto pb-1">
            <SettingSegmentedTabs
              tabs={roleSettingTabs}
              activeTab={activeRoleSettingTab}
              onChange={setActiveRoleSettingTab}
            />
            {activeRoleSettingTab === '未确认' ? (
              <div className="flex shrink-0 items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-1.5">
                <span className="text-xs font-black text-cyan-800">未确认更新</span>
                <button
                  type="button"
                  onClick={() => setAutoConfirmRoleState((current) => !current)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-black ${
                    autoConfirmRoleState
                      ? 'border-cyan-500 bg-cyan-600 text-white'
                      : 'border-cyan-200 bg-white text-cyan-700'
                  }`}
                >
                  自动确认 {autoConfirmRoleState ? '开' : '关'}
                </button>
                <button type="button" className="rounded-full bg-cyan-600 px-2.5 py-1 text-xs font-black text-white">
                  一键确认
                </button>
              </div>
            ) : (
              <p className="shrink-0 text-xs font-black text-slate-400">
                {currentChapterLabel} / 状态设定共 {stateWords} 字
              </p>
            )}
          </div>
        </header>

        <section className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-1 pb-1 pr-2 pt-3">
          <div className={contentGridClassName}>
            {activeRoleSettingTab === '基础设定' &&
              ROLE_BASE_SETTING_FIELD_DEFINITIONS.map((field) => {
                const value = baseSettingFieldDrafts[field.key];
                return (
                  <article
                    key={field.key}
                    className="relative flex min-h-[150px] flex-col rounded-[22px] border-2 border-slate-950 bg-white p-4 pt-5"
                  >
                    <div className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950">
                      {field.title}
                    </div>
                    <textarea
                      value={value}
                      onChange={(event) => updateRoleBaseSettingField(field.key, event.target.value)}
                      placeholder={field.placeholder}
                      className="editor-scrollbar min-h-0 flex-1 resize-none bg-transparent text-sm leading-7 text-slate-700 outline-none placeholder:text-slate-400"
                      style={{ fontSize: roleTextFontSize }}
                    />
                  </article>
                );
              })}

            {activeRoleSettingTab === '状态设定' && (
              <>
                <article className="relative flex min-h-[150px] flex-col rounded-[22px] border-2 border-slate-950 bg-white p-4 pt-5">
                  <div className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950">
                    人物关系
                  </div>
                  <div
                    className={`xy-border-embedded-transparent-backplate absolute right-5 top-0 z-10 -translate-y-1/2 pl-2 text-xs font-black leading-5 ${
                      stateUpdateChapters.relationshipState ? 'text-[#08AACE]' : 'text-red-500'
                    }`}
                  >
                    {relationshipUpdateLabel}
                  </div>
                  <textarea
                    value={role.relationship}
                    onChange={(event) => updateRelationshipState(event.target.value)}
                    placeholder="记录与主角、阵营、亲友、敌人、师徒、利益对象的关系。关系绑定人物，不绑定世界。"
                    className="editor-scrollbar min-h-0 flex-1 resize-none bg-transparent text-sm leading-7 text-slate-700 outline-none placeholder:text-slate-400"
                    style={{ fontSize: roleTextFontSize }}
                  />
                </article>
                {ROLE_STATE_FIELD_DEFINITIONS.map((field) => {
                  const fieldValue = stateSettings[field.key];
                  const updateLabel = getRoleStateUpdateLabel(stateUpdateChapters[field.key]);
                  return (
                    <article
                      key={field.key}
                      className="relative flex min-h-[150px] flex-col rounded-[22px] border-2 border-slate-950 bg-white p-4 pt-5"
                    >
                      <div className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950">
                        {field.title}
                      </div>
                      <div
                        className={`xy-border-embedded-transparent-backplate absolute right-5 top-0 z-10 -translate-y-1/2 pl-2 text-xs font-black leading-5 ${
                          stateUpdateChapters[field.key] ? 'text-[#08AACE]' : 'text-red-500'
                        }`}
                      >
                        {updateLabel}
                      </div>
                      <textarea
                        value={fieldValue}
                        onChange={(event) => updateStateField(field.key, event.target.value)}
                        placeholder={`记录${field.title}`}
                        className="editor-scrollbar min-h-0 flex-1 resize-none bg-transparent text-sm leading-7 text-slate-700 outline-none"
                        style={{ fontSize: roleTextFontSize }}
                      />
                    </article>
                  );
                })}
              </>
            )}

            {activeRoleSettingTab === '未确认' &&
              pendingRoleStateUpdates.map((item) => (
                <article
                  key={item.title}
                  className="relative flex min-h-[150px] flex-col rounded-[22px] border-2 border-slate-950 bg-white p-4 pt-5"
                >
                  <div className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950">
                    {item.title}
                  </div>
                  <button
                    type="button"
                    className="mb-2 rounded-full border border-cyan-200 px-2 py-0.5 text-xs font-black text-cyan-700"
                  >
                    手动确认
                  </button>
                  <div className="grid gap-3 md:grid-cols-2">
                    <section className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <h4 className="text-xs font-black text-slate-500">{item.beforeTitle}</h4>
                      <p className="mt-1 text-sm font-bold leading-6 text-slate-600">{item.beforeValue}</p>
                    </section>
                    <section className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2">
                      <h4 className="text-xs font-black text-cyan-700">{item.afterTitle}</h4>
                      <p className="mt-1 text-sm font-bold leading-6 text-slate-700">{item.afterValue}</p>
                    </section>
                  </div>
                </article>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
