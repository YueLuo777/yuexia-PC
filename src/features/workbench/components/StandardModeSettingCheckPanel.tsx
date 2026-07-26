import { CheckCircle2 } from 'lucide-react';

import type { StandardSettingEmptyField } from '@/features/workbench/model/standardModeSettingModel';

type StandardModeSettingCheckPanelProps = {
  results: StandardSettingEmptyField[] | null;
  onCheck: () => void;
  onJump: (result: StandardSettingEmptyField) => void;
};

export function StandardModeSettingCheckPanel({ results, onCheck, onJump }: StandardModeSettingCheckPanelProps) {
  return (
    <aside className="flex min-h-0 w-[360px] shrink-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-3">
      <div
        data-setting-check-scroll-region="true"
        className="min-h-0 flex-1 overflow-y-auto rounded-[20px] border-2 border-slate-950 bg-white [scrollbar-gutter:stable]"
      >
        <div data-setting-check-content="true" className="min-h-full p-4" aria-live="polite">
          {results === null ? null : results.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <strong className="mt-3 text-base font-bold text-slate-800">所有设定都已填写</strong>
              <span className="mt-1 text-sm font-medium text-slate-500">没有发现内容为空的子设定。</span>
            </div>
          ) : (
            <div>
              <div className="sticky top-0 z-10 border-b border-[#e4e9ee] bg-white pb-3">
                <strong className="text-base font-bold text-slate-900">发现 {results.length} 处未填写</strong>
                <p className="mt-1 text-sm font-medium text-slate-500">点击跳转可直接定位到对应输入框。</p>
              </div>
              <div className="divide-y divide-[#e8edf2]">
                {results.map((result) => (
                  <div key={`${result.entryId}:${result.fieldKey}`} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-slate-400" title={result.path}>
                        {result.path}
                      </div>
                      <div className="mt-1 truncate text-sm font-bold text-slate-800">{result.fieldTitle}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onJump(result)}
                      className="h-8 shrink-0 rounded-md border border-[#8fd7e5] bg-white px-3 text-xs font-bold text-[#078fab] hover:bg-[#eaf9fc]"
                    >
                      跳转
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onCheck}
        className="mt-3 h-11 shrink-0 rounded-md bg-[#08AACE] px-5 text-sm font-bold text-white hover:bg-[#0797b8]"
      >
        一键检查
      </button>
    </aside>
  );
}
