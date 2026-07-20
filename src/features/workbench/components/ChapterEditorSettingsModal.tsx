import { createPortal } from 'react-dom';

import { WorkbenchNavigationWidthToggle } from './WorkbenchNavigationWidthToggle';

interface ChapterEditorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChapterEditorSettingsModal({ isOpen, onClose }: ChapterEditorSettingsModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[340] flex items-center justify-center bg-black/35 p-4" onClick={onClose}>
      <section
        className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-black text-slate-900">作品编辑器设置</h3>
            <p className="mt-1 text-xs font-bold text-slate-400">调整作品编辑器导航宽度。</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label="关闭设置"
          >
            ×
          </button>
        </header>
        <div className="p-5">
          <WorkbenchNavigationWidthToggle />
        </div>
        <footer className="flex shrink-0 justify-end border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#08AACE] px-5 py-2 text-sm font-black text-white hover:bg-[#0798b8]"
          >
            完成
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
