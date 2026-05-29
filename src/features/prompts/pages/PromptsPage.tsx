import { BookOpen, Lock, RefreshCw, Search, Sparkles, Trash2, Unlock, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { isDefaultPromptCategory, normalizePromptCategoryName, usePrompts } from '@/features/prompts/hooks/usePrompts';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { RadialCreateButton } from '@/shared/ui/RadialCreateButton';

type PromptTab = 'novel' | 'script' | 'default';

const TAB_LABELS: Record<PromptTab, string> = {
  novel: '小说提示词',
  script: '剧本提示词',
  default: '默认提示词',
};

function PromptEditorModal({
  isOpen,
  title,
  categories,
  defaultCategory,
  initial,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  title: string;
  categories: string[];
  defaultCategory?: string | null;
  initial?: PromptItem | null;
  onClose: () => void;
  onSave: (draft: { name: string; description: string; content: string; category: string }) => void;
}) {
  useTopModalEscape(isOpen, onClose);
  const fallbackCategory = defaultCategory && categories.includes(defaultCategory) ? defaultCategory : categories[0] ?? '未分类';
  const [draft, setDraft] = useState({
    name: '',
    description: '',
    content: '',
    category: fallbackCategory,
  });

  useEffect(() => {
    if (!isOpen) return;
    setDraft({
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      content: initial?.content ?? '',
      category: initial?.category ?? fallbackCategory,
    });
  }, [fallbackCategory, initial, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-sharp fixed inset-0 z-[260] flex items-center justify-center bg-black/40">
      <div
        className="modal-sharp w-[980px] max-w-[94vw] rounded-[28px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
          <h2 className="text-[18px] font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-[360px_minmax(0,1fr)] gap-6 px-8 py-7">
          <div className="space-y-5">
            <div className={`xy-floating-field ${draft.name.trim() ? 'xy-has-value' : ''}`}>
              <input
                value={draft.name}
                onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="提示词名称"
              />
              <label>提示词名称</label>
            </div>
            <div className={`xy-floating-field ${draft.description.trim() ? 'xy-has-value' : ''}`}>
              <textarea
                value={draft.description}
                onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="提示词说明"
                rows={4}
              />
              <label>提示词说明</label>
            </div>
            <div>
              <label className="mb-3 block text-sm font-medium text-slate-600">分类</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setDraft((prev) => ({ ...prev, category }))}
                    className={`rounded-2xl border px-4 py-2 text-sm transition-colors ${
                      draft.category === category
                        ? 'border-brand bg-brand-light text-brand'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`xy-floating-field xy-floating-compact xy-floating-fill ${draft.content.trim() ? 'xy-has-value' : ''}`}>
            <textarea
              value={draft.content}
              onChange={(event) => setDraft((prev) => ({ ...prev, content: event.target.value }))}
              placeholder="提示词内容"
              rows={18}
              className="h-[440px] font-mono"
            />
            <label>提示词内容</label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-slate-100 bg-slate-50/60 px-8 py-5">
          <button onClick={onClose} className="rounded-2xl border border-slate-200 px-6 py-3 text-base text-slate-600 hover:bg-white">
            取消
          </button>
          <button
            onClick={() => onSave(draft)}
            disabled={!draft.name.trim() || !draft.content.trim()}
            className="rounded-2xl bg-brand px-7 py-3 text-base text-white transition-colors hover:bg-brand-dark disabled:bg-slate-300"
          >
            {initial ? '保存修改' : '创建提示词'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PromptRecycleModal({
  isOpen,
  items,
  onClose,
  onRestore,
  onPermanentDelete,
}: {
  isOpen: boolean;
  items: PromptItem[];
  onClose: () => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  useTopModalEscape(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <div className="modal-sharp fixed inset-0 z-[270] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="modal-sharp flex h-[560px] w-[680px] max-w-[94vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">回收站</h2>
            <p className="mt-1 text-xs text-slate-400">可恢复误删提示词，彻底删除后无法找回。</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-slate-400">
              <Trash2 className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm">回收站为空</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-bold text-slate-900">{item.name}</h3>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{TAB_LABELS[item.promptType ?? 'novel']}</span>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-500">{item.category}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-400">{item.description || '暂无说明'}</p>
                      <p className="mt-1 text-[10px] text-slate-300">删除于 {item.deletedAt ? new Date(item.deletedAt).toLocaleString('zh-CN') : '-'}</p>
                    </div>
                    <div className="xy-capsule-group shrink-0">
                      <button onClick={() => onRestore(item.id)} className="xy-capsule-button">
                        <RefreshCw className="h-3 w-3" />
                        恢复
                      </button>
                      <button
                        onClick={() => {
                          if (confirmId === item.id) {
                            onPermanentDelete(item.id);
                            setConfirmId(null);
                          } else {
                            setConfirmId(item.id);
                          }
                        }}
                        className="xy-capsule-button xy-danger"
                      >
                        {confirmId === item.id ? '确认删除' : '彻底删除'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
    removeCategory,
  } = usePrompts();
  const [activeTab, setActiveTab] = useState<PromptTab>('novel');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<PromptItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<PromptItem | null>(null);
  const [showRecycle, setShowRecycle] = useState(false);
  const [categoryDeleteMode, setCategoryDeleteMode] = useState(false);

  useEffect(() => {
    const rawCategory = initialCategory ?? searchParams.get('category');
    const category = rawCategory ? normalizePromptCategoryName(rawCategory) : null;
    if (category && categories.includes(category)) {
      setActiveCategory(category);
    }
  }, [categories, initialCategory, searchParams]);

  const filteredPrompts = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return prompts.filter((item) => {
      const matchType = (item.promptType ?? 'novel') === activeTab;
      const matchCategory = !activeCategory || item.category === activeCategory;
      const matchKeyword =
        !keyword
        || item.name.toLowerCase().includes(keyword)
        || item.description.toLowerCase().includes(keyword)
        || item.content.toLowerCase().includes(keyword);
      return matchType && matchCategory && matchKeyword;
    }).sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      if (a.isFavorite && b.isFavorite) {
        return (a.pinnedAt ?? a.updatedAt).localeCompare(b.pinnedAt ?? b.updatedAt);
      }
      return 0;
    });
  }, [activeCategory, activeTab, prompts, searchQuery]);

  const openCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const openEdit = (item: PromptItem) => {
    if (item.isLocked) return;
    setEditingItem(item);
    setShowForm(true);
  };

  const savePrompt = (draft: { name: string; description: string; content: string; category: string }) => {
    if (editingItem) updatePrompt(editingItem.id, draft);
    else addPrompt({ ...draft, promptType: activeTab });
    setActiveCategory(draft.category);
    setSearchQuery('');
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="flex-1 overflow-y-auto px-7 py-7">
        <div className="mb-6 flex items-center justify-between gap-5">
          <div className="xy-radio-inputs">
            {(Object.keys(TAB_LABELS) as PromptTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`xy-radio-option ${activeTab === tab ? 'xy-active' : ''}`}
              >
                {TAB_LABELS[tab]} <span className="ml-1 text-sm opacity-70">{prompts.filter((item) => (item.promptType ?? 'novel') === tab).length}</span>
              </button>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={() => setShowRecycle(true)}
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-2xl border border-brand/30 bg-white px-5 text-base font-bold text-brand transition-colors hover:bg-brand-light"
            >
              回收站{recycleBin.length > 0 ? `(${recycleBin.length})` : ''}
            </button>
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

        <div className="mb-7 flex flex-wrap items-center gap-3">
          <div className="xy-category-capsules min-w-0">
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
              className={`xy-category-capsule ${activeCategory === category ? 'xy-active' : ''}`}
            >
              {category}
              {categoryDeleteMode && !isDefaultPromptCategory(category) && (
                <span
                  onClick={(event) => {
                    event.stopPropagation();
                    removeCategory(category);
                    setActiveCategory(null);
                  }}
                  className="xy-category-capsule-delete"
                >
                  ×
                </span>
              )}
            </button>
          ))}
          </div>
          <div className="flex items-center gap-1.5">
            <input
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder="新增分类"
              className="w-[120px] rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-brand"
            />
            <div className="xy-capsule-group">
              <button
                onClick={() => {
                  addCategory(newCategory);
                  setNewCategory('');
                }}
                className="xy-capsule-button"
              >
                新增分类
              </button>
              <button
                onClick={() => setCategoryDeleteMode((prev) => !prev)}
                className={`xy-capsule-button xy-danger ${categoryDeleteMode ? 'xy-active' : ''}`}
              >
                {categoryDeleteMode ? '退出删除' : '删除分类'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {filteredPrompts.length === 0 && (
            <div className="flex h-[247px] w-[255px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white">
              <Sparkles className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-400">暂无提示词</p>
            </div>
          )}
          {filteredPrompts.map((prompt) => (
              <article
                key={prompt.id}
                className="flex h-[247px] w-[255px] flex-col rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-[17px] font-bold text-slate-900">{prompt.name}</h2>
                      <span className="rounded-xl border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-500">{prompt.category}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleLock(prompt.id)}
                    className={`rounded-lg p-1.5 transition-colors ${
                      prompt.isLocked
                        ? 'text-orange-500 hover:bg-orange-50 hover:text-orange-600'
                        : 'text-slate-300 hover:bg-slate-50 hover:text-slate-500'
                    }`}
                  >
                    {prompt.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </button>
                </div>

                <div className="mt-2 line-clamp-4 text-[13px] leading-6 text-slate-500">{prompt.description || '暂无说明'}</div>

                <div className="mt-auto">
                  <p className="mb-2 text-left text-[13px] font-medium text-blue-500">{prompt.content.length} 字</p>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => togglePin(prompt.id)}
                      className={`rounded-lg py-1.5 text-xs font-medium text-white transition-colors ${
                        prompt.isFavorite ? 'bg-orange-500 hover:bg-orange-600' : 'bg-brand hover:bg-brand-dark'
                      }`}
                    >
                      置顶
                    </button>
                    <button
                      onClick={() => openEdit(prompt)}
                      disabled={prompt.isLocked}
                      className="rounded-lg bg-brand py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-dark disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => {
                        if (!prompt.isLocked) setDeleteTarget(prompt);
                      }}
                      disabled={prompt.isLocked}
                      className={`rounded-lg py-1.5 text-xs font-medium transition-colors ${
                        prompt.isLocked
                          ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </article>
          ))}
          <button
            onClick={openCreate}
            className="xy-radial-create-card flex h-[247px] w-[255px] flex-col items-center justify-center rounded-[24px] border border-dashed border-blue-400 bg-white text-blue-600 transition-colors hover:border-blue-500 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
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
    </div>
  );
}
