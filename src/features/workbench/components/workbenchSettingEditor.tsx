import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { History } from 'lucide-react';
import { useState } from 'react';

import type { WorkbenchFieldSizeSpec } from './workbenchFieldSizeSettings';
import { WorkbenchFieldRecordModal } from './WorkbenchFieldRecordModal';
import { DEFAULT_SETTING_ENTRY_TYPE } from './workbenchLibraryTabs';
import { WorkbenchNameField } from './WorkbenchNameField';
import { WorkbenchSettingGroupSelect } from './WorkbenchSettingGroupSelect';
import {
  WORKBENCH_SETTING_EDITOR_HEADER_CLASS,
  WORKBENCH_SETTING_EDITOR_HEADER_ROW_CLASS,
  WORKBENCH_SETTING_EDITOR_SCROLL_CLASS,
  WORKBENCH_SETTING_EDITOR_SHELL_CLASS,
  WORKBENCH_SETTING_EDITOR_STACK_CLASS,
  WORKBENCH_SETTING_EDITOR_TWO_COLUMN_GRID_CLASS,
} from './workbenchSettingEditorLayout';
import {
  stringifySettingContent,
  type SettingContent,
  type StructuredSettingFieldDefinition,
  type StructuredSettingFieldSet,
  type StructuredSettingTab,
} from './workbenchStructuredSettings';

type SettingEntryUpdates = Partial<Pick<WorkbenchLibraryEntry, 'title' | 'content'>>;

const SETTING_FIELD_CARD_CLASS = 'relative flex flex-col rounded-[20px] border-2 border-slate-950 bg-white px-6 pb-2 pt-4';
const SETTING_FIELD_SIZE_CLASS = {
  compact: 'min-h-[96px]',
  standard: 'min-h-[132px]',
  expanded: 'min-h-[158px]',
} as const;
const SETTING_FIELD_LABEL_CLASS = 'xy-border-embedded-transparent-backplate absolute left-6 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950';
const SETTING_FIELD_RECORD_BUTTON_CLASS = 'xy-border-embedded-transparent-backplate xy-field-record-icon-button absolute right-6 top-0 z-10 grid h-6 w-6 -translate-y-1/2 place-items-center text-[#08AACE] hover:text-[#078fb0]';
const SETTING_FIELD_CONTENT_CLASS = 'text-base font-medium leading-7 text-slate-950 outline-none placeholder:font-black placeholder:leading-6 placeholder:text-slate-400';
const LOCKED_DEFAULT_SETTING_TOOLTIP = '内置设定，无法删除';

type WorkbenchSettingEditorProps = {
  currentSelectedEntry: WorkbenchLibraryEntry | null;
  currentSelectedSetting: SettingContent | null;
  currentSelectedSettingIsLockedDefault: boolean;
  currentStructuredSettingFieldSet: StructuredSettingFieldSet | null;
  currentStructuredSettingFields: Record<string, string>;
  activeStructuredSettingTab: StructuredSettingTab;
  setActiveStructuredSettingTab: (tab: StructuredSettingTab) => void;
  activeSettingSidebarScrollKey: string | null;
  activeSettingWorkspaceType: string | null;
  settingPreviewFontSize: number;
  settingNameFieldSpec: WorkbenchFieldSizeSpec;
  settingGroupOptions: string[];
  setActiveLibraryFontTarget: (target: 'settingPreview') => void;
  updateEntry: (id: string, updates: SettingEntryUpdates) => void;
  updateStructuredSettingField: (key: string, value: string) => void;
  handleSettingSidebarScroll: (key: string) => void;
  createEditableSettingEntry: (updates: SettingEntryUpdates) => void;
  onSettingGroupChange: (type: string) => void;
};

export function WorkbenchSettingEditor({
  currentSelectedEntry,
  currentSelectedSetting,
  currentSelectedSettingIsLockedDefault,
  currentStructuredSettingFieldSet,
  currentStructuredSettingFields,
  activeSettingSidebarScrollKey,
  activeSettingWorkspaceType,
  settingPreviewFontSize,
  settingNameFieldSpec,
  settingGroupOptions,
  setActiveLibraryFontTarget,
  updateEntry,
  updateStructuredSettingField,
  handleSettingSidebarScroll,
  createEditableSettingEntry,
  onSettingGroupChange,
}: WorkbenchSettingEditorProps) {
  const [fieldRecord, setFieldRecord] = useState<{ key: string; label: string } | null>(null);
  const headerFieldKeys = new Set(currentStructuredSettingFieldSet?.headerFieldKeys ?? []);
  const pendingKeys = new Set((currentSelectedSetting?.pendingStatusUpdates ?? []).map((update) => update.fieldKey));
  const titleFieldLabel = currentStructuredSettingFieldSet?.titleFieldLabel ?? '设定名';

  if (!currentSelectedEntry) {
    return (
      <div className={WORKBENCH_SETTING_EDITOR_SHELL_CLASS}>
        <header className={WORKBENCH_SETTING_EDITOR_HEADER_CLASS}>
          <div className={WORKBENCH_SETTING_EDITOR_HEADER_ROW_CLASS}>
            <WorkbenchNameField label="设定名" value="" width={settingNameFieldSpec.width} placeholder="输入设定名" onValueChange={(title) => {
              if (!title.trim()) return;
              createEditableSettingEntry({ title, content: stringifySettingContent({ type: activeSettingWorkspaceType ?? DEFAULT_SETTING_ENTRY_TYPE, body: '' }) });
            }} />
            <WorkbenchSettingGroupSelect value={activeSettingWorkspaceType ?? settingGroupOptions[0] ?? DEFAULT_SETTING_ENTRY_TYPE} options={settingGroupOptions} onChange={onSettingGroupChange} />
          </div>
        </header>
        <div className={`${WORKBENCH_SETTING_EDITOR_SCROLL_CLASS} flex flex-col`}>
          <div className="xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1">
            <textarea data-no-modal-drag="true" value="" onChange={(event) => {
              if (!event.target.value.trim()) return;
              createEditableSettingEntry({ content: stringifySettingContent({ type: activeSettingWorkspaceType ?? DEFAULT_SETTING_ENTRY_TYPE, body: event.target.value }) });
            }} onFocus={() => setActiveLibraryFontTarget('settingPreview')} placeholder="这里可以直接输入设定内容，会自动新建设定。" className={`editor-scrollbar [scrollbar-gutter:stable] ${SETTING_FIELD_CONTENT_CLASS}`} style={{ fontSize: settingPreviewFontSize }} />
            <label className="xy-floating-title-count">设定预览</label>
          </div>
        </div>
      </div>
    );
  }

  const renderField = (field: StructuredSettingFieldDefinition) => {
    const value = currentStructuredSettingFields[field.key] ?? '';
    const scrollKey = `setting-textarea:${currentStructuredSettingFieldSet?.id}:${field.key}`;
    return (
      <article
        key={field.key}
        data-setting-field-key={field.key}
        data-field-size={field.displaySize ?? 'standard'}
        className={`${SETTING_FIELD_CARD_CLASS} ${SETTING_FIELD_SIZE_CLASS[field.displaySize ?? 'standard']} ${field.fieldClassName ?? ''}`}
      >
        <div className={SETTING_FIELD_LABEL_CLASS}>{field.title}</div>
        {pendingKeys.has(field.key) ? <span className="xy-border-embedded-transparent-backplate absolute right-16 top-0 z-10 -translate-y-1/2 text-[10px] font-black text-red-600">待确认</span> : null}
        {field.control === 'input' ? (
          <input data-no-modal-drag="true" aria-label={field.title} value={value} maxLength={field.maxLength} onFocus={() => setActiveLibraryFontTarget('settingPreview')} onChange={(event) => updateStructuredSettingField(field.key, event.target.value)} placeholder={field.placeholder ?? `填写${field.title}`} className={`min-h-10 w-full border-0 bg-transparent ${SETTING_FIELD_CONTENT_CLASS}`} style={{ fontSize: settingPreviewFontSize }} />
        ) : (
          <textarea data-no-modal-drag="true" aria-label={field.title} value={value} onFocus={() => setActiveLibraryFontTarget('settingPreview')} onChange={(event) => updateStructuredSettingField(field.key, event.target.value)} onScroll={() => handleSettingSidebarScroll(scrollKey)} placeholder={field.placeholder ?? `填写${field.title}`} className={`scrollbar-scroll-only scrollbar-half-width min-h-[72px] w-full flex-1 resize-none border-0 bg-transparent pb-1 [scrollbar-gutter:stable] ${SETTING_FIELD_CONTENT_CLASS} ${activeSettingSidebarScrollKey === scrollKey ? 'scrollbar-active' : ''}`} style={{ fontSize: settingPreviewFontSize }} />
        )}
        <button type="button" onClick={() => setFieldRecord({ key: field.key, label: field.title })} className={SETTING_FIELD_RECORD_BUTTON_CLASS} title="字段记录" aria-label={`${field.title}字段记录`}>
          <History className="h-4 w-4" />
        </button>
      </article>
    );
  };

  const groups = currentStructuredSettingFieldSet?.groups ?? (currentStructuredSettingFieldSet ? [{
    title: currentStructuredSettingFieldSet.id,
    description: '',
    fieldKeys: currentStructuredSettingFieldSet.fields.map((field) => field.key),
  }] : []);

  return (
    <div className={WORKBENCH_SETTING_EDITOR_SHELL_CLASS}>
      <header className={WORKBENCH_SETTING_EDITOR_HEADER_CLASS}>
        <div data-testid="structured-title-row" className={`${WORKBENCH_SETTING_EDITOR_HEADER_ROW_CLASS} overflow-visible`}>
          <WorkbenchNameField testId="structured-title-field" label={titleFieldLabel} value={currentSelectedEntry.title} width={settingNameFieldSpec.width} disabled={currentSelectedSettingIsLockedDefault} onValueChange={(title) => updateEntry(currentSelectedEntry.id, { title })} placeholder={titleFieldLabel} title={currentSelectedSettingIsLockedDefault ? '默认设定条目已锁定，不能改名' : undefined} />
          <WorkbenchSettingGroupSelect value={currentSelectedSetting?.type ?? activeSettingWorkspaceType ?? settingGroupOptions[0] ?? ''} options={settingGroupOptions} disabled={currentSelectedSettingIsLockedDefault} title={currentSelectedSettingIsLockedDefault ? LOCKED_DEFAULT_SETTING_TOOLTIP : undefined} onChange={onSettingGroupChange} />
          {currentStructuredSettingFieldSet?.fields.filter((field) => headerFieldKeys.has(field.key)).map((field) => (
            <div key={field.key} data-setting-field-key={field.key} data-workbench-header-control="true" className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-visible-placeholder ${field.fieldClassName ?? 'h-[48px] w-[150px] shrink-0'}`}>
              <input data-no-modal-drag="true" aria-label={field.title} value={currentStructuredSettingFields[field.key] ?? ''} maxLength={field.maxLength} onChange={(event) => updateStructuredSettingField(field.key, event.target.value)} placeholder={field.placeholder} />
              <label className="xy-floating-title-count">{field.title}</label>
            </div>
          ))}
        </div>
      </header>
      <div className={WORKBENCH_SETTING_EDITOR_SCROLL_CLASS}>
        {currentStructuredSettingFieldSet ? (
          <div className={WORKBENCH_SETTING_EDITOR_STACK_CLASS}>
            {groups.map((group) => (
              <section key={group.title} className="space-y-3" data-setting-field-group={group.title}>
                {groups.length > 1 || group.title !== currentStructuredSettingFieldSet.entryTitle ? (
                  <div className="flex items-center gap-3 px-1">
                    <h3 className="shrink-0 text-sm font-black text-slate-700">{group.title}</h3>
                    <span className="h-px min-w-0 flex-1 bg-[#CDEFF6]" aria-hidden="true" />
                  </div>
                ) : null}
                <div data-testid="structured-setting-fields" className={`${WORKBENCH_SETTING_EDITOR_TWO_COLUMN_GRID_CLASS} ${currentStructuredSettingFieldSet.gridContentClassName ?? ''}`}>
                  {group.fieldKeys.filter((key) => !headerFieldKeys.has(key)).map((key) => currentStructuredSettingFieldSet.fields.find((field) => field.key === key)).filter((field): field is StructuredSettingFieldDefinition => Boolean(field)).map(renderField)}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <article className={`${SETTING_FIELD_CARD_CLASS} min-h-full`}>
            <div className={SETTING_FIELD_LABEL_CLASS}>设定内容</div>
            {pendingKeys.has('body') ? <span className="xy-border-embedded-transparent-backplate absolute right-16 top-0 z-10 -translate-y-1/2 text-[10px] font-black text-red-600">待确认</span> : null}
            <textarea data-no-modal-drag="true" value={currentSelectedSetting?.body ?? currentSelectedEntry.content} onFocus={() => setActiveLibraryFontTarget('settingPreview')} onChange={(event) => updateEntry(currentSelectedEntry.id, { content: currentSelectedSetting ? stringifySettingContent({ ...currentSelectedSetting, body: event.target.value }) : event.target.value })} onScroll={() => handleSettingSidebarScroll(`setting-textarea:${currentSelectedEntry.id}`)} placeholder="这里显示选中的设定内容，也可以直接编辑。" className={`editor-scrollbar min-h-0 w-full flex-1 resize-none border-0 bg-transparent pb-1 [scrollbar-gutter:stable] ${SETTING_FIELD_CONTENT_CLASS}`} style={{ fontSize: settingPreviewFontSize }} />
            <button type="button" onClick={() => setFieldRecord({ key: 'body', label: '设定内容' })} className={SETTING_FIELD_RECORD_BUTTON_CLASS} title="字段记录" aria-label="设定内容字段记录">
              <History className="h-4 w-4" />
            </button>
          </article>
        )}
      </div>
      {currentSelectedEntry && currentSelectedSetting && fieldRecord ? (
        <WorkbenchFieldRecordModal
          entryTitle={currentSelectedEntry.title}
          fieldKey={fieldRecord.key}
          fieldLabel={fieldRecord.label}
          history={currentSelectedSetting.statusHistory ?? []}
          pending={currentSelectedSetting.pendingStatusUpdates ?? []}
          onClose={() => setFieldRecord(null)}
        />
      ) : null}
    </div>
  );
}
