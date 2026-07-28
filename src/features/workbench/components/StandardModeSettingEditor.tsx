import { useEffect, useRef } from 'react';

import type { StandardSettingEntryDescriptor } from '@/features/workbench/model/standardModeSettingModel';

type StandardModeSettingEditorProps = {
  entry: StandardSettingEntryDescriptor | null;
  focusTarget: { entryId: string; fieldKey: string; nonce: number } | null;
  onFieldChange: (entryId: string, fieldKey: string, fieldTitle: string, value: string) => void;
};

const CONTROL_BORDER = '#BFC8D2';
const FIELD_LABEL_CLASS = 'mb-1.5 block text-xs font-bold text-[#657180]';
const INPUT_CLASS =
  'h-9 rounded-md border bg-white px-3 text-sm font-semibold text-[#1f2933] outline-none placeholder:text-[#9aa3af] focus:border-[#08AACE]';
const TEXTAREA_CLASS =
  'editor-scrollbar h-[132px] w-full resize-none rounded-md border bg-white p-3 text-sm font-medium leading-6 text-[#1f2933] outline-none placeholder:text-[#9aa3af] focus:border-[#08AACE]';

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

  const titleCharacters = Math.min(15, Math.max(6, Array.from(entry.title).length));

  return (
    <section
      className="flex min-h-0 min-w-[620px] flex-1 flex-col overflow-hidden bg-white p-5"
      data-standard-setting-editor="true"
      data-standard-setting-editor-style="normal-form"
    >
      <header className="flex shrink-0 items-end gap-4 border-b border-[#dce1e8] pb-4">
        <label>
          <span className={FIELD_LABEL_CLASS}>设定名</span>
          <input
            aria-label="设定名"
            value={entry.title}
            readOnly
            className={INPUT_CLASS}
            style={{ width: `calc(${titleCharacters}em + 24px)`, borderColor: CONTROL_BORDER }}
            data-setting-title-width-characters={titleCharacters}
          />
        </label>
        <label>
          <span className={FIELD_LABEL_CLASS}>所属分组</span>
          <input
            aria-label="所属分组"
            value={entry.groupTitle}
            readOnly
            className={`${INPUT_CLASS} w-[180px]`}
            style={{ borderColor: CONTROL_BORDER }}
          />
        </label>
      </header>

      <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto pt-5 [scrollbar-gutter:stable]">
        {entry.sections.map((section) => (
          <section key={section.id} className="mb-5" data-setting-field-group={section.title}>
            {entry.sections.length > 1 || section.title !== entry.title ? (
              <div className="mb-3 flex items-center gap-3">
                <h3 className="shrink-0 text-sm font-bold text-[#657180]">{section.title}</h3>
                <span className="h-px min-w-0 flex-1 bg-[#dce1e8]" aria-hidden="true" />
              </div>
            ) : null}
            <div className="grid grid-cols-2 items-start gap-x-4 gap-y-4">
              {section.fields.map((field) => {
                const fieldId = `standard-setting-${entry.id}-${field.key}`;
                const registerField = (node: HTMLInputElement | HTMLTextAreaElement | null) => {
                  if (node) fieldRefs.current.set(field.key, node);
                  else fieldRefs.current.delete(field.key);
                };
                return (
                  <label key={field.key} className={field.wide ? 'col-span-2' : ''} data-field-size={field.displaySize ?? 'standard'}>
                    <span className={FIELD_LABEL_CLASS}>{field.title}</span>
                    {field.control === 'input' ? (
                      <input
                        ref={registerField}
                        id={fieldId}
                        aria-label={field.title}
                        value={field.value}
                        maxLength={field.maxLength}
                        onChange={(event) => onFieldChange(entry.id, field.key, field.title, event.target.value)}
                        placeholder={field.placeholder}
                        className={`${INPUT_CLASS} w-full`}
                        style={{ borderColor: CONTROL_BORDER }}
                      />
                    ) : (
                      <textarea
                        ref={registerField}
                        id={fieldId}
                        aria-label={field.title}
                        value={field.value}
                        onChange={(event) => onFieldChange(entry.id, field.key, field.title, event.target.value)}
                        placeholder={field.placeholder}
                        className={TEXTAREA_CLASS}
                        style={{ borderColor: CONTROL_BORDER }}
                      />
                    )}
                  </label>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
