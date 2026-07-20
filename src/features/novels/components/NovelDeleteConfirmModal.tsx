import { AlertTriangle } from 'lucide-react';

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-[420px] rounded-xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-bold text-gray-900">确认删除</h3>
        </div>
        <p className="mb-3 text-xs text-gray-400">{title}</p>
        <p className="mb-6 text-sm text-gray-500">删除后将进入回收站，30 天内可恢复；到期后自动删除。</p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-200 px-5 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-amber-500 px-5 py-2 text-sm text-white hover:bg-amber-600 transition-colors"
          >
            移入回收站
          </button>
        </div>
      </div>
    </div>
  );
}
