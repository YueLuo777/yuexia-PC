import { ArrowLeft, RotateCcw, Settings, X } from 'lucide-react';
import { useEffect, useState } from 'react';
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

interface NavSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: NavGroupConfig[];
  onSave: (config: NavGroupConfig[]) => void;
  onReset: () => void;
  variant?: 'modal' | 'page';
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

export function NavSettingsModal({ isOpen, onClose, config, onSave, onReset, variant = 'modal' }: NavSettingsModalProps) {
  const isPage = variant === 'page';
  useTopModalEscape(!isPage && isOpen, onClose);
  const draggable = useDraggableModal('dashboard_nav_settings', { x: 0, y: 0, width: 640, height: 520 });
  const [draft, setDraft] = useState<NavGroupConfig[]>([]);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [dragSrc, setDragSrc] = useState<number | null>(null);
  const [dividerDragSrc, setDividerDragSrc] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<{ itemIdx: number; pos: 'before' | 'after' } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setDraft(normalizeDraft(config));
    setEditingItem(null);
    setDragSrc(null);
    setDividerDragSrc(null);
    setDragOver(null);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const draftItems = draft[0]?.items ?? [];
  const draftDividerAfterItemTos = draft[0]?.dividerAfterItemTos ?? (
    draft[0]?.dividerAfterItemTo ? [draft[0].dividerAfterItemTo] : []
  );
  const visibleDraftItems = draftItems.filter((item) => !item.hidden);

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

  const handleDragOver = (event: React.DragEvent, itemIdx: number) => {
    event.preventDefault();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    setDragOver({ itemIdx, pos });
  };

  const resolveDividerDropTarget = (targetItemIdx: number) => {
    const targetItem = draftItems[targetItemIdx];
    const previousVisibleItem = draftItems.slice(0, targetItemIdx).reverse().find((item) => !item.hidden);
    const nextVisibleItem = draftItems.slice(targetItemIdx + 1).find((item) => !item.hidden);
    if (dragOver?.pos === 'before') return previousVisibleItem?.to ?? (!targetItem?.hidden ? targetItem?.to : nextVisibleItem?.to) ?? null;
    return (!targetItem?.hidden ? targetItem?.to : previousVisibleItem?.to ?? nextVisibleItem?.to) ?? null;
  };

  const handleDrop = (targetItemIdx: number) => {
    if (dividerDragSrc) {
      const nextItemTo = resolveDividerDropTarget(targetItemIdx);
      if (!nextItemTo) {
        setDividerDragSrc(null);
        setDragOver(null);
        return;
      }
      saveItems(draftItems, draftDividerAfterItemTos.map((itemTo) => (
        itemTo === dividerDragSrc ? nextItemTo : itemTo
      )));
      setDividerDragSrc(null);
      setDragOver(null);
      return;
    }
    if (dragSrc === null) return;
    const nextItems = [...draftItems];
    const [moved] = nextItems.splice(dragSrc, 1);
    let insertIdx = dragOver?.pos === 'after' ? targetItemIdx + 1 : targetItemIdx;
    if (dragSrc < targetItemIdx) insertIdx -= 1;
    insertIdx = Math.max(0, Math.min(insertIdx, nextItems.length));
    nextItems.splice(insertIdx, 0, moved);
    saveItems(nextItems);
    setDragSrc(null);
    setDragOver(null);
  };

  return (
    <div
      className={isPage ? 'h-full min-h-0 overflow-hidden bg-slate-50 p-5' : 'fixed inset-0 z-50 flex items-center justify-center bg-black/40'}
      onMouseDown={(event) => {
        if (!isPage && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        data-draggable-managed={isPage ? undefined : 'true'}
        data-modal-id={isPage ? undefined : 'dashboard-nav-settings'}
        className={isPage ? 'mx-auto flex h-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm' : 'relative flex max-h-[calc(100vh-32px)] max-w-[calc(100vw-32px)] w-[640px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl'}
        style={isPage ? undefined : ({
          ...draggable.style,
          maxWidth: 'calc((100vw - 32px) / var(--xinyuexia-effective-scale, 1))',
          maxHeight: 'calc((100vh - 112px) / var(--xinyuexia-effective-scale, 1))',
        } as React.CSSProperties)}
      >
        <div {...(isPage ? {} : draggable.dragHandleProps)} className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            {isPage ? (
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
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

        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-1">
            {draftItems.map((item, itemIndex) => {
              const ItemIcon = getIconByName(item.iconName);
              const isEditing = editingItem === itemIndex;
              const isHidden = !!item.hidden;
              const hasDividerAfter = draftDividerAfterItemTos.includes(item.to);

              return (
                <div key={`${item.to}-${itemIndex}`} className="relative">
                  {dragOver?.itemIdx === itemIndex && dragOver.pos === 'before' && (
                    <div className="absolute -top-[3px] left-0 right-0 z-10 h-[3px] rounded-full bg-brand" />
                  )}
                  <div
                    draggable={!isEditing && !isHidden}
                    onDragStart={() => setDragSrc(itemIndex)}
                    onDragOver={(event) => handleDragOver(event, itemIndex)}
                    onDrop={() => handleDrop(itemIndex)}
                    onDragEnd={() => {
                      setDragSrc(null);
                      setDragOver(null);
                    }}
                    className={`flex items-center gap-2 rounded-md border-2 px-3 py-2 transition-all ${
                      isHidden
                        ? 'border-transparent bg-gray-100 opacity-60'
                        : dragSrc === itemIndex
                          ? 'scale-[0.98] border-dashed border-brand/40 bg-brand/10 opacity-60'
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
                        <span className={`min-w-0 flex-1 truncate text-base ${isHidden ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item.label}</span>
                        <button
                          onClick={() => {
                            setEditingItem(itemIndex);
                            setEditingValue(item.label);
                          }}
                          className="rounded px-1.5 py-0.5 text-base text-brand hover:bg-brand-light"
                        >
                          修改
                        </button>
                        <button
                          onClick={() => toggleItemHidden(itemIndex)}
                          className={`rounded px-2 py-0.5 text-base ${isHidden ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-400 hover:bg-red-50 hover:text-red-500'}`}
                        >
                          {isHidden ? '恢复' : '隐藏'}
                        </button>
                      </>
                    )}
                  </div>
                  {dragOver?.itemIdx === itemIndex && dragOver.pos === 'after' && (
                    <div className="absolute -bottom-[3px] left-0 right-0 z-10 h-[3px] rounded-full bg-brand" />
                  )}
                  {hasDividerAfter ? (
                    <div
                      draggable={!isHidden}
                      onDragStart={() => setDividerDragSrc(item.to)}
                      onDragOver={(event) => handleDragOver(event, itemIndex)}
                      onDrop={() => handleDrop(itemIndex)}
                      onDragEnd={() => {
                        setDividerDragSrc(null);
                        setDragOver(null);
                      }}
                      className={`group my-1 flex h-7 cursor-grab items-center gap-2 rounded-md px-3 transition-colors active:cursor-grabbing ${
                        dividerDragSrc === item.to ? 'bg-brand/10' : 'hover:bg-[#f2f7fb]'
                      }`}
                    >
                      <span className="h-px flex-1 bg-[#e1e5eb] transition-colors group-hover:bg-brand/45" />
                      <span className="text-xs font-medium text-[#8d98a6]">分割线</span>
                      <span className="h-px flex-1 bg-[#e1e5eb] transition-colors group-hover:bg-brand/45" />
                      <button
                        type="button"
                        onClick={() => removeDivider(item.to)}
                        className="rounded px-2 py-0.5 text-xs font-medium text-[#8d98a6] hover:bg-red-50 hover:text-red-500"
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

        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-3">
          <button onClick={() => { onReset(); if (!isPage) onClose(); }} className="flex items-center gap-1 px-3 py-2 text-base text-gray-500 hover:text-gray-700">
            <RotateCcw className="h-3.5 w-3.5" />
            恢复默认
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addDivider}
              disabled={visibleDraftItems.length <= draftDividerAfterItemTos.length}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-base text-gray-600 transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              新增分割线
            </button>
            <button hidden={isPage} onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-base text-gray-600 hover:bg-gray-50">
              关闭
            </button>
          </div>
        </div>
        {!isPage && <ModalResizeHandles draggable={draggable} />}
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
