import { History } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { isMaleProtagonistRoleType } from '@/features/workbench/model/workbenchRoleTypes';

import { WorkbenchFieldRecordModal } from './WorkbenchFieldRecordModal';
import { WorkbenchHeaderSelect } from './WorkbenchHeaderSelect';
import { WorkbenchNameField } from './WorkbenchNameField';
import { WorkbenchSurvivalStatusToggle } from './WorkbenchSurvivalStatusToggle';
import {
  WORKBENCH_SETTING_EDITOR_HEADER_CLASS,
  WORKBENCH_SETTING_EDITOR_HEADER_ROW_CLASS,
  WORKBENCH_SETTING_EDITOR_SCROLL_CLASS,
  WORKBENCH_SETTING_EDITOR_SHELL_CLASS,
  WORKBENCH_SETTING_EDITOR_STACK_CLASS,
  WORKBENCH_SETTING_EDITOR_TWO_COLUMN_GRID_CLASS,
} from './workbenchSettingEditorLayout';
import {
  getRoleStateSettings,
  getRoleStateUpdateChapters,
  type RoleContent,
} from './workbenchRoleContent';
import { getRoleIdentityTypeOptions } from './workbenchRoleIdentityOptions';
import {
  getPromptRoleFieldSections,
  getPromptRoleStateKey,
  parsePromptRoleFields,
  stringifyPromptRoleBaseFields,
  type PromptRoleField,
} from './workbenchPromptRoleFields';

const ROLE_FIELD_CONTENT_CLASS = 'text-base font-medium leading-8 text-slate-950 outline-none placeholder:font-semibold placeholder:text-slate-400';
const ROLE_FIELD_TEXTAREA_LINE_HEIGHT = 32;
const ROLE_FIELD_MAX_ROWS = 10;
const ROLE_FIELD_STANDARD_MIN_ROWS = 3;
const ROLE_FIELD_COMPACT_MIN_ROWS = 2;

type RoleFieldRenderOptions = {
  key: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  wide?: boolean;
};

function RoleAutoSizeTextarea({
  value,
  placeholder,
  fontSize,
  minRows,
  onChange,
}: {
  value: string;
  placeholder: string;
  fontSize: number;
  minRows: number;
  onChange: (value: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const minHeight = minRows * ROLE_FIELD_TEXTAREA_LINE_HEIGHT;
  const maxHeight = ROLE_FIELD_MAX_ROWS * ROLE_FIELD_TEXTAREA_LINE_HEIGHT;

  const syncHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const nextHeight = Math.min(maxHeight, Math.max(minHeight, textarea.scrollHeight));
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [maxHeight, minHeight]);

  useLayoutEffect(() => {
    syncHeight();
  }, [fontSize, minRows, syncHeight, value]);

  return (
    <textarea
      ref={textareaRef}
      data-no-modal-drag="true"
      value={value}
      rows={minRows}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`editor-scrollbar w-full resize-none border-0 bg-transparent pb-2 [scrollbar-gutter:stable] ${ROLE_FIELD_CONTENT_CLASS}`}
      style={{
        fontSize,
        lineHeight: `${ROLE_FIELD_TEXTAREA_LINE_HEIGHT}px`,
        minHeight,
        maxHeight,
      }}
    />
  );
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
  roleTypeOptions,
  roleTextFontSize,
  currentChapterNumber,
  roleLifeStatus,
  onTitleChange,
  onRoleChange,
}: RoleBaseStateEditorProps) {
  const parsedPromptRoleFields = useMemo(() => parsePromptRoleFields(role), [role]);
  const [promptRoleFieldDrafts, setPromptRoleFieldDrafts] = useState(parsedPromptRoleFields);
  const promptRoleSections = useMemo(() => getPromptRoleFieldSections(role.type), [role.type]);
  const stateSettings = getRoleStateSettings(role);
  const stateUpdateChapters = getRoleStateUpdateChapters(role);
  const roleIdentityTypeOptions = getRoleIdentityTypeOptions(roleTypeOptions);
  const roleIsMaleProtagonist = isMaleProtagonistRoleType(role.type);
  const roleIdentityOptionsForCurrentRole = roleIsMaleProtagonist ? [role.type] : roleIdentityTypeOptions;
  const pendingKeys = new Set((role.pendingStatusUpdates ?? []).map((update) => update.fieldKey));
  const [fieldRecord, setFieldRecord] = useState<{ key: string; label: string } | null>(null);

  useEffect(() => {
    setPromptRoleFieldDrafts(parsedPromptRoleFields);
  }, [parsedPromptRoleFields]);

  const updatePromptRoleField = (field: PromptRoleField, value: string) => {
    const nextFields = { ...promptRoleFieldDrafts, [field.key]: value };
    setPromptRoleFieldDrafts(nextFields);
    const stateKey = getPromptRoleStateKey(field.label);
    if (stateKey) {
      onRoleChange({
        stateSettings: { ...stateSettings, [stateKey]: value },
        stateUpdateChapters: currentChapterNumber
          ? { ...stateUpdateChapters, [stateKey]: currentChapterNumber }
          : stateUpdateChapters,
      });
      return;
    }
    if (field.label === '人物关系') {
      onRoleChange({
        relationship: value,
        stateUpdateChapters: currentChapterNumber
          ? { ...stateUpdateChapters, relationshipState: currentChapterNumber }
          : stateUpdateChapters,
      });
      return;
    }
    const baseSetting = stringifyPromptRoleBaseFields(role.type, nextFields);
    onRoleChange({ baseSetting, background: baseSetting, personality: '' });
  };

  const renderFieldCard = (options: RoleFieldRenderOptions) => {
    const minRows = ROLE_FIELD_STANDARD_MIN_ROWS;
    return (
      <article
        key={options.key}
        className={`relative flex h-full min-h-[122px] flex-col rounded-[22px] border-2 border-slate-950 bg-white px-5 pb-4 pt-2 ${options.wide ? 'col-span-2' : ''}`}
        data-role-field-key={options.key}
      >
        <div className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950">{options.label}</div>
        {pendingKeys.has(options.key) ? <span className="xy-border-embedded-transparent-backplate absolute right-14 top-0 z-10 -translate-y-1/2 text-[10px] font-black text-red-600">待确认</span> : null}
        <RoleAutoSizeTextarea
          value={options.value}
          placeholder={options.placeholder}
          fontSize={roleTextFontSize}
          minRows={minRows}
          onChange={options.onChange}
        />
        <button type="button" onClick={() => setFieldRecord({ key: options.key, label: options.label })} className="xy-border-embedded-transparent-backplate xy-field-record-icon-button absolute right-5 top-0 z-10 grid h-6 w-6 -translate-y-1/2 place-items-center text-[#08AACE] hover:text-[#078fb0]" title="字段记录" aria-label={`${options.label}字段记录`}>
          <History className="h-4 w-4" />
        </button>
      </article>
    );
  };

  const renderPromptField = (field: PromptRoleField) => renderFieldCard({
    key: field.key,
    label: field.label,
    value: promptRoleFieldDrafts[field.key] ?? '',
    placeholder: field.placeholder,
    wide: field.wide,
    onChange: (value) => updatePromptRoleField(field, value),
  });

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-white">
      <div className={WORKBENCH_SETTING_EDITOR_SHELL_CLASS}>
        <header className={WORKBENCH_SETTING_EDITOR_HEADER_CLASS}>
          <div className={WORKBENCH_SETTING_EDITOR_HEADER_ROW_CLASS}>
            <WorkbenchNameField label="人物姓名" value={entry.title} onValueChange={onTitleChange} placeholder="填写人物姓名" />
            <WorkbenchHeaderSelect
              label="身份定位"
              width={180}
              value={role.type}
              disabled={roleIsMaleProtagonist}
              onChange={(value) => onRoleChange({ type: value })}
              options={roleIdentityOptionsForCurrentRole}
            />
            <WorkbenchSurvivalStatusToggle
              value={roleLifeStatus ?? '存活'}
              disabled={roleIsMaleProtagonist}
              onChange={(lifeStatus) => onRoleChange({ lifeStatus })}
            />
          </div>
        </header>
        <section className={WORKBENCH_SETTING_EDITOR_SCROLL_CLASS}>
          <div className={WORKBENCH_SETTING_EDITOR_STACK_CLASS}>
            {promptRoleSections.map((section) => (
              <section key={section.title} className="space-y-4" data-role-layout-section={section.title}>
                <div className="flex items-center gap-3">
                  <h2 className="shrink-0 text-sm font-black text-slate-800">{section.title}</h2>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <div className={WORKBENCH_SETTING_EDITOR_TWO_COLUMN_GRID_CLASS}>
                  {section.fields.map(renderPromptField)}
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>
      {fieldRecord ? (
        <WorkbenchFieldRecordModal
          entryTitle={entry.title}
          fieldKey={fieldRecord.key}
          fieldLabel={fieldRecord.label}
          history={role.statusHistory ?? []}
          pending={role.pendingStatusUpdates ?? []}
          onClose={() => setFieldRecord(null)}
        />
      ) : null}
    </div>
  );
}
