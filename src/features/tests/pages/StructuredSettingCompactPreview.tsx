import { Check } from 'lucide-react';
import { useState } from 'react';

import {
  StructuredSettingCompactFields,
  StructuredSettingCompactTitleFields,
} from '@/features/workbench/components/StructuredSettingCompactFields';
import type { StructuredSettingFieldSet } from '@/features/workbench/components/workbenchStructuredSettings';

import { getVisibleFieldKeys } from './structuredSettingCompactLayout';

type StructuredSettingCompactPreviewProps = {
  fieldSet: StructuredSettingFieldSet;
  variant?: 'card' | 'workspace';
};

export function StructuredSettingCompactPreview({
  fieldSet,
  variant = 'card',
}: StructuredSettingCompactPreviewProps) {
  const groupTitles = fieldSet.groups?.map((group) => group.title) ?? [];
  const [activeGroup, setActiveGroup] = useState(groupTitles[0] ?? '');
  const [values, setValues] = useState<Record<string, string>>({});
  const visibleKeys = getVisibleFieldKeys(fieldSet, activeGroup);
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
        <StructuredSettingCompactTitleFields
          fieldSet={fieldSet}
          titleValue={values.__title ?? ''}
          values={values}
          onTitleChange={(value) => updateValue('__title', value)}
          onFieldChange={updateValue}
        />
        <div className="mt-4">
          <StructuredSettingCompactFields
            fieldSet={fieldSet}
            fieldKeys={visibleKeys}
            values={values}
            onFieldChange={updateValue}
          />
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
