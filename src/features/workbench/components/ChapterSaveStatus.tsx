import type { WorkbenchSaveStatus } from '@/features/workbench/model/workbenchSaveStatus';

interface ChapterSaveStatusProps {
  status: WorkbenchSaveStatus;
  lastSavedAt: string | null;
  onRetry: () => void;
}

export function ChapterSaveStatus({ status, lastSavedAt, onRetry }: ChapterSaveStatusProps) {
  if (status === 'saving') return <span className="text-slate-500">正在保存...</span>;
  if (status === 'error') {
    return (
      <button type="button" className="text-red-600 hover:text-red-700" onClick={onRetry}>
        保存失败，点击重试
      </button>
    );
  }
  if (status === 'saved' && lastSavedAt) return <span>已保存 {lastSavedAt}</span>;
  return <span>自动保存</span>;
}
