import { Lock, Search, Sparkles, Trash2, Unlock, X } from 'lucide-react';
import { type ChangeEvent, type MouseEvent as ReactMouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  AUDIT_PROMPT_CATEGORY,
  AUDIT_PROMPT_SUBCATEGORIES,
  DEFAULT_AUDIT_PROMPT_SUBCATEGORY,
  isDefaultPromptCategory,
  normalizePromptCategoryName,
  normalizePromptSubcategory,
  usePrompts,
} from '@/features/prompts/hooks/usePrompts';
import { PromptCategoryCreateModal } from '@/features/prompts/components/PromptCategoryCreateModal';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { ActionButton } from '@/shared/ui/ActionButton';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { RadialCreateButton } from '@/shared/ui/RadialCreateButton';

import {
  PROMPT_CATEGORY_CONTEXT_MENU_SIZE,
  PROMPT_CATEGORY_CONTEXT_MENU_PADDING,
  PROMPT_EXPORT_HEADER,
  PROMPT_EXPORT_BLOCK_SEPARATOR,
  clampPromptCategoryContextMenu,
  getPromptCategoryContextMenuPosition,
  sanitizePromptExportFileName,
  downloadPromptTextFile,
  buildPromptExportText,
  getPromptExportField,
  getPromptExportSection,
  parsePromptExportText,
  PromptEditorModal,
  PromptRecycleModal,
} from '@/features/prompts/components/PromptPageParts';

export function PromptsPage({ initialCategory }: { initialCategory?: string } = {}) {
  const [searchParams] = useSearchParams();
  const {
    prompts,
    recycleBin,
    categories,
    addPrompt,
    updatePrompt,
    deletePrompt,
    restorePrompt,
    permanentDelete,
    togglePin,
    toggleLock,
    addCategory,
    addPrompts,
    removeCategory,
  } = usePrompts();
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeAuditSubcategory, setActiveAuditSubcategory] = useState(DEFAULT_AUDIT_PROMPT_SUBCATEGORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<PromptItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryCreate, setShowCategoryCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PromptItem | null>(null);
  const [showRecycle, setShowRecycle] = useState(false);
  const [categoryContextMenu, setCategoryContextMenu] = useState<{ category: string; x: number; y: number } | null>(
    null,
  );
  const [categoryDeleteTarget, setCategoryDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    const rawCategory = initialCategory ?? searchParams.get('category');
    const category = rawCategory ? normalizePromptCategoryName(rawCategory) : null;
    if (category && categories.includes(category)) {
      setActiveCategory(category);
    }
  }, [categories, initialCategory, searchParams]);

  useEffect(() => {
    if (!categoryContextMenu) return undefined;
    const closeCategoryContextMenu = () => setCategoryContextMenu(null);
    window.addEventListener('click', closeCategoryContextMenu);
    window.addEventListener('scroll', closeCategoryContextMenu, true);
    return () => {
      window.removeEventListener('click', closeCategoryContextMenu);
      window.removeEventListener('scroll', closeCategoryContextMenu, true);
    };
  }, [categoryContextMenu]);

  const filteredPrompts = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return prompts
      .filter((item) => {
        const matchCategory = !activeCategory || item.category === activeCategory;
        const matchSubcategory =
          activeCategory !== AUDIT_PROMPT_CATEGORY ||
          normalizePromptSubcategory(item.category, item.subCategory) === activeAuditSubcategory;
        const matchKeyword =
          !keyword ||
          item.name.toLowerCase().includes(keyword) ||
          item.description.toLowerCase().includes(keyword) ||
          item.content.toLowerCase().includes(keyword);
        return matchCategory && matchSubcategory && matchKeyword;
      })
      .sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
        if (a.isFavorite && b.isFavorite) {
          return (a.pinnedAt ?? a.updatedAt).localeCompare(b.pinnedAt ?? b.updatedAt);
        }
        return 0;
      });
  }, [activeAuditSubcategory, activeCategory, prompts, searchQuery]);

  const openCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const openEdit = (item: PromptItem) => {
    if (item.isLocked) return;
    setEditingItem(item);
    setShowForm(true);
  };

  const savePrompt = (draft: {
    name: string;
    description: string;
    content: string;
    category: string;
    subCategory?: string;
  }) => {
    if (editingItem) updatePrompt(editingItem.id, draft);
    else addPrompt({ ...draft, promptType: 'novel' });
    setActiveCategory(draft.category);
    if (normalizePromptCategoryName(draft.category) === AUDIT_PROMPT_CATEGORY) {
      setActiveAuditSubcategory(
        normalizePromptSubcategory(draft.category, draft.subCategory) ?? DEFAULT_AUDIT_PROMPT_SUBCATEGORY,
      );
    }
    setSearchQuery('');
    setShowForm(false);
    setEditingItem(null);
  };

  const createCategory = (name: string) => {
    const category = normalizePromptCategoryName(name);
    if (!category) return;
    addCategory(category);
    setActiveCategory(category);
    setShowCategoryCreate(false);
  };

  const openCategoryContextMenu = (event: ReactMouseEvent<HTMLButtonElement>, category: string) => {
    event.preventDefault();
    if (isDefaultPromptCategory(category)) {
      setCategoryContextMenu(null);
      return;
    }
    setCategoryContextMenu({ category, ...getPromptCategoryContextMenuPosition(event) });
  };

  const confirmCategoryDelete = () => {
    if (!categoryDeleteTarget || isDefaultPromptCategory(categoryDeleteTarget)) {
      setCategoryDeleteTarget(null);
      return;
    }
    removeCategory(categoryDeleteTarget);
    if (activeCategory === categoryDeleteTarget) {
      setActiveCategory(null);
    }
    setCategoryDeleteTarget(null);
  };

  const exportPrompts = () => {
    if (prompts.length === 0) {
      window.alert('暂无可导出的提示词。');
      return;
    }
    const fileName = sanitizePromptExportFileName(`提示词导出-${new Date().toISOString().slice(0, 10)}.txt`);
    downloadPromptTextFile(fileName, buildPromptExportText(prompts));
  };

  const importPrompts = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const imported = parsePromptExportText(
        await file.text(),
        file.name,
        activeCategory ?? categories[0] ?? '未分类',
      );
      const created = addPrompts(imported);
      if (created.length === 0) {
        window.alert('没有识别到可导入的提示词。');
        return;
      }
      setActiveCategory(created[0]?.category ?? activeCategory);
      setSearchQuery('');
      window.alert(`已导入 ${created.length} 个提示词。`);
    } catch (error) {
      console.error('Import prompts failed:', error);
      window.alert('导入提示词失败，请确认文件为 txt 文本。');
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-slate-900">小说提示词</h1>
            <span className="text-sm font-bold text-slate-400">{prompts.length}</span>
          </div>

          <div className="flex min-w-0 shrink-0 flex-nowrap items-center justify-end gap-2">
            <input
              ref={importInputRef}
              type="file"
              accept=".txt,text/plain"
              className="hidden"
              onChange={importPrompts}
            />
            <ActionButton onClick={() => importInputRef.current?.click()} variant="secondary">
              导入提示词
            </ActionButton>
            <ActionButton onClick={exportPrompts} variant="secondary">
              导出提示词
            </ActionButton>
            <ActionButton onClick={() => setShowRecycle(true)} variant="secondary">
              回收站{recycleBin.length > 0 ? `(${recycleBin.length})` : ''}
            </ActionButton>
            <div className="shrink-0">
              <div className="xy-ui132-search">
                <Search />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="搜索提示词..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="xy-category-capsules min-w-0 flex-1">
            <button
              onClick={() => setActiveCategory(null)}
              className={`xy-category-capsule ${activeCategory === null ? 'xy-active' : ''}`}
            >
              全部
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                onContextMenu={(event) => openCategoryContextMenu(event, category)}
                className={`xy-category-capsule ${activeCategory === category ? 'xy-active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>
          <ActionButton onClick={() => setShowCategoryCreate(true)}>新增分类</ActionButton>
        </div>

        {categoryContextMenu ? (
          <div
            className="fixed z-[260] min-w-[136px] rounded-lg border border-slate-200 bg-white p-1 shadow-[0_12px_32px_rgba(15,23,42,0.16)]"
            style={{ left: categoryContextMenu.x, top: categoryContextMenu.y }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setCategoryDeleteTarget(categoryContextMenu.category);
                setCategoryContextMenu(null);
              }}
              className="flex h-9 w-full items-center rounded-md px-3 text-left text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
            >
              删除该分类
            </button>
          </div>
        ) : null}

        {activeCategory === AUDIT_PROMPT_CATEGORY ? (
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm font-bold text-slate-400">审核二级分类</span>
            <div className="grid w-[260px] grid-cols-2 overflow-hidden rounded-2xl border border-cyan-100 bg-white">
              {AUDIT_PROMPT_SUBCATEGORIES.map((subCategory) => (
                <button
                  key={subCategory}
                  type="button"
                  onClick={() => setActiveAuditSubcategory(subCategory)}
                  className={`h-9 text-sm font-bold transition-colors ${
                    activeAuditSubcategory === subCategory
                      ? 'bg-[#EAF9FD] text-[#078fb0]'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {subCategory}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-4">
          {filteredPrompts.length === 0 && (
            <div className="flex h-[247px] w-[255px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white">
              <Sparkles className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-400">暂无提示词</p>
            </div>
          )}
          {filteredPrompts.map((prompt) => (
            <article
              key={prompt.id}
              className="flex h-[247px] w-[255px] flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[17px] font-bold text-slate-900">{prompt.name}</h2>
                  <div className="mt-2 flex flex-col items-start gap-1">
                    <span className="rounded-xl border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-500">
                      {prompt.category}
                    </span>
                    {prompt.category === AUDIT_PROMPT_CATEGORY ? (
                      <span className="rounded-xl border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-xs text-cyan-600">
                        {normalizePromptSubcategory(prompt.category, prompt.subCategory)}
                      </span>
                    ) : null}
                  </div>
                </div>
                <button
                  onClick={() => toggleLock(prompt.id)}
                  className={`grid h-8 w-8 place-items-center rounded-md border border-slate-200 bg-white transition-colors hover:border-[#08AACE]/50 hover:bg-[#EAF9FD] hover:text-[#078fb0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE4F2] ${
                    prompt.isLocked ? 'text-orange-500' : 'text-slate-400'
                  }`}
                >
                  {prompt.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </button>
              </div>

              <div className="mt-2 line-clamp-3 text-[13px] leading-6 text-slate-500">
                {prompt.description || '暂无说明'}
              </div>

              <div className="mt-auto">
                <p className="mb-2 text-left text-[13px] font-medium text-blue-500">{prompt.content.length} 字</p>
                <div className="xy-capsule-group w-full">
                  <button
                    onClick={() => togglePin(prompt.id)}
                    className={`xy-capsule-button flex-1 ${prompt.isFavorite ? 'xy-active' : ''}`}
                  >
                    置顶
                  </button>
                  <button
                    onClick={() => openEdit(prompt)}
                    disabled={prompt.isLocked}
                    className="xy-capsule-button flex-1"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => {
                      if (!prompt.isLocked) setDeleteTarget(prompt);
                    }}
                    disabled={prompt.isLocked}
                    className={`xy-capsule-button flex-1 ${prompt.isLocked ? '' : 'xy-danger'}`}
                  >
                    删除
                  </button>
                </div>
              </div>
            </article>
          ))}
          <button
            onClick={openCreate}
            className="xy-radial-create-card flex h-[247px] w-[255px] flex-col items-center justify-center rounded-xl border border-dashed border-[#08AACE]/50 bg-white text-[#08AACE] transition-colors hover:border-[#08AACE] hover:bg-[#E7F8FD]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE4F2]"
          >
            <RadialCreateButton label="创建提示词" />
          </button>
        </div>
      </div>

      <PromptEditorModal
        isOpen={showForm}
        title={editingItem ? '编辑提示词' : '创建提示词'}
        categories={categories}
        defaultCategory={activeCategory}
        initial={editingItem}
        onClose={() => {
          setShowForm(false);
          setEditingItem(null);
        }}
        onSave={savePrompt}
      />

      <PromptCategoryCreateModal
        isOpen={showCategoryCreate}
        onClose={() => setShowCategoryCreate(false)}
        onConfirm={createCategory}
      />

      <PromptRecycleModal
        isOpen={showRecycle}
        items={recycleBin}
        onClose={() => setShowRecycle(false)}
        onRestore={restorePrompt}
        onPermanentDelete={permanentDelete}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="确认删除"
        description={`确定要删除提示词「${deleteTarget?.name ?? ''}」吗？\n删除后将移入回收站，可在回收站中恢复。`}
        confirmText="确认删除"
        confirmVariant="danger"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deletePrompt(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />

      <ConfirmDialog
        isOpen={!!categoryDeleteTarget}
        title="确认删除分类"
        description={`确定要删除分类“${categoryDeleteTarget ?? ''}”吗？\n删除后，该分类下的提示词会移动到“未分类”。默认分类无法删除。`}
        confirmText="删除该分类"
        confirmVariant="danger"
        onClose={() => setCategoryDeleteTarget(null)}
        onConfirm={confirmCategoryDelete}
      />
    </div>
  );
}
