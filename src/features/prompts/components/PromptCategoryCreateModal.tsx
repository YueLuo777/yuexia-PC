import { useEffect, useState } from 'react';

import { ActionButton } from '@/shared/ui/ActionButton';
import { AppModalShell } from '@/shared/ui/AppModalShell';

export function PromptCategoryCreateModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}) {
  const [name, setName] = useState('');
  useEffect(() => {
    if (isOpen) setName('');
  }, [isOpen]);

  if (!isOpen) return null;

  const confirm = () => {
    if (!name.trim()) return;
    onConfirm(name);
  };

  return (
    <AppModalShell
      title="新增分类"
      subtitle="输入小说提示词的分类名称"
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-[440px]"
      heightClass="h-auto"
      storageId="prompt_category_create"
      zIndexClass="z-[300]"
    >
        <div className="px-6 py-5">
          <label className="block text-sm font-bold text-slate-700" htmlFor="prompt-category-name">
            分类名称
          </label>
          <input
            id="prompt-category-name"
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') confirm();
            }}
            placeholder="请输入分类名称"
            className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#08AACE] focus:ring-4 focus:ring-[#08AACE]/10"
          />
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          <ActionButton onClick={onClose} variant="secondary">
            取消
          </ActionButton>
          <ActionButton onClick={confirm} disabled={!name.trim()}>
            确定
          </ActionButton>
        </footer>
    </AppModalShell>
  );
}
