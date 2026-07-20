import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { countTextWords } from '@/features/workbench/model/workbenchLibraryPanelModel';
import { WordCountText } from '@/shared/ui/WordCountText';

import type { WorkbenchFieldSizeSpec } from './workbenchFieldSizeSettings';
import { DEFAULT_SETTING_ENTRY_TYPE } from './workbenchLibraryTabs';
import { WorkbenchNameField } from './WorkbenchNameField';
import { SettingSegmentedTabs } from './workbenchSettingSegmentedTabs';
import {
  STRUCTURED_SETTING_TABS,
  stringifySettingContent,
  type SettingContent,
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
  setActiveLibraryFontTarget: (target: 'settingPreview') => void;
  updateEntry: (id: string, updates: SettingEntryUpdates) => void;
  updateStructuredSettingField: (key: string, value: string) => void;
  handleSettingSidebarScroll: (key: string) => void;
  createEditableSettingEntry: (updates: SettingEntryUpdates) => void;
};

export function WorkbenchSettingEditor({
  currentSelectedEntry,
  currentSelectedSetting,
  currentSelectedSettingIsLockedDefault,
  currentStructuredSettingFieldSet,
  currentStructuredSettingFields,
  activeStructuredSettingTab,
  setActiveStructuredSettingTab,
  activeSettingSidebarScrollKey,
  activeSettingWorkspaceType,
  settingPreviewFontSize,
  setActiveLibraryFontTarget,
  updateEntry,
  updateStructuredSettingField,
  handleSettingSidebarScroll,
  createEditableSettingEntry,
}: WorkbenchSettingEditorProps) {
  const currentStructuredTitleFieldLabel = currentStructuredSettingFieldSet
    ? (currentStructuredSettingFieldSet.titleFieldLabel ?? '\u8bbe\u5b9a\u540d')
    : undefined;
  const structuredTitleRowClassName = 'flex items-start gap-4 overflow-visible pb-1';
  const currentStructuredActiveGroup =
    currentStructuredSettingFieldSet?.groups?.find((group) => group.title === activeStructuredSettingTab) ??
    currentStructuredSettingFieldSet?.groups?.[0];
  const currentStructuredHeaderFieldKeys = new Set(currentStructuredSettingFieldSet?.headerFieldKeys ?? []);
  const currentStructuredActiveGroupWordCount =
    currentStructuredActiveGroup?.fieldKeys.reduce(
      (total, fieldKey) => total + countTextWords(currentStructuredSettingFields[fieldKey] ?? ''),
      0,
    ) ?? 0;

  if (!currentSelectedEntry) {
    return (
      <div className="xy-setting-name-editor flex min-h-0 flex-1 flex-col px-5 py-3">
        <div className="mb-6 flex shrink-0 items-start justify-between gap-4">
          <WorkbenchNameField
            label="设定名"
            value=""
            placeholder="输入设定名"
            onValueChange={(title) => {
                if (!title.trim()) return;
                createEditableSettingEntry({ title });
            }}
          />
        </div>
        <div className="relative min-h-0 flex-1">
          <div className="xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1">
            <textarea
              data-no-modal-drag="true"
              value=""
              onChange={(event) => {
                const body = event.target.value;
                if (!body.trim()) return;
                createEditableSettingEntry({
                  content: stringifySettingContent({
                    type: activeSettingWorkspaceType ?? DEFAULT_SETTING_ENTRY_TYPE,
                    body,
                  }),
                });
              }}
              onFocus={() => setActiveLibraryFontTarget('settingPreview')}
              placeholder="这里可以直接输入设定内容，会自动新建设定。"
              className="editor-scrollbar text-sm leading-7 text-gray-700"
              style={{ fontSize: settingPreviewFontSize }}
            />
            <label className="xy-floating-title-count">
              设定预览{' '}
              <span>
                <WordCountText value={0} />
              </span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="xy-setting-name-editor flex min-h-0 flex-1 flex-col px-5 py-3">
      {currentStructuredTitleFieldLabel ? (
        <header className="shrink-0 pb-3">
          <div data-testid="structured-title-row" className={structuredTitleRowClassName}>
            <WorkbenchNameField
              testId="structured-title-field"
              label={currentStructuredTitleFieldLabel}
              value={currentSelectedEntry.title}
              disabled={currentSelectedSettingIsLockedDefault}
              onValueChange={(title) => updateEntry(currentSelectedEntry.id, { title })}
              placeholder={currentStructuredTitleFieldLabel}
              title={currentSelectedSettingIsLockedDefault ? '默认设定条目已锁定，不能改名' : undefined}
            />
            {currentStructuredSettingFieldSet?.headerFieldKeys?.map((fieldKey) => {
              const field = currentStructuredSettingFieldSet.fields.find((item) => item.key === fieldKey);
              if (!field) return null;
              const value = currentStructuredSettingFields[field.key] ?? '';
              return (
                <div
                  key={field.key}
                  className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count xy-floating-visible-placeholder xy-structured-setting-field ${field.fieldClassName ?? 'h-[48px] w-[150px] shrink-0'} ${value.trim() ? 'xy-has-value' : ''}`}
                >
                  <input
                    data-no-modal-drag="true"
                    aria-label={field.title}
                    value={value}
                    maxLength={field.maxLength}
                    onFocus={() => setActiveLibraryFontTarget('settingPreview')}
                    onChange={(event) => updateStructuredSettingField(field.key, event.target.value)}
                    placeholder={field.placeholder ?? `填写${field.title}`}
                    className="text-sm leading-7 text-gray-700"
                    style={{ fontSize: settingPreviewFontSize }}
                  />
                  <label className="xy-floating-title-count">{field.title}</label>
                </div>
              );
            })}
            {currentStructuredSettingFieldSet?.groups ? (
              <div aria-hidden="true" className="h-9 w-[112px] shrink-0" />
            ) : null}
          </div>
          {currentStructuredSettingFieldSet?.groups ? (
            <div className="mt-3 flex items-center justify-between gap-4 overflow-x-auto pb-1">
              <SettingSegmentedTabs
                tabs={STRUCTURED_SETTING_TABS}
                activeTab={activeStructuredSettingTab}
                onChange={setActiveStructuredSettingTab}
              />
              {activeStructuredSettingTab !== '确认' && currentStructuredActiveGroup ? (
                <p className="shrink-0 text-xs font-black text-slate-400">
                  {currentStructuredActiveGroup.title}共 {currentStructuredActiveGroupWordCount} 字
                </p>
              ) : null}
            </div>
          ) : null}
        </header>
      ) : (
        <div className="mb-6 flex shrink-0 items-start justify-between gap-4">
          <WorkbenchNameField
            label="设定名"
            value={currentSelectedEntry.title}
            disabled={currentSelectedSettingIsLockedDefault}
            onValueChange={(title) => updateEntry(currentSelectedEntry.id, { title })}
            placeholder="设定名"
            title={currentSelectedSettingIsLockedDefault ? '默认设定条目已锁定，不能改名' : undefined}
          />
        </div>
      )}
      <div className="relative min-h-0 flex-1">
        {currentStructuredSettingFieldSet ? (
          currentStructuredSettingFieldSet.groups ? (
            <div className="flex h-full min-h-0 flex-col gap-3">
              {!currentStructuredTitleFieldLabel ? (
                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 pb-3">
                  <SettingSegmentedTabs
                    tabs={STRUCTURED_SETTING_TABS}
                    activeTab={activeStructuredSettingTab}
                    onChange={setActiveStructuredSettingTab}
                  />
                  {activeStructuredSettingTab !== '确认' && currentStructuredActiveGroup ? (
                    <p className="shrink-0 text-xs font-black text-slate-400">
                      {currentStructuredActiveGroup.title}共 {currentStructuredActiveGroupWordCount} 字
                    </p>
                  ) : null}
                </div>
              ) : null}
              {activeStructuredSettingTab === '确认' ? (
                <section className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3">
                  <h3 className="text-sm font-black text-cyan-800">确认更新</h3>
                  <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                    AI 反馈进入确认区后，左侧显示未更新前内容，右侧显示更新后内容，确认后才写入状态设定。
                  </p>
                </section>
              ) : currentStructuredActiveGroup ? (
                <section
                  key={currentStructuredActiveGroup.title}
                  className="flex min-h-0 flex-1 flex-col overflow-hidden"
                >
                  <div
                    data-testid="structured-setting-fields"
                    className={`grid min-h-0 flex-1 grid-cols-2 gap-3 px-1 pb-1 pr-2 pt-3 ${currentStructuredSettingFieldSet.gridContentClassName ?? ''}`}
                  >
                    {currentStructuredActiveGroup.fieldKeys
                      .filter((fieldKey) => !currentStructuredHeaderFieldKeys.has(fieldKey))
                      .map((fieldKey) => {
                        const field = currentStructuredSettingFieldSet.fields.find((item) => item.key === fieldKey);
                        if (!field) return null;
                        const value = currentStructuredSettingFields[field.key] ?? '';
                        const fieldControl = field.control ?? 'textarea';
                        return (
                          <div
                            key={field.key}
                            className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count xy-floating-visible-placeholder xy-structured-setting-field ${field.fieldClassName ?? 'min-h-0 flex-1'} ${value.trim() ? 'xy-has-value' : ''}`}
                          >
                            {fieldControl === 'input' ? (
                              <input
                                data-no-modal-drag="true"
                                aria-label={field.title}
                                value={value}
                                maxLength={field.maxLength}
                                onFocus={() => setActiveLibraryFontTarget('settingPreview')}
                                onChange={(event) => updateStructuredSettingField(field.key, event.target.value)}
                                placeholder={field.placeholder ?? `填写${field.title}`}
                                className="text-sm leading-7 text-gray-700"
                                style={{ fontSize: settingPreviewFontSize }}
                              />
                            ) : (
                              <textarea
                                data-no-modal-drag="true"
                                aria-label={field.title}
                                value={value}
                                onFocus={() => setActiveLibraryFontTarget('settingPreview')}
                                onChange={(event) => updateStructuredSettingField(field.key, event.target.value)}
                                onScroll={() =>
                                  handleSettingSidebarScroll(
                                    `setting-textarea:${currentStructuredSettingFieldSet.id}:${field.key}`,
                                  )
                                }
                                placeholder={field.placeholder ?? `填写${field.title}`}
                                className={`scrollbar-scroll-only scrollbar-half-width text-sm leading-7 text-gray-700 ${
                                  activeSettingSidebarScrollKey ===
                                  `setting-textarea:${currentStructuredSettingFieldSet.id}:${field.key}`
                                    ? 'scrollbar-active'
                                    : ''
                                }`}
                                style={{ fontSize: settingPreviewFontSize }}
                              />
                            )}
                            <label className="xy-floating-title-count">
                              {field.title}{' '}
                              <span>
                                <WordCountText value={countTextWords(value)} />
                              </span>
                            </label>
                          </div>
                        );
                      })}
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <div
              data-testid="structured-setting-fields"
              className={`grid h-full min-h-0 ${currentStructuredSettingFieldSet.gridColumnsClassName} gap-4 ${currentStructuredSettingFieldSet.gridContentClassName ?? ''}`}
            >
              {currentStructuredSettingFieldSet.fields
                .filter((field) => !currentStructuredHeaderFieldKeys.has(field.key))
                .map((field) => {
                  const value = currentStructuredSettingFields[field.key] ?? '';
                  const fieldControl = field.control ?? 'textarea';
                  return (
                    <div
                      key={field.key}
                      className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count xy-floating-visible-placeholder xy-structured-setting-field ${field.fieldClassName ?? 'min-h-0 flex-1'} ${value.trim() ? 'xy-has-value' : ''}`}
                    >
                      {fieldControl === 'input' ? (
                        <input
                          data-no-modal-drag="true"
                          aria-label={field.title}
                          value={value}
                          maxLength={field.maxLength}
                          onFocus={() => setActiveLibraryFontTarget('settingPreview')}
                          onChange={(event) => updateStructuredSettingField(field.key, event.target.value)}
                          placeholder={field.placeholder ?? `填写${field.title}`}
                          className="text-sm leading-7 text-gray-700"
                          style={{ fontSize: settingPreviewFontSize }}
                        />
                      ) : (
                        <textarea
                          data-no-modal-drag="true"
                          aria-label={field.title}
                          value={value}
                          onFocus={() => setActiveLibraryFontTarget('settingPreview')}
                          onChange={(event) => updateStructuredSettingField(field.key, event.target.value)}
                          onScroll={() =>
                            handleSettingSidebarScroll(
                              `setting-textarea:${currentStructuredSettingFieldSet.id}:${field.key}`,
                            )
                          }
                          placeholder={field.placeholder ?? `填写${field.title}`}
                          className={`scrollbar-scroll-only scrollbar-half-width text-sm leading-7 text-gray-700 ${
                            activeSettingSidebarScrollKey ===
                            `setting-textarea:${currentStructuredSettingFieldSet.id}:${field.key}`
                              ? 'scrollbar-active'
                              : ''
                          }`}
                          style={{ fontSize: settingPreviewFontSize }}
                        />
                      )}
                      <label className="xy-floating-title-count">
                        {field.title}{' '}
                        <span>
                          <WordCountText value={countTextWords(value)} />
                        </span>
                      </label>
                    </div>
                  );
                })}
            </div>
          )
        ) : (
          <div
            className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 ${(currentSelectedSetting ? currentSelectedSetting.body : currentSelectedEntry.content).trim() ? 'xy-has-value' : ''}`}
          >
            <textarea
              data-no-modal-drag="true"
              value={currentSelectedSetting ? currentSelectedSetting.body : currentSelectedEntry.content}
              onFocus={() => setActiveLibraryFontTarget('settingPreview')}
              onChange={(event) =>
                updateEntry(currentSelectedEntry.id, {
                  content: currentSelectedSetting
                    ? stringifySettingContent({ ...currentSelectedSetting, body: event.target.value })
                    : event.target.value,
                })
              }
              onScroll={() => handleSettingSidebarScroll(`setting-textarea:${currentSelectedEntry.id}`)}
              placeholder="这里显示选中的设定内容，也可以直接编辑。"
              className={`scrollbar-scroll-only scrollbar-half-width text-sm leading-7 text-gray-700 ${
                activeSettingSidebarScrollKey === `setting-textarea:${currentSelectedEntry.id}`
                  ? 'scrollbar-active'
                  : ''
              }`}
              style={{ fontSize: settingPreviewFontSize }}
            />
            <label className="xy-floating-title-count">
              设定预览{' '}
              <span>
                <WordCountText
                  value={countTextWords(
                    currentSelectedSetting ? currentSelectedSetting.body : currentSelectedEntry.content,
                  )}
                />
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
