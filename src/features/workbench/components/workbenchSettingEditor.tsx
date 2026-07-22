import { getSettingFieldPolicy } from '@/features/workbench/model/workbenchSettingStatus';
import { selectWorkbenchSettingStatusField } from '@/features/workbench/model/workbenchSettingStatusSelection';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { countTextWords } from '@/features/workbench/model/workbenchLibraryPanelModel';
import { WordCountText } from '@/shared/ui/WordCountText';

import type { WorkbenchFieldSizeSpec } from './workbenchFieldSizeSettings';
import { DEFAULT_SETTING_ENTRY_TYPE } from './workbenchLibraryTabs';
import { WorkbenchNameField } from './WorkbenchNameField';
import { WorkbenchSettingGroupSelect } from './WorkbenchSettingGroupSelect';
import {
  stringifySettingContent,
  type SettingContent,
  type StructuredSettingFieldDefinition,
  type StructuredSettingFieldSet,
  type StructuredSettingTab,
} from './workbenchStructuredSettings';

type SettingEntryUpdates = Partial<Pick<WorkbenchLibraryEntry, 'title' | 'content'>>;

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
  onOpenStatus?: () => void;
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
  settingGroupOptions,
  setActiveLibraryFontTarget,
  updateEntry,
  updateStructuredSettingField,
  handleSettingSidebarScroll,
  createEditableSettingEntry,
  onSettingGroupChange,
  onOpenStatus,
}: WorkbenchSettingEditorProps) {
  const headerFieldKeys = new Set(currentStructuredSettingFieldSet?.headerFieldKeys ?? []);
  const pendingKeys = new Set((currentSelectedSetting?.pendingStatusUpdates ?? []).map((update) => update.fieldKey));
  const titleFieldLabel = currentStructuredSettingFieldSet?.titleFieldLabel ?? '设定名';

  if (!currentSelectedEntry) {
    return (
      <div className="xy-setting-name-editor flex min-h-0 flex-1 flex-col px-5 py-3">
        <div className="mb-6 flex shrink-0 items-start gap-4">
          <WorkbenchNameField label="设定名" value="" placeholder="输入设定名" onValueChange={(title) => {
            if (!title.trim()) return;
            createEditableSettingEntry({ title, content: stringifySettingContent({ type: activeSettingWorkspaceType ?? DEFAULT_SETTING_ENTRY_TYPE, body: '' }) });
          }} />
          <WorkbenchSettingGroupSelect value={activeSettingWorkspaceType ?? settingGroupOptions[0] ?? DEFAULT_SETTING_ENTRY_TYPE} options={settingGroupOptions} onChange={onSettingGroupChange} />
        </div>
        <div className="xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1">
          <textarea data-no-modal-drag="true" value="" onChange={(event) => {
            if (!event.target.value.trim()) return;
            createEditableSettingEntry({ content: stringifySettingContent({ type: activeSettingWorkspaceType ?? DEFAULT_SETTING_ENTRY_TYPE, body: event.target.value }) });
          }} onFocus={() => setActiveLibraryFontTarget('settingPreview')} placeholder="这里可以直接输入设定内容，会自动新建设定。" className="editor-scrollbar text-sm leading-7 text-gray-700" style={{ fontSize: settingPreviewFontSize }} />
          <label className="xy-floating-title-count">设定预览 <span><WordCountText value={0} /></span></label>
        </div>
      </div>
    );
  }

  const openFieldStatus = (fieldKey: string, fieldLabel: string) => {
    selectWorkbenchSettingStatusField({ entryId: currentSelectedEntry.id, fieldKey, fieldLabel });
    onOpenStatus?.();
  };

  const renderField = (field: StructuredSettingFieldDefinition) => {
    const value = currentStructuredSettingFields[field.key] ?? '';
    const policy = getSettingFieldPolicy(currentSelectedSetting?.fieldUpdatePolicies, field.key, field.title);
    const scrollKey = `setting-textarea:${currentStructuredSettingFieldSet?.id}:${field.key}`;
    return (
      <article key={field.key} className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count xy-floating-visible-placeholder xy-structured-setting-field relative flex min-h-[145px] flex-col rounded-[22px] border-2 border-slate-950 bg-white p-4 pt-5 ${field.fieldClassName?.includes('col-span-2') ? 'col-span-2' : ''}`}>
        <div className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black text-slate-950">{field.title}</div>
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          {pendingKeys.has(field.key) ? <span className="rounded-md bg-red-50 px-2 py-1 text-[9px] font-black text-red-600">待确认</span> : null}
          <span className="rounded-md bg-sky-50 px-2 py-1 text-[9px] font-black text-[#078fb0]">{policy}</span>
        </div>
        {field.control === 'input' ? (
          <input data-no-modal-drag="true" aria-label={field.title} value={value} maxLength={field.maxLength} onFocus={() => setActiveLibraryFontTarget('settingPreview')} onChange={(event) => updateStructuredSettingField(field.key, event.target.value)} placeholder={field.placeholder ?? `填写${field.title}`} className="mt-6 min-h-10 bg-transparent text-sm leading-7 text-gray-700 outline-none" style={{ fontSize: settingPreviewFontSize }} />
        ) : (
          <textarea data-no-modal-drag="true" aria-label={field.title} value={value} onFocus={() => setActiveLibraryFontTarget('settingPreview')} onChange={(event) => updateStructuredSettingField(field.key, event.target.value)} onScroll={() => handleSettingSidebarScroll(scrollKey)} placeholder={field.placeholder ?? `填写${field.title}`} className={`scrollbar-scroll-only scrollbar-half-width mt-6 min-h-[72px] flex-1 resize-none bg-transparent text-sm leading-7 text-gray-700 outline-none ${activeSettingSidebarScrollKey === scrollKey ? 'scrollbar-active' : ''}`} style={{ fontSize: settingPreviewFontSize }} />
        )}
        <div className="mt-2 flex items-center justify-between gap-3 text-[10px] font-bold text-slate-400">
          <span><WordCountText value={countTextWords(value)} /> · 保留历史</span>
          <button type="button" onClick={() => openFieldStatus(field.key, field.title)} className="font-black text-[#078fb0]">查看轨迹 →</button>
        </div>
      </article>
    );
  };

  const groups = currentStructuredSettingFieldSet?.groups ?? (currentStructuredSettingFieldSet ? [{
    title: '完整设定',
    description: '所有字段均可独立设置更新规则并保留历史。',
    fieldKeys: currentStructuredSettingFieldSet.fields.map((field) => field.key),
  }] : []);

  return (
    <div className="xy-setting-name-editor flex min-h-0 flex-1 flex-col px-5 py-3">
      <header className="shrink-0 border-b border-slate-100 pb-3">
        <div data-testid="structured-title-row" className="flex flex-wrap items-start gap-4 overflow-visible pb-1">
          <WorkbenchNameField testId="structured-title-field" label={titleFieldLabel} value={currentSelectedEntry.title} disabled={currentSelectedSettingIsLockedDefault} onValueChange={(title) => updateEntry(currentSelectedEntry.id, { title })} placeholder={titleFieldLabel} title={currentSelectedSettingIsLockedDefault ? '默认设定条目已锁定，不能改名' : undefined} />
          <WorkbenchSettingGroupSelect value={currentSelectedSetting?.type ?? activeSettingWorkspaceType ?? settingGroupOptions[0] ?? ''} options={settingGroupOptions} disabled={currentSelectedSettingIsLockedDefault} onChange={onSettingGroupChange} />
          {currentStructuredSettingFieldSet?.fields.filter((field) => headerFieldKeys.has(field.key)).map((field) => (
            <div key={field.key} className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-visible-placeholder ${field.fieldClassName ?? 'h-[48px] w-[150px] shrink-0'}`}>
              <input data-no-modal-drag="true" aria-label={field.title} value={currentStructuredSettingFields[field.key] ?? ''} maxLength={field.maxLength} onChange={(event) => updateStructuredSettingField(field.key, event.target.value)} placeholder={field.placeholder} />
              <label className="xy-floating-title-count">{field.title}</label>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="text-xs font-black text-slate-600">当前设定完整显示 · 字段独立更新 · 历史和依据在右侧状态栏</p>
          <p className="text-xs font-black text-slate-400">待确认 {(currentSelectedSetting?.pendingStatusUpdates ?? []).length}</p>
        </div>
      </header>
      <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-1 pb-1 pr-2 pt-4">
        {currentStructuredSettingFieldSet ? (
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.title}>
                <div className="mb-3 flex items-center justify-between gap-4"><div><h2 className="text-sm font-black text-slate-900">{group.title}</h2><p className="mt-1 text-[10px] font-bold text-slate-400">{group.description}</p></div><span className="shrink-0 text-[10px] font-bold text-slate-400">{group.fieldKeys.length}个字段</span></div>
                <div data-testid="structured-setting-fields" className={`grid grid-cols-2 gap-3 ${currentStructuredSettingFieldSet.gridContentClassName ?? ''}`}>
                  {group.fieldKeys.filter((key) => !headerFieldKeys.has(key)).map((key) => currentStructuredSettingFieldSet.fields.find((field) => field.key === key)).filter((field): field is StructuredSettingFieldDefinition => Boolean(field)).map(renderField)}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <article className="relative flex min-h-full flex-col rounded-[22px] border-2 border-slate-950 bg-white p-4 pt-5">
            <div className="xy-border-embedded-transparent-backplate absolute left-5 top-0 -translate-y-1/2 pr-2 text-base font-black text-slate-950">设定内容</div>
            <span className="absolute right-3 top-3 rounded-md bg-sky-50 px-2 py-1 text-[9px] font-black text-[#078fb0]">{getSettingFieldPolicy(currentSelectedSetting?.fieldUpdatePolicies, 'body', '设定内容')}</span>
            <textarea data-no-modal-drag="true" value={currentSelectedSetting?.body ?? currentSelectedEntry.content} onFocus={() => setActiveLibraryFontTarget('settingPreview')} onChange={(event) => updateEntry(currentSelectedEntry.id, { content: currentSelectedSetting ? stringifySettingContent({ ...currentSelectedSetting, body: event.target.value }) : event.target.value })} onScroll={() => handleSettingSidebarScroll(`setting-textarea:${currentSelectedEntry.id}`)} placeholder="这里显示选中的设定内容，也可以直接编辑。" className="editor-scrollbar mt-6 min-h-0 flex-1 resize-none bg-transparent text-sm leading-7 text-gray-700 outline-none" style={{ fontSize: settingPreviewFontSize }} />
            <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-400"><span><WordCountText value={countTextWords(currentSelectedSetting?.body ?? currentSelectedEntry.content)} /> · 保留历史</span><button type="button" onClick={() => openFieldStatus('body', '设定内容')} className="font-black text-[#078fb0]">查看轨迹 →</button></div>
          </article>
        )}
      </div>
    </div>
  );
}
