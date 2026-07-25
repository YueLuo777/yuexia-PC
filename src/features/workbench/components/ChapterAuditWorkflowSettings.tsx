import {
  MAX_TEXT_AUDIT_COUNTDOWN_SECONDS,
  MIN_TEXT_AUDIT_COUNTDOWN_SECONDS,
} from '@/features/workbench/model/chapterAuditWorkflow';

interface ChapterAuditWorkflowSettingsProps {
  seconds: number;
  onChange: (seconds: number) => void;
}

export function ChapterAuditWorkflowSettings({ seconds, onChange }: ChapterAuditWorkflowSettingsProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="text-sm font-black text-slate-800">文本审核倒计时</div>
      <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
        剧情审核全部通过后，等待指定秒数再自动开始文本审核；设置为0秒时立即开始。
      </p>
      <div className="mt-3 flex items-center gap-3">
        <input
          aria-label="文本审核倒计时"
          type="number"
          min={MIN_TEXT_AUDIT_COUNTDOWN_SECONDS}
          max={MAX_TEXT_AUDIT_COUNTDOWN_SECONDS}
          value={seconds}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-10 w-28 rounded-xl border border-slate-300 bg-white px-3 text-center text-sm font-black text-slate-800 outline-none focus:border-[#08AACE]"
        />
        <span className="text-sm font-bold text-slate-500">秒</span>
      </div>
    </section>
  );
}
