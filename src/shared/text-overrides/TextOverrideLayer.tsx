import { Edit3, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { SHORTCUT_ACTION_EVENT } from '@/shared/shortcuts/shortcutConfig';
import {
  findTextOverrideByVisibleText,
  normalizeTextValue,
  readTextEditMode,
  readTextOverrides,
  setTextEditMode,
  TEXT_EDIT_MODE_EVENT,
  TEXT_OVERRIDE_UPDATED_EVENT,
  upsertTextOverride,
  type TextOverrideItem,
  type TextOverrideUpdatedDetail,
} from '@/shared/text-overrides/textOverrideStore';

type EditingText = {
  original: string;
  replacement: string;
  rect: DOMRect;
  element: HTMLElement;
};

const MAX_CLICK_TEXT_LENGTH = 80;

function isEditableElement(element: HTMLElement | null) {
  if (!element) return true;
  return Boolean(
    element.closest(
      'input,textarea,select,option,[contenteditable="true"],script,style,code,pre,[data-text-override-ignore="true"],[data-no-text-edit="true"]',
    ),
  );
}

function getDirectText(element: HTMLElement) {
  return Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? '')
    .join(' ');
}

function getClickableText(target: HTMLElement) {
  let current: HTMLElement | null = target;
  while (current && current !== document.body) {
    if (isEditableElement(current)) return null;
    const directText = normalizeTextValue(getDirectText(current));
    const text = directText || normalizeTextValue(current.textContent ?? '');
    if (text && text.length <= MAX_CLICK_TEXT_LENGTH) return { text, element: current };
    current = current.parentElement;
  }
  return null;
}

function shouldSkipTextNode(node: Text) {
  const parent = node.parentElement;
  if (!parent) return true;
  if (isEditableElement(parent)) return true;
  if (parent.closest('[data-text-override-layer="true"]')) return true;
  return !normalizeTextValue(node.textContent ?? '');
}

function replaceTextNodeValue(node: Text, replacement: string) {
  const value = node.textContent ?? '';
  if (!value.trim() || value === replacement) return;
  node.textContent = value.replace(value.trim(), replacement);
}

function applyTextToElement(element: HTMLElement, original: string, replacement: string) {
  const normalizedOriginal = normalizeTextValue(original);
  const textNodes = Array.from(element.childNodes).filter((node): node is Text => node.nodeType === Node.TEXT_NODE);
  const targetNode =
    textNodes.find((node) => normalizeTextValue(node.textContent ?? '') === normalizedOriginal) ??
    textNodes.find((node) => normalizeTextValue(node.textContent ?? ''));
  if (targetNode) replaceTextNodeValue(targetNode, replacement);
}

function applyTextOverrides(overrides: TextOverrideItem[], changed?: TextOverrideUpdatedDetail['changed']) {
  const enabled = overrides.filter((item) => item.enabled && item.replacement.trim());
  if (enabled.length === 0) return;

  const byOriginal = new Map(enabled.map((item) => [normalizeTextValue(item.original), item.replacement]));
  if (changed?.previousReplacement) {
    byOriginal.set(normalizeTextValue(changed.previousReplacement), changed.replacement);
  }
  if (changed?.replacement) {
    byOriginal.set(normalizeTextValue(changed.original), changed.replacement);
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return shouldSkipTextNode(node as Text) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  nodes.forEach((node) => {
    const value = node.textContent ?? '';
    const normalized = normalizeTextValue(value);
    const replacement = byOriginal.get(normalized);
    if (!replacement) return;
    replaceTextNodeValue(node, replacement);
  });
}

export function TextOverrideLayer() {
  const [editMode, setEditMode] = useState(readTextEditMode);
  const [editing, setEditing] = useState<EditingText | null>(null);
  const [overrides, setOverrides] = useState<TextOverrideItem[]>(readTextOverrides);
  const applyFrameRef = useRef<number | null>(null);

  const activeOverrides = useMemo(
    () => overrides.filter((item) => item.enabled && item.replacement.trim()),
    [overrides],
  );

  const scheduleApply = (changed?: TextOverrideUpdatedDetail['changed']) => {
    if (applyFrameRef.current !== null) return;
    applyFrameRef.current = window.requestAnimationFrame(() => {
      applyFrameRef.current = null;
      applyTextOverrides(readTextOverrides(), changed);
    });
  };

  useEffect(() => {
    scheduleApply();
    const observer = new MutationObserver(() => scheduleApply());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    const handleUpdated = (event: Event) => {
      const detail = (event as CustomEvent<TextOverrideUpdatedDetail>).detail;
      setOverrides(readTextOverrides());
      applyTextOverrides(readTextOverrides(), detail?.changed);
      scheduleApply(detail?.changed);
    };
    window.addEventListener(TEXT_OVERRIDE_UPDATED_EVENT, handleUpdated);
    return () => {
      observer.disconnect();
      window.removeEventListener(TEXT_OVERRIDE_UPDATED_EVENT, handleUpdated);
      if (applyFrameRef.current !== null) window.cancelAnimationFrame(applyFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const handleEditMode = (event: Event) => {
      const custom = event as CustomEvent<{ enabled?: boolean }>;
      setEditMode(Boolean(custom.detail?.enabled ?? readTextEditMode()));
    };
    window.addEventListener(TEXT_EDIT_MODE_EVENT, handleEditMode);
    return () => window.removeEventListener(TEXT_EDIT_MODE_EVENT, handleEditMode);
  }, []);

  useEffect(() => {
    const handleShortcutAction = (event: Event) => {
      const custom = event as CustomEvent<{ id?: string }>;
      if (custom.detail?.id !== 'toggle_text_edit_mode') return;
      setTextEditMode(!readTextEditMode());
    };
    window.addEventListener(SHORTCUT_ACTION_EVENT, handleShortcutAction);
    return () => window.removeEventListener(SHORTCUT_ACTION_EVENT, handleShortcutAction);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (!readTextEditMode() && !editing) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setEditing(null);
      if (readTextEditMode()) setTextEditMode(false);
    };
    window.addEventListener('keydown', handleEscape, true);
    return () => window.removeEventListener('keydown', handleEscape, true);
  }, [editing]);

  useEffect(() => {
    if (!editMode) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (!target || target.closest('[data-text-override-layer="true"]')) return;
      const result = getClickableText(target);
      if (!result) return;
      event.preventDefault();
      event.stopPropagation();
      const exists = findTextOverrideByVisibleText(result.text);
      setEditing({
        original: exists?.original ?? result.text,
        replacement: exists?.replacement ?? result.text,
        rect: result.element.getBoundingClientRect(),
        element: result.element,
      });
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [editMode]);

  const saveEditing = () => {
    if (!editing) return;
    upsertTextOverride(editing.original, editing.replacement);
    applyTextToElement(editing.element, editing.original, editing.replacement);
    setEditing(null);
  };

  return createPortal(
    <div data-text-override-layer="true">
      {editMode && (
        <div className="pointer-events-none fixed left-1/2 top-16 z-[10080] -translate-x-1/2 rounded-2xl border border-brand/30 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-2xl">
          <span className="text-brand">文案调整已开启</span>
          <span className="ml-3 text-slate-400">点击页面文字修改，同名文案会自动同步</span>
        </div>
      )}
      {editMode && activeOverrides.length > 0 && (
        <div className="pointer-events-none fixed bottom-5 right-5 z-[10080] rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-2xl">
          已启用 {activeOverrides.length} 条文案覆盖
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-[10090] bg-black/20" onClick={() => setEditing(null)}>
          <div
            className="absolute w-[420px] max-w-[92vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            style={{
              left: Math.min(window.innerWidth - 440, Math.max(24, editing.rect.left)),
              top: Math.min(window.innerHeight - 300, Math.max(72, editing.rect.bottom + 10)),
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Edit3 className="h-4 w-4 text-brand" />
                修改文案
              </div>
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">原文案</span>
                <input
                  readOnly
                  value={editing.original}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-500 outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">新文案</span>
                <input
                  value={editing.replacement}
                  onChange={(event) =>
                    setEditing((prev) => (prev ? { ...prev, replacement: event.target.value } : prev))
                  }
                  autoFocus
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-brand"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditing(null)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  onClick={saveEditing}
                  className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
