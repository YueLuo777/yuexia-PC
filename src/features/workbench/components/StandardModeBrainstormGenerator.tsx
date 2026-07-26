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

const GENERATION_FIELDS: Array<{
  key: Exclude<keyof StandardBrainstormGenerationDraft, 'otherRequirements'>;
  label: string;
  placeholder: string;
  options: string[];
}> = [
  { key: 'workType', label: '作品类型', placeholder: '也可以自行输入', options: ['玄幻', '仙侠', '都市', '科幻', '末世'] },
  { key: 'genre', label: '作品流派', placeholder: '也可以自行输入', options: ['系统流', '凡人流', '天才流', '争霸流'] },
  { key: 'expectedLength', label: '预计篇幅', placeholder: '如150万字', options: ['50万字', '100万字', '200万字'] },
  { key: 'protagonistCheat', label: '主角金手指', placeholder: '如吞噬系统，也可留空', options: ['系统', '重生', '传承', '无金手指'] },
];

export const StandardModeBrainstormGenerator = forwardRef<HTMLInputElement, StandardModeBrainstormGeneratorProps>(
  function StandardModeBrainstormGenerator(
    { draft, isGenerating, progress, onFieldChange, onGenerate, onStop },
    firstInputRef,
  ) {
    return (
      <aside className="flex min-h-0 flex-col bg-[#fbfdff] p-4">
        <div className="border-b border-[#dce1e8] pb-3">
          <h2 className="text-base font-bold text-[#1f2933]">生成条件</h2>
          <p className="mt-1 text-xs font-medium text-[#8a95a2]">先选常用方向，需要时再补充自己的要求。</p>
        </div>

        <div className="editor-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-0.5 py-4">
          {GENERATION_FIELDS.map((field, fieldIndex) => (
            <section key={field.key}>
              <div className="mb-2 text-xs font-bold text-[#657180]">{field.label}</div>
              <div className="flex flex-wrap gap-1.5">
                {field.options.map((option) => {
                  const selected = draft[field.key] === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onFieldChange(field.key, selected ? '' : option)}
                      className={`h-8 rounded-md border px-2.5 text-xs font-semibold ${
                        selected
                          ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAB]'
                          : 'border-[#dce1e8] bg-white text-[#657180] hover:border-[#8fd8e7]'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              <input
                ref={fieldIndex === 0 ? firstInputRef : undefined}
                value={draft[field.key]}
                onChange={(event) => onFieldChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                aria-label={`${field.label}自定义输入`}
                className="mt-2 h-9 w-full rounded-md border border-[#dce1e8] bg-white px-3 text-sm font-medium outline-none placeholder:text-xs placeholder:text-[#9aa3af] focus:border-[#08AACE]"
              />
            </section>
          ))}

          <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-visible-placeholder ${draft.otherRequirements.trim() ? 'xy-has-value' : ''}`}>
            <textarea
              value={draft.otherRequirements}
              onChange={(event) => onFieldChange('otherRequirements', event.target.value)}
              placeholder="可补充主角特点、故事背景、核心冲突和希望避开的内容"
              className="editor-scrollbar min-h-[130px] resize-none text-sm font-medium leading-6 placeholder:text-xs placeholder:font-medium"
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
