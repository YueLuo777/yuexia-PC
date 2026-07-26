import { useEffect, useRef } from 'react';

import type { StandardSettingEntryDescriptor } from '@/features/workbench/model/standardModeSettingModel';

import { WorkbenchNameField } from './WorkbenchNameField';
import { RoleAutoSizeTextarea } from './workbenchRoleEditor';
import { WorkbenchSettingGroupSelect } from './WorkbenchSettingGroupSelect';
import {
  WORKBENCH_SETTING_EDITOR_HEADER_CLASS,
  WORKBENCH_SETTING_EDITOR_HEADER_ROW_CLASS,
  WORKBENCH_SETTING_EDITOR_SCROLL_CLASS,
  WORKBENCH_SETTING_EDITOR_SHELL_CLASS,
  WORKBENCH_SETTING_EDITOR_STACK_CLASS,
  WORKBENCH_SETTING_EDITOR_TWO_COLUMN_GRID_CLASS,
} from './workbenchSettingEditorLayout';

type StandardModeSettingEditorProps = {
  entry: StandardSettingEntryDescriptor | null;
  focusTarget: { entryId: string; fieldKey: string; nonce: number } | null;
  onFieldChange: (entryId: string, fieldKey: string, fieldTitle: string, value: string) => void;
};

const settingFieldCardClass =
  'relative flex flex-col rounded-[20px] border-2 border-slate-950 bg-white px-6 pb-2 pt-2';
const settingFieldSizeClass = {
  compact: 'min-h-[96px]',
  standard: 'min-h-[132px]',
  expanded: 'min-h-[158px]',
} as const;
const roleFieldCardClass =
  'relative flex h-full min-h-[122px] flex-col rounded-[22px] border-2 border-slate-950 bg-white px-5 pb-4 pt-2';
const settingFieldLabelClass =
  'xy-border-embedded-transparent-backplate absolute left-6 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950';
const roleFieldLabelClass =
  'xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950';
const settingFieldContentClass =
  'text-base font-medium leading-7 text-slate-950 outline-none placeholder:font-black placeholder:leading-6 placeholder:text-slate-400';

export function StandardModeSettingEditor({ entry, focusTarget, onFieldChange }: StandardModeSettingEditorProps) {
  const fieldRefs = useRef(new Map<string, HTMLInputElement | HTMLTextAreaElement>());

  useEffect(() => {
    if (!entry || !focusTarget || focusTarget.entryId !== entry.id) return;
    const frame = requestAnimationFrame(() => {
      const field = fieldRefs.current.get(focusTarget.fieldKey);
      field?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      field?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [entry, focusTarget]);

  if (!entry) {
    return (
      <section className="grid min-h-0 flex-1 place-items-center bg-white text-sm font-semibold text-slate-400">
        当前模板中还没有设定。
      </section>
    );
  }

  return (
    <section className="flex min-h-0 min-w-[560px] flex-1 bg-white" data-standard-setting-editor="true">
      <div className={WORKBENCH_SETTING_EDITOR_SHELL_CLASS}>
        <header className={WORKBENCH_SETTING_EDITOR_HEADER_CLASS}>
          <div className={`${WORKBENCH_SETTING_EDITOR_HEADER_ROW_CLASS} overflow-visible`}>
            <WorkbenchNameField
              label="设定名"
              value={entry.title}
              width={250}
              disabled
              onValueChange={() => undefined}
              placeholder="设定名"
            />
            <WorkbenchSettingGroupSelect
              value={entry.groupTitle}
              options={[entry.groupTitle]}
              disabled
              onChange={() => undefined}
            />
          </div>
        </header>
        <div className={WORKBENCH_SETTING_EDITOR_SCROLL_CLASS}>
          <div className={WORKBENCH_SETTING_EDITOR_STACK_CLASS}>
            {entry.sections.map((section) => (
              <section
                key={section.id}
                className={entry.sourceKind === 'role' ? 'space-y-4' : 'space-y-3'}
                data-setting-field-group={section.title}
              >
                {entry.sections.length > 1 || section.title !== entry.title ? (
                  <div className={`flex items-center gap-3 ${entry.sourceKind === 'role' ? '' : 'px-1'}`}>
                    <h3 className="shrink-0 text-sm font-black text-slate-700">{section.title}</h3>
                    <span
                      className={`h-px min-w-0 flex-1 ${entry.sourceKind === 'role' ? 'bg-slate-200' : 'bg-[#CDEFF6]'}`}
                      aria-hidden="true"
                    />
                  </div>
                ) : null}
                <div className={WORKBENCH_SETTING_EDITOR_TWO_COLUMN_GRID_CLASS}>
                  {section.fields.map((field) => {
                    const fieldId = `standard-setting-${entry.id}-${field.key}`;
                    const registerField = (node: HTMLInputElement | HTMLTextAreaElement | null) => {
                      if (node) fieldRefs.current.set(field.key, node);
                      else fieldRefs.current.delete(field.key);
                    };
                    if (entry.sourceKind === 'role') {
                      return (
                        <article
                          key={field.key}
                          className={`${roleFieldCardClass} ${field.wide ? 'col-span-2' : ''}`}
                          data-role-field-key={field.key}
                        >
                          <label htmlFor={fieldId} className={roleFieldLabelClass}>{field.title}</label>
                          <RoleAutoSizeTextarea
                            value={field.value}
                            placeholder={field.placeholder}
                            fontSize={16}
                            minRows={3}
                            inputRef={registerField}
                            id={fieldId}
                            ariaLabel={field.title}
                            onChange={(value) => onFieldChange(entry.id, field.key, field.title, value)}
                          />
                        </article>
                      );
                    }
                    return (
                      <article
                        key={field.key}
                        data-field-size={field.displaySize ?? 'standard'}
                        className={`${settingFieldCardClass} ${settingFieldSizeClass[field.displaySize ?? 'standard']} ${field.fieldClassName ?? ''} ${field.wide ? 'col-span-2' : ''}`}
                      >
                        <label htmlFor={fieldId} className={settingFieldLabelClass}>{field.title}</label>
                        {field.control === 'input' ? (
                          <input
                            ref={registerField}
                            id={fieldId}
                            aria-label={field.title}
                            value={field.value}
                            maxLength={field.maxLength}
                            onChange={(event) => onFieldChange(entry.id, field.key, field.title, event.target.value)}
                            placeholder={field.placeholder}
                            className={`min-h-10 w-full border-0 bg-transparent ${settingFieldContentClass}`}
                          />
                        ) : (
                          <textarea
                            ref={registerField}
                            id={fieldId}
                            aria-label={field.title}
                            value={field.value}
                            onChange={(event) => onFieldChange(entry.id, field.key, field.title, event.target.value)}
                            placeholder={field.placeholder}
                            className={`scrollbar-scroll-only scrollbar-half-width min-h-[72px] w-full flex-1 resize-none border-0 bg-transparent pb-1 [scrollbar-gutter:stable] ${settingFieldContentClass}`}
                          />
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
