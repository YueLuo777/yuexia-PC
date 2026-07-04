import { ArrowLeft, Settings, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { ModalResizeHandles } from '@/shared/ui/ModalResizeHandles';
import {
  NAV_CONFIG_UPDATED_EVENT,
  getIconByName,
  loadNavConfig,
  normalizeNavConfig,
  resetNavConfig,
  saveNavConfig,
} from '@/shared/navigation/navConfig';
import type { NavGroupConfig, NavItemConfig } from '@/shared/navigation/navConfig';

const SETTINGS_PAGE_BACK_BUTTON_CLASS =
  'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors border-brand/20 bg-white text-brand hover:bg-brand-light';
const SETTINGS_LIGHT_BUTTON_CLASS =
  'flex h-8 min-w-[88px] items-center justify-center whitespace-nowrap rounded-md bg-[#08AACE] px-4 text-sm leading-none text-white transition-colors hover:bg-[#0798b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE4F2] disabled:cursor-not-allowed disabled:bg-slate-300';
const SETTINGS_INLINE_BUTTON_CLASS =
  'flex h-8 min-w-[64px] items-center justify-center whitespace-nowrap rounded-md bg-[#08AACE] px-3 text-sm leading-none text-white transition-colors hover:bg-[#0798b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE4F2]';
const SETTINGS_PAGE_SHELL_CLASS =
  'mx-auto flex h-full w-full max-w-[1120px] flex-col overflow-hidden';

interface NavSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: NavGroupConfig[];
  onSave: (config: NavGroupConfig[]) => void;
  onReset: () => void;
  variant?: 'modal' | 'page' | 'embedded';
}

const ROOT_NAV_GROUP: NavGroupConfig = {
  title: '导航',
  iconName: 'LayoutGrid',
  dividerAfterItemTo: '/novels',
  dividerAfterItemTos: ['/novels'],
  items: [],
};

function normalizeDraft(config: NavGroupConfig[]) {
  const items = config.flatMap((group) => (
    group.items.map((item) => ({
      ...item,
      hidden: item.hidden || group.hidden || undefined,
    }))
  ));

  return [{
    ...ROOT_NAV_GROUP,
    dividerAfterItemTo: config[0]?.dividerAfterItemTo ?? null,
    dividerAfterItemTos: config[0]?.dividerAfterItemTos ?? (
      config[0]?.dividerAfterItemTo ? [config[0].dividerAfterItemTo] : []
    ),
    items,
  }];
}

function getSwapPreviewItems<T>(items: T[], dragSourceIndex: number | null, targetIndex: number | null) {
  if (
    dragSourceIndex === null
    || targetIndex === null
    || dragSourceIndex === targetIndex
    || dragSourceIndex < 0
    || targetIndex < 0
    || dragSourceIndex >= items.length
    || targetIndex >= items.length
  ) return items;
  const next = [...items];
  const [moved] = next.splice(dragSourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

type NavPointerDragState = {
  sourceIndex: number;
  pointerId: number;
  element: HTMLElement;
  startX: number;
  startY: number;
  active: boolean;
  armed: boolean;
  activationTimer: number;
  lastPreviewX: number;
  lastPreviewY: number;
  lastPreviewTargetKey: string | null;
  cleanup: () => void;
} | null;

const NAV_POINTER_DRAG_ACTIVATION_DISTANCE = 14;
const NAV_POINTER_DRAG_ACTIVATION_DELAY_MS = 160;
const NAV_POINTER_DRAG_RETARGET_DISTANCE = 28;
const NAV_POINTER_DRAG_RETURN_DISTANCE = 28;

function hasNavPointerRetargetedTooSoon(
  pointerDrag: NonNullable<NavPointerDragState>,
  targetKey: string,
  clientX: number,
  clientY: number,
) {
  if (!pointerDrag.lastPreviewTargetKey || pointerDrag.lastPreviewTargetKey === targetKey) return false;
  const distanceFromLastPreview = Math.hypot(clientX - pointerDrag.lastPreviewX, clientY - pointerDrag.lastPreviewY);
  const retargetDistance = targetKey === `nav:${pointerDrag.sourceIndex}`
    ? NAV_POINTER_DRAG_RETURN_DISTANCE
    : NAV_POINTER_DRAG_RETARGET_DISTANCE;
  return distanceFromLastPreview < retargetDistance;
}

function rememberNavPointerPreviewTarget(
  pointerDrag: NonNullable<NavPointerDragState>,
  targetKey: string,
  clientX: number,
  clientY: number,
) {
  pointerDrag.lastPreviewTargetKey = targetKey;
  pointerDrag.lastPreviewX = clientX;
  pointerDrag.lastPreviewY = clientY;
}

export function NavSettingsModal({ isOpen, onClose, config, onSave, onReset, variant = 'modal' }: NavSettingsModalProps) {
  const isPage = variant === 'page';
  const isEmbedded = variant === 'embedded';
  const isRouteSurface = isPage || isEmbedded;
  useTopModalEscape(!isRouteSurface && isOpen, onClose);
  const draggable = useDraggableModal('dashboard_nav_settings', { x: 0, y: 0, width: 640, height: 520 });
  const [draft, setDraft] = useState<NavGroupConfig[]>([]);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [dragSrc, setDragSrc] = useState<number | null>(null);
  const [dividerDragSrc, setDividerDragSrc] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<{ itemIdx: number; pos: 'before' | 'after' } | null>(null);
  const navDropHandledRef = useRef(false);
  const navDragSrcRef = useRef<number | null>(null);
  const navDividerDragSrcRef = useRef<string | null>(null);
  const navDragOverRef = useRef<{ itemIdx: number; pos: 'before' | 'after' } | null>(null);
  const navPointerDragRef = useRef<NavPointerDragState>(null);
  const navPointerSuppressClickRef = useRef(false);

  const clearDragState = useCallback(() => {
    setNavDragSrc(null);
    setNavDividerDragSrc(null);
    setNavDragOver(null);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setDraft(normalizeDraft(config));
    setEditingItem(null);
    clearDragState();
  }, [clearDragState, config, isOpen]);

  if (!isOpen) return null;

  const draftItems = draft[0]?.items ?? [];
  const draftDividerAfterItemTos = draft[0]?.dividerAfterItemTos ?? (
    draft[0]?.dividerAfterItemTo ? [draft[0].dividerAfterItemTo] : []
  );
  const visibleDraftItems = draftItems.filter((item) => !item.hidden);
  const previewDraftItems = dragSrc !== null && dragOver && !dividerDragSrc
    ? getSwapPreviewItems(draftItems, dragSrc, dragOver.itemIdx)
    : draftItems;

  const normalizeDividerAfterItemTos = (items: NavItemConfig[], dividerAfterItemTos: string[]) => {
    const visibleItemTos = new Set(items.filter((item) => !item.hidden).map((item) => item.to));
    return Array.from(new Set(dividerAfterItemTos)).filter((itemTo) => visibleItemTos.has(itemTo));
  };

  const saveItems = (items: NavItemConfig[], dividerAfterItemTos = draftDividerAfterItemTos) => {
    const normalizedDividerAfterItemTos = normalizeDividerAfterItemTos(items, dividerAfterItemTos);
    const next = [{
      ...ROOT_NAV_GROUP,
      dividerAfterItemTo: normalizedDividerAfterItemTos[0] ?? null,
      dividerAfterItemTos: normalizedDividerAfterItemTos,
      items,
    }];
    setDraft(next);
    onSave(JSON.parse(JSON.stringify(next)));
  };

  const commitItemLabel = (itemIndex: number, value: string) => {
    const nextItems = draftItems.map((item, index) => (
      index === itemIndex ? { ...item, label: value.trim() || item.label } : item
    ));
    saveItems(nextItems);
  };

  const toggleItemHidden = (itemIndex: number) => {
    const nextItems = draftItems.map((item, index) => (
      index === itemIndex ? { ...item, hidden: !item.hidden } : item
    ));
    saveItems(nextItems);
  };

  const addDivider = () => {
    const existingDividerTos = new Set(draftDividerAfterItemTos);
    const target = visibleDraftItems.find((item) => !existingDividerTos.has(item.to));
    if (!target) return;
    saveItems(draftItems, [...draftDividerAfterItemTos, target.to]);
  };

  const removeDivider = (itemTo: string) => {
    saveItems(draftItems, draftDividerAfterItemTos.filter((dividerItemTo) => dividerItemTo !== itemTo));
  };

  const setNavDragOver = (next: { itemIdx: number; pos: 'before' | 'after' } | null) => {
    navDragOverRef.current = next;
    setDragOver(next);
  };

  const setNavDragSrc = (next: number | null) => {
    navDragSrcRef.current = next;
    setDragSrc(next);
  };

  const setNavDividerDragSrc = (next: string | null) => {
    navDividerDragSrcRef.current = next;
    setDividerDragSrc(next);
  };

  const handleDragOver = (event: React.DragEvent, itemIdx: number, previewIndex = itemIdx) => {
    event.preventDefault();
    if (navDragSrcRef.current !== null && !navDividerDragSrcRef.current) {
      const pos = navDragSrcRef.current < previewIndex ? 'after' : 'before';
      setNavDragOver({ itemIdx: previewIndex, pos });
      return;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    setNavDragOver({ itemIdx, pos });
  };

  const resolveDividerDropTarget = (targetItemIdx: number) => {
    const targetItem = draftItems[targetItemIdx];
    const previousVisibleItem = draftItems.slice(0, targetItemIdx).reverse().find((item) => !item.hidden);
    const nextVisibleItem = draftItems.slice(targetItemIdx + 1).find((item) => !item.hidden);
    if (navDragOverRef.current?.pos === 'before') return previousVisibleItem?.to ?? (!targetItem?.hidden ? targetItem?.to : nextVisibleItem?.to) ?? null;
    return (!targetItem?.hidden ? targetItem?.to : previousVisibleItem?.to ?? nextVisibleItem?.to) ?? null;
  };

  const commitDragDrop = (targetItemIdx: number) => {
    const dividerDragSrc = navDividerDragSrcRef.current;
    if (dividerDragSrc) {
      const nextItemTo = resolveDividerDropTarget(targetItemIdx);
      if (!nextItemTo) return;
      saveItems(draftItems, draftDividerAfterItemTos.map((itemTo) => (
        itemTo === dividerDragSrc ? nextItemTo : itemTo
      )));
      return;
    }
    const dragSrc = navDragSrcRef.current;
    if (dragSrc === null) return;
    const nextItems = getSwapPreviewItems(draftItems, dragSrc, targetItemIdx);
    saveItems(nextItems);
  };

  const handleDrop = (targetItemIdx: number, previewIndex = targetItemIdx) => {
    navDropHandledRef.current = true;
    commitDragDrop(navDividerDragSrcRef.current ? targetItemIdx : previewIndex);
    clearDragState();
  };

  const handleDragEnd = () => {
    if (!navDropHandledRef.current && navDragOverRef.current) commitDragDrop(navDragOverRef.current.itemIdx);
    navDropHandledRef.current = false;
    clearDragState();
  };

  const beginWindowNavPointerTracking = (pointerId: number) => {
    const handleWindowPointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      updateNavPointerPreviewAt(moveEvent.clientX, moveEvent.clientY);
      if (navPointerDragRef.current?.active) moveEvent.preventDefault();
    };
    const handleWindowPointerEnd = (endEvent: PointerEvent) => {
      if (endEvent.pointerId !== pointerId) return;
      finishNavPointerDragById(pointerId);
    };
    window.addEventListener('pointermove', handleWindowPointerMove, { capture: true });
    window.addEventListener('pointerup', handleWindowPointerEnd, { capture: true });
    window.addEventListener('pointercancel', handleWindowPointerEnd, { capture: true });
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove, { capture: true });
      window.removeEventListener('pointerup', handleWindowPointerEnd, { capture: true });
      window.removeEventListener('pointercancel', handleWindowPointerEnd, { capture: true });
    };
  };

  const beginNavPointerDrag = (event: React.PointerEvent<HTMLElement>, sourceIndex: number) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest('button,input')) return;
    const pointerId = event.pointerId;
    navPointerDragRef.current?.cleanup();
    const activationTimer = window.setTimeout(() => {
      const pointerDrag = navPointerDragRef.current;
      if (pointerDrag && pointerDrag.sourceIndex === sourceIndex) pointerDrag.armed = true;
    }, NAV_POINTER_DRAG_ACTIVATION_DELAY_MS);
    const dragElement = event.currentTarget;
    const cleanup = beginWindowNavPointerTracking(pointerId);
    navPointerDragRef.current = {
      sourceIndex,
      pointerId,
      element: dragElement,
      startX: event.clientX,
      startY: event.clientY,
      active: false,
      armed: false,
      activationTimer,
      lastPreviewX: event.clientX,
      lastPreviewY: event.clientY,
      lastPreviewTargetKey: null,
      cleanup: () => {
        window.clearTimeout(activationTimer);
        cleanup();
      },
    };
    try {
      dragElement.setPointerCapture(pointerId);
    } catch {
      // Pointer capture is optional; movement still updates from the row while hovered.
    }
  };

  const updateNavPointerPreviewAt = (clientX: number, clientY: number) => {
    const pointerDrag = navPointerDragRef.current;
    if (!pointerDrag) return;
    const distance = Math.hypot(clientX - pointerDrag.startX, clientY - pointerDrag.startY);
    if (!pointerDrag.active && !pointerDrag.armed) return;
    if (!pointerDrag.active && distance < NAV_POINTER_DRAG_ACTIVATION_DISTANCE) return;
    if (!pointerDrag.active) {
      pointerDrag.active = true;
      navPointerSuppressClickRef.current = true;
      navDropHandledRef.current = false;
      setNavDragSrc(pointerDrag.sourceIndex);
    }
    const hoverElement = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const hoverItem = hoverElement?.closest('[data-nav-item-index]') as HTMLElement | null;
    const targetIndex = Number(hoverItem?.dataset.navItemPreviewIndex);
    if (!Number.isInteger(targetIndex)) return;
    const targetKey = `nav:${targetIndex}`;
    if (!pointerDrag.lastPreviewTargetKey && targetKey === `nav:${pointerDrag.sourceIndex}`) return;
    if (hasNavPointerRetargetedTooSoon(pointerDrag, targetKey, clientX, clientY)) return;
    rememberNavPointerPreviewTarget(pointerDrag, targetKey, clientX, clientY);
    const pos = pointerDrag.sourceIndex < targetIndex ? 'after' : 'before';
    setNavDragOver({ itemIdx: targetIndex, pos });
  };

  const updateNavPointerPreview = (event: React.PointerEvent<HTMLElement>) => {
    updateNavPointerPreviewAt(event.clientX, event.clientY);
    if (navPointerDragRef.current?.active) event.preventDefault();
  };

  const finishNavPointerDragById = (pointerId: number) => {
    const pointerDrag = navPointerDragRef.current;
    if (!pointerDrag || pointerDrag.pointerId !== pointerId) return;
    navPointerDragRef.current = null;
    pointerDrag.cleanup();
    try {
      pointerDrag.element.releasePointerCapture(pointerId);
    } catch {
      // Ignore release failures when capture was not established.
    }
    if (!pointerDrag?.active) return;
    if (navDragOverRef.current) commitDragDrop(navDragOverRef.current.itemIdx);
    clearDragState();
    window.setTimeout(() => {
      navPointerSuppressClickRef.current = false;
    }, 0);
  };

  const finishNavPointerDrag = (event: React.PointerEvent<HTMLElement>) => {
    finishNavPointerDragById(event.pointerId);
  };

  return (
    <div
      className={isEmbedded ? 'h-full min-h-0 overflow-hidden' : isPage ? 'h-full min-h-0 overflow-hidden bg-slate-50 px-8 py-6' : 'fixed inset-0 z-50 flex items-center justify-center bg-black/40'}
      onMouseDown={(event) => {
        if (!isRouteSurface && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        data-draggable-managed={isRouteSurface ? undefined : 'true'}
        data-modal-id={isRouteSurface ? undefined : 'dashboard-nav-settings'}
        className={isEmbedded ? 'flex h-full min-h-0 w-full flex-col overflow-hidden' : isPage ? SETTINGS_PAGE_SHELL_CLASS : 'relative flex max-h-[calc(100vh-32px)] max-w-[calc(100vw-32px)] w-[640px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl'}
        style={isRouteSurface ? undefined : ({
          ...draggable.style,
          maxWidth: 'calc((100vw - 32px) / var(--xinyuexia-effective-scale, 1))',
          maxHeight: 'calc((100vh - 112px) / var(--xinyuexia-effective-scale, 1))',
        } as React.CSSProperties)}
      >
        {!isEmbedded && (
        <div {...(isPage ? {} : draggable.dragHandleProps)} className={isPage ? 'flex items-center justify-between border-b border-gray-100 pb-4' : 'flex items-center justify-between border-b border-gray-100 px-6 py-4'}>
          <div className="flex items-center gap-3">
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
            <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Settings className="h-4 w-4 text-brand" />
              导航设置
            </h2>
            <p className="mt-0.5 text-base text-gray-400">支持双击改名、隐藏显示、拖拽排序，以及新增、拖拽、删除分割线。</p>
            </div>
          </div>
          {!isPage ? (
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        )}

        <div className={isEmbedded ? 'min-h-0 flex-1 overflow-y-auto pb-5 pr-1' : isPage ? 'flex-1 overflow-y-auto py-5' : 'flex-1 overflow-y-auto p-5'}>
          <div className="space-y-1">
            {previewDraftItems.map((item, previewIndex) => {
              const itemIndex = draftItems.findIndex((draftItem) => draftItem.to === item.to);
              const ItemIcon = getIconByName(item.iconName);
              const isEditing = editingItem === itemIndex;
              const isHidden = !!item.hidden;
              const hasDividerAfter = draftDividerAfterItemTos.includes(item.to);
              const isDraggingPreview = dragSrc === itemIndex && dragOver && !dividerDragSrc;

              return (
                <div key={`${item.to}-${itemIndex}`} className="relative">
                  {dividerDragSrc && dragOver?.itemIdx === itemIndex && dragOver.pos === 'before' && (
                    <div className="absolute -top-[3px] left-0 right-0 z-10 h-[3px] rounded-full bg-brand" />
                  )}
                  <div
                    data-nav-item-index={itemIndex}
                    data-nav-item-preview-index={previewIndex}
                    draggable={!isEditing && !isHidden}
                    onDragStart={() => {
                      navDropHandledRef.current = false;
                      setNavDragSrc(itemIndex);
                    }}
                    onDragOver={(event) => handleDragOver(event, itemIndex, previewIndex)}
                    onDrop={() => handleDrop(itemIndex, previewIndex)}
                    onDragEnd={handleDragEnd}
                    onPointerDown={(event) => beginNavPointerDrag(event, itemIndex)}
                    onPointerMove={updateNavPointerPreview}
                    onPointerUp={finishNavPointerDrag}
                    onPointerCancel={finishNavPointerDrag}
                    className={`flex min-h-[46px] items-center gap-3 rounded-md border-2 px-3 py-2 transition-all ${
                      isHidden
                        ? 'border-transparent bg-gray-100 opacity-60'
                        : isDraggingPreview
                          ? 'border-dashed border-brand/45 bg-brand/10 text-brand shadow-inner'
                          : 'border-transparent bg-gray-50/50 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <ItemIcon className={`h-4 w-4 shrink-0 ${isHidden ? 'text-gray-300' : 'text-gray-400'}`} />
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editingValue}
                        onChange={(event) => setEditingValue(event.target.value)}
                        onBlur={() => {
                          commitItemLabel(itemIndex, editingValue);
                          setEditingItem(null);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            commitItemLabel(itemIndex, editingValue);
                            setEditingItem(null);
                          }
                        }}
                        className="min-w-0 flex-1 rounded border border-brand/30 px-1 py-0.5 text-base text-gray-700 outline-none focus:ring-1 focus:ring-brand/20"
                      />
                    ) : (
                      <>
                        <span className={`min-w-0 flex-1 truncate text-base font-medium ${isHidden ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item.label}</span>
                        <button
                          onClick={() => {
                            setEditingItem(itemIndex);
                            setEditingValue(item.label);
                          }}
                          className={SETTINGS_INLINE_BUTTON_CLASS}
                        >
                          修改
                        </button>
                        <button
                          onClick={() => toggleItemHidden(itemIndex)}
                          className={SETTINGS_INLINE_BUTTON_CLASS}
                        >
                          {isHidden ? '恢复' : '隐藏'}
                        </button>
                        {isDraggingPreview ? (
                          <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-black text-brand">虚影，松手后落实</span>
                        ) : null}
                      </>
                    )}
                  </div>
                  {dividerDragSrc && dragOver?.itemIdx === itemIndex && dragOver.pos === 'after' && (
                    <div className="absolute -bottom-[3px] left-0 right-0 z-10 h-[3px] rounded-full bg-brand" />
                  )}
                  {hasDividerAfter ? (
                    <div
                      draggable={!isHidden}
                      onDragStart={() => {
                        navDropHandledRef.current = false;
                        setNavDividerDragSrc(item.to);
                      }}
                      onDragOver={(event) => handleDragOver(event, itemIndex, previewIndex)}
                      onDrop={() => handleDrop(itemIndex, previewIndex)}
                      onDragEnd={handleDragEnd}
                      className={`group my-1 flex min-h-8 cursor-grab items-center gap-2 rounded-md px-3 transition-colors active:cursor-grabbing ${
                        dividerDragSrc === item.to ? 'bg-brand/10' : 'hover:bg-[#f2f7fb]'
                      }`}
                    >
                      <span className="h-px flex-1 bg-[#e1e5eb] transition-colors group-hover:bg-brand/45" />
                      <span className="text-xs font-medium text-[#8d98a6]">分割线</span>
                      <span className="h-px flex-1 bg-[#e1e5eb] transition-colors group-hover:bg-brand/45" />
                      <button
                        type="button"
                        onClick={() => removeDivider(item.to)}
                        className={SETTINGS_INLINE_BUTTON_CLASS}
                      >
                        删除
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className={isRouteSurface ? 'flex shrink-0 items-center justify-between border-t border-gray-100 py-3' : 'flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-3'}>
          <button onClick={() => { onReset(); if (!isRouteSurface) onClose(); }} className={SETTINGS_LIGHT_BUTTON_CLASS}>
            恢复默认
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addDivider}
              disabled={visibleDraftItems.length <= draftDividerAfterItemTos.length}
              className={SETTINGS_LIGHT_BUTTON_CLASS}
            >
              新增分割线
            </button>
            <button hidden={isRouteSurface} onClick={onClose} className={SETTINGS_LIGHT_BUTTON_CLASS}>
              关闭
            </button>
          </div>
        </div>
        {!isRouteSurface && <ModalResizeHandles draggable={draggable} />}
      </div>
    </div>
  );
}

export function NavSettingsPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<NavGroupConfig[]>(() => normalizeNavConfig(loadNavConfig()));

  useEffect(() => {
    const reloadConfig = () => setConfig(normalizeNavConfig(loadNavConfig()));
    window.addEventListener(NAV_CONFIG_UPDATED_EVENT, reloadConfig);
    window.addEventListener('storage', reloadConfig);
    return () => {
      window.removeEventListener(NAV_CONFIG_UPDATED_EVENT, reloadConfig);
      window.removeEventListener('storage', reloadConfig);
    };
  }, []);

  return (
    <NavSettingsModal
      isOpen
      onClose={() => navigate('/novels')}
      config={config}
      onSave={(next) => setConfig(saveNavConfig(next))}
      onReset={() => setConfig(resetNavConfig())}
      variant="page"
    />
  );
}
