import type { StandardSettingEmptyField } from '@/features/workbench/model/standardModeSettingModel';
import { StandardModeSettingCheckResults } from './StandardModeSettingCheckResults';

type StandardModeSettingCheckPanelProps = {
  results: StandardSettingEmptyField[] | null;
  onCheck: () => void;
  onJump: (result: StandardSettingEmptyField) => void;
};

export function StandardModeSettingCheckPanel({
  results,
  onCheck,
  onJump,
}: StandardModeSettingCheckPanelProps) {
  return (
    <aside className="flex min-h-0 w-[390px] shrink-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-3">
      <div
        data-setting-check-scroll-region="true"
        className={`min-h-0 overflow-y-auto rounded-md border bg-white [scrollbar-gutter:stable] ${
          results === null ? 'shrink-0 border-[#dce1e8]' : 'flex-1 border-slate-300'
        }`}
      >
        <div data-setting-check-content="true" className="min-h-full" aria-live="polite">
          <StandardModeSettingCheckResults results={results} onJump={onJump} />
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
