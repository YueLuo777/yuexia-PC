import type { AuditTextStageState } from '@/features/workbench/model/chapterAuditWorkflow';
import { getTextAuditResultSummary } from '@/features/workbench/model/chapterReviewText';

interface ChapterAuditTextStageCardProps {
  stage: AuditTextStageState | null;
  canRunTextAudit: boolean;
  disabled: boolean;
  reviewAiOutput: string;
  onStartNow: () => void;
  onCancel: () => void;
  onRunManually: () => void;
}

export function ChapterAuditTextStageCard({
  stage,
  canRunTextAudit,
  disabled,
  reviewAiOutput,
  onStartNow,
  onCancel,
  onRunManually,
}: ChapterAuditTextStageCardProps) {
  if (!stage) return null;

  const actionButtonClass =
    'h-8 rounded-lg border border-current/25 bg-white px-3 text-xs font-black transition-colors hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-50';

  if (stage.status === 'countdown') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
        <div className="text-sm font-black">剧情审核已通过</div>
        <div className="mt-1 text-xs font-bold">{stage.seconds}秒后开始文本审核</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={onStartNow} disabled={disabled} className={actionButtonClass}>立即审核</button>
          <button type="button" onClick={onCancel} disabled={disabled} className={actionButtonClass}>取消</button>
        </div>
      </div>
    );
  }

  if (stage.status === 'running') {
    return <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-black text-[#078fb0]">正在进行文本审核……</div>;
  }

  if (stage.status === 'complete') {
    const result = getTextAuditResultSummary(reviewAiOutput);
    return (
      <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-[#078fb0]">
        <div className="text-sm font-black">文本审核 {result?.label || '已完成'}</div>
        <div className="mt-1 text-xs font-bold leading-6 text-[#078fb0]">
          {result?.description || '文本审核已经完成，请查看审核结果。'}
        </div>
      </div>
    );
  }

  if (stage.status === 'disabled') {
    return <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-500">文本审核已禁用，本次审核已结束。</div>;
  }

  const message = stage.status === 'blocked' ? '剧情审核未通过，已停止自动文本审核。' : '已取消自动文本审核。';
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">
      <div className="text-sm font-black">{message}</div>
      {canRunTextAudit ? (
        <button type="button" onClick={onRunManually} disabled={disabled} className={`${actionButtonClass} mt-3`}>
          {stage.status === 'blocked' ? '仍然进行文本审核' : '开始文本审核'}
        </button>
      ) : null}
    </div>
  );
}
