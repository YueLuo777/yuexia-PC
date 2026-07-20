import type { CSSProperties } from 'react';

import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';

import {
  CONCEPT_INSPIRATION_FIELDS,
  type ConceptInspirationDraft,
  type InspirationSaveMode,
} from './ConceptLibraryParts';

export const INSPIRATION_GENERATE_COUNTS = [1, 3, 5, 10] as const;

export function normalizeInspirationGenerateCount(value: string | number) {
  const parsed = Number(value);
  return INSPIRATION_GENERATE_COUNTS.includes(parsed as (typeof INSPIRATION_GENERATE_COUNTS)[number]) ? parsed : 1;
}

export function buildInspirationGenerationUserContent(rawInput: string, index: number, count: number) {
  if (count <= 1) return rawInput;
  return [
    rawInput,
    '',
    `本次需要生成 ${count} 个彼此明显不同的方案；当前请只返回第 ${index + 1} 个方案。`,
    '避免与同批次其他方案使用相同的标题、核心冲突或主要桥段。',
  ].join('\n');
}

interface ConceptInspirationFormProps {
  models: Array<{ id: string; name: string }>;
  activeModelId: string | null;
  draft: ConceptInspirationDraft;
  generateCount: string;
  isSubmitting: boolean;
  canSubmit: boolean;
  onModelChange: (value: string | null) => void;
  onManageModels: () => void;
  onManagePrompts: () => void;
  onFieldChange: (key: keyof ConceptInspirationDraft, value: string) => void;
  onGenerateCountChange: (value: string) => void;
  onSubmit: (mode: InspirationSaveMode) => void;
}

export function ConceptInspirationForm({
  models,
  activeModelId,
  draft,
  generateCount,
  isSubmitting,
  canSubmit,
  onModelChange,
  onManageModels,
  onManagePrompts,
  onFieldChange,
  onGenerateCountChange,
  onSubmit,
}: ConceptInspirationFormProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <h3 className="shrink-0 text-base font-bold text-gray-900">脑洞生成</h3>
      <div className="mt-3 flex max-w-full items-start gap-2">
        <CombinedAiConfigSelect
          className="w-full"
          style={{ width: '100%', maxWidth: '100%', '--xy-field-width': '100%' } as CSSProperties}
          modelValue={activeModelId ?? ''}
          promptValue="brainstorm"
          modelOptions={
            models.length === 0
              ? [{ value: '', label: '暂无可用模型', disabled: true }]
              : models.map((model) => ({ value: model.id, label: model.name }))
          }
          promptOptions={[{ value: 'brainstorm', label: '脑洞' }]}
          onModelChange={(value) => onModelChange(value || null)}
          onPromptChange={() => undefined}
          onModelManage={onManageModels}
          onPromptManage={onManagePrompts}
        />
      </div>
      <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="xy-brainstorm-question-panel editor-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {CONCEPT_INSPIRATION_FIELDS.filter((field) => field.key === 'genre' || field.key === 'theme').map(
              (field) => (
                <label key={field.key} className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-600">
                  <span className="shrink-0">{field.label}</span>
                  <input
                    data-no-modal-drag
                    value={draft[field.key]}
                    onChange={(event) => onFieldChange(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    className={`h-9 min-w-0 rounded-[10px] border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#08AACE] focus:ring-4 focus:ring-[#08AACE]/10 ${field.key === 'genre' ? 'w-[118px]' : 'w-[105px]'}`}
                  />
                </label>
              ),
            )}
          </div>
          {CONCEPT_INSPIRATION_FIELDS.filter((field) => field.key === 'cheat').map((field) => (
            <label key={field.key} className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-600">
              <span className="w-[84px] shrink-0">{field.label}</span>
              <input
                data-no-modal-drag
                value={draft[field.key]}
                onChange={(event) => onFieldChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                className="h-9 min-w-0 flex-1 rounded-[10px] border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#08AACE] focus:ring-4 focus:ring-[#08AACE]/10"
              />
            </label>
          ))}
          {CONCEPT_INSPIRATION_FIELDS.filter((field) => field.key === 'idea' || field.key === 'requirement').map(
            (field) => (
              <label key={field.key} className="mt-2 flex items-start gap-2 text-sm font-bold text-slate-600">
                <span className="w-[84px] shrink-0 pt-2">{field.label}</span>
                <textarea
                  data-no-modal-drag
                  value={draft[field.key]}
                  onChange={(event) => onFieldChange(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className={`${field.key === 'requirement' ? 'h-20' : 'h-16'} min-w-0 flex-1 resize-none rounded-[10px] border border-slate-200 bg-white p-3 text-sm font-medium leading-5 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#08AACE] focus:ring-4 focus:ring-[#08AACE]/10`}
                />
              </label>
            ),
          )}
        </div>
        <div className="mt-2 flex items-center gap-3">
          <span className="shrink-0 text-sm font-black text-slate-950">生成个数：</span>
          <div className="flex h-8 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {INSPIRATION_GENERATE_COUNTS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onGenerateCountChange(String(value))}
                className={`min-w-0 flex-1 border-r border-slate-200 px-2 text-sm font-black leading-none transition-colors last:border-r-0 ${
                  generateCount === String(value)
                    ? 'bg-[#08AACE] text-white'
                    : 'bg-white text-slate-700 hover:bg-[#EAF9FD] hover:text-[#08AACE]'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(
            [
              ['normal', '整理保存'],
              ['association', '联想保存'],
              ['both', '同时保存'],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => onSubmit(mode)}
              disabled={!canSubmit || isSubmitting}
              className={`h-10 rounded-xl px-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-white ${
                mode === 'normal'
                  ? 'bg-brand text-white hover:bg-brand-dark'
                  : mode === 'association'
                    ? 'border border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isSubmitting ? '生成中...' : label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
