import { CheckCircle2 } from 'lucide-react';

import type { StandardSettingEmptyField } from '@/features/workbench/model/standardModeSettingModel';

type StandardModeSettingCheckResultsProps = {
  results: StandardSettingEmptyField[] | null;
  onJump: (result: StandardSettingEmptyField) => void;
};

export function StandardModeSettingCheckResults({ results, onJump }: StandardModeSettingCheckResultsProps) {
  if (results === null) {
    return (
      <div className="flex items-start gap-3 p-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#bde7ef] bg-[#EAF9FD] text-sm font-black text-[#078FAB]">
          检
        </div>
        <div>
          <strong className="text-sm font-bold text-slate-800">设定检查</strong>
          <p className="mt-1 text-xs font-medium leading-5 text-slate-500">点击下方按钮，检查所有设定中还没有填写的内容。</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex h-full min-h-48 flex-col items-center justify-center p-4 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        <strong className="mt-3 text-base font-bold text-slate-800">所有设定都已填写</strong>
        <span className="mt-1 text-sm font-medium text-slate-500">没有发现内容为空的设定字段。</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="sticky top-0 z-10 border-b border-[#e4e9ee] bg-white pb-3">
        <strong className="text-base font-bold text-slate-900">发现 {results.length} 处未填写</strong>
        <p className="mt-1 text-sm font-medium text-slate-500">点击跳转可直接定位到对应设定框。</p>
      </div>
      <div className="divide-y divide-[#e8edf2]">
        {results.map((result) => (
          <div
            key={`${result.entryId}:${result.fieldKey}`}
            data-setting-check-result="true"
            data-check-entry-id={result.entryId}
            data-check-field-key={result.fieldKey}
            className="flex items-center gap-3 py-3"
          >
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
  );
}
