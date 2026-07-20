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
import type { NewPromptInput, PromptItem } from '@/features/prompts/model/promptTypes';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { ActionButton } from '@/shared/ui/ActionButton';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { RadialCreateButton } from '@/shared/ui/RadialCreateButton';

export const PROMPT_CATEGORY_CONTEXT_MENU_SIZE = { width: 136, height: 48 };
export const PROMPT_CATEGORY_CONTEXT_MENU_PADDING = 8;
export const PROMPT_EXPORT_HEADER = '月下提示词导出 v1';
export const PROMPT_EXPORT_BLOCK_SEPARATOR = '--- 提示词 ---';

export function clampPromptCategoryContextMenu(left: number, top: number, width: number, height: number) {
  return {
    x: Math.max(
      PROMPT_CATEGORY_CONTEXT_MENU_PADDING,
      Math.min(left, width - PROMPT_CATEGORY_CONTEXT_MENU_SIZE.width - PROMPT_CATEGORY_CONTEXT_MENU_PADDING),
    ),
    y: Math.max(
      PROMPT_CATEGORY_CONTEXT_MENU_PADDING,
      Math.min(top, height - PROMPT_CATEGORY_CONTEXT_MENU_SIZE.height - PROMPT_CATEGORY_CONTEXT_MENU_PADDING),
    ),
  };
}

export function getPromptCategoryContextMenuPosition(event: ReactMouseEvent<HTMLButtonElement>) {
  const scaledRoot = document.querySelector('[data-capsule-select-portal-root="true"]') as HTMLElement | null;
  if (!scaledRoot) {
    return clampPromptCategoryContextMenu(event.clientX, event.clientY, window.innerWidth, window.innerHeight);
  }
  const rect = scaledRoot.getBoundingClientRect();
  const scaleX = rect.width / scaledRoot.offsetWidth || 1;
  const scaleY = rect.height / scaledRoot.offsetHeight || 1;
  return clampPromptCategoryContextMenu(
    (event.clientX - rect.left) / scaleX,
    (event.clientY - rect.top) / scaleY,
    scaledRoot.offsetWidth,
    scaledRoot.offsetHeight,
  );
}

export function sanitizePromptExportFileName(fileName: string) {
  return fileName.replace(/[\\/:*?"<>|]/g, '_').trim() || '提示词导出';
}

export function downloadPromptTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildPromptExportText(items: PromptItem[]) {
  const lines = [PROMPT_EXPORT_HEADER, `导出时间: ${new Date().toLocaleString('zh-CN')}`, `数量: ${items.length}`, ''];
  items.forEach((item, index) => {
    lines.push(
      PROMPT_EXPORT_BLOCK_SEPARATOR,
      `序号: ${index + 1}`,
      `名称: ${item.name}`,
      '类型: novel',
      `分类: ${item.category}`,
      `二级分类: ${item.subCategory ?? ''}`,
      '说明:',
      item.description,
      '内容:',
      item.content,
      '',
    );
  });
  return lines.join('\n');
}

export function getPromptExportField(block: string, label: string) {
  const match = block.match(new RegExp(`^${label}:\\s*(.*)$`, 'm'));
  return match?.[1]?.trim() ?? '';
}

export function getPromptExportSection(block: string, label: string, nextLabel?: string) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedNextLabel = nextLabel?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = escapedNextLabel
    ? new RegExp(`^${escapedLabel}:\\s*\\n([\\s\\S]*?)(?=^${escapedNextLabel}:\\s*$)`, 'm')
    : new RegExp(`^${escapedLabel}:\\s*\\n([\\s\\S]*)`, 'm');
  return pattern.exec(block)?.[1]?.trim() ?? '';
}

export function parsePromptExportText(
  rawText: string,
  fallbackName: string,
  fallbackCategory: string,
): NewPromptInput[] {
  const text = rawText.replace(/\r\n/g, '\n').trim();
  if (!text) return [];
  if (!text.includes(PROMPT_EXPORT_BLOCK_SEPARATOR)) {
    const firstLine = text
      .split('\n')
      .find((line) => line.trim())
      ?.trim();
    return [
      {
        name: firstLine?.slice(0, 36) || fallbackName.replace(/\.[^.]+$/, '') || '导入提示词',
        description: `从 ${fallbackName} 导入`,
        content: text,
        category: fallbackCategory,
        promptType: 'novel',
      },
    ];
  }
  return text
    .split(PROMPT_EXPORT_BLOCK_SEPARATOR)
    .slice(1)
    .map((block) => {
      return {
        name: getPromptExportField(block, '名称'),
        description: getPromptExportSection(block, '说明', '内容'),
        content: getPromptExportSection(block, '内容'),
        category: getPromptExportField(block, '分类') || fallbackCategory,
        subCategory: getPromptExportField(block, '二级分类') || undefined,
        promptType: 'novel',
      } satisfies NewPromptInput;
    })
    .filter((item) => item.name.trim() && item.content.trim());
}

export function PromptEditorModal({
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
  onSave: (draft: {
    name: string;
    description: string;
    content: string;
    category: string;
    subCategory?: string;
  }) => void;
}) {
  useTopModalEscape(isOpen, onClose);
  const fallbackCategory =
    defaultCategory && categories.includes(defaultCategory) ? defaultCategory : (categories[0] ?? '未分类');
  const [draft, setDraft] = useState({
    name: '',
    description: '',
    content: '',
    category: fallbackCategory,
    subCategory: normalizePromptSubcategory(fallbackCategory),
  });

  useEffect(() => {
    if (!isOpen) return;
    setDraft({
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      content: initial?.content ?? '',
      category: initial?.category ?? fallbackCategory,
      subCategory: normalizePromptSubcategory(initial?.category ?? fallbackCategory, initial?.subCategory),
    });
  }, [fallbackCategory, initial, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-sharp fixed inset-0 z-[290] flex items-center justify-center bg-transparent p-6">
      <div
        className="modal-sharp flex h-full max-h-[calc(100dvh-48px)] w-[980px] max-w-[94vw] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-8 py-2">
          <h2 className="text-[18px] font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:border-[#08AACE]/50 hover:bg-[#EAF9FD] hover:text-[#078fb0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE4F2]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)] gap-6 px-8 py-7">
          <div className="min-h-0 space-y-5 overflow-y-auto pt-3 pr-1">
            <div className="xy-floating-field xy-floating-compact xy-has-value text-sm font-bold text-slate-600">
              <input
                value={draft.name}
                onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="提示词名称"
                className="font-medium text-slate-700"
              />
              <label>提示词名称</label>
            </div>
            <div className="xy-floating-field xy-floating-compact xy-has-value text-sm font-bold text-slate-600">
              <textarea
                value={draft.description}
                onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="提示词说明"
                rows={3}
                className="h-20 font-medium leading-5 text-slate-700"
              />
              <label>提示词说明</label>
            </div>
            <div>
              <label className="mb-3 block text-sm font-medium text-slate-600">分类</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        category,
                        subCategory: normalizePromptSubcategory(category, prev.subCategory),
                      }))
                    }
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
            {normalizePromptCategoryName(draft.category) === AUDIT_PROMPT_CATEGORY ? (
              <div>
                <label className="mb-3 block text-sm font-medium text-slate-600">审核二级分类</label>
                <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-cyan-100 bg-white">
                  {AUDIT_PROMPT_SUBCATEGORIES.map((subCategory) => (
                    <button
                      key={subCategory}
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, subCategory }))}
                      className={`h-10 text-sm font-bold transition-colors ${
                        normalizePromptSubcategory(draft.category, draft.subCategory) === subCategory
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
          </div>

          <div
            className={`xy-floating-field xy-floating-compact xy-floating-fill flex min-h-0 flex-col ${draft.content.trim() ? 'xy-has-value' : ''}`}
          >
            <textarea
              value={draft.content}
              onChange={(event) => setDraft((prev) => ({ ...prev, content: event.target.value }))}
              placeholder="提示词内容"
              rows={18}
              className="xy-prompt-content-editor min-h-0 flex-1 font-sans text-[19px] font-medium leading-8 tracking-normal text-slate-950"
            />
            <label>提示词内容</label>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-8 py-5">
          <ActionButton onClick={onClose} variant="secondary">
            取消
          </ActionButton>
          <ActionButton onClick={() => onSave(draft)} disabled={!draft.name.trim() || !draft.content.trim()}>
            {initial ? '保存修改' : '创建提示词'}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

export function PromptRecycleModal({
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
      <div
        className="modal-sharp flex h-[560px] w-[680px] max-w-[94vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">回收站</h2>
            <p className="mt-1 text-xs text-slate-400">可恢复误删提示词，彻底删除后无法找回。</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:border-[#08AACE]/50 hover:bg-[#EAF9FD] hover:text-[#078fb0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE4F2]"
          >
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
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-500">
                          {item.category}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-400">{item.description || '暂无说明'}</p>
                      <p className="mt-1 text-[10px] text-slate-300">
                        删除于 {item.deletedAt ? new Date(item.deletedAt).toLocaleString('zh-CN') : '-'}
                      </p>
                    </div>
                    <div className="xy-capsule-group shrink-0">
                      <button onClick={() => onRestore(item.id)} className="xy-capsule-button">
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
