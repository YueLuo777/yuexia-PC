import { Keyboard, RotateCcw, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  bindingFromKeyboardEvent,
  formatShortcut,
  getDefaultShortcutBindings,
  loadShortcutBindings,
  saveShortcutBindings,
  shortcutActions,
  type ShortcutActionId,
} from '@/shared/shortcuts/shortcutConfig';

interface ShortcutSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutSettingsModal({ isOpen, onClose }: ShortcutSettingsModalProps) {
  const [bindings, setBindings] = useState(loadShortcutBindings);
  const [editingId, setEditingId] = useState<ShortcutActionId | null>(null);

  useEffect(() => {
    if (isOpen) setBindings(loadShortcutBindings());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !editingId) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const binding = bindingFromKeyboardEvent(event);
      if (!binding) return;
      setBindings((prev) => {
        const next = { ...prev, [editingId]: binding };
        saveShortcutBindings(next);
        return next;
      });
      setEditingId(null);
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [editingId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (editingId) return;
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingId, isOpen, onClose]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof shortcutActions>();
    shortcutActions.forEach((action) => {
      map.set(action.group, [...(map.get(action.group) ?? []), action]);
    });
    return Array.from(map.entries());
  }, []);

  const resetDefaults = () => {
    const defaults = getDefaultShortcutBindings();
    setBindings(defaults);
    saveShortcutBindings(defaults);
    setEditingId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/45 p-4" onClick={onClose}>
      <div
        className="flex max-h-[86vh] w-[980px] max-w-[96vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light text-brand">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">快捷键设置</h2>
              <p className="mt-1 text-base text-slate-400">点击右侧快捷键按钮后，直接按下新的组合键即可替换。</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-7">
            {groups.map(([group, actions]) => (
              <section key={group}>
                <h3 className="mb-3 text-lg font-bold text-slate-800">{group}</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {actions.map((action) => {
                    const isEditing = editingId === action.id;
                    return (
                      <article key={action.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-base font-bold text-slate-900">{action.title}</div>
                            <div className="mt-1 text-sm text-slate-400">{action.desc}</div>
                          </div>
                          <button
                            onClick={() => setEditingId(action.id)}
                            className={`min-w-[128px] rounded-xl px-3 py-3 font-mono text-base font-bold transition-colors ${
                              isEditing
                                ? 'bg-brand text-white'
                                : 'bg-white text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            {isEditing ? '按下快捷键' : formatShortcut(bindings[action.id])}
                          </button>
                        </div>
                        <div className="mt-3 text-right text-sm text-slate-400">
                          默认：{formatShortcut(action.defaultBinding)}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            onClick={resetDefaults}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-base font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            恢复默认
          </button>
          <button onClick={onClose} className="rounded-xl bg-slate-900 px-5 py-2 text-base font-bold text-white transition-colors hover:bg-slate-700">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
