import type { CSSProperties } from 'react';

import {
  getCompactStructuredFieldLayout,
  getCompactStructuredTitleWidth,
} from './workbenchStructuredSettingCompactLayout';
import type {
  StructuredSettingFieldDefinition,
  StructuredSettingFieldSet,
} from './workbenchStructuredSettings';

const controlClassName =
  'rounded-[10px] border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#08AACE] focus:ring-4 focus:ring-[#08AACE]/10 disabled:bg-slate-50 disabled:text-slate-400';

const fieldLayoutClassName = {
  short: 'sm:col-span-4 xl:col-span-3',
  medium: 'sm:col-span-6',
  half: 'sm:col-span-6',
  full: 'sm:col-span-12',
} as const;

type StructuredSettingCompactTitleFieldsProps = {
  fieldSet: StructuredSettingFieldSet;
  titleValue: string;
  titleDisabled?: boolean;
  values: Record<string, string>;
  fontSize?: number;
  onTitleChange: (value: string) => void;
  onFieldChange: (key: string, value: string) => void;
  onFocus?: () => void;
};

export function StructuredSettingCompactTitleFields({
  fieldSet,
  titleValue,
  titleDisabled = false,
  values,
  fontSize,
  onTitleChange,
  onFieldChange,
  onFocus,
}: StructuredSettingCompactTitleFieldsProps) {
  const titleLabel = fieldSet.titleFieldLabel ?? '设定名';
  const textStyle = fontSize ? ({ fontSize } as CSSProperties) : undefined;
  return (
    <div data-testid="structured-title-row" className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <label className="flex items-center gap-3">
        <span className="w-[92px] shrink-0 text-sm font-bold text-slate-600">{titleLabel}</span>
        <input
          data-no-modal-drag="true"
          data-testid="structured-title-field"
          aria-label={titleLabel}
          value={titleValue}
          disabled={titleDisabled}
          onFocus={onFocus}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={fieldSet.entryTitle}
          style={textStyle}
          className={`${controlClassName} h-10 max-w-full ${getCompactStructuredTitleWidth(fieldSet)}`}
        />
      </label>
      {(fieldSet.headerFieldKeys ?? []).map((key) => {
        const field = fieldSet.fields.find((item) => item.key === key);
        if (!field) return null;
        return (
          <label key={field.key} className="flex items-center gap-3">
            <span className="shrink-0 text-sm font-bold text-slate-600">{field.title}</span>
            <input
              data-no-modal-drag="true"
              aria-label={field.title}
              value={values[field.key] ?? ''}
              maxLength={field.maxLength}
              onFocus={onFocus}
              onChange={(event) => onFieldChange(field.key, event.target.value)}
              placeholder={field.placeholder ?? `填写${field.title}`}
              style={textStyle}
              className={`${controlClassName} h-10 w-[176px]`}
            />
          </label>
        );
      })}
    </div>
  );
}

type StructuredSettingCompactFieldsProps = {
  fieldSet: StructuredSettingFieldSet;
  fieldKeys: readonly string[];
  values: Record<string, string>;
  fontSize?: number;
  activeScrollKey?: string | null;
  onFieldChange: (key: string, value: string) => void;
  onFocus?: () => void;
  onFieldScroll?: (key: string) => void;
};

function CompactField({
  field,
  fieldSetId,
  value,
  fontSize,
  activeScrollKey,
  onChange,
  onFocus,
  onScroll,
}: {
  field: StructuredSettingFieldDefinition;
  fieldSetId: string;
  value: string;
  fontSize?: number;
  activeScrollKey?: string | null;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onScroll?: () => void;
}) {
  const layout = getCompactStructuredFieldLayout(field);
  const isSingleLine = field.control === 'input' || layout === 'short';
  const scrollKey = `setting-textarea:${fieldSetId}:${field.key}`;
  const textStyle = fontSize ? ({ fontSize } as CSSProperties) : undefined;
  return (
    <label className={`flex min-w-0 items-start gap-3 ${fieldLayoutClassName[layout]}`} data-field-layout={layout}>
      <span className="w-[92px] shrink-0 pt-2.5 text-sm font-bold leading-5 text-slate-600">{field.title}</span>
      {isSingleLine ? (
        <input
          data-no-modal-drag="true"
          aria-label={field.title}
          value={value}
          maxLength={field.maxLength}
          onFocus={onFocus}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder ?? `填写${field.title}`}
          style={textStyle}
          className={`${controlClassName} h-10 min-w-0 flex-1`}
        />
      ) : (
        <textarea
          data-no-modal-drag="true"
          aria-label={field.title}
          value={value}
          onFocus={onFocus}
          onChange={(event) => onChange(event.target.value)}
          onScroll={onScroll}
          placeholder={field.placeholder ?? `填写${field.title}`}
          style={textStyle}
          className={`${controlClassName} scrollbar-scroll-only scrollbar-half-width h-[86px] min-w-0 flex-1 resize-none py-2.5 leading-6 ${activeScrollKey === scrollKey ? 'scrollbar-active' : ''}`}
        />
      )}
    </label>
  );
}

export function StructuredSettingCompactFields({
  fieldSet,
  fieldKeys,
  values,
  fontSize,
  activeScrollKey,
  onFieldChange,
  onFocus,
  onFieldScroll,
}: StructuredSettingCompactFieldsProps) {
  const headerKeys = new Set(fieldSet.headerFieldKeys ?? []);
  return (
    <div data-testid="structured-setting-fields" className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-12">
      {fieldKeys
        .filter((key) => !headerKeys.has(key))
        .map((key) => fieldSet.fields.find((field) => field.key === key))
        .filter((field): field is StructuredSettingFieldDefinition => Boolean(field))
        .map((field) => (
          <CompactField
            key={field.key}
            field={field}
            fieldSetId={fieldSet.id}
            value={values[field.key] ?? ''}
            fontSize={fontSize}
            activeScrollKey={activeScrollKey}
            onFocus={onFocus}
            onChange={(value) => onFieldChange(field.key, value)}
            onScroll={() => onFieldScroll?.(`setting-textarea:${fieldSet.id}:${field.key}`)}
          />
        ))}
    </div>
  );
}
