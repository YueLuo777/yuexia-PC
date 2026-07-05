import { ArrowLeft, Keyboard, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  bindingFromKeyboardEvent,
  defaultMouseGestureSettings,
  formatShortcut,
  getDefaultShortcutBindings,
  loadShortcutBindings,
  loadMouseGestureSettings,
  saveMouseGestureSettings,
  saveShortcutBindings,
  shortcutActions,
  type ShortcutActionId,
} from '@/shared/shortcuts/shortcutConfig';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { ModalResizeHandles } from '@/shared/ui/ModalResizeHandles';
import { PRIMARY_TEXT_BUTTON_CLASS, SHORTCUT_KEY_TEXT_BUTTON_CLASS } from '@/shared/ui/actionButtonClasses';

const SETTINGS_PAGE_BACK_BUTTON_CLASS =
  'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors border-brand/20 bg-white text-brand hover:bg-brand-light';
const SETTINGS_LIGHT_BUTTON_CLASS =
  PRIMARY_TEXT_BUTTON_CLASS;
const SHORTCUT_KEY_BUTTON_CLASS =
  SHORTCUT_KEY_TEXT_BUTTON_CLASS;
const SETTINGS_PAGE_SHELL_CLASS =
  'mx-auto flex h-full w-full max-w-[1180px] flex-col overflow-hidden';

export const SHORTCUT_SETTINGS_RESET_EVENT = 'xinyuexia_shortcut_settings_reset_requested';

interface ShortcutSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'modal' | 'page' | 'embedded';
}

export function ShortcutSettingsModal({ isOpen, onClose, variant = 'modal' }: ShortcutSettingsModalProps) {
  const isPage = variant === 'page';
  const isEmbedded = variant === 'embedded';
  const isRouteSurface = isPage || isEmbedded;
  const [bindings, setBindings] = useState(loadShortcutBindings);
  const [mouseGestureSettings, setMouseGestureSettings] = useState(loadMouseGestureSettings);
  const [editingId, setEditingId] = useState<ShortcutActionId | null>(null);
  useTopModalEscape(!isRouteSurface && isOpen && !editingId, onClose);
  const draggable = useDraggableModal('dashboard_shortcut_settings', { x: 0, y: 0, width: 900, height: 600 });

  useEffect(() => {
    if (!isOpen) return;
    setBindings(loadShortcutBindings());
    setMouseGestureSettings(loadMouseGestureSettings());
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

  const groups = useMemo(() => {
    const map = new Map<string, typeof shortcutActions>();
    shortcutActions.forEach((action) => {
      map.set(action.group, [...(map.get(action.group) ?? []), action]);
    });
    return Array.from(map.entries());
  }, []);

  const resetDefaults = useCallback(() => {
    const defaults = getDefaultShortcutBindings();
    setBindings(defaults);
    saveShortcutBindings(defaults);
    setMouseGestureSettings(defaultMouseGestureSettings);
    saveMouseGestureSettings(defaultMouseGestureSettings);
    setEditingId(null);
  }, []);

  useEffect(() => {
    if (!isOpen || !isEmbedded) return;
    const handleResetRequest = () => resetDefaults();
    window.addEventListener(SHORTCUT_SETTINGS_RESET_EVENT, handleResetRequest);
    return () => window.removeEventListener(SHORTCUT_SETTINGS_RESET_EVENT, handleResetRequest);
  }, [isEmbedded, isOpen, resetDefaults]);

  const updateMouseGesture = (key: 'goHomeLeftSwipe' | 'forwardRightSwipe', enabled: boolean) => {
    const next = { ...mouseGestureSettings, [key]: enabled };
    setMouseGestureSettings(next);
    saveMouseGestureSettings(next);
  };

  if (!isOpen) return null;

  return (
    <div
      className={isEmbedded ? 'h-full min-h-0 overflow-hidden' : isPage ? 'h-full min-h-0 overflow-hidden bg-slate-50 px-8 py-6' : 'fixed inset-0 z-[220] flex items-center justify-center bg-black/45 p-4'}
      onClick={isRouteSurface ? undefined : onClose}
    >
      <div
        data-draggable-managed={isRouteSurface ? undefined : 'true'}
        data-modal-id={isRouteSurface ? undefined : 'dashboard-shortcut-settings'}
        className={isEmbedded ? 'flex h-full min-h-0 w-full flex-col overflow-hidden' : isPage ? SETTINGS_PAGE_SHELL_CLASS : 'relative flex max-h-[calc(100vh-32px)] max-w-[calc(100vw-32px)] w-[900px] max-w-[96vw] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl'}
        style={isRouteSurface ? undefined : ({
          ...draggable.style,
          maxWidth: 'calc((100vw - 32px) / var(--xinyuexia-effective-scale, 1))',
          maxHeight: 'calc((100vh - 112px) / var(--xinyuexia-effective-scale, 1))',
        } as React.CSSProperties)}
        onClick={(event) => event.stopPropagation()}
      >
        {!isEmbedded && (
          <div {...(isPage ? {} : draggable.dragHandleProps)} className={isPage ? 'flex shrink-0 items-center justify-between border-b border-slate-100 pb-4' : 'flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3'}>
            <div className="flex items-center gap-2.5">
              {isPage ? (
                <button
                  onClick={onClose}
                  className={SETTINGS_PAGE_BACK_BUTTON_CLASS}
                  title="返回我的小说"
                  aria-label="返回我的小说"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              ) : null}
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light text-brand">
                <Keyboard className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">快捷键设置</h2>
                <p className="mt-0.5 text-sm text-slate-400">点击右侧快捷键按钮后，直接按下新的组合键即可替换。</p>
              </div>
            </div>
            {isPage ? (
              <button
                onClick={resetDefaults}
                className={SETTINGS_LIGHT_BUTTON_CLASS}
              >
                恢复默认
              </button>
            ) : (
              <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        <div className={isEmbedded ? 'min-h-0 flex-1 overflow-y-auto pb-6 pr-1' : isPage ? 'min-h-0 flex-1 overflow-y-auto py-5' : 'min-h-0 flex-1 overflow-y-auto px-5 py-4'}>
          <div className={isEmbedded ? 'space-y-6' : isPage ? 'space-y-8 pb-6' : 'space-y-5'}>
            {groups.map(([group, actions]) => (
              <section key={group}>
                <h3 className="mb-2 text-base font-bold text-slate-800">{group}</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {actions.map((action) => {
                    const isEditing = editingId === action.id;
                    return (
                      <article key={action.id} className="rounded-lg border border-slate-100 bg-white/70 p-3">
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-bold text-slate-900">{action.title}</div>
                            <div className="mt-0.5 text-xs text-slate-400">{action.desc}</div>
                          </div>
                          <button
                            onClick={() => setEditingId(action.id)}
                            className={SHORTCUT_KEY_BUTTON_CLASS}
                          >
                            {isEditing ? '按下快捷键' : formatShortcut(bindings[action.id])}
                          </button>
                        </div>
                        <div className="mt-2 text-right text-xs text-slate-400">
                          默认：{formatShortcut(action.defaultBinding)}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}

            <section>
              <h3 className="mb-2 text-base font-bold text-slate-800">鼠标手势</h3>
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                <article className="rounded-lg border border-slate-100 bg-white/70 p-3">
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-slate-900">右键左划回我的小说</div>
                      <div className="mt-0.5 text-xs text-slate-400">按住鼠标右键向左滑，松开后回到我的小说。</div>
                    </div>
                    <button
                      onClick={() => updateMouseGesture('goHomeLeftSwipe', !mouseGestureSettings.goHomeLeftSwipe)}
                      className={SETTINGS_LIGHT_BUTTON_CLASS}
                    >
                      {mouseGestureSettings.goHomeLeftSwipe ? '已开启' : '已关闭'}
                    </button>
                  </div>
                  <div className="mt-2 text-right text-xs text-slate-400">左划后再右划会判定为无效手势</div>
                </article>
                <article className="rounded-lg border border-slate-100 bg-white/70 p-3">
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-slate-900">右键右划前进</div>
                      <div className="mt-0.5 text-xs text-slate-400">按住鼠标右键向右滑，松开后前进到下一页。</div>
                    </div>
                    <button
                      onClick={() => updateMouseGesture('forwardRightSwipe', !mouseGestureSettings.forwardRightSwipe)}
                      className={SETTINGS_LIGHT_BUTTON_CLASS}
                    >
                      {mouseGestureSettings.forwardRightSwipe ? '已开启' : '已关闭'}
                    </button>
                  </div>
                  <div className="mt-2 text-right text-xs text-slate-400">右划后再左划会判定为无效手势</div>
                </article>
              </div>
            </section>
          </div>
        </div>

        <div className={isRouteSurface ? 'hidden' : 'flex shrink-0 justify-end gap-2.5 border-t border-slate-100 px-5 py-3'}>
          <button
            onClick={resetDefaults}
            className={SETTINGS_LIGHT_BUTTON_CLASS}
          >
            恢复默认
          </button>
          <button hidden={isPage} onClick={onClose} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-700">
            关闭
          </button>
        </div>
        {!isRouteSurface && <ModalResizeHandles draggable={draggable} />}
      </div>
    </div>
  );
}

export function ShortcutSettingsPage() {
  const navigate = useNavigate();

  return <ShortcutSettingsModal isOpen onClose={() => navigate('/novels')} variant="page" />;
}
