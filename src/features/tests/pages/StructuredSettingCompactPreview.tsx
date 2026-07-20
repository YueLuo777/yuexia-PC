import { Check } from 'lucide-react';
import { useMemo, useState } from 'react';

import type {
  StructuredSettingFieldDefinition,
  StructuredSettingFieldSet,
} from '@/features/workbench/components/workbenchStructuredSettings';

import {
  getCompactFieldLayout,
  getCompactTitleWidth,
  getVisibleFieldKeys,
} from './structuredSettingCompactLayout';

const controlClassName =
  'rounded-[10px] border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#08AACE] focus:ring-4 focus:ring-[#08AACE]/10';

const fieldLayoutClassName = {
  short: 'sm:col-span-4 xl:col-span-3',
  medium: 'sm:col-span-6 xl:col-span-4',
  half: 'sm:col-span-6',
  full: 'sm:col-span-12',
} as const;

type StructuredSettingCompactPreviewProps = {
  fieldSet: StructuredSettingFieldSet;
  variant?: 'card' | 'workspace';
};

function CompactField({
  field,
  value,
  onChange,
}: {
  field: StructuredSettingFieldDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  const layout = getCompactFieldLayout(field);
  const isSingleLine = field.control === 'input' || layout === 'short' || layout === 'medium';
  return (
    <label
      className={`flex min-w-0 items-start gap-3 ${fieldLayoutClassName[layout]}`}
      data-field-layout={layout}
    >
      <span className="w-[92px] shrink-0 pt-2.5 text-sm font-bold leading-5 text-slate-600">{field.title}</span>
      {isSingleLine ? (
        <input
          aria-label={field.title}
          value={value}
          maxLength={field.maxLength}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className={`${controlClassName} h-10 min-w-0 flex-1`}
        />
      ) : (
        <textarea
          aria-label={field.title}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className={`${controlClassName} h-[86px] min-w-0 flex-1 resize-none py-2.5 leading-6`}
        />
      )}
    </label>
  );
}

export function StructuredSettingCompactPreview({
  fieldSet,
  variant = 'card',
}: StructuredSettingCompactPreviewProps) {
  const groupTitles = fieldSet.groups?.map((group) => group.title) ?? [];
  const [activeGroup, setActiveGroup] = useState(groupTitles[0] ?? '');
  const [values, setValues] = useState<Record<string, string>>({});
  const titleLabel = fieldSet.titleFieldLabel ?? '设定名';
  const headerKeys = fieldSet.headerFieldKeys ?? [];
  const visibleKeys = getVisibleFieldKeys(fieldSet, activeGroup);
  const visibleFields = useMemo(
    () => visibleKeys.map((key) => fieldSet.fields.find((field) => field.key === key)).filter(Boolean),
    [fieldSet, visibleKeys],
  ) as StructuredSettingFieldDefinition[];
  const activeGroupDefinition = fieldSet.groups?.find((group) => group.title === activeGroup);

  const updateValue = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <section
      className={
        variant === 'workspace'
          ? 'flex h-full min-h-0 flex-col overflow-y-auto bg-white px-5 py-3'
          : 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="text-xs font-bold tracking-[0.14em] text-[#08AACE]">
            {variant === 'workspace' ? '设定编辑' : '图1式紧凑表单'}
          </div>
          <h2 className="mt-1 text-xl font-black text-slate-950">{fieldSet.entryTitle}</h2>
        </div>
        <span className="rounded-full bg-[#E7F8FD] px-3 py-1 text-xs font-bold text-[#078FAE]">
          标签左置 · 内容定宽
        </span>
      </div>

      {groupTitles.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {groupTitles.map((title) => (
            <button
              key={title}
              type="button"
              onClick={() => setActiveGroup(title)}
              className={`h-9 rounded-[10px] px-4 text-sm font-bold transition ${
                activeGroup === title
                  ? 'bg-[#08AACE] text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:text-[#078FAE]'
              }`}
            >
              {title}
            </button>
          ))}
        </div>
      )}

      {activeGroupDefinition?.description && (
        <p className="mt-3 rounded-[10px] bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
          {activeGroupDefinition.description}
        </p>
      )}

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <label className="flex items-center gap-3">
            <span className="w-[92px] shrink-0 text-sm font-bold text-slate-600">{titleLabel}</span>
            <input
              aria-label={titleLabel}
              value={values.__title ?? ''}
              onChange={(event) => updateValue('__title', event.target.value)}
              placeholder={fieldSet.entryTitle}
              className={`${controlClassName} h-10 max-w-full ${getCompactTitleWidth(fieldSet)}`}
            />
          </label>
          {headerKeys.map((key) => {
            const field = fieldSet.fields.find((item) => item.key === key);
            if (!field) return null;
            return (
              <label key={field.key} className="flex items-center gap-3">
                <span className="shrink-0 text-sm font-bold text-slate-600">{field.title}</span>
                <input
                  aria-label={field.title}
                  value={values[field.key] ?? ''}
                  maxLength={field.maxLength}
                  onChange={(event) => updateValue(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className={`${controlClassName} h-10 w-[176px]`}
                />
              </label>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-12">
          {visibleFields.map((field) => (
            <CompactField
              key={field.key}
              field={field}
              value={values[field.key] ?? ''}
              onChange={(value) => updateValue(field.key, value)}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
        {[
          '编号、章节、状态使用短框',
          '来源、条件、进度使用中框',
          '一般描述使用半宽框',
          '概括、规划、伏笔与长叙述整行展示',
        ].map((text) => (
          <span key={text} className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            {text}
          </span>
        ))}
      </div>
    </section>
  );
}
