import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { ActionButton } from '@/shared/ui/ActionButton';

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
  useTopModalEscape(isOpen, onClose);

  useEffect(() => {
    if (isOpen) setName('');
  }, [isOpen]);

  if (!isOpen) return null;

  const confirm = () => {
    if (!name.trim()) return;
    onConfirm(name);
  };

  return createPortal(
    <div className="modal-sharp fixed inset-0 z-[300] flex items-center justify-center bg-black/40" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-category-create-title"
        className="modal-sharp w-[440px] max-w-[92vw] overflow-hidden rounded-xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 id="prompt-category-create-title" className="text-lg font-black text-slate-900">
              新增分类
            </h2>
            <p className="mt-1 text-xs font-bold text-slate-400">输入小说提示词的分类名称</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:border-[#08AACE]/50 hover:bg-[#EAF9FD] hover:text-[#078fb0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE4F2]"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
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
      </section>
    </div>,
    document.body,
  );
}
