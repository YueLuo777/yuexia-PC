import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react';

import {
  BRAINSTORM_UNCATEGORIZED_ID,
  getBrainstormEntryCategoryId,
  type StandardBrainstormCategory,
} from '@/features/workbench/model/standardModeBrainstormCategories';
import { getBrainstormEntryBody } from '@/features/workbench/components/workbenchLibraryAiText';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { sortBrainstormEntriesBySerial } from '@/features/workbench/model/standardModeBrainstormModel';
import { countTextWords } from '@/features/workbench/model/workbenchLibraryPanelModel';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { FormDialog } from '@/shared/ui/FormDialog';
import {
  CHAPTER_NAV_ROW_BASE_CLASS,
  CHAPTER_NAV_ROW_DEFAULT_CLASS,
  CHAPTER_NAV_ROW_SELECTED_CLASS,
  CHAPTER_NAV_SELECTED_PATH_CLASS,
  CHAPTER_NAV_TREE_CLASS,
  CHAPTER_NAV_VOLUME_CLOSED_ICON_CLASS,
  CHAPTER_NAV_VOLUME_COUNT_CLASS,
  CHAPTER_NAV_VOLUME_OPEN_ICON_CLASS,
  CHAPTER_NAV_VOLUME_ROW_CLASS,
  getChapterConnectorHorizontalClass,
  getChapterSelectedPathHeight,
} from './chapterNavigationStyles';
import { BrainstormRecycleButton } from './BrainstormRecycleButton';

interface StandardModeBrainstormSidebarProps {
  entries: WorkbenchLibraryEntry[];
  categories: StandardBrainstormCategory[];
  selectedEntryId: string | null;
  recycleCount: number;
  onSelect: (entry: WorkbenchLibraryEntry) => void;
  onAddCategory: (name: string) => boolean;
  onRenameCategory: (categoryId: string, name: string) => boolean;
  onToggleCategory: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onMoveEntry: (entryId: string, categoryId: string) => void;
  onDeleteSelected: () => void;
  onOpenRecycle: () => void;
}

type CategoryEditorState = { mode: 'create' } | { mode: 'rename'; categoryId: string } | null;
type ContextMenuState = { x: number; y: number; id: string } | null;

const CONTEXT_MENU_CLASS =
  'fixed z-[120] w-[176px] overflow-hidden rounded-md border border-[#D2D8E0] bg-white py-1 shadow-[0_10px_28px_rgba(15,23,42,0.16)]';
const CONTEXT_MENU_ITEM_CLASS =
  'flex h-9 w-full items-center px-3 text-left text-sm font-semibold text-[#52606d] hover:bg-[#f3f7f9]';

function getContextMenuPoint(event: ReactMouseEvent<HTMLElement>) {
  const target = event.currentTarget;
  let container: HTMLElement | null = target;
  while (container && window.getComputedStyle(container).transform === 'none') {
    container = container.parentElement;
  }
  if (!container) return { x: event.clientX, y: event.clientY };
  const rect = container.getBoundingClientRect();
  const scaleX = rect.width / container.offsetWidth || 1;
  const scaleY = rect.height / container.offsetHeight || scaleX;
  return {
    x: (event.clientX - rect.left) / scaleX,
    y: (event.clientY - rect.top) / scaleY,
  };
}

export function StandardModeBrainstormSidebar({
  entries,
  categories,
  selectedEntryId,
  recycleCount,
  onSelect,
  onAddCategory,
  onRenameCategory,
  onToggleCategory,
  onDeleteCategory,
  onMoveEntry,
  onDeleteSelected,
  onOpenRecycle,
}: StandardModeBrainstormSidebarProps) {
  const [categoryEditor, setCategoryEditor] = useState<CategoryEditorState>(null);
  const [categoryDraft, setCategoryDraft] = useState('');
  const [categoryMenu, setCategoryMenu] = useState<ContextMenuState>(null);
  const [entryMenu, setEntryMenu] = useState<ContextMenuState>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteBrainstormOpen, setDeleteBrainstormOpen] = useState(false);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null);

  const visibleEntries = useMemo(() => {
    return sortBrainstormEntriesBySerial(entries);
  }, [entries]);
  const groupedEntries = useMemo(() => {
    const groups = new Map(categories.map((category) => [category.id, [] as WorkbenchLibraryEntry[]]));
    visibleEntries.forEach((entry) => {
      const categoryId = getBrainstormEntryCategoryId(entry, categories);
      groups.get(categoryId)?.push(entry);
    });
    return groups;
  }, [categories, visibleEntries]);
  const selectedEntry = entries.find((entry) => entry.id === selectedEntryId) ?? null;
  const editingCategory =
    categoryEditor?.mode === 'rename'
      ? categories.find((category) => category.id === categoryEditor.categoryId) ?? null
      : null;
  const deletingCategory = categories.find((category) => category.id === deleteCategoryId) ?? null;

  useEffect(() => {
    if (!categoryMenu && !entryMenu) return;
    const closeMenus = () => {
      setCategoryMenu(null);
      setEntryMenu(null);
    };
    window.addEventListener('click', closeMenus);
    return () => window.removeEventListener('click', closeMenus);
  }, [categoryMenu, entryMenu]);

  const openCreateCategory = () => {
    setCategoryDraft('');
    setCategoryEditor({ mode: 'create' });
  };
  const openRenameCategory = (categoryId: string) => {
    const category = categories.find((item) => item.id === categoryId);
    if (!category || category.id === BRAINSTORM_UNCATEGORIZED_ID) return;
    setCategoryDraft(category.name);
    setCategoryEditor({ mode: 'rename', categoryId });
  };
  const confirmCategoryEditor = () => {
    const accepted = categoryEditor?.mode === 'rename'
      ? onRenameCategory(categoryEditor.categoryId, categoryDraft)
      : onAddCategory(categoryDraft);
    if (accepted) setCategoryEditor(null);
  };

  return (
    <aside
      className="flex min-h-0 flex-col border-r border-[#dce1e8] bg-[#f8fafc] p-3"
      data-standard-brainstorm-sidebar="true"
    >
      <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto pr-1" data-brainstorm-category-tree="true">
        {categories.map((category) => {
          const categoryEntries = groupedEntries.get(category.id) ?? [];
          const selectedEntryIndex = categoryEntries.findIndex((entry) => entry.id === selectedEntryId);
          return (
            <div key={category.id} className="mb-1" data-brainstorm-category-id={category.id}>
              <div
                className={`${CHAPTER_NAV_VOLUME_ROW_CLASS} ${
                  dragOverCategoryId === category.id ? 'ring-2 ring-[#08AACE]/35' : ''
                }`}
                onContextMenu={(event) => {
                  if (category.id === BRAINSTORM_UNCATEGORIZED_ID) return;
                  event.preventDefault();
                  event.stopPropagation();
                  setCategoryMenu({ ...getContextMenuPoint(event), id: category.id });
                  setEntryMenu(null);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverCategoryId(category.id);
                }}
                onDragLeave={() => setDragOverCategoryId((current) => current === category.id ? null : current)}
                onDrop={(event) => {
                  event.preventDefault();
                  const entryId =
                    event.dataTransfer.getData('application/x-xinyuexia-brainstorm-id') ||
                    event.dataTransfer.getData('text/plain');
                  setDragOverCategoryId(null);
                  if (entryId) onMoveEntry(entryId, category.id);
                }}
              >
                <button
                  type="button"
                  onClick={() => onToggleCategory(category.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  aria-expanded={category.isExpanded}
                  title={category.id === BRAINSTORM_UNCATEGORIZED_ID ? category.name : `${category.name}，右键管理分类`}
                >
                  {category.isExpanded ? (
                    <ChevronDown className={CHAPTER_NAV_VOLUME_OPEN_ICON_CLASS} />
                  ) : (
                    <ChevronRight className={CHAPTER_NAV_VOLUME_CLOSED_ICON_CLASS} />
                  )}
                  <span className="min-w-0 flex-1 truncate leading-none">{category.name}</span>
                  <span className={CHAPTER_NAV_VOLUME_COUNT_CLASS}>{categoryEntries.length}</span>
                </button>
              </div>

              {category.isExpanded ? (
                <div className={CHAPTER_NAV_TREE_CLASS}>
                  {selectedEntryIndex >= 0 ? (
                    <span
                      aria-hidden="true"
                      data-brainstorm-selected-path="true"
                      className={CHAPTER_NAV_SELECTED_PATH_CLASS}
                      style={{ height: getChapterSelectedPathHeight(selectedEntryIndex) }}
                    />
                  ) : null}
                  {categoryEntries.map((entry, index) => {
                    const selected = entry.id === selectedEntryId;
                    const wordCount = countTextWords(getBrainstormEntryBody(entry));
                    return (
                      <div
                        key={entry.id}
                        role="button"
                        tabIndex={0}
                        draggable
                        data-brainstorm-entry-id={entry.id}
                        aria-current={selected ? 'page' : undefined}
                        onClick={() => onSelect(entry)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') onSelect(entry);
                        }}
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = 'move';
                          event.dataTransfer.setData('application/x-xinyuexia-brainstorm-id', entry.id);
                          event.dataTransfer.setData('text/plain', entry.id);
                        }}
                        onDragEnd={() => setDragOverCategoryId(null)}
                        onContextMenu={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setEntryMenu({ ...getContextMenuPoint(event), id: entry.id });
                          setCategoryMenu(null);
                        }}
                        className={`${CHAPTER_NAV_ROW_BASE_CLASS} ${
                          selected ? CHAPTER_NAV_ROW_SELECTED_CLASS : CHAPTER_NAV_ROW_DEFAULT_CLASS
                        }`}
                        title="可拖动到其他脑洞分类，或右键选择分类"
                      >
                        <span
                          aria-hidden="true"
                          className={getChapterConnectorHorizontalClass(selected)}
                        />
                        <span className="w-5 shrink-0 text-center text-xs font-bold text-[#08AACE]">
                          {entry.brainstormSerialNumber ?? index + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate whitespace-nowrap text-sm font-black text-inherit">
                          {entry.title}
                        </span>
                        <span className="ml-auto shrink-0 text-[11px] font-black text-gray-400">{wordCount}字</span>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-2 grid shrink-0 grid-cols-2 gap-2" data-brainstorm-sidebar-actions="true">
        <button
          type="button"
          onClick={openCreateCategory}
          className="h-9 min-w-0 rounded-md bg-[#08AACE] px-2 text-sm font-bold text-white hover:bg-[#0798b8]"
        >
          新增脑洞分类
        </button>
        <button
          type="button"
          disabled={!selectedEntry}
          onClick={() => setDeleteBrainstormOpen(true)}
          className="h-9 min-w-0 rounded-md border border-red-300 bg-white px-2 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
        >
          删除当前脑洞
        </button>
      </div>
      <div className="mt-2 shrink-0">
        <BrainstormRecycleButton count={recycleCount} onClick={onOpenRecycle} />
      </div>

      <FormDialog
        isOpen={Boolean(categoryEditor)}
        title={categoryEditor?.mode === 'rename' ? '重命名脑洞分类' : '新增脑洞分类'}
        label="分类名称"
        value={categoryDraft}
        onValueChange={setCategoryDraft}
        onClose={() => setCategoryEditor(null)}
        onConfirm={confirmCategoryEditor}
        inputId="standard-brainstorm-category-name"
        placeholder="例如：玄幻脑洞"
        confirmLabel={categoryEditor?.mode === 'rename' ? '保存名称' : '新建分类'}
        storageId="standard_brainstorm_category_editor"
        confirmDisabled={
          !categoryDraft.trim() ||
          categories.some((category) => category.id !== editingCategory?.id && category.name === categoryDraft.trim())
        }
      />
      <ConfirmDialog
        isOpen={Boolean(deletingCategory)}
        title="删除这个脑洞分类？"
        description={`“${deletingCategory?.name ?? ''}”中的脑洞不会删除，会自动移回“未分类”。`}
        confirmText="删除分类"
        cancelText="取消"
        confirmVariant="danger"
        onClose={() => setDeleteCategoryId(null)}
        onConfirm={() => {
          if (deleteCategoryId) onDeleteCategory(deleteCategoryId);
          setDeleteCategoryId(null);
        }}
      />
      <ConfirmDialog
        isOpen={deleteBrainstormOpen}
        title="删除这个脑洞？"
        description="删除后会移入脑洞回收站，并自动显示下一个脑洞。"
        confirmText="确认删除"
        cancelText="取消"
        confirmVariant="danger"
        onClose={() => setDeleteBrainstormOpen(false)}
        onConfirm={() => {
          setDeleteBrainstormOpen(false);
          onDeleteSelected();
        }}
      />

      {categoryMenu ? (
        <div
          className={CONTEXT_MENU_CLASS}
          style={{ left: categoryMenu.x, top: categoryMenu.y }}
          onContextMenu={(event) => event.preventDefault()}
        >
          <button type="button" className={CONTEXT_MENU_ITEM_CLASS} onClick={() => openRenameCategory(categoryMenu.id)}>
            重命名分类
          </button>
          <button
            type="button"
            className={`${CONTEXT_MENU_ITEM_CLASS} text-red-500`}
            onClick={() => setDeleteCategoryId(categoryMenu.id)}
          >
            删除分类
          </button>
        </div>
      ) : null}
      {entryMenu ? (
        <div
          className={CONTEXT_MENU_CLASS}
          style={{ left: entryMenu.x, top: entryMenu.y }}
          onContextMenu={(event) => event.preventDefault()}
        >
          <div className="border-b border-[#edf0f3] px-3 py-2 text-xs font-bold text-[#8a95a2]">移动到分类</div>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={CONTEXT_MENU_ITEM_CLASS}
              aria-label={`移动到${category.name}`}
              onClick={() => onMoveEntry(entryMenu.id, category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
