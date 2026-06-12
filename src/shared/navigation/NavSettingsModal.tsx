import { RotateCcw, Settings, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { getIconByName } from '@/shared/navigation/navConfig';
import type { NavGroupConfig, NavItemConfig } from '@/shared/navigation/navConfig';

interface NavSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: NavGroupConfig[];
  onSave: (config: NavGroupConfig[]) => void;
  onReset: () => void;
}

const ROOT_NAV_GROUP: NavGroupConfig = {
  title: '导航',
  iconName: 'LayoutGrid',
  dividerAfterItemTo: '/novels',
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
    items,
  }];
}

export function NavSettingsModal({ isOpen, onClose, config, onSave, onReset }: NavSettingsModalProps) {
  useTopModalEscape(isOpen, onClose);
  const [draft, setDraft] = useState<NavGroupConfig[]>([]);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [dragSrc, setDragSrc] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<{ itemIdx: number; pos: 'before' | 'after' } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setDraft(normalizeDraft(config));
    setEditingItem(null);
    setDragSrc(null);
    setDragOver(null);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const draftItems = draft[0]?.items ?? [];
  const draftDividerAfterItemTo = draft[0]?.dividerAfterItemTo ?? null;
  const visibleDraftItems = draftItems.filter((item) => !item.hidden);

  const saveItems = (items: NavItemConfig[], dividerAfterItemTo = draftDividerAfterItemTo) => {
    const next = [{ ...ROOT_NAV_GROUP, dividerAfterItemTo, items }];
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
    const nextDividerAfterItemTo = draftItems[itemIndex]?.to === draftDividerAfterItemTo && !draftItems[itemIndex]?.hidden
      ? null
      : draftDividerAfterItemTo;
    saveItems(nextItems, nextDividerAfterItemTo);
  };

  const updateDividerAfterItem = (value: string) => {
    saveItems(draftItems, value || null);
  };

  const handleDragOver = (event: React.DragEvent, itemIdx: number) => {
    event.preventDefault();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    setDragOver({ itemIdx, pos });
  };

  const handleDrop = (targetItemIdx: number) => {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[85vh] w-[640px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Settings className="h-4 w-4 text-brand" />
              导航设置
            </h2>
            <p className="mt-0.5 text-base text-gray-400">支持双击改名、隐藏显示、拖拽排序和分割线位置。</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-4 rounded-lg border border-[#e1e5eb] bg-[#f8fafc] p-3">
            <label className="block text-sm font-medium text-[#1f2933]" htmlFor="nav-divider-position">
              导航分割线位置
            </label>
            <div className="mt-2 flex items-center gap-3">
              <select
                id="nav-divider-position"
                value={visibleDraftItems.some((item) => item.to === draftDividerAfterItemTo) ? (draftDividerAfterItemTo ?? '') : ''}
                onChange={(event) => updateDividerAfterItem(event.target.value)}
                className="h-9 min-w-0 flex-1 rounded-md border border-[#d7dde6] bg-white px-3 text-sm text-[#1f2933] outline-none focus:border-brand"
              >
                <option value="">不显示分割线</option>
                {visibleDraftItems.map((item) => (
                  <option key={item.to} value={item.to}>在「{item.label}」后面</option>
                ))}
              </select>
              <span className="hidden h-px w-20 bg-[#e1e5eb] sm:block" aria-hidden="true" />
            </div>
          </div>
          <div className="space-y-1">
            {draftItems.map((item, itemIndex) => {
              const ItemIcon = getIconByName(item.iconName);
              const isEditing = editingItem === itemIndex;
              const isHidden = !!item.hidden;

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
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-3">
          <button onClick={() => { onReset(); onClose(); }} className="flex items-center gap-1 px-3 py-2 text-base text-gray-500 hover:text-gray-700">
            <RotateCcw className="h-3.5 w-3.5" />
            恢复默认
          </button>
          <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-base text-gray-600 hover:bg-gray-50">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
