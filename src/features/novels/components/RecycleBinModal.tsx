import { RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { RecycledNovel, WorkType } from '@/features/novels/model/novelTypes';
import { ActionButton } from '@/shared/ui/ActionButton';
import { AppModalShell } from '@/shared/ui/AppModalShell';
import { EmptyState } from '@/shared/ui/EmptyState';

interface RecycleBinModalProps {
  isOpen: boolean;
  type: WorkType;
  items: RecycledNovel[];
  onClose: () => void;
  onRestore: (id: number) => void;
  onPermanentDelete: (id: number) => void;
}

export function RecycleBinModal({ isOpen, type, items, onClose, onRestore, onPermanentDelete }: RecycleBinModalProps) {
  const [, forceRefresh] = useState(0);

  if (!isOpen) return null;

  const typeLabel = type === 'novel' ? '小说' : '剧本';
  const filtered = items.filter((item) => item.type === type);

  return (
    <AppModalShell
      title={`${typeLabel}回收站`}
      subtitle={`总数：${filtered.length}`}
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-[640px]"
      heightClass="h-[520px] max-h-[80vh]"
      zIndexClass="z-50"
      headerExtra={
        <button
          onClick={() => forceRefresh((value) => value + 1)}
          className="flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>刷新</span>
        </button>
      }
    >
      <div className="border-b border-gray-100 px-5 py-3 text-sm text-gray-400">
        删除后的作品会暂存在这里，确认无用后再彻底删除。
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {filtered.length === 0 ? (
          <EmptyState title="回收站为空" description={`删除后的${typeLabel}会显示在这里。`} />
        ) : (
          <div className="space-y-3">
            {filtered.map((novel) => (
              <div key={novel.id} className="rounded-lg border border-gray-100 p-4">
                <div className="mb-1 flex items-start justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{novel.title}</h4>
                  <span className="text-xs text-gray-400">{typeLabel}</span>
                </div>
                <p className="mb-2 text-xs text-gray-400">{novel.synopsis || '暂无简介'}</p>
                <p className="mb-3 text-xs text-gray-400">
                  删除于 {novel.deletedAt}，到期 {novel.expireAt}
                </p>
                <div className="flex items-center justify-end gap-3">
                  <ActionButton onClick={() => onRestore(novel.id)} variant="secondary" size="sm">
                    恢复
                  </ActionButton>
                  <button
                    onClick={() => onPermanentDelete(novel.id)}
                    className="flex h-8 min-w-[88px] items-center justify-center gap-1 rounded-md border border-red-200 px-3 text-sm leading-none text-red-500 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>彻底删除</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppModalShell>
  );
}
