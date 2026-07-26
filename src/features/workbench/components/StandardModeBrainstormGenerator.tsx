import { forwardRef } from 'react';

import type { StandardBrainstormGenerationDraft } from '@/features/workbench/model/standardModeBrainstormModel';

interface StandardModeBrainstormGeneratorProps {
  draft: StandardBrainstormGenerationDraft;
  isGenerating: boolean;
  progress: string;
  onFieldChange: <Key extends keyof StandardBrainstormGenerationDraft>(
    key: Key,
    value: StandardBrainstormGenerationDraft[Key],
  ) => void;
  onGenerate: () => void;
  onStop: () => void;
}

const INPUT_FIELDS: Array<{
  key: Exclude<keyof StandardBrainstormGenerationDraft, 'otherRequirements'>;
  label: string;
  placeholder: string;
}> = [
  { key: 'workType', label: '作品类型', placeholder: '如都市、玄幻' },
  { key: 'genre', label: '作品流派', placeholder: '如系统流、凡人流、天才流' },
  { key: 'expectedLength', label: '预计篇幅', placeholder: '如100万、200万' },
  { key: 'protagonistCheat', label: '主角金手指', placeholder: '如吞噬系统、神豪系统' },
];

const INPUT_ROWS = [INPUT_FIELDS.slice(0, 2), INPUT_FIELDS.slice(2, 4)];

export const StandardModeBrainstormGenerator = forwardRef<HTMLInputElement, StandardModeBrainstormGeneratorProps>(
  function StandardModeBrainstormGenerator(
    { draft, isGenerating, progress, onFieldChange, onGenerate, onStop },
    firstInputRef,
  ) {
    return (
      <aside className="flex min-h-0 flex-col bg-[#fbfdff] p-4">
        <div className="border-b border-[#dce1e8] pb-3">
          <h2 className="text-base font-bold text-[#1f2933]">脑洞生成</h2>
          <p className="mt-1 text-xs font-medium text-[#8a95a2]">填写基础方向，软件会自动使用当前AI配置。</p>
        </div>

        <div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto px-0.5 py-4">
          {INPUT_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-2 gap-3">
              {row.map((field, fieldIndex) => (
                <div
                  key={field.key}
                  className={`xy-floating-field xy-floating-outline-fixed xy-floating-visible-placeholder ${
                    draft[field.key].trim() ? 'xy-has-value' : ''
                  }`}
                >
                  <input
                    ref={rowIndex === 0 && fieldIndex === 0 ? firstInputRef : undefined}
                    value={draft[field.key]}
                    onChange={(event) => onFieldChange(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    className="h-10 text-sm font-medium placeholder:text-[13px] placeholder:font-medium"
                  />
                  <label className="xy-border-embedded-transparent-backplate">{field.label}</label>
                </div>
              ))}
            </div>
          ))}

          <div
            className={`xy-floating-field xy-floating-outline-fixed xy-floating-visible-placeholder ${
              draft.otherRequirements.trim() ? 'xy-has-value' : ''
            }`}
          >
            <textarea
              value={draft.otherRequirements}
              onChange={(event) => onFieldChange('otherRequirements', event.target.value)}
              placeholder="可补充主角特点、故事背景、核心冲突、希望避开的内容等"
              className="editor-scrollbar min-h-[150px] resize-none text-sm font-medium leading-6 placeholder:text-[13px] placeholder:font-medium"
              aria-label="其他要求"
            />
            <label className="xy-border-embedded-transparent-backplate">其他要求</label>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#dce1e8] pt-3">
          {progress && <div className="mb-2 text-center text-xs font-semibold text-[#078FAB]">{progress}</div>}
          <button
            type="button"
            onClick={isGenerating ? onStop : onGenerate}
            className={`h-10 w-full rounded-md text-sm font-bold transition-colors ${
              isGenerating
                ? 'border border-red-200 bg-white text-red-500 hover:bg-red-50'
                : 'bg-[#08AACE] text-white hover:bg-[#0798B8]'
            }`}
          >
            {isGenerating ? '停止生成' : '开始生成脑洞'}
          </button>
        </div>
      </aside>
    );
  },
);
